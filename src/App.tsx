import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import MarketplaceProductCard from './components/ProductCard';
import { aiPromptSuggestions, productCatalog, productCategories, type ProductItem } from './data/catalog';
import { featureCards, journeyNodes, metrics, phases } from './data/experience';

const MarketplaceScene = lazy(() => import('./components/MarketplaceScene'));

gsap.registerPlugin(ScrollTrigger);

const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

const sortOptions = [
  { id: 'featured', label: 'Featured' },
  { id: 'price-asc', label: 'Price: Low to high' },
  { id: 'price-desc', label: 'Price: High to low' },
  { id: 'rating', label: 'Rating first' },
  { id: 'ai-match', label: 'AI match first' },
] as const;

type SortOption = (typeof sortOptions)[number]['id'];

type AssistantInsight = {
  title: string;
  summary: string;
  picks: ProductItem[];
};

function buildAssistantInsight(query: string, products: ProductItem[]): AssistantInsight {
  const lowered = query.toLowerCase();

  if (lowered.includes('audio')) {
    const picks = products.filter((product) => product.category === 'Audio').slice(0, 3);
    return {
      title: 'Audio profile detected',
      summary: 'Your preference leans toward immersive sound and premium mobility.',
      picks,
    };
  }

  if (lowered.includes('gift')) {
    const picks = products.filter((product) => product.price <= 500).slice(0, 3);
    return {
      title: 'Gift mode activated',
      summary: 'Balanced pricing with strong wow-factor and high recommendation confidence.',
      picks,
    };
  }

  if (lowered.includes('home') || lowered.includes('apartment')) {
    const picks = products.filter((product) => product.category === 'Smart Home').slice(0, 3);
    return {
      title: 'Smart home journey',
      summary: 'Curating low-friction home intelligence devices for compact spaces.',
      picks,
    };
  }

  const picks = [...products].sort((a, b) => b.aiMatch - a.aiMatch).slice(0, 3);
  return {
    title: 'Personalized AI stack',
    summary: 'High-confidence picks based on conversion signal quality and product affinity.',
    picks,
  };
}

