import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Briefcase, 
  User, 
  Mail, 
  Phone, 
  BookOpen, 
  GraduationCap, 
  FileText, 
  Video, 
  CreditCard, 
  CheckCircle, 
  ChevronRight, 
  Upload, 
  X, 
  Send, 
  Sparkles, 
  Calendar, 
  MapPin, 
  Clock, 
  Info,
  DollarSign,
  AlertCircle,
  FileCheck,
  Search,
  ExternalLink,
  History
} from 'lucide-react';
import { db, collection, addDoc } from '../lib/firebase';

interface Position {
  id: string;
  title: string;
  subject: string;
  grades: string;
  type: string;
  salary: string;
  experience: string;
  description: string;
  requirements: string[];
}

const AVAILABLE_POSITIONS: Position[] = [
  {
    id: 'jee-phys-mentor',
    title: 'Senior JEE Advanced Physics Mentor',
    subject: 'Physics',
    grades: 'Classes 11-12 (JEE/NEET)',
    type: 'Remote / Online (Part-time or Full-time)',
    salary: 'Best in Industry (Disclosed during interview)',
    experience: '5+ Years in coaching JEE aspirants',
    description: 'We are seeking an elite Physics lecturer capable of translating complex mechanics, electrodynamics, and quantum topics into crystal-clear analogies. You will hold live sessions and curate premium rank-booster test sets.',
    requirements: [
      'B.Tech/M.Tech from IIT/NIT or Ph.D./M.Sc. in Physics.',
      'Proven track record of mentoring students to Under 1000 JEE ranks.',
      'High-speed internet connection with digital pen tablet setup.'
    ]
  },
  {
    id: 'neet-bio-specialist',
    title: 'NEET Biology Diagram & Concept Specialist',
    subject: 'Biology',
    grades: 'Classes 11-12 (NEET/Boards)',
    type: 'Remote / Online (Part-time or Full-time)',
    salary: 'Best in Industry (Disclosed during interview)',
    experience: '3+ Years',
    description: 'Join us to help NEET aspirants master NCERT anatomy diagrams, genetics equations, and botanical pathways through high-engagement visual notes and interactive whiteboard illustrations.',
    requirements: [
      'M.Sc. in Botany/Zoology, MBBS, or equivalent life-sciences degree.',
      'Excellent verbal articulation and ability to design visual memory mnemonics.',
      'Passion for active learning pedagogy and interactive polling.'
    ]
  },
  {
    id: 'hs-math-educator',
    title: 'High-School Mathematics Lead',
    subject: 'Mathematics',
    grades: 'Classes 9-10 (CBSE/State/ICSE)',
    type: 'Remote / Online (Full-time)',
    salary: 'Best in Industry (Disclosed during interview)',
    experience: '3+ Years teaching Secondary standard',
    description: 'Help young learners cross the bridge from arithmetic memory to logical geometric and algebraic modeling. Responsible for daily classes, visual proofs, and concept map creation.',
    requirements: [
      'M.Sc./B.Sc. in Mathematics, B.Ed. is a strong plus.',
      'Familiarity with CBSE/ICSE curriculum guidelines and board question patterns.',
      'Warm, encouraging teaching style that dissolves mathematical anxiety.'
    ]
  },
  {
    id: 'ms-science-coach',
    title: 'Middle-School Science Explorations Coach',
    subject: 'General Science',
    grades: 'Classes 6-8 (CBSE/ICSE)',
    type: 'Remote / Online (Part-time)',
    salary: 'Best in Industry (Disclosed during interview)',
    experience: '2+ Years teaching Middle Schoolers',
    description: 'Nurture critical scientific temper and raw curiosity in our youngest learners. Teach chemistry labs (simulated), physical sciences, and basic biology through everyday models and toys.',
    requirements: [
      'B.Sc. in Physics/Chemistry/Biology.',
      'Ability to use interactive simulation tools like PhET or dynamic interactive games.',
      'Enthusiastic persona with great storytelling capability.'
    ]
  },
  {
    id: 'doubt-expert-all',
    title: '24/7 Rapid Doubt Resolution Experts',
    subject: 'All Subjects (Physics, Chemistry, Maths, Biology)',
    grades: 'Classes 6-12',
    type: 'Flexible Hours / Remote',
    salary: 'Best in Industry (Disclosed during interview)',
    experience: '1+ Year experience solving board/competitive doubts',
    description: 'Provide synchronous video and step-by-step whiteboard explanation assistance to students posting academic doubts in our active candidate queues.',
    requirements: [
      'Strong concept clarity in your target subject area.',
      'Active availability during peak doubt-posing hours (4 PM to 11 PM).',
      'Clear, clean, legible digital handwriting.'
    ]
  }
];

