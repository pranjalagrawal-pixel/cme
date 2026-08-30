import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  Award, 
  Clock, 
  ChevronRight, 
  ShieldAlert, 
  FileText 
} from 'lucide-react';

export default function TestSeries() {
  const navigate = useNavigate();

  const testSeriesData = [
    {
      id: 'ts1',
      title: 'CBSE Board Exam Class 10 Test Series',
      price: '₹1999',
      duration: 'Full Syllabus Access',
      syllabus: 'Class 10 complete Science (Physics, Chemistry, Biology), Mathematics, and English grammar/literature mapped exactly to the latest CBSE guidelines.',
      features: [
        '15 Full-length Mock Papers compiled by Ritwika and Nikhil',
        'In-depth, hand-graded feedback pointing out step-wise mistakes',
        'Model answer papers detailing ideal presentation strategies',
        'Special emphasis on subjective answer writing to maximize marks',
        'Live post-test group analysis and time management classes'
      ],
      details: 'Designed specifically to eliminate exam anxiety. We provide actual board-style sheets for practice, evaluated rigorously by Board specialists.',
      color: '#061F48',
      tag: 'Class 10 Boards'
    },
    {
      id: 'ts2',
      title: 'State Board Exam Class 12 Test Series',
      price: '₹1999',
      duration: 'Full Syllabus Access',
      syllabus: 'Class 12 core streams: Physics, Chemistry, Mathematics (PCM) or Biology (PCB) following updated NCERT schemas and state board formats.',
      features: [
        '12 comprehensive mock exams per core subject stream',
        'Strict mapping to the latest board evaluation and marking schemes',
        'Detailed personal scorecard identifying speed and accuracy bottlenecks',
        'Previous 10 years fully solved Board Question Banks',
        'Special doubts session to clarify marking guidelines and steps'
      ],
      details: 'Crucial for students targeting high percentages for university admissions. Covers derivations, numerical setups, and long-form descriptive answers.',
      color: '#D09515',
      tag: 'Class 12 Boards'
    },
    {
      id: 'ts3',
      title: 'JEE Test Series',
      price: '₹3599',
      duration: 'Adaptive Prep Timeline',
      syllabus: 'Rigorous Chemistry, Physics, and Mathematics (PCM) questions mapping to JEE Main & Advanced curriculum limits.',
      features: [
        'Full syllabus Mock Tests + chapter-wise conceptual drills',
        'Authentic online CBT (Computer-Based Test) simulation',
        'Predictive AIR (All India Rank) model with percentile dashboard',
        'Detailed video solutions explaining multi-concept equations',
        'Core tips to crack high-weightage topics under pressure'
      ],
      details: 'Simulates the exact stress and technical interface of the JEE entrance exam. Track your speed, negative marks, and topic-wise percentile.',
      color: '#061F48',
      tag: 'JEE Entrance'
    },
    {
      id: 'ts4',
      title: 'NEET Test Series',
      price: '₹3999',
      duration: 'Adaptive Prep Timeline',
      syllabus: 'Fully aligned to NCERT core trends. Physics, Chemistry, Botany, and Zoology structured question banks.',
      features: [
        '15 Full-length 200-question mock drills matching NEET format',
        'Deep botany and zoology taxonomic and ecological map tests',
        'Instant scoring with granular accuracy statistics',
        'Error logs pointing out negative marking tendencies',
        'Exclusive queries solved 1:1 with Ritwika and Ansh'
      ],
      details: 'Master biological diagram models, organic chemistry reactions, and physics conceptual numericals. The absolute benchmark for medical candidates.',
      color: '#D09515',
      tag: 'NEET Entrance'
    }
  ];

  const handleEnroll = (seriesTitle: string) => {
    const encodedTitle = encodeURIComponent(seriesTitle);
    navigate(`/contact?course=${encodedTitle}`);
  };

  return (
    <div className="space-y-16 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
      
      {/* Header Banner */}
      <div className="bg-[#061F48] text-white p-8 md:p-16 rounded-[2.5rem] relative overflow-hidden shadow-2xl text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#D09515] opacity-[0.06] rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-4 max-w-2xl">
          <span className="text-xs font-extrabold text-[#D09515] tracking-[0.25em] uppercase block">Evaluated Practice Engines</span>
          <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">Board & Entrance Test Series</h1>
          <p className="text-xs md:text-sm text-white/85 font-semibold leading-relaxed">
            Practice makes perfect. Our test series are not just question lists. They include actual step-by-step subjective grading for boards, full CBT computer simulations for JEE, and deep NCERT analyses for NEET.
          </p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <button 
            onClick={() => handleEnroll("All Series Package")}
            className="w-full md:w-auto bg-white text-[#061F48] hover:bg-[#D09515] hover:text-white px-8 py-4 rounded-xl text-xs font-extrabold tracking-wider uppercase shadow-lg transition-all"
          >
            Request Free Demo Test
          </button>
        </div>
      </div>

      {/* Test Series Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {testSeriesData.map((ts) => (
          <div 
            key={ts.id}
            className="bg-white border border-[#061F48]/10 rounded-[2.5rem] p-8 shadow-md hover:shadow-2xl transition-all flex flex-col justify-between"
          >
            <div className="space-y-6">
              
              {/* Header inside card */}
              <div className="flex items-center justify-between border-b border-[#061F48]/5 pb-4">
                <span 
                  className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full text-white"
                  style={{ backgroundColor: ts.color }}
                >
                  {ts.tag}
                </span>
                <span className="text-xs font-bold text-[#061F48]/60 uppercase tracking-wider flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {ts.duration}
                </span>
              </div>

              {/* Title & Info */}
              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-[#061F48] tracking-tight">{ts.title}</h3>
                <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed bg-[#F8F5ED] p-4 rounded-xl border border-[#061F48]/5">
                  <strong>Scope:</strong> {ts.syllabus}
                </p>
              </div>

              {/* Features List */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-[#061F48] uppercase tracking-wider">What is included:</h4>
                <ul className="space-y-2">
                  {(ts.features || []).map((feat, index) => (
                    <li key={index} className="flex items-start text-xs font-semibold text-[#061F48]/80 space-x-2">
                      <CheckCircle className="h-4 w-4 text-[#D09515] shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Detail paragraph */}
              <p className="text-xs text-[#061F48]/60 font-semibold italic">{ts.details}</p>

            </div>

            {/* Price & Action */}
            <div className="border-t border-[#061F48]/5 pt-6 mt-8 flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-[#061F48]/55 uppercase block leading-none">Full Access Price</span>
                <span className="text-3xl font-black text-[#D09515]">{ts.price}</span>
              </div>
              <button
                onClick={() => handleEnroll(ts.title)}
                className="bg-[#061F48] hover:bg-[#D09515] text-white px-6 py-3.5 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center gap-1"
              >
                <span>Enroll in Series</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* Dynamic Comparison Panel */}
      <div className="bg-[#F8F5ED] border border-[#061F48]/10 p-8 rounded-[2rem] space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <Award className="h-8 w-8 text-[#D09515] mx-auto" />
          <h3 className="text-lg font-bold text-[#061F48]">The Evaluation Difference</h3>
          <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed">
            Standard online platforms just give you multiple choice scorecards. We provide personalized mentor grading that breaks down your answer steps!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div className="bg-white p-4 rounded-xl border border-[#061F48]/5 space-y-2">
            <h4 className="font-bold text-[#061F48] flex items-center gap-1">
              <FileText className="h-4 w-4 text-[#D09515]" /> Subjective Evaluations
            </h4>
            <p className="text-[#061F48]/75">
              Submit your written chemistry derivations or biology diagrams as photos. Our specialist team marks them line-by-line, pointing out step marks and layout improvements.
            </p>
          </div>
          <div className="bg-white p-4 rounded-xl border border-[#061F48]/5 space-y-2">
            <h4 className="font-bold text-[#061F48] flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-[#D09515]" /> Live Post-Test Discussions
            </h4>
            <p className="text-[#061F48]/75">
              Don't struggle with paper keys. We hold group video sessions where Ritwika and Nikhil detail exactly why a formula is chosen and the shortest logical route to solve it.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
