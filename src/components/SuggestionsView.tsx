import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Suggestion } from '../types';
import { 
  Lightbulb, 
  ThumbsUp, 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Edit3, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Send, 
  User, 
  X,
  ArrowUpDown,
  Folder,
  Layers
} from 'lucide-react';

export const SuggestionsView: React.FC = () => {
  const { 
    suggestions, 
    projects,
    modules,
    addSuggestion, 
    updateSuggestion, 
    deleteSuggestion, 
    clearAllSuggestions,
    voteSuggestion, 
    addSuggestionComment,
    settings 
  } = useApp();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'votes' | 'recent' | 'priority'>('votes');

  // Modal States
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [editingSuggestion, setEditingSuggestion] = useState<Suggestion | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isClearAllConfirmOpen, setIsClearAllConfirmOpen] = useState(false);
  const [responseModalSug, setResponseModalSug] = useState<Suggestion | null>(null);
  const [responseNoteText, setResponseNoteText] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formProjectId, setFormProjectId] = useState('');
  const [formModuleId, setFormModuleId] = useState('');
  const [formCategory, setFormCategory] = useState<Suggestion['category']>('feature_request');
  const [formPriority, setFormPriority] = useState<Suggestion['priority']>('medium');
  const [formSubmittedBy, setFormSubmittedBy] = useState(settings.userName || 'QA Specialist');
  const [formUserRole, setFormUserRole] = useState('Senior QA Engineer');
  const [formError, setFormError] = useState('');

  // Comment Expand State
  const [expandedCommentsId, setExpandedCommentsId] = useState<string | null>(null);
  const [commentInputMap, setCommentInputMap] = useState<Record<string, string>>({});

  // Map helpers for quick lookup
  const projectMap = useMemo(() => {
    const map = new Map<string, string>();
    projects.forEach(p => map.set(p.id, p.name));
    return map;
  }, [projects]);

  const moduleMap = useMemo(() => {
    const map = new Map<string, string>();
    modules.forEach(m => map.set(m.id, m.name));
    return map;
  }, [modules]);

  // Modules available for selected project filter
  const availableFilterModules = useMemo(() => {
    if (selectedProjectId === 'all') return modules;
    return modules.filter(m => m.projectId === selectedProjectId);
  }, [modules, selectedProjectId]);

  // Modules available for modal form
  const availableFormModules = useMemo(() => {
    if (!formProjectId) return modules;
    return modules.filter(m => m.projectId === formProjectId);
  }, [modules, formProjectId]);

  // Reset Form
  const openSubmitModal = () => {
    setEditingSuggestion(null);
    setFormTitle('');
    setFormDescription('');
    setFormProjectId(selectedProjectId !== 'all' ? selectedProjectId : (projects[0]?.id || ''));
    setFormModuleId(selectedModuleId !== 'all' ? selectedModuleId : '');
    setFormCategory('feature_request');
    setFormPriority('medium');
    setFormSubmittedBy(settings.userName || 'QA Specialist');
    setFormUserRole('Senior QA Engineer');
    setFormError('');
    setIsSubmitModalOpen(true);
  };

  const openEditModal = (sug: Suggestion) => {
    setEditingSuggestion(sug);
    setFormTitle(sug.title);
    setFormDescription(sug.description);
    setFormProjectId(sug.projectId || '');
    setFormModuleId(sug.moduleId || '');
    setFormCategory(sug.category);
    setFormPriority(sug.priority);
    setFormSubmittedBy(sug.submittedBy);
    setFormUserRole(sug.userRole || '');
    setFormError('');
    setIsSubmitModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formTitle.trim()) {
      setFormError('Please enter a suggestion title');
      return;
    }
    if (!formDescription.trim()) {
      setFormError('Please enter a detailed description');
      return;
    }

    if (editingSuggestion) {
      const res = updateSuggestion(editingSuggestion.id, {
        title: formTitle.trim(),
        description: formDescription.trim(),
        projectId: formProjectId || undefined,
        moduleId: formModuleId || undefined,
        category: formCategory,
        priority: formPriority,
        submittedBy: formSubmittedBy.trim(),
        userRole: formUserRole.trim()
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to update suggestion');
        return;
      }
    } else {
      const res = addSuggestion({
        title: formTitle.trim(),
        description: formDescription.trim(),
        projectId: formProjectId || undefined,
        moduleId: formModuleId || undefined,
        category: formCategory,
        priority: formPriority,
        status: 'open',
        submittedBy: formSubmittedBy.trim() || settings.userName || 'QA Specialist',
        userRole: formUserRole.trim() || 'QA Team'
      });
      if (!res.success) {
        setFormError(res.error || 'Failed to create suggestion');
        return;
      }
    }

    setIsSubmitModalOpen(false);
  };

  const handleSaveResponseNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!responseModalSug) return;
    updateSuggestion(responseModalSug.id, {
      responseNote: responseNoteText.trim()
    });
    setResponseModalSug(null);
    setResponseNoteText('');
  };

  const handleCommentSubmit = (suggestionId: string) => {
    const text = commentInputMap[suggestionId];
    if (!text || !text.trim()) return;

    addSuggestionComment(
      suggestionId, 
      text.trim(), 
      settings.userName || 'QA Team Lead', 
      'QA Portal Contributor'
    );

    setCommentInputMap(prev => ({ ...prev, [suggestionId]: '' }));
  };

  // Metrics Calculation
  const metrics = useMemo(() => {
    const total = suggestions.length;
    const reviewAndPlanned = suggestions.filter(s => s.status === 'under_review' || s.status === 'planned' || s.status === 'in_progress').length;
    const implemented = suggestions.filter(s => s.status === 'implemented').length;
    const totalVotes = suggestions.reduce((sum, s) => sum + (s.votes || 0), 0);
    return { total, reviewAndPlanned, implemented, totalVotes };
  }, [suggestions]);

  // Filtering & Sorting
  const filteredSuggestions = useMemo(() => {
    return suggestions.filter(s => {
      const matchesSearch = 
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (s.projectId && (projectMap.get(s.projectId) || '').toLowerCase().includes(searchTerm.toLowerCase())) ||
        (s.moduleId && (moduleMap.get(s.moduleId) || '').toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesProject = selectedProjectId === 'all' || s.projectId === selectedProjectId;
      const matchesModule = selectedModuleId === 'all' || s.moduleId === selectedModuleId;
      const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
      const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

      return matchesSearch && matchesProject && matchesModule && matchesCategory && matchesStatus;
    }).sort((a, b) => {
      if (sortBy === 'votes') {
        return b.votes - a.votes;
      } else if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = { critical: 4, high: 3, medium: 2, low: 1 };
        return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
      }
      return 0;
    });
  }, [suggestions, searchTerm, selectedProjectId, selectedModuleId, selectedCategory, selectedStatus, sortBy, projectMap, moduleMap]);

  // Helpers for Badges
  const getCategoryLabel = (cat: Suggestion['category']) => {
    switch (cat) {
      case 'feature_request': return 'Feature Request';
      case 'ui_ux': return 'UI / UX Design';
      case 'process_improvement': return 'Process Improvement';
      case 'automation_idea': return 'Automation Idea';
      case 'performance': return 'Performance & Scaling';
      default: return 'General Suggestion';
    }
  };

  const getStatusBadge = (status: Suggestion['status']) => {
    switch (status) {
      case 'implemented':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"><CheckCircle2 className="w-3.5 h-3.5" /> Implemented</span>;
      case 'in_progress':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800"><TrendingUp className="w-3.5 h-3.5" /> In Progress</span>;
      case 'planned':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800"><Sparkles className="w-3.5 h-3.5" /> Planned</span>;
      case 'under_review':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800"><Clock className="w-3.5 h-3.5" /> Under Review</span>;
      case 'declined':
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800"><AlertCircle className="w-3.5 h-3.5" /> Declined</span>;
      default:
        return <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">Open</span>;
    }
  };

  const getPriorityBadge = (priority: Suggestion['priority']) => {
    switch (priority) {
      case 'critical':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-red-100 text-red-700 dark:bg-red-950/80 dark:text-red-300">Critical Priority</span>;
      case 'high':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-orange-100 text-orange-700 dark:bg-orange-950/80 dark:text-orange-300">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">Medium Priority</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">Low Priority</span>;
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Banner & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-teal-900/90 via-slate-900 to-indigo-950 text-white p-6 md:p-8 rounded-2xl shadow-xl border border-teal-800/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="space-y-2 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-xs font-medium">
            <Lightbulb className="w-4 h-4 text-teal-400" /> Continuous Quality Improvement
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Project & Module Suggestions</h1>
          <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
            Submit feedback and enhancement ideas linked directly to specific <strong>Projects</strong> and <strong>Modules</strong>. Collaborate with QA and Dev teams to drive quality improvements.
          </p>
        </div>
        <div className="z-10 flex flex-wrap items-center gap-3">
          {suggestions.length > 0 && (
            <button
              onClick={() => setIsClearAllConfirmOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-slate-800/90 hover:bg-red-900/80 text-slate-200 hover:text-white font-medium border border-slate-700/80 transition-all duration-200 cursor-pointer text-sm"
              title="Remove all existing suggestions to start with a fresh slate"
            >
              <Trash2 className="w-4 h-4 text-red-400" /> Clear Existing Suggestions
            </button>
          )}
          <button
            onClick={openSubmitModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-semibold shadow-lg shadow-teal-500/20 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer text-sm"
          >
            <Plus className="w-5 h-5" /> Add Suggestion
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Suggestions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{metrics.total}</p>
          </div>
          <div className="p-3 bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-xl">
            <Lightbulb className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Under Review / Planned</p>
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">{metrics.reviewAndPlanned}</p>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-xl">
            <Sparkles className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Implemented</p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.implemented}</p>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Community Votes</p>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{metrics.totalVotes}</p>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-xl">
            <ThumbsUp className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Toolbar & Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4">
        {/* Project & Module Primary Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
          {/* Project Filter Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-teal-500" /> Filter by Project
            </label>
            <select
              value={selectedProjectId}
              onChange={e => {
                setSelectedProjectId(e.target.value);
                setSelectedModuleId('all');
              }}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">📁 All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Module Filter Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Filter by Module
            </label>
            <select
              value={selectedModuleId}
              onChange={e => setSelectedModuleId(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">❖ All Modules ({availableFilterModules.length})</option>
              {availableFilterModules.map(m => (
                <option key={m.id} value={m.id}>
                  {m.name} {selectedProjectId === 'all' && projectMap.get(m.projectId) ? `(${projectMap.get(m.projectId)})` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-amber-500" /> Status
            </label>
            <select
              value={selectedStatus}
              onChange={e => setSelectedStatus(e.target.value)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="under_review">Under Review</option>
              <option value="planned">Planned</option>
              <option value="in_progress">In Progress</option>
              <option value="implemented">Implemented</option>
              <option value="declined">Declined</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <ArrowUpDown className="w-3.5 h-3.5 text-blue-500" /> Sort By
            </label>
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="votes">Top Voted</option>
              <option value="recent">Most Recent</option>
              <option value="priority">Highest Priority</option>
            </select>
          </div>
        </div>

        {/* Search Bar & Category Pills */}
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, submitter, project name or module..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Active Filter Badges Clear Button */}
          {(selectedProjectId !== 'all' || selectedModuleId !== 'all' || selectedStatus !== 'all' || selectedCategory !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setSelectedProjectId('all');
                setSelectedModuleId('all');
                setSelectedStatus('all');
                setSelectedCategory('all');
                setSearchTerm('');
              }}
              className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 transition-colors shrink-0 cursor-pointer"
            >
              Clear All Filters
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Categories' },
            { id: 'feature_request', label: 'Feature Request' },
            { id: 'ui_ux', label: 'UI / UX Design' },
            { id: 'process_improvement', label: 'Process Improvement' },
            { id: 'automation_idea', label: 'Automation Idea' },
            { id: 'performance', label: 'Performance' },
            { id: 'other', label: 'Other' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Suggestion Cards */}
      {filteredSuggestions.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-teal-50 dark:bg-teal-950/50 text-teal-600 dark:text-teal-400 rounded-full flex items-center justify-center">
            <Lightbulb className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">No Suggestions Found</h3>
          <p className="text-slate-500 dark:text-slate-400 text-sm max-w-md mx-auto">
            {searchTerm || selectedProjectId !== 'all' || selectedModuleId !== 'all' || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'No suggestions match your current search or project/module filters. Try adjusting your filters.'
              : 'Be the first to submit a suggestion or feedback item for your project modules!'}
          </p>
          <button
            onClick={openSubmitModal}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-medium text-sm transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Add Suggestion
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSuggestions.map(sug => {
            const isVoted = sug.votedUserIds?.includes('current_user');
            const isCommentsExpanded = expandedCommentsId === sug.id;
            const projName = sug.projectId ? projectMap.get(sug.projectId) : null;
            const modName = sug.moduleId ? moduleMap.get(sug.moduleId) : null;

            return (
              <div 
                key={sug.id}
                className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-5 md:p-6 shadow-sm hover:shadow-md transition-all duration-200 space-y-4"
              >
                {/* Card Top Row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex gap-4 items-start flex-1">
                    {/* Upvote Button */}
                    <button
                      onClick={() => voteSuggestion(sug.id, 'current_user')}
                      className={`flex flex-col items-center justify-center min-w-[56px] py-2.5 px-3 rounded-xl border transition-all cursor-pointer ${
                        isVoted
                          ? 'bg-teal-50 dark:bg-teal-950/60 border-teal-500 text-teal-700 dark:text-teal-300 font-bold shadow-sm'
                          : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                      title={isVoted ? 'Click to remove vote' : 'Click to upvote'}
                    >
                      <ThumbsUp className={`w-5 h-5 ${isVoted ? 'fill-teal-500 text-teal-600 dark:text-teal-300' : ''}`} />
                      <span className="text-sm mt-1">{sug.votes || 0}</span>
                    </button>

                    {/* Title, Project/Module Badges & Info */}
                    <div className="space-y-2 flex-1">
                      {/* Project & Module Tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Project Badge */}
                        {sug.projectId && projName ? (
                          <button
                            onClick={() => {
                              setSelectedProjectId(sug.projectId!);
                              setSelectedModuleId('all');
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-teal-50 text-teal-800 dark:bg-teal-950/80 dark:text-teal-300 border border-teal-200 dark:border-teal-800 hover:underline cursor-pointer"
                            title="Click to filter by this Project"
                          >
                            <Folder className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>{projName}</span>
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            <Folder className="w-3.5 h-3.5" /> General / Portal Wide
                          </span>
                        )}

                        {/* Module Badge */}
                        {sug.moduleId && modName && (
                          <button
                            onClick={() => {
                              if (sug.projectId) setSelectedProjectId(sug.projectId);
                              setSelectedModuleId(sug.moduleId!);
                            }}
                            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-800 dark:bg-indigo-950/80 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:underline cursor-pointer"
                            title="Click to filter by this Module"
                          >
                            <Layers className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                            <span>{modName}</span>
                          </button>
                        )}

                        <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 font-semibold">
                          {sug.id}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {getStatusBadge(sug.status)}
                        {getPriorityBadge(sug.priority)}
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
                          {getCategoryLabel(sug.category)}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-snug">{sug.title}</h3>
                    </div>
                  </div>

                  {/* Actions Dropdown / Admin status change */}
                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    <select
                      value={sug.status}
                      onChange={e => updateSuggestion(sug.id, { status: e.target.value as any })}
                      className="text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      title="Update Suggestion Status"
                    >
                      <option value="open">Status: Open</option>
                      <option value="under_review">Status: Under Review</option>
                      <option value="planned">Status: Planned</option>
                      <option value="in_progress">Status: In Progress</option>
                      <option value="implemented">Status: Implemented</option>
                      <option value="declined">Status: Declined</option>
                    </select>

                    <button
                      onClick={() => openEditModal(sug)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                      title="Edit Suggestion"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => setDeleteConfirmId(sug.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors cursor-pointer"
                      title="Delete Suggestion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Description Body */}
                <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap pl-[72px]">
                  {sug.description}
                </div>

                {/* Official Response Note if available */}
                {sug.responseNote ? (
                  <div className="ml-[72px] bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-xl p-4 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-teal-800 dark:text-teal-300 uppercase tracking-wider">
                        <MessageSquare className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Official Product / QA Response
                      </div>
                      <button
                        onClick={() => {
                          setResponseModalSug(sug);
                          setResponseNoteText(sug.responseNote || '');
                        }}
                        className="text-xs text-teal-700 dark:text-teal-300 hover:underline cursor-pointer"
                      >
                        Edit Note
                      </button>
                    </div>
                    <p className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed">
                      {sug.responseNote}
                    </p>
                  </div>
                ) : (
                  <div className="ml-[72px]">
                    <button
                      onClick={() => {
                        setResponseModalSug(sug);
                        setResponseNoteText('');
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer inline-flex items-center gap-1"
                    >
                      + Add Official Roadmap Response
                    </button>
                  </div>
                )}

                {/* Footer Submitter & Comments Bar */}
                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 ml-[72px]">
                  <div className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Submitted by <strong className="text-slate-700 dark:text-slate-300">{sug.submittedBy}</strong> {sug.userRole ? `(${sug.userRole})` : ''}</span>
                    <span>•</span>
                    <span>{new Date(sug.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>

                  <button
                    onClick={() => setExpandedCommentsId(isCommentsExpanded ? null : sug.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium transition-colors cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5 text-teal-500" />
                    <span>{sug.comments?.length || 0} Comments</span>
                    {isCommentsExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Comments Panel */}
                {isCommentsExpanded && (
                  <div className="ml-[72px] pt-3 space-y-3 bg-slate-50/80 dark:bg-slate-800/40 p-4 rounded-xl border border-slate-200/60 dark:border-slate-800">
                    <h4 className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Discussion & Feedback</h4>
                    
                    {sug.comments && sug.comments.length > 0 ? (
                      <div className="space-y-2.5">
                        {sug.comments.map(cmt => (
                          <div key={cmt.id} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/70 dark:border-slate-800 space-y-1">
                            <div className="flex items-center justify-between text-xs">
                              <span className="font-semibold text-slate-800 dark:text-slate-200">{cmt.authorName} <span className="font-normal text-slate-500">({cmt.authorRole})</span></span>
                              <span className="text-slate-400 text-[11px]">{new Date(cmt.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap">{cmt.comment}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400 italic">No comments yet. Be the first to join the conversation!</p>
                    )}

                    {/* New Comment Input Box */}
                    <div className="flex gap-2 pt-2">
                      <input
                        type="text"
                        placeholder="Write a comment or feedback..."
                        value={commentInputMap[sug.id] || ''}
                        onChange={e => setCommentInputMap({ ...commentInputMap, [sug.id]: e.target.value })}
                        onKeyDown={e => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleCommentSubmit(sug.id);
                          }
                        }}
                        className="flex-1 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                      <button
                        onClick={() => handleCommentSubmit(sug.id)}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium inline-flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <Send className="w-3 h-3" /> Post
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* SUBMIT / EDIT SUGGESTION MODAL */}
      {isSubmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-gradient-to-r from-teal-900 to-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-lg">{editingSuggestion ? 'Edit Suggestion' : 'Submit New Suggestion'}</h3>
              </div>
              <button
                onClick={() => setIsSubmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              {formError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 rounded-lg text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Add Slack notifications for failed executions"
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 font-medium"
                  required
                />
              </div>

              {/* Project & Module Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Folder className="w-3.5 h-3.5 text-teal-500" /> Project
                  </label>
                  <select
                    value={formProjectId}
                    onChange={e => {
                      setFormProjectId(e.target.value);
                      setFormModuleId(''); // reset module when project changes
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- General / Workspace Wide --</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Layers className="w-3.5 h-3.5 text-indigo-500" /> Specific Module
                  </label>
                  <select
                    value={formModuleId}
                    onChange={e => setFormModuleId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="">-- All / General Module --</option>
                    {availableFormModules.map(m => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="feature_request">Feature Request</option>
                    <option value="ui_ux">UI / UX Design</option>
                    <option value="process_improvement">Process Improvement</option>
                    <option value="automation_idea">Automation Idea</option>
                    <option value="performance">Performance & Scaling</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Priority Level
                  </label>
                  <select
                    value={formPriority}
                    onChange={e => setFormPriority(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                    <option value="critical">Critical Priority</option>
                  </select>
                </div>
              </div>

              {/* Submitter & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Submitted By
                  </label>
                  <input
                    type="text"
                    value={formSubmittedBy}
                    onChange={e => setFormSubmittedBy(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Your Name"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={formUserRole}
                    onChange={e => setFormUserRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="e.g. Senior QA Engineer"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Detailed Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={5}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="Provide complete context, steps, or reasoning behind this proposal..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
                  required
                />
              </div>

              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-semibold text-sm shadow-md transition-colors cursor-pointer"
                >
                  {editingSuggestion ? 'Save Changes' : 'Submit Suggestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ROADMAP RESPONSE NOTE MODAL */}
      {responseModalSug && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Roadmap / Product Response</h3>
              <button
                onClick={() => setResponseModalSug(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Provide an official response note for suggestion <strong>"{responseModalSug.title}"</strong>.
            </p>
            <form onSubmit={handleSaveResponseNote} className="space-y-4">
              <textarea
                rows={4}
                value={responseNoteText}
                onChange={e => setResponseNoteText(e.target.value)}
                placeholder="e.g. Approved by Product Manager. Scheduled for sprint release Q3..."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 leading-relaxed"
              />
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setResponseModalSug(null)}
                  className="px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer"
                >
                  Save Response
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Delete Suggestion?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to delete this suggestion? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  deleteSuggestion(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CLEAR ALL SUGGESTIONS CONFIRMATION MODAL */}
      {isClearAllConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 space-y-4">
            <div className="flex items-center gap-3 text-red-600 dark:text-red-400">
              <div className="p-3 bg-red-100 dark:bg-red-950/60 rounded-full">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Clear All Suggestions?</h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Are you sure you want to remove all existing suggestions? You can then start fresh by adding new project-specific and module-specific suggestions.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setIsClearAllConfirmOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAllSuggestions();
                  setIsClearAllConfirmOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-sm font-semibold shadow-md transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
