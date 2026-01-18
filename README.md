# Cider - Omegle Clone

A modern, real-time video chat application that connects strangers for random video conversations, inspired by Omegle. Built with React, Node.js, Socket.IO, and WebRTC.

## Features

### Core Functionality
- **Random Video Matching**: Instantly connect with random strangers from around the world
- **Real-time Video Chat**: High-quality peer-to-peer video streaming using WebRTC
- **Text Chat**: Send messages alongside video conversations
- **User Authentication**: Secure sign-in powered by Clerk
- **Video Controls**: Toggle your camera on/off during conversations
- **Skip to Next**: Quickly move to the next stranger with one click

### User Interface
- **Modern Dark Theme**: Sleek black background with vibrant accent colors
- **Animated Particles**: Dynamic particle effects for enhanced visual appeal
- **Responsive Design**: Optimized for desktop and mobile devices
- **Real-time Status Updates**: Visual feedback for connection states (waiting, connected, disconnected)
- **Dual Video Layout**: Side-by-side video feeds for you and the stranger
- **Real-time Chat Section**: Chat side by side live with the person

### Technical Features
- **WebRTC Peer-to-Peer**: Direct browser-to-browser video streaming
- **Socket.IO Signaling**: Real-time communication for connection establishment
- **ICE Candidate Handling**: Robust NAT traversal with STUN servers
- **Automatic Reconnection**: Seamless handling of disconnections
- **Cross-browser Compatibility**: Works on Chrome, Firefox, Safari, and Edge

##  Tech Stack

### Frontend
| Technology | Version | Description |
|------------|---------|-------------|
| **React** | 19.2.0 | Modern UI framework with hooks and functional components |
| **Socket.IO Client** | 4.8.1 | Real-time bidirectional event-based communication |
| **WebRTC** | Native | Peer-to-peer video/audio streaming (browser API) |
| **Clerk** | 5.57.0 | Secure user authentication and session management |
| **Tailwind CSS** | 3.4.18 | Utility-first CSS framework for rapid styling |
| **Lucide React** | 0.554.0 | Beautiful & consistent icon library |
| **OGL** | 1.0.11 | Minimal WebGL framework for particle effects |
| **PostCSS** | 8.5.6 | CSS transformations and autoprefixing |

### Backend
| Technology | Version | Description |
|------------|---------|-------------|
| **Node.js** | 14+ | JavaScript runtime environment |
| **Express** | 4.18.2 | Fast, minimalist web server framework |
| **Socket.IO** | 4.6.1 | WebSocket server for real-time signaling |
| **CORS** | 2.8.5 | Cross-origin resource sharing middleware |
| **Nodemon** | 3.0.1 | Development auto-reload (dev dependency) |

### WebRTC Infrastructure
| Component | Description |
|-----------|-------------|
| **STUN Servers** | Google's public STUN servers for NAT traversal |
| **ICE Framework** | Interactive Connectivity Establishment for peer discovery |
| **SDP** | Session Description Protocol for media negotiation |

##  Prerequisites

Before running this application, make sure you have:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **Clerk Account** - For authentication ([Get it here](https://clerk.com))
- **Modern Web Browser** - Chrome, Firefox, Safari, or Edge
- **Webcam and Microphone** - For video chat functionality

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/omegle-clone.git
cd omegle-clone
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies:

```bash
cd backend
npm install
```

Start the backend server:

```bash
npm start
```

The server will run on `http://localhost:5000` by default.

For development with auto-reload:

```bash
npm run dev
```

### 3. Frontend Setup

Open a new terminal, navigate to the frontend directory, and install dependencies:

```bash
cd frontend
npm install
```

The backend URL is hardcoded in the app. You only need to set up Clerk authentication.

If you want to use Clerk (optional for local development), create a `.env.local` file in the `frontend` directory:

```env
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key_here
```

> **Note**: The app will work without Clerk for testing, but authentication features will be disabled.

Start the frontend development server:

```bash
npm start
```

The application will open at `http://localhost:3000`.

### 4. Environment Variables

#### Frontend (.env.local) - Optional
- `REACT_APP_CLERK_PUBLISHABLE_KEY` - Your Clerk publishable key (optional for local testing)

#### Backend
- `PORT` - Server port (default: 5000)

> **Note**: The backend URL is hardcoded in the frontend. To change it, edit the `SOCKET_URL` constant in `src/App.js`.

##  How to Use

1. **Sign In**: Click "Sign In" on the landing page using Clerk authentication
2. **Grant Permissions**: Allow camera and microphone access when prompted
3. **Start Chat**: Click the green "Start" button to find a random stranger
4. **Wait for Match**: The app will search for an available partner
5. **Chat**: Once connected, you can:
   - See the stranger's video feed
   - Send text messages
   - Toggle your camera on/off
   - Click "Next" to skip to another stranger
   - Click "Stop" to end the current chat
6. **Sign Out**: Click your profile icon in the navbar to sign out

### Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│   User A    │         │   Server    │         │   User B    │
│  (Browser)  │◄───────►│ (Socket.IO) │◄───────►│  (Browser)  │
└─────────────┘         └─────────────┘         └─────────────┘
      │                                                │
      │          WebRTC P2P Connection                │
      │◄──────────────────────────────────────────────►│
      │         (Video/Audio Stream)                   │
```

### Key Components

- **App.js**: Main React component handling video chat logic
- **LandingPage.js**: Authentication landing page
- **Navbar.js**: Navigation bar with user profile
- **Particles.js**: Animated particle background
- **server.js**: Backend Socket.IO server for signalling

## Project Structure

```
omegle-clone/
├── backend/
│   ├── server.js           # Socket.IO server
│   └── package.json        # Backend dependencies
├── frontend/
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── App.js          # Main video chat component
│   │   ├── LandingPage.js  # Landing page
│   │   ├── Navbar.js       # Navigation bar
│   │   ├── Particles.js    # Particle effects
│   │   ├── index.js        # React entry point
│   │   └── index.css       # Global styles
│   └── package.json        # Frontend dependencies
└── README.md               # This file
```

## Deployment

### Backend Deployment (Render/Heroku)

1. Push your code to GitHub
2. Create a new web service on Render or Heroku
3. Connect your repository
4. Set the root directory to `backend`
5. Deploy

### Frontend Deployment (Vercel)

1. Push your code to GitHub
2. Import project to Vercel
3. Set root directory to `frontend`
4. (Optional) Add an environment variable for Clerk:
   - `REACT_APP_CLERK_PUBLISHABLE_KEY`
5. If your backend URL changes, update the `SOCKET_URL` in `src/App.js`
6. Deploy

##  Security & Privacy

- **No Data Storage**: Conversations are not recorded or stored
- **Peer-to-Peer**: Video streams are transmitted directly between users
- **Secure Authentication**: Clerk handles user authentication securely
- **HTTPS Required**: Use HTTPS in production for WebRTC to work properly


