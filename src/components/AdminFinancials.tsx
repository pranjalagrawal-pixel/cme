import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, 
  Plus, 
  Trash2, 
  ShieldCheck, 
  CheckCircle2, 
  CreditCard, 
  AlertCircle, 
  ArrowUpRight, 
  ArrowRight, 
  Coins, 
  Download, 
  RefreshCw, 
  Search, 
  Filter, 
  Calendar,
  Briefcase,
  Users,
  TrendingUp,
  X,
  FileSpreadsheet,
  Settings,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { db, doc, updateDoc, getDoc, setDoc } from '../lib/firebase';

interface BusinessAccount {
  id: string;
  businessName: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  merchantId: string;
  linkedAt: string;
  isPrimary: boolean;
  settlementSchedule: 'Daily' | 'Weekly' | 'Instant';
}

interface FinancialTx {
  id: string;
  type: 'subscription' | 'teacher_payout' | 'referral_payout' | 'operating_expense';
  title: string;
  amount: number;
  direction: 'in' | 'out';
  status: 'Completed' | 'Processing' | 'Pending_Approval' | 'Failed';
  timestamp: string;
  utr: string;
  recipient: string;
}

const INDIAN_BANKS = [
  { name: 'ICICI Bank (Corporate)', code: 'ICICI', prefix: 'ICIC' },
  { name: 'HDFC Corporate Bank', code: 'HDFC', prefix: 'HDFC' },
  { name: 'State Bank of India (SBI)', code: 'SBI', prefix: 'SBIN' },
  { name: 'Axis Bank Business', code: 'AXIS', prefix: 'UTIB' },
  { name: 'Kotak Corporate', code: 'KOTAK', prefix: 'KKBK' }
];

const INITIAL_TXS: FinancialTx[] = [];

