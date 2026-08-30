import { CME_LAUNCH_AT } from '../lib/launchConfig';
import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Award, 
  BookOpen, 
  Clock, 
  Video, 
  ChevronRight, 
  Sparkles,
  TrendingUp,
  BarChart3,
  LineChart as LineIcon,
  RotateCcw,
  ListOrdered,
  CalendarDays,
  Target,
  Play,
  History,
  VideoOff,
  X,
  CreditCard,
  CheckCircle,
  Download,
  ShieldCheck,
  MessageSquare
} from 'lucide-react';
import { db, collection, query, where, getDocs } from '../lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { generatePaymentReceiptPDF, generateStudentMonthlyReportPDF } from '../lib/receiptGenerator';
import { useToast } from '../context/ToastContext';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import ExamCountdown from './ExamCountdown';
import StudentCalendar from './StudentCalendar';
import DailyStudySchedule from './DailyStudySchedule';
import DragAndDropStudyPlanner from './DragAndDropStudyPlanner';
import ProgressPathVisualizer from './ProgressPathVisualizer';

interface StudentProfile {
  name: string;
  studentClass: string;
  stream?: string;
  id?: string;
  rollNumber?: string;
  referredBy?: string;
  aadhaarVerifiedAt?: string | null;
  isPaid?: boolean;
}

interface TestScore {
  date: string;
  score: number;
  total: number;
  subject: string;
}

interface StudentDashboardProps {
  profile: StudentProfile;
  completedChapters: Record<string, boolean>;
  liveMeetings: any[];
  onJoinClassroom: (meetingId: string) => void;
  getSchedulesForClass: (cls: string) => any[];
  getCurriculumData: (cls: string) => any[];
  testScores?: TestScore[];
  onResetScores?: () => void;
  onOpenFeedback?: (subject: string, score: { correct: number; total: number }) => void;
}

