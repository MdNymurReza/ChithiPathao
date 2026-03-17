import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { motion } from 'motion/react';

export const Login: React.FC = () => {
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
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError('ইমেইল অথবা পাসওয়ার্ড ভুল। আবার চেষ্টা করুন।');
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
          <p className="text-slate-400">আপনার ডিজিটাল চিঠির বাক্সে ফিরে আসুন</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl mb-8 text-center text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
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
            {loading ? 'অপেক্ষা করুন...' : 'লগইন করুন'}
          </button>
        </form>

        <p className="mt-10 text-center text-slate-400 text-sm font-medium">
          অ্যাকাউন্ট নেই?{' '}
          <Link to="/signup" className="text-primary font-bold hover:text-accent transition-colors">
            নতুন অ্যাকাউন্ট তৈরি করুন
          </Link>
        </p>
      </motion.div>
    </div>
  );
};
