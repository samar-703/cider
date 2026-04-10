import React, { useState, useEffect, useRef, useCallback } from "react";
import io from "socket.io-client";
import {
  Video,
  VideoOff,
  Send,
  SkipForward,
  Power,
  User,
  Palette,
  UserCircle,
  Settings,
  X,
  ChevronDown,
} from "lucide-react";
import Particles from "./Particles";
import Navbar from "./Navbar";

const SOCKET_URL =
  process.env.REACT_APP_SOCKET_URL || "https://cider-j4xo.onrender.com";

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

function ChatApp() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState("disconnected");
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [, setPartnerId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);
  const socketRef = useRef(null);
  const iceCandidateQueueRef = useRef([]);
  const isNegotiatingRef = useRef(false);
  const makingOfferRef = useRef(false);
  const typingTimeoutRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const prevMessagesLengthRef = useRef(0);

  const cleanupPeerConnection = useCallback(() => {
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

  const createPeerConnection = useCallback((socketInstance) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);
    peerConnectionRef.current = pc;

    pc.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(() => {});
      }
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socketInstance.emit("ice-candidate", { candidate: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "failed") {
        console.log("WebRTC connection failed");
      }
    };

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === "failed") {
        pc.restartIce();
      }
    };

    pc.onsignalingstatechange = () => {
      isNegotiatingRef.current = pc.signalingState !== "stable";
    };

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    return pc;
  }, []);

  const getLocalStream = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      return stream;
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { text: "Camera/microphone access denied", type: "system" },
      ]);
      throw error;
    }
  }, []);

  const processIceCandidateQueue = useCallback(async () => {
    const pc = peerConnectionRef.current;
    if (!pc || !pc.remoteDescription) {
      return;
    }

    while (iceCandidateQueueRef.current.length > 0) {
      const candidate = iceCandidateQueueRef.current.shift();
      try {
        await pc.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Failed to add ICE candidate", error);
      }
    }
  }, []);

  const handlePartnerDisconnect = useCallback(() => {
    setStatus("disconnected");
    setPartnerId(null);
    setPartnerTyping(false);
    setMessages((prev) => [
      ...prev,
      { text: "Stranger disconnected", type: "system" },
    ]);
    cleanupPeerConnection();
  }, [cleanupPeerConnection]);

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    socketRef.current = newSocket;
    setSocket(newSocket);

    newSocket.on("waiting", () => {
      setStatus("waiting");
      setMessages((prev) => [
        ...prev,
        { text: "Looking for a stranger...", type: "system" },
      ]);
    });

    newSocket.on("partner-found", async ({ partnerId: pid, isOfferer }) => {
      setStatus("connected");
      setPartnerId(pid);
      setMessages((prev) => [
        ...prev,
        { text: "Stranger connected!", type: "system" },
      ]);

      try {
        if (!localStreamRef.current) {
          await getLocalStream();
        }

        const pc = createPeerConnection(newSocket);

        if (isOfferer) {
          makingOfferRef.current = true;
          const offer = await pc.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          await pc.setLocalDescription(offer);
          newSocket.emit("offer", { offer: pc.localDescription });
          makingOfferRef.current = false;
        }
      } catch (error) {
        console.error("Partner setup failed", error);
      }
    });

    newSocket.on("offer", async ({ offer }) => {
      try {
        if (!peerConnectionRef.current) {
          await getLocalStream();
          createPeerConnection(newSocket);
        }

        const currentPc = peerConnectionRef.current;
        const offerCollision =
          makingOfferRef.current || currentPc.signalingState !== "stable";

        if (offerCollision) {
          return;
        }

        await currentPc.setRemoteDescription(new RTCSessionDescription(offer));
        await processIceCandidateQueue();

        const answer = await currentPc.createAnswer();
        await currentPc.setLocalDescription(answer);
        newSocket.emit("answer", { answer: currentPc.localDescription });
      } catch (error) {
        console.error("Offer handling failed", error);
      }
    });

    newSocket.on("answer", async ({ answer }) => {
      try {
        const pc = peerConnectionRef.current;

        if (!pc || pc.signalingState !== "have-local-offer") {
          return;
        }

        await pc.setRemoteDescription(new RTCSessionDescription(answer));
        await processIceCandidateQueue();
      } catch (error) {
        console.error("Answer handling failed", error);
      }
    });

    newSocket.on("ice-candidate", async ({ candidate }) => {
      if (!candidate) {
        return;
      }

      const pc = peerConnectionRef.current;

      if (!pc) {
        iceCandidateQueueRef.current.push(candidate);
        return;
      }

      try {
        if (pc.remoteDescription) {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } else {
          iceCandidateQueueRef.current.push(candidate);
        }
      } catch (error) {
        console.error("ICE handling failed", error);
      }
    });

    newSocket.on("chat-message", ({ message }) => {
      setMessages((prev) => [...prev, { text: message, type: "stranger" }]);
      setUnreadCount((prev) => {
        const container = messagesContainerRef.current;
        if (container) {
          const isScrolledUp =
            container.scrollHeight -
              container.scrollTop -
              container.clientHeight >
            100;
          if (isScrolledUp) {
            return prev + 1;
          }
        }
        return 0;
      });
    });

    newSocket.on("partner-disconnected", () => {
      handlePartnerDisconnect();
    });

    newSocket.on("partner-typing", () => {
      setPartnerTyping(true);
    });

    newSocket.on("partner-stop-typing", () => {
      setPartnerTyping(false);
    });

    return () => {
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
      socketRef.current.emit("stop-typing");
    }
  }, [clearTypingTimeout]);

  const startChat = async () => {
    if (socket && status === "disconnected") {
      setMessages([]);
      setPartnerTyping(false);
      cleanupPeerConnection();

      try {
        await getLocalStream();
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            text: "Failed to access camera. Please allow camera permissions.",
            type: "system",
          },
        ]);
        return;
      }

      socket.emit("find-partner");
    }
  };

  const nextChat = () => {
    if (socket) {
      setPartnerTyping(false);
      emitStopTyping();
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
      setTimeout(() => startChat(), 500);
    }
  };

  const stopChat = () => {
    if (socket) {
      setPartnerTyping(false);
      emitStopTyping();
      socket.emit("disconnect-chat");
      handlePartnerDisconnect();
    }
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    setInputMessage(value);

    if (socketRef.current && status === "connected") {
      socketRef.current.emit("typing");
      clearTypingTimeout();
      typingTimeoutRef.current = setTimeout(() => {
        if (socketRef.current) {
          socketRef.current.emit("stop-typing");
        }
      }, 1200);
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socket && status === "connected") {
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

  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end",
      });
    }
    setUnreadCount(0);
    setIsUserScrolledUp(false);
  }, []);

  const handleMessagesScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) {
      return;
    }

    const threshold = 100;
    const isScrolledUp =
      container.scrollHeight - container.scrollTop - container.clientHeight >
      threshold;

    setIsUserScrolledUp(isScrolledUp);

    if (!isScrolledUp) {
      setUnreadCount(0);
    }
  }, []);

  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;

    if (currentLength > prevLength) {
      const lastMessage = messages[messages.length - 1];
      const isOwnMessage = lastMessage?.type === "you";
      const isSystemMessage = lastMessage?.type === "system";

      if (isOwnMessage || isSystemMessage || !isUserScrolledUp) {
        setTimeout(() => scrollToBottom(true), 50);
      }
    }

    prevMessagesLengthRef.current = currentLength;
  }, [messages, isUserScrolledUp, scrollToBottom]);

  useEffect(() => {
    if (status === "waiting") {
      setUnreadCount(0);
      setIsUserScrolledUp(false);
      setTimeout(() => scrollToBottom(false), 100);
    }
  }, [status, scrollToBottom]);

  return (
    <>
      <Navbar
        variant="app"
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />

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

        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div
          className={`fixed left-0 top-0 z-50 h-full w-80 transform border-r border-zinc-800 bg-zinc-900/95 backdrop-blur-md transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex h-full flex-col p-6">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute right-4 top-4 p-2 text-zinc-400 transition-colors hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="mb-8 mt-2">
              <h2 className="text-2xl font-bold text-white">Menu</h2>
            </div>

            <nav className="flex-1 space-y-2">
              <button className="group w-full rounded-lg px-4 py-3 text-left text-zinc-300 transition-all duration-200 hover:bg-zinc-800/50 hover:text-white">
                <div className="flex items-center gap-4">
                  <UserCircle className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Create Your Avatar</span>
                </div>
              </button>

              <button className="group w-full rounded-lg px-4 py-3 text-left text-zinc-300 transition-all duration-200 hover:bg-zinc-800/50 hover:text-white">
                <div className="flex items-center gap-4">
                  <Palette className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">Personalization</span>
                </div>
              </button>

              <button className="group w-full rounded-lg px-4 py-3 text-left text-zinc-300 transition-all duration-200 hover:bg-zinc-800/50 hover:text-white">
                <div className="flex items-center gap-4">
                  <User className="w-5 h-5 transition-transform duration-200 group-hover:scale-110" />
                  <span className="font-medium">My Account</span>
                </div>
              </button>
            </nav>

            <div className="border-t border-zinc-800 pt-4">
              <button className="group w-full rounded-lg px-4 py-3 text-left text-zinc-300 transition-all duration-200 hover:bg-zinc-800/50 hover:text-white">
                <div className="flex items-center gap-4">
                  <Settings className="w-5 h-5 transition-transform duration-200 group-hover:rotate-90" />
                  <span className="font-medium">Settings</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto" style={{ position: "relative", zIndex: 1 }}>
          <h1 className="sr-only mt-2 mb-8 text-center text-5xl font-semibold text-white">
            Video Chat
          </h1>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
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
                  <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm">
                    <span className="text-white text-sm">You</span>
                  </div>
                </div>

                <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
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
                    <div className="absolute bottom-4 left-4 rounded-full border border-white/10 bg-black/50 px-3 py-1 backdrop-blur-sm">
                      <span className="text-white text-sm">Stranger</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-2 flex justify-center gap-3">
                <button
                  onClick={startChat}
                  disabled={status !== "disconnected"}
                  className="group relative flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-green-600/10 px-6 py-3 font-bold text-emerald-400 transition-all duration-300 hover:scale-105 hover:border-emerald-400/50 hover:from-emerald-500/20 hover:to-green-600/20 hover:shadow-lg hover:shadow-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  <Power className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                  Start
                </button>

                <button
                  onClick={toggleVideo}
                  className="group relative flex items-center gap-2 rounded-lg border border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 to-blue-600/10 px-6 py-3 font-bold text-cyan-400 transition-all duration-300 hover:scale-105 hover:border-cyan-400/50 hover:from-cyan-500/20 hover:to-blue-600/20 hover:shadow-lg hover:shadow-cyan-500/20"
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
                  className="group relative flex items-center gap-2 rounded-lg border border-amber-500/30 bg-gradient-to-br from-amber-500/10 to-orange-600/10 px-6 py-3 font-bold text-amber-400 transition-all duration-300 hover:scale-105 hover:border-amber-400/50 hover:from-amber-500/20 hover:to-orange-600/20 hover:shadow-lg hover:shadow-amber-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  <SkipForward className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  Next
                </button>

                <button
                  onClick={stopChat}
                  disabled={status === "disconnected"}
                  className="group relative flex items-center gap-2 rounded-lg border border-rose-500/30 bg-gradient-to-br from-rose-500/10 to-red-600/10 px-6 py-3 font-bold text-rose-400 transition-all duration-300 hover:scale-105 hover:border-rose-400/50 hover:from-rose-500/20 hover:to-red-600/20 hover:shadow-lg hover:shadow-rose-500/20 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  <Power className="w-5 h-5 transition-transform duration-300 group-hover:rotate-180" />
                  Stop
                </button>
              </div>
            </div>

            <div className="flex h-[600px] flex-col rounded-lg border border-zinc-800 bg-zinc-900 p-4">
              <h2 className="mb-4 text-2xl font-bold text-white">Chat</h2>

              <div className="relative flex-1">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleMessagesScroll}
                  className="chat-scrollbar absolute inset-0 mb-4 space-y-2 overflow-y-auto pr-2"
                >
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

                  {partnerTyping && status === "connected" && (
                    <div className="mr-auto max-w-[80%] animate-pulse rounded-lg bg-zinc-800 p-3 text-zinc-400">
                      <div className="mb-1 text-xs opacity-75">Stranger</div>
                      <div className="flex items-center gap-1">
                        <span className="text-sm">typing</span>
                        <span className="typing-dot" style={{ animationDelay: "0ms" }}>
                          .
                        </span>
                        <span className="typing-dot" style={{ animationDelay: "200ms" }}>
                          .
                        </span>
                        <span className="typing-dot" style={{ animationDelay: "400ms" }}>
                          .
                        </span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} className="h-1" />
                </div>

                {isUserScrolledUp && (
                  <button
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-2 right-4 z-10 flex min-h-[36px] min-w-[36px] items-center justify-center rounded-full bg-zinc-700 p-2 text-white shadow-lg transition-all duration-200 hover:scale-110 hover:bg-zinc-600"
                  >
                    {unreadCount > 0 ? (
                      <span className="absolute -top-2 -right-2 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-blue-500 px-1 text-xs font-bold text-white">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    ) : null}
                    <ChevronDown className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={handleInputChange}
                  onKeyPress={(event) => event.key === "Enter" && sendMessage()}
                  placeholder="Type a message..."
                  disabled={status !== "connected"}
                  className="flex-1 rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-900 disabled:opacity-50"
                />
                <button
                  onClick={sendMessage}
                  disabled={status !== "connected" || !inputMessage.trim()}
                  className="group rounded-lg border border-blue-500/30 bg-gradient-to-br from-blue-500/10 to-indigo-600/10 px-4 py-2 font-medium text-blue-400 transition-all duration-300 hover:scale-105 hover:border-blue-400/50 hover:from-blue-500/20 hover:to-indigo-600/20 hover:shadow-lg hover:shadow-blue-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:shadow-none"
                >
                  <Send className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ChatApp;
