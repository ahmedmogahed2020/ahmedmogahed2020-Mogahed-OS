import { appState } from '../state.js';
import { emptyState, pageHeader } from '../ui.js';
import { safeText } from '../utils.js';
import { buildCommonForm, getLinkedTitle, openEntityModal, prepareCommonItem, removeItem, simpleCard } from './shared.js';

export function renderGoals() {
  const goals = appState.data.goals;
  const actions = '<button class="btn primary" data-action="open-goal-modal">إضافة هدف</button>';
  return `<section class="page">${pageHeader('الأهداف', 'حوّل نيتك الكبيرة إلى أهداف واضحة مرتبطة بالمشاريع والمهام.', actions)}
    <div class="toolbar"><input data-action="filter-list" data-list="goals" placeholder="ابحث في الأهداف..."></div>
    <div class="grid grid-2" id="goalsList">${goals.length ? goals.map(goalCard).join('') : emptyState('لا توجد أهداف بعد', 'ابدأ بهدف واحد واضح، ثم اربطه بمشروع ومهام قابلة للتنفيذ.', actions)}</div>
  </section>`;
}

function goalCard(goal) {
  const projects = appState.data.projects.filter(p => p.goalId === goal.id).length;
  return simpleCard('goal', goal, `<p>${safeText(goal.description || 'بدون وصف')}</p><div class="meta"><span>السبب: ${safeText(goal.reason || 'غير محدد')}</span><span>مشاريع مرتبطة: ${projects}</span></div><div class="progress"><span style="width:${Number(goal.progress || 0)}%"></span></div>`);
}

export function openGoalModal(id = '') {
  const item = appState.data.goals.find(x => x.id === id) || {};
  const extra = `<label class="full">لماذا هذا الهدف؟<textarea name="reason">${safeText(item.reason || '')}</textarea></label>`;
  openEntityModal({ collection: 'goals', title: item.id ? 'تعديل هدف' : 'إضافة هدف', item, body: buildCommonForm(item, extra, 'الهدف'), mapData: data => ({ ...prepareCommonItem('goal', data), reason: data.reason, linkedProjects: item.linkedProjects || [] }) });
}

export function deleteGoal(id) { removeItem('goals', id); }
export function editGoal(id) { openGoalModal(id); }
