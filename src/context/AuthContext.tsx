import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, onSnapshot, updateDoc, increment } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { format } from 'date-fns';

interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: string;
  allowSearch: boolean;
  chocolateBalance: number;
  createdAt: any;
  blockedUsers?: string[];
  lastLoginDate?: string;
  stamps?: string[];
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  isAuthReady: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  isAuthReady: false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setIsAuthReady(true);
      if (!user) {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const unsubscribeProfile = onSnapshot(doc(db, 'users', user.uid), async (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data() as UserProfile;
          setProfile(data);
          
          // Daily Gift Logic
          const today = format(new Date(), 'yyyy-MM-dd');
          if (data.lastLoginDate !== today) {
            try {
              await updateDoc(doc(db, 'users', user.uid), {
                lastLoginDate: today,
                chocolateBalance: increment(3) // 3 daily gifts
              });
              console.log("Daily gift awarded!");
            } catch (err) {
              console.error("Error awarding daily gift:", err);
            }
          }
        } else {
          setProfile(null);
        }
        setLoading(false);
      }, (error) => {
        console.error("Profile snapshot error:", error);
        setLoading(false);
      });

      return () => unsubscribeProfile();
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAuthReady }}>
      {children}
    </AuthContext.Provider>
  );
};
