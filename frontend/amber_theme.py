import re

with open("src/LandingPage.js", "r") as f:
    content = f.read()

# Switch Blue to Deep Amber/Gold
content = content.replace('["#ffffff", "#3b82f6", "#60a5fa"]', '["#ffffff", "#f59e0b", "#fbbf24"]')
content = content.replace('bg-blue-600/10', 'bg-amber-600/10')
content = content.replace('bg-blue-500/10', 'bg-amber-500/10')
content = content.replace('from-white via-[#60a5fa] to-[#2563eb]', 'from-white via-[#fcd34d] to-[#d97706]')
content = content.replace('from-blue-600/20 to-indigo-600/20', 'from-amber-600/20 to-orange-700/20')
content = content.replace('colorFrom="#3b82f6"\n                  colorTo="#1d4ed8"', 'colorFrom="#f59e0b"\n                  colorTo="#b45309"')
content = content.replace('from-white to-blue-500', 'from-zinc-100 to-amber-500')
content = content.replace('from-blue-500/5', 'from-amber-500/5')
content = content.replace('group-hover:border-blue-500/40', 'group-hover:border-amber-500/40')
content = content.replace('bg-blue-400', 'bg-amber-400')
content = content.replace('text-blue-400', 'text-amber-500')

with open("src/LandingPage.js", "w") as f:
    f.write(content)
