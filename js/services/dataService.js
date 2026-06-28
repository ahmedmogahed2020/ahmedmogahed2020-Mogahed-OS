import { localStorageAdapter } from './localStorageAdapter.js';
import { initializeAuthService, initializeAuthServiceSync, getAuthStatus } from './authService.js';
import { getFileServiceStatus } from './fileService.js';
import { initializeSyncService, getSyncStatus, markSynced, queueSync, pushLocalSnapshot, pullCloudSnapshot, mergeData } from './syncService.js';

const STORAGE_KEY = 'mogahed_os_data_v1';
let activeAdapter = localStorageAdapter;
let initialized = false;

export function initializeBackendServices(settings = {}) {
  initializeAuthServiceSync(settings);
  initializeAuthService(settings).catch(() => {});
  initializeSyncService(settings);
  initialized = true;
  return getBackendReadinessReport(settings);
}

export function getActiveAdapter() {
  return activeAdapter;
}

export function readRawData() {
  return activeAdapter.read(STORAGE_KEY);
}

export function writeRawData(serializedData) {
  const result = activeAdapter.write(serializedData, STORAGE_KEY);
  queueSync('save_app_data', { adapter: activeAdapter.id, bytes: activeAdapter.estimateSize(serializedData) });
  if (activeAdapter.mode === 'local') markSynced();
  return result;
}

export function removeRawData() {
  const result = activeAdapter.remove(STORAGE_KEY);
  queueSync('clear_app_data', { adapter: activeAdapter.id });
  if (activeAdapter.mode === 'local') markSynced();
  return result;
}

export function checkDataServiceHealth() {
  return activeAdapter.health();
}

export function estimateDataSize(serializedData = '') {
  return activeAdapter.estimateSize(serializedData);
}

export function getBackendReadinessReport(settings = {}) {
  const backend = settings.backend || {};
  const auth = getAuthStatus(settings);
  const files = getFileServiceStatus(settings);
  const sync = getSyncStatus();
  const storage = checkDataServiceHealth();
  const cloudConfigured = Boolean(backend.enabled && backend.provider === 'supabase' && backend.url && backend.anonKey);
  return {
    initialized,
    mode: cloudConfigured ? 'cloud-ready' : 'local-first',
    adapter: activeAdapter.id,
    storage,
    auth,
    files,
    sync,
    cloudConfigured,
    nextStep: cloudConfigured ? 'Supabase جاهز. استخدم أزرار الرفع/التحميل/الدمج في النسخ الاحتياطي.' : 'أضف Supabase URL وAnon Key وفعّل Cloud لتشغيل المزامنة السحابية.',
    layers: [
      { name: 'Data Service', ok: true, details: `كل الحفظ والتحميل يمر الآن عبر ${activeAdapter.label}.` },
      { name: 'Auth Service', ok: auth.ready, details: auth.message },
      { name: 'File Service', ok: files.ready, details: files.message },
      { name: 'Sync Service', ok: sync.initialized, details: sync.message }
    ]
  };
}


export async function pushDataToCloud(settings = {}, appData = {}) {
  return pushLocalSnapshot(settings, appData);
}

export async function pullDataFromCloud(settings = {}) {
  return pullCloudSnapshot(settings);
}

export function mergeLocalAndCloud(localData = {}, cloudData = {}) {
  return mergeData(localData, cloudData);
}
