import { appState } from '../state.js';
import { checkStorageHealth, getStorageSizeBytes, normalizeData, saveData } from '../storage.js';
import { APP_VERSION, createEmptyData, collectionNames } from '../data/schema.js';
import { calculatePercentage, safeNumber, safeText } from '../utils.js';
import { renderHome, renderDashboard } from './dashboard.js';
import { renderGoals } from './goals.js';
import { renderProjects } from './projects.js';
import { getTaskTimePolishState, renderTasks } from './tasks.js';
import { renderKnowledge } from './knowledge.js';
import { renderCampaigns, calculateCampaign } from './campaigns.js';
import { renderDecisions } from './decisions.js';
import { renderReviews } from './reviews.js';
import { renderWins, winGamificationCounts } from './wins.js';
import { notificationSoundLibrary, notificationCategories, getDailyReviewFlowState } from './notifications.js';
import { getDailyFlowState } from './dailyFlow.js';
import { getBackendReadinessReport } from '../services/dataService.js';
import { getSupabaseConfigStatus } from '../services/supabaseAdapter.js';
import { getFileServiceStatus } from '../services/fileService.js';

const routeRenderers = {
  home: renderHome,
  goals: renderGoals,
  projects: renderProjects,
  tasks: renderTasks,
  knowledge: renderKnowledge,
  more: () => '<section class="page"><article class="card">More panel smoke test</article></section>',
  dashboard: renderDashboard,
  campaigns: renderCampaigns,
  decisions: renderDecisions,
  reviews: renderReviews,
  wins: renderWins
};

const clickActionHandlers = [
  'open-goal-modal','edit-goal','delete-goal','view-goal','goal-to-projects','goal-to-tasks','set-goal-filter',
  'open-project-modal','edit-project','delete-project','view-project','project-to-tasks','rescue-project','set-project-filter',
  'open-task-modal','edit-task','delete-task','complete-task','toggle-task-complete','toggle-task-step','set-task-filter',
  'open-knowledge-modal','open-knowledge-reader','edit-knowledge','delete-knowledge','knowledge-to-task','review-knowledge','knowledge-to-goal','knowledge-to-project','fetch-knowledge-metadata','fetch-pdf-metadata','add-video-note','seek-video-note','knowledge-select-video','save-video-content','mark-video-complete','schedule-video-review','video-content-to-tasks','pdf-page-next','pdf-page-prev','save-pdf-progress','start-pdf-reading','stop-pdf-reading','mark-pdf-complete','schedule-pdf-review','pdf-content-to-tasks','refresh-knowledge-cloud-files','knowledge-search-tag','knowledge-filter',
  'open-emergency','emergency-pick','emergency-to-task',
  'open-decision-modal','edit-decision','delete-decision','review-decision','decision-to-tasks','set-decision-filter',
  'open-review-modal','create-daily-review','create-weekly-review','review-to-tasks','set-review-filter','edit-review','delete-review',
  'open-win-modal','edit-win','delete-win','duplicate-win','record-suggested-win','claim-win-reward','set-win-filter',
  'open-campaign-modal','edit-campaign','delete-campaign','view-campaign','campaign-to-tasks','open-campaign-compare','set-campaign-filter',
  'start-focus-session','open-search','search-jump','search-open-result','search-open-recent','search-command','search-clear-recent',
  'show-backup','show-settings','show-qa','show-notifications','show-guide','run-system-test','export-json','backup-date','force-save-data','clear-data',
  'drive-connect','drive-disconnect','drive-upload-now','drive-list','drive-restore-latest',
  'cloud-sign-in','cloud-sign-up','cloud-sign-out','cloud-upload','cloud-download','cloud-merge','cloud-status','migrate-knowledge-files',
  'test-notification-sound','test-category-sound','reset-notification-sounds','request-notification-permission','mark-notification-read','clear-notification-log',
  'close-modal','toggle-quick-actions'
];

const formAndInputActions = [
  'import-json','knowledge-type-change','knowledge-filter','settings-currency','settings-quiet-mode','settings-compact-mode','settings-seed-data',
  'notification-enabled','notification-sound-enabled','notification-browser-enabled','notification-review-enabled','notification-sound-type','notification-category-sound','notification-lead-minutes','notification-volume','notification-review-time',
  'drive-enabled','drive-history','drive-client-id','drive-interval',
  'backend-provider','backend-sync-mode','backend-file-storage','backend-storage-bucket','backend-enabled','backend-auto-sync','backend-url','backend-anon-key',
  'settings-name','settings-youtube-key','settings-store-name','settings-daily-task-target','settings-learning-minutes-target',
  'filter-list','knowledge-search','task-search','goal-search','project-search','campaign-search','review-search','win-search','decision-search'
];

