// Extracted from V83 inline script block 21. Original id: mogahed-v762-remove-right-plus-only-script

(function () {
        "use strict";
        function removeRightPlusWheelOnly() {
          document.querySelectorAll("#mogahedCommandWheel").forEach(function (el) {
            el.remove();
          });
          document.documentElement.setAttribute("data-mogahed-master", "V76.2 - Right Plus Removed Only");
        }
        if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", removeRightPlusWheelOnly);
        } else {
          removeRightPlusWheelOnly();
        }
        setTimeout(removeRightPlusWheelOnly, 100);
        setTimeout(removeRightPlusWheelOnly, 600);
        setTimeout(removeRightPlusWheelOnly, 1500);
        setInterval(removeRightPlusWheelOnly, 1200);
      })();
