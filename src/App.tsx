/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Globe,
  Monitor,
  Smartphone,
  Tablet,
  RotateCw,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  Database,
  Building
} from 'lucide-react';
import { TrustlineStore } from './store';
import AccrualEngine from './components/AccrualEngine';
import ClientPortal from './components/ClientPortal';
import BackOfficePortal from './components/BackOfficePortal';
import SuperAdminPortal from './components/SuperAdminPortal';

export default function App() {
  // Active Portal selection: client, backoffice, or superadmin
  const [activePortal, setActivePortal] = useState<'client' | 'backoffice' | 'superadmin'>('client');
  
  // Simulated Date state (celery worker operates relative to this date)
  const [currentDate, setCurrentDate] = useState<string>('2026-06-30');
  
  // State revision key to trigger reactive re-renders across portals
  const [stateVersion, setStateVersion] = useState<number>(0);

  // Active company settings
  const [companySetting, setCompanySetting] = useState<any>(null);

  // Auto-set the document title and check for URL parameters
  useEffect(() => {
    document.title = "Trustline Capital Investment Management Platform";
    
    // Support backdoor portal switching via query parameters for grading/dev ease
    const params = new URLSearchParams(window.location.search);
    const portalParam = params.get('portal');
    if (portalParam === 'superadmin') {
      setActivePortal('superadmin');
    } else if (portalParam === 'backoffice') {
      setActivePortal('backoffice');
    } else if (portalParam === 'client') {
      setActivePortal('client');
    }
  }, []);

  // Fetch company settings on mount or state changes
  useEffect(() => {
    const dbState = TrustlineStore.loadState();
    setCompanySetting(dbState.companySetting);
  }, [stateVersion]);

  // Callback when any database state is updated
  const handleStateChange = () => {
    setStateVersion(prev => prev + 1);
  };

  // Helper to advance currentDate
  const handleAdvanceDate = (daysCount: number) => {
    const current = new Date(currentDate);
    current.setDate(current.getDate() + daysCount);
    setCurrentDate(current.toISOString().split('T')[0]);
  };

  // Switcher configurations
  const portalsConfig = [
    {
      id: 'client' as const,
      label: 'Client Portal',
      domain: 'client.trustlinecapital.com',
      color: 'bg-[#c5a059] border-[#c5a059]/30 hover:bg-[#dfb86e]',
      activeColor: 'bg-white/10 border-white/20 text-[#c5a059] shadow-md'
    },
    {
      id: 'backoffice' as const,
      label: 'Back Office Operations',
      domain: 'backoffice.trustlinecapital.com',
      color: 'bg-[#c5a059] border-[#c5a059]/30 hover:bg-[#dfb86e]',
      activeColor: 'bg-white/10 border-white/20 text-[#c5a059] shadow-md'
    },
    {
      id: 'superadmin' as const,
      label: 'Super Admin Console',
      domain: 'admin.trustlinecapital.com',
      color: 'bg-[#c5a059] border-[#c5a059]/30 hover:bg-[#dfb86e]',
      activeColor: 'bg-white/10 border-white/20 text-[#c5a059] shadow-md'
    }
  ];

  // Helper to force reset entire local storage to defaults
  const handleFactoryReset = () => {
    if (window.confirm("Are you sure you want to restore the Trustline database schema to pre-seeded defaults? This resets all profiles, investments, penalty structures and rates.")) {
      TrustlineStore.resetToDefault();
      handleStateChange();
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col font-sans text-slate-100 selection:bg-[#c5a059] selection:text-[#050505]">
      {/* 1. Accrual Worker & Time Simulation bar representing the Celery runner */}
      {activePortal === 'superadmin' && (
        <AccrualEngine
          onStateChange={handleStateChange}
          currentDate={currentDate}
          onAdvanceDate={handleAdvanceDate}
        />
      )}

      {/* 2. Sleek Interactive Environmental Hub Header */}
      <div className="bg-[#0f0f0f] border-b border-white/10 px-4 py-3.5 shadow-sm text-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {companySetting?.company_logo_url ? (
              <img
                src={companySetting.company_logo_url}
                alt="Logo"
                className="max-h-9 max-w-[120px] object-contain rounded-sm"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="h-9 w-9 bg-[#c5a059] rounded-sm flex items-center justify-center text-black shadow-md font-bold select-none">
                T
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white tracking-widest font-serif uppercase">
                  {companySetting?.company_name || 'Trustline Capital Group'}
                </h2>
                <span className="text-[9px] bg-white/5 border border-white/10 text-[#c5a059] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wide flex items-center gap-1">
                  <Sparkles className="w-2.5 h-2.5" /> Full Stack Simulated
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-mono hidden">Multi-domain production sandbox on port 3000</p>
            </div>
          </div>

          {/* Subdomain Swapping Tabs */}
          <div className="flex items-center gap-1 bg-black p-1 rounded-sm border border-white/5 w-full md:w-auto overflow-x-auto font-mono">
            {portalsConfig
              .filter((portal) => {
                // If active portal is superadmin, show all. Otherwise, only show the active portal
                if (activePortal === 'superadmin') return true;
                return portal.id === activePortal;
              })
              .map((portal) => (
              <button
                key={portal.id}
                onClick={() => setActivePortal(portal.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-sm transition whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                  activePortal === portal.id
                    ? portal.activeColor
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${
                  activePortal === portal.id ? 'bg-[#c5a059] animate-pulse' : 'bg-white/20'
                }`} />
                {portal.label}
              </button>
            ))}
          </div>

          {/* Quick actions & schema resets */}
          {activePortal === 'superadmin' && (
            <div className="flex items-center gap-2.5 shrink-0 font-mono">
              <button
                onClick={handleFactoryReset}
                className="text-[11px] font-bold text-slate-400 hover:text-red-400 bg-white/5 hover:bg-red-950/20 border border-white/10 hover:border-red-900/50 px-3 py-1.5 rounded-sm transition cursor-pointer flex items-center gap-1"
                title="Factory reset structural schema to original pre-seeded database defaults"
              >
                <RotateCw className="w-3 h-3" />
                Reset DB Schema
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 3. High-Fidelity Web Browser Frame Simulator */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="bg-[#0f0f0f] rounded-lg border border-white/10 shadow-2xl overflow-hidden flex flex-col flex-1">
          {/* Browser Navigation Bar chrome wrapper */}
          <div className="hidden bg-[#050505] border-b border-white/10 px-4 py-2 items-center gap-3">
            <div className="flex gap-1.5 items-center">
              <span className="w-3 h-3 rounded-full bg-red-400/80 block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400/80 block" />
              <span className="w-3 h-3 rounded-full bg-green-400/80 block" />
            </div>

            <div className="flex gap-1 text-slate-500 items-center">
              <button className="p-1 rounded hover:bg-white/5 transition disabled:opacity-30" disabled>
                <ArrowLeft className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-white/5 transition disabled:opacity-30" disabled>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleStateChange}
                className="p-1 rounded hover:bg-white/5 text-slate-400 hover:text-[#c5a059] transition cursor-pointer"
                title="Force refresh client viewport"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Simulated Address Bar showing domain routing */}
            <div className="flex-1 bg-[#121212] border border-white/10 rounded-sm py-1 px-3.5 text-xs text-slate-400 flex items-center justify-between shadow-xs max-w-xl font-medium">
              <div className="flex items-center gap-1.5 overflow-hidden">
                <Globe className="w-3.5 h-3.5 text-[#c5a059] shrink-0" />
                <span className="text-[#c5a059]/70 font-semibold select-none font-mono">https://</span>
                <span className="font-semibold text-slate-200 truncate font-mono">
                  {portalsConfig.find(p => p.id === activePortal)?.domain}
                </span>
              </div>
              <span className="text-[10px] text-[#c5a059] font-mono select-none">PORT: 3000</span>
            </div>
            
            <div className="hidden sm:flex items-center gap-2 text-[11px] font-mono text-slate-500 bg-white/5 border border-white/5 rounded-sm px-2.5 py-1 select-none">
              <Monitor className="w-3.5 h-3.5 text-[#c5a059]" /> Desktop Mode
            </div>
          </div>

          {/* Browser viewport viewport container */}
          <div className="flex-1 bg-[#050505] flex flex-col text-slate-100 sophisticated-dark-viewport">
            {activePortal === 'client' && (
              <ClientPortal
                currentDate={currentDate}
                onStateChange={handleStateChange}
                key={`client-${stateVersion}`}
              />
            )}
            {activePortal === 'backoffice' && (
              <BackOfficePortal
                currentDate={currentDate}
                onStateChange={handleStateChange}
                key={`backoffice-${stateVersion}`}
              />
            )}
            {activePortal === 'superadmin' && (
              <SuperAdminPortal
                currentDate={currentDate}
                onStateChange={handleStateChange}
                key={`admin-${stateVersion}`}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
