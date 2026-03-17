import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { LetterView } from '../components/LetterView';
import { Heart, Check, X, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const LetterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingChocolate, setUpdatingChocolate] = useState(false);
  const [showHearts, setShowHearts] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (showHearts) {
      const timer = setTimeout(() => setShowHearts(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showHearts]);

  useEffect(() => {
    const fetchLetter = async () => {
      if (!id || !user) return;
      try {
        const letterDoc = await getDoc(doc(db, 'letters', id));
        if (letterDoc.exists()) {
          const data = letterDoc.id ? { ...letterDoc.data(), id: letterDoc.id } : letterDoc.data();
          
          // Check access
          if (data.senderId !== user.uid && data.receiverId !== user.uid) {
            navigate('/dashboard');
            return;
          }

          // Check delivery time for receiver
          if (data.receiverId === user.uid) {
            const now = Date.now();
            const deliveryTime = data.deliveryTime?.toMillis ? data.deliveryTime.toMillis() : 0;
            if (deliveryTime > now) {
              navigate('/dashboard');
              return;
            }
          }

          // Fetch names and addresses
          const [senderDoc, receiverDoc] = await Promise.all([
            getDoc(doc(db, 'users', data.senderId)),
            getDoc(doc(db, 'users', data.receiverId))
          ]);

          const senderData = senderDoc.data();
          const receiverData = receiverDoc.data();

          setLetter({
            ...data,
            senderName: `${senderData?.firstName} ${senderData?.lastName}`,
            receiverName: `${receiverData?.firstName} ${receiverData?.lastName}`,
            senderAddress: senderData?.address,
            receiverAddress: receiverData?.address
          });

          // Mark as delivered if it was sent and receiver is viewing
          if (data.status === 'sent' && data.receiverId === user.uid) {
            await updateDoc(doc(db, 'letters', id), { status: 'delivered' });
          }
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLetter();
  }, [id, user, navigate]);

  const handleChocolateAction = async (action: 'accepted' | 'rejected') => {
    if (!letter || !user || letter.receiverId !== user.uid) return;
    setUpdatingChocolate(true);

    try {
      await updateDoc(doc(db, 'letters', letter.id), {
        chocolateStatus: action
      });

      if (action === 'accepted') {
        setShowHearts(true);
        await updateDoc(doc(db, 'users', user.uid), {
          chocolateBalance: increment(letter.chocolateAmount)
        });
      }

      setLetter({ ...letter, chocolateStatus: action });
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingChocolate(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-2xl font-bold animate-pulse text-primary">চিঠি খোলা হচ্ছে...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-20 relative">
        {/* Heart Burst Animation */}
        <AnimatePresence>
          {showHearts && (
            <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center overflow-hidden">
              {[...Array(20)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
                  animate={{ 
                    scale: [0, 1.5, 1],
                    x: (Math.random() - 0.5) * 600,
                    y: (Math.random() - 0.5) * 600 - 200,
                    opacity: [1, 1, 0]
                  }}
                  transition={{ duration: 2, ease: "easeOut" }}
                  className="absolute text-accent"
                >
                  <Heart size={32 + Math.random() * 32} fill="currentColor" />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        <LetterView letter={letter} />

        {/* Chocolate Interaction */}
        {letter.receiverId === user?.uid && letter.chocolateAmount > 0 && letter.chocolateStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto card-nostalgic flex flex-col md:flex-row items-center justify-between gap-10 border-accent/20 bg-accent/[0.02]"
          >
            <div className="flex items-center gap-8">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-accent shadow-inner border border-accent/10">
                <Heart size={40} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-primary italic">ভালোবাসার উপহার!</h3>
                <p className="text-primary/60 font-serif italic text-lg">প্রেরক আপনাকে {letter.chocolateAmount}টি উপহার পাঠিয়েছেন।</p>
              </div>
            </div>
            <div className="flex gap-6 w-full md:w-auto">
              <button
                onClick={() => handleChocolateAction('rejected')}
                disabled={updatingChocolate}
                className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-3 py-4 px-8"
              >
                <X size={20} />
                ফিরিয়ে দিন
              </button>
              <button
                onClick={() => handleChocolateAction('accepted')}
                disabled={updatingChocolate}
                className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-3 py-4 px-8"
              >
                <Check size={20} />
                গ্রহণ করুন
              </button>
            </div>
          </motion.div>
        )}

        {/* Status Info */}
        {letter.chocolateStatus !== 'pending' && letter.chocolateAmount > 0 && (
          <div className="max-w-3xl mx-auto text-center">
             <p className="text-lg text-primary/40 italic font-serif">
               উপহার স্ট্যাটাস: {letter.chocolateStatus === 'accepted' ? 'গৃহীত' : 'প্রত্যাখ্যাত'}
             </p>
          </div>
        )}

        {/* Report/Block Actions (Simplified) */}
        <div className="max-w-3xl mx-auto flex justify-center gap-16 pt-16 border-t border-primary/10">
           <button className="text-xs text-accent/40 hover:text-accent font-bold uppercase tracking-[0.3em] flex items-center gap-3 transition-colors">
             <AlertTriangle size={16} />
             রিপোর্ট করুন
           </button>
        </div>
      </div>
    </Layout>
  );
};
