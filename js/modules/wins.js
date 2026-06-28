import { appState, setFilter } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, options, pageHeader, statusBadge, toast } from '../ui.js';
import { calculatePercentage, formatDate, generateId, isToday, parseLines, raw, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, upsert } from './shared.js';
import { renderPage } from '../router.js';

const winTypes = ['إنجاز','عادة','تعلم','مبيعات','قرار صحيح','تغلب على تشتت','تقدم في مشروع','تقدم في هدف','طوارئ نجحت','حملة ناجحة','مراجعة'];
const winSizes = ['صغير','متوسط','كبير','محوري'];
const winFilters = [
  ['all','الكل'], ['today','اليوم'], ['week','الأسبوع'], ['month','الشهر'], ['linked','مرتبط'], ['suggested','اقتراحات'], ['big','كبير/محوري']
];


const sizePoints = { 'صغير': 10, 'متوسط': 25, 'كبير': 55, 'محوري': 100 };
const typeBonus = { 'تغلب على تشتت': 8, 'تعلم': 6, 'مبيعات': 10, 'حملة ناجحة': 12, 'قرار صحيح': 9, 'مراجعة': 5, 'طوارئ نجحت': 8 };
const winLevels = [
  { min: 0, name: 'بداية الطريق', icon: '🌱', stage: 'المرحلة 1', message: 'سجل انتصارات صغيرة حتى يتكون الإيقاع.' },
  { min: 120, name: 'محارب التركيز', icon: '⚔️', stage: 'المرحلة 2', message: 'بدأت تنتصر على التشتت وتراكم خطوات حقيقية.' },
  { min: 300, name: 'صانع العادة', icon: '🔥', stage: 'المرحلة 3', message: 'الفوز تحول من حدث عابر إلى عادة متكررة.' },
  { min: 650, name: 'قائد التنفيذ', icon: '🚀', stage: 'المرحلة 4', message: 'أصبحت تربط الفوز بالأهداف والمشاريع والعمل.' },
  { min: 1200, name: 'Architect of Progress', icon: '🏆', stage: 'المرحلة 5', message: 'النظام أصبح ماكينة تقدم شخصية وتجارية.' }
];
const winRewards = [
  { id: 'coffee-100', points: 100, title: 'هدية صغيرة', reward: 'مشروب تحبه أو 20 دقيقة راحة بدون جلد ذات.' },
  { id: 'focus-250', points: 250, title: 'ترقية مساحة العمل', reward: 'حسّن مكتبك بشيء بسيط: ترتيب، إضاءة، خلفية، أو أداة صغيرة.' },
  { id: 'learning-500', points: 500, title: 'مكافأة تعلم', reward: 'اختار كورس/كتاب/أداة تساعدك تكمل المسار.' },
  { id: 'premium-900', points: 900, title: 'مكافأة إنجاز كبيرة', reward: 'اعمل مكافأة محترمة بعد أسبوع قوي: خروجة، شراء نافع، أو يوم هادي.' },
  { id: 'legend-1500', points: 1500, title: 'هدية القائد', reward: 'احتفل بإنجازك وراجع الرحلة بالكامل وسجل أكبر 5 انتصارات.' }
];
const titleRules = [
  { id: 'starter', title: 'مبتدئ منتظم', test: stats => stats.total >= 3 },
  { id: 'daily', title: 'حارس اليوم', test: stats => stats.today >= 1 },
  { id: 'streak3', title: 'صاحب سلسلة', test: stats => stats.currentStreak >= 3 },
  { id: 'streak7', title: 'أسبوع بلا انقطاع', test: stats => stats.currentStreak >= 7 || stats.bestStreak >= 7 },
  { id: 'learner', title: 'صياد المعرفة', test: stats => stats.weeklyLearning >= 3 },
  { id: 'executor', title: 'محول الأفكار لأفعال', test: stats => stats.weeklyActions >= 3 },
  { id: 'hero', title: 'بطل الرجوع من التشتت', test: stats => stats.weeklyEmergency >= 2 },
  { id: 'pro', title: 'قائد تقدم', test: stats => stats.total >= 25 && stats.linkedRate >= 50 }
];

