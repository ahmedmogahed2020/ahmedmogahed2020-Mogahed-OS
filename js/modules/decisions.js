import { appState } from '../state.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader } from '../ui.js';
import { generateId, isPast, safeText } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';

export function renderDecisions() {
  const actions = '<button class="btn primary" data-action="open-decision-modal">إضافة قرار</button>';
  const needsReview = appState.data.decisions.filter(d => d.reviewDate && isPast(d.reviewDate) && !d.actualOutcome).length;
  return `<section class="page">${pageHeader('القرارات', `Decision Journal — قرارات تحتاج مراجعة: ${needsReview}`, actions)}
  <div class="grid grid-2">${appState.data.decisions.length ? appState.data.decisions.map(card).join('') : emptyState('لا توجد قرارات', 'سجل القرارات المهمة حتى تراجع جودة تفكيرك لاحقًا.', actions)}</div></section>`;
}
function card(item) {
  const extra = `<button class="btn ghost" data-action="review-decision" data-id="${safeText(item.id)}">مراجعة القرار</button>`;
  return simpleCard('decision', item, `<p>${safeText(item.finalDecision || item.context || 'بدون تفاصيل')}</p><div class="meta"><span>مراجعة: ${safeText(item.reviewDate || 'غير محدد')}</span><span>${item.actualOutcome ? 'تمت المراجعة' : 'لم يراجع'}</span></div>`, extra);
}
export function openDecisionModal(id = '') {
  const item = appState.data.decisions.find(x=>x.id===id) || {};
  openModal({ title: item.id ? 'تعديل قرار' : 'إضافة قرار', saveText: 'حفظ', body: form(item), onSave: saveDecision });
}
function form(item={}) { return `<form id="entityForm" class="form-grid"><input type="hidden" name="id" value="${safeText(item.id||'')}">
<label>عنوان القرار<input name="title" required value="${safeText(item.title||'')}"></label><label>تاريخ المراجعة<input type="date" name="reviewDate" value="${safeText(item.reviewDate||'')}"></label>
<label class="full">السياق<textarea name="context">${safeText(item.context||'')}</textarea></label><label class="full">الاختيارات<textarea name="options">${safeText(item.options||'')}</textarea></label>
<label class="full">القرار النهائي<textarea name="finalDecision">${safeText(item.finalDecision||'')}</textarea></label><label class="full">السبب<textarea name="reason">${safeText(item.reason||'')}</textarea></label>
<label class="full">المخاطر<textarea name="risks">${safeText(item.risks||'')}</textarea></label><label class="full">النتيجة المتوقعة<textarea name="expectedOutcome">${safeText(item.expectedOutcome||'')}</textarea></label>
${linkedFields({goalId:item.linkedGoalId, projectId:item.linkedProjectId})}<label class="full">النتيجة الفعلية<textarea name="actualOutcome">${safeText(item.actualOutcome||'')}</textarea></label><label>هل كان قرارًا جيدًا؟<select name="wasGoodDecision"><option value="">لم يحدد</option><option ${item.wasGoodDecision==='نعم'?'selected':''}>نعم</option><option ${item.wasGoodDecision==='لا'?'selected':''}>لا</option><option ${item.wasGoodDecision==='جزئيًا'?'selected':''}>جزئيًا</option></select></label></form>`; }
function saveDecision() { const formEl = document.getElementById('entityForm'); if(!formEl.reportValidity()) return; const d=objectFromForm(formEl); upsert('decisions',{id:d.id||generateId('decision'), title:d.title, context:d.context, options:d.options, finalDecision:d.finalDecision, reason:d.reason, risks:d.risks, expectedOutcome:d.expectedOutcome, reviewDate:d.reviewDate, actualOutcome:d.actualOutcome, wasGoodDecision:d.wasGoodDecision, linkedGoalId:d.goalId, linkedProjectId:d.projectId}); closeModal(); }
export function reviewDecision(id){ openDecisionModal(id); }
export function editDecision(id){ openDecisionModal(id); }
export function deleteDecision(id){ removeItem('decisions', id); }
