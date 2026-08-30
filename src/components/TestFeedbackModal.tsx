import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  MessageSquare, 
  Sparkles, 
  Flag, 
  ThumbsUp, 
  HelpCircle,
  Send,
  Award
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { db, collection, addDoc } from '../lib/firebase';

export interface TestFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  testSubject: string;
  testScore?: { correct: number; total: number };
  studentName?: string;
  studentClass?: string;
  totalQuestions?: number;
  onSubmitted?: () => void;
}

export type IssueCategory = 
  | 'no_issue' 
  | 'typo' 
  | 'incorrect_key' 
  | 'ambiguous' 
  | 'out_of_syllabus' 
  | 'missing_info' 
  | 'other';

const ISSUE_OPTIONS: { id: IssueCategory; label: string; icon: string }[] = [
  { id: 'no_issue', label: 'No Issues - Great Test 👍', icon: '👍' },
  { id: 'typo', label: 'Typo / Spelling Error ✏️', icon: '✏️' },
  { id: 'incorrect_key', label: 'Incorrect Answer Key ❌', icon: '❌' },
  { id: 'ambiguous', label: 'Ambiguous Wording ❓', icon: '❓' },
  { id: 'missing_info', label: 'Missing Diagram/Hint 📄', icon: '📄' },
  { id: 'out_of_syllabus', label: 'Too Hard / Off Syllabus 📚', icon: '📚' },
  { id: 'other', label: 'Other Feedback 💬', icon: '💬' }
];

const RATING_LABELS: Record<number, string> = {
  1: 'Poor / Confusing Questions',
  2: 'Needs Revision & Clarity',
  3: 'Fair / Average Standard',
  4: 'Very Good & Well Structured',
  5: 'Excellent Concept Testing! 🌟'
};

