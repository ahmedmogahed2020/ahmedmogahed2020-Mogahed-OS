import { createEmptyData, collectionNames } from './data/schema.js';
import { createSeedData } from './data/seed.js';
import { appState, setData } from './state.js';
import { downloadText } from './utils.js';

const STORAGE_KEY = 'mogahed_os_data_v1';
let saveTimer = null;

export function normalizeData(input) {
  const base = createEmptyData();
  const incoming = input && typeof input === 'object' ? input : {};
  const normalized = { ...base, ...incoming, settings: { ...base.settings, ...(incoming.settings || {}) } };
  for (const name of collectionNames) normalized[name] = Array.isArray(incoming[name]) ? incoming[name] : [];
  return normalized;
}

export function loadData() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      const data = createEmptyData();
      const seed = createSeedData();
      Object.assign(data, seed);
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
    localStorage.setItem(STORAGE_KEY, JSON.stringify(appState.data));
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
  localStorage.removeItem(STORAGE_KEY);
  const data = createEmptyData();
  setData(data); saveData();
}

export function checkStorageHealth() {
  try {
    const testKey = '__mogahed_os_test__';
    localStorage.setItem(testKey, 'ok');
    localStorage.removeItem(testKey);
    return { ok: true, message: 'التخزين يعمل بشكل سليم.' };
  } catch (error) {
    return { ok: false, message: 'هناك مشكلة في التخزين المحلي. صدّر نسخة احتياطية الآن.' };
  }
}
