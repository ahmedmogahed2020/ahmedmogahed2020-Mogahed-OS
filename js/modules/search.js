import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, openModal, toast } from '../ui.js';
import { formatDate, safeNumber, safeText } from '../utils.js';
import { navigate } from '../router.js';
import { viewGoal } from './goals.js';
import { viewProject } from './projects.js';
import { editTask } from './tasks.js';
import { editKnowledge, selectKnowledgeVideo } from './knowledge.js';
import { editDecision } from './decisions.js';
import { editReview } from './reviews.js';
import { editWin } from './wins.js';
import { viewCampaign } from './campaigns.js';

const ENTITY_META = {
  goals: { label: 'الأهداف', route: 'goals', icon: '◎', open: viewGoal },
  projects: { label: 'المشاريع', route: 'projects', icon: '▦', open: viewProject },
  tasks: { label: 'المهام', route: 'tasks', icon: '☑', open: editTask },
  knowledge: { label: 'المعرفة', route: 'knowledge', icon: '◈', open: editKnowledge },
  decisions: { label: 'القرارات', route: 'decisions', icon: '⚖️', open: editDecision },
  reviews: { label: 'المراجعات', route: 'reviews', icon: '📝', open: editReview },
  wins: { label: 'الفوز', route: 'wins', icon: '🏆', open: editWin },
  campaigns: { label: 'الحملات', route: 'campaigns', icon: '📣', open: viewCampaign }
};

const COMMANDS = [
  { id: 'go-home', label: 'افتح الرئيسية', hint: 'مركز القيادة', icon: '⌂', route: 'home' },
  { id: 'go-dashboard', label: 'افتح Dashboard', hint: 'لوحة الأداء الكاملة', icon: '📊', route: 'dashboard' },
  { id: 'go-tasks', label: 'افتح المهام', hint: 'Today / Week / Kanban', icon: '☑', route: 'tasks' },
  { id: 'go-knowledge', label: 'افتح المعرفة', hint: 'فيديوهات وبلاي ليست ومراجعات', icon: '◈', route: 'knowledge' },
  { id: 'go-campaigns', label: 'افتح تحليل الحملات', hint: 'تسعير وربحية وحملات', icon: '📣', route: 'campaigns' },
  { id: 'go-reviews', label: 'افتح المراجعات', hint: 'يومي وأسبوعي', icon: '📝', route: 'reviews' },
  { id: 'go-more', label: 'افتح المزيد', hint: 'إعدادات ونسخ احتياطي وSystem Health', icon: '⋯', route: 'more' },
  { id: 'add-task', label: 'إضافة مهمة جديدة', hint: 'يفتح مودال إضافة مهمة', icon: '+', action: 'open-task-modal' },
  { id: 'add-knowledge', label: 'إضافة معرفة جديدة', hint: 'رابط فيديو أو Playlist أو ملاحظة', icon: '+', action: 'open-knowledge-modal' },
  { id: 'add-campaign', label: 'تحليل حملة جديدة', hint: 'منتج وسعر وميزانية إعلان', icon: '+', action: 'open-campaign-modal' },
  { id: 'open-emergency', label: 'زر الطوارئ', hint: 'خروج سريع من التشتت', icon: '⚡', action: 'open-emergency' },
  { id: 'system-health', label: 'تشغيل System Health', hint: 'افتح فحص النظام', icon: '🧪', route: 'more', action: 'show-qa' }
];

function normalize(value = '') {
  return String(value)
    .toLowerCase()
    .replace(/[إأآا]/g, 'ا')
    .replace(/[ىي]/g, 'ي')
    .replace(/ة/g, 'ه')
    .trim();
}

function joinText(parts = []) {
  return parts.flat(Infinity).filter(value => value !== undefined && value !== null).join(' ');
}

function titleOf(item = {}) {
  return item.title || item.productName || item.finalDecision || item.date || item.type || 'بدون عنوان';
}

function buildSnippet(item = {}, fallback = '') {
  const text = joinText([item.description, item.notes, item.summary, item.reason, item.context, item.finalDecision, item.expectedOutcome, item.productName, fallback]);
  return text.length > 110 ? `${text.slice(0, 110)}...` : text;
}

function findName(collection, id) {
  if (!id) return '';
  const item = appState.data[collection]?.find(entry => entry.id === id);
  return item?.title || item?.productName || '';
}

function getKnowledgeVideos(item) {
  const youtube = item.youtube || {};
  const playlistItems = Array.isArray(youtube.playlistItems) ? youtube.playlistItems : [];
  const videos = playlistItems.length ? playlistItems : youtube.videoId ? [{ videoId: youtube.videoId, title: item.title, durationSeconds: youtube.durationSeconds }] : [];
  return videos.map(video => {
    const id = video.videoId || 'general';
    const content = item.videoContent?.[id] || {};
    return { id, ...video, content };
  });
}