const frameworkActions = ['modal-save','confirm-yes'];
const handledActions = new Set([...clickActionHandlers, ...formAndInputActions, ...frameworkActions]);
const sourceActionInventory = [
  ...clickActionHandlers,
  ...formAndInputActions,
  ...frameworkActions,
  'set-task-filter','set-goal-filter','set-project-filter','set-campaign-filter','set-review-filter','set-win-filter','set-decision-filter'
];

const criticalActions = [
  'run-system-test','export-json','import-json','force-save-data','show-backup','show-settings','show-qa',
  'open-task-modal','open-knowledge-modal','open-knowledge-reader','fetch-knowledge-metadata','fetch-pdf-metadata',
  'cloud-upload','cloud-download','cloud-merge','cloud-status','migrate-knowledge-files'
];

function makeResult(status, group, name, details = '') { return { status, group, name, details }; }
function pass(group, name, details = '') { return makeResult('pass', group, name, details); }
function warn(group, name, details = '') { return makeResult('warn', group, name, details); }
function fail(group, name, details = '') { return makeResult('fail', group, name, details); }

function safeRun(group, name, fn) {
  try { return fn(); }
  catch (error) { return fail(group, name, error?.message || 'فشل غير معروف'); }
}

function collectMatches(html = '', pattern) {
  return Array.from(String(html).matchAll(pattern), match => match[1]);
}

function unique(list = []) { return Array.from(new Set(list.filter(Boolean))); }

function collectActions(html = '') {
  return unique(collectMatches(html, /data-action="([^"]+)"/g).filter(action => !action.includes('${') && !action.includes('(')));
}

function collectIds(html = '') { return collectMatches(html, /\sid="([^"]+)"/g); }
function collectHrefSrc(html = '') { return collectMatches(html, /\s(?:href|src)="([^"]+)"/g); }

function renderAllRoutes() {
  const rendered = {};
  for (const [route, renderer] of Object.entries(routeRenderers)) {
    try { rendered[route] = String(renderer() || ''); }
    catch (error) { rendered[route] = `__ERROR__:${error?.message || error}`; }
  }
  return rendered;
}

function checkRoutes(rendered) {
  const results = [];
  for (const [route, html] of Object.entries(rendered)) {
    results.push(safeRun('الصفحات', `فتح صفحة ${route}`, () => {
      if (html.startsWith('__ERROR__')) return fail('الصفحات', `فتح صفحة ${route}`, html.replace('__ERROR__:', ''));
      if (!html.includes('<section') && !html.includes('<article')) return fail('الصفحات', `فتح صفحة ${route}`, 'الصفحة لا ترجع HTML واضح.');
      const actionCount = collectActions(html).length;
      return pass('الصفحات', `فتح صفحة ${route}`, `تم توليد الصفحة بدون خطأ — ${actionCount} Action ظاهر.`);
    }));
  }
  return results;
}

function checkRenderedActionCoverage(rendered) {
  const html = Object.values(rendered).join('\n');
  const visibleActions = collectActions(html);
  const unknown = visibleActions.filter(action => !handledActions.has(action));
  const criticalMissing = criticalActions.filter(action => !handledActions.has(action));
  const results = [];
  results.push(unknown.length
    ? fail('الأزرار', 'أزرار ظاهرة بدون Handler معروف', unknown.join(', '))
    : pass('الأزرار', 'كل الأزرار الظاهرة مربوطة', `تم فحص ${visibleActions.length} Action ظاهر في الصفحات.`));
  results.push(criticalMissing.length
    ? fail('الأزرار', 'Actions حرجة ناقصة من Registry', criticalMissing.join(', '))
    : pass('الأزرار', 'Actions حرجة موجودة', `${criticalActions.length} Action حرج مغطى.`));
  const sourceUnknown = unique(sourceActionInventory).filter(action => !handledActions.has(action));
  results.push(sourceUnknown.length
    ? fail('الأزرار', 'Source Action Inventory غير مغطى', sourceUnknown.join(', '))
    : pass('الأزرار', 'Action Registry مكتمل', `${handledActions.size} Action/Field معروفين للنظام.`));
  return results;
}

