// Extracted from V83 inline script block 2. Original id: v652-real-reset-toast-fix

(function () {
        function ready(fn) {
          if (window.MogahedOSX && window.MogahedOSX.Actions) {
            fn();
            return;
          }
          setTimeout(function () {
            ready(fn);
          }, 80);
        }
        ready(function () {
          var api = window.MogahedOSX,
            Actions = api.Actions;
          if (Actions.__V652_REAL_RESET_TOAST__) return;
          Actions.__V652_REAL_RESET_TOAST__ = true;
          var KEY = "mogahed_os_x_v1";

          function byId(id) {
            return document.getElementById(id);
          }
          function esc(v) {
            return String(v == null ? "" : v).replace(/[&<>"']/g, function (c) {
              return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              }[c];
            });
          }
          function premiumToast(msg, type) {
            type = type || "success";
            var t = byId("toast");
            if (!t) return;
            clearTimeout(t._v652Timer);
            t.className = "toast v652-show v652-" + type;
            var icon = type === "danger" ? "⚠️" : type === "warn" ? "💡" : "✅";
            t.innerHTML =
              '<div class="v652-toast-inner"><div class="v652-toast-icon">' +
              icon +
              '</div><div class="v652-toast-text">' +
              esc(msg) +
              "</div></div>";
            t.style.display = "block";
            t._v652Timer = setTimeout(function () {
              t.classList.remove("v652-show");
              t.classList.add("v652-hide");
              setTimeout(function () {
                t.style.display = "none";
                t.className = "toast";
              }, 230);
            }, 3200);
          }
          window.toast = premiumToast;
          api.toast = premiumToast;

          function setSelectFullLabel() {
            var s = byId("smartResetTarget");
            if (!s) return;
            var has = [].slice.call(s.options).some(function (o) {
              return o.value === "allSystem";
            });
            if (!has) {
              var opt = document.createElement("option");
              opt.value = "allSystem";
              opt.textContent = "تصفير النظام بالكامل";
              s.insertBefore(opt, s.options[1] || null);
            }
          }
          new MutationObserver(function () {
            setSelectFullLabel();
          }).observe(document.body, { childList: true, subtree: true });
          setTimeout(setSelectFullLabel, 300);

          function resetIndexedDB(cb) {
            if (!("indexedDB" in window)) {
              cb && cb();
              return;
            }
            try {
              var req = indexedDB.deleteDatabase("MogahedOSX_Files");
              req.onsuccess =
                req.onerror =
                req.onblocked =
                  function () {
                    cb && cb();
                  };
            } catch (e) {
              cb && cb();
            }
          }
          function clearAppStorage() {
            try {
              var keys = [];
              for (var i = 0; i < localStorage.length; i++) {
                keys.push(localStorage.key(i));
              }
              keys.forEach(function (k) {
                var low = String(k || "").toLowerCase();
                if (
                  k === KEY ||
                  low.indexOf("mogahed") > -1 ||
                  low.indexOf("mogahedosx") > -1
                ) {
                  localStorage.removeItem(k);
                }
              });
              localStorage.removeItem(KEY);
            } catch (e) {}
          }
          function performFullReset() {
            clearAppStorage();
            resetIndexedDB(function () {
              try {
                sessionStorage.setItem(
                  "mogahed_os_reset_flash",
                  "تم تصفير النظام بالكامل ورجوعه لبداية نظيفة ✅",
                );
              } catch (e) {}
              premiumToast(
                "تم تصفير النظام بالكامل. سيتم فتح نسخة نظيفة الآن.",
                "success",
              );
              setTimeout(function () {
                location.reload();
              }, 900);
            });
          }
          function showFullResetConfirm() {
            var title = "تأكيد تصفير النظام بالكامل";
            var body =
              '<div class="v652-reset-confirm">' +
              '<div class="v652-reset-hero"><h2>⚠️ تصفير النظام بالكامل</h2><p>هذا الاختيار سيمسح بيانات المشروع الحالية ويرجع النظام كبداية جديدة.</p></div>' +
              '<div class="v652-reset-points"><div>سيتم حذف المعرفة، الفيديوهات، الكتب، البودكاست، المشاريع، المهام، الأهداف، المراجعات، والأرشيف.</div><div>سيتم أيضًا مسح ملفات القراءة/التشغيل المحفوظة داخل قاعدة ملفات المشروع إن وجدت.</div><div>لو محتاج نسخة احتياطية، اضغط Export Backup قبل التنفيذ.</div></div>' +
              '<div class="v652-reset-actions"><button class="btn secondary" data-action="closeModal">إلغاء</button><button class="btn danger" data-action="v652ConfirmFullReset">نعم، صفّر النظام بالكامل</button></div>' +
              "</div>";
            if (window.openModal) {
              window.openModal(title, body);
            } else {
              if (confirm("تصفير النظام بالكامل؟")) performFullReset();
            }
          }
          Actions.v652ConfirmFullReset = function () {
            performFullReset();
          };

          var oldSmart = Actions.smartReset;
          Actions.smartReset = function () {
            var s = byId("smartResetTarget"),
              val = s ? s.value : "";
            if (val === "allSystem" || val === "all" || val === "systemAll") {
              showFullResetConfirm();
              return;
            }
            if (oldSmart) return oldSmart.apply(this, arguments);
            premiumToast("اختر الجزء المراد حذفه", "warn");
          };

          var oldV54 = Actions.v54ResetSelected;
          Actions.v54ResetSelected = function () {
            var s = byId("v54ResetTarget"),
              val = s ? s.value : "";
            if (val === "all" || val === "allSystem" || val === "systemAll") {
              showFullResetConfirm();
              return;
            }
            if (oldV54) return oldV54.apply(this, arguments);
          };

          document.addEventListener(
            "click",
            function (e) {
              var b = e.target.closest("[data-action]");
              if (!b) return;
              if (b.dataset.action === "smartReset") {
                var s = byId("smartResetTarget"),
                  val = s ? s.value : "";
                if (
                  val === "allSystem" ||
                  val === "all" ||
                  val === "systemAll"
                ) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  showFullResetConfirm();
                }
              }
              if (b.dataset.action === "v652ConfirmFullReset") {
                e.preventDefault();
                e.stopImmediatePropagation();
                performFullReset();
              }
            },
            true,
          );

          try {
            var flash = sessionStorage.getItem("mogahed_os_reset_flash");
            if (flash) {
              sessionStorage.removeItem("mogahed_os_reset_flash");
              setTimeout(function () {
                premiumToast(flash, "success");
              }, 450);
            }
          } catch (e) {}
        });
      })();
