import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, generateId, isPast, isToday, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, upsert } from './shared.js';
import { renderPage } from '../router.js';

const taskStatuses = ['مفتوحة','قيد التنفيذ','مكتملة','مؤجلة'];
const taskTypes = ['مهمة','إجراء سريع','عادة','متابعة'];
const priorities = ['عالية','متوسطة','منخفضة'];
const sources = ['يدوي','معرفة','طوارئ','حملة','مراجعة','قرار'];
const views = [
  ['today','اليوم'], ['week','الأسبوع'], ['open','المفتوح'], ['done','المكتمل'], ['kanban','Kanban'], ['matrix','Matrix'], ['all','الكل']
];

function normalizeTask(task = {}) {
  const inferredSource = task.source || task.taskSource || (String(task.description || '').includes('من معرفة:') ? 'معرفة' : 'يدوي');
  return {
    ...task,
    title: task.title || 'مهمة بدون عنوان',
    type: task.type || 'مهمة',
    priority: task.priority || 'متوسطة',
    status: task.status || 'مفتوحة',
    source: inferredSource,
    steps: Array.isArray(task.steps) ? task.steps : [],
    estimateMinutes: safeNumber(task.estimateMinutes, 0),
    energy: task.energy || 'متوسطة'
  };
}

function getAllTasks() {
  return (appState.data.tasks || []).map(normalizeTask);
}

function getTaskQuery() {
  return appState.filters.taskQuery || '';
}

function taskMatchesQuery(task, query) {
  if (!query) return true;
  const haystack = [task.title, task.description, task.notes, task.type, task.priority, task.status, task.source]
    .concat((task.steps || []).map(step => step.title || step.text || ''))
    .join(' ')
    .toLowerCase();
  return haystack.includes(query.toLowerCase());
}

function filteredTasks() {
  const tasks = getAllTasks();
  const view = appState.filters.tasks || 'today';
  const now = todayISO();
  const weekDate = new Date();
  weekDate.setDate(weekDate.getDate() + 7);
  const max = weekDate.toISOString().slice(0,10);
  const filtered = tasks.filter(task => {
    if (view === 'today') return task.dueDate === now || (!task.dueDate && task.status !== 'مكتملة');
    if (view === 'week') return task.dueDate && task.dueDate >= now && task.dueDate <= max;
    if (view === 'open') return task.status !== 'مكتملة';
    if (view === 'done') return task.status === 'مكتملة';
    return true;
  });
  return filtered.filter(task => taskMatchesQuery(task, getTaskQuery()));
}

function getTaskStats() {
  const tasks = getAllTasks();
  const open = tasks.filter(t => t.status !== 'مكتملة');
  const done = tasks.filter(t => t.status === 'مكتملة');
  const today = tasks.filter(t => t.dueDate === todayISO() || (!t.dueDate && t.status !== 'مكتملة'));
  const overdue = open.filter(t => isPast(t.dueDate));
  const fromKnowledge = tasks.filter(t => t.source === 'معرفة' || String(t.description || '').includes('من معرفة:'));
  const totalSteps = tasks.reduce((sum, task) => sum + (task.steps || []).length, 0);
  const doneSteps = tasks.reduce((sum, task) => sum + (task.steps || []).filter(step => step.done).length, 0);
  return { tasks, open, done, today, overdue, fromKnowledge, totalSteps, doneSteps, completion: calculatePercentage(done.length, tasks.length), stepCompletion: calculatePercentage(doneSteps, totalSteps) };
}

function linkedName(collection, id, empty = 'بدون ربط') {
  if (!id) return empty;
  return appState.data[collection]?.find(item => item.id === id)?.title || 'غير موجود';
}

function sourceBadge(task) {
  const source = task.source || 'يدوي';
  const cls = source === 'معرفة' ? 'success' : source === 'طوارئ' ? 'warning' : source === 'حملة' ? 'danger' : '';
  return `<span class="badge ${cls}">${safeText(source)}</span>`;
}

function stepProgress(task) {
  const steps = task.steps || [];
  if (!steps.length) return '';
  const done = steps.filter(step => step.done).length;
  const percentage = calculatePercentage(done, steps.length);
  return `<div class="task-steps-mini"><div class="meta"><span>الخطوات: ${safeText(done)} / ${safeText(steps.length)}</span><span>${safeText(percentage)}%</span></div><div class="progress"><span style="width:${safeText(percentage)}%"></span></div></div>`;
}

