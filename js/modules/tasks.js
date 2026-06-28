import { appState } from '../state.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, toast } from '../ui.js';
import { generateId, isPast, isToday, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';

const taskStatuses = ['مفتوحة','قيد التنفيذ','مكتملة','مؤجلة'];
const taskTypes = ['مهمة','إجراء سريع','عادة','متابعة'];
const priorities = ['عالية','متوسطة','منخفضة'];

export function renderTasks() {
  const actions = '<button class="btn primary" data-action="open-task-modal">إضافة مهمة</button>';
  return `<section class="page">${pageHeader('المهام', 'قائمة تنفيذ يومية مع فلترة وKanban بسيط.', actions)}
    <div class="filters">
      ${['today:اليوم','week:الأسبوع','open:المفتوح','done:المكتمل','all:الكل'].map(x => { const [v,t]=x.split(':'); return `<button class="filter-btn ${appState.filters.tasks===v?'active':''}" data-action="set-task-filter" data-filter="${v}">${t}</button>`; }).join('')}
    </div>
    ${appState.filters.tasks === 'all' ? renderKanban() : `<div class="grid grid-2">${filteredTasks().length ? filteredTasks().map(taskCard).join('') : emptyState('لا توجد مهام هنا', 'أضف مهمة أو غيّر الفلتر الحالي.', actions)}</div>`}
  </section>`;
}

function filteredTasks() {
  const tasks = appState.data.tasks;
  const now = todayISO();
  if (appState.filters.tasks === 'today') return tasks.filter(t => t.dueDate === now || (!t.dueDate && t.status !== 'مكتملة'));
  if (appState.filters.tasks === 'week') {
    const week = new Date(); week.setDate(week.getDate() + 7); const max = week.toISOString().slice(0,10);
    return tasks.filter(t => t.dueDate && t.dueDate >= now && t.dueDate <= max);
  }
  if (appState.filters.tasks === 'open') return tasks.filter(t => t.status !== 'مكتملة');
  if (appState.filters.tasks === 'done') return tasks.filter(t => t.status === 'مكتملة');
  return tasks;
}

function renderKanban() {
  return `<div class="kanban">${taskStatuses.map(status => `<div class="kanban-column"><h3>${status}</h3>${appState.data.tasks.filter(t=>t.status===status).map(taskCard).join('') || '<p class="meta">لا يوجد</p>'}</div>`).join('')}</div>`;
}

function taskCard(task) {
  const overdue = task.status !== 'مكتملة' && isPast(task.dueDate);
  const extra = task.status !== 'مكتملة' ? `<button class="btn primary" data-action="complete-task" data-id="${safeText(task.id)}">تم</button>` : '';
  return simpleCard('task', task, `<p>${safeText(task.description || task.notes || 'بدون وصف')}</p><div class="meta"><span>${safeText(task.type)}</span><span>${task.dueDate ? safeText(task.dueDate) : 'بدون موعد'}</span>${task.dueTime ? `<span>${safeText(task.dueTime)}</span>` : ''}${overdue ? '<span class="badge danger">متأخرة</span>' : ''}</div>`, extra);
}

export function openTaskModal(id = '', defaults = {}) {
  const item = appState.data.tasks.find(x => x.id === id) || defaults || {};
  openModal({ title: item.id ? 'تعديل مهمة' : 'إضافة مهمة', saveText: 'حفظ', body: `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}"></label>
    <label>النوع<select name="type">${taskTypes.map(v=>`<option ${v===item.type?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="full">الوصف<textarea name="description">${safeText(item.description || '')}</textarea></label>
    ${linkedFields(item)}
    <label>الأولوية<select name="priority">${priorities.map(v=>`<option ${v===item.priority?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>الحالة<select name="status">${taskStatuses.map(v=>`<option ${v===item.status?'selected':''}>${v}</option>`).join('')}</select></label>
    <label>تاريخ التنفيذ<input type="date" name="dueDate" value="${safeText(item.dueDate || todayISO())}"></label>
    <label>الوقت<input type="time" name="dueTime" value="${safeText(item.dueTime || '')}"></label>
    <label>التذكير<input name="reminder" value="${safeText(item.reminder || '')}" placeholder="مثال: قبلها بساعة"></label>
    <label>التكرار<input name="repeat" value="${safeText(item.repeat || '')}" placeholder="يومي / أسبوعي / بدون"></label>
    <label class="full">ملاحظات<textarea name="notes">${safeText(item.notes || '')}</textarea></label>
  </form>`, onSave: () => {
    const form = document.getElementById('entityForm'); if (!form.reportValidity()) return;
    const d = objectFromForm(form);
    upsert('tasks', { id: d.id || generateId('task'), title: d.title, description: d.description, goalId: d.goalId, projectId: d.projectId, type: d.type, priority: d.priority, status: d.status || 'مفتوحة', dueDate: d.dueDate, dueTime: d.dueTime, reminder: d.reminder, repeat: d.repeat, notes: d.notes, completedAt: d.status === 'مكتملة' ? new Date().toISOString() : item.completedAt || null });
    closeModal(); toast('تم حفظ المهمة');
  }});
}
export function completeTask(id) { const task = appState.data.tasks.find(t=>t.id===id); if (task) upsert('tasks', { ...task, status: 'مكتملة', completedAt: new Date().toISOString() }); }
export function deleteTask(id) { removeItem('tasks', id); }
export function editTask(id) { openTaskModal(id); }
export function setTaskFilter(filter) { appState.filters.tasks = filter; }
