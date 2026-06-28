import { appState, setFilter } from '../state.js';
import { autoSave, saveData } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, toast } from '../ui.js';
import { addDaysISO, formatDate, generateId, linesToText, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';
import { openTaskModal } from './tasks.js';
import { buildEmbedUrl, fetchYouTubeMetadata, parseYouTubeUrl, secondsToTime } from './youtube.js';

const types = ['فيديو','Playlist','بودكاست','كتاب PDF','مقال','رابط','ملاحظة','فكرة'];
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
  window.setTimeout(initYouTubePlayers, 0);
  return `<section class="page">${pageHeader('المعرفة', 'نظام تعلم عملي: شاهد، لخّص، استخرج أفعال، راجع، وحوّل المعرفة لتنفيذ.', actions)}
    ${renderKnowledgeLearningSummary()}
    ${renderKnowledgeFilters()}
    <div class="grid grid-2">${filtered.length ? filtered.map(knowledgeCard).join('') : emptyState('لا توجد نتائج مطابقة', 'غيّر الفلتر أو البحث، أو أضف معرفة جديدة من YouTube أو رابط خارجي.', actions)}</div>
  </section>`;
 }

function getVideoEntries(item) {
  const youtube = item.youtube || {};
  const videos = youtube.playlistItems?.length ? youtube.playlistItems : [{ videoId: youtube.videoId || 'general', title: item.title, durationSeconds: youtube.durationSeconds || 0 }];
  return videos.map(video => {
    const id = video.videoId || 'general';
    return { ...video, content: getVideoContent(item, id), id };
  });
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

function knowledgeCard(item) {
  const youtube = item.youtube || {};
  const parsed = parseYouTubeUrl(item.url || '');
  const activeVideoId = youtube.currentVideoId || youtube.videoId || parsed.videoId || youtube.playlistItems?.[0]?.videoId || '';
  const isYouTube = Boolean(activeVideoId || youtube.playlistId || parsed.playlistId);
  const preview = isYouTube && activeVideoId
    ? `<div class="video-shell">
        <div id="yt-player-${safeText(item.id)}" class="youtube-player" data-knowledge-id="${safeText(item.id)}" data-video-id="${safeText(activeVideoId)}"></div>
      </div>`
    : item.url ? `<a class="btn dark" target="_blank" rel="noopener" href="${safeText(item.url)}">فتح الرابط خارجيًا</a>` : '';

  const progress = renderVideoProgress(item);
  const playlist = renderPlaylist(item, activeVideoId);
  const videoWorkspace = renderCurrentVideoWorkspace(item, activeVideoId);
  const timedNotes = renderTimedNotes(item, activeVideoId);
  const extra = `<button class="btn primary" data-action="knowledge-to-task" data-id="${safeText(item.id)}">تحويل لمهمة</button><button class="btn ghost" data-action="review-knowledge" data-id="${safeText(item.id)}">مراجعة</button>`;

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

export function openKnowledgeModal(id = '') {
  const item = appState.data.knowledge.find(x => x.id === id) || {};
  const apiKeyHint = appState.data.settings.youtubeApiKey ? 'مفتاح YouTube API محفوظ' : 'ضع المفتاح من المزيد ← الإعدادات لتفعيل جلب البيانات';
  openModal({ title: item.id ? 'تعديل معرفة' : 'إضافة معرفة', saveText: 'حفظ', body: `<form id="entityForm" class="form-grid">
    <input type="hidden" name="id" value="${safeText(item.id || '')}">
    <label>العنوان<input name="title" required value="${safeText(item.title || '')}" placeholder="سيتم ملؤه تلقائيًا من YouTube عند الجلب"></label>
    <label>النوع<select name="type">${types.map(v=>`<option ${v===item.type?'selected':''}>${v}</option>`).join('')}</select></label>
    <label class="full">الرابط<div class="input-action"><input name="url" value="${safeText(item.url || '')}" placeholder="YouTube Video / Playlist / مقال / رابط خارجي"><button type="button" class="btn dark" data-action="fetch-knowledge-metadata">جلب البيانات</button></div><small class="field-hint">${safeText(apiKeyHint)}</small></label>
    <label>اسم الملف / القناة<input name="fileName" value="${safeText(item.fileName || '')}" placeholder="اختياري"></label>
    <label>التصنيف<input name="category" value="${safeText(item.category || '')}" placeholder="إنتاجية / تجارة / دين / تعلم"></label>
    <label>الحالة<select name="status">${statuses.map(v=>`<option ${v===item.status?'selected':''}>${v}</option>`).join('')}</select></label>
    ${linkedFields({ goalId: item.linkedGoalId, projectId: item.linkedProjectId })}
    <div class="full form-note">بعد حفظ الرابط، ستكتب الملخص والملاحظات والأفكار والأفعال داخل كل فيديو نفسه من كارت المشاهدة.</div>
  </form>
  <div class="btn-row">
    <button class="btn ghost" data-action="knowledge-to-goal" data-id="${safeText(item.id || '')}">تحويل لهدف</button>
    <button class="btn ghost" data-action="knowledge-to-project" data-id="${safeText(item.id || '')}">تحويل لمشروع</button>
    <button class="btn ghost" data-action="knowledge-to-task" data-id="${safeText(item.id || '')}">تحويل لإجراء</button>
  </div>`, onSave: () => saveKnowledge(item) });
}

function buildKnowledgePayload(existing = {}, data) {
  const keepMedia = data.url === existing.url;
  return {
    id: data.id || generateId('know'),
    title: data.title,
    type: data.type,
    url: data.url,
    fileName: data.fileName,
    category: data.category,
    status: data.status,
    summary: existing.summary || '',
    notes: existing.notes || '',
    extractedIdeas: existing.extractedIdeas || [],
    extractedActions: existing.extractedActions || [],
    linkedGoalId: data.goalId,
    linkedProjectId: data.projectId,
    lastReviewAt: existing.lastReviewAt || null,
    youtube: keepMedia ? existing.youtube : undefined,
    videoProgress: keepMedia ? existing.videoProgress : undefined,
    timedNotes: keepMedia ? existing.timedNotes : [],
    videoContent: keepMedia ? existing.videoContent : {}
  };
}

function saveKnowledge(existing = {}) {
  const form = document.getElementById('entityForm'); if (!form.reportValidity()) return;
  const data = objectFromForm(form);
  upsert('knowledge', buildKnowledgePayload(existing, data));
  closeModal(); toast('تم حفظ المعرفة');
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

export function knowledgeToTask(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item && document.getElementById('entityForm')) { saveKnowledge({}); return; }
  if (!item) return toast('احفظ المعرفة أولًا');
  const content = getVideoContent(item);
  openTaskModal('', { title: `إجراء من: ${item.title}`, description: content.summary || content.notes || item.summary || item.notes, type: 'إجراء سريع', priority: 'متوسطة', status: 'مفتوحة', goalId: content.linkedGoalId || item.linkedGoalId, projectId: content.linkedProjectId || item.linkedProjectId });
}
export function knowledgeToGoal(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); const content = getVideoContent(item); upsert('goals', { id: generateId('goal'), title: item.title, description: content.summary || content.notes || item.summary || item.notes, reason: 'تم تحويله من المعرفة', status: 'نشط', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, linkedProjects: [], notes: item.url }); toast('تم تحويل المعرفة إلى هدف'); }
export function knowledgeToProject(id) { const item = appState.data.knowledge.find(k=>k.id===id); if (!item) return toast('احفظ المعرفة أولًا'); const content = getVideoContent(item); upsert('projects', { id: generateId('project'), title: item.title, description: content.summary || content.notes || item.summary || item.notes, goalId: item.linkedGoalId || '', status: 'قيد التنفيذ', priority: 'متوسطة', startDate: todayISO(), targetDate: '', progress: 0, notes: item.url }); toast('تم تحويل المعرفة إلى مشروع'); }
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
