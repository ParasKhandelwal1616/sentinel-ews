import { openDB } from 'idb';

const DB_NAME = 'SentinelOfflineDB';
const STORE_NAME = 'pendingIncidents';

// 1. Initialize the local browser database
export const initDB = async () => {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        // Create a store for incidents, auto-generating a unique ID for each
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    },
  });
};

// 2. Save a report locally when there is no internet
export const saveReportOffline = async (reportData: any) => {
  const db = await initDB();
  await db.add(STORE_NAME, { ...reportData, timestamp: Date.now() });
  console.log("💾 NO SIGNAL: Threat report cached locally in IndexedDB.");
};

// 3. Retrieve all locally saved reports
export const getOfflineReports = async () => {
  const db = await initDB();
  return db.getAll(STORE_NAME);
};

// 4. Delete a specific report from local storage after it successfully syncs
export const deleteOfflineReport = async (id: number) => {
  const db = await initDB();
  await db.delete(STORE_NAME, id);
};