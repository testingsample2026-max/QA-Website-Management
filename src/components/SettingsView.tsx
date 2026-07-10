/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Settings,
  Trash2,
  Database,
  Download,
  Upload,
  RefreshCw,
  Clock,
  Check,
  AlertTriangle,
  FileText,
  Palette,
  Type,
  Moon,
  Sun,
  Square
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    auditLogs,
    clearAllData,
    importData,
    exportData,
    addNotification,
    settings,
    updateSettings
  } = useApp();

  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [importError, setImportError] = useState('');

  // Export
  const handleExport = () => {
    try {
      const dataStr = exportData();
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `qa_testmanager_backup_${new Date().toISOString().slice(0, 10)}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
      
      addNotification('Backup Downloaded', 'Your entire QA workspace configuration has been downloaded successfully.', 'success');
    } catch (err) {
      addNotification('Backup Failed', 'Could not export workspace.', 'error');
    }
  };

  // Import
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    const fileReader = new FileReader();
    const file = e.target.files?.[0];
    if (!file) return;

    fileReader.onload = (event) => {
      try {
        const res = importData(event.target?.result as string);
        if (res.success) {
          addNotification('Backup Imported', 'Workspace configuration loaded and restored.', 'success');
          setIsSuccessOpen(true);
        } else {
          setImportError(res.error || 'Invalid backup payload.');
        }
      } catch (err) {
        setImportError('Failed to parse file. Ensure it is a valid backup JSON structure.');
      }
    };
    fileReader.readAsText(file);
  };

  const confirmPurge = () => {
    clearAllData();
    setIsClearOpen(false);
    addNotification('Workspace Purged', 'All projects, test cases, and people directories have been permanently cleared.', 'info');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Configuration & Administration forms */}
      <div className="lg:col-span-2 space-y-6">
        {/* Workspace Administration Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Database Administration
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Backup, restore, or wipe clean your entire QA Test Management workspace dataset.
              </p>
            </div>
          </div>

          {/* Backup Import / Export */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Download className="w-4 h-4 text-indigo-500" />
                <span>Export Configuration Backup</span>
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-sans">
                Download your entire workspace ledger—including Projects, Modules, Requirements, QA Engineers, Developer Directories, Test Cases, and Run histories—as a single JSON.
              </p>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl cursor-pointer shadow-sm transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Ledger Backup</span>
              </button>
            </div>

            <div className="p-5 border border-slate-100 dark:border-slate-850 rounded-xl space-y-4">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-500" />
                <span>Restore From Backup File</span>
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-relaxed font-sans">
                Upload a previously exported workspace JSON file. Restoring will replace your current local registry immediately.
              </p>
              <div className="space-y-2">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl cursor-pointer border border-slate-250 dark:border-slate-700 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Choose Backup File</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImport}
                    className="hidden"
                  />
                </label>
                {importError && (
                  <p className="text-[10px] font-semibold text-red-500 mt-1 bg-red-50 p-2 rounded-lg border border-red-100">{importError}</p>
                )}
              </div>
            </div>
          </div>

          {/* Purge / Wipe Clean Data */}
          <div className="p-5 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-150 dark:border-rose-900/40 rounded-xl space-y-4 opacity-50 select-none">
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-400 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                <span>Purge & Reset All Workspace Data</span>
              </span>
              <span className="px-1.5 py-0.5 bg-rose-100 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 text-[10px] rounded-md font-bold uppercase tracking-wider">
                Disabled
              </span>
            </h4>
            <p className="text-xs text-rose-650 dark:text-rose-450 leading-relaxed font-sans">
              Looking for a fresh start or ready to define empty schemas? This action permanently purges all databases, credentials, and run histories, returning the system to a clean, empty state. <strong>This action is irreversible.</strong>
            </p>
            <button
              disabled={true}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-300 dark:bg-slate-850 text-slate-500 dark:text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed shadow-none transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Wipe Clean Database</span>
            </button>
          </div>
        </div>

        {/* Workspace Aesthetics & Branding Card */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Aesthetics & Workspace Branding
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Personalize your workspace typography, primary brand accents, and interface modes.
              </p>
            </div>
          </div>

          <div className="space-y-6">
            {/* 1. Theme selection */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sun className="w-4 h-4 text-indigo-500" />
                <span>Appearance Mode</span>
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal">
                Choose between a clean light appearance or an immersive eye-safe dark theme.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'light' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    settings.theme === 'light'
                      ? 'bg-indigo-50/50 border-indigo-600 text-indigo-700 shadow-xs font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  <span>Light Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => updateSettings({ theme: 'dark' })}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 border rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                    settings.theme === 'dark'
                      ? 'bg-indigo-950/40 border-indigo-500 text-indigo-400 shadow-xs font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            {/* 2. Primary Color Accents */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Palette className="w-4 h-4 text-indigo-500" />
                <span>Primary Brand Color Accents</span>
              </h4>
              <p className="text-xs text-slate-455 dark:text-slate-400 leading-normal">
                Select your enterprise brand accent color. This affects buttons, active tabs, and primary action controls.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'indigo', name: 'Royal Indigo', bg: 'bg-[#4f46e5]' },
                  { id: 'blue', name: 'Ocean Blue', bg: 'bg-[#2563eb]' },
                  { id: 'emerald', name: 'Emerald Forest', bg: 'bg-[#059669]' },
                  { id: 'teal', name: 'Innovative Teal', bg: 'bg-[#14b8a6]' },
                  { id: 'orange', name: 'Cyber Tangerine', bg: 'bg-[#f97316]' },
                  { id: 'fuchsia', name: 'Fuchsia Glow', bg: 'bg-[#d946ef]' },
                  { id: 'nordic', name: 'Nordic Frost', bg: 'bg-[#4b7eb3]' },
                  { id: 'obsidian', name: 'Gold Obsidian', bg: 'bg-[#cca352]' },
                  { id: 'violet', name: 'Cyber Violet', bg: 'bg-[#7c3aed]' },
                  { id: 'rose', name: 'Crimson Rose', bg: 'bg-[#e11d48]' },
                  { id: 'amber', name: 'Sunset Amber', bg: 'bg-[#d97706]' },
                  { id: 'slate', name: 'Nordic Slate', bg: 'bg-[#475569]' }
                ].map(color => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => updateSettings({ primaryColor: color.id as any })}
                    className={`flex items-center gap-2.5 p-2.5 border rounded-xl text-left cursor-pointer transition-all ${
                      settings.primaryColor === color.id
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 text-slate-900 dark:text-white ring-1 ring-indigo-500/30 font-semibold'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850 text-slate-650 dark:text-slate-400'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${color.bg}`} />
                    <span className="text-[11px] font-semibold truncate">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Typography Fonts */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Type className="w-4 h-4 text-indigo-500" />
                <span>Workspace Typography Font Face</span>
              </h4>
              <p className="text-xs text-slate-455 dark:text-slate-400 leading-normal">
                Change the font family used across dashboards, tables, and reporting modules.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {[
                  { id: 'sans', name: 'Modern Inter', desc: 'Symmetrical & clear sans-serif', sample: 'Aa Bb Cc' },
                  { id: 'display', name: 'Tech Grotesk', desc: 'Space Grotesk display headers', sample: 'Aa Bb Cc' },
                  { id: 'outfit', name: 'Geometric Outfit', desc: 'Modern geometric curves', sample: 'Aa Bb Cc' },
                  { id: 'serif', name: 'Serif Editorial', desc: 'Sophisticated Playfair display', sample: 'Aa Bb Cc' },
                  { id: 'mono', name: 'Developer Mono', desc: 'JetBrains technical monospaced', sample: 'Aa Bb Cc' }
                ].map(font => (
                  <button
                    key={font.id}
                    type="button"
                    onClick={() => updateSettings({ fontFamily: font.id as any })}
                    className={`flex flex-col p-3 border rounded-xl text-left cursor-pointer transition-all ${
                      settings.fontFamily === font.id
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span className="text-xs font-bold text-slate-850 dark:text-slate-150">{font.name}</span>
                      <span className="text-[10px] opacity-40 font-mono font-bold">{font.sample}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 leading-normal">{font.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Border Style Management */}
            <div className="space-y-3 pt-5 border-t border-slate-100 dark:border-slate-850">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Square className="w-4 h-4 text-indigo-500" />
                <span>Workspace Border Style Boundaries</span>
              </h4>
              <p className="text-xs text-slate-450 dark:text-slate-400 leading-normal font-sans">
                Manage the thickness and visual prominence of boundaries, table rows, and grid partitions across the dashboard.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2.5">
                {[
                  { id: 'lite', name: 'Lite Borders', desc: 'Sleek hairline limits for high density' },
                  { id: 'classic', name: 'Classic Borders', desc: 'Standard contrasting enterprise partitions' },
                  { id: 'thick', name: 'Thick Borders', desc: 'Heavy bold 2px frames for clear structure' },
                  { id: 'accent', name: 'Tinted Accent', desc: 'Borders colored in chosen brand tone' },
                  { id: 'none', name: 'Clean Edge', desc: 'Borderless layout for large stages' }
                ].map(bStyle => (
                  <button
                    key={bStyle.id}
                    type="button"
                    onClick={() => updateSettings({ borderStyle: bStyle.id as any })}
                    className={`flex flex-col p-3 border rounded-xl text-left cursor-pointer transition-all ${
                      (settings.borderStyle || 'lite') === bStyle.id
                        ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/10 ring-1 ring-indigo-500/30'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-850'
                    }`}
                  >
                    <span className="text-xs font-bold text-slate-850 dark:text-slate-150">{bStyle.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1.5 leading-normal">{bStyle.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL: Immutable Live Workspace Audit Log */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col h-[650px]">
          <div className="flex items-start gap-3 pb-4 border-b border-slate-100 dark:border-slate-850">
            <div className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-550 dark:text-slate-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider">
                Workspace Audit Logs
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">
                Immutable chronological log representing CRUD events during this session.
              </p>
            </div>
          </div>

          {/* Log Stream */}
          <div className="flex-1 overflow-y-auto mt-4 pr-1 space-y-3 custom-scrollbar">
            {auditLogs.length === 0 ? (
              <div className="text-center py-20 text-slate-400 text-xs">
                No session events registered yet. Create records to begin audit trailing.
              </div>
            ) : (
              [...auditLogs].reverse().map(log => (
                <div
                  key={log.id}
                  className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl text-xs space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20 hover:border-slate-200 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 font-mono">
                      {log.action}
                    </span>
                    <span className="text-[9px] text-slate-400 font-mono">
                      {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-semibold leading-relaxed">
                    {log.details}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PURGE CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isClearOpen}
        onClose={() => setIsClearOpen(false)}
        onConfirm={confirmPurge}
        title="Wipe Clean Database?"
        message="Are you sure you want to permanently clear your entire workspace setup? All Projects, test case parameters, developer directories, and checklist runs will be purged instantly."
      />

      {/* Restore Success modal */}
      {isSuccessOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsSuccessOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/30 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Workspace Restored</h3>
              <p className="text-xs text-slate-400 mt-1">
                Your backup ledger database configuration has been successfully parsed and loaded.
              </p>
            </div>
            <button
              onClick={() => setIsSuccessOpen(false)}
              className="px-5 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
            >
              Excellent
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
