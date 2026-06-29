import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { pageHeader, toast } from '../ui.js';
import { formatDate, generateId, safeNumber, safeText, todayISO } from '../utils.js';
import { renderPage } from '../router.js';

let reminderTimer = null;
let audioContext = null;

export const notificationSoundLibrary = [
  { id: 'soft', name: 'هادئ', description: 'نغمتان خفيفتان للتنبيهات اليومية', wave: 'sine', sequence: [440, 554], step: 0.16, length: 0.14 },
  { id: 'clear', name: 'واضح', description: 'واضح ومباشر للمهام المهمة', wave: 'sine', sequence: [660, 880, 660], step: 0.14, length: 0.11 },
  { id: 'bright', name: 'نشط', description: 'صاعد ومحفز للبداية السريعة', wave: 'triangle', sequence: [523, 659, 784], step: 0.13, length: 0.12 },
  { id: 'focus', name: 'تركيز', description: 'نغمة عميقة لجلسات العمل', wave: 'sine', sequence: [392, 494, 587], step: 0.18, length: 0.16 },
  { id: 'urgent', name: 'عاجل', description: 'تنبيه قوي للمواعيد القريبة', wave: 'square', sequence: [784, 784, 988, 784], step: 0.11, length: 0.08 },
  { id: 'success', name: 'نجاح', description: 'إحساس إنجاز وفوز', wave: 'triangle', sequence: [523, 659, 784, 1046], step: 0.12, length: 0.1 },
  { id: 'decision', name: 'قرار', description: 'نغمة متزنة لمراجعة القرارات', wave: 'sine', sequence: [330, 440, 550], step: 0.18, length: 0.15 },
  { id: 'goal', name: 'هدف', description: 'نغمة صاعدة للأهداف والمراحل', wave: 'triangle', sequence: [392, 523, 659, 784], step: 0.14, length: 0.12 },
  { id: 'project', name: 'مشروع', description: 'نغمة عملية للمشاريع', wave: 'sine', sequence: [294, 392, 494], step: 0.17, length: 0.14 },
  { id: 'knowledge', name: 'معرفة', description: 'هادئة للتعلم والمراجعة', wave: 'sine', sequence: [349, 440, 523], step: 0.2, length: 0.15 },
  { id: 'campaign', name: 'حملة', description: 'تنبيه تجاري سريع للحملات', wave: 'square', sequence: [523, 659, 523, 784], step: 0.1, length: 0.08 },
  { id: 'review', name: 'مراجعة', description: 'نغمة نهاية يوم/أسبوع', wave: 'triangle', sequence: [440, 392, 330, 392], step: 0.15, length: 0.13 },
  { id: 'emergency', name: 'طوارئ', description: 'تنبيه قصير للخروج من التشتت', wave: 'sawtooth', sequence: [220, 330, 440, 330], step: 0.09, length: 0.07 },
  { id: 'minimal', name: 'Minimal', description: 'نقرة بسيطة جدًا', wave: 'sine', sequence: [600], step: 0.12, length: 0.08 },
  { id: 'chime', name: 'Chime', description: 'رنين خفيف', wave: 'sine', sequence: [523, 784, 1046], step: 0.2, length: 0.18 },
  { id: 'pulse', name: 'Pulse', description: 'نبضتين قصيرتين', wave: 'square', sequence: [480, 480], step: 0.22, length: 0.07 }
];

export const notificationCategories = [
  { id: 'tasks', name: 'المهام', defaultSound: 'clear' },
  { id: 'goals', name: 'الأهداف', defaultSound: 'goal' },
  { id: 'projects', name: 'المشاريع', defaultSound: 'project' },
  { id: 'knowledge', name: 'المعرفة', defaultSound: 'knowledge' },
  { id: 'decisions', name: 'القرارات', defaultSound: 'decision' },
  { id: 'reviews', name: 'المراجعات', defaultSound: 'review' },
  { id: 'wins', name: 'الفوز', defaultSound: 'success' },
  { id: 'campaigns', name: 'الحملات', defaultSound: 'campaign' },
  { id: 'emergency', name: 'الطوارئ', defaultSound: 'emergency' },
  { id: 'backup', name: 'النسخ الاحتياطي', defaultSound: 'minimal' },
  { id: 'system', name: 'النظام وQA', defaultSound: 'soft' }
];

