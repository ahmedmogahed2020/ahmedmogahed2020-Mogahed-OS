import { appState } from '../state.js';
import { openModal, pageHeader, toast } from '../ui.js';
import { byUpdatedDesc, calculatePercentage, formatCurrency, formatDate, isPast, isToday, safeNumber, safeText, todayISO } from '../utils.js';
import { calculateCampaign } from './campaigns.js';
import { secondsToTime } from './youtube.js';
import { getWinIntelligence } from './wins.js';

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
  const winIntel = getWinIntelligence();
  return { winIntel, goals:d.goals.length, activeGoals:d.goals.filter(g=>g.status!=='مكتملة'&&g.status!=='متوقفة').length, projects:d.projects.length, tasks:tasks.length, done:done.length, open:open.length, overdue:overdue.length, completion:calculatePercentage(done.length,tasks.length), knowledge:d.knowledge.length, decisions:d.decisions.length, reviews:d.reviews.length, wins:d.wins.length, campaigns:d.campaigns.length, focus:avg('focusScore'), energy:avg('energyScore'), bestProject, lateProject, lastCampaign:d.campaigns[0], todayTasks:tasks.filter(t=>isToday(t.dueDate) || (!t.dueDate && t.status!=='مكتملة')), lastKnowledge:[...d.knowledge].sort(byUpdatedDesc)[0], lastDecision:[...d.decisions].sort(byUpdatedDesc)[0], lastWin:[...d.wins].sort(byUpdatedDesc)[0], knowledgeIntel };
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


function dueSort(a, b) {
  const ad = a.dueDate || '9999-12-31';
  const bd = b.dueDate || '9999-12-31';
  if (ad !== bd) return ad.localeCompare(bd);
  const priorityScore = { 'عالية': 3, 'متوسطة': 2, 'منخفضة': 1 };
  return (priorityScore[b.priority] || 0) - (priorityScore[a.priority] || 0);
}

function getHomeCommandCenter(m) {
  const d = appState.data;
  const todayTasks = d.tasks.filter(t => t.status !== 'مكتملة' && (isToday(t.dueDate) || !t.dueDate)).sort(dueSort);
  const urgentTasks = d.tasks.filter(t => t.status !== 'مكتملة' && (isPast(t.dueDate) || t.priority === 'عالية')).sort(dueSort);
  const topTasks = [...new Map([...urgentTasks, ...todayTasks].map(t => [t.id, t])).values()].slice(0, 3);
  const dailyTarget = Math.max(1, safeNumber(d.settings.dailyTaskTarget, 5));
  const todayDone = d.tasks.filter(t => t.status === 'مكتملة' && (isToday(t.completedAt?.slice?.(0, 10)) || isToday(t.updatedAt?.slice?.(0, 10)) || isToday(t.dueDate))).length;
  const dailyProgress = calculatePercentage(todayDone, dailyTarget);
  const learningTargetSeconds = Math.max(5, safeNumber(d.settings.learningMinutesTarget, 30)) * 60;
  const learningProgress = calculatePercentage(Math.min(m.knowledgeIntel.watchedSeconds, learningTargetSeconds), learningTargetSeconds);
  const reviewKnowledge = m.knowledgeIntel.reviewDueEntries.slice(0, 3);
  const actionableKnowledge = m.knowledgeIntel.mostActionable.filter(entry => entry.actions.length || entry.ideas.length).slice(0, 3);
  const campaignsNeedDecision = d.campaigns.map(c => ({ campaign: c, result: calculateCampaign(c) }))
    .filter(x => x.result.risk.includes('عالية') || safeNumber(x.result.expectedProfit) < 0 || x.result.decision.includes('اختبر'))
    .slice(0, 3);
  const lateProjects = d.projects
    .map(project => ({ ...project, score: calculatePercentage(d.tasks.filter(t => t.projectId === project.id && t.status === 'مكتملة').length, d.tasks.filter(t => t.projectId === project.id).length) || safeNumber(project.progress) }))
    .filter(project => project.targetDate && isPast(project.targetDate) && project.score < 100)
    .slice(0, 3);
  const warnings = [];
  if (urgentTasks.some(t => isPast(t.dueDate))) warnings.push('فيه مهام متأخرة محتاجة قرار سريع.');
  if (m.knowledgeIntel.actionlessCompleted) warnings.push(`${m.knowledgeIntel.actionlessCompleted} درس مكتمل بدون أفعال تنفيذ.`);
  if (campaignsNeedDecision.length) warnings.push('فيه حملة تحتاج قرار قبل التوسع.');
  if (lateProjects.length) warnings.push('فيه مشروع متأخر محتاج إنقاذ.');
  const focusTask = topTasks[0] || d.tasks.find(t => t.status !== 'مكتملة') || null;
  return { topTasks, todayTasks, urgentTasks, dailyTarget, todayDone, dailyProgress, learningProgress, learningTargetSeconds, reviewKnowledge, actionableKnowledge, campaignsNeedDecision, lateProjects, warnings, focusTask };
}

