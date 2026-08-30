import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  QrCode, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  KeyRound,
  Fingerprint,
  RefreshCw,
  Landmark,
  Coins,
  FileCheck2,
  Info
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { db, doc, updateDoc, getDoc } from '../lib/firebase';

interface BankAccount {
  id: string;
  bankName: string;
  accountHolder: string;
  accountNumber: string;
  ifscCode: string;
  accountType: 'Savings' | 'Current';
  isPrimary: boolean;
  linkedAt: string;
  balance: number;
}

interface BankAccountManagerProps {
  profile: {
    id: string;
    name: string;
    studentClass: string;
    isPaid?: boolean;
  };
}

const INDIAN_BANKS = [
  { name: 'State Bank of India', code: 'SBI', iconBg: 'bg-[#00a2e8]/10 text-[#00a2e8]' },
  { name: 'HDFC Bank', code: 'HDFC', iconBg: 'bg-[#1c3f94]/10 text-[#1c3f94]' },
  { name: 'ICICI Bank', code: 'ICICI', iconBg: 'bg-[#f58220]/10 text-[#f58220]' },
  { name: 'Axis Bank', code: 'AXIS', iconBg: 'bg-[#8c0a3c]/10 text-[#8c0a3c]' },
  { name: 'Kotak Mahindra Bank', code: 'KOTAK', iconBg: 'bg-[#ff0000]/10 text-[#ff0000]' },
  { name: 'Punjab National Bank', code: 'PNB', iconBg: 'bg-[#ffd200]/10 text-[#a01a1f]' }
];

