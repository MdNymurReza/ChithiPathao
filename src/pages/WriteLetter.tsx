import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, addDoc, serverTimestamp, updateDoc, increment, Timestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Search, Send, User, Heart, AlertCircle, Gift, Bike } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import ReactQuill from 'react-quill-new';

export const WriteLetter: React.FC = () => {
  const { user, profile } = useAuth();
  const [phone, setPhone] = useState('');
  const [receiver, setReceiver] = useState<{ id: string; name: string } | null>(null);
  const [content, setContent] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [chocolateAmount, setChocolateAmount] = useState(0);
  const [customChocolate, setCustomChocolate] = useState('');
  const [showCustom, setShowCustom] = useState(false);
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
    
    const finalAmount = showCustom ? parseInt(customChocolate) || 0 : chocolateAmount;
    
    if (finalAmount > profile.chocolateBalance) {
      setError(`আপনার কাছে পর্যাপ্ত উপহার নেই। আপনার ব্যালেন্স: ${profile.chocolateBalance}টি`);
      return;
    }

    setSending(true);

    try {
      // 1. Deduct chocolates from sender
      if (finalAmount > 0) {
        try {
          await updateDoc(doc(db, 'users', user.uid), {
            chocolateBalance: increment(-finalAmount)
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
          throw err;
        }
      }

      // 2. Calculate delivery time (2 minutes from now)
      const now = new Date();
      const deliveryTime = new Timestamp(Math.floor((now.getTime() + 120000) / 1000), 0);

      // 3. Add letter
      try {
        // Strip HTML for preview
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || "";

        await addDoc(collection(db, 'letters'), {
          senderId: user.uid,
          receiverId: receiver.id,
          content,
          preview: plainText.substring(0, 100),
          isAnonymous,
          chocolateAmount: finalAmount,
          chocolateStatus: finalAmount > 0 ? 'pending' : 'none',
          status: 'sent',
          createdAt: serverTimestamp(),
          deliveryTime: deliveryTime,
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.CREATE, 'letters');
        throw err;
      }

      // Show success message and navigate
      alert('চিঠিটি পোস্টবক্সে জমা দেওয়া হয়েছে। এটি গন্তব্যে পৌঁছাতে কিছুক্ষণ সময় লাগবে।');
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
          <h1 className="text-4xl font-display font-bold text-primary">হৃদয়ের কথা লিখুন</h1>
          <p className="text-primary/60 font-serif italic">আপনার মনের গহীনের কথাগুলো সাজিয়ে লিখুন</p>
        </div>

        {/* Receiver Search */}
        <div className="bg-white rounded-3xl shadow-sm p-6 md:p-8 border border-slate-200">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1 space-y-2 w-full">
              <label className="label-nostalgic">প্রাপকের ফোন নম্বর</label>
              <div className="relative">
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="input-field pl-12"
                  placeholder="017XXXXXXXX"
                />
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              </div>
            </div>
            <button
              onClick={handleSearch}
              disabled={searching || !phone}
              className="btn-primary h-[52px]"
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
            className="space-y-8"
          >
            <div className="card-nostalgic min-h-[600px] flex flex-col p-0 overflow-hidden">
              <div className="p-8 md:p-12 flex-1">
                <ReactQuill
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  placeholder="প্রিয়..."
                  modules={{
                    toolbar: [
                      ['bold', 'italic', 'underline'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['clean']
                    ],
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Options */}
              <div className="card-nostalgic p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-display font-bold text-primary italic">অজ্ঞাতনামা হিসেবে পাঠান</h3>
                    <p className="text-xs text-primary/40 font-serif italic mt-1">
                      এটি চালু করলে প্রাপক আপনার নাম দেখতে পাবেন না।
                    </p>
                  </div>
                  <button
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`w-14 h-7 rounded-full transition-all relative ${
                      isAnonymous ? 'bg-accent' : 'bg-primary/10'
                    }`}
                  >
                    <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-sm ${
                      isAnonymous ? 'left-8' : 'left-1'
                    }`}></div>
                  </button>
                </div>
              </div>

              {/* Chocolate System */}
              <div className="card-nostalgic p-8 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-accent">
                    <Heart size={20} fill={(chocolateAmount > 0 || customChocolate) ? "currentColor" : "none"} />
                    <span className="text-sm font-bold uppercase tracking-widest">ভালোবাসার উপহার</span>
                  </div>
                  <button 
                    onClick={() => {
                      setShowCustom(!showCustom);
                      setChocolateAmount(0);
                    }}
                    className="text-xs text-primary/40 underline font-bold"
                  >
                    {showCustom ? 'তালিকায় ফিরুন' : 'কাস্টম পরিমাণ'}
                  </button>
                </div>

                <AnimatePresence mode="wait">
                  {!showCustom ? (
                    <motion.div 
                      key="presets"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="flex gap-3"
                    >
                      {[0, 5, 10, 20].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setChocolateAmount(amount)}
                          className={`flex-1 py-3 rounded-none border transition-all font-display font-bold text-sm ${
                            chocolateAmount === amount
                              ? 'bg-primary text-white border-primary shadow-md'
                              : 'bg-paper border-primary/10 text-primary/40 hover:border-primary/30'
                          }`}
                        >
                          {amount === 0 ? 'না' : amount}
                        </button>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="custom"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -5 }}
                      className="relative"
                    >
                      <input
                        type="number"
                        value={customChocolate}
                        onChange={(e) => setCustomChocolate(e.target.value)}
                        placeholder="পরিমাণ লিখুন..."
                        className="input-field py-3 pr-12"
                      />
                      <Gift className="absolute right-4 top-1/2 -translate-y-1/2 text-primary/20" size={20} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <button
              onClick={handleSend}
              disabled={sending || !content}
              className="btn-primary w-full flex flex-col items-center justify-center gap-4 text-xl py-8 relative overflow-hidden group"
            >
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
              
              {sending ? (
                <div className="relative z-10 w-full flex flex-col items-center gap-4">
                  <div className="w-full h-1 bg-primary/10 relative overflow-hidden rounded-full max-w-xs">
                    <div className="absolute inset-0 bg-accent w-1/3 animate-[car-drive_2s_linear_infinite]"></div>
                  </div>
                  <div className="flex items-center gap-4 animate-post-pulse">
                    <Bike size={32} className="text-accent animate-bike-pedal" />
                    <span className="font-display italic">চিঠি গন্তব্যের পথে পাঠানো হচ্ছে...</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 flex items-center gap-4">
                  <Send size={24} />
                  <span>চিঠি পাঠান</span>
                </div>
              )}
            </button>
          </motion.div>
        )}
      </div>
    </Layout>
  );
};
