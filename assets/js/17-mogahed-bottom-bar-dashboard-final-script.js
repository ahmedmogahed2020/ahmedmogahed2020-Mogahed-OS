// Extracted from V83 inline script block 17. Original id: mogahed-bottom-bar-dashboard-final-script

(function () {
        function api() {
          return window.MogahedOSX || {};
        }
        function route() {
          try {
            return (
              (api().getRoute && api().getRoute()) || window.route || "home"
            );
          } catch (e) {
            return "home";
          }
        }
        function setRoute(r) {
          try {
            if (api().setRoute) api().setRoute(r);
            else window.route = r;
          } catch (e) {
            window.route = r;
          }
        }
        function render() {
          try {
            if (api().render) api().render();
          } catch (e) {}
        }
        function ensureBottomBar() {
          var nav = document.getElementById("nav");
          if (!nav) return;
          nav.style.display = "grid";
          var dash = nav.querySelector('button[data-route="dashboard"]');
          if (!dash) {
            dash = document.createElement("button");
            dash.setAttribute("data-route", "dashboard");
            dash.setAttribute("aria-label", "Dashboard");
            dash.innerHTML =
              "<span><b>📊</b><em>Dashboard</em></span><small></small>";
            nav.insertBefore(dash, nav.children[1] || null);
          }
          nav.querySelectorAll("button[data-route]").forEach(function (b) {
            var r = b.getAttribute("data-route");
            var active =
              route() === r ||
              (r === "actionHub" &&
                ["actions", "projects", "goals", "focus", "now"].indexOf(
                  route(),
                ) > -1);
            b.classList.toggle("active", active);
            b.onclick = function (ev) {
              ev.preventDefault();
              ev.stopPropagation();
              setRoute(r);
              render();
              setTimeout(ensureBottomBar, 0);
              setTimeout(ensureBottomBar, 80);
            };
          });
        }
        function boot() {
          ensureBottomBar();
          var a = api();
          if (a && a.render && !a.render.__mogahedBottomBarWrapped) {
            var old = a.render;
            var wrapped = function () {
              var out = old.apply(this, arguments);
              setTimeout(ensureBottomBar, 0);
              setTimeout(ensureBottomBar, 80);
              return out;
            };
            wrapped.__mogahedBottomBarWrapped = true;
            a.render = wrapped;
            window.MogahedOSX.render = wrapped;
          }
          var nav = document.getElementById("nav");
          if (nav && !nav.__mogahedBottomObserver) {
            nav.__mogahedBottomObserver = true;
            new MutationObserver(function () {
              setTimeout(ensureBottomBar, 0);
            }).observe(nav, {
              childList: true,
              subtree: true,
              attributes: true,
              attributeFilter: ["class", "style"],
            });
          }
          setTimeout(ensureBottomBar, 120);
          setTimeout(ensureBottomBar, 600);
        }
        if (document.readyState === "loading")
          document.addEventListener("DOMContentLoaded", boot);
        else boot();
      })();
