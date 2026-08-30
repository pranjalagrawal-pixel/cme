import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  Sparkles, 
  BookOpen, 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  XCircle, 
  ChevronRight, 
  ArrowRight, 
  RotateCcw, 
  History, 
  Bookmark, 
  HelpCircle,
  Clock,
  Loader2,
  Mic,
  MicOff,
  Copy,
  Check,
  Star,
  WifiOff,
  MessageSquare
} from 'lucide-react';
import TestFeedbackModal from './TestFeedbackModal';
import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc } from '../lib/firebase';

interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

interface ConceptExplanation {
  id?: string;
  topic: string;
  subject: string;
  style: string;
  explanation: string;
  analogy: string;
  keyTakeaways: string[];
  quiz?: QuizQuestion[];
  createdAt: string;
}

interface ConceptExplainerProps {
  profile: {
    id: string;
    name: string;
    studentClass: string;
    stream?: string;
  };
}

const STYLE_PRESETS = [
  { id: 'ELI5', label: 'ELI5 (Explain Like I\'m 5)', desc: 'Super simple vocabulary, analogies, and playful descriptions.' },
  { id: 'analogy', label: 'Visual Analogies', desc: 'Relates concepts directly to physical, everyday real-world examples.' },
  { id: 'rigorous', label: 'Detailed & Mathematical', desc: 'Step-by-step mathematical logic, formulas, and derivations.' },
  { id: 'cbse', label: 'CBSE Exam Oriented', desc: 'High-yield textbook definitions, board-style points, and examiner tips.' },
];

