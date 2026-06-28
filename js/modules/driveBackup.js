import { appState } from '../state.js';
import { normalizeData, saveData } from '../storage.js';
import { setData } from '../state.js';
import { confirmDialog, toast } from '../ui.js';
import { formatDate, safeNumber, safeText } from '../utils.js';

const GIS_SRC = 'https://accounts.google.com/gsi/client';
const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const BACKUP_FILE_NAME = 'mogahed-os-backup.json';
const HISTORY_PREFIX = 'mogahed-os-history-';
let gisLoader = null;
let tokenClient = null;
let accessToken = '';
let autoTimer = null;
let lastDriveList = [];

function driveSettings() {
  appState.data.settings.googleDriveBackup = appState.data.settings.googleDriveBackup || {};
  const defaults = { clientId: '', enabled: false, intervalMinutes: 30, keepHistory: true, lastBackupAt: null, lastBackupFileId: '', lastRestoreAt: null, status: 'غير متصل' };
  appState.data.settings.googleDriveBackup = { ...defaults, ...appState.data.settings.googleDriveBackup };
  return appState.data.settings.googleDriveBackup;
}

function backupPayload() {
  saveData();
  return JSON.stringify({ ...appState.data, exportedAt: new Date().toISOString(), source: 'Mogahed OS Google Drive Backup' }, null, 2);
}

function loadGis() {
  if (window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisLoader) return gisLoader;
  gisLoader = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`);
    if (existing) { existing.addEventListener('load', resolve, { once: true }); existing.addEventListener('error', reject, { once: true }); return; }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = () => reject(new Error('تعذر تحميل Google Identity Services. تأكد من الإنترنت.'));
    document.head.appendChild(script);
  });
  return gisLoader;
}

async function ensureToken(prompt = '') {
  const settings = driveSettings();
  if (!settings.clientId) throw new Error('أضف Google OAuth Client ID أولًا من الإعدادات أو النسخ الاحتياطي.');
  await loadGis();
  return new Promise((resolve, reject) => {
    tokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: settings.clientId,
      scope: DRIVE_SCOPE,
      callback: response => {
        if (response?.error) { reject(new Error(response.error)); return; }
        accessToken = response.access_token || '';
        settings.status = accessToken ? 'متصل' : 'غير متصل';
        saveData();
        if (accessToken) resolve(accessToken); else reject(new Error('لم يتم الحصول على Access Token.'));
      }
    });
    tokenClient.requestAccessToken({ prompt });
  });
}

async function driveFetch(url, options = {}) {
  const token = accessToken || await ensureToken('');
  const response = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${token}` } });
  if (response.status === 401 || response.status === 403) {
    accessToken = '';
    const fresh = await ensureToken('consent');
    const retry = await fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${fresh}` } });
    if (!retry.ok) throw new Error(await retry.text());
    return retry;
  }
  if (!response.ok) throw new Error(await response.text());
  return response;
}

function multipartBody(metadata, content) {
  const boundary = `mogahed_os_${Date.now()}`;
  const body = [
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Type: application/json; charset=UTF-8',
    '',
    content,
    `--${boundary}--`
  ].join('\r\n');
  return { boundary, body };
}

function escapeDriveQuery(value = '') { return String(value).replace(/'/g, "\\'"); }

async function findBackupFile(name = BACKUP_FILE_NAME) {
  const q = encodeURIComponent(`name='${escapeDriveQuery(name)}' and trashed=false`);
  const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&fields=files(id,name,modifiedTime,size)`;
  const response = await driveFetch(url);
  const data = await response.json();
  return data.files?.[0] || null;
}

async function uploadJsonFile(name, content, existingId = '') {
  const metadata = existingId ? { name, mimeType: 'application/json' } : { name, mimeType: 'application/json', parents: ['appDataFolder'] };
  const { boundary, body } = multipartBody(metadata, content);
  const url = existingId
    ? `https://www.googleapis.com/upload/drive/v3/files/${existingId}?uploadType=multipart&fields=id,name,modifiedTime,size`
    : 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,modifiedTime,size';
  const response = await driveFetch(url, { method: existingId ? 'PATCH' : 'POST', headers: { 'Content-Type': `multipart/related; boundary=${boundary}` }, body });
  return response.json();
}

export function isDriveConnected() { return Boolean(accessToken); }

export async function connectGoogleDrive() {
  try {
    await ensureToken('consent');
    toast('تم الاتصال بجوجل درايف');
    await listDriveBackups();
    return true;
  } catch (error) { toast(error.message || 'فشل الاتصال بجوجل درايف'); return false; }
}

export function disconnectGoogleDrive() {
  if (accessToken && window.google?.accounts?.oauth2?.revoke) window.google.accounts.oauth2.revoke(accessToken, () => {});
  accessToken = '';
  driveSettings().status = 'غير متصل';
  saveData();
  toast('تم فصل جوجل درايف من هذه الجلسة');
}

export async function uploadDriveBackup(silent = false) {
  try {
    const settings = driveSettings();
    await ensureToken(accessToken ? '' : 'consent');
    const content = backupPayload();
    const current = await findBackupFile(BACKUP_FILE_NAME);
    const uploaded = await uploadJsonFile(BACKUP_FILE_NAME, content, current?.id || '');
    if (settings.keepHistory) {
      const stamp = new Date().toISOString().replace(/[:.]/g, '-');
      await uploadJsonFile(`${HISTORY_PREFIX}${stamp}.json`, content, '');
    }
    settings.enabled = true;
    settings.lastBackupAt = new Date().toISOString();
    settings.lastBackupFileId = uploaded.id;
    settings.status = 'متصل';
    saveData();
    if (!silent) toast('تم رفع نسخة احتياطية إلى Google Drive');
    await listDriveBackups();
    return uploaded;
  } catch (error) { if (!silent) toast(error.message || 'فشل رفع النسخة إلى Drive'); throw error; }
}

