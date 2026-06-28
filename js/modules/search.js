import { appState } from '../state.js';
import { openModal } from '../ui.js';
import { safeText } from '../utils.js';
import { navigate } from '../router.js';

const sections = [
  ['goals','الأهداف','goals'], ['projects','المشاريع','projects'], ['tasks','المهام','tasks'], ['knowledge','المعرفة','knowledge'], ['decisions','القرارات','decisions'], ['reviews','المراجعات','reviews'], ['wins','الفوز','wins'], ['campaigns','الحملات','campaigns']
];

export function openSearchModal() {
  openModal({ title: 'البحث العام', body: `<input id="globalSearchInput" placeholder="ابحث في كل النظام..." autofocus><div id="globalSearchResults" class="grid" style="margin-top:12px"></div>` });
  const input = document.getElementById('globalSearchInput');
  input.addEventListener('input', () => renderResults(input.value));
  renderResults('');
}

function renderResults(query) {
  const root = document.getElementById('globalSearchResults');
  const q = query.trim().toLowerCase();
  if (!q) { root.innerHTML = '<p class="meta">اكتب كلمة للبحث داخل الأهداف والمشاريع والمهام والمعرفة والحملات.</p>'; return; }
  const groups = sections.map(([key,label,route]) => {
    const hits = appState.data[key].filter(item => JSON.stringify(item).toLowerCase().includes(q)).slice(0, 8);
    if (!hits.length) return '';
    return `<article class="card"><h3>${label}</h3><div class="grid" style="margin-top:10px">${hits.map(item => `<button class="search-result" data-action="search-jump" data-route-target="${route}"><small>${label}</small><b>${safeText(item.title || item.productName || item.date || 'نتيجة')}</b><span class="meta">اضغط للذهاب للقسم</span></button>`).join('')}</div></article>`;
  }).join('');
  root.innerHTML = groups || '<div class="empty-state"><strong>لا توجد نتائج</strong><p>جرّب كلمة أخرى أو تأكد من حفظ العنصر أولًا.</p></div>';
}

export function jumpTo(route) { navigate(route); }
