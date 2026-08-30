import React, { useState, useEffect } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import * as LucideIcons from 'lucide-react';
import { 
  FileText, 
  RotateCcw, 
  RefreshCw, 
  HelpCircle, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  ArrowRight, 
  Scale, 
  AlertTriangle, 
  CheckCircle,
  ChevronDown,
  Printer,
  Shield,
  DollarSign,
  CreditCard,
  Truck,
  PowerOff,
  BookOpen,
  Copyright,
  Users,
  UserCheck,
  Eye,
  Lock,
  MessageSquare,
  Search,
  Hammer,
  Upload,
  SearchCode
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { defaultPolicies } from '../data/defaultPolicies';

// Define Policy structure
interface Policy {
  id: string;
  title: string;
  category: 'Core Agreements' | 'Fee & Billing Rules' | 'Academic Integrity' | 'Security & Data Use' | 'Regulatory & Compliance';
  lastUpdated: string;
  icon: React.ComponentType<any>;
  summary: string;
  clauses: {
    title: string;
    text: string;
  }[];
}

export default function Legal() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();
  const activeTab = searchParams.get('tab') || 'terms';
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Tab change update
  const setActiveTab = (tabId: string) => {
    setSearchParams({ tab: tabId });
  };

  // Support ticket simulation state
  const [ticketSubmitted, setTicketSubmitted] = useState(false);
  const [ticketData, setTicketData] = useState({
    name: '',
    email: '',
    category: 'Billing & Refund Enquiry',
    issue: '',
    priority: 'Medium'
  });

  const handleTicketSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketData.name || !ticketData.email || !ticketData.issue) {
      alert("Please fill in your name, email, and query details.");
      return;
    }
    setTicketSubmitted(true);
  };

  // Support FAQs state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "How do I request a change of subject or class slot?",
      a: "You can submit a secure transfer request directly through the Student Dashboard using the 'Batch Availability' or 'Slot Transfer' module. Transfers are generally processed within 24 to 48 hours subject to instructor availability."
    },
    {
      q: "Is there an additional charge for switching from standard tuition to board preparation batches?",
      a: "No! Under our flexible academic policy, students enrolled in full year tuition can upgrade to exam-focused boards preparation batches without any additional administrative fees."
    },
    {
      q: "How does the mandatory Aadhaar Verification process work before payments?",
      a: "As per academic security compliance in India, students must upload their Aadhaar card (front and back) or equivalent national ID in their enrollment portal. Our administration panel approves documents within 1-2 hours, after which the direct CME UPI QR payment option is available."
    },
    {
      q: "Are the study materials, formula sheets, and mock tests downloadable?",
      a: "Yes! All compiled cheat sheets, formula booklets generated through our interactive Formula Compiler, and graded CBSE/JEE mock test sheets can be downloaded instantly in print-ready PDF format."
    },
    {
      q: "How do I resolve a failed transaction where money was debited but status remains pending?",
      a: "This is usually a routing delay on the UPI or bank servers. Keep your UPI transaction reference and contact CME for manual reconciliation. Any reversal is governed by the bank or UPI provider timeline."
    }
  ];

  // Micro KYC upload simulator state
  const [kycFile, setKycFile] = useState<File | null>(null);
  const [kycType, setKycType] = useState('Aadhaar Card');
  const [kycStatus, setKycStatus] = useState<'idle' | 'uploading' | 'verified'>('idle');

  const handleKycSimulate = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setKycFile(e.target.files[0]);
      setKycStatus('uploading');
      setTimeout(() => {
        setKycStatus('verified');
      }, 1500);
    }
  };

  // Micro UPI payment reconciliation lookup state
  const [paymentIdInput, setPaymentIdInput] = useState('');
  const [reconciliationStatus, setReconciliationStatus] = useState<any>(null);
  const [isReconciling, setIsReconciling] = useState(false);

  const handlePaymentReconciliation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentIdInput.trim()) return;
    setIsReconciling(true);
    setReconciliationStatus(null);
    setTimeout(() => {
      setIsReconciling(false);
      setReconciliationStatus({
        status: 'SUCCESS',
        amount: '₹14,999',
        date: new Date().toLocaleDateString('en-IN'),
        method: 'UPI / Google Pay',
        customer: 'Registered Student Profile',
        gatewayRef: 'UPI_' + Math.random().toString(36).substring(2, 8).toUpperCase()
      });
    }, 1200);
  };

  // Micro batch slot vacancy state
  const batchVacancies = [
    { grade: 'Grade 10', subject: 'Mathematics Core', timing: '04:00 PM - 05:30 PM', vacancy: '2 Slots Left' },
    { grade: 'Grade 10', subject: 'Science Complete', timing: '06:00 PM - 07:30 PM', vacancy: 'Fully Booked' },
    { grade: 'Grade 12', subject: 'Physics (JEE Prep)', timing: '03:00 PM - 05:00 PM', vacancy: '4 Slots Left' },
    { grade: 'Grade 12', subject: 'Chemistry (Boards)', timing: '05:30 PM - 07:00 PM', vacancy: '1 Slot Left' }
  ];

  // Helper to map string to Lucide React component dynamically
  const getIconComponent = (name: string): React.ComponentType<any> => {
    return (LucideIcons as any)[name] || LucideIcons.FileText;
  };

  const [loadedPolicies, setLoadedPolicies] = useState<Policy[]>(() => {
    // Immediate pre-population with offline defaults so there's NO white flicker or delay
    return defaultPolicies.map(p => ({
      id: p.id,
      title: p.title,
      category: p.category,
      lastUpdated: p.lastUpdated,
      icon: getIconComponent(p.iconName),
      summary: p.summary,
      clauses: p.clauses
    }));
  });
  const [loadingPolicies, setLoadingPolicies] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'policies'));
        const docsList: any[] = [];
        querySnapshot.forEach((docSnap) => {
          docsList.push(docSnap.data());
        });

        if ((docsList || []).length > 0) {
          const mapped: Policy[] = (docsList || []).map(p => {
            let clausesParsed = [];
            if (typeof p.clausesJson === 'string') {
              try {
                clausesParsed = JSON.parse(p.clausesJson);
              } catch (e) {
                clausesParsed = p.clauses || [];
              }
            } else {
              clausesParsed = p.clauses || [];
            }
            return {
              id: p.id,
              title: p.title,
              category: p.category,
              lastUpdated: p.lastUpdated,
              icon: getIconComponent(p.iconName || 'FileText'),
              summary: p.summary,
              clauses: clausesParsed
            };
          });
          
          // Sort to match default ID order
          const idOrder = defaultPolicies.map(x => x.id);
          mapped.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));

          setLoadedPolicies(mapped);
        }
      } catch (error) {
        console.error("Error fetching Firestore policies:", error);
      } finally {
        setLoadingPolicies(false);
      }
    };

    fetchPolicies();
  }, []);

  // Group definitions
  const categories = [
    'Core Agreements',
    'Fee & Billing Rules',
    'Academic Integrity',
    'Security & Data Use',
    'Regulatory & Compliance'
  ] as const;

  // Filter policies based on Search Term
  const filteredPolicies = loadedPolicies.filter(p => 
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.clauses.some(c => c.title.toLowerCase().includes(searchTerm.toLowerCase()) || c.text.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Active policy derived from tab or default first item
  const selectedPolicy = loadedPolicies.find(p => p.id === activeTab) || loadedPolicies[0] || {
    id: 'loading',
    title: 'Loading Policies...',
    category: 'Core Agreements',
    lastUpdated: '',
    icon: LucideIcons.Clock,
    summary: 'Checking secure backend for latest compliance files...',
    clauses: []
  };

  return (
    <div id="legal-container" className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
      
      {/* Dynamic Hero Title Section */}
      <div id="legal-hero-header" className="text-center max-w-3xl mx-auto space-y-4">
        <div id="legal-badge-wrapper" className="inline-flex items-center space-x-2 bg-[#D09515]/10 border border-[#D09515]/35 px-3 py-1 rounded-full">
          <ShieldCheck id="legal-shield-icon" className="h-4 w-4 text-[#D09515]" />
          <span id="legal-badge-text" className="text-[10px] font-black uppercase tracking-widest text-[#061F48]">Legal Compliance Panel</span>
        </div>
        <h1 id="legal-main-title" className="text-3xl md:text-5xl font-black text-[#061F48] tracking-tight leading-tight">
          CME Central Policy Center
        </h1>
        <p id="legal-main-desc" className="text-xs sm:text-sm text-[#061F48]/75 font-semibold leading-relaxed">
          Read, search, and export the official binding legal agreements, fee schedules, slot transfer policies, data codes, and regulatory compliances for Concept Made Easy (CME).
        </p>
      </div>      {/* MOBILE SIDEBAR CONTROLLER (lg:hidden) */}
      <div id="legal-mobile-bar" className="lg:hidden no-print sticky top-16 z-30 bg-white border border-[#061F48]/10 p-3 rounded-2xl shadow-md flex items-center justify-between gap-3">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-2 bg-[#F8F5ED] text-[#D09515] rounded-xl border border-[#061F48]/5">
            {selectedPolicy.icon && React.createElement(selectedPolicy.icon, { className: "h-4 w-4" })}
          </div>
          <div className="leading-tight min-w-0">
            <span className="block text-[8px] font-bold text-gray-400 uppercase tracking-wider">Current Agreement</span>
            <span className="block text-xs font-black text-[#061F48] truncate">{selectedPolicy.title}</span>
          </div>
        </div>

        <button
          id="legal-mobile-menu-btn"
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex items-center space-x-1.5 px-3.5 py-2 bg-[#061F48] hover:bg-[#D09515] text-white rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm shrink-0"
        >
          <LucideIcons.Menu className="h-3.5 w-3.5" />
          <span>Browse Index</span>
        </button>
      </div>

      {/* MOBILE DRAWER PORTAL & SIDEBAR (lg:hidden) */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <div id="legal-mobile-drawer-container" className="fixed inset-0 z-50 lg:hidden no-print">
            
            {/* Backdrop Overlay */}
            <motion.div
              id="legal-mobile-drawer-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
            />

            {/* Sliding Drawer Sidebar */}
            <motion.div
              id="legal-mobile-drawer-panel"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="absolute inset-y-0 left-0 w-full max-w-[320px] bg-white h-full flex flex-col shadow-2xl border-r border-[#061F48]/15"
            >
              
              {/* Drawer Header */}
              <div className="p-4 border-b border-[#061F48]/10 flex items-center justify-between bg-[#F8F5ED]">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-5 w-5 text-[#D09515]" />
                  <span className="text-xs font-black text-[#061F48] uppercase tracking-wider">Policy Navigation</span>
                </div>
                <button
                  id="legal-mobile-drawer-close"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-lg transition-colors"
                >
                  <LucideIcons.X className="h-4 w-4" />
                </button>
              </div>

              {/* Drawer Content (Scrollable sidebar menu) */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                
                {/* Search Box inside mobile sidebar */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-3.5 w-3.5 text-[#061F48]/40" />
                  </span>
                  <input
                    id="legal-mobile-search"
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search policies..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] placeholder-[#061F48]/40 focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-[9px] font-black uppercase text-[#D09515]"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="space-y-4">
                  {categories.map((category) => {
                    const matchingInCat = (filteredPolicies || []).filter(p => p && p.category === category);
                    if ((matchingInCat || []).length === 0) return null;

                    return (
                      <div key={category} className="space-y-1">
                        <div className="px-2.5 py-1 bg-[#F8F5ED] rounded-lg text-[9px] font-black uppercase tracking-wider text-[#D09515]">
                          {category}
                        </div>
                        <div className="space-y-1 pl-0.5">
                          {(matchingInCat || []).map((policy) => {
                            const PolicyIcon = policy.icon;
                            const isActive = activeTab === policy.id;
                            return (
                              <button
                                id={`mobile-tab-btn-${policy.id}`}
                                key={policy.id}
                                onClick={() => {
                                  setActiveTab(policy.id);
                                  setIsMobileMenuOpen(false);
                                  
                                  // Scroll content area into view on mobile
                                  const contentArea = document.getElementById('printable-policy-area');
                                  if (contentArea) {
                                    contentArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                  }
                                }}
                                className={`relative w-full flex items-start space-x-2.5 px-3 py-2 rounded-xl text-left text-[11px] font-extrabold transition-colors duration-200 ${
                                  isActive ? 'text-white' : 'text-[#061F48]/80 hover:bg-[#F8F5ED]/60 hover:text-[#061F48]'
                                }`}
                              >
                                {isActive && (
                                  <motion.div
                                    layoutId="active-mobile-policy-bg"
                                    className="absolute inset-0 bg-[#061F48] rounded-xl -z-10 shadow-sm"
                                    transition={{ type: "spring", stiffness: 380, damping: 32 }}
                                  />
                                )}
                                <PolicyIcon className={`h-4 w-4 shrink-0 mt-0.5 transition-colors duration-200 ${isActive ? 'text-[#D09515]' : 'text-[#061F48]/40'}`} />
                                <div className="leading-tight min-w-0">
                                  <span className="block truncate">{policy.title}</span>
                                  <span className="block text-[8.5px] font-normal opacity-70 truncate">
                                    {policy.summary}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {(filteredPolicies || []).length === 0 && (
                    <div className="text-center py-6 text-xs font-semibold text-[#061F48]/50 space-y-1">
                      <AlertTriangle className="h-5 w-5 text-[#D09515] mx-auto" />
                      <p>No matching policies.</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-[#061F48]/10 bg-[#F8F5ED]/40 text-center">
                <span className="text-[8.5px] font-black text-[#D09515] uppercase tracking-wider block">🔒 Secured Legal Portal</span>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Grid: Left Tabs and Search, Right Tab Content */}
      <div id="legal-content-grid" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Sidebar with Search and Dynamic Tabs */}
        <div id="legal-sidebar" className="hidden lg:block lg:col-span-4 space-y-4 lg:sticky lg:top-24 no-print">
          
          {/* Search Box */}
          <div id="legal-search-wrapper" className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-[#061F48]/40" />
            </span>
            <input
              id="legal-search-input"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`Search all ${(loadedPolicies || []).length} policies...`}
              className="w-full pl-9 pr-4 py-3 bg-white border border-[#061F48]/10 rounded-2xl text-xs font-semibold text-[#061F48] placeholder-[#061F48]/40 focus:outline-none focus:ring-2 focus:ring-[#D09515]/40 shadow-sm"
            />
            {searchTerm && (
              <button
                id="legal-search-clear"
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-[10px] font-black uppercase text-[#D09515] hover:text-[#061F48]"
              >
                Clear
              </button>
            )}
          </div>

          <span id="legal-sidebar-heading" className="text-[10px] font-black uppercase text-[#061F48]/55 tracking-wider block pl-2">
            Select Policy ({(filteredPolicies || []).length} of {(loadedPolicies || []).length})
          </span>
          
          <div id="legal-tabs-container" className="flex flex-col bg-white border border-[#061F48]/10 p-2 rounded-2xl shadow-sm gap-4 max-h-[600px] overflow-y-auto">
            {categories.map((category) => {
              const matchingInCat = (filteredPolicies || []).filter(p => p && p.category === category);
              if ((matchingInCat || []).length === 0) return null;

              return (
                <div key={category} id={`cat-group-${category.replace(/\s+/g, '-').toLowerCase()}`} className="space-y-1">
                  <div className="px-3 py-1 bg-[#F8F5ED] rounded-lg text-[9px] font-black uppercase tracking-wider text-[#D09515]">
                    {category}
                  </div>
                  <div className="space-y-1 pl-1">
                    {(matchingInCat || []).map((policy) => {
                      const PolicyIcon = policy.icon;
                      const isActive = activeTab === policy.id;
                      return (
                        <button
                          id={`tab-btn-${policy.id}`}
                          key={policy.id}
                          onClick={() => setActiveTab(policy.id)}
                          className={`relative w-full flex items-start space-x-2.5 px-3 py-2.5 rounded-xl text-left text-[11px] font-extrabold transition-colors duration-200 ${isActive ? 'text-white shadow-sm' : 'text-[#061F48]/80 hover:bg-[#F8F5ED]/60 hover:text-[#061F48]'}`}
                        >
                          {isActive && (
                            <motion.div
                              layoutId="active-policy-bg"
                              className="absolute inset-0 bg-[#061F48] rounded-xl -z-10 shadow-md"
                              transition={{ type: "spring", stiffness: 380, damping: 32 }}
                            />
                          )}
                          <PolicyIcon className={`h-4 w-4 shrink-0 mt-0.5 transition-colors duration-200 ${isActive ? 'text-[#D09515]' : 'text-[#061F48]/40'}`} />
                          <div className="leading-tight z-10">
                            <span>{policy.title}</span>
                            <span className="block text-[9px] font-normal opacity-70 truncate max-w-[200px]">
                              {policy.summary}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}

            {(filteredPolicies || []).length === 0 && (
              <div id="legal-no-results" className="text-center py-8 text-xs font-semibold text-[#061F48]/50 space-y-2">
                <AlertTriangle className="h-6 w-6 text-[#D09515] mx-auto" />
                <p>No matching policies found.</p>
              </div>
            )}
          </div>

          <div id="legal-sidebar-compliance-card" className="bg-[#F8F5ED] border border-[#D09515]/25 p-4 rounded-2xl text-center space-y-1 shadow-sm">
            <span id="legal-compliance-lock" className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block">🔒 Standard Regulatory Filing</span>
            <p id="legal-compliance-desc" className="text-[9.5px] text-[#061F48]/75 font-semibold leading-normal">
              These policies comply with the Indian Contract Act, 1872, the Information Technology Act, 2000, and Consumer Protection (E-Commerce) Rules, 2020.
            </p>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Document Display Panel */}
        <div 
          id="printable-policy-area" 
          className="lg:col-span-8 bg-white border border-[#061F48]/10 rounded-[2rem] p-6 md:p-8 shadow-xl min-h-[500px] relative"
        >
          {/* Custom Print Stylesheet */}
          <style dangerouslySetInnerHTML={{ __html: `
            @media print {
              /* Hide navigation, sidebars, buttons, headers, footers and any non-print elements */
              header, footer, nav, aside, .no-print, button, form, input, textarea, select, #legal-sidebar, #legal-hero-header {
                display: none !important;
                height: 0 !important;
                overflow: hidden !important;
              }
              /* Reset column layouts to fill page */
              .grid, #legal-content-grid {
                display: block !important;
              }
              .lg\\:col-span-8 {
                width: 100% !important;
                max-width: 100% !important;
                float: none !important;
              }
              #printable-policy-area {
                position: absolute !important;
                left: 0 !important;
                top: 0 !important;
                width: 100% !important;
                padding: 0px !important;
                margin: 0px !important;
                border: none !important;
                box-shadow: none !important;
                background: transparent !important;
              }
              h2, h3, p, li, strong, span {
                color: #000000 !important;
              }
              @page {
                margin: 1.5cm;
              }
            }
          `}} />

          {/* Official Printable Academic Letterhead */}
          <div id="print-letterhead" className="hidden print:block border-b-2 border-[#061F48] pb-5 mb-8">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-xl font-black text-[#061F48] tracking-tight">CONCEPT MADE EASY (CME)</h1>
                <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">Academic & Regulatory Compliance Directorate</p>
                <p className="text-[9px] text-gray-500 font-semibold mt-0.5">Founder: Pranjal Agrawal &nbsp;|&nbsp; CEO: Gauri Gupta</p>
              </div>
              <div className="text-right">
                <span className="inline-block bg-[#061F48] text-white text-[8px] font-black uppercase px-2 py-0.5 rounded mb-1">
                  OFFICIAL REGULATORY RECORDS
                </span>
                <p className="text-[9px] text-gray-500 font-semibold">Printed: {new Date().toLocaleDateString('en-IN')}</p>
                <p className="text-[9px] text-gray-500 font-semibold">Verification Desk: conceptmadeeasyclasses@gmail.com</p>
              </div>
            </div>
          </div>

          {/* Action Header bar with Print active tab button */}
          <div id="legal-action-bar" className="flex items-center justify-between border-b border-[#061F48]/10 pb-4 mb-6 no-print">
            <div id="legal-meta-heading" className="flex items-center space-x-2 text-[10px] font-black text-[#061F48]/60 uppercase tracking-widest">
              <Scale className="h-4 w-4 text-[#D09515]" />
              <span>{selectedPolicy.category} • Clause Repository</span>
            </div>
            <button
              id="legal-print-button"
              type="button"
              onClick={() => window.print()}
              className="no-print inline-flex items-center space-x-2 bg-[#F8F5ED] border border-[#D09515]/35 text-[#061F48] hover:bg-[#061F48] hover:text-white px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm hover:shadow-md cursor-pointer"
              title="Print active policy document for your offline legal files"
            >
              <Printer className="h-3.5 w-3.5 text-[#D09515]" />
              <span>Print Policy</span>
            </button>
          </div>

          {/* Active Policy content render */}
          <motion.div 
            id={`policy-display-${selectedPolicy.id}`}
            key={selectedPolicy.id}
            initial={{ opacity: 0, x: 15, scale: 0.98 }} 
            animate={{ opacity: 1, x: 0, scale: 1 }} 
            exit={{ opacity: 0, x: -15, scale: 0.98 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="space-y-6"
          >
            <div id="policy-header" className="border-b border-[#061F48]/10 pb-4">
              <div className="flex items-center space-x-3">
                <span className="p-2.5 bg-[#F8F5ED] rounded-2xl border border-[#061F48]/5 text-[#D09515]">
                  {React.createElement(selectedPolicy.icon, { className: "h-6 w-6" })}
                </span>
                <div>
                  <h2 id="policy-title-display" className="text-xl md:text-2xl font-black text-[#061F48]">{selectedPolicy.title}</h2>
                  <p id="policy-meta-display" className="text-xs text-gray-400 font-semibold mt-0.5">Last Updated: {selectedPolicy.lastUpdated} • Compliance ID: CME-{selectedPolicy.id.toUpperCase()}-2026</p>
                </div>
              </div>
            </div>

            <div id="policy-intro" className="text-xs font-semibold text-[#061F48]/90 italic bg-[#F8F5ED] p-3.5 rounded-2xl border-l-4 border-[#D09515]">
              {selectedPolicy.summary}
            </div>

            <div id="policy-clauses-container" className="prose prose-sm max-w-none text-[#061F48]/85 space-y-6 text-xs font-medium leading-relaxed">
              {(selectedPolicy.clauses || []).map((clause, idx) => (
                <div key={idx} id={`clause-${selectedPolicy.id}-${idx}`} className="space-y-2">
                  <h3 className="text-xs font-black text-[#061F48] uppercase tracking-wider">{clause.title}</h3>
                  <p className="text-justify">{clause.text}</p>
                </div>
              ))}
            </div>

            {/* INTERACTIVE WIDGET 1: Aadhaar Upload KYC Simulator */}
            {selectedPolicy.id === 'kyc' && (
              <div id="kyc-simulator-card" className="no-print mt-8 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-[#D09515]" />
                  <span className="text-xs font-black text-[#061F48] uppercase tracking-wider">Aadhaar KYC Verification Simulator</span>
                </div>
                <p className="text-[10px] text-[#061F48]/70 font-semibold">
                  Test the KYC upload flow required to unlock premium mock test modules inside the student portal.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Document Type *</label>
                    <select
                      id="kyc-type-select"
                      value={kycType}
                      onChange={(e) => setKycType(e.target.value)}
                      className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48]"
                    >
                      <option value="Aadhaar Card">Aadhaar Card (12-digit UID)</option>
                      <option value="School Enrollment ID">School Enrollment ID</option>
                      <option value="Passport Copy">Passport Copy</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Upload File Copy *</label>
                    <div className="relative border border-dashed border-[#061F48]/20 rounded-xl p-2.5 bg-white text-center cursor-pointer hover:border-[#D09515]/50 transition-colors">
                      <input
                        id="kyc-file-input"
                        type="file"
                        accept="image/*,application/pdf"
                        onChange={handleKycSimulate}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="flex items-center justify-center space-x-2">
                        <Upload className="h-4 w-4 text-[#D09515]" />
                        <span className="text-[10px] font-black text-[#061F48]/70">
                          {kycFile ? kycFile.name : 'Select ID Copy'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {kycStatus === 'uploading' && (
                  <div id="kyc-uploading-bar" className="flex items-center justify-center space-x-2 text-[10px] font-extrabold text-[#D09515]">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#D09515]"></div>
                    <span>Uploading and Encrypting Document on Safe Server...</span>
                  </div>
                )}

                {kycStatus === 'verified' && (
                  <div id="kyc-success-alert" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-[10.5px] font-semibold flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span><strong>KYC Verification Complete!</strong> The profile document has been approved and securely locked under encrypted reference CME-KYC-{Math.floor(100000 + Math.random() * 900000)}.</span>
                  </div>
                )}
              </div>
            )}

            {/* INTERACTIVE WIDGET 2: UPI Reconciliation Tracking Simulator */}
            {selectedPolicy.id === 'payments' && (
              <div id="reconciliation-simulator-card" className="no-print mt-8 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-5 space-y-4 shadow-inner">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-[#D09515]" />
                  <span className="text-xs font-black text-[#061F48] uppercase tracking-wider">UPI Payment Reconciliation Tracker</span>
                </div>
                <p className="text-[10px] text-[#061F48]/70 font-semibold">
                  Settle pending transaction states. Input a transaction reference ID to simulate bank-level verification logs in real-time.
                </p>

                <form onSubmit={handlePaymentReconciliation} className="flex gap-2">
                  <input
                    id="reconciliation-input"
                    type="text"
                    required
                    value={paymentIdInput}
                    onChange={(e) => setPaymentIdInput(e.target.value)}
                    placeholder="Enter Payment ID (e.g. pay_9s7fA3)"
                    className="flex-grow p-2.5 bg-white border border-[#061F48]/15 rounded-xl text-xs font-semibold text-[#061F48]"
                  />
                  <button
                    id="reconciliation-submit"
                    type="submit"
                    className="bg-[#061F48] hover:bg-[#D09515] text-white text-[10px] font-black uppercase px-4 py-2 rounded-xl tracking-wider transition-colors"
                  >
                    Track State
                  </button>
                </form>

                {isReconciling && (
                  <div id="reconciliation-loader" className="flex items-center justify-center space-x-2 text-[10px] font-extrabold text-[#D09515]">
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-[#D09515]"></div>
                    <span>Checking CME UPI payment reference & reconciliation ledger...</span>
                  </div>
                )}

                {reconciliationStatus && (
                  <div id="reconciliation-results" className="bg-white border border-[#061F48]/10 rounded-xl p-3.5 text-[10px] font-semibold space-y-2 text-[#061F48]">
                    <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                      <span className="text-gray-400 font-bold">Transaction Reference</span>
                      <span className="font-black text-[#D09515]">{reconciliationStatus.gatewayRef}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                      <span className="text-gray-400 font-bold">Reconciled Amount</span>
                      <span className="font-black">{reconciliationStatus.amount}</span>
                    </div>
                    <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                      <span className="text-gray-400 font-bold">Payment Reconciliation Status</span>
                      <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black uppercase px-1.5 py-0.5 rounded">
                        {reconciliationStatus.status}
                      </span>
                    </div>
                    <div className="flex justify-between text-[9.5px]">
                      <span className="text-gray-400 font-bold">Reconciliation Date</span>
                      <span className="text-gray-500">{reconciliationStatus.date}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* INTERACTIVE WIDGET 3: Course / Batch transfer vacancy grid */}
            {selectedPolicy.id === 'transfer' && (
              <div id="vacancy-simulator-card" className="no-print mt-8 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-5 space-y-3 shadow-inner">
                <div className="flex items-center space-x-2">
                  <RefreshCw className="h-5 w-5 text-[#D09515]" />
                  <span className="text-xs font-black text-[#061F48] uppercase tracking-wider">Live Batch Slot Availability Tracker</span>
                </div>
                <p className="text-[10px] text-[#061F48]/70 font-semibold">
                  Real-time slot capacities. Switches must be requested at least 48 hours in advance through the Student Dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-1">
                  {batchVacancies.map((b, index) => {
                    const isFull = b.vacancy === 'Fully Booked';
                    return (
                      <div key={index} id={`vacancy-item-${index}`} className="bg-white border border-[#061F48]/10 rounded-xl p-3 flex justify-between items-center">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-bold text-gray-400 uppercase block">{b.grade}</span>
                          <span className="text-[10.5px] font-black text-[#061F48] block leading-none">{b.subject}</span>
                          <span className="text-[9px] font-semibold text-gray-500 block">{b.timing}</span>
                        </div>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded shrink-0 ${isFull ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {b.vacancy}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* INTERACTIVE WIDGET 4: Support FAQs & Open Support Ticket (Grievance / Customer Support / Terms tabs) */}
            {selectedPolicy.id === 'grievance' && (
              <div id="grievance-support-wrapper" className="space-y-8 pt-6 border-t border-[#061F48]/10">
                
                {/* FAQs accordion */}
                <div id="faq-section" className="no-print space-y-3">
                  <h3 id="faq-heading" className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#D09515]" />
                    <span>Frequently Answered Queries (FAQs)</span>
                  </h3>
                  <div id="faq-accordion" className="space-y-2.5">
                    {faqs.map((faq, idx) => {
                      const isOpen = openFaq === idx;
                      return (
                        <div key={idx} id={`faq-item-${idx}`} className="border border-[#061F48]/5 rounded-xl overflow-hidden bg-[#F8F5ED]/50">
                          <button
                            id={`faq-btn-${idx}`}
                            type="button"
                            onClick={() => setOpenFaq(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 text-left text-xs font-black text-[#061F48] hover:bg-[#061F48]/5 transition-colors"
                          >
                            <span>{faq.q}</span>
                            <ChevronDown className={`h-4 w-4 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                          </button>
                          {isOpen && (
                            <div id={`faq-answer-${idx}`} className="p-4 bg-white border-t border-[#061F48]/5 text-[11px] text-[#061F48]/75 leading-relaxed font-semibold">
                              {faq.a}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Grievance card details (Gauri Gupta details) */}
                <div id="grievance-officer-card" className="bg-[#F8F5ED] border border-dashed border-[#D09515]/40 p-5 rounded-2xl space-y-3 max-w-2xl shadow-sm">
                  <div className="flex items-center space-x-2 text-xs font-black text-[#061F48] uppercase tracking-wider">
                    <Scale className="h-5 w-5 text-[#D09515]" />
                    <span>Statutory Grievance Redressal Officer Contact</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px] font-semibold pl-2">
                    <div>
                      <span className="text-[8.5px] font-bold text-gray-400 block uppercase">Officer Name</span>
                      <span className="text-[#061F48] font-black">Gauri Gupta</span>
                      <span className="text-[#D09515] block text-[9.5px]">Chief Executive Officer (CEO)</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-gray-400 block uppercase">Correspondence Headquarters</span>
                      <span className="text-[#061F48]">CME Classes, Bengaluru, Karnataka, India</span>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-gray-400 block uppercase">Official Email</span>
                      <a href="mailto:conceptmadeeasyclasses@gmail.com" className="text-[#061F48] underline hover:text-[#D09515]">
                        conceptmadeeasyclasses@gmail.com
                      </a>
                    </div>
                    <div>
                      <span className="text-[8.5px] font-bold text-gray-400 block uppercase">Hotline Support</span>
                      <a href="tel:+918318552287" className="text-[#061F48] hover:text-[#D09515] block">
                        +91 83185 52287
                      </a>
                    </div>
                  </div>
                </div>

                {/* Support Ticket Submission Form */}
                <div id="ticket-section" className="no-print border-t border-[#061F48]/5 pt-6 space-y-4">
                  <h3 id="ticket-form-heading" className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="h-4 w-4 text-[#D09515]" />
                    <span>Open a Fast Regulatory / Billing Ticket</span>
                  </h3>
                  
                  {!ticketSubmitted ? (
                    <form id="support-ticket-form" onSubmit={handleTicketSubmit} className="space-y-4 max-w-2xl bg-[#F8F5ED]/50 p-5 rounded-2xl border border-[#061F48]/5 shadow-sm">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Your Name *</label>
                          <input
                            id="ticket-name"
                            type="text"
                            required
                            value={ticketData.name}
                            onChange={(e) => setTicketData({...ticketData, name: e.target.value})}
                            placeholder="Aarav Mehta"
                            className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Your Email *</label>
                          <input
                            id="ticket-email"
                            type="email"
                            required
                            value={ticketData.email}
                            onChange={(e) => setTicketData({...ticketData, email: e.target.value})}
                            placeholder="aarav@gmail.com"
                            className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Query Category *</label>
                          <select
                            id="ticket-category"
                            value={ticketData.category}
                            onChange={(e) => setTicketData({...ticketData, category: e.target.value})}
                            className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                          >
                            <option value="Billing & Refund Enquiry">Billing & Refund Enquiry</option>
                            <option value="Class Slot Transfer">Class Slot Transfer</option>
                            <option value="Technical Login Issue">Technical Login Issue</option>
                            <option value="Tutor Assignment Request">Tutor Assignment Request</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Urgency Priority</label>
                          <select
                            id="ticket-priority"
                            value={ticketData.priority}
                            onChange={(e) => setTicketData({...ticketData, priority: e.target.value})}
                            className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                          >
                            <option value="Low">Low (General Inquiry)</option>
                            <option value="Medium">Medium (Regular Issue)</option>
                            <option value="High">High (Payment Failed/Urgent)</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-[#061F48]/85 block uppercase">Issue Statement Details *</label>
                        <textarea
                          id="ticket-issue-text"
                          rows={3}
                          required
                          value={ticketData.issue}
                          onChange={(e) => setTicketData({...ticketData, issue: e.target.value})}
                          placeholder="Describe your query or withdrawal reason clearly..."
                          className="w-full p-2.5 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                        ></textarea>
                      </div>

                      <button
                        id="ticket-submit-btn"
                        type="submit"
                        className="bg-[#061F48] hover:bg-[#D09515] text-white py-2.5 px-6 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md hover:shadow-lg cursor-pointer"
                      >
                        Submit Case File
                      </button>
                    </form>
                  ) : (
                    <div id="ticket-success-card" className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl text-center space-y-2 animate-fade-in max-w-2xl shadow-sm">
                      <CheckCircle className="h-8 w-8 text-emerald-600 mx-auto" />
                      <h4 className="text-sm font-black text-[#061F48]">Legal Ticket Created Successfully!</h4>
                      <p className="text-[10.5px] text-[#061F48]/75 font-semibold leading-relaxed">
                        Thank you <strong>{ticketData.name}</strong>. Your ticket has been logged under system reference <strong>CME-CASE-2026-{Math.floor(1000 + Math.random() * 9000)}</strong>. Our CEO Gauri Gupta and the administration desk will respond to <strong>{ticketData.email}</strong> within 120 minutes.
                      </p>
                      <button
                        id="ticket-reset-btn"
                        onClick={() => setTicketSubmitted(false)}
                        className="text-xs font-black text-[#D09515] uppercase tracking-wide underline hover:text-[#061F48] cursor-pointer"
                      >
                        File Another Complaint Case
                      </button>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* General Professional Disclaimer Card at footer of document */}
            <div id="document-disclaimer-card" className="bg-[#F8F5ED] border border-[#061F48]/5 p-4 rounded-2xl flex items-start gap-3 mt-6 shadow-sm">
              <AlertTriangle className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <span className="text-[9px] font-black uppercase text-[#061F48] block">Legal Document Notice</span>
                <p className="text-[9px] text-[#061F48]/80 font-semibold leading-relaxed">
                  This document is an electronic record published in accordance with the provisions of Rule 3(1) of the Information Technology (Intermediaries Guidelines) Rules, 2011. Proceeding with active payments, digital verify uploads, or test registrations constitutes your electronic signature and consensus.
                </p>
              </div>
            </div>

          </motion.div>

        </div>

      </div>

    </div>
  );
}
