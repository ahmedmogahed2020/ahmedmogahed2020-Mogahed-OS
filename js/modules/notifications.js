import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { pageHeader, toast } from '../ui.js';
import { formatDate, generateId, safeNumber, safeText, todayISO } from '../utils.js';
import { renderPage } from '../router.js';

let reminderTimer = null;
let audioContext = null;

function defaultNotificationSettings() {
  return {
    enabled: true,
    soundEnabled: true,
    browserNotifications: false,
    leadMinutes: 10,
    volume: 0.35,
    soundType: 'soft',
    focusSound: true
  };
}

function getSettings() {
  appState.data.settings.notifications = { ...defaultNotificationSettings(), ...(appState.data.settings.notifications || {}) };
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
  appState.data.notificationLogs = getLog().slice(0, 80);
  autoSave();
}

function buildReminderKey(task, phase) {
  return `${task.id}:${task.dueDate}:${task.dueTime}:${phase}`;
}

function getDueReminders() {
  const settings = getSettings();
  if (!settings.enabled) return [];
  const now = new Date();
  const leadMs = safeNumber(settings.leadMinutes, 10) * 60000;
  return (appState.data.tasks || [])
    .filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime)
    .flatMap(task => {
      const due = taskDateTime(task);
      if (!due) return [];
      const diff = due.getTime() - now.getTime();
      const items = [];
      if (diff > 0 && diff <= leadMs) items.push({ task, phase: 'before', title: 'تذكير قريب', message: `باقي ${Math.max(1, Math.ceil(diff / 60000))} دقيقة على: ${task.title}` });
      if (diff <= 0 && diff >= -5 * 60000) items.push({ task, phase: 'due', title: 'وقت المهمة الآن', message: task.title });
      return items;
    })
    .filter(item => !wasNotified(item.task.id, buildReminderKey(item.task, item.phase)));
}

function unlockAudio() {
  try {
    audioContext = audioContext || new (window.AudioContext || window.webkitAudioContext)();
    if (audioContext.state === 'suspended') audioContext.resume();
  } catch {}
}

export function playAlertSound(type = '') {
  const settings = getSettings();
  if (!settings.soundEnabled) return;
  try {
    unlockAudio();
    if (!audioContext) return;
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.02, safeNumber(settings.volume, 0.35)), now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    gain.connect(audioContext.destination);
    const sequence = type === 'urgent' || settings.soundType === 'clear' ? [660, 880, 660] : settings.soundType === 'soft' ? [440, 554] : [523, 659, 784];
    sequence.forEach((freq, index) => {
      const osc = audioContext.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + index * 0.16);
      osc.connect(gain);
      osc.start(now + index * 0.16);
      osc.stop(now + index * 0.16 + 0.13);
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
    addNotificationLog({ key, taskId: item.task.id, title: item.title, message: item.message, type: item.phase === 'due' ? 'urgent' : 'reminder' });
    if (!silent) toast(item.message, item.phase === 'due' ? 'warning' : 'info');
    playAlertSound(item.phase === 'due' ? 'urgent' : 'soft');
    showBrowserNotification(item.title, item.message);
  });
  return reminders;
}

export function initNotifications() {
  getSettings();
  document.addEventListener('click', unlockAudio, { once: true });
  clearInterval(reminderTimer);
  reminderTimer = setInterval(() => checkReminders({ silent: false }), 60000);
  setTimeout(() => checkReminders({ silent: true }), 1800);
}

function getNotificationStats() {
  const log = getLog();
  const today = log.filter(x => String(x.createdAt || '').slice(0,10) === todayISO());
  const scheduled = (appState.data.tasks || []).filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime);
  return { log, today, scheduled, unread: log.filter(x => !x.read) };
}

