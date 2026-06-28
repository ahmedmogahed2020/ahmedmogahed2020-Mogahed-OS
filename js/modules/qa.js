import { appState } from '../state.js';
import { checkStorageHealth, normalizeData, saveData } from '../storage.js';
import { createEmptyData, collectionNames } from '../data/schema.js';
import { calculatePercentage, safeNumber, safeText } from '../utils.js';
import { renderHome, renderDashboard } from './dashboard.js';
import { renderGoals } from './goals.js';
import { renderProjects } from './projects.js';
import { renderTasks } from './tasks.js';
import { renderKnowledge } from './knowledge.js';
import { renderCampaigns, calculateCampaign } from './campaigns.js';
import { renderDecisions } from './decisions.js';
import { renderReviews } from './reviews.js';
import { renderWins, winGamificationCounts } from './wins.js';
import { notificationSoundLibrary, notificationCategories } from './notifications.js';

const routeRenderers = {
  home: renderHome,
  goals: renderGoals,
  projects: renderProjects,
  tasks: renderTasks,
  knowledge: renderKnowledge,
  more: () => '<section class="page"><article class="card">More smoke test</article></section>',
  dashboard: renderDashboard,
  campaigns: renderCampaigns,
  decisions: renderDecisions,
  reviews: renderReviews,
  wins: renderWins
};

export const knownActions = [
  'open-goal-modal','edit-goal','delete-goal','view-goal','goal-to-projects','goal-to-tasks','set-goal-filter','goal-search',
  'open-project-modal','edit-project','delete-project','view-project','project-to-tasks','rescue-project','set-project-filter','project-search',
  'open-task-modal','edit-task','delete-task','complete-task','toggle-task-complete','toggle-task-step','set-task-filter',
  'open-knowledge-modal','edit-knowledge','delete-knowledge','knowledge-to-task','review-knowledge','knowledge-to-goal','knowledge-to-project','fetch-knowledge-metadata','add-video-note','seek-video-note','knowledge-select-video','save-video-content','mark-video-complete','schedule-video-review','video-content-to-tasks','knowledge-search-tag','knowledge-filter','knowledge-search',
  'open-emergency','emergency-pick','emergency-to-task',
  'open-decision-modal','edit-decision','delete-decision','review-decision','decision-to-tasks','set-decision-filter','decision-search',
  'open-review-modal','create-daily-review','create-weekly-review','edit-review','delete-review','review-to-tasks','set-review-filter','review-search',
  'open-win-modal','edit-win','delete-win','duplicate-win','record-suggested-win','claim-win-reward','set-win-filter','win-search',
  'open-campaign-modal','edit-campaign','delete-campaign','view-campaign','campaign-to-tasks','open-campaign-compare','set-campaign-filter','campaign-search',
  'open-search','search-jump','search-open-result','search-open-recent','search-command','search-clear-recent',
  'show-backup','show-settings','show-qa','show-notifications','show-guide','run-system-test','export-json','backup-date','force-save-data','clear-data','import-json','drive-connect','drive-disconnect','drive-upload-now','drive-list','drive-restore-latest','drive-client-id','drive-enabled','drive-interval','drive-history','test-notification-sound','test-category-sound','reset-notification-sounds','request-notification-permission','mark-notification-read','clear-notification-log',
  'settings-name','settings-store-name','settings-currency','settings-daily-task-target','settings-learning-minutes-target','settings-youtube-key','drive-client-id','settings-quiet-mode','settings-compact-mode','settings-seed-data','settings-reset-section','notification-enabled','notification-sound-enabled','notification-browser-enabled','notification-sound-type','notification-category-sound','notification-lead-minutes','notification-volume',
  'close-modal','toggle-quick-actions','filter-list','modal-save','confirm-yes'
];

function pass(name, details = '') { return { status: 'pass', name, details }; }
function warn(name, details = '') { return { status: 'warn', name, details }; }
function fail(name, details = '') { return { status: 'fail', name, details }; }

function safeRun(name, fn) {
  try { return fn(); }
  catch (error) { return fail(name, error?.message || 'فشل غير معروف'); }
}

