import React, { useState } from 'react';
import { 
  HashRouter as Router, 
  Routes, 
  Route, 
  Link, 
  NavLink,
  Navigate
} from 'react-router-dom';
import { 
  Menu, 
  X, 
  Sparkles, 
  Mail, 
  Phone, 
  Clock, 
  MapPin, 
  Heart,
  ChevronRight,
  Search
} from 'lucide-react';

import ScrollToTop from './components/ScrollToTop';
import { CompactLogo } from './components/Logos';

// Page Imports
import Home from './pages/Home';
import About from './pages/About';
import Programs from './pages/Programs';
import TestSeries from './pages/TestSeries';
import Scholarship from './pages/Scholarship';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import StudentPortal from './pages/StudentPortal';
import TeacherPortal from './pages/TeacherPortal';
import Legal from './pages/Legal';
import Careers from './pages/Careers';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import NotificationBell from './components/NotificationBell';
import FooterNewsletter from './components/FooterNewsletter';
import WhatsAppButton from './components/WhatsAppButton';
import CommandPalette from './components/CommandPalette';
import { FOUNDER_EMAILS } from './lib/portalAuth';
import { ThemeProvider } from './context/ThemeContext';
import ThemeToggle from './components/ThemeToggle';
import NetworkStatusIndicator from './components/NetworkStatusIndicator';
import StartupLoadingScreen from './components/StartupLoadingScreen';
import LaunchAnnouncementModal from './components/LaunchAnnouncementModal';

