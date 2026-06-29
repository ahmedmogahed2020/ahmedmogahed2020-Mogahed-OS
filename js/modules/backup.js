import { appState } from '../state.js';
import { autoSave, checkStorageHealth, clearData, exportJSON, importJSON, backupWithDate, saveData } from '../storage.js';
import { confirmDialog, pageHeader, toast } from '../ui.js';
import { formatDate, safeNumber, safeText } from '../utils.js';
import { renderTestReport, runSystemTests } from './qa.js';
import { notificationsPanel } from './notifications.js';
import { guidePanel } from './guide.js';
import { driveBackupPanel, updateDriveClientId, updateDriveEnabled, updateDriveInterval, updateDriveKeepHistory } from './driveBackup.js';
import { getBackendReadinessReport, initializeBackendServices, pushDataToCloud, pullDataFromCloud, mergeLocalAndCloud } from '../services/dataService.js';
import { getAuthStatus, signInWithEmail, signOutCloud, signUpWithEmail, initializeAuthService } from '../services/authService.js';
import { getSyncStatus } from '../services/syncService.js';
import { getSupabaseSql } from '../services/supabaseAdapter.js';
import { canUseSupabaseStorage, getFileServiceStatus, getSupabaseStorageSql, uploadDataUrlToSupabaseStorage } from '../services/fileService.js';
import { setData } from '../state.js';

let lastQaReport = null;

function collectionCount(name) { return Array.isArray(appState.data[name]) ? appState.data[name].length : 0; }
function getDataSize() { return new Blob([JSON.stringify(appState.data)]).size; }
function getSizeMb() { return (getDataSize() / 1024 / 1024).toFixed(2); }
function getStoragePercent() {
  const assumedLimit = 5 * 1024 * 1024;
  return Math.min(100, Math.round((getDataSize() / assumedLimit) * 100));
}


function getBackupModeDetails() {
  const settings = appState.data.settings || {};
  const backend = settings.backend || {};
  const drive = settings.googleDriveBackup || {};
  const auth = getAuthStatus(settings);
  const sync = getSyncStatus(settings);
  const fileStatus = getFileServiceStatus(settings);
  const localOk = checkStorageHealth().ok;
  const dbReady = Boolean(sync.configured);
  const signedIn = auth.mode === 'cloud';
  const fileReady = Boolean(fileStatus.cloudReady);
  const mode = signedIn ? 'Supabase متصل' : dbReady ? 'Supabase جاهز للدخول' : 'Local First';
  const next = signedIn
    ? 'ارفع نسخة الآن أو فعّل المزامنة التلقائية بعد تجربة تصدير JSON.'
    : dbReady
      ? 'سجّل الدخول من قسم Supabase Database Sync ثم ارفع نسخة اختبارية.'
      : 'احتفظ بتصدير JSON قبل أي تعديل، وأدخل URL وAnon Key عند تجهيز Supabase.';
  return { settings, backend, drive, auth, sync, fileStatus, localOk, dbReady, signedIn, fileReady, mode, next };
}

function formatMb(bytes = 0) { return `${(safeNumber(bytes) / 1024 / 1024).toFixed(2)} MB`; }

function statusPill(label, state, tone = 'neutral') {
  return `<span class="backup-pill ${safeText(tone)}"><b>${safeText(label)}</b><em>${safeText(state)}</em></span>`;
}

function getKnowledgeFileStats() {
  const files = (appState.data.knowledge || []).flatMap(item => (item.localFiles || []).map(file => ({ item, file })));
  const localInline = files.filter(x => x.file.dataUrl && x.file.storageMode !== 'supabase-storage');
  const cloud = files.filter(x => x.file.storageMode === 'supabase-storage');
  const totalBytes = files.reduce((sum, x) => sum + safeNumber(x.file.size), 0);
  const localBytes = localInline.reduce((sum, x) => sum + safeNumber(x.file.size), 0);
  return { files, localInline, cloud, totalBytes, localBytes };
}

function findDuplicateIds() {
  const collections = ['goals','projects','tasks','knowledge','decisions','reviews','wins','campaigns'];
  const duplicates = [];
  collections.forEach(name => {
    const seen = new Set();
    (appState.data[name] || []).forEach(item => {
      if (!item?.id) duplicates.push(`${name}: عنصر بدون ID`);
      else if (seen.has(item.id)) duplicates.push(`${name}: ${item.id}`);
      seen.add(item.id);
    });
  });
  return duplicates;
}
function backupHealthReport() {
  const health = checkStorageHealth();
  const duplicates = findDuplicateIds();
  const sizePercent = getStoragePercent();
  const issues = [];
  if (!health.ok) issues.push(health.message);
  if (duplicates.length) issues.push(`يوجد ${duplicates.length} ID مكرر/ناقص.`);
  if (sizePercent > 80) issues.push('حجم البيانات قريب من حد LocalStorage المتوقع. صدّر نسخة الآن.');
  if (!issues.length) issues.push('البيانات تبدو سليمة، والتخزين يعمل.');
  return { health, duplicates, sizePercent, issues };
}

