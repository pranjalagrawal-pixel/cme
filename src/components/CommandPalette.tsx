import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  Home, 
  BookOpen, 
  Sparkles, 
  ShieldAlert, 
  User, 
  Users, 
  PhoneCall, 
  FileText, 
  Command, 
  ArrowRight,
  HelpCircle,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface PaletteItem {
  id: string;
  title: string;
  description: string;
  path: string;
  category: 'portals' | 'pages' | 'legal';
  icon: React.ComponentType<any>;
  rolesAllowed?: ('student' | 'teacher' | 'parent' | 'admin')[];
  shortcut?: string;
}

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Command palette items list
  const allItems: PaletteItem[] = [
    {
      id: 'student-portal',
      title: 'Student Portal & Live Classroom',
      description: 'Access study materials, raise doubts, and join live mentor boards.',
      path: '/student-portal',
      category: 'portals',
      icon: User,
      rolesAllowed: ['student', 'parent', 'admin'],
      shortcut: 'S'
    },
    {
      id: 'teacher-portal',
      title: 'Teacher Portal & Live Stream Controls',
      description: 'Launch classes, schedule board streams, and resolve student doubts.',
      path: '/teacher-portal',
      category: 'portals',
      icon: Users,
      rolesAllowed: ['teacher', 'admin'],
      shortcut: 'T'
    },
    {
      id: 'admin-portal',
      title: 'Administrator Dashboard',
      description: 'Review fee submissions, award scholarships, and push system announcements.',
      path: '/admin',
      category: 'portals',
      icon: ShieldAlert,
      rolesAllowed: ['admin'],
      shortcut: 'A'
    },
    {
      id: 'home',
      title: 'Concept Made Easy - Home Portal',
      description: 'Overview of standard tuition cohorts, fee tables, and course outcomes.',
      path: '/',
      category: 'pages',
      icon: Home,
      shortcut: 'H'
    },
    {
      id: 'about',
      title: 'About Concept Made Easy & Faculty',
      description: 'Learn about our rigorous core concepts, system blueprints, and teachers.',
      path: '/about',
      category: 'pages',
      icon: HelpCircle,
      shortcut: 'B'
    },
    {
      id: 'programs',
      title: 'Programs & Monthly Tuition Fees',
      description: 'Explore Classes 6-12 subject-wise fees and comprehensive competitive preps.',
      path: '/programs',
      category: 'pages',
      icon: BookOpen,
      shortcut: 'P'
    },
    {
      id: 'test-series',
      title: 'Board Practice & Mock Test Series',
      description: 'Review current exam-focused test series schedules and pricing matrices.',
      path: '/test-series',
      category: 'pages',
      icon: FileText,
      shortcut: 'M'
    },
    {
      id: 'scholarship',
      title: 'Scholarship Admission Test (SAT)',
      description: 'Apply for academic need-based tuition fee waivers and diagnostic scoring.',
      path: '/scholarship',
      category: 'pages',
      icon: Sparkles,
      shortcut: 'W'
    },
    {
      id: 'contact',
      title: 'Contact Admission Desk',
      description: 'Post structural enquiries or locate physical coordinator support lines.',
      path: '/contact',
      category: 'pages',
      icon: PhoneCall,
      shortcut: 'C'
    },
    {
      id: 'careers',
      title: 'Careers & Faculty Openings',
      description: 'Join our elite online coaching faculty. Teach Physics, Chemistry, Maths, and Biology remotely.',
      path: '/careers',
      category: 'pages',
      icon: Briefcase,
      shortcut: 'E'
    },
    {
      id: 'startup-screen',
      title: 'Preview Startup Splash & Boot Sequence',
      description: 'Replay Concept Made Easy startup animation, system health verification, and syllabus engine boot.',
      path: '__cme_startup__',
      category: 'pages',
      icon: Sparkles,
      shortcut: 'Z'
    },
    {
      id: 'legal',
      title: 'Academic Policies & Compliance Guidelines',
      description: 'Review legally-binding refund procedures, payment reconciliation, and terms.',
      path: '/legal',
      category: 'legal',
      icon: FileText,
      shortcut: 'L'
    }
  ];

  // Filter items based on query and user's role authorization
  const filteredItems = allItems.filter(item => {
    // If user is not admin, filter out role-restricted portal items they cannot access
    if (item.rolesAllowed && userProfile) {
      const isAuthorized = item.rolesAllowed.includes(userProfile.role);
      if (!isAuthorized) return false;
    } else if (item.rolesAllowed && !userProfile) {
      // If guest user, keep portals but let them click to go to login flow
    }

    const matchesSearch = 
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesSearch;
  });

  // Listen for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }

      // Esc to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Listen for external open triggers (custom events)
  useEffect(() => {
    const handleOpenTrigger = () => {
      setIsOpen(true);
    };

    window.addEventListener('cme_open_command_palette', handleOpenTrigger);
    return () => window.removeEventListener('cme_open_command_palette', handleOpenTrigger);
  }, []);

  // Handle arrow keys and enter within the active list
  useEffect(() => {
    if (!isOpen) return;

    const handleListKeyDown = (e: KeyboardEvent) => {
      const items = filteredItems || [];
      if ((items || []).length === 0) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % ((items || []).length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + ((items || []).length || 1)) % ((items || []).length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (items[selectedIndex]) {
          handleSelect(items[selectedIndex].path);
        }
      }
    };

    window.addEventListener('keydown', handleListKeyDown);
    return () => window.removeEventListener('keydown', handleListKeyDown);
  }, [isOpen, selectedIndex, filteredItems]);

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      document.body.style.overflow = 'hidden';
    } else {
      setSearchQuery('');
      document.body.style.overflow = 'unset';
    }
  }, [isOpen]);

  const handleSelect = (path: string) => {
    if (path === '__cme_startup__') {
      window.dispatchEvent(new CustomEvent('cme_trigger_startup_screen'));
    } else {
      navigate(path);
    }
    setIsOpen(false);
  };

  // Group items by category for layout
  const categoriesMap = {
    portals: 'Portals & Dashboards',
    pages: 'Institutional Pages',
    legal: 'Guidelines & Legal Compliance'
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 md:px-0">
          
          {/* Backdrop Blur/Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-[#061F48]/40 backdrop-blur-sm"
          />

          {/* Dialog Body */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            ref={containerRef}
            className="bg-[#F8F5ED] w-full max-w-xl rounded-3xl border border-[#061F48]/15 shadow-2xl overflow-hidden z-10 flex flex-col max-h-[60vh] relative"
          >
            {/* Top Search bar */}
            <div className="relative border-b border-[#061F48]/10 p-4 shrink-0">
              <Search className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-[#061F48]/45" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search courses, test portals, fee schedules..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#061F48]/10 focus:border-[#D09515] rounded-2xl pl-12 pr-16 py-3.5 text-sm font-bold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515] placeholder-[#061F48]/40 transition-colors"
              />
              <div className="absolute right-7 top-1/2 -translate-y-1/2 flex items-center gap-1">
                <span className="text-[10px] bg-[#061F48]/5 text-[#061F48]/60 font-mono font-bold border border-[#061F48]/10 px-1.5 py-0.5 rounded-md">
                  ESC
                </span>
              </div>
            </div>

            {/* Results list */}
            <div className="flex-grow overflow-y-auto p-3 space-y-4">
              {(filteredItems || []).length === 0 ? (
                <div className="text-center py-10 px-4 space-y-2">
                  <Command className="mx-auto h-8 w-8 text-[#061F48]/20 stroke-[1.5]" />
                  <p className="text-xs font-bold text-[#061F48]">No matching directories found</p>
                  <p className="text-[11px] font-semibold text-[#061F48]/60 max-w-xs mx-auto">
                    Try searching for keywords like "jee", "doubt", "fees", "rules", or portal abbreviations.
                  </p>
                </div>
              ) : (
                ['portals', 'pages', 'legal'].map((catKey) => {
                  const itemsInCat = (filteredItems || []).filter(item => item && item.category === catKey);
                  if ((itemsInCat || []).length === 0) return null;

                  return (
                    <div key={catKey} className="space-y-1">
                      <h5 className="text-[10px] font-black text-[#D09515] uppercase tracking-wider pl-3.5 mb-1.5">
                        {categoriesMap[catKey as keyof typeof categoriesMap]}
                      </h5>
                      
                      <div className="space-y-1">
                        {(itemsInCat || []).map((item) => {
                          const itemGlobalIndex = (filteredItems || []).findIndex(f => f && f.id === item.id);
                          const isSelected = itemGlobalIndex === selectedIndex;
                          const IconComponent = item.icon;

                          return (
                            <button
                              key={item.id}
                              onClick={() => handleSelect(item.path)}
                              onMouseEnter={() => setSelectedIndex(itemGlobalIndex)}
                              className={`w-full text-left p-3 rounded-2xl transition-all duration-150 flex items-center justify-between gap-4 cursor-pointer relative overflow-hidden group ${
                                isSelected 
                                  ? 'bg-[#061F48] text-white shadow-md' 
                                  : 'bg-transparent text-[#061F48] hover:bg-[#061F48]/5'
                              }`}
                            >
                              {/* Background highlight pattern for selected item */}
                              {isSelected && (
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#D09515]/5 to-[#D09515]/10 opacity-30 pointer-events-none" />
                              )}

                              <div className="flex items-center gap-3.5 z-10">
                                <div className={`p-2 rounded-xl shrink-0 transition-colors ${
                                  isSelected ? 'bg-white/15 text-[#D09515]' : 'bg-[#061F48]/5 text-[#061F48]'
                                }`}>
                                  <IconComponent className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-extrabold">{item.title}</span>
                                    {item.rolesAllowed && (
                                      <span className={`text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full border ${
                                        isSelected 
                                          ? 'bg-white/10 text-white/90 border-white/20' 
                                          : 'bg-[#D09515]/10 text-[#D09515] border-[#D09515]/20'
                                      }`}>
                                        Authorized
                                      </span>
                                    )}
                                  </div>
                                  <p className={`text-[10px] font-semibold line-clamp-1 leading-normal ${
                                    isSelected ? 'text-white/75' : 'text-[#061F48]/60'
                                  }`}>
                                    {item.description}
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 shrink-0 z-10">
                                {isSelected ? (
                                  <motion.div 
                                    layoutId="arrow"
                                    className="text-[#D09515]"
                                  >
                                    <ArrowRight className="h-3.5 w-3.5" />
                                  </motion.div>
                                ) : (
                                  item.shortcut && (
                                    <span className="text-[9px] font-mono font-bold text-[#061F48]/40 bg-[#061F48]/5 px-1.5 py-0.5 rounded border border-[#061F48]/10 uppercase">
                                      {item.shortcut}
                                    </span>
                                  )
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Bottom Keyboard instruction guides */}
            <div className="bg-[#061F48]/5 border-t border-[#061F48]/10 p-3 px-5 shrink-0 flex items-center justify-between text-[10px] text-[#061F48]/60 font-bold">
              <div className="flex items-center gap-1.5">
                <Command className="h-3.5 w-3.5" />
                <span>Search Directories</span>
              </div>
              <div className="flex items-center gap-3.5">
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-[#061F48]/15 px-1 py-0.5 rounded font-mono text-[9px]">↑↓</kbd>
                  <span>Navigate</span>
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="bg-white border border-[#061F48]/15 px-1 py-0.5 rounded font-mono text-[9px]">↵</kbd>
                  <span>Select</span>
                </span>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