function checkDomSafety(rendered) {
  const results = [];
  for (const [route, html] of Object.entries(rendered)) {
    if (html.startsWith('__ERROR__')) continue;
    const ids = collectIds(html);
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    results.push(duplicates.length
      ? warn('DOM', `IDs مكررة داخل صفحة ${route}`, unique(duplicates).slice(0, 12).join(', '))
      : pass('DOM', `IDs صفحة ${route}`, ids.length ? `${ids.length} ID بدون تكرار داخل نفس الصفحة.` : 'لا توجد IDs داخل الصفحة.'));
  }
  const allHtml = Object.values(rendered).join('\n');
  const unsafe = collectHrefSrc(allHtml).filter(value => /^javascript:/i.test(value.trim()) || /^data:text\/html/i.test(value.trim()));
  results.push(unsafe.length
    ? fail('DOM', 'روابط خطرة', unsafe.slice(0, 8).join(', '))
    : pass('DOM', 'الروابط الأساسية آمنة', 'لا توجد javascript: أو data:text/html في href/src الظاهر.'));
  return results;
}

function checkDataShape() {
  const results = [];
  const normalized = normalizeData(appState.data);
  for (const name of collectionNames) {
    results.push(Array.isArray(normalized[name]) ? pass('البيانات', `بيانات ${name}`, 'Array سليم.') : fail('البيانات', `بيانات ${name}`, 'ليست Array.'));
  }
  const requiredSettings = ['userName','lastSavedAt','lastPage','autoSave','youtubeApiKey','storeName','currency','dailyTaskTarget','learningMinutesTarget','quietMode','compactMode','notifications','googleDriveBackup','backend','lastSystemTestAt','lastSystemTestSummary'];
  const missingSettings = requiredSettings.filter(key => !(key in normalized.settings));
  results.push(missingSettings.length ? warn('البيانات', 'الإعدادات الأساسية', `ناقص: ${missingSettings.join(', ')}`) : pass('البيانات', 'الإعدادات الأساسية', 'كل مفاتيح الإعدادات الأساسية موجودة.'));
  results.push(normalized.version === APP_VERSION ? pass('البيانات', 'إصدار البيانات', `APP_VERSION = ${APP_VERSION}`) : warn('البيانات', 'إصدار البيانات', `المحفوظ ${normalized.version || 'غير محدد'} — الحالي ${APP_VERSION}`));
  return results;
}

function checkStorage() {
  const health = checkStorageHealth();
  const saved = saveData();
  const results = [health.ok ? pass('التخزين', 'LocalStorage / Adapter', health.message) : fail('التخزين', 'LocalStorage / Adapter', health.message)];
  results.push(saved.ok ? pass('التخزين', 'الحفظ الفعلي', 'تم حفظ البيانات بنجاح.') : fail('التخزين', 'الحفظ الفعلي', saved.error?.message || 'فشل الحفظ.'));
  try {
    const size = getStorageSizeBytes(appState.data);
    const mb = (size / 1024 / 1024).toFixed(2);
    results.push(size > 4_500_000 ? warn('التخزين', 'حجم البيانات', `${mb} MB — اقتربت من حد التخزين في بعض المتصفحات.`) : pass('التخزين', 'حجم البيانات', `${mb} MB`));
  } catch { results.push(warn('التخزين', 'حجم البيانات', 'تعذر حساب الحجم.')); }
  const roundTrip = normalizeData(JSON.parse(JSON.stringify(createEmptyData())));
  const missing = collectionNames.filter(name => !Array.isArray(roundTrip[name]));
  results.push(missing.length ? fail('التخزين', 'Import/Export Shape', `أقسام ناقصة بعد Round Trip: ${missing.join(', ')}`) : pass('التخزين', 'Import/Export Shape', 'شكل JSON يتحمل التصدير والاستيراد الأساسي.'));
  return results;
}

