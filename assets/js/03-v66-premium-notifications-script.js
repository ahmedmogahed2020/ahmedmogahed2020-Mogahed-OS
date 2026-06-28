// Extracted from V83 inline script block 3. Original id: v66-premium-notifications-script

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
          var Actions = api.Actions,
            state = api.state;
          if (Actions.__V66_PREMIUM_NOTIFICATIONS__) return;
          Actions.__V66_PREMIUM_NOTIFICATIONS__ = true;
          var allowNativeConfirm = false,
            oldConfirm = window.confirm;
          function $(id) {
            return document.getElementById(id);
          }
          function E(v) {
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
          function notify(message, type, title) {
            type = type || "info";
            title =
              title ||
              {
                success: "تم بنجاح",
                warn: "تنبيه",
                danger: "تحذير",
                error: "خطأ",
                info: "إشعار",
              }[type] ||
              "إشعار";
            var t = $("toast");
            if (!t) return;
            clearTimeout(t._v66Timer);
            var icon =
              {
                success: "✅",
                warn: "💡",
                danger: "⚠️",
                error: "⚠️",
                info: "✨",
              }[type] || "✨";
            t.className = "toast v66-toast v66-toast-" + type;
            t.innerHTML =
              '<div class="v66-toast-content"><div class="v66-toast-icon">' +
              icon +
              '</div><div class="v66-toast-copy"><div class="v66-toast-title">' +
              E(title) +
              '</div><div class="v66-toast-msg">' +
              E(message) +
              '</div></div><button class="v66-toast-close" type="button" aria-label="إغلاق">×</button></div>';
            t.style.display = "block";
            var close = t.querySelector(".v66-toast-close");
            if (close)
              close.onclick = function () {
                hideToast(t);
              };
            t._v66Timer = setTimeout(function () {
              hideToast(t);
            }, 3400);
          }
          function hideToast(t) {
            if (!t) return;
            t.classList.add("v66-hide");
            setTimeout(function () {
              t.style.display = "none";
              t.className = "toast";
              t.innerHTML = "";
            }, 240);
          }
          window.toast = notify;
          api.toast = notify;

          function dialog(opts) {
            opts = opts || {};
            var type = opts.type || "info",
              icon =
                opts.icon ||
                {
                  success: "✅",
                  warn: "💡",
                  danger: "⚠️",
                  error: "⚠️",
                  info: "✨",
                }[type] ||
                "✨";
            return new Promise(function (resolve) {
              var ov = document.createElement("div");
              ov.className = "v66-dialog-overlay";
              var details = (opts.details || [])
                .map(function (d) {
                  return '<div class="v66-dialog-detail">' + E(d) + "</div>";
                })
                .join("");
              var input = opts.input
                ? '<div class="v66-dialog-input"><input id="v66DialogInput" value="' +
                  E(opts.defaultValue || "") +
                  '" placeholder="' +
                  E(opts.placeholder || "") +
                  '"></div>'
                : "";
              ov.innerHTML =
                '<div class="v66-dialog v66-dialog-' +
                type +
                '"><div class="v66-dialog-head"><div class="v66-dialog-icon">' +
                icon +
                '</div><div><h3 class="v66-dialog-title">' +
                E(opts.title || "تأكيد") +
                '</h3><p class="v66-dialog-msg">' +
                E(opts.message || "") +
                '</p></div></div><div class="v66-dialog-body">' +
                (details
                  ? '<div class="v66-dialog-details">' + details + "</div>"
                  : "") +
                input +
                '</div><div class="v66-dialog-actions"><button class="btn secondary" data-v66="cancel">' +
                E(opts.cancelText || "إلغاء") +
                '</button><button class="btn ' +
                (type === "danger" ? "danger" : "") +
                '" data-v66="ok">' +
                E(opts.confirmText || "حسنًا") +
                "</button></div></div>";
              document.body.appendChild(ov);
              var done = false;
              function close(val) {
                if (done) return;
                done = true;
                ov.style.opacity = "0";
                setTimeout(function () {
                  ov.remove();
                  resolve(val);
                }, 150);
              }
              ov.addEventListener("click", function (e) {
                if (e.target === ov) close(false);
                var b = e.target.closest("[data-v66]");
                if (!b) return;
                if (b.dataset.v66 === "cancel") close(false);
                else {
                  var inp = ov.querySelector("#v66DialogInput");
                  close(opts.input ? (inp ? inp.value : "") : true);
                }
              });
              var inp = ov.querySelector("#v66DialogInput");
              if (inp) {
                setTimeout(function () {
                  inp.focus();
                  inp.select();
                }, 80);
                inp.addEventListener("keydown", function (e) {
                  if (e.key === "Enter") close(inp.value);
                  if (e.key === "Escape") close(false);
                });
              }
            });
          }
          window.MogahedNotify = notify;
          window.MogahedDialog = dialog;
          window.confirm = function (msg) {
            if (allowNativeConfirm) return true;
            dialog({
              type: "warn",
              icon: "⚠️",
              title: "تأكيد مطلوب",
              message: String(msg || ""),
              confirmText: "نعم، تنفيذ",
              cancelText: "إلغاء",
            });
            return false;
          };

          function saveAndRender(msg, type) {
            try {
              api.save(api.state || state);
            } catch (e) {
              try {
                api.save();
              } catch (_) {}
            }
            try {
              api.render();
            } catch (e) {}
            notify(msg, type || "success");
          }
          function labelOf(select) {
            return select && select.selectedOptions && select.selectedOptions[0]
              ? select.selectedOptions[0].textContent.trim()
              : "";
          }
          function doPartialReset(key, label) {
            if (!key) {
              notify("اختر الجزء المراد حذفه أولًا", "warn");
              return;
            }
            if (key === "allSystem" || key === "all" || key === "systemAll") {
              showFullReset();
              return;
            }
            dialog({
              type: "danger",
              icon: "🧹",
              title: "تأكيد الحذف",
              message: "هل تريد حذف " + label + " من النظام؟",
              details: [
                "يفضل أخذ نسخة احتياطية قبل التنفيذ.",
                "هذه العملية لا يمكن التراجع عنها من داخل النظام.",
              ],
              confirmText: "نعم، احذف",
              cancelText: "إلغاء",
            }).then(function (ok) {
              if (!ok) return;
              if (Array.isArray(api.state[key])) api.state[key] = [];
              else api.state[key] = [];
              saveAndRender("تم حذف " + label + " بنجاح", "success");
            });
          }
          function clearAllStorage() {
            try {
              var keys = [];
              for (var i = 0; i < localStorage.length; i++)
                keys.push(localStorage.key(i));
              keys.forEach(function (k) {
                var low = String(k || "").toLowerCase();
                if (
                  low.indexOf("mogahed") > -1 ||
                  low.indexOf("mogahedosx") > -1
                )
                  localStorage.removeItem(k);
              });
            } catch (e) {}
          }
          function deleteDB(cb) {
            if (!window.indexedDB) {
              cb();
              return;
            }
            try {
              var r = indexedDB.deleteDatabase("MogahedOSX_Files");
              r.onsuccess =
                r.onerror =
                r.onblocked =
                  function () {
                    cb();
                  };
            } catch (e) {
              cb();
            }
          }
          function performFullReset() {
            clearAllStorage();
            deleteDB(function () {
              try {
                sessionStorage.setItem(
                  "mogahed_os_reset_flash",
                  "تم تصفير النظام بالكامل ورجوعه لبداية نظيفة ✅",
                );
              } catch (e) {}
              notify(
                "تم التصفير بنجاح. يتم فتح النظام من جديد الآن.",
                "success",
                "تم تصفير النظام",
              );
              setTimeout(function () {
                location.reload();
              }, 900);
            });
          }
          function showFullReset() {
            dialog({
              type: "danger",
              icon: "🚨",
              title: "تصفير النظام بالكامل",
              message: "هذا سيمسح كل بيانات المشروع ويرجع النظام كبداية جديدة.",
              details: [
                "المعرفة والكتب والبودكاست والفيديوهات.",
                "المشاريع والمهام والأهداف والمراجعات.",
                "الأرشيف والملفات المحفوظة داخل قاعدة المشروع.",
              ],
              confirmText: "نعم، صفّر النظام",
              cancelText: "إلغاء",
            }).then(function (ok) {
              if (ok) performFullReset();
            });
          }

          Actions.smartReset = function () {
            var s = $("smartResetTarget");
            doPartialReset(s ? s.value : "", labelOf(s) || "هذا الجزء");
          };
          Actions.v54ResetSelected = function () {
            var s = $("v54ResetTarget");
            doPartialReset(s ? s.value : "", labelOf(s) || "هذا الجزء");
          };
          Actions.v652ConfirmFullReset = performFullReset;
          Actions.resetApp = function () {
            showFullReset();
          };
          Actions.v60ClearClaude = function () {
            dialog({
              type: "warn",
              icon: "🧠",
              title: "مسح مفتاح Claude",
              message: "هل تريد مسح مفتاح Claude من هذا الجهاز؟",
              confirmText: "مسح المفتاح",
              cancelText: "إلغاء",
            }).then(function (ok) {
              if (!ok) return;
              api.state.settings = api.state.settings || {};
              api.state.settings.ai = api.state.settings.ai || {};
              api.state.settings.ai.anthropicKey = "";
              saveAndRender("تم مسح مفتاح Claude", "success");
            });
          };
          Actions.v60ClearGemini = function () {
            dialog({
              type: "warn",
              icon: "✨",
              title: "مسح مفتاح Gemini",
              message: "هل تريد مسح مفتاح Gemini من هذا الجهاز؟",
              confirmText: "مسح المفتاح",
              cancelText: "إلغاء",
            }).then(function (ok) {
              if (!ok) return;
              api.state.settings = api.state.settings || {};
              api.state.settings.ai = api.state.settings.ai || {};
              api.state.settings.ai.geminiKey = "";
              saveAndRender("تم مسح مفتاح Gemini", "success");
            });
          };
          Actions.v633EditType = function (_, el) {
            var key = el.dataset.key,
              oldVal = el.dataset.value;
            dialog({
              type: "info",
              icon: "✏️",
              title: "تعديل الاسم",
              message: "اكتب الاسم الجديد بدل: " + oldVal,
              input: true,
              defaultValue: oldVal,
              confirmText: "حفظ التعديل",
              cancelText: "إلغاء",
            }).then(function (nv) {
              if (!nv) return;
              nv = String(nv).trim();
              if (!nv || nv === oldVal) return;
              api.state.types = api.state.types || {};
              api.state.types[key] = (api.state.types[key] || []).map(
                function (x) {
                  return x === oldVal ? nv : x;
                },
              );
              if (key === "knowledge")
                (api.state.knowledge || []).forEach(function (x) {
                  if (x.type === oldVal) x.type = nv;
                });
              if (key === "projects")
                (api.state.projects || []).forEach(function (x) {
                  if (x.type === oldVal) x.type = nv;
                });
              if (key === "areas") {
                [
                  "knowledge",
                  "projects",
                  "goals",
                  "actions",
                  "decisions",
                  "contacts",
                  "timeline",
                ].forEach(function (c) {
                  (api.state[c] || []).forEach(function (x) {
                    if (x.area === oldVal) x.area = nv;
                  });
                });
              }
              saveAndRender("تم تعديل الاسم في المشروع بالكامل", "success");
            });
          };

          var oldRestore = window.v63RestoreFromDrive;
          if (oldRestore) {
            window.v63RestoreFromDrive = function (fileId) {
              dialog({
                type: "warn",
                icon: "☁️",
                title: "استعادة نسخة Google Drive",
                message:
                  "هل تريد استعادة هذه النسخة؟ ستُستبدل بياناتك الحالية.",
                confirmText: "استعادة النسخة",
                cancelText: "إلغاء",
              }).then(function (ok) {
                if (!ok) return;
                allowNativeConfirm = true;
                try {
                  oldRestore(fileId);
                } finally {
                  allowNativeConfirm = false;
                }
              });
            };
          }

          document.addEventListener(
            "click",
            function (e) {
              var close = e.target.closest(".v66-toast-close");
              if (close) {
                e.preventDefault();
                hideToast($("toast"));
              }
              var b = e.target.closest("[data-action]");
              if (!b) return;
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
                notify(flash, "success", "النظام جاهز");
              }, 500);
            }
          } catch (e) {}
        });
      })();
