import React from 'react';
import { SignInButton } from '@clerk/clerk-react';
import Particles from './Particles';

function LandingPage() {
  return (
    <div className="min-h-screen bg-black" style={{ position: 'relative' }}>
      {/* Particle Background */}
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

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-3xl">
          {/* Logo/Title */}
          <h1 className="text-7xl font-bold text-white mb-6">
            Cider
          </h1>
          
          {/* Tagline */}
          <p className="text-2xl text-zinc-300 mb-4">
            Connect with strangers around the world
          </p>
          
          {/* Description */}
          <p className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto">
            Experience random video chat with people from anywhere. 
            Start conversations, make new friends, and explore different cultures - all in real-time.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="text-4xl mb-3">🎥</div>
              <h3 className="text-white font-semibold mb-2">Video Chat</h3>
              <p className="text-zinc-400 text-sm">High-quality video and audio streaming</p>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="text-4xl mb-3">💬</div>
              <h3 className="text-white font-semibold mb-2">Text Chat</h3>
              <p className="text-zinc-400 text-sm">Send messages while video chatting</p>
            </div>
            
            <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-lg p-6">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-white font-semibold mb-2">Secure</h3>
              <p className="text-zinc-400 text-sm">Your privacy and safety matter to us</p>
            </div>
          </div>

          {/* CTA Button */}
          <SignInButton mode="modal">
            <button className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xl font-bold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              Get Started
            </button>
          </SignInButton>

          <p className="text-zinc-500 text-sm mt-6">
            Sign in to get started
          </p>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