function renderNotificationSettings() {
  const s = getSettings();
  return `<article class="card settings-card"><h3>إعدادات التنبيهات</h3>
    <div class="settings-grid">
      <label class="setting-field"><span>التنبيه قبل المهمة بالدقائق</span><input type="number" min="1" max="240" value="${safeText(s.leadMinutes)}" data-action="notification-lead-minutes"></label>
      <label class="setting-field"><span>الصوت</span><select data-action="notification-sound-type"><option value="soft" ${s.soundType === 'soft' ? 'selected' : ''}>هادئ</option><option value="clear" ${s.soundType === 'clear' ? 'selected' : ''}>واضح</option><option value="bright" ${s.soundType === 'bright' ? 'selected' : ''}>نشط</option></select></label>
      <label class="setting-field"><span>مستوى الصوت</span><input type="range" min="0.05" max="1" step="0.05" value="${safeText(s.volume)}" data-action="notification-volume"></label>
    </div>
    <div class="setting-toggles">
      <label><input type="checkbox" ${s.enabled ? 'checked' : ''} data-action="notification-enabled"> تشغيل التذكيرات داخل التطبيق</label>
      <label><input type="checkbox" ${s.soundEnabled ? 'checked' : ''} data-action="notification-sound-enabled"> تشغيل أصوات التنبيه</label>
      <label><input type="checkbox" ${s.browserNotifications ? 'checked' : ''} data-action="notification-browser-enabled"> إشعارات المتصفح عند السماح</label>
    </div>
    <div class="btn-row" style="margin-top:12px"><button class="btn primary" data-action="test-notification-sound">اختبار الصوت</button><button class="btn ghost" data-action="request-notification-permission">تفعيل إشعارات المتصفح</button></div>
    <p class="meta" style="margin-top:10px">التذكيرات تعمل أثناء فتح التطبيق. على GitHub Pages ستعمل داخل المتصفح بدون Backend.</p>
  </article>`;
}

function renderScheduledTasks() {
  const scheduled = (appState.data.tasks || []).filter(task => task.status !== 'مكتملة' && task.dueDate && task.dueTime).slice(0, 8);
  return `<article class="card"><h3>مهام لها تذكير</h3>${scheduled.length ? `<div class="today-list">${scheduled.map(task => `<div class="today-task"><div><b>${safeText(task.title)}</b><div class="meta"><span>${safeText(task.dueDate)}</span><span>${safeText(task.dueTime)}</span><span>${safeText(task.reminder || 'تنبيه تلقائي')}</span></div></div><button class="btn ghost" data-action="edit-task" data-id="${safeText(task.id)}">تعديل</button></div>`).join('')}</div>` : '<p class="meta">لا توجد مهام بوقت محدد. أضف تاريخ ووقت للمهمة حتى يظهر التذكير.</p>'}</article>`;
}

function renderNotificationLog() {
  const log = getLog().slice(0, 12);
  return `<article class="card"><div class="section-title"><h3>سجل التنبيهات</h3><button class="btn ghost" data-action="clear-notification-log">مسح السجل</button></div>${log.length ? `<div class="timeline-list">${log.map(item => `<div class="timeline-item ${item.read ? '' : 'is-new'}"><b>${safeText(item.title)}</b><p>${safeText(item.message)}</p><div class="meta"><span>${safeText(formatDate(item.createdAt))}</span><button class="btn ghost" data-action="mark-notification-read" data-id="${safeText(item.id)}">تم</button></div></div>`).join('')}</div>` : '<p class="meta">لم يتم تسجيل تنبيهات بعد.</p>'}</article>`;
}

export function notificationsPanel() {
  const stats = getNotificationStats();
  return `<section class="notifications-pro">
    ${pageHeader('التنبيهات والتذكيرات', 'تذكيرات للمهام ذات الوقت المحدد مع أصوات تنبيه خفيفة.', '<button class="btn primary" data-action="test-notification-sound">اختبار الصوت</button>')}
    <div class="decision-intel-grid">
      <article class="kpi-card"><small>مهام مجدولة</small><strong>${safeText(stats.scheduled.length)}</strong></article>
      <article class="kpi-card"><small>تنبيهات اليوم</small><strong>${safeText(stats.today.length)}</strong></article>
      <article class="kpi-card"><small>غير مقروءة</small><strong>${safeText(stats.unread.length)}</strong></article>
      <article class="kpi-card"><small>كل السجل</small><strong>${safeText(stats.log.length)}</strong></article>
    </div>
    ${renderNotificationSettings()}
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
export function updateNotificationVolume(value) { saveNotificationSetting('volume', Math.min(1, Math.max(0.05, safeNumber(value, 0.35)))); }
export function updateNotificationSoundType(value) { saveNotificationSetting('soundType', value || 'soft'); }

export function testNotificationSound() {
  playAlertSound('urgent');
  toast('تم تشغيل صوت تجريبي');
}

export async function requestNotificationPermission() {
  if (!('Notification' in window)) { toast('المتصفح لا يدعم إشعارات النظام', 'warning'); return; }
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
