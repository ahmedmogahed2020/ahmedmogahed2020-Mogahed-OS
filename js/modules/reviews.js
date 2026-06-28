import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { renderPage } from '../router.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, formatCurrency, formatDate, generateId, isPast, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { removeItem, simpleCard, upsert } from './shared.js';
import { calculateCampaign } from './campaigns.js';

const reviewViews = [
  ['all', 'الكل'],
  ['daily', 'يومي'],
  ['weekly', 'أسبوعي'],
  ['needs-action', 'يحتاج أفعال'],
  ['low-focus', 'تركيز منخفض'],
  ['high-value', 'مهم']
];

function normalizeReview(review = {}) {
  const type = review.type || 'يومية';
  return {
    ...review,
    type,
    date: review.date || todayISO(),
    actionItems: Array.isArray(review.actionItems) ? review.actionItems : parseLines(review.actionItemsText || review.tomorrowAction || review.startStopContinue || ''),
    focusScore: review.focusScore ? safeNumber(review.focusScore) : '',
    energyScore: review.energyScore ? safeNumber(review.energyScore) : ''
  };
}

function getReviews() {
  return (appState.data.reviews || []).map(normalizeReview).sort((a, b) => String(b.date || '').localeCompare(String(a.date || '')) || String(b.updatedAt || '').localeCompare(String(a.updatedAt || '')));
}

function getReviewQuery() {
  return appState.filters.reviewQuery || '';
}

function getReviewView() {
  return appState.filters.reviews || 'all';
}

function dateInLastDays(dateValue, days) {
  if (!dateValue) return false;
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return false;
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - Number(days || 0));
  return date >= start;
}

function isThisWeek(dateValue) {
  return dateInLastDays(dateValue, 7);
}

function taskDate(task = {}) {
  return String(task.completedAt || task.updatedAt || task.createdAt || task.dueDate || '').slice(0, 10);
}

function getTodayTasks() {
  const today = todayISO();
  return (appState.data.tasks || []).filter(task => task.dueDate === today || taskDate(task) === today);
}

function getWeekTasks() {
  return (appState.data.tasks || []).filter(task => isThisWeek(task.dueDate) || isThisWeek(taskDate(task)));
}

function flattenKnowledgeLessons() {
  const lessons = [];
  (appState.data.knowledge || []).forEach(item => {
    const videos = Array.isArray(item.videos) && item.videos.length ? item.videos : [{ id: item.videoId || item.id, title: item.title, durationSeconds: item.durationSeconds || 0 }];
    videos.forEach(video => {
      const videoId = video.id || item.videoId || item.id;
      const content = item.videoContent?.[videoId] || item.videoContent?.[item.id] || {};
      lessons.push({ item, video, videoId, content, title: video.title || item.title || 'معرفة بدون عنوان' });
    });
  });
  return lessons;
}

function getTodayKnowledge() {
  return flattenKnowledgeLessons().filter(entry => isThisWeek(String(entry.content.updatedAt || entry.item.updatedAt || entry.item.createdAt || '').slice(0, 10)));
}

function getDueDecisions() {
  return (appState.data.decisions || []).filter(decision => decision.reviewDate && isPast(decision.reviewDate) && !decision.actualOutcome);
}

function getCampaignsNeedDecision() {
  return (appState.data.campaigns || []).filter(campaign => {
    const result = calculateCampaign(campaign);
    return result.risk.includes('عالية') || result.expectedProfit < 0 || result.decision.includes('اختبر');
  });
}

function buildDailyDraft() {
  const tasks = getTodayTasks();
  const done = tasks.filter(task => task.status === 'مكتملة');
  const open = tasks.filter(task => task.status !== 'مكتملة');
  const knowledge = getTodayKnowledge().slice(0, 5);
  const campaigns = getCampaignsNeedDecision().slice(0, 3);
  const decisions = getDueDecisions().slice(0, 3);
  const achievements = done.map(task => `تم: ${task.title}`).join('\n');
  const blockers = open.filter(task => task.status === 'مؤجلة' || isPast(task.dueDate)).map(task => `تعطيل/تأخير: ${task.title}`).join('\n');
  const lesson = knowledge[0] ? `من المعرفة: ${knowledge[0].title}` : '';
  const tomorrowAction = [
    open[0]?.title ? `أنهي: ${open[0].title}` : '',
    campaigns[0]?.productName ? `احسم حملة: ${campaigns[0].productName}` : '',
    decisions[0]?.title ? `راجع قرار: ${decisions[0].title}` : ''
  ].filter(Boolean).join('\n');
  return {
    type: 'يومية',
    date: todayISO(),
    achievements,
    blockers,
    lesson,
    tomorrowAction,
    focusScore: 7,
    energyScore: 7,
    actionItems: parseLines(tomorrowAction),
    autoSummary: `مهام اليوم: ${tasks.length} — مكتمل: ${done.length} — مفتوح: ${open.length} — معرفة حديثة: ${knowledge.length} — قرارات مستحقة: ${decisions.length}.`
  };
}