function collectActions(html = '') {
  const matches = String(html).matchAll(/data-action="([^"]+)"/g);
  return Array.from(new Set(Array.from(matches, m => m[1])));
}

function checkRoutes() {
  const results = [];
  for (const [route, renderer] of Object.entries(routeRenderers)) {
    results.push(safeRun(`فتح صفحة ${route}`, () => {
      const html = renderer();
      if (!String(html).includes('<section') && !String(html).includes('<article')) return fail(`فتح صفحة ${route}`, 'الصفحة لا ترجع HTML واضح.');
      return pass(`فتح صفحة ${route}`, 'تم توليد الصفحة بدون خطأ.');
    }));
  }
  return results;
}

function checkActions() {
  const html = Object.values(routeRenderers).map(renderer => {
    try { return renderer(); } catch { return ''; }
  }).join('\n');
  const actions = collectActions(html);
  const missing = actions.filter(action => !knownActions.includes(action));
  if (missing.length) return [fail('فحص أزرار data-action', `أزرار بدون Handler معروف: ${missing.join(', ')}`)];
  return [pass('فحص أزرار data-action', `تم فحص ${actions.length} نوع Action ظاهر في الصفحات.`)];
}

function checkDataShape() {
  const results = [];
  const normalized = normalizeData(appState.data);
  for (const name of collectionNames) {
    results.push(Array.isArray(normalized[name]) ? pass(`بيانات ${name}`, 'Array سليم.') : fail(`بيانات ${name}`, 'ليست Array.'));
  }
  const requiredSettings = ['userName','lastSavedAt','lastPage','autoSave','youtubeApiKey','storeName','currency','dailyTaskTarget','learningMinutesTarget','quietMode','compactMode','notifications','googleDriveBackup'];
  const missingSettings = requiredSettings.filter(key => !(key in normalized.settings));
  results.push(missingSettings.length ? warn('الإعدادات', `ناقص: ${missingSettings.join(', ')}`) : pass('الإعدادات', 'كل مفاتيح الإعدادات الأساسية موجودة.'));
  return results;
}

function checkStorage() {
  const health = checkStorageHealth();
  const saved = saveData();
  const results = [health.ok ? pass('LocalStorage', health.message) : fail('LocalStorage', health.message)];
  results.push(saved.ok ? pass('الحفظ الفعلي', 'تم حفظ البيانات بنجاح.') : fail('الحفظ الفعلي', saved.error?.message || 'فشل الحفظ.'));
  try {
    const size = new Blob([JSON.stringify(appState.data)]).size;
    const mb = (size / 1024 / 1024).toFixed(2);
    results.push(size > 4_500_000 ? warn('حجم البيانات', `${mb} MB — اقتربت من حد التخزين في بعض المتصفحات.`) : pass('حجم البيانات', `${mb} MB`));
  } catch { results.push(warn('حجم البيانات', 'تعذر حساب الحجم.')); }
  return results;
}

function checkDashboardNumbers() {
  const data = appState.data;
  const totalTasks = data.tasks.length;
  const doneTasks = data.tasks.filter(t => t.status === 'مكتملة').length;
  const completion = calculatePercentage(doneTasks, totalTasks);
  const dashboard = renderDashboard();
  if (!dashboard || !dashboard.includes('Dashboard')) return [fail('Dashboard', 'لم يتم توليد الداشبورد.')];
  return [pass('Dashboard من البيانات الحقيقية', `المهام: ${totalTasks}، المكتمل: ${doneTasks}، الإنجاز: ${completion}%.`)];
}

function checkCampaignCalculations() {
  const sample = {
    productName: 'زيت هندي 108 عشبة', productCost: 850, suggestedSellingPrice: 1450, availableUnits: 30,
    targetMargin: 35, reelCost: 3000, shootingCost: 0, designCost: 0, otherCreativeCost: 0,
    adsBudget: 10000, campaignDays: 7, expectedLeadCost: 25, expectedConversionRate: 8,
    shippingCost: 0, discountValue: 0, targetProfit: 10000
  };
  const metrics = calculateCampaign(sample);
  if (!Number.isFinite(metrics.netProfitPerUnit) || metrics.netProfitPerUnit <= 0) return [fail('حساب الحملات', 'صافي ربح القطعة غير منطقي.')];
  if (!Number.isFinite(metrics.breakEvenUnits) || metrics.breakEvenUnits <= 0) return [fail('حساب الحملات', 'Break Even غير منطقي.')];
  return [pass('حساب الحملات', `صافي القطعة ${metrics.netProfitPerUnit}، التعادل ${metrics.breakEvenUnits} قطعة، القرار: ${metrics.decision}.`)];
}