export default function AdminFinancials() {
  const { addToast } = useToast();
  
  // State variables
  const [businessAccounts, setBusinessAccounts] = useState<BusinessAccount[]>([]);
  const [transactions, setTransactions] = useState<FinancialTx[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Form variables
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  const [businessName, setBusinessName] = useState<string>('Concept Made Easy Academics Private Limited');
  const [bankName, setBankName] = useState<string>('ICICI Bank (Corporate)');
  const [accountNumber, setAccountNumber] = useState<string>('');
  const [confirmAccountNumber, setConfirmAccountNumber] = useState<string>('');
  const [ifscCode, setIfscCode] = useState<string>('ICIC0000104');
  const [merchantId, setMerchantId] = useState<string>('cmeacademics@icici');
  
  // Dynamic statistics simulation
  const [businessBalance, setBusinessBalance] = useState<number>(45920.00);
  const [totalRevenue, setTotalRevenue] = useState<number>(189500.00);
  const [pendingPayoutsAmount, setPendingPayoutsAmount] = useState<number>(1500.00);
  
  // Search & Filter
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  
  // Verification progress simulator
  const [verifyingStep, setVerifyingStep] = useState<'idle' | 'testing_penny' | 'done'>('idle');

  // Load configuration from Firebase or LocalStorage
  useEffect(() => {
    const fetchFinances = async () => {
      setIsLoading(true);
      try {
        // Try to fetch from custom settings in Firestore
        const adminFinDoc = await getDoc(doc(db, 'admin_settings', 'financial_module'));
        if (adminFinDoc.exists()) {
          const data = adminFinDoc.data();
          if (Array.isArray(data.businessAccounts)) setBusinessAccounts(data.businessAccounts);
          if (Array.isArray(data.transactions)) setTransactions(data.transactions);
          if (data.businessBalance !== undefined) setBusinessBalance(data.businessBalance);
          if (data.totalRevenue !== undefined) setTotalRevenue(data.totalRevenue);
          if (data.pendingPayoutsAmount !== undefined) setPendingPayoutsAmount(data.pendingPayoutsAmount);
          setIsLoading(false);
          return;
        }

        // Fallback or Initial setup
        const localAccounts = localStorage.getItem('cme_admin_business_accounts');
        const localTxs = localStorage.getItem('cme_admin_financial_txs');
        const localBalance = localStorage.getItem('cme_admin_business_balance');
        const localRev = localStorage.getItem('cme_admin_business_revenue');

        if (localAccounts) {
          try {
            const parsed = JSON.parse(localAccounts);
            if (Array.isArray(parsed)) {
              setBusinessAccounts(parsed);
            } else {
              setBusinessAccounts([]);
            }
          } catch (e) {
            setBusinessAccounts([]);
          }
        } else {
          // Pre-populate with one default linked account
          const initialAcc: BusinessAccount = {
            id: 'biz_100',
            businessName: 'Concept Made Easy Academics Private Limited',
            bankName: 'ICICI Bank (Corporate)',
            accountNumber: '•••• •••• 9924',
            ifscCode: 'ICIC0000104',
            merchantId: 'cmeacademics@icici',
            linkedAt: '05 Jul 2026',
            isPrimary: true,
            settlementSchedule: 'Daily'
          };
          setBusinessAccounts([initialAcc]);
          localStorage.setItem('cme_admin_business_accounts', JSON.stringify([initialAcc]));
        }

        if (localTxs) {
          try {
            const parsed = JSON.parse(localTxs);
            if (Array.isArray(parsed)) {
              setTransactions(parsed);
            } else {
              setTransactions([]);
            }
          } catch (e) {
            setTransactions([]);
          }
        } else {
          setTransactions([]);
          localStorage.removeItem('cme_admin_financial_txs');
        }

        if (localBalance) setBusinessBalance(parseFloat(localBalance));
        if (localRev) setTotalRevenue(parseFloat(localRev));

      } catch (err) {
        console.error('Error fetching financial config:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFinances();
  }, []);

  // Save current configurations
  const syncWithCloud = async (
    updatedAccounts: BusinessAccount[], 
    updatedTxs: FinancialTx[], 
    newBalance: number,
    newRev: number
  ) => {
    setBusinessAccounts(updatedAccounts);
    setTransactions(updatedTxs);
    setBusinessBalance(newBalance);
    setTotalRevenue(newRev);

    // Save to LocalStorage
    localStorage.setItem('cme_admin_business_accounts', JSON.stringify(updatedAccounts));
    localStorage.setItem('cme_admin_financial_txs', JSON.stringify(updatedTxs));
    localStorage.setItem('cme_admin_business_balance', newBalance.toString());
    localStorage.setItem('cme_admin_business_revenue', newRev.toString());

    // Save to Firestore
    try {
      await setDoc(doc(db, 'admin_settings', 'financial_module'), {
        businessAccounts: updatedAccounts,
        transactions: updatedTxs,
        businessBalance: newBalance,
        totalRevenue: newRev,
        pendingPayoutsAmount: updatedTxs.filter(t => t.status === 'Pending_Approval').reduce((acc, current) => acc + current.amount, 0),
        lastUpdated: new Date().toISOString()
      }, { merge: true });
    } catch (e) {
      console.warn('Could not sync admin financials to Firestore:', e);
    }
  };

  // Connect Business Bank Account
  const handleConnectBusinessAccount = (e: React.FormEvent) => {
    e.preventDefault();

    if (!accountNumber.trim()) {
      addToast({
        title: '⚠️ Input Account Number',
        description: 'Please input your corporate Current Account Number.',
        type: 'error'
      });
      return;
    }

    if (accountNumber !== confirmAccountNumber) {
      addToast({
        title: '⚠️ Unmatched Account Numbers',
        description: 'Account Number and Confirmation field must be identical.',
        type: 'error'
      });
      return;
    }

    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
    if (!ifscRegex.test(ifscCode.toUpperCase())) {
      addToast({
        title: '⚠️ Invalid IFSC Code',
        description: 'Verify 11-digit corporate IFSC syntax.',
        type: 'error'
      });
      return;
    }

    setVerifyingStep('testing_penny');
    addToast({
      title: '🔐 Testing penny drop routing...',
      description: 'CME direct-payment ledger is ready for manual UPI transaction-reference reconciliation.',
      type: 'info'
    });

    setTimeout(() => {
      setVerifyingStep('done');
      addToast({
        title: '🔒 Business Merchant Linked!',
        description: `${bankName} has been authorized for automated payouts tracking & billing settlement.`,
        type: 'success'
      });

      const newBizAcc: BusinessAccount = {
        id: `biz_${Date.now()}`,
        businessName,
        bankName,
        accountNumber: `•••• •••• ${accountNumber.slice(-4)}`,
        ifscCode: ifscCode.toUpperCase(),
        merchantId: merchantId || `cme@${bankName.toLowerCase().split(' ')[0]}`,
        linkedAt: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        isPrimary: (businessAccounts || []).length === 0,
        settlementSchedule: 'Daily'
      };

      setTimeout(() => {
        const updatedList = [...(businessAccounts || []), newBizAcc];
        syncWithCloud(updatedList, transactions, businessBalance, totalRevenue);
        
        // Reset states
        setShowAddForm(false);
        setVerifyingStep('idle');
        setAccountNumber('');
        setConfirmAccountNumber('');
      }, 1500);

    }, 2500);
  };

  // Unlink Business Bank Account
  const handleUnlinkBusinessAccount = (id: string, name: string) => {
    if (confirm(`Are you sure you want to securely disconnect business bank account: ${name}? This will suspend automated corporate settlements.`)) {
      const filtered = (businessAccounts || []).filter(a => a.id !== id);
      if (businessAccounts.find(a => a.id === id)?.isPrimary && (filtered || []).length > 0) {
        filtered[0].isPrimary = true;
      }
      syncWithCloud(filtered, transactions, businessBalance, totalRevenue);
      addToast({
        title: '🔌 Account Disconnected',
        description: `Successfully disconnected settlements link for ${name}.`,
        type: 'info'
      });
    }
  };

  // Toggle primary status
  const handleSetPrimary = (id: string) => {
    const updated = businessAccounts.map(a => ({
      ...a,
      isPrimary: a.id === id
    }));
    syncWithCloud(updated, transactions, businessBalance, totalRevenue);
    addToast({
      title: '⭐️ Primary Settlement Updated',
      description: 'Default business billing channel switched.',
      type: 'success'
    });
  };

  // Approve and pay pending payout instantly
  const handleApprovePayout = (txId: string) => {
    const targetTx = transactions.find(t => t.id === txId);
    if (!targetTx) return;

    addToast({
      title: '🚀 Initiating Bank IMPS...',
      description: `Authorizing instant settlement of ₹${targetTx.amount} to ${targetTx.recipient}.`,
      type: 'info'
    });

    setTimeout(() => {
      // Simulate UTR code generation
      const mockUtr = `607120${Math.floor(100000 + Math.random() * 900000)}`;
      const updatedTxs = transactions.map(t => {
        if (t.id === txId) {
          return {
            ...t,
            status: 'Completed' as const,
            utr: mockUtr,
            timestamp: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true })
          };
        }
        return t;
      });

      // Deduct from business balance
      const newBalance = businessBalance - targetTx.amount;
      syncWithCloud(businessAccounts, updatedTxs, newBalance, totalRevenue);

      addToast({
        title: '✅ IMPS Payout Disbursed',
        description: `Payout reference ${mockUtr} cleared successfully. Amount deducted from Current balance.`,
        type: 'success'
      });
    }, 2000);
  };

  // Simulate Tuition Revenue Deposit
  const handleSimulateSubscription = () => {
    const randomPlan = [
      { name: 'Class 10 Science Masterclass - Subscription', amt: 4999.00 },
      { name: 'Boards Prep Academic Access Package', amt: 5999.00 },
      { name: 'IIT-JEE Complete Crash Course', amt: 8999.00 }
    ][Math.floor(Math.random() * 3)];

    addToast({
      title: '💳 Simulating Student Subscription...',
      description: `A mock user completed checkout for: ${randomPlan.name}`,
      type: 'info'
    });

    setTimeout(() => {
      const mockUtr = `607120${Math.floor(100000 + Math.random() * 900000)}`;
      const newTx: FinancialTx = {
        id: `TX_${1000 + (transactions || []).length + 1}`,
        type: 'subscription',
        title: randomPlan.name,
        amount: randomPlan.amt,
        direction: 'in',
        status: 'Completed',
        timestamp: new Date().toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true }),
        utr: mockUtr,
        recipient: 'CME Business Account'
      };

      const newTxs = [newTx, ...(transactions || [])];
      const newBalance = businessBalance + randomPlan.amt;
      const newRev = totalRevenue + randomPlan.amt;

      syncWithCloud(businessAccounts, newTxs, newBalance, newRev);

      addToast({
        title: '💰 Revenue Captured!',
        description: `₹${randomPlan.amt} credited successfully to corporate balance.`,
        type: 'success'
      });
    }, 1500);
  };

  // Toggle payout settlement interval
  const handleChangeSchedule = (id: string, schedule: 'Daily' | 'Weekly' | 'Instant') => {
    const updated = businessAccounts.map(a => {
      if (a.id === id) {
        return { ...a, settlementSchedule: schedule };
      }
      return a;
    });
    syncWithCloud(updated, transactions, businessBalance, totalRevenue);
    addToast({
      title: '⚙️ Settlement Trigger Changed',
      description: `Automated payouts settlement schedule switched to: ${schedule}`,
      type: 'success'
    });
  };

  // Excel Export Simulation
  const handleExportCSV = () => {
    addToast({
      title: '📄 Generating Settlement Report...',
      description: 'Compiling financial transaction logs and payout receipts database.',
      type: 'info'
    });

    setTimeout(() => {
      // Build CSV contents
      const headers = 'Transaction ID,Type,Title,Amount,Direction,Status,Timestamp,UTR Reference,Recipient\n';
      const rows = transactions.map(t => 
        `"${t.id}","${t.type}","${t.title}",${t.amount},"${t.direction}","${t.status}","${t.timestamp}","${t.utr}","${t.recipient}"`
      ).join('\n');

      const blob = new Blob([headers + rows], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `CME_Financial_Settlement_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
      a.click();

      addToast({
        title: '📂 CSV Ledger Downloaded!',
        description: 'Corporate settlement ledger successfully exported as CSV.',
        type: 'success'
      });
    }, 1500);
  };

  // Filtered transactions list
  const filteredTxs = (transactions || []).filter(t => {
    if (!t) return false;
    const queryLower = (searchQuery || '').toLowerCase();
    const matchesSearch = (t.title || '').toLowerCase().includes(queryLower) || 
                          (t.recipient || '').toLowerCase().includes(queryLower) || 
                          (t.id || '').toLowerCase().includes(queryLower) || 
                          (t.utr || '').toLowerCase().includes(queryLower);
    const matchesType = typeFilter === 'ALL' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* STATISTICS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* STAT CARD 1: BUSINESS CURRENT BALANCE */}
        <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50/30 rounded-bl-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-[#D09515] tracking-wider block">
              Business Current Account Balance
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#061F48] font-mono">
              ₹{businessBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-emerald-600 font-extrabold pt-1">
              <TrendingUp className="h-4 w-4" />
              <span>NPCI Real-Time Verified</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-[#061F48]/5 text-[#061F48] rounded-2xl flex items-center justify-center">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* STAT CARD 2: CUMULATIVE REVENUE */}
        <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/30 rounded-bl-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">
              Total Student Subscriptions Revenue
            </span>
            <p className="text-2xl md:text-3xl font-black text-[#061F48] font-mono">
              ₹{totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-[#D09515] font-extrabold pt-1">
              <Coins className="h-4 w-4" />
              <span>Gross Tuition Billings</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center">
            <Coins className="h-6 w-6" />
          </div>
        </div>

        {/* STAT CARD 3: PENDING OUTFLOWS */}
        <div className="bg-white rounded-[2rem] border border-[#061F48]/10 p-6 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50/30 rounded-bl-full pointer-events-none" />
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-red-500 tracking-wider block">
              Pending Payouts & Referrals Outflow
            </span>
            <p className="text-2xl md:text-3xl font-black text-red-600 font-mono">
              ₹{transactions.filter(t => t.status === 'Pending_Approval').reduce((acc, current) => acc + current.amount, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </p>
            <div className="flex items-center gap-1.5 text-[10.5px] text-gray-400 font-bold pt-1">
              <Clock className="h-3.5 w-3.5 text-amber-500" />
              <span>Pending IMPS clearing approvals</span>
            </div>
          </div>
          <div className="h-12 w-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* ACTION PANEL: SANDBOX SIMULATOR ACCENTS */}
      <div className="bg-gradient-to-r from-amber-500/10 via-[#061F48]/5 to-indigo-500/10 border border-[#D09515]/25 rounded-[2rem] p-5 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="space-y-1 text-center md:text-left">
          <h4 className="text-xs font-black text-[#061F48] uppercase tracking-wider flex items-center gap-1.5 justify-center md:justify-start">
            <span className="h-2 w-2 rounded-full bg-[#D09515] animate-ping" />
            <span>CME Institutional Ledger Controls</span>
          </h4>
          <p className="text-[10.5px] text-[#061F48]/75 font-semibold">
            Simulate dynamic incoming student subscription payments or download real-time audited financial ledgers.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={handleSimulateSubscription}
            className="bg-[#061F48] hover:bg-[#D09515] text-white px-4 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="h-4 w-4" />
            <span>Simulate Subscription Revenue (+₹)</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="border border-[#061F48]/15 bg-white hover:bg-[#061F48]/5 text-[#061F48] px-4 py-2.5 rounded-xl text-[10.5px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 shadow-sm"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>Export Settlement Ledger</span>
          </button>
        </div>
      </div>

      {/* TWO COLUMN CONTENT PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT PANEL: BUSINESS BANK ACCOUNTS LIST & CONNECTOR */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 p-6 space-y-6">
            
            <div className="flex justify-between items-center border-b pb-4 border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#061F48] uppercase tracking-wider">
                  Settlement Accounts
                </h3>
                <p className="text-[10px] text-gray-400 font-bold">Payout source routes</p>
              </div>

              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 shadow-sm"
                >
                  <Plus className="h-3 w-3 stroke-[3px]" />
                  <span>Link Corporate</span>
                </button>
              )}
            </div>

            {/* CONNECT ACCOUNT FORM SCREEN */}
            {showAddForm ? (
              <form onSubmit={handleConnectBusinessAccount} className="space-y-4">
                
                <div className="flex justify-between items-center pb-2 border-b border-dashed border-slate-100">
                  <span className="text-[10px] font-black text-indigo-600 uppercase tracking-wider">Configure Corporate Route</span>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setVerifyingStep('idle');
                    }}
                    className="text-[9px] font-bold text-gray-400 hover:text-red-500 uppercase"
                  >
                    Cancel
                  </button>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Business Legal Entity Name</label>
                    <input
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. CME Academics Pvt Ltd"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Settlement Bank Partner</label>
                    <select
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                    >
                      {INDIAN_BANKS.map((b) => (
                        <option key={b.name} value={b.name}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Current Account Number</label>
                    <input
                      type="password"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Enter Current Account Number"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48] tracking-wider"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Confirm Account Number</label>
                    <input
                      type="text"
                      value={confirmAccountNumber}
                      onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                      placeholder="Re-enter to confirm"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48]"
                      maxLength={18}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Corporate IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode}
                      onChange={(e) => setIfscCode(e.target.value.toUpperCase().slice(0, 11))}
                      placeholder="e.g. ICIC0000104"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48] uppercase font-mono"
                      maxLength={11}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider">Merchant VPA / UPI ID</label>
                    <input
                      type="text"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      placeholder="e.g. cmeacademics@icici"
                      className="w-full bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-indigo-500 text-[#061F48] font-mono"
                      required
                    />
                  </div>
                </div>

                {verifyingStep === 'testing_penny' ? (
                  <div className="py-4 text-center space-y-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-2 border-indigo-600 border-t-transparent mx-auto"></div>
                    <p className="text-[10px] text-gray-400 font-bold animate-pulse">
                      NPCI penny check sequence active...
                    </p>
                  </div>
                ) : (
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Authenticate & Connect Route
                  </button>
                )}

              </form>
            ) : (
              <div className="space-y-4">
                {(businessAccounts || []).length === 0 ? (
                  <div className="py-8 text-center text-gray-400 space-y-2 border border-dashed rounded-3xl">
                    <Building2 className="h-8 w-8 mx-auto opacity-35" />
                    <p className="text-xs font-bold uppercase">No settlement route configured</p>
                  </div>
                ) : (
                  (businessAccounts || []).map((acc) => (
                    <div 
                      key={acc.id}
                      className={`border rounded-2xl p-4.5 space-y-4 relative overflow-hidden transition-all ${
                        acc.isPrimary 
                          ? 'border-[#D09515] bg-amber-50/10' 
                          : 'border-slate-100 bg-slate-50/30'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <span className="text-[8px] font-black uppercase text-indigo-600 tracking-wider">
                            {acc.bankName}
                          </span>
                          <h4 className="text-xs font-black text-[#061F48] leading-snug">{acc.businessName}</h4>
                          <span className="text-[9px] font-mono font-bold text-gray-400 tracking-wider">
                            {acc.accountNumber}
                          </span>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {acc.isPrimary ? (
                            <span className="bg-[#D09515] text-white font-black text-[7px] uppercase px-1.5 py-0.2 rounded">
                              Active Route
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSetPrimary(acc.id)}
                              className="text-gray-400 hover:text-[#061F48] text-[8px] font-black uppercase border px-1.5 py-0.2 rounded bg-white"
                            >
                              Activate
                            </button>
                          )}

                          <button
                            onClick={() => handleUnlinkBusinessAccount(acc.id, acc.bankName)}
                            className="text-red-500 hover:bg-red-50 p-1 rounded-md transition-colors"
                            title="Disconnect Route"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Settlement schedule toggles */}
                      <div className="bg-white border border-slate-100 p-2.5 rounded-xl space-y-1.5">
                        <span className="text-[8.5px] font-black text-gray-400 uppercase block">Settlement Frequency</span>
                        <div className="grid grid-cols-3 gap-1">
                          {(['Daily', 'Weekly', 'Instant'] as const).map((mode) => (
                            <button
                              key={mode}
                              onClick={() => handleChangeSchedule(acc.id, mode)}
                              className={`py-1 text-[8.5px] font-black uppercase rounded-md border transition-all ${
                                acc.settlementSchedule === mode
                                  ? 'bg-[#061F48] border-[#061F48] text-white'
                                  : 'bg-white border-slate-100 text-gray-500 hover:bg-slate-50'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-[9px] font-semibold text-gray-400 pt-1 border-t border-slate-100">
                        <span>IFSC: <strong className="text-[#061F48] font-mono">{acc.ifscCode}</strong></span>
                        <span>VPA: <strong className="text-[#061F48] font-mono">{acc.merchantId}</strong></span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {/* GATEWAY INTEGRATION STATS */}
            <div className="bg-indigo-50/50 rounded-2xl p-4 space-y-3 border border-indigo-100">
              <span className="text-[9px] font-black uppercase text-indigo-700 tracking-wider block">
                CME UPI Reconciliation
              </span>
              <div className="space-y-2 text-xs font-semibold text-[#061F48]">
                <div className="flex justify-between">
                  <span className="text-gray-400">Reconciliation Status:</span>
                  <span className="text-emerald-600 font-extrabold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse" /> Operational
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Node Location:</span>
                  <span className="font-mono">Secured Core - Mumbai</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Payout Security Layer:</span>
                  <span className="bg-[#D09515]/10 text-[#D09515] px-1.5 py-0.2 rounded text-[9px] font-black">ACTIVE</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* RIGHT PANEL: AUDITED TRANSACTIONS LEDGER */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-[#061F48]/10 p-6 md:p-8 space-y-6">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-slate-100">
              <div className="space-y-0.5">
                <h3 className="text-sm font-black text-[#061F48] uppercase tracking-wider">
                  Payment & Payout Transaction Ledger
                </h3>
                <p className="text-[10px] text-gray-400 font-bold">
                  Audited list of client subscriptions and payouts
                </p>
              </div>

              {/* FILTER BAR & SEARCH */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial">
                  <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search UTR, title..."
                    className="bg-slate-50 border border-slate-200 pl-8 pr-3.5 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-[#061F48] text-[#061F48] w-full md:w-44"
                  />
                </div>

                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-2.5 py-2 rounded-xl text-xs font-semibold focus:outline-none text-[#061F48]"
                >
                  <option value="ALL">All Types</option>
                  <option value="subscription">Subscriptions</option>
                  <option value="teacher_payout">Teacher Payouts</option>
                  <option value="referral_payout">Referral Rewards</option>
                </select>
              </div>
            </div>

            {/* TRANSACTIONS ITERATOR */}
            <div className="space-y-3.5 max-h-[30rem] overflow-y-auto pr-1">
              {(filteredTxs || []).length === 0 ? (
                <div className="py-16 text-center text-gray-400 space-y-2 border border-dashed rounded-[2rem] bg-slate-50/50">
                  <Coins className="h-10 w-10 mx-auto opacity-35" />
                  <h4 className="text-xs font-black uppercase">No transaction logs match filter</h4>
                  <p className="text-[10px] font-bold max-w-xs mx-auto leading-relaxed">
                    Try refining your keyword query or adding mock tuition subscription inputs.
                  </p>
                </div>
              ) : (
                (filteredTxs || []).map((tx) => (
                  <div
                    key={tx.id}
                    className="border border-[#061F48]/5 rounded-2xl p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#061F48]/15 transition-all bg-white shadow-sm"
                  >
                    {/* Left Column: Icon + Description */}
                    <div className="flex items-center gap-3.5">
                      <div className={`h-11 w-11 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.direction === 'in' 
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' 
                          : 'bg-amber-50 text-[#D09515] border border-amber-100'
                      }`}>
                        {tx.type === 'subscription' && <Coins className="h-5.5 w-5.5" />}
                        {tx.type === 'teacher_payout' && <Users className="h-5.5 w-5.5" />}
                        {tx.type === 'referral_payout' && <ArrowUpRight className="h-5.5 w-5.5" />}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`text-[8px] font-black uppercase px-2 py-0.2 rounded-full ${
                            tx.type === 'subscription' ? 'bg-emerald-50 border border-emerald-200 text-emerald-700' :
                            tx.type === 'teacher_payout' ? 'bg-blue-50 border border-blue-200 text-blue-700' :
                            'bg-indigo-50 border border-indigo-200 text-indigo-700'
                          }`}>
                            {tx.type.replace('_', ' ')}
                          </span>
                          <span className="text-[9px] font-mono font-bold text-gray-400">ID: {tx.id}</span>
                        </div>
                        <h4 className="text-xs font-black text-[#061F48] leading-snug">{tx.title}</h4>
                        <div className="flex items-center gap-2 text-[9.5px] font-semibold text-gray-400">
                          <span>Recipient: <strong className="text-[#061F48] uppercase">{tx.recipient}</strong></span>
                          <span>•</span>
                          <span>UTR: <strong className="text-[#061F48] font-mono">{tx.utr}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: Amount & Status & Instant Actions */}
                    <div className="flex md:flex-col justify-between items-end w-full md:w-auto shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-dashed border-slate-100">
                      
                      <div className="text-right">
                        <span className={`text-sm font-mono font-black ${tx.direction === 'in' ? 'text-emerald-600' : 'text-[#061F48]'}`}>
                          {tx.direction === 'in' ? '+' : '-'} ₹{tx.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[9px] font-bold text-gray-400 block">{tx.timestamp}</span>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5">
                        {tx.status === 'Completed' && (
                          <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                            <span>Completed</span>
                          </span>
                        )}

                        {tx.status === 'Processing' && (
                          <span className="bg-indigo-50 border border-indigo-200 text-indigo-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1 animate-pulse">
                            <RefreshCw className="h-3 w-3 text-indigo-600 animate-spin" />
                            <span>Processing</span>
                          </span>
                        )}

                        {tx.status === 'Pending_Approval' && (
                          <div className="flex items-center gap-1.5">
                            <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[8px] font-black uppercase px-2 py-0.5 rounded-lg flex items-center gap-1">
                              <AlertCircle className="h-3 w-3 text-amber-600" />
                              <span>Pending Approve</span>
                            </span>

                            <button
                              onClick={() => handleApprovePayout(tx.id)}
                              className="bg-[#061F48] hover:bg-[#D09515] text-white px-2 py-1 rounded text-[8.5px] font-black uppercase tracking-wider transition-all shadow-sm"
                            >
                              Approve & Pay
                            </button>
                          </div>
                        )}
                      </div>

                    </div>

                  </div>
                ))
              )}
            </div>

            {/* AUDIT NOTE */}
            <div className="bg-[#F8F5ED] border border-[#D09515]/25 p-4 rounded-2xl flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-[#D09515] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="text-[9.5px] font-black text-[#061F48] uppercase tracking-wider block">Compliance & Legal Audit Ledger</span>
                <p className="text-[10px] text-gray-500 font-bold leading-relaxed">
                  Concept Made Easy implements end-to-end IMPS, NEFT, and UPI settlement tracking protocols conforming with Reserve Bank of India (RBI) business billing standards. Payout logs are cryptographic and cannot be modified retroactively.
                </p>
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
