import React, { useState, useEffect } from 'react';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';
import { 
  Wallet, TrendingUp, TrendingDown, PiggyBank, PlusCircle, Trash2, Shield, User as UserIcon, LogOut, CheckCircle, RefreshCw, Users, UserPlus, Inbox, Sparkles, Key, Lock, Settings, AlertTriangle, Download, Repeat, Layers
} from 'lucide-react';

// Interfaces for Typescript type safety
interface Transaction {
  id: number;
  amount: number;
  category: string;
  transaction_type?: string;
  frequency?: string;
  date: string;
  description: string;
  is_shared: boolean;
  user_id: number;
}

interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  role: string;
  is_active: boolean;
}

interface BudgetLimit {
  id: number;
  category: string;
  monthly_limit: number;
}

interface DashboardStats {
  total_income: number;
  total_expenses: number;
  total_investments: number;
  total_savings: number;
  net_savings: number;
  category_expenses: Record<string, number>;
  transaction_count: number;
}

// Categories definitions by transaction type
const CATEGORIES_BY_TYPE: Record<string, { id: string; label: string; color: string }[]> = {
  expense: [
    { id: 'Groceries', label: 'Groceries (Σούπερ Μάρκετ & Τρόφιμα)', color: '#10b981' },
    { id: 'Housing & Rent', label: 'Housing (Ενοίκιο & Σπίτι)', color: '#6366f1' },
    { id: 'Loans & Installments', label: 'Loans & Installments (Δάνεια & Δόσεις)', color: '#d97706' },
    { id: 'Insurance', label: 'Insurance (Ασφάλειες)', color: '#0284c7' },
    { id: 'Utilities', label: 'Utilities (ΔΕΗ, Νερό, Ίντερνετ)', color: '#3b82f6' },
    { id: 'Entertainment & Dining', label: 'Entertainment (Ψυχαγωγία & Φαγητό έξω)', color: '#ec4899' },
    { id: 'Transport & Fuel', label: 'Transport (Μεταφορές & Καύσιμα)', color: '#f59e0b' },
    { id: 'Health & Medical', label: 'Health (Υγεία & Φάρμακα)', color: '#ef4444' },
    { id: 'Education & Family', label: 'Education (Εκπαίδευση & Παιδιά)', color: '#8b5cf6' },
    { id: 'Taxes & Fees', label: 'Taxes & Fees (Φόροι & Τέλη)', color: '#9333ea' },
    { id: 'Personal Care & Shopping', label: 'Personal Care (Προσωπική Φροντίδα & Αγορές)', color: '#f43f5e' },
    { id: 'Other Expense', label: 'Other Expense (Άλλα Έξοδα)', color: '#64748b' },
  ],
  income: [
    { id: 'Salary', label: 'Salary (Μισθός / Ημερομίσθιο)', color: '#22c55e' },
    { id: 'Freelance & Side Gig', label: 'Freelance (Ελεύθερο Επάγγελμα / Projects)', color: '#10b981' },
    { id: 'Investments Return', label: 'Investments Return (Μερίσματα & Τόκοι)', color: '#06b6d4' },
    { id: 'Rental Income', label: 'Rental Income (Ενοίκια Εισπρακτέα)', color: '#0ea5e9' },
    { id: 'Bonus & Gifts', label: 'Bonus & Gifts (Bonus & Δώρα)', color: '#84cc16' },
    { id: 'Pension & Support', label: 'Pension & Support (Σύνταξη & Επιδόματα)', color: '#14b8a6' },
    { id: 'Other Income', label: 'Other Income (Άλλα Έσοδα)', color: '#3b82f6' },
  ],
  investment: [
    { id: 'Broad Market ETFs (VWCE, S&P 500)', label: 'Broad Market ETFs (VWCE, S&P 500, MSCI World)', color: '#10b981' },
    { id: 'Dividend ETFs (SCHD, High Yield)', label: 'Dividend ETFs (Μερισματικά ETFs)', color: '#06b6d4' },
    { id: 'Bond & Money Market ETFs (XEON, Bonds)', label: 'Bond & Money Market ETFs (Ομόλογα & Διαθέσιμα)', color: '#3b82f6' },
    { id: 'Individual Stocks', label: 'Individual Stocks (Μεμονωμένες Μετοχές)', color: '#8b5cf6' },
    { id: 'Crypto', label: 'Crypto (Κρυπτονομίσματα)', color: '#eab308' },
    { id: 'Real Estate Investment', label: 'Real Estate (Επενδυτικά Ακίνητα)', color: '#d97706' },
    { id: 'Other Investment', label: 'Other Investment (Άλλη Επένδυση)', color: '#64748b' },
  ],

  savings: [
    { id: 'Emergency Fund', label: 'Emergency Fund (Ταμείο Έκτακτης Ανάγκης)', color: '#3b82f6' },
    { id: 'Vacation Fund', label: 'Vacation Fund (Ταμείο Διακοπών)', color: '#06b6d4' },
    { id: 'General Savings', label: 'General Savings (Γενική Αποταμίευση)', color: '#2563eb' },
    { id: 'Major Purchase Fund', label: 'Major Purchase (Ταμείο Μεγάλης Αγοράς)', color: '#1d4ed8' },
  ]
};