function renderCommandList(items, emptyText, renderer) {
  if (!items.length) return `<p class="meta">${safeText(emptyText)}</p>`;
  return `<div class="command-list">${items.map(renderer).join('')}</div>`;
}

function renderTopTask(task, index) {
  return `<div class="command-task"><span class="command-rank">${safeText(index + 1)}</span><div><b>${safeText(task.title)}</b><div class="meta"><span>${safeText(task.dueDate ? formatDate(task.dueDate) : 'بدون تاريخ')}</span><span>${safeText(task.priority || 'بدون أولوية')}</span><span>${safeText(task.source || 'يدوي')}</span></div></div><button class="btn primary" data-action="complete-task" data-id="${safeText(task.id)}">تم</button></div>`;
}

export function startFocusSession() {
  const m = getMetrics();
  const command = getHomeCommandCenter(m);
  const task = command.focusTask;
  const body = task ? `<div class="focus-session-box">
    <div class="focus-session-main"><span>25 دقيقة</span><h3>${safeText(task.title)}</h3><p>${safeText(task.description || 'ابدأ بأصغر خطوة واضحة، واقفل أي مشتت لحد ما تخلص الجولة.')}</p></div>
    <div class="focus-session-steps">
      <b>قواعد الجلسة</b>
      <ol>
        <li>افتح المهمة فقط.</li>
        <li>اقفل السوشيال والإشعارات.</li>
        <li>اشتغل 25 دقيقة بدون تبديل.</li>
        <li>بعد الجولة علّم المهمة أو خطوة منها كمكتملة.</li>
      </ol>
    </div>
    <div class="btn-row"><button class="btn primary" data-action="complete-task" data-id="${safeText(task.id)}">أنهيت المهمة</button><button class="btn ghost" data-route="tasks">فتح المهام</button></div>
  </div>` : `<div class="focus-session-box"><h3>لا توجد مهمة مفتوحة</h3><p class="meta">أضف مهمة واحدة فقط، والنظام سيقترحها كبداية جلسة تركيز.</p><button class="btn primary" data-action="open-task-modal">إضافة مهمة</button></div>`;
  openModal({ title: 'جلسة تركيز', body, size: 'wide' });
  toast('ابدأ جلسة تركيز قصيرة الآن');
}

