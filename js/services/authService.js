import { getSupabaseClient, getSupabaseConfigStatus, getSupabaseUser, isSupabaseConfigured } from './supabaseAdapter.js';

let currentUser = null;
let currentMode = 'local';
let lastAuthError = '';

function localUser(settings = {}) {
  return {
    id: settings.localUserId || 'local-user',
    email: settings.localUserEmail || '',
    name: settings.userName || 'مجاهد',
    provider: 'local',
    isLocalOnly: true
  };
}

function normalizeCloudUser(user) {
  if (!user) return null;
  return {
    id: user.id,
    email: user.email || '',
    name: user.user_metadata?.name || user.email || 'مستخدم',
    provider: 'supabase',
    isLocalOnly: false
  };
}

export async function initializeAuthService(settings = {}) {
  lastAuthError = '';
  if (!isSupabaseConfigured(settings)) {
    currentMode = 'local';
    currentUser = localUser(settings);
    return currentUser;
  }
  try {
    const user = await getSupabaseUser(settings);
    currentMode = user ? 'cloud' : 'cloud-ready';
    currentUser = user ? normalizeCloudUser(user) : localUser(settings);
    if (!user) currentUser.provider = 'supabase-ready';
    return currentUser;
  } catch (error) {
    lastAuthError = error?.message || 'تعذر تشغيل Supabase Auth';
    currentMode = 'local';
    currentUser = localUser(settings);
    return currentUser;
  }
}

export function initializeAuthServiceSync(settings = {}) {
  currentMode = isSupabaseConfigured(settings) ? 'cloud-ready' : 'local';
  currentUser = currentUser || localUser(settings);
  return currentUser;
}

export function getCurrentUser() {
  return currentUser || localUser();
}

export async function signUpWithEmail(settings = {}, email = '', password = '') {
  const client = await getSupabaseClient(settings);
  const { data, error } = await client.auth.signUp({ email, password });
  if (error) throw error;
  currentUser = normalizeCloudUser(data.user) || currentUser;
  currentMode = data.user ? 'cloud' : 'cloud-ready';
  return data;
}

export async function signInWithEmail(settings = {}, email = '', password = '') {
  const client = await getSupabaseClient(settings);
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = normalizeCloudUser(data.user);
  currentMode = 'cloud';
  return data;
}

export async function signOutCloud(settings = {}) {
  const client = await getSupabaseClient(settings);
  const { error } = await client.auth.signOut();
  if (error) throw error;
  currentMode = 'cloud-ready';
  currentUser = localUser(settings);
  currentUser.provider = 'supabase-ready';
  return true;
}

export function isCloudAuthReady(settings = {}) { return isSupabaseConfigured(settings); }

export function getAuthStatus(settings = {}) {
  const config = getSupabaseConfigStatus(settings);
  const user = getCurrentUser();
  return {
    ready: true,
    cloudReady: config.ok,
    user,
    mode: currentMode,
    error: lastAuthError,
    message: currentMode === 'cloud'
      ? `متصل بحساب ${user.email || user.id}`
      : config.ok
        ? 'Supabase جاهز. سجّل الدخول لتفعيل المزامنة السحابية.'
        : `وضع محلي. ${config.missing.join('، ') || 'إعدادات Supabase غير مكتملة.'}`
  };
}
