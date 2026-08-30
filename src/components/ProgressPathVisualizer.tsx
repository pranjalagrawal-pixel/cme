import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Compass,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  RotateCcw,
  Sparkles,
  Calendar,
  ChevronRight,
  Filter,
  CheckSquare,
  Square,
  Award,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Target,
  ExternalLink,
  Plus,
  X,
  FileText,
  HelpCircle,
  BarChart2,
  Layers,
  Flame,
  ShieldCheck,
  RefreshCw,
  Eye,
  Check
} from 'lucide-react';
import { db, doc, setDoc, getDoc, updateDoc } from '../lib/firebase';
import { useToast } from '../context/ToastContext';
import {
  ProgressMilestone,
  CompletedAssignment,
  PendingTestRevision,
  ProgressPathData,
  MilestoneStatus
} from '../types';

interface ProgressPathVisualizerProps {
  profile: {
    name: string;
    studentClass: string;
    stream?: string;
    id?: string;
    rollNumber?: string;
  };
  onOpenTestFeedback?: (subject: string, score: { correct: number; total: number }) => void;
}

const getStudentKey = (profile: ProgressPathVisualizerProps['profile']) =>
  profile.id?.trim() || `student_${(profile.name || 'learner').toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '') || 'learner'}`;

const calculateJourneyProgress = (milestones: ProgressMilestone[]) => {
  if (!milestones.length) return 0;
  return Math.round(
    milestones.reduce((sum, milestone) => sum + Math.max(0, Math.min(100, Number(milestone.progressPercentage) || 0)), 0) /
      milestones.length
  );
};

const normalizeProgressData = (
  raw: Partial<ProgressPathData> | null | undefined,
  profile: ProgressPathVisualizerProps['profile']
): ProgressPathData | null => {
  if (!raw || !Array.isArray(raw.milestones) || !Array.isArray(raw.completedAssignments) || !Array.isArray(raw.pendingRevisions)) return null;
  const studentId = getStudentKey(profile);
  if (profile.id && raw.studentId && raw.studentId !== profile.id) return null;
  const milestones = raw.milestones as ProgressMilestone[];
  return {
    id: raw.id,
    studentId,
    studentName: profile.name || raw.studentName || 'Learner',
    studentClass: profile.studentClass || raw.studentClass || '10',
    overallJourneyProgress: calculateJourneyProgress(milestones),
    milestones,
    completedAssignments: raw.completedAssignments as CompletedAssignment[],
    pendingRevisions: raw.pendingRevisions as PendingTestRevision[],
    updatedAt: raw.updatedAt || new Date().toISOString()
  };
};