function defaultSoundMap() {
  return Object.fromEntries(notificationCategories.map(category => [category.id, category.defaultSound]));
}

function defaultNotificationSettings() {
  return {
    enabled: true,
    soundEnabled: true,
    browserNotifications: false,
    leadMinutes: 10,
    volume: 0.35,
    soundType: 'soft',
    categorySounds: defaultSoundMap(),
    focusSound: true,
    dailyReviewReminderEnabled: true,
    dailyReviewReminderTime: '21:30',
    lastDailyReviewPromptDate: ''
  };
}

function normalizeSoundId(id, fallback = 'soft') {
  return notificationSoundLibrary.some(sound => sound.id === id) ? id : fallback;
}

function getSettings() {
  const base = defaultNotificationSettings();
  const current = appState.data.settings.notifications || {};
  const categorySounds = { ...base.categorySounds, ...(current.categorySounds || {}) };
  Object.keys(categorySounds).forEach(key => { categorySounds[key] = normalizeSoundId(categorySounds[key], base.categorySounds[key] || 'soft'); });
  appState.data.settings.notifications = { ...base, ...current, categorySounds, soundType: normalizeSoundId(current.soundType || base.soundType) };
  return appState.data.settings.notifications;
}

function getLog() {
  appState.data.notificationLogs = Array.isArray(appState.data.notificationLogs) ? appState.data.notificationLogs : [];
  return appState.data.notificationLogs;
}

