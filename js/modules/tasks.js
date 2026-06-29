import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, generateId, isPast, isToday, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, upsert } from './shared.js';
import { renderPage } from '../router.js';
import { getDailyFlowState } from './dailyFlow.js';

const taskStatuses = ['مفتوحة','قيد التنفيذ','مكتملة','مؤجلة'];
const taskTypes = ['مهمة','إجراء سريع','عادة','متابعة'];
const priorities = ['عالية','متوسطة','منخفضة'];
const sources = ['يدوي','معرفة','طوارئ','حملة','مراجعة','قرار'];
const reminderPresets = [
  { value: '', label: 'حسب إعداد التنبيهات العام' },
  { value: '5', label: 'قبلها بـ 5 دقائق' },
  { value: '10', label: 'قبلها بـ 10 دقائق' },
  { value: '15', label: 'قبلها بربع ساعة' },
  { value: '30', label: 'قبلها بنصف ساعة' },
  { value: '60', label: 'قبلها بساعة' },
  { value: '120', label: 'قبلها بساعتين' },
  { value: '1440', label: 'قبلها بيوم' }
];
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
    reminderMinutes: safeNumber(task.reminderMinutes, 0),
    energy: task.energy || 'متوسطة'
  };
}

function getAllTasks() {
  return (appState.data.tasks || []).map(normalizeTask);
}

function getTaskQuery() {
  return appState.filters.taskQuery || '';
}


