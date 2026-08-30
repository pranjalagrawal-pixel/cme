import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Gift, 
  Copy, 
  Check, 
  Users, 
  Award, 
  Share2, 
  ArrowRight, 
  Sparkles, 
  Coins, 
  AlertCircle 
} from 'lucide-react';
import { 
  db, 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc, 
  getDoc 
} from '../lib/firebase';
import { useToast } from '../context/ToastContext';

interface ReferAFriendProps {
  profile: {
    id: string;
    name: string;
    studentClass: string;
    isPaid: boolean;
    rollNumber: string | null;
    referralCode?: string;
    referredBy?: string;
    referralCount?: number;
    referralRewards?: number;
  };
  onProfileUpdate: (updatedFields: any) => void;
}

interface ReferredFriend {
  id: string;
  name: string;
  studentClass: string;
  isPaid: boolean;
  createdAt: string;
}

export default function ReferAFriend({ profile, onProfileUpdate }: ReferAFriendProps) {
  const { addToast } = useToast();
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [referredFriends, setReferredFriends] = useState<ReferredFriend[]>([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [referralInput, setReferralInput] = useState('');
  const [validatingCode, setValidatingCode] = useState(false);

  // Generate a custom referral code if the user doesn't have one
  const userReferralCode = profile?.referralCode || (() => {
    const rawName = (profile?.name || 'STUDENT').trim().toUpperCase().replace(/[^A-Z]/g, '');
    const cleanName = rawName.substring(0, 8) || 'LEARNER';
    const idStr = String(profile?.id || '1001');
    const suffix = idStr.length >= 4 ? idStr.substring(idStr.length - 4).toUpperCase() : idStr.toUpperCase().padStart(4, '0');
    return `CME-${cleanName}-${suffix}`;
  })();

  // Sync the referral code to Firestore if it hasn't been set yet
  useEffect(() => {
    const syncReferralCode = async () => {
      if (!profile?.referralCode && profile?.id) {
        try {
          const profileId = String(profile.id);
          const isGoogleUser = profileId.startsWith('google_');
          const userId = isGoogleUser ? profileId.replace('google_', '') : profileId;
          const collectionName = isGoogleUser ? 'users' : 'portal_users';
          
          const userDocRef = doc(db, collectionName, userId);
          await updateDoc(userDocRef, {
            referralCode: userReferralCode,
            referralCount: profile.referralCount || 0,
            referralRewards: profile.referralRewards || 0
          });

          if (onProfileUpdate) {
            onProfileUpdate({
              referralCode: userReferralCode,
              referralCount: profile.referralCount || 0,
              referralRewards: profile.referralRewards || 0
            });
          }
        } catch (err) {
          console.error('Failed to auto-sync referral code to Firestore:', err);
        }
      }
    };
    syncReferralCode();
  }, [profile?.referralCode, profile?.id, userReferralCode]);

  // Load friends who have signed up using this student's referral code
  const fetchReferredFriends = async () => {
    if (!userReferralCode) return;
    setLoadingFriends(true);
    try {
      const friends: ReferredFriend[] = [];

      // Query standard "users" collection (Google sign-ins)
      const q1 = query(collection(db, 'users'), where('referredBy', '==', userReferralCode));
      const snap1 = await getDocs(q1);
      snap1.forEach(docSnap => {
        const data = docSnap.data();
        friends.push({
          id: docSnap.id,
          name: data.displayName || 'Anonymous Learner',
          studentClass: data.studentClass || '10',
          isPaid: data.isPaid || false,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      // Query custom "portal_users" collection (Custom logins)
      const q2 = query(collection(db, 'portal_users'), where('referredBy', '==', userReferralCode));
      const snap2 = await getDocs(q2);
      snap2.forEach(docSnap => {
        const data = docSnap.data();
        friends.push({
          id: docSnap.id,
          name: data.name || 'Anonymous Learner',
          studentClass: data.studentClass || '10',
          isPaid: data.isPaid || false,
          createdAt: data.createdAt || new Date().toISOString()
        });
      });

      // Sort by registered date (newest first)
      friends.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReferredFriends(friends);

      // Dynamically calculate actual rewards/counts based on verified friends
      const verifiedCount = (friends || []).filter(f => f && f.isPaid).length;
      const calculatedRewards = verifiedCount * 500;

      if (profile?.id && (verifiedCount !== (profile.referralCount || 0) || calculatedRewards !== (profile.referralRewards || 0))) {
        // Sync local stats if mismatch found
        const profileId = String(profile.id);
        const isGoogleUser = profileId.startsWith('google_');
        const userId = isGoogleUser ? profileId.replace('google_', '') : profileId;
        const collectionName = isGoogleUser ? 'users' : 'portal_users';
        const userDocRef = doc(db, collectionName, userId);

        await updateDoc(userDocRef, {
          referralCount: verifiedCount,
          referralRewards: calculatedRewards
        });

        if (onProfileUpdate) {
          onProfileUpdate({
            referralCount: verifiedCount,
            referralRewards: calculatedRewards
          });
        }
      }

    } catch (err) {
      console.error('Error fetching referred friends:', err);
    } finally {
      setLoadingFriends(false);
    }
  };

  useEffect(() => {
    fetchReferredFriends();
  }, [userReferralCode, profile.id]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(userReferralCode);
    setCopiedCode(true);
    addToast({
      title: '📋 Referral Code Copied!',
      description: `Your custom code ${userReferralCode} is on your clipboard.`,
      type: 'info',
      duration: 2500
    });
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    const referralLink = `${window.location.origin}/student-portal?ref=${userReferralCode}`;
    navigator.clipboard.writeText(referralLink);
    setCopiedLink(true);
    addToast({
      title: '🔗 Invite Link Copied!',
      description: 'Send this unique link to your classmates to invite them.',
      type: 'success',
      duration: 2500
    });
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const shareViaWhatsApp = () => {
    const referralLink = `${window.location.origin}/student-portal?ref=${userReferralCode}`;
    const text = `Hey! I'm using Concept Made Easy (CME) to prepare for my board exams. Sign up using my referral link and get ₹500 discount on enrollment, plus access to free formula sheets! Code: ${userReferralCode} \n👉 Link: ${referralLink}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Submit/Apply a referral code for this user if they haven't enrolled yet
  const handleApplyReferralCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = referralInput.trim().toUpperCase();
    if (!cleanCode) return;

    if (cleanCode === userReferralCode) {
      addToast({
        title: '⚠️ Invalid Referral Code',
        description: "You cannot refer yourself! Enter a classmate's code.",
        type: 'error',
        duration: 3500
      });
      return;
    }

    setValidatingCode(true);
    try {
      let referrerDoc: any = null;
      let referrerCollection = '';
      let referrerId = '';

      // Check users collection
      const q1 = query(collection(db, 'users'), where('referralCode', '==', cleanCode));
      const snap1 = await getDocs(q1);
      if (!snap1.empty) {
        referrerDoc = snap1.docs[0].data();
        referrerCollection = 'users';
        referrerId = snap1.docs[0].id;
      } else {
        // Check portal_users collection
        const q2 = query(collection(db, 'portal_users'), where('referralCode', '==', cleanCode));
        const snap2 = await getDocs(q2);
        if (!snap2.empty) {
          referrerDoc = snap2.docs[0].data();
          referrerCollection = 'portal_users';
          referrerId = snap2.docs[0].id;
        }
      }

      if (!referrerDoc) {
        addToast({
          title: '❌ Code Not Found',
          description: 'This referral code does not exist. Please check and try again.',
          type: 'error',
          duration: 3500
        });
        setValidatingCode(false);
        return;
      }

      // Valid referral code! Update our document
      const isGoogleUser = profile.id.startsWith('google_');
      const userId = isGoogleUser ? profile.id.replace('google_', '') : profile.id;
      const myCollectionName = isGoogleUser ? 'users' : 'portal_users';
      
      const myDocRef = doc(db, myCollectionName, userId);
      await updateDoc(myDocRef, {
        referredBy: cleanCode
      });

      onProfileUpdate({
        referredBy: cleanCode
      });

      addToast({
        title: '🎉 Referral Code Applied!',
        description: `₹500 discount successfully unlocked! Total admission fee lowered to ₹4,499.`,
        type: 'success',
        duration: 5000
      });
      
      setReferralInput('');
    } catch (err) {
      console.error('Error applying referral code:', err);
      addToast({
        title: 'Failed to Apply Code',
        description: 'An unexpected database error occurred. Please try again.',
        type: 'error',
        duration: 3000
      });
    } finally {
      setValidatingCode(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 md:p-8 shadow-sm space-y-6">
      
      {/* Banner / Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-[#061F48]/5">
        <div className="space-y-1">
          <div className="inline-flex items-center space-x-1.5 bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200">
            <Gift className="h-3.5 w-3.5 text-[#D09515]" />
            <span className="text-[9px] font-black uppercase tracking-widest">Refer & Earn program</span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#061F48]">Invite Friends, Learn Together!</h3>
          <p className="text-xs text-[#061F48]/60 font-semibold leading-relaxed">
            Share the gift of concept mastery. Give classmates <strong>₹500 off</strong> on admission, and unlock cash rewards + topper cheat sheets for yourself!
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Copy Code & Link */}
        <div className="lg:col-span-7 space-y-5">
          <div className="bg-[#F8F5ED] border border-[#D09515]/25 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-black uppercase text-[#061F48] tracking-wide flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#D09515]" />
              Your Custom Invitation Hub
            </h4>

            {/* Referral Code Row */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#061F48]/50 tracking-wider block">Your Referral Code</label>
              <div className="flex gap-2">
                <div className="bg-white border border-[#061F48]/10 px-4 py-2.5 rounded-xl text-xs font-mono font-black text-[#061F48] tracking-wider flex-grow flex items-center shadow-inner">
                  {userReferralCode}
                </div>
                <button
                  onClick={handleCopyCode}
                  className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  {copiedCode ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Referral Link Row */}
            <div className="space-y-1.5">
              <label className="text-[9px] font-black uppercase text-[#061F48]/50 tracking-wider block">Your Custom Invite Link</label>
              <div className="flex gap-2">
                <div className="bg-white border border-[#061F48]/10 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#061F48]/70 truncate flex-grow flex items-center shadow-inner">
                  {`${window.location.origin}/student-portal?ref=${userReferralCode}`}
                </div>
                <button
                  onClick={handleCopyLink}
                  className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 rounded-xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-colors shadow-sm shrink-0"
                >
                  {copiedLink ? <Check className="h-4 w-4 text-emerald-300" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedLink ? 'Copied' : 'Copy Link'}</span>
                </button>
              </div>
            </div>

            {/* Social Actions */}
            <div className="pt-2 border-t border-[#061F48]/5 flex flex-wrap gap-2.5 justify-between items-center">
              <span className="text-[10px] font-bold text-[#061F48]/60">Or share directly with friends:</span>
              <button
                onClick={shareViaWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors flex items-center gap-1 shadow-sm"
              >
                <Share2 className="h-3 w-3" />
                <span>Share on WhatsApp</span>
              </button>
            </div>
          </div>

          {/* Reward Perks Description */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex gap-4 items-start">
            <div className="h-10 w-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center shrink-0 border border-amber-200">
              <Award className="h-5 w-5" />
            </div>
            <div className="space-y-1">
              <h5 className="text-xs font-black text-[#061F48] uppercase tracking-wide">Program Milestone Rewards</h5>
              <p className="text-[11px] text-[#061F48]/70 font-semibold leading-relaxed">
                For every friend who registers and activates their official CME enrollment:
              </p>
              <ul className="text-[10.5px] text-[#061F48]/80 font-bold list-disc pl-4 space-y-0.5 mt-1.5">
                <li><strong className="text-emerald-600">₹500 Cash Reward</strong> credited straight to your linked account / UPI index.</li>
                <li><strong className="text-purple-600">Premium Topper Cheat Sheets</strong> unlocked instantly in your toolkit desk.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side: Stats & Apply Code */}
        <div className="lg:col-span-5 space-y-5 flex flex-col justify-between">
          
          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#F8F5ED] border border-[#061F48]/5 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <Users className="h-5 w-5 text-[#061F48] mx-auto" />
              <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/50 block">Friends Referred</span>
              <span className="text-2xl font-black text-[#061F48] block">
                {(referredFriends || []).length}
              </span>
              <span className="text-[8px] font-bold text-gray-400 block">
                ({(referredFriends || []).filter(f => f && f.isPaid).length} Verified Enrollment)
              </span>
            </div>

            <div className="bg-[#F8F5ED] border border-[#061F48]/5 p-4 rounded-2xl text-center space-y-1 shadow-sm">
              <Coins className="h-5 w-5 text-[#D09515] mx-auto" />
              <span className="text-[9px] font-black uppercase tracking-wider text-[#061F48]/50 block">Rewards Earned</span>
              <span className="text-2xl font-black text-emerald-600 block">
                ₹{(profile.referralRewards || 0).toLocaleString()}
              </span>
              <span className="text-[8px] font-bold text-emerald-600/70 block uppercase tracking-wider font-mono">
                Synced to Account
              </span>
            </div>
          </div>

          {/* Entered Code Block (if referred by someone else) */}
          {!profile.isPaid ? (
            <div className="bg-slate-50 border border-slate-200/60 p-4.5 rounded-2xl space-y-3.5">
              <div className="space-y-1">
                <h5 className="text-[11px] font-black text-[#061F48] uppercase tracking-wide flex items-center gap-1.5">
                  <AlertCircle className="h-4 w-4 text-[#D09515]" />
                  Have an Invite Code?
                </h5>
                <p className="text-[10px] text-[#061F48]/60 font-semibold leading-relaxed">
                  Enter your classmate's custom invite code to instantly reduce your CME enrollment fees from ₹4,999 to ₹4,499.
                </p>
              </div>

              {profile.referredBy ? (
                <div className="bg-emerald-50 border border-emerald-200/50 text-emerald-800 p-3 rounded-xl flex justify-between items-center text-xs font-bold">
                  <span>Code Applied: <strong>{profile.referredBy}</strong></span>
                  <span className="text-[9px] font-black uppercase bg-emerald-100 px-2 py-0.5 rounded tracking-wide text-emerald-700">
                    ₹500 Discount Active!
                  </span>
                </div>
              ) : (
                <form onSubmit={handleApplyReferralCode} className="flex gap-2">
                  <input
                    type="text"
                    value={referralInput}
                    onChange={(e) => setReferralInput(e.target.value)}
                    placeholder="e.g. CME-RAHUL-4C2E"
                    className="bg-white border border-[#061F48]/15 px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex-grow focus:outline-none focus:border-[#D09515] text-[#061F48] placeholder-gray-400"
                  />
                  <button
                    type="submit"
                    disabled={validatingCode || !referralInput.trim()}
                    className="bg-[#061F48] hover:bg-[#D09515] disabled:bg-gray-300 text-white px-4 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm shrink-0"
                  >
                    {validatingCode ? 'Verifying' : 'Apply'}
                  </button>
                </form>
              )}
            </div>
          ) : (
            profile.referredBy && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold space-y-1">
                <span className="text-[8.5px] font-black uppercase tracking-wider text-emerald-600 block">Applied Sign-Up Promotion</span>
                <p>You enrolled using code <strong>{profile.referredBy}</strong> and claimed your ₹500 discount on your annual tuition fees.</p>
              </div>
            )
          )}

        </div>

      </div>

      {/* Referred Friends Real-Time Queue */}
      <div className="pt-4 border-t border-[#061F48]/5 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-black uppercase text-[#061F48]/50 tracking-wider">Your Referral Network Status</span>
          <button
            onClick={fetchReferredFriends}
            className="text-[9px] font-black text-[#D09515] uppercase tracking-wider hover:underline"
          >
            Refresh List
          </button>
        </div>

        {loadingFriends ? (
          <div className="text-center py-4 text-xs font-bold text-gray-400 animate-pulse">
            Syncing referral network from cloud database...
          </div>
        ) : (referredFriends || []).length === 0 ? (
          <div className="text-center py-6 bg-slate-50 rounded-2xl text-xs font-bold text-gray-400 border border-dashed border-gray-200">
            No friends have registered with your code yet. Share your invite link to get started!
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#061F48]/5 shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#F8F5ED] text-[#061F48]/60 font-black uppercase tracking-wider text-[9px] border-b border-[#061F48]/5">
                  <th className="py-2 px-3">Student Name</th>
                  <th className="py-2 px-3">Class</th>
                  <th className="py-2 px-3">Registration Date</th>
                  <th className="py-2 px-3 text-right">Enrollment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#061F48]/5 font-semibold text-[#061F48]/80">
                {(referredFriends || []).map((friend) => (
                  <tr key={friend.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-2.5 px-3 font-bold">{friend.name}</td>
                    <td className="py-2.5 px-3">Class {friend.studentClass}th</td>
                    <td className="py-2.5 px-3 text-gray-400">
                      {new Date(friend.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      {friend.isPaid ? (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded border border-emerald-100">
                          <Check className="h-3 w-3" />
                          <span>Verified (₹500 Credited)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded border border-amber-100 animate-pulse">
                          <span>Pending Payment</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
