import { appState, setFilter } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, statusBadge, toast } from '../ui.js';
import { addDaysISO, calculatePercentage, formatDate, generateId, isPast, parseLines, raw, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, upsert } from './shared.js';
import { renderPage } from '../router.js';

const decisionTypes = ['استراتيجي','تشغيلي','مالي','تسويقي','تعلم','شخصي','إيقاف/استمرار'];
const decisionFilters = [
  ['all','الكل'], ['needs-review','تحتاج مراجعة'], ['reviewed','تمت المراجعة'], ['good','قرارات جيدة'], ['risky','عالية المخاطرة'], ['upcoming','قادمة']
];
const decisionScores = ['غير محدد','نعم','لا','جزئيًا'];

function normalizeDecision(item = {}) {
  return {
    ...item,
    title: item.title || 'قرار بدون عنوان',
    type: item.type || item.decisionType || 'استراتيجي',
    context: item.context || '',
    options: item.options || '',
    finalDecision: item.finalDecision || '',
    reason: item.reason || '',
    risks: item.risks || '',
    expectedOutcome: item.expectedOutcome || '',
    actualOutcome: item.actualOutcome || '',
    wasGoodDecision: item.wasGoodDecision || 'غير محدد',
    reviewDate: item.reviewDate || '',
    confidence: safeNumber(item.confidence, 5),
    impact: item.impact || 'متوسط',
    costOfDelay: item.costOfDelay || '',
    decisionActions: Array.isArray(item.decisionActions) ? item.decisionActions : parseLines(item.decisionActionsText || item.actions || ''),
    linkedGoalId: item.linkedGoalId || item.goalId || '',
    linkedProjectId: item.linkedProjectId || item.projectId || '',
    reviewedAt: item.reviewedAt || '',
    convertedToTasksAt: item.convertedToTasksAt || ''
  };
}

function decisionDate(value) {
  const d = value ? new Date(value) : new Date();
  return Number.isNaN(d.getTime()) ? new Date() : d;
}
function needsReview(decision) { return decision.reviewDate && isPast(decision.reviewDate) && !decision.actualOutcome; }
function upcomingReview(decision) { return decision.reviewDate && decision.reviewDate >= todayISO() && !decision.actualOutcome; }
function isRisky(decision) { return decision.impact === 'عالي' || safeNumber(decision.confidence, 5) <= 4 || raw(decision.risks).length > 80; }
function getAllDecisions() { return (appState.data.decisions || []).map(normalizeDecision); }
function getDecisionQuery() { return appState.filters.decisionQuery || ''; }
function linkedTitle(collection, id) { return id ? (appState.data[collection]?.find(x => x.id === id)?.title || 'غير موجود') : 'بدون ربط'; }

function decisionSearchText(decision) {
  return [decision.title, decision.type, decision.context, decision.options, decision.finalDecision, decision.reason, decision.risks, decision.expectedOutcome, decision.actualOutcome, decision.impact, decision.wasGoodDecision, linkedTitle('goals', decision.linkedGoalId), linkedTitle('projects', decision.linkedProjectId), ...(decision.decisionActions || [])].join(' ').toLowerCase();
}

function filterDecisions(items) {
  const filter = appState.filters.decisions || 'all';
  const query = getDecisionQuery().toLowerCase();
  return items.filter(decision => {
    const byFilter = filter === 'needs-review' ? needsReview(decision)
      : filter === 'reviewed' ? Boolean(decision.actualOutcome || decision.reviewedAt)
      : filter === 'good' ? decision.wasGoodDecision === 'نعم'
      : filter === 'risky' ? isRisky(decision)
      : filter === 'upcoming' ? upcomingReview(decision)
      : true;
    return byFilter && (!query || decisionSearchText(decision).includes(query));
  }).sort((a,b) => decisionDate(b.updatedAt || b.createdAt) - decisionDate(a.updatedAt || a.createdAt));
}

