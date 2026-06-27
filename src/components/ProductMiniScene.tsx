import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ProductItem } from '../data/catalog';

type ProductMiniSceneProps = {
  category: ProductItem['category'];
};

function ProductMiniScene({ category }: ProductMiniSceneProps) {
  const { primary, secondary, accent, variant } = useMemo(() => {
    if (category === 'Audio') {
      return { primary: '#7C83FF', secondary: '#B9D4FF', accent: '#9B8CFF', variant: 'audio' as const };
    }
    if (category === 'Wearables') {
      return { primary: '#5EEAD4', secondary: '#8DCBFF', accent: '#4F8CFF', variant: 'wearable' as const };
    }
    if (category === 'Smart Home') {
      return { primary: '#7DD3FC', secondary: '#9DB8FF', accent: '#B197FC', variant: 'home' as const };
    }
    if (category === 'Beauty Tech') {
      return { primary: '#F9A8D4', secondary: '#C4B5FD', accent: '#8DA2FF', variant: 'beauty' as const };
    }
    if (category === 'Mobility') {
      return { primary: '#34D399', secondary: '#60A5FA', accent: '#7EE787', variant: 'mobility' as const };
    }
    return { primary: '#A3BFFA', secondary: '#67E8F9', accent: '#7C83FF', variant: 'lifestyle' as const };
  }, [category]);

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        animate={{ rotate: [0, 360], y: [0, -8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', perspective: 900 }}
        className="relative h-20 w-20"
      >
        {variant === 'audio' && (
          <>
            <span
              className="absolute inset-0 rounded-full border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute inset-[14px] rounded-full border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(28px)' }}
            />
          </>
        )}
        {variant === 'wearable' && (
          <>
            <span
              className="absolute inset-[8px] rounded-[22px] border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute left-[30px] top-[4px] h-[72px] w-[20px] rounded-full border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(22px)' }}
            />
          </>
        )}
        {variant === 'home' && (
          <>
            <span
              className="absolute inset-[10px] rounded-[14px] border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute right-[10px] top-[10px] h-[18px] w-[18px] rounded-full border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(24px)' }}
            />
          </>
        )}
        {variant === 'beauty' && (
          <>
            <span
              className="absolute inset-[6px] rounded-[18px] border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute left-0 top-0 h-full w-full rounded-full border border-white/25 opacity-80"
              style={{ transform: 'translateZ(26px)' }}
            />
          </>
        )}
        {variant === 'mobility' && (
          <>
            <span
              className="absolute inset-y-[24px] left-[10px] right-[10px] rounded-full border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute left-[10px] top-[12px] h-[18px] w-[18px] rounded-full border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(24px)' }}
            />
            <span
              className="absolute bottom-[12px] right-[10px] h-[18px] w-[18px] rounded-full border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(24px)' }}
            />
          </>
        )}
        {variant === 'lifestyle' && (
          <>
            <span
              className="absolute inset-[8px] rounded-[20px] border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
              style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
            />
            <span
              className="absolute inset-[22px] rounded-[10px] border border-white/25 opacity-85"
              style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(24px)' }}
            />
          </>
        )}
        <span className="absolute inset-0 rounded-[22px] bg-white/10 blur-md" style={{ transform: 'translateZ(-8px)' }} />
      </motion.div>
      <motion.span
        animate={{ scale: [0.95, 1.08, 0.95], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="absolute h-28 w-28 rounded-full blur-2xl"
        style={{ background: `radial-gradient(circle, ${accent} 0%, transparent 70%)` }}
      />
    </div>
  );
}

export default ProductMiniScene;
