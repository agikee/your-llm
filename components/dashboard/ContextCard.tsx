'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Edit3, 
  Copy, 
  Share2, 
  Trash2, 
  Check, 
  X, 
  FileText,
  MessageSquare,
  Briefcase,
  Target
} from 'lucide-react';

interface ContextCardProps {
  context: {
    id: string;
    name: string;
    comprehensive: string;
    modules: {
      communication: string;
      expertise: string;
      goals: string;
    };
    createdAt: string;
    lastUsed?: string;
  };
  onEdit: () => void;
  onCopy: () => void;
  onShare: () => void;
  onDelete: () => void;
}

type TabType = 'comprehensive' | 'communication' | 'expertise' | 'goals';

const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'comprehensive', label: 'Full Context', icon: <FileText className="w-4 h-4" /> },
  { id: 'communication', label: 'Communication', icon: <MessageSquare className="w-4 h-4" /> },
  { id: 'expertise', label: 'Expertise', icon: <Briefcase className="w-4 h-4" /> },
  { id: 'goals', label: 'Goals', icon: <Target className="w-4 h-4" /> },
];

export function ContextCard({ context, onEdit, onCopy, onShare, onDelete }: ContextCardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('comprehensive');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(context.comprehensive);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const content = activeTab === 'comprehensive' 
      ? context.comprehensive 
      : context.modules[activeTab];
    await navigator.clipboard.writeText(content);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
    onEdit();
  };

  const handleCancel = () => {
    setEditedContent(context.comprehensive);
    setIsEditing(false);
  };

  const getDisplayContent = () => {
    if (activeTab === 'comprehensive') {
      return isEditing ? editedContent : context.comprehensive;
    }
    return context.modules[activeTab];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-deep-800/30 border border-deep-700/50 rounded-2xl overflow-hidden hover:border-warm-500/20 transition-all"
    >
      {/* Header */}
      <div className="p-6 border-b border-deep-700/50">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-warm-100 font-serif">{context.name}</h2>
            <p className="text-sm text-deep-400 mt-1">
              Created {new Date(context.createdAt).toLocaleDateString()}
              {context.lastUsed && ` · Last used ${new Date(context.lastUsed).toLocaleDateString()}`}
            </p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-lg bg-deep-700/50 hover:bg-deep-700 text-deep-300 hover:text-warm-100 transition-colors"
              title="Edit"
            >
              <Edit3 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCopy}
              className="p-2 rounded-lg bg-deep-700/50 hover:bg-deep-700 text-deep-300 hover:text-warm-100 transition-colors"
              title="Copy"
            >
              {copied ? <Check className="w-4 h-4 text-sage-400" /> : <Copy className="w-4 h-4" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onShare}
              className="p-2 rounded-lg bg-deep-700/50 hover:bg-deep-700 text-deep-300 hover:text-warm-100 transition-colors"
              title="Share"
            >
              <Share2 className="w-4 h-4" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onDelete}
              className="p-2 rounded-lg bg-deep-700/50 hover:bg-red-500/20 text-deep-300 hover:text-red-400 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-2 px-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isEditing && tab.id !== 'comprehensive'}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-warm-500/20 text-warm-400 border border-warm-500/30'
                  : 'text-deep-400 hover:text-warm-100 hover:bg-deep-700/50'
              } ${(isEditing && tab.id !== 'comprehensive') ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          {isEditing && activeTab === 'comprehensive' ? (
            <motion.div
              key="editing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-64 bg-deep-900/50 border border-deep-700/50 rounded-xl p-4 text-warm-100 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-warm-500/50 resize-none"
                placeholder="Edit your context..."
              />
              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-deep-700/50 text-deep-300 hover:text-warm-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-warm-500 text-deep-950 font-medium hover:bg-warm-400 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  Save Changes
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-warm-500/5 blur-3xl rounded-full scale-150 opacity-50" />
              <p className="relative text-warm-100/90 leading-relaxed text-sm sm:text-base">
                {getDisplayContent()}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

export default ContextCard;
