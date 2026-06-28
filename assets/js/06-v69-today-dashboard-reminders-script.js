// Extracted from V83 inline script block 6. Original id: v69-today-dashboard-reminders-script

(function () {
        function ready(cb) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb(window.MogahedOSX);
          } else
            setTimeout(function () {
              ready(cb);
            }, 60);
        }
        ready(function (api) {
          if (window.__V69_TODAY_DASHBOARD_REMINDERS__) return;
          window.__V69_TODAY_DASHBOARD_REMINDERS__ = true;
          var oldRender = api.render,
            Actions = api.Actions,
            H =
              api.esc ||
              function (v) {
                return String(v == null ? "" : v).replace(
                  /[&<>"']/g,
                  function (c) {
                    return {
                      "&": "&amp;",
                      "<": "&lt;",
                      ">": "&gt;",
                      '"': "&quot;",
                      "'": "&#39;",
                    }[c];
                  },
                );
              };
          function st() {
            return api.state || {};
          }
          function arr(k) {
            return Array.isArray(st()[k]) ? st()[k] : [];
          }
          function active(k) {
            return arr(k).filter(function (x) {
              return x && x.status !== "archived";
            });
          }
          function save() {
            try {
              api.save && api.save(st());
            } catch (e) {
              try {
                localStorage.setItem("mogahed_os_x_v1", JSON.stringify(st()));
              } catch (_) {}
            }
          }
          function setRoute(r) {
            api.setRoute && api.setRoute(r);
          }
          function route() {
            return api.getRoute ? api.getRoute() : "home";
          }
          function todayStr() {
            return new Date().toISOString().slice(0, 10);
          }
          function timeText(iso) {
            if (!iso) return "بدون";
            var d = new Date(iso);
            if (isNaN(d)) return "بدون";
            return d.toLocaleTimeString("ar-EG", {
              hour: "2-digit",
              minute: "2-digit",
            });
          }
          function dateText(iso) {
            if (!iso) return "";
            var d = new Date(iso);
            if (isNaN(d)) return "";
            return d.toLocaleDateString("ar-EG", {
              weekday: "short",
              day: "numeric",
              month: "short",
            });
          }
          function pctKnowledge(k) {
            var total = Number(
                k.totalUnits || k.totalPages || k.totalMinutes || 0,
              ),
              done = Number(
                k.currentUnit || k.currentPage || k.currentMinute || 0,
              );
            if (total > 0)
              return Math.max(
                0,
                Math.min(100, Math.round((done / total) * 100)),
              );
            if (k.status === "done" || k.finished) return 100;
            return Number(k.progress) || 0;
          }
          function pendingTasks() {
            return active("tasks").filter(function (t) {
              return t.status !== "done";
            });
          }
          function pendingActions() {
            return active("actions").filter(function (a) {
              return a.status !== "done";
            });
          }
          function todaysTasks() {
            var now = Date.now(),
              start = todayStr();
            return pendingTasks()
              .filter(function (t) {
                return !t.dueAt || String(t.dueAt).slice(0, 10) === start;
              })
              .sort(function (a, b) {
                return (a.dueAt || "9999").localeCompare(b.dueAt || "9999");
              })
              .slice(0, 8)
              .map(function (t) {
                var ts = t.dueAt ? new Date(t.dueAt).getTime() : 0;
                var cls =
                  ts && ts < now
                    ? "overdue"
                    : ts && ts - now <= 60 * 60 * 1000
                      ? "soon"
                      : "";
                return (
                  '<div class="v69-agenda-item ' +
                  cls +
                  '"><div class="v69-time">' +
                  (t.dueAt ? timeText(t.dueAt) : "اليوم") +
                  "</div><div><h4>" +
                  H(t.title || "مهمة") +
                  "</h4><p>" +
                  H(t.project || t.source || "مهمة عامة") +
                  (t.reminderMinutes
                    ? " • تنبيه قبل " + H(t.reminderMinutes) + " دقيقة"
                    : "") +
                  '</p></div><button class="btn secondary mini" data-action="v69EditTask" data-id="' +
                  H(t.id) +
                  '">تعديل</button></div>'
                );
              })
              .join("");
          }
          function upcomingTasks(limit) {
            var now = Date.now();
            return pendingTasks()
              .filter(function (t) {
                return t.dueAt && new Date(t.dueAt).getTime() >= now;
              })
              .sort(function (a, b) {
                return new Date(a.dueAt) - new Date(b.dueAt);
              })
              .slice(0, limit || 6);
          }
          function recent() {
            var all = [];
            [
              "knowledge",
              "actions",
              "projects",
              "goals",
              "reviews",
              "decisions",
              "timeline",
              "inbox",
              "focusSessions",
              "emergencySessions",
            ].forEach(function (k) {
              arr(k).forEach(function (x) {
                all.push({
                  kind: k,
                  title: x.title || x.name || x.text || x.note || "نشاط",
                  sub: x.type || x.area || x.status || x.source || x.date || "",
                  time:
                    x.updatedAt ||
                    x.createdAt ||
                    x.dueAt ||
                    x.iso ||
                    x.date ||
                    x.id ||
                    "",
                });
              });
            });
            return all
              .sort(function (a, b) {
                return String(b.time).localeCompare(String(a.time));
              })
              .slice(0, 8);
          }
          function homeHtml() {
            var name = (st().profile && st().profile.name) || "مجاهد",
              tasks = pendingTasks(),
              actions = pendingActions(),
              current = tasks[0] || actions[0],
              know = active("knowledge"),
              cont =
                know
                  .filter(function (k) {
                    var p = pctKnowledge(k);
                    return p > 0 && p < 100;
                  })
                  .sort(function (a, b) {
                    return pctKnowledge(b) - pctKnowledge(a);
                  })[0] || know[0];
            var agenda =
              todaysTasks() ||
              '<div class="v69-empty">لا توجد مهام مجدولة اليوم. أضف مهمة بوقت محدد.</div>';
            var actionRows =
              actions
                .slice(0, 5)
                .map(function (a) {
                  return (
                    '<div class="v69-action-row"><div class="v69-ico">⚡</div><div><b>' +
                    H(a.title) +
                    '</b><p class="muted">' +
                    H(a.reason || a.area || "إجراء مفتوح") +
                    '</p></div><button class="btn secondary mini" data-action="cycleStatus" data-collection="actions" data-id="' +
                    H(a.id) +
                    '">تقدم</button></div>'
                  );
                })
                .join("") ||
              '<div class="v69-empty">لا توجد إجراءات مفتوحة.</div>';
            var dueSoon = upcomingTasks(3);
            return (
              '<div class="v69-home"><section class="v69-today-hero"><span class="v69-kicker">● غرفة تنفيذ اليوم</span><h2>يا ' +
              H(name) +
              '، دي خطة اليوم مش لوحة أرقام.</h2><p>الرئيسية دلوقتي تعرض المطلوب منك الآن: مهام اليوم، الإجراءات المفتوحة، وأقرب شيء محتاج تنفيذ.</p><div class="v69-hero-actions"><button class="btn" data-action="openFocus">▶ ابدأ الحالي</button><button class="btn secondary" data-action="addTask">+ مهمة بوقت</button><button class="btn secondary" data-route="dashboard">📊 Dashboard</button></div></section><section class="v69-today-grid"><div class="card v69-panel"><div class="v69-section-head"><h3>🗓️ مهام اليوم</h3><button class="btn secondary mini" data-action="addTask">+ إضافة</button></div><div class="v69-agenda">' +
              agenda +
              '</div></div><div class="card v69-panel"><div class="v69-section-head"><h3>🎯 المطلوب الآن</h3><span class="pill">Now</span></div><h2 class="v68-task-title">' +
              H(current ? current.title : "لا توجد مهمة حالياً") +
              '</h2><p class="muted">' +
              H(
                current
                  ? current.reason ||
                      current.project ||
                      current.area ||
                      "ابدأ تنفيذها الآن"
                  : "أضف مهمة واحدة بوقت واضح.",
              ) +
              '</p><div class="row"><button class="btn" data-action="openFocus">Focus Mode</button><button class="btn rescue" data-action="emergencyPlan">طوارئ</button></div><div class="soft-divider"></div><div class="v69-section-head"><h3>⚡ إجراءات مفتوحة</h3><button class="btn secondary mini" data-action="addAction">+ إجراء</button></div><div class="v69-action-stack">' +
              actionRows +
              '</div></div></section><section class="v69-today-grid"><div class="card v69-panel"><div class="v69-section-head"><h3>⏰ القادم بوقت</h3><span class="pill">Reminders</span></div><div class="v69-dash-list">' +
              (dueSoon
                .map(function (t) {
                  return (
                    '<div class="v69-dash-row"><div class="v69-ico">⏰</div><div><b>' +
                    H(t.title) +
                    "</b><small>" +
                    dateText(t.dueAt) +
                    " • " +
                    timeText(t.dueAt) +
                    '</small></div><button class="btn secondary mini" data-action="v69EditTask" data-id="' +
                    H(t.id) +
                    '">تعديل</button></div>'
                  );
                })
                .join("") ||
                '<div class="v69-empty">أي مهمة لها وقت وتنبيه ستظهر هنا.</div>') +
              '</div></div><div class="card v69-panel"><div class="v69-section-head"><h3>🧠 استكمال المعرفة</h3><button class="btn secondary mini" data-route="knowledge">فتح</button></div>' +
              (cont
                ? '<div class="v69-action-row"><div class="v69-ico">' +
                  (/بودكاست|فيديو|محاضرة/.test(cont.type || "") ? "▶" : "📚") +
                  "</div><div><b>" +
                  H(cont.title) +
                  '</b><p class="muted">' +
                  H(cont.type || "معرفة") +
                  " • " +
                  pctKnowledge(cont) +
                  '%</p></div><button class="btn mini" data-action="openKnowledgePlayer" data-id="' +
                  H(cont.id) +
                  '">استكمال</button></div>'
                : '<div class="v69-empty">أضف كتاب أو بودكاست للاستكمال.</div>') +
              "</div></section></div>"
            );
          }
          function dashboardHtml() {
            var tasks = pendingTasks(),
              actions = pendingActions(),
              know = active("knowledge"),
              goals = active("goals"),
              reviews = arr("reviews"),
              focusSessions = arr("focusSessions");

            function pctGoal(g) {
              return Math.max(0, Math.min(100, Number(g.progress || 0)));
            }
            function goalStatus(g) {
              var p = pctGoal(g);
              if (p >= 100) return "مكتمل";
              var end = g.endDate || g.deadline || "";
              var today = todayStr();
              if (end && end < today) return "متأخر";
              return g.status || "شغال";
            }
            function daysLeft(end) {
              if (!end) return "بدون تاريخ نهاية";
              var one = 24 * 60 * 60 * 1000;
              var diff = Math.round((new Date(end) - new Date(todayStr())) / one);
              if (diff === 0) return "ينتهي اليوم";
              if (diff > 0) return "متبقي " + diff + " يوم";
              return "متأخر " + Math.abs(diff) + " يوم";
            }
            function lastReviewLabel() {
              if (!reviews.length) return "لا توجد مراجعة";
              var r = reviews
                .slice()
                .sort(function (a, b) {
                  return String(b.date || b.id || "").localeCompare(String(a.date || a.id || ""));
                })[0];
              return r.date || r.title || "آخر مراجعة";
            }
            var open = tasks.length + actions.length;
            var done =
              active("tasks").filter(function (x) {
                return x.status === "done";
              }).length +
              active("actions").filter(function (x) {
                return x.status === "done";
              }).length;
            var lateGoals = goals.filter(function (g) {
              return goalStatus(g) === "متأخر";
            });
            var activeGoals = goals.filter(function (g) {
              return goalStatus(g) !== "مكتمل";
            });
            var goalAvg = goals.length
              ? Math.round(
                  goals.reduce(function (a, g) {
                    return a + pctGoal(g);
                  }, 0) / goals.length,
                )
              : 0;
            var knowProgress = know.length
              ? Math.round(
                  know.reduce(function (a, k) {
                    return a + pctKnowledge(k);
                  }, 0) / know.length,
                )
              : 0;
            var continueKnow =
              know
                .slice()
                .sort(function (a, b) {
                  return pctKnowledge(b) - pctKnowledge(a);
                })
                .find(function (k) {
                  var p = pctKnowledge(k);
                  return p > 0 && p < 100;
                }) ||
              know.find(function (k) {
                return pctKnowledge(k) < 100;
              });
            var currentTask = tasks[0] || actions[0];
            var currentGoal = lateGoals[0] || activeGoals[0] || goals[0];
            var upcoming = upcomingTasks(5);
            var recentReviews = reviews.slice(-3).reverse();
            var focusWeek = focusSessions.filter(function (x) {
              var time = new Date(x.iso || x.date || x.id || 0).getTime();
              return time && time >= Date.now() - 7 * 24 * 60 * 60 * 1000;
            }).length;
            var commandText = currentTask
              ? "ابدأ بـ: " + (currentTask.title || "المهمة الحالية")
              : currentGoal
                ? "راجع هدفك: " + (currentGoal.title || "هدفك الحالي")
                : continueKnow
                  ? "كمّل معرفة: " + (continueKnow.title || "المحتوى الحالي")
                  : "أضف هدف اليوم أو مهمة واحدة تبدأ بها.";
            var systemScore = Math.min(
              100,
              Math.round(
                (done * 2 + focusSessions.length + reviews.length + knowProgress + goalAvg) /
                  Math.max(1, open + goals.length + know.length + 10),
              ),
            );

            function taskRow(t) {
              var isTask = !!t.dueAt || arr("tasks").some(function (x) { return x.id === t.id; });
              return (
                '<div class="v78-row"><div class="v78-row-icon">' +
                (isTask ? "✅" : "⚡") +
                "</div><div><b>" +
                H(t.title || "مهمة") +
                "</b><small>" +
                H(t.project || t.source || t.area || "إجراء مطلوب") +
                (t.dueAt ? " • " + dateText(t.dueAt) + " " + timeText(t.dueAt) : "") +
                '</small></div><button class="btn secondary mini" data-action="' +
                (isTask ? "v69EditTask" : "editAction") +
                '" data-id="' +
                H(t.id || "") +
                '">تعديل</button></div>'
              );
            }
            function goalRow(g) {
              var p = pctGoal(g),
                s = goalStatus(g),
                cls = s === "متأخر" ? "v78-danger" : s === "مكتمل" ? "v78-success" : "";
              return (
                '<div class="v78-row ' +
                cls +
                '"><div class="v78-row-icon">🎯</div><div><b>' +
                H(g.title || "هدف") +
                "</b><small>" +
                H((g.period || g.type || "هدف") + " • " + (g.area || "عام") + " • " + daysLeft(g.endDate || g.deadline || "")) +
                '</small><div class="progress"><div class="bar" style="width:' +
                p +
                '%"></div></div></div><span class="pill">' +
                p +
                "%</span></div>"
              );
            }
            function knowledgeRow(k) {
              var p = pctKnowledge(k);
              return (
                '<div class="v78-row"><div class="v78-row-icon">' +
                (/بودكاست|فيديو|محاضرة|YouTube/.test(k.type || k.mediaType || "") ? "▶️" : "🧠") +
                "</div><div><b>" +
                H(k.title || "معرفة") +
                "</b><small>" +
                H(k.type || k.mediaType || "معرفة") +
                ' • ' +
                p +
                '%</small><div class="progress"><div class="bar" style="width:' +
                p +
                '%"></div></div></div><button class="btn secondary mini" data-action="openKnowledgePlayer" data-id="' +
                H(k.id || "") +
                '">فتح</button></div>'
              );
            }
            function reviewRow(r) {
              return (
                '<div class="v78-row"><div class="v78-row-icon">📝</div><div><b>' +
                H(r.title || "مراجعة") +
                "</b><small>" +
                H(r.date || r.learned || r.done || "مراجعة") +
                "</small></div><span class=\"pill\">Review</span></div>"
              );
            }

            return (
              '<div class="v78-dashboard"><section class="v78-hero"><div class="v78-hero-head"><div><span class="v78-kicker">📊 Dashboard ذكي</span><h2>مركز قيادة اليوم</h2><p>يربط الأهداف والمهام والمعرفة والمراجعات والتركيز في شاشة واحدة عشان تعرف تعمل إيه الآن بدون تشتت.</p></div><div class="v78-hero-actions"><button class="btn" data-action="openFocus">▶ ابدأ تركيز</button><button class="btn secondary" data-action="addTask">+ مهمة</button><button class="btn secondary" data-action="addGoal">+ هدف</button></div></div><div class="v78-command"><small>الأمر المقترح الآن</small><b>' +
              H(commandText) +
              '</b></div></section><section class="v78-kpis"><div class="v78-kpi"><div class="v78-kpi-top"><small>قوة النظام</small><i>⚡</i></div><strong>' +
              systemScore +
              '%</strong><p>مؤشر يجمع التنفيذ والتركيز والمراجعات.</p></div><div class="v78-kpi"><div class="v78-kpi-top"><small>الأهداف</small><i>🎯</i></div><strong>' +
              goals.length +
              '</strong><p>متوسط التقدم ' +
              goalAvg +
              '% • متأخر ' +
              lateGoals.length +
              '</p></div><div class="v78-kpi"><div class="v78-kpi-top"><small>المهام والإجراءات</small><i>✅</i></div><strong>' +
              open +
              '</strong><p>' +
              done +
              ' مكتمل • ' +
              tasks.length +
              ' مهام مفتوحة</p></div><div class="v78-kpi"><div class="v78-kpi-top"><small>المعرفة</small><i>🧠</i></div><strong>' +
              know.length +
              '</strong><p>متوسط التقدم ' +
              knowProgress +
              '%</p></div><div class="v78-kpi"><div class="v78-kpi-top"><small>التركيز والمراجعة</small><i>⏳</i></div><strong>' +
              focusSessions.length +
              '</strong><p>' +
              focusWeek +
              ' هذا الأسبوع • ' +
              lastReviewLabel() +
              '</p></div></section><section class="v78-action-strip"><button class="btn v78-action-btn" data-action="addGoal">🎯 هدف جديد</button><button class="btn secondary v78-action-btn" data-action="addTask">✅ مهمة بوقت</button><button class="btn secondary v78-action-btn" data-action="addKnowledge">🧠 معرفة</button><button class="btn secondary v78-action-btn" data-action="dailyReflection">📝 مراجعة اليوم</button></section><section class="v78-main-grid"><div class="card v78-panel"><div class="v78-panel-head"><div><h3>المطلوب الآن</h3><p>أهم مهام وإجراءات يجب أن تبدأ بها.</p></div><span class="pill">' +
              open +
              ' مفتوح</span></div><div class="v78-list">' +
              (tasks.concat(actions).slice(0, 6).map(taskRow).join("") ||
                '<div class="v78-empty">لا توجد مهام مفتوحة. أضف مهمة واحدة فقط تبدأ بها.</div>') +
              '</div></div><div class="card v78-panel"><div class="v78-panel-head"><div><h3>الأهداف الحية</h3><p>الأهداف المرتبطة بالفترة والتقدم.</p></div><button class="btn secondary mini" data-action="addGoal">+ هدف</button></div><div class="v78-list">' +
              ((lateGoals.length ? lateGoals : activeGoals).slice(0, 5).map(goalRow).join("") ||
                '<div class="v78-empty">أضف أهدافك اليومية أو الأسبوعية أو السنوية.</div>') +
              '</div></div></section><section class="v78-main-grid"><div class="card v78-panel"><div class="v78-panel-head"><div><h3>المعرفة التي تستحق الاستكمال</h3><p>أقرب كتاب أو فيديو أو بودكاست للمتابعة.</p></div><button class="btn secondary mini" data-route="knowledge">فتح المعرفة</button></div><div class="v78-list">' +
              (know
                .filter(function (k) {
                  return pctKnowledge(k) < 100;
                })
                .slice(0, 5)
                .map(knowledgeRow)
                .join("") ||
                '<div class="v78-empty">لا توجد معرفة قيد المتابعة.</div>') +
              '</div></div><div class="card v78-panel"><div class="v78-panel-head"><div><h3>المراجعات والتركيز</h3><p>آخر مراجعاتك وجلسات التركيز.</p></div><button class="btn secondary mini" data-action="dailyReflection">مراجعة</button></div><div class="v78-mini-grid"><div class="v78-mini-card"><small>جلسات التركيز</small><b>' +
              focusSessions.length +
              '</b></div><div class="v78-mini-card"><small>هذا الأسبوع</small><b>' +
              focusWeek +
              '</b></div><div class="v78-mini-card"><small>المراجعات</small><b>' +
              reviews.length +
              '</b></div><div class="v78-mini-card"><small>آخر مراجعة</small><b>' +
              H(lastReviewLabel()) +
              '</b></div></div><div class="v78-list">' +
              (recentReviews.map(reviewRow).join("") ||
                '<div class="v78-empty">اكتب مراجعة اليوم عشان الداشبورد يتعلم منك.</div>') +
              '</div></div></section><section class="card v78-panel"><div class="v78-panel-head"><div><h3>جدول قريب</h3><p>المهام المجدولة القادمة مع أوقاتها.</p></div><button class="btn secondary mini" data-action="addTask">+ مهمة بوقت</button></div><div class="v78-list">' +
              (upcoming
                .map(function (t) {
                  return (
                    '<div class="v78-row"><div class="v78-row-icon">🗓️</div><div><b>' +
                    H(t.title || "مهمة") +
                    "</b><small>" +
                    dateText(t.dueAt) +
                    " • " +
                    timeText(t.dueAt) +
                    " • تنبيه قبل " +
                    (t.reminderMinutes || 0) +
                    ' دقيقة</small></div><button class="btn secondary mini" data-action="v69EditTask" data-id="' +
                    H(t.id || "") +
                    '">تعديل</button></div>'
                  );
                })
                .join("") ||
                '<div class="v78-empty">لا توجد مهام مجدولة قريبة.</div>') +
              "</div></section></div>"
            );
          }
                    function injectNav() {
            var nav = document.getElementById("nav");
            if (!nav || nav.querySelector('[data-route="dashboard"]')) return;
            var b = document.createElement("button");
            b.dataset.route = "dashboard";
            b.className =
              "v69-nav-dashboard " + (route() === "dashboard" ? "active" : "");
            b.setAttribute("aria-label", "Dashboard");
            b.innerHTML =
              "<span><b>📊</b><em>Dashboard</em></span><small></small>";
            nav.insertBefore(b, nav.children[1] || null);
            b.onclick = function () {
              setRoute("dashboard");
              api.render();
            };
          }
          function inject() {
            injectNav();
            var r = route(),
              v = document.getElementById("view");
            if (!v) return;
            if (r === "home") {
              v.innerHTML = homeHtml();
              var t = document.getElementById("pageTitle"),
                sub = document.getElementById("pageSub");
              if (t) t.textContent = "الرئيسية";
              if (sub) sub.textContent = "اليوم والمطلوب والإجراءات";
            } else if (r === "dashboard") {
              v.innerHTML = dashboardHtml();
              var t2 = document.getElementById("pageTitle"),
                sub2 = document.getElementById("pageSub");
              if (t2) t2.textContent = "Dashboard";
              if (sub2)
                sub2.textContent = "متابعة حية لكل ما يحدث داخل النظام.";
            }
          }
          api.render = function () {
            oldRender.apply(api, arguments);
            setTimeout(inject, 25);
          };
          window.MogahedOSX.render = api.render;
          var oldAddTask = Actions.addTask;
          Actions.addTask = function (id, el) {
            var t = id
              ? arr("tasks").find(function (x) {
                  return x.id === id;
                })
              : {};
            openTaskModal(t || {});
          };
          Actions.v69EditTask = function (id) {
            var t = arr("tasks").find(function (x) {
              return x.id === id;
            });
            openTaskModal(t || {});
          };
          function openTaskModal(t) {
            var due = t.dueAt ? new Date(t.dueAt) : null;
            var d = due && !isNaN(d) ? due.toISOString().slice(0, 10) : "";
            var tm =
              due && !isNaN(due)
                ? String(due.getHours()).padStart(2, "0") +
                  ":" +
                  String(due.getMinutes()).padStart(2, "0")
                : "";
            var html =
              '<label>المهمة</label><input id="t_title" value="' +
              H(t.title || "") +
              '"><label>المشروع / المصدر</label><input id="t_project" value="' +
              H(t.project || "") +
              '"><div class="v69-calendar-fields"><div><label>التاريخ</label><input id="t_dueDate" type="date" value="' +
              H(d) +
              '"></div><div><label>الوقت</label><input id="t_dueTime" type="time" value="' +
              H(tm) +
              '"></div></div><label>ذكرني قبل الموعد</label><select id="t_reminder"><option value="0">بدون تنبيه</option><option value="5">قبلها 5 دقائق</option><option value="10">قبلها 10 دقائق</option><option value="15">قبلها 15 دقيقة</option><option value="30">قبلها 30 دقيقة</option><option value="60">قبلها ساعة</option><option value="1440">قبلها يوم</option></select><button class="btn" data-action="v69SaveTask" data-id="' +
              H(t.id || "") +
              '">حفظ المهمة</button>';
            if (typeof window.openModal === "function")
              window.openModal(
                t.id ? "تعديل مهمة بوقت" : "إضافة مهمة بوقت",
                html,
              );
            else if (api.Actions && api.Actions.openModal)
              api.Actions.openModal("مهمة", html);
            setTimeout(function () {
              var s = document.getElementById("t_reminder");
              if (s) s.value = String(t.reminderMinutes || 0);
            }, 30);
          }
          Actions.v69SaveTask = function (id) {
            var title = (document.getElementById("t_title") || {}).value || "";
            if (title.trim().length < 2) {
              api.toast && api.toast("اكتب عنوان المهمة");
              return;
            }
            var project =
              (document.getElementById("t_project") || {}).value || "";
            var dd = (document.getElementById("t_dueDate") || {}).value || "";
            var tt = (document.getElementById("t_dueTime") || {}).value || "";
            var mins = Number(
              (document.getElementById("t_reminder") || {}).value || 0,
            );
            var dueAt = "";
            if (dd && tt) dueAt = dd + "T" + tt + ":00";
            else if (dd) dueAt = dd + "T09:00:00";
            var existing = arr("tasks").find(function (x) {
              return x.id === id;
            });
            var obj = {
              id:
                id ||
                "v69_" +
                  Date.now().toString(36) +
                  Math.random().toString(36).slice(2, 7),
              title: title.trim(),
              project: project.trim(),
              status: existing ? existing.status : "todo",
              dueAt: dueAt,
              reminderMinutes: mins,
              reminderNotified: false,
              dueNotified: false,
              createdAt: existing
                ? existing.createdAt
                : new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            };
            if (existing) Object.assign(existing, obj);
            else {
              st().tasks = arr("tasks");
              st().tasks.unshift(obj);
            }
            save();
            if (typeof window.closeModal === "function") window.closeModal();
            api.render();
            api.toast &&
              api.toast(dueAt ? "تم حفظ المهمة والتنبيه" : "تم حفظ المهمة");
          };
          var oldQuick = Actions.v637QuickTask;
          Actions.v637QuickTask = function () {
            var input = document.getElementById("v637_quick_task");
            var val = input && input.value ? input.value.trim() : "";
            if (!val) return api.toast && api.toast("اكتب المهمة");
            st().tasks = arr("tasks");
            st().tasks.unshift({
              id: "v69_" + Date.now().toString(36),
              title: val,
              project: "مهمة سريعة",
              status: "todo",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            });
            save();
            api.render();
            api.toast && api.toast("تمت إضافة المهمة");
          };
          function notifyTask(t, kind) {
            var title = kind === "due" ? "حان وقت المهمة" : "تذكير بمهمة قادمة";
            var msg =
              (t.title || "مهمة") +
              (kind === "due"
                ? " الآن"
                : " بعد " + (t.reminderMinutes || 0) + " دقيقة");
            try {
              api.toast && api.toast("⏰ " + msg);
            } catch (e) {}
            try {
              if ("Notification" in window) {
                if (Notification.permission === "granted")
                  new Notification(title, { body: msg });
                else if (Notification.permission !== "denied")
                  Notification.requestPermission().then(function (p) {
                    if (p === "granted") new Notification(title, { body: msg });
                  });
              }
            } catch (e) {}
          }
          function checkReminders() {
            var now = Date.now(),
              changed = false;
            pendingTasks().forEach(function (t) {
              if (!t.dueAt) return;
              var due = new Date(t.dueAt).getTime();
              if (isNaN(due)) return;
              var rem = Number(t.reminderMinutes || 0);
              if (
                rem > 0 &&
                !t.reminderNotified &&
                now >= due - rem * 60000 &&
                now < due
              ) {
                t.reminderNotified = true;
                changed = true;
                notifyTask(t, "reminder");
              }
              if (!t.dueNotified && now >= due) {
                t.dueNotified = true;
                changed = true;
                notifyTask(t, "due");
              }
            });
            if (changed) save();
          }
          setInterval(checkReminders, 30000);
          setTimeout(checkReminders, 1200);
          setTimeout(inject, 250);
        });
      })();
