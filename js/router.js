import { appState, setActivePage } from './state.js';
import { saveData } from './storage.js';
import { qsa, qs } from './ui.js';
import { renderHome } from './modules/dashboard.js';
import { renderGoals } from './modules/goals.js';
import { renderProjects } from './modules/projects.js';
import { renderTasks } from './modules/tasks.js';
import { renderKnowledge } from './modules/knowledge.js';
import { renderMore } from './modules/backup.js';
import { renderDashboard } from './modules/dashboard.js';
import { renderCampaigns } from './modules/campaigns.js';
import { renderDecisions } from './modules/decisions.js';
import { renderReviews } from './modules/reviews.js';
import { renderWins } from './modules/wins.js';

const routes = {
  home: renderHome,
  goals: renderGoals,
  projects: renderProjects,
  tasks: renderTasks,
  knowledge: renderKnowledge,
  more: renderMore,
  dashboard: renderDashboard,
  campaigns: renderCampaigns,
  decisions: renderDecisions,
  reviews: renderReviews,
  wins: renderWins
};

export function navigate(page = 'home') {
  const target = routes[page] ? page : 'home';
  setActivePage(target);
  renderPage();
  saveData();
}

export function renderPage() {
  const main = qs('#mainView');
  const renderer = routes[appState.activePage] || routes.home;
  main.innerHTML = renderer();
  qsa('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.route === appState.activePage));
  main.scrollTo?.(0, 0);
}
