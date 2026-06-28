(function () {
        function isRescueTitle(txt) {
          return /وضع الإنقاذ|طوارئ التشتت/.test((txt || "").trim());
        }
        function applyRescueInlineTitle() {
          var modal = document.getElementById("modal");
          var title = document.getElementById("modalTitle");
          var body = document.getElementById("modalBody");
          if (!modal || !title || !body) return;
          var rescue =
            modal.classList.contains("open") &&
            isRescueTitle(title.textContent || "");
          modal.classList.toggle("mogahed-rescue-flow", !!rescue);
          if (!rescue) return;
          if (!body.querySelector(".mogahed-rescue-inline-title")) {
            body.insertAdjacentHTML(
              "afterbegin",
              '<div class="mogahed-rescue-inline-title"><h3>' +
                (title.textContent || "🚨 وضع الإنقاذ")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;") +
                '</h3><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div>',
            );
          } else {
            var h = body.querySelector(".mogahed-rescue-inline-title h3");
            if (h) h.textContent = title.textContent || "🚨 وضع الإنقاذ";
          }
        }
        var oldOpen = window.openModal;
        if (
          typeof oldOpen === "function" &&
          !oldOpen.__mogahedRescueInlineWrapped
        ) {
          var wrapped = function (title, body) {
            var r = oldOpen.apply(this, arguments);
            setTimeout(applyRescueInlineTitle, 0);
            setTimeout(applyRescueInlineTitle, 40);
            return r;
          };
          wrapped.__mogahedRescueInlineWrapped = true;
          window.openModal = wrapped;
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", applyRescueInlineTitle);
        else applyRescueInlineTitle();
        setInterval(applyRescueInlineTitle, 250);
      })();