import re

with open("src/LandingPage.js", "r") as f:
    content = f.read()

# Make it completely black and eliminate all navy/zinc tints in backgrounds
content = content.replace('bg-[#0a0a0c]', 'bg-black')
content = content.replace('bg-[#060b13]', 'bg-[#020202]')
content = content.replace('bg-[#111827]/80', 'bg-[#050505]/80')
content = content.replace('bg-gradient-to-br from-[#1e293b] to-[#0f172a]', 'bg-gradient-to-br from-[#111] to-black')
content = content.replace('bg-[#0f172a]', 'bg-[#050505]')
content = content.replace('from-[#1e1b4b]/40', 'from-black/60')
content = content.replace('bg-[#171717]', 'bg-[#050505]')
content = content.replace('bg-[#202020]', 'bg-[#050505]')

# Switch the silver monochrome accent to a stunning Cobalt Blue
content = content.replace('["#ffffff", "#a1a1aa", "#52525b"]', '["#ffffff", "#3b82f6", "#60a5fa"]')
content = content.replace('bg-zinc-400/10', 'bg-blue-600/10')
content = content.replace('bg-zinc-600/10', 'bg-blue-500/10')
content = content.replace('bg-zinc-500/10', 'bg-blue-600/10')

# Hero gradient
content = content.replace('from-white via-zinc-300 to-zinc-600', 'from-white via-[#60a5fa] to-[#2563eb]')

# Card glows
content = content.replace('from-zinc-500/20 to-zinc-800/20', 'from-blue-600/20 to-indigo-600/20')

# BorderBeam
content = content.replace('colorFrom="#ffffff"\n                  colorTo="#52525b"', 'colorFrom="#3b82f6"\n                  colorTo="#1d4ed8"')

# Header text gradients
content = content.replace('from-zinc-200 to-zinc-600', 'from-white to-blue-500')

# Marquee hovers
content = content.replace('from-zinc-500/5', 'from-blue-500/5')
content = content.replace('group-hover:border-white/40', 'group-hover:border-blue-500/40')

# Camera Feed effects
content = content.replace('bg-zinc-300', 'bg-blue-400')
content = content.replace('text-zinc-300', 'text-blue-400')

# Text styling
content = content.replace('text-zinc-400', 'text-blue-400')

with open("src/LandingPage.js", "w") as f:
    f.write(content)
