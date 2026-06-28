import { appState } from '../state.js';
import { autoSave } from '../storage.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader, toast } from '../ui.js';
import { calculatePercentage, formatCurrency, generateId, parseLines, safeNumber, safeText, todayISO } from '../utils.js';
import { numberField, removeItem, simpleCard, upsert } from './shared.js';
import { renderPage } from '../router.js';

const campaignViews = [
  ['all', 'كل الحملات'],
  ['safe', 'آمنة'],
  ['test', 'اختبار'],
  ['danger', 'عالية المخاطرة'],
  ['bundle', 'مناسبة Bundle']
];

const scenarioProfiles = [
  { key: 'safe', name: 'الآمن', priceFactor: 1.92, salesFactor: 0.7, riskOffset: -1, note: 'سعر أعلى، مبيعات أقل، هامش أقوى. مناسب لمنتج تكلفته عالية أو مخزون قليل.' },
  { key: 'balanced', name: 'المتوازن', priceFactor: 1.68, salesFactor: 1, riskOffset: 0, note: 'أفضل توازن بين السعر والانتشار والربح. غالبًا البداية الأنسب للاختبار.' },
  { key: 'attack', name: 'الهجومي', priceFactor: 1.48, salesFactor: 1.35, riskOffset: 1, note: 'سعر أقل وانتشار أعلى، لكنه يحتاج Hook قوي ومتابعة CPA يومية.' }
];

function totalCreativeCost(c = {}) {
  return safeNumber(c.reelCost) + safeNumber(c.shootingCost) + safeNumber(c.designCost) + safeNumber(c.otherCreativeCost);
}

function selectedPrice(c = {}) {
  const explicit = safeNumber(c.suggestedSellingPrice || c.currentSellingPrice);
  if (explicit > 0) return explicit;
  return minimumSafePrice(c);
}

function unitNetProfit(c = {}, price = selectedPrice(c)) {
  return price - safeNumber(c.productCost) - safeNumber(c.shippingCost) - safeNumber(c.discountValue);
}

function expectedSalesUnits(c = {}, factor = 1) {
  const adsBudget = safeNumber(c.adsBudget);
  const leadCost = Math.max(safeNumber(c.expectedLeadCost), 1);
  const conversion = Math.max(safeNumber(c.expectedConversionRate), 0) / 100;
  return Math.max(0, Math.round((adsBudget / leadCost) * conversion * factor));
}

function minimumSafePrice(c = {}) {
  const cost = safeNumber(c.productCost);
  const shipping = safeNumber(c.shippingCost);
  const discount = safeNumber(c.discountValue);
  const targetMargin = Math.max(safeNumber(c.targetMargin, 35), 5) / 100;
  return Math.ceil(((cost + shipping + discount) / Math.max(1 - targetMargin, 0.05)) / 10) * 10;
}

function riskLabel(score) {
  if (score >= 80) return 'عالية جدًا';
  if (score >= 60) return 'عالية';
  if (score >= 38) return 'متوسطة';
  return 'منخفضة';
}

function decisionLabel(risk, expectedProfit) {
  if (risk === 'عالية جدًا' || expectedProfit < 0) return 'لا تبدأ بالحجم ده';
  if (risk === 'عالية') return 'اختبر بميزانية صغيرة';
  if (risk === 'متوسطة') return 'ابدأ بحذر';
  return 'ابدأ الاختبار';
}

