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
  TrendingUp
} from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardViewProps {
  setActiveTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({ setActiveTab }) => {
  const { stats, auditLogs, bugs, executions } = useApp();

  const primaryStats = [
    { label: 'Projects', value: stats.projectsCount, icon: <FolderGit2 className="w-5 h-5 text-indigo-500" />, tab: 'projects', color: 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600' },
    { label: 'Modules', value: stats.modulesCount, icon: <Layers className="w-5 h-5 text-sky-500" />, tab: 'modules', color: 'bg-sky-50 dark:bg-sky-950/20 text-sky-600' },
    { label: 'Developers', value: stats.developersCount, icon: <Code className="w-5 h-5 text-violet-500" />, tab: 'developers', color: 'bg-violet-50 dark:bg-violet-950/20 text-violet-600' },
    { label: 'QA Engineers', value: stats.qaCount, icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />, tab: 'qaengineers', color: 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600' },
  ];

  const executionStats = [
    { label: 'Test Cases', value: stats.testCasesCount, icon: <FileSpreadsheet className="w-4 h-4 text-slate-500" />, color: 'border-slate-200' },
    { label: 'Executed', value: stats.executedCount, icon: <Activity className="w-4 h-4 text-blue-500" />, color: 'border-blue-200' },
    { label: 'Passed', value: stats.passedCount, icon: <CheckCircle2 className="w-4 h-4 text-emerald-500" />, color: 'border-emerald-200' },
    { label: 'Failed', value: stats.failedCount, icon: <XCircle className="w-4 h-4 text-rose-500" />, color: 'border-rose-200' },
    { label: 'Blocked', value: stats.blockedCount, icon: <AlertTriangle className="w-4 h-4 text-amber-500" />, color: 'border-amber-200' },
    { label: 'Retest', value: stats.retestCount, icon: <RotateCcw className="w-4 h-4 text-cyan-500" />, color: 'border-cyan-200' },
  ];

  const bugStats = [
    { label: 'Open Bugs', value: stats.openBugsCount, icon: <Bug className="w-4 h-4 text-red-500 animate-bounce" />, color: 'bg-red-50/50 dark:bg-red-950/10 text-red-700 dark:text-red-400 border-red-100 dark:border-red-900/40' },
    { label: 'Closed Bugs', value: stats.closedBugsCount, icon: <CheckCircle2 className="w-4 h-4 text-slate-500" />, color: 'bg-slate-50/50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-100 dark:border-slate-800' }
  ];

  // Helper for rendering SVG execution donut chart
  const renderDonutChart = () => {
    const total = stats.passedCount + stats.failedCount + stats.blockedCount + stats.retestCount;
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
      { count: stats.passedCount, color: '#10b981', label: 'Passed' }, // emerald-500
      { count: stats.failedCount, color: '#f43f5e', label: 'Failed' }, // rose-500
      { count: stats.blockedCount, color: '#f59e0b', label: 'Blocked' }, // amber-500
      { count: stats.retestCount, color: '#06b6d4', label: 'Retest' }, // cyan-500
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
              />
            );
          })}
          {/* Donut Center */}
          <circle cx={cx} cy={cy} r="35" className="fill-white dark:fill-slate-900" />
        </svg>

        <div className="flex flex-col gap-2 text-left">
          {segments.map((seg, idx) => {
            if (seg.count === 0) return null;
            const pct = Math.round((seg.count / total) * 100);
            return (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
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
    const totalBugs = bugs.length;
    if (totalBugs === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-48 text-center text-slate-400 dark:text-slate-500 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
          <Bug className="w-8 h-8 opacity-40 mb-1" />
          <p className="text-xs font-medium">No Data Available</p>
          <p className="text-[10px] mt-0.5">Log bugs to view severity distribution.</p>
        </div>
      );
    }

    const critical = bugs.filter(b => b.severity === 'critical').length;
    const high = bugs.filter(b => b.severity === 'high').length;
    const medium = bugs.filter(b => b.severity === 'medium').length;
    const low = bugs.filter(b => b.severity === 'low').length;

    const items = [
      { label: 'Critical', count: critical, color: 'bg-red-500' },
      { label: 'High', count: high, color: 'bg-orange-500' },
      { label: 'Medium', count: medium, color: 'bg-yellow-500' },
      { label: 'Low', count: low, color: 'bg-blue-500' }
    ];

    return (
      <div className="flex flex-col gap-4 justify-center h-48 px-2">
        {items.map((item, idx) => {
          const pct = Math.round((item.count / totalBugs) * 100) || 0;
          return (
            <div key={idx} className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-slate-600 dark:text-slate-400">{item.label}</span>
                <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">{item.count}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
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

      {/* 2. Top level Core Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {primaryStats.map((stat, idx) => (
          <button
            key={idx}
            onClick={() => setActiveTab(stat.tab)}
            className="group flex flex-col p-5 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl hover:border-indigo-400 dark:hover:border-indigo-850 hover:shadow-md transition-all text-left duration-200 relative cursor-pointer active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-450 dark:text-slate-400 uppercase tracking-wider font-sans">
                {stat.label}
              </span>
              <div className={`p-2.5 rounded-xl transition-transform group-hover:scale-110 ${stat.color}`}>
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
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            <span>Test Case Execution Summary</span>
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {executionStats.map((stat, idx) => (
              <div
                key={idx}
                className={`p-4 border rounded-xl flex flex-col bg-slate-50/20 dark:bg-slate-950/10 border-slate-150 dark:border-slate-800`}
              >
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-450">
                  {stat.icon}
                  <span className="text-xs font-medium">{stat.label}</span>
                </div>
                <span className="text-xl sm:text-2xl font-bold font-mono text-slate-800 dark:text-slate-100 mt-3">
                  {stat.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Bugs Grid */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Bug className="w-4 h-4 text-indigo-500" />
              <span>Defect Registry Summary</span>
            </h3>
            <div className="space-y-3">
              {bugStats.map((stat, idx) => (
                <div
                  key={idx}
                  className={`p-4 border rounded-xl flex items-center justify-between ${stat.color}`}
                >
                  <div className="flex items-center gap-2.5">
                    {stat.icon}
                    <span className="text-xs font-semibold">{stat.label}</span>
                  </div>
                  <span className="text-xl sm:text-2xl font-extrabold font-mono leading-none">
                    {stat.value}
                  </span>
                </div>
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