function taskCard(task) {
  const overdue = task.status !== 'مكتملة' && isPast(task.dueDate);
  const done = task.status === 'مكتملة';
  const stepsHtml = stepProgress(task);
  const extra = `<button class="btn ${done ? 'ghost' : 'primary'}" data-action="toggle-task-complete" data-id="${safeText(task.id)}">${done ? 'إرجاع' : 'تم'}</button>`;
  return `<article class="card item-card task-card ${done ? 'is-done' : ''}">
    <div class="btn-row">${statusBadge(task.status)}${statusBadge(task.priority)}${sourceBadge(task)}${overdue ? '<span class="badge danger">متأخرة</span>' : ''}</div>
    <h3>${safeText(task.title)}</h3>
    <p>${safeText(task.description || task.notes || 'بدون وصف')}</p>
    <div class="task-meta-grid">
      <span>النوع: ${safeText(task.type)}</span>
      <span>الموعد: ${task.dueDate ? safeText(task.dueDate) : 'بدون موعد'}</span>
      <span>الوقت: ${task.dueTime ? safeText(task.dueTime) : 'بدون وقت'}</span>
      <span>الطاقة: ${safeText(task.energy || 'متوسطة')}</span>
      <span>الهدف: ${safeText(linkedName('goals', task.goalId))}</span>
      <span>المشروع: ${safeText(linkedName('projects', task.projectId))}</span>
    </div>
    ${stepsHtml}
    ${renderTaskSteps(task)}
    <div class="btn-row">
      ${extra}
      <button class="btn ghost" data-action="edit-task" data-id="${safeText(task.id)}">تعديل</button>
      <button class="btn danger" data-action="delete-task" data-id="${safeText(task.id)}">حذف</button>
    </div>
  </article>`;
}

function renderTaskSteps(task) {
  const steps = task.steps || [];
  if (!steps.length) return '';
  return `<div class="task-steps-list">${steps.map((step, index) => `<button class="task-step ${step.done ? 'is-done' : ''}" data-action="toggle-task-step" data-id="${safeText(task.id)}" data-step-index="${safeText(index)}"><span>${step.done ? '✓' : ''}</span><b>${safeText(step.title || step.text || `خطوة ${index + 1}`)}</b></button>`).join('')}</div>`;
}

function renderTaskStats() {
  const s = getTaskStats();
  return `<div class="task-intel-grid">
    <article class="kpi-card"><small>مهام اليوم</small><strong>${safeText(s.today.length)}</strong></article>
    <article class="kpi-card"><small>المفتوح</small><strong>${safeText(s.open.length)}</strong></article>
    <article class="kpi-card"><small>المكتمل</small><strong>${safeText(s.done.length)}</strong></article>
    <article class="kpi-card"><small>من المعرفة</small><strong>${safeText(s.fromKnowledge.length)}</strong></article>
    <article class="kpi-card"><small>متأخرة</small><strong>${safeText(s.overdue.length)}</strong></article>
    <article class="kpi-card"><small>اكتمال الخطوات</small><strong>${safeText(s.stepCompletion)}%</strong></article>
  </div>`;
}

function renderToolbar() {
  return `<div class="task-toolbar card compact">
    <div class="filters">${views.map(([value, label]) => `<button class="filter-btn ${appState.filters.tasks === value ? 'active' : ''}" data-action="set-task-filter" data-filter="${value}">${label}</button>`).join('')}</div>
    <input class="task-search" data-action="task-search" value="${safeText(getTaskQuery())}" placeholder="ابحث في المهام، الخطوات، المصدر...">
  </div>`;
}

