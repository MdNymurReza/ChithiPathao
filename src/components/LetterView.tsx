import React from 'react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Letter {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: any;
  senderName?: string;
  receiverName?: string;
  senderAddress?: string;
  receiverAddress?: string;
  paperStyle?: string;
  waxSeal?: string;
  signature?: string;
}

const PAPER_STYLES: Record<string, string> = {
  'parchment': 'bg-[#f4ecd8] border-[#d4c5a1] text-[#5d4037]',
  'blue-lined': 'bg-white border-blue-100 text-blue-900 bg-[linear-gradient(transparent_95%,#e0e7ff_95%)] bg-[length:100%_2rem]',
  'floral': 'bg-[#fff9fb] border-pink-100 text-pink-900 card-cover-floral',
  'midnight': 'bg-[#1a1a2e] border-indigo-900 text-indigo-100',
};

const WAX_SEALS: Record<string, string> = {
  'heart': '❤️',
  'flower': '🌸',
  'dakghor': '📯',
  'star': '⭐',
};

export const LetterView: React.FC<{ letter: Letter }> = ({ letter }) => {
  const date = letter.createdAt?.toDate ? letter.createdAt.toDate() : new Date();
  const paperClass = letter.paperStyle ? PAPER_STYLES[letter.paperStyle] : 'bg-[#fdfbf7] border-[#e5e0d5]';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateY: -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
      className="max-w-3xl mx-auto perspective-1000"
    >
      <div className={`shadow-2xl rounded-sm p-8 md:p-20 relative overflow-hidden border transition-colors duration-700 ${paperClass}`}>
        {/* Paper texture effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
        {letter.paperStyle === 'floral' && <div className="floral-pattern-overlay" />}
        
        {/* Letter Content */}
        <div className="relative z-10 space-y-16">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-primary/10 pb-10">
            <div className="space-y-2">
              <p className="text-[10px] text-primary/40 uppercase tracking-[0.3em] font-bold font-display">তারিখ</p>
              <p className="text-xl font-display font-bold text-primary italic">{format(date, 'EEEE, dd MMMM, yyyy', { locale: bn })}</p>
            </div>
            <div className="text-right">
              <div className="stamp-effect opacity-60">ডাকঘর ২০২৪</div>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-sm font-serif italic">
            <div className="space-y-3">
              <p className="text-[10px] text-primary/40 uppercase tracking-[0.3em] font-bold font-display not-italic">প্রেরক</p>
              <p className="font-bold text-2xl text-primary">{letter.isAnonymous ? 'অজানা' : letter.senderName}</p>
              {letter.senderAddress && <p className="text-primary/60">{letter.senderAddress}</p>}
            </div>
            <div className="space-y-3 md:text-right">
              <p className="text-[10px] text-primary/40 uppercase tracking-[0.3em] font-bold font-display not-italic">প্রাপক</p>
              <p className="font-bold text-2xl text-primary">{letter.receiverName}</p>
              {letter.receiverAddress && <p className="text-primary/60">{letter.receiverAddress}</p>}
            </div>
          </div>

          {/* Body */}
          <div className="py-12 min-h-[500px] relative">
            <div 
              className="text-3xl leading-relaxed font-handwriting font-handwriting-bn opacity-90 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: letter.content }}
            />
            
            {/* Signature */}
            {letter.signature && (
              <div className="mt-12 flex justify-end">
                <div className="text-center">
                  <img src={letter.signature} alt="Signature" className="h-24 object-contain mix-blend-multiply opacity-80" />
                  <div className="w-32 h-px bg-primary/20 mt-1 mx-auto"></div>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-primary/40 mt-1">স্বাক্ষর</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-primary/10 text-center relative">
            <p className="text-primary/30 italic font-serif text-base">ডাকঘর - আপনার আবেগের ডিজিটাল ঠিকানা</p>
            
            {/* Wax Seal */}
            {letter.waxSeal && (
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 bg-accent rounded-full shadow-lg flex items-center justify-center text-3xl border-4 border-white/20">
                {WAX_SEALS[letter.waxSeal]}
              </div>
            )}
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-8 right-8 w-24 h-24 border-2 border-primary/10 rounded-sm flex items-center justify-center rotate-12 select-none">
          <div className="w-20 h-20 border border-primary/5 flex items-center justify-center">
             <span className="text-[8px] font-bold text-primary/10 text-center uppercase tracking-widest">Official<br/>Seal</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
