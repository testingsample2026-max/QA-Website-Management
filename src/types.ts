/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Project {
  id: string; // e.g., PRJ-101
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
  type?: 'website' | 'mobile_app';
}

export interface Module {
  id: string; // e.g., MOD-201
  projectId: string;
  name: string;
  description: string;
  status: 'active' | 'archived';
  createdAt: string;
}

export interface Requirement {
  id: string; // e.g., REQ-301
  projectId: string;
  moduleId: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'draft' | 'approved' | 'implemented' | 'deprecated';
  createdAt: string;
}

export interface TestCase {
  id: string; // e.g., TC-401
  projectId: string;
  moduleId: string;
  requirementId: string | null;
  title: string;
  description: string;
  preconditions: string;
  steps: string[];
  expectedResult: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'manual' | 'automated';
  status: 'active' | 'draft' | 'deprecated' | 'archived';
  lastExecutionStatus: 'passed' | 'failed' | 'blocked' | 'retest' | 'unexecuted' | 'testing';
  assignedQaId: string | null;
  createdAt: string;
}

export interface TestExecution {
  id: string; // e.g., EXE-501
  testCaseId: string;
  projectId: string;
  moduleId: string;
  status: 'passed' | 'failed' | 'blocked' | 'retest' | 'testing';
  executedById: string; // QA Engineer ID
  executionDate: string;
  notes: string;
  actualResult: string;
  runTimeMs: number | null;
  attachments?: { name: string; type: string; data: string }[];
}

export interface Bug {
  id: string; // e.g., BUG-601
  projectId: string;
  moduleId: string;
  testCaseId: string | null;
  executionId: string | null;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  priority: 'low' | 'medium' | 'high' | 'immediate';
  status: 'new' | 'assigned' | 'open' | 'fixed' | 'retesting' | 'closed' | 'rejected';
  assignedDevId: string | null;
  reporterQaId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Developer {
  id: string; // e.g., DEV-701
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface QaEngineer {
  id: string; // e.g., QA-801
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive';
}

export interface Release {
  id: string; // e.g., REL-901
  projectId: string;
  version: string;
  releaseDate: string;
  status: 'draft' | 'beta' | 'stable' | 'archived';
  notes: string;
  createdAt: string;
}

export interface SuggestionComment {
  id: string;
  authorName: string;
  authorRole: string;
  comment: string;
  createdAt: string;
}

export interface Suggestion {
  id: string; // e.g., SUG-1001
  projectId?: string;
  moduleId?: string;
  title: string;
  description: string;
  category: 'feature_request' | 'ui_ux' | 'process_improvement' | 'automation_idea' | 'performance' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'under_review' | 'planned' | 'in_progress' | 'implemented' | 'declined';
  submittedBy: string;
  userRole?: string;
  votes: number;
  votedUserIds?: string[];
  responseNote?: string;
  comments?: SuggestionComment[];
  createdAt: string;
  updatedAt: string;
}

export interface AuditLog {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'ARCHIVE' | 'RESTORE' | 'DUPLICATE' | 'BULK_UPDATE' | 'BULK_DELETE' | 'IMPORT';
  entityType: 'Project' | 'Module' | 'Requirement' | 'TestCase' | 'TestExecution' | 'Bug' | 'Developer' | 'QaEngineer' | 'Release' | 'Suggestion';
  entityId: string;
  entityName: string;
  details: string;
  timestamp: string;
  user: string;
}

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export interface SystemSettings {
  companyName: string;
  theme: 'light' | 'dark';
  language: string;
  timezone: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  userName: string;
  userEmail: string;
  websiteName?: string;
  fontFamily: 'sans' | 'display' | 'mono' | 'outfit' | 'serif';
  primaryColor: 'indigo' | 'emerald' | 'blue' | 'amber' | 'rose' | 'violet' | 'slate' | 'teal' | 'orange' | 'fuchsia' | 'nordic' | 'obsidian';
  borderStyle?: 'lite' | 'classic' | 'accent' | 'none' | 'thick';
}
