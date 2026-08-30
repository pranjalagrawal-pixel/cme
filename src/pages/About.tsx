import React, { useState } from 'react';
import { 
  Award, 
  BookOpen, 
  Users, 
  Compass, 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  MapPin, 
  CheckCircle 
} from 'lucide-react';

export default function About() {
  const [activeTab, setActiveTab] = useState<'mission' | 'methodology' | 'founders' | 'faculty'>('mission');

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Intro Header banner */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-[0.25em] block">Our Academy Profile</span>
        <h1 className="text-3xl md:text-5xl font-black text-[#061F48] tracking-tight leading-tight">
          Pioneering Concept-Based Live Online Instruction
        </h1>
        <p className="text-xs sm:text-sm text-[#061F48]/75 font-semibold leading-relaxed">
          Concept Made Easy Classes is a concept-focused learning platform for students preparing for school and competitive examinations.
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap justify-center gap-2 border-b border-[#061F48]/10 pb-4">
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'mission'
              ? 'bg-[#061F48] text-white shadow-md'
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Our Core Mission
        </button>
        <button
          onClick={() => setActiveTab('methodology')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'methodology'
              ? 'bg-[#061F48] text-white shadow-md'
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Teaching Methodology
        </button>
        <button
          onClick={() => setActiveTab('founders')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'founders'
              ? 'bg-[#061F48] text-white shadow-md'
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Founder Profiles
        </button>
        <button
          onClick={() => setActiveTab('faculty')}
          className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
            activeTab === 'faculty'
              ? 'bg-[#061F48] text-white shadow-md'
              : 'bg-white text-[#061F48] hover:bg-[#061F48]/5 border border-[#061F48]/10'
          }`}
        >
          Expert Faculty Team
        </button>
      </div>

      {/* Tab Contents */}
      <div className="mt-8">
        
        {/* MISSION TAB */}
        {activeTab === 'mission' && (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <div className="space-y-6 text-center md:text-left bg-white p-8 md:p-12 rounded-[2rem] border border-[#061F48]/10 shadow-sm">
              <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">Bridging Gaps Nationally</span>
              <h2 className="text-2xl md:text-3xl font-bold text-[#061F48]">100% Online, Deep Personal Interactivity</h2>
              <p className="text-xs md:text-sm text-[#061F48]/70 font-semibold leading-relaxed">
                Our core academy mandate is to establish fully personalized live digital classrooms. We use online learning to make structured academic support more accessible to students, without requiring a physical classroom commute.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl text-left">
                  <h4 className="text-sm font-bold text-[#061F48]">Live Academic Support</h4>
                  <p className="text-[11px] text-[#061F48]/70 font-semibold mt-1">Get custom slot times aligned perfectly with your specific school exam timetable.</p>
                </div>
                <div className="p-4 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl text-left">
                  <h4 className="text-sm font-bold text-[#061F48]">Anti-Crowd Culture</h4>
                  <p className="text-[11px] text-[#061F48]/70 font-semibold mt-1">We aim to keep learning focused and give students meaningful opportunities to ask questions.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* METHODOLOGY TAB */}
        {activeTab === 'methodology' && (
          <div className="space-y-12 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-6">
                <span className="text-xs font-extrabold uppercase text-[#D09515] tracking-widest block">Root Cause Deconstruction</span>
                <h2 className="text-2xl md:text-3xl font-bold text-[#061F48]">Concept-Based Learning vs. Rote Learning</h2>
                <p className="text-xs md:text-sm text-[#061F48]/70 font-semibold leading-relaxed">
                  Our approach emphasizes clear explanations, worked examples, derivations, diagrams, and guided practice so students can understand the reasoning behind a solution.
                </p>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-xs font-semibold text-[#061F48]/80">
                    <CheckCircle className="h-4 w-4 text-[#D09515] shrink-0" />
                    <span>Real physics derivations, not formula mugging</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-semibold text-[#061F48]/80">
                    <CheckCircle className="h-4 w-4 text-[#D09515] shrink-0" />
                    <span>Custom shortcut booklets & study-sheet layouts</span>
                  </div>
                  <div className="flex items-center space-x-3 text-xs font-semibold text-[#061F48]/80">
                    <CheckCircle className="h-4 w-4 text-[#D09515] shrink-0" />
                    <span>Weekly review summaries shared with parents</span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 bg-[#F8F5ED] border border-[#061F48]/10 p-6 rounded-3xl space-y-4">
                <h3 className="text-sm font-extrabold uppercase text-[#061F48] tracking-wider">The 4-Step Student Success Blueprint</h3>
                <div className="space-y-4 text-xs">
                  <div className="flex space-x-3">
                    <div className="h-6 w-6 rounded-full bg-[#061F48] text-white flex items-center justify-center font-bold text-[10px] shrink-0">1</div>
                    <div>
                      <h4 className="font-bold text-[#061F48]">Visual Deconstruction</h4>
                      <p className="text-[#061F48]/70 font-medium">Deconstruct core formulas using visual interactive boards.</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-6 w-6 rounded-full bg-[#D09515] text-white flex items-center justify-center font-bold text-[10px] shrink-0">2</div>
                    <div>
                      <h4 className="font-bold text-[#061F48]">Supervised Application</h4>
                      <p className="text-[#061F48]/70 font-medium">Solve complex JEE/NEET multi-concept problems live with the specialist.</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-6 w-6 rounded-full bg-[#061F48] text-white flex items-center justify-center font-bold text-[10px] shrink-0">3</div>
                    <div>
                      <h4 className="font-bold text-[#061F48]">Weekly Rigorous Review</h4>
                      <p className="text-[#061F48]/70 font-medium">Take rigorous mock tests modelled on CBSE and CBT patterns.</p>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <div className="h-6 w-6 rounded-full bg-[#D09515] text-white flex items-center justify-center font-bold text-[10px] shrink-0">4</div>
                    <div>
                      <h4 className="font-bold text-[#061F48]">On-Demand Doubt Solver</h4>
                      <p className="text-[#061F48]/70 font-medium">Ask academic questions and receive guided explanations.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* FOUNDERS TAB */}
        {activeTab === 'founders' && (
          <div className="bg-white p-7 md:p-9 rounded-[2rem] border border-[#061F48]/10 shadow-sm animate-fade-in">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D09515]">Leadership</span>
            <h3 className="mt-2 text-2xl font-black text-[#061F48]">Concept Made Easy Leadership</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#061F48]/70">
              Leadership and operations information will be published here as the academy finalizes its official public profile.
            </p>
          </div>
        )}

        {activeTab === 'faculty' && (
          <div className="bg-white p-7 md:p-9 rounded-[2rem] border border-[#061F48]/10 shadow-sm animate-fade-in">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D09515]">Faculty</span>
            <h3 className="mt-2 text-2xl font-black text-[#061F48]">Academic Faculty</h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-[#061F48]/70">
              Faculty profiles will appear here as each educator's official public profile is published. No placeholder or unverified faculty information is displayed.
            </p>
          </div>
        )}

      </div>

    </div>
  );
}