function AppContent() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { userProfile, logout, loginWithGoogle } = useAuth();
  const [isStudentLoggedIn, setIsStudentLoggedIn] = useState(false);

  React.useEffect(() => {
    const checkStudentStatus = () => {
      const isStudentRole = userProfile?.role === 'student';
      const isLocalStudent = sessionStorage.getItem('cme_student_logged_in') === 'true';
      setIsStudentLoggedIn(isStudentRole || isLocalStudent);
    };

    checkStudentStatus();
    window.addEventListener('storage', checkStudentStatus);
    const interval = setInterval(checkStudentStatus, 500);

    return () => {
      window.removeEventListener('storage', checkStudentStatus);
      clearInterval(interval);
    };
  }, [userProfile]);

  React.useEffect(() => {
    const handleNav = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        window.location.hash = '#' + customEvent.detail;
      }
    };
    window.addEventListener('cme_navigate_portal', handleNav);
    return () => window.removeEventListener('cme_navigate_portal', handleNav);
  }, []);

  if (isStudentLoggedIn) {
    return (
      <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#061F48] text-[#061F48] dark:text-[#F8F5ED] flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
        <StartupLoadingScreen />
        <LaunchAnnouncementModal />
        <main className="flex-grow bg-[#F8F5ED] dark:bg-[#061F48] p-4 md:p-8">
          <StudentPortal />
        </main>
        <NetworkStatusIndicator />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F5ED] dark:bg-[#061F48] text-[#061F48] dark:text-[#F8F5ED] selection:bg-[#D09515] selection:text-white flex flex-col font-sans overflow-x-hidden transition-colors duration-300">
      <StartupLoadingScreen />
        <LaunchAnnouncementModal />
        
        {/* STICKY HEADER */}
        <header className="sticky top-0 z-50 bg-[#F8F5ED]/95 dark:bg-[#061F48]/95 backdrop-blur-md border-b border-[#061F48]/10 dark:border-white/10 shadow-sm transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            
            <Link to="/" className="flex items-center transform hover:scale-102 transition-transform duration-200">
              <CompactLogo />
            </Link>

            {/* Desktop Navigation Link Tabs */}
            <nav className="hidden md:flex space-x-6 lg:space-x-8 text-xs lg:text-sm font-semibold tracking-wide items-center">
              <NavLink 
                to="/" 
                className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-[#D09515] font-bold' : 'hover:text-[#D09515]'}`}
              >
                Home
              </NavLink>
              <NavLink 
                to="/about" 
                className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-[#D09515] font-bold' : 'hover:text-[#D09515]'}`}
              >
                About & Faculty
              </NavLink>
              <NavLink 
                to="/programs" 
                className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-[#D09515] font-bold' : 'hover:text-[#D09515]'}`}
              >
                Programs & Fees
              </NavLink>
              <NavLink 
                to="/test-series" 
                className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-[#D09515] font-bold' : 'hover:text-[#D09515]'}`}
              >
                Test Series Portal
              </NavLink>
              <NavLink 
                to="/careers" 
                className={({ isActive }) => `transition-colors duration-200 ${isActive ? 'text-[#D09515] font-bold' : 'hover:text-[#D09515]'}`}
              >
                Careers
              </NavLink>
              <NavLink 
                to="/scholarship" 
                className={({ isActive }) => `text-[#D09515] font-extrabold flex items-center gap-1 hover:text-[#061F48] ${isActive ? 'ring-2 ring-[#D09515]/20 px-3 py-1 rounded-full bg-[#D09515]/5' : ''}`}
              >
                <Sparkles className="h-4 w-4 text-[#D09515]" /> Scholarship Test
              </NavLink>
            </nav>

            {/* Desktop CTA Action Buttons */}
            <div className="hidden md:flex items-center space-x-3.5">
              <ThemeToggle />
              <button 
                onClick={() => window.dispatchEvent(new CustomEvent('cme_open_command_palette'))}
                className="flex items-center gap-1.5 bg-[#061F48]/5 hover:bg-[#061F48]/10 border border-[#061F48]/10 hover:border-[#D09515]/30 text-[#061F48] px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all shadow-sm cursor-pointer"
                title="Search Command Palette (Ctrl+K)"
              >
                <Search className="h-3.5 w-3.5 text-[#061F48]/75" />
                <span className="hidden lg:inline">Search</span>
                <kbd className="bg-[#061F48]/10 px-1 py-0.5 rounded font-mono text-[9px] text-[#061F48]/80 leading-none">⌘K</kbd>
              </button>
              <NotificationBell />
              {userProfile ? (
                <div className="flex items-center space-x-2.5 bg-white border border-[#061F48]/10 p-1.5 pr-3.5 rounded-full shadow-sm">
                  {userProfile.photoURL ? (
                    <img 
                      src={userProfile.photoURL} 
                      alt={userProfile.displayName || 'Profile'} 
                      className="h-7 w-7 rounded-full border border-[#D09515] shrink-0"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-7 w-7 rounded-full bg-[#061F48] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {userProfile.displayName?.charAt(0) || 'U'}
                    </div>
                  )}
                  <div className="text-left leading-none">
                    <span className="text-[10px] font-black uppercase text-[#061F48] block max-w-[100px] truncate">
                      {userProfile.displayName || 'Learner'}
                    </span>
                    <span className="text-[8px] font-bold text-[#D09515] uppercase tracking-wider block">
                      {userProfile.role}
                    </span>
                  </div>
                  <Link 
                    to={userProfile.role === 'admin' ? '/admin' : userProfile.role === 'teacher' ? '/teacher-portal' : '/student-portal'} 
                    className="text-[10px] bg-[#061F48] text-white px-2 py-1 rounded-full font-black hover:bg-[#D09515] transition-all"
                  >
                    Portal
                  </Link>
                  <button 
                    onClick={logout}
                    className="text-[10px] font-black text-red-600 hover:text-red-800 uppercase tracking-wider pl-1.5 border-l border-gray-200 cursor-pointer"
                  >
                    Exit
                  </button>
                </div>
              ) : (
                <button 
                  onClick={() => loginWithGoogle('student')}
                  className="bg-[#D09515] text-[#061F48] hover:bg-[#061F48] hover:text-white px-3.5 py-2 rounded-full text-[11px] font-black tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1 cursor-pointer"
                >
                  <span>Google Sign In</span>
                </button>
              )}
              
              <Link 
                to="/teacher-portal" 
                className="bg-[#061F48] text-white hover:bg-[#D09515] px-3 py-2 rounded-full text-[11px] font-black tracking-wider uppercase transition-colors shadow-sm flex items-center gap-1"
              >
                <span>Teacher Portal</span>
              </Link>
              <Link 
                to="/contact" 
                className="bg-[#061F48] text-white hover:bg-[#D09515] px-4 py-2.5 rounded-full text-[11px] font-bold tracking-wider uppercase shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
              >
                Enquire Now
              </Link>
            </div>

            {/* Mobile Action Buttons (Bell + Drawer Menu Toggle) */}
            <div className="flex md:hidden items-center space-x-2">
              <ThemeToggle />
              <NotificationBell />
              <button 
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)} 
                className="p-2 text-[#061F48] hover:text-[#D09515] dark:text-white focus:outline-none"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <div className="md:hidden bg-[#F8F5ED] dark:bg-[#09152E] border-b border-[#061F48]/15 dark:border-white/10 px-4 pt-2 pb-6 space-y-3 absolute w-full left-0 transition-all duration-300 shadow-xl z-50">
              <button 
                onClick={() => {
                  setMobileMenuOpen(false);
                  window.dispatchEvent(new CustomEvent('cme_open_command_palette'));
                }}
                className="w-full flex items-center justify-between bg-[#061F48]/5 hover:bg-[#061F48]/10 border border-[#061F48]/10 px-3.5 py-3 rounded-xl text-xs font-black uppercase text-[#061F48] transition-colors text-left"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-[#061F48]/60" />
                  <span>Search Portal / Commands</span>
                </div>
                <kbd className="bg-[#061F48]/10 px-1.5 py-0.5 rounded font-mono text-[9px] text-[#061F48]/70 leading-none">⌘K</kbd>
              </button>
              <Link 
                to="/" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#061F48]/5 transition-colors"
              >
                Home Portal
              </Link>
              <Link 
                to="/about" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#061F48]/5 transition-colors"
              >
                About Concept Made Easy
              </Link>
              <Link 
                to="/programs" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#061F48]/5 transition-colors"
              >
                Programs & Tuition Fees
              </Link>
              <Link 
                to="/test-series" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#061F48]/5 transition-colors"
              >
                Mock Test Series
              </Link>
              <Link 
                to="/careers" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#061F48]/5 transition-colors"
              >
                Careers & Faculty Openings
              </Link>
              <Link 
                to="/scholarship" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold text-[#D09515] hover:bg-[#061F48]/5 transition-colors flex items-center gap-2"
              >
                <Sparkles className="h-4 w-4" /> Scholarship Admission Test
              </Link>
              <Link 
                to="/student-portal" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold text-[#D09515] hover:bg-[#061F48]/5 transition-colors flex items-center gap-1.5"
              >
                🎓 Student Portal / Login
              </Link>
              <Link 
                to="/teacher-portal" 
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-bold text-[#061F48] hover:bg-[#061F48]/5 transition-colors flex items-center gap-1.5"
              >
                👨‍🏫 Teacher Portal / Live
              </Link>
              {userProfile && (
                <div className="bg-white border border-[#061F48]/10 p-3 rounded-xl flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {userProfile.photoURL ? (
                      <img src={userProfile.photoURL} className="h-6 w-6 rounded-full" alt="User" referrerPolicy="no-referrer" />
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-[#061F48] text-white flex items-center justify-center font-bold text-xs">U</div>
                    )}
                    <span className="text-xs font-bold text-[#061F48]">{userProfile.displayName}</span>
                  </div>
                  <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-xs font-bold text-red-600 uppercase">Sign Out</button>
                </div>
              )}
              <div className="pt-2">
                <Link 
                  to="/contact" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center bg-[#061F48] text-white py-3 rounded-xl text-xs font-bold tracking-wider uppercase shadow-md"
                >
                  Enquire Now
                </Link>
              </div>
            </div>
          )}
        </header>

        {/* PRIMARY VIEWPORTS ROUTER */}
        <main className="flex-grow pt-8 bg-[#F8F5ED]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/programs" element={<Programs />} />
            <Route path="/test-series" element={<TestSeries />} />
            <Route path="/scholarship" element={<Scholarship />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin" element={<ProtectedAdminRoute />} />
            <Route path="/cme-admin-control" element={<Admin />} />
            <Route path="/student-portal" element={<StudentPortal />} />
            <Route path="/teacher-portal" element={<TeacherPortal />} />
            <Route path="/legal" element={<Legal />} />
            <Route path="/careers" element={<Careers />} />
          </Routes>
        </main>

        {/* COMPREHENSIVE FOOTER */}
        <footer className="bg-[#061F48] text-white pt-16 pb-8 border-t border-[#F8F5ED]/10 mt-auto">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            
            {/* Newsletter Lead Capture Form */}
            <FooterNewsletter />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 border-b border-white/10 pb-12">
            
            {/* Branding Column */}
            <div className="space-y-6">
              <CompactLogo inverted={true} />
              <p className="text-xs text-white/70 leading-relaxed font-semibold">
                Concept-focused learning support for Classes 6–12, board preparation, and competitive exam readiness.
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D09515]">Academy Links</h3>
              <ul className="space-y-2 text-xs font-semibold text-white/80">
                <li>
                  <Link to="/" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Home Overview
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> About our Method
                  </Link>
                </li>
                <li>
                  <Link to="/programs" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Tuition Portfolios
                  </Link>
                </li>
                <li>
                  <Link to="/test-series" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Mock Test Series
                  </Link>
                </li>
                <li>
                  <Link to="/careers" className="hover:text-[#D09515] text-[#D09515] font-extrabold transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3 text-[#D09515]" /> Careers (Recruitment)
                  </Link>
                </li>
              </ul>
            </div>

            {/* Specialized Programs */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D09515]">Course Streams</h3>
              <ul className="space-y-2 text-xs font-semibold text-white/80">
                <li>
                  <Link to="/programs" className="hover:text-[#D09515] transition-colors">
                    Class 9-10 Foundations
                  </Link>
                </li>
                <li>
                  <Link to="/programs" className="hover:text-[#D09515] transition-colors">
                    Class 11-12 Board Special
                  </Link>
                </li>
                <li>
                  <Link to="/test-series" className="hover:text-[#D09515] transition-colors">
                    JEE Rank Predictor Mock Tests
                  </Link>
                </li>
                <li>
                  <Link to="/test-series" className="hover:text-[#D09515] transition-colors">
                    NEET Biology Diagram Tests
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal & Policies Column */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D09515]">Legal & Support</h3>
              <ul className="space-y-2 text-xs font-semibold text-white/80">
                <li>
                  <Link to="/legal?tab=support" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Help & Support
                  </Link>
                </li>
                <li>
                  <Link to="/legal?tab=refund" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Refund Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal?tab=transfer" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Transfer Policy
                  </Link>
                </li>
                <li>
                  <Link to="/legal?tab=terms" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/legal?tab=grievance" className="hover:text-[#D09515] transition-colors flex items-center gap-1">
                    <ChevronRight className="h-3 w-3" /> Grievance Desk
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Quick details */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#D09515]">Contact</h3>
              <ul className="space-y-2.5 text-xs text-white/85 font-semibold">
                <li className="flex items-center space-x-2">
                  <Phone className="h-4 w-4 text-[#D09515] shrink-0" />
                  <a href="tel:+918103723533" className="hover:text-[#D09515] transition-colors">+91 81037 23533</a>
                </li>
                <li className="flex items-center space-x-2">
                  <Mail className="h-4 w-4 text-[#D09515] shrink-0" />
                  <a href="mailto:conceptmadeeasyclasses@gmail.com" className="hover:text-[#D09515] transition-colors break-all">conceptmadeeasyclasses@gmail.com</a>
                </li>
                <li className="flex items-start space-x-2">
                  <Clock className="h-4 w-4 text-[#D09515] shrink-0 mt-0.5" />
                  <span>Slots: 9 AM - 12 PM (Dynamic slots available)</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/60 font-semibold gap-4">
            <p>© 2026 Concept Made Easy Classes. All educational concessions subject to academic criteria verification.</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('cme_trigger_startup_screen'))}
                className="hover:text-[#D09515] transition-colors flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-white/60 bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-full border border-white/10 cursor-pointer"
                title="Re-play Concept Made Easy startup boot animation"
              >
                <Sparkles className="h-3 w-3 text-[#D09515]" />
                <span>Replay Startup Screen</span>
              </button>
              <p className="flex items-center gap-1 text-white/55">
                Made with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for CBSE and competitive-exam candidates
              </p>
            </div>
          </div>
        </footer>

        {/* Floating WhatsApp Support Button */}
        <WhatsAppButton />

        {/* Global Keyboard Navigation Command Palette */}
        <CommandPalette />

        {/* Global Network Status Indicator */}
        <NetworkStatusIndicator />
      </div>
  );
}


function ProtectedAdminRoute() {
  const { user, userProfile, loading } = useAuth();
  if (loading) return null;
  const email = (user?.email || '').toLowerCase();
  const authorized = FOUNDER_EMAILS.includes(email) || userProfile?.role === 'admin';
  return authorized ? <Admin /> : <Navigate to="/" replace />;
}

export default function App() {
  React.useEffect(() => {
    const migrationKey = 'cme_recordings_v11_migrated';
    if (!localStorage.getItem(migrationKey)) {
      localStorage.removeItem('cme_recorded_sessions');
      localStorage.setItem(migrationKey, 'true');
    }
  }, []);

  return (
    <Router>
      <ScrollToTop />
      
      <ThemeProvider>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <AppContent />
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </ThemeProvider>
    </Router>
  );
}
