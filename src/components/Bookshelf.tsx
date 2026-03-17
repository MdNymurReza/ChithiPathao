import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Heart, Mail, Flower2 } from 'lucide-react';
import { bn } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

interface Letter {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  preview: string;
  isAnonymous: boolean;
  createdAt: any;
  deliveryTime?: any;
  status: string;
  senderName?: string;
}

interface BookshelfProps {
  letters: Letter[];
  title: string;
}

export const Bookshelf: React.FC<BookshelfProps> = ({ letters, title }) => {
  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        <div className="flex-1 h-px bg-slate-200"></div>
      </div>

      {letters.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <p className="text-slate-400 italic">এখানে কোনো চিঠি নেই...</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-y-10 gap-x-6">
          {letters.map((letter, index) => (
            <LetterCard key={letter.id} letter={letter} index={index} />
          ))}
        </div>
      )}
    </div>
  );
};

const LetterCard: React.FC<{ letter: Letter; index: number }> = ({ letter, index }) => {
  const { user } = useAuth();
  const date = letter.createdAt?.toDate ? letter.createdAt.toDate() : new Date();
  const deliveryTime = letter.deliveryTime?.toMillis ? letter.deliveryTime.toMillis() : 0;
  const isInTransit = deliveryTime > Date.now();
  const isReceived = letter.receiverId === user?.uid;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={!isInTransit ? { y: -8, rotate: index % 2 === 0 ? 1 : -1 } : {}}
      className={`relative group ${isInTransit ? 'cursor-not-allowed opacity-70' : ''}`}
    >
      <Link to={isInTransit ? '#' : `/letter/${letter.id}`} className={`block ${isInTransit ? 'pointer-events-none' : ''}`}>
        <div className={`aspect-[3/4] rounded-sm shadow-lg border p-6 flex flex-col justify-between transition-all group-hover:shadow-2xl group-hover:border-primary/20 relative overflow-hidden ${
          isReceived && !isInTransit ? 'card-cover-floral border-accent/20' : 'bg-[#fdfbf7] border-[#e5e0d5]'
        }`}>
          {/* Floral Pattern Overlay for Received Letters */}
          {isReceived && !isInTransit && <div className="floral-pattern-overlay" />}
          
          {/* Envelope flap effect */}
          <div className={`absolute top-0 left-0 w-full h-1 ${
            isReceived && !isInTransit ? 'bg-gradient-to-r from-accent/40 via-accent/20 to-accent/40' : 'bg-gradient-to-r from-accent/20 via-primary/10 to-accent/20'
          }`}></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <p className={`text-[10px] uppercase tracking-[0.2em] font-bold font-display ${
                isReceived && !isInTransit ? 'text-accent/60' : 'text-primary/40'
              }`}>
                {format(date, 'dd MMM, yyyy', { locale: bn })}
              </p>
              {isReceived && !isInTransit ? (
                <Flower2 size={16} className="text-accent/30 animate-pulse" />
              ) : (
                <Mail size={16} className={isInTransit ? "text-accent animate-post-pulse" : "text-primary/10"} />
              )}
            </div>
            <h3 className={`text-xl font-display font-bold leading-tight line-clamp-2 italic ${
              isReceived && !isInTransit ? 'text-accent' : 'text-primary'
            }`}>
              {letter.isAnonymous ? 'অজানা' : (letter.senderName || 'প্রেরক')}
            </h3>
          </div>
          
          <div className="mt-4 flex-1">
            <p className={`text-sm line-clamp-4 leading-relaxed italic font-serif ${
              isReceived && !isInTransit ? 'text-accent/70' : 'text-primary/60'
            }`}>
              {isInTransit ? "চিঠিটি গন্তব্যের পথে রয়েছে। এটি পৌঁছাতে কিছুক্ষণ সময় লাগবে..." : `"${letter.preview}..."`}
            </p>
          </div>

          <div className="mt-auto pt-6 flex justify-between items-center border-t border-primary/5">
             <span className={`text-[9px] font-bold px-2 py-1 rounded-none uppercase tracking-[0.15em] font-display ${
               isInTransit ? 'bg-accent/10 text-accent' : (letter.status === 'delivered' ? 'bg-primary/5 text-primary/60' : 'bg-accent/5 text-accent/60')
             }`}>
               {isInTransit ? 'পথে আছে' : (letter.status === 'delivered' ? 'পৌঁছেছে' : 'পাঠানো হয়েছে')}
             </span>
             {letter.chocolateAmount > 0 && (
               <div className="flex items-center gap-1.5 text-accent">
                 <Heart size={12} fill="currentColor" />
                 <span className="text-[11px] font-bold font-display">{letter.chocolateAmount}</span>
               </div>
             )}
          </div>

          {/* Stamp area */}
          <div className="absolute top-4 right-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <div className={`w-10 h-12 border-2 rounded-sm flex items-center justify-center ${
              isReceived && !isInTransit ? 'border-accent' : 'border-primary'
            }`}>
              <div className={`w-8 h-10 border ${
                isReceived && !isInTransit ? 'border-accent/50' : 'border-primary/50'
              }`}></div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};