function renderTodayView(tasks) {
  const high = tasks.filter(t => t.priority === 'عالية' && t.status !== 'مكتملة');
  const quick = tasks.filter(t => t.type === 'إجراء سريع' && t.status !== 'مكتملة');
  return `<div class="grid grid-2">
    <article class="card task-focus-card"><h3>أولوية اليوم</h3>${high[0] ? taskCard(high[0]) : '<p class="meta">حدد مهمة عالية الأولوية تبدأ بها.</p>'}</article>
    <article class="card"><h3>إجراءات سريعة</h3><div class="today-list">${quick.length ? quick.slice(0, 4).map(t => `<div class="today-task"><div><b>${safeText(t.title)}</b><div class="meta"><span>${safeText(t.dueTime || 'بدون وقت')}</span><span>${safeText(t.source || 'يدوي')}</span></div></div><button class="btn primary" data-action="toggle-task-complete" data-id="${safeText(t.id)}">تم</button></div>`).join('') : '<p class="meta">لا توجد إجراءات سريعة الآن.</p>'}</div></article>
    <div class="grid full-span">${tasks.length ? tasks.map(taskCard).join('') : emptyState('لا توجد مهام اليوم', 'أضف مهمة واحدة واضحة أو غيّر الفلتر.', '<button class="btn primary" data-action="open-task-modal">إضافة مهمة</button>')}</div>
  </div>`;
}

function renderListView(tasks) {
  return `<div class="grid grid-2">${tasks.length ? tasks.map(taskCard).join('') : emptyState('لا توجد مهام هنا', 'أضف مهمة أو غيّر الفلتر الحالي.', '<button class="btn primary" data-action="open-task-modal">إضافة مهمة</button>')}</div>`;
}

function renderKanban() {
  const tasks = getAllTasks().filter(task => taskMatchesQuery(task, getTaskQuery()));
  return `<div class="kanban task-kanban">${taskStatuses.map(status => `<div class="kanban-column"><h3>${status}</h3>${tasks.filter(t => t.status === status).map(taskCard).join('') || '<p class="meta">لا يوجد</p>'}</div>`).join('')}</div>`;
}

function renderMatrix() {
  const tasks = getAllTasks().filter(t => t.status !== 'مكتملة' && taskMatchesQuery(t, getTaskQuery()));
  const buckets = [
    { key: 'urgent-important', title: 'عاجل ومهم', hint: 'نفّذه الآن', match: t => t.priority === 'عالية' && (isToday(t.dueDate) || isPast(t.dueDate)) },
    { key: 'important', title: 'مهم غير عاجل', hint: 'جدوله بذكاء', match: t => t.priority === 'عالية' && !isToday(t.dueDate) && !isPast(t.dueDate) },
    { key: 'quick', title: 'سريع', hint: 'أنهِه في وقت قصير', match: t => t.type === 'إجراء سريع' || safeNumber(t.estimateMinutes) <= 15 && safeNumber(t.estimateMinutes) > 0 },
    { key: 'later', title: 'لاحقًا', hint: 'أجّله أو قلله', match: t => t.priority !== 'عالية' && t.type !== 'إجراء سريع' }
  ];
  return `<div class="task-matrix">${buckets.map(bucket => `<article class="card matrix-cell"><h3>${bucket.title}</h3><p class="meta">${bucket.hint}</p>${tasks.filter(bucket.match).slice(0, 8).map(taskCard).join('') || '<p class="meta">لا يوجد</p>'}</article>`).join('')}</div>`;
}

export function renderTasks() {
  const actions = '<button class="btn primary" data-action="open-task-modal">إضافة مهمة</button>';
  const view = appState.filters.tasks || 'today';
  const tasks = filteredTasks();
  const body = view === 'kanban' ? renderKanban() : view === 'matrix' ? renderMatrix() : view === 'today' ? renderTodayView(tasks) : renderListView(tasks);
  return `<section class="page task-system">${pageHeader('المهام', 'نظام تنفيذ مطوّر: اليوم، الأسبوع، Kanban، Matrix، خطوات فرعية، ومهام مولدة من المعرفة.', actions)}${renderTaskStats()}${renderToolbar()}${body}</section>`;
}

