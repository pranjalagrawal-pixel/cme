import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center p-2 rounded-full border bg-white border-[#061F48]/10 hover:border-[#D09515]/40 dark:bg-[#061F48] dark:border-white/10 dark:hover:border-[#D09515]/40 text-[#061F48] dark:text-[#F8F5ED] shadow-sm transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer outline-none select-none overflow-hidden group"
      title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Late-night Study Mode (Dark)'}
      aria-label="Toggle Theme"
    >
      {/* Background radial accent glow on hover */}
      <span className="absolute inset-0 bg-[#D09515]/5 dark:bg-[#D09515]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded-full pointer-events-none" />

      <motion.div
        initial={false}
        animate={{
          rotate: theme === 'dark' ? 180 : 0,
          scale: 1,
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="relative h-5 w-5 flex items-center justify-center"
      >
        {theme === 'dark' ? (
          <Moon className="h-4.5 w-4.5 text-[#D09515] fill-[#D09515]/10" />
        ) : (
          <Sun className="h-4.5 w-4.5 text-[#D09515] fill-[#D09515]/10" />
        )}
      </motion.div>
    </button>
  );
}
