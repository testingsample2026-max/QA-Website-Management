/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  writeBatch 
} from 'firebase/firestore';
import { db } from './firebase';
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

// Generic CRUD functions
enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: null,
      email: null,
      emailVerified: null,
      isAnonymous: null,
      tenantId: null,
      providerInfo: []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export const saveDocToFirestore = async (collectionName: string, docId: string, data: any) => {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, data);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
};

export const deleteDocFromFirestore = async (collectionName: string, docId: string) => {
  const path = `${collectionName}/${docId}`;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
};

export const fetchCollectionFromFirestore = async <T>(collectionName: string): Promise<T[]> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const items: T[] = [];
    querySnapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() } as any);
    });
    return items;
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, collectionName);
    return [];
  }
};

// Batch update/save function (useful for initial setups, bulk edits, imports or clears)
export const saveBatchToFirestore = async (collectionName: string, items: { id: string; [key: string]: any }[]) => {
  try {
    // Firestore batch limit is 500 operations
    const chunks = [];
    const chunkSize = 400;
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      chunk.forEach((item) => {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
  }
};

export const clearCollectionInFirestore = async (collectionName: string) => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    const batch = writeBatch(db);
    let count = 0;
    querySnapshot.forEach((document) => {
      batch.delete(doc(db, collectionName, document.id));
      count++;
    });
    if (count > 0) {
      await batch.commit();
    }
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, collectionName);
  }
};
