import { appState } from '../state.js';
import { autoSave, saveData } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, toast } from '../ui.js';
import { generateId, linesToText, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { linkedFields, removeItem, simpleCard, upsert } from './shared.js';
import { openTaskModal } from './tasks.js';
import { buildEmbedUrl, fetchYouTubeMetadata, parseYouTubeUrl, secondsToTime } from './youtube.js';

const types = ['فيديو','Playlist','بودكاست','كتاب PDF','مقال','رابط','ملاحظة','فكرة'];
const statuses = ['جديد','قيد المراجعة','تم تلخيصه','تحول لأفعال','مؤرشف'];
const youtubePlayers = new Map();
const progressTimers = new Map();
let youtubeApiPromise = null;

export function renderKnowledge() {
  const actions = '<button class="btn primary" data-action="open-knowledge-modal">إضافة معرفة</button>';
  window.setTimeout(initYouTubePlayers, 0);
  return `<section class="page">${pageHeader('المعرفة', 'اجمع الفيديوهات والبلاي ليست والكتب، وتابع تقدمك وملاحظاتك المرتبطة بالوقت.', actions)}
    <div class="grid grid-2">${appState.data.knowledge.length ? appState.data.knowledge.map(knowledgeCard).join('') : emptyState('صفحة المعرفة جاهزة وليست فارغة', 'أضف رابط فيديو أو Playlist ثم اضغط جلب البيانات ليتم ملء التفاصيل تلقائيًا.', actions)}</div>
  </section>`;
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
    extractedActions: current.extractedActions || []
  };
}

function renderCurrentVideoWorkspace(item, activeVideoId = '') {
  const videoId = activeVideoId || getActiveVideoId(item);
  const video = getActiveVideo(item, videoId);
  const content = getVideoContent(item, videoId);
  return `<div class="knowledge-section video-workspace" data-video-workspace="${safeText(item.id)}">
    <div class="workspace-head">
      <div><h4>محتوى هذا الفيديو</h4><p>${safeText(video.title || item.title || 'الفيديو الحالي')}</p></div>
      <button class="btn primary" data-action="save-video-content" data-id="${safeText(item.id)}">حفظ محتوى الفيديو</button>
    </div>
    <label>الملخص<textarea data-video-field="summary" data-video-id="${safeText(videoId)}" placeholder="اكتب ملخص هذا الفيديو فقط">${safeText(content.summary)}</textarea></label>
    <label>الملاحظات العامة<textarea data-video-field="notes" data-video-id="${safeText(videoId)}" placeholder="ملاحظات عامة على هذا الفيديو فقط">${safeText(content.notes)}</textarea></label>
    <label>أفكار مستخرجة — كل فكرة في سطر<textarea data-video-field="extractedIdeas" data-video-id="${safeText(videoId)}" placeholder="فكرة 1\nفكرة 2">${safeText(linesToText(content.extractedIdeas))}</textarea></label>
    <label>أفعال مستخرجة — كل فعل في سطر<textarea data-video-field="extractedActions" data-video-id="${safeText(videoId)}" placeholder="فعل 1\nفعل 2">${safeText(linesToText(content.extractedActions))}</textarea></label>
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
      extractedActions: []
    };
  });
  return entries;
}

export function saveVideoContent(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item) return;
  const videoId = getActiveVideoId(item);
  const root = document.querySelector(`[data-video-workspace="${CSS.escape(id)}"]`);
  if (!root) return;
  item.videoContent = item.videoContent || {};
  item.videoContent[videoId] = {
    summary: root.querySelector('[data-video-field="summary"]')?.value?.trim() || '',
    notes: root.querySelector('[data-video-field="notes"]')?.value?.trim() || '',
    extractedIdeas: parseLines(root.querySelector('[data-video-field="extractedIdeas"]')?.value || ''),
    extractedActions: parseLines(root.querySelector('[data-video-field="extractedActions"]')?.value || ''),
    updatedAt: new Date().toISOString()
  };
  autoSave();
  toast('تم حفظ محتوى هذا الفيديو فقط');
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

export function knowledgeToTask(id) {
  const item = appState.data.knowledge.find(k => k.id === id);
  if (!item && document.getElementById('entityForm')) { saveKnowledge({}); return; }
  if (!item) return toast('احفظ المعرفة أولًا');
  const content = getVideoContent(item);
  openTaskModal('', { title: `إجراء من: ${item.title}`, description: content.summary || content.notes || item.summary || item.notes, type: 'إجراء سريع', priority: 'متوسطة', status: 'مفتوحة', goalId: item.linkedGoalId, projectId: item.linkedProjectId });
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
