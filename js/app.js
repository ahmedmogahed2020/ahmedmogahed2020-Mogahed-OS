import { loadData, saveData } from './storage.js';
import { appState } from './state.js';
import { navigate, renderPage } from './router.js';
import { closeModal, qs, toast } from './ui.js';
import { openGoalModal, editGoal, deleteGoal, viewGoal, goalToProjects, goalToTasks, setGoalFilter, setGoalSearch } from './modules/goals.js';
import { openProjectModal, editProject, deleteProject, viewProject, projectToTasks, rescueProject, setProjectFilter, setProjectSearch } from './modules/projects.js';
import { openTaskModal, editTask, deleteTask, completeTask, setTaskFilter, toggleTaskComplete, toggleTaskStep, setTaskSearch } from './modules/tasks.js';
import { openKnowledgeModal, editKnowledge, deleteKnowledge, knowledgeToTask, reviewKnowledge, knowledgeToGoal, knowledgeToProject, fetchKnowledgeMetadataFromForm, addTimedNote, seekVideoNote, selectKnowledgeVideo, saveVideoContent, setKnowledgeFilter, setKnowledgeSearch, searchKnowledgeTag, markVideoComplete, scheduleVideoReview, videoContentToTasks } from './modules/knowledge.js';
import { openEmergencyModal, pickEmergency, emergencyToTask } from './modules/emergency.js';
import { openDecisionModal, editDecision, deleteDecision, reviewDecision, decisionToTasks, setDecisionFilter, setDecisionSearch } from './modules/decisions.js';
import { openReviewModal, editReview, deleteReview, createDailyReview, createWeeklyReview, reviewToTasks, setReviewFilter, setReviewSearch } from './modules/reviews.js';
import { openWinModal, editWin, deleteWin, duplicateWin, recordSuggestedWin, claimWinReward, setWinFilter, setWinSearch } from './modules/wins.js';
import { openCampaignModal, editCampaign, deleteCampaign, viewCampaign, campaignToTasks, openCampaignCompare, setCampaignFilter, setCampaignSearch } from './modules/campaigns.js';
import { openSearchModal, jumpTo, openSearchResult, openRecentItem, runSearchCommand, clearRecentItems } from './modules/search.js';
import { startFocusSession } from './modules/dashboard.js';
import { doBackup, doClear, doExport, doImport, forceSaveData, showBackup, showSettings, showQA, showNotifications, showGuide, runQA, updateUserName, updateYouTubeApiKey, updateStoreName, updateCurrency, updateDailyTaskTarget, updateLearningMinutesTarget, updateQuietMode, updateCompactMode, updateSeedData } from './modules/backup.js';
import { initNotifications, testNotificationSound, testCategorySound, requestNotificationPermission, updateNotificationEnabled, updateNotificationSoundEnabled, updateNotificationBrowserEnabled, updateNotificationLeadMinutes, updateNotificationVolume, updateNotificationSoundType, updateNotificationCategorySound, resetNotificationSounds, markNotificationRead, clearNotificationLog } from './modules/notifications.js';