function getDecisionStats() {
  const decisions = getAllDecisions();
  const reviewed = decisions.filter(d => d.actualOutcome || d.reviewedAt);
  const good = decisions.filter(d => d.wasGoodDecision === 'نعم');
  const partial = decisions.filter(d => d.wasGoodDecision === 'جزئيًا');
  const overdue = decisions.filter(needsReview);
  const risky = decisions.filter(isRisky);
  const converted = decisions.filter(d => d.convertedToTasksAt);
  return {
    total: decisions.length,
    reviewed: reviewed.length,
    good: good.length,
    partial: partial.length,
    overdue: overdue.length,
    risky: risky.length,
    upcoming: decisions.filter(upcomingReview).length,
    converted: converted.length,
    quality: calculatePercentage(good.length + partial.length * 0.5, reviewed.length)
  };
}

function renderDecisionStats() {
  const s = getDecisionStats();
  return `<div class="decision-intel-grid">
    <article class="kpi-card"><small>كل القرارات</small><strong>${safeText(s.total)}</strong></article>
    <article class="kpi-card"><small>تحتاج مراجعة</small><strong>${safeText(s.overdue)}</strong></article>
    <article class="kpi-card"><small>تمت المراجعة</small><strong>${safeText(s.reviewed)}</strong></article>
    <article class="kpi-card"><small>جودة القرار</small><strong>${safeText(s.quality)}%</strong></article>
    <article class="kpi-card"><small>عالية المخاطرة</small><strong>${safeText(s.risky)}</strong></article>
    <article class="kpi-card"><small>تحولت لأفعال</small><strong>${safeText(s.converted)}</strong></article>
  </div>`;
}

function renderDecisionToolbar() {
  const active = appState.filters.decisions || 'all';
  return `<div class="card compact decision-toolbar">
    <div class="filters">${decisionFilters.map(([value, label]) => `<button class="filter-btn ${active === value ? 'active' : ''}" data-action="set-decision-filter" data-filter="${value}">${label}</button>`).join('')}</div>
    <input data-action="decision-search" value="${safeText(getDecisionQuery())}" placeholder="ابحث في القرار، السياق، السبب، المخاطر، النتيجة...">
  </div>`;
}

function relationBadges(decision) {
  const badges = [];
  if (decision.linkedGoalId) badges.push(`هدف: ${linkedTitle('goals', decision.linkedGoalId)}`);
  if (decision.linkedProjectId) badges.push(`مشروع: ${linkedTitle('projects', decision.linkedProjectId)}`);
  return badges.length ? `<div class="meta">${badges.map(x => `<span>${safeText(x)}</span>`).join('')}</div>` : '';
}

function decisionCard(item) {
  const decision = normalizeDecision(item);
  const reviewState = needsReview(decision) ? '<span class="badge danger">تحتاج مراجعة الآن</span>' : decision.actualOutcome ? '<span class="badge success">تمت المراجعة</span>' : upcomingReview(decision) ? '<span class="badge warning">مراجعة قادمة</span>' : '<span class="badge">بدون مراجعة</span>';
  const risk = isRisky(decision) ? '<span class="badge danger">مخاطرة عالية</span>' : '<span class="badge success">مخاطرة مقبولة</span>';
  const actions = (decision.decisionActions || []).slice(0, 4);
  return `<article class="card item-card decision-card">
    <div class="btn-row">${statusBadge(decision.type)}${reviewState}${risk}<span class="badge">ثقة ${safeText(decision.confidence)}/10</span></div>
    <h3>${safeText(decision.title)}</h3>
    <p>${safeText(decision.finalDecision || decision.context || 'بدون تفاصيل')}</p>
    <div class="decision-score-row">
      <span>التأثير: ${safeText(decision.impact)}</span>
      <span>المراجعة: ${safeText(decision.reviewDate || 'غير محدد')}</span>
      <span>الحكم: ${safeText(decision.wasGoodDecision || 'غير محدد')}</span>
    </div>
    ${relationBadges(decision)}
    ${actions.length ? `<div class="mini-list"><b>أفعال القرار</b>${actions.map(a => `<span>${safeText(a)}</span>`).join('')}</div>` : ''}
    ${decision.actualOutcome ? `<div class="recommendation"><b>نتيجة المراجعة:</b> ${safeText(decision.actualOutcome)}</div>` : ''}
    <div class="btn-row">
      <button class="btn primary" data-action="review-decision" data-id="${safeText(decision.id)}">مراجعة</button>
      <button class="btn ghost" data-action="decision-to-tasks" data-id="${safeText(decision.id)}">حوّل لأفعال</button>
      <button class="btn ghost" data-action="edit-decision" data-id="${safeText(decision.id)}">تعديل</button>
      <button class="btn danger" data-action="delete-decision" data-id="${safeText(decision.id)}">حذف</button>
    </div>
  </article>`;
}

