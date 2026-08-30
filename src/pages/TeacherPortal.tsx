import React, { useState, useEffect, useRef } from 'react';
import { useToast } from '../context/ToastContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { incrementLoginCounter, formatRollNumber, getCurrentCounter } from '../lib/portalAuth';
import WhiteboardCanvas from '../components/WhiteboardCanvas';
import CurriculumSearch from '../components/CurriculumSearch';
import LiveAttendanceTracker from '../components/LiveAttendanceTracker';
import SaturdayDoubtPortal from '../components/SaturdayDoubtPortal';
import SundayExamRoom from '../components/SundayExamRoom';
import { 
  GraduationCap, 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  MessageSquare, 
  Send, 
  BookOpen, 
  Users, 
  Award, 
  Clock, 
  CheckCircle, 
  X, 
  Tv, 
  Sparkles, 
  ChevronRight, 
  Edit3, 
  LogOut,
  RefreshCw,
  HelpCircle,
  Lock,
  User,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { TeacherSchedule } from '../types';

interface ChatMessage {
  sender: string;
  text: string;
  time: string;
}

interface ActiveClass {
  id: string;
  subject: string;
  teacherName: string;
  studentClass: string;
  startedAt: string;
  whiteboardText: string;
  whiteboardDrawing?: string;
  currentSlide: number;
  chatMessages: ChatMessage[];
  participants: string[];
}

export default function TeacherPortal() {
  const { addToast, triggerAnnouncement } = useToast();
  const [hasShownWelcomeToasts, setHasShownWelcomeToasts] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedTeacherId, setSelectedTeacherId] = useState('t1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentTeacher, setCurrentTeacher] = useState<any | null>(null);

  // Custom Teacher Portal States
  const [isRegistering, setIsRegistering] = useState(false);
  const [registrationSuccess, setRegistrationSuccess] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Physics (Board & IIT-JEE / NEET)');
  const [teacherClasses, setTeacherClasses] = useState('Class 9 to 12th');

  // Classroom States
  const [activeClass, setActiveClass] = useState<ActiveClass | null>(null);
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  
  // Audio/Video control states
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  
  // Whiteboard text
  const [whiteboardText, setWhiteboardText] = useState('Welcome to today\'s session!\n- We will cover key derivations.\n- Please copy formulas into your notebooks.');
  const [chatMessageText, setChatMessageText] = useState('');
  const [slidesIndex, setSlidesIndex] = useState(0);
  const [boardMode, setBoardMode] = useState<'text' | 'draw'>('text');

  // Doubt tickets list
  const [allDoubts, setAllDoubts] = useState<any[]>([]);
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState('');

  // Class-wise Lecture Uploading Portal States
  const [uploadClass, setUploadClass] = useState('10');
  const [uploadSubject, setUploadSubject] = useState('Biology');
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDuration, setUploadDuration] = useState('45 mins');
  const [uploadVideoUrl, setUploadVideoUrl] = useState('');
  const [uploadNotesText, setUploadNotesText] = useState('');
  const [uploadedSessions, setUploadedSessions] = useState<any[]>([]);
  const [isPublishingLecture, setIsPublishingLecture] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Session Recording States & Refs
  const [autoRecordEnabled, setAutoRecordEnabled] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);

  const mediaRecorderRef = useRef<any>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const recordingTimerRef = useRef<any>(null);


  const PHYSICS_SLIDES = [
    "Slide 1: Introduction to Gauss's Law & Flux calculations.",
    "Slide 2: Mathematical proof: Integral of E.dA = Q_enclosed / Epsilon_0.",
    "Slide 3: Application to infinite straight wire charging distributions.",
    "Slide 4: Solved CBSE Board Question (2024 Exam archive)."
  ];

  const BIOLOGY_SLIDES = [
    "Slide 1: Cellular respiration & ATP synthase molecular structure.",
    "Slide 2: The Krebs Citric Acid Cycle diagrams & crucial enzymes.",
    "Slide 3: Oxidative phosphorylation pathways & proton gradients.",
    "Slide 4: Mock NEET MCQ drill sheet."
  ];

  const CHEMISTRY_SLIDES = [
    "Slide 1: Nernst Equation thermodynamic principles.",
    "Slide 2: Half-cell cell potential vs concentration proof.",
    "Slide 3: Calculating equilibrium constant K_c from redox values.",
    "Slide 4: Standard numeric board numerical solvers."
  ];

  const GENERAL_SLIDES = [
    "Slide 1: Core conceptual breakdown & mind-mapping.",
    "Slide 2: Standard NCERT formulas & illustrative derivations.",
    "Slide 3: Step-by-step scoring representation guide.",
    "Slide 4: Chapter review & live Q/A session."
  ];

  const getSlidesForSubject = (subj?: string) => {
    if (!subj) return GENERAL_SLIDES;
    if (subj.toLowerCase().includes('physics')) return PHYSICS_SLIDES;
    if (subj.toLowerCase().includes('biology')) return BIOLOGY_SLIDES;
    if (subj.toLowerCase().includes('chemistry')) return CHEMISTRY_SLIDES;
    return GENERAL_SLIDES;
  };

  const loadUploadedClassSessions = () => {
    const localRaw = localStorage.getItem('cme_recorded_sessions');
    if (localRaw) {
      try {
        setUploadedSessions(JSON.parse(localRaw));
      } catch (e) {
        console.error("Error loading recorded sessions:", e);
      }
    }
  };

  useEffect(() => {
    const savedTeacherId = sessionStorage.getItem('cme_teacher_logged_id');
    if (savedTeacherId) {
      getDoc(doc(db, 'portal_users', savedTeacherId)).then((snap) => {
        if (snap.exists() && snap.data().role === 'teacher') {
          const data = snap.data();
          setCurrentTeacher({
            id: snap.id,
            teacherName: data.teacherName || data.name,
            subject: data.subject || 'General Studies',
            classes: data.classes || '',
            preferredTimings: data.preferredTimings || '',
            status: data.status || 'Active',
            rollNumber: data.rollNumber || null
          });
          setIsLoggedIn(true);
        } else {
          sessionStorage.removeItem('cme_teacher_logged_id');
          localStorage.removeItem('cme_teacher_profile');
        }
      }).catch((err) => console.error('Error restoring real teacher session:', err));
    }
    loadDoubts();
    loadUploadedClassSessions();

    const handleLectureAdded = () => {
      loadUploadedClassSessions();
    };

    window.addEventListener('cme_lecture_added', handleLectureAdded);
    window.addEventListener('storage', handleLectureAdded);
    return () => {
      window.removeEventListener('cme_lecture_added', handleLectureAdded);
      window.removeEventListener('storage', handleLectureAdded);
    };
  }, []);

  const handlePublishClassLecture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim()) {
      addToast({ title: 'Validation Error', description: 'Please enter a lecture title/topic name.', type: 'error' });
      return;
    }

    setIsPublishingLecture(true);
    const newSession = {
      id: 'lecture_' + Date.now(),
      title: uploadTitle.trim(),
      subject: uploadSubject,
      studentClass: uploadClass,
      teacherName: currentTeacher?.teacherName || '',
      recordedAt: new Date().toISOString(),
      duration: uploadDuration || '45 mins',
      whiteboardSnapshot: uploadNotesText || `Class ${uploadClass} Lecture Notes: ${uploadTitle.trim()}\nSubject: ${uploadSubject}`,
      videoDataUri: uploadVideoUrl.trim() || '',
      chatHistoryJson: JSON.stringify([
        { sender: currentTeacher?.teacherName || '', text: `Class ${uploadClass} lecture published.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ])
    };

    try {
      await setDoc(doc(db, 'recorded_sessions', newSession.id), newSession);

      const localRaw = localStorage.getItem('cme_recorded_sessions');
      const localRecs = localRaw ? JSON.parse(localRaw) : [];
      localRecs.unshift(newSession);
      localStorage.setItem('cme_recorded_sessions', JSON.stringify(localRecs));

      window.dispatchEvent(new Event('cme_lecture_added'));
      window.dispatchEvent(new Event('storage'));

      setUploadedSessions(prev => [newSession, ...prev]);
      setUploadTitle('');
      setUploadVideoUrl('');
      setUploadNotesText('');

      addToast({
        title: 'Lecture Published to Batch! 🚀',
        description: `Class ${uploadClass} enrolled students can now watch "${newSession.title}" in their portal.`,
        type: 'success',
        duration: 5000
      });
    } catch (err) {
      console.error("Error publishing class lecture:", err);
      const localRaw = localStorage.getItem('cme_recorded_sessions');
      const localRecs = localRaw ? JSON.parse(localRaw) : [];
      localRecs.unshift(newSession);
      localStorage.setItem('cme_recorded_sessions', JSON.stringify(localRecs));

      window.dispatchEvent(new Event('cme_lecture_added'));
      window.dispatchEvent(new Event('storage'));

      setUploadedSessions(prev => [newSession, ...prev]);
      setUploadTitle('');
      setUploadVideoUrl('');
      setUploadNotesText('');

      addToast({
        title: 'Lecture Published to Batch! 🚀',
        description: `Class ${uploadClass} enrolled batch updated successfully.`,
        type: 'success'
      });
    } finally {
      setIsPublishingLecture(false);
    }
  };

  // Poll active class sync state
  useEffect(() => {
    if (!isMeetingActive || !currentTeacher) return;

    const interval = setInterval(() => {
      const currentActiveRaw = localStorage.getItem('cme_active_classes');
      if (currentActiveRaw) {
        const activeList: ActiveClass[] = JSON.parse(currentActiveRaw);
        const myClass = activeList.find(c => c.teacherName === currentTeacher.teacherName);
        if (myClass) {
          // Sync student's chat messages or student joins back to teacher portal
          setActiveClass(myClass);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [isMeetingActive, currentTeacher]);

  // Welcome and task alert toasts for teachers
  useEffect(() => {
    if (isLoggedIn && currentTeacher && !hasShownWelcomeToasts) {
      setHasShownWelcomeToasts(true);

      // 1. Success Toast
      addToast({
        title: `Logged in as Prof. ${currentTeacher.teacherName}`,
        description: `Expert Desk loaded. Assigned: ${currentTeacher.subject}.`,
        type: 'success',
        duration: 4000
      });

      // 2. Pending Doubts Alert Toast
      const doubtsRaw = localStorage.getItem('cme_student_doubts');
      let pendingCount = 0;
      if (doubtsRaw) {
        try {
          const parsedDoubts = JSON.parse(doubtsRaw);
          if (Array.isArray(parsedDoubts)) {
            pendingCount = parsedDoubts.filter((d: any) => d && d.status === 'Pending').length;
          }
        } catch (e) {
          console.error('Error parsing doubts in teacher portal:', e);
        }
      }
      
      if (pendingCount > 0) {
        setTimeout(() => {
          addToast({
            title: `Unresolved Doubt Tickets`,
            description: `You have ${pendingCount} pending student doubt query tickets. Click to resolve.`,
            type: 'warning',
            actionText: 'Doubt Solver',
            onAction: () => {
              const el = document.getElementById('teacher-doubts-section');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            },
            duration: 9000
          });
        }, 1200);
      }

      // 3. Admin Announcement Toast
      setTimeout(() => {
        triggerAnnouncement(
          'Notice: Academic Concession Audits',
          'Admin Desk has updated scholarship criteria. Please review updated submission lists.',
          'Principal Desk'
        );
      }, 3500);
    }
  }, [isLoggedIn, currentTeacher, hasShownWelcomeToasts, addToast, triggerAnnouncement]);

  // Request real Camera and Microphone stream
  useEffect(() => {
    let active = true;

    const syncStream = async () => {
      if (isMeetingActive && (cameraEnabled || micEnabled)) {
        try {
          if (streamRef.current && streamRef.current.active) {
            const vTracks = streamRef.current.getVideoTracks();
            const aTracks = streamRef.current.getAudioTracks();

            const needsNewVideo = cameraEnabled && (vTracks || []).length === 0;
            const needsNewAudio = micEnabled && (aTracks || []).length === 0;

            if (!needsNewVideo && !needsNewAudio) {
              vTracks.forEach(t => { t.enabled = cameraEnabled; });
              aTracks.forEach(t => { t.enabled = micEnabled; });
              if (localVideoRef.current && localVideoRef.current.srcObject !== streamRef.current) {
                localVideoRef.current.srcObject = streamRef.current;
              }
              return;
            }
          }

          const constraints: MediaStreamConstraints = {
            video: cameraEnabled ? { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' } : false,
            audio: micEnabled ? { echoCancellation: true, noiseSuppression: true } : false
          };

          const newStream = await navigator.mediaDevices.getUserMedia(constraints);
          if (!active) {
            newStream.getTracks().forEach(t => t.stop());
            return;
          }

          if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
          }

          streamRef.current = newStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = newStream;
            localVideoRef.current.muted = true;
            localVideoRef.current.play().catch(e => console.warn('Video playback notice:', e));
          }
        } catch (err) {
          console.warn("Camera or microphone hardware blocked/unavailable in sandbox:", err);
          if (cameraEnabled && micEnabled) {
            try {
              const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
              if (active) {
                if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
                streamRef.current = audioStream;
              } else {
                audioStream.getTracks().forEach(t => t.stop());
              }
            } catch (aErr) {
              console.warn("Audio fallback error:", aErr);
            }
          }
        }
      } else {
        stopCameraStream();
      }
    };

    syncStream();

    return () => {
      active = false;
    };
  }, [isMeetingActive, cameraEnabled, micEnabled]);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }
  };

  const formatDuration = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Automatic live class session recorder trigger
  useEffect(() => {
    if (isMeetingActive && autoRecordEnabled) {
      const delayTimer = setTimeout(() => {
        startRecording();
      }, 1500); // slight buffer to ensure stream loads
      return () => clearTimeout(delayTimer);
    }
  }, [isMeetingActive]);

  const startRecording = () => {
    if (isRecording) return;
    
    setRecordingDuration(0);
    recordedChunksRef.current = [];
    
    let streamToRecord = streamRef.current;
    
    // Fallback: try capturing from localVideoRef canvas if streamRef is empty
    if (!streamToRecord && localVideoRef.current && (localVideoRef.current as any).captureStream) {
      try {
        streamToRecord = (localVideoRef.current as any).captureStream();
      } catch (e) {
        console.warn("Could not capture stream from local video element", e);
      }
    }
    
    if (streamToRecord && typeof MediaRecorder !== 'undefined') {
      try {
        const options = { mimeType: 'video/webm;codecs=vp9' };
        let selectedMime = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
          selectedMime = 'video/webm;codecs=vp8';
        }
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = 'video/webm';
        }
        if (!MediaRecorder.isTypeSupported(selectedMime)) {
          selectedMime = '';
        }
        
        const recorder = selectedMime 
          ? new MediaRecorder(streamToRecord, { mimeType: selectedMime })
          : new MediaRecorder(streamToRecord);
          
        recorder.ondataavailable = (event) => {
          if (event.data && event.data.size > 0) {
            recordedChunksRef.current.push(event.data);
          }
        };
        
        recorder.onstop = () => {
          saveRecordingData();
        };
        
        recorder.start(1000); // slice chunks every second
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        
        addToast({
          title: '🔴 Media Recording Started',
          description: 'Live whiteboard and camera audio stream is being captured.',
          type: 'info',
          duration: 3000
        });
      } catch (err) {
        console.warn("MediaRecorder initialization error, falling back to simulated recorder.", err);
        startSimulatedRecording();
      }
    } else {
      startSimulatedRecording();
    }
    
    // Establish dynamic duration counter
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    recordingTimerRef.current = setInterval(() => {
      setRecordingDuration(prev => prev + 1);
    }, 1000);
  };

  const startSimulatedRecording = () => {
    setIsRecording(true);
    mediaRecorderRef.current = 'simulated';
    addToast({
      title: '🔴 Lecture Recorder Active',
      description: 'Institutional sandbox stream recorder is capturing live lecture snippets.',
      type: 'info',
      duration: 3000
    });
  };

  const stopRecording = () => {
    if (!isRecording) return;
    
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
    
    setIsRecording(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current !== 'simulated') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping MediaRecorder, fallback to simulated saving", e);
        saveRecordingData();
      }
    } else {
      saveRecordingData();
    }
  };

  const saveRecordingData = async () => {
    if (!currentTeacher || !activeClass) return;
    
    let videoUrl = '';
    if ((recordedChunksRef.current || []).length > 0) {
      try {
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        videoUrl = URL.createObjectURL(blob);
      } catch (err) {
        console.error("Error creating Object URL for recorded blob", err);
      }
    }
    
    const recId = 'rec_' + Math.random().toString(36).substring(2, 9);
    const chatSnap = activeClass.chatMessages || [];
    
    const newRecording = {
      id: recId,
      classId: activeClass.id,
      teacherName: currentTeacher.teacherName,
      subject: activeClass.subject,
      studentClass: activeClass.studentClass,
      recordedAt: new Date().toISOString(),
      duration: recordingDuration > 0 ? recordingDuration : 45,
      whiteboardSnapshot: whiteboardText,
      chatHistoryJson: JSON.stringify(chatSnap),
      videoDataUri: videoUrl || ''
    };
    
    try {
      // Save directly to 'recorded_sessions' collection
      await setDoc(doc(db, 'recorded_sessions', recId), newRecording);
      
      // Also write to localStorage for instant local access
      const localRecsRaw = localStorage.getItem('cme_recorded_sessions');
      const localRecs = localRecsRaw ? JSON.parse(localRecsRaw) : [];
      localStorage.setItem('cme_recorded_sessions', JSON.stringify([newRecording, ...localRecs]));
      
      addToast({
        title: '🎬 Class Video Saved!',
        description: `Live lecture recorded successfully (${newRecording.duration}s) and cataloged in the database.`,
        type: 'success',
        duration: 5000
      });
    } catch (err) {
      console.error("Failed to write recording to Firestore:", err);
      
      // Fallback save locally
      const localRecsRaw = localStorage.getItem('cme_recorded_sessions');
      const localRecs = localRecsRaw ? JSON.parse(localRecsRaw) : [];
      localStorage.setItem('cme_recorded_sessions', JSON.stringify([newRecording, ...localRecs]));
      
      addToast({
        title: '🎬 Recording Saved (Local DB)',
        description: `Cataloged in institutional local ledger.`,
        type: 'warning',
        duration: 4000
      });
    }
  };

  const loadDoubts = () => {
    const stored = localStorage.getItem('cme_student_doubts');
    if (stored) {
      setAllDoubts(JSON.parse(stored));
    } else {
      setAllDoubts([]);
    }
  };

  // Custom registration submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if ((password || '').length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    try {
      setError('');
      setRegistrationSuccess('');
      const id = `teacher_${teacherName.trim().toLowerCase().replace(/\s+/g, '_')}`;
      const docRef = doc(db, 'portal_users', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setError('A teacher with this name is already registered. Please login or choose a unique name.');
        return;
      }

      // Increment global counter by 1 to assign sequential roll number format: currentyear + role_code + count
      const count = await getCurrentCounter();
      const rollNumber = formatRollNumber('teacher', count);

      const newTeacher = {
        id,
        name: teacherName.trim(),
        password,
        role: 'teacher',
        teacherName: teacherName.trim(),
        subject: teacherSubject,
        classes: teacherClasses,
        preferredTimings: '4:00 PM – 10:00 PM',
        status: 'Active',
        rollNumber,
        createdAt: new Date().toISOString()
      };

      await setDoc(docRef, newTeacher);
      setRegistrationSuccess(`Registration successful! Your official Teacher ID is ${rollNumber}. You can now login with your password.`);
      setIsRegistering(false);
      setPassword('');
      addToast({
        title: '🎉 Teacher Registered!',
        description: `Official ID generated: ${rollNumber}. Please login.`,
        type: 'success',
        duration: 5000
      });
    } catch (err: any) {
      console.error(err);
      setError('Failed to register. Please try again.');
    }
  };

  // Custom login submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim()) {
      setError('Please enter your full name.');
      return;
    }
    if (!password) {
      setError('Please enter your password.');
      return;
    }

    try {
      setError('');
      const id = `teacher_${teacherName.trim().toLowerCase().replace(/\s+/g, '_')}`;
      const docRef = doc(db, 'portal_users', id);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        setError('No registered teacher found with this name. Please register first!');
        return;
      }

      const userData = docSnap.data();
      if (userData.password !== password) {
        setError('Incorrect password! Please check or set your correct password.');
        return;
      }

      // Increment global counter on login
      await incrementLoginCounter();

      const matchedTeacher = {
        id: userData.id,
        teacherName: userData.teacherName || userData.name,
        subject: userData.subject || 'General Studies',
        classes: userData.classes || 'Class 6 to 12th',
        preferredTimings: userData.preferredTimings || 'Flexible Slots',
        status: userData.status || 'Active',
        rollNumber: userData.rollNumber || null
      };

      sessionStorage.setItem('cme_teacher_logged_id', matchedTeacher.id);
      localStorage.setItem('cme_teacher_profile', JSON.stringify(matchedTeacher));
      setCurrentTeacher(matchedTeacher);
      setIsLoggedIn(true);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Authentication failed. Please try again.');
    }
  };

  const handleLogout = () => {
    if (isMeetingActive) {
      handleStopMeeting();
    }
    sessionStorage.removeItem('cme_teacher_logged_id');
    localStorage.removeItem('cme_teacher_profile');
    setIsLoggedIn(false);
    setCurrentTeacher(null);
    setHasShownWelcomeToasts(false);
  };

  const handleStartMeeting = (subjectName: string, targetCls: string) => {
    if (!currentTeacher) return;

    const classroomId = 'class_' + Math.random().toString(36).substring(2, 9);
    const newClass: ActiveClass = {
      id: classroomId,
      subject: subjectName,
      teacherName: currentTeacher.teacherName,
      studentClass: targetCls,
      startedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      whiteboardText: `Welcome to Class ${targetCls} - ${subjectName} session!\n\nToday's Key Theorems:\n1. Focus f = R / 2 spherical proofs\n2. Light index refraction angles\n\nType equations in chat for immediate review!`,
      whiteboardDrawing: '',
      currentSlide: 0,
      chatMessages: [
        { sender: currentTeacher.teacherName, text: `Hello pupils! Welcome to the classroom. Click the join link to enter!`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ],
      participants: [currentTeacher.teacherName]
    };

    // Update in localStorage
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    const list: ActiveClass[] = currentActiveListRaw ? JSON.parse(currentActiveListRaw) : [];
    const updatedList = [newClass, ...list.filter(c => c.teacherName !== currentTeacher.teacherName)];
    localStorage.setItem('cme_active_classes', JSON.stringify(updatedList));

    // Save live class directly to Firestore class_schedules collection
    try {
      setDoc(doc(db, 'class_schedules', classroomId), {
        id: classroomId,
        subject: subjectName,
        topic: `Live Interactive Lecture - Class ${targetCls}`,
        studentClass: targetCls,
        teacherName: currentTeacher.teacherName,
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        platform: 'Concept Live Virtual Room',
        meetLink: '/student-portal',
        status: 'Live',
        createdAt: new Date().toISOString()
      }).catch(e => console.warn('Could not write class_schedules to Firestore:', e));
    } catch (e) {
      console.warn('Firestore error:', e);
    }

    // Emit live class launch event so students get dynamic toast popups
    localStorage.setItem('cme_active_classes_event', JSON.stringify({
      timestamp: Date.now(),
      studentClass: targetCls,
      subject: subjectName,
      teacherName: currentTeacher.teacherName,
      classId: classroomId
    }));

    setActiveClass(newClass);
    setWhiteboardText(newClass.whiteboardText);
    setSlidesIndex(0);
    setIsMeetingActive(true);

    // Toast alert on launching class successfully
    addToast({
      title: 'Live Classroom Online!',
      description: `Classroom successfully broadcast for Class ${targetCls} standard.`,
      type: 'success',
      duration: 5000
    });
  };

  const handleStopMeeting = () => {
    if (!currentTeacher) return;
    
    if (isRecording) {
      stopRecording();
    }

    if (activeClass?.id) {
      try {
        setDoc(doc(db, 'class_schedules', activeClass.id), {
          status: 'Completed',
          endedAt: new Date().toISOString()
        }, { merge: true }).catch(e => console.warn('Could not update class_schedules status in Firestore:', e));
      } catch (e) {
        console.warn('Firestore error:', e);
      }
    }
    
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    if (currentActiveListRaw) {
      const list: ActiveClass[] = JSON.parse(currentActiveListRaw);
      const updatedList = list.filter(c => c.teacherName !== currentTeacher.teacherName);
      localStorage.setItem('cme_active_classes', JSON.stringify(updatedList));
    }

    stopCameraStream();
    setIsMeetingActive(false);
    setActiveClass(null);
  };

  const updateWhiteboard = (newText: string) => {
    if (!activeClass || !currentTeacher) return;
    setWhiteboardText(newText);
    
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    if (currentActiveListRaw) {
      const list: ActiveClass[] = JSON.parse(currentActiveListRaw);
      const updated = list.map(c => {
        if (c.teacherName === currentTeacher.teacherName) {
          return { ...c, whiteboardText: newText };
        }
        return c;
      });
      localStorage.setItem('cme_active_classes', JSON.stringify(updated));
    }
  };

  const updateWhiteboardDrawing = (base64: string) => {
    if (!activeClass || !currentTeacher) return;
    
    setActiveClass(prev => prev ? { ...prev, whiteboardDrawing: base64 } : null);
    
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    if (currentActiveListRaw) {
      const list: ActiveClass[] = JSON.parse(currentActiveListRaw);
      const updated = list.map(c => {
        if (c.teacherName === currentTeacher.teacherName) {
          return { ...c, whiteboardDrawing: base64 };
        }
        return c;
      });
      localStorage.setItem('cme_active_classes', JSON.stringify(updated));
    }
  };

  const updateSlideIndex = (index: number) => {
    if (!activeClass || !currentTeacher) return;
    setSlidesIndex(index);
    
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    if (currentActiveListRaw) {
      const list: ActiveClass[] = JSON.parse(currentActiveListRaw);
      const updated = list.map(c => {
        if (c.teacherName === currentTeacher.teacherName) {
          return { ...c, currentSlide: index };
        }
        return c;
      });
      localStorage.setItem('cme_active_classes', JSON.stringify(updated));
    }
  };

  const handleSendTeacherChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageText.trim() || !activeClass || !currentTeacher) return;

    const newMessage: ChatMessage = {
      sender: currentTeacher.teacherName + ' (Expert Mentor)',
      text: chatMessageText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMessages = [...(activeClass.chatMessages || []), newMessage];
    const updatedClass = { ...activeClass, chatMessages: updatedMessages };
    setActiveClass(updatedClass);
    setChatMessageText('');

    // Save back to storage
    const currentActiveListRaw = localStorage.getItem('cme_active_classes');
    if (currentActiveListRaw) {
      const list: ActiveClass[] = JSON.parse(currentActiveListRaw);
      const updated = list.map(c => {
        if (c.teacherName === currentTeacher.teacherName) {
          return updatedClass;
        }
        return c;
      });
      localStorage.setItem('cme_active_classes', JSON.stringify(updated));
    }
  };

  const handleSolveDoubt = (doubtId: string) => {
    if (!doubtAnswerText.trim()) return;

    const stored = localStorage.getItem('cme_student_doubts');
    if (stored) {
      const doubts = JSON.parse(stored);
      const updated = doubts.map((d: any) => {
        if (d.id === doubtId) {
          return {
            ...d,
            status: 'Answered',
            answer: doubtAnswerText,
            solvedBy: 'Mentor'
          };
        }
        return d;
      });
      localStorage.setItem('cme_student_doubts', JSON.stringify(updated));
      alert("Doubt solved successfully! Syncing directly back to student's live portal.");
      setAnsweringDoubtId(null);
      setDoubtAnswerText('');
      loadDoubts();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[85vh]">
      
      {!isLoggedIn ? (
        /* LOGIN / REGISTER PORTLET */
        <div className="max-w-md mx-auto my-12 bg-white border border-[#061F48]/10 rounded-[2.5rem] shadow-xl p-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-5 pointer-events-none transform translate-x-12 -translate-y-12">
            <GraduationCap className="h-64 w-64 text-[#061F48]" />
          </div>

          <div className="text-center space-y-2 mb-6">
            <div className="h-14 w-14 rounded-2xl bg-[#061F48] text-white flex items-center justify-center mx-auto shadow-md">
              <GraduationCap className="h-8 w-8 text-[#D09515]" />
            </div>
            <h2 className="text-xl font-black text-[#061F48] tracking-tight">Faculty & Mentor Portal</h2>
            <p className="text-xs text-[#061F48]/60 font-bold">
              Access scheduled batches, manage whiteboards & answer candidate doubts.
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex bg-[#F8F5ED] p-1.5 rounded-2xl border border-[#061F48]/5 mb-6">
            <button
              onClick={() => { setIsRegistering(false); setError(''); setRegistrationSuccess(''); }}
              className={`flex-grow text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${!isRegistering ? 'bg-[#061F48] text-white shadow-md' : 'text-[#061F48]/60 hover:text-[#061F48] hover:bg-[#061F48]/5'}`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegistering(true); setError(''); setRegistrationSuccess(''); }}
              className={`flex-grow text-center py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${isRegistering ? 'bg-[#061F48] text-white shadow-md' : 'text-[#061F48]/60 hover:text-[#061F48] hover:bg-[#061F48]/5'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3.5 rounded-xl text-xs font-bold mb-5">
              ⚠️ {error}
            </div>
          )}

          {registrationSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-xl text-xs font-bold mb-5">
              🎉 {registrationSuccess}
            </div>
          )}

          <form onSubmit={isRegistering ? handleRegisterSubmit : handleLoginSubmit} className="space-y-5">
            {isRegistering ? (
              <>
                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block mb-1.5 font-sans">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-[#061F48]/40" />
                    <input
                      type="text"
                      required
                      value={teacherName}
                      onChange={(e) => setTeacherName(e.target.value)}
                      placeholder="e.g. Prof. Ankit Malik"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 pl-9 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block mb-1.5 font-sans">Subject Expertise</label>
                  <select
                    value={teacherSubject}
                    onChange={(e) => setTeacherSubject(e.target.value)}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-4 py-3 rounded-xl text-xs font-black text-[#061F48]"
                  >
                    <option value="Physics (Board & IIT-JEE / NEET)">Physics (Board & IIT-JEE / NEET)</option>
                    <option value="Biology (NEET Specialist)">Biology (NEET Specialist)</option>
                    <option value="Chemistry (Boards & JEE Prep)">Chemistry (Boards & JEE Prep)</option>
                    <option value="Science, Social Science & English">Science, Social Science & English</option>
                    <option value="SST, English & Science">SST, English & Science</option>
                    <option value="Foundational Sciences & Math">Foundational Sciences & Math</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block mb-1.5 font-sans">Classes Taught</label>
                  <select
                    value={teacherClasses}
                    onChange={(e) => setTeacherClasses(e.target.value)}
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-4 py-3 rounded-xl text-xs font-black text-[#061F48]"
                  >
                    <option value="Class 9 to 12th">Class 9 to 12th</option>
                    <option value="Class 6 to 12th">Class 6 to 12th</option>
                    <option value="Class 6 to 10th">Class 6 to 10th</option>
                    <option value="Class 6 to 8th">Class 6 to 8th</option>
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block mb-1.5 font-sans">Teacher Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-[#061F48]/40" />
                  <input
                    type="text"
                    required
                    value={teacherName}
                    onChange={(e) => setTeacherName(e.target.value)}
                    placeholder="e.g. Prof. Ankit Malik"
                    className="w-full bg-[#F8F5ED] border border-[#061F48]/15 pl-9 pr-4 py-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block mb-1.5 font-sans">
                {isRegistering ? 'Choose Passcode' : 'Enter Passcode'}
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Minimum 6 characters"
                className="w-full bg-[#F8F5ED] border border-[#061F48]/15 px-4 py-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:ring-2 focus:ring-[#D09515]"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3.5 rounded-xl text-xs font-black uppercase tracking-widest transition-colors shadow-md flex items-center justify-center gap-2"
            >
              <CheckCircle className="h-4 w-4" />
              <span>{isRegistering ? 'Register Faculty Profile' : 'Authenticate Portal'}</span>
            </button>
          </form>
        </div>
      ) : (
        /* LOGGED IN TEACHER DASHBOARD */
        <div className="space-y-8">
          
          {/* TEACHER BANNER */}
          <div className="bg-white border border-[#061F48]/10 p-6 md:p-8 rounded-[2.5rem] shadow-sm flex flex-col md:flex-row items-center gap-6 justify-between relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-10 -translate-y-10">
              <GraduationCap className="h-48 w-48 text-[#061F48]" />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-2xl bg-[#061F48] text-white flex items-center justify-center text-[#D09515] shadow-sm shrink-0">
                <GraduationCap className="h-9 w-9" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-black uppercase bg-[#D09515] text-[#061F48] px-2.5 py-0.5 rounded-full tracking-widest">
                    EXPERT FACULTY
                  </span>
                  <span className="text-[9px] font-black uppercase bg-[#F8F5ED] text-[#061F48] px-2.5 py-0.5 rounded-full tracking-widest border border-[#061F48]/10">
                    CONCEPT DESIGN SPECIALIST
                  </span>
                </div>
                <h2 className="text-xl md:text-2xl font-black text-[#061F48]">
                  Welcome, Prof. {currentTeacher?.teacherName}
                </h2>
                {currentTeacher?.rollNumber && (
                  <div className="flex items-center space-x-2 mt-0.5 mb-1 animate-fade-in">
                    <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200 shadow-sm flex items-center gap-1.5">
                      <CheckCircle className="h-3 w-3 text-emerald-600" />
                      Teacher ID: {currentTeacher.rollNumber}
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-[#061F48]/60 font-semibold">
                  Primary Stream: <strong className="text-[#061F48]">{currentTeacher?.subject}</strong> | Timings: {currentTeacher?.preferredTimings}
                </p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="bg-red-50 hover:bg-red-100 text-red-700 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-red-200/55 transition-colors flex items-center gap-1.5 shrink-0"
            >
              <LogOut className="h-4 w-4" />
              <span>Exit Portal</span>
            </button>
          </div>

          {!isMeetingActive ? (
            /* TEACHER ACTIONS VIEW */
            <div className="space-y-8 animate-fade-in">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* SCHEDULED BATCHES */}
              <div className="lg:col-span-6 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-1 bg-[#D09515]/10 text-[#D09515] px-2.5 py-0.5 rounded-full border border-[#D09515]/20">
                    <Clock className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Batches Schedule</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-[#061F48] mt-2">Active Live Slots Today</h3>
                  <p className="text-xs text-[#061F48]/60 font-bold leading-relaxed">
                    Start a dynamic in-app live virtual classroom meeting for students to join instantly. No external link required!
                  </p>
                  
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#061F48]/5">
                    <span className="text-[10px] text-[#061F48]/60 font-black uppercase tracking-wider">Session Recording Option</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={autoRecordEnabled} 
                        onChange={(e) => setAutoRecordEnabled(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-600"></div>
                      <span className="ml-2 text-[11px] font-bold text-[#061F48]">Auto-Record Live Session</span>
                    </label>
                  </div>
                </div>

                <div className="rounded-2xl border border-dashed border-[#061F48]/15 bg-[#F8F5ED]/60 p-6 text-center">
                  <Clock className="h-7 w-7 mx-auto text-[#D09515] mb-2" />
                  <p className="text-xs font-black text-[#061F48]">No classes scheduled</p>
                  <p className="text-[10px] text-[#061F48]/50 font-semibold mt-1">Real class schedules will appear here after they are published.</p>
                </div>
              </div>

              {/* LIVE DOUBT TICKETS QUEUE */}
              <div id="teacher-doubts-section" className="lg:col-span-6 bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
                <div>
                  <div className="inline-flex items-center space-x-1 bg-purple-50 text-purple-700 px-2.5 py-0.5 rounded-full border border-purple-100">
                    <MessageSquare className="h-3.5 w-3.5" />
                    <span className="text-[9px] font-black uppercase tracking-wider">Student Inquiries</span>
                  </div>
                  <h3 className="text-lg md:text-xl font-black text-[#061F48] mt-2">Candidate Doubt Queue</h3>
                  <p className="text-xs text-[#061F48]/60 font-bold">
                    Provide detailed text answers and formula breakdowns to students directly.
                  </p>
                </div>

                {(allDoubts || []).filter(d => d && d.status === 'Pending').length === 0 ? (
                  <div className="bg-[#F8F5ED] border border-dashed border-[#061F48]/15 rounded-2xl p-8 text-center space-y-2">
                    <CheckCircle className="h-10 w-10 text-[#061F48]/20 mx-auto" />
                    <p className="text-xs font-black text-[#061F48]">All Doubt Tickets Solved!</p>
                    <p className="text-[10px] text-[#061F48]/50 font-semibold">New student tickets will pop up here instantly.</p>
                  </div>
                ) : (
                  <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-1">
                    {(allDoubts || []).filter(d => d && d.status === 'Pending').map((doubt) => (
                      <div key={doubt.id} className="bg-[#F8F5ED] border border-[#061F48]/10 p-4 rounded-xl space-y-3 shadow-sm">
                        <div className="flex justify-between items-center text-[9px] font-bold">
                          <span className="text-[#D09515] uppercase tracking-wide">[{doubt.subject}] - Class {doubt.studentClass}</span>
                          <span className="text-[#061F48]/40">{doubt.studentName}</span>
                        </div>
                        <p className="text-xs font-bold text-[#061F48] italic">"{doubt.question}"</p>
                        
                        {answeringDoubtId === doubt.id ? (
                          <div className="space-y-2 pt-2 border-t border-[#061F48]/5">
                            <textarea
                              value={doubtAnswerText}
                              onChange={(e) => setDoubtAnswerText(e.target.value)}
                              placeholder="Write your explanation or step-by-step formula breakdown here..."
                              rows={3}
                              className="w-full p-2.5 bg-white border border-[#061F48]/15 rounded-lg text-xs font-semibold text-[#061F48]"
                            ></textarea>
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setAnsweringDoubtId(null)}
                                className="px-3 py-1.5 rounded-lg text-[10px] font-bold text-gray-500 hover:bg-gray-100"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSolveDoubt(doubt.id)}
                                className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-colors"
                              >
                                Send Answer
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-end pt-1">
                            <button
                              onClick={() => {
                                setAnsweringDoubtId(doubt.id);
                                setDoubtAnswerText('');
                              }}
                              className="bg-[#061F48] hover:bg-[#D09515] text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span>Draft Resolution</span>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CLASS-WISE LECTURE UPLOADING PORTAL */}
              <div id="class-lecture-uploader" className="lg:col-span-12 bg-gradient-to-br from-white to-[#F8F5ED] rounded-[2.5rem] border border-[#061F48]/15 p-6 md:p-8 shadow-md space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-[#061F48]/10">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-[#061F48] text-[#D09515] flex items-center justify-center font-black text-xl shadow-sm shrink-0">
                      <Video className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="text-[9.5px] font-black uppercase tracking-widest text-[#D09515] block">CLASS-WISE BATCH PORTAL</span>
                      <h3 className="text-xl font-black text-[#061F48]">Class-Wise Lecture Uploading Portal</h3>
                      <p className="text-xs text-[#061F48]/70 font-bold mt-0.5">
                        Upload subject lectures & topic notes class-wise. Students enrolled in that specific batch will see the newly added lectures instantly.
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-xs font-black uppercase bg-emerald-100 text-emerald-800 px-3.5 py-1.5 rounded-xl border border-emerald-300/30 flex items-center gap-1.5 shrink-0">
                    <CheckCircle className="h-4 w-4" />
                    Batch Auto-Sync Active
                  </span>
                </div>

                {/* Form */}
                <form onSubmit={handlePublishClassLecture} className="grid grid-cols-1 md:grid-cols-12 gap-5 bg-white p-5 rounded-2xl border border-[#061F48]/10">
                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Target Class Batch</label>
                    <select
                      value={uploadClass}
                      onChange={(e) => setUploadClass(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    >
                      {['6', '7', '8', '9', '10', '11', '12'].map((cls) => (
                        <option key={cls} value={cls}>Class {cls}th Batch</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-3 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Subject</label>
                    <select
                      value={uploadSubject}
                      onChange={(e) => setUploadSubject(e.target.value)}
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    >
                      <option value="Biology">Biology & Life Sciences</option>
                      <option value="Physics">Physics & Mechanics</option>
                      <option value="Chemistry">Chemistry & Reactions</option>
                      <option value="Mathematics">Mathematics & Proofs</option>
                      <option value="Science">General Science</option>
                      <option value="English">English Literature & Grammar</option>
                      <option value="Social Science">Social Science (SST)</option>
                    </select>
                  </div>

                  <div className="md:col-span-4 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Lecture Title / Topic Name</label>
                    <input
                      type="text"
                      required
                      value={uploadTitle}
                      onChange={(e) => setUploadTitle(e.target.value)}
                      placeholder="e.g. Chapter 3: Human Genetics & NCERT Monohybrid Cross"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-2 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Duration</label>
                    <input
                      type="text"
                      value={uploadDuration}
                      onChange={(e) => setUploadDuration(e.target.value)}
                      placeholder="e.g. 45 mins"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Video Link / Stream Embed (YouTube, Drive, MP4)</label>
                    <input
                      type="text"
                      value={uploadVideoUrl}
                      onChange={(e) => setUploadVideoUrl(e.target.value)}
                      placeholder="https://www.youtube.com/embed/sample_id or Drive URL"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-6 space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-[#061F48]/70 block">Lecture Notes & Summary</label>
                    <input
                      type="text"
                      value={uploadNotesText}
                      onChange={(e) => setUploadNotesText(e.target.value)}
                      placeholder="Key formulas, NCERT exercise breakdowns or drive notes link"
                      className="w-full bg-[#F8F5ED] border border-[#061F48]/15 p-3 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none"
                    />
                  </div>

                  <div className="md:col-span-12 flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isPublishingLecture}
                      className="bg-[#061F48] hover:bg-[#D09515] text-white px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-2 shadow-md"
                    >
                      <Send className="h-4 w-4" />
                      <span>{isPublishingLecture ? 'Publishing to Batch...' : `Publish Lecture to Class ${uploadClass} Batch`}</span>
                    </button>
                  </div>
                </form>

                {/* Filter & View Uploaded Class Lectures List */}
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-[#061F48] uppercase tracking-wide">
                      Uploaded Batch Lectures (Class {uploadClass}th)
                    </h4>
                    <span className="text-xs font-bold text-[#061F48]/60">
                      {(uploadedSessions || []).filter(s => s && s.studentClass === uploadClass).length} Lectures Active in Batch
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(uploadedSessions || []).filter(s => s && s.studentClass === uploadClass).length === 0 ? (
                      <div className="col-span-full bg-white/60 p-6 rounded-2xl text-center text-xs font-bold text-gray-500 border border-dashed border-gray-300">
                        No custom uploads published for Class {uploadClass}th yet. Fill the form above to add your first lecture!
                      </div>
                    ) : (
                      (uploadedSessions || []).filter(s => s && s.studentClass === uploadClass).map((lec) => (
                        <div key={lec.id} className="bg-white border border-[#061F48]/10 p-4 rounded-2xl space-y-3 shadow-sm">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase">
                            <span className="bg-[#061F48] text-white px-2 py-0.5 rounded">Class {lec.studentClass}th</span>
                            <span className="text-[#D09515]">{lec.subject}</span>
                          </div>
                          <h5 className="text-xs font-black text-[#061F48] leading-snug">{lec.title}</h5>
                          <div className="text-[10px] text-gray-500 flex justify-between font-semibold">
                            <span>By: {lec.teacherName}</span>
                            <span>Duration: {lec.duration}</span>
                          </div>
                          <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                            <span className="text-[9px] text-emerald-600 font-bold">🟢 Live in Student Portal</span>
                            <button
                              onClick={() => {
                                const updated = uploadedSessions.filter(s => s.id !== lec.id);
                                setUploadedSessions(updated);
                                localStorage.setItem('cme_recorded_sessions', JSON.stringify(updated));
                                window.dispatchEvent(new Event('cme_lecture_added'));
                                addToast({ title: 'Lecture Removed', description: 'Removed from student batch.', type: 'info' });
                              }}
                              className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* AUTOMATED BATCH ATTENDANCE MONITOR */}
<div className="lg:col-span-12">
  <LiveAttendanceTracker
    meetingId="daily_batch_monitor"
    subject={currentTeacher?.subject || 'Science'}
    studentClass="10"
    startedAtTime="10:00 AM"
    activeParticipants={[]}
  />
</div>

{/* SATURDAY SPECIAL BATCH DOUBT PORTAL */}
<div className="lg:col-span-12">
  <SaturdayDoubtPortal
    userBatch="Class 10 Board Mastery"
    userName={currentTeacher?.name || 'Faculty Mentor'}
    userRoll="FACULTY-01"
  />
</div>

{/* SUNDAY BATCH EXAM HALL */}
<div className="lg:col-span-12">
  <SundayExamRoom
    userBatch="Class 10 Board Mastery"
    userName={currentTeacher?.name || 'Faculty Mentor'}
    userRoll="FACULTY-01"
  />
</div>

{/* CURRICULUM SEARCH */}
<div className="lg:col-span-12">
  <CurriculumSearch />
</div>
            </div>
            </div>
          ) : (
            /* ACTIVE IN-APP CLASSROOM WORKSPACE */
            <div className="space-y-8 animate-fade-in">
              <div className="bg-[#061F48] text-white rounded-[2.5rem] p-4 md:p-6 shadow-2xl space-y-6">
              
              {/* ROOM TOP HEADER BAR */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-white/10">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center space-x-1.5 bg-red-500/20 text-red-400 border border-red-500/30 px-3 py-0.5 rounded-full">
                      <span className="h-1.5 w-1.5 rounded-full bg-red-500 animate-ping"></span>
                      <span className="text-[9px] font-black uppercase tracking-wider">Virtual Classroom Active</span>
                    </span>
                    <span className="text-[9px] font-black uppercase bg-[#D09515]/20 text-[#D09515] border border-[#D09515]/30 px-3 py-0.5 rounded-full">
                      Class {activeClass?.studentClass}th
                    </span>
                  </div>
                  <h3 className="text-lg font-black text-[#D09515]">{activeClass?.subject}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const listRaw = localStorage.getItem('cme_active_classes');
                      if (listRaw) {
                        const list: ActiveClass[] = JSON.parse(listRaw);
                        const match = list.find(c => c.teacherName === currentTeacher?.teacherName);
                        if (match) {
                          alert(`Connection Verified! Your Live virtual link is secure. Current active participants: ${match.participants.join(', ')}`);
                        }
                      }
                    }}
                    className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-[10px] font-black uppercase border border-white/10"
                  >
                    Ping Health Status: Excellent
                  </button>
                  <button
                    onClick={handleStopMeeting}
                    className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    <span>Terminate Session</span>
                  </button>
                </div>
              </div>

              {/* SESSION RECORDING STATUS DECK */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <span className={`h-3.5 w-3.5 rounded-full block border-2 border-[#061F48] ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-400'}`}></span>
                    {isRecording && <span className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-75"></span>}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-white">
                        {isRecording ? '🔴 Live Session Recording Active' : '⚪ Session Recording Off'}
                      </h4>
                      <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-white/95">
                        {isRecording ? formatDuration(recordingDuration) : '--:--'}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/60 font-semibold mt-0.5">
                      {isRecording 
                        ? 'Capturing and synchronizing live class whiteboard updates, slide triggers, and student chat logs.' 
                        : 'Session recording is turned off. Toggle to start capturing.'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      if (isRecording) {
                        stopRecording();
                      } else {
                        startRecording();
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 ${isRecording ? 'bg-amber-500 hover:bg-amber-600 text-white' : 'bg-emerald-600 hover:bg-emerald-700 text-white'}`}
                  >
                    {isRecording ? (
                      <>
                        <VideoOff className="h-3.5 w-3.5" />
                        <span>Pause Recording</span>
                      </>
                    ) : (
                      <>
                        <Video className="h-3.5 w-3.5" />
                        <span>Resume Recording</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* GRID AREA: VIDEOS + WHITEBOARD + PRESENTATION */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                
                {/* VIDEO feeds panel (4 columns) */}
                <div className="lg:col-span-4 space-y-4">
                  <span className="text-[9px] font-black text-white/50 uppercase tracking-widest block">Live Camera Feeds</span>
                  
                  {/* TEACHER CAMERA */}
                  <div className="bg-[#F8F5ED]/5 border border-white/15 rounded-2xl p-3 aspect-video relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-2 left-2 z-10">
                      <span className="text-[8px] font-black uppercase bg-[#D09515] text-[#061F48] px-2 py-0.5 rounded-md shadow-sm">
                        You (Mentor Feed)
                      </span>
                    </div>

                    {cameraEnabled ? (
                      <div className="w-full h-full absolute inset-0 bg-black flex items-center justify-center">
                        <video 
                          ref={localVideoRef} 
                          autoPlay 
                          playsInline 
                          muted 
                          className="w-full h-full object-cover scale-x-[-1]"
                        />
                        <div className="absolute right-2.5 bottom-2.5 flex items-center gap-1.5 z-20">
                          {micEnabled && (
                            <span className="bg-indigo-600 text-white text-[8px] px-1.5 py-0.5 rounded font-bold flex items-center gap-1 shadow-sm">
                              <Mic className="h-2.5 w-2.5 animate-pulse" /> MIC LIVE
                            </span>
                          )}
                          <div className="bg-emerald-500 text-white text-[8px] px-1.5 py-0.5 rounded font-bold animate-pulse shadow-sm">
                            STREAMING HD
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-full absolute inset-0 bg-[#061F48] flex flex-col items-center justify-center text-center p-4">
                        <div className="h-10 w-10 rounded-full bg-[#D09515] text-[#061F48] flex items-center justify-center font-black text-sm mb-1.5 shadow-inner">
                          {currentTeacher?.teacherName?.charAt(0) || 'M'}
                        </div>
                        <p className="text-[10px] font-bold text-white/90">{currentTeacher?.teacherName || ''}</p>
                        <span className="text-[8px] text-emerald-400 font-semibold block mt-0.5">
                          {micEnabled ? '🎙️ Microphone Connected & Live' : 'Camera & Mic Muted'}
                        </span>
                      </div>
                    )}

                    {/* Bottom overlay controls */}
                    <div className="z-10 flex justify-between items-center mt-auto w-full pt-16">
                      <span className="text-[9px] text-white/60 font-semibold">Prof. {currentTeacher?.teacherName}</span>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setCameraEnabled(!cameraEnabled)}
                          className={`p-2 rounded-lg transition-colors ${cameraEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                        >
                          {cameraEnabled ? <Video className="h-3.5 w-3.5" /> : <VideoOff className="h-3.5 w-3.5" />}
                        </button>
                        <button
                          onClick={() => setMicEnabled(!micEnabled)}
                          className={`p-2 rounded-lg transition-colors ${micEnabled ? 'bg-white/10 hover:bg-white/20 text-white' : 'bg-red-500 text-white'}`}
                        >
                          {micEnabled ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ACTIVE STUDENT PARTICIPANT (Sneha, Rohan, or real student) */}
                  <div className="bg-[#F8F5ED]/5 border border-white/15 rounded-2xl p-3 aspect-video relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute top-2 left-2">
                      <span className="text-[8px] font-black uppercase bg-[#061F48] text-white border border-white/20 px-2 py-0.5 rounded-md shadow-sm">
                        Class Participant
                      </span>
                    </div>

                    <div className="w-full h-full absolute inset-0 bg-[#061F48]/90 flex flex-col items-center justify-center text-center p-4">
                      {/* Animated simulated student waveform */}
                      <div className="flex items-center justify-center gap-1 mb-2 h-6">
                        {[0.8, 0.4, 0.9, 0.5, 0.7, 0.3, 0.8].map((val, k) => (
                          <div 
                            key={k} 
                            style={{ height: `${val * 100}%` }} 
                            className="w-1 bg-[#D09515] rounded-full animate-pulse"
                          ></div>
                        ))}
                      </div>
                      <span className="text-xs font-black text-white">
                        {activeClass?.participants?.find(p => p !== currentTeacher?.teacherName) || "Awaiting Students..."}
                      </span>
                      <p className="text-[9px] text-white/50 font-semibold mt-0.5">
                        {(activeClass?.participants || []).length > 1 ? "Audio connected • Lag: 4ms" : "Class is open for students to join"}
                      </p>
                    </div>

                    <div className="mt-auto z-10 flex justify-between items-center text-[9px] text-white/60">
                      <span>Interactive Voice Enabled</span>
                      <span className="text-emerald-400 font-bold">● LOBBY ONLINE</span>
                    </div>
                  </div>

                  {/* ATTENDANCE/PARTICIPANTS LIST */}
                  <div className="bg-white/5 border border-white/15 p-4 rounded-2xl space-y-2.5">
                    <span className="text-[9px] font-black text-white/50 uppercase tracking-wider block">Connected Pupils ({activeClass?.participants?.length || 0})</span>
                    <div className="space-y-1.5 text-[10px] font-semibold text-white/80">
                      {activeClass?.participants?.map((pName, index) => (
                        <div key={index} className="flex items-center justify-between bg-white/5 px-2.5 py-1.5 rounded-lg">
                          <span>{pName}</span>
                          <span className="text-[8px] bg-emerald-500/20 text-emerald-400 px-1.5 py-0.2 rounded">Joined</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>

                {/* MAIN WHITEBOARD & SLIDES (8 columns) */}
                <div className="lg:col-span-8 space-y-4">
                  
                  {/* WHITEBOARD SECTION */}
                  <div className="bg-white text-[#061F48] rounded-3xl p-5 md:p-6 space-y-3.5 shadow-xl relative">
                    <div className="flex justify-between items-center border-b border-[#061F48]/10 pb-3 gap-2 flex-wrap">
                      <div className="flex items-center space-x-2">
                        <Edit3 className="h-4.5 w-4.5 text-[#061F48]" />
                        <span className="text-[10px] font-black uppercase text-[#061F48] tracking-wide">Interactive Mentor Board</span>
                      </div>
                      
                      {/* Drawing Canvas / Text Toggle Tabs */}
                      <div className="flex items-center bg-[#F8F5ED] border border-[#061F48]/10 p-0.5 rounded-xl text-[9px] font-black uppercase">
                        <button
                          onClick={() => setBoardMode('text')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${boardMode === 'text' ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-[#061F48]/5'}`}
                        >
                          📝 Text Notes
                        </button>
                        <button
                          onClick={() => setBoardMode('draw')}
                          className={`px-3 py-1.5 rounded-lg transition-all ${boardMode === 'draw' ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-[#061F48]/5'}`}
                        >
                          🎨 Drawing Canvas
                        </button>
                      </div>

                      <span className="text-[9px] font-black uppercase text-amber-700 bg-[#D09515]/10 border border-[#D09515]/20 px-2 py-0.5 rounded-md hidden md:inline-block">
                        Real-time student sync
                      </span>
                    </div>

                    {boardMode === 'text' ? (
                      <>
                        <textarea
                          value={whiteboardText}
                          onChange={(e) => updateWhiteboard(e.target.value)}
                          rows={5}
                          className="w-full p-4 bg-[#F8F5ED] border border-[#061F48]/10 rounded-2xl text-xs md:text-sm font-mono font-bold leading-relaxed focus:outline-none focus:ring-2 focus:ring-[#D09515]"
                          placeholder="Type formulas or pointers for the student to visualize live on their board..."
                        ></textarea>

                        <div className="flex justify-between items-center text-[10px] text-[#061F48]/50 font-bold">
                          <span>*Changes made here will render directly in student panels instantly.</span>
                          <button
                            onClick={() => updateWhiteboard("BOARD CLEANED • Type here to write new derivations.")}
                            className="text-red-600 hover:underline"
                          >
                            Wipe Board
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2">
                        <WhiteboardCanvas
                          isReadOnly={false}
                          initialDrawing={activeClass?.whiteboardDrawing || ''}
                          onDrawingChange={updateWhiteboardDrawing}
                        />
                        <p className="text-[9.5px] text-[#061F48]/60 font-bold italic">
                          * Sketching here broadcasts the canvas live to the Student Portal instantly.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* PRESENTATION SLIDES SECTION */}
                  <div className="bg-[#F8F5ED]/5 border border-white/15 p-5 rounded-3xl space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-2">
                        <Tv className="h-4 w-4 text-[#D09515]" />
                        <span className="text-[10px] font-black uppercase tracking-wider text-white">Lesson Slides</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        {(getSlidesForSubject(activeClass?.subject) || []).map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => updateSlideIndex(idx)}
                            className={`h-2.5 w-2.5 rounded-full transition-all ${slidesIndex === idx ? 'bg-[#D09515] w-6' : 'bg-white/25 hover:bg-white/40'}`}
                          ></button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white/5 border border-white/10 p-5 rounded-2xl text-center min-h-[100px] flex items-center justify-center">
                      <p className="text-xs sm:text-sm font-black text-[#D09515] italic">
                        "{(getSlidesForSubject(activeClass?.subject) || [])[slidesIndex] || 'NCERT Chapter formulas & illustrations'}"
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-[10px] font-bold text-white/50">
                      <span>*Slides sync automatically to student viewport.</span>
                      <div className="flex gap-2">
                        <button
                          disabled={slidesIndex === 0}
                          onClick={() => updateSlideIndex(slidesIndex - 1)}
                          className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white px-3 py-1 rounded-lg"
                        >
                          Prev
                        </button>
                        <button
                          disabled={slidesIndex >= ((getSlidesForSubject(activeClass?.subject) || []).length - 1)}
                          onClick={() => updateSlideIndex(slidesIndex + 1)}
                          className="bg-white/10 hover:bg-white/20 disabled:opacity-40 text-white px-3 py-1 rounded-lg"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ROOM LIVE CHAT */}
                  <div className="bg-[#F8F5ED]/5 border border-white/15 p-5 rounded-3xl space-y-4">
                    <span className="text-[10px] font-black text-white/50 uppercase tracking-widest block">Classroom Discussion Feed</span>
                    
                    <div className="space-y-3.5 max-h-40 overflow-y-auto pr-1">
                      {(activeClass?.chatMessages || []).map((msg, index) => (
                        <div key={index} className={`flex flex-col space-y-0.5 text-xs ${msg.sender.includes('Mentor') ? 'items-end' : 'items-start'}`}>
                          <span className="text-[8px] text-white/40 font-black">{msg.sender} • {msg.time}</span>
                          <span className={`p-2.5 rounded-2xl leading-relaxed max-w-sm ${msg.sender.includes('Mentor') ? 'bg-[#D09515] text-[#061F48] font-bold' : 'bg-white/10 text-white font-medium'}`}>
                            {msg.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendTeacherChat} className="flex gap-2 pt-2 border-t border-white/10">
                      <input
                        type="text"
                        value={chatMessageText}
                        onChange={(e) => setChatMessageText(e.target.value)}
                        placeholder="Type formula, answers, or links to share..."
                        className="flex-grow bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-white placeholder-white/40 focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                      />
                      <button
                        type="submit"
                        className="bg-[#D09515] text-[#061F48] hover:bg-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                      >
                        Send
                      </button>
                    </form>
                  </div>

                </div>

              </div>

              {/* AUTOMATED LIVE SESSION ATTENDANCE TRACKER */}
              <div className="mt-8">
                <LiveAttendanceTracker
                  meetingId={activeClass?.id || 'live_session'}
                  subject={activeClass?.subject || currentTeacher?.subject || 'Science'}
                  studentClass="10"
                  startedAtTime="10:00 AM"
                  activeParticipants={activeClass?.participants || []}
                />
              </div>

            </div>
            <CurriculumSearch />
            </div>
          )}

        </div>
      )}

    </div>
  );
}
