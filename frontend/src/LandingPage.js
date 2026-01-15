import React, { useRef } from "react";
import { SignInButton } from "@clerk/clerk-react";
import { motion, useInView } from "framer-motion";
import {
  Video,
  MessageSquare,
  ShieldCheck,
  Zap,
  Globe2,
  Users,
  ArrowRight,
  Twitter,
  Github,
  Heart,
  Sparkles,
} from "lucide-react";
import Particles from "./Particles";

// Feature Card Component - Clean bento style
const FeatureCard = ({
  icon: Icon,
  title,
  description,
  color,
  delay,
  large = false,
}) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const colorConfig = {
    blue: {
      iconBg: "bg-blue-500/10",
      iconColor: "text-blue-400",
      borderHover: "hover:border-blue-500/50",
      glow: "group-hover:shadow-blue-500/50",
    },
    purple: {
      iconBg: "bg-purple-500/10",
      iconColor: "text-purple-400",
      borderHover: "hover:border-purple-500/50",
      glow: "group-hover:shadow-purple-500/50",
    },
    emerald: {
      iconBg: "bg-emerald-500/10",
      iconColor: "text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      glow: "group-hover:shadow-emerald-500/50",
    },
    amber: {
      iconBg: "bg-amber-500/10",
      iconColor: "text-amber-400",
      borderHover: "hover:border-amber-500/50",
      glow: "group-hover:shadow-amber-500/50",
    },
    cyan: {
      iconBg: "bg-cyan-500/10",
      iconColor: "text-cyan-400",
      borderHover: "hover:border-cyan-500/50",
      glow: "group-hover:shadow-cyan-500/50",
    },
    rose: {
      iconBg: "bg-rose-500/10",
      iconColor: "text-rose-400",
      borderHover: "hover:border-rose-500/50",
      glow: "group-hover:shadow-rose-500/50",
    },
  };

  const config = colorConfig[color];

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`group relative ${large ? "md:col-span-2" : ""}`}
    >
      <div
        className={`relative h-full p-6 rounded-3xl bg-zinc-900/60 backdrop-blur-sm border border-zinc-800/80 ${config.borderHover} transition-all duration-500 ease-out group-hover:shadow-2xl ${config.glow} group-hover:-translate-y-1`}
      >
        {/* Icon */}
        <div
          className={`w-12 h-12 rounded-2xl ${config.iconBg} ${config.iconColor} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
        >
          <Icon size={24} strokeWidth={1.5} />
        </div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
        <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>

        {/* Subtle gradient overlay on hover */}
        <div
          className={`absolute inset-0 rounded-3xl bg-gradient-to-br from-${color}-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
        />
      </div>
    </motion.div>
  );
};

