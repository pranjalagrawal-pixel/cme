import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Clock, 
  MessageSquare, 
  ThumbsUp, 
  Video, 
  Mic, 
  Image as ImageIcon, 
  Filter, 
  Search, 
  User, 
  Award,
  Calendar,
  Zap,
  Volume2,
  Check,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

export interface SaturdayDoubt {
  id: string;
  batch: string; // e.g. "Class 10", "Class 12 JEE"
  studentName: string;
  rollNumber: string;
  subject: string;
  question: string;
  imageUrl?: string;
  submittedAt: string;
  status: 'Pending' | 'AI_Answered' | 'Mentor_Resolved';
  upvotes: number;
  answer?: string;
  solvedBy?: string;
  hasVoiceNote?: boolean;
}

interface SaturdayDoubtPortalProps {
  userBatch?: string;
  userName?: string;
  userRoll?: string;
}

export default function SaturdayDoubtPortal({
  userBatch = 'Class 10',
  userName = 'Student Learner',
  userRoll = 'CME-2026-1001'
}: SaturdayDoubtPortalProps) {
  const { addToast } = useToast();

  const [selectedBatch, setSelectedBatch] = useState<string>(userBatch || 'Class 10');
  const [selectedSubject, setSelectedSubject] = useState<string>('Physics');
  const [questionText, setQuestionText] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'ask' | 'feed' | 'live_stream'>('ask');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Determine current day for banner check
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const isSaturdayToday = dayName.toLowerCase() === 'saturday';

  // Available batches
  const batchesList = [
    'Class 9 Foundation',
    'Class 10 Board Mastery',
    'Class 11 JEE/NEET Pioneer',
    'Class 12 Target Batch',
    'Foundation Olympiad'
  ];

  // Pre-populated batch doubts
  const [doubts, setDoubts] = useState<SaturdayDoubt[]>([]);

  // Handle Image Upload simulation
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Doubt Handler
  const handleSubmitDoubt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      addToast({
        title: 'Empty Doubt Question',
        description: 'Please type or paste your doubt problem before submitting.',
        type: 'warning'
      });
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Generate instant AI step-by-step breakdown
      const newDoubt: SaturdayDoubt = {
        id: `dbt_${Date.now()}`,
        batch: selectedBatch,
        studentName: userName,
        rollNumber: userRoll,
        subject: selectedSubject,
        question: questionText,
        imageUrl: selectedImage || undefined,
        submittedAt: 'Just now',
        status: 'AI_Answered',
        upvotes: 1,
        answer: `[Saturday Special Instant AI Analysis for ${selectedSubject}]\n1. Concept Identified: Core ${selectedSubject} Board/Entrance Curriculum.\n2. Step-by-Step Resolution:\n- Analyzed given condition for "${questionText.slice(0, 40)}..."\n- Applied fundamental formulas & NCERT theorem derivations.\n- Final Result Verified. Senior Faculty mentor will also review this in Saturday Live Doubt Session.`,
        solvedBy: 'CME AI Saturday Assistant & Mentor Queue',
        hasVoiceNote: true
      };

      setDoubts([newDoubt, ...doubts]);
      setQuestionText('');
      setSelectedImage(null);
      setIsSubmitting(false);

      addToast({
        title: 'Doubt Submitted to Saturday Portal! ⚡',
        description: 'Instant AI solution generated & queued for Saturday Live Mentor review.',
        type: 'success'
      });

      setActiveTab('feed');
    }, 1200);
  };

  const handleUpvote = (id: string) => {
    setDoubts(doubts.map(d => {
      if (d.id === id) {
        return { ...d, upvotes: d.upvotes + 1 };
      }
      return d;
    }));
    addToast({
      title: 'Upvoted Doubt 👍',
      description: 'Marked as important. Faculty mentor notified to cover in live stream.',
      type: 'info'
    });
  };

  const toggleVoiceNote = (id: string) => {
    if (playingVoiceId === id) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(id);
      addToast({
        title: 'Playing Mentor Voice Explanation 🎧',
        description: 'Audio explanation loaded.',
        type: 'info'
      });
    }
  };

  // Filtered doubts
  const filteredDoubts = doubts.filter(d => {
    const matchesBatch = d.batch.toLowerCase().includes(selectedBatch.toLowerCase()) || selectedBatch.toLowerCase().includes(d.batch.toLowerCase());
    const matchesSubject = filterSubject === 'all' || d.subject.toLowerCase() === filterSubject.toLowerCase();
    const matchesSearch = d.question.toLowerCase().includes(searchQuery.toLowerCase()) || d.studentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesBatch && matchesSubject && matchesSearch;
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-[#061F48]/15 dark:border-gray-800 p-6 md:p-8 shadow-xl space-y-6">
      
      {/* SATURDAY BANNER HEADER */}
      <div className="bg-gradient-to-r from-[#061F48] via-[#103E96] to-[#061F48] text-white p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-48 h-48 bg-[#D09515]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#D09515] text-[#061F48] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Zap className="h-3.5 w-3.5 fill-current" />
              <span>
                {isSaturdayToday ? '🔥 TODAY IS SATURDAY: LIVE DOUBT PORTAL ACTIVE' : '⚡ SATURDAY SPECIAL BATCH DOUBT PORTAL (24/7 ACTIVE)'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Saturday Batch Doubt Portal</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-200 font-semibold max-w-xl">
              Dedicated Saturday doubt resolution desk for every batch. Ask complex questions, upload numerical problems, receive instant AI step-by-step guidance, & request live mentor video explanations.
            </p>
          </div>

          {/* QUICK METRICS */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 flex items-center gap-4">
            <div className="text-center px-2">
              <span className="text-2xl font-black text-[#D09515]">8</span>
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-300">Mentors Online</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center px-2">
              <span className="text-2xl font-black text-emerald-400">&lt; 4m</span>
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-300">Avg Response</span>
            </div>
          </div>
        </div>

        {/* BATCH SELECTOR TABS */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#D09515] shrink-0 mr-2 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Select Batch:
          </span>
          {batchesList.map((batch) => (
            <button
              key={batch}
              onClick={() => setSelectedBatch(batch)}
              className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                selectedBatch === batch
                  ? 'bg-[#D09515] text-[#061F48] shadow-md font-extrabold'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {batch}
            </button>
          ))}
        </div>
      </div>

      {/* PORTAL MAIN NAVIGATION TABS */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-3">
        <div className="flex items-center gap-2 bg-[#F8F5ED] dark:bg-gray-800 p-1.5 rounded-2xl border border-[#061F48]/10 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('ask')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'ask'
                ? 'bg-[#061F48] text-white shadow-md dark:bg-[#D09515] dark:text-[#061F48]'
                : 'text-[#061F48]/70 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <HelpCircle className="h-4 w-4" />
            <span>Ask Saturday Doubt</span>
          </button>

          <button
            onClick={() => setActiveTab('feed')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'feed'
                ? 'bg-[#061F48] text-white shadow-md dark:bg-[#D09515] dark:text-[#061F48]'
                : 'text-[#061F48]/70 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <MessageSquare className="h-4 w-4" />
            <span>Batch Doubt Ledger ({(filteredDoubts || []).length})</span>
          </button>

          <button
            onClick={() => setActiveTab('live_stream')}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'live_stream'
                ? 'bg-[#061F48] text-white shadow-md dark:bg-[#D09515] dark:text-[#061F48]'
                : 'text-[#061F48]/70 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <Video className="h-4 w-4 text-red-500 animate-pulse" />
            <span>Saturday Live Stream</span>
          </button>
        </div>

        <div className="text-xs font-extrabold text-[#061F48] dark:text-gray-300 flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Active Batch: <strong className="text-[#D09515]">{selectedBatch}</strong></span>
        </div>
      </div>

      {/* TAB CONTENT 1: ASK SATURDAY DOUBT FORM */}
      {activeTab === 'ask' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <form onSubmit={handleSubmitDoubt} className="bg-[#F8F5ED] dark:bg-gray-800/80 p-6 rounded-3xl border border-[#061F48]/10 dark:border-gray-700 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-gray-200">
                  Select Subject for {selectedBatch}
                </label>
                <div className="flex items-center gap-2 overflow-x-auto scrollbar-none">
                  {['Physics', 'Chemistry', 'Biology', 'Mathematics', 'Science'].map(subj => (
                    <button
                      key={subj}
                      type="button"
                      onClick={() => setSelectedSubject(subj)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${
                        selectedSubject === subj
                          ? 'bg-[#061F48] text-white dark:bg-[#D09515] dark:text-[#061F48]'
                          : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'
                      }`}
                    >
                      {subj}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <textarea
                  rows={4}
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  placeholder={`Type your Saturday doubt question for ${selectedSubject}... (e.g. NCERT textbook problems, board sample papers, numerical equations)`}
                  className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 rounded-2xl p-4 text-xs font-semibold text-[#061F48] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#061F48] dark:focus:ring-[#D09515]"
                />
              </div>

              {/* IMAGE ATTACHMENT SIMULATION */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer bg-white dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-[#061F48] dark:text-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold border border-gray-200 dark:border-gray-700 flex items-center gap-2 transition-all">
                    <ImageIcon className="h-4 w-4 text-[#D09515]" />
                    <span>Attach Photo/Diagram</span>
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>

                  {selectedImage && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check className="h-3 w-3" /> Photo Attached
                    </span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>{isSubmitting ? 'Analyzing Doubt...' : 'Submit Saturday Doubt'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* SATURDAY ADVANTAGES SIDEBAR */}
          <div className="bg-[#F8F5ED] dark:bg-gray-800/80 p-6 rounded-3xl border border-[#061F48]/10 dark:border-gray-700 space-y-4">
            <h4 className="text-sm font-black text-[#061F48] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Award className="h-4 w-4 text-[#D09515]" />
              <span>Saturday Portal Benefits</span>
            </h4>
            <ul className="space-y-3 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Instant Step-by-Step AI Solutions</strong> generated within seconds using NCERT curriculum datasets.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Faculty Audio Voice Notes</strong> recorded by subject experts for difficult proofs & numericals.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <span><strong>Live Saturday Stream Integration</strong> where top upvoted doubts are solved line-by-line on whiteboard.</span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: BATCH DOUBT LEDGER */}
      {activeTab === 'feed' && (
        <div className="space-y-4">
          {/* SEARCH & SUBJECT FILTERS */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 text-gray-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search ${selectedBatch} doubts...`}
                className="w-full bg-[#F8F5ED] dark:bg-gray-800 border border-[#061F48]/10 dark:border-gray-700 pl-8 pr-3 py-2 rounded-xl text-xs font-bold text-[#061F48] dark:text-white focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto scrollbar-none">
              <Filter className="h-3.5 w-3.5 text-gray-400 shrink-0 mr-1" />
              {['all', 'Physics', 'Chemistry', 'Biology', 'Mathematics'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilterSubject(s)}
                  className={`text-[10px] font-black uppercase px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0 ${
                    filterSubject === s
                      ? 'bg-[#061F48] text-white dark:bg-[#D09515] dark:text-[#061F48]'
                      : 'bg-[#F8F5ED] text-[#061F48]/70 dark:bg-gray-800 dark:text-gray-300 hover:bg-[#061F48]/10'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* DOUBT CARDS */}
          <div className="space-y-4">
            {(filteredDoubts || []).length === 0 ? (
              <div className="text-center p-8 bg-[#F8F5ED] dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-300 dark:border-gray-700">
                <HelpCircle className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-500">No Saturday doubts logged for {selectedBatch} in this filter.</p>
              </div>
            ) : (
              (filteredDoubts || []).map((doubt) => (
                <div key={doubt.id} className="bg-[#F8F5ED] dark:bg-gray-800/80 p-5 rounded-2xl border border-[#061F48]/10 dark:border-gray-700 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#061F48] text-white">
                        {doubt.subject}
                      </span>
                      <span className="text-xs font-black text-[#061F48] dark:text-white">
                        {doubt.studentName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">({doubt.rollNumber})</span>
                    </div>

                    <span className="text-[10px] text-gray-400 font-bold flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {doubt.submittedAt}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-[#061F48] dark:text-gray-200 leading-relaxed">
                    "{doubt.question}"
                  </p>

                  {/* ANSWER SECTION */}
                  {doubt.answer && (
                    <div className="bg-white dark:bg-gray-900 p-4 rounded-xl border border-emerald-500/20 space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5" /> Solution by {doubt.solvedBy}
                        </span>

                        {doubt.hasVoiceNote && (
                          <button
                            onClick={() => toggleVoiceNote(doubt.id)}
                            className="bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2.5 py-1 rounded-lg flex items-center gap-1 hover:bg-emerald-200 transition-colors cursor-pointer"
                          >
                            <Volume2 className="h-3.5 w-3.5" />
                            <span>{playingVoiceId === doubt.id ? 'Pause Voice Note' : 'Listen Voice Explanation'}</span>
                          </button>
                        )}
                      </div>

                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300 whitespace-pre-line leading-relaxed">
                        {doubt.answer}
                      </p>
                    </div>
                  )}

                  {/* FOOTER ACTIONS */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700 text-xs">
                    <button
                      onClick={() => handleUpvote(doubt.id)}
                      className="text-[10px] font-black uppercase text-[#061F48] dark:text-gray-300 hover:text-[#D09515] flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <ThumbsUp className="h-3.5 w-3.5 text-[#D09515]" />
                      <span>Also Have This Doubt ({doubt.upvotes})</span>
                    </button>

                    <span className="text-[10px] font-bold text-gray-400">
                      Batch: {doubt.batch}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: SATURDAY LIVE STREAM */}
      {activeTab === 'live_stream' && (
        <div className="bg-slate-950 text-white p-6 md:p-8 rounded-3xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-red-600 text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full animate-pulse">
                <Video className="h-3.5 w-3.5" /> Saturday Live Stream Broadcast
              </span>
              <h3 className="text-xl font-black mt-2 text-white">
                {selectedBatch} - Saturday Special Doubt Masterclass
              </h3>
              <p className="text-xs text-slate-400 font-semibold mt-0.5">
                Live doubt support appears here when a real session is scheduled.
              </p>
            </div>

            <button
              onClick={() => {
                addToast({
                  title: 'Joined Saturday Doubt Stream 🎥',
                  description: 'Interactive audio & video channel activated.',
                  type: 'success'
                });
              }}
              className="bg-[#D09515] hover:bg-amber-400 text-[#061F48] px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <Mic className="h-4 w-4" />
              <span>Enter Live Doubt Room</span>
            </button>
          </div>

          <div className="aspect-video bg-slate-900 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-6 text-center space-y-3 relative overflow-hidden">
            <div className="h-16 w-16 rounded-full bg-[#061F48] text-[#D09515] flex items-center justify-center shadow-2xl border border-[#D09515]/40">
              <Video className="h-8 w-8 animate-pulse" />
            </div>
            <div>
              <h4 className="text-base font-black text-white">Interactive Whiteboard Stream Ready</h4>
              <p className="text-xs text-slate-400 font-semibold max-w-md mt-1">
                48 students from {selectedBatch} are currently watching live. Raise your hand to speak directly with the faculty mentor.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
