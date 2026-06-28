(function () {
        "use strict";
        function bootV76Guard() {
          document.body.classList.add("v75-wheel-ready");
          var wheels = document.querySelectorAll("#mogahedCommandWheel");
          if (wheels.length > 1) {
            Array.prototype.slice.call(wheels, 1).forEach(function (w) { w.remove(); });
          }
          document.documentElement.setAttribute("data-mogahed-master", "V76.1 Master - Plus Floating Removed");
        }
        if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", bootV76Guard);
        else bootV76Guard();
        setTimeout(bootV76Guard, 500);
        setTimeout(bootV76Guard, 1500);
      })();