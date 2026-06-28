import { appState, setFilter } from '../state.js';
import { autoSave, saveData } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, toast } from '../ui.js';
import { addDaysISO, formatDate, generateId, linesToText, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';
import { openTaskModal } from './tasks.js';
import { buildEmbedUrl, fetchYouTubeMetadata, parseYouTubeUrl, secondsToTime } from './youtube.js';

const types = ['فيديو','Playlist','بودكاست','كتاب PDF','مقال','رابط','ملاحظة','فكرة','صور'];
const statuses = ['جديد','قيد المراجعة','تم تلخيصه','تحول لأفعال','مؤرشف'];
const learningStatuses = ['لم أبدأ','جاري المشاهدة','انتهيت','أحتاج مراجعة','تم تحويله لتنفيذ'];
const knowledgeFilters = [
  ['all', 'كل المعرفة'],
  ['needs-review', 'يحتاج مراجعة'],
  ['not-completed', 'غير مكتمل'],
  ['completed', 'مكتمل'],
  ['converted', 'تحول لتنفيذ'],
  ['video', 'فيديو'],
  ['playlist', 'Playlist']
];
const youtubePlayers = new Map();
const progressTimers = new Map();
let youtubeApiPromise = null;

export function renderKnowledge() {
  const actions = '<button class="btn primary" data-action="open-knowledge-modal">إضافة معرفة</button>';
  const filtered = getFilteredKnowledge();
  return `<section class="page knowledge-library-page">${pageHeader('المعرفة', 'مكتبة منظمة: العناصر مختصرة هنا، والتفاصيل تظهر عند الفتح حتى لا تزحم الصفحة.', actions)}
    ${renderKnowledgeLearningSummary()}
    ${renderKnowledgeFilters()}
    ${renderContinueLearning()}
    ${renderKnowledgeLibrary(filtered, actions)}
    ${renderReviewQueue()}
  </section>`;
 }

function isVideoKnowledge(item = {}) {
  return ['فيديو', 'Playlist'].includes(item.type) || Boolean(item.youtube?.videoId || item.youtube?.playlistId || item.youtube?.playlistItems?.length) || getLocalFiles(item).some(file => file.kind === 'video');
}

function isPdfKnowledge(item = {}) {
  return item.type === 'كتاب PDF' || getLocalFiles(item).some(file => file.kind === 'pdf') || /\.pdf($|[?#])/i.test(item.url || '');
}

function getEstimatedKnowledgeSeconds(item = {}) {
  if (isPdfKnowledge(item)) {
    const progress = getPdfProgress(item);
    return safeNumber(progress.totalPages || item.meta?.pages) * 90;
  }
  return safeNumber(item.meta?.durationMinutes) * 60;
}

function getVideoEntries(item) {
  const youtube = item.youtube || {};
  if (isVideoKnowledge(item)) {
    const localVideos = getLocalFiles(item).filter(file => file.kind === 'video');
    const videos = youtube.playlistItems?.length
      ? youtube.playlistItems
      : localVideos.length
        ? localVideos.map(file => ({ videoId: file.id, title: file.name, durationSeconds: safeNumber(file.durationSeconds || item.meta?.durationMinutes * 60) }))
        : [{ videoId: youtube.videoId || 'general', title: item.title, durationSeconds: youtube.durationSeconds || safeNumber(item.meta?.durationMinutes) * 60 }];
    return videos.map(video => {
      const id = video.videoId || 'general';
      return { ...video, content: getVideoContent(item, id), id };
    });
  }
  const id = isPdfKnowledge(item) ? 'pdf' : 'general';
  return [{ id, videoId: id, title: item.title, durationSeconds: getEstimatedKnowledgeSeconds(item), content: getVideoContent(item, id), kind: item.type || 'معرفة' }];
}

function isReviewDue(content = {}) {
  return Boolean(content.reviewAt && content.reviewAt <= todayISO() && content.learningStatus !== 'تم تحويله لتنفيذ');
}

function getKnowledgeMetrics() {
  const entries = appState.data.knowledge.flatMap(getVideoEntries);
  const total = entries.length;
  const completed = entries.filter(entry => ['انتهيت', 'تم تحويله لتنفيذ'].includes(entry.content.learningStatus)).length;
  const needsReview = entries.filter(entry => entry.content.learningStatus === 'أحتاج مراجعة' || isReviewDue(entry.content)).length;
  const converted = entries.filter(entry => entry.content.learningStatus === 'تم تحويله لتنفيذ' || entry.content.convertedAt).length;
  const totalDuration = entries.reduce((sum, entry) => sum + safeNumber(entry.durationSeconds), 0);
  return { total, completed, needsReview, converted, totalDuration };
}

function getAllKnowledgeTags() {
  return [...new Set(appState.data.knowledge.flatMap(item => getVideoEntries(item).flatMap(entry => entry.content.tags || [])))].filter(Boolean).sort();
}

function itemMatchesLearningFilter(item, filter) {
  if (filter === 'all') return true;
  if (filter === 'video') return item.youtube?.kind === 'video' || item.type === 'فيديو';
  if (filter === 'playlist') return item.youtube?.kind === 'playlist' || item.type === 'Playlist';
  const entries = getVideoEntries(item);
  if (filter === 'needs-review') return entries.some(entry => entry.content.learningStatus === 'أحتاج مراجعة' || isReviewDue(entry.content));
  if (filter === 'not-completed') return entries.some(entry => !['انتهيت', 'تم تحويله لتنفيذ'].includes(entry.content.learningStatus));
  if (filter === 'completed') return entries.some(entry => ['انتهيت', 'تم تحويله لتنفيذ'].includes(entry.content.learningStatus));
  if (filter === 'converted') return entries.some(entry => entry.content.learningStatus === 'تم تحويله لتنفيذ' || entry.content.convertedAt);
  return true;
}

function getFilteredKnowledge() {
  const filter = appState.filters.knowledge || 'all';
  const query = (appState.searchQuery || '').trim().toLowerCase();
  return appState.data.knowledge.filter(item => {
    const text = [item.title, item.category, item.type, item.fileName, item.url, ...getVideoEntries(item).flatMap(entry => [entry.title, entry.content.summary, entry.content.notes, ...(entry.content.tags || []), ...(entry.content.extractedIdeas || []), ...(entry.content.extractedActions || [])])].join(' ').toLowerCase();
    return itemMatchesLearningFilter(item, filter) && (!query || text.includes(query));
  });
}

function renderKnowledgeLearningSummary() {
  const metrics = getKnowledgeMetrics();
  const completion = metrics.total ? Math.round((metrics.completed / metrics.total) * 100) : 0;
  return `<div class="knowledge-learning-summary">
    <article class="mini-kpi"><span>فيديوهات/دروس</span><b>${safeText(metrics.total)}</b></article>
    <article class="mini-kpi"><span>مكتمل</span><b>${safeText(metrics.completed)}</b></article>
    <article class="mini-kpi warning"><span>يحتاج مراجعة</span><b>${safeText(metrics.needsReview)}</b></article>
    <article class="mini-kpi"><span>تحول لتنفيذ</span><b>${safeText(metrics.converted)}</b></article>
    <article class="mini-kpi"><span>إجمالي الوقت</span><b>${safeText(secondsToTime(metrics.totalDuration))}</b></article>
    <article class="mini-kpi"><span>اكتمال التعلم</span><b>${safeText(completion)}%</b></article>
  </div>`;
}

function renderKnowledgeFilters() {
  const selected = appState.filters.knowledge || 'all';
  const tags = getAllKnowledgeTags();
  return `<div class="knowledge-filter-bar">
    <label>فلترة التعلم<select data-action="knowledge-filter">${knowledgeFilters.map(([value, label]) => `<option value="${safeText(value)}" ${value === selected ? 'selected' : ''}>${safeText(label)}</option>`).join('')}</select></label>
    <label>بحث داخل المعرفة<input data-action="knowledge-search" value="${safeText(appState.searchQuery || '')}" placeholder="ابحث بعنوان، Tag، فكرة، فعل..."></label>
    <div class="knowledge-tags-cloud">${tags.length ? tags.slice(0, 14).map(tag => `<button class="tag-pill" data-action="knowledge-search-tag" data-tag="${safeText(tag)}">#${safeText(tag)}</button>`).join('') : '<span class="meta">أضف Tags داخل كل فيديو لتظهر هنا.</span>'}</div>
  </div>`;
}


function getKnowledgeTypeKey(item = {}) {
  if (item.type === 'Playlist' || item.youtube?.kind === 'playlist' || item.youtube?.playlistItems?.length) return 'playlists';
  if (item.type === 'فيديو' || item.youtube?.kind === 'video' || getLocalFiles(item).some(file => file.kind === 'video')) return 'videos';
  if (isPdfKnowledge(item)) return 'books';
  if (item.type === 'صور' || getLocalFiles(item).some(file => file.kind === 'image')) return 'images';
  if (item.type === 'مقال') return 'articles';
  if (['فكرة', 'ملاحظة'].includes(item.type)) return 'notes';
  return 'links';
}

function getKnowledgeGroups() {
  return [
    { key: 'playlists', title: 'Playlists', icon: '▶️', hint: 'كل بلاي ليست تظهر كمجلد واحد، والفيديوهات تظهر عند الفتح.' },
    { key: 'videos', title: 'فيديوهات', icon: '🎬', hint: 'فيديوهات منفردة أو فيديوهات مرفوعة من الجهاز.' },
    { key: 'books', title: 'كتب PDF', icon: '📚', hint: 'كتب وملفات PDF مع تقدم قراءة.' },
    { key: 'images', title: 'صور وألبومات', icon: '🖼️', hint: 'مجموعات صور أو روابط صور.' },
    { key: 'articles', title: 'مقالات', icon: '📰', hint: 'مقالات للقراءة والتحويل لأفعال.' },
    { key: 'notes', title: 'أفكار وملاحظات', icon: '💡', hint: 'أفكار خام وملاحظات سريعة.' },
    { key: 'links', title: 'روابط وبودكاست', icon: '🔗', hint: 'روابط عامة وبودكاست ومصادر خارجية.' }
  ];
}

function renderContinueLearning() {
  const items = appState.data.knowledge
    .map(item => ({ item, score: getKnowledgeActivityScore(item) }))
    .filter(record => record.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  if (!items.length) return '';
  return `<section class="knowledge-strip"><div class="section-title"><h3>استكمل التعلم</h3><p>آخر عناصر فيها تقدم أو قراءة.</p></div><div class="knowledge-strip-grid">${items.map(({ item }) => knowledgeLibraryCard(item, true)).join('')}</div></section>`;
}

function getKnowledgeActivityScore(item = {}) {
  const progress = item.videoProgress || {};
  const pdf = getPdfProgress(item);
  const updated = Date.parse(item.updatedAt || item.createdAt || '') || 0;
  return safeNumber(progress.watchedSeconds) + safeNumber(pdf.currentPage) * 50 + (updated / 100000000000);
}

function renderReviewQueue() {
  const due = appState.data.knowledge.filter(item => getVideoEntries(item).some(entry => entry.content.learningStatus === 'أحتاج مراجعة' || isReviewDue(entry.content))).slice(0, 4);
  if (!due.length) return '';
  return `<section class="knowledge-strip"><div class="section-title"><h3>قائمة المراجعة</h3><p>عناصر تحتاج نظرة سريعة أو مراجعة مجدولة.</p></div><div class="knowledge-strip-grid compact">${due.map(item => knowledgeLibraryCard(item, true)).join('')}</div></section>`;
}

function renderKnowledgeLibrary(items = [], actions = '') {
  if (!items.length) return emptyState('لا توجد نتائج مطابقة', 'غيّر الفلتر أو البحث، أو أضف معرفة جديدة من YouTube أو PDF أو صور أو رابط.', actions);
  const groups = getKnowledgeGroups();
  const byGroup = groups.reduce((acc, group) => ({ ...acc, [group.key]: [] }), {});
  items.forEach(item => { (byGroup[getKnowledgeTypeKey(item)] ||= []).push(item); });
  const total = items.length;
  return `<section class="knowledge-library-shell">
    <div class="section-title"><h3>مكتبة المعرفة</h3><p>إجمالي ${safeText(total)} عنصر — افتح النوع أو العنصر المطلوب فقط.</p></div>
    <div class="knowledge-type-tabs">${groups.map(group => `<button class="knowledge-type-tab" data-action="knowledge-filter" value="${safeText(group.key === 'videos' ? 'video' : group.key === 'playlists' ? 'playlist' : 'all')}"><span>${group.icon}</span><b>${safeText(group.title)}</b><em>${safeText(byGroup[group.key]?.length || 0)}</em></button>`).join('')}</div>
    <div class="knowledge-accordion-list">
      ${groups.filter(group => byGroup[group.key]?.length).map((group, index) => `<details class="knowledge-accordion" ${index < 2 ? 'open' : ''}>
        <summary><span>${group.icon}</span><b>${safeText(group.title)}</b><small>${safeText(group.hint)}</small><em>${safeText(byGroup[group.key].length)}</em></summary>
        <div class="knowledge-library-grid">${byGroup[group.key].map(item => knowledgeLibraryCard(item)).join('')}</div>
      </details>`).join('')}
    </div>
  </section>`;
}

function getKnowledgeCover(item = {}) {
  const files = getLocalFiles(item);
  const image = files.find(file => file.kind === 'image' && file.dataUrl);
  if (image) return `<img src="${safeText(image.dataUrl)}" alt="${safeText(item.title)}">`;
  if (item.youtube?.thumbnail) return `<img src="${safeText(item.youtube.thumbnail)}" alt="${safeText(item.title)}">`;
  const key = getKnowledgeTypeKey(item);
  const icon = { playlists: '▶️', videos: '🎬', books: '📚', images: '🖼️', articles: '📰', notes: '💡', links: '🔗' }[key] || '🧠';
  return `<span>${icon}</span>`;
}

function getKnowledgeCardStats(item = {}) {
  const key = getKnowledgeTypeKey(item);
  if (key === 'playlists') {
    const list = item.youtube?.playlistItems || getLocalFiles(item).filter(file => file.kind === 'video');
    const done = item.videoProgress?.completedVideoIds?.length || 0;
    const totalSeconds = safeNumber(item.youtube?.totalDurationSeconds || item.youtube?.durationSeconds || item.meta?.durationMinutes * 60);
    return [`${list.length || item.youtube?.itemCount || 0} فيديو`, `${done} مكتمل`, secondsToTime(totalSeconds)];
  }
  if (key === 'videos') {
    const totalSeconds = safeNumber(item.youtube?.durationSeconds || item.meta?.durationMinutes * 60);
    const watched = safeNumber(item.videoProgress?.watchedSeconds || item.videoProgress?.byVideo?.[item.youtube?.videoId || 'general']);
    return [secondsToTime(totalSeconds), watched ? `شوهد ${secondsToTime(watched)}` : 'لم يبدأ'];
  }
  if (key === 'books') {
    const p = getPdfProgress(item);
    const total = safeNumber(p.totalPages || item.meta?.pages);
    const current = safeNumber(p.currentPage || item.meta?.currentPage);
    return [`${current}/${total || '؟'} صفحة`, `${getPdfPercent(item)}% قراءة`, `${secondsToTime(safeNumber(p.readingSeconds))}`];
  }
  if (key === 'images') {
    const count = getLocalFiles(item).filter(file => file.kind === 'image').length || safeNumber(item.meta?.imageCount);
    return [`${count || 'رابط'} صورة`, item.category || 'عام'];
  }
  return [item.type || 'معرفة', item.category || 'عام', item.status || 'جديد'];
}

function knowledgeLibraryCard(item = {}, small = false) {
  const stats = getKnowledgeCardStats(item).filter(Boolean);
  const entries = getVideoEntries(item);
  const completed = entries.filter(entry => ['انتهيت', 'تم تحويله لتنفيذ'].includes(entry.content.learningStatus)).length;
  const percent = entries.length ? Math.round((completed / entries.length) * 100) : (isPdfKnowledge(item) ? getPdfPercent(item) : safeNumber(item.progress));
  const typeKey = getKnowledgeTypeKey(item);
  const typeName = getKnowledgeGroups().find(g => g.key === typeKey)?.title || item.type || 'معرفة';
  return `<article class="knowledge-library-card ${small ? 'small' : ''}">
    <button class="knowledge-card-open" data-action="open-knowledge-reader" data-id="${safeText(item.id)}" aria-label="فتح ${safeText(item.title)}">
      <div class="knowledge-cover ${typeKey}">${getKnowledgeCover(item)}</div>
      <div class="knowledge-card-main">
        <div class="knowledge-card-head"><span>${safeText(typeName)}</span><em>${safeText(item.status || 'جديد')}</em></div>
        <h3>${safeText(item.title || item.fileName || 'بدون عنوان')}</h3>
        <div class="knowledge-card-stats">${stats.slice(0, 3).map(stat => `<b>${safeText(stat)}</b>`).join('')}</div>
        <div class="mini-progress"><span style="width:${safeText(Math.min(100, Math.max(0, percent)))}%"></span></div>
      </div>
    </button>
    <div class="knowledge-card-actions">
      <button class="btn primary" data-action="open-knowledge-reader" data-id="${safeText(item.id)}">فتح</button>
      <button class="btn ghost" data-action="edit-knowledge" data-id="${safeText(item.id)}">تعديل</button>
      <button class="btn ghost" data-action="knowledge-to-task" data-id="${safeText(item.id)}">مهمة</button>
    </div>
  </article>`;
}

function knowledgeCard(item) {
  const youtube = item.youtube || {};
  const parsed = parseYouTubeUrl(item.url || '');
  const activeVideoId = youtube.currentVideoId || youtube.videoId || parsed.videoId || youtube.playlistItems?.[0]?.videoId || '';
  const isYouTube = Boolean(activeVideoId || youtube.playlistId || parsed.playlistId);
  const isVideo = isVideoKnowledge(item);
  const localPreview = renderLocalMediaPreview(item);
  const preview = localPreview || (isVideo && isYouTube && activeVideoId
    ? `<div class="video-shell">
        <div id="yt-player-${safeText(item.id)}" class="youtube-player" data-knowledge-id="${safeText(item.id)}" data-video-id="${safeText(activeVideoId)}"></div>
      </div>`
    : renderExternalPreview(item));

  const extra = `<button class="btn primary" data-action="knowledge-to-task" data-id="${safeText(item.id)}">تحويل لمهمة</button><button class="btn ghost" data-action="review-knowledge" data-id="${safeText(item.id)}">مراجعة</button>`;

  if (isVideo) {
    const progress = renderVideoProgress(item);
    const playlist = renderPlaylist(item, activeVideoId);
    const videoWorkspace = renderCurrentVideoWorkspace(item, activeVideoId);
    const timedNotes = renderTimedNotes(item, activeVideoId);
    return simpleCard('knowledge', item, `${preview}
      <div class="meta"><span>${safeText(item.type)}</span><span>${safeText(item.category || 'عام')}</span>${youtube.channelTitle ? `<span>${safeText(youtube.channelTitle)}</span>` : ''}</div>
      ${renderItemLearningBadges(item, activeVideoId)}
      ${progress}
      ${playlist}
      ${videoWorkspace}
      <div class="knowledge-section"><h4>ملاحظات مرتبطة بالوقت لهذا الفيديو</h4>
        <div class="timed-note-form"><input data-note-input="${safeText(item.id)}" placeholder="اكتب ملاحظة على اللحظة الحالية في الفيديو"><button class="btn primary" data-action="add-video-note" data-id="${safeText(item.id)}">حفظ الملاحظة</button></div>
        ${timedNotes}
      </div>`, extra);
  }

  return simpleCard('knowledge', item, `${preview}
    <div class="meta"><span>${safeText(item.type)}</span><span>${safeText(item.category || 'عام')}</span>${item.fileName ? `<span>${safeText(item.fileName)}</span>` : ''}</div>
    ${renderItemLearningBadges(item, isPdfKnowledge(item) ? 'pdf' : 'general')}
    ${renderTypeSpecificWorkspace(item)}`, extra);
}

function renderExternalPreview(item = {}) {
  if (isPdfKnowledge(item) && item.url) return renderPdfViewer(item, item.url, 'رابط PDF');
  if (item.type === 'صور' && item.url) return `<div class="local-media-box local-images-box"><div class="local-media-head"><b>رابط صور</b><span>${safeText(item.fileName || item.url)}</span></div><a class="btn dark" target="_blank" rel="noopener" href="${safeText(item.url)}">فتح رابط الصور</a></div>`;
  return item.url ? `<a class="btn dark" target="_blank" rel="noopener" href="${safeText(item.url)}">فتح الرابط خارجيًا</a>` : '';
}

function renderTypeSpecificWorkspace(item = {}) {
  if (isPdfKnowledge(item)) return renderPdfWorkspace(item);
  if (item.type === 'صور') return renderImagesWorkspace(item);
  return renderTextKnowledgeWorkspace(item);
}

function getActiveVideoId(item) {
  const youtube = item.youtube || {};
  const parsed = parseYouTubeUrl(item.url || '');
  return youtube.currentVideoId || youtube.videoId || parsed.videoId || youtube.playlistItems?.[0]?.videoId || 'general';
}

function getActiveVideo(item, videoId = '') {
  const id = videoId || getActiveVideoId(item);
  return (item.youtube?.playlistItems || []).find(video => video.videoId === id) || {};
}

function getVideoContent(item, videoId = '') {
  const id = videoId || getActiveVideoId(item);
  if (id === 'pdf' && isPdfKnowledge(item)) {
    const progress = getPdfProgress(item);
    const done = Boolean(progress.completedAt || (progress.totalPages && progress.currentPage >= progress.totalPages));
    return {
      summary: item.summary || item.meta?.contentText || '',
      notes: item.notes || '',
      extractedIdeas: item.extractedIdeas || [],
      extractedActions: item.extractedActions || [],
      learningStatus: done ? 'انتهيت' : progress.currentPage ? 'جاري القراءة' : 'لم أبدأ',
      tags: [],
      reviewAt: item.lastReviewAt || '',
      linkedGoalId: item.linkedGoalId || '',
      linkedProjectId: item.linkedProjectId || '',
      convertedAt: ''
    };
  }
  const current = item.videoContent?.[id] || {};
  const video = getActiveVideo(item, id);
  return {
    summary: current.summary ?? video.description ?? item.summary ?? '',
    notes: current.notes ?? '',
    extractedIdeas: current.extractedIdeas || [],
    extractedActions: current.extractedActions || [],
    learningStatus: current.learningStatus || 'لم أبدأ',
    tags: Array.isArray(current.tags) ? current.tags : parseLines(current.tags || ''),
    reviewAt: current.reviewAt || '',
    linkedGoalId: current.linkedGoalId || item.linkedGoalId || '',
    linkedProjectId: current.linkedProjectId || item.linkedProjectId || '',
    convertedAt: current.convertedAt || ''
  };
}

function renderItemLearningBadges(item, activeVideoId = '') {
  const entries = getVideoEntries(item);
  const active = getVideoContent(item, activeVideoId);
  const tags = active.tags || [];
  const completedCount = entries.filter(entry => ['انتهيت', 'تم تحويله لتنفيذ'].includes(entry.content.learningStatus)).length;
  const needsReviewCount = entries.filter(entry => entry.content.learningStatus === 'أحتاج مراجعة' || isReviewDue(entry.content)).length;
  return `<div class="learning-badges">
    <span class="learning-status-chip">${safeText(active.learningStatus)}</span>
    <span>${safeText(completedCount)} / ${safeText(entries.length)} مكتمل</span>
    ${needsReviewCount ? `<span class="danger-chip">${safeText(needsReviewCount)} يحتاج مراجعة</span>` : ''}
    ${tags.slice(0, 5).map(tag => `<span class="tag-pill passive">#${safeText(tag)}</span>`).join('')}
  </div>`;
}

function goalOptions(selected = '') {
  return `<option value="">بدون هدف</option>${appState.data.goals.map(goal => `<option value="${safeText(goal.id)}" ${goal.id === selected ? 'selected' : ''}>${safeText(goal.title)}</option>`).join('')}`;
}

function projectOptions(selected = '') {
  return `<option value="">بدون مشروع</option>${appState.data.projects.map(project => `<option value="${safeText(project.id)}" ${project.id === selected ? 'selected' : ''}>${safeText(project.title)}</option>`).join('')}`;
}

function renderReviewInfo(content) {
  if (!content.reviewAt) return '<span>لا توجد مراجعة مجدولة</span>';
  return `<span class="${isReviewDue(content) ? 'review-due' : ''}">مراجعة: ${safeText(formatDate(content.reviewAt))}</span>`;
}

function renderCurrentVideoWorkspace(item, activeVideoId = '') {
  const videoId = activeVideoId || getActiveVideoId(item);
  const video = getActiveVideo(item, videoId);
  const content = getVideoContent(item, videoId);
  return `<div class="knowledge-section video-workspace" data-video-workspace="${safeText(item.id)}">
    <div class="workspace-head">
      <div><h4>محتوى هذا الفيديو</h4><p>${safeText(video.title || item.title || 'الفيديو الحالي')}</p></div>
      <div class="workspace-actions">
        <button class="btn ghost" data-action="mark-video-complete" data-id="${safeText(item.id)}">تمت المشاهدة</button>
        <button class="btn ghost" data-action="schedule-video-review" data-id="${safeText(item.id)}">مراجعة بعد 7 أيام</button>
        <button class="btn primary" data-action="save-video-content" data-id="${safeText(item.id)}">حفظ محتوى الفيديو</button>
      </div>
    </div>
    <div class="learning-control-grid">
      <label>حالة التعلم<select data-video-field="learningStatus" data-video-id="${safeText(videoId)}">${learningStatuses.map(status => `<option ${status === content.learningStatus ? 'selected' : ''}>${safeText(status)}</option>`).join('')}</select></label>
      <label>Tags — افصل كل Tag بسطر أو فاصلة<input data-video-field="tags" data-video-id="${safeText(videoId)}" value="${safeText((content.tags || []).join(', '))}" placeholder="تسويق, يوتيوب, مبيعات"></label>
      <label>ربط بهدف<select data-video-field="linkedGoalId" data-video-id="${safeText(videoId)}">${goalOptions(content.linkedGoalId)}</select></label>
      <label>ربط بمشروع<select data-video-field="linkedProjectId" data-video-id="${safeText(videoId)}">${projectOptions(content.linkedProjectId)}</select></label>
    </div>
    <div class="learning-review-row">${renderReviewInfo(content)}${content.convertedAt ? `<span>تحول لتنفيذ: ${safeText(formatDate(content.convertedAt))}</span>` : ''}</div>
    <label>الملخص<textarea data-video-field="summary" data-video-id="${safeText(videoId)}" placeholder="اكتب ملخص هذا الفيديو فقط">${safeText(content.summary)}</textarea></label>
    <label>الملاحظات العامة<textarea data-video-field="notes" data-video-id="${safeText(videoId)}" placeholder="ملاحظات عامة على هذا الفيديو فقط">${safeText(content.notes)}</textarea></label>
    <label>أفكار مستخرجة — كل فكرة في سطر<textarea data-video-field="extractedIdeas" data-video-id="${safeText(videoId)}" placeholder="فكرة 1\nفكرة 2">${safeText(linesToText(content.extractedIdeas))}</textarea></label>
    <label>أفعال مستخرجة — كل فعل في سطر<textarea data-video-field="extractedActions" data-video-id="${safeText(videoId)}" placeholder="فعل 1\nفعل 2">${safeText(linesToText(content.extractedActions))}</textarea></label>
    <div class="btn-row"><button class="btn primary" data-action="video-content-to-tasks" data-id="${safeText(item.id)}">استخرج خطة تنفيذ</button><button class="btn ghost" data-action="knowledge-to-task" data-id="${safeText(item.id)}">تحويل لمهمة واحدة</button></div>
  </div>`;
}

function renderVideoProgress(item) {
  const youtube = item.youtube || {};
  const progress = item.videoProgress || {};
  const playlistItems = youtube.playlistItems || [];
  const total = safeNumber(youtube.totalDurationSeconds || youtube.durationSeconds);
  const currentVideoId = youtube.currentVideoId || youtube.videoId;
  const currentVideo = playlistItems.find(v => v.videoId === currentVideoId) || playlistItems[0] || {};
  const watched = safeNumber(progress.byVideo?.[currentVideoId] || progress.watchedSeconds);
  const currentPercent = currentVideo.durationSeconds ? Math.min(100, Math.round((watched / currentVideo.durationSeconds) * 100)) : 0;
  const completed = Array.isArray(progress.completedVideoIds) ? progress.completedVideoIds : [];
  const playlistWatched = playlistItems.reduce((sum, video) => {
    if (completed.includes(video.videoId)) return sum + safeNumber(video.durationSeconds);
    return sum + Math.min(safeNumber(progress.byVideo?.[video.videoId]), safeNumber(video.durationSeconds));
  }, 0);
  const totalPercent = total ? Math.min(100, Math.round((playlistWatched / total) * 100)) : currentPercent;
  const label = youtube.kind === 'playlist' ? `تقدم البلاي ليست: ${totalPercent}%` : `تقدم الفيديو: ${currentPercent}%`;
  return `<div class="knowledge-progress">
    <div class="progress-line"><b>${safeText(label)}</b><span>${safeText(secondsToTime(playlistWatched || watched))} / ${safeText(secondsToTime(total || currentVideo.durationSeconds))}</span></div>
    <div class="progress"><span style="width:${safeText(totalPercent || currentPercent)}%"></span></div>
    <div class="meta"><span>الفيديو الحالي: ${safeText(secondsToTime(watched))} / ${safeText(secondsToTime(currentVideo.durationSeconds || youtube.durationSeconds))}</span>${youtube.itemCount ? `<span>عدد الفيديوهات: ${safeText(youtube.itemCount)}</span>` : ''}</div>
  </div>`;
}

function renderPlaylist(item, activeVideoId) {
  const youtube = item.youtube || {};
  const list = youtube.playlistItems || [];
  if (youtube.kind !== 'playlist' || !list.length) return '';
  const completed = item.videoProgress?.completedVideoIds || [];
  return `<div class="knowledge-section playlist-box"><h4>فيديوهات البلاي ليست</h4><div class="playlist-list">
    ${list.map((video, index) => `<button class="playlist-item ${video.videoId === activeVideoId ? 'active' : ''}" data-action="knowledge-select-video" data-id="${safeText(item.id)}" data-video-id="${safeText(video.videoId)}">
      <span>${safeText(index + 1)}</span><b>${safeText(video.title)}</b><small>${safeText(secondsToTime(video.durationSeconds))}</small><em>${completed.includes(video.videoId) ? 'مكتمل' : 'مشاهدة'}</em>
    </button>`).join('')}
  </div></div>`;
}

function renderTimedNotes(item, activeVideoId = '') {
  const videoId = activeVideoId || getActiveVideoId(item);
  const notes = (item.timedNotes || []).filter(note => (note.videoId || 'general') === videoId);
  if (!notes.length) return '<p class="meta">لا توجد ملاحظات زمنية لهذا الفيديو بعد.</p>';
  return `<div class="timed-notes">${notes.map(note => `<button class="timed-note" data-action="seek-video-note" data-id="${safeText(item.id)}" data-note-id="${safeText(note.id)}">
    <span>${safeText(secondsToTime(note.seconds))}</span><b>${safeText(note.text)}</b>
  </button>`).join('')}</div>`;
}

function getLocalFiles(item = {}) {
  return Array.isArray(item.localFiles) ? item.localFiles : [];
}

function formatFileSize(bytes = 0) {
  const size = safeNumber(bytes);
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

function renderLocalFileSummary(item = {}) {
  const files = getLocalFiles(item);
  if (!files.length) return '<p class="meta">لا توجد ملفات مرفوعة محفوظة لهذا العنصر.</p>';
  return `<div class="uploaded-file-list">${files.map(file => `<div class="uploaded-file-chip"><span>${file.kind === 'image' ? '🖼️' : file.kind === 'video' ? '🎬' : file.kind === 'pdf' ? '📄' : '📎'}</span><b>${safeText(file.name)}</b><small>${safeText(formatFileSize(file.size))}</small></div>`).join('')}</div>`;
}

function renderLocalMediaPreview(item = {}) {
  const files = getLocalFiles(item).filter(file => file?.dataUrl);
  if (!files.length) return '';
  const pdf = files.find(file => file.kind === 'pdf' || file.type === 'application/pdf');
  const videos = files.filter(file => file.kind === 'video' || String(file.type || '').startsWith('video/'));
  const images = files.filter(file => file.kind === 'image' || String(file.type || '').startsWith('image/'));
  if (pdf) {
    return renderPdfViewer(item, pdf.dataUrl, `ملف PDF مرفوع · ${pdf.name} · ${formatFileSize(pdf.size)}`);
  }
  if (videos.length) {
    return `<div class="local-media-box local-video-box">
      <div class="local-media-head"><b>فيديو مرفوع من الجهاز</b><span>${safeText(videos[0].name)} · ${safeText(formatFileSize(videos[0].size))}</span></div>
      <video class="local-video-player" controls playsinline preload="metadata" src="${safeText(videos[0].dataUrl)}"></video>
      ${videos.length > 1 ? `<div class="uploaded-file-list">${videos.slice(1).map(file => `<a class="uploaded-file-chip" href="${safeText(file.dataUrl)}" target="_blank" rel="noopener">🎬 <b>${safeText(file.name)}</b><small>${safeText(formatFileSize(file.size))}</small></a>`).join('')}</div>` : ''}
    </div>`;
  }
  if (images.length) {
    return `<div class="local-media-box local-images-box">
      <div class="local-media-head"><b>صور مرفوعة</b><span>${safeText(images.length)} صورة</span></div>
      <div class="local-image-grid">${images.map(file => `<a href="${safeText(file.dataUrl)}" target="_blank" rel="noopener"><img src="${safeText(file.dataUrl)}" alt="${safeText(file.name)}"><small>${safeText(file.name)}</small></a>`).join('')}</div>
    </div>`;
  }
  return '';
}
function renderPdfViewer(item = {}, src = '', label = 'PDF') {
  const progress = getPdfProgress(item);
  const pageHash = progress.currentPage ? `#page=${Math.max(1, safeNumber(progress.currentPage))}` : '';
  const viewerSrc = `${src}${String(src).includes('#') ? '' : pageHash}`;
  return `<div class="local-media-box local-pdf-box" data-knowledge-id="${safeText(item.id)}">
    <div class="local-media-head"><b>قارئ PDF داخل المشروع</b><span>${safeText(label)}</span></div>
    <iframe class="local-pdf-frame" src="${safeText(viewerSrc)}" title="${safeText(item.title || 'PDF')}"></iframe>
    <div class="pdf-viewer-actions"><a class="btn dark" href="${safeText(src)}" target="_blank" rel="noopener">فتح PDF خارجيًا</a><button class="btn ghost" data-action="start-pdf-reading" data-id="${safeText(item.id)}">ابدأ جلسة قراءة</button><button class="btn ghost" data-action="stop-pdf-reading" data-id="${safeText(item.id)}">إنهاء جلسة القراءة</button></div>
  </div>`;
}

function getPdfProgress(item = {}) {
  const meta = getKnowledgeMeta(item);
  const pdfFile = getLocalFiles(item).find(file => file.kind === 'pdf');
  const progress = item.readingProgress || {};
  const totalPages = safeNumber(progress.totalPages || meta.pages || pdfFile?.pageCount || 0);
  const currentPage = Math.min(Math.max(0, safeNumber(progress.currentPage || meta.currentPage || 0)), Math.max(1, totalPages || safeNumber(progress.currentPage || meta.currentPage || 0) || 1));
  return {
    totalPages,
    currentPage,
    startedAt: progress.startedAt || '',
    activeStartedAt: progress.activeStartedAt || '',
    lastReadAt: progress.lastReadAt || '',
    totalSeconds: safeNumber(progress.totalSeconds),
    completedAt: progress.completedAt || ''
  };
}

function getPdfCompletion(progress = {}) {
  return progress.totalPages ? Math.min(100, Math.round((safeNumber(progress.currentPage) / progress.totalPages) * 100)) : 0;
}

function renderPdfWorkspace(item = {}) {
  const progress = getPdfProgress(item);
  const completion = getPdfCompletion(progress);
  const meta = getKnowledgeMeta(item);
  return `<div class="knowledge-section pdf-workspace" data-pdf-workspace="${safeText(item.id)}">
    <div class="workspace-head"><div><h4>تتبع قراءة الكتاب</h4><p>${safeText(item.title || item.fileName || 'كتاب PDF')}</p></div><b class="pdf-percent">${safeText(completion)}%</b></div>
    <div class="knowledge-progress"><div class="progress-line"><b>تقدم القراءة</b><span>${safeText(progress.currentPage)} / ${safeText(progress.totalPages || '؟')} صفحة</span></div><div class="progress"><span style="width:${safeText(completion)}%"></span></div><div class="meta"><span>وقت القراءة المسجل: ${safeText(secondsToTime(progress.totalSeconds))}</span><span>${progress.completedAt ? 'مكتمل' : progress.activeStartedAt ? 'جلسة قراءة نشطة' : 'غير مكتمل'}</span></div></div>
    <div class="pdf-page-control">
      <button class="btn ghost" data-action="pdf-page-prev" data-id="${safeText(item.id)}">− صفحة</button>
      <label>وصلت لصفحة<input data-pdf-field="currentPage" type="number" min="0" value="${safeText(progress.currentPage)}"></label>
      <label>عدد الصفحات<input data-pdf-field="totalPages" type="number" min="0" value="${safeText(progress.totalPages)}" placeholder="لو لم يتم جلبه تلقائيًا"></label>
      <button class="btn ghost" data-action="pdf-page-next" data-id="${safeText(item.id)}">+ صفحة</button>
      <button class="btn primary" data-action="save-pdf-progress" data-id="${safeText(item.id)}">حفظ تقدم القراءة</button>
      <button class="btn dark" data-action="mark-pdf-complete" data-id="${safeText(item.id)}">تم إنهاء الكتاب</button>
    </div>
    <div class="learning-control-grid">
      <label>ربط بهدف<select data-pdf-field="linkedGoalId">${goalOptions(item.linkedGoalId || '')}</select></label>
      <label>ربط بمشروع<select data-pdf-field="linkedProjectId">${projectOptions(item.linkedProjectId || '')}</select></label>
      <label>المؤلف<input data-pdf-field="author" value="${safeText(meta.author || '')}" placeholder="اسم المؤلف"></label>
      <label>خطة القراءة<input data-pdf-field="purpose" value="${safeText(meta.purpose || '')}" placeholder="ماذا تريد من الكتاب؟"></label>
    </div>
    <label>ملخص الكتاب<textarea data-pdf-field="summary" placeholder="اكتب ملخص الكتاب هنا">${safeText(item.summary || meta.contentText || '')}</textarea></label>
    <label>ملاحظات القراءة<textarea data-pdf-field="notes" placeholder="ملاحظات عامة أثناء القراءة">${safeText(item.notes || '')}</textarea></label>
    <label>أفكار مستخرجة — كل فكرة في سطر<textarea data-pdf-field="extractedIdeas" placeholder="فكرة 1\nفكرة 2">${safeText(linesToText(item.extractedIdeas || []))}</textarea></label>
    <label>أفعال مستخرجة — كل فعل في سطر<textarea data-pdf-field="extractedActions" placeholder="فعل 1\nفعل 2">${safeText(linesToText(item.extractedActions || []))}</textarea></label>
    <div class="btn-row"><button class="btn primary" data-action="pdf-content-to-tasks" data-id="${safeText(item.id)}">حوّل أفعال الكتاب لمهام</button><button class="btn ghost" data-action="schedule-pdf-review" data-id="${safeText(item.id)}">مراجعة بعد 7 أيام</button></div>
  </div>`;
}

function renderImagesWorkspace(item = {}) {
  const meta = getKnowledgeMeta(item);
  return `<div class="knowledge-section image-workspace"><h4>محتوى الصور</h4><label>ماذا تريد أن تتذكر؟<textarea readonly>${safeText(meta.contentText || item.summary || '')}</textarea></label><p class="meta">استخدم الصور كمرجع بصري، ويمكن تحويل الملاحظة أو الفكرة إلى مهمة.</p></div>`;
}

function renderTextKnowledgeWorkspace(item = {}) {
  const meta = getKnowledgeMeta(item);
  return `<div class="knowledge-section text-knowledge-workspace"><h4>محتوى ${safeText(item.type || 'المعرفة')}</h4><label>المحتوى / الملاحظات<textarea readonly>${safeText(meta.contentText || item.summary || item.notes || '')}</textarea></label><p class="meta">هذا النوع لا يعرض أدوات فيديو أو PDF حتى لا تختلط البيانات.</p></div>`;
}

function countPdfPagesFromText(text = '') {
  const matches = String(text).match(/\/Type\s*\/Page(?!s)\b/g);
  return matches ? matches.length : 0;
}

async function countPdfPagesFromArrayBuffer(buffer) {
  try {
    const bytes = new Uint8Array(buffer);
    let text = '';
    const chunk = 0x8000;
    for (let i = 0; i < bytes.length; i += chunk) text += String.fromCharCode.apply(null, bytes.subarray(i, i + chunk));
    return countPdfPagesFromText(text);
  } catch { return 0; }
}

function inferTitleFromUrl(url = '') {
  try {
    const clean = decodeURIComponent(new URL(url).pathname.split('/').pop() || '').replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ').trim();
    return clean || 'كتاب PDF';
  } catch { return String(url).split('/').pop()?.replace(/\.pdf$/i, '') || 'كتاب PDF'; }
}




export function openKnowledgeReader(id, videoId = '') {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return toast('عنصر المعرفة غير موجود', 'error');
  if (videoId && item.youtube) {
    item.youtube.currentVideoId = videoId;
    item.youtube.videoId = videoId;
  }
  openModal({
    title: item.title || 'تفاصيل المعرفة',
    body: `<div class="knowledge-reader-mode">${knowledgeCard(item)}</div>`,
    size: 'wide'
  });
  window.setTimeout(initYouTubePlayers, 120);
}

export function openKnowledgeModal(id = '') {
  const item = appState.data.knowledge.find(x => x.id === id) || {};
  const currentType = item.type || 'فيديو';
  openModal({ title: item.id ? 'تعديل معرفة' : 'إضافة معرفة', saveText: 'حفظ', size: 'wide', body: `<form id="entityForm" class="form-grid knowledge-dynamic-form">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>نوع المعرفة<select name="type" data-action="knowledge-type-change">${types.map(v=>`<option ${v===currentType?'selected':''}>${safeText(v)}</option>`).join('')}</select><small class="field-hint">غيّر النوع وستظهر الحقول المناسبة فقط.</small></label>
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}" placeholder="عنوان المعرفة"></label>
    <label>التصنيف<input name="category" value="${safeText(item.category || '')}" placeholder="إنتاجية / تجارة / دين / تعلم"></label>
    <label>الحالة<select name="status">${statuses.map(v=>`<option ${v===item.status?'selected':''}>${safeText(v)}</option>`).join('')}</select></label>
    ${linkedFields({ goalId: item.linkedGoalId, projectId: item.linkedProjectId })}
    <div id="knowledgeTypeFields" class="full knowledge-type-fields">${renderKnowledgeTypeFields(currentType, item)}</div>
  </form>
  <div class="btn-row">
    <button class="btn ghost" data-action="knowledge-to-goal" data-id="${safeText(item.id || '')}">تحويل لهدف</button>
    <button class="btn ghost" data-action="knowledge-to-project" data-id="${safeText(item.id || '')}">تحويل لمشروع</button>
    <button class="btn ghost" data-action="knowledge-to-task" data-id="${safeText(item.id || '')}">تحويل لإجراء</button>
  </div>`, onSave: () => saveKnowledge(item) });
}

function getKnowledgeMeta(item = {}) {
  return item.meta || item.knowledgeMeta || {};
}

function metaValue(item = {}, key = '') {
  const meta = getKnowledgeMeta(item);
  return meta[key] ?? item[key] ?? '';
}

function renderKnowledgeTypeFields(type = 'فيديو', item = {}) {
  const apiKeyHint = appState.data.settings.youtubeApiKey ? 'مفتاح YouTube API محفوظ' : 'ضع المفتاح من المزيد ← الإعدادات لتفعيل جلب بيانات YouTube';
  const urlValue = safeText(item.url || '');
  const fileValue = safeText(item.fileName || '');
  const baseHint = '<div class="full form-note">هذه الحقول تتغير حسب نوع المعرفة. لا توجد بيانات ثابتة لكل الأنواع.</div>';
  if (type === 'فيديو' || type === 'Playlist') {
    return `${baseHint}
      <div class="type-fieldset"><h4>${type === 'Playlist' ? 'بيانات Playlist' : 'بيانات فيديو'}</h4><p>بعد الجلب أو الحفظ، الملخص والملاحظات والأفكار والأفعال تكون داخل كل فيديو نفسه.</p></div>
      <label class="full">رابط YouTube أو رابط فيديو خارجي<div class="input-action"><input name="url" value="${urlValue}" placeholder="ضع رابط فيديو YouTube أو Playlist أو رابط فيديو خارجي"><button type="button" class="btn dark" data-action="fetch-knowledge-metadata">جلب بيانات YouTube</button></div><small class="field-hint">${safeText(apiKeyHint)} — ويمكنك ترك الرابط فارغًا ورفع فيديو من الجهاز.</small></label>
      <label class="full">رفع فيديو من الجهاز ${type === 'Playlist' ? 'أو أكثر من فيديو' : ''}<input name="localFiles" type="file" accept="video/*" ${type === 'Playlist' ? 'multiple' : ''}><small class="field-hint">يعمل من الموبايل أو الكمبيوتر. الملفات الكبيرة جدًا قد لا تُحفظ في LocalStorage، لذلك استخدم رابط خارجي للفيديوهات الضخمة.</small></label>
      <div class="full" data-local-file-summary>${renderLocalFileSummary(item)}</div>
      <label>${type === 'Playlist' ? 'القناة / مالك القائمة' : 'اسم القناة أو اسم الملف'}<input name="fileName" value="${fileValue}" placeholder="يُملأ تلقائيًا عند الجلب أو من اسم الملف"></label>
      <label>المدة المتوقعة بالدقائق<input name="durationMinutes" type="number" min="0" value="${safeText(metaValue(item, 'durationMinutes'))}" placeholder="اختياري لو بدون API"></label>
      <label class="full">هدف المشاهدة<input name="purpose" value="${safeText(metaValue(item, 'purpose'))}" placeholder="لماذا ستشاهد هذا المحتوى؟"></label>`;
  }
  if (type === 'بودكاست') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات بودكاست</h4><p>مصمم للحلقات الصوتية أو روابط Spotify/Apple/YouTube Audio.</p></div>
      <label class="full">رابط الحلقة<input name="url" value="${urlValue}" placeholder="رابط البودكاست أو الحلقة"></label>
      <label>اسم البودكاست<input name="fileName" value="${fileValue}" placeholder="مثال: فنجان / بدون ورق"></label>
      <label>المضيف / الضيف<input name="author" value="${safeText(metaValue(item, 'author'))}" placeholder="اسم المتحدث أو الضيف"></label>
      <label>رقم الحلقة<input name="episode" value="${safeText(metaValue(item, 'episode'))}" placeholder="اختياري"></label>
      <label>مدة الحلقة بالدقائق<input name="durationMinutes" type="number" min="0" value="${safeText(metaValue(item, 'durationMinutes'))}" placeholder="مثال: 60"></label>
      <label class="full">ماذا تريد أن تخرج منه؟<textarea name="contentText" placeholder="أسئلة أو نقاط تريد ملاحظتها أثناء الاستماع">${safeText(metaValue(item, 'contentText'))}</textarea></label>`;
  }
  if (type === 'كتاب PDF') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات كتاب / PDF</h4><p>مناسب للكتب والملفات وملخصات القراءة.</p></div>
      <label class="full">رابط PDF<div class="input-action"><input name="url" value="${urlValue}" placeholder="رابط PDF مباشر أو رابط خارجي أو اتركه فارغًا لو سترفع ملفًا محليًا"><button type="button" class="btn dark" data-action="fetch-pdf-metadata">جلب بيانات PDF</button></div><small class="field-hint">لو الرابط يسمح بالقراءة، سنحاول جلب اسم الملف وعدد الصفحات تلقائيًا. لو لم يسمح بسبب CORS يمكنك إدخال الصفحات يدويًا.</small></label>
      <label class="full">رفع PDF من الجهاز<input name="localFiles" type="file" accept="application/pdf,.pdf"><small class="field-hint">يدعم الموبايل والكمبيوتر. لو الملف كبير جدًا، الأفضل استخدام رابط خارجي حفاظًا على مساحة التخزين.</small></label>
      <div class="full" data-local-file-summary>${renderLocalFileSummary(item)}</div>
      <label>اسم الملف / الكتاب<input name="fileName" value="${fileValue}" placeholder="اسم الكتاب أو الملف"></label>
      <label>المؤلف<input name="author" value="${safeText(metaValue(item, 'author'))}" placeholder="اسم المؤلف"></label>
      <label>عدد الصفحات<input name="pages" type="number" min="0" value="${safeText(metaValue(item, 'pages'))}" placeholder="مثال: 240"></label>
      <label>وصلت لصفحة<input name="currentPage" type="number" min="0" value="${safeText(metaValue(item, 'currentPage'))}" placeholder="لتتبع تقدم القراءة"></label>
      <label class="full">خطة القراءة / أسئلة القراءة<textarea name="contentText" placeholder="اكتب هدفك من الكتاب أو خطة القراءة">${safeText(metaValue(item, 'contentText'))}</textarea></label>`;
  }
  if (type === 'مقال') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات مقال</h4><p>مناسب للمقالات والصفحات الطويلة والتقارير.</p></div>
      <label class="full">رابط المقال<input name="url" value="${urlValue}" placeholder="رابط المقال"></label>
      <label>المصدر<input name="fileName" value="${fileValue}" placeholder="اسم الموقع / المجلة"></label>
      <label>الكاتب<input name="author" value="${safeText(metaValue(item, 'author'))}" placeholder="اختياري"></label>
      <label>وقت القراءة بالدقائق<input name="readingTime" type="number" min="0" value="${safeText(metaValue(item, 'readingTime'))}" placeholder="مثال: 8"></label>
      <label class="full">السؤال الأساسي من المقال<input name="keyQuestion" value="${safeText(metaValue(item, 'keyQuestion'))}" placeholder="ما السؤال الذي تريد أن يجاوب عنه المقال؟"></label>
      <label class="full">مقتطفات أو نقاط أولية<textarea name="contentText" placeholder="انسخ أهم فقرة أو اكتب نقاطك الأولية">${safeText(metaValue(item, 'contentText'))}</textarea></label>`;
  }
  if (type === 'رابط') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات رابط عام</h4><p>مناسب للأدوات والمصادر والمواقع التي ستعود لها لاحقًا.</p></div>
      <label class="full">الرابط<input name="url" value="${urlValue}" placeholder="رابط المصدر"></label>
      <label>اسم المصدر<input name="fileName" value="${fileValue}" placeholder="اسم الموقع أو الأداة"></label>
      <label>نوع المصدر<input name="sourceType" value="${safeText(metaValue(item, 'sourceType'))}" placeholder="أداة / مرجع / كورس / صفحة"></label>
      <label class="full">سبب الحفظ<input name="purpose" value="${safeText(metaValue(item, 'purpose'))}" placeholder="لماذا حفظت هذا الرابط؟"></label>
      <label class="full">ملاحظات سريعة<textarea name="contentText" placeholder="أي ملاحظة عن الرابط">${safeText(metaValue(item, 'contentText'))}</textarea></label>`;
  }
  if (type === 'صور') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات صور / لقطات شاشة</h4><p>مناسب للصور المرجعية، التصميمات، لقطات شاشة، أو أفكار بصرية.</p></div>
      <label class="full">رابط الصورة أو المجلد<input name="url" value="${urlValue}" placeholder="رابط صورة / Drive / مصدر خارجي أو اتركه فارغًا لو سترفع صورًا"></label>
      <label class="full">رفع صور من الجهاز<input name="localFiles" type="file" accept="image/*" multiple><small class="field-hint">يمكن اختيار أكثر من صورة من الموبايل أو الكمبيوتر.</small></label>
      <div class="full" data-local-file-summary>${renderLocalFileSummary(item)}</div>
      <label>اسم المجموعة<input name="fileName" value="${fileValue}" placeholder="مثال: أفكار تصميم إعلان"></label>
      <label>عدد الصور<input name="imageCount" type="number" min="0" value="${safeText(metaValue(item, 'imageCount'))}" placeholder="اختياري"></label>
      <label>مصدر الصور<input name="source" value="${safeText(metaValue(item, 'source'))}" placeholder="Pinterest / عميل / Screenshot"></label>
      <label class="full">ماذا تريد أن تتذكر من هذه الصور؟<textarea name="contentText" placeholder="اكتب الأفكار أو الملاحظات البصرية">${safeText(metaValue(item, 'contentText'))}</textarea></label>`;
  }
  if (type === 'فكرة') {
    return `${baseHint}
      <div class="type-fieldset"><h4>بيانات فكرة</h4><p>مناسب للأفكار السريعة التي قد تتحول لمهمة أو مشروع.</p></div>
      <label>مصدر الفكرة<input name="fileName" value="${fileValue}" placeholder="من أين جاءت الفكرة؟"></label>
      <label>مجال الفكرة<input name="sourceType" value="${safeText(metaValue(item, 'sourceType'))}" placeholder="تسويق / مشروع / تعلم"></label>
      <label class="full">نص الفكرة<textarea name="contentText" required placeholder="اكتب الفكرة بوضوح">${safeText(metaValue(item, 'contentText') || item.summary || '')}</textarea></label>
      <label class="full">أول فعل ممكن<input name="purpose" value="${safeText(metaValue(item, 'purpose'))}" placeholder="ما أول خطوة صغيرة لتجربة الفكرة؟"></label>`;
  }
  return `${baseHint}
    <div class="type-fieldset"><h4>بيانات ملاحظة</h4><p>مناسب للملاحظات الحرة بدون رابط.</p></div>
    <label>مصدر الملاحظة<input name="fileName" value="${fileValue}" placeholder="اختياري"></label>
    <label class="full">نص الملاحظة<textarea name="contentText" required placeholder="اكتب الملاحظة هنا">${safeText(metaValue(item, 'contentText') || item.notes || item.summary || '')}</textarea></label>
    <label class="full">ماذا ستفعل بها؟<input name="purpose" value="${safeText(metaValue(item, 'purpose'))}" placeholder="تحويل لمهمة / مراجعة لاحقة / حفظ فقط"></label>`;
}

export function refreshKnowledgeTypeFields(type = '') {
  const form = document.getElementById('entityForm');
  const container = document.getElementById('knowledgeTypeFields');
  if (!form || !container) return;
  const snapshot = objectFromForm(form);
  const item = {
    ...snapshot,
    linkedGoalId: snapshot.goalId || '',
    linkedProjectId: snapshot.projectId || '',
    meta: collectKnowledgeMeta(snapshot)
  };
  container.innerHTML = renderKnowledgeTypeFields(type || snapshot.type || 'فيديو', item);
}


function collectKnowledgeMeta(data = {}) {
  const metaKeys = ['author','source','sourceType','durationMinutes','episode','pages','currentPage','readingTime','imageCount','contentText','keyQuestion','purpose'];
  return Object.fromEntries(metaKeys.map(key => [key, data[key] || '']).filter(([, value]) => String(value || '').trim() !== ''));
}

function isYouTubeKnowledgeType(type = '') {
  return type === 'فيديو' || type === 'Playlist';
}

function buildKnowledgePayload(existing = {}, data) {
  const keepMedia = data.url === existing.url && isYouTubeKnowledgeType(data.type);
  const meta = collectKnowledgeMeta(data);
  const contentText = meta.contentText || '';
  return {
    id: data.id || generateId('know'),
    title: data.title,
    type: data.type,
    url: data.url || '',
    fileName: data.fileName || '',
    category: data.category || '',
    status: data.status || 'جديد',
    meta,
    summary: isYouTubeKnowledgeType(data.type) ? (existing.summary || '') : contentText,
    notes: isYouTubeKnowledgeType(data.type) ? (existing.notes || '') : contentText,
    extractedIdeas: existing.extractedIdeas || [],
    extractedActions: existing.extractedActions || [],
    linkedGoalId: data.goalId,
    linkedProjectId: data.projectId,
    lastReviewAt: existing.lastReviewAt || null,
    youtube: keepMedia ? existing.youtube : undefined,
    videoProgress: keepMedia ? existing.videoProgress : undefined,
    timedNotes: keepMedia ? existing.timedNotes : [],
    videoContent: keepMedia ? existing.videoContent : {},
    localFiles: existing.localFiles || [],
    readingProgress: existing.readingProgress || {}
  };
}

function getFileKind(file = {}) {
  const type = String(file.type || '');
  if (type === 'application/pdf' || String(file.name || '').toLowerCase().endsWith('.pdf')) return 'pdf';
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';
  return 'file';
}

async function readFileAsDataURL(file) {
  const dataUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
  const payload = { id: generateId('file'), name: file.name, type: file.type, size: file.size, kind: getFileKind(file), dataUrl, createdAt: new Date().toISOString() };
  if (payload.kind === 'pdf') {
    try { payload.pageCount = await countPdfPagesFromArrayBuffer(await file.arrayBuffer()); } catch { payload.pageCount = 0; }
  }
  return payload;
}

async function collectLocalUploads(form, knowledgeType = '') {
  const input = form.querySelector('input[name="localFiles"]');
  const files = Array.from(input?.files || []);
  if (!files.length) return [];
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const maxSingle = 8 * 1024 * 1024;
  const maxBatch = 14 * 1024 * 1024;
  const tooLarge = files.find(file => file.size > maxSingle);
  if (tooLarge) throw new Error(`الملف ${tooLarge.name} كبير جدًا للحفظ المحلي. استخدم رابط خارجي أو ملف أصغر من 8MB.`);
  if (totalSize > maxBatch) throw new Error('إجمالي الملفات كبير جدًا للتخزين المحلي. ارفع عددًا أقل أو استخدم روابط خارجية.');
  const uploaded = await Promise.all(files.map(readFileAsDataURL));
  if (knowledgeType === 'كتاب PDF' && uploaded.some(file => file.kind !== 'pdf')) throw new Error('نوع الكتاب يقبل ملفات PDF فقط.');
  if (knowledgeType === 'صور' && uploaded.some(file => file.kind !== 'image')) throw new Error('نوع الصور يقبل ملفات صور فقط.');
  if ((knowledgeType === 'فيديو' || knowledgeType === 'Playlist') && uploaded.some(file => file.kind !== 'video')) throw new Error('نوع الفيديو يقبل ملفات فيديو فقط.');
  return uploaded;
}

function mergeKnowledgeFiles(existingFiles = [], newFiles = [], knowledgeType = '') {
  if (!newFiles.length) return existingFiles;
  if (knowledgeType === 'صور') return [...existingFiles.filter(file => file.kind === 'image'), ...newFiles];
  if (knowledgeType === 'كتاب PDF') return [...existingFiles.filter(file => file.kind !== 'pdf'), ...newFiles.filter(file => file.kind === 'pdf')].slice(-1);
  if (knowledgeType === 'فيديو') return [...existingFiles.filter(file => file.kind !== 'video'), ...newFiles.filter(file => file.kind === 'video')].slice(-1);
  if (knowledgeType === 'Playlist') return [...existingFiles.filter(file => file.kind !== 'video'), ...newFiles.filter(file => file.kind === 'video')];
  return [...existingFiles, ...newFiles];
}

async function saveKnowledge(existing = {}) {
  const form = document.getElementById('entityForm'); if (!form.reportValidity()) return;
  const data = objectFromForm(form);
  try {
    const uploads = await collectLocalUploads(form, data.type);
    const payload = buildKnowledgePayload(existing, data);
    payload.localFiles = mergeKnowledgeFiles(existing.localFiles || [], uploads, data.type);
    if (!payload.fileName && payload.localFiles.length) payload.fileName = payload.localFiles[0].name;
    if (!payload.title && payload.fileName) payload.title = payload.fileName.replace(/\.[^.]+$/, '');
    if (data.type === 'كتاب PDF') {
      const pdfFile = payload.localFiles.find(file => file.kind === 'pdf');
      payload.meta = { ...(payload.meta || {}) };
      if (!payload.meta.pages && pdfFile?.pageCount) payload.meta.pages = String(pdfFile.pageCount);
      payload.readingProgress = { ...(existing.readingProgress || {}), totalPages: safeNumber(payload.meta.pages || pdfFile?.pageCount || existing.readingProgress?.totalPages), currentPage: safeNumber(payload.meta.currentPage || existing.readingProgress?.currentPage), totalSeconds: safeNumber(existing.readingProgress?.totalSeconds), startedAt: existing.readingProgress?.startedAt || '', lastReadAt: existing.readingProgress?.lastReadAt || '', completedAt: existing.readingProgress?.completedAt || '' };
      if (pdfFile?.pageCount && (!payload.title || payload.title === 'كتاب PDF')) payload.title = pdfFile.name.replace(/\.pdf$/i, '');
    }
    if (uploads.length && !payload.url) payload.url = '';
    upsert('knowledge', payload);
    closeModal(); toast(uploads.length ? 'تم حفظ المعرفة والملفات المرفوعة' : 'تم حفظ المعرفة');
  } catch (error) {
    toast(error.message || 'فشل رفع الملف داخل المعرفة', 'error');
  }
}

export async function fetchKnowledgeMetadataFromForm() {
  const form = document.getElementById('entityForm');
  if (!form) return;
  const urlInput = form.elements.url;
  const url = urlInput?.value?.trim();
  if (!url) return toast('ضع رابط YouTube أولًا', 'error');
  const apiKey = appState.data.settings.youtubeApiKey || '';
  if (!apiKey) return toast('أضف مفتاح YouTube API من المزيد ← الإعدادات', 'error');
  try {
    toast('جاري جلب بيانات YouTube...');
    const meta = await fetchYouTubeMetadata(url, apiKey);
    form.elements.title.value = meta.title || form.elements.title.value;
    form.elements.type.value = meta.type || form.elements.type.value;
    form.elements.fileName.value = meta.fileName || form.elements.fileName.value;
    form.elements.category.value = meta.category || form.elements.category.value || 'YouTube';

    const data = objectFromForm(form);
    const existing = appState.data.knowledge.find(x => x.id === data.id) || {};
    const payload = buildKnowledgePayload(existing, data);
    payload.youtube = meta.youtube;
    payload.summary = meta.summary || existing.summary || '';
    payload.videoProgress = existing.videoProgress || { byVideo: {}, completedVideoIds: [], watchedSeconds: 0, percentage: 0 };
    payload.timedNotes = existing.timedNotes || [];
    payload.videoContent = existing.videoContent && Object.keys(existing.videoContent).length
      ? existing.videoContent
      : buildInitialVideoContent(meta.youtube);
    upsert('knowledge', payload);
    closeModal();
    toast(meta.youtube.kind === 'playlist' ? 'تم جلب البلاي ليست كاملة وحفظها' : 'تم جلب بيانات الفيديو وحفظها');
  } catch (error) {
    console.error(error);
    const message = error.message === 'NOT_YOUTUBE_URL' ? 'الرابط ليس رابط YouTube صالح' : 'فشل جلب بيانات YouTube. راجع المفتاح أو صلاحيات YouTube Data API';
    toast(message, 'error');
  }
}

export async function fetchPdfMetadataFromForm() {
  const form = document.getElementById('entityForm');
  if (!form) return;
  const url = form.elements.url?.value?.trim();
  if (!url) return toast('ضع رابط PDF أولًا أو ارفع ملف من الجهاز', 'error');
  try {
    const title = inferTitleFromUrl(url);
    if (!form.elements.title.value) form.elements.title.value = title;
    if (!form.elements.fileName.value) form.elements.fileName.value = title.endsWith('.pdf') ? title : `${title}.pdf`;
    let pages = 0;
    try {
      toast('جاري محاولة جلب عدد صفحات PDF...');
      const response = await fetch(url);
      if (response.ok) pages = await countPdfPagesFromArrayBuffer(await response.arrayBuffer());
    } catch {}
    if (pages && form.elements.pages) form.elements.pages.value = pages;
    toast(pages ? `تم جلب بيانات PDF: ${pages} صفحة` : 'تم جلب اسم PDF. عدد الصفحات غير متاح لهذا الرابط، اكتبه يدويًا.');
  } catch {
    toast('تعذر جلب بيانات PDF. اكتب البيانات يدويًا أو استخدم ملفًا مرفوعًا.', 'error');
  }
}

function buildInitialVideoContent(youtube = {}) {
  const entries = {};
  const videos = youtube.playlistItems?.length ? youtube.playlistItems : [{ videoId: youtube.videoId || 'general', description: youtube.description || '' }];
  videos.forEach(video => {
    const id = video.videoId || 'general';
    entries[id] = {
      summary: video.description || '',
      notes: '',
      extractedIdeas: [],
      extractedActions: [],
      learningStatus: 'لم أبدأ',
      tags: [],
      reviewAt: '',
      linkedGoalId: '',
      linkedProjectId: '',
      convertedAt: ''
    };
  });
  return entries;
}

export function saveVideoContent(id, quiet = false) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return null;
  const videoId = getActiveVideoId(item);
  const root = document.querySelector(`[data-video-workspace="${CSS.escape(id)}"]`);
  if (!root) return null;
  const existing = getVideoContent(item, videoId);
  const tagsValue = root.querySelector('[data-video-field="tags"]')?.value || '';
  item.videoContent = item.videoContent || {};
  item.videoContent[videoId] = {
    ...existing,
    summary: root.querySelector('[data-video-field="summary"]')?.value?.trim() || '',
    notes: root.querySelector('[data-video-field="notes"]')?.value?.trim() || '',
    extractedIdeas: parseLines(root.querySelector('[data-video-field="extractedIdeas"]')?.value || ''),
    extractedActions: parseLines(root.querySelector('[data-video-field="extractedActions"]')?.value || ''),
    learningStatus: root.querySelector('[data-video-field="learningStatus"]')?.value || existing.learningStatus || 'لم أبدأ',
    tags: tagsValue.split(/[,\n]/).map(x => x.trim()).filter(Boolean),
    linkedGoalId: root.querySelector('[data-video-field="linkedGoalId"]')?.value || '',
    linkedProjectId: root.querySelector('[data-video-field="linkedProjectId"]')?.value || '',
    reviewAt: existing.reviewAt || '',
    convertedAt: existing.convertedAt || '',
    updatedAt: new Date().toISOString()
  };
  autoSave();
  if (!quiet) toast('تم حفظ محتوى هذا الفيديو فقط');
  return item.videoContent[videoId];
}

export function addTimedNote(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const input = document.querySelector(`[data-note-input="${CSS.escape(id)}"]`);
  const text = input?.value?.trim();
  if (!text) return toast('اكتب الملاحظة أولًا');
  const player = getPlayer(id);
  const seconds = Math.floor(player?.getCurrentTime?.() || item.videoProgress?.byVideo?.[item.youtube?.currentVideoId] || 0);
  const videoId = item.youtube?.currentVideoId || item.youtube?.videoId || '';
  item.timedNotes = item.timedNotes || [];
  item.timedNotes.unshift({ id: generateId('note'), videoId, seconds, text, createdAt: new Date().toISOString() });
  input.value = '';
  autoSave();
  toast('تم حفظ الملاحظة على توقيت الفيديو');
  const list = input.closest('.knowledge-section');
  const notesNode = list?.querySelector('.timed-notes, .meta');
  if (notesNode) notesNode.outerHTML = renderTimedNotes(item, videoId);
}

export function seekVideoNote(id, noteId) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const note = item?.timedNotes?.find(n => n.id === noteId);
  if (!item || !note) return;
  if (note.videoId && item.youtube?.currentVideoId !== note.videoId) {
    item.youtube.currentVideoId = note.videoId;
    autoSave();
    import('../router.js').then(({ renderPage }) => {
      renderPage();
      window.setTimeout(() => getPlayer(id)?.seekTo?.(safeNumber(note.seconds), true), 700);
    });
    return;
  }
  getPlayer(id)?.seekTo?.(safeNumber(note.seconds), true);
  getPlayer(id)?.playVideo?.();
}

export function selectKnowledgeVideo(id, videoId) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item?.youtube || !videoId) return;
  savePlayerProgress(id, item.youtube.currentVideoId || item.youtube.videoId || videoId, false, true);
  item.youtube.currentVideoId = videoId;
  item.youtube.videoId = videoId;
  item.youtube.durationSeconds = item.youtube.playlistItems?.find(v => v.videoId === videoId)?.durationSeconds || item.youtube.durationSeconds;
  autoSave();

  const startSeconds = safeNumber(item.videoProgress?.byVideo?.[videoId]);
  const record = youtubePlayers.get(id);
  const player = record?.player || record;
  if (player?.loadVideoById) {
    clearProgressTimer(id);
    record.videoId = videoId;
    try {
      player.loadVideoById({ videoId, startSeconds });
    } catch {
      player.loadVideoById(videoId, startSeconds);
    }
    refreshKnowledgeCardMedia(id);
    return;
  }

  import('../router.js').then(({ renderPage }) => renderPage());
}

export function setKnowledgeFilter(value) {
  setFilter('knowledge', value || 'all');
  import('../router.js').then(({ renderPage }) => renderPage());
}

export function setKnowledgeSearch(value = '') {
  appState.searchQuery = value;
  import('../router.js').then(({ renderPage }) => renderPage());
}

export function searchKnowledgeTag(tag = '') {
  appState.searchQuery = tag;
  import('../router.js').then(({ renderPage }) => renderPage());
}

export function markVideoComplete(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const videoId = getActiveVideoId(item);
  const content = saveVideoContent(id, true) || getVideoContent(item, videoId);
  item.videoContent = item.videoContent || {};
  item.videoContent[videoId] = { ...content, learningStatus: 'انتهيت', reviewAt: content.reviewAt || addDaysISO(7), updatedAt: new Date().toISOString() };
  const video = getActiveVideo(item, videoId);
  item.videoProgress = item.videoProgress || { byVideo: {}, completedVideoIds: [], watchedSeconds: 0, percentage: 0 };
  item.videoProgress.completedVideoIds = item.videoProgress.completedVideoIds || [];
  if (!item.videoProgress.completedVideoIds.includes(videoId)) item.videoProgress.completedVideoIds.push(videoId);
  if (video.durationSeconds) item.videoProgress.byVideo = { ...(item.videoProgress.byVideo || {}), [videoId]: video.durationSeconds };
  autoSave();
  refreshKnowledgeCardMedia(id);
  toast('تم تعليم الفيديو كمكتمل وجدولة مراجعة بعد 7 أيام');
}

export function scheduleVideoReview(id, days = 7) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const videoId = getActiveVideoId(item);
  const content = saveVideoContent(id, true) || getVideoContent(item, videoId);
  item.videoContent = item.videoContent || {};
  item.videoContent[videoId] = { ...content, reviewAt: addDaysISO(days), learningStatus: content.learningStatus === 'لم أبدأ' ? 'أحتاج مراجعة' : content.learningStatus, updatedAt: new Date().toISOString() };
  autoSave();
  refreshKnowledgeCardMedia(id);
  toast('تم جدولة مراجعة هذا الفيديو بعد 7 أيام');
}

export function videoContentToTasks(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const videoId = getActiveVideoId(item);
  const content = saveVideoContent(id, true) || getVideoContent(item, videoId);
  const video = getActiveVideo(item, videoId);
  const actions = content.extractedActions?.length ? content.extractedActions : content.extractedIdeas || [];
  if (!actions.length) return toast('اكتب أفعال أو أفكار مستخرجة أولًا لتحويلها لخطة تنفيذ', 'error');
  const now = new Date().toISOString();
  actions.forEach((action, index) => {
    appState.data.tasks.unshift({
      id: generateId('task'),
      title: action,
      description: `من معرفة: ${item.title}${video.title ? ` — ${video.title}` : ''}\n${content.summary || content.notes || ''}`.trim(),
      goalId: content.linkedGoalId || item.linkedGoalId || '',
      projectId: content.linkedProjectId || item.linkedProjectId || '',
      type: 'إجراء سريع',
      source: 'معرفة',
      priority: index === 0 ? 'عالية' : 'متوسطة',
      status: 'مفتوحة',
      dueDate: '',
      dueTime: '',
      reminder: '',
      repeat: '',
      notes: item.url || '',
      createdAt: now,
      updatedAt: now,
      completedAt: ''
    });
  });
  item.videoContent[videoId] = { ...content, learningStatus: 'تم تحويله لتنفيذ', convertedAt: now, updatedAt: now };
  autoSave();
  import('../router.js').then(({ renderPage }) => renderPage());
  toast(`تم إنشاء ${actions.length} مهمة من هذا الفيديو`);
}

function savePdfWorkspaceContent(id, quiet = false) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const root = document.querySelector(`[data-pdf-workspace="${CSS.escape(id)}"]`);
  if (!item || !root) return null;
  const currentPage = safeNumber(root.querySelector('[data-pdf-field="currentPage"]')?.value);
  const totalPages = safeNumber(root.querySelector('[data-pdf-field="totalPages"]')?.value);
  const previous = getPdfProgress(item);
  item.readingProgress = {
    ...previous,
    currentPage,
    totalPages,
    lastReadAt: new Date().toISOString(),
    completedAt: totalPages && currentPage >= totalPages ? (previous.completedAt || new Date().toISOString()) : previous.completedAt
  };
  item.meta = { ...(item.meta || {}), pages: totalPages ? String(totalPages) : item.meta?.pages || '', currentPage: currentPage ? String(currentPage) : item.meta?.currentPage || '', author: root.querySelector('[data-pdf-field="author"]')?.value || item.meta?.author || '', purpose: root.querySelector('[data-pdf-field="purpose"]')?.value || item.meta?.purpose || '' };
  item.linkedGoalId = root.querySelector('[data-pdf-field="linkedGoalId"]')?.value || item.linkedGoalId || '';
  item.linkedProjectId = root.querySelector('[data-pdf-field="linkedProjectId"]')?.value || item.linkedProjectId || '';
  item.summary = root.querySelector('[data-pdf-field="summary"]')?.value?.trim() || item.summary || '';
  item.notes = root.querySelector('[data-pdf-field="notes"]')?.value?.trim() || item.notes || '';
  item.extractedIdeas = parseLines(root.querySelector('[data-pdf-field="extractedIdeas"]')?.value || '');
  item.extractedActions = parseLines(root.querySelector('[data-pdf-field="extractedActions"]')?.value || '');
  item.updatedAt = new Date().toISOString();
  if (item.readingProgress.completedAt) addKnowledgeWin(item, 'إنهاء كتاب PDF', 'تعلم');
  autoSave();
  if (!quiet) toast('تم حفظ تقدم قراءة PDF');
  return item;
}

function refreshPdfWorkspace(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const root = document.querySelector(`[data-pdf-workspace="${CSS.escape(id)}"]`);
  if (item && root) root.outerHTML = renderPdfWorkspace(item);
}

export function changePdfPage(id, delta = 0) {
  const root = document.querySelector(`[data-pdf-workspace="${CSS.escape(id)}"]`);
  const input = root?.querySelector('[data-pdf-field="currentPage"]');
  const total = safeNumber(root?.querySelector('[data-pdf-field="totalPages"]')?.value);
  if (!input) return;
  input.value = Math.max(0, Math.min(total || 99999, safeNumber(input.value) + safeNumber(delta)));
  savePdfWorkspaceContent(id, true);
  refreshPdfWorkspace(id);
}

export function savePdfReadingProgress(id) {
  savePdfWorkspaceContent(id, false);
  refreshPdfWorkspace(id);
}

export function startPdfReading(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  item.readingProgress = { ...getPdfProgress(item), activeStartedAt: new Date().toISOString(), startedAt: item.readingProgress?.startedAt || new Date().toISOString() };
  autoSave();
  refreshPdfWorkspace(id);
  toast('بدأت جلسة قراءة PDF');
}

export function stopPdfReading(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const progress = getPdfProgress(item);
  const started = progress.activeStartedAt ? new Date(progress.activeStartedAt).getTime() : 0;
  const elapsed = started ? Math.max(0, Math.floor((Date.now() - started) / 1000)) : 0;
  item.readingProgress = { ...progress, activeStartedAt: '', totalSeconds: safeNumber(progress.totalSeconds) + elapsed, lastReadAt: new Date().toISOString() };
  autoSave();
  refreshPdfWorkspace(id);
  toast(`تم إنهاء جلسة القراءة: ${secondsToTime(elapsed)}`);
}

export function markPdfComplete(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  savePdfWorkspaceContent(id, true);
  const progress = getPdfProgress(item);
  item.readingProgress = { ...progress, currentPage: progress.totalPages || progress.currentPage, completedAt: new Date().toISOString(), lastReadAt: new Date().toISOString() };
  item.status = 'تم تلخيصه';
  addKnowledgeWin(item, 'إنهاء كتاب PDF', 'تعلم');
  autoSave();
  refreshPdfWorkspace(id);
  toast('تم تعليم الكتاب كمكتمل وإضافته للإنجازات');
}

export function schedulePdfReview(id, days = 7) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  item.lastReviewAt = addDaysISO(days);
  autoSave();
  toast('تم جدولة مراجعة الكتاب بعد 7 أيام');
}

export function pdfContentToTasks(id) {
  const item = savePdfWorkspaceContent(id, true);
  if (!item) return;
  const actions = item.extractedActions?.length ? item.extractedActions : item.extractedIdeas || [];
  if (!actions.length) return toast('اكتب أفعال أو أفكار من الكتاب أولًا', 'error');
  const now = new Date().toISOString();
  actions.forEach((action, index) => appState.data.tasks.unshift({ id: generateId('task'), title: action, description: `من كتاب: ${item.title}\n${item.summary || item.notes || ''}`.trim(), goalId: item.linkedGoalId || '', projectId: item.linkedProjectId || '', type: 'إجراء سريع', source: 'معرفة', priority: index === 0 ? 'عالية' : 'متوسطة', status: 'مفتوحة', dueDate: '', dueTime: '', reminder: '', repeat: '', notes: item.url || item.fileName || '', createdAt: now, updatedAt: now, completedAt: '' }));
  addKnowledgeWin(item, 'تحويل كتاب إلى أفعال', 'تعلم');
  autoSave();
  import('../router.js').then(({ renderPage }) => renderPage());
  toast(`تم إنشاء ${actions.length} مهمة من الكتاب`);
}

function addKnowledgeWin(item = {}, title = 'إنجاز معرفة', type = 'تعلم') {
  appState.data.wins = appState.data.wins || [];
  const key = `${item.id}-${title}`;
  if (appState.data.wins.some(win => win.sourceKey === key)) return;
  const now = new Date().toISOString();
  appState.data.wins.unshift({ id: generateId('win'), title: `${title}: ${item.title || item.fileName || 'معرفة'}`, description: item.summary || item.notes || 'تقدم في المعرفة', type, size: 'متوسط', date: todayISO(), linkedGoalId: item.linkedGoalId || '', linkedProjectId: item.linkedProjectId || '', linkedKnowledgeId: item.id, sourceKey: key, createdAt: now });
}

function getPrimaryKnowledgeContent(item = {}) {
  if (isVideoKnowledge(item)) return getVideoContent(item);
  return { summary: item.summary || item.meta?.contentText || '', notes: item.notes || '', linkedGoalId: item.linkedGoalId || '', linkedProjectId: item.linkedProjectId || '' };
}

export function knowledgeToTask(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item && document.getElementById('entityForm')) { saveKnowledge({}); return; }
  if (!item) return toast('احفظ المعرفة أولًا');
  const content = getPrimaryKnowledgeContent(item);
  openTaskModal('', { title: `إجراء من: ${item.title}`, description: content.summary || content.notes || item.summary || item.notes, type: 'إجراء سريع', source: 'معرفة', priority: 'متوسطة', status: 'مفتوحة', goalId: content.linkedGoalId || item.linkedGoalId, projectId: content.linkedProjectId || item.linkedProjectId });
}
export function knowledgeToGoal(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); const content = getPrimaryKnowledgeContent(item); upsert('goals', { id: generateId('goal'), title: item.title, description: content.summary || content.notes || item.summary || item.notes, reason: 'تم تحويله من المعرفة', status: 'نشط', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, linkedProjects: [], notes: item.url }); toast('تم تحويل المعرفة إلى هدف'); }
export function knowledgeToProject(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); const content = getPrimaryKnowledgeContent(item); upsert('projects', { id: generateId('project'), title: item.title, description: content.summary || content.notes || item.summary || item.notes, goalId: item.linkedGoalId || '', status: 'قيد التنفيذ', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, notes: item.url }); toast('تم تحويل المعرفة إلى مشروع'); }
export function reviewKnowledge(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (item) { item.lastReviewAt = new Date().toISOString(); upsert('knowledge', item); toast('تم تسجيل مراجعة المعرفة'); } }
export function editKnowledge(id) { openKnowledgeModal(id); }
export function deleteKnowledge(id) { removeItem('knowledge', id); }

function loadYouTubeIframeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT);
  if (youtubeApiPromise) return youtubeApiPromise;
  youtubeApiPromise = new Promise(resolve => {
    const previous = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => { previous?.(); resolve(window.YT); };
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.head.appendChild(tag);
  });
  return youtubeApiPromise;
}


function getPlayer(id) {
  const record = youtubePlayers.get(id);
  return record?.player || record || null;
}

function getPlayerVars(start = 0) {
  const vars = { enablejsapi: 1, playsinline: 1, rel: 0, start: Math.floor(start) };
  const origin = getSafeOrigin();
  if (origin) vars.origin = origin;
  return vars;
}

function initYouTubePlayers() {
  const nodes = Array.from(document.querySelectorAll('.youtube-player'));
  cleanupDetachedPlayers(nodes);
  if (!nodes.length) return;
  loadYouTubeIframeApi().then(YT => {
    nodes.forEach(node => {
      const id = node.dataset.knowledgeId;
      const videoId = node.dataset.videoId;
      if (!id || !videoId) return;
      const existing = youtubePlayers.get(id);
      const existingPlayer = existing?.player || existing;
      const existingFrame = existingPlayer?.getIframe?.();
      const isSameLivePlayer = existing?.videoId === videoId && existingFrame?.isConnected;
      if (isSameLivePlayer) return;
      destroyPlayer(id);

      const item = appState.data.knowledge.find(k => k.id === id);
      const start = safeNumber(item?.videoProgress?.byVideo?.[videoId]);
      const player = new YT.Player(node.id, {
        videoId,
        playerVars: getPlayerVars(start),
        events: {
          onStateChange: event => handlePlayerState(id, event.data, YT.PlayerState),
          onReady: () => updateProgressView(id)
        }
      });
      youtubePlayers.set(id, { player, videoId, nodeId: node.id });
    });
  });
}

function handlePlayerState(id, state, states) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const videoId = item?.youtube?.currentVideoId || item?.youtube?.videoId || youtubePlayers.get(id)?.videoId || '';
  if (!videoId) return;
  if (state === states.PLAYING) startProgressTimer(id, videoId);
  if ([states.PAUSED, states.ENDED, states.BUFFERING].includes(state)) savePlayerProgress(id, videoId, state === states.ENDED);
  if (state === states.ENDED) {
    clearProgressTimer(id);
    const next = getNextPlaylistVideo(item, videoId);
    if (next) selectKnowledgeVideo(id, next.videoId);
  }
}

function startProgressTimer(id, videoId) {
  clearProgressTimer(id);
  progressTimers.set(id, window.setInterval(() => {
    savePlayerProgress(id, videoId, false, true);
    updateProgressView(id);
  }, 3000));
}

function clearProgressTimer(id) {
  window.clearInterval(progressTimers.get(id));
  progressTimers.delete(id);
}

function savePlayerProgress(id, videoId, completed = false, quiet = false) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const record = youtubePlayers.get(id);
  const player = record?.player || record;
  if (!item || !player?.getCurrentTime || !videoId) return;
  const seconds = Math.floor(player.getCurrentTime() || 0);
  const duration = Math.floor(player.getDuration?.() || item.youtube?.durationSeconds || 0);
  item.videoProgress = item.videoProgress || { byVideo: {}, completedVideoIds: [], watchedSeconds: 0, percentage: 0 };
  item.videoProgress.byVideo = item.videoProgress.byVideo || {};
  item.videoProgress.completedVideoIds = item.videoProgress.completedVideoIds || [];
  item.videoProgress.byVideo[videoId] = Math.max(safeNumber(item.videoProgress.byVideo[videoId]), seconds);
  item.videoProgress.watchedSeconds = item.videoProgress.byVideo[videoId];
  item.videoProgress.percentage = duration ? Math.min(100, Math.round((item.videoProgress.byVideo[videoId] / duration) * 100)) : 0;
  if ((completed || item.videoProgress.percentage >= 95) && !item.videoProgress.completedVideoIds.includes(videoId)) item.videoProgress.completedVideoIds.push(videoId);
  if (quiet) autoSave(); else saveData();
}

function updateProgressView(id) {
  const card = document.querySelector(`[data-knowledge-id="${CSS.escape(id)}"]`)?.closest('.item-card');
  const item = appState.data.knowledge.find(k => k.id === id);
  const progressNode = card?.querySelector('.knowledge-progress');
  if (progressNode && item) progressNode.outerHTML = renderVideoProgress(item);
}

function refreshKnowledgeCardMedia(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  const card = document.querySelector(`[data-knowledge-id="${CSS.escape(id)}"]`)?.closest('.item-card');
  if (!item || !card) return;
  updateProgressView(id);
  const badgesNode = card.querySelector('.learning-badges');
  if (badgesNode) badgesNode.outerHTML = renderItemLearningBadges(item, item.youtube.currentVideoId);
  const workspaceNode = card.querySelector('[data-video-workspace]');
  if (workspaceNode) workspaceNode.outerHTML = renderCurrentVideoWorkspace(item, item.youtube.currentVideoId);
  const notesSection = card.querySelector('.timed-note-form')?.closest('.knowledge-section');
  const notesNode = notesSection?.querySelector('.timed-notes, .meta');
  if (notesNode) notesNode.outerHTML = renderTimedNotes(item, item.youtube.currentVideoId);
  card.querySelectorAll('.playlist-item').forEach(button => {
    button.classList.toggle('active', button.dataset.videoId === item.youtube.currentVideoId);
  });
}

function cleanupDetachedPlayers(nodes = []) {
  const liveIds = new Set(nodes.map(node => node.dataset.knowledgeId).filter(Boolean));
  youtubePlayers.forEach((record, id) => {
    const player = record?.player || record;
    const frame = player?.getIframe?.();
    if (!liveIds.has(id) || (frame && !frame.isConnected)) destroyPlayer(id);
  });
}

function destroyPlayer(id) {
  clearProgressTimer(id);
  const record = youtubePlayers.get(id);
  const player = record?.player || record;
  try { player?.destroy?.(); } catch {}
  youtubePlayers.delete(id);
}

function getSafeOrigin() {
  return location.origin && location.origin !== 'null' ? location.origin : window.location.protocol === 'file:' ? '' : location.origin;
}

function getNextPlaylistVideo(item, videoId) {
  const list = item?.youtube?.playlistItems || [];
  const index = list.findIndex(video => video.videoId === videoId);
  return index >= 0 ? list[index + 1] : null;
}
