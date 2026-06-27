export type ProductCategory =
  | 'All'
  | 'Wearables'
  | 'Audio'
  | 'Smart Home'
  | 'Beauty Tech'
  | 'Mobility'
  | 'Lifestyle';

export type ProductItem = {
  id: string;
  name: string;
  category: Exclude<ProductCategory, 'All'>;
  price: number;
  rating: number;
  stock: number;
  badge: string;
  aiMatch: number;
  description: string;
  gradient: string;
};

export const productCategories: ProductCategory[] = [
  'All',
  'Wearables',
  'Audio',
  'Smart Home',
  'Beauty Tech',
  'Mobility',
  'Lifestyle',
];

export const productCatalog: ProductItem[] = [
  {
    id: 'nx-watch-pro',
    name: 'NEXORA Pulse Watch Pro',
    category: 'Wearables',
    price: 349,
    rating: 4.8,
    stock: 18,
    badge: 'Best Seller',
    aiMatch: 98,
    description: 'Titanium frame smartwatch with adaptive coaching, biometric AI insights, and real-time habit scoring.',
    gradient: 'from-[#6E56F8] to-[#00D9C0]',
  },
  {
    id: 'nx-audio-halo',
    name: 'Halo Neural Headphones',
    category: 'Audio',
    price: 429,
    rating: 4.9,
    stock: 11,
    badge: 'Studio AI Sound',
    aiMatch: 97,
    description: 'Spatial audio headset with emotion-aware EQ, adaptive ANC, and voice-isolation assistant mode.',
    gradient: 'from-[#00D9C0] to-[#2CC7FF]',
  },
  {
    id: 'nx-vision-glass',
    name: 'Vision AR Commerce Glass',
    category: 'Wearables',
    price: 799,
    rating: 4.7,
    stock: 8,
    badge: 'Future Pick',
    aiMatch: 95,
    description: 'Ultra-light AR glasses that project AI product overlays and contextual shopping insights.',
    gradient: 'from-[#8893FF] to-[#6E56F8]',
  },
  {
    id: 'nx-mirror-skin',
    name: 'MirrorSkin AI Analyzer',
    category: 'Beauty Tech',
    price: 289,
    rating: 4.6,
    stock: 23,
    badge: 'AI Dermatology',
    aiMatch: 93,
    description: 'Smart mirror scanner with skin diagnostics, routine planning, and personalized product mapping.',
    gradient: 'from-[#6E56F8] to-[#FF7EC6]',
  },
  {
    id: 'nx-lumen-lamp',
    name: 'Lumen Sense Lamp',
    category: 'Smart Home',
    price: 159,
    rating: 4.5,
    stock: 41,
    badge: 'Ambient AI',
    aiMatch: 92,
    description: 'Adaptive home lighting that learns mood, circadian rhythm, and browsing behavior for comfort.',
    gradient: 'from-[#00D9C0] to-[#6E56F8]',
  },
  {
    id: 'nx-brew-core',
    name: 'BrewCore Precision Machine',
    category: 'Lifestyle',
    price: 519,
    rating: 4.8,
    stock: 9,
    badge: 'Premium Build',
    aiMatch: 96,
    description: 'Connected coffee system with taste learning, smart grinding profiles, and auto replenishment.',
    gradient: 'from-[#9D7BFF] to-[#00D9C0]',
  },
  {
    id: 'nx-desk-orbit',
    name: 'Orbit Workstation Dock',
    category: 'Smart Home',
    price: 239,
    rating: 4.4,
    stock: 34,
    badge: 'Creator Ready',
    aiMatch: 89,
    description: 'Minimal docking station with magnetic charging, AI posture alerts, and productivity scenes.',
    gradient: 'from-[#6E56F8] to-[#6A8CFF]',
  },
  {
    id: 'nx-scoot-neon',
    name: 'Neon Commute Scooter',
    category: 'Mobility',
    price: 1299,
    rating: 4.9,
    stock: 6,
    badge: 'Limited Drop',
    aiMatch: 94,
    description: 'Carbon frame e-scooter with route intelligence, theft prediction alerts, and battery analytics.',
    gradient: 'from-[#00D9C0] to-[#7DFFB7]',
  },
  {
    id: 'nx-ring-balance',
    name: 'Balance Focus Ring',
    category: 'Wearables',
    price: 129,
    rating: 4.5,
    stock: 56,
    badge: 'Affordable AI',
    aiMatch: 90,
    description: 'Minimal smart ring tracking stress, sleep, and focus cycles with personalized nudges.',
    gradient: 'from-[#7A66F8] to-[#00D9C0]',
  },
  {
    id: 'nx-pod-max',
    name: 'PodMax Travel Speaker',
    category: 'Audio',
    price: 219,
    rating: 4.7,
    stock: 29,
    badge: 'Travel Essential',
    aiMatch: 91,
    description: 'Portable speaker with adaptive bass mesh and AI scene-aware loudness balancing.',
    gradient: 'from-[#00D9C0] to-[#2E7CFF]',
  },
  {
    id: 'nx-fridge-core',
    name: 'FridgeCore Smart Hub',
    category: 'Smart Home',
    price: 699,
    rating: 4.6,
    stock: 12,
    badge: 'Family AI',
    aiMatch: 88,
    description: 'Kitchen management display with predictive grocery suggestions and personalized nutrition.',
    gradient: 'from-[#6E56F8] to-[#00D9C0]',
  },
  {
    id: 'nx-zen-chair',
    name: 'Zen Motion Chair',
    category: 'Lifestyle',
    price: 899,
    rating: 4.8,
    stock: 7,
    badge: 'Luxury Comfort',
    aiMatch: 95,
    description: 'Ergonomic lounge chair with pressure-adaptive posture support and relaxation sequencing.',
    gradient: 'from-[#765CF8] to-[#00B5D9]',
  },
];

export const aiPromptSuggestions = [
  'Find products for a premium remote-work setup under $800.',
  'Show me futuristic gifts for someone who loves AI gadgets.',
  'Recommend low-maintenance smart-home devices for apartments.',
  'I want luxury audio + wearable combo with max personalization.',
];
