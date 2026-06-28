// Extracted from V83 inline script block 4. Original id: v67-preview-script

(function () {
        function ready(fn) {
          if (window.MogahedOSX && window.MogahedOSX.Actions) {
            fn(window.MogahedOSX);
            return;
          }
          setTimeout(function () {
            ready(fn);
          }, 80);
        }
        ready(function (api) {
          if (api.__V67_ALL_IMPROVEMENTS_PREVIEW__) return;
          api.__V67_ALL_IMPROVEMENTS_PREVIEW__ = true;
          var oldRender = api.render,
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
          function pct(k) {
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
            return k.status === "done" || k.finished
              ? 100
              : Number(k.progress) || 0;
          }
          function active(a) {
            return a.filter(function (x) {
              return x && x.status !== "archived";
            });
          }
          function route() {
            try {
              return api.getRoute ? api.getRoute() : "home";
            } catch (e) {
              return "home";
            }
          }
          function notify(m, t, title) {
            try {
              (window.MogahedNotify || api.toast || window.toast)(m, t, title);
            } catch (e) {}
          }
          function save() {
            try {
              api.save(api.state);
            } catch (e) {
              try {
                api.save();
              } catch (_) {}
            }
          }
          function injectHome() {
            var v = document.getElementById("view");
            if (!v || document.getElementById("v67Dashboard")) return;
            var know = active(arr("knowledge")),
              books = know.filter(function (x) {
                return x.type === "كتاب";
              }),
              pods = know.filter(function (x) {
                return /بودكاست|فيديو|محاضرة/.test(x.type || "");
              }),
              open =
                active(arr("actions")).filter(function (x) {
                  return x.status !== "done";
                }).length +
                active(arr("tasks")).filter(function (x) {
                  return x.status !== "done";
                }).length,
              focus = arr("focusSessions").length,
              last = know.slice().sort(function (a, b) {
                return (b.updatedAt || b.createdAt || b.id || "").localeCompare(
                  a.updatedAt || a.createdAt || a.id || "",
                );
              })[0];
            var dash = document.createElement("div");
            dash.id = "v67Dashboard";
            dash.innerHTML =
              '<section class="v67-dashboard"><div class="v67-live"><h3>لوحة حية للنظام</h3><p>ملخص سريع يتغير حسب استخدامك: معرفة، تنفيذ، تركيز، واستكمال.</p><div class="v67-live-grid"><div class="v67-chip"><small>📚 كتب</small><b>' +
              books.length +
              '</b></div><div class="v67-chip"><small>🎧 بودكاست/فيديو</small><b>' +
              pods.length +
              '</b></div><div class="v67-chip"><small>⚡ مفتوح</small><b>' +
              open +
              '</b></div><div class="v67-chip"><small>⏳ جلسات تركيز</small><b>' +
              focus +
              '</b></div><div class="v67-chip"><small>🧠 آخر معرفة</small><b>' +
              H(last ? last.title : "لا يوجد") +
              '</b></div><div class="v67-chip"><small>🔎 Command</small><b>Ctrl + K</b></div></div></div><div class="v67-preview-card"><h3>تحسينات V67 Preview</h3><div class="v67-mini-list"><div class="v67-mini-row"><span>Animation System</span><b>✅</b></div><div class="v67-mini-row"><span>Smart Loading Skeleton</span><b>✅</b></div><div class="v67-mini-row"><span>Command Palette</span><b>✅</b></div><div class="v67-mini-row"><span>AI Memory + Graph Preview</span><b>✅</b></div><div class="v67-mini-row"><span>Auto Backup + Dashboard</span><b>✅</b></div></div></div></section>';
            v.prepend(dash);
          }
          function inferMemories() {
            var know = active(arr("knowledge")).slice(0, 6);
            if (!know.length)
              return '<div class="empty">أضف كتاب أو بودكاست، وسيظهر هنا ربط ذكي بين الأفكار.</div>';
            return know
              .map(function (k) {
                var text =
                  (k.ideas || k.summary || k.application || "")
                    .split("\n")
                    .filter(Boolean)[0] || "لا توجد فكرة محفوظة بعد";
                return (
                  '<div class="v67-memory-card"><b>' +
                  H(k.title) +
                  "</b><p>" +
                  H(text) +
                  "</p></div>"
                );
              })
              .join("");
          }
          function injectKnowledge() {
            var v = document.getElementById("view");
            if (!v || document.getElementById("v67Memory")) return;
            var box = document.createElement("div");
            box.id = "v67Memory";
            box.className = "card";
            box.style.marginBottom = "14px";
            box.innerHTML =
              '<div class="space"><div><h3>🧠 AI Memory Preview</h3><p class="muted">تجميع أفكار الكتب والبودكاست وربطها ببعض قبل التقسيم الهندسي الكامل.</p></div><button class="btn secondary mini" data-v67-action="buildMemory">تحديث الذاكرة</button></div><div class="v67-ai-memory">' +
              inferMemories() +
              "</div>";
            v.prepend(box);
          }
          function injectGraph() {
            var v = document.getElementById("view");
            if (!v || document.getElementById("v67Graph")) return;
            var know = active(arr("knowledge")).slice(0, 8),
              acts = active(arr("actions")).slice(0, 4);
            var nodes = [{ t: "Mogahed OS X", x: 50, y: 50, main: 1 }];
            know.forEach(function (k, i) {
              var a = (i / Math.max(1, know.length)) * Math.PI * 2;
              nodes.push({
                t: k.title || "معرفة",
                x: 50 + 34 * Math.cos(a),
                y: 50 + 34 * Math.sin(a),
              });
            });
            acts.forEach(function (k, i) {
              nodes.push({ t: k.title || "إجراء", x: 15 + 23 * i, y: 86 });
            });
            function link(x1, y1, x2, y2) {
              var dx = x2 - x1,
                dy = y2 - y1,
                l = Math.sqrt(dx * dx + dy * dy),
                ang = (Math.atan2(dy, dx) * 180) / Math.PI;
              return (
                '<i class="v67-link" style="left:' +
                x1 +
                "%;top:" +
                y1 +
                "%;width:" +
                l +
                "%;transform:rotate(" +
                ang +
                'deg)"></i>'
              );
            }
            var links = nodes
              .slice(1)
              .map(function (n) {
                return link(50, 50, n.x, n.y);
              })
              .join("");
            var html =
              links +
              nodes
                .map(function (n) {
                  return (
                    '<span class="v67-node ' +
                    (n.main ? "main" : "") +
                    '" style="left:' +
                    n.x +
                    "%;top:" +
                    n.y +
                    '%">' +
                    H(n.t).slice(0, 24) +
                    "</span>"
                  );
                })
                .join("");
            var box = document.createElement("div");
            box.id = "v67Graph";
            box.className = "card";
            box.style.marginBottom = "14px";
            box.innerHTML =
              '<h3>Knowledge Graph Preview</h3><p class="muted">عرض بصري سريع للعلاقة بين المعرفة والإجراءات. النسخة الهندسية ستجعله تفاعلي بالكامل.</p><div class="v67-graph">' +
              html +
              "</div>";
            v.prepend(box);
          }
          function injectWins() {
            var v = document.getElementById("view");
            if (!v || document.getElementById("v67Achievements")) return;
            var done = active(arr("actions")).filter(function (x) {
                return x.status === "done";
              }).length,
              books = active(arr("knowledge")).filter(function (x) {
                return pct(x) >= 100;
              }).length,
              focus = arr("focusSessions").length,
              days = arr("reviews").length;
            var box = document.createElement("div");
            box.id = "v67Achievements";
            box.innerHTML =
              '<section class="v67-achievements"><div class="v67-badge"><div class="ico">📚</div><b>' +
              books +
              '</b><small>معرفة مكتملة</small></div><div class="v67-badge"><div class="ico">⚡</div><b>' +
              done +
              '</b><small>إجراءات منتهية</small></div><div class="v67-badge"><div class="ico">⏳</div><b>' +
              focus +
              '</b><small>جلسات تركيز</small></div><div class="v67-badge"><div class="ico">🔥</div><b>' +
              days +
              "</b><small>مراجعات</small></div></section>";
            v.prepend(box);
          }
          function afterRender() {
            var r = route();
            injectGlobals();
            if (r === "home") injectHome();
            if (r === "knowledge") injectKnowledge();
            if (r === "graph") injectGraph();
            if (r === "wins" || r === "timeline") injectWins();
          }
          api.render = function () {
            oldRender.apply(api, arguments);
            setTimeout(afterRender, 0);
          };
          window.MogahedOSX.render = api.render;
          function allItems() {
            var pools = [
              ["الرئيسية", "home", "⌂", [{ title: "فتح الرئيسية" }]],
              [
                "التنفيذ",
                "actionHub",
                "⚡",
                arr("actions").concat(arr("tasks")),
              ],
              ["المعرفة", "knowledge", "🧠", arr("knowledge")],
              ["المشاريع", "projects", "▦", arr("projects")],
              ["الأهداف", "goals", "◎", arr("goals")],
              ["القرارات", "decisions", "◇", arr("decisions")],
              ["الأرشيف", "archive", "▤", arr("archive")],
            ];
            var out = [];
            pools.forEach(function (p) {
              (p[3] || []).forEach(function (x) {
                out.push({
                  label: p[0],
                  route: p[1],
                  icon: p[2],
                  title: x.title || x.name || x.text || p[0],
                  sub: x.summary || x.area || x.type || "انتقال سريع",
                });
              });
            });
            return out;
          }
          function openPalette() {
            injectGlobals();
            var p = document.getElementById("v67Palette");
            p.classList.add("open");
            var inp = document.getElementById("v67PaletteInput");
            inp.value = "";
            renderResults("");
            setTimeout(function () {
              inp.focus();
            }, 50);
          }
          function closePalette() {
            var p = document.getElementById("v67Palette");
            if (p) p.classList.remove("open");
          }
          function renderResults(q) {
            var box = document.getElementById("v67Results");
            if (!box) return;
            q = String(q || "").toLowerCase();
            var res = allItems()
              .filter(function (x) {
                return !q || JSON.stringify(x).toLowerCase().indexOf(q) > -1;
              })
              .slice(0, 18);
            box.innerHTML =
              res
                .map(function (x) {
                  return (
                    '<button class="v67-result" data-v67-route="' +
                    x.route +
                    '"><i>' +
                    x.icon +
                    "</i><span><b>" +
                    H(x.title) +
                    "</b><small>" +
                    H(x.label + " • " + x.sub) +
                    "</small></span><em>↵</em></button>"
                  );
                })
                .join("") || '<div class="empty">لا توجد نتائج</div>';
          }
          function injectGlobals() {
            if (!document.getElementById("v67CommandFab")) {
              var b = document.createElement("button");
              b.id = "v67CommandFab";
              b.className = "v67-command-fab";
              b.type = "button";
              b.textContent = "⌘";
              b.onclick = openPalette;
              document.body.appendChild(b);
            }
            if (!document.getElementById("v67Immersive")) {
              var im = document.createElement("button");
              im.id = "v67Immersive";
              im.className = "v67-immersive-toggle";
              im.type = "button";
              im.textContent = "⛶";
              im.onclick = function () {
                document.body.classList.toggle("v67-immersive");
                im.classList.toggle("active");
                notify(
                  document.body.classList.contains("v67-immersive")
                    ? "تم تشغيل وضع التركيز الكامل"
                    : "تم إيقاف وضع التركيز الكامل",
                  "success",
                );
              };
              document.body.appendChild(im);
            }
            if (!document.getElementById("v67Palette")) {
              var p = document.createElement("div");
              p.id = "v67Palette";
              p.className = "v67-palette";
              p.innerHTML =
                '<div class="v67-palette-box"><div class="v67-palette-head"><div class="v67-palette-icon">🔎</div><input id="v67PaletteInput" placeholder="ابحث في كل النظام أو اكتب اسم صفحة... Ctrl + K"></div><div class="v67-results" id="v67Results"></div></div>';
              document.body.appendChild(p);
              p.addEventListener("click", function (e) {
                if (e.target === p) closePalette();
                var r = e.target.closest("[data-v67-route]");
                if (r) {
                  api.setRoute(r.dataset.v67Route);
                  closePalette();
                  api.render();
                }
              });
              p.querySelector("input").addEventListener("input", function (e) {
                renderResults(e.target.value);
              });
            }
          }
          function autoBackup() {
            try {
              var key = "mogahed_os_v67_autobackup",
                now = Date.now(),
                old = JSON.parse(localStorage.getItem(key) || "{}");
              if (!old.time || now - old.time > 24 * 60 * 60 * 1000) {
                localStorage.setItem(
                  key,
                  JSON.stringify({ time: now, state: st() }),
                );
                notify(
                  "تم حفظ Auto Backup محلي لبيانات اليوم",
                  "success",
                  "نسخة احتياطية ذكية",
                );
              }
            } catch (e) {}
          }
          document.addEventListener("keydown", function (e) {
            if (
              (e.ctrlKey || e.metaKey) &&
              String(e.key).toLowerCase() === "k"
            ) {
              e.preventDefault();
              openPalette();
            }
            if (e.key === "Escape") closePalette();
          });
          document.addEventListener("click", function (e) {
            var a = e.target.closest("[data-v67-action]");
            if (!a) return;
            if (a.dataset.v67Action === "buildMemory") {
              notify(
                "تم تحديث AI Memory Preview بناءً على ملاحظات المعرفة الحالية",
                "success",
                "AI Memory",
              );
            }
          });
          api.Actions.v67SkeletonDemo = function () {
            notify("تم تجهيز Skeleton Loading للمعرفة والبحث والـ AI", "info");
          };
          setTimeout(function () {
            injectGlobals();
            afterRender();
            autoBackup();
          }, 350);
        });
      })();