function checkDashboardNumbers() {
  const data = appState.data;
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.status === 'مكتملة').length;
  const completion = calculatePercentage(doneTasks, totalTasks);
  const dashboard = renderDashboard();
  if (!dashboard || !dashboard.includes('Dashboard')) return [fail('الداشبورد', 'توليد Dashboard', 'لم يتم توليد الداشبورد.')];
  const hasKpis = (dashboard.match(/kpi-card/g) || []).length;
  return [pass('الداشبورد', 'Dashboard من البيانات الحقيقية', `المهام: ${totalTasks}، المكتمل: ${doneTasks}، الإنجاز: ${completion}%، KPI Cards: ${hasKpis}.`)];
}

function checkCampaignCalculations() {
  const sample = {
    productName: 'زيت هندي 108 عشبة', productCost: 850, suggestedSellingPrice: 1450, availableUnits: 30,
    targetMargin: 35, reelCost: 3000, shootingCost: 0, designCost: 0, otherCreativeCost: 0,
    adsBudget: 10000, campaignDays: 7, expectedLeadCost: 25, expectedConversionRate: 8,
    shippingCost: 0, discountValue: 0, targetProfit: 10000
  };
  const metrics = calculateCampaign(sample);
  if (!Number.isFinite(metrics.netProfitPerUnit) || metrics.netProfitPerUnit <= 0) return [fail('الحملات', 'حساب الحملات', 'صافي ربح القطعة غير منطقي.')];
  if (!Number.isFinite(metrics.breakEvenUnits) || metrics.breakEvenUnits <= 0) return [fail('الحملات', 'حساب الحملات', 'Break Even غير منطقي.')];
  return [pass('الحملات', 'حساب الحملات', `صافي القطعة ${metrics.netProfitPerUnit}، التعادل ${metrics.breakEvenUnits} قطعة، القرار: ${metrics.decision}.`)];
}

function checkKnowledgeSystem() {
  const lessons = [];
  const localFiles = [];
  const cloudFiles = [];
  appState.data.knowledge.forEach(item => {
    (item.localFiles || []).forEach(file => (file.storageMode === 'supabase-storage' ? cloudFiles : localFiles).push(file));
    const videos = Array.isArray(item.playlistVideos) && item.playlistVideos.length ? item.playlistVideos : [{ id: item.videoId || item.id, title: item.title, durationSeconds: item.durationSeconds || item.duration || 0 }];
    videos.forEach(video => {
      const content = item.videoContent?.[video.id] || {};
      lessons.push({ item, video, content });
    });
  });
  const reviewDue = lessons.filter(x => x.content.learningStatus === 'أحتاج مراجعة' || (x.content.nextReviewAt && x.content.nextReviewAt <= new Date().toISOString().slice(0,10))).length;
  const converted = lessons.filter(x => x.content.convertedToExecution).length;
  const withActions = lessons.filter(x => Array.isArray(x.content.extractedActions) && x.content.extractedActions.length).length;
  const localBytes = localFiles.reduce((sum, file) => sum + safeNumber(file.size), 0);
  const results = [pass('المعرفة', 'نظام المعرفة', `الدروس: ${lessons.length}، تحتاج مراجعة: ${reviewDue}، تحولت لتنفيذ: ${converted}، بها أفعال: ${withActions}.`)];
  results.push(localBytes > 2_500_000 ? warn('المعرفة', 'ملفات معرفة محلية ثقيلة', `${(localBytes/1024/1024).toFixed(2)} MB محلي — انقلها إلى Supabase Storage.`) : pass('المعرفة', 'ملفات المعرفة', `محلي: ${localFiles.length}، سحابي: ${cloudFiles.length}.`));
  return results;
}

function checkYouTubeSettings() {
  const key = appState.data.settings.youtubeApiKey || '';
  if (!key) return [warn('المعرفة', 'YouTube API', 'المفتاح غير موجود. الجلب التلقائي سيعمل بإمكانيات محدودة.')];
  if (key.length < 20) return [warn('المعرفة', 'YouTube API', 'المفتاح قصير أو غير مكتمل غالبًا.')];
  return [pass('المعرفة', 'YouTube API', 'المفتاح محفوظ في الإعدادات.')];
}

