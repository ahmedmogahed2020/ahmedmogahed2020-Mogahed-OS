import { safeText } from './utils.js';

export function qs(selector, root = document) { return root.querySelector(selector); }
export function qsa(selector, root = document) { return Array.from(root.querySelectorAll(selector)); }

export function toast(message, type = 'info') {
  const root = qs('#toastRoot');
  const node = document.createElement('div');
  node.className = `toast ${type}`;
  node.textContent = message;
  root.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

export function closeModal() {
  const root = qs('#modalRoot');
  root.classList.remove('is-open');
  root.innerHTML = '';
}

export function openModal({ title = 'نافذة', body = '', saveText = '', onSave = null, size = '' }) {
  const root = qs('#modalRoot');
  root.className = `modal-root is-open ${size}`;
  root.innerHTML = `
    <div class="modal-backdrop" data-action="close-modal"></div>
    <section class="modal-panel" role="dialog" aria-modal="true" aria-label="${safeText(title)}">
      <header class="modal-header">
        <h3>${safeText(title)}</h3>
        <div class="modal-actions">
          ${saveText ? `<button type="button" class="btn primary" data-action="modal-save">${safeText(saveText)}</button>` : ''}
          <button type="button" class="btn ghost" data-action="close-modal">إغلاق</button>
        </div>
      </header>
      <div class="modal-body">${body}</div>
    </section>`;
  const saveButton = qs('[data-action="modal-save"]', root);
  if (saveButton && onSave) saveButton.addEventListener('click', onSave);
  setTimeout(() => qs('.modal-panel', root)?.focus?.(), 0);
}

export function confirmDialog(message, onConfirm) {
  openModal({
    title: 'تأكيد مهم',
    body: `<div class="card"><p style="line-height:1.9">${safeText(message)}</p><div class="btn-row" style="margin-top:12px"><button class="btn danger" data-action="confirm-yes">نعم، متأكد</button><button class="btn ghost" data-action="close-modal">إلغاء</button></div></div>`,
  });
  qs('[data-action="confirm-yes"]')?.addEventListener('click', () => { onConfirm?.(); closeModal(); });
}

export function emptyState(title, text, action = '') {
  return `<div class="empty-state"><strong>${safeText(title)}</strong><p>${safeText(text)}</p>${action}</div>`;
}

export function pageHeader(title, subtitle, actions = '') {
  return `<div class="page-header"><div class="page-title"><h2>${safeText(title)}</h2><p>${safeText(subtitle)}</p></div><div class="btn-row">${actions}</div></div>`;
}

export function formValue(form, name) {
  const element = form.elements[name];
  return element ? element.value.trim() : '';
}

export function objectFromForm(form) {
  return Object.fromEntries(new FormData(form).entries());
}

export function options(items, selected = '', placeholder = 'بدون ربط') {
  return `<option value="">${placeholder}</option>${items.map(item => `<option value="${safeText(item.id)}" ${item.id === selected ? 'selected' : ''}>${safeText(item.title || item.productName || 'بدون عنوان')}</option>`).join('')}`;
}

export function statusBadge(status = '') {
  const value = safeText(status || 'غير محدد');
  const cls = value.includes('مكتملة') || value.includes('مكتمل') || value.includes('ناجح') ? 'success' : value.includes('متأخر') || value.includes('عالية') ? 'danger' : value.includes('قيد') || value.includes('مؤجل') ? 'warning' : '';
  return `<span class="badge ${cls}">${value}</span>`;
}

export function renderActions(entity, id, extra = '') {
  return `<div class="btn-row">
    ${extra}
    <button class="btn ghost" data-action="edit-${entity}" data-id="${safeText(id)}">تعديل</button>
    <button class="btn danger" data-action="delete-${entity}" data-id="${safeText(id)}">حذف</button>
  </div>`;
}
