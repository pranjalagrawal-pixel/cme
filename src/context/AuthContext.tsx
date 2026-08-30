import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  loginWithGoogle: (
    role?: 'student' | 'teacher' | 'parent' | 'admin'
  ) => Promise<void>;
  logout: () => Promise<void>;
  updateProfileData: (data: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { addToast } = useToast();

  /*
   * This ref prevents the Firebase auth-state listener from automatically
   * creating a student profile while an Admin login is being processed.
   */
  const pendingLoginRole = useRef<
    'student' | 'teacher' | 'parent' | 'admin' | null
  >(null);

  const fetchUserProfile = async (
    uid: string
  ): Promise<UserProfile | null> => {
    try {
      const docRef = doc(db, 'users', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as UserProfile;
      }
    } catch (err) {
      console.error(
        'Error fetching user profile from Firestore:',
        err
      );
    }

    return null;
  };

  const refreshProfile = async () => {
    if (!user) return;

    const profile = await fetchUserProfile(user.uid);

    if (profile) {
      setUserProfile(profile);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser) => {
        try {
          setUser(currentUser);

          if (!currentUser) {
            setUserProfile(null);
            setLoading(false);
            return;
          }

          const requestedRole = pendingLoginRole.current;

          /*
           * ADMIN LOGIN SECURITY
           *
           * Never automatically create a student profile when someone
           * is attempting to enter the Admin Portal.
           */
          if (requestedRole === 'admin') {
            const founder = isFounderEmail(currentUser.email);

            const existingProfile = await fetchUserProfile(
              currentUser.uid
            );

            /*
             * Founder accounts are always allowed as admin.
             */
            if (founder) {
              if (!existingProfile) {
                const founderProfile: UserProfile = {
                  uid: currentUser.uid,
                  email: currentUser.email,
                  displayName: currentUser.displayName,
                  photoURL: currentUser.photoURL,
                  role: 'admin',
                  studentClass: '10',
                  targetExam: 'Boards',
                  focusHours: 0,
                  completedChapters: [],
                  hasReadTopperBlueprint: false,
                  enrollmentNumber:
                    'CME-EN-' +
                    Math.floor(
                      100000 + Math.random() * 900000
                    ),
                  aadhaarStatus: 'None',
                  createdAt: new Date().toISOString()
                };

                await setDoc(
                  doc(db, 'users', currentUser.uid),
                  founderProfile
                );

                setUserProfile(founderProfile);
              } else {
                /*
                 * If a Founder somehow has an old/non-admin profile,
                 * automatically restore admin role.
                 */
                if (existingProfile.role !== 'admin') {
                  await updateDoc(
                    doc(db, 'users', currentUser.uid),
                    {
                      role: 'admin'
                    }
                  );

                  setUserProfile({
                    ...existingProfile,
                    role: 'admin'
                  });
                } else {
                  setUserProfile(existingProfile);
                }
              }

              pendingLoginRole.current = null;
              setLoading(false);
              return;
            }

            /*
             * Existing authorized admin.
             */
            if (
              existingProfile &&
              existingProfile.role === 'admin'
            ) {
              setUserProfile(existingProfile);

              pendingLoginRole.current = null;
              setLoading(false);
              return;
            }

            /*
             * Not authorized.
             *
             * IMPORTANT:
             * Do NOT create a student profile.
             */
            console.warn(
              'Unauthorized Admin Portal login attempt:',
              currentUser.email
            );

            pendingLoginRole.current = null;

            await signOut(auth);

            setUser(null);
            setUserProfile(null);
            setLoading(false);

            return;
          }

          /*
           * NORMAL LOGIN FLOW
           */
          let profile = await fetchUserProfile(
            currentUser.uid
          );

          if (!profile) {
            const localProfileStr = localStorage.getItem(
              'cme_student_profile'
            );

            let studentClass = '10';
            let targetExam = 'Boards';

            if (localProfileStr) {
              try {
                const parsed =
                  JSON.parse(localProfileStr);

                studentClass =
                  parsed.studentClass || '10';

                targetExam =
                  parsed.targetExam || 'Boards';
              } catch (e) {
                console.error(
                  'Unable to parse cached student profile:',
                  e
                );
              }
            }

            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,

              /*
               * Founder emails ALWAYS become admin.
               * Everyone else receives the requested normal role.
               */
              role: isFounderEmail(currentUser.email)
                ? 'admin'
                : requestedRole || 'student',

              studentClass,
              targetExam,
              focusHours: 0,
              completedChapters: [],
              hasReadTopperBlueprint: false,

              enrollmentNumber:
                'CME-EN-' +
                Math.floor(
                  100000 + Math.random() * 900000
                ),

              aadhaarStatus: 'None',
              createdAt: new Date().toISOString()
            };

            await setDoc(
              doc(db, 'users', currentUser.uid),
              newProfile
            );

            profile = newProfile;
          } else {
            /*
             * IMPORTANT:
             *
             * Existing users keep their existing role.
             *
             * Clicking a different login button must NOT
             * silently convert a student into an admin or
             * vice versa.
             */
            if (
              isFounderEmail(currentUser.email) &&
              profile.role !== 'admin'
            ) {
              await updateDoc(
                doc(db, 'users', currentUser.uid),
                {
                  role: 'admin'
                }
              );

              profile = {
                ...profile,
                role: 'admin'
              };
            }
          }

          setUserProfile(profile);

          pendingLoginRole.current = null;
          setLoading(false);
        } catch (err) {
          console.error(
            'Authentication state error:',
            err
          );

          pendingLoginRole.current = null;
          setLoading(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (
    preferredRole:
      | 'student'
      | 'teacher'
      | 'parent'
      | 'admin' = 'student'
  ) => {
    setLoading(true);

    /*
     * Tell the auth-state listener what type of login is happening.
     */
    pendingLoginRole.current = preferredRole;

    try {
      const result = await signInWithPopup(
        auth,
        googleProvider
      );

      const currentUser = result.user;

      /*
       * ADMIN LOGIN
       */
      if (preferredRole === 'admin') {
        const founder = isFounderEmail(
          currentUser.email
        );

        const docRef = doc(
          db,
          'users',
          currentUser.uid
        );

        const docSnap = await getDoc(docRef);

        /*
         * Founder = automatically authorized.
         */
        if (founder) {
          if (!docSnap.exists()) {
            const founderProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              photoURL: currentUser.photoURL,
              role: 'admin',
              studentClass: '10',
              targetExam: 'Boards',
              focusHours: 0,
              completedChapters: [],
              hasReadTopperBlueprint: false,
              enrollmentNumber:
                'CME-EN-' +
                Math.floor(
                  100000 + Math.random() * 900000
                ),
              aadhaarStatus: 'None',
              createdAt: new Date().toISOString()
            };

            await setDoc(
              docRef,
              founderProfile
            );

            setUserProfile(founderProfile);
          } else {
            const existingData =
              docSnap.data() as UserProfile;

            if (existingData.role !== 'admin') {
              await updateDoc(docRef, {
                role: 'admin'
              });

              setUserProfile({
                ...existingData,
                role: 'admin'
              });
            } else {
              setUserProfile(existingData);
            }
          }

          pendingLoginRole.current = null;

          addToast({
            title: '🔑 Admin Login Successful!',
            description:
              'Welcome to the CME Administrative Portal.',
            type: 'success',
            duration: 4000
          });

          setLoading(false);
          return;
        }

        /*
         * Existing admin = allowed.
         */
        if (
          docSnap.exists() &&
          (docSnap.data() as UserProfile).role ===
            'admin'
        ) {
          setUserProfile(
            docSnap.data() as UserProfile
          );

          pendingLoginRole.current = null;

          addToast({
            title: '🔑 Admin Login Successful!',
            description:
              'Welcome to the CME Administrative Portal.',
            type: 'success',
            duration: 4000
          });

          setLoading(false);
          return;
        }

        /*
         * RANDOM / NORMAL ACCOUNT:
         *
         * DO NOT CREATE A STUDENT PROFILE.
         */
        pendingLoginRole.current = null;

        await signOut(auth);

        setUser(null);
        setUserProfile(null);

        addToast({
          title: 'Admin Access Denied',
          description:
            'This Google account is not authorized for the CME Administrative Portal.',
          type: 'error',
          duration: 5000
        });

        setLoading(false);
        return;
      }

      /*
       * NORMAL STUDENT / TEACHER / PARENT LOGIN
       */
      const docRef = doc(
        db,
        'users',
        currentUser.uid
      );

      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        const newProfile: UserProfile = {
          uid: currentUser.uid,
          email: currentUser.email,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL,

          role: isFounderEmail(currentUser.email)
            ? 'admin'
            : preferredRole,

          studentClass: '10',
          targetExam: 'Boards',
          focusHours: 0,
          completedChapters: [],
          hasReadTopperBlueprint: false,

          enrollmentNumber:
            'CME-EN-' +
            Math.floor(
              100000 + Math.random() * 900000
            ),

          aadhaarStatus: 'None',
          createdAt: new Date().toISOString()
        };

        await setDoc(
          docRef,
          newProfile
        );

        setUserProfile(newProfile);
      } else {
        /*
         * Existing profile remains unchanged.
         */
        const existingData =
          docSnap.data() as UserProfile;

        if (
          isFounderEmail(currentUser.email) &&
          existingData.role !== 'admin'
        ) {
          await updateDoc(docRef, {
            role: 'admin'
          });

          setUserProfile({
            ...existingData,
            role: 'admin'
          });
        } else {
          setUserProfile(existingData);
        }
      }

      pendingLoginRole.current = null;

      addToast({
        title: '🔑 Login Successful!',
        description: `Welcome back, ${
          currentUser.displayName || 'Learner'
        }! Connected via Google Sign-In.`,
        type: 'success',
        duration: 4000
      });

      setLoading(false);
    } catch (err: any) {
      pendingLoginRole.current = null;

      if (
        err?.code ===
        'auth/popup-closed-by-user'
      ) {
        addToast({
          title: 'Sign-In Cancelled',
          description:
            'The Google authentication popup window was closed before completing.',
          type: 'info',
          duration: 3000
        });
      } else if (
        err?.code === 'auth/popup-blocked'
      ) {
        addToast({
          title: 'Popup Blocked',
          description:
            'Please enable popups for this browser tab to sign in with Google.',
          type: 'warning',
          duration: 5000
        });
      } else if (
        err?.code ===
        'auth/cancelled-popup-request'
      ) {
        console.warn(
          'Google sign-in popup request cancelled.'
        );
      } else {
        console.error(
          'Google sign-in error:',
          err
        );

        addToast({
          title: 'Authentication Failed',
          description:
            err?.message ||
            'Unable to sign in with Google.',
          type: 'error',
          duration: 4000
        });
      }

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
        description:
          'You have been successfully signed out of Concept Made Easy.',
        type: 'info',
        duration: 4000
      });
    } catch (err: any) {
      console.error(
        'Logout error:',
        err
      );
    } finally {
      setLoading(false);
    }
  };

  const updateProfileData = async (
    data: Partial<UserProfile>
  ) => {
    if (!user) return;

    try {
      const docRef = doc(
        db,
        'users',
        user.uid
      );

      await updateDoc(docRef, data);

      setUserProfile((prev) =>
        prev
          ? {
              ...prev,
              ...data
            }
          : null
      );
    } catch (err) {
      console.error(
        'Error updating user profile in Firestore:',
        err
      );

      addToast({
        title: 'Profile Sync Failed',
        description:
          'Unable to save your updates to the Cloud database.',
        type: 'error',
        duration: 3000
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        userProfile,
        loading,
        loginWithGoogle,
        logout,
        updateProfileData,
        refreshProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider'
    );
  }

  return context;
};