function moreEmptyPanel() {
  return `<article class="card more-empty-panel">
    <div class="empty-state compact">
      <b>اختر أداة من الأعلى</b>
      <p>تم فصل أدوات المزيد عن بعضها حتى لا تبدأ الصفحة مزدحمة. افتح النسخ الاحتياطي أو الإعدادات أو التنبيهات عند الحاجة فقط.</p>
    </div>
  </article>`;
}

export function renderMore() {
  return `<section class="page more-page">${pageHeader('المزيد', 'أدوات متقدمة منظمة في Grid مناسب للموبايل.', '')}
    <div class="more-grid">
      <button class="more-tile" data-route="dashboard"><span>📊</span><b>Dashboard</b><small>لوحة أداء كاملة</small></button>
      <button class="more-tile" data-route="decisions"><span>⚖️</span><b>القرارات</b><small>Decision Journal</small></button>
      <button class="more-tile" data-route="reviews"><span>📝</span><b>المراجعات</b><small>يومية وأسبوعية</small></button>
      <button class="more-tile" data-route="wins"><span>🏆</span><b>لوحة الفوز</b><small>سجل الانتصارات</small></button>
      <button class="more-tile" data-route="campaigns"><span>📣</span><b>تحليل الحملات</b><small>تسعير وربحية</small></button>
      <button class="more-tile" data-action="show-backup"><span>🛡️</span><b>النسخ الاحتياطي</b><small>حماية ومزامنة</small></button>
      <button class="more-tile" data-action="show-notifications"><span>🔔</span><b>التنبيهات</b><small>تذكيرات وأصوات</small></button>
      <button class="more-tile" data-action="show-guide"><span>📘</span><b>تعليمات</b><small>دليل المستخدم</small></button>
      <button class="more-tile" data-action="show-settings"><span>⚙️</span><b>الإعدادات</b><small>بيانات النظام</small></button>
      <button class="more-tile" data-action="show-qa"><span>🧪</span><b>System Health</b><small>اختبار النظام</small></button>
    </div>
    <div id="morePanel">${moreEmptyPanel()}</div>
  </section>`;
}

function renderBackupStats() {
  const report = backupHealthReport();
  return `<div class="decision-intel-grid backup-stats">
    <article class="kpi-card"><small>حجم البيانات</small><strong>${safeText(getSizeMb())} MB</strong></article>
    <article class="kpi-card"><small>استخدام تقريبي</small><strong>${safeText(report.sizePercent)}%</strong></article>
    <article class="kpi-card"><small>آخر حفظ</small><strong>${safeText(formatDate(appState.data.settings.lastSavedAt))}</strong></article>
    <article class="kpi-card"><small>مشاكل IDs</small><strong>${safeText(report.duplicates.length)}</strong></article>
  </div>`;
}


function backupStatusHero() {
  const info = getBackupModeDetails();
  const stats = getKnowledgeFileStats();
  const localTone = info.localOk ? 'ok' : 'warn';
  const driveTone = info.drive.connected ? 'ok' : 'neutral';
  const dbTone = info.signedIn ? 'ok' : info.dbReady ? 'warn' : 'neutral';
  const filesTone = info.fileReady ? 'ok' : stats.localInline.length ? 'warn' : 'neutral';
  return `<article class="card backup-hero-card">
    <div class="backup-hero-main">
      <div>
        <small>وضع الحماية الحالي</small>
        <h3>${safeText(info.mode)}</h3>
        <p>${safeText(info.next)}</p>
      </div>
      <button class="btn primary" data-action="export-json">تصدير JSON آمن</button>
    </div>
    <div class="backup-status-strip">
      ${statusPill('Local', info.localOk ? 'سليم' : 'راجع التخزين', localTone)}
      ${statusPill('Google Drive', info.drive.connected ? 'متصل' : 'اختياري', driveTone)}
      ${statusPill('Supabase DB', info.signedIn ? 'متصل' : info.dbReady ? 'جاهز' : 'غير مفعل', dbTone)}
      ${statusPill('File Storage', info.fileReady ? 'سحابي' : stats.localInline.length ? 'محلي ثقيل' : 'محلي', filesTone)}
    </div>
    <div class="backup-guidance ${info.sync.cloudActive ? 'is-ok' : 'is-warn'}">${safeText(info.sync.message)}</div>
  </article>`;
}

