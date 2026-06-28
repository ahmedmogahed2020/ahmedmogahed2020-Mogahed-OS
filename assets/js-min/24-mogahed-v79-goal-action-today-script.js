(function () {
  "use strict";
  if (window.__MOGAHED_V79_GOAL_ACTION_TODAY__) return;
  window.__MOGAHED_V79_GOAL_ACTION_TODAY__ = true;

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
  function list(k) {
    var s = st();
    if (!Array.isArray(s[k])) s[k] = [];
    return s[k];
  }
  function active(k) {
    return list(k).filter(function (x) { return !x.archived && !x.deleted; });
  }
  function uid() {
    try { if (typeof window.uid === "function") return window.uid(); } catch(e) {}
    try { if (typeof uid === "function") return uid(); } catch(e) {}
    return "v79_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  }
  function saveApp() {
    try { if (typeof save === "function") save(); } catch(e) {}
    try { if (window.MogahedOSX && typeof MogahedOSX.save === "function") MogahedOSX.save(); } catch(e) {}
  }
  function renderApp() {
    try { if (window.MogahedOSX && typeof MogahedOSX.render === "function") { MogahedOSX.render(); return; } } catch(e) {}
    try { if (typeof render === "function") render(); } catch(e) {}
  }
  function toast(msg) {
    try { if (typeof window.toast === "function") return window.toast(msg); } catch(e) {}
    try { if (typeof toast === "function") return toast(msg); } catch(e) {}
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
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function daysFromNow(n) {
    var d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString().slice(0, 10);
  }
  function isDone(x) {
    return x.status === "done" || x.status === "مكتمل" || x.done === true;
  }
  function goalStatus(g) {
    var p = Number(g.progress || 0);
    if (p >= 100) return "مكتمل";
    var end = g.endDate || g.deadline || "";
    if (end && end < todayISO()) return "متأخر";
    return g.status || "شغال";
  }
  function pctKnowledge(k) {
    var total = Number(k.totalUnits || k.totalPages || k.totalMinutes || 0);
    var done = Number(k.currentUnit || k.currentPage || k.currentMinute || 0);
    if (total > 0) return Math.max(0, Math.min(100, Math.round(done / total * 100)));
    if (k.status === "done" || k.finished) return 100;
    return Math.max(0, Math.min(100, Number(k.progress || 0)));
  }
  function currentRoute() {
    var a = document.querySelector("#nav button.active[data-route]");
    if (a) return a.dataset.route;
    try { if (typeof window.route === "string") return window.route; } catch(e) {}
    try { if (window.MogahedOSX && typeof MogahedOSX.route === "string") return MogahedOSX.route; } catch(e) {}
    return "";
  }
  function goalById(id) {
    return active("goals").find(function (g) { return String(g.id) === String(id); });
  }
  function goalOptions(selected) {
    var goals = active("goals");
    if (!goals.length) return '<option value="">لا توجد أهداف بعد</option>';
    return '<option value="">بدون ربط</option>' + goals.map(function (g) {
      return '<option value="' + esc(g.id) + '" ' + (String(selected || "") === String(g.id) ? "selected" : "") + '>' + esc(g.title || "هدف") + '</option>';
    }).join("");
  }
  function goalSelectHTML(id, selected) {
    return '<label>ربط بهدف</label><select id="' + id + '">' + goalOptions(selected) + '</select>';
  }

  function addLinkedAction(goalId) {
    var g = goalById(goalId);
    openM("إجراء اليوم المرتبط بالهدف",
      '<label>الإجراء</label><input id="v79_action_title" value="' + esc(g ? "طبّق خطوة في: " + (g.title || "") : "") + '">' +
      goalSelectHTML("v79_action_goal", goalId) +
      '<label>ملاحظة / السبب</label><textarea id="v79_action_reason"></textarea>' +
      '<button class="btn" data-action="v79SaveLinkedAction">حفظ الإجراء</button>'
    );
  }
  function saveLinkedAction() {
    var title = val("v79_action_title").trim();
    if (!title) { toast("اكتب اسم الإجراء"); return; }
    list("actions").unshift({
      id: uid(),
      title: title,
      goalId: val("v79_action_goal"),
      area: goalById(val("v79_action_goal"))?.area || "",
      reason: val("v79_action_reason"),
      status: "todo",
      createdAt: new Date().toISOString(),
      todayPlan: todayISO()
    });
    saveApp(); closeM(); renderApp(); toast("تم ربط الإجراء بالهدف");
  }
  function addLinkedTask(goalId) {
    var g = goalById(goalId);
    openM("مهمة الأسبوع المرتبطة بالهدف",
      '<label>المهمة</label><input id="v79_task_title" value="' + esc(g ? "خطوة أسبوعية: " + (g.title || "") : "") + '">' +
      goalSelectHTML("v79_task_goal", goalId) +
      '<div class="v77-goal-form-grid"><div><label>التاريخ</label><input id="v79_task_date" type="date" value="' + daysFromNow(1) + '"></div><div><label>الوقت</label><input id="v79_task_time" type="time" value="09:00"></div></div>' +
      '<label>ملاحظة</label><textarea id="v79_task_note"></textarea>' +
      '<button class="btn" data-action="v79SaveLinkedTask">حفظ المهمة</button>'
    );
  }
  function saveLinkedTask() {
    var title = val("v79_task_title").trim();
    if (!title) { toast("اكتب اسم المهمة"); return; }
    var date = val("v79_task_date") || todayISO();
    var time = val("v79_task_time") || "09:00";
    list("tasks").unshift({
      id: uid(),
      title: title,
      project: goalById(val("v79_task_goal"))?.title || "",
      goalId: val("v79_task_goal"),
      note: val("v79_task_note"),
      dueAt: date + "T" + time + ":00",
      status: "todo",
      createdAt: new Date().toISOString(),
      weekPlan: true
    });
    saveApp(); closeM(); renderApp(); toast("تم ربط المهمة بالهدف");
  }
  function addGoalReview(goalId) {
    var g = goalById(goalId);
    openM("مراجعة تقدم الهدف",
      '<label>عملت إيه؟</label><textarea id="v79_rev_done"></textarea>' +
      '<label>إيه اللي عطلك أو ضيع وقتك؟</label><textarea id="v79_rev_waste"></textarea>' +
      '<label>إيه أهم خطوة بكرة؟</label><textarea id="v79_rev_tomorrow"></textarea>' +
      '<input id="v79_rev_goal" type="hidden" value="' + esc(goalId || "") + '">' +
      '<button class="btn" data-action="v79SaveGoalReview">حفظ المراجعة</button>'
    );
  }
  function saveGoalReview() {
    var goalId = val("v79_rev_goal");
    var g = goalById(goalId);
    list("reviews").unshift({
      id: uid(),
      title: g ? "مراجعة تقدم: " + (g.title || "هدف") : "مراجعة يومية",
      date: todayISO(),
      goalId: goalId,
      done: val("v79_rev_done"),
      wasted: val("v79_rev_waste"),
      tomorrow: val("v79_rev_tomorrow"),
      learned: val("v79_rev_waste")
    });
    saveApp(); closeM(); renderApp(); toast("تم حفظ المراجعة");
  }
  function dailyReview() {
    openM("مراجعة اليوم",
      '<label>عملت إيه؟</label><textarea id="v79_daily_done"></textarea>' +
      '<label>إيه اللي ضيع وقتك؟</label><textarea id="v79_daily_waste"></textarea>' +
      '<label>إيه أهم حاجة بكرة؟</label><textarea id="v79_daily_tomorrow"></textarea>' +
      '<button class="btn" data-action="v79SaveDailyReview">حفظ مراجعة اليوم</button>'
    );
  }
  function saveDailyReview() {
    list("reviews").unshift({
      id: uid(),
      title: "مراجعة اليوم",
      date: todayISO(),
      done: val("v79_daily_done"),
      wasted: val("v79_daily_waste"),
      tomorrow: val("v79_daily_tomorrow"),
      learned: val("v79_daily_waste"),
      daily: true
    });
    saveApp(); closeM(); renderApp(); toast("تم حفظ مراجعة اليوم");
  }
  function finishToday() {
    openM("أنهيت اليوم",
      '<p class="muted">إغلاق بسيط لليوم: سجل أهم إنجاز وأهم حاجة بكرة.</p>' +
      '<label>أفضل إنجاز اليوم</label><textarea id="v79_finish_done"></textarea>' +
      '<label>أهم شيء بكرة</label><textarea id="v79_finish_tomorrow"></textarea>' +
      '<button class="btn" data-action="v79SaveFinishToday">حفظ وإنهاء اليوم</button>'
    );
  }
  function saveFinishToday() {
    list("reviews").unshift({
      id: uid(),
      title: "إغلاق اليوم",
      date: todayISO(),
      done: val("v79_finish_done"),
      tomorrow: val("v79_finish_tomorrow"),
      dailyClose: true
    });
    saveApp(); closeM(); renderApp(); toast("تم إنهاء اليوم");
  }

  function linkedForGoal(goalId) {
    var actions = active("actions").filter(function (a) { return String(a.goalId || "") === String(goalId); });
    var tasks = active("tasks").filter(function (t) { return String(t.goalId || "") === String(goalId); });
    var reviews = (Array.isArray(st().reviews) ? st().reviews : []).filter(function (r) { return String(r.goalId || "") === String(goalId); });
    return { actions: actions, tasks: tasks, reviews: reviews };
  }
  function injectGoalLinks() {
    if (currentRoute() !== "goals") return;
    document.querySelectorAll(".v77-goal-card").forEach(function (card) {
      if (card.querySelector(".v79-goal-links")) return;
      var edit = card.querySelector('[data-action="editGoal"][data-id]');
      if (!edit) return;
      var gid = edit.dataset.id;
      var linked = linkedForGoal(gid);
      function lis(items, empty) {
        return items.slice(0, 3).map(function (x) { return "<li>" + esc(x.title || x.done || x.tomorrow || "عنصر") + "</li>"; }).join("") || "<li>" + empty + "</li>";
      }
      card.insertAdjacentHTML("beforeend",
        '<div class="v79-goal-links">' +
          '<div class="v79-section-head"><div><h3>تحويل الهدف لفعل</h3><p>إجراءات اليوم + مهام الأسبوع + مراجعة التقدم لهذا الهدف.</p></div><span class="pill">مرتبط</span></div>' +
          '<div class="v79-link-cols">' +
            '<div class="v79-link-box"><h5>إجراءات اليوم</h5><ul>' + lis(linked.actions, "لا توجد إجراءات") + '</ul></div>' +
            '<div class="v79-link-box"><h5>مهام الأسبوع</h5><ul>' + lis(linked.tasks, "لا توجد مهام") + '</ul></div>' +
            '<div class="v79-link-box"><h5>مراجعة التقدم</h5><ul>' + lis(linked.reviews, "لا توجد مراجعات") + '</ul></div>' +
          '</div>' +
          '<div class="v79-link-actions">' +
            '<button class="btn mini" data-action="v79AddGoalAction" data-goal-id="' + esc(gid) + '">+ إجراء اليوم</button>' +
            '<button class="btn secondary mini" data-action="v79AddGoalTask" data-goal-id="' + esc(gid) + '">+ مهمة الأسبوع</button>' +
            '<button class="btn secondary mini" data-action="v79ReviewGoal" data-goal-id="' + esc(gid) + '">مراجعة التقدم</button>' +
          '</div>' +
        '</div>'
      );
    });
  }

  function row(icon, title, sub, action, id, label) {
    return '<div class="v79-mini-row"><div class="v79-mini-icon">' + icon + '</div><div><b>' + esc(title) + '</b><small>' + esc(sub || "") + '</small></div>' +
      (action ? '<button class="btn secondary mini" data-action="' + action + '" data-id="' + esc(id || "") + '">' + (label || "فتح") + '</button>' : '<span class="pill">اليوم</span>') + '</div>';
  }
  function todayOnlyHTML() {
    var goals = active("goals");
    var todayGoal = goals.find(function (g) { return (g.period || g.type) === "يومي" && goalStatus(g) !== "مكتمل"; }) ||
      goals.find(function (g) { return goalStatus(g) !== "مكتمل"; });
    var tasks = active("tasks").filter(function (t) { return !isDone(t); }).slice(0, 3);
    var actions = active("actions").filter(function (a) { return !isDone(a); }).slice(0, 3);
    var k = active("knowledge").find(function (x) { return pctKnowledge(x) > 0 && pctKnowledge(x) < 100; }) ||
      active("knowledge").find(function (x) { return pctKnowledge(x) < 100; });
    return '<div class="card v79-today-only"><div class="v79-today-head"><div><p class="eyebrow">Today Only</p><h2>خطة اليوم فقط</h2><p>3 مهام رئيسية + هدف اليوم + جلسة تركيز + معرفة واحدة. لا تفتح كل النظام… افتح المطلوب الآن.</p></div><button class="btn" data-action="v79FinishToday">أنهيت اليوم</button></div>' +
      '<div class="v79-today-grid"><div class="card"><div class="v79-section-head"><div><h3>المطلوب اليوم</h3><p>أهم 3 مهام أو إجراءات.</p></div><button class="btn secondary mini" data-action="addTask">+ مهمة</button></div><div class="v79-mini-list">' +
        ((tasks.length ? tasks.map(function (t) { return row("✅", t.title || "مهمة", t.project || t.dueAt || "مهمة", "v69EditTask", t.id, "تعديل"); }) : actions.map(function (a) { return row("⚡", a.title || "إجراء", a.reason || a.area || "إجراء", "editAction", a.id, "تعديل"); })).join("") ||
        '<div class="v79-mini-row"><div class="v79-mini-icon">✅</div><div><b>لا توجد مهام</b><small>أضف مهمة واحدة فقط تبدأ بها.</small></div><button class="btn secondary mini" data-action="addTask">إضافة</button></div>') +
      '</div></div><div class="card"><div class="v79-section-head"><div><h3>هدف + تركيز + معرفة</h3><p>المسار المختصر لليوم.</p></div><button class="btn secondary mini" data-action="v79DailyReview">مراجعة</button></div><div class="v79-mini-list">' +
        row("🎯", todayGoal ? todayGoal.title : "أضف هدف اليوم", todayGoal ? ((todayGoal.period || "هدف") + " • " + (todayGoal.progress || 0) + "%") : "لا يوجد هدف محدد", todayGoal ? "editGoal" : "addGoal", todayGoal ? todayGoal.id : "", todayGoal ? "تعديل" : "إضافة") +
        row("⏳", "جلسة تركيز", "ابدأ بجلسة واحدة قصيرة", "openFocus", "", "ابدأ") +
        (k ? row("🧠", k.title || "معرفة", (k.type || "معرفة") + " • " + pctKnowledge(k) + "%", "openKnowledgePlayer", k.id, "استكمال") : row("🧠", "أضف محتوى معرفة واحد", "كتاب / فيديو / بودكاست", "addKnowledge", "", "إضافة")) +
      '</div></div></div></div>';
  }

  function injectTodayOnly() {
    if (currentRoute() !== "home") return;
    var view = $("view");
    if (!view || view.querySelector(".v79-today-only")) return;
    view.insertAdjacentHTML("afterbegin", todayOnlyHTML());
  }
  function injectDashboardSummary() {
    if (currentRoute() !== "dashboard") return;
    var view = $("view");
    if (!view || view.querySelector(".v79-dashboard-insert")) return;
    var late = active("goals").filter(function (g) { return goalStatus(g) === "متأخر"; }).length;
    var reviews = Array.isArray(st().reviews) ? st().reviews : [];
    var warning = late ? "عندك " + late + " أهداف متأخرة تحتاج مراجعة." : "لا توجد أهداف متأخرة الآن.";
    view.insertAdjacentHTML("afterbegin",
      '<div class="card v79-dashboard-insert ' + (late ? "v79-warning-card" : "") + '"><div class="v79-section-head"><div><h3>Dashboard عملي</h3><p>هدف اليوم • أهم إجراء • أهداف متأخرة • معرفة تحتاج متابعة • آخر مراجعة.</p></div><span class="pill">' + esc(warning) + '</span></div></div>'
    );
  }

  function runInjections() {
    injectTodayOnly();
    injectGoalLinks();
    injectDashboardSummary();
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest("[data-action]");
    if (!b) return;
    var a = b.dataset.action;
    if (a === "v79AddGoalAction") { addLinkedAction(b.dataset.goalId); }
    if (a === "v79AddGoalTask") { addLinkedTask(b.dataset.goalId); }
    if (a === "v79ReviewGoal") { addGoalReview(b.dataset.goalId); }
    if (a === "v79SaveLinkedAction") { saveLinkedAction(); }
    if (a === "v79SaveLinkedTask") { saveLinkedTask(); }
    if (a === "v79SaveGoalReview") { saveGoalReview(); }
    if (a === "v79DailyReview") { dailyReview(); }
    if (a === "v79SaveDailyReview") { saveDailyReview(); }
    if (a === "v79FinishToday") { finishToday(); }
    if (a === "v79SaveFinishToday") { saveFinishToday(); }
  }, true);

  var oldRender = window.MogahedOSX && window.MogahedOSX.render;
  if (typeof oldRender === "function" && !oldRender.__v79GoalTodayWrapped) {
    var wrapped = function () {
      var r = oldRender.apply(this, arguments);
      setTimeout(runInjections, 80);
      setTimeout(runInjections, 240);
      return r;
    };
    wrapped.__v79GoalTodayWrapped = true;
    window.MogahedOSX.render = wrapped;
    try { window.render = wrapped; } catch(e) {}
  }

  if (typeof Actions !== "undefined") {
    var originalDaily = Actions.dailyReflection;
    Actions.v79DailyReview = dailyReview;
    Actions.v79FinishToday = finishToday;
    if (!originalDaily || !originalDaily.__v79DailyWrapped) {
      Actions.dailyReflection = dailyReview;
      Actions.dailyReflection.__v79DailyWrapped = true;
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      setTimeout(runInjections, 250);
    });
  } else {
    setTimeout(runInjections, 250);
  }
})();