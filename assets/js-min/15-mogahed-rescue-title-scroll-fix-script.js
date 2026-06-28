(function () {
        function syncRescueModalClass() {
          var modal = document.getElementById("modal");
          var title = document.getElementById("modalTitle");
          if (!modal || !title) return;
          var isRescue =
            modal.classList.contains("open") &&
            /وضع الإنقاذ|طوارئ التشتت/.test((title.textContent || "").trim());
          modal.classList.toggle("mogahed-rescue-flow", !!isRescue);
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", syncRescueModalClass);
        else syncRescueModalClass();
        var tries = 0;
        var boot = setInterval(function () {
          var modal = document.getElementById("modal"),
            title = document.getElementById("modalTitle");
          if (modal && title) {
            clearInterval(boot);
            syncRescueModalClass();
            new MutationObserver(syncRescueModalClass).observe(modal, {
              attributes: true,
              attributeFilter: ["class"],
            });
            new MutationObserver(syncRescueModalClass).observe(title, {
              childList: true,
              characterData: true,
              subtree: true,
            });
          }
          if (++tries > 120) clearInterval(boot);
        }, 50);
      })();