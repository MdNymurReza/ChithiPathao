import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut, User, PenTool, BookOpen, Heart, Bike, Award } from 'lucide-react';
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
    { path: '/post-office', icon: Bike, label: 'ডাকঘর' },
    { path: '/stamps', icon: Award, label: 'স্ট্যাম্প' },
    { path: '/chocolates', icon: Heart, label: 'চকলেট' },
    { path: '/profile', icon: User, label: 'প্রোফাইল' },
  ];

  return (
    <div className="min-h-screen bg-paper font-sans text-ink">
      {/* Header */}
      <header className="glass sticky top-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm group-hover:bg-slate-700 transition-colors">
              <BookOpen size={16} />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">
              ডাকঘর
            </span>
          </Link>

          {user && (
            <div className="flex items-center gap-6">
              <div className="hidden md:flex items-center gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                      location.pathname === item.path
                        ? 'bg-slate-100 text-primary font-semibold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-primary'
                    }`}
                  >
                    <item.icon size={16} />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>

              <div className="flex items-center gap-4 border-l border-slate-200 pl-6">
                <div className="text-right hidden sm:block">
                  <p className="text-xs font-semibold text-primary">{profile?.firstName || 'ব্যবহারকারী'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-8 h-8 flex items-center justify-center text-slate-400 hover:bg-red-50 hover:text-red-600 rounded-lg transition-all"
                  title="লগআউট"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Mobile Nav */}
      {user && (
        <nav className="md:hidden fixed bottom-4 left-4 right-4 glass rounded-2xl z-50 px-4 py-3 shadow-lg border border-slate-200/50">
          <div className="flex justify-around items-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 transition-all ${
                  location.pathname === item.path ? 'text-accent' : 'text-slate-400'
                }`}
              >
                <item.icon size={20} />
                <span className="text-[10px] font-medium">{item.label}</span>
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
