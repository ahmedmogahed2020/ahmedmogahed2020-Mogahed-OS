import { appState } from '../state.js';
import { closeModal, openModal, toast } from '../ui.js';
import { generateId, safeText } from '../utils.js';
import { saveData } from '../storage.js';
import { openTaskModal } from './tasks.js';

const actions = {
  'مشتت': ['اقفل كل التطبيقات لمدة 10 دقائق واكتب المهمة الوحيدة الآن.', 'اعمل مؤقت 5 دقائق ورتّب المكتب فقط.', 'اكتب: ما الشيء الواحد الذي لو عملته سأرتاح؟'],
  'قلقان': ['خذ نفسًا عميقًا 4 مرات ثم اكتب أسوأ احتمال وخطوة أمان واحدة.', 'اشرب ماء وامشِ دقيقتين ثم ارجع لمهمة صغيرة.', 'فرّغ القلق في 5 سطور بدون حكم.'],
  'مكسل': ['ابدأ بدقيقتين فقط. افتح المهمة ولا تنفذها كاملة.', 'اعمل أسهل خطوة جسدية: قوم، اغسل وجهك، افتح المكان.', 'نفذ مهمة 120 ثانية بدون تفاوض.'],
  'ماسك الموبايل كتير': ['ضع الموبايل بعيدًا واشحنه خارج الغرفة 25 دقيقة.', 'احذف آخر تطبيق فتحته من الشاشة الرئيسية اليوم.', 'افتح مهمة ورقية أو صفحة واحدة بدل السكرول.'],
  'مش عارف أبدأ': ['اكتب 3 خطوات صغيرة واختر أسهل واحدة فقط.', 'ابدأ بفعل لا يحتاج تفكير: فتح الملف أو تجهيز الأدوات.', 'اسأل نفسك: ما أول 30 ثانية؟ وافعلها.'],
  'محتاج أرجع للشغل': ['اضبط مؤقت 25 دقيقة وحدد نتيجة واحدة قبل البدء.', 'راجع آخر مهمة مفتوحة وأغلق كل شيء غيرها.', 'ابدأ برسالة/مكالمة/خطوة واحدة تعيدك للمسار.']
};
let lastAction = '';

export function openEmergencyModal() {
  openModal({ title: 'زر الطوارئ', body: `<p class="meta">اختار حالتك الحالية، والنظام يعطيك إجراء مختلف قابل للتحويل لمهمة.</p><div class="emergency-options">${Object.keys(actions).map(k=>`<button data-action="emergency-pick" data-state="${safeText(k)}">${safeText(k)}</button>`).join('')}</div><div id="emergencyResult"></div>` });
}

export function pickEmergency(state) {
  const list = actions[state] || actions['مشتت'];
  const action = list[Math.floor(Math.random()*list.length)];
  lastAction = action;
  appState.data.emergencyLogs.unshift({ id: generateId('emergency'), state, action, createdAt: new Date().toISOString() });
  saveData();
  document.getElementById('emergencyResult').innerHTML = `<div class="emergency-action"><b>الإجراء الآن:</b><p>${safeText(action)}</p><div class="btn-row"><button class="btn primary" data-action="emergency-to-task">حوّل لمهمة</button></div></div>`;
}

export function emergencyToTask() { if (!lastAction) return toast('اختر حالة أولًا'); closeModal(); openTaskModal('', { title: lastAction, type: 'إجراء سريع', source: 'طوارئ', priority: 'عالية', status: 'مفتوحة' }); }
