/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { EmptyState } from './EmptyState';
import { ScrollText, Search, Clock, ShieldAlert } from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { auditLogs } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  // Parse list of unique actions for dropdown filter
  const actionTypes = Array.from(new Set(auditLogs.map(log => log.action)));

  // Filters
  const filteredLogs = auditLogs.filter(log => {
    const matchesSearch = log.details.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          log.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    return matchesSearch && matchesAction;
  });

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
          />
        </div>

        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
        >
          <option value="all">All Action Types</option>
          {actionTypes.map(act => (
            <option key={act} value={act}>{act}</option>
          ))}
        </select>
      </div>

      {/* Timeline view */}
      {filteredLogs.length === 0 ? (
        <EmptyState
          icon={<ScrollText className="w-10 h-10" />}
          title="Audit Ledger is Empty"
          description={
            searchQuery || actionFilter !== 'all'
              ? "No recorded events match your active search filters."
              : "Perform workspace operations like creating projects, writing requirements, or logging test executions to generate audit history."
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-6 shadow-xs max-h-[70vh] overflow-y-auto custom-scrollbar animate-fade-in">
          <div className="relative border-l border-indigo-100 dark:border-slate-800 pl-6 ml-3 space-y-6">
            {[...filteredLogs].reverse().map(log => (
              <div key={log.id} className="relative group">
                {/* Visual marker dot on timeline */}
                <span className="absolute -left-[31px] top-1 w-2.5 h-2.5 rounded-full bg-indigo-500 border border-white dark:border-slate-900 ring-4 ring-indigo-50/50 dark:ring-indigo-950/20 group-hover:scale-125 transition-transform" />
                
                <div className="space-y-1.5">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 font-mono font-bold text-[10px] uppercase">
                      {log.action}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-slate-750 dark:text-slate-200">
                    {log.details}
                  </p>
                  <p className="text-[9px] text-slate-400 font-mono">
                    Transaction ID: {log.id}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
