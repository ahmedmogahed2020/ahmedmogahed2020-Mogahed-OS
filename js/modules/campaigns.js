import { appState } from '../state.js';
import { closeModal, emptyState, objectFromForm, openModal, pageHeader } from '../ui.js';
import { formatCurrency, generateId, safeNumber, safeText } from '../utils.js';
import { numberField, removeItem, simpleCard, upsert } from './shared.js';

export function calculateCampaign(c) {
  const productCost = safeNumber(c.productCost);
  const sellingPrice = safeNumber(c.suggestedSellingPrice || c.currentSellingPrice);
  const contentCost = safeNumber(c.reelCost) + safeNumber(c.shootingCost) + safeNumber(c.designCost) + safeNumber(c.otherCreativeCost);
  const adsBudget = safeNumber(c.adsBudget);
  const totalInvestment = contentCost + adsBudget;
  const grossProfitPerUnit = sellingPrice - productCost;
  const netProfitPerUnit = grossProfitPerUnit - safeNumber(c.shippingCost) - safeNumber(c.discountValue);
  const breakEvenUnits = netProfitPerUnit > 0 ? Math.ceil(totalInvestment / netProfitPerUnit) : Infinity;
  const unitsForTargetProfit = netProfitPerUnit > 0 ? Math.ceil((totalInvestment + safeNumber(c.targetProfit)) / netProfitPerUnit) : Infinity;
  const availableUnits = safeNumber(c.availableUnits);
  const revenue = sellingPrice * availableUnits;
  const expectedSales = Math.round((adsBudget / Math.max(safeNumber(c.expectedLeadCost), 1)) * (safeNumber(c.expectedConversionRate) / 100));
  const expectedProfit = expectedSales * netProfitPerUnit - totalInvestment;
  const roas = adsBudget ? ((expectedSales * sellingPrice) / adsBudget).toFixed(2) : '0.00';
  const cpa = expectedSales ? Math.round(adsBudget / expectedSales) : 0;
  const margin = sellingPrice ? Math.round((netProfitPerUnit / sellingPrice) * 100) : 0;
  const risk = netProfitPerUnit <= 0 ? 'عالية جدًا' : breakEvenUnits > availableUnits ? 'عالية' : breakEvenUnits > availableUnits * .55 ? 'متوسطة' : 'منخفضة';
  const recommendation = netProfitPerUnit <= 0 ? 'السعر الحالي غير آمن. ارفع السعر أو اعمل Bundle أو قلل التكاليف.' : risk === 'عالية' ? 'الحملة محتاجة Bundle قوي أو رفع سعر لأن نقطة التعادل قريبة من المخزون.' : 'الحملة ممكنة بشرط اختبار Hook قوي ومتابعة تكلفة الرسالة يوميًا.';
  return { contentCost, totalInvestment, grossProfitPerUnit, netProfitPerUnit, breakEvenUnits, unitsForTargetProfit, revenue, expectedSales, expectedProfit, roas, cpa, margin, risk, recommendation };
}

export function createScenarios(c) {
  const base = safeNumber(c.productCost);
  const creative = safeNumber(c.reelCost)+safeNumber(c.shootingCost)+safeNumber(c.designCost)+safeNumber(c.otherCreativeCost)+safeNumber(c.adsBudget);
  const target = safeNumber(c.targetProfit || 10000);
  const candidates = [
    { name: 'الآمن', multiplier: 1.85, note: 'سعر أعلى وربحية أحسن وعدد مبيعات أقل.' },
    { name: 'المتوازن', multiplier: 1.65, note: 'أفضل نقطة بين السعر والانتشار والربح.' },
    { name: 'الهجومي', multiplier: 1.45, note: 'سعر أقل يحتاج مبيعات أعلى وHook أقوى.' }
  ];
  return candidates.map(s => {
    const price = Math.ceil((base * s.multiplier) / 10) * 10;
    const profitPerUnit = price - base - safeNumber(c.shippingCost) - safeNumber(c.discountValue);
    const be = profitPerUnit > 0 ? Math.ceil(creative / profitPerUnit) : Infinity;
    const targetUnits = profitPerUnit > 0 ? Math.ceil((creative + target) / profitPerUnit) : Infinity;
    return { ...s, price, profitPerUnit, breakEvenUnits: be, targetUnits, expectedProfit: (targetUnits * profitPerUnit) - creative, risk: be > safeNumber(c.availableUnits) ? 'عالية' : be > safeNumber(c.availableUnits)*.55 ? 'متوسطة' : 'منخفضة' };
  });
}

export function renderCampaigns() {
  const actions = '<button class="btn primary" data-action="open-campaign-modal">تحليل حملة</button>';
  return `<section class="page">${pageHeader('تحليل الحملات الإعلانية', 'حاسبة تسعير وحملات حقيقية لصاحب متجر: سعر، نقطة تعادل، ربح، ROAS، مخاطرة.', actions)}
    <div class="grid grid-2">${appState.data.campaigns.length ? appState.data.campaigns.map(campaignCard).join('') : emptyState('لا توجد حملات', 'ابدأ بتحليل زيت هندي 108 عشبة أو أي منتج جديد.', actions)}</div>
  </section>`;
}

function campaignCard(c) {
  const r = calculateCampaign(c);
  const extra = `<button class="btn primary" data-action="view-campaign" data-id="${safeText(c.id)}">عرض التحليل</button>`;
  return simpleCard('campaign', { ...c, title: c.productName, status: r.risk }, `<div class="kpi-grid"><div class="kpi-card"><small>الاستثمار</small><strong>${formatCurrency(r.totalInvestment)}</strong></div><div class="kpi-card"><small>صافي ربح القطعة</small><strong>${formatCurrency(r.netProfitPerUnit)}</strong></div><div class="kpi-card"><small>Break Even</small><strong>${Number.isFinite(r.breakEvenUnits)?r.breakEvenUnits:'غير آمن'}</strong></div><div class="kpi-card"><small>ROAS</small><strong>${r.roas}x</strong></div></div><p>${safeText(r.recommendation)}</p>`, extra);
}