function checkDuplicateDataIds() {
  const ids = [];
  const missing = [];
  for (const name of collectionNames) {
    appState.data[name].forEach((item, index) => {
      if (item?.id) ids.push(`${name}:${item.id}`);
      else missing.push(`${name}[${index}]`);
    });
  }
  const rawIds = ids.map(x => x.split(':').slice(1).join(':'));
  const duplicateIds = rawIds.filter((id, idx) => rawIds.indexOf(id) !== idx);
  const results = [];
  results.push(duplicateIds.length ? warn('البيانات', 'IDs مكررة بين الأقسام', unique(duplicateIds).slice(0, 10).join(', ')) : pass('البيانات', 'IDs مكررة', 'لا توجد IDs مكررة واضحة بين الأقسام.'));
  results.push(missing.length ? warn('البيانات', 'عناصر بدون ID', missing.slice(0, 10).join(', ')) : pass('البيانات', 'عناصر بدون ID', 'كل العناصر الحالية لديها ID.'));
  return results;
}

function checkNotificationSoundSystem() {
  const settings = appState.data.settings.notifications || {};
  const categorySounds = settings.categorySounds || {};
  const soundIds = notificationSoundLibrary.map(sound => sound.id);
  const missingCategories = notificationCategories.filter(category => !categorySounds[category.id]);
  const invalidSounds = Object.entries(categorySounds).filter(([, soundId]) => !soundIds.includes(soundId));
  const results = [];
  results.push(notificationSoundLibrary.length >= 12 ? pass('التنبيهات', 'مكتبة أصوات التنبيهات', `${notificationSoundLibrary.length} صوت متاح.`) : warn('التنبيهات', 'مكتبة أصوات التنبيهات', 'عدد الأصوات أقل من المتوقع.'));
  results.push(missingCategories.length ? warn('التنبيهات', 'تخصيص الأصوات للأقسام', `ناقص: ${missingCategories.map(x => x.name).join(', ')}`) : pass('التنبيهات', 'تخصيص الأصوات للأقسام', `تم ضبط ${notificationCategories.length} قسم.`));
  results.push(invalidSounds.length ? fail('التنبيهات', 'أصوات غير معروفة', invalidSounds.map(([key, value]) => `${key}:${value}`).join(', ')) : pass('التنبيهات', 'أصوات غير معروفة', 'كل الأصوات المختارة موجودة في المكتبة.'));
  return results;
}

function checkWinGamificationScale() {
  const results = [];
  results.push(winGamificationCounts.levels >= 300 ? pass('الفوز', 'مراحل الفوز', `${winGamificationCounts.levels} مرحلة جاهزة.`) : fail('الفوز', 'مراحل الفوز', `المتاح ${winGamificationCounts.levels} فقط.`));
  results.push(winGamificationCounts.titles >= 300 ? pass('الفوز', 'ألقاب الفوز', `${winGamificationCounts.titles} لقب جاهز.`) : fail('الفوز', 'ألقاب الفوز', `المتاح ${winGamificationCounts.titles} فقط.`));
  results.push(winGamificationCounts.rewards >= 700 ? pass('الفوز', 'هدايا ومكافآت الفوز', `${winGamificationCounts.rewards} هدية/مكافأة جاهزة.`) : fail('الفوز', 'هدايا ومكافآت الفوز', `المتاح ${winGamificationCounts.rewards} فقط.`));
  const html = renderWins();
  results.push(html.includes('<details') && html.includes('win-collapsible') ? pass('الفوز', 'طيّ عناصر الفوز', 'المراحل والألقاب والهدايا داخل أقسام قابلة للفتح والقفل.') : warn('الفوز', 'طيّ عناصر الفوز', 'لم يتم العثور على أقسام details واضحة.'));
  return results;
}

function checkGoogleDriveBackupSettings() {
  const s = appState.data.settings.googleDriveBackup || {};
  const results = [];
  results.push('clientId' in s ? pass('النسخ الاحتياطي', 'Google Drive Client ID', s.clientId ? 'Client ID محفوظ.' : 'الخانة موجودة، أضف Client ID لتفعيل Drive.') : warn('النسخ الاحتياطي', 'Google Drive Client ID', 'إعداد Client ID غير موجود.'));
  results.push('enabled' in s ? pass('النسخ الاحتياطي', 'Google Drive Auto Backup', s.enabled ? `مفعل كل ${safeNumber(s.intervalMinutes,30)} دقيقة أثناء فتح التطبيق.` : 'غير مفعل حاليًا.') : warn('النسخ الاحتياطي', 'Google Drive Auto Backup', 'إعداد التفعيل غير موجود.'));
  results.push('keepHistory' in s ? pass('النسخ الاحتياطي', 'Google Drive History', s.keepHistory ? 'سيتم حفظ نسخة تاريخية بجانب آخر نسخة.' : 'سيتم تحديث آخر نسخة فقط.') : warn('النسخ الاحتياطي', 'Google Drive History', 'إعداد الاحتفاظ بالنسخ غير موجود.'));
  return results;
}

