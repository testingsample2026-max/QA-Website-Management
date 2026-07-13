/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Requirement } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  ClipboardCheck,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  FileText,
  Bookmark,
  Layers,
  Eye
} from 'lucide-react';

export const RequirementsView: React.FC = () => {
  const {
    requirements,
    projects,
    modules,
    testCases,
    bugs,
    addRequirement,
    updateRequirement,
    deleteRequirement,
    duplicateRequirement,
    bulkUpdate,
    bulkDelete,
    addNotification
  } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  const [sortBy, setSortBy] = useState<'title' | 'id' | 'priority'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Form Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedRequirement, setSelectedRequirement] = useState<Requirement | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewRequirement, setViewRequirement] = useState<Requirement | null>(null);

  // Form Fields state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [priority, setPriority] = useState<Requirement['priority']>('medium');
  const [status, setStatus] = useState<Requirement['status']>('draft');
  const [formError, setFormError] = useState('');

  // Bulk Edit state
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<Requirement['status'] | ''>('');
  const [bulkPriority, setBulkPriority] = useState<Requirement['priority'] | ''>('');

  // Delete confirms
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Filter modules based on project selection in create/edit form
  const availableFormModules = modules.filter(m => m.projectId === projectId);

  // Sorting
  const handleSort = (field: 'title' | 'id' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // SubmitHandlers
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Requirement title is mandatory');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is mandatory');
      return;
    }
    if (!moduleId) {
      setFormError('Module assignment is mandatory');
      return;
    }

    const res = addRequirement({
      title: title.trim(),
      description: description.trim(),
      projectId,
      moduleId,
      priority,
      status: 'draft'
    });

    if (res.success) {
      setTitle('');
      setDescription('');
      setProjectId('');
      setModuleId('');
      setPriority('medium');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to create requirement');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRequirement) return;
    if (!title.trim()) {
      setFormError('Requirement title is mandatory');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is mandatory');
      return;
    }
    if (!moduleId) {
      setFormError('Module assignment is mandatory');
      return;
    }

    const res = updateRequirement(selectedRequirement.id, {
      title: title.trim(),
      description: description.trim(),
      projectId,
      moduleId,
      priority,
      status
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedRequirement(null);
    } else {
      setFormError(res.error || 'Failed to update requirement');
    }
  };

  const openEditModal = (req: Requirement) => {
    setSelectedRequirement(req);
    setTitle(req.title);
    setDescription(req.description);
    setProjectId(req.projectId);
    setModuleId(req.moduleId);
    setPriority(req.priority);
    setStatus(req.status);
    setFormError('');
    setIsEditOpen(true);
  };

  const handleProjectFormChange = (projId: string) => {
    setProjectId(projId);
    const firstMod = modules.find(m => m.projectId === projId);
    setModuleId(firstMod?.id || '');
  };

  const confirmDeleteReq = () => {
    if (!deleteTargetId) return;
    const res = deleteRequirement(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Failed', res.error || 'Cannot delete requirement.', 'error');
    }
    setDeleteTargetId(null);
  };

  const confirmBulkDelete = () => {
    const res = bulkDelete('Requirement', selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      addNotification('Bulk Deletion Failed', res.error || 'Some requirements could not be deleted.', 'error');
    }
    setIsBulkDeleteOpen(false);
  };

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};
    if (bulkStatus) updates.status = bulkStatus;
    if (bulkPriority) updates.priority = bulkPriority;

    if (Object.keys(updates).length > 0) {
      bulkUpdate('Requirement', selectedIds, updates);
      setSelectedIds([]);
      setIsBulkEditOpen(false);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleReqs: Requirement[]) => {
    const visibleIds = visibleReqs.map(r => r.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Filters calculation
  const filteredRequirements = requirements.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || r.projectId === projectFilter;
    const matchesModule = moduleFilter === 'all' || r.moduleId === moduleFilter;
    const matchesPriority = priorityFilter === 'all' || r.priority === priorityFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesProject && matchesModule && matchesPriority && matchesStatus;
  });

  const sortedRequirements = [...filteredRequirements].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'priority') {
      const priorityWeight = { critical: 4, high: 3, medium: 2, low: 1 };
      comparison = priorityWeight[a.priority] - priorityWeight[b.priority];
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedRequirements.length / itemsPerPage) || 1;
  const paginatedRequirements = sortedRequirements.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header filter ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search requirements..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
          {/* Project dropdown filter */}
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setModuleFilter('all'); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          {/* Module filter dropdown */}
          <select
            value={moduleFilter}
            onChange={(e) => { setModuleFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Modules</option>
            {modules.filter(m => projectFilter === 'all' || m.projectId === projectFilter).map(m => (
              <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => { setPriorityFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="approved">Approved</option>
            <option value="implemented">Implemented</option>
            <option value="deprecated">Deprecated</option>
          </select>

          {/* Trigger Create */}
          <button
            onClick={() => {
              setFormError('');
              setTitle('');
              setDescription('');
              setProjectId(projects[0]?.id || '');
              const firstMod = modules.find(m => m.projectId === projects[0]?.id);
              setModuleId(firstMod?.id || '');
              setPriority('medium');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Req</span>
          </button>
        </div>
      </div>

      {/* Bulk actions ribbon */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-400">
            Selected <strong>{selectedIds.length}</strong> requirements
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setBulkStatus(''); setBulkPriority(''); setIsBulkEditOpen(true); }}
              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-250 dark:border-slate-700 cursor-pointer"
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
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-semibold px-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Requirements Table */}
      {sortedRequirements.length === 0 ? (
        <EmptyState
          icon={<ClipboardCheck className="w-10 h-10" />}
          title="No Requirements Found"
          description={
            projects.length === 0 || modules.length === 0
              ? "You must create both a Project and a Module before you can declare Requirements."
              : searchQuery
                ? "No requirements match your current query filters."
                : "Declare your first requirement. Once done, you can link it to test cases for full traceability."
          }
          actionLabel={projects.length === 0 || modules.length === 0 ? undefined : "Create Requirement"}
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
                  setPriority('medium');
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
                      checked={paginatedRequirements.every(r => selectedIds.includes(r.id))}
                      onChange={() => toggleSelectAll(paginatedRequirements)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Req ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('title')}>
                    <div className="flex items-center gap-1.5">
                      <span>Requirement Title</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4">Hierarchy</th>
                  <th className="p-4 w-24 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1.5">
                      <span>Priority</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 w-24">Status</th>
                  <th className="p-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {paginatedRequirements.map(r => {
                  const parentProj = projects.find(p => p.id === r.projectId);
                  const parentMod = modules.find(m => m.id === r.moduleId);
                  return (
                    <tr
                      key={r.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors ${
                        selectedIds.includes(r.id) ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(r.id)}
                          onChange={() => toggleSelectRow(r.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {r.id}
                      </td>
                      <td className="p-4 cursor-pointer" onClick={() => { setViewRequirement(r); setIsViewOpen(true); }}>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 hover:text-indigo-650 dark:hover:text-indigo-400 transition-colors">{r.title}</span>
                          <span className="text-[11px] text-slate-450 dark:text-slate-500 mt-1 truncate max-w-[200px]">
                            {r.description || <em className="text-slate-300">No description</em>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-slate-600 dark:text-slate-400">
                        <div className="flex flex-col gap-0.5 font-sans">
                          <div className="flex items-center gap-1">
                            <span className="font-semibold text-slate-500">{parentProj?.id}:</span>
                            <span className="truncate max-w-[120px]">{parentProj?.name}</span>
                          </div>
                          <div className="flex items-center gap-1 mt-0.5">
                            <span className="font-semibold text-indigo-500">{parentMod?.id}:</span>
                            <span className="truncate max-w-[120px]">{parentMod?.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.priority === 'critical' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                          r.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-450' :
                          r.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-550' :
                          'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                        }`}>
                          {r.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          r.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                          r.status === 'implemented' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' :
                          r.status === 'draft' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                          'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                        }`}>
                          {r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        {/* View Details */}
                        <button
                          onClick={() => { setViewRequirement(r); setIsViewOpen(true); }}
                          title="View Requirement Details"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Duplicate */}
                        <button
                          onClick={() => duplicateRequirement(r.id)}
                          title="Duplicate Requirement"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(r)}
                          title="Edit Requirement"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTargetId(r.id)}
                          title="Delete Requirement"
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
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
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              Showing {Math.min(filteredRequirements.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredRequirements.length, currentPage * itemsPerPage)} of {filteredRequirements.length} requirements
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2">Page {currentPage} of {totalPages}</span>
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

      {/* CREATE REQUIREMENT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-indigo-500" />
                <span>Declare Requirement</span>
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
                  Requirement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Secure User password storage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={55}
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
                    onChange={(e) => setModuleId(e.target.value)}
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

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Requirement['priority'])}
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
                  Description / User Story
                </label>
                <textarea
                  placeholder="As a user, I want my password to be hashed using bcrypt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REQUIREMENT MODAL */}
      {isEditOpen && selectedRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedRequirement(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Requirement {selectedRequirement.id}</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedRequirement(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
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
                  Requirement Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Secure User password storage"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  maxLength={55}
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
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
                    onChange={(e) => setModuleId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
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
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Requirement['priority'])}
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
                    Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Requirement['status'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                  >
                    <option value="draft">Draft</option>
                    <option value="approved">Approved</option>
                    <option value="implemented">Implemented</option>
                    <option value="deprecated">Deprecated</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Description / User Story
                </label>
                <textarea
                  placeholder="As a user, I want my password to be hashed using bcrypt..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={250}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedRequirement(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BULK EDIT MODAL */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsBulkEditOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <h3 className="text-sm font-bold text-slate-800 dark:text-white uppercase tracking-wider mb-4">
              Bulk Update Requirements
            </h3>
            <form onSubmit={handleBulkUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Update Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as Requirement['status'] | '')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">Keep current values</option>
                  <option value="draft">Draft</option>
                  <option value="approved">Approved</option>
                  <option value="implemented">Implemented</option>
                  <option value="deprecated">Deprecated</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-500">Update Priority</label>
                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value as Requirement['priority'] | '')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">Keep current values</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
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

      {/* VIEW REQUIREMENT DETAILS MODAL */}
      {isViewOpen && viewRequirement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsViewOpen(false); setViewRequirement(null); }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <Bookmark className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                    {viewRequirement.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    Requirement View Profile
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => { setIsViewOpen(false); setViewRequirement(null); }} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Requirement Title */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Requirement Title</h4>
                <p className="text-lg font-bold text-slate-850 dark:text-slate-100 font-sans">
                  {viewRequirement.title}
                </p>
              </div>

              {/* Grid of details */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850">
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Project</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {projects.find(p => p.id === viewRequirement.projectId)?.name || viewRequirement.projectId}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">System Module</span>
                  <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {modules.find(m => m.id === viewRequirement.moduleId)?.name || viewRequirement.moduleId}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Priority Badge</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-1 ${
                    viewRequirement.priority === 'critical' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                    viewRequirement.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-450' :
                    viewRequirement.priority === 'medium' ? 'bg-yellow-50 dark:bg-yellow-950/30 text-yellow-700 dark:text-yellow-550' :
                    'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                  }`}>
                    {viewRequirement.priority}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-bold text-slate-450 uppercase tracking-wider">Current Status</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase mt-1 ${
                    viewRequirement.status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                    viewRequirement.status === 'implemented' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400' :
                    viewRequirement.status === 'draft' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                    'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                  }`}>
                    {viewRequirement.status}
                  </span>
                </div>
              </div>

              {/* Requirement Description */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Description Statement</h4>
                <div className="bg-slate-50/20 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-800 p-4 rounded-xl text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {viewRequirement.description || <em className="text-slate-400">No descriptive specification logged for this requirement.</em>}
                </div>
              </div>

              {/* Traced Test Cases (Coverage) */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Traced Test Coverage</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-450 rounded-full text-[10px] font-bold font-mono">
                    {testCases.filter(t => t.moduleId === viewRequirement.moduleId).length} Cases
                  </span>
                </h4>
                {testCases.filter(t => t.moduleId === viewRequirement.moduleId).length === 0 ? (
                  <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                    No active test cases are tracing this requirement currently. Add a test case with the same module to establish coverage.
                  </p>
                ) : (
                  <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {testCases.filter(t => t.moduleId === viewRequirement.moduleId).map(tc => (
                      <div key={tc.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-mono text-[10px] font-bold text-slate-450 shrink-0">{tc.id}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{tc.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                          tc.lastExecutionStatus === 'passed' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                          tc.lastExecutionStatus === 'failed' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                          tc.lastExecutionStatus === 'blocked' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700' :
                          tc.lastExecutionStatus === 'retest' ? 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {tc.lastExecutionStatus || 'unexecuted'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Traced Bugs */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Linked Active Bugs</span>
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-450 rounded-full text-[10px] font-bold font-mono">
                    {bugs.filter(b => b.moduleId === viewRequirement.moduleId && b.status !== 'closed' && b.status !== 'rejected').length} Open
                  </span>
                </h4>
                {bugs.filter(b => b.moduleId === viewRequirement.moduleId).length === 0 ? (
                  <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                    No active defects are mapped to this module level.
                  </p>
                ) : (
                  <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden max-h-44 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-850">
                    {bugs.filter(b => b.moduleId === viewRequirement.moduleId).map(b => (
                      <div key={b.id} className="p-3 bg-white dark:bg-slate-900 flex items-center justify-between text-xs hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors">
                        <div className="flex items-center gap-2 min-w-0 pr-2">
                          <span className="font-mono text-[10px] font-bold text-red-500 shrink-0">{b.id}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{b.title}</span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase shrink-0 ${
                          b.status === 'closed' || b.status === 'rejected' ? 'bg-slate-100 text-slate-500 dark:bg-slate-800' :
                          b.severity === 'critical' ? 'bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-400 font-bold' :
                          'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400'
                        }`}>
                          {b.status} • {b.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setIsViewOpen(false); setViewRequirement(null); }}
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
        onConfirm={confirmDeleteReq}
        title="Delete Requirement?"
        message="Are you sure you want to permanently delete this requirement? The action cannot be undone."
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Requirements?"
        message={`Are you sure you want to delete ${selectedIds.length} selected requirements?`}
      />
    </div>
  );
};
