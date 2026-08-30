import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Trophy, 
  CheckCircle2, 
  BookOpen, 
  Plus, 
  Trash2, 
  Sparkles, 
  PlusCircle, 
  BookMarked, 
  CheckSquare, 
  Square, 
  TrendingUp,
  Brain,
  Layers,
  ArrowRight
} from 'lucide-react';
import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from '../lib/firebase';

interface LearningTopic {
  id: string;
  topic: string;
  category: string;
  isCompleted: boolean;
  createdAt: string;
}

interface ConceptExplanation {
  topic: string;
  subject: string;
  createdAt: string;
}

interface MasteryTrackerProps {
  profile: {
    id: string;
    name: string;
    studentClass: string;
    stream?: string;
  };
}

const PRESET_TOPICS: Record<string, string[]> = {
  '11-Science': ['Nernst Equation', 'Capacitance & Parallel Plates', 'Projectile Motion', 'Kinetic Theory of Gases'],
  '12-Science': ['Photoelectric Effect', 'Semiconductor Diodes', 'Electromagnetic Induction', 'Organic Synthesis'],
  '11-Commerce': ['Double Entry Bookkeeping', 'Price Elasticity', 'Partnership Deed Accounts', 'Demand & Supply Equilibrium'],
  '12-Commerce': ['National Income Accounting', 'Foreign Exchange Market', 'Company Balance Sheet', 'Consumer Protection Act'],
  'default': ['Quadratic Equations', 'Photosynthesis', 'Reflection & Refraction', 'Atomic Structure']
};