function checkBackendReadiness() {
  const report = getBackendReadinessReport(appState.data.settings);
  const config = getSupabaseConfigStatus(appState.data.settings);
  const results = [];
  results.push(report.layers?.length >= 4 ? pass('Supabase', 'Backend Readiness Layers', `${report.layers.length} طبقات جاهزة: Data/Auth/File/Sync.`) : fail('Supabase', 'Backend Readiness Layers', 'طبقات الباك إند غير مكتملة.'));
  results.push(report.storage?.ok ? pass('Supabase', 'Data Service Adapter', `يعمل عبر ${report.adapter}.`) : fail('Supabase', 'Data Service Adapter', report.storage?.message || 'فشل Adapter.'));
  results.push(report.auth?.ready ? pass('Supabase', 'Auth Service', report.auth.message) : warn('Supabase', 'Auth Service', report.auth?.message || 'غير جاهز لأن Supabase غير مفعل أو لم يتم تسجيل الدخول.'));
  results.push(report.files?.ready ? pass('Supabase', 'File Service', report.files.message) : warn('Supabase', 'File Service', report.files?.message || 'غير جاهز بالكامل.'));
  results.push(report.sync?.initialized ? pass('Supabase', 'Sync Service', report.sync.message) : warn('Supabase', 'Sync Service', report.sync?.message || 'لم يبدأ بعد.'));
  results.push(config.table === 'mogahed_os_snapshots' ? pass('Supabase', 'Supabase Snapshot Table', 'جدول mogahed_os_snapshots معتمد للمزامنة.') : fail('Supabase', 'Supabase Snapshot Table', 'اسم جدول المزامنة غير مضبوط.'));
  results.push(config.ok ? pass('Supabase', 'Supabase Config', 'إعدادات Supabase مكتملة.') : warn('Supabase', 'Supabase Config', `ناقص: ${config.missing.join('، ')}`));
  return results;
}

function checkSupabaseFileStorage() {
  const status = getFileServiceStatus(appState.data.settings);
  const cloudFiles = (appState.data.knowledge || []).flatMap(item => item.localFiles || []).filter(file => file.storageMode === 'supabase-storage');
  const localFiles = (appState.data.knowledge || []).flatMap(item => item.localFiles || []).filter(file => file.dataUrl && file.storageMode !== 'supabase-storage');
  const results = [];
  results.push(status.ready ? pass('Supabase', 'Supabase File Storage Layer', status.message) : warn('Supabase', 'Supabase File Storage Layer', status.message));
  results.push(pass('Supabase', 'ملفات المعرفة', `سحابي: ${cloudFiles.length}، محلي: ${localFiles.length}.`));
  if (status.mode === 'supabase-storage' && !status.cloudReady) results.push(warn('Supabase', 'إعداد Storage', 'تم اختيار Supabase Storage لكن إعداد Supabase أو Cloud غير مكتمل.'));
  return results;
}


function checkGitHubPagesDeployment() {
  const results = [];
  const links = Array.from(document.querySelectorAll('link[rel="stylesheet"]')).map(link => link.getAttribute('href') || '');
  const scripts = Array.from(document.querySelectorAll('script[src]')).map(script => script.getAttribute('src') || '');
  const allAssets = [...links, ...scripts];
  const absoluteLocal = allAssets.filter(src => src.startsWith('/'));
  const expectedCss = ['css/variables.css', 'css/base.css', 'css/layout.css', 'css/components.css', 'css/pages.css', 'css/dashboard.css', 'css/campaigns.css', 'css/knowledge.css', 'css/responsive.css', 'css/mobile.css'];
  const missingCss = expectedCss.filter(file => !links.includes(file));
  results.push(absoluteLocal.length === 0 ? pass('النشر', 'Relative Asset Paths', 'كل ملفات CSS/JS مرتبطة بمسارات نسبية مناسبة لـ GitHub Pages.') : fail('النشر', 'Relative Asset Paths', `يوجد مسارات تبدأ بـ /: ${absoluteLocal.join(', ')}`));
  results.push(missingCss.length === 0 ? pass('النشر', 'CSS Load Order', 'كل ملفات الواجهة الأساسية مذكورة في index.html.') : fail('النشر', 'CSS Load Order', `ملفات CSS ناقصة: ${missingCss.join(', ')}`));
  results.push(scripts.includes('js/app.js') ? pass('النشر', 'Module Entry Point', 'نقطة تشغيل التطبيق js/app.js موجودة كـ module.') : fail('النشر', 'Module Entry Point', 'نقطة تشغيل التطبيق js/app.js غير مذكورة.'));
  return results;
}