export default function StudentDashboard({
  profile,
  completedChapters,
  liveMeetings,
  onJoinClassroom,
  getSchedulesForClass,
  getCurriculumData,
  testScores = [],
  onResetScores,
  onOpenFeedback
}: StudentDashboardProps) {
  const { addToast } = useToast();
  
  // Recording State & Replay States
  const [recordings, setRecordings] = useState<any[]>([]);
  const [loadingRecordings, setLoadingRecordings] = useState(false);
  const [selectedRecording, setSelectedRecording] = useState<any | null>(null);


  useEffect(() => {
    const fetchRecordings = async () => {
      setLoadingRecordings(true);
      try {
        const q = query(
          collection(db, 'recorded_sessions'),
          where('studentClass', '==', profile.studentClass)
        );
        const snapshot = await getDocs(q);
        const launchCutoff = CME_LAUNCH_AT;
        const docs = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() } as any))
          .filter((recording: any) => new Date(recording.recordedAt || 0).getTime() >= launchCutoff);
        
        const localRaw = localStorage.getItem('cme_recorded_sessions');
        let localRecs: any[] = [];
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) localRecs = parsed;
          } catch (e) {
            localRecs = [];
          }
        }
        const filteredLocal = (localRecs || []).filter(
          (r: any) =>
            r &&
            r.studentClass === profile.studentClass &&
            new Date(r.recordedAt || 0).getTime() >= launchCutoff
        );
        
        const merged: any[] = [...docs];
        filteredLocal.forEach((localItem: any) => {
          if (!merged.some(m => m.id === localItem.id)) {
            merged.push(localItem);
          }
        });
        (merged || []).sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
        setRecordings(merged);
      } catch (err) {
        console.error("Error fetching recorded sessions:", err);
        const localRaw = localStorage.getItem('cme_recorded_sessions');
        let localRecs: any[] = [];
        if (localRaw) {
          try {
            const parsed = JSON.parse(localRaw);
            if (Array.isArray(parsed)) localRecs = parsed;
          } catch (e) {
            localRecs = [];
          }
        }
        const launchCutoff = CME_LAUNCH_AT;
        const filteredLocal = (localRecs || []).filter(
          (r: any) =>
            r &&
            r.studentClass === profile.studentClass &&
            new Date(r.recordedAt || 0).getTime() >= launchCutoff
        );
        
        if ((filteredLocal || []).length === 0) {
          setRecordings([]);
        } else {
          (filteredLocal || []).sort((a: any, b: any) => new Date(b.recordedAt).getTime() - new Date(a.recordedAt).getTime());
          setRecordings(filteredLocal);
        }
      } finally {
        setLoadingRecordings(false);
      }
    };
    
    if (profile?.studentClass) {
      fetchRecordings();
    }

    const handleUpdate = () => {
      if (profile?.studentClass) {
        fetchRecordings();
      }
    };

    window.addEventListener('cme_lecture_added', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('cme_lecture_added', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [profile?.studentClass]);

  const handleDownloadDashboardReceipt = () => {
    const studentName = profile.name || 'Student Learner';
    const studentClass = profile.studentClass || '10';
    const rollNumber = profile.rollNumber || 'CME-2026-PENDING';
    const isReferred = !!profile.referredBy;
    const finalPrice = isReferred ? '₹4,499' : '₹4,999';
    const discount = isReferred ? '₹500 Referral Discount' : undefined;

    const paymentDateStr = profile.aadhaarVerifiedAt 
      ? new Date(profile.aadhaarVerifiedAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        })
      : new Date().toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true
        });

    const receiptNo = `CME-ADM-${profile.id ? profile.id.slice(-5).toUpperCase() : 'REG'}`;
    const transactionId = `pay_ADM_${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

    generatePaymentReceiptPDF({
      receiptNo,
      date: paymentDateStr,
      studentName,
      studentClass,
      rollNumber,
      courseTitle: `Official CME Admission & Course Fee (Class ${studentClass} Enrollment)`,
      amount: finalPrice,
      paymentMethod: 'Netbanking / UPI Secure',
      transactionId,
      discountApplied: discount
    });
  };

  const handleDownloadMonthlyReport = () => {
    const studentName = profile.name || 'Student Learner';
    const studentClass = profile.studentClass || '10';
    const rollNumber = profile.rollNumber || `CME-2026-${(profile.id || 'REG').slice(-4).toUpperCase()}`;

    const date = new Date();
    const monthYear = date.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

    const subjectScoresList = (subjectAverages || []).length > 0 
      ? subjectAverages.map(s => ({
          subject: s.subject,
          scorePercent: Math.min(100, Math.round((s.score / 3) * 100)),
          remarks: s.score >= 2.5 ? 'Excellent conceptual mastery' : 'Good steady progress'
        }))
      : [];;
  const completedAssignmentsList: any[] = [];


    generateStudentMonthlyReportPDF({
      studentName,
      studentClass,
      rollNumber,
      monthYear,
      attendancePercentage: 0,
      totalClassesAttended: 0,
      totalClassesHeld: 0,
      monthlyPerformanceScore: 0,
      overallGrade: 'No recorded result',
      subjectScores: subjectScoresList,
      completedAssignments: completedAssignmentsList,
      teacherRemarks: 'This report contains only verified records available in the system.'
    });

    addToast({
      title: 'Monthly Performance Report Downloaded 📄',
      description: `Official PDF assessment report generated for ${studentName}.`,
      type: 'success'
    });
  };

  // Tab selector for Recharts view: 'trend' (AreaChart) vs 'subject' (BarChart)
  const [chartTab, setChartTab] = useState<'trend' | 'subject'>('trend');

  // Calculate curriculum stats
  const curriculum = getCurriculumData ? getCurriculumData(profile?.studentClass || '10') : [];
  const totalChapters = (curriculum || []).reduce((acc, sub) => acc + (sub?.chapters?.length || 0), 0);
  
  // Count completed chapters belonging to this student's current curriculum
  let completedCount = 0;
  const subjectProgress = (curriculum || []).map(sub => {
    const subTotal = sub?.chapters?.length || 0;
    const subDone = (sub?.chapters || []).filter(ch => (completedChapters || {})[ch?.id]).length;
    completedCount += subDone;
    return {
      subject: sub?.subject || '',
      total: subTotal,
      completed: subDone,
      percentage: subTotal > 0 ? Math.round((subDone / subTotal) * 100) : 0
    };
  });

  const percentage = totalChapters > 0 ? Math.round((completedCount / totalChapters) * 100) : 0;

  // SVG Circular progress configurations
  const radius = 50;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  // Get schedules for student class
  const schedules = getSchedulesForClass ? getSchedulesForClass(profile?.studentClass || '10') : [];

  // Compute subject-wise average score for BarChart
  const subjectAverages = useMemo(() => {
    const totals: Record<string, { sum: number; count: number }> = {};
    (testScores || []).forEach(s => {
      if (!totals[s.subject]) {
        totals[s.subject] = { sum: 0, count: 0 };
      }
      totals[s.subject].sum += s.score;
      totals[s.subject].count += 1;
    });

    return Object.entries(totals).map(([subject, data]) => ({
      subject,
      score: Math.round((data.sum / data.count) * 10) / 10,
      count: data.count
    }));
  }, [testScores]);

  // Quick Action: Scroll to curriculum section
  const scrollToCurriculum = () => {
    const el = document.getElementById('student-academics-card');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      const headers = Array.from(document.querySelectorAll('h3'));
      const currHeader = headers.find(h => h.textContent?.includes('NCERT Curriculum'));
      if (currHeader) {
        currHeader.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  // Custom tooltip for premium chart aesthetics
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && (payload || []).length) {
      const data = payload[0]?.payload || {};
      return (
        <div className="bg-white border border-[#061F48]/15 p-3 rounded-2xl shadow-xl text-xs font-bold text-[#061F48]">
          <p className="text-gray-400 font-black text-[9px] uppercase tracking-wider mb-1">
            {data.date ? `Date: ${data.date}` : `Subject: ${data.subject}`}
          </p>
          <div className="space-y-0.5">
            <p className="flex items-center gap-1.5 font-black text-[#061F48] text-[11px]">
              <span className="w-2 h-2 rounded-full bg-[#061F48]"></span>
              Score: {payload[0].value} / 3
            </p>
            {data.subject && data.date && (
              <p className="text-[#D09515] font-extrabold text-[10px]">
                {data.subject} Drill
              </p>
            )}
            {data.count && (
              <p className="text-[#D09515] font-extrabold text-[10px]">
                Based on {data.count} quizzes
              </p>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* REAL-TIME EXAM COUNTDOWN CENTERPIECE */}
      <div>
        <ExamCountdown />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* CARD 1: OVERALL SYLLABUS SYNC & CIRCULAR PROGRESS PROGRESS (lg:col-span-6) */}
        <div className="lg:col-span-6 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Subtle background abstract circles */}
          <div className="absolute top-0 right-0 pointer-events-none opacity-5 translate-x-12 -translate-y-12">
            <div className="w-64 h-64 rounded-full border-4 border-[#061F48]"></div>
          </div>

          {/* Card Header */}
          <div className="flex items-center justify-between border-b border-[#061F48]/5 pb-4 shrink-0">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 text-[#061F48] px-2.5 py-0.5 rounded-full border border-[#061F48]/10">
                <TrendingUp className="h-3.5 w-3.5 text-[#D09515]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Board Prep Index</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-[#061F48]">Syllabus Mastery Index</h3>
            </div>
            <span className="text-xs font-bold text-[#061F48]/60">
              {completedCount} / {totalChapters} Chapters
            </span>
          </div>

          {/* Progress Grid Body */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center flex-grow">
            
            {/* Circular SVG Progress Display (Left/Top) */}
            <div className="sm:col-span-5 flex flex-col items-center justify-center space-y-3">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                  {/* Underlay Circle */}
                  <circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="#F8F5ED"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                  />
                  {/* Active Progress Circle */}
                  <motion.circle
                    cx="60"
                    cy="60"
                    r={radius}
                    stroke="url(#progressGradient)"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                    strokeLinecap="round"
                  />
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#061F48" />
                      <stop offset="100%" stopColor="#D09515" />
                    </linearGradient>
                  </defs>
                </svg>
                
                {/* Inner Text Center */}
                <div className="absolute text-center space-y-0.5">
                  <span className="text-2xl md:text-3xl font-black text-[#061F48] block tracking-tighter">
                    {percentage}%
                  </span>
                  <span className="text-[8.5px] font-bold text-[#061F48]/50 uppercase tracking-widest block">
                    Mastered
                  </span>
                </div>
              </div>

              {/* Micro Rating Legend */}
              <p className="text-[10px] text-center font-bold text-[#061F48]/60 max-w-[120px]">
                {percentage >= 90 ? "🏆 Board Topper Rank!" : percentage >= 50 ? "🚀 Steady Board Prep!" : "📚 Start mastering chapters below!"}
              </p>
            </div>

            {/* Subject-wise linear list (Right/Bottom) */}
            <div className="sm:col-span-7 space-y-4">
              <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-widest block">
                Individual Subject Standings
              </span>
              <div className="space-y-3.5">
                {(subjectProgress || []).map((sub, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between items-center text-[10.5px] font-black text-[#061F48]">
                      <span className="flex items-center gap-1.5">
                        <BookOpen className="h-3.5 w-3.5 text-[#D09515]" />
                        {sub.subject}
                      </span>
                      <span className="text-[#061F48]/70">{sub.completed}/{sub.total} Ch ({sub.percentage}%)</span>
                    </div>
                    {/* Linear Bar */}
                    <div className="h-2 bg-[#F8F5ED] rounded-full overflow-hidden border border-[#061F48]/5">
                      <motion.div 
                        className="h-full rounded-full bg-gradient-to-r from-[#061F48] to-[#D09515]"
                        initial={{ width: 0 }}
                        animate={{ width: `${sub.percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Action Redirection Link */}
          <div className="pt-4 border-t border-[#061F48]/5 shrink-0 flex justify-between items-center">
            <p className="text-[10.5px] text-[#061F48]/60 font-semibold">
              Marking off chapters automatically recalculates your real-time Board readiness score.
            </p>
            <button
              onClick={scrollToCurriculum}
              className="text-[10px] font-black text-[#D09515] hover:text-[#061F48] uppercase tracking-wider flex items-center gap-1 shrink-0 transition-colors"
            >
              <span>Update Checklist</span>
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* CARD 2: DAILY STUDY SCHEDULE COMPONENT (lg:col-span-6) */}
        <div className="lg:col-span-6">
          <DailyStudySchedule
            profile={{
              id: profile.id || 'anonymous',
              name: profile.name,
              studentClass: profile.studentClass
            }}
            schedules={schedules}
            liveMeetings={liveMeetings}
            onJoinClassroom={onJoinClassroom}
            getCurriculumData={getCurriculumData}
          />
        </div>

      </div>

      {/* DRAG AND DROP DAILY REVISION & LECTURE WATCH TIME STUDY PLANNER */}
      <DragAndDropStudyPlanner
        studentProfile={{
          id: profile.id || 'anonymous',
          name: profile.name,
          studentClass: profile.studentClass
        }}
      />

      {/* INTERACTIVE MONTHLY CALENDAR PORTLET */}
      <StudentCalendar profile={profile} schedules={schedules} />

      {/* PROGRESS PATH VISUALIZER: UPCOMING MILESTONES, COMPLETED ASSIGNMENTS, PENDING TEST REVISIONS */}
      <ProgressPathVisualizer
        profile={{
          name: profile.name,
          studentClass: profile.studentClass,
          stream: profile.stream,
          id: profile.id,
          rollNumber: profile.rollNumber
        }}
        onOpenTestFeedback={onOpenFeedback}
      />

      {/* NEW BENTO GRID ROW: CHARTS & TEST SCORE HISTORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* ANALYTICS CARD: PERSONALIZED PROGRESS CHARTS (lg:col-span-7) */}
        <div className="lg:col-span-7 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-6">
          
          {/* Header & Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#061F48]/5 pb-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/20">
                <Target className="h-3.5 w-3.5 text-[#D09515]" />
                <span className="text-[9px] font-black uppercase tracking-wider">Concept Analytics</span>
              </div>
              <h3 className="text-base md:text-lg font-black text-[#061F48]">Interactive Progress Analytics</h3>
            </div>

            {/* Toggle tabs */}
            <div className="flex bg-[#F8F5ED] border border-[#061F48]/10 p-1 rounded-xl">
              <button
                onClick={() => setChartTab('trend')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${chartTab === 'trend' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
              >
                <LineIcon className="h-3 w-3" />
                <span>Score Trend</span>
              </button>
              <button
                onClick={() => setChartTab('subject')}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center gap-1 ${chartTab === 'subject' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
              >
                <BarChart3 className="h-3 w-3" />
                <span>Subject Standings</span>
              </button>
            </div>
          </div>

          {/* Chart Wrapper Container */}
          <div className="flex-grow w-full h-[240px] flex items-center justify-center bg-[#F8F5ED]/30 rounded-2xl border border-[#061F48]/5 p-3 relative">
            {(testScores || []).length === 0 ? (
              <div className="text-center p-6 space-y-2">
                <div className="h-10 w-10 bg-[#061F48]/5 rounded-full flex items-center justify-center text-[#061F48]/40 mx-auto">
                  <BarChart3 className="h-5 w-5" />
                </div>
                <p className="text-xs font-black text-[#061F48]/60 uppercase">No drill history loaded</p>
                <p className="text-[10px] text-[#061F48]/40 max-w-[200px] mx-auto leading-relaxed">
                  Start or finish an interactive topic quick test below to plot your learning curves!
                </p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                {chartTab === 'trend' ? (
                  /* AREA CHART FOR SCORE TREND */
                  <AreaChart
                    data={testScores}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#061F48" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#061F48" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#061F48/5" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      stroke="#061F48" 
                      opacity={0.4} 
                      fontSize={9} 
                      tickLine={false}
                      fontWeight="bold"
                    />
                    <YAxis 
                      domain={[0, 3]} 
                      ticks={[0, 1, 2, 3]} 
                      stroke="#061F48" 
                      opacity={0.4} 
                      fontSize={9} 
                      tickLine={false}
                      fontWeight="bold"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#061F48', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#061F48" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorScore)" 
                      activeDot={{ r: 6, stroke: '#FFFFFF', strokeWidth: 2, fill: '#D09515' }}
                    />
                  </AreaChart>
                ) : (
                  /* BAR CHART FOR SUBJECT BREAKDOWN */
                  <BarChart
                    data={subjectAverages}
                    margin={{ top: 10, right: 10, left: -25, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#061F48/5" vertical={false} />
                    <XAxis 
                      dataKey="subject" 
                      stroke="#061F48" 
                      opacity={0.4} 
                      fontSize={9} 
                      tickLine={false}
                      fontWeight="bold"
                    />
                    <YAxis 
                      domain={[0, 3]} 
                      ticks={[0, 1, 2, 3]} 
                      stroke="#061F48" 
                      opacity={0.4} 
                      fontSize={9} 
                      tickLine={false}
                      fontWeight="bold"
                    />
                    <Tooltip content={<CustomTooltip />} cursor={false} />
                    <Bar 
                      dataKey="score" 
                      radius={[8, 8, 0, 0]} 
                      barSize={40}
                    >
                      {(subjectAverages || []).map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={index % 2 === 0 ? "#061F48" : "#D09515"} 
                        />
                      ))}
                    </Bar>
                  </BarChart>
                )}
              </ResponsiveContainer>
            )}
          </div>

          {/* Chart footer detail */}
          <div className="pt-2 border-t border-[#061F48]/5 flex justify-between items-center text-[10.5px] font-semibold text-[#061F48]/60">
            <span>Graph represents raw brain drills (scaled out of 3 maximum marks).</span>
            {(testScores || []).length > 0 && onResetScores && (
              <button
                onClick={onResetScores}
                className="text-[10px] font-black uppercase text-red-500 hover:text-red-700 tracking-wider flex items-center gap-1 transition-colors"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset History</span>
              </button>
            )}
          </div>

        </div>

        {/* CARD 2: RECENTLY COMPLETED TEST SCORES (lg:col-span-5) */}
        <div className="lg:col-span-5 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-5">
          
          {/* Card Header */}
          <div className="space-y-1 pb-3 border-b border-[#061F48]/5 shrink-0">
            <div className="inline-flex items-center space-x-1.5 bg-[#D09515]/10 text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/25">
              <ListOrdered className="h-3.5 w-3.5" />
              <span className="text-[9px] font-black uppercase tracking-wider">Log Ledger</span>
            </div>
            <h3 className="text-base font-black text-[#061F48]">Recent Brain Drill Performance</h3>
            <p className="text-[10px] text-[#061F48]/60 font-semibold leading-relaxed">
              Your chronological report card for completed MCQ tests and evaluation sprints.
            </p>
          </div>

          {/* Score List Container */}
          <div className="space-y-3 max-h-[16.5rem] overflow-y-auto pr-1 flex-grow scrollbar-none">
            {(testScores || []).length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-1">
                <Award className="h-8 w-8 text-[#061F48]/15" />
                <p className="text-xs font-bold text-[#061F48]/60">No Evaluated Logs Yet</p>
                <p className="text-[9.5px] text-[#061F48]/40 max-w-[180px]">
                  Finish any daily test below to generate your official performance tags!
                </p>
              </div>
            ) : (
              [...testScores].reverse().map((drill, idx) => {
                const isPerfect = drill.score === 3;
                const isStrong = drill.score === 2;
                
                return (
                  <div 
                    key={idx}
                    className="p-3 bg-[#F8F5ED] border border-[#061F48]/5 rounded-xl hover:border-[#061F48]/10 transition-all flex justify-between items-center"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-[#061F48]" />
                        <span className="text-[11px] font-black text-[#061F48]">{drill.subject}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] font-bold text-gray-400">
                        <CalendarDays className="h-3 w-3 text-[#D09515]" />
                        <span>{drill.date}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {/* Score Fraction Badge */}
                      <span className="text-xs font-black text-[#061F48] bg-white border border-[#061F48]/10 px-2 py-1 rounded-lg">
                        {drill.score} / {drill.total}
                      </span>

                      {/* Status Tag */}
                      <span className={`text-[8.5px] font-black uppercase px-2 py-0.5 rounded ${isPerfect ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : isStrong ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                        {isPerfect ? 'Perfect' : isStrong ? 'Strong' : 'Needs Revise'}
                      </span>

                      {/* Rate Questions Button */}
                      {onOpenFeedback && (
                        <button
                          onClick={() => onOpenFeedback(drill.subject, { correct: drill.score, total: drill.total })}
                          title="Rate Questions & Report Issues"
                          className="p-1.5 rounded-lg bg-white hover:bg-[#061F48] hover:text-white border border-[#061F48]/10 text-[#061F48]/80 transition-all text-[9.5px] font-bold flex items-center gap-1 shadow-2xs"
                        >
                          <MessageSquare className="h-3 w-3 text-[#D09515]" />
                          <span className="hidden sm:inline">Rate</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Stats Banner */}
          <div className="pt-2.5 border-t border-[#061F48]/5 shrink-0 text-center text-[10px] font-bold text-[#061F48]/50 flex items-center justify-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
            <span>Mastering chapters raises your standard confidence index!</span>
          </div>

        </div>

      </div>

      {/* MY ACADEMIC PROGRAMS & COURSE SUBSCRIPTION LEDGER */}
      <div id="programs-ledger-section" className="mt-8 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/25">
              <CreditCard className="h-3.5 w-3.5 text-[#D09515]" />
              <span className="text-[9px] font-black uppercase tracking-wider">Academic Enrollment Ledger</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-[#061F48] mt-2">My Enrolled Programs & Fee Ledger</h3>
            <p className="text-xs text-[#061F48]/60 font-bold">
              View your current active course enrollment details, verified credentials, and download your tax-invoice tuition fee receipts.
            </p>
          </div>
          
          <span className="text-xs font-black uppercase px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Enrollment Verified</span>
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Active Course Subscription Details */}
          <div className="lg:col-span-7 bg-[#F8F5ED]/50 border border-[#061F48]/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[8.5px] font-black uppercase bg-[#061F48] text-white px-2.5 py-1 rounded shadow-sm inline-block">
                Primary Board Prep Coaching Program
              </span>
              
              <div className="space-y-1">
                <h4 className="text-base font-black text-[#061F48]">
                  Class {profile.studentClass}th Standard Premium Conceptual Board Coaching Package
                </h4>
                <p className="text-xs text-[#061F48]/75 font-semibold">
                  Comprehensive 1-year academic coaching mapping full CBSE syllabus, Board Exams preparation, and advanced competitive entrance foundations.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                <div className="bg-white p-3 rounded-xl border border-[#061F48]/5">
                  <span className="text-[8.5px] text-gray-400 font-bold uppercase block">Roll Number</span>
                  <span className="text-xs font-black text-[#061F48]">{profile.rollNumber || 'CME-ADM-PENDING'}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#061F48]/5">
                  <span className="text-[8.5px] text-gray-400 font-bold uppercase block">Subjects Included</span>
                  <span className="text-xs font-black text-[#061F48]">Physics, Maths, Biology</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-[#061F48]/5">
                  <span className="text-[8.5px] text-gray-400 font-bold uppercase block">Support Status</span>
                  <span className="text-xs font-black text-emerald-700 flex items-center gap-1">
                    <CheckCircle className="h-3 w-3 shrink-0" />
                    <span>Active 24/7</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#061F48]/5 text-[10.5px] font-semibold text-[#061F48]/50 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-[#D09515]" />
              <span>Enrollment is protected under CME digital registration compliance act.</span>
            </div>
          </div>

          {/* Financial Invoice details */}
          <div className="lg:col-span-5 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <span className="text-[8.5px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-1 rounded shadow-sm inline-block border border-amber-200">
                Transaction Ledger Reference
              </span>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs font-bold border-b border-[#061F48]/5 pb-2">
                  <span className="text-gray-400">Total Program Tuition Fees:</span>
                  <span className="text-[#061F48] font-black">₹4,999</span>
                </div>
                
                {profile.referredBy && (
                  <div className="flex justify-between items-center text-xs font-bold border-b border-[#061F48]/5 pb-2">
                    <span className="text-emerald-700">Referral Discount Applied:</span>
                    <span className="text-emerald-700 font-black">-₹500</span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm font-black border-b border-[#061F48]/5 pb-2">
                  <span className="text-[#061F48]">Amount Paid:</span>
                  <span className="text-[#061F48] text-base">{profile.referredBy ? '₹4,499' : '₹4,999'}</span>
                </div>
              </div>

              <div className="text-[10px] text-gray-400 font-bold space-y-1">
                <p>• Verified Channel: direct_upi_qr</p>
                <p>• Compliance standard: GST tax-invoice</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={handleDownloadMonthlyReport}
                className="w-full bg-[#D09515] hover:bg-[#061F48] text-[#061F48] hover:text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Monthly Report (PDF)</span>
              </button>

              <button
                onClick={handleDownloadDashboardReceipt}
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Download className="h-4 w-4" />
                <span>Download Official Fee Receipt (PDF)</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* RECORDED LECTURES ARCHIVE SECTION */}
      <div id="recorded-lectures-section" className="mt-8 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
          <div>
            <div className="inline-flex items-center space-x-1.5 bg-[#061F48]/5 text-[#061F48] px-2.5 py-0.5 rounded-full border border-[#061F48]/10">
              <History className="h-3.5 w-3.5 text-[#D09515]" />
              <span className="text-[9px] font-black uppercase tracking-wider">CME Ledger Replay Database</span>
            </div>
            <h3 className="text-lg md:text-xl font-black text-[#061F48] mt-2">Recorded Interactive Lectures & Snippets</h3>
            <p className="text-xs text-[#061F48]/60 font-bold">
              Missed a session? Click any recorded lecture to launch the CME Replay Simulator. Explore chalk notes and interactive chat history!
            </p>
          </div>
          
          <span className="text-xs font-bold text-[#061F48]/50 bg-[#F8F5ED] px-3 py-1 rounded-lg border border-[#061F48]/5">
            {(recordings || []).length} Recorded Files
          </span>
        </div>

        {(recordings || []).length === 0 ? (
          <div className="text-center py-10 bg-[#F8F5ED] rounded-2xl border border-dashed border-[#061F48]/10 space-y-2">
            <Video className="h-10 w-10 text-[#061F48]/20 mx-auto animate-pulse" />
            <p className="text-xs font-black text-[#061F48]">No recorded sessions synced yet.</p>
            <p className="text-[10px] text-[#061F48]/50 font-semibold">Automatic class record syncs will display here as soon as teachers terminate live classes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {(recordings || []).map((rec) => {
              const dateStr = new Date(rec.recordedAt).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
              const durationMin = Math.round(rec.duration / 60) || 45;
              
              return (
                <div 
                  key={rec.id}
                  className="bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl p-5 hover:border-[#D09515]/50 hover:shadow-md transition-all flex flex-col justify-between gap-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start gap-2">
                      <span className="text-[8.5px] font-black uppercase bg-[#061F48] text-white px-2 py-0.5 rounded shadow-sm">
                        Class {rec.studentClass}th
                      </span>
                      <span className="text-[9.5px] font-bold text-[#061F48]/50">{dateStr}</span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-black text-[#061F48] group-hover:text-[#D09515] transition-colors line-clamp-2">
                        {rec.subject}
                      </h4>
                      <p className="text-[10px] text-[#061F48]/60 font-semibold flex items-center gap-1">
                        <Clock className="h-3 w-3 text-[#D09515]" />
                        Duration: {durationMin} mins ({rec.duration}s captured)
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#061F48]/5 flex justify-between items-center gap-2">
                    <span className="text-[10px] font-black text-[#061F48] truncate">Prof. {rec.teacherName}</span>
                    <button
                      onClick={() => setSelectedRecording(rec)}
                      className="bg-[#061F48] hover:bg-[#D09515] text-white p-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm shrink-0"
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      <span>Replay</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* REPLAY SIMULATOR OVERLAY MODAL */}
      {selectedRecording && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[999] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-[#F8F5ED] w-full max-w-5xl rounded-[2.5rem] border border-[#061F48]/20 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="bg-[#061F48] text-white p-5 md:px-8 flex justify-between items-center border-b border-white/10 shrink-0">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-black uppercase bg-[#D09515] text-[#061F48] px-2 py-0.5 rounded shadow-sm">
                    Replay Mode: Classroom Active Sync
                  </span>
                  <span className="text-[8.5px] font-mono text-white/60">
                    ID: {selectedRecording.id}
                  </span>
                </div>
                <h3 className="text-sm md:text-base font-black text-white">{selectedRecording.subject}</h3>
              </div>
              
              <button 
                onClick={() => setSelectedRecording(null)}
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body (Responsive Layout split) */}
            <div className="p-6 md:p-8 flex-grow overflow-y-auto grid grid-cols-1 lg:grid-cols-12 gap-6 scrollbar-none">
              
              {/* Left Column: Simulated Stream Player (lg:col-span-4) */}
              <div className="lg:col-span-4 space-y-4 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-widest block mb-2">Simulated Live Stream</span>
                  
                  {/* Visual simulated player wrapper */}
                  <div className="bg-black rounded-2xl aspect-video relative overflow-hidden flex flex-col justify-between p-3 border border-[#061F48]/15">
                    {/* Watermark/Flashing active */}
                    <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-[7.5px] font-black uppercase bg-red-500 text-white px-1.5 py-0.2 rounded shadow-sm">
                        REPLAY LIVE
                      </span>
                    </div>

                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 bg-[#061F48]/20">
                      {/* Interactive Video Playback */}
                      {selectedRecording.videoDataUri && selectedRecording.videoDataUri.startsWith('blob:') ? (
                        <video 
                          src={selectedRecording.videoDataUri} 
                          controls 
                          autoPlay 
                          className="w-full h-full object-contain absolute inset-0"
                        />
                      ) : (
                        <div className="space-y-2">
                          <div className="h-12 w-12 rounded-full bg-[#F8F5ED]/10 border border-white/20 flex items-center justify-center mx-auto animate-pulse">
                            <Video className="h-6 w-6 text-[#D09515]" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black text-white">Prof. {selectedRecording.teacherName}</p>
                            <p className="text-[8px] font-bold text-white/50 uppercase tracking-widest">Instructor Audio Channel</p>
                          </div>
                          {/* Live Animated Audio Spectrum */}
                          <div className="flex justify-center items-end gap-1 h-6">
                            {[1, 2, 3, 4, 5, 4, 3, 2, 4, 5, 2, 1].map((h, i) => (
                              <div 
                                key={i} 
                                className="w-0.5 bg-[#D09515] rounded-full" 
                                style={{ height: `${h * 15}%`, animationDelay: `${i * 0.1}s` }} 
                              />
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Overlay */}
                    <div className="z-10 mt-auto flex justify-between items-center w-full bg-gradient-to-t from-black/60 to-transparent p-2 rounded-b-xl">
                      <span className="text-[8px] text-white/80 font-black">Prof. {selectedRecording.teacherName}</span>
                      <span className="text-[8.5px] font-mono text-[#D09515] font-black bg-black/40 px-1.5 py-0.2 rounded">
                        REPLAY SYNCHRONIZED
                      </span>
                    </div>
                  </div>
                </div>

                {/* File Details Cards */}
                <div className="bg-[#061F48]/5 border border-[#061F48]/10 p-4 rounded-2xl space-y-3">
                  <span className="text-[8px] font-black uppercase text-[#061F48]/40 tracking-widest block">Lecture Ledger Credentials</span>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
                    <div className="bg-white p-2 rounded-lg border border-[#061F48]/5">
                      <span className="text-gray-400 block text-[8px] uppercase">Instructor</span>
                      <span className="text-[#061F48]">{selectedRecording.teacherName}</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#061F48]/5">
                      <span className="text-gray-400 block text-[8px] uppercase">Class Target</span>
                      <span className="text-[#061F48]">Class {selectedRecording.studentClass}th</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#061F48]/5">
                      <span className="text-gray-400 block text-[8px] uppercase">Total Duration</span>
                      <span className="text-[#061F48]">{Math.round(selectedRecording.duration / 60) || 45} min ({selectedRecording.duration}s)</span>
                    </div>
                    <div className="bg-white p-2 rounded-lg border border-[#061F48]/5">
                      <span className="text-gray-400 block text-[8px] uppercase">Sync Ledger</span>
                      <span className="text-emerald-700">Verified Secure</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Middle Column: Teacher Chalkboard Notes Snapshot (lg:col-span-5) */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-widest block mb-2">Whiteboard Notes & Derivations</span>
                  <div className="bg-slate-900 border border-[#061F48]/20 p-5 rounded-2xl font-mono text-xs text-white h-[280px] overflow-y-auto leading-relaxed whitespace-pre-wrap select-all relative scrollbar-thin">
                    <span className="absolute top-2 right-2 text-[8px] uppercase font-black tracking-widest bg-emerald-500 text-white px-2 py-0.5 rounded">
                      Chalk Copyable
                    </span>
                    {selectedRecording.whiteboardSnapshot}
                  </div>
                </div>

                <div className="pt-4 text-[9.5px] font-bold text-[#061F48]/60 italic flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-[#D09515] shrink-0" />
                  <span>Highlight & copy equations directly to paste in the Academic solver or your board preparation notebook.</span>
                </div>
              </div>

              {/* Right Column: In-Class Discussion Chat Replay (lg:col-span-3) */}
              <div className="lg:col-span-3 flex flex-col justify-between h-[340px] lg:h-auto">
                <div className="flex-grow flex flex-col">
                  <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-widest block mb-2">Class Chat History</span>
                  <div className="bg-white border border-[#061F48]/10 p-4 rounded-2xl flex-grow overflow-y-auto max-h-[280px] space-y-3 scrollbar-none">
                    {(() => {
                      try {
                        const parsedChat = JSON.parse(selectedRecording?.chatHistoryJson || '[]');
                        if (!Array.isArray(parsedChat) || parsedChat.length === 0) {
                          return (
                            <p className="text-[10px] text-[#061F48]/40 font-bold italic text-center pt-8">No questions asked during this lesson snippet.</p>
                          );
                        }
                        return parsedChat.map((msg: any, i: number) => {
                          const isInstructor = msg.sender === selectedRecording.teacherName;
                          return (
                            <div key={i} className="space-y-0.5">
                              <div className="flex justify-between items-center text-[8px] font-black">
                                <span className={isInstructor ? 'text-[#D09515]' : 'text-[#061F48]'}>
                                  {msg.sender} {isInstructor && '(Mentor)'}
                                </span>
                                <span className="text-gray-300">{msg.time}</span>
                              </div>
                              <p className="text-[10.5px] font-semibold text-gray-700 bg-gray-50 p-2 rounded-lg border border-gray-100 leading-normal">
                                {msg.text}
                              </p>
                            </div>
                          );
                        });
                      } catch (e) {
                        return <p className="text-[10px] text-red-500">Error rendering chat log.</p>;
                      }
                    })()}
                  </div>
                </div>

                <div className="pt-4 shrink-0">
                  <button
                    onClick={() => setSelectedRecording(null)}
                    className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-md"
                  >
                    Finish Review Session
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

    </motion.div>
  );
}
