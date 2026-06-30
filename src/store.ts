/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  User,
  ClientProfile,
  InvestmentProduct,
  Investment,
  DailyInterestAccrual,
  InvestmentCertificate,
  WithdrawalRequest,
  AuditLog,
  PenaltyRule,
  ExchangeRate,
  SystemSetting,
  CompanySetting
} from './types';

// Helper to generate UUIDs
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Generate an investment reference like TRL-2026-001
export function generateInvestmentRef(year = 2026): string {
  const count = Math.floor(Math.random() * 900) + 100;
  return `TRL-${year}-${count}`;
}

// Initial Mock Seed Data
const defaultUsers: User[] = [
  {
    id: 'user-admin-1',
    email: 'admin@trustlinecapital.com',
    password_hash: 'admin123', // Demo login (in-memory)
    first_name: 'Fidelis',
    last_name: 'Emus',
    phone: '+234 801 111 2222',
    is_active: true,
    is_client: false,
    is_backoffice_user: false,
    is_superadmin: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'user-bo-1',
    email: 'backoffice@trustlinecapital.com',
    password_hash: 'backoffice123', // Demo login
    first_name: 'Sarah',
    last_name: 'Okonkwo',
    phone: '+234 802 333 4444',
    is_active: true,
    is_client: false,
    is_backoffice_user: true,
    is_superadmin: false,
    created_at: '2026-01-02T09:00:00Z',
    updated_at: '2026-01-02T09:00:00Z'
  },
  {
    id: 'user-client-1',
    email: 'client@example.com',
    password_hash: 'client123', // Demo login
    first_name: 'John',
    last_name: 'Doe',
    phone: '+234 803 555 6666',
    is_active: true,
    is_client: true,
    is_backoffice_user: false,
    is_superadmin: false,
    created_at: '2026-01-03T10:00:00Z',
    updated_at: '2026-01-03T10:00:00Z'
  },
  {
    id: 'user-client-2',
    email: 'jane.smith@example.com',
    password_hash: 'jane123', // Demo login
    first_name: 'Jane',
    last_name: 'Smith',
    phone: '+234 805 777 8888',
    is_active: true,
    is_client: true,
    is_backoffice_user: false,
    is_superadmin: false,
    created_at: '2026-01-04T11:00:00Z',
    updated_at: '2026-01-04T11:00:00Z'
  }
];

const defaultClientProfiles: ClientProfile[] = [
  {
    id: 'client-profile-1',
    user_id: 'user-client-1',
    account_type: 'Individual',
    bvn: '22233344455',
    nin: '11122233344',
    date_of_birth: '1990-05-15',
    address: 'Block B2, Flat 4, 1004 Estates',
    city: 'Victoria Island',
    state: 'Lagos',
    country: 'Nigeria',
    postal_code: '101241',
    occupation: 'Senior Software Engineer',
    employer: 'FinTech Hub Africa',
    annual_income: 8500000,
    source_of_funds: 'Salary and dividends',
    kyc_status: 'verified',
    kyc_documents: {
      passport_url: '#',
      passport_name: 'passport_photo.png',
      id_url: '#',
      id_name: 'drivers_license.pdf',
      utility_url: '#',
      utility_name: 'utility_bill_june.pdf',
      bank_statement_url: '#',
      bank_statement_name: 'bank_statement_3months.pdf'
    },
    beneficiary_name: 'Mary Doe',
    beneficiary_relationship: 'Spouse',
    beneficiary_phone: '+234 803 555 9999',
    created_at: '2026-01-03T10:30:00Z',
    updated_at: '2026-01-03T11:00:00Z'
  },
  {
    id: 'client-profile-2',
    user_id: 'user-client-2',
    account_type: 'Individual',
    bvn: '22244455566',
    nin: '11133344455',
    date_of_birth: '1994-11-22',
    address: '15 Admiralty Way',
    city: 'Lekki Phase 1',
    state: 'Lagos',
    country: 'Nigeria',
    postal_code: '105102',
    occupation: 'Creative Director',
    employer: 'Self-Employed (Agency)',
    annual_income: 12000000,
    source_of_funds: 'Business Revenue',
    kyc_status: 'pending',
    kyc_documents: {},
    beneficiary_name: 'Samuel Smith',
    beneficiary_relationship: 'Sibling',
    beneficiary_phone: '+234 805 777 9999',
    created_at: '2026-01-04T11:15:00Z',
    updated_at: '2026-01-04T11:15:00Z'
  }
];

