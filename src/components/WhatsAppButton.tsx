import React, { useState, useEffect } from 'react';
import { MessageCircle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function WhatsAppButton() {
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasClosedTooltip, setHasClosedTooltip] = useState(false);

  // Trigger a friendly popup tooltip after 3 seconds on first load
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!hasClosedTooltip) {
        setShowTooltip(true);
      }
    }, 3500);
    return () => clearTimeout(timer);
  }, [hasClosedTooltip]);

  const handleCloseTooltip = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setShowTooltip(false);
    setHasClosedTooltip(true);
  };

  // Dedicated WhatsApp link with a professional pre-filled inquiry message
  const whatsappNumber = '918103723533';
  const welcomeMessage = 'Hello Concept Made Easy, I am interested in upcoming class schedules, tuition courses, and educational resources. Please guide me!';
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(welcomeMessage)}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      
      {/* Tooltip dialog */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="bg-[#061F48] text-white border border-[#D09515]/30 rounded-2xl p-4 shadow-2xl max-w-xs w-72 text-left relative overflow-hidden"
          >
            {/* Background design accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D09515]/5 rounded-full -mr-8 -mt-8 pointer-events-none" />
            
            {/* Close button */}
            <button
              onClick={handleCloseTooltip}
              className="absolute top-3 right-3 text-white/50 hover:text-white transition-colors cursor-pointer"
              aria-label="Close message"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Content */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[#25D366] animate-pulse" />
                <span className="text-[10px] font-black text-[#D09515] uppercase tracking-wider">Admissions Office Open</span>
              </div>
              <h4 className="text-xs font-bold text-white pr-4">Need help with registration?</h4>
              <p className="text-[11px] text-white/80 font-semibold leading-normal">
                Chat with an academic counselor on WhatsApp for instant seat booking and class schedules.
              </p>
              <div className="pt-1">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setShowTooltip(false)}
                  className="inline-flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-[#061F48] px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  <span>Start Chat</span>
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Interactive Button */}
      <motion.div
        initial={{ scale: 0, rotate: -45 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 1 }}
        className="relative group"
      >
        {/* Pulsing Outer Rings */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/30 animate-ping pointer-events-none" style={{ animationDuration: '3s' }} />
        <span className="absolute -inset-1.5 rounded-full border border-[#25D366]/40 animate-pulse pointer-events-none" style={{ animationDuration: '2s' }} />

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2.5 bg-[#25D366] hover:bg-[#20ba5a] text-white p-3.5 sm:p-4 rounded-full shadow-2xl transition-all duration-300 transform hover:scale-105 active:scale-95 border border-white/25 cursor-pointer relative"
          aria-label="Chat on WhatsApp"
        >
          {/* Slide-out text label on hover (for desktop) */}
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-out whitespace-nowrap text-xs font-extrabold uppercase tracking-wider text-[#061F48] hidden sm:inline-block">
            Chat with CME
          </span>
          <MessageCircle className="h-6 w-6 text-[#061F48] sm:text-[#061F48] group-hover:rotate-12 transition-transform duration-300" />
        </a>
      </motion.div>

    </div>
  );
}
