import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Send, Heart, Shield, Search, ArrowRight } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-6 h-16 flex justify-between items-center border-b border-slate-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-sm">
            <Mail size={16} />
          </div>
          <span className="text-xl font-bold text-primary tracking-tight">ডাকঘর</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-slate-600 text-sm font-medium hover:text-primary transition-colors">লগইন</Link>
          <Link to="/signup" className="btn-primary py-2 px-6 text-sm">শুরু করুন</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-none border border-accent/20 text-accent text-[10px] font-bold uppercase tracking-[0.3em] mb-8">
              স্মৃতির পাতায় এক টুকরো ভালোবাসা
            </div>
            <h1 className="text-7xl md:text-9xl font-display font-bold text-primary leading-[0.85] mb-10 tracking-tighter">
              চিঠির টানে <br />
              <span className="text-accent italic font-serif font-light">হৃদয়ের বন্ধন</span>
            </h1>
            <p className="text-xl text-primary/60 max-w-lg mb-12 leading-relaxed font-serif italic">
              ডিজিটাল যুগেও চিঠির সেই পুরনো স্পর্শ ফিরিয়ে আনুন। প্রিয়জনকে পাঠান মনের গহীনের কথা, সাথে থাকুক ভালোবাসার মিষ্টি উপহার।
            </p>
            <div className="flex flex-wrap gap-6">
              <Link to="/signup" className="btn-primary flex items-center gap-3 group">
                চিঠি লেখা শুরু করুন <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/login" className="btn-secondary">
                লগইন করুন
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2 }}
            className="relative"
          >
            <div className="relative z-10 rounded-sm overflow-hidden shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] rotate-2 hover:rotate-0 transition-transform duration-700 p-4 bg-white border border-[#e5e0d5]">
              <img 
                src="https://images.unsplash.com/photo-1579017331233-fc95e07627b7?auto=format&fit=crop&q=80&w=800" 
                alt="Vintage Letter" 
                className="w-full h-auto grayscale-[0.2] sepia-[0.1]"
                referrerPolicy="no-referrer"
              />
              <div className="mt-4 text-center">
                <span className="stamp-effect">ডাকঘর ২০২৪</span>
              </div>
            </div>
            <div className="absolute -top-12 -right-12 w-48 h-48 bg-accent/5 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-32 bg-white px-6 border-y border-[#e5e0d5]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="text-5xl font-display font-bold text-primary mb-6 tracking-tight">কেন ডাকঘর?</h2>
            <div className="w-24 h-px bg-primary/20 mx-auto"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-16">
            {[
              {
                icon: <Heart size={28} />,
                title: "আবেগমাখা চিঠি",
                desc: "মনের গহীনের অব্যক্ত কথাগুলো লিখে পাঠান প্রিয় মানুষকে, ঠিক যেমনটা আগে হতো সেই সোনালী দিনগুলোতে।"
              },
              {
                icon: <Send size={28} />,
                title: "ভালোবাসার উপহার",
                desc: "চিঠির সাথে পাঠান মিষ্টি চকলেট, যা আপনার ভালোবাসার ভাষাকে করবে আরও মধুর ও স্মৃতিময়।"
              },
              {
                icon: <Shield size={28} />,
                title: "গোপন ও নিরাপদ",
                desc: "আপনার প্রতিটি অনুভূতি এবং তথ্য আমাদের কাছে সম্পূর্ণ নিরাপদ এবং একান্তই আপনার নিজের।"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center group"
              >
                <div className="w-20 h-20 mx-auto bg-paper border border-[#e5e0d5] rounded-full flex items-center justify-center mb-8 group-hover:bg-primary group-hover:text-white transition-all duration-500 text-primary">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-primary mb-6">{feature.title}</h3>
                <p className="text-primary/60 leading-relaxed font-serif italic text-lg">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-bold mb-2 tracking-tighter">১০০০+</div>
            <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">সক্রিয় সদস্য</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2 tracking-tighter">৫০০০+</div>
            <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">পাঠানো চিঠি</div>
          </div>
          <div>
            <div className="text-5xl font-bold mb-2 tracking-tighter">২০০০+</div>
            <div className="text-slate-400 uppercase tracking-widest text-[10px] font-bold">চকলেট উপহার</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Mail size={16} />
            </div>
            <span className="text-xl font-bold text-primary tracking-tight">ডাকঘর</span>
          </div>
          <p className="text-slate-400 text-sm">© ২০২৪ ডাকঘর। সকল স্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <Link to="#" className="text-slate-400 hover:text-primary transition-colors text-sm">শর্তাবলী</Link>
            <Link to="#" className="text-slate-400 hover:text-primary transition-colors text-sm">গোপনীয়তা</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
