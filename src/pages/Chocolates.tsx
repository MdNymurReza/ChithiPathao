import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Heart, Gift, ArrowUpRight, ArrowDownLeft, ShoppingBag, Wallet, History, Send, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format } from 'date-fns';
import { bn } from 'date-fns/locale';

const CHOCOLATE_PRICE = 10; // 10 BDT per chocolate
const ADMIN_BKASH = "01700000000"; // Placeholder

export const Chocolates: React.FC = () => {
  const { user, profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'history' | 'buy' | 'withdraw'>('history');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [buyAmount, setBuyAmount] = useState(10);
  const [trxId, setTrxId] = useState('');
  const [bkashNumber, setBkashNumber] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState(10);
  const [withdrawBkash, setWithdrawBkash] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    // Fetch letters with chocolates
    const qLetters = query(
      collection(db, 'letters'),
      where('chocolateAmount', '>', 0)
    );

    // Fetch manual transactions
    const qManual = query(
      collection(db, 'transactions'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeLetters = onSnapshot(qLetters, (snapshot) => {
      const letterData = snapshot.docs
        .map(doc => ({ ...doc.data(), id: doc.id, source: 'letter' }))
        .filter((l: any) => l.senderId === user.uid || l.receiverId === user.uid);
      
      const unsubscribeManual = onSnapshot(qManual, (manualSnapshot) => {
        const manualData = manualSnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id, source: 'manual' }));
        
        const combined = [...letterData, ...manualData].sort((a: any, b: any) => {
          const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
          const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
          return timeB - timeA;
        });

        setTransactions(combined);
        setLoading(false);
      });
      return () => unsubscribeManual();
    });

    return () => unsubscribeLetters();
  }, [user]);

  const handleBuy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !trxId || !bkashNumber) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: `${profile.firstName} ${profile.lastName}`,
        type: 'buy',
        amount: Number(buyAmount),
        cost: buyAmount * CHOCOLATE_PRICE,
        bkashNumber,
        transactionId: trxId,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setTrxId('');
      setBkashNumber('');
    } catch (err) {
      console.error(err);
      alert('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile || !withdrawBkash) return;
    if (withdrawAmount > (profile.chocolateBalance || 0)) {
      alert('আপনার পর্যাপ্ত ব্যালেন্স নেই!');
      return;
    }
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        userName: `${profile.firstName} ${profile.lastName}`,
        type: 'withdraw',
        amount: Number(withdrawAmount),
        bkashNumber: withdrawBkash,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      setSuccess(true);
      setWithdrawBkash('');
    } catch (err) {
      console.error(err);
      alert('রিকোয়েস্ট পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-12 pb-20">
        {/* Balance Card */}
        <div className="bg-primary rounded-none p-12 md:p-20 text-white shadow-2xl relative overflow-hidden border-8 border-double border-white/10 m-2">
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

        {/* Tabs */}
        <div className="flex border-b border-primary/10">
          <button
            onClick={() => { setActiveTab('history'); setSuccess(false); }}
            className={`flex-1 py-6 flex items-center justify-center gap-3 font-display font-bold tracking-widest text-xs uppercase transition-all ${
              activeTab === 'history' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'
            }`}
          >
            <History size={16} />
            ইতিহাস
          </button>
          <button
            onClick={() => { setActiveTab('buy'); setSuccess(false); }}
            className={`flex-1 py-6 flex items-center justify-center gap-3 font-display font-bold tracking-widest text-xs uppercase transition-all ${
              activeTab === 'buy' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'
            }`}
          >
            <ShoppingBag size={16} />
            ক্রয় করুন
          </button>
          <button
            onClick={() => { setActiveTab('withdraw'); setSuccess(false); }}
            className={`flex-1 py-6 flex items-center justify-center gap-3 font-display font-bold tracking-widest text-xs uppercase transition-all ${
              activeTab === 'withdraw' ? 'text-primary border-b-2 border-primary' : 'text-primary/30 hover:text-primary/60'
            }`}
          >
            <Wallet size={16} />
            উত্তোলন
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'history' && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-10"
            >
              <div className="card-nostalgic !p-0 overflow-hidden border-primary/5">
                {transactions.length === 0 ? (
                  <div className="p-24 text-center space-y-6">
                    <Heart className="mx-auto text-primary/10" size={64} />
                    <div className="text-primary/40 italic font-serif text-2xl">
                      এখনো কোনো উপহারের স্মৃতি জমা হয়নি...
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-primary/5">
                    {transactions.map((t, index) => (
                      <div key={t.id} className="p-10 flex items-center justify-between hover:bg-primary/[0.02] transition-all group">
                        <div className="flex items-center gap-8">
                          <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${
                            (t.source === 'letter' && t.senderId === user?.uid) || (t.source === 'manual' && t.type === 'withdraw')
                              ? 'bg-accent/5 border-accent/20 text-accent' 
                              : 'bg-primary/5 border-primary/20 text-primary'
                          }`}>
                            {(t.source === 'letter' && t.senderId === user?.uid) || (t.source === 'manual' && t.type === 'withdraw')
                              ? <ArrowUpRight size={28} /> : <ArrowDownLeft size={28} />}
                          </div>
                          <div>
                            <p className="font-display font-bold text-2xl text-primary italic">
                              {t.source === 'letter' 
                                ? (t.senderId === user?.uid ? 'ভালোবাসা পাঠানো হয়েছে' : 'ভালোবাসা প্রাপ্তি')
                                : (t.type === 'buy' ? 'চকলেট ক্রয় (বিকাশ)' : 'চকলেট উত্তোলন (বিকাশ)')}
                            </p>
                            <p className="text-xs text-primary/40 uppercase tracking-[0.2em] font-bold mt-1">
                              {format(t.createdAt?.toDate() || new Date(), 'dd MMMM, yyyy', { locale: bn })}
                            </p>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <p className={`text-4xl font-display font-bold italic ${
                            (t.source === 'letter' && t.senderId === user?.uid) || (t.source === 'manual' && t.type === 'withdraw')
                              ? 'text-accent' : 'text-primary'
                          }`}>
                            {(t.source === 'letter' && t.senderId === user?.uid) || (t.source === 'manual' && t.type === 'withdraw')
                              ? '-' : '+'}{t.chocolateAmount || t.amount}
                          </p>
                          <p className={`text-[10px] font-bold uppercase tracking-widest ${
                            t.status === 'approved' || t.chocolateStatus === 'accepted' ? 'text-emerald-500' :
                            t.status === 'rejected' || t.chocolateStatus === 'rejected' ? 'text-accent' : 'text-primary/30'
                          }`}>
                            {t.status === 'approved' || t.chocolateStatus === 'accepted' ? 'সফল' :
                             t.status === 'rejected' || t.chocolateStatus === 'rejected' ? 'ব্যর্থ' : 'অপেক্ষমান'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {activeTab === 'buy' && (
            <motion.div
              key="buy"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {success ? (
                <div className="card-nostalgic p-20 text-center space-y-8">
                  <CheckCircle2 size={80} className="mx-auto text-emerald-500" />
                  <div className="space-y-4">
                    <h2 className="text-3xl font-display font-bold text-primary italic">রিকোয়েস্ট পাঠানো হয়েছে!</h2>
                    <p className="text-primary/60 font-serif italic">অ্যাডমিন আপনার পেমেন্ট ভেরিফাই করলে চকলেট যোগ করা হবে।</p>
                  </div>
                  <button onClick={() => setSuccess(false)} className="btn-primary px-12 py-4">আরও কিনুন</button>
                </div>
              ) : (
                <form onSubmit={handleBuy} className="card-nostalgic space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-display font-bold text-primary italic">চকলেট ক্রয় করুন</h3>
                    <div className="p-6 bg-accent/5 border border-accent/10 rounded-none space-y-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-accent/60">বিকাশ পেমেন্ট ইনস্ট্রাকশন</p>
                      <p className="text-primary/80 font-serif italic">নিচের নাম্বারে সেন্ড মানি করুন:</p>
                      <p className="text-2xl font-mono font-bold text-primary">{ADMIN_BKASH}</p>
                      <p className="text-xs text-primary/40 italic">১টি চকলেট = {CHOCOLATE_PRICE} টাকা</p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40">চকলেটের পরিমাণ</label>
                      <input
                        type="number"
                        min="10"
                        value={buyAmount}
                        onChange={(e) => setBuyAmount(Number(e.target.value))}
                        className="input-nostalgic text-3xl font-display"
                        required
                      />
                      <p className="text-right text-sm font-serif italic text-primary/60">মোট খরচ: {buyAmount * CHOCOLATE_PRICE} টাকা</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40">আপনার বিকাশ নাম্বার</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={bkashNumber}
                        onChange={(e) => setBkashNumber(e.target.value)}
                        className="input-nostalgic"
                        required
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40">ট্রানজেকশন আইডি (TrxID)</label>
                      <input
                        type="text"
                        placeholder="ABC123XYZ"
                        value={trxId}
                        onChange={(e) => setTrxId(e.target.value)}
                        className="input-nostalgic font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-4"
                  >
                    <Send size={24} />
                    রিকোয়েস্ট পাঠান
                  </button>
                </form>
              )}
            </motion.div>
          )}

          {activeTab === 'withdraw' && (
            <motion.div
              key="withdraw"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto"
            >
              {success ? (
                <div className="card-nostalgic p-20 text-center space-y-8">
                  <CheckCircle2 size={80} className="mx-auto text-emerald-500" />
                  <div className="space-y-4">
                    <h2 className="text-3xl font-display font-bold text-primary italic">উত্তোলন রিকোয়েস্ট সফল!</h2>
                    <p className="text-primary/60 font-serif italic">অ্যাডমিন আপনার রিকোয়েস্ট ভেরিফাই করে টাকা পাঠিয়ে দেবেন।</p>
                  </div>
                  <button onClick={() => setSuccess(false)} className="btn-primary px-12 py-4">ঠিক আছে</button>
                </div>
              ) : (
                <form onSubmit={handleWithdraw} className="card-nostalgic space-y-10">
                  <div className="space-y-6">
                    <h3 className="text-3xl font-display font-bold text-primary italic">চকলেট উত্তোলন করুন</h3>
                    <p className="text-primary/60 font-serif italic">আপনার জমানো চকলেট বিকাশের মাধ্যমে টাকায় রূপান্তর করুন।</p>
                  </div>

                  <div className="space-y-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40">উত্তোলনের পরিমাণ</label>
                      <input
                        type="number"
                        min="10"
                        max={profile?.chocolateBalance || 0}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        className="input-nostalgic text-3xl font-display"
                        required
                      />
                      <p className="text-right text-sm font-serif italic text-primary/60">আপনি পাবেন: {withdrawAmount * CHOCOLATE_PRICE} টাকা</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold uppercase tracking-widest text-primary/40">বিকাশ নাম্বার (যেখানে টাকা নেবেন)</label>
                      <input
                        type="text"
                        placeholder="01XXXXXXXXX"
                        value={withdrawBkash}
                        onChange={(e) => setWithdrawBkash(e.target.value)}
                        className="input-nostalgic"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || (profile?.chocolateBalance || 0) < withdrawAmount}
                    className="w-full btn-primary py-6 text-xl flex items-center justify-center gap-4"
                  >
                    <Wallet size={24} />
                    উত্তোলন রিকোয়েস্ট পাঠান
                  </button>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Layout>
  );
};