export default function ProgressPathVisualizer({
  profile,
  onOpenTestFeedback
}: ProgressPathVisualizerProps) {
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'milestones' | 'assignments' | 'revisions'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('All');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedMilestone, setSelectedMilestone] = useState<ProgressMilestone | null>(null);
  const [activeSolutionModal, setActiveSolutionModal] = useState<CompletedAssignment | null>(null);
  const [activeRevisionDrillModal, setActiveRevisionDrillModal] = useState<PendingTestRevision | null>(null);
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState<boolean>(false);
  const [isAddAssignmentModalOpen, setIsAddAssignmentModalOpen] = useState<boolean>(false);

  // New item form states
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneSubject, setNewMilestoneSubject] = useState('Physics');
  const [newMilestoneDate, setNewMilestoneDate] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');
  const [newMilestoneDeliverables, setNewMilestoneDeliverables] = useState('');

  const [newAssignmentTitle, setNewAssignmentTitle] = useState('');
  const [newAssignmentSubject, setNewAssignmentSubject] = useState('Physics');
  const [newAssignmentChapter, setNewAssignmentChapter] = useState('');
  const [newAssignmentScore, setNewAssignmentScore] = useState('');
  const [newAssignmentMaxScore, setNewAssignmentMaxScore] = useState('');
  const [newAssignmentFeedback, setNewAssignmentFeedback] = useState('Strong conceptual clarity on core theorems.');

  // Default rich data generator tailored to student class
  const getDefaultProgressData = (studentClass: string, studentName: string): ProgressPathData => {
    const isHighSchool = parseInt(studentClass || '10') >= 11;

    const milestones: ProgressMilestone[] = isHighSchool
      ? [
          {
            id: 'ms-1',
            phaseNumber: 1,
            title: 'Foundation Mechanics & Physical Chemistry Baseline',
            targetDate: '15 Jul 2026',
            estimatedCompletion: 'Completed',
            description: 'Master core kinematics, Newtonian dynamics, stoichiometry, and ionic equilibria concepts with NCERT exemplar drills.',
            status: 'Completed',
            progressPercentage: 100,
            subjectFocus: 'Physics & Chemistry',
            keyDeliverables: [
              'Complete 4 chapter-end NCERT derivations',
              'Solve 50 Advanced mechanics numerical problems',
              'Submit Colligative Properties lab observation sheet'
            ],
            unlockedBadge: 'Foundation Architect',
            completedAt: '12 Jul 2026'
          },
          {
            id: 'ms-2',
            phaseNumber: 2,
            title: 'High-Weightage Electrostatics & Organic Mechanisms Sprint',
            targetDate: '28 Aug 2026',
            estimatedCompletion: 'In Progress (Active Phase)',
            description: 'Rigorous derivation of Gauss Law, Capacitance dielectric networks, and Nucleophilic substitution pathways.',
            status: 'In Progress',
            progressPercentage: 65,
            subjectFocus: 'Physics & Chemistry',
            keyDeliverables: [
              'Derive Prism formula and Huygens wave theory proofs',
              'Aldol condensation & Cannizzaro mechanism step drills',
              'Pass Weekly Diagnostic Test 3 with ≥85% score'
            ],
            unlockedBadge: 'Circuit & Mechanism Master'
          },
          {
            id: 'ms-3',
            phaseNumber: 3,
            title: 'Mid-Term Diagnostic & All-India CME Benchmark Test',
            targetDate: '20 Sep 2026',
            estimatedCompletion: 'Upcoming in 24 days',
            description: 'Comprehensive evaluation covering 50% of the syllabus under strict proctored CBSE board timing.',
            status: 'Upcoming',
            progressPercentage: 15,
            subjectFocus: 'All Subjects (PCM/B)',
            keyDeliverables: [
              'Solve 3 Full-Length Mid-Term Mock papers',
              'Complete formula handbook compile sheet',
              'Attend a scheduled doubt-clearing session with a faculty mentor'
            ]
          },
          {
            id: 'ms-4',
            phaseNumber: 4,
            title: 'Calculus, Electromagnetism & Thermodynamics Deep Dive',
            targetDate: '30 Oct 2026',
            estimatedCompletion: 'Upcoming in 64 days',
            description: 'Advanced integration proofs, magnetic dipole moments, and Carnot cycle efficiencies.',
            status: 'Upcoming',
            progressPercentage: 0,
            subjectFocus: 'Mathematics & Physics',
            keyDeliverables: [
              'Master Definite Integrals standard properties',
              'Ampere circuital law and Biot-Savart derivations',
              'Achieve 90%+ in Sunday Batch Speed Drill'
            ]
          },
          {
            id: 'ms-5',
            phaseNumber: 5,
            title: 'Pre-Board Mock Marathons & Model Answer Presentation',
            targetDate: '15 Dec 2026',
            estimatedCompletion: 'Locked Stage',
            description: 'Strict 3-hour handwritten paper presentation polishing, stepwise step-marking perfection, and examiner blueprint tuning.',
            status: 'Locked',
            progressPercentage: 0,
            subjectFocus: 'All Subjects',
            keyDeliverables: [
              '5 Proctored Board Simulation Exams',
              'Topper Answer Sheet step comparison analysis',
              'Zero-error diagram execution review'
            ]
          },
          {
            id: 'ms-6',
            phaseNumber: 6,
            title: 'Final Board & Competitive Exam Excellence Sprint',
            targetDate: '15 Feb 2027',
            estimatedCompletion: 'Locked Stage',
            description: 'Rapid 1-page formula revisions, high-probability hot-spot questions, and calm confidence conditioning.',
            status: 'Locked',
            progressPercentage: 0,
            subjectFocus: 'Grand Finale Milestone',
            keyDeliverables: [
              'Ultimate 10-Year CBSE PYQ Sweep',
              'Final Master Cheatsheet Quick Glance',
              'Official CME Certificate of Board Readiness'
            ],
            unlockedBadge: 'Board 100-Percentile Elite'
          }
        ]
      : [
          {
            id: 'ms-1',
            phaseNumber: 1,
            title: 'Class 10 Core Science & Math Fundamentals',
            targetDate: '15 Jul 2026',
            estimatedCompletion: 'Completed',
            description: 'Real Numbers, Polynomials, Chemical Reactions, and Light Reflection/Refraction proofs.',
            status: 'Completed',
            progressPercentage: 100,
            subjectFocus: 'Science & Mathematics',
            keyDeliverables: [
              'Master Trigonometry identities proofs',
              'Chemical equation balancing speed drill (30 equations in 10 mins)',
              'Ray diagrams for Concave and Convex lenses'
            ],
            unlockedBadge: 'Foundation Architect',
            completedAt: '14 Jul 2026'
          },
          {
            id: 'ms-2',
            phaseNumber: 2,
            title: 'Periodic Trends, Life Processes & Quadratic Equations',
            targetDate: '30 Aug 2026',
            estimatedCompletion: 'In Progress (Active Phase)',
            description: 'Human circulatory & digestive systems, Nephron diagram, and quadratic formula discriminants.',
            status: 'In Progress',
            progressPercentage: 70,
            subjectFocus: 'Biology & Mathematics',
            keyDeliverables: [
              'Nephron & Human Heart labeled schematic practice',
              'Nature of roots problem sheet (D > 0, D = 0, D < 0)',
              'Weekly Chapter Test 3 completion'
            ],
            unlockedBadge: 'NCERT Master Champion'
          },
          {
            id: 'ms-3',
            phaseNumber: 3,
            title: 'Mid-Term Board Benchmark & Electricity Circuit Solver',
            targetDate: '25 Sep 2026',
            estimatedCompletion: 'Upcoming in 29 days',
            description: 'Ohm’s law derivations, series/parallel equivalent resistance numericals, and mid-term exam drill.',
            status: 'Upcoming',
            progressPercentage: 20,
            subjectFocus: 'Physics & Science',
            keyDeliverables: [
              'Complete 2 Full-Length Science Mock papers',
              'Master Joule’s heating and electric power formulas',
              'Clear doubts in Saturday live interactive room'
            ]
          },
          {
            id: 'ms-4',
            phaseNumber: 4,
            title: 'Magnetic Effects, Heredity & Surface Area Formulas',
            targetDate: '30 Oct 2026',
            estimatedCompletion: 'Upcoming in 64 days',
            description: 'Fleming’s Left Hand Rule, Solenoids, Mendelian crosses, and 3D geometric conversions.',
            status: 'Upcoming',
            progressPercentage: 0,
            subjectFocus: 'Science & Mathematics',
            keyDeliverables: [
              'Monohybrid & Dihybrid cross ratio tables',
              'Right-hand thumb rule 3D vector visualizations',
              'Cone frustum and sphere volume step calculations'
            ]
          },
          {
            id: 'ms-5',
            phaseNumber: 5,
            title: 'Pre-Board Marathon & CBSE Sample Paper Drills',
            targetDate: '15 Dec 2026',
            estimatedCompletion: 'Locked Stage',
            description: 'Complete 3-hour mock exams with strict step marking and neat answer presentation.',
            status: 'Locked',
            progressPercentage: 0,
            subjectFocus: 'All Board Subjects',
            keyDeliverables: [
              '5 CBSE Official Pattern Sample Papers',
              'Case-based question master tactics',
              'Topper answer writing blueprint adherence'
            ]
          },
          {
            id: 'ms-6',
            phaseNumber: 6,
            title: 'Class 10 Board Final Preparation Lap',
            targetDate: '10 Feb 2027',
            estimatedCompletion: 'Locked Stage',
            description: 'High-frequency question revision, 1-page cheatsheets, and exam day calm mastery.',
            status: 'Locked',
            progressPercentage: 0,
            subjectFocus: 'CBSE 2027 Board Grand Milestone',
            keyDeliverables: [
              'PYQ 2015-2026 Question sweep',
              'Formula flashcard rapid-fire recall',
              'Final CME Board Readiness Seal'
            ],
            unlockedBadge: 'CBSE 100-Percentile Shield'
          }
        ];

    const completedAssignments: CompletedAssignment[] = [];
    const pendingRevisions: PendingTestRevision[] = [];

    return {
      studentId: getStudentKey(profile),
      studentName: studentName || 'Learner',
      studentClass: studentClass || '10',
      overallJourneyProgress: calculateJourneyProgress(milestones),
      milestones,
      completedAssignments,
      pendingRevisions,
      updatedAt: new Date().toISOString()
    };
  };

  const [progressData, setProgressData] = useState<ProgressPathData>(() =>
    getDefaultProgressData(profile.studentClass, profile.name)
  );

  // Load from Firestore / LocalStorage
  useEffect(() => {
    let isMounted = true;
    const fetchProgress = async () => {
      setIsLoading(true);
      const studentKey = getStudentKey(profile);
      const localKey = `cme_progress_path_${studentKey}_${profile.studentClass}`;

      try {
        if (!profile.id) {
          const saved = localStorage.getItem(localKey);
          if (saved && isMounted) {
            const parsed = normalizeProgressData(JSON.parse(saved), profile);
            setProgressData(parsed || getDefaultProgressData(profile.studentClass, profile.name));
          } else if (isMounted) {
            setProgressData(getDefaultProgressData(profile.studentClass, profile.name));
          }
          return;
        }

        const docRef = doc(db, 'progress_path', studentKey);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists() && isMounted) {
          const cloudData = normalizeProgressData(docSnap.data() as Partial<ProgressPathData>, profile);
          if (cloudData) {
            setProgressData(cloudData);
            localStorage.setItem(localKey, JSON.stringify(cloudData));
          } else {
            const defaultData = getDefaultProgressData(profile.studentClass, profile.name);
            setProgressData(defaultData);
            localStorage.setItem(localKey, JSON.stringify(defaultData));
          }
        } else {
          // Check local storage fallback
          const saved = localStorage.getItem(localKey);
          if (saved && isMounted) {
            try {
              const parsed = normalizeProgressData(JSON.parse(saved), profile);
              setProgressData(parsed || getDefaultProgressData(profile.studentClass, profile.name));
            } catch (e) {
              const defaultData = getDefaultProgressData(profile.studentClass, profile.name);
              setProgressData(defaultData);
            }
          } else if (isMounted) {
            const defaultData = getDefaultProgressData(profile.studentClass, profile.name);
            setProgressData(defaultData);
            // Create the document only under the authenticated Firebase UID.
            await setDoc(docRef, {
              ...defaultData,
              id: studentKey,
              studentId: profile.id,
              studentName: profile.name || defaultData.studentName,
              studentClass: profile.studentClass || defaultData.studentClass
            }).catch(err => console.warn('Could not set initial firestore progress:', err));
            localStorage.setItem(localKey, JSON.stringify(defaultData));
          }
        }
      } catch (err) {
        console.warn('Firestore progress load error, using local fallback:', err);
        const saved = localStorage.getItem(localKey);
        if (saved && isMounted) {
          try {
            const parsed = normalizeProgressData(JSON.parse(saved), profile);
            setProgressData(parsed || getDefaultProgressData(profile.studentClass, profile.name));
          } catch (e) {
            setProgressData(getDefaultProgressData(profile.studentClass, profile.name));
          }
        } else if (isMounted) {
          setProgressData(getDefaultProgressData(profile.studentClass, profile.name));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchProgress();

    return () => {
      isMounted = false;
    };
  }, [profile.name, profile.studentClass, profile.id]);

  // Helper to persist changes
  const saveProgressData = async (updated: ProgressPathData) => {
    setProgressData(updated);
    const studentKey = getStudentKey(profile);
    const localKey = `cme_progress_path_${studentKey}_${profile.studentClass}`;
    localStorage.setItem(localKey, JSON.stringify(updated));

    try {
      if (profile.id) {
        const docRef = doc(db, 'progress_path', studentKey);
        await setDoc(docRef, {
          ...updated,
          id: studentKey,
          studentId: profile.id,
          studentName: profile.name || updated.studentName,
          studentClass: profile.studentClass || updated.studentClass,
          overallJourneyProgress: calculateJourneyProgress(updated.milestones),
          updatedAt: new Date().toISOString()
        });
      }
    } catch (err) {
      console.warn('Error syncing progress to Firestore, saved locally:', err);
    }
  };

  // Toggle milestone completion
  const handleToggleMilestone = async (milestoneId: string) => {
    const updatedMilestones = progressData.milestones.map(m => {
      if (m.id === milestoneId) {
        const isDone = m.status === 'Completed';
        const nextStatus: MilestoneStatus = isDone ? 'In Progress' : 'Completed';
        const nextPct = isDone ? 50 : 100;
        return {
          ...m,
          status: nextStatus,
          progressPercentage: nextPct,
          completedAt: !isDone ? new Date().toLocaleDateString('en-IN') : undefined
        };
      }
      return m;
    });

    const journeyPct = calculateJourneyProgress(updatedMilestones);

    const updated: ProgressPathData = {
      ...progressData,
      milestones: updatedMilestones,
      overallJourneyProgress: journeyPct
    };

    await saveProgressData(updated);
    addToast({
      title: 'Milestone Updated 🎯',
      description: 'Your progress roadmap status has been synchronized.',
      type: 'success'
    });
  };

  // Mark revision test as mastered
  const handleMarkRevisionMastered = async (revisionId: string) => {
    const updatedRevisions = progressData.pendingRevisions.map(r => {
      if (r.id === revisionId) {
        return {
          ...r,
          revisionStatus: 'Mastered' as const,
          revisedAt: new Date().toLocaleDateString('en-IN')
        };
      }
      return r;
    });

    const updated: ProgressPathData = {
      ...progressData,
      pendingRevisions: updatedRevisions
    };

    await saveProgressData(updated);
    addToast({
      title: 'Test Revision Mastered! 🎉',
      description: 'Marked as completed and weak area removed from pending queue.',
      type: 'success'
    });
    if (activeRevisionDrillModal?.id === revisionId) {
      setActiveRevisionDrillModal(null);
    }
  };

  // Add custom student milestone
  const handleCreateMilestone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    const newM: ProgressMilestone = {
      id: `custom-ms-${Date.now()}`,
      phaseNumber: (progressData.milestones || []).length + 1,
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate || new Date(Date.now() + 14 * 24 * 3600 * 1000).toLocaleDateString('en-IN'),
      estimatedCompletion: 'In Progress (Custom Target)',
      description: newMilestoneDesc.trim() || 'Custom academic milestone created by student.',
      status: 'In Progress',
      progressPercentage: 10,
      subjectFocus: newMilestoneSubject,
      keyDeliverables: newMilestoneDeliverables
        ? newMilestoneDeliverables.split('\n').filter(d => d.trim().length > 0)
        : ['Solve revision practice questions', 'Review textbook solved examples']
    };

    const updatedMilestones = [...progressData.milestones, newM];
    const journeyPct = calculateJourneyProgress(updatedMilestones);

    const updated: ProgressPathData = {
      ...progressData,
      milestones: updatedMilestones,
      overallJourneyProgress: journeyPct
    };

    await saveProgressData(updated);
    setIsAddMilestoneModalOpen(false);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setNewMilestoneDeliverables('');
    addToast({
      title: 'Custom Milestone Added 🚀',
      description: 'Your new goal has been placed on your Progress Path roadmap.',
      type: 'success'
    });
  };

  // Add completed assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssignmentTitle.trim()) return;

    const scored = parseFloat(newAssignmentScore);
    const max = parseFloat(newAssignmentMaxScore);
    if (!Number.isFinite(max) || max <= 0 || !Number.isFinite(scored) || scored < 0 || scored > max) {
      addToast({
        title: 'Check the score details',
        description: 'Enter a valid score where marks are between 0 and the maximum score.',
        type: 'error'
      });
      return;
    }
    const pct = Math.round((scored / max) * 100);

    const newA: CompletedAssignment = {
      id: `custom-asg-${Date.now()}`,
      title: newAssignmentTitle.trim(),
      subject: newAssignmentSubject,
      chapterTopic: newAssignmentChapter.trim() || 'Chapter Drill',
      score: `${scored}/${max}`,
      maxScore: max,
      scoredMarks: scored,
      percentage: pct,
      submittedAt: new Date().toLocaleDateString('en-IN'),
      gradedBy: 'Academic Evaluator',
      mentorFeedback: newAssignmentFeedback.trim() || 'Verified and logged to student portfolio.',
      status: pct >= 95 ? 'Exemplary' : 'Completed',
      solutionKeyAvailable: true,
      keyStrengths: ['Consistent step logic', 'Clean working calculations']
    };

    const updatedAssignments = [newA, ...progressData.completedAssignments];
    const updated: ProgressPathData = {
      ...progressData,
      completedAssignments: updatedAssignments
    };

    await saveProgressData(updated);
    setIsAddAssignmentModalOpen(false);
    setNewAssignmentTitle('');
    setNewAssignmentChapter('');
    addToast({
      title: 'Assignment Submitted & Logged 📝',
      description: `Score recorded: ${newA.score} (${pct}%).`,
      type: 'success'
    });
  };

  // Filtered lists
  const filteredMilestones = useMemo(() => {
    if (selectedSubject === 'All') return progressData.milestones;
    return progressData.milestones.filter(m =>
      m.subjectFocus.toLowerCase().includes(selectedSubject.toLowerCase())
    );
  }, [progressData.milestones, selectedSubject]);

  const filteredAssignments = useMemo(() => {
    if (selectedSubject === 'All') return progressData.completedAssignments;
    return progressData.completedAssignments.filter(a =>
      a.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [progressData.completedAssignments, selectedSubject]);

  const filteredRevisions = useMemo(() => {
    if (selectedSubject === 'All') return progressData.pendingRevisions;
    return progressData.pendingRevisions.filter(r =>
      r.subject.toLowerCase() === selectedSubject.toLowerCase()
    );
  }, [progressData.pendingRevisions, selectedSubject]);

  // Summary Metrics
  const totalMilestones = progressData.milestones.length;
  const completedMilestonesCount = progressData.milestones.filter(m => m.status === 'Completed').length;
  const inProgressMilestonesCount = progressData.milestones.filter(m => m.status === 'In Progress').length;
  
  const totalAssignments = progressData.completedAssignments.length;
  const avgAssignmentScore = useMemo(() => {
    if (totalAssignments === 0) return 0;
    const sum = progressData.completedAssignments.reduce((acc, a) => acc + (a.percentage || 0), 0);
    return Math.round(sum / totalAssignments);
  }, [progressData.completedAssignments, totalAssignments]);

  const pendingRevisionsCount = progressData.pendingRevisions.filter(r => r.revisionStatus !== 'Mastered').length;
  const highPriorityRevisionsCount = progressData.pendingRevisions.filter(
    r => r.revisionStatus !== 'Mastered' && r.priority === 'High'
  ).length;

  const subjectsList = ['All', 'Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'];

  return (
    <div id="progress-path-visualizer" className="space-y-8 animate-fade-in">
      
      {/* HEADER & EXECUTIVE SUMMARY BANNER */}
      <div className="bg-gradient-to-br from-[#061F48] via-[#0E3580] to-[#12429C] text-white rounded-[2.5rem] p-6 md:p-8 shadow-xl relative overflow-hidden border border-[#D09515]/20">
        
        {/* Subtle Decorative Background Geometry */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-12 -translate-y-12">
          <Compass className="h-72 w-72 text-[#D09515]" />
        </div>
        <div className="absolute -left-10 -bottom-10 opacity-5 pointer-events-none">
          <Target className="h-60 w-60 text-white" />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          
          <div className="space-y-2.5 max-w-2xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-[#D09515] text-[#061F48] px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shadow-sm">
                <Compass className="h-3.5 w-3.5" />
                Official Academic Roadmap
              </span>
              <span className="bg-white/10 text-white/90 border border-white/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                Class {profile.studentClass}th {profile.stream ? `• ${profile.stream}` : 'Board Mastery'}
              </span>
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-400" />
                Live Cloud Synced
              </span>
            </div>

            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
              Progress Path & Milestone Visualizer
            </h2>
            <p className="text-xs md:text-sm text-white/80 font-medium leading-relaxed">
              Track your real-time curriculum trajectory, verify completed graded assignments, and conquer flagged test revisions to ensure strong board-exam performance.
            </p>
          </div>

          {/* Overall Journey Gauge */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center gap-5 shrink-0 shadow-lg w-full sm:w-auto">
            <div className="relative h-18 w-18 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-white/20"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-[#D09515] transition-all duration-1000 ease-out"
                  strokeDasharray={`${progressData.overallJourneyProgress || 68}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center text-center">
                <span className="text-sm font-black text-white">{progressData.overallJourneyProgress || 68}%</span>
                <span className="text-[7.5px] uppercase font-bold text-white/70 tracking-widest">Done</span>
              </div>
            </div>

            <div className="space-y-1 text-left">
              <span className="text-[9px] font-black uppercase text-[#D09515] tracking-widest block">Journey Status</span>
              <p className="text-sm font-black text-white">
                {completedMilestonesCount} of {totalMilestones} Phases Cleared
              </p>
              <p className="text-[10.5px] text-white/70 font-semibold">
                {inProgressMilestonesCount} Active Phase underway
              </p>
            </div>
          </div>

        </div>

        {/* 4 CORE SUMMARY STAT CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5 mt-6 pt-6 border-t border-white/10">
          
          <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-[9px] font-black uppercase tracking-wider">Milestones</span>
              <Target className="h-4 w-4 text-[#D09515]" />
            </div>
            <p className="text-lg md:text-xl font-black text-white">{completedMilestonesCount} / {totalMilestones}</p>
            <p className="text-[10px] text-white/70 font-semibold">Next: Phase {completedMilestonesCount + 1}</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-[9px] font-black uppercase tracking-wider">Assignments</span>
              <FileCheck className="h-4 w-4 text-emerald-400" />
            </div>
            <p className="text-lg md:text-xl font-black text-white">{totalAssignments} Submitted</p>
            <p className="text-[10px] text-emerald-300 font-semibold">{avgAssignmentScore}% Avg Score</p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-[9px] font-black uppercase tracking-wider">Pending Revisions</span>
              <RotateCcw className={`h-4 w-4 ${highPriorityRevisionsCount > 0 ? 'text-amber-400 animate-spin-hover' : 'text-white/70'}`} />
            </div>
            <p className="text-lg md:text-xl font-black text-white">{pendingRevisionsCount} In Queue</p>
            <p className="text-[10px] text-amber-300 font-semibold">
              {highPriorityRevisionsCount > 0 ? `${highPriorityRevisionsCount} High Priority` : 'All Caught Up'}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-sm border border-white/15 p-3.5 rounded-2xl space-y-1">
            <div className="flex justify-between items-center text-white/70">
              <span className="text-[9px] font-black uppercase tracking-wider">Target Exam</span>
              <Award className="h-4 w-4 text-[#D09515]" />
            </div>
            <p className="text-lg md:text-xl font-black text-white">Board 2026</p>
            <p className="text-[10px] text-[#D09515] font-semibold">Performance Goal</p>
          </div>

        </div>

      </div>

      {/* INTERACTIVE CONTROLS BAR: VIEW TABS & SUBJECT FILTERS */}
      <div className="bg-white rounded-3xl border border-[#061F48]/10 p-4 md:p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        
        {/* Module Filter Tabs */}
        <div className="flex bg-[#F8F5ED] p-1.5 rounded-2xl border border-[#061F48]/10 gap-1 overflow-x-auto w-full md:w-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#061F48] text-white shadow-md'
                : 'text-[#061F48]/70 hover:bg-[#061F48]/5'
            }`}
          >
            All Overview
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('milestones')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'milestones'
                ? 'bg-[#061F48] text-white shadow-md'
                : 'text-[#061F48]/70 hover:bg-[#061F48]/5'
            }`}
          >
            <Compass className="h-3.5 w-3.5 text-[#D09515]" />
            <span>Upcoming Milestones</span>
            <span className="text-[9px] bg-white/20 px-1.5 py-0.2 rounded-full">
              {progressData.milestones.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'assignments'
                ? 'bg-[#061F48] text-white shadow-md'
                : 'text-[#061F48]/70 hover:bg-[#061F48]/5'
            }`}
          >
            <FileCheck className="h-3.5 w-3.5 text-emerald-600" />
            <span>Completed Assignments</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-bold">
              {progressData.completedAssignments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('revisions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'revisions'
                ? 'bg-[#061F48] text-white shadow-md'
                : 'text-[#061F48]/70 hover:bg-[#061F48]/5'
            }`}
          >
            <RotateCcw className="h-3.5 w-3.5 text-amber-600" />
            <span>Pending Revisions</span>
            {pendingRevisionsCount > 0 && (
              <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded-full font-black animate-pulse">
                {pendingRevisionsCount}
              </span>
            )}
          </button>
        </div>

        {/* Subject Filter Pills & Add Quick Actions */}
        <div className="flex items-center gap-2 flex-wrap w-full md:w-auto justify-end">
          <div className="flex items-center gap-1 bg-[#F8F5ED] px-2.5 py-1.5 rounded-xl border border-[#061F48]/10 overflow-x-auto scrollbar-none">
            <Filter className="h-3.5 w-3.5 text-[#061F48]/40 shrink-0" />
            {subjectsList.map(subj => (
              <button
                key={subj}
                onClick={() => setSelectedSubject(subj)}
                className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedSubject === subj
                    ? 'bg-[#061F48] text-white shadow-xs'
                    : 'text-[#061F48]/60 hover:text-[#061F48]'
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsAddMilestoneModalOpen(true)}
            className="bg-[#D09515] hover:bg-[#061F48] hover:text-white text-[#061F48] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs cursor-pointer"
            title="Create Custom Study Milestone"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Target</span>
          </button>

          <button
            onClick={() => setIsAddAssignmentModalOpen(true)}
            className="bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs cursor-pointer"
            title="Log Completed Assignment Sheet"
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Log Assignment</span>
          </button>
        </div>

      </div>

      {/* SECTION 1: VISUAL PROGRESS PATH ROADMAP (TIMELINE & MILESTONES) */}
      {(activeTab === 'all' || activeTab === 'milestones') && (
        <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#061F48]/10">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 bg-[#D09515]/15 text-[#D09515] px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                <Compass className="h-3 w-3" />
                Chronological Learning Journey
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#061F48]">
                Curriculum Trajectory & Upcoming Milestones
              </h3>
              <p className="text-xs text-[#061F48]/65 font-medium">
                Step-by-step progression through foundational theory, problem drills, diagnostic benchmarks, and final pre-board simulations.
              </p>
            </div>

            <span className="text-[11px] font-black uppercase text-[#061F48]/60 bg-[#F8F5ED] px-3 py-1.5 rounded-xl border border-[#061F48]/10">
              {filteredMilestones.length} Stages Mapped
            </span>
          </div>

          {/* ROADMAP TIMELINE GRID */}
          <div className="relative pt-4 pb-2">
            
            {/* Connecting Vertical Track on Mobile / Desktop */}
            <div className="absolute left-6 md:left-8 top-6 bottom-6 w-1 bg-gradient-to-b from-emerald-500 via-[#D09515] to-gray-200 rounded-full z-0 hidden sm:block" />

            <div className="space-y-6 relative z-10">
              {filteredMilestones.map((milestone, idx) => {
                const isCompleted = milestone.status === 'Completed';
                const isInProgress = milestone.status === 'In Progress';
                const isLocked = milestone.status === 'Locked';

                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-3xl border transition-all p-5 md:p-6 sm:pl-16 relative ${
                      isCompleted
                        ? 'bg-emerald-50/40 border-emerald-200/80 shadow-xs'
                        : isInProgress
                        ? 'bg-gradient-to-r from-amber-500/5 via-white to-amber-500/10 border-amber-300 shadow-md ring-2 ring-amber-400/20'
                        : isLocked
                        ? 'bg-gray-50/60 border-gray-200 opacity-70'
                        : 'bg-[#F8F5ED] border-[#061F48]/10 hover:border-[#D09515]/40'
                    }`}
                  >
                    {/* Node Dot / Marker Icon */}
                    <div
                      className={`hidden sm:flex absolute left-4 md:left-6 top-6 -translate-x-1/2 h-8 w-8 rounded-full items-center justify-center font-black text-xs border-2 shadow-sm ${
                        isCompleted
                          ? 'bg-emerald-500 text-white border-emerald-600'
                          : isInProgress
                          ? 'bg-[#D09515] text-[#061F48] border-amber-600 animate-pulse'
                          : isLocked
                          ? 'bg-gray-200 text-gray-500 border-gray-300'
                          : 'bg-white text-[#061F48] border-[#061F48]/30'
                      }`}
                    >
                      {isCompleted ? <Check className="h-4 w-4 stroke-[3]" /> : milestone.phaseNumber}
                    </div>

                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      
                      <div className="space-y-2 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-md tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : isInProgress
                                ? 'bg-amber-100 text-amber-900 border border-amber-300 animate-pulse'
                                : isLocked
                                ? 'bg-gray-100 text-gray-600'
                                : 'bg-blue-50 text-blue-800 border border-blue-200'
                            }`}
                          >
                            Phase {milestone.phaseNumber} • {milestone.status}
                          </span>

                          <span className="text-[9px] font-black uppercase text-[#061F48] bg-[#061F48]/5 px-2 py-0.5 rounded border border-[#061F48]/10">
                            {milestone.subjectFocus}
                          </span>

                          <span className="text-[10px] font-bold text-gray-500 flex items-center gap-1">
                            <Calendar className="h-3 w-3 text-gray-400" />
                            Target: {milestone.targetDate}
                          </span>

                          {milestone.unlockedBadge && (
                            <span className="text-[9px] font-black uppercase text-amber-800 bg-amber-100/70 border border-amber-300 px-2 py-0.5 rounded flex items-center gap-1">
                              <Award className="h-3 w-3 text-amber-600" />
                              {milestone.unlockedBadge}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base md:text-lg font-black text-[#061F48]">
                          {milestone.title}
                        </h4>

                        <p className="text-xs text-[#061F48]/75 font-medium leading-relaxed max-w-3xl">
                          {milestone.description}
                        </p>

                        {/* Deliverables checklist */}
                        <div className="pt-2">
                          <span className="text-[9px] font-black uppercase text-[#061F48]/50 tracking-wider block mb-1.5">
                            Key Phase Deliverables:
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {milestone.keyDeliverables.map((del, dIdx) => (
                              <div
                                key={dIdx}
                                className="text-[11px] font-semibold text-[#061F48]/80 bg-white/80 border border-[#061F48]/5 p-2 rounded-xl flex items-center gap-2"
                              >
                                <CheckCircle2 className={`h-3.5 w-3.5 shrink-0 ${isCompleted ? 'text-emerald-600' : isInProgress ? 'text-[#D09515]' : 'text-gray-400'}`} />
                                <span className="line-clamp-1">{del}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Milestone Actions & Progress Indicator */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end gap-3 shrink-0 w-full lg:w-48 pt-2 lg:pt-0">
                        
                        <div className="w-full text-right space-y-1">
                          <div className="flex justify-between text-[10px] font-black text-[#061F48]">
                            <span>Completion</span>
                            <span>{milestone.progressPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full transition-all duration-500 ${
                                isCompleted
                                  ? 'bg-emerald-500'
                                  : isInProgress
                                  ? 'bg-[#D09515]'
                                  : 'bg-gray-300'
                              }`}
                              style={{ width: `${milestone.progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        <div className="flex gap-2 w-full">
                          <button
                            type="button"
                            onClick={() => handleToggleMilestone(milestone.id)}
                            className={`flex-grow py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs ${
                              isCompleted
                                ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800 border border-emerald-300'
                                : 'bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48]'
                            }`}
                          >
                            {isCompleted ? (
                              <>
                                <Check className="h-3 w-3" />
                                <span>Mastered</span>
                              </>
                            ) : (
                              <>
                                <CheckSquare className="h-3 w-3" />
                                <span>Mark Cleared</span>
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedMilestone(milestone)}
                            className="bg-white hover:bg-[#F8F5ED] border border-[#061F48]/15 text-[#061F48] p-2 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                            title="View Full Milestone Details"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>

        </div>
      )}

      {/* SECTION 2: COMPLETED ASSIGNMENTS LOG */}
      {(activeTab === 'all' || activeTab === 'assignments') && (
        <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#061F48]/10">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                <FileCheck className="h-3 w-3 text-emerald-600" />
                Verified Submissions Portfolio
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#061F48]">
                Completed Assignments & Mentor Scorecards
              </h3>
              <p className="text-xs text-[#061F48]/65 font-medium">
                Detailed breakdowns of submitted homework sets, chapter tests, numerical drills, and teacher feedback remarks.
              </p>
            </div>

            <button
              onClick={() => setIsAddAssignmentModalOpen(true)}
              className="bg-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer shadow-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Submit Assignment</span>
            </button>
          </div>

          {/* ASSIGNMENTS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg, idx) => (
              <motion.div
                key={asg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="bg-[#F8F5ED] border border-[#061F48]/10 hover:border-[#D09515]/40 rounded-3xl p-5 md:p-6 space-y-4 shadow-xs transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] font-black uppercase bg-[#061F48] text-white px-2 py-0.5 rounded">
                          {asg.subject}
                        </span>
                        <span className="text-[9px] font-bold text-gray-500">
                          {asg.submittedAt}
                        </span>
                        {asg.status === 'Exemplary' && (
                          <span className="text-[8.5px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300 flex items-center gap-1">
                            <Sparkles className="h-2.5 w-2.5 text-emerald-600" />
                            Exemplary 95%+
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm md:text-base font-black text-[#061F48] leading-snug">
                        {asg.title}
                      </h4>
                      <p className="text-[11px] text-[#061F48]/60 font-semibold">
                        Topic: {asg.chapterTopic}
                      </p>
                    </div>

                    {/* Score Badge */}
                    <div className="bg-white border border-[#061F48]/10 p-2.5 rounded-2xl text-center shrink-0 min-w-[70px] shadow-xs">
                      <span className="text-base font-black text-[#061F48] block">
                        {asg.score}
                      </span>
                      <span className="text-[9px] font-extrabold text-emerald-700 block">
                        {asg.percentage}% Marks
                      </span>
                    </div>
                  </div>

                  {/* Mentor Remarks Callout */}
                  <div className="bg-white/80 border border-[#061F48]/5 p-3 rounded-2xl space-y-1 text-left">
                    <div className="flex justify-between items-center text-[9px] font-black text-[#061F48]/50 uppercase">
                      <span>Mentor Feedback</span>
                      <span>{asg.gradedBy}</span>
                    </div>
                    <p className="text-[11.5px] text-[#061F48]/80 font-medium italic">
                      "{asg.mentorFeedback}"
                    </p>
                  </div>

                  {/* Key Strengths Pills */}
                  {asg.keyStrengths && asg.keyStrengths.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      <span className="text-[8.5px] font-black uppercase text-emerald-800">Strengths:</span>
                      {asg.keyStrengths.map((str, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[9.5px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-md"
                        >
                          ✓ {str}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card Bottom CTA */}
                <div className="pt-3 border-t border-[#061F48]/5 flex items-center justify-between gap-2">
                  <span className="text-[9.5px] font-bold text-gray-500">
                    Graded & Verified by CME Faculty
                  </span>

                  <button
                    type="button"
                    onClick={() => setActiveSolutionModal(asg)}
                    className="bg-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <BookOpen className="h-3 w-3" />
                    <span>View Solution Sheet</span>
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      )}

      {/* SECTION 3: PENDING TEST REVISIONS QUEUE */}
      {(activeTab === 'all' || activeTab === 'revisions') && (
        <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#061F48]/10">
            <div className="space-y-0.5">
              <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">
                <RotateCcw className="h-3 w-3 text-amber-600" />
                Targeted Remediation Queue
              </div>
              <h3 className="text-xl md:text-2xl font-black text-[#061F48]">
                Pending Test Revisions & Weak Spot Drills
              </h3>
              <p className="text-xs text-[#061F48]/65 font-medium">
                Targeted corrections identified from Sunday tests and chapter quizzes to eliminate recurring formula and conceptual errors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase text-amber-800 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                {pendingRevisionsCount} Pending Fixes
              </span>
            </div>
          </div>

          {filteredRevisions.length === 0 ? (
            <div className="bg-[#F8F5ED] border border-dashed border-[#061F48]/20 p-8 rounded-3xl text-center space-y-2">
              <CheckCircle2 className="h-10 w-10 text-emerald-500 mx-auto" />
              <h4 className="text-base font-black text-[#061F48]">Zero Pending Revisions!</h4>
              <p className="text-xs text-[#061F48]/60 font-semibold max-w-md mx-auto">
                You have mastered all previously flagged concepts across your Sunday exams and diagnostic tests. Great work!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRevisions.map((rev, idx) => {
                const isMastered = rev.revisionStatus === 'Mastered';
                const isHigh = rev.priority === 'High';

                return (
                  <motion.div
                    key={rev.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`rounded-3xl border p-5 md:p-6 transition-all ${
                      isMastered
                        ? 'bg-emerald-50/50 border-emerald-200 opacity-75'
                        : isHigh
                        ? 'bg-gradient-to-r from-red-500/5 via-amber-500/5 to-white border-red-200 shadow-sm'
                        : 'bg-[#F8F5ED] border-[#061F48]/10'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      
                      <div className="space-y-2.5 flex-grow">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded tracking-wider ${
                              isHigh
                                ? 'bg-red-100 text-red-800 border border-red-300'
                                : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                          >
                            {rev.priority} Priority Remediation
                          </span>

                          <span className="text-[9px] font-black uppercase bg-[#061F48] text-white px-2 py-0.5 rounded">
                            {rev.subject}
                          </span>

                          <span className="text-[10px] font-bold text-gray-500">
                            Test: {rev.initialScore} • Due: {rev.dueDate}
                          </span>

                          {isMastered && (
                            <span className="text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded border border-emerald-300">
                              ✓ Mastered on {rev.revisedAt || 'Today'}
                            </span>
                          )}
                        </div>

                        <h4 className="text-base font-black text-[#061F48]">
                          {rev.testTitle}
                        </h4>

                        {/* Flagged Concepts */}
                        <div className="space-y-1">
                          <span className="text-[9px] font-black uppercase text-red-700 tracking-wider block">
                            Flagged Mistakes To Correct:
                          </span>
                          <div className="space-y-1">
                            {rev.flaggedConcepts.map((fc, fIdx) => (
                              <div
                                key={fIdx}
                                className="text-[11px] font-semibold text-red-900 bg-red-50/80 border border-red-100 p-2 rounded-xl flex items-start gap-2"
                              >
                                <AlertTriangle className="h-3.5 w-3.5 text-red-600 shrink-0 mt-0.5" />
                                <span>{fc}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Formula Checklist */}
                        {rev.formulaChecklist && rev.formulaChecklist.length > 0 && (
                          <div className="space-y-1 pt-1">
                            <span className="text-[9px] font-black uppercase text-[#061F48]/50 tracking-wider block">
                              Required Formula Blueprint:
                            </span>
                            <div className="flex flex-wrap gap-2">
                              {rev.formulaChecklist.map((formula, fIdx) => (
                                <span
                                  key={fIdx}
                                  className="text-[10.5px] font-mono font-bold bg-white border border-[#061F48]/15 text-[#061F48] px-2.5 py-1 rounded-lg"
                                >
                                  {formula}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col sm:flex-row lg:flex-col gap-2 shrink-0 w-full lg:w-44 pt-2 lg:pt-0">
                        <button
                          type="button"
                          onClick={() => setActiveRevisionDrillModal(rev)}
                          className="w-full bg-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] text-white py-2.5 px-3 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                        >
                          <BookOpen className="h-3.5 w-3.5" />
                          <span>Start Revision Drill</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleMarkRevisionMastered(rev.id)}
                          className={`w-full py-2 px-3 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            isMastered
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-300'
                          }`}
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>{isMastered ? 'Mastered' : 'Mark as Mastered'}</span>
                        </button>
                      </div>

                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

        </div>
      )}

      {/* MODAL 1: MILESTONE DETAIL VIEW */}
      <AnimatePresence>
        {selectedMilestone && (
          <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase bg-[#061F48] text-white px-2.5 py-0.5 rounded-full tracking-wider">
                    Phase {selectedMilestone.phaseNumber} Details
                  </span>
                  <h4 className="text-xl font-black text-[#061F48]">
                    {selectedMilestone.title}
                  </h4>
                </div>

                <button
                  onClick={() => setSelectedMilestone(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs text-[#061F48]">
                <div className="bg-[#F8F5ED] p-4 rounded-2xl space-y-2 border border-[#061F48]/10">
                  <p className="font-semibold text-gray-700 leading-relaxed">
                    {selectedMilestone.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold pt-2 border-t border-[#061F48]/10">
                    <div>
                      <span className="text-gray-400 block uppercase">Target Date</span>
                      <span className="text-[#061F48]">{selectedMilestone.targetDate}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 block uppercase">Subject Scope</span>
                      <span className="text-[#061F48]">{selectedMilestone.subjectFocus}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/60">
                    Checklist Deliverables:
                  </span>
                  <div className="space-y-1.5">
                    {selectedMilestone.keyDeliverables.map((del, i) => (
                      <div
                        key={i}
                        className="bg-white border border-[#061F48]/10 p-2.5 rounded-xl flex items-center gap-2 font-medium"
                      >
                        <CheckCircle2 className="h-4 w-4 text-[#D09515] shrink-0" />
                        <span>{del}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    handleToggleMilestone(selectedMilestone.id);
                    setSelectedMilestone(null);
                  }}
                  className="flex-grow bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  {selectedMilestone.status === 'Completed' ? 'Mark In Progress' : 'Mark Phase As Completed'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMilestone(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 2: ASSIGNMENT SOLUTION SHEET MODAL */}
      <AnimatePresence>
        {activeSolutionModal && (
          <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-2xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black uppercase bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                      Official Graded Solution Sheet
                    </span>
                    <span className="text-[10px] font-bold text-gray-500">
                      Score: {activeSolutionModal.score}
                    </span>
                  </div>
                  <h4 className="text-xl font-black text-[#061F48]">
                    {activeSolutionModal.title}
                  </h4>
                </div>

                <button
                  onClick={() => setActiveSolutionModal(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Sample Model Answer Breakdown */}
              <div className="space-y-4">
                <div className="bg-[#F8F5ED] p-4 rounded-2xl space-y-2 border border-[#061F48]/10">
                  <span className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block">
                    Teacher Evaluation Notes:
                  </span>
                  <p className="text-xs font-semibold text-[#061F48] leading-relaxed">
                    {activeSolutionModal.mentorFeedback}
                  </p>
                </div>

                <div className="bg-slate-900 text-white p-5 rounded-2xl font-mono text-xs space-y-2 leading-relaxed">
                  <span className="text-[#D09515] text-[10px] uppercase font-bold block">
                    Model Step Derivation / Solution Key:
                  </span>
                  <p className="text-slate-300">
                    Step 1: Write given values with standard SI units.<br />
                    Step 2: State core governing theorem: Formula = (ΔE / h) = ν.<br />
                    Step 3: Substitute given parameters carefully without premature rounding.<br />
                    Step 4: Box final calculated result with correct dimensions.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveSolutionModal(null)}
                className="w-full bg-[#061F48] hover:bg-[#D09515] hover:text-[#061F48] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
              >
                Close Solution Viewer
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 3: REVISION DRILL SANDBOX MODAL */}
      <AnimatePresence>
        {activeRevisionDrillModal && (
          <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-xl w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase bg-amber-500 text-white px-2.5 py-0.5 rounded-full tracking-wider">
                    Interactive Revision Drill
                  </span>
                  <h4 className="text-lg md:text-xl font-black text-[#061F48]">
                    {activeRevisionDrillModal.testTitle}
                  </h4>
                </div>

                <button
                  onClick={() => setActiveRevisionDrillModal(null)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                    Recommended Remediation Strategy:
                  </span>
                  <p className="font-semibold text-amber-950 leading-relaxed">
                    {activeRevisionDrillModal.recommendedAction}
                  </p>
                </div>

                <div className="bg-[#F8F5ED] border border-[#061F48]/10 p-4 rounded-2xl space-y-2">
                  <span className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block">
                    Core Formulae to Memorize:
                  </span>
                  <div className="space-y-1.5">
                    {activeRevisionDrillModal.formulaChecklist.map((form, i) => (
                      <div key={i} className="bg-white p-2 rounded-lg font-mono text-xs font-bold text-[#061F48] border border-[#061F48]/5">
                        • {form}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleMarkRevisionMastered(activeRevisionDrillModal.id)}
                  className="flex-grow bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                >
                  ✓ Mark As Mastered
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRevisionDrillModal(null)}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 4: CREATE CUSTOM MILESTONE */}
      <AnimatePresence>
        {isAddMilestoneModalOpen && (
          <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xl font-black text-[#061F48]">Create Custom Milestone Goal</h4>
                  <p className="text-xs text-[#061F48]/60 font-semibold">
                    Add a personalized study target to your curriculum roadmap.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddMilestoneModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateMilestone} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                    Milestone Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                    placeholder="e.g. Master Optics Ray Diagrams & Lens Formula"
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Subject
                    </label>
                    <select
                      value={newMilestoneSubject}
                      onChange={(e) => setNewMilestoneSubject(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    >
                      {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Target Date
                    </label>
                    <input
                      type="text"
                      value={newMilestoneDate}
                      onChange={(e) => setNewMilestoneDate(e.target.value)}
                      placeholder="e.g. 15 Sep 2026"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                    Description & Objectives
                  </label>
                  <textarea
                    rows={2}
                    value={newMilestoneDesc}
                    onChange={(e) => setNewMilestoneDesc(e.target.value)}
                    placeholder="Briefly state what you intend to accomplish..."
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2 rounded-xl font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                    Key Deliverables (one per line)
                  </label>
                  <textarea
                    rows={2}
                    value={newMilestoneDeliverables}
                    onChange={(e) => setNewMilestoneDeliverables(e.target.value)}
                    placeholder="Solve 20 NCERT questions&#10;Complete formula flashcard test"
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2 rounded-xl font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    Save Milestone to Path
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddMilestoneModalOpen(false)}
                    className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL 5: LOG COMPLETED ASSIGNMENT */}
      <AnimatePresence>
        {isAddAssignmentModalOpen && (
          <div className="fixed inset-0 bg-[#061F48]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2rem] border border-[#061F48]/15 max-w-lg w-full p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden"
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h4 className="text-xl font-black text-[#061F48]">Log Completed Assignment</h4>
                  <p className="text-xs text-[#061F48]/60 font-semibold">
                    Record your score and submission details into your student desk.
                  </p>
                </div>
                <button
                  onClick={() => setIsAddAssignmentModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-700 bg-gray-100 rounded-xl"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateAssignment} className="space-y-4 text-xs">
                <div>
                  <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    required
                    value={newAssignmentTitle}
                    onChange={(e) => setNewAssignmentTitle(e.target.value)}
                    placeholder="e.g. Chapter 3 Derivations Practice Sheet"
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Subject
                    </label>
                    <select
                      value={newAssignmentSubject}
                      onChange={(e) => setNewAssignmentSubject(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    >
                      {['Physics', 'Chemistry', 'Mathematics', 'Biology', 'Science'].map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Chapter / Topic
                    </label>
                    <input
                      type="text"
                      value={newAssignmentChapter}
                      onChange={(e) => setNewAssignmentChapter(e.target.value)}
                      placeholder="e.g. Wave Optics"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Marks Scored
                    </label>
                    <input
                      type="number"
                      value={newAssignmentScore}
                      onChange={(e) => setNewAssignmentScore(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                      Total Max Marks
                    </label>
                    <input
                      type="number"
                      value={newAssignmentMaxScore}
                      onChange={(e) => setNewAssignmentMaxScore(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2.5 rounded-xl font-bold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider block mb-1">
                    Evaluator Remarks
                  </label>
                  <input
                    type="text"
                    value={newAssignmentFeedback}
                    onChange={(e) => setNewAssignmentFeedback(e.target.value)}
                    placeholder="e.g. Neat presentation, good step execution."
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-3.5 py-2 rounded-xl font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-grow bg-[#061F48] hover:bg-[#D09515] text-white hover:text-[#061F48] py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer"
                  >
                    Log to Portfolio
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddAssignmentModalOpen(false)}
                    className="bg-gray-100 text-gray-700 px-5 py-3 rounded-xl text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
