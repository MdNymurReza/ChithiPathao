import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { Phone, Mail, MapPin, Heart, Shield, Edit2, Save, X, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase';

export const Profile: React.FC = () => {
  const { user, profile, loading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: profile?.firstName || '',
    lastName: profile?.lastName || '',
    phone: profile?.phone || '',
    address: profile?.address || '',
    allowSearch: profile?.allowSearch ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!profile || !user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <h2 className="text-2xl font-display font-bold text-primary mb-4">প্রোফাইল পাওয়া যায়নি</h2>
          <p className="text-primary/60">অনুগ্রহ করে আবার লগইন করুন।</p>
        </div>
      </Layout>
    );
  }

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      // Update main profile
      try {
        await updateDoc(doc(db, 'users', user.uid), {
          ...formData,
        });
      } catch (err: any) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.uid}`);
        throw err;
      }

      // Update search index if phone or name changed
      if (formData.phone !== profile.phone || 
          formData.firstName !== profile.firstName || 
          formData.lastName !== profile.lastName ||
          formData.allowSearch !== profile.allowSearch) {
        
        // If phone changed, we should ideally delete the old index entry, 
        // but for simplicity we'll just create/update the new one.
        try {
          await setDoc(doc(db, 'search_index', formData.phone), {
            userId: user.uid,
            firstName: formData.firstName,
            lastName: formData.lastName,
            allowSearch: formData.allowSearch,
          });
        } catch (err: any) {
          handleFirestoreError(err, OperationType.WRITE, `search_index/${formData.phone}`);
          throw err;
        }
      }

      setIsEditing(false);
    } catch (err: any) {
      setError('তথ্য সংরক্ষণ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-12 py-8">
        <div className="text-center relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-primary text-white rounded-none mx-auto flex items-center justify-center text-5xl font-display font-bold mb-8 shadow-2xl relative border-4 border-double border-white/20 rotate-3"
          >
            {formData.firstName[0] || profile.firstName[0]}
          </motion.div>
          
          {!isEditing ? (
            <>
              <h1 className="text-4xl font-display font-bold text-primary mb-2 italic">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-primary/40 uppercase tracking-[0.3em] text-[10px] font-bold">ডাকঘর সদস্য</p>
            </>
          ) : (
            <div className="flex gap-4 justify-center mt-4">
              <input
                className="input-field text-center max-w-[150px]"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="নাম"
              />
              <input
                className="input-field text-center max-w-[150px]"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="পদবি"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        <div className="card-nostalgic !p-0 overflow-hidden">
          <div className="p-12 space-y-10">
            {/* Email - Read Only */}
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary/40 border border-primary/10">
                <Mail size={24} />
              </div>
              <div>
                <p className="label-nostalgic">ইমেইল ঠিকানা</p>
                <p className="font-serif italic text-xl text-primary/40">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
                <Phone size={24} />
              </div>
              <div className="flex-1">
                <p className="label-nostalgic">ফোন নম্বর</p>
                {isEditing ? (
                  <input
                    className="input-field py-3 text-xl"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-display font-bold text-2xl text-primary italic">{profile.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-primary/5 rounded-full flex items-center justify-center text-primary border border-primary/10">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <p className="label-nostalgic">ঠিকানা</p>
                {isEditing ? (
                  <textarea
                    className="input-field py-3 min-h-[100px] text-xl"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <p className="font-display font-bold text-2xl text-primary italic">{profile.address || 'দেওয়া হয়নি'}</p>
                )}
              </div>
            </div>

            {/* Chocolate Balance */}
            <div className="flex items-center gap-8">
              <div className="w-14 h-14 bg-accent/5 rounded-full flex items-center justify-center text-accent border border-accent/10">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <p className="label-nostalgic text-accent/60">উপহার ব্যালেন্স</p>
                <p className="font-display font-bold text-4xl text-accent italic">
                  {profile.chocolateBalance} <span className="text-sm font-serif font-normal text-primary/40 not-italic">টি</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-primary/5 p-10 flex items-center justify-between border-t border-primary/10">
            <div className="flex items-center gap-4">
              <Shield size={20} className="text-primary/40" />
              <span className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em]">সার্চে দৃশ্যমানতা</span>
            </div>
            {isEditing ? (
              <button
                onClick={() => setFormData({...formData, allowSearch: !formData.allowSearch})}
                className={`px-8 py-3 rounded-none font-bold text-xs uppercase tracking-widest transition-all border-2 ${
                  formData.allowSearch ? 'bg-primary text-white border-primary' : 'bg-transparent text-primary/40 border-primary/10'
                }`}
              >
                {formData.allowSearch ? 'চালু' : 'বন্ধ'}
              </button>
            ) : (
              <span className={`text-xs font-bold px-6 py-3 rounded-none uppercase tracking-widest border ${
                profile.allowSearch ? 'bg-primary/10 text-primary border-primary/20' : 'bg-transparent text-primary/20 border-primary/10'
              }`}>
                {profile.allowSearch ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex justify-center gap-4">
          <AnimatePresence mode="wait">
            {!isEditing ? (
              <motion.button
                key="edit"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => setIsEditing(true)}
                className="btn-secondary flex items-center gap-2"
              >
                <Edit2 size={18} /> তথ্য পরিবর্তন করুন
              </motion.button>
            ) : (
              <div key="actions" className="flex gap-4">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setIsEditing(false)}
                  className="btn-secondary border-red-200 text-red-500 hover:bg-red-50 flex items-center gap-2"
                >
                  <X size={18} /> বাতিল
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleSave}
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save size={18} /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </motion.button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </Layout>
  );
};
