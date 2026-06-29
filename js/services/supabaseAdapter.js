const SDK_URL = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
const SNAPSHOT_TABLE = 'mogahed_os_snapshots';
let sdkPromise = null;
let clientCache = null;
let clientSignature = '';

function getBackend(settings = {}) { return settings.backend || {}; }

function normalizeSupabaseUrl(value = '') {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function isValidSupabaseProjectUrl(value = '') {
  const url = normalizeSupabaseUrl(value);
  if (!url) return false;
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol) && /\.supabase\.co$/i.test(parsed.hostname) && !parsed.pathname.replace(/\//g, '');
  } catch {
    return false;
  }
}

export function getCleanSupabaseUrl(settings = {}) {
  return normalizeSupabaseUrl(getBackend(settings).url || '');
}
function signature(settings = {}) {
  const backend = getBackend(settings);
  return `${normalizeSupabaseUrl(backend.url || '')}|${backend.anonKey || ''}`;
}

export function isSupabaseConfigured(settings = {}) {
  const backend = getBackend(settings);
  return Boolean(backend.enabled && backend.provider === 'supabase' && isValidSupabaseProjectUrl(backend.url) && backend.anonKey);
}

export function getSupabaseConfigStatus(settings = {}) {
  const backend = getBackend(settings);
  const missing = [];
  if (backend.provider !== 'supabase') missing.push('Backend Provider ليس Supabase');
  if (!backend.enabled) missing.push('Cloud غير مفعل');
  if (!backend.url) missing.push('Supabase URL ناقص');
  else if (!isValidSupabaseProjectUrl(backend.url)) missing.push('Supabase URL يجب أن يكون رابط المشروع مثل https://xxxx.supabase.co وليس رابط dashboard');
  if (!backend.anonKey) missing.push('Anon/Publishable Key ناقص');
  return { ok: missing.length === 0, missing, table: SNAPSHOT_TABLE };
}

export function loadSupabaseSdk() {
  if (window.supabase?.createClient) return Promise.resolve(window.supabase);
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-supabase-sdk="true"]');
    if (existing) {
      existing.addEventListener('load', () => resolve(window.supabase));
      existing.addEventListener('error', () => reject(new Error('فشل تحميل Supabase SDK')));
      return;
    }
    const script = document.createElement('script');
    script.src = SDK_URL;
    script.async = true;
    script.defer = true;
    script.dataset.supabaseSdk = 'true';
    script.onload = () => window.supabase?.createClient ? resolve(window.supabase) : reject(new Error('Supabase SDK غير متاح بعد التحميل'));
    script.onerror = () => reject(new Error('فشل تحميل Supabase SDK. تأكد من الإنترنت.'));
    document.head.appendChild(script);
  });
  return sdkPromise;
}

export async function getSupabaseClient(settings = {}) {
  const status = getSupabaseConfigStatus(settings);
  if (!status.ok) throw new Error(`إعداد Supabase غير مكتمل: ${status.missing.join('، ')}`);
  const sig = signature(settings);
  if (clientCache && clientSignature === sig) return clientCache;
  const sdk = await loadSupabaseSdk();
  const backend = getBackend(settings);
  clientCache = sdk.createClient(normalizeSupabaseUrl(backend.url), backend.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  clientSignature = sig;
  return clientCache;
}

export async function getSupabaseUser(settings = {}) {
  const client = await getSupabaseClient(settings);
  const { data, error } = await client.auth.getUser();
  if (error) return null;
  return data?.user || null;
}

export async function getCloudSnapshot(settings = {}) {
  const client = await getSupabaseClient(settings);
  const user = await getSupabaseUser(settings);
  if (!user?.id) throw new Error('سجّل الدخول أولًا قبل تحميل بيانات السحابة.');
  const { data, error } = await client
    .from(SNAPSHOT_TABLE)
    .select('user_id,data,updated_at,version')
    .eq('user_id', user.id)
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function upsertCloudSnapshot(settings = {}, appData = {}) {
  const client = await getSupabaseClient(settings);
  const user = await getSupabaseUser(settings);
  if (!user?.id) throw new Error('سجّل الدخول أولًا قبل رفع البيانات للسحابة.');
  const payload = {
    user_id: user.id,
    data: appData,
    version: appData.version || 'unknown',
    updated_at: new Date().toISOString()
  };
  const { data, error } = await client
    .from(SNAPSHOT_TABLE)
    .upsert(payload, { onConflict: 'user_id' })
    .select('user_id,updated_at,version')
    .single();
  if (error) throw error;
  return data;
}

export function getSupabaseSql() {
  return `create table if not exists public.${SNAPSHOT_TABLE} (\n  user_id uuid primary key references auth.users(id) on delete cascade,\n  data jsonb not null default '{}'::jsonb,\n  version text,\n  updated_at timestamptz not null default now()\n);\n\nalter table public.${SNAPSHOT_TABLE} enable row level security;\n\ncreate policy "Users can read own snapshot" on public.${SNAPSHOT_TABLE}\nfor select using (auth.uid() = user_id);\n\ncreate policy "Users can insert own snapshot" on public.${SNAPSHOT_TABLE}\nfor insert with check (auth.uid() = user_id);\n\ncreate policy "Users can update own snapshot" on public.${SNAPSHOT_TABLE}\nfor update using (auth.uid() = user_id) with check (auth.uid() = user_id);`;
}