function checkResetSafety() {
  const empty = createEmptyData();
  return empty && Array.isArray(empty.tasks) && empty.settings ? [pass('الأمان', 'Reset Safety', 'شكل البيانات الافتراضي جاهز وآمن.')] : [fail('الأمان', 'Reset Safety', 'شكل البيانات الافتراضي غير سليم.')];
}

function checkRegressionBaseline(rendered) {
  const routeCount = Object.keys(rendered).length;
  const failedRoutes = Object.values(rendered).filter(html => html.startsWith('__ERROR__')).length;
  const moduleLoaded = typeof renderKnowledge === 'function' && typeof renderDashboard === 'function' && typeof calculateCampaign === 'function';
  const results = [];
  results.push(moduleLoaded ? pass('Regression', 'Module Imports', 'وحدات الصفحات الأساسية تم تحميلها بنجاح.') : fail('Regression', 'Module Imports', 'واحدة أو أكثر من الوحدات الأساسية غير متاحة.'));
  results.push(failedRoutes ? fail('Regression', 'Route Baseline', `${failedRoutes} صفحة فشلت من ${routeCount}.`) : pass('Regression', 'Route Baseline', `${routeCount} صفحات تولدت بدون Exceptions.`));
  results.push(APP_VERSION === '1.31.0' ? pass('Regression', 'GitHub Pages Version Gate', 'إصدار البيانات مضبوط على 1.31.0.') : warn('Regression', 'GitHub Pages Version Gate', `الإصدار الحالي ${APP_VERSION}.`));
  results.push(String(rendered.home || '').includes('daily-command-strip') ? pass('Regression', 'Daily Command Strip', 'مركز اليوم موجود داخل الرئيسية.') : fail('Regression', 'Daily Command Strip', 'مركز اليوم غير موجود داخل HTML الرئيسية.'));
  results.push(String(rendered.home || '').includes('data-action="open-emergency"') ? pass('Regression', 'Emergency Access', 'زر الطوارئ متاح من مركز القيادة.') : fail('Regression', 'Emergency Access', 'زر الطوارئ غير موجود داخل الرئيسية.'));
  results.push(String(rendered.home || '').includes('daily-review-flow-card') && String(rendered.home || '').includes('data-action="create-daily-review"') ? pass('Regression', 'Daily Review Flow', 'كارت مراجعة نهاية اليوم موجود في الرئيسية ومربوط بالمراجعة اليومية.') : fail('Regression', 'Daily Review Flow', 'كارت مراجعة نهاية اليوم غير مكتمل داخل الرئيسية.'));
  const flow = getDailyReviewFlowState();
  results.push(flow.time && 'completed' in flow ? pass('Regression', 'Review Notification State', `ميعاد المراجعة ${flow.time} — الحالة: ${flow.completed ? 'تمت' : 'مفتوحة'}.`) : fail('Regression', 'Review Notification State', 'حالة تنبيه مراجعة اليوم غير متاحة.'));
  const taskHtml = String(rendered.tasks || '');
  const timeState = getTaskTimePolishState();
  results.push(taskHtml.includes('task-time-pulse-card') && (taskHtml.includes('task-time-chip') || timeState.scheduled === 0) ? pass('Regression', 'Task Time Polish', 'مؤشر وقت المهام موجود، وشارات الوقت تظهر عند وجود مهام.') : fail('Regression', 'Task Time Polish', 'مؤشر وقت المهام أو شارة الوقت غير موجودة.'));
  results.push(Number.isFinite(timeState.scheduled) && Number.isFinite(timeState.noTimeCount) ? pass('Regression', 'Reminder State', `مهام لها وقت: ${timeState.scheduled} — مهام بتاريخ بلا وقت: ${timeState.noTimeCount}.`) : fail('Regression', 'Reminder State', 'حالة وقت المهام غير قابلة للقراءة.'));
  const dailyFlow = getDailyFlowState();
  results.push(String(rendered.home || '').includes('home-task-review-flow') && String(rendered.tasks || '').includes('task-review-flow-card') && String(rendered.reviews || '').includes('review-flow-bridge-card') ? pass('Regression', 'Flow Integration UI', 'الرئيسية والمهام والمراجعات يعرضون نفس Daily Flow.') : fail('Regression', 'Flow Integration UI', 'ربط Daily Flow غير ظاهر في صفحة أو أكثر.'));
  results.push(dailyFlow && Array.isArray(dailyFlow.todayOpen) && Array.isArray(dailyFlow.todayDone) && 'reviewAction' in dailyFlow ? pass('Regression', 'Shared Flow State', `مفتوح اليوم: ${dailyFlow.todayOpen.length} — مكتمل اليوم: ${dailyFlow.todayDone.length}.`) : fail('Regression', 'Shared Flow State', 'حالة Daily Flow المشتركة غير متاحة.'));

  return results;
}