function riskScoreFrom(c = {}, metrics = {}, offset = 0) {
  const availableUnits = safeNumber(c.availableUnits);
  const breakEvenUnits = Number.isFinite(metrics.breakEvenUnits) ? metrics.breakEvenUnits : 9999;
  const expectedSales = safeNumber(metrics.expectedSales);
  const netProfit = safeNumber(metrics.netProfitPerUnit);
  const roas = safeNumber(metrics.roas);
  let score = 20 + offset * 12;
  if (netProfit <= 0) score += 60;
  if (availableUnits && breakEvenUnits > availableUnits) score += 35;
  if (availableUnits && breakEvenUnits > availableUnits * 0.65) score += 18;
  if (expectedSales && breakEvenUnits > expectedSales) score += 18;
  if (roas < 1.7) score += 14;
  if (safeNumber(c.productCost) > safeNumber(c.suggestedSellingPrice || c.currentSellingPrice) * 0.6) score += 10;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function calculateCampaign(c) {
  const productCost = safeNumber(c.productCost);
  const sellingPrice = selectedPrice(c);
  const contentCost = totalCreativeCost(c);
  const adsBudget = safeNumber(c.adsBudget);
  const totalInvestment = contentCost + adsBudget;
  const grossProfitPerUnit = sellingPrice - productCost;
  const netProfitPerUnit = unitNetProfit(c, sellingPrice);
  const breakEvenUnits = netProfitPerUnit > 0 ? Math.ceil(totalInvestment / netProfitPerUnit) : Infinity;
  const unitsForTargetProfit = netProfitPerUnit > 0 ? Math.ceil((totalInvestment + safeNumber(c.targetProfit)) / netProfitPerUnit) : Infinity;
  const availableUnits = safeNumber(c.availableUnits);
  const revenue = sellingPrice * availableUnits;
  const expectedSales = expectedSalesUnits(c);
  const expectedRevenue = expectedSales * sellingPrice;
  const expectedProfit = expectedSales * netProfitPerUnit - totalInvestment;
  const roas = adsBudget ? Number((expectedRevenue / adsBudget).toFixed(2)) : 0;
  const cpa = expectedSales ? Math.round(adsBudget / expectedSales) : 0;
  const margin = sellingPrice ? Math.round((netProfitPerUnit / sellingPrice) * 100) : 0;
  const minimumPrice = minimumSafePrice(c);
  const riskScore = riskScoreFrom(c, { breakEvenUnits, expectedSales, netProfitPerUnit, roas });
  const risk = riskLabel(riskScore);
  const decision = decisionLabel(risk, expectedProfit);
  const bundleAdvice = getBundleAdvice(c, { sellingPrice, netProfitPerUnit, breakEvenUnits, risk });
  const recommendation = buildRecommendation(c, { sellingPrice, minimumPrice, netProfitPerUnit, breakEvenUnits, unitsForTargetProfit, expectedSales, expectedProfit, risk, decision, bundleAdvice });
  return { contentCost, totalInvestment, grossProfitPerUnit, netProfitPerUnit, breakEvenUnits, unitsForTargetProfit, revenue, expectedSales, expectedRevenue, expectedProfit, roas, cpa, margin, minimumPrice, riskScore, risk, decision, bundleAdvice, recommendation };
}

export function createScenarios(c) {
  const cost = safeNumber(c.productCost);
  const fixedInvestment = totalCreativeCost(c) + safeNumber(c.adsBudget);
  const target = safeNumber(c.targetProfit || 10000);
  const baseMinPrice = minimumSafePrice(c);
  return scenarioProfiles.map(profile => {
    const price = Math.max(Math.ceil((cost * profile.priceFactor) / 10) * 10, profile.key === 'attack' ? cost + safeNumber(c.shippingCost) + safeNumber(c.discountValue) + 80 : baseMinPrice);
    const netProfitPerUnit = unitNetProfit(c, price);
    const breakEvenUnits = netProfitPerUnit > 0 ? Math.ceil(fixedInvestment / netProfitPerUnit) : Infinity;
    const targetUnits = netProfitPerUnit > 0 ? Math.ceil((fixedInvestment + target) / netProfitPerUnit) : Infinity;
    const expectedSales = expectedSalesUnits(c, profile.salesFactor);
    const expectedProfit = expectedSales * netProfitPerUnit - fixedInvestment;
    const roas = safeNumber(c.adsBudget) ? Number(((expectedSales * price) / safeNumber(c.adsBudget)).toFixed(2)) : 0;
    const riskScore = riskScoreFrom(c, { breakEvenUnits, expectedSales, netProfitPerUnit, roas }, profile.riskOffset);
    return { ...profile, price, netProfitPerUnit, breakEvenUnits, targetUnits, expectedSales, expectedProfit, roas, riskScore, risk: riskLabel(riskScore) };
  });
}

function getBundleAdvice(c, r) {
  const cost = safeNumber(c.productCost);
  const price = safeNumber(r.sellingPrice);
  const net = safeNumber(r.netProfitPerUnit);
  if (net <= 0) return 'Bundle ضروري أو رفع سعر؛ الخصم المباشر هيكسر الربح.';
  if (cost > price * 0.55) return 'الأفضل Bundle بقيمة محسوسة بدل خصم مباشر لأن تكلفة المنتج عالية.';
  if (r.risk === 'عالية' || r.risk === 'عالية جدًا') return 'استخدم Bundle أو هدية منخفضة التكلفة لرفع التحويل بدون حرق السعر.';
  return 'ممكن تبدأ بسعر متوازن، والـ Bundle يبقى أداة لزيادة متوسط الأوردر.';
}

function buildRecommendation(c, r) {
  const parts = [];
  parts.push(`القرار: ${r.decision}.`);
  parts.push(`أقل سعر آمن تقريبي: ${formatCurrency(r.minimumPrice)}.`);
  if (safeNumber(r.sellingPrice) < safeNumber(r.minimumPrice)) parts.push('السعر الحالي أقل من السعر الآمن، ارفع السعر أو قلل التكاليف.');
  if (Number.isFinite(r.breakEvenUnits)) parts.push(`تحتاج بيع ${r.breakEvenUnits} قطعة لتغطية التكلفة.`);
  if (Number.isFinite(r.unitsForTargetProfit)) parts.push(`وتحتاج ${r.unitsForTargetProfit} قطعة تقريبًا لتحقيق الربح المستهدف.`);
  if (safeNumber(r.expectedProfit) < 0) parts.push('الربح المتوقع سلبي حسب تكلفة الليد والتحويل المدخلة، ابدأ باختبار صغير فقط.');
  parts.push(r.bundleAdvice);
  return parts.join(' ');
}

function campaignStatusClass(risk = '') {
  if (risk.includes('عالية')) return 'danger';
  if (risk === 'متوسطة') return 'warning';
  return 'success';
}

function normalizeCampaign(c = {}) {
  return {
    campaignDays: 7,
    expectedLeadCost: 35,
    expectedConversionRate: 8,
    targetMargin: 35,
    targetProfit: 10000,
    availableUnits: 30,
    ...c
  };
}

function getCampaignQuery() {
  return appState.filters.campaignQuery || '';
}

function setCampaignView(value) {
  appState.filters.campaigns = value || 'all';
  renderPage();
}

export function setCampaignSearch(value) {
  appState.filters.campaignQuery = value || '';
  renderPage();
}

function matchesCampaignView(c) {
  const view = appState.filters.campaigns || 'all';
  const r = calculateCampaign(c);
  if (view === 'safe') return r.risk === 'منخفضة' || r.risk === 'متوسطة';
  if (view === 'test') return r.decision.includes('اختبر') || r.decision.includes('حذر');
  if (view === 'danger') return r.risk.includes('عالية') || r.expectedProfit < 0;
  if (view === 'bundle') return r.bundleAdvice.includes('Bundle') || r.bundleAdvice.includes('هدية');
  return true;
}

function matchesCampaignQuery(c) {
  const q = getCampaignQuery().trim().toLowerCase();
  if (!q) return true;
  return [c.productName, c.notes, c.hook, c.cta, c.recommendation].join(' ').toLowerCase().includes(q);
}

function campaignStats() {
  const campaigns = (appState.data.campaigns || []).map(normalizeCampaign);
  const analysed = campaigns.map(c => ({ c, r: calculateCampaign(c) }));
  const safe = analysed.filter(x => x.r.risk === 'منخفضة' || x.r.risk === 'متوسطة');
  const danger = analysed.filter(x => x.r.risk.includes('عالية') || x.r.expectedProfit < 0);
  const totalBudget = analysed.reduce((sum, x) => sum + safeNumber(x.c.adsBudget), 0);
  const expectedProfit = analysed.reduce((sum, x) => sum + safeNumber(x.r.expectedProfit), 0);
  const avgMargin = calculatePercentage(analysed.reduce((sum, x) => sum + safeNumber(x.r.margin), 0), analysed.length * 100);
  return { campaigns, analysed, safe, danger, totalBudget, expectedProfit, avgMargin };
}

function renderCampaignIntel() {
  const s = campaignStats();
  return `<div class="campaign-intel-grid">
    <article class="kpi-card"><small>إجمالي الحملات</small><strong>${safeText(s.campaigns.length)}</strong></article>
    <article class="kpi-card"><small>حملات آمنة/متوسطة</small><strong>${safeText(s.safe.length)}</strong></article>
    <article class="kpi-card"><small>تحتاج حذر</small><strong>${safeText(s.danger.length)}</strong></article>
    <article class="kpi-card"><small>إجمالي الميزانيات</small><strong>${formatCurrency(s.totalBudget)}</strong></article>
    <article class="kpi-card"><small>ربح متوقع</small><strong>${formatCurrency(s.expectedProfit)}</strong></article>
    <article class="kpi-card"><small>متوسط الهامش</small><strong>${safeText(s.avgMargin)}%</strong></article>
  </div>`;
}

function renderCampaignToolbar() {
  return `<div class="campaign-toolbar card compact">
    <div class="filters">${campaignViews.map(([value, label]) => `<button class="filter-btn ${(appState.filters.campaigns || 'all') === value ? 'active' : ''}" data-action="set-campaign-filter" data-filter="${safeText(value)}">${safeText(label)}</button>`).join('')}</div>
    <input data-action="campaign-search" value="${safeText(getCampaignQuery())}" placeholder="ابحث باسم المنتج أو الملاحظات...">
  </div>`;
}

export function renderCampaigns() {
  const actions = '<button class="btn primary" data-action="open-campaign-modal">تحليل حملة</button><button class="btn ghost" data-action="open-campaign-compare">مقارنة الحملات</button>';
  const campaigns = (appState.data.campaigns || []).map(normalizeCampaign).filter(c => matchesCampaignView(c) && matchesCampaignQuery(c));
  return `<section class="page campaign-pro">${pageHeader('تحليل الحملات الإعلانية', 'Campaign Analyzer Pro: تسعير، سيناريوهات، Bundle، مخاطرة، خطة تنفيذ، ومهام تلقائية.', actions)}
    ${renderCampaignIntel()}${renderCampaignToolbar()}
    <div class="grid grid-2">${campaigns.length ? campaigns.map(campaignCard).join('') : emptyState('لا توجد حملات مناسبة', 'ابدأ بتحليل منتج أو غيّر الفلتر الحالي.', '<button class="btn primary" data-action="open-campaign-modal">تحليل حملة</button>')}</div>
  </section>`;
}

function campaignCard(c) {
  const r = calculateCampaign(c);
  const scenarios = createScenarios(c);
  const best = scenarios.slice().sort((a, b) => b.expectedProfit - a.expectedProfit)[0];
  const extra = `<button class="btn primary" data-action="view-campaign" data-id="${safeText(c.id)}">عرض التحليل</button><button class="btn ghost" data-action="campaign-to-tasks" data-id="${safeText(c.id)}">حوّل لخطة</button>`;
  return simpleCard('campaign', { ...c, title: c.productName, status: r.risk }, `<div class="campaign-risk-line"><span class="badge ${campaignStatusClass(r.risk)}">${safeText(r.decision)}</span><span>مخاطرة ${safeText(r.risk)} — ${safeText(r.riskScore)}%</span></div><div class="kpi-grid"><div class="kpi-card"><small>الاستثمار</small><strong>${formatCurrency(r.totalInvestment)}</strong></div><div class="kpi-card"><small>صافي القطعة</small><strong>${formatCurrency(r.netProfitPerUnit)}</strong></div><div class="kpi-card"><small>Break Even</small><strong>${Number.isFinite(r.breakEvenUnits) ? r.breakEvenUnits : 'غير آمن'}</strong></div><div class="kpi-card"><small>أفضل سيناريو</small><strong>${safeText(best?.name || '—')}</strong></div></div><p>${safeText(r.recommendation)}</p>`, extra);
}

export function openCampaignModal(id = '') {
  const c = normalizeCampaign(appState.data.campaigns.find(x => x.id === id) || { productName: 'زيت هندي 108 عشبة', productCost: 850, reelCost: 3000, adsBudget: 10000, campaignDays: 7, expectedLeadCost: 35, expectedConversionRate: 8, targetMargin: 35, targetProfit: 10000, suggestedSellingPrice: 1450, availableUnits: 30 });
  openModal({ title: c.id ? 'تعديل حملة' : 'تحليل حملة جديدة', saveText: 'حفظ التحليل', body: `<form id="entityForm" class="form-grid campaign-form"><input type="hidden" name="id" value="${safeText(c.id || '')}"><label>اسم المنتج<input name="productName" required value="${safeText(c.productName)}"></label>${numberField('productCost', c.productCost, 'تكلفة القطعة')}${numberField('currentSellingPrice', c.currentSellingPrice, 'سعر البيع الحالي')}${numberField('suggestedSellingPrice', c.suggestedSellingPrice, 'سعر البيع المقترح')}${numberField('availableUnits', c.availableUnits, 'المخزون المتاح')}${numberField('targetMargin', c.targetMargin, 'هامش الربح المستهدف %')}${numberField('reelCost', c.reelCost, 'تكلفة الريلز')}${numberField('shootingCost', c.shootingCost, 'تكلفة التصوير')}${numberField('designCost', c.designCost, 'تكلفة التصميم')}${numberField('otherCreativeCost', c.otherCreativeCost, 'تكاليف محتوى أخرى')}${numberField('adsBudget', c.adsBudget, 'ميزانية الإعلانات')}${numberField('campaignDays', c.campaignDays, 'عدد أيام الحملة')}${numberField('expectedLeadCost', c.expectedLeadCost, 'تكلفة الليد المتوقعة')}${numberField('expectedConversionRate', c.expectedConversionRate, 'نسبة التحويل المتوقعة %')}${numberField('shippingCost', c.shippingCost, 'تكلفة الشحن/التجهيز')}${numberField('discountValue', c.discountValue, 'قيمة الخصم')}${numberField('targetProfit', c.targetProfit, 'ربح مستهدف')}<label>Hook مبدئي<input name="hook" value="${safeText(c.hook || '')}" placeholder="مثال: هل زيت 108 عشبة يستاهل؟"></label><label>CTA<input name="cta" value="${safeText(c.cta || '')}" placeholder="مثال: ابعتي كلمة زيت"></label><label class="full">ملاحظات<textarea name="notes">${safeText(c.notes || '')}</textarea></label></form>`, onSave: saveCampaign });
}

function saveCampaign() {
  const form = document.getElementById('entityForm');
  if (!form?.reportValidity()) return;
  const d = objectFromForm(form);
  const numeric = ['productCost', 'currentSellingPrice', 'suggestedSellingPrice', 'availableUnits', 'targetMargin', 'reelCost', 'shootingCost', 'designCost', 'otherCreativeCost', 'adsBudget', 'campaignDays', 'expectedLeadCost', 'expectedConversionRate', 'shippingCost', 'discountValue', 'targetProfit'];
  numeric.forEach(k => d[k] = safeNumber(d[k]));
  const id = d.id || generateId('campaign');
  const calculated = calculateCampaign({ ...d, id });
  upsert('campaigns', { ...d, id, lastAnalysis: calculated, status: calculated.decision });
  closeModal();
  toast('تم حفظ تحليل الحملة');
}

function scenarioTable(scenarios) {
  return `<table class="scenario-table"><thead><tr><th>السيناريو</th><th>السعر</th><th>صافي القطعة</th><th>تعادل</th><th>للمكسب</th><th>مبيعات متوقعة</th><th>ربح متوقع</th><th>مخاطرة</th></tr></thead><tbody>${scenarios.map(s => `<tr><td><b>${safeText(s.name)}</b><br><small>${safeText(s.note)}</small></td><td>${formatCurrency(s.price)}</td><td>${formatCurrency(s.netProfitPerUnit)}</td><td>${Number.isFinite(s.breakEvenUnits) ? s.breakEvenUnits : 'غير آمن'}</td><td>${Number.isFinite(s.targetUnits) ? s.targetUnits : 'غير آمن'}</td><td>${safeText(s.expectedSales)}</td><td>${formatCurrency(s.expectedProfit)}</td><td><span class="badge ${campaignStatusClass(s.risk)}">${safeText(s.risk)}</span></td></tr>`).join('')}</tbody></table>`;
}

function bundleCalculator(c, r) {
  const price = selectedPrice(c);
  const cost = safeNumber(c.productCost);
  const giftCost = Math.max(Math.round(cost * 0.08), 25);
  const twoPackPrice = Math.ceil((price * 2 * 0.94) / 10) * 10;
  const twoPackProfit = twoPackPrice - cost * 2 - safeNumber(c.shippingCost) - safeNumber(c.discountValue);
  const giftBundlePrice = Math.ceil((price + giftCost * 1.8) / 10) * 10;
  const giftBundleProfit = giftBundlePrice - cost - giftCost - safeNumber(c.shippingCost) - safeNumber(c.discountValue);
  return `<div class="campaign-panel"><h3>Bundle / Discount Impact</h3><div class="grid grid-2"><article class="mini-card"><b>خصم مباشر</b><p>لو خفضت 10% السعر يصبح ${formatCurrency(price * 0.9)} وصافي القطعة ${formatCurrency(unitNetProfit(c, price * 0.9))}. استخدمه بحذر.</p></article><article class="mini-card"><b>باكدج قطعتين</b><p>سعر مقترح ${formatCurrency(twoPackPrice)} وربح تقريبي ${formatCurrency(twoPackProfit)}. مناسب لو المنتج بيتكرر استخدامه.</p></article><article class="mini-card"><b>هدية منخفضة التكلفة</b><p>هدية بتكلفة ${formatCurrency(giftCost)} مع سعر ${formatCurrency(giftBundlePrice)} وربح ${formatCurrency(giftBundleProfit)}. غالبًا أفضل من الخصم.</p></article><article class="mini-card"><b>النصيحة</b><p>${safeText(r.bundleAdvice)}</p></article></div></div>`;
}

function executionPlan(c, r) {
  const days = Math.max(safeNumber(c.campaignDays, 7), 3);
  const plan = days <= 3 ? [
    'اليوم 1: اختبر Hook واحد وفيديو الريلز بميزانية صغيرة.',
    'اليوم 2: راقب تكلفة الرسالة والتحويل، وأوقف الإعلان لو CPA أعلى من صافي ربح القطعة.',
    'اليوم 3: وسّع أفضل نسخة أو غيّر العرض إلى Bundle.'
  ] : [
    'اليوم 1: إطلاق اختبار Hook + Creative بميزانية محدودة.',
    'اليوم 2: قياس CTR والرسائل وحذف الإعلان الضعيف.',
    'اليوم 3: اختبار عرض Bundle أو هدية بدل خصم مباشر.',
    'اليوم 4-5: زيادة الميزانية تدريجيًا لأفضل إعلان فقط.',
    'اليوم 6: مراجعة CPA والهامش والمخزون.',
    'اليوم 7: قرار توسع / إيقاف / إعادة تصوير.'
  ];
  return `<div class="campaign-panel"><h3>خطة تنفيذ مختصرة</h3><ol>${plan.map(item => `<li>${safeText(item)}</li>`).join('')}</ol><div class="warning-box"><b>قاعدة الإيقاف:</b> لو CPA أعلى من صافي ربح القطعة (${formatCurrency(r.netProfitPerUnit)}) لمدة يومين، أوقف أو غيّر العرض.</div></div>`;
}

function creativeOutput(c) {
  const product = c.productName || 'المنتج';
  const hook = c.hook || `${product}… هل يستاهل سعره؟ النتيجة بعد الاستخدام هي الحكم`;
  const cta = c.cta || `ابعتي كلمة ${String(product).split(' ')[0] || 'تفاصيل'} واعرفي العرض المناسب`;
  return `<div class="campaign-panel"><h3>Hook و CTA</h3><div class="grid grid-2"><article class="mini-card"><small>Hook مقترح</small><strong>${safeText(hook)}</strong></article><article class="mini-card"><small>CTA مقترح</small><strong>${safeText(cta)}</strong></article></div></div>`;
}

export function viewCampaign(id) {
  const c = normalizeCampaign(appState.data.campaigns.find(x => x.id === id));
  if (!c?.id) return;
  const r = calculateCampaign(c);
  const scenarios = createScenarios(c);
  const best = scenarios.slice().sort((a, b) => b.expectedProfit - a.expectedProfit)[0];
  openModal({ title: `تحليل ${safeText(c.productName)}`, body: `<div class="campaign-summary campaign-pro-modal"><div class="campaign-final-call"><div><small>التوصية</small><h3>${safeText(r.decision)}</h3><p>${safeText(r.recommendation)}</p></div><div class="risk-meter"><span style="--risk:${safeText(r.riskScore)}%"></span><b>${safeText(r.riskScore)}%</b><small>${safeText(r.risk)}</small></div></div><div class="kpi-grid"><div class="kpi-card"><small>تكلفة المحتوى</small><strong>${formatCurrency(r.contentCost)}</strong></div><div class="kpi-card"><small>إجمالي الاستثمار</small><strong>${formatCurrency(r.totalInvestment)}</strong></div><div class="kpi-card"><small>ربح القطعة</small><strong>${formatCurrency(r.grossProfitPerUnit)}</strong></div><div class="kpi-card"><small>صافي ربح القطعة</small><strong>${formatCurrency(r.netProfitPerUnit)}</strong></div><div class="kpi-card"><small>تغطية التكلفة</small><strong>${Number.isFinite(r.breakEvenUnits) ? r.breakEvenUnits : 'غير آمن'}</strong></div><div class="kpi-card"><small>لتحقيق الربح</small><strong>${Number.isFinite(r.unitsForTargetProfit) ? r.unitsForTargetProfit : 'غير آمن'}</strong></div><div class="kpi-card"><small>ROAS</small><strong>${safeText(r.roas)}x</strong></div><div class="kpi-card"><small>CPA</small><strong>${formatCurrency(r.cpa)}</strong></div></div><div class="campaign-panel"><h3>أفضل سيناريو: ${safeText(best?.name || 'المتوازن')}</h3>${scenarioTable(scenarios)}</div>${bundleCalculator(c, r)}${creativeOutput(c)}${executionPlan(c, r)}<div class="btn-row"><button class="btn primary" data-action="campaign-to-tasks" data-id="${safeText(c.id)}">حوّل التحليل لمهام</button><button class="btn ghost" data-action="edit-campaign" data-id="${safeText(c.id)}">تعديل البيانات</button></div></div>` });
}

function campaignTasks(c) {
  const r = calculateCampaign(c);
  const title = c.productName || 'حملة';
  const defaultLines = parseLines(c.taskPlan || '').length ? parseLines(c.taskPlan) : [
    `راجع سعر ${title} وتأكد أنه لا يقل عن ${formatCurrency(r.minimumPrice)}`,
    `اكتب Hook نهائي لحملة ${title}`,
    'جهّز عرض Bundle أو هدية منخفضة التكلفة بدل الخصم المباشر',
    'راجع تكلفة الليد بعد أول يوم إعلان',
    'قرر: توسع / إيقاف / تعديل Creative حسب CPA',
    'سجّل نتيجة الحملة في المراجعة الأسبوعية'
  ];
  return defaultLines.map(line => ({
    id: generateId('task'),
    title: line,
    description: `مهمة مولدة من تحليل حملة: ${title}`,
    source: 'حملة',
    type: 'إجراء سريع',
    priority: r.risk.includes('عالية') ? 'عالية' : 'متوسطة',
    status: 'مفتوحة',
    dueDate: todayISO(),
    projectId: c.projectId || '',
    goalId: c.goalId || '',
    notes: r.recommendation,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }));
}

export function campaignToTasks(id) {
  const c = normalizeCampaign(appState.data.campaigns.find(x => x.id === id));
  if (!c?.id) return;
  const tasks = campaignTasks(c);
  appState.data.tasks.unshift(...tasks);
  autoSave();
  renderPage();
  toast(`تم إنشاء ${tasks.length} مهام من تحليل الحملة`);
}

export function openCampaignCompare() {
  const campaigns = (appState.data.campaigns || []).map(normalizeCampaign);
  if (!campaigns.length) { toast('لا توجد حملات للمقارنة'); return; }
  const rows = campaigns.map(c => ({ c, r: calculateCampaign(c) })).sort((a, b) => b.r.expectedProfit - a.r.expectedProfit);
  openModal({ title: 'مقارنة الحملات', body: `<div class="campaign-summary"><table class="scenario-table"><thead><tr><th>المنتج</th><th>السعر</th><th>الاستثمار</th><th>تعادل</th><th>ربح متوقع</th><th>ROAS</th><th>قرار</th></tr></thead><tbody>${rows.map(({ c, r }) => `<tr><td><b>${safeText(c.productName)}</b><br><small>${safeText(r.risk)}</small></td><td>${formatCurrency(selectedPrice(c))}</td><td>${formatCurrency(r.totalInvestment)}</td><td>${Number.isFinite(r.breakEvenUnits) ? r.breakEvenUnits : 'غير آمن'}</td><td>${formatCurrency(r.expectedProfit)}</td><td>${safeText(r.roas)}x</td><td><span class="badge ${campaignStatusClass(r.risk)}">${safeText(r.decision)}</span></td></tr>`).join('')}</tbody></table><div class="recommendation"><b>أفضل حملة مبدئيًا:</b> ${safeText(rows[0]?.c.productName || 'لا يوجد')} لأنها الأعلى في الربح المتوقع بعد حساب التكلفة والمخاطرة.</div></div>` });
}

export function editCampaign(id) { openCampaignModal(id); }
export function deleteCampaign(id) { removeItem('campaigns', id); }
export function setCampaignFilter(value) { setCampaignView(value); }
