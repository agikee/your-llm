'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const pathname = usePathname();
  
  // Don't show header on discover page (immersive mode)
  if (pathname === '/discover') return null;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-deep-950/80 backdrop-blur-md border-b border-deep-800/50">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-xl md:text-2xl font-serif font-semibold text-warm-100 group-hover:text-warm-300 transition-colors">
              Your LLM
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link 
              href="/discover" 
              className="text-deep-300 hover:text-warm-100 transition-colors text-sm font-medium"
            >
              Discover
            </Link>
            <Link 
              href="#how-it-works" 
              className="text-deep-300 hover:text-warm-100 transition-colors text-sm font-medium"
            >
              How it Works
            </Link>
            <Link 
              href="#testimonials" 
              className="text-deep-300 hover:text-warm-100 transition-colors text-sm font-medium"
            >
              Stories
            </Link>
          </div>

          {/* CTA Button */}
          <div className="flex items-center gap-4">
            <Link
              href="/discover"
              className="inline-flex items-center justify-center rounded-full bg-warm-500 hover:bg-warm-400 text-deep-950 font-semibold text-sm md:text-base px-4 md:px-6 py-2 md:py-2.5 transition-all hover:shadow-lg hover:shadow-warm-500/25"
            >
              Start Discovery
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
