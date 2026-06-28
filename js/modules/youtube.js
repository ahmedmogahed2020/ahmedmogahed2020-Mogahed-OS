import { raw, safeNumber } from '../utils.js';

const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export function parseYouTubeUrl(url = '') {
  const value = raw(url);
  if (!value) return { videoId: '', playlistId: '', kind: '' };
  try {
    const normalized = value.startsWith('http') ? value : `https://${value}`;
    const parsed = new URL(normalized);
    const host = parsed.hostname.replace('www.', '');
    const playlistId = parsed.searchParams.get('list') || '';
    let videoId = '';
    if (host === 'youtu.be') videoId = parsed.pathname.split('/').filter(Boolean)[0] || '';
    if (host.includes('youtube.com')) {
      if (parsed.pathname === '/watch') videoId = parsed.searchParams.get('v') || '';
      if (parsed.pathname.startsWith('/embed/')) videoId = parsed.pathname.split('/')[2] || '';
      if (parsed.pathname.startsWith('/shorts/')) videoId = parsed.pathname.split('/')[2] || '';
      if (parsed.pathname.startsWith('/playlist')) videoId = '';
    }
    return { videoId, playlistId, kind: playlistId ? 'playlist' : videoId ? 'video' : '' };
  } catch {
    const videoMatch = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([a-zA-Z0-9_-]{6,})/);
    const listMatch = value.match(/[?&]list=([a-zA-Z0-9_-]+)/);
    return { videoId: videoMatch?.[1] || '', playlistId: listMatch?.[1] || '', kind: listMatch?.[1] ? 'playlist' : videoMatch?.[1] ? 'video' : '' };
  }
}

export function secondsToTime(total = 0) {
  const value = Math.max(0, Math.floor(safeNumber(total)));
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = value % 60;
  if (h) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
}

export function isoDurationToSeconds(duration = 'PT0S') {
  const match = String(duration).match(/P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const [, days, hours, minutes, seconds] = match.map(x => Number(x || 0));
  return days * 86400 + hours * 3600 + minutes * 60 + seconds;
}

function chunk(array, size = 50) {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) chunks.push(array.slice(i, i + size));
  return chunks;
}

async function youtubeFetch(path, params, apiKey) {
  if (!apiKey) throw new Error('NO_YOUTUBE_API_KEY');
  const url = new URL(`${YOUTUBE_API_BASE}/${path}`);
  Object.entries({ ...params, key: apiKey }).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });
  const response = await fetch(url.toString());
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload?.error?.message || 'YOUTUBE_API_FAILED');
  return payload;
}

async function fetchVideoDetails(videoIds, apiKey) {
  const ids = [...new Set(videoIds.filter(Boolean))];
  if (!ids.length) return [];
  const results = [];
  for (const part of chunk(ids, 50)) {
    const payload = await youtubeFetch('videos', {
      part: 'snippet,contentDetails,statistics',
      id: part.join(','),
      maxResults: 50
    }, apiKey);
    results.push(...(payload.items || []));
  }
  return results.map(item => ({
    videoId: item.id,
    title: item.snippet?.title || 'فيديو بدون عنوان',
    description: item.snippet?.description || '',
    channelTitle: item.snippet?.channelTitle || '',
    publishedAt: item.snippet?.publishedAt || '',
    thumbnail: item.snippet?.thumbnails?.maxres?.url || item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
    durationSeconds: isoDurationToSeconds(item.contentDetails?.duration),
    viewCount: Number(item.statistics?.viewCount || 0)
  }));
}