// Marquee Stats Component - Digital Display Style
const StatItem = ({ value, label, isLive = false, color = "blue" }) => {
  const colorClasses = {
    blue: "from-blue-400 to-cyan-400",
    purple: "from-purple-400 to-pink-400",
    green: "from-emerald-400 to-green-400",
    amber: "from-amber-400 to-orange-400",
  };

  return (
    <div className="relative group flex-shrink-0 w-[240px]">
      <div className="text-center p-6 rounded-2xl bg-zinc-900/40 backdrop-blur-sm border border-zinc-800/60 transition-all duration-300 group-hover:border-zinc-700 group-hover:bg-zinc-900/60 h-full">
        {isLive && (
          <div className="flex items-center justify-center gap-2 mb-3">
            <motion.div
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0.6, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-2 h-2 rounded-full bg-emerald-400"
            />
            <span className="text-emerald-400 text-xs font-medium uppercase tracking-wide">
              Live
            </span>
          </div>
        )}
        <div
          className={`text-4xl md:text-5xl font-bold bg-gradient-to-r ${colorClasses[color]} bg-clip-text text-transparent mb-2`}
        >
          {value}
        </div>
        <div className="text-zinc-400 text-sm font-medium">{label}</div>
      </div>
      {/* Subtle glow */}
      <div
        className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${colorClasses[color]} opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300 -z-10`}
      />
    </div>
  );
};

function LandingPage() {
  const featuresRef = useRef(null);

  const features = [
    {
      icon: Video,
      title: "HD Video Calls",
      description:
        "Crystal-clear video streaming powered by WebRTC. Experience face-to-face conversations with zero lag.",
      color: "blue",
      large: true,
    },
    {
      icon: MessageSquare,
      title: "Real-time Chat",
      description:
        "Send messages instantly while on video. Express yourself with text alongside your conversations.",
      color: "purple",
      large: false,
    },
    {
      icon: ShieldCheck,
      title: "Privacy First",
      description:
        "Your conversations are secure. We prioritize your privacy and safety above everything.",
      color: "emerald",
      large: false,
    },
    {
      icon: Zap,
      title: "Instant Connect",
      description:
        "Skip the waiting. Get matched with someone new in under 3 seconds.",
      color: "amber",
      large: false,
    },
    {
      icon: Globe2,
      title: "Global Community",
      description:
        "Connect with people from 195+ countries. Break barriers and explore cultures.",
      color: "cyan",
      large: false,
    },
    {
      icon: Users,
      title: "Active 24/7",
      description:
        "Thousands of users online at any time. There's always someone to talk to.",
      color: "rose",
      large: true,
    },
  ];

  const scrollToFeatures = () => {
    featuresRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-zinc-950 overflow-x-hidden">
      {/* Particle Background - Fixed */}
      <div className="fixed inset-0 z-0">
        <Particles
          particleColors={["#60a5fa", "#a78bfa", "#22d3ee"]}
          particleCount={180}
          particleSpread={12}
          speed={0.09}
          particleBaseSize={160}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-zinc-950/30 via-zinc-950/60 to-zinc-950/90 pointer-events-none" />

      {/* Hero Section */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-4 pt-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 text-zinc-300 text-sm mb-8"
          >
            <Sparkles size={14} className="text-orange-400"/>
            <span>New: Enhanced video quality</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tight"
          >
            Meet Anyone,
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Anywhere
            </span>
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-lg md:text-xl text-zinc-400 mb-10 max-w-2xl mx-auto leading-relaxed"
          >
            Connect with strangers from around the world through instant video
            chat. Make new friends just one click away.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <SignInButton mode="modal">
              <button className="group relative px-8 py-4 bg-white text-zinc-900 font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-white/20 hover:-translate-y-0.5 flex items-center gap-2">
                Start Chatting
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </SignInButton>

            <button
              onClick={scrollToFeatures}
              className="px-8 py-4 text-zinc-300 font-medium rounded-2xl border border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50 transition-all duration-300"
            >
              Learn More
            </button>
          </motion.div>

          {/* Horizontal Scrolling Stats Ticker */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="w-full mt-12 overflow-hidden"
          >
            <div className="relative">
              {/* Fade edges */}
              <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-zinc-950 to-transparent z-10 pointer-events-none" />
              <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-zinc-950 to-transparent z-10 pointer-events-none" />

              {/* Scrolling container */}
              <motion.div
                className="flex gap-4"
                animate={{
                  x: ["-0%", "-50%"],
                }}
                transition={{
                  x: {
                    repeat: Infinity,
                    repeatType: "loop",
                    duration: 10,
                    ease: "linear",
                  },
                }}
              >
                {/* First set of stats */}
                <StatItem
                  value="10K+"
                  label="Online Now"
                  isLive={false}
                  color="green"
                />
                <StatItem value="195+" label="Countries" color="blue" />
                <StatItem value="1M+" label="Total Chats" color="purple" />
                <StatItem value="50K+" label="Daily Users" color="amber" />
                <StatItem value="24/7" label="Always Active" color="blue" />
                <StatItem value="<3s" label="Avg. Match Time" color="purple" />

                {/* Duplicate set for seamless loop */}
                <StatItem
                  value="10K+"
                  label="Online Now"
                  isLive={true}
                  color="green"
                />
                <StatItem value="195+" label="Countries" color="blue" />
                <StatItem value="1M+" label="Total Chats" color="purple" />
                <StatItem value="50K+" label="Daily Users" color="amber" />
                <StatItem value="24/7" label="Always Active" color="blue" />
                <StatItem value="<3s" label="Avg. Match Time" color="purple" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="relative z-10 py-24 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything you need to connect
            </h2>
            <p className="text-zinc-400 max-w-xl mx-auto">
              Simple, fast, and secure. We've built the features that matter
              most.
            </p>
          </motion.div>

          {/* Bento Grid - Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <FeatureCard {...features[0]} delay={0.1} />
            <FeatureCard {...features[1]} delay={0.2} />
            <FeatureCard {...features[2]} delay={0.3} />
          </div>

          {/* Bento Grid - Row 2 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <FeatureCard {...features[3]} delay={0.4} />
            <FeatureCard {...features[4]} delay={0.5} />
            <FeatureCard {...features[5]} delay={0.6} />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 py-24 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="p-8 md:p-12 rounded-3xl"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to start?
            </h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              Join thousands of users already connecting on Cider. It only takes
              a few seconds to get started.
            </p>
            <SignInButton mode="modal">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold rounded-2xl transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/25 hover:-translate-y-0.5 flex items-center gap-2 mx-auto">
                Get Started Free
                <ArrowRight
                  size={18}
                  className="transition-transform duration-300 group-hover:translate-x-1"
                />
              </button>
            </SignInButton>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <h3 className="text-2xl font-bold text-white mb-3">Cider</h3>
              <p className="text-zinc-400 text-sm leading-relaxed max-w-sm">
                Connect with strangers from around the world. Video chat made
                simple, fast, and secure.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-white font-medium mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    FAQ
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-medium mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors"
                  >
                    Guidelines
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom */}
          <div className="pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-zinc-500 text-sm flex items-center gap-1">
              Made by Samar
            </p>

            <div className="flex items-center gap-4">
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Twitter size={20} />
              </a>
              <a
                href="#"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <Github size={20} />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
