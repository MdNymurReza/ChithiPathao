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
}

export const LetterView: React.FC<{ letter: Letter }> = ({ letter }) => {
  const date = letter.createdAt?.toDate ? letter.createdAt.toDate() : new Date();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95, rotateY: -20 }}
      animate={{ opacity: 1, scale: 1, rotateY: 0 }}
      transition={{ duration: 0.8, type: 'spring' }}
      className="max-w-3xl mx-auto perspective-1000"
    >
      <div className="bg-[#fdfbf7] shadow-2xl rounded-sm p-8 md:p-20 relative overflow-hidden border border-[#e5e0d5]">
        {/* Paper texture effect */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/paper-fibers.png")' }}></div>
        
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
          <div className="py-12 min-h-[500px]">
            <div 
              className="text-3xl leading-relaxed font-handwriting font-handwriting-bn text-ink opacity-90 prose prose-slate max-w-none"
              dangerouslySetInnerHTML={{ __html: letter.content }}
            />
          </div>

          {/* Footer */}
          <div className="pt-12 border-t border-primary/10 text-center">
            <p className="text-primary/30 italic font-serif text-base">ডাকঘর - আপনার আবেগের ডিজিটাল ঠিকানা</p>
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
