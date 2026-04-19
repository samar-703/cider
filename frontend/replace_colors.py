import re

with open("src/LandingPage.js", "r") as f:
    content = f.read()

# Particles
content = content.replace('["#ffffff", "#0ea5e9", "#10b981"]', '["#ffffff", "#a1a1aa", "#52525b"]')

# bg glows
content = content.replace('bg-[#10b981]/15', 'bg-zinc-400/10')
content = content.replace('bg-[#0ea5e9]/15', 'bg-zinc-600/10')
content = content.replace('bg-[#0ea5e9]/10', 'bg-zinc-500/10')
content = content.replace('bg-[#10b981]/10', 'bg-zinc-400/10')

# Hero gradient
content = content.replace('from-[#e2e8f0] via-[#0ea5e9] to-[#10b981]', 'from-white via-zinc-300 to-zinc-600')

# Card glows
content = content.replace('from-cyan-500/20 to-emerald-500/20', 'from-zinc-500/20 to-zinc-800/20')
content = content.replace('rgba(6,182,212,0.5)', 'rgba(255,255,255,0.1)')

# BorderBeam
content = content.replace('colorFrom="#0ea5e9"\n                  colorTo="#10b981"', 'colorFrom="#ffffff"\n                  colorTo="#52525b"')

# Text colors
content = content.replace('text-[#60a5fa]', 'text-zinc-400')
content = content.replace('group-hover/stat:text-cyan-400', 'group-hover/stat:text-white')

# Built for spontaneous conversation header
content = content.replace('from-[#22d3ee] to-[#10b981]', 'from-zinc-200 to-zinc-600')

# Marquee styles
content = content.replace('from-cyan-500/5', 'from-zinc-500/5')
content = content.replace('group-hover:border-cyan-500/50', 'group-hover:border-white/40')
content = content.replace('group-hover:text-[#22d3ee]', 'group-hover:text-white')

# Camera Feed effects
content = content.replace('bg-cyan-400', 'bg-zinc-300')
content = content.replace('rgba(34,211,238,0.5)', 'rgba(255,255,255,0.5)')
content = content.replace('text-cyan-300', 'text-zinc-300')
content = content.replace('from-cyan-900/60', 'from-zinc-900/60')
content = content.replace('bg-[#38bdf8]', 'bg-zinc-300')

# What you get effects
content = content.replace('border-blue-500/20 bg-blue-500/10', 'border-zinc-500/20 bg-zinc-500/10')
content = content.replace('hover:bg-blue-500/20', 'hover:bg-zinc-500/20')

# Session Stack colors
content = content.replace('bg-[#34d399]', 'bg-zinc-300')
content = content.replace('bg-[#0ea5e9]', 'bg-zinc-500')
content = content.replace('bg-[#cbd5e1]', 'bg-zinc-600')

# Step cards interaction
content = content.replace('hover:border-blue-500/30', 'hover:border-white/30')

# Reviews
content = content.replace('accent: "from-cyan-500 to-sky-400"', 'accent: "from-zinc-400 to-zinc-600"')
content = content.replace('accent: "from-emerald-500 to-lime-400"', 'accent: "from-zinc-500 to-zinc-700"')
content = content.replace('accent: "from-violet-500 to-fuchsia-400"', 'accent: "from-zinc-300 to-zinc-500"')

# Grid pattern
content = content.replace('className="z-0 text-[#06b6d4]/10"', 'className="z-0 text-white/10"')
content = content.replace('maxOpacity={0.12}', 'maxOpacity={0.08}')

with open("src/LandingPage.js", "w") as f:
    f.write(content)
