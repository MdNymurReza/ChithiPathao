import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, handleFirestoreError, OperationType } from '../firebase';
import { motion } from 'motion/react';

export const Signup: React.FC = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile
      try {
        try {
          await setDoc(doc(db, 'users', user.uid), {
            firstName,
            lastName,
            email,
            phone: '', // Will be set in profile setup
            allowSearch: true,
            chocolateBalance: 0,
            createdAt: serverTimestamp(),
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `users/${user.uid}`);
          throw err;
        }
        navigate('/profile-setup');
      } catch (firestoreErr: any) {
        setError(`প্রোফাইল তৈরি করতে সমস্যা হয়েছে: ${firestoreErr.message || 'Unknown error'}`);
        console.error(firestoreErr);
      }
    } catch (err: any) {
      let errorMessage = 'অ্যাকাউন্ট তৈরি করতে সমস্যা হয়েছে।';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'এই ইমেইলটি ইতিপূর্বে ব্যবহার করা হয়েছে।';
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = 'ইমেইলটি সঠিক নয়।';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'পাসওয়ার্ডটি অন্তত ৬ অক্ষরের হতে হবে।';
      } else if (err.code === 'auth/operation-not-allowed') {
        errorMessage = 'ফায়ারবেস কনসোলে Email/Password অথেন্টিকেশন চালু করা নেই।';
      } else {
        errorMessage += ` (${err.message})`;
      }
      setError(errorMessage);
      console.error(err);
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
          <h1 className="text-4xl font-bold text-primary mb-2 tracking-tighter">ডাকঘর</h1>
          <p className="text-slate-400">নতুন সদস্য হিসেবে যোগ দিন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="label-nostalgic">নাম</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="input-field"
                placeholder="উদা: রহিম"
              />
            </div>
            <div className="space-y-2">
              <label className="label-nostalgic">পদবি</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="input-field"
                placeholder="উদা: উদ্দিন"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label-nostalgic">ইমেইল</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="example@mail.com"
            />
          </div>

          <div className="space-y-2">
            <label className="label-nostalgic">পাসওয়ার্ড</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xl"
          >
            {loading ? 'অপেক্ষা করুন...' : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          ইতিমধ্যেই অ্যাকাউন্ট আছে?{' '}
          <Link to="/login" className="text-primary font-bold hover:text-accent transition-colors">
            লগইন করুন
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