function buildWeeklyDraft() {
  const tasks = getWeekTasks();
  const done = tasks.filter(task => task.status === 'مكتملة');
  const overdue = tasks.filter(task => task.status !== 'مكتملة' && isPast(task.dueDate));
  const knowledge = flattenKnowledgeLessons().filter(entry => isThisWeek(String(entry.content.updatedAt || entry.item.updatedAt || entry.item.createdAt || '').slice(0, 10)));
  const campaigns = (appState.data.campaigns || []).filter(c => isThisWeek(String(c.updatedAt || c.createdAt || '').slice(0, 10)));
  const decisions = getDueDecisions();
  const wins = (appState.data.wins || []).filter(win => isThisWeek(win.date || String(win.createdAt || '').slice(0, 10)));
  const projects = appState.data.projects || [];
  const bestProject = projects.slice().sort((a, b) => safeNumber(b.progress) - safeNumber(a.progress))[0];
  const rescueProject = projects.find(project => project.targetDate && isPast(project.targetDate) && safeNumber(project.progress) < 100) || projects.find(project => project.status !== 'مكتملة' && safeNumber(project.progress) < 35);
  const startStopContinue = [
    overdue[0]?.title ? `أوقف ترك مهمة متأخرة بدون قرار: ${overdue[0].title}` : '',
    knowledge.find(k => parseLines(k.content.extractedActions || '').length)?.title ? `ابدأ تحويل معرفة إلى تنفيذ: ${knowledge.find(k => parseLines(k.content.extractedActions || '').length)?.title}` : '',
    done[0]?.title ? `استمر في نمط التنفيذ الذي أنهى: ${done[0].title}` : ''
  ].filter(Boolean).join('\n');
  return {
    type: 'أسبوعية',
    date: todayISO(),
    weekWins: done.slice(0, 8).map(task => `أنجزت: ${task.title}`).concat(wins.slice(0, 5).map(win => `فوز: ${win.title}`)).join('\n'),
    weekProblems: overdue.slice(0, 8).map(task => `متأخر: ${task.title}`).join('\n'),
    weekLearned: knowledge.slice(0, 6).map(entry => `تعلمت/راجعت: ${entry.title}`).join('\n'),
    bestProject: bestProject?.title || '',
    rescueProject: rescueProject?.title || '',
    startStopContinue,
    actionItems: parseLines(startStopContinue).concat(decisions.slice(0, 3).map(d => `راجع القرار: ${d.title}`), campaigns.slice(0, 3).map(c => `راجع نتيجة حملة: ${c.productName}`)),
    autoSummary: `آخر 7 أيام: مهام ${tasks.length} — مكتمل ${done.length} — متأخر ${overdue.length} — معرفة ${knowledge.length} — حملات ${campaigns.length} — قرارات للمراجعة ${decisions.length}.`
  };
}

function reviewStats() {
  const reviews = getReviews();
  const daily = reviews.filter(r => r.type === 'يومية');
  const weekly = reviews.filter(r => r.type === 'أسبوعية');
  const withActions = reviews.filter(r => r.actionItems?.length);
  const lowFocus = daily.filter(r => safeNumber(r.focusScore) && safeNumber(r.focusScore) <= 5);
  const avgFocus = daily.length ? Math.round(daily.reduce((sum, r) => sum + safeNumber(r.focusScore), 0) / daily.length) : 0;
  const avgEnergy = daily.length ? Math.round(daily.reduce((sum, r) => sum + safeNumber(r.energyScore), 0) / daily.length) : 0;
  const thisWeekDone = getWeekTasks().filter(task => task.status === 'مكتملة').length;
  return { reviews, daily, weekly, withActions, lowFocus, avgFocus, avgEnergy, thisWeekDone };
}

