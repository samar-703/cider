import React, { useState, useEffect, useRef } from "react";
import io from "socket.io-client";
import { Video, VideoOff, Send, SkipForward, Power } from "lucide-react";
import Particles from "./Particles";

const SOCKET_URL =
  process.env.REACT_APP_BACKEND_URL || "https://cider-j4xo.onrender.com";

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
  const remoteStreamRef = useRef(null);
  const webrtcSetupInProgressRef = useRef(false);
  const iceCandidateQueueRef = useRef([]);

  useEffect(() => {
    const iceServers = {
      iceServers: [
        { urls: "stun:stun.l.google.com:19302" },
        { urls: "stun:stun1.l.google.com:19302" },
      ],
    };

    const setupWebRTC = async (socketInstance, isOfferer) => {
      try {
        // Prevent multiple simultaneous setup calls
        if (webrtcSetupInProgressRef.current) {
          console.log("WebRTC setup already in progress");
          return;
        }

        webrtcSetupInProgressRef.current = true;

        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection(iceServers);
        peerConnectionRef.current = pc;

        // Set up event handlers BEFORE adding tracks
        pc.ontrack = (event) => {
          console.log("🎥 Remote track received:", event.track.kind);
          console.log("📦 Event streams:", event.streams?.length);

          try {
            // Use the stream from the event if available, otherwise create/update our own
            if (event.streams && event.streams.length > 0) {
              // Use the stream provided by the peer
              console.log("✅ Using stream from event");
              remoteStreamRef.current = event.streams[0];
            } else {
              // Create or update our own MediaStream
              console.log("🔧 Creating/updating MediaStream manually");
              if (!remoteStreamRef.current) {
                remoteStreamRef.current = new MediaStream();
              }
              remoteStreamRef.current.addTrack(event.track);
            }

            // Set the stream to the video element
            if (remoteVideoRef.current) {
              console.log("🎬 Setting srcObject to remote video element");
              remoteVideoRef.current.srcObject = remoteStreamRef.current;
              
              // Try to play the video
              remoteVideoRef.current.play().catch((err) => {
                console.warn("⚠️ Video play error (may auto-resolve):", err.message);
              });
              
              console.log(
                "📊 Remote stream tracks:",
                remoteStreamRef.current.getTracks().map(t => t.kind)
              );
            } else {
              console.error("❌ Remote video element not found!");
            }
          } catch (e) {
            console.error("💥 Error in ontrack handler:", e);
          }
        };

        pc.onicecandidate = (event) => {
          if (event.candidate) {
            socketInstance.emit("ice-candidate", {
              candidate: event.candidate,
            });
          }
        };

        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc.connectionState);
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc.iceConnectionState);
        };

        // Add tracks AFTER setting up handlers
        stream.getTracks().forEach((track) => {
          pc.addTrack(track, stream);
        });

        if (isOfferer) {
          const offer = await pc.createOffer();
          await pc.setLocalDescription(offer);
          socketInstance.emit("offer", { offer });
        }

        webrtcSetupInProgressRef.current = false;
      } catch (err) {
        console.error("Error accessing media devices:", err);
        webrtcSetupInProgressRef.current = false;
        setMessages((prev) => [
          ...prev,
          { text: "Camera/microphone access denied", type: "system" },
        ]);
      }
    };

    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Connected to server");
    });

    newSocket.on("waiting", () => {
      setStatus("waiting");
      setMessages((prev) => [
        ...prev,
        { text: "Looking for a stranger...", type: "system" },
      ]);
    });

    newSocket.on("partner-found", async ({ partnerId }) => {
      setStatus("connected");
      setPartnerId(partnerId);
      setMessages((prev) => [
        ...prev,
        { text: "Stranger connected!", type: "system" },
      ]);
      await setupWebRTC(newSocket, true);
    });

    newSocket.on("offer", async ({ offer, from }) => {
      try {
        console.log("Received offer from:", from);

        // Only setup WebRTC if not already done (for the answerer)
        if (!peerConnectionRef.current) {
          console.log("Setting up WebRTC for answerer");
          await setupWebRTC(newSocket, false);
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        const pc = peerConnectionRef.current;
        console.log("Peer connection state:", pc?.signalingState);

        if (pc && pc.signalingState === "stable") {
          console.log("Setting remote description (offer)");
          await pc.setRemoteDescription(new RTCSessionDescription(offer));
          console.log("Creating answer");
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          console.log("Sending answer");
          newSocket.emit("answer", { answer });

          // Process buffered ICE candidates after setting remote description
          console.log(
            "Processing buffered ICE candidates:",
            iceCandidateQueueRef.current.length
          );
          while (iceCandidateQueueRef.current.length > 0) {
            const bufferedCandidate = iceCandidateQueueRef.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(bufferedCandidate));
              console.log("Added buffered ICE candidate from offer");
            } catch (e) {
              console.error("Error adding buffered ICE candidate:", e);
            }
          }
        } else {
          console.log(
            "Peer connection not in stable state, current state:",
            pc?.signalingState
          );
        }
      } catch (err) {
        console.error("Error handling offer:", err);
      }
    });

    newSocket.on("answer", async ({ answer }) => {
      try {
        console.log("Received answer");
        const pc = peerConnectionRef.current;
        console.log("Peer connection state:", pc?.signalingState);

        if (pc && pc.signalingState === "have-local-offer") {
          console.log("Setting remote description (answer)");
          await pc.setRemoteDescription(new RTCSessionDescription(answer));
          console.log("Answer applied successfully");

          // Process buffered ICE candidates
          console.log(
            "Processing buffered ICE candidates:",
            iceCandidateQueueRef.current.length
          );
          while (iceCandidateQueueRef.current.length > 0) {
            const bufferedCandidate = iceCandidateQueueRef.current.shift();
            try {
              await pc.addIceCandidate(new RTCIceCandidate(bufferedCandidate));
              console.log("Added buffered ICE candidate");
            } catch (e) {
              console.error("Error adding buffered ICE candidate:", e);
            }
          }
        } else {
          console.log(
            "Peer connection not in have-local-offer state, current state:",
            pc?.signalingState
          );
        }
      } catch (err) {
        console.error("Error handling answer:", err);
      }
    });

    newSocket.on("ice-candidate", async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (!pc || !candidate) {
        return;
      }

      try {
        // Check if remote description is set
        if (pc.remoteDescription) {
          console.log("Adding ICE candidate immediately");
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          // Buffer the candidate until remote description is set
          console.log(
            "Buffering ICE candidate - remote description not set yet"
          );
          iceCandidateQueueRef.current.push(candidate);
        }
      } catch (e) {
        console.error("Error adding ice candidate:", e);
      }
    });

    newSocket.on("chat-message", ({ message, from }) => {
      setMessages((prev) => [...prev, { text: message, type: "stranger" }]);
    });

    newSocket.on("partner-disconnected", () => {
      handlePartnerDisconnect();
    });

    const localStream = localStreamRef.current;
    const peerConnection = peerConnectionRef.current;

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
      if (peerConnection) {
        peerConnection.close();
      }
      newSocket.close();
    };
  }, []);

  const handlePartnerDisconnect = () => {
    setStatus("disconnected");
    setPartnerId(null);
    setMessages((prev) => [
      ...prev,
      { text: "Stranger disconnected", type: "system" },
    ]);

    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    // Clear ICE candidate queue and setup flag
    iceCandidateQueueRef.current = [];
    webrtcSetupInProgressRef.current = false;
  };

  const startChat = () => {
    if (socket && status === "disconnected") {
      setMessages([]);
      socket.emit("find-partner");
    }
  };

  const nextChat = () => {
    if (socket) {
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
      setTimeout(() => startChat(), 500);
    }
  };

  const stopChat = () => {
    if (socket) {
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
    <div className="min-h-screen bg-black p-4" style={{ position: 'relative' }}>
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
        <h1 className="text-5xl font-semibold text-white text-center mb-8 mt-4">
          Cider
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
                  onLoadedMetadata={(e) => {
                    console.log("🎬 Remote video metadata loaded, attempting play");
                    e.target.play().catch(err => {
                      console.error("❌ Remote video play failed:", err);
                    });
                  }}
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
  );
}

export default Cider;
