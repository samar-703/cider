import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  Video,
  VideoOff,
  Send,
  SkipForward,
  Power,
  Menu,
  User,
  Palette,
  UserCircle,
  Settings,
  X,
} from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Particles from "./Particles";
import LandingPage from "./LandingPage";
import Navbar from "./Navbar";

const SOCKET_URL = "https://cider-j4xo.onrender.com";

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },

    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
  iceCandidatePoolSize: 10,
};

function Cider() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [partnerId, setPartnerId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const isNegotiatingRef = useRef(false);
  const makingOfferRef = useRef(false);
  const typingTimeoutRef = useRef(null);

  // Cleanup function for peer connection
  const cleanupPeerConnection = useCallback(() => {
    console.log("🧹 Cleaning up peer connection");

    if (peerConnectionRef.current) {
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.oniceconnectionstatechange = null;
      peerConnectionRef.current.onconnectionstatechange = null;
      peerConnectionRef.current.onnegotiationneeded = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    iceCandidateQueueRef.current = [];
    isNegotiatingRef.current = false;
    makingOfferRef.current = false;
  }, []);

  // Create peer connection with all handlers
  const createPeerConnection = useCallback((socketInstance) => {
    console.log("🔧 Creating new peer connection");

    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    // Handle incoming tracks from remote peer
    pc.ontrack = (event) => {
      console.log("🎥 ontrack fired!", event.track.kind);
      console.log("   Streams count:", event.streams?.length);

      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        console.log("   ✅ Setting remote video srcObject");
        remoteVideoRef.current.srcObject = event.streams[0];

        // Force play
        remoteVideoRef.current.play().catch((err) => {
          console.log("   ⚠️ Play error (usually ok):", err.message);
        });
      }
    };

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("🧊 Sending ICE candidate");
        socketInstance.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      console.log("📡 Connection state:", pc.connectionState);
      if (pc.connectionState === "failed") {
        console.log("❌ Connection failed, may need to restart");
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log("🧊 ICE connection state:", pc.iceConnectionState);
      if (pc.iceConnectionState === "failed") {
        console.log("❌ ICE failed, attempting restart");
        pc.restartIce();
      }
    };

    pc.onsignalingstatechange = () => {
      console.log("📶 Signaling state:", pc.signalingState);
      isNegotiatingRef.current = pc.signalingState !== "stable";
    };

    // Add local tracks to peer connection
    if (localStreamRef.current) {
      const tracks = localStreamRef.current.getTracks();
      console.log(
        "➕ Adding local tracks to peer connection:",
        tracks.map((t) => `${t.kind} (${t.id.slice(0, 8)})`)
      );
      tracks.forEach((track) => {
        const sender = pc.addTrack(track, localStreamRef.current);
        console.log(
          `   ✅ Added ${track.kind} track, sender:`,
          sender ? "OK" : "FAILED"
        );
      });
    } else {
      console.error("❌ No local stream available to add tracks!");
    }

    return pc;
  }, []);

  // Get user media
  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      console.log("📹 Requesting camera/microphone access");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      console.log(
        "✅ Got local stream with tracks:",
        stream.getTracks().map((t) => t.kind)
      );
      return stream;
    } catch (err) {
      console.error("❌ Failed to get local stream:", err);
      setMessages((prev) => [
        ...prev,
        { text: "Camera/microphone access denied", type: "system" },
      ]);
      throw err;
    }
  }, []);

  // Process queued ICE candidates
  const processIceCandidateQueue = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) return;

    console.log(
      `🧊 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`
    );

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
        console.log("   ✅ Added queued ICE candidate");
      } catch (e) {
        console.error("   ❌ Failed to add ICE candidate:", e);
      }
    }
  }, []);

  // Handle partner disconnect
  const handlePartnerDisconnect = useCallback(() => {
    console.log("👋 Partner disconnected");
    setStatus("disconnected");
    setPartnerId(null);
    setPartnerTyping(false);
    setMessages((prev) => [
      ...prev,
      { text: "Stranger disconnected", type: "system" },
    ]);
    cleanupPeerConnection();
  }, [cleanupPeerConnection]);

  // Initialize socket connection
  useEffect(() => {
    console.log("🔌 Initializing socket connection");
    const newSocket = io(SOCKET_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to signaling server");
    });

    newSocket.on("waiting", () => {
      console.log("⏳ Waiting for partner");
      setStatus("waiting");
      setMessages((prev) => [
        ...prev,
        { text: "Looking for a stranger...", type: "system" },
      ]);
    });

    newSocket.on("partner-found", async ({ partnerId: pid, isOfferer }) => {
      console.log(
        `🎯 Partner found! I am ${isOfferer ? "OFFERER" : "ANSWERER"}`
      );
      setStatus("connected");
      setPartnerId(pid);
      setMessages((prev) => [
        ...prev,
        { text: "Stranger connected!", type: "system" },
      ]);

      try {
        // BOTH offerer and answerer need to set up their peer connection
        // Ensure we have local stream (should already exist from startChat, but check anyway)
        if (!localStreamRef.current) {
          console.log("📹 Getting local media stream");
          await getLocalStream();
        } else {
          console.log("✅ Local stream already available");
        }

        console.log("🔧 Creating peer connection with local tracks");
        const pc = createPeerConnection(newSocket);

        // Only the offerer creates and sends the offer
        if (isOfferer) {
          console.log("📤 I am OFFERER - creating and sending offer");
          console.log("📊 My senders before offer:", pc.getSenders().length);
          makingOfferRef.current = true;

          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });

          await pc.setLocalDescription(offer);
          console.log("📤 Sending offer to answerer");
          console.log("📊 Offer SDP includes:", {
            audio: offer.sdp.includes("m=audio"),
            video: offer.sdp.includes("m=video"),
          });
          newSocket.emit("offer", { offer: pc.localDescription });

          makingOfferRef.current = false;
        } else {
          console.log("📥 I am ANSWERER - waiting for offer from offerer");
        }
      } catch (err) {
        console.error("❌ Error in partner-found handler:", err);
      }
    });

    newSocket.on("offer", async ({ offer, from }) => {
      console.log("📥 Received offer from:", from);
      console.log("📊 Offer SDP includes:", {
        audio: offer.sdp?.includes("m=audio"),
        video: offer.sdp?.includes("m=video"),
      });

      try {
        const pc = peerConnectionRef.current;

        if (!pc) {
          console.error(
            "❌ No peer connection exists! This should not happen."
          );
          console.log("⚠️ Creating emergency peer connection");
          await getLocalStream();
          createPeerConnection(newSocket);
        }

        const currentPc = peerConnectionRef.current;

        console.log(`Peer connection state: ${currentPc.signalingState}`);
        console.log(`Local tracks (senders): ${currentPc.getSenders().length}`);
        console.log(
          `Senders details:`,
          currentPc.getSenders().map((s) => s.track?.kind)
        );

        // Handle glare (both sides trying to negotiate)
        const offerCollision =
          makingOfferRef.current || currentPc.signalingState !== "stable";

        if (offerCollision) {
          console.log(
            "Offer collision detected, ignoring (I should be answerer)"
          );
          return;
        }

        console.log("Setting remote description (offer)");
        await currentPc.setRemoteDescription(new RTCSessionDescription(offer));

        // Process any queued ICE candidates
        await processIceCandidateQueue();

        console.log("Creating answer");
        const answer = await currentPc.createAnswer();
        console.log("Answer SDP includes:", {
          audio: answer.sdp.includes("m=audio"),
          video: answer.sdp.includes("m=video"),
        });
        await currentPc.setLocalDescription(answer);

        console.log("Sending answer to offerer");
        console.log(
          "Transceivers after answer:",
          currentPc.getTransceivers().map((t) => `${t.mid}: ${t.direction}`)
        );
        newSocket.emit("answer", { answer: currentPc.localDescription });
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    newSocket.on("answer", async ({ answer }) => {
      console.log("Received answer");
      console.log("Answer SDP includes:", {
        audio: answer.sdp?.includes("m=audio"),
        video: answer.sdp?.includes("m=video"),
      });

      try {
        const pc = peerConnectionRef.current;

        if (!pc) {
          console.error("No peer connection when receiving answer");
          return;
        }

        console.log("Current signaling state:", pc.signalingState);
        if (pc.signalingState !== "have-local-offer") {
          console.error(
            "Not in have-local-offer state, current state:",
            pc.signalingState
          );
          return;
        }

        console.log("Setting remote description (answer)");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));

        await processIceCandidateQueue();

        console.log("Answer applied successfully");
        console.log(
          "Transceivers:",
          pc.getTransceivers().map((t) => `${t.mid}: ${t.direction}`)
        );
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    newSocket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate) return;

      const pc = peerConnectionRef.current;

      if (!pc) {
        console.log("Queueing ICE candidate (no peer connection yet)");
        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      try {
        if (pc.remoteDescription) {
          console.log("Adding ICE candidate directly");
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("Queueing ICE candidate (no remote description)");
          iceCandidateQueueRef.current.push(candidate);
        }
      } catch (e) {
        console.error("Error adding ICE candidate:", e);
      }
    });

    newSocket.on("chat-message", ({ message }) => {
      setMessages((prev) => [...prev, { text: message, type: "stranger" }]);
    });

    newSocket.on("partner-disconnected", () => {
      handlePartnerDisconnect();
    });

    newSocket.on("partner-typing", () => {
      console.log("👀 Partner is typing!");
      setPartnerTyping(true);
    });

    newSocket.on("partner-stop-typing", () => {
      console.log("👀 Partner stopped typing!");
      setPartnerTyping(false);
    });
    return () => {
      console.log("🔌 Disconnecting socket");
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
        localStreamRef.current = null;
      }
      cleanupPeerConnection();
      newSocket.close();
    };
  }, [
    getLocalStream,
    createPeerConnection,
    processIceCandidateQueue,
    handlePartnerDisconnect,
    cleanupPeerConnection,
  ]);

  const clearTypingTimeout = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, []);

  const emitStopTyping = useCallback(() => {
    clearTypingTimeout();
    if (socketRef.current) {
      console.log("🛑 Emitting stop-typing");
      socketRef.current.emit("stop-typing");
    }
  }, [clearTypingTimeout]);

  const startChat = async () => {
    if (socket && status === "disconnected") {
      console.log("▶️ Starting chat");
      setMessages([]);
      setPartnerTyping(false);
      cleanupPeerConnection();

      // Request camera access immediately so user sees their video while waiting
      try {
        await getLocalStream();
        console.log("✅ Local camera started, now finding partner");
      } catch (err) {
        console.error("❌ Failed to start camera:", err);
        setMessages((prev) => [
          ...prev,
          {
            text: "Failed to access camera. Please allow camera permissions.",
            type: "system",
          },
        ]);
        return; // Don't search for partner if camera fails
      }

      socket.emit("find-partner");
    }
  };

  const nextChat = () => {
    if (socket) {
      console.log("⏭️ Next chat");
      setPartnerTyping(false);
      emitStopTyping();
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
      setTimeout(() => startChat(), 500);
    }
  };

  const stopChat = () => {
    if (socket) {
      console.log("⏹️ Stop chat");
      setPartnerTyping(false);
      emitStopTyping();
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputMessage(value);

    if (socketRef.current && status === "connected") {
      console.log("⌨️ User is typing, emitting typing event");
      // Emit typing event
      socketRef.current.emit("typing");

      // Clear existing timeout and set a fresh one for inactivity
      clearTypingTimeout();
      typingTimeoutRef.current = setTimeout(() => {
        console.log("⏱️ Typing timeout reached, stopping typing indicator");
        if (socketRef.current) {
          socketRef.current.emit("stop-typing");
        }
      }, 1200);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socket && status === "connected") {
      // Clear typing timeout and emit stop-typing immediately
      emitStopTyping();

      (socketRef.current || socket)?.emit("chat-message", {
        message: inputMessage,
      });
      setMessages((prev) => [...prev, { text: inputMessage, type: "you" }]);
      setInputMessage("");
    }
  };

  useEffect(() => {
    return () => {
      // Make sure remote stops seeing typing when this component unmounts
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socketRef.current) {
        socketRef.current.emit("stop-typing");
      }
    };
  }, []);

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setVideoEnabled(videoTrack.enabled);
      }
    }
  };

  return (
    <>
      <Navbar
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />

      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div
          className="min-h-screen bg-black p-4 pt-20"
          style={{ position: "relative" }}
        >
          <div
            style={{
              width: "100%",
              height: "100vh",
              position: "fixed",
              top: 0,
              left: 0,
              zIndex: 0,
            }}
          >
            <Particles
              particleColors={["#ffffff", "#ffffff", "#ffffff"]}
              particleCount={200}
              particleSpread={10}
              speed={0.2}
              particleBaseSize={100}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>

          {/* Sidebar Overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Sidebar Panel */}
          <div
            className={`fixed left-0 top-0 h-full w-80 bg-zinc-900/95 backdrop-blur-md border-r border-zinc-800 z-50 transform transition-transform duration-300 ease-in-out ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <div className="flex flex-col h-full p-6">
              {/* Close Button */}
              <button
                onClick={() => setSidebarOpen(false)}
                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Logo/Title */}
              <div className="mb-8 mt-2">
                <h2 className="text-2xl font-bold text-white">Menu</h2>
              </div>

              {/* Menu Items */}
              <nav className="flex-1 space-y-2">
                <button
                  onClick={() => {
                    /* TODO: Add functionality */
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 group"
                >
                  <UserCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Create Your Avatar</span>
                </button>

                <button
                  onClick={() => {
                    /* TODO: Add functionality */
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 group"
                >
                  <Palette className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Personalization</span>
                </button>

                <button
                  onClick={() => {
                    /* TODO: Add functionality */
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 group"
                >
                  <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">My Account</span>
                </button>
              </nav>

              {/* Settings at Bottom */}
              <div className="border-t border-zinc-800 pt-4">
                <button
                  onClick={() => {
                    /* TODO: Add functionality */
                  }}
                  className="w-full flex items-center gap-4 px-4 py-3 text-left text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all duration-200 group"
                >
                  <Settings className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="font-medium">Settings</span>
                </button>
              </div>
            </div>
          </div>

          <div
            className="max-w-7xl mx-auto"
            style={{ position: "relative", zIndex: 1 }}
          >
            <h1 className="text-5xl font-semibold text-white text-center mb-8 mt-2"></h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Video Section */}
              <div className="lg:col-span-2 flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Local Video */}
                  <div className="bg-zinc-900 rounded-lg overflow-hidden aspect-video relative border border-zinc-800">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    {!videoEnabled && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-800">
                        <VideoOff className="w-16 h-16 text-zinc-500" />
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                      <span className="text-white text-sm">You</span>
                    </div>
                  </div>

                  {/* Remote Video */}
                  <div className="bg-zinc-900 rounded-lg overflow-hidden aspect-video relative border border-zinc-800">
                    <video
                      ref={remoteVideoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                    />
                    {status !== "connected" && (
                      <div className="absolute inset-0 flex items-center justify-center bg-zinc-900">
                        <p className="text-zinc-400 text-xl">
                          {status === "waiting"
                            ? "Waiting for stranger..."
                            : "No one connected"}
                        </p>
                      </div>
                    )}
                    {status === "connected" && (
                      <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-1 rounded-full border border-white/10">
                        <span className="text-white text-sm">Stranger</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-3 justify-center mt-2">
                  <button
                    onClick={startChat}
                    disabled={status !== "disconnected"}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-emerald-500/10 to-green-600/10 backdrop-blur-sm border border-emerald-500/30 text-emerald-400 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/20 hover:border-emerald-400/50 hover:from-emerald-500/20 hover:to-green-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <Power className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                    Start
                  </button>

                  <button
                    onClick={toggleVideo}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 backdrop-blur-sm border border-cyan-500/30 text-cyan-400 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/20 hover:border-cyan-400/50 hover:from-cyan-500/20 hover:to-blue-600/20 active:scale-95"
                  >
                    {videoEnabled ? (
                      <Video className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    ) : (
                      <VideoOff className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                    )}
                    {videoEnabled ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={nextChat}
                    disabled={status !== "connected"}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-amber-500/10 to-orange-600/10 backdrop-blur-sm border border-amber-500/30 text-amber-400 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-amber-500/20 hover:border-amber-400/50 hover:from-amber-500/20 hover:to-orange-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <SkipForward className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                    Next
                  </button>

                  <button
                    onClick={stopChat}
                    disabled={status === "disconnected"}
                    className="group relative flex items-center gap-2 px-6 py-3 bg-gradient-to-br from-rose-500/10 to-red-600/10 backdrop-blur-sm border border-rose-500/30 text-rose-400 rounded-lg font-bold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-rose-500/20 hover:border-rose-400/50 hover:from-rose-500/20 hover:to-red-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <Power className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                    Stop
                  </button>
                </div>
              </div>

              {/* Chat Section */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex flex-col h-[600px]">
                <h2 className="text-2xl font-bold text-white mb-4">Chat</h2>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
                  {messages.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${
                        msg.type === "system"
                          ? "bg-zinc-800 text-zinc-400 text-center text-sm"
                          : msg.type === "you"
                          ? "bg-blue-900/30 border border-blue-800 text-blue-100 ml-auto max-w-[80%]"
                          : "bg-zinc-800 text-zinc-200 mr-auto max-w-[80%]"
                      }`}
                    >
                      {msg.type !== "system" && (
                        <div className="text-xs opacity-75 mb-1">
                          {msg.type === "you" ? "You" : "Stranger"}
                        </div>
                      )}
                      {msg.text}
                    </div>
                  ))}

                  {/* Typing Indicator */}
                  {partnerTyping && status === "connected" && (
                    <div className="p-3 rounded-lg bg-zinc-800 text-zinc-400 mr-auto max-w-[80%] animate-pulse">
                      <div className="text-xs opacity-75 mb-1">Stranger</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">typing</span>
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "0ms" }}
                        >
                          .
                        </span>
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "200ms" }}
                        >
                          .
                        </span>
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "400ms" }}
                        >
                          .
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={handleInputChange}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    disabled={status !== "connected"}
                    className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={status !== "connected" || !inputMessage.trim()}
                    className="group px-4 py-2 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 backdrop-blur-sm border border-blue-500/30 text-blue-400 rounded-lg font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20 hover:border-blue-400/50 hover:from-blue-500/20 hover:to-indigo-600/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
                  >
                    <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SignedIn>
    </>
  );
}

export default Cider;
