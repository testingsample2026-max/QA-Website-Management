/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
  AppNotification,
  SystemSettings
} from '../types';
import {
  saveDocToFirestore,
  deleteDocFromFirestore,
  fetchCollectionFromFirestore,
  saveBatchToFirestore,
  clearCollectionInFirestore
} from '../lib/firebaseService';

interface AppContextType {
  projects: Project[];
  modules: Module[];
  requirements: Requirement[];
  testCases: TestCase[];
  executions: TestExecution[];
  bugs: Bug[];
  developers: Developer[];
  qaEngineers: QaEngineer[];
  releases: Release[];
  auditLogs: AuditLog[];
  notifications: AppNotification[];
  settings: SystemSettings;
  loading: boolean;
  
  // Dashboard calculated stats
  stats: {
    projectsCount: number;
    modulesCount: number;
    developersCount: number;
    qaCount: number;
    testCasesCount: number;
    executedCount: number;
    passedCount: number;
    failedCount: number;
    blockedCount: number;
    retestCount: number;
    openBugsCount: number;
    closedBugsCount: number;
  };

  // CRUD Operations
  addProject: (data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string; id?: string };
  updateProject: (id: string, data: Partial<Project>) => { success: boolean; error?: string };
  deleteProject: (id: string) => { success: boolean; error?: string };
  duplicateProject: (id: string) => { success: boolean; error?: string };

  addModule: (data: Omit<Module, 'id' | 'createdAt'>) => { success: boolean; error?: string; id?: string };
  updateModule: (id: string, data: Partial<Module>) => { success: boolean; error?: string };
  deleteModule: (id: string) => { success: boolean; error?: string };
  duplicateModule: (id: string) => { success: boolean; error?: string };

  addRequirement: (data: Omit<Requirement, 'id' | 'createdAt'>) => { success: boolean; error?: string; id?: string };
  updateRequirement: (id: string, data: Partial<Requirement>) => { success: boolean; error?: string };
  deleteRequirement: (id: string) => { success: boolean; error?: string };
  duplicateRequirement: (id: string) => { success: boolean; error?: string };

  addTestCase: (data: Omit<TestCase, 'id' | 'createdAt' | 'lastExecutionStatus'>) => { success: boolean; error?: string; id?: string };
  updateTestCase: (id: string, data: Partial<TestCase>) => { success: boolean; error?: string };
  deleteTestCase: (id: string) => { success: boolean; error?: string };
  archiveTestCase: (id: string) => { success: boolean; error?: string };
  restoreTestCase: (id: string) => { success: boolean; error?: string };
  duplicateTestCase: (id: string) => { success: boolean; error?: string };

  addTestExecution: (data: Omit<TestExecution, 'id' | 'executionDate'>) => { success: boolean; error?: string; id?: string };

