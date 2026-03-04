'use client';

import { useRef, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { toPng } from 'html-to-image';
import { Copy, Download, Twitter, Linkedin, Check, Share2, Sparkles } from 'lucide-react';
import type { ContextModules } from '@/lib/ai/context-generator';

interface ShareCardProps {
  name?: string;
  archetype: string;
  traits: string[];
  discoveryData: {
    compass: { value: string };
    engine: { beautifulProblem: string };
    toolkit: { instinct: string };
  };
  contextModules: ContextModules;
}

// Archetype mappings based on discovery patterns
function deriveArchetype(discoveryData: ShareCardProps['discoveryData']): string {
  const { compass, engine, toolkit } = discoveryData;
  
  // Simple heuristic-based archetype derivation
  const text = `${compass.value} ${engine.beautifulProblem} ${toolkit.instinct}`.toLowerCase();
  
  if (text.includes('bridge') || text.includes('connect') || text.includes('relation')) {
    return 'The Bridge Builder';
  }
  if (text.includes('build') || text.includes('create') || text.includes('make')) {
    return 'The Visionary Maker';
  }
  if (text.includes('help') || text.includes('support') || text.includes('guide')) {
    return 'The Compassionate Guide';
  }
  if (text.includes('learn') || text.includes('teach') || text.includes('share')) {
    return 'The Knowledge Sharer';
  }
  if (text.includes('lead') || text.includes('inspire') || text.includes('empower')) {
    return 'The Purposeful Leader';
  }
  if (text.includes('solve') || text.includes('problem') || text.includes('figure')) {
    return 'The Creative Solver';
  }
  if (text.includes('grow') || text.includes('improve') || text.includes('develop')) {
    return 'The Growth Catalyst';
  }
  if (text.includes('design') || text.includes('craft') || text.includes('beautiful')) {
    return 'The Design Thinker';
  }
  
  return 'The Purposeful Explorer';
}

// Derive 3 key traits from discovery data
function deriveTraits(discoveryData: ShareCardProps['discoveryData']): string[] {
  const { compass, engine, toolkit } = discoveryData;
  const traits: string[] = [];
  
  const compassText = compass.value.toLowerCase();
  const engineText = engine.beautifulProblem.toLowerCase();
  const toolkitText = toolkit.instinct.toLowerCase();
  
  // Compass-based traits (values)
  if (compassText.includes('impact') || compassText.includes('change')) {
    traits.push('Impact-Driven');
  } else if (compassText.includes('people') || compassText.includes('help')) {
    traits.push('People-Centric');
  } else if (compassText.includes('truth') || compassText.includes('understand')) {
    traits.push('Truth-Seeker');
  } else {
    traits.push('Purpose-Led');
  }
  
  // Engine-based traits (passions)
  if (engineText.includes('create') || engineText.includes('build')) {
    traits.push('Creative Builder');
  } else if (engineText.includes('connect') || engineText.includes('bring')) {
    traits.push('Natural Connector');
  } else if (engineText.includes('learn') || engineText.includes('discover')) {
    traits.push('Curious Explorer');
  } else {
    traits.push('Passionate Visionary');
  }
  
  // Toolkit-based traits (strengths)
  if (toolkitText.includes('think') || toolkitText.includes('analy')) {
    traits.push('Strategic Thinker');
  } else if (toolkitText.includes('feel') || toolkitText.includes('empath')) {
    traits.push('Empathetic Soul');
  } else if (toolkitText.includes('do') || toolkitText.includes('act')) {
    traits.push('Action-Oriented');
  } else {
    traits.push('Intuitive Mind');
  }
  
  return traits;
}

// Progress calculation (simplified - based on presence of data)
function calculateProgress(discoveryData: ShareCardProps['discoveryData']): {
  compass: number;
  engine: number;
  toolkit: number;
} {
  return {
    compass: discoveryData.compass?.value ? 100 : 0,
    engine: discoveryData.engine?.beautifulProblem ? 100 : 0,
    toolkit: discoveryData.toolkit?.instinct ? 100 : 0,
  };
}

function ProgressBar({ label, progress, color }: { label: string; progress: number; color: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-warm-200/80 uppercase tracking-wider">{label}</span>
        <span className="text-xs font-semibold text-warm-400">{progress}%</span>
      </div>
      <div className="h-2 bg-deep-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.5 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function ShareButton({ 
  icon: Icon, 
  label, 
  onClick, 
  success = false,
  variant = 'default'
}: { 
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  success?: boolean;
  variant?: 'default' | 'primary';
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
        success
          ? 'bg-sage-500/20 text-sage-400 border border-sage-500/30'
          : variant === 'primary'
          ? 'bg-warm-500 text-deep-950 hover:bg-warm-400 shadow-lg shadow-warm-500/25'
          : 'bg-deep-800/50 text-warm-300 border border-deep-700/50 hover:border-warm-500/30 hover:text-warm-200'
      }`}
    >
      {success ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
      {success ? 'Copied!' : label}
    </motion.button>
  );
}

export default function ShareCard({ 
  name = 'Explorer',
  archetype: providedArchetype,
  traits: providedTraits,
  discoveryData,
  contextModules 
}: ShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  // Derive archetype and traits if not provided
  const archetype = providedArchetype || deriveArchetype(discoveryData);
  const traits = providedTraits.length > 0 ? providedTraits : deriveTraits(discoveryData);
  const progress = calculateProgress(discoveryData);

  // Generate shareable text
  const shareableText = `I discovered my AI personality type: "${archetype}"

${traits.map(t => `✦ ${t}`).join('\n')}

Take the discovery journey at Your LLM and find out what makes you uniquely you.`;

  const handleCopyCard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(shareableText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  }, [shareableText]);

  const handleDownloadImage = useCallback(async () => {
    if (!cardRef.current || downloading) return;
    
    setDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, {
        quality: 1,
        pixelRatio: 2,
        cacheBust: true,
      });
      
      const link = document.createElement('a');
      link.download = `your-llm-${archetype.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Image generation failed:', err);
    }
    setDownloading(false);
  }, [archetype, downloading]);

  const handleTwitterShare = useCallback(() => {
    const text = encodeURIComponent(shareableText);
    const url = encodeURIComponent('https://yourllm.ai/discover');
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
  }, [shareableText]);

  const handleLinkedInShare = useCallback(() => {
    const url = encodeURIComponent('https://yourllm.ai/discover');
    const title = encodeURIComponent(`My AI Personality: ${archetype}`);
    const summary = encodeURIComponent(traits.join(' • '));
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, '_blank');
  }, [archetype, traits]);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Shareable Card - 4:5 aspect ratio */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-deep-900 via-deep-950 to-deep-900 rounded-3xl overflow-hidden"
        style={{ aspectRatio: '4/5' }}
      >
        {/* Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Warm amber glow - top left */}
          <div className="absolute -top-32 -left-32 w-80 h-80 bg-warm-500/20 rounded-full blur-3xl" />
          {/* Subtle glow - bottom right */}
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-warm-600/10 rounded-full blur-3xl" />
          {/* Grid pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: `linear-gradient(warm-500 1px, transparent 1px), linear-gradient(90deg, warm-500 1px, transparent 1px)`,
              backgroundSize: '40px 40px'
            }}
          />
        </div>

        {/* Border glow effect */}
        <div className="absolute inset-0 rounded-3xl border border-warm-500/20" />
        <div className="absolute inset-0 rounded-3xl shadow-[inset_0_1px_0_0_rgba(251,191,36,0.1)]" />

        {/* Content */}
        <div className="relative h-full flex flex-col p-8">
          {/* Header with branding */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-warm-500 to-warm-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-deep-950" />
              </div>
              <span className="text-warm-200 font-serif font-semibold text-lg">Your LLM</span>
            </div>
            <div className="text-xs text-deep-500 uppercase tracking-wider">Discovery</div>
          </div>

          {/* Main content - centered and flexible */}
          <div className="flex-1 flex flex-col justify-center">
            {/* Name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-warm-400 text-sm uppercase tracking-wider mb-2"
            >
              {name}
            </motion.p>

            {/* Archetype - main headline */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-4xl sm:text-5xl font-serif font-bold text-warm-100 mb-6 leading-tight"
            >
              {archetype}
            </motion.h1>

            {/* Traits */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-3 mb-8"
            >
              {traits.map((trait, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-warm-500" />
                  <span className="text-warm-200 text-lg font-medium">{trait}</span>
                </div>
              ))}
            </motion.div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-deep-900/50 rounded-2xl p-4 border border-deep-700/30"
            >
              <div className="text-xs text-deep-400 uppercase tracking-wider mb-3">Discovery Progress</div>
              <ProgressBar label="Compass" progress={progress.compass} color="bg-gradient-to-r from-warm-600 to-warm-500" />
              <ProgressBar label="Engine" progress={progress.engine} color="bg-gradient-to-r from-warm-500 to-amber-400" />
              <ProgressBar label="Toolkit" progress={progress.toolkit} color="bg-gradient-to-r from-amber-400 to-yellow-300" />
            </motion.div>
          </div>

          {/* Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-6 pt-4 border-t border-deep-700/30"
          >
            <p className="text-center text-deep-500 text-xs">
              Discover your AI personality at yourllm.ai
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Share Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-6 space-y-4"
      >
        {/* Primary Actions */}
        <div className="flex gap-3">
          <ShareButton
            icon={Copy}
            label="Copy Card"
            onClick={handleCopyCard}
            success={copied}
          />
          <ShareButton
            icon={Download}
            label={downloading ? 'Downloading...' : 'Download Image'}
            onClick={handleDownloadImage}
          />
        </div>

        {/* Social Share */}
        <div className="flex gap-3">
          <ShareButton
            icon={Twitter}
            label="Share on X"
            onClick={handleTwitterShare}
          />
          <ShareButton
            icon={Linkedin}
            label="Share on LinkedIn"
            onClick={handleLinkedInShare}
          />
        </div>
      </motion.div>
    </div>
  );
}