function reviewMatches(review) {
  const view = getReviewView();
  if (view === 'daily' && review.type !== 'يومية') return false;
  if (view === 'weekly' && review.type !== 'أسبوعية') return false;
  if (view === 'needs-action' && !review.actionItems?.length && !review.tomorrowAction && !review.startStopContinue) return false;
  if (view === 'low-focus' && safeNumber(review.focusScore) > 5) return false;
  if (view === 'high-value' && !review.autoSummary && !review.weekWins && !review.achievements && !review.actionItems?.length) return false;
  const query = getReviewQuery().trim().toLowerCase();
  if (!query) return true;
  return [review.title, review.type, review.date, review.achievements, review.blockers, review.lesson, review.tomorrowAction, review.weekWins, review.weekProblems, review.weekLearned, review.bestProject, review.rescueProject, review.startStopContinue, review.autoSummary]
    .concat(review.actionItems || [])
    .join(' ')
    .toLowerCase()
    .includes(query);
}

function renderStats() {
  const stats = reviewStats();
  return `<div class="review-intel-grid">
    <article class="kpi-card"><small>كل المراجعات</small><strong>${safeText(stats.reviews.length)}</strong></article>
    <article class="kpi-card"><small>يومية</small><strong>${safeText(stats.daily.length)}</strong></article>
    <article class="kpi-card"><small>أسبوعية</small><strong>${safeText(stats.weekly.length)}</strong></article>
    <article class="kpi-card"><small>أفعال مستخرجة</small><strong>${safeText(stats.withActions.reduce((sum, r) => sum + (r.actionItems?.length || 0), 0))}</strong></article>
    <article class="kpi-card"><small>متوسط التركيز</small><strong>${safeText(stats.avgFocus || '-')}</strong></article>
    <article class="kpi-card"><small>إنجاز الأسبوع</small><strong>${safeText(stats.thisWeekDone)}</strong></article>
  </div>`;
}

function renderToolbar() {
  return `<div class="review-toolbar card compact">
    <div class="filters">${reviewViews.map(([value, label]) => `<button class="filter-btn ${getReviewView() === value ? 'active' : ''}" data-action="set-review-filter" data-filter="${safeText(value)}">${safeText(label)}</button>`).join('')}</div>
    <input class="review-search" data-action="review-search" value="${safeText(getReviewQuery())}" placeholder="ابحث في المراجعات، الدروس، المعطلات، الأفعال...">
  </div>`;
}

function renderSmartDigest() {
  const dailyDraft = buildDailyDraft();
  const weeklyDraft = buildWeeklyDraft();
  const decisions = getDueDecisions();
  const campaigns = getCampaignsNeedDecision();
  const overdue = (appState.data.tasks || []).filter(task => task.status !== 'مكتملة' && isPast(task.dueDate));
  return `<div class="review-digest-grid">
    <article class="card review-digest-card">
      <h3>مراجعة اليوم الذكية</h3>
      <p>${safeText(dailyDraft.autoSummary)}</p>
      <div class="btn-row"><button class="btn primary" data-action="create-daily-review">افتح مراجعة اليوم</button></div>
    </article>
    <article class="card review-digest-card">
      <h3>مراجعة الأسبوع الذكية</h3>
      <p>${safeText(weeklyDraft.autoSummary)}</p>
      <div class="btn-row"><button class="btn ghost" data-action="create-weekly-review">افتح مراجعة الأسبوع</button></div>
    </article>
    <article class="card review-digest-card">
      <h3>ما يحتاج انتباه</h3>
      <div class="review-alert-list">
        <span>${safeText(overdue.length)} مهام متأخرة</span>
        <span>${safeText(decisions.length)} قرارات تحتاج مراجعة</span>
        <span>${safeText(campaigns.length)} حملات تحتاج قرار</span>
      </div>
    </article>
  </div>`;
}

export function renderReviews(){
  const actions = '<button class="btn primary" data-action="create-daily-review">مراجعة اليوم الذكية</button><button class="btn ghost" data-action="create-weekly-review">مراجعة الأسبوع الذكية</button><button class="btn ghost" data-action="open-review-modal" data-type="daily">مراجعة فارغة</button>';
  const reviews = getReviews().filter(reviewMatches);
  return `<section class="page review-system">${pageHeader('المراجعات', 'Review & Reflection Pro — مراجعات تسحب من المهام والمعرفة والحملات والقرارات وتحولها لتنفيذ.', actions)}${renderStats()}${renderSmartDigest()}${renderToolbar()}<div class="grid grid-2">${reviews.length ? reviews.map(card).join('') : emptyState('لا توجد مراجعات مطابقة', 'اكتب مراجعة ذكية أو غيّر الفلتر الحالي.', actions)}</div></section>`;
}

