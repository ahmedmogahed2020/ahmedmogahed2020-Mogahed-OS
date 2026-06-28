import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, generateId, isPast, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { buildCommonForm, openEntityModal, prepareCommonItem, removeItem, simpleCard } from './shared.js';
import { renderPage } from '../router.js';

const goalViews = [
  ['all', 'كل الأهداف'],
  ['active', 'نشطة'],
  ['behind', 'متأخرة'],
  ['strong', 'قوية'],
  ['no-projects', 'بدون مشاريع'],
  ['needs-action', 'تحتاج تنفيذ']
];

function getGoalView() { return appState.filters.goalView || 'all'; }
function getGoalQuery() { return appState.filters.goalQuery || ''; }

function relationForGoal(goal) {
  const projects = appState.data.projects.filter(p => p.goalId === goal.id || (goal.linkedProjects || []).includes(p.id));
  const projectIds = new Set(projects.map(p => p.id));
  const tasks = appState.data.tasks.filter(t => t.goalId === goal.id || projectIds.has(t.projectId));
  const knowledge = appState.data.knowledge.filter(k => {
    if (k.linkedGoalId === goal.id || k.goalId === goal.id) return true;
    return Object.values(k.videoContent || {}).some(content => content?.linkedGoalId === goal.id);
  });
  const decisions = appState.data.decisions.filter(d => d.linkedGoalId === goal.id || d.goalId === goal.id || projectIds.has(d.linkedProjectId || d.projectId));
  const campaigns = appState.data.campaigns.filter(c => c.goalId === goal.id || projectIds.has(c.projectId));
  const wins = appState.data.wins.filter(w => w.linkedGoalId === goal.id || w.goalId === goal.id || projectIds.has(w.linkedProjectId || w.projectId));
  const openTasks = tasks.filter(t => t.status !== 'مكتملة');
  const doneTasks = tasks.filter(t => t.status === 'مكتملة');
  const overdueTasks = openTasks.filter(t => isPast(t.dueDate));
  const progressFromTasks = tasks.length ? calculatePercentage(doneTasks.length, tasks.length) : safeNumber(goal.progress, 0);
  const projectsProgress = projects.length ? Math.round(projects.reduce((sum, p) => sum + projectProgress(p), 0) / projects.length) : 0;
  const healthScore = Math.round((progressFromTasks * .45) + (projectsProgress * .25) + (Math.min(doneTasks.length, 10) * 3) - (overdueTasks.length * 8));
  return {
    projects,
    tasks,
    knowledge,
    decisions,
    campaigns,
    wins,
    openTasks,
    doneTasks,
    overdueTasks,
    progress: Math.max(0, Math.min(100, progressFromTasks)),
    projectsProgress,
    healthScore: Math.max(0, Math.min(100, healthScore))
  };
}

function projectProgress(project) {
  const tasks = appState.data.tasks.filter(t => t.projectId === project.id);
  if (!tasks.length) return safeNumber(project.progress, 0);
  return calculatePercentage(tasks.filter(t => t.status === 'مكتملة').length, tasks.length);
}

