import React, { useState, useEffect } from 'react';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';
import { db, doc, setDoc, updateDoc, deleteDoc, collection, query, where, getDocs, addDoc } from '../lib/firebase';
import { 
  Lock, 
  Users, 
  Award, 
  Calendar, 
  LogOut, 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  FileText, 
  PhoneCall,
  Settings, 
  Save, 
  RefreshCw, 
  Plus, 
  Trash2, 
  Briefcase,
  AlertCircle,
  MessageSquare,
  Send,
  HelpCircle,
  Landmark
} from 'lucide-react';
import { Enquiry, ScholarshipSubmission, TeacherSchedule } from '../types';
import { defaultPolicies, PolicyData, PolicyClause } from '../data/defaultPolicies';
import * as LucideIcons from 'lucide-react';
import AdminFinancials from '../components/AdminFinancials';

export default function Admin() {
  const { addToast, triggerAnnouncement, triggerClassAlert, triggerResultAlert } = useToast();

  // Authentication / access control
  const { user, userProfile, loginWithGoogle, logout: authLogout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const founderEmails = ['pranjalagrawal576@gmail.com', 'hr.conceptmadeeasyclasses@gmail.com'];
  const normalizedEmail = (user?.email || '').toLowerCase();
  const isFounder = founderEmails.includes(normalizedEmail);
  const hasAdminRole = userProfile?.role === 'admin';
  const isAuthorizedAdmin = isFounder || hasAdminRole;

  // Dashboard Data states
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [scholarships, setScholarships] = useState<ScholarshipSubmission[]>([]);
  const [teachers, setTeachers] = useState<TeacherSchedule[]>([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'enquiries' | 'scholarships' | 'teachers' | 'doubts' | 'settings' | 'announcements' | 'policies' | 'financials' | 'access'>('enquiries');

  // Announcements broadcast state
  const [announcementSubTab, setAnnouncementSubTab] = useState<'notice' | 'class' | 'result'>('notice');
  const [announcementTitle, setAnnouncementTitle] = useState('');
  const [announcementMessage, setAnnouncementMessage] = useState('');
  const [announcementSender, setAnnouncementSender] = useState('Academic Coordinator');

  const [classAlertClass, setClassAlertClass] = useState('10');
  const [classAlertSubject, setClassAlertSubject] = useState('');
  const [classAlertMentor, setClassAlertMentor] = useState('');
  const [classAlertTime, setClassAlertTime] = useState('');

  const [resultAlertTest, setResultAlertTest] = useState('');
  const [resultAlertScore, setResultAlertScore] = useState('');

  // Student doubts states
  const [studentDoubts, setStudentDoubts] = useState<any[]>([]);
  const [answeringDoubtId, setAnsweringDoubtId] = useState<string | null>(null);
  const [doubtAnswerText, setDoubtAnswerText] = useState('');

  // Search & Filters
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryStatusFilter, setEnquiryStatusFilter] = useState('ALL');
  const [scholarshipSearch, setScholarshipSearch] = useState('');
  const [scholarshipStatusFilter, setScholarshipStatusFilter] = useState('ALL');

  // Selected details modal or note editor
  const [editingEnquiryId, setEditingEnquiryId] = useState<string | null>(null);
  const [enquiryNote, setEnquiryNote] = useState('');
  const [editingScholarshipId, setEditingScholarshipId] = useState<string | null>(null);
  const [scholarshipNote, setScholarshipNote] = useState('');

  // Create Enquiry Modal
  const [showAddEnquiryModal, setShowAddEnquiryModal] = useState(false);
  const [newEnquiryForm, setNewEnquiryForm] = useState({
    name: '',
    phone: '',
    studentClass: '10',
    course: 'Boards Prep',
    message: ''
  });

  // Legal Policies states
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [editingPolicy, setEditingPolicy] = useState<PolicyData | null>(null);
  const [isSavingPolicy, setIsSavingPolicy] = useState(false);
  const [policySearch, setPolicySearch] = useState('');
  const [isInitializingPolicies, setIsInitializingPolicies] = useState(false);

  const loadPolicies = async () => {
    try {
      const snap = await getDocs(collection(db, 'policies'));
      const list: PolicyData[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        let clausesParsed = [];
        if (typeof data.clausesJson === 'string') {
          try {
            clausesParsed = JSON.parse(data.clausesJson);
          } catch (e) {
            clausesParsed = data.clauses || [];
          }
        } else {
          clausesParsed = data.clauses || [];
        }
        list.push({
          id: data.id,
          title: data.title,
          category: data.category,
          lastUpdated: data.lastUpdated,
          iconName: data.iconName,
          summary: data.summary,
          clauses: clausesParsed
        });
      });

      if ((list || []).length > 0) {
        // Sort to match default ID order
        const idOrder = defaultPolicies.map(x => x.id);
        list.sort((a, b) => idOrder.indexOf(a.id) - idOrder.indexOf(b.id));
        setPolicies(list);
      } else {
        setPolicies([]);
      }
    } catch (err) {
      console.error('Error fetching policies in admin:', err);
    }
  };

  const initializeDefaultPolicies = async () => {
    if (confirm("Are you sure you want to pre-populate all 20 required policies into your Firestore database? This will enable CMS synchronization!")) {
      setIsInitializingPolicies(true);
      try {
        for (const p of defaultPolicies) {
          const docRef = doc(db, 'policies', p.id);
          await setDoc(docRef, {
            id: p.id,
            title: p.title,
            category: p.category,
            lastUpdated: p.lastUpdated,
            iconName: p.iconName,
            summary: p.summary,
            clausesJson: JSON.stringify(p.clauses)
          });
        }
        addToast({
          title: "Policies Synchronized!",
          description: "All 20 standard policies have been deployed to your live database successfully.",
          type: "success"
        });
        await loadPolicies();
      } catch (err) {
        console.error('Error initializing default policies:', err);
        addToast({
          title: "Synchronization Failed",
          description: "An error occurred during bulk policy deployment.",
          type: "error"
        });
      } finally {
        setIsInitializingPolicies(false);
      }
    }
  };

  const handleSavePolicy = async (policy: PolicyData) => {
    setIsSavingPolicy(true);
    try {
      await setDoc(doc(db, 'policies', policy.id), {
        id: policy.id,
        title: policy.title,
        category: policy.category,
        lastUpdated: policy.lastUpdated,
        iconName: policy.iconName,
        summary: policy.summary,
        clausesJson: JSON.stringify(policy.clauses)
      });
      
      addToast({
        title: "Policy Saved",
        description: `Successfully published updates for "${policy.title}" to Firestore.`,
        type: "success"
      });

      setEditingPolicy(null);
      await loadPolicies();
    } catch (err) {
      console.error('Error saving legal policy to Firestore:', err);
      addToast({
        title: "Reconciliation Failed",
        description: "Firestore permission error. Ensure you have proper administrator authorizations.",
        type: "error"
      });
    } finally {
      setIsSavingPolicy(false);
    }
  };

  const handleDeletePolicy = async (id: string, title: string) => {
    if (confirm(`Are you sure you want to permanently delete the "${title}" policy? This is irreversible.`)) {
      try {
        await deleteDoc(doc(db, 'policies', id));
        addToast({
          title: "Policy Deleted",
          description: `"${title}" has been permanently removed from legal database archives.`,
          type: "success"
        });
        await loadPolicies();
      } catch (err) {
        console.error('Error deleting policy:', err);
        addToast({
          title: "Deletion Failed",
          description: "An error occurred while attempting to delete policy from database.",
          type: "error"
        });
      }
    }
  };

  const loadFirestoreData = async () => {
    try {
      // 1. Load Enquiries from Firestore
      const enqSnap = await getDocs(collection(db, 'enquiries'));
      const enqList: Enquiry[] = [];
      enqSnap.forEach((docSnap) => {
        enqList.push(docSnap.data() as Enquiry);
      });
      enqList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      if ((enqList || []).length > 0) {
        setEnquiries(enqList);
      }

      // 2. Load Scholarships from Firestore
      const schSnap = await getDocs(collection(db, 'scholarships'));
      const schList: ScholarshipSubmission[] = [];
      schSnap.forEach((docSnap) => {
        schList.push(docSnap.data() as ScholarshipSubmission);
      });
      schList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      if ((schList || []).length > 0) {
        setScholarships(schList);
      }

      // 3. Load Student Doubts from Firestore
      const doubtsSnap = await getDocs(collection(db, 'doubts'));
      const doubtsList: any[] = [];
      doubtsSnap.forEach((docSnap) => {
        doubtsList.push({ id: docSnap.id, ...docSnap.data() });
      });
      doubtsList.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());
      if ((doubtsList || []).length > 0) {
        setStudentDoubts(doubtsList);
      }
    } catch (err) {
      console.error('Error fetching Firestore admin collections:', err);
    }
  };

  // Load and sync data with local storage on startup
  useEffect(() => {
    // Load Enquiries (Keep only real, non-default entries as fallback)
    const storedEnquiries = localStorage.getItem('cme_enquiries');
    if (storedEnquiries) {
      const parsed = JSON.parse(storedEnquiries).filter(
        (e: Enquiry) => e && e.id && !e.id.startsWith('enq_default')
      );
      setEnquiries(parsed);
      localStorage.setItem('cme_enquiries', JSON.stringify(parsed));
    } else {
      localStorage.setItem('cme_enquiries', JSON.stringify([]));
      setEnquiries([]);
    }

    // Load Scholarships (Keep only real, non-default entries as fallback)
    const storedScholarships = localStorage.getItem('cme_scholarships');
    if (storedScholarships) {
      const parsed = JSON.parse(storedScholarships).filter(
        (s: ScholarshipSubmission) => s && s.id && !s.id.startsWith('sch_default')
      );
      setScholarships(parsed);
      localStorage.setItem('cme_scholarships', JSON.stringify(parsed));
    } else {
      localStorage.setItem('cme_scholarships', JSON.stringify([]));
      setScholarships([]);
    }

    // Load only real teacher records from Firestore. Never seed demo/fake teachers.
    const loadRealTeachers = async () => {
      try {
        const teacherSnapshot = await getDocs(
          query(collection(db, 'portal_users'), where('role', '==', 'teacher'))
        );
        const realTeachers = teacherSnapshot.docs.map((d) => ({
          id: d.id,
          ...(d.data() as TeacherSchedule)
        })) as TeacherSchedule[];
        setTeachers(realTeachers);
        localStorage.setItem('cme_teachers', JSON.stringify(realTeachers));
      } catch (error) {
        console.error('Error loading teachers from Firestore:', error);
        setTeachers([]);
      }
    };
    loadRealTeachers();

    // Load student doubts fallback
    const storedDoubts = localStorage.getItem('cme_student_doubts');
    if (storedDoubts) {
      setStudentDoubts(JSON.parse(storedDoubts));
    } else {
      setStudentDoubts([]);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      loadFirestoreData();
      if (activeTab === 'policies') {
        loadPolicies();
      }
    }
  }, [activeTab, isLoggedIn]);

  useEffect(() => {
    // Never trust a client-side/sessionStorage flag for admin access.
    // Authorization is derived from the signed-in Firebase user/profile.
    setIsLoggedIn(isAuthorizedAdmin);
  }, [isAuthorizedAdmin]);

  const handleAdminGoogleLogin = async () => {
    setLoginError('');
    await loginWithGoogle('student');
  };

  const handleLogout = async () => {
    await authLogout();
  };

  const grantAdminAccess = async () => {
    if (!isFounder) {
      setLoginError('Only Founder accounts can grant or revoke Admin access.');
      return;
    }
    const targetEmail = adminEmail.trim().toLowerCase();
    if (!targetEmail) return;
    if (founderEmails.includes(targetEmail)) {
      addToast({ title: 'Founder Access', description: 'This email already has permanent Founder access.', type: 'info', duration: 3000 });
      return;
    }
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), where('email', '==', targetEmail)));
      if (snapshot.empty) {
        addToast({ title: 'User Not Found', description: 'Ask the person to sign in with Google once, then grant access.', type: 'warning', duration: 4000 });
        return;
      }
      await Promise.all(snapshot.docs.map((userDoc) => updateDoc(userDoc.ref, { role: 'admin' })));
      setAdminEmail('');
      addToast({ title: 'Admin Access Granted', description: `${targetEmail} can now access the Admin Portal.`, type: 'success', duration: 4000 });
    } catch (error) {
      console.error('Error granting admin access:', error);
      addToast({ title: 'Access Update Failed', description: 'Could not update this user right now.', type: 'error', duration: 4000 });
    }
  };

  const revokeAdminAccess = async (email: string) => {
    if (!isFounder) return;
    const targetEmail = email.trim().toLowerCase();
    if (founderEmails.includes(targetEmail)) {
      addToast({ title: 'Founder Protected', description: 'Founder access cannot be revoked from the portal.', type: 'warning', duration: 3000 });
      return;
    }
    try {
      const snapshot = await getDocs(query(collection(db, 'users'), where('email', '==', targetEmail)));
      await Promise.all(snapshot.docs.map((userDoc) => updateDoc(userDoc.ref, { role: 'student' })));
      addToast({ title: 'Admin Access Revoked', description: `${targetEmail} no longer has Admin access.`, type: 'success', duration: 4000 });
    } catch (error) {
      console.error('Error revoking admin access:', error);
    }
  };

  // Mutators
  const updateEnquiryStatus = async (id: string, status: Enquiry['status']) => {
    const updated = enquiries.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    setEnquiries(updated);
    localStorage.setItem('cme_enquiries', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'enquiries', id), { status });
    } catch (err) {
      console.error('Error updating enquiry status in Firestore:', err);
    }
  };

  const saveEnquiryNote = async (id: string) => {
    const updated = enquiries.map(item => {
      if (item.id === id) {
        return { ...item, notes: enquiryNote };
      }
      return item;
    });
    setEnquiries(updated);
    localStorage.setItem('cme_enquiries', JSON.stringify(updated));
    const noteText = enquiryNote;
    setEditingEnquiryId(null);
    setEnquiryNote('');

    try {
      await updateDoc(doc(db, 'enquiries', id), { notes: noteText });
    } catch (err) {
      console.error('Error saving enquiry note in Firestore:', err);
    }
  };

  const deleteEnquiry = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this enquiry?")) {
      const filtered = enquiries.filter(item => item.id !== id);
      setEnquiries(filtered);
      localStorage.setItem('cme_enquiries', JSON.stringify(filtered));

      try {
        await deleteDoc(doc(db, 'enquiries', id));
      } catch (err) {
        console.error('Error deleting enquiry in Firestore:', err);
      }
    }
  };

  const updateScholarshipStatus = async (id: string, status: ScholarshipSubmission['status']) => {
    const updated = scholarships.map(item => {
      if (item.id === id) {
        return { ...item, status };
      }
      return item;
    });
    setScholarships(updated);
    localStorage.setItem('cme_scholarships', JSON.stringify(updated));

    try {
      await updateDoc(doc(db, 'scholarships', id), { status });
    } catch (err) {
      console.error('Error updating scholarship status in Firestore:', err);
    }
  };

  const saveScholarshipNote = async (id: string) => {
    const updated = scholarships.map(item => {
      if (item.id === id) {
        return { ...item, notes: scholarshipNote };
      }
      return item;
    });
    setScholarships(updated);
    localStorage.setItem('cme_scholarships', JSON.stringify(updated));
    const noteText = scholarshipNote;
    setEditingScholarshipId(null);
    setScholarshipNote('');

    try {
      await updateDoc(doc(db, 'scholarships', id), { notes: noteText });
    } catch (err) {
      console.error('Error saving scholarship note in Firestore:', err);
    }
  };

  const deleteScholarship = async (id: string) => {
    if (confirm("Are you sure you want to delete this scholarship application?")) {
      const filtered = scholarships.filter(item => item.id !== id);
      setScholarships(filtered);
      localStorage.setItem('cme_scholarships', JSON.stringify(filtered));

      try {
        await deleteDoc(doc(db, 'scholarships', id));
      } catch (err) {
        console.error('Error deleting scholarship in Firestore:', err);
      }
    }
  };

  const updateTeacherTimings = (id: string, preferredTimings: string) => {
    const updated = teachers.map(item => {
      if (item.id === id) {
        return { ...item, preferredTimings };
      }
      return item;
    });
    setTeachers(updated);
    localStorage.setItem('cme_teachers', JSON.stringify(updated));
  };

  const toggleTeacherStatus = (id: string) => {
    const updated: TeacherSchedule[] = teachers.map(item => {
      if (item.id === id) {
        return { ...item, status: (item.status === 'Active' ? 'On Leave' : 'Active') as 'Active' | 'On Leave' };
      }
      return item;
    });
    setTeachers(updated);
    localStorage.setItem('cme_teachers', JSON.stringify(updated));
  };

  const handleAddNewEnquiry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnquiryForm.name || !newEnquiryForm.phone) {
      alert("Name and Phone are required.");
      return;
    }

    const newEnq: Enquiry = {
      id: 'enq_manual_' + Math.random().toString(36).substr(2, 9),
      name: newEnquiryForm.name,
      phone: newEnquiryForm.phone,
      studentClass: newEnquiryForm.studentClass,
      course: newEnquiryForm.course,
      message: newEnquiryForm.message,
      submittedAt: new Date().toISOString(),
      status: 'Pending',
      notes: 'Logged manually by Admin.'
    };

    const updated = [newEnq, ...enquiries];
    setEnquiries(updated);
    localStorage.setItem('cme_enquiries', JSON.stringify(updated));
    setShowAddEnquiryModal(false);
    setNewEnquiryForm({
      name: '',
      phone: '',
      studentClass: '10',
      course: 'Boards Prep',
      message: ''
    });
  };

  const handlePublishNotice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!announcementTitle || !announcementMessage) {
      alert("Please fill in the title and message.");
      return;
    }
    const annObj = {
      title: announcementTitle,
      description: announcementMessage,
      sender: announcementSender,
      timestamp: Date.now()
    };
    localStorage.setItem('cme_latest_announcement', JSON.stringify(annObj));
    
    // Trigger locally on admin tab too
    triggerAnnouncement(announcementTitle, announcementMessage, announcementSender);

    addToast({
      title: "Broadcast Published!",
      description: "Standard notice board alert synchronized successfully with all live student & teacher tabs.",
      type: "success"
    });
    setAnnouncementTitle('');
    setAnnouncementMessage('');
  };

  const handlePublishClassAlert = (e: React.FormEvent) => {
    e.preventDefault();
    const classObj = {
      studentClass: classAlertClass,
      subject: classAlertSubject,
      mentor: classAlertMentor,
      timeText: classAlertTime,
      timestamp: Date.now()
    };
    localStorage.setItem('cme_latest_class_alert_event', JSON.stringify(classObj));

    // Save to Firestore class_schedules collection
    try {
      addDoc(collection(db, 'class_schedules'), {
        subject: classAlertSubject,
        topic: `${classAlertSubject} - Live Interactive Session`,
        studentClass: classAlertClass,
        teacherName: classAlertMentor,
        startTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
        endTime: new Date(Date.now() + 75 * 60 * 1000).toISOString(),
        platform: 'Concept Live Virtual Room',
        meetLink: '/student-portal',
        status: 'Scheduled',
        createdAt: new Date().toISOString()
      }).catch(e => console.warn('Could not save to class_schedules:', e));
    } catch (e) {
      console.warn('Firestore error:', e);
    }

    addToast({
      title: "Class Alert Published!",
      description: `Live room reminder broadcast successfully for Class ${classAlertClass} students.`,
      type: "success"
    });
  };

  const handlePublishResultAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resultAlertTest || !resultAlertScore) {
      alert("Please fill test name and score.");
      return;
    }
    const resultObj = {
      testName: resultAlertTest,
      scoreText: resultAlertScore,
      timestamp: Date.now()
    };
    localStorage.setItem('cme_latest_result_event', JSON.stringify(resultObj));

    addToast({
      title: "Result Alert Published!",
      description: "Test score announcement synchronized successfully with all active student tabs.",
      type: "success"
    });
    setResultAlertTest('');
    setResultAlertScore('');
  };

  const resetAllData = () => {
    if (confirm("Are you sure you want to clear all enquiries and scholarship entries? This cannot be undone.")) {
      localStorage.setItem('cme_enquiries', JSON.stringify([]));
      localStorage.setItem('cme_scholarships', JSON.stringify([]));
      localStorage.setItem('cme_teachers', JSON.stringify([]));
      localStorage.setItem('cme_student_doubts', JSON.stringify([]));
      setEnquiries([]);
      setScholarships([]);
      setTeachers([]);
      setStudentDoubts([]);
      alert("Database cleared of all entries successfully!");
    }
  };

  const submitDoubtResponse = async (id: string) => {
    if (!doubtAnswerText.trim()) {
      alert("Please enter a response.");
      return;
    }
    const updated = studentDoubts.map(doubt => {
      if (doubt.id === id) {
        return { ...doubt, status: 'Answered', answer: doubtAnswerText, solvedBy: 'Coordinator Team' };
      }
      return doubt;
    });
    setStudentDoubts(updated);
    localStorage.setItem('cme_student_doubts', JSON.stringify(updated));
    setAnsweringDoubtId(null);
    const textToSave = doubtAnswerText;
    setDoubtAnswerText('');

    try {
      await updateDoc(doc(db, 'doubts', id), {
        status: 'Answered',
        answer: textToSave,
        solvedBy: 'Coordinator Team'
      });
      alert("Doubt response sent to student portal successfully!");
    } catch (err) {
      console.error('Error updating doubt response in Firestore:', err);
      alert("Saved locally! Fallback student session will show the coordinator answer.");
    }
  };

  const deleteDoubtTicket = async (id: string) => {
    if (confirm("Are you sure you want to permanently delete this doubt ticket?")) {
      const filtered = studentDoubts.filter(d => d.id !== id);
      setStudentDoubts(filtered);
      localStorage.setItem('cme_student_doubts', JSON.stringify(filtered));

      try {
        await deleteDoc(doc(db, 'doubts', id));
      } catch (err) {
        console.error('Error deleting doubt ticket in Firestore:', err);
      }
    }
  };

  // Filter computations
  const filteredEnquiries = enquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(enquirySearch.toLowerCase()) || 
                          item.phone.includes(enquirySearch) ||
                          item.course.toLowerCase().includes(enquirySearch.toLowerCase());
    const matchesStatus = enquiryStatusFilter === 'ALL' || item.status === enquiryStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredScholarships = scholarships.filter(item => {
    const matchesSearch = item.studentName.toLowerCase().includes(scholarshipSearch.toLowerCase()) ||
                          item.phone.includes(scholarshipSearch) ||
                          item.schoolName.toLowerCase().includes(scholarshipSearch.toLowerCase());
    const matchesStatus = scholarshipStatusFilter === 'ALL' || item.status === scholarshipStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // KPI Calculations
  const totalEnquiriesCount = (enquiries || []).length;
  const pendingEnquiriesCount = (enquiries || []).filter(e => e && e.status === 'Pending').length;
  const enrolledEnquiriesCount = (enquiries || []).filter(e => e && e.status === 'Enrolled').length;
  const activeScholarshipsCount = (scholarships || []).filter(s => s && s.status === 'Approved').length;

  if (!isLoggedIn) {
    return (
      <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-8 md:p-10 rounded-[2.5rem] border border-[#061F48]/10 shadow-2xl animate-fade-in relative">
          <div className="absolute top-0 right-0 w-36 h-36 bg-[#D09515] opacity-[0.04] rounded-full blur-xl pointer-events-none"></div>
          <div className="text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#061F48] text-[#D09515] flex items-center justify-center border border-[#D09515]/20 shadow-md">
              <Lock className="h-5 w-5 text-[#D09515]" />
            </div>
            <h2 className="mt-6 text-2xl md:text-3xl font-black text-[#061F48] tracking-tight">
              Administrative Portal
            </h2>
            <p className="mt-2 text-xs text-[#061F48]/70 font-semibold leading-relaxed">
              Sign in with your approved Google account. Founder accounts have full control and can authorize additional administrators.
            </p>
          </div>
          {loginError && (
            <div className="bg-red-50 border border-red-100 text-red-700 p-3.5 rounded-xl text-xs font-bold flex items-center gap-2">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}
          <button
            type="button"
            onClick={handleAdminGoogleLogin}
            className="w-full flex items-center justify-center gap-3 py-3.5 px-4 text-xs font-extrabold uppercase tracking-wider rounded-xl text-white bg-[#061F48] hover:bg-[#D09515] transition-all duration-200 shadow-md"
          >
            Continue with Google
          </button>
          <div className="rounded-2xl bg-[#F8F5ED] border border-[#D09515]/20 p-4 text-[10px] text-[#061F48]/70 font-semibold leading-relaxed">
            <strong className="text-[#061F48]">Approved Founder emails:</strong><br />
            pranjalagrawal576@gmail.com<br />
            hr.conceptmadeeasyclasses@gmail.com
          </div>
        </div>
      </div>
    );
  }


  return (
    <div className="min-h-screen pb-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 space-y-8 animate-fade-in">
      
      {/* Admin Header panel */}
      <div className="bg-white border border-[#061F48]/10 p-6 sm:p-8 rounded-[2rem] shadow-xl flex flex-col md:flex-row justify-between items-center gap-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#D09515] opacity-[0.03] rounded-full blur-xl pointer-events-none"></div>
        <div className="space-y-1.5 text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start gap-2">
            <span className="text-[9px] font-black text-[#D09515] bg-[#F8F5ED] border border-[#D09515]/30 px-3 py-1 rounded-full uppercase tracking-wider">
              COORDINATION WORKSPACE
            </span>
            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
              SECURE
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-[#061F48] tracking-tight">
            Concept Made Easy Administrator Portal
          </h1>
          <p className="text-xs text-[#061F48]/60 font-semibold leading-relaxed">
            Welcome back, Coordinator Admin. Manage dynamic batch scheduling, counselor callbacks, and verified scholarship approvals.
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider border border-red-200 text-red-600 bg-red-50 hover:bg-red-100 hover:text-red-700 transition-colors shrink-0"
        >
          <LogOut className="h-4 w-4" />
          <span>Exit Panel</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-[#061F48]/10 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-[#061F48]/5 text-[#061F48] rounded-2xl shrink-0">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#061F48]/50 uppercase tracking-widest block">Total Enquiries</span>
            <span className="text-xl sm:text-2xl font-black text-[#061F48]">{totalEnquiriesCount}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-[#061F48]/10 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-500 rounded-2xl shrink-0">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-amber-500/80 uppercase tracking-widest block">Pending Callback</span>
            <span className="text-xl sm:text-2xl font-black text-[#061F48]">{pendingEnquiriesCount}</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-[#061F48]/10 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-emerald-600/80 uppercase tracking-widest block">Enrolled Students</span>
            <span className="text-xl sm:text-2xl font-black text-[#061F48]">{enrolledEnquiriesCount}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-[#061F48]/10 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-[#F8F5ED] text-[#D09515] rounded-2xl shrink-0">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <span className="text-[9px] font-bold text-[#D09515] uppercase tracking-widest block">Scholarships Active</span>
            <span className="text-xl sm:text-2xl font-black text-[#061F48]">{activeScholarshipsCount}</span>
          </div>
        </div>

      </div>

      {/* SECURE SUBMISSIONS GATEWAY NOTICE */}
      <div className="bg-emerald-50 border border-emerald-200/60 p-5 rounded-3xl flex flex-col md:flex-row items-center gap-4 justify-between shadow-sm">
        <div className="flex items-center space-x-3.5 text-center md:text-left">
          <div className="h-10 w-10 rounded-xl bg-emerald-600/10 flex items-center justify-center text-emerald-600 shrink-0">
            <CheckCircle className="h-5 w-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase text-emerald-800 tracking-wider">
              Web Forms Submission Database (वेब ​​फॉर्म सबमिशन हब)
            </h3>
            <p className="text-[11px] text-emerald-700/80 font-bold leading-relaxed mt-0.5">
              All student admission enquiries (from the Contact page) and provisional scholarship profile entries (from the Scholarship calculator) are captured here in real-time. This submission gateway is locked to authorized coordinators.
            </p>
          </div>
        </div>
        <div className="bg-white px-4 py-2 rounded-xl border border-emerald-100 text-[9px] font-black text-emerald-800 uppercase tracking-wider shrink-0 shadow-sm">
          🔒 Secure Admin-Only Database
        </div>
      </div>

      {/* TABS NAVIGATION BAR */}
      <div className="flex border-b border-[#061F48]/10 scrollbar-none overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('enquiries')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'enquiries' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Users className="h-4 w-4" />
          <span>Admission Enquiries</span>
        </button>

        <button
          onClick={() => setActiveTab('scholarships')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'scholarships' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Award className="h-4 w-4" />
          <span>Scholarship Applications</span>
        </button>

        <button
          onClick={() => setActiveTab('teachers')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'teachers' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Calendar className="h-4 w-4" />
          <span>Teacher & Slot timings</span>
        </button>

        <button
          onClick={() => setActiveTab('doubts')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'doubts' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Student Doubts Desk</span>
        </button>

        <button
          onClick={() => setActiveTab('announcements')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'announcements' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <AlertCircle className="h-4 w-4" />
          <span>Broadcast Notices</span>
        </button>

         <button
          onClick={() => setActiveTab('policies')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'policies' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Briefcase className="h-4 w-4" />
          <span>Legal Policies CMS</span>
        </button>

        <button
          onClick={() => setActiveTab('financials')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'financials' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Landmark className="h-4 w-4" />
          <span>Payouts & Financials</span>
        </button>

        {isFounder && (
          <button
            onClick={() => setActiveTab('access')}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'access' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
          >
            <Lock className="h-4 w-4" />
            <span>Admin Access</span>
          </button>
        )}

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 transition-all shrink-0 flex items-center gap-2 ${activeTab === 'settings' ? 'border-[#D09515] text-[#D09515]' : 'border-transparent text-[#061F48]/60 hover:text-[#061F48]'}`}
        >
          <Settings className="h-4 w-4" />
          <span>Workspace Settings</span>
        </button>
      </div>

      {/* TAB CONTENT: ADMISSION ENQUIRIES */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Controls line */}
          <div className="bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#061F48]/40" />
              <input
                type="text"
                value={enquirySearch}
                onChange={(e) => setEnquirySearch(e.target.value)}
                placeholder="Search by name, phone or class..."
                className="w-full bg-[#F8F5ED] border border-[#061F48]/10 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
              />
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-wider mr-2 hidden lg:inline">Status Filter:</span>
              {['ALL', 'Pending', 'Called', 'Enrolled', 'Archived'].map((st) => (
                <button
                  key={st}
                  onClick={() => setEnquiryStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${enquiryStatusFilter === st ? 'bg-[#061F48] text-white' : 'bg-[#F8F5ED] text-[#061F48]/65 hover:bg-[#061F48]/5'}`}
                >
                  {st}
                </button>
              ))}

              <button
                onClick={() => setShowAddEnquiryModal(true)}
                className="ml-2 bg-[#D09515] hover:bg-[#061F48] text-white px-4 py-2 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-colors flex items-center gap-1 shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Manual Enquiry</span>
              </button>
            </div>

          </div>

          {/* Enquiries Grid */}
          {(filteredEnquiries || []).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#061F48]/5 space-y-3">
              <p className="text-xs text-[#061F48]/50 font-bold">No enquiries match your search criteria.</p>
              <button 
                onClick={() => { setEnquirySearch(''); setEnquiryStatusFilter('ALL'); }}
                className="text-xs font-extrabold text-[#D09515] uppercase tracking-wider underline"
              >
                Reset Search Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {(filteredEnquiries || []).map((enq) => (
                <div 
                  key={enq.id}
                  className="bg-white p-6 rounded-3xl border border-[#061F48]/10 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                >
                  {/* Status Indicator top tag */}
                  <div className="absolute top-0 right-0">
                    <span className={`px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-wider block ${
                      enq.status === 'Pending' ? 'bg-amber-500 text-white' :
                      enq.status === 'Called' ? 'bg-blue-500 text-white' :
                      enq.status === 'Enrolled' ? 'bg-emerald-600 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {enq.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-black text-[#D09515] uppercase tracking-widest block">CLASS {enq.studentClass}th STUDENT</span>
                      <h4 className="text-lg font-bold text-[#061F48]">{enq.name}</h4>
                      <p className="text-xs font-bold text-[#061F48]/70">{enq.phone}</p>
                    </div>

                    <div className="bg-[#F8F5ED] p-3 rounded-xl border border-[#061F48]/5 space-y-1">
                      <span className="text-[9px] font-black text-[#061F48]/50 uppercase block">DESIRED PROGRAM</span>
                      <span className="text-xs font-bold text-[#061F48]">{enq.course}</span>
                    </div>

                    {enq.message && (
                      <p className="text-xs text-[#061F48]/80 font-medium italic leading-relaxed">
                        "{enq.message}"
                      </p>
                    )}

                    {/* Counselor Administrative Notes */}
                    <div className="border-t border-[#061F48]/5 pt-3">
                      <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block mb-1">Internal Coordinator Notes:</span>
                      {editingEnquiryId === enq.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={enquiryNote}
                            onChange={(e) => setEnquiryNote(e.target.value)}
                            placeholder="Write callback results, schedule details or follow-ups..."
                            rows={2}
                            className="w-full p-2.5 bg-[#F8F5ED] border border-[#061F48]/15 rounded-lg text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                          ></textarea>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveEnquiryNote(enq.id)}
                              className="bg-[#061F48] hover:bg-[#D09515] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Save Note</span>
                            </button>
                            <button
                              onClick={() => { setEditingEnquiryId(null); setEnquiryNote(''); }}
                              className="border border-[#061F48]/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-[#061F48]/60 uppercase"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-xs text-[#061F48]/80 font-bold bg-[#F8F5ED] p-2.5 rounded-lg border border-[#061F48]/5 flex-1 min-h-[36px]">
                            {enq.notes ? enq.notes : <span className="text-slate-400 font-medium italic">No coordinator notes. click write note below.</span>}
                          </p>
                          <button
                            onClick={() => { setEditingEnquiryId(enq.id); setEnquiryNote(enq.notes || ''); }}
                            className="text-[9px] font-black text-[#D09515] uppercase tracking-wider underline hover:text-[#061F48] shrink-0 mt-2"
                          >
                            Edit Note
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions bar */}
                  <div className="border-t border-[#061F48]/5 pt-3 flex flex-wrap gap-1.5 justify-between items-center text-[10px] font-extrabold text-[#061F48]/50 uppercase mt-4">
                    <span>Submitted: {new Date(enq.submittedAt).toLocaleDateString()}</span>
                    
                    <div className="flex items-center gap-1.5">
                      {enq.status !== 'Called' && (
                        <button
                          onClick={() => updateEnquiryStatus(enq.id, 'Called')}
                          className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                          title="Mark as Called"
                        >
                          <PhoneCall className="h-3 w-3" />
                          <span>Called</span>
                        </button>
                      )}
                      
                      {enq.status !== 'Enrolled' && (
                        <button
                          onClick={() => updateEnquiryStatus(enq.id, 'Enrolled')}
                          className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 px-2.5 py-1.5 rounded-lg flex items-center gap-1"
                          title="Mark as Enrolled"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>Enroll</span>
                        </button>
                      )}

                      {enq.status !== 'Archived' && (
                        <button
                          onClick={() => updateEnquiryStatus(enq.id, 'Archived')}
                          className="bg-gray-100 text-gray-600 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
                          title="Archive"
                        >
                          Archive
                        </button>
                      )}

                      <button
                        onClick={() => deleteEnquiry(enq.id)}
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors border border-transparent hover:border-red-100"
                        title="Delete Enquiry"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: SCHOLARSHIP APPLICATIONS */}
      {activeTab === 'scholarships' && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Filter line */}
          <div className="bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
            
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#061F48]/40" />
              <input
                type="text"
                value={scholarshipSearch}
                onChange={(e) => setScholarshipSearch(e.target.value)}
                placeholder="Search by student, school name..."
                className="w-full bg-[#F8F5ED] border border-[#061F48]/10 pl-10 pr-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-[10px] font-black text-[#061F48]/50 uppercase tracking-wider mr-2 hidden lg:inline">Application Status:</span>
              {['ALL', 'Pending', 'Contacted', 'Approved', 'Declined'].map((st) => (
                <button
                  key={st}
                  onClick={() => setScholarshipStatusFilter(st)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wide transition-all ${scholarshipStatusFilter === st ? 'bg-[#061F48] text-white' : 'bg-[#F8F5ED] text-[#061F48]/65 hover:bg-[#061F48]/5'}`}
                >
                  {st}
                </button>
              ))}
            </div>

          </div>

          {/* Grid list of scholarship submissions */}
          {(filteredScholarships || []).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#061F48]/5 space-y-3">
              <p className="text-xs text-[#061F48]/50 font-bold">No scholarship applications matches your filter.</p>
              <button 
                onClick={() => { setScholarshipSearch(''); setScholarshipStatusFilter('ALL'); }}
                className="text-xs font-extrabold text-[#D09515] uppercase tracking-wider underline animate-pulse"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {(filteredScholarships || []).map((sch) => (
                <div 
                  key={sch.id}
                  className="bg-white border border-[#061F48]/10 rounded-3xl p-6 md:p-8 hover:shadow-lg transition-all relative flex flex-col justify-between"
                >
                  {/* Status label absolute corner */}
                  <div className="absolute top-0 right-0">
                    <span className={`px-5 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ${
                      sch.status === 'Approved' ? 'bg-emerald-600 text-white' :
                      sch.status === 'Declined' ? 'bg-red-600 text-white' :
                      sch.status === 'Contacted' ? 'bg-blue-500 text-white' :
                      'bg-amber-500 text-white'
                    }`}>
                      {sch.status}
                    </span>
                  </div>

                  {/* Top card block with student details */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6 border-b border-[#061F48]/5">
                    
                    <div className="md:col-span-4 space-y-2">
                      <span className="text-[10px] font-black text-[#D09515] uppercase tracking-widest block">APPLICANT DOSSIER</span>
                      <h4 className="text-lg font-black text-[#061F48] leading-tight">{sch.studentName}</h4>
                      <p className="text-xs font-bold text-[#061F48]/70">Parent: {sch.parentName}</p>
                      <p className="text-xs font-bold text-[#061F48]/70">Phone: {sch.phone}</p>
                      {sch.email && <p className="text-[11px] text-[#061F48]/60 font-medium font-mono">{sch.email}</p>}
                    </div>

                    <div className="md:col-span-5 space-y-2">
                      <span className="text-[10px] font-black text-[#D09515] uppercase tracking-widest block">ACADEMICS & ECONOMIC BRACKETS</span>
                      <div className="text-xs font-semibold text-[#061F48]/80 space-y-1">
                        <p>Class: <strong className="text-[#061F48]">Class {sch.studentClass}th ({sch.board} Board)</strong></p>
                        <p>School: <strong className="text-[#061F48]">{sch.schoolName}</strong></p>
                        <p>Previous Score Range: <strong className="text-[#061F48] font-bold">{sch.previousScore === 'above-95' ? 'Above 95%' : sch.previousScore === '90-95' ? '90% – 95%' : '80% – 90%'}</strong></p>
                        <p>Family Income bracket: <strong className="text-[#061F48] font-bold">{sch.familyIncome === 'below-3' ? 'Below ₹3L LPA' : '₹3L – ₹6L LPA'}</strong></p>
                      </div>
                    </div>

                    <div className="md:col-span-3 bg-[#F8F5ED] p-4 rounded-2xl border border-[#D09515]/35 flex flex-col justify-center items-center text-center">
                      <span className="text-[9px] font-black text-[#061F48]/60 uppercase tracking-widest">CALCULATED CONCESSION</span>
                      <span className="text-3xl font-black text-[#D09515] mt-1">{sch.calculatedConcession}%</span>
                      <span className="text-[8px] font-bold text-[#061F48]/60 uppercase tracking-wider block mt-1">OFF ON TUITION</span>
                    </div>

                  </div>

                  {/* Achievements column */}
                  {sch.achievements && (
                    <div className="py-4 border-b border-[#061F48]/5 space-y-1">
                      <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block">Co-curricular / Olympiad Achievements:</span>
                      <p className="text-xs text-[#061F48]/85 font-semibold bg-amber-50/40 p-2.5 rounded-xl border border-amber-100/50">
                        "{sch.achievements}"
                      </p>
                    </div>
                  )}

                  {/* Notes & Actions */}
                  <div className="pt-4 space-y-4">
                    
                    {/* Admin internal notes */}
                    <div>
                      <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block mb-1">Administrative Approval Notes:</span>
                      {editingScholarshipId === sch.id ? (
                        <div className="space-y-2">
                          <textarea
                            value={scholarshipNote}
                            onChange={(e) => setScholarshipNote(e.target.value)}
                            placeholder="Add scholarship verification checklist notes..."
                            rows={2}
                            className="w-full p-2.5 bg-[#F8F5ED] border border-[#061F48]/15 rounded-lg text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                          ></textarea>
                          <div className="flex gap-2">
                            <button
                              onClick={() => saveScholarshipNote(sch.id)}
                              className="bg-[#061F48] hover:bg-[#D09515] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Save Note</span>
                            </button>
                            <button
                              onClick={() => { setEditingScholarshipId(null); setScholarshipNote(''); }}
                              className="border border-[#061F48]/10 px-3 py-1.5 rounded-lg text-[10px] font-black text-[#061F48]/60 uppercase"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <p className="text-xs text-[#061F48]/80 font-bold bg-[#F8F5ED] p-2.5 rounded-lg border border-[#061F48]/5 flex-1 min-h-[36px]">
                            {sch.notes ? sch.notes : <span className="text-slate-400 font-medium italic">Awaiting documents verify notes. Click edit note to update.</span>}
                          </p>
                          <button
                            onClick={() => { setEditingScholarshipId(sch.id); setScholarshipNote(sch.notes || ''); }}
                            className="text-[9px] font-black text-[#D09515] uppercase tracking-wider underline hover:text-[#061F48] shrink-0 mt-2"
                          >
                            Edit Note
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Bottom Status Toggles */}
                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-[#061F48]/5 text-[10px] font-extrabold text-[#061F48]/40 uppercase">
                      <span>Submitted on: {new Date(sch.submittedAt).toLocaleDateString()}</span>
                      
                      <div className="flex items-center gap-2">
                        {sch.status !== 'Contacted' && (
                          <button
                            onClick={() => updateScholarshipStatus(sch.id, 'Contacted')}
                            className="bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-100 px-3 py-1.5 rounded-xl"
                          >
                            Mark Contacted
                          </button>
                        )}

                        {sch.status !== 'Approved' && (
                          <button
                            onClick={() => updateScholarshipStatus(sch.id, 'Approved')}
                            className="bg-emerald-50 text-emerald-600 border border-emerald-100 hover:bg-emerald-100 px-3 py-1.5 rounded-xl flex items-center gap-1"
                          >
                            <CheckCircle className="h-3 w-3" />
                            <span>Approve Allowance</span>
                          </button>
                        )}

                        {sch.status !== 'Declined' && (
                          <button
                            onClick={() => updateScholarshipStatus(sch.id, 'Declined')}
                            className="bg-red-50 text-red-600 border border-red-100 hover:bg-red-100 px-3 py-1.5 rounded-xl flex items-center gap-1"
                          >
                            <XCircle className="h-3 w-3" />
                            <span>Decline Application</span>
                          </button>
                        )}

                        <button
                          onClick={() => deleteScholarship(sch.id)}
                          className="text-red-500 hover:bg-red-50 p-2 rounded-xl border border-transparent hover:border-red-100 transition-colors"
                          title="Delete Application"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                  </div>

                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* TAB CONTENT: TEACHERS & SLOTS TIMINGS */}
      {activeTab === 'teachers' && (
        <div className="space-y-6 animate-fade-in bg-white p-6 md:p-8 rounded-[2rem] border border-[#061F48]/10">
          
          <div className="border-b border-[#061F48]/15 pb-4">
            <h3 className="text-lg font-black text-[#061F48]">Active Faculty Schedules & Slot Allocations</h3>
            <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">
              Change preferred teacher slot timings on demand. These updates reflect immediately in dynamic counseling sessions.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#061F48]/10 text-xs">
              <thead>
                <tr className="text-left font-black text-[#061F48]/60 uppercase tracking-wider">
                  <th className="pb-3 pr-4">Teacher Name</th>
                  <th className="pb-3 px-4">Subject Core</th>
                  <th className="pb-3 px-4">Standard Targets</th>
                  <th className="pb-3 px-4">Preferred Slot Timings</th>
                  <th className="pb-3 px-4">Status</th>
                  <th className="pb-3 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#061F48]/5 font-bold text-[#061F48]/80">
                {(teachers || []).map((teach) => (
                  <tr key={teach.id} className="hover:bg-[#F8F5ED]/40 transition-colors">
                    
                    {/* Name */}
                    <td className="py-4 pr-4">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-[#061F48]/10 text-[#061F48] flex items-center justify-center font-black text-[10px]">
                          {(teach?.teacherName || 'T').split(' ').filter(Boolean).map(n => n[0]).join('')}
                        </div>
                        <span className="font-extrabold text-[#061F48]">{teach.teacherName}</span>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="py-4 px-4 text-[#061F48]/75">
                      {teach.subject}
                    </td>

                    {/* Classes */}
                    <td className="py-4 px-4">
                      <span className="bg-[#F8F5ED] border border-[#061F48]/10 px-2 py-1 rounded text-[10px]">
                        {teach.classes}
                      </span>
                    </td>

                    {/* Timings */}
                    <td className="py-4 px-4">
                      <input
                        type="text"
                        value={teach.preferredTimings}
                        onChange={(e) => updateTeacherTimings(teach.id, e.target.value)}
                        className="bg-[#F8F5ED] border border-[#061F48]/10 rounded-lg px-3 py-1.5 font-semibold text-xs text-[#061F48] focus:outline-none focus:border-[#D09515] w-64"
                      />
                    </td>

                    {/* Status badge */}
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase ${teach.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-amber-50 text-amber-600 border border-amber-100'}`}>
                        {teach.status}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 pl-4 text-right">
                      <button
                        onClick={() => toggleTeacherStatus(teach.id)}
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border transition-colors ${teach.status === 'Active' ? 'border-amber-200 text-amber-600 bg-amber-50/50 hover:bg-amber-50' : 'border-emerald-200 text-emerald-600 bg-emerald-50/50 hover:bg-emerald-50'}`}
                      >
                        {teach.status === 'Active' ? 'Set Off-Duty' : 'Set Active'}
                      </button>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB CONTENT: STUDENT DOUBTS DESK */}
      {activeTab === 'doubts' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-3xl border border-[#061F48]/10 shadow-sm">
            <h3 className="text-lg font-black text-[#061F48]">1:1 Student Doubt Tickets</h3>
            <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">
              Review conceptual questions posted by active students and send live text guidance back to their personal portals.
            </p>
          </div>

          {(studentDoubts || []).length === 0 ? (
            <div className="bg-white p-12 text-center rounded-3xl border border-[#061F48]/5 space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <p className="text-xs text-[#061F48]/50 font-bold">No doubts have been submitted by students yet.</p>
              <p className="text-[10px] text-[#061F48]/40 font-semibold max-w-sm mx-auto leading-normal">
                Students can log in to the <strong>Student Portal</strong> and type physical sums, NCERT questions, or CBSE doubts in their doubts box to sync here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(studentDoubts || []).map((doubt) => (
                <div 
                  key={doubt.id} 
                  className="bg-white p-6 rounded-3xl border border-[#061F48]/10 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0">
                    <span className={`px-4 py-1.5 rounded-bl-2xl text-[9px] font-black uppercase tracking-wider block ${
                      doubt.status === 'Answered' ? 'bg-emerald-600 text-white' : 'bg-amber-50 text-white'
                    }`}>
                      {doubt.status}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black uppercase text-[#D09515] bg-[#D09515]/10 px-2 py-0.5 rounded border border-[#D09515]/15">
                          CLASS {doubt.studentClass}TH
                        </span>
                        <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                          {doubt.subject}
                        </span>
                      </div>
                      <h4 className="text-base font-extrabold text-[#061F48] mt-2">By: {doubt.studentName}</h4>
                      <p className="text-[10px] text-[#061F48]/50 font-bold mt-0.5">Logged: {doubt.submittedAt}</p>
                    </div>

                    <div className="bg-[#F8F5ED] p-4 rounded-xl border border-[#061F48]/5">
                      <span className="text-[9px] font-black text-[#061F48]/40 uppercase tracking-wider block mb-1">Question Description:</span>
                      <p className="text-xs font-bold text-[#061F48]/80 leading-relaxed italic">
                        "{doubt.question}"
                      </p>
                    </div>

                    {doubt.status === 'Answered' && doubt.answer && (
                      <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100">
                        <span className="text-[9px] font-black text-emerald-800 uppercase tracking-wider block mb-1">Sent Response:</span>
                        <p className="text-xs text-emerald-950 font-bold leading-relaxed">
                          {doubt.answer}
                        </p>
                      </div>
                    )}

                    {answeringDoubtId === doubt.id && (
                      <div className="space-y-3 pt-2 border-t border-[#061F48]/5">
                        <label className="text-[9px] font-black text-[#D09515] uppercase tracking-wider block">Write Solution/Explanation:</label>
                        <textarea
                          value={doubtAnswerText}
                          onChange={(e) => setDoubtAnswerText(e.target.value)}
                          placeholder="Type step-by-step NCERT formula guidance or mentor feedback..."
                          rows={3}
                          className="w-full p-2.5 bg-[#F8F5ED] border border-[#061F48]/15 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
                        ></textarea>
                        
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => setAnsweringDoubtId(null)}
                            className="px-3.5 py-1.5 rounded-lg text-[10px] font-extrabold uppercase border border-[#061F48]/10 hover:bg-[#061F48]/5"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => submitDoubtResponse(doubt.id)}
                            className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                          >
                            <Send className="h-3 w-3" />
                            <span>Send Resolution</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {answeringDoubtId !== doubt.id && (
                    <div className="flex justify-between items-center border-t border-[#061F48]/5 pt-3.5">
                      <button
                        onClick={() => deleteDoubtTicket(doubt.id)}
                        className="text-red-500 hover:text-red-700 text-[10px] font-black uppercase tracking-wider flex items-center gap-1"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Remove</span>
                      </button>

                      <button
                        onClick={() => {
                          setAnsweringDoubtId(doubt.id);
                          setDoubtAnswerText(doubt.answer || '');
                        }}
                        className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase flex items-center gap-1"
                      >
                        <MessageSquare className="h-3 w-3" />
                        <span>{doubt.status === 'Answered' ? 'Edit Response' : 'Reply & Resolve'}</span>
                      </button>
                    </div>
                  )}

                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: BROADCAST ANNOUNCEMENTS (TOAST SYSTEM DECK) */}
      {activeTab === 'announcements' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#061F48]/10 shadow-sm space-y-6">
            
            <div className="border-b border-[#061F48]/15 pb-4">
              <h3 className="text-lg font-black text-[#061F48]">Admin Broadcasting Control Center</h3>
              <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">
                Simulate sending dynamic notifications that instantly pop up as custom toast components in all open student & teacher portals.
              </p>
            </div>

            {/* Sub Tabs Selection */}
            <div className="flex bg-[#F8F5ED] p-1.5 rounded-xl border border-[#061F48]/5 gap-2 max-w-lg">
              <button
                type="button"
                onClick={() => setAnnouncementSubTab('notice')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${announcementSubTab === 'notice' ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-[#061F48]/5'}`}
              >
                📢 General Announcement
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementSubTab('class')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${announcementSubTab === 'class' ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-[#061F48]/5'}`}
              >
                🏫 Live Class Alert
              </button>
              <button
                type="button"
                onClick={() => setAnnouncementSubTab('result')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${announcementSubTab === 'result' ? 'bg-[#061F48] text-white' : 'text-[#061F48]/70 hover:bg-[#061F48]/5'}`}
              >
                🏆 Test Result Release
              </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Left Column: Form */}
              <div className="lg:col-span-7 bg-[#F8F5ED] p-6 rounded-2xl border border-[#061F48]/10 shadow-inner">
                
                {announcementSubTab === 'notice' && (
                  <form onSubmit={handlePublishNotice} className="space-y-4">
                    <span className="text-[9px] font-black uppercase bg-[#061F48] text-white px-2.5 py-0.5 rounded">Notice Broadcast Form</span>
                    
                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Sender Label Name</label>
                      <input
                        type="text"
                        required
                        value={announcementSender}
                        onChange={(e) => setAnnouncementSender(e.target.value)}
                        placeholder="e.g. Chief Director Desk"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Announcement Title *</label>
                      <input
                        type="text"
                        required
                        value={announcementTitle}
                        onChange={(e) => setAnnouncementTitle(e.target.value)}
                        placeholder="e.g. Science Board Exam Blueprint Released"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Message Text *</label>
                      <textarea
                        required
                        value={announcementMessage}
                        onChange={(e) => setAnnouncementMessage(e.target.value)}
                        placeholder="Provide detailed announcement details that users will see on their toast message description..."
                        rows={3}
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                      ></textarea>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors"
                    >
                      Publish & Sync Notice Toast
                    </button>
                  </form>
                )}

                {announcementSubTab === 'class' && (
                  <form onSubmit={handlePublishClassAlert} className="space-y-4">
                    <span className="text-[9px] font-black uppercase bg-sky-600 text-white px-2.5 py-0.5 rounded">Live Class Broadcast Form</span>
                    
                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Target Class batch</label>
                        <select
                          value={classAlertClass}
                          onChange={(e) => setClassAlertClass(e.target.value)}
                          className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48]"
                        >
                          <option value="ALL">All Classes (6 to 12)</option>
                          <option value="6">Class 6 Batch</option>
                          <option value="7">Class 7 Batch</option>
                          <option value="8">Class 8 Batch</option>
                          <option value="9">Class 9 Batch</option>
                          <option value="10">Class 10 Batch</option>
                          <option value="11">Class 11 Batch</option>
                          <option value="12">Class 12 Batch</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Starting Timeline</label>
                        <input
                          type="text"
                          required
                          value={classAlertTime}
                          onChange={(e) => setClassAlertTime(e.target.value)}
                          placeholder="e.g. in 15 minutes / at 4:30 PM today"
                          className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Subject Name *</label>
                      <input
                        type="text"
                        required
                        value={classAlertSubject}
                        onChange={(e) => setClassAlertSubject(e.target.value)}
                        placeholder="e.g. Spherical Mirror Optics Derivation"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Mentor Faculty *</label>
                      <input
                        type="text"
                        required
                        value={classAlertMentor}
                        onChange={(e) => setClassAlertMentor(e.target.value)}
                        placeholder="e.g. Prof. Ankit Malik"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-sky-600 hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors"
                    >
                      Publish Class Reminder Toast
                    </button>
                  </form>
                )}

                {announcementSubTab === 'result' && (
                  <form onSubmit={handlePublishResultAlert} className="space-y-4">
                    <span className="text-[9px] font-black uppercase bg-[#D09515] text-[#061F48] px-2.5 py-0.5 rounded font-black">Test Results Release Form</span>
                    
                    <div className="space-y-1 pt-2">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Test Series Exam Name *</label>
                      <input
                        type="text"
                        required
                        value={resultAlertTest}
                        onChange={(e) => setResultAlertTest(e.target.value)}
                        placeholder="e.g. Advanced Integral Calculus Quiz 2"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Grades / Class Score Metrics Summary</label>
                      <input
                        type="text"
                        required
                        value={resultAlertScore}
                        onChange={(e) => setResultAlertScore(e.target.value)}
                        placeholder="e.g. Class Median: 82% (Excellent Performance)"
                        className="w-full p-3 bg-white border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-[#D09515] hover:bg-[#061F48] text-[#061F48] hover:text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-colors"
                    >
                      Broadcast Test Result Toast
                    </button>
                  </form>
                )}

              </div>

              {/* Right Column: Concept card */}
              <div className="lg:col-span-5 bg-[#F8F5ED]/40 p-6 rounded-2xl border border-[#061F48]/5 space-y-4 text-xs font-bold text-[#061F48]/80">
                <h4 className="text-sm font-black text-[#061F48] flex items-center gap-1.5">
                  <AlertCircle className="h-4.5 w-4.5 text-[#D09515]" />
                  <span>How to verify live toasts</span>
                </h4>
                <p className="leading-relaxed">
                  The toast notification engine uses native **HTML5 LocalStorage events** for seamless, low-latency, client-side offline cross-tab communication.
                </p>
                <div className="p-4 bg-white rounded-xl border border-[#061F48]/10 space-y-2">
                  <p className="text-[11px] font-black text-[#061F48]">Recommended Verification steps:</p>
                  <ul className="list-decimal pl-4 space-y-1 text-[10.5px] leading-relaxed">
                    <li>Open this application in **two separate tabs / side-by-side splits**.</li>
                    <li>Log into the **Student Portal** in one tab (e.g. name Rohan).</li>
                    <li>Remain on this **Admin Portal** tab and publish any broadcast from the left side.</li>
                    <li>Watch the **Student tab receive the notice instantly** without page refresh!</li>
                    <li>Clicking standard action buttons in the toast will automatically scroll the user or update their current portal routing seamlessly!</li>
                  </ul>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* TAB CONTENT: LEGAL POLICIES CMS */}
      {activeTab === 'policies' && (
        <div className="space-y-6 animate-fade-in">
          
          <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#061F48]/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-xl font-black text-[#061F48] flex items-center gap-2">
                <LucideIcons.ShieldAlert className="h-6 w-6 text-[#D09515]" />
                <span>Legal Policies CMS & Portal Control</span>
              </h3>
              <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">
                Manage, update, or add to the 20 legal policies shown on the website. All changes sync in real-time.
              </p>
            </div>
            
            <div className="flex gap-3">
              {(policies || []).length === 0 && (
                <button
                  onClick={initializeDefaultPolicies}
                  disabled={isInitializingPolicies}
                  className="px-4 py-2.5 bg-[#D09515] hover:bg-[#F8F5ED] hover:text-[#061F48] text-white border border-[#D09515] rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isInitializingPolicies ? (
                    <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <LucideIcons.UploadCloud className="h-4 w-4" />
                  )}
                  <span>Deploy 20 Default Policies</span>
                </button>
              )}
              
              <button
                onClick={() => setEditingPolicy({
                  id: 'custom-policy-' + Math.floor(1000 + Math.random() * 9000),
                  title: 'New Compliance Policy',
                  category: 'Core Agreements',
                  lastUpdated: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                  iconName: 'FileText',
                  summary: 'Short descriptive overview of what this regulatory policy covers.',
                  clauses: [{ title: '1. Policy Definition', text: 'Detail statement here.' }]
                })}
                className="px-4 py-2.5 bg-[#061F48] hover:bg-[#F8F5ED] hover:text-[#061F48] text-white border border-[#061F48] rounded-xl text-xs font-bold transition-all duration-200 shadow-sm flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                <span>Create Custom Policy</span>
              </button>
            </div>
          </div>

          {editingPolicy ? (
            /* POLICY CMS EDITOR FORM */
            <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#D09515]/40 shadow-md space-y-6 animate-fade-in">
              <div className="flex justify-between items-center border-b border-[#061F48]/10 pb-4">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#D09515] bg-[#D09515]/10 px-2.5 py-1 rounded-full">CMS Editor Console</span>
                  <h4 className="text-lg font-black text-[#061F48] mt-2">
                    {editingPolicy.id.startsWith('custom-policy-') ? 'Drafting Brand New Policy' : `Editing Compliance Policy: "${editingPolicy.title}"`}
                  </h4>
                </div>
                <button
                  onClick={() => setEditingPolicy(null)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Policy ID (Immutable key)</label>
                  <input
                    type="text"
                    value={editingPolicy.id}
                    disabled={!editingPolicy.id.startsWith('custom-policy-')}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, id: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515] disabled:opacity-60"
                  />
                  {editingPolicy.id.startsWith('custom-policy-') && (
                    <p className="text-[9px] text-[#D09515] font-semibold mt-0.5">Use lowercase letters, numbers, and dashes only.</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Policy Title</label>
                  <input
                    type="text"
                    value={editingPolicy.title}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, title: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Regulatory Category</label>
                  <select
                    value={editingPolicy.category}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, category: e.target.value as any })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  >
                    <option value="Core Agreements">Core Agreements</option>
                    <option value="Fee & Billing Rules">Fee & Billing Rules</option>
                    <option value="Academic Integrity">Academic Integrity</option>
                    <option value="Security & Data Use">Security & Data Use</option>
                    <option value="Regulatory & Compliance">Regulatory & Compliance</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Last Updated Label</label>
                  <input
                    type="text"
                    value={editingPolicy.lastUpdated}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, lastUpdated: e.target.value })}
                    placeholder="e.g. June 2026"
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  />
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Lucide Icon Name</label>
                  <select
                    value={editingPolicy.iconName}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, iconName: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  >
                    <option value="FileText">📄 FileText (Standard Terms)</option>
                    <option value="Shield">🛡️ Shield (Privacy)</option>
                    <option value="RotateCcw">↩️ RotateCcw (Refund)</option>
                    <option value="RefreshCw">🔄 RefreshCw (Course swap)</option>
                    <option value="DollarSign">💵 DollarSign (Pricing)</option>
                    <option value="CreditCard">💳 CreditCard (Payments)</option>
                    <option value="Truck">🚚 Truck (Delivery)</option>
                    <option value="PowerOff">🔌 PowerOff (Termination)</option>
                    <option value="BookOpen">📖 BookOpen (Honor Code)</option>
                    <option value="Copyright">©️ Copyright (Intellectual Property)</option>
                    <option value="Users">👥 Users (Conduct)</option>
                    <option value="UserCheck">✅ UserCheck (KYC Verification)</option>
                    <option value="Eye">👁️ Eye (Cookies)</option>
                    <option value="Lock">🔒 Lock (Children COPPA)</option>
                    <option value="ShieldCheck">🛡️ ShieldCheck (Confidentiality)</option>
                    <option value="MessageSquare">💬 MessageSquare (Anti-spam)</option>
                    <option value="Scale">⚖️ Scale (Grievance)</option>
                    <option value="Hammer">🔨 Hammer (Disputes)</option>
                    <option value="AlertTriangle">⚠️ AlertTriangle (Liability)</option>
                    <option value="CheckCircle">✨ CheckCircle (Indemnity)</option>
                  </select>
                </div>

                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-[#061F48]/80 block uppercase tracking-wider">Compliance Brief / Summary</label>
                  <textarea
                    rows={2}
                    value={editingPolicy.summary}
                    onChange={(e) => setEditingPolicy({ ...editingPolicy, summary: e.target.value })}
                    className="w-full p-3 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                  />
                </div>
              </div>

              {/* CLAUSES DYNAMIC BUILDER */}
              <div className="border-t border-[#061F48]/10 pt-4 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-black text-[#061F48] uppercase tracking-wider">Dynamic Clauses & Statements Builder</h5>
                    <p className="text-[10px] text-gray-400 font-semibold mt-0.5">Define sections, articles, and rules sequentially.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const currentClauses = editingPolicy.clauses || [];
                      const updatedClauses = [...currentClauses, { title: `${(currentClauses || []).length + 1}. Clause Item`, text: '' }];
                      setEditingPolicy({ ...editingPolicy, clauses: updatedClauses });
                    }}
                    className="px-3 py-1.5 bg-[#D09515]/10 hover:bg-[#D09515]/25 text-[#D09515] rounded-xl text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
                  >
                    <Plus className="h-3 w-3" />
                    <span>Append Clause</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {(editingPolicy.clauses || []).map((clause, idx) => (
                    <div key={idx} className="p-4 bg-gray-50 rounded-2xl border border-gray-200/60 relative space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-[#D09515] uppercase tracking-wider">Clause Block #{idx + 1}</span>
                        {(editingPolicy.clauses || []).length > 1 && (
                          <button
                            type="button"
                            onClick={() => {
                              const updatedClauses = (editingPolicy.clauses || []).filter((_, i) => i !== idx);
                              setEditingPolicy({ ...editingPolicy, clauses: updatedClauses });
                            }}
                            className="p-1 hover:bg-red-50 text-red-500 rounded-md transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        <div className="space-y-1">
                          <input
                            type="text"
                            value={clause.title}
                            placeholder="e.g. 1. Terms of Acceptance"
                            onChange={(e) => {
                              const updatedClauses = [...(editingPolicy.clauses || [])];
                              updatedClauses[idx].title = e.target.value;
                              setEditingPolicy({ ...editingPolicy, clauses: updatedClauses });
                            }}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515]"
                          />
                        </div>
                        <div className="space-y-1">
                          <textarea
                            rows={3}
                            value={clause.text}
                            placeholder="Detailed clause statement..."
                            onChange={(e) => {
                              const updatedClauses = [...(editingPolicy.clauses || [])];
                              updatedClauses[idx].text = e.target.value;
                              setEditingPolicy({ ...editingPolicy, clauses: updatedClauses });
                            }}
                            className="w-full p-2.5 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:ring-1 focus:ring-[#D09515] leading-relaxed"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SAVE / CANCEL */}
              <div className="border-t border-[#061F48]/10 pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingPolicy(null)}
                  className="px-4 py-2 border border-[#061F48]/10 text-[#061F48]/60 hover:text-[#061F48] text-xs font-bold rounded-xl transition-all"
                >
                  Discard draft
                </button>
                <button
                  type="button"
                  onClick={() => handleSavePolicy(editingPolicy)}
                  disabled={isSavingPolicy}
                  className="px-5 py-2 bg-[#D09515] text-white hover:bg-[#061F48] text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {isSavingPolicy ? (
                    <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>Publish to Website</span>
                </button>
              </div>
            </div>
          ) : (
            /* CMS LIST VIEW */
            <div className="space-y-6">
              <div className="bg-white p-4 rounded-2xl border border-[#061F48]/5 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="relative w-full sm:w-80">
                  <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#061F48]/40" />
                  <input
                    type="text"
                    placeholder="Search policies by title or summary..."
                    value={policySearch}
                    onChange={(e) => setPolicySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-[#F8F5ED]/60 border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] placeholder-[#061F48]/40 focus:outline-none"
                  />
                </div>
                
                <span className="text-[10.5px] font-black text-[#061F48]/65 uppercase">
                  ACTIVE REGULATORY CORPUS: {(policies || []).length} POLICIES
                </span>
              </div>

              {(policies || []).length === 0 ? (
                <div className="p-12 text-center bg-white border border-[#061F48]/10 rounded-3xl space-y-4 shadow-sm animate-fade-in">
                  <div className="h-16 w-16 bg-[#D09515]/10 rounded-full flex items-center justify-center mx-auto">
                    <LucideIcons.ShieldAlert className="h-8 w-8 text-[#D09515]" />
                  </div>
                  <div className="max-w-md mx-auto space-y-2">
                    <h4 className="text-sm font-bold text-[#061F48] uppercase tracking-wide">Firestore Legal Collection is Empty</h4>
                    <p className="text-xs text-[#061F48]/60 leading-relaxed font-semibold">
                      Your website will currently load our fallback default legal policies. Pre-populate your Firestore database to enable live, modular content synchronization instantly.
                    </p>
                  </div>
                  <button
                    onClick={initializeDefaultPolicies}
                    disabled={isInitializingPolicies}
                    className="px-5 py-2.5 bg-[#061F48] text-white font-bold text-xs rounded-xl hover:bg-[#F8F5ED] hover:text-[#061F48] border border-[#061F48] transition-all flex items-center gap-2 mx-auto shadow-sm disabled:opacity-50"
                  >
                    {isInitializingPolicies ? (
                      <LucideIcons.Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <LucideIcons.CloudLightning className="h-4 w-4" />
                    )}
                    <span>Pre-populate Firestore Legal Corpus</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
                  {policies
                    .filter(p => p.title.toLowerCase().includes(policySearch.toLowerCase()) || p.summary.toLowerCase().includes(policySearch.toLowerCase()))
                    .map((policy) => {
                      // Dynamically render the icon
                      const IconComponent = (LucideIcons as any)[policy.iconName] || LucideIcons.FileText;
                      return (
                        <div key={policy.id} className="bg-white p-6 rounded-3xl border border-[#061F48]/10 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
                          <div className="space-y-3">
                            <div className="flex justify-between items-start">
                              <span className="text-[9px] font-black text-[#D09515] bg-[#F8F5ED] border border-[#D09515]/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
                                {policy.category}
                              </span>
                              <span className="text-[10px] text-gray-400 font-bold">
                                CME-{policy.id.toUpperCase()}
                              </span>
                            </div>
                            
                            <div className="flex items-start gap-3">
                              <div className="p-2.5 bg-[#061F48]/5 rounded-xl text-[#061F48] mt-0.5">
                                <IconComponent className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-black text-[#061F48] leading-tight">{policy.title}</h4>
                                <p className="text-[10px] text-[#061F48]/50 font-bold mt-1">Last revised: {policy.lastUpdated}</p>
                              </div>
                            </div>
                            
                            <p className="text-xs text-[#061F48]/70 font-semibold leading-relaxed line-clamp-2">
                              {policy.summary}
                            </p>
                          </div>
                          
                          <div className="border-t border-[#061F48]/5 pt-4 mt-5 flex justify-between items-center">
                            <span className="text-[10px] text-[#061F48]/40 font-black uppercase tracking-wider">
                              {(policy.clauses || []).length} Articles Defined
                            </span>
                            
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingPolicy(policy)}
                                className="p-1.5 bg-[#061F48]/5 hover:bg-[#061F48] hover:text-white text-[#061F48] rounded-lg transition-colors flex items-center justify-center"
                                title="Edit legal clauses"
                              >
                                <LucideIcons.Edit3 className="h-4 w-4" />
                              </button>
                              
                              <button
                                onClick={() => handleDeletePolicy(policy.id, policy.title)}
                                className="p-1.5 bg-red-50 hover:bg-red-500 hover:text-white text-red-500 rounded-lg transition-colors flex items-center justify-center"
                                title="Delete policy"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: WORKSPACE SETTINGS */}
      {activeTab === 'access' && isFounder && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#061F48]/10 shadow-sm">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-[#061F48]">Founder Access Control</h3>
                <p className="text-xs text-[#061F48]/60 font-semibold mt-1">Only Founder accounts can grant or revoke Admin Portal access.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full bg-[#F8F5ED] text-[#D09515] text-[9px] font-black uppercase tracking-widest">Founder</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="user@example.com"
                className="flex-1 px-4 py-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold text-[#061F48] focus:outline-none focus:border-[#D09515]"
              />
              <button onClick={grantAdminAccess} className="px-5 py-3 rounded-xl bg-[#061F48] text-white text-xs font-black uppercase tracking-wider hover:bg-[#D09515] transition-colors">
                Grant Admin
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#061F48]/10 shadow-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-[#061F48] mb-4">Permanent Founder Accounts</h3>
            <div className="space-y-3">
              {founderEmails.map((email) => (
                <div key={email} className="flex items-center justify-between gap-3 rounded-2xl bg-[#F8F5ED] px-4 py-3">
                  <span className="text-xs font-bold text-[#061F48]">{email}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-[#D09515]">Full Access</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-xs font-semibold text-amber-900">
            A person must sign in once before you can grant Admin access. Once granted, their Google account can enter the private Admin Portal.
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-[#061F48]/10 space-y-6 animate-fade-in">
          
          <div className="border-b border-[#061F48]/15 pb-4">
            <h3 className="text-lg font-black text-[#061F48]">System & Database Utilities</h3>
            <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">
              Perform essential maintenance or reset operational data intentionally.
            </p>
          </div>

          <div className="space-y-4 max-w-xl">
            <div className="p-4 bg-red-50/50 rounded-2xl border border-red-100 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-red-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Destructive Reset Action</span>
              </h4>
              <p className="text-xs text-[#061F48]/75 leading-relaxed font-semibold">
                This maintenance action clears custom enquiries and scholarship submissions. Use it only when intentionally resetting operational data.
              </p>
              
              <button
                onClick={resetAllData}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Reset Database to Defaults</span>
              </button>
            </div>

            <div className="bg-[#F8F5ED] border border-[#D09515]/30 p-5 rounded-3xl space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#061F48] flex items-center gap-1.5">
                <Briefcase className="h-4 w-4 text-[#D09515]" />
                <span>Interactive Verification Guidelines</span>
              </h4>
              <p className="text-[11px] text-[#061F48]/70 leading-relaxed font-semibold">
                1. Navigate to the **"Enquire Now"** page (Contact form), fill a query, and hit submit.<br />
                2. Navigate to the **"Scholarship Test"** page, calculate a grant percentage, and hit submit.<br />
                3. Navigate back to this **Admin Portal** to observe the records loaded live at the top of the columns.<br />
                4. Write custom follow-up status updates or edit dynamic teacher preferred timings.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* TAB CONTENT: PAYOUTS & FINANCIALS */}
      {activeTab === 'financials' && (
        <AdminFinancials />
      )}

      {/* MODAL: MANUAL ENQUIRY LOGGING */}
      {showAddEnquiryModal && (
        <div className="fixed inset-0 bg-[#061F48]/35 backdrop-blur-sm z-[2000] flex justify-center items-center p-4">
          <div className="bg-white border border-[#061F48]/15 rounded-[2.5rem] w-full max-w-xl p-8 relative animate-fade-in shadow-2xl">
            
            <button
              onClick={() => setShowAddEnquiryModal(false)}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 transition-colors text-slate-400 hover:text-[#061F48]"
            >
              <XCircle className="h-6 w-6" />
            </button>

            <form onSubmit={handleAddNewEnquiry} className="space-y-5">
              <div className="border-b border-[#061F48]/10 pb-3 mb-2">
                <h3 className="text-lg font-black text-[#061F48]">Log Manual Offline Enquiry</h3>
                <p className="text-xs text-[#061F48]/60 font-semibold mt-0.5">Use this to save enquiries received directly via offline mobile calls.</p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={newEnquiryForm.name}
                  onChange={(e) => setNewEnquiryForm({...newEnquiryForm, name: e.target.value})}
                  placeholder="e.g. Rahul Sen"
                  className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Mobile / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  value={newEnquiryForm.phone}
                  onChange={(e) => setNewEnquiryForm({...newEnquiryForm, phone: e.target.value})}
                  placeholder="e.g. +91 91234 56789"
                  className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Class *</label>
                  <select
                    value={newEnquiryForm.studentClass}
                    onChange={(e) => setNewEnquiryForm({...newEnquiryForm, studentClass: e.target.value})}
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48]"
                  >
                    <option value="6">Class 6</option>
                    <option value="7">Class 7</option>
                    <option value="8">Class 8</option>
                    <option value="9">Class 9</option>
                    <option value="10">Class 10</option>
                    <option value="11">Class 11</option>
                    <option value="12">Class 12</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Course Program *</label>
                  <select
                    value={newEnquiryForm.course}
                    onChange={(e) => setNewEnquiryForm({...newEnquiryForm, course: e.target.value})}
                    className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-bold text-[#061F48]"
                  >
                    <option value="Boards Prep">Boards Tuition Prep</option>
                    <option value="JEE Prep">JEE Competitive prep</option>
                    <option value="NEET Prep">NEET Competitive prep</option>
                    <option value="Doubt sessions">Doubt Sessions Only</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black text-[#061F48]/80 uppercase block">Counselor Message Notes</label>
                <textarea
                  value={newEnquiryForm.message}
                  onChange={(e) => setNewEnquiryForm({...newEnquiryForm, message: e.target.value})}
                  placeholder="Details of call conversation..."
                  rows={3}
                  className="w-full p-3 bg-[#F8F5ED] border border-[#061F48]/10 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#D09515]"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-[#061F48] hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-extrabold uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
              >
                Insert Offline Record
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