export function renderHome() {
  const m = getMetrics();
  const k = m.knowledgeIntel;
  const command = getHomeCommandCenter(m);
  const executiveSignal = command.warnings[0] || (command.topTasks.length ? 'اليوم واضح: ابدأ بأهم 3 مهام فقط.' : 'اليوم خفيف. أضف مهمة واحدة تقربك من هدفك.');
  return `<section class="page home-stack command-center">
    <article class="command-hero">
      <div class="command-hero-copy">
        <span class="eyebrow">مركز القيادة اليومي</span>
        <h2>أهلاً يا ${safeText(appState.data.settings.userName || 'مجاهد')} 👋</h2>
        <p>${safeText(executiveSignal)}</p>
        <div class="btn-row">
          <button class="btn primary" data-action="start-focus-session">ابدأ جلسة تركيز</button>
          <button class="btn ghost" data-action="open-task-modal">إضافة مهمة</button>
          <button class="btn ghost" data-action="open-knowledge-modal">إضافة معرفة</button>
          <button class="btn dark" data-route="dashboard">Dashboard كامل</button>
        </div>
      </div>
      <div class="command-score-card">
        <div class="progress-ring command-ring" style="--value:${safeText(Math.min(100, command.dailyProgress))}"><strong>${safeText(command.dailyProgress)}%</strong></div>
        <b>تقدم اليوم</b>
        <span>${safeText(command.todayDone)} من ${safeText(command.dailyTarget)} مهام مستهدفة</span>
      </div>
    </article>

    <div class="kpi-grid command-kpis">
      <div class="kpi-card"><small>مهام مفتوحة</small><strong>${safeText(m.open)}</strong></div>
      <div class="kpi-card"><small>مهام مكتملة</small><strong>${safeText(m.done)}</strong></div>
      <div class="kpi-card"><small>أهداف نشطة</small><strong>${safeText(m.activeGoals)}</strong></div>
      <div class="kpi-card"><small>مشاريع</small><strong>${safeText(m.projects)}</strong></div>
      <div class="kpi-card"><small>مراجعة معرفة</small><strong>${safeText(k.reviewDue)}</strong></div>
      <div class="kpi-card"><small>حملات</small><strong>${safeText(m.campaigns)}</strong></div>
      <div class="kpi-card"><small>Win Streak</small><strong>${safeText(m.winIntel.stats.currentStreak)}</strong></div>
    </div>

    ${command.warnings.length ? `<article class="command-alerts">${command.warnings.map(w => `<div><b>تنبيه</b><span>${safeText(w)}</span></div>`).join('')}</article>` : ''}

    <div class="command-layout">
      <section class="command-main">
        <article class="card command-panel">
          <div class="section-title"><div><h3>أهم 3 مهام الآن</h3><p class="meta">مرتبة حسب التأخير والأولوية ومهام اليوم.</p></div><button class="btn ghost" data-route="tasks">فتح المهام</button></div>
          ${renderCommandList(command.topTasks, 'لا توجد مهام مهمة الآن. أضف مهمة واحدة فقط وابدأ.', renderTopTask)}
        </article>

        <article class="card command-panel">
          <div class="section-title"><div><h3>خطة اليوم</h3><p class="meta">نظرة عملية على المطلوب بدون زحمة.</p></div><button class="btn ghost" data-action="open-review-modal" data-type="يومية">مراجعة يومية</button></div>
          <div class="command-plan-grid">
            <div><b>ابدأ</b><span>${safeText(command.topTasks[0]?.title || 'مهمة واحدة صغيرة')}</span></div>
            <div><b>راجع</b><span>${safeText(command.reviewKnowledge[0]?.title || 'لا توجد مراجعة معرفة مستحقة')}</span></div>
            <div><b>احسم</b><span>${safeText(command.campaignsNeedDecision[0]?.campaign.productName || command.lateProjects[0]?.title || 'لا يوجد قرار عاجل')}</span></div>
          </div>
        </article>

        <article class="card command-panel">
          <div class="section-title"><div><h3>معرفة تحتاج إجراء</h3><p class="meta">التعلم المفيد هو الذي يتحول إلى مهمة.</p></div><button class="btn ghost" data-route="knowledge">فتح المعرفة</button></div>
          ${renderCommandList(command.actionableKnowledge, 'لا توجد معرفة جاهزة للتنفيذ الآن.', entry => `<div class="command-item"><b>${safeText(entry.title)}</b><span>${safeText(entry.actions.length)} فعل / ${safeText(entry.ideas.length)} فكرة</span></div>`)}
        </article>
      </section>

      <aside class="command-side">
        <article class="card command-panel">
          <h3>نبض المعرفة</h3>
          <p class="meta">اكتمال التعلم ${safeText(k.learningCompletion)}% — متبقي ${safeText(secondsToTime(k.remainingSeconds))}</p>
          <div class="progress"><span style="width:${safeText(k.learningCompletion)}%"></span></div>
          <div class="bar-chart mini-command-bars">
            <div class="bar-row"><div class="bar-label"><span>هدف التعلم اليومي</span><b>${safeText(command.learningProgress)}%</b></div><div class="bar-track"><span style="width:${safeText(command.learningProgress)}%"></span></div></div>
            <div class="bar-row"><div class="bar-label"><span>تحويل المعرفة لتنفيذ</span><b>${safeText(k.converted)}</b></div><div class="bar-track"><span style="width:${safeText(calculatePercentage(k.converted, Math.max(1, k.totalLessons)))}%"></span></div></div>
          </div>
        </article>

        <article class="card command-panel">
          <h3>معرفة للمراجعة</h3>
          ${renderCommandList(command.reviewKnowledge, 'لا توجد مراجعات مستحقة.', entry => `<div class="command-item"><b>${safeText(entry.title)}</b><span>${safeText(entry.reviewAt ? formatDate(entry.reviewAt) : 'مراجعة الآن')}</span></div>`)}
        </article>

        <article class="card command-panel">
          <h3>حملات تحتاج قرار</h3>
          ${renderCommandList(command.campaignsNeedDecision, 'لا توجد حملات تحتاج قرار عاجل.', x => `<div class="command-item"><b>${safeText(x.campaign.productName)}</b><span>${safeText(x.result.decision)} — ${safeText(x.result.risk)}</span></div>`)}
        </article>

        <article class="card command-panel">
          <h3>مشاريع متأخرة</h3>
          ${renderCommandList(command.lateProjects, 'لا يوجد مشروع متأخر واضح.', project => `<div class="command-item"><b>${safeText(project.title)}</b><span>${safeText(project.score)}% — ${safeText(formatDate(project.targetDate))}</span></div>`)}
        </article>
      </aside>
    </div>

    <div class="grid grid-2">
      <article class="card"><h3>آخر معرفة</h3><p>${safeText(m.lastKnowledge?.title || 'لا توجد معرفة بعد')}</p></article>
      <article class="card"><h3>آخر قرار</h3><p>${safeText(m.lastDecision?.title || 'لا يوجد قرار بعد')}</p></article>
      <article class="card"><h3>آخر فوز</h3><p>${safeText(m.lastWin?.title || 'لا يوجد فوز بعد')}</p><button class="btn ghost" data-route="wins">فتح خطة الفوز</button></article>
      <article class="card"><h3>تركيز سريع</h3><p class="meta">جلسة واحدة قصيرة أفضل من تخطيط طويل بدون تنفيذ.</p><button class="btn primary" data-action="start-focus-session">ابدأ الآن</button></article>
    </div>
  </section>`;
}

