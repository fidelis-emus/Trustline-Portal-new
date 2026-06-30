/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, Calendar, Zap, AlertCircle } from 'lucide-react';
import { TrustlineStore } from '../store';
import { Investment, DailyInterestAccrual, AuditLog } from '../types';

interface AccrualEngineProps {
  onStateChange: () => void;
  currentDate: string;
  onAdvanceDate: (days: number) => void;
}

export default function AccrualEngine({ onStateChange, currentDate, onAdvanceDate }: AccrualEngineProps) {
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const runDailyAccrual = () => {
    setLoading(true);
    setSuccessMsg('');

    setTimeout(() => {
      // 1. Load active state
      const state = TrustlineStore.loadState();
      const activeInvestments = state.investments.filter(inv => inv.status === 'active');
      
      if (activeInvestments.length === 0) {
        setSuccessMsg('No active investments found to accrue.');
        setLoading(false);
        return;
      }

      const accrualDateStr = currentDate;
      let totalAccruedTodayInNgn = 0;
      let totalAccruedTodayInUsd = 0;
      const newAccruals: DailyInterestAccrual[] = [];

      // Calculate for each active investment
      const updatedInvestments = state.investments.map((inv) => {
        if (inv.status !== 'active') return inv;

        // Daily rate: annual_rate / 365 / 100
        const dailyRateFraction = (inv.annual_rate / 365) / 100;
        const interestAmount = inv.principal_amount * dailyRateFraction;
        
        // Calculate running balances
        const prevDailyAccrued = inv.daily_interest_accrued;
        const newDailyInterestAccrued = prevDailyAccrued + interestAmount;
        const newTotalInterestAccrued = inv.total_interest_accrued + interestAmount;
        const newCurrentValue = inv.current_value + interestAmount;

        if (inv.currency === 'NGN') {
          totalAccruedTodayInNgn += interestAmount;
        } else {
          totalAccruedTodayInUsd += interestAmount;
          totalAccruedTodayInNgn += interestAmount * (inv.exchange_rate_used || 1520);
        }

        // Check if maturity date has been reached
        const hasMatured = new Date(currentDate) >= new Date(inv.maturity_date);
        const nextStatus = hasMatured ? 'matured' : 'active';

        // Log daily accrual record
        const accrualRecord: DailyInterestAccrual = {
          id: `acc-${inv.id}-${currentDate}`,
          investment_id: inv.id,
          accrual_date: accrualDateStr,
          daily_rate: dailyRateFraction,
          daily_interest_amount: interestAmount,
          running_balance: newCurrentValue,
          created_at: new Date().toISOString()
        };
        newAccruals.push(accrualRecord);

        return {
          ...inv,
          daily_interest_accrued: newDailyInterestAccrued,
          total_interest_accrued: newTotalInterestAccrued,
          current_value: newCurrentValue,
          status: nextStatus,
          last_accrual_date: accrualDateStr,
          updated_at: new Date().toISOString()
        };
      });

      // Write logs and save
      const updatedAccruals = [...newAccruals, ...state.accruals];
      
      // Auto-create audit log for system task
      const systemLog: AuditLog = {
        id: `sys-log-${currentDate}`,
        user_type: 'system',
        action: 'CELERY_DAILY_ACCRUAL',
        table_name: 'investments',
        record_id: undefined,
        new_data: { 
          date: currentDate, 
          accrued_ngn: totalAccruedTodayInNgn, 
          accrued_usd: totalAccruedTodayInUsd,
          processed_count: activeInvestments.length
        },
        ip_address: '127.0.0.1',
        user_agent: 'Celery/Cron Worker 4.2',
        created_at: new Date().toISOString()
      };

      TrustlineStore.saveState({
        ...state,
        investments: updatedInvestments,
        accruals: updatedAccruals,
        auditLogs: [systemLog, ...state.auditLogs]
      });

      setSuccessMsg(`Accrued interest for ${activeInvestments.length} investments (Ngn Accrued: ₦${totalAccruedTodayInNgn.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`);
      
      // Automatically advance date by 1 day as well
      onAdvanceDate(1);
      onStateChange();
      setLoading(false);
    }, 600);
  };

  const forceMaturityCheck = () => {
    const state = TrustlineStore.loadState();
    let maturedCount = 0;

    const updatedInvestments = state.investments.map(inv => {
      if (inv.status === 'active' && new Date(currentDate) >= new Date(inv.maturity_date)) {
        maturedCount++;
        return {
          ...inv,
          status: 'matured' as const,
          updated_at: new Date().toISOString()
        };
      }
      return inv;
    });

    if (maturedCount > 0) {
      TrustlineStore.saveState({
        ...state,
        investments: updatedInvestments
      });
      setSuccessMsg(`Success! ${maturedCount} investment(s) matured and updated.`);
      onStateChange();
    } else {
      setSuccessMsg('No active investments are past maturity date yet.');
    }
  };

  return (
    <div id="accrual-engine-console" className="bg-[#050505] border-b border-white/10 text-slate-300 py-2.5 px-4 sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#c5a059] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#c5a059]"></span>
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="font-serif text-white tracking-wide text-xs uppercase">Accrual Engine Console</span>
            <span className="text-[10px] text-slate-500 font-mono">celery@trustline</span>
          </div>
          <span className="text-white/20">|</span>
          <div className="flex items-center gap-1.5 text-xs">
            <Calendar className="w-3.5 h-3.5 text-[#c5a059]" />
            <span className="text-white font-mono font-medium">{currentDate}</span>
          </div>
        </div>

        {successMsg && (
          <div className="text-[11px] bg-[#0f0f0f] border border-white/10 rounded px-2.5 py-1 text-slate-200 animate-fade-in max-w-sm truncate flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => onAdvanceDate(1)}
            className="text-[11px] bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#c5a059] font-medium px-2.5 py-1 rounded border border-white/10 transition cursor-pointer"
          >
            +1 Day
          </button>
          
          <button
            onClick={forceMaturityCheck}
            className="text-[11px] bg-[#0f0f0f] hover:bg-[#1a1a1a] text-[#c5a059] font-medium px-2.5 py-1 rounded border border-white/10 transition cursor-pointer"
            title="Scan for matured investments and update their status"
          >
            Scan Maturity
          </button>

          <button
            onClick={runDailyAccrual}
            disabled={loading}
            className={`flex items-center gap-1 text-[11px] font-semibold tracking-wide uppercase px-3 py-1 rounded text-[#050505] shadow transition cursor-pointer ${
              loading ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-[#c5a059] hover:bg-[#d6b472]'
            }`}
          >
            <Play className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Accruing...' : 'Run Daily Accrual & Advance Date'}
          </button>
        </div>
      </div>
    </div>
  );
}
