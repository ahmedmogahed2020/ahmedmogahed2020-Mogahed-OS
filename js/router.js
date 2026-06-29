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
  document.body.dataset.page = target;
  renderPage();
  saveData();
}

export function renderPage() {
  const main = qs('#mainView');
  if (!main) return;
  document.body.dataset.page = appState.activePage || 'home';
  const renderer = routes[appState.activePage] || routes.home;
  try {
    const html = renderer();
    main.innerHTML = html || `<section class="page"><article class="card"><h3>لا يوجد محتوى للصفحة</h3><p class="meta">تم فتح الصفحة لكن لم يرجع محتوى واضح.</p></article></section>`;
  } catch (error) {
    console.error('Render failed:', appState.activePage, error);
    main.innerHTML = `<section class="page"><article class="card"><h3>حدث خطأ في عرض الصفحة</h3><p class="meta">الصفحة: ${appState.activePage || 'home'} — ${String(error?.message || error || 'خطأ غير معروف')}</p><div class="btn-row"><button class="btn primary" data-route="home">فتح الرئيسية</button><button class="btn ghost" data-action="show-qa">System Health</button></div></article></section>`;
  }
  qsa('.nav-item').forEach(btn => btn.classList.toggle('active', btn.dataset.route === appState.activePage));
  main.scrollTo?.(0, 0);
}