interface FileState {
  name: string;
  size: string;
  type: string;
  base64?: string;
}

export default function Careers() {
  const [selectedPosition, setSelectedPosition] = useState<string>('jee-phys-mentor');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    subject: 'Physics',
    grades: 'Classes 11-12',
    experience: '',
    demoVideoLink: '',
    aadhaarNumber: '',
    coverLetter: ''
  });

  // Files
  const [resumeFile, setResumeFile] = useState<FileState | null>(null);
  const [demoVideoFile, setDemoVideoFile] = useState<FileState | null>(null);
  const [aadhaarFile, setAadhaarFile] = useState<FileState | null>(null);

  // Status
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Local submitted application tracker
  const [submittedApplications, setSubmittedApplications] = useState<any[]>([]);
  const [showAppliedLogs, setShowAppliedLogs] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('cme_careers_submissions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setSubmittedApplications(parsed);
        } else {
          setSubmittedApplications([]);
        }
      } else {
        setSubmittedApplications([]);
      }
    } catch (e) {
      console.error('Error loading submissions history:', e);
      setSubmittedApplications([]);
    }
  }, []);

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>, 
    setFile: React.Dispatch<React.SetStateAction<FileState | null>>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    const reader = new FileReader();
    
    reader.onload = () => {
      setFile({
        name: file.name,
        size: `${sizeInMB} MB`,
        type: file.type,
        base64: typeof reader.result === 'string' ? reader.result : undefined
      });
    };

    // If file is reasonably small (less than 1.5MB), read as base64 to save to Firestore
    if (file.size < 1500000) {
      reader.readAsDataURL(file);
    } else {
      setFile({
        name: file.name,
        size: `${sizeInMB} MB`,
        type: file.type
      });
    }
  };

  const removeFile = (setFile: React.Dispatch<React.SetStateAction<FileState | null>>) => {
    setFile(null);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    // Form Validation
    if (!resumeFile) {
      setError('Please upload your resume to complete the teacher application.');
      setSubmitting(false);
      return;
    }

    if (!aadhaarFile) {
      setError('Please upload a copy/registration of your Aadhaar Card for verification.');
      setSubmitting(false);
      return;
    }

    const matchedPosition = AVAILABLE_POSITIONS.find(p => p.id === selectedPosition);

    const submissionPayload = {
      positionId: selectedPosition,
      positionTitle: matchedPosition?.title || 'General Faculty Application',
      ...formData,
      resume: resumeFile,
      demoVideo: demoVideoFile || (formData.demoVideoLink ? { name: 'Linked Video', url: formData.demoVideoLink } : null),
      aadhaar: aadhaarFile,
      submittedAt: new Date().toISOString(),
      status: 'Pending HR Review',
      referenceId: `CME-APP-${Math.floor(100000 + Math.random() * 900000)}`
    };

    try {
      // Save directly to Firestore (career_applications collection)
      const docRef = await addDoc(collection(db, 'career_applications'), submissionPayload);
      
      const finalSubmission = {
        ...submissionPayload,
        dbId: docRef.id
      };

      // Store in local storage to let them track their application status
      const updatedLogs = [finalSubmission, ...submittedApplications];
      setSubmittedApplications(updatedLogs);
      localStorage.setItem('cme_careers_submissions', JSON.stringify(updatedLogs));

      setSuccess(true);
      // Reset form
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        subject: 'Physics',
        grades: 'Classes 11-12',
        experience: '',
        demoVideoLink: '',
        aadhaarNumber: '',
        coverLetter: ''
      });
      setResumeFile(null);
      setDemoVideoFile(null);
      setAadhaarFile(null);

    } catch (err: any) {
      console.error('Careers Submission Error:', err);
      setError(err.message || 'Unable to submit application to database. Please check your network connection.');
    } finally {
      setSubmitting(false);
    }
  };

  const activePosObj = AVAILABLE_POSITIONS.find(p => p.id === selectedPosition) || AVAILABLE_POSITIONS[0];

  return (
    <div className="bg-[#F8F5ED] dark:bg-[#061F48] min-h-screen text-[#061F48] dark:text-[#F8F5ED] transition-colors duration-300 pb-20">
      
      {/* HERO SECTION */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#061F48] to-[#124094] text-white py-16 md:py-24 px-4 sm:px-6 lg:px-8 shadow-inner">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F8F5ED_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md text-[#D09515] px-4 py-1.5 rounded-full border border-white/10 shadow-sm animate-pulse">
            <Sparkles className="h-4 w-4 fill-current" />
            <span className="text-[10px] font-black uppercase tracking-wider">Join India's Elite Online Educators</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
            Shape Concepts, Inspire Minds:<br />
            <span className="text-[#D09515]">Teach at Concept Made Easy</span>
          </h1>

          <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto leading-relaxed font-semibold">
            We are looking for exceptional tutors and mentors who replace rote memorization with deep visual explanations, micro-analogies, and active learning tools for Classes 6-12 (CBSE, ICSE, Boards, JEE & NEET).
          </p>

          <div className="flex flex-wrap justify-center gap-4 text-xs font-black">
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <Clock className="h-4 w-4 text-[#D09515]" />
              <span>100% Online / Remote Hours</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-emerald-400" />
              <span>Premium Compensations</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-2">
              <MapPin className="h-4 w-4 text-[#D09515]" />
              <span>Work from anywhere in India</span>
            </div>
          </div>
          
          <div className="pt-4 flex flex-col sm:flex-row justify-center gap-3">
            <a 
              href="#vacancies" 
              className="bg-[#D09515] hover:bg-[#F8F5ED] text-[#061F48] font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-full shadow-lg hover:shadow-xl transition-all"
            >
              Explore Vacancies
            </a>
            <a 
              href="#apply-form" 
              className="bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 text-white font-black uppercase tracking-wider text-xs px-6 py-3.5 rounded-full transition-all"
            >
              Apply Directly Now
            </a>
            {(submittedApplications || []).length > 0 && (
              <button
                onClick={() => {
                  setShowAppliedLogs(true);
                  setTimeout(() => {
                    document.getElementById('my-applications')?.scrollIntoView({ behavior: 'smooth' });
                  }, 100);
                }}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-wider text-xs px-5 py-3.5 rounded-full transition-all flex items-center justify-center gap-1.5 shadow-md"
              >
                <History className="h-4 w-4" />
                <span>Track My Application ({(submittedApplications || []).length})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: VACANCIES & POSITIONS (SPAN 5) */}
        <div id="vacancies" className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-[#09152E] rounded-[2rem] border border-[#061F48]/10 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#061F48]/5 dark:border-white/5">
              <Briefcase className="h-5 w-5 text-[#D09515]" />
              <div>
                <h3 className="text-lg font-black text-[#061F48] dark:text-[#F8F5ED]">Available Positions</h3>
                <p className="text-[11px] text-gray-400 font-bold">Select a vacancy to apply</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
              {AVAILABLE_POSITIONS.map((pos) => (
                <div
                  key={pos.id}
                  onClick={() => setSelectedPosition(pos.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    selectedPosition === pos.id 
                      ? 'bg-[#061F48] border-transparent text-white shadow-md transform translate-x-1.5' 
                      : 'bg-[#F8F5ED] dark:bg-[#0D214F]/40 border-[#061F48]/5 hover:border-[#D09515]/40 dark:border-white/5'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${
                      selectedPosition === pos.id 
                        ? 'bg-[#D09515] text-[#061F48]' 
                        : 'bg-[#061F48]/5 text-[#061F48] dark:bg-white/5 dark:text-[#F8F5ED]'
                    }`}>
                      {pos.subject}
                    </span>
                    <span className={`text-[8.5px] font-bold ${
                      selectedPosition === pos.id ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {pos.experience}
                    </span>
                  </div>
                  <h4 className="text-xs md:text-sm font-black mt-2 leading-snug">
                    {pos.title}
                  </h4>
                  <div className="flex justify-between items-center mt-3 pt-2.5 border-t border-white/10">
                    <span className={`text-[9px] font-bold ${
                      selectedPosition === pos.id ? 'text-white/80' : 'text-gray-500'
                    }`}>
                      {pos.grades}
                    </span>
                    <span className={`text-[9.5px] font-black ${
                      selectedPosition === pos.id ? 'text-[#D09515]' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      Best Standards
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* HR EMAIL CONTACT CONTACT CARD */}
          <div className="bg-gradient-to-r from-[#F8F5ED] to-[#F8F5ED]/70 dark:from-[#0D214F] dark:to-[#09152E] rounded-[2rem] border border-[#D09515]/30 p-6 md:p-8 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#D09515] flex items-center gap-1.5">
              <Mail className="h-4 w-4" />
              <span>Direct Recruitment Desk</span>
            </h4>
            <p className="text-xs text-[#061F48]/70 dark:text-white/70 font-semibold leading-relaxed">
              If your desired teaching stream is not listed or you want to apply for operational roles, send your resume and details directly to our HR recruiting mailbox:
            </p>
            <div className="space-y-2 pt-2 text-xs font-bold">
              <div className="bg-white dark:bg-[#061F48] p-3 rounded-xl border border-[#061F48]/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase font-black">Official Careers Mailbox</span>
                  <a href="mailto:careers@conceptmadeeasy.in" className="text-[#061F48] dark:text-[#F8F5ED] hover:underline">
                    careers@conceptmadeeasy.in
                  </a>
                </div>
                <ChevronRight className="h-4 w-4 text-[#D09515]" />
              </div>

              <div className="bg-white dark:bg-[#061F48] p-3 rounded-xl border border-[#061F48]/5 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-gray-400 block uppercase font-black">Fallback HR Google Account</span>
                  <a href="mailto:conceptmadeeasyclasses@gmail.com" className="text-[#061F48] dark:text-[#F8F5ED] hover:underline">
                    conceptmadeeasyclasses@gmail.com
                  </a>
                </div>
                <ChevronRight className="h-4 w-4 text-[#D09515]" />
              </div>
            </div>
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-xl text-[10.5px] text-[#061F48]/80 dark:text-amber-200/80 font-bold flex gap-2">
              <Info className="h-4 w-4 text-[#D09515] shrink-0 mt-0.5" />
              <span>All applications are carefully evaluated by the SME board. Response times range from 48 to 72 hours. Selected teachers will be invited to record a live mock lecture on our whiteboard workspace.</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: DETAILED VACANCY SUMMARY & APPLICATION FORM (SPAN 7) */}
        <div id="apply-form" className="lg:col-span-7 space-y-6">
          
          {/* Detailed Job Information Display */}
          <div className="bg-white dark:bg-[#09152E] rounded-[2rem] border border-[#061F48]/10 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-4 text-left">
            <div className="flex justify-between items-start flex-wrap gap-2 pb-3 border-b border-gray-100 dark:border-white/5">
              <div>
                <span className="text-[10px] font-black uppercase text-[#D09515]">{activePosObj.type}</span>
                <h3 className="text-lg md:text-xl font-black text-[#061F48] dark:text-[#F8F5ED] mt-1">
                  {activePosObj.title}
                </h3>
              </div>
              <div className="text-right">
                <span className="text-xs font-black text-emerald-600 dark:text-[#D09515] block">{activePosObj.salary}</span>
                <span className="text-[9px] text-gray-400 font-bold block">{activePosObj.experience}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400">Position Overview</span>
                <p className="text-xs text-[#061F48]/75 dark:text-white/75 font-semibold mt-1 leading-relaxed">
                  {activePosObj.description}
                </p>
              </div>

              <div>
                <span className="text-[9.5px] font-black uppercase tracking-wider text-gray-400">Eligibility & Core Skills</span>
                <ul className="list-disc pl-4 text-xs text-[#061F48]/75 dark:text-white/75 font-semibold mt-1 space-y-1">
                  {(activePosObj?.requirements || []).map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* APPLICATION SUBMISSION FORM */}
          <div className="bg-white dark:bg-[#09152E] rounded-[2rem] border border-[#061F48]/10 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6 relative overflow-hidden">
            <div className="pb-4 border-b border-gray-100 dark:border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-black text-[#061F48] dark:text-[#F8F5ED] flex items-center gap-2">
                  <User className="h-5 w-5 text-[#D09515]" />
                  <span>Teacher Recruitment Form</span>
                </h3>
                <p className="text-[11px] text-gray-400 font-bold">Concept Made Easy Classes Evaluation Portal</p>
              </div>
              <span className="text-[9px] bg-[#F8F5ED] dark:bg-white/5 px-2.5 py-1 rounded-md text-[#D09515] font-black uppercase tracking-wide border border-[#D09515]/25">
                Active Position: {activePosObj.subject}
              </span>
            </div>

            {/* ERROR & SUCCESS TOASTS/MESSAGES */}
            <AnimatePresence mode="wait">
              {success && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/30 p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle className="h-5 w-5 shrink-0" />
                    <span className="text-xs font-black uppercase tracking-wider">Application Transmitted Successfully!</span>
                  </div>
                  <p className="text-[11px] text-[#061F48]/70 dark:text-white/70 font-semibold leading-relaxed">
                    Thank you! Your profile and credentials have been logged in the Concept Made Easy candidate tracking system. Our HR board will verify your Aadhaar registration and evaluate the attached resume within 2-3 working days.
                  </p>
                  <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-black">
                    You can track the progress of your application reference code in the "My Applications" queue below.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSuccess(false)}
                    className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 underline hover:no-underline"
                  >
                    Submit Another Profile
                  </button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-red-50 dark:bg-red-950/20 border border-red-500/30 p-4 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 dark:text-red-400 font-bold"
                >
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-red-500" />
                  <span>{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FORM */}
            <form onSubmit={handleSubmit} className="space-y-5 text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Full Legal Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      required
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      placeholder="Enter legal name (as per Aadhaar)"
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="email"
                      required
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">WhatsApp / Contact Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      required
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Teaching Experience (Years)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <input
                      type="number"
                      required
                      min="0"
                      max="40"
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      placeholder="e.g. 4"
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Select Primary Subject Area</label>
                  <div className="relative">
                    <BookOpen className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 appearance-none"
                    >
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      <option value="General Science">General Science</option>
                      <option value="Social Science">Social Science</option>
                      <option value="English">English</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Target Grade Levels</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                    <select
                      name="grades"
                      value={formData.grades}
                      onChange={handleInputChange}
                      className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 appearance-none"
                    >
                      <option value="Classes 6-8">Middle School (Classes 6-8)</option>
                      <option value="Classes 9-10">High School (Classes 9-10)</option>
                      <option value="Classes 11-12">Competitive Stream (Classes 11-12 / JEE / NEET)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* AADHAAR CARD NUMBER */}
              <div>
                <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">12-Digit Aadhaar Card Number</label>
                <div className="relative">
                  <CreditCard className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    required
                    maxLength={12}
                    pattern="\d{12}"
                    name="aadhaarNumber"
                    value={formData.aadhaarNumber}
                    onChange={handleInputChange}
                    placeholder="Enter 12-digit Aadhaar UID (e.g. 123456789012)"
                    className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                  />
                </div>
              </div>

              {/* FILE UPLOAD PANELS */}
              <div className="space-y-4">
                
                {/* 1. RESUME FILE UPLOAD */}
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">
                    Upload CV / Resume <span className="text-red-500">*</span>
                  </span>
                  {!resumeFile ? (
                    <div className="relative border-2 border-dashed border-[#061F48]/15 dark:border-white/15 hover:border-[#D09515] rounded-xl p-5 text-center bg-[#F8F5ED]/40 dark:bg-white/5 hover:bg-[#F8F5ED] transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileChange(e, setResumeFile)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Upload className="h-6 w-6 text-[#D09515] mx-auto mb-2" />
                      <p className="text-xs font-black text-[#061F48] dark:text-[#F8F5ED]">Drag and drop your Resume here, or click to browse</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Accepts PDF, DOCX (Max 2MB)</p>
                    </div>
                  ) : (
                    <div className="bg-[#F8F5ED] dark:bg-white/5 border border-emerald-500/30 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div className="text-left leading-tight">
                          <p className="text-xs font-black text-[#061F48] dark:text-[#F8F5ED] max-w-xs truncate">{resumeFile.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">Size: {resumeFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(setResumeFile)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. DEMO LECTURE VIDEO LINK OR FILE */}
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">
                    Demo Lecture Video (Paste Link OR Drop Video)
                  </span>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Link Option */}
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] text-gray-400 uppercase font-black">Option A: Paste Cloud/Loom Video Link</span>
                      <div className="relative">
                        <Video className="absolute left-3.5 top-3.5 h-4 w-4 text-gray-400" />
                        <input
                          type="url"
                          name="demoVideoLink"
                          value={formData.demoVideoLink}
                          onChange={handleInputChange}
                          placeholder="e.g. YouTube, Drive, or Loom URL"
                          className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all"
                        />
                      </div>
                    </div>

                    {/* File Drop Option */}
                    <div className="space-y-1.5">
                      <span className="text-[8.5px] text-gray-400 uppercase font-black">Option B: Drop Demo MP4 Video File</span>
                      {!demoVideoFile ? (
                        <div className="relative border border-dashed border-[#061F48]/15 dark:border-white/15 hover:border-[#D09515] rounded-xl py-2 px-4 text-center bg-[#F8F5ED]/20 dark:bg-white/5 hover:bg-[#F8F5ED] transition-colors cursor-pointer flex items-center justify-center gap-2">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => handleFileChange(e, setDemoVideoFile)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-4 w-4 text-[#D09515]" />
                          <span className="text-[11px] font-black text-[#061F48] dark:text-[#F8F5ED]">Upload Video (MP4/MOV)</span>
                        </div>
                      ) : (
                        <div className="bg-[#F8F5ED] dark:bg-white/5 border border-emerald-500/30 rounded-xl p-2 flex justify-between items-center text-[11px]">
                          <div className="flex items-center gap-2 truncate">
                            <Video className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="font-black text-[#061F48] dark:text-[#F8F5ED] truncate max-w-[120px]">{demoVideoFile.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(setDemoVideoFile)}
                            className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1 rounded-lg transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* 3. AADHAAR CARD SCAN COPY */}
                <div>
                  <span className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">
                    Upload Aadhaar Card Scan / Copy <span className="text-red-500">*</span>
                  </span>
                  {!aadhaarFile ? (
                    <div className="relative border-2 border-dashed border-[#061F48]/15 dark:border-white/15 hover:border-[#D09515] rounded-xl p-5 text-center bg-[#F8F5ED]/40 dark:bg-white/5 hover:bg-[#F8F5ED] transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => handleFileChange(e, setAadhaarFile)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <CreditCard className="h-6 w-6 text-[#D09515] mx-auto mb-2" />
                      <p className="text-xs font-black text-[#061F48] dark:text-[#F8F5ED]">Drag and drop your Aadhaar scan here, or click to browse</p>
                      <p className="text-[10px] text-gray-400 font-bold mt-1">Accepts PNG, JPG, PDF (Max 2MB)</p>
                    </div>
                  ) : (
                    <div className="bg-[#F8F5ED] dark:bg-white/5 border border-emerald-500/30 rounded-xl p-3 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <FileCheck className="h-5 w-5 text-emerald-500 shrink-0" />
                        <div className="text-left leading-tight">
                          <p className="text-xs font-black text-[#061F48] dark:text-[#F8F5ED] max-w-xs truncate">{aadhaarFile.name}</p>
                          <p className="text-[10px] text-gray-400 font-bold">Size: {aadhaarFile.size}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeFile(setAadhaarFile)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 p-1.5 rounded-lg transition-colors"
                      >
                        <X className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  )}
                </div>

              </div>

              {/* COVER LETTER */}
              <div>
                <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-white/50 block mb-1.5">Explain your custom teaching analogy (Cover Letter)</label>
                <textarea
                  name="coverLetter"
                  value={formData.coverLetter}
                  onChange={handleInputChange}
                  rows={4}
                  placeholder="Tell us about your teaching method. How do you replace memorization with analogies? Introduce yourself briefly..."
                  className="w-full bg-[#F8F5ED] dark:bg-[#061F48] border border-[#061F48]/10 dark:border-white/10 p-4 rounded-xl text-xs font-bold text-[#061F48] dark:text-[#F8F5ED] focus:outline-none focus:ring-2 focus:ring-[#D09515]/30 transition-all placeholder:text-gray-400/70"
                />
              </div>

              {/* SUBMIT BUTTON */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-[#061F48] hover:bg-[#D09515] disabled:bg-gray-200 text-white font-black uppercase tracking-wider text-xs py-4 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Upload className="h-4.5 w-4.5 animate-spin" />
                    <span>Uploading Credentials & Submitting...</span>
                  </>
                ) : (
                  <>
                    <Send className="h-4.5 w-4.5" />
                    <span>Submit Application for {activePosObj.title}</span>
                  </>
                )}
              </button>

            </form>
          </div>
        </div>

      </div>

      {/* TRACKING QUEUE PANEL */}
      <AnimatePresence>
        {(showAppliedLogs || (submittedApplications || []).length > 0) && (
          <motion.div 
            id="my-applications" 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-5xl mx-auto px-4 mt-16 text-left"
          >
            <div className="bg-white dark:bg-[#09152E] rounded-[2rem] border border-[#061F48]/10 dark:border-white/10 p-6 md:p-8 shadow-sm space-y-6">
              
              <div className="flex justify-between items-center border-b border-gray-100 dark:border-white/5 pb-4">
                <div className="flex items-center gap-2">
                  <History className="h-5 w-5 text-[#D09515]" />
                  <div>
                    <h3 className="text-base md:text-lg font-black text-[#061F48] dark:text-[#F8F5ED]">My Submitted Teacher Profiles</h3>
                    <p className="text-[11px] text-gray-400 font-bold">Track the evaluation logs of your recruiting files</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSubmittedApplications([]);
                    localStorage.removeItem('cme_careers_submissions');
                  }}
                  className="text-[10px] font-black text-red-500 uppercase tracking-wider hover:underline"
                >
                  Clear Status Logs
                </button>
              </div>

              <div className="space-y-4">
                {submittedApplications.map((app, idx) => (
                  <div
                    key={idx}
                    className="bg-[#F8F5ED] dark:bg-[#0D214F]/30 p-5 rounded-2xl border border-[#061F48]/5 dark:border-white/5 space-y-3"
                  >
                    <div className="flex justify-between items-start flex-wrap gap-2">
                      <div className="space-y-1">
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400 px-2 py-0.5 rounded font-black uppercase">
                          Reference Code: {app.referenceId}
                        </span>
                        <h4 className="text-sm font-black text-[#061F48] dark:text-[#F8F5ED]">
                          {app.positionTitle} ({app.fullName})
                        </h4>
                        <p className="text-[10.5px] text-gray-400 font-semibold">
                          Submitted on: {new Date(app.submittedAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-[#D09515]/10 text-[#D09515] border border-[#D09515]/25 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                        ⏳ {app.status}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3.5 border-t border-[#061F48]/5 dark:border-white/5 text-[11px]">
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Primary Contact</span>
                        <span className="font-bold text-[#061F48] dark:text-[#F8F5ED]">{app.email} • {app.phone}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Syllabus Subject</span>
                        <span className="font-bold text-[#061F48] dark:text-[#F8F5ED]">{app.subject} • {app.grades}</span>
                      </div>
                      <div>
                        <span className="text-[9px] text-gray-400 block uppercase font-bold">Attached Resume File</span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                          <FileCheck className="h-3.5 w-3.5" />
                          {app.resume?.name || 'AttachedResume.pdf'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
