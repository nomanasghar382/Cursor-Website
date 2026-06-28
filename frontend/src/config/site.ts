export const siteConfig = {
  name: "NOVAEX",
  legalName: "NOVAEX AI Commerce",
  description:
    "The AI-native enterprise commerce platform for robotics, smart home, wearables, and immersive experiences.",
  tagline: "Commerce intelligence, reimagined.",
  url: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1",
  ogImage: "/og/novaex-default.jpg",
  links: {
    twitter: "https://twitter.com/novaex",
    github: "https://github.com/nomanasghar382/Cursor-Website",
    docs: "/docs",
  },
  contact: {
    email: "hello@novaex.ai",
    support: "support@novaex.ai",
  },
} as const;
