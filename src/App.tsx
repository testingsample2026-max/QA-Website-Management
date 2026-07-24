/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { SidebarLayout } from './components/SidebarLayout';
import { DashboardView } from './components/DashboardView';
import { ProjectsView } from './components/ProjectsView';
import { ModulesView } from './components/ModulesView';
import { RequirementsView } from './components/RequirementsView';
import { TestCasesView } from './components/TestCasesView';
import { BugsView } from './components/BugsView';
import { PeopleView } from './components/PeopleView';
import { ReleasesView } from './components/ReleasesView';
import { SuggestionsView } from './components/SuggestionsView';
import { ReportsView } from './components/ReportsView';
import { AuditLogsView } from './components/AuditLogsView';
import { SettingsView } from './components/SettingsView';
import { ProfileView } from './components/ProfileView';

function AppContent() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('activeTab') || 'dashboard';
  });
  const { loading } = useApp();

  useEffect(() => {
    localStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} />;
      case 'projects':
        return <ProjectsView />;
      case 'modules':
        return <ModulesView />;
      case 'requirements':
        return <RequirementsView />;
      case 'testcases':
        return <TestCasesView />;
      case 'bugs':
        return <BugsView />;
      case 'developers':
        return <PeopleView defaultSection="devs" />;
      case 'qaengineers':
        return <PeopleView defaultSection="qas" />;
      case 'releases':
        return <ReleasesView />;
      case 'suggestions':
        return <SuggestionsView />;
      case 'reports':
        return <ReportsView />;
      case 'auditlogs':
        return <AuditLogsView />;
      case 'profile':
        return <ProfileView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView setActiveTab={setActiveTab} />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-850 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-500/20 border-t-teal-500 rounded-full animate-spin"></div>
          <p className="text-sm font-semibold tracking-wide animate-pulse text-slate-500 dark:text-slate-400">
            Connecting to Firebase Database...
          </p>
        </div>
      </div>
    );
  }

  return (
    <SidebarLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderActiveView()}
    </SidebarLayout>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