const defaultProducts: InvestmentProduct[] = [
  {
    id: 'prod-1',
    product_name: 'Trustline Fixed Income Fund',
    product_type: 'Fixed Income',
    currency: 'NGN',
    annual_rate: 12.5, // 12.5%
    minimum_investment: 100000,
    maximum_investment: 10000000,
    tenure_days: 180,
    is_active: true,
    description: 'A high-yield, low-risk portfolio that seeks capital preservation while providing highly competitive regular yields.',
    created_at: '2026-01-01T08:30:00Z',
    updated_at: '2026-01-01T08:30:00Z'
  },
  {
    id: 'prod-2',
    product_name: 'High-Yield Commercial Paper',
    product_type: 'Commercial Paper',
    currency: 'NGN',
    annual_rate: 14.2, // 14.2%
    minimum_investment: 500000,
    maximum_investment: 50000000,
    tenure_days: 270,
    is_active: true,
    description: 'Corporate debt instruments issued by blue-chip companies seeking short-term funding. Highly secure with high-yield potentials.',
    created_at: '2026-01-01T08:45:00Z',
    updated_at: '2026-01-01T08:45:00Z'
  },
  {
    id: 'prod-3',
    product_name: 'Trustline USD Liquidity Fund',
    product_type: 'Mutual Fund',
    currency: 'USD',
    annual_rate: 6.8, // 6.8%
    minimum_investment: 2000,
    maximum_investment: 500000,
    tenure_days: 90,
    is_active: true,
    description: 'Designed to hedge against local currency inflation. Earn top tier USD yield paid quarterly. Safe and liquid.',
    exchange_rate_to_ngn: 1520.00,
    created_at: '2026-01-01T09:00:00Z',
    updated_at: '2026-01-01T09:00:00Z'
  },
  {
    id: 'prod-4',
    product_name: 'Federal Govt Treasury Bill Series A',
    product_type: 'Treasury Bill',
    currency: 'NGN',
    annual_rate: 11.5,
    minimum_investment: 50000,
    maximum_investment: 100000000,
    tenure_days: 364,
    is_active: true,
    description: 'Government backed security, 100% tax free, low-risk short term debt instrument issued by the Central Bank.',
    created_at: '2026-01-01T09:15:00Z',
    updated_at: '2026-01-01T09:15:00Z'
  }
];

const defaultInvestments: Investment[] = [
  {
    id: 'inv-1',
    client_id: 'client-profile-1',
    product_id: 'prod-1',
    investment_reference: 'TRL-2026-105',
    principal_amount: 1000000, // 1 Million NGN
    currency: 'NGN',
    amount_in_ngn: 1000000,
    annual_rate: 12.5,
    start_date: '2026-06-01', // Started 29 days ago
    maturity_date: '2026-11-28', // 180 days tenure
    tenure_days: 180,
    status: 'active',
    daily_interest_accrued: 9931.51, // approx 29 days * (1,000,000 * 12.5/100 / 365)
    total_interest_accrued: 9931.51,
    total_expected_interest: 61643.84, // 1,000,000 * 12.5% * (180/365)
    expected_return_amount: 1061643.84,
    current_value: 1009931.51,
    last_accrual_date: '2026-06-30',
    created_at: '2026-06-01T10:00:00Z',
    updated_at: '2026-06-30T00:00:00Z'
  },
  {
    id: 'inv-2',
    client_id: 'client-profile-1',
    product_id: 'prod-3',
    investment_reference: 'TRL-2026-108',
    principal_amount: 5000, // 5000 USD
    currency: 'USD',
    exchange_rate_used: 1520.00,
    amount_in_ngn: 7600000,
    annual_rate: 6.8,
    start_date: '2026-06-15', // Started 15 days ago
    maturity_date: '2026-09-13', // 90 days tenure
    tenure_days: 90,
    status: 'active',
    daily_interest_accrued: 13.97, // 15 days of interest (5000 * 6.8/100 / 365) = 0.9315 * 15 = 13.97 USD
    total_interest_accrued: 13.97,
    total_expected_interest: 83.84, // 5000 * 6.8% * (90/365)
    expected_return_amount: 5083.84,
    current_value: 5013.97,
    last_accrual_date: '2026-06-30',
    created_at: '2026-06-15T11:00:00Z',
    updated_at: '2026-06-30T00:00:00Z'
  }
];

