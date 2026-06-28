// Extracted from V83 inline script block 19. Original id: mogahed-v75-stabilizer-script

(function () {
        "use strict";
        var STORAGE_KEY = "mogahed_os_x_v1";
        var PATCH = "V75 Stabilized No Feature Loss";
        function $(id) { return document.getElementById(id); }
        function api() { return window.MogahedOSX || {}; }
        function actions() { return (api() && api().Actions) || {}; }
        function esc(s) {
          return String(s == null ? "" : s).replace(/[&<>'"]/g, function (c) {
            return {"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;"}[c];
          });
        }
        function toast(msg) {
          if (api().toast) api().toast(msg);
          else {
            var t = $("toast");
            if (!t) return;
            t.textContent = msg;
            t.style.display = "block";
            clearTimeout(toast._t);
            toast._t = setTimeout(function(){ t.style.display = "none"; }, 2500);
          }
        }
        function safeAction(name, dataset) {
          var fn = actions()[name];
          var fakeButton = { dataset: dataset || {}, closest: function(){ return null; } };
          try {
            if (typeof fn === "function") return fn(dataset && (dataset.id || dataset.url || dataset.route), fakeButton);
            toast("الأمر غير متاح في هذه النسخة: " + name);
          } catch (e) {
            console.error("V75 action failed", name, e);
            toast("حصل خطأ بسيط في الأمر، البيانات محفوظة.");
          }
        }
        function installStorageGuard() {
          if (window.__mogahedV75StorageGuard) return;
          window.__mogahedV75StorageGuard = true;
          var oldSet = localStorage.setItem.bind(localStorage);
          localStorage.setItem = function (key, value) {
            try {
              if (key === STORAGE_KEY) {
                var previous = localStorage.getItem(STORAGE_KEY);
                if (previous && previous !== value) {
                  oldSet(STORAGE_KEY + "__auto_backup", previous);
                  oldSet(STORAGE_KEY + "__auto_backup_at", new Date().toISOString());
                }
              }
            } catch (e) {}
            return oldSet(key, value);
          };
        }
        function installWheel() {
          if ($("mogahedCommandWheel")) return;
          document.body.classList.add("v75-wheel-ready");
          var wheel = document.createElement("div");
          wheel.id = "mogahedCommandWheel";
          wheel.setAttribute("aria-label", "قائمة الأوامر السريعة");
          wheel.innerHTML = ''+
            '<button class="v75-wheel-main" type="button" aria-label="فتح الأوامر">+</button>'+
            '<button class="v75-wheel-action" type="button" data-v75-action="quickAdd" aria-label="إضافة"><span>＋</span><small>إضافة</small></button>'+
            '<button class="v75-wheel-action" type="button" data-v75-action="search" aria-label="بحث"><span>⌕</span><small>بحث</small></button>'+
            '<button class="v75-wheel-action" type="button" data-v75-action="focus" aria-label="تركيز"><span>◷</span><small>تركيز</small></button>'+
            '<button class="v75-wheel-action" type="button" data-v75-action="fullscreen" aria-label="ملء الشاشة"><span>⛶</span><small>ملء الشاشة</small></button>'+
            '<button class="v75-wheel-action" type="button" data-v75-action="emergency" aria-label="طوارئ"><span>🚨</span><small>طوارئ</small></button>';
          document.body.appendChild(wheel);
          wheel.querySelector(".v75-wheel-main").addEventListener("click", function (ev) {
            ev.stopPropagation();
            wheel.classList.toggle("open");
          });
          wheel.addEventListener("click", function (ev) {
            var btn = ev.target.closest("[data-v75-action]");
            if (!btn) return;
            ev.preventDefault(); ev.stopPropagation();
            wheel.classList.remove("open");
            var a = btn.dataset.v75Action;
            if (a === "quickAdd") safeAction("openQuickAdd", {});
            if (a === "emergency") safeAction("emergencyPlan", {});
            if (a === "focus") safeAction("openFocus", {});
            if (a === "fullscreen") toggleFullscreen();
            if (a === "search") openSearchModal();
          });
          document.addEventListener("click", function (ev) {
            if (!wheel.contains(ev.target)) wheel.classList.remove("open");
          }, true);
        }
        function toggleFullscreen() {
          try {
            if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
              document.documentElement.requestFullscreen();
              toast("تم تفعيل ملء الشاشة");
            } else if (document.exitFullscreen) {
              document.exitFullscreen();
              toast("تم الخروج من ملء الشاشة");
            }
          } catch (e) { toast("المتصفح منع ملء الشاشة"); }
        }
        function openSearchModal() {
          var modal = $("modal"), title = $("modalTitle"), body = $("modalBody");
          if (!modal || !title || !body) return;
          title.textContent = "بحث سريع";
          body.innerHTML = '<div class="v75-search-shell"><input id="v75SearchInput" placeholder="ابحث في المهام، المعرفة، المشاريع، القرارات..." autocomplete="off"><div id="v75SearchResults" class="v75-search-results"><div class="empty">اكتب كلمة للبحث.</div></div></div>';
          modal.classList.add("open");
          setTimeout(function(){ var i=$("v75SearchInput"); if(i) i.focus(); }, 50);
          var input = $("v75SearchInput"), results = $("v75SearchResults");
          if (!input || !results) return;
          input.addEventListener("input", function () { renderSearch(input.value, results); });
        }
        function renderSearch(q, box) {
          q = String(q || "").trim().toLowerCase();
          if (!q) { box.innerHTML = '<div class="empty">اكتب كلمة للبحث.</div>'; return; }
          var st = api().state || {};
          var sources = [
            ["knowledge", "المعرفة", st.knowledge || []],
            ["actions", "الإجراءات", st.actions || []],
            ["tasks", "المهام", st.tasks || []],
            ["projects", "المشاريع", st.projects || []],
            ["goals", "الأهداف", st.goals || []],
            ["decisions", "القرارات", st.decisions || []],
            ["reviews", "المراجعات", st.reviews || []],
            ["crm", "العلاقات", st.contacts || st.people || []]
          ];
          var found = [];
          sources.forEach(function (src) {
            (src[2] || []).forEach(function (x) {
              if (x && x.archived) return;
              var hay = [x.title, x.summary, x.reason, x.notes, x.type, x.area, x.project, x.name, x.outcome].join(" ").toLowerCase();
              if (hay.indexOf(q) !== -1) found.push({ route: src[0] === "tasks" ? "projects" : src[0], label: src[1], item: x });
            });
          });
          found = found.slice(0, 20);
          if (!found.length) { box.innerHTML = '<div class="empty">لا توجد نتيجة واضحة.</div>'; return; }
          box.innerHTML = found.map(function (r, idx) {
            var name = r.item.title || r.item.name || r.item.summary || "عنصر بدون عنوان";
            var sub = [r.label, r.item.type, r.item.status, r.item.area].filter(Boolean).join(" • ");
            return '<button class="v75-search-result" data-idx="'+idx+'"><b>'+esc(name)+'</b><span>'+esc(sub)+'</span></button>';
          }).join("");
          Array.prototype.forEach.call(box.querySelectorAll(".v75-search-result"), function (b) {
            b.addEventListener("click", function () {
              var r = found[Number(b.dataset.idx)];
              if (!r) return;
              if (api().setRoute) api().setRoute(r.route);
              if (api().render) api().render();
              if (actions().closeModal) safeAction("closeModal", {}); else { var m=$("modal"); if(m)m.classList.remove("open"); }
              toast("تم فتح: " + r.label);
            });
          });
        }
        function normalizeAfterRender() {
          document.body.classList.add("v75-wheel-ready");
          var nav = $("nav");
          if (nav) nav.setAttribute("aria-label", "التنقل الرئيسي");
          var more = document.querySelector("#view .hub-grid.more-grid");
          if (more) more.classList.add("more-grid");
          var cards = document.querySelectorAll("#view .knowledge-card");
          cards.forEach(function (card) {
            var play = card.querySelector('[data-action="openKnowledgePlayer"]');
            if (play && !play.textContent.match(/داخل المشروع|استكمال|تشغيل/)) play.textContent = "▶ تشغيل داخل المشروع";
          });
        }
        function wrapRender() {
          var a = api();
          if (!a || !a.render || a.__v75RenderWrapped) return;
          var oldRender = a.render;
          a.render = function () {
            var out = oldRender.apply(this, arguments);
            setTimeout(normalizeAfterRender, 0);
            return out;
          };
          a.__v75RenderWrapped = true;
        }
        function boot() {
          installStorageGuard();
          installWheel();
          wrapRender();
          normalizeAfterRender();
          document.documentElement.setAttribute("data-mogahed-build", PATCH);
        }
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
        else boot();
        setTimeout(boot, 400);
        setTimeout(boot, 1200);
      })();
