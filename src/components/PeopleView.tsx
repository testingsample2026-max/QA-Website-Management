/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Developer, QaEngineer } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  Users,
  Plus,
  Search,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  Code,
  ShieldCheck,
  Mail,
  UserCheck,
  AlertCircle
} from 'lucide-react';

export const ROLE_LABELS: Record<string, string> = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  fullstack: 'Fullstack Developer',
  ui: 'UI Designer',
  mobileapp: 'Mobile App Developer'
};

export const PeopleView: React.FC<{ defaultSection?: 'devs' | 'qas' }> = ({ defaultSection = 'devs' }) => {
  const {
    developers,
    qaEngineers,
    bugs,
    executions,
    addDeveloper,
    updateDeveloper,
    deleteDeveloper,
    addQaEngineer,
    updateQaEngineer,
    deleteQaEngineer,
    addNotification
  } = useApp();

  // Unified Tab State
  const [activeSubTab, setActiveSubTab] = useState<'devs' | 'qas'>(defaultSection);

  // Sync state if prop changes
  React.useEffect(() => {
    setActiveSubTab(defaultSection);
  }, [defaultSection]);

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');

  // Developer Form State
  const [isDevCreateOpen, setIsDevCreateOpen] = useState(false);
  const [isDevEditOpen, setIsDevEditOpen] = useState(false);
  const [selectedDev, setSelectedDev] = useState<Developer | null>(null);
  const [devName, setDevName] = useState('');
  const [devEmail, setDevEmail] = useState('');
  const [devRole, setDevRole] = useState('fullstack');

  // QA Engineer Form State
  const [isQaCreateOpen, setIsQaCreateOpen] = useState(false);
  const [isQaEditOpen, setIsQaEditOpen] = useState(false);
  const [selectedQa, setSelectedQa] = useState<QaEngineer | null>(null);
  const [qaName, setQaName] = useState('');
  const [qaEmail, setQaEmail] = useState('');
  const [qaRole, setQaRole] = useState('Software Tester');

  const [formError, setFormError] = useState('');

  // Delete Target states
  const [deleteDevId, setDeleteDevId] = useState<string | null>(null);
  const [deleteQaId, setDeleteQaId] = useState<string | null>(null);

  // Business Logic Helpers: Counts
  const getActiveBugsForDev = (devId: string) => {
    return bugs.filter(b => b.assignedDevId === devId && b.status !== 'closed' && b.status !== 'rejected').length;
  };

  const getExecutionsForQa = (qaId: string) => {
    return executions.filter(e => e.executedById === qaId).length;
  };

  // Submit Handler: Developer Create
  const handleDevCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!devName.trim()) {
      setFormError('Developer name is required.');
      return;
    }
    if (!devEmail.trim() || !devEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = addDeveloper({
      name: devName.trim(),
      email: devEmail.trim().toLowerCase(),
      role: devRole
    });

    if (res.success) {
      setDevName('');
      setDevEmail('');
      setDevRole('fullstack');
      setIsDevCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to register developer.');
    }
  };

  // Submit Handler: Developer Edit
  const handleDevEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedDev) return;
    if (!devName.trim()) {
      setFormError('Developer name is required.');
      return;
    }
    if (!devEmail.trim() || !devEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = updateDeveloper(selectedDev.id, {
      name: devName.trim(),
      email: devEmail.trim().toLowerCase(),
      role: devRole
    });

    if (res.success) {
      setIsDevEditOpen(false);
      setSelectedDev(null);
    } else {
      setFormError(res.error || 'Failed to update developer.');
    }
  };

  // Submit Handler: QA Engineer Create
  const handleQaCreate = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!qaName.trim()) {
      setFormError('QA Engineer name is required.');
      return;
    }
    if (!qaEmail.trim() || !qaEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = addQaEngineer({
      name: qaName.trim(),
      email: qaEmail.trim().toLowerCase(),
      role: qaRole
    });

    if (res.success) {
      setQaName('');
      setQaEmail('');
      setQaRole('Software Tester');
      setIsQaCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to register QA Engineer.');
    }
  };

  // Submit Handler: QA Engineer Edit
  const handleQaEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedQa) return;
    if (!qaName.trim()) {
      setFormError('QA Engineer name is required.');
      return;
    }
    if (!qaEmail.trim() || !qaEmail.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }

    const res = updateQaEngineer(selectedQa.id, {
      name: qaName.trim(),
      email: qaEmail.trim().toLowerCase(),
      role: qaRole
    });

    if (res.success) {
      setIsQaEditOpen(false);
      setSelectedQa(null);
    } else {
      setFormError(res.error || 'Failed to update QA Engineer.');
    }
  };

  const openDevEdit = (dev: Developer) => {
    setSelectedDev(dev);
    setDevName(dev.name);
    setDevEmail(dev.email);
    setDevRole(dev.role);
    setFormError('');
    setIsDevEditOpen(true);
  };

  const openQaEdit = (qa: QaEngineer) => {
    setSelectedQa(qa);
    setQaName(qa.name);
    setQaEmail(qa.email);
    setQaRole(qa.role);
    setFormError('');
    setIsQaEditOpen(true);
  };

  const confirmDeleteDev = () => {
    if (!deleteDevId) return;
    const res = deleteDeveloper(deleteDevId);
    if (!res.success) {
      addNotification(
        'Deletion Blocked',
        res.error || 'This developer has active, unresolved defects assigned and cannot be removed.',
        'error'
      );
    }
    setDeleteDevId(null);
  };

  const confirmDeleteQa = () => {
    if (!deleteQaId) return;
    const res = deleteQaEngineer(deleteQaId);
    if (!res.success) {
      addNotification(
        'Deletion Blocked',
        res.error || 'This engineer is the reporter/author of historical test executions and cannot be deleted.',
        'error'
      );
    }
    setDeleteQaId(null);
  };

  // Filtering
  const filteredDevs = developers.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQas = qaEngineers.filter(q =>
    q.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* View Header Tabs */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl shadow-xs">
        {/* Toggle switches */}
        <div className="flex bg-slate-100 dark:bg-slate-950 p-1 rounded-xl self-start">
          <button
            onClick={() => { setActiveSubTab('devs'); setSearchQuery(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'devs'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Developers Directory</span>
          </button>
          <button
            onClick={() => { setActiveSubTab('qas'); setSearchQuery(''); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeSubTab === 'qas'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-850 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>QA Engineers Team</span>
          </button>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <div className="relative w-full md:w-60">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder={`Search ${activeSubTab === 'devs' ? 'developers' : 'engineers'}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => {
              setFormError('');
              if (activeSubTab === 'devs') {
                setDevName('');
                setDevEmail('');
                setDevRole('fullstack');
                setIsDevCreateOpen(true);
              } else {
                setQaName('');
                setQaEmail('');
                setQaRole('Software Tester');
                setIsQaCreateOpen(true);
              }
            }}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl cursor-pointer shadow-sm shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add {activeSubTab === 'devs' ? 'Dev' : 'QA'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid Content depending on selected Sub-tab */}
      {activeSubTab === 'devs' ? (
        // Developers tab content
        filteredDevs.length === 0 ? (
          <EmptyState
            icon={<Code className="w-10 h-10" />}
            title="No Developers Enrolled"
            description={
              searchQuery
                ? "No developers match your current lookup criteria."
                : "Register the software engineers working on your codebase to assign them incoming bugs, track unresolved issues, and log repairs."
            }
            actionLabel={searchQuery ? undefined : "Add Developer"}
            onAction={
              searchQuery
                ? undefined
                : () => {
                    setFormError('');
                    setDevName('');
                    setDevEmail('');
                    setDevRole('fullstack');
                    setIsDevCreateOpen(true);
                  }
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevs.map(dev => {
              const activeBugs = getActiveBugsForDev(dev.id);
              return (
                <div
                  key={dev.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4 hover:shadow-md transition-shadow relative overflow-hidden group"
                >
                  {/* Decorative badge card */}
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 rounded-xl">
                        <Code className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{dev.name}</h4>
                          <span className="px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-[9px] rounded-md font-bold uppercase tracking-wider">
                            {ROLE_LABELS[dev.role] || dev.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase font-semibold">
                          {dev.id}
                        </span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => openDevEdit(dev)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                        title="Edit Developer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteDevId(dev.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Remove Developer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-50 dark:border-slate-850/30 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{dev.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-450 dark:text-slate-500 font-medium">Pending Resolved Bugs</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        activeBugs > 0
                          ? 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 animate-pulse'
                          : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450'
                      }`}>
                        {activeBugs} Active
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : (
        // QA Engineers Tab Content
        filteredQas.length === 0 ? (
          <EmptyState
            icon={<ShieldCheck className="w-10 h-10" />}
            title="No QA Engineers Registered"
            description={
              searchQuery
                ? "No QA Engineers match your lookup filters."
                : "Register the quality engineers writing checklists, organizing tests, tracking coverage, and logging execution trials."
            }
            actionLabel={searchQuery ? undefined : "Add QA Engineer"}
            onAction={
              searchQuery
                ? undefined
                : () => {
                    setFormError('');
                    setQaName('');
                    setQaEmail('');
                    setQaRole('Software Tester');
                    setIsQaCreateOpen(true);
                  }
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredQas.map(qa => {
              const execsCount = getExecutionsForQa(qa.id);
              return (
                <div
                  key={qa.id}
                  className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 shadow-xs flex flex-col gap-4 hover:shadow-md transition-all relative group"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-450 rounded-xl">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm">{qa.name}</h4>
                          <span className="px-1.5 py-0.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 text-[9px] rounded-md font-bold uppercase tracking-wider">
                            {qa.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono uppercase font-semibold">
                          {qa.id}
                        </span>
                      </div>
                    </div>

                    <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                      <button
                        onClick={() => openQaEdit(qa)}
                        className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-850 dark:hover:text-slate-200 rounded-lg cursor-pointer"
                        title="Edit QA Engineer"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteQaId(qa.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/30 text-slate-500 hover:text-red-600 rounded-lg cursor-pointer"
                        title="Remove QA Engineer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 border-t border-slate-50 dark:border-slate-850/30 pt-3">
                    <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400 font-sans">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate max-w-[200px]">{qa.email}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="text-slate-450 dark:text-slate-500 font-medium">Logged Execution Runs</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 font-bold text-[10px]">
                        {execsCount} runs
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* --- DEV CREATE MODAL --- */}
      {isDevCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsDevCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-500" />
                <span>Register Developer</span>
              </h3>
              <button onClick={() => setIsDevCreateOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDevCreate} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ada Lovelace"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., ada@enterprise.io"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Functional Role</label>
                <select
                  value={devRole}
                  onChange={(e) => setDevRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer font-semibold"
                >
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="fullstack">Fullstack Developer</option>
                  <option value="ui">UI Designer</option>
                  <option value="mobileapp">Mobile App Developer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsDevCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DEV EDIT MODAL --- */}
      {isDevEditOpen && selectedDev && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsDevEditOpen(false); setSelectedDev(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4 text-indigo-500" />
                <span>Edit Developer {selectedDev.id}</span>
              </h3>
              <button onClick={() => { setIsDevEditOpen(false); setSelectedDev(null); }} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleDevEdit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Ada Lovelace"
                  value={devName}
                  onChange={(e) => setDevName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., ada@enterprise.io"
                  value={devEmail}
                  onChange={(e) => setDevEmail(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Functional Role</label>
                <select
                  value={devRole}
                  onChange={(e) => setDevRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer font-semibold"
                >
                  <option value="frontend">Frontend Developer</option>
                  <option value="backend">Backend Developer</option>
                  <option value="fullstack">Fullstack Developer</option>
                  <option value="ui">UI Designer</option>
                  <option value="mobileapp">Mobile App Developer</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsDevEditOpen(false); setSelectedDev(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
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

      {/* --- QA CREATE MODAL --- */}
      {isQaCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsQaCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Register QA Engineer</span>
              </h3>
              <button onClick={() => setIsQaCreateOpen(false)} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQaCreate} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Margaret Hamilton"
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., margaret@enterprise.io"
                  value={qaEmail}
                  onChange={(e) => setQaEmail(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Functional Role</label>
                <select
                  value={qaRole}
                  onChange={(e) => setQaRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer font-semibold"
                >
                  <option value="Software Tester">Software Tester</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsQaCreateOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm cursor-pointer"
                >
                  Enroll
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- QA EDIT MODAL --- */}
      {isQaEditOpen && selectedQa && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsQaEditOpen(false); setSelectedQa(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Edit className="w-4 h-4 text-emerald-500" />
                <span>Edit Engineer {selectedQa.id}</span>
              </h3>
              <button onClick={() => { setIsQaEditOpen(false); setSelectedQa(null); }} className="p-1 hover:bg-slate-100 text-slate-400 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQaEdit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-xs font-semibold rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Full Name</label>
                <input
                  type="text"
                  placeholder="e.g., Margaret Hamilton"
                  value={qaName}
                  onChange={(e) => setQaName(e.target.value)}
                  maxLength={40}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Email Address</label>
                <input
                  type="email"
                  placeholder="e.g., margaret@enterprise.io"
                  value={qaEmail}
                  onChange={(e) => setQaEmail(e.target.value)}
                  maxLength={50}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase">Functional Role</label>
                <select
                  value={qaRole}
                  onChange={(e) => setQaRole(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden cursor-pointer font-semibold"
                >
                  <option value="Software Tester">Software Tester</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsQaEditOpen(false); setSelectedQa(null); }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 text-xs font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-850"
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

      {/* CONFIRMS */}
      <ConfirmDialog
        isOpen={deleteDevId !== null}
        onClose={() => setDeleteDevId(null)}
        onConfirm={confirmDeleteDev}
        title="Remove Developer?"
        message="Are you sure you want to enroll this developer off the team? This action is strictly blocked if the developer has active unresolved bugs assigned to them."
      />

      <ConfirmDialog
        isOpen={deleteQaId !== null}
        onClose={() => setDeleteQaId(null)}
        onConfirm={confirmDeleteQa}
        title="Remove QA Engineer?"
        message="Are you sure you want to remove this engineer? This action is blocked if they have reported execution history in the run ledger."
      />
    </div>
  );
};
