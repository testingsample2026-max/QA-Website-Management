/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  Project,
  Module,
  Requirement,
  TestCase,
  TestExecution,
  Bug,
  Developer,
  QaEngineer,
  Release,
  AuditLog,
  Suggestion
} from '../types';

// Generic download helper function
export const downloadFile = (content: string, fileName: string, mimeType: string) => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", url);
  downloadAnchor.setAttribute("download", fileName);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  document.body.removeChild(downloadAnchor);
  URL.revokeObjectURL(url);
};

// Helper to escape values for CSV
const escapeCSV = (val: any): string => {
  if (val === null || val === undefined) return '';
  let str = '';
  if (Array.isArray(val)) {
    str = val.join('; ');
  } else if (typeof val === 'object') {
    str = JSON.stringify(val);
  } else {
    str = String(val);
  }
  // replace double quotes with two double quotes
  str = str.replace(/"/g, '""');
  // wrap in quotes if contains comma, quote, or newline
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
};

// Exporter functions for each page data
export const exportProjectsToCSV = (projects: Project[]) => {
  const headers = ['ID', 'Name', 'Description', 'Status', 'Created At', 'Updated At'];
  const rows = projects.map(p => [
    p.id,
    p.name,
    p.description,
    p.status,
    p.createdAt,
    p.updatedAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'projects_export.csv', 'text/csv;charset=utf-8;');
};

export const exportModulesToCSV = (modules: Module[]) => {
  const headers = ['ID', 'Project ID', 'Name', 'Description', 'Status', 'Created At'];
  const rows = modules.map(m => [
    m.id,
    m.projectId,
    m.name,
    m.description,
    m.status || 'active',
    m.createdAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'modules_export.csv', 'text/csv;charset=utf-8;');
};

export const exportRequirementsToCSV = (requirements: Requirement[]) => {
  const headers = ['ID', 'Project ID', 'Module ID', 'Title', 'Description', 'Priority', 'Status', 'Created At'];
  const rows = requirements.map(r => [
    r.id,
    r.projectId,
    r.moduleId,
    r.title,
    r.description,
    r.priority,
    r.status,
    r.createdAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'requirements_export.csv', 'text/csv;charset=utf-8;');
};

export const exportTestCasesToCSV = (testCases: TestCase[]) => {
  const headers = [
    'ID', 'Project ID', 'Module ID', 'Title', 'Description', 
    'Preconditions', 'Steps', 'Expected Result', 'Priority', 'Status', 
    'Last Execution Status', 'Assigned QA ID', 'Created At'
  ];
  const rows = testCases.map(t => [
    t.id,
    t.projectId,
    t.moduleId,
    t.title,
    t.description,
    t.preconditions,
    t.steps,
    t.expectedResult,
    t.priority,
    t.status,
    t.lastExecutionStatus,
    t.assignedQaId || '',
    t.createdAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'test_cases_export.csv', 'text/csv;charset=utf-8;');
};

export const exportTestExecutionsToCSV = (executions: TestExecution[]) => {
  const headers = [
    'ID', 'Test Case ID', 'Project ID', 'Module ID', 'Status', 
    'Executed By ID', 'Execution Date', 'Notes', 'Actual Result', 'Run Time (ms)'
  ];
  const rows = executions.map(e => [
    e.id,
    e.testCaseId,
    e.projectId,
    e.moduleId,
    e.status,
    e.executedById,
    e.executionDate,
    e.notes,
    e.actualResult,
    e.runTimeMs !== null && e.runTimeMs !== undefined ? e.runTimeMs : ''
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'test_executions_export.csv', 'text/csv;charset=utf-8;');
};

export const exportBugsToCSV = (bugs: Bug[]) => {
  const headers = [
    'ID', 'Project ID', 'Module ID', 'Test Case ID', 'Execution ID', 'Title', 
    'Description', 'Actual Result', 'Expected Result', 'Severity', 'Priority', 'Status', 'Assigned Dev ID', 
    'Reporter QA ID', 'Created At', 'Updated At'
  ];
  const rows = bugs.map(b => [
    b.id,
    b.projectId,
    b.moduleId,
    b.testCaseId || '',
    b.executionId || '',
    b.title,
    b.description,
    b.actualResult || '',
    b.expectedResult || '',
    b.severity,
    b.priority,
    b.status,
    b.assignedDevId || '',
    b.reporterQaId || '',
    b.createdAt,
    b.updatedAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'bugs_export.csv', 'text/csv;charset=utf-8;');
};

export const exportDevelopersToCSV = (developers: Developer[]) => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Status'];
  const rows = developers.map(d => [
    d.id,
    d.name,
    d.email,
    d.role,
    d.status || 'active'
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'developers_export.csv', 'text/csv;charset=utf-8;');
};

export const exportQaEngineersToCSV = (qaEngineers: QaEngineer[]) => {
  const headers = ['ID', 'Name', 'Email', 'Role', 'Status'];
  const rows = qaEngineers.map(q => [
    q.id,
    q.name,
    q.email,
    q.role,
    q.status || 'active'
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'qa_engineers_export.csv', 'text/csv;charset=utf-8;');
};

export const exportReleasesToCSV = (releases: Release[]) => {
  const headers = ['ID', 'Project ID', 'Version', 'Release Date', 'Status', 'Notes', 'Created At'];
  const rows = releases.map(r => [
    r.id,
    r.projectId,
    r.version,
    r.releaseDate,
    r.status,
    r.notes,
    r.createdAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'releases_export.csv', 'text/csv;charset=utf-8;');
};

export const exportAuditLogsToCSV = (auditLogs: AuditLog[]) => {
  const headers = ['ID', 'Action', 'Entity Type', 'Entity ID', 'Entity Name', 'Details', 'Timestamp', 'User'];
  const rows = auditLogs.map(a => [
    a.id,
    a.action,
    a.entityType,
    a.entityId,
    a.entityName,
    a.details,
    a.timestamp,
    a.user
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'audit_logs_export.csv', 'text/csv;charset=utf-8;');
};

export const exportSuggestionsToCSV = (suggestions: Suggestion[]) => {
  const headers = ['ID', 'Project ID', 'Module ID', 'Title', 'Category', 'Priority', 'Status', 'Submitted By', 'Role', 'Votes', 'Response Note', 'Comments Count', 'Created At'];
  const rows = suggestions.map(s => [
    s.id,
    s.projectId || 'General / Portal Wide',
    s.moduleId || 'N/A',
    s.title,
    s.category,
    s.priority,
    s.status,
    s.submittedBy,
    s.userRole || '',
    s.votes,
    s.responseNote || '',
    (s.comments || []).length,
    s.createdAt
  ]);
  const csvContent = [headers, ...rows].map(row => row.map(escapeCSV).join(',')).join('\n');
  downloadFile(csvContent, 'suggestions_export.csv', 'text/csv;charset=utf-8;');
};

export const exportToJSON = (data: any, filename: string) => {
  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, filename, 'application/json;charset=utf-8;');
};
