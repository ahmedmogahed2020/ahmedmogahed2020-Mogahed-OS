(function(){
  "use strict";
  if(window.__MOGAHED_V83_QA_HARNESS__) return;
  window.__MOGAHED_V83_QA_HARNESS__ = true;

  var VERSION = "V83 QA Harness";
  var KEY = "mogahed_os_x_v1";
  var REPORT_KEY = "mogahed_os_v83_last_qa_report";
  var LAST_ERROR_KEY = "mogahed_v82_1_last_errors";
  var KNOWN_ROUTES = ["home","actionHub","knowledge","wins","more","now","projects","goals","focus","reviews","actions","decisions","crm","finance","timeline","vault","graph","archive","settings","dashboard","campaignAnalysis"];
  var __v83ObservedActions = [];

  function nowISO(){ return new Date().toISOString(); }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>\"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m];}); }
  function bytesOf(v){ try { return new Blob([String(v || "")]).size; } catch(e){ return String(v || "").length; } }
  function formatBytes(bytes){ bytes=Number(bytes||0); if(bytes<1024)return bytes+" B"; if(bytes<1024*1024)return Math.round(bytes/1024)+" KB"; return (bytes/1024/1024).toFixed(2)+" MB"; }
  function readJSON(key, fallback){ try { var raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; } }
  function writeJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e){ return false; } }
  function notify(msg){ try { if(window.MogahedOSX && MogahedOSX.toast) return MogahedOSX.toast(msg); } catch(e){} try {  } catch(e){} }
  function sleep(ms){ return new Promise(function(resolve){ setTimeout(resolve, ms); }); }
  function state(){ try { if(window.MogahedOSX && MogahedOSX.state) return window.MogahedOSX.state; } catch(e){} return readJSON(KEY, {}); }
  function stateRaw(){ try { return localStorage.getItem(KEY) || ""; } catch(e){ return ""; } }
  function actions(){ try { return (window.MogahedOSX && window.MogahedOSX.Actions) || {}; } catch(e){ return {}; } }
  function logError(type, err){
    try {
      var list = readJSON(LAST_ERROR_KEY, []);
      list.unshift({ at: nowISO(), type: "V83-" + type, message: String(err && (err.message || err) || "unknown") });
      localStorage.setItem(LAST_ERROR_KEY, JSON.stringify(list.slice(0, 40)));
    } catch(e) {}
  }
  function unique(arr){ var seen=Object.create(null), out=[]; (arr||[]).forEach(function(x){ x=String(x||""); if(x && !seen[x]){seen[x]=true; out.push(x);} }); return out; }
  function statusRank(s){ return s === "fail" ? 3 : s === "warn" ? 2 : s === "pass" ? 1 : 0; }

  function observeCurrentActions(){
    try { document.querySelectorAll("[data-action]").forEach(function(n){ __v83ObservedActions.push(n.getAttribute("data-action")); }); } catch(e){}
  }
  function collectDataActions(){
    observeCurrentActions();
    return unique(__v83ObservedActions).sort();
  }
  function collectRoutes(){
    var found = KNOWN_ROUTES.slice();
    try { document.querySelectorAll("[data-route]").forEach(function(n){ found.push(n.getAttribute("data-route")); }); } catch(e){}
    return unique(found).filter(Boolean);
  }
  function duplicateIds(){
    var seen = Object.create(null), dup = [];
    try { document.querySelectorAll("[id]").forEach(function(n){ var id=n.id; if(seen[id]) dup.push(id); else seen[id]=true; }); } catch(e){}
    return unique(dup);
  }
  function dangerousLiveUrls(){
    var bad=[];
    try {
      document.querySelectorAll("[href],[src]").forEach(function(n){
        var val = n.getAttribute("href") || n.getAttribute("src") || "";
        var low = String(val).replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
        if(low.indexOf("javascript:")===0 || low.indexOf("vbscript:")===0 || low.indexOf("data:text/html")===0){
          bad.push((n.tagName || "node") + ": " + val.slice(0,120));
        }
      });
    } catch(e){}
    return bad;
  }
  function localStorageSize(){
    var total=0, count=0;
    try { for(var i=0;i<localStorage.length;i++){ var k=localStorage.key(i); total += bytesOf(k) + bytesOf(localStorage.getItem(k)); count++; } } catch(e){}
    return { bytes: total, count: count };
  }
  function detectAIKeys(){
    var hits=[];
    try {
      for(var i=0;i<localStorage.length;i++){
        var k=localStorage.key(i) || "";
        var v=String(localStorage.getItem(k) || "");
        var low=(k+" "+v.slice(0,80)).toLowerCase();
        if(/(api[_-]?key|anthropic|claude|gemini|openai|google_ai|ai_key)/i.test(low) && v.trim()) hits.push(k);
      }
    } catch(e){}
    return unique(hits);
  }
  function result(group, name, status, message, details){ return { group: group, name: name, status: status, message: message || "", details: details || "" }; }
  function summarize(results){
    var s = { pass:0, warn:0, fail:0, info:0, total: results.length };
    results.forEach(function(r){ s[r.status] = (s[r.status] || 0) + 1; });
    s.ok = s.fail === 0;
    s.score = Math.max(0, Math.round(((s.pass + s.info*0.5) / Math.max(1, s.total)) * 100));
    return s;
  }

  async function runRouteTests(results){
    var api = window.MogahedOSX || {};
    if(!api.setRoute || !api.render){ results.push(result("Routes", "Route engine", "warn", "setRoute/render غير متاحين بالكامل")); return; }
    var original = "home";
    try { original = api.getRoute ? api.getRoute() : "home"; } catch(e){}
    var routes = collectRoutes();
    var opened = [], failed = [];
    for(var i=0;i<routes.length;i++){
      var r = routes[i];
      try {
        api.setRoute(r);
        api.render();
        await sleep(35);
        var view = document.getElementById("view");
        var text = view ? (view.textContent || "").trim() : "";
        observeCurrentActions();
        if(view && text.length > 5) opened.push(r); else failed.push(r);
      } catch(e){ failed.push(r); logError("route-" + r, e); }
    }
    try { api.setRoute(original || "home"); api.render(); } catch(e){}
    await sleep(50);
    if(failed.length) results.push(result("Routes", "فتح الصفحات", "fail", "فشل فتح " + failed.length + " route", failed.join(", ")));
    else results.push(result("Routes", "فتح الصفحات", "pass", "تم فتح " + opened.length + " صفحة/Route والعودة للصفحة الأصلية", opened.join(", ")));
  }

  async function runModalTest(results){
    var modal = document.getElementById("modal");
    if(!modal){ results.push(result("Modal", "وجود Modal", "fail", "عنصر #modal غير موجود")); return; }
    if(typeof window.openModal !== "function"){ results.push(result("Modal", "openModal", "warn", "openModal غير متاح كدالة عامة")); return; }
    try {
      window.openModal("V83 Modal Test", "<div class=\"item\">اختبار مؤقت آمن</div>");
      await sleep(40);
      var opened = modal.classList.contains("open") || getComputedStyle(modal).display !== "none";
      try { if(window.MogahedOSX && MogahedOSX.closeModal) MogahedOSX.closeModal(); else modal.classList.remove("open"); } catch(e){ modal.classList.remove("open"); }
      results.push(result("Modal", "فتح وإغلاق Modal", opened ? "pass" : "warn", opened ? "المودال يفتح ويغلق" : "لم يتم تأكيد فتح المودال"));
    } catch(e){ results.push(result("Modal", "فتح وإغلاق Modal", "fail", String(e.message || e))); logError("modal-test", e); }
  }

  async function serviceWorkerTest(results){
    if(!("serviceWorker" in navigator)){ results.push(result("PWA", "Service Worker", "info", "المتصفح لا يدعم Service Worker أو التشغيل من file://")); return; }
    try {
      var regs = navigator.serviceWorker.getRegistrations ? await navigator.serviceWorker.getRegistrations() : [];
      results.push(result("PWA", "Service Worker", regs && regs.length ? "pass" : "warn", regs && regs.length ? "مسجل: " + regs.length : "لا يوجد تسجيل نشط بعد"));
    } catch(e){ results.push(result("PWA", "Service Worker", "warn", "تعذر قراءة التسجيل: " + String(e.message || e))); }
  }

  async function runSystemTest(){
    var results = [];
    var started = nowISO();
    function add(group, name, status, message, details){ results.push(result(group, name, status, message, details)); }
    try {
      var api = window.MogahedOSX || {};
      add("Core", "MogahedOSX API", api && typeof api === "object" ? "pass" : "fail", api ? "API موجود" : "API غير موجود");
      add("Core", "render / setRoute / getRoute", (api.render && api.setRoute && api.getRoute) ? "pass" : "warn", "render=" + !!api.render + " setRoute=" + !!api.setRoute + " getRoute=" + !!api.getRoute);
      add("Core", "Actions registry", api.Actions && typeof api.Actions === "object" ? "pass" : "fail", api.Actions ? Object.keys(api.Actions).length + " actions" : "غير موجود");

      var raw = stateRaw();
      try { JSON.parse(raw || "{}"); add("Data", "قراءة بيانات localStorage", "pass", "JSON صالح - " + formatBytes(bytesOf(raw))); } catch(e){ add("Data", "قراءة بيانات localStorage", "fail", "JSON غير صالح: " + String(e.message || e)); }
      var st = state();
      var required = ["knowledge","projects","tasks","goals","actions","reviews","decisions","contacts","inbox","archive"];
      var missing = required.filter(function(k){ return !Array.isArray(st[k]); });
      add("Data", "الجداول الأساسية", missing.length ? "fail" : "pass", missing.length ? "ناقص: " + missing.join(", ") : "كل الجداول الأساسية Arrays");
      if(window.MogahedOSX_V82 && typeof MogahedOSX_V82.validateState === "function"){
        try { var vr = MogahedOSX_V82.validateState(st); add("Data", "V82 Validation", vr.errors && vr.errors.length ? "fail" : (vr.warnings && vr.warnings.length ? "warn" : "pass"), (vr.errors||[]).length + " errors / " + (vr.warnings||[]).length + " warnings", (vr.errors||[]).concat(vr.warnings||[]).slice(0,12).join(" | ")); }
        catch(e){ add("Data", "V82 Validation", "fail", String(e.message || e)); }
      } else add("Data", "V82 Validation", "warn", "V82 validator غير متاح");

      await runRouteTests(results);

      var acts = collectDataActions();
      var A = actions();
      var missingActions = acts.filter(function(a){ return !A[a]; });
      add("Actions", "data-action handlers", missingActions.length ? "fail" : "pass", missingActions.length ? missingActions.length + " action بلا handler" : acts.length + " action لها handlers", missingActions.slice(0,30).join(", "));
      var onclickCount = 0;
      try { onclickCount = document.querySelectorAll("[onclick]").length; } catch(e){}
      add("Actions", "onclick القديم", onclickCount ? "warn" : "pass", onclickCount ? "يوجد onclick=" + onclickCount : "لا توجد onclick مباشرة في DOM الحالي");

      await runModalTest(results);

      try { localStorage.setItem("__mogahed_v83_storage_test__", "ok"); localStorage.removeItem("__mogahed_v83_storage_test__"); add("Storage", "اختبار كتابة localStorage", "pass", "الكتابة والحذف يعملان"); }
      catch(e){ add("Storage", "اختبار كتابة localStorage", "fail", String(e.message || e)); }
      var ls = localStorageSize();
      add("Storage", "حجم التخزين التقريبي", ls.bytes > 4.2*1024*1024 ? "warn" : "pass", formatBytes(ls.bytes) + " / " + ls.count + " keys");
      add("Storage", "Export / Import actions", (A.exportData || A.v80ExportBackup) && (A.importData || A.v80ImportBackup) ? "pass" : "warn", "export=" + !!(A.exportData || A.v80ExportBackup) + " import=" + !!(A.importData || A.v80ImportBackup));

      var dup = duplicateIds();
      add("DOM", "Duplicate IDs", dup.length ? "warn" : "pass", dup.length ? dup.length + " id مكرر في DOM الحالي" : "لا يوجد تكرار IDs ظاهر", dup.slice(0,30).join(", "));
      var badUrls = dangerousLiveUrls();
      add("Security", "روابط live خطرة", badUrls.length ? "fail" : "pass", badUrls.length ? badUrls.length + " رابط خطر" : "لا توجد روابط live تبدأ بـ javascript/vbscript/data:text/html", badUrls.slice(0,20).join(" | "));
      var aiKeys = detectAIKeys();
      add("Security", "AI Keys في المتصفح", aiKeys.length ? "warn" : "pass", aiKeys.length ? "يوجد مفاتيح/إعدادات AI محفوظة محليًا" : "لا توجد مفاتيح AI واضحة في localStorage", aiKeys.slice(0,20).join(", "));

      var modalEl = document.getElementById("modal");
      add("Accessibility", "Modal ARIA", modalEl && modalEl.getAttribute("role") === "dialog" && modalEl.getAttribute("aria-modal") === "true" ? "pass" : "warn", modalEl ? "role=" + modalEl.getAttribute("role") + " aria-modal=" + modalEl.getAttribute("aria-modal") : "modal غير موجود");
      var unlabeled = [];
      try { document.querySelectorAll("button").forEach(function(b){ var txt=(b.textContent||"").trim(); if(!txt && !b.getAttribute("aria-label")) unlabeled.push(b.getAttribute("data-action") || b.className || "button"); }); } catch(e){}
      add("Accessibility", "أزرار بلا تسمية", unlabeled.length ? "warn" : "pass", unlabeled.length ? unlabeled.length + " زر بلا نص/aria-label" : "الأزرار الظاهرة لها نص أو label", unlabeled.slice(0,20).join(", "));

      await serviceWorkerTest(results);

      var report = { version: VERSION, startedAt: started, finishedAt: nowISO(), summary: summarize(results), results: results };
      writeJSON(REPORT_KEY, report);
      return report;
    } catch(e){
      logError("run-system-test", e);
      results.push(result("Harness", "Run System Test", "fail", String(e.message || e)));
      var failedReport = { version: VERSION, startedAt: started, finishedAt: nowISO(), summary: summarize(results), results: results };
      writeJSON(REPORT_KEY, failedReport);
      return failedReport;
    }
  }

  function reportHTML(report){
    report = report || readJSON(REPORT_KEY, null);
    if(!report) return '<div class="card v83-qa-panel"><p class="eyebrow">V83 QA Harness</p><h2>لم يتم تشغيل اختبار بعد</h2><p class="muted">اضغط Run System Test لإنشاء أول تقرير.</p><div class="row"><button class="btn" data-action="v83RunSystemTest">Run System Test</button></div></div>';
    var s = report.summary || summarize(report.results || []);
    var cls = s.fail ? "v83-fail" : (s.warn ? "v83-warn" : "v83-pass");
    var rows = (report.results || []).map(function(r){
      return '<div class="v83-result"><div class="v83-result-head"><b>' + esc(r.group) + ' — ' + esc(r.name) + '</b><span class="v83-tag ' + esc(r.status) + '">' + esc(r.status) + '</span></div><p>' + esc(r.message) + (r.details ? '<br><span class="muted">' + esc(r.details) + '</span>' : '') + '</p></div>';
    }).join('');
    return '<div class="card v83-qa-panel"><p class="eyebrow">V83 QA Harness</p><h2>تقرير اختبار النظام الداخلي</h2><p class="muted">الفحص غير مدمّر: لا يحذف ولا يستورد بيانات. آخر تشغيل: ' + esc(report.finishedAt || '') + '</p>' +
      '<div class="v83-test-grid"><div class="v83-test-card"><small>الحالة</small><b class="' + cls + '">' + (s.fail ? 'يحتاج إصلاح' : (s.warn ? 'سليم مع تحذيرات' : 'سليم')) + '</b></div><div class="v83-test-card"><small>Pass</small><b class="v83-pass">' + Number(s.pass||0) + '</b></div><div class="v83-test-card"><small>Warn</small><b class="v83-warn">' + Number(s.warn||0) + '</b></div><div class="v83-test-card"><small>Fail</small><b class="v83-fail">' + Number(s.fail||0) + '</b></div></div>' +
      '<div class="row" style="margin-top:14px"><button class="btn" data-action="v83RunSystemTest">إعادة تشغيل الاختبار</button><button class="btn secondary" data-action="v83ExportQAReport">تصدير التقرير</button><button class="btn secondary" data-action="v82SystemHealth">V82 Health</button></div>' +
      '<div class="v83-results">' + rows + '</div></div>';
  }
  function openReport(report){
    try {
      if(typeof window.openModal === "function") return window.openModal("V83 System Test", reportHTML(report));
      var m=document.getElementById("modal"), mt=document.getElementById("modalTitle"), mb=document.getElementById("modalBody");
      if(m&&mt&&mb){ mt.textContent="V83 System Test"; mb.innerHTML=reportHTML(report); m.classList.add("open"); }
    } catch(e){ logError("open-report", e); }
  }
  async function runAndOpen(){
    try {
      if(typeof window.openModal === "function") window.openModal("V83 System Test", '<div class="card v83-qa-panel"><p class="eyebrow">V83 QA Harness</p><h2>جاري تشغيل الاختبار الداخلي...</h2><p class="muted">قد يتم التنقل سريعًا بين الصفحات ثم العودة لنفس الصفحة. لا يتم حذف أو استيراد أي بيانات.</p></div>');
      var report = await runSystemTest();
      openReport(report);
      notify(report.summary && report.summary.fail ? "انتهى الفحص مع أخطاء" : "انتهى اختبار النظام الداخلي");
    } catch(e){ logError("run-open", e); openReport({ version: VERSION, finishedAt: nowISO(), summary:{pass:0,warn:0,fail:1,info:0,total:1}, results:[result("Harness","Run System Test","fail",String(e.message||e))] }); }
  }
  function download(name, text){
    try { var a=document.createElement("a"); a.href=URL.createObjectURL(new Blob([text],{type:"application/json;charset=utf-8"})); a.download=name; document.body.appendChild(a); a.click(); setTimeout(function(){ URL.revokeObjectURL(a.href); a.remove(); }, 500); } catch(e){ logError("download", e); }
  }
  function panelHTML(){
    var r = readJSON(REPORT_KEY, null);
    var s = r && r.summary;
    var status = !s ? "لم يعمل بعد" : (s.fail ? "يحتاج إصلاح" : (s.warn ? "سليم مع تحذيرات" : "سليم"));
    var cls = !s ? "v83-info" : (s.fail ? "v83-fail" : (s.warn ? "v83-warn" : "v83-pass"));
    return '<div class="card v83-qa-panel"><div class="space"><div><p class="eyebrow">V83 QA Harness</p><h2>اختبار داخلي للنظام</h2><p class="muted">يفحص الصفحات، الأزرار، المودال، التخزين، الروابط، التكرارات، PWA، ومفاتيح AI بدون تغيير بياناتك.</p></div><span class="pill ' + cls + '">' + status + '</span></div>' +
      '<div class="v83-test-grid"><div class="v83-test-card"><small>آخر تشغيل</small><b>' + esc((r && r.finishedAt) || 'لا يوجد') + '</b></div><div class="v83-test-card"><small>Pass</small><b class="v83-pass">' + Number((s&&s.pass)||0) + '</b></div><div class="v83-test-card"><small>Warn</small><b class="v83-warn">' + Number((s&&s.warn)||0) + '</b></div><div class="v83-test-card"><small>Fail</small><b class="v83-fail">' + Number((s&&s.fail)||0) + '</b></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn" data-action="v83RunSystemTest">Run System Test</button><button class="btn secondary" data-action="v83OpenQAReport">فتح آخر تقرير</button><button class="btn secondary" data-action="v83ExportQAReport">تصدير التقرير</button></div></div>';
  }
  function injectPanel(){
    try {
      var api=window.MogahedOSX || {}, route = api.getRoute ? api.getRoute() : "";
      var view=document.getElementById("view"); if(!view) return;
      if((route === "settings" || route === "home") && !view.querySelector(".v83-qa-panel")) view.insertAdjacentHTML(route === "settings" ? "afterbegin" : "beforeend", panelHTML());
    } catch(e){ logError("inject-panel", e); }
  }
  function injectHealthButton(){
    try {
      var body=document.getElementById("modalBody"); if(!body || body.querySelector(".v83-qa-inline")) return;
      var text=(body.textContent||"");
      if(text.indexOf("V82") === -1 && text.indexOf("System Health") === -1 && text.indexOf("حالة النظام") === -1) return;
      body.insertAdjacentHTML("afterbegin", '<div class="v83-qa-inline"><div class="space"><div><b>V83 QA Harness</b><p class="muted" style="margin:4px 0 0">تشغيل اختبار داخلي غير مدمّر للتأكد أن التنظيف لم يكسر الوظائف الأساسية.</p></div><button class="btn" data-action="v83RunSystemTest">Run System Test</button></div></div>');
    } catch(e){ logError("inject-health-button", e); }
  }
  function registerActions(){
    try {
      var A = actions(); if(!A) return;
      A.v83RunSystemTest = function(){ runAndOpen(); };
      A.v83OpenQAReport = function(){ openReport(readJSON(REPORT_KEY, null)); };
      A.v83ExportQAReport = function(){ var r=readJSON(REPORT_KEY, null); if(!r){ notify("لا يوجد تقرير بعد"); return; } download("Mogahed_OS_V83_QA_Report_" + new Date().toISOString().slice(0,10) + ".json", JSON.stringify(r, null, 2)); };
    } catch(e){ logError("register-actions", e); }
  }
  function wrapRender(){
    try {
      var api=window.MogahedOSX || {}; if(!api.render || api.render.__v83Wrapped) return;
      var old=api.render;
      var wrapped=function(){ var res=old.apply(this, arguments); setTimeout(function(){ registerActions(); injectPanel(); }, 160); return res; };
      wrapped.__v83Wrapped = true; api.render = wrapped; try { window.render = wrapped; } catch(e){}
    } catch(e){ logError("wrap-render", e); }
  }
  function refreshVersion(){
    try { document.title = "Mogahed OS X — " + VERSION; var meta=document.querySelector('meta[name="build"]'); if(meta) meta.setAttribute("content", VERSION + " - Stage 2 Internal System Test"); } catch(e){}
  }
  function boot(){
    refreshVersion(); registerActions(); wrapRender(); injectPanel(); injectHealthButton();
    setTimeout(function(){ registerActions(); wrapRender(); injectPanel(); injectHealthButton(); }, 400);
    setTimeout(function(){ registerActions(); injectPanel(); injectHealthButton(); }, 1200);
  }
  window.MogahedOSX_V83 = { version: VERSION, runSystemTest: runSystemTest, openReport: openReport, reportHTML: reportHTML, collectDataActions: collectDataActions, collectRoutes: collectRoutes };
  document.addEventListener("click", function(){ setTimeout(function(){ registerActions(); injectHealthButton(); }, 80); }, true);
  try { var mo = new MutationObserver(function(){ injectHealthButton(); }); mo.observe(document.documentElement, { childList:true, subtree:true }); } catch(e){}
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();