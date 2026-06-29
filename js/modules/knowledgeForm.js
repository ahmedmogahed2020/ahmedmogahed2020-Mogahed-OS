export function collectKnowledgeMeta(data = {}) {
  const metaKeys = ['author','source','sourceType','durationMinutes','episode','pages','currentPage','readingTime','imageCount','contentText','keyQuestion','purpose'];
  return Object.fromEntries(metaKeys.map(key => [key, data[key] || '']).filter(([, value]) => String(value || '').trim() !== ''));
}

export function isYouTubeKnowledgeType(type = '') {
  return type === 'فيديو' || type === 'Playlist';
}

export function buildKnowledgePayload(existing = {}, data, { generateId }) {
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
