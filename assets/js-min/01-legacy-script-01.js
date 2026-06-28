(function () {
        function ready(fn) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            window.MogahedOSX.state
          ) {
            fn();
            return;
          }
          setTimeout(function () {
            ready(fn);
          }, 80);
        }
        ready(function () {
          var api = window.MogahedOSX,
            Actions = api.Actions,
            state = api.state;
          if (!Actions || Actions.__FINAL_KNOWLEDGE_STABLE__) return;
          Actions.__FINAL_KNOWLEDGE_STABLE__ = true;

          function byId(id) {
            return document.getElementById(id);
          }
          function E(s) {
            return String(s == null ? "" : s).replace(/[&<>'"]/g, function (c) {
              return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                "'": "&#39;",
                '"': "&quot;",
              }[c];
            });
          }
          function textOf(k) {
            return String(
              [k.type, k.mediaType, k.mediaUrl, k.link, k.mediaMime, k.title]
                .filter(Boolean)
                .join(" "),
            ).toLowerCase();
          }
          function isBook(k) {
            var t = textOf(k);
            return /كتاب|book|pdf/.test(t);
          }
          function isPodcast(k) {
            var t = textOf(k);
            return /بودكاست|podcast|audio|mp3|محاضرة|soundcloud|spotify/.test(
              t,
            );
          }
          function isVideo(k) {
            var t = textOf(k);
            return /فيديو|video|youtube|youtu\.be|mp4|دورة|course/.test(t);
          }
          function progress(k) {
            var cur = Number(
                k.currentUnit || k.currentPage || k.currentMinute || 0,
              ),
              total = Number(
                k.totalUnits || k.totalPages || k.totalMinutes || 0,
              );
            if (total > 0)
              return Math.max(
                0,
                Math.min(100, Math.round((cur / total) * 100)),
              );
            return Number(k.progress || 0) || 0;
          }
          function getK(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function save() {
            if (api.save) api.save();
            else
              try {
                localStorage.setItem("mogahed_os_x_v45", JSON.stringify(state));
              } catch (e) {}
          }
          function toast(msg) {
            if (api.toast) api.toast(msg);
            else if (window.toast) window.toast(msg);
          }

          window.openModal = function (title, body) {
            var m = byId("modal"),
              mt = byId("modalTitle"),
              mb = byId("modalBody");
            if (mt) mt.textContent = title || "";
            if (mb) mb.innerHTML = body || "";
            if (m) m.classList.add("open");
          };
          window.closeModal = function () {
            var m = byId("modal"),
              mb = byId("modalBody");
            if (m) m.classList.remove("open", "player-mode", "vfinal-modal");
            if (mb) mb.innerHTML = "";
          };
          Actions.closeModal = window.closeModal;

          function cleanUrl(u) {
            return String(u || "")
              .trim()
              .replace(/[\u200B-\u200D\uFEFF]/g, "");
          }
          function youtubeId(url) {
            url = cleanUrl(url);
            if (!url) return "";
            try {
              var u = new URL(url),
                h = u.hostname.replace(/^www\./, "").toLowerCase();
              if (h === "youtu.be")
                return (u.pathname.split("/").filter(Boolean)[0] || "").split(
                  /[?#]/,
                )[0];
              if (h.indexOf("youtube.com") > -1) {
                return (
                  u.searchParams.get("v") ||
                  (u.pathname.match(/\/(shorts|live|embed)\/([^/?#]+)/) ||
                    [])[2] ||
                  ""
                );
              }
            } catch (e) {
              var m = url.match(
                /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
              );
              return m ? m[1] : "";
            }
            return "";
          }
          function ytEmbed(id) {
            var origin =
              location.protocol === "http:" || location.protocol === "https:"
                ? "&origin=" + encodeURIComponent(location.origin)
                : "";
            return (
              "https://www.youtube.com/embed/" +
              encodeURIComponent(id) +
              "?rel=0&modestbranding=1&playsinline=1" +
              origin
            );
          }
          function sourceUrl(k) {
            return cleanUrl(k.mediaUrl || k.link || k.pdfUrl || k.url || "");
          }
          function localOrFile() {
            return (
              location.protocol === "file:" ||
              location.protocol === "content:" ||
              String(location.href).toLowerCase().indexOf("content://") === 0
            );
          }
          function dbGet(key, cb) {
            if (!key || !("indexedDB" in window)) {
              cb("");
              return;
            }
            var req = indexedDB.open("MogahedOSX_Files", 1);
            req.onsuccess = function () {
              var db = req.result;
              try {
                var tx = db.transaction("files", "readonly");
                var r = tx.objectStore("files").get(key);
                r.onsuccess = function () {
                  db.close();
                  cb(r.result || "");
                };
                r.onerror = function () {
                  db.close();
                  cb("");
                };
              } catch (e) {
                try {
                  db.close();
                } catch (_e) {}
                cb("");
              }
            };
            req.onerror = function () {
              cb("");
            };
          }
          function readStored(k, cb) {
            if (k.mediaData || k.pdfData) {
              cb(k.mediaData || k.pdfData);
              return;
            }
            dbGet(k.pdfDbKey || k.mediaDbKey, cb);
          }
          function mediaHtml(k, stored) {
            var url = sourceUrl(k),
              mime = String(k.mediaMime || "").toLowerCase(),
              yid = youtubeId(url),
              low = url.toLowerCase();
            if (stored) {
              if (mime.indexOf("pdf") > -1 || isBook(k))
                return '<iframe src="' + E(stored) + '"></iframe>';
              if (mime.indexOf("audio/") === 0 || isPodcast(k))
                return '<audio controls src="' + E(stored) + '"></audio>';
              return (
                '<video controls playsinline src="' + E(stored) + '"></video>'
              );
            }
            if (yid) {
              var note = localOrFile()
                ? '<div class="vfinal-warn">لو ظهر خطأ من YouTube فده بسبب فتح المشروع كملف محلي. ارفعه على HTTPS لتشغيل مضمون داخل المشروع.</div>'
                : "";
              return (
                '<iframe src="' +
                E(ytEmbed(yid)) +
                '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>' +
                note
              );
            }
            if (low.indexOf("spotify.com") > -1) {
              try {
                var u = new URL(url),
                  p = u.pathname.split("/").filter(Boolean);
                if (p.length >= 2)
                  return (
                    '<iframe src="https://open.spotify.com/embed/' +
                    E(p[0]) +
                    "/" +
                    E(p[1]) +
                    '"></iframe>'
                  );
              } catch (e) {}
            }
            if (low.indexOf("soundcloud.com") > -1)
              return (
                '<iframe src="https://w.soundcloud.com/player/?url=' +
                encodeURIComponent(url) +
                '"></iframe>'
              );
            if (low.indexOf(".pdf") > -1 || isBook(k))
              return url
                ? '<iframe src="' + E(url) + '"></iframe>'
                : '<div class="empty">لا يوجد ملف PDF. افتح تعديل وارفع PDF أو ضع رابط مباشر.</div>';
            if (url) return '<iframe src="' + E(url) + '"></iframe>';
            return '<div class="empty">لا يوجد مصدر تشغيل. افتح تعديل وأضف رابط أو ملف.</div>';
          }
          function aiPanel(k) {
            var label = isBook(k)
              ? "الكتاب"
              : isPodcast(k)
                ? "البودكاست"
                : "الفيديو";
            return (
              '<section class="v652-ai-panel vfinal-card" id="v652KnowledgeAI" data-id="' +
              E(k.id) +
              '">' +
              '<div class="v652-ai-head"><div><h3>✨ ملخص الذكاء الاصطناعي</h3><small>الملخص محفوظ داخل نفس المحتوى، سواء كتاب أو بودكاست.</small></div><span class="pill">Gemini</span></div>' +
              "<label>نص اختياري / تفريغ / صفحات من " +
              E(label) +
              '</label><textarea class="v652-source" id="v652SourceText" placeholder="اختياري. لو عندك نص أو تفريغ الصقه هنا، ولو في ملف/رابط سيحاول Gemini قراءته عند وجود API Key.">' +
              E(k.aiSourceText || k.transcriptText || "") +
              "</textarea>" +
              '<button class="btn v652-primary" data-action="v652SummarizeKnowledge" data-id="' +
              E(k.id) +
              '">✨ تلخيص تلقائي للـ ' +
              E(label) +
              "</button>" +
              '<div class="v652-status" id="v652Status">جاهز للتلخيص والحفظ داخل المشروع.</div>' +
              '<label>الملخص الشامل</label><textarea id="v652Summary">' +
              E(k.summary || "") +
              "</textarea>" +
              '<div class="v652-ai-grid"><div><label>أهم الأفكار</label><textarea id="v652Ideas">' +
              E(k.ideas || "") +
              '</textarea></div><div><label>التطبيق العملي</label><textarea id="v652Action">' +
              E(k.actionTaken || k.application || "") +
              '</textarea></div><div><label>المهام المستخرجة</label><textarea id="v652Tasks">' +
              E(k.extractedTasks || "") +
              '</textarea></div><div><label>الدرس / الاقتباسات</label><textarea id="v652Lesson">' +
              E(k.lessonLearned || "") +
              "</textarea></div></div>" +
              '<div class="v652-actions"><button class="btn secondary" data-action="v652SaveKnowledgeAI" data-id="' +
              E(k.id) +
              '">💾 حفظ الملخص</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div></section>'
            );
          }
          function progressPanel(k) {
            var book = isBook(k),
              unit = book ? "صفحة" : "دقيقة",
              cur = Number(
                k.currentUnit || k.currentPage || k.currentMinute || 0,
              ),
              total = Number(
                k.totalUnits || k.totalPages || k.totalMinutes || 0,
              ),
              pct = progress(k);
            return (
              '<section class="vfinal-card"><h3>التقدم</h3><p class="muted">' +
              cur +
              " " +
              unit +
              " من " +
              (total || "?") +
              " — " +
              pct +
              '%</p><div class="progress"><div class="bar" style="width:' +
              pct +
              '%"></div></div><label>وصلت إلى ' +
              unit +
              '</label><input id="vfinalCurrent" type="number" value="' +
              E(cur) +
              '"><label>الإجمالي</label><input id="vfinalTotal" type="number" value="' +
              E(total) +
              '"><div class="row"><button class="btn" data-action="vfinalSaveProgress" data-id="' +
              E(k.id) +
              '">حفظ التقدم</button></div></section>'
            );
          }
          function notesPanel(k) {
            return (
              '<section class="vfinal-card"><h3>ملاحظاتي</h3><label>ملاحظات</label><textarea id="playerNotes">' +
              E(k.playerNotes || "") +
              '</textarea><label>أفكار شخصية</label><textarea id="playerIdeas">' +
              E(k.ideas || "") +
              '</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">' +
              E(k.application || k.actionTaken || "") +
              '</textarea><div class="row"><button class="btn" data-action="savePlayerNotes" data-id="' +
              E(k.id) +
              '">حفظ الملاحظات</button><button class="btn secondary" data-action="playerToAction" data-id="' +
              E(k.id) +
              '">حوّل لإجراء</button></div></section>'
            );
          }
          function openFinalPlayer(k) {
            readStored(k, function (stored) {
              var title = isBook(k)
                ? "قارئ الكتاب"
                : isPodcast(k)
                  ? "مشغل البودكاست"
                  : "مشغل الفيديو";
              var external = sourceUrl(k)
                ? '<button class="btn secondary mini" data-action="openExternal" data-url="' +
                  E(sourceUrl(k)) +
                  '">فتح المصدر</button>'
                : "";
              var header =
                '<div class="vfinal-head"><div><h3>' +
                E(k.title || title) +
                "</h3><p>" +
                title +
                ' داخل المشروع — المصدر فوق، والملخص تحته.</p></div><div class="row">' +
                external +
                '<button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div>';
              var body =
                '<div class="vfinal-layout"><section class="vfinal-media"><div class="vfinal-media-frame">' +
                mediaHtml(k, stored) +
                "</div></section>" +
                aiPanel(k) +
                progressPanel(k) +
                notesPanel(k) +
                "</div>";
              var m = byId("modal");
              if (m) m.classList.add("player-mode", "vfinal-modal");
              window.openModal(title, header + body);
            });
          }

          Actions.vfinalSaveProgress = function (id) {
            var k = getK(id);
            if (!k) return;
            var cur = Number((byId("vfinalCurrent") || {}).value || 0),
              total = Number((byId("vfinalTotal") || {}).value || 0);
            k.currentUnit = cur;
            k.totalUnits = total;
            if (isBook(k)) k.currentPage = cur;
            else k.currentMinute = cur;
            if (isBook(k)) k.totalPages = total;
            else k.totalMinutes = total;
            k.progress = progress(k);
            save();
            toast("تم حفظ التقدم");
          };
          Actions.openKnowledgePlayer = function (id) {
            var k = getK(id);
            if (!k) {
              toast("العنصر غير موجود");
              return;
            }
            openFinalPlayer(k);
          };

          document.addEventListener(
            "click",
            function (e) {
              var b = e.target.closest("[data-action]");
              if (!b) return;
              if (b.dataset.action === "closeModal") {
                e.preventDefault();
                e.stopImmediatePropagation();
                window.closeModal();
                return;
              }
              if (b.dataset.action === "openKnowledgePlayer") {
                var k = getK(b.dataset.id);
                if (k) {
                  e.preventDefault();
                  e.stopImmediatePropagation();
                  openFinalPlayer(k);
                }
              }
            },
            true,
          );
        });
      })();