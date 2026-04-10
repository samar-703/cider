import { motion } from "framer-motion";
import { useId } from "react";
import { cn } from "../../utils";

export default function AnimatedGridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  strokeDasharray = 0,
  numSquares = 50,
  className,
  maxOpacity = 0.5,
  duration = 4,
  repeatDelay = 0.5,
  ...props
}) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full fill-white/5 stroke-white/10",
        className,
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      <svg x={x} y={y} className="overflow-visible">
        {Array.from({ length: numSquares }).map((_, i) => (
          <motion.rect
            strokeWidth="0"
            key={`${i}-${id}`}
            width={width - 1}
            height={height - 1}
            x={Math.floor(Math.random() * 20) * width + 1}
            y={Math.floor(Math.random() * 20) * height + 1}
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, maxOpacity, 0] }}
            transition={{
              duration: duration,
              repeat: Infinity,
              delay: Math.random() * 10,
              repeatDelay: Math.random() * repeatDelay + repeatDelay,
            }}
          />
        ))}
      </svg>
    </svg>
  );
}
