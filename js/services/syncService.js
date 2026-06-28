import { collectionNames, createEmptyData } from '../data/schema.js';
import { getAuthStatus } from './authService.js';
import { getCloudSnapshot, getSupabaseConfigStatus, upsertCloudSnapshot } from './supabaseAdapter.js';


function normalizeCloudData(input) {
  const base = createEmptyData();
  const incoming = input && typeof input === 'object' ? input : {};
  const normalized = { ...base, ...incoming, settings: { ...base.settings, ...(incoming.settings || {}) } };
  normalized.settings.backend = { ...base.settings.backend, ...((incoming.settings || {}).backend || {}) };
  normalized.settings.notifications = { ...base.settings.notifications, ...(((incoming.settings || {}).notifications) || {}) };
  normalized.settings.notifications.categorySounds = { ...base.settings.notifications.categorySounds, ...((((incoming.settings || {}).notifications) || {}).categorySounds || {}) };
  normalized.settings.googleDriveBackup = { ...base.settings.googleDriveBackup, ...((incoming.settings || {}).googleDriveBackup || {}) };
  for (const name of collectionNames) normalized[name] = Array.isArray(incoming[name]) ? incoming[name] : [];
  return normalized;
}

const syncState = {
  initialized: false,
  provider: 'local',
  lastSyncAt: null,
  lastCloudPullAt: null,
  lastCloudPushAt: null,
  pending: [],
  online: true,
  lastError: '',
  lastCloudUpdatedAt: null
};

export function initializeSyncService(settings = {}) {
  syncState.initialized = true;
  syncState.provider = settings.backend?.enabled ? settings.backend.provider || 'cloud' : 'local';
  syncState.online = typeof navigator === 'undefined' ? true : navigator.onLine;
  syncState.lastSyncAt = settings.backend?.lastSyncAt || syncState.lastSyncAt;
  return { ...syncState };
}

export function queueSync(operation, payload = {}) {
  syncState.pending.push({ id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, operation, payload, createdAt: new Date().toISOString() });
  return syncState.pending.length;
}

export function markSynced() {
  syncState.lastSyncAt = new Date().toISOString();
  syncState.pending = [];
  syncState.lastError = '';
  return { ...syncState };
}

export async function pushLocalSnapshot(settings = {}, appData = {}) {
  try {
    const result = await upsertCloudSnapshot(settings, appData);
    syncState.lastSyncAt = new Date().toISOString();
    syncState.lastCloudPushAt = syncState.lastSyncAt;
    syncState.lastCloudUpdatedAt = result?.updated_at || syncState.lastSyncAt;
    syncState.pending = [];
    syncState.lastError = '';
    return { ok: true, result };
  } catch (error) {
    syncState.lastError = error?.message || 'فشل رفع البيانات للسحابة';
    return { ok: false, error };
  }
}

export async function pullCloudSnapshot(settings = {}) {
  try {
    const snapshot = await getCloudSnapshot(settings);
    syncState.lastSyncAt = new Date().toISOString();
    syncState.lastCloudPullAt = syncState.lastSyncAt;
    syncState.lastCloudUpdatedAt = snapshot?.updated_at || null;
    syncState.lastError = '';
    return { ok: true, snapshot, data: snapshot?.data ? normalizeCloudData(snapshot.data) : null };
  } catch (error) {
    syncState.lastError = error?.message || 'فشل تحميل البيانات من السحابة';
    return { ok: false, error };
  }
}

function newer(a, b) {
  const at = Date.parse(a?.updatedAt || a?.createdAt || 0) || 0;
  const bt = Date.parse(b?.updatedAt || b?.createdAt || 0) || 0;
  return at >= bt ? a : b;
}

export function mergeData(localData = {}, cloudData = {}) {
  const local = normalizeCloudData(localData);
  const cloud = normalizeCloudData(cloudData);
  const merged = normalizeCloudData({ ...local, settings: { ...cloud.settings, ...local.settings } });
  for (const name of collectionNames) {
    const map = new Map();
    [...(cloud[name] || []), ...(local[name] || [])].forEach(item => {
      if (!item?.id) return;
      const existing = map.get(item.id);
      map.set(item.id, existing ? newer(existing, item) : item);
    });
    merged[name] = Array.from(map.values()).sort((a, b) => String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || '')));
  }
  merged.settings.backend = { ...cloud.settings.backend, ...local.settings.backend, lastSyncAt: new Date().toISOString() };
  return merged;
}

export function getSyncStatus(settings = {}) {
  const config = getSupabaseConfigStatus(settings);
  const auth = getAuthStatus(settings);
  const cloudActive = config.ok && auth.mode === 'cloud';
  return {
    ...syncState,
    configured: config.ok,
    signedIn: auth.mode === 'cloud',
    cloudActive,
    message: cloudActive
      ? 'المزامنة السحابية جاهزة. يمكنك رفع أو تحميل أو دمج البيانات.'
      : syncState.provider === 'local'
        ? 'المزامنة السحابية غير مفعلة. التطبيق يعمل محليًا بأمان.'
        : `المزامنة تحتاج: ${config.missing.join('، ') || 'تسجيل الدخول'}.`
  };
}
