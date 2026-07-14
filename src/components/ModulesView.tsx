/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Module } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Layers,
  Plus,
  Search,
  Filter,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  FileCode,
  FolderGit2
} from 'lucide-react';

export const ModulesView: React.FC = () => {
  const {
    modules,
    projects,
    addModule,
    updateModule,
    deleteModule,
    duplicateModule,
    bulkDelete,
    addNotification
  } = useApp();

  // Search & Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'projectId'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Modals & Forms State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [formError, setFormError] = useState('');

  // Delete Confirm State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Sorting
  const handleSort = (field: 'name' | 'id' | 'projectId') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Submit Handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Module name is mandatory');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is mandatory');
      return;
    }

    const res = addModule({
      name: name.trim(),
      description: description.trim(),
      projectId,
      status: 'active'
    });

    if (res.success) {
      setName('');
      setDescription('');
      setProjectId('');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to create module');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedModule) return;
    if (!name.trim()) {
      setFormError('Module name is mandatory');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is mandatory');
      return;
    }

    const res = updateModule(selectedModule.id, {
      name: name.trim(),
      description: description.trim(),
      projectId,
      status
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedModule(null);
    } else {
      setFormError(res.error || 'Failed to update module');
    }
  };

  const openEditModal = (mod: Module) => {
    setSelectedModule(mod);
    setName(mod.name);
    setDescription(mod.description);
    setProjectId(mod.projectId);
    setStatus(mod.status);
    setFormError('');
    setIsEditOpen(true);
  };

  const confirmDeleteModule = () => {
    if (!deleteTargetId) return;
    const res = deleteModule(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Blocked', res.error || 'Cannot delete module.', 'error');
    }
    setDeleteTargetId(null);
  };

  const confirmBulkDelete = () => {
    const res = bulkDelete('Module', selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      addNotification('Bulk Deletion Blocked', res.error || 'Some modules could not be deleted.', 'error');
    }
    setIsBulkDeleteOpen(false);
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleModules: Module[]) => {
    const visibleIds = visibleModules.map(m => m.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Filter Modules
  const filteredModules = modules.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          m.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || m.projectId === projectFilter;
    const matchesStatus = statusFilter === 'all' || m.status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  // Sort Modules
  const sortedModules = [...filteredModules].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'projectId') {
      comparison = a.projectId.localeCompare(b.projectId);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedModules.length / itemsPerPage) || 1;
  const paginatedModules = sortedModules.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Filters & Header Toolbar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search modules by ID, name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Dropdowns & Filters */}
        <div className="flex flex-wrap gap-2.5 items-center justify-end w-full md:w-auto">
          {/* Project dropdown filter */}
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          {/* Status filter buttons */}
          <div className="flex items-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-1 rounded-xl">
            {(['all', 'active', 'archived'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => { setStatusFilter(filter); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-500 dark:text-slate-450 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Add Module Trigger */}
          <button
            onClick={() => {
              setFormError('');
              setName('');
              setDescription('');
              setProjectId(projects[0]?.id || '');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Module</span>
          </button>
        </div>
      </div>

      {/* Bulk actions banner */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-400">
            Selected <strong>{selectedIds.length}</strong> module(s)
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsBulkDeleteOpen(true)}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs font-medium rounded-lg shadow-sm cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Bulk Delete</span>
            </button>
            <button
              onClick={() => setSelectedIds([])}
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-semibold px-2 animate-fade-in"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Modules Table / Empty States */}
      {sortedModules.length === 0 ? (
        <EmptyState
          icon={<Layers className="w-10 h-10" />}
          title="No Modules Found"
          description={
            projects.length === 0
              ? "You must create a Project before you can declare Modules."
              : searchQuery
                ? "No modules match your current filter or query criteria."
                : "Create your first module to begin structuring requirement trees and logging test cases."
          }
          actionLabel={projects.length === 0 ? undefined : "Create Module"}
          onAction={
            projects.length === 0
              ? undefined
              : () => {
                  setFormError('');
                  setName('');
                  setDescription('');
                  setProjectId(projects[0]?.id || '');
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
                      checked={paginatedModules.every(m => selectedIds.includes(m.id))}
                      onChange={() => toggleSelectAll(paginatedModules)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Module ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('projectId')}>
                    <div className="flex items-center gap-1.5">
                      <span>Project Assignment</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Module Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4">Description</th>
                  <th className="p-4 w-24">Status</th>
                  <th className="p-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {paginatedModules.map(m => {
                  const parentProj = projects.find(p => p.id === m.projectId);
                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors ${
                        selectedIds.includes(m.id) ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                      }`}
                    >
                      <td className="p-4 text-center">
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(m.id)}
                          onChange={() => toggleSelectRow(m.id)}
                          className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                      </td>
                      <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {m.id}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1.5">
                          <FolderGit2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {parentProj ? `${parentProj.id} - ${parentProj.name}` : <span className="text-red-500 italic">Unknown Project</span>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                        {m.name}
                      </td>
                      <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                        {m.description || <span className="text-slate-300 italic">No description</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                          m.status === 'active'
                            ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450'
                        }`}>
                          {m.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        {/* Duplicate */}
                        <button
                          onClick={() => duplicateModule(m.id)}
                          title="Duplicate Module"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        {/* Archive Toggle */}
                        <button
                          onClick={() => updateModule(m.id, { status: m.status === 'active' ? 'archived' : 'active' })}
                          title={m.status === 'active' ? 'Archive Module' : 'Activate Module'}
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          {m.status === 'active' ? <Archive className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(m)}
                          title="Edit Module"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTargetId(m.id)}
                          title="Delete Module"
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

          {/* Pagination Footer */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-150 dark:border-slate-850 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              Showing {Math.min(filteredModules.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredModules.length, currentPage * itemsPerPage)} of {filteredModules.length} modules
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

      {/* CREATE MODULE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-indigo-500" />
                <span>Create New Module</span>
              </h3>
              <button onClick={() => setIsCreateOpen(false)} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-sm text-amber-600 dark:text-amber-400 font-medium mb-4">
                  No active projects found. Please create a project first.
                </p>
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-850 text-slate-700 dark:text-slate-300 rounded-xl font-semibold text-xs"
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                {formError && (
                  <div className="p-3 bg-red-50/50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 text-xs font-semibold rounded-lg">
                    {formError}
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Module Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Authentication Services"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    maxLength={40}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Project Assignment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Choose Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Description
                  </label>
                  <textarea
                    placeholder="Provide module-specific detail, APIs included, or coverage details..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCreateOpen(false)}
                    className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                  >
                    Create Module
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* EDIT MODULE MODAL */}
      {isEditOpen && selectedModule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedModule(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Module {selectedModule.id}</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedModule(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
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
                  Module Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Authentication Services"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={45}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Project Assignment <span className="text-red-500">*</span>
                </label>
                <select
                  value={projectId}
                  onChange={(e) => setProjectId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                  required
                >
                  {projects.map(p => (
                    <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  placeholder="Provide module-specific detail, APIs included, or coverage details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'archived')}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedModule(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* INDIVIDUAL MODULE DELETION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteModule}
        title="Delete Module?"
        message="Are you sure you want to permanently delete this module? This action cannot be undone. System deletion checks are automatically evaluated."
      />

      {/* BULK MODULE DELETION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Selected Modules?"
        message={`Are you sure you want to delete ${selectedIds.length} selected modules? Associated test case checks will still be evaluated, and only empty modules will be removed.`}
      />
    </div>
  );
};