function renderDecisionReviewQueue(decisions) {
  const queue = decisions.filter(needsReview).slice(0, 4);
  if (!queue.length) return '';
  return `<article class="card decision-queue"><h3>قرارات تحتاج مراجعة</h3><p class="meta">ابدأ بمراجعة قرار واحد فقط واكتب النتيجة الفعلية.</p><div class="today-list">${queue.map(d => `<div class="today-task"><div><b>${safeText(d.title)}</b><div class="meta"><span>${safeText(d.reviewDate)}</span><span>${safeText(d.finalDecision || 'بدون قرار نهائي')}</span></div></div><button class="btn primary" data-action="review-decision" data-id="${safeText(d.id)}">راجع</button></div>`).join('')}</div></article>`;
}

export function renderDecisions() {
  const actions = '<button class="btn primary" data-action="open-decision-modal">إضافة قرار</button>';
  const all = getAllDecisions();
  const decisions = filterDecisions(all);
  return `<section class="page decisions-pro">${pageHeader('القرارات', 'Decision Journal ذكي: قرار، سبب، مخاطر، مراجعة، وتحويل لأفعال.', actions)}
    ${renderDecisionStats()}
    ${renderDecisionToolbar()}
    ${renderDecisionReviewQueue(all)}
    <div class="grid grid-2">${decisions.length ? decisions.map(decisionCard).join('') : emptyState('لا توجد قرارات بهذا الفلتر', 'سجل قرارًا مهمًا أو غيّر الفلتر الحالي.', actions)}</div>
  </section>`;
}