function normalizeWin(win = {}) {
  return {
    ...win,
    title: win.title || 'فوز بدون عنوان',
    type: win.type || 'إنجاز',
    size: win.size || 'صغير',
    date: win.date || String(win.createdAt || new Date().toISOString()).slice(0, 10),
    impact: win.impact || '',
    lessons: Array.isArray(win.lessons) ? win.lessons : parseLines(win.lessonsText || win.lessons || ''),
    linkedGoalId: win.linkedGoalId || win.goalId || '',
    linkedProjectId: win.linkedProjectId || win.projectId || '',
    linkedTaskId: win.linkedTaskId || win.taskId || '',
    linkedKnowledgeId: win.linkedKnowledgeId || win.knowledgeId || '',
    linkedCampaignId: win.linkedCampaignId || win.campaignId || '',
    linkedDecisionId: win.linkedDecisionId || win.decisionId || '',
    linkedReviewId: win.linkedReviewId || win.reviewId || '',
    sourceType: win.sourceType || 'manual',
    sourceId: win.sourceId || ''
  };
}

function dateValue(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date() : date;
}

function daysAgo(days) {
  const date = new Date();
  date.setHours(0,0,0,0);
  date.setDate(date.getDate() - days);
  return date;
}

function isThisWeek(value) { return dateValue(value) >= daysAgo(6); }
function isThisMonth(value) { return dateValue(value) >= daysAgo(29); }

function getWins() { return (appState.data.wins || []).map(normalizeWin); }

function linkedTitle(collection, id) {
  if (!id) return '';
  const item = appState.data[collection]?.find(x => x.id === id);
  return item?.title || item?.productName || '';
}

function winSearchText(win) {
  return [
    win.title, win.description, win.type, win.size, win.impact, win.date,
    linkedTitle('goals', win.linkedGoalId), linkedTitle('projects', win.linkedProjectId), linkedTitle('tasks', win.linkedTaskId),
    linkedTitle('knowledge', win.linkedKnowledgeId), linkedTitle('campaigns', win.linkedCampaignId),
    linkedTitle('decisions', win.linkedDecisionId), linkedTitle('reviews', win.linkedReviewId),
    ...(win.lessons || [])
  ].join(' ').toLowerCase();
}

function getWinQuery() { return appState.filters.winQuery || ''; }

function filterWins(wins) {
  const filter = appState.filters.wins || 'all';
  const query = getWinQuery().toLowerCase();
  return wins.filter(win => {
    const byFilter = filter === 'today' ? isToday(win.date)
      : filter === 'week' ? isThisWeek(win.date)
      : filter === 'month' ? isThisMonth(win.date)
      : filter === 'linked' ? Boolean(win.linkedGoalId || win.linkedProjectId || win.linkedTaskId || win.linkedKnowledgeId || win.linkedCampaignId || win.linkedDecisionId || win.linkedReviewId)
      : filter === 'big' ? ['كبير','محوري'].includes(win.size)
      : true;
    return byFilter && (!query || winSearchText(win).includes(query));
  }).sort((a, b) => dateValue(b.date) - dateValue(a.date));
}

function uniqueDates(wins) {
  return Array.from(new Set(wins.map(win => win.date).filter(Boolean))).sort().reverse();
}