function taskDateTime(task = {}) {
  if (!task.dueDate) return null;
  const time = task.dueTime || '23:59';
  const date = new Date(`${task.dueDate}T${time}:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatTaskDateLabel(task = {}) {
  if (!task.dueDate) return 'بدون موعد';
  const today = todayISO();
  if (task.dueDate === today) return task.dueTime ? `اليوم ${task.dueTime}` : 'اليوم بدون وقت';
  return task.dueTime ? `${task.dueDate} · ${task.dueTime}` : `${task.dueDate} · بدون وقت`;
}

function parseReminderText(value = '') {
  const text = String(value || '').trim();
  if (!text) return 0;
  const number = Number((text.match(/\d+/) || [0])[0]);
  if (/يوم/.test(text)) return number ? number * 1440 : 1440;
  if (/ساعت|ساعة/.test(text)) return number ? number * 60 : 60;
  if (/ربع/.test(text)) return 15;
  if (/نصف|نص/.test(text)) return 30;
  if (/دقيق/.test(text)) return number || 10;
  return number || 0;
}

export function getTaskReminderMinutes(task = {}, fallback = 10) {
  const explicit = safeNumber(task.reminderMinutes, 0);
  if (explicit > 0) return explicit;
  const parsed = parseReminderText(task.reminder);
  return parsed > 0 ? parsed : Math.max(1, safeNumber(fallback, 10));
}

function reminderLabel(task = {}) {
  const preset = reminderPresets.find(item => String(item.value) === String(task.reminderMinutes || ''));
  if (preset && preset.value) return preset.label;
  if (task.reminder) return task.reminder;
  return 'حسب الإعداد العام';
}

function taskTimeState(task = {}) {
  if (task.status === 'مكتملة') return { key: 'done', label: 'مكتملة', className: 'success', hint: 'تم إغلاقها' };
  if (!task.dueDate) return { key: 'no-date', label: 'بدون موعد', className: '', hint: 'حدد تاريخًا لو محتاجة متابعة' };
  const now = new Date();
  const today = todayISO();
  const due = taskDateTime(task);
  const leadMinutes = getTaskReminderMinutes(task, 10);
  const diffMinutes = due ? Math.round((due.getTime() - now.getTime()) / 60000) : null;
  if (task.dueDate < today || (due && diffMinutes < 0)) return { key: 'overdue', label: 'متأخرة', className: 'danger', hint: formatTaskDateLabel(task) };
  if (task.dueDate === today && !task.dueTime) return { key: 'today-no-time', label: 'اليوم بدون وقت', className: 'warning', hint: 'حدد وقتًا لو محتاجة تنبيه' };
  if (task.dueDate === today && diffMinutes !== null && diffMinutes <= leadMinutes) return { key: 'due-soon', label: diffMinutes <= 0 ? 'وقتها الآن' : `بعد ${Math.max(1, diffMinutes)} د`, className: 'danger', hint: formatTaskDateLabel(task) };
  if (task.dueDate === today) return { key: 'today', label: 'اليوم', className: 'warning', hint: formatTaskDateLabel(task) };
  return { key: 'upcoming', label: 'قادمة', className: '', hint: formatTaskDateLabel(task) };
}

function taskTimeChip(task = {}) {
  const state = taskTimeState(task);
  return `<span class="task-time-chip ${safeText(state.className)}"><b>${safeText(state.label)}</b><small>${safeText(state.hint)}</small></span>`;
}

export function getTaskTimePolishState(tasks = getAllTasks()) {
  const open = tasks.filter(task => task.status !== 'مكتملة');
  const buckets = {
    overdue: open.filter(task => taskTimeState(task).key === 'overdue'),
    dueSoon: open.filter(task => ['due-soon','today'].includes(taskTimeState(task).key) && task.dueTime).sort((a, b) => String(a.dueTime || '').localeCompare(String(b.dueTime || ''))),
    todayNoTime: open.filter(task => taskTimeState(task).key === 'today-no-time'),
    noDate: open.filter(task => taskTimeState(task).key === 'no-date')
  };
  return {
    ...buckets,
    scheduled: open.filter(task => task.dueDate && task.dueTime).length,
    noTimeCount: open.filter(task => task.dueDate && !task.dueTime).length,
    nearest: [...buckets.overdue, ...buckets.dueSoon, ...buckets.todayNoTime][0] || null
  };
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
  return `<article class="card item-card task-card ${done ? 'is-done' : ''} task-time-${safeText(taskTimeState(task).key)}">
    <div class="task-card-head"><div class="btn-row">${statusBadge(task.status)}${statusBadge(task.priority)}${sourceBadge(task)}${overdue ? '<span class="badge danger">متأخرة</span>' : ''}</div>${taskTimeChip(task)}</div>
    <h3>${safeText(task.title)}</h3>
    <p>${safeText(task.description || task.notes || 'بدون وصف')}</p>
    <div class="task-meta-grid">
      <span>النوع: ${safeText(task.type)}</span>
      <span>الموعد: ${task.dueDate ? safeText(task.dueDate) : 'بدون موعد'}</span>
      <span>الوقت: ${task.dueTime ? safeText(task.dueTime) : 'بدون وقت'}</span>
      <span>التذكير: ${safeText(reminderLabel(task))}</span>
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



function renderTaskReviewFlowBridge() {
  const flow = getDailyFlowState();
  return `<article class="card task-review-flow-card">
    <div class="section-title"><div><span class="eyebrow">تدفق اليوم</span><h3>من التنفيذ إلى المراجعة</h3></div><span class="badge ${flow.readyForReview ? 'success' : 'warning'}">${flow.readyForReview ? 'راجع اليوم' : 'كمّل التنفيذ'}</span></div>
    <div class="task-review-flow-grid">
      <span><b>${safeText(flow.todayOpen.length)}</b><small>مفتوحة اليوم</small></span>
      <span><b>${safeText(flow.todayDone.length)}</b><small>مكتملة اليوم</small></span>
      <span><b>${safeText(flow.overdue.length)}</b><small>متأخرة</small></span>
    </div>
    <p class="meta">${safeText(flow.reviewAction)}</p>
    <div class="btn-row"><button class="btn primary" data-action="create-daily-review">مراجعة اليوم</button><button class="btn ghost" data-route="home">الرئيسية</button></div>
  </article>`;
}

function renderTaskTimePulse() {
  const state = getTaskTimePolishState();
  const lead = safeNumber(appState.data.settings?.notifications?.leadMinutes, 10);
  const nearest = state.nearest;
  return `<article class="card task-time-pulse-card">
    <div class="section-title"><div><h3>وقت المهام والتنبيهات</h3><p class="meta">أي مهمة لها تاريخ + وقت تدخل تلقائيًا في التنبيهات. الافتراضي قبلها ${safeText(lead)} دقائق، أو حسب تذكير المهمة.</p></div><span class="badge">تنبيهات</span></div>
    <div class="task-time-pulse-grid">
      <span class="danger"><b>${safeText(state.overdue.length)}</b><small>متأخرة</small></span>
      <span class="warning"><b>${safeText(state.dueSoon.length)}</b><small>قريبة اليوم</small></span>
      <span><b>${safeText(state.todayNoTime.length)}</b><small>اليوم بدون وقت</small></span>
      <span><b>${safeText(state.scheduled)}</b><small>لها تنبيه</small></span>
    </div>
    ${nearest ? `<div class="task-next-alert"><b>أقرب انتباه:</b><span>${safeText(nearest.title)}</span><small>${safeText(formatTaskDateLabel(nearest))} · ${safeText(reminderLabel(nearest))}</small><button class="btn ghost" data-action="edit-task" data-id="${safeText(nearest.id)}">ضبط</button></div>` : '<p class="meta">لا توجد مهمة عاجلة الآن. أضف وقتًا للمهام المهمة فقط.</p>'}
  </article>`;
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
    <article class="card"><h3>إجراءات سريعة</h3><div class="today-list">${quick.length ? quick.slice(0, 4).map(t => `<div class="today-task"><div><b>${safeText(t.title)}</b><div class="meta"><span>${safeText(formatTaskDateLabel(t))}</span><span>${safeText(t.source || 'يدوي')}</span></div></div><button class="btn primary" data-action="toggle-task-complete" data-id="${safeText(t.id)}">تم</button></div>`).join('') : '<p class="meta">لا توجد إجراءات سريعة الآن.</p>'}</div></article>
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
  return `<section class="page task-system">${pageHeader('المهام', 'نظام تنفيذ مطوّر: اليوم، الأسبوع، Kanban، Matrix، خطوات فرعية، ومهام مولدة من المعرفة.', actions)}${renderTaskStats()}${renderTaskTimePulse()}${renderTaskReviewFlowBridge()}${renderToolbar()}${body}</section>`;
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
    <div class="full task-time-form-block"><b>وقت المهمة</b><p>التنبيه يعمل بوضوح عندما تضيف تاريخ ووقت. لو تركت التذكير على العام سيستخدم إعدادات التنبيهات.</p></div>
    <label>تاريخ التنفيذ<input type="date" name="dueDate" value="${safeText(item.dueDate || todayISO())}"></label>
    <label>الوقت<input type="time" name="dueTime" value="${safeText(item.dueTime || '')}"></label>
    <label>تقدير بالدقائق<input type="number" min="0" name="estimateMinutes" value="${safeText(item.estimateMinutes || '')}" placeholder="مثال: 25"></label>
    <label>التذكير قبل الموعد<select name="reminderMinutes">${reminderPresets.map(option => `<option value="${safeText(option.value)}" ${String(option.value) === String(item.reminderMinutes || '') ? 'selected' : ''}>${safeText(option.label)}</option>`).join('')}</select></label>
    <label>التكرار<input name="repeat" value="${safeText(item.repeat || '')}" placeholder="يومي / أسبوعي / بدون"></label>
    <label class="full">خطوات صغيرة — كل خطوة في سطر<textarea name="stepsText" placeholder="افتح الملف\nنفذ أول تعديل\nراجع النتيجة">${safeText(stepText)}</textarea></label>
    <label class="full">ملاحظات<textarea name="notes">${safeText(item.notes || '')}</textarea></label>
  </form>`, onSave: () => {
    const form = document.getElementById('entityForm');
    if (!form.reportValidity()) return;
    const d = objectFromForm(form);
    const existingSteps = item.steps || [];
    const lines = parseLines(d.stepsText);
    const selectedReminder = reminderPresets.find(option => String(option.value) === String(d.reminderMinutes || ''));
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
      reminder: selectedReminder?.value ? selectedReminder.label : '',
      reminderMinutes: safeNumber(d.reminderMinutes, 0),
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