function form(item = {}) {
  const d = normalizeDecision(item);
  return `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(d.id || '')}">
    <label>عنوان القرار<input name="title" required value="${safeText(d.title || '')}" placeholder="مثال: هل أبدأ حملة المنتج الآن؟"></label>
    <label>نوع القرار<select name="type">${decisionTypes.map(v => `<option ${v === d.type ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>تاريخ المراجعة<input type="date" name="reviewDate" value="${safeText(d.reviewDate || addDaysISO(7))}"></label>
    <label>التأثير<select name="impact">${['منخفض','متوسط','عالي'].map(v => `<option ${v === d.impact ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>درجة الثقة 1-10<input type="number" min="1" max="10" name="confidence" value="${safeText(d.confidence || 5)}"></label>
    <label>تكلفة التأخير<input name="costOfDelay" value="${safeText(d.costOfDelay || '')}" placeholder="ماذا يحدث لو أجلت القرار؟"></label>
    <label class="full">السياق<textarea name="context" placeholder="ما الموقف؟ ما المعطيات المهمة؟">${safeText(d.context || '')}</textarea></label>
    <label class="full">الاختيارات — كل اختيار في سطر<textarea name="options" placeholder="اختيار 1\nاختيار 2\nاختيار 3">${safeText(d.options || '')}</textarea></label>
    <label class="full">القرار النهائي<textarea name="finalDecision" placeholder="ما القرار الذي ستنفذه؟">${safeText(d.finalDecision || '')}</textarea></label>
    <label class="full">لماذا هذا القرار؟<textarea name="reason" placeholder="اكتب السبب والمنطق وراء القرار">${safeText(d.reason || '')}</textarea></label>
    <label class="full">المخاطر وكيف ستقللها<textarea name="risks" placeholder="ما أسوأ ما قد يحدث؟ وكيف تقلل الخطر؟">${safeText(d.risks || '')}</textarea></label>
    <label class="full">النتيجة المتوقعة<textarea name="expectedOutcome" placeholder="ما الذي تتوقع حدوثه؟ وكيف ستقيس النجاح؟">${safeText(d.expectedOutcome || '')}</textarea></label>
    ${linkedFields({ goalId: d.linkedGoalId, projectId: d.linkedProjectId })}
    <label class="full">أفعال ناتجة من القرار — كل فعل في سطر<textarea name="decisionActionsText" placeholder="نفذ أول خطوة\nراجع النتيجة بعد 3 أيام\nاكتب قرار الاستمرار">${safeText((d.decisionActions || []).join('\n'))}</textarea></label>
    <label class="full">النتيجة الفعلية بعد المراجعة<textarea name="actualOutcome" placeholder="ما الذي حدث فعليًا؟">${safeText(d.actualOutcome || '')}</textarea></label>
    <label>هل كان قرارًا جيدًا؟<select name="wasGoodDecision">${decisionScores.map(v => `<option ${v === d.wasGoodDecision ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
  </form>`;
}

function mapDecision(data, existing = {}) {
  const actions = parseLines(data.decisionActionsText);
  const actualOutcome = raw(data.actualOutcome);
  return {
    ...existing,
    id: data.id || generateId('decision'),
    title: raw(data.title),
    type: raw(data.type),
    context: raw(data.context),
    options: raw(data.options),
    finalDecision: raw(data.finalDecision),
    reason: raw(data.reason),
    risks: raw(data.risks),
    expectedOutcome: raw(data.expectedOutcome),
    reviewDate: raw(data.reviewDate),
    actualOutcome,
    wasGoodDecision: raw(data.wasGoodDecision),
    confidence: safeNumber(data.confidence, 5),
    impact: raw(data.impact),
    costOfDelay: raw(data.costOfDelay),
    decisionActions: actions,
    linkedGoalId: raw(data.goalId),
    linkedProjectId: raw(data.projectId),
    reviewedAt: actualOutcome ? (existing.reviewedAt || new Date().toISOString()) : ''
  };
}

export function openDecisionModal(id = '') {
  const item = appState.data.decisions.find(x => x.id === id) || {};
  openModal({ title: item.id ? 'تعديل قرار' : 'إضافة قرار', saveText: 'حفظ', body: form(item), size: 'wide', onSave: saveDecision });
}

function saveDecision() {
  const formEl = document.getElementById('entityForm');
  if (!formEl.reportValidity()) return;
  const data = objectFromForm(formEl);
  const existing = appState.data.decisions.find(x => x.id === data.id) || {};
  upsert('decisions', mapDecision(data, existing));
  closeModal();
  toast('تم حفظ القرار');
}

export function reviewDecision(id) { openDecisionModal(id); }
export function editDecision(id) { openDecisionModal(id); }
export function deleteDecision(id) { removeItem('decisions', id); }
export function setDecisionFilter(filter) { setFilter('decisions', filter || 'all'); renderPage(); }
export function setDecisionSearch(query = '') { appState.filters.decisionQuery = query; renderPage(); }

export function decisionToTasks(id) {
  const decision = normalizeDecision(appState.data.decisions.find(d => d.id === id));
  if (!decision.id) return;
  const actions = decision.decisionActions?.length ? decision.decisionActions : parseLines(decision.finalDecision || decision.expectedOutcome || decision.reason);
  const items = actions.length ? actions : [`نفّذ قرار: ${decision.title}`];
  const now = new Date().toISOString();
  items.slice(0, 8).forEach((title, index) => {
    appState.data.tasks.unshift({
      id: generateId('task'),
      title,
      description: `مهمة ناتجة من قرار: ${decision.title}`,
      source: 'قرار',
      type: index === 0 ? 'إجراء سريع' : 'مهمة',
      priority: decision.impact === 'عالي' ? 'عالية' : 'متوسطة',
      status: 'مفتوحة',
      dueDate: index === 0 ? todayISO() : addDaysISO(index),
      dueTime: '',
      goalId: decision.linkedGoalId,
      projectId: decision.linkedProjectId,
      notes: decision.reason,
      createdAt: now,
      updatedAt: now
    });
  });
  const index = appState.data.decisions.findIndex(d => d.id === id);
  if (index >= 0) appState.data.decisions[index] = { ...appState.data.decisions[index], convertedToTasksAt: now, updatedAt: now };
  autoSave();
  renderPage();
  toast(`تم تحويل القرار إلى ${items.length} مهمة`);
}