export default function ConceptExplainer({ profile }: ConceptExplainerProps) {
  const [topic, setTopic] = useState('');
  const [subject, setSubject] = useState('Science');
  const [style, setStyle] = useState('analogy');
  const [includeQuiz, setIncludeQuiz] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Current active result
  const [explanationResult, setExplanationResult] = useState<ConceptExplanation | null>(null);
  
  // History list
  const [history, setHistory] = useState<ConceptExplanation[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Quiz interactive state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, number>>({});
  const [quizSubmitted, setQuizSubmitted] = useState<Record<number, boolean>>({});
  const [showFeedbackModal, setShowFeedbackModal] = useState<boolean>(false);

  // Web Speech API / Dictation state
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);
  const [speechError, setSpeechError] = useState('');

  // Copy and Share states/actions
  const [copied, setCopied] = useState(false);

  // Starred / offline concepts states
  const [starredConcepts, setStarredConcepts] = useState<ConceptExplanation[]>([]);
  const [historyTab, setHistoryTab] = useState<'all' | 'starred'>('all');

  // Load starred concepts on mount or profile change
  useEffect(() => {
    try {
      const savedStarred = localStorage.getItem(`cme_starred_concepts_${profile?.id || 'guest'}`);
      if (savedStarred) {
        const parsed = JSON.parse(savedStarred);
        if (Array.isArray(parsed)) {
          setStarredConcepts(parsed);
        } else {
          setStarredConcepts([]);
        }
      } else {
        setStarredConcepts([]);
      }
    } catch (e) {
      console.error('Error loading starred concepts:', e);
      setStarredConcepts([]);
    }
  }, [profile?.id]);

  const toggleStar = (concept: ConceptExplanation) => {
    const isAlreadyStarred = (starredConcepts || []).some(
      c => c && c.topic && concept && c.topic.toLowerCase() === (concept.topic || '').toLowerCase() && c.style === concept.style
    );
    let updated: ConceptExplanation[];
    if (isAlreadyStarred) {
      updated = (starredConcepts || []).filter(
        c => !(c && c.topic && concept && c.topic.toLowerCase() === (concept.topic || '').toLowerCase() && c.style === concept.style)
      );
    } else {
      const newStarredItem = {
        ...concept,
        id: concept.id || `starred_${Date.now()}`,
        starredAt: new Date().toISOString()
      };
      updated = [newStarredItem, ...(starredConcepts || [])];
    }
    setStarredConcepts(updated);
    try {
      localStorage.setItem(`cme_starred_concepts_${profile?.id || 'guest'}`, JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving starred concepts to local cache:', e);
    }
  };

  const isConceptStarred = (concept: ConceptExplanation | null) => {
    if (!concept || !concept.topic) return false;
    return (starredConcepts || []).some(
      c => c && c.topic && c.topic.toLowerCase() === (concept.topic || '').toLowerCase() && c.style === concept.style
    );
  };

  const handleCopyToClipboard = () => {
    if (!explanationResult) return;
    const bulletPoints = (explanationResult.keyTakeaways || []).map(t => `• ${t}`).join('\n');
    const textToCopy = `📚 *Topic:* ${explanationResult.topic || ''}\n📖 *Subject:* ${explanationResult.subject || ''}\n\n🔍 *Explanation:*\n${explanationResult.explanation || ''}\n\n💡 *Analogy:*\n"${explanationResult.analogy || ''}"\n\n🎯 *Key Takeaways:*\n${bulletPoints}\n\n✨ _Generated by Concept Made Easy Classes_`;
    
    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => console.error('Could not copy explanation: ', err));
  };

  const handleShareToWhatsApp = () => {
    if (!explanationResult) return;
    const expText = explanationResult.explanation || '';
    const bulletPoints = (explanationResult.keyTakeaways || []).map(t => `• ${t}`).join('\n');
    const textToShare = `📚 *Topic:* ${explanationResult.topic || ''}\n📖 *Subject:* ${explanationResult.subject || ''}\n\n🔍 *Explanation:*\n${expText.slice(0, 400)}${(expText || '').length > 400 ? '...' : ''}\n\n💡 *Analogy:*\n"${explanationResult.analogy || ''}"\n\n🎯 *Key Takeaways:*\n${bulletPoints}\n\n✨ _Generated by Concept Made Easy Classes_`;
    
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(textToShare)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Initialize Speech Recognition on Mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = 'en-IN'; // Indian English / Standard English support

        rec.onstart = () => {
          setIsListening(true);
          setSpeechError('');
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            // strip ending periods/punctuation for neat keyword search
            const cleanTranscript = transcript.replace(/[.?!]$/g, "");
            setTopic(cleanTranscript);
          }
        };

        rec.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          if (event.error === 'not-allowed') {
            setSpeechError('Microphone permission denied. Please allow mic access.');
          } else {
            setSpeechError(`Voice capture error: ${event.error}`);
          }
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        setRecognition(rec);
      } catch (e) {
        console.error('Failed to create SpeechRecognition instance:', e);
      }
    }
  }, []);

  const handleToggleSpeech = () => {
    if (!recognition) {
      setSpeechError('Voice dictation is not supported by your current browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setSpeechError('');
      try {
        recognition.start();
      } catch (err: any) {
        console.error('Speech start error:', err);
        setSpeechError('Could not start microphone. Check permissions.');
      }
    }
  };

  // Recommended/Suggested topics based on class
  const isHigherClass = parseInt(profile.studentClass) >= 11;
  const isCommerce = profile.stream === 'Commerce';
  
  const suggestedTopics = isHigherClass 
    ? (isCommerce 
        ? ['Double Entry Bookkeeping', 'Price Elasticity of Demand', 'Gross Domestic Product (GDP)', 'Partnership Deed Accounts']
        : ['Nernst Equation', 'Capacitance & Parallel Plates', 'Wave Optics & Interference', 'Integration by Parts'])
    : ['Reflection & Refraction of Light', 'Quadratic Equations', 'Chemical Reactions', 'Carbon and its Compounds', 'Metals & Non-metals'];

  // Load history from Firestore / LocalStorage on mount
  useEffect(() => {
    fetchHistory();
  }, [profile.id]);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const savedLocal = localStorage.getItem(`cme_explanations_${profile?.id || 'guest'}`);
      let localHistory: ConceptExplanation[] = [];
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed)) localHistory = parsed;
        } catch (e) {
          console.error(e);
        }
      }

      if (profile?.id && !profile.id.startsWith('temp_')) {
        // Try to fetch from Firebase
        const q = query(
          collection(db, 'concept_explanations'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        const fbHistory: ConceptExplanation[] = [];
        querySnapshot.forEach((docSnap) => {
          fbHistory.push({ id: docSnap.id, ...docSnap.data() } as ConceptExplanation);
        });

        // Combine and de-duplicate (prefer firebase metadata)
        const combined = [...fbHistory];
        localHistory.forEach(lh => {
          if (lh && lh.topic && !combined.some(cf => cf && cf.topic && cf.topic.toLowerCase() === lh.topic.toLowerCase())) {
            combined.push(lh);
          }
        });
        
        // Sort by createdAt descending
        combined.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setHistory(combined);
      } else {
        localHistory.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
        setHistory(localHistory);
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleGenerate = async (targetTopic?: string) => {
    const topicToSearch = targetTopic || topic;
    if (!topicToSearch.trim()) {
      setError('Please type or select a topic first.');
      return;
    }

    setError('');
    setLoading(true);
    setExplanationResult(null);
    setQuizAnswers({});
    setQuizSubmitted({});

    try {
      const response = await fetch('/api/explain-concept', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicToSearch,
          subject,
          style,
          includeQuiz,
          studentClass: profile.studentClass
        })
      });

      if (!response.ok) {
        throw new Error('Server responded with an error');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newExp: ConceptExplanation = {
        topic: topicToSearch,
        subject,
        style,
        explanation: data.explanation,
        analogy: data.analogy,
        keyTakeaways: data.keyTakeaways,
        quiz: data.quiz || [],
        createdAt: new Date().toISOString()
      };

      setExplanationResult(newExp);

      // Save explanation to history
      await saveExplanation(newExp);
    } catch (err: any) {
      console.error('Error explaining concept:', err);
      setError(err.message || 'Unable to generate explanation at the moment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const saveExplanation = async (exp: ConceptExplanation) => {
    try {
      let savedId = '';
      if (profile.id && !profile.id.startsWith('temp_')) {
        // Save to Firebase
        const docRef = await addDoc(collection(db, 'concept_explanations'), {
          ...exp,
          studentId: profile.id
        });
        savedId = docRef.id;
      }

      // Update local state and LocalStorage
      const updatedExp = { ...exp, id: savedId || `local_${Date.now()}` };
      const newHistory = [updatedExp, ...history.filter(h => h.topic.toLowerCase() !== exp.topic.toLowerCase())];
      setHistory(newHistory);
      localStorage.setItem(`cme_explanations_${profile.id}`, JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error saving explanation:', err);
    }
  };

  const handleDeleteHistory = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (profile.id && !profile.id.startsWith('temp_') && !id.startsWith('local_')) {
        await deleteDoc(doc(db, 'concept_explanations', id));
      }
      const newHistory = history.filter(h => h.id !== id);
      setHistory(newHistory);
      localStorage.setItem(`cme_explanations_${profile.id}`, JSON.stringify(newHistory));
    } catch (err) {
      console.error('Error deleting history item:', err);
    }
  };

  const handleSelectHistoryItem = (item: ConceptExplanation) => {
    setExplanationResult(item);
    setQuizAnswers({});
    setQuizSubmitted({});
    setShowHistory(false);
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 px-3 py-1 rounded-full text-[#061F48]">
            <Brain className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">AI Study Assist</span>
          </div>
          <h2 className="text-xl font-black text-[#061F48] flex items-center gap-2">
            AI Concept Explainer
            <Sparkles className="h-5 w-5 text-[#D09515] animate-pulse" />
          </h2>
          <p className="text-xs text-[#061F48]/70 font-semibold max-w-2xl">
            Struggling with a heavy syllabus topic? Get custom explanations, memorable physical analogies, and instant feedback quizzes tailored to Class {profile.studentClass}th.
          </p>
        </div>

        <button
          onClick={() => setShowHistory(!showHistory)}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-[#061F48]/15 text-xs font-bold text-[#061F48] hover:bg-[#F8F5ED] transition-colors"
        >
          <History className="h-4 w-4" />
          <span>{showHistory ? 'Back to Generator' : 'My Explanations'}</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          /* HISTORY SCREEN */
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4 min-h-[300px]"
          >
            {/* Tab Switched Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-gray-100 pb-3">
              <div className="flex items-center bg-[#F8F5ED] border border-[#061F48]/10 p-1 rounded-xl text-[10px] font-black uppercase">
                <button
                  type="button"
                  onClick={() => setHistoryTab('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all ${historyTab === 'all' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/75 hover:bg-[#061F48]/5'}`}
                >
                  📖 Recent Explanations ({(history || []).length})
                </button>
                <button
                  type="button"
                  onClick={() => setHistoryTab('starred')}
                  className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${historyTab === 'starred' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/75 hover:bg-[#061F48]/5'}`}
                >
                  ⭐ Starred (Offline Revision) ({(starredConcepts || []).length})
                </button>
              </div>

              {historyTab === 'starred' && (
                <div className="inline-flex items-center gap-1.5 bg-[#F8F5ED] px-3 py-1.5 rounded-xl border border-[#D09515]/20 text-[9.5px] font-bold text-[#D09515]">
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Cached Offline Revision Mode Active</span>
                </div>
              )}
            </div>

            {historyTab === 'all' ? (
              /* ALL EXPLANATIONS */
              loadingHistory ? (
                <div className="flex flex-col items-center justify-center py-16 text-[#061F48]/40">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <p className="text-xs font-bold mt-2">Loading learning logs...</p>
                </div>
              ) : (history || []).length === 0 ? (
                <div className="border border-dashed border-gray-200 rounded-2xl p-12 text-center space-y-3">
                  <Bookmark className="h-10 w-10 text-[#061F48]/10 mx-auto" />
                  <p className="text-xs font-bold text-[#061F48]/70">No concept history yet!</p>
                  <p className="text-[11px] text-gray-400">Type a topic name on the generator screen to save your first concept study card.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(history || []).map((item, idx) => {
                    const starred = isConceptStarred(item);
                    return (
                      <div
                        key={item.id || idx}
                        onClick={() => handleSelectHistoryItem(item)}
                        className="group border border-gray-100 hover:border-[#D09515]/30 bg-white hover:bg-[#F8F5ED]/30 p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-start gap-3 relative"
                      >
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase bg-[#061F48]/5 text-[#061F48] px-2 py-0.5 rounded">
                              {item.subject}
                            </span>
                            <span className="text-[9px] font-bold text-gray-400">
                              {STYLE_PRESETS.find(s => s.id === item.style)?.label || item.style}
                            </span>
                          </div>
                          <h4 className="text-sm font-black text-[#061F48] group-hover:text-[#D09515] transition-colors">
                            {item.topic}
                          </h4>
                          <p className="text-[11px] text-[#061F48]/60 italic line-clamp-2">
                            "💡 {item.analogy}"
                          </p>
                          <div className="flex items-center gap-1.5 text-[9px] text-gray-400 font-semibold">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStar(item);
                            }}
                            className={`p-1.5 rounded-lg transition-colors ${starred ? 'text-[#D09515] hover:bg-[#F8F5ED]' : 'text-gray-300 hover:text-[#D09515] hover:bg-gray-50'}`}
                            title={starred ? "Starred for Offline" : "Star for offline revision"}
                          >
                            <Star className={`h-4.5 w-4.5 ${starred ? 'fill-current' : ''}`} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleDeleteHistory(item.id || '', e)}
                            className="text-red-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                            title="Delete from logs"
                          >
                            <XCircle className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              /* STARRED OFFLINE CONCEPTS */
              (starredConcepts || []).length === 0 ? (
                <div className="border border-dashed border-[#D09515]/20 bg-[#F8F5ED]/30 rounded-2xl p-12 text-center space-y-3">
                  <Star className="h-10 w-10 text-[#D09515]/30 mx-auto animate-pulse" />
                  <p className="text-xs font-black text-[#061F48]/70">No Starred Concept Modules Yet!</p>
                  <p className="text-[11px] text-gray-500 max-w-sm mx-auto font-bold">
                    Mark explanations with a ⭐ Star to cache them securely inside your local browser storage. They will be available here for your study session even without an active internet connection.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-[#D09515]/20 p-3 rounded-xl text-[10px] text-[#061F48] font-bold flex items-center gap-2">
                    <WifiOff className="h-4.5 w-4.5 text-[#D09515] shrink-0" />
                    <span>All concept cards listed below are cached in your local browser storage. You can access their definitions, memory points, analogies, and quizzes offline.</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(starredConcepts || []).map((item, idx) => {
                      return (
                        <div
                          key={item.id || idx}
                          onClick={() => handleSelectHistoryItem(item)}
                          className="group border border-amber-100 hover:border-[#D09515]/50 bg-amber-50/10 hover:bg-[#F8F5ED]/40 p-4 rounded-2xl cursor-pointer transition-all flex justify-between items-start gap-3 relative"
                        >
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="text-[9px] font-black uppercase bg-[#D09515]/10 text-[#D09515] px-2.5 py-0.5 rounded">
                                {item.subject}
                              </span>
                              <span className="text-[9px] font-bold text-gray-400">
                                {STYLE_PRESETS.find(s => s.id === item.style)?.label || item.style}
                              </span>
                              <span className="text-[8px] bg-emerald-50 text-emerald-800 border border-emerald-100 px-1.5 py-0.2 rounded font-black uppercase tracking-wide">
                                Cached Offline
                              </span>
                            </div>
                            <h4 className="text-sm font-black text-[#061F48] group-hover:text-[#D09515] transition-colors">
                              {item.topic}
                            </h4>
                            <p className="text-[11px] text-[#061F48]/60 italic line-clamp-2">
                              "💡 {item.analogy}"
                            </p>
                          </div>

                          <div className="shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleStar(item);
                              }}
                              className="p-1.5 rounded-lg text-[#D09515] hover:bg-[#F8F5ED] transition-colors"
                              title="Unstar (Remove from Cache)"
                            >
                              <Star className="h-4.5 w-4.5 fill-current" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            )}
          </motion.div>
        ) : (
          /* GENERATOR & ACTIVE RESULT SCREEN */
          <motion.div
            key="generator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* INPUT CONTROLS SECTION */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 bg-[#F8F5ED] p-5 rounded-3xl border border-[#061F48]/5">
              
              <div className="lg:col-span-8 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Topic name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-wider block">1. Concept/Topic Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="e.g. Photosynthesis, Nernst Equation, GDP..."
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="w-full bg-white border border-[#061F48]/10 rounded-xl pl-4 pr-11 py-3 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515] shadow-sm placeholder:text-[#061F48]/30"
                      />
                      <button
                        type="button"
                        onClick={handleToggleSpeech}
                        title={isListening ? "Stop listening" : "Dictate topic"}
                        className={`absolute right-2.5 top-1/2 -translate-y-1/2 p-2 rounded-lg transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-[#061F48]/50 hover:text-[#061F48] hover:bg-[#061F48]/5'}`}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {speechError && (
                      <p className="text-[9px] text-red-500 font-bold mt-1">
                        ⚠️ {speechError}
                      </p>
                    )}
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-wider block">2. Subject Domain</label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-white border border-[#061F48]/10 rounded-xl px-4 py-3 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515] shadow-sm cursor-pointer"
                    >
                      <option value="Science">Science (General)</option>
                      <option value="Physics">Physics</option>
                      <option value="Chemistry">Chemistry</option>
                      <option value="Biology">Biology</option>
                      <option value="Mathematics">Mathematics</option>
                      {isCommerce ? (
                        <>
                          <option value="Accountancy">Accountancy</option>
                          <option value="Economics">Economics</option>
                          <option value="Business Studies">Business Studies</option>
                        </>
                      ) : (
                        <option value="General Studies">General Studies</option>
                      )}
                    </select>
                  </div>
                </div>

                {/* Suggestions pills */}
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block">Or click to select a syllabus suggestion:</span>
                  <div className="flex flex-wrap gap-2">
                    {suggestedTopics.map((sTopic) => (
                      <button
                        key={sTopic}
                        type="button"
                        onClick={() => {
                          setTopic(sTopic);
                          if (sTopic.includes('Nernst') || sTopic.includes('Capacitance') || sTopic.includes('Wave')) {
                            setSubject('Physics');
                          } else if (sTopic.includes('Equation') || sTopic.includes('Quadratic') || sTopic.includes('Integration')) {
                            setSubject('Mathematics');
                          } else if (sTopic.includes('Bookkeeping') || sTopic.includes('Account')) {
                            setSubject('Accountancy');
                          } else if (sTopic.includes('Elasticity') || sTopic.includes('GDP')) {
                            setSubject('Economics');
                          } else if (sTopic.includes('Reaction') || sTopic.includes('Compounds')) {
                            setSubject('Chemistry');
                          } else {
                            setSubject('Science');
                          }
                        }}
                        className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all ${topic === sTopic ? 'bg-[#061F48] text-white border-[#061F48]' : 'bg-white text-[#061F48]/80 hover:bg-[#D09515]/10 border-[#061F48]/10'}`}
                      >
                        {sTopic}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Recent Searches (Quick Access) */}
                {(history || []).length > 0 && (
                  <div className="space-y-1.5 pt-2 border-t border-dashed border-[#061F48]/10">
                    <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block flex items-center gap-1">
                      <Clock className="h-3 w-3 text-[#061F48]/40" />
                      <span>Recent Searches (Quick Access):</span>
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {(history || []).slice(0, 5).map((item, idx) => (
                        <button
                          key={item.id || idx}
                          type="button"
                          onClick={() => {
                            setTopic(item.topic || '');
                            setSubject(item.subject || 'Science');
                            setStyle(item.style || 'analogy');
                            setExplanationResult(item);
                            setQuizAnswers({});
                            setQuizSubmitted({});
                          }}
                          className={`text-[10px] font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 ${(topic || '').toLowerCase() === (item.topic || '').toLowerCase() ? 'bg-[#061F48] text-white border-[#061F48]' : 'bg-white hover:bg-[#F8F5ED] border-[#061F48]/10 hover:border-[#D09515]/30 text-[#061F48]/80'}`}
                        >
                          <Clock className={`h-3 w-3 ${(topic || '').toLowerCase() === (item.topic || '').toLowerCase() ? 'text-white' : 'text-[#D09515]'}`} />
                          <span>{item.topic}</span>
                          <span className={`text-[8px] font-medium ${(topic || '').toLowerCase() === (item.topic || '').toLowerCase() ? 'text-white/60' : 'text-gray-400'}`}>({item.subject})</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Quick style config */}
              <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-wider block">3. Explanation Personality</label>
                  <div className="grid grid-cols-2 gap-2">
                    {STYLE_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setStyle(p.id)}
                        className={`text-left p-2.5 rounded-xl border transition-all flex flex-col justify-between ${style === p.id ? 'bg-white border-[#D09515] ring-1 ring-[#D09515]/40 shadow-sm' : 'bg-white/50 border-[#061F48]/10 hover:bg-white'}`}
                      >
                        <span className="text-[10px] font-black text-[#061F48] leading-none block">{p.id === 'ELI5' ? '👶 ELI5' : p.id === 'analogy' ? '💡 Analogy' : p.id === 'rigorous' ? '📐 Rigorous' : '🎓 CBSE'}</span>
                        <span className="text-[8px] text-gray-400 font-semibold leading-tight mt-1 line-clamp-2">{p.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 bg-white px-3 py-2 rounded-xl border border-[#061F48]/5">
                  <div className="flex items-center gap-1.5">
                    <HelpCircle className="h-4 w-4 text-[#D09515]" />
                    <span className="text-[10px] font-black text-[#061F48] uppercase tracking-wider">Include Practice Quiz</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={includeQuiz}
                      onChange={(e) => setIncludeQuiz(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#061F48]"></div>
                  </label>
                </div>
              </div>

              {/* Action Button */}
              <div className="lg:col-span-12 pt-2">
                <button
                  type="button"
                  onClick={() => handleGenerate()}
                  disabled={loading || !topic.trim()}
                  className="w-full bg-[#061F48] hover:bg-[#D09515] disabled:bg-gray-200 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Synthesizing explanations with Academic AI...</span>
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4" />
                      <span>Explain Concept Instantly</span>
                    </>
                  )}
                </button>
              </div>

            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-xs font-semibold p-4 rounded-xl flex items-center gap-2">
                <XCircle className="h-4.5 w-4.5" />
                <span>{error}</span>
              </div>
            )}

            {/* RESULTS VIEW */}
            <AnimatePresence mode="wait">
              {explanationResult && (
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2"
                >
                  
                  {/* Left Column: Markdown Explanation */}
                  <div className="lg:col-span-8 space-y-6">
                    <div className="bg-white border border-gray-100 rounded-[2rem] p-6 md:p-8 shadow-sm space-y-5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-50 pb-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[9px] font-black uppercase bg-[#F8F5ED] text-[#D09515] border border-[#D09515]/20 px-2.5 py-1 rounded-md">
                              STUDY CARD
                            </span>
                            <span className="text-[10px] font-bold text-[#061F48]/60 capitalize bg-[#061F48]/5 px-2 py-0.5 rounded-md">
                              Style: {STYLE_PRESETS.find(s => s.id === explanationResult.style)?.label}
                            </span>
                          </div>
                          <h3 className="text-lg md:text-xl font-black text-[#061F48]">
                            {explanationResult.topic}
                          </h3>
                        </div>

                        {/* Share and Copy buttons */}
                        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleStar(explanationResult)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                              isConceptStarred(explanationResult)
                                ? 'bg-[#D09515] border-[#D09515] text-white shadow-md'
                                : 'bg-white border-[#061F48]/10 text-[#061F48]/70 hover:text-[#061F48] hover:bg-[#061F48]/5'
                            }`}
                          >
                            <Star className={`h-3.5 w-3.5 ${isConceptStarred(explanationResult) ? 'fill-current text-white' : 'text-[#D09515]'}`} />
                            <span>{isConceptStarred(explanationResult) ? 'Starred (Cached)' : 'Star (Save Offline)'}</span>
                          </button>

                          <button
                            type="button"
                            onClick={handleCopyToClipboard}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${copied ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-[#061F48]/10 text-[#061F48]/70 hover:text-[#061F48] hover:bg-[#061F48]/5'}`}
                          >
                            {copied ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>Copied!</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3.5 w-3.5 text-[#D09515]" />
                                <span>Copy</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={handleShareToWhatsApp}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#20ba5a] text-white border border-[#25D366] rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-sm"
                          >
                            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.905-6.99C16.559 1.876 14.077.844 11.44.844 6.002.844 1.58 5.263 1.577 10.7c-.001 1.638.45 3.238 1.309 4.636l-.995 3.635 3.731-.977zm11.368-6.13c-.301-.15-1.779-.879-2.046-.976-.267-.097-.461-.147-.655.15-.194.297-.749.976-.92 1.17-.17.196-.34.22-.641.07-1.3-.65-2.144-1.252-2.992-2.705-.224-.385.224-.357.641-1.196.07-.15.035-.28-.018-.38-.052-.102-.461-1.11-.631-1.518-.166-.399-.349-.343-.48-.349-.124-.006-.267-.007-.412-.007s-.382.055-.582.274c-.2.219-.764.747-.764 1.822s.783 2.115.892 2.263c.109.148 1.541 2.353 3.733 3.301.52.225.927.359 1.242.46.523.167.997.143 1.373.088.418-.062 1.779-.727 2.03-1.43.251-.702.251-1.305.176-1.43-.075-.124-.267-.199-.569-.349z"/>
                            </svg>
                            <span>WhatsApp</span>
                          </button>
                        </div>
                      </div>

                      {/* Main explanation */}
                      <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed font-semibold">
                        <div className="markdown-body text-xs md:text-sm">
                          <Markdown>{explanationResult.explanation}</Markdown>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Analogy, Takeaways, Quiz */}
                  <div className="lg:col-span-4 space-y-6">
                    
                    {/* KEY ANALOGY */}
                    <div className="bg-gradient-to-br from-[#D09515]/5 to-[#D09515]/15 border border-[#D09515]/25 rounded-[2rem] p-6 space-y-3 shadow-sm">
                      <div className="flex items-center gap-2 text-[#D09515]">
                        <Lightbulb className="h-5 w-5 fill-current" />
                        <h4 className="text-xs font-black uppercase tracking-wider">The Everyday Analogy</h4>
                      </div>
                      <p className="text-xs text-[#061F48] font-bold leading-relaxed italic">
                        "{explanationResult.analogy}"
                      </p>
                    </div>

                    {/* KEY TAKEAWAYS */}
                    <div className="bg-[#F8F5ED] border border-[#061F48]/5 rounded-[2rem] p-6 space-y-4">
                      <h4 className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                        <span>Key Memory Points</span>
                      </h4>
                      <ul className="space-y-2.5">
                        {(explanationResult.keyTakeaways || []).map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2 text-[11px] text-[#061F48] font-semibold leading-relaxed">
                            <span className="text-[#D09515] font-black mt-0.5">•</span>
                            <span>{point}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* INTERACTIVE MINI QUIZ */}
                    {(explanationResult.quiz || []).length > 0 && (
                      <div className="bg-[#F8F5ED] border border-[#061F48]/10 rounded-[2rem] p-6 space-y-5">
                        <div className="flex items-center gap-1.5 border-b border-gray-200 pb-3">
                          <HelpCircle className="h-4.5 w-4.5 text-[#061F48]" />
                          <h4 className="text-xs font-black text-[#061F48] uppercase tracking-wider">Concept Check Quiz</h4>
                        </div>

                        <div className="space-y-6">
                          {(explanationResult.quiz || []).map((q, qIdx) => {
                            const isSubmitted = quizSubmitted[qIdx];
                            const selectedAns = quizAnswers[qIdx];
                            
                            return (
                              <div key={qIdx} className="space-y-2.5 border-b border-gray-200/50 pb-4 last:border-0 last:pb-0">
                                <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wide block">Question {qIdx + 1}</span>
                                <p className="text-xs font-bold text-[#061F48] leading-normal">{q.question}</p>
                                
                                <div className="space-y-1.5">
                                  {(q.options || []).map((opt, oIdx) => {
                                    const isCorrect = oIdx === q.correctAnswerIndex;
                                    const isSelected = selectedAns === oIdx;
                                    
                                    let optionStyle = 'bg-white border-[#061F48]/10 hover:border-[#D09515]/30';
                                    if (isSubmitted) {
                                      if (isCorrect) {
                                        optionStyle = 'bg-emerald-50 border-emerald-300 text-emerald-800';
                                      } else if (isSelected) {
                                        optionStyle = 'bg-red-50 border-red-300 text-red-800';
                                      } else {
                                        optionStyle = 'bg-white opacity-65 border-gray-100';
                                      }
                                    } else if (isSelected) {
                                      optionStyle = 'bg-[#061F48]/5 border-[#061F48]';
                                    }

                                    return (
                                      <button
                                        key={oIdx}
                                        type="button"
                                        disabled={isSubmitted}
                                        onClick={() => setQuizAnswers({ ...quizAnswers, [qIdx]: oIdx })}
                                        className={`w-full text-left p-2.5 rounded-xl border text-[11px] font-semibold transition-all flex items-center justify-between gap-2 ${optionStyle}`}
                                      >
                                        <span>{opt}</span>
                                        {isSubmitted && isCorrect && <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />}
                                        {isSubmitted && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                                      </button>
                                    );
                                  })}
                                </div>

                                {!isSubmitted && selectedAns !== undefined && (
                                  <button
                                    type="button"
                                    onClick={() => setQuizSubmitted({ ...quizSubmitted, [qIdx]: true })}
                                    className="bg-[#061F48] text-white text-[9px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg flex items-center gap-1 ml-auto"
                                  >
                                    <span>Check Answer</span>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                  </button>
                                )}

                                {isSubmitted && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    className="bg-white/70 p-3 rounded-xl border border-[#061F48]/5 text-[10.5px] font-semibold text-gray-600 leading-relaxed"
                                  >
                                    <span className="font-black text-[#061F48] block mb-0.5">
                                      {selectedAns === q.correctAnswerIndex ? '🎉 Correct!' : '💡 Explanation:'}
                                    </span>
                                    {q.explanation}
                                  </motion.div>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        <div className="pt-3 border-t border-[#061F48]/10 flex justify-center">
                          <button
                            type="button"
                            onClick={() => setShowFeedbackModal(true)}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
                          >
                            <MessageSquare className="h-3.5 w-3.5" />
                            <span>Rate Concept Questions / Report Issue</span>
                          </button>
                        </div>
                      </div>
                    )}

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>
        )}
      </AnimatePresence>

      <TestFeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        testSubject={subject}
        studentName={profile.name}
        studentClass={profile.studentClass}
        totalQuestions={explanationResult?.quiz?.length || 3}
      />

    </div>
  );
}
