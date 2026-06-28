import { appState } from '../state.js';
import { pageHeader } from '../ui.js';
import { byUpdatedDesc, calculatePercentage, formatCurrency, isPast, isToday, safeText } from '../utils.js';
import { calculateCampaign } from './campaigns.js';

export function getMetrics() {
  const d = appState.data;
  const tasks = d.tasks;
  const done = tasks.filter(t => t.status === 'مكتملة');
  const open = tasks.filter(t => t.status !== 'مكتملة');
  const overdue = open.filter(t => isPast(t.dueDate));
  const dailyReviews = d.reviews.filter(r => r.type === 'يومية');
  const avg = key => dailyReviews.length ? Math.round(dailyReviews.reduce((a,r)=>a+Number(r[key]||0),0)/dailyReviews.length) : 0;
  const projectsWithProgress = d.projects.map(p => ({ ...p, score: calculatePercentage(tasks.filter(t=>t.projectId===p.id && t.status==='مكتملة').length, tasks.filter(t=>t.projectId===p.id).length) || Number(p.progress||0) }));
  const bestProject = projectsWithProgress.sort((a,b)=>b.score-a.score)[0];
  const lateProject = projectsWithProgress.find(p => p.targetDate && isPast(p.targetDate) && p.score < 100);
  return { goals:d.goals.length, activeGoals:d.goals.filter(g=>g.status!=='مكتملة'&&g.status!=='متوقفة').length, projects:d.projects.length, tasks:tasks.length, done:done.length, open:open.length, overdue:overdue.length, completion:calculatePercentage(done.length,tasks.length), knowledge:d.knowledge.length, decisions:d.decisions.length, reviews:d.reviews.length, wins:d.wins.length, campaigns:d.campaigns.length, focus:avg('focusScore'), energy:avg('energyScore'), bestProject, lateProject, lastCampaign:d.campaigns[0], todayTasks:tasks.filter(t=>isToday(t.dueDate) || (!t.dueDate && t.status!=='مكتملة')), lastKnowledge:[...d.knowledge].sort(byUpdatedDesc)[0], lastDecision:[...d.decisions].sort(byUpdatedDesc)[0], lastWin:[...d.wins].sort(byUpdatedDesc)[0] };
}

export function renderHome() {
  const m = getMetrics();
  return `<section class="page home-stack">
    <article class="card hero-card"><h2>أهلاً يا ${safeText(appState.data.settings.userName || 'مجاهد')} 👋</h2><p>مركز القيادة اليومي: ركّز على أهم فعل، حوّل المعرفة إلى تنفيذ، وراجع تقدمك بدون زحمة.</p><div class="btn-row" style="margin-top:14px"><button class="btn primary" data-action="open-task-modal">إضافة مهمة</button><button class="btn ghost" data-action="open-knowledge-modal">إضافة معرفة</button><button class="btn ghost" data-action="open-emergency">طوارئ</button><button class="btn dark" data-route="dashboard">Dashboard كامل</button></div></article>
    <div class="kpi-grid"><div class="kpi-card"><small>مهام مفتوحة</small><strong>${m.open}</strong></div><div class="kpi-card"><small>مهام مكتملة</small><strong>${m.done}</strong></div><div class="kpi-card"><small>أهداف نشطة</small><strong>${m.activeGoals}</strong></div><div class="kpi-card"><small>مشاريع</small><strong>${m.projects}</strong></div></div>
    <article class="card"><h3>مهام اليوم</h3><div class="today-list" style="margin-top:10px">${m.todayTasks.length ? m.todayTasks.slice(0,5).map(t=>`<div class="today-task"><div><b>${safeText(t.title)}</b><div class="meta"><span>${safeText(t.dueTime||'بدون وقت')}</span><span>${safeText(t.priority||'')}</span></div></div><button class="btn primary" data-action="complete-task" data-id="${safeText(t.id)}">تم</button></div>`).join('') : '<p class="meta">لا توجد مهام اليوم. أضف مهمة واحدة فقط وابدأ.</p>'}</div></article>
    <div class="grid grid-2"><article class="card"><h3>تركيز اليوم</h3><p class="meta">اختر مهمة عميقة واحدة، واقفل باقي المشتتات 25 دقيقة.</p></article><article class="card"><h3>آخر معرفة</h3><p>${safeText(m.lastKnowledge?.title || 'لا توجد معرفة بعد')}</p></article><article class="card"><h3>آخر قرار</h3><p>${safeText(m.lastDecision?.title || 'لا يوجد قرار بعد')}</p></article><article class="card"><h3>آخر فوز</h3><p>${safeText(m.lastWin?.title || 'لا يوجد فوز بعد')}</p></article></div>
  </section>`;
}

