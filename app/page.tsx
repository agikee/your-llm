'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Compass, Settings2, Wrench, Sparkles, ArrowRight, Star, CheckCircle, Loader2 } from 'lucide-react';

// Fade up animation for sections
function FadeUp({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

// Email validation
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate email
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      // Log to console (can be replaced with actual API call or Supabase integration)
      console.log('Email capture:', {
        email,
        timestamp: new Date().toISOString(),
        source: 'homepage_cta',
      });

      // Simulate a brief delay for UX
      await new Promise(resolve => setTimeout(resolve, 500));

      setIsSuccess(true);
      setEmail('');
    } catch (err) {
      console.error('Email capture error:', err);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-deep-950 text-warm-100 grain relative overflow-hidden">
      {/* Ambient background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-warm-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] bg-sage-400/5 rounded-full blur-3xl" />
      </div>

      {/* Navigation */}
      <nav className="relative z-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4 sm:py-6 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <div className="flex items-center gap-3 sm:gap-6">
            <Link href="/discover" className="hidden sm:block text-sm text-deep-300 hover:text-warm-100 transition-colors">
              Discover
            </Link>
            <Link href="/compare" className="hidden sm:block text-sm text-deep-300 hover:text-warm-100 transition-colors">
              Compare
            </Link>
            <Link href="/dashboard" className="hidden sm:block text-sm text-deep-300 hover:text-warm-100 transition-colors">
              Dashboard
            </Link>
            <Link
              href="/discover"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-medium text-sm transition-all hover:shadow-lg hover:shadow-warm-500/25"
            >
              Start <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section id="main-content" className="relative z-10 px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 md:pt-32 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
            {/* Left: Text */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-serif font-semibold leading-tight mb-6 sm:mb-8">
                Know yourself
                <br />
                <span className="text-warm-500">better.</span>
              </h1>
              <p className="text-lg sm:text-xl md:text-2xl text-deep-300 leading-relaxed mb-8 sm:mb-10 max-w-xl">
                A 15-minute guided discovery that transforms how AI understands you. Build once, use everywhere.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/discover"
                  aria-label="Start your discovery journey"
                  className="inline-flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold text-base sm:text-lg transition-all hover:shadow-xl hover:shadow-warm-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Discovery
                </Link>
                <div className="flex items-center gap-2 justify-center sm:justify-start text-deep-400">
                  <div className="flex -space-x-2">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full bg-deep-700 border-2 border-deep-950 flex items-center justify-center text-xs text-warm-100">
                        {['S','M','A'][i-1]}
                      </div>
                    ))}
                  </div>
                  <span className="text-sm">2,000+ discovered</span>
                </div>
              </div>
            </motion.div>

            {/* Right: Visual */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative w-full aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-br from-warm-500/20 to-sage-400/10 rounded-3xl blur-2xl" />
                <div className="relative bg-deep-800/50 backdrop-blur-sm rounded-3xl border border-deep-700/50 p-8">
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-warm-500/20 flex items-center justify-center">
                        <Compass className="w-6 h-6 text-warm-500" />
                      </div>
                      <div>
                        <p className="font-serif text-lg">Compass</p>
                        <p className="text-sm text-deep-400">Values & Purpose</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-sage-400/20 flex items-center justify-center">
                        <Settings2 className="w-6 h-6 text-sage-400" />
                      </div>
                      <div>
                        <p className="font-serif text-lg">Engine</p>
                        <p className="text-sm text-deep-400">Passions & Motivation</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-warm-400/20 flex items-center justify-center">
                        <Wrench className="w-6 h-6 text-warm-400" />
                      </div>
                      <div>
                        <p className="font-serif text-lg">Toolkit</p>
                        <p className="text-sm text-deep-400">Strengths & Instincts</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-center mb-4 sm:mb-6">
              Transform your AI experience
            </h2>
            <p className="text-deep-300 text-center text-lg mb-12 sm:mb-16 max-w-2xl mx-auto">
              Stop starting from scratch with every AI conversation.
            </p>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { icon: '⏱️', title: '15-20 min discovery', desc: 'A guided conversation that uncovers your unique context through thoughtful questions.' },
              { icon: '🧩', title: 'Modular context', desc: 'Organized profiles across 3 dimensions that capture different aspects of who you are.' },
              { icon: '✨', title: 'Better AI responses', desc: 'Share your context with any AI and get responses that actually understand you.' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="group p-6 sm:p-8 rounded-2xl bg-deep-800/30 border border-deep-700/50 hover:border-warm-500/30 transition-all hover:-translate-y-1">
                  <div className="text-3xl sm:text-4xl mb-4 sm:mb-6">{item.icon}</div>
                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3">{item.title}</h3>
                  <p className="text-deep-400 text-sm sm:text-base leading-relaxed">{item.desc}</p>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <FadeUp>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-center mb-12 sm:mb-16">
              Loved by early explorers
            </h2>
          </FadeUp>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              { quote: "Finally, I can give AI real context about who I am instead of explaining myself over and over.", name: 'Sarah K.', role: 'Product Designer' },
              { quote: "The discovery questions made me think about things I'd never considered. It was like therapy meets AI.", name: 'Marcus J.', role: 'Startup Founder' },
              { quote: "I use my Your LLM context with Claude, ChatGPT, and even work tools. It's universal.", name: 'Alex T.', role: 'Engineering Lead' },
            ].map((item, i) => (
              <FadeUp key={i} delay={i * 0.1}>
                <div className="p-6 sm:p-8 rounded-2xl bg-deep-800/30 border border-deep-700/50">
                  <div className="flex gap-1 mb-4">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-4 h-4 sm:w-5 sm:h-5 text-warm-500 fill-warm-500" />)}
                  </div>
                  <p className="text-deep-300 mb-6 text-sm sm:text-base leading-relaxed">"{item.quote}"</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-deep-700 flex items-center justify-center text-sm font-medium">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-deep-400">{item.role}</p>
                    </div>
                  </div>
                </div>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA with Email Capture */}
      <section className="relative z-10 px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <FadeUp>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold mb-4 sm:mb-6 text-center">
              Ready to help AI
              <br />
              <span className="text-warm-500">help you better?</span>
            </h2>
            <p className="text-deep-300 text-lg mb-8 text-center">
              Start your discovery journey today.
            </p>

            {isSuccess ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-4"
              >
                <div className="flex items-center gap-3 text-sage-400">
                  <CheckCircle className="w-6 h-6" />
                  <span className="text-lg font-medium">Thanks! We'll be in touch.</span>
                </div>
                <Link
                  href="/discover"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-warm-500/30"
                >
                  <Sparkles className="w-5 h-5" />
                  Start Discovery Now
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleEmailSubmit} aria-label="Join waitlist" className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <div className="flex-1">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your email"
                    disabled={isSubmitting}
                    aria-label="Email address"
                    aria-describedby={error ? 'email-error' : undefined}
                    aria-invalid={!!error}
                    className="w-full px-6 py-4 rounded-full bg-deep-800/50 border border-deep-700/50 text-warm-100 placeholder:text-deep-500 focus:outline-none focus:ring-2 focus:ring-warm-500/50 disabled:opacity-50"
                  />
                  {error && (
                    <p id="email-error" role="alert" className="text-red-400 text-sm mt-2 text-center">{error}</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-warm-500 hover:bg-warm-400 text-deep-950 rounded-full font-semibold text-lg transition-all hover:shadow-xl hover:shadow-warm-500/30 disabled:opacity-80"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Joining...
                    </>
                  ) : (
                    'Join Waitlist'
                  )}
                </button>
              </form>
            )}

            <p className="text-deep-500 text-sm mt-6 text-center">
              Free to start • 15-20 minutes • Export anywhere
            </p>
          </FadeUp>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-deep-800 px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="text-lg font-serif font-semibold text-warm-100">
            Your LLM
          </Link>
          <p className="text-sm text-deep-500">
            © {new Date().getFullYear()} Your LLM. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
