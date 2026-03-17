import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, updateDoc, increment, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Check, X, Clock, User, Phone, Hash, CreditCard, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

export const AdminDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Default admin email check
  const isAdmin = profile?.role === 'admin' || user?.email === 'mreza2420349@bscse.uiu.ac.bd';

  useEffect(() => {
    if (!isAdmin) return;

    const q = query(
      collection(db, 'transactions'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
      setTransactions(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  const handleAction = async (transaction: any, status: 'approved' | 'rejected') => {
    setProcessingId(transaction.id);
    try {
      // 1. Update transaction status
      await updateDoc(doc(db, 'transactions', transaction.id), {
        status,
        updatedAt: serverTimestamp()
      });

      // 2. Update user balance if approved
      if (status === 'approved') {
        const userRef = doc(db, 'users', transaction.userId);
        if (transaction.type === 'buy') {
          await updateDoc(userRef, {
            chocolateBalance: increment(transaction.amount)
          });
        } else if (transaction.type === 'withdraw') {
          // Check if user has enough balance (safety check)
          const userDoc = await getDoc(userRef);
          const currentBalance = userDoc.data()?.chocolateBalance || 0;
          if (currentBalance >= transaction.amount) {
            await updateDoc(userRef, {
              chocolateBalance: increment(-transaction.amount)
            });
          } else {
            alert('ব্যবহারকারীর পর্যাপ্ত ব্যালেন্স নেই!');
            // Revert status to rejected?
            await updateDoc(doc(db, 'transactions', transaction.id), {
              status: 'rejected',
              updatedAt: serverTimestamp()
            });
          }
        }
      }
    } catch (err) {
      console.error("Error updating transaction:", err);
      alert('অ্যাকশন সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setProcessingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-96 space-y-4">
          <X size={64} className="text-accent" />
          <h1 className="text-2xl font-display font-bold text-primary">অ্যাক্সেস ডিনাইড!</h1>
          <p className="text-primary/60 font-serif italic">আপনি এই পেজটি দেখার অনুমতিপ্রাপ্ত নন।</p>
        </div>
      </Layout>
    );
  }

  const pendingTransactions = transactions.filter(t => t.status === 'pending');
  const pastTransactions = transactions.filter(t => t.status !== 'pending');

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-12 pb-20">
        <div className="space-y-4">
          <h1 className="text-5xl font-display font-bold text-primary italic">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-primary/40 font-serif italic text-lg">পেমেন্ট এবং উইথড্র রিকোয়েস্টগুলো এখান থেকে ম্যানেজ করুন।</p>
        </div>

        {/* Pending Transactions */}
        <section className="space-y-8">
          <div className="flex items-center gap-4">
            <Clock className="text-accent" />
            <h2 className="text-3xl font-display font-bold text-primary italic">অপেক্ষমান রিকোয়েস্ট ({pendingTransactions.length})</h2>
          </div>

          {pendingTransactions.length === 0 ? (
            <div className="card-nostalgic p-20 text-center">
              <p className="text-primary/30 font-serif italic text-xl">কোনো অপেক্ষমান রিকোয়েস্ট নেই।</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {pendingTransactions.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="card-nostalgic border-primary/10 hover:border-primary/20 transition-all space-y-6"
                >
                  <div className="flex justify-between items-start">
                    <div className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest rounded-none border ${
                      t.type === 'buy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-orange-50 text-orange-700 border-orange-200'
                    }`}>
                      {t.type === 'buy' ? 'ক্রয় (Buy)' : 'উত্তোলন (Withdraw)'}
                    </div>
                    <p className="text-xs text-primary/40 font-mono">
                      {format(t.createdAt?.toDate() || new Date(), 'dd MMM, HH:mm', { locale: bn })}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User size={18} className="text-primary/40" />
                      <p className="font-bold text-primary">{t.userName || 'অজানা ইউজার'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <Heart size={18} className="text-accent/40" />
                      <p className="text-2xl font-display font-bold text-primary italic">{t.amount} টি চকলেট</p>
                    </div>
                    {t.type === 'buy' && (
                      <>
                        <div className="flex items-center gap-3">
                          <CreditCard size={18} className="text-primary/40" />
                          <p className="font-serif italic text-primary/60">{t.cost} BDT</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Hash size={18} className="text-primary/40" />
                          <p className="font-mono text-sm bg-primary/5 px-2 py-1 rounded">TrxID: {t.transactionId}</p>
                        </div>
                      </>
                    )}
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="text-primary/40" />
                      <p className="font-mono text-primary">bKash: {t.bkashNumber}</p>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={() => handleAction(t, 'rejected')}
                      disabled={processingId === t.id}
                      className="flex-1 btn-secondary py-3 flex items-center justify-center gap-2 border-accent/20 text-accent hover:bg-accent/5"
                    >
                      <X size={18} />
                      রিজেক্ট
                    </button>
                    <button
                      onClick={() => handleAction(t, 'approved')}
                      disabled={processingId === t.id}
                      className="flex-1 btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <Check size={18} />
                      অ্যাপ্রুভ
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

        {/* Past Transactions */}
        <section className="space-y-8">
          <h2 className="text-3xl font-display font-bold text-primary italic opacity-40">পূর্ববর্তী রেকর্ড</h2>
          <div className="card-nostalgic !p-0 overflow-hidden border-primary/5">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-primary/5 text-[10px] uppercase tracking-[0.2em] font-bold text-primary/40">
                    <th className="p-6">তারিখ</th>
                    <th className="p-6">ইউজার</th>
                    <th className="p-6">টাইপ</th>
                    <th className="p-6">পরিমাণ</th>
                    <th className="p-6">স্ট্যাটাস</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary/5">
                  {pastTransactions.map((t) => (
                    <tr key={t.id} className="hover:bg-primary/[0.01] transition-colors">
                      <td className="p-6 text-xs font-mono text-primary/40">
                        {format(t.createdAt?.toDate() || new Date(), 'dd/MM/yy HH:mm')}
                      </td>
                      <td className="p-6">
                        <p className="font-bold text-primary text-sm">{t.userName}</p>
                        <p className="text-[10px] text-primary/30 font-mono">{t.bkashNumber}</p>
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-none border ${
                          t.type === 'buy' ? 'border-emerald-200 text-emerald-600' : 'border-orange-200 text-orange-600'
                        }`}>
                          {t.type === 'buy' ? 'BUY' : 'WITHDRAW'}
                        </span>
                      </td>
                      <td className="p-6 font-display font-bold italic text-primary">
                        {t.amount}
                      </td>
                      <td className="p-6">
                        <span className={`text-[10px] font-bold ${
                          t.status === 'approved' ? 'text-emerald-500' : 'text-accent'
                        }`}>
                          {t.status === 'approved' ? 'APPROVED' : 'REJECTED'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
};
