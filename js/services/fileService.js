import { getSupabaseClient, getSupabaseConfigStatus, getSupabaseUser, isSupabaseConfigured } from './supabaseAdapter.js';

const LARGE_FILE_WARNING_BYTES = 2_500_000;
const DEFAULT_STORAGE_BUCKET = 'mogahed-os-files';

function backend(settings = {}) { return settings.backend || {}; }
export function getStorageBucket(settings = {}) { return backend(settings).storageBucket || DEFAULT_STORAGE_BUCKET; }
export function getFileStorageMode(settings = {}) { return backend(settings).fileStorage || 'local-reference'; }
export function isSupabaseFileStorageEnabled(settings = {}) {
  return isSupabaseConfigured(settings) && getFileStorageMode(settings) === 'supabase-storage';
}

export async function canUseSupabaseStorage(settings = {}) {
  if (!isSupabaseFileStorageEnabled(settings)) return { ok: false, reason: 'Supabase Storage غير مفعل أو إعدادات Supabase غير مكتملة' };
  try {
    const user = await getSupabaseUser(settings);
    if (!user?.id) return { ok: false, reason: 'سجّل الدخول إلى Supabase قبل استخدام Storage' };
    return { ok: true, user };
  } catch (error) {
    return { ok: false, reason: error?.message || 'تعذر التحقق من Supabase Storage' };
  }
}

