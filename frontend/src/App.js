import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { Video, VideoOff, Send, SkipForward, Power } from 'lucide-react';

const SOCKET_URL = process.env.REACT_APP_BACKEND_URL || 'https://cider-j4xo.onrender.com';

export default function Cider() {
  const [socket, setSocket] = useState(null);
  const [status, setStatus] = useState('disconnected');
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [partnerId, setPartnerId] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  const iceServers = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to server');
    });

    newSocket.on('waiting', () => {
      setStatus('waiting');
      setMessages(prev => [...prev, { text: 'Looking for a stranger...', type: 'system' }]);
    });

    newSocket.on('partner-found', async ({ partnerId }) => {
      setStatus('connected');
      setPartnerId(partnerId);
      setMessages(prev => [...prev, { text: 'Stranger connected!', type: 'system' }]);
      await setupWebRTC(newSocket, true);
    });

    newSocket.on('offer', async ({ offer, from }) => {
      await setupWebRTC(newSocket, false);
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(offer));
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        newSocket.emit('answer', { answer });
      }
    });

    newSocket.on('answer', async ({ answer }) => {
      const pc = peerConnectionRef.current;
      if (pc) {
        await pc.setRemoteDescription(new RTCSessionDescription(answer));
      }
    });

    newSocket.on('ice-candidate', async ({ candidate }) => {
      const pc = peerConnectionRef.current;
      if (pc && candidate) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (e) {
          console.error('Error adding ice candidate:', e);
        }
      }
    });

    newSocket.on('chat-message', ({ message, from }) => {
      setMessages(prev => [...prev, { text: message, type: 'stranger' }]);
    });

    newSocket.on('partner-disconnected', () => {
      handlePartnerDisconnect();
    });

    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (peerConnectionRef.current) {
        peerConnectionRef.current.close();
      }
      newSocket.close();
    };
  }, []);

  const setupWebRTC = async (socketInstance, isOfferer) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const pc = new RTCPeerConnection(iceServers);
      peerConnectionRef.current = pc;

      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });

      pc.ontrack = (event) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = event.streams[0];
        }
      };

      pc.onicecandidate = (event) => {
        if (event.candidate) {
          socketInstance.emit('ice-candidate', { candidate: event.candidate });
        }
      };

      if (isOfferer) {
        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);
        socketInstance.emit('offer', { offer });
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
      setMessages(prev => [...prev, { text: 'Camera/microphone access denied', type: 'system' }]);
    }
  };

  const handlePartnerDisconnect = () => {
    setStatus('disconnected');
    setPartnerId(null);
    setMessages(prev => [...prev, { text: 'Stranger disconnected', type: 'system' }]);
    
    if (peerConnectionRef.current) {
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }
    
    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }
  };

  const startChat = () => {
    if (socket && status === 'disconnected') {
      setMessages([]);
      socket.emit('find-partner');
    }
  };

  const nextChat = () => {
    if (socket) {
      socket.emit('disconnect-chat');
      handlePartnerDisconnect();
      setTimeout(() => startChat(), 500);
    }
  };

  const stopChat = () => {
    if (socket) {
      socket.emit('disconnect-chat');
      handlePartnerDisconnect();
    }
  };

  const sendMessage = () => {
    if (inputMessage.trim() && socket && status === 'connected') {
      socket.emit('chat-message', { message: inputMessage });
      setMessages(prev => [...prev, { text: inputMessage, type: 'you' }]);
      setInputMessage('');
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
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-5xl font-semibold text-white text-center mb-8 mt-4">
          Cider
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Video Section */}
          <div className="lg:col-span-2 space-y-4">
            {/* Remote Video */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover"
              />
              {status !== 'connected' && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <p className="text-white text-xl">
                    {status === 'waiting' ? 'Waiting for stranger...' : 'No one connected'}
                  </p>
                </div>
              )}
            </div>

            {/* Local Video */}
            <div className="bg-black rounded-lg overflow-hidden aspect-video relative">
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              {!videoEnabled && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  <VideoOff className="w-16 h-16 text-white" />
                </div>
              )}
              <div className="absolute bottom-4 left-4 bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full">
                <span className="text-white text-sm">You</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-3 justify-center">
              <button
                onClick={startChat}
                disabled={status !== 'disconnected'}
                className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
              >
                <Power className="w-5 h-5" />
                Start
              </button>
              
              <button
                onClick={toggleVideo}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition"
              >
                {videoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                {videoEnabled ? 'Disable' : 'Enable'} Video
              </button>

              <button
                onClick={nextChat}
                disabled={status !== 'connected'}
                className="flex items-center gap-2 px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
              >
                <SkipForward className="w-5 h-5" />
                Next
              </button>

              <button
                onClick={stopChat}
                disabled={status === 'disconnected'}
                className="flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition"
              >
                <Power className="w-5 h-5" />
                Stop
              </button>
            </div>
          </div>

          {/* Chat Section */}
          <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 flex flex-col h-[600px]">
            <h2 className="text-2xl font-bold text-white mb-4">Chat</h2>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-4 scrollbar-thin">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg ${
                    msg.type === 'system'
                      ? 'bg-gray-700 text-gray-300 text-center text-sm'
                      : msg.type === 'you'
                      ? 'bg-blue-600 text-white ml-auto max-w-[80%]'
                      : 'bg-gray-600 text-white mr-auto max-w-[80%]'
                  }`}
                >
                  {msg.type !== 'system' && (
                    <div className="text-xs opacity-75 mb-1">
                      {msg.type === 'you' ? 'You' : 'Stranger'}
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
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                disabled={status !== 'connected'}
                className="flex-1 px-4 py-2 bg-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              />
              <button
                onClick={sendMessage}
                disabled={status !== 'connected' || !inputMessage.trim()}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition"
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