const actionMap = {
  'open-goal-modal': () => openGoalModal(), 'edit-goal': id => editGoal(id), 'delete-goal': id => deleteGoal(id), 'view-goal': id => viewGoal(id), 'goal-to-projects': id => goalToProjects(id), 'goal-to-tasks': id => goalToTasks(id), 'set-goal-filter': (_, el) => setGoalFilter(el.dataset.filter),
  'open-project-modal': () => openProjectModal(), 'edit-project': id => editProject(id), 'delete-project': id => deleteProject(id), 'view-project': id => viewProject(id), 'project-to-tasks': id => projectToTasks(id), 'rescue-project': id => rescueProject(id), 'set-project-filter': (_, el) => setProjectFilter(el.dataset.filter),
  'open-task-modal': () => openTaskModal(), 'edit-task': id => editTask(id), 'delete-task': id => deleteTask(id), 'complete-task': id => completeTask(id), 'toggle-task-complete': id => toggleTaskComplete(id), 'toggle-task-step': (id, el) => toggleTaskStep(id, el.dataset.stepIndex),
  'open-knowledge-modal': () => openKnowledgeModal(), 'edit-knowledge': id => editKnowledge(id), 'delete-knowledge': id => deleteKnowledge(id), 'knowledge-to-task': id => knowledgeToTask(id), 'review-knowledge': id => reviewKnowledge(id), 'knowledge-to-goal': id => knowledgeToGoal(id), 'knowledge-to-project': id => knowledgeToProject(id), 'fetch-knowledge-metadata': () => fetchKnowledgeMetadataFromForm(), 'add-video-note': id => addTimedNote(id), 'seek-video-note': (id, el) => seekVideoNote(id, el.dataset.noteId), 'knowledge-select-video': (id, el) => selectKnowledgeVideo(id, el.dataset.videoId), 'save-video-content': id => saveVideoContent(id), 'mark-video-complete': id => markVideoComplete(id), 'schedule-video-review': id => scheduleVideoReview(id), 'video-content-to-tasks': id => videoContentToTasks(id), 'knowledge-search-tag': (_, el) => searchKnowledgeTag(el.dataset.tag),
  'open-emergency': () => openEmergencyModal(), 'emergency-pick': (_, el) => pickEmergency(el.dataset.state), 'emergency-to-task': () => emergencyToTask(),
  'open-decision-modal': () => openDecisionModal(), 'edit-decision': id => editDecision(id), 'delete-decision': id => deleteDecision(id), 'review-decision': id => reviewDecision(id), 'decision-to-tasks': id => decisionToTasks(id), 'set-decision-filter': (_, el) => setDecisionFilter(el.dataset.filter),
  'open-review-modal': (_, el) => openReviewModal('', el.dataset.type), 'create-daily-review': () => createDailyReview(), 'create-weekly-review': () => createWeeklyReview(), 'review-to-tasks': id => reviewToTasks(id), 'set-review-filter': (_, el) => setReviewFilter(el.dataset.filter), 'edit-review': id => editReview(id), 'delete-review': id => deleteReview(id),
  'open-win-modal': () => openWinModal(), 'edit-win': id => editWin(id), 'delete-win': id => deleteWin(id), 'duplicate-win': id => duplicateWin(id), 'record-suggested-win': id => recordSuggestedWin(id), 'claim-win-reward': id => claimWinReward(id), 'set-win-filter': (_, el) => setWinFilter(el.dataset.filter),
  'open-campaign-modal': () => openCampaignModal(), 'edit-campaign': id => editCampaign(id), 'delete-campaign': id => deleteCampaign(id), 'view-campaign': id => viewCampaign(id), 'campaign-to-tasks': id => campaignToTasks(id), 'open-campaign-compare': () => openCampaignCompare(), 'set-campaign-filter': (_, el) => { setCampaignFilter(el.dataset.filter); },
  'start-focus-session': () => startFocusSession(),
  'open-search': () => openSearchModal(), 'search-jump': (_, el) => { closeModal(); jumpTo(el.dataset.routeTarget); }, 'search-open-result': (_, el) => openSearchResult(el.dataset.uid), 'search-open-recent': (_, el) => openRecentItem(el.dataset.uid), 'search-command': (_, el) => runSearchCommand(el.dataset.commandId), 'search-clear-recent': () => clearRecentItems(),
  'show-backup': () => showBackup(), 'show-settings': () => showSettings(), 'show-qa': () => showQA(), 'show-notifications': () => showNotifications(), 'show-guide': () => showGuide(), 'run-system-test': () => runQA(), 'export-json': () => doExport(), 'backup-date': () => doBackup(), 'force-save-data': () => forceSaveData(), 'clear-data': () => doClear(),
  'test-notification-sound': (_, el) => testNotificationSound(el?.dataset?.soundId || ''), 'test-category-sound': (_, el) => testCategorySound(el?.dataset?.category || 'system'), 'reset-notification-sounds': () => resetNotificationSounds(), 'request-notification-permission': () => requestNotificationPermission(), 'mark-notification-read': id => markNotificationRead(id), 'clear-notification-log': () => clearNotificationLog(),
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
  if (el.matches('[data-action="knowledge-filter"]')) setKnowledgeFilter(el.value);
  if (el.matches('[data-action="settings-currency"]')) updateCurrency(el.value);
  if (el.matches('[data-action="settings-quiet-mode"]')) updateQuietMode(el.checked);
  if (el.matches('[data-action="settings-compact-mode"]')) updateCompactMode(el.checked);
  if (el.matches('[data-action="settings-seed-data"]')) updateSeedData(el.checked);
  if (el.matches('[data-action="notification-enabled"]')) updateNotificationEnabled(el.checked);
  if (el.matches('[data-action="notification-sound-enabled"]')) updateNotificationSoundEnabled(el.checked);
  if (el.matches('[data-action="notification-browser-enabled"]')) updateNotificationBrowserEnabled(el.checked);
  if (el.matches('[data-action="notification-sound-type"]')) updateNotificationSoundType(el.value);
  if (el.matches('[data-action="notification-category-sound"]')) updateNotificationCategorySound(el.dataset.category, el.value);
}

