import { appState } from '../state.js';
import { emptyState, options, pageHeader } from '../ui.js';
import { safeText, calculatePercentage } from '../utils.js';
import { buildCommonForm, getLinkedTitle, openEntityModal, prepareCommonItem, removeItem, simpleCard } from './shared.js';

export function renderProjects() {
  const projects = appState.data.projects.map(p => ({ ...p, progress: projectProgress(p) }));
  const actions = '<button class="btn primary" data-action="open-project-modal">إضافة مشروع</button>';
  return `<section class="page">${pageHeader('المشاريع', 'كل مشروع مرتبط بهدف ويظهر داخله المهام والمعرفة والقرارات.', actions)}
    <div class="grid grid-2">${projects.length ? projects.map(projectCard).join('') : emptyState('لا توجد مشاريع', 'أنشئ مشروعًا يخدم هدفًا واحدًا واضحًا.', actions)}</div>
  </section>`;
}

function projectProgress(project) {
  const tasks = appState.data.tasks.filter(t => t.projectId === project.id);
  if (!tasks.length) return Number(project.progress || 0);
  return calculatePercentage(tasks.filter(t => t.status === 'مكتملة').length, tasks.length);
}

function projectCard(project) {
  const tasks = appState.data.tasks.filter(t => t.projectId === project.id).length;
  const knowledge = appState.data.knowledge.filter(k => k.linkedProjectId === project.id || k.projectId === project.id).length;
  const decisions = appState.data.decisions.filter(d => d.linkedProjectId === project.id || d.projectId === project.id).length;
  return simpleCard('project', project, `<p>${safeText(project.description || 'بدون وصف')}</p><div class="meta"><span>الهدف: ${safeText(getLinkedTitle('goals', project.goalId))}</span><span>مهام: ${tasks}</span><span>معرفة: ${knowledge}</span><span>قرارات: ${decisions}</span></div><div class="progress"><span style="width:${project.progress}%"></span></div>`);
}

export function openProjectModal(id = '') {
  const item = appState.data.projects.find(x => x.id === id) || {};
  const extra = `<label>الهدف المرتبط<select name="goalId">${options(appState.data.goals, item.goalId, 'بدون هدف')}</select></label>`;
  openEntityModal({ collection: 'projects', title: item.id ? 'تعديل مشروع' : 'إضافة مشروع', item, body: buildCommonForm(item, extra, 'المشروع'), mapData: data => ({ ...prepareCommonItem('project', data), goalId: data.goalId }) });
}
export function deleteProject(id) { removeItem('projects', id); }
export function editProject(id) { openProjectModal(id); }