function backupSection(icon, title, description, content, open = false) {
  return `<details class="backup-section" ${open ? 'open' : ''}>
    <summary><span>${safeText(icon)}</span><div><b>${safeText(title)}</b><small>${safeText(description)}</small></div></summary>
    <div class="backup-section-body">${content}</div>
  </details>`;
}

function quickJsonPanel() {
  return `<article class="card backup-action-card"><h3>نسخة JSON سريعة</h3>
    <p class="meta">استخدمها قبل أي تجربة كبيرة أو قبل تحديث المشروع. هذه أسرع طريقة لحفظ نسخة خارج المتصفح.</p>
    <div class="btn-row backup-main-actions">
      <button class="btn primary" data-action="export-json">تصدير JSON</button>
      <label class="btn ghost">استيراد JSON<input class="sr-only" type="file" accept="application/json" data-action="import-json"></label>
      <button class="btn ghost" data-action="backup-date">نسخة بتاريخ اليوم</button>
      <button class="btn ghost" data-action="force-save-data">حفظ الآن</button>
    </div>
  </article>`;
}

function dangerPanel() {
  return `<article class="card backup-action-card danger-soft"><h3>منطقة الخطر</h3>
    <p class="meta">لا تستخدم المسح قبل تصدير JSON أو رفع نسخة إلى Google Drive / Supabase.</p>
    <div class="btn-row backup-main-actions"><button class="btn danger" data-action="clear-data">مسح كل البيانات المحلية</button><button class="btn ghost" data-action="show-qa">تشغيل اختبار النظام</button></div>
  </article>`;
}



function cloudSyncPanel() {
  const settings = appState.data.settings;
  const auth = getAuthStatus(settings);
  const sync = getSyncStatus(settings);
  const backend = settings.backend || {};
  const isSigned = auth.mode === 'cloud';
  const user = auth.user || {};
  const setupItems = [
    ['Supabase URL', Boolean(backend.url), backend.url ? 'موجود' : 'ناقص'],
    ['Anon Key', Boolean(backend.anonKey), backend.anonKey ? 'موجود' : 'ناقص'],
    ['Cloud Enabled', Boolean(backend.enabled), backend.enabled ? 'مفعل' : 'غير مفعل'],
    ['تسجيل الدخول', isSigned, isSigned ? 'متصل' : 'مطلوب قبل الرفع']
  ];
  return `<article class="card cloud-sync-card"><h3>Supabase Database Sync</h3>
    <p class="meta">هذا القسم خاص ببيانات التطبيق نفسها: الأهداف، المهام، المعرفة، القرارات، الحملات، والإعدادات. الملفات الكبيرة لها قسم منفصل اسمه File Storage.</p>
    <div class="backup-checklist">${setupItems.map(([label, ok, text]) => `<span class="${ok ? 'done' : 'todo'}"><b>${ok ? '✅' : '○'} ${safeText(label)}</b><em>${safeText(text)}</em></span>`).join('')}</div>
    <div class="backup-breakdown">
      <span><b>الحالة</b><em>${safeText(isSigned ? 'متصل' : auth.cloudReady ? 'جاهز للدخول' : 'محلي فقط')}</em></span>
      <span><b>الحساب</b><em>${safeText(user.email || 'لا يوجد')}</em></span>
      <span><b>آخر مزامنة</b><em>${safeText(formatDate(backend.lastSyncAt || sync.lastSyncAt))}</em></span>
      <span><b>آخر رفع</b><em>${safeText(formatDate(backend.lastCloudPushAt || sync.lastCloudPushAt))}</em></span>
    </div>
    <div class="settings-grid" style="margin-top:14px">
      <label class="setting-field"><span>البريد الإلكتروني</span><input id="cloudEmail" type="email" placeholder="you@example.com" value="${safeText(user.email || '')}"></label>
      <label class="setting-field"><span>كلمة المرور</span><input id="cloudPassword" type="password" placeholder="••••••••"></label>
      <label class="setting-field"><span>مزامنة تلقائية عند الحفظ</span><select data-action="backend-auto-sync"><option value="false" ${!backend.autoSync?'selected':''}>غير مفعلة</option><option value="true" ${backend.autoSync?'selected':''}>مفعلة بعد تسجيل الدخول</option></select><small>يفضل تركها مغلقة حتى تختبر الرفع والتحميل يدويًا مرة واحدة.</small></label>
    </div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" data-action="cloud-sign-in">تسجيل الدخول</button>
      <button class="btn ghost" data-action="cloud-sign-up">إنشاء حساب</button>
      <button class="btn ghost" data-action="cloud-sign-out">تسجيل خروج</button>
    </div>
    <div class="btn-row backup-safe-actions" style="margin-top:12px">
      <button class="btn primary" data-action="cloud-upload">رفع المحلي للسحابة</button>
      <button class="btn ghost" data-action="cloud-download">تحميل السحابة للجهاز</button>
      <button class="btn ghost" data-action="cloud-merge">دمج المحلي والسحابة</button>
      <button class="btn ghost" data-action="cloud-status">تحديث الحالة</button>
    </div>
    <details class="win-collapsible" style="margin-top:12px"><summary>SQL المطلوب في Supabase لأول مرة</summary><pre class="code-block" dir="ltr">${safeText(getSupabaseSql())}</pre></details>
    <div class="${sync.cloudActive ? 'recommendation' : 'warning-box'}" style="margin-top:12px">${safeText(sync.message)}${auth.error ? ' — ' + safeText(auth.error) : ''}</div>
  </article>`;
}