export function renderDashboard() {
  const m = getMetrics();
  const k = m.knowledgeIntel;
  const lastCampaignResult = m.lastCampaign ? calculateCampaign(m.lastCampaign) : null;
  return `<section class="page">${pageHeader('Dashboard كامل', 'لوحة أداء حقيقية محسوبة من بيانات Mogahed OS.', '<button class="btn primary" data-route="home">العودة للرئيسية</button>')}
  <div class="dashboard-grid"><div class="grid"><article class="dashboard-hero"><div class="ring-wrap"><div class="progress-ring" style="--value:${m.completion}"><strong>${m.completion}%</strong></div><div><h2>نسبة الإنجاز العامة</h2><p>محسوبة من المهام المكتملة مقابل كل المهام.</p></div></div></article><div class="kpi-grid"><div class="kpi-card"><small>الأهداف</small><strong>${m.goals}</strong></div><div class="kpi-card"><small>المشاريع</small><strong>${m.projects}</strong></div><div class="kpi-card"><small>المهام</small><strong>${m.tasks}</strong></div><div class="kpi-card"><small>متأخرة</small><strong>${m.overdue}</strong></div><div class="kpi-card"><small>المعرفة</small><strong>${m.knowledge}</strong></div><div class="kpi-card"><small>القرارات</small><strong>${m.decisions}</strong></div><div class="kpi-card"><small>المراجعات</small><strong>${m.reviews}</strong></div><div class="kpi-card"><small>الحملات</small><strong>${m.campaigns}</strong></div><div class="kpi-card"><small>الفوز</small><strong>${m.wins}</strong></div><div class="kpi-card"><small>Win Streak</small><strong>${m.winIntel.stats.currentStreak}</strong></div></div><article class="card"><h3>الملخص الأسبوعي</h3><div class="bar-chart"><div class="bar-row"><div class="bar-label"><span>التركيز</span><b>${m.focus}/10</b></div><div class="bar-track"><span style="width:${m.focus*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الطاقة</span><b>${m.energy}/10</b></div><div class="bar-track"><span style="width:${m.energy*10}%"></span></div></div><div class="bar-row"><div class="bar-label"><span>الإنجاز</span><b>${m.completion}%</b></div><div class="bar-track"><span style="width:${m.completion}%"></span></div></div></div></article></div><aside class="grid"><article class="card"><h3>أفضل مشروع</h3><p>${safeText(m.bestProject?.title || 'غير متاح')}</p><div class="progress"><span style="width:${m.bestProject?.score || 0}%"></span></div></article><article class="card"><h3>مشروع متأخر</h3><p>${safeText(m.lateProject?.title || 'لا يوجد مشروع متأخر واضح')}</p></article><article class="card"><h3>آخر حملة</h3><p>${safeText(m.lastCampaign?.productName || 'لا توجد حملات')}</p>${lastCampaignResult ? `<p class="meta">استثمار: ${formatCurrency(lastCampaignResult.totalInvestment)} — مخاطرة: ${safeText(lastCampaignResult.risk)}</p>` : ''}</article><article class="card"><h3>Mini Chart</h3><div class="mini-chart">${[m.goals,m.projects,m.open,m.done,m.knowledge,m.campaigns].map(v=>`<span style="height:${Math.max(10, v*12)}px"></span>`).join('')}</div></article></aside></div>
  ${renderKnowledgeIntelligenceSection(k)}
  <section class="knowledge-intel-section"><article class="dashboard-warning-card"><b>خطة الفوز</b><span>هذا الأسبوع: ${safeText(m.winIntel.stats.week)} انتصارات — السلسلة الحالية: ${safeText(m.winIntel.stats.currentStreak)} أيام — أكثر نوع: ${safeText(m.winIntel.stats.topType)}.</span><button class="btn primary" data-route="wins">فتح خطة الفوز</button></article></section>
  </section>`;
}
