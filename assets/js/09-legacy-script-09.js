// Extracted from V83 inline script block 9. Original id: none

(function () {
        function boot() {
          var api = window.MogahedOSX;
          if (!api || api.__v72Separated) return;
          api.__v72Separated = true;
          var prevRender = api.render || function () {};
          function S() {
            return api.state || {};
          }
          function H(x) {
            return api.esc
              ? api.esc(String(x || ""))
              : String(x || "").replace(/[&<>"']/g, function (c) {
                  return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  }[c];
                });
          }
          function arr(k) {
            return Array.isArray(S()[k]) ? S()[k] : [];
          }
          function route() {
            return api.getRoute ? api.getRoute() : "home";
          }
          function setRoute(r) {
            api.setRoute ? api.setRoute(r) : null;
          }
          function notDone(x) {
            return (
              !x.archived &&
              !["done", "completed", "closed", "تم", "منتهي"].includes(
                String(x.status || "").toLowerCase(),
              ) &&
              !x.done
            );
          }
          function pct(x) {
            var p = Number(x.progress || 0);
            if (!p && x.totalUnits)
              p = Math.round(
                (Number(x.currentUnit || 0) / Number(x.totalUnits || 1)) * 100,
              );
            return Math.max(0, Math.min(100, p || 0));
          }
          function dateText(x) {
            return (
              x.time ||
              x.dueTime ||
              x.due ||
              x.date ||
              x.reviewDate ||
              x.deadline ||
              ""
            );
          }
          function isToday(x) {
            var d = dateText(x),
              today = new Date().toISOString().slice(0, 10);
            return (
              String(d || "").indexOf(today) > -1 ||
              String(d || "").indexOf(new Date().toLocaleDateString("en-CA")) >
                -1 ||
              String(d || "").indexOf(new Date().toLocaleDateString("ar-EG")) >
                -1
            );
          }
          function timeLabel(x) {
            var d = String(dateText(x) || "");
            var m = d.match(/(\d{1,2}:\d{2})/);
            return m ? m[1] : x.time || x.dueTime || "اليوم";
          }
          function openTasks() {
            return arr("tasks").concat(arr("actions")).filter(notDone);
          }
          function todayItems() {
            var items = openTasks().filter(isToday);
            return items.length
              ? items
              : openTasks()
                  .filter(function (x) {
                    return dateText(x);
                  })
                  .slice(0, 6);
          }
          function decisions() {
            return arr("decisions").filter(notDone).slice(0, 5);
          }
          function row(icon, title, sub, btn, act, id) {
            return (
              '<div class="v72-row"><div class="v72-row-ico">' +
              icon +
              "</div><div><h4>" +
              H(title) +
              "</h4><p>" +
              H(sub || "") +
              "</p></div>" +
              (btn
                ? '<button class="btn secondary mini" data-action="' +
                  act +
                  '" ' +
                  (id ? 'data-id="' + H(id) + '"' : "") +
                  ">" +
                  btn +
                  "</button>"
                : "") +
              "</div>"
            );
          }
          function homeHTML() {
            var items = todayItems(),
              cur = items[0] || openTasks()[0],
              decs = decisions(),
              know = arr("knowledge")
                .filter(notDone)
                .sort(function (a, b) {
                  return pct(a) - pct(b);
                })[0];
            var goal = arr("goals").filter(notDone)[0] || {},
              project = arr("projects").filter(notDone)[0] || {};
            return (
              '<div class="v72-home"><section class="v72-hero"><span class="v72-eyebrow">⌂ الرئيسية • Today Command</span><h2>مركز تنفيذ النهارده فقط</h2><p>هنا مش داشبورد. هنا المطلوب منك اليوم: مهمة الآن، مواعيد اليوم، قرارات محتاجة حسم، واستكمال سريع بدون زحمة تحليلات.</p><div class="v72-hero-actions"><button class="btn" data-action="openFocus">▶ ابدأ الآن</button><button class="btn secondary" data-action="addTask">+ مهمة بوقت</button><button class="btn secondary" data-action="addDecision">+ قرار</button></div></section><section class="v72-layout"><div class="card v72-card v72-now"><div class="v72-section-head"><div><h3>🎯 المطلوب الآن</h3><p>مهمة واحدة واضحة بدل زحمة الأرقام.</p></div><span class="pill">Priority One</span></div><h2 class="v72-now-title">' +
              H(cur ? cur.title : "لا توجد مهمة محددة الآن") +
              '</h2><p class="muted">' +
              H(
                cur
                  ? cur.reason ||
                      cur.project ||
                      cur.area ||
                      dateText(cur) ||
                      "ابدأ بها الآن."
                  : "أضف مهمة واحدة بوقت أو إجراء سريع لتظهر هنا.",
              ) +
              '</p><div class="v72-meta"><div class="v72-mini"><small>الوقت</small><b>' +
              H(cur ? timeLabel(cur) : "غير محدد") +
              '</b></div><div class="v72-mini"><small>الهدف</small><b>' +
              H(goal.title || "لا يوجد هدف") +
              '</b></div><div class="v72-mini"><small>المشروع</small><b>' +
              H(project.title || "لا يوجد مشروع") +
              '</b></div></div><div class="row"><button class="btn" data-action="openFocus">تشغيل Focus</button><button class="btn rescue" data-action="emergencyPlan">طوارئ التشتت</button><button class="btn secondary" data-action="addAction">إجراء جديد</button></div></div><div class="card v72-card"><div class="v72-section-head"><div><h3>🗓️ حاجات النهارده</h3><p>كل مهمة لها وقت أو أولوية اليوم.</p></div><button class="btn secondary mini" data-action="addTask">+ إضافة</button></div><div class="v72-agenda">' +
              (items.length
                ? items
                    .slice(0, 7)
                    .map(function (t) {
                      return (
                        '<div class="v72-time-row"><div class="v72-time">' +
                        H(timeLabel(t)) +
                        "</div><div><b>" +
                        H(t.title) +
                        "</b><small>" +
                        H(t.project || t.area || t.type || "مهمة اليوم") +
                        '</small></div><button class="btn secondary mini" data-action="openFocus">بدء</button></div>'
                      );
                    })
                    .join("")
                : '<div class="v72-empty">لا توجد مهام مجدولة لليوم. أضف أول مهمة بوقت.</div>') +
              '</div></div></section><section class="v72-bottom"><div class="card v72-card"><div class="v72-section-head"><div><h3>◇ قرارات محتاجة حسم</h3><p>القرارات تظهر هنا في الرئيسية لأنها من شغل اليوم.</p></div><button class="btn secondary mini" data-action="addDecision">+ قرار</button></div><div class="v72-decisions">' +
              (decs.length
                ? decs
                    .map(function (d) {
                      return (
                        '<div class="v72-decision"><b>' +
                        H(d.title || d.question || "قرار بدون عنوان") +
                        "</b><small>" +
                        H(
                          d.context ||
                            d.reason ||
                            d.options ||
                            d.area ||
                            "راجع القرار وحدد الخطوة القادمة.",
                        ) +
                        "</small></div>"
                      );
                    })
                    .join("")
                : '<div class="v72-empty">لا توجد قرارات مفتوحة حالياً.</div>') +
              '</div></div><div class="card v72-card"><div class="v72-section-head"><div><h3>🧠 استكمال سريع</h3><p>حاجة واحدة تكملها اليوم بدون الخروج من النظام.</p></div><button class="btn secondary mini" data-route="knowledge">المعرفة</button></div>' +
              (know
                ? row(
                    /بودكاست|فيديو|محاضرة/.test(know.type || "") ? "▶" : "📚",
                    know.title,
                    (know.type || "معرفة") + " • " + pct(know) + "%",
                    "فتح",
                    "openKnowledgePlayer",
                    know.id,
                  )
                : '<div class="v72-empty">أضف كتاب أو فيديو أو بودكاست للاستكمال.</div>') +
              "</div></section></div>"
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
            b.innerHTML =
              "<span><b>📊</b><em>Dashboard</em></span><small></small>";
            b.classList.toggle("active", route() === "dashboard");
          }
          function inject() {
            injectNav();
            if (route() !== "home") return;
            var v = document.getElementById("view");
            if (!v) return;
            v.innerHTML = homeHTML();
            var t = document.getElementById("pageTitle"),
              sub = document.getElementById("pageSub");
            if (t) t.textContent = "الرئيسية";
            if (sub)
              sub.textContent =
                "مهام النهارده، القرارات، والمطلوب الآن فقط. الداشبورد الكامل في صفحة Dashboard.";
          }
          api.render = function () {
            try {
              prevRender.apply(api, arguments);
            } catch (e) {
              console.warn(e);
            }
            setTimeout(inject, 90);
          };
          window.MogahedOSX.render = api.render;
          document.addEventListener("click", function (e) {
            var b =
              e.target.closest &&
              e.target.closest('[data-route="dashboard"],[data-route="home"]');
            if (!b) return;
            var r = b.getAttribute("data-route");
            setTimeout(function () {
              setRoute(r);
              api.render && api.render();
            }, 0);
          });
          setTimeout(inject, 250);
          setTimeout(inject, 900);
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", boot);
        else boot();
      })();