function backendReadinessPanel() {
  const report = getBackendReadinessReport(appState.data.settings);
  const backend = appState.data.settings.backend || {};
  return `<article class="card backend-readiness-card"><h3>إعدادات Supabase المتقدمة</h3>
    <p class="meta">افتح هذا القسم عند الربط فقط. بعد إدخال URL وAnon Key وتفعيل Cloud ستظهر الحالة في أعلى مركز النسخ بوضوح.</p>
    <div class="backup-breakdown">
      <span><b>وضع البيانات</b><em>${safeText(report.mode)}</em></span>
      <span><b>Adapter</b><em>${safeText(report.adapter)}</em></span>
      <span><b>Auth</b><em>${safeText(report.auth.mode)}</em></span>
      <span><b>Sync</b><em>${safeText(report.sync.provider)}</em></span>
    </div>
    <div class="settings-grid" style="margin-top:14px">
      <label class="setting-field"><span>Backend Provider</span><select data-action="backend-provider"><option value="local" ${backend.provider==='local'?'selected':''}>Local فقط</option><option value="supabase" ${backend.provider==='supabase'?'selected':''}>Supabase</option></select></label>
      <label class="setting-field"><span>Sync Mode</span><select data-action="backend-sync-mode"><option value="local-first" ${backend.syncMode==='local-first'?'selected':''}>Local First</option><option value="cloud-first" ${backend.syncMode==='cloud-first'?'selected':''}>Cloud First</option></select></label>
      <label class="setting-field wide"><span>Supabase URL</span><input value="${safeText(backend.url || '')}" placeholder="https://xxxx.supabase.co" data-action="backend-url"><small>استخدم رابط المشروع فقط، وليس رابط Dashboard.</small></label>
      <label class="setting-field wide"><span>Supabase Anon / Publishable Key</span><input type="password" value="${safeText(backend.anonKey || '')}" placeholder="eyJ..." data-action="backend-anon-key"></label>
      <label class="setting-field"><span>File Storage</span><select data-action="backend-file-storage"><option value="local-reference" ${backend.fileStorage==='local-reference'?'selected':''}>محلي</option><option value="supabase-storage" ${backend.fileStorage==='supabase-storage'?'selected':''}>Supabase Storage</option></select></label>
      <label class="setting-field"><span>تفعيل Cloud</span><select data-action="backend-enabled"><option value="false" ${!backend.enabled?'selected':''}>غير مفعل</option><option value="true" ${backend.enabled?'selected':''}>مفعل</option></select></label>
    </div>
    <div class="qa-list" style="margin-top:14px">${report.layers.map(layer => `<div class="qa-row ${layer.ok?'pass':'warn'}"><span>${layer.ok?'✅':'⚠️'}</span><div><b>${safeText(layer.name)}</b><p>${safeText(layer.details)}</p></div></div>`).join('')}</div>
    <div class="recommendation" style="margin-top:12px">${safeText(report.nextStep)}</div>
  </article>`;
}

function renderCollectionBreakdown() {
  const collections = [
    ['goals','الأهداف'], ['projects','المشاريع'], ['tasks','المهام'], ['knowledge','المعرفة'], ['decisions','القرارات'], ['reviews','المراجعات'], ['wins','الفوز'], ['campaigns','الحملات'], ['emergencyLogs','الطوارئ'], ['notificationLogs','التنبيهات']
  ];
  return `<article class="card"><h3>محتويات النسخة</h3><div class="backup-breakdown">${collections.map(([key, label]) => `<span><b>${safeText(label)}</b><em>${safeText(collectionCount(key))}</em></span>`).join('')}</div></article>`;
}


