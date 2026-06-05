export const motion = {
  duration: {
    instant: 0.1,
    fast:    0.15,
    normal:  0.25,
    slow:    0.4,
    slower:  0.6,
    lazy:    0.8,
  },
  ease: {
    out:     [0.0, 0.0, 0.2, 1.0] as [number, number, number, number],
    in:      [0.4, 0.0, 1.0, 1.0] as [number, number, number, number],
    inOut:   [0.4, 0.0, 0.2, 1.0] as [number, number, number, number],
    outExpo: [0.16, 1, 0.3, 1]    as [number, number, number, number],
  },
  spring: {
    bouncy:  { type: "spring" as const, stiffness: 300, damping: 20 },
    gentle:  { type: "spring" as const, stiffness: 200, damping: 30 },
    stiff:   { type: "spring" as const, stiffness: 400, damping: 28 },
  },
  // Framer Motion preset variants
  variants: {
    fadeUp: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: -8 },
    },
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit:    { opacity: 0 },
    },
    slideLeft: {
      initial: { opacity: 0, x: 24 },
      animate: { opacity: 1, x: 0 },
      exit:    { opacity: 0, x: -24 },
    },
    scale: {
      initial: { opacity: 0, scale: 0.94 },
      animate: { opacity: 1, scale: 1 },
      exit:    { opacity: 0, scale: 0.94 },
    },
  },
  viewport: { once: true, margin: "-80px" },
} as const;