export function openCampaignModal(id = '') {
  const c = appState.data.campaigns.find(x=>x.id===id) || { productName:'', productCost:850, reelCost:3000, adsBudget:10000, campaignDays:7, expectedLeadCost:35, expectedConversionRate:8, targetMargin:35, targetProfit:10000, suggestedSellingPrice:1450, availableUnits:30 };
  openModal({title:c.id?'تعديل حملة':'تحليل حملة جديدة',saveText:'حفظ التحليل',body:`<form id="entityForm" class="form-grid"><input type="hidden" name="id" value="${safeText(c.id||'')}"><label>اسم المنتج<input name="productName" required value="${safeText(c.productName)}"></label>${numberField('productCost',c.productCost,'تكلفة القطعة')}${numberField('currentSellingPrice',c.currentSellingPrice,'سعر البيع الحالي')}${numberField('suggestedSellingPrice',c.suggestedSellingPrice,'سعر البيع المقترح')}${numberField('availableUnits',c.availableUnits,'المخزون المتاح')}${numberField('targetMargin',c.targetMargin,'هامش الربح المستهدف %')}${numberField('reelCost',c.reelCost,'تكلفة الريلز')}${numberField('shootingCost',c.shootingCost,'تكلفة التصوير')}${numberField('designCost',c.designCost,'تكلفة التصميم')}${numberField('otherCreativeCost',c.otherCreativeCost,'تكاليف محتوى أخرى')}${numberField('adsBudget',c.adsBudget,'ميزانية الإعلانات')}${numberField('campaignDays',c.campaignDays,'عدد أيام الحملة')}${numberField('expectedLeadCost',c.expectedLeadCost,'تكلفة الليد المتوقعة')}${numberField('expectedConversionRate',c.expectedConversionRate,'نسبة التحويل المتوقعة %')}${numberField('shippingCost',c.shippingCost,'تكلفة الشحن/التجهيز')}${numberField('discountValue',c.discountValue,'قيمة الخصم')}${numberField('targetProfit',c.targetProfit,'ربح مستهدف') }<label class="full">ملاحظات<textarea name="notes">${safeText(c.notes||'')}</textarea></label></form>`,onSave:saveCampaign});
}
function saveCampaign(){ const d=objectFromForm(document.getElementById('entityForm')); const numeric=['productCost','currentSellingPrice','suggestedSellingPrice','availableUnits','targetMargin','reelCost','shootingCost','designCost','otherCreativeCost','adsBudget','campaignDays','expectedLeadCost','expectedConversionRate','shippingCost','discountValue','targetProfit']; numeric.forEach(k=>d[k]=safeNumber(d[k])); upsert('campaigns',{...d,id:d.id||generateId('campaign')}); closeModal(); }
export function viewCampaign(id){ const c=appState.data.campaigns.find(x=>x.id===id); if(!c) return; const r=calculateCampaign(c); const scenarios=createScenarios(c); openModal({title:`تحليل ${c.productName}`,body:`<div class="campaign-summary"><div class="kpi-grid"><div class="kpi-card"><small>تكلفة المحتوى</small><strong>${formatCurrency(r.contentCost)}</strong></div><div class="kpi-card"><small>إجمالي الاستثمار</small><strong>${formatCurrency(r.totalInvestment)}</strong></div><div class="kpi-card"><small>ربح القطعة</small><strong>${formatCurrency(r.grossProfitPerUnit)}</strong></div><div class="kpi-card"><small>صافي ربح القطعة</small><strong>${formatCurrency(r.netProfitPerUnit)}</strong></div><div class="kpi-card"><small>تغطية التكلفة</small><strong>${Number.isFinite(r.breakEvenUnits)?r.breakEvenUnits:'غير آمن'}</strong></div><div class="kpi-card"><small>لتحقيق ربح مستهدف</small><strong>${Number.isFinite(r.unitsForTargetProfit)?r.unitsForTargetProfit:'غير آمن'}</strong></div><div class="kpi-card"><small>CPA</small><strong>${formatCurrency(r.cpa)}</strong></div><div class="kpi-card"><small>Margin</small><strong>${r.margin}%</strong></div></div><table class="scenario-table"><thead><tr><th>السيناريو</th><th>السعر</th><th>تعادل</th><th>للمكسب</th><th>مخاطرة</th></tr></thead><tbody>${scenarios.map(s=>`<tr><td>${s.name}<br><small>${s.note}</small></td><td>${formatCurrency(s.price)}</td><td>${s.breakEvenUnits}</td><td>${s.targetUnits}</td><td>${s.risk}</td></tr>`).join('')}</tbody></table><div class="recommendation"><b>التوصية النهائية:</b> ${safeText(r.recommendation)} الأفضل غالبًا السيناريو المتوازن، ومع منتج عالي التكلفة جرّب Bundle بدل خصم مباشر حتى لا تكسر هامش الربح.</div><div class="warning-box">Hook مقترح: "زيت 108 عشبة… هل يستاهل سعره؟ النتيجة بعد الاستخدام هي الحكم" — CTA: "ابعتي كلمة زيت واعرفي الأنسب لشعرك".</div></div>`}); }
export function editCampaign(id){openCampaignModal(id)} export function deleteCampaign(id){removeItem('campaigns',id)}
