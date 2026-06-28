import { createEmptyData, collectionNames } from './data/schema.js';
import { createSeedData } from './data/seed.js';
import { appState, setData } from './state.js';
import { downloadText } from './utils.js';
import { checkDataServiceHealth, estimateDataSize, readRawData, removeRawData, writeRawData, pushDataToCloud } from './services/dataService.js';

let saveTimer = null;

export function normalizeData(input) {
  const base = createEmptyData();
  const incoming = input && typeof input === 'object' ? input : {};
  const normalized = { ...base, ...incoming, settings: { ...base.settings, ...(incoming.settings || {}) } };
  normalized.settings.backend = { ...base.settings.backend, ...((incoming.settings || {}).backend || {}) };
  normalized.settings.notifications = { ...base.settings.notifications, ...((incoming.settings || {}).notifications || {}) };
  normalized.settings.notifications.categorySounds = { ...base.settings.notifications.categorySounds, ...(((incoming.settings || {}).notifications || {}).categorySounds || {}) };
  normalized.settings.googleDriveBackup = { ...base.settings.googleDriveBackup, ...((incoming.settings || {}).googleDriveBackup || {}) };
  for (const name of collectionNames) normalized[name] = Array.isArray(incoming[name]) ? incoming[name] : [];
  return normalized;
}

export function loadData() {
  try {
    const stored = readRawData();
    if (!stored) {
      const data = createEmptyData();
      const seed = createSeedData();
      if (data.settings.enableSeedData) Object.assign(data, seed);
      data.settings = { ...data.settings, seedLoaded: true };
      setData(data);
      saveData();
      return data;
    }
    const data = normalizeData(JSON.parse(stored));
    setData(data);
    return data;
  } catch (error) {
    console.error('Load failed', error);
    const data = createEmptyData();
    setData(data);
    return data;
  }
}

export function saveData() {
  try {
    appState.data.settings.lastSavedAt = new Date().toISOString();
    writeRawData(JSON.stringify(appState.data));
    if (appState.data.settings?.backend?.autoSync && appState.data.settings?.backend?.enabled && appState.data.settings?.backend?.provider === 'supabase') {
      pushDataToCloud(appState.data.settings, appState.data).then(result => {
        if (result?.ok) appState.data.settings.backend.lastSyncAt = new Date().toISOString();
      }).catch(() => {});
    }
    return { ok: true };
  } catch (error) {
    console.error('Save failed', error);
    return { ok: false, error };
  }
}

export function autoSave() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(saveData, 150);
}

export function exportJSON() {
  saveData();
  downloadText(`mogahed-os-backup-${new Date().toISOString().slice(0,10)}.json`, JSON.stringify(appState.data, null, 2));
}

export function backupWithDate() { exportJSON(); }

export function importJSON(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = normalizeData(JSON.parse(reader.result));
        setData(data); saveData(); resolve(data);
      } catch (error) { reject(error); }
    };
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

export function clearData() {
  removeRawData();
  const data = createEmptyData();
  setData(data); saveData();
}

export function checkStorageHealth() {
  const health = checkDataServiceHealth();
  return health.ok
    ? { ok: true, message: health.message || 'التخزين يعمل بشكل سليم.' }
    : { ok: false, message: health.message || 'هناك مشكلة في التخزين. صدّر نسخة احتياطية الآن.' };
}

export function getStorageSizeBytes(data = appState.data) {
  try { return estimateDataSize(JSON.stringify(data)); }
  catch { return 0; }
}
