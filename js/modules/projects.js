import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, generateId, isPast, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { buildCommonForm, getLinkedTitle, openEntityModal, prepareCommonItem, removeItem, simpleCard } from './shared.js';
import { renderPage } from '../router.js';

const projectViews = [
  ['all', 'كل المشاريع'],
  ['active', 'نشطة'],
  ['behind', 'متأخرة'],
  ['no-tasks', 'بدون مهام'],
  ['knowledge', 'لها معرفة'],
  ['needs-rescue', 'تحتاج إنقاذ']
];

function getProjectView() { return appState.filters.projectView || 'all'; }
function getProjectQuery() { return appState.filters.projectQuery || ''; }

export function renderProjects() {
  const projects = (appState.data.projects || []).map(p => enrichProject(p)).filter(projectMatches);
  const actions = '<button class="btn primary" data-action="open-project-modal">إضافة مشروع</button>';
  return `<section class="page project-system">${pageHeader('المشاريع', 'كل مشروع أصبح مساحة تنفيذ: مهام، معرفة، قرارات، حملات، وتقدم محسوب تلقائيًا.', actions)}
    ${renderProjectStats()}
    ${renderProjectToolbar()}
    <div class="grid grid-2">${projects.length ? projects.map(projectCard).join('') : emptyState('لا توجد مشاريع مطابقة', 'أنشئ مشروعًا أو غيّر الفلتر الحالي.', actions)}</div>
  </section>`;
}

function getProjectRelations(project) {
  const tasks = appState.data.tasks.filter(t => t.projectId === project.id);
  const knowledge = appState.data.knowledge.filter(k => {
    if (k.linkedProjectId === project.id || k.projectId === project.id) return true;
    return Object.values(k.videoContent || {}).some(content => content?.linkedProjectId === project.id);
  });
  const decisions = appState.data.decisions.filter(d => d.linkedProjectId === project.id || d.projectId === project.id);
  const campaigns = appState.data.campaigns.filter(c => c.projectId === project.id);
  const wins = appState.data.wins.filter(w => w.linkedProjectId === project.id || w.projectId === project.id);
  const openTasks = tasks.filter(t => t.status !== 'مكتملة');
  const doneTasks = tasks.filter(t => t.status === 'مكتملة');
  const overdueTasks = openTasks.filter(t => isPast(t.dueDate));
  return { tasks, knowledge, decisions, campaigns, wins, openTasks, doneTasks, overdueTasks };
}

function projectProgress(project) {
  const tasks = appState.data.tasks.filter(t => t.projectId === project.id);
  if (!tasks.length) return safeNumber(project.progress, 0);
  return calculatePercentage(tasks.filter(t => t.status === 'مكتملة').length, tasks.length);
}