  addBug: (data: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => { success: boolean; error?: string; id?: string };
  updateBug: (id: string, data: Partial<Bug>) => { success: boolean; error?: string };
  deleteBug: (id: string) => { success: boolean; error?: string };

  addDeveloper: (data: Omit<Developer, 'id'>) => { success: boolean; error?: string; id?: string };
  updateDeveloper: (id: string, data: Partial<Developer>) => { success: boolean; error?: string };
  deleteDeveloper: (id: string) => { success: boolean; error?: string };

  addQaEngineer: (data: Omit<QaEngineer, 'id'>) => { success: boolean; error?: string; id?: string };
  updateQaEngineer: (id: string, data: Partial<QaEngineer>) => { success: boolean; error?: string };
  deleteQaEngineer: (id: string) => { success: boolean; error?: string };

  addRelease: (data: Omit<Release, 'id'>) => { success: boolean; error?: string; id?: string };
  updateRelease: (id: string, data: Partial<Release>) => { success: boolean; error?: string };
  deleteRelease: (id: string) => { success: boolean; error?: string };

  // Bulk Operations
  bulkUpdate: (entityType: AuditLog['entityType'], ids: string[], updates: any) => { success: boolean; error?: string };
  bulkDelete: (entityType: AuditLog['entityType'], ids: string[]) => { success: boolean; error?: string };

  // Notifications & Logging
  addNotification: (title: string, message: string, type: AppNotification['type']) => void;
  clearNotifications: () => void;
  markNotificationsAsRead: () => void;
  clearAllData: () => void;
  updateSettings: (settings: Partial<SystemSettings>) => void;

  // Import/Export
  exportData: () => string;
  importData: (jsonData: string) => { success: boolean; error?: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const defaultSettings: SystemSettings = {
  companyName: "Enterprise QA Solutions",
  theme: 'light',
  language: 'en',
  timezone: 'UTC',
  emailNotifications: true,
  pushNotifications: false,
  userName: "QA Lead",
  userEmail: "testing21352022@gmail.com",
  websiteName: "TestEngine",
  fontFamily: 'sans',
  primaryColor: 'teal',
  borderStyle: 'lite'
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize States as empty by default, loaded from Firestore asynchronously
  const [projects, setProjects] = useState<Project[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [developers, setDevelopers] = useState<Developer[]>([]);
  const [qaEngineers, setQaEngineers] = useState<QaEngineer[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  // Load all data from Firestore on Mount
  useEffect(() => {
    const loadAllDataFromFirestore = async () => {
      try {
        const [
          projs,
          mods,
          reqs,
          tcs,
          execs,
          bgs,
          devs,
          qas,
          rels,
          logs,
          notifs,
          systemSettings
        ] = await Promise.all([
          fetchCollectionFromFirestore<Project>('projects'),
          fetchCollectionFromFirestore<Module>('modules'),
          fetchCollectionFromFirestore<Requirement>('requirements'),
          fetchCollectionFromFirestore<TestCase>('testCases'),
          fetchCollectionFromFirestore<TestExecution>('executions'),
          fetchCollectionFromFirestore<Bug>('bugs'),
          fetchCollectionFromFirestore<Developer>('developers'),
          fetchCollectionFromFirestore<QaEngineer>('qaEngineers'),
          fetchCollectionFromFirestore<Release>('releases'),
          fetchCollectionFromFirestore<AuditLog>('auditLogs'),
          fetchCollectionFromFirestore<AppNotification>('notifications'),
          fetchCollectionFromFirestore<SystemSettings>('settings')
        ]);

        // Sort auditLogs and notifications by timestamp (newest first)
        const sortedLogs = logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        const sortedNotifs = notifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

        setProjects(projs);
        setModules(mods);
        setRequirements(reqs);
        setTestCases(tcs);
        setExecutions(execs);
        setBugs(bgs);
        setDevelopers(devs);
        setQaEngineers(qas);
        setReleases(rels);
        setAuditLogs(sortedLogs);
        setNotifications(sortedNotifs);

        if (systemSettings && systemSettings.length > 0) {
          const globalSettings = (systemSettings as any[]).find(s => s.id === 'global');
          if (globalSettings) {
            setSettings(globalSettings as SystemSettings);
          } else {
            await saveDocToFirestore('settings', 'global', defaultSettings);
          }
        } else {
          await saveDocToFirestore('settings', 'global', defaultSettings);
        }
      } catch (err) {
        console.error("Error loading Firestore data on startup:", err);
      } finally {
        setLoading(false);
      }
    };

    loadAllDataFromFirestore();
  }, []);

  // ID generator helper
  const generateId = useCallback((prefix: string, list: { id: string }[]) => {
    const ids = list.map(item => {
      const parts = item.id.split('-');
      const num = parseInt(parts[parts.length - 1]);
      return isNaN(num) ? 0 : num;
    });
    const nextNum = ids.length > 0 ? Math.max(...ids) + 1 : 101;
    return `${prefix}-${nextNum}`;
  }, []);

  // Logger helper
  const logActivity = useCallback((
    action: AuditLog['action'],
    entityType: AuditLog['entityType'],
    entityId: string,
    entityName: string,
    details: string
  ) => {
    const newLog: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      action,
      entityType,
      entityId,
      entityName,
      details,
      timestamp: new Date().toISOString(),
      user: settings.userName
    };
    setAuditLogs(prev => [newLog, ...prev]);
    saveDocToFirestore('auditLogs', newLog.id, newLog).catch(err => {
      console.error("Firestore logger error:", err);
    });
  }, [settings.userName]);

  // Notification helper
  const addNotification = useCallback((title: string, message: string, type: AppNotification['type']) => {
    const newNotif: AppNotification = {
      id: `NTF-${Date.now()}-${Math.floor(Math.random() * 1000000)}`,
      title,
      message,
      type,
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);
    saveDocToFirestore('notifications', newNotif.id, newNotif).catch(err => {
      console.error("Firestore notification error:", err);
    });
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
    clearCollectionInFirestore('notifications').catch(err => console.error(err));
  }, []);

  const markNotificationsAsRead = useCallback(() => {
    setNotifications(prev => {
      const updated = prev.map(n => ({ ...n, read: true }));
      updated.forEach(n => {
        saveDocToFirestore('notifications', n.id, n).catch(err => console.error(err));
      });
      return updated;
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      saveDocToFirestore('settings', 'global', updated).catch(err => console.error(err));
      return updated;
    });
    addNotification("Settings Updated", "System configuration has been successfully updated.", "success");
  }, [addNotification]);

  const clearAllData = useCallback(() => {
    setProjects([]);
    setModules([]);
    setRequirements([]);
    setTestCases([]);
    setExecutions([]);
    setBugs([]);
    setDevelopers([]);
    setQaEngineers([]);
    setReleases([]);
    setAuditLogs([]);
    setNotifications([]);
    setSettings(defaultSettings);

    const collectionsToClear = [
      'projects',
      'modules',
      'requirements',
      'testCases',
      'executions',
      'bugs',
      'developers',
      'qaEngineers',
      'releases',
      'auditLogs',
      'notifications'
    ];
    Promise.all(collectionsToClear.map(col => clearCollectionInFirestore(col)))
      .then(() => {
        saveDocToFirestore('settings', 'global', defaultSettings);
      })
      .catch(err => console.error("Error clearing Firestore database:", err));

    addNotification("System Reset", "All data has been cleared and settings have been reset.", "info");
  }, [addNotification]);

  // --- Dynamic Stats Calculation ---
  const stats = React.useMemo(() => {
    const projectsCount = projects.length;
    const modulesCount = modules.length;
    const developersCount = developers.length;
    const qaCount = qaEngineers.length;
    const testCasesCount = testCases.length;
    
    const executedCount = executions.length;
    const passedCount = executions.filter(e => e.status === 'passed').length;
    const failedCount = executions.filter(e => e.status === 'failed').length;
    const blockedCount = executions.filter(e => e.status === 'blocked').length;
    const retestCount = executions.filter(e => e.status === 'retest').length;

    const openBugsCount = bugs.filter(b => b.status !== 'closed' && b.status !== 'rejected').length;
    const closedBugsCount = bugs.filter(b => b.status === 'closed' || b.status === 'rejected').length;

    return {
      projectsCount,
      modulesCount,
      developersCount,
      qaCount,
      testCasesCount,
      executedCount,
      passedCount,
      failedCount,
      blockedCount,
      retestCount,
      openBugsCount,
      closedBugsCount
    };
  }, [projects, modules, developers, qaEngineers, testCases, executions, bugs]);

  // --- PROJECT CRUD ---
  const addProject = useCallback((data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data.name.trim()) return { success: false, error: 'Project name is required' };
    const duplicate = projects.some(p => p.name.toLowerCase() === data.name.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'A project with this name already exists' };

    const id = generateId('PRJ', projects);
    const newProj: Project = {
      ...data,
      id,
      name: data.name.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, newProj]);
    saveDocToFirestore('projects', id, newProj).catch(err => console.error(err));

    logActivity('CREATE', 'Project', id, newProj.name, `Created project "${newProj.name}"`);
    addNotification("Project Created", `Project ${id} - "${newProj.name}" was successfully created.`, 'success');
    return { success: true, id };
  }, [projects, generateId, logActivity, addNotification]);

  const updateProject = useCallback((id: string, data: Partial<Project>) => {
    if (data.name !== undefined) {
      if (!data.name.trim()) return { success: false, error: 'Project name is required' };
      const duplicate = projects.some(p => p.id !== id && p.name.toLowerCase() === data.name!.trim().toLowerCase());
      if (duplicate) return { success: false, error: 'A project with this name already exists' };
    }

    setProjects(prev => prev.map(p => {
      if (p.id === id) {
        const updated = { ...p, ...data, updatedAt: new Date().toISOString() };
        saveDocToFirestore('projects', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Project', id, updated.name, `Updated project details`);
        return updated;
      }
      return p;
    }));
    return { success: true };
  }, [projects, logActivity]);

  const deleteProject = useCallback((id: string) => {
    const projectModules = modules.filter(m => m.projectId === id);
    if (projectModules.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete project. It contains ${projectModules.length} module(s). Please delete modules first.` 
      };
    }

    const proj = projects.find(p => p.id === id);
    if (!proj) return { success: false, error: 'Project not found' };

    setProjects(prev => prev.filter(p => p.id !== id));
    deleteDocFromFirestore('projects', id).catch(err => console.error(err));

    logActivity('DELETE', 'Project', id, proj.name, `Deleted project "${proj.name}"`);
    addNotification("Project Deleted", `Project "${proj.name}" was permanently removed.`, 'warning');
    return { success: true };
  }, [projects, modules, logActivity, addNotification]);

  const duplicateProject = useCallback((id: string) => {
    const proj = projects.find(p => p.id === id);
    if (!proj) return { success: false, error: 'Project not found' };

    const newId = generateId('PRJ', projects);
    const duplicated: Project = {
      ...proj,
      id: newId,
      name: `${proj.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setProjects(prev => [...prev, duplicated]);
    saveDocToFirestore('projects', newId, duplicated).catch(err => console.error(err));

    logActivity('DUPLICATE', 'Project', newId, duplicated.name, `Duplicated from project "${proj.name}"`);
    addNotification("Project Duplicated", `New project "${duplicated.name}" duplicated from "${proj.name}".`, 'info');
    return { success: true };
  }, [projects, generateId, logActivity, addNotification]);


  // --- MODULE CRUD ---
  const addModule = useCallback((data: Omit<Module, 'id' | 'createdAt'>) => {
    if (!data.name.trim()) return { success: false, error: 'Module name is required' };
    if (!data.projectId) return { success: false, error: 'Project assignment is required' };

    const duplicate = modules.some(m => m.projectId === data.projectId && m.name.toLowerCase() === data.name.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'A module with this name already exists in the selected project' };

    const id = generateId('MOD', modules);
    const newMod: Module = {
      ...data,
      id,
      name: data.name.trim(),
      createdAt: new Date().toISOString()
    };

    setModules(prev => [...prev, newMod]);
    saveDocToFirestore('modules', id, newMod).catch(err => console.error(err));

    logActivity('CREATE', 'Module', id, newMod.name, `Created module "${newMod.name}"`);
    addNotification("Module Created", `Module ${id} - "${newMod.name}" was successfully created.`, 'success');
    return { success: true, id };
  }, [modules, generateId, logActivity, addNotification]);

  const updateModule = useCallback((id: string, data: Partial<Module>) => {
    if (data.name !== undefined) {
      if (!data.name.trim()) return { success: false, error: 'Module name is required' };
      const current = modules.find(m => m.id === id);
      const projId = data.projectId || current?.projectId;
      const duplicate = modules.some(m => m.id !== id && m.projectId === projId && m.name.toLowerCase() === data.name!.trim().toLowerCase());
      if (duplicate) return { success: false, error: 'A module with this name already exists in this project' };
    }

    setModules(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...data };
        saveDocToFirestore('modules', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Module', id, updated.name, `Updated module details`);
        return updated;
      }
      return m;
    }));
    return { success: true };
  }, [modules, logActivity]);

  const deleteModule = useCallback((id: string) => {
    const moduleTestCases = testCases.filter(tc => tc.moduleId === id);
    if (moduleTestCases.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete module. It contains ${moduleTestCases.length} active test case(s).` 
      };
    }

    const mod = modules.find(m => m.id === id);
    if (!mod) return { success: false, error: 'Module not found' };

    setModules(prev => prev.filter(m => m.id !== id));
    deleteDocFromFirestore('modules', id).catch(err => console.error(err));

    logActivity('DELETE', 'Module', id, mod.name, `Deleted module "${mod.name}"`);
    addNotification("Module Deleted", `Module "${mod.name}" was permanently removed.`, 'warning');
    return { success: true };
  }, [modules, testCases, logActivity, addNotification]);

  const duplicateModule = useCallback((id: string) => {
    const mod = modules.find(m => m.id === id);
    if (!mod) return { success: false, error: 'Module not found' };

    const newId = generateId('MOD', modules);
    const duplicated: Module = {
      ...mod,
      id: newId,
      name: `${mod.name} (Copy)`,
      createdAt: new Date().toISOString()
    };

    setModules(prev => [...prev, duplicated]);
    saveDocToFirestore('modules', newId, duplicated).catch(err => console.error(err));

    logActivity('DUPLICATE', 'Module', newId, duplicated.name, `Duplicated from module "${mod.name}"`);
    addNotification("Module Duplicated", `New module "${duplicated.name}" duplicated from "${mod.name}".`, 'info');
    return { success: true };
  }, [modules, generateId, logActivity, addNotification]);


  // --- REQUIREMENT CRUD ---
  const addRequirement = useCallback((data: Omit<Requirement, 'id' | 'createdAt'>) => {
    if (!data.title.trim()) return { success: false, error: 'Requirement title is required' };
    if (!data.projectId) return { success: false, error: 'Project assignment is required' };
    if (!data.moduleId) return { success: false, error: 'Module assignment is required' };

    const id = generateId('REQ', requirements);
    const newReq: Requirement = {
      ...data,
      id,
      title: data.title.trim(),
      createdAt: new Date().toISOString()
    };

    setRequirements(prev => [...prev, newReq]);
    saveDocToFirestore('requirements', id, newReq).catch(err => console.error(err));

    logActivity('CREATE', 'Requirement', id, newReq.title, `Created requirement "${newReq.title}"`);
    addNotification("Requirement Created", `Requirement ${id} - "${newReq.title}" was successfully created.`, 'success');
    return { success: true, id };
  }, [requirements, generateId, logActivity, addNotification]);

  const updateRequirement = useCallback((id: string, data: Partial<Requirement>) => {
    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: 'Requirement title is required' };
    }

    setRequirements(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...data };
        saveDocToFirestore('requirements', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Requirement', id, updated.title, `Updated requirement details`);
        return updated;
      }
      return r;
    }));
    return { success: true };
  }, [logActivity]);

  const deleteRequirement = useCallback((id: string) => {
    const req = requirements.find(r => r.id === id);
    if (!req) return { success: false, error: 'Requirement not found' };

    setRequirements(prev => prev.filter(r => r.id !== id));
    deleteDocFromFirestore('requirements', id).catch(err => console.error(err));

    logActivity('DELETE', 'Requirement', id, req.title, `Deleted requirement "${req.title}"`);
    addNotification("Requirement Deleted", `Requirement "${req.title}" was permanently removed.`, 'warning');
    return { success: true };
  }, [requirements, logActivity, addNotification]);

  const duplicateRequirement = useCallback((id: string) => {
    const req = requirements.find(r => r.id === id);
    if (!req) return { success: false, error: 'Requirement not found' };

    const newId = generateId('REQ', requirements);
    const duplicated: Requirement = {
      ...req,
      id: newId,
      title: `${req.title} (Copy)`,
      createdAt: new Date().toISOString()
    };

    setRequirements(prev => [...prev, duplicated]);
    saveDocToFirestore('requirements', newId, duplicated).catch(err => console.error(err));

    logActivity('DUPLICATE', 'Requirement', newId, duplicated.title, `Duplicated from requirement "${req.title}"`);
    addNotification("Requirement Duplicated", `New requirement "${duplicated.title}" duplicated from "${req.title}".`, 'info');
    return { success: true };
  }, [requirements, generateId, logActivity, addNotification]);


  // --- TEST CASE CRUD ---
  const addTestCase = useCallback((data: Omit<TestCase, 'id' | 'createdAt' | 'lastExecutionStatus'>) => {
    if (!data.title.trim()) return { success: false, error: 'Test Case title is required' };
    if (!data.projectId) return { success: false, error: 'Project assignment is required' };
    if (!data.moduleId) return { success: false, error: 'Module assignment is required' };

    const id = generateId('TC', testCases);
    const newTC: TestCase = {
      ...data,
      id,
      title: data.title.trim(),
      lastExecutionStatus: 'unexecuted',
      createdAt: new Date().toISOString()
    };

    setTestCases(prev => [...prev, newTC]);
    saveDocToFirestore('testCases', id, newTC).catch(err => console.error(err));

    logActivity('CREATE', 'TestCase', id, newTC.title, `Created test case "${newTC.title}"`);
    addNotification("Test Case Created", `Test Case ${id} - "${newTC.title}" was successfully created.`, 'success');
    return { success: true, id };
  }, [testCases, generateId, logActivity, addNotification]);

  const updateTestCase = useCallback((id: string, data: Partial<TestCase>) => {
    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: 'Test Case title is required' };
    }

    setTestCases(prev => prev.map(tc => {
      if (tc.id === id) {
        const updated = { ...tc, ...data };
        saveDocToFirestore('testCases', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'TestCase', id, updated.title, `Updated test case details`);
        return updated;
      }
      return tc;
    }));
    return { success: true };
  }, [logActivity]);

  const deleteTestCase = useCallback((id: string) => {
    const testExecs = executions.filter(e => e.testCaseId === id);
    if (testExecs.length > 0) {
      return { 
        success: false, 
        error: `Cannot permanently delete test case ${id} because it has ${testExecs.length} execution record(s). It must be Archived instead.` 
      };
    }

    const tc = testCases.find(t => t.id === id);
    if (!tc) return { success: false, error: 'Test Case not found' };

    setTestCases(prev => prev.filter(t => t.id !== id));
    deleteDocFromFirestore('testCases', id).catch(err => console.error(err));

    logActivity('DELETE', 'TestCase', id, tc.title, `Deleted test case "${tc.title}"`);
    addNotification("Test Case Deleted", `Test Case "${tc.title}" was permanently removed.`, 'warning');
    return { success: true };
  }, [testCases, executions, logActivity, addNotification]);

  const archiveTestCase = useCallback((id: string) => {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return { success: false, error: 'Test Case not found' };

    setTestCases(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, status: 'archived' as const };
        saveDocToFirestore('testCases', id, updated).catch(err => console.error(err));
        logActivity('ARCHIVE', 'TestCase', id, t.title, `Archived test case "${t.title}"`);
        return updated;
      }
      return t;
    }));
    addNotification("Test Case Archived", `Test Case "${tc.title}" was archived.`, 'info');
    return { success: true };
  }, [testCases, logActivity, addNotification]);

  const restoreTestCase = useCallback((id: string) => {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return { success: false, error: 'Test Case not found' };

    setTestCases(prev => prev.map(t => {
      if (t.id === id) {
        const updated = { ...t, status: 'active' as const };
        saveDocToFirestore('testCases', id, updated).catch(err => console.error(err));
        logActivity('RESTORE', 'TestCase', id, t.title, `Restored test case "${t.title}"`);
        return updated;
      }
      return t;
    }));
    addNotification("Test Case Restored", `Test Case "${tc.title}" is now active.`, 'success');
    return { success: true };
  }, [testCases, logActivity, addNotification]);

  const duplicateTestCase = useCallback((id: string) => {
    const tc = testCases.find(t => t.id === id);
    if (!tc) return { success: false, error: 'Test Case not found' };

    const newId = generateId('TC', testCases);
    const duplicated: TestCase = {
      ...tc,
      id: newId,
      title: `${tc.title} (Copy)`,
      lastExecutionStatus: 'unexecuted',
      createdAt: new Date().toISOString()
    };

    setTestCases(prev => [...prev, duplicated]);
    saveDocToFirestore('testCases', newId, duplicated).catch(err => console.error(err));

    logActivity('DUPLICATE', 'TestCase', newId, duplicated.title, `Duplicated from test case "${tc.title}"`);
    addNotification("Test Case Duplicated", `New test case "${duplicated.title}" duplicated from "${tc.title}".`, 'info');
    return { success: true };
  }, [testCases, generateId, logActivity, addNotification]);


  // --- TEST EXECUTION CRUD ---
  const addTestExecution = useCallback((data: Omit<TestExecution, 'id' | 'executionDate'>) => {
    if (!data.testCaseId) return { success: false, error: 'Test Case assignment is required' };
    if (!data.status) return { success: false, error: 'Execution status is required' };
    if (!data.executedById) return { success: false, error: 'QA Engineer assignment is required' };

    const tc = testCases.find(t => t.id === data.testCaseId);
    if (!tc) return { success: false, error: 'Target Test Case not found' };

    const id = generateId('EXE', executions);
    const newExec: TestExecution = {
      ...data,
      id,
      executionDate: new Date().toISOString()
    };

    setExecutions(prev => [...prev, newExec]);
    saveDocToFirestore('executions', id, newExec).catch(err => console.error(err));
    
    // Auto-update target Test Case's lastExecutionStatus
    setTestCases(prev => prev.map(t => {
      if (t.id === data.testCaseId) {
        const updatedTC = { ...t, lastExecutionStatus: data.status };
        saveDocToFirestore('testCases', t.id, updatedTC).catch(err => console.error(err));
        return updatedTC;
      }
      return t;
    }));

    logActivity('CREATE', 'TestExecution', id, tc.title, `Executed Test Case "${tc.title}" with status [${data.status.toUpperCase()}]`);
    addNotification("Execution Logged", `Logged ${newExec.status.toUpperCase()} execution for ${data.testCaseId}.`, 'success');
    return { success: true, id };
  }, [testCases, executions, generateId, logActivity, addNotification]);


  // --- BUG TRACKER CRUD ---
  const addBug = useCallback((data: Omit<Bug, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!data.title.trim()) return { success: false, error: 'Bug title is required' };
    if (!data.projectId) return { success: false, error: 'Project assignment is required' };
    if (!data.moduleId) return { success: false, error: 'Module assignment is required' };

    const id = generateId('BUG', bugs);
    const newBug: Bug = {
      ...data,
      id,
      title: data.title.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setBugs(prev => [...prev, newBug]);
    saveDocToFirestore('bugs', id, newBug).catch(err => console.error(err));

    logActivity('CREATE', 'Bug', id, newBug.title, `Created bug "${newBug.title}" in status [${newBug.status.toUpperCase()}]`);
    addNotification("Bug Logged", `Bug ${id} - "${newBug.title}" was successfully logged.`, 'error');
    return { success: true, id };
  }, [bugs, generateId, logActivity, addNotification]);

  const updateBug = useCallback((id: string, data: Partial<Bug>) => {
    if (data.title !== undefined && !data.title.trim()) {
      return { success: false, error: 'Bug title is required' };
    }

    setBugs(prev => prev.map(b => {
      if (b.id === id) {
        const updated = { ...b, ...data, updatedAt: new Date().toISOString() };
        saveDocToFirestore('bugs', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Bug', id, updated.title, `Updated bug status/details`);
        return updated;
      }
      return b;
    }));
    return { success: true };
  }, [logActivity]);

  const deleteBug = useCallback((id: string) => {
    const bug = bugs.find(b => b.id === id);
    if (!bug) return { success: false, error: 'Bug not found' };

    setBugs(prev => prev.filter(b => b.id !== id));
    deleteDocFromFirestore('bugs', id).catch(err => console.error(err));

    logActivity('DELETE', 'Bug', id, bug.title, `Deleted bug "${bug.title}"`);
    addNotification("Bug Deleted", `Bug "${bug.title}" was permanently deleted.`, 'warning');
    return { success: true };
  }, [bugs, logActivity, addNotification]);


  // --- DEVELOPER CRUD ---
  const addDeveloper = useCallback((data: Omit<Developer, 'id'>) => {
    if (!data.name.trim()) return { success: false, error: 'Developer name is required' };
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) return { success: false, error: 'A valid email is required' };

    const duplicate = developers.some(d => d.email.toLowerCase() === data.email.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'A developer with this email already exists' };

    const id = generateId('DEV', developers);
    const newDev: Developer = {
      ...data,
      id,
      name: data.name.trim(),
      email: data.email.trim()
    };

    setDevelopers(prev => [...prev, newDev]);
    saveDocToFirestore('developers', id, newDev).catch(err => console.error(err));

    logActivity('CREATE', 'Developer', id, newDev.name, `Added developer "${newDev.name}"`);
    addNotification("Developer Added", `Developer ${id} - "${newDev.name}" was added.`, 'success');
    return { success: true, id };
  }, [developers, generateId, logActivity, addNotification]);

  const updateDeveloper = useCallback((id: string, data: Partial<Developer>) => {
    if (data.name !== undefined && !data.name.trim()) return { success: false, error: 'Developer name is required' };
    if (data.email !== undefined) {
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) return { success: false, error: 'A valid email is required' };
      const duplicate = developers.some(d => d.id !== id && d.email.toLowerCase() === data.email!.trim().toLowerCase());
      if (duplicate) return { success: false, error: 'A developer with this email already exists' };
    }

    setDevelopers(prev => prev.map(d => {
      if (d.id === id) {
        const updated = { ...d, ...data };
        saveDocToFirestore('developers', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Developer', id, updated.name, `Updated developer details`);
        return updated;
      }
      return d;
    }));
    return { success: true };
  }, [developers, logActivity]);

  const deleteDeveloper = useCallback((id: string) => {
    const activeBugs = bugs.filter(b => b.assignedDevId === id && b.status !== 'closed' && b.status !== 'rejected');
    if (activeBugs.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete developer. This developer has ${activeBugs.length} open/assigned bug(s).` 
      };
    }

    const dev = developers.find(d => d.id === id);
    if (!dev) return { success: false, error: 'Developer not found' };

    setDevelopers(prev => prev.filter(d => d.id !== id));
    deleteDocFromFirestore('developers', id).catch(err => console.error(err));

    logActivity('DELETE', 'Developer', id, dev.name, `Deleted developer "${dev.name}"`);
    addNotification("Developer Removed", `Developer "${dev.name}" was permanently removed.`, 'warning');
    return { success: true };
  }, [developers, bugs, logActivity, addNotification]);


  // --- QA ENGINEER CRUD ---
  const addQaEngineer = useCallback((data: Omit<QaEngineer, 'id'>) => {
    if (!data.name.trim()) return { success: false, error: 'QA Engineer name is required' };
    if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) return { success: false, error: 'A valid email is required' };

    const duplicate = qaEngineers.some(q => q.email.toLowerCase() === data.email.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'A QA Engineer with this email already exists' };

    const id = generateId('QA', qaEngineers);
    const newQA: QaEngineer = {
      ...data,
      id,
      name: data.name.trim(),
      email: data.email.trim()
    };

    setQaEngineers(prev => [...prev, newQA]);
    saveDocToFirestore('qaEngineers', id, newQA).catch(err => console.error(err));

    logActivity('CREATE', 'QaEngineer', id, newQA.name, `Added QA Engineer "${newQA.name}"`);
    addNotification("QA Engineer Added", `QA Engineer ${id} - "${newQA.name}" was added.`, 'success');
    return { success: true, id };
  }, [qaEngineers, generateId, logActivity, addNotification]);

