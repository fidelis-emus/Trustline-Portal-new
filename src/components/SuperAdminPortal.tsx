/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Layers,
  Users,
  Settings,
  ShieldCheck,
  TrendingUp,
  FileCheck,
  AlertTriangle,
  LogOut,
  Database,
  Plus,
  RefreshCw,
  Edit,
  Trash2,
  Trash,
  HelpCircle,
  Clock,
  Briefcase,
  Sliders,
  DollarSign,
  Search,
  Filter,
  Check,
  Building,
  Upload,
  Download,
  Calendar,
  ChevronRight
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { TrustlineStore, generateUUID } from '../store';
import {
  User,
  InvestmentProduct,
  PenaltyRule,
  ExchangeRate,
  CompanySetting,
  AuditLog,
  ClientProfile,
  Investment,
  ProductType
} from '../types';

interface SuperAdminPortalProps {
  currentDate: string;
  onStateChange: () => void;
  key?: string;
}

export default function SuperAdminPortal({ currentDate, onStateChange }: SuperAdminPortalProps) {
  // Authentication & Session
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  // Loaded State
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [products, setProducts] = useState<InvestmentProduct[]>([]);
  const [penaltyRules, setPenaltyRules] = useState<PenaltyRule[]>([]);
  const [exchangeRate, setExchangeRate] = useState<ExchangeRate | null>(null);
  const [companySetting, setCompanySetting] = useState<CompanySetting | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);

  // Navigation
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'products' | 'penalties' | 'rates' | 'settings' | 'backup' | 'logs'>('dashboard');
  
  // Filtering & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [logFilterAction, setLogFilterAction] = useState('');

  // Creation/Edit Modals Inputs
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // User Edit Modals
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Product Creation/Edit Inputs
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<InvestmentProduct | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodType, setProdType] = useState<ProductType>('Fixed Income');
  const [prodCurrency, setProdCurrency] = useState<'NGN' | 'USD'>('NGN');
  const [prodRate, setProdRate] = useState<number>(12);
  const [prodMin, setProdMin] = useState<number>(50000);
  const [prodMax, setProdMax] = useState<number>(50000000);
  const [prodTenure, setProdTenure] = useState<number>(180);
  const [prodDesc, setProdDesc] = useState('');
  const [prodRateToNgn, setProdRateToNgn] = useState<number>(1520);

  // Penalty Rule Inputs
  const [showPenaltyModal, setShowPenaltyModal] = useState(false);
  const [selectedPenalty, setSelectedPenalty] = useState<PenaltyRule | null>(null);
  const [penType, setPenType] = useState<ProductType>('Fixed Income');
  const [penPercent, setPenPercent] = useState<number>(5.00);
  const [penMinDays, setPenMinDays] = useState<number>(0);
  const [penMaxDays, setPenMaxDays] = useState<number>(180);

  // Exchange rate input
  const [newRateValue, setNewRateValue] = useState<number>(1520.00);

  // Company Settings Inputs
  const [compName, setCompName] = useState('');
  const [compLogo, setCompLogo] = useState('');
  const [compAddress, setCompAddress] = useState('');
  const [compPhone, setCompPhone] = useState('');
  const [compEmail, setCompEmail] = useState('');
  const [compReg, setCompReg] = useState('');
  const [compTax, setCompTax] = useState('');

  // Backup file state
  const [backupFileStr, setBackupFileStr] = useState('');

  useEffect(() => {
    // Attempt auto login with default super admin for convenience
    const dbState = TrustlineStore.loadState();
    const defaultAdmin = dbState.users.find(u => u.email === 'admin@trustlinecapital.com');
    if (defaultAdmin) {
      handleLoginDirect(defaultAdmin);
    }
  }, []);

  const handleLoginDirect = (user: User) => {
    setCurrentUser(user);
    setLoginError('');
  };

  const reloadData = () => {
    const dbState = TrustlineStore.loadState();
    setUsers(dbState.users);
    setClients(dbState.clientProfiles);
    setProducts(dbState.products);
    setPenaltyRules(dbState.penaltyRules);
    setExchangeRate(dbState.exchangeRate);
    setCompanySetting(dbState.companySetting);
    setAuditLogs(dbState.auditLogs);
    setInvestments(dbState.investments);

    // prefill inputs
    if (dbState.companySetting) {
      setCompName(dbState.companySetting.company_name);
      setCompLogo(dbState.companySetting.company_logo_url);
      setCompAddress(dbState.companySetting.company_address);
      setCompPhone(dbState.companySetting.company_phone);
      setCompEmail(dbState.companySetting.company_email);
      setCompReg(dbState.companySetting.registration_number);
      setCompTax(dbState.companySetting.tax_id);
    }
    if (dbState.exchangeRate) {
      setNewRateValue(dbState.exchangeRate.rate);
    }
  };

  useEffect(() => {
    reloadData();
  }, [currentUser, currentDate]);

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const dbState = TrustlineStore.loadState();
    const foundUser = dbState.users.find(u => u.email.toLowerCase() === emailInput.toLowerCase() && u.password_hash === passwordInput);
    
    if (foundUser) {
      if (!foundUser.is_superadmin) {
        setLoginError('Error: This is the Super Admin portal. Please log in with admin credentials.');
        return;
      }
      handleLoginDirect(foundUser);
    } else {
      setLoginError('Invalid super admin credentials.');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setEmailInput('');
    setPasswordInput('');
  };

  // Reset a user's password directly
  const handleResetPassword = (targetUser: User) => {
    const dbState = TrustlineStore.loadState();
    const defaultPassword = 'Reset99#'; // default secure password
    
    const updatedUsers = dbState.users.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          password_hash: defaultPassword,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    TrustlineStore.saveState({
      ...dbState,
      users: updatedUsers
    });

    // Write audit log
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'superadmin',
      'RESET_PASSWORD',
      'users',
      targetUser.id,
      undefined,
      { status: 'Password reset completed by admin', password_default: defaultPassword }
    );

    setSuccessMsg(`Successfully reset password for ${targetUser.email} to default: "${defaultPassword}"`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 5000);
  };

  // Toggle user state
  const handleToggleUserActive = (targetUser: User) => {
    const dbState = TrustlineStore.loadState();
    
    const updatedUsers = dbState.users.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          is_active: !u.is_active,
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    TrustlineStore.saveState({
      ...dbState,
      users: updatedUsers
    });

    // Log audit
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'superadmin',
      targetUser.is_active ? 'DEACTIVATE_USER' : 'ACTIVATE_USER',
      'users',
      targetUser.id
    );

    setSuccessMsg(`Successfully updated user status for ${targetUser.email}`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Update a user role
  const handleUpdateRole = (targetUser: User, role: 'client' | 'backoffice' | 'superadmin') => {
    const dbState = TrustlineStore.loadState();

    const updatedUsers = dbState.users.map(u => {
      if (u.id === targetUser.id) {
        return {
          ...u,
          is_client: role === 'client',
          is_backoffice_user: role === 'backoffice',
          is_superadmin: role === 'superadmin',
          updated_at: new Date().toISOString()
        };
      }
      return u;
    });

    TrustlineStore.saveState({
      ...dbState,
      users: updatedUsers
    });

    // Log audit
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'superadmin',
      'CHANGE_USER_ROLE',
      'users',
      targetUser.id,
      { old_role: targetUser.is_superadmin ? 'superadmin' : targetUser.is_backoffice_user ? 'backoffice' : 'client' },
      { new_role: role }
    );

    setSuccessMsg(`Successfully changed role for ${targetUser.email} to ${role}`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Create or Update investment products
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodType || prodRate <= 0 || prodMin <= 0 || prodTenure <= 0) {
      setErrorMsg('Please supply valid product details.');
      return;
    }

    const dbState = TrustlineStore.loadState();

    if (selectedProduct) {
      // Edit mode
      const updatedProducts = dbState.products.map(p => {
        if (p.id === selectedProduct.id) {
          return {
            ...p,
            product_name: prodName,
            product_type: prodType,
            currency: prodCurrency,
            annual_rate: Number(prodRate),
            minimum_investment: Number(prodMin),
            maximum_investment: Number(prodMax),
            tenure_days: Number(prodTenure),
            description: prodDesc,
            exchange_rate_to_ngn: prodCurrency === 'USD' ? Number(prodRateToNgn) : undefined,
            updated_at: new Date().toISOString()
          };
        }
        return p;
      });

      TrustlineStore.saveState({
        ...dbState,
        products: updatedProducts
      });

      TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'superadmin', 'EDIT_PRODUCT', 'investment_products', selectedProduct.id);
      setSuccessMsg('Investment product updated successfully.');
    } else {
      // Create mode
      const newProduct: InvestmentProduct = {
        id: `prod-${generateUUID()}`,
        product_name: prodName,
        product_type: prodType,
        currency: prodCurrency,
        annual_rate: Number(prodRate),
        minimum_investment: Number(prodMin),
        maximum_investment: Number(prodMax),
        tenure_days: Number(prodTenure),
        is_active: true,
        description: prodDesc,
        exchange_rate_to_ngn: prodCurrency === 'USD' ? Number(prodRateToNgn) : undefined,
        created_by: currentUser!.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      TrustlineStore.saveState({
        ...dbState,
        products: [newProduct, ...dbState.products]
      });

      TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'superadmin', 'CREATE_PRODUCT', 'investment_products', newProduct.id, null, newProduct);
      setSuccessMsg('New investment product published successfully!');
    }

    setShowProductModal(false);
    setSelectedProduct(null);
    setProdName('');
    setProdDesc('');
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Toggle product state
  const handleToggleProductActive = (prod: InvestmentProduct) => {
    const dbState = TrustlineStore.loadState();
    const updatedProducts = dbState.products.map(p => {
      if (p.id === prod.id) {
        return {
          ...p,
          is_active: !p.is_active,
          updated_at: new Date().toISOString()
        };
      }
      return p;
    });

    TrustlineStore.saveState({
      ...dbState,
      products: updatedProducts
    });

    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'superadmin',
      prod.is_active ? 'DEACTIVATE_PRODUCT' : 'ACTIVATE_PRODUCT',
      'investment_products',
      prod.id
    );

    setSuccessMsg(`Successfully toggled active state for ${prod.product_name}`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 3000);
  };

  // Configure Penalty Rules
  const handlePenaltySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const dbState = TrustlineStore.loadState();

    if (selectedPenalty) {
      // Edit
      const updatedRules = dbState.penaltyRules.map(r => {
        if (r.id === selectedPenalty.id) {
          return {
            ...r,
            product_type: penType,
            penalty_percentage: Number(penPercent),
            min_tenure_days: Number(penMinDays),
            max_tenure_days: Number(penMaxDays),
            updated_at: new Date().toISOString()
          };
        }
        return r;
      });

      TrustlineStore.saveState({
        ...dbState,
        penaltyRules: updatedRules
      });
      setSuccessMsg('Penalty rule parameters saved.');
    } else {
      // Create
      const newRule: PenaltyRule = {
        id: `rule-${generateUUID()}`,
        product_type: penType,
        penalty_percentage: Number(penPercent),
        min_tenure_days: Number(penMinDays),
        max_tenure_days: Number(penMaxDays),
        is_active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      TrustlineStore.saveState({
        ...dbState,
        penaltyRules: [newRule, ...dbState.penaltyRules]
      });
      setSuccessMsg('New penalty rule published successfully!');
    }

    setShowPenaltyModal(false);
    setSelectedPenalty(null);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Exchange rate update
  const handleUpdateExchangeRate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRateValue <= 0) return;

    const dbState = TrustlineStore.loadState();
    const nextRate: ExchangeRate = {
      id: `rate-${generateUUID()}`,
      from_currency: 'USD',
      to_currency: 'NGN',
      rate: Number(newRateValue),
      effective_date: currentDate,
      created_by: currentUser!.id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Update product exchange rates to match
    const updatedProducts = dbState.products.map(p => {
      if (p.currency === 'USD') {
        return {
          ...p,
          exchange_rate_to_ngn: Number(newRateValue)
        };
      }
      return p;
    });

    TrustlineStore.saveState({
      ...dbState,
      exchangeRate: nextRate,
      products: updatedProducts
    });

    // Audit log
    TrustlineStore.addAuditLog(
      currentUser!.id,
      currentUser!.email,
      'superadmin',
      'SET_EXCHANGE_RATE',
      'exchange_rates',
      nextRate.id,
      { old_rate: exchangeRate?.rate },
      { new_rate: newRateValue }
    );

    setSuccessMsg(`USD daily exchange rate set to ₦${newRateValue} NGN successfully.`);
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Company Settings submit
  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!compName || !compEmail || !compPhone || !compAddress) return;

    const dbState = TrustlineStore.loadState();
    const nextSettings: CompanySetting = {
      id: companySetting?.id || `company-${generateUUID()}`,
      company_name: compName,
      company_logo_url: compLogo,
      company_address: compAddress,
      company_phone: compPhone,
      company_email: compEmail,
      registration_number: compReg,
      tax_id: compTax,
      created_at: companySetting?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    TrustlineStore.saveState({
      ...dbState,
      companySetting: nextSettings
    });

    // Audit
    TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'superadmin', 'UPDATE_COMPANY_SETTINGS', 'company_settings');

    setSuccessMsg('Company settings metadata successfully updated.');
    reloadData();
    onStateChange();
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // BACKUP EXPORT & RESTORE REAL ACTION
  const handleExportBackup = () => {
    const dbState = TrustlineStore.loadState();
    const jsonStr = JSON.stringify(dbState, null, 2);
    
    // Create custom download tag
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `trustline_database_backup_${currentDate.replace(/-/g, '')}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'superadmin', 'CREATE_BACKUP', 'system_backup');
    setSuccessMsg('Local PostgreSQL representation successfully dumped & downloaded as JSON!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  // Restore validation and write to local storage
  const handleImportBackup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!backupFileStr) {
      setErrorMsg('Please paste the backup JSON content.');
      return;
    }

    try {
      const parsed = JSON.parse(backupFileStr);
      
      // Basic schema validations
      if (!parsed.users || !parsed.clientProfiles || !parsed.products || !parsed.investments) {
        throw new Error('Invalid JSON format. Missing key PostgreSQL representations.');
      }

      TrustlineStore.saveState(parsed);
      TrustlineStore.addAuditLog(currentUser!.id, currentUser!.email, 'superadmin', 'RESTORE_BACKUP', 'system_backup');
      
      setSuccessMsg('Database restored successfully from backup payload! Reloading...');
      setBackupFileStr('');
      setErrorMsg('');
      reloadData();
      onStateChange();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      setErrorMsg(`Failed to restore backup: ${err.message || 'Malformed JSON syntax'}`);
    }
  };

  // Export audit logs as simple text list
  const handleExportAuditCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Date,User,Type,Action,Table,IP,Agent\n";
    
    auditLogs.forEach((log) => {
      const row = [
        log.created_at,
        log.user_email || 'System',
        log.user_type,
        log.action,
        log.table_name || 'N/A',
        log.ip_address,
        `"${log.user_agent.replace(/"/g, '""')}"`
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `trustline_audit_logs_${currentDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculations for Admin Dashboard Analytics
  const totalVolumeNgn = investments.reduce((acc, inv) => acc + inv.amount_in_ngn, 0);
  const activeVolumeNgn = investments.reduce((acc, inv) => acc + (inv.status === 'active' ? inv.amount_in_ngn : 0), 0);
  
  // Categorize products by type for charts
  const productTypeMap: { [key: string]: number } = {};
  investments.forEach((inv) => {
    const prod = products.find(p => p.id === inv.product_id);
    const type = prod?.product_type || 'Mutual Fund';
    productTypeMap[type] = (productTypeMap[type] || 0) + inv.amount_in_ngn;
  });

  const chartCategoryData = Object.keys(productTypeMap).map((key) => ({
    name: key,
    Value: Math.round(productTypeMap[key])
  }));

  const COLORS = ['#2563EB', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  // Filter audit logs
  const filteredLogs = auditLogs.filter((log) => {
    const searchMatch = !searchQuery || (log.user_email && log.user_email.toLowerCase().includes(searchQuery.toLowerCase())) || log.action.includes(searchQuery.toUpperCase());
    const actionMatch = !logFilterAction || log.user_type === logFilterAction;
    return searchMatch && actionMatch;
  });

  // Filter users
  const filteredUsers = users.filter((u) => {
    const userStr = `${u.first_name} ${u.last_name} ${u.email} ${u.phone}`.toLowerCase();
    return userStr.includes(searchQuery.toLowerCase());
  });

  return (
    <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
      {/* Super Admin Header */}
      <header className="bg-blue-950 text-white border-b border-blue-900 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 text-white font-extrabold p-2.5 rounded-lg text-sm">
              SA
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight flex items-center gap-2">
                Super Admin Console
                <span className="text-[10px] bg-blue-900 text-blue-300 px-2 py-0.5 rounded-full font-semibold border border-blue-800">
                  admin.trustlinecapital.com
                </span>
              </h1>
              <p className="text-[11px] text-blue-200/70">Database migration, penalty triggers, products CRUD & user roles</p>
            </div>
          </div>

          {currentUser ? (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-100">
                  {currentUser.first_name} {currentUser.last_name}
                </p>
                <span className="text-[10px] text-emerald-400 font-mono font-bold flex items-center gap-1 justify-end">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Role: Super Admin
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs bg-blue-900 hover:bg-blue-800 text-blue-100 px-3 py-1.5 rounded-lg border border-blue-800 transition cursor-pointer font-semibold"
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
          /* Admin Login form */
          <div className="max-w-md mx-auto my-12 bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <div className="p-6 sm:p-8">
              <div className="text-center mb-6">
                <span className="inline-block bg-blue-50 text-blue-700 rounded-full p-3 mb-2">
                  <ShieldCheck className="w-6 h-6" />
                </span>
                <h2 className="text-lg font-bold text-slate-900">Secure Core Access</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Authenticate directory to access product schemas & user directories
                </p>
              </div>

              {loginError && (
                <div className="mb-4 bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
                  {loginError}
                </div>
              )}

              <form onSubmit={handleFormLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Director Email Address</label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="admin@trustlinecapital.com"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Root Security PIN</label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm text-slate-900 focus:outline-hidden focus:border-blue-500 transition"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-2 px-4 rounded-lg text-xs shadow transition mt-6 cursor-pointer"
                >
                  Confirm Root Authentication
                </button>
              </form>

              {/* Quick Admin sign-in */}
              <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-3">
                <span className="text-[11px] font-bold text-slate-600 block mb-1.5 font-sans">Developer Access:</span>
                <button
                  onClick={() => {
                    const db = TrustlineStore.loadState();
                    const admin = db.users.find(u => u.email === 'admin@trustlinecapital.com');
                    if (admin) handleLoginDirect(admin);
                  }}
                  className="w-full text-left text-xs bg-white hover:bg-blue-50 border border-slate-200 rounded px-2.5 py-1.5 flex justify-between items-center transition"
                >
                  <div>
                    <strong className="block text-slate-800 text-[11px]">Fidelis Emus (Super Admin)</strong>
                    <span className="text-[10px] text-slate-500 font-mono">admin@trustlinecapital.com / admin123</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Admin Board Dashboard Layout */
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar Navigation */}
            <div className="lg:col-span-1 bg-white border border-slate-200 rounded-xl shadow-xs p-4 h-fit">
              <nav className="space-y-1">
                {[
                  { id: 'dashboard', label: 'SA Dashboard', icon: Layers },
                  { id: 'users', label: 'User Directory', icon: Users },
                  { id: 'products', label: 'Product Blueprints (CRUD)', icon: Sliders },
                  { id: 'penalties', label: 'Early Penalty Triggers', icon: AlertTriangle },
                  { id: 'rates', label: 'Daily USD Exchange Rate', icon: DollarSign },
                  { id: 'settings', label: 'Company Metadata Settings', icon: Settings },
                  { id: 'backup', label: 'Database Backup & Restore', icon: Database },
                  { id: 'logs', label: 'Security Audit logs', icon: Clock }
                ].map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setActiveTab(tab.id as any);
                        setSuccessMsg('');
                        setErrorMsg('');
                        setSearchQuery('');
                      }}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold transition ${
                        activeTab === tab.id ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Core Workspaces content */}
            <div className="lg:col-span-3 space-y-6">
              {successMsg && (
                <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-xl text-xs flex items-center gap-2">
                  <Check className="w-5 h-5 shrink-0" />
                  <span>{successMsg}</span>
                </div>
              )}

              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Workspace 1: Super Admin Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Director Dashboard Analytics</h2>
                    <p className="text-xs text-slate-500">System metrics, pool breakdowns, and automated accrual stats.</p>
                  </div>

                  {/* Core KPI cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Total Portfolio volume</span>
                      <strong className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                        ₦{totalVolumeNgn.toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Booked Portfolio</span>
                      <strong className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                        ₦{activeVolumeNgn.toLocaleString()}
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Active Customers</span>
                      <strong className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                        {users.filter(u => u.is_client).length} Accounts
                      </strong>
                    </div>

                    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">System products CRUD</span>
                      <strong className="text-lg font-bold font-mono text-slate-900 mt-1 block">
                        {products.length} Products
                      </strong>
                    </div>
                  </div>

                  {/* Charts */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-3">Portfolio Volume by Type</h3>
                      <div className="h-64">
                        {chartCategoryData.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">No active assets booked.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartCategoryData}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                              <XAxis dataKey="name" fontSize={10} stroke="#94A3B8" />
                              <YAxis fontSize={10} stroke="#94A3B8" />
                              <Tooltip />
                              <Bar dataKey="Value" fill="#2563EB" radius={[4, 4, 0, 0]} />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                      <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wide mb-3">Product Proportions</h3>
                      <div className="h-64">
                        {chartCategoryData.length === 0 ? (
                          <div className="h-full flex items-center justify-center text-xs text-slate-400">No products mapped yet.</div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={chartCategoryData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={4}
                                dataKey="Value"
                              >
                                {chartCategoryData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                              <Legend wrapperStyle={{ fontSize: '10px' }} />
                            </PieChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Workspace 2: User Directory & Role Swapping */}
              {activeTab === 'users' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Users Directory & Role Configurations</h2>
                    <p className="text-xs text-slate-500">Deactivate accounts, swap authorization roles, or reset defaults.</p>
                  </div>

                  {/* Search */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-xs focus:outline-hidden focus:border-blue-500 transition"
                      placeholder="Search users by name, email, etc."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {/* Users Table */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                          <tr>
                            <th className="p-4">User Details</th>
                            <th className="p-4">Phone Number</th>
                            <th className="p-4">Assigned Role</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                          {filteredUsers.map((u) => (
                            <tr key={u.id} className="hover:bg-slate-50/50">
                              <td className="p-4">
                                <span className="font-bold block text-slate-900">{u.first_name} {u.last_name}</span>
                                <span className="text-[10px] text-slate-500 font-mono">{u.email}</span>
                              </td>
                              <td className="p-4 font-mono">{u.phone}</td>
                              <td className="p-4">
                                <select
                                  className="bg-slate-100 border border-slate-200 rounded px-2 py-1 text-[11px] font-semibold text-slate-700"
                                  value={u.is_superadmin ? 'superadmin' : u.is_backoffice_user ? 'backoffice' : 'client'}
                                  onChange={(e) => handleUpdateRole(u, e.target.value as any)}
                                >
                                  <option value="client">Client Portal</option>
                                  <option value="backoffice">Back Office Operations</option>
                                  <option value="superadmin">Super Admin Director</option>
                                </select>
                              </td>
                              <td className="p-4">
                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                                  u.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                  {u.is_active ? 'Active' : 'Deactivated'}
                                </span>
                              </td>
                              <td className="p-4 text-right space-x-1.5">
                                <button
                                  onClick={() => handleResetPassword(u)}
                                  className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1.5 rounded transition font-semibold cursor-pointer"
                                  title="Reset password to Default Reset99#"
                                >
                                  Reset Pass
                                </button>
                                <button
                                  onClick={() => handleToggleUserActive(u)}
                                  className={`text-[10px] font-semibold px-2 py-1.5 rounded transition cursor-pointer ${
                                    u.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                                  }`}
                                >
                                  {u.is_active ? 'Deactivate' : 'Activate'}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Workspace 3: Products CRUD */}
              {activeTab === 'products' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Investment Product Blueprints</h2>
                      <p className="text-xs text-slate-500">Add, edit, or toggle access limits for system-wide investments.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(null);
                        setProdName('');
                        setProdDesc('');
                        setProdRate(12);
                        setProdMin(50000);
                        setProdMax(50000000);
                        setProdTenure(180);
                        setProdCurrency('NGN');
                        setShowProductModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Product Blueprint
                    </button>
                  </div>

                  {/* Products Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {products.map((p) => (
                      <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase tracking-wider">
                              {p.product_type}
                            </span>
                            <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full border ${
                              p.is_active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'
                            }`}>
                              {p.is_active ? 'Active' : 'Draft'}
                            </span>
                          </div>

                          <h3 className="font-bold text-slate-900 text-sm mt-3">{p.product_name}</h3>
                          <p className="text-[11px] text-slate-400 mt-1 truncate">{p.description}</p>

                          <div className="grid grid-cols-3 gap-2 border-y border-slate-100 py-3 mt-4 text-xs font-mono">
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Yield</span>
                              <strong className="text-slate-700 font-bold">{p.annual_rate}% p.a.</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Tenure</span>
                              <strong className="text-slate-700 font-semibold">{p.tenure_days} Days</strong>
                            </div>
                            <div>
                              <span className="text-slate-400 block text-[9px] uppercase">Currency</span>
                              <strong className="text-slate-700 font-semibold">{p.currency}</strong>
                            </div>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 justify-end text-xs">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              setProdName(p.product_name);
                              setProdType(p.product_type);
                              setProdCurrency(p.currency);
                              setProdRate(p.annual_rate);
                              setProdMin(p.minimum_investment);
                              setProdMax(p.maximum_investment || 50000000);
                              setProdTenure(p.tenure_days);
                              setProdDesc(p.description);
                              setProdRateToNgn(p.exchange_rate_to_ngn || 1520);
                              setShowProductModal(true);
                            }}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-semibold flex items-center gap-1 transition cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            Edit Parameters
                          </button>
                          <button
                            onClick={() => handleToggleProductActive(p)}
                            className={`px-3 py-1.5 rounded font-semibold transition cursor-pointer ${
                              p.is_active ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {p.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Workspace 4: Penalty Configuration */}
              {activeTab === 'penalties' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Early Liquidation Penalty Rules</h2>
                      <p className="text-xs text-slate-500">Configure deductions applied when client liquidates assets before tenure ends.</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedPenalty(null);
                        setPenType('Fixed Income');
                        setPenPercent(5);
                        setPenMinDays(0);
                        setPenMaxDays(180);
                        setShowPenaltyModal(true);
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded-lg shadow-sm flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Add Penalty Trigger
                    </button>
                  </div>

                  {/* Rules list */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                        <tr>
                          <th className="p-4">Fund/Product type</th>
                          <th className="p-4">Deduction rate</th>
                          <th className="p-4">Applicable Days range</th>
                          <th className="p-4 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {penaltyRules.map((r) => (
                          <tr key={r.id}>
                            <td className="p-4 font-bold text-slate-900">{r.product_type}</td>
                            <td className="p-4 text-red-600 font-bold font-mono">-{r.penalty_percentage}% of Principal</td>
                            <td className="p-4 font-mono text-slate-500">{r.min_tenure_days} to {r.max_tenure_days} days held</td>
                            <td className="p-4 text-right">
                              <button
                                onClick={() => {
                                  setSelectedPenalty(r);
                                  setPenType(r.product_type);
                                  setPenPercent(r.penalty_percentage);
                                  setPenMinDays(r.min_tenure_days);
                                  setPenMaxDays(r.max_tenure_days);
                                  setShowPenaltyModal(true);
                                }}
                                className="text-blue-600 hover:underline font-bold mr-2 cursor-pointer"
                              >
                                Edit Parameters
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Workspace 5: USD Exchange Rates */}
              {activeTab === 'rates' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Exchange Rate Management</h2>
                    <p className="text-xs text-slate-500">Configure daily exchange rate applied to USD mutual fund conversions.</p>
                  </div>

                  <form onSubmit={handleUpdateExchangeRate} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
                    <div className="max-w-xs text-xs">
                      <label className="block font-semibold text-slate-700 mb-1">Set NGN Daily Rate per $1 USD *</label>
                      <input
                        type="number"
                        className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold"
                        value={newRateValue}
                        onChange={(e) => setNewRateValue(Number(e.target.value))}
                        step="0.01"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded shadow-sm cursor-pointer"
                    >
                      Publish Daily Exchange Rate
                    </button>
                  </form>
                </div>
              )}

              {/* Workspace 6: Company Settings */}
              {activeTab === 'settings' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">Company settings Metadata</h2>
                    <p className="text-xs text-slate-500">Manage business legal name, addresses, phone indexes, and emails printed on certificates.</p>
                  </div>

                  <form onSubmit={handleCompanySubmit} className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-xs text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Legal Company Name *</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-medium"
                          value={compName}
                          onChange={(e) => setCompName(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Corporate Logo</label>
                        <div className="flex gap-2 items-center">
                          <input
                            type="text"
                            className="flex-1 bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono text-[11px]"
                            value={compLogo}
                            onChange={(e) => setCompLogo(e.target.value)}
                            placeholder="e.g. https://domain.com/logo.png or select file below"
                          />
                          <label className="bg-[#121212] hover:bg-[#1a1a1a] text-[#c5a059] border border-white/10 hover:border-white/20 font-semibold px-3 py-2 rounded text-xs cursor-pointer transition whitespace-nowrap">
                            Browse Logo File
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = () => {
                                    if (typeof reader.result === 'string') {
                                      setCompLogo(reader.result);
                                    }
                                  };
                                  reader.readAsDataURL(file);
                                }
                              }}
                            />
                          </label>
                        </div>
                        {compLogo && (
                          <div className="mt-2 flex items-center gap-3 p-2 bg-slate-50 rounded border border-slate-100">
                            <span className="text-[10px] text-slate-400 font-semibold">Live Preview:</span>
                            <div className="bg-white p-1 rounded border border-slate-200">
                              <img src={compLogo} alt="Corporate Logo Preview" className="h-10 max-w-[150px] object-contain" referrerPolicy="no-referrer" />
                            </div>
                            <button
                              type="button"
                              onClick={() => setCompLogo('')}
                              className="text-[10px] text-red-500 hover:text-red-700 hover:underline font-bold ml-auto cursor-pointer"
                            >
                              Remove Logo
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Business Support Email *</label>
                        <input
                          type="email"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                          value={compEmail}
                          onChange={(e) => setCompEmail(e.target.value)}
                          required
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Business Phone Line *</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                          value={compPhone}
                          onChange={(e) => setCompPhone(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Headquarters Office Address *</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900"
                        value={compAddress}
                        onChange={(e) => setCompAddress(e.target.value)}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Registration RC Number</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                          value={compReg}
                          onChange={(e) => setCompReg(e.target.value)}
                        />
                      </div>

                      <div>
                        <label className="block font-semibold text-slate-700 mb-1">Corporate Tax Identifier Code</label>
                        <input
                          type="text"
                          className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                          value={compTax}
                          onChange={(e) => setCompTax(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-end">
                      <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs px-4 py-2 rounded shadow-sm cursor-pointer"
                      >
                        Save Company Metadata
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Workspace 7: Backup & Restore */}
              {activeTab === 'backup' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
                    <h2 className="font-bold text-slate-900 text-base">PostgreSQL Representation Dumps</h2>
                    <p className="text-xs text-slate-500">Export structural database schemas to JSON payload files or upload backups to restore live environments instantly.</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                    {/* Backup section */}
                    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3 flex flex-col justify-between">
                      <div>
                        <strong className="text-slate-800 text-sm block font-sans">1. Generate PostgreSQL Database Dump</strong>
                        <p className="text-slate-500 text-xs mt-1 leading-normal">
                          Exports all 12 system relational tables (Users, Profiles, Investments, Accruals, AuditLogs, SystemSettings etc.) as a consolidated structural JSON file.
                        </p>
                      </div>

                      <button
                        onClick={handleExportBackup}
                        className="w-full bg-slate-950 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        Download DB Backup file (.json)
                      </button>
                    </div>

                    {/* Restore section */}
                    <form onSubmit={handleImportBackup} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
                      <strong className="text-slate-800 text-sm block font-sans">2. Restore Database from Dump</strong>
                      <p className="text-slate-500 text-xs leading-normal">
                        Paste the raw JSON content of your downloaded trustline database backup file here to instantly populate all tables.
                      </p>

                      <textarea
                        className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono text-[10px] h-24 focus:outline-hidden"
                        placeholder='{"users": [...], "investments": [...], ...}'
                        value={backupFileStr}
                        onChange={(e) => setBackupFileStr(e.target.value)}
                      />

                      <button
                        type="submit"
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        Restore Payload Backup
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* Workspace 8: Full filterable System Audits Logs */}
              {activeTab === 'logs' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                    <div>
                      <h2 className="font-bold text-slate-900 text-base">Security Audit Trails</h2>
                      <p className="text-xs text-slate-500">Live operational trails monitoring all actor interactions across NGN/USD conversions.</p>
                    </div>
                    <button
                      onClick={handleExportAuditCSV}
                      className="bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1 cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      Export to CSV
                    </button>
                  </div>

                  {/* Filters */}
                  <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Search logs email / action</label>
                      <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5"
                        placeholder="Search..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">Actor Filter Type</label>
                      <select
                        className="w-full bg-slate-50 border border-slate-300 rounded px-2.5 py-1.5 text-slate-700"
                        value={logFilterAction}
                        onChange={(e) => setLogFilterAction(e.target.value)}
                      >
                        <option value="">All Actors</option>
                        <option value="superadmin">Super Admin Directors</option>
                        <option value="backoffice">Back Office Operations</option>
                        <option value="client">Client Portals</option>
                        <option value="system">Cron/System Tasks</option>
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={() => {
                          setSearchQuery('');
                          setLogFilterAction('');
                        }}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded font-semibold w-full cursor-pointer"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  {/* Audits table logs list */}
                  <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-[10px] font-mono">
                        <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase">
                          <tr>
                            <th className="p-3">Timestamp Date</th>
                            <th className="p-3">Email Actor</th>
                            <th className="p-3">Portal Class</th>
                            <th className="p-3">Trigger action</th>
                            <th className="p-3">Host IP</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium text-slate-600">
                          {filteredLogs.map((log) => (
                            <tr key={log.id}>
                              <td className="p-3 whitespace-nowrap">{log.created_at}</td>
                              <td className="p-3 font-semibold text-slate-800">{log.user_email || 'Celery background'}</td>
                              <td className="p-3 uppercase font-bold text-slate-500">{log.user_type}</td>
                              <td className="p-3 text-blue-700 font-bold">{log.action}</td>
                              <td className="p-3 text-slate-400">{log.ip_address}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: CREATE/EDIT PRODUCT BLUEPRINT */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-md w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedProduct ? `Edit Blueprint: ${selectedProduct.product_name}` : 'Create Asset Blueprint'}
              </h3>
              <button
                onClick={() => {
                  setShowProductModal(false);
                  setSelectedProduct(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProductSubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product/Fund Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Trustline Yield Advantage Note"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-medium"
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Type Group *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-semibold text-slate-700"
                    value={prodType}
                    onChange={(e) => setProdType(e.target.value as any)}
                  >
                    <option value="Fixed Income">Fixed Income</option>
                    <option value="Mutual Fund">Mutual Fund</option>
                    <option value="Treasury Bill">Treasury Bill</option>
                    <option value="Commercial Paper">Commercial Paper</option>
                    <option value="Discount Products">Discount Products</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Settlement Currency *</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-semibold text-slate-700"
                    value={prodCurrency}
                    onChange={(e) => setProdCurrency(e.target.value as any)}
                  >
                    <option value="NGN">NGN (₦)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Annual Rate % *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    value={prodRate}
                    onChange={(e) => setProdRate(Number(e.target.value))}
                    step="0.0001"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tenure Period (Days) *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    value={prodTenure}
                    onChange={(e) => setProdTenure(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Min Investment *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    value={prodMin}
                    onChange={(e) => setProdMin(Number(e.target.value))}
                  />
                </div>
              </div>

              {prodCurrency === 'USD' && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Target USD Exchange rate (to NGN) *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 font-mono"
                    value={prodRateToNgn}
                    onChange={(e) => setProdRateToNgn(Number(e.target.value))}
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description / Highlights *</label>
                <textarea
                  required
                  placeholder="Highlights written on explore catalogs..."
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 h-16"
                  value={prodDesc}
                  onChange={(e) => setProdDesc(e.target.value)}
                />
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setShowProductModal(false);
                    setSelectedProduct(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-xs"
                >
                  Publish Blueprint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIGURE PENALTY RULE */}
      {showPenaltyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg border border-slate-200 max-w-sm w-full overflow-hidden animate-fade-in">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
              <h3 className="font-bold text-slate-900 text-sm">
                {selectedPenalty ? 'Configure Penalty Trigger' : 'Create Penalty Schedule'}
              </h3>
              <button
                onClick={() => {
                  setShowPenaltyModal(false);
                  setSelectedPenalty(null);
                }}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePenaltySubmit} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product/Fund Class *</label>
                <select
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-semibold text-slate-700"
                  value={penType}
                  onChange={(e) => setPenType(e.target.value as any)}
                >
                  <option value="Fixed Income">Fixed Income</option>
                  <option value="Mutual Fund">Mutual Fund</option>
                  <option value="Treasury Bill">Treasury Bill</option>
                  <option value="Commercial Paper">Commercial Paper</option>
                  <option value="Discount Products">Discount Products</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deduction Penalty % *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 5.00"
                  className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono font-bold"
                  value={penPercent}
                  onChange={(e) => setPenPercent(Number(e.target.value))}
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Held Min Days *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    value={penMinDays}
                    onChange={(e) => setPenMinDays(Number(e.target.value))}
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Held Max Days *</label>
                  <input
                    type="number"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded p-2 text-slate-900 font-mono"
                    value={penMaxDays}
                    onChange={(e) => setPenMaxDays(Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 flex justify-end gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setShowPenaltyModal(false);
                    setSelectedPenalty(null);
                  }}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded shadow-xs"
                >
                  Save Penalty Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
