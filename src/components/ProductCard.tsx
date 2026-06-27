import { motion } from 'framer-motion';
import type { ProductItem } from '../data/catalog';
import ProductMiniScene from './ProductMiniScene';

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
      className="group rounded-[1.25rem] border border-[#242C3A] bg-[#171C25] p-4 shadow-lg shadow-black/30"
    >
      <button
        type="button"
        onClick={() => onSelect(product)}
        className="relative mb-4 h-44 w-full overflow-hidden rounded-[1rem] border border-[#2D3647] bg-[#10151E]"
      >
        <span className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(124,131,255,0.25),transparent_55%)]" />
        <ProductMiniScene category={product.category} />
        <span className="absolute left-3 top-3 rounded-full border border-[#3A4560] bg-[#0F1420]/80 px-2 py-1 text-[11px] font-semibold tracking-[0.12em] text-[#D8E1F2]">
          {product.badge}
        </span>
        <span className="absolute bottom-3 right-3 rounded-full border border-[#3A4560] bg-[#0F1420]/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#BFD8FF]">
          Live 3D
        </span>
      </button>

      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.16em] text-[#79A6FF]">{product.category}</p>
          <h3 className="mt-1 text-lg font-bold tracking-[-0.01em] text-white">{product.name}</h3>
        </div>
        <p className="text-lg font-bold text-[#FFD27A]">${product.price}</p>
      </div>

      <p className="mt-3 line-clamp-2 text-sm leading-6 text-[#B7C0D4]">{product.description}</p>

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
              ? 'border-[#6F7EFF] bg-[#6F7EFF]/20 text-white'
              : 'border-[#313C52] bg-[#111722] text-[#D6DAE7] hover:border-[#6F7EFF]/60'
          }`}
        >
          {inWishlist ? 'In Wishlist' : 'Wishlist'}
        </button>
        <button
          type="button"
          onClick={() => onAddToCart(product.id)}
          className="rounded-xl border border-[#FFB547]/60 bg-[#FFB547]/15 px-3 py-2 text-sm font-semibold text-[#FFE5B4] transition hover:border-[#FFB547] hover:bg-[#FFB547]/25"
        >
          {cartQuantity > 0 ? `Cart (${cartQuantity})` : 'Add Cart'}
        </button>
      </div>
    </motion.article>
  );
}

export default ProductCard;