// Global Category Color Lookup Map
const CATEGORY_COLORS: Record<string, string> = {};
Object.values(CATEGORIES_BY_TYPE).flat().forEach(c => {
  CATEGORY_COLORS[c.id] = c.color;
});

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  
  // PIN Modal State for Admin Login
  const [selectedAdminProfile, setSelectedAdminProfile] = useState<UserProfile | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  
  // Active Tab for Admin
  const [activeTab, setActiveTab] = useState<'dashboard' | 'admin'>('dashboard');

  // UI & Auth State
  const [showAddMember, setShowAddMember] = useState<boolean>(false);
  const [newFullName, setNewFullName] = useState<string>('');
  const [newEmail, setNewEmail] = useState<string>('');
  const [newRole, setNewRole] = useState<string>('user');
  const [newAdminPin, setNewAdminPin] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(false);

  // Admin Settings State
  const [budgetLimits, setBudgetLimits] = useState<BudgetLimit[]>([]);
  const [limitCategory, setLimitCategory] = useState<string>('Groceries');
  const [limitAmount, setLimitAmount] = useState<string>('');
  const [changePinInput, setChangePinInput] = useState<string>('');
  const [pinChangeMsg, setPinChangeMsg] = useState<string | null>(null);

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [apiOnline, setApiOnline] = useState<boolean>(false);

  // Add Transaction Form State
  const [amount, setAmount] = useState<string>('');
  const [transactionType, setTransactionType] = useState<string>('expense');
  const [category, setCategory] = useState<string>('Groceries');
  const [frequency, setFrequency] = useState<string>('one_off');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState<string>('');
  const [isShared, setIsShared] = useState<boolean>(true);

  // Handle Type Change & Auto-update Category Options
  const handleTypeChange = (newType: string) => {
    setTransactionType(newType);
    const availableCategories = CATEGORIES_BY_TYPE[newType] || CATEGORIES_BY_TYPE.expense;
    setCategory(availableCategories[0].id);
  };

  // Fetch Available Family Profiles
  const fetchProfiles = async () => {
    try {
      const res = await fetch('/api/v1/auth/profiles');
      if (res.ok) {
        const data: UserProfile[] = await res.json();
        setProfiles(data);
      }
    } catch (err) {
      console.error('Error fetching profiles:', err);
    }
  };

  // Check Backend Health & Load User / Data
  const checkHealth = async () => {
    try {
      const res = await fetch('/api/v1/health');
      setApiOnline(res.ok);
    } catch {
      setApiOnline(false);
    }
  };

  const fetchUserProfile = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/auth/me', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const profile: UserProfile = await res.json();
        setUser(profile);
        return true;
      } else {
        handleLogout();
        return false;
      }
    } catch {
      return false;
    }
  };

  const fetchTransactions = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/transactions', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error('Error fetching transactions:', err);
    }
  };

  const fetchBudgetLimits = async (authToken: string) => {
    try {
      const res = await fetch('/api/v1/budget-limits', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBudgetLimits(data);
      }
    } catch (err) {
      console.error('Error fetching budget limits:', err);
    }
  };

  useEffect(() => {
    checkHealth();
    fetchProfiles();
    if (token) {
      fetchUserProfile(token).then((isValid) => {
        if (isValid) {
          fetchTransactions(token);
          fetchBudgetLimits(token);
        }
      });
    }
  }, [token]);

  // Handle Profile Selection
  const handleProfileClick = (profile: UserProfile) => {
    setAuthError(null);
    if (profile.role === 'admin') {
      // Open 4-digit PIN Modal for Admin
      setSelectedAdminProfile(profile);
      setPinInput('');
    } else {
      // Free Entry for Regular User
      handleLoginWithPin(profile.id, null);
    }
  };

  // Handle Login (Free entry for regular user, PIN for Admin)
  const handleLoginWithPin = async (profileId: number, pin: string | null) => {
    setAuthError(null);
    setAuthLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: profileId, pin }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Αποτυχία σύνδεσης');
      }

      const data = await res.json();
      const accessToken = data.access_token;
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
      setSelectedAdminProfile(null);
      
      const profileOk = await fetchUserProfile(accessToken);
      if (profileOk) {
        await fetchTransactions(accessToken);
        await fetchBudgetLimits(accessToken);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Αποτυχία σύνδεσης');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Add New Family Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const cleanSlug = newFullName.trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '');
    const generatedEmail = newEmail.trim() || `${cleanSlug || 'member'}_${Date.now()}@family.local`;

    try {
      const endpoint = token ? '/api/v1/auth/admin/users' : '/api/v1/auth/register';
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          email: generatedEmail,
          password: 'FamilyPassword123!',
          pin: newRole === 'admin' ? (newAdminPin || '1234') : null,
          full_name: newFullName,
          role: newRole,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.detail || 'Αποτυχία προσθήκης μέλους');
      }

      const createdUser: UserProfile = await res.json();
      setProfiles([...profiles, createdUser]);
      setShowAddMember(false);
      setNewFullName('');
      setNewEmail('');
      setNewAdminPin('');

      if (!token) {
        await handleLoginWithPin(createdUser.id, createdUser.role === 'admin' ? (newAdminPin || '1234') : null);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Αποτυχία εγγραφής μέλους');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Admin Delete User
  const handleDeleteUser = async (userId: number) => {
    if (!token || !user || user.role !== 'admin') return;
    if (userId === user.id) {
      alert('Δεν μπορείτε να διαγράψετε τον εαυτό σας!');
      return;
    }
    if (!confirm('Είστε βέβαιοι ότι θέλετε να διαγράψετε αυτό το μέλος;')) return;

    try {
      const res = await fetch(`/api/v1/auth/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setProfiles(profiles.filter(p => p.id !== userId));
      }
    } catch (err) {
      console.error('Error deleting user:', err);
    }
  };

  // Handle Update Admin PIN
  const handleUpdateAdminPin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || changePinInput.length !== 4) return;
    setPinChangeMsg(null);

    try {
      const res = await fetch('/api/v1/auth/admin/pin', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pin: changePinInput })
      });

      if (res.ok) {
        setPinChangeMsg('Το 4-ψηφιο PIN άλλαξε με επιτυχία!');
        setChangePinInput('');
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.detail || 'Αποτυχία αλλαγής PIN');
      }
    } catch (err) {
      console.error('Error updating PIN:', err);
    }
  };

  // Handle Save Category Budget Limit
  const handleSetBudgetLimit = async (e: React.FormEvent) => {
    e.preventDefault();
    const limitNum = parseFloat(limitAmount);
    if (isNaN(limitNum) || limitNum <= 0 || !token) return;

    try {
      const res = await fetch('/api/v1/budget-limits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          category: limitCategory,
          monthly_limit: limitNum
        })
      });

      if (res.ok) {
        const updated = await res.json();
        const existingIdx = budgetLimits.findIndex(b => b.category === updated.category);
        if (existingIdx >= 0) {
          const newLimits = [...budgetLimits];
          newLimits[existingIdx] = updated;
          setBudgetLimits(newLimits);
        } else {
          setBudgetLimits([...budgetLimits, updated]);
        }
        setLimitAmount('');
      }
    } catch (err) {
      console.error('Error setting budget limit:', err);
    }
  };

  // Handle Delete Budget Limit
  const handleDeleteBudgetLimit = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/budget-limits/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setBudgetLimits(budgetLimits.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting limit:', err);
    }
  };

  // Handle Backup JSON Export
  const handleExportBackup = () => {
    const backupData = {
      version: '1.0',
      exported_at: new Date().toISOString(),
      transactions,
      budget_limits: budgetLimits,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `family_budget_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handle Logout / Profile Switch
  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setTransactions([]);
    setBudgetLimits([]);
    setActiveTab('dashboard');
    fetchProfiles();
  };

  // Compute Dashboard Statistics
  const computeStats = (): DashboardStats => {
    let total_income = 0;
    let total_expenses = 0;
    let total_investments = 0;
    let total_savings = 0;
    const category_expenses: Record<string, number> = {};

    transactions.forEach(t => {
      const tType = t.transaction_type || (t.amount > 0 ? 'income' : 'expense');
      const absVal = Math.abs(t.amount);

      if (tType === 'income') {
        total_income += absVal;
      } else if (tType === 'investment') {
        total_investments += absVal;
      } else if (tType === 'savings') {
        total_savings += absVal;
      } else {
        total_expenses += absVal;
        category_expenses[t.category] = (category_expenses[t.category] || 0) + absVal;
      }
    });

    return {
      total_income,
      total_expenses,
      total_investments,
      total_savings,
      net_savings: total_income - (total_expenses + total_investments + total_savings),
      category_expenses,
      transaction_count: transactions.length,
    };
  };

  const stats = computeStats();

  // Prepare Chart Data
  const pieData = Object.keys(stats.category_expenses).map(cat => ({
    name: cat,
    value: stats.category_expenses[cat],
    color: CATEGORY_COLORS[cat] || '#8b5cf6'
  }));

  const barData = [
    { name: 'Έσοδα', amount: stats.total_income, fill: '#22c55e' },
    { name: 'Έξοδα', amount: stats.total_expenses, fill: '#ef4444' },
    { name: 'Επενδύσεις', amount: stats.total_investments, fill: '#f59e0b' },
    { name: 'Αποταμίευση', amount: stats.total_savings, fill: '#3b82f6' }
  ];

  // Handle Add Transaction
  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawNum = parseFloat(amount);
    if (isNaN(rawNum) || rawNum === 0 || !token) return;

    // Standardize sign based on type
    let finalAmount = Math.abs(rawNum);
    if (transactionType === 'expense') finalAmount = -finalAmount;

    try {
      const res = await fetch('/api/v1/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          amount: finalAmount,
          category,
          transaction_type: transactionType,
          frequency,
          date,
          description: description || `${category} (${transactionType})`,
          is_shared: isShared
        })
      });

      if (res.ok) {
        const created = await res.json();
        setTransactions([created, ...transactions]);
        setAmount('');
        setDescription('');
      } else {
        const errData = await res.json().catch(() => null);
        alert(errData?.detail || 'Αποτυχία προσθήκης συναλλαγής');
      }
    } catch (err) {
      console.error('Error adding transaction:', err);
    }
  };

  // Handle Delete Transaction
  const handleDeleteTransaction = async (id: number) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/v1/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok || res.status === 204) {
        setTransactions(transactions.filter(t => t.id !== id));
      }
    } catch (err) {
      console.error('Error deleting transaction:', err);
    }
  };

  // Native Export to Excel (.xlsx)
  const handleExportExcel = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/export/excel', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'family_budget_transactions.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Αποτυχία εξαγωγής αρχείου Excel');
      }
    } catch (err) {
      console.error('Excel export error:', err);
    }
  };

  // Native Export to PDF (.pdf)
  const handleExportPdf = async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/v1/export/pdf', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'family_budget_transactions.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        alert('Αποτυχία εξαγωγής αρχείου PDF');
      }
    } catch (err) {
      console.error('PDF export error:', err);
    }
  };


  // Active Category Options for current Selected Transaction Type
  const currentCategories = CATEGORIES_BY_TYPE[transactionType] || CATEGORIES_BY_TYPE.expense;

  // Render Profile Selection Screen if not authenticated
  if (!token || !user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-sans relative overflow-hidden">
        {/* Background Decorative Gradient Blobs */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-xl bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl relative z-10">
          {/* Top Branding Header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30 mb-3 shadow-lg shadow-emerald-900/20">
              <Wallet className="w-10 h-10" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-200 bg-clip-text text-transparent">
              Family Budget & Finance Tracker
            </h1>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5 justify-center">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Επιλέξτε το προφίλ σας για είσοδο
            </p>
          </div>

          {/* API Offline Banner */}
          {!apiOnline && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-amber-300 text-xs flex flex-col gap-2">
              <div className="flex items-center gap-2 font-bold text-sm text-amber-200">
                <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                Το Backend API δεν είναι συνδεδεμένο
              </div>
              <p className="text-amber-300/80">
                Παρακαλώ εκτελέστε την εντολή <code className="bg-amber-950/80 px-1.5 py-0.5 rounded text-amber-200 font-mono">.\run_all_win11.ps1</code> στο PowerShell για να εκκινήσετε τον διακομιστή.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {authError && (
            <div className="mb-6 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          {/* Profiles Grid */}
          {!showAddMember ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {profiles.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleProfileClick(p)}
                    disabled={authLoading}
                    className="group p-5 bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/50 rounded-2xl transition duration-200 flex items-center gap-4 text-left shadow-md hover:shadow-emerald-950/30 disabled:opacity-50 relative overflow-hidden"
                  >
                    <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl group-hover:bg-emerald-500 group-hover:text-slate-950 transition duration-200 shrink-0">
                      <UserIcon className="w-6 h-6" />
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="font-semibold text-base text-slate-100 group-hover:text-emerald-300 transition truncate">
                        {p.full_name || p.email}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${p.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-indigo-300 border-slate-700'}`}>
                          {p.role}
                        </span>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          {p.role === 'admin' ? (
                            <>
                              <Lock className="w-3 h-3 text-amber-400" />
                              4-PIN Required
                            </>
                          ) : (
                            <span className="text-emerald-400 font-medium">Ελεύθερη Είσοδος</span>
                          )}
                        </span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Add New Profile Button */}
              <div className="pt-4 border-t border-slate-800 flex justify-center">
                <button
                  onClick={() => setShowAddMember(true)}
                  className="text-xs px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition flex items-center gap-2 font-medium"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Προσθήκη Νέου Μέλους Οικογένειας
                </button>
              </div>
            </div>
          ) : (
            /* Add Member Form */
            <form onSubmit={handleAddMember} className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-emerald-400" />
                Δημιουργία Νέου Προφίλ Μέλους
              </h3>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ονοματεπώνυμο</label>
                <input 
                  type="text" 
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="π.χ. Μαρία Παπαδοπούλου" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  required 
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Email (Προαιρετικό)</label>
                <input 
                  type="email" 
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="maria@family.local" 
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Ρόλος</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                >
                  <option value="user">Μέλος Οικογένειας (Ελεύθερη Είσοδος)</option>
                  <option value="admin">Διαχειριστής (Admin - Απαιτεί 4-ψηφιο PIN)</option>
                </select>
              </div>

              {newRole === 'admin' && (
                <div>
                  <label className="block text-xs font-medium text-amber-400 mb-1">4-ψηφιο PIN Διαχειριστή</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    value={newAdminPin}
                    onChange={(e) => setNewAdminPin(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="1234" 
                    className="w-full bg-slate-950 border border-amber-500/50 rounded-xl px-4 py-2.5 text-sm text-amber-200 focus:outline-none focus:border-amber-400 font-mono tracking-widest text-center"
                    required 
                  />
                </div>
              )}

              <div className="flex items-center gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddMember(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2.5 rounded-xl transition text-sm"
                >
                  Ακύρωση
                </button>
                <button 
                  type="submit"
                  disabled={authLoading}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl transition shadow-lg shadow-emerald-900/30 text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <UserPlus className="w-4 h-4" />
                  Δημιουργία & Είσοδος
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 4-digit PIN Modal for Admin Login */}
        {selectedAdminProfile && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 max-w-sm w-full shadow-2xl text-center">
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30 w-fit mx-auto mb-3">
                <Lock className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">
                Εισαγωγή 4-ψηφιου PIN Admin
              </h3>
              <p className="text-xs text-slate-400 mt-1 mb-4">
                Πληκτρολογήστε το PIN για το προφίλ <strong className="text-amber-300">{selectedAdminProfile.full_name}</strong> (Default: 1234)
              </p>

              {/* PIN Display */}
              <div className="flex justify-center gap-3 mb-6">
                {[0, 1, 2, 3].map((idx) => (
                  <div 
                    key={idx}
                    className={`w-10 h-12 rounded-xl border flex items-center justify-center font-bold text-lg font-mono transition ${pinInput[idx] ? 'border-amber-400 bg-amber-500/20 text-amber-300' : 'border-slate-800 bg-slate-950 text-slate-600'}`}
                  >
                    {pinInput[idx] ? '•' : ''}
                  </div>
                ))}
              </div>

              {/* PIN Keypad Grid */}
              <div className="grid grid-cols-3 gap-2 max-w-[220px] mx-auto mb-6">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '✓'].map((key) => (
                  <button
                    key={key}
                    onClick={() => {
                      if (key === 'C') setPinInput('');
                      else if (key === '✓') {
                        if (pinInput.length === 4) handleLoginWithPin(selectedAdminProfile.id, pinInput);
                      } else {
                        if (pinInput.length < 4) setPinInput(prev => prev + key);
                      }
                    }}
                    className="h-11 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 font-semibold transition active:scale-95 flex items-center justify-center text-sm"
                  >
                    {key}
                  </button>
                ))}
              </div>

              <div className="flex justify-between gap-3">
                <button
                  onClick={() => setSelectedAdminProfile(null)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
                >
                  Ακύρωση
                </button>
                <button
                  onClick={() => handleLoginWithPin(selectedAdminProfile.id, pinInput)}
                  disabled={pinInput.length !== 4 || authLoading}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition disabled:opacity-50"
                >
                  Σύνδεση
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Render Authenticated Main Dashboard
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <header className="glass-panel rounded-2xl p-4 mb-8 flex flex-col md:flex-row justify-between items-center gap-4 border border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
            <Wallet className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
              Family Budget & Finance Tracker
            </h1>
            <p className="text-xs text-slate-400">Self-Hosted • Low Footprint • Multi-User</p>
          </div>
        </div>

        {/* Navigation Tabs & User Profile */}
        <div className="flex items-center gap-3 flex-wrap justify-end">
          {/* Admin Switcher Tab */}
          {user.role === 'admin' && (
            <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'dashboard' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Wallet className="w-3.5 h-3.5" />
                Dashboard
              </button>
              <button
                onClick={() => setActiveTab('admin')}
                className={`px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 ${activeTab === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-slate-400 hover:text-slate-200'}`}
              >
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Admin Panel
              </button>
            </div>
          )}

          <div className="px-3 py-1.5 bg-slate-900 rounded-full text-xs text-slate-300 border border-slate-800 flex items-center gap-2">
            <UserIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-100">{user.full_name || user.email}</span>
            <span className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-800 text-indigo-300'}`}>
              {user.role}
            </span>
          </div>

          <button 
            onClick={handleLogout}
            className="text-xs px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 transition flex items-center gap-1.5 font-medium"
            title="Αλλαγή Προφίλ Μέλους"
          >
            <Users className="w-3.5 h-3.5" />
            Αλλαγή Προφίλ
          </button>
        </div>
      </header>

      {/* Main View: Dashboard or Admin Panel */}
      {activeTab === 'dashboard' ? (
        <main className="max-w-7xl mx-auto space-y-8">
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-400">Συνολικά Έσοδα</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">€{stats.total_income.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
                <TrendingUp className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-400">Συνολικά Έξοδα</p>
                <h3 className="text-2xl font-bold text-rose-400 mt-1">€{stats.total_expenses.toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-rose-500/10 text-rose-400 rounded-xl">
                <TrendingDown className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-400">Επενδύσεις & Αποταμίευση</p>
                <h3 className="text-2xl font-bold text-amber-400 mt-1">€{(stats.total_investments + stats.total_savings).toFixed(2)}</h3>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
                <PiggyBank className="w-6 h-6" />
              </div>
            </div>

            <div className="glass-card p-5 rounded-2xl border border-slate-800 flex justify-between items-center bg-slate-900/60 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-400">Καθαρό Υπόλοιπο</p>
                <h3 className={`text-2xl font-bold mt-1 ${stats.net_savings >= 0 ? 'text-sky-400' : 'text-rose-400'}`}>
                  €{stats.net_savings.toFixed(2)}
                </h3>
              </div>
              <div className="p-3 bg-sky-500/10 text-sky-400 rounded-xl">
                <CheckCircle className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Budget Limits Alert Badges */}
          {budgetLimits.length > 0 && (
            <div className="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Μηνιαία Όρια Προϋπολογισμού Κατηγοριών (Admin Caps)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {budgetLimits.map(b => {
                  const spent = stats.category_expenses[b.category] || 0;
                  const pct = Math.min(Math.round((spent / b.monthly_limit) * 100), 100);
                  const isOver = spent > b.monthly_limit;

                  return (
                    <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-slate-200">{b.category}</span>
                        <span className={`font-mono font-bold ${isOver ? 'text-rose-400' : 'text-slate-300'}`}>
                          €{spent.toFixed(0)} / €{b.monthly_limit.toFixed(0)}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${isOver ? 'bg-rose-500' : pct > 80 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Financial Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cash Flow Distribution */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Κατανομή Ταμειακών Ροών
              </h2>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData}>
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }} 
                    />
                    <Bar dataKey="amount" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Expense Category Pie Chart */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                Έξοδα ανά Κατηγορία
              </h2>
              <div className="h-64">
                {pieData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                    <Inbox className="w-8 h-8 stroke-[1.5]" />
                    <span className="text-sm">Δεν έχουν καταγραφεί έξοδα</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Add Transaction Form & List */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Add Transaction Form */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60 h-fit">
              <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-emerald-400" />
                Προσθήκη Συναλλαγής
              </h2>
              <form onSubmit={handleAddTransaction} className="space-y-4">
                {/* Transaction Type Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Τύπος Συναλλαγής</label>
                  <select 
                    value={transactionType}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                  >
                    <option value="expense">Έξοδο (Expense)</option>
                    <option value="income">Έσοδο (Income)</option>
                    <option value="investment">Επένδυση (Investment)</option>
                    <option value="savings">Αποταμίευση (Savings)</option>
                  </select>
                </div>

                {/* Amount Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ποσό (€)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    placeholder="π.χ. 45.50" 
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-mono"
                    required 
                  />
                </div>

                {/* Dynamic Category Selector based on Transaction Type */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Κατηγορία ({transactionType === 'income' ? 'Εσόδου' : transactionType === 'investment' ? 'Επένδυσης' : transactionType === 'savings' ? 'Αποταμίευσης' : 'Εξόδου'})
                  </label>
                  <select 
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    {currentCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>

                {/* Frequency Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Συχνότητα / Επανάληψη</label>
                  <select 
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="one_off">Εφάπαξ (One-off)</option>
                    <option value="monthly">Μηνιαίο (Monthly)</option>
                    <option value="yearly">Ετήσιο (Yearly)</option>
                  </select>
                </div>

                {/* Date Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Ημερομηνία</label>
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                    required 
                  />
                </div>

                {/* Description Input */}
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Περιγραφή</label>
                  <input 
                    type="text" 
                    placeholder="π.χ. Μισθός Ιουλίου, Σούπερ μάρκετ, Αγορά ETF κλπ." 
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Shared Toggle */}
                <div className="flex items-center gap-2 pt-2">
                  <input 
                    type="checkbox" 
                    id="sharedToggle"
                    checked={isShared}
                    onChange={(e) => setIsShared(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-950 border-slate-800"
                  />
                  <label htmlFor="sharedToggle" className="text-xs text-slate-300">
                    Κοινόχρηστη Οικογενειακή Συναλλαγή
                  </label>
                </div>

                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl transition shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 mt-4"
                >
                  <PlusCircle className="w-4 h-4" />
                  Καταχώρηση
                </button>
              </form>
            </div>

            {/* Transactions List */}
            <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 bg-slate-900/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-slate-200">Ιστορικό Συναλλαγών</h2>
                  <p className="text-xs font-normal text-slate-400">
                    {user.role === 'admin' ? 'Όλες οι συναλλαγές (Admin View)' : 'Προσωπικές & Κοινόχρηστες'}
                  </p>
                </div>
                
                {/* Native Export Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-800/80 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                    title="Native Εξαγωγή σε Excel (.xlsx)"
                  >
                    <Download className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Excel</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    className="px-3 py-1.5 bg-rose-950/80 hover:bg-rose-900/90 text-rose-300 border border-rose-800/80 rounded-xl text-xs font-medium flex items-center gap-1.5 transition shadow-sm"
                    title="Native Εξαγωγή σε PDF (.pdf)"
                  >
                    <Download className="w-3.5 h-3.5 text-rose-400" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>


              {transactions.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-2xl bg-slate-950/40">
                  <div className="p-4 bg-slate-800/50 text-slate-400 rounded-full mb-3">
                    <Inbox className="w-8 h-8 stroke-[1.5]" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-300 mb-1">Δεν υπάρχουν συναλλαγές</h3>
                  <p className="text-xs text-slate-500 max-w-sm">
                    Δεν έχετε καταγράψει ακόμα κάποια συναλλαγή. Χρησιμοποιήστε τη φόρμα αριστερά για να προσθέσετε την πρώτη σας καταχώρηση!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[550px] overflow-y-auto pr-1">
                  {transactions.map(t => {
                    const tType = t.transaction_type || (t.amount > 0 ? 'income' : 'expense');
                    const isInc = tType === 'income';
                    const isInv = tType === 'investment';
                    const isSav = tType === 'savings';

                    return (
                      <div 
                        key={t.id}
                        className="p-4 bg-slate-950/70 rounded-xl border border-slate-800/80 flex items-center justify-between hover:border-slate-700 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${isInc ? 'bg-emerald-500/10 text-emerald-400' : isInv ? 'bg-amber-500/10 text-amber-400' : isSav ? 'bg-sky-500/10 text-sky-400' : 'bg-rose-500/10 text-rose-400'}`}>
                            {isInc ? <TrendingUp className="w-5 h-5" /> : isInv ? <TrendingUp className="w-5 h-5" /> : isSav ? <PiggyBank className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                            <h4 className="font-semibold text-sm text-slate-200">{t.description || t.category}</h4>
                            <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5 flex-wrap">
                              <span>{t.date}</span>
                              <span>•</span>
                              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
                                {t.category}
                              </span>
                              <span className="px-2 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800 font-mono text-[10px] uppercase">
                                {t.frequency || 'one_off'}
                              </span>
                              {t.is_shared && (
                                <span className="text-xs text-indigo-400 font-medium">Shared</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <span className={`font-bold text-sm md:text-base ${isInc ? 'text-emerald-400' : isInv ? 'text-amber-400' : isSav ? 'text-sky-400' : 'text-slate-200'}`}>
                            {isInc ? `+€${Math.abs(t.amount).toFixed(2)}` : `-€${Math.abs(t.amount).toFixed(2)}`}
                          </span>
                          <button 
                            onClick={() => handleDeleteTransaction(t.id)}
                            className="p-2 text-slate-500 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
                            title="Διαγραφή"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </main>
      ) : (
        /* Admin Exclusive Control Panel */
        <main className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-200">
          <div className="p-6 bg-slate-900 border border-amber-500/30 rounded-3xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30">
                  <Shield className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                    Πίνακας Διαχείρισης Admin (Admin Control Center)
                  </h2>
                  <p className="text-xs text-slate-400">Διαχείριση μελών, 4-ψηφιου PIN, ορίων κατηγοριών & αντιγράφων ασφαλείας</p>
                </div>
              </div>

              <button
                onClick={handleExportBackup}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-lg transition"
              >
                <Download className="w-4 h-4" />
                Εξαγωγή Backup JSON
              </button>
            </div>

            {/* Admin Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

              {/* Family Members Management */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  Διαχείριση Μελών Οικογένειας
                </h3>

                <div className="space-y-2">
                  {profiles.map(p => (
                    <div key={p.id} className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <div>
                          <p className="font-semibold text-sm text-slate-200">{p.full_name}</p>
                          <p className="text-xs text-slate-500">{p.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${p.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-indigo-300'}`}>
                          {p.role}
                        </span>
                        {p.id !== user.id && (
                          <button
                            onClick={() => handleDeleteUser(p.id)}
                            className="p-1.5 text-slate-500 hover:text-rose-400 rounded-lg transition"
                            title="Διαγραφή Μέλους"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => setShowAddMember(true)}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl transition flex items-center justify-center gap-2"
                >
                  <UserPlus className="w-4 h-4 text-emerald-400" />
                  Προσθήκη Νέου Μέλους
                </button>
              </div>

              {/* Admin 4-digit PIN Update Form */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-amber-400" />
                  Αλλαγή 4-ψηφιου PIN Admin
                </h3>

                <form onSubmit={handleUpdateAdminPin} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  {pinChangeMsg && (
                    <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      {pinChangeMsg}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Νέο 4-ψηφιο PIN</label>
                    <input
                      type="password"
                      maxLength={4}
                      value={changePinInput}
                      onChange={(e) => setChangePinInput(e.target.value.replace(/[^0-9]/g, ''))}
                      placeholder="1234"
                      className="w-full bg-slate-900 border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-300 font-mono tracking-widest text-center focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={changePinInput.length !== 4}
                    className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition disabled:opacity-50"
                  >
                    Ενημέρωση PIN
                  </button>
                </form>

                {/* Category Budget Limits Control */}
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 pt-4">
                  <Settings className="w-4 h-4 text-sky-400" />
                  Ορισμός Μηνιαίων Ορίων Κατηγοριών Εξόδων
                </h3>

                <form onSubmit={handleSetBudgetLimit} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Κατηγορία Εξόδου</label>
                      <select
                        value={limitCategory}
                        onChange={(e) => setLimitCategory(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100"
                      >
                        {CATEGORIES_BY_TYPE.expense.map(c => (
                          <option key={c.id} value={c.id}>{c.id}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1">Όριο (€/μήνα)</label>
                      <input
                        type="number"
                        placeholder="500"
                        value={limitAmount}
                        onChange={(e) => setLimitAmount(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 font-mono"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl transition"
                  >
                    Αποθήκευση Ορίου Κατηγορίας
                  </button>
                </form>

                {/* Active Budget Limits Table */}
                <div className="space-y-2">
                  {budgetLimits.map(b => (
                    <div key={b.id} className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-xs">
                      <span className="font-semibold text-slate-200">{b.category}</span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-emerald-400">€{b.monthly_limit.toFixed(2)}/μήνα</span>
                        <button
                          onClick={() => handleDeleteBudgetLimit(b.id)}
                          className="text-slate-500 hover:text-rose-400 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          </div>
        </main>
      )}
    </div>
  );
}