export default function TestFeedbackModal({
  isOpen,
  onClose,
  testSubject,
  testScore,
  studentName = 'Learner',
  studentClass = '10',
  totalQuestions = 3,
  onSubmitted
}: TestFeedbackModalProps) {
  const { addToast } = useToast();

  // Ratings State
  const [overallRating, setOverallRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  
  const [clarityRating, setClarityRating] = useState<number>(4);
  const [relevanceRating, setRelevanceRating] = useState<number>(5);

  // Issue reporting state
  const [selectedIssueCategory, setSelectedIssueCategory] = useState<IssueCategory>('no_issue');
  const [flaggedQuestions, setFlaggedQuestions] = useState<number[]>([]);
  const [comments, setComments] = useState<string>('');

  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen) return null;

  const toggleFlaggedQuestion = (qNum: number) => {
    if (flaggedQuestions.includes(qNum)) {
      setFlaggedQuestions(flaggedQuestions.filter(q => q !== qNum));
    } else {
      setFlaggedQuestions([...flaggedQuestions, qNum]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const feedbackData = {
      studentName,
      studentClass,
      testSubject,
      score: testScore ? `${testScore.correct}/${testScore.total}` : 'N/A',
      overallRating: hoverRating || overallRating,
      clarityRating,
      relevanceRating,
      issueCategory: selectedIssueCategory,
      flaggedQuestions: flaggedQuestions.sort(),
      comments: comments.trim(),
      submittedAt: new Date().toISOString(),
      submittedAtFormatted: new Date().toLocaleString('en-IN')
    };

    // 1. Save to LocalStorage
    try {
      const existingKey = 'cme_test_feedback';
      const raw = localStorage.getItem(existingKey);
      const list = raw ? JSON.parse(raw) : [];
      list.unshift(feedbackData);
      localStorage.setItem(existingKey, JSON.stringify(list));
    } catch (err) {
      console.error('Error saving feedback locally:', err);
    }

    // 2. Save to Firestore (safely wrapped)
    try {
      await addDoc(collection(db, 'test_feedbacks'), feedbackData);
    } catch (err) {
      console.warn('Firestore write failed, fallback to local storage:', err);
    }

    setIsSubmitting(false);
    setIsSubmitted(true);

    addToast({
      title: 'Feedback Submitted! 🎉',
      description: 'Your rating and concept question report have been logged.',
      type: 'success'
    });

    if (onSubmitted) {
      onSubmitted();
    }

    // Auto close after 2.5 seconds
    setTimeout(() => {
      handleClose();
    }, 2200);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setComments('');
    setSelectedIssueCategory('no_issue');
    setFlaggedQuestions([]);
    onClose();
  };

  const activeRating = hoverRating || overallRating;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 15 }}
          className="bg-white rounded-[2rem] border border-[#061F48]/15 shadow-2xl w-full max-w-lg overflow-hidden text-[#061F48] my-8 relative"
        >
          {/* Top Header Decor Header */}
          <div className="bg-[#061F48] text-white p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 pointer-events-none opacity-10 translate-x-6 -translate-y-6">
              <Sparkles className="w-48 h-48" />
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close feedback modal"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-1.5 relative z-10">
              <div className="inline-flex items-center space-x-1.5 bg-[#D09515]/25 text-[#D09515] border border-[#D09515]/30 px-3 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                <Award className="w-3.5 h-3.5" />
                <span>Concept Test Review</span>
              </div>
              <h3 className="text-xl font-black tracking-tight text-white">Rate Questions & Report Issues</h3>
              <p className="text-xs text-white/70 font-semibold leading-relaxed">
                Subject: <strong className="text-white">{testSubject}</strong> (Class {studentClass}th)
                {testScore && (
                  <span> • Score: <strong className="text-[#D09515]">{testScore.correct}/{testScore.total}</strong></span>
                )}
              </p>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto scrollbar-none">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8 space-y-4"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border-2 border-emerald-300">
                  <CheckCircle className="w-10 h-10 animate-bounce" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-lg font-black text-[#061F48]">Thank You for Your Feedback!</h4>
                  <p className="text-xs text-[#061F48]/70 font-semibold max-w-sm mx-auto">
                    Your evaluation helps our subject mentors continuously refine the test bank and fix any question errors.
                  </p>
                </div>
                <div className="inline-block bg-[#F8F5ED] border border-[#D09515]/20 px-4 py-2 rounded-xl text-[11px] font-black text-[#D09515] uppercase tracking-wider">
                  Review Logged Successfully
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. OVERALL STAR RATING */}
                <div className="space-y-2 text-center bg-[#F8F5ED] p-4 rounded-2xl border border-[#061F48]/10">
                  <label className="text-xs font-black uppercase tracking-wider text-[#061F48] block">
                    How would you rate these questions?
                  </label>
                  
                  {/* Stars */}
                  <div className="flex items-center justify-center gap-2 py-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setOverallRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(null)}
                        className="p-1 text-2xl transition-transform hover:scale-125 focus:outline-none"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            star <= activeRating
                              ? 'text-[#D09515] fill-[#D09515]'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  <p className="text-[11px] font-bold text-[#061F48] h-4">
                    {RATING_LABELS[activeRating]}
                  </p>
                </div>

                {/* 2. SECONDARY RATINGS (Clarity & Relevance) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1.5 bg-[#F8F5ED] p-3 rounded-xl border border-[#061F48]/5">
                    <span className="font-black text-[10px] uppercase tracking-wider text-[#061F48]/80 block">
                      Question Clarity
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#061F48]/60">Confusing</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setClarityRating(num)}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                              clarityRating === num
                                ? 'bg-[#061F48] text-white shadow-sm'
                                : 'bg-white text-[#061F48]/60 border border-[#061F48]/10 hover:bg-[#061F48]/5'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-[#061F48]/60">Clear</span>
                    </div>
                  </div>

                  <div className="space-y-1.5 bg-[#F8F5ED] p-3 rounded-xl border border-[#061F48]/5">
                    <span className="font-black text-[10px] uppercase tracking-wider text-[#061F48]/80 block">
                      Syllabus Relevance
                    </span>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-semibold text-[#061F48]/60">Off</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((num) => (
                          <button
                            key={num}
                            type="button"
                            onClick={() => setRelevanceRating(num)}
                            className={`w-6 h-6 rounded-md text-[10px] font-bold transition-all ${
                              relevanceRating === num
                                ? 'bg-[#061F48] text-white shadow-sm'
                                : 'bg-white text-[#061F48]/60 border border-[#061F48]/10 hover:bg-[#061F48]/5'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                      <span className="text-[10px] font-semibold text-[#061F48]/60">Exact</span>
                    </div>
                  </div>
                </div>

                {/* 3. REPORT AN ISSUE / CATEGORY */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black uppercase tracking-wider text-[#061F48] flex items-center gap-1.5">
                      <Flag className="w-3.5 h-3.5 text-[#D09515]" />
                      <span>Report Question Issue / Category</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                    {ISSUE_OPTIONS.map((opt) => {
                      const isSelected = selectedIssueCategory === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setSelectedIssueCategory(opt.id)}
                          className={`p-2.5 rounded-xl border text-left text-xs font-bold transition-all flex items-center gap-2 ${
                            isSelected
                              ? 'bg-[#061F48] text-white border-[#061F48] shadow-md scale-[1.01]'
                              : 'bg-[#F8F5ED] text-[#061F48]/80 border-[#061F48]/10 hover:border-[#061F48]/20'
                          }`}
                        >
                          <span className="text-sm shrink-0">{opt.icon}</span>
                          <span className="leading-tight text-[10.5px]">{opt.label.split(' ')[0]} {opt.label.split(' ').slice(1).join(' ')}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. FLAGGED QUESTION NUMBERS (If there's an issue) */}
                {selectedIssueCategory !== 'no_issue' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="space-y-2 bg-amber-50/60 p-3.5 rounded-2xl border border-amber-200"
                  >
                    <label className="text-[11px] font-black uppercase tracking-wider text-amber-900 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      <span>Which Question Number(s) had issues?</span>
                    </label>
                    <div className="flex flex-wrap gap-2 pt-1">
                      {Array.from({ length: totalQuestions }, (_, i) => i + 1).map((qNum) => {
                        const isFlagged = flaggedQuestions.includes(qNum);
                        return (
                          <button
                            key={qNum}
                            type="button"
                            onClick={() => toggleFlaggedQuestion(qNum)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all border ${
                              isFlagged
                                ? 'bg-amber-600 text-white border-amber-700 shadow-sm'
                                : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-100'
                            }`}
                          >
                            Q{qNum} {isFlagged ? '🚩' : ''}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 5. DETAILED COMMENTS TEXTAREA */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black uppercase tracking-wider text-[#061F48] flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-[#D09515]" />
                      <span>Comments or Suggestions</span>
                    </span>
                    <span className="text-[9.5px] text-[#061F48]/50 font-normal">Optional</span>
                  </label>
                  <textarea
                    rows={3}
                    value={comments}
                    onChange={(e) => setComments(e.target.value)}
                    placeholder="Describe any typos, clarify wording issues, or share general feedback on question difficulty..."
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 rounded-xl p-3 text-xs font-medium text-[#061F48] placeholder-[#061F48]/40 focus:outline-none focus:ring-2 focus:ring-[#061F48] transition-all resize-none"
                  />
                </div>

                {/* SUBMIT BUTTON */}
                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-[#061F48]/70 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-[2] bg-[#061F48] hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 group"
                  >
                    {isSubmitting ? (
                      <span>Saving Feedback...</span>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
}
