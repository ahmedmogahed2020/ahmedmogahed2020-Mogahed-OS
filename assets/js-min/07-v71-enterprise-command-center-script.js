(function () {
        function boot() {
          var api = window.MogahedOSX;
          if (!api || api.__v70CleanApplied) return;
          api.__v70CleanApplied = true;
          document.body.classList.add("v70-clean-mode");
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
          function save() {
            try {
              api.save && api.save();
            } catch (e) {}
          }
          function pct(x) {
            var total = Number(
                x.totalUnits ||
                  x.totalPages ||
                  x.totalMinutes ||
                  x.pages ||
                  x.minutes ||
                  0,
              ),
              done = Number(
                x.currentUnit ||
                  x.currentPage ||
                  x.currentMinute ||
                  x.doneUnits ||
                  0,
              );
            if (total > 0)
              return Math.max(
                0,
                Math.min(100, Math.round((done / total) * 100)),
              );
            if (x.status === "done" || x.finished || x.completed) return 100;
            return Math.max(0, Math.min(100, Number(x.progress || 0)));
          }
          function notDone(x) {
            return x && x.status !== "done" && x.status !== "archived";
          }
          function dt(x) {
            var v =
              x.dueAt ||
              x.date ||
              x.deadline ||
              x.updatedAt ||
              x.createdAt ||
              x.id ||
              "";
            var d = new Date(v);
            return isNaN(d) ? null : d;
          }
          function timeText(v) {
            var d = new Date(v);
            return isNaN(d)
              ? "بدون وقت"
              : String(d.getHours()).padStart(2, "0") +
                  ":" +
                  String(d.getMinutes()).padStart(2, "0");
          }
          function dateText(v) {
            var d = new Date(v);
            if (isNaN(d)) return "بدون تاريخ";
            return d.toLocaleDateString("ar-EG", {
              weekday: "short",
              month: "short",
              day: "numeric",
            });
          }
          function todayItems() {
            var now = new Date(),
              y = now.getFullYear(),
              m = now.getMonth(),
              d = now.getDate();
            return active("tasks")
              .filter(notDone)
              .filter(function (t) {
                var x = dt(t);
                return (
                  x &&
                  x.getFullYear() === y &&
                  x.getMonth() === m &&
                  x.getDate() === d
                );
              })
              .sort(function (a, b) {
                return (dt(a) || 0) - (dt(b) || 0);
              });
          }
          function upcoming(n) {
            var now = Date.now();
            return active("tasks")
              .filter(notDone)
              .filter(function (t) {
                var x = dt(t);
                return x && x.getTime() >= now - 3600000;
              })
              .sort(function (a, b) {
                return (dt(a) || 0) - (dt(b) || 0);
              })
              .slice(0, n || 6);
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
              "timeline",
              "focusSessions",
              "emergencySessions",
              "inbox",
            ].forEach(function (k) {
              arr(k).forEach(function (x) {
                all.push({
                  kind: k,
                  title: x.title || x.name || x.text || x.note || "نشاط",
                  sub: x.type || x.area || x.status || x.project || k,
                  time:
                    x.updatedAt || x.createdAt || x.date || x.iso || x.id || "",
                });
              });
            });
            return all
              .sort(function (a, b) {
                return String(b.time).localeCompare(String(a.time));
              })
              .slice(0, n || 7);
          }
          function score(open, done, focus, reviews, knowAvg, todayDone) {
            var raw =
              done * 7 +
              focus * 5 +
              reviews * 6 +
              todayDone * 10 +
              knowAvg -
              open * 3;
            return Math.max(0, Math.min(100, Math.round(35 + raw / 3)));
          }
          function currentItem() {
            var t =
              todayItems()[0] ||
              upcoming(1)[0] ||
              active("tasks").filter(notDone)[0] ||
              active("actions").filter(notDone)[0];
            return t || null;
          }
          function itemRows(items, empty, kind) {
            return (
              (items || [])
                .map(function (t) {
                  var due = t.dueAt || t.date || "";
                  return (
                    '<div class="v70-row"><div class="v70-ico">' +
                    (kind === "task" ? "🗓️" : kind === "action" ? "⚡" : "•") +
                    "</div><div><b>" +
                    H(t.title || t.name || "بدون عنوان") +
                    "</b><small>" +
                    H(t.project || t.area || t.reason || "") +
                    (due ? " • " + dateText(due) + " • " + timeText(due) : "") +
                    "</small></div>" +
                    (kind === "task"
                      ? '<button class="btn secondary mini" data-action="v69EditTask" data-id="' +
                        H(t.id) +
                        '">تعديل</button>'
                      : '<button class="btn secondary mini" data-action="cycleStatus" data-collection="actions" data-id="' +
                        H(t.id) +
                        '">تقدم</button>') +
                    "</div>"
                  );
                })
                .join("") || '<div class="v70-empty">' + empty + "</div>"
            );
          }
          function home() {
            var name = (st().profile && st().profile.name) || "مجاهد",
              tasks = active("tasks"),
              actions = active("actions"),
              know = active("knowledge"),
              projects = active("projects"),
              goals = active("goals");
            var open =
                tasks.filter(notDone).length + actions.filter(notDone).length,
              done =
                tasks.filter(function (x) {
                  return x.status === "done";
                }).length +
                actions.filter(function (x) {
                  return x.status === "done";
                }).length;
            var focus = arr("focusSessions").length,
              reviews = arr("reviews").length,
              today = todayItems(),
              cur = currentItem(),
              cont =
                know
                  .filter(function (k) {
                    var p = pct(k);
                    return p > 0 && p < 100;
                  })
                  .sort(function (a, b) {
                    return pct(b) - pct(a);
                  })[0] || know[0];
            var knowAvg = know.length
                ? Math.round(
                    know.reduce(function (a, k) {
                      return a + pct(k);
                    }, 0) / know.length,
                  )
                : 0,
              todayDone = tasks.filter(function (t) {
                var x = dt(t);
                return (
                  x &&
                  x.toDateString() === new Date().toDateString() &&
                  t.status === "done"
                );
              }).length,
              sc = score(open, done, focus, reviews, knowAvg, todayDone);
            var insight =
              open > 9
                ? "المفتوح عالي. اقفل مهمة واحدة قبل إضافة أي شيء جديد."
                : today.length
                  ? "ابدأ بأقرب مهمة بوقت ثم راجع الإجراءات المفتوحة."
                  : cont
                    ? "استكمل محتوى معرفة واحد وحوله لإجراء."
                    : "أضف أول مهمة بوقت واضح ليظهر يومك هنا.";
            return (
              '<div class="v70-shell"><section class="v70-hero"><div class="v70-hero-grid"><div><span class="v70-kicker">● مركز تنفيذ اليوم</span><h2>يا ' +
              H(name) +
              '، المطلوب الآن واضح.</h2><p>الرئيسية أصبحت غرفة قيادة يومية: أقرب مهمة، إجراءات مفتوحة، معرفة للاستكمال، وتنبيه سريع لحالة النظام.</p><div class="v70-actions"><button class="btn" data-action="openFocus">▶ ابدأ الحالي</button><button class="btn secondary" data-action="addTask">+ مهمة بوقت</button><button class="btn secondary" data-route="dashboard">📊 Dashboard كامل</button></div></div><div class="v70-score"><div class="v70-ring" style="--p:' +
              sc +
              '"><strong>' +
              sc +
              '%</strong></div><small>مؤشر تشغيل اليوم</small></div></div></section><section class="v70-kpis"><div class="v70-kpi"><small><span>مفتوح</span><span>Tasks</span></small><strong>' +
              open +
              '</strong><p>مهام وإجراءات لم تنتهِ.</p></div><div class="v70-kpi"><small><span>اليوم</span><span>Agenda</span></small><strong>' +
              today.length +
              '</strong><p>مواعيد ومهام بوقت.</p></div><div class="v70-kpi"><small><span>معرفة</span><span>Brain</span></small><strong>' +
              know.length +
              "</strong><p>متوسط التقدم " +
              knowAvg +
              '%</p></div><div class="v70-kpi"><small><span>تركيز</span><span>Focus</span></small><strong>' +
              focus +
              "</strong><p>" +
              reviews +
              ' مراجعات مسجلة.</p></div></section><section class="v70-main"><div class="card v70-panel"><div class="v70-head"><h3>🎯 المطلوب الآن</h3><span class="pill">Priority</span></div><h2 class="v70-task-title">' +
              H(cur ? cur.title : "لا توجد مهمة حالياً") +
              '</h2><p class="muted">' +
              H(
                cur
                  ? cur.reason || cur.project || cur.area || "ابدأ تنفيذها الآن"
                  : "أضف مهمة واحدة بوقت محدد لتظهر هنا.",
              ) +
              '</p><div class="v70-mini-grid"><div class="v70-mini"><small>الهدف الأقرب</small><b>' +
              H((goals[0] || {}).title || "لا يوجد هدف محدد") +
              '</b></div><div class="v70-mini"><small>المشروع النشط</small><b>' +
              H((projects[0] || {}).title || "لا يوجد مشروع نشط") +
              '</b></div></div><div class="row"><button class="btn" data-action="openFocus">تشغيل Focus Mode</button><button class="btn rescue" data-action="emergencyPlan">طوارئ</button><button class="btn secondary" data-action="addAction">إجراء جديد</button></div></div><div class="card v70-panel"><div class="v70-head"><h3>🧠 استكمال المعرفة</h3><span class="pill">' +
              (cont ? pct(cont) : 0) +
              "%</span></div>" +
              (cont
                ? '<div class="v70-row"><div class="v70-ico">' +
                  (/بودكاست|فيديو|محاضرة/.test(cont.type || "") ? "▶" : "📚") +
                  "</div><div><b>" +
                  H(cont.title) +
                  "</b><small>" +
                  H(cont.type || "معرفة") +
                  ' • استكمال مناسب الآن</small><div class="progress" style="margin-top:6px"><div class="bar" style="width:' +
                  pct(cont) +
                  '%"></div></div></div><button class="btn mini" data-action="openKnowledgePlayer" data-id="' +
                  H(cont.id) +
                  '">افتح</button></div>'
                : '<div class="v70-empty">أضف كتاب أو بودكاست للاستكمال.</div>') +
              '<div class="item" style="margin-top:10px"><b>💡 توصية سريعة</b><p>' +
              H(insight) +
              '</p></div></div></section><section class="v70-grid-3"><div class="card v70-panel"><div class="v70-head"><h3>🗓️ مهام اليوم</h3><button class="btn secondary mini" data-action="addTask">+ إضافة</button></div><div class="v70-list">' +
              itemRows(
                today.slice(0, 5),
                "لا توجد مهام مجدولة اليوم.",
                "task",
              ) +
              '</div></div><div class="card v70-panel"><div class="v70-head"><h3>⚡ إجراءات مفتوحة</h3><button class="btn secondary mini" data-action="addAction">+ إجراء</button></div><div class="v70-list">' +
              itemRows(
                actions.filter(notDone).slice(0, 5),
                "لا توجد إجراءات مفتوحة.",
                "action",
              ) +
              '</div></div><div class="card v70-panel ' +
              (open > 8 ? "v70-warning" : "") +
              '"><div class="v70-head"><h3>📡 آخر نشاط</h3><span class="pill">Live</span></div><div class="v70-list">' +
              recent(5)
                .map(function (x) {
                  var ico =
                    {
                      tasks: "✅",
                      actions: "⚡",
                      knowledge: "🧠",
                      projects: "📌",
                      goals: "🎯",
                      reviews: "✓",
                      decisions: "◇",
                      timeline: "🏆",
                      focusSessions: "⏳",
                      emergencySessions: "🚨",
                      inbox: "💡",
                    }[x.kind] || "•";
                  return (
                    '<div class="v70-row"><div class="v70-ico">' +
                    ico +
                    "</div><div><b>" +
                    H(String(x.title).slice(0, 68)) +
                    "</b><small>" +
                    H(x.sub || x.kind) +
                    "</small></div></div>"
                  );
                })
                .join("") +
              "</div></div></section></div>"
            );
          }
          function dashboard() {
            var tasks = active("tasks"),
              actions = active("actions"),
              know = active("knowledge"),
              projects = active("projects"),
              goals = active("goals"),
              open =
                tasks.filter(notDone).length + actions.filter(notDone).length,
              done =
                tasks.filter(function (x) {
                  return x.status === "done";
                }).length +
                actions.filter(function (x) {
                  return x.status === "done";
                }).length,
              focus = arr("focusSessions").length,
              rescue = arr("emergencySessions").length,
              reviews = arr("reviews").length,
              knowAvg = know.length
                ? Math.round(
                    know.reduce(function (a, k) {
                      return a + pct(k);
                    }, 0) / know.length,
                  )
                : 0,
              sc = score(open, done, focus, reviews, knowAvg, 0);
            var vals = [open, done, know.length, focus, rescue, reviews].map(
              function (v) {
                return Math.max(8, Math.min(100, v * 12));
              },
            );
            return (
              '<div class="v70-shell"><section class="v70-hero"><div class="v70-hero-grid"><div><span class="v70-kicker">● Executive Dashboard</span><h2>متابعة النظام بالكامل</h2><p>لوحة واحدة تجمع التنفيذ، المهام، المعرفة، التركيز، المراجعات، الطوارئ، والأهداف. الهدف منها أن تعرف هل النظام يعمل أم يتراكم.</p><div class="v70-actions"><button class="btn" data-action="openQuickAdd">+ إدخال سريع</button><button class="btn secondary" data-action="addTask">+ مهمة بوقت</button><button class="btn secondary" data-route="home">الرئيسية</button></div></div><div class="v70-score"><div class="v70-ring" style="--p:' +
              sc +
              '"><strong>' +
              sc +
              '%</strong></div><small>Health Score</small></div></div></section><section class="v70-kpis"><div class="v70-kpi"><small><span>مفتوح</span><span>Load</span></small><strong>' +
              open +
              '</strong><p>حمل التنفيذ الحالي.</p></div><div class="v70-kpi"><small><span>منتهي</span><span>Output</span></small><strong>' +
              done +
              '</strong><p>نتائج تم إغلاقها.</p></div><div class="v70-kpi"><small><span>معرفة</span><span>Progress</span></small><strong>' +
              knowAvg +
              "%</strong><p>" +
              know.length +
              ' عناصر معرفة.</p></div><div class="v70-kpi"><small><span>إنقاذ</span><span>Rescue</span></small><strong>' +
              rescue +
              "</strong><p>" +
              focus +
              " تركيز • " +
              reviews +
              ' مراجعة.</p></div></section><section class="v70-main"><div class="card v70-panel"><div class="v70-head"><h3>📊 نبض النظام</h3><span class="pill">Live</span></div><div class="v70-chart">' +
              vals
                .map(function (v, i) {
                  return (
                    '<div class="v70-bar" style="height:' +
                    v +
                    '%"><span>' +
                    ["مفتوح", "منتهي", "معرفة", "تركيز", "إنقاذ", "مراجعة"][i] +
                    "</span></div>"
                  );
                })
                .join("") +
              '</div><div class="v70-audit" style="margin-top:12px"><div><b>' +
              tasks.length +
              "</b><small>Tasks</small></div><div><b>" +
              actions.length +
              "</b><small>Actions</small></div><div><b>" +
              projects.length +
              "</b><small>Projects</small></div><div><b>" +
              goals.length +
              '</b><small>Goals</small></div></div></div><div class="card v70-panel"><div class="v70-head"><h3>⏰ القادم بوقت</h3><button class="btn secondary mini" data-action="addTask">+ مهمة</button></div><div class="v70-list">' +
              itemRows(upcoming(5), "لا توجد مهام مجدولة قريبة.", "task") +
              '</div></div></section><section class="v70-main"><div class="card v70-panel"><div class="v70-head"><h3>🧠 تقدم المعرفة</h3><button class="btn secondary mini" data-route="knowledge">فتح</button></div><div class="v70-list">' +
              (know
                .slice(0, 6)
                .map(function (k) {
                  return (
                    '<div class="v70-row"><div class="v70-ico">' +
                    (/بودكاست|فيديو|محاضرة/.test(k.type || "") ? "▶" : "📚") +
                    "</div><div><b>" +
                    H(k.title || "بدون عنوان") +
                    "</b><small>" +
                    H(k.type || "معرفة") +
                    " • " +
                    pct(k) +
                    '%</small><div class="progress" style="margin-top:6px"><div class="bar" style="width:' +
                    pct(k) +
                    '%"></div></div></div><button class="btn secondary mini" data-action="openKnowledgePlayer" data-id="' +
                    H(k.id) +
                    '">فتح</button></div>'
                  );
                })
                .join("") ||
                '<div class="v70-empty">لا توجد معرفة بعد.</div>') +
              '</div></div><div class="card v70-panel"><div class="v70-head"><h3>🎯 الاتجاه: أهداف ومشاريع</h3><span class="pill">Direction</span></div><div class="v70-list">' +
              (goals
                .slice(0, 4)
                .map(function (g) {
                  return (
                    '<div class="v70-row"><div class="v70-ico">🎯</div><div><b>' +
                    H(g.title) +
                    "</b><small>" +
                    H(g.area || "هدف") +
                    " • " +
                    (g.progress || 0) +
                    "%</small></div></div>"
                  );
                })
                .join("") +
                projects
                  .slice(0, 4)
                  .map(function (p) {
                    return (
                      '<div class="v70-row"><div class="v70-ico">📌</div><div><b>' +
                      H(p.title) +
                      "</b><small>" +
                      H(p.kpi || p.area || "مشروع") +
                      "</small></div></div>"
                    );
                  })
                  .join("") ||
                '<div class="v70-empty">أضف هدف أو مشروع للمتابعة.</div>') +
              '</div></div></section><section class="card v70-panel"><div class="v70-head"><h3>🧭 لوحة كانبان مختصرة</h3><span class="pill">Execution Flow</span></div><div class="v70-board"><div class="v70-lane"><h4>مفتوح</h4>' +
              itemRows(
                actions
                  .filter(function (a) {
                    return notDone(a) && a.status !== "doing";
                  })
                  .slice(0, 3),
                "لا يوجد مفتوح",
                "action",
              ) +
              '</div><div class="v70-lane"><h4>قيد التنفيذ</h4>' +
              itemRows(
                actions
                  .filter(function (a) {
                    return a.status === "doing";
                  })
                  .slice(0, 3),
                "لا يوجد قيد التنفيذ",
                "action",
              ) +
              '</div><div class="v70-lane"><h4>تم</h4>' +
              itemRows(
                active("actions")
                  .filter(function (a) {
                    return a.status === "done";
                  })
                  .slice(0, 3),
                "لا يوجد مكتمل",
                "action",
              ) +
              "</div></div></section></div>"
            );
          }
          function injectNav() {
            var nav = document.getElementById("nav");
            if (!nav) return;
            var existing = nav.querySelector('[data-route="dashboard"]');
            if (!existing) {
              var b = document.createElement("button");
              b.dataset.route = "dashboard";
              b.className = "v70-nav-dashboard";
              b.setAttribute("aria-label", "Dashboard");
              b.innerHTML =
                "<span><b>📊</b><em>Dashboard</em></span><small></small>";
              nav.insertBefore(b, nav.children[1] || null);
              existing = b;
            }
            existing.classList.toggle("active", route() === "dashboard");
            existing.onclick = function (e) {
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
                t.textContent = r === "dashboard" ? "Dashboard" : "الرئيسية";
              if (sub)
                sub.textContent =
                  r === "dashboard"
                    ? "متابعة احترافية لكل أجزاء النظام."
                    : "اليوم، المطلوب الآن، والإجراءات المهمة.";
            }
          }
          var oldRender = api.render || function () {};
          api.render = function () {
            try {
              oldRender.apply(api, arguments);
            } catch (e) {}
            setTimeout(inject, 60);
          };
          window.MogahedOSX.render = api.render;
          document.addEventListener("click", function (e) {
            var b = e.target.closest && e.target.closest("[data-route]");
            if (!b) return;
            var r = b.getAttribute("data-route");
            if (r === "dashboard" || r === "home") {
              setTimeout(function () {
                setRoute(r);
                api.render && api.render();
              }, 0);
            }
          });
          setTimeout(inject, 180);
          setTimeout(inject, 700);
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", boot);
        else boot();
      })();