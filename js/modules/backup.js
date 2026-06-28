import { appState } from '../state.js';
import { checkStorageHealth, clearData, exportJSON, importJSON, backupWithDate } from '../storage.js';
import { confirmDialog, pageHeader, toast } from '../ui.js';
import { formatDate, safeText } from '../utils.js';

export function renderMore() {
  return `<section class="page">${pageHeader('المزيد', 'أدوات متقدمة منظمة في Grid مناسب للموبايل.', '')}
    <div class="more-grid">
      <button class="more-tile" data-route="dashboard"><span>📊</span><b>Dashboard</b><small>لوحة أداء كاملة</small></button>
      <button class="more-tile" data-route="decisions"><span>⚖️</span><b>القرارات</b><small>Decision Journal</small></button>
      <button class="more-tile" data-route="reviews"><span>📝</span><b>المراجعات</b><small>يومية وأسبوعية</small></button>
      <button class="more-tile" data-route="wins"><span>🏆</span><b>لوحة الفوز</b><small>سجل الانتصارات</small></button>
      <button class="more-tile" data-route="campaigns"><span>📣</span><b>تحليل الحملات</b><small>تسعير وربحية</small></button>
      <button class="more-tile" data-action="show-backup"><span>🛡️</span><b>النسخ الاحتياطي</b><small>تصدير واستيراد</small></button>
      <button class="more-tile" data-action="show-settings"><span>⚙️</span><b>الإعدادات</b><small>اسم المستخدم والحفظ</small></button>
    </div>
    <div id="morePanel">${backupPanel()}</div>
  </section>`;
}

export function backupPanel() {
  const health = checkStorageHealth();
  return `<article class="card"><h3>النسخ الاحتياطي</h3><p class="meta">آخر حفظ: ${safeText(formatDate(appState.data.settings.lastSavedAt))}</p><div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="export-json">تصدير JSON</button><label class="btn ghost">استيراد JSON<input class="sr-only" type="file" accept="application/json" data-action="import-json"></label><button class="btn ghost" data-action="backup-date">نسخة بتاريخ اليوم</button><button class="btn danger" data-action="clear-data">مسح كل البيانات</button></div><div class="${health.ok?'recommendation':'warning-box'}" style="margin-top:12px">${safeText(health.message)}</div></article>`;
}

export function settingsPanel() {
  return `<article class="card"><h3>الإعدادات</h3><div class="setting-row"><div><b>اسم المستخدم</b><p class="meta">يظهر في الرئيسية</p></div><input style="max-width:220px" value="${safeText(appState.data.settings.userName||'مجاهد')}" data-action="settings-name"></div><div class="setting-row"><div><b>الحفظ التلقائي</b><p class="meta">مفعل دائمًا في هذه النسخة</p></div><span class="badge success">مفعل</span></div></article>`;
}

export function showBackup() { document.getElementById('morePanel').innerHTML = backupPanel(); }
export function showSettings() { document.getElementById('morePanel').innerHTML = settingsPanel(); }
export function doExport() { exportJSON(); toast('تم تصدير النسخة'); }
export function doBackup() { backupWithDate(); toast('تم حفظ نسخة بتاريخ اليوم'); }
export function doClear() { confirmDialog('سيتم مسح كل البيانات المحلية. صدّر نسخة قبل المسح لو البيانات مهمة.', () => { clearData(); toast('تم مسح البيانات'); location.reload(); }); }
export async function doImport(file) { if(!file) return; try { await importJSON(file); toast('تم الاستيراد بنجاح'); location.reload(); } catch { toast('ملف غير صالح للاستيراد', 'error'); } }
export function updateUserName(value) { appState.data.settings.userName = value.trim() || 'مجاهد'; localStorage.setItem('mogahed_os_data_v1', JSON.stringify(appState.data)); }
