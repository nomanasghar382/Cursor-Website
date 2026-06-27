import { motion } from 'framer-motion';
import type { ProductItem } from '../data/catalog';

type ProductCardProps = {
  product: ProductItem;
  inWishlist: boolean;
  cartQuantity: number;
  onAddToCart: (id: string) => void;
  onToggleWishlist: (id: string) => void;
  onSelect: (product: ProductItem) => void;
};

function ProductCard({
  product,
  inWishlist,
  cartQuantity,
  onAddToCart,
  onToggleWishlist,
  onSelect,
}: ProductCardProps) {
  return (
    <motion.article
      layout
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 220, damping: 24 }}
      className="group rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-4 shadow-2xl shadow-black/20 backdrop-blur-xl"
    >
      <button
        type="button"
        onClick={() => onSelect(product)}
        className={`relative mb-4 grid h-44 w-full place-items-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br ${product.gradient}`}
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_40%_20%,rgba(255,255,255,0.35),transparent_45%)] opacity-70" />
        <span className="absolute left-3 top-3 rounded-full border border-white/35 bg-black/25 px-2 py-1 text-[11px] font-semibold tracking-[0.16em] text-white/90">
          {product.badge}
        </span>
        <span className="rounded-full border border-white/30 bg-black/20 px-4 py-1 text-xs font-semibold uppercase tracking-[0.26em] text-white">
          3D Preview
        </span>
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-[#00D9C0]">{product.category}</p>
          <h3 className="mt-1 text-xl font-black tracking-[-0.03em] text-white">{product.name}</h3>
        </div>
        <p className="text-lg font-bold text-white">${product.price}</p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#AAB1C2]">{product.description}</p>

      <div className="mt-4 flex items-center justify-between text-xs text-[#AAB1C2]">
        <span>AI Match {product.aiMatch}%</span>
        <span>⭐ {product.rating.toFixed(1)}</span>
        <span>{product.stock} in stock</span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onToggleWishlist(product.id)}
          className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
            inWishlist
              ? 'border-[#6E56F8] bg-[#6E56F8]/20 text-white'
              : 'border-white/15 bg-white/[0.04] text-[#D6DAE7] hover:border-[#6E56F8]/60'
          }`}
        >
          {inWishlist ? 'In Wishlist' : 'Wishlist'}
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="rounded-xl border border-[#00D9C0]/40 bg-[#00D9C0]/15 px-3 py-2 text-sm font-semibold text-[#D8FFF8] transition hover:border-[#00D9C0] hover:bg-[#00D9C0]/25"
        >
          {cartQuantity > 0 ? `Cart (${cartQuantity})` : 'Add Cart'}
        </button>
      </div>
    </motion.article>
  );
}

export default ProductCard;
