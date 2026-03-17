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
      <div className="bg-[#fdfbf7] shadow-2xl rounded-sm p-8 md:p-16 relative overflow-hidden border border-[#e5e0d5]">
        {/* Vintage Paper Texture Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/old-map.png')]"></div>
        
        {/* Letter Content */}
        <div className="relative z-10 space-y-12">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-[#5A5A40]/10 pb-8">
            <div className="space-y-1">
              <p className="text-xs text-[#5A5A40]/60 uppercase tracking-widest">তারিখ</p>
              <p className="text-lg font-medium">{format(date, 'EEEE, dd MMMM, yyyy', { locale: bn })}</p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-[#5A5A40]/20 select-none">ডাকঘর</p>
            </div>
          </div>

          {/* Addresses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm">
            <div className="space-y-2">
              <p className="text-xs text-[#5A5A40]/60 uppercase tracking-widest">প্রেরক</p>
              <p className="font-bold text-lg">{letter.isAnonymous ? 'অজানা' : letter.senderName}</p>
              {letter.senderAddress && <p className="text-[#5A5A40]/80 italic">{letter.senderAddress}</p>}
            </div>
            <div className="space-y-2 md:text-right">
              <p className="text-xs text-[#5A5A40]/60 uppercase tracking-widest">প্রাপক</p>
              <p className="font-bold text-lg">{letter.receiverName}</p>
              {letter.receiverAddress && <p className="text-[#5A5A40]/80 italic">{letter.receiverAddress}</p>}
            </div>
          </div>

          {/* Body */}
          <div className="py-8 min-h-[400px]">
            <p className="text-xl leading-relaxed whitespace-pre-wrap font-handwriting text-[#2c2c2c]">
              {letter.content}
            </p>
          </div>

          {/* Footer */}
          <div className="pt-8 border-t border-[#5A5A40]/10 text-center">
            <p className="text-[#5A5A40]/40 italic text-sm">ডাকঘর - আপনার আবেগের ডিজিটাল ঠিকানা</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 w-16 h-16 border-4 border-[#5A5A40]/10 rounded-full flex items-center justify-center rotate-12 select-none">
          <span className="text-[10px] font-bold text-[#5A5A40]/20 text-center uppercase">Verified<br/>DakGhor</span>
        </div>
      </div>
    </motion.div>
  );
};
