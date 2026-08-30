import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScholarshipSubmission } from '../types';
import { db, doc, setDoc } from '../lib/firebase';
import { 
  Award, 
  Sparkles, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';

export default function Scholarship() {
  const navigate = useNavigate();
  const [scholarshipFormSubmitted, setScholarshipFormSubmitted] = useState(false);
  const [isCalculatingScholarship, setIsCalculatingScholarship] = useState(false);
  const [estimatedScholarship, setEstimatedScholarship] = useState(20);
  const [scholarshipForm, setScholarshipForm] = useState({
    studentName: '',
    parentName: '',
    phone: '',
    email: '',
    studentClass: '10',
    schoolName: '',
    board: 'CBSE',
    previousScore: '90-95', // percentage range: 'above-95', '90-95', '80-90', '70-80', 'below-70'
    familyIncome: '3-6', // annual family income in Lakhs: 'below-3', '3-6', '6-12', 'above-12'
    courseOfInterest: 'Classes 6 to 10 (Subject-wise)',
    achievements: '' // Olympiad/NTSE, Sports, etc.
  });

  const calculateScholarshipValue = (formData: typeof scholarshipForm) => {
    let scoreBase = 20; // baseline 20%
    if (formData.previousScore === 'above-95') scoreBase = 35;
    else if (formData.previousScore === '90-95') scoreBase = 30;
    else if (formData.previousScore === '80-90') scoreBase = 25;
    else if (formData.previousScore === '70-80') scoreBase = 20;
    else scoreBase = 15;

    let incomeAdd = 0;
    if (formData.familyIncome === 'below-3') incomeAdd = 15; // need-based
    else if (formData.familyIncome === '3-6') incomeAdd = 10;
    else if (formData.familyIncome === '6-12') incomeAdd = 5;

    let achievementAdd = 0;
    if ((formData.achievements || '').trim().length > 0) {
      achievementAdd = 5;
    }

    const total = scoreBase + incomeAdd + achievementAdd;
    // Max cap is 50%
    return Math.min(total, 50);
  };

  const handleScholarshipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!scholarshipForm.studentName.trim() || !scholarshipForm.phone.trim() || !scholarshipForm.parentName.trim()) {
      alert("Please fill in Student Name, Parent/Guardian Name, and Phone Number.");
      return;
    }
    
    setIsCalculatingScholarship(true);
    // Simulate high-quality professional computation
    setTimeout(async () => {
      const result = calculateScholarshipValue(scholarshipForm);
      setEstimatedScholarship(result);
      setIsCalculatingScholarship(false);

      const schId = 'sch_' + Math.random().toString(36).substr(2, 9);
      const submission: ScholarshipSubmission = {
        id: schId,
        studentName: scholarshipForm.studentName,
        parentName: scholarshipForm.parentName,
        phone: scholarshipForm.phone,
        email: scholarshipForm.email,
        studentClass: scholarshipForm.studentClass,
        schoolName: scholarshipForm.schoolName,
        board: scholarshipForm.board,
        previousScore: scholarshipForm.previousScore,
        familyIncome: scholarshipForm.familyIncome,
        courseOfInterest: scholarshipForm.courseOfInterest,
        achievements: scholarshipForm.achievements,
        calculatedConcession: result,
        submittedAt: new Date().toISOString(),
        status: 'Pending'
      };

      try {
        await setDoc(doc(db, 'scholarships', schId), submission);
      } catch (err) {
        console.error("Error storing scholarship in Firestore:", err);
      }

      try {
        const existing = localStorage.getItem('cme_scholarships');
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(submission);
        localStorage.setItem('cme_scholarships', JSON.stringify(list));
      } catch (err) {
        console.error("Error storing scholarship submission locally:", err);
      }

      setScholarshipFormSubmitted(true);
    }, 1500);
  };

  const resetScholarshipForm = () => {
    setScholarshipForm({
      studentName: '',
      parentName: '',
      phone: '',
      email: '',
      studentClass: '10',
      schoolName: '',
      board: 'CBSE',
      previousScore: '90-95',
      familyIncome: '3-6',
      courseOfInterest: 'Classes 6 to 10 (Subject-wise)',
      achievements: ''
    });
    setScholarshipFormSubmitted(false);
  };

  const claimSeat = () => {
    // Navigate to contact and pre-fill details
    const encodedCourse = encodeURIComponent(scholarshipForm.courseOfInterest);
    const query = `?course=${encodedCourse}&scholarship=${estimatedScholarship}&student=${encodeURIComponent(scholarshipForm.studentName)}&phone=${encodeURIComponent(scholarshipForm.phone)}`;
    navigate(`/contact${query}`);
  };

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Header Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-[0.25em] block">Interactive Assessment</span>
        <h1 className="text-3xl md:text-5xl font-black text-[#061F48] tracking-tight leading-tight">
          Educational Scholarship Concessions
        </h1>
        <p className="text-xs sm:text-sm text-[#061F48]/75 font-semibold leading-relaxed">
          Estimate your provisional discount instantly. We actively match academic merit, talent records, and socio-economic requirements to grant tuition fee allowances up to <strong>50% off</strong>.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Information column */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-24">
          <div className="bg-[#061F48] text-white p-8 rounded-3xl space-y-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D09515] opacity-[0.06] rounded-full blur-xl pointer-events-none"></div>
            <span className="text-[10px] font-black uppercase text-[#D09515] tracking-widest block">HOW WE COMPUTE GRANTS</span>
            <h3 className="text-xl font-bold leading-snug">Fair & Transparent Merit Allocations</h3>
            
            <div className="space-y-4 text-xs font-semibold">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#D09515]">Academic Base Score (Up to 35%)</h4>
                  <p className="text-white/80 mt-0.5">Calculated from your previous term marks or final board grade points.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#D09515]">Social Need Assistance (Up to 15%)</h4>
                  <p className="text-white/80 mt-0.5">Targeted tuition concession brackets for low-to-middle income families.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-[#D09515] shrink-0" />
                <div>
                  <h4 className="font-bold text-[#D09515]">Talent / Sports Bonus (Flat 5%)</h4>
                  <p className="text-white/80 mt-0.5">Additional reward for Olympiads, national talent search, or division athletic feats.</p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-white/60 border-t border-white/10 pt-4 leading-relaxed font-semibold">
              * Note: The absolute maximum ceiling for cumulative scholarship concessions is capped strictly at 50% of tuition fees to maintain operations.
            </p>
          </div>

          <div className="bg-white border border-[#061F48]/10 p-6 rounded-2xl space-y-3">
            <div className="flex items-center space-x-2 text-[#061F48] font-bold text-xs">
              <HelpCircle className="h-4 w-4 text-[#D09515]" />
              <span>Is this an official scholarship?</span>
            </div>
            <p className="text-[11px] text-[#061F48]/70 leading-relaxed font-semibold">
              This simulator calculates a <strong>provisional grant estimate</strong> based on standard internal matrix boards. To verify and lock in your scholarship discount rate, you must upload your past year mark sheets on the Contact Page or share them directly with Gauri Gupta during counseling.
            </p>
          </div>
        </div>

        {/* Right Simulator Form or Certificate output */}
        <div className="lg:col-span-7 bg-white border border-[#061F48]/10 p-8 rounded-[2.5rem] shadow-xl">
          
          {!scholarshipFormSubmitted ? (
            <form onSubmit={handleScholarshipSubmit} className="space-y-6">
              
              <div className="border-b border-[#061F48]/10 pb-4 mb-2">
                <h3 className="text-lg font-bold text-[#061F48]">Admission Profile Entry</h3>
                <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">Please provide exact details below to generate a valid estimate.</p>
              </div>

              {/* Personal details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Student Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter student's name"
                    value={scholarshipForm.studentName}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentName: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Parent/Guardian name"
                    value={scholarshipForm.parentName}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, parentName: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Phone Number *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile number"
                    value={scholarshipForm.phone}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, phone: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none transition-colors"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Email Address</label>
                  <input
                    type="email"
                    placeholder="name@example.com (optional)"
                    value={scholarshipForm.email}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, email: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* School and Class */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Current Class *</label>
                  <select
                    value={scholarshipForm.studentClass}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, studentClass: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none transition-colors"
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

                <div className="space-y-1.5 sm:col-span-2">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">School Name & Location</label>
                  <input
                    type="text"
                    placeholder="School name & city"
                    value={scholarshipForm.schoolName}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, schoolName: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Board, Performance & Income */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Target Board *</label>
                  <select
                    value={scholarshipForm.board}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, board: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none transition-colors"
                  >
                    <option value="CBSE">CBSE Board (Central)</option>
                    <option value="State Board">State Board (CG, UP, Karnataka, etc.)</option>
                    <option value="ICSE/ISC">ICSE / ISC Board</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Previous Class Marks / Grade *</label>
                  <select
                    value={scholarshipForm.previousScore}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, previousScore: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none transition-colors"
                  >
                    <option value="above-95">Above 95% Marks / Grade A+</option>
                    <option value="90-95">90% - 95% Marks / Grade A</option>
                    <option value="80-90">80% - 90% Marks / Grade B</option>
                    <option value="70-80">70% - 80% Marks / Grade C</option>
                    <option value="below-70">Below 70% Marks</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Annual Family Income *</label>
                  <select
                    value={scholarshipForm.familyIncome}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, familyIncome: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none transition-colors"
                  >
                    <option value="below-3">Below ₹3 Lakhs (Max need-based assistance)</option>
                    <option value="3-6">₹3 Lakhs - ₹6 Lakhs</option>
                    <option value="6-12">₹6 Lakhs - ₹12 Lakhs</option>
                    <option value="above-12">Above ₹12 Lakhs</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-[#061F48] uppercase block">Course of Interest *</label>
                  <select
                    value={scholarshipForm.courseOfInterest}
                    onChange={(e) => setScholarshipForm({ ...scholarshipForm, courseOfInterest: e.target.value })}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none transition-colors"
                  >
                    <option value="Classes 6 to 10 (Subject-wise)">Classes 6 to 10 (Subject-wise) - ₹1,499/subject</option>
                    <option value="Classes 11 & 12 (Per Subject)">Classes 11 & 12 (Per Subject) - ₹3,499/subject</option>
                    <option value="JEE & NEET Preparation">JEE & NEET Preparation</option>
                    <option value="CBSE Board Exam Class 10 Test Series">CBSE Board Exam Class 10 Test Series</option>
                    <option value="State Board Exam Class 12 Test Series">State Board Exam Class 12 Test Series</option>
                    <option value="JEE Test Series">JEE Test Series</option>
                    <option value="NEET Test Series">NEET Test Series</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#061F48] uppercase block">Co-Curricular / Talent Achievements</label>
                <textarea
                  value={scholarshipForm.achievements}
                  onChange={(e) => setScholarshipForm({ ...scholarshipForm, achievements: e.target.value })}
                  placeholder="E.g. School Topper, Olympiad ranks, NTSE achievements, state sports merit, or none"
                  rows={2}
                  className="w-full bg-[#F8F5ED] border border-[#061F48]/10 focus:border-[#D09515] px-3 py-2.5 rounded-xl text-xs font-medium text-[#061F48] focus:outline-none transition-colors resize-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isCalculatingScholarship}
                  className="w-full bg-[#061F48] text-white hover:bg-[#D09515] py-4 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-colors shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-85"
                >
                  {isCalculatingScholarship ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Analyzing Performance Profile...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#D09515]" />
                      <span>Calculate My Estimated Scholarship</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          ) : (
            <div className="text-center space-y-6 animate-fade-in">
              <div className="inline-flex h-14 w-14 bg-emerald-100 rounded-full items-center justify-center text-emerald-600">
                <Award className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xl md:text-2xl font-bold text-[#061F48]">
                  Scholarship Assessment Complete!
                </h4>
                <p className="text-xs text-[#061F48]/70 font-semibold">
                  Here is your estimated grant certificate based on the admission matrix.
                </p>
              </div>

              {/* Certificate Box */}
              <div className="relative bg-[#F8F5ED] border-2 border-dashed border-[#D09515] p-6 md:p-8 rounded-[2rem] max-w-xl mx-auto space-y-6 text-left shadow-md">
                
                {/* Stamp */}
                <div className="absolute top-4 right-4 h-12 w-12 border-2 border-[#D09515] rounded-full flex items-center justify-center text-[#D09515] rotate-12 opacity-80">
                  <span className="text-[8px] font-black tracking-tighter text-center uppercase leading-none">APPROVED<br />2026</span>
                </div>

                {/* Header */}
                <div className="text-center pb-4 border-b border-[#061F48]/10">
                  <span className="text-[10px] font-black tracking-[0.2em] text-[#061F48] uppercase block">CONCEPT MADE EASY CLASSES</span>
                  <span className="text-[8px] font-bold text-[#D09515] uppercase tracking-widest block mt-0.5">ESTIMATED ADMISSION GRANT CERTIFICATE</span>
                </div>

                {/* Details */}
                <div className="space-y-3 pt-2 text-xs text-[#061F48]">
                  <p>This is to certify that <strong className="font-extrabold text-[#061F48] uppercase">{scholarshipForm.studentName}</strong> (Ward of {scholarshipForm.parentName}) studying in Class <strong className="font-extrabold">{scholarshipForm.studentClass}th</strong>, is provisionally eligible for an educational scholarship concession on the tuition fees of <strong className="font-extrabold">{scholarshipForm.courseOfInterest}</strong> program.</p>
                  
                  <div className="bg-white px-4 py-3.5 rounded-2xl border border-[#061F48]/5 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] font-black text-[#061F48]/50 uppercase tracking-widest block leading-none">ESTIMATED GRANT</span>
                      <span className="text-2xl font-black text-[#D09515]">{estimatedScholarship}% TUITION CONCESSION</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] font-black text-[#061F48]/50 uppercase tracking-widest block leading-none">VALID COHORT</span>
                      <span className="text-xs font-extrabold text-[#061F48] uppercase">{scholarshipForm.board} Batch</span>
                    </div>
                  </div>

                  {/* Breakdown */}
                  <div className="text-[10px] bg-[#F8F5ED] p-3 rounded-xl space-y-1.5 border border-[#061F48]/5">
                    <strong className="text-[#061F48] uppercase block tracking-wider font-extrabold">Grant Assessment Factors:</strong>
                    <div className="flex justify-between">
                      <span className="text-[#061F48]/70">Academic Score Concession ({scholarshipForm.previousScore === 'above-95' ? 'A+' : scholarshipForm.previousScore === '90-95' ? 'A' : 'B/C'} range):</span>
                      <span className="font-bold text-[#061F48]">{scholarshipForm.previousScore === 'above-95' ? '35%' : scholarshipForm.previousScore === '90-95' ? '30%' : scholarshipForm.previousScore === '80-90' ? '25%' : scholarshipForm.previousScore === '70-80' ? '20%' : '15%'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#061F48]/70">Socio-Economic Need Allowance:</span>
                      <span className="font-bold text-[#061F48]">+{scholarshipForm.familyIncome === 'below-3' ? '15%' : scholarshipForm.familyIncome === '3-6' ? '10%' : scholarshipForm.familyIncome === '6-12' ? '5%' : '0%'}</span>
                    </div>
                    {(scholarshipForm.achievements || '').trim().length > 0 && (
                      <div className="flex justify-between">
                        <span className="text-[#061F48]/70">Extra-Curricular / Talent Bonus:</span>
                        <span className="font-bold text-[#061F48]">+5%</span>
                      </div>
                    )}
                    <div className="flex justify-between border-t border-[#061F48]/10 pt-1.5 font-bold text-[#061F48]">
                      <span>Final Simulated Concession (Capped at 50% max):</span>
                      <span className="text-[#D09515]">{estimatedScholarship}%</span>
                    </div>
                  </div>
                </div>

                {/* Sign-offs */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[#061F48]/10 text-center text-[9px] font-bold text-[#061F48]/70">
                  <div>
                    <p className="font-serif italic text-xs text-[#061F48] font-bold">Pranjal Agrawal</p>
                    <p className="uppercase tracking-widest mt-1 text-[7px] text-[#061F48]/50">FOUNDER & DIRECTOR</p>
                  </div>
                  <div>
                    <p className="font-serif italic text-xs text-[#D09515] font-bold">Gauri Gupta</p>
                    <p className="uppercase tracking-widest mt-1 text-[7px] text-[#061F48]/50">CHIEF EXECUTIVE OFFICER</p>
                  </div>
                </div>

              </div>

              <p className="text-xs text-[#061F48]/60 font-semibold max-w-lg mx-auto leading-relaxed">
                Your concession rate is saved. Claim your scholarship seat now to book a live counseling session and lock in this fee rate.
              </p>

              <div className="bg-[#F8F5ED] border border-[#D09515]/35 p-4 rounded-2xl max-w-md mx-auto space-y-1 text-center shadow-sm">
                <span className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block">🔒 Secure Admin Portal Synchronization</span>
                <p className="text-[10px] text-[#061F48]/80 font-bold leading-normal">
                  This application has submitted successfully and is stored securely. To protect student privacy, it is visible <strong>only inside the private Admin Dashboard</strong>.
                </p>
              </div>

              <div className="flex flex-wrap justify-center gap-4 pt-2">
                <button 
                  onClick={resetScholarshipForm}
                  className="text-xs font-bold text-[#061F48]/60 hover:text-[#061F48] uppercase tracking-wider transition-colors"
                >
                  Reset & Try Another Profile
                </button>
                <button 
                  onClick={claimSeat}
                  className="bg-[#061F48] text-white hover:bg-[#D09515] px-8 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider transition-all shadow-md flex items-center gap-1"
                >
                  <span>Claim My Concession Seat</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