function card(item){
  const review = normalizeReview(item);
  const actions = `<button class="btn primary" data-action="review-to-tasks" data-id="${safeText(review.id)}">حوّل لأفعال</button>`;
  const mainText = review.type === 'أسبوعية'
    ? (review.weekLearned || review.weekWins || 'مراجعة أسبوعية بدون تفاصيل')
    : (review.lesson || review.achievements || 'مراجعة يومية بدون تفاصيل');
  return simpleCard('review', review, `<p>${safeText(mainText)}</p>
    ${review.autoSummary ? `<p class="meta">${safeText(review.autoSummary)}</p>` : ''}
    <div class="meta"><span>${safeText(review.type)}</span><span>${safeText(formatDate(review.date))}</span><span>تركيز: ${safeText(review.focusScore || '-')}/10</span><span>طاقة: ${safeText(review.energyScore || '-')}/10</span></div>
    ${renderActionItems(review)}
    ${renderReviewSnapshot(review)}`, actions);
}

function renderActionItems(review) {
  const items = review.actionItems || [];
  if (!items.length) return '<p class="meta">لا توجد أفعال مستخرجة بعد.</p>';
  return `<div class="review-actions-list"><b>أفعال المراجعة</b>${items.slice(0, 6).map(item => `<span>${safeText(item)}</span>`).join('')}</div>`;
}

function renderReviewSnapshot(review) {
  const snapshot = review.snapshot || {};
  const entries = [
    snapshot.tasksDone ? `مهام مكتملة: ${snapshot.tasksDone}` : '',
    snapshot.tasksOpen ? `مهام مفتوحة: ${snapshot.tasksOpen}` : '',
    snapshot.knowledgeTouched ? `معرفة: ${snapshot.knowledgeTouched}` : '',
    snapshot.campaignsNeedDecision ? `حملات تحتاج قرار: ${snapshot.campaignsNeedDecision}` : '',
    snapshot.decisionsDue ? `قرارات مستحقة: ${snapshot.decisionsDue}` : ''
  ].filter(Boolean);
  return entries.length ? `<div class="review-snapshot">${entries.map(x => `<span>${safeText(x)}</span>`).join('')}</div>` : '';
}

export function openReviewModal(id='', type='daily', defaults = {}){
  const found = appState.data.reviews.find(x=>x.id===id);
  const item = normalizeReview(found || { type: type === 'weekly' || type === 'أسبوعية' ? 'أسبوعية' : 'يومية', date: todayISO(), ...defaults });
  openModal({title:item.id?'تعديل مراجعة':'إضافة مراجعة',saveText:'حفظ',size:'wide',body:form(item),onSave:saveReview});
}

function form(item){
  const weekly = item.type === 'أسبوعية';
  const actionText = (item.actionItems || []).join('\n');
  return `<form id="entityForm" class="form-grid review-form">
    <input type="hidden" name="id" value="${safeText(item.id||'')}">
    <label>النوع<select name="type"><option ${item.type==='يومية'?'selected':''}>يومية</option><option ${item.type==='أسبوعية'?'selected':''}>أسبوعية</option></select></label>
    <label>التاريخ<input type="date" name="date" value="${safeText(item.date||todayISO())}"></label>
    ${item.autoSummary ? `<label class="full">ملخص تلقائي<textarea name="autoSummary">${safeText(item.autoSummary || '')}</textarea></label>` : '<input type="hidden" name="autoSummary" value="">'}
    ${weekly ? weeklyFields(item) : dailyFields(item)}
    <label class="full">أفعال الأسبوع/اليوم القادم — كل فعل في سطر<textarea name="actionItemsText" placeholder="اكتب أفعال واضحة تتحول لمهام">${safeText(actionText)}</textarea></label>
  </form>`;
}

function dailyFields(item) {
  return `<label class="full">إنجازات اليوم<textarea name="achievements">${safeText(item.achievements||'')}</textarea></label>
    <label class="full">ما الذي عطّلني؟<textarea name="blockers">${safeText(item.blockers||'')}</textarea></label>
    <label class="full">أهم درس<textarea name="lesson">${safeText(item.lesson||'')}</textarea></label>
    <label class="full">أهم إجراء غدًا<textarea name="tomorrowAction">${safeText(item.tomorrowAction||'')}</textarea></label>
    <label>تقييم التركيز<input type="number" min="1" max="10" name="focusScore" value="${safeText(item.focusScore||5)}"></label>
    <label>تقييم الطاقة<input type="number" min="1" max="10" name="energyScore" value="${safeText(item.energyScore||5)}"></label>`;
}

