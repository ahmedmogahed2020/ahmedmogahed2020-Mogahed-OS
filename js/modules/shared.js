import { appState } from '../state.js';
import { saveData, autoSave } from '../storage.js';
import { closeModal, confirmDialog, objectFromForm, openModal, options, renderActions, statusBadge, toast } from '../ui.js';
import { clamp, generateId, raw, safeNumber, safeText, todayISO } from '../utils.js';
import { renderPage } from '../router.js';

export const statusOptions = ['نشط','قيد التنفيذ','مفتوحة','مكتملة','مؤجلة','متوقفة','قيد المراجعة'];
export const priorityOptions = ['عالية','متوسطة','منخفضة'];

export function selectHtml(name, values, selected = '', label = '') {
  return `<label>${label || name}<select name="${name}">${values.map(v => `<option ${v === selected ? 'selected' : ''}>${safeText(v)}</option>`).join('')}</select></label>`;
}

export function linkedFields(item = {}) {
  return `
    <label>الهدف المرتبط<select name="goalId">${options(appState.data.goals, item.goalId || item.linkedGoalId, 'بدون هدف')}</select></label>
    <label>المشروع المرتبط<select name="projectId">${options(appState.data.projects, item.projectId || item.linkedProjectId, 'بدون مشروع')}</select></label>`;
}

export function upsert(collection, item) {
  const now = new Date().toISOString();
  const items = appState.data[collection];
  const index = items.findIndex(x => x.id === item.id);
  const finalItem = { ...item, updatedAt: now };
  if (index >= 0) items[index] = { ...items[index], ...finalItem };
  else items.unshift({ ...finalItem, id: item.id || generateId(collection), createdAt: now });
  autoSave();
  renderPage();
}

export function removeItem(collection, id) {
  confirmDialog('هل تريد حذف هذا العنصر؟ لا يمكن التراجع بعد الحذف إلا من نسخة احتياطية.', () => {
    appState.data[collection] = appState.data[collection].filter(item => item.id !== id);
    saveData(); renderPage(); toast('تم الحذف بنجاح');
  });
}

export function simpleCard(entity, item, body = '', extraActions = '') {
  return `<article class="card item-card">
    <div class="btn-row">${statusBadge(item.status || item.priority || item.type)}${item.priority ? statusBadge(item.priority) : ''}</div>
    <h3>${safeText(item.title || item.productName || 'بدون عنوان')}</h3>
    ${body}
    ${renderActions(entity, item.id, extraActions)}
  </article>`;
}

export function prepareCommonItem(collection, data) {
  return {
    id: raw(data.id) || generateId(collection),
    title: raw(data.title),
    description: raw(data.description),
    status: raw(data.status),
    priority: raw(data.priority),
    startDate: raw(data.startDate),
    targetDate: raw(data.targetDate),
    progress: clamp(data.progress),
    notes: raw(data.notes)
  };
}

export function buildCommonForm(item = {}, extra = '', collectionLabel = 'العنصر') {
  return `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}" placeholder="عنوان ${safeText(collectionLabel)}"></label>
    <label>الأولوية<select name="priority">${priorityOptions.map(v => `<option ${v === item.priority ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label class="full">الوصف<textarea name="description" placeholder="وصف مختصر">${safeText(item.description || '')}</textarea></label>
    ${extra}
    <label>الحالة<select name="status">${statusOptions.map(v => `<option ${v === item.status ? 'selected' : ''}>${v}</option>`).join('')}</select></label>
    <label>نسبة التقدم<input name="progress" type="number" min="0" max="100" value="${safeText(item.progress ?? 0)}"></label>
    <label>تاريخ البداية<input name="startDate" type="date" value="${safeText(item.startDate || todayISO())}"></label>
    <label>تاريخ الهدف<input name="targetDate" type="date" value="${safeText(item.targetDate || '')}"></label>
    <label class="full">ملاحظات<textarea name="notes">${safeText(item.notes || '')}</textarea></label>
  </form>`;
}

export function openEntityModal({ collection, title, item = {}, body, mapData }) {
  openModal({
    title,
    saveText: 'حفظ',
    body,
    onSave: () => {
      const form = document.getElementById('entityForm');
      if (!form.reportValidity()) return;
      const data = objectFromForm(form);
      upsert(collection, mapData(data));
      closeModal(); toast('تم الحفظ بنجاح');
    }
  });
}

export function getLinkedTitle(collection, id) {
  if (!id) return 'بدون ربط';
  return appState.data[collection]?.find(x => x.id === id)?.title || 'غير موجود';
}

export function numberField(name, value, label) {
  return `<label>${label}<input name="${name}" type="number" step="0.01" value="${safeText(value ?? 0)}"></label>`;
}