function storagePanel() {
  const backend = appState.data.settings.backend || {};
  const status = getFileServiceStatus(appState.data.settings);
  const stats = getKnowledgeFileStats();
  const localMb = formatMb(stats.localBytes);
  const totalMb = formatMb(stats.totalBytes);
  const risk = stats.localBytes > 2_500_000 || stats.localInline.some(x => x.file.kind === 'video');
  return `<article class="card storage-card"><h3>Supabase File Storage</h3>
    <p class="meta">هذا القسم خاص بملفات المعرفة الكبيرة: PDF، صور، وفيديوهات. الهدف أن البيانات تحفظ روابط ومسارات بدل Base64 داخل LocalStorage.</p>
    <div class="backup-breakdown">
      <span><b>وضع الملفات</b><em>${safeText(status.mode)}</em></span>
      <span><b>Bucket</b><em>${safeText(status.bucket)}</em></span>
      <span><b>محلي داخل البيانات</b><em>${safeText(stats.localInline.length)}</em></span>
      <span><b>سحابي</b><em>${safeText(stats.cloud.length)}</em></span>
      <span><b>حجم محلي</b><em>${safeText(localMb)}</em></span>
      <span><b>إجمالي الملفات</b><em>${safeText(totalMb)}</em></span>
    </div>
    ${risk ? `<div class="warning-box" style="margin-top:12px">يوجد ملفات محلية ثقيلة. الأفضل تصدير JSON الآن ثم نقل الملفات إلى Supabase Storage قبل إضافة PDF/فيديوهات أكثر.</div>` : `<div class="recommendation" style="margin-top:12px">حجم الملفات المحلي مقبول حاليًا.</div>`}
    <div class="settings-grid" style="margin-top:14px">
      <label class="setting-field"><span>File Storage</span><select data-action="backend-file-storage"><option value="local-reference" ${backend.fileStorage==='local-reference'?'selected':''}>محلي</option><option value="supabase-storage" ${backend.fileStorage==='supabase-storage'?'selected':''}>Supabase Storage</option></select></label>
      <label class="setting-field"><span>Storage Bucket</span><input value="${safeText(backend.storageBucket || 'mogahed-os-files')}" data-action="backend-storage-bucket" placeholder="mogahed-os-files"></label>
    </div>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" data-action="migrate-knowledge-files">نقل ملفات المعرفة للسحابة</button>
      <button class="btn ghost" data-action="cloud-status">تحديث الحالة</button>
    </div>
    <details class="win-collapsible" style="margin-top:12px"><summary>SQL / Policies المطلوبة لـ Supabase Storage</summary><pre class="code-block" dir="ltr">${safeText(getSupabaseStorageSql(appState.data.settings))}</pre></details>
    <div class="${status.cloudReady ? 'recommendation' : 'warning-box'}" style="margin-top:12px">${safeText(status.message)}</div>
  </article>`;
}

export function backupPanel() {
  const report = backupHealthReport();
  const stats = getKnowledgeFileStats();
  return `<section class="backup-pro backup-control-center">
    ${pageHeader('النسخ الاحتياطي', 'مركز واضح: نسخة JSON أولًا، ثم Google Drive، ثم Supabase Database، ثم File Storage للملفات الكبيرة.', '<button class="btn primary" data-action="export-json">تصدير سريع</button>')}
    ${backupStatusHero()}
    ${renderBackupStats()}
    <article class="card backup-rule-card">
      <h3>قاعدة الأمان في المشروع</h3>
      <p class="meta">لا تعتمد على مكان واحد فقط. قبل أي تطوير أو تجربة: صدّر JSON. لو ستستخدم السحابة: ارفع البيانات أولًا، وبعدها انقل الملفات الكبيرة للسحابة.</p>
      <div class="backup-flow"><span>1 JSON</span><span>2 Cloud DB</span><span>3 File Storage</span><span>4 QA</span></div>
    </article>
    ${stats.localInline.length ? `<article class="card backup-file-warning"><h3>تنبيه ملفات المعرفة</h3><p>عندك ${safeText(stats.localInline.length)} ملف محفوظ محليًا داخل البيانات بحجم تقريبي ${safeText(formatMb(stats.localBytes))}. الملفات الكبيرة ممكن تسبب فشل الحفظ، لذلك قسم File Storage موجود لنقلها عند تجهيز Supabase.</p></article>` : ''}

    <div class="backup-sections">
      ${backupSection('⚡', 'نسخة JSON سريعة', 'أسرع حماية قبل أي تعديل أو تجربة.', quickJsonPanel(), true)}
      ${backupSection('☁️', 'Google Drive Backup', 'نسخة احتياطية خارج المتصفح على حساب Google Drive.', driveBackupPanel(), false)}
      ${backupSection('🗄️', 'Supabase Database Sync', 'رفع وتحميل ودمج بيانات التطبيق فقط.', cloudSyncPanel(), false)}
      ${backupSection('📎', 'Supabase File Storage', 'نقل PDF والصور والفيديوهات بدل تخزينها داخل LocalStorage.', storagePanel(), false)}
      ${backupSection('⚙️', 'إعدادات Supabase المتقدمة', 'URL، Key، Cloud Mode، وStorage. افتحها فقط عند الربط.', backendReadinessPanel(), false)}
      ${backupSection('🧪', 'فحص وسلامة البيانات', 'مشاكل التخزين، IDs، محتوى النسخة، واختبار النظام.', `<article class="card backup-action-card"><h3>فحص سلامة النسخة</h3>${report.issues.map(issue => `<div class="${report.health.ok && !report.duplicates.length ? 'recommendation' : 'warning-box'}" style="margin-top:10px">${safeText(issue)}</div>`).join('')}<div class="btn-row backup-main-actions" style="margin-top:12px"><button class="btn ghost" data-action="show-qa">تشغيل اختبار النظام</button></div></article>${renderCollectionBreakdown()}`, false)}
      ${backupSection('⚠️', 'منطقة الخطر', 'مسح البيانات المحلية بعد تأكيد واضح فقط.', dangerPanel(), false)}
    </div>
  </section>`;
}

