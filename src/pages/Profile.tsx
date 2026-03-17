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
      <div className="max-w-2xl mx-auto space-y-12 py-8">
        <div className="text-center relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-32 h-32 bg-primary text-white rounded-[40px] mx-auto flex items-center justify-center text-5xl font-display font-bold mb-6 shadow-2xl rotate-3 relative group"
          >
            {formData.firstName[0] || profile.firstName[0]}
            <div className="absolute -bottom-2 -right-2 bg-accent text-white p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
              <User size={16} />
            </div>
          </motion.div>
          
          {!isEditing ? (
            <>
              <h1 className="text-4xl font-display font-bold text-primary mb-2">
                {profile.firstName} {profile.lastName}
              </h1>
              <p className="text-primary/40 uppercase tracking-[0.2em] text-xs font-bold">ডাকঘর সদস্য</p>
            </>
          ) : (
            <div className="flex gap-4 justify-center mt-4">
              <input
                className="input-field text-center max-w-[150px]"
                value={formData.firstName}
                onChange={e => setFormData({...formData, firstName: e.target.value})}
                placeholder="নামের প্রথম অংশ"
              />
              <input
                className="input-field text-center max-w-[150px]"
                value={formData.lastName}
                onChange={e => setFormData({...formData, lastName: e.target.value})}
                placeholder="নামের শেষ অংশ"
              />
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-center text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-[40px] shadow-xl border border-primary/5 overflow-hidden">
          <div className="p-10 space-y-8">
            {/* Email - Read Only */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-primary">
                <Mail size={24} />
              </div>
              <div>
                <p className="label-nostalgic">ইমেইল ঠিকানা</p>
                <p className="font-display font-bold text-lg text-primary/50">{profile.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <Phone size={24} />
              </div>
              <div className="flex-1">
                <p className="label-nostalgic">ফোন নম্বর</p>
                {isEditing ? (
                  <input
                    className="input-field py-2"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                ) : (
                  <p className="font-display font-bold text-lg text-primary">{profile.phone}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-paper rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <MapPin size={24} />
              </div>
              <div className="flex-1">
                <p className="label-nostalgic">ঠিকানা</p>
                {isEditing ? (
                  <textarea
                    className="input-field py-2 min-h-[80px]"
                    value={formData.address}
                    onChange={e => setFormData({...formData, address: e.target.value})}
                  />
                ) : (
                  <p className="font-display font-bold text-lg text-primary">{profile.address || 'দেওয়া হয়নি'}</p>
                )}
              </div>
            </div>

            {/* Chocolate Balance */}
            <div className="flex items-center gap-6 group">
              <div className="w-14 h-14 bg-pink-50 rounded-2xl flex items-center justify-center text-pink-500 group-hover:scale-110 transition-transform">
                <Heart size={24} fill="currentColor" />
              </div>
              <div>
                <p className="label-nostalgic text-pink-400">চকলেট ব্যালেন্স</p>
                <p className="font-display font-bold text-3xl text-pink-500">
                  {profile.chocolateBalance} <span className="text-sm font-sans">টি</span>
                </p>
              </div>
              <div className="ml-auto stamp-effect">
                মিষ্টি উপহার
              </div>
            </div>
          </div>

          <div className="bg-paper p-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-primary/40" />
              <span className="text-sm font-medium text-primary">সার্চে দৃশ্যমানতা</span>
            </div>
            {isEditing ? (
              <button
                onClick={() => setFormData({...formData, allowSearch: !formData.allowSearch})}
                className={`px-6 py-2 rounded-full font-bold text-xs transition-all ${
                  formData.allowSearch ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
                }`}
              >
                {formData.allowSearch ? 'চালু' : 'বন্ধ'}
              </button>
            ) : (
              <span className={`text-xs font-bold px-4 py-2 rounded-full ${
                profile.allowSearch ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-600'
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
