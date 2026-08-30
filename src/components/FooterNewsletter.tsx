import React, { useState } from 'react';
import { Mail, Check, Loader2 } from 'lucide-react';
import { db, doc, setDoc } from '../lib/firebase';
import { useToast } from '../context/ToastContext';

export default function FooterNewsletter() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);
  const { addToast } = useToast();

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.trim()) {
      addToast({
        title: 'Error',
        description: 'Please enter a valid email address.',
        type: 'error'
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      addToast({
        title: 'Invalid Email',
        description: 'Please double-check your email format.',
        type: 'warning'
      });
      return;
    }

    setSubmitting(true);

    try {
      const id = 'news_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      await setDoc(doc(db, 'newsletters', id), {
        id,
        email: email.trim().toLowerCase(),
        subscribedAt: new Date().toISOString(),
        source: 'footer_signup'
      });

      setSubscribed(true);
      setEmail('');
      addToast({
        title: 'Subscription Successful!',
        description: 'Thank you for subscribing! You will receive upcoming schedules and resources.',
        type: 'success'
      });
    } catch (err: any) {
      console.error('Newsletter subscription error:', err);
      addToast({
        title: 'Subscription Failed',
        description: err.message || 'There was an issue saving your request. Please try again.',
        type: 'error'
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 sm:p-8 md:p-10 mb-12 transform hover:border-[#D09515]/30 transition-all duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        
        {/* Left column: Text Content */}
        <div className="lg:col-span-7 space-y-2">
          <span className="text-[10px] font-black text-[#D09515] uppercase tracking-wider block">Stay Informed</span>
          <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-sans">
            Subscribe to CME Newsletter
          </h3>
          <p className="text-xs sm:text-sm text-white/70 font-semibold leading-relaxed max-w-xl">
            Get early alerts on new batches, revised CBSE/Competitive board blueprints, and free mentor-curated formula sheets direct to your inbox.
          </p>
        </div>

        {/* Right column: Interactive Input Form */}
        <div className="lg:col-span-5 w-full">
          {subscribed ? (
            <div className="bg-[#D09515]/10 border border-[#D09515]/20 rounded-2xl p-4 flex items-center gap-3.5 text-left text-[#D09515] animate-fade-in">
              <div className="h-9 w-9 rounded-full bg-[#D09515] text-[#061F48] flex items-center justify-center shrink-0">
                <Check className="h-5 w-5 stroke-[3]" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider">You're on the list!</p>
                <p className="text-[11px] font-semibold text-white/85 mt-0.5">Welcome! Your priority updates are locked in.</p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubscribe} className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-white/40" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter parent or student email..."
                  required
                  disabled={submitting}
                  className="w-full bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/10 focus:border-[#D09515] rounded-xl pl-10 pr-4 py-3 text-xs font-semibold text-white placeholder-white/45 focus:outline-none focus:ring-1 focus:ring-[#D09515] transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="bg-[#D09515] hover:bg-white hover:text-[#061F48] text-[#061F48] px-5 py-3 rounded-xl text-xs font-black uppercase tracking-wider shrink-0 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md active:scale-98"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Subscribing...</span>
                  </>
                ) : (
                  <span>Subscribe</span>
                )}
              </button>
            </form>
          )}
        </div>

      </div>
    </div>
  );
}
