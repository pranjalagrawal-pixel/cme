import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Search, 
  Globe, 
  BookOpen, 
  GraduationCap, 
  Sparkles, 
  Loader2, 
  ExternalLink, 
  History, 
  HelpCircle,
  X,
  BookMarked,
  ArrowRight
} from 'lucide-react';

interface Citation {
  title: string;
  uri: string;
}

interface SearchHistoryItem {
  query: string;
  subject: string;
  studentClass: string;
  answer: string;
  citations: Citation[];
  timestamp: string;
}

const PRESET_FAQS = [
  { label: 'Photosynthesis Process', query: 'Explain the light and dark reaction stages of photosynthesis with formulas.', subject: 'Biology', cls: '10' },
  { label: 'Faraday\'s Induction Law', query: 'State Faraday\'s Law of Electromagnetic Induction and its mathematical expression.', subject: 'Physics', cls: '12' },
  { label: 'Speed vs Velocity', query: 'What is the exact distinction between scalar speed and vector velocity with examples?', subject: 'Physics', cls: '9' },
  { label: 'Pythagoras Theorem', query: 'State the Pythagoras Theorem and provide its geometric proof explanation.', subject: 'Mathematics', cls: '7' },
  { label: 'Atomics: Bohr\'s Model', query: 'What are the main postulates of Bohr\'s model of an atom and its limitations?', subject: 'Chemistry', cls: '11' },
];

const CLASSES = ['6', '7', '8', '9', '10', '11', '12', 'General (6-12)'];
const SUBJECTS = ['General', 'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Science', 'Social Science', 'English'];

