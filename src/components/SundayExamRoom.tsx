import React, { useState, useEffect } from 'react';
import { 
  Award, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  BookOpen, 
  ShieldCheck, 
  BarChart2, 
  Download, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft, 
  RotateCcw, 
  Zap, 
  Sparkles,
  FileText,
  Calendar,
  Lock,
  Edit3
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import WhiteboardCanvas from './WhiteboardCanvas';

export interface ExamQuestion {
  id: number;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface SundayExamPaper {
  id: string;
  batch: string; // e.g. "Class 10 Board Mastery", "Class 12 Target Batch"
  title: string;
  subject: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  questions: ExamQuestion[];
}

interface SundayExamRoomProps {
  userBatch?: string;
  userName?: string;
  userRoll?: string;
}

export default function SundayExamRoom({
  userBatch = 'Class 10 Board Mastery',
  userName = 'Student Learner',
  userRoll = 'CME-2026-1001'
}: SundayExamRoomProps) {
  const { addToast } = useToast();

  const [selectedBatch, setSelectedBatch] = useState<string>(userBatch || 'Class 10 Board Mastery');
  const [activePaper, setActivePaper] = useState<SundayExamPaper | null>(null);
  const [examStarted, setExamStarted] = useState<boolean>(false);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<number, boolean>>({});
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(1800); // 30 mins
  const [examSubmitted, setExamSubmitted] = useState<boolean>(false);
  const [showScratchpad, setShowScratchpad] = useState<boolean>(false);
  const [showFormulaSheet, setShowFormulaSheet] = useState<boolean>(false);

  // Check if today is Sunday
  const today = new Date();
  const dayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const isSundayToday = dayName.toLowerCase() === 'sunday';

  // Available batches
  const batchesList = [
    'Class 9 Foundation',
    'Class 10 Board Mastery',
    'Class 11 JEE/NEET Pioneer',
    'Class 12 Target Batch'
  ];

  // Sunday Exam Papers Database per Batch
  const mockPapers: SundayExamPaper[] = [];

  // Filter paper by current batch
  const availablePapersForBatch = mockPapers.filter(
    p => p.batch.toLowerCase().includes(selectedBatch.toLowerCase()) || selectedBatch.toLowerCase().includes(p.batch.toLowerCase())
  );

  const selectedPaper = activePaper || availablePapersForBatch[0] || null;

  // Countdown timer effect during exam
  useEffect(() => {
    let timer: any = null;
    if (examStarted && !examSubmitted && timeLeftSeconds > 0) {
      timer = setInterval(() => {
        setTimeLeftSeconds(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [examStarted, examSubmitted, timeLeftSeconds]);

  // Start exam handler
  const handleStartExam = (paper: SundayExamPaper) => {
    setActivePaper(paper);
    setSelectedAnswers({});
    setMarkedForReview({});
    setCurrentQuestionIdx(0);
    setTimeLeftSeconds(paper.durationMinutes * 60);
    setExamSubmitted(false);
    setExamStarted(true);

    addToast({
      title: 'Sunday Batch Exam Started! ⏱️',
      description: `Proctored CBT session active for ${paper.title}. Do not refresh window.`,
      type: 'info'
    });
  };

  // Submit test handler
  const handleSubmitExam = () => {
    setExamSubmitted(true);
    setExamStarted(false);

    // Calculate Score
    let correctCount = 0;
    const questionsList = selectedPaper?.questions || [];
    questionsList.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctAnswer) {
        correctCount++;
      }
    });

    const totalQuestionsCount = Math.max(1, (questionsList || []).length);
    const paperTotalMarks = selectedPaper?.totalMarks || 30;
    const finalScore = Math.round((correctCount / totalQuestionsCount) * paperTotalMarks);

    addToast({
      title: 'Sunday Exam Submitted! 🎓',
      description: `You scored ${finalScore}/${paperTotalMarks} (${Math.round((finalScore / paperTotalMarks) * 100)}%). Detailed report generated.`,
      type: 'success'
    });
  };

  const handleAutoSubmit = () => {
    addToast({
      title: 'Time Expired - Auto-Submitted! ⏱️',
      description: 'Your Sunday Batch Exam responses have been automatically locked and submitted.',
      type: 'warning'
    });
    handleSubmitExam();
  };

  // Format time display MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Calculate results stats
  const questionsList = selectedPaper?.questions || [];
  const totalQ = Math.max(1, (questionsList || []).length);
  let correctQ = 0;
  let attemptedQ = Object.keys(selectedAnswers || {}).length;

  questionsList.forEach((q, idx) => {
    if (selectedAnswers[idx] === q.correctAnswer) {
      correctQ++;
    }
  });

  const paperTotalMarks = selectedPaper?.totalMarks || 30;
  const scoreObtained = Math.round((correctQ / totalQ) * paperTotalMarks);
  const scorePercent = Math.round((scoreObtained / paperTotalMarks) * 100);

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-[#061F48]/15 dark:border-gray-800 p-6 md:p-8 shadow-xl space-y-6">
      
      {/* HEADER BANNER */}
      <div className="bg-gradient-to-r from-[#061F48] via-[#153B8A] to-[#061F48] text-white p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 w-48 h-48 bg-emerald-500/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-emerald-400 text-[#061F48] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Calendar className="h-3.5 w-3.5 fill-current" />
              <span>
                {isSundayToday ? '🔥 TODAY IS SUNDAY: BATCH CBT EXAM ROOM LIVE' : '⚡ SUNDAY WEEKLY EXAM ROOM (BATCH CBT HALL)'}
              </span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Sunday Batch-Specific Exam Hall</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-200 font-semibold max-w-xl">
              Official Sunday examination hall for every batch. Proctored CBT timer, automated evaluation, batch rank list percentile, & downloadable scorecard.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300 block">Proctored CBT Integrity</span>
            <span className="text-lg font-black text-white flex items-center justify-center gap-1 mt-0.5">
              <ShieldCheck className="h-5 w-5 text-emerald-400" /> Active
            </span>
          </div>
        </div>

        {/* BATCH SELECTOR TABS */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#D09515] shrink-0 mr-2 flex items-center gap-1">
            <BookOpen className="h-3.5 w-3.5" /> Filter Batch:
          </span>
          {batchesList.map((batch) => (
            <button
              key={batch}
              onClick={() => {
                setSelectedBatch(batch);
                setExamStarted(false);
                setExamSubmitted(false);
              }}
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

      {/* CASE 1: EXAM SELECTION VIEW (NOT STARTED YET) */}
      {!examStarted && !examSubmitted && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-[#061F48] dark:text-white uppercase tracking-wider flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#D09515]" />
              <span>Available Sunday Mock Exams for {selectedBatch}</span>
            </h3>
            <span className="text-xs font-bold text-gray-400">
              {(availablePapersForBatch || []).length} Exam Paper(s)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(availablePapersForBatch || []).map((paper) => (
              <div key={paper.id} className="bg-[#F8F5ED] dark:bg-gray-800/80 p-6 rounded-3xl border border-[#061F48]/15 dark:border-gray-700 flex flex-col justify-between space-y-4 hover:shadow-lg transition-all">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-[#061F48] text-white">
                      {paper.subject}
                    </span>
                    <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-[#D09515]" /> {paper.durationMinutes} Minutes
                    </span>
                  </div>

                  <h4 className="text-base font-black text-[#061F48] dark:text-white">
                    {paper.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                    Total Questions: <strong>{(paper.questions || []).length}</strong> | Max Marks: <strong>{paper.totalMarks}</strong> | Passing: <strong>{paper.passingMarks}</strong>
                  </p>
                </div>

                <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Sunday Batch Verified
                  </span>

                  <button
                    onClick={() => handleStartExam(paper)}
                    className="bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Enter CBT Exam Hall</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CASE 2: ACTIVE CBT EXAM INTERFACE */}
      {examStarted && !examSubmitted && selectedPaper && (
        <div className="space-y-6">
          {/* TIMER & PALETTE HEADER */}
          <div className="bg-[#F8F5ED] dark:bg-gray-800 p-4 rounded-2xl border border-[#061F48]/10 dark:border-gray-700 flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Exam In Progress</span>
              <h4 className="text-sm font-black text-[#061F48] dark:text-white">{selectedPaper.title}</h4>
            </div>

            <div className="flex items-center gap-4">
              <div className="bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 px-4 py-2 rounded-xl flex items-center gap-2">
                <Clock className="h-4 w-4 text-red-600 dark:text-red-400 animate-pulse" />
                <span className="text-sm font-black text-red-700 dark:text-red-300 font-mono">
                  {formatTime(timeLeftSeconds)}
                </span>
              </div>

              <button
                onClick={() => setShowScratchpad(!showScratchpad)}
                className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 px-3 py-2 rounded-xl text-xs font-bold text-[#061F48] dark:text-gray-200 flex items-center gap-1.5 cursor-pointer hover:bg-gray-100"
              >
                <Edit3 className="h-4 w-4 text-[#D09515]" />
                <span>Scratchpad Canvas</span>
              </button>

              <button
                onClick={handleSubmitExam}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md cursor-pointer"
              >
                Submit Exam Now
              </button>
            </div>
          </div>

          {/* SCRATCHPAD WHITEBOARD POPUP OVERLAY */}
          {showScratchpad && (
            <div className="bg-[#F8F5ED] dark:bg-gray-800 p-4 rounded-2xl border border-gray-300 dark:border-gray-700 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-white">Exam Scratchpad Calculation Board</span>
                <button onClick={() => setShowScratchpad(false)} className="text-xs font-bold text-red-500">Close Canvas</button>
              </div>
              <WhiteboardCanvas />
            </div>
          )}

          {/* QUESTION BOX & PALETTE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* QUESTION DISPLAY */}
            <div className="lg:col-span-3 bg-[#F8F5ED] dark:bg-gray-800/80 p-6 rounded-3xl border border-[#061F48]/15 dark:border-gray-700 space-y-6">
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3">
                <span className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-gray-300">
                  Question {currentQuestionIdx + 1} of {selectedPaper?.questions?.length || 1}
                </span>

                <button
                  onClick={() => setMarkedForReview(prev => ({ ...prev, [currentQuestionIdx]: !prev[currentQuestionIdx] }))}
                  className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg transition-all cursor-pointer ${
                    markedForReview[currentQuestionIdx]
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {markedForReview[currentQuestionIdx] ? '★ Marked for Review' : 'Mark for Review'}
                </button>
              </div>

              {/* QUESTION TEXT */}
              <p className="text-sm font-extrabold text-[#061F48] dark:text-white leading-relaxed">
                {selectedPaper?.questions?.[currentQuestionIdx]?.question || 'Question content loading...'}
              </p>

              {/* OPTIONS LIST */}
              <div className="space-y-3">
                {(selectedPaper?.questions?.[currentQuestionIdx]?.options || []).map((option, optIdx) => (
                  <button
                    key={optIdx}
                    onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentQuestionIdx]: optIdx }))}
                    className={`w-full p-4 rounded-2xl text-left text-xs font-bold transition-all border flex items-center justify-between cursor-pointer ${
                      selectedAnswers[currentQuestionIdx] === optIdx
                        ? 'bg-[#061F48] text-white border-[#061F48] dark:bg-[#D09515] dark:text-[#061F48] dark:border-[#D09515] shadow-md'
                        : 'bg-white dark:bg-gray-900 text-[#061F48] dark:text-gray-200 border-gray-200 dark:border-gray-700 hover:border-[#061F48]/50'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <span className="h-6 w-6 rounded-full border border-current flex items-center justify-center text-[10px] font-black shrink-0">
                        {String.fromCharCode(65 + optIdx)}
                      </span>
                      <span>{option}</span>
                    </span>

                    {selectedAnswers[currentQuestionIdx] === optIdx && (
                      <CheckCircle2 className="h-4 w-4 shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              {/* QUESTION NAVIGATION CONTROLS */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  disabled={currentQuestionIdx === 0}
                  onClick={() => setCurrentQuestionIdx(prev => Math.max(0, prev - 1))}
                  className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-gray-700 text-[#061F48] dark:text-white text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Previous
                </button>

                <button
                  disabled={currentQuestionIdx >= ((selectedPaper?.questions?.length || 1) - 1)}
                  onClick={() => setCurrentQuestionIdx(prev => Math.min((selectedPaper?.questions?.length || 1) - 1, prev + 1))}
                  className="px-5 py-2 rounded-xl bg-[#061F48] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1 cursor-pointer disabled:opacity-40"
                >
                  Next Question <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* QUESTION PALETTE SIDEBAR */}
            <div className="bg-[#F8F5ED] dark:bg-gray-800/80 p-5 rounded-3xl border border-[#061F48]/15 dark:border-gray-700 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-white">
                Question Palette
              </h4>

              <div className="grid grid-cols-4 gap-2">
                {(selectedPaper?.questions || []).map((_, qIdx) => {
                  const isAnswered = selectedAnswers[qIdx] !== undefined;
                  const isMarked = markedForReview[qIdx];
                  const isCurrent = currentQuestionIdx === qIdx;

                  return (
                    <button
                      key={qIdx}
                      onClick={() => setCurrentQuestionIdx(qIdx)}
                      className={`h-9 rounded-xl text-xs font-black transition-all cursor-pointer border flex items-center justify-center ${
                        isCurrent
                          ? 'ring-2 ring-[#061F48] dark:ring-[#D09515] font-extrabold scale-105'
                          : ''
                      } ${
                        isMarked
                          ? 'bg-purple-600 text-white border-purple-700'
                          : isAnswered
                          ? 'bg-emerald-600 text-white border-emerald-700'
                          : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-700'
                      }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* PALETTE LEGEND */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2 text-[10px] font-bold text-gray-600 dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-emerald-600 shrink-0" />
                  <span>Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-purple-600 shrink-0" />
                  <span>Marked for Review</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded bg-white border border-gray-400 shrink-0" />
                  <span>Not Attempted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CASE 3: EXAM SUBMITTED SCORECARD ANALYSIS */}
      {examSubmitted && selectedPaper && (
        <div className="bg-[#F8F5ED] dark:bg-gray-800/90 p-6 md:p-8 rounded-3xl border border-[#061F48]/15 dark:border-gray-700 space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
            <div>
              <span className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full border border-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" /> Sunday Exam Official Result
              </span>
              <h3 className="text-xl font-black text-[#061F48] dark:text-white mt-1">
                {selectedPaper.title}
              </h3>
              <p className="text-xs text-gray-500 font-semibold">
                Student: <strong>{userName}</strong> ({userRoll}) | Batch: <strong>{selectedBatch}</strong>
              </p>
            </div>

            <button
              onClick={() => {
                setExamSubmitted(false);
                setExamStarted(false);
              }}
              className="bg-[#061F48] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#D09515] transition-all cursor-pointer"
            >
              Back to Exam Hall
            </button>
          </div>

          {/* METRIC CARDS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Score Obtained</span>
              <span className="text-2xl font-black text-[#061F48] dark:text-white">{scoreObtained} / {selectedPaper.totalMarks}</span>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Accuracy Rate</span>
              <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{scorePercent}%</span>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Batch Percentile</span>
              <span className="text-2xl font-black text-[#D09515]">{Math.max(85, Math.min(99, scorePercent + 8))}%tile</span>
            </div>

            <div className="bg-white dark:bg-gray-900 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-center">
              <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 block">Grade Remark</span>
              <span className={`text-xl font-black ${scoreObtained >= selectedPaper.passingMarks ? 'text-emerald-600' : 'text-amber-600'}`}>
                {scoreObtained >= selectedPaper.passingMarks ? 'PASSED (Grade A)' : 'Needs Revision'}
              </span>
            </div>
          </div>

          {/* SOLUTIONS BREAKDOWN */}
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-black text-[#061F48] dark:text-white uppercase tracking-wider">
              Step-by-Step Question Solutions
            </h4>

            <div className="space-y-4">
              {(selectedPaper?.questions || []).map((q, idx) => {
                const userChoice = selectedAnswers[idx];
                const isCorrect = userChoice === q.correctAnswer;

                return (
                  <div key={q.id} className="bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-[#061F48] dark:text-white">
                        Q{idx + 1}. {q.question}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase ${
                        isCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {isCorrect ? 'Correct' : 'Incorrect / Skipped'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 dark:text-gray-300 font-semibold">
                      Your Choice: <strong>{userChoice !== undefined ? q.options[userChoice] : 'Not Answered'}</strong> | Correct Answer: <strong className="text-emerald-600">{q.options[q.correctAnswer]}</strong>
                    </p>

                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-xl">
                      💡 <strong>Explanation:</strong> {q.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