async function fetchPlaylistItems(playlistId, apiKey) {
  const items = [];
  let pageToken = '';
  do {
    const payload = await youtubeFetch('playlistItems', {
      part: 'snippet,contentDetails',
      playlistId,
      maxResults: 50,
      pageToken
    }, apiKey);
    items.push(...(payload.items || []));
    pageToken = payload.nextPageToken || '';
  } while (pageToken);
  const mapped = items
    .map(item => ({
      videoId: item.contentDetails?.videoId || item.snippet?.resourceId?.videoId || '',
      title: item.snippet?.title || 'فيديو بدون عنوان',
      description: item.snippet?.description || '',
      channelTitle: item.snippet?.videoOwnerChannelTitle || item.snippet?.channelTitle || '',
      thumbnail: item.snippet?.thumbnails?.high?.url || item.snippet?.thumbnails?.medium?.url || '',
      position: Number(item.snippet?.position || 0)
    }))
    .filter(item => item.videoId && item.title !== 'Deleted video' && item.title !== 'Private video');
  const details = await fetchVideoDetails(mapped.map(item => item.videoId), apiKey);
  const detailsById = new Map(details.map(item => [item.videoId, item]));
  return mapped.map(item => ({ ...item, ...(detailsById.get(item.videoId) || {}) }));
}

export async function fetchYouTubeMetadata(url, apiKey) {
  const parsed = parseYouTubeUrl(url);
  if (!parsed.videoId && !parsed.playlistId) throw new Error('NOT_YOUTUBE_URL');

  if (parsed.playlistId) {
    const [playlistPayload, playlistItems] = await Promise.all([
      youtubeFetch('playlists', { part: 'snippet,contentDetails', id: parsed.playlistId, maxResults: 1 }, apiKey),
      fetchPlaylistItems(parsed.playlistId, apiKey)
    ]);
    const playlist = playlistPayload.items?.[0];
    if (!playlist) throw new Error('PLAYLIST_NOT_FOUND');
    const selectedVideo = parsed.videoId || playlistItems[0]?.videoId || '';
    const selected = playlistItems.find(item => item.videoId === selectedVideo) || playlistItems[0] || {};
    const totalDurationSeconds = playlistItems.reduce((sum, item) => sum + safeNumber(item.durationSeconds), 0);
    return {
      type: 'Playlist',
      title: playlist.snippet?.title || selected.title || 'Playlist',
      summary: playlist.snippet?.description || selected.description || '',
      fileName: playlist.snippet?.channelTitle || selected.channelTitle || '',
      category: 'YouTube',
      youtube: {
        kind: 'playlist',
        videoId: selectedVideo,
        currentVideoId: selectedVideo,
        playlistId: parsed.playlistId,
        channelTitle: playlist.snippet?.channelTitle || selected.channelTitle || '',
        thumbnail: playlist.snippet?.thumbnails?.maxres?.url || playlist.snippet?.thumbnails?.high?.url || selected.thumbnail || '',
        description: playlist.snippet?.description || '',
        durationSeconds: selected.durationSeconds || 0,
        totalDurationSeconds,
        itemCount: playlistItems.length,
        playlistItems
      }
    };
  }

  const details = await fetchVideoDetails([parsed.videoId], apiKey);
  const video = details[0];
  if (!video) throw new Error('VIDEO_NOT_FOUND');
  return {
    type: 'فيديو',
    title: video.title,
    summary: video.description,
    fileName: video.channelTitle,
    category: 'YouTube',
    youtube: {
      kind: 'video',
      videoId: video.videoId,
      currentVideoId: video.videoId,
      playlistId: '',
      channelTitle: video.channelTitle,
      thumbnail: video.thumbnail,
      description: video.description,
      durationSeconds: video.durationSeconds,
      totalDurationSeconds: video.durationSeconds,
      itemCount: 1,
      playlistItems: [video]
    }
  };
}

export function buildEmbedUrl(videoId, startSeconds = 0) {
  if (!videoId) return '';
  const params = new URLSearchParams({ enablejsapi: '1', playsinline: '1', rel: '0' });
  if (startSeconds > 0) params.set('start', String(Math.floor(startSeconds)));
  if (location.origin && location.origin !== 'null') params.set('origin', location.origin);
  return `https://www.youtube.com/embed/${videoId}?${params.toString()}`;
}