  const updateQaEngineer = useCallback((id: string, data: Partial<QaEngineer>) => {
    if (data.name !== undefined && !data.name.trim()) return { success: false, error: 'QA Engineer name is required' };
    if (data.email !== undefined) {
      if (!data.email.trim() || !/\S+@\S+\.\S+/.test(data.email)) return { success: false, error: 'A valid email is required' };
      const duplicate = qaEngineers.some(q => q.id !== id && q.email.toLowerCase() === data.email!.trim().toLowerCase());
      if (duplicate) return { success: false, error: 'A QA Engineer with this email already exists' };
    }

    setQaEngineers(prev => prev.map(q => {
      if (q.id === id) {
        const updated = { ...q, ...data };
        saveDocToFirestore('qaEngineers', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'QaEngineer', id, updated.name, `Updated QA Engineer details`);
        return updated;
      }
      return q;
    }));
    return { success: true };
  }, [qaEngineers, logActivity]);

  const deleteQaEngineer = useCallback((id: string) => {
    const activeExecs = executions.filter(e => e.executedById === id);
    if (activeExecs.length > 0) {
      return { 
        success: false, 
        error: `Cannot delete QA Engineer. This engineer has ${activeExecs.length} execution history record(s) logged.` 
      };
    }

    const qa = qaEngineers.find(q => q.id === id);
    if (!qa) return { success: false, error: 'QA Engineer not found' };

    setQaEngineers(prev => prev.filter(q => q.id !== id));
    deleteDocFromFirestore('qaEngineers', id).catch(err => console.error(err));

    logActivity('DELETE', 'QaEngineer', id, qa.name, `Deleted QA Engineer "${qa.name}"`);
    addNotification("QA Engineer Removed", `QA Engineer "${qa.name}" was permanently removed.`, 'warning');
    return { success: true };
  }, [qaEngineers, executions, logActivity, addNotification]);


