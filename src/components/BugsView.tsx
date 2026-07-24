/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Bug } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Bug as BugIcon,
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  User,
  ShieldCheck,
  FileSpreadsheet,
  Layers,
  Activity,
  AlertTriangle,
  Play,
  Eye
} from 'lucide-react';
import { ROLE_LABELS } from './PeopleView';

export const BugsView: React.FC = () => {
  const {
    bugs,
    projects,
    modules,
    testCases,
    developers,
    qaEngineers,
    addBug,
    updateBug,
    deleteBug,
    bulkUpdate,
    bulkDelete,
    addNotification,
    bugFilter,
    setBugFilter
  } = useApp();

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (bugFilter && bugFilter !== 'all') {
      setStatusFilter(bugFilter);
      setBugFilter('all');
    }
  }, [bugFilter, setBugFilter]);

  const [sortBy, setSortBy] = useState<'title' | 'id' | 'severity'>('id');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc'); // default latest first

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Forms & Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<Bug | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewBug, setViewBug] = useState<Bug | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [projectId, setProjectId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [testCaseId, setTestCaseId] = useState('');
  const [severity, setSeverity] = useState<Bug['severity']>('high');
  const [priority, setPriority] = useState<Bug['priority']>('high');
  const [bugStatus, setBugStatus] = useState<Bug['status']>('new');
  const [assignedDevId, setAssignedDevId] = useState('');
  const [reporterQaId, setReporterQaId] = useState('');
  const [formError, setFormError] = useState('');

  // Bulk update / delete
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Bug['status'] | ''>('');
  const [bulkPriority, setBulkPriority] = useState<Bug['priority'] | ''>('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Form selections filters
  const availableFormModules = modules.filter(m => m.projectId === projectId);
  const availableFormCases = testCases.filter(t => t.moduleId === moduleId);

  // Sorting
  const handleSort = (field: 'title' | 'id' | 'severity') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Submit: Log Bug
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Defect summary title is required.');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is required.');
      return;
    }
    if (!moduleId) {
      setFormError('Module assignment is required.');
      return;
    }

    const res = addBug({
      projectId,
      moduleId,
      testCaseId: testCaseId || null,
      executionId: null,
      title: title.trim(),
      description: description.trim(),
      expectedResult: expectedResult.trim(),
      actualResult: actualResult.trim(),
      severity,
      priority,
      status: 'new', // starts as NEW
      assignedDevId: assignedDevId || null,
      reporterQaId: reporterQaId || null
    });

    if (res.success) {
      setTitle('');
      setDescription('');
      setExpectedResult('');
      setActualResult('');
      setProjectId('');
      setModuleId('');
      setTestCaseId('');
      setAssignedDevId('');
      setReporterQaId('');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to file bug.');
    }
  };

  // Submit: Edit Bug
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedBug) return;
    if (!title.trim()) {
      setFormError('Defect summary title is required.');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is required.');
      return;
    }
    if (!moduleId) {
      setFormError('Module assignment is required.');
      return;
    }

    // Automatically transition to 'assigned' if a developer is assigned for the first time on a 'new' bug
    let finalStatus = bugStatus;
    if (bugStatus === 'new' && assignedDevId) {
      finalStatus = 'assigned';
    }

    const res = updateBug(selectedBug.id, {
      projectId,
      moduleId,
      testCaseId: testCaseId || null,
      title: title.trim(),
      description: description.trim(),
      expectedResult: expectedResult.trim(),
      actualResult: actualResult.trim(),
      severity,
      priority,
      status: finalStatus,
      assignedDevId: assignedDevId || null,
      reporterQaId: reporterQaId || null
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedBug(null);
    } else {
      setFormError(res.error || 'Failed to update bug.');
    }
  };

  const openEditModal = (bug: Bug) => {
    setSelectedBug(bug);
    setTitle(bug.title);
    setDescription(bug.description);
    setExpectedResult(bug.expectedResult || '');
    setActualResult(bug.actualResult || '');
    setProjectId(bug.projectId);
    setModuleId(bug.moduleId);
    setTestCaseId(bug.testCaseId || '');
    setSeverity(bug.severity);
    setPriority(bug.priority);
    setBugStatus(bug.status);
    setAssignedDevId(bug.assignedDevId || '');
    setReporterQaId(bug.reporterQaId || '');
    setFormError('');
    setIsEditOpen(true);
  };

  const handleProjectFormChange = (projId: string) => {
    setProjectId(projId);
    const firstMod = modules.find(m => m.projectId === projId);
    setModuleId(firstMod?.id || '');
    const firstTC = testCases.find(t => t.moduleId === firstMod?.id);
    setTestCaseId(firstTC?.id || '');
  };

  const handleModuleFormChange = (modId: string) => {
    setModuleId(modId);
    const firstTC = testCases.find(t => t.moduleId === modId);
    setTestCaseId(firstTC?.id || '');
  };

  const confirmDeleteBug = () => {
    if (!deleteTargetId) return;
    const res = deleteBug(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Blocked', res.error || 'Cannot delete bug.', 'error');
    }
    setDeleteTargetId(null);
  };

  const confirmBulkDelete = () => {
    const res = bulkDelete('Bug', selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      addNotification('Bulk Deletion Failed', res.error || 'Bulk delete failed.', 'error');
    }
    setIsBulkDeleteOpen(false);
  };

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};
    if (bulkStatus) updates.status = bulkStatus;
    if (bulkPriority) updates.priority = bulkPriority;

    if (Object.keys(updates).length > 0) {
      bulkUpdate('Bug', selectedIds, updates);
      setSelectedIds([]);
      setIsBulkEditOpen(false);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleBugs: Bug[]) => {
    const visibleIds = visibleBugs.map(b => b.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const getSeverityBadge = (sev: Bug['severity']) => {
    switch (sev) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded-sm bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 text-[10px] font-bold uppercase">Critical</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded-sm bg-orange-100 dark:bg-orange-950/40 text-orange-700 dark:text-orange-400 text-[10px] font-bold uppercase">High</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-sm bg-yellow-105 dark:bg-yellow-950/40 text-yellow-700 dark:text-yellow-400 text-[10px] font-bold uppercase">Medium</span>;
      default:
        return <span className="px-2 py-0.5 rounded-sm bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 text-[10px] font-bold uppercase">Low</span>;
    }
  };

  const getStatusBadge = (st: Bug['status']) => {
    switch (st) {
      case 'new':
        return <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/20 text-blue-600 dark:text-blue-450 text-[10px] font-extrabold uppercase">New</span>;
      case 'assigned':
        return <span className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950/20 text-purple-600 dark:text-purple-400 text-[10px] font-extrabold uppercase">Assigned</span>;
      case 'open':
        return <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 text-[10px] font-extrabold uppercase">Open</span>;
      case 'fixed':
        return <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-extrabold uppercase">Fixed</span>;
      case 'retesting':
        return <span className="px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/20 text-cyan-600 dark:text-cyan-400 text-[10px] font-extrabold uppercase">Retesting</span>;
      case 'closed':
        return <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-450 text-[10px] font-extrabold uppercase">Closed</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase">Rejected</span>;
    }
  };

  // Filter & search
  const filteredBugs = bugs.filter(b => {
    const matchesSearch = b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          b.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || b.projectId === projectFilter;
    const matchesModule = moduleFilter === 'all' || b.moduleId === moduleFilter;
    const matchesSeverity = severityFilter === 'all' || b.severity === severityFilter;
    const matchesPriority = priorityFilter === 'all' || b.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'open'
        ? b.status !== 'closed' && b.status !== 'rejected'
        : statusFilter === 'closed'
          ? b.status === 'closed' || b.status === 'rejected'
          : b.status === statusFilter;
    return matchesSearch && matchesProject && matchesModule && matchesSeverity && matchesPriority && matchesStatus;
  });

  // Sort
  const sortedBugs = [...filteredBugs].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'severity') {
      const weight = { critical: 4, high: 3, medium: 2, low: 1 };
      comparison = weight[a.severity] - weight[b.severity];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedBugs.length / itemsPerPage) || 1;
  const paginatedBugs = sortedBugs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top filter control panel */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Search bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search defect tickets..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
            {/* Severity Filter */}
            <select
              value={severityFilter}
              onChange={(e) => { setSeverityFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
            >
              <option value="all">Severity: All</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
            >
              <option value="all">Status: All</option>
              <option value="new">New</option>
              <option value="assigned">Assigned</option>
              <option value="open">Open</option>
              <option value="fixed">Fixed</option>
              <option value="retesting">Retesting</option>
              <option value="closed">Closed</option>
              <option value="rejected">Rejected</option>
            </select>

            {/* Create Defect Launcher */}
            <button
              onClick={() => {
                setFormError('');
                setTitle('');
                setDescription('');
                setProjectId(projects[0]?.id || '');
                const firstMod = modules.find(m => m.projectId === projects[0]?.id);
                setModuleId(firstMod?.id || '');
                const firstTC = testCases.find(t => t.moduleId === firstMod?.id);
                setTestCaseId(firstTC?.id || '');
                setSeverity('high');
                setPriority('high');
                setAssignedDevId(developers[0]?.id || '');
                setReporterQaId(qaEngineers[0]?.id || '');
                setIsCreateOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Bug</span>
            </button>
          </div>
        </div>

        {/* Dynamic drop selections */}
        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setModuleFilter('all'); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
          >
            <option value="all">Project: All</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
            disabled={projectFilter === 'all'}
          >
            <option value="all">Module: All</option>
            {modules.filter(m => m.projectId === projectFilter).map(m => (
              <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Bulk tools */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-400">
            Selected <strong>{selectedIds.length}</strong> bugs
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBulkStatus(''); setBulkPriority(''); setIsBulkEditOpen(true); }}
              className="px-2.5 py-1 bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-350 text-xs font-medium rounded-lg border border-slate-250 dark:border-slate-750 cursor-pointer"
            >
              Bulk Edit
            </button>
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-450 dark:hover:text-slate-350 font-semibold px-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table Content */}
      {sortedBugs.length === 0 ? (
        <EmptyState
          icon={<BugIcon className="w-10 h-10 animate-bounce" />}
          title="No Defects Registered"
          description={
            projects.length === 0 || modules.length === 0
              ? "You must create both a Project and a Module before you can file defects."
              : searchQuery
                ? "No registered bugs match your search criteria."
                : "A pristine code base! Create your first defect ticket to begin assigning resolving developers and tracking workflow steps."
          }
          actionLabel={projects.length === 0 || modules.length === 0 ? undefined : "Log Bug"}
          onAction={
            projects.length === 0 || modules.length === 0
              ? undefined
              : () => {
                  setFormError('');
                  setTitle('');
                  setDescription('');
                  setProjectId(projects[0]?.id || '');
                  const firstMod = modules.find(m => m.projectId === projects[0]?.id);
                  setModuleId(firstMod?.id || '');
                  const firstTC = testCases.find(t => t.moduleId === firstMod?.id);
                  setTestCaseId(firstTC?.id || '');
                  setSeverity('high');
                  setPriority('high');
                  setAssignedDevId(developers[0]?.id || '');
                  setReporterQaId(qaEngineers[0]?.id || '');
                  setIsCreateOpen(true);
                }
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 w-12 text-center">
                    <input
                      type="checkbox"
                      checked={paginatedBugs.every(b => selectedIds.includes(b.id))}
                      onChange={() => toggleSelectAll(paginatedBugs)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Bug ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      <span>Defect Summary</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('severity')}>
                    <div className="flex items-center gap-1.5">
                      <span>Severity</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 w-28">Assignments</th>
                  <th className="p-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {paginatedBugs.map(b => {
                  const dev = developers.find(d => d.id === b.assignedDevId);
                  const qa = qaEngineers.find(q => q.id === b.reporterQaId);
                  return (
                    <tr
                      key={b.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors ${
                        selectedIds.includes(b.id) ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(b.id)}
                          onChange={() => toggleSelectRow(b.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {b.id}
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => { setViewBug(b); setIsViewOpen(true); }}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">{b.title}</span>
                          <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1 font-sans">
                            {b.testCaseId && (
                              <span className="text-indigo-600 dark:text-indigo-400 font-mono font-bold shrink-0">
                                {b.testCaseId}
                              </span>
                            )}
                            <span className="truncate max-w-[200px]">{b.description}</span>
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        {getSeverityBadge(b.severity)}
                      </td>
                      <td className="p-4">
                        {getStatusBadge(b.status)}
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-650 dark:text-slate-400">
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-[9px] uppercase text-slate-450 shrink-0">Dev:</span>
                            <span className="truncate max-w-[90px]">{dev ? dev.name : <em className="text-slate-350">Unassigned</em>}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-semibold text-[9px] uppercase text-slate-450 shrink-0">QA:</span>
                            <span className="truncate max-w-[90px]">{qa ? qa.name : <em className="text-slate-350">Unassigned</em>}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1">
                        {/* View Bug */}
                        <button
                          onClick={() => { setViewBug(b); setIsViewOpen(true); }}
                          title="View defect profile"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit Bug */}
                        <button
                          onClick={() => openEditModal(b)}
                          title="Edit defect"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete Bug */}
                        <button
                          onClick={() => setDeleteTargetId(b.id)}
                          title="Delete defect"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Showing {filteredBugs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredBugs.length, currentPage * itemsPerPage)} of {filteredBugs.length} bugs
              </span>
              <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                <span className="text-slate-400">Show:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Prev
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LOG BUG MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BugIcon className="w-5 h-5 text-indigo-500 animate-pulse" />
                <span>Log Defect Ticket</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Defect Summary Title <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g., API returning 500 error on duplicate checkout submissions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => handleProjectFormChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                    required
                  >
                    <option value="" disabled>-- Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => handleModuleFormChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                    disabled={!projectId}
                    required
                  >
                    <option value="" disabled>-- Module --</option>
                    {availableFormModules.map(m => (
                      <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Target Test Case <span className="text-slate-400 font-normal">(Optional)</span>
                  </label>
                  <select
                    value={testCaseId}
                    onChange={(e) => setTestCaseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                    disabled={!moduleId}
                  >
                    <option value="">-- None --</option>
                    {availableFormCases.map(t => (
                      <option key={t.id} value={t.id}>{t.id} - {t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Reporter QA Engineer
                  </label>
                  <select
                    value={reporterQaId}
                    onChange={(e) => setReporterQaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                  >
                    <option value="">-- Choose QA --</option>
                    {qaEngineers.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Bug['severity'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Bug['priority'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="immediate">Immediate</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Assignee Developer
                </label>
                <select
                  value={assignedDevId}
                  onChange={(e) => setAssignedDevId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">-- Unassigned --</option>
                  {developers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({ROLE_LABELS[d.role] || d.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Steps to Reproduce / Details
                </label>
                <textarea
                  placeholder="Provide precise details, steps to reproduce, error logs or tracebacks..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide flex items-center gap-1">
                    Actual Result
                  </label>
                  <textarea
                    placeholder="What actually happens or fails during execution..."
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-red-500"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide flex items-center gap-1">
                    Expected Result
                  </label>
                  <textarea
                    placeholder="What should happen when the feature works correctly..."
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Log Defect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT BUG MODAL */}
      {isEditOpen && selectedBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedBug(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Defect Ticket {selectedBug.id}</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedBug(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Defect Summary Title <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g., API returning 500 error on duplicate checkout submissions"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Project <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => handleProjectFormChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Module <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={moduleId}
                    onChange={(e) => handleModuleFormChange(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                    required
                  >
                    {availableFormModules.map(m => (
                      <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Target Test Case
                  </label>
                  <select
                    value={testCaseId}
                    onChange={(e) => setTestCaseId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- None --</option>
                    {availableFormCases.map(t => (
                      <option key={t.id} value={t.id}>{t.id} - {t.title}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Reporter QA Engineer
                  </label>
                  <select
                    value={reporterQaId}
                    onChange={(e) => setReporterQaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Choose QA --</option>
                    {qaEngineers.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Severity
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as Bug['severity'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Bug['priority'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="immediate">Immediate</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Workflow Status
                  </label>
                  <select
                    value={bugStatus}
                    onChange={(e) => setBugStatus(e.target.value as Bug['status'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="new">New</option>
                    <option value="assigned">Assigned</option>
                    <option value="open">Open</option>
                    <option value="fixed">Fixed</option>
                    <option value="retesting">Retesting</option>
                    <option value="closed">Closed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Assignee Developer
                </label>
                <select
                  value={assignedDevId}
                  onChange={(e) => setAssignedDevId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                >
                  <option value="">-- Unassigned --</option>
                  {developers.map(d => (
                    <option key={d.id} value={d.id}>{d.name} ({ROLE_LABELS[d.role] || d.role})</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Steps to Reproduce / Details
                </label>
                <textarea
                  placeholder="Provide details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-805 dark:text-slate-205 text-sm rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide">
                    Actual Result
                  </label>
                  <textarea
                    placeholder="Actual behavior observed..."
                    value={actualResult}
                    onChange={(e) => setActualResult(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">
                    Expected Result
                  </label>
                  <textarea
                    placeholder="Expected behavior..."
                    value={expectedResult}
                    onChange={(e) => setExpectedResult(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedBug(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EDIT DIALOG */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsBulkEditOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Bulk Update Bug Tickets
            </h3>
            <form onSubmit={handleBulkUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550">Update Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as Bug['status'] | '')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">Keep current values</option>
                  <option value="new">New</option>
                  <option value="assigned">Assigned</option>
                  <option value="open">Open</option>
                  <option value="fixed">Fixed</option>
                  <option value="retesting">Retesting</option>
                  <option value="closed">Closed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550">Update Priority</label>
                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value as Bug['priority'] | '')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">Keep current values</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="immediate">Immediate</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsBulkEditOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW BUG DETAILS MODAL */}
      {isViewOpen && viewBug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsViewOpen(false); setViewBug(null); }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-50 dark:bg-red-950/40 rounded-xl text-red-650 dark:text-red-400 animate-pulse">
                  <BugIcon className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-red-650 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded">
                    {viewBug.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    Defect Profile & Resolution
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => { setIsViewOpen(false); setViewBug(null); }} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Bug Title */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 font-sans">Defect Summary</h4>
                <p className="text-base font-bold text-slate-850 dark:text-slate-100">
                  {viewBug.title}
                </p>
              </div>

              {/* Grid of parameters */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-xs font-sans">
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Project Scope</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {projects.find(p => p.id === viewBug.projectId)?.name || viewBug.projectId}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">System Module</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {modules.find(m => m.id === viewBug.moduleId)?.name || viewBug.moduleId}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Severity</span>
                  <div className="mt-1">
                    {getSeverityBadge(viewBug.severity)}
                  </div>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Priority</span>
                  <div className="mt-1">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                      viewBug.priority === 'immediate' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                      viewBug.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700' :
                      viewBug.priority === 'medium' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-750' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {viewBug.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Status and Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50/20 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-xs font-sans">
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Workflow Status</span>
                  {getStatusBadge(viewBug.status)}
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Assigned Developer</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {developers.find(d => d.id === viewBug.assignedDevId)?.name || <em className="text-slate-450">Unassigned</em>}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-400 uppercase tracking-wider mb-1">Reporter QA</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {qaEngineers.find(q => q.id === viewBug.reporterQaId)?.name || <em className="text-slate-450">Unassigned</em>}
                  </span>
                </div>
              </div>

              {/* Defect Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-sans">Steps to Reproduce & Description</h4>
                <div className="bg-slate-50/20 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-xs text-slate-700 dark:text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {viewBug.description || <em className="text-slate-450">No reproduction description filed.</em>}
                </div>
              </div>

              {/* Actual and Expected Results */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-sans">
                <div className="bg-red-50/20 dark:bg-red-950/10 border border-red-200 dark:border-red-800/50 p-4 rounded-xl text-xs space-y-1">
                  <span className="text-xs font-bold text-red-650 dark:text-red-400 uppercase tracking-wide block">
                    Actual Result
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                    {viewBug.actualResult || <em className="text-slate-400 italic">No actual result specified.</em>}
                  </p>
                </div>

                <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border border-emerald-200 dark:border-emerald-800/50 p-4 rounded-xl text-xs space-y-1">
                  <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide block">
                    Expected Result
                  </span>
                  <p className="text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">
                    {viewBug.expectedResult || <em className="text-slate-400 italic">No expected result specified.</em>}
                  </p>
                </div>
              </div>

              {/* Originating QA Test Case */}
              {viewBug.testCaseId && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 font-sans">Originating QA Test Case</h4>
                  {(() => {
                    const tc = testCases.find(t => t.id === viewBug.testCaseId);
                    if (!tc) return (
                      <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                        Test Case ID {viewBug.testCaseId} could not be resolved.
                      </p>
                    );
                    return (
                      <div className="border border-slate-150 dark:border-slate-800 p-3.5 bg-white dark:bg-slate-900 rounded-xl text-xs space-y-2.5">
                        <div className="flex items-center justify-between gap-2 font-sans">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono text-[10px] font-bold text-indigo-500 shrink-0">{tc.id}</span>
                            <p className="font-semibold text-slate-700 dark:text-slate-300 truncate">{tc.title}</p>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                            tc.lastExecutionStatus === 'passed' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                          }`}>
                            Last Exec: {tc.lastExecutionStatus || 'unexecuted'}
                          </span>
                        </div>
                        <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border-l-2 border-emerald-500 p-2.5 rounded-r-lg">
                          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-0.5">Expected Result:</span>
                          <p className="text-xs text-slate-700 dark:text-slate-300 font-medium whitespace-pre-wrap leading-relaxed">{tc.expectedResult}</p>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setIsViewOpen(false); setViewBug(null); }}
                className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMS */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteBug}
        title="Delete Defect Ticket?"
        message="Are you sure you want to permanently delete this defect record? All associated metrics will be updated immediately."
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Defects?"
        message={`Are you sure you want to delete the ${selectedIds.length} selected bugs?`}
      />
    </div>
  );
};
