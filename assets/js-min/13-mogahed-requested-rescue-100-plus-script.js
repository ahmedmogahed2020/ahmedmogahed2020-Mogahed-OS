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
          var groups = {
            body: {
              icon: "🧍",
              name: "جسدي",
              hint: "رجّع جسمك للحضور بدل السكرول",
              tasks: [
                "افرد ضهرك ورقبتك 60 ثانية ببطء.",
                "قف وافتح صدرك وخد 7 أنفاس عميقة.",
                "اغسل وشك بماء بارد وارجع فورًا.",
                "ابعد الموبايل عن إيدك مترين الآن.",
                "امشِ في المكان دقيقتين بدون شاشة.",
                "اعمل تمدد للكتف والرقبة دقيقة.",
                "قف بجوار شباك وخد نفس عميق 10 مرات.",
                "غير مكان جلوسك فورًا.",
                "اقبض وافرد إيدك 20 مرة.",
              ],
            },
            sport: {
              icon: "💪",
              name: "حركة",
              hint: "طاقة سريعة تكسر الخمول",
              tasks: [
                "اعمل 10 ضغطات أو بديلها على الحائط.",
                "اعمل 20 سكوات بهدوء.",
                "اعمل 30 ثانية Jumping Jacks.",
                "امشِ 3 دقائق بعيد عن الشاشة.",
                "اطلع وانزل 10 درجات سلم لو متاح.",
                "اعمل Plank لمدة 20 ثانية.",
                "اعمل 15 Lunges بالتبادل.",
                "حرك رقبتك وكتفك في دوائر بطيئة دقيقة.",
                "امشِ 100 خطوة داخل المكان.",
              ],
            },
            breath: {
              icon: "🫁",
              name: "تنفس",
              hint: "تهدئة الجهاز العصبي بسرعة",
              tasks: [
                "تنفس 4-4-6 خمس مرات.",
                "شهيق 4 ثواني وزفير 8 ثواني × 5.",
                "ضع يدك على صدرك وتنفس دقيقة.",
                "خد 10 أنفاس بطيئة بدون شاشة.",
                "تنفس ثم قل: سأبدأ خطوة واحدة.",
                "اعمل box breathing: 4 شهيق، 4 حبس، 4 زفير، 4 انتظار.",
                "أغلق عينك 30 ثانية وركز على الزفير.",
                "ازفر ببطء كأنك تطفئ شمعة 8 مرات.",
                "خد نفس عميق قبل أي ضغطة على الموبايل.",
              ],
            },
            water: {
              icon: "💧",
              name: "ماء",
              hint: "تنبيه بسيط للجسم",
              tasks: [
                "اشرب كوب ماء كامل ببطء.",
                "اشرب ماء وخد 5 أنفاس هادئة.",
                "املأ زجاجة المياه وضعها أمامك.",
                "اشرب ماء ثم اقفل مصدر التشتت فورًا.",
                "اشرب ماء وقف دقيقة بدون موبايل.",
                "اغسل إيدك ووشك ثم ارجع للمهمة.",
                "حط كوب ماء بجانبك قبل البدء.",
                "اشرب 3 رشفات ببطء شديد.",
                "اشرب ماء واكتب أول خطوة بعدها.",
              ],
            },
            mind: {
              icon: "🧠",
              name: "عقلي",
              hint: "وضوح التفكير بدل الدوامة",
              tasks: [
                "اكتب: ما المهمة الواحدة الآن؟",
                "اكتب سبب دخولك للموبايل في سطر.",
                "حدد أول خطوة مدتها دقيقتين فقط.",
                "اسأل نفسك: ما الذي أهرب منه الآن؟",
                "اكتب 3 نقاط تشغل دماغك وفرغها.",
                "اكتب قرارًا واحدًا: سأفعل الآن كذا.",
                "احذف اختيارين واترك اختيارًا واحدًا فقط.",
                "اكتب أسوأ نتيجة لو كملت تشتت 30 دقيقة.",
                "اكتب أفضل نتيجة لو ركزت 15 دقيقة.",
              ],
            },
            psyche: {
              icon: "🌿",
              name: "نفسي",
              hint: "تهدئة بدون جلد ذات",
              tasks: [
                "قل لنفسك: أرجع بهدوء مش بعنف.",
                "اكتب شعورك الحالي بكلمة واحدة.",
                "خد دقيقة صمت بدون حكم على نفسك.",
                "اكتب: أنا محتاج إيه الآن؟",
                "سامح نفسك وابدأ خطوة صغيرة.",
                "قل: التعثر مش نهاية اليوم.",
                "اكتب جملة تشجيع لنفسك.",
                "ابتسم 10 ثواني حتى لو غصب.",
                "اعترف بالتشتت ثم اختار رجوع واحد.",
              ],
            },
            soul: {
              icon: "🤲",
              name: "روحي",
              hint: "رجوع قلبي سريع",
              tasks: [
                "استغفر 30 مرة بهدوء.",
                "صلِّ على النبي 30 مرة.",
                "ادعُ بدعاء واحد من قلبك دقيقة.",
                "اقرأ آية واحدة بتدبر.",
                "صلِّ ركعتين لو متاح.",
                "قل: يا حي يا قيوم برحمتك أستغيث 7 مرات.",
                "افتح مصحفك واقرأ نصف صفحة.",
                "اسمع آية قصيرة بدل المحتوى المشتت.",
                "اكتب نعمة واحدة تشكر ربنا عليها.",
              ],
            },
            order: {
              icon: "🧹",
              name: "ترتيب",
              hint: "نظافة البيئة تقلل التشتت",
              tasks: [
                "رتب مكتبك دقيقتين فقط.",
                "اقفل كل التبويبات غير المهمة.",
                "احذف أو اسكت 5 إشعارات مزعجة.",
                "ضع كل شيء في مكانه لمدة دقيقتين.",
                "اكتب أهم 3 مهام على ورقة.",
                "نضف سطح المكتب أو شاشة الهاتف من فوضى واحدة.",
                "ارمِ ورقة أو كيس أو شيء غير مهم.",
                "جهز مكان جلوسك لجلسة 15 دقيقة.",
                "اقفل باب التشتيت: إشعارات/صوت/تطبيق.",
              ],
            },
            execute: {
              icon: "⚡",
              name: "تنفيذ",
              hint: "أصغر فعل فوري",
              tasks: [
                "افتح أول مهمة واشتغل 5 دقائق فقط.",
                "نفذ أصغر خطوة في مشروعك الحالي.",
                "اكتب رسالة واحدة مؤجلة وأرسلها.",
                "ابدأ مؤقت 15 دقيقة الآن.",
                "علّم على مهمة خلصتها أو حدد التالية.",
                "اكتب عنوان المهمة فقط ثم ابدأ.",
                "افتح الملف المطلوب ولا تفعل غير ذلك.",
                "نفذ خطوة واحدة أقل من دقيقتين.",
                "حوّل فكرة واحدة إلى إجراء في النظام.",
              ],
            },
            screen: {
              icon: "📵",
              name: "شاشة",
              hint: "قطع مصدر السحب",
              tasks: [
                "اقفل التطبيق المشتت الآن.",
                "فعّل عدم الإزعاج 30 دقيقة.",
                "اقفل الفيديو الحالي بدون تفاوض.",
                "سيب الموبايل بعيد 10 دقائق.",
                "امسح اختصار التطبيق المشتت من الشاشة.",
                "اقفل الواي فاي 10 دقائق لو مناسب.",
                "اخرج من الجروب أو الصفحة المشتتة الآن.",
                "ضع الهاتف مقلوبًا بعيدًا عنك.",
                "اكتب سبب فتح التطبيق قبل فتحه.",
              ],
            },
            knowledge: {
              icon: "📚",
              name: "معرفة",
              hint: "استبدال الاستهلاك بشيء نافع",
              tasks: [
                "افتح آخر ملخص واقرأه دقيقتين.",
                "اكتب 3 سطور من آخر فيديو شفته.",
                "حوّل فكرة واحدة لإجراء عملي.",
                "راجع كتاب أو بودكاست 5 دقائق.",
                "اكتب درس واحد خرجت به اليوم.",
                "افتح مادة معرفة بدل السوشيال 5 دقائق.",
                "اكتب سؤالًا واحدًا تريد إجابته.",
                "راجع ملاحظة قديمة وحوّلها لمهمة.",
                "سجل دقيقة صوتية تلخص فكرة.",
              ],
            },
            people: {
              icon: "👥",
              name: "ناس",
              hint: "كسر العزلة والتأجيل",
              tasks: [
                "ابعت رسالة قصيرة لشخص مهم.",
                "اطلب مساعدة في شيء مأجله.",
                "كلم حد دقيقتين بدل السكرول.",
                "اكتب رسالة شكر لشخص.",
                "اسأل نفسك: مين محتاج مني متابعة؟",
                "ابعث اعتذار أو توضيح مختصر لو مأجل.",
                "اتصل اتصالًا سريعًا بدل فتح السوشيال.",
                "اكتب اسم شخص ستطمئن عليه لاحقًا.",
                "ابعث لعميل أو زميل رسالة واحدة مفيدة.",
              ],
            },
            work: {
              icon: "💼",
              name: "عمل",
              hint: "رجوع عملي للإنجاز",
              tasks: [
                "اكتب أهم نتيجة مطلوبة في الشغل اليوم.",
                "راجع طلبًا واحدًا مؤجلًا.",
                "افتح قائمة النواقص أو المهام وحدد واحدة.",
                "اكتب ردًا مهنيًا قصيرًا كنت مأجله.",
                "راجع رقمًا أو مؤشرًا واحدًا مهمًا.",
                "اعمل خطوة واحدة في مشروع المال أو المتجر.",
                "جهز رسالة بيع أو متابعة واحدة.",
                "اكتب مشكلة واحدة وحلًا واحدًا.",
                "رتب أول 3 أولويات للعمل الآن.",
              ],
            },
          };
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
              window.__mogahedRescueLast === key + ":" + idx &&
              g.tasks.length > 1
            )
              idx = (idx + 1) % g.tasks.length;
            window.__mogahedRescueLast = key + ":" + idx;
            return { key: key, group: g, task: g.tasks[idx] };
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
              "+ فكرة إنقاذ</span></div><h2>" +
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