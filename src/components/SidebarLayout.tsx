/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  FolderGit2,
  Layers,
  ClipboardCheck,
  FileSpreadsheet,
  Bug,
  Code,
  ShieldCheck,
  Rocket,
  BarChart3,
  ScrollText,
  Settings,
  Bell,
  Sun,
  Moon,
  Menu,
  X,
  User,
  Info,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Database,
  Download,
  ChevronDown,
  FileCode as FileJson
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { AppNotification } from '../types';
import {
  exportProjectsToCSV,
  exportModulesToCSV,
  exportRequirementsToCSV,
  exportTestCasesToCSV,
  exportTestExecutionsToCSV,
  exportBugsToCSV,
  exportDevelopersToCSV,
  exportQaEngineersToCSV,
  exportReleasesToCSV,
  exportAuditLogsToCSV,
  exportToJSON
} from '../utils/exportUtils';

interface SidebarLayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const SidebarLayout: React.FC<SidebarLayoutProps> = ({
  children,
  activeTab,
  setActiveTab
}) => {
  const { notifications, settings, updateSettings, markNotificationsAsRead, clearNotifications } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  const {
    projects,
    modules,
    requirements,
    testCases,
    executions,
    bugs,
    developers,
    qaEngineers,
    releases,
    auditLogs,
    exportData,
    addNotification,
    stats
  } = useApp();

  const getExportPageName = () => {
    switch (activeTab) {
      case 'dashboard': return 'Dashboard';
      case 'projects': return 'Projects';
      case 'modules': return 'Modules';
      case 'requirements': return 'Requirements';
      case 'testcases': return 'Test Cases';
      case 'bugs': return 'Bugs';
      case 'developers': return 'Developers';
      case 'qaengineers': return 'QA Engineers';
      case 'releases': return 'Releases';
      case 'reports': return 'Reports';
      case 'auditlogs': return 'Audit Logs';
      case 'settings': return 'Settings';
      default: return 'Active View';
    }
  };

  const hasExportablePageData = () => {
    switch (activeTab) {
      case 'projects': return projects.length > 0;
      case 'modules': return modules.length > 0;
      case 'requirements': return requirements.length > 0;
      case 'testcases': return testCases.length > 0;
      case 'bugs': return bugs.length > 0;
      case 'developers': return developers.length > 0;
      case 'qaengineers': return qaEngineers.length > 0;
      case 'releases': return releases.length > 0;
      case 'auditlogs': return auditLogs.length > 0;
      case 'dashboard':
      case 'reports':
      case 'settings':
        return true;
      default:
        return false;
    }
  };

  const handleExportPageCSV = () => {
    try {
      switch (activeTab) {
        case 'projects':
          exportProjectsToCSV(projects);
          break;
        case 'modules':
          exportModulesToCSV(modules);
          break;
        case 'requirements':
          exportRequirementsToCSV(requirements);
          break;
        case 'testcases':
          exportTestCasesToCSV(testCases);
          break;
        case 'bugs':
          exportBugsToCSV(bugs);
          break;
        case 'developers':
          exportDevelopersToCSV(developers);
          break;
        case 'qaengineers':
          exportQaEngineersToCSV(qaEngineers);
          break;
        case 'releases':
          exportReleasesToCSV(releases);
          break;
        case 'auditlogs':
          exportAuditLogsToCSV(auditLogs);
          break;
        case 'dashboard':
        case 'reports':
        case 'settings':
          handleExportPageJSON();
          return;
        default:
          addNotification('Export Failed', 'This page does not have a tabular structure for CSV.', 'warning');
          return;
      }
      addNotification('Export Success', `Successfully exported ${getExportPageName()} to CSV.`, 'success');
    } catch (err: any) {
      addNotification('Export Failed', err.message || 'An error occurred during CSV export.', 'error');
    }
  };

  const handleExportSecondaryCSV = () => {
    if (activeTab === 'testcases') {
      try {
        exportTestExecutionsToCSV(executions);
        addNotification('Export Success', 'Successfully exported Test Executions to CSV.', 'success');
      } catch (err: any) {
        addNotification('Export Failed', err.message || 'An error occurred during CSV export.', 'error');
      }
    }
  };

  const handleExportPageJSON = () => {
    try {
      let data: any = null;
      let filename = 'export.json';

      switch (activeTab) {
        case 'projects':
          data = projects;
          filename = 'projects_export.json';
          break;
        case 'modules':
          data = modules;
          filename = 'modules_export.json';
          break;
        case 'requirements':
          data = requirements;
          filename = 'requirements_export.json';
          break;
        case 'testcases':
          data = { testCases, executions };
          filename = 'testcases_and_executions_export.json';
          break;
        case 'bugs':
          data = bugs;
          filename = 'bugs_export.json';
          break;
        case 'developers':
          data = developers;
          filename = 'developers_export.json';
          break;
        case 'qaengineers':
          data = qaEngineers;
          filename = 'qa_engineers_export.json';
          break;
        case 'releases':
          data = releases;
          filename = 'releases_export.json';
          break;
        case 'auditlogs':
          data = auditLogs;
          filename = 'audit_logs_export.json';
          break;
        case 'dashboard':
          data = { stats };
          filename = 'dashboard_stats_export.json';
          break;
        case 'reports':
          data = { stats, projects, testCases, executions, bugs };
          filename = 'reports_data_export.json';
          break;
        case 'settings':
          data = settings;
          filename = 'settings_export.json';
          break;
        default:
          addNotification('Export Failed', 'No data found for the current page.', 'warning');
          return;
      }

      exportToJSON(data, filename);
      addNotification('Export Success', `Successfully exported ${getExportPageName()} to JSON.`, 'success');
    } catch (err: any) {
      addNotification('Export Failed', err.message || 'An error occurred during JSON export.', 'error');
    }
  };

  const handleExportFullState = () => {
    try {
      const fullStateStr = exportData();
      const blob = new Blob([fullStateStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", url);
      downloadAnchor.setAttribute("download", "qa_test_management_backup.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      document.body.removeChild(downloadAnchor);
      URL.revokeObjectURL(url);
      addNotification('Backup Exported', 'Full database JSON backup has been downloaded.', 'success');
    } catch (err: any) {
      addNotification('Backup Export Failed', err.message || 'An error occurred during database backup.', 'error');
    }
  };

  // Apply dark mode on mount / change
  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  // Apply custom typography and color variables dynamically
  useEffect(() => {
    const root = document.documentElement;
    
    // Font Families Mapping
    const fonts = {
      sans: '"Inter", ui-sans-serif, system-ui, sans-serif',
      display: '"Space Grotesk", sans-serif',
      mono: '"JetBrains Mono", ui-monospace, SFMono-Regular, monospace',
      outfit: '"Outfit", sans-serif',
      serif: '"Playfair Display", serif'
    };
    
    const selectedFont = fonts[settings.fontFamily || 'sans'] || fonts.sans;
    root.style.setProperty('--app-font-sans', selectedFont);
    root.style.setProperty('--app-font-display', selectedFont);

    // Primary Colors Mapping
    const colors = {
      indigo: { 50: '#eef2ff', 100: '#e0e7ff', 400: '#818cf8', 500: '#6366f1', 600: '#4f46e5', 700: '#4338ca', 800: '#3730a3', 950: '#0f0f29' },
      emerald: { 50: '#f0fdf4', 100: '#dcfce7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46', 950: '#022c22' },
      blue: { 50: '#f0f9ff', 100: '#e0f2fe', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 950: '#0a1128' },
      amber: { 50: '#fffbeb', 100: '#fef3c7', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 950: '#2d1502' },
      rose: { 50: '#fff1f2', 100: '#ffe4e6', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 950: '#2a0510' },
      violet: { 50: '#faf5ff', 100: '#f3e8ff', 400: '#c084fc', 500: '#a855f7', 600: '#9333ea', 700: '#7e22ce', 800: '#6b21a8', 950: '#1a0731' },
      slate: { 50: '#f8fafc', 100: '#f1f5f9', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 700: '#334155', 800: '#1e293b', 950: '#0f172a' },
      teal: { 50: '#f0fdfa', 100: '#ccfbf1', 400: '#2dd4bf', 500: '#14b8a6', 600: '#0d9488', 700: '#0f766e', 800: '#115e59', 950: '#042f2e' },
      orange: { 50: '#fff7ed', 100: '#ffedd5', 400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c', 800: '#9a3412', 950: '#431407' },
      fuchsia: { 50: '#fdf4ff', 100: '#fae8ff', 400: '#e879f9', 500: '#d946ef', 600: '#c026d3', 700: '#a21caf', 800: '#86198f', 950: '#4a044e' },
      nordic: { 50: '#f0f5fa', 100: '#e1ecf7', 400: '#78a3d4', 500: '#4b7eb3', 600: '#376192', 700: '#2a4b73', 800: '#1e3552', 950: '#0a121e' },
      obsidian: { 50: '#fafaf9', 100: '#f5f5f4', 400: '#d9bc82', 500: '#cca352', 600: '#b28a38', 700: '#8c6b24', 800: '#614917', 950: '#1c1507' }
    };
    
    const selectedColorSet = colors[settings.primaryColor || 'indigo'] || colors.indigo;
    
    root.style.setProperty('--app-color-50', selectedColorSet[50]);
    root.style.setProperty('--app-color-100', selectedColorSet[100]);
    root.style.setProperty('--app-color-400', selectedColorSet[400]);
    root.style.setProperty('--app-color-500', selectedColorSet[500]);
    root.style.setProperty('--app-color-600', selectedColorSet[600]);
    root.style.setProperty('--app-color-700', selectedColorSet[700]);
    root.style.setProperty('--app-color-800', selectedColorSet[800]);
    root.style.setProperty('--app-color-950', selectedColorSet[950]);

    // Border Styles Dynamic Overrides
    const borderStyle = settings.borderStyle || 'lite';
    if (borderStyle === 'lite') {
      root.style.setProperty('--border-100', '#f8fafc');
      root.style.setProperty('--border-150', '#f8fafc');
      root.style.setProperty('--border-200', '#f1f5f9');
      root.style.setProperty('--border-250', '#f1f5f9');
      root.style.setProperty('--border-300', '#e2e8f0');
      root.style.setProperty('--border-350', '#e2e8f0');
      root.style.setProperty('--border-800', '#1e293b');
      root.style.setProperty('--border-850', '#1e293b');
      root.style.setProperty('--border-900', '#0f172a');
    } else if (borderStyle === 'accent') {
      root.style.setProperty('--border-100', selectedColorSet[50]);
      root.style.setProperty('--border-150', selectedColorSet[50]);
      root.style.setProperty('--border-200', selectedColorSet[100]);
      root.style.setProperty('--border-250', selectedColorSet[100]);
      root.style.setProperty('--border-300', selectedColorSet[400]);
      root.style.setProperty('--border-350', selectedColorSet[400]);
      root.style.setProperty('--border-800', selectedColorSet[800]);
      root.style.setProperty('--border-850', selectedColorSet[800]);
      root.style.setProperty('--border-900', selectedColorSet[950]);
    } else if (borderStyle === 'none') {
      root.style.setProperty('--border-100', 'transparent');
      root.style.setProperty('--border-150', 'transparent');
      root.style.setProperty('--border-200', 'transparent');
      root.style.setProperty('--border-250', 'transparent');
      root.style.setProperty('--border-300', 'transparent');
      root.style.setProperty('--border-350', 'transparent');
      root.style.setProperty('--border-800', 'transparent');
      root.style.setProperty('--border-850', 'transparent');
      root.style.setProperty('--border-900', 'transparent');
    } else if (borderStyle === 'thick') {
      root.style.setProperty('--border-100', '#e2e8f0');
      root.style.setProperty('--border-150', '#e2e8f0');
      root.style.setProperty('--border-200', '#cbd5e1');
      root.style.setProperty('--border-250', '#cbd5e1');
      root.style.setProperty('--border-300', '#94a3b8');
      root.style.setProperty('--border-350', '#94a3b8');
      root.style.setProperty('--border-800', '#475569');
      root.style.setProperty('--border-850', '#475569');
      root.style.setProperty('--border-900', '#334155');
    } else {
      // Classic professional
      root.style.setProperty('--border-100', '#f1f5f9');
      root.style.setProperty('--border-150', '#f1f5f9');
      root.style.setProperty('--border-200', '#e2e8f0');
      root.style.setProperty('--border-250', '#e2e8f0');
      root.style.setProperty('--border-300', '#cbd5e1');
      root.style.setProperty('--border-350', '#cbd5e1');
      root.style.setProperty('--border-800', '#334155');
      root.style.setProperty('--border-850', '#334155');
      root.style.setProperty('--border-900', '#1e293b');
    }
  }, [settings.fontFamily, settings.primaryColor, settings.borderStyle]);

  const toggleTheme = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'projects', name: 'Projects', icon: <FolderGit2 className="w-5 h-5" /> },
    { id: 'modules', name: 'Modules', icon: <Layers className="w-5 h-5" /> },
    { id: 'requirements', name: 'Requirements', icon: <ClipboardCheck className="w-5 h-5" /> },
    { id: 'testcases', name: 'Test Cases & Executions', icon: <FileSpreadsheet className="w-5 h-5" /> },
    { id: 'bugs', name: 'Bug Tracker', icon: <Bug className="w-5 h-5" /> },
    { id: 'developers', name: 'Developer Management', icon: <Code className="w-5 h-5" /> },
    { id: 'qaengineers', name: 'QA Engineer Management', icon: <ShieldCheck className="w-5 h-5" /> },
    { id: 'releases', name: 'Release Management', icon: <Rocket className="w-5 h-5" /> },
    { id: 'reports', name: 'Reports', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'auditlogs', name: 'Audit Logs', icon: <ScrollText className="w-5 h-5" /> },
    { id: 'profile', name: 'Profile', icon: <User className="w-5 h-5" /> },
    { id: 'settings', name: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotifIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-rose-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-200 border-style-${settings.borderStyle || 'lite'}`}>
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden lg:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 sticky top-0 h-screen z-20">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100 dark:border-slate-800 gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m18.236 0a11.955 11.955 0 00-3.835-2.944M12 3v1m0 16v1m9-9h-1M3 12H2m15.357-6.357l-.707.707M6.343 17.657l-.707.707M6.343 6.343l-.707-.707m12.714 12.714l-.707-.707" />
            </svg>
          </div>
          <span className="font-bold text-lg tracking-tight text-slate-900 dark:text-white font-sans">{settings.websiteName || 'TestEngine'}</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors duration-150 cursor-pointer ${
                activeTab === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-slate-650 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.icon}
              </div>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </nav>

        {/* User Info Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-inner uppercase shrink-0">
              {settings.userName.substring(0, 2)}
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-200 truncate leading-none">
                {settings.userName}
              </p>
              <p className="text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1" style={{ fontSize: '9px' }}>
                Enterprise License
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MOBILE MENU BACKDROP */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* SIDEBAR - MOBILE DRAWER */}
      <aside
        className={`fixed inset-y-0 left-0 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 transform transition-transform duration-350 ease-out lg:hidden flex flex-col ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-sm">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04m18.236 0a11.955 11.955 0 00-3.835-2.944M12 3v1m0 16v1m9-9h-1M3 12H2m15.357-6.357l-.707.707M6.343 17.657l-.707.707M6.343 6.343l-.707-.707m12.714 12.714l-.707-.707" />
              </svg>
            </div>
            <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white font-sans">
              {settings.websiteName || 'TestEngine'}
            </span>
          </div>
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {menuItems.map(item => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                setIsMobileMenuOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                activeTab === item.id
                  ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-850'
              }`}
            >
              <div className={`${activeTab === item.id ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`}>
                {item.icon}
              </div>
              <span className="truncate">{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-8.5 h-8.5 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-inner uppercase shrink-0">
              {settings.userName.substring(0, 2)}
            </div>
            <div className="text-xs min-w-0">
              <p className="font-semibold text-slate-900 dark:text-slate-200 truncate leading-none">
                {settings.userName}
              </p>
              <p className="text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1" style={{ fontSize: '9px' }}>
                Enterprise License
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* MAIN CONTAINER */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* STICKY HEADER */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-6 sm:px-8 sticky top-0 z-10 shadow-sm">
          {/* Left Side: Mobile Toggle & Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-xl lg:hidden transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
              {menuItems.find(item => item.id === activeTab)?.name}
            </h1>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2.5 sm:gap-4 relative">
            {/* Export Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsExportOpen(!isExportOpen)}
                className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer text-xs font-semibold ${
                  isExportOpen ? 'bg-slate-100 dark:bg-slate-850' : ''
                }`}
                title="Export options"
              >
                <Download className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Export</span>
                <ChevronDown className="w-3 h-3 opacity-60" />
              </button>

              {isExportOpen && (
                <>
                  <div
                    onClick={() => setIsExportOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-2.5 w-64 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 transform origin-top-right transition-all">
                    {/* Header */}
                    <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20">
                      <span className="font-bold text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                        Page: {getExportPageName()}
                      </span>
                    </div>

                    {/* Options list */}
                    <div className="p-1.5 space-y-0.5">
                      {hasExportablePageData() ? (
                        <>
                          <button
                            onClick={() => {
                              handleExportPageCSV();
                              setIsExportOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
                          >
                            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
                            <span>Export Page as CSV</span>
                          </button>
                          <button
                            onClick={() => {
                              handleExportPageJSON();
                              setIsExportOpen(false);
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer"
                          >
                            <FileJson className="w-4 h-4 text-indigo-500" />
                            <span>Export Page as JSON</span>
                          </button>
                          {activeTab === 'testcases' && (
                            <button
                              onClick={() => {
                                handleExportSecondaryCSV();
                                setIsExportOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer border-t border-slate-100 dark:border-slate-800 mt-1 pt-1.5"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-teal-500" />
                              <span>Export Executions CSV</span>
                            </button>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-2.5 text-xs text-slate-400 dark:text-slate-500 italic text-center">
                          No page-specific data to export
                        </div>
                      )}

                      <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

                      <button
                        onClick={() => {
                          handleExportFullState();
                          setIsExportOpen(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-850 rounded-xl transition-colors cursor-pointer font-semibold"
                      >
                        <Database className="w-4 h-4 text-violet-500" />
                        <span>Export Full System Backup</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              title="Toggle Theme"
              className="p-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all active:scale-[0.98] cursor-pointer"
            >
              {settings.theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-500" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  if (!isNotifOpen) markNotificationsAsRead();
                }}
                className={`p-2.5 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-550 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl transition-all active:scale-[0.98] relative cursor-pointer ${
                  isNotifOpen ? 'bg-slate-100 dark:bg-slate-850' : ''
                }`}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-[10px] font-bold text-white flex items-center justify-center rounded-full animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown Panel */}
              {isNotifOpen && (
                <>
                  <div
                    onClick={() => setIsNotifOpen(false)}
                    className="fixed inset-0 z-40"
                  />
                  <div className="absolute right-0 mt-2.5 w-80 max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 transform origin-top-right transition-all">
                    {/* Panel Header */}
                    <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 flex items-center justify-between">
                      <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                        Notifications
                      </span>
                      {notifications.length > 0 && (
                        <button
                          onClick={clearNotifications}
                          className="text-xs text-rose-600 hover:text-rose-700 font-medium hover:underline"
                        >
                          Clear All
                        </button>
                      )}
                    </div>

                    {/* Panel Body */}
                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
                      {notifications.length === 0 ? (
                        <div className="p-8 text-center text-slate-400 dark:text-slate-500">
                          <Bell className="w-8 h-8 mx-auto mb-2 opacity-40 animate-pulse" />
                          <p className="text-xs font-medium">No Notifications</p>
                          <p className="text-[10px] mt-1">System is fully quiet.</p>
                        </div>
                      ) : (
                        notifications.map(notif => (
                          <div
                            key={notif.id}
                            className={`p-3.5 flex gap-3 text-left transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 ${
                              !notif.read ? 'bg-indigo-50/20 dark:bg-indigo-950/10' : ''
                            }`}
                          >
                            <div className="mt-0.5 shrink-0">
                              {getNotifIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 dark:text-slate-250 leading-tight">
                                {notif.title}
                              </p>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-snug">
                                {notif.message}
                              </p>
                              <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-1.5 font-mono">
                                {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Quick Profile Badge */}
            <div className="hidden sm:flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
              <div className="w-8.5 h-8.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shadow-xs border border-indigo-100 dark:border-indigo-900/40 uppercase">
                {settings.userName.substring(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* WORKSPACE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-8 bg-slate-50 dark:bg-slate-950 custom-scrollbar">
          {children}
        </main>

        {/* STATUS FOOTER */}
        <footer className="h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[10px] uppercase tracking-widest px-6 sm:px-8 flex items-center justify-between shrink-0 font-sans select-none">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>System Online</span>
            </span>
            <span className="hidden sm:inline text-slate-300 dark:text-slate-700">|</span>
            <span className="hidden sm:inline">
              Storage: {(() => {
                try {
                  let totalBytes = 0;
                  for (let x in localStorage) {
                    if (localStorage.hasOwnProperty(x)) {
                      totalBytes += (localStorage[x]?.length || 0) * 2;
                    }
                  }
                  return `${(totalBytes / 1024).toFixed(1)} KB`;
                } catch (e) {
                  return '0.0 KB';
                }
              })()} / 10 GB
            </span>
          </div>
          <div>Enterprise QA Management Suite v1.0.0</div>
        </footer>
      </div>
    </div>
  );
};
