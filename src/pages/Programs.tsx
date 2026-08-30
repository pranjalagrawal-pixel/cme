import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Check, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Award, 
  BookMarked,
  DollarSign,
  Briefcase,
  Users,
  Download
} from 'lucide-react';
import UPIQRCodePayment from '../components/UPIQRCodePayment';
import { generatePaymentReceiptPDF } from '../lib/receiptGenerator';

export default function Programs() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'all' | 'school' | 'competitive' | 'resources' | 'test-series'>('all');

  // Try to load student profile if logged in
  const [localProfile] = useState<any>(() => {
    try {
      const saved = localStorage.getItem('cme_student_profile');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Track purchased program IDs
  const [purchasedIds, setPurchasedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('cme_purchased_programs');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [checkoutProgram, setCheckoutProgram] = useState<any>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);
  const [purchasedProgramDetail, setPurchasedProgramDetail] = useState<any>(null);
  const [purchasePaymentReference, setPurchasePaymentReference] = useState<string>('');

  const isPurchased = (programId: string) => purchasedIds.includes(programId);

  const handlePurchaseInitiate = (program: any) => {
    setCheckoutProgram(program);
  };

  const handlePaymentSuccess = async (paymentReference: string) => {
    if (!checkoutProgram) return;
    const newPurchasedIds = [...purchasedIds, checkoutProgram.id];
    setPurchasedIds(newPurchasedIds);
    localStorage.setItem('cme_purchased_programs', JSON.stringify(newPurchasedIds));
    setPurchasedProgramDetail(checkoutProgram);
    setPurchasePaymentReference(paymentReference);
    setCheckoutProgram(null);
    setShowSuccessModal(true);
  };

  const handleDownloadReceipt = (programTitle: string, price: string) => {
    const studentName = localProfile?.name || 'Guest Learner';
    const studentClass = localProfile?.studentClass || '10';
    const rollNumber = localProfile?.rollNumber || 'CME-2026-PENDING';
    
    const dateStr = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    const receiptNo = `CME-R-${Date.now().toString().slice(-6)}`;
    const transactionId = purchasePaymentReference || `UPI_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    generatePaymentReceiptPDF({
      receiptNo,
      date: dateStr,
      studentName,
      studentClass,
      rollNumber,
      courseTitle: programTitle,
      amount: price,
      paymentMethod: 'Direct UPI QR',
      transactionId
    });
  };

  // Pricing & Programs detailed list (as of 2026)
  const programsData = [
    {
      id: 'p1',
      title: 'Classes 6 to 10 (Subject-wise)',
      category: 'school',
      subtitle: 'Comprehensive Subject Mastery & Foundation',
      price: '₹1,499',
      duration: 'Per Subject / Month',
      features: [
        'Available for individual or multiple subjects (Maths, Science, English, etc.)',
        'Capped 10-student interactive micro-batches for individual focus',
        'Personalized concept maps & chapter formula books provided',
        'Regular topic tests and full term evaluations included',
        'On-demand doubt clearing assistance directly with expert mentors'
      ],
      tag: 'Subject Mastery (Classes 6–10)',
      color: '#061F48'
    },
    {
      id: 'p2',
      title: 'Classes 11 & 12 (Per Subject)',
      category: 'school',
      subtitle: 'Rigorous Subject Specialization & Board Excellence',
      price: '₹3,499',
      duration: 'Per Subject / Month',
      features: [
        'Advanced classes for Physics, Chemistry, Mathematics, or Biology',
        'Detailed NCERT decoding, critical root derivations, and step proofs',
        'Weekly tracked study plans and subjective home assignment reviews',
        'Regular parent-teacher feedback circles & counseling sessions',
        'High-yield board preparation mock exams and model solutions'
      ],
      tag: 'Subject Mastery (Classes 11–12)',
      color: '#D09515'
    },
    {
      id: 'p3',
      title: 'JEE Advanced preparation',
      category: 'competitive',
      subtitle: 'Premium Rank-Booster & Multi-concept Drills',
      price: '₹9,499',
      duration: 'Per Month',
      features: [
        'Intensive PCM conceptual problem-solving classes',
        'CBT (Computer Based Test) online simulation drills',
        'Focus on complex kinematics & organic reaction mechanisms',
        'Provisional ranks generated based on live national indices',
        'Daily Practice Papers (DPP) with video explanations'
      ],
      tag: 'JEE Special',
      color: '#061F48'
    },
    {
      id: 'p4',
      title: 'NEET Competitive preparation',
      category: 'competitive',
      subtitle: 'Elite Medical Prep & Botanical Decoders',
      price: '₹9,499',
      duration: 'Per Month',
      features: [
        'NCERT-centric biology maps and physical chemistry drills',
        'Full structural zoology and botany conceptual diagrams',
        'Detailed botany taxonomy shortcut booklets',
        'Instant scoring and percentiles with tracking sheets',
        'Personalized error logs to isolate weakness areas'
      ],
      tag: 'NEET Special',
      color: '#D09515'
    },
    {
      id: 'p5',
      title: 'Unlimited Doubt solver Sessions',
      category: 'resources',
      subtitle: '24/7 Academic Support Line',
      price: '₹2,499',
      duration: 'Per Month',
      features: [
        'Unlimited 1:1 doubts resolved instantly by specialists',
        'Submit hand-written questions and get full step proofs',
        'Live 15-min audio/video explanation for tricky questions',
        'Interactive digital whiteboards saved for review',
        'Supported by Nikhil, Ritwika, Prerana and Ansh'
      ],
      tag: 'On-Demand Support',
      color: '#061F48'
    },
    {
      id: 'p6',
      title: 'Class 10 & 12 Board Revision Notes',
      category: 'resources',
      subtitle: 'High-yield Formula Summaries & Concept Maps',
      price: '₹1,499',
      duration: 'One-time Buy',
      features: [
        'Fully solved previous 10 years board paper banks',
        'Clean printable PDF summary booklets of all chapters',
        'Proprietary step-by-step visual derivation cards',
        'Important questions highlighted for CBSE & State boards',
        'Instant secure digital access links'
      ],
      tag: 'Revision Resource',
      color: '#D09515'
    },
    {
      id: 'p7',
      title: 'CBSE Board Exam Class 10 Test Series',
      category: 'test-series',
      subtitle: 'Class 10 Board Exam Practice Engine',
      price: '₹1,999',
      duration: 'Full Syllabus',
      features: [
        '15 Full-length Mock Tests matching CBSE board pattern',
        'In-depth grading with detailed feedback on answers',
        'Curated questions from past 10 years board papers',
        'Step-by-step model solutions for subjective answers',
        'Time management strategy sessions'
      ],
      tag: 'Class 10 Board Test Series',
      color: '#061F48'
    },
    {
      id: 'p8',
      title: 'State Board Exam Class 12 Test Series',
      category: 'test-series',
      subtitle: 'Class 12 Boards Practice Engine',
      price: '₹1,999',
      duration: 'Full Syllabus',
      features: [
        'PCM, PCB & Commerce specialized mock boards',
        'Strict mapping to latest CBSE/State board marking schemes',
        'Detailed evaluation reports and error analysis',
        'Previous years fully solved board question banks',
        'Live post-test discussion classes'
      ],
      tag: 'Class 12 Board Test Series',
      color: '#D09515'
    },
    {
      id: 'p9',
      title: 'JEE Test Series',
      category: 'test-series',
      subtitle: 'JEE Advanced Rank Predictor & Drill Series',
      price: '₹3,599',
      duration: 'Adaptive Schedule',
      features: [
        'CBT (Computer Based Test) online simulation experience',
        'Physics, Chemistry, and Mathematics deep mock analysis',
        'Full syllabus mock tests & chapter-wise conceptual test sets',
        'Predictive AIR (All India Rank) with analytics engine',
        'In-depth video solutions for complex multi-concept questions'
      ],
      tag: 'JEE Preparation Test Series',
      color: '#061F48'
    },
    {
      id: 'p10',
      title: 'NEET Test Series',
      category: 'test-series',
      subtitle: 'Premium Medical Prep Mock Series',
      price: '₹3,999',
      duration: 'Adaptive Schedule',
      features: [
        'NCERT-centric question models mapping to NEET core trends',
        'Full-length 180-question and 200-question practice papers',
        'Instant scoring and percentile-based performance review',
        'Detailed botany and zoology structural question sets',
        'Exclusive query sessions with medical subject experts'
      ],
      tag: 'NEET Preparation Test Series',
      color: '#D09515'
    }
  ];

  // Filtered Programs
  const filteredPrograms = programsData.filter(prog => {
    if (activeTab === 'all') return true;
    return prog.category === activeTab;
  });

  const handleEnquire = (courseTitle: string) => {
    // Navigate to contact and pre-select this course title via state or search params
    const encodedCourse = encodeURIComponent(courseTitle);
    navigate(`/contact?course=${encodedCourse}`);
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Page Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-[0.25em] block">Our Tuition Portfolios</span>
        <h1 className="text-3xl md:text-5xl font-black text-[#061F48] tracking-tight leading-tight">
          Flexible Programs, Transparent Fees
        </h1>
        <p className="text-xs sm:text-sm text-[#061F48]/75 font-semibold leading-relaxed">
          Select an academic structure that fits your goals. From monthly conceptual school classes to high-intensity medical prep and our fully evaluated board test series.
        </p>
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#061F48]/10 pb-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'all' 
              ? 'bg-[#061F48] text-white shadow-md' 
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          All Programs
        </button>
        <button
          onClick={() => setActiveTab('school')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'school' 
              ? 'bg-[#061F48] text-white shadow-md' 
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          School Tuition (Class 9-12)
        </button>
        <button
          onClick={() => setActiveTab('competitive')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'competitive' 
              ? 'bg-[#061F48] text-white shadow-md' 
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          JEE & NEET Special
        </button>
        <button
          onClick={() => setActiveTab('resources')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'resources' 
              ? 'bg-[#061F48] text-white shadow-md' 
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Doubt Solver & Revision Notes
        </button>
        <button
          onClick={() => setActiveTab('test-series')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'test-series' 
              ? 'bg-[#061F48] text-white shadow-md' 
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Mock Test Series
        </button>
      </div>

      {/* Programs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredPrograms.map((prog) => (
          <div 
            key={prog.id} 
            className="bg-white rounded-[2rem] border border-[#061F48]/10 hover:border-[#D09515]/30 shadow-md hover:shadow-xl transition-all p-6 flex flex-col justify-between"
          >
            <div>
              {/* Card top banner */}
              <div className="flex items-center justify-between mb-4">
                <span 
                  className="text-[9px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: prog.color }}
                >
                  {prog.tag}
                </span>
                <span className="text-[10px] text-[#061F48]/60 font-bold uppercase tracking-wide">
                  {prog.category === 'school' ? 'School' : prog.category === 'competitive' ? 'Competitive' : prog.category === 'test-series' ? 'Test Series' : 'Resource'}
                </span>
              </div>

              {/* Title & subtitle */}
              <h3 className="text-xl font-bold text-[#061F48]">{prog.title}</h3>
              <p className="text-xs text-[#061F48]/60 font-semibold mt-1 italic">{prog.subtitle}</p>

              {/* Features list */}
              <ul className="mt-6 space-y-2 border-t border-[#061F48]/5 pt-4">
                {(prog.features || []).map((feat, index) => (
                  <li key={index} className="flex items-start text-xs font-semibold text-[#061F48]/80 space-x-2">
                    <Check className="h-4 w-4 text-[#D09515] shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-[#061F48]/5 mt-6 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/55 uppercase block leading-none">Price & Terms</span>
                <div className="flex items-baseline space-x-1 mt-1">
                  <span className="text-2xl font-extrabold text-[#061F48]">{prog.price}</span>
                  <span className="text-[10px] text-[#061F48]/60 font-bold">/ {prog.duration}</span>
                </div>
              </div>

              {isPurchased(prog.id) ? (
                <div className="flex flex-col items-end gap-1.5">
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <Check className="h-3.5 w-3.5 stroke-[3.5px]" />
                    <span>Active Plan</span>
                  </div>
                  <button
                    onClick={() => handleDownloadReceipt(prog.title, prog.price)}
                    className="text-[9.5px] font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 uppercase tracking-wider transition-colors cursor-pointer"
                    title="Download Payment Receipt"
                  >
                    <Download className="h-3 w-3" />
                    <span>Receipt PDF</span>
                  </button>
                </div>
              ) : (
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => handleEnquire(prog.title)}
                    className="border border-[#061F48]/15 hover:bg-[#061F48]/5 text-[#061F48] px-3 py-2.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all"
                  >
                    Enquire
                  </button>
                  <button 
                    onClick={() => handlePurchaseInitiate(prog)}
                    className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm hover:shadow-md transition-all flex items-center gap-1"
                  >
                    <span>Subscribe</span>
                    <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom info cards */}
      <div className="bg-[#F8F5ED] border border-[#061F48]/10 p-8 rounded-3xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#061F48]">Scholarship Concessions</h4>
          <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed">
            All programs are eligible for scholarship grants of up to 50%. Take our simulated test to evaluate your score instantly!
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#061F48]">Micro cohort CAP</h4>
          <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed">
            We reject massive Zoom streams. All core school and competitive live coaching batches are strictly capped at 10 active students.
          </p>
        </div>
        <div className="space-y-2">
          <h4 className="text-sm font-bold text-[#061F48]">No commuter stress</h4>
          <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed">
            Study safely from your desk. Eliminate heavy bus commute times, enabling extra self-study hours and custom timing slots.
          </p>
        </div>
      </div>

      {/* DIRECT UPI QR PAYMENT — NO PAYMENT GATEWAY */}
      {checkoutProgram && (
        <UPIQRCodePayment
          profileName={localProfile?.name || 'Guest Student'}
          title={checkoutProgram.title}
          amount={checkoutProgram.price}
          onComplete={handlePaymentSuccess}
          onCancel={() => setCheckoutProgram(null)}
        />
      )}

      {/* PAYMENT SUCCESS CELEBRATION MODAL */}
      {showSuccessModal && purchasedProgramDetail && (
        <div className="fixed inset-0 bg-[#061F48]/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 max-w-md w-full p-8 text-center space-y-6 shadow-2xl relative overflow-hidden animate-scale-up">
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-indigo-600 via-[#D09515] to-[#061F48]" />
            
            {/* Visual success rings */}
            <div className="relative mx-auto h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
              <div className="absolute inset-0 rounded-full border border-emerald-500/10 animate-ping duration-1000" />
              <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                <Check className="h-8 w-8 stroke-[3px]" />
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-emerald-600 tracking-widest bg-emerald-50 border border-emerald-200/50 px-3 py-1 rounded-full inline-block">
                PAYMENT REFERENCE SUBMITTED
              </span>
              <h3 className="text-xl font-black text-[#061F48]">Payment Submitted</h3>
              <p className="text-xs text-[#061F48]/75 font-semibold leading-relaxed px-2">
                Your UPI payment reference for <strong>{purchasedProgramDetail.title}</strong> has been submitted for CME reconciliation. Keep your UPI transaction reference safely.
              </p>
            </div>

            {/* Receipt Details card */}
            <div className="bg-[#F8F5ED] border border-[#D09515]/25 p-4.5 rounded-2xl text-left space-y-2 text-xs font-semibold text-[#061F48]">
              <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                <span className="text-gray-400 font-bold">Authorized Merchant:</span>
                <span className="font-bold">CME Academic Services</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                <span className="text-gray-400 font-bold">Course Program:</span>
                <span className="font-extrabold">{purchasedProgramDetail.title}</span>
              </div>
              <div className="flex justify-between border-b pb-1.5 border-[#061F48]/5">
                <span className="text-gray-400 font-bold">Amount Transacted:</span>
                <span className="font-extrabold text-[#D09515]">{purchasedProgramDetail.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-bold">Payment Status:</span>
                <span className="text-amber-600 font-extrabold flex items-center gap-1">
                  <span className="h-2 w-2 bg-amber-500 rounded-full animate-pulse" /> Awaiting Verification
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadReceipt(purchasedProgramDetail.title, purchasedProgramDetail.price)}
                className="w-full border-2 border-dashed border-[#061F48]/25 hover:border-[#D09515] hover:bg-[#F8F5ED] text-[#061F48] py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4 text-[#D09515]" />
                <span>Download Fee Receipt (PDF)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSuccessModal(false);
                  setPurchasedProgramDetail(null);
                }}
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                Enter Study Portal
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
