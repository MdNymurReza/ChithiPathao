import React, { useEffect, useState, useMemo } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Layout } from '../components/Layout';
import { motion, AnimatePresence } from 'motion/react';
import { Bike, Clock, MapPin, CheckCircle2, ArrowRight, Package, Navigation } from 'lucide-react';
import { formatDistanceToNow, differenceInSeconds } from 'date-fns';
import { bn } from 'date-fns/locale';

interface Letter {
  id: string;
  receiverId: string;
  senderId: string;
  deliveryTime: any;
  createdAt: any;
  status: string;
  receiverName?: string;
}

const TrackingItem: React.FC<{ letter: Letter; index: number }> = ({ letter, index }) => {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const deliveryDate = letter.deliveryTime?.toDate?.() || new Date();
  const createdDate = letter.createdAt?.toDate?.() || new Date();
  const isDelivered = deliveryDate <= now;

  const totalDuration = Math.max(1, differenceInSeconds(deliveryDate, createdDate));
  const elapsed = differenceInSeconds(now, createdDate);
  const progress = Math.min(100, Math.max(0, (elapsed / totalDuration) * 100));

  const timeLeft = !isDelivered 
    ? formatDistanceToNow(deliveryDate, { locale: bn, addSuffix: true }) 
    : null;

  const secondsRemaining = !isDelivered 
    ? Math.max(0, differenceInSeconds(deliveryDate, now)) 
    : 0;

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 }}
      className="card-nostalgic p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-primary/30 transition-all relative overflow-hidden"
    >
      {/* Background Progress Indicator */}
      {!isDelivered && (
        <div 
          className="absolute bottom-0 left-0 h-1 bg-accent/20 transition-all duration-1000"
          style={{ width: `${progress}%` }}
        />
      )}

      <div className={`w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0 relative z-10 ${
        isDelivered ? 'bg-primary/10 text-primary' : 'bg-accent/10 text-accent'
      }`}>
        {isDelivered ? (
          <CheckCircle2 size={28} />
        ) : (
          <div className="relative">
            <Clock size={28} className="animate-pulse" />
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              className="absolute -inset-1 border-2 border-accent/30 border-t-accent rounded-full"
            />
          </div>
        )}
      </div>

      <div className="flex-1 text-center md:text-left space-y-2 relative z-10">
        <div className="flex items-center justify-center md:justify-start gap-2">
          <span className="text-xs font-bold text-primary/40 uppercase tracking-widest">প্রাপক:</span>
          <span className="font-bold text-primary">{letter.receiverName || 'অজানা'}</span>
          {!isDelivered && (
            <span className="px-2 py-0.5 bg-accent/10 text-accent text-[10px] font-bold rounded-full animate-pulse">
              চলমান
            </span>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-primary/60 italic font-serif">
            {isDelivered ? 'চিঠিটি সফলভাবে পৌঁছেছে।' : `চিঠিটি গন্তব্যের পথে আছে।`}
          </p>
          {!isDelivered && (
            <div className="flex items-center justify-center md:justify-start gap-3 text-xs font-bold text-accent">
              <div className="flex items-center gap-1">
                <Navigation size={12} />
                <span>পৌঁছাবে {timeLeft}</span>
              </div>
              <div className="w-1 h-1 bg-accent/30 rounded-full" />
              <div className="font-mono bg-accent/5 px-2 py-0.5 rounded">
                {formatCountdown(secondsRemaining)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col items-center md:items-end gap-3 relative z-10">
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-tighter text-primary/30">
          <Package size={12} />
          <span>ঢাকা জিপিও</span>
          <ArrowRight size={10} />
          <span>গন্তব্য</span>
        </div>
        
        {!isDelivered && (
          <div className="flex flex-col items-end gap-1">
            <div className="w-32 h-1.5 bg-primary/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-accent shadow-[0_0_8px_rgba(242,125,38,0.5)]"
              />
            </div>
            <span className="text-[9px] font-bold text-primary/20 uppercase tracking-widest">
              {Math.round(progress)}% সম্পন্ন
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const PostOffice: React.FC = () => {
  const { user } = useAuth();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'letters'),
      where('senderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lettersData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Letter[];
      setLetters(lettersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const stats = useMemo(() => {
    const inTransit = letters.filter(l => {
      const time = l.deliveryTime?.toMillis?.() || 0;
      return time > currentTime.getTime();
    });
    const delivered = letters.filter(l => {
      const time = l.deliveryTime?.toMillis?.() || 0;
      return time <= currentTime.getTime();
    });
    return { inTransit, delivered };
  }, [letters, currentTime]);

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-12 pb-20">
        <div className="text-center space-y-4">
          <div className="inline-block p-3 bg-accent/10 rounded-full text-accent mb-2">
            <Bike size={32} className="animate-bike-pedal" />
          </div>
          <h1 className="text-4xl font-display font-bold text-primary">ডাকঘর ট্র্যাকিং</h1>
          <p className="text-primary/60 font-serif italic max-w-lg mx-auto">
            আপনার পাঠানো চিঠিগুলো এখন কোথায় আছে এবং কখন পৌঁছাবে তা এখান থেকে রিয়েল-টাইমে দেখে নিন।
          </p>
          <div className="pt-4">
            <button 
              onClick={() => window.location.reload()}
              className="text-xs font-bold uppercase tracking-widest text-primary/40 hover:text-accent transition-colors flex items-center gap-2 mx-auto"
            >
              <Navigation size={14} className="rotate-90" />
              পেজটি রিলোড করুন
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Stats */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-nostalgic p-8 text-center space-y-2 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-accent group-hover:w-2 transition-all" />
              <p className="text-4xl font-display font-bold text-accent">{stats.inTransit.length}</p>
              <p className="text-xs uppercase tracking-widest font-bold text-primary/40">পথে আছে</p>
            </div>
            <div className="card-nostalgic p-8 text-center space-y-2 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary group-hover:w-2 transition-all" />
              <p className="text-4xl font-display font-bold text-primary">{stats.delivered.length}</p>
              <p className="text-xs uppercase tracking-widest font-bold text-primary/40">পৌঁছেছে</p>
            </div>
          </div>

          {/* Tracking List */}
          <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-primary font-display">চিঠির অবস্থা</h2>
              <div className="flex-1 h-px bg-primary/10"></div>
            </div>

            {loading ? (
              <div className="py-20 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              </div>
            ) : letters.length === 0 ? (
              <div className="card-nostalgic p-12 text-center">
                <p className="text-primary/40 italic">আপনি এখনো কোনো চিঠি পাঠাননি...</p>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                  {letters.map((letter, index) => (
                    <TrackingItem key={letter.id} letter={letter} index={index} />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};
