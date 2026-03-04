/**
 * Site Configuration
 * 
 * Centralized site-wide configuration and branding
 */

export const siteConfig = {
  name: 'Your LLM',
  description: 'Transform scattered self-knowledge into structured AI context. Generate personalized profiles that make every AI interaction more relevant and valuable.',
  tagline: 'Know yourself better. Help AI help you better.',
  url: process.env.NEXT_PUBLIC_APP_URL || 'https://yourllm.com',
  
  // Social links
  links: {
    twitter: 'https://twitter.com/yourllm',
    github: 'https://github.com/yourllm',
  },
  
  // Feature flags
  features: {
    discoveryFlow: true,
    beforeAfterComparison: true,
    socialSharing: true,
    contextExport: true,
  },
  
  // Discovery dimensions (ordered)
  dimensions: [
    {
      id: 'personality' as const,
      name: 'Personality & Communication',
      description: 'Your communication style, preferences, and how you think',
      order: 1,
    },
    {
      id: 'expertise' as const,
      name: 'Expertise & Knowledge',
      description: 'Your skills, experience, and areas of expertise',
      order: 2,
    },
    {
      id: 'goals' as const,
      name: 'Goals & Values',
      description: 'What you\'re working toward and what matters to you',
      order: 3,
    },
  ],
  
  // Pricing
  pricing: {
    freeUses: 3,
    price: 29,
    currency: 'USD',
  },
  
  // OG images
  ogImage: {
    default: '/images/og-default.png',
    discovery: '/images/og-discovery.png',
    results: '/images/og-results.png',
  },
  
  // Creator
  creator: 'Your LLM Team',
  
  // Navigation
  mainNav: [
    {
      title: 'Discover',
      href: '/discover',
    },
    {
      title: 'Dashboard',
      href: '/dashboard',
    },
    {
      title: 'Compare',
      href: '/compare',
    },
  ],
  
  // Footer links
  footerNav: {
    product: [
      { title: 'Features', href: '#features' },
      { title: 'Pricing', href: '#pricing' },
      { title: 'How it Works', href: '#how-it-works' },
    ],
    company: [
      { title: 'About', href: '/about' },
      { title: 'Blog', href: '/blog' },
      { title: 'Careers', href: '/careers' },
    ],
    legal: [
      { title: 'Privacy', href: '/privacy' },
      { title: 'Terms', href: '/terms' },
    ],
  },
} as const;

export type SiteConfig = typeof siteConfig;