function projectHealth(project, rel) {
  const progress = projectProgress(project);
  let score = progress;
  if (rel.tasks.length) score += 15;
  if (rel.knowledge.length) score += 8;
  if (rel.decisions.length) score += 5;
  if (rel.campaigns.length) score += 5;
  score -= rel.overdueTasks.length * 10;
  if (isProjectBehind(project, rel)) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

function enrichProject(project) {
  const rel = getProjectRelations(project);
  const progress = projectProgress(project);
  return { ...project, progress, rel, healthScore: projectHealth(project, rel) };
}

function isProjectBehind(project, rel = getProjectRelations(project)) {
  if (project.status === 'مكتملة') return false;
  if (rel.overdueTasks.length) return true;
  if (isPast(project.targetDate) && projectProgress(project) < 100) return true;
  if (!rel.tasks.length && !['مكتملة', 'متوقفة'].includes(project.status)) return true;
  return false;
}

function projectMatches(project) {
  const view = getProjectView();
  const q = getProjectQuery().toLowerCase();
  if (view === 'active' && ['مكتملة', 'متوقفة'].includes(project.status)) return false;
  if (view === 'behind' && !isProjectBehind(project, project.rel)) return false;
  if (view === 'no-tasks' && project.rel.tasks.length) return false;
  if (view === 'knowledge' && !project.rel.knowledge.length) return false;
  if (view === 'needs-rescue' && project.healthScore >= 50) return false;
  if (!q) return true;
  const haystack = [project.title, project.description, project.notes, project.status, project.priority, getLinkedTitle('goals', project.goalId)]
    .concat(project.rel.tasks.map(t => t.title))
    .concat(project.rel.knowledge.map(k => k.title))
    .concat(project.rel.decisions.map(d => d.title || d.finalDecision))
    .concat(project.rel.campaigns.map(c => c.productName))
    .join(' ')
    .toLowerCase();
  return haystack.includes(q);
}

function renderProjectStats() {
  const projects = (appState.data.projects || []).map(enrichProject);
  const active = projects.filter(p => !['مكتملة', 'متوقفة'].includes(p.status)).length;
  const behind = projects.filter(p => isProjectBehind(p, p.rel)).length;
  const noTasks = projects.filter(p => !p.rel.tasks.length).length;
  const avgProgress = projects.length ? Math.round(projects.reduce((sum, p) => sum + p.progress, 0) / projects.length) : 0;
  const linkedKnowledge = projects.reduce((sum, p) => sum + p.rel.knowledge.length, 0);
  return `<div class="project-intel-grid">
    <article class="kpi-card"><small>كل المشاريع</small><strong>${safeText(projects.length)}</strong></article>
    <article class="kpi-card"><small>نشطة</small><strong>${safeText(active)}</strong></article>
    <article class="kpi-card"><small>متأخرة</small><strong>${safeText(behind)}</strong></article>
    <article class="kpi-card"><small>بدون مهام</small><strong>${safeText(noTasks)}</strong></article>
    <article class="kpi-card"><small>متوسط التقدم</small><strong>${safeText(avgProgress)}%</strong></article>
    <article class="kpi-card"><small>معرفة مرتبطة</small><strong>${safeText(linkedKnowledge)}</strong></article>
  </div>`;
}

function renderProjectToolbar() {
  return `<div class="project-toolbar card compact">
    <div class="filters">${projectViews.map(([value, label]) => `<button class="filter-btn ${getProjectView() === value ? 'active' : ''}" data-action="set-project-filter" data-filter="${value}">${label}</button>`).join('')}</div>
    <input class="project-search" data-action="project-search" value="${safeText(getProjectQuery())}" placeholder="ابحث في المشاريع أو المهام أو المعرفة المرتبطة...">
  </div>`;
}

function projectCard(project) {
  const behind = isProjectBehind(project, project.rel);
  const extra = `<button class="btn ghost" data-action="view-project" data-id="${safeText(project.id)}">عرض الذكاء</button><button class="btn ghost" data-action="project-to-tasks" data-id="${safeText(project.id)}">حوّل لخطوات</button>${behind ? `<button class="btn primary" data-action="rescue-project" data-id="${safeText(project.id)}">إنقاذ</button>` : ''}`;
  return simpleCard('project', project, `<p>${safeText(project.description || 'بدون وصف')}</p>
    <div class="project-health-card ${behind ? 'is-behind' : ''}">
      <div><small>صحة المشروع</small><strong>${safeText(project.healthScore)}%</strong></div>
      <div class="progress"><span style="width:${safeText(project.healthScore)}%"></span></div>
      <p>${behind ? 'المشروع يحتاج إنقاذ أو مهام واضحة.' : project.healthScore >= 70 ? 'المشروع يتحرك بشكل جيد.' : 'المشروع يحتاج ربط وتنفيذ أكثر.'}</p>
    </div>
    <div class="meta"><span>الهدف: ${safeText(getLinkedTitle('goals', project.goalId))}</span><span>مهام: ${safeText(project.rel.tasks.length)}</span><span>معرفة: ${safeText(project.rel.knowledge.length)}</span><span>قرارات: ${safeText(project.rel.decisions.length)}</span><span>حملات: ${safeText(project.rel.campaigns.length)}</span></div>
    <div class="progress"><span style="width:${safeText(project.progress)}%"></span></div>
    <div class="goal-relations-strip">${behind ? '<span class="badge danger">يحتاج إنقاذ</span>' : statusBadge('مستقر')}<span class="badge">تقدم ${safeText(project.progress)}%</span><span class="badge">مفتوح ${safeText(project.rel.openTasks.length)}</span></div>`, extra);
}

export function openProjectModal(id = '') {
  const item = appState.data.projects.find(x => x.id === id) || {};
  const extra = `<label>الهدف المرتبط<select name="goalId">${options(appState.data.goals, item.goalId, 'بدون هدف')}</select></label>`;
  openEntityModal({ collection: 'projects', title: item.id ? 'تعديل مشروع' : 'إضافة مشروع', item, body: buildCommonForm(item, extra, 'المشروع'), mapData: data => ({ ...prepareCommonItem('project', data), goalId: data.goalId }) });
}

function chips(items, emptyText = 'لا يوجد') {
  return items.length ? items.slice(0, 8).map(item => `<span>${safeText(item.title || item.productName || item.finalDecision || 'عنصر')}</span>`).join('') : `<span>${safeText(emptyText)}</span>`;
}

export function viewProject(id) {
  const base = appState.data.projects.find(p => p.id === id);
  if (!base) return toast('المشروع غير موجود');
  const project = enrichProject(base);
  openModal({ title: `ذكاء المشروع: ${safeText(project.title)}`, size: 'wide', body: `<div class="entity-intel-modal">
    <div class="entity-hero-card ${isProjectBehind(project, project.rel) ? 'is-danger' : ''}">
      <div><small>التقدم المحسوب من المهام</small><h3>${safeText(project.progress)}%</h3><p>الهدف المرتبط: ${safeText(getLinkedTitle('goals', project.goalId))}</p></div>
      <div class="ring" style="--value:${safeText(project.healthScore)}"><strong>${safeText(project.healthScore)}%</strong><span>صحة المشروع</span></div>
    </div>
    <div class="project-intel-grid">
      <article class="kpi-card"><small>مهام</small><strong>${safeText(project.rel.tasks.length)}</strong></article>
      <article class="kpi-card"><small>مفتوحة</small><strong>${safeText(project.rel.openTasks.length)}</strong></article>
      <article class="kpi-card"><small>متأخرة</small><strong>${safeText(project.rel.overdueTasks.length)}</strong></article>
      <article class="kpi-card"><small>معرفة</small><strong>${safeText(project.rel.knowledge.length)}</strong></article>
      <article class="kpi-card"><small>قرارات</small><strong>${safeText(project.rel.decisions.length)}</strong></article>
      <article class="kpi-card"><small>حملات</small><strong>${safeText(project.rel.campaigns.length)}</strong></article>
    </div>
    <div class="entity-map-grid">
      <article class="card"><h3>المهام المفتوحة</h3><div class="intel-chip-list">${chips(project.rel.openTasks, 'لا توجد مهام مفتوحة')}</div></article>
      <article class="card"><h3>المعرفة المرتبطة</h3><div class="intel-chip-list">${chips(project.rel.knowledge, 'لا توجد معرفة مرتبطة')}</div></article>
      <article class="card"><h3>القرارات</h3><div class="intel-chip-list">${chips(project.rel.decisions, 'لا توجد قرارات')}</div></article>
      <article class="card"><h3>الحملات/الفوز</h3><div class="intel-chip-list">${chips([...project.rel.campaigns, ...project.rel.wins], 'لا توجد حملات أو انتصارات')}</div></article>
    </div>
    <div class="recommendation"><b>التوصية:</b> ${projectRecommendation(project)}</div>
    <div class="btn-row"><button class="btn primary" data-action="project-to-tasks" data-id="${safeText(project.id)}">حوّل المشروع لخطوات</button><button class="btn ghost" data-action="rescue-project" data-id="${safeText(project.id)}">خطة إنقاذ</button></div>
  </div>` });
}

function projectRecommendation(project) {
  if (!project.rel.tasks.length) return 'ابدأ بخمس خطوات تنفيذ صغيرة لهذا المشروع حتى يظهر تقدمه في النظام.';
  if (project.rel.overdueTasks.length) return 'هناك مهام متأخرة. استخدم خطة الإنقاذ لتقليل النطاق وتحريك المشروع اليوم.';
  if (!project.rel.knowledge.length) return 'اربط معرفة أو فيديو واحد بالمشروع حتى يكون التطوير مبنيًا على تعلم واضح.';
  if (!project.rel.decisions.length && project.progress < 70) return 'سجل قرارًا واحدًا عن أهم اتجاه للمشروع حتى لا يظل التنفيذ عشوائيًا.';
  return 'المشروع مترابط جيدًا. ركز على إنهاء المهام المفتوحة ثم سجل فوزًا صغيرًا.';
}

function taskPayload(project, title, priority = 'متوسطة') {
  const now = new Date().toISOString();
  return { id: generateId('task'), title, description: `مهمة مولدة من مشروع: ${project.title}`, goalId: project.goalId || '', projectId: project.id, type: 'مهمة', source: 'مراجعة', priority, status: 'مفتوحة', dueDate: todayISO(), dueTime: '', reminder: '', repeat: '', notes: project.notes || project.description || '', createdAt: now, updatedAt: now };
}

export function projectToTasks(id) {
  const project = appState.data.projects.find(p => p.id === id);
  if (!project) return toast('المشروع غير موجود');
  const lines = parseLines(project.notes || '').slice(0, 6);
  const defaultLines = ['حدد النتيجة المطلوبة من المشروع', 'اكتب أول خطوة تنفيذ واضحة', 'اجمع المعرفة أو الرابط المطلوب', 'نفذ نسخة أولى صغيرة', 'راجع النتيجة وسجل قرارًا', 'سجل فوزًا صغيرًا'];
  const tasks = (lines.length ? lines : defaultLines).map((line, index) => taskPayload(project, `${line} — ${project.title}`, index === 0 ? 'عالية' : 'متوسطة'));
  appState.data.tasks.unshift(...tasks);
  autoSave(); renderPage(); closeModal(); toast(`تم إنشاء ${tasks.length} مهام من المشروع`);
}

export function rescueProject(id) {
  const project = appState.data.projects.find(p => p.id === id);
  if (!project) return toast('المشروع غير موجود');
  const tasks = [
    `احذف أو أجّل أي شيء غير ضروري في ${project.title}`,
    `نفذ خطوة واحدة خلال 25 دقيقة في ${project.title}`,
    `اكتب قرار إنقاذ للمشروع: استكمال / تقليل / إيقاف`
  ].map((line, index) => taskPayload(project, line, index === 0 ? 'عالية' : 'متوسطة'));
  appState.data.tasks.unshift(...tasks);
  project.status = 'قيد التنفيذ';
  project.updatedAt = new Date().toISOString();
  autoSave(); renderPage(); closeModal(); toast('تم إنشاء خطة إنقاذ للمشروع');
}

export function deleteProject(id) { removeItem('projects', id); }
export function editProject(id) { openProjectModal(id); }
export function setProjectFilter(filter) { appState.filters.projectView = filter || 'all'; renderPage(); }
export function setProjectSearch(query = '') { appState.filters.projectQuery = query; renderPage(); }
