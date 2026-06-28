// Extracted from V83 inline script block 22. Original id: v764-knowledge-header-save-script

(function () {
        function modal() {
          return document.getElementById("modal");
        }
        function makeBtn() {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "btn mini knowledge-header-save";
          b.setAttribute("data-action", "quickSaveKnowledgeHeader");
          b.textContent = "حفظ";
          return b;
        }
        function insertBeforeClose(closeBtn) {
          if (!closeBtn || closeBtn.parentNode?.querySelector?.(".knowledge-header-save")) return;
          closeBtn.parentNode.insertBefore(makeBtn(), closeBtn);
        }
        function ensureKnowledgeSaveButton() {
          var m = modal();
          if (!m || !m.classList.contains("player-mode")) return;
          var selectors = [
            ".v638-player-head [data-action='closeModal']",
            ".vfinal-head [data-action='closeModal']",
            ".player-head [data-action='closeModal']",
            ".v655-clean-modal .v655-head [data-action='closeModal']"
          ];
          selectors.forEach(function (sel) {
            m.querySelectorAll(sel).forEach(insertBeforeClose);
          });
          // fallback: any close button inside a knowledge/player header only
          m.querySelectorAll(".v638-player-head, .vfinal-head, .player-head").forEach(function (head) {
            var closeBtn = head.querySelector("[data-action='closeModal']");
            insertBeforeClose(closeBtn);
          });
        }
        function clickAction(m, action) {
          var clicked = 0;
          m.querySelectorAll("button[data-action='" + action + "']").forEach(function (btn) {
            if (btn.classList.contains("knowledge-header-save")) return;
            if (btn.offsetParent === null && action !== "v652SaveKnowledgeAI") return;
            try {
              btn.click();
              clicked++;
            } catch (e) {}
          });
          return clicked;
        }
        document.addEventListener(
          "click",
          function (e) {
            var btn = e.target && e.target.closest && e.target.closest("[data-action='quickSaveKnowledgeHeader']");
            if (!btn) return;
            e.preventDefault();
            e.stopPropagation();
            var m = modal();
            if (!m) return;
            var total = 0;
            [
              "v642SaveAll",
              "v638SaveProgress",
              "v638SaveDetails",
              "v641SaveProgress",
              "v641SaveDetails",
              "v655SaveProgress",
              "vfinalSaveProgress",
              "saveReaderProgress",
              "savePlayerNotes",
              "v652SaveKnowledgeAI"
            ].forEach(function (action) {
              total += clickAction(m, action);
            });
            if (typeof window.toast === "function") {
              window.toast(total ? "تم حفظ المعرفة" : "لا يوجد شيء ظاهر للحفظ هنا");
            }
          },
          true
        );
        var run = function () { setTimeout(ensureKnowledgeSaveButton, 0); };
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", run);
        else run();
        new MutationObserver(run).observe(document.documentElement, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ["class"]
        });
      })();
