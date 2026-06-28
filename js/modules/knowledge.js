import { appState } from '../state.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, toast } from '../ui.js';
import { generateId, getYouTubeEmbed, linesToText, parseLines, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';
import { openTaskModal } from './tasks.js';


const types = ['فيديو','Playlist','بودكاست','كتاب PDF','مقال','رابط','ملاحظة','فكرة'];
const statuses = ['جديد','قيد المراجعة','تم تلخيصه','تحول لأفعال','مؤرشف'];

export function renderKnowledge() {
  const actions = '<button class="btn primary" data-action="open-knowledge-modal">إضافة معرفة</button>';
  return `<section class="page">${pageHeader('المعرفة', 'اجمع الفيديوهات والكتب والبودكاست، ثم حوّلها لأهداف ومهام ومشاريع.', actions)}
    <div class="grid grid-2">${appState.data.knowledge.length ? appState.data.knowledge.map(knowledgeCard).join('') : emptyState('صفحة المعرفة جاهزة وليست فارغة', 'ابدأ بإضافة فيديو أو كتاب أو فكرة، وسيظهر المحتوى والملخص والأفكار والأفعال هنا.', actions)}</div>
  </section>`;
}

function knowledgeCard(item) {
  const embed = getYouTubeEmbed(item.url);
  const preview = embed ? `<div class="embed-box"><iframe src="${safeText(embed)}" loading="lazy" title="${safeText(item.title)}" allowfullscreen></iframe></div>` : item.url ? `<a class="btn dark" target="_blank" rel="noopener" href="${safeText(item.url)}">فتح الرابط خارجيًا</a>` : '';
  const extra = `<button class="btn primary" data-action="knowledge-to-task" data-id="${safeText(item.id)}">تحويل لمهمة</button><button class="btn ghost" data-action="review-knowledge" data-id="${safeText(item.id)}">مراجعة</button>`;
  return simpleCard('knowledge', item, `${preview}<div class="meta"><span>${safeText(item.type)}</span><span>${safeText(item.category || 'عام')}</span></div>
    <div class="knowledge-section"><h4>الملخص</h4><p>${safeText(item.summary || 'لا يوجد ملخص بعد')}</p></div>
    <div class="knowledge-section"><h4>الأفكار</h4><div class="chip-list">${(item.extractedIdeas || []).map(x=>`<span class="chip">${safeText(x)}</span>`).join('') || '<span class="meta">لا يوجد</span>'}</div></div>
    <div class="knowledge-section"><h4>الأفعال</h4><div class="chip-list">${(item.extractedActions || []).map(x=>`<span class="chip">${safeText(x)}</span>`).join('') || '<span class="meta">لا يوجد</span>'}</div></div>`, extra);
}

export function openKnowledgeModal(id = '') {
  const item = appState.data.knowledge.find(x => x.id === id) || {};
  openModal({ title: item.id ? 'تعديل معرفة' : 'إضافة معرفة', saveText: 'حفظ', body: `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}"></label>
    <label>النوع<select name="type">${types.map(v=>`<option ${v===item.type?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="full">الرابط<input name="url" value="${safeText(item.url || '')}" placeholder="YouTube / مقال / رابط خارجي"></label>
    <label>اسم الملف<input name="fileName" value="${safeText(item.fileName || '')}" placeholder="اختياري"></label>
    <label>التصنيف<input name="category" value="${safeText(item.category || '')}" placeholder="إنتاجية / تجارة / دين / تعلم"></label>
    <label>الحالة<select name="status">${statuses.map(v=>`<option ${v===item.status?'selected':''}>${v}</option>`).join('')}</select></label>
    ${linkedFields({ goalId: item.linkedGoalId, projectId: item.linkedProjectId })}
    <label class="full">الملخص<textarea name="summary">${safeText(item.summary || '')}</textarea></label>
    <label class="full">الملاحظات<textarea name="notes">${safeText(item.notes || '')}</textarea></label>
    <label class="full">أفكار مستخرجة — كل فكرة في سطر<textarea name="extractedIdeas">${safeText(linesToText(item.extractedIdeas))}</textarea></label>
    <label class="full">أفعال مستخرجة — كل فعل في سطر<textarea name="extractedActions">${safeText(linesToText(item.extractedActions))}</textarea></label>
  </form>
  <div class="btn-row">
    <button class="btn ghost" data-action="knowledge-to-goal" data-id="${safeText(item.id || '')}">تحويل لهدف</button>
    <button class="btn ghost" data-action="knowledge-to-project" data-id="${safeText(item.id || '')}">تحويل لمشروع</button>
    <button class="btn ghost" data-action="knowledge-to-task" data-id="${safeText(item.id || '')}">تحويل لإجراء</button>
  </div>`, onSave: () => saveKnowledge(item) });
}

function saveKnowledge(existing = {}) {
  const form = document.getElementById('entityForm'); if (!form.reportValidity()) return;
  const d = objectFromForm(form);
  upsert('knowledge', { id: d.id || generateId('know'), title: d.title, type: d.type, url: d.url, fileName: d.fileName, category: d.category, status: d.status, summary: d.summary, notes: d.notes, extractedIdeas: parseLines(d.extractedIdeas), extractedActions: parseLines(d.extractedActions), linkedGoalId: d.goalId, linkedProjectId: d.projectId, lastReviewAt: existing.lastReviewAt || null });
  closeModal(); toast('تم حفظ المعرفة');
}

export function knowledgeToTask(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item && document.getElementById('entityForm')) { saveKnowledge({}); return; }
  if (!item) return toast('احفظ المعرفة أولًا');
  openTaskModal('', { title: `إجراء من: ${item.title}`, description: item.summary || item.notes, type: 'إجراء سريع', priority: 'متوسطة', status: 'مفتوحة', goalId: item.linkedGoalId, projectId: item.linkedProjectId });
}
export function knowledgeToGoal(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); upsert('goals', { id: generateId('goal'), title: item.title, description: item.summary || item.notes, reason: 'تم تحويله من المعرفة', status: 'نشط', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, linkedProjects: [], notes: item.url }); toast('تم تحويل المعرفة إلى هدف'); }
export function knowledgeToProject(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); upsert('projects', { id: generateId('project'), title: item.title, description: item.summary || item.notes, goalId: item.linkedGoalId || '', status: 'قيد التنفيذ', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, notes: item.url }); toast('تم تحويل المعرفة إلى مشروع'); }
export function reviewKnowledge(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (item) { item.lastReviewAt = new Date().toISOString(); upsert('knowledge', item); toast('تم تسجيل مراجعة المعرفة'); } }
export function editKnowledge(id) { openKnowledgeModal(id); }
export function deleteKnowledge(id) { removeItem('knowledge', id); }