export default function CurriculumSearch() {
  const [queryInput, setQueryInput] = useState('');
  const [selectedClass, setSelectedClass] = useState('General (6-12)');
  const [selectedSubject, setSelectedSubject] = useState('General');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [answer, setAnswer] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cme_curriculum_search_history');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setHistory(parsed);
        } else {
          setHistory([]);
        }
      }
    } catch (e) {
      console.error('Error loading search history:', e);
      setHistory([]);
    }
  }, []);

  const saveHistoryItem = (newItem: SearchHistoryItem) => {
    const currentHist = Array.isArray(history) ? history : [];
    const updated = [newItem, ...currentHist.filter(h => h && h.query !== newItem.query)].slice(0, 5);
    setHistory(updated);
    try {
      localStorage.setItem('cme_curriculum_search_history', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving search history:', e);
    }
  };

  const handleSearchSubmit = async (e?: React.FormEvent, customQuery?: string, customSub?: string, customCls?: string) => {
    if (e) e.preventDefault();
    
    const activeQuery = customQuery || queryInput;
    const activeSub = customSub || selectedSubject;
    const activeCls = customCls || selectedClass;

    if (!activeQuery.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setCitations([]);

    try {
      const response = await fetch('/api/curriculum-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: activeQuery,
          subject: activeSub,
          studentClass: activeCls,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to retrieve search results. Please try again.');
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setAnswer(data.answer);
      setCitations(data.citations || []);

      // Save to history
      saveHistoryItem({
        query: activeQuery,
        subject: activeSub,
        studentClass: activeCls,
        answer: data.answer,
        citations: data.citations || [],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });

    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Something went wrong while connecting with the curriculum server.');
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: SearchHistoryItem) => {
    setQueryInput(item.query);
    setSelectedSubject(item.subject);
    setSelectedClass(item.studentClass);
    setAnswer(item.answer);
    setCitations(item.citations);
    setError(null);
    setShowHistory(false);
  };

  const clearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('cme_curriculum_search_history');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Title & Description */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/25">
            <Globe className="h-3.5 w-3.5 text-[#D09515] animate-spin-slow" />
            <span className="text-[9px] font-black uppercase tracking-wider">Google Grounded AI Search</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#061F48] mt-2 flex items-center gap-2">
            Curriculum Grounded Assistant (Classes 6-12)
          </h3>
          <p className="text-xs text-[#061F48]/60 font-bold mt-1">
            Look up standard definitions, NCERT aligned curriculum topics, and Board FAQ breakdowns instantly powered by real-time Google Grounding.
          </p>
        </div>

        {(history || []).length > 0 && (
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="text-[10px] font-black uppercase tracking-wider text-[#061F48] bg-[#F8F5ED] hover:bg-[#061F48]/5 px-3.5 py-2 rounded-xl border border-[#061F48]/10 transition-all flex items-center gap-1.5"
          >
            <History className="h-3.5 w-3.5" />
            <span>{showHistory ? 'Hide History' : 'Search History'}</span>
          </button>
        )}
      </div>

      {/* History panel drawer */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden bg-[#F8F5ED]/60 rounded-2xl border border-[#061F48]/5 p-4 space-y-3"
          >
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1">
                <BookMarked className="h-3.5 w-3.5" />
                <span>Recent Curriculum Lookups</span>
              </span>
              <button
                onClick={clearHistory}
                className="text-[9px] font-black uppercase tracking-wide text-red-600 hover:underline"
              >
                Clear All Logs
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {history.map((h, i) => (
                <div
                  key={i}
                  onClick={() => loadHistoryItem(h)}
                  className="bg-white p-3 rounded-xl border border-[#061F48]/5 hover:border-[#D09515]/55 cursor-pointer transition-all space-y-1.5 text-left group"
                >
                  <div className="flex justify-between items-center text-[8px] font-black text-[#061F48]/55 uppercase">
                    <span>{h.subject} • Class {h.studentClass}th</span>
                    <span>{h.timestamp}</span>
                  </div>
                  <p className="text-xs font-black text-[#061F48] group-hover:text-[#D09515] transition-all line-clamp-1">
                    "{h.query}"
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Form Fields */}
      <form onSubmit={(e) => handleSearchSubmit(e)} className="space-y-4">
        
        {/* Search Input Box */}
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-[#061F48]/30" />
          </div>
          <input
            type="text"
            required
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            placeholder="Type any syllabus concept (e.g. Rutherford scattering experiment, Ohm's law, Krebs cycle)..."
            className="w-full bg-[#F8F5ED] border border-[#061F48]/10 pl-12 pr-4 py-4 rounded-2xl text-xs md:text-sm font-bold text-[#061F48] focus:outline-none focus:ring-2 focus:ring-[#D09515]/40 placeholder:text-[#061F48]/30 transition-all"
          />
          <button
            type="submit"
            disabled={loading || !queryInput.trim()}
            className="absolute right-3.5 top-2.5 bg-[#061F48] hover:bg-[#D09515] disabled:bg-gray-200 text-white p-2.5 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-white" />
            ) : (
              <ArrowRight className="h-4 w-4 text-white" />
            )}
          </button>
        </div>

        {/* Dropdowns filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 block mb-1.5">Target Grade Level</label>
            <div className="relative">
              <GraduationCap className="absolute left-3.5 top-3.5 h-4 w-4 text-[#061F48]/40" />
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="w-full bg-[#F8F5ED] border border-[#061F48]/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:ring-2 focus:ring-[#D09515]/20 appearance-none"
              >
                {CLASSES.map((cls) => (
                  <option key={cls} value={cls}>Class {cls === 'General (6-12)' ? cls : `${cls} Standard`}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-[9.5px] font-black uppercase tracking-wider text-[#061F48]/60 block mb-1.5">Relevant Subject Area</label>
            <div className="relative">
              <BookOpen className="absolute left-3.5 top-3.5 h-4 w-4 text-[#061F48]/40" />
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full bg-[#F8F5ED] border border-[#061F48]/10 pl-10 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:ring-2 focus:ring-[#D09515]/20 appearance-none"
              >
                {SUBJECTS.map((sub) => (
                  <option key={sub} value={sub}>{sub} Syllabus</option>
                ))}
              </select>
            </div>
          </div>
        </div>

      </form>

      {/* Preset Fast FAQ Search Chips */}
      <div className="space-y-2">
        <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/50 block flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5 text-[#D09515]" />
          <span>Curriculum Sample FAQ Search Hooks</span>
        </span>
        <div className="flex flex-wrap gap-2">
          {PRESET_FAQS.map((faq, i) => (
            <button
              key={i}
              onClick={() => {
                setQueryInput(faq.query);
                setSelectedSubject(faq.subject);
                setSelectedClass(faq.cls);
                handleSearchSubmit(undefined, faq.query, faq.subject, faq.cls);
              }}
              disabled={loading}
              className="text-[10px] font-black bg-[#F8F5ED] hover:bg-[#061F48] hover:text-white border border-[#061F48]/5 hover:border-transparent text-[#061F48]/75 px-3 py-2 rounded-xl transition-all shadow-sm shrink-0"
            >
              • {faq.label}
            </button>
          ))}
        </div>
      </div>

      {/* Response Display Area */}
      <AnimatePresence mode="wait">
        
        {loading && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-[#F8F5ED]/60 rounded-2xl border border-dashed border-[#061F48]/15 p-12 text-center flex flex-col items-center justify-center space-y-4"
          >
            <Loader2 className="h-8 w-8 text-[#061F48] animate-spin" />
            <div className="space-y-1">
              <p className="text-xs font-black text-[#061F48] animate-pulse">Retrieving Standard Indian School Curriculum Syllabus References...</p>
              <p className="text-[10px] text-gray-400 font-bold">Deploying Google Search Grounding to verify definitions and pedagogical standards.</p>
            </div>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-black"
          >
            ⚠️ {error}
          </motion.div>
        )}

        {answer && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-5 md:p-6 space-y-4 shadow-sm"
          >
            {/* Header info */}
            <div className="flex justify-between items-center border-b border-[#061F48]/15 pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="h-4 w-4 text-[#D09515]" />
                <span className="text-[10px] font-black uppercase text-[#061F48]">
                  Grounding Verified Definition & FAQ Sheet
                </span>
              </div>
              <span className="text-[9px] font-black uppercase bg-[#061F48] text-white px-2 py-0.5 rounded shadow-sm">
                CBSE / NCERT / ICSE Standards
              </span>
            </div>

            {/* Answer body */}
            <div className="markdown-body text-xs md:text-sm font-semibold text-[#061F48]/80 leading-relaxed space-y-3">
              <Markdown>{answer}</Markdown>
            </div>

            {/* Citations section */}
            {(citations || []).length > 0 && (
              <div className="pt-4 border-t border-[#061F48]/15 space-y-2">
                <span className="text-[9px] font-black uppercase tracking-wider text-gray-400 block flex items-center gap-1.5">
                  <Globe className="h-3 w-3 text-[#D09515]" />
                  <span>Verified Grounding Sources (Google Search)</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {(citations || []).map((cite, idx) => (
                    <a
                      key={idx}
                      href={cite.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 bg-white hover:bg-[#F8F5ED] border border-[#061F48]/10 hover:border-[#D09515] px-3 py-1.5 rounded-lg text-[10px] text-[#061F48] font-black transition-all shadow-sm max-w-xs truncate"
                    >
                      <span className="truncate">{cite.title}</span>
                      <ExternalLink className="h-3 w-3 text-[#D09515] shrink-0" />
                    </a>
                  ))}
                </div>
              </div>
            )}
            
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
}