const defaultAccruals: DailyInterestAccrual[] = [
  // Seed some historic accruals for inv-1 to look authentic
  {
    id: 'accrual-1',
    investment_id: 'inv-1',
    accrual_date: '2026-06-29',
    daily_rate: 0.125 / 365,
    daily_interest_amount: 342.47,
    running_balance: 1009589.04,
    created_at: '2026-06-29T23:59:59Z'
  },
  {
    id: 'accrual-2',
    investment_id: 'inv-1',
    accrual_date: '2026-06-30',
    daily_rate: 0.125 / 365,
    daily_interest_amount: 342.47,
    running_balance: 1009931.51,
    created_at: '2026-06-30T23:59:59Z'
  },
  {
    id: 'accrual-3',
    investment_id: 'inv-2',
    accrual_date: '2026-06-30',
    daily_rate: 0.068 / 365,
    daily_interest_amount: 0.93,
    running_balance: 5013.97,
    created_at: '2026-06-30T23:59:59Z'
  }
];

const defaultCertificates: InvestmentCertificate[] = [
  {
    id: 'cert-1',
    investment_id: 'inv-1',
    certificate_number: 'TRL-CERT-TRL-2026-105',
    issue_date: '2026-06-01',
    client_name: 'John Doe',
    principal_amount: 1000000,
    interest_rate: 12.5,
    tenure_days: 180,
    maturity_date: '2026-11-28',
    expected_return: 1061643.84,
    created_at: '2026-06-01T10:05:00Z'
  },
  {
    id: 'cert-2',
    investment_id: 'inv-2',
    certificate_number: 'TRL-CERT-TRL-2026-108',
    issue_date: '2026-06-15',
    client_name: 'John Doe',
    principal_amount: 5000,
    interest_rate: 6.8,
    tenure_days: 90,
    maturity_date: '2026-09-13',
    expected_return: 5083.84,
    created_at: '2026-06-15T11:05:00Z'
  }
];

const defaultPenaltyRules: PenaltyRule[] = [
  {
    id: 'p-rule-1',
    product_type: 'Fixed Income',
    penalty_percentage: 5.00, // 5% of principal
    min_tenure_days: 0,
    max_tenure_days: 180,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'p-rule-2',
    product_type: 'Commercial Paper',
    penalty_percentage: 8.00,
    min_tenure_days: 0,
    max_tenure_days: 270,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'p-rule-3',
    product_type: 'Mutual Fund',
    penalty_percentage: 2.50,
    min_tenure_days: 0,
    max_tenure_days: 90,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  },
  {
    id: 'p-rule-4',
    product_type: 'Treasury Bill',
    penalty_percentage: 10.00,
    min_tenure_days: 0,
    max_tenure_days: 365,
    is_active: true,
    created_at: '2026-01-01T08:00:00Z',
    updated_at: '2026-01-01T08:00:00Z'
  }
];

const defaultExchangeRate: ExchangeRate = {
  id: 'ex-1',
  from_currency: 'USD',
  to_currency: 'NGN',
  rate: 1520.00,
  effective_date: '2026-06-30',
  created_at: '2026-01-01T08:00:00Z',
  updated_at: '2026-06-30T08:00:00Z'
};

const defaultCompanySetting: CompanySetting = {
  id: 'company-1',
  company_name: 'Trustline Capital Limited',
  company_logo_url: '',
  company_address: 'Plot 14, Admiralty Way, Lekki Phase 1, Lagos, Nigeria',
  company_phone: '+234 1 234 5678',
  company_email: 'info@trustlinecapital.com',
  registration_number: 'RC 1234567',
  tax_id: 'T-98765432',
  created_at: '2026-01-01T08:00:00Z',
  updated_at: '2026-01-01T08:00:00Z'
};

const defaultWithdrawals: WithdrawalRequest[] = [
  {
    id: 'w-1',
    investment_id: 'inv-1',
    client_id: 'client-profile-1',
    request_type: 'withdraw',
    amount: 150000,
    remaining_balance: 859931.51,
    interest_earned: 9931.51,
    penalty_amount: 0,
    status: 'pending',
    bank_name: 'Guaranty Trust Bank',
    account_number: '0123456789',
    account_name: 'John Doe',
    remarks: 'Educational expenses',
    created_at: '2026-06-30T10:15:00Z',
    updated_at: '2026-06-30T10:15:00Z'
  }
];

