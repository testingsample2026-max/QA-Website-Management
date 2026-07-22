/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { TestCase, TestExecution } from '../types';
import { EmptyState } from './EmptyState';
import { ConfirmDialog } from './ConfirmDialog';
import {
  FileSpreadsheet,
  Plus,
  Search,
  Filter,
  Copy,
  Trash2,
  Edit,
  ArrowUpDown,
  X,
  Archive,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Activity,
  History,
  ShieldCheck,
  Layers,
  BookOpen,
  Info,
  Paperclip,
  UploadCloud,
  Eye,
  Download,
  Video,
  Film,
  FileText,
  File
} from 'lucide-react';

const isImageFile = (att: { name: string; type?: string; data: string }) => {
  return (
    (att.type && att.type.startsWith('image/')) ||
    (att.data && att.data.startsWith('data:image/')) ||
    /\.(jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(att.name)
  );
};

const isVideoFile = (att: { name: string; type?: string; data: string }) => {
  return (
    (att.type && att.type.startsWith('video/')) ||
    (att.data && att.data.startsWith('data:video/')) ||
    /\.(mp4|webm|ogg|mov|m4v|mkv|avi)$/i.test(att.name)
  );
};

const isPdfFile = (att: { name: string; type?: string; data: string }) => {
  return (
    (att.type && att.type.includes('pdf')) ||
    (att.data && att.data.startsWith('data:application/pdf')) ||
    /\.pdf$/i.test(att.name)
  );
};

const isWordFile = (att: { name: string; type?: string; data: string }) => {
  return (
    (att.type && (att.type.includes('word') || att.type.includes('officedocument'))) ||
    /\.(doc|docx)$/i.test(att.name)
  );
};

export const TestCasesView: React.FC = () => {
  const {
    testCases,
    projects,
    modules,
    requirements,
    qaEngineers,
    executions,
    bugs,
    developers,
    addTestCase,
    updateTestCase,
    deleteTestCase,
    archiveTestCase,
    restoreTestCase,
    duplicateTestCase,
    addTestExecution,
    bulkUpdate,
    bulkDelete,
    addNotification,
    testCaseFilter,
    setTestCaseFilter
  } = useApp();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [moduleFilter, setModuleFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [execStatusFilter, setExecStatusFilter] = useState<string>('all');

  useEffect(() => {
    if (testCaseFilter && testCaseFilter !== 'all') {
      setExecStatusFilter(testCaseFilter);
      setTestCaseFilter('all');
    }
  }, [testCaseFilter, setTestCaseFilter]);

  const [sortBy, setSortBy] = useState<'title' | 'id' | 'priority'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Drawer / Side Panel for executions & details
  const [activeTestCaseId, setActiveTestCaseId] = useState<string | null>(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewTestCase, setViewTestCase] = useState<TestCase | null>(null);

  // Execution Form state
  const [execStatus, setExecStatus] = useState<TestExecution['status']>('passed');
  const [executedById, setExecutedById] = useState('');
  const [execNotes, setExecNotes] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [runTimeMs, setRunTimeMs] = useState('');
  const [execFormError, setExecFormError] = useState('');
  const [executionAttachments, setExecutionAttachments] = useState<{ name: string; type: string; data: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{ name: string; url: string; type: 'image' | 'video' } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addAttachment = (name: string, type: string, data: string) => {
    setExecutionAttachments(prev => {
      if (prev.some(p => p.name === name)) return prev;
      return [
        ...prev,
        { name, type, data }
      ];
    });
  };

  const processFiles = (files: File[]) => {
    files.forEach(file => {
      if (file.size > 15 * 1024 * 1024) {
        addNotification('File Too Large', `File "${file.name}" is too large (> 15MB). Please attach files under 15MB.`, 'error');
        return;
      }

      if (file.type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|bmp|svg)$/i.test(file.name)) {
        const reader = new FileReader();
        reader.onload = () => {
          const rawResult = reader.result as string;
          const imageMime = file.type || (/\.png$/i.test(file.name) ? 'image/png' : 'image/jpeg');
          if (file.size <= 800 * 1024) {
            addAttachment(file.name, imageMime, rawResult);
            return;
          }

          // Compress large images using canvas
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              const MAX = 1200;

              if (width > MAX || height > MAX) {
                if (width > height) {
                  height = Math.round((height * MAX) / width);
                  width = MAX;
                } else {
                  width = Math.round((width * MAX) / height);
                  height = MAX;
                }
              }

              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, width, height);
                ctx.drawImage(img, 0, 0, width, height);
                const compressedUrl = canvas.toDataURL('image/jpeg', 0.7);
                addAttachment(file.name, imageMime, compressedUrl);
              } else {
                addAttachment(file.name, imageMime, rawResult);
              }
            } catch (err) {
              addAttachment(file.name, imageMime, rawResult);
            }
          };
          img.onerror = () => {
            addAttachment(file.name, imageMime, rawResult);
          };
          img.src = rawResult;
        };
        reader.onerror = () => {
          addNotification('Upload Failed', `Could not read "${file.name}"`, 'error');
        };
        reader.readAsDataURL(file);
      } else {
        const reader = new FileReader();
        reader.onload = () => {
          const rawResult = reader.result as string;
          let mimeType = file.type;
          if (!mimeType) {
            if (/\.(mp4|webm|ogg|mov|m4v|mkv)$/i.test(file.name)) {
              mimeType = 'video/mp4';
            } else if (/\.pdf$/i.test(file.name)) {
              mimeType = 'application/pdf';
            } else if (/\.docx$/i.test(file.name)) {
              mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
            } else if (/\.doc$/i.test(file.name)) {
              mimeType = 'application/msword';
            } else {
              mimeType = 'application/octet-stream';
            }
          }
          addAttachment(file.name, mimeType, rawResult);
        };
        reader.onerror = () => {
          addNotification('Upload Failed', `Could not read "${file.name}"`, 'error');
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(Array.from(e.target.files));
    }
    e.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  };

  const removeAttachment = (name: string) => {
    setExecutionAttachments(prev => prev.filter(att => att.name !== name));
  };

  // Helper to load an execution into the editing form fields
  const loadExecutionIntoForm = (exec: TestExecution) => {
    setExecStatus(exec.status || 'passed');
    if (exec.executedById) {
      setExecutedById(exec.executedById);
    }
    setActualResult(exec.actualResult || '');
    setRunTimeMs(exec.runTimeMs !== null && exec.runTimeMs !== undefined ? exec.runTimeMs.toString() : '');
    setExecNotes(exec.notes || '');
    setExecutionAttachments(exec.attachments || []);
  };

  // Test Case Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedTestCase, setSelectedTestCase] = useState<TestCase | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [moduleId, setModuleId] = useState('');
  const [requirementId, setRequirementId] = useState('');
  const [preconditions, setPreconditions] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [priority, setPriority] = useState<TestCase['priority']>('medium');
  const [tcType, setTcType] = useState<TestCase['type']>('manual');
  const [tcStatus, setTcStatus] = useState<TestCase['status']>('active');
  const [assignedQaId, setAssignedQaId] = useState('');
  const [formError, setFormError] = useState('');

  // Bulk dialogs
  const [isBulkEditOpen, setIsBulkEditOpen] = useState(false);
  const [bulkStatus, setBulkStatus] = useState<TestCase['status'] | ''>('');
  const [bulkPriority, setBulkPriority] = useState<TestCase['priority'] | ''>('');

  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);

  // Filter modules/reqs dynamically for form entry
  const availableFormModules = modules.filter(m => m.projectId === projectId);
  const availableFormReqs = requirements.filter(r => r.moduleId === moduleId);

  const activeTestCase = testCases.find(t => t.id === activeTestCaseId);
  const activeTestCaseExecutions = executions.filter(e => e.testCaseId === activeTestCaseId);

  // Pre-fill execution fields from existing executions when selecting a test case
  useEffect(() => {
    if (activeTestCaseId && activeTestCase) {
      if (activeTestCase.assignedQaId) {
        setExecutedById(activeTestCase.assignedQaId);
      } else if (qaEngineers.length > 0) {
        setExecutedById(qaEngineers[0].id);
      } else {
        setExecutedById('System Default QA');
      }

      // Find latest execution for this test case to pre-fill Actual Result, Duration, Notes & Attachments
      const tcExecs = executions.filter(e => e.testCaseId === activeTestCaseId);
      if (tcExecs.length > 0) {
        const latest = [...tcExecs].sort((a, b) => new Date(b.executionDate).getTime() - new Date(a.executionDate).getTime())[0];
        setExecStatus(latest.status || 'passed');
        setActualResult(latest.actualResult || '');
        setRunTimeMs(latest.runTimeMs !== null && latest.runTimeMs !== undefined ? latest.runTimeMs.toString() : '');
        setExecNotes(latest.notes || '');
        setExecutionAttachments(latest.attachments || []);
      } else {
        setExecStatus('passed');
        setActualResult('');
        setRunTimeMs('');
        setExecNotes('');
        setExecutionAttachments([]);
      }
    }
  }, [activeTestCaseId]);

  // Sorting
  const handleSort = (field: 'title' | 'id' | 'priority') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Submit Handler: Log Execution
  const handleLogExecution = (e: React.FormEvent) => {
    e.preventDefault();
    setExecFormError('');

    if (!activeTestCaseId) return;
    if (!executedById) {
      setExecFormError('Please assign an executing QA Engineer.');
      return;
    }
    if (!actualResult.trim()) {
      setExecFormError('Actual result is required.');
      return;
    }

    const res = addTestExecution({
      testCaseId: activeTestCaseId,
      projectId: activeTestCase.projectId,
      moduleId: activeTestCase.moduleId,
      status: execStatus,
      executedById,
      notes: execNotes.trim(),
      actualResult: actualResult.trim(),
      runTimeMs: runTimeMs ? parseInt(runTimeMs) : null,
      attachments: executionAttachments
    });

    if (res.success) {
      addNotification("Execution Tracked", `Logged execution for ${activeTestCaseId} successfully.`, 'success');
      // Intentionally keep actualResult, runTimeMs, execNotes, and executionAttachments filled so user edits are retained and not reset
    } else {
      setExecFormError(res.error || 'Failed to log execution.');
    }
  };

  // Submit Handler: Create Test Case
  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!title.trim()) {
      setFormError('Test Case title is mandatory');
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
    if (!expectedResult.trim()) {
      setFormError('Expected result description is mandatory');
      return;
    }

    const parsedSteps = stepsText.split('\n').map(s => s.trim()).filter(Boolean);

    const res = addTestCase({
      title: title.trim(),
      description: description.trim(),
      projectId,
      moduleId,
      requirementId: requirementId || null,
      preconditions: preconditions.trim(),
      steps: parsedSteps,
      expectedResult: expectedResult.trim(),
      priority,
      type: tcType,
      status: 'active',
      assignedQaId: assignedQaId || null
    });

    if (res.success) {
      setTitle('');
      setDescription('');
      setProjectId('');
      setModuleId('');
      setRequirementId('');
      setPreconditions('');
      setStepsText('');
      setExpectedResult('');
      setAssignedQaId('');
      setIsCreateOpen(false);
    } else {
      setFormError(res.error || 'Failed to create test case');
    }
  };

  // Submit Handler: Edit Test Case
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!selectedTestCase) return;
    if (!title.trim()) {
      setFormError('Test Case title is mandatory');
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
    if (!expectedResult.trim()) {
      setFormError('Expected result description is mandatory');
      return;
    }

    const parsedSteps = stepsText.split('\n').map(s => s.trim()).filter(Boolean);

    const res = updateTestCase(selectedTestCase.id, {
      title: title.trim(),
      description: description.trim(),
      projectId,
      moduleId,
      requirementId: requirementId || null,
      preconditions: preconditions.trim(),
      steps: parsedSteps,
      expectedResult: expectedResult.trim(),
      priority,
      type: tcType,
      status: tcStatus,
      assignedQaId: assignedQaId || null
    });

    if (res.success) {
      setIsEditOpen(false);
      setSelectedTestCase(null);
    } else {
      setFormError(res.error || 'Failed to update test case');
    }
  };

  const openEditModal = (tc: TestCase) => {
    setSelectedTestCase(tc);
    setTitle(tc.title);
    setDescription(tc.description);
    setProjectId(tc.projectId);
    setModuleId(tc.moduleId);
    setRequirementId(tc.requirementId || '');
    setPreconditions(tc.preconditions);
    setStepsText(tc.steps.join('\n'));
    setExpectedResult(tc.expectedResult);
    setPriority(tc.priority);
    setTcType(tc.type);
    setTcStatus(tc.status);
    setAssignedQaId(tc.assignedQaId || '');
    setFormError('');
    setIsEditOpen(true);
  };

  const handleProjectFormChange = (projId: string) => {
    setProjectId(projId);
    const firstMod = modules.find(m => m.projectId === projId);
    setModuleId(firstMod?.id || '');
    const firstReq = requirements.find(r => r.moduleId === firstMod?.id);
    setRequirementId(firstReq?.id || '');
  };

  const handleModuleFormChange = (modId: string) => {
    setModuleId(modId);
    const firstReq = requirements.find(r => r.moduleId === modId);
    setRequirementId(firstReq?.id || '');
  };

  const confirmDeleteTestCase = () => {
    if (!deleteTargetId) return;
    const res = deleteTestCase(deleteTargetId);
    if (!res.success) {
      addNotification('Deletion Blocked', res.error || 'This test case cannot be permanently deleted.', 'error');
    }
    setDeleteTargetId(null);
  };

  const confirmBulkDelete = () => {
    const res = bulkDelete('TestCase', selectedIds);
    if (res.success) {
      setSelectedIds([]);
    } else {
      addNotification('Bulk Deletion Failed', res.error || 'Some executed test cases were skipped and must be archived.', 'error');
    }
    setIsBulkDeleteOpen(false);
  };

  const handleBulkUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updates: any = {};
    if (bulkStatus) updates.status = bulkStatus;
    if (bulkPriority) updates.priority = bulkPriority;

    if (Object.keys(updates).length > 0) {
      bulkUpdate('TestCase', selectedIds, updates);
      setSelectedIds([]);
      setIsBulkEditOpen(false);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(rowId => rowId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = (visibleCases: TestCase[]) => {
    const visibleIds = visibleCases.map(c => c.id);
    const allSelected = visibleIds.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  // Execution Status indicator renderer
  const getExecBadge = (status: TestCase['lastExecutionStatus'] | TestExecution['status']) => {
    switch (status) {
      case 'passed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold uppercase shrink-0"><CheckCircle2 className="w-3 h-3" />Passed</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 text-[10px] font-bold uppercase shrink-0"><XCircle className="w-3 h-3" />Failed</span>;
      case 'blocked':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 text-[10px] font-bold uppercase shrink-0"><AlertTriangle className="w-3 h-3" />Blocked</span>;
      case 'retest':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/30 text-cyan-700 dark:text-cyan-400 text-[10px] font-bold uppercase shrink-0"><Clock className="w-3 h-3" />Retest</span>;
      case 'testing':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 text-[10px] font-bold uppercase shrink-0"><Activity className="w-3.5 h-3.5 animate-pulse" />In Testing</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] font-bold uppercase shrink-0">Unexecuted</span>;
    }
  };

  // Filter test cases
  const filteredTestCases = testCases.filter(tc => {
    const matchesSearch = tc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tc.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesProject = projectFilter === 'all' || tc.projectId === projectFilter;
    const matchesModule = moduleFilter === 'all' || tc.moduleId === moduleFilter;
    const matchesPriority = priorityFilter === 'all' || tc.priority === priorityFilter;
    const matchesType = typeFilter === 'all' || tc.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || tc.status === statusFilter;
    const matchesExecStatus = execStatusFilter === 'all'
      ? true
      : execStatusFilter === 'unexecuted'
        ? tc.lastExecutionStatus === 'unexecuted' || tc.lastExecutionStatus === 'testing'
        : tc.lastExecutionStatus === execStatusFilter;
    
    return matchesSearch && matchesProject && matchesModule && matchesPriority && matchesType && matchesStatus && matchesExecStatus;
  });

  // Sort
  const sortedTestCases = [...filteredTestCases].sort((a, b) => {
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

  // Pagination
  const totalPages = Math.ceil(sortedTestCases.length / itemsPerPage) || 1;
  const paginatedCases = sortedTestCases.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* LEFT / CENTER: Test Cases Table List */}
      <div className="space-y-6 xl:col-span-3">
        {/* Filter Toolbar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 p-4 rounded-2xl flex flex-col gap-4 shadow-xs">
          <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
            {/* Search */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search test cases by ID, title..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
              />
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2 justify-end w-full md:w-auto">
              {/* Status Filter */}
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="draft">Draft</option>
                <option value="deprecated">Deprecated</option>
                <option value="archived">Archived</option>
              </select>

              {/* Execution Status Filter */}
              <select
                value={execStatusFilter}
                onChange={(e) => { setExecStatusFilter(e.target.value); setCurrentPage(1); }}
                className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
              >
                <option value="all">All Run Results</option>
                <option value="unexecuted">Unexecuted</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="blocked">Blocked</option>
                <option value="retest">Retest</option>
              </select>

              {/* New Test Case Button */}
              <button
                onClick={() => {
                  setFormError('');
                  setTitle('');
                  setDescription('');
                  setProjectId(projects[0]?.id || '');
                  const firstMod = modules.find(m => m.projectId === projects[0]?.id);
                  setModuleId(firstMod?.id || '');
                  const firstReq = requirements.find(r => r.moduleId === firstMod?.id);
                  setRequirementId(firstReq?.id || '');
                  setPreconditions('');
                  setStepsText('');
                  setExpectedResult('');
                  setPriority('medium');
                  setTcType('manual');
                  setAssignedQaId(qaEngineers[0]?.id || '');
                  setIsCreateOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Case</span>
              </button>
            </div>
          </div>

          {/* Expanded dropdown selection filters */}
          <div className="grid grid-cols-2 gap-3 border-t border-slate-100 dark:border-slate-800 pt-3">
            <select
              value={projectFilter}
              onChange={(e) => { setProjectFilter(e.target.value); setModuleFilter('all'); setCurrentPage(1); }}
              className="w-full px-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium rounded-xl cursor-pointer"
            >
              <option value="all">Filter Project: All</option>
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
              <option value="all">Filter Module: All</option>
              {modules.filter(m => m.projectId === projectFilter).map(m => (
                <option key={m.id} value={m.id}>{m.id} - {m.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Bulk tools bar */}
        {selectedIds.length > 0 && (
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-150 dark:border-indigo-900/40 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="text-xs font-medium text-indigo-800 dark:text-indigo-400">
              Selected <strong>{selectedIds.length}</strong> test case(s)
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setBulkStatus(''); setBulkPriority(''); setIsBulkEditOpen(true); }}
                className="px-2.5 py-1 bg-white hover:bg-slate-550 dark:bg-slate-800 dark:hover:bg-slate-750 text-slate-800 dark:text-slate-300 text-xs font-medium rounded-lg border border-slate-250 dark:border-slate-700 cursor-pointer"
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
                Deselect
              </button>
            </div>
          </div>
        )}

        {/* Active Module Header */}
        <div className="bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-xs">
          <div>
            <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest block">
              Active Module Context
            </span>
            <h3 className="text-base font-bold text-slate-850 dark:text-white mt-1">
              {moduleFilter === 'all' 
                ? (projectFilter === 'all' ? 'All Projects & Modules' : `All Modules under Project ${projectFilter}`)
                : (() => {
                    const selectedMod = modules.find(m => m.id === moduleFilter);
                    return selectedMod ? `${selectedMod.id} - ${selectedMod.name}` : `Module: ${moduleFilter}`;
                  })()
              }
            </h3>
            {moduleFilter !== 'all' && (() => {
              const selectedMod = modules.find(m => m.id === moduleFilter);
              return selectedMod?.description ? (
                <p className="text-xs text-slate-450 dark:text-slate-400 mt-1.5 leading-relaxed font-sans">
                  {selectedMod.description}
                </p>
              ) : null;
            })()}
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-full text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider shrink-0">
            <span>Total Cases: {sortedTestCases.length}</span>
          </div>
        </div>

        {/* Test cases list table */}
        {sortedTestCases.length === 0 ? (
          <EmptyState
            icon={<FileSpreadsheet className="w-10 h-10" />}
            title="No Test Cases Found"
            description={
              projects.length === 0 || modules.length === 0
                ? "You must create both a Project and a Module before you can author Test Cases."
                : searchQuery
                  ? "No test cases match your filter queries."
                  : "Author your first test case. You can execute cases immediately, view executions, or attach bugs."
            }
            actionLabel={projects.length === 0 || modules.length === 0 ? undefined : "Create Test Case"}
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
                    const firstReq = requirements.find(r => r.moduleId === firstMod?.id);
                    setRequirementId(firstReq?.id || '');
                    setPreconditions('');
                    setStepsText('');
                    setExpectedResult('');
                    setPriority('medium');
                    setTcType('manual');
                    setAssignedQaId(qaEngineers[0]?.id || '');
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
                        checked={paginatedCases.every(c => selectedIds.includes(c.id))}
                        onChange={() => toggleSelectAll(paginatedCases)}
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                      />
                    </th>
                    <th className="p-4 w-28 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('id')}>
                      <div className="flex items-center gap-1.5">
                        <span>Case ID</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100/40" onClick={() => handleSort('title')}>
                      <div className="flex items-center gap-1.5">
                        <span>Test Title</span>
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </th>
                    <th className="p-4 w-28">Priority</th>
                    <th className="p-4 w-32">Last Result</th>
                    <th className="p-4 w-24">Status</th>
                    <th className="p-4 w-24 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-850 text-sm">
                  {paginatedCases.map(c => {
                    const assignedQa = qaEngineers.find(q => q.id === c.assignedQaId);
                    return (
                      <tr
                        key={c.id}
                        onClick={() => setActiveTestCaseId(c.id)}
                        className={`hover:bg-slate-50/50 dark:hover:bg-slate-850/20 transition-colors cursor-pointer ${
                          selectedIds.includes(c.id) ? 'bg-indigo-50/10 dark:bg-indigo-950/5' : ''
                        } ${activeTestCaseId === c.id ? 'bg-slate-50/80 dark:bg-slate-850/40 font-semibold' : ''}`}
                      >
                        <td className="p-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={selectedIds.includes(c.id)}
                            onChange={() => toggleSelectRow(c.id)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                          />
                        </td>
                        <td className="p-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">
                          {c.id}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-slate-800 dark:text-slate-200">{c.title}</span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                              Assigned: {assignedQa ? assignedQa.name : <em className="text-slate-350">Unassigned</em>}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            c.priority === 'critical' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                            c.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-650 dark:text-slate-400'
                          }`}>
                            {c.priority}
                          </span>
                        </td>
                        <td className="p-4">
                          {getExecBadge(c.lastExecutionStatus)}
                        </td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'active' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                            c.status === 'archived' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700' :
                            'bg-slate-100 dark:bg-slate-800 text-slate-600'
                          }`}>
                            {c.status}
                          </span>
                        </td>
                        <td className="p-4 text-right flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {/* View Case Profile & Executions History */}
                          <button
                            onClick={() => { setViewTestCase(c); setIsViewOpen(true); }}
                            title="View Case Profile & Execs History"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>

                          {/* Run Quick Execution log launcher */}
                          <button
                            onClick={() => { setActiveTestCaseId(c.id); }}
                            title="Execute Test Case"
                            className="p-1.5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-indigo-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Play className="w-3.5 h-3.5" />
                          </button>

                          {/* Duplicate */}
                          <button
                            onClick={() => duplicateTestCase(c.id)}
                            title="Duplicate"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          {/* Archive toggle */}
                          {c.status === 'archived' ? (
                            <button
                              onClick={() => restoreTestCase(c.id)}
                              title="Restore Test Case"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => archiveTestCase(c.id)}
                              title="Archive Test Case"
                              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                            >
                              <Archive className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit */}
                          <button
                            onClick={() => openEditModal(c)}
                            title="Edit Test Case"
                            className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => setDeleteTargetId(c.id)}
                            title="Delete Test Case"
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
            <div className="p-4 bg-slate-50/50 dark:bg-slate-950/30 border-t border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <div className="flex flex-wrap items-center gap-4">
                <span>
                  Showing {filteredTestCases.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1} to {Math.min(filteredTestCases.length, currentPage * itemsPerPage)} of {filteredTestCases.length} cases
                </span>
                <div className="flex items-center gap-1.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                  <span className="text-slate-400">Show:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 rounded-lg text-slate-700 dark:text-slate-350 cursor-pointer outline-hidden focus:ring-1 focus:ring-indigo-500"
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
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Prev
                </button>
                <span>{currentPage} / {totalPages}</span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-2.5 py-1.5 border border-slate-200 dark:border-slate-850 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-350 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* --- TEST CASE EXECUTION MODAL --- */}
      {activeTestCaseId && activeTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6">
          <div onClick={() => setActiveTestCaseId(null)} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
          
          <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] md:max-h-[92vh] animate-fade-in font-sans">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/20 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                  <Play className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="font-mono text-[10px] font-extrabold text-indigo-600 dark:text-indigo-400 tracking-wider uppercase bg-indigo-50 dark:bg-indigo-950/50 px-2 py-0.5 rounded-md">
                    {activeTestCase.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-850 dark:text-white mt-1 leading-snug">
                    Execute: {activeTestCase.title}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setActiveTestCaseId(null)}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg shrink-0 cursor-pointer transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body (Scrollable & split in two columns) */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* LEFT COLUMN: Specifications & Preconditions (45% Width) */}
                <div className="lg:col-span-5 space-y-6">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-2.5">
                      Test Specifications
                    </h4>
                    <div className="space-y-4">
                      {/* Preconditions */}
                      <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-850/80 p-4 rounded-xl">
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[9px] block mb-1">
                          Preconditions:
                        </span>
                        <p className="font-mono text-[10px] text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap bg-white dark:bg-slate-950/60 p-2 border border-slate-100 dark:border-slate-850 rounded-lg">
                          {activeTestCase.preconditions || "No preconditions declared."}
                        </p>
                      </div>

                      {/* Steps to Reproduce */}
                      <div className="bg-slate-50 dark:bg-slate-950/35 border border-slate-150 dark:border-slate-850/80 p-4 rounded-xl">
                        <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide text-[9px] block mb-2">
                          Steps to Reproduce:
                        </span>
                        <ol className="space-y-2 list-none pl-0">
                          {activeTestCase.steps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-300 font-medium">
                              <span className="flex items-center justify-center w-5 h-5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span className="pt-0.5 leading-relaxed">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>

                      {/* Expected Result */}
                      <div className="bg-emerald-50/20 dark:bg-emerald-950/10 border-l-4 border-emerald-500 p-4 rounded-r-xl rounded-l-md">
                        <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide text-[9px] block mb-1">
                          Expected Result:
                        </span>
                        <p className="text-xs font-semibold text-slate-850 dark:text-slate-200 leading-relaxed">
                          {activeTestCase.expectedResult}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Historical Execution History logs */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-5">
                    <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <History className="w-3.5 h-3.5 text-indigo-500" />
                      <span>Historical Logs ({activeTestCaseExecutions.length})</span>
                    </h4>

                    {activeTestCaseExecutions.length === 0 ? (
                      <div className="text-center py-6 text-slate-400 dark:text-slate-500 text-xs bg-slate-50/50 dark:bg-slate-950/10 border border-slate-100 dark:border-slate-850 rounded-xl">
                        No previous runs recorded.
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1.5 custom-scrollbar">
                        {activeTestCaseExecutions.map(exec => {
                          const qa = qaEngineers.find(q => q.id === exec.executedById);
                          return (
                            <div
                              key={exec.id}
                              className="border border-slate-100 dark:border-slate-850 p-3 rounded-xl text-xs space-y-2 bg-slate-50/50 dark:bg-slate-950/20 shadow-xs hover:border-indigo-200 dark:hover:border-indigo-900/40 transition-colors"
                            >
                              <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  {getExecBadge(exec.status)}
                                  <button
                                    type="button"
                                    onClick={() => loadExecutionIntoForm(exec)}
                                    className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 text-indigo-600 dark:text-indigo-400 font-bold rounded-md text-[10px] transition-colors cursor-pointer flex items-center gap-1 border border-indigo-200 dark:border-indigo-800/40"
                                    title="Click to populate these execution details into editing form"
                                  >
                                    <Edit className="w-2.5 h-2.5" />
                                    <span>Load / Edit</span>
                                  </button>
                                </div>
                                <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                  {new Date(exec.executionDate).toLocaleDateString()} {new Date(exec.executionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div className="space-y-0.5">
                                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Actual Result / Log:</span>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                                  {exec.actualResult}
                                </p>
                              </div>
                              {exec.notes && (
                                <p className="text-slate-500 dark:text-slate-400 italic text-[11px]">
                                  Notes: {exec.notes}
                                </p>
                              )}
                              {exec.attachments && exec.attachments.length > 0 && (
                                <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800/60 mt-2">
                                  <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                                    Evidence Files ({exec.attachments.length}):
                                  </span>
                                  <div className="grid grid-cols-1 gap-2">
                                    {exec.attachments.map((att, aIdx) => {
                                      const isImg = isImageFile(att);
                                      const isVid = isVideoFile(att);
                                      const isPdf = isPdfFile(att);
                                      const isDoc = isWordFile(att);
                                      return (
                                        <div
                                          key={aIdx}
                                          className="p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs space-y-1.5"
                                        >
                                          <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                              {isImg ? (
                                                <img
                                                  src={att.data}
                                                  alt={att.name}
                                                  onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                                  className="w-7 h-7 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                                  title="Click to expand image"
                                                />
                                              ) : isVid ? (
                                                <div
                                                  onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'video' })}
                                                  className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center shrink-0 cursor-pointer border border-indigo-800 text-indigo-400 hover:bg-indigo-900 transition-colors"
                                                  title="Click to play video"
                                                >
                                                  <Video className="w-3.5 h-3.5" />
                                                </div>
                                              ) : isPdf ? (
                                                <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                                                  <FileText className="w-3.5 h-3.5" />
                                                </div>
                                              ) : isDoc ? (
                                                <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                                  <FileText className="w-3.5 h-3.5" />
                                                </div>
                                              ) : (
                                                <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                              )}
                                              <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
                                                {att.name}
                                              </span>
                                            </div>
                                            <div className="flex items-center gap-1 shrink-0">
                                              {(isImg || isVid) && (
                                                <button
                                                  type="button"
                                                  onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: isVid ? 'video' : 'image' })}
                                                  className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                                  title={isVid ? "Play Video" : "Preview Image"}
                                                >
                                                  {isVid ? <Video className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                </button>
                                              )}
                                              <a
                                                href={att.data}
                                                download={att.name}
                                                className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                                title={`Download ${att.name}`}
                                                onClick={(e) => e.stopPropagation()}
                                              >
                                                <Download className="w-3.5 h-3.5" />
                                              </a>
                                            </div>
                                          </div>

                                          {/* Inline video display */}
                                          {isVid && (
                                            <video
                                              src={att.data}
                                              controls
                                              className="w-full max-h-40 rounded-lg bg-black object-contain border border-slate-800"
                                            />
                                          )}
                                          {/* Inline image display */}
                                          {isImg && (
                                            <img
                                              src={att.data}
                                              alt={att.name}
                                              onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                              className="w-full max-h-36 object-contain rounded-lg bg-slate-950/20 border border-slate-800/20 cursor-pointer hover:opacity-90 transition-opacity"
                                            />
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                              <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100/50 dark:border-slate-800/40 mt-1">
                                <span>Runner: {qa?.name || exec.executedById}</span>
                                {exec.runTimeMs !== null && exec.runTimeMs !== undefined && (
                                  <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">Duration: {exec.runTimeMs}ms</span>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* RIGHT COLUMN: Execution Form (55% Width) */}
                <div className="lg:col-span-7 space-y-5 lg:border-l lg:border-slate-100 lg:dark:border-slate-800 lg:pl-8">
                  <div>
                    <h4 className="text-[11px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
                      Log New Execution Run
                    </h4>

                    {qaEngineers.length === 0 && (
                      <div className="p-3 bg-indigo-50/40 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 text-xs rounded-xl border border-indigo-100 dark:border-indigo-900/20 mb-4 leading-relaxed">
                        No custom QA Engineers configured. Execution will run under <strong>System Default QA</strong>.
                      </div>
                    )}

                    <form onSubmit={handleLogExecution} className="space-y-4">
                      {execFormError && (
                        <div className="p-3 bg-red-50 text-red-600 border border-red-100 text-[11px] font-semibold rounded-lg shadow-xs">
                          {execFormError}
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Result Status</label>
                          <select
                            value={execStatus}
                            onChange={(e) => setExecStatus(e.target.value as TestExecution['status'])}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer shadow-xs"
                          >
                            <option value="passed">Passed</option>
                            <option value="failed">Failed</option>
                            <option value="blocked">Blocked</option>
                            <option value="retest">Retest</option>
                          </select>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">QA Engineer</label>
                          <select
                            value={executedById}
                            onChange={(e) => setExecutedById(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all cursor-pointer shadow-xs"
                            required
                          >
                            {qaEngineers.length === 0 ? (
                              <option value="System Default QA">System Default QA</option>
                            ) : (
                              <>
                                <option value="">-- Choose QA --</option>
                                {qaEngineers.map(q => (
                                  <option key={q.id} value={q.id}>{q.name}</option>
                                ))}
                              </>
                            )}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Actual Result / Log</label>
                        <textarea
                          rows={2}
                          placeholder="e.g., Returns expected API payload with 200 OK"
                          value={actualResult}
                          onChange={(e) => setActualResult(e.target.value)}
                          maxLength={2000}
                          className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all shadow-xs resize-y font-mono"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Duration (ms)</label>
                          <input
                            type="number"
                            placeholder="e.g., 240"
                            value={runTimeMs}
                            onChange={(e) => setRunTimeMs(e.target.value)}
                            min={0}
                            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all shadow-xs"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Execution Notes</label>
                          <textarea
                            rows={2}
                            placeholder="Optional remarks..."
                            value={execNotes}
                            onChange={(e) => setExecNotes(e.target.value)}
                            maxLength={2000}
                            className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-xs rounded-xl focus:ring-2 focus:ring-indigo-500/20 outline-hidden transition-all shadow-xs resize-y font-mono"
                          />
                        </div>
                      </div>

                      {/* File Upload zone supporting drag-and-drop & click */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          Upload Execution Evidence / Log Files
                        </label>
                        <div
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          className={`border border-dashed rounded-xl p-4 text-center transition-all cursor-pointer ${
                            isDragging
                              ? 'border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20'
                              : 'border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500/50 bg-slate-50/30 dark:bg-slate-950/10'
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="video/mp4,video/*,image/png,image/jpeg,image/*,application/pdf,.pdf,.doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.json,.log,.txt"
                            multiple
                            className="hidden"
                            onChange={handleFileUpload}
                          />
                          <UploadCloud className="w-6 h-6 text-indigo-500 mx-auto mb-1.5" />
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                            Drag & drop files here, or <span className="text-indigo-600 dark:text-indigo-400 font-bold underline">browse</span>
                          </p>
                          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">
                            Accepts MP4 videos, PNG/JPEG screenshots, PDF reports, Word (.doc/.docx) files & logs
                          </p>
                        </div>

                        {/* Render staged uploaded files list */}
                        {executionAttachments.length > 0 && (
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center justify-between">
                              <div className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                                Files Staged for Execution ({executionAttachments.length})
                              </div>
                              <button
                                type="button"
                                onClick={() => setExecutionAttachments([])}
                                className="text-[10px] text-slate-400 hover:text-rose-500 font-medium cursor-pointer"
                              >
                                Clear All
                              </button>
                            </div>
                            <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
                              {executionAttachments.map((att, idx) => {
                                const isImg = isImageFile(att);
                                const isVid = isVideoFile(att);
                                const isPdf = isPdfFile(att);
                                const isDoc = isWordFile(att);
                                return (
                                  <div
                                    key={idx}
                                    className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs space-y-2 shadow-2xs"
                                  >
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2.5 min-w-0">
                                        {isImg ? (
                                          <img
                                            src={att.data}
                                            alt={att.name}
                                            className="w-8 h-8 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                            onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                            title="Click to preview image"
                                          />
                                        ) : isVid ? (
                                          <div
                                            onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'video' })}
                                            className="w-8 h-8 rounded-lg bg-indigo-950 flex items-center justify-center shrink-0 cursor-pointer border border-indigo-800 text-indigo-400 hover:bg-indigo-900 transition-colors"
                                            title="Click to play video"
                                          >
                                            <Video className="w-4 h-4" />
                                          </div>
                                        ) : isPdf ? (
                                          <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                        ) : isDoc ? (
                                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                            <FileText className="w-4 h-4" />
                                          </div>
                                        ) : (
                                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center shrink-0">
                                            <Paperclip className="w-4 h-4 text-slate-500" />
                                          </div>
                                        )}
                                        <div className="min-w-0">
                                          <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                                            {att.name}
                                          </p>
                                          <p className="text-[9px] text-slate-400 uppercase font-mono font-bold">
                                            {isVid ? 'MP4 VIDEO' : isImg ? 'PNG / JPEG IMAGE' : isPdf ? 'PDF DOCUMENT' : isDoc ? 'WORD DOCUMENT' : (att.type.split('/')[1] || 'FILE')}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-1 shrink-0">
                                        {(isImg || isVid) && (
                                          <button
                                            type="button"
                                            onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: isVid ? 'video' : 'image' })}
                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer"
                                            title={isVid ? "Play Video" : "Preview Image"}
                                          >
                                            {isVid ? <Video className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                          </button>
                                        )}
                                        {(isPdf || isDoc || (!isImg && !isVid)) && (
                                          <a
                                            href={att.data}
                                            download={att.name}
                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                                            title={`Download ${att.name}`}
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </a>
                                        )}
                                        <button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            removeAttachment(att.name);
                                          }}
                                          className="p-1 text-slate-400 hover:text-rose-500 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                                          title="Remove file"
                                        >
                                          <X className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Inline video display for staged attachments */}
                                    {isVid && (
                                      <video
                                        src={att.data}
                                        controls
                                        className="w-full max-h-40 rounded-lg object-contain bg-black border border-slate-800"
                                      />
                                    )}
                                    {/* Inline image display for staged attachments */}
                                    {isImg && (
                                      <img
                                        src={att.data}
                                        alt={att.name}
                                        onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                        className="w-full max-h-36 rounded-lg object-contain bg-slate-950/20 border border-slate-800/20 cursor-pointer hover:opacity-90 transition-opacity"
                                      />
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="pt-3 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            setActualResult('');
                            setRunTimeMs('');
                            setExecNotes('');
                            setExecutionAttachments([]);
                          }}
                          className="px-3 py-1.5 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-medium text-xs rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Clear all execution form fields"
                        >
                          Clear Form
                        </button>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setActiveTestCaseId(null)}
                            className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-50 dark:hover:bg-slate-950 transition-colors cursor-pointer"
                          >
                            Close
                          </button>
                          <button
                            type="submit"
                            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-lg shadow-xs transition-colors cursor-pointer"
                          >
                            Post Execution Result
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- CREATE TEST CASE MODAL --- */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsCreateOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                <span>Author Test Case</span>
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
                  Test Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Verify multi-factor OTP validation timeout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
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
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
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
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TestCase['priority'])}
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
                    QA Lead / Assignee
                  </label>
                  <select
                    value={assignedQaId}
                    onChange={(e) => setAssignedQaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Unassigned --</option>
                    {qaEngineers.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Preconditions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Valid user account exists, and phone number is verified"
                  value={preconditions}
                  onChange={(e) => setPreconditions(e.target.value)}
                  maxLength={150}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Test Steps <span className="text-slate-400 font-normal">(One step per line)</span>
                </label>
                <textarea
                  placeholder="Step 1. Navigate to verification screen&#10;Step 2. Trigger SMS OTP Code&#10;Step 3. Wait exactly 5 minutes without entering OTP..."
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Expected Result <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g., An error message saying 'Code expired' should render on submit"
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
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
                  Create Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT TEST CASE MODAL --- */}
      {isEditOpen && selectedTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsEditOpen(false); setSelectedTestCase(null); }} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Edit className="w-5 h-5 text-indigo-500" />
                <span>Edit Case {selectedTestCase.id}</span>
              </h3>
              <button onClick={() => { setIsEditOpen(false); setSelectedTestCase(null); }} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 rounded-lg">
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
                  Test Case Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g., Verify multi-factor OTP validation timeout"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
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

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Priority
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TestCase['priority'])}
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
                    QA Lead / Assignee
                  </label>
                  <select
                    value={assignedQaId}
                    onChange={(e) => setAssignedQaId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="">-- Unassigned --</option>
                    {qaEngineers.map(q => (
                      <option key={q.id} value={q.id}>{q.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                    Status
                  </label>
                  <select
                    value={tcStatus}
                    onChange={(e) => setTcStatus(e.target.value as TestCase['status'])}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                    <option value="deprecated">Deprecated</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Preconditions
                </label>
                <input
                  type="text"
                  placeholder="e.g., Valid user account exists, and phone number is verified"
                  value={preconditions}
                  onChange={(e) => setPreconditions(e.target.value)}
                  maxLength={150}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs rounded-xl focus:outline-hidden"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Test Steps <span className="text-slate-400 font-normal">(One step per line)</span>
                </label>
                <textarea
                  placeholder="Step 1. Navigate to verification screen&#10;Step 2. Trigger SMS OTP Code..."
                  value={stepsText}
                  onChange={(e) => setStepsText(e.target.value)}
                  rows={4}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-650 dark:text-slate-400 uppercase tracking-wide">
                  Expected Result <span className="text-red-500">*</span>
                </label>
                <textarea
                  placeholder="e.g., An error message saying 'Code expired' should render on submit"
                  value={expectedResult}
                  onChange={(e) => setExpectedResult(e.target.value)}
                  rows={2}
                  className="w-full px-3.5 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-200 text-sm rounded-xl focus:outline-hidden"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => { setIsEditOpen(false); setSelectedTestCase(null); }}
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

      {/* BULK EDIT DIALOG */}
      {isBulkEditOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setIsBulkEditOpen(false)} className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs" />
          <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-10 p-6">
            <h3 className="text-sm font-bold text-slate-850 dark:text-white uppercase tracking-wider mb-4">
              Bulk Update Test Cases
            </h3>
            <form onSubmit={handleBulkUpdateSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550">Update Status</label>
                <select
                  value={bulkStatus}
                  onChange={(e) => setBulkStatus(e.target.value as TestCase['status'] | '')}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-850 dark:text-slate-250 text-xs font-semibold rounded-xl focus:outline-hidden"
                >
                  <option value="">Keep current values</option>
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="deprecated">Deprecated</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-550">Update Priority</label>
                <select
                  value={bulkPriority}
                  onChange={(e) => setBulkPriority(e.target.value as TestCase['priority'] | '')}
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
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm"
                >
                  Apply Updates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW TEST CASE DETAILS & EXECUTIONS HISTORICAL TIMELINE MODAL */}
      {isViewOpen && viewTestCase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => { setIsViewOpen(false); setViewTestCase(null); }} className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs" />
          <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl text-indigo-600 dark:text-indigo-400">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 px-2 py-0.5 rounded">
                    {viewTestCase.id}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 leading-snug">
                    Test Case & Execution Profile
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => { setIsViewOpen(false); setViewTestCase(null); }} 
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Test Case Title */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Test Case Title</h4>
                <p className="text-base font-bold text-slate-850 dark:text-slate-100">
                  {viewTestCase.title}
                </p>
              </div>

              {/* Grid of specifications */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50/50 dark:bg-slate-950/20 p-4 rounded-xl border border-slate-100 dark:border-slate-850 text-xs font-sans">
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Project Scope</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {projects.find(p => p.id === viewTestCase.projectId)?.name || viewTestCase.projectId}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Module Scope</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {modules.find(m => m.id === viewTestCase.moduleId)?.name || viewTestCase.moduleId}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Priority Level</span>
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase mt-1 ${
                    viewTestCase.priority === 'critical' ? 'bg-red-50 dark:bg-red-950/30 text-red-750 dark:text-red-400' :
                    viewTestCase.priority === 'high' ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-700 dark:text-orange-400' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-650'
                  }`}>
                    {viewTestCase.priority}
                  </span>
                </div>
                <div>
                  <span className="block font-bold text-slate-450 uppercase tracking-wider">Assigned QA</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate block mt-0.5">
                    {qaEngineers.find(q => q.id === viewTestCase.assignedQaId)?.name || <em className="text-slate-300">Unassigned</em>}
                  </span>
                </div>
              </div>

              {/* Specs Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Preconditions</span>
                  <div className="bg-slate-50/20 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-800 p-3 rounded-xl font-mono text-[11px] text-slate-655 dark:text-slate-350 min-h-[60px] whitespace-pre-wrap leading-normal">
                    {viewTestCase.preconditions || "No system preconditions declared."}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expected Outcome</span>
                  <div className="bg-slate-50/20 dark:bg-slate-950/10 border border-slate-150 dark:border-slate-800 p-3 rounded-xl text-xs font-medium text-slate-800 dark:text-slate-200 min-h-[60px] leading-relaxed">
                    {viewTestCase.expectedResult}
                  </div>
                </div>
              </div>

              {/* Steps */}
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Step-by-Step Instructions</span>
                <ol className="space-y-1.5 list-decimal pl-5">
                  {viewTestCase.steps.map((step, idx) => (
                    <li key={idx} className="text-xs text-slate-700 dark:text-slate-300 font-medium pl-1">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              {/* Associated Traceable Requirements */}
              {viewTestCase.moduleId && (
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Traced Product Requirements</span>
                  </h4>
                  {requirements.filter(r => r.moduleId === viewTestCase.moduleId).length === 0 ? (
                    <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                      No matching requirements map to this module scope.
                    </p>
                  ) : (
                    <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850 max-h-32 overflow-y-auto">
                      {requirements.filter(r => r.moduleId === viewTestCase.moduleId).map(req => (
                        <div key={req.id} className="p-2.5 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono text-[10px] font-bold text-indigo-500 shrink-0">{req.id}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{req.title}</span>
                          </div>
                          <span className="text-[9px] font-bold uppercase text-slate-455 shrink-0">{req.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Linked Bug Tracker Tickets */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                  <span>Logged Bugs / Defects for Case</span>
                  <span className="px-2 py-0.5 bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-450 rounded-full text-[10px] font-bold font-mono">
                    {bugs.filter(b => b.testCaseId === viewTestCase.id).length} Defects
                  </span>
                </h4>
                {bugs.filter(b => b.testCaseId === viewTestCase.id).length === 0 ? (
                  <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                    Excellent quality record! No bugs are registered specifically for this test case.
                  </p>
                ) : (
                  <div className="border border-slate-150 dark:border-slate-800/80 rounded-xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-850 max-h-32 overflow-y-auto">
                    {bugs.filter(b => b.testCaseId === viewTestCase.id).map(defect => {
                      const dev = developers.find(d => d.id === defect.assignedDevId);
                      return (
                        <div key={defect.id} className="p-2.5 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <span className="font-mono text-[10px] font-bold text-red-600 dark:text-red-400 shrink-0">{defect.id}</span>
                            <span className="font-semibold text-slate-700 dark:text-slate-300 truncate">{defect.title}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-[9px] text-slate-400">Dev: {dev ? dev.name : "Unassigned"}</span>
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              defect.status === 'closed' || defect.status === 'rejected' ? 'bg-slate-100 text-slate-500' : 'bg-red-50 dark:bg-red-950/30 text-red-700'
                            }`}>
                              {defect.status}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Historical Execution Run Logs Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center justify-between">
                  <span>Execution Run logs & timeline</span>
                  <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-450 rounded-full text-[10px] font-bold font-mono">
                    {executions.filter(e => e.testCaseId === viewTestCase.id).length} runs
                  </span>
                </h4>
                {executions.filter(e => e.testCaseId === viewTestCase.id).length === 0 ? (
                  <p className="text-xs text-slate-450 italic p-3 bg-slate-50/50 dark:bg-slate-950/20 rounded-xl border border-slate-100 dark:border-slate-850">
                    No run logs have been recorded for this case yet.
                  </p>
                ) : (
                  <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                    {executions.filter(e => e.testCaseId === viewTestCase.id).map(exec => {
                      const qa = qaEngineers.find(q => q.id === exec.executedById);
                      return (
                        <div
                          key={exec.id}
                          className="border border-slate-100 dark:border-slate-800 p-3 rounded-xl text-xs space-y-1.5 bg-slate-50/50 dark:bg-slate-950/20"
                        >
                          <div className="flex items-center justify-between">
                            <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                              exec.status === 'passed' ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400' :
                              exec.status === 'failed' ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400' :
                              exec.status === 'blocked' ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-700' :
                              'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700'
                            }`}>
                              {exec.status}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                              {new Date(exec.executionDate).toLocaleDateString()} {new Date(exec.executionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                            {exec.actualResult}
                          </p>
                          {exec.notes && (
                            <p className="text-slate-500 dark:text-slate-400 italic text-[11px]">
                              Notes: {exec.notes}
                            </p>
                          )}
                          {exec.attachments && exec.attachments.length > 0 && (
                            <div className="pt-2 space-y-1.5 border-t border-slate-100 dark:border-slate-800/60 mt-1">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
                                Attached Evidence ({exec.attachments.length}):
                              </span>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {exec.attachments.map((att, aIdx) => {
                                  const isImg = isImageFile(att);
                                  const isVid = isVideoFile(att);
                                  const isPdf = isPdfFile(att);
                                  const isDoc = isWordFile(att);
                                  return (
                                    <div
                                      key={aIdx}
                                      className="p-2 bg-white dark:bg-slate-900 border border-slate-150 dark:border-slate-800 rounded-xl text-xs space-y-1.5"
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <div className="flex items-center gap-2 min-w-0">
                                          {isImg ? (
                                            <img
                                              src={att.data}
                                              alt={att.name}
                                              onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                              className="w-7 h-7 object-cover rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                                              title="Click to expand image"
                                            />
                                          ) : isVid ? (
                                            <div
                                              onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'video' })}
                                              className="w-7 h-7 rounded-lg bg-indigo-950 flex items-center justify-center shrink-0 cursor-pointer border border-indigo-800 text-indigo-400 hover:bg-indigo-900 transition-colors"
                                              title="Click to play video"
                                            >
                                              <Video className="w-3.5 h-3.5" />
                                            </div>
                                          ) : isPdf ? (
                                            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 flex items-center justify-center shrink-0 text-rose-600 dark:text-rose-400">
                                              <FileText className="w-3.5 h-3.5" />
                                            </div>
                                          ) : isDoc ? (
                                            <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-900 flex items-center justify-center shrink-0 text-blue-600 dark:text-blue-400">
                                              <FileText className="w-3.5 h-3.5" />
                                            </div>
                                          ) : (
                                            <Paperclip className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                                          )}
                                          <span className="truncate text-[11px] font-medium text-slate-700 dark:text-slate-200">
                                            {att.name}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1 shrink-0">
                                          {(isImg || isVid) && (
                                            <button
                                              type="button"
                                              onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: isVid ? 'video' : 'image' })}
                                              className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                                              title={isVid ? "Play Video" : "Preview Image"}
                                            >
                                              {isVid ? <Video className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                            </button>
                                          )}
                                          <a
                                            href={att.data}
                                            download={att.name}
                                            className="p-1 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                                            title={`Download ${att.name}`}
                                            onClick={(e) => e.stopPropagation()}
                                          >
                                            <Download className="w-3.5 h-3.5" />
                                          </a>
                                        </div>
                                      </div>
                                      {isVid && (
                                        <video
                                          src={att.data}
                                          controls
                                          className="w-full max-h-36 rounded-lg bg-black object-contain border border-slate-800"
                                        />
                                      )}
                                      {isImg && (
                                        <img
                                          src={att.data}
                                          alt={att.name}
                                          onClick={() => setPreviewMedia({ name: att.name, url: att.data, type: 'image' })}
                                          className="w-full max-h-32 object-contain rounded-lg bg-slate-950/20 border border-slate-800/20 cursor-pointer hover:opacity-90 transition-opacity"
                                        />
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                          <div className="flex justify-between items-center text-[10px] text-slate-400 dark:text-slate-500 pt-1.5 border-t border-slate-100/40 dark:border-slate-800/40 mt-1">
                            <span>Runner: {qa?.name || exec.executedById}</span>
                            {exec.runTimeMs !== null && exec.runTimeMs !== undefined && <span>Duration: {exec.runTimeMs}ms</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-950/20 flex justify-end gap-3 shrink-0">
              <button
                type="button"
                onClick={() => { setIsViewOpen(false); setViewTestCase(null); }}
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
        onConfirm={confirmDeleteTestCase}
        title="Delete Test Case?"
        message="Are you sure you want to permanently delete this testcase? Deletion is strictly blocked if the case has historical executions logged — in those cases, please Archive instead."
      />

      <ConfirmDialog
        isOpen={isBulkDeleteOpen}
        onClose={() => setIsBulkDeleteOpen(false)}
        onConfirm={confirmBulkDelete}
        title="Bulk Delete Test Cases?"
        message={`Are you sure you want to delete ${selectedIds.length} selected cases? Historical execution safeguards will still be evaluated.`}
      />

      {/* MEDIA PREVIEW LIGHTBOX MODAL (IMAGES & VIDEOS) */}
      {previewMedia && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setPreviewMedia(null)} className="fixed inset-0 bg-slate-950/75 backdrop-blur-xs" />
          <div className="relative z-10 max-w-4xl w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-2xl flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                {previewMedia.type === 'video' ? (
                  <Video className="w-4 h-4 text-indigo-500 shrink-0" />
                ) : (
                  <Eye className="w-4 h-4 text-indigo-500 shrink-0" />
                )}
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {previewMedia.name}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={previewMedia.url}
                  download={previewMedia.name}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                  title="Download File"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewMedia(null)}
                  className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-center bg-slate-950 rounded-xl p-2 max-h-[75vh] overflow-hidden">
              {previewMedia.type === 'video' ? (
                <video
                  src={previewMedia.url}
                  controls
                  autoPlay
                  className="max-h-[70vh] w-auto max-w-full rounded-lg"
                />
              ) : (
                <img
                  src={previewMedia.url}
                  alt={previewMedia.name}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
