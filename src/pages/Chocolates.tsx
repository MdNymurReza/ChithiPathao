import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Heart, Gift, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export const Chocolates: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch letters with chocolates where user is sender or receiver
    const q = query(
      collection(db, 'letters'),
      where('chocolateAmount', '>', 0)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter((l: any) => l.senderId === user.uid || l.receiverId === user.uid)
        .sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });
      
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="bg-primary rounded-none p-12 md:p-20 text-white shadow-2xl relative overflow-hidden border-8 border-double border-white/10 m-2">
          {/* Floating Hearts Animation */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {[...Array(10)].map((_, i) => (
              <div
                key={i}
                className="absolute animate-float-heart opacity-0"
                style={{
                  left: `${Math.random() * 100}%`,
                  bottom: `-20px`,
                  animationDelay: `${Math.random() * 4}s`,
                  color: i % 2 === 0 ? '#e63946' : '#ffb3c1'
                }}
              >
                <Heart size={24 + Math.random() * 24} fill="currentColor" />
              </div>
            ))}
          </div>

          <div className="relative z-10 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <p className="text-white/40 text-xs uppercase tracking-[0.4em] font-bold font-display">ভালোবাসার অমূল্য সঞ্চয়</p>
              <div className="flex flex-col md:flex-row items-center md:items-end gap-6 justify-center md:justify-start">
                <h1 className="text-9xl font-display font-bold tracking-tighter italic drop-shadow-lg">
                  {profile?.chocolateBalance || 0}
                </h1>
                <div className="mb-6 space-y-1">
                  <span className="text-3xl opacity-60 font-serif italic block">টি ভালোবাসার উপহার</span>
                  <p className="text-white/30 text-sm font-serif italic">আপনার হৃদয়ের মণিকোঠায় জমা আছে</p>
                </div>
              </div>
            </motion.div>
          </div>
          <Heart className="absolute -right-16 -bottom-16 w-96 h-96 text-white/5 rotate-12" fill="currentColor" />
        </div>

        <div className="space-y-10">
          <div className="flex items-center justify-between border-b border-primary/10 pb-8">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold text-primary italic">উপহারের স্মৃতিচারণ</h2>
              <p className="text-primary/40 font-serif italic">প্রতিটি উপহার একটি সুন্দর গল্পের শুরু...</p>
            </div>
            <Gift className="text-primary/10" size={56} />
          </div>

          <div className="card-nostalgic !p-0 overflow-hidden border-primary/5">
            {transactions.length === 0 ? (
              <div className="p-24 text-center space-y-6">
                <Heart className="mx-auto text-primary/10" size={64} />
                <div className="text-primary/40 italic font-serif text-2xl">
                  এখনো কোনো উপহারের স্মৃতি জমা হয়নি...
                </div>
                <p className="text-primary/30 font-serif italic">প্রিয়জনকে চিঠি পাঠিয়ে ভালোবাসার বিনিময় শুরু করুন।</p>
              </div>
            ) : (
              <div className="divide-y divide-primary/5">
                {transactions.map((t, index) => (
                  <motion.div 
                    key={t.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-10 flex items-center justify-between hover:bg-primary/[0.02] transition-all group"
                  >
                    <div className="flex items-center gap-8">
                      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-transform group-hover:scale-110 ${
                        t.senderId === user?.uid ? 'bg-accent/5 border-accent/20 text-accent' : 'bg-primary/5 border-primary/20 text-primary'
                      }`}>
                        {t.senderId === user?.uid ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                      </div>
                      <div>
                        <p className="font-display font-bold text-2xl text-primary italic">
                          {t.senderId === user?.uid ? 'ভালোবাসা পাঠানো হয়েছে' : 'ভালোবাসা প্রাপ্তি'}
                        </p>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="text-xs text-primary/40 uppercase tracking-[0.2em] font-bold">
                            {format(t.createdAt?.toDate() || new Date(), 'dd MMMM, yyyy', { locale: bn })}
                          </p>
                          <span className="w-1 h-1 bg-primary/20 rounded-full"></span>
                          <p className="text-xs text-primary/30 italic font-serif">একটি মিষ্টি মুহূর্ত</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-right space-y-3">
                      <div className="flex items-center justify-end gap-3">
                        <Heart size={16} className={t.senderId === user?.uid ? 'text-accent/40' : 'text-primary/40'} fill="currentColor" />
                        <p className={`text-4xl font-display font-bold italic ${
                          t.senderId === user?.uid ? 'text-accent' : 'text-primary'
                        }`}>
                          {t.senderId === user?.uid ? '-' : '+'}{t.chocolateAmount}
                        </p>
                      </div>
                      <p className={`text-[10px] uppercase font-bold px-4 py-1.5 tracking-[0.2em] border ${
                        t.chocolateStatus === 'accepted' ? 'bg-primary/5 text-primary border-primary/20' : 
                        t.chocolateStatus === 'rejected' ? 'bg-accent/5 text-accent border-accent/20' : 'bg-paper border-primary/10 text-primary/40'
                      }`}>
                        {t.chocolateStatus === 'accepted' ? 'গৃহীত' : 
                         t.chocolateStatus === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