function settingsValue(key, fallback = '') { return safeText(appState.data.settings[key] ?? fallback); }

export function settingsPanel() {
  const s = appState.data.settings;
  return `<article class="card settings-card"><h3>الإعدادات</h3>
    <div class="settings-grid">
      <label class="setting-field"><span>اسم المستخدم</span><input value="${settingsValue('userName','مجاهد')}" data-action="settings-name"></label>
      <label class="setting-field"><span>اسم النظام/المتجر</span><input value="${settingsValue('storeName','Mogahed OS')}" data-action="settings-store-name"></label>
      <label class="setting-field"><span>العملة الافتراضية</span><select data-action="settings-currency"><option value="EGP" ${s.currency==='EGP'?'selected':''}>جنيه مصري EGP</option><option value="USD" ${s.currency==='USD'?'selected':''}>دولار USD</option><option value="SAR" ${s.currency==='SAR'?'selected':''}>ريال SAR</option><option value="AED" ${s.currency==='AED'?'selected':''}>درهم AED</option></select></label>
      <label class="setting-field"><span>هدف مهام اليوم</span><input type="number" min="1" max="50" value="${safeNumber(s.dailyTaskTarget,5)}" data-action="settings-daily-task-target"></label>
      <label class="setting-field"><span>هدف التعلم اليومي بالدقائق</span><input type="number" min="5" max="600" value="${safeNumber(s.learningMinutesTarget,30)}" data-action="settings-learning-minutes-target"></label>
      <label class="setting-field wide"><span>YouTube API Key</span><input type="password" value="${settingsValue('youtubeApiKey')}" placeholder="AIza..." data-action="settings-youtube-key"><small>يُستخدم لجلب بيانات الفيديو والبلاي ليست. لو فاضي، التطبيق يظل يعمل بدون جلب كامل.</small></label>
      <label class="setting-field wide"><span>Google OAuth Client ID للنسخ على Drive</span><input value="${safeText((s.googleDriveBackup || {}).clientId || '')}" placeholder="xxxxx.apps.googleusercontent.com" data-action="drive-client-id"><small>يستخدم للاتصال بجوجل درايف وحفظ نسخة احتياطية سحابية.</small></label>
    </div>
    <div class="setting-toggles">
      <label><input type="checkbox" data-action="settings-quiet-mode" ${s.quietMode?'checked':''}> وضع هادئ يقلل الرسائل والتنبيهات</label>
      <label><input type="checkbox" data-action="settings-compact-mode" ${s.compactMode?'checked':''}> وضع مكثف للموبايل</label>
      <label><input type="checkbox" data-action="settings-seed-data" ${s.enableSeedData?'checked':''}> السماح بالبيانات التجريبية عند البداية الجديدة</label>
    </div>
    <div class="btn-row" style="margin-top:14px"><button class="btn ghost" data-action="show-notifications">إعدادات التنبيهات</button><button class="btn ghost" data-action="show-qa">فتح اختبار النظام</button></div>
    <p class="meta" style="margin-top:10px">يتم الحفظ تلقائيًا بعد أي تغيير.</p>
  </article>`;
}

export function qaPanel() {
  const summary = appState.data.settings.lastSystemTestSummary;
  return `<article class="card"><h3>System Health</h3>
    <p class="meta">اختبار داخلي يفحص الصفحات، الأزرار، التخزين، البيانات، YouTube، المعرفة، الحملات، والـ Dashboard.</p>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="run-system-test">تشغيل اختبار النظام</button><button class="btn ghost" data-action="show-backup">النسخ الاحتياطي</button></div>
    ${summary ? `<div class="recommendation" style="margin-top:12px">آخر اختبار: ${safeText(formatDate(appState.data.settings.lastSystemTestAt))} — ناجح ${summary.passed}/${summary.total}، تحذيرات ${summary.warnings}، فشل ${summary.failed}.</div>` : ''}
    <div id="qaReport" style="margin-top:14px">${renderTestReport(lastQaReport)}</div>
  </article>`;
}

