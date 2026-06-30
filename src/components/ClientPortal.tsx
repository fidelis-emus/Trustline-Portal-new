/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  TrendingUp,
  DollarSign,
  Briefcase,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  FileText,
  Upload,
  Download,
  Bell,
  Check,
  ChevronRight,
  Info,
  LogOut,
  Building,
  CreditCard,
  Printer
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { TrustlineStore, generateUUID, generateInvestmentRef } from '../store';
import { User, ClientProfile, KYCDocuments, Investment, InvestmentProduct, DailyInterestAccrual, WithdrawalRequest, InvestmentCertificate } from '../types';

interface ClientPortalProps {
  currentDate: string;
  onStateChange: () => void;
  key?: string;
}

export default function ClientPortal({ currentDate, onStateChange }: ClientPortalProps) {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [clientProfile, setClientProfile] = useState<ClientProfile | null>(null);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAccountType, setRegAccountType] = useState<'Individual' | 'Corporate' | 'Joint'>('Individual');
  const [regBvn, setRegBvn] = useState('');
  const [regNin, setRegNin] = useState('');
  const [loginError, setLoginError] = useState('');

  // Loaded state
  const [companySetting, setCompanySetting] = useState<any>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [accruals, setAccruals] = useState<DailyInterestAccrual[]>([]);
  
  // UI Tabs & Modals
  const [activeTab, setActiveTab] = useState<'dashboard' | 'investments' | 'invest' | 'kyc' | 'withdrawals'>('dashboard');
  const [selectedInvestment, setSelectedInvestment] = useState<Investment | null>(null);
  const [showCertificate, setShowCertificate] = useState<InvestmentCertificate | null>(null);
  const [showStatement, setShowStatement] = useState(false);
  
  // Investment booking inputs
  const [selectedProductId, setSelectedProductId] = useState('');
  const [bookingAmount, setBookingAmount] = useState<number>(100000);
  const [bookingError, setBookingError] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState('');

  // Withdrawal / Liquidation request inputs
  const [liquidationType, setLiquidationType] = useState<'withdraw' | 'part_liquidate' | 'full_liquidate'>('withdraw');
  const [liquidationAmount, setLiquidationAmount] = useState<number>(0);
  const [liquidationReason, setLiquidationReason] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [liqError, setLiqError] = useState('');
  const [liqSuccess, setLiqSuccess] = useState('');

  // KYC Completion inputs
  const [kycAccountType, setKycAccountType] = useState<'Individual' | 'Corporate' | 'Joint'>('Individual');
  const [kycDob, setKycDob] = useState('');
  const [kycAddress, setKycAddress] = useState('');
  const [kycCity, setKycCity] = useState('');
  const [kycState, setKycState] = useState('');
  const [kycOccupation, setKycOccupation] = useState('');
  const [kycEmployer, setKycEmployer] = useState('');
  const [kycIncome, setKycIncome] = useState<number>(0);
  const [kycFunds, setKycFunds] = useState('Salary');
  const [kycFiles, setKycFiles] = useState<{ [key: string]: string }>({});
  const [kycSuccessMsg, setKycSuccessMsg] = useState('');

  // Beneficiary details
  const [beneficiaryName, setBeneficiaryName] = useState('');
  const [beneficiaryRelationship, setBeneficiaryRelationship] = useState('');
  const [beneficiaryPhone, setBeneficiaryPhone] = useState('');

  // Load state on mount
  useEffect(() => {
    // Attempt auto-login with default client for ease of testing
    const dbState = TrustlineStore.loadState();
    const defaultClient = dbState.users.find(u => u.email === 'client@example.com');
    if (defaultClient) {
      handleLoginDirect(defaultClient);
    }
  }, []);

  // Update lists when state changes or user changes
  const reloadData = () => {
    const dbState = TrustlineStore.loadState();
    setCompanySetting(dbState.companySetting);
    if (currentUser) {
      const profile = dbState.clientProfiles.find(p => p.user_id === currentUser.id);
      if (profile) {
        setClientProfile(profile);
        const userInvs = dbState.investments.filter(i => i.client_id === profile.id);
        setInvestments(userInvs);
        
        const userWithdrawals = dbState.withdrawals.filter(w => w.client_id === profile.id);
        setWithdrawals(userWithdrawals);

        const invIds = userInvs.map(i => i.id);
        const userAccruals = dbState.accruals.filter(a => invIds.includes(a.investment_id));
        setAccruals(userAccruals);
      }
      setProducts(dbState.products.filter(p => p.is_active));
    }
  };

  useEffect(() => {
    reloadData();
  }, [currentUser, currentDate]);

  // Handle direct login for speed
  const handleLoginDirect = (user: User) => {
    setCurrentUser(user);
    const dbState = TrustlineStore.loadState();
    const profile = dbState.clientProfiles.find(p => p.user_id === user.id);
    if (profile) {
      setClientProfile(profile);
      // Populate fields
      setKycDob(profile.date_of_birth || '');
      setKycAccountType(profile.account_type || 'Individual');
      setKycAddress(profile.address || '');
      setKycCity(profile.city || '');
      setKycState(profile.state || '');
      setKycOccupation(profile.occupation || '');
      setKycEmployer(profile.employer || '');
      setKycIncome(profile.annual_income || 0);
      setKycFunds(profile.source_of_funds || 'Salary');
      setBeneficiaryName(profile.beneficiary_name || '');
      setBeneficiaryRelationship(profile.beneficiary_relationship || '');
      setBeneficiaryPhone(profile.beneficiary_phone || '');
    }
    setLoginError('');
  };

  // Form logins
  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const dbState = TrustlineStore.loadState();
    const foundUser = dbState.users.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password_hash === passwordInput);
    
    if (foundUser) {
      if (!foundUser.is_client) {
        setLoginError('Error: This is a client portal. Please log in with client credentials.');
        return;
      }
      if (!foundUser.is_active) {
        setLoginError('This account is deactivated. Contact back office.');
        return;
      }
      handleLoginDirect(foundUser);
    } else {
      setLoginError('Invalid email or password.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !passwordInput || !regFirstName || !regLastName || !regPhone || !regBvn || !regNin) {
      setLoginError('Please fill out all fields.');
      return;
    }

    const dbState = TrustlineStore.loadState();
    const exists = dbState.users.some(u => u.email.toLowerCase() === emailInput.toLowerCase());
    if (exists) {
      setLoginError('Email is already registered.');
      return;
    }

    const newUserId = `user-${generateUUID()}`;
    const newUserProfileId = `profile-${generateUUID()}`;

    const newUser: User = {
      id: newUserId,
      email: emailInput.toLowerCase(),
      password_hash: passwordInput,
      first_name: regFirstName,
      last_name: regLastName,
      phone: regPhone,
      is_active: true,
      is_client: true,
      is_backoffice_user: false,
      is_superadmin: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const newProfile: ClientProfile = {
      id: newUserProfileId,
      user_id: newUserId,
      account_type: regAccountType,
      bvn: regBvn,
      nin: regNin,
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
    TrustlineStore.addAuditLog(newUserId, newUser.email, 'client', 'CLIENT_REGISTER', 'users', newUserId, null, newUser);

    handleLoginDirect(newUser);
    setIsRegisterMode(false);
    onStateChange();
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setClientProfile(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Submit KYC completed form
  const handleKycSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientProfile) return;

    const dbState = TrustlineStore.loadState();
    const updatedProfiles = dbState.clientProfiles.map(p => {
      if (p.id === clientProfile.id) {
        return {
          ...p,
          account_type: kycAccountType,
          date_of_birth: kycDob,
          address: kycAddress,
          city: kycCity,
          state: kycState,
          occupation: kycOccupation,
          employer: kycEmployer,
          annual_income: Number(kycIncome),
          source_of_funds: kycFunds,
          beneficiary_name: beneficiaryName,
          beneficiary_relationship: beneficiaryRelationship,
          beneficiary_phone: beneficiaryPhone,
          kyc_documents: {
            ...p.kyc_documents,
            ...kycFiles
          },
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    TrustlineStore.saveState({
      ...dbState,
      clientProfiles: updatedProfiles
    });

    // Write audit log
    TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'client', 'SUBMIT_KYC', 'client_profiles', clientProfile.id);

    setKycSuccessMsg('KYC information and documents successfully saved! Awaiting Back Office verification.');
    reloadData();
    onStateChange();
    setTimeout(() => setKycSuccessMsg(''), 5000);
  };

  // Select a mockup KYC file
  const handleFileSelect = (fieldKey: string, fileName: string) => {
    setKycFiles(prev => ({
      ...prev,
      [fieldKey]: '#',
      [`${fieldKey}_name`]: fileName
    }));
  };

  // Invest in a product
  const handleBookInvestment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !clientProfile) return;
    if (clientProfile.kyc_status !== 'verified') {
      setBookingError('Unable to invest. Your KYC status is not verified yet. Please submit your profile details and wait for Back Office validation.');
      return;
    }

    const prod = products.find(p => p.id === selectedProductId);
    if (!prod) {
      setBookingError('Please select an active investment product.');
      return;
    }

    if (bookingAmount < prod.minimum_investment) {
      setBookingError(`Minimum investment amount for this product is ₦/USD ${prod.minimum_investment.toLocaleString()}`);
      return;
    }

    if (prod.maximum_investment && bookingAmount > prod.maximum_investment) {
      setBookingError(`Maximum investment limit for this product is ₦/USD ${prod.maximum_investment.toLocaleString()}`);
      return;
    }

    const dbState = TrustlineStore.loadState();
    const tenure = prod.tenure_days;
    const rate = prod.annual_rate;
    
    // Dates calculation
    const start = new Date(currentDate);
    const maturity = new Date(currentDate);
    maturity.setDate(maturity.getDate() + tenure);

    const expectedInterest = bookingAmount * (rate / 100) * (tenure / 365);
    const expectedReturn = bookingAmount + expectedInterest;

    const ref = generateInvestmentRef(start.getFullYear());
    const newInvestment: Investment = {
      id: `inv-${generateUUID()}`,
      client_id: clientProfile.id,
      product_id: prod.id,
      investment_reference: ref,
      principal_amount: bookingAmount,
      currency: prod.currency,
      exchange_rate_used: prod.currency === 'USD' ? prod.exchange_rate_to_ngn : undefined,
      amount_in_ngn: prod.currency === 'USD' ? bookingAmount * (prod.exchange_rate_to_ngn || 1520) : bookingAmount,
      annual_rate: rate,
      start_date: start.toISOString().split('T')[0],
      maturity_date: maturity.toISOString().split('T')[0],
      tenure_days: tenure,
      status: 'active',
      daily_interest_accrued: 0,
      total_interest_accrued: 0,
      total_expected_interest: expectedInterest,
      expected_return_amount: expectedReturn,
      current_value: bookingAmount,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Auto-generate certificate
    const newCert: InvestmentCertificate = {
      id: `cert-${generateUUID()}`,
      investment_id: newInvestment.id,
      certificate_number: `TRL-CERT-${ref}`,
      issue_date: currentDate,
      client_name: `${currentUser.first_name} ${currentUser.last_name}`,
      principal_amount: bookingAmount,
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

    // Write audit log
    TrustlineStore.addAuditLog(currentUser.id, currentUser.email, 'client', 'BOOK_INVESTMENT', 'investments', newInvestment.id, null, newInvestment);

    setBookingSuccess(`Investment booked successfully! Reference: ${ref}. Certificate generated.`);
    setBookingAmount(prod.minimum_investment);
    setSelectedProductId('');
    reloadData();
    onStateChange();
    setTimeout(() => setBookingSuccess(''), 6000);
  };

  // Early penalty calculation on fly
  const getPenaltyAmount = (inv: Investment): number => {
    const start = new Date(inv.start_date);
    const now = new Date(currentDate);
    const daysHeld = Math.max(0, Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
    
    if (daysHeld >= inv.tenure_days) return 0;

    // Load active penalty rules for the type
    const dbState = TrustlineStore.loadState();
    const prod = dbState.products.find(p => p.id === inv.product_id);
    if (!prod) return 0;

    const matchedRule = dbState.penaltyRules.find(r => 
      r.product_type === prod.product_type && 
      daysHeld >= r.min_tenure_days && 
      daysHeld <= r.max_tenure_days &&
      r.is_active
    );

    if (matchedRule) {
      return inv.principal_amount * (matchedRule.penalty_percentage / 100);
    }
    return 0; // default no penalty if no rule matches
  };

  // Handle requesting early liquidation or standard withdrawal
  const handleLiquidationRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestment || !clientProfile || !currentUser) return;

    const penalty = getPenaltyAmount(selectedInvestment);
    const isEarly = new Date(currentDate) < new Date(selectedInvestment.maturity_date);

    if (liquidationType === 'part_liquidate' && liquidationAmount <= 0) {
      setLiqError('Please specify a positive amount to partially liquidate.');
      return;
    }

    if (liquidationType === 'part_liquidate' && liquidationAmount >= selectedInvestment.principal_amount) {
      setLiqError('Partial liquidation amount must be strictly less than your active principal.');
      return;
    }

    if (!bankName || !accountNumber || !accountName) {
      setLiqError('Please fill out your payout bank details.');
      return;
    }

    const dbState = TrustlineStore.loadState();

    const newRequest: WithdrawalRequest = {
      id: `req-${generateUUID()}`,
      investment_id: selectedInvestment.id,
      client_id: clientProfile.id,
      request_type: liquidationType,
      amount: liquidationType === 'withdraw' || liquidationType === 'full_liquidate' ? selectedInvestment.current_value : liquidationAmount,
      remaining_balance: liquidationType === 'part_liquidate' ? selectedInvestment.current_value - liquidationAmount : 0,
      interest_earned: selectedInvestment.total_interest_accrued,
      penalty_amount: isEarly ? penalty : 0,
      penalty_reason: isEarly ? `Early liquidation penalty (${isEarly ? 'Before tenure complete' : ''})` : undefined,
      status: 'pending',
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName,
      remarks: liquidationReason || `${liquidationType} request`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    TrustlineStore.saveState({
      ...dbState,
      withdrawals: [newRequest, ...dbState.withdrawals]
    });

    // Write audit log
    TrustlineStore.addAuditLog(currentUser.id, currentUser.email, 'client', 'REQUEST_WITHDRAWAL', 'withdrawal_requests', newRequest.id);

    setLiqSuccess('Request submitted successfully! Back Office will review and approve shortly.');
    setLiquidationReason('');
    setBankName('');
    setAccountNumber('');
    setAccountName('');
    reloadData();
    onStateChange();
    setTimeout(() => {
      setLiqSuccess('');
      setSelectedInvestment(null);
    }, 4000);
  };

  // Calculations for total portfolio value, etc.
  const totalInNgn = investments.reduce((acc, inv) => {
    if (inv.status !== 'active' && inv.status !== 'matured') return acc;
    return acc + inv.amount_in_ngn;
  }, 0);

  const totalUSD = investments.reduce((acc, inv) => {
    if (inv.status !== 'active' && inv.status !== 'matured') return acc;
    if (inv.currency !== 'USD') return acc;
    return acc + inv.principal_amount;
  }, 0);

  const totalInterestEarnedNgn = investments.reduce((acc, inv) => {
    const val = inv.total_interest_accrued;
    if (inv.currency === 'USD') {
      return acc + (val * (inv.exchange_rate_used || 1520));
    }
    return acc + val;
  }, 0);

  // Generate chart data representing the historic accrued interest
  // Map individual accrual days
  const chartData = accruals
    .slice(0, 15) // take latest 15 accrual items
    .reverse()
    .map((acc) => {
      const parentInv = investments.find(i => i.id === acc.investment_id);
      const isUSD = parentInv?.currency === 'USD';
      const value = isUSD ? acc.daily_interest_amount * (parentInv?.exchange_rate_used || 1520) : acc.daily_interest_amount;
      return {
        date: acc.accrual_date,
        Interest: Math.round(value),
        Reference: parentInv?.investment_reference || 'Ref'
      };
    });

  // Fallback if no chart data
  const finalChartData = chartData.length > 0 ? chartData : [
    { date: 'June 25', Interest: 0 },
    { date: 'June 26', Interest: 1500 },
    { date: 'June 27', Interest: 3200 },
    { date: 'June 28', Interest: 4600 },
    { date: 'June 29', Interest: 7100 },
    { date: 'June 30', Interest: totalInterestEarnedNgn > 0 ? Math.round(totalInterestEarnedNgn) : 9500 }
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      {/* Client Portal Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            {companySetting?.company_logo_url ? (
              <img
                src={companySetting.company_logo_url}
                alt="Logo"
                className="max-h-11 max-w-[150px] object-contain rounded-lg shadow-xs"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="bg-blue-600 text-white font-bold p-2.5 rounded-lg text-lg flex items-center justify-center shadow-xs">
                TR
              </div>
            )}
            <div>
              <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-1.5">
                {companySetting?.company_name || 'Trustline'} Client Portal 
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-semibold border border-slate-200">
                  client.trustlinecapital.com
                </span>
              </h1>
              <p className="text-xs text-slate-500">Wealth creation & secure investments</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <div className="flex items-center gap-1.5 justify-end">
                  <span className={`h-1.5 w-1.5 rounded-full ${
                    clientProfile?.kyc_status === 'verified' ? 'bg-green-500' : 'bg-yellow-500'
                  }`} />
                  <span className="text-[10px] capitalize text-slate-500 font-medium">
                    KYC: {clientProfile?.kyc_status || 'Pending'}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-lg font-medium transition cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          ) : (
            <span className="text-xs text-slate-400 font-medium">Awaiting authentication</span>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {!currentUser ? (
          /* Login/Register Panel */
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
                  <span className="inline-block bg-blue-50 text-blue-600 rounded-full p-3 mb-2">
                    <UserIcon className="w-6 h-6" />
                  </span>
                )}
                <h2 className="text-xl font-bold text-slate-900">
                  {isRegisterMode ? `Create your ${companySetting?.company_name || 'Trustline'} Account` : `Welcome to ${companySetting?.company_name || 'Trustline'}`}
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Access your client portfolio dashboard & book investments
                </p>
              </div>

              {loginError && (
                <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={isRegisterMode ? handleRegister : handleFormLogin} className="space-y-4">
                {isRegisterMode && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                        value={regFirstName}
                        onChange={(e) => setRegFirstName(e.target.value)}
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                        value={regLastName}
                        onChange={(e) => setRegLastName(e.target.value)}
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="client@example.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                {isRegisterMode && (
                  <>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-2">Account Type *</label>
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {(['Individual', 'Corporate', 'Joint'] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setRegAccountType(type)}
                            className={`py-2 px-3 text-xs font-semibold rounded-lg border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                              regAccountType === type
                                ? 'bg-[#c5a059]/10 border-[#c5a059] text-[#c5a059]'
                                : 'bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <span className="text-sm">
                              {type === 'Individual' && '👤'}
                              {type === 'Corporate' && '🏢'}
                              {type === 'Joint' && '👥'}
                            </span>
                            <span>{type}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                      <input
                        type="text"
                        required
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+234 80..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">BVN (11 Digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          pattern="\d{11}"
                          title="BVN must be 11 digits"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                          value={regBvn}
                          onChange={(e) => setRegBvn(e.target.value.replace(/\D/g, ''))}
                          placeholder="22233344455"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">NIN (11 Digits) *</label>
                        <input
                          type="text"
                          required
                          maxLength={11}
                          pattern="\d{11}"
                          title="NIN must be 11 digits"
                          className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                          value={regNin}
                          onChange={(e) => setRegNin(e.target.value.replace(/\D/g, ''))}
                          placeholder="11122233344"
                        />
                      </div>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg text-sm shadow-sm transition mt-6 cursor-pointer"
                >
                  {isRegisterMode ? 'Register Account' : 'Sign In'}
                </button>
              </form>

              <div className="mt-6 border-t border-slate-200 pt-4 text-center">
                <button
                  onClick={() => {
                    setIsRegisterMode(!isRegisterMode);
                    setLoginError('');
                  }}
                  className="text-xs text-blue-600 hover:underline font-medium"
                >
                  {isRegisterMode ? 'Already have an account? Sign In' : "Don't have an account? Register here"}
                </button>
              </div>

              {/* Instant Developer Quick Sign-In */}
              {!isRegisterMode && (
                <div className="mt-8 bg-slate-50 rounded-lg p-3.5 border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Simulated Testing Sign-In:</h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        const db = TrustlineStore.loadState();
                        const client1 = db.users.find(u => u.email === 'client@example.com');
                        if (client1) handleLoginDirect(client1);
                      }}
                      className="w-full text-left text-xs bg-white hover:bg-blue-50 hover:border-blue-300 transition border border-slate-200 rounded px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold block text-slate-800">John Doe (Verified KYC)</span>
                        <span className="text-[10px] text-slate-500">client@example.com / client123</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>

                    <button
                      onClick={() => {
                        const db = TrustlineStore.loadState();
                        const client2 = db.users.find(u => u.email === 'jane.smith@example.com');
                        if (client2) handleLoginDirect(client2);
                      }}
                      className="w-full text-left text-xs bg-white hover:bg-blue-50 hover:border-blue-300 transition border border-slate-200 rounded px-3 py-2 flex items-center justify-between"
                    >
                      <div>
                        <span className="font-semibold block text-slate-800">Jane Smith (Unverified KYC)</span>
                        <span className="text-[10px] text-slate-500">jane.smith@example.com / jane123</span>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Client Portal View */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Controls */}
            <div className="lg:col-span-1 bg-white rounded-xl border border-slate-200 shadow-xs p-4 h-fit">
              <div className="text-center pb-4 mb-4 border-b border-slate-200">
                <div className="w-12 h-12 bg-blue-100 text-blue-700 font-bold text-lg rounded-full flex items-center justify-center mx-auto mb-2">
                  {currentUser.first_name[0]}{currentUser.last_name[0]}
                </div>
                <h3 className="font-bold text-slate-900 truncate">
                  {currentUser.first_name} {currentUser.last_name}
                </h3>
                <p className="text-xs text-slate-500 font-mono truncate">{currentUser.email}</p>
              </div>

              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="w-4.5 h-4.5" />
                  Dashboard
                </button>

                <button
                  onClick={() => setActiveTab('investments')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'investments' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Briefcase className="w-4.5 h-4.5" />
                  My Portfolio ({investments.length})
                </button>

                <button
                  onClick={() => setActiveTab('invest')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'invest' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <TrendingUp className="w-4.5 h-4.5" />
                  Explore Products
                </button>

                <button
                  onClick={() => setActiveTab('kyc')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'kyc' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <UserIcon className="w-4.5 h-4.5" />
                  KYC & Profile Profile
                </button>

                <button
                  onClick={() => setActiveTab('withdrawals')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition ${
                    activeTab === 'withdrawals' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <ArrowDownLeft className="w-4.5 h-4.5" />
                  Withdrawals ({withdrawals.length})
                </button>
              </nav>

              {/* Mini Info banner */}
              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-3 text-[11px] text-amber-800 flex gap-1.5">
                <Info className="w-4.5 h-4.5 text-amber-600 shrink-0" />
                <div>
                  <span className="font-semibold block mb-0.5">KYC Requirement</span>
                  You must verify your KYC documents to book new investments. Current: <strong className="capitalize">{clientProfile?.kyc_status}</strong>.
                </div>
              </div>
            </div>

            {/* Portal Workspace */}
            <div className="lg:col-span-3 space-y-6">
              {/* Active Tab View */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  {/* Status Banner for Pending KYC */}
                  {clientProfile?.kyc_status === 'pending' && (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="font-bold block">KYC Verification Outstanding</span>
                          <span className="text-xs">Your account has pending verification. Complete your profile info and upload ID documents to unlock investment booking.</span>
                        </div>
                      </div>
                      <button
                        onClick={() => setActiveTab('kyc')}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shrink-0 transition"
                      >
                        Complete KYC Now
                      </button>
                    </div>
                  )}

                  {/* Portfolio Metrics */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Portfolio Balance</span>
                        <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                          ₦{totalInNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        {totalUSD > 0 && (
                          <span className="text-xs text-slate-500 font-mono block mt-0.5">
                            (${totalUSD.toLocaleString(undefined, { minimumFractionDigits: 2 })} USD embedded)
                          </span>
                        )}
                      </div>
                      <div className="bg-blue-50 text-blue-600 p-3 rounded-lg">
                        <Briefcase className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Accrued Yields (To Date)</span>
                        <span className="text-2xl font-extrabold text-emerald-600 font-mono mt-1 block">
                          ₦{totalInterestEarnedNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">Updated live at {currentDate}</span>
                      </div>
                      <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg">
                        <TrendingUp className="w-6 h-6" />
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Active Accounts</span>
                        <span className="text-2xl font-extrabold text-slate-900 font-mono mt-1 block">
                          {investments.filter(i => i.status === 'active').length}
                        </span>
                        <span className="text-xs text-slate-400 block mt-0.5">Total registered: {investments.length}</span>
                      </div>
                      <div className="bg-slate-50 text-slate-600 p-3 rounded-lg">
                        <Layers className="w-6 h-6" />
                      </div>
                    </div>
                  </div>

                  {/* Portfolio Performance Graph */}
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h3 className="font-bold text-slate-900">Yield Earnings Flow</h3>
                        <p className="text-xs text-slate-500">Daily accrued interest payouts mapped to timeline (NGN equivalent)</p>
                      </div>
                      <button
                        onClick={() => setShowStatement(true)}
                        className="flex items-center gap-1.5 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-medium transition"
                      >
                        <FileText className="w-4 h-4" />
                        Statements & Statements
                      </button>
                    </div>

                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={finalChartData}>
                          <defs>
                            <linearGradient id="colorInterest" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                              <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                          <XAxis dataKey="date" stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} />
                          <Tooltip />
                          <Area type="monotone" dataKey="Interest" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorInterest)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Overview Quick Actions & Latest Investments */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                      <h3 className="font-bold text-slate-900 mb-3.5">Key Portfolio Actions</h3>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setActiveTab('invest')}
                          className="flex flex-col items-center justify-center p-4 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 text-blue-700 transition font-medium gap-1.5 text-center"
                        >
                          <TrendingUp className="w-6 h-6 text-blue-600" />
                          <span className="text-xs">Invest Now</span>
                        </button>

                        <button
                          onClick={() => setActiveTab('kyc')}
                          className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 text-slate-700 transition font-medium gap-1.5 text-center"
                        >
                          <UserIcon className="w-6 h-6 text-slate-500" />
                          <span className="text-xs">Update Profile</span>
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
                      <h3 className="font-bold text-slate-900 mb-3.5">Recent Notifications</h3>
                      <div className="space-y-3">
                        <div className="flex gap-2.5 text-xs text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                          <div>
                            <span className="font-semibold text-slate-800">System Accrual Completed</span>
                            <p className="text-slate-500 text-[11px] mt-0.5">Interest yield of ₦{totalInterestEarnedNgn > 0 ? (totalInterestEarnedNgn/15).toFixed(2) : '342.47'} accrued automatically as of {currentDate}.</p>
                          </div>
                        </div>

                        <div className="flex gap-2.5 text-xs text-slate-600">
                          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-1.5" />
                          <div>
                            <span className="font-semibold text-slate-800">Welcome to Trustline Capital</span>
                            <p className="text-slate-500 text-[11px] mt-0.5">Your portal registration is successful. Explore premium high yield funds inside.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Explore & Book Products */}
              {activeTab === 'invest' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-lg">Active Investment Products</h2>
                    <p className="text-xs text-slate-500">Select any premium fund to calculate expected yield and place investment booking requests.</p>
                  </div>

                  {bookingSuccess && (
                    <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-200 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span>{bookingSuccess}</span>
                    </div>
                  )}

                  {bookingError && (
                    <div className="bg-red-50 text-red-700 text-sm p-4 rounded-xl border border-red-200 flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((prod) => (
                      <div
                        key={prod.id}
                        className={`bg-white border rounded-xl p-5 shadow-xs transition duration-200 hover:border-blue-500 flex flex-col justify-between ${
                          selectedProductId === prod.id ? 'border-blue-600 ring-1 ring-blue-500' : 'border-slate-200'
                        }`}
                      >
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-bold uppercase tracking-wider">
                              {prod.product_type}
                            </span>
                            <span className="text-xl font-black font-mono text-blue-600">
                              {prod.annual_rate}% <span className="text-xs text-slate-400 font-medium">p.a.</span>
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-base mt-3">{prod.product_name}</h3>
                          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{prod.description}</p>

                          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-3.5 mt-4 text-xs">
                            <div>
                              <span className="text-slate-400 block">Min Investment</span>
                              <strong className="text-slate-700 font-semibold font-mono">
                                {prod.currency === 'USD' ? '$' : '₦'}{prod.minimum_investment.toLocaleString()}
                              </strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block">Tenure Period</span>
                              <strong className="text-slate-700 font-semibold">{prod.tenure_days} Days</strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-5 pt-3 border-t border-slate-100 flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedProductId(prod.id);
                              setBookingAmount(prod.minimum_investment);
                              setBookingError('');
                            }}
                            className={`w-full py-2 px-3 rounded-lg font-medium text-xs transition cursor-pointer ${
                              selectedProductId === prod.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            }`}
                          >
                            {selectedProductId === prod.id ? 'Selected' : 'Configure Investment'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Configure booking form */}
                  {selectedProductId && (
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs animate-fade-in">
                      <h3 className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4">
                        Review Booking: {products.find(p => p.id === selectedProductId)?.product_name}
                      </h3>

                      <form onSubmit={handleBookInvestment} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Principal Amount ({products.find(p => p.id === selectedProductId)?.currency}) *
                            </label>
                            <input
                              type="number"
                              required
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono transition"
                              value={bookingAmount}
                              onChange={(e) => setBookingAmount(Number(e.target.value))}
                              min={products.find(p => p.id === selectedProductId)?.minimum_investment || 0}
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Annual Interest Rate</label>
                            <span className="w-full bg-slate-100 border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-600 font-mono block">
                              {products.find(p => p.id === selectedProductId)?.annual_rate}% Per Annum
                            </span>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1">Estimated Interest yield</label>
                            <span className="w-full bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2 text-sm text-emerald-700 font-mono font-bold block">
                              {products.find(p => p.id === selectedProductId)?.currency === 'USD' ? '$' : '₦'}
                              {Math.round(
                                bookingAmount * 
                                ((products.find(p => p.id === selectedProductId)?.annual_rate || 0) / 100) * 
                                ((products.find(p => p.id === selectedProductId)?.tenure_days || 180) / 365)
                              ).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="bg-slate-50 rounded-lg p-3 text-xs text-slate-600 leading-relaxed">
                          <span className="font-semibold block mb-0.5">Value Summary:</span>
                          This investment of {products.find(p => p.id === selectedProductId)?.currency === 'USD' ? '$' : '₦'}{bookingAmount.toLocaleString()} will matures on <strong>{new Date(new Date(currentDate).setDate(new Date(currentDate).getDate() + (products.find(p => p.id === selectedProductId)?.tenure_days || 180))).toISOString().split('T')[0]}</strong> (in {products.find(p => p.id === selectedProductId)?.tenure_days} days).
                        </div>

                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setSelectedProductId('')}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2 rounded-lg shadow-xs cursor-pointer"
                          >
                            Confirm Book & Generate Certificate
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* My Investments portfolio list */}
              {activeTab === 'investments' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">My Investment Accounts</h2>
                      <p className="text-xs text-slate-500">Below is a list of all active, matured, or liquidated holdings.</p>
                    </div>
                    <button
                      onClick={() => setActiveTab('invest')}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                    >
                      + Book New Account
                    </button>
                  </div>

                  {investments.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                      <Briefcase className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-semibold">No investments registered under this profile.</p>
                      <p className="text-xs text-slate-400 mt-1">Once you book an investment or the manager books for you, it will display here.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {investments.map((inv) => {
                        const productRef = products.find(p => p.id === inv.product_id);
                        return (
                          <div key={inv.id} className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col justify-between">
                            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                              <div>
                                <span className="font-mono text-[11px] font-bold text-slate-700">{inv.investment_reference}</span>
                                <h4 className="font-semibold text-slate-900 text-xs mt-0.5">{productRef?.product_name || 'Trustline Fund'}</h4>
                              </div>
                              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                                inv.status === 'active' ? 'bg-green-50 text-green-700 border-green-200' :
                                inv.status === 'matured' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                'bg-slate-100 text-slate-500 border-slate-200'
                              }`}>
                                {inv.status}
                              </span>
                            </div>

                            <div className="p-4 space-y-3.5 text-xs">
                              <div className="grid grid-cols-2 gap-3 font-mono">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Principal invested</span>
                                  <strong className="text-slate-800 text-sm font-semibold">
                                    {inv.currency === 'USD' ? '$' : '₦'}{inv.principal_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </strong>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Accrued Yield</span>
                                  <strong className="text-emerald-600 text-sm font-bold">
                                    +{inv.currency === 'USD' ? '$' : '₦'}{inv.total_interest_accrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </strong>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 text-[11px]">
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Start Date</span>
                                  <span className="text-slate-600 font-medium">{inv.start_date}</span>
                                </div>
                                <div>
                                  <span className="text-slate-400 block text-[10px]">Maturity Date</span>
                                  <span className="text-slate-600 font-medium">{inv.maturity_date}</span>
                                </div>
                              </div>

                              <div className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 flex justify-between items-center text-[11px]">
                                <span className="text-slate-500">Current Value:</span>
                                <strong className="text-slate-900 font-mono font-bold">
                                  {inv.currency === 'USD' ? '$' : '₦'}{inv.current_value.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                </strong>
                              </div>
                            </div>

                            <div className="px-4 py-3 bg-slate-50 border-t border-slate-100 flex gap-2 justify-end">
                              <button
                                onClick={() => {
                                  const dbState = TrustlineStore.loadState();
                                  const cert = dbState.certificates.find(c => c.investment_id === inv.id);
                                  if (cert) {
                                    setShowCertificate(cert);
                                  } else {
                                    alert('Certificate not found.');
                                  }
                                }}
                                className="flex items-center gap-1 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-[10px] px-2.5 py-1.5 rounded border border-slate-200 transition cursor-pointer"
                              >
                                <Download className="w-3.5 h-3.5" />
                                Certificate
                              </button>

                              {inv.status !== 'liquidated' && inv.status !== 'withdrawn' && (
                                <div className="flex gap-1.5">
                                  <button
                                    onClick={() => {
                                      setSelectedInvestment(inv);
                                      setLiquidationType('part_liquidate');
                                      setLiquidationAmount(Math.round(inv.current_value / 2));
                                      setLiqError('');
                                      setLiqSuccess('');
                                    }}
                                    className="bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 font-semibold text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer"
                                  >
                                    Partial Liquidation
                                  </button>
                                  <button
                                    onClick={() => {
                                      setSelectedInvestment(inv);
                                      const isMatured = new Date(currentDate) >= new Date(inv.maturity_date);
                                      setLiquidationType(isMatured ? 'withdraw' : 'full_liquidate');
                                      setLiquidationAmount(Math.round(inv.current_value));
                                      setLiqError('');
                                      setLiqSuccess('');
                                    }}
                                    className={`${
                                      new Date(currentDate) >= new Date(inv.maturity_date)
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-rose-600 hover:bg-rose-700 text-white'
                                    } font-semibold text-[10px] px-2.5 py-1.5 rounded transition cursor-pointer`}
                                  >
                                    {new Date(currentDate) >= new Date(inv.maturity_date) ? 'Withdraw Investment' : 'Full Liquidation'}
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Complete KYC Tab */}
              {activeTab === 'kyc' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-slate-900 text-lg">KYC Profile & Verification Desk</h2>
                      <p className="text-xs text-slate-500">Verify your identities to participate in higher value mutual funds.</p>
                    </div>
                    <span className={`text-xs font-bold uppercase px-3 py-1.5 rounded-full border ${
                      clientProfile?.kyc_status === 'verified' ? 'bg-green-50 text-green-700 border-green-200' :
                      clientProfile?.kyc_status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                      Status: {clientProfile?.kyc_status || 'Pending'}
                    </span>
                  </div>

                  {kycSuccessMsg && (
                    <div className="bg-green-50 text-green-700 text-sm p-4 rounded-xl border border-green-200 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 shrink-0" />
                      <span>{kycSuccessMsg}</span>
                    </div>
                  )}

                  <form onSubmit={handleKycSubmit} className="bg-white rounded-xl border border-slate-200 shadow-xs p-6 space-y-6">
                    {/* Part 1: Personal Details */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4">1. Personal & Contact Specifications</h3>
                      <div className="mb-5">
                        <label className="block text-xs font-semibold text-slate-700 mb-2">Account Ownership Type *</label>
                        <div className="grid grid-cols-3 gap-3">
                          {(['Individual', 'Corporate', 'Joint'] as const).map((type) => (
                            <button
                              key={type}
                              type="button"
                              onClick={() => setKycAccountType(type)}
                              className={`py-2.5 px-4 text-xs font-semibold rounded-lg border text-center transition cursor-pointer flex items-center justify-center gap-2 ${
                                kycAccountType === type
                                  ? 'bg-[#c5a059]/10 border-[#c5a059] text-[#c5a059] ring-1 ring-[#c5a059]'
                                  : 'bg-transparent border-slate-300 text-slate-700 hover:bg-slate-100'
                              }`}
                            >
                              <span className="text-sm">
                                {type === 'Individual' && '👤'}
                                {type === 'Corporate' && '🏢'}
                                {type === 'Joint' && '👥'}
                              </span>
                              <span>{type} Account</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                          <input
                            type="date"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={kycDob}
                            onChange={(e) => setKycDob(e.target.value)}
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Street Address *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={kycAddress}
                            onChange={(e) => setKycAddress(e.target.value)}
                            placeholder="Plot 5, Admiralty Way"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">City & State *</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              required
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                              value={kycCity}
                              onChange={(e) => setKycCity(e.target.value)}
                              placeholder="Lekki"
                            />
                            <input
                              type="text"
                              required
                              className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                              value={kycState}
                              onChange={(e) => setKycState(e.target.value)}
                              placeholder="Lagos"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Part 2: Employment & Income info */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4">2. Professional & Source of Funds</h3>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Occupation *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={kycOccupation}
                            onChange={(e) => setKycOccupation(e.target.value)}
                            placeholder="Manager"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Employer / Company Name *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={kycEmployer}
                            onChange={(e) => setKycEmployer(e.target.value)}
                            placeholder="Tech Corp"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Annual Income (NGN) *</label>
                          <input
                            type="number"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono transition"
                            value={kycIncome}
                            onChange={(e) => setKycIncome(Number(e.target.value))}
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Primary Source of Funds *</label>
                          <select
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={kycFunds}
                            onChange={(e) => setKycFunds(e.target.value)}
                          >
                            <option value="Salary">Employment Salary</option>
                            <option value="Business Profits">Business Profits</option>
                            <option value="Inheritance">Inheritance & Gift</option>
                            <option value="Investments">Investments Dividends</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Part 3: Beneficiary Info */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-4">3. Next of Kin / Beneficiary Specification</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Full Name of Beneficiary *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={beneficiaryName}
                            onChange={(e) => setBeneficiaryName(e.target.value)}
                            placeholder="Mary Doe"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Relationship *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={beneficiaryRelationship}
                            onChange={(e) => setBeneficiaryRelationship(e.target.value)}
                            placeholder="Spouse"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold text-slate-700 mb-1">Beneficiary Phone Number *</label>
                          <input
                            type="text"
                            required
                            className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                            value={beneficiaryPhone}
                            onChange={(e) => setBeneficiaryPhone(e.target.value)}
                            placeholder="+234..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Part 4: KYC Files Upload (Click and Select simulated) */}
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2 mb-3">4. Document Proof Attachments (Click to Upload)</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                          { label: 'Passport Photo', field: 'passport', fileDefault: 'passport_photo.png' },
                          { label: 'Government ID', field: 'id', fileDefault: 'national_id_card.pdf' },
                          { label: 'Utility Bill (Address proof)', field: 'utility', fileDefault: 'electric_bill_june.pdf' },
                          { label: '3-Months Bank Statement', field: 'bank_statement', fileDefault: 'bank_statement_3months.pdf' }
                        ].map((file) => {
                          const isAttached = kycFiles[`${file.field}_name`] || clientProfile?.kyc_documents?.[`${file.field}_name` as keyof KYCDocuments];
                          return (
                            <div key={file.field} className="border border-dashed border-slate-300 rounded-lg p-3 text-center bg-slate-50">
                              <span className="block text-[11px] font-bold text-slate-700 mb-1.5">{file.label}</span>
                              <div className="flex flex-col items-center justify-center p-2">
                                <Upload className={`w-6 h-6 mb-1 ${isAttached ? 'text-green-500' : 'text-slate-400'}`} />
                                {isAttached ? (
                                  <span className="text-[10px] text-green-700 font-mono truncate max-w-[120px] block font-semibold">
                                    ✓ {isAttached}
                                  </span>
                                ) : (
                                  <span className="text-[10px] text-slate-400">Not uploaded</span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => handleFileSelect(file.field, file.fileDefault)}
                                className="mt-2 text-[10px] bg-white hover:bg-slate-100 text-blue-600 font-semibold px-2 py-1 rounded border border-slate-200 shadow-2xs transition w-full cursor-pointer"
                              >
                                {isAttached ? 'Replace File' : 'Attach File'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-4 flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-5 py-2.5 rounded-lg shadow-sm cursor-pointer"
                      >
                        Submit KYC Profile Update
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Withdrawals Listing Tab */}
              {activeTab === 'withdrawals' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-lg">My Withdrawal & Early Payout Requests</h2>
                    <p className="text-xs text-slate-500">Track all ongoing or completed withdrawal audits here.</p>
                  </div>

                  {withdrawals.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                      <ArrowDownLeft className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="font-semibold">No withdrawal audits placed yet.</p>
                      <p className="text-xs text-slate-400 mt-1">When you liquidate or request withdrawal on an investment, you can view the approval pipeline here.</p>
                    </div>
                  ) : (
                    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                            <tr>
                              <th className="p-4">Requested Date</th>
                              <th className="p-4">Type</th>
                              <th className="p-4">Requested Payout</th>
                              <th className="p-4">Accrued penalty</th>
                              <th className="p-4">Receiving Bank</th>
                              <th className="p-4 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium">
                            {withdrawals.map((req) => {
                              const investmentRef = investments.find(i => i.id === req.investment_id);
                              return (
                                <tr key={req.id}>
                                  <td className="p-4 font-mono text-slate-600">{req.created_at.split('T')[0]}</td>
                                  <td className="p-4 capitalize text-slate-700 font-semibold">{req.request_type.replace('_', ' ')}</td>
                                  <td className="p-4 font-mono text-slate-900 font-bold">
                                    {investmentRef?.currency === 'USD' ? '$' : '₦'}{req.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </td>
                                  <td className="p-4 font-mono text-red-600 font-semibold">
                                    {req.penalty_amount > 0 ? `-${investmentRef?.currency === 'USD' ? '$' : '₦'}${req.penalty_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}` : '—'}
                                  </td>
                                  <td className="p-4 text-slate-500 truncate max-w-[150px]" title={`${req.bank_name} - ${req.account_number}`}>
                                    {req.bank_name}
                                    <span className="block text-[10px] text-slate-400">{req.account_number}</span>
                                  </td>
                                  <td className="p-4 text-center">
                                    <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border ${
                                      req.status === 'approved' || req.status === 'completed' ? 'bg-green-50 text-green-700 border-green-200' :
                                      req.status === 'pending' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                      'bg-red-50 text-red-700 border-red-200'
                                    }`}>
                                      {req.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: Withdrawal / Early Liquidation Setup */}
      {selectedInvestment && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-lg w-full overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Payout/Liquidation Settlement Wizard</h3>
                <span className="text-[10px] text-slate-500">Ref: {selectedInvestment.investment_reference}</span>
              </div>
              <button
                onClick={() => setSelectedInvestment(null)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleLiquidationRequest} className="p-5 space-y-4">
              {liqError && (
                <div className="bg-red-50 text-red-700 text-xs p-3 rounded border border-red-200">
                  {liqError}
                </div>
              )}

              {liqSuccess && (
                <div className="bg-green-50 text-green-700 text-xs p-3 rounded border border-green-200">
                  {liqSuccess}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block">Principal amount:</span>
                  <strong className="text-slate-800 font-mono text-sm">
                    {selectedInvestment.currency === 'USD' ? '$' : '₦'}{selectedInvestment.principal_amount.toLocaleString()}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block">Interest earned to date:</span>
                  <strong className="text-emerald-600 font-mono text-sm">
                    +{selectedInvestment.currency === 'USD' ? '$' : '₦'}{selectedInvestment.total_interest_accrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Request Action *</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { type: 'withdraw', label: 'Withdraw full matured', desc: 'No penalty' },
                    { type: 'part_liquidate', label: 'Partial liquidation', desc: 'Saves balance' },
                    { type: 'full_liquidate', label: 'Full early payout', desc: 'Applies penalty' }
                  ].map((x) => (
                    <button
                      key={x.type}
                      type="button"
                      onClick={() => {
                        setLiquidationType(x.type as any);
                        setLiquidationAmount(x.type === 'part_liquidate' ? Math.round(selectedInvestment.current_value / 2) : Math.round(selectedInvestment.current_value));
                      }}
                      className={`p-2.5 rounded-lg border text-left flex flex-col justify-between transition cursor-pointer ${
                        liquidationType === x.type
                          ? 'border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-[11px] font-bold text-slate-800 block leading-tight">{x.label}</span>
                      <span className="text-[9px] text-slate-400 mt-1 block">{x.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {liquidationType === 'part_liquidate' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Amount to Payout ({selectedInvestment.currency}) *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 font-mono transition"
                    value={liquidationAmount}
                    onChange={(e) => setLiquidationAmount(Number(e.target.value))}
                    max={selectedInvestment.principal_amount - 1}
                  />
                  <span className="text-[9px] text-slate-400 block mt-1">Remaining balance will continue yielding interest.</span>
                </div>
              )}

              {/* Display early penalty calculations */}
              {new Date(currentDate) < new Date(selectedInvestment.maturity_date) && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-red-800 text-[11px]">
                  <div className="flex gap-1.5 items-start">
                    <AlertTriangle className="w-4.5 h-4.5 text-red-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Early Liquidation Notice!</span>
                      This account matures on <strong>{selectedInvestment.maturity_date}</strong>. Early payouts trigger a penalty of:
                      <strong className="block text-sm font-mono text-red-700 mt-1">
                        -{selectedInvestment.currency === 'USD' ? '$' : '₦'}{getPenaltyAmount(selectedInvestment).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Destination Account info */}
              <div className="border-t border-slate-100 pt-3 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">Payout Destination Account</span>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Bank Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. GTBank"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Account Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="10 Digits"
                      maxLength={10}
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900 font-mono"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-slate-500 mb-1">Account Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-slate-900"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] text-slate-500 mb-1">Reason for liquidation / Remarks (optional)</label>
                  <input
                    type="text"
                    placeholder="Medical, business capital, etc."
                    className="w-full bg-slate-50 border border-slate-300 rounded px-2 py-1.5 text-xs"
                    value={liquidationReason}
                    onChange={(e) => setLiquidationReason(e.target.value)}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedInvestment(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg shadow-sm cursor-pointer"
                >
                  Submit Settlement request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Investment Certificate View/Download */}
      {showCertificate && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full overflow-hidden animate-fade-in my-8">
            <div className="p-4 bg-slate-100 border-b border-slate-200 flex justify-between items-center print:hidden">
              <span className="font-bold text-xs text-slate-700">Official Certificate Viewer</span>
              <div className="flex gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print / Save
                </button>
                <button
                  onClick={() => setShowCertificate(null)}
                  className="bg-slate-800 hover:bg-slate-700 text-white text-xs px-3 py-1.5 rounded font-medium transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>

            {/* Print Area: Decorative Certificate Layout */}
            <div className="p-8 sm:p-12 border-8 border-double border-amber-800 m-4 bg-amber-50/20 text-center font-serif relative printable-certificate">
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 text-amber-800 font-sans text-xl select-none">✥</div>
              <div className="absolute top-2 right-2 text-amber-800 font-sans text-xl select-none">✥</div>
              <div className="absolute bottom-2 left-2 text-amber-800 font-sans text-xl select-none">✥</div>
              <div className="absolute bottom-2 right-2 text-amber-800 font-sans text-xl select-none">✥</div>

              {/* Dynamic Logo and Branding */}
              <div className="flex flex-col items-center gap-2 mb-4">
                {companySetting?.company_logo_url ? (
                  <img
                    src={companySetting.company_logo_url}
                    alt="Corporate Logo"
                    className="max-h-16 max-w-[200px] object-contain print:max-h-16"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="h-12 w-12 bg-[#c5a059] rounded-sm flex items-center justify-center text-black font-extrabold text-xl shadow-md select-none">
                    T
                  </div>
                )}
                <div className="text-amber-900 tracking-widest text-xs font-sans font-bold uppercase">
                  {companySetting?.company_name || 'Trustline Capital Limited'}
                </div>
              </div>
              
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-800 italic tracking-wide">
                Certificate of Investment
              </h2>
              
              <div className="w-24 h-0.5 bg-amber-800 mx-auto my-4" />

              <p className="text-xs text-slate-500 font-sans mb-6">
                Certificate Number: <span className="font-mono font-bold text-slate-700">{showCertificate.certificate_number}</span>
              </p>

              <p className="text-slate-600 text-sm leading-relaxed max-w-md mx-auto italic mb-8">
                This document certifies that <strong className="text-slate-900 not-italic font-bold font-sans text-base block my-1">{showCertificate.client_name}</strong> has successfully booked a secured yield investment under Trustline Capital asset portfolio management.
              </p>

              {/* Core Parameters Table */}
              <div className="max-w-md mx-auto bg-white border border-amber-800/20 rounded-lg p-5 text-left text-xs font-sans space-y-3 shadow-xs">
                <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Principal Investment:</span>
                  <strong className="text-slate-800 font-mono text-right text-sm">
                    ₦{showCertificate.principal_amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Guaranteed Yield Rate:</span>
                  <strong className="text-slate-800 font-mono text-right text-sm">
                    {showCertificate.interest_rate}% Per Annum
                  </strong>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Fixed Tenure Period:</span>
                  <strong className="text-slate-800 text-right">{showCertificate.tenure_days} Days</strong>
                </div>

                <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Maturity Date:</span>
                  <strong className="text-slate-800 text-right font-mono">{showCertificate.maturity_date}</strong>
                </div>

                <div className="grid grid-cols-2">
                  <span className="text-slate-400 font-semibold text-emerald-700">Expected Payout:</span>
                  <strong className="text-emerald-700 font-mono text-right text-sm font-bold">
                    ₦{showCertificate.expected_return.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              {/* Signatures & Seal */}
              <div className="mt-12 grid grid-cols-2 gap-6 max-w-md mx-auto items-end font-sans">
                <div className="text-center">
                  <div className="border-b border-slate-400 h-8 font-serif italic text-xs text-slate-500 pt-3">
                    Fidelis Emus
                  </div>
                  <span className="text-[9px] text-slate-400 block mt-1 uppercase font-semibold">Super Admin Director</span>
                </div>

                <div className="text-center flex flex-col items-center">
                  {/* Decorative stamp seal */}
                  <div className="w-12 h-12 rounded-full border-2 border-dashed border-amber-800 text-amber-800 flex items-center justify-center font-bold text-[9px] uppercase tracking-tighter leading-none p-1.5 transform rotate-12 mb-1">
                    Trustline Approved
                  </div>
                  <span className="text-[9px] text-slate-400 block uppercase font-semibold">Official Asset Seal</span>
                </div>
              </div>

              <div className="text-[9px] text-slate-400 font-sans mt-12 pt-4 border-t border-slate-200/50">
                Issued date: {showCertificate.issue_date} • {companySetting?.registration_number ? `Reg RC: ${companySetting.registration_number}` : 'Reg RC: 1234567'} • Subject to early liquidation penalties under official product schedule rules.
                {companySetting?.company_address && (
                  <div className="mt-1 text-[8px] text-slate-400/75 font-sans">
                    {companySetting.company_address} • Phone: {companySetting.company_phone} • Email: {companySetting.company_email}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Statement Generator */}
      {showStatement && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-xl w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <span className="font-bold text-slate-800 text-sm">Statement of Account (Simulated PDF)</span>
              <button onClick={() => setShowStatement(false)} className="text-slate-400 hover:text-slate-600 text-lg">×</button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Trustline Capital Statement</h3>
                  <p className="text-xs text-slate-500">Asset Holdings & Daily Yields Log</p>
                </div>
                <div className="text-right text-xs">
                  <span className="text-slate-400 block">Statement Date</span>
                  <span className="font-semibold text-slate-800">{currentDate}</span>
                </div>
              </div>

              <div className="border-y border-slate-200 py-3 text-xs grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-400 block">Account Owner</span>
                  <strong className="text-slate-800 font-bold">{currentUser.first_name} {currentUser.last_name}</strong>
                  <span className="block text-slate-500 font-mono">{currentUser.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Cumulative Portfolio Value</span>
                  <strong className="text-slate-800 font-mono font-bold text-sm">
                    ₦{totalInNgn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </strong>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-800 block mb-2">Detailed Holdings Log</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {investments.map(inv => (
                    <div key={inv.id} className="border border-slate-100 p-2.5 rounded bg-slate-50 text-xs flex justify-between items-center">
                      <div>
                        <strong className="font-mono text-slate-800">{inv.investment_reference}</strong>
                        <span className="block text-[10px] text-slate-500">Yield rate: {inv.annual_rate}% • Matures: {inv.maturity_date}</span>
                      </div>
                      <div className="text-right font-mono font-bold">
                        <span className="block text-slate-800">Principal: {inv.currency === 'USD' ? '$' : '₦'}{inv.principal_amount.toLocaleString()}</span>
                        <span className="text-emerald-600 text-[10px]">Accrued: +{inv.currency === 'USD' ? '$' : '₦'}{inv.total_interest_accrued.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-50 rounded p-2.5 text-[10px] text-slate-500 leading-normal">
                This report represents a live real-time simulation of active client assets held inside Trustline Capital systems. You can print this layout using your browser (Ctrl + P) for an official physical copy.
              </div>

              <div className="flex justify-end gap-2 text-xs font-semibold">
                <button
                  onClick={() => window.print()}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg cursor-pointer"
                >
                  Print Report
                </button>
                <button
                  onClick={() => setShowStatement(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-lg cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