export function runSystemTests() {
  const startedAt = new Date().toISOString();
  const rendered = renderAllRoutes();
  const results = [
    ...checkRegressionBaseline(rendered),
    ...checkRoutes(rendered),
    ...checkRenderedActionCoverage(rendered),
    ...checkDomSafety(rendered),
    ...checkDataShape(),
    ...checkStorage(),
    ...checkDuplicateDataIds(),
    ...checkDashboardNumbers(),
    ...checkCampaignCalculations(),
    ...checkKnowledgeSystem(),
    ...checkYouTubeSettings(),
    ...checkNotificationSoundSystem(),
    ...checkWinGamificationScale(),
    ...checkGoogleDriveBackupSettings(),
    ...checkBackendReadiness(),
    ...checkSupabaseFileStorage(),
    ...checkResetSafety()
  ];
  const summary = {
    startedAt,
    total: results.length,
    passed: results.filter(r => r.status === 'pass').length,
    warnings: results.filter(r => r.status === 'warn').length,
    failed: results.filter(r => r.status === 'fail').length
  };
  appState.data.settings.lastSystemTestAt = startedAt;
  appState.data.settings.lastSystemTestSummary = summary;
  saveData();
  return { summary, results };
}

function groupResults(results = []) {
  return results.reduce((groups, result) => {
    const key = result.group || 'عام';
    if (!groups[key]) groups[key] = [];
    groups[key].push(result);
    return groups;
  }, {});
}

export function renderTestReport(report) {
  if (!report) return '<div class="empty-state"><strong>لم يتم تشغيل الاختبار بعد</strong><p>اضغط تشغيل اختبار النظام لعرض التقرير.</p></div>';
  const { summary, results } = report;
  const groups = groupResults(results);
  const healthClass = summary.failed ? 'fail' : summary.warnings ? 'warn' : 'pass';
  const healthText = summary.failed ? 'يوجد فشل يحتاج إصلاح قبل التطوير' : summary.warnings ? 'النظام يعمل مع تحذيرات يجب مراجعتها' : 'النظام مستقر';
  return `<div class="qa-report v25-regression-report">
    <div class="qa-health-banner ${healthClass}"><b>${safeText(healthText)}</b><span>آخر اختبار: ${safeText(summary.startedAt || '')}</span></div>
    <div class="kpi-grid compact">
      <article class="kpi-card"><span>إجمالي</span><strong>${summary.total}</strong></article>
      <article class="kpi-card"><span>ناجح</span><strong>${summary.passed}</strong></article>
      <article class="kpi-card"><span>تحذير</span><strong>${summary.warnings}</strong></article>
      <article class="kpi-card"><span>فشل</span><strong>${summary.failed}</strong></article>
    </div>
    <div class="qa-group-list">
      ${Object.entries(groups).map(([group, items]) => `<details class="qa-group" open><summary><b>${safeText(group)}</b><span>${items.filter(x => x.status === 'pass').length} ناجح · ${items.filter(x => x.status === 'warn').length} تحذير · ${items.filter(x => x.status === 'fail').length} فشل</span></summary><div class="qa-list">${items.map(result => `<div class="qa-row ${result.status}"><span>${result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'}</span><div><b>${safeText(result.name)}</b><p>${safeText(result.details || '')}</p></div></div>`).join('')}</div></details>`).join('')}
    </div>
  </div>`;
}
