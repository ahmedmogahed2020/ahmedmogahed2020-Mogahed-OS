// Extracted from V83 inline script block 12. Original id: mogahed-requested-unified-fab-script

(function () {
        function clickAction(action) {
          var btn = document.querySelector('[data-action="' + action + '"]');
          if (btn) {
            btn.click();
            return true;
          }
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            typeof window.MogahedOSX.Actions[action] === "function"
          ) {
            window.MogahedOSX.Actions[action]();
            return true;
          }
          return false;
        }
        function openSearch() {
          var palette = document.getElementById("v67CommandFab");
          if (palette) {
            palette.click();
            return;
          }
          var input = document.getElementById("globalSearch");
          if (input) {
            input.focus();
            input.scrollIntoView({ behavior: "smooth", block: "start" });
          }
        }
        function toggleTheme() {
          var theme = document.querySelector(".v62-theme-btn");
          if (theme) {
            theme.click();
            return;
          }
          document.body.classList.toggle("v62-light");
        }
        function toggleFull() {
          var full = document.getElementById("v67Immersive");
          if (full) {
            full.click();
            return;
          }
          var doc = document.documentElement;
          if (!document.fullscreenElement && doc.requestFullscreen)
            doc.requestFullscreen();
          else if (document.exitFullscreen) document.exitFullscreen();
        }
        function init() {
          if (document.getElementById("mogahedUnifiedFab")) return;
          document.body.classList.add("mogahed-unified-fab-ready");
          var wrap = document.createElement("div");
          wrap.id = "mogahedUnifiedFab";
          wrap.className = "mogahed-fab-wrap";
          wrap.innerHTML =
            '\
      <button class="mogahed-fab-item add" type="button" data-mogahed-fab="add" aria-label="إضافة سريعة">+<span class="mogahed-fab-label">إضافة</span></button>\
      <button class="mogahed-fab-item search" type="button" data-mogahed-fab="search" aria-label="بحث">🔎<span class="mogahed-fab-label">بحث</span></button>\
      <button class="mogahed-fab-item rescue" type="button" data-mogahed-fab="rescue" aria-label="طوارئ">🚨<span class="mogahed-fab-label">طوارئ</span></button>\
      <button class="mogahed-fab-item theme" type="button" data-mogahed-fab="theme" aria-label="الثيم">☀️<span class="mogahed-fab-label">الثيم</span></button>\
      <button class="mogahed-fab-item full" type="button" data-mogahed-fab="full" aria-label="ملء الشاشة">⛶<span class="mogahed-fab-label">ملء الشاشة</span></button>\
      <button class="mogahed-fab-main" type="button" aria-label="قائمة الأزرار العائمة">✦</button>';
          document.body.appendChild(wrap);
          wrap
            .querySelector(".mogahed-fab-main")
            .addEventListener("click", function (e) {
              e.stopPropagation();
              wrap.classList.toggle("open");
            });
          wrap.addEventListener("click", function (e) {
            var b = e.target.closest("[data-mogahed-fab]");
            if (!b) return;
            e.preventDefault();
            e.stopPropagation();
            var k = b.getAttribute("data-mogahed-fab");
            if (k === "add") clickAction("openQuickAdd");
            if (k === "search") openSearch();
            if (k === "rescue") clickAction("emergencyPlan");
            if (k === "theme") toggleTheme();
            if (k === "full") toggleFull();
            wrap.classList.remove("open");
          });
          document.addEventListener("click", function (e) {
            if (!e.target.closest("#mogahedUnifiedFab"))
              wrap.classList.remove("open");
          });
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", init);
        else init();
        setTimeout(init, 800);
      })();
