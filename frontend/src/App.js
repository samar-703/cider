import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import { Video, VideoOff, Send, SkipForward, Power } from "lucide-react";
import { SignedIn, SignedOut } from "@clerk/clerk-react";
import Particles from "./Particles";
import LandingPage from "./LandingPage";
import Navbar from "./Navbar";

const SOCKET_URL = "https://cider-j4xo.onrender.com";

// ICE servers configuration with TURN servers for reliable connectivity
const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
    { urls: "stun:stun2.l.google.com:19302" },
    { urls: "stun:stun3.l.google.com:19302" },
    { urls: "stun:stun4.l.google.com:19302" },
    // Free TURN servers for reliability
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

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const isNegotiatingRef = useRef(false);
  const makingOfferRef = useRef(false);

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
        remoteVideoRef.current.play().catch(err => {
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
      console.log("➕ Adding local tracks to peer connection");
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
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
      
      console.log("✅ Got local stream with tracks:", stream.getTracks().map(t => t.kind));
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

    console.log(`🧊 Processing ${iceCandidateQueueRef.current.length} queued ICE candidates`);
    
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
      console.log(`🎯 Partner found! I am ${isOfferer ? "OFFERER" : "ANSWERER"}`);
      setStatus("connected");
      setPartnerId(pid);
      setMessages((prev) => [
        ...prev,
        { text: "Stranger connected!", type: "system" },
      ]);

      try {
        // Get local media first
        await getLocalStream();
        
        // Create peer connection
        const pc = createPeerConnection(newSocket);

        // Only the offerer creates and sends the offer
        if (isOfferer) {
          console.log("📤 Creating offer (I am offerer)");
          makingOfferRef.current = true;
          
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          
          await pc.setLocalDescription(offer);
          console.log("📤 Sending offer");
          newSocket.emit("offer", { offer: pc.localDescription });
          
          makingOfferRef.current = false;
        }
      } catch (err) {
        console.error("❌ Error in partner-found handler:", err);
      }
    });

    newSocket.on("offer", async ({ offer, from }) => {
      console.log("📥 Received offer from:", from);
      
      try {
        const pc = peerConnectionRef.current;
        
        if (!pc) {
          console.log("⚠️ No peer connection, getting stream first");
          await getLocalStream();
          createPeerConnection(newSocket);
        }

        const currentPc = peerConnectionRef.current;
        
        // Handle glare (both sides trying to negotiate)
        const offerCollision = makingOfferRef.current || currentPc.signalingState !== "stable";
        
        if (offerCollision) {
          console.log("⚠️ Offer collision detected, ignoring (I should be answerer)");
          return;
        }

        console.log("📝 Setting remote description (offer)");
        await currentPc.setRemoteDescription(new RTCSessionDescription(offer));
        
        // Process any queued ICE candidates
        await processIceCandidateQueue();
        
        console.log("📤 Creating answer");
        const answer = await currentPc.createAnswer();
        await currentPc.setLocalDescription(answer);
        
        console.log("📤 Sending answer");
        newSocket.emit("answer", { answer: currentPc.localDescription });
        
      } catch (err) {
        console.error("❌ Error handling offer:", err);
      }
    });

    newSocket.on("answer", async ({ answer }) => {
      console.log("📥 Received answer");
      
      try {
        const pc = peerConnectionRef.current;
        
        if (!pc) {
          console.log("⚠️ No peer connection when receiving answer");
          return;
        }

        if (pc.signalingState !== "have-local-offer") {
          console.log("⚠️ Not in have-local-offer state, ignoring answer");
          return;
        }

        console.log("📝 Setting remote description (answer)");
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        
        // Process any queued ICE candidates
        await processIceCandidateQueue();
        
        console.log("✅ Answer applied successfully");
      } catch (err) {
        console.error("❌ Error handling answer:", err);
      }
    });

    newSocket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate) return;

      const pc = peerConnectionRef.current;
      
      if (!pc) {
        console.log("🧊 Queueing ICE candidate (no peer connection yet)");
        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      try {
        if (pc.remoteDescription) {
          console.log("🧊 Adding ICE candidate directly");
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          console.log("🧊 Queueing ICE candidate (no remote description)");
          iceCandidateQueueRef.current.push(candidate);
        }
      } catch (e) {
        console.error("❌ Error adding ICE candidate:", e);
      }
    });

    newSocket.on("chat-message", ({ message }) => {
      setMessages((prev) => [...prev, { text: message, type: "stranger" }]);
    });

    newSocket.on("partner-disconnected", () => {
      handlePartnerDisconnect();
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
  }, [getLocalStream, createPeerConnection, processIceCandidateQueue, handlePartnerDisconnect, cleanupPeerConnection]);

  const startChat = () => {
    if (socket && status === "disconnected") {
      console.log("▶️ Starting chat");
      setMessages([]);
      cleanupPeerConnection();
      socket.emit("find-partner");
    }
  };

  const nextChat = () => {
    if (socket) {
      console.log("⏭️ Next chat");
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
      setTimeout(() => startChat(), 500);
    }
  };

  const stopChat = () => {
    if (socket) {
      console.log("⏹️ Stop chat");
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socket && status === "connected") {
      socket.emit("chat-message", { message: inputMessage });
      setMessages((prev) => [...prev, { text: inputMessage, type: "you" }]);
      setInputMessage("");
    }
  };

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
      <Navbar />

      <SignedOut>
        <LandingPage />
      </SignedOut>

      <SignedIn>
        <div className="min-h-screen bg-black p-4 pt-20" style={{ position: 'relative' }}>
          <div style={{ width: '100%', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
            <Particles
              particleColors={['#ffffff', '#ffffff', '#ffffff']}
              particleCount={200}
              particleSpread={10}
              speed={0.1}
              particleBaseSize={100}
              moveParticlesOnHover={true}
              alphaParticles={false}
              disableRotation={false}
            />
          </div>
          
          <div className="max-w-7xl mx-auto" style={{ position: 'relative', zIndex: 1 }}>
            <h1 className="text-5xl font-semibold text-white text-center mb-8 mt-2">
            </h1>

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
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border-2 border-green-600 text-green-500 hover:bg-green-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all duration-200"
                  >
                    <Power className="w-5 h-5" />
                    Start
                  </button>

                  <button
                    onClick={toggleVideo}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border-2 border-blue-600 text-blue-500 hover:bg-blue-900/20 rounded-lg font-bold transition-all duration-200"
                  >
                    {videoEnabled ? (
                      <Video className="w-5 h-5" />
                    ) : (
                      <VideoOff className="w-5 h-5" />
                    )}
                    {videoEnabled ? "Disable" : "Enable"}
                  </button>

                  <button
                    onClick={nextChat}
                    disabled={status !== "connected"}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border-2 border-yellow-600 text-yellow-500 hover:bg-yellow-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all duration-200"
                  >
                    <SkipForward className="w-5 h-5" />
                    Next
                  </button>

                  <button
                    onClick={stopChat}
                    disabled={status === "disconnected"}
                    className="flex items-center gap-2 px-6 py-3 bg-zinc-900 border-2 border-red-600 text-red-500 hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg font-bold transition-all duration-200"
                  >
                    <Power className="w-5 h-5" />
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
                </div>

                {/* Input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    disabled={status !== "connected"}
                    className="flex-1 px-4 py-2 bg-zinc-950 border border-zinc-800 text-white placeholder-zinc-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={status !== "connected" || !inputMessage.trim()}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:cursor-not-allowed text-white rounded-lg transition border border-zinc-700"
                  >
                    <Send className="w-5 h-5" />
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
