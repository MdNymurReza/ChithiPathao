import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { doc, updateDoc, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { motion } from 'motion/react';

export const ProfileSetup: React.FC = () => {
  const { user, profile } = useAuth();
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [allowSearch, setAllowSearch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    if (profile?.phone) {
      navigate('/dashboard');
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError('');
    setLoading(true);

    try {
      // Update user profile
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          phone,
          address,
          allowSearch,
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        throw err;
      }

      // Create search index entry
      try {
        await setDoc(doc(db, 'search_index', phone), {
          userId: user.uid,
          firstName: profile?.firstName || '',
          lastName: profile?.lastName || '',
          allowSearch: allowSearch,
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.WRITE, `search_index/${phone}`);
        throw err;
      }

      navigate('/dashboard');
    } catch (err: any) {
      console.error(err);
      setError(`প্রোফাইল আপডেট করতে সমস্যা হয়েছে: ${err.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-4 font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card-nostalgic max-w-md w-full"
      >
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-primary mb-2">প্রোফাইল সেটআপ</h1>
          <p className="text-slate-400">আপনার তথ্যগুলো পূরণ করুন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-2">
            <label className="label-nostalgic">ফোন নম্বর (খুঁজে পাওয়ার জন্য)</label>
            <input
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="input-field"
              placeholder="উদা: 017XXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <label className="label-nostalgic">ঠিকানা (ঐচ্ছিক)</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="input-field min-h-[120px]"
              placeholder="আপনার বর্তমান ঠিকানা"
            />
          </div>

          <div className="flex items-center gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
            <input
              type="checkbox"
              id="allowSearch"
              checked={allowSearch}
              onChange={(e) => setAllowSearch(e.target.checked)}
              className="w-5 h-5 rounded text-accent focus:ring-accent border-slate-300"
            />
            <label htmlFor="allowSearch" className="text-sm font-bold text-slate-600 leading-tight">
              আমাকে ফোন নম্বর দিয়ে খুঁজে পাওয়া যাবে
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xl"
          >
            {loading ? 'অপেক্ষা করুন...' : 'শুরু করুন'}
          </button>
        </form>
      </motion.div>
    </div>
  );
};