export default function BankAccountManager({ profile }: BankAccountManagerProps) {
  const { addToast } = useToast();
  const [accounts, setAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  // New account form state
  const [bankName, setBankName] = useState<string>('State Bank of India');
  const [accountHolder, setAccountHolder] = useState<string>(profile?.name || '');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('');
  const [accountType, setAccountType] = useState<'Savings' | 'Current'>('Savings');
  
  // Verification simulation state
  const [verificationStep, setVerificationStep] = useState<'idle' | 'depositing' | 'otp' | 'success'>('idle');
  const [otpCode, setOtpCode] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [resendTimer, setResendTimer] = useState<number>(30);

  // Load linked accounts on mount
  useEffect(() => {
    const fetchAccounts = async () => {
      setIsLoading(true);
      try {
        // First try loading from Firestore if profile has id
        if (profile?.id) {
          const userDoc = await getDoc(doc(db, 'portal_users', profile.id));
          if (userDoc.exists() && userDoc.data().linkedBanks) {
            setAccounts(userDoc.data().linkedBanks);
            setIsLoading(false);
            return;
          }
        }
        
        // Fallback to localStorage
        const local = localStorage.getItem(`cme_linked_banks_${profile?.id || 'guest'}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) {
              setAccounts(parsed);
            } else {
              setAccounts([]);
            }
          } catch (e) {
            setAccounts([]);
          }
        } else {
          // Default mock empty accounts
          setAccounts([]);
        }
      } catch (err) {
        console.error('Failed to load bank accounts:', err);
        // Load local fallback
        const local = localStorage.getItem(`cme_linked_banks_${profile?.id || 'guest'}`);
        if (local) {
          try {
            const parsed = JSON.parse(local);
            if (Array.isArray(parsed)) setAccounts(parsed);
            else setAccounts([]);
          } catch (e) {
            setAccounts([]);
          }
        } else {
          setAccounts([]);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccounts();
  }, [profile?.id]);

  // Handle timer for OTP resend
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (verificationStep === 'otp' && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [verificationStep, resendTimer]);

  // Save accounts helper
  const saveAccounts = async (updatedList: BankAccount[]) => {
    setAccounts(updatedList);
    localStorage.setItem(`cme_linked_banks_${profile?.id || 'guest'}`, JSON.stringify(updatedList));
    
    // Synced storage of linked accounts to checkout view for dynamic display
    localStorage.setItem('cme_last_linked_bank_for_checkout', JSON.stringify(updatedList.find(a => a.isPrimary) || updatedList[0] || null));

    if (profile?.id) {
      try {
        await updateDoc(doc(db, 'portal_users', profile.id), {
          linkedBanks: updatedList
        });
      } catch (err) {
        console.error('Failed to update accounts in Firestore:', err);
      }
    }
  };

  const handleLinkInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validations
    if (!accountHolder.trim()) {
      addToast({
        title: '⚠️ Missing Account Holder',
        description: 'Please enter the name of the bank account holder.',
        type: 'error'
      });
      return;
    }

    if ((accountNumber || '').length < 9 || (accountNumber || '').length > 18) {
      addToast({
        title: '⚠️ Invalid Account Number',
        description: 'Account numbers in India typically range from 9 to 18 digits.',
        type: 'error'
      });
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      addToast({
        title: '⚠️ Numbers Do Not Match',
        description: 'Account Number and Confirmation Account Number must be identical.',
        type: 'error'
      });
      return;
    }

    // IFSC validation (e.g., SBIN0001234)
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      addToast({
        title: '⚠️ Invalid IFSC Code',
        description: 'IFSC code should be 11 characters, starting with 4 letters, then a 0, and 6 alphanumeric digits.',
        type: 'error'
      });
      return;
    }

    // Verification Simulator Step 1: Deposit Penny Check
    setVerificationStep('depositing');
    addToast({
      title: '🏦 Requesting Penny-Drop Check...',
      description: 'CME Bank integration gateway is initiating a secure ₹1.00 credit test to verify details.',
      type: 'info',
      duration: 3500
    });

    setTimeout(() => {
      // Step 2: Request OTP validation (simulating Account Aggregator / Bank API secure authorization)
      const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(mockOtp);
      setResendTimer(30);
      setVerificationStep('otp');
      
      addToast({
        title: '🔑 Mock Security OTP Sent!',
        description: `Your bank sent a security verification code: [ ${mockOtp} ] to link your account.`,
        type: 'success',
        duration: 8000
      });
    }, 2500);
  };

  const handleVerifyOtp = async () => {
    if (otpCode !== generatedOtp) {
      addToast({
        title: '❌ Verification Failed',
        description: 'The OTP code you entered is incorrect. Please check the mock code and try again.',
        type: 'error'
      });
      return;
    }

    setVerificationStep('success');
    addToast({
      title: '🔒 Account Authorized!',
      description: 'Your bank account has been successfully verified via Penny Drop.',
      type: 'success',
      duration: 3000
    });

    // Create a new bank account structure
    const newAccount: BankAccount = {
      id: `bank_${Date.now()}`,
      bankName,
      accountHolder,
      accountNumber: `•••• •••• ${accountNumber.slice(-4)}`,
      ifscCode: ifscCode.toUpperCase(),
      accountType,
      isPrimary: (accounts || []).length === 0, // Make primary if first account
      linkedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
      balance: Math.floor(25000 + Math.random() * 85000) // Simulated sandbox balance
    };

    setTimeout(() => {
      const updated = [...(accounts || []), newAccount];
      saveAccounts(updated);
      
      // Reset form & state
      setShowAddForm(false);
      setVerificationStep('idle');
      setAccountNumber('');
      setConfirmAccountNumber('');
      setIfscCode('');
      setOtpCode('');
    }, 2000);
  };

  const handleDeleteAccount = async (id: string, name: string) => {
    if (confirm(`Are you sure you want to securely unlink your ${name} account?`)) {
      const filtered = (accounts || []).filter(a => a && a.id !== id);
      
      // If we deleted the primary account and list is not empty, set another as primary
      if ((accounts || []).find(a => a && a.id === id)?.isPrimary && (filtered || []).length > 0) {
        filtered[0].isPrimary = true;
      }
      
      await saveAccounts(filtered);
      addToast({
        title: '🗑️ Account Unlinked Successfully',
        description: `${name} has been disconnected from your CME account.`,
        type: 'success'
      });
    }
  };

  const handleSetPrimary = async (id: string) => {
    const updated = accounts.map(a => ({
      ...a,
      isPrimary: a.id === id
    }));
    await saveAccounts(updated);
    addToast({
      title: '⭐️ Primary Account Updated',
      description: 'Default payout and payment method switched.',
      type: 'success'
    });
  };

  const triggerResendOtp = () => {
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(mockOtp);
    setResendTimer(30);
    addToast({
      title: '🔑 New Mock OTP Sent!',
      description: `Your bank resent a security verification code: [ ${mockOtp} ]`,
      type: 'info',
      duration: 6000
    });
  };

  return (
    <div className="bg-white rounded-[2rem] border border-[#061F48]/10 shadow-sm p-6 md:p-8 space-y-6">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-[#061F48]/5">
        <div>
          <div className="inline-flex items-center space-x-1.5 bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 rounded-full mb-1">
            <Landmark className="h-3.5 w-3.5 text-indigo-600" />
            <span className="text-[9px] font-black uppercase tracking-widest text-indigo-600">
              BANK LINKING PORTAL
            </span>
          </div>
          <h3 className="text-lg md:text-xl font-black text-[#061F48]">
            Link My Bank Account / मेरा बैंक खाता
          </h3>
          <p className="text-xs text-[#061F48]/60 font-semibold leading-relaxed">
            Link and manage your bank accounts securely. Use linked accounts to complete 1-click tuition renewals or receive educational rewards directly.
          </p>
        </div>

        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer"
          >
            <Plus className="h-4 w-4 stroke-[3px]" />
            <span>Link Account</span>
          </button>
        )}
      </div>

      {/* LOADING STATE */}
      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-indigo-600 border-t-transparent"></div>
          <span className="text-xs text-gray-400 font-bold uppercase tracking-wider animate-pulse">
            Fetching Linked Bank Credentials...
          </span>
        </div>
      ) : (
        <div className="space-y-6">
          
          {/* LINKED ACCOUNTS CONTAINER */}
          {!showAddForm && (
            <>
              {(accounts || []).length === 0 ? (
                <div className="border border-dashed border-[#061F48]/20 rounded-3xl p-8 text-center bg-slate-50/50 space-y-4">
                  <div className="h-16 w-16 bg-[#061F48]/5 text-[#061F48] rounded-full flex items-center justify-center mx-auto">
                    <Landmark className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-black text-[#061F48]">No Bank Account Linked yet</h4>
                    <p className="text-xs text-gray-400 font-medium max-w-sm mx-auto leading-relaxed">
                      Link your bank account to enable instant ₹1 micro-deposits verification, quick fee payments, and direct academic referrals cashout payouts.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="border border-[#061F48]/20 hover:bg-slate-100 text-[#061F48] text-[10px] font-black uppercase tracking-widest px-5 py-2.5 rounded-xl transition-all"
                  >
                    + Link Bank Account Now
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(accounts || []).map((acc) => (
                    <motion.div
                      key={acc.id}
                      layoutId={acc.id}
                      className={`relative border rounded-[2rem] p-5 flex flex-col justify-between transition-all overflow-hidden shadow-sm ${
                        acc.isPrimary 
                          ? 'border-[#D09515] bg-gradient-to-tr from-amber-50/20 to-indigo-50/10' 
                          : 'border-[#061F48]/10 bg-white hover:border-[#061F48]/20'
                      }`}
                    >
                      {/* Top bar info */}
                      <div className="flex justify-between items-start gap-3">
                        <div className="flex items-center gap-2.5">
                          <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center text-indigo-700 border border-[#061F48]/5">
                            <Building2 className="h-5.5 w-5.5" />
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-[#061F48]">{acc.bankName}</h4>
                            <span className="text-[9px] font-black uppercase text-gray-400 tracking-wider">
                              {acc.accountType} Account
                            </span>
                          </div>
                        </div>

                        {/* Badges / Primary select */}
                        <div className="flex items-center gap-1.5">
                          {acc.isPrimary ? (
                            <span className="bg-[#D09515] text-white font-black text-[8px] uppercase px-2 py-0.5 rounded-lg">
                              Primary
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetPrimary(acc.id)}
                              className="text-gray-400 hover:text-[#061F48] font-bold text-[8px] uppercase border px-1.5 py-0.5 rounded-md hover:bg-slate-50 transition-colors"
                            >
                              Set Primary
                            </button>
                          )}
                          <button
                            onClick={() => handleDeleteAccount(acc.id, acc.bankName)}
                            className="text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                            title="Unlink Bank Account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Middle Card Content */}
                      <div className="my-6 space-y-1">
                        <p className="font-mono text-sm font-bold tracking-wider text-[#061F48]">
                          {acc.accountNumber}
                        </p>
                        <div className="flex items-center gap-3 text-[9.5px] font-semibold text-gray-400">
                          <span>Holder: <strong className="text-[#061F48] uppercase">{acc.accountHolder}</strong></span>
                          <span>•</span>
                          <span>IFSC: <strong className="text-[#061F48]">{acc.ifscCode}</strong></span>
                        </div>
                      </div>

                      {/* Footer Info: Sandbox balance & Verification */}
                      <div className="flex justify-between items-center bg-[#F8F5ED] -mx-5 -mb-5 px-5 py-3 border-t border-slate-100">
                        <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold uppercase">
                          <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 fill-current" />
                          <span>Verified & Safe</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest block">Available Balance</span>
                          <span className="font-mono font-black text-xs text-[#061F48]">₹{acc.balance.toLocaleString('en-IN')}.00</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ADD ACCOUNT DETAILED MULTI-STEP FLOW */}
          {showAddForm && (
            <div className="border border-slate-100 rounded-[2.5rem] p-6 bg-slate-50/50 space-y-6">
              
              <div className="flex justify-between items-center border-b pb-3 border-slate-100">
                <h4 className="text-sm font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5">
                  <Landmark className="h-4 w-4 text-indigo-600" />
                  <span>Configure Secure Account Linking</span>
                </h4>
                <button
                  onClick={() => {
                    setShowAddForm(false);
                    setVerificationStep('idle');
                  }}
                  className="text-[10px] font-bold uppercase hover:text-red-500 border border-slate-200 bg-white px-2.5 py-1 rounded-lg"
                >
                  Cancel
                </button>
              </div>

              <AnimatePresence mode="wait">
                {verificationStep === 'idle' && (
                  <motion.form
                    key="form"
                    onSubmit={handleLinkInitiate}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Bank Select */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">Select Retail Bank</label>
                        <select
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                        >
                          {INDIAN_BANKS.map((b) => (
                            <option key={b.name} value={b.name}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      {/* Account Holder */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">Account Holder Name</label>
                        <input
                          type="text"
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                          placeholder="Name exactly as on passbook"
                          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                          required
                        />
                      </div>

                      {/* Account Number */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">Bank Account Number</label>
                        <input
                          type="password"
                          value={accountNumber}
                          onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Enter account number (9 to 18 digits)"
                          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48] tracking-wider"
                          maxLength={18}
                          required
                        />
                      </div>

                      {/* Confirm Account Number */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">Confirm Account Number</label>
                        <input
                          type="text"
                          value={confirmAccountNumber}
                          onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                          placeholder="Re-enter to confirm"
                          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                          maxLength={18}
                          required
                        />
                      </div>

                      {/* IFSC Code */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">IFSC Code (11-digit alphanumeric)</label>
                        <input
                          type="text"
                          value={ifscCode}
                          onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                          placeholder="e.g. SBIN0001234"
                          className="w-full bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48] uppercase font-mono"
                          maxLength={11}
                          required
                        />
                      </div>

                      {/* Account Type */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase text-[#061F48]/60 tracking-wider">Account Type</label>
                        <div className="grid grid-cols-2 gap-2">
                          {['Savings', 'Current'].map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAccountType(t as any)}
                              className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                                accountType === t 
                                  ? 'bg-indigo-600 border-indigo-600 text-white' 
                                  : 'bg-white border-slate-200 hover:bg-slate-100 text-[#061F48]'
                              }`}
                            >
                              {t}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Disclaimer */}
                    <div className="bg-amber-50 border border-amber-200/50 p-3.5 rounded-xl flex items-start gap-2.5">
                      <Info className="h-4 w-4 text-[#D09515] shrink-0 mt-0.5" />
                      <p className="text-[10px] text-amber-800 font-semibold leading-relaxed">
                        CME secures this portal with Account Aggregator and Penny Drop verification protocols. Submitting will execute a simulated ₹1.00 micro-deposit into this account to authenticate details with NPCI servers automatically.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-indigo-600 hover:bg-[#D09515] text-white py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-sm"
                    >
                      <ShieldCheck className="h-4.5 w-4.5" />
                      <span>Initiate Penny-Drop Authorization</span>
                    </button>
                  </motion.form>
                )}

                {verificationStep === 'depositing' && (
                  <motion.div
                    key="depositing"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="py-12 text-center space-y-4"
                  >
                    <div className="relative h-16 w-16 mx-auto">
                      <div className="absolute inset-0 border-4 border-indigo-200 rounded-full animate-pulse" />
                      <div className="absolute inset-0 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                    <div className="space-y-1.5">
                      <h4 className="text-sm font-black text-[#061F48] uppercase tracking-wider animate-pulse">
                        Connecting with National Payments Corporation of India (NPCI)
                      </h4>
                      <p className="text-[10.5px] text-gray-400 font-bold max-w-sm mx-auto leading-relaxed">
                        Triggering standard ₹1 penny credit to verify Account Holder name match against IFSC: <strong className="text-indigo-600 font-mono font-black">{ifscCode}</strong>. Please wait...
                      </p>
                    </div>
                  </motion.div>
                )}

                {verificationStep === 'otp' && (
                  <motion.div
                    key="otp"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="p-4 border border-slate-200 bg-white rounded-2xl space-y-4 text-center max-w-sm mx-auto"
                  >
                    <div className="h-11 w-11 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto border border-indigo-100">
                      <KeyRound className="h-5.5 w-5.5" />
                    </div>
                    
                    <div className="space-y-1">
                      <h5 className="text-xs font-black text-[#061F48] uppercase tracking-wider">
                        Bank 3D Secure Authentication
                      </h5>
                      <span className="text-[9px] font-extrabold text-indigo-600 uppercase tracking-widest block bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full w-max mx-auto">
                        OTP REQUIRED
                      </span>
                    </div>

                    <p className="text-[10px] text-gray-400 font-bold px-4 leading-relaxed">
                      Enter the mock verification code sent via SMS to your registered mobile number for secure link consent.
                    </p>

                    <div className="space-y-3">
                      <input
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                        placeholder="• • • • • •"
                        className="w-full text-center bg-slate-50 border border-slate-200 py-3.5 rounded-xl text-lg font-black tracking-widest focus:outline-none focus:border-indigo-600 text-indigo-900"
                      />
                      
                      <div className="flex justify-between items-center text-[10px] font-bold text-gray-400 px-1">
                        {resendTimer > 0 ? (
                          <span>Resend OTP in {resendTimer}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={triggerResendOtp}
                            className="text-indigo-600 hover:underline flex items-center gap-1 font-bold"
                          >
                            <RefreshCw className="h-3 w-3" /> Resend Code
                          </button>
                        )}
                        <span className="text-emerald-600 font-extrabold">Mock OTP: {generatedOtp}</span>
                      </div>

                      <button
                        type="button"
                        onClick={handleVerifyOtp}
                        className="w-full bg-indigo-600 hover:bg-[#D09515] text-white py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
                      >
                        Confirm Linking Consent
                      </button>
                    </div>
                  </motion.div>
                )}

                {verificationStep === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="py-10 text-center space-y-4"
                  >
                    <div className="h-16 w-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100 shadow-inner">
                      <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-white shadow-md">
                        <CheckCircle2 className="h-6 w-6 stroke-[3px]" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-base font-black text-[#061F48]">Bank Account Linked!</h4>
                      <p className="text-xs text-emerald-700 font-black tracking-widest uppercase">
                        Penny drop verified • ₹1 credited successfully
                      </p>
                      <p className="text-[10px] text-gray-400 font-bold max-w-xs mx-auto leading-relaxed pt-1">
                        Adding bank card credentials to your secure profile vault. Completing synchronization setup...
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}

        </div>
      )}

    </div>
  );
}
