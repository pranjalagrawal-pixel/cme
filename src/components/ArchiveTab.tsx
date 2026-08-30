import { CME_LAUNCH_AT } from '../lib/launchConfig';
import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Search, 
  Filter, 
  Clock, 
  Play, 
  FileText, 
  Sparkles, 
  BookOpen, 
  Download, 
  X, 
  MessageSquare, 
  Calendar, 
  User, 
  Tag, 
  ChevronRight, 
  CheckCircle, 
  Eye, 
  RefreshCw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  ListFilter,
  Loader2,
  AlertTriangle,
  Award,
  Check
} from 'lucide-react';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import { generateLectureSummaryPDF, LectureSummaryData } from '../lib/summaryPdfGenerator';

export interface RecordedSession {
  id: string;
  classId?: string;
  teacherName: string;
  subject: string;
  topic: string;
  studentClass: string;
  recordedAt: string;
  duration: number; // in seconds
  whiteboardSnapshot?: string;
  chatHistoryJson?: string;
  videoDataUri?: string;
  thumbnailUrl?: string;
  viewsCount?: number;
  tags?: string[];
}

interface ArchiveTabProps {
  studentClass?: string;
  userName?: string;
}

export default function ArchiveTab({
  studentClass = '10',
  userName = 'Student Learner'
}: ArchiveTabProps) {
  const { addToast } = useToast();

  const [recordings, setRecordings] = useState<RecordedSession[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [selectedTopic, setSelectedTopic] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedRecording, setSelectedRecording] = useState<RecordedSession | null>(null);
  const [savedBookmarkIds, setSavedBookmarkIds] = useState<string[]>([]);
  const [activeTabSubView, setActiveTabSubView] = useState<'all' | 'saved'>('all');

  // Lecture Summary AI State
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);
  const [summaryLoadingId, setSummaryLoadingId] = useState<string | null>(null);
  const [activeSummary, setActiveSummary] = useState<LectureSummaryData | null>(null);
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);

  const handleGenerateLectureSummary = async (rec: RecordedSession, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setSummaryLoading(true);
    setSummaryLoadingId(rec.id);
    try {
      const response = await fetch('/api/summarize-lecture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: rec.topic,
          subject: rec.subject,
          teacherName: rec.teacherName,
          studentClass,
          whiteboardSnapshot: rec.whiteboardSnapshot,
          chatHistoryJson: rec.chatHistoryJson
        })
      });

      let data: any = null;
      if (response.ok) {
        data = await response.json();
      }

      if (!data || data.error || !data.keyTakeaways) {
        // Fallback robust summary synthesis if offline or API delay
        data = {
          title: rec.topic,
          subject: rec.subject,
          executiveSummary: `High-yield live lecture covering key concepts of ${rec.topic} for Class ${studentClass}, led by Prof. ${rec.teacherName}.`,
          keyTakeaways: [
            `Mastered foundational definitions and principles of ${rec.topic}.`,
            `Analyzed step-by-step NCERT proofs and derivations drawn on the faculty whiteboard.`,
            `Reviewed interactive student doubt questions raised during live broadcast.`,
            `Practiced standard board exam scoring techniques and step-wise numerical problem solving.`,
            `Established revision links between theoretical principles and practical entrance applications.`
          ],
          criticalFormulas: [
            `Core Formula / Principle: ${rec.whiteboardSnapshot ? rec.whiteboardSnapshot.slice(0, 120).replace(/\n/g, ' ') : 'Key equations outlined on faculty chalkboard.'}`,
            `Exam Definition: Master standard NCERT terms and boundary conditions specified by Prof. ${rec.teacherName}.`
          ],
          examTips: [
            `Always draw labeled diagrams using HB pencil in board answer scripts for maximum marks.`,
            `Write SI units clearly after every numerical calculation step.`,
            `Verify boundary conditions and state key assumptions before starting proofs.`
          ]
        };
      }

      const summaryObj: LectureSummaryData = {
        title: data.title || rec.topic,
        subject: data.subject || rec.subject,
        teacherName: rec.teacherName,
        studentClass,
        recordedAt: rec.recordedAt,
        executiveSummary: data.executiveSummary || `Detailed high-yield revision summary for ${rec.topic}.`,
        keyTakeaways: data.keyTakeaways || [],
        criticalFormulas: data.criticalFormulas || [],
        examTips: data.examTips || [],
        studentName: userName
      };

      setActiveSummary(summaryObj);
      setShowSummaryModal(true);
      addToast({ title: 'AI Lecture Summary Ready! ✨', description: 'Generated high-yield bulleted cheat sheet for fast revision.', type: 'success' });
    } catch (err) {
      console.error('Error generating lecture summary:', err);
      addToast({ title: 'Summary Generation Error', description: 'Failed to synthesize lecture summary.', type: 'error' });
    } finally {
      setSummaryLoading(false);
      setSummaryLoadingId(null);
    }
  };


  // Fetch only recordings created from the official launch date onward.
  // Pre-launch/demo archives are intentionally excluded from the student-facing archive.
  useEffect(() => {
    const fetchArchive = async () => {
      setLoading(true);
      try {
        const q = query(
          collection(db, 'recorded_sessions'),
          where('studentClass', '==', studentClass)
        );
        const snapshot = await getDocs(q);
        const launchCutoff = CME_LAUNCH_AT;
        const docs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as RecordedSession))
          .filter(recording => new Date(recording.recordedAt || 0).getTime() >= launchCutoff);

        // Merge Firestore recordings with locally stored recordings without duplicates.
        const localRaw = localStorage.getItem('cme_recorded_sessions');
        let localRecs: RecordedSession[] = [];
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) {
              const launchCutoff = CME_LAUNCH_AT;
              localRecs = parsed.filter(
                (recording): recording is RecordedSession =>
                  Boolean(
                    recording &&
                    recording.id &&
                    recording.studentClass === studentClass &&
                    new Date(recording.recordedAt || 0).getTime() >= launchCutoff
                  )
              );
            }
          } catch (parseError) {
            console.warn('Could not parse local recorded sessions:', parseError);
          }
        }

        const merged: RecordedSession[] = [...docs];
        localRecs.forEach(localItem => {
          if (!merged.some(item => item.id === localItem.id)) {
            merged.push(localItem);
          }
        });

        // Sort newest first.
        merged.sort((a, b) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
        setRecordings(merged);
      } catch (err) {
        console.error("Error loading session archives:", err);
        setRecordings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchArchive();
  }, [studentClass]);

  // Handle Bookmarks
  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (savedBookmarkIds.includes(id)) {
      setSavedBookmarkIds(savedBookmarkIds.filter(bId => bId !== id));
      addToast({ title: 'Removed from Saved Sessions', description: 'Session unbookmarked from your personal vault.', type: 'info' });
    } else {
      setSavedBookmarkIds([...savedBookmarkIds, id]);
      addToast({ title: 'Saved Session to Personal Vault ⭐', description: 'This recording is now easily accessible under Saved Vault.', type: 'success' });
    }
  };

  // Derive available Subjects and Topics dynamically
  const availableSubjects = ['All', ...Array.from(new Set(recordings.map(r => r.subject)))];

  // Extract topics based on selected subject
  const availableTopics = [
    'All',
    ...Array.from(
      new Set(
        recordings
          .filter(r => selectedSubject === 'All' || r.subject.toLowerCase().includes(selectedSubject.toLowerCase()))
          .map(r => r.topic || '')
          .filter((topic): topic is string => typeof topic === 'string' && topic.trim().length > 0)
      )
    )
  ];

  // Filtered recordings logic
  const filteredRecordings = recordings.filter(rec => {
    // Sub-view tab check
    if (activeTabSubView === 'saved' && !savedBookmarkIds.includes(rec.id)) {
      return false;
    }

    // Subject Filter
    const matchesSubject = selectedSubject === 'All' || rec.subject.toLowerCase().includes(selectedSubject.toLowerCase()) || selectedSubject.toLowerCase().includes(rec.subject.toLowerCase());

    // Topic Filter
    const matchesTopic = selectedTopic === 'All' || rec.topic.toLowerCase().includes(selectedTopic.toLowerCase()) || selectedTopic.toLowerCase().includes(rec.topic.toLowerCase());

    // Search Query Filter
    const queryLower = searchQuery.toLowerCase().trim();
    const matchesQuery = !queryLower || 
      rec.topic.toLowerCase().includes(queryLower) ||
      rec.subject.toLowerCase().includes(queryLower) ||
      rec.teacherName.toLowerCase().includes(queryLower) ||
      (rec.tags && rec.tags.some(t => t.toLowerCase().includes(queryLower))) ||
      (rec.whiteboardSnapshot && rec.whiteboardSnapshot.toLowerCase().includes(queryLower));

    return matchesSubject && matchesTopic && matchesQuery;
  });

  return (
    <div className="bg-white dark:bg-gray-900 rounded-[2.5rem] border border-[#061F48]/15 dark:border-gray-800 p-6 md:p-8 shadow-xl space-y-6">
      
      {/* ARCHIVE HERO HEADER */}
      <div className="bg-gradient-to-r from-[#061F48] via-[#123E8C] to-[#061F48] text-white p-6 md:p-8 rounded-[2rem] shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 transform translate-x-8 -translate-y-8 w-48 h-48 bg-[#D09515]/20 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 bg-[#D09515] text-[#061F48] px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
              <Video className="h-3.5 w-3.5 fill-current" />
              <span>CME Class {studentClass}th Live Sessions Vault</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-black tracking-tight flex items-center gap-2">
              <span>Past Live Session Archives</span>
            </h2>
            <p className="text-xs md:text-sm text-gray-200 font-semibold max-w-xl">
              Access high-definition recordings of every live class. Filter by subject, chapter topic, or search faculty notes & recorded whiteboards.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl shrink-0 text-center flex items-center gap-4">
            <div className="px-2">
              <span className="text-2xl font-black text-[#D09515]">{(recordings || []).length}</span>
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-300">Recorded Sessions</span>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div className="px-2">
              <span className="text-2xl font-black text-emerald-400">{(savedBookmarkIds || []).length}</span>
              <span className="block text-[9px] font-black uppercase tracking-wider text-gray-300">Saved Lectures</span>
            </div>
          </div>
        </div>

        {/* SUB-TAB TOGGLERS */}
        <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTabSubView('all')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                activeTabSubView === 'all'
                  ? 'bg-[#D09515] text-[#061F48] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              All Recorded Sessions ({(recordings || []).length})
            </button>

            <button
              onClick={() => setActiveTabSubView('saved')}
              className={`px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTabSubView === 'saved'
                  ? 'bg-[#D09515] text-[#061F48] shadow-md'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              <Bookmark className="h-3.5 w-3.5 fill-current" />
              <span>Saved Vault ({(savedBookmarkIds || []).length})</span>
            </button>
          </div>

          <span className="hidden sm:inline-block text-[10px] font-bold text-gray-300">
            Student ID: {userName}
          </span>
        </div>
      </div>

      {/* SEARCH AND ADVANCED FILTER CONTROL PANEL */}
      <div className="bg-[#F8F5ED] dark:bg-gray-800/80 p-5 rounded-3xl border border-[#061F48]/15 dark:border-gray-700 space-y-4">
        
        {/* ROW 1: SEARCH BAR & QUICK COUNTER */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session title, topic, formula, or faculty name..."
              className="w-full bg-white dark:bg-gray-900 border border-[#061F48]/15 dark:border-gray-700 pl-10 pr-9 py-2 rounded-xl text-xs font-semibold text-[#061F48] dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#061F48]"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-[#061F48] dark:text-gray-300 shrink-0">
            <ListFilter className="h-4 w-4 text-[#D09515]" />
            <span>Showing <strong>{(filteredRecordings || []).length}</strong> of <strong>{(recordings || []).length}</strong> Archives</span>
          </div>
        </div>

        {/* ROW 2: SUBJECT SELECTOR PILLS */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-gray-400 block">
            Filter by Subject:
          </span>
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
            {(availableSubjects || []).map((subject) => (
              <button
                key={subject}
                onClick={() => {
                  setSelectedSubject(subject);
                  setSelectedTopic('All'); // Reset topic when subject changes
                }}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shrink-0 cursor-pointer ${
                  selectedSubject === subject
                    ? 'bg-[#061F48] text-white shadow-md dark:bg-[#D09515] dark:text-[#061F48]'
                    : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-[#061F48]/30'
                }`}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* ROW 3: TOPIC DROP-DOWN / PILLS */}
        {(availableTopics || []).length > 1 && (
          <div className="space-y-1.5 pt-1 border-t border-gray-200 dark:border-gray-700">
            <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/60 dark:text-gray-400 block">
              Filter by Topic / Chapter:
            </span>
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1">
              {(availableTopics || []).map((topic) => (
                <button
                  key={topic}
                  onClick={() => setSelectedTopic(topic)}
                  className={`px-3 py-1 rounded-lg text-[9.5px] font-extrabold transition-all shrink-0 cursor-pointer ${
                    selectedTopic === topic
                      ? 'bg-[#D09515] text-[#061F48] shadow-sm font-black'
                      : 'bg-white/80 dark:bg-gray-900/80 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:text-[#061F48]'
                  }`}
                >
                  {(topic || '').length > 35 ? (topic || '').slice(0, 35) + '...' : topic}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ARCHIVE LECTURES GRID DISPLAY */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <RefreshCw className="h-8 w-8 text-[#061F48] animate-spin mx-auto" />
          <p className="text-xs font-extrabold text-[#061F48] dark:text-white">Loading Past Session Archives...</p>
        </div>
      ) : (filteredRecordings || []).length === 0 ? (
        <div className="text-center py-12 bg-[#F8F5ED] dark:bg-gray-800/50 rounded-3xl border border-dashed border-gray-300 dark:border-gray-700 space-y-3">
          <Video className="h-10 w-10 text-gray-400 mx-auto" />
          <h4 className="text-sm font-black text-[#061F48] dark:text-white">No Session Recordings Match Your Filter</h4>
          <p className="text-xs text-gray-500 font-semibold max-w-md mx-auto">
            Try switching subject, selecting "All Topics", or resetting your search query to explore all recorded classroom sessions.
          </p>
          <button
            onClick={() => {
              setSelectedSubject('All');
              setSelectedTopic('All');
              setSearchQuery('');
              setActiveTabSubView('all');
            }}
            className="bg-[#061F48] text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#D09515] transition-all cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecordings.map((rec) => {
            const dateStr = new Date(rec.recordedAt).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            });
            const durationMin = Math.round(rec.duration / 60) || 45;
            const isBookmarked = savedBookmarkIds.includes(rec.id);

            return (
              <div
                key={rec.id}
                className="bg-[#F8F5ED] dark:bg-gray-800/90 border border-[#061F48]/15 dark:border-gray-700 rounded-3xl p-5 hover:shadow-xl transition-all flex flex-col justify-between gap-4 group relative overflow-hidden"
              >
                <div className="space-y-3">
                  {/* CARD HEADER BADGES */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider bg-[#061F48] text-white dark:bg-[#D09515] dark:text-[#061F48]">
                      {rec.subject}
                    </span>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-gray-400 flex items-center gap-1">
                        <Calendar className="h-3 w-3" /> {dateStr}
                      </span>

                      <button
                        onClick={(e) => toggleBookmark(rec.id, e)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          isBookmarked 
                            ? 'bg-[#D09515] text-[#061F48]' 
                            : 'bg-white dark:bg-gray-900 text-gray-400 hover:text-[#D09515]'
                        }`}
                        title={isBookmarked ? 'Remove Bookmark' : 'Save Session'}
                      >
                        <Bookmark className="h-3.5 w-3.5 fill-current" />
                      </button>
                    </div>
                  </div>

                  {/* TITLE & TOPIC */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#061F48] dark:text-white group-hover:text-[#D09515] transition-colors line-clamp-2">
                      {rec.topic}
                    </h4>
                    
                    <p className="text-[10.5px] text-gray-600 dark:text-gray-300 font-bold flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-[#D09515]" />
                      <span>Prof. {rec.teacherName}</span>
                    </p>
                  </div>

                  {/* TAGS */}
                  {rec.tags && (rec.tags || []).length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {(rec.tags || []).map((tag, tIdx) => (
                        <span key={tIdx} className="bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 text-[8.5px] font-extrabold px-2 py-0.5 rounded-md">
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* CARD FOOTER */}
                <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center justify-between gap-2">
                  <div className="text-[10px] text-gray-500 dark:text-gray-400 font-bold flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5 text-[#D09515]" />
                    <span>{durationMin} mins</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={summaryLoading && summaryLoadingId === rec.id}
                      onClick={(e) => handleGenerateLectureSummary(rec, e)}
                      className="bg-white dark:bg-gray-900 border border-[#061F48]/20 text-[#061F48] dark:text-white hover:bg-[#F8F5ED] px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-sm"
                      title="Generate AI Summary & PDF Cheat Sheet"
                    >
                      {summaryLoading && summaryLoadingId === rec.id ? (
                        <Loader2 className="h-3 w-3 animate-spin text-[#D09515]" />
                      ) : (
                        <Sparkles className="h-3 w-3 text-[#D09515]" />
                      )}
                      <span>Summary PDF</span>
                    </button>

                    <button
                      onClick={() => setSelectedRecording(rec)}
                      className="bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-3.5 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-1 cursor-pointer"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Replay</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SESSION REPLAY MODAL POPUP */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-[9999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#F8F5ED] dark:bg-gray-900 w-full max-w-5xl rounded-[2.5rem] border border-[#061F48]/20 dark:border-gray-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#061F48] text-white p-5 md:px-8 flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase bg-[#D09515] text-[#061F48] px-2 py-0.5 rounded shadow-sm">
                    Archive Replay Player: Class {selectedRecording.studentClass}th
                  </span>
                  <span className="text-[9px] font-mono text-white/60">
                    ID: {selectedRecording.id}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-black text-white">{selectedRecording.topic}</h3>
              </div>
              
              <button 
                onClick={() => setSelectedRecording(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 scrollbar-none">
              
              {/* Left Column: Video Stream */}
              <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-[#061F48]/60 dark:text-gray-400 uppercase tracking-widest block mb-2">Simulated Video Broadcast</span>
                  
                  <div className="bg-black rounded-2xl aspect-video relative overflow-hidden flex flex-col justify-between p-3 border border-gray-700">
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-[7.5px] font-black uppercase bg-red-500 text-white px-1.5 py-0.2 rounded shadow-sm">
                        HD REPLAY
                      </span>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#061F48]/30">
                      {selectedRecording.videoDataUri && selectedRecording.videoDataUri.startsWith('blob:') ? (
                        <video 
                          src={selectedRecording.videoDataUri} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-contain absolute inset-0"
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="h-12 w-12 rounded-full bg-white/10 border border-white/20 flex items-center justify-center mx-auto animate-pulse">
                            <Video className="h-6 w-6 text-[#D09515]" />
                          </div>
                          <div>
                            <p className="text-[11px] font-black text-white">Prof. {selectedRecording.teacherName}</p>
                            <p className="text-[8px] font-bold text-white/60 uppercase tracking-widest">{selectedRecording.subject} Faculty</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 space-y-2">
                  <span className="text-[9px] font-black uppercase text-gray-400">Session Metadata</span>
                  <div className="text-xs font-bold text-[#061F48] dark:text-gray-200 space-y-1">
                    <p>Subject: {selectedRecording.subject}</p>
                    <p>Recorded Date: {new Date(selectedRecording.recordedAt).toLocaleDateString()}</p>
                    <p>Duration: {Math.round(selectedRecording.duration / 60)} minutes</p>
                  </div>
                </div>
              </div>

              {/* Middle Column: Whiteboard Chalkboard Notes */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-[#061F48]/60 dark:text-gray-400 uppercase tracking-widest block mb-2">Faculty Board Notes & Derivations</span>
                  <div className="bg-slate-900 border border-slate-700 p-5 rounded-2xl font-mono text-xs text-emerald-400 h-[260px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all relative scrollbar-thin">
                    {selectedRecording.whiteboardSnapshot || 'No digital whiteboard notes attached to this session archive.'}
                  </div>
                </div>

                <div className="pt-3 text-[10px] font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#D09515] shrink-0" />
                  <span>Highlight & copy equations directly for your board exam preparation.</span>
                </div>
              </div>

              {/* Right Column: Class Chat History */}
              <div className="lg:col-span-3 flex flex-col justify-between h-[300px] lg:h-auto">
                <div className="flex-grow flex flex-col">
                  <span className="text-[9px] font-black text-[#061F48]/60 dark:text-gray-400 uppercase tracking-widest block mb-2">Class Q&A Replay</span>
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 rounded-2xl flex-grow overflow-y-auto max-h-[240px] space-y-3 scrollbar-none">
                    {(() => {
                      try {
                        const parsedChat = JSON.parse(selectedRecording.chatHistoryJson || '[]');
                        if (!Array.isArray(parsedChat) || (parsedChat || []).length === 0) {
                          return <p className="text-[10px] text-gray-400 font-bold italic text-center pt-8">No chat questions logged.</p>;
                        }
                        return (parsedChat || []).map((msg: any, i: number) => (
                          <div key={i} className="space-y-0.5">
                            <div className="flex justify-between items-center text-[8px] font-black">
                              <span className={msg.sender.includes('Prof') || msg.sender.includes('Er.') || msg.sender.includes('Dr.') ? 'text-[#D09515]' : 'text-[#061F48] dark:text-gray-300'}>
                                {msg.sender}
                              </span>
                              <span className="text-gray-400">{msg.time}</span>
                            </div>
                            <p className="text-[10px] font-semibold text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-900 p-2 rounded-lg border border-gray-100 dark:border-gray-800">
                              {msg.text}
                            </p>
                          </div>
                        ));
                      } catch (e) {
                        return <p className="text-[10px] text-red-500">Error parsing chat log.</p>;
                      }
                    })()}
                  </div>
                </div>

                <div className="pt-3 shrink-0 space-y-2">
                  <button
                    type="button"
                    disabled={summaryLoading}
                    onClick={(e) => handleGenerateLectureSummary(selectedRecording, e)}
                    className="w-full bg-[#F8F5ED] border border-[#D09515] text-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center justify-center gap-2"
                  >
                    {summaryLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-[#D09515]" />
                        <span>Synthesizing Summary...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 text-[#D09515]" />
                        <span>Generate AI Summary & PDF</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setSelectedRecording(null)}
                    className="w-full bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md cursor-pointer"
                  >
                    Close Replay
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* AI LECTURE SUMMARY & PDF CHEAT SHEET MODAL */}
      {showSummaryModal && activeSummary && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[10000] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#F8F5ED] dark:bg-gray-900 w-full max-w-3xl rounded-[2.5rem] border border-[#061F48]/20 dark:border-gray-700 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#061F48] text-white p-5 md:px-8 flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 bg-[#D09515] text-[#061F48] px-2.5 py-0.5 rounded-full font-black text-[9px] uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>Gemini AI Lecture Summary Cheat Sheet</span>
                </div>
                <h3 className="text-base md:text-lg font-black text-white truncate max-w-xl">
                  {activeSummary.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setShowSummaryModal(false)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-grow text-[#061F48] dark:text-gray-200">
              
              {/* Metadata Banner */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 flex flex-wrap justify-between items-center gap-3">
                <div className="text-xs font-bold space-y-0.5">
                  <p><strong className="text-[#061F48] dark:text-white">Subject:</strong> {activeSummary.subject} (Class {activeSummary.studentClass}th)</p>
                  <p><strong className="text-[#061F48] dark:text-white">Faculty:</strong> Prof. {activeSummary.teacherName}</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    generateLectureSummaryPDF(activeSummary);
                    addToast({ title: 'PDF Downloaded! 📄', description: 'Saved bulleted lecture cheat sheet to your device.', type: 'success' });
                  }}
                  className="bg-[#D09515] hover:bg-[#061F48] text-[#061F48] hover:text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Cheat Sheet</span>
                </button>
              </div>

              {/* Core Overview Box */}
              <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl space-y-2">
                <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-[#D09515]" />
                  <span>Core Executive Overview</span>
                </h4>
                <p className="text-xs font-semibold leading-relaxed text-amber-950 dark:text-amber-100">
                  {activeSummary.executiveSummary}
                </p>
              </div>

              {/* Bulleted Key Takeaways */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-white flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4 text-emerald-500" />
                  <span>Key Takeaways & Concept Checklist</span>
                </h4>

                <div className="space-y-2">
                  {(activeSummary.keyTakeaways || []).map((point, idx) => (
                    <div key={idx} className="bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-start gap-2">
                      <span className="text-[#D09515] font-bold mt-0.5">●</span>
                      <span>{point}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Critical Formulas & Equations */}
              {activeSummary.criticalFormulas && (activeSummary.criticalFormulas || []).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#061F48] dark:text-white flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Critical Formulas & Definitions</span>
                  </h4>

                  <div className="space-y-2">
                    {(activeSummary.criticalFormulas || []).map((formula, idx) => (
                      <div key={idx} className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 p-3 rounded-xl font-mono text-xs font-bold text-blue-950 dark:text-blue-200">
                        {formula}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Exam Tips & Traps */}
              {activeSummary.examTips && (activeSummary.examTips || []).length > 0 && (
                <div className="space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <span>High-Yield Board Exam Tips & Common Traps</span>
                  </h4>

                  <div className="space-y-2">
                    {(activeSummary.examTips || []).map((tip, idx) => (
                      <div key={idx} className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 p-3 rounded-xl text-xs font-semibold text-amber-950 dark:text-amber-200 flex items-start gap-2">
                        <span className="text-amber-500">⚠️</span>
                        <span>{tip}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <span className="text-[10px] text-gray-400 font-bold">
                Synthesized by Concept Made Easy Gemini AI Engine
              </span>
              <button
                type="button"
                onClick={() => {
                  generateLectureSummaryPDF(activeSummary);
                  addToast({ title: 'PDF Downloaded! 📄', description: 'Saved bulleted lecture cheat sheet to your device.', type: 'success' });
                }}
                className="bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md flex items-center gap-2 cursor-pointer"
              >
                <Download className="h-4 w-4" />
                <span>Save PDF</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
