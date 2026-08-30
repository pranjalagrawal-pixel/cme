import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  googleProvider, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  User 
} from '../lib/firebase';
import { useToast } from './ToastContext';
import { isFounderEmail } from '../lib/portalAuth';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'student' | 'teacher' | 'parent' | 'admin';
  studentClass?: string;
  targetExam?: string;
  focusHours?: number;
  completedChapters?: string[];
  hasReadTopperBlueprint?: boolean;
  enrollmentNumber?: string;
  aadhaarStatus?: 'Pending' | 'Approved' | 'Rejected' | 'None';
  aadhaarFront?: string;
  aadhaarBack?: string;
  referralCode?: string;
  referredBy?: string;
  referralCount?: number;
  referralRewards?: number;
  isPaid?: boolean;
  rollNumber?: string | null;
  aadhaarFrontName?: string;
  aadhaarBackName?: string;
  aadhaarFrontPreview?: string;
  aadhaarBackPreview?: string;
  aadhaarVerifiedAt?: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  loginWithGoogle: (role?: 'student' | 'teacher' | 'parent' | 'admin') => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const { addToast } = useToast();

  const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.error('Error fetching user profile from Firestore:', err);
    }
    return null;
  };

  const refreshProfile = async () => {
    if (user) {
      const profile = await fetchUserProfile(user.uid);
      if (profile) {
        setUserProfile(profile);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        // Fetch or create user document in Firestore
        let profile = await fetchUserProfile(currentUser.uid);
        if (!profile) {
          // Check if there is a local cached profile name
          const localProfileStr = localStorage.getItem('cme_student_profile');
          let studentClass = '10';
          let targetExam = 'Boards';
          if (localProfileStr) {
            try {
              const parsed = JSON.parse(localProfileStr);
              studentClass = parsed.studentClass || '10';
              targetExam = parsed.targetExam || 'Boards';
            } catch (e) {
              console.error(e);
            }
          }

          // Create new user record
          const newProfile: UserProfile = {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
            photoURL: currentUser.photoURL,
            role: isFounderEmail(currentUser.email) ? 'admin' : 'student',
            studentClass: studentClass,
            targetExam: targetExam,
            focusHours: 0,
            completedChapters: [],
            hasReadTopperBlueprint: false,
            enrollmentNumber: 'CME-EN-' + Math.floor(100000 + Math.random() * 900000),
            aadhaarStatus: 'None',
            createdAt: new Date().toISOString()
          };
          
          await setDoc(doc(db, 'users', currentUser.uid), newProfile);
          profile = newProfile;
        }
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (preferredRole: 'student' | 'teacher' | 'parent' | 'admin' = 'student') => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const currentUser = result.user;
      
      // Check if user already exists
      const docRef = doc(db, 'users', currentUser.uid);
      const docSnap = await getDoc(docRef);
      
      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,
          role: isFounderEmail(currentUser.email) ? 'admin' : preferredRole,
          studentClass: '10',
          targetExam: 'Boards',
          focusHours: 0,
          completedChapters: [],
          hasReadTopperBlueprint: false,
          enrollmentNumber: 'CME-EN-' + Math.floor(100000 + Math.random() * 900000),
          aadhaarStatus: 'None',
          createdAt: new Date().toISOString()
        };
        await setDoc(docRef, newProfile);
        setUserProfile(newProfile);
      } else {
        // If preferredRole matches the existing role or is just standard
        const existingData = docSnap.data() as UserProfile;
        setUserProfile(existingData);
      }

      addToast({
        title: '🔑 Login Successful!',
        description: `Welcome back, ${currentUser.displayName || 'Learner'}! Connected via Google Sign-In.`,
        type: 'success',
        duration: 4000
      });
    } catch (err: any) {
      if (err?.code === 'auth/popup-closed-by-user') {
        addToast({
          title: 'Sign-In Cancelled',
          description: 'The Google authentication popup window was closed before completing.',
          type: 'info',
          duration: 3000
        });
      } else if (err?.code === 'auth/popup-blocked') {
        addToast({
          title: 'Popup Blocked',
          description: 'Please enable popups for this browser tab to sign in with Google.',
          type: 'warning',
          duration: 5000
        });
      } else if (err?.code === 'auth/cancelled-popup-request') {
        // Superceded by a subsequent popup or closed - handle gracefully
        console.warn('Google sign-in popup request cancelled.');
      } else {
        console.error('Google sign-in error:', err);
        addToast({
          title: 'Authentication Failed',
          description: err?.message || 'Unable to sign in with Google.',
          type: 'error',
          duration: 4000
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setUserProfile(null);
      addToast({
        title: '🚪 Logged Out',
        description: 'You have been successfully signed out of Concept Made Easy.',
        type: 'info',
        duration: 4000
      });
    } catch (err: any) {
      console.error('Logout error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (data: Partial<UserProfile>) => {
    if (!user) return;
    try {
      const docRef = doc(db, 'users', user.uid);
      await updateDoc(docRef, data);
      setUserProfile((prev) => prev ? { ...prev, ...data } : null);
    } catch (err) {
      console.error('Error updating user profile in Firestore:', err);
      addToast({
        title: 'Profile Sync Failed',
        description: 'Unable to save your updates to the Cloud database.',
        type: 'error',
        duration: 3000
      });
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      loading,
      loginWithGoogle,
      logout,
      updateProfileData,
      refreshProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