function renderMorePanel(html) { const panel = document.getElementById('morePanel'); if (panel) panel.innerHTML = html; }
export function showBackup() { renderMorePanel(backupPanel()); }
export function showSettings() { renderMorePanel(settingsPanel()); }
export function showQA() { renderMorePanel(qaPanel()); }
export function showNotifications() { renderMorePanel(notificationsPanel()); }
export function showGuide() { renderMorePanel(guidePanel()); }

export function runQA() {
  lastQaReport = runSystemTests();
  const reportNode = document.getElementById('qaReport');
  if (reportNode) reportNode.innerHTML = renderTestReport(lastQaReport);
  const failed = lastQaReport.summary.failed;
  const warnings = lastQaReport.summary.warnings;
  toast(failed ? `اختبار النظام: ${failed} فشل` : warnings ? `اختبار النظام: ${warnings} تحذير` : 'اختبار النظام ناجح');
}

export function doExport() { exportJSON(); toast('تم تصدير النسخة'); }
export function doBackup() { backupWithDate(); toast('تم حفظ نسخة بتاريخ اليوم'); }
export function forceSaveData() { const result = saveData(); toast(result.ok ? 'تم الحفظ الآن' : 'فشل الحفظ', result.ok ? 'info' : 'error'); }
export function doClear() { confirmDialog('سيتم مسح كل البيانات المحلية. صدّر نسخة قبل المسح لو البيانات مهمة.', () => { clearData(); toast('تم مسح البيانات'); location.reload(); }); }
export async function doImport(file) {
  if(!file) return;
  try {
    await importJSON(file);
    toast('تم الاستيراد بنجاح');
    location.reload();
  } catch {
    toast('ملف غير صالح للاستيراد', 'error');
  }
}


function cloudCredentials() {
  return {
    email: document.getElementById('cloudEmail')?.value?.trim() || '',
    password: document.getElementById('cloudPassword')?.value || ''
  };
}

function persistBackendSyncDates(extra = {}) {
  appState.data.settings.backend = { ...(appState.data.settings.backend || {}), ...extra };
  autoSave();
}

export async function cloudSignIn() {
  const { email, password } = cloudCredentials();
  if (!email || !password) return toast('اكتب البريد وكلمة المرور أولًا', 'error');
  try {
    await signInWithEmail(appState.data.settings, email, password);
    await initializeAuthService(appState.data.settings);
    toast('تم تسجيل الدخول إلى Supabase');
    showBackup();
  } catch (error) { toast(error?.message || 'فشل تسجيل الدخول', 'error'); }
}

export async function cloudSignUp() {
  const { email, password } = cloudCredentials();
  if (!email || !password || password.length < 6) return toast('اكتب بريد وكلمة مرور 6 أحرف على الأقل', 'error');
  try {
    await signUpWithEmail(appState.data.settings, email, password);
    await initializeAuthService(appState.data.settings);
    toast('تم إنشاء الحساب. قد تحتاج تأكيد البريد حسب إعدادات Supabase.');
    showBackup();
  } catch (error) { toast(error?.message || 'فشل إنشاء الحساب', 'error'); }
}

export async function cloudSignOut() {
  try {
    await signOutCloud(appState.data.settings);
    toast('تم تسجيل الخروج من Supabase');
    showBackup();
  } catch (error) { toast(error?.message || 'فشل تسجيل الخروج', 'error'); }
}

export async function cloudUpload() {
  saveData();
  const result = await pushDataToCloud(appState.data.settings, appState.data);
  if (!result.ok) return toast(result.error?.message || 'فشل رفع البيانات للسحابة', 'error');
  persistBackendSyncDates({ lastSyncAt: new Date().toISOString(), lastCloudPushAt: new Date().toISOString() });
  toast('تم رفع بياناتك إلى Supabase');
  showBackup();
}

export async function cloudDownload() {
  const result = await pullDataFromCloud(appState.data.settings);
  if (!result.ok) return toast(result.error?.message || 'فشل تحميل السحابة', 'error');
  if (!result.data) return toast('لا توجد نسخة سحابية بعد', 'error');
  confirmDialog('سيتم استبدال البيانات المحلية بالنسخة السحابية. صدّر JSON قبل المتابعة لو محتاج نسخة احتياطية.', () => {
    const data = result.data;
    data.settings.backend = { ...(data.settings.backend || {}), ...(appState.data.settings.backend || {}), lastSyncAt: new Date().toISOString(), lastCloudPullAt: new Date().toISOString() };
    setData(data);
    saveData();
    toast('تم تحميل بيانات السحابة');
    location.reload();
  });
}