function getCurrentStreak(wins) {
  const dates = new Set(uniqueDates(wins));
  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0,0,0,0);
  while (dates.has(cursor.toISOString().slice(0,10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

function getBestStreak(wins) {
  const dates = uniqueDates(wins).reverse();
  let best = 0;
  let current = 0;
  let previous = null;
  dates.forEach(value => {
    const currentDate = dateValue(value);
    if (!previous) current = 1;
    else {
      const diff = Math.round((currentDate - previous) / 86400000);
      current = diff === 1 ? current + 1 : 1;
    }
    best = Math.max(best, current);
    previous = currentDate;
  });
  return best;
}

function countBy(items, getter) {
  const map = new Map();
  items.forEach(item => {
    const key = getter(item);
    if (!key) return;
    map.set(key, (map.get(key) || 0) + 1);
  });
  return Array.from(map.entries()).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count);
}

function weeklyDoneTasks() {
  return (appState.data.tasks || []).filter(task => task.status === 'مكتملة' && isThisWeek(String(task.completedAt || task.updatedAt || task.dueDate || '').slice(0,10)));
}

function knowledgeLessonsTouchedThisWeek() {
  const entries = [];
  (appState.data.knowledge || []).forEach(item => {
    const youtube = item.youtube || {};
    const videos = Array.isArray(youtube.playlistItems) && youtube.playlistItems.length ? youtube.playlistItems : [{ videoId: youtube.videoId || 'general', title: item.title }];
    videos.forEach(video => {
      const id = video.videoId || 'general';
      const content = item.videoContent?.[id] || {};
      if (['انتهيت','تم تحويله لتنفيذ','أحتاج مراجعة'].includes(content.learningStatus) || content.convertedToExecution || content.updatedAt) entries.push({ item, video, content });
    });
  });
  return entries;
}


function getWinPoints(win) {
  const base = sizePoints[win.size] || 10;
  const bonus = typeBonus[win.type] || 0;
  const relationBonus = (win.linkedGoalId || win.linkedProjectId || win.linkedTaskId || win.linkedKnowledgeId || win.linkedCampaignId || win.linkedDecisionId || win.linkedReviewId) ? 5 : 0;
  return Number(win.points || 0) || (base + bonus + relationBonus);
}

function getTotalWinPoints(wins = getWins()) {
  return wins.reduce((sum, win) => sum + getWinPoints(win), 0);
}

function getLevelInfo(points) {
  const current = [...winLevels].reverse().find(level => points >= level.min) || winLevels[0];
  const index = winLevels.findIndex(level => level.name === current.name);
  const next = winLevels[index + 1] || null;
  const progress = next ? calculatePercentage(points - current.min, next.min - current.min) : 100;
  return { current, next, progress: Math.min(100, Math.max(0, progress)) };
}

function getUnlockedTitles(stats) {
  return titleRules.filter(rule => rule.test(stats)).map(rule => rule.title);
}

function getClaimedRewards() {
  return Array.isArray(appState.data.settings?.claimedWinRewards) ? appState.data.settings.claimedWinRewards : [];
}

function getRewardState(points) {
  const claimed = new Set(getClaimedRewards());
  return winRewards.map(reward => ({ ...reward, unlocked: points >= reward.points, claimed: claimed.has(reward.id), remaining: Math.max(0, reward.points - points) }));
}

function getWinStats() {
  const wins = getWins();
  const weekWins = wins.filter(w => isThisWeek(w.date));
  const monthWins = wins.filter(w => isThisMonth(w.date));
  const linked = wins.filter(w => w.linkedGoalId || w.linkedProjectId || w.linkedTaskId || w.linkedKnowledgeId || w.linkedCampaignId || w.linkedDecisionId || w.linkedReviewId);
  const typeTop = countBy(wins, w => w.type)[0];
  const projectTop = countBy(wins, w => linkedTitle('projects', w.linkedProjectId))[0];
  const todayHasWin = wins.some(w => isToday(w.date));
  const points = getTotalWinPoints(wins);
  const levelInfo = getLevelInfo(points);
  return {
    total: wins.length,
    points,
    levelInfo,
    today: wins.filter(w => isToday(w.date)).length,
    week: weekWins.length,
    month: monthWins.length,
    linked: linked.length,
    linkedRate: calculatePercentage(linked.length, wins.length),
    currentStreak: getCurrentStreak(wins),
    bestStreak: getBestStreak(wins),
    topType: typeTop?.label || 'غير محدد',
    topProject: projectTop?.label || 'غير محدد',
    daysWithoutWin: todayHasWin ? 0 : Math.max(0, Math.floor((new Date() - dateValue(uniqueDates(wins)[0] || todayISO())) / 86400000)),
    weeklyDone: weeklyDoneTasks().length,
    weeklyLearning: knowledgeLessonsTouchedThisWeek().length,
    weeklyActions: (appState.data.tasks || []).filter(t => ['معرفة','مراجعة','حملة','طوارئ'].includes(t.source) && isThisWeek(String(t.createdAt || t.updatedAt || '').slice(0,10))).length,
    weeklyEmergency: (appState.data.emergencyLogs || []).filter(log => isThisWeek(String(log.createdAt || log.date || '').slice(0,10))).length
  };
}

function suggestionExists(key) {
  return getWins().some(win => win.sourceId === key || win.sourceType === key);
}

function getWinSuggestions() {
  const suggestions = [];
  const doneToday = (appState.data.tasks || []).filter(task => task.status === 'مكتملة' && (isToday(String(task.completedAt || '').slice(0,10)) || isToday(String(task.updatedAt || '').slice(0,10)) || isToday(task.dueDate)));
  if (doneToday.length >= 3 && !suggestionExists(`tasks-done-${todayISO()}`)) {
    suggestions.push({ key: `tasks-done-${todayISO()}`, title: `أنجزت ${doneToday.length} مهام اليوم`, type: 'إنجاز', size: doneToday.length >= 5 ? 'كبير' : 'متوسط', description: `تم إنهاء ${doneToday.length} مهام. ده تقدم واضح يستحق التسجيل.`, linkedTaskId: doneToday[0]?.id || '' });
  }

  const completedKnowledge = knowledgeLessonsTouchedThisWeek().filter(x => ['انتهيت','تم تحويله لتنفيذ'].includes(x.content.learningStatus));
  if (completedKnowledge.length && !suggestionExists(`knowledge-week-${todayISO()}`)) {
    suggestions.push({ key: `knowledge-week-${todayISO()}`, title: `تقدمت في ${completedKnowledge.length} درس معرفة`, type: 'تعلم', size: completedKnowledge.length >= 3 ? 'متوسط' : 'صغير', description: 'التعلم اتحرك، والأهم تحويله لفعل.', linkedKnowledgeId: completedKnowledge[0]?.item?.id || '' });
  }

  const convertedKnowledge = knowledgeLessonsTouchedThisWeek().filter(x => x.content.convertedToExecution || x.content.learningStatus === 'تم تحويله لتنفيذ');
  if (convertedKnowledge.length && !suggestionExists(`knowledge-action-${todayISO()}`)) {
    suggestions.push({ key: `knowledge-action-${todayISO()}`, title: 'حوّلت معرفة إلى تنفيذ', type: 'تعلم', size: 'كبير', description: `تم تحويل ${convertedKnowledge.length} درس/فكرة إلى أفعال.`, linkedKnowledgeId: convertedKnowledge[0]?.item?.id || '' });
  }

  const emergencyToday = (appState.data.emergencyLogs || []).filter(log => isToday(String(log.createdAt || log.date || '').slice(0,10)));
  if (emergencyToday.length && !suggestionExists(`emergency-${todayISO()}`)) {
    suggestions.push({ key: `emergency-${todayISO()}`, title: 'استخدمت الطوارئ بدل التشتت', type: 'طوارئ نجحت', size: 'صغير', description: 'رجعت نفسك من التشتت بخطوة عملية.' });
  }

  const goodCampaign = (appState.data.campaigns || []).find(c => String(c.recommendation || c.decision || c.notes || '').includes('ابدأ') || String(c.risk || '').includes('منخفض'));
  if (goodCampaign && !suggestionExists(`campaign-${goodCampaign.id}`)) {
    suggestions.push({ key: `campaign-${goodCampaign.id}`, title: `حملة ${goodCampaign.productName || 'منتج'} جاهزة للتنفيذ`, type: 'حملة ناجحة', size: 'متوسط', description: 'الحملة أصبحت قابلة للقرار أو الاختبار بدل العشوائية.', linkedCampaignId: goodCampaign.id });
  }

  const reviewsToday = (appState.data.reviews || []).filter(r => isToday(String(r.date || r.createdAt || '').slice(0,10)));
  if (reviewsToday.length && !suggestionExists(`review-${todayISO()}`)) {
    suggestions.push({ key: `review-${todayISO()}`, title: 'عملت مراجعة بدل ما اليوم يعدي عشوائي', type: 'مراجعة', size: 'صغير', description: 'المراجعة نفسها فوز لأنها بتمنع تكرار نفس الأخطاء.', linkedReviewId: reviewsToday[0]?.id || '' });
  }

  if (!getWins().some(w => isToday(w.date))) {
    suggestions.push({ key: `small-win-${todayISO()}`, title: 'سجّل فوز صغير اليوم', type: 'تغلب على تشتت', size: 'صغير', description: 'حتى لو 5 دقائق تركيز أو مهمة واحدة. المهم ألا يمر اليوم بلا انتصار.' });
  }
  return suggestions.slice(0, 6);
}

function relationsHtml(win) {
  const rels = [
    ['هدف', linkedTitle('goals', win.linkedGoalId)], ['مشروع', linkedTitle('projects', win.linkedProjectId)], ['مهمة', linkedTitle('tasks', win.linkedTaskId)],
    ['معرفة', linkedTitle('knowledge', win.linkedKnowledgeId)], ['حملة', linkedTitle('campaigns', win.linkedCampaignId)], ['قرار', linkedTitle('decisions', win.linkedDecisionId)], ['مراجعة', linkedTitle('reviews', win.linkedReviewId)]
  ].filter(([, value]) => value);
  if (!rels.length) return '';
  return `<div class="win-relations">${rels.map(([label, value]) => `<span>${safeText(label)}: ${safeText(value)}</span>`).join('')}</div>`;
}

function winCard(win) {
  const lessons = (win.lessons || []).slice(0, 3);
  const extra = `<button class="btn ghost" data-action="duplicate-win" data-id="${safeText(win.id)}">كرّر كنموذج</button>`;
  return `<article class="card item-card win-card win-size-${safeText(win.size)}">
    <div class="btn-row">${statusBadge(win.type)}${statusBadge(win.size)}<span class="badge">${safeText(formatDate(win.date))}</span></div>
    <h3>${safeText(win.title)}</h3>
    <p>${safeText(win.description || 'بدون وصف')}</p>
    ${win.impact ? `<div class="win-impact"><b>الأثر</b><span>${safeText(win.impact)}</span></div>` : ''}
    ${lessons.length ? `<div class="win-lessons"><b>الدروس</b>${lessons.map(line => `<span>${safeText(line)}</span>`).join('')}</div>` : ''}
    ${relationsHtml(win)}
    <div class="btn-row">
      ${extra}
      <button class="btn ghost" data-action="edit-win" data-id="${safeText(win.id)}">تعديل</button>
      <button class="btn danger" data-action="delete-win" data-id="${safeText(win.id)}">حذف</button>
    </div>
  </article>`;
}

function suggestionCard(suggestion) {
  return `<article class="win-suggestion">
    <div><b>${safeText(suggestion.title)}</b><p>${safeText(suggestion.description)}</p><div class="meta"><span>${safeText(suggestion.type)}</span><span>${safeText(suggestion.size)}</span></div></div>
    <button class="btn primary" data-action="record-suggested-win" data-id="${safeText(suggestion.key)}">سجّل هذا كفوز</button>
  </article>`;
}

function renderWinStats(stats) {
  return `<div class="win-kpi-grid">
    <article class="kpi-card"><small>إجمالي الفوز</small><strong>${safeText(stats.total)}</strong></article>
    <article class="kpi-card"><small>فوز اليوم</small><strong>${safeText(stats.today)}</strong></article>
    <article class="kpi-card"><small>هذا الأسبوع</small><strong>${safeText(stats.week)}</strong></article>
    <article class="kpi-card"><small>هذا الشهر</small><strong>${safeText(stats.month)}</strong></article>
    <article class="kpi-card"><small>Win Streak</small><strong>${safeText(stats.currentStreak)}</strong></article>
    <article class="kpi-card"><small>أفضل سلسلة</small><strong>${safeText(stats.bestStreak)}</strong></article>
    <article class="kpi-card"><small>مرتبط بالأهداف</small><strong>${safeText(stats.linkedRate)}%</strong></article>
    <article class="kpi-card"><small>أكثر نوع</small><strong>${safeText(stats.topType)}</strong></article>
    <article class="kpi-card"><small>نقاط الفوز</small><strong>${safeText(stats.points)}</strong></article>
  </div>`;
}


function renderWinGamification(stats) {
  const rewards = getRewardState(stats.points);
  const titles = getUnlockedTitles(stats);
  const level = stats.levelInfo.current;
  const next = stats.levelInfo.next;
  return `<div class="win-game-grid">
    <article class="card win-level-card">
      <div class="win-level-icon">${safeText(level.icon)}</div>
      <div>
        <p class="eyebrow">${safeText(level.stage)}</p>
        <h3>${safeText(level.name)}</h3>
        <p>${safeText(level.message)}</p>
        <div class="xp-track"><span style="width:${safeText(stats.levelInfo.progress)}%"></span></div>
        <div class="meta"><span>${safeText(stats.points)} نقطة فوز</span><span>${next ? `المستوى التالي: ${safeText(next.name)} عند ${safeText(next.min)} نقطة` : 'وصلت لأعلى مرحلة حالية'}</span></div>
      </div>
    </article>
    <article class="card win-titles-card">
      <div class="section-title"><div><h3>الألقاب</h3><p class="meta">ألقاب تتفتح تلقائيًا حسب استمرارك.</p></div></div>
      <div class="title-badges">${titles.length ? titles.map(title => `<span>🏅 ${safeText(title)}</span>`).join('') : '<span>سجل 3 انتصارات لفتح أول لقب</span>'}</div>
    </article>
    <article class="card win-rewards-card full-span">
      <div class="section-title"><div><h3>الهدايا والمكافآت</h3><p class="meta">كل هدية مرتبطة بنقاط الفوز. الهدف تشجيع الاستمرار بدون مبالغة.</p></div></div>
      <div class="reward-grid">${rewards.map(reward => `<div class="reward-card ${reward.unlocked ? 'unlocked' : 'locked'} ${reward.claimed ? 'claimed' : ''}">
        <b>${reward.unlocked ? '🎁' : '🔒'} ${safeText(reward.title)}</b>
        <p>${safeText(reward.reward)}</p>
        <small>${reward.claimed ? 'تم استلامها' : reward.unlocked ? 'جاهزة للاستلام' : `باقي ${safeText(reward.remaining)} نقطة`}</small>
        ${reward.unlocked && !reward.claimed ? `<button class="btn small primary" data-action="claim-win-reward" data-id="${safeText(reward.id)}">استلم الهدية</button>` : ''}
      </div>`).join('')}</div>
    </article>
  </div>`;
}

function renderProgressStory(stats) {
  return `<article class="card progress-story-card">
    <div class="section-title"><div><h3>أنا بتقدم</h3><p class="meta">ملخص نفسي وتنفيذي من آخر 7 أيام.</p></div><button class="btn ghost" data-action="open-review-modal" data-type="أسبوعية">مراجعة أسبوعية</button></div>
    <div class="progress-story-grid">
      <div><b>${safeText(stats.weeklyDone)}</b><span>مهام اكتملت هذا الأسبوع</span></div>
      <div><b>${safeText(stats.weeklyLearning)}</b><span>دروس/معرفة اتحركت</span></div>
      <div><b>${safeText(stats.weeklyActions)}</b><span>أفعال من معرفة/مراجعة/حملة/طوارئ</span></div>
      <div><b>${safeText(stats.weeklyEmergency)}</b><span>مرات رجعت من التشتت</span></div>
    </div>
    <p class="recommendation">النظام مش معمول يضغطك بس، معمول يثبت لك إنك بتتحرك. سجّل فوز صغير كل يوم حتى لو كان خطوة واحدة.</p>
  </article>`;
}

function renderStreakCard(stats, suggestions) {
  const message = stats.today ? 'اليوم فيه فوز مسجل. حافظ على السلسلة.' : 'لسه مفيش فوز اليوم. اختار فوز صغير من الاقتراحات أو سجل خطوة واحدة.';
  return `<article class="card win-streak-card">
    <div class="win-streak-number"><strong>${safeText(stats.currentStreak)}</strong><span>أيام متتالية</span></div>
    <div><h3>سلسلة الفوز</h3><p>${safeText(message)}</p><div class="btn-row"><button class="btn primary" data-action="open-win-modal">سجّل فوز</button>${suggestions[0] ? `<button class="btn ghost" data-action="record-suggested-win" data-id="${safeText(suggestions[0].key)}">سجّل المقترح</button>` : ''}</div></div>
  </article>`;
}

function renderTimeline(wins) {
  if (!wins.length) return emptyState('لا توجد انتصارات في هذا الفلتر', 'غيّر الفلتر أو سجّل فوز جديد.', '<button class="btn primary" data-action="open-win-modal">إضافة فوز</button>');
  const grouped = wins.reduce((map, win) => {
    const key = win.date || todayISO();
    if (!map[key]) map[key] = [];
    map[key].push(win);
    return map;
  }, {});
  return `<div class="victory-timeline">${Object.entries(grouped).map(([date, items]) => `<section class="timeline-day"><h3>${safeText(formatDate(date))}</h3><div class="grid grid-2">${items.map(winCard).join('')}</div></section>`).join('')}</div>`;
}

function renderToolbar() {
  return `<article class="card win-toolbar">
    <div class="filters">${winFilters.map(([value, label]) => `<button class="filter-btn ${(appState.filters.wins || 'all') === value ? 'active' : ''}" data-action="set-win-filter" data-filter="${value}">${label}</button>`).join('')}</div>
    <input class="win-search" data-action="win-search" value="${safeText(getWinQuery())}" placeholder="ابحث في الفوز، النوع، المشروع، الهدف...">
  </article>`;
}

function renderSuggestions(suggestions) {
  return `<article class="card win-suggestions-card">
    <div class="section-title"><div><h3>اقتراحات فوز تلقائية</h3><p class="meta">النظام يقترح انتصارات بناءً على المهام والمعرفة والطوارئ والمراجعات.</p></div></div>
    <div class="win-suggestions-list">${suggestions.length ? suggestions.map(suggestionCard).join('') : '<p class="meta">لا توجد اقتراحات الآن. نفّذ مهمة أو راجع معرفة لتظهر اقتراحات جديدة.</p>'}</div>
  </article>`;
}

export function renderWins() {
  const actions = '<button class="btn primary" data-action="open-win-modal">إضافة فوز</button>';
  const stats = getWinStats();
  const suggestions = getWinSuggestions();
  const wins = filterWins(getWins());
  return `<section class="page win-system">
    ${pageHeader('خطة الفوز', 'نظام انتصارات يحافظ على الدافع ويربط التقدم بالأهداف والمشاريع والتنفيذ.', actions)}
    ${renderWinStats(stats)}
    ${renderWinGamification(stats)}
    <div class="grid grid-2">${renderStreakCard(stats, suggestions)}${renderProgressStory(stats)}</div>
    ${renderSuggestions(suggestions)}
    ${renderToolbar()}
    ${renderTimeline(wins)}
  </section>`;
}

function relationFields(item = {}) {
  return `
    ${linkedFields({ goalId: item.linkedGoalId, projectId: item.linkedProjectId })}
    <label>المهمة المرتبطة<select name="taskId">${options(appState.data.tasks, item.linkedTaskId, 'بدون مهمة')}</select></label>
    <label>المعرفة المرتبطة<select name="knowledgeId">${options(appState.data.knowledge, item.linkedKnowledgeId, 'بدون معرفة')}</select></label>
    <label>الحملة المرتبطة<select name="campaignId">${options(appState.data.campaigns, item.linkedCampaignId, 'بدون حملة')}</select></label>
    <label>القرار المرتبط<select name="decisionId">${options(appState.data.decisions, item.linkedDecisionId, 'بدون قرار')}</select></label>
    <label>المراجعة المرتبطة<select name="reviewId">${options(appState.data.reviews, item.linkedReviewId, 'بدون مراجعة')}</select></label>`;
}

export function openWinModal(id = '', defaults = {}) {
  const item = normalizeWin(appState.data.wins.find(x => x.id === id) || defaults || { date: todayISO() });
  const lessonsText = (item.lessons || []).join('\n');
  openModal({
    title: item.id ? 'تعديل فوز' : 'إضافة فوز',
    saveText: 'حفظ',
    size: 'wide',
    body: `<form id="entityForm" class="form-grid win-form">
      <input type="hidden" name="id" value="${safeText(item.id || '')}">
      <label>عنوان الفوز<input name="title" required value="${safeText(item.title || '')}" placeholder="مثال: أنهيت 3 مهام مهمة"></label>
      <label>النوع<select name="type">${winTypes.map(v => `<option ${v === item.type ? 'selected' : ''}>${safeText(v)}</option>`).join('')}</select></label>
      <label>حجم الفوز<select name="size">${winSizes.map(v => `<option ${v === item.size ? 'selected' : ''}>${safeText(v)}</option>`).join('')}</select></label>
      <label>التاريخ<input type="date" name="date" value="${safeText(item.date || todayISO())}"></label>
      <label class="full">الوصف<textarea name="description" placeholder="ما الذي حدث؟">${safeText(item.description || '')}</textarea></label>
      <label class="full">الأثر<textarea name="impact" placeholder="ما أثر الفوز عليك أو على المشروع؟">${safeText(item.impact || '')}</textarea></label>
      <label class="full">دروس الفوز — كل درس في سطر<textarea name="lessonsText" placeholder="ما الذي تعلمته؟\nكيف تكرر هذا الفوز؟">${safeText(lessonsText)}</textarea></label>
      ${relationFields(item)}
    </form>`,
    onSave: () => {
      const form = document.getElementById('entityForm');
      if (!form.reportValidity()) return;
      const d = objectFromForm(form);
      upsert('wins', {
        id: d.id || generateId('win'),
        title: d.title,
        description: d.description,
        type: d.type,
        size: d.size,
        date: d.date || todayISO(),
        impact: d.impact,
        lessons: parseLines(d.lessonsText),
        linkedGoalId: d.goalId,
        linkedProjectId: d.projectId,
        linkedTaskId: d.taskId,
        linkedKnowledgeId: d.knowledgeId,
        linkedCampaignId: d.campaignId,
        linkedDecisionId: d.decisionId,
        linkedReviewId: d.reviewId,
        sourceType: item.sourceType || 'manual',
        sourceId: item.sourceId || ''
      });
      closeModal(); toast('تم حفظ الفوز');
    }
  });
}

export function editWin(id) { openWinModal(id); }
export function deleteWin(id) { removeItem('wins', id); }

export function duplicateWin(id) {
  const source = normalizeWin(appState.data.wins.find(win => win.id === id));
  if (!source?.id) return;
  openWinModal('', { ...source, id: '', title: `${source.title} — نسخة`, date: todayISO(), sourceType: 'manual-copy', sourceId: '' });
}

export function recordSuggestedWin(key) {
  const suggestion = getWinSuggestions().find(item => item.key === key);
  if (!suggestion) { toast('الاقتراح لم يعد متاحًا', 'warning'); return; }
  upsert('wins', {
    id: generateId('win'),
    title: suggestion.title,
    description: suggestion.description,
    type: suggestion.type,
    size: suggestion.size,
    date: todayISO(),
    impact: 'تم تسجيله من اقتراحات خطة الفوز.',
    lessons: ['كرر السلوك الذي صنع هذا الفوز.', 'حوّل الفوز القادم إلى عادة صغيرة.'],
    linkedTaskId: suggestion.linkedTaskId || '',
    linkedKnowledgeId: suggestion.linkedKnowledgeId || '',
    linkedCampaignId: suggestion.linkedCampaignId || '',
    linkedReviewId: suggestion.linkedReviewId || '',
    sourceType: 'suggested-win',
    sourceId: suggestion.key
  });
  toast('تم تسجيل الفوز');
}

export function claimWinReward(id) {
  const reward = winRewards.find(item => item.id === id);
  if (!reward) return;
  const points = getTotalWinPoints();
  if (points < reward.points) { toast('الهدية لم تفتح بعد', 'warning'); return; }
  appState.data.settings.claimedWinRewards = Array.from(new Set([...(getClaimedRewards()), id]));
  autoSave();
  renderPage();
  toast('تم استلام الهدية. استمتع بها بوعي');
}

export function setWinFilter(value = 'all') {
  setFilter('wins', value || 'all');
  renderPage();
}

export function setWinSearch(value = '') {
  appState.filters.winQuery = raw(value);
  renderPage();
}

export function quickWinFromTask(taskId) {
  const task = appState.data.tasks.find(t => t.id === taskId);
  if (!task) return;
  openWinModal('', { title: `أنجزت: ${task.title}`, type: 'إنجاز', size: 'صغير', date: todayISO(), linkedTaskId: task.id, description: 'تم تسجيل فوز من مهمة مكتملة.' });
}

export function getWinIntelligence() {
  const wins = getWins();
  return { stats: getWinStats(), suggestions: getWinSuggestions(), recent: wins.sort((a, b) => dateValue(b.date) - dateValue(a.date)).slice(0, 5) };
}