export function openTaskModal(id = '', defaults = {}) {
  const item = normalizeTask(appState.data.tasks.find(x => x.id === id) || defaults || {});
  const stepText = (item.steps || []).map(step => step.title || step.text || '').join('\n');
  openModal({ title: item.id ? 'تعديل مهمة' : 'إضافة مهمة', saveText: 'حفظ', body: `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}"></label>
    <label>النوع<select name="type">${taskTypes.map(v=>`<option ${v===item.type?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>المصدر<select name="source">${sources.map(v=>`<option ${v===item.source?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>الأولوية<select name="priority">${priorities.map(v=>`<option ${v===item.priority?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="full">الوصف<textarea name="description">${safeText(item.description || '')}</textarea></label>
    ${linkedFields(item)}
    <label>الحالة<select name="status">${taskStatuses.map(v=>`<option ${v===item.status?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>الطاقة<select name="energy">${['عالية','متوسطة','منخفضة'].map(v=>`<option ${v===item.energy?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>تاريخ التنفيذ<input type="date" name="dueDate" value="${safeText(item.dueDate || todayISO())}"></label>
    <label>الوقت<input type="time" name="dueTime" value="${safeText(item.dueTime || '')}"></label>
    <label>تقدير بالدقائق<input type="number" min="0" name="estimateMinutes" value="${safeText(item.estimateMinutes || '')}" placeholder="مثال: 25"></label>
    <label>التذكير<input name="reminder" value="${safeText(item.reminder || '')}" placeholder="مثال: قبلها بساعة"></label>
    <label>التكرار<input name="repeat" value="${safeText(item.repeat || '')}" placeholder="يومي / أسبوعي / بدون"></label>
    <label class="full">خطوات صغيرة — كل خطوة في سطر<textarea name="stepsText" placeholder="افتح الملف\nنفذ أول تعديل\nراجع النتيجة">${safeText(stepText)}</textarea></label>
    <label class="full">ملاحظات<textarea name="notes">${safeText(item.notes || '')}</textarea></label>
  </form>`, onSave: () => {
    const form = document.getElementById('entityForm');
    if (!form.reportValidity()) return;
    const d = objectFromForm(form);
    const existingSteps = item.steps || [];
    const lines = parseLines(d.stepsText);
    const steps = lines.map((title, index) => ({ id: existingSteps[index]?.id || generateId('step'), title, done: Boolean(existingSteps[index]?.done) }));
    upsert('tasks', {
      id: d.id || generateId('task'),
      title: d.title,
      description: d.description,
      goalId: d.goalId,
      projectId: d.projectId,
      type: d.type,
      source: d.source,
      priority: d.priority,
      status: d.status || 'مفتوحة',
      dueDate: d.dueDate,
      dueTime: d.dueTime,
      reminder: d.reminder,
      repeat: d.repeat,
      estimateMinutes: safeNumber(d.estimateMinutes, 0),
      energy: d.energy,
      steps,
      notes: d.notes,
      completedAt: d.status === 'مكتملة' ? (item.completedAt || new Date().toISOString()) : ''
    });
    closeModal(); toast('تم حفظ المهمة');
  }});
}

export function completeTask(id) {
  const task = appState.data.tasks.find(t => t.id === id);
  if (task) upsert('tasks', { ...normalizeTask(task), status: 'مكتملة', completedAt: new Date().toISOString() });
}

export function toggleTaskComplete(id) {
  const task = appState.data.tasks.find(t => t.id === id);
  if (!task) return;
  const normalized = normalizeTask(task);
  const nextDone = normalized.status !== 'مكتملة';
  upsert('tasks', { ...normalized, status: nextDone ? 'مكتملة' : 'مفتوحة', completedAt: nextDone ? new Date().toISOString() : '' });
}

export function toggleTaskStep(id, index) {
  const task = appState.data.tasks.find(t => t.id === id);
  if (!task) return;
  const normalized = normalizeTask(task);
  const stepIndex = safeNumber(index, -1);
  if (!normalized.steps[stepIndex]) return;
  normalized.steps[stepIndex] = { ...normalized.steps[stepIndex], done: !normalized.steps[stepIndex].done };
  const allDone = normalized.steps.length && normalized.steps.every(step => step.done);
  const nextStatus = allDone ? 'مكتملة' : normalized.status === 'مكتملة' ? 'قيد التنفيذ' : normalized.status;
  const taskIndex = appState.data.tasks.findIndex(t => t.id === id);
  appState.data.tasks[taskIndex] = { ...task, ...normalized, status: nextStatus, completedAt: allDone ? new Date().toISOString() : (nextStatus === 'مكتملة' ? task.completedAt : '') };
  autoSave();
  renderPage();
}

export function deleteTask(id) { removeItem('tasks', id); }
export function editTask(id) { openTaskModal(id); }
export function setTaskFilter(filter) { appState.filters.tasks = filter; }
export function setTaskSearch(query = '') { appState.filters.taskQuery = query; renderPage(); }
