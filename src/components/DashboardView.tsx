/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  FolderGit2,
  Layers,
  Code,
  ShieldCheck,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Bug,
  Activity,
  History,
  TrendingUp,
  Circle
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const {
    stats,
    auditLogs,
    bugs,
    executions,
    projects,
    modules,
    testCases,
    developers,
    qaEngineers,
    setTestCaseFilter,
    setBugFilter
  } = useApp();

  const [selectedProjectId, setSelectedProjectId] = React.useState<string>('');
  const [selectedModuleId, setSelectedModuleId] = React.useState<string>('');

  const filteredModulesList = React.useMemo(() => {
    return selectedProjectId
      ? modules.filter(m => m.projectId === selectedProjectId)
      : modules;
  }, [selectedProjectId, modules]);

  React.useEffect(() => {
    if (selectedProjectId && selectedModuleId) {
      const exists = modules.some(m => m.id === selectedModuleId && m.projectId === selectedProjectId);
      if (!exists) {
        setSelectedModuleId('');
      }
    }
  }, [selectedProjectId, selectedModuleId, modules]);

  const dashboardStats = React.useMemo(() => {
    // Filter test cases
    let filteredTC = testCases;
    if (selectedProjectId) {
      filteredTC = filteredTC.filter(tc => tc.projectId === selectedProjectId);
    }
    if (selectedModuleId) {
      filteredTC = filteredTC.filter(tc => tc.moduleId === selectedModuleId);
    }

    // Filter executions
    let filteredExec = executions;
    if (selectedProjectId) {
      filteredExec = filteredExec.filter(e => e.projectId === selectedProjectId);
    }
    if (selectedModuleId) {
      filteredExec = filteredExec.filter(e => e.moduleId === selectedModuleId);
    }

    // Filter bugs
    let filteredBugs = bugs;
    if (selectedProjectId) {
      filteredBugs = filteredBugs.filter(b => b.projectId === selectedProjectId);
    }
    if (selectedModuleId) {
      filteredBugs = filteredBugs.filter(b => b.moduleId === selectedModuleId);
    }

    // Calculate metrics
    const testCasesCount = filteredTC.length;
    const passedCount = filteredTC.filter(tc => tc.lastExecutionStatus === 'passed').length;
    const failedCount = filteredTC.filter(tc => tc.lastExecutionStatus === 'failed').length;
    const blockedCount = filteredTC.filter(tc => tc.lastExecutionStatus === 'blocked').length;
    const retestCount = filteredTC.filter(tc => tc.lastExecutionStatus === 'retest').length;
    const executedCount = passedCount + failedCount + blockedCount + retestCount;
    const unexecutedCount = testCasesCount - executedCount;

    const openBugsCount = filteredBugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
    const closedBugsCount = filteredBugs.filter(b => b.status === 'closed' || b.status === 'rejected').length;

    // Severity counts
    const criticalBugs = filteredBugs.filter(b => b.severity === 'critical').length;
    const highBugs = filteredBugs.filter(b => b.severity === 'high').length;
    const mediumBugs = filteredBugs.filter(b => b.severity === 'medium').length;
    const lowBugs = filteredBugs.filter(b => b.severity === 'low').length;

    // Filter project counts
    let activeProjects = projects;
    if (selectedProjectId) {
      activeProjects = projects.filter(p => p.id === selectedProjectId);
    }

    const websiteProjectsCount = activeProjects.filter(p => {
      if (p.type === 'website') return true;
      if (p.type === 'mobile_app') return false;
      const searchStr = (p.name + ' ' + (p.description || '')).toLowerCase();
      return !searchStr.includes('mobile') && !searchStr.includes('app') && !searchStr.includes('android') && !searchStr.includes('ios');
    }).length;

    const mobileProjectsCount = activeProjects.filter(p => {
      if (p.type === 'mobile_app') return true;
      if (p.type === 'website') return false;
      const searchStr = (p.name + ' ' + (p.description || '')).toLowerCase();
      return searchStr.includes('mobile') || searchStr.includes('app') || searchStr.includes('android') || searchStr.includes('ios');
    }).length;

    const activeModules = selectedProjectId
      ? modules.filter(m => m.projectId === selectedProjectId)
      : modules;

    return {
      projectsCount: activeProjects.length,
      websiteProjectsCount,
      mobileProjectsCount,
      modulesCount: activeModules.length,
      testCasesCount,
      executedCount,
      passedCount,
      failedCount,
      blockedCount,
      retestCount,
      unexecutedCount,
      openBugsCount,
      closedBugsCount,
      criticalBugs,
      highBugs,
      mediumBugs,
      lowBugs,
      totalBugs: filteredBugs.length
    };
  }, [selectedProjectId, selectedModuleId, testCases, executions, bugs, projects, modules]);

  const primaryStats = [
    { label: 'Projects', value: dashboardStats.projectsCount || 0, icon: <FolderGit2 className="w-5 h-5 text-indigo-500" />, tab: 'projects', color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' },
    { label: 'Modules', value: dashboardStats.modulesCount, icon: <Layers className="w-5 h-5 text-sky-500" />, tab: 'modules', color: 'bg-sky-50 dark:bg-sky-950/20 text-sky-600' },
    { label: 'Developers', value: stats.developersCount, icon: <Code className="w-5 h-5 text-violet-500" />, tab: 'developers', color: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600' },
    { label: 'QA Engineers', value: stats.qaCount, icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, tab: 'qaengineers', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
  ];

  const executionStats = [
    { label: 'Test Cases', value: dashboardStats.testCasesCount, icon: <FileSpreadsheet className="w-4 h-4 text-slate-500" />, color: 'border-slate-200', filterVal: 'all' },
    { label: 'Executed', value: dashboardStats.executedCount, icon: <Activity className="w-4 h-4 text-blue-500" />, color: 'border-blue-200', filterVal: 'all' },
    { label: 'Unexecuted', value: dashboardStats.unexecutedCount || 0, icon: <Circle className="w-4 h-4 text-slate-400" />, color: 'border-slate-200', filterVal: 'unexecuted' },
    { label: 'Passed', value: dashboardStats.passedCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'border-emerald-200', filterVal: 'passed' },
    { label: 'Failed', value: dashboardStats.failedCount, icon: <XCircle className="w-4 h-4 text-rose-500" />, color: 'border-rose-200', filterVal: 'failed' },
    { label: 'Blocked', value: dashboardStats.blockedCount, icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, color: 'border-amber-200', filterVal: 'blocked' },
    { label: 'Retest', value: dashboardStats.retestCount, icon: <RotateCcw className="w-4 h-4 text-cyan-500" />, color: 'border-cyan-200', filterVal: 'retest' },
  ];

  const bugStats = [
    { label: 'Open Bugs', value: dashboardStats.openBugsCount, icon: <Bug className="w-4 h-4 text-red-500 animate-bounce" />, color: 'bg-red-50/50 dark:bg-red-950/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40', filterVal: 'open' },
    { label: 'Closed Bugs', value: dashboardStats.closedBugsCount, icon: <CheckCircle2 className="w-4 h-4 text-slate-500" />, color: 'bg-slate-50/50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800', filterVal: 'closed' }
  ];

  // Helper for rendering SVG execution donut chart
  const renderDonutChart = () => {
    const total = dashboardStats.passedCount + dashboardStats.failedCount + dashboardStats.blockedCount + dashboardStats.retestCount + (dashboardStats.unexecutedCount || 0);
    if (total === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <TrendingUp className="w-8 h-8 opacity-40 mb-1" />
          <p className="text-xs font-medium">No Data Available</p>
          <p className="text-[10px] mt-0.5">Execute some test cases to view charts.</p>
        </div>
      );
    }

    const segments = [
      { count: dashboardStats.passedCount, color: '#10b981', label: 'Passed' }, // emerald-500
      { count: dashboardStats.failedCount, color: '#f43f5e', label: 'Failed' }, // rose-500
      { count: dashboardStats.blockedCount, color: '#f59e0b', label: 'Blocked' }, // amber-500
      { count: dashboardStats.retestCount, color: '#06b6d4', label: 'Retest' }, // cyan-500
      { count: dashboardStats.unexecutedCount || 0, color: '#94a3b8', label: 'Unexecuted' }, // slate-400
    ];

    let accumulatedPercentage = 0;
    const r = 50;
    const cx = 80;
    const cy = 80;
    const circ = 2 * Math.PI * r;

    return (
      <div className="flex items-center gap-6 justify-center h-48">
        <svg width="160" height="160" className="transform -rotate-90">
          {segments.map((seg, idx) => {
            if (seg.count === 0) return null;
            const pct = (seg.count / total) * 100;
            const strokeDasharray = `${(pct / 100) * circ} ${circ}`;
            const strokeDashoffset = -((accumulatedPercentage / 100) * circ);
            accumulatedPercentage += pct;

            return (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={r}
                fill="transparent"
                stroke={seg.color}
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500 hover:stroke-[24]"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveTab('testcases')}
                title={`View ${seg.label} test cases`}
              />
            );
          })}
          {/* Donut Center */}
          <circle cx={cx} cy={cy} r="35" className="fill-white dark:fill-slate-900 cursor-pointer" onClick={() => setActiveTab('testcases')} />
        </svg>

        <div className="flex flex-col gap-2 text-left">
          {segments.map((seg, idx) => {
            if (seg.count === 0) return null;
            const pct = Math.round((seg.count / total) * 100);
            return (
              <div
                key={idx}
                className="flex items-center gap-2 cursor-pointer hover:underline text-slate-700 dark:text-slate-300"
                onClick={() => setActiveTab('testcases')}
                title={`View ${seg.label} test cases`}
              >
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-xs font-semibold">
                  {seg.label}: {seg.count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Helper for rendering Bug Priority breakdown
  const renderBugSeverityBreakdown = () => {
    const totalBugs = dashboardStats.totalBugs;
    if (totalBugs === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Bug className="w-8 h-8 opacity-40 mb-1" />
          <p className="text-xs font-medium">No Data Available</p>
          <p className="text-[10px] mt-0.5">Log bugs to view severity distribution.</p>
        </div>
      );
    }

    const items = [
      { label: 'Critical', count: dashboardStats.criticalBugs, color: 'bg-red-500' },
      { label: 'High', count: dashboardStats.highBugs, color: 'bg-orange-500' },
      { label: 'Medium', count: dashboardStats.mediumBugs, color: 'bg-yellow-500' },
      { label: 'Low', count: dashboardStats.lowBugs, color: 'bg-blue-500' }
    ];

    return (
      <div className="flex flex-col gap-4 justify-center h-48 px-2">
        {items.map((item, idx) => {
          const pct = Math.round((item.count / totalBugs) * 100) || 0;
          return (
            <div
              key={idx}
              className="flex flex-col gap-1.5 cursor-pointer group"
              onClick={() => setActiveTab('bugs')}
              title={`View ${item.label} bugs`}
            >
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  {item.label}
                </span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">
                  {item.count}
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden group-hover:shadow-xs transition-shadow">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className={`h-full rounded-full ${item.color}`}
                />
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* 1. Header Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 bg-linear-to-r from-indigo-50/50 to-sky-50/50 dark:from-slate-900/30 dark:to-indigo-950/10 border border-slate-150 dark:border-slate-800 rounded-2xl">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white font-sans tracking-tight">
            QA System Overview
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Dynamic analytics engine tracking test executions, active deployments, and bug resolutions in real-time.
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium text-slate-500 dark:text-slate-400 shadow-xs self-start sm:self-center">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          <span>Live Sync Enabled</span>
        </div>
      </div>

      {/* Dashboard Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xs">
        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            Filter by Project
          </label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-hidden"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1 min-w-[200px]">
          <label className="text-[10px] font-bold text-slate-450 dark:text-slate-500 uppercase tracking-wider">
            Filter by Module
          </label>
          <select
            value={selectedModuleId}
            onChange={(e) => setSelectedModuleId(e.target.value)}
            className="w-full text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-1 focus:ring-indigo-500 outline-hidden"
          >
            <option value="">All Modules</option>
            {filteredModulesList.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {(selectedProjectId || selectedModuleId) && (
          <button
            onClick={() => {
              setSelectedProjectId('');
              setSelectedModuleId('');
            }}
            className="self-end px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-850 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-semibold rounded-xl transition-all cursor-pointer h-[34px] flex items-center justify-center border border-slate-200 dark:border-slate-800"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* 2. Top level Core Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {primaryStats.map((stat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(stat.tab)}
            className="group flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-850 hover:shadow-md transition-all text-left duration-200 relative cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] sm:text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-sans truncate pr-1">
                {stat.label}
              </span>
              <div className={`p-2 rounded-xl transition-transform group-hover:scale-110 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-850 dark:text-white font-mono mt-4">
              {stat.value}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
              Click to manage
            </span>
          </button>
        ))}
      </div>

      {/* 3. Execution & Bug stats summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Executions Grid */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setActiveTab('testcases')}>
            <Activity className="w-4 h-4 text-indigo-500 animate-pulse" />
            <span>Test Case Execution Summary</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {executionStats.map((stat, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTestCaseFilter(stat.filterVal);
                  setActiveTab('testcases');
                }}
                className="group p-4 border rounded-xl flex flex-col bg-slate-50/20 dark:bg-slate-950/10 border-slate-150 dark:border-slate-850 hover:border-indigo-400 dark:hover:border-indigo-800/80 hover:bg-white dark:hover:bg-slate-900/60 transition-all text-left duration-150 cursor-pointer active:scale-[0.97] hover:shadow-xs"
              >
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-450">
                  {stat.icon}
                  <span className="text-xs font-medium group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{stat.label}</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-3 group-hover:scale-105 transition-transform origin-left">
                  {stat.value}
                </span>
                <span className="text-[9px] text-slate-400 dark:text-slate-550 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  Click to view
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Bugs Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setActiveTab('bugs')}>
              <Bug className="w-4 h-4 text-indigo-500" />
              <span>Defect Registry Summary</span>
            </h3>
            <div className="space-y-3">
              {bugStats.map((stat, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setBugFilter(stat.filterVal);
                    setActiveTab('bugs');
                  }}
                  className={`group w-full p-4 border rounded-xl flex items-center justify-between transition-all duration-150 cursor-pointer active:scale-[0.97] hover:shadow-xs ${stat.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    {stat.icon}
                    <span className="text-xs font-bold group-hover:underline">{stat.label}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono leading-none group-hover:scale-105 transition-transform">
                    {stat.value}
                  </span>
                </button>
              ))}
            </div>
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-4 leading-normal">
            Bugs are synchronized with developer assignments. Deleting dev with open bugs is blocked.
          </div>
        </div>
      </div>

      {/* 4. Charts Bento Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Test Cases Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-4">
            Execution Status Distribution
          </h3>
          {renderDonutChart()}
        </div>

        {/* Bug Severity Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider mb-4">
            Defect Severity Breakdown
          </h3>
          {renderBugSeverityBreakdown()}
        </div>
      </div>

      {/* 5. Recent Activity Logs */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-250 uppercase tracking-wider flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-500" />
            <span>Recent System Activity</span>
          </h3>
          {auditLogs.length > 0 && (
            <button
              onClick={() => setActiveTab('auditlogs')}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold hover:underline cursor-pointer"
            >
              View Full Audit Logs
            </button>
          )}
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-8 text-slate-400 dark:text-slate-500 text-xs">
            No system activity logged yet. Perform CRUD actions to automatically trigger audit logs.
          </div>
        ) : (
          <div className="space-y-3.5">
            {auditLogs.slice(0, 4).map((log, idx) => (
              <div
                key={log.id}
                className="flex items-center justify-between text-xs p-3 bg-slate-50/50 dark:bg-slate-950/20 border border-slate-100 dark:border-slate-850 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    log.action === 'CREATE' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                    log.action === 'UPDATE' ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400' :
                    'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400'
                  }`}>
                    {log.action}
                  </span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {log.entityType} ({log.entityId}):
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 truncate max-w-sm sm:max-w-lg">
                    {log.details}
                  </span>
                </div>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