function goalMatches(goal, rel) {
  const view = getGoalView();
  const q = getGoalQuery().toLowerCase();
  if (view === 'active' && ['مكتملة', 'متوقفة'].includes(goal.status)) return false;
  if (view === 'behind' && !isGoalBehind(goal, rel)) return false;
  if (view === 'strong' && rel.healthScore < 70) return false;
  if (view === 'no-projects' && rel.projects.length) return false;
  if (view === 'needs-action' && rel.openTasks.length) return false;
  if (!q) return true;
  const haystack = [goal.title, goal.description, goal.reason, goal.notes, goal.status, goal.priority]
    .concat(rel.projects.map(p => p.title))
    .concat(rel.tasks.map(t => t.title))
    .concat(rel.knowledge.map(k => k.title))
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function isGoalBehind(goal, rel) {
  if (goal.status === 'مكتملة') return false;
  if (rel.overdueTasks.length) return true;
  if (isPast(goal.targetDate) && rel.progress < 100) return true;
  return false;
}

function goalStats(goals) {
  const mapped = goals.map(goal => ({ goal, rel: relationForGoal(goal) }));
  return {
    total: goals.length,
    active: goals.filter(g => !['مكتملة', 'متوقفة'].includes(g.status)).length,
    behind: mapped.filter(x => isGoalBehind(x.goal, x.rel)).length,
    noProjects: mapped.filter(x => !x.rel.projects.length).length,
    avgProgress: goals.length ? Math.round(mapped.reduce((sum, x) => sum + x.rel.progress, 0) / goals.length) : 0,
    linkedTasks: mapped.reduce((sum, x) => sum + x.rel.tasks.length, 0)
  };
}

function renderGoalStats() {
  const s = goalStats(appState.data.goals || []);
  return `<div class="goal-intel-grid">
    <article class="kpi-card"><small>كل الأهداف</small><strong>${safeText(s.total)}</strong></article>
    <article class="kpi-card"><small>نشطة</small><strong>${safeText(s.active)}</strong></article>
    <article class="kpi-card"><small>متأخرة</small><strong>${safeText(s.behind)}</strong></article>
    <article class="kpi-card"><small>بدون مشاريع</small><strong>${safeText(s.noProjects)}</strong></article>
    <article class="kpi-card"><small>متوسط التقدم</small><strong>${safeText(s.avgProgress)}%</strong></article>
    <article class="kpi-card"><small>مهام مرتبطة</small><strong>${safeText(s.linkedTasks)}</strong></article>
  </div>`;
}

function renderGoalToolbar() {
  return `<div class="goal-toolbar card compact">
    <div class="filters">${goalViews.map(([value, label]) => `<button class="filter-btn ${getGoalView() === value ? 'active' : ''}" data-action="set-goal-filter" data-filter="${value}">${label}</button>`).join('')}</div>
    <input class="goal-search" data-action="goal-search" value="${safeText(getGoalQuery())}" placeholder="ابحث في الأهداف أو المشاريع أو المهام المرتبطة...">
  </div>`;
}

export function renderGoals() {
  const actions = '<button class="btn primary" data-action="open-goal-modal">إضافة هدف</button>';
  const mapped = (appState.data.goals || []).map(goal => ({ goal, rel: relationForGoal(goal) })).filter(x => goalMatches(x.goal, x.rel));
  return `<section class="page goal-system">${pageHeader('الأهداف', 'خريطة الأهداف الذكية: كل هدف يظهر معه المشاريع والمهام والمعرفة والقرارات المرتبطة.', actions)}
    ${renderGoalStats()}
    ${renderGoalToolbar()}
    <div class="grid grid-2" id="goalsList">${mapped.length ? mapped.map(({ goal, rel }) => goalCard(goal, rel)).join('') : emptyState('لا توجد أهداف مطابقة', 'أنشئ هدفًا أو غيّر الفلتر الحالي.', actions)}</div>
  </section>`;
}

function goalCard(goal, rel = relationForGoal(goal)) {
  const behind = isGoalBehind(goal, rel);
  const extra = `<button class="btn ghost" data-action="view-goal" data-id="${safeText(goal.id)}">عرض الذكاء</button><button class="btn ghost" data-action="goal-to-projects" data-id="${safeText(goal.id)}">حوّل لخطة</button>`;
  return simpleCard('goal', goal, `<p>${safeText(goal.description || 'بدون وصف')}</p>
    <div class="goal-health-card ${behind ? 'is-behind' : ''}">
      <div><small>صحة الهدف</small><strong>${safeText(rel.healthScore)}%</strong></div>
      <div class="progress"><span style="width:${safeText(rel.healthScore)}%"></span></div>
      <p>${behind ? 'الهدف يحتاج إنقاذ أو إعادة جدولة.' : rel.healthScore >= 70 ? 'الهدف يتحرك بشكل جيد.' : 'الهدف يحتاج أفعال أو مشاريع أوضح.'}</p>
    </div>
    <div class="meta"><span>السبب: ${safeText(goal.reason || 'غير محدد')}</span><span>مشاريع: ${safeText(rel.projects.length)}</span><span>مهام: ${safeText(rel.tasks.length)}</span><span>معرفة: ${safeText(rel.knowledge.length)}</span><span>قرارات: ${safeText(rel.decisions.length)}</span></div>
    <div class="progress"><span style="width:${safeText(rel.progress)}%"></span></div>
    <div class="goal-relations-strip">${behind ? '<span class="badge danger">يحتاج إنقاذ</span>' : statusBadge('مستقر')}<span class="badge">تقدم ${safeText(rel.progress)}%</span><span class="badge">مفتوح ${safeText(rel.openTasks.length)}</span></div>`, extra);
}

export function openGoalModal(id = '') {
  const item = appState.data.goals.find(x => x.id === id) || {};
  const extra = `<label class="full">لماذا هذا الهدف؟<textarea name="reason">${safeText(item.reason || '')}</textarea></label>`;
  openEntityModal({ collection: 'goals', title: item.id ? 'تعديل هدف' : 'إضافة هدف', item, body: buildCommonForm(item, extra, 'الهدف'), mapData: data => ({ ...prepareCommonItem('goal', data), reason: data.reason, linkedProjects: item.linkedProjects || [] }) });
}

function chips(items, emptyText = 'لا يوجد') {
  return items.length ? items.slice(0, 8).map(item => `<span>${safeText(item.title || item.productName || item.finalDecision || 'عنصر')}</span>`).join('') : `<span>${safeText(emptyText)}</span>`;
}

export function viewGoal(id) {
  const goal = appState.data.goals.find(g => g.id === id);
  if (!goal) return toast('الهدف غير موجود');
  const rel = relationForGoal(goal);
  openModal({ title: `ذكاء الهدف: ${safeText(goal.title)}`, size: 'wide', body: `<div class="entity-intel-modal">
    <div class="entity-hero-card ${isGoalBehind(goal, rel) ? 'is-danger' : ''}">
      <div><small>التقدم المحسوب من المهام</small><h3>${safeText(rel.progress)}%</h3><p>${safeText(goal.reason || goal.description || 'حدد سببًا واضحًا للهدف حتى يكون القرار أسهل.')}</p></div>
      <div class="ring" style="--value:${safeText(rel.healthScore)}"><strong>${safeText(rel.healthScore)}%</strong><span>صحة الهدف</span></div>
    </div>
    <div class="goal-intel-grid">
      <article class="kpi-card"><small>مشاريع</small><strong>${safeText(rel.projects.length)}</strong></article>
      <article class="kpi-card"><small>مهام مفتوحة</small><strong>${safeText(rel.openTasks.length)}</strong></article>
      <article class="kpi-card"><small>مهام متأخرة</small><strong>${safeText(rel.overdueTasks.length)}</strong></article>
      <article class="kpi-card"><small>معرفة</small><strong>${safeText(rel.knowledge.length)}</strong></article>
      <article class="kpi-card"><small>قرارات</small><strong>${safeText(rel.decisions.length)}</strong></article>
      <article class="kpi-card"><small>حملات</small><strong>${safeText(rel.campaigns.length)}</strong></article>
    </div>
    <div class="entity-map-grid">
      <article class="card"><h3>المشاريع المرتبطة</h3><div class="intel-chip-list">${chips(rel.projects, 'لا توجد مشاريع مرتبطة')}</div></article>
      <article class="card"><h3>أهم المهام المفتوحة</h3><div class="intel-chip-list">${chips(rel.openTasks, 'لا توجد مهام مفتوحة')}</div></article>
      <article class="card"><h3>المعرفة الداعمة</h3><div class="intel-chip-list">${chips(rel.knowledge, 'لا توجد معرفة مرتبطة')}</div></article>
      <article class="card"><h3>قرارات وحملات</h3><div class="intel-chip-list">${chips([...rel.decisions, ...rel.campaigns], 'لا توجد قرارات أو حملات')}</div></article>
    </div>
    <div class="recommendation"><b>التوصية:</b> ${goalRecommendation(goal, rel)}</div>
    <div class="btn-row"><button class="btn primary" data-action="goal-to-projects" data-id="${safeText(goal.id)}">حوّل الهدف لخطة مشاريع</button><button class="btn ghost" data-action="goal-to-tasks" data-id="${safeText(goal.id)}">أضف 3 مهام إنقاذ</button></div>
  </div>` });
}

function goalRecommendation(goal, rel) {
  if (!rel.projects.length) return 'ابدأ بإنشاء 3 مشاريع صغيرة تخدم الهدف بدل تركه كعنوان كبير.';
  if (rel.overdueTasks.length) return 'فيه مهام متأخرة. قلل النطاق وحدد مهمة إنقاذ واحدة اليوم.';
  if (!rel.openTasks.length && goal.status !== 'مكتملة') return 'الهدف نشط لكن بدون مهام مفتوحة. أنشئ مهمة تنفيذ واحدة الآن.';
  if (!rel.knowledge.length) return 'اربط معرفة أو فيديو واحد بهذا الهدف حتى يتحول التعلم إلى تنفيذ.';
  return 'استمر، الهدف لديه روابط جيدة. راجع التقدم أسبوعيًا وحوّل المعرفة لأفعال.';
}

export function goalToProjects(id) {
  const goal = appState.data.goals.find(g => g.id === id);
  if (!goal) return toast('الهدف غير موجود');
  const existing = appState.data.projects.filter(p => p.goalId === id).length;
  const baseTitles = parseLines(goal.notes || '').slice(0, 3);
  const titles = baseTitles.length ? baseTitles : ['تأسيس الخطة', 'تنفيذ أول نتيجة ملموسة', 'مراجعة وتحسين'];
  const now = new Date().toISOString();
  const projects = titles.map((title, index) => ({
    id: generateId('project'),
    title: `${title} — ${goal.title}`,
    description: `مشروع مولد من الهدف: ${goal.title}`,
    goalId: goal.id,
    status: index === 0 ? 'قيد التنفيذ' : 'نشط',
    priority: goal.priority || 'متوسطة',
    startDate: todayISO(),
    targetDate: goal.targetDate || '',
    progress: 0,
    notes: goal.reason || goal.description || '',
    createdAt: now,
    updatedAt: now
  }));
  appState.data.projects.unshift(...projects);
  if (!Array.isArray(goal.linkedProjects)) goal.linkedProjects = [];
  goal.linkedProjects = Array.from(new Set([...goal.linkedProjects, ...projects.map(p => p.id)]));
  goal.updatedAt = now;
  autoSave();
  renderPage();
  closeModal();
  toast(existing ? 'تم إضافة مشاريع جديدة للهدف' : 'تم تحويل الهدف إلى خطة مشاريع');
}

export function goalToTasks(id) {
  const goal = appState.data.goals.find(g => g.id === id);
  if (!goal) return toast('الهدف غير موجود');
  const now = new Date().toISOString();
  const tasks = [
    `حدد خطوة واحدة لتحريك هدف: ${goal.title}`,
    `اربط معرفة أو مصدر تعلم بهدف: ${goal.title}`,
    `راجع تقدم هدف: ${goal.title} واكتب قرار الأسبوع`
  ].map((title, index) => ({
    id: generateId('task'), title, description: `مهمة إنقاذ مولدة من هدف: ${goal.title}`, goalId: goal.id, projectId: '', type: index === 0 ? 'إجراء سريع' : 'مهمة', source: 'مراجعة', priority: index === 0 ? 'عالية' : 'متوسطة', status: 'مفتوحة', dueDate: todayISO(), dueTime: '', reminder: '', repeat: '', notes: goal.reason || '', createdAt: now, updatedAt: now
  }));
  appState.data.tasks.unshift(...tasks);
  autoSave(); renderPage(); closeModal(); toast('تم إنشاء 3 مهام للهدف');
}

export function deleteGoal(id) { removeItem('goals', id); }
export function editGoal(id) { openGoalModal(id); }
export function setGoalFilter(filter) { appState.filters.goalView = filter || 'all'; renderPage(); }
export function setGoalSearch(query = '') { appState.filters.goalQuery = query; renderPage(); }