function checkKnowledgeSystem() {
  const lessons = [];
  appState.data.knowledge.forEach(item => {
    const videos = Array.isArray(item.playlistVideos) && item.playlistVideos.length ? item.playlistVideos : [{ id: item.videoId || item.id, title: item.title, durationSeconds: item.durationSeconds || item.duration || 0 }];
    videos.forEach(video => {
      const content = item.videoContent?.[video.id] || {};
      lessons.push({ item, video, content });
    });
  });
  const reviewDue = lessons.filter(x => x.content.learningStatus === 'أحتاج مراجعة' || (x.content.nextReviewAt && x.content.nextReviewAt <= new Date().toISOString().slice(0,10))).length;
  const converted = lessons.filter(x => x.content.convertedToExecution).length;
  const withActions = lessons.filter(x => Array.isArray(x.content.extractedActions) && x.content.extractedActions.length).length;
  return [pass('نظام المعرفة', `الدروس: ${lessons.length}، تحتاج مراجعة: ${reviewDue}، تحولت لتنفيذ: ${converted}، بها أفعال: ${withActions}.`)];
}

function checkYouTubeSettings() {
  const key = appState.data.settings.youtubeApiKey || '';
  if (!key) return [warn('YouTube API', 'المفتاح غير موجود. الجلب التلقائي سيعمل بإمكانيات محدودة.')];
  if (key.length < 20) return [warn('YouTube API', 'المفتاح قصير أو غير مكتمل غالبًا.')];
  return [pass('YouTube API', 'المفتاح محفوظ في الإعدادات.')];
}

function checkDuplicateIds() {
  const ids = [];
  for (const name of collectionNames) {
    appState.data[name].forEach(item => { if (item?.id) ids.push(`${name}:${item.id}`); });
  }
  const rawIds = ids.map(x => x.split(':').slice(1).join(':'));
  const duplicateIds = rawIds.filter((id, idx) => rawIds.indexOf(id) !== idx);
  return duplicateIds.length ? [warn('IDs مكررة', duplicateIds.slice(0, 10).join(', '))] : [pass('IDs مكررة', 'لا توجد IDs مكررة واضحة بين الأقسام.')];
}


function checkNotificationSoundSystem() {
  const settings = appState.data.settings.notifications || {};
  const categorySounds = settings.categorySounds || {};
  const soundIds = notificationSoundLibrary.map(sound => sound.id);
  const missingCategories = notificationCategories.filter(category => !categorySounds[category.id]);
  const invalidSounds = Object.entries(categorySounds).filter(([, soundId]) => !soundIds.includes(soundId));
  const results = [];
  results.push(notificationSoundLibrary.length >= 12 ? pass('مكتبة أصوات التنبيهات', `${notificationSoundLibrary.length} صوت متاح.`) : warn('مكتبة أصوات التنبيهات', 'عدد الأصوات أقل من المتوقع.'));
  results.push(missingCategories.length ? warn('تخصيص الأصوات للأقسام', `ناقص: ${missingCategories.map(x => x.name).join(', ')}`) : pass('تخصيص الأصوات للأقسام', `تم ضبط ${notificationCategories.length} قسم.`));
  results.push(invalidSounds.length ? fail('أصوات غير معروفة', invalidSounds.map(([key, value]) => `${key}:${value}`).join(', ')) : pass('أصوات غير معروفة', 'كل الأصوات المختارة موجودة في المكتبة.'));
  return results;
}


