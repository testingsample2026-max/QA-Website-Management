/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Mail, 
  Globe, 
  Building2, 
  Clock, 
  Save, 
  RotateCcw,
  Check,
  Sparkles,
  Laptop
} from 'lucide-react';

export const ProfileView: React.FC = () => {
  const { settings, updateSettings, addNotification } = useApp();

  // Local state for profile inputs
  const [websiteName, setWebsiteName] = useState(settings.websiteName || 'TestEngine');
  const [companyName, setCompanyName] = useState(settings.companyName || 'Enterprise QA Solutions');
  const [userName, setUserName] = useState(settings.userName || 'QA Lead');
  const [userEmail, setUserEmail] = useState(settings.userEmail || 'testing21352022@gmail.com');
  const [language, setLanguage] = useState(settings.language || 'en');
  const [timezone, setTimezone] = useState(settings.timezone || 'UTC');

  // Sync state if settings load from database later
  useEffect(() => {
    if (settings) {
      if (settings.websiteName) setWebsiteName(settings.websiteName);
      if (settings.companyName) setCompanyName(settings.companyName);
      if (settings.userName) setUserName(settings.userName);
      if (settings.userEmail) setUserEmail(settings.userEmail);
      if (settings.language) setLanguage(settings.language);
      if (settings.timezone) setTimezone(settings.timezone);
    }
  }, [settings]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      updateSettings({
        websiteName,
        companyName,
        userName,
        userEmail,
        language,
        timezone,
      });
      addNotification('Profile Saved', 'Your system profile and branding properties have been updated.', 'success');
    } catch (err: any) {
      addNotification('Save Failed', err.message || 'Could not update profile.', 'error');
    }
  };

  const handleReset = () => {
    setWebsiteName('TestEngine');
    setCompanyName('Enterprise QA Solutions');
    setUserName('QA Lead');
    setUserEmail('testing21352022@gmail.com');
    setLanguage('en');
    setTimezone('UTC');
    
    updateSettings({
      websiteName: 'TestEngine',
      companyName: 'Enterprise QA Solutions',
      userName: 'QA Lead',
      userEmail: 'testing21352022@gmail.com',
      language: 'en',
      timezone: 'UTC',
    });
    addNotification('Profile Reset', 'Profile properties restored to factory default parameters.', 'info');
  };

  const initials = userName
    ? userName.trim().split(/\s+/).map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'QA';

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Title Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
          System Profile & Branding
        </h2>
        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
          Manage system-wide properties, customizable brand labels, user credentials, and display preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Side: Avatar Card & Live Branding Preview */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs text-center space-y-4">
            <div className="relative inline-flex mx-auto">
              <div className="w-20 h-20 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>

            <div>
              <h3 className="font-bold text-base text-slate-850 dark:text-white">{userName}</h3>
              <p className="text-xs text-slate-400 mt-0.5">{userEmail}</p>
            </div>

            <div className="pt-2">
              <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                Enterprise QA Lead
              </span>
            </div>

            <div className="border-t border-slate-100 dark:border-slate-850 pt-4 text-left space-y-2.5">
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Building2 className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="truncate">{companyName}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Lang: <strong className="font-semibold">{language.toUpperCase()}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Timezone: <strong className="font-semibold">{timezone}</strong></span>
              </div>
            </div>
          </div>

          {/* Interactive Live Brand Preview */}
          <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5 pb-2 border-b border-slate-100 dark:border-slate-850">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>Real-Time Sidebar Branding</span>
            </h4>
            
            <p className="text-xs text-slate-400 leading-normal">
              Below is a real-time preview of how your updated brand name renders in the sidebar:
            </p>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-sm shrink-0">
                <Laptop className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="font-bold text-sm tracking-tight text-slate-900 dark:text-white font-sans block truncate">
                  {websiteName || 'TestEngine'}
                </span>
                <span className="text-[9px] text-slate-400 uppercase tracking-widest leading-none">
                  QA WORKSPACE
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Settings inputs form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSave} className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
            <h3 className="text-xs font-bold text-slate-850 dark:text-white uppercase tracking-wider pb-3 border-b border-slate-100 dark:border-slate-850 flex items-center gap-1.5">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Profile Settings Ledger</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Website Name (THE BRAND) */}
              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Website / Brand Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Laptop className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={websiteName}
                    onChange={(e) => setWebsiteName(e.target.value)}
                    placeholder="e.g., TestEngine"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  Sets the primary brand identity, displaying prominently in the sidebar header and browser tabs.
                </p>
              </div>

              {/* Company Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Company Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Enterprise QA Solutions"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Lead User Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Your Full Name <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g., John Doe"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* User Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="e.g., lead@company.com"
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Active Timezone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  System Timezone
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="UTC">Coordinated Universal Time (UTC)</option>
                    <option value="EST">Eastern Standard Time (EST)</option>
                    <option value="PST">Pacific Standard Time (PST)</option>
                    <option value="GMT">Greenwich Mean Time (GMT)</option>
                    <option value="IST">Indian Standard Time (IST)</option>
                    <option value="CET">Central European Time (CET)</option>
                  </select>
                </div>
              </div>

              {/* System Language */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Interface Language
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Globe className="w-4 h-4" />
                  </div>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="en">English (US)</option>
                    <option value="es">Español (ES)</option>
                    <option value="fr">Français (FR)</option>
                    <option value="de">Deutsch (DE)</option>
                    <option value="ja">日本語 (JA)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Action buttons bar */}
            <div className="flex items-center justify-between pt-5 border-t border-slate-100 dark:border-slate-850">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 text-xs font-semibold rounded-xl cursor-pointer transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>

              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
