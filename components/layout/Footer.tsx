'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();
  
  // Don't show footer on discover page (immersive mode)
  if (pathname === '/discover') return null;

  return (
    <footer className="bg-deep-950 border-t border-deep-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-serif font-semibold text-warm-100">
              Your LLM
            </Link>
            <p className="mt-4 text-sm text-deep-400 leading-relaxed">
              Know yourself better.<br />Help AI help you better.
            </p>
          </div>

          {/* Product */}
          <div>
            <h3 className="text-sm font-semibold text-warm-100 mb-4">Product</h3>
            <ul className="space-y-3">
              <li><Link href="/discover" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">Discover</Link></li>
              <li><Link href="#how-it-works" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">How it Works</Link></li>
              <li><Link href="#pricing" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-warm-100 mb-4">Company</h3>
            <ul className="space-y-3">
              <li><Link href="/about" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">About</Link></li>
              <li><Link href="/blog" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">Blog</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-sm font-semibold text-warm-100 mb-4">Legal</h3>
            <ul className="space-y-3">
              <li><Link href="/privacy" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">Privacy</Link></li>
              <li><Link href="/terms" className="text-sm text-deep-400 hover:text-warm-300 transition-colors">Terms</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-deep-800">
          <p className="text-center text-sm text-deep-500">
            © {new Date().getFullYear()} Your LLM. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