const defaultAuditLogs: AuditLog[] = [
  {
    id: 'audit-1',
    user_id: 'user-admin-1',
    user_email: 'admin@trustlinecapital.com',
    user_type: 'superadmin',
    action: 'CREATE_PRODUCT',
    table_name: 'investment_products',
    record_id: 'prod-1',
    new_data: { product_name: 'Trustline Fixed Income Fund' },
    ip_address: '197.210.64.12',
    user_agent: 'Mozilla/5.0 Chrome/120.0',
    created_at: '2026-01-01T08:31:00Z'
  },
  {
    id: 'audit-2',
    user_id: 'user-bo-1',
    user_email: 'backoffice@trustlinecapital.com',
    user_type: 'backoffice',
    action: 'VERIFY_CLIENT_KYC',
    table_name: 'client_profiles',
    record_id: 'client-profile-1',
    old_data: { kyc_status: 'pending' },
    new_data: { kyc_status: 'verified' },
    ip_address: '197.210.64.15',
    user_agent: 'Mozilla/5.0 Chrome/120.0',
    created_at: '2026-01-03T11:00:00Z'
  }
];

// Load and save system state helper
export class TrustlineStore {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const val = localStorage.getItem(`trustline_${key}`);
      return val ? JSON.parse(val) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  }

  static set(key: string, value: any) {
    try {
      localStorage.setItem(`trustline_${key}`, JSON.stringify(value));
    } catch (e) {
      console.error(e);
    }
  }

  // Load complete state
  static loadState() {
    return {
      users: this.get<User[]>('users', defaultUsers),
      clientProfiles: this.get<ClientProfile[]>('clientProfiles', defaultClientProfiles),
      products: this.get<InvestmentProduct[]>('products', defaultProducts),
      investments: this.get<Investment[]>('investments', defaultInvestments),
      accruals: this.get<DailyInterestAccrual[]>('accruals', defaultAccruals),
      certificates: this.get<InvestmentCertificate[]>('certificates', defaultCertificates),
      penaltyRules: this.get<PenaltyRule[]>('penaltyRules', defaultPenaltyRules),
      exchangeRate: this.get<ExchangeRate>('exchangeRate', defaultExchangeRate),
      companySetting: this.get<CompanySetting>('companySetting', defaultCompanySetting),
      withdrawals: this.get<WithdrawalRequest[]>('withdrawals', defaultWithdrawals),
      auditLogs: this.get<AuditLog[]>('auditLogs', defaultAuditLogs)
    };
  }

  // Save complete state
  static saveState(state: any) {
    Object.keys(state).forEach((key) => {
      this.set(key, state[key]);
    });
  }

  // Reset database state to defaults
  static resetToDefault() {
    this.set('users', defaultUsers);
    this.set('clientProfiles', defaultClientProfiles);
    this.set('products', defaultProducts);
    this.set('investments', defaultInvestments);
    this.set('accruals', defaultAccruals);
    this.set('certificates', defaultCertificates);
    this.set('penaltyRules', defaultPenaltyRules);
    this.set('exchangeRate', defaultExchangeRate);
    this.set('companySetting', defaultCompanySetting);
    this.set('withdrawals', defaultWithdrawals);
    this.set('auditLogs', defaultAuditLogs);
  }

  // Write simple audit log
  static addAuditLog(
    userId: string,
    email: string,
    userType: 'superadmin' | 'backoffice' | 'client' | 'system',
    action: string,
    tableName?: string,
    recordId?: string,
    oldData?: any,
    newData?: any
  ) {
    const logs = this.get<AuditLog[]>('auditLogs', defaultAuditLogs);
    const newLog: AuditLog = {
      id: generateUUID(),
      user_id: userId,
      user_email: email,
      user_type: userType,
      action,
      table_name: tableName,
      record_id: recordId,
      old_data: oldData,
      new_data: newData,
      ip_address: '127.0.0.1',
      user_agent: navigator.userAgent,
      created_at: new Date().toISOString()
    };
    logs.unshift(newLog);
    this.set('auditLogs', logs);
  }
}
