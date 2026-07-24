/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Release } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  GitPullRequest,
  Plus,
  Search,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  FileText,
  Calendar,
  Layers,
  BookOpen,
  Eye
} from 'lucide-react';

export const ReleasesView: React.FC = () => {
  const {
    releases,
    projects,
    modules,
    testCases,
    bugs,
    addRelease,
    updateRelease,
    deleteRelease,
    addNotification
  } = useApp();

  // Filters State
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [sortBy, setSortBy] = useState<'version' | 'id' | 'releaseDate'>('releaseDate');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  // Forms state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [viewRelease, setViewRelease] = useState<Release | null>(null);
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null);

  const [projectId, setProjectId] = useState('');
  const [version, setVersion] = useState('');
  const [releaseDate, setReleaseDate] = useState('');
  const [status, setStatus] = useState<Release['status']>('draft');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Sorting
  const handleSort = (field: 'version' | 'id' | 'releaseDate') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // SubmitHandler: Create Release
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!version.trim()) {
      setFormError('Release version (e.g. v1.0.0) is required.');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is required.');
      return;
    }
    if (!releaseDate) {
      setFormError('Target release date is required.');
      return;
    }

    const res = addRelease({
      projectId,
      version: version.trim(),
      releaseDate,
      status: 'draft',
      notes: notes.trim(),
      createdAt: new Date().toISOString()
    });

    if (res.success) {
      setVersion('');
      setProjectId('');
      setReleaseDate('');
      setNotes('');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to create release version.');
    }
  };

  // SubmitHandler: Edit Release
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedRelease) return;
    if (!version.trim()) {
      setFormError('Release version is required.');
      return;
    }
    if (!projectId) {
      setFormError('Project assignment is required.');
      return;
    }
    if (!releaseDate) {
      setFormError('Release target date is required.');
      return;
    }

    const res = updateRelease(selectedRelease.id, {
      projectId,
      version: version.trim(),
      releaseDate,
      status,
      notes: notes.trim()
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedRelease(null);
    } else {
      setFormError(res.error || 'Failed to update release.');
    }
  };

  const openEditModal = (rel: Release) => {
    setSelectedRelease(rel);
    setProjectId(rel.projectId);
    setVersion(rel.version);
    setReleaseDate(rel.releaseDate);
    setStatus(rel.status);
    setNotes(rel.notes);
    setFormError('');
    setIsEditOpen(true);
  };

  const confirmDeleteRelease = () => {
    if (!deleteTargetId) return;
    const res = deleteRelease(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Failed', res.error || 'Failed to delete release.', 'error');
    }
    setDeleteTargetId(null);
  };

  // Filter & Search
  const filteredReleases = releases.filter(r => {
    const matchesSearch = r.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.notes.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          r.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || r.projectId === projectFilter;
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesProject && matchesStatus;
  });

  // Sort
  const sortedReleases = [...filteredReleases].sort((a, b) => {
    let comparison = 0;
    if (sortBy === 'version') {
      comparison = a.version.localeCompare(b.version);
    } else if (sortBy === 'id') {
      comparison = a.id.localeCompare(b.id);
    } else if (sortBy === 'releaseDate') {
      comparison = a.releaseDate.localeCompare(b.releaseDate);
    }
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  // Pagination
  const totalPages = Math.ceil(sortedReleases.length / itemsPerPage) || 1;
  const paginatedReleases = sortedReleases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Top action header ribbon */}
      <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between shadow-xs">
        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search version changelogs..."
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
          />
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-2 items-center justify-end w-full md:w-auto">
          {/* Project filter */}
          <select
            value={projectFilter}
            onChange={(e) => { setProjectFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Projects</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="beta">Beta (Pre-release)</option>
            <option value="stable">Stable (Production)</option>
            <option value="archived">Archived</option>
          </select>

          {/* Trigger Create */}
          <button
            onClick={() => {
              setFormError('');
              setVersion('');
              setProjectId(projects[0]?.id || '');
              setReleaseDate('');
              setNotes('');
              setIsCreateOpen(true);
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Release</span>
          </button>
        </div>
      </div>

      {/* Main Table */}
      {sortedReleases.length === 0 ? (
        <EmptyState
          icon={<GitPullRequest className="w-10 h-10" />}
          title="No Release Cycles Declared"
          description={
            projects.length === 0
              ? "You must register a Project before defining release versions."
              : searchQuery
                ? "No releases match your version search filters."
                : "Structure your delivery schedule. Declare a release cycle version to map code integrations, regression test statuses, and delivery notes."
          }
          actionLabel={projects.length === 0 ? undefined : "Create Release"}
          onAction={
            projects.length === 0
              ? undefined
              : () => {
                  setFormError('');
                  setVersion('');
                  setProjectId(projects[0]?.id || '');
                  setReleaseDate('');
                  setNotes('');
                  setIsCreateOpen(true);
                }
          }
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-950/30 border-b border-slate-100 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-semibold text-xs uppercase tracking-wider">
                  <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('id')}>
                    <div className="flex items-center gap-1.5">
                      <span>Release ID</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('version')}>
                    <div className="flex items-center gap-1.5">
                      <span>Version</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4">Project Scope</th>
                  <th className="p-4 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('releaseDate')}>
                    <div className="flex items-center gap-1.5">
                      <span>Target Date</span>
                      <ArrowUpDown className="w-3 h-3 text-slate-400" />
                    </div>
                  </th>
                  <th className="p-4 w-28">Status</th>
                  <th className="p-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                {paginatedReleases.map(r => {
                  const parentProj = projects.find(p => p.id === r.projectId);
                  return (
                    <tr key={r.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                        {r.id}
                      </td>
                      <td className="p-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 dark:text-slate-200">{r.version}</span>
                          <span className="text-[11px] text-slate-450 mt-1 max-w-[240px] truncate">
                            {r.notes || <em className="text-slate-350">No release notes</em>}
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-semibold text-slate-600 dark:text-slate-450">
                        {parentProj ? `${parentProj.id} - ${parentProj.name}` : r.projectId}
                      </td>
                      <td className="p-4 text-xs font-mono font-bold text-slate-650 dark:text-slate-400">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(r.releaseDate).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          r.status === 'stable' ? 'bg-emerald-55 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450' :
                          r.status === 'beta' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400' :
                          r.status === 'draft' ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400' :
                          'bg-red-50 dark:bg-red-950/20 text-red-700'
                        }`}>
                          {r.status === 'beta' ? 'Beta Build' : r.status}
                        </span>
                      </td>
                      <td className="p-4 text-right flex items-center justify-end gap-1.5">
                        {/* View */}
                        <button
                          onClick={() => setViewRelease(r)}
                          title="View Release Details & Changelog"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => openEditModal(r)}
                          title="Edit Release notes/dates"
                          className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => setDeleteTargetId(r.id)}
                          title="Remove release version"
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
          <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-150 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <span>
                Showing {filteredReleases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredReleases.length, currentPage * itemsPerPage)} of {filteredReleases.length} releases
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
                className="px-2.5 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-750 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Prev
              </button>
              <span>{currentPage} / {totalPages}</span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1.5 border border-slate-250 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900 text-slate-750 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE RELEASE MODAL */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 md:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                    <span>Plan Release Scope</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Define target version, project assignment, schedule date, and scope changelog details
                  </p>
                </div>
              </div>
              <button onClick={() => setIsCreateOpen(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Version Tag <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    placeholder="e.g., v1.10.3-rc2"
                    value={version}
                    onChange={(e) => setVersion(e.target.value)}
                    maxLength={20}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Target Project <span className="text-red-500">*</span></label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm font-medium rounded-xl focus:outline-hidden cursor-pointer"
                    required
                  >
                    <option value="" disabled>-- Target Project --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Release Target Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Release Changelog / Scope Details</label>
                <textarea
                  placeholder="e.g., Includes critical multi-factor auth features, security hardening patches..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Schedule Release
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT RELEASE MODAL */}
      {isEditOpen && selectedRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedRelease(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 md:p-8">
            <div className="flex items-center justify-between mb-5 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <Edit className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-wide flex items-center gap-2">
                    <span>Edit Release Scope</span>
                    <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">{selectedRelease.id}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Modify release schedule date, status lifecycle, and changelog scope
                  </p>
                </div>
              </div>
              <button onClick={() => { setIsEditOpen(false); setSelectedRelease(null); }} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-xl">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Version Tag <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="e.g., v1.10.3-rc2"
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  maxLength={20}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Scope Project</label>
                  <select
                    value={projectId}
                    onChange={(e) => setProjectId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm font-medium rounded-xl focus:outline-hidden"
                    required
                  >
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.id} - {p.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Build Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as Release['status'])}
                    className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm font-medium rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="draft">Draft</option>
                    <option value="beta">Beta Build</option>
                    <option value="stable">Stable Build</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Release Target Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={releaseDate}
                  onChange={(e) => setReleaseDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Release Changelog / Details</label>
                <textarea
                  placeholder="Details..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedRelease(null); }}
                  className="px-5 py-2.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW RELEASE MODAL */}
      {viewRelease && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setViewRelease(null)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 md:p-8 animate-fade-in max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                  <GitPullRequest className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white font-sans">
                      {viewRelease.version}
                    </h3>
                    <span className="font-mono text-xs font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                      {viewRelease.id}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Release Version Details
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setViewRelease(null)} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="overflow-y-auto py-4 space-y-5 text-sm">
              {/* Status and Key Meta Grid */}
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 rounded-xl">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Build Status
                  </span>
                  <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                    viewRelease.status === 'stable' ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400' :
                    viewRelease.status === 'beta' ? 'bg-purple-50 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400' :
                    viewRelease.status === 'draft' ? 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' :
                    'bg-red-50 dark:bg-red-950/20 text-red-700'
                  }`}>
                    {viewRelease.status === 'beta' ? 'Beta Build' : viewRelease.status}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Project Scope
                  </span>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>
                      {projects.find(p => p.id === viewRelease.projectId)?.name || viewRelease.projectId}
                    </span>
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Target Release Date
                  </span>
                  <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    {new Date(viewRelease.releaseDate).toLocaleDateString(undefined, { dateStyle: 'full' })}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                    Created Date
                  </span>
                  <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
                    {new Date(viewRelease.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Release Changelog & Details */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Release Changelog / Details</span>
                </label>
                <div className="p-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-800 dark:text-slate-200 text-xs leading-relaxed whitespace-pre-wrap min-h-[90px]">
                  {viewRelease.notes ? (
                    viewRelease.notes
                  ) : (
                    <span className="italic text-slate-400">No changelog or release details provided.</span>
                  )}
                </div>
              </div>

              {/* Associated Project Inventory */}
              {(() => {
                const projModules = modules.filter(m => m.projectId === viewRelease.projectId);
                const projCases = testCases.filter(tc => tc.projectId === viewRelease.projectId);
                const projBugs = bugs.filter(b => b.projectId === viewRelease.projectId);

                return (
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                      Scope Project Stats ({viewRelease.projectId})
                    </span>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-base font-black text-slate-800 dark:text-slate-200 block">{projModules.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Modules</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-base font-black text-indigo-600 dark:text-indigo-400 block">{projCases.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Test Cases</span>
                      </div>
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-150 dark:border-slate-800 rounded-xl text-center">
                        <span className="text-base font-black text-rose-600 dark:text-rose-400 block">{projBugs.length}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Total Defects</span>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800 mt-auto">
              <button
                type="button"
                onClick={() => {
                  const rel = viewRelease;
                  setViewRelease(null);
                  openEditModal(rel);
                }}
                className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Release</span>
              </button>
              <button
                type="button"
                onClick={() => setViewRelease(null)}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRMS */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={confirmDeleteRelease}
        title="Delete Release Schedule?"
        message="Are you sure you want to permanently delete this release scheduled version? Associated checklist logs are not modified, but delivery version tracking metadata is removed."
      />
    </div>
  );
};
