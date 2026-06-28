export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function sanitizeInput(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
    .trim();
}

export function raw(value = '') { return String(value ?? '').trim(); }
export function safeText(value = '') { return sanitizeInput(value ?? ''); }
export function safeNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}
export function clamp(value, min = 0, max = 100) { return Math.min(max, Math.max(min, safeNumber(value))); }
export function calculatePercentage(part, total) {
  const p = safeNumber(part); const t = safeNumber(total);
  if (!t) return 0;
  return Math.round((p / t) * 100);
}
export function formatCurrency(value) {
  return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', maximumFractionDigits: 0 }).format(safeNumber(value));
}
export function formatDate(value) {
  if (!value) return 'غير محدد';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('ar-EG', { dateStyle: 'medium' }).format(date);
}
export function todayISO() { return new Date().toISOString().slice(0, 10); }
export function addDaysISO(days) {
  const d = new Date(); d.setDate(d.getDate() + Number(days || 0)); return d.toISOString().slice(0, 10);
}
export function isToday(date) { return date === todayISO(); }
export function isPast(date) { return date && date < todayISO(); }
export function debounce(fn, wait = 250) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), wait); };
}
export function byUpdatedDesc(a, b) { return new Date(b.updatedAt || b.createdAt || 0) - new Date(a.updatedAt || a.createdAt || 0); }
export function parseLines(text = '') { return raw(text).split('\n').map(x => raw(x)).filter(Boolean); }
export function linesToText(lines = []) { return Array.isArray(lines) ? lines.join('\n') : raw(lines); }
export function getYouTubeEmbed(url = '') {
  const value = raw(url);
  if (!value) return null;
  const patterns = [
    /youtube\.com\/watch\?v=([^&]+)/,
    /youtu\.be\/([^?&]+)/,
    /youtube\.com\/embed\/([^?&]+)/,
    /youtube\.com\/shorts\/([^?&]+)/
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return `https://www.youtube.com/embed/${match[1]}`;
  }
  const listMatch = value.match(/[?&]list=([^&]+)/);
  if (listMatch?.[1]) return `https://www.youtube.com/embed/videoseries?list=${listMatch[1]}`;
  return null;
}
export function downloadText(filename, text) {
  const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = filename; link.click();
  URL.revokeObjectURL(url);
}
