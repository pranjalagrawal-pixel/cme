export interface Enquiry {
  id: string;
  name: string;
  phone: string;
  studentClass: string;
  course: string;
  message?: string;
  submittedAt: string;
  status: 'Pending' | 'Called' | 'Enrolled' | 'Archived';
  notes?: string;
}

export interface ScholarshipSubmission {
  id: string;
  studentName: string;
  parentName: string;
  phone: string;
  email?: string;
  studentClass: string;
  schoolName: string;
  board: string;
  previousScore: string;
  familyIncome: string;
  courseOfInterest: string;
  achievements?: string;
  calculatedConcession: number;
  submittedAt: string;
  status: 'Pending' | 'Contacted' | 'Approved' | 'Declined';
  notes?: string;
}

export interface TeacherSchedule {
  id: string;
  teacherName: string;
  subject: string;
  classes: string;
  preferredTimings: string;
  status: 'Active' | 'On Leave';
}

export type MilestoneStatus = 'Completed' | 'In Progress' | 'Upcoming' | 'Locked';

export interface ProgressMilestone {
  id: string;
  phaseNumber: number;
  title: string;
  targetDate: string;
  estimatedCompletion: string;
  description: string;
  status: MilestoneStatus;
  progressPercentage: number;
  subjectFocus: string;
  keyDeliverables: string[];
  unlockedBadge?: string;
  completedAt?: string;
}

export interface CompletedAssignment {
  id: string;
  title: string;
  subject: string;
  chapterTopic: string;
  score: string;
  maxScore: number;
  scoredMarks: number;
  percentage: number;
  submittedAt: string;
  gradedBy: string;
  mentorFeedback: string;
  status: 'Completed' | 'Exemplary' | 'Needs Review';
  solutionKeyAvailable: boolean;
  keyStrengths?: string[];
  areasOfImprovement?: string[];
}

export interface PendingTestRevision {
  id: string;
  testTitle: string;
  subject: string;
  chapter: string;
  testDate: string;
  dueDate: string;
  initialScore: string;
  priority: 'High' | 'Medium' | 'Low';
  flaggedConcepts: string[];
  revisionStatus: 'Pending' | 'In Progress' | 'Mastered';
  recommendedAction: string;
  formulaChecklist: string[];
  retestAvailable: boolean;
  revisedAt?: string;
}

export interface ProgressPathData {
  id?: string;
  studentId: string;
  studentName: string;
  studentClass: string;
  overallJourneyProgress: number;
  milestones: ProgressMilestone[];
  completedAssignments: CompletedAssignment[];
  pendingRevisions: PendingTestRevision[];
  updatedAt: string;
}