export async function cloudMerge() {
  const result = await pullDataFromCloud(appState.data.settings);
  if (!result.ok) return toast(result.error?.message || 'فشل تحميل السحابة للدمج', 'error');
  if (!result.data) return cloudUpload();
  const merged = mergeLocalAndCloud(appState.data, result.data);
  setData(merged);
  saveData();
  const pushed = await pushDataToCloud(appState.data.settings, appState.data);
  if (!pushed.ok) return toast('تم الدمج محليًا لكن فشل رفعه للسحابة', 'error');
  persistBackendSyncDates({ lastSyncAt: new Date().toISOString(), lastCloudPullAt: new Date().toISOString(), lastCloudPushAt: new Date().toISOString() });
  toast('تم دمج المحلي والسحابة');
  location.reload();
}

export function cloudStatus() {
  initializeBackendServices(appState.data.settings);
  toast(getSyncStatus(appState.data.settings).message);
  showBackup();
}


export async function migrateKnowledgeFilesToCloud() {
  const stats = getKnowledgeFileStats();
  if (!stats.localInline.length) return toast('لا توجد ملفات محلية تحتاج نقلًا للسحابة');
  if ((appState.data.settings.backend || {}).fileStorage !== 'supabase-storage') return toast('اختر File Storage = Supabase Storage أولًا', 'error');
  const access = await canUseSupabaseStorage(appState.data.settings);
  if (!access.ok) return toast(access.reason, 'error');
  let moved = 0;
  let failed = 0;
  toast(`جاري نقل ${stats.localInline.length} ملف إلى Supabase Storage...`);
  for (const item of appState.data.knowledge || []) {
    if (!Array.isArray(item.localFiles) || !item.localFiles.length) continue;
    const nextFiles = [];
    for (const file of item.localFiles) {
      if (file.dataUrl && file.storageMode !== 'supabase-storage') {
        try {
          const uploaded = await uploadDataUrlToSupabaseStorage(appState.data.settings, file, { itemId: item.id, folder: 'knowledge' });
          nextFiles.push(uploaded);
          moved += 1;
        } catch (error) {
          console.warn('File migration failed', error);
          nextFiles.push(file);
          failed += 1;
        }
      } else {
        nextFiles.push(file);
      }
    }
    item.localFiles = nextFiles;
    item.updatedAt = new Date().toISOString();
  }
  autoSave();
  toast(failed ? `تم نقل ${moved} ملف وفشل ${failed}` : `تم نقل ${moved} ملف للسحابة` , failed ? 'error' : 'info');
  showBackup();
}

function updateSetting(key, value) { appState.data.settings[key] = value; autoSave(); }
export function updateUserName(value) { updateSetting('userName', value.trim() || 'مجاهد'); }
export function updateYouTubeApiKey(value) { updateSetting('youtubeApiKey', value.trim()); }
export function updateStoreName(value) { updateSetting('storeName', value.trim() || 'Mogahed OS'); }
export function updateCurrency(value) { updateSetting('currency', value || 'EGP'); }
export function updateDailyTaskTarget(value) { updateSetting('dailyTaskTarget', Math.max(1, safeNumber(value, 5))); }
export function updateLearningMinutesTarget(value) { updateSetting('learningMinutesTarget', Math.max(5, safeNumber(value, 30))); }
export function updateQuietMode(checked) { updateSetting('quietMode', Boolean(checked)); }
export function updateCompactMode(checked) { updateSetting('compactMode', Boolean(checked)); document.body.classList.toggle('compact-mode', Boolean(checked)); }
export function updateSeedData(checked) { updateSetting('enableSeedData', Boolean(checked)); }


function updateBackendSetting(key, value) {
  if (key === 'url') value = String(value || '').trim().replace(/\/+$/, '');
  appState.data.settings.backend = { ...(appState.data.settings.backend || {}), [key]: value };
  initializeBackendServices(appState.data.settings);
  autoSave();
}
export function updateBackendProvider(value) { updateBackendSetting('provider', value || 'local'); }
export function updateBackendUrl(value) { updateBackendSetting('url', String(value || '').trim()); }
export function updateBackendAnonKey(value) { updateBackendSetting('anonKey', String(value || '').trim()); }
export function updateBackendSyncMode(value) { updateBackendSetting('syncMode', value || 'local-first'); }
export function updateBackendFileStorage(value) { updateBackendSetting('fileStorage', value || 'local-reference'); }
export function updateBackendStorageBucket(value) { updateBackendSetting('storageBucket', String(value || 'mogahed-os-files').trim() || 'mogahed-os-files'); }
export function updateBackendEnabled(value) { updateBackendSetting('enabled', value === true || value === 'true'); }

export function updateBackendAutoSync(value) { updateBackendSetting('autoSync', value === true || value === 'true'); }
