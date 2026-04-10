import React from "react";
import { motion } from "framer-motion";
import {
  ArrowRightIcon,
  VideoIcon,
  ChatBubbleIcon,
  GlobeIcon,
  FaceIcon,
  ActivityLogIcon,
  StarIcon,
  EnterIcon,
  LightningBoltIcon,
  TargetIcon,
  EyeNoneIcon,
} from "@radix-ui/react-icons";

import Navbar from "./Navbar";
import Particles from "./Particles";
import { clerkEnabled, SignInAction } from "./auth";

import AnimatedGridPattern from "./components/magicui/animated-grid-pattern";
import ShimmerButton from "./components/magicui/shimmer-button";
import { BorderBeam } from "./components/magicui/border-beam";
import { Card, CardContent } from "./components/ui/card";
import { Badge } from "./components/ui/badge";

const featureCards = [
  {
    icon: VideoIcon,
    title: "Random Video Matching",
    description:
      "Jump into live one-on-one video conversations without building a public profile first.",
  },
  {
    icon: ChatBubbleIcon,
    title: "Built-in Text Chat",
    description:
      "Send messages while the call is live so the conversation keeps moving naturally.",
  },
  {
    icon: EyeNoneIcon,
    title: "Session-Based Experience",
    description:
      "Cider is designed around live sessions, not feeds, follower counts, or endless setup.",
  },
  {
    icon: TargetIcon,
    title: "Fast Next Match Flow",
    description:
      "If a conversation is not right, skip and move on quickly to the next person.",
  },
  {
    icon: LightningBoltIcon,
    title: "WebRTC-Powered Calls",
    description:
      "Video and audio are built on realtime browser media, with Socket.IO handling session setup.",
  },
  {
    icon: GlobeIcon,
    title: "Global Discovery",
    description:
      "Meet people outside your usual circle through simple random matching across regions.",
  },
];

const stats = [
  { value: "1 click", label: "to start matching" },
  { value: "Video + chat", label: "in one session" },
  { value: "Skip anytime", label: "when it is not a fit" },
];

const reviews = [
  {
    quote:
      "Finally a random chat app that feels current. It gets you into a conversation fast and the interface stays out of the way.",
    author: "Areeb",
    role: "Student",
    accent: "from-cyan-500 to-sky-400",
  },
  {
    quote:
      "The video-plus-chat combo makes awkward starts easier. If the vibe is off, skipping to the next person is instant.",
    author: "Nina",
    role: "Designer",
    accent: "from-emerald-500 to-lime-400",
  },
  {
    quote:
      "Most products in this category feel messy. This one feels cleaner, sharper, and much more intentional.",
    author: "Jay",
    role: "Developer",
    accent: "from-violet-500 to-fuchsia-400",
  },
];

