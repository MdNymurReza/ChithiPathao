import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Mail, Send, Heart, Shield, Users, Sparkles } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-paper overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
            <Mail size={20} />
          </div>
          <span className="text-2xl font-display font-bold text-primary">ডাকঘর</span>
        </div>
        <div className="flex items-center gap-6">
          <Link to="/login" className="text-primary font-medium hover:opacity-70 transition-opacity">লগইন</Link>
          <Link to="/signup" className="btn-primary py-2 px-6">শুরু করুন</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-black text-primary leading-[0.9] mb-6">
              চিঠির টানে <br />
              <span className="text-accent italic">নতুন বন্ধন</span>
            </h1>
            <p className="text-xl text-primary/70 max-w-lg mb-10 font-serif leading-relaxed">
              ডিজিটাল যুগেও চিঠির সেই পুরনো অনুভূতি ফিরিয়ে আনুন। প্রিয়জনকে পাঠান মনের কথা, সাথে থাকুক মিষ্টি চকলেট।
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/signup" className="btn-primary text-lg px-10 py-4 flex items-center gap-2">
                চিঠি লেখা শুরু করুন <Send size={20} />
              </Link>
              <Link to="/login" className="btn-secondary text-lg px-10 py-4">
                লগইন করুন
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1 }}
            className="relative"
          >
            <div className="relative z-10 rounded-[40px] overflow-hidden shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
              <img 
                src="https://images.unsplash.com/photo-1579017331233-fc95e07627b7?auto=format&fit=crop&q=80&w=800" 
                alt="Letter Writing" 
                className="w-full h-auto"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl -z-10"></div>
            <div className="absolute -bottom-10 -left-10 w-60 h-60 bg-primary/10 rounded-full blur-3xl -z-10"></div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-primary mb-4">কেন ডাকঘর?</h2>
            <div className="w-24 h-1 bg-accent mx-auto rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                icon: <Heart className="text-pink-500" />,
                title: "আবেগমাখা চিঠি",
                desc: "মনের গহীনের কথাগুলো লিখে পাঠান প্রিয় মানুষকে, ঠিক যেমনটা আগে হতো।"
              },
              {
                icon: <Sparkles className="text-yellow-500" />,
                title: "মিষ্টি উপহার",
                desc: "চিঠির সাথে পাঠান ডিজিটাল চকলেট, যা আপনার ভালোবাসাকে করবে আরও মধুর।"
              },
              {
                icon: <Shield className="text-blue-500" />,
                title: "নিরাপদ ও ব্যক্তিগত",
                desc: "আপনার প্রতিটি চিঠি এবং তথ্য আমাদের কাছে সম্পূর্ণ নিরাপদ এবং গোপন।"
              }
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="p-10 rounded-[32px] bg-paper hover:shadow-xl transition-all group"
              >
                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-display font-bold text-primary mb-4">{feature.title}</h3>
                <p className="text-primary/60 leading-relaxed">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 px-6 bg-primary text-white">
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-12 text-center">
          <div>
            <div className="text-5xl font-display font-black mb-2">১০০০+</div>
            <div className="text-white/60 uppercase tracking-widest text-sm">সক্রিয় সদস্য</div>
          </div>
          <div>
            <div className="text-5xl font-display font-black mb-2">৫০০০+</div>
            <div className="text-white/60 uppercase tracking-widest text-sm">পাঠানো চিঠি</div>
          </div>
          <div>
            <div className="text-5xl font-display font-black mb-2">২০০০+</div>
            <div className="text-white/60 uppercase tracking-widest text-sm">চকলেট উপহার</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-primary/10">
        <div className="max-w-7xl mx-auto flex flex-col md:row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white">
              <Mail size={16} />
            </div>
            <span className="text-xl font-display font-bold text-primary">ডাকঘর</span>
          </div>
          <p className="text-primary/40 text-sm">© ২০২৪ ডাকঘর। সকল স্বত্ব সংরক্ষিত।</p>
          <div className="flex gap-6">
            <Link to="#" className="text-primary/60 hover:text-primary transition-colors">শর্তাবলী</Link>
            <Link to="#" className="text-primary/60 hover:text-primary transition-colors">গোপনীয়তা</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
