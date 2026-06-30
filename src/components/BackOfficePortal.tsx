/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Users,
  Briefcase,
  FileCheck,
  ArrowRightLeft,
  Search,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Upload,
  BookOpen,
  DollarSign,
  Plus,
  ShieldAlert,
  Download,
  Info,
  Calendar,
  Layers,
  ChevronRight,
  LogOut,
  FileText,
  Eye
} from 'lucide-react';
import { TrustlineStore, generateUUID, generateInvestmentRef } from '../store';
import { User, ClientProfile, Investment, InvestmentProduct, WithdrawalRequest, AuditLog, InvestmentCertificate, WalletTransaction } from '../types';

interface BackOfficePortalProps {
  currentDate: string;
  onStateChange: () => void;
  key?: string;
}

export default function BackOfficePortal({ currentDate, onStateChange }: BackOfficePortalProps) {
  // Session & Authentication
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Loaded state
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [companySetting, setCompanySetting] = useState<any>(null);
  const [walletTransactions, setWalletTransactions] = useState<WalletTransaction[]>([]);
  
  // UI Tabs
  const [activeTab, setActiveTab] = useState<'dashboard' | 'clients' | 'book' | 'requests' | 'permissions'>('dashboard');
  const [searchTerm, setSearchTerm] = useState('');

  // Selected details
  const [selectedClient, setSelectedClient] = useState<ClientProfile | null>(null);
  const [reviewingKyc, setReviewingKyc] = useState<ClientProfile | null>(null);
  const [kycRemarks, setKycRemarks] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [requestsSubTab, setRequestsSubTab] = useState<'payouts' | 'deposits'>('payouts');
  const [viewReceiptUrl, setViewReceiptUrl] = useState<string | null>(null);

  // Investment booking inputs (Backoffice side)
  const [bookClientId, setBookClientId] = useState('');
  const [bookProductId, setBookProductId] = useState('');
  const [bookPrincipal, setBookPrincipal] = useState<number>(0);
  const [bookStartDate, setBookStartDate] = useState(currentDate);

  // Client Creation inputs
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [newClientFirstName, setNewClientFirstName] = useState('');
  const [newClientLastName, setNewClientLastName] = useState('');
  const [newClientPhone, setNewClientPhone] = useState('');
  const [newClientBvn, setNewClientBvn] = useState('');
  const [newClientNin, setNewClientNin] = useState('');

  // Permissions profile assigned to backoffice user
  const boPermissions = [
    { key: 'view_only', label: 'View Only Reports', active: true },
    { key: 'create_clients', label: 'Create New Client Profiles', active: true },
    { key: 'edit_clients', label: 'Edit Existing Client Profiles', active: true },
    { key: 'book_investment', label: 'Book Portfolio Investments', active: true },
    { key: 'approve_withdrawals', label: 'Approve Withdrawals & Liquidations', active: true },
    { key: 'download_certs', label: 'Generate & Download Investment Certificates', active: true }
  ];

  useEffect(() => {
    // Attempt auto login with default back office staff for convenience
    const dbState = TrustlineStore.loadState();
    const defaultBO = dbState.users.find(u => u.email === 'backoffice@trustlinecapital.com');
    if (defaultBO) {
      handleLoginDirect(defaultBO);
    }
  }, []);

  const handleLoginDirect = (user: User) => {
    setCurrentUser(user);
    setLoginError('');
  };

  const reloadData = () => {
    const dbState = TrustlineStore.loadState();
    setClients(dbState.clientProfiles);
    setUsers(dbState.users);
    setInvestments(dbState.investments);
    setProducts(dbState.products.filter(p => p.is_active));
    setWithdrawals(dbState.withdrawals);
    setCompanySetting(dbState.companySetting);
    setWalletTransactions(dbState.walletTransactions || []);
  };

  useEffect(() => {
    reloadData();
  }, [currentUser, currentDate]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const dbState = TrustlineStore.loadState();
    const foundUser = dbState.users.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password_hash === passwordInput);
    
    if (foundUser) {
      if (!foundUser.is_backoffice_user && !foundUser.is_superadmin) {
        setLoginError('Error: This is the Back Office portal. Please log in with staff credentials.');
        return;
      }
      handleLoginDirect(foundUser);
    } else {
      setLoginError('Invalid back office credentials.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Create client directly from back office desk
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientEmail || !newClientFirstName || !newClientLastName || !newClientPhone || !newClientBvn || !newClientNin) {
      setErrorMsg('Please fill out all client fields.');
      return;
    }

    const dbState = TrustlineStore.loadState();
    const exists = dbState.users.some(u => u.email.toLowerCase() === newClientEmail.toLowerCase());
    if (exists) {
      setErrorMsg('Email address already registered.');
      return;
    }

    const newUserId = `user-${generateUUID()}`;
    const newProfileId = `profile-${generateUUID()}`;

    const newUser: User = {
      id: newUserId,
      email: newClientEmail.toLowerCase(),
      password_hash: 'client123', // Default starter password
      first_name: newClientFirstName,
      last_name: newClientLastName,
      phone: newClientPhone,
      is_active: true,
      is_client: true,
      is_backoffice_user: false,
      is_superadmin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newProfile: ClientProfile = {
      id: newProfileId,
      user_id: newUserId,
      bvn: newClientBvn,
      nin: newClientNin,
      date_of_birth: '',
      address: '',
      city: '',
      state: '',
      country: 'Nigeria',
      postal_code: '',
      occupation: '',
      employer: '',
      annual_income: 0,
      source_of_funds: 'Salary',
      kyc_status: 'pending',
      kyc_documents: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const updatedUsers = [...dbState.users, newUser];
    const updatedProfiles = [...dbState.clientProfiles, newProfile];

    TrustlineStore.saveState({
      ...dbState,
      users: updatedUsers,
      clientProfiles: updatedProfiles
    });

    // Audit log
    TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'backoffice', 'BACKOFFICE_CREATE_CLIENT', 'users', newUserId, null, newUser);

    setSuccessMsg(`Client ${newClientFirstName} ${newClientLastName} created successfully with default password "client123"`);
    setShowCreateClientModal(false);
    
    // reset fields
    setNewClientEmail('');
    setNewClientFirstName('');
    setNewClientLastName('');
    setNewClientPhone('');
    setNewClientBvn('');
    setNewClientNin('');

    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Perform KYC verification review
  const handleVerifyKyc = (status: 'verified' | 'rejected') => {
    if (!reviewingKyc) return;

    const dbState = TrustlineStore.loadState();
    const updatedProfiles = dbState.clientProfiles.map(p => {
      if (p.id === reviewingKyc.id) {
        return {
          ...p,
          kyc_status: status,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    TrustlineStore.saveState({
      ...dbState,
      clientProfiles: updatedProfiles
    });

    // Log audit trail
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'backoffice',
      status === 'verified' ? 'VERIFY_CLIENT_KYC' : 'REJECT_CLIENT_KYC',
      'client_profiles',
      reviewingKyc.id,
      { kyc_status: reviewingKyc.kyc_status },
      { kyc_status: status, remarks: kycRemarks }
    );

    setSuccessMsg(`Client KYC successfully ${status}!`);
    setReviewingKyc(null);
    setKycRemarks('');
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Payout booking directly
  const handleBookInvestmentByStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookClientId || !bookProductId || bookPrincipal <= 0) {
      setErrorMsg('Please configure all booking specifications.');
      return;
    }

    const selectedCl = clients.find(c => c.id === bookClientId);
    if (!selectedCl) {
      setErrorMsg('Selected client profile not found.');
      return;
    }

    const selectedUs = users.find(u => u.id === selectedCl.user_id);
    if (!selectedUs) {
      setErrorMsg('Client account is disabled.');
      return;
    }

    if (selectedCl.kyc_status !== 'verified') {
      setErrorMsg('Warning: This client profile has not completed their verified KYC process.');
      return;
    }

    const prod = products.find(p => p.id === bookProductId);
    if (!prod) {
      setErrorMsg('Please select a valid investment product.');
      return;
    }

    if (bookPrincipal < prod.minimum_investment) {
      setErrorMsg(`Booking violates minimum investment constraint: ₦/USD ${prod.minimum_investment.toLocaleString()}`);
      return;
    }

    const dbState = TrustlineStore.loadState();
    const start = new Date(bookStartDate);
    const tenure = prod.tenure_days;
    const rate = prod.annual_rate;

    const maturity = new Date(start);
    maturity.setDate(maturity.getDate() + tenure);

    const expectedInterest = bookPrincipal * (rate / 100) * (tenure / 365);
    const expectedReturn = bookPrincipal + expectedInterest;

    const ref = generateInvestmentRef(start.getFullYear());
    const newInvestment: Investment = {
      id: `inv-${generateUUID()}`,
      client_id: selectedCl.id,
      product_id: prod.id,
      investment_reference: ref,
      principal_amount: bookPrincipal,
      currency: prod.currency,
      exchange_rate_used: prod.currency === 'USD' ? prod.exchange_rate_to_ngn : undefined,
      amount_in_ngn: prod.currency === 'USD' ? bookPrincipal * (prod.exchange_rate_to_ngn || 1520) : bookPrincipal,
      annual_rate: rate,
      start_date: start.toISOString().split('T')[0],
      maturity_date: maturity.toISOString().split('T')[0],
      tenure_days: tenure,
      status: 'active',
      daily_interest_accrued: 0,
      total_interest_accrued: 0,
      total_expected_interest: expectedInterest,
      expected_return_amount: expectedReturn,
      current_value: bookPrincipal,
      created_by: currentUser!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Cert
    const newCert: InvestmentCertificate = {
      id: `cert-${generateUUID()}`,
      investment_id: newInvestment.id,
      certificate_number: `TRL-CERT-${ref}`,
      issue_date: bookStartDate,
      client_name: `${selectedUs.first_name} ${selectedUs.last_name}`,
      principal_amount: bookPrincipal,
      interest_rate: rate,
      tenure_days: tenure,
      maturity_date: maturity.toISOString().split('T')[0],
      expected_return: expectedReturn,
      created_at: new Date().toISOString()
    };

    TrustlineStore.saveState({
      ...dbState,
      investments: [newInvestment, ...dbState.investments],
      certificates: [newCert, ...dbState.certificates]
    });

    // Log audit trail
    TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'backoffice', 'BOOK_INVESTMENT_BY_STAFF', 'investments', newInvestment.id, null, newInvestment);

    setSuccessMsg(`Successfully booked investment reference: ${ref} for ${selectedUs.first_name} ${selectedUs.last_name}!`);
    setBookClientId('');
    setBookProductId('');
    setBookPrincipal(0);
    setErrorMsg('');
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Process and approve liquidation requests
  const handleProcessRequest = (req: WithdrawalRequest, action: 'approve' | 'reject') => {
    const dbState = TrustlineStore.loadState();
    
    // Update request status
    const updatedWithdrawals = dbState.withdrawals.map(w => {
      if (w.id === req.id) {
        return {
          ...w,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          approved_by: currentUser!.id,
          approval_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }
      return w;
    });

    // If approved, update underlying investment details!
    let updatedInvestments = dbState.investments;
    if (action === 'approve') {
      updatedInvestments = dbState.investments.map(inv => {
        if (inv.id === req.investment_id) {
          if (req.request_type === 'full_liquidate' || req.request_type === 'withdraw') {
            return {
              ...inv,
              status: 'liquidated' as const,
              current_value: 0,
              updated_at: new Date().toISOString()
            };
          } else if (req.request_type === 'part_liquidate') {
            const nextValue = Math.max(0, inv.current_value - req.amount);
            return {
              ...inv,
              status: nextValue <= 0 ? 'liquidated' as const : 'part_liquidated' as const,
              current_value: nextValue,
              updated_at: new Date().toISOString()
            };
          }
        }
        return inv;
      });
    }

    TrustlineStore.saveState({
      ...dbState,
      withdrawals: updatedWithdrawals,
      investments: updatedInvestments
    });

    // Write audit log
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'backoffice',
      action === 'approve' ? 'APPROVE_WITHDRAWAL_REQUEST' : 'REJECT_WITHDRAWAL_REQUEST',
      'withdrawal_requests',
      req.id
    );

    setSuccessMsg(`Successfully ${action === 'approve' ? 'Approved' : 'Rejected'} Payout Settlement Request!`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Process and approve wallet deposit proofs
  const handleProcessDeposit = (tx: WalletTransaction, action: 'approve' | 'reject') => {
    const dbState = TrustlineStore.loadState();
    
    // Update transaction status
    const updatedTxs = (dbState.walletTransactions || []).map((t: WalletTransaction) => {
      if (t.id === tx.id) {
        return {
          ...t,
          status: action === 'approve' ? 'approved' as const : 'rejected' as const,
          approved_at: new Date().toISOString()
        };
      }
      return t;
    });

    // If approved, credit client's profile wallet balance
    const updatedProfiles = dbState.clientProfiles.map(p => {
      if (p.id === tx.client_id) {
        if (tx.currency === 'USD') {
          return {
            ...p,
            wallet_balance_usd: (p.wallet_balance_usd || 0) + tx.amount,
            updated_at: new Date().toISOString()
          };
        } else {
          return {
            ...p,
            wallet_balance_ngn: (p.wallet_balance_ngn || 0) + tx.amount,
            updated_at: new Date().toISOString()
          };
        }
      }
      return p;
    });

    TrustlineStore.saveState({
      ...dbState,
      walletTransactions: updatedTxs,
      clientProfiles: updatedProfiles
    });

    // Write audit log
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'backoffice',
      action === 'approve' ? 'APPROVE_WALLET_DEPOSIT' : 'REJECT_WALLET_DEPOSIT',
      'wallet_transactions',
      tx.id,
      null,
      { amount: tx.amount, currency: tx.currency }
    );

    setSuccessMsg(`Successfully ${action === 'approve' ? 'Approved & Credited' : 'Rejected'} Client Wallet Deposit!`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Searching clients
  const filteredClients = clients.filter(c => {
    const owner = users.find(u => u.id === c.user_id);
    if (!owner) return false;
    const nameStr = `${owner.first_name} ${owner.last_name} ${owner.email} ${c.bvn}`.toLowerCase();
    return nameStr.includes(searchTerm.toLowerCase());
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Backoffice Header */}
      <header className="bg-slate-950 text-white border-b border-slate-800 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {companySetting?.company_logo_url ? (
              <img
                src={companySetting.company_logo_url}
                alt="Logo"
                className="max-h-9 max-w-[120px] object-contain rounded-lg shadow-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-emerald-600 text-white font-black p-2 rounded-lg text-base">
                BO
              </div>
            )}
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
                {companySetting?.company_name || 'Trustline'} Back Office Operations
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-semibold border border-slate-700">
                  backoffice.trustlinecapital.com
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">Security audits, bookings & liquidation logs</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <span className="text-[10px] text-slate-400 font-mono">
                  Role: Asset Manager
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition cursor-pointer font-medium"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-500">Unauthenticated</span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {!currentUser ? (
          /* Backoffice Login Panel */
          <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                {companySetting?.company_logo_url ? (
                  <img
                    src={companySetting.company_logo_url}
                    alt="Company Logo"
                    className="max-h-16 max-w-[200px] object-contain mx-auto mb-3"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span className="inline-block bg-emerald-50 text-emerald-600 rounded-full p-3 mb-2">
                    <ShieldAlert className="w-6 h-6" />
                  </span>
                )}
                <h2 className="text-lg font-bold text-slate-900">
                  {companySetting?.company_name || 'Trustline'} Operations Desk Login
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access Back Office client verification and booking dashboards
                </p>
              </div>

              {loginError && (
                <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Staff Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="backoffice@trustlinecapital.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Security PIN/Password</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg text-xs shadow transition mt-6 cursor-pointer"
                >
                  Authenticate Desk
                </button>
              </form>


            </div>
          </div>
        ) : (
          /* Backoffice Portal Body */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-xs p-4 h-fit">
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'Overview Metrics', icon: Layers },
                  { id: 'clients', label: 'Client Profiles Management', icon: Users },
                  { id: 'book', label: 'Book Investments Desk', icon: BookOpen },
                  { id: 'requests', label: 'Liquidation Approvals', icon: FileCheck },
                  { id: 'permissions', label: 'My Permission Scopes', icon: ShieldAlert }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSuccessMsg('');
                        setErrorMsg('');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        activeTab === tab.id ? 'bg-emerald-50 text-emerald-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Core Workspaces */}
            <div className="lg:col-span-3 space-y-6">
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* 1. Dashboard Workspace */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Asset Desk Dashboard</h2>
                    <p className="text-xs text-slate-500">Monitor active operations, pending portfolios, and KYC queues.</p>
                  </div>

                  {/* Operational indicators */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Active Assets</span>
                      <strong className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                        ₦{investments.reduce((acc, inv) => acc + (inv.status === 'active' ? inv.amount_in_ngn : 0), 0).toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Client Pools</span>
                      <strong className="text-xl font-bold font-mono text-slate-900 mt-1 block">
                        {clients.length} Profiles
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">KYC Verification Queue</span>
                      <strong className="text-xl font-bold font-mono text-amber-600 mt-1 block">
                        {clients.filter(c => c.kyc_status === 'pending').length} Outstanding
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Settlement Queue</span>
                      <strong className="text-xl font-bold font-mono text-red-600 mt-1 block">
                        {withdrawals.filter(w => w.status === 'pending').length} Actions
                      </strong>
                    </div>
                  </div>

                  {/* Quick Queues */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Pending KYC Action Queue</h3>
                      {clients.filter(c => c.kyc_status === 'pending').length === 0 ? (
                        <p className="text-xs text-slate-400">All client KYC verifications are completely cleared.</p>
                      ) : (
                        <div className="space-y-3">
                          {clients.filter(c => c.kyc_status === 'pending').slice(0, 3).map((cl) => {
                            const owner = users.find(u => u.id === cl.user_id);
                            return (
                              <div key={cl.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                                <div>
                                  <strong className="text-slate-800">{owner?.first_name} {owner?.last_name}</strong>
                                  <span className="block text-[10px] text-slate-500">{owner?.email}</span>
                                </div>
                                <button
                                  onClick={() => {
                                    setReviewingKyc(cl);
                                    setActiveTab('clients');
                                  }}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-semibold text-[10px] px-2 py-1 rounded"
                                >
                                  Review Documents
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5 space-y-4">
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Liquidation Requests Docket</h3>
                      {withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                        <p className="text-xs text-slate-400">No pending payout settlements awaiting approval.</p>
                      ) : (
                        <div className="space-y-3">
                          {withdrawals.filter(w => w.status === 'pending').slice(0, 3).map((req) => {
                            const clProfile = clients.find(c => c.id === req.client_id);
                            const clUser = users.find(u => u.id === clProfile?.user_id);
                            const underlyingInv = investments.find(i => i.id === req.investment_id);
                            return (
                              <div key={req.id} className="flex justify-between items-center text-xs bg-slate-50 p-2.5 rounded border border-slate-100">
                                <div>
                                  <strong className="text-slate-800">{clUser?.first_name} {clUser?.last_name}</strong>
                                  <span className="block text-[10px] font-mono text-slate-500">
                                    {underlyingInv?.investment_reference} • {req.request_type.replace('_', ' ')}
                                  </span>
                                </div>
                                <button
                                  onClick={() => setActiveTab('requests')}
                                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[10px] px-2.5 py-1 rounded shadow-xs"
                                >
                                  Process payout
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Client Management Workspace */}
              {activeTab === 'clients' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Client Register Index</h2>
                      <p className="text-xs text-slate-500">Search, edit, verify KYC credentials, or create client portfolios manually.</p>
                    </div>
                    <button
                      onClick={() => setShowCreateClientModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Create Client Account
                    </button>
                  </div>

                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-hidden focus:border-emerald-500 transition"
                      placeholder="Search clients by name, email, BVN, NIN, etc."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>

                  {/* Clients List Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-4">Customer Name</th>
                            <th className="p-4">BVN / NIN</th>
                            <th className="p-4">Annual Income</th>
                            <th className="p-4">Verification</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {filteredClients.map((cl) => {
                            const owner = users.find(u => u.id === cl.user_id);
                            if (!owner) return null;
                            return (
                              <tr key={cl.id} className="hover:bg-slate-50/50">
                                <td className="p-4">
                                  <span className="font-bold block text-slate-900">{owner.first_name} {owner.last_name}</span>
                                  <div className="flex flex-wrap gap-1.5 mt-0.5 items-center">
                                    <span className="text-[10px] text-slate-500 font-mono">{owner.email}</span>
                                    <span className={`text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded border ${
                                      cl.account_type === 'Corporate' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                      cl.account_type === 'Joint' ? 'bg-indigo-50 text-indigo-700 border-indigo-200' :
                                      'bg-slate-50 text-slate-600 border-slate-200'
                                    }`}>
                                      {cl.account_type || 'Individual'}
                                    </span>
                                  </div>
                                </td>
                                <td className="p-4 font-mono">
                                  <span className="block text-slate-700">BVN: {cl.bvn || 'Not supplied'}</span>
                                  <span className="text-[10px] text-slate-400">NIN: {cl.nin || 'Not supplied'}</span>
                                </td>
                                <td className="p-4 font-mono">
                                  ₦{cl.annual_income?.toLocaleString() || '0'}
                                </td>
                                <td className="p-4">
                                  <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                    cl.kyc_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                                    cl.kyc_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                    'bg-red-50 text-red-700 border-red-200'
                                  }`}>
                                    {cl.kyc_status}
                                  </span>
                                </td>
                                <td className="p-4 text-right space-x-1.5">
                                  <button
                                    onClick={() => setReviewingKyc(cl)}
                                    className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-2.5 py-1.5 rounded transition cursor-pointer"
                                  >
                                    Review Files
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedClient(cl);
                                      // prefill book clientId
                                      setBookClientId(cl.id);
                                      setActiveTab('book');
                                    }}
                                    className="text-[10px] bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-2.5 py-1.5 rounded shadow-2xs transition cursor-pointer"
                                  >
                                    Book Asset
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. Book Investment desk Workspace */}
              {activeTab === 'book' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Secured Asset Booking Wizard</h2>
                    <p className="text-xs text-slate-500">Book client cash investments directly, generating serial references and printable certificates.</p>
                  </div>

                  <form onSubmit={handleBookInvestmentByStaff} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Select Client Target *</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden"
                          value={bookClientId}
                          onChange={(e) => setBookClientId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Client Profile --</option>
                          {clients.map(c => {
                            const owner = users.find(u => u.id === c.user_id);
                            return (
                              <option key={c.id} value={c.id}>
                                {owner?.first_name} {owner?.last_name} ({owner?.email}) - KYC: {c.kyc_status}
                              </option>
                            );
                          })}
                        </select>
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Select Asset Product *</label>
                        <select
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden"
                          value={bookProductId}
                          onChange={(e) => setBookProductId(e.target.value)}
                          required
                        >
                          <option value="">-- Choose Active Fund --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>
                              {p.product_name} ({p.currency} - yield {p.annual_rate}%)
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Principal Invested Amount *</label>
                        <input
                          type="number"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                          placeholder="e.g. 500000"
                          value={bookPrincipal || ''}
                          onChange={(e) => setBookPrincipal(Number(e.target.value))}
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Start Activation Date *</label>
                        <input
                          type="date"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                          value={bookStartDate}
                          onChange={(e) => setBookStartDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setBookClientId('');
                          setBookProductId('');
                          setBookPrincipal(0);
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded font-semibold cursor-pointer"
                      >
                        Reset Form
                      </button>
                      <button
                        type="submit"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded font-semibold shadow-xs cursor-pointer"
                      >
                        Confirm Booking & Generate serials
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* 4. Requests & Withdrawals Approval Desk */}
              {activeTab === 'requests' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Client Requests & Settlements Operations Desk</h2>
                    <p className="text-xs text-slate-500">Approve withdrawal liquidations and verify direct bank transfer deposit receipts to credit client wallets.</p>

                    {/* Sub-tabs inside Requests */}
                    <div className="flex gap-2 mt-4 border-b border-slate-100 pb-px text-xs font-semibold">
                      <button
                        onClick={() => setRequestsSubTab('payouts')}
                        className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                          requestsSubTab === 'payouts' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Payouts & Liquidations ({withdrawals.filter(w => w.status === 'pending').length})
                      </button>
                      <button
                        onClick={() => setRequestsSubTab('deposits')}
                        className={`pb-2 px-3 border-b-2 transition cursor-pointer ${
                          requestsSubTab === 'deposits' ? 'border-blue-600 text-blue-700 font-bold' : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        Wallet Funding Deposits ({(walletTransactions || []).filter(t => t.status === 'pending').length})
                      </button>
                    </div>
                  </div>

                  {requestsSubTab === 'payouts' ? (
                    withdrawals.filter(w => w.status === 'pending').length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
                        <FileCheck className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold">No pending liquidation actions active.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {withdrawals.filter(w => w.status === 'pending').map((req) => {
                          const clProfile = clients.find(c => c.id === req.client_id);
                          const clUser = users.find(u => u.id === clProfile?.user_id);
                          const underlyingInv = investments.find(i => i.id === req.investment_id);
                          const isEarly = underlyingInv ? (new Date(currentDate) < new Date(underlyingInv.maturity_date)) : false;

                          return (
                            <div key={req.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between gap-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
                              
                              <div className="flex justify-between items-start flex-wrap gap-2 pb-2.5 border-b border-slate-100 text-xs">
                                <div>
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Requesting client:</span>
                                  <h3 className="font-bold text-slate-900 text-sm mt-0.5">{clUser?.first_name} {clUser?.last_name}</h3>
                                  <span className="font-mono text-slate-500 text-[10px]">{clUser?.email}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400">Request Type:</span>
                                  <span className="block font-semibold capitalize text-slate-700">{req.request_type.replace('_', ' ')}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs font-mono">
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Ref Holdings:</span>
                                  <span className="font-bold text-slate-800">{underlyingInv?.investment_reference}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Payout Amount:</span>
                                  <span className="font-bold text-slate-800">
                                    {underlyingInv?.currency === 'USD' ? '$' : '₦'}{req.amount.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Accrued Yields:</span>
                                  <span className="font-bold text-emerald-600">
                                    +{underlyingInv?.currency === 'USD' ? '$' : '₦'}{req.interest_earned.toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Early Penalty:</span>
                                  <span className="font-bold text-red-600">
                                    -{underlyingInv?.currency === 'USD' ? '$' : '₦'}{req.penalty_amount.toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* Destination Bank display */}
                              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-700">
                                <span className="font-bold block text-slate-900 mb-1">Destination Bank Payout Details:</span>
                                Bank: <strong>{req.bank_name}</strong> • Account: <strong>{req.account_number}</strong> • Name: <strong>{req.account_name}</strong>
                                {req.remarks && <p className="mt-1.5 text-slate-500 italic">"Client Remark: {req.remarks}"</p>}
                              </div>

                              {isEarly && (
                                <div className="bg-amber-50 text-amber-800 border border-amber-200 rounded-lg p-3 text-xs flex gap-2">
                                  <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                                  <div>
                                    <strong className="block mb-0.5">Early Liquidation Active!</strong>
                                    This investment matures on <strong>{underlyingInv?.maturity_date}</strong>. System calculated penalty ₦/USD {req.penalty_amount.toLocaleString()} applied automatically.
                                  </div>
                                </div>
                              )}

                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                                <button
                                  onClick={() => handleProcessRequest(req, 'reject')}
                                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Reject Request
                                </button>
                                <button
                                  onClick={() => handleProcessRequest(req, 'approve')}
                                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-1.5 rounded shadow-xs transition cursor-pointer"
                                >
                                  Approve & Settle Funds
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  ) : (
                    /* Wallet Funding Deposits Queue */
                    (walletTransactions || []).filter(t => t.status === 'pending').length === 0 ? (
                      <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 shadow-xs">
                        <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                        <p className="font-semibold">No pending wallet funding requests found.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {(walletTransactions || []).filter(t => t.status === 'pending').map((tx) => {
                          const clProfile = clients.find(c => c.id === tx.client_id);
                          const clUser = users.find(u => u.id === clProfile?.user_id);

                          return (
                            <div key={tx.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4 relative overflow-hidden">
                              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500" />

                              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                                <div>
                                  <span className="text-[10px] bg-blue-50 text-blue-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-blue-200 font-mono">
                                    TXID: {tx.id.substring(0, 8).toUpperCase()}
                                  </span>
                                  <h3 className="font-bold text-slate-800 text-sm mt-1">
                                    {clUser ? `${clUser.first_name} ${clUser.last_name}` : 'Unknown Client'}
                                  </h3>
                                  <span className="text-xs text-slate-500 font-mono block">{clUser?.email}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">Proposed Deposit:</span>
                                  <span className="font-mono font-bold text-slate-950 text-base">
                                    {tx.currency === 'USD' ? '$' : '₦'}{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Sender Bank Name:</span>
                                  <strong className="text-slate-800">{tx.bank_name || 'Direct Transfer'}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Transaction Reference/ID:</span>
                                  <strong className="text-slate-800 font-mono">{tx.reference || 'N/A'}</strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 text-[10px] block">Submission Date:</span>
                                  <span className="text-slate-600 font-mono">{new Date(tx.created_at).toLocaleString()}</span>
                                </div>
                              </div>

                              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between gap-4 text-xs">
                                <div className="flex items-center gap-2">
                                  <FileText className="w-5 h-5 text-slate-400" />
                                  <div>
                                    <span className="font-bold text-slate-800 block">Uploaded Transaction Receipt Proof</span>
                                    <span className="text-[10px] text-slate-400">Verify client direct transfer details prior to crediting wallet.</span>
                                  </div>
                                </div>
                                <button
                                  onClick={() => setViewReceiptUrl(tx.receipt_url)}
                                  className="bg-white hover:bg-slate-100 text-blue-700 border border-slate-200 font-bold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  View Receipt File
                                </button>
                              </div>

                              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
                                <button
                                  onClick={() => handleProcessDeposit(tx, 'reject')}
                                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 font-semibold px-3 py-1.5 rounded transition cursor-pointer"
                                >
                                  Reject Request
                                </button>
                                <button
                                  onClick={() => handleProcessDeposit(tx, 'approve')}
                                  className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-1.5 rounded shadow-xs transition cursor-pointer"
                                >
                                  Approve & Credit Wallet
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* 5. Permission Scopes Viewer */}
              {activeTab === 'permissions' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Back Office Permission Access</h2>
                    <p className="text-xs text-slate-500">Your specific operation roles assigned by Super Admins.</p>
                  </div>

                  <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-4">
                    <div className="flex gap-3 items-center pb-3 border-b border-slate-100">
                      <ShieldAlert className="w-8 h-8 text-emerald-600" />
                      <div>
                        <strong className="text-slate-900 block">Current Role: Back Office Asset Manager</strong>
                        <span className="text-xs text-slate-500">Status: Active • Full CRUD scopes except product configuration</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {boPermissions.map(p => (
                        <div key={p.key} className="flex justify-between items-center text-xs p-3 border border-slate-100 rounded-lg bg-slate-50/50">
                          <span className="font-semibold text-slate-800">{p.label}</span>
                          <span className="bg-green-100 text-green-800 font-bold px-2 py-0.5 rounded-full text-[9px] uppercase">
                            Enabled
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* KYC Document Review Slider/Modal */}
      {reviewingKyc && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-xl w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Awaiting Audit</span>
                <h3 className="font-bold text-slate-900 text-sm">KYC Documents Review</h3>
              </div>
              <button
                onClick={() => {
                  setReviewingKyc(null);
                  setKycRemarks('');
                }}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ×
              </button>
            </div>

            <div className="p-5 space-y-4">
              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded border border-slate-100">
                <span className="font-semibold text-slate-800 block text-[11px]">Client Identity Parameters:</span>
                <div>Name: <strong>{users.find(u => u.id === reviewingKyc.user_id)?.first_name} {users.find(u => u.id === reviewingKyc.user_id)?.last_name}</strong></div>
                <div>BVN Code: <strong>{reviewingKyc.bvn || 'Not verified'}</strong></div>
                <div>NIN Code: <strong>{reviewingKyc.nin || 'Not verified'}</strong></div>
                <div>Dob: <strong>{reviewingKyc.date_of_birth || 'Not supplied'}</strong></div>
              </div>

              {/* Uploaded Documents attachments review */}
              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Submitted Files Log:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    { label: 'Passport Photo', name: reviewingKyc.kyc_documents.passport_name || 'passport_photo.png' },
                    { label: 'Government ID', name: reviewingKyc.kyc_documents.id_name || 'national_id_card.pdf' },
                    { label: 'Utility Bill', name: reviewingKyc.kyc_documents.utility_name || 'electric_bill_june.pdf' },
                    { label: 'Bank Statement', name: reviewingKyc.kyc_documents.bank_statement_name || 'bank_statement_3months.pdf' }
                  ].map((file) => (
                    <div key={file.label} className="border border-slate-200 rounded p-2 bg-slate-50/50 flex justify-between items-center">
                      <div>
                        <span className="block text-[10px] text-slate-400">{file.label}</span>
                        <strong className="text-slate-700 block truncate max-w-[150px] font-mono text-[10px]">{file.name}</strong>
                      </div>
                      <span className="text-[9px] bg-green-50 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-bold">
                        Attached
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Add audit review remarks (optional)</label>
                <input
                  type="text"
                  placeholder="Compliance review completed successfully."
                  className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-xs text-slate-900"
                  value={kycRemarks}
                  onChange={(e) => setKycRemarks(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-semibold">
                <button
                  onClick={() => handleVerifyKyc('rejected')}
                  className="bg-red-50 hover:bg-red-100 border border-red-200 text-red-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Reject & Flags File
                </button>
                <button
                  onClick={() => handleVerifyKyc('verified')}
                  className="bg-green-600 hover:bg-emerald-600 text-white px-5 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  Approve Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CLIENT MANUALLY MODAL */}
      {showCreateClientModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">Add Client Portfolio Manually</h3>
              <button onClick={() => setShowCreateClientModal(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            <form onSubmit={handleCreateClient} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                    placeholder="John"
                    value={newClientFirstName}
                    onChange={(e) => setNewClientFirstName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                    placeholder="Doe"
                    value={newClientLastName}
                    onChange={(e) => setNewClientLastName(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  placeholder="email@example.com"
                  value={newClientEmail}
                  onChange={(e) => setNewClientEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                  placeholder="+234..."
                  value={newClientPhone}
                  onChange={(e) => setNewClientPhone(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">BVN (11 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    placeholder="22233344455"
                    value={newClientBvn}
                    onChange={(e) => setNewClientBvn(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">NIN (11 Digits) *</label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    placeholder="11122233344"
                    value={newClientNin}
                    onChange={(e) => setNewClientNin(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowCreateClientModal(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded shadow-xs"
                >
                  Create Client & Open Portfolio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* RECEIPT LIGHTBOX MODAL */}
      {viewReceiptUrl && (
        <div className="fixed inset-0 bg-black/80 z-55 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" />
                Direct Transfer Receipt Proof Lightbox
              </span>
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6 bg-slate-900/5 flex items-center justify-center min-h-[300px] max-h-[600px] overflow-y-auto">
              {viewReceiptUrl.startsWith('data:image/') || viewReceiptUrl.startsWith('http') ? (
                <img
                  src={viewReceiptUrl}
                  alt="Payment Receipt"
                  className="max-h-[500px] max-w-full rounded-lg object-contain shadow-md"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="text-center p-12 bg-white rounded-xl border border-slate-200 shadow-xs max-w-sm">
                  <FileText className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                  <span className="font-bold text-slate-800 block text-sm">Receipt Document Attached</span>
                  <p className="text-xs text-slate-500 mt-1">This document is formatted as a file transfer stream (PDF/Binary). Open it using client-side diagnostic services or approve directly.</p>
                  <a
                    href={viewReceiptUrl}
                    download="payment-receipt"
                    className="mt-4 inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs py-2 px-4 rounded-lg shadow-sm transition"
                  >
                    Download Original File
                  </a>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewReceiptUrl(null)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-xs transition cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
