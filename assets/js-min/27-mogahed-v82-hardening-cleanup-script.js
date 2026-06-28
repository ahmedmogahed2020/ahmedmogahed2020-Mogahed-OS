(function () {
  "use strict";
  if (window.__MOGAHED_V82_HARDENING_CLEANUP__) return;
  window.__MOGAHED_V82_HARDENING_CLEANUP__ = true;
  window.__MOGAHED_V821_REGRESSION_FIX__ = true;

  var VERSION = "V83 QA Harness";
  var KEY = "mogahed_os_x_v1";
  var HISTORY_KEY = "mogahed_v81_history";
  var LEGACY_HISTORY_KEYS = ["mogahed_os_x_v81_history"];
  var LAST_ERROR_KEY = "mogahed_v82_1_last_errors";
  var V82_REPORT_KEY = "mogahed_os_v82_1_last_report";
  var MAX_HISTORY = 8;
  var MAX_HISTORY_BYTES = 1.8 * 1024 * 1024;
  var __v82CompactingHistory = false;

  function nowISO(){ return new Date().toISOString(); }
  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function bytesOf(v){ try { return new Blob([String(v || "")]).size; } catch(e){ return String(v || "").length; } }
  function formatBytes(bytes){ bytes=Number(bytes||0); if(bytes<1024)return bytes+" B"; if(bytes<1024*1024)return Math.round(bytes/1024)+" KB"; return (bytes/1024/1024).toFixed(2)+" MB"; }
  function esc(s){ return String(s == null ? "" : s).replace(/[&<>\"]/g,function(m){return {"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[m];}); }
  function notify(msg){ try { if(window.MogahedOSX && MogahedOSX.toast) return MogahedOSX.toast(msg); } catch(e){} try {  } catch(e){} }
  function readJSON(key, fallback){ try { var raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; } }
  function writeJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e){ logError("write-json:"+key, e); return false; } }
  function logError(type, err, extra){
    try {
      var list = readJSON(LAST_ERROR_KEY, []);
      list.unshift({ at: nowISO(), type: "V82-" + type, message: String(err && (err.message || err) || "unknown"), extra: extra || "" });
      localStorage.setItem(LAST_ERROR_KEY, JSON.stringify(list.slice(0, 30)));
    } catch(e) {}
  }
  function getState(){
    try { if(window.MogahedOSX && MogahedOSX.state && typeof MogahedOSX.state === "object") return MogahedOSX.state; } catch(e){}
    try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch(e){ return {}; }
  }
  function ensureArray(obj, key){ if(!Array.isArray(obj[key])) obj[key] = []; return obj[key]; }
  function ensureObject(obj, key){ if(!obj[key] || typeof obj[key] !== "object" || Array.isArray(obj[key])) obj[key] = {}; return obj[key]; }
  function uid(prefix){ return (prefix || "row") + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function normalizeUrl(v){
    var s = String(v == null ? "" : v).trim();
    if(!s) return "";
    var low = s.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
    if(low.indexOf("javascript:") === 0 || low.indexOf("data:text/html") === 0 || low.indexOf("vbscript:") === 0) return "";
    return s;
  }
  function normalizeStateV82(obj){
    if(!obj || typeof obj !== "object" || Array.isArray(obj)) obj = {};
    obj.schemaVersion = Math.max(Number(obj.schemaVersion || 0), 82);
    obj.appVersion = VERSION;
    ensureObject(obj, "profile"); ensureObject(obj, "settings"); ensureObject(obj, "types"); ensureObject(obj, "modules");
    if(!obj.profile.name) obj.profile.name = "مجاهد";
    ["knowledge","projects","tasks","goals","actions","reviews","decisions","contacts","habits","finance","timeline","archive","inbox","sessions","wins","relationships","mediaData"].forEach(function(k){ ensureArray(obj,k); });
    var idMaps = {};
    ["knowledge","projects","tasks","goals","actions","reviews","decisions","contacts","habits","finance","timeline","archive","inbox","sessions","wins","relationships"].forEach(function(k){
      var seen = Object.create(null); idMaps[k] = seen;
      obj[k] = obj[k].filter(function(x){ return x && typeof x === "object" && !Array.isArray(x); }).map(function(x){
        if(!x.id || seen[String(x.id)]) x.id = uid(k.slice(0,3));
        seen[String(x.id)] = true;
        ["title","name","text","status","area","type","project","note","summary","ideas","application","result","reason"].forEach(function(f){ if(x[f] != null && typeof x[f] !== "string") x[f] = String(x[f]); });
        ["mediaUrl","link","url","cover","src","href"].forEach(function(f){ if(x[f] != null) x[f] = normalizeUrl(x[f]); });
        if(x.progress != null){ var n = Number(x.progress); x.progress = isFinite(n) ? Math.max(0, Math.min(100, Math.round(n))) : 0; }
        return x;
      });
    });
    obj.lastV82NormalizedAt = nowISO();
    return obj;
  }
  function validateStateV82(obj){
    var errors = [], warnings = [];
    if(!obj || typeof obj !== "object" || Array.isArray(obj)) errors.push("state ليس Object صالح");
    ["knowledge","projects","tasks","goals","actions","reviews","decisions","contacts","habits","finance","timeline","archive","inbox","sessions","wins","relationships"].forEach(function(k){
      if(!Array.isArray(obj && obj[k])) { errors.push(k + " ليست Array"); return; }
      var seen = Object.create(null);
      obj[k].forEach(function(x,i){
        if(!x || typeof x !== "object" || Array.isArray(x)) { errors.push(k + " عنصر غير صالح عند " + i); return; }
        if(!x.id) errors.push(k + " عنصر بدون id عند " + i);
        if(x.id && seen[String(x.id)]) errors.push(k + " id مكرر: " + x.id);
        seen[String(x.id)] = true;
        ["mediaUrl","link","url","cover","src","href"].forEach(function(f){
          if(x[f]){ var low=String(x[f]).trim().toLowerCase(); if(low.indexOf("javascript:")===0 || low.indexOf("vbscript:")===0 || low.indexOf("data:text/html")===0) errors.push(k + "." + f + " رابط غير آمن عند " + i); }
        });
        if(x.progress != null && (Number(x.progress)<0 || Number(x.progress)>100 || !isFinite(Number(x.progress)))) warnings.push(k + " progress خارج النطاق عند " + i);
      });
    });
    ["profile","settings","types","modules"].forEach(function(k){ if(!obj || !obj[k] || typeof obj[k] !== "object" || Array.isArray(obj[k])) errors.push(k + " ليس Object صالح"); });
    var goalIds = Object.create(null), projectNames = Object.create(null), knowledgeIds = Object.create(null);
    (obj.goals||[]).forEach(function(g){ goalIds[String(g.id)] = true; });
    (obj.projects||[]).forEach(function(p){ if(p.title) projectNames[String(p.title)] = true; });
    (obj.knowledge||[]).forEach(function(k){ knowledgeIds[String(k.id)] = true; });
    (obj.actions||[]).concat(obj.tasks||[]).forEach(function(x){
      if(x.goalId && !goalIds[String(x.goalId)]) warnings.push("عنصر مرتبط بهدف غير موجود: " + (x.title || x.id));
      if(x.sourceId && !knowledgeIds[String(x.sourceId)]) warnings.push("عنصر مرتبط بمعرفة غير موجودة: " + (x.title || x.id));
    });
    return { errors: errors, warnings: warnings };
  }
  function normalizeCurrentStateV82(saveBack){
    try {
      var st = getState();
      var before = JSON.stringify(st || {});
      var normalized = normalizeStateV82(st);
      var report = validateStateV82(normalized);
      if(report.errors.length) throw new Error(report.errors.join(" | "));
      try { if(window.MogahedOSX && MogahedOSX.state && MogahedOSX.state !== normalized){ Object.keys(MogahedOSX.state).forEach(function(k){delete MogahedOSX.state[k];}); Object.keys(normalized).forEach(function(k){MogahedOSX.state[k]=normalized[k];}); } } catch(e){}
      var after = JSON.stringify(normalized);
      localStorage.setItem(V82_REPORT_KEY, JSON.stringify({ at: nowISO(), ok: true, warnings: report.warnings.slice(0, 50), errors: [] }));
      if(saveBack || before !== after) localStorage.setItem(KEY, after);
      return { ok: true, errors: [], warnings: report.warnings };
    } catch(e) {
      logError("validation", e);
      try { localStorage.setItem(V82_REPORT_KEY, JSON.stringify({ at: nowISO(), ok: false, warnings: [], errors: [String(e.message || e)] })); } catch(_) {}
      return { ok: false, errors: [String(e.message || e)], warnings: [] };
    }
  }

  function isAllowedInlineHandler(code){
    var c = String(code == null ? "" : code).trim();
    return /^(v49PdfNav\((-?1)\)|v49PdfZoom\((-?\.15|\.15)\)|v50ToggleReaderFullscreen\((true|false)\)|v62CleanOldSessions\(\)|v63SaveClientId\(\)|v63DriveBackup\(\)|v63DriveList\(\)|v63RestoreFromDrive\(['"0-9A-Za-z_\-:.]+['"]\))$/.test(c);
  }
  function sanitizeHTML(html){
    try {
      var tpl = document.createElement("template");
      tpl.innerHTML = String(html == null ? "" : html);
      tpl.content.querySelectorAll("script, object, embed, meta[http-equiv]").forEach(function(n){ n.remove(); });
      tpl.content.querySelectorAll("*").forEach(function(el){
        Array.from(el.attributes).forEach(function(attr){
          var name = String(attr.name || "").toLowerCase();
          var raw = String(attr.value || "");
          var value = raw.replace(/[\u0000-\u001F\u007F\s]+/g, "").toLowerCase();
          if(name.indexOf("on") === 0) { if(name === "onclick" && isAllowedInlineHandler(raw)) return; el.removeAttribute(attr.name); return; }
          if((name === "href" || name === "src" || name === "xlink:href" || name === "formaction") && (value.indexOf("javascript:") === 0 || value.indexOf("vbscript:") === 0 || value.indexOf("data:text/html") === 0)) { el.removeAttribute(attr.name); return; }
          if(name === "style" && /javascript\s*:|expression\s*\(|url\s*\(\s*['\"]?\s*javascript\s*:/i.test(raw)) { el.removeAttribute(attr.name); return; }
          if(el.tagName && el.tagName.toLowerCase() === "iframe" && name === "src") {
            if(!/^(https?:)?\/\//i.test(raw) && raw.indexOf("about:blank") !== 0) el.removeAttribute(attr.name);
          }
        });
      });
      return tpl.innerHTML;
    } catch(e) { logError("sanitize", e); return String(html == null ? "" : html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, ""); }
  }
  window.MogahedOSX_V82_sanitizeHTML = sanitizeHTML;
  window.MogahedOSX_V81_sanitizeHTML = sanitizeHTML;

  function wrapOpenModal(){
    try {
      if(typeof window.openModal === "function" && !window.openModal.__v82Safe){
        var old = window.openModal;
        var safe = function(title, body){ return old.call(this, String(title == null ? "" : title), sanitizeHTML(body)); };
        safe.__v82Safe = true;
        window.openModal = safe;
      }
    } catch(e){ logError("wrap-openModal", e); }
  }
  function patchInsertAdjacentHTML(){
    try {
      if(Element.prototype.insertAdjacentHTML) Element.prototype.insertAdjacentHTML.__v821ScopedOnly = true;
    } catch(e){ logError("patch-insertAdjacentHTML-skip", e); }
  }

  function normalizeHistoryObject(h){
    if(!h || typeof h !== "object") h = { undo: [], redo: [] };
    if(!Array.isArray(h.undo)) h.undo = [];
    if(!Array.isArray(h.redo)) h.redo = [];
    h.undo = h.undo.filter(function(x){ return x && typeof x === "object" && typeof x.raw === "string"; });
    h.redo = h.redo.filter(function(x){ return x && typeof x === "object" && typeof x.raw === "string"; });
    return h;
  }
  function migrateHistoryV821(){
    try {
      var canonical = normalizeHistoryObject(readJSON(HISTORY_KEY, { undo: [], redo: [] }));
      LEGACY_HISTORY_KEYS.forEach(function(k){
        var legacy = normalizeHistoryObject(readJSON(k, { undo: [], redo: [] }));
        if(legacy.undo.length || legacy.redo.length){
          canonical.undo = legacy.undo.concat(canonical.undo);
          canonical.redo = legacy.redo.concat(canonical.redo);
          try { localStorage.removeItem(k); } catch(_) {}
        }
      });
      var seen = Object.create(null);
      canonical.undo = canonical.undo.filter(function(x){ var key = x.raw; if(seen[key]) return false; seen[key] = true; return true; }).slice(0, MAX_HISTORY);
      seen = Object.create(null);
      canonical.redo = canonical.redo.filter(function(x){ var key = x.raw; if(seen[key]) return false; seen[key] = true; return true; }).slice(0, MAX_HISTORY);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(canonical));
      return canonical;
    } catch(e){ logError("history-migration", e); return { undo: [], redo: [] }; }
  }
  function compactHistory(reason){
    try {
      var h = normalizeHistoryObject(readJSON(HISTORY_KEY, { undo: [], redo: [] }));
      h.undo = h.undo.slice(0, MAX_HISTORY);
      h.redo = h.redo.slice(0, MAX_HISTORY);
      var raw = JSON.stringify(h);
      if(bytesOf(raw) > MAX_HISTORY_BYTES){
        h.redo = [];
        h.undo = h.undo.slice(0, 3);
        raw = JSON.stringify(h);
      }
      if(bytesOf(raw) > MAX_HISTORY_BYTES){
        h.undo = h.undo.slice(0, 1);
        raw = JSON.stringify(h);
      }
      __v82CompactingHistory = true;
      try { localStorage.setItem(HISTORY_KEY, raw); } finally { __v82CompactingHistory = false; }
      return { ok: true, bytes: bytesOf(raw), undo: h.undo.length, redo: h.redo.length, reason: reason || "manual" };
    } catch(e){ logError("compact-history", e); return { ok: false, bytes: 0, undo: 0, redo: 0, error: String(e.message || e) }; }
  }

  function patchStorageSetItem(){
    try {
      if(Storage.prototype.setItem.__v82Safe) return;
      var old = Storage.prototype.setItem;
      var patched = function(key, value){
        if(String(key) === KEY){
          try {
            var obj = normalizeStateV82(JSON.parse(String(value || "{}")));
            var report = validateStateV82(obj);
            if(report.errors.length) throw new Error(report.errors.join(" | "));
            value = JSON.stringify(obj);
            localStorage.setItem(V82_REPORT_KEY, JSON.stringify({ at: nowISO(), ok: true, warnings: report.warnings.slice(0,50), errors: [] }));
          } catch(e){ logError("setItem-main-state", e); notify("V82 منع حفظ بيانات غير آمنة أو تالفة"); throw e; }
        }
        if(String(key) === HISTORY_KEY){
          try {
            var h = JSON.parse(String(value || "{}"));
            if(h && typeof h === "object"){
              if(Array.isArray(h.undo)) h.undo = h.undo.slice(0, MAX_HISTORY);
              if(Array.isArray(h.redo)) h.redo = h.redo.slice(0, MAX_HISTORY);
              value = JSON.stringify(h);
            }
          } catch(e){}
        }
        var res = old.call(this, key, value);
        if(String(key) === HISTORY_KEY && !__v82CompactingHistory) setTimeout(function(){ compactHistory("setItem"); }, 0);
        return res;
      };
      patched.__v82Safe = true;
      Storage.prototype.setItem = patched;
    } catch(e){ logError("patch-storage", e); }
  }

  function registerExternalActionNoops(){
    try {
      var api = window.MogahedOSX || {};
      var A = api.Actions;
      if(!A) return;
      [
        "v79AddGoalAction","v79AddGoalTask","v79ReviewGoal","v79SaveLinkedAction","v79SaveLinkedTask","v79SaveGoalReview",
        "v80ExportBackup","v80ImportBackup","v80AutoBackup","v80KnowledgeToIdea","v80KnowledgeToTask","v80KnowledgeToGoal","v80KnowledgeToAction","v80SaveKnowledgeConversion"
      ].forEach(function(name){
        if(!A[name]) A[name] = function(){  };
      });
      A.v821PdfNavPrev = function(){ try { if(typeof window.v49PdfNav === "function") return window.v49PdfNav(-1); } catch(e){ logError("pdf-nav-prev", e); } };
      A.v821PdfNavNext = function(){ try { if(typeof window.v49PdfNav === "function") return window.v49PdfNav(1); } catch(e){ logError("pdf-nav-next", e); } };
      A.v821PdfZoomOut = function(){ try { if(typeof window.v49PdfZoom === "function") return window.v49PdfZoom(-0.15); } catch(e){ logError("pdf-zoom-out", e); } };
      A.v821PdfZoomIn = function(){ try { if(typeof window.v49PdfZoom === "function") return window.v49PdfZoom(0.15); } catch(e){ logError("pdf-zoom-in", e); } };
      A.v821ReaderFullscreenOn = function(){ try { if(typeof window.v50ToggleReaderFullscreen === "function") return window.v50ToggleReaderFullscreen(true); } catch(e){ logError("reader-fullscreen-on", e); } };
      A.v821ReaderFullscreenOff = function(){ try { if(typeof window.v50ToggleReaderFullscreen === "function") return window.v50ToggleReaderFullscreen(false); } catch(e){ logError("reader-fullscreen-off", e); } };
      A.v821CleanOldSessions = function(){ try { if(typeof window.v62CleanOldSessions === "function") return window.v62CleanOldSessions(); } catch(e){ logError("clean-old-sessions", e); } };
      A.v821DriveSaveClientId = function(){ try { if(typeof window.v63SaveClientId === "function") return window.v63SaveClientId(); } catch(e){ logError("drive-save-client", e); } };
      A.v821DriveBackup = function(){ try { if(typeof window.v63DriveBackup === "function") return window.v63DriveBackup(); } catch(e){ logError("drive-backup", e); } };
      A.v821DriveList = function(){ try { if(typeof window.v63DriveList === "function") return window.v63DriveList(); } catch(e){ logError("drive-list", e); } };
      A.v821DriveRestore = function(id, btn){ try { var fileId = (btn && btn.dataset && btn.dataset.driveId) || id || ""; if(fileId && typeof window.v63RestoreFromDrive === "function") return window.v63RestoreFromDrive(fileId); } catch(e){ logError("drive-restore", e); } };
      A.v821SearchGo = function(id, btn){ try { var route = (btn && btn.dataset && btn.dataset.route) || "home"; if(window.MogahedOSX && MogahedOSX.setRoute) MogahedOSX.setRoute(route); if(window.MogahedOSX && MogahedOSX.render) MogahedOSX.render(); var box=document.querySelector(".search-results"); if(box) box.style.display="none"; var inp=document.querySelector(".searchbox input"); if(inp) inp.value=""; } catch(e){ logError("search-go", e); } };
      A.v82SystemHealth = openHealth;
      A.v82ValidateNow = function(){ var r = normalizeCurrentStateV82(true); compactHistory("validate"); notify(r.ok ? "تم فحص وتنظيف البيانات بأمان" : "يوجد خطأ — افتح V82 Health"); try { api.render && api.render(); } catch(e){} };
      A.v82CompactHistory = function(){ var r = compactHistory("manual"); notify(r.ok ? "تم تنظيف سجل التراجع: " + r.undo + " Undo / " + r.redo + " Redo" : "تعذر تنظيف سجل التراجع"); };
      A.v82ClearRuntimeErrors = function(){ try { localStorage.removeItem(LAST_ERROR_KEY); notify("تم مسح سجل الأخطاء"); openHealth(); } catch(e){} };
      A.v82Undo = function(){ try { if(window.MogahedOSX_V81 && MogahedOSX_V81.undo) return MogahedOSX_V81.undo(); } catch(e){} notify("Undo غير متاح حاليًا"); };
      A.v82Redo = function(){ try { if(window.MogahedOSX_V81 && MogahedOSX_V81.redo) return MogahedOSX_V81.redo(); } catch(e){} notify("Redo غير متاح حاليًا"); };
    } catch(e){ logError("register-actions", e); }
  }

  function healthSnapshot(){
    var stateRaw = "", histRaw = "";
    try { stateRaw = localStorage.getItem(KEY) || ""; } catch(e){}
    try { histRaw = localStorage.getItem(HISTORY_KEY) || ""; } catch(e){}
    var state = normalizeStateV82(getState());
    var report = validateStateV82(state);
    var h = readJSON(HISTORY_KEY, { undo: [], redo: [] });
    var lastReport = readJSON(V82_REPORT_KEY, { at: "", ok: true, warnings: [], errors: [] });
    var errors = readJSON(LAST_ERROR_KEY, []);
    return {
      stateBytes: bytesOf(stateRaw), historyBytes: bytesOf(histRaw),
      storageWarn: bytesOf(stateRaw) + bytesOf(histRaw) > 4.2 * 1024 * 1024,
      validation: report, history: { undo: Array.isArray(h.undo) ? h.undo.length : 0, redo: Array.isArray(h.redo) ? h.redo.length : 0 },
      lastReport: lastReport, errors: errors,
      counts: ["knowledge","projects","tasks","goals","actions","reviews","decisions","contacts","inbox","archive"].reduce(function(acc,k){ acc[k] = Array.isArray(state[k]) ? state[k].length : 0; return acc; }, {})
    };
  }
  function panelHTML(){
    var hs = healthSnapshot();
    var ok = !hs.validation.errors.length && !hs.storageWarn;
    return '<div class="card v82-hardening-panel"><div class="space"><div><p class="eyebrow">V82.1 Regression Fix</p><h2>إصلاحات Regression آمنة</h2><p class="muted">حماية أقوى للبيانات، تنظيف Undo/Redo، تأمين النوافذ والروابط، كاش أحدث، وتحسينات Accessibility — بدون حذف مميزات.</p></div><span class="pill ' + (ok ? 'v82-ok' : 'v82-warn') + '">' + (ok ? 'مستقر' : 'راجع التنبيهات') + '</span></div>' +
      '<div class="v82-health-grid"><div class="v82-health-card"><small>حجم البيانات</small><b>' + formatBytes(hs.stateBytes) + '</b></div><div class="v82-health-card"><small>Undo / Redo</small><b>' + hs.history.undo + ' / ' + hs.history.redo + '</b></div><div class="v82-health-card"><small>History Size</small><b>' + formatBytes(hs.historyBytes) + '</b></div><div class="v82-health-card"><small>Validation</small><b class="' + (hs.validation.errors.length ? 'v82-bad' : 'v82-ok') + '">' + (hs.validation.errors.length ? hs.validation.errors.length + ' أخطاء' : 'سليم') + '</b></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn" data-action="v82SystemHealth">فتح V82 Health</button><button class="btn secondary" data-action="v82ValidateNow">فحص وتنظيف</button><button class="btn secondary" data-action="v82CompactHistory">تنظيف Undo</button><button class="btn secondary" data-action="v82Undo">Undo</button><button class="btn secondary" data-action="v82Redo">Redo</button></div></div>';
  }
  function fullHealthHTML(){
    var hs = healthSnapshot();
    var countHTML = Object.keys(hs.counts).map(function(k){ return '<div class="v82-health-card"><small>' + esc(k) + '</small><b>' + Number(hs.counts[k] || 0) + '</b></div>'; }).join('');
    var warnings = hs.validation.warnings.length ? hs.validation.warnings.map(esc).join('<br>') : '<span class="v82-ok">لا توجد تحذيرات منطقية مهمة.</span>';
    var errors = hs.validation.errors.length ? hs.validation.errors.map(esc).join('<br>') : '<span class="v82-ok">البيانات سليمة حسب فحص V82.</span>';
    var runtime = hs.errors.length ? hs.errors.slice(0,20).map(function(x){ return '[' + x.at + '] ' + x.type + ': ' + x.message + (x.extra ? ' — ' + x.extra : ''); }).join('\n') : 'لا توجد أخطاء Runtime مسجلة.';
    return '<div class="card v82-hardening-panel"><p class="eyebrow">V82 System Health</p><h2>حالة النظام بعد إصلاحات V82.1</h2><p class="muted">هذه اللوحة تكشف مشاكل البيانات، التخزين، Undo/Redo، والأخطاء الصامتة بعد إصلاحات V82.1 بدون تغيير مميزات المشروع.</p>' +
      '<div class="v82-health-grid"><div class="v82-health-card"><small>البيانات الأساسية</small><b>' + formatBytes(hs.stateBytes) + '</b></div><div class="v82-health-card"><small>سجل التراجع</small><b>' + formatBytes(hs.historyBytes) + '</b></div><div class="v82-health-card"><small>حالة التخزين</small><b class="' + (hs.storageWarn ? 'v82-warn' : 'v82-ok') + '">' + (hs.storageWarn ? 'اقترب من الحد' : 'آمن') + '</b></div><div class="v82-health-card"><small>آخر فحص</small><b>' + esc((hs.lastReport && hs.lastReport.at) || 'الآن') + '</b></div></div>' +
      '<h3 style="margin-top:16px">أخطاء Validation</h3><div class="item">' + errors + '</div>' +
      '<h3 style="margin-top:16px">تحذيرات منطقية</h3><div class="item">' + warnings + '</div>' +
      '<h3 style="margin-top:16px">أعداد الجداول الأساسية</h3><div class="v82-health-grid">' + countHTML + '</div>' +
      '<h3 style="margin-top:16px">آخر أخطاء Runtime</h3><div class="v82-log">' + esc(runtime) + '</div>' +
      '<div class="row" style="margin-top:14px"><button class="btn" data-action="v82ValidateNow">فحص وتنظيف الآن</button><button class="btn secondary" data-action="v82CompactHistory">ضغط Undo/Redo</button><button class="btn secondary" data-action="v82ClearRuntimeErrors">مسح الأخطاء</button><button class="btn secondary" data-action="v82Undo">Undo</button><button class="btn secondary" data-action="v82Redo">Redo</button></div></div>';
  }
  function openHealth(){
    try {
      wrapOpenModal();
      if(typeof window.openModal === "function") return window.openModal("V82 System Health", fullHealthHTML());
      var m=document.getElementById("modal"), mt=document.getElementById("modalTitle"), mb=document.getElementById("modalBody");
      if(m&&mt&&mb){ mt.textContent="V82 System Health"; mb.innerHTML=sanitizeHTML(fullHealthHTML()); m.classList.add("open"); }
    } catch(e){ logError("open-health", e); }
  }
  function injectPanel(){
    try {
      var api = window.MogahedOSX || {};
      var route = api.getRoute ? api.getRoute() : "";
      var view = document.getElementById("view");
      if(!view) return;
      view.querySelectorAll(".v81-stability-panel").forEach(function(n){ n.classList.add("v82-hidden-old-panel"); });
      if((route === "settings" || route === "home") && !view.querySelector(".v82-hardening-panel")){
        view.insertAdjacentHTML(route === "settings" ? "afterbegin" : "beforeend", panelHTML());
      }
    } catch(e){ logError("inject-panel", e); }
  }
  function wrapRender(){
    try {
      var api = window.MogahedOSX || {};
      if(!api.render || api.render.__v82Wrapped) return;
      var old = api.render;
      var wrapped = function(){
        var res = old.apply(this, arguments);
        setTimeout(function(){ registerExternalActionNoops(); injectPanel(); compactHistory("render"); enhanceAccessibility(); }, 120);
        return res;
      };
      wrapped.__v82Wrapped = true;
      api.render = wrapped;
      try { window.render = wrapped; } catch(e){}
    } catch(e){ logError("wrap-render", e); }
  }

  function enhanceAccessibility(){
    try {
      var modal = document.getElementById("modal");
      if(modal){ modal.setAttribute("role","dialog"); modal.setAttribute("aria-modal","true"); modal.setAttribute("aria-labelledby","modalTitle"); }
      var floating = document.querySelector(".floating"); if(floating && !floating.getAttribute("aria-label")) floating.setAttribute("aria-label","إضافة سريعة");
      var emergency = document.querySelector(".emergency-floating"); if(emergency && !emergency.getAttribute("aria-label")) emergency.setAttribute("aria-label","طوارئ التشتت");
      document.querySelectorAll("button:not([aria-label])").forEach(function(b){ var txt=(b.textContent||"").trim(); if(!txt && b.dataset && b.dataset.action) b.setAttribute("aria-label", b.dataset.action); });
    } catch(e){ logError("accessibility", e); }
  }
  function wireKeyboard(){
    if(window.__MOGAHED_V82_KEYBOARD__) return;
    window.__MOGAHED_V82_KEYBOARD__ = true;
    document.addEventListener("keydown", function(e){
      if(e.key === "Escape"){
        var modal = document.getElementById("modal");
        if(modal && modal.classList.contains("open")){
          try { if(window.MogahedOSX && MogahedOSX.closeModal) MogahedOSX.closeModal(); else modal.classList.remove("open"); } catch(_) { modal.classList.remove("open"); }
        }
      }
    });
  }
  function refreshVersionLabels(){
    try {
      document.title = "Mogahed OS X — " + VERSION;
      var meta = document.querySelector('meta[name="build"]'); if(meta) meta.setAttribute("content", VERSION + " - deep safe cleanup");
    } catch(e){}
  }
  function boot(){
    patchInsertAdjacentHTML();
    patchStorageSetItem();
    wrapOpenModal();
    registerExternalActionNoops();
    wrapRender();
    wireKeyboard();
    refreshVersionLabels();
    normalizeCurrentStateV82(false);
    migrateHistoryV821();
    compactHistory("boot");
    enhanceAccessibility();
    setTimeout(function(){ registerExternalActionNoops(); wrapRender(); injectPanel(); enhanceAccessibility(); }, 250);
    setTimeout(function(){ registerExternalActionNoops(); injectPanel(); compactHistory("late-boot"); }, 900);
    try { if(navigator.serviceWorker && navigator.serviceWorker.getRegistrations){ navigator.serviceWorker.getRegistrations().then(function(regs){ regs.forEach(function(r){ try { r.update(); } catch(_){} }); }); } } catch(e){}
  }
  window.MogahedOSX_V82 = {
    version: VERSION,
    migrateHistory: migrateHistoryV821,
    sanitizeHTML: sanitizeHTML,
    normalizeState: normalizeStateV82,
    validateState: validateStateV82,
    normalizeCurrentState: normalizeCurrentStateV82,
    compactHistory: compactHistory,
    healthSnapshot: healthSnapshot,
    openHealth: openHealth
  };
  window.addEventListener("error", function(e){ logError("runtime", e.error || e.message, (e.filename || "") + ":" + (e.lineno || "")); });
  window.addEventListener("unhandledrejection", function(e){ logError("promise", e.reason || "Unhandled promise rejection"); });
  document.addEventListener("click", function(e){ var b=e.target && e.target.closest && e.target.closest("[data-action]"); if(b) setTimeout(function(){ compactHistory("click"); }, 0); }, true);
  if(document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else boot();
})();