function weeklyFields(item) {
  return `<label class="full">أهم إنجازات الأسبوع<textarea name="weekWins">${safeText(item.weekWins||'')}</textarea></label>
    <label class="full">أهم مشاكل الأسبوع<textarea name="weekProblems">${safeText(item.weekProblems||'')}</textarea></label>
    <label class="full">ماذا تعلمت؟<textarea name="weekLearned">${safeText(item.weekLearned||'')}</textarea></label>
    <label>أفضل مشروع<input name="bestProject" value="${safeText(item.bestProject||'')}"></label>
    <label>مشروع يحتاج إنقاذ<input name="rescueProject" value="${safeText(item.rescueProject||'')}"></label>
    <label class="full">أوقف / أبدأ / أستمر<textarea name="startStopContinue">${safeText(item.startStopContinue||'')}</textarea></label>`;
}

function buildSnapshot(type) {
  const tasks = type === 'أسبوعية' ? getWeekTasks() : getTodayTasks();
  const knowledge = type === 'أسبوعية' ? flattenKnowledgeLessons().filter(entry => isThisWeek(String(entry.content.updatedAt || entry.item.updatedAt || entry.item.createdAt || '').slice(0, 10))) : getTodayKnowledge();
  return {
    tasksTotal: tasks.length,
    tasksDone: tasks.filter(t => t.status === 'مكتملة').length,
    tasksOpen: tasks.filter(t => t.status !== 'مكتملة').length,
    knowledgeTouched: knowledge.length,
    decisionsDue: getDueDecisions().length,
    campaignsNeedDecision: getCampaignsNeedDecision().length,
    createdAt: new Date().toISOString()
  };
}

function saveReview(){
  const formEl=document.getElementById('entityForm');
  if(!formEl.reportValidity()) return;
  const d=objectFromForm(formEl);
  const actionItems = parseLines(d.actionItemsText || d.tomorrowAction || d.startStopContinue || '');
  const review = {
    ...d,
    id:d.id||generateId('review'),
    title:`مراجعة ${d.type} - ${d.date}`,
    actionItems,
    snapshot: buildSnapshot(d.type)
  };
  delete review.actionItemsText;
  upsert('reviews', review);
  closeModal();
  toast('تم حفظ المراجعة');
}

export function createDailyReview() {
  openReviewModal('', 'daily', buildDailyDraft());
}

export function createWeeklyReview() {
  openReviewModal('', 'weekly', buildWeeklyDraft());
}

export function reviewToTasks(id) {
  const review = normalizeReview(appState.data.reviews.find(x => x.id === id));
  if (!review?.id) return;
  const actions = review.actionItems?.length ? review.actionItems : parseLines(review.tomorrowAction || review.startStopContinue || '');
  if (!actions.length) { toast('لا توجد أفعال واضحة داخل هذه المراجعة', 'warning'); return; }
  const now = new Date().toISOString();
  actions.forEach(title => {
    appState.data.tasks.unshift({
      id: generateId('task'),
      title,
      description: `من مراجعة: ${review.title || review.date}`,
      type: 'إجراء سريع',
      source: 'مراجعة',
      priority: 'متوسطة',
      status: 'مفتوحة',
      dueDate: todayISO(),
      dueTime: '',
      reminder: '',
      repeat: '',
      notes: '',
      createdAt: now,
      updatedAt: now,
      completedAt: ''
    });
  });
  const index = appState.data.reviews.findIndex(x => x.id === id);
  if (index >= 0) appState.data.reviews[index] = { ...appState.data.reviews[index], convertedToTasksAt: now, updatedAt: now };
  autoSave();
  renderPage();
  toast(`تم تحويل ${actions.length} فعل إلى مهام`);
}

export function setReviewFilter(filter) { appState.filters.reviews = filter || 'all'; renderPage(); }
export function setReviewSearch(query = '') { appState.filters.reviewQuery = query || ''; renderPage(); }
export function editReview(id){ openReviewModal(id); }
export function deleteReview(id){ removeItem('reviews',id); }
