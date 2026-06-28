import { appState } from '../state.js';
import { pageHeader } from '../ui.js';
import { byUpdatedDesc, calculatePercentage, formatCurrency, formatDate, isPast, isToday, safeNumber, safeText, todayISO } from '../utils.js';
import { calculateCampaign } from './campaigns.js';
import { secondsToTime } from './youtube.js';

const DONE_LEARNING_STATUSES = ['انتهيت', 'تم تحويله لتنفيذ'];

function getKnowledgeVideoEntries(item) {
  const youtube = item.youtube || {};
  const videos = Array.isArray(youtube.playlistItems) && youtube.playlistItems.length
    ? youtube.playlistItems
    : [{ videoId: youtube.videoId || 'general', title: item.title, durationSeconds: youtube.durationSeconds || 0 }];

  return videos.map((video, index) => {
    const id = video.videoId || 'general';
    const content = item.videoContent?.[id] || {};
    return {
      id,
      index,
      itemId: item.id,
      itemTitle: item.title,
      title: video.title || item.title || 'درس بدون عنوان',
      kind: youtube.kind || item.type || 'معرفة',
      durationSeconds: safeNumber(video.durationSeconds || youtube.durationSeconds),
      channelTitle: youtube.channelTitle || '',
      content,
      learningStatus: content.learningStatus || 'لم أبدأ',
      tags: Array.isArray(content.tags) ? content.tags : [],
      reviewAt: content.reviewAt || '',
      convertedAt: content.convertedAt || '',
      linkedProjectId: content.linkedProjectId || item.linkedProjectId || '',
      linkedGoalId: content.linkedGoalId || item.linkedGoalId || '',
      actions: Array.isArray(content.extractedActions) ? content.extractedActions.filter(Boolean) : [],
      ideas: Array.isArray(content.extractedIdeas) ? content.extractedIdeas.filter(Boolean) : []
    };
  });
}

function getWatchedSecondsForEntry(item, entry) {
  const progress = item.videoProgress || {};
  const completed = Array.isArray(progress.completedVideoIds) ? progress.completedVideoIds : [];
  if (completed.includes(entry.id)) return entry.durationSeconds;
  if (progress.byVideo && Object.prototype.hasOwnProperty.call(progress.byVideo, entry.id)) {
    return Math.min(safeNumber(progress.byVideo[entry.id]), entry.durationSeconds || safeNumber(progress.byVideo[entry.id]));
  }
  if (entry.id === (item.youtube?.currentVideoId || item.youtube?.videoId || 'general')) {
    return Math.min(safeNumber(progress.watchedSeconds), entry.durationSeconds || safeNumber(progress.watchedSeconds));
  }
  return 0;
}

function isLearningReviewDue(entry) {
  return Boolean(entry.reviewAt && entry.reviewAt <= todayISO() && entry.learningStatus !== 'تم تحويله لتنفيذ');
}

