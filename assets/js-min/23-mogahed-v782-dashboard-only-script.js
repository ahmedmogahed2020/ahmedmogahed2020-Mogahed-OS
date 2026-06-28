(function () {
  "use strict";
  if (window.__MOGAHED_V782_DASHBOARD_ONLY__) return;
  window.__MOGAHED_V782_DASHBOARD_ONLY__ = true;

  var dashboardMode = false;

  function $(id) { return document.getElementById(id); }
  function esc(v) {
    return String(v == null ? "" : v)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }
  function st() {
    try { return window.state || (window.MogahedOSX && MogahedOSX.state) || {}; }
    catch(e) { return {}; }
  }
  function arr(k) {
    var s = st();
    return Array.isArray(s[k]) ? s[k].filter(function (x) { return !x.archived && !x.deleted; }) : [];
  }
  function todayISO() { return new Date().toISOString().slice(0, 10); }
  function isDone(x) { return x.status === "done" || x.status === "مكتمل" || x.done === true; }
  function pctKnowledge(k) {
    var total = Number(k.totalUnits || k.totalPages || k.totalMinutes || 0);
    var done = Number(k.currentUnit || k.currentPage || k.currentMinute || 0);
    if (total > 0) return Math.max(0, Math.min(100, Math.round(done / total * 100)));
    if (k.status === "done" || k.finished) return 100;
    return Math.max(0, Math.min(100, Number(k.progress || 0)));
  }
  function pctGoal(g) { return Math.max(0, Math.min(100, Number(g.progress || 0))); }
  function goalStatus(g) {
    if (pctGoal(g) >= 100) return "مكتمل";
    var end = g.endDate || g.deadline || "";
    if (end && end < todayISO()) return "متأخر";
    return g.status || "شغال";
  }
  function daysLeft(end) {
    if (!end) return "بدون تاريخ نهاية";
    var diff = Math.round((new Date(end) - new Date(todayISO())) / (24 * 60 * 60 * 1000));
    if (diff === 0) return "ينتهي اليوم";
    if (diff > 0) return "متبقي " + diff + " يوم";
    return "متأخر " + Math.abs(diff) + " يوم";
  }
  function dateText(v) { return v ? String(v).slice(0, 10) : ""; }
  function timeText(v) {
    try {
      if (!v) return "";
      var d = new Date(v);
      if (isNaN(d)) return "";
      return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
    } catch(e) { return ""; }
  }
  function lastReviewLabel(reviews) {
    if (!reviews.length) return "لا توجد مراجعة";
    var r = reviews.slice().sort(function (a,b) {
      return String(b.date || b.id || "").localeCompare(String(a.date || a.id || ""));
    })[0];
    return r.date || r.title || "آخر مراجعة";
  }
  function setPageTitle(title, sub) {
    var t = $("pageTitle"), s = $("pageSub");
    if (t) t.textContent = title;
    if (s) s.textContent = sub || "";
  }
  function ensureDashboardButton() {
    var nav = $("nav");
    if (!nav) return;
    var b = nav.querySelector('[data-route="dashboard"]');
    if (!b) {
      b = document.createElement("button");
      b.setAttribute("data-route", "dashboard");
      b.setAttribute("aria-label", "Dashboard");
      b.innerHTML = "<span><b>📊</b><em>Dashboard</em></span><small></small>";
      nav.insertBefore(b, nav.children[1] || null);
    }
  }
  function dashboardHTML() {
    var tasks = arr("tasks").filter(function (x) { return !isDone(x); });
    var actions = arr("actions").filter(function (x) { return !isDone(x); });
    var allTasks = arr("tasks");
    var allActions = arr("actions");
    var goals = arr("goals");
    var know = arr("knowledge");
    var reviews = Array.isArray(st().reviews) ? st().reviews : [];
    var focus = Array.isArray(st().focusSessions) ? st().focusSessions : [];
    var open = tasks.length + actions.length;
    var done = allTasks.filter(isDone).length + allActions.filter(isDone).length;
    var lateGoals = goals.filter(function (g) { return goalStatus(g) === "متأخر"; });
    var activeGoals = goals.filter(function (g) { return goalStatus(g) !== "مكتمل"; });
    var goalAvg = goals.length ? Math.round(goals.reduce(function (a,g) { return a + pctGoal(g); }, 0) / goals.length) : 0;
    var knowAvg = know.length ? Math.round(know.reduce(function (a,k) { return a + pctKnowledge(k); }, 0) / know.length) : 0;
    var focusWeek = focus.filter(function (x) {
      var tm = new Date(x.iso || x.date || x.id || 0).getTime();
      return tm && tm >= Date.now() - 7 * 24 * 60 * 60 * 1000;
    }).length;
    var continueKnow = know.find(function (k) { var p = pctKnowledge(k); return p > 0 && p < 100; }) || know.find(function (k) { return pctKnowledge(k) < 100; });
    var current = tasks[0] || actions[0];
    var currentGoal = lateGoals[0] || activeGoals[0] || goals[0];
    var command = current ? "ابدأ بـ: " + (current.title || "المهمة الحالية")
      : currentGoal ? "راجع هدفك: " + (currentGoal.title || "هدفك الحالي")
      : continueKnow ? "كمّل معرفة: " + (continueKnow.title || "المحتوى الحالي")
      : "أضف هدف اليوم أو مهمة واحدة تبدأ بها.";
    var score = Math.min(100, Math.round((done * 2 + focus.length + reviews.length + knowAvg + goalAvg) / Math.max(1, open + goals.length + know.length + 10)));

    function taskRow(t) {
      var isTask = allTasks.some(function (x) { return x.id === t.id; });
      return '<div class="v782-row"><div class="v782-icon">' + (isTask ? "✅" : "⚡") + '</div><div><b>' +
        esc(t.title || "مهمة") + '</b><small>' +
        esc(t.project || t.source || t.area || "إجراء مطلوب") +
        (t.dueAt ? " • " + dateText(t.dueAt) + " " + timeText(t.dueAt) : "") +
        '</small></div><button class="btn secondary mini" data-action="' + (isTask ? "v69EditTask" : "editAction") + '" data-id="' + esc(t.id || "") + '">تعديل</button></div>';
    }
    function goalRow(g) {
      var p = pctGoal(g), s = goalStatus(g);
      var cls = s === "متأخر" ? "v782-danger" : s === "مكتمل" ? "v782-success" : "";
      return '<div class="v782-row ' + cls + '"><div class="v782-icon">🎯</div><div><b>' +
        esc(g.title || "هدف") + '</b><small>' +
        esc((g.period || g.type || "هدف") + " • " + (g.area || "عام") + " • " + daysLeft(g.endDate || g.deadline || "")) +
        '</small><div class="progress"><div class="bar" style="width:' + p + '%"></div></div></div><span class="pill">' + p + '%</span></div>';
    }
    function knowRow(k) {
      var p = pctKnowledge(k);
      return '<div class="v782-row"><div class="v782-icon">' + (/بودكاست|فيديو|محاضرة|YouTube/.test(k.type || k.mediaType || "") ? "▶️" : "🧠") + '</div><div><b>' +
        esc(k.title || "معرفة") + '</b><small>' + esc(k.type || k.mediaType || "معرفة") + " • " + p +
        '%</small><div class="progress"><div class="bar" style="width:' + p + '%"></div></div></div><button class="btn secondary mini" data-action="openKnowledgePlayer" data-id="' + esc(k.id || "") + '">فتح</button></div>';
    }
    function reviewRow(r) {
      return '<div class="v782-row"><div class="v782-icon">📝</div><div><b>' + esc(r.title || "مراجعة") + '</b><small>' + esc(r.date || r.learned || r.done || "مراجعة") + '</small></div><span class="pill">Review</span></div>';
    }
    var upcoming = tasks.filter(function (t) { return !!t.dueAt; }).sort(function (a,b) { return String(a.dueAt).localeCompare(String(b.dueAt)); }).slice(0, 5);
    var recentReviews = reviews.slice(-3).reverse();

    return '<div class="v782-dashboard"><section class="v782-hero"><div class="v782-hero-head"><div><span class="v782-kicker">📊 Dashboard ذكي — الداشبورد فقط</span><h2>مركز قيادة اليوم</h2><p>يربط الأهداف والمهام والمعرفة والمراجعات والتركيز في شاشة واحدة عشان تعرف تعمل إيه الآن بدون تشتت.</p></div><div class="v782-actions"><button class="btn" data-action="openFocus">▶ ابدأ تركيز</button><button class="btn secondary" data-action="addTask">+ مهمة</button><button class="btn secondary" data-action="addGoal">+ هدف</button></div></div><div class="v782-command"><small>الأمر المقترح الآن</small><b>' +
      esc(command) + '</b></div></section><section class="v782-kpis"><div class="v782-kpi"><div class="v782-kpi-top"><small>قوة النظام</small><i>⚡</i></div><strong>' +
      score + '%</strong><p>مؤشر يجمع التنفيذ والتركيز والمراجعات.</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>الأهداف</small><i>🎯</i></div><strong>' +
      goals.length + '</strong><p>متوسط ' + goalAvg + '% • متأخر ' + lateGoals.length + '</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>المهام والإجراءات</small><i>✅</i></div><strong>' +
      open + '</strong><p>' + done + ' مكتمل • ' + tasks.length + ' مهام مفتوحة</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>المعرفة</small><i>🧠</i></div><strong>' +
      know.length + '</strong><p>متوسط التقدم ' + knowAvg + '%</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>التركيز والمراجعة</small><i>⏳</i></div><strong>' +
      focus.length + '</strong><p>' + focusWeek + ' هذا الأسبوع • ' + esc(lastReviewLabel(reviews)) + '</p></div></section><section class="v782-strip"><button class="btn" data-action="addGoal">🎯 هدف جديد</button><button class="btn secondary" data-action="addTask">✅ مهمة بوقت</button><button class="btn secondary" data-action="addKnowledge">🧠 معرفة</button><button class="btn secondary" data-action="dailyReflection">📝 مراجعة اليوم</button></section><section class="v782-grid"><div class="card v782-panel"><div class="v782-head"><div><h3>المطلوب الآن</h3><p>أهم مهام وإجراءات يجب أن تبدأ بها.</p></div><span class="pill">' +
      open + ' مفتوح</span></div><div class="v782-list">' +
      (tasks.concat(actions).slice(0, 6).map(taskRow).join("") || '<div class="v782-empty">لا توجد مهام مفتوحة. أضف مهمة واحدة فقط تبدأ بها.</div>') +
      '</div></div><div class="card v782-panel"><div class="v782-head"><div><h3>الأهداف الحية</h3><p>الأهداف المتأخرة أو الجارية.</p></div><button class="btn secondary mini" data-action="addGoal">+ هدف</button></div><div class="v782-list">' +
      ((lateGoals.length ? lateGoals : activeGoals).slice(0, 5).map(goalRow).join("") || '<div class="v782-empty">أضف أهدافك اليومية أو الأسبوعية أو السنوية.</div>') +
      '</div></div></section><section class="v782-grid"><div class="card v782-panel"><div class="v782-head"><div><h3>المعرفة التي تستحق الاستكمال</h3><p>أقرب كتاب أو فيديو أو بودكاست للمتابعة.</p></div><button class="btn secondary mini" data-route="knowledge">فتح المعرفة</button></div><div class="v782-list">' +
      (know.filter(function (k) { return pctKnowledge(k) < 100; }).slice(0, 5).map(knowRow).join("") || '<div class="v782-empty">لا توجد معرفة قيد المتابعة.</div>') +
      '</div></div><div class="card v782-panel"><div class="v782-head"><div><h3>المراجعات والتركيز</h3><p>آخر مراجعاتك وجلسات التركيز.</p></div><button class="btn secondary mini" data-action="dailyReflection">مراجعة</button></div><div class="v782-mini-grid"><div class="v782-mini-card"><small>جلسات التركيز</small><b>' +
      focus.length + '</b></div><div class="v782-mini-card"><small>هذا الأسبوع</small><b>' + focusWeek + '</b></div><div class="v782-mini-card"><small>المراجعات</small><b>' + reviews.length + '</b></div><div class="v782-mini-card"><small>آخر مراجعة</small><b>' + esc(lastReviewLabel(reviews)) + '</b></div></div><div class="v782-list">' +
      (recentReviews.map(reviewRow).join("") || '<div class="v782-empty">اكتب مراجعة اليوم عشان الداشبورد يتعلم منك.</div>') +
      '</div></div></section><section class="card v782-panel"><div class="v782-head"><div><h3>جدول قريب</h3><p>المهام المجدولة القادمة مع أوقاتها.</p></div><button class="btn secondary mini" data-action="addTask">+ مهمة بوقت</button></div><div class="v782-list">' +
      (upcoming.map(function (t) { return '<div class="v782-row"><div class="v782-icon">🗓️</div><div><b>' + esc(t.title || "مهمة") + '</b><small>' + dateText(t.dueAt) + ' • ' + timeText(t.dueAt) + ' • تنبيه قبل ' + (t.reminderMinutes || 0) + ' دقيقة</small></div><button class="btn secondary mini" data-action="v69EditTask" data-id="' + esc(t.id || "") + '">تعديل</button></div>'; }).join("") || '<div class="v782-empty">لا توجد مهام مجدولة قريبة.</div>') +
      '</div></section></div>';
  }
  function renderDashboardOnly() {
    var view = $("view");
    if (!view) return;
    view.innerHTML = dashboardHTML();
    setPageTitle("Dashboard ذكي", "الأهداف + المهام + المعرفة + المراجعات + التركيز");
    document.querySelectorAll('#nav button[data-route]').forEach(function (btn) {
      btn.classList.toggle("active", btn.dataset.route === "dashboard");
    });
  }

  document.addEventListener("click", function (e) {
    var routeBtn = e.target.closest("[data-route]");
    if (!routeBtn) return;

    if (routeBtn.dataset.route === "dashboard") {
      dashboardMode = true;
      setTimeout(renderDashboardOnly, 80);
      setTimeout(renderDashboardOnly, 220);
    } else {
      dashboardMode = false;
    }
  }, true);

  var oldRender = window.MogahedOSX && window.MogahedOSX.render;
  if (typeof oldRender === "function" && !oldRender.__v782SafeDashboardWrapped) {
    var wrapped = function () {
      var result = oldRender.apply(this, arguments);
      if (dashboardMode) {
        setTimeout(renderDashboardOnly, 80);
      }
      return result;
    };
    wrapped.__v782SafeDashboardWrapped = true;
    window.MogahedOSX.render = wrapped;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ensureDashboardButton);
  } else {
    ensureDashboardButton();
  }
})();