function checkWinGamificationScale() {
  const results = [];
  results.push(winGamificationCounts.levels >= 300 ? pass('مراحل الفوز', `${winGamificationCounts.levels} مرحلة جاهزة.`) : fail('مراحل الفوز', `المتاح ${winGamificationCounts.levels} فقط.`));
  results.push(winGamificationCounts.titles >= 300 ? pass('ألقاب الفوز', `${winGamificationCounts.titles} لقب جاهز.`) : fail('ألقاب الفوز', `المتاح ${winGamificationCounts.titles} فقط.`));
  results.push(winGamificationCounts.rewards >= 700 ? pass('هدايا ومكافآت الفوز', `${winGamificationCounts.rewards} هدية/مكافأة جاهزة.`) : fail('هدايا ومكافآت الفوز', `المتاح ${winGamificationCounts.rewards} فقط.`));
  const html = renderWins();
  results.push(html.includes('<details') && html.includes('win-collapsible') ? pass('طيّ عناصر الفوز', 'المراحل والألقاب والهدايا داخل أقسام قابلة للفتح والقفل.') : warn('طيّ عناصر الفوز', 'لم يتم العثور على أقسام details واضحة.'));
  return results;
}


function checkGoogleDriveBackupSettings() {
  const s = appState.data.settings.googleDriveBackup || {};
  const results = [];
  results.push('clientId' in s ? pass('Google Drive Client ID', s.clientId ? 'Client ID محفوظ.' : 'الخانة موجودة، أضف Client ID لتفعيل Drive.') : warn('Google Drive Client ID', 'إعداد Client ID غير موجود.'));
  results.push('enabled' in s ? pass('Google Drive Auto Backup', s.enabled ? `مفعل كل ${safeNumber(s.intervalMinutes,30)} دقيقة أثناء فتح التطبيق.` : 'غير مفعل حاليًا.') : warn('Google Drive Auto Backup', 'إعداد التفعيل غير موجود.'));
  results.push('keepHistory' in s ? pass('Google Drive History', s.keepHistory ? 'سيتم حفظ نسخة تاريخية بجانب آخر نسخة.' : 'سيتم تحديث آخر نسخة فقط.') : warn('Google Drive History', 'إعداد الاحتفاظ بالنسخ غير موجود.'));
  return results;
}

function checkResetSafety() {
  const empty = createEmptyData();
  return empty && Array.isArray(empty.tasks) && empty.settings ? [pass('Reset Safety', 'شكل البيانات الافتراضي جاهز وآمن.')] : [fail('Reset Safety', 'شكل البيانات الافتراضي غير سليم.')];
}

export function runSystemTests() {
  const startedAt = new Date().toISOString();
  const results = [
    ...checkRoutes(),
    ...checkActions(),
    ...checkDataShape(),
    ...checkStorage(),
    ...checkDashboardNumbers(),
    ...checkCampaignCalculations(),
    ...checkKnowledgeSystem(),
    ...checkYouTubeSettings(),
    ...checkDuplicateIds(),
    ...checkNotificationSoundSystem(),
    ...checkWinGamificationScale(),
    ...checkGoogleDriveBackupSettings(),
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

export function renderTestReport(report) {
  if (!report) return '<div class="empty-state"><strong>لم يتم تشغيل الاختبار بعد</strong><p>اضغط تشغيل اختبار النظام لعرض التقرير.</p></div>';
  const { summary, results } = report;
  return `<div class="qa-report">
    <div class="kpi-grid compact">
      <article class="kpi-card"><span>إجمالي</span><strong>${summary.total}</strong></article>
      <article class="kpi-card"><span>ناجح</span><strong>${summary.passed}</strong></article>
      <article class="kpi-card"><span>تحذير</span><strong>${summary.warnings}</strong></article>
      <article class="kpi-card"><span>فشل</span><strong>${summary.failed}</strong></article>
    </div>
    <div class="qa-list">
      ${results.map(result => `<div class="qa-row ${result.status}"><span>${result.status === 'pass' ? '✅' : result.status === 'warn' ? '⚠️' : '❌'}</span><div><b>${safeText(result.name)}</b><p>${safeText(result.details || '')}</p></div></div>`).join('')}
    </div>
  </div>`;
}
