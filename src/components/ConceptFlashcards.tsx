import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Brain, 
  Lightbulb, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  RotateCcw, 
  BookOpen, 
  Trash2, 
  HelpCircle, 
  Trophy, 
  Check, 
  Layers, 
  Loader2,
  XCircle,
  Plus
} from 'lucide-react';
import { db, collection, addDoc, getDocs, query, where, deleteDoc, doc, updateDoc } from '../lib/firebase';

interface Flashcard {
  front: string;
  back: string;
  category: string;
  hint: string;
}

interface FlashcardDeck {
  id?: string;
  topic: string;
  subject: string;
  cards: Flashcard[];
  masteredCardIndexes: number[];
  createdAt: string;
}

interface ConceptExplanation {
  topic: string;
  subject: string;
}

interface ConceptFlashcardsProps {
  profile: {
    id: string;
    name: string;
    studentClass: string;
    stream?: string;
  };
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  'Definition': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Core Formula': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Process & Mechanism': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  'Real-world Application': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Common Exam Trap': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

export default function ConceptFlashcards({ profile }: ConceptFlashcardsProps) {
  // Available searched topics list
  const [searchedTopics, setSearchedTopics] = useState<ConceptExplanation[]>([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  
  // Flashcard Decks History
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  
  // Loading & Error States
  const [loading, setLoading] = useState(false);
  const [loadingDecks, setLoadingDecks] = useState(false);
  const [error, setError] = useState('');

  // Active Interactive Card State
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  // Suggested Topics if no history is found
  const isCommerce = profile.stream === 'Commerce';
  const suggestedStarterTopics = isCommerce
    ? ['Double Entry Bookkeeping', 'Price Elasticity', 'Partnership Deed Accounts']
    : ['Nernst Equation', 'Capacitance & Parallel Plates', 'Reflection & Refraction of Light', 'Quadratic Equations'];

  // Fetch searched topics & saved decks on mount
  useEffect(() => {
    fetchSearchedTopics();
    fetchSavedDecks();
  }, [profile.id]);

  const fetchSearchedTopics = async () => {
    try {
      let topics: ConceptExplanation[] = [];
      
      // Load from localStorage
      const savedLocal = localStorage.getItem(`cme_explanations_${profile.id}`);
      if (savedLocal) {
        topics = JSON.parse(savedLocal);
      }

      // Load from Firestore
      if (profile.id && !profile.id.startsWith('temp_')) {
        const q = query(
          collection(db, 'concept_explanations'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((docSnap) => {
          const data = docSnap.data();
          if (!topics.some(t => t.topic.toLowerCase() === data.topic.toLowerCase())) {
            topics.push({ topic: data.topic, subject: data.subject });
          }
        });
      }

      setSearchedTopics(topics);
      if ((topics || []).length > 0) {
        setSelectedTopic(topics[0].topic);
      } else if ((suggestedStarterTopics || []).length > 0) {
        setSelectedTopic(suggestedStarterTopics[0]);
      }
    } catch (err) {
      console.error('Error fetching searched topics:', err);
    }
  };

  const fetchSavedDecks = async () => {
    setLoadingDecks(true);
    try {
      const savedLocal = localStorage.getItem(`cme_flashcard_decks_${profile.id}`);
      let localDecks: FlashcardDeck[] = savedLocal ? JSON.parse(savedLocal) : [];

      if (profile.id && !profile.id.startsWith('temp_')) {
        const q = query(
          collection(db, 'flashcard_decks'),
          where('studentId', '==', profile.id)
        );
        const querySnapshot = await getDocs(q);
        const fbDecks: FlashcardDeck[] = [];
        querySnapshot.forEach((docSnap) => {
          fbDecks.push({ id: docSnap.id, ...docSnap.data() } as FlashcardDeck);
        });

        const combined = [...fbDecks];
        (localDecks || []).forEach(ld => {
          if (!combined.some(cd => cd.topic.toLowerCase() === ld.topic.toLowerCase())) {
            combined.push(ld);
          }
        });

        combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDecks(combined);
        if ((combined || []).length > 0) {
          setActiveDeck(combined[0]);
        }
      } else {
        (localDecks || []).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setDecks(localDecks);
        if ((localDecks || []).length > 0) {
          setActiveDeck(localDecks[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching saved decks:', err);
    } finally {
      setLoadingDecks(false);
    }
  };

  const handleGenerateDeck = async (topicToGenerate?: string) => {
    const topicName = topicToGenerate || (selectedTopic === 'custom' ? customTopic : selectedTopic);
    if (!topicName || !topicName.trim()) {
      setError('Please select or specify a topic.');
      return;
    }

    setError('');
    setLoading(true);
    setIsFlipped(false);
    setShowHint(false);
    setCurrentCardIndex(0);

    // Try to find if we already have this deck saved
    const existingDeck = decks.find(d => d.topic.toLowerCase() === topicName.toLowerCase());
    if (existingDeck) {
      setActiveDeck(existingDeck);
      setLoading(false);
      return;
    }

    // Determine subject
    let matchedSubject = 'Science';
    const searchedObj = searchedTopics.find(t => t.topic.toLowerCase() === topicName.toLowerCase());
    if (searchedObj) {
      matchedSubject = searchedObj.subject;
    } else if (topicName.includes('Bookkeeping') || topicName.includes('Accounts')) {
      matchedSubject = 'Accountancy';
    } else if (topicName.includes('Elasticity')) {
      matchedSubject = 'Economics';
    } else if (topicName.includes('Equation') || topicName.includes('Quadratic')) {
      matchedSubject = 'Mathematics';
    } else if (topicName.includes('Nernst') || topicName.includes('Capacitance')) {
      matchedSubject = 'Physics';
    }

    try {
      const response = await fetch('/api/generate-flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: topicName,
          subject: matchedSubject,
          studentClass: profile.studentClass
        })
      });

      if (!response.ok) {
        throw new Error('Server returned error status');
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(data.error);
      }

      const newDeck: FlashcardDeck = {
        topic: topicName,
        subject: matchedSubject,
        cards: data.cards || [],
        masteredCardIndexes: [],
        createdAt: new Date().toISOString()
      };

      // Save deck
      let savedId = '';
      if (profile.id && !profile.id.startsWith('temp_')) {
        const docRef = await addDoc(collection(db, 'flashcard_decks'), {
          ...newDeck,
          studentId: profile.id
        });
        savedId = docRef.id;
      }

      const updatedDeck = { ...newDeck, id: savedId || `deck_${Date.now()}` };
      const updatedDecks = [updatedDeck, ...decks];
      setDecks(updatedDecks);
      localStorage.setItem(`cme_flashcard_decks_${profile.id}`, JSON.stringify(updatedDecks));
      
      setActiveDeck(updatedDeck);
    } catch (err: any) {
      console.error('Error generating flashcards:', err);
      setError(err.message || 'Failed to generate flashcards deck. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleMastery = async () => {
    if (!activeDeck) return;

    const isMastered = activeDeck.masteredCardIndexes.includes(currentCardIndex);
    let updatedIndexes: number[];

    if (isMastered) {
      updatedIndexes = activeDeck.masteredCardIndexes.filter(i => i !== currentCardIndex);
    } else {
      updatedIndexes = [...activeDeck.masteredCardIndexes, currentCardIndex];
    }

    const updatedDeck = { ...activeDeck, masteredCardIndexes: updatedIndexes };
    
    // Update active deck state
    setActiveDeck(updatedDeck);

    // Update in history state
    const updatedDecks = decks.map(d => d.topic.toLowerCase() === activeDeck.topic.toLowerCase() ? updatedDeck : d);
    setDecks(updatedDecks);
    localStorage.setItem(`cme_flashcard_decks_${profile.id}`, JSON.stringify(updatedDecks));

    // Update in Firestore
    try {
      if (profile.id && !profile.id.startsWith('temp_') && activeDeck.id && !activeDeck.id.startsWith('deck_')) {
        await updateDoc(doc(db, 'flashcard_decks', activeDeck.id), {
          masteredCardIndexes: updatedIndexes
        });
      }
    } catch (err) {
      console.error('Error updating mastery in Firestore:', err);
    }
  };

  const handleResetDeck = async () => {
    if (!activeDeck) return;

    const updatedDeck = { ...activeDeck, masteredCardIndexes: [] };
    setActiveDeck(updatedDeck);

    const updatedDecks = decks.map(d => d.topic.toLowerCase() === activeDeck.topic.toLowerCase() ? updatedDeck : d);
    setDecks(updatedDecks);
    localStorage.setItem(`cme_flashcard_decks_${profile.id}`, JSON.stringify(updatedDecks));

    try {
      if (profile.id && !profile.id.startsWith('temp_') && activeDeck.id && !activeDeck.id.startsWith('deck_')) {
        await updateDoc(doc(db, 'flashcard_decks', activeDeck.id), {
          masteredCardIndexes: []
        });
      }
    } catch (err) {
      console.error('Error resetting deck in Firestore:', err);
    }
    
    setCurrentCardIndex(0);
    setIsFlipped(false);
    setShowHint(false);
  };

  const handleDeleteDeck = async (deckId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      if (profile.id && !profile.id.startsWith('temp_') && !deckId.startsWith('deck_')) {
        await deleteDoc(doc(db, 'flashcard_decks', deckId));
      }
      const updatedDecks = decks.filter(d => d.id !== deckId);
      setDecks(updatedDecks);
      localStorage.setItem(`cme_flashcard_decks_${profile.id}`, JSON.stringify(updatedDecks));

      if (activeDeck && activeDeck.id === deckId) {
        setActiveDeck((updatedDecks || []).length > 0 ? updatedDecks[0] : null);
        setCurrentCardIndex(0);
        setIsFlipped(false);
        setShowHint(false);
      }
    } catch (err) {
      console.error('Error deleting deck:', err);
    }
  };

  // Pre-calculated variables
  const activeDeckCards = activeDeck?.cards || [];
  const activeCard = (activeDeckCards || [])[currentCardIndex] || (activeDeckCards || [])[0];
  const masteredList = activeDeck?.masteredCardIndexes || [];
  const masteredCount = (masteredList || []).length;
  const isDeckFullyMastered = (activeDeckCards || []).length > 0 && masteredCount === (activeDeckCards || []).length;
  const activeCardIsMastered = (masteredList || []).includes(currentCardIndex);

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Self-contained CSS for seamless 3D Card Flip */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
          -webkit-backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>

      {/* HEADER SECTION */}
      <div className="border-b border-gray-100 pb-5 space-y-1">
        <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 px-3 py-1 rounded-full text-[#061F48]">
          <Layers className="h-4 w-4" />
          <span className="text-[10px] font-black uppercase tracking-wider font-sans">Active Retrieval Study</span>
        </div>
        <h2 className="text-xl font-black text-[#061F48] flex items-center gap-2">
          AI Active Recall Flashcards
          <Sparkles className="h-5 w-5 text-[#D09515] animate-pulse" />
        </h2>
        <p className="text-xs text-[#061F48]/70 font-semibold max-w-2xl">
          Instantly convert any topic you explained or study into interactive flashcards. Studies show active recall and spaced repetition improve long-term memory retrieval by up to 150%.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Deck Control & Generator */}
        <div className="lg:col-span-4 space-y-5">
          
          {/* Deck Builder Panel */}
          <div className="bg-[#F8F5ED] border border-[#061F48]/5 p-5 rounded-3xl space-y-4">
            <h3 className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span>Create New Study Deck</span>
            </h3>

            <div className="space-y-3">
              {/* Selector */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#061F48]/50 uppercase tracking-wide block">Select Source Topic</label>
                <select
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full bg-white border border-[#061F48]/10 rounded-xl px-3 py-2.5 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515] cursor-pointer"
                >
                  {searchedTopics.map((item, idx) => (
                    <option key={idx} value={item.topic}>
                      🔍 {item.topic} ({item.subject})
                    </option>
                  ))}
                  
                  {/* Default Suggested Options if Topic History is empty */}
                  {(searchedTopics || []).length === 0 && (suggestedStarterTopics || []).map((topic, idx) => (
                    <option key={`starter-${idx}`} value={topic}>
                      ✨ Starter: {topic}
                    </option>
                  ))}
                  
                  <option value="custom">✍️ Type Custom Topic...</option>
                </select>
              </div>

              {/* Custom input */}
              {selectedTopic === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-1"
                >
                  <label className="text-[9px] font-black text-[#061F48]/50 uppercase tracking-wide block">Custom Topic Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Electric Dipole, Circular Flow of Income"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/10 rounded-xl px-3 py-2.5 text-xs font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </motion.div>
              )}

              {error && (
                <div className="text-[11px] font-bold text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                disabled={loading}
                onClick={() => handleGenerateDeck()}
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white font-black py-2.5 rounded-xl text-[11px] uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-1.5"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Synthesizing Flashcards...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Generate AI Deck</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Decks Library List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
                <BookOpen className="h-4 w-4 text-[#D09515]" />
                <span>My Saved Decks</span>
              </h3>
              <span className="text-[9px] bg-[#F8F5ED] px-2 py-0.5 rounded text-gray-400 font-bold border border-gray-100">
                {(decks || []).length} Decks
              </span>
            </div>

            {loadingDecks ? (
              <div className="flex items-center justify-center py-6 text-[#061F48]/40">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span className="text-xs font-bold">Retrieving library...</span>
              </div>
            ) : (decks || []).length === 0 ? (
              <div className="border border-dashed border-gray-200 rounded-2xl p-6 text-center text-gray-400 space-y-2">
                <Layers className="h-6 w-6 mx-auto text-gray-300" />
                <p className="text-[10.5px] font-bold">No active flashcard decks yet.</p>
                <p className="text-[9.5px] text-gray-400">Generate your first deck above based on your Explainer history!</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {(decks || []).map((deck, idx) => {
                  const isActive = activeDeck?.topic === deck.topic;
                  const total = (deck?.cards || []).length;
                  const mastered = (deck?.masteredCardIndexes || []).length;
                  const pct = total > 0 ? Math.round((mastered / total) * 100) : 0;
                  
                  return (
                    <div
                      key={deck.id || idx}
                      onClick={() => {
                        setActiveDeck(deck);
                        setCurrentCardIndex(0);
                        setIsFlipped(false);
                        setShowHint(false);
                      }}
                      className={`p-3 rounded-2xl cursor-pointer border transition-all flex items-center justify-between gap-3 ${isActive ? 'bg-[#F8F5ED] border-[#D09515]/30 shadow-sm' : 'bg-white hover:bg-gray-50 border-gray-100'}`}
                    >
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] bg-[#061F48]/5 text-[#061F48] px-1.5 py-0.5 rounded font-black uppercase">
                            {deck.subject}
                          </span>
                          <span className="text-[8px] text-gray-400 font-bold">
                            {(deck?.cards || []).length} cards
                          </span>
                        </div>
                        <h4 className="text-xs font-black text-[#061F48] truncate">
                          {deck.topic}
                        </h4>
                        
                        {/* Progress bar */}
                        <div className="flex items-center gap-2">
                          <div className="w-16 bg-gray-200 h-1 rounded-full overflow-hidden">
                            <div className="bg-emerald-500 h-full transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[8px] text-gray-400 font-semibold">{pct}% Mastered</span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteDeck(deck.id || '', e)}
                        className="text-red-300 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors shrink-0"
                        title="Delete deck"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* RIGHT COLUMN: Interactive Card Sandbox */}
        <div className="lg:col-span-8 flex flex-col justify-between min-h-[420px] bg-[#F8F5ED]/40 rounded-3xl p-5 border border-[#061F48]/5">
          {activeDeck && activeCard ? (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              
              {/* TOP STATUS bar */}
              <div className="flex justify-between items-center text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] font-black text-[#061F48] uppercase tracking-wide block">Active deck</span>
                  <h4 className="font-black text-[#061F48] text-sm leading-none flex items-center gap-1.5">
                    {activeDeck.topic}
                    {isDeckFullyMastered && (
                      <Trophy className="h-4 w-4 text-[#D09515] shrink-0 animate-bounce" />
                    )}
                  </h4>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-semibold block">Mastery Progress</span>
                  <span className="font-bold text-[#061F48] text-xs">
                    🏆 {masteredCount} of {(activeDeckCards || []).length} Cards Mastered
                  </span>
                </div>
              </div>

              {/* INTERACTIVE 3D FLIP CARD */}
              <div className="perspective-1000 w-full max-w-md mx-auto aspect-[16/10] my-2 select-none">
                <div 
                  onClick={() => {
                    setIsFlipped(!isFlipped);
                    setShowHint(false);
                  }}
                  className={`preserve-3d w-full h-full relative duration-500 cursor-pointer rounded-3xl shadow-md border ${isFlipped ? 'rotate-y-180 bg-[#F8F5ED]' : 'bg-white'} border-[#061F48]/10 hover:shadow-lg transition-shadow`}
                >
                  {/* FRONT SIDE */}
                  <div className={`backface-hidden w-full h-full absolute inset-0 flex flex-col justify-between p-6 ${isFlipped ? 'pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${CATEGORY_COLORS[activeCard.category]?.bg || 'bg-gray-50'} ${CATEGORY_COLORS[activeCard.category]?.text || 'text-gray-700'} ${CATEGORY_COLORS[activeCard.category]?.border || 'border-gray-200'}`}>
                        {activeCard.category}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        Card {currentCardIndex + 1}/{(activeDeckCards || []).length}
                      </span>
                    </div>

                    <div className="text-center py-4 px-2 space-y-2">
                      <h3 className="text-sm md:text-base font-black text-[#061F48] leading-snug">
                        {activeCard.front}
                      </h3>
                      
                      <AnimatePresence>
                        {showHint && (
                          <motion.p
                            initial={{ opacity: 0, y: 5 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 5 }}
                            className="text-[11px] text-[#D09515] font-bold italic"
                          >
                            💡 Hint: {activeCard.hint}
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowHint(!showHint);
                        }}
                        className="text-[10px] text-[#061F48]/60 hover:text-[#061F48] font-bold flex items-center gap-1 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100 transition-colors"
                      >
                        <HelpCircle className="h-3.5 w-3.5 text-[#D09515]" />
                        <span>{showHint ? 'Hide Hint' : 'Need Study Hint?'}</span>
                      </button>

                      <span className="text-[9px] text-[#061F48]/40 font-black uppercase tracking-wider animate-pulse">
                        Click card to flip
                      </span>
                    </div>
                  </div>

                  {/* BACK SIDE */}
                  <div className={`backface-hidden rotate-y-180 w-full h-full absolute inset-0 flex flex-col justify-between p-6 ${!isFlipped ? 'pointer-events-none' : ''}`}>
                    <div className="flex justify-between items-start">
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border bg-emerald-50 text-emerald-800 border-emerald-200`}>
                        EXPLANATION ANSWER
                      </span>
                      {activeCardIsMastered && (
                        <div className="flex items-center gap-1 text-xs text-emerald-600 font-bold">
                          <CheckCircle2 className="h-4 w-4 shrink-0 fill-emerald-500 text-white" />
                          <span>Mastered</span>
                        </div>
                      )}
                    </div>

                    <div className="text-center py-4 px-2">
                      <p className="text-xs md:text-sm font-semibold text-[#061F48] leading-relaxed">
                        {activeCard.back}
                      </p>
                    </div>

                    <div className="flex justify-between items-center">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleMastery();
                        }}
                        className={`text-[10px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 shadow-sm ${activeCardIsMastered ? 'bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600' : 'bg-white text-emerald-600 border-emerald-200 hover:bg-emerald-50'}`}
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>{activeCardIsMastered ? 'Mastered!' : 'Mark as Mastered'}</span>
                      </button>

                      <span className="text-[9px] text-[#061F48]/40 font-black uppercase tracking-wider">
                        Click card to flip
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* PROGRESS BAR */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-gray-400 font-bold">
                  <span>Progress in Deck</span>
                  <span>{Math.round(((currentCardIndex + 1) / Math.max(1, (activeDeckCards || []).length)) * 100)}% viewed</span>
                </div>
                <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-[#061F48] h-full transition-all" style={{ width: `${((currentCardIndex + 1) / Math.max(1, (activeDeckCards || []).length)) * 100}%` }} />
                </div>
              </div>

              {/* BOTTOM NAVIGATION CONTROLS */}
              <div className="flex justify-between items-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIndex(prev => Math.max(0, prev - 1));
                    setIsFlipped(false);
                    setShowHint(false);
                  }}
                  disabled={currentCardIndex === 0}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#061F48]/20 disabled:opacity-40 hover:bg-white text-xs font-black text-[#061F48] transition-all disabled:pointer-events-none"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleResetDeck}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
                  title="Reset Deck progress"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Deck</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCurrentCardIndex(prev => Math.min((activeDeckCards || []).length - 1, prev + 1));
                    setIsFlipped(false);
                    setShowHint(false);
                  }}
                  disabled={currentCardIndex === (activeDeckCards || []).length - 1}
                  className="flex items-center gap-1 px-3.5 py-2 rounded-xl border border-gray-200 hover:border-[#061F48]/20 disabled:opacity-40 hover:bg-white text-xs font-black text-[#061F48] transition-all disabled:pointer-events-none"
                >
                  <span>Next</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col justify-center items-center text-center p-8 space-y-4">
              <div className="bg-[#061F48]/5 p-4 rounded-full">
                <Layers className="h-8 w-8 text-[#061F48]/50 animate-pulse" />
              </div>
              <div className="space-y-1.5 max-w-sm">
                <h4 className="text-sm font-black text-[#061F48]">Start Active Recall Retrieval!</h4>
                <p className="text-xs text-gray-500 font-semibold leading-relaxed">
                  Choose a syllabus topic from the builder on the left to synthesize interactive flashcards. Test yourself on questions, formulations, and exam traps!
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
