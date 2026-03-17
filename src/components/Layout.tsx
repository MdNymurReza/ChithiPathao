import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, PenTool, BookOpen, Heart } from 'lucide-react';
import { motion } from 'motion/react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard', icon: BookOpen, label: 'চিঠির তাক' },
    { path: '/write-letter', icon: PenTool, label: 'চিঠি লিখুন' },
    { path: '/chocolates', icon: Heart, label: 'চকলেট' },
    { path: '/profile', icon: User, label: 'প্রোফাইল' },
  ];

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      {/* Header */}
      <header className="glass sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform">
              <BookOpen size={20} />
            </div>
            <span className="text-3xl font-display font-bold text-primary tracking-tighter">
              ডাকঘর
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-8">
              <div className="hidden md:flex items-center gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${
                      location.pathname === item.path
                        ? 'bg-primary text-white shadow-md'
                        : 'text-primary/60 hover:bg-primary/5 hover:text-primary'
                    }`}
                  >
                    <item.icon size={18} />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 border-l border-primary/10 pl-8">
                <div className="text-right hidden sm:block">
                  <p className="text-[10px] text-primary/40 uppercase tracking-widest font-bold">সদস্য</p>
                  <p className="text-sm font-display font-bold text-primary">{profile?.firstName || 'ব্যবহারকারী'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-10 h-10 flex items-center justify-center text-primary/40 hover:bg-red-50 hover:text-red-600 rounded-full transition-all"
                  title="লগআউট"
                >
                  <LogOut size={20} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Nav */}
      {user && (
        <nav className="md:hidden fixed bottom-6 left-6 right-6 glass rounded-3xl z-50 px-6 py-3 shadow-2xl">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  location.pathname === item.path ? 'text-primary scale-110' : 'text-primary/30'
                }`}
              >
                <item.icon size={22} />
                <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
};