export default function MasteryTracker({ profile }: MasteryTrackerProps) {
  const [learningTopics, setLearningTopics] = useState<LearningTopic[]>([]);
  const [newTopic, setNewTopic] = useState('');
  const [category, setCategory] = useState('Core Syllabus');
  
  // Explored concepts count
  const [exploredCount, setExploredCount] = useState(0);
  const [exploredTopicsList, setExploredTopicsList] = useState<string[]>([]);
  
  // Flashcards deck count
  const [flashcardDeckCount, setFlashcardDeckCount] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Key derived state
  const studentClass = profile?.studentClass || '10';
  const stream = profile?.stream || 'Science';
  const classKey = `${studentClass}-${stream}`;
  const presets = PRESET_TOPICS[classKey] || PRESET_TOPICS[`${studentClass}-Science`] || PRESET_TOPICS['default'] || [];

  useEffect(() => {
    fetchExploredConcepts();
    fetchLearningTopics();
    fetchFlashcardsCount();
  }, [profile?.id]);

  const fetchExploredConcepts = async () => {
    try {
      const uniqueTopics = new Set<string>();
      const studentId = profile?.id || 'learner';
      
      // Load local history
      const savedLocal = localStorage.getItem(`cme_explanations_${studentId}`);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed)) {
            parsed.forEach((item: any) => {
              if (item?.topic) uniqueTopics.add(item.topic);
            });
          }
        } catch (e) {
          console.warn('Failed to parse local explanations:', e);
        }
      }

      // Load Firestore history
      if (profile?.id && !profile.id.startsWith('temp_')) {
        const q = query(
          collection(db, 'concept_explanations'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.topic) {
            uniqueTopics.add(data.topic);
          }
        });
      }

      setExploredCount(uniqueTopics.size);
      setExploredTopicsList(Array.from(uniqueTopics));
    } catch (err) {
      console.error('Error fetching explored concepts:', err);
    }
  };

  const fetchFlashcardsCount = async () => {
    try {
      let count = 0;
      const studentId = profile?.id || 'learner';
      const savedLocal = localStorage.getItem(`cme_flashcard_decks_${studentId}`);
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed)) {
            count = parsed.length;
          }
        } catch (e) {
          count = 0;
        }
      }

      if (profile?.id && !profile.id.startsWith('temp_')) {
        const q = query(
          collection(db, 'flashcard_decks'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        // Deduplicate
        const deckTopics = new Set<string>();
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (data.topic) deckTopics.add(data.topic.toLowerCase());
        });
        
        if (savedLocal) {
          try {
            const parsed = JSON.parse(savedLocal);
            if (Array.isArray(parsed)) {
              parsed.forEach((d: any) => {
                if (d?.topic) deckTopics.add(d.topic.toLowerCase());
              });
            }
          } catch (e) {
            // ignore
          }
        }
        count = deckTopics.size;
      }
      setFlashcardDeckCount(count);
    } catch (err) {
      console.error('Error fetching flashcard count:', err);
    }
  };

  const fetchLearningTopics = async () => {
    try {
      setLoading(true);
      const studentId = profile?.id || 'learner';
      const savedLocal = localStorage.getItem(`cme_learning_topics_${studentId}`);
      let localTopics: LearningTopic[] = [];
      if (savedLocal) {
        try {
          const parsed = JSON.parse(savedLocal);
          if (Array.isArray(parsed)) {
            localTopics = parsed;
          }
        } catch (e) {
          localTopics = [];
        }
      }

      if (profile?.id && !profile.id.startsWith('temp_')) {
        const q = query(
          collection(db, 'learning_topics'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        const fbTopics: LearningTopic[] = [];
        querySnapshot.forEach((docSnap) => {
          fbTopics.push({ id: docSnap.id, ...docSnap.data() } as LearningTopic);
        });

        // Combine
        const combined = [...fbTopics];
        localTopics.forEach(lt => {
          if (!combined.some(ct => ct.topic.toLowerCase() === lt.topic.toLowerCase())) {
            combined.push(lt);
          }
        });

        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLearningTopics(combined);
      } else {
        // Fallback or local only if unauthenticated
        // Initialize with default template if absolutely empty
        if ((localTopics || []).length === 0) {
          localTopics = (presets || []).map((topic, i) => ({
            id: `init_${i}`,
            topic,
            category: 'Core Syllabus',
            isCompleted: false,
            createdAt: new Date(Date.now() - i * 3600 * 1000).toISOString()
          }));
          localStorage.setItem(`cme_learning_topics_${studentId}`, JSON.stringify(localTopics));
        }
        (localTopics || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setLearningTopics(localTopics);
      }
    } catch (err) {
      console.error('Error loading learning topics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTopic = async (topicName?: string) => {
    const finalTopic = (topicName || newTopic).trim();
    if (!finalTopic) return;

    // Check for duplicate
    if (learningTopics.some(item => item.topic.toLowerCase() === finalTopic.toLowerCase())) {
      setError('This topic is already in your tracker checklist!');
      return;
    }

    setError('');
    const newTopicObj: Omit<LearningTopic, 'id'> = {
      topic: finalTopic,
      category: topicName ? 'AI Explored' : category,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    try {
      let savedId = `topic_${Date.now()}`;
      if (profile.id && !profile.id.startsWith('temp_')) {
        const docRef = await addDoc(collection(db, 'learning_topics'), {
          ...newTopicObj,
          studentId: profile.id
        });
        savedId = docRef.id;
      }

      const completeObj: LearningTopic = { id: savedId, ...newTopicObj };
      const updated = [completeObj, ...learningTopics];
      setLearningTopics(updated);
      localStorage.setItem(`cme_learning_topics_${profile.id}`, JSON.stringify(updated));
      
      if (!topicName) {
        setNewTopic('');
      }
    } catch (err) {
      console.error('Error adding learning topic:', err);
    }
  };

  const handleToggleCompleted = async (id: string, currentStatus: boolean) => {
    const updated = learningTopics.map(item => 
      item.id === id ? { ...item, isCompleted: !currentStatus } : item
    );
    setLearningTopics(updated);
    localStorage.setItem(`cme_learning_topics_${profile.id}`, JSON.stringify(updated));

    try {
      if (profile.id && !profile.id.startsWith('temp_') && !id.startsWith('topic_') && !id.startsWith('init_')) {
        await updateDoc(doc(db, 'learning_topics', id), {
          isCompleted: !currentStatus
        });
      }
    } catch (err) {
      console.error('Error updating status in Firestore:', err);
    }
  };

  const handleDeleteTopic = async (id: string) => {
    const updated = learningTopics.filter(item => item.id !== id);
    setLearningTopics(updated);
    localStorage.setItem(`cme_learning_topics_${profile.id}`, JSON.stringify(updated));

    try {
      if (profile.id && !profile.id.startsWith('temp_') && !id.startsWith('topic_') && !id.startsWith('init_')) {
        await deleteDoc(doc(db, 'learning_topics', id));
      }
    } catch (err) {
      console.error('Error deleting topic:', err);
    }
  };

  // Import NCERT curriculum topics that aren't completed
  const handleQuickAddPreset = (topicName: string) => {
    handleAddTopic(topicName);
  };

  const totalTopics = (learningTopics || []).length;
  const completedTopics = (learningTopics || []).filter(t => t && t.isCompleted).length;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  // Find explored topics that are NOT already in the learning topics
  const unaddedExplored = (exploredTopicsList || []).filter(et => 
    et && !(learningTopics || []).some(lt => lt && lt.topic && lt.topic.toLowerCase() === et.toLowerCase())
  );

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 pb-5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 px-3 py-1 rounded-full text-[#061F48]">
            <BookMarked className="h-4 w-4" />
            <span className="text-[10px] font-black uppercase tracking-wider">Concept Mastery Hub</span>
          </div>
          <h2 className="text-xl font-black text-[#061F48] flex items-center gap-2">
            Syllabus & Concept Mastery Tracker
            <Sparkles className="h-5 w-5 text-[#D09515] animate-pulse" />
          </h2>
          <p className="text-xs text-[#061F48]/70 font-semibold max-w-2xl">
            Track custom learning objectives, monitor active self-studies, and check off subjects as you master board syllabus benchmarks.
          </p>
        </div>

        {/* Real-time badge */}
        <div className="bg-[#F8F5ED] border border-[#D09515]/30 px-4 py-2.5 rounded-2xl flex items-center gap-3 shrink-0">
          <div className="h-9 w-9 rounded-xl bg-[#061F48] text-white flex items-center justify-center font-bold">
            <Trophy className="h-5 w-5 text-[#D09515]" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase text-[#061F48]/50 block">Mastery Score</span>
            <span className="text-base font-black text-[#061F48] font-mono">{progressPercent}% Unlocked</span>
          </div>
        </div>
      </div>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#F8F5ED]/60 border border-[#061F48]/5 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
          <div className="h-10 w-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Brain className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#061F48]/50 uppercase tracking-wide block">Concepts Explored</span>
            <span className="text-lg font-black text-[#061F48] font-mono">{exploredCount}</span>
            <span className="text-[8px] text-gray-400 block font-semibold">Active AI deep searches</span>
          </div>
        </div>

        <div className="bg-[#F8F5ED]/60 border border-[#061F48]/5 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#061F48]/50 uppercase tracking-wide block">Flashcard Decks</span>
            <span className="text-lg font-black text-[#061F48] font-mono">{flashcardDeckCount}</span>
            <span className="text-[8px] text-gray-400 block font-semibold">Self-revision modules</span>
          </div>
        </div>

        <div className="bg-[#F8F5ED]/60 border border-[#061F48]/5 p-4 rounded-2xl flex items-center gap-3.5 shadow-inner">
          <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[9px] font-black text-[#061F48]/50 uppercase tracking-wide block">Target Completion</span>
            <span className="text-lg font-black text-[#061F48] font-mono">{completedTopics} <span className="text-xs text-gray-400 font-semibold">of {totalTopics}</span></span>
            <span className="text-[8px] text-gray-400 block font-semibold">Mastered learning targets</span>
          </div>
        </div>
      </div>

      {/* Progress Bar section */}
      <div className="space-y-2 bg-[#F8F5ED] p-5 rounded-3xl border border-[#061F48]/5 relative overflow-hidden">
        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4 text-[#D09515]" />
            <span className="font-black text-[#061F48] uppercase tracking-wide">Target Topic Progression</span>
          </div>
          <span className="font-black text-[#061F48]">{completedTopics} of {totalTopics} Goals Met ({progressPercent}%)</span>
        </div>
        
        <div className="w-full bg-white h-3.5 rounded-full p-0.5 border border-[#061F48]/10 overflow-hidden shadow-inner">
          <motion.div 
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-[#D09515] flex items-center justify-end pr-2"
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            {progressPercent > 15 && (
              <span className="text-[8px] font-black text-white uppercase tracking-widest">{progressPercent}%</span>
            )}
          </motion.div>
        </div>

        {progressPercent === 100 && totalTopics > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 text-xs font-black text-emerald-700 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 mt-2"
          >
            <Sparkles className="h-4.5 w-4.5 text-[#D09515] animate-bounce" />
            <span>Absolute Syllabus Mastery! Outstanding job completing all target objectives. Let's add more!</span>
          </motion.div>
        )}
      </div>

      {/* Action panel: Add new topics / Suggested preset list */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* LEFT PANEL: Form and Presets */}
        <div className="md:col-span-5 space-y-4">
          
          {/* Quick Add Custom Topic */}
          <div className="bg-[#F8F5ED] p-5 rounded-3xl border border-[#061F48]/5 space-y-4">
            <span className="text-[10px] font-black text-[#061F48]/60 uppercase tracking-wider block">Add Custom Target Goal</span>
            
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#061F48]/40 uppercase block">Topic / Concept Name</label>
                <input
                  type="text"
                  placeholder="e.g. Electric Flux, Ledger Accounts..."
                  value={newTopic}
                  onChange={(e) => {
                    setNewTopic(e.target.value);
                    setError('');
                  }}
                  className="w-full bg-white border border-[#061F48]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#061F48]/40 uppercase block">Category / Tag</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#061F48]/10 rounded-xl px-3 py-2 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                >
                  <option value="Core Syllabus">📚 Core Syllabus</option>
                  <option value="AI Explored">🔍 AI Explored</option>
                  <option value="Exam Prep Topic">📝 Exam Prep Topic</option>
                  <option value="Practical Lab/Project">🔬 Practical Lab/Project</option>
                  <option value="Important Formula">📐 Important Formula</option>
                </select>
              </div>

              {error && (
                <p className="text-[10px] font-black text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
                  {error}
                </p>
              )}

              <button
                type="button"
                onClick={() => handleAddTopic()}
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5"
              >
                <PlusCircle className="h-4 w-4" />
                <span>Add Target Goal</span>
              </button>
            </div>
          </div>

          {/* Quick suggestions preset list based on student profiles */}
          <div className="space-y-2">
            <span className="text-[10px] font-black text-[#061F48]/60 uppercase tracking-wider block">Suggested Board Syllabus Goals</span>
            <div className="flex flex-wrap gap-1.5">
              {presets.map((topic, index) => {
                const isAlreadyAdded = learningTopics.some(t => t.topic.toLowerCase() === topic.toLowerCase());
                return (
                  <button
                    key={index}
                    onClick={() => !isAlreadyAdded && handleQuickAddPreset(topic)}
                    disabled={isAlreadyAdded}
                    className={`text-[9.5px] font-bold px-2.5 py-1.5 rounded-lg border transition-all ${isAlreadyAdded ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' : 'bg-white hover:bg-[#F8F5ED] text-[#061F48] border-[#061F48]/10 hover:border-[#D09515]/30'}`}
                  >
                    + {topic}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Explored Concepts Quick Add */}
          {(unaddedExplored || []).length > 0 && (
            <div className="space-y-2 pt-2 border-t border-dashed border-[#061F48]/10">
              <span className="text-[10px] font-black text-amber-600 uppercase tracking-wider block flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
                <span>AI Explored Concepts (Not tracked yet)</span>
              </span>
              <div className="flex flex-wrap gap-1.5">
                {(unaddedExplored || []).slice(0, 4).map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAddPreset(topic)}
                    className="text-[9px] font-bold px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-[#061F48] border border-amber-200 rounded-lg transition-all flex items-center gap-1"
                  >
                    <span>{topic}</span>
                    <ArrowRight className="h-3 w-3 text-amber-500" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT PANEL: Interactive Checklist */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex justify-between items-center border-b border-gray-100 pb-2">
            <span className="text-[10px] font-black text-[#061F48]/60 uppercase tracking-wider block">My Goal Checklist ({totalTopics})</span>
            {totalTopics > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to clear your current tracked goals?')) {
                    setLearningTopics([]);
                    localStorage.setItem(`cme_learning_topics_${profile.id}`, JSON.stringify([]));
                  }
                }}
                className="text-[9px] font-bold text-red-500 hover:underline"
              >
                Clear All Goals
              </button>
            )}
          </div>

          {(learningTopics || []).length === 0 ? (
            <div className="border border-dashed border-gray-200 rounded-3xl p-8 text-center text-gray-400 space-y-2">
              <CheckSquare className="h-8 w-8 mx-auto text-gray-300" />
              <p className="text-xs font-black text-[#061F48]/70">No Active Target Goals Yet</p>
              <p className="text-[10px] text-gray-400 max-w-xs mx-auto leading-relaxed">
                Add target learning goals, import NCERT chapters, or pull from your AI Explored Concepts to track syllabus mastery!
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              <AnimatePresence initial={false}>
                {(learningTopics || []).map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${item.isCompleted ? 'bg-emerald-50/20 border-emerald-200/60 shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-100'}`}
                  >
                    <div 
                      onClick={() => handleToggleCompleted(item.id, item.isCompleted)}
                      className="flex items-start gap-3 cursor-pointer select-none flex-1 min-w-0"
                    >
                      <div className="mt-0.5 text-emerald-600 shrink-0">
                        {item.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 fill-emerald-500 text-white" />
                        ) : (
                          <Square className="h-5 w-5 text-[#061F48]/20 hover:text-[#061F48]/40 transition-colors" />
                        )}
                      </div>
                      
                      <div className="space-y-0.5 min-w-0">
                        <p className={`text-xs font-black leading-snug truncate ${item.isCompleted ? 'text-emerald-800 line-through' : 'text-[#061F48]'}`}>
                          {item.topic}
                        </p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${item.category === 'AI Explored' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                            {item.category}
                          </span>
                          <span className="text-[8px] text-gray-400 font-semibold">
                            Added {new Date(item.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteTopic(item.id)}
                      className="text-red-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                      title="Remove target"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
