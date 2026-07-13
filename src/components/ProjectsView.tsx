/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  Copy,
  Archive,
  RotateCcw,
  Trash2,
  Edit,
  Download,
  Upload,
  ArrowUpDown,
  MoreVertical,
  X,
  FolderOpen
} from 'lucide-react';

export const ProjectsView: React.FC = () => {
  const {
    projects,
    addProject,
    updateProject,
    deleteProject,
    duplicateProject,
    bulkDelete,
    addNotification,
    importData,
    exportData
  } = useApp();

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'archived'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'id' | 'createdAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Dialog & Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'active' | 'archived'>('active');
  const [projectType, setProjectType] = useState<'website' | 'mobile_app'>('website');
  const [formError, setFormError] = useState('');

  // Delete Confirmation State
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Sorting Handler
  const handleSort = (field: 'name' | 'id' | 'createdAt') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Form submit handler
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    if (!name.trim()) {
      setFormError('Project name is mandatory');
      return;
    }

    const res = addProject({
      name: name.trim(),
      description: description.trim(),
      status: 'active',
      type: projectType
    });

    if (res.success) {
      setName('');
      setDescription('');
      setProjectType('website');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to create project');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedProject) return;
    if (!name.trim()) {
      setFormError('Project name is mandatory');
      return;
    }

    const res = updateProject(selectedProject.id, {
      name: name.trim(),
      description: description.trim(),
      status,
      type: projectType
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedProject(null);
    } else {
      setFormError(res.error || 'Failed to update project');
    }
  };

  // Open Edit Modal
  const openEditModal = (proj: Project) => {
    setSelectedProject(proj);
    setName(proj.name);
    setDescription(proj.description);
    setStatus(proj.status);
    setProjectType(proj.type || 'website');
    setFormError('');
    setIsEditOpen(true);
  };

  // Delete Individual Project
  const confirmDeleteProject = () => {
    if (!deleteTargetId) return;
    const res = deleteProject(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Blocked', res.error || 'Cannot delete project.', 'error');
    }
    setDeleteTargetId(null);
  };

  // Bulk deletion
  const confirmBulkDelete = () => {
    const res = bulkDelete('Project', selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      addNotification('Bulk Deletion Blocked', res.error || 'Cannot bulk delete projects.', 'error');
    }
    setIsBulkDeleteOpen(false);
  };

  // Select Row Handler
  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleProjects: Project[]) => {
    const visibleIds = visibleProjects.map(p => p.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Export Data JSON handler
  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(exportData());
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "qa_test_management_backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    addNotification('Backup Exported', 'Full database JSON backup has been downloaded.', 'success');
  };

  // Import Data Handler
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], "UTF-8");
      fileReader.onload = (event) => {
        if (event.target?.result) {
          const res = importData(event.target.result as string);
          if (!res.success) {
            addNotification('Import Failed', res.error || 'Corrupt file structure.', 'error');
          }
        }
      };
    }
  };

  // Filter, Search, and Sort projects
  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedProjects = [...filteredProjects].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'name') {
      comparison = a.name.localeCompare(b.name);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'createdAt') {
      comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedProjects.length / itemsPerPage) || 1;
  const paginatedProjects = sortedProjects.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Search and Action Ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search projects by ID, name..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Status & Export Controls */}
        <div className="flex flex-wrap gap-2.5 items-center justify-end w-full md:w-auto">
          {/* Status Filters */}
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

          {/* Export / Backup Trigger */}
          <button
            onClick={handleExport}
            title="Download Full System JSON Backup"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>

          {/* Import JSON Backup */}
          <label className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900 dark:hover:bg-slate-850 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold transition-all cursor-pointer">
            <Upload className="w-3.5 h-3.5" />
            <span>Import</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>

          {/* Add Project Action Button */}
          <button
            onClick={() => { setName(''); setDescription(''); setProjectType('website'); setFormError(''); setIsCreateOpen(true); }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-sm transition-all active:scale-[0.98] cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Bulk actions banner */}
      {selectedIds.length > 0 && (
        <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 px-4 py-3 rounded-xl flex items-center justify-between">
          <span className="text-xs font-medium text-indigo-800 dark:text-indigo-400">
            Selected <strong>{selectedIds.length}</strong> project(s)
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
              className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 font-semibold px-2"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* Main Table Content / Empty State */}
      {sortedProjects.length === 0 ? (
        <EmptyState
          icon={<FolderGit2 className="w-10 h-10" />}
          title="No Projects Found"
          description={searchQuery ? "No projects match your current filter or query criteria." : "Create your first project to begin managing modules, requirements, and tracking test logs."}
          actionLabel={searchQuery ? undefined : "Create New Project"}
          onAction={searchQuery ? undefined : () => { setName(''); setDescription(''); setFormError(''); setIsCreateOpen(true); }}
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
                      checked={paginatedProjects.every(p => selectedIds.includes(p.id))}
                      onChange={() => toggleSelectAll(paginatedProjects)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                    />
                  </th>
                  <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Project ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40 dark:hover:bg-slate-950/40" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1.5">
                      <span>Project Name</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Description</th>
                  <th className="p-4 w-24">Status</th>
                  <th className="p-4 w-28 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {paginatedProjects.map(p => (
                  <tr
                    key={p.id}
                    className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors ${
                      selectedIds.includes(p.id) ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                    }`}
                  >
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(p.id)}
                        onChange={() => toggleSelectRow(p.id)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </td>
                    <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                      {p.id}
                    </td>
                    <td className="p-4 font-semibold text-slate-800 dark:text-slate-200">
                      {p.name}
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase ${
                        (p.type || 'website') === 'website'
                          ? 'bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400'
                          : 'bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400'
                      }`}>
                        {(p.type || 'website') === 'website' ? 'Website' : 'Mobile App'}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {p.description || <span className="text-slate-300 italic">No description</span>}
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold capitalize ${
                        p.status === 'active'
                          ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-450'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-4 text-right flex items-center justify-end gap-1.5">
                      {/* Duplicate Project */}
                      <button
                        onClick={() => duplicateProject(p.id)}
                        title="Duplicate Project"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Archive / Restore toggle */}
                      <button
                        onClick={() => updateProject(p.id, { status: p.status === 'active' ? 'archived' : 'active' })}
                        title={p.status === 'active' ? 'Archive Project' : 'Activate Project'}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        {p.status === 'active' ? <Archive className="w-3.5 h-3.5" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </button>

                      {/* Edit project */}
                      <button
                        onClick={() => openEditModal(p)}
                        title="Edit Project"
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete project */}
                      <button
                        onClick={() => setDeleteTargetId(p.id)}
                        title="Delete Project"
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Simple Pagination Footer */}
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
            <span>
              Showing {Math.min(filteredProjects.length, (currentPage - 1) * itemsPerPage + 1)} to {Math.min(filteredProjects.length, currentPage * itemsPerPage)} of {filteredProjects.length} projects
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2">Page {currentPage} of {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. CREATE PROJECT MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FolderOpen className="w-5 h-5 text-indigo-500" />
                <span>Create New Project</span>
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
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Core Banking System"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as 'website' | 'mobile_app')}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="website">Website</option>
                  <option value="mobile_app">Mobile App</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  placeholder="Summarize the project's scope, tech stack, and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
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
                  Create Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 5. EDIT PROJECT MODAL */}
      {isEditOpen && selectedProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedProject(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Project {selectedProject.id}</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedProject(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
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
                  Project Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Core Banking System"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Project Type
                </label>
                <select
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as 'website' | 'mobile_app')}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="website">Website</option>
                  <option value="mobile_app">Mobile App</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Description
                </label>
                <textarea
                  placeholder="Summarize the project's scope, tech stack, and goals..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  maxLength={200}
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
                  onClick={() => { setIsEditOpen(false); setSelectedProject(null); }}
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

      {/* 6. INDIVIDUAL DELETION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteProject}
        title="Delete Project?"
        message="Are you sure you want to permanently delete this project? This action cannot be undone. System deletion constraints are automatically evaluated."
      />

      {/* 7. BULK DELETION CONFIRM DIALOG */}
      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Selected Projects?"
        message={`Are you sure you want to delete ${selectedIds.length} selected projects? Associated module checks will still be evaluated, and only empty projects will be removed.`}
      />
    </div>
  );
};
