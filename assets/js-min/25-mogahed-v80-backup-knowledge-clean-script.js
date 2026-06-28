(function () {
  "use strict";
  if (window.__MOGAHED_V80_BACKUP_KNOWLEDGE_CLEAN__) return;
  window.__MOGAHED_V80_BACKUP_KNOWLEDGE_CLEAN__ = true;

  var KEY = "mogahed_os_x_v1";

  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function st() {
    try { return window.state || (window.MogahedOSX && MogahedOSX.state) || {}; }
    catch(e) { return {}; }
  }
  function arr(k) {
    var s = st();
    if (!Array.isArray(s[k])) s[k] = [];
    return s[k];
  }
  function active(k) {
    return arr(k).filter(function (x) { return !x.archived && x.status !== "archived" && !x.deleted; });
  }
  function uid() {
    return "v80_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function nowISO() { return new Date().toISOString(); }
  function saveApp() {
    try {
      localStorage.setItem(KEY, JSON.stringify(st()));
    } catch(e) {
      notify("التخزين ممتلئ أو محظور. صدّر نسخة JSON الآن.");
    }
  }
  function renderApp() {
    try { if (window.MogahedOSX && typeof MogahedOSX.render === "function") { MogahedOSX.render(); return; } } catch(e) {}
    try { if (typeof render === "function") render(); } catch(e) {}
  }
  function notify(msg) {
    try { if (typeof window.toast === "function") return window.toast(msg); } catch(e) {}
    var t = document.createElement("div");
    t.className = "toast";
    t.textContent = msg;
    t.style.display = "block";
    document.body.appendChild(t);
    setTimeout(function(){ t.remove(); }, 2500);
  }
  function openM(title, body) {
    try { if (typeof window.openModal === "function") return window.openModal(title, body); } catch(e) {}
    try { if (typeof openModal === "function") return openModal(title, body); } catch(e) {}
  }
  function closeM() {
    try { if (typeof closeModal === "function") closeModal(); } catch(e) {}
  }
  function val(id) {
    var el = $(id);
    return el ? el.value : "";
  }
  function currentRoute() {
    var a = document.querySelector("#nav button.active[data-route]");
    if (a) return a.dataset.route;
    try { if (typeof window.route === "string") return window.route; } catch(e) {}
    return "";
  }
  function fileName() {
    return "Mogahed_OS_Backup_" + todayISO() + ".json";
  }
  function storageBytes() {
    var raw = localStorage.getItem(KEY) || JSON.stringify(st() || {});
    return new Blob([raw]).size;
  }
  function formatBytes(bytes) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " KB";
    return (bytes / 1024 / 1024).toFixed(2) + " MB";
  }
  function buildBackupData() {
    var data = JSON.parse(JSON.stringify(st() || {}));
    data.__backupMeta = {
      app: "Mogahed OS",
      version: "V80",
      exportedAt: nowISO(),
      fileName: fileName()
    };
    return data;
  }
  function downloadJSON(data, name) {
    var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = name || fileName();
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 800);
  }
  function exportBackup() {
    downloadJSON(buildBackupData(), fileName());
    notify("تم تصدير نسخة JSON بتاريخ اليوم");
  }
  function autoBackup() {
    try {
      var data = buildBackupData();
      localStorage.setItem("mogahed_os_last_backup_json", JSON.stringify(data));
      localStorage.setItem("mogahed_os_last_backup_date", todayISO());
      notify("تم حفظ نسخة احتياطية داخل المتصفح");
    } catch(e) {
      notify("التخزين ممتلئ. استخدم تصدير JSON");
    }
  }
  function importBackupFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function () {
      try {
        var data = JSON.parse(String(reader.result || "{}"));
        delete data.__backupMeta;
        if (!data || typeof data !== "object") throw new Error("bad");
        window.state = data;
        localStorage.setItem(KEY, JSON.stringify(data));
        closeM();
        renderApp();
        notify("تم استيراد النسخة بنجاح");
      } catch(e) {
        notify("ملف النسخة غير صالح");
      }
    };
    reader.readAsText(file, "utf-8");
  }
  function openImport() {
    var input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.className = "v80-input-file";
    input.onchange = function () { importBackupFile(input.files && input.files[0]); };
    document.body.appendChild(input);
    input.click();
    setTimeout(function () { input.remove(); }, 5000);
  }
  function backupPanelHTML() {
    var bytes = storageBytes();
    var kb = Math.round(bytes / 1024);
    var warning = bytes > 4.2 * 1024 * 1024;
    return '<div class="card v80-backup-panel"><div class="v80-head"><div><p class="eyebrow">Backup & Safety</p><h2>حفظ ونسخ احتياطي آمن</h2><p>صدّر بياناتك كملف JSON، استورد نسخة قديمة، أو احفظ نسخة احتياطية بتاريخ اليوم داخل المتصفح.</p></div><div class="v80-actions"><button class="btn" data-action="v80ExportBackup">تصدير JSON</button><button class="btn secondary" data-action="v80ImportBackup">استيراد</button><button class="btn secondary" data-action="v80AutoBackup">نسخة بتاريخ اليوم</button></div></div><div class="v80-backup-grid"><div class="v80-backup-stat"><small>حجم البيانات</small><b>' + formatBytes(bytes) + '</b></div><div class="v80-backup-stat"><small>الأهداف</small><b>' + active("goals").length + '</b></div><div class="v80-backup-stat"><small>المعرفة</small><b>' + active("knowledge").length + '</b></div><div class="v80-backup-stat"><small>آخر نسخة</small><b>' + esc(localStorage.getItem("mogahed_os_last_backup_date") || "لا يوجد") + '</b></div></div><div class="v80-storage-warn" style="display:' + (warning ? "block" : "none") + '">⚠️ حجم التخزين كبير. صدّر نسخة JSON الآن، وقلل الملفات المحلية الكبيرة إذا ظهرت مشاكل حفظ.</div></div>';
  }

  function goalOptions() {
    var goals = active("goals");
    return '<option value="">بدون ربط</option>' + goals.map(function (g) {
      return '<option value="' + esc(g.id) + '">' + esc(g.title || "هدف") + '</option>';
    }).join("");
  }
  function getKnowledge(id) {
    return active("knowledge").find(function (x) { return String(x.id) === String(id); });
  }
  function convertKnowledge(kind, id) {
    var k = getKnowledge(id);
    if (!k) { notify("المحتوى غير موجود"); return; }
    var titleMap = {
      idea: "حوّل المعرفة لفكرة",
      task: "حوّل المعرفة لمهمة",
      goal: "حوّل المعرفة لهدف",
      action: "حوّل المعرفة لإجراء"
    };
    var fieldLabel = kind === "idea" ? "الفكرة" : kind === "task" ? "المهمة" : kind === "goal" ? "الهدف" : "الإجراء";
    var defaultTitle = (kind === "idea" ? "فكرة من: " : kind === "task" ? "مهمة من: " : kind === "goal" ? "هدف من: " : "طبّق: ") + (k.title || "");
    openM(titleMap[kind],
      '<label>' + fieldLabel + '</label><input id="v80_conv_title" value="' + esc(defaultTitle) + '">' +
      (kind !== "goal" ? '<label>ربط بهدف</label><select id="v80_conv_goal">' + goalOptions() + '</select>' : '') +
      '<label>ملاحظة / سبب</label><textarea id="v80_conv_note">' + esc(k.application || k.ideas || k.summary || "") + '</textarea>' +
      '<input type="hidden" id="v80_conv_kind" value="' + esc(kind) + '"><input type="hidden" id="v80_conv_source" value="' + esc(id) + '">' +
      '<button class="btn" data-action="v80SaveKnowledgeConversion">حفظ التحويل</button>'
    );
  }
  function saveKnowledgeConversion() {
    var kind = val("v80_conv_kind");
    var sourceId = val("v80_conv_source");
    var k = getKnowledge(sourceId);
    var title = val("v80_conv_title").trim();
    var note = val("v80_conv_note");
    if (!title) { notify("اكتب العنوان"); return; }
    if (kind === "idea") {
      arr("inbox").unshift({ id: uid(), text: title + (note ? "\n" + note : ""), title: title, note: note, sourceId: sourceId, createdAt: nowISO() });
    } else if (kind === "task") {
      arr("tasks").unshift({ id: uid(), title: title, project: k ? k.title : "", goalId: val("v80_conv_goal"), sourceId: sourceId, note: note, status: "todo", createdAt: nowISO() });
    } else if (kind === "goal") {
      arr("goals").unshift({ id: uid(), title: title, area: k ? (k.area || "") : "", period: "أسبوعي", startDate: todayISO(), endDate: todayISO(), status: "شغال", progress: 0, why: note, sourceId: sourceId });
    } else {
      arr("actions").unshift({ id: uid(), title: title, area: k ? (k.area || "") : "", goalId: val("v80_conv_goal"), reason: note, sourceId: sourceId, status: "todo", createdAt: nowISO() });
    }
    saveApp();
    closeM();
    renderApp();
    notify("تم تحويل المعرفة إلى " + (kind === "idea" ? "فكرة" : kind === "task" ? "مهمة" : kind === "goal" ? "هدف" : "إجراء"));
  }
  function injectKnowledgeActions() {
    if (currentRoute() !== "knowledge") return;
    document.querySelectorAll(".knowledge-card").forEach(function (card) {
      if (card.querySelector(".v80-k-actions")) return;
      var anyBtn = card.querySelector('[data-action="editKnowledge"][data-id], [data-action="openKnowledgePlayer"][data-id]');
      if (!anyBtn) return;
      var id = anyBtn.dataset.id;
      var more = card.querySelector(".knowledge-more") || card.querySelector(".knowledge-main");
      if (!more) return;
      more.insertAdjacentHTML("beforeend",
        '<div class="v80-k-actions">' +
          '<button class="btn secondary mini" data-action="v80KnowledgeToIdea" data-id="' + esc(id) + '">💡 حوّل لفكرة</button>' +
          '<button class="btn secondary mini" data-action="v80KnowledgeToTask" data-id="' + esc(id) + '">✅ حوّل لمهمة</button>' +
          '<button class="btn secondary mini" data-action="v80KnowledgeToGoal" data-id="' + esc(id) + '">🎯 حوّل لهدف</button>' +
          '<button class="btn secondary mini" data-action="v80KnowledgeToAction" data-id="' + esc(id) + '">⚡ حوّل لإجراء</button>' +
        '</div>'
      );
    });
  }
  function cleanPanelHTML() {
    return '<div class="card v80-clean-panel"><div class="v80-head"><div><p class="eyebrow">Clean UX</p><h2>الرئيسية مركز القيادة</h2><p>بدون إضافة صفحات جديدة: المطلوب اليوم فوق، المعرفة تتحول لفعل، والحفظ واضح دائمًا.</p></div><div class="v80-actions"><button class="btn" data-route="dashboard">افتح Dashboard</button><button class="btn secondary" data-action="v80ExportBackup">نسخة أمان</button></div></div><div class="v80-clean-grid"><div class="v80-clean-item"><b>1. اليوم فقط</b><small>ابدأ من خطة اليوم ولا تفتح كل النظام.</small></div><div class="v80-clean-item"><b>2. معرفة ← فعل</b><small>كل كتاب أو فيديو يتحول لفكرة أو مهمة أو هدف أو إجراء.</small></div><div class="v80-clean-item"><b>3. حماية البيانات</b><small>صدّر JSON بانتظام قبل أي تطوير جديد.</small></div></div></div>';
  }
  function injectBackupPanel() {
    var route = currentRoute();
    var view = $("view");
    if (!view) return;
    if ((route === "settings" || route === "home") && !view.querySelector(".v80-backup-panel")) {
      view.insertAdjacentHTML(route === "settings" ? "afterbegin" : "beforeend", backupPanelHTML());
    }
    if (route === "home" && !view.querySelector(".v80-clean-panel")) {
      view.insertAdjacentHTML("afterbegin", cleanPanelHTML());
    }
  }
  function run() {
    injectBackupPanel();
    injectKnowledgeActions();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b) return;
    var a = b.dataset.action;
    if (a === "v80ExportBackup") exportBackup();
    if (a === "v80ImportBackup") openImport();
    if (a === "v80AutoBackup") autoBackup();
    if (a === "v80KnowledgeToIdea") convertKnowledge("idea", b.dataset.id);
    if (a === "v80KnowledgeToTask") convertKnowledge("task", b.dataset.id);
    if (a === "v80KnowledgeToGoal") convertKnowledge("goal", b.dataset.id);
    if (a === "v80KnowledgeToAction") convertKnowledge("action", b.dataset.id);
    if (a === "v80SaveKnowledgeConversion") saveKnowledgeConversion();
  }, true);

  var oldRender = window.MogahedOSX && window.MogahedOSX.render;
  if (typeof oldRender === "function" && !oldRender.__v80BackupKnowledgeWrapped) {
    var wrapped = function () {
      var res = oldRender.apply(this, arguments);
      setTimeout(run, 80);
      setTimeout(run, 260);
      return res;
    };
    wrapped.__v80BackupKnowledgeWrapped = true;
    window.MogahedOSX.render = wrapped;
    try { window.render = wrapped; } catch(e) {}
  }

  window.addEventListener("beforeunload", function () {
    try { localStorage.setItem("mogahed_os_last_safe_save", nowISO()); } catch(e) {}
  });

  try {
    var last = localStorage.getItem("mogahed_os_last_backup_date");
    if (last !== todayISO() && storageBytes() < 4.2 * 1024 * 1024) {
      localStorage.setItem("mogahed_os_last_backup_json", JSON.stringify(buildBackupData()));
      localStorage.setItem("mogahed_os_last_backup_date", todayISO());
    }
  } catch(e) {}

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { setTimeout(run, 250); });
  } else {
    setTimeout(run, 250);
  }
})();