import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { Bookshelf } from '../components/Bookshelf';
import { Layout } from '../components/Layout';

interface Letter {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  preview: string;
  isAnonymous: boolean;
  createdAt: any;
  status: string;
  senderName?: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [receivedLetters, setReceivedLetters] = useState<Letter[]>([]);
  const [sentLetters, setSentLetters] = useState<Letter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Fetch received letters
    const qReceived = query(
      collection(db, 'letters'),
      where('receiverId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeReceived = onSnapshot(qReceived, async (snapshot) => {
      const lettersData = await Promise.all(snapshot.docs.map(async (letterDoc) => {
        const data = letterDoc.data() as Letter;
        let senderName = 'অজানা';
        
        if (!data.isAnonymous) {
          const senderDoc = await getDoc(doc(db, 'users', data.senderId));
          if (senderDoc.exists()) {
            const senderData = senderDoc.data();
            senderName = `${senderData.firstName} ${senderData.lastName}`;
          }
        }
        
        return { ...data, id: letterDoc.id, senderName };
      }));
      setReceivedLetters(lettersData);
      setLoading(false);
    });

    // Fetch sent letters
    const qSent = query(
      collection(db, 'letters'),
      where('senderId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribeSent = onSnapshot(qSent, async (snapshot) => {
      const lettersData = await Promise.all(snapshot.docs.map(async (letterDoc) => {
        const data = letterDoc.data() as Letter;
        let receiverName = 'প্রাপক';
        
        const receiverDoc = await getDoc(doc(db, 'users', data.receiverId));
        if (receiverDoc.exists()) {
          const receiverData = receiverDoc.data();
          receiverName = `${receiverData.firstName} ${receiverData.lastName}`;
        }
        
        return { ...data, id: letterDoc.id, senderName: receiverName }; // Using senderName field for display in Bookshelf
      }));
      setSentLetters(lettersData);
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
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-20 py-8">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-display font-bold text-primary mb-2">আপনার চিঠিপত্র</h1>
          <p className="text-primary/60 italic">আপনার ডিজিটাল চিঠির বাক্স</p>
        </div>
        <Bookshelf letters={receivedLetters} title="প্রাপ্ত চিঠি" />
        <Bookshelf letters={sentLetters} title="পাঠানো চিঠি" />
      </div>
    </Layout>
  );
};
