import { motion } from 'framer-motion';
import { useMemo } from 'react';
import type { ProductItem } from '../data/catalog';

type ProductMiniSceneProps = {
  category: ProductItem['category'];
};

function ProductMiniScene({ category }: ProductMiniSceneProps) {
  const [primary, secondary, accent] = useMemo(() => {
    if (category === 'Audio') return ['#7C83FF', '#B9D4FF', '#9B8CFF'];
    if (category === 'Wearables') return ['#5EEAD4', '#8DCBFF', '#4F8CFF'];
    if (category === 'Smart Home') return ['#7DD3FC', '#9DB8FF', '#B197FC'];
    if (category === 'Beauty Tech') return ['#F9A8D4', '#C4B5FD', '#8DA2FF'];
    if (category === 'Mobility') return ['#34D399', '#60A5FA', '#7EE787'];
    return ['#A3BFFA', '#67E8F9', '#7C83FF'];
  }, [category]);

  return (
    <div className="pointer-events-none absolute inset-0 grid place-items-center">
      <motion.div
        animate={{ rotate: [0, 360], y: [0, -8, 0], scale: [1, 1.04, 1] }}
        transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d', perspective: 900 }}
        className="relative h-20 w-20"
      >
        <span
          className="absolute inset-0 rounded-[22px] border border-white/20 shadow-[0_14px_50px_rgba(0,0,0,0.35)]"
          style={{ background: `linear-gradient(135deg, ${primary}, ${secondary})`, transform: 'translateZ(12px)' }}
        />
        <span
          className="absolute inset-2 rounded-[18px] border border-white/25 opacity-85"
          style={{ background: `linear-gradient(145deg, ${accent}, ${primary})`, transform: 'translateZ(28px)' }}
        />
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
