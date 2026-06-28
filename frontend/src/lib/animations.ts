export const motionTokens = {
  duration: {
    instant: 0.12,
    fast: 0.22,
    base: 0.38,
    slow: 0.62,
    cinematic: 0.9,
  },
  ease: {
    standard: [0.22, 1, 0.36, 1] as const,
    entrance: [0.16, 1, 0.3, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
    spring: [0.34, 1.56, 0.64, 1] as const,
  },
};

export const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.entrance },
  },
};

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: motionTokens.duration.fast, ease: motionTokens.ease.standard },
  },
};

export const staggerContainer = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};

export const scaleIn = {
  hidden: { opacity: 0, scale: 0.96 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: motionTokens.duration.base, ease: motionTokens.ease.spring },
  },
};
