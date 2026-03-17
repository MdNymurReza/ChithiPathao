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
      where('chocolateAmount', '>', 0),
      orderBy('chocolateAmount', 'desc') // Note: Firestore requires index for multiple fields, but let's try simple first
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id }))
        .filter((l: any) => l.senderId === user.uid || l.receiverId === user.uid);
      
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-pink-500 to-rose-600 rounded-[40px] p-8 md:p-12 text-white shadow-xl relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-pink-100 text-sm uppercase tracking-widest font-bold mb-2">আপনার মোট ব্যালেন্স</p>
            <div className="flex items-end gap-4">
              <h1 className="text-6xl font-bold">{profile?.chocolateBalance || 0}</h1>
              <span className="text-2xl mb-2 opacity-80">টি চকলেট</span>
            </div>
          </div>
          <Heart className="absolute -right-8 -bottom-8 w-64 h-64 text-white/10 rotate-12" fill="currentColor" />
        </div>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-[#5A5A40]">লেনদেনের ইতিহাস</h2>
            <Gift className="text-[#5A5A40]/20" size={32} />
          </div>

          <div className="bg-white rounded-[32px] shadow-sm border border-[#5A5A40]/10 overflow-hidden">
            {transactions.length === 0 ? (
              <div className="p-12 text-center text-[#5A5A40]/40 italic">
                এখনো কোনো চকলেটের লেনদেন হয়নি...
              </div>
            ) : (
              <div className="divide-y divide-[#5A5A40]/5">
                {transactions.map((t) => (
                  <div key={t.id} className="p-6 flex items-center justify-between hover:bg-[#f5f5f0]/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                        t.senderId === user?.uid ? 'bg-amber-50 text-amber-600' : 'bg-green-50 text-green-600'
                      }`}>
                        {t.senderId === user?.uid ? <ArrowUpRight size={24} /> : <ArrowDownLeft size={24} />}
                      </div>
                      <div>
                        <p className="font-bold text-[#1a1a1a]">
                          {t.senderId === user?.uid ? 'চকলেট পাঠানো হয়েছে' : 'চকলেট প্রাপ্তি'}
                        </p>
                        <p className="text-xs text-[#5A5A40]/60">
                          {format(t.createdAt?.toDate() || new Date(), 'dd MMMM, yyyy', { locale: bn })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        t.senderId === user?.uid ? 'text-amber-600' : 'text-green-600'
                      }`}>
                        {t.senderId === user?.uid ? '-' : '+'}{t.chocolateAmount}
                      </p>
                      <p className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full inline-block ${
                        t.chocolateStatus === 'accepted' ? 'bg-green-100 text-green-700' : 
                        t.chocolateStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {t.chocolateStatus === 'accepted' ? 'গৃহীত' : 
                         t.chocolateStatus === 'rejected' ? 'প্রত্যাখ্যাত' : 'অপেক্ষমান'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
