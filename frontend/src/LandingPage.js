import React from "react";
import { SignInButton } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import { Video, MessageCircle, Shield, Zap, Globe, Users } from "lucide-react";
import Particles from "./Particles";

// Bento Card Component with magic hover effects
const BentoCard = ({
  children,
  className = "",
  delay = 0,
  gradient = "from-blue-500/20 to-purple-500/20",
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.02, y: -5 }}
      className={`group relative overflow-hidden rounded-2xl ${className}`}
    >
      {/* Animated gradient border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm" />
      <div className="absolute inset-[1px] rounded-2xl bg-zinc-900/95 backdrop-blur-xl" />

      {/* Hover glow effect */}
      <div
        className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-all duration-500 rounded-2xl`}
      />

      {/* Animated shine effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full p-6">{children}</div>

      {/* Border glow */}
      <div className="absolute inset-0 rounded-2xl border border-zinc-800 group-hover:border-zinc-700 transition-colors duration-300" />
    </motion.div>
  );
};

// Icon wrapper with glow effect
const GlowIcon = ({ icon: Icon, color = "blue" }) => {
  const colorClasses = {
    blue: "text-blue-400 bg-blue-500/10 group-hover:bg-blue-500/20 group-hover:shadow-blue-500/25",
    purple:
      "text-purple-400 bg-purple-500/10 group-hover:bg-purple-500/20 group-hover:shadow-purple-500/25",
    pink: "text-pink-400 bg-pink-500/10 group-hover:bg-pink-500/20 group-hover:shadow-pink-500/25",
    green:
      "text-emerald-400 bg-emerald-500/10 group-hover:bg-emerald-500/20 group-hover:shadow-emerald-500/25",
    orange:
      "text-orange-400 bg-orange-500/10 group-hover:bg-orange-500/20 group-hover:shadow-orange-500/25",
    cyan: "text-cyan-400 bg-cyan-500/10 group-hover:bg-cyan-500/20 group-hover:shadow-cyan-500/25",
  };

  return (
    <div
      className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:shadow-lg ${colorClasses[color]}`}
    >
      <Icon size={28} strokeWidth={1.5} />
    </div>
  );
};

function LandingPage() {
  return (
    <div className="min-h-screen bg-black" style={{ position: "relative" }}>
      {/* Particle Background */}
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
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
        <div className="text-center max-w-5xl w-full">
          {/* Logo/Title */}
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-7xl font-bold text-white mb-6"
          >
            Cider
          </motion.h1>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-2xl text-zinc-300 mb-4"
          >
            Connect with strangers around the world
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg text-zinc-400 mb-12 max-w-2xl mx-auto"
          >
            Experience random video chat with people from anywhere. Start
            conversations, make new friends, and explore different cultures -
            all in real-time.
          </motion.p>

          {/* Magic Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4 mb-12 auto-rows-[140px]">
            {/* Video Chat - Large Card */}
            <BentoCard
              className="md:col-span-3 md:row-span-2"
              delay={0.1}
              gradient="from-blue-500/10 to-cyan-500/10"
            >
              <div className="flex flex-col h-full">
                <GlowIcon icon={Video} color="blue" />
                <div className="mt-auto">
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Video Chat
                  </h3>
                  <p className="text-zinc-400 text-sm leading-relaxed">
                    Crystal-clear HD video and audio streaming powered by
                    WebRTC. Connect face-to-face with anyone, anywhere in the
                    world instantly.
                  </p>
                </div>
                {/* Decorative element */}
                <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
              </div>
            </BentoCard>

            {/* Text Chat - Medium Card */}
            <BentoCard
              className="md:col-span-3"
              delay={0.2}
              gradient="from-purple-500/10 to-pink-500/10"
            >
              <div className="flex items-center gap-4 h-full">
                <GlowIcon icon={MessageCircle} color="purple" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    Text Chat
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Real-time messaging alongside video
                  </p>
                </div>
                {/* Decorative dots */}
                <div className="absolute top-4 right-4 flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse" />
                  <div className="w-2 h-2 rounded-full bg-pink-500/50 animate-pulse delay-100" />
                  <div className="w-2 h-2 rounded-full bg-purple-500/50 animate-pulse delay-200" />
                </div>
              </div>
            </BentoCard>

            {/* Secure - Medium Card */}
            <BentoCard
              className="md:col-span-3"
              delay={0.3}
              gradient="from-emerald-500/10 to-green-500/10"
            >
              <div className="flex items-center gap-4 h-full">
                <GlowIcon icon={Shield} color="green" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-1">
                    End-to-End Secure
                  </h3>
                  <p className="text-zinc-400 text-sm">
                    Your privacy and safety matter to us
                  </p>
                </div>
                {/* Shield animation */}
                <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Shield size={60} className="text-emerald-500" />
                </div>
              </div>
            </BentoCard>

            {/* Instant - Small Card */}
            <BentoCard
              className="md:col-span-2"
              delay={0.4}
              gradient="from-orange-500/10 to-amber-500/10"
            >
              <div className="flex flex-col justify-center h-full items-center text-center">
                <GlowIcon icon={Zap} color="orange" />
                <h3 className="text-lg font-semibold text-white mt-3">
                  Lightning Fast
                </h3>
                <p className="text-zinc-500 text-xs mt-1">Connect in seconds</p>
              </div>
            </BentoCard>

            {/* Global - Small Card */}
            <BentoCard
              className="md:col-span-2"
              delay={0.5}
              gradient="from-cyan-500/10 to-blue-500/10"
            >
              <div className="flex flex-col justify-center h-full items-center text-center">
                <GlowIcon icon={Globe} color="cyan" />
                <h3 className="text-lg font-semibold text-white mt-3">
                  Global Reach
                </h3>
                <p className="text-zinc-500 text-xs mt-1">195+ countries</p>
              </div>
            </BentoCard>

            {/* Community - Small Card */}
            <BentoCard
              className="md:col-span-2"
              delay={0.6}
              gradient="from-pink-500/10 to-rose-500/10"
            >
              <div className="flex flex-col justify-center h-full items-center text-center">
                <GlowIcon icon={Users} color="pink" />
                <h3 className="text-lg font-semibold text-white mt-3">
                  Active Users
                </h3>
                <p className="text-zinc-500 text-xs mt-1">10K+ online now</p>
              </div>
            </BentoCard>
          </div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            <SignInButton mode="modal">
              <button className="group relative px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl transition-all duration-300 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/40 transform hover:scale-105 overflow-hidden">
                {/* Button shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                <span className="relative">Get Started</span>
              </button>
            </SignInButton>

            <p className="text-zinc-500 text-sm mt-6">
              Sign in to start chatting with strangers
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