  // --- RELEASE CRUD ---
  const addRelease = useCallback((data: Omit<Release, 'id' | 'createdAt'>) => {
    if (!data.version.trim()) return { success: false, error: 'Release version is required' };
    if (!data.projectId) return { success: false, error: 'Project assignment is required' };

    const duplicate = releases.some(r => r.projectId === data.projectId && r.version.toLowerCase() === data.version.trim().toLowerCase());
    if (duplicate) return { success: false, error: 'This release version already exists for the selected project' };

    const id = generateId('REL', releases);
    const newRel: Release = {
      ...data,
      id,
      version: data.version.trim(),
      createdAt: new Date().toISOString()
    };

    setReleases(prev => [...prev, newRel]);
    saveDocToFirestore('releases', id, newRel).catch(err => console.error(err));

    logActivity('CREATE', 'Release', id, newRel.version, `Created release version "${newRel.version}"`);
    addNotification("Release Created", `Release ${id} - "${newRel.version}" was successfully planned.`, 'success');
    return { success: true, id };
  }, [releases, generateId, logActivity, addNotification]);

  const updateRelease = useCallback((id: string, data: Partial<Release>) => {
    if (data.version !== undefined) {
      if (!data.version.trim()) return { success: false, error: 'Release version is required' };
      const current = releases.find(r => r.id === id);
      const projId = data.projectId || current?.projectId;
      const duplicate = releases.some(r => r.id !== id && r.projectId === projId && r.version.toLowerCase() === data.version!.trim().toLowerCase());
      if (duplicate) return { success: false, error: 'This release version already exists for this project' };
    }

    setReleases(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...data };
        saveDocToFirestore('releases', id, updated).catch(err => console.error(err));
        logActivity('UPDATE', 'Release', id, updated.version, `Updated release details`);
        return updated;
      }
      return r;
    }));
    return { success: true };
  }, [releases, logActivity]);

  const deleteRelease = useCallback((id: string) => {
    const rel = releases.find(r => r.id === id);
    if (!rel) return { success: false, error: 'Release not found' };

    setReleases(prev => prev.filter(r => r.id !== id));
    deleteDocFromFirestore('releases', id).catch(err => console.error(err));

    logActivity('DELETE', 'Release', id, rel.name, `Deleted release "${rel.name}"`);
    addNotification("Release Deleted", `Release "${rel.name}" was permanently deleted.`, 'warning');
    return { success: true };
  }, [releases, logActivity, addNotification]);


  // --- BULK OPERATIONS ---
  const bulkUpdate = useCallback((entityType: AuditLog['entityType'], ids: string[], updates: any) => {
    if (ids.length === 0) return { success: false, error: "No records selected" };

    if (entityType === 'TestCase') {
      setTestCases(prev => prev.map(tc => {
        if (ids.includes(tc.id)) {
          const updated = { ...tc, ...updates };
          saveDocToFirestore('testCases', tc.id, updated).catch(err => console.error(err));
          return updated;
        }
        return tc;
      }));
    } else if (entityType === 'Bug') {
      setBugs(prev => prev.map(b => {
        if (ids.includes(b.id)) {
          const updated = { ...b, ...updates, updatedAt: new Date().toISOString() };
          saveDocToFirestore('bugs', b.id, updated).catch(err => console.error(err));
          return updated;
        }
        return b;
      }));
    } else if (entityType === 'Requirement') {
      setRequirements(prev => prev.map(r => {
        if (ids.includes(r.id)) {
          const updated = { ...r, ...updates };
          saveDocToFirestore('requirements', r.id, updated).catch(err => console.error(err));
          return updated;
        }
        return r;
      }));
    } else {
      return { success: false, error: `Bulk update not supported for ${entityType}` };
    }

    logActivity('BULK_UPDATE', entityType, 'BULK', `${ids.length} records`, `Bulk updated status/priority for ${ids.length} records`);
    addNotification("Bulk Update Success", `Successfully updated ${ids.length} ${entityType}(s).`, 'success');
    return { success: true };
  }, [logActivity, addNotification, testCases, bugs, requirements]);

  const bulkDelete = useCallback((entityType: AuditLog['entityType'], ids: string[]) => {
    if (ids.length === 0) return { success: false, error: "No records selected" };

    let successCount = 0;
    let failedCount = 0;
    let lastError = "";

    if (entityType === 'TestCase') {
      const nonExecutableIds: string[] = [];

      ids.forEach(id => {
        const hasExec = executions.some(e => e.testCaseId === id);
        if (hasExec) {
          failedCount++;
          lastError = "Some selected test cases have active executions and must be Archived instead.";
        } else {
          nonExecutableIds.push(id);
          successCount++;
        }
      });

      if (nonExecutableIds.length > 0) {
        setTestCases(prev => prev.filter(tc => !nonExecutableIds.includes(tc.id)));
        nonExecutableIds.forEach(id => {
          deleteDocFromFirestore('testCases', id).catch(err => console.error(err));
        });
      }
    } else if (entityType === 'Bug') {
      setBugs(prev => prev.filter(b => !ids.includes(b.id)));
      ids.forEach(id => {
        deleteDocFromFirestore('bugs', id).catch(err => console.error(err));
      });
      successCount = ids.length;
    } else if (entityType === 'Requirement') {
      setRequirements(prev => prev.filter(r => !ids.includes(r.id)));
      ids.forEach(id => {
        deleteDocFromFirestore('requirements', id).catch(err => console.error(err));
      });
      successCount = ids.length;
    } else if (entityType === 'Module') {
      const erasableIds: string[] = [];
      ids.forEach(id => {
        const hasCases = testCases.some(tc => tc.moduleId === id);
        if (hasCases) {
          failedCount++;
          lastError = "Some selected modules contain test cases and cannot be deleted.";
        } else {
          erasableIds.push(id);
          successCount++;
        }
      });
      if (erasableIds.length > 0) {
        setModules(prev => prev.filter(m => !erasableIds.includes(m.id)));
        erasableIds.forEach(id => {
          deleteDocFromFirestore('modules', id).catch(err => console.error(err));
        });
      }
    } else if (entityType === 'Project') {
      const erasableIds: string[] = [];
      ids.forEach(id => {
        const hasModules = modules.some(m => m.projectId === id);
        if (hasModules) {
          failedCount++;
          lastError = "Some selected projects contain modules and cannot be deleted.";
        } else {
          erasableIds.push(id);
          successCount++;
        }
      });
      if (erasableIds.length > 0) {
        setProjects(prev => prev.filter(p => !erasableIds.includes(p.id)));
        erasableIds.forEach(id => {
          deleteDocFromFirestore('projects', id).catch(err => console.error(err));
        });
      }
    } else {
      return { success: false, error: `Bulk delete not supported for ${entityType}` };
    }

    if (successCount > 0) {
      logActivity('BULK_DELETE', entityType, 'BULK', `${successCount} records`, `Bulk deleted ${successCount} records`);
      addNotification("Bulk Delete Complete", `Successfully deleted ${successCount} record(s).` + (failedCount > 0 ? ` Failed to delete ${failedCount} record(s).` : ''), failedCount > 0 ? 'warning' : 'success');
    }

    if (failedCount > 0 && successCount === 0) {
      return { success: false, error: lastError };
    }

    return { success: true };
  }, [executions, testCases, modules, projects, logActivity, addNotification]);


  // --- IMPORT / EXPORT DATA ---
  const exportData = useCallback(() => {
    const fullState = {
      projects,
      modules,
      requirements,
      testCases,
      executions,
      bugs,
      developers,
      qaEngineers,
      releases,
      auditLogs,
      settings
    };
    return JSON.stringify(fullState, null, 2);
  }, [projects, modules, requirements, testCases, executions, bugs, developers, qaEngineers, releases, auditLogs, settings]);

  const importData = useCallback((jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Basic schema validations to prevent garbage imports
      if (parsed.projects && Array.isArray(parsed.projects)) {
        setProjects(parsed.projects);
        saveBatchToFirestore('projects', parsed.projects).catch(err => console.error(err));
      }
      if (parsed.modules && Array.isArray(parsed.modules)) {
        setModules(parsed.modules);
        saveBatchToFirestore('modules', parsed.modules).catch(err => console.error(err));
      }
      if (parsed.requirements && Array.isArray(parsed.requirements)) {
        setRequirements(parsed.requirements);
        saveBatchToFirestore('requirements', parsed.requirements).catch(err => console.error(err));
      }
      if (parsed.testCases && Array.isArray(parsed.testCases)) {
        setTestCases(parsed.testCases);
        saveBatchToFirestore('testCases', parsed.testCases).catch(err => console.error(err));
      }
      if (parsed.executions && Array.isArray(parsed.executions)) {
        setExecutions(parsed.executions);
        saveBatchToFirestore('executions', parsed.executions).catch(err => console.error(err));
      }
      if (parsed.bugs && Array.isArray(parsed.bugs)) {
        setBugs(parsed.bugs);
        saveBatchToFirestore('bugs', parsed.bugs).catch(err => console.error(err));
      }
      if (parsed.developers && Array.isArray(parsed.developers)) {
        setDevelopers(parsed.developers);
        saveBatchToFirestore('developers', parsed.developers).catch(err => console.error(err));
      }
      if (parsed.qaEngineers && Array.isArray(parsed.qaEngineers)) {
        setQaEngineers(parsed.qaEngineers);
        saveBatchToFirestore('qaEngineers', parsed.qaEngineers).catch(err => console.error(err));
      }
      if (parsed.releases && Array.isArray(parsed.releases)) {
        setReleases(parsed.releases);
        saveBatchToFirestore('releases', parsed.releases).catch(err => console.error(err));
      }
      if (parsed.auditLogs && Array.isArray(parsed.auditLogs)) {
        setAuditLogs(parsed.auditLogs);
        saveBatchToFirestore('auditLogs', parsed.auditLogs).catch(err => console.error(err));
      }
      if (parsed.settings) {
        const importedSettings = { ...defaultSettings, ...parsed.settings };
        setSettings(importedSettings);
        saveDocToFirestore('settings', 'global', importedSettings).catch(err => console.error(err));
      }

      logActivity('IMPORT', 'Project', 'ALL', 'Imported Database', `Imported database snapshot containing multiple records`);
      addNotification("Import Successful", "System database was successfully restored from external backup.", "success");
      return { success: true };
    } catch (e: any) {
      return { success: false, error: "Invalid backup file structure or formatting error: " + e.message };
    }
  }, [logActivity, addNotification]);


  return (
    <AppContext.Provider value={{
      projects,
      modules,
      requirements,
      testCases,
      executions,
      bugs,
      developers,
      qaEngineers,
      releases,
      auditLogs,
      notifications,
      settings,
      stats,
      loading,

      addProject,
      updateProject,
      deleteProject,
      duplicateProject,

      addModule,
      updateModule,
      deleteModule,
      duplicateModule,

      addRequirement,
      updateRequirement,
      deleteRequirement,
      duplicateRequirement,

      addTestCase,
      updateTestCase,
      deleteTestCase,
      archiveTestCase,
      restoreTestCase,
      duplicateTestCase,

      addTestExecution,

      addBug,
      updateBug,
      deleteBug,

      addDeveloper,
      updateDeveloper,
      deleteDeveloper,

      addQaEngineer,
      updateQaEngineer,
      deleteQaEngineer,

      addRelease,
      updateRelease,
      deleteRelease,

      bulkUpdate,
      bulkDelete,

      addNotification,
      clearNotifications,
      markNotificationsAsRead,
      clearAllData,
      updateSettings,

      exportData,
      importData
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