function indexStandardCollection(collection) {
  const meta = ENTITY_META[collection];
  return (appState.data[collection] || []).map(item => {
    const relationText = joinText([
      findName('goals', item.goalId || item.linkedGoalId),
      findName('projects', item.projectId || item.linkedProjectId),
      item.source,
      item.status,
      item.priority,
      item.type
    ]);
    return {
      uid: `${collection}:${item.id}`,
      kind: 'entity',
      collection,
      id: item.id,
      route: meta.route,
      label: meta.label,
      icon: meta.icon,
      title: titleOf(item),
      subtitle: buildSnippet(item, relationText),
      date: item.updatedAt || item.createdAt || item.date || '',
      text: normalize(joinText([JSON.stringify(item), relationText]))
    };
  });
}

function indexKnowledge() {
  const items = [];
  for (const item of appState.data.knowledge || []) {
    items.push({
      uid: `knowledge:${item.id}`,
      kind: 'entity',
      collection: 'knowledge',
      id: item.id,
      route: 'knowledge',
      label: 'المعرفة',
      icon: '◈',
      title: titleOf(item),
      subtitle: buildSnippet(item),
      date: item.updatedAt || item.createdAt || '',
      text: normalize(JSON.stringify(item))
    });

    for (const video of getKnowledgeVideos(item)) {
      const content = video.content || {};
      const progress = safeNumber(item.videoProgress?.byVideo?.[video.id]);
      const duration = safeNumber(video.durationSeconds);
      const percent = duration ? Math.min(100, Math.round((progress / duration) * 100)) : 0;
      items.push({
        uid: `knowledge-video:${item.id}:${video.id}`,
        kind: 'knowledge-video',
        collection: 'knowledge',
        id: item.id,
        videoId: video.id,
        route: 'knowledge',
        label: 'فيديو معرفة',
        icon: '▶',
        title: video.title || item.title || 'فيديو',
        subtitle: joinText([item.title, content.learningStatus, content.tags?.join('، '), duration ? `تقدم ${percent}%` : '']).slice(0, 130),
        date: content.updatedAt || item.updatedAt || item.createdAt || '',
        text: normalize(joinText([item.title, video.title, video.channelTitle, content.learningStatus, content.summary, content.notes, content.tags, content.extractedIdeas, content.extractedActions]))
      });
    }
  }
  return items;
}

function buildIndex() {
  return [
    ...indexStandardCollection('goals'),
    ...indexStandardCollection('projects'),
    ...indexStandardCollection('tasks'),
    ...indexKnowledge(),
    ...indexStandardCollection('decisions'),
    ...indexStandardCollection('reviews'),
    ...indexStandardCollection('wins'),
    ...indexStandardCollection('campaigns')
  ];
}

function scoreResult(result, q) {
  const title = normalize(result.title);
  const subtitle = normalize(result.subtitle);
  if (!q) return 1;
  let score = 0;
  if (title === q) score += 100;
  if (title.startsWith(q)) score += 55;
  if (title.includes(q)) score += 35;
  if (subtitle.includes(q)) score += 18;
  if (result.text.includes(q)) score += 10;
  q.split(/\s+/).filter(Boolean).forEach(part => {
    if (title.includes(part)) score += 12;
    if (result.text.includes(part)) score += 3;
  });
  if (result.date) score += 1;
  return score;
}

function searchIndex(query) {
  const q = normalize(query);
  if (!q) return [];
  return buildIndex()
    .map(result => ({ ...result, score: scoreResult(result, q) }))
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || String(b.date).localeCompare(String(a.date)))
    .slice(0, 40);
}

function searchCommands(query) {
  const q = normalize(query);
  const commands = COMMANDS.map(command => ({ ...command, text: normalize(joinText([command.label, command.hint, command.route, command.id])) }));
  if (!q) return commands.slice(0, 7);
  return commands.filter(command => command.text.includes(q) || q.split(/\s+/).some(part => command.text.includes(part))).slice(0, 8);
}

function groupBy(results, key) {
  return results.reduce((acc, item) => {
    const value = item[key] || 'other';
    acc[value] = acc[value] || [];
    acc[value].push(item);
    return acc;
  }, {});
}

function getRecentItems() {
  const recent = appState.data.settings.recentItems;
  return Array.isArray(recent) ? recent.slice(0, 8) : [];
}

function rememberRecent(result) {
  if (!result?.uid) return;
  const recent = getRecentItems().filter(item => item.uid !== result.uid);
  recent.unshift({
    uid: result.uid,
    kind: result.kind,
    collection: result.collection,
    id: result.id,
    videoId: result.videoId || '',
    route: result.route,
    title: result.title,
    label: result.label,
    icon: result.icon,
    openedAt: new Date().toISOString()
  });
  appState.data.settings.recentItems = recent.slice(0, 10);
  autoSave();
}

function renderCommand(command) {
  return `<button class="command-item" data-action="search-command" data-command-id="${safeText(command.id)}">
    <span class="command-icon">${safeText(command.icon)}</span>
    <span><b>${safeText(command.label)}</b><small>${safeText(command.hint)}</small></span>
  </button>`;
}