function cleanFileName(name = 'file') {
  const base = String(name || 'file')
    .replace(/[\\/:*?"<>|#%{}^~\[\]`]/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 120);
  return base || 'file';
}

function extensionFromType(file = {}) {
  const name = String(file.name || '');
  const ext = name.includes('.') ? name.split('.').pop() : '';
  if (ext) return ext.toLowerCase();
  const type = String(file.type || '');
  if (type.includes('pdf')) return 'pdf';
  if (type.includes('png')) return 'png';
  if (type.includes('jpeg') || type.includes('jpg')) return 'jpg';
  if (type.includes('webp')) return 'webp';
  if (type.includes('mp4')) return 'mp4';
  return 'bin';
}

function getFileKind(file = {}) {
  const type = String(file.type || '');
  const name = String(file.name || '').toLowerCase();
  if (type === 'application/pdf' || name.endsWith('.pdf')) return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'file';
}

export function prepareFileRecord(file, extra = {}) {
  if (!file) return null;
  return {
    id: extra.id || `file_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: file.name || extra.name || 'file',
    type: file.type || extra.type || 'application/octet-stream',
    size: file.size || 0,
    kind: extra.kind || getFileKind(file),
    source: extra.source || 'device',
    storageMode: extra.storageMode || 'local-inline',
    createdAt: extra.createdAt || new Date().toISOString(),
    warning: file.size > LARGE_FILE_WARNING_BYTES ? 'الملف كبير. الأفضل رفعه إلى Supabase Storage بدل LocalStorage.' : ''
  };
}

export async function getSignedFileUrl(settings = {}, path = '', expiresIn = 60 * 60 * 24 * 7, bucketName = '') {
  if (!path) return '';
  const access = await canUseSupabaseStorage(settings);
  if (!access.ok) throw new Error(access.reason);
  const client = await getSupabaseClient(settings);
  const bucket = bucketName || getStorageBucket(settings);
  const { data, error } = await client.storage.from(bucket).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data?.signedUrl || '';
}

export async function uploadFileToSupabaseStorage(settings = {}, file, options = {}) {
  if (!file) throw new Error('لا يوجد ملف للرفع');
  if (!isSupabaseFileStorageEnabled(settings)) throw new Error('Supabase Storage غير مفعل من الإعدادات');
  const access = await canUseSupabaseStorage(settings);
  if (!access.ok) throw new Error(access.reason);
  const client = await getSupabaseClient(settings);
  const user = access.user;

  const bucket = options.bucket || getStorageBucket(settings);
  const kind = options.kind || getFileKind(file);
  const itemId = options.itemId || 'unassigned';
  const folder = options.folder || 'knowledge';
  const ext = extensionFromType(file);
  const filename = cleanFileName(file.name || `${kind}.${ext}`);
  const path = `${user.id}/${folder}/${itemId}/${Date.now()}-${filename}`;

  const { error } = await client.storage.from(bucket).upload(path, file, {
    contentType: file.type || 'application/octet-stream',
    upsert: false,
    cacheControl: '3600'
  });
  if (error) throw error;

  let signedUrl = '';
  try { signedUrl = await getSignedFileUrl(settings, path, 60 * 60 * 24 * 7, bucket); } catch { signedUrl = ''; }

  return {
    id: options.id || `file_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    name: file.name || filename,
    type: file.type || 'application/octet-stream',
    size: file.size || 0,
    kind,
    source: 'device',
    storageMode: 'supabase-storage',
    bucket,
    storagePath: path,
    dataUrl: signedUrl,
    signedUrl,
    signedUrlExpiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000).toISOString(),
    createdAt: new Date().toISOString()
  };
}

export async function uploadDataUrlToSupabaseStorage(settings = {}, fileRecord = {}, options = {}) {
  const dataUrl = fileRecord.dataUrl || fileRecord.signedUrl || '';
  if (!dataUrl || !dataUrl.startsWith('data:')) throw new Error('الملف لا يحتوي على بيانات محلية قابلة للرفع');
  const res = await fetch(dataUrl);
  const blob = await res.blob();
  const file = new File([blob], fileRecord.name || 'file', { type: fileRecord.type || blob.type || 'application/octet-stream' });
  const uploaded = await uploadFileToSupabaseStorage(settings, file, {
    ...options,
    id: fileRecord.id,
    kind: fileRecord.kind || getFileKind(file)
  });
  return { ...fileRecord, ...uploaded, pageCount: fileRecord.pageCount || uploaded.pageCount || 0, dataUrl: uploaded.dataUrl };
}

export async function refreshCloudFileUrl(settings = {}, fileRecord = {}) {
  if (fileRecord.storageMode !== 'supabase-storage' || !fileRecord.storagePath) return fileRecord;
  const signedUrl = await getSignedFileUrl(settings, fileRecord.storagePath, 60 * 60 * 24 * 7, fileRecord.bucket);
  return {
    ...fileRecord,
    dataUrl: signedUrl,
    signedUrl,
    signedUrlExpiresAt: new Date(Date.now() + 60 * 60 * 24 * 7 * 1000).toISOString()
  };
}

export function getSupabaseStorageSql(settings = {}) {
  const bucket = getStorageBucket(settings);
  return `-- Supabase File Storage\n-- 1) أنشئ Bucket باسم: ${bucket}\n-- من Storage → New bucket، واجعله Private.\n\ninsert into storage.buckets (id, name, public)\nvalues ('${bucket}', '${bucket}', false)\non conflict (id) do nothing;\n\ncreate policy "Users can upload own files"\non storage.objects for insert to authenticated\nwith check (bucket_id = '${bucket}' and (storage.foldername(name))[1] = auth.uid()::text);\n\ncreate policy "Users can read own files"\non storage.objects for select to authenticated\nusing (bucket_id = '${bucket}' and (storage.foldername(name))[1] = auth.uid()::text);\n\ncreate policy "Users can update own files"\non storage.objects for update to authenticated\nusing (bucket_id = '${bucket}' and (storage.foldername(name))[1] = auth.uid()::text)\nwith check (bucket_id = '${bucket}' and (storage.foldername(name))[1] = auth.uid()::text);\n\ncreate policy "Users can delete own files"\non storage.objects for delete to authenticated\nusing (bucket_id = '${bucket}' and (storage.foldername(name))[1] = auth.uid()::text);`;
}

export function getFileServiceStatus(settings = {}) {
  const mode = getFileStorageMode(settings);
  const config = getSupabaseConfigStatus(settings);
  const bucket = getStorageBucket(settings);
  const hasBucket = Boolean(bucket && /^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/.test(String(bucket)));
  const cloudReady = mode === 'supabase-storage' && config.ok && hasBucket;
  const bucketMessage = hasBucket ? '' : '، اسم Bucket غير صالح';
  return {
    ready: true,
    mode,
    bucket,
    cloudReady,
    message: mode === 'supabase-storage'
      ? (cloudReady ? 'Supabase Storage مفعل. سجّل الدخول قبل رفع الملفات.' : `Supabase Storage مختار لكن الإعداد ناقص: ${config.missing.join('، ')}${bucketMessage}`)
      : 'الملفات تعمل محليًا الآن. اختر Supabase Storage عند الجاهزية.'
  };
}
