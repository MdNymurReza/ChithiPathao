import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { motion } from 'motion/react';
import { Award, Lock, Star, Heart, Mail, Map } from 'lucide-react';

const ALL_STAMPS = [
  { id: 'first_letter', name: 'প্রথম বার্তা', icon: <Mail />, description: 'আপনার প্রথম চিঠি পাঠানোর জন্য', color: 'bg-blue-500' },
  { id: 'five_letters', name: 'পঞ্চরত্ন', icon: <Star />, description: '৫টি চিঠি পাঠানোর জন্য', color: 'bg-yellow-500' },
  { id: 'ten_letters', name: 'দশভুজা', icon: <Award />, description: '১০টি চিঠি পাঠানোর জন্য', color: 'bg-purple-500' },
  { id: 'gift_giver', name: 'দয়ালু হৃদয়', icon: <Heart />, description: 'উপহারসহ চিঠি পাঠানোর জন্য', color: 'bg-red-500' },
  { id: 'explorer', name: 'দেশভ্রমণ', icon: <Map />, description: '৫টি ভিন্ন ঠিকানায় চিঠি পাঠানোর জন্য', color: 'bg-green-500' },
];

export const Stamps: React.FC = () => {
  const { profile } = useAuth();
  const collectedStamps = profile?.stamps || [];

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-primary/10 rounded-full text-primary mb-2">
            <Award size={32} />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary">স্ট্যাম্প সংগ্রহশালা</h1>
          <p className="text-primary/60 font-serif italic max-w-lg mx-auto">
            আপনার ডাকঘর যাত্রার প্রতিটি মাইলফলক স্মরণীয় করে রাখতে এই স্ট্যাম্পগুলো সংগ্রহ করুন।
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {ALL_STAMPS.map((stamp, index) => {
            const isCollected = collectedStamps.includes(stamp.id);
            
            return (
              <motion.div
                key={stamp.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                className={`relative group aspect-square card-nostalgic p-0 overflow-hidden flex flex-col items-center justify-center text-center p-6 space-y-4 ${
                  !isCollected ? 'grayscale opacity-60' : 'hover:scale-105 transition-transform'
                }`}
              >
                {!isCollected && (
                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center z-10">
                    <Lock size={24} className="text-primary/20" />
                  </div>
                )}
                
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white shadow-lg ${isCollected ? stamp.color : 'bg-slate-300'}`}>
                  {React.cloneElement(stamp.icon as React.ReactElement, { size: 32 })}
                </div>
                
                <div className="space-y-1">
                  <h3 className="font-bold font-display text-primary">{stamp.name}</h3>
                  <p className="text-[10px] text-primary/40 leading-tight">{stamp.description}</p>
                </div>

                {isCollected && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white">
                      <Star size={12} fill="currentColor" />
                    </div>
                  </div>
                )}

                {/* Perforated edge effect */}
                <div className="absolute -top-2 -left-2 w-4 h-4 bg-paper rounded-full"></div>
                <div className="absolute -top-2 -right-2 w-4 h-4 bg-paper rounded-full"></div>
                <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-paper rounded-full"></div>
                <div className="absolute -bottom-2 -right-2 w-4 h-4 bg-paper rounded-full"></div>
              </motion.div>
            );
          })}
        </div>

        <div className="card-nostalgic p-8 bg-primary/5 border-dashed border-primary/20 text-center">
          <p className="text-primary/60 italic font-serif">
            আরো চিঠি পাঠান এবং নতুন নতুন স্ট্যাম্প আনলক করুন!
          </p>
        </div>
      </div>
    </Layout>
  );
};
