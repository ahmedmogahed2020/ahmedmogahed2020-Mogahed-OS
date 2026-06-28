import { loadData, saveData } from './storage.js';
import { appState } from './state.js';
import { navigate, renderPage } from './router.js';
import { closeModal, qs, toast } from './ui.js';
import { openGoalModal, editGoal, deleteGoal } from './modules/goals.js';
import { openProjectModal, editProject, deleteProject } from './modules/projects.js';
import { openTaskModal, editTask, deleteTask, completeTask, setTaskFilter } from './modules/tasks.js';
import { openKnowledgeModal, editKnowledge, deleteKnowledge, knowledgeToTask, reviewKnowledge, knowledgeToGoal, knowledgeToProject } from './modules/knowledge.js';
import { openEmergencyModal, pickEmergency, emergencyToTask } from './modules/emergency.js';
import { openDecisionModal, editDecision, deleteDecision, reviewDecision } from './modules/decisions.js';
import { openReviewModal, editReview, deleteReview } from './modules/reviews.js';
import { openWinModal, editWin, deleteWin } from './modules/wins.js';
import { openCampaignModal, editCampaign, deleteCampaign, viewCampaign } from './modules/campaigns.js';
import { openSearchModal, jumpTo } from './modules/search.js';
import { doBackup, doClear, doExport, doImport, showBackup, showSettings, updateUserName } from './modules/backup.js';

const actionMap = {
  'open-goal-modal': () => openGoalModal(), 'edit-goal': id => editGoal(id), 'delete-goal': id => deleteGoal(id),
  'open-project-modal': () => openProjectModal(), 'edit-project': id => editProject(id), 'delete-project': id => deleteProject(id),
  'open-task-modal': () => openTaskModal(), 'edit-task': id => editTask(id), 'delete-task': id => deleteTask(id), 'complete-task': id => completeTask(id),
  'open-knowledge-modal': () => openKnowledgeModal(), 'edit-knowledge': id => editKnowledge(id), 'delete-knowledge': id => deleteKnowledge(id), 'knowledge-to-task': id => knowledgeToTask(id), 'review-knowledge': id => reviewKnowledge(id), 'knowledge-to-goal': id => knowledgeToGoal(id), 'knowledge-to-project': id => knowledgeToProject(id),
  'open-emergency': () => openEmergencyModal(), 'emergency-pick': (_, el) => pickEmergency(el.dataset.state), 'emergency-to-task': () => emergencyToTask(),
  'open-decision-modal': () => openDecisionModal(), 'edit-decision': id => editDecision(id), 'delete-decision': id => deleteDecision(id), 'review-decision': id => reviewDecision(id),
  'open-review-modal': (_, el) => openReviewModal('', el.dataset.type), 'edit-review': id => editReview(id), 'delete-review': id => deleteReview(id),
  'open-win-modal': () => openWinModal(), 'edit-win': id => editWin(id), 'delete-win': id => deleteWin(id),
  'open-campaign-modal': () => openCampaignModal(), 'edit-campaign': id => editCampaign(id), 'delete-campaign': id => deleteCampaign(id), 'view-campaign': id => viewCampaign(id),
  'open-search': () => openSearchModal(), 'search-jump': (_, el) => { closeModal(); jumpTo(el.dataset.routeTarget); },
  'show-backup': () => showBackup(), 'show-settings': () => showSettings(), 'export-json': () => doExport(), 'backup-date': () => doBackup(), 'clear-data': () => doClear(),
  'close-modal': () => closeModal(), 'toggle-quick-actions': () => toggleQuickActions(), 'set-task-filter': (_, el) => { setTaskFilter(el.dataset.filter); renderPage(); }
};

function toggleQuickActions(force) {
  const open = typeof force === 'boolean' ? force : !appState.ui.quickActionsOpen;
  appState.ui.quickActionsOpen = open;
  qs('#quickActions')?.classList.toggle('is-open', open);
  qs('#quickActions')?.setAttribute('aria-hidden', String(!open));
  qs('#mainFab')?.classList.toggle('is-open', open);
}

function handleClick(event) {
  const routeButton = event.target.closest('[data-route]');
  if (routeButton) { toggleQuickActions(false); navigate(routeButton.dataset.route); return; }
  const actionButton = event.target.closest('[data-action]');
  if (!actionButton) return;
  const action = actionButton.dataset.action;
  if (action === 'import-json') return;
  const handler = actionMap[action];
  if (handler) { event.preventDefault(); handler(actionButton.dataset.id, actionButton); }
}

function handleChange(event) {
  const el = event.target;
  if (el.matches('[data-action="import-json"]')) doImport(el.files?.[0]);
}

function handleInput(event) {
  const el = event.target;
  if (el.matches('[data-action="settings-name"]')) updateUserName(el.value);
  if (el.matches('[data-action="filter-list"]')) filterCards(el.value, el.dataset.list);
}

function filterCards(query, listId) {
  const root = document.getElementById(`${listId}List`);
  if (!root) return;
  const q = query.trim().toLowerCase();
  root.querySelectorAll('.item-card').forEach(card => card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none');
}

function init() {
  loadData();
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  window.addEventListener('beforeunload', saveData);
  navigate(appState.data.settings.lastPage || 'home');
  toast('Mogahed OS جاهز للعمل');
}

init();
