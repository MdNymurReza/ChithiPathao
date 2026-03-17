import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Search, Send, User, Heart, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const WriteLetter: React.FC = () => {
  const { user, profile } = useAuth();
  const [phone, setPhone] = useState('');
  const [receiver, setReceiver] = useState<{ id: string; name: string } | null>(null);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [chocolateAmount, setChocolateAmount] = useState(0);
  const [searching, setSearching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSearch = async () => {
    if (!phone) return;
    setSearching(true);
    setError('');
    setReceiver(null);

    try {
      const searchDoc = await getDoc(doc(db, 'search_index', phone));
      if (searchDoc.exists()) {
        const data = searchDoc.data();
        if (data.allowSearch) {
          setReceiver({
            id: data.userId,
            name: `${data.firstName} ${data.lastName}`,
          });
        } else {
          setError('এই ব্যবহারকারীকে খুঁজে পাওয়া সম্ভব নয়।');
        }
      } else {
        setError('এই ফোন নম্বর দিয়ে কোনো ব্যবহারকারী পাওয়া যায়নি।');
      }
    } catch (err) {
      console.error(err);
      setError('সার্চ করতে সমস্যা হয়েছে।');
    } finally {
      setSearching(false);
    }
  };

  const handleSend = async () => {
    if (!user || !receiver || !content || !profile) return;
    
    if (chocolateAmount > profile.chocolateBalance) {
      setError(`আপনার কাছে পর্যাপ্ত চকলেট নেই। আপনার ব্যালেন্স: ${profile.chocolateBalance}টি`);
      return;
    }

    setSending(true);

    try {
      // 1. Deduct chocolates from sender
      if (chocolateAmount > 0) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            chocolateBalance: increment(-chocolateAmount)
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          throw err;
        }
      }

      // 2. Add letter
      try {
        await addDoc(collection(db, 'letters'), {
          senderId: user.uid,
          receiverId: receiver.id,
          content,
          preview: content.substring(0, 100),
          isAnonymous,
          chocolateAmount,
          chocolateStatus: chocolateAmount > 0 ? 'pending' : 'none',
          status: 'sent',
          createdAt: serverTimestamp(),
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'letters');
        throw err;
      }

      // Show success message and navigate
      alert('চিঠিটি পাঠানো হয়েছে। এটি পৌঁছাতে কিছুক্ষণ সময় লাগতে পারে।');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('চিঠি পাঠাতে সমস্যা হয়েছে।');
    } finally {
      setSending(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#5A5A40]">নতুন চিঠি লিখুন</h1>
          <p className="text-[#5A5A40]/60 italic">আপনার মনের কথাগুলো সাজিয়ে লিখুন</p>
        </div>

        {/* Receiver Search */}
        <div className="bg-white rounded-[32px] shadow-sm p-6 md:p-8 border border-[#5A5A40]/10">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="text-sm font-medium text-[#5A5A40]">প্রাপকের ফোন নম্বর</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-2xl bg-[#f5f5f0] border-none focus:ring-2 focus:ring-[#5A5A40] transition-all"
                  placeholder="017XXXXXXXX"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5A5A40]/40" size={20} />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !phone}
              className="px-8 py-3 bg-[#5A5A40] text-white rounded-full font-bold hover:bg-[#4a4a34] transition-colors disabled:opacity-50 h-[52px]"
            >
              {searching ? 'খোঁজা হচ্ছে...' : 'খুঁজুন'}
            </button>
          </div>

          <AnimatePresence>
            {error && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-red-500 text-sm mt-4"
              >
                {error}
              </motion.p>
            )}

            {receiver && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 p-4 bg-green-50 rounded-2xl flex items-center justify-between border border-green-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-green-600 font-medium">প্রাপক নিশ্চিত করা হয়েছে</p>
                    <p className="font-bold text-[#1a1a1a]">{receiver.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setReceiver(null)}
                  className="text-xs text-green-600 underline font-medium"
                >
                  পরিবর্তন করুন
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Letter Content */}
        {receiver && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-[32px] shadow-sm p-6 md:p-8 border border-[#5A5A40]/10">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="আপনার চিঠি এখানে লিখুন..."
                className="w-full min-h-[400px] p-6 rounded-2xl bg-[#fdfbf7] border-none focus:ring-2 focus:ring-[#5A5A40] transition-all text-xl font-handwriting leading-relaxed resize-none"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Options */}
              <div className="bg-white rounded-[32px] shadow-sm p-6 border border-[#5A5A40]/10 space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-[#5A5A40]">অজ্ঞাতনামা হিসেবে পাঠান</label>
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-12 h-6 rounded-full transition-colors relative ${
                      isAnonymous ? 'bg-[#5A5A40]' : 'bg-gray-200'
                    }`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${
                      isAnonymous ? 'left-7' : 'left-1'
                    }`}></div>
                  </button>
                </div>
                <p className="text-xs text-[#5A5A40]/60">
                  এটি চালু করলে প্রাপক আপনার নাম দেখতে পাবেন না।
                </p>
              </div>

              {/* Chocolate System */}
              <div className="bg-white rounded-[32px] shadow-sm p-6 border border-[#5A5A40]/10 space-y-4">
                <div className="flex items-center gap-2 text-[#5A5A40]">
                  <Heart size={18} fill={chocolateAmount > 0 ? "currentColor" : "none"} />
                  <span className="text-sm font-medium text-[#5A5A40]">ভালোবাসার চকলেট যোগ করুন</span>
                </div>
                <div className="flex gap-2">
                  {[0, 5, 10, 20].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setChocolateAmount(amount)}
                      className={`flex-1 py-2 rounded-xl border transition-all ${
                        chocolateAmount === amount
                          ? 'bg-[#5A5A40] text-white border-[#5A5A40]'
                          : 'bg-[#f5f5f0] border-transparent text-[#5A5A40]'
                      }`}
                    >
                      {amount === 0 ? 'না' : amount}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !content}
              className="w-full py-5 bg-[#5A5A40] text-white rounded-full font-bold text-xl hover:bg-[#4a4a34] transition-all shadow-lg flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {sending ? 'পাঠানো হচ্ছে...' : (
                <>
                  <Send size={24} />
                  <span>চিঠি পাঠান</span>
                </>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
