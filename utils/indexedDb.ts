/**
 * IndexedDB wrapper for storing attachments (blobs/files).
 * Keeps large binary data out of localStorage and Redux.
 */

const DB_NAME = 'workspace_manager_db';
const DB_VERSION = 1;
const ATTACHMENT_STORE = 'attachments';

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not available'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(ATTACHMENT_STORE)) {
        db.createObjectStore(ATTACHMENT_STORE, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export interface StoredAttachment {
  id: string;
  taskId: string;
  name: string;
  mimeType: string;
  size: number;
  data: ArrayBuffer;
  createdBy: string;
  createdAt: string;
}

export async function saveAttachment(attachment: StoredAttachment): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENT_STORE);
    const request = store.put(attachment);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachment(id: string): Promise<StoredAttachment | undefined> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readonly');
    const store = tx.objectStore(ATTACHMENT_STORE);
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result as StoredAttachment | undefined);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteAttachment(id: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENT_STORE);
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getAttachmentsByTask(taskId: string): Promise<StoredAttachment[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readonly');
    const store = tx.objectStore(ATTACHMENT_STORE);
    const request = store.getAll();
    request.onsuccess = () => {
      const all = request.result as StoredAttachment[];
      resolve(all.filter(a => a.taskId === taskId));
    };
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllAttachments(): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(ATTACHMENT_STORE, 'readwrite');
    const store = tx.objectStore(ATTACHMENT_STORE);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
