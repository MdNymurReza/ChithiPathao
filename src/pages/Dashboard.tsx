import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, limit } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Bookshelf } from '../components/Bookshelf';
import { Layout } from '../components/Layout';
import { Bike, Cloud, MapPin, Award } from 'lucide-react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';

interface Letter {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  preview: string;
  isAnonymous: boolean;
  createdAt: any;
  deliveryTime?: any;
  status: string;
  senderName?: string;
}

export const Dashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const [receivedLetters, setReceivedLetters] = useState<Letter[]>([]);
  const [sentLetters, setSentLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (profile && !profile.phone) {
      navigate('/profile-setup');
    }
  }, [profile, navigate]);
  useEffect(() => {
    if (!user) return;

    // Fetch received letters
    const qReceived = query(
      collection(db, 'letters'),
      where('receiverId', '==', user.uid)
    );

    const unsubscribeReceived = onSnapshot(qReceived, (snapshot) => {
      const now = Date.now();
      const lettersData = snapshot.docs.map(doc => {
        const data = doc.data() as Letter;
        const deliveryTime = data.deliveryTime?.toMillis ? data.deliveryTime.toMillis() : 0;
        
        if (deliveryTime > now) return null;

        return {
          ...data,
          id: doc.id,
          senderName: data.isAnonymous ? 'অজানা' : (data.senderName || 'অজানা')
        };
      }).filter(l => l !== null) as Letter[];

      // Sort client-side
      const sortedLetters = lettersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setReceivedLetters(sortedLetters);
      setLoading(false);
    }, (error) => {
      console.error("Received letters snapshot error:", error);
      setLoading(false);
    });

    // Fetch sent letters
    const qSent = query(
      collection(db, 'letters'),
      where('senderId', '==', user.uid)
    );

    const unsubscribeSent = onSnapshot(qSent, (snapshot) => {
      const lettersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Letter[];

      // Sort client-side
      const sortedLetters = lettersData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : 0;
        const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : 0;
        return timeB - timeA;
      });

      setSentLetters(sortedLetters);
      setLoading(false);
    }, (error) => {
      console.error("Sent letters snapshot error:", error);
      setLoading(false);
    });

    return () => {
      unsubscribeReceived();
      unsubscribeSent();
    };
  }, [user]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
        </div>
      </Layout>
    );
  }

  const inTransitLetters = sentLetters.filter(l => {
    const deliveryTime = l.deliveryTime?.toMillis ? l.deliveryTime.toMillis() : 0;
    return deliveryTime > Date.now();
  });

  const deliveredSentLetters = sentLetters.filter(l => {
    const deliveryTime = l.deliveryTime?.toMillis ? l.deliveryTime.toMillis() : 0;
    return deliveryTime <= Date.now();
  });

  return (
    <Layout>
      <div className="space-y-16 py-8">
        <div className="text-center space-y-6">
          <div className="flex flex-col items-center">
            <h1 className="text-4xl font-display font-bold text-primary italic">আপনার চিঠিপত্র</h1>
            <p className="text-primary/40 font-serif italic">আপনার হৃদয়ের ডাকবাক্স</p>
          </div>
          
          <div className="flex justify-center gap-4">
            <Link to="/post-office" className="card-nostalgic px-6 py-3 flex items-center gap-2 hover:border-accent transition-colors group">
              <MapPin size={18} className="text-accent group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">ডাকঘর ট্র্যাকিং</span>
            </Link>
            <Link to="/stamps" className="card-nostalgic px-6 py-3 flex items-center gap-2 hover:border-primary transition-colors group">
              <Award size={18} className="text-primary group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold uppercase tracking-widest">স্ট্যাম্প সংগ্রহ</span>
            </Link>
          </div>
        </div>
        
        {inTransitLetters.length > 0 && (
          <div className="space-y-6 py-4">
            <div className="flex items-center justify-between px-4 border-b border-primary/5 pb-4">
              <h2 className="text-xl font-display font-bold text-accent flex items-center gap-2">
                <span className="animate-post-pulse">●</span> গন্তব্যের পথে...
              </h2>
              <div className="flex-1 relative h-16 overflow-hidden mx-8 hidden md:block bg-primary/[0.02] rounded-full">
                {/* Clouds */}
                <div className="absolute inset-0 pointer-events-none">
                  <Cloud size={16} className="absolute top-2 left-1/4 text-primary/10 animate-cloud-drift" />
                  <Cloud size={20} className="absolute top-4 left-3/4 text-primary/10 animate-cloud-drift [animation-delay:5s]" />
                </div>
                
                <motion.div 
                  animate={{ x: ['-100%', '100%'] }}
                  transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                  className="absolute top-1/2 -translate-y-1/2 flex items-center gap-4 text-primary/40"
                >
                  <div className="relative">
                    <Bike size={32} className="animate-bike-pedal text-accent" />
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-primary/10 blur-[1px]"></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-[0.4em] font-bold text-primary/60">ডাকপিয়ন</span>
                    <div className="h-0.5 w-24 bg-gradient-to-r from-accent/40 to-transparent rounded-full"></div>
                  </div>
                </motion.div>
              </div>
            </div>
            <Bookshelf letters={inTransitLetters} title="" />
          </div>
        )}

        <Bookshelf letters={receivedLetters} title="প্রাপ্ত চিঠি" />
        <Bookshelf letters={deliveredSentLetters} title="পাঠানো চিঠি" />
      </div>
    </Layout>
  );
};