function renderResult(result) {
  return `<button class="search-result pro" data-action="search-open-result" data-uid="${safeText(result.uid)}">
    <span class="command-icon">${safeText(result.icon)}</span>
    <span class="search-result-body">
      <small>${safeText(result.label)}${result.date ? ` • ${safeText(formatDate(result.date))}` : ''}</small>
      <b>${safeText(result.title)}</b>
      <span class="meta">${safeText(result.subtitle || 'اضغط للفتح مباشرة')}</span>
    </span>
  </button>`;
}

function renderRecent() {
  const recent = getRecentItems();
  if (!recent.length) return '<p class="meta">لا توجد عناصر مفتوحة مؤخرًا بعد.</p>';
  return `<div class="grid">${recent.map(item => `<button class="search-result pro" data-action="search-open-recent" data-uid="${safeText(item.uid)}">
    <span class="command-icon">${safeText(item.icon || '↗')}</span>
    <span class="search-result-body"><small>${safeText(item.label || 'عنصر')} • ${safeText(formatDate(item.openedAt))}</small><b>${safeText(item.title)}</b><span class="meta">فتح سريع</span></span>
  </button>`).join('')}</div><div class="btn-row" style="margin-top:10px"><button class="btn ghost" data-action="search-clear-recent">مسح آخر العناصر</button></div>`;
}

function renderResults(query = '') {
  const root = document.getElementById('globalSearchResults');
  if (!root) return;
  const commands = searchCommands(query);
  const results = searchIndex(query);

  if (!normalize(query)) {
    root.innerHTML = `<div class="command-grid">
      <article class="card command-section"><h3>اختصارات سريعة</h3>${commands.map(renderCommand).join('')}</article>
      <article class="card command-section"><h3>آخر ما تم فتحه</h3>${renderRecent()}</article>
    </div>`;
    return;
  }

  const grouped = groupBy(results, 'collection');
  const resultHtml = Object.entries(grouped).map(([collection, items]) => {
    const meta = ENTITY_META[collection] || { label: collection };
    return `<article class="card command-section"><h3>${safeText(meta.label)} <span class="badge">${items.length}</span></h3>${items.slice(0, 8).map(renderResult).join('')}</article>`;
  }).join('');

  root.innerHTML = `<div class="command-grid">
    ${commands.length ? `<article class="card command-section"><h3>أوامر</h3>${commands.map(renderCommand).join('')}</article>` : ''}
    ${resultHtml || '<div class="empty-state"><strong>لا توجد نتائج</strong><p>جرّب كلمة أخرى أو افتح القسم المطلوب من الاختصارات.</p></div>'}
  </div>`;
}

export function openSearchModal() {
  openModal({
    title: 'بحث وتنقل ذكي',
    size: 'wide',
    body: `<div class="command-palette">
      <div class="command-search-row">
        <span>⌕</span>
        <input id="globalSearchInput" placeholder="ابحث عن هدف، مشروع، مهمة، فيديو، حملة... أو اكتب اسم صفحة" autofocus autocomplete="off">
      </div>
      <div class="command-help">اختصار: Ctrl + K أو / لفتح البحث. النتائج تفتح العنصر مباشرة وليست مجرد انتقال للقسم.</div>
      <div id="globalSearchResults" style="margin-top:12px"></div>
    </div>`
  });
  const input = document.getElementById('globalSearchInput');
  input?.addEventListener('input', () => renderResults(input.value));
  input?.addEventListener('keydown', event => {
    if (event.key !== 'Enter') return;
    const first = document.querySelector('#globalSearchResults [data-action="search-open-result"], #globalSearchResults [data-action="search-command"], #globalSearchResults [data-action="search-open-recent"]');
    first?.click();
  });
  renderResults('');
  setTimeout(() => input?.focus(), 50);
}

function findResultByUid(uid) {
  return buildIndex().find(result => result.uid === uid) || getRecentItems().find(result => result.uid === uid);
}

export function openSearchResult(uid) {
  const result = typeof uid === 'object' ? uid : findResultByUid(uid);
  if (!result) { toast('لم أجد العنصر. ربما تم حذفه.', 'error'); return; }
  rememberRecent(result);
  closeModal();
  navigate(result.route || 'home');
  setTimeout(() => {
    if (result.kind === 'knowledge-video') {
      selectKnowledgeVideo(result.id, result.videoId);
      return;
    }
    const opener = ENTITY_META[result.collection]?.open;
    opener?.(result.id);
  }, 80);
}

export function openRecentItem(uid) { openSearchResult(uid); }

export function clearRecentItems() {
  appState.data.settings.recentItems = [];
  autoSave();
  renderResults(document.getElementById('globalSearchInput')?.value || '');
  toast('تم مسح آخر العناصر المفتوحة');
}

export function runSearchCommand(commandId) {
  const command = COMMANDS.find(item => item.id === commandId);
  if (!command) return;
  const record = { uid: `command:${command.id}`, kind: 'command', id: command.id, route: command.route || 'home', title: command.label, label: 'أمر سريع', icon: command.icon };
  rememberRecent(record);
  closeModal();
  if (command.route) navigate(command.route);
  if (command.action) {
    setTimeout(() => document.querySelector(`[data-action="${command.action}"]`)?.click(), command.route ? 120 : 20);
  }
}

export function jumpTo(route) { navigate(route); }
