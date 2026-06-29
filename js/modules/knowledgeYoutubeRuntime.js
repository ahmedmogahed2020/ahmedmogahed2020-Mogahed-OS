export function createYouTubeRuntime({
  appState,
  autoSave,
  saveData,
  safeNumber,
  renderVideoProgress,
  renderItemLearningBadges,
  renderCurrentVideoWorkspace,
  renderTimedNotes,
  selectKnowledgeVideo
}) {
  const youtubePlayers = new Map();
  const progressTimers = new Map();
  let youtubeApiPromise = null;

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


  function loadVideoInPlayer(id, videoId, startSeconds = 0) {
    const record = youtubePlayers.get(id);
    const player = record?.player || record;
    if (!player?.loadVideoById) return false;
    clearProgressTimer(id);
    if (record && typeof record === 'object') record.videoId = videoId;
    try {
      player.loadVideoById({ videoId, startSeconds });
    } catch {
      player.loadVideoById(videoId, startSeconds);
    }
    return true;
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

  return { initYouTubePlayers, getPlayer, savePlayerProgress, clearProgressTimer, refreshKnowledgeCardMedia, destroyPlayer, loadVideoInPlayer };
}