function handleInput(event) {
  const el = event.target;
  if (el.matches('[data-action="settings-name"]')) updateUserName(el.value);
  if (el.matches('[data-action="settings-youtube-key"]')) updateYouTubeApiKey(el.value);
  if (el.matches('[data-action="settings-store-name"]')) updateStoreName(el.value);
  if (el.matches('[data-action="settings-daily-task-target"]')) updateDailyTaskTarget(el.value);
  if (el.matches('[data-action="settings-learning-minutes-target"]')) updateLearningMinutesTarget(el.value);
  if (el.matches('[data-action="filter-list"]')) filterCards(el.value, el.dataset.list);
  if (el.matches('[data-action="knowledge-search"]')) setKnowledgeSearch(el.value);
  if (el.matches('[data-action="task-search"]')) setTaskSearch(el.value);
  if (el.matches('[data-action="goal-search"]')) setGoalSearch(el.value);
  if (el.matches('[data-action="project-search"]')) setProjectSearch(el.value);
  if (el.matches('[data-action="campaign-search"]')) setCampaignSearch(el.value);
  if (el.matches('[data-action="review-search"]')) setReviewSearch(el.value);
  if (el.matches('[data-action="win-search"]')) setWinSearch(el.value);
  if (el.matches('[data-action="decision-search"]')) setDecisionSearch(el.value);
  if (el.matches('[data-action="notification-lead-minutes"]')) updateNotificationLeadMinutes(el.value);
  if (el.matches('[data-action="notification-volume"]')) updateNotificationVolume(el.value);
}

function filterCards(query, listId) {
  const root = document.getElementById(`${listId}List`);
  if (!root) return;
  const q = query.trim().toLowerCase();
  root.querySelectorAll('.item-card').forEach(card => card.style.display = card.textContent.toLowerCase().includes(q) ? '' : 'none');
}

function handleKeydown(event) {
  const target = event.target;
  const isTyping = target && ['INPUT','TEXTAREA','SELECT'].includes(target.tagName);
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); openSearchModal(); return; }
  if (!isTyping && event.key === '/') { event.preventDefault(); openSearchModal(); }
}

function init() {
  loadData();
  document.body.classList.toggle('compact-mode', Boolean(appState.data.settings.compactMode));
  document.addEventListener('click', handleClick);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  document.addEventListener('keydown', handleKeydown);
  window.addEventListener('beforeunload', saveData);
  initNotifications();
  navigate(appState.data.settings.lastPage || 'home');
  toast('Mogahed OS جاهز للعمل');
}

init();
