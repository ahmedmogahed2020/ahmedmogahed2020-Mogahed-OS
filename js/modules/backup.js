import { appState } from '../state.js';
import { autoSave, checkStorageHealth, clearData, exportJSON, importJSON, backupWithDate } from '../storage.js';
import { confirmDialog, pageHeader, toast } from '../ui.js';
import { formatDate, safeNumber, safeText } from '../utils.js';
import { renderTestReport, runSystemTests } from './qa.js';

let lastQaReport = null;

export function renderMore() {
  return `<section class="page">${pageHeader('المزيد', 'أدوات متقدمة منظمة في Grid مناسب للموبايل.', '')}
    <div class="more-grid">
      <button class="more-tile" data-route="dashboard"><span>📊</span><b>Dashboard</b><small>لوحة أداء كاملة</small></button>
      <button class="more-tile" data-route="decisions"><span>⚖️</span><b>القرارات</b><small>Decision Journal</small></button>
      <button class="more-tile" data-route="reviews"><span>📝</span><b>المراجعات</b><small>يومية وأسبوعية</small></button>
      <button class="more-tile" data-route="wins"><span>🏆</span><b>لوحة الفوز</b><small>سجل الانتصارات</small></button>
      <button class="more-tile" data-route="campaigns"><span>📣</span><b>تحليل الحملات</b><small>تسعير وربحية</small></button>
      <button class="more-tile" data-action="show-backup"><span>🛡️</span><b>النسخ الاحتياطي</b><small>تصدير واستيراد</small></button>
      <button class="more-tile" data-action="show-settings"><span>⚙️</span><b>الإعدادات</b><small>بيانات النظام</small></button>
      <button class="more-tile" data-action="show-qa"><span>🧪</span><b>System Health</b><small>اختبار النظام</small></button>
    </div>
    <div id="morePanel">${backupPanel()}</div>
  </section>`;
}

export function backupPanel() {
  const health = checkStorageHealth();
  const dataSize = new Blob([JSON.stringify(appState.data)]).size;
  const sizeMb = (dataSize / 1024 / 1024).toFixed(2);
  return `<article class="card"><h3>النسخ الاحتياطي</h3>
    <p class="meta">آخر حفظ: ${safeText(formatDate(appState.data.settings.lastSavedAt))}</p>
    <p class="meta">حجم البيانات الحالي: ${safeText(sizeMb)} MB</p>
    <div class="btn-row" style="margin-top:12px">
      <button class="btn primary" data-action="export-json">تصدير JSON</button>
      <label class="btn ghost">استيراد JSON<input class="sr-only" type="file" accept="application/json" data-action="import-json"></label>
      <button class="btn ghost" data-action="backup-date">نسخة بتاريخ اليوم</button>
      <button class="btn danger" data-action="clear-data">مسح كل البيانات</button>
    </div>
    <div class="${health.ok?'recommendation':'warning-box'}" style="margin-top:12px">${safeText(health.message)}</div>
    <div class="warning-box" style="margin-top:12px">قبل أي تعديل كبير على GitHub، صدّر نسخة JSON واحتفظ بها خارج المتصفح.</div>
  </article>`;
}

function settingsValue(key, fallback = '') {
  return safeText(appState.data.settings[key] ?? fallback);
}

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
    </div>
    <div class="setting-toggles">
      <label><input type="checkbox" data-action="settings-quiet-mode" ${s.quietMode?'checked':''}> وضع هادئ يقلل الرسائل والتنبيهات</label>
      <label><input type="checkbox" data-action="settings-compact-mode" ${s.compactMode?'checked':''}> وضع مكثف للموبايل</label>
      <label><input type="checkbox" data-action="settings-seed-data" ${s.enableSeedData?'checked':''}> السماح بالبيانات التجريبية عند البداية الجديدة</label>
    </div>
    <div class="btn-row" style="margin-top:14px"><button class="btn ghost" data-action="show-qa">فتح اختبار النظام</button></div>
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

function renderMorePanel(html) {
  const panel = document.getElementById('morePanel');
  if (panel) panel.innerHTML = html;
}

export function showBackup() { renderMorePanel(backupPanel()); }
export function showSettings() { renderMorePanel(settingsPanel()); }
export function showQA() { renderMorePanel(qaPanel()); }
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
export function doClear() { confirmDialog('سيتم مسح كل البيانات المحلية. صدّر نسخة قبل المسح لو البيانات مهمة.', () => { clearData(); toast('تم مسح البيانات'); location.reload(); }); }
export async function doImport(file) { if(!file) return; try { await importJSON(file); toast('تم الاستيراد بنجاح'); location.reload(); } catch { toast('ملف غير صالح للاستيراد', 'error'); } }

function updateSetting(key, value) {
  appState.data.settings[key] = value;
  autoSave();
}

export function updateUserName(value) { updateSetting('userName', value.trim() || 'مجاهد'); }
export function updateYouTubeApiKey(value) { updateSetting('youtubeApiKey', value.trim()); }
export function updateStoreName(value) { updateSetting('storeName', value.trim() || 'Mogahed OS'); }
export function updateCurrency(value) { updateSetting('currency', value || 'EGP'); }
export function updateDailyTaskTarget(value) { updateSetting('dailyTaskTarget', Math.max(1, safeNumber(value, 5))); }
export function updateLearningMinutesTarget(value) { updateSetting('learningMinutesTarget', Math.max(5, safeNumber(value, 30))); }
export function updateQuietMode(checked) { updateSetting('quietMode', Boolean(checked)); }
export function updateCompactMode(checked) { updateSetting('compactMode', Boolean(checked)); document.body.classList.toggle('compact-mode', Boolean(checked)); }
export function updateSeedData(checked) { updateSetting('enableSeedData', Boolean(checked)); }
