import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { AnimatePresence, motion } from 'framer-motion';
import { lazy, Suspense, useEffect, useRef, useState } from 'react';
import { featureCards, journeyNodes, metrics, phases } from './data/experience';

const MarketplaceScene = lazy(() => import('./components/MarketplaceScene'));

gsap.registerPlugin(ScrollTrigger);

function App() {
  const pageRef = useRef<HTMLDivElement>(null);
  const [activePhase, setActivePhase] = useState(0);

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

  return (
    <main ref={pageRef} className="relative min-h-screen overflow-hidden bg-[#0B0E14] text-[#F5F6FA]">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_20%_15%,rgba(110,86,248,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(0,217,192,0.16),transparent_24%),linear-gradient(180deg,#0B0E14_0%,#090B10_100%)]" />
      <div className="pointer-events-none fixed inset-0 z-0 opacity-30 [background-image:linear-gradient(rgba(245,246,250,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(245,246,250,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />

      <section className="relative z-10 min-h-screen px-5 py-6 sm:px-8 lg:px-12">
        <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-white/[0.04] px-5 py-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
          <a href="#top" className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-2xl bg-gradient-to-br from-[#6E56F8] to-[#00D9C0] font-black text-[#0B0E14]">
              N
            </span>
            <span className="font-semibold tracking-[0.24em] text-white">NEXORA AI</span>
          </a>
          <div className="hidden items-center gap-7 text-sm text-[#9AA1B2] md:flex">
            <a href="#search" className="transition hover:text-white">Smart Search</a>
            <a href="#recommend" className="transition hover:text-white">Recommendations</a>
            <a href="#assistant" className="transition hover:text-white">AI Assistant</a>
          </div>
          <a
            href="#demo"
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-[#0B0E14] shadow-[0_0_36px_rgba(245,246,250,0.22)] transition hover:scale-105"
          >
            View demo
          </a>
        </nav>

        <div id="top" className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 pt-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="relative z-20">
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-5 inline-flex rounded-full border border-[#00D9C0]/30 bg-[#00D9C0]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.32em] text-[#00D9C0]"
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
              <a href="#search" className="rounded-full bg-gradient-to-r from-[#6E56F8] to-[#00D9C0] px-7 py-4 text-center font-bold text-white shadow-[0_0_44px_rgba(0,217,192,0.22)] transition hover:-translate-y-1">
                Explore intelligence
              </a>
              <a href="#demo" className="rounded-full border border-white/15 bg-white/[0.06] px-7 py-4 text-center font-bold text-white backdrop-blur-xl transition hover:-translate-y-1 hover:border-[#00D9C0]/50">
                Watch 3D journey
              </a>
            </motion.div>
            <div className="mt-12 grid max-w-2xl grid-cols-3 gap-3">
              {metrics.map((metric) => (
                <div key={metric.label} className="rounded-3xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-xl">
                  <p className="text-2xl font-black text-white">{metric.value}</p>
                  <p className="mt-1 text-xs text-[#9AA1B2]">{metric.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div id="demo" className="relative h-[560px] min-h-[48vh] overflow-hidden rounded-[2.5rem] border border-white/10 bg-black/30 shadow-[0_40px_160px_rgba(0,0,0,0.55)] backdrop-blur">
            <Suspense fallback={<div className="grid h-full place-items-center text-sm text-[#9AA1B2]">Loading NEXORA 3D engine...</div>}>
              <MarketplaceScene activePhase={activePhase} />
            </Suspense>
            <div className="pointer-events-none absolute inset-x-6 bottom-6 rounded-3xl border border-white/10 bg-[#0B0E14]/70 p-4 backdrop-blur-2xl">
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
            </div>
            <div className="grid gap-4">
              {journeyNodes.map((node, index) => (
                <motion.div
                  key={node}
                  whileHover={{ x: 8, scale: 1.01 }}
                  className="flex items-center justify-between rounded-3xl border border-white/10 bg-[#0B0E14]/60 p-5"
                >
                  <span className="font-semibold text-white">{node}</span>
                  <span className="rounded-full bg-[#00D9C0]/10 px-3 py-1 text-xs font-bold text-[#00D9C0]">
                    AI phase {index + 1}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
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

      <footer className="relative z-10 px-5 pb-10 sm:px-8 lg:px-12">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 text-sm text-[#9AA1B2] backdrop-blur-xl sm:flex-row sm:items-center sm:justify-between">
          <span>NEXORA AI — Shop Smarter. Powered by AI.</span>
          <span>React + Vite + Tailwind + Three.js + R3F + GSAP + Framer Motion</span>
        </div>
      </footer>
    </main>
  );
}

export default App;
