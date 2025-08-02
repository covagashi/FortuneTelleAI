// src/components/ui/her-logo.tsx
"use client";

import { motion } from "framer-motion";

export function HerLogo({ className }: { className?: string }) {
  const patternId = "logo-pattern";
  const glitchFilterId = "glitch-filter";
  const violetGradientId = "violet-gradient";
  const highlightGradientId = "highlight-gradient";

  return (
    <div className={className}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg"
        style={{ overflow: "visible" }}
      >
        <defs>
          <pattern id={patternId} patternContentUnits="objectBoundingBox" width="1" height="1">
            <image href="/logo.png" x="0" y="0" width="1" height="1" preserveAspectRatio="xMidYMid slice" />
          </pattern>

          <radialGradient id={violetGradientId} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <stop offset="0%" style={{ stopColor: '#7e57c2', stopOpacity: 1 }} />
            <stop offset="100%" style={{ stopColor: '#2c1e38', stopOpacity: 1 }} />
          </radialGradient>
          
          <radialGradient id={highlightGradientId} cx="25%" cy="25%" r="40%">
            <stop offset="0%" style={{ stopColor: 'white', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: 'white', stopOpacity: 0 }} />
          </radialGradient>

          <filter id={glitchFilterId}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" result="turbulence" seed="0">
                 <animate attributeName="seed" from="0" to="100" dur="0.05s" repeatCount="indefinite" />
            </feTurbulence>
            <feDisplacementMap in="SourceGraphic" in2="turbulence" scale="5" xChannelSelector="R" yChannelSelector="G" />
            <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0" />
          </filter>
        </defs>
        
        {/* Crystal Ball group */}
        <motion.g
          animate={{ y: [0, -1, 0] }}
          transition={{
            duration: 10,
            ease: "easeInOut",
            repeat: Infinity,
            repeatType: "mirror",
          }}
        >
          {/* Base violet sphere */}
          <circle cx="50" cy="50" r="45" fill={`url(#${violetGradientId})`} />
          
          {/* The logo image, adapted to the full size of the sphere */}
          <circle cx="50" cy="50" r="45" fill={`url(#${patternId})`} style={{ mixBlendMode: 'screen', opacity: 0.7 }}/>

          {/* Glitch effect layer, applied on top */}
           <motion.g 
                style={{ mixBlendMode: 'hard-light' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 0.6, 0, 0, 0, 0.4, 0, 0, 0, 0, 0.8, 0] }}
                transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "circIn",
                }}
            >
                <circle cx="50" cy="50" r="45" fill={`url(#${patternId})`} filter={`url(#${glitchFilterId})`} />
            </motion.g>

            {/* Corner highlight */}
           <circle cx="50" cy="50" r="45" fill={`url(#${highlightGradientId})`} />

        </motion.g>
      </svg>
    </div>
  );
}
