(function () {
        function boot() {
          var api = window.MogahedOSX;
          if (!api || api.__v71EnterpriseApplied) return;
          api.__v71EnterpriseApplied = true;
          document.body.classList.add("v71-enterprise-mode");
          var Actions = api.Actions || window.Actions || {};
          function H(x) {
            try {
              return api.esc
                ? api.esc(String(x == null ? "" : x))
                : String(x == null ? "" : x).replace(/[&<>"']/g, function (m) {
                    return {
                      "&": "&amp;",
                      "<": "&lt;",
                      ">": "&gt;",
                      '"': "&quot;",
                      "'": "&#39;",
                    }[m];
                  });
            } catch (e) {
              return "";
            }
          }
          function st() {
            try {
              return api.getState ? api.getState() : window.state || {};
            } catch (e) {
              return window.state || {};
            }
          }
          function arr(k) {
            var a = st()[k];
            return Array.isArray(a) ? a : [];
          }
          function active(k) {
            return arr(k).filter(function (x) {
              return x && x.status !== "archived" && !x.deleted;
            });
          }
          function route() {
            try {
              return api.getRoute ? api.getRoute() : window.route || "home";
            } catch (e) {
              return "home";
            }
          }
          function setRoute(r) {
            try {
              if (api.setRoute) api.setRoute(r);
              else window.route = r;
            } catch (e) {
              window.route = r;
            }
          }
          function notDone(x) {
            return (
              x &&
              x.status !== "done" &&
              x.done !== true &&
              x.completed !== true
            );
          }
          function pct(x) {
            var total = Number(
                x.totalUnits ||
                  x.totalPages ||
                  x.totalMinutes ||
                  x.totalMin ||
                  0,
              ),
              cur = Number(
                x.currentUnit ||
                  x.currentPage ||
                  x.currentMinute ||
                  x.progress ||
                  0,
              );
            if (total > 0)
              return Math.max(
                0,
                Math.min(100, Math.round((cur / total) * 100)),
              );
            return Math.max(0, Math.min(100, Number(x.progress || 0) || 0));
          }
          function dueMs(x) {
            return x && x.dueAt ? new Date(x.dueAt).getTime() : Infinity;
          }
          function pendingTasks() {
            return active("tasks")
              .filter(notDone)
              .sort(function (a, b) {
                return dueMs(a) - dueMs(b);
              });
          }
          function pendingActions() {
            return active("actions").filter(notDone);
          }
          function todayTasks() {
            var d = new Date().toISOString().slice(0, 10);
            return pendingTasks().filter(function (t) {
              return String(t.dueAt || "").slice(0, 10) === d;
            });
          }
          function upcoming(n) {
            return pendingTasks()
              .filter(function (t) {
                return t.dueAt;
              })
              .slice(0, n || 6);
          }
          function score(m) {
            var s = 70;
            s +=
              Math.min(16, m.done * 2) +
              Math.min(8, m.focus) +
              Math.min(8, m.reviews);
            s -= Math.min(24, m.open * 2);
            s += Math.round((m.knowAvg || 0) / 10);
            return Math.max(8, Math.min(99, s));
          }
          function timeLabel(t) {
            if (!t || !t.dueAt) return "—";
            try {
              return new Date(t.dueAt).toLocaleTimeString("ar-EG", {
                hour: "2-digit",
                minute: "2-digit",
              });
            } catch (e) {
              return "—";
            }
          }
          function shortDate(t) {
            if (!t || !t.dueAt) return "بدون وقت";
            try {
              return (
                new Date(t.dueAt).toLocaleDateString("ar-EG", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }) +
                " • " +
                timeLabel(t)
              );
            } catch (e) {
              return "بدون وقت";
            }
          }
          function kpi(label, code, value, sub, cls) {
            return (
              '<div class="v71-kpi ' +
              (cls || "") +
              '"><small><span>' +
              label +
              "</span><span>" +
              code +
              "</span></small><strong>" +
              value +
              "</strong><p>" +
              sub +
              "</p></div>"
            );
          }
          function row(ico, title, sub, btn, act, id) {
            return (
              '<div class="v71-row"><div class="v71-icon">' +
              ico +
              "</div><div><b>" +
              H(title || "بدون عنوان") +
              "</b><small>" +
              H(sub || "") +
              "</small></div>" +
              (btn
                ? '<button class="btn secondary mini" ' +
                  (act ? 'data-action="' + act + '"' : "") +
                  " " +
                  (id ? 'data-id="' + H(id) + '"' : "") +
                  ">" +
                  btn +
                  "</button>"
                : "") +
              "</div>"
            );
          }
          function rows(items, empty, type) {
            if (!items || !items.length)
              return '<div class="v71-empty">' + empty + "</div>";
            return items
              .map(function (x) {
                return row(
                  type === "know"
                    ? /بودكاست|فيديو|محاضرة/.test(x.type || "")
                      ? "▶"
                      : "📚"
                    : type === "task"
                      ? "⏰"
                      : "⚡",
                  x.title || x.name,
                  type === "know"
                    ? (x.type || "معرفة") + " • " + pct(x) + "%"
                    : x.project || x.area || x.reason || shortDate(x),
                  type === "know" ? "فتح" : "بدء",
                  type === "know"
                    ? "openKnowledgePlayer"
                    : type === "task"
                      ? "openFocus"
                      : "openFocus",
                  x.id,
                );
              })
              .join("");
          }
          function taskCard(t) {
            return (
              '<div class="v71-task"><b>' +
              H(t.title || "بدون عنوان") +
              "</b><small>" +
              H(t.project || t.area || shortDate(t)) +
              "</small></div>"
            );
          }
          function recent(n) {
            var all = [];
            [
              "tasks",
              "actions",
              "knowledge",
              "projects",
              "goals",
              "reviews",
              "decisions",
              "focusSessions",
              "emergencySessions",
              "inbox",
            ].forEach(function (k) {
              active(k).forEach(function (x) {
                all.push({
                  kind: k,
                  title: x.title || x.name || x.summary || x.note || k,
                  sub: x.type || x.status || x.area || k,
                  ts: x.updatedAt || x.createdAt || x.id || "",
                });
              });
            });
            return all
              .sort(function (a, b) {
                return String(b.ts).localeCompare(String(a.ts));
              })
              .slice(0, n || 6);
          }
          function metrics() {
            var tasks = active("tasks"),
              actions = active("actions"),
              know = active("knowledge"),
              projects = active("projects"),
              goals = active("goals"),
              reviews = active("reviews"),
              focus = arr("focusSessions"),
              rescue = arr("emergencySessions");
            var open =
                tasks.filter(notDone).length + actions.filter(notDone).length,
              done =
                tasks.filter(function (x) {
                  return !notDone(x);
                }).length +
                actions.filter(function (x) {
                  return !notDone(x);
                }).length,
              knowAvg = know.length
                ? Math.round(
                    know.reduce(function (a, k) {
                      return a + pct(k);
                    }, 0) / know.length,
                  )
                : 0;
            return {
              tasks: tasks,
              actions: actions,
              know: know,
              projects: projects,
              goals: goals,
              reviews: reviews,
              focus: focus,
              rescue: rescue,
              open: open,
              done: done,
              knowAvg: knowAvg,
              today: todayTasks(),
              sc: score({
                open: open,
                done: done,
                focus: focus.length,
                reviews: reviews.length,
                knowAvg: knowAvg,
              }),
            };
          }
          function shellTop(m, home) {
            var current =
              m.today[0] || pendingTasks()[0] || pendingActions()[0];
            return (
              '<section class="v71-top"><div class="v71-hero"><span class="v71-kicker">● ENTERPRISE LIVE OS</span><h2>' +
              (home ? "غرفة قيادة اليوم" : "Executive Command Center") +
              "</h2><p>" +
              (home
                ? "الصفحة دي مش كروت؛ دي مركز تشغيل يومي يحدد المطلوب الآن، القادم بوقت، حالة المعرفة، ومؤشرات الضغط والإنجاز."
                : "لوحة ضخمة لمراقبة النظام بالكامل: تنفيذ، إنتاجية، معرفة، أهداف، مشاريع، مراجعات، طوارئ، وتدفق العمل.") +
              '</p><div class="v71-actionbar"><button class="btn" data-action="openFocus">▶ تشغيل المهمة الحالية</button><button class="btn secondary" data-action="addTask">+ مهمة بوقت</button><button class="btn secondary" data-action="openQuickAdd">+ إدخال سريع</button><button class="btn secondary" data-route="' +
              (home ? "dashboard" : "home") +
              '">' +
              (home ? "📊 الداشبورد الكامل" : "الرئيسية") +
              '</button></div></div><aside class="v71-control"><div class="v71-score-wrap"><div class="v71-ring" style="--p:' +
              m.sc +
              '"><strong>' +
              m.sc +
              "%</strong></div><div><h3>System Health</h3><p>" +
              (m.open > 10
                ? "الحمل عالي ويحتاج تنظيف."
                : m.open > 4
                  ? "النظام نشط، راقب التراكم."
                  : "النظام هادي وجاهز للتنفيذ.") +
              '</p></div></div><div class="v71-health-list"><div class="v71-health"><span class="v71-dot ' +
              (m.open > 10 ? "danger" : m.open > 5 ? "warn" : "") +
              '"></span><b>Execution Load</b><small>' +
              m.open +
              ' مفتوح</small></div><div class="v71-health"><span class="v71-dot ' +
              (m.today.length ? "" : "warn") +
              '"></span><b>Today Plan</b><small>' +
              m.today.length +
              ' مواعيد</small></div><div class="v71-health"><span class="v71-dot ' +
              (m.knowAvg < 25 ? "warn" : "") +
              '"></span><b>Knowledge Progress</b><small>' +
              m.knowAvg +
              '%</small></div></div><div class="v71-filters"><span class="v71-filter active">اليوم</span><span class="v71-filter">الأسبوع</span><span class="v71-filter">الشهر</span><span class="v71-filter">كل النظام</span></div></aside></section>'
            );
          }
          function kpis(m) {
            return (
              '<section class="v71-kpis">' +
              kpi(
                "Open Load",
                "TASKS",
                m.open,
                "إجمالي المهام والإجراءات المفتوحة.",
                m.open > 10 ? "v71-danger" : m.open > 5 ? "v71-alert" : "",
              ) +
              kpi(
                "Today Agenda",
                "TIME",
                m.today.length,
                "مهام لها توقيت اليوم.",
              ) +
              kpi("Completed", "OUTPUT", m.done, "مخرجات تم إغلاقها.") +
              kpi(
                "Knowledge",
                "BRAIN",
                m.knowAvg + "%",
                "متوسط تقدم الكتب/الفيديوهات.",
              ) +
              kpi("Focus", "DEEP", m.focus.length, "جلسات تركيز مسجلة.") +
              kpi(
                "Rescue",
                "ANTI-DISTRACT",
                m.rescue.length,
                "مرات طوارئ ضد التشتت.",
              ) +
              "</section>"
            );
          }
          function home() {
            var m = metrics(),
              cur = m.today[0] || pendingTasks()[0] || pendingActions()[0],
              cont = m.know.slice().sort(function (a, b) {
                return pct(a) - pct(b);
              })[0];
            return (
              '<div class="v71-shell">' +
              shellTop(m, true) +
              kpis(m) +
              '<section class="v71-grid"><div class="card v71-card"><div class="v71-card-head"><div><h3>🎯 المطلوب الآن</h3><p>أهم عنصر يجب أن يظهر أمامك أولاً.</p></div><span class="pill">Priority One</span></div><h2 class="v71-now-title">' +
              H(cur ? cur.title : "لا توجد مهمة حالياً") +
              '</h2><p class="muted">' +
              H(
                cur
                  ? cur.reason || cur.project || cur.area || shortDate(cur)
                  : "أضف مهمة واحدة بوقت محدد لتتحول الصفحة لمركز تنفيذ حقيقي.",
              ) +
              '</p><div class="v71-now-meta"><div class="v71-mini"><small>الوقت</small><b>' +
              H(cur ? shortDate(cur) : "غير محدد") +
              '</b></div><div class="v71-mini"><small>الهدف</small><b>' +
              H((m.goals[0] || {}).title || "لا يوجد هدف") +
              '</b></div><div class="v71-mini"><small>المشروع</small><b>' +
              H((m.projects[0] || {}).title || "لا يوجد مشروع") +
              '</b></div></div><div class="row"><button class="btn" data-action="openFocus">ابدأ Focus</button><button class="btn rescue" data-action="emergencyPlan">طوارئ ضد التشتت</button><button class="btn secondary" data-action="addAction">إجراء جديد</button></div></div><div class="card v71-card"><div class="v71-card-head"><div><h3>🧠 استكمال ذكي</h3><p>آخر معرفة تحتاج رجوع.</p></div><span class="pill">Brain</span></div>' +
              (cont
                ? row(
                    /بودكاست|فيديو|محاضرة/.test(cont.type || "") ? "▶" : "📚",
                    cont.title,
                    (cont.type || "معرفة") + " • " + pct(cont) + "%",
                    "فتح",
                    "openKnowledgePlayer",
                    cont.id,
                  )
                : '<div class="v71-empty">أضف كتاب أو بودكاست للاستكمال.</div>') +
              '<div class="v71-map" style="margin-top:12px"></div></div></section><section class="v71-grid-3"><div class="card v71-card"><div class="v71-card-head"><div><h3>🗓️ Agenda اليوم</h3><p>كل شيء له وقت.</p></div><button class="btn secondary mini" data-action="addTask">+ إضافة</button></div><div class="v71-timeline">' +
              (m.today.length
                ? m.today
                    .slice(0, 6)
                    .map(function (t) {
                      return (
                        '<div class="v71-time-row"><div class="v71-time">' +
                        timeLabel(t) +
                        "</div><div><b>" +
                        H(t.title) +
                        "</b><small>" +
                        H(t.project || t.area || "مهمة اليوم") +
                        '</small></div><button class="btn secondary mini" data-action="openFocus">بدء</button></div>'
                      );
                    })
                    .join("")
                : '<div class="v71-empty">لا توجد مهام مجدولة اليوم.</div>') +
              '</div></div><div class="card v71-card"><div class="v71-card-head"><div><h3>⚡ إجراءات مفتوحة</h3><p>أقرب خطوات تنفيذ.</p></div><button class="btn secondary mini" data-action="addAction">+ إجراء</button></div><div class="v71-list">' +
              rows(
                m.actions.filter(notDone).slice(0, 5),
                "لا توجد إجراءات مفتوحة.",
                "action",
              ) +
              '</div></div><div class="card v71-card ' +
              (m.open > 8 ? "v71-alert" : "") +
              '"><div class="v71-card-head"><div><h3>📡 Activity Feed</h3><p>آخر ما حدث في النظام.</p></div><span class="pill">Live</span></div><div class="v71-list">' +
              recent(5)
                .map(function (x) {
                  return row(
                    {
                      tasks: "✅",
                      actions: "⚡",
                      knowledge: "🧠",
                      projects: "📌",
                      goals: "🎯",
                      reviews: "✓",
                      decisions: "◇",
                      focusSessions: "⏳",
                      emergencySessions: "🚨",
                      inbox: "💡",
                    }[x.kind] || "•",
                    x.title,
                    x.sub,
                  );
                })
                .join("") +
              "</div></div></section></div>"
            );
          }
          function dashboard() {
            var m = metrics(),
              vals = [
                m.open,
                m.done,
                m.know.length,
                m.focus.length,
                m.rescue.length,
                m.reviews.length,
                m.projects.length,
                m.goals.length,
              ].map(function (v) {
                return Math.max(8, Math.min(100, v * 11));
              });
            return (
              '<div class="v71-shell">' +
              shellTop(m, false) +
              kpis(m) +
              '<section class="v71-grid"><div class="card v71-card"><div class="v71-card-head"><div><h3>📊 Executive Performance</h3><p>مؤشرات بصرية ضخمة توضح الحمل والإنتاج والتقدم.</p></div><span class="pill">Live Analytics</span></div><div class="v71-chart">' +
              vals
                .map(function (v, i) {
                  return (
                    '<div class="v71-bar" style="height:' +
                    v +
                    '%"><b>' +
                    v +
                    "</b><span>" +
                    [
                      "مفتوح",
                      "منتهي",
                      "معرفة",
                      "تركيز",
                      "إنقاذ",
                      "مراجعة",
                      "مشاريع",
                      "أهداف",
                    ][i] +
                    "</span></div>"
                  );
                })
                .join("") +
              '</div></div><div class="card v71-card"><div class="v71-card-head"><div><h3>⏰ القادم بوقت</h3><p>المواعيد والمهام القريبة.</p></div><button class="btn secondary mini" data-action="addTask">+ مهمة</button></div><div class="v71-list">' +
              rows(upcoming(7), "لا توجد مهام مجدولة قريبة.", "task") +
              '</div></div></section><section class="card v71-card"><div class="v71-card-head"><div><h3>🧭 Enterprise Work Board</h3><p>تدفق العمل كما يظهر في أنظمة الشركات: Inbox → Planned → Doing → Done.</p></div><span class="pill">Kanban</span></div><div class="v71-board"><div class="v71-lane"><h4>Inbox <span>' +
              m.actions.filter(function (a) {
                return notDone(a) && !a.status;
              }).length +
              "</span></h4>" +
              m.actions
                .filter(function (a) {
                  return notDone(a) && !a.status;
                })
                .slice(0, 4)
                .map(taskCard)
                .join("") +
              '</div><div class="v71-lane"><h4>Planned <span>' +
              m.tasks.filter(notDone).length +
              "</span></h4>" +
              m.tasks.filter(notDone).slice(0, 4).map(taskCard).join("") +
              '</div><div class="v71-lane"><h4>Doing <span>' +
              m.actions.filter(function (a) {
                return a.status === "doing";
              }).length +
              "</span></h4>" +
              m.actions
                .filter(function (a) {
                  return a.status === "doing";
                })
                .slice(0, 4)
                .map(taskCard)
                .join("") +
              '</div><div class="v71-lane"><h4>Done <span>' +
              m.done +
              "</span></h4>" +
              m.actions
                .concat(m.tasks)
                .filter(function (a) {
                  return !notDone(a);
                })
                .slice(0, 4)
                .map(taskCard)
                .join("") +
              '</div></div></section><section class="v71-grid-3"><div class="card v71-card"><div class="v71-card-head"><div><h3>🧠 Knowledge Portfolio</h3><p>تقدم الكتب والفيديوهات.</p></div><button class="btn secondary mini" data-route="knowledge">فتح</button></div><div class="v71-list">' +
              rows(m.know.slice(0, 6), "لا توجد معرفة بعد.", "know") +
              '</div></div><div class="card v71-card"><div class="v71-card-head"><div><h3>🎯 Strategic Direction</h3><p>الأهداف والمشاريع النشطة.</p></div><span class="pill">Strategy</span></div><div class="v71-list">' +
              (m.goals
                .slice(0, 3)
                .map(function (g) {
                  return row(
                    "🎯",
                    g.title,
                    (g.area || "هدف") + " • " + (g.progress || 0) + "%",
                  );
                })
                .join("") +
                m.projects
                  .slice(0, 4)
                  .map(function (p) {
                    return row("📌", p.title, p.kpi || p.area || "مشروع");
                  })
                  .join("") ||
                '<div class="v71-empty">أضف هدف أو مشروع للمتابعة.</div>') +
              '</div></div><div class="card v71-card"><div class="v71-card-head"><div><h3>⚠️ Executive Alerts</h3><p>تنبيهات إدارية سريعة.</p></div><span class="pill">Risk</span></div><div class="v71-list">' +
              row(
                m.open > 10 ? "🔴" : "🟢",
                "حمل التنفيذ",
                m.open > 10
                  ? "الحمل عالي، أغلق أو أرشف القديم."
                  : "الحمل مقبول حالياً.",
              ) +
              row(
                m.today.length ? "🟢" : "🟡",
                "خطة اليوم",
                m.today.length ? "يوجد جدول واضح." : "لا توجد مواعيد اليوم.",
              ) +
              row(
                m.knowAvg < 25 ? "🟡" : "🟢",
                "تقدم المعرفة",
                m.knowAvg < 25 ? "المعرفة تحتاج استكمال." : "تقدم المعرفة جيد.",
              ) +
              "</div></div></section></div>"
            );
          }
          function injectNav() {
            var nav = document.getElementById("nav");
            if (!nav) return;
            var b = nav.querySelector('[data-route="dashboard"]');
            if (!b) {
              b = document.createElement("button");
              b.dataset.route = "dashboard";
              nav.insertBefore(b, nav.children[1] || null);
            }
            b.className = "v71-nav-dashboard";
            b.innerHTML =
              "<span><b>📊</b><em>Command</em></span><small></small>";
            b.classList.toggle("active", route() === "dashboard");
            b.onclick = function (e) {
              e.preventDefault();
              setRoute("dashboard");
              api.render && api.render();
            };
          }
          function inject() {
            injectNav();
            var r = route(),
              v = document.getElementById("view");
            if (!v) return;
            if (r === "home" || r === "dashboard") {
              v.innerHTML = r === "dashboard" ? dashboard() : home();
              var t = document.getElementById("pageTitle"),
                sub = document.getElementById("pageSub");
              if (t)
                t.textContent =
                  r === "dashboard" ? "Enterprise Command Center" : "الرئيسية";
              if (sub)
                sub.textContent =
                  r === "dashboard"
                    ? "داشبورد ضخم لمتابعة النظام كله مثل منتجات الشركات."
                    : "غرفة قيادة اليوم: المطلوب الآن، الوقت، المعرفة، والتنفيذ.";
            }
          }
          var prev = api.render || function () {};
          api.render = function () {
            try {
              prev.apply(api, arguments);
            } catch (e) {}
            setTimeout(inject, 80);
          };
          window.MogahedOSX.render = api.render;
          document.addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest("[data-route]");
            if (!b) return;
            var r = b.getAttribute("data-route");
            if (r === "dashboard" || r === "home") {
              e.preventDefault();
              setTimeout(function () {
                setRoute(r);
                api.render && api.render();
              }, 0);
            }
          });
          setTimeout(inject, 220);
          setTimeout(inject, 900);
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", boot);
        else boot();
      })();