export function renderDashboard() {
  const m = getMetrics();
  const lastCampaignResult = m.lastCampaign ? calculateCampaign(m.lastCampaign) : null;
  return `<section class="page">${pageHeader('Dashboard كامل', 'لوحة أداء حقيقية محسوبة من بيانات Mogahed OS.', '<button class="btn primary" data-route="home">العودة للرئيسية</button>')}
  <div class="dashboard-grid"><div class="grid"><article class="dashboard-hero"><div class="ring-wrap"><div class="progress-ring" style="--value:${m.completion}"><strong>${m.completion}%</strong></div><div><h2>نسبة الإنجاز العامة</h2><p>محسوبة من المهام المكتملة مقابل كل المهام.</p></div></div></article><div class="kpi-grid"><div class="kpi-card"><small>الأهداف</small><strong>${m.goals}</strong></div><div class="kpi-card"><small>المشاريع</small><strong>${m.projects}</strong></div><div class="kpi-card"><small>المهام</small><strong>${m.tasks}</strong></div><div class="kpi-card"><small>متأخرة</small><strong>${m.overdue}</strong></div><div class="kpi-card"><small>المعرفة</small><strong>${m.knowledge}</strong></div><div class="kpi-card"><small>القرارات</small><strong>${m.decisions}</strong></div><div class="kpi-card"><small>المراجعات</small><strong>${m.reviews}</strong></div><div class="kpi-card"><small>الحملات</small><strong>${m.campaigns}</strong></div></div><article class="card"><h3>الملخص الأسبوعي</h3><div class="bar-chart"><div class="bar-row"><div class="bar-label"><span>التركيز</span><b>${m.focus}/10</b></div><div class="bar-track"><span style="width:${m.focus*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الطاقة</span><b>${m.energy}/10</b></div><div class="bar-track"><span style="width:${m.energy*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الإنجاز</span><b>${m.completion}%</b></div><div class="bar-track"><span style="width:${m.completion}%"></span></div></div></div></article></div><aside class="grid"><article class="card"><h3>أفضل مشروع</h3><p>${safeText(m.bestProject?.title || 'غير متاح')}</p><div class="progress"><span style="width:${m.bestProject?.score || 0}%"></span></div></article><article class="card"><h3>مشروع متأخر</h3><p>${safeText(m.lateProject?.title || 'لا يوجد مشروع متأخر واضح')}</p></article><article class="card"><h3>آخر حملة</h3><p>${safeText(m.lastCampaign?.productName || 'لا توجد حملات')}</p>${lastCampaignResult ? `<p class="meta">استثمار: ${formatCurrency(lastCampaignResult.totalInvestment)} — مخاطرة: ${safeText(lastCampaignResult.risk)}</p>` : ''}</article><article class="card"><h3>Mini Chart</h3><div class="mini-chart">${[m.goals,m.projects,m.open,m.done,m.knowledge,m.campaigns].map(v=>`<span style="height:${Math.max(10, v*12)}px"></span>`).join('')}</div></article></aside></div></section>`;
}
