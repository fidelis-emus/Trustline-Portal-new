/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name: string;
  last_name: string;
  phone: string;
  is_active: boolean;
  is_client: boolean;
  is_backoffice_user: boolean;
  is_superadmin: boolean;
  reset_token?: string;
  reset_token_expiry?: string;
  created_at: string;
  updated_at: string;
}

export interface KYCDocuments {
  passport_url?: string;
  id_url?: string;
  utility_url?: string;
  bank_statement_url?: string;
  passport_name?: string;
  id_name?: string;
  utility_name?: string;
  bank_statement_name?: string;
}

export interface ClientProfile {
  id: string;
  user_id: string;
  account_type?: 'Individual' | 'Corporate' | 'Joint';
  bvn: string;
  nin: string;
  date_of_birth: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postal_code: string;
  occupation: string;
  employer: string;
  annual_income: number;
  source_of_funds: string;
  kyc_status: 'pending' | 'verified' | 'rejected';
  kyc_documents: KYCDocuments;
  beneficiary_name?: string;
  beneficiary_relationship?: string;
  beneficiary_phone?: string;
  created_at: string;
  updated_at: string;
}

export type ProductType = 'Mutual Fund' | 'Fixed Income' | 'Treasury Bill' | 'Commercial Paper' | 'Discount Products';

export interface InvestmentProduct {
  id: string;
  product_name: string;
  product_type: ProductType;
  currency: 'NGN' | 'USD';
  annual_rate: number; // e.g., 12.5 means 12.5%
  minimum_investment: number;
  maximum_investment?: number;
  tenure_days: number;
  maturity_date?: string;
  is_active: boolean;
  description: string;
  exchange_rate_to_ngn?: number;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface Investment {
  id: string;
  client_id: string;
  product_id: string;
  investment_reference: string;
  principal_amount: number;
  currency: 'NGN' | 'USD';
  exchange_rate_used?: number;
  amount_in_ngn: number;
  annual_rate: number;
  start_date: string;
  maturity_date: string;
  tenure_days: number;
  status: 'active' | 'matured' | 'liquidated' | 'part_liquidated' | 'withdrawn';
  daily_interest_accrued: number;
  total_interest_accrued: number;
  total_expected_interest: number;
  expected_return_amount: number;
  current_value: number;
  last_accrual_date?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DailyInterestAccrual {
  id: string;
  investment_id: string;
  accrual_date: string;
  daily_rate: number;
  daily_interest_amount: number;
  running_balance: number;
  created_at: string;
}

export interface InvestmentCertificate {
  id: string;
  investment_id: string;
  certificate_number: string;
  issue_date: string;
  certificate_pdf_url?: string;
  client_name: string;
  principal_amount: number;
  interest_rate: number;
  tenure_days: number;
  maturity_date: string;
  expected_return: number;
  created_at: string;
}

export interface WithdrawalRequest {
  id: string;
  investment_id: string;
  client_id: string;
  request_type: 'part_liquidate' | 'full_liquidate' | 'withdraw';
  amount: number;
  remaining_balance?: number;
  interest_earned: number;
  penalty_amount: number;
  penalty_reason?: string;
  status: 'pending' | 'approved' | 'completed' | 'rejected';
  approved_by?: string;
  approval_date?: string;
  bank_name?: string;
  account_number?: string;
  account_name?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_email?: string;
  user_type: 'superadmin' | 'backoffice' | 'client' | 'system';
  action: string;
  table_name?: string;
  record_id?: string;
  old_data?: any;
  new_data?: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

export interface PenaltyRule {
  id: string;
  product_type: ProductType;
  penalty_percentage: number;
  min_tenure_days: number;
  max_tenure_days: number;
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ExchangeRate {
  id: string;
  from_currency: string;
  to_currency: string;
  rate: number;
  effective_date: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface SystemSetting {
  id: string;
  setting_key: string;
  setting_value: string;
  setting_type: 'string' | 'json' | 'boolean' | 'number';
  description: string;
  created_at: string;
  updated_at: string;
}

export interface CompanySetting {
  id: string;
  company_name: string;
  company_logo_url: string;
  company_address: string;
  company_phone: string;
  company_email: string;
  registration_number: string;
  tax_id: string;
  created_at: string;
  updated_at: string;
}
