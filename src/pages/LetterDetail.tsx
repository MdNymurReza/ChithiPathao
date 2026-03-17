import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { LetterView } from '../components/LetterView';
import { Heart, Check, X, AlertTriangle } from 'lucide-react';
import { motion } from 'motion/react';

export const LetterDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [letter, setLetter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [updatingChocolate, setUpdatingChocolate] = useState(false);
  const navigate = useNavigate();

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
        await updateDoc(doc(db, 'users', user.uid), {
          chocolateBalance: increment(letter.chocolateAmount)
        });
      }

      setLetter({ ...letter, chocolateStatus: action });
      alert(action === 'accepted' ? 'চকলেট গ্রহণ করা হয়েছে!' : 'চকলেট ফিরিয়ে দেওয়া হয়েছে।');
    } catch (err) {
      console.error(err);
      alert('অ্যাকশনটি সম্পন্ন করতে সমস্যা হয়েছে।');
    } finally {
      setUpdatingChocolate(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-96">
          <div className="text-2xl font-display animate-pulse text-primary">চিঠি খোলা হচ্ছে...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-12 pb-20 font-sans">
        <LetterView letter={letter} />

        {/* Chocolate Interaction */}
        {letter.receiverId === user?.uid && letter.chocolateAmount > 0 && letter.chocolateStatus === 'pending' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto card-nostalgic flex flex-col md:flex-row items-center justify-between gap-8"
          >
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-accent/5 rounded-full flex items-center justify-center text-accent shadow-inner">
                <Heart size={40} fill="currentColor" />
              </div>
              <div>
                <h3 className="text-2xl font-display font-bold text-primary">ভালোবাসার চকলেট!</h3>
                <p className="text-primary/60 font-serif italic">প্রেরক আপনাকে {letter.chocolateAmount}টি চকলেট পাঠিয়েছেন।</p>
              </div>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <button
                onClick={() => handleChocolateAction('rejected')}
                disabled={updatingChocolate}
                className="btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2"
              >
                <X size={18} />
                ফিরিয়ে দিন
              </button>
              <button
                onClick={() => handleChocolateAction('accepted')}
                disabled={updatingChocolate}
                className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-2"
              >
                <Check size={18} />
                গ্রহণ করুন
              </button>
            </div>
          </motion.div>
        )}

        {/* Status Info */}
        {letter.chocolateStatus !== 'pending' && letter.chocolateAmount > 0 && (
          <div className="max-w-3xl mx-auto text-center">
             <p className="text-sm text-primary/40 italic font-serif">
               চকলেট স্ট্যাটাস: {letter.chocolateStatus === 'accepted' ? 'গৃহীত' : 'প্রত্যাখ্যাত'}
             </p>
          </div>
        )}

        {/* Report/Block Actions (Simplified) */}
        <div className="max-w-3xl mx-auto flex justify-center gap-12 pt-12 border-t border-primary/5">
           <button className="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
             <AlertTriangle size={14} />
             রিপোর্ট করুন
           </button>
        </div>
      </div>
    </Layout>
  );
};