function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<(typeof productCategories)[number]>('All');
  const [sortBy, setSortBy] = useState<SortOption>('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProductItem>(productCatalog[0]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [assistantInput, setAssistantInput] = useState(aiPromptSuggestions[0]);
  const [assistantInsight, setAssistantInsight] = useState<AssistantInsight>(
    buildAssistantInsight(aiPromptSuggestions[0], productCatalog),
  );

  useEffect(() => {
    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
        gsap.fromTo(
          element,
          { autoAlpha: 0, y: 52 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: element,
              start: 'top 82%',
            },
          },
        );
      });

      phases.forEach((_, index) => {
        ScrollTrigger.create({
          trigger: `[data-phase="${index}"]`,
          start: 'top center',
          end: 'bottom center',
          onEnter: () => setActivePhase(index),
          onEnterBack: () => setActivePhase(index),
        });
      });
    }, pageRef);

    return () => context.revert();
  }, []);

  const filteredProducts = useMemo(() => {
    let products = [...productCatalog];

    if (selectedCategory !== 'All') {
      products = products.filter((product) => product.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      products = products.filter(
        (product) =>
          product.name.toLowerCase().includes(query) ||
          product.description.toLowerCase().includes(query) ||
          product.category.toLowerCase().includes(query) ||
          product.badge.toLowerCase().includes(query),
      );
    }

    if (sortBy === 'price-asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'ai-match') {
      products.sort((a, b) => b.aiMatch - a.aiMatch);
    } else {
      products.sort((a, b) => b.aiMatch - a.aiMatch || b.rating - a.rating);
    }

    return products;
  }, [searchQuery, selectedCategory, sortBy]);

  const cartItems = useMemo(
    () =>
      Object.entries(cart)
        .filter(([, quantity]) => quantity > 0)
        .map(([productId, quantity]) => {
          const product = productCatalog.find((item) => item.id === productId);
          return product ? { product, quantity } : null;
        })
        .filter((item): item is { product: ProductItem; quantity: number } => item !== null),
    [cart],
  );

  const recommendationStack = useMemo(
    () =>
      [...productCatalog]
        .filter((product) => !cart[product.id])
        .sort((a, b) => b.aiMatch - a.aiMatch)
        .slice(0, 4),
    [cart],
  );

  const resultCount = filteredProducts.length;
  const cartCount = useMemo(() => Object.values(cart).reduce((sum, quantity) => sum + quantity, 0), [cart]);
  const wishlistCount = wishlist.length;

  const subtotal = useMemo(
    () => cartItems.reduce((sum, { product, quantity }) => sum + product.price * quantity, 0),
    [cartItems],
  );
  const shipping = subtotal > 0 ? (subtotal >= 1000 ? 0 : 35) : 0;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const toggleWishlist = (productId: string) => {
    setWishlist((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId],
    );
  };

  const addToCart = (productId: string) => {
    setCart((current) => ({ ...current, [productId]: (current[productId] ?? 0) + 1 }));
  };

  const updateCartQuantity = (productId: string, delta: number) => {
    setCart((current) => {
      const nextQuantity = Math.max((current[productId] ?? 0) + delta, 0);
      const next = { ...current, [productId]: nextQuantity };
      if (nextQuantity === 0) {
        delete next[productId];
      }
      return next;
    });
  };

  const runAssistant = (query: string) => {
    if (!query.trim()) return;
    setAssistantInput(query);
    setAssistantInsight(buildAssistantInsight(query, productCatalog));
  };

  const loadDemoCart = () => {
    const starterIds = ['nx-watch-pro', 'nx-audio-halo', 'nx-lumen-lamp'];
    setCart(
      starterIds.reduce<Record<string, number>>((result, id) => {
        result[id] = 1;
        return result;
      }, {}),
    );
  };

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#0F131A] text-[#F4F7FF]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_12%_10%,rgba(79,140,255,0.2),transparent_35%),radial-gradient(circle_at_90%_15%,rgba(124,131,255,0.15),transparent_26%),linear-gradient(180deg,#0F131A_0%,#0C1118_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-15 [background-image:linear-gradient(rgba(228,235,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(228,235,255,0.04)_1px,transparent_1px)] [background-size:80px_80px]" />

      <section className="relative z-10 min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <nav className="sticky top-4 z-30 mx-auto flex max-w-7xl flex-col gap-4 rounded-[1.4rem] border border-[#2A3344] bg-[#141B25]/95 px-4 py-4 shadow-xl shadow-black/30 backdrop-blur-xl lg:flex-row lg:items-center">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-gradient-to-br from-[#4F8CFF] to-[#7C83FF] font-black text-[#0D1420]">
              N
            </span>
            <span className="font-semibold tracking-[0.16em] text-[#F4F7FF]">NEXORA AI</span>
          </a>

          <div className="grid flex-1 gap-2 sm:grid-cols-[150px_1fr_auto]">
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value as (typeof productCategories)[number])}
              className="rounded-xl border border-[#303B50] bg-[#0F141D] px-3 py-3 text-sm text-[#DDE5F7] outline-none ring-[#4F8CFF]/55 focus:ring-2"
            >
              {productCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search products (e.g. headphones, smartwatch, smart home)"
              className="rounded-xl border border-[#303B50] bg-[#0F141D] px-4 py-3 text-sm text-[#F4F7FF] outline-none ring-[#4F8CFF]/55 placeholder:text-[#8B96AF] focus:ring-2"
            />
            <a
              href="#catalog"
              className="grid place-items-center rounded-xl border border-[#FFB547]/55 bg-[#FFB547]/18 px-5 py-3 text-sm font-semibold text-[#FFE5B4] transition hover:bg-[#FFB547]/28"
            >
              Search
            </a>
          </div>

          <div className="flex items-center gap-2">
            <a href="#catalog" className="rounded-xl border border-[#303B50] bg-[#0F141D] px-3 py-2 text-sm text-[#D7DFF1]">
              Wishlist {wishlistCount}
            </a>
            <a href="#checkout" className="rounded-xl border border-[#303B50] bg-[#0F141D] px-3 py-2 text-sm text-[#D7DFF1]">
              Cart {cartCount}
            </a>
          </div>
        </nav>

        <div id="top" className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 pt-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-20">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-5 inline-flex rounded-full border border-[#4F8CFF]/40 bg-[#4F8CFF]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.24em] text-[#A9C4FF]"
            >
              AI commerce intelligence
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.85, delay: 0.08 }}
              className="max-w-4xl text-5xl font-black leading-[0.92] tracking-[-0.07em] text-white sm:text-7xl lg:text-8xl"
            >
              Personalized future shopping, rendered in 3D.
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.22 }}
              className="mt-7 max-w-2xl text-lg leading-8 text-[#B8BECE]"
            >
              NEXORA AI turns search, recommendations, carts, wishlist behavior, and checkout intent into a cinematic marketplace where AI understands every shopper.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.75, delay: 0.35 }}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <a href="#catalog" className="rounded-full bg-gradient-to-r from-[#4F8CFF] to-[#7C83FF] px-7 py-4 text-center font-bold text-white shadow-[0_0_40px_rgba(79,140,255,0.22)] transition hover:-translate-y-1">
                Explore intelligence
              </a>
              <a href="#checkout" className="rounded-full border border-[#303B50] bg-[#121A25] px-7 py-4 text-center font-bold text-white transition hover:-translate-y-1 hover:border-[#4F8CFF]/50">
                Go to checkout
              </a>
            </motion.div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-2xl border border-[#2D3647] bg-[#151C27] p-4">
                  <p className="text-2xl font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-[#9AA4BA]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="demo" className="relative h-[560px] min-h-[48vh] overflow-hidden rounded-[2rem] border border-[#2A3344] bg-[#0D121A] shadow-[0_40px_120px_rgba(0,0,0,0.45)]">
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-[#9AA1B2]">Loading NEXORA 3D engine...</div>}>
              <MarketplaceScene activePhase={activePhase} />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-2xl border border-[#2D3647] bg-[#111923]/85 p-4">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activePhase}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.35 }}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00D9C0]">{phases[activePhase].eyebrow}</p>
                  <p className="mt-2 text-lg font-bold text-white">{phases[activePhase].title}</p>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-24 sm:px-8 lg:grid-cols-3 lg:px-12">
        {phases.map((phase, index) => (
          <article
            id={index === 0 ? 'search' : index === 1 ? 'recommend' : undefined}
            key={phase.title}
            data-phase={index}
            data-reveal
            className="group rounded-[2rem] border border-white/10 bg-white/[0.04] p-7 shadow-2xl shadow-black/20 backdrop-blur-xl transition duration-500 hover:-translate-y-2 hover:border-[#00D9C0]/35"
          >
            <span className="mb-8 grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-[#6E56F8]/80 to-[#00D9C0]/80 font-black">
              0{index + 1}
            </span>
            <p className="text-xs font-bold uppercase tracking-[0.28em] text-[#00D9C0]">{phase.eyebrow}</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">{phase.title}</h2>
            <p className="mt-4 leading-7 text-[#AAB1C2]">{phase.body}</p>
          </article>
        ))}
      </section>

      <section id="catalog" className="relative z-10 mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <div data-reveal className="mb-8 flex flex-col gap-6 rounded-[1.4rem] border border-[#2A3344] bg-[#141B25]/95 p-6 backdrop-blur-xl lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[#7FA2FF]">Full product listing</p>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white sm:text-5xl">
              Easy shopping, premium visuals.
            </h2>
            <p className="mt-3 max-w-2xl text-[#AFB8CC]">
              Select category, type product name, press search. This flow is designed for first-time users like Amazon.
            </p>
            <p className="mt-2 text-sm text-[#7F8AA3]">{resultCount} products found</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Try: smart watch, audio, home"
              className="w-full rounded-xl border border-[#303B50] bg-[#0F141D] px-4 py-3 text-sm text-white outline-none ring-[#4F8CFF]/55 placeholder:text-[#7F879B] focus:ring-2"
            />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortOption)}
              className="rounded-xl border border-[#303B50] bg-[#0F141D] px-4 py-3 text-sm text-white outline-none ring-[#4F8CFF]/55 focus:ring-2"
            >
              {sortOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div data-reveal className="mb-7 flex flex-wrap gap-3">
          {productCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setSelectedCategory(category)}
              className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === category
                  ? 'border-[#4F8CFF] bg-[#4F8CFF]/20 text-white'
                  : 'border-[#313C52] bg-[#121A25] text-[#C3C9D8] hover:border-[#4F8CFF]/50'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.45fr_0.55fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <MarketplaceProductCard
                  key={product.id}
                  product={product}
                  inWishlist={wishlist.includes(product.id)}
                  cartQuantity={cart[product.id] ?? 0}
                  onAddToCart={addToCart}
                  onToggleWishlist={toggleWishlist}
                  onSelect={setSelectedProduct}
                />
              ))
            ) : (
              <div className="md:col-span-2 rounded-2xl border border-dashed border-[#303B50] bg-[#121A25] p-8 text-center">
                <p className="text-lg font-semibold text-white">No products found for this search.</p>
                <p className="mt-2 text-sm text-[#96A2BC]">Try changing category or clear the search query.</p>
              </div>
            )}
          </div>

          <aside data-reveal className="sticky top-6 h-fit rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl lg:top-24">
            <p className="text-xs uppercase tracking-[0.26em] text-[#6E56F8]">Live cart status</p>
            <h3 className="mt-3 text-3xl font-black tracking-[-0.04em] text-white">{cartCount} items</h3>
            <p className="mt-2 text-sm text-[#AAB1C2]">{wishlistCount} products saved in wishlist</p>

            <div className="mt-5 space-y-3">
              {cartItems.length > 0 ? (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="rounded-2xl border border-white/10 bg-[#0B0E14]/70 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-white">{product.name}</p>
                        <p className="text-xs text-[#8F97AB]">
                          {quantity} × {usd.format(product.price)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, -1)}
                          className="grid size-7 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white"
                        >
                          -
                        </button>
                        <span className="text-sm font-semibold text-white">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQuantity(product.id, 1)}
                          className="grid size-7 place-items-center rounded-lg border border-white/15 bg-white/[0.04] text-white"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-white/20 bg-black/20 p-4 text-sm leading-6 text-[#9CA5B9]">
                  Cart is empty. Add products from the listing or load a demo cart.
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={loadDemoCart}
              className="mt-4 w-full rounded-xl border border-[#6E56F8]/40 bg-[#6E56F8]/20 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#6E56F8]/30"
            >
              Load demo cart
            </button>
            <a
              href="#checkout"
              className="mt-3 block w-full rounded-xl border border-[#00D9C0]/40 bg-[#00D9C0]/20 px-4 py-3 text-center text-sm font-semibold text-[#DFFCF8] transition hover:bg-[#00D9C0]/30"
            >
              Continue to checkout
            </a>
          </aside>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:px-12">
        <div data-reveal className="grid gap-8 overflow-hidden rounded-[2.2rem] border border-white/10 bg-white/[0.05] p-7 backdrop-blur-xl lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div className={`relative overflow-hidden rounded-[1.8rem] bg-gradient-to-br p-10 ${selectedProduct.gradient}`}>
            <span className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.35),transparent_45%)]" />
            <span className="absolute -right-7 top-6 rounded-full border border-white/30 bg-black/20 px-3 py-1 text-xs font-semibold tracking-[0.2em] text-white">
              360 VIEW
            </span>
            <div className="relative flex min-h-64 flex-col justify-end">
              <p className="text-xs font-semibold uppercase tracking-[0.32em] text-white/80">{selectedProduct.category}</p>
              <h3 className="mt-2 text-4xl font-black leading-tight tracking-[-0.05em] text-white">
                {selectedProduct.name}
              </h3>
              <p className="mt-3 max-w-md text-sm leading-6 text-white/85">{selectedProduct.description}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#00D9C0]">Interactive product page</p>
            <h3 className="mt-3 text-4xl font-black tracking-[-0.04em] text-white">High-conversion product spotlight.</h3>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-[#0B0E14]/60 p-3">
                <p className="text-xs text-[#9CA4B8]">Price</p>
                <p className="mt-1 text-lg font-bold text-white">{usd.format(selectedProduct.price)}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0B0E14]/60 p-3">
                <p className="text-xs text-[#9CA4B8]">AI Match</p>
                <p className="mt-1 text-lg font-bold text-white">{selectedProduct.aiMatch}%</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-[#0B0E14]/60 p-3">
                <p className="text-xs text-[#9CA4B8]">Rating</p>
                <p className="mt-1 text-lg font-bold text-white">{selectedProduct.rating.toFixed(1)} / 5</p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => addToCart(selectedProduct.id)}
                className="rounded-xl border border-[#00D9C0]/40 bg-[#00D9C0]/20 px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#00D9C0]/30"
              >
                Add spotlight item to cart
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(selectedProduct.id)}
                className="rounded-xl border border-white/15 bg-white/[0.04] px-5 py-3 text-sm font-semibold text-white transition hover:border-[#6E56F8]/45"
              >
                {wishlist.includes(selectedProduct.id) ? 'Remove from wishlist' : 'Save to wishlist'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="assistant" className="relative z-10 mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <div data-reveal className="overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.045] p-8 backdrop-blur-2xl lg:p-12">
          <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.32em] text-[#6E56F8]">Conversational AI interface</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">
                A holographic assistant that sells with context.
              </h2>
              <p className="mt-6 max-w-xl text-lg leading-8 text-[#AAB1C2]">
                The chatbot core understands preference, budget, occasion, product details, and checkout readiness before creating a recommendation path.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <input
                  value={assistantInput}
                  onChange={(event) => setAssistantInput(event.target.value)}
                  className="w-full rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm text-white outline-none ring-[#00D9C0]/60 focus:ring-2"
                />
                <button
                  type="button"
                  onClick={() => runAssistant(assistantInput)}
                  className="rounded-xl border border-[#00D9C0]/40 bg-[#00D9C0]/20 px-5 py-3 text-sm font-semibold text-white"
                >
                  Run AI Match
                </button>
              </div>
              <div className="mt-4 grid gap-2">
                {aiPromptSuggestions.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => runAssistant(prompt)}
                    className="rounded-xl border border-white/10 bg-[#0B0E14]/60 px-3 py-2 text-left text-xs text-[#BFC5D4] transition hover:border-[#6E56F8]/50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="rounded-[1.8rem] border border-white/10 bg-[#0B0E14]/70 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-[#00D9C0]">{assistantInsight.title}</p>
                <p className="mt-3 text-sm leading-6 text-[#B7BED0]">{assistantInsight.summary}</p>
              </div>
              {assistantInsight.picks.map((product, index) => (
                <motion.button
                  key={product.id}
                  type="button"
                  whileHover={{ x: 8, scale: 1.01 }}
                  onClick={() => {
                    setSelectedProduct(product);
                    addToCart(product.id);
                  }}
                  className="flex w-full items-center justify-between rounded-3xl border border-white/10 bg-[#0B0E14]/60 p-5 text-left"
                >
                  <span>
                    <span className="block text-xs uppercase tracking-[0.24em] text-[#7E88A0]">Recommendation {index + 1}</span>
                    <span className="mt-1 block font-semibold text-white">{product.name}</span>
                  </span>
                  <span className="rounded-full bg-[#00D9C0]/10 px-3 py-1 text-xs font-bold text-[#00D9C0]">
                    {product.aiMatch}% match
                  </span>
                </motion.button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div data-reveal className="grid gap-4 rounded-[2rem] border border-white/10 bg-white/[0.045] p-6 backdrop-blur-xl md:grid-cols-2 xl:grid-cols-4">
          {recommendationStack.map((product) => (
            <button
              key={product.id}
              type="button"
              onClick={() => setSelectedProduct(product)}
              className="rounded-2xl border border-white/10 bg-[#0B0E14]/60 p-4 text-left transition hover:border-[#00D9C0]/35"
            >
              <p className="text-xs uppercase tracking-[0.22em] text-[#00D9C0]">Neural node</p>
              <p className="mt-2 text-lg font-bold text-white">{product.name}</p>
              <p className="mt-1 text-xs text-[#9DA5BB]">{product.category}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-[#B2B9CC]">
                <span>{usd.format(product.price)}</span>
                <span>{product.aiMatch}% fit</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-7xl gap-6 px-5 py-20 sm:px-8 lg:grid-cols-3 lg:px-12">
        {featureCards.map((card) => (
          <motion.article
            key={card.title}
            data-reveal
            whileHover={{ y: -10 }}
            className="rounded-[2rem] border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.025] p-7 backdrop-blur-xl"
          >
            <p className="text-5xl font-black text-transparent [-webkit-text-stroke:1px_rgba(0,217,192,0.8)]">{card.stat}</p>
            <h3 className="mt-8 text-2xl font-black tracking-[-0.03em] text-white">{card.title}</h3>
            <p className="mt-4 leading-7 text-[#AAB1C2]">{card.copy}</p>
          </motion.article>
        ))}
      </section>

      <section id="checkout" className="relative z-10 mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
        <div data-reveal className="grid gap-6 rounded-[2.2rem] border border-white/10 bg-white/[0.05] p-6 backdrop-blur-xl lg:grid-cols-[1fr_0.9fr] lg:p-8">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[#6E56F8]">Checkout experience</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.04em] text-white">Premium conversion flow.</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <input placeholder="Full name" className="rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm outline-none ring-[#00D9C0]/60 focus:ring-2" />
              <input placeholder="Email address" className="rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm outline-none ring-[#00D9C0]/60 focus:ring-2" />
              <input placeholder="City" className="rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm outline-none ring-[#00D9C0]/60 focus:ring-2" />
              <input placeholder="Country" className="rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm outline-none ring-[#00D9C0]/60 focus:ring-2" />
              <input placeholder="Card number (demo)" className="rounded-xl border border-white/15 bg-[#0B0E14]/70 px-4 py-3 text-sm outline-none ring-[#00D9C0]/60 focus:ring-2 sm:col-span-2" />
            </div>
            <button
              type="button"
              className="mt-6 rounded-xl border border-[#00D9C0]/45 bg-gradient-to-r from-[#6E56F8]/40 to-[#00D9C0]/35 px-6 py-3 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Confirm AI-optimized order
            </button>
            <p className="mt-3 text-xs text-[#8F97AB]">
              Demo checkout frontend only. Node.js backend APIs can be attached in Phase 2.
            </p>
          </div>

          <aside className="rounded-2xl border border-white/10 bg-[#0B0E14]/70 p-5">
            <h3 className="text-xl font-bold text-white">Order Summary</h3>
            <div className="mt-4 space-y-3">
              {cartItems.length === 0 ? (
                <p className="rounded-xl border border-dashed border-white/20 bg-black/20 p-3 text-sm text-[#9DA6BC]">
                  No items yet. Add products from the listing above.
                </p>
              ) : (
                cartItems.map(({ product, quantity }) => (
                  <div key={product.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 p-3">
                    <div>
                      <p className="text-sm font-semibold text-white">{product.name}</p>
                      <p className="text-xs text-[#8E97AD]">
                        {quantity} × {usd.format(product.price)}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-white">{usd.format(product.price * quantity)}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 space-y-2 border-t border-white/10 pt-4 text-sm text-[#BDC4D5]">
              <div className="flex items-center justify-between">
                <span>Subtotal</span>
                <span>{usd.format(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : usd.format(shipping)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Tax</span>
                <span>{usd.format(tax)}</span>
              </div>
              <div className="mt-2 flex items-center justify-between text-base font-bold text-white">
                <span>Total</span>
                <span>{usd.format(total)}</span>
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:px-12">
        <div data-reveal className="grid gap-3 rounded-[1.8rem] border border-white/10 bg-white/[0.045] p-5 backdrop-blur-xl md:grid-cols-3">
          {journeyNodes.map((node, index) => (
            <div key={node} className="rounded-xl border border-white/10 bg-[#0B0E14]/60 px-4 py-3">
              <p className="text-[10px] uppercase tracking-[0.28em] text-[#7D86A0]">AI phase {index + 1}</p>
              <p className="mt-1 text-sm font-semibold text-white">{node}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="relative z-10 px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm text-[#9AA1B2] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <span>NEXORA AI — Shop Smarter. Powered by AI.</span>
          <span>Node.js frontend stack: React + Vite + Tailwind + Three.js + R3F + GSAP + Framer Motion</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
