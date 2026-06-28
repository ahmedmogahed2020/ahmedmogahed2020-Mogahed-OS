(function () {
  "use strict";
  if (window.__MOGAHED_V81_STABILITY__) return;
  window.__MOGAHED_V81_STABILITY__ = true;

  var KEY = "mogahed_os_x_v1";
  var VERSION = "V81 Stability";
  var HISTORY_KEY = "mogahed_v81_history";
  var SAFE_BACKUP_KEY = "mogahed_v81_last_known_good";
  var LAST_ERROR_KEY = "mogahed_v81_last_errors";
  var LAST_VALIDATION_KEY = "mogahed_v81_last_validation";
  var MAX_HISTORY = 30;
  var ARRAY_KEYS = ["knowledge","actions","projects","tasks","goals","reviews","decisions","contacts","finance","timeline","inbox","focusSessions","emergencySessions","archive"];
  var OBJECT_KEYS = ["profile","settings","stats"];
  var nativeSetItem = Storage.prototype.setItem;
  var nativeGetItem = Storage.prototype.getItem;
  var nativeRemoveItem = Storage.prototype.removeItem;

  function nowISO() { return new Date().toISOString(); }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function notify(msg) {
    try { if (window.MogahedOSX && typeof MogahedOSX.toast === "function") return MogahedOSX.toast(msg); } catch(e) {}
    try { if (typeof window.toast === "function") return window.toast(msg); } catch(e) {}
    
  }
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function bytesOf(v) {
    try { return new Blob([String(v || "")]).size; } catch(e) { return String(v || "").length; }
  }
  function formatBytes(bytes) {
    bytes = Number(bytes || 0);
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
  function readJSON(key, fallback) {
    try {
      var raw = nativeGetItem.call(localStorage, key);
      return raw ? JSON.parse(raw) : fallback;
    } catch(e) { return fallback; }
  }
  function writeRaw(key, value) {
    nativeSetItem.call(localStorage, key, value);
  }
  function logError(type, err, extra) {
    try {
      var list = readJSON(LAST_ERROR_KEY, []);
      list.unshift({ at: nowISO(), type: type, message: String(err && (err.message || err) || "unknown"), extra: extra || "" });
      list = list.slice(0, 20);
      writeRaw(LAST_ERROR_KEY, JSON.stringify(list));
    } catch(e) {}
  }
  function getState() {
    try {
      if (window.MogahedOSX && MogahedOSX.state && typeof MogahedOSX.state === "object") return MogahedOSX.state;
    } catch(e) {}
    try { if (window.state && typeof window.state === "object") return window.state; } catch(e) {}
    try { return JSON.parse(nativeGetItem.call(localStorage, KEY) || "{}"); } catch(e) { return {}; }
  }
  function ensureId(item, prefix) {
    if (!item || typeof item !== "object") return item;
    if (!item.id) item.id = prefix + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
    return item;
  }
  function normalizeState(obj) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) obj = {};
    obj.schemaVersion = 81;
    obj.appVersion = VERSION;
    obj.lastNormalizedAt = obj.lastNormalizedAt || nowISO();
    OBJECT_KEYS.forEach(function (k) {
      if (!obj[k] || typeof obj[k] !== "object" || Array.isArray(obj[k])) obj[k] = {};
    });
    if (!obj.profile.name) obj.profile.name = "مجاهد";
    if (!obj.settings) obj.settings = {};
    ARRAY_KEYS.forEach(function (k) {
      if (!Array.isArray(obj[k])) obj[k] = [];
      obj[k] = obj[k].filter(function (x) { return x && typeof x === "object" && !Array.isArray(x); })
                   .map(function (x) { return ensureId(x, k.slice(0, 3) || "row"); });
      var seenIds = Object.create(null);
      obj[k].forEach(function (x) {
        var id = String(x.id || "");
        if (!id || seenIds[id]) x.id = k.slice(0, 3) + "_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
        seenIds[String(x.id)] = true;
      });
    });
    ["knowledge","actions","projects","tasks","goals","reviews","decisions","contacts","finance","timeline","inbox"].forEach(function (k) {
      obj[k].forEach(function (x) {
        if (x.title != null && typeof x.title !== "string") x.title = String(x.title);
        if (x.status != null && typeof x.status !== "string") x.status = String(x.status);
        if (x.progress != null) {
          var n = Number(x.progress);
          if (!isFinite(n)) n = 0;
          x.progress = Math.max(0, Math.min(100, Math.round(n)));
        }
      });
    });
    return obj;
  }
  function validateState(obj) {
    var errors = [];
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) errors.push("state ليس Object صالح");
    ARRAY_KEYS.forEach(function (k) { if (!Array.isArray(obj && obj[k])) errors.push(k + " ليست Array"); });
    OBJECT_KEYS.forEach(function (k) { if (!obj || !obj[k] || typeof obj[k] !== "object" || Array.isArray(obj[k])) errors.push(k + " ليس Object صالح"); });
    ["knowledge","actions","projects","tasks","goals"].forEach(function (k) {
      var seen = Object.create(null);
      (obj && Array.isArray(obj[k]) ? obj[k] : []).forEach(function (x, i) {
        if (!x || typeof x !== "object") errors.push(k + " عنصر غير صالح عند " + i);
        else {
          if (!x.id) errors.push(k + " عنصر بدون id عند " + i);
          if (x.id && seen[x.id]) errors.push(k + " id مكرر: " + x.id);
          seen[x.id] = true;
        }
      });
    });
    return errors;
  }
  function mutateStateInPlace(target, source) {
    if (!target || typeof target !== "object") return source;
    Object.keys(target).forEach(function (k) { delete target[k]; });
    Object.keys(source).forEach(function (k) { target[k] = source[k]; });
    return target;
  }
  function normalizeCurrentState(saveBack) {
    try {
      var current = getState();
      var before = JSON.stringify(current || {});
      var normalized = normalizeState(current);
      var errors = validateState(normalized);
      if (errors.length) throw new Error(errors.join(" | "));
      if (window.MogahedOSX && MogahedOSX.state && MogahedOSX.state !== normalized) mutateStateInPlace(MogahedOSX.state, normalized);
      if (window.state && window.state !== normalized && typeof window.state === "object") mutateStateInPlace(window.state, normalized);
      var after = JSON.stringify(normalized);
      writeRaw(LAST_VALIDATION_KEY, JSON.stringify({ at: nowISO(), ok: true, errors: [] }));
      if (saveBack || before !== after) writeRaw(KEY, after);
      writeRaw(SAFE_BACKUP_KEY, after);
      return { ok: true, errors: [] };
    } catch(e) {
      logError("validation", e);
      try { writeRaw(LAST_VALIDATION_KEY, JSON.stringify({ at: nowISO(), ok: false, errors: [String(e.message || e)] })); } catch(_) {}
      return { ok: false, errors: [String(e.message || e)] };
    }
  }

  window.MogahedOSX_V81_sanitizeHTML = function (html) {
    try {
      var tpl = document.createElement("template");
      tpl.innerHTML = String(html == null ? "" : html);
      tpl.content.querySelectorAll("script, object").forEach(function (n) { n.remove(); });
      tpl.content.querySelectorAll("*").forEach(function (el) {
        Array.from(el.attributes).forEach(function (attr) {
          var name = attr.name.toLowerCase();
          var value = String(attr.value || "").trim().toLowerCase();
          if (name.indexOf("on") === 0) el.removeAttribute(attr.name);
          if ((name === "href" || name === "src" || name === "xlink:href") && value.indexOf("javascript:") === 0) el.removeAttribute(attr.name);
        });
      });
      return tpl.innerHTML;
    } catch(e) {
      logError("sanitize", e);
      return String(html == null ? "" : html).replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "");
    }
  };

  Storage.prototype.setItem = function (key, value) {
    if (String(key) === KEY) {
      try {
        var old = nativeGetItem.call(this, KEY);
        if (old) writeRaw(SAFE_BACKUP_KEY, old);
        var parsed = JSON.parse(String(value || "{}"));
        var normalized = normalizeState(parsed);
        var errors = validateState(normalized);
        if (errors.length) throw new Error(errors.join(" | "));
        normalized.lastSafeSaveAt = nowISO();
        writeRaw(LAST_VALIDATION_KEY, JSON.stringify({ at: nowISO(), ok: true, errors: [] }));
        return nativeSetItem.call(this, key, JSON.stringify(normalized));
      } catch(e) {
        logError("setItem:" + key, e);
        writeRaw(LAST_VALIDATION_KEY, JSON.stringify({ at: nowISO(), ok: false, errors: [String(e.message || e)] }));
        notify("تم منع حفظ بيانات غير صالحة. صدّر نسخة احتياطية الآن.");
        throw e;
      }
    }
    return nativeSetItem.apply(this, arguments);
  };

  function historyState() { return readJSON(HISTORY_KEY, { undo: [], redo: [] }); }
  function saveHistory(h) { try { writeRaw(HISTORY_KEY, JSON.stringify(h)); } catch(e) { logError("history-save", e); } }
  function currentRaw() { return nativeGetItem.call(localStorage, KEY) || JSON.stringify(normalizeState(getState())); }
  function pushHistory(reason) {
    try {
      var raw = currentRaw();
      var h = historyState();
      if (h.undo[0] && h.undo[0].raw === raw) return;
      h.undo.unshift({ at: nowISO(), reason: reason || "change", raw: raw });
      h.undo = h.undo.slice(0, MAX_HISTORY);
      h.redo = [];
      saveHistory(h);
    } catch(e) { logError("history-push", e); }
  }
  function applyRaw(raw, label) {
    try {
      var parsed = normalizeState(JSON.parse(raw || "{}"));
      var errors = validateState(parsed);
      if (errors.length) throw new Error(errors.join(" | "));
      var api = window.MogahedOSX || {};
      if (api.state && typeof api.state === "object") mutateStateInPlace(api.state, parsed);
      else api.state = parsed;
      if (window.state && typeof window.state === "object") mutateStateInPlace(window.state, parsed);
      else window.state = api.state || parsed;
      writeRaw(KEY, JSON.stringify(api.state || parsed));
      if (api.render) api.render();
      notify(label || "تم استرجاع الحالة");
      return true;
    } catch(e) { logError("history-apply", e); notify("تعذر تطبيق التراجع/الإعادة"); return false; }
  }
  function undo() {
    var h = historyState();
    if (!h.undo.length) return notify("لا توجد عملية يمكن التراجع عنها");
    var cur = currentRaw();
    var item = h.undo.shift();
    h.redo.unshift({ at: nowISO(), reason: "redo-point", raw: cur });
    saveHistory(h);
    applyRaw(item.raw, "تم التراجع عن آخر تعديل");
  }
  function redo() {
    var h = historyState();
    if (!h.redo.length) return notify("لا توجد عملية يمكن إعادتها");
    var cur = currentRaw();
    var item = h.redo.shift();
    h.undo.unshift({ at: nowISO(), reason: "undo-point", raw: cur });
    saveHistory(h);
    applyRaw(item.raw, "تمت إعادة التعديل");
  }
  function isMutatingAction(action) {
    return /(^save|^delete|^remove|^complete|^cycle|^archive|^restore|^reset|^clear|^import|^finish|^v\d+Save|^v\d+Delete|^v\d+Auto|^v\d+Import|save|delete|complete|archive|restore|reset|clear|finish)/i.test(String(action || ""));
  }
  document.addEventListener("click", function (e) {
    var b = e.target && e.target.closest && e.target.closest("[data-action]");
    if (!b) return;
    var action = b.dataset.action || "";
    if (isMutatingAction(action)) pushHistory(action);
  }, true);
  document.addEventListener("change", function (e) {
    var t = e.target;
    if (t && t.dataset && t.dataset.action && isMutatingAction(t.dataset.action)) pushHistory(t.dataset.action);
  }, true);
  document.addEventListener("keydown", function (e) {
    var tag = (e.target && e.target.tagName || "").toLowerCase();
    if (tag === "input" || tag === "textarea" || tag === "select" || e.target.isContentEditable) return;
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && String(e.key).toLowerCase() === "z") { e.preventDefault(); undo(); }
    if ((e.ctrlKey || e.metaKey) && (String(e.key).toLowerCase() === "y" || (e.shiftKey && String(e.key).toLowerCase() === "z"))) { e.preventDefault(); redo(); }
  });

  window.addEventListener("error", function (e) { logError("runtime", e.error || e.message, (e.filename || "") + ":" + (e.lineno || "")); });
  window.addEventListener("unhandledrejection", function (e) { logError("promise", e.reason || "Unhandled promise rejection"); });

  function healthSnapshot() {
    var raw = nativeGetItem.call(localStorage, KEY) || "";
    var state = getState();
    var validation = validateState(normalizeState(state));
    var h = historyState();
    var errors = readJSON(LAST_ERROR_KEY, []);
    var lastValidation = readJSON(LAST_VALIDATION_KEY, { ok: true, at: "" });
    var storageWarn = bytesOf(raw) > 4.2 * 1024 * 1024;
    return {
      bytes: bytesOf(raw),
      storageWarn: storageWarn,
      validationErrors: validation,
      undo: h.undo.length,
      redo: h.redo.length,
      errors: errors,
      lastValidation: lastValidation,
      counts: ARRAY_KEYS.reduce(function (acc, k) { acc[k] = Array.isArray(state[k]) ? state[k].length : 0; return acc; }, {})
    };
  }
  function miniPanelHTML() {
    var hs = healthSnapshot();
    var ok = !hs.validationErrors.length && !hs.storageWarn;
    return '<div class="card v81-stability-panel"><div class="space"><div><p class="eyebrow">V81 Stability</p><h2>تثبيت هندسي وحماية البيانات</h2><p class="muted">Validation + Undo/Redo + System Health + Render Coalescing + Modal Safety. بدون تغيير مميزات النظام.</p></div><span class="pill ' + (ok ? 'v81-ok' : 'v81-warn') + '">' + (ok ? 'مستقر' : 'يحتاج مراجعة') + '</span></div>' +
      '<div class="v81-health-grid"><div class="v81-health-card"><small>حجم البيانات</small><b>' + formatBytes(hs.bytes) + '</b></div><div class="v81-health-card"><small>Validation</small><b class="' + (hs.validationErrors.length ? 'v81-bad' : 'v81-ok') + '">' + (hs.validationErrors.length ? hs.validationErrors.length + ' أخطاء' : 'سليم') + '</b></div><div class="v81-health-card"><small>Undo / Redo</small><b>' + hs.undo + ' / ' + hs.redo + '</b></div><div class="v81-health-card"><small>آخر فحص</small><b>' + esc((hs.lastValidation && hs.lastValidation.at) || 'الآن') + '</b></div></div>' +
      '<div class="row" style="margin-top:12px"><button class="btn" data-action="v81SystemHealth">فتح System Health</button><button class="btn secondary" data-action="v81Undo">Undo</button><button class="btn secondary" data-action="v81Redo">Redo</button><button class="btn secondary" data-action="v81ValidateNow">فحص الآن</button></div></div>';
  }
  function fullHealthHTML() {
    var hs = healthSnapshot();
    var counts = hs.counts;
    var countHTML = ARRAY_KEYS.map(function (k) { return '<div class="v81-health-card"><small>' + esc(k) + '</small><b>' + Number(counts[k] || 0) + '</b></div>'; }).join('');
    var errText = hs.errors.length ? hs.errors.map(function (x) { return '[' + x.at + '] ' + x.type + ': ' + x.message + (x.extra ? ' — ' + x.extra : ''); }).join('\n') : 'لا توجد أخطاء Runtime مسجلة في V81.';
    var validationText = hs.validationErrors.length ? hs.validationErrors.map(esc).join('<br>') : '<span class="v81-ok">البيانات سليمة حسب فحص V81.</span>';
    return '<div class="card"><p class="eyebrow">System Health</p><h2>حالة النظام — V81 Stability</h2><p class="muted">هذه الصفحة لا تغير مميزات المشروع، لكنها تكشف مشاكل الحفظ، التخزين، والأخطاء الصامتة.</p>' +
      '<div class="v81-health-grid"><div class="v81-health-card"><small>حجم localStorage الأساسي</small><b>' + formatBytes(hs.bytes) + '</b></div><div class="v81-health-card"><small>حالة التخزين</small><b class="' + (hs.storageWarn ? 'v81-warn' : 'v81-ok') + '">' + (hs.storageWarn ? 'اقترب من الحد' : 'آمن') + '</b></div><div class="v81-health-card"><small>عمليات Undo</small><b>' + hs.undo + '</b></div><div class="v81-health-card"><small>عمليات Redo</small><b>' + hs.redo + '</b></div></div>' +
      '<h3 style="margin-top:16px">فحص البيانات</h3><div class="item">' + validationText + '</div>' +
      '<h3 style="margin-top:16px">أعداد الجداول الأساسية</h3><div class="v81-health-grid">' + countHTML + '</div>' +
      '<h3 style="margin-top:16px">آخر أخطاء مسجلة</h3><div class="v81-log">' + esc(errText) + '</div>' +
      '<div class="row" style="margin-top:14px"><button class="btn" data-action="v81ValidateNow">فحص وإصلاح الآن</button><button class="btn secondary" data-action="v81Undo">Undo</button><button class="btn secondary" data-action="v81Redo">Redo</button><button class="btn secondary" data-action="v81ExportDiagnostics">تصدير تقرير</button></div></div>';
  }
  function openHealth() {
    try {
      var api = window.MogahedOSX || {};
      if (typeof window.openModal === "function") return window.openModal("V81 System Health", fullHealthHTML());
      if (api.Actions && typeof api.Actions.openModal === "function") return api.Actions.openModal("V81 System Health", fullHealthHTML());
    } catch(e) { logError("open-health", e); }
  }
  function download(name, text) {
    var blob = new Blob([text], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }
  function exportDiagnostics() {
    var report = { version: VERSION, exportedAt: nowISO(), health: healthSnapshot(), validation: validateState(normalizeState(getState())) };
    download("Mogahed_OS_V81_System_Health_" + todayISO() + ".json", JSON.stringify(report, null, 2));
    notify("تم تصدير تقرير System Health");
  }
  function injectPanel() {
    try {
      var api = window.MogahedOSX || {};
      var route = api.getRoute ? api.getRoute() : "";
      var view = document.getElementById("view");
      if (!view) return;
      if ((route === "settings" || route === "home") && !view.querySelector(".v81-stability-panel")) {
        view.insertAdjacentHTML(route === "settings" ? "afterbegin" : "beforeend", miniPanelHTML());
      }
    } catch(e) { logError("inject-panel", e); }
  }
  function wireActions() {
    var api = window.MogahedOSX || {};
    if (!api.Actions) return;
    api.Actions.v81SystemHealth = openHealth;
    api.Actions.v81Undo = undo;
    api.Actions.v81Redo = redo;
    api.Actions.v81ValidateNow = function () {
      var res = normalizeCurrentState(true);
      notify(res.ok ? "تم فحص وإصلاح البيانات بنجاح" : "يوجد خطأ في البيانات — افتح System Health");
      if (api.render) api.render();
    };
    api.Actions.v81ExportDiagnostics = exportDiagnostics;
  }
  function wrapRenderForPanel() {
    var api = window.MogahedOSX || {};
    if (!api.render || api.render.__v81PanelWrapped) return;
    var old = api.render;
    var wrapped = function () {
      var res = old.apply(this, arguments);
      setTimeout(injectPanel, 90);
      setTimeout(injectPanel, 260);
      return res;
    };
    wrapped.__v81PanelWrapped = true;
    api.render = wrapped;
    try { window.render = wrapped; } catch(e) {}
  }

  window.MogahedOSX_V81 = {
    version: VERSION,
    normalizeState: normalizeState,
    validateState: validateState,
    normalizeCurrentState: normalizeCurrentState,
    pushHistory: pushHistory,
    undo: undo,
    redo: redo,
    healthSnapshot: healthSnapshot,
    openHealth: openHealth
  };

  try { normalizeCurrentState(false); } catch(e) { logError("boot-normalize", e); }
  wireActions();
  wrapRenderForPanel();
  window.addEventListener("mogahed:v81:rendered", function () { setTimeout(injectPanel, 40); });
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { wireActions(); wrapRenderForPanel(); setTimeout(injectPanel, 350); });
  } else {
    setTimeout(function () { wireActions(); wrapRenderForPanel(); injectPanel(); }, 350);
  }
})();