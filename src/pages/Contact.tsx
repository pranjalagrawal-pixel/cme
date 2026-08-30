import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Enquiry } from '../types';
import { db, doc, setDoc } from '../lib/firebase';
import { 
  Phone, 
  Mail, 
  Clock, 
  MapPin, 
  CheckCircle, 
  Sparkles, 
  MessageSquare, 
  HelpCircle,
  X,
  Menu,
  ChevronRight
} from 'lucide-react';

export default function Contact() {
  const location = useLocation();

  // Enquiry form state
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    phone: '', 
    studentClass: '10', 
    course: 'Boards Prep', 
    message: '' 
  });

  // Parse query parameters
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const courseParam = params.get('course');
    const scholarshipParam = params.get('scholarship');
    const studentParam = params.get('student');
    const phoneParam = params.get('phone');

    if (courseParam || scholarshipParam || studentParam || phoneParam) {
      // Map standard course keys to dropdown select values
      let matchedCourseValue = "Boards Prep";
      if (courseParam) {
        const decoded = decodeURIComponent(courseParam);
        if (decoded.includes("JEE Test Series")) matchedCourseValue = "JEE Test Series";
        else if (decoded.includes("NEET Test Series")) matchedCourseValue = "NEET Test Series";
        else if (decoded.includes("Class 10 Test Series")) matchedCourseValue = "CBSE Board Exam Class 10 Test Series";
        else if (decoded.includes("Class 12 Test Series")) matchedCourseValue = "State Board Exam Class 12 Test Series";
        else if (decoded.includes("JEE")) matchedCourseValue = "JEE Prep";
        else if (decoded.includes("NEET")) matchedCourseValue = "NEET Prep";
        else if (decoded.includes("Doubt")) matchedCourseValue = "Doubt sessions";
        else if (decoded.includes("Notes") || decoded.includes("Revision")) matchedCourseValue = "Study Notes";
        else matchedCourseValue = decoded;
      }

      setFormData(prev => ({
        ...prev,
        name: studentParam ? decodeURIComponent(studentParam) : prev.name,
        phone: phoneParam ? decodeURIComponent(phoneParam) : prev.phone,
        course: matchedCourseValue,
        message: scholarshipParam 
          ? `Estimated scholarship concession calculated: ${scholarshipParam}%. I would like to verify my details and lock in my seat counseling.` 
          : prev.message
      }));
    }
  }, [location]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert("Please enter both your name and phone number so we can reach you!");
      return;
    }

    const enquiryId = 'enq_' + Math.random().toString(36).substr(2, 9);
    const newEnquiry: Enquiry = {
      id: enquiryId,
      name: formData.name,
      phone: formData.phone,
      studentClass: formData.studentClass,
      course: formData.course,
      message: formData.message,
      submittedAt: new Date().toISOString(),
      status: 'Pending'
    };

    try {
      // Save to Firestore!
      await setDoc(doc(db, 'enquiries', enquiryId), newEnquiry);
    } catch (err) {
      console.error("Error storing enquiry in Firestore:", err);
    }

    try {
      const existing = localStorage.getItem('cme_enquiries');
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(newEnquiry);
      localStorage.setItem('cme_enquiries', JSON.stringify(list));
    } catch (err) {
      console.error("Error storing enquiry locally:", err);
    }

    setFormSubmitted(true);
  };

  // Interactive Doubt solver simulation states
  const [doubtText, setDoubtText] = useState("");
  const [isSolving, setIsSolving] = useState(false);
  const [solvedStep, setSolvedStep] = useState(0);
  const [solverResult, setSolverResult] = useState<null | { teacher: string; response: string; stepDetail: string[] }>(null);

  const handleSolveDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doubtText.trim()) return;

    setIsSolving(true);
    setSolvedStep(1);
    setSolverResult(null);

    // Step-by-step custom delay simulation
    setTimeout(() => {
      setSolvedStep(2);
      setTimeout(() => {
        setSolvedStep(3);
        setTimeout(() => {
          const instructors = [
            { name: 'CME Faculty Mentor', subject: 'Concept Support' }
          ];
          const selectedTeacher = instructors[Math.floor(Math.random() * instructors.length)];

          setSolverResult({
            teacher: `${selectedTeacher.name} (${selectedTeacher.subject})`,
            response: `Hello! I have analyzed your query: "${doubtText}". Let's resolve the underlying core principles step-by-step.`,
            stepDetail: [
              "Isolate the Variables: First, identify the standard mathematical formulas or chemical constants governing this problem.",
              "Deconstruct Step-by-Step: Map out the standard algebraic derivations rather than taking shortcuts immediately.",
              "Concept Application: Rather than committing this formula to raw memory, visualize the geometric or anatomical layout.",
              "Clarity Check: This guidance is aligned with standard CBSE board and competitive-exam concepts. Always seek the 'why'!"
            ]
          });
          setIsSolving(false);
        }, 1200);
      }, 1000);
    }, 1000);
  };

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Page Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-[0.25em] block">Connect & Inquire</span>
        <h1 className="text-3xl md:text-5xl font-black text-[#061F48] tracking-tight leading-tight">
          Admissions & Doubt Solver Portal
        </h1>
        <p className="text-xs sm:text-sm text-[#061F48]/75 font-semibold leading-relaxed">
          Submit an admission enquiry to book your free counseling session, or use our interactive tool below to try our conceptual Doubt solver instantly!
        </p>
      </div>

      {/* Main contact block */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Information columns */}
        <div className="lg:col-span-5 space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-[#061F48] tracking-tight">Direct Support Channels</h2>
            <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed">
              Have questions about batch structures, specialized test series schedules, or teacher matching? Reach our coordinators directly.
            </p>
          </div>

          <div className="space-y-4">
            
            {/* Phone option */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm hover:border-[#D09515]/35 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-[#F8F5ED] flex items-center justify-center text-[#D09515] shrink-0">
                <Phone className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/60 uppercase tracking-wider block">Coordinators Mobiles</span>
                <a href="tel:+918103723533" className="text-xs font-bold text-[#061F48] hover:text-[#D09515] transition-colors block">
                  +91 81037 23533 (Pranjal Agrawal)
                </a>
                <a href="tel:+918318552287" className="text-xs font-bold text-[#061F48]/80 hover:text-[#D09515] transition-colors block">
                  +91 83185 52287 (Gauri Gupta)
                </a>
              </div>
            </div>

            {/* Email option */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm hover:border-[#D09515]/35 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-[#F8F5ED] flex items-center justify-center text-[#D09515] shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/60 uppercase tracking-wider block">Official Mailbox</span>
                <a href="mailto:conceptmadeeasyclasses@gmail.com" className="text-xs font-bold text-[#061F48] hover:text-[#D09515] transition-colors block">
                  conceptmadeeasyclasses@gmail.com
                </a>
              </div>
            </div>

            {/* Hours option */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm hover:border-[#D09515]/35 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-[#F8F5ED] flex items-center justify-center text-[#D09515] shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/60 uppercase tracking-wider block">Flexible Slot Timings</span>
                <p className="text-xs font-bold text-[#061F48]">9:00 AM - 12:00 PM Slot</p>
                <p className="text-[10px] text-[#D09515] font-extrabold mt-0.5">* Dynamic timings customized to school zones.</p>
              </div>
            </div>

            {/* Headquarters Mode */}
            <div className="flex items-center space-x-4 bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm">
              <div className="h-10 w-10 rounded-xl bg-[#F8F5ED] flex items-center justify-center text-[#D09515] shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/60 uppercase tracking-wider block">Academy Head Office</span>
                <p className="text-xs font-bold text-[#061F48]">Secure Online Digital Tuition</p>
                <p className="text-[10px] text-[#061F48]/70 leading-normal mt-1">No physical office commute. Instructors deliver from high-tech home hubs directly to students in Bengaluru, Chhattisgarh, and Uttar Pradesh.</p>
              </div>
            </div>

          </div>

        </div>

        {/* Right Enquiry Submission form */}
        <div className="lg:col-span-7 bg-white border border-[#061F48]/10 p-8 rounded-[2.5rem] shadow-xl">
          
          {!formSubmitted ? (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div className="border-b border-[#061F48]/10 pb-4 mb-2">
                <h3 className="text-lg font-bold text-[#061F48]">Send Admission Enquiry</h3>
                <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">Our academic counselors typically reach you back within 2 hours.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="form-name" className="text-xs font-bold text-[#061F48]/80 uppercase block">Student Full Name *</label>
                  <input 
                    id="form-name"
                    type="text" 
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515] focus:ring-1 focus:ring-[#D09515]/30"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="form-phone" className="text-xs font-bold text-[#061F48]/80 uppercase block">Mobile / WhatsApp Number *</label>
                  <input 
                    id="form-phone"
                    type="tel" 
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515] focus:ring-1 focus:ring-[#D09515]/30"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label htmlFor="form-class" className="text-xs font-bold text-[#061F48]/80 uppercase block">Student Class *</label>
                  <select 
                    id="form-class"
                    value={formData.studentClass}
                    onChange={(e) => setFormData({...formData, studentClass: e.target.value})}
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  >
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="form-course" className="text-xs font-bold text-[#061F48]/80 uppercase block">Desired Program *</label>
                  <select 
                    id="form-course"
                    value={formData.course}
                    onChange={(e) => setFormData({...formData, course: e.target.value})}
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  >
                    <option value="Boards Prep">Boards Tuition Prep (Class 6-12)</option>
                    <option value="JEE Prep">JEE Competitive preparation</option>
                    <option value="NEET Prep">NEET Competitive preparation</option>
                    <option value="Doubt sessions">Unlimited Doubt sessions</option>
                    <option value="Study Notes">Revision Notes & Materials</option>
                    <option value="CBSE Board Exam Class 10 Test Series">CBSE Board Exam Class 10 Test Series</option>
                    <option value="State Board Exam Class 12 Test Series">State Board Exam Class 12 Test Series</option>
                    <option value="JEE Test Series">JEE Test Series</option>
                    <option value="NEET Test Series">NEET Test Series</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="form-message" className="text-xs font-bold text-[#061F48]/80 uppercase block">Custom Timings / Class Specific Needs</label>
                <textarea 
                  id="form-message"
                  rows={4}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  placeholder="Share preferred tuition slots or past term marks if locking in scholarship..."
                  className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-medium text-[#061F48] focus:outline-none focus:border-[#D09515]"
                ></textarea>
              </div>

              <button 
                type="submit"
                className="w-full py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider bg-[#061F48] hover:bg-[#D09515] text-white transition-all shadow-md hover:shadow-lg"
              >
                Submit Secure Admission Enquiry
              </button>
            </form>
          ) : (
            <div className="text-center py-12 space-y-6 animate-fade-in">
              <div className="inline-flex h-16 w-16 bg-emerald-100 rounded-full items-center justify-center text-emerald-600 mb-2">
                <CheckCircle className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-[#061F48]">Enquiry Received Successfully!</h3>
              <p className="text-xs sm:text-sm text-[#061F48]/70 font-semibold max-w-md mx-auto leading-relaxed">
                Thank you, <strong className="text-[#061F48]">{formData.name}</strong>. Gauri Gupta and our coordination team have saved your ticket for <strong className="text-[#D09515]">{formData.course}</strong>. We will reach out on <strong className="text-[#061F48]">{formData.phone}</strong> shortly.
              </p>

              <div className="bg-[#F8F5ED] border border-[#D09515]/35 p-4 rounded-2xl max-w-md mx-auto space-y-1 text-center shadow-sm">
                <span className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block">🔒 Secure Administrative Routing</span>
                <p className="text-[10px] text-[#061F48]/80 font-bold leading-normal">
                  This form has submitted successfully to our secure database. It is protected and visible <strong>only under the Admin Login Panel</strong> (not accessible to general public users).
                </p>
              </div>
              
              <button 
                onClick={() => {
                  setFormSubmitted(false);
                  setFormData({ name: '', phone: '', studentClass: '10', course: 'Boards Prep', message: '' });
                }}
                className="text-xs font-bold text-[#D09515] hover:text-[#061F48] uppercase tracking-wider underline block mx-auto transition-colors"
              >
                Submit Another Enquiry
              </button>
            </div>
          )}

        </div>

      </div>

      {/* DOUBTS SOLVER SECTION */}
      <section className="bg-white border border-[#061F48]/10 p-8 md:p-12 rounded-[2.5rem] shadow-xl space-y-8">
        <div className="max-w-2xl">
          <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">Interactive AI Solver</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-[#061F48] mt-1">Simulate Our 1:1 Concept solver</h2>
          <p className="text-xs text-[#061F48]/70 font-semibold mt-2 leading-relaxed">
            Students submit tricky textbook questions to our interactive tutor. Type an academic question below to see our step-by-step conceptual deconstruction layout!
          </p>
        </div>

        <form onSubmit={handleSolveDoubt} className="space-y-4 max-w-3xl">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              required
              placeholder="e.g., Why is water molecule bent shaped? or solve x^2 - 5x + 6 = 0"
              value={doubtText}
              onChange={(e) => setDoubtText(e.target.value)}
              className="flex-1 bg-[#F8F5ED] border border-[#061F48]/15 px-4 py-3.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
            />
            <button
              type="submit"
              disabled={isSolving}
              className="bg-[#061F48] hover:bg-[#D09515] text-white font-extrabold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Solve Concept</span>
            </button>
          </div>
        </form>

        {/* Step-by-Step progress bar and outcomes */}
        {isSolving && (
          <div className="space-y-4 max-w-2xl bg-[#F8F5ED] p-6 rounded-2xl border border-[#061F48]/5 animate-pulse">
            <div className="flex items-center space-x-3 text-xs font-bold text-[#061F48]">
              <Sparkles className="h-4 w-4 text-[#D09515] animate-spin" />
              <span>{solvedStep === 1 ? 'Isolating root variables...' : solvedStep === 2 ? 'Formulating step derivations...' : 'Compiling expert model sheet...'}</span>
            </div>
            <div className="w-full bg-[#061F48]/5 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#D09515] h-full transition-all duration-1000" 
                style={{ width: solvedStep === 1 ? '30%' : solvedStep === 2 ? '65%' : '90%' }}
              ></div>
            </div>
          </div>
        )}

        {solverResult && (
          <div className="bg-[#F8F5ED] border border-[#D09515]/25 p-6 md:p-8 rounded-3xl max-w-3xl space-y-6 animate-fade-in">
            <div className="flex items-center justify-between border-b border-[#061F48]/10 pb-4">
              <div>
                <span className="text-[9px] font-black tracking-widest text-[#D09515] uppercase block">ASSIGNED RESOLUTION SPECIALIST</span>
                <span className="text-sm font-extrabold text-[#061F48]">{solverResult.teacher}</span>
              </div>
              <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase">RESOLVED</span>
            </div>

            <div className="space-y-4 text-xs">
              <p className="font-bold text-[#061F48] bg-white p-4 rounded-xl border border-[#061F48]/5">
                {solverResult.response}
              </p>
              
              <div className="space-y-3">
                <h4 className="text-[10px] font-black text-[#061F48]/55 uppercase tracking-wider">Deconstructed Proof Steps:</h4>
                <div className="space-y-3 pl-2">
                  {(solverResult.stepDetail || []).map((step, idx) => (
                    <div key={idx} className="flex space-x-3">
                      <div className="h-5 w-5 rounded-full bg-[#061F48]/10 text-[#061F48] flex items-center justify-center font-extrabold text-[9px] shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-[#061F48]/80 font-medium leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-[10px] text-[#061F48]/60 font-semibold italic text-center border-t border-[#061F48]/5 pt-4">
              "Understanding is permanent. Memorization is transient. That is the Concept Made Easy difference."
            </div>
          </div>
        )}
      </section>

    </div>
  );
}