function topCounts(items, limit = 5) {
  const counts = new Map();
  items.filter(Boolean).forEach(item => counts.set(item, (counts.get(item) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, limit).map(([label, count]) => ({ label, count }));
}

function getKnowledgeIntelligence() {
  const knowledge = appState.data.knowledge || [];
  const entries = knowledge.flatMap(getKnowledgeVideoEntries);
  const totalLessons = entries.length;
  const completedLessons = entries.filter(entry => DONE_LEARNING_STATUSES.includes(entry.learningStatus)).length;
  const reviewDueEntries = entries.filter(entry => entry.learningStatus === 'أحتاج مراجعة' || isLearningReviewDue(entry));
  const convertedEntries = entries.filter(entry => entry.learningStatus === 'تم تحويله لتنفيذ' || entry.convertedAt);
  const withActions = entries.filter(entry => entry.actions.length);
  const actionlessCompleted = entries.filter(entry => DONE_LEARNING_STATUSES.includes(entry.learningStatus) && !entry.actions.length && !entry.convertedAt);
  const unconvertedWithActions = entries.filter(entry => entry.actions.length && !entry.convertedAt && entry.learningStatus !== 'تم تحويله لتنفيذ');
  const totalDurationSeconds = entries.reduce((sum, entry) => sum + entry.durationSeconds, 0);
  const watchedSeconds = knowledge.reduce((sum, item) => sum + getKnowledgeVideoEntries(item).reduce((inner, entry) => inner + getWatchedSecondsForEntry(item, entry), 0), 0);
  const playlistItems = knowledge.filter(item => item.youtube?.kind === 'playlist' && item.youtube?.playlistItems?.length);
  const playlistCompletion = playlistItems.length
    ? Math.round(playlistItems.reduce((sum, item) => {
        const listEntries = getKnowledgeVideoEntries(item);
        const done = listEntries.filter(entry => DONE_LEARNING_STATUSES.includes(entry.learningStatus)).length;
        return sum + calculatePercentage(done, listEntries.length);
      }, 0) / playlistItems.length)
    : 0;

  const tags = topCounts(entries.flatMap(entry => entry.tags), 6);
  const projectCounts = topCounts(entries.map(entry => {
    const project = appState.data.projects.find(p => p.id === entry.linkedProjectId);
    return project?.title || '';
  }), 4);
  const goalCounts = topCounts(entries.map(entry => {
    const goal = appState.data.goals.find(g => g.id === entry.linkedGoalId);
    return goal?.title || '';
  }), 4);

  const mostActionable = entries
    .map(entry => ({ ...entry, actionScore: entry.actions.length + entry.ideas.length }))
    .filter(entry => entry.actionScore > 0)
    .sort((a, b) => b.actionScore - a.actionScore)
    .slice(0, 5);

  const unfinished = entries
    .filter(entry => !DONE_LEARNING_STATUSES.includes(entry.learningStatus))
    .sort((a, b) => safeNumber(b.durationSeconds) - safeNumber(a.durationSeconds))
    .slice(0, 5);

  return {
    totalLessons,
    completedLessons,
    pendingLessons: Math.max(0, totalLessons - completedLessons),
    reviewDue: reviewDueEntries.length,
    reviewDueEntries: reviewDueEntries.slice(0, 5),
    converted: convertedEntries.length,
    withActions: withActions.length,
    actionlessCompleted: actionlessCompleted.length,
    unconvertedWithActions: unconvertedWithActions.length,
    totalDurationSeconds,
    watchedSeconds,
    remainingSeconds: Math.max(0, totalDurationSeconds - watchedSeconds),
    learningCompletion: calculatePercentage(completedLessons, totalLessons),
    watchCompletion: calculatePercentage(watchedSeconds, totalDurationSeconds),
    playlistCount: playlistItems.length,
    playlistCompletion,
    tags,
    projectCounts,
    goalCounts,
    mostActionable,
    unfinished
  };
}

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
  const knowledgeIntel = getKnowledgeIntelligence();
  return { goals:d.goals.length, activeGoals:d.goals.filter(g=>g.status!=='مكتملة'&&g.status!=='متوقفة').length, projects:d.projects.length, tasks:tasks.length, done:done.length, open:open.length, overdue:overdue.length, completion:calculatePercentage(done.length,tasks.length), knowledge:d.knowledge.length, decisions:d.decisions.length, reviews:d.reviews.length, wins:d.wins.length, campaigns:d.campaigns.length, focus:avg('focusScore'), energy:avg('energyScore'), bestProject, lateProject, lastCampaign:d.campaigns[0], todayTasks:tasks.filter(t=>isToday(t.dueDate) || (!t.dueDate && t.status!=='مكتملة')), lastKnowledge:[...d.knowledge].sort(byUpdatedDesc)[0], lastDecision:[...d.decisions].sort(byUpdatedDesc)[0], lastWin:[...d.wins].sort(byUpdatedDesc)[0], knowledgeIntel };
}

function renderDashboardList(items, emptyText, renderer) {
  if (!items.length) return `<p class="meta">${safeText(emptyText)}</p>`;
  return `<div class="dashboard-list">${items.map(renderer).join('')}</div>`;
}

function renderTopChips(items, emptyText) {
  if (!items.length) return `<p class="meta">${safeText(emptyText)}</p>`;
  return `<div class="dashboard-chip-row">${items.map(item => `<span class="dashboard-chip">${safeText(item.label)} <b>${safeText(item.count)}</b></span>`).join('')}</div>`;
}

function renderKnowledgeIntelligenceSection(k) {
  const learningSignal = k.totalLessons === 0
    ? 'ابدأ بإضافة فيديو أو Playlist في المعرفة.'
    : k.unconvertedWithActions > 0
      ? `عندك ${k.unconvertedWithActions} درس فيه أفعال ولم يتحول لتنفيذ.`
      : k.reviewDue > 0
        ? `عندك ${k.reviewDue} درس يحتاج مراجعة.`
        : 'المعرفة مستقرة. استمر في تحويل التعلم إلى مهام.';

  return `<section class="knowledge-intel-section">
    <article class="dashboard-hero knowledge-hero">
      <div class="ring-wrap">
        <div class="progress-ring knowledge-ring" style="--value:${safeText(k.learningCompletion)}"><strong>${safeText(k.learningCompletion)}%</strong></div>
        <div>
          <h2>ذكاء المعرفة</h2>
          <p>${safeText(learningSignal)}</p>
          <div class="dashboard-chip-row compact"><span>مشاهدة ${safeText(k.watchCompletion)}%</span><span>متبقي ${safeText(secondsToTime(k.remainingSeconds))}</span><span>إجمالي ${safeText(secondsToTime(k.totalDurationSeconds))}</span></div>
        </div>
      </div>
    </article>

    <div class="kpi-grid knowledge-kpi-grid">
      <div class="kpi-card"><small>دروس المعرفة</small><strong>${safeText(k.totalLessons)}</strong></div>
      <div class="kpi-card"><small>مكتمل</small><strong>${safeText(k.completedLessons)}</strong></div>
      <div class="kpi-card"><small>متبقي</small><strong>${safeText(k.pendingLessons)}</strong></div>
      <div class="kpi-card warning"><small>يحتاج مراجعة</small><strong>${safeText(k.reviewDue)}</strong></div>
      <div class="kpi-card"><small>تحول لمهام</small><strong>${safeText(k.converted)}</strong></div>
      <div class="kpi-card"><small>به أفعال</small><strong>${safeText(k.withActions)}</strong></div>
      <div class="kpi-card"><small>Playlist</small><strong>${safeText(k.playlistCount)}</strong></div>
      <div class="kpi-card"><small>اكتمال Playlist</small><strong>${safeText(k.playlistCompletion)}%</strong></div>
    </div>

    <div class="grid grid-2">
      <article class="card"><h3>تقدم المشاهدة</h3><div class="bar-chart">
        <div class="bar-row"><div class="bar-label"><span>اكتمال التعلم</span><b>${safeText(k.learningCompletion)}%</b></div><div class="bar-track"><span style="width:${safeText(k.learningCompletion)}%"></span></div></div>
        <div class="bar-row"><div class="bar-label"><span>وقت المشاهدة</span><b>${safeText(k.watchCompletion)}%</b></div><div class="bar-track"><span style="width:${safeText(k.watchCompletion)}%"></span></div></div>
        <div class="bar-row"><div class="bar-label"><span>متوسط Playlist</span><b>${safeText(k.playlistCompletion)}%</b></div><div class="bar-track"><span style="width:${safeText(k.playlistCompletion)}%"></span></div></div>
      </div></article>
      <article class="card"><h3>أكثر Tags تتعلمها</h3>${renderTopChips(k.tags, 'لا توجد Tags بعد داخل فيديوهات المعرفة.')}</article>
      <article class="card"><h3>معرفة تحتاج مراجعة</h3>${renderDashboardList(k.reviewDueEntries, 'لا توجد مراجعات معرفة مستحقة الآن.', entry => `<div class="dashboard-list-item"><b>${safeText(entry.title)}</b><span>${entry.reviewAt ? safeText(formatDate(entry.reviewAt)) : 'مطلوب مراجعة'}</span></div>`)}</article>
      <article class="card"><h3>معرفة جاهزة للتنفيذ</h3>${renderDashboardList(k.mostActionable, 'اكتب أفعال أو أفكار داخل الفيديوهات لتظهر هنا.', entry => `<div class="dashboard-list-item"><b>${safeText(entry.title)}</b><span>${safeText(entry.actions.length)} فعل / ${safeText(entry.ideas.length)} فكرة</span></div>`)}</article>
      <article class="card"><h3>مشاريع مرتبطة بالتعلم</h3>${renderTopChips(k.projectCounts, 'لم يتم ربط فيديوهات بمشاريع بعد.')}</article>
      <article class="card"><h3>أهداف مرتبطة بالتعلم</h3>${renderTopChips(k.goalCounts, 'لم يتم ربط فيديوهات بأهداف بعد.')}</article>
    </div>

    ${k.actionlessCompleted ? `<article class="dashboard-warning-card"><b>تنبيه تنفيذ</b><span>عندك ${safeText(k.actionlessCompleted)} درس مكتمل بدون أفعال مستخرجة. الأفضل ترجع لهم وتطلع مهمة واحدة على الأقل.</span></article>` : ''}
  </section>`;
}

export function renderHome() {
  const m = getMetrics();
  const k = m.knowledgeIntel;
  return `<section class="page home-stack">
    <article class="card hero-card"><h2>أهلاً يا ${safeText(appState.data.settings.userName || 'مجاهد')} 👋</h2><p>مركز القيادة اليومي: ركّز على أهم فعل، حوّل المعرفة إلى تنفيذ، وراجع تقدمك بدون زحمة.</p><div class="btn-row" style="margin-top:14px"><button class="btn primary" data-action="open-task-modal">إضافة مهمة</button><button class="btn ghost" data-action="open-knowledge-modal">إضافة معرفة</button><button class="btn ghost" data-action="open-emergency">طوارئ</button><button class="btn dark" data-route="dashboard">Dashboard كامل</button></div></article>
    <div class="kpi-grid"><div class="kpi-card"><small>مهام مفتوحة</small><strong>${m.open}</strong></div><div class="kpi-card"><small>مهام مكتملة</small><strong>${m.done}</strong></div><div class="kpi-card"><small>أهداف نشطة</small><strong>${m.activeGoals}</strong></div><div class="kpi-card"><small>مشاريع</small><strong>${m.projects}</strong></div></div>
    <article class="card home-knowledge-intel"><div><h3>نبض المعرفة</h3><p class="meta">${k.reviewDue ? `عندك ${safeText(k.reviewDue)} درس يحتاج مراجعة.` : `اكتمال التعلم ${safeText(k.learningCompletion)}% — متبقي ${safeText(secondsToTime(k.remainingSeconds))}.`}</p></div><div class="progress"><span style="width:${safeText(k.learningCompletion)}%"></span></div><div class="btn-row"><button class="btn ghost" data-route="knowledge">فتح المعرفة</button><button class="btn dark" data-route="dashboard">تحليل كامل</button></div></article>
    <article class="card"><h3>مهام اليوم</h3><div class="today-list" style="margin-top:10px">${m.todayTasks.length ? m.todayTasks.slice(0,5).map(t=>`<div class="today-task"><div><b>${safeText(t.title)}</b><div class="meta"><span>${safeText(t.dueTime||'بدون وقت')}</span><span>${safeText(t.priority||'')}</span></div></div><button class="btn primary" data-action="complete-task" data-id="${safeText(t.id)}">تم</button></div>`).join('') : '<p class="meta">لا توجد مهام اليوم. أضف مهمة واحدة فقط وابدأ.</p>'}</div></article>
    <div class="grid grid-2"><article class="card"><h3>تركيز اليوم</h3><p class="meta">اختر مهمة عميقة واحدة، واقفل باقي المشتتات 25 دقيقة.</p></article><article class="card"><h3>آخر معرفة</h3><p>${safeText(m.lastKnowledge?.title || 'لا توجد معرفة بعد')}</p></article><article class="card"><h3>آخر قرار</h3><p>${safeText(m.lastDecision?.title || 'لا يوجد قرار بعد')}</p></article><article class="card"><h3>آخر فوز</h3><p>${safeText(m.lastWin?.title || 'لا يوجد فوز بعد')}</p></article></div>
  </section>`;
}

export function renderDashboard() {
  const m = getMetrics();
  const k = m.knowledgeIntel;
  const lastCampaignResult = m.lastCampaign ? calculateCampaign(m.lastCampaign) : null;
  return `<section class="page">${pageHeader('Dashboard كامل', 'لوحة أداء حقيقية محسوبة من بيانات Mogahed OS.', '<button class="btn primary" data-route="home">العودة للرئيسية</button>')}
  <div class="dashboard-grid"><div class="grid"><article class="dashboard-hero"><div class="ring-wrap"><div class="progress-ring" style="--value:${m.completion}"><strong>${m.completion}%</strong></div><div><h2>نسبة الإنجاز العامة</h2><p>محسوبة من المهام المكتملة مقابل كل المهام.</p></div></div></article><div class="kpi-grid"><div class="kpi-card"><small>الأهداف</small><strong>${m.goals}</strong></div><div class="kpi-card"><small>المشاريع</small><strong>${m.projects}</strong></div><div class="kpi-card"><small>المهام</small><strong>${m.tasks}</strong></div><div class="kpi-card"><small>متأخرة</small><strong>${m.overdue}</strong></div><div class="kpi-card"><small>المعرفة</small><strong>${m.knowledge}</strong></div><div class="kpi-card"><small>القرارات</small><strong>${m.decisions}</strong></div><div class="kpi-card"><small>المراجعات</small><strong>${m.reviews}</strong></div><div class="kpi-card"><small>الحملات</small><strong>${m.campaigns}</strong></div></div><article class="card"><h3>الملخص الأسبوعي</h3><div class="bar-chart"><div class="bar-row"><div class="bar-label"><span>التركيز</span><b>${m.focus}/10</b></div><div class="bar-track"><span style="width:${m.focus*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الطاقة</span><b>${m.energy}/10</b></div><div class="bar-track"><span style="width:${m.energy*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الإنجاز</span><b>${m.completion}%</b></div><div class="bar-track"><span style="width:${m.completion}%"></span></div></div></div></article></div><aside class="grid"><article class="card"><h3>أفضل مشروع</h3><p>${safeText(m.bestProject?.title || 'غير متاح')}</p><div class="progress"><span style="width:${m.bestProject?.score || 0}%"></span></div></article><article class="card"><h3>مشروع متأخر</h3><p>${safeText(m.lateProject?.title || 'لا يوجد مشروع متأخر واضح')}</p></article><article class="card"><h3>آخر حملة</h3><p>${safeText(m.lastCampaign?.productName || 'لا توجد حملات')}</p>${lastCampaignResult ? `<p class="meta">استثمار: ${formatCurrency(lastCampaignResult.totalInvestment)} — مخاطرة: ${safeText(lastCampaignResult.risk)}</p>` : ''}</article><article class="card"><h3>Mini Chart</h3><div class="mini-chart">${[m.goals,m.projects,m.open,m.done,m.knowledge,m.campaigns].map(v=>`<span style="height:${Math.max(10, v*12)}px"></span>`).join('')}</div></article></aside></div>
  ${renderKnowledgeIntelligenceSection(k)}
  </section>`;
}