function CTAButton() {
  if (!clerkEnabled) {
    return (
      <ShimmerButton className="shadow-2xl">
        <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
          Explore Cider
        </span>
      </ShimmerButton>
    );
  }

  return (
    <SignInAction>
      <ShimmerButton className="shadow-2xl">
        <span className="flex items-center gap-2 whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white lg:text-lg">
          Sign In To Start
          <ArrowRightIcon className="ml-1 size-4" />
        </span>
      </ShimmerButton>
    </SignInAction>
  );
}

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0c]">
      <Navbar variant="landing" />

      <AnimatedGridPattern
        numSquares={60}
        maxOpacity={0.12}
        duration={3}
        className="z-0 text-[#06b6d4]/10"
      />

      <div className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-screen">
        <Particles
          particleColors={["#ffffff", "#0ea5e9", "#10b981"]}
          particleCount={80}
          particleSpread={6}
          speed={0.1}
          particleBaseSize={80}
          moveParticlesOnHover={true}
          alphaParticles={true}
          disableRotation={false}
        />
      </div>

      <div className="pointer-events-none fixed left-[-10%] top-[-20%] h-[600px] w-[600px] rounded-full bg-[#10b981]/15 blur-[130px] mix-blend-screen" />
      <div className="pointer-events-none fixed bottom-[-20%] right-[-10%] h-[600px] w-[600px] rounded-full bg-[#0ea5e9]/15 blur-[130px] mix-blend-screen" />

      <main className="relative z-10 w-full overflow-hidden">
        <section className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 pb-20 pt-32 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="z-10 flex flex-col items-start text-left">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mb-8"
            >
              <Badge
                variant="outline"
                className="gap-2 border-white/10 bg-white/5 px-3 py-1 text-[#f8fafc] backdrop-blur-md"
              >
                <StarIcon className="size-3 text-yellow-400" />
                <span className="font-mono text-xs font-semibold uppercase tracking-widest text-[#cbd5e1]">
                  Random video chat, rebuilt with a cleaner feel
                </span>
              </Badge>
            </motion.div>

            <motion.h1
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="max-w-2xl text-6xl font-black tracking-tight text-[#f1f5f9] sm:text-7xl lg:text-7xl drop-shadow-lg"
            >
              Meet someone new,
              <span className="bg-gradient-to-r from-[#e2e8f0] via-[#0ea5e9] to-[#10b981] bg-clip-text text-transparent drop-shadow-sm">
                {" "}
                in a single click.
              </span>
            </motion.h1>

            <motion.p
              initial="hidden"
              animate="visible"
              variants={fadeInUp}
              className="mt-6 max-w-xl text-lg font-medium leading-relaxed text-[#94a3b8]"
            >
              Cider is a random video chat app for spontaneous one-on-one
              conversations. Sign in, allow your camera and microphone, and get
              matched with someone new from around the world.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
              className="mt-10 flex flex-wrap items-center gap-5"
            >
              <CTAButton />
              <a
                href="#how-it-works"
                className="group flex h-12 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 font-semibold text-[#f8fafc] transition-all hover:scale-105 hover:border-white/20 hover:bg-white/10 active:scale-95"
              >
                See How It Works
                <EnterIcon className="size-4 opacity-70 transition-transform group-hover:translate-x-1" />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              type: "spring",
              bounce: 0.3,
            }}
            className="z-10 mt-16 w-full max-w-[500px] lg:mt-0"
          >
            <motion.div
              whileHover={{ rotateY: 5, rotateX: -5, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
              className="group relative perspective-[1000px]"
            >
              <div className="absolute -inset-1 rounded-[2rem] bg-gradient-to-tr from-cyan-500/20 to-emerald-500/20 blur-xl opacity-70 transition-all duration-500 group-hover:blur-2xl" />

              <Card className="relative overflow-hidden rounded-[2rem] border-white/10 bg-[#060b13] shadow-2xl transition-all duration-500 group-hover:shadow-[0_0_90px_-15px_rgba(6,182,212,0.5)]">
                <BorderBeam
                  size={300}
                  duration={10}
                  delay={9}
                  className="opacity-70"
                  colorFrom="#0ea5e9"
                  colorTo="#10b981"
                />

                <CardContent className="space-y-6 pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-[#60a5fa]">
                        Conversation Preview
                      </p>
                      <h2 className="mt-1 text-xl font-bold text-[#f8fafc]">
                        Live Session Interface
                      </h2>
                    </div>
                    <Badge className="border border-[#334155] bg-[#1e293b]/80 text-[#94a3b8] hover:bg-[#334155]/50">
                      Ready to match
                    </Badge>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="group/video relative aspect-[4/5] flex-col justify-between overflow-hidden rounded-2xl border border-white/5 bg-[#0f172a] p-4 shadow-[inset_0_0_30px_rgba(0,0,0,0.8)]">
                      <img
                        src="/mockup_camera.png"
                        alt="Camera feed preview"
                        className="absolute inset-0 h-full w-full object-cover opacity-80 saturate-150 contrast-125 mix-blend-screen"
                      />
                      <div className="absolute inset-0 bg-cyan-900/10 mix-blend-overlay" />

                      <motion.div
                        animate={{ top: ["0%", "100%", "0%"] }}
                        transition={{ duration: 4, ease: "linear", repeat: Infinity }}
                        className="absolute left-0 right-0 z-0 h-px bg-cyan-400 opacity-50 shadow-[0_0_15px_3px_rgba(34,211,238,0.5)]"
                      />

                      <div className="relative z-10 flex w-max items-center gap-2 rounded-md bg-black/40 px-2.5 py-1.5 text-xs font-semibold text-white drop-shadow-md backdrop-blur-md">
                        <FaceIcon className="size-4 text-cyan-300" />
                        Camera Feed
                      </div>

                      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-1/2 bg-gradient-to-t from-cyan-900/60 to-transparent mix-blend-screen" />

                      <div className="relative z-10 mt-auto flex w-full items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="size-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,1)] animate-pulse" />
                          <span className="font-mono rounded border border-white/5 bg-black/40 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur-md">
                            Live
                          </span>
                        </div>
                        <div className="flex h-4 items-end gap-[3px] rounded bg-black/40 p-1.5 backdrop-blur-md border border-white/5">
                          <motion.div animate={{ height: ["40%", "100%", "40%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut" }} className="w-1 rounded-sm bg-[#38bdf8]" />
                          <motion.div animate={{ height: ["20%", "80%", "20%"] }} transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut", delay: 0.1 }} className="w-1 rounded-sm bg-[#38bdf8]" />
                          <motion.div animate={{ height: ["60%", "100%", "60%"] }} transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut", delay: 0.2 }} className="w-1 rounded-sm bg-[#38bdf8]" />
                          <motion.div animate={{ height: ["30%", "90%", "30%"] }} transition={{ duration: 0.5, repeat: Infinity, ease: "easeInOut", delay: 0.3 }} className="w-1 rounded-sm bg-[#38bdf8]" />
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 space-y-4">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5 backdrop-blur-sm transition-colors hover:bg-blue-500/20">
                        <p className="font-mono text-xs font-bold uppercase tracking-[0.1em] text-[#60a5fa]">
                          What you get
                        </p>
                        <p className="mt-2 text-sm leading-relaxed text-[#bae6fd]">
                          Random matching, live video, side-by-side chat, and a
                          quick path to the next conversation.
                        </p>
                      </div>
                      <div className="rounded-2xl border border-white/5 bg-white/5 p-5 shadow-inner transition-colors group-hover:bg-white/10 backdrop-blur-sm">
                        <div className="font-mono mb-2 flex items-center gap-2 text-xs font-semibold text-[#94a3b8]">
                          <ActivityLogIcon className="size-4" />
                          Session Stack
                        </div>
                        <ul className="space-y-2 text-xs font-medium text-[#cbd5e1]">
                          <li className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#34d399] animate-pulse" />
                            WebRTC media session
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#0ea5e9]" />
                            Socket.IO matchmaking
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="size-2 rounded-full bg-[#cbd5e1]" />
                            Realtime text chat
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 border-t border-white/10 pt-6">
                    {stats.map((stat) => (
                      <div key={stat.label} className="group/stat text-center">
                        <p className="text-xl font-bold text-[#f8fafc] transition-transform group-hover/stat:scale-110 group-hover/stat:text-[#60a5fa] lg:text-2xl">
                          {stat.value}
                        </p>
                        <p className="font-mono mt-1 text-[10px] font-bold uppercase tracking-widest text-[#64748b]">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>

        <section id="how-it-works" className="mx-auto max-w-7xl px-6 pb-32 pt-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="mb-16 md:mb-20"
          >
            <h2 className="text-4xl font-black tracking-tight text-[#f8fafc] md:text-6xl drop-shadow-md">
              Built for{" "}
              <span className="bg-gradient-to-r from-[#22d3ee] to-[#10b981] bg-clip-text text-transparent">
                spontaneous conversation.
              </span>
            </h2>
            <p className="mt-6 max-w-2xl text-xl font-medium leading-relaxed text-[#94a3b8]">
              Cider focuses on the real product experience: match quickly, talk
              clearly, chat if needed, and move on without friction.
            </p>
          </motion.div>

          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)] py-4">
            <div className="group flex w-full">
              <div className="flex shrink-0 animate-[marquee_40s_linear_infinite] items-center justify-around group-hover:[animation-play-state:paused]">
                {[...featureCards, ...featureCards].map(({ icon: Icon, title, description }, i) => (
                  <div
                    key={`${title}-${i}-1`}
                    className="group relative mx-3 flex h-[260px] w-[350px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/80 p-8 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#1f2937]/90 hover:shadow-2xl"
                  >
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/5 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-[#f1f5f9] shadow-inner transition-colors duration-300 group-hover:border-cyan-500/50">
                      <Icon className="size-6 transition-transform group-hover:scale-125" />
                    </div>
                    <div>
                      <h3 className="relative z-10 text-2xl font-bold tracking-tight text-[#f8fafc] transition-colors group-hover:text-[#22d3ee]">
                        {title}
                      </h3>
                      <p className="relative z-10 mt-3 text-sm font-medium leading-relaxed text-[#64748b] transition-colors group-hover:text-[#e2e8f0]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div
                aria-hidden="true"
                className="flex shrink-0 animate-[marquee_40s_linear_infinite] items-center justify-around group-hover:[animation-play-state:paused]"
              >
                {[...featureCards, ...featureCards].map(({ icon: Icon, title, description }, i) => (
                  <div
                    key={`${title}-${i}-2`}
                    className="group relative mx-3 flex h-[260px] w-[350px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/10 bg-[#111827]/80 p-8 backdrop-blur-md transition-all hover:border-white/20 hover:bg-[#1f2937]/90 hover:shadow-2xl"
                  >
                    <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-cyan-500/5 to-transparent opacity-0 mix-blend-overlay transition-opacity duration-500 group-hover:opacity-100" />
                    <div className="relative z-10 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5 bg-gradient-to-br from-[#1e293b] to-[#0f172a] text-[#f1f5f9] shadow-inner transition-colors duration-300 group-hover:border-cyan-500/50">
                      <Icon className="size-6 transition-transform group-hover:scale-125" />
                    </div>
                    <div>
                      <h3 className="relative z-10 text-2xl font-bold tracking-tight text-[#f8fafc] transition-colors group-hover:text-[#22d3ee]">
                        {title}
                      </h3>
                      <p className="relative z-10 mt-3 text-sm font-medium leading-relaxed text-[#64748b] transition-colors group-hover:text-[#e2e8f0]">
                        {description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[3rem] border border-white/10 bg-gradient-to-b from-[#1e1b4b]/40 to-transparent p-10 shadow-2xl md:p-20"
          >
            <div className="absolute inset-0 bg-grid-white/[0.03]" />
            <div className="absolute -left-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-[50%] bg-[#0ea5e9]/10 blur-[130px]" />
            <div className="absolute -right-40 top-1/2 h-96 w-96 -translate-y-1/2 rounded-[50%] bg-[#10b981]/10 blur-[130px]" />

            <div className="relative z-10 grid items-center gap-16 lg:grid-cols-[1fr_1.5fr]">
              <div>
                <Badge className="mb-8 border border-white/10 bg-white/5 px-4 py-1.5 text-sm tracking-wide text-[#e2e8f0] hover:bg-white/10">
                  How Cider Works
                </Badge>
                <h2 className="text-4xl font-black leading-[1.1] tracking-tight text-white md:text-5xl">
                  Simple flow.
                  <br />
                  Real conversation.
                </h2>
                <p className="mt-8 max-w-md text-xl font-medium leading-relaxed text-[#94a3b8]">
                  The product is straightforward on purpose: get into a
                  conversation fast, keep the interface readable, and leave when
                  you want to.
                </p>
                <div className="mt-10">
                  <CTAButton />
                </div>
              </div>

              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
                {[
                  {
                    step: "01",
                    title: "Sign in",
                    desc: "Authenticate and enter the app with a minimal setup flow.",
                  },
                  {
                    step: "02",
                    title: "Allow camera and mic",
                    desc: "Grant browser permissions so your live session can start.",
                  },
                  {
                    step: "03",
                    title: "Get matched",
                    desc: "Cider pairs you with another available user for a one-on-one session.",
                  },
                  {
                    step: "04",
                    title: "Chat or skip",
                    desc: "Talk, send messages, stay longer, or move on to the next match.",
                  },
                ].map((item) => (
                  <motion.div
                    key={item.step}
                    whileHover={{ scale: 1.05 }}
                    className="cursor-default rounded-[2rem] border border-white/10 bg-black/40 p-8 backdrop-blur-md shadow-xl transition-colors hover:border-blue-500/30 hover:bg-black/60"
                  >
                    <p className="mb-4 font-mono text-sm font-bold tracking-widest text-[#60a5fa]">
                      {item.step}
                    </p>
                    <p className="mb-3 text-xl font-bold text-[#f1f5f9]">
                      {item.title}
                    </p>
                    <p className="text-sm font-medium leading-relaxed text-[#94a3b8]">
                      {item.desc}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        </section>

        <section className="mx-auto max-w-7xl px-6 pb-32">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 text-center"
          >
            <h2 className="text-4xl font-black tracking-tight text-white md:text-5xl">
              Reviews
            </h2>
            <p className="mt-4 text-xl font-medium text-[#94a3b8]">
              Real reactions to the product direction, speed, and overall feel.
            </p>
          </motion.div>

          <div className="grid items-stretch gap-6 md:grid-cols-3">
            {reviews.map(({ quote, author, role, accent }) => (
              <motion.div
                key={author}
                whileHover={{ y: -10 }}
                className="relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#171717] p-8"
              >
                <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
                <div className="mb-6 flex items-center gap-1 text-yellow-400">
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                  <StarIcon />
                </div>
                <p className="text-lg font-medium leading-relaxed text-[#cbd5e1]">
                  "{quote}"
                </p>
                <div className="mt-auto flex items-center gap-4 pt-8">
                  <div className={`flex size-11 items-center justify-center rounded-full bg-gradient-to-br ${accent} text-sm font-bold text-white`}>
                    {author.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-bold text-white">{author}</p>
                    <p className="font-mono text-xs uppercase tracking-[0.18em] text-[#64748b]">
                      {role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        <footer className="border-t border-white/10 bg-[#050505] pb-10 pt-20">
          <div className="mx-auto flex max-w-7xl flex-col items-center px-6 text-center">
            <h2 className="mb-6 text-4xl font-black text-white">
              Ready to meet someone new?
            </h2>
            <p className="mb-10 max-w-lg text-xl font-medium text-[#94a3b8]">
              Start a live conversation, text alongside it, and keep moving with
              a simple random match flow.
            </p>
            <CTAButton />
            <p className="mt-24 text-sm font-bold uppercase tracking-widest text-[#475569]">
              &copy; {new Date().getFullYear()} Cider Video. All rights reserved.
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}

export default LandingPage;
