// Extracted from V83 inline script block 5. Original id: none

(function () {
        function ready(cb) {
          if (window.MogahedOSX && window.MogahedOSX.state) {
            cb(window.MogahedOSX);
          } else
            setTimeout(function () {
              ready(cb);
            }, 60);
        }
        ready(function (api) {
          if (window.__V68_DASHBOARD__) return;
          window.__V68_DASHBOARD__ = true;
          var oldRender = api.render;
          var H =
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
          function s() {
            return api.state || {};
          }
          function arr(k) {
            return Array.isArray(s()[k]) ? s()[k] : [];
          }
          function active(k) {
            return arr(k).filter(function (x) {
              return x && x.status !== "archived";
            });
          }
          function progress(k) {
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
          function route() {
            try {
              return api.getRoute ? api.getRoute() : "home";
            } catch (e) {
              return "home";
            }
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
            ].forEach(function (k) {
              arr(k).forEach(function (x) {
                all.push({
                  kind: k,
                  title: x.title || x.name || x.text || "نشاط",
                  sub: x.type || x.area || x.status || x.date || "",
                  time:
                    x.updatedAt || x.createdAt || x.date || x.iso || x.id || "",
                });
              });
            });
            return all
              .sort(function (a, b) {
                return String(b.time).localeCompare(String(a.time));
              })
              .slice(0, 5);
          }
          function dashboard() {
            var name = (s().profile && s().profile.name) || "مجاهد";
            var actions = active("actions"),
              tasks = active("tasks"),
              projects = active("projects"),
              goals = active("goals"),
              know = active("knowledge");
            var open =
              actions.filter(function (x) {
                return x.status !== "done";
              }).length +
              tasks.filter(function (x) {
                return x.status !== "done";
              }).length;
            var done =
              actions.filter(function (x) {
                return x.status === "done";
              }).length +
              tasks.filter(function (x) {
                return x.status === "done";
              }).length;
            var focus = arr("focusSessions").length,
              reviews = arr("reviews").length,
              wins = arr("timeline").length;
            var books = know.filter(function (x) {
                return x.type === "كتاب";
              }).length,
              media = know.filter(function (x) {
                return /بودكاست|فيديو|محاضرة|دورة/.test(x.type || "");
              }).length;
            var current =
              tasks.find(function (x) {
                return x.status !== "done";
              }) ||
              actions.find(function (x) {
                return x.status !== "done";
              });
            var goal = goals[0],
              proj = projects[0];
            var cont =
              know
                .filter(function (k) {
                  var p = progress(k);
                  return p > 0 && p < 100;
                })
                .sort(function (a, b) {
                  return progress(b) - progress(a);
                })[0] || know[0];
            var kp = cont ? progress(cont) : 0;
            var score = Math.min(
              100,
              Math.round(
                ((done * 8 + focus * 5 + reviews * 7 + wins * 6 + kp) /
                  Math.max(1, open * 4 + 50)) *
                  10,
              ),
            );
            if (!isFinite(score)) score = 0;
            var mood =
              open > 8
                ? "ضغط عالي"
                : open > 3
                  ? "نشط"
                  : current
                    ? "جاهز للتنفيذ"
                    : "هادئ";
            var insight =
              open > 6
                ? "عندك مهام مفتوحة كتير. ابدأ بمهمة واحدة فقط لمدة 25 دقيقة."
                : cont
                  ? "أفضل خطوة الآن: كمّل آخر محتوى معرفة ثم حوّل فكرة واحدة لإجراء."
                  : "ابدأ بإضافة كتاب أو بودكاست واحد فقط للنظام.";
            var rec = recent();
            var knowledgeCards =
              know
                .slice(0, 3)
                .map(function (k) {
                  var p = progress(k);
                  return (
                    '<div class="v68-progress-card"><h4>' +
                    H(k.title || "بدون عنوان") +
                    "</h4><p>" +
                    H(k.type || "معرفة") +
                    " • " +
                    p +
                    '%</p><div class="progress"><div class="bar" style="width:' +
                    p +
                    '%"></div></div>' +
                    (k.mediaData || k.mediaUrl || k.link
                      ? '<button class="btn mini" style="margin-top:9px;width:100%" data-action="openKnowledgePlayer" data-id="' +
                        H(k.id) +
                        '">▶ استكمال</button>'
                      : "") +
                    "</div>"
                  );
                })
                .join("") ||
              '<div class="v68-empty">أضف كتاب أو بودكاست، وسيظهر تقدمه هنا.</div>';
            var recentHtml =
              rec
                .map(function (x) {
                  var ico =
                    {
                      knowledge: "🧠",
                      actions: "⚡",
                      projects: "📌",
                      goals: "🎯",
                      reviews: "✓",
                      decisions: "◇",
                      timeline: "🏆",
                      inbox: "💡",
                    }[x.kind] || "•";
                  return (
                    '<div class="v68-timeline-row"><b>' +
                    ico +
                    " " +
                    H(x.title).slice(0, 70) +
                    "</b><small>" +
                    H(x.sub || x.kind) +
                    "</small></div>"
                  );
                })
                .join("") ||
              '<div class="v68-empty">لا يوجد نشاط حديث بعد.</div>';
            return (
              '<div class="v68-home" id="v68ExecutiveDashboard">' +
              '<section class="v68-hero"><div class="v68-hero-grid"><div><span class="v68-kicker">● Dashboard حي مرتبط بالنظام</span><h2>أهلاً يا ' +
              H(name) +
              ' — ماذا ستنفّذ الآن؟</h2><p>الرئيسية هنا لم تعد كارت ترحيب؛ دي غرفة قيادة تعرض حالتك الفعلية من المهام، المعرفة، التركيز، الإنجازات، وآخر نشاط داخل النظام.</p><div class="v68-actions"><button class="btn" data-action="openFocus">▶ ابدأ تركيز الآن</button><button class="btn rescue" data-action="emergencyPlan">🚨 إنقاذ التشتت</button><button class="btn secondary" data-action="openQuickAdd">+ إضافة سريعة</button></div></div><div class="v68-today-score"><div class="v68-ring" style="--p:' +
              score +
              '"><strong>' +
              score +
              "%</strong></div><small>مؤشر تشغيل النظام • " +
              H(mood) +
              "</small></div></div></section>" +
              '<section class="v68-metrics"><div class="v68-metric"><small><span>⚡ مفتوح</span><span>تنفيذ</span></small><strong>' +
              open +
              '</strong><p>مهام وإجراءات تحتاج حسم.</p></div><div class="v68-metric"><small><span>✅ منتهي</span><span>نتائج</span></small><strong>' +
              done +
              '</strong><p>إجراءات اتحولت لإنجاز.</p></div><div class="v68-metric"><small><span>🧠 معرفة</span><span>كتب/بودكاست</span></small><strong>' +
              know.length +
              "</strong><p>" +
              books +
              " كتب • " +
              media +
              ' صوت/فيديو</p></div><div class="v68-metric"><small><span>⏳ تركيز</span><span>جلسات</span></small><strong>' +
              focus +
              "</strong><p>" +
              reviews +
              " مراجعات • " +
              wins +
              " فوز مسجل</p></div></section>" +
              '<section class="v68-main"><div class="card v68-panel"><div class="v68-section-title"><h3>🎯 المهمة الحية الآن</h3><span class="pill">Priority</span></div><h2 class="v68-task-title">' +
              H(current ? current.title : "لا توجد مهمة حالياً") +
              '</h2><p class="muted">' +
              H(
                current
                  ? current.reason ||
                      current.area ||
                      current.project ||
                      "ابدأ تنفيذها الآن."
                  : "أضف إجراء واحد فقط، ثم شغّل Focus Mode.",
              ) +
              '</p><div class="v68-now-grid"><div class="v68-mini"><small>الهدف الحالي</small><b>' +
              H(goal ? goal.title : "أضف هدفك الأساسي") +
              '</b></div><div class="v68-mini"><small>المشروع الحالي</small><b>' +
              H(proj ? proj.title : "لا يوجد مشروع محدد") +
              '</b></div></div><div class="row"><button class="btn" data-action="openFocus">تشغيل Focus Mode</button><button class="btn secondary" data-action="addAction">إجراء جديد</button><button class="btn secondary" data-route="projects">المشاريع</button></div></div><div class="card v68-panel"><div class="v68-section-title"><h3>🧠 استكمال ذكي</h3><span class="pill">' +
              kp +
              "%</span></div>" +
              (cont
                ? '<div class="v68-live-item"><div class="v68-live-ico">' +
                  (cont.type === "بودكاست"
                    ? "🎧"
                    : /فيديو|محاضرة/.test(cont.type || "")
                      ? "▶"
                      : "📚") +
                  "</div><div><h4>" +
                  H(cont.title) +
                  "</h4><p>" +
                  H(cont.type || "معرفة") +
                  ' • آخر عنصر مناسب للاستكمال</p></div><button class="btn mini" data-action="openKnowledgePlayer" data-id="' +
                  H(cont.id) +
                  '">افتح</button></div><div class="progress" style="margin-top:10px"><div class="bar" style="width:' +
                  kp +
                  '%"></div></div>'
                : '<div class="v68-empty">لا يوجد عنصر معرفة للاستكمال.</div>') +
              '<div class="item v68-insight" style="margin-top:10px"><b>💡 توصية النظام</b><p>' +
              H(insight) +
              "</p></div></div></section>" +
              '<section class="v68-bottom"><div class="card v68-panel"><div class="v68-section-title"><h3>📚 تقدم المعرفة</h3><button class="btn secondary mini" data-route="knowledge">فتح</button></div><div class="v68-knowledge">' +
              knowledgeCards +
              '</div></div><div class="card v68-panel"><div class="v68-section-title"><h3>📡 آخر نشاط</h3><span class="pill">Live</span></div><div class="v68-timeline">' +
              recentHtml +
              '</div></div><div class="card v68-panel ' +
              (open > 6 ? "v68-warning" : "") +
              '"><div class="v68-section-title"><h3>⚙ حالة النظام</h3><button class="btn secondary mini" data-route="settings">الإعدادات</button></div><div class="v68-live-list"><div class="v68-live-item"><div class="v68-live-ico">🛡️</div><div><h4>النسخ الاحتياطي</h4><p>استخدم Export Backup قبل أي تعديل كبير.</p></div></div><div class="v68-live-item"><div class="v68-live-ico">🔎</div><div><h4>البحث والأوامر</h4><p>استخدم زر ⌘ أو Ctrl + K للوصول السريع.</p></div></div><div class="v68-live-item"><div class="v68-live-ico">🚨</div><div><h4>الطوارئ</h4><p>جاهزة وقت التشتت بدون الخروج من النظام.</p></div></div></div></div></section>' +
              "</div>"
            );
          }
          function inject() {
            if (route() !== "home") return;
            var v = document.getElementById("view");
            if (!v) return;
            v.innerHTML = dashboard();
            var title = document.getElementById("pageTitle"),
              sub = document.getElementById("pageSub");
            if (title) title.textContent = "الرئيسية";
            if (sub) sub.textContent = "Dashboard حي مرتبط بكل بيانات النظام.";
          }
          api.render = function () {
            oldRender.apply(api, arguments);
            setTimeout(inject, 20);
          };
          window.MogahedOSX.render = api.render;
          setTimeout(inject, 200);
        });
      })();