function taskDateTime(task) {
  if (!task?.dueDate || !task?.dueTime) return null;
  const date = new Date(`${task.dueDate}T${task.dueTime}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function wasNotified(taskId, key) {
  return getLog().some(log => log.taskId === taskId && log.key === key);
}

function addNotificationLog(log) {
  getLog().unshift({ id: generateId('notify'), createdAt: new Date().toISOString(), read: false, ...log });
  appState.data.notificationLogs = getLog().slice(0, 120);
  autoSave();
}

function buildReminderKey(task, phase) {
  return `${task.id}:${task.dueDate}:${task.dueTime}:${phase}`;
}


function parseTaskReminderMinutes(task = {}, fallback = 10) {
  const explicit = safeNumber(task.reminderMinutes, 0);
  if (explicit > 0) return explicit;
  const text = String(task.reminder || '').trim();
  const number = Number((text.match(/\d+/) || [0])[0]);
  if (/يوم/.test(text)) return number ? number * 1440 : 1440;
  if (/ساعت|ساعة/.test(text)) return number ? number * 60 : 60;
  if (/ربع/.test(text)) return 15;
  if (/نصف|نص/.test(text)) return 30;
  if (/دقيق/.test(text)) return number || fallback;
  return Math.max(1, safeNumber(fallback, 10));
}

function getDueReminders() {
  const settings = getSettings();
  if (!settings.enabled) return [];
  const now = new Date();
  const defaultLeadMinutes = safeNumber(settings.leadMinutes, 10);
  return (appState.data.tasks || [])
    .filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime)
    .flatMap(task => {
      const due = taskDateTime(task);
      if (!due) return [];
      const diff = due.getTime() - now.getTime();
      const leadMinutes = parseTaskReminderMinutes(task, defaultLeadMinutes);
      const leadMs = leadMinutes * 60000;
      const items = [];
      if (diff > 0 && diff <= leadMs) items.push({ task, phase: 'before', category: 'tasks', title: 'تذكير قريب', message: `باقي ${Math.max(1, Math.ceil(diff / 60000))} دقيقة على: ${task.title} · تذكيرها قبل ${leadMinutes} دقيقة` });
      if (diff <= 0 && diff >= -5 * 60000) items.push({ task, phase: 'due', category: 'tasks', title: 'وقت المهمة الآن', message: task.title });
      return items;
    })
    .filter(item => !wasNotified(item.task.id, buildReminderKey(item.task, item.phase)));
}

export function getDailyReviewFlowState() {
  const settings = getSettings();
  const today = todayISO();
  const reviews = Array.isArray(appState.data.reviews) ? appState.data.reviews : [];
  const todayReview = reviews.find(review => review.type === 'يومية' && String(review.date || review.createdAt || '').slice(0, 10) === today);
  const tasks = Array.isArray(appState.data.tasks) ? appState.data.tasks : [];
  const todayTasks = tasks.filter(task => task.dueDate === today || String(task.completedAt || task.updatedAt || '').slice(0, 10) === today);
  const doneToday = todayTasks.filter(task => task.status === 'مكتملة').length;
  const openToday = todayTasks.filter(task => task.status !== 'مكتملة').length;
  const overdue = tasks.filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueDate < today).length;
  return {
    enabled: Boolean(settings.dailyReviewReminderEnabled),
    time: settings.dailyReviewReminderTime || '21:30',
    completed: Boolean(todayReview),
    todayReview,
    doneToday,
    openToday,
    overdue,
    lastPromptDate: settings.lastDailyReviewPromptDate || '',
    shouldPrompt: Boolean(settings.dailyReviewReminderEnabled && !todayReview && settings.lastDailyReviewPromptDate !== today)
  };
}

function isDailyReviewReminderDue() {
  const state = getDailyReviewFlowState();
  if (!state.shouldPrompt) return false;
  const now = new Date();
  const current = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return current >= state.time;
}

export function checkDailyReviewReminder({ silent = false } = {}) {
  if (!isDailyReviewReminderDue()) return null;
  const state = getDailyReviewFlowState();
  const today = todayISO();
  appState.data.settings.notifications.lastDailyReviewPromptDate = today;
  addNotificationLog({
    key: `daily-review:${today}`,
    title: 'مراجعة نهاية اليوم',
    message: `اقفل اليوم: ${state.doneToday} مكتملة، ${state.openToday} مفتوحة، ${state.overdue} متأخرة.`,
    type: 'daily-review',
    category: 'reviews',
    relatedId: today
  });
  if (!silent) toast('وقت مراجعة نهاية اليوم — اقفل اليوم وخطط لبكرة.', 'info');
  playAlertSound('review', { category: 'reviews' });
  showBrowserNotification('مراجعة نهاية اليوم', 'اقفل اليوم وخطط لبكرة داخل Mogahed OS.');
  autoSave();
  return state;
}

function unlockAudio() {
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  } catch {}
}

function getSoundById(id) {
  return notificationSoundLibrary.find(sound => sound.id === id) || notificationSoundLibrary[0];
}

function getCategorySound(category = 'system', priority = '') {
  const settings = getSettings();
  if (priority === 'urgent') return 'urgent';
  return normalizeSoundId(settings.categorySounds?.[category] || settings.soundType || 'soft');
}

export function playAlertSound(type = '', options = {}) {
  const settings = getSettings();
  if (!settings.soundEnabled) return;
  try {
    unlockAudio();
    if (!audioContext) return;
    const soundId = options.soundId || (options.category ? getCategorySound(options.category, type) : normalizeSoundId(type || settings.soundType || 'soft'));
    const sound = getSoundById(soundId);
    const now = audioContext.currentTime;
    const volume = Math.max(0.02, Math.min(1, safeNumber(settings.volume, 0.35)));
    const masterGain = audioContext.createGain();
    masterGain.gain.setValueAtTime(0.001, now);
    masterGain.gain.exponentialRampToValueAtTime(volume, now + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + Math.max(0.45, sound.sequence.length * sound.step + 0.32));
    masterGain.connect(audioContext.destination);

    sound.sequence.forEach((freq, index) => {
      const start = now + index * sound.step;
      const osc = audioContext.createOscillator();
      const gain = audioContext.createGain();
      osc.type = sound.wave || 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.exponentialRampToValueAtTime(0.8, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + sound.length);
      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(start);
      osc.stop(start + sound.length + 0.03);
    });
  } catch {}
}

function showBrowserNotification(title, message) {
  const settings = getSettings();
  if (!settings.browserNotifications || !('Notification' in window) || Notification.permission !== 'granted') return;
  try { new Notification(title, { body: message, tag: 'mogahed-os-reminder' }); } catch {}
}

export function checkReminders({ silent = false } = {}) {
  const reminders = getDueReminders();
  reminders.forEach(item => {
    const key = buildReminderKey(item.task, item.phase);
    const priority = item.phase === 'due' ? 'urgent' : 'reminder';
    addNotificationLog({ key, taskId: item.task.id, title: item.title, message: item.message, type: priority, category: item.category });
    if (!silent) toast(item.message, item.phase === 'due' ? 'warning' : 'info');
    playAlertSound(priority, { category: item.category });
    showBrowserNotification(item.title, item.message);
  });
  return reminders;
}

export function notifyEvent(category = 'system', title = 'تنبيه', message = '', options = {}) {
  const settings = getSettings();
  if (!settings.enabled && !options.force) return;
  const knownCategory = notificationCategories.some(item => item.id === category) ? category : 'system';
  addNotificationLog({ title, message, category: knownCategory, type: options.type || 'event', relatedId: options.relatedId || '' });
  if (!options.silentToast) toast(message || title, options.toastType || 'info');
  playAlertSound(options.priority || '', { category: knownCategory, soundId: options.soundId });
  showBrowserNotification(title, message || title);
}

export function initNotifications() {
  getSettings();
  document.addEventListener('click', unlockAudio, { once: true });
  document.addEventListener('touchstart', unlockAudio, { once: true });
  clearInterval(reminderTimer);
  reminderTimer = setInterval(() => {
    checkReminders({ silent: false });
    checkDailyReviewReminder({ silent: false });
  }, 60000);
  setTimeout(() => {
    checkReminders({ silent: true });
    checkDailyReviewReminder({ silent: true });
  }, 1800);
}

function getNotificationStats() {
  const log = getLog();
  const today = log.filter(x => String(x.createdAt || '').slice(0,10) === todayISO());
  const scheduled = (appState.data.tasks || []).filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime);
  const reviewFlow = getDailyReviewFlowState();
  const byCategory = notificationCategories.map(category => ({ ...category, count: log.filter(item => item.category === category.id).length }));
  return { log, today, scheduled, unread: log.filter(x => !x.read), byCategory, reviewFlow };
}

function soundOptions(selected) {
  return notificationSoundLibrary.map(sound => `<option value="${safeText(sound.id)}" ${selected === sound.id ? 'selected' : ''}>${safeText(sound.name)}</option>`).join('');
}

function renderSoundLibrary(settings) {
  return `<article class="card settings-card"><div class="section-title"><h3>مكتبة الأصوات</h3><span class="badge">${notificationSoundLibrary.length} صوت</span></div>
    <p class="meta">كل الأصوات مولدة داخل المتصفح Web Audio، لذلك لا تحتاج ملفات خارجية ولا Backend.</p>
    <div class="sound-library-grid">
      ${notificationSoundLibrary.map(sound => `<div class="sound-card"><div><b>${safeText(sound.name)}</b><p>${safeText(sound.description)}</p></div><button class="btn ghost" data-action="test-notification-sound" data-sound-id="${safeText(sound.id)}">تجربة</button></div>`).join('')}
    </div>
  </article>`;
}

function renderCategorySoundMatrix(settings) {
  return `<article class="card settings-card"><div class="section-title"><h3>صوت مخصص لكل قسم</h3><button class="btn ghost" data-action="reset-notification-sounds">إرجاع الافتراضي</button></div>
    <p class="meta">اختر صوت مختلف للمهام، القرارات، الأهداف، الحملات، الفوز، الطوارئ… إلخ.</p>
    <div class="sound-matrix">
      ${notificationCategories.map(category => `<label class="sound-row"><span>${safeText(category.name)}</span><select data-action="notification-category-sound" data-category="${safeText(category.id)}">${soundOptions(settings.categorySounds?.[category.id] || category.defaultSound)}</select><button type="button" class="btn ghost" data-action="test-category-sound" data-category="${safeText(category.id)}">اختبار</button></label>`).join('')}
    </div>
  </article>`;
}

function renderNotificationSettings() {
  const s = getSettings();
  return `<article class="card settings-card"><h3>إعدادات التنبيهات العامة</h3>
    <div class="settings-grid">
      <label class="setting-field"><span>التنبيه قبل المهمة بالدقائق</span><input type="number" min="1" max="240" value="${safeText(s.leadMinutes)}" data-action="notification-lead-minutes"></label>
      <label class="setting-field"><span>الصوت الافتراضي</span><select data-action="notification-sound-type">${soundOptions(s.soundType)}</select></label>
      <label class="setting-field"><span>مستوى الصوت</span><input type="range" min="0.05" max="1" step="0.05" value="${safeText(s.volume)}" data-action="notification-volume"></label>
      <label class="setting-field"><span>ميعاد مراجعة نهاية اليوم</span><input type="time" value="${safeText(s.dailyReviewReminderTime || '21:30')}" data-action="notification-review-time"></label>
    </div>
    <div class="setting-toggles">
      <label><input type="checkbox" ${s.enabled ? 'checked' : ''} data-action="notification-enabled"> تشغيل التذكيرات داخل التطبيق</label>
      <label><input type="checkbox" ${s.soundEnabled ? 'checked' : ''} data-action="notification-sound-enabled"> تشغيل أصوات التنبيه</label>
      <label><input type="checkbox" ${s.browserNotifications ? 'checked' : ''} data-action="notification-browser-enabled"> إشعارات المتصفح عند السماح</label>
      <label><input type="checkbox" ${s.dailyReviewReminderEnabled ? 'checked' : ''} data-action="notification-review-enabled"> تذكير مراجعة نهاية اليوم</label>
    </div>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="test-notification-sound">اختبار الصوت الافتراضي</button><button class="btn ghost" data-action="request-notification-permission">تفعيل إشعارات المتصفح</button></div>
    <p class="meta" style="margin-top:10px">التذكيرات تعمل أثناء فتح التطبيق. على GitHub Pages ستعمل داخل المتصفح بدون Backend.</p>
  </article>`;
}

function renderDailyReviewReminderPanel() {
  const flow = getDailyReviewFlowState();
  return `<article class="card daily-review-flow-card">
    <div class="section-title"><div><span class="eyebrow">تدفق المراجعة</span><h3>مراجعة نهاية اليوم</h3></div><span class="badge ${flow.completed ? 'success' : 'warning'}">${flow.completed ? 'تمت اليوم' : safeText(flow.time)}</span></div>
    <p class="meta">تنبيه واحد يوميًا عند الموعد المحدد أثناء فتح التطبيق. لا يتكرر في نفس اليوم.</p>
    <div class="daily-review-flow-grid"><span><b>${safeText(flow.doneToday)}</b><small>مكتملة</small></span><span><b>${safeText(flow.openToday)}</b><small>مفتوحة</small></span><span><b>${safeText(flow.overdue)}</b><small>متأخرة</small></span></div>
    <div class="btn-row"><button class="btn primary" data-action="create-daily-review">افتح مراجعة اليوم</button><button class="btn ghost" data-route="reviews">صفحة المراجعات</button></div>
  </article>`;
}

function renderScheduledTasks() {
  const scheduled = (appState.data.tasks || []).filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime).slice(0, 8);
  return `<article class="card"><h3>مهام لها تذكير</h3>${scheduled.length ? `<div class="today-list">${scheduled.map(task => `<div class="today-task"><div><b>${safeText(task.title)}</b><div class="meta"><span>${safeText(task.dueDate)}</span><span>${safeText(task.dueTime)}</span><span>${safeText(task.reminder || `قبل ${parseTaskReminderMinutes(task, getSettings().leadMinutes)} دقيقة`)}</span></div></div><button class="btn ghost" data-action="edit-task" data-id="${safeText(task.id)}">تعديل</button></div>`).join('')}</div>` : '<p class="meta">لا توجد مهام بوقت محدد. أضف تاريخ ووقت للمهمة حتى يظهر التذكير.</p>'}</article>`;
}

function renderNotificationLog() {
  const log = getLog().slice(0, 14);
  return `<article class="card"><div class="section-title"><h3>سجل التنبيهات</h3><button class="btn ghost" data-action="clear-notification-log">مسح السجل</button></div>${log.length ? `<div class="timeline-list">${log.map(item => {
    const category = notificationCategories.find(c => c.id === item.category)?.name || 'النظام';
    return `<div class="timeline-item ${item.read ? '' : 'is-new'}"><b>${safeText(item.title)}</b><p>${safeText(item.message)}</p><div class="meta"><span>${safeText(category)}</span><span>${safeText(formatDate(item.createdAt))}</span><button class="btn ghost" data-action="mark-notification-read" data-id="${safeText(item.id)}">تم</button></div></div>`;
  }).join('')}</div>` : '<p class="meta">لم يتم تسجيل تنبيهات بعد.</p>'}</article>`;
}

export function notificationsPanel() {
  const stats = getNotificationStats();
  const settings = getSettings();
  return `<section class="notifications-pro">
    ${pageHeader('التنبيهات والتذكيرات', 'أصوات كثيرة وتخصيص صوت مستقل لكل قسم في النظام.', '<button class="btn primary" data-action="test-notification-sound">اختبار الصوت</button>')}
    <div class="decision-intel-grid">
      <article class="kpi-card"><small>مهام مجدولة</small><strong>${safeText(stats.scheduled.length)}</strong></article>
      <article class="kpi-card"><small>تنبيهات اليوم</small><strong>${safeText(stats.today.length)}</strong></article>
      <article class="kpi-card"><small>غير مقروءة</small><strong>${safeText(stats.unread.length)}</strong></article>
      <article class="kpi-card"><small>مراجعة اليوم</small><strong>${stats.reviewFlow.completed ? 'تمت' : safeText(stats.reviewFlow.time)}</strong></article>
      <article class="kpi-card"><small>الأصوات</small><strong>${safeText(notificationSoundLibrary.length)}</strong></article>
    </div>
    ${renderDailyReviewReminderPanel()}
    ${renderNotificationSettings()}
    ${renderCategorySoundMatrix(settings)}
    ${renderSoundLibrary(settings)}
    <div class="grid grid-2">${renderScheduledTasks()}${renderNotificationLog()}</div>
  </section>`;
}

function saveNotificationSetting(key, value) {
  const s = getSettings();
  s[key] = value;
  appState.data.settings.notifications = s;
  autoSave();
}

export function updateNotificationEnabled(checked) { saveNotificationSetting('enabled', Boolean(checked)); }
export function updateNotificationSoundEnabled(checked) { saveNotificationSetting('soundEnabled', Boolean(checked)); }
export function updateNotificationBrowserEnabled(checked) { saveNotificationSetting('browserNotifications', Boolean(checked)); }
export function updateNotificationLeadMinutes(value) { saveNotificationSetting('leadMinutes', Math.max(1, safeNumber(value, 10))); }
export function updateNotificationVolume(value) { saveNotificationSetting('volume', Math.max(0.05, Math.min(1, safeNumber(value, 0.35)))); }
export function updateNotificationSoundType(value) { saveNotificationSetting('soundType', normalizeSoundId(value)); }

export function updateNotificationCategorySound(category, soundId) {
  const s = getSettings();
  if (!notificationCategories.some(item => item.id === category)) return;
  s.categorySounds = { ...defaultSoundMap(), ...(s.categorySounds || {}), [category]: normalizeSoundId(soundId) };
  appState.data.settings.notifications = s;
  autoSave();
}

export function resetNotificationSounds() {
  const s = getSettings();
  s.categorySounds = defaultSoundMap();
  s.soundType = 'soft';
  appState.data.settings.notifications = s;
  autoSave();
  renderPage();
  toast('تم إرجاع أصوات التنبيه للوضع الافتراضي');
}

export function testNotificationSound(soundId = '') {
  playAlertSound('', { soundId: normalizeSoundId(soundId || getSettings().soundType) });
  toast('تم تشغيل صوت تجريبي');
}

export function testCategorySound(category = 'system') {
  const known = notificationCategories.find(item => item.id === category) ? category : 'system';
  const soundId = getCategorySound(known);
  playAlertSound('', { soundId });
  toast(`تم اختبار صوت ${notificationCategories.find(item => item.id === known)?.name || 'النظام'}`);
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) { toast('المتصفح لا يدعم إشعارات سطح المكتب', 'warning'); return; }
  const permission = await Notification.requestPermission();
  saveNotificationSetting('browserNotifications', permission === 'granted');
  toast(permission === 'granted' ? 'تم تفعيل إشعارات المتصفح' : 'لم يتم السماح بإشعارات المتصفح');
  renderPage();
}

export function markNotificationRead(id) {
  const item = getLog().find(x => x.id === id);
  if (item) item.read = true;
  autoSave();
  renderPage();
}

export function clearNotificationLog() {
  appState.data.notificationLogs = [];
  autoSave();
  renderPage();
  toast('تم مسح سجل التنبيهات');
}

export function updateDailyReviewReminderEnabled(value) { const s = getSettings(); s.dailyReviewReminderEnabled = Boolean(value); autoSave(); renderPage(); toast('تم تحديث تذكير مراجعة اليوم'); }
export function updateDailyReviewReminderTime(value) { const s = getSettings(); s.dailyReviewReminderTime = value || '21:30'; s.lastDailyReviewPromptDate = ''; autoSave(); renderPage(); toast('تم تحديث ميعاد مراجعة اليوم'); }
