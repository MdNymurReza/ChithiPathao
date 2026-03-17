import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Letter {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  preview: string;
  isAnonymous: boolean;
  createdAt: any;
  status: string;
  senderName?: string;
}

interface BookshelfProps {
  letters: Letter[];
  title: string;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ letters, title }) => {
  return (
    <div className="space-y-10">
      <div className="flex items-center gap-6">
        <h2 className="text-3xl font-display font-bold text-primary">{title}</h2>
        <div className="flex-1 h-[2px] bg-primary/10 rounded-full"></div>
      </div>

      {letters.length === 0 ? (
        <div className="bg-white/40 border-2 border-dashed border-primary/10 rounded-[40px] p-16 text-center">
          <p className="text-primary/40 italic font-serif text-lg">এখানে কোনো চিঠি নেই...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-16 gap-x-8">
          {letters.map((letter, index) => (
            <LetterCard key={letter.id} letter={letter} index={index} />
          ))}
        </div>
      )}
      
      {/* Shelf line */}
      <div className="w-full h-6 bg-primary/5 rounded-full shadow-inner mt-6 border-b-4 border-primary/10"></div>
    </div>
  );
};

const LetterCard: React.FC<{ letter: Letter; index: number }> = ({ letter, index }) => {
  const date = letter.createdAt?.toDate ? letter.createdAt.toDate() : new Date();
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ y: -12 }}
      className="relative group"
    >
      <Link to={`/letter/${letter.id}`} className="block">
        <div className="aspect-[3/4] bg-white rounded-r-2xl shadow-xl border-l-[6px] border-primary p-6 flex flex-col justify-between transition-all group-hover:shadow-2xl relative overflow-hidden">
          {/* Book Spine effect */}
          <div className="absolute left-0 top-0 bottom-0 w-2 bg-black/5"></div>
          
          <div className="space-y-3">
            <p className="text-[10px] uppercase tracking-[0.2em] text-primary/40 font-bold">
              {format(date, 'dd MMMM, yyyy', { locale: bn })}
            </p>
            <h3 className="text-xl font-display font-bold leading-tight line-clamp-2 text-primary">
              {letter.isAnonymous ? 'অজানা' : (letter.senderName || 'প্রেরক')}
            </h3>
          </div>
          
          <div className="mt-6">
            <p className="text-sm text-primary/60 italic line-clamp-3 leading-relaxed font-serif">
              "{letter.preview}..."
            </p>
          </div>

          <div className="mt-auto pt-6 border-t border-primary/5 flex justify-between items-center">
             <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
               letter.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-accent/10 text-accent'
             }`}>
               {letter.status === 'delivered' ? 'পৌঁছেছে' : 'পাঠানো হয়েছে'}
             </span>
             <div className="w-6 h-6 rounded-full border-2 border-primary/10 flex items-center justify-center">
               <div className="w-1.5 h-1.5 rounded-full bg-primary/20"></div>
             </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
