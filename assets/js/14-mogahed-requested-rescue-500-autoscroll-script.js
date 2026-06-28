// Extracted from V83 inline script block 14. Original id: mogahed-requested-rescue-500-autoscroll-script

(function () {
        function ready(fn, tries) {
          tries = tries || 0;
          var A =
            window.Actions || (window.MogahedOSX && window.MogahedOSX.Actions);
          if (A) {
            fn(A);
            return;
          }
          if (tries < 120)
            setTimeout(function () {
              ready(fn, tries + 1);
            }, 50);
        }
        ready(function (A) {
          var state =
            window.state ||
            (window.MogahedOSX && window.MogahedOSX.state) ||
            {};
          function H(v) {
            var esc = (window.MogahedOSX && MogahedOSX.esc) || window.esc;
            return esc
              ? esc(String(v == null ? "" : v))
              : String(v == null ? "" : v).replace(/[&<>"']/g, function (m) {
                  return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  }[m];
                });
          }
          function save() {
            try {
              (window.MogahedOSX && MogahedOSX.save
                ? MogahedOSX.save
                : window.save)();
            } catch (e) {
              try {
                localStorage.setItem("mogahed_os_x_v30", JSON.stringify(state));
              } catch (_) {}
            }
          }
          function toast(t) {
            try {
              (window.MogahedOSX && MogahedOSX.toast
                ? MogahedOSX.toast
                : window.toast)(t);
            } catch (e) {}
          }
          function uid() {
            return (
              Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
            );
          }
          function makePlans(base, verbs, actions, endings, limit) {
            var out = [],
              seen = {};
            function add(x) {
              x = String(x || "").trim();
              if (x && !seen[x]) {
                seen[x] = 1;
                out.push(x);
              }
            }
            (base || []).forEach(add);
            for (var i = 0; i < verbs.length && out.length < limit; i++) {
              for (var j = 0; j < actions.length && out.length < limit; j++) {
                for (var k = 0; k < endings.length && out.length < limit; k++) {
                  add(verbs[i] + " " + actions[j] + " " + endings[k] + ".");
                }
              }
            }
            return out.slice(0, limit);
          }
          var groups = {
            body: {
              icon: "🧍",
              name: "جسدي",
              hint: "رجّع جسمك للحضور بدل السكرول",
              base: [
                "افرد ضهرك ورقبتك 60 ثانية ببطء.",
                "قف وافتح صدرك وخد 7 أنفاس عميقة.",
                "اغسل وشك بماء بارد وارجع فورًا.",
                "ابعد الموبايل عن إيدك مترين الآن.",
                "امشِ في المكان دقيقتين بدون شاشة.",
              ],
              verbs: ["افرد", "حرّك", "اضغط", "ارفع", "استرخِ"],
              actions: [
                "رقبتك وكتفك",
                "ضهرك وصدرك",
                "إيديك وصوابعك",
                "رجليك وركبك",
                "وجهك وفكك",
              ],
              endings: [
                "لمدة 60 ثانية",
                "10 مرات بهدوء",
                "وأنت واقف بعيدًا عن الشاشة",
                "ثم خذ نفسًا عميقًا",
                "قبل الرجوع للمهمة",
              ],
            },
            sport: {
              icon: "💪",
              name: "حركة",
              hint: "طاقة سريعة تكسر الخمول",
              base: [
                "اعمل 10 ضغطات أو بديلها على الحائط.",
                "اعمل 20 سكوات بهدوء.",
                "اعمل 30 ثانية Jumping Jacks.",
                "امشِ 3 دقائق بعيد عن الشاشة.",
                "اعمل Plank لمدة 20 ثانية.",
              ],
              verbs: ["اعمل", "نفّذ", "ابدأ", "كرّر", "جرّب"],
              actions: [
                "10 سكوات",
                "20 خطوة في المكان",
                "15 حركة للذراعين",
                "30 ثانية مشي سريع",
                "10 ضغطات حائط",
              ],
              endings: [
                "بدون موبايل",
                "ثم اشرب ماء",
                "ثم ارجع للمهمة",
                "ببطء ومن غير إجهاد",
                "مع عدّ واضح",
              ],
            },
            breath: {
              icon: "🫁",
              name: "تنفس",
              hint: "تهدئة الجهاز العصبي بسرعة",
              base: [
                "تنفس 4-4-6 خمس مرات.",
                "شهيق 4 ثواني وزفير 8 ثواني × 5.",
                "ضع يدك على صدرك وتنفس دقيقة.",
                "خد 10 أنفاس بطيئة بدون شاشة.",
                "اعمل box breathing دقيقة واحدة.",
              ],
              verbs: ["تنفس", "ازفر", "اهدأ", "ركّز", "اغمض عينك وخذ"],
              actions: [
                "5 أنفاس عميقة",
                "دقيقة تنفس بطيء",
                "شهيق 4 وزفير 6",
                "زفير طويل 8 ثواني",
                "نفسًا واحدًا قبل القرار",
              ],
              endings: [
                "وأنت بعيد عن الشاشة",
                "ثم قل سأبدأ الآن",
                "مع يدك على صدرك",
                "بدون أي حركة أخرى",
                "ثم افتح المهمة فقط",
              ],
            },
            water: {
              icon: "💧",
              name: "ماء",
              hint: "تنبيه بسيط للجسم",
              base: [
                "اشرب كوب ماء كامل ببطء.",
                "املأ زجاجة المياه وضعها أمامك.",
                "اغسل إيدك ووشك ثم ارجع للمهمة.",
                "اشرب 3 رشفات ببطء شديد.",
                "حط كوب ماء بجانبك قبل البدء.",
              ],
              verbs: ["اشرب", "املأ", "اغسل", "ضع", "خذ"],
              actions: [
                "كوب ماء",
                "3 رشفات هادئة",
                "زجاجة المياه",
                "وجهك بماء بارد",
                "ماء بجانبك",
              ],
              endings: [
                "ثم ابدأ 5 دقائق",
                "بدون فتح أي تطبيق",
                "ثم خذ نفسًا عميقًا",
                "قبل اختيار المهمة",
                "وارجع فورًا للنظام",
              ],
            },
            mind: {
              icon: "🧠",
              name: "عقلي",
              hint: "وضوح التفكير بدل الدوامة",
              base: [
                "اكتب: ما المهمة الواحدة الآن؟",
                "اكتب سبب دخولك للموبايل في سطر.",
                "حدد أول خطوة مدتها دقيقتين فقط.",
                "اسأل نفسك: ما الذي أهرب منه الآن؟",
                "اكتب أفضل نتيجة لو ركزت 15 دقيقة.",
              ],
              verbs: ["اكتب", "حدد", "اسأل نفسك", "اختصر", "احذف"],
              actions: [
                "مهمة واحدة فقط",
                "أول خطوة صغيرة",
                "سبب التشتيت الحقيقي",
                "قرارًا واضحًا",
                "اختيارين مشتتين",
              ],
              endings: [
                "في سطر واحد",
                "خلال 30 ثانية",
                "ثم ابدأ فورًا",
                "بدون تحليل زيادة",
                "على ورقة أو داخل النظام",
              ],
            },
            psyche: {
              icon: "🌿",
              name: "نفسي",
              hint: "تهدئة بدون جلد ذات",
              base: [
                "قل لنفسك: أرجع بهدوء مش بعنف.",
                "اكتب شعورك الحالي بكلمة واحدة.",
                "خد دقيقة صمت بدون حكم على نفسك.",
                "سامح نفسك وابدأ خطوة صغيرة.",
                "اعترف بالتشتت ثم اختار رجوع واحد.",
              ],
              verbs: ["قل لنفسك", "اكتب", "اهدأ", "اعترف", "اختار"],
              actions: [
                "جملة رحمة واحدة",
                "شعورك الحالي",
                "احتياجك الآن",
                "خطوة رجوع بسيطة",
                "سبب ضغطك",
              ],
              endings: [
                "بدون جلد ذات",
                "ثم نفّذ شيئًا صغيرًا",
                "لمدة دقيقة",
                "بصدق وهدوء",
                "ثم أغلق مصدر التشتيت",
              ],
            },
            soul: {
              icon: "🤲",
              name: "روحي",
              hint: "رجوع قلبي سريع",
              base: [
                "استغفر 30 مرة بهدوء.",
                "صلِّ على النبي 30 مرة.",
                "ادعُ بدعاء واحد من قلبك دقيقة.",
                "اقرأ آية واحدة بتدبر.",
                "اكتب نعمة واحدة تشكر ربنا عليها.",
              ],
              verbs: ["استغفر", "صلِّ على النبي", "ادعُ", "اقرأ", "اذكر الله"],
              actions: [
                "30 مرة",
                "دقيقة واحدة",
                "آية قصيرة",
                "دعاء واحد",
                "نعمة واحدة",
              ],
              endings: [
                "بهدوء",
                "ثم ارجع لمهمتك",
                "بدون شاشة",
                "وأنت جالس بثبات",
                "واطلب العون على التركيز",
              ],
            },
            order: {
              icon: "🧹",
              name: "ترتيب",
              hint: "نظافة البيئة تقلل التشتت",
              base: [
                "رتب مكتبك دقيقتين فقط.",
                "اقفل كل التبويبات غير المهمة.",
                "احذف أو اسكت 5 إشعارات مزعجة.",
                "جهز مكان جلوسك لجلسة 15 دقيقة.",
                "اكتب أهم 3 مهام على ورقة.",
              ],
              verbs: ["رتب", "اقفل", "احذف", "جهز", "نظف"],
              actions: [
                "مكتبك",
                "تبويبًا مشتتًا",
                "إشعارًا مزعجًا",
                "مكان الجلوس",
                "سطح الهاتف",
              ],
              endings: [
                "لمدة دقيقتين",
                "قبل بدء التركيز",
                "ثم افتح المهمة",
                "بدون كماليات",
                "واجعل الشاشة هادئة",
              ],
            },
            execute: {
              icon: "⚡",
              name: "تنفيذ",
              hint: "أصغر فعل فوري",
              base: [
                "افتح أول مهمة واشتغل 5 دقائق فقط.",
                "نفذ أصغر خطوة في مشروعك الحالي.",
                "ابدأ مؤقت 15 دقيقة الآن.",
                "اكتب عنوان المهمة فقط ثم ابدأ.",
                "حوّل فكرة واحدة إلى إجراء في النظام.",
              ],
              verbs: ["ابدأ", "نفّذ", "افتح", "اكتب", "حوّل"],
              actions: [
                "أصغر خطوة",
                "5 دقائق عمل",
                "المهمة الحالية",
                "رسالة واحدة",
                "فكرة واحدة",
              ],
              endings: [
                "الآن فورًا",
                "بدون انتظار الحماس",
                "ثم قيّم النتيجة",
                "قبل أي تطبيق آخر",
                "داخل النظام",
              ],
            },
            screen: {
              icon: "📵",
              name: "شاشة",
              hint: "قطع مصدر السحب",
              base: [
                "اقفل التطبيق المشتت الآن.",
                "فعّل عدم الإزعاج 30 دقيقة.",
                "اقفل الفيديو الحالي بدون تفاوض.",
                "سيب الموبايل بعيد 10 دقائق.",
                "ضع الهاتف مقلوبًا بعيدًا عنك.",
              ],
              verbs: ["اقفل", "فعّل", "ابعد", "امسح", "اكتب"],
              actions: [
                "التطبيق المشتت",
                "عدم الإزعاج",
                "الهاتف عن يدك",
                "اختصارًا مشتتًا",
                "سبب فتح التطبيق",
              ],
              endings: [
                "لمدة 15 دقيقة",
                "بدون تفاوض",
                "ثم ارجع للمهمة",
                "قبل الضغط عليه",
                "من الشاشة الرئيسية",
              ],
            },
            knowledge: {
              icon: "📚",
              name: "معرفة",
              hint: "استبدال الاستهلاك بشيء نافع",
              base: [
                "افتح آخر ملخص واقرأه دقيقتين.",
                "اكتب 3 سطور من آخر فيديو شفته.",
                "حوّل فكرة واحدة لإجراء عملي.",
                "راجع كتاب أو بودكاست 5 دقائق.",
                "اكتب درس واحد خرجت به اليوم.",
              ],
              verbs: ["افتح", "اكتب", "راجع", "حوّل", "اقرأ"],
              actions: [
                "ملخصًا قديمًا",
                "3 سطور مفيدة",
                "فكرة واحدة",
                "كتابًا أو بودكاست",
                "درسًا واحدًا",
              ],
              endings: [
                "لمدة 5 دقائق",
                "ثم طبقه الآن",
                "بدل السكرول",
                "داخل صفحة المعرفة",
                "قبل الرجوع للعمل",
              ],
            },
            people: {
              icon: "👥",
              name: "ناس",
              hint: "كسر العزلة والتأجيل",
              base: [
                "ابعت رسالة قصيرة لشخص مهم.",
                "اطلب مساعدة في شيء مأجله.",
                "كلم حد دقيقتين بدل السكرول.",
                "اكتب رسالة شكر لشخص.",
                "ابعث لعميل أو زميل رسالة واحدة مفيدة.",
              ],
              verbs: ["ابعث", "اكتب", "اسأل", "اتصل", "حدّد"],
              actions: [
                "رسالة متابعة",
                "رسالة شكر",
                "سؤالًا واضحًا",
                "مكالمة قصيرة",
                "شخصًا واحدًا",
              ],
              endings: [
                "في أقل من دقيقة",
                "بدون فتح السوشيال",
                "ثم ارجع لمهمتك",
                "بطريقة محترمة",
                "لتنهي تأجيلًا صغيرًا",
              ],
            },
            work: {
              icon: "💼",
              name: "عمل",
              hint: "رجوع عملي للإنجاز",
              base: [
                "اكتب أهم نتيجة مطلوبة في الشغل اليوم.",
                "راجع طلبًا واحدًا مؤجلًا.",
                "افتح قائمة النواقص أو المهام وحدد واحدة.",
                "جهز رسالة بيع أو متابعة واحدة.",
                "رتب أول 3 أولويات للعمل الآن.",
              ],
              verbs: ["راجع", "اكتب", "جهز", "افتح", "رتب"],
              actions: [
                "طلبًا مؤجلًا",
                "ردًا مهنيًا",
                "رسالة بيع",
                "مؤشرًا مهمًا",
                "أولويات العمل",
              ],
              endings: [
                "خلال 5 دقائق",
                "ثم أغلق المشتت",
                "بشكل مختصر",
                "داخل النظام",
                "قبل أي تصفح",
              ],
            },
          };
          Object.keys(groups).forEach(function (k) {
            var g = groups[k];
            g.tasks = makePlans(g.base, g.verbs, g.actions, g.endings, 40);
          });
          var order = [
            "body",
            "sport",
            "breath",
            "water",
            "mind",
            "psyche",
            "soul",
            "order",
            "execute",
            "screen",
            "knowledge",
            "people",
            "work",
          ];
          var total = order.reduce(function (n, k) {
            return n + groups[k].tasks.length;
          }, 0);
          function pick(kind) {
            var key =
                kind && groups[kind]
                  ? kind
                  : order[Math.floor(Math.random() * order.length)],
              g = groups[key],
              idx = Math.floor(Math.random() * g.tasks.length);
            if (
              window.__mogahedRescueLast500 === key + ":" + idx &&
              g.tasks.length > 1
            )
              idx = (idx + 1) % g.tasks.length;
            window.__mogahedRescueLast500 = key + ":" + idx;
            return { key: key, group: g, task: g.tasks[idx] };
          }
          function rescueScrollTop() {
            setTimeout(function () {
              try {
                var box = document.querySelector("#modal .modal-box");
                if (box) box.scrollTo({ top: 0, behavior: "smooth" });
                var current = document.querySelector(
                  "#modal .v646-rescue-current",
                );
                if (current)
                  current.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  });
              } catch (e) {
                var b = document.querySelector("#modal .modal-box");
                if (b) b.scrollTop = 0;
              }
            }, 60);
          }
          function render(kind) {
            var x = pick(kind);
            var grid = order
              .map(function (k) {
                var g = groups[k],
                  active = k === x.key ? " active" : "";
                return (
                  '<button class="v646-rescue-cat' +
                  active +
                  '" data-action="mogahedRescueKind100" data-kind="' +
                  k +
                  '"><b>' +
                  g.icon +
                  "</b><span>" +
                  H(g.name) +
                  "</span></button>"
                );
              })
              .join("");
            var body =
              '<div class="v646-rescue"><div class="v646-rescue-current"><div class="v646-rescue-badge">' +
              x.group.icon +
              " " +
              H(x.group.name) +
              ' • مهمة عشوائية <span class="v646-rescue-count">' +
              total +
              " فكرة إنقاذ</span></div><h2>" +
              H(x.task) +
              "</h2><p>" +
              H(x.group.hint) +
              ' — نفذها الآن ثم ارجع لمهمة واحدة فقط.</p></div><div class="rescue-checklist v646-checks"><label class="rescue-check-item"><input type="checkbox"> أوقفت مصدر التشتت</label><label class="rescue-check-item"><input type="checkbox"> نفذت مهمة الإنقاذ</label><label class="rescue-check-item"><input type="checkbox"> جاهز أبدأ 15 دقيقة</label></div><div class="v646-actions"><button class="btn rescue rescue-primary" data-action="startEmergencyFocus">⏱️ ابدأ إنقاذ 15 دقيقة</button><button class="btn secondary" data-action="mogahedAddRescueTask100" data-task="' +
              H(x.task) +
              '">+ أضفها للمهام</button><button class="btn secondary" data-action="emergencyPlan">🎲 عشوائي عام</button></div><h3 class="v646-title">اختر نوع الإنقاذ</h3><div class="v646-rescue-grid">' +
              grid +
              "</div></div>";
            if (typeof window.openModal === "function")
              window.openModal("🚨 وضع الإنقاذ", body);
            else {
              var m = document.getElementById("modal"),
                mb = document.getElementById("modalBody"),
                mt = document.getElementById("modalTitle");
              if (mt) mt.textContent = "🚨 وضع الإنقاذ";
              if (mb) mb.innerHTML = body;
              if (m) m.classList.add("open");
            }
            rescueScrollTop();
          }
          A.emergencyPlan = function () {
            render();
          };
          A.mogahedRescueKind100 = function (kind, btn) {
            render((btn && btn.dataset && btn.dataset.kind) || kind);
          };
          A.mogahedAddRescueTask100 = function (_, btn) {
            state.tasks = state.tasks || [];
            state.tasks.unshift({
              id: uid(),
              title:
                (btn && btn.dataset && btn.dataset.task) ||
                "مهمة إنقاذ من التشتت",
              project: "🚨 وضع الإنقاذ",
              priority: "high",
              status: "todo",
            });
            save();
            toast("اتضافت للمهام ✅");
          };
        });
      })();
