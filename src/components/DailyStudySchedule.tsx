import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Clock, 
  Calendar, 
  Plus, 
  CheckCircle, 
  CheckSquare, 
  Square, 
  Trash2, 
  Video, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Bell, 
  AlertCircle,
  Award
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

interface StudentProfile {
  id: string;
  name: string;
  studentClass: string;
}

interface ScheduleSlot {
  subject: string;
  time: string;
  teacher: string;
  platform?: string;
}

interface DailyStudyScheduleProps {
  profile: StudentProfile;
  schedules: ScheduleSlot[];
  liveMeetings: any[];
  onJoinClassroom: (meetingId: string) => void;
  getCurriculumData: (cls: string) => any[];
}

interface PersonalReminder {
  id: string;
  studentId: string;
  subject: string;
  topic: string;
  date: string;
  time: string;
  goal: string;
  notes?: string;
  isCompleted: boolean;
  createdAt: string;
}

export default function DailyStudySchedule({
  profile,
  schedules,
  liveMeetings,
  onJoinClassroom,
  getCurriculumData
}: DailyStudyScheduleProps) {
  const { addToast } = useToast();
  
  // Tab control: 'classes' vs 'reminders'
  const [activeTab, setActiveTab] = useState<'classes' | 'reminders'>('classes');
  
  // Reminders state
  const [reminders, setReminders] = useState<PersonalReminder[]>([]);
  
  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [customTopic, setCustomTopic] = useState('');
  const [reminderDate, setReminderDate] = useState(new Date().toISOString().split('T')[0]);
  const [reminderTime, setReminderTime] = useState('18:00');
  const [studyGoal, setStudyGoal] = useState('NCERT Chapter Reading');
  const [reminderNotes, setReminderNotes] = useState('');

  // Curriculum data for drop downs
  const curriculum = (profile?.studentClass ? getCurriculumData(profile.studentClass) : []) || [];
  const subjects = (curriculum || []).map(c => c?.subject).filter(Boolean);

  // Load reminders on mount
  useEffect(() => {
    if (profile && profile.id) {
      const saved = localStorage.getItem(`cme_study_reminders_${profile.id}`);
      if (saved) {
        try {
          setReminders(JSON.parse(saved) || []);
        } catch (e) {
          console.error('Error parsing saved reminders:', e);
        }
      } else {
        // Seed initial reminder so the dashboard is not completely blank initially
        const initialReminders: PersonalReminder[] = [
          {
            id: 'seed_rem_1',
            studentId: profile.id,
            subject: subjects[0] || 'Mathematics',
            topic: curriculum[0]?.chapters?.[0]?.title || 'Standard Concept Review',
            date: new Date().toISOString().split('T')[0],
            time: '17:00',
            goal: 'NCERT Back Exercises',
            notes: 'Revise formulas & solve back exercise questions.',
            isCompleted: false,
            createdAt: new Date().toISOString()
          }
        ];
        setReminders(initialReminders);
        localStorage.setItem(`cme_study_reminders_${profile.id}`, JSON.stringify(initialReminders));
      }
    }
  }, [profile?.id, profile?.studentClass]);

  // Sync reminders to localStorage
  const saveReminders = (updated: PersonalReminder[]) => {
    setReminders(updated);
    if (profile && profile.id) {
      localStorage.setItem(`cme_study_reminders_${profile.id}`, JSON.stringify(updated));
    }
  };

  // Set default subject on tab change / initialization
  useEffect(() => {
    if ((subjects || []).length > 0 && !selectedSubject) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  // Set default topic when subject changes
  useEffect(() => {
    if (selectedSubject) {
      const subObj = (curriculum || []).find(c => c?.subject === selectedSubject);
      if (subObj && subObj.chapters && (subObj.chapters || []).length > 0) {
        setSelectedTopic(subObj.chapters[0].title);
      } else {
        setSelectedTopic('Other (Custom Topic)');
      }
    }
  }, [selectedSubject, profile?.studentClass]);

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    
    const finalTopic = selectedTopic === 'Other (Custom Topic)' ? customTopic : selectedTopic;
    if (!selectedSubject || !finalTopic) {
      addToast({
        title: 'Form incomplete',
        description: 'Please select a subject and specify a topic.',
        type: 'error'
      });
      return;
    }

    const newReminder: PersonalReminder = {
      id: 'rem_' + Math.random().toString(36).substring(2, 9),
      studentId: profile.id,
      subject: selectedSubject,
      topic: finalTopic,
      date: reminderDate,
      time: reminderTime,
      goal: studyGoal,
      notes: reminderNotes,
      isCompleted: false,
      createdAt: new Date().toISOString()
    };

    const updated = [newReminder, ...reminders];
    saveReminders(updated);
    
    // Reset form
    setShowAddForm(false);
    setCustomTopic('');
    setReminderNotes('');
    
    addToast({
      title: 'Study Reminder Set',
      description: `Goal scheduled for ${reminderDate} at ${reminderTime}.`,
      type: 'success'
    });
  };

  const toggleReminderComplete = (id: string) => {
    const updated = reminders.map(r => {
      if (r.id === id) {
        const nextState = !r.isCompleted;
        if (nextState) {
          addToast({
            title: 'Goal Mastered! 🎉',
            description: `Excellent focus! You finished: "${r.topic}"`,
            type: 'success'
          });
        }
        return { ...r, isCompleted: nextState };
      }
      return r;
    });
    saveReminders(updated);
  };

  const handleDeleteReminder = (id: string) => {
    const updated = reminders.filter(r => r.id !== id);
    saveReminders(updated);
    addToast({
      title: 'Reminder Removed',
      description: 'Your study reminder has been cleared from your schedule.',
      type: 'info'
    });
  };

  // Get filtered chapters for selected subject
  const currentSubjectObj = curriculum.find(c => c.subject === selectedSubject);
  const chaptersList = currentSubjectObj?.chapters || [];

  // Filter today's reminders vs upcoming
  const todayStr = new Date().toISOString().split('T')[0];
  const todayReminders = (reminders || []).filter(r => r && r.date === todayStr);
  const completedToday = (todayReminders || []).filter(r => r && r.isCompleted).length;
  const totalToday = (todayReminders || []).length;
  const completionPercentage = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm flex flex-col justify-between space-y-5 h-full min-h-[500px]">
      
      {/* Header with Title & Tabs */}
      <div className="space-y-4 shrink-0">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#061F48]/5 pb-4">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 bg-[#F8F5ED] text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/20">
              <Calendar className="h-3.5 w-3.5 text-[#D09515]" />
              <span className="text-[9px] font-black uppercase tracking-wider">Academic Planner</span>
            </div>
            <h3 className="text-base md:text-lg font-black text-[#061F48]">Daily Study Schedule</h3>
            <p className="text-[10px] text-[#061F48]/60 font-semibold leading-relaxed">
              Track interactive board lectures and schedule customized focus intervals.
            </p>
          </div>

          {/* Elegant Navigation Tabs */}
          <div className="flex bg-[#F8F5ED] border border-[#061F48]/10 p-1 rounded-xl shrink-0 self-stretch sm:self-auto">
            <button
              onClick={() => {
                setActiveTab('classes');
                setShowAddForm(false);
              }}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 ${activeTab === 'classes' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
            >
              <Video className="h-3.5 w-3.5" />
              <span>Live Batches</span>
            </button>
            <button
              onClick={() => setActiveTab('reminders')}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center gap-1.5 relative ${activeTab === 'reminders' ? 'bg-[#061F48] text-white shadow-sm' : 'text-[#061F48]/60 hover:text-[#061F48]'}`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>Study Reminders</span>
              {(reminders || []).filter(r => r && !r.isCompleted).length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black h-4 w-4 rounded-full flex items-center justify-center border border-white">
                  {(reminders || []).filter(r => r && !r.isCompleted).length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Reminders Completion Progress Bar (Visible in Reminders Tab) */}
        {activeTab === 'reminders' && totalToday > 0 && !showAddForm && (
          <motion.div 
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#F8F5ED] border border-[#D09515]/10 p-3 rounded-xl flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-[#D09515] shrink-0" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black text-[#061F48] uppercase tracking-wider">Today's Focus Streak</p>
                <p className="text-[9px] text-[#061F48]/60 font-semibold">{completedToday} of {totalToday} personal study goals completed</p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <span className="text-xs font-black text-[#061F48]">{completionPercentage}%</span>
              <div className="w-20 bg-gray-200 h-2 rounded-full overflow-hidden border border-[#061F48]/5">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-500" 
                  style={{ width: `${completionPercentage}%` }} 
                />
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-grow overflow-y-auto max-h-[16.5rem] pr-1 scrollbar-none min-h-[220px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: LIVE CLASSES */}
          {activeTab === 'classes' && (
            <motion.div
              key="classes-list"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-3"
            >
              {(schedules || []).length === 0 ? (
                <div className="text-center py-8 text-[#061F48]/40">No batch lectures scheduled.</div>
              ) : (
                (schedules || []).map((slot, idx) => {
                  const liveClass = (liveMeetings || []).find(
                    (m: any) => m?.teacherName === slot?.teacher && m?.studentClass === profile?.studentClass
                  );
                  const isLive = !!liveClass;

                  return (
                    <div 
                      key={idx} 
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 ${isLive ? 'bg-amber-50/40 border-[#D09515] shadow-sm ring-1 ring-[#D09515]/30' : 'bg-[#F8F5ED] border-[#061F48]/5 hover:border-[#061F48]/10'}`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-xs font-black text-[#061F48] leading-tight">{slot?.subject}</p>
                            {isLive && (
                              <span className="inline-flex items-center px-1.5 py-0.2 rounded bg-red-100 text-red-800 text-[8px] font-black animate-pulse">
                                LIVE
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-[#061F48]/60 font-semibold flex items-center gap-1 mt-0.5">
                            <Clock className="h-3 w-3 text-[#D09515]" />
                            {slot?.time}
                          </p>
                        </div>
                        
                        <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded border ${isLive ? 'bg-red-50 text-red-700 border-red-200' : 'bg-[#061F48]/5 text-[#061F48]/70 border-[#061F48]/10'}`}>
                          {isLive ? '🔴 Active' : 'Scheduled'}
                        </span>
                      </div>

                      <div className="flex justify-between items-center border-t border-[#061F48]/5 pt-2 text-[10px] text-[#061F48]/60">
                        <span className="font-semibold text-[10.5px]">Mentor: <strong className="text-[#061F48]">{slot?.teacher}</strong></span>
                        <button
                          onClick={() => {
                            if (isLive && liveClass?.id) {
                              onJoinClassroom(liveClass.id);
                            } else {
                              const mockMeetingId = `lobby_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
                              const newClass = {
                                id: mockMeetingId,
                                subject: slot?.subject || 'Live Session',
                                teacherName: slot?.teacher || 'Faculty Mentor',
                                studentClass: profile?.studentClass || '10',
                                startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                whiteboardText: `Welcome to Class ${profile?.studentClass || '10'} - ${slot?.subject || 'Subject'} session!\n\nToday's Key Theorems:\n1. Standard formulas & proofs\n2. Solved NCERT Board Examples\n\n[Status: Mentor is joining shortly. Feel free to draft whiteboard notes or test your camera!]`,
                                currentSlide: 0,
                                chatMessages: [
                                  { sender: slot?.teacher || 'Faculty Mentor', text: `Welcome to the live lobby! Camera/Mic diagnostics are active.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
                                ],
                                participants: [slot?.teacher || 'Faculty Mentor']
                              };

                              const currentActiveListRaw = localStorage.getItem('cme_active_classes');
                              const list = currentActiveListRaw ? JSON.parse(currentActiveListRaw) : [];
                              const updatedList = [newClass, ...list.filter((c: any) => c.teacherName !== slot?.teacher)];
                              localStorage.setItem('cme_active_classes', JSON.stringify(updatedList));

                              onJoinClassroom(mockMeetingId);
                            }
                          }}
                          className={`px-2.5 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 ${isLive ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-[#061F48] hover:bg-[#D09515] text-white'}`}
                        >
                          <Video className="h-3 w-3" />
                          <span>{isLive ? 'Enter Room' : 'Join Lobby'}</span>
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* TAB 2: REMINDERS */}
          {activeTab === 'reminders' && !showAddForm && (
            <motion.div
              key="reminders-list"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-3"
            >
              {(reminders || []).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-2">
                  <div className="h-10 w-10 bg-[#061F48]/5 rounded-full flex items-center justify-center text-[#061F48]/30">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <h4 className="text-xs font-black text-[#061F48]">No study reminders yet</h4>
                  <p className="text-[10px] text-[#061F48]/50 max-w-xs font-semibold leading-relaxed">
                    Set targeted study schedules for board preparation chapters on physics, maths, and chemistry.
                  </p>
                </div>
              ) : (
                (reminders || []).map((rem) => {
                  const isToday = rem.date === todayStr;

                  return (
                    <div 
                      key={rem.id} 
                      className={`p-3.5 rounded-xl border transition-all flex items-start gap-3.5 ${rem.isCompleted ? 'bg-emerald-50/10 border-emerald-200/50 opacity-75' : 'bg-[#F8F5ED] border-[#061F48]/5 hover:border-[#061F48]/10'}`}
                    >
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleReminderComplete(rem.id)}
                        className="mt-1 flex-shrink-0 transition-transform active:scale-95 text-[#061F48]"
                      >
                        {rem.isCompleted ? (
                          <CheckSquare className="h-5 w-5 text-emerald-600" />
                        ) : (
                          <Square className="h-5 w-5 text-[#061F48]/30 hover:text-[#061F48]" />
                        )}
                      </button>

                      {/* Info */}
                      <div className="flex-grow space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[8px] font-black uppercase text-[#D09515] tracking-wider">
                            {rem.subject}
                          </span>
                          <span className="text-[8px] font-black uppercase bg-[#061F48]/5 text-[#061F48] px-1.5 rounded">
                            {rem.goal}
                          </span>
                          {isToday && (
                            <span className="text-[8px] font-black uppercase text-emerald-600">
                              • Today
                            </span>
                          )}
                        </div>

                        <h4 className={`text-xs font-bold leading-normal ${rem.isCompleted ? 'text-gray-400 line-through' : 'text-[#061F48]'}`}>
                          {rem.topic}
                        </h4>

                        {rem.notes && (
                          <p className="text-[9.5px] text-[#061F48]/60 font-semibold italic">
                            "{rem.notes}"
                          </p>
                        )}

                        <div className="flex items-center gap-2.5 text-[9px] text-[#061F48]/50 font-bold pt-1">
                          <span className="flex items-center gap-0.5">
                            <Calendar className="h-2.5 w-2.5" />
                            {rem.date}
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="h-2.5 w-2.5" />
                            {rem.time}
                          </span>
                        </div>
                      </div>

                      {/* Delete */}
                      <button
                        onClick={() => handleDeleteReminder(rem.id)}
                        className="p-1 rounded-lg hover:bg-red-50 text-[#061F48]/30 hover:text-red-500 transition-colors flex-shrink-0"
                        title="Remove Reminder"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
            </motion.div>
          )}

          {/* ADD REMINDER FORM INLINE */}
          {activeTab === 'reminders' && showAddForm && (
            <motion.form
              key="reminder-form"
              onSubmit={handleAddReminder}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3 bg-[#F8F5ED] p-4 rounded-xl border border-[#061F48]/5 text-left"
            >
              <div className="flex justify-between items-center pb-2 border-b border-[#061F48]/5 mb-1.5">
                <span className="text-[9.5px] font-black uppercase tracking-widest text-[#061F48] flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-[#D09515]" />
                  Plan Study Slot
                </span>
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="text-[9px] font-bold text-[#061F48]/50 hover:text-[#061F48]"
                >
                  Cancel
                </button>
              </div>

              {/* Grid 1: Subject & Topic */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Subject</label>
                  <select
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  >
                    {subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Topic / Chapter</label>
                  <select
                    value={selectedTopic}
                    onChange={(e) => setSelectedTopic(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  >
                    {chaptersList.map(ch => (
                      <option key={ch.id} value={ch.title}>{ch.title}</option>
                    ))}
                    <option value="Other (Custom Topic)">Other (Custom Topic)</option>
                  </select>
                </div>
              </div>

              {/* Custom Topic Input if selected */}
              {selectedTopic === 'Other (Custom Topic)' && (
                <div className="space-y-1 animate-fade-in">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Specify Topic Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter custom topic name..."
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2.5 py-1.5 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  />
                </div>
              )}

              {/* Grid 2: Date, Time & Goal Type */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Target Date</label>
                  <input
                    type="date"
                    required
                    value={reminderDate}
                    onChange={(e) => setReminderDate(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Schedule Time</label>
                  <input
                    type="time"
                    required
                    value={reminderTime}
                    onChange={(e) => setReminderTime(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Study Goal Type</label>
                  <select
                    value={studyGoal}
                    onChange={(e) => setStudyGoal(e.target.value)}
                    className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2 py-1 rounded-lg text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                  >
                    <option value="NCERT Chapter Reading">NCERT Reading</option>
                    <option value="NCERT Back Exercises">Back Exercises</option>
                    <option value="Formula Memorization">Formula Memorization</option>
                    <option value="Solving Previous Qs">Solving PYQs</option>
                    <option value="Re-watching Lecture">Re-watching Lecture</option>
                    <option value="Doubt Clearing Session">Doubt Clearing</option>
                  </select>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1">
                <label className="text-[9px] font-black text-[#061F48] uppercase tracking-wider block">Short Target Note</label>
                <input
                  type="text"
                  placeholder="e.g. solve 10 numericals, read page 45-60"
                  value={reminderNotes}
                  onChange={(e) => setReminderNotes(e.target.value)}
                  className="w-full bg-white border border-[#061F48]/15 text-[#061F48] px-2.5 py-1.5 rounded-lg text-[11px] font-semibold focus:outline-none focus:ring-1 focus:ring-[#061F48]"
                />
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors shadow-sm mt-2"
              >
                Schedule Study Goal
              </button>
            </motion.form>
          )}

        </AnimatePresence>
      </div>

      {/* Footer / CTA Actions */}
      <div className="pt-3 border-t border-[#061F48]/5 shrink-0 flex items-center justify-between gap-4">
        {activeTab === 'reminders' && !showAddForm ? (
          <button
            onClick={() => setShowAddForm(true)}
            className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Add Study Goal</span>
          </button>
        ) : activeTab === 'classes' ? (
          <div className="w-full text-center text-[9.5px] font-bold text-[#061F48]/50 flex items-center justify-center gap-1">
            <AlertCircle className="h-3.5 w-3.5 text-[#D09515] shrink-0" />
            <span>Live meeting spaces open automatically when mentors activate the stream.</span>
          </div>
        ) : (
          <div className="w-full text-center text-[9.5px] font-bold text-[#061F48]/50">
            💡 Mapping self-study topics to curriculum chapters helps keep board-preparation tracking precise.
          </div>
        )}
      </div>

    </div>
  );
}