export async function listDriveBackups() {
  try {
    await ensureToken(accessToken ? '' : 'consent');
    const q = encodeURIComponent(`(name='${BACKUP_FILE_NAME}' or name contains '${HISTORY_PREFIX}') and trashed=false`);
    const url = `https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=${q}&orderBy=modifiedTime desc&fields=files(id,name,modifiedTime,size)`;
    const response = await driveFetch(url);
    const data = await response.json();
    lastDriveList = data.files || [];
    toast(`تم العثور على ${lastDriveList.length} نسخة على Drive`);
    return lastDriveList;
  } catch (error) { toast(error.message || 'فشل قراءة نسخ Drive'); return []; }
}

export function restoreLatestDriveBackup() {
  confirmDialog('استرجاع من Google Drive؟ سيتم استبدال بيانات هذا المتصفح بآخر نسخة محفوظة على Drive.', async () => {
    try {
      const files = await listDriveBackups();
      const latest = files[0];
      if (!latest) { toast('لا توجد نسخ على Google Drive'); return; }
      const response = await driveFetch(`https://www.googleapis.com/drive/v3/files/${latest.id}?alt=media`);
      const json = await response.json();
      const data = normalizeData(json);
      setData(data);
      driveSettings().lastRestoreAt = new Date().toISOString();
      saveData();
      toast('تم استرجاع آخر نسخة من Google Drive');
      setTimeout(() => location.reload(), 450);
    } catch (error) { toast(error.message || 'فشل الاسترجاع من Drive'); }
  });
}

export function updateDriveClientId(value) { driveSettings().clientId = String(value || '').trim(); saveData(); }
export function updateDriveEnabled(checked) { driveSettings().enabled = Boolean(checked); saveData(); startDriveAutoBackup(); }
export function updateDriveInterval(value) { driveSettings().intervalMinutes = Math.max(5, Math.min(1440, safeNumber(value, 30))); saveData(); startDriveAutoBackup(); }
export function updateDriveKeepHistory(checked) { driveSettings().keepHistory = Boolean(checked); saveData(); }

export function startDriveAutoBackup() {
  clearInterval(autoTimer);
  const settings = driveSettings();
  if (!settings.enabled) return;
  const minutes = Math.max(5, safeNumber(settings.intervalMinutes, 30));
  autoTimer = setInterval(() => {
    if (accessToken) uploadDriveBackup(true).catch(() => {});
  }, minutes * 60 * 1000);
}

function listMarkup() {
  const rows = lastDriveList.slice(0, 8).map(file => `<div class="drive-row"><span>${safeText(file.name)}</span><b>${safeText(formatDate(file.modifiedTime))}</b><small>${((safeNumber(file.size,0)/1024).toFixed(1))} KB</small></div>`).join('');
  return rows || '<p class="meta">لم يتم تحميل قائمة النسخ بعد. اضغط عرض النسخ.</p>';
}

export function driveBackupPanel() {
  const s = driveSettings();
  return `<article class="card drive-backup-card"><h3>☁️ Google Drive Backup</h3>
    <p class="meta">نسخ احتياطي سحابي داخل مساحة التطبيق في Google Drive. يعمل تلقائيًا أثناء فتح التطبيق وبعد الاتصال بحساب Google.</p>
    <div class="settings-grid">
      <label class="setting-field wide"><span>Google OAuth Client ID</span><input value="${safeText(s.clientId)}" placeholder="xxxxx.apps.googleusercontent.com" data-action="drive-client-id"><small>يجب إضافة رابط GitHub Pages ضمن Authorized JavaScript origins في Google Cloud.</small></label>
      <label class="setting-field"><span>كل كام دقيقة؟</span><input type="number" min="5" max="1440" value="${safeNumber(s.intervalMinutes,30)}" data-action="drive-interval"></label>
    </div>
    <div class="setting-toggles">
      <label><input type="checkbox" data-action="drive-enabled" ${s.enabled?'checked':''}> تفعيل النسخ التلقائي إلى Drive أثناء فتح التطبيق</label>
      <label><input type="checkbox" data-action="drive-history" ${s.keepHistory?'checked':''}> الاحتفاظ بنسخة تاريخية مع آخر نسخة</label>
    </div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" data-action="drive-connect">اتصال Google Drive</button>
      <button class="btn ghost" data-action="drive-upload-now">رفع نسخة الآن</button>
      <button class="btn ghost" data-action="drive-list">عرض النسخ</button>
      <button class="btn ghost" data-action="drive-restore-latest">استرجاع آخر نسخة</button>
      <button class="btn danger" data-action="drive-disconnect">فصل</button>
    </div>
    <div class="recommendation" style="margin-top:12px">الحالة: ${isDriveConnected() ? 'متصل الآن' : safeText(s.status)} — آخر رفع: ${safeText(formatDate(s.lastBackupAt))} — آخر استرجاع: ${safeText(formatDate(s.lastRestoreAt))}</div>
    <div class="drive-backup-list">${listMarkup()}</div>
  </article>`;
}
