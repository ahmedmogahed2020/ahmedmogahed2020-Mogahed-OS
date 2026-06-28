// Extracted from V83 inline script block 0. Original id: mogahed-clean-scripts

/* Mogahed OS X — Clean Stable Build
   JavaScript consolidated from legacy scattered script blocks.
   Order preserved to avoid breaking behavior. */

      /* script section 1 */
      (function () {
        "use strict";
        const KEY = "mogahed_os_x_v1";
        const DEFAULT = {
          profile: {
            name: "مجاهد",
            title: "مهندس ومدير",
            vision: "أبني نفسي وأحوّل المعرفة إلى نتائج",
            avatar: "",
            cover: "",
          },
          settings: { accent: "#8b5cf6", accent2: "#ec4899", theme: "dark" },
          types: {
            knowledge: ["كتاب", "بودكاست", "دورة", "مقال", "فيديو", "محاضرة"],
            projects: ["شخصي", "عمل", "تعلم", "صحة", "دين"],
            areas: [
              "الدين",
              "الصحة",
              "الأسرة",
              "العمل",
              "المال",
              "التعلم",
              "العلاقات",
            ],
          },
          modules: {
            home: true,
            now: true,
            knowledge: true,
            actions: true,
            projects: true,
            goals: true,
            focus: true,
            reviews: true,
            decisions: true,
            crm: true,
            finance: true,
            timeline: true,
            vault: true,
            graph: true,
            archive: true,
            settings: true,
            campaignAnalysis: true,
          },
          knowledge: [],
          actions: [],
          projects: [],
          tasks: [],
          goals: [],
          reviews: [],
          decisions: [],
          contacts: [],
          finance: [],
          timeline: [],
          inbox: [],
          focusSessions: [],
          emergencySessions: [],
          archive: [],
        };
        let state,
          route = "home",
          timer = null,
          timerLeft = 1500,
          timerRunning = false;
        state = load();
        function clone(o) {
          return JSON.parse(JSON.stringify(o));
        }
        function uid() {
          return (
            Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
          );
        }
        function load() {
          try {
            const raw = localStorage.getItem(KEY);
            if (!raw) return seed();
            return merge(clone(DEFAULT), JSON.parse(raw));
          } catch (e) {
            console.warn(e);
            return seed();
          }
        }
        function seed() {
          const s = clone(DEFAULT);
          s.goals.push({
            id: uid(),
            title: "تقليل التشتت",
            area: "الصحة",
            status: "active",
            progress: 35,
            why: "أريد عقل أوضح وحياة أفضل",
          });
          s.projects.push({
            id: uid(),
            title: "Mogahed OS X",
            type: "شخصي",
            area: "التعلم",
            status: "active",
            kpi: "نسخة مستقرة شغالة",
            summary: "نظام شخصي مرن للتحكم في الحياة والمعرفة",
          });
          s.knowledge.push({
            id: uid(),
            title: "اليوم",
            type: "كتاب",
            area: "التعلم",
            status: "active",
            rating: 5,
            cover: "",
            summary: "أي معرفة تضيفها لازم تتحول إلى فعل، نتيجة، ودرس مستفاد.",
            ideas:
              "الفكرة الأولى: لا تجمع فقط\nالفكرة الثانية: نفّذ\nالفكرة الثالثة: راجع",
            application: "اختر إجراء واحد بعد كل محتوى",
            result: "",
            reviewDate: "",
          });
          s.decisions.push({
            id: uid(),
            title: "إعادة بناء النظام من الصفر",
            area: "العمل",
            expected: "مرونة أعلى وأخطاء أقل",
            actual: "",
            status: "active",
            date: new Date().toISOString().slice(0, 10),
          });
          s.timeline.push({
            id: uid(),
            title: "إطلاق Mogahed OS X",
            date: new Date().toISOString().slice(0, 10),
            area: "التعلم",
            note: "بداية نسخة نظيفة بمعمارية جديدة",
          });
          save(s);
          return s;
        }
        function merge(a, b) {
          for (const k in b) {
            if (
              b[k] &&
              typeof b[k] === "object" &&
              !Array.isArray(b[k]) &&
              a[k]
            )
              a[k] = merge(a[k], b[k]);
            else a[k] = b[k];
          }
          return a;
        }
        function save(s = state) {
          try {
            localStorage.setItem(KEY, JSON.stringify(s));
          } catch (e) {
            toast("التخزين ممتلئ أو محظور. استخدم Export لحفظ نسخة.");
          }
          state = s;
        }
        function $(id) {
          return document.getElementById(id);
        }
        function esc(v) {
          return String(v ?? "").replace(
            /[&<>"]/g,
            (m) =>
              ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m],
          );
        }
        function toast(msg) {
          const t = $("toast");
          t.textContent = msg;
          t.style.display = "block";
          clearTimeout(t._x);
          t._x = setTimeout(() => (t.style.display = "none"), 2400);
        }
        function active(arr) {
          return arr.filter((x) => x.status !== "archived");
        }
        const PRIMARY_ROUTES = [
          "home",
          "actionHub",
          "knowledge",
          "wins",
          "more",
        ];
        const MORE_ROUTES = [
          "now",
          "projects",
          "goals",
          "focus",
          "reviews",
          "actions",
          "decisions",
          "crm",
          "finance",
          "timeline",
          "vault",
          "graph",
          "archive",
          "settings",
          "campaignAnalysis",
        ];
        const NAV = [
          ["home", "الرئيسية", "⌂"],
          ["actionHub", "التنفيذ", "⚡"],
          ["knowledge", "المعرفة", "🧠"],
          ["wins", "الفوز", "🏆"],
          ["more", "المزيد", "☰"],
        ];
        const ROUTE_LABELS = {
          home: "الرئيسية",
          actionHub: "التنفيذ",
          knowledge: "المعرفة",
          more: "المزيد",
          now: "الآن",
          actions: "التحويل",
          projects: "المشاريع",
          goals: "الأهداف",
          focus: "التركيز",
          reviews: "المراجعات",
          decisions: "القرارات",
          crm: "العلاقات",
          finance: "المال",
          timeline: "الإنجازات",
          wins: "لوحة الفوز",
          vault: "Inbox",
          graph: "Graph",
          archive: "الأرشيف",
          settings: "الإعدادات",
          campaignAnalysis: "تحليل الحملات الاعلانيه",
        };
        const ROUTE_ICONS = {
          home: "⌂",
          actionHub: "⚡",
          knowledge: "◈",
          more: "☰",
          now: "●",
          actions: "↯",
          projects: "▦",
          goals: "◎",
          focus: "◷",
          reviews: "✓",
          decisions: "◇",
          crm: "☏",
          finance: "ج",
          timeline: "↗",
          wins: "🏆",
          vault: "+",
          graph: "⟲",
          archive: "▤",
          settings: "⚙",
          campaignAnalysis: "📊",
        };
        function navActive(r) {
          return (
            route === r ||
            (r === "actionHub" &&
              ["actions", "projects", "goals", "focus", "now"].includes(
                route,
              )) ||
            (r === "more" &&
              MORE_ROUTES.includes(route) &&
              !["actions", "projects", "goals", "focus", "now"].includes(route))
          );
        }
        function renderNav() {
          const nav = $("nav");
          nav.innerHTML = NAV.map(
            (n) =>
              `<button data-route="${n[0]}" class="${navActive(n[0]) ? "active" : ""}" aria-label="${n[1]}"><span><b>${n[2]}</b><em>${n[1]}</em></span><small>${countFor(n[0])}</small></button>`,
          ).join("");
          $("sideName").textContent = state.profile.name || "Mogahed OS X";
          $("sideAvatar").innerHTML = state.profile.avatar
            ? `<img src="${state.profile.avatar}">`
            : esc((state.profile.name || "م")[0]);
          document.documentElement.style.setProperty(
            "--brand",
            state.settings.accent || "#8b5cf6",
          );
          document.documentElement.style.setProperty(
            "--brand2",
            state.settings.accent2 || "#ec4899",
          );
        }
        function countFor(r) {
          const m = {
            knowledge: active(state.knowledge).length,
            actions: active(state.actions).length,
            projects: active(state.projects).length,
            goals: active(state.goals).length,
            reviews: state.reviews.length,
            decisions: active(state.decisions).length,
            crm: active(state.contacts).length,
            finance: state.finance.length,
            vault: state.inbox.length,
            archive: state.archive.length,
          };
          if (r === "actionHub")
            return (
              active(state.tasks).filter((t) => t.status !== "done").length +
              active(state.actions).filter((a) => a.status !== "done").length
            );
          if (r === "wins")
            return (
              active(state.actions).filter((a) => a.status === "done").length +
              state.focusSessions.length
            );
          if (r === "more") return "";
          return m[r] || "";
        }
        function setTitle(t, s) {
          $("pageTitle").textContent = t;
          $("pageSub").textContent = s || "Mogahed OS X";
        }
        let __v81RenderQueued = false;
        let __v81RenderPendingArgs = null;
        function render() {
          __v81RenderPendingArgs = arguments;
          if (__v81RenderQueued) return;
          __v81RenderQueued = true;
          const run = () => {
            __v81RenderQueued = false;
            try {
              __v81RenderImmediate.apply(null, __v81RenderPendingArgs || []);
            } finally {
              __v81RenderPendingArgs = null;
            }
          };
          if (typeof requestAnimationFrame === "function") requestAnimationFrame(run);
          else setTimeout(run, 0);
        }
        function __v81RenderImmediate() {
          renderNav();
          const v = $("view");
          const map = {
            home: viewHome,
            actionHub: window.viewActionHub || viewActionHub,
            more: viewMore,
            now: viewNow,
            knowledge: window.viewKnowledge || viewKnowledge,
            actions: viewActions,
            projects: viewProjects,
            goals: v77GoalsView,
            focus: viewFocus,
            reviews: viewReviews,
            decisions: viewDecisions,
            crm: viewCRM,
            finance: viewFinance,
            timeline: viewTimeline,
            wins: window.viewWins || viewWins,
            vault: viewVault,
            graph: viewGraph,
            archive: viewArchive,
            settings: viewSettings,
            campaignAnalysis: viewCampaignAnalysis,
          };
          v.innerHTML = (map[route] || viewHome)();
          bindDynamic();
          try { window.dispatchEvent(new CustomEvent("mogahed:v81:rendered", { detail: { route } })); } catch(e) {}
        }
        function metric(title, num, sub) {
          return `<div class="card"><p class="muted">${title}</p><div class="stat">${num}</div><p class="muted">${sub || ""}</p></div>`;
        }
        function knowledgeProgress(k) {
          const total = Number(
              k.totalUnits || k.totalPages || k.totalMinutes || 0,
            ),
            done = Number(
              k.currentUnit || k.currentPage || k.currentMinute || 0,
            );
          if (total > 0)
            return Math.max(0, Math.min(100, Math.round((done / total) * 100)));
          if (k.status === "done" || k.finished) return 100;
          return Number(k.progress || 0) || 0;
        }
        function viewHome() {
          setTitle(
            `صباح الخير يا ${state.profile.name || "مجاهد"}`,
            "V45 Ultimate — Execution First",
          );
          const goal = active(state.goals)[0],
            proj = active(state.projects)[0];
          const task =
            active(state.tasks).find((t) => t.status !== "done") ||
            active(state.actions).find((a) => a.status !== "done");
          const openActions =
            active(state.tasks).filter((t) => t.status !== "done").length +
            active(state.actions).filter((a) => a.status !== "done").length;
          const doneActions = active(state.actions).filter(
            (a) => a.status === "done",
          ).length;
          const knowledge = active(state.knowledge);
          const continueK =
            knowledge.find(
              (k) => knowledgeProgress(k) > 0 && knowledgeProgress(k) < 100,
            ) || knowledge[0];
          const p = continueK ? knowledgeProgress(continueK) : 0;
          const rescueWeek = (state.emergencySessions || []).filter(
            (x) =>
              new Date(x.iso || x.date || 0).getTime() >=
              Date.now() - 7 * 24 * 60 * 60 * 1000,
          ).length;
          const score = Math.min(
            100,
            Math.round(
              ((doneActions * 2 +
                state.focusSessions.length +
                state.reviews.length) /
                Math.max(1, openActions + doneActions + 4)) *
                100,
            ),
          );
          return `<div class="premium-home"><section class="premium-hero"><span class="premium-kicker">⚡ Mogahed OS X • V64.7 Emergency Categories</span><h2>افتح… نفّذ… واقفل.</h2><p>النسخة دي معمولة عشان تقلل التشتت: مهمة واحدة واضحة، زر طوارئ قريب، وآخر معرفة تكمّلها بدون ما تخرج من النظام.</p><div class="premium-actions"><button class="btn" data-action="openFocus">▶ ابدأ المهمة الحالية</button><button class="btn rescue" data-action="emergencyPlan">🚨 طوارئ التشتت</button><button class="btn secondary" data-action="openQuickAdd">+ إضافة سريعة</button></div></section><section class="premium-strip"><div class="premium-metric"><small>🎯 هدفك الآن</small><strong>${esc(goal?.title || "أضف هدفك الأساسي")}</strong></div><div class="premium-metric"><small>⚡ إجراءات مفتوحة</small><strong>${openActions}</strong></div><div class="premium-metric"><small>🧠 تقدم المعرفة</small><strong>${p}%</strong><div class="progress"><div class="bar" style="width:${p}%"></div></div></div><div class="premium-metric"><small>🏆 Momentum</small><strong>${score}%</strong><div class="progress"><div class="bar" style="width:${score}%"></div></div></div></section><section class="premium-grid"><div class="card today-card"><span class="operating-badge">● المهمة الحالية</span><h2>${esc(task?.title || "لا توجد مهمة حالياً")}</h2><p class="muted">${esc(task?.reason || task?.area || task?.project || "أضف إجراء واحد فقط، ثم شغّل التركيز لمدة 25 دقيقة.")}</p><div class="row"><button class="btn" data-action="openFocus">تشغيل Focus Mode</button><button class="btn secondary" data-action="addAction">إجراء جديد</button><button class="btn secondary" data-route="projects">المشاريع</button></div><div class="soft-divider"></div><p class="muted">المشروع الحالي: <b>${esc(proj?.title || "لا يوجد مشروع محدد")}</b></p></div><div class="card continue-card"><h3>استكمال سريع</h3>${continueK ? `<div class="continue-item"><div class="continue-icon">${continueK.type === "بودكاست" ? "🎧" : "📚"}</div><div><h4>${esc(continueK.title)}</h4><p>${esc(continueK.type || "معرفة")} • ${p}%</p><div class="progress"><div class="bar" style="width:${p}%"></div></div></div></div><button class="btn play-primary" data-action="openKnowledgePlayer" data-id="${continueK.id}">▶ كمّل داخل المشروع</button>` : '<div class="empty">أضف كتاب أو بودكاست لتظهر هنا.</div>'}<div class="emergency-panel item"><h3>🚨 إنقاذ التشتت</h3><p>هذا الأسبوع: ${rescueWeek} محاولة إنقاذ. اضغط الطوارئ وقت ما تحس إنك بتضيع.</p><button class="btn rescue" data-action="emergencyPlan">ابدأ إنقاذ 15 دقيقة</button></div></div></section></div>`;
        }
        function brief() {
          const goal = active(state.goals)[0],
            proj = active(state.projects)[0],
            dec = active(state.decisions)[0],
            know = active(state.knowledge)[0];
          return `<div class="list"><div class="item"><b>أهم هدف:</b> ${esc(goal?.title || "أضف هدفك الأساسي")}</div><div class="item"><b>أهم مشروع:</b> ${esc(proj?.title || "أضف مشروعك الحالي")}</div><div class="item"><b>آخر معرفة:</b> ${esc(know?.title || "أضف كتاب أو بودكاست")}</div><div class="item"><b>آخر قرار:</b> ${esc(dec?.title || "سجل قرار مهم")}</div></div>`;
        }
        function viewNow() {
          setTitle("الآن", "شاشة واحدة تمنع التشتت.");
          const next =
            active(state.tasks).find((t) => t.status !== "done") ||
            active(state.actions).find((a) => a.status !== "done");
          return `<div class="grid"><div class="card col-8"><h3>المهمة التالية</h3><h2>${esc(next?.title || "لا توجد مهمة. أضف إجراء الآن.")}</h2><p class="muted">${esc(next?.area || next?.type || "")}</p><div class="row"><button class="btn" data-action="openFocus">ابدأ تركيز</button><button class="btn secondary" data-action="addAction">إضافة إجراء</button></div></div><div class="card col-4"><h3>حالة اليوم</h3><label>كيف حالك؟</label><select id="mood"><option>مركز</option><option>مشتت</option><option>مرهق</option><option>متوتر</option><option>ضائع</option></select><button class="btn" data-action="emergencyPlan" style="margin-top:10px;width:100%">خطة 15 دقيقة</button></div><div class="card col-12"><h3>آخر مراجعة</h3>${state.reviews[0] ? cardReview(state.reviews[0]) : '<p class="muted">لم تضف مراجعة بعد.</p>'}</div></div>`;
        }
        function cardKnowledge(x) {
          const hasMedia = !!(x.mediaData || x.mediaUrl || x.link);
          const local = x.mediaData
            ? "محلي"
            : x.mediaUrl || x.link
              ? "رابط"
              : "";
          const p = knowledgeProgress(x);
          const unitLabel =
            x.type === "بودكاست" || x.type === "فيديو" || x.type === "محاضرة"
              ? "دقيقة"
              : "صفحة";
          const progressLine =
            x.totalUnits || x.currentUnit
              ? `${esc(x.currentUnit || 0)} / ${esc(x.totalUnits || 0)} ${unitLabel}`
              : `${p}% مكتمل`;
          return `<div class="item knowledge-card"><div class="knowledge-card-inner"><img class="cover" src="${x.cover || ""}" onerror="this.style.display='none'"><div class="knowledge-main"><div class="knowledge-title-row"><h4>${esc(x.title)}</h4><span class="pill">${esc(x.type)}</span></div><p class="knowledge-summary">${esc(x.summary || "")}</p><div class="knowledge-progress"><small><span>التقدم</span><span>${progressLine}</span></small><div class="progress"><div class="bar" style="width:${p}%"></div></div></div><div class="knowledge-primary">${hasMedia ? `<button class="btn play-primary" data-action="openKnowledgePlayer" data-id="${x.id}">▶ تشغيل / استكمال</button>` : `<button class="btn secondary play-primary" data-action="editKnowledge" data-id="${x.id}">أضف رابط / ملف</button>`}<div class="knowledge-meta"><span class="pill">★ ${x.rating || 0}</span><span class="pill">${esc(x.area || "بدون مجال")}</span>${local ? `<span class="pill">${esc(local)}</span>` : ""}</div></div><div class="knowledge-more"><button class="btn secondary mini" data-action="editKnowledge" data-id="${x.id}">تعديل</button><button class="btn secondary mini" data-action="makeActionFromKnowledge" data-id="${x.id}">حوّل لإجراء</button><button class="btn secondary mini" data-action="completeKnowledge" data-id="${x.id}">تم الانتهاء</button><button class="btn danger mini" data-action="archiveItem" data-collection="knowledge" data-id="${x.id}">أرشفة</button></div></div></div></div>`;
        }
        function viewKnowledge() {
          setTitle("المعرفة", "كتب، بودكاست، دورات، وأنواع تضيفها أنت.");
          return `<div class="space"><div class="tabs">${state.types.knowledge.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div><button class="btn" data-action="addKnowledge">إضافة معرفة</button></div><div class="grid"><div class="card col-12"><div class="list">${active(state.knowledge).map(cardKnowledge).join("") || '<div class="empty">ابدأ بإضافة كتاب أو بودكاست.</div>'}</div></div></div>`;
        }
        function cardAction(x) {
          const pct =
            x.status === "done" ? 100 : x.status === "doing" ? 55 : 10;
          return `<div class="item"><div class="space"><h4>${esc(x.title)}</h4><span class="pill">${esc(x.status || "todo")}</span></div><p>${esc(x.reason || "")}</p><div class="progress"><div class="bar" style="width:${pct}%"></div></div><div class="row" style="margin-top:10px"><button class="btn secondary mini" data-action="cycleStatus" data-collection="actions" data-id="${x.id}">غيّر الحالة</button><button class="btn secondary mini" data-action="editAction" data-id="${x.id}">تعديل</button><button class="btn danger mini" data-action="archiveItem" data-collection="actions" data-id="${x.id}">أرشفة</button></div></div>`;
        }
        function hubTile(routeId, title, sub, icon, count) {
          return `<button class="hub-tile" data-route="${routeId}"><span>${icon}</span><b>${title}</b><small>${sub}</small>${count !== undefined ? `<em>${count}</em>` : ""}</button>`;
        }
        function viewActionHub() {
          setTitle(
            "مركز التنفيذ",
            "ابدأ من المهمة الحالية، وليس من قائمة أقسام.",
          );
          const task =
            active(state.tasks).find((t) => t.status !== "done") ||
            active(state.actions).find((a) => a.status !== "done");
          const pendingActions = active(state.actions)
            .filter((a) => a.status !== "done")
            .slice(0, 4);
          return `<div class="action-center"><div class="card command-card action-hero"><div><p class="eyebrow">Action Center</p><h2>مهمة واحدة الآن</h2><p class="muted">ابدأ بالمهمة الحالية، وبعدها افتح المشاريع أو الأهداف عند الحاجة فقط.</p></div><button class="btn action-focus-button" data-action="openFocus">ابدأ تركيز</button></div><div class="action-stack"><div class="card"><h3>المهمة الحالية</h3><h2 class="os-task-title">${esc(task?.title || "لا توجد مهمة")}</h2><p class="muted">${esc(task?.reason || task?.project || task?.area || "أضف مهمة أو إجراء سريع.")}</p><div class="row"><button class="btn" data-action="addTask">+ مهمة</button><button class="btn secondary" data-action="addAction">+ إجراء</button></div></div><div class="card"><h3>إجراءات تنتظر التنفيذ</h3><div class="os-action-list">${pendingActions.map((a) => `<div class="os-action-item"><span>${esc(a.title)}</span><button class="btn secondary mini" data-action="cycleStatus" data-collection="actions" data-id="${a.id}">تقدم</button></div>`).join("") || '<div class="empty">لا توجد إجراءات مفتوحة.</div>'}</div></div></div><div class="card"><h3>الأدوات</h3><div class="hub-grid">${hubTile("projects", "المشاريع", "مشاريع + Kanban", "▦", active(state.projects).length)}${hubTile("actions", "التحويل", "معرفة ← تنفيذ", "↯", active(state.actions).length)}${hubTile("goals", "الأهداف", "اتجاه واضح", "◎", active(state.goals).length)}${hubTile("focus", "التركيز", "جلسة واحدة فقط", "◷", state.focusSessions.length)}</div></div></div>`;
        }
        function viewWins() {
          setTitle(
            "لوحة الفوز",
            "الإنجازات الصغيرة التي تحارب دوبامين السوشيال.",
          );
          const doneActions = active(state.actions).filter(
            (a) => a.status === "done",
          ).length;
          const doneKnowledge = active(state.knowledge).filter(
            (k) => knowledgeProgress(k) >= 100 || k.status === "done",
          ).length;
          const focus = state.focusSessions.length;
          const rescueBack = (state.emergencySessions || []).filter(
            (x) => x.result === "back",
          ).length;
          return `<div class="grid"><div class="card col-12"><h2>🏆 مكاسبك التراكمية</h2><p class="muted">كل مرة تنفذ، تراجع، أو ترجع من التشتيت أنت بتبني نسخة أقوى منك.</p><div class="wins-grid"><div class="win-card"><strong>${doneActions}</strong><small>إجراءات منفذة</small></div><div class="win-card"><strong>${doneKnowledge}</strong><small>معرفة مكتملة</small></div><div class="win-card"><strong>${focus}</strong><small>جلسات تركيز</small></div><div class="win-card"><strong>${rescueBack}</strong><small>رجوع من التشتت</small></div></div></div><div class="card col-12"><h3>آخر الإنجازات</h3><div class="list">${
            state.timeline
              .slice(0, 6)
              .map(
                (t) =>
                  `<div class="item"><h4>${esc(t.title)}</h4><p>${esc(t.note || "")}</p><span class="pill">${esc(t.date || "")}</span></div>`,
              )
              .join("") ||
            '<div class="empty">سجل أول إنجاز من صفحة الإنجازات.</div>'
          }</div></div></div>`;
        }
        function viewMore() {
          setTitle("المزيد", "كل الأدوات غير اليومية هنا بدون زحمة في البار.");
          const items = [
            [
              "wins",
              "لوحة الفوز",
              "إنجازاتك اليومية",
              "🏆",
              active(state.actions).filter((a) => a.status === "done").length +
                state.focusSessions.length,
            ],
            [
              "reviews",
              "المراجعات",
              "مراجعة أسبوعية وشهرية",
              "✓",
              state.reviews.length,
            ],
            [
              "decisions",
              "القرارات",
              "سجل جودة قراراتك",
              "◇",
              active(state.decisions).length,
            ],
            [
              "crm",
              "العلاقات",
              "أشخاص ومتابعات",
              "☏",
              active(state.contacts).length,
            ],
            ["finance", "المال", "دخل ومصروفات", "ج", state.finance.length],
            [
              "timeline",
              "الإنجازات",
              "خط زمني للتقدم",
              "↗",
              state.timeline.length,
            ],
            [
              "vault",
              "Brain Inbox",
              "أفكار سريعة للتصنيف",
              "+",
              state.inbox.length,
            ],
            ["graph", "Knowledge Graph", "الربط بين المعرفة والنتائج", "⟲", ""],
            [
              "archive",
              "الأرشيف",
              "العناصر المؤرشفة",
              "▤",
              state.archive.length,
            ],
            [
              "campaignAnalysis",
              "تحليل الحملات الاعلانيه",
              "تسعير، CPA، ربح، تعادل، وسجل حملات",
              "📊",
              "",
            ],
            [
              "settings",
              "الإعدادات",
              "تحكم في الاسم والألوان والأنواع",
              "⚙",
              "",
            ],
          ];
          return `<div class="card"><div class="hub-grid more-grid">${items.map((i) => hubTile(...i)).join("")}</div></div>`;
        }
        function viewCampaignAnalysis() {
          setTitle("تحليل الحملات الاعلانيه", "حاسبة التسعير وتحليل الحملات داخل Mogahed OS.");
          return `<div class="card campaign-analysis-shell"><div class="space campaign-analysis-head"><div><h3>📊 تحليل الحملات الاعلانيه</h3><p class="muted">تم دمج ملف Pricing Calculator هنا كأداة مستقلة داخل المشروع، بحيث تفتحها وتطورها من نفس نسخة Mogahed OS بدون فصل الملفات.</p></div><a class="btn secondary mini" href="./tools/pricing_calculator.html" target="_blank" rel="noopener">فتح كامل</a></div><iframe class="campaign-analysis-frame" title="تحليل الحملات الاعلانيه" src="./tools/pricing_calculator.html"></iframe></div>`;
        }
        function viewActions() {
          setTitle(
            "Transformation Engine",
            "كل معرفة يجب أن تتحول إلى فعل ونتيجة.",
          );
          return `<div class="space"><h3>الإجراءات</h3><button class="btn" data-action="addAction">إضافة إجراء</button></div><div class="grid"><div class="card col-12"><div class="list">${active(state.actions).map(cardAction).join("") || '<div class="empty">لا توجد إجراءات بعد. أضف إجراء واحد فقط.</div>'}</div></div></div>`;
        }
        function viewProjects() {
          setTitle("المشاريع", "مشاريع مرنة + مهام + Kanban.");
          const lanes = ["todo", "doing", "done"];
          return `<div class="space"><div class="tabs">${state.types.projects.map((t) => `<span class="pill">${esc(t)}</span>`).join("")}</div><button class="btn" data-action="addProject">إضافة مشروع</button></div><div class="grid"><div class="card col-5"><h3>المشاريع</h3><div class="list">${active(
            state.projects,
          )
            .map(
              (p) =>
                `<div class="item"><h4>${esc(p.title)}</h4><p>${esc(p.summary || "")}</p><div class="row"><span class="pill">${esc(p.type || "")}</span><span class="pill">${esc(p.area || "")}</span><button class="btn secondary mini" data-action="editProject" data-id="${p.id}">تعديل</button><button class="btn danger mini" data-action="archiveItem" data-collection="projects" data-id="${p.id}">أرشفة</button></div></div>`,
            )
            .join(
              "",
            )}</div></div><div class="card col-7"><div class="space"><h3>Kanban</h3><button class="btn secondary mini" data-action="addTask">إضافة مهمة</button></div><div class="kanban">${lanes
            .map(
              (l) =>
                `<div class="lane"><h4>${l}</h4>${active(state.tasks)
                  .filter((t) => t.status === l)
                  .map(
                    (t) =>
                      `<div class="item"><b>${esc(t.title)}</b><p>${esc(t.project || "")}</p><button class="btn secondary mini" data-action="cycleStatus" data-collection="tasks" data-id="${t.id}">نقل</button></div>`,
                  )
                  .join("")}</div>`,
            )
            .join("")}</div></div></div>`;
        }
        function viewGoals() {
          setTitle("الأهداف", "أهداف مرتبطة بمجالات الحياة.");
          return `<div class="space"><h3>الأهداف</h3><button class="btn" data-action="addGoal">إضافة هدف</button></div><div class="grid">${
            active(state.goals)
              .map(
                (g) =>
                  `<div class="card col-4"><h3>${esc(g.title)}</h3><p class="muted">${esc(g.why || "")}</p><div class="progress"><div class="bar" style="width:${Number(g.progress || 0)}%"></div></div><p>${g.progress || 0}%</p><div class="row"><span class="pill">${esc(g.area)}</span><button class="btn secondary mini" data-action="editGoal" data-id="${g.id}">تعديل</button><button class="btn danger mini" data-action="archiveItem" data-collection="goals" data-id="${g.id}">أرشفة</button></div></div>`,
              )
              .join("") ||
            '<div class="card"><p class="muted">لا توجد أهداف.</p></div>'
          }</div>`;
        }
        function viewFocus() {
          setTitle("Focus Mode", "جلسة تركيز بلا تشويش.");
          return `<div class="grid"><div class="card col-8"><h3>ابدأ جلسة تركيز</h3><p class="muted">اختر مهمة واحدة، ابدأ المؤقت، وسجل ملاحظاتك.</p><button class="btn" data-action="openFocus">تشغيل وضع التركيز</button></div>${metric("جلسات التركيز", state.focusSessions.length, "كل الجلسات المسجلة")}</div>`;
        }
        function cardReview(r) {
          return `<div class="item"><h4>${esc(r.title || r.date)}</h4><p>${esc(r.done || "")}</p><p>${esc(r.learned || "")}</p><span class="pill">${esc(r.date || "")}</span></div>`;
        }
        function viewReviews() {
          setTitle("المراجعات", "مراجعة أسبوعية وشهرية بدون نسيان.");
          return `<div class="space"><h3>المراجعات</h3><button class="btn" data-action="addReview">إضافة مراجعة</button></div><div class="card"><div class="list">${state.reviews.map(cardReview).join("") || '<p class="muted">لا توجد مراجعات.</p>'}</div></div>`;
        }
        function viewDecisions() {
          setTitle("Decision Journal", "سجل قراراتك وتعلم من نتائجها.");
          return `<div class="space"><h3>القرارات</h3><button class="btn" data-action="addDecision">إضافة قرار</button></div><div class="card"><div class="list">${active(
            state.decisions,
          )
            .map(
              (d) =>
                `<div class="item"><h4>${esc(d.title)}</h4><p><b>المتوقع:</b> ${esc(d.expected || "")}</p><p><b>الفعلي:</b> ${esc(d.actual || "")}</p><div class="row"><span class="pill">${esc(d.area || "")}</span><span class="pill">${esc(d.date || "")}</span><button class="btn secondary mini" data-action="editDecision" data-id="${d.id}">تعديل</button><button class="btn danger mini" data-action="archiveItem" data-collection="decisions" data-id="${d.id}">أرشفة</button></div></div>`,
            )
            .join("")}</div></div>`;
        }
        function viewCRM() {
          setTitle("Personal CRM", "العلاقات المهمة لا تُترك للصدفة.");
          return `<div class="space"><h3>العلاقات</h3><button class="btn" data-action="addContact">إضافة شخص</button></div><div class="grid">${
            active(state.contacts)
              .map(
                (c) =>
                  `<div class="card col-4"><h3>${esc(c.name)}</h3><p class="muted">${esc(c.role || "")}</p><p>${esc(c.note || "")}</p><span class="pill">آخر تواصل: ${esc(c.last || "")}</span><div class="row" style="margin-top:10px"><button class="btn secondary mini" data-action="editContact" data-id="${c.id}">تعديل</button><button class="btn danger mini" data-action="archiveItem" data-collection="contacts" data-id="${c.id}">أرشفة</button></div></div>`,
              )
              .join("") ||
            '<div class="card"><p class="muted">أضف الأشخاص المهمين.</p></div>'
          }</div>`;
        }
        function viewFinance() {
          setTitle("المال", "تسجيل مالي بسيط ومرن.");
          const income = state.finance
              .filter((x) => x.kind === "دخل")
              .reduce((s, x) => s + Number(x.amount || 0), 0),
            expense = state.finance
              .filter((x) => x.kind === "مصروف")
              .reduce((s, x) => s + Number(x.amount || 0), 0);
          return `<div class="space"><h3>المال</h3><button class="btn" data-action="addFinance">إضافة حركة</button></div><div class="grid">${metric("الدخل", income, "جنيه")}${metric("المصروف", expense, "جنيه")}${metric("الصافي", income - expense, "جنيه")}<div class="card col-12"><table class="table"><tr><th>النوع</th><th>البند</th><th>القيمة</th><th>التاريخ</th></tr>${state.finance.map((f) => `<tr><td>${esc(f.kind)}</td><td>${esc(f.title)}</td><td>${esc(f.amount)}</td><td>${esc(f.date)}</td></tr>`).join("")}</table></div></div>`;
        }
        function viewTimeline() {
          setTitle("Achievement Timeline", "خط زمني لإنجازاتك.");
          return `<div class="space"><h3>الإنجازات</h3><button class="btn" data-action="addTimeline">إضافة إنجاز</button></div><div class="card"><div class="list">${state.timeline
            .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
            .map(
              (t) =>
                `<div class="item"><h4>${esc(t.title)}</h4><p>${esc(t.note || "")}</p><span class="pill">${esc(t.date || "")}</span> <span class="pill">${esc(t.area || "")}</span></div>`,
            )
            .join("")}</div></div>`;
        }
        function viewVault() {
          setTitle("Brain Inbox", "التقاط سريع لأي فكرة ثم تصنيفها لاحقًا.");
          return `<div class="space"><h3>Inbox</h3><button class="btn" data-action="quickInbox">إضافة فكرة</button></div><div class="card"><div class="list">${state.inbox.map((i) => `<div class="item"><p>${esc(i.text)}</p><div class="row"><span class="pill">${esc(i.date)}</span><button class="btn secondary mini" data-action="inboxToKnowledge" data-id="${i.id}">معرفة</button><button class="btn secondary mini" data-action="inboxToAction" data-id="${i.id}">إجراء</button><button class="btn danger mini" data-action="deleteInbox" data-id="${i.id}">حذف</button></div></div>`).join("") || '<p class="muted">لا توجد أفكار.</p>'}</div></div>`;
        }
        function viewGraph() {
          setTitle(
            "Knowledge Graph",
            "روابط مبسطة بين المعرفة والإجراءات والنتائج.",
          );
          let html = '<div class="card"><h3>الخريطة</h3>';
          active(state.knowledge).forEach((k) => {
            html += `<div class="item"><span class="graph-node">${esc(k.title)}</span> ← <span class="graph-node">${esc((k.ideas || "فكرة").split("\n")[0])}</span> ← ${
              state.actions
                .filter((a) => a.sourceId === k.id)
                .map((a) => `<span class="graph-node">${esc(a.title)}</span>`)
                .join(" ") || '<span class="graph-node">لا يوجد إجراء</span>'
            }</div>`;
          });
          return html + "</div>";
        }
        function viewArchive() {
          setTitle("الأرشيف", "لا حذف نهائي. استرجع أي شيء.");
          return `<div class="card"><div class="list">${state.archive.map((a) => `<div class="item"><div class="space"><div><h4>${esc(a.title || a.name || a.text || "عنصر")}</h4><p>${esc(a._collection)}</p></div><button class="btn secondary mini" data-action="restoreItem" data-id="${a.id}" data-collection="${a._collection}">استرجاع</button></div></div>`).join("") || '<p class="muted">الأرشيف فارغ.</p>'}</div></div>`;
        }
        function viewSettings() {
          setTitle("الإعدادات والتحكم", "كل شيء قابل للتعديل من مكان واحد.");
          return `<div class="grid"><div class="card col-6"><h3>البروفايل</h3><label>الاسم</label><input id="setName" value="${esc(state.profile.name)}"><label>اللقب</label><input id="setTitle" value="${esc(state.profile.title)}"><label>الرؤية الشخصية</label><textarea id="setVision">${esc(state.profile.vision)}</textarea><label>صورة البروفايل</label><input type="file" id="setAvatar" accept="image/*"><button class="btn" data-action="saveProfile" style="margin-top:10px">حفظ البروفايل</button></div><div class="card col-6"><h3>الألوان</h3><label>اللون الأول</label><input type="color" id="setAccent" value="${esc(state.settings.accent)}"><label>اللون الثاني</label><input type="color" id="setAccent2" value="${esc(state.settings.accent2)}"><button class="btn" data-action="saveColors" style="margin-top:10px">حفظ الألوان</button></div><div class="card col-4"><h3>أنواع المعرفة</h3>${typeEditor("knowledge")}</div><div class="card col-4"><h3>أنواع المشاريع</h3>${typeEditor("projects")}</div><div class="card col-4"><h3>مجالات الحياة</h3>${typeEditor("areas")}</div><div class="card col-6"><h3>الموديولات</h3>${NAV.map((n) => `<label><input type="checkbox" class="moduleToggle" data-module="${n[0]}" ${state.modules[n[0]] !== false ? "checked" : ""} style="width:auto"> ${n[1]}</label>`).join("")}<button class="btn" data-action="saveModules">حفظ الموديولات</button></div><div class="card col-6"><h3>النسخ الاحتياطي</h3><div class="row"><button class="btn" data-action="exportData">Export</button><button class="btn secondary" data-action="importData">Import</button><button class="btn danger" data-action="resetApp">Reset</button></div><input type="file" id="importFile" accept="application/json" style="display:none"></div></div>`;
        }
        function typeEditor(key) {
          return `<div class="list">${state.types[key].map((t) => `<div class="space item"><span>${esc(t)}</span><button class="btn danger mini" data-action="removeType" data-key="${key}" data-value="${esc(t)}">حذف</button></div>`).join("")}</div><div class="row" style="margin-top:10px"><input id="type_${key}" placeholder="نوع جديد"><button class="btn mini" data-action="addType" data-key="${key}">إضافة</button></div>`;
        }
        function bindDynamic() {
          document.querySelectorAll("[data-route]").forEach(
            (b) =>
              (b.onclick = () => {
                route = b.dataset.route;
                render();
              }),
          );
        }
        function syncModalHeaderActions(title, body) {
          const saveBtn = $("modalHeaderSaveBtn");
          if (!saveBtn) return;
          let targetAction = "";
          const isKnowledgeForm =
            (title === "إضافة معرفة" || title === "تعديل معرفة") &&
            /data-action="saveKnowledge"/.test(body || "");
          const isGoalForm =
            (title === "إضافة هدف" || title === "تعديل هدف") &&
            /data-action="saveGoal"/.test(body || "");
          if (isKnowledgeForm) targetAction = "saveKnowledge";
          if (isGoalForm) targetAction = "saveGoal";
          saveBtn.dataset.targetAction = targetAction;
          saveBtn.style.display = targetAction ? "inline-flex" : "none";
        }
        function openModal(title, body) {
          $("modalTitle").textContent = title;
          $("modalBody").innerHTML = window.MogahedOSX_V81_sanitizeHTML ? window.MogahedOSX_V81_sanitizeHTML(body) : body;
          syncModalHeaderActions(title, body);
          $("modal").classList.add("open");
        }
        function closeModal() {
          $("modal").classList.remove("open", "player-mode");
          $("modalBody").innerHTML = "";
          syncModalHeaderActions("", "");
        }
        function field(id, label, value = "", type = "text") {
          return `<label>${label}</label><input id="${id}" type="${type}" value="${esc(value)}">`;
        }
        function areaSelect(id, val = "") {
          return `<label>مجال الحياة</label><select id="${id}">${state.types.areas.map((a) => `<option ${a === val ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>`;
        }
        function typeSelect(id, arr, val = "") {
          return `<label>النوع</label><select id="${id}">${arr.map((a) => `<option ${a === val ? "selected" : ""}>${esc(a)}</option>`).join("")}</select>`;
        }
        function get(id) {
          return $(id)?.value || "";
        }
        function readImage(input, cb) {
          const f = input?.files?.[0];
          if (!f) {
            cb("");
            return;
          }
          const r = new FileReader();
          r.onload = () => cb(r.result);
          r.readAsDataURL(f);
        }
        function readDataFile(input, cb) {
          const f = input?.files?.[0];
          if (!f) {
            cb(null);
            return;
          }
          const r = new FileReader();
          r.onload = () =>
            cb({ data: r.result, name: f.name, mime: f.type, size: f.size });
          r.onerror = () => cb(null);
          r.readAsDataURL(f);
        }
        const Actions = {
          closeModal() {
            closeModal();
          },
          saveKnowledgeHeader() {
            const targetAction =
              $("modalHeaderSaveBtn")?.dataset.targetAction ||
              "saveKnowledge";
            const btn = document.querySelector(
              `#modalBody [data-action="${targetAction}"]`,
            );
            if (btn) {
              btn.click();
            } else {
              toast("زر الحفظ غير متاح في هذه النافذة");
            }
          },
          openExternal(_, el) {
            const url = el.dataset.url;
            if (url) window.open(url, "_blank");
          },
          copyText(_, el) {
            const txt = el.dataset.text || "";
            if (navigator.clipboard && txt) {
              navigator.clipboard
                .writeText(txt)
                .then(() => toast("تم النسخ"))
                .catch(() => toast("تعذر النسخ"));
            } else toast("تعذر النسخ");
          },
          openQuickAdd() {
            openModal(
              "إضافة سريعة",
              `<div class="quick-add-grid"><button class="quick-add-option" data-action="addKnowledge"><span class="quick-add-icon">📚</span><span><strong>كتاب / معرفة</strong><small>عنوان وصورة ثم التفاصيل لاحقاً</small></span></button><button class="quick-add-option" data-action="addPodcastQuick"><span class="quick-add-icon">🎙</span><span><strong>بودكاست</strong><small>يسجل كبودكاست ويمكن إضافة رابط تشغيل</small></span></button><button class="quick-add-option" data-action="addProject"><span class="quick-add-icon">🎯</span><span><strong>مشروع</strong><small>ابدأ مشروع جديد</small></span></button><button class="quick-add-option" data-action="addAction"><span class="quick-add-icon">⚡</span><span><strong>إجراء</strong><small>مهمة تنفيذية مباشرة</small></span></button><button class="quick-add-option" data-action="quickInbox"><span class="quick-add-icon">💡</span><span><strong>فكرة</strong><small>التقطها بسرعة وصنفها لاحقاً</small></span></button><button class="quick-add-option" data-action="addTask"><span class="quick-add-icon">✓</span><span><strong>مهمة</strong><small>مهمة Kanban بسيطة</small></span></button></div>`,
            );
          },
          quickInbox() {
            openModal(
              "التقاط فكرة سريع",
              `<label>الفكرة</label><textarea id="inboxText" placeholder="اكتب أي فكرة بسرعة..."></textarea><button class="btn" data-action="saveInbox">حفظ</button>`,
            );
          },
          saveInbox() {
            const text = get("inboxText").trim();
            if (!text) return toast("اكتب الفكرة أولاً");
            state.inbox.unshift({
              id: uid(),
              text,
              date: new Date().toLocaleString("ar-EG"),
            });
            save();
            closeModal();
            render();
            toast("تم حفظ الفكرة");
          },
          addPodcastQuick() {
            formKnowledge({
              type: "بودكاست",
              area: state.types.areas[0],
              rating: 0,
            });
          },
          addKnowledge() {
            formKnowledge();
          },
          editKnowledge(id) {
            formKnowledge(state.knowledge.find((x) => x.id === id));
          },
          saveKnowledge(id) {
            const existing = state.knowledge.find((x) => x.id === id);
            const input = $("k_cover");
            readImage(input, (img) => {
              readDataFile($("k_mediaFile"), (file) => {
                if (file && file.size > 4500000)
                  toast(
                    "تنبيه: الملف كبير وقد لا يحفظ في بعض المتصفحات. الأفضل استخدام ملف أصغر أو رابط.",
                  );
                const obj = {
                  id: id || uid(),
                  title: get("k_title"),
                  type: get("k_type"),
                  area: get("k_area"),
                  rating: get("k_rating"),
                  status: "active",
                  cover: img || existing?.cover || "",
                  mediaType: get("k_mediaType"),
                  mediaUrl: get("k_mediaUrl"),
                  link: get("k_mediaUrl"),
                  mediaData: file?.data || existing?.mediaData || "",
                  mediaName: file?.name || existing?.mediaName || "",
                  mediaMime: file?.mime || existing?.mediaMime || "",
                  playerNotes: existing?.playerNotes || "",
                  summary: get("k_summary"),
                  ideas: get("k_ideas"),
                  application: get("k_app"),
                  result: get("k_result"),
                  currentUnit: Number(get("k_current") || 0),
                  totalUnits: Number(get("k_total") || 0),
                  progress:
                    Number(get("k_total") || 0) > 0
                      ? Math.round(
                          (Number(get("k_current") || 0) /
                            Number(get("k_total") || 1)) *
                            100,
                        )
                      : existing?.progress || 0,
                  reviewDate: get("k_review"),
                };
                if (existing) Object.assign(existing, obj);
                else state.knowledge.unshift(obj);
                save();
                closeModal();
                render();
                toast("تم حفظ المعرفة");
              });
            });
          },
          openKnowledgePlayer(id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return toast("العنصر غير موجود");
            openKnowledgePlayerModal(k);
          },
          completeKnowledge(id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            k.status = "done";
            k.progress = 100;
            k.currentUnit = k.totalUnits || k.currentUnit || 100;
            state.timeline.unshift({
              id: uid(),
              title: "أنهيت: " + (k.title || "معرفة"),
              date: new Date().toISOString().slice(0, 10),
              area: k.area || "التعلم",
              note: "تم إنهاء عنصر معرفة وتحويله إلى فوز.",
            });
            save();
            render();
            toast("تم تسجيل الفوز 🏆");
          },
          savePlayerNotes(id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            k.playerNotes = get("playerNotes");
            if (get("playerIdeas")) k.ideas = get("playerIdeas");
            if (get("playerApp")) k.application = get("playerApp");
            save();
            render();
            toast("تم حفظ ملاحظات التشغيل");
          },
          playerToAction(id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (k) {
              openModal(
                "إجراء من المحتوى",
                `${field("a_title", "الإجراء", "طبّق: " + (k.title || ""))}${areaSelect("a_area", k.area)}<label>السبب / الملاحظة</label><textarea id="a_reason">${esc(k.playerNotes || k.application || "")}</textarea><button class="btn" data-action="saveAction" data-source="${id || ""}">حفظ الإجراء</button>`,
              );
            }
          },

          makeActionFromKnowledge(id) {
            const k = state.knowledge.find((x) => x.id === id);
            openModal(
              "تحويل المعرفة إلى إجراء",
              `${field("a_title", "الإجراء", k ? "طبّق: " + k.title : "")}${areaSelect("a_area", k?.area)}<label>لماذا؟</label><textarea id="a_reason">${esc(k?.application || "")}</textarea><button class="btn" data-action="saveAction" data-source="${id || ""}">حفظ الإجراء</button>`,
            );
          },
          addAction() {
            formAction();
          },
          editAction(id) {
            formAction(state.actions.find((x) => x.id === id));
          },
          saveAction(id, el) {
            const existing = state.actions.find((x) => x.id === id);
            const obj = {
              id: id || uid(),
              title: get("a_title"),
              area: get("a_area"),
              reason: get("a_reason"),
              status: existing?.status || "todo",
              sourceId: el?.dataset?.source || existing?.sourceId || "",
            };
            if (existing) Object.assign(existing, obj);
            else state.actions.unshift(obj);
            save();
            closeModal();
            render();
            toast("تم حفظ الإجراء");
          },
          addProject() {
            formProject();
          },
          editProject(id) {
            formProject(state.projects.find((x) => x.id === id));
          },
          saveProject(id) {
            const existing = state.projects.find((x) => x.id === id);
            const obj = {
              id: id || uid(),
              title: get("p_title"),
              type: get("p_type"),
              area: get("p_area"),
              kpi: get("p_kpi"),
              summary: get("p_summary"),
              status: "active",
            };
            if (existing) Object.assign(existing, obj);
            else state.projects.unshift(obj);
            save();
            closeModal();
            render();
            toast("تم حفظ المشروع");
          },
          addTask() {
            openModal(
              "إضافة مهمة",
              `${field("t_title", "المهمة")}${field("t_project", "المشروع")}<button class="btn" data-action="saveTask">حفظ</button>`,
            );
          },
          saveTask() {
            state.tasks.unshift({
              id: uid(),
              title: get("t_title"),
              project: get("t_project"),
              status: "todo",
            });
            save();
            closeModal();
            render();
          },
          addGoal() {
            formGoal();
          },
          editGoal(id) {
            formGoal(state.goals.find((x) => x.id === id));
          },
          saveGoal(id) {
            const existing = state.goals.find((x) => x.id === id);
            const obj = {
              id: id || uid(),
              title: get("g_title"),
              area: get("g_area"),
              period: get("g_period") || "سنوي",
              startDate: get("g_start"),
              endDate: get("g_end"),
              status: get("g_status") || "شغال",
              why: get("g_why"),
              progress: Number(get("g_progress") || 0),
            };
            if (existing) Object.assign(existing, obj);
            else state.goals.unshift(obj);
            save();
            closeModal();
            render();
          },
          v77SetGoalFilter(_, el) {
            v77GoalFilter = el.dataset.filter || "الكل";
            render();
          },
          addReview() {
            openModal(
              "إضافة مراجعة",
              `${field("r_title", "العنوان", "مراجعة أسبوعية")}${field("r_date", "التاريخ", new Date().toISOString().slice(0, 10), "date")}<label>ماذا أنجزت؟</label><textarea id="r_done"></textarea><label>ماذا تعلمت؟</label><textarea id="r_learned"></textarea><button class="btn" data-action="saveReview">حفظ</button>`,
            );
          },
          saveReview() {
            state.reviews.unshift({
              id: uid(),
              title: get("r_title"),
              date: get("r_date"),
              done: get("r_done"),
              learned: get("r_learned"),
            });
            save();
            closeModal();
            render();
          },
          addDecision() {
            formDecision();
          },
          editDecision(id) {
            formDecision(state.decisions.find((x) => x.id === id));
          },
          saveDecision(id) {
            const existing = state.decisions.find((x) => x.id === id);
            const obj = {
              id: id || uid(),
              title: get("d_title"),
              area: get("d_area"),
              expected: get("d_expected"),
              actual: get("d_actual"),
              date: get("d_date") || new Date().toISOString().slice(0, 10),
              status: "active",
            };
            if (existing) Object.assign(existing, obj);
            else state.decisions.unshift(obj);
            save();
            closeModal();
            render();
          },
          addContact() {
            formContact();
          },
          editContact(id) {
            formContact(state.contacts.find((x) => x.id === id));
          },
          saveContact(id) {
            const existing = state.contacts.find((x) => x.id === id);
            const obj = {
              id: id || uid(),
              name: get("c_name"),
              role: get("c_role"),
              last: get("c_last"),
              note: get("c_note"),
              status: "active",
            };
            if (existing) Object.assign(existing, obj);
            else state.contacts.unshift(obj);
            save();
            closeModal();
            render();
          },
          addFinance() {
            openModal(
              "حركة مالية",
              `${typeSelect("f_kind", ["دخل", "مصروف"])}${field("f_title", "البند")}${field("f_amount", "القيمة", "", "number")}${field("f_date", "التاريخ", new Date().toISOString().slice(0, 10), "date")}<button class="btn" data-action="saveFinance">حفظ</button>`,
            );
          },
          saveFinance() {
            state.finance.unshift({
              id: uid(),
              kind: get("f_kind"),
              title: get("f_title"),
              amount: get("f_amount"),
              date: get("f_date"),
            });
            save();
            closeModal();
            render();
          },
          addTimeline() {
            openModal(
              "إضافة إنجاز",
              `${field("tl_title", "الإنجاز")}${field("tl_date", "التاريخ", new Date().toISOString().slice(0, 10), "date")}${areaSelect("tl_area")}<label>ملاحظة</label><textarea id="tl_note"></textarea><button class="btn" data-action="saveTimeline">حفظ</button>`,
            );
          },
          saveTimeline() {
            state.timeline.unshift({
              id: uid(),
              title: get("tl_title"),
              date: get("tl_date"),
              area: get("tl_area"),
              note: get("tl_note"),
            });
            save();
            closeModal();
            render();
          },
          archiveItem(id, el) {
            const col = el.dataset.collection;
            const arr = state[col];
            const idx = arr.findIndex((x) => x.id === id);
            if (idx > -1) {
              const item = arr[idx];
              item.status = "archived";
              state.archive.unshift({ ...item, _collection: col });
              save();
              render();
              toast("تمت الأرشفة");
            }
          },
          restoreItem(id, el) {
            const col = el.dataset.collection;
            const item = state.archive.find(
              (x) => x.id === id && x._collection === col,
            );
            if (item) {
              const target = state[col].find((x) => x.id === id);
              if (target) target.status = "active";
              state.archive = state.archive.filter(
                (x) => !(x.id === id && x._collection === col),
              );
              save();
              render();
            }
          },
          cycleStatus(id, el) {
            const arr = state[el.dataset.collection];
            const x = arr.find((i) => i.id === id);
            if (!x) return;
            const seq =
              el.dataset.collection === "tasks"
                ? ["todo", "doing", "done"]
                : ["todo", "doing", "done"];
            x.status = seq[(seq.indexOf(x.status) + 1) % seq.length] || seq[0];
            save();
            render();
          },
          openFocus() {
            $("focusOverlay").classList.add("open");
            const task =
              active(state.tasks).find((t) => t.status !== "done") ||
              active(state.actions).find((a) => a.status !== "done");
            $("focusTaskName").textContent =
              task?.title || "مهمة واحدة فقط الآن";
          },
          closeFocus() {
            $("focusOverlay").classList.remove("open");
            if (timerRunning) Actions.toggleTimer();
            state.focusSessions.unshift({
              id: uid(),
              date: new Date().toLocaleString("ar-EG"),
              notes: $("focusNotes").value,
            });
            save();
            render();
          },
          toggleTimer() {
            timerRunning = !timerRunning;
            if (timerRunning) {
              timer = setInterval(() => {
                timerLeft--;
                updateTimer();
                if (timerLeft <= 0) {
                  Actions.toggleTimer();
                  openModal(
                    "نتيجة جلسة الإنقاذ",
                    `<div class="card emergency-card"><h2>انتهت الـ 15 دقيقة</h2><p class="muted">اختر النتيجة عشان النظام يتعلم منك.</p><div class="rescue-choice-grid"><button class="rescue-choice active" data-action="emergencyResult" data-result="back">✅ رجعت للعمل</button><button class="rescue-choice" data-action="startEmergencyFocus">🔁 أحتاج 15 دقيقة أخرى</button><button class="rescue-choice" data-action="emergencyResult" data-result="failed">❌ لم أستطع</button><button class="rescue-choice" data-action="closeModal">إغلاق</button></div></div>`,
                  );
                  toast("انتهت الجلسة");
                }
              }, 1000);
            } else clearInterval(timer);
          },
          resetTimer() {
            timerLeft = 1500;
            updateTimer();
          },
          emergencyPlan() {
            const mood = get("mood") || "مشتت";
            const task =
              active(state.tasks).find((t) => t.status !== "done") ||
              active(state.actions).find((a) => a.status !== "done");
            const goal = active(state.goals)[0];
            const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
            const sessions = state.emergencySessions || [];
            const week = sessions.filter(
              (x) => new Date(x.iso || x.date || 0).getTime() >= weekAgo,
            ).length;
            const saved = sessions.filter((x) => x.result === "back").length;
            const total = sessions.length;
            openModal(
              "🚨 وضع الإنقاذ",
              `<div class="rescue-grid"><div class="card emergency-card"><span class="pill">Rescue Mode</span><h2>اقطع التشتيت الآن</h2><p class="muted">مش مطلوب حماس. مطلوب خطوة صغيرة لمدة 15 دقيقة فقط.</p><label>ما الذي شتتك الآن؟</label><select id="rescueSource"><option>فيسبوك</option><option>يوتيوب</option><option>تيك توك</option><option>واتساب</option><option>تصفح عشوائي</option><option>تفكير زائد</option><option>غير ذلك</option></select><div class="rescue-steps"><div class="rescue-step"><b>1</b><span>اقفل التطبيق أو التبويب المشتت الآن.</span></div><div class="rescue-step"><b>2</b><span>خذ نفس عميق واشرب ماء.</span></div><div class="rescue-step"><b>3</b><span>ارجع للمهمة الحالية: <strong>${esc(task?.title || "أضف مهمة واحدة فقط")}</strong></span></div><div class="rescue-step"><b>4</b><span>شغّل تركيز 15 دقيقة بدون تفاوض.</span></div></div><button class="btn rescue rescue-big" data-action="startEmergencyFocus">ابدأ الإنقاذ 15 دقيقة</button></div><div class="card"><h3>حالتك الآن</h3><p class="muted">${esc(mood)}</p><div class="soft-divider"></div><h3>هدفك الحالي</h3><p class="muted">${esc(goal?.title || "تقليل التشتت")}</p><div class="soft-divider"></div><div class="rescue-counter"><div><strong>${week}</strong><small>هذا الأسبوع</small></div><div><strong>${saved}</strong><small>مرات رجوع</small></div><div><strong>${total}</strong><small>كل المحاولات</small></div></div><label>ملاحظة سريعة</label><textarea id="rescueNote" placeholder="ما الذي جذبك؟ وما أول خطوة للرجوع؟"></textarea></div></div>`,
            );
          },
          startEmergencyFocus() {
            const source = get("rescueSource") || "غير محدد";
            const note = get("rescueNote") || "";
            state.emergencySessions = state.emergencySessions || [];
            state.emergencySessions.unshift({
              id: uid(),
              source,
              note,
              result: "started",
              date: new Date().toLocaleString("ar-EG"),
              iso: new Date().toISOString(),
            });
            save();
            closeModal();
            timerLeft = 900;
            updateTimer();
            Actions.openFocus();
            toast("بدأ وضع الإنقاذ: 15 دقيقة فقط");
          },
          emergencyResult(_, el) {
            const result = el.dataset.result || "back";
            state.emergencySessions = state.emergencySessions || [];
            state.emergencySessions.unshift({
              id: uid(),
              source: "متابعة الإنقاذ",
              note: "نتيجة بعد الجلسة",
              result,
              date: new Date().toLocaleString("ar-EG"),
              iso: new Date().toISOString(),
            });
            save();
            closeModal();
            render();
            toast(
              result === "back" ? "تم تسجيل الرجوع للعمل" : "تم تسجيل المحاولة",
            );
          },
          saveProfile() {
            state.profile.name = get("setName");
            state.profile.title = get("setTitle");
            state.profile.vision = get("setVision");
            readImage($("setAvatar"), (img) => {
              if (img) state.profile.avatar = img;
              save();
              render();
              toast("تم حفظ البروفايل");
            });
          },
          saveColors() {
            state.settings.accent = get("setAccent");
            state.settings.accent2 = get("setAccent2");
            save();
            render();
          },
          addType(_, el) {
            const key = el.dataset.key;
            const val = get("type_" + key).trim();
            if (val && !state.types[key].includes(val))
              state.types[key].push(val);
            save();
            render();
          },
          removeType(_, el) {
            const key = el.dataset.key,
              val = el.dataset.value;
            state.types[key] = state.types[key].filter((x) => x !== val);
            save();
            render();
          },
          saveModules() {
            document
              .querySelectorAll(".moduleToggle")
              .forEach((ch) => (state.modules[ch.dataset.module] = ch.checked));
            save();
            render();
          },
          exportData() {
            const blob = new Blob([JSON.stringify(state, null, 2)], {
              type: "application/json",
            });
            const a = document.createElement("a");
            a.href = URL.createObjectURL(blob);
            a.download = "mogahed-os-x-backup.json";
            a.click();
            URL.revokeObjectURL(a.href);
          },
          importData() {
            const inp = $("importFile");
            if (inp) inp.click();
            else toast("افتح الإعدادات للاستيراد");
          },
          resetApp() {
            if (confirm("هل تريد إعادة ضبط النظام؟")) {
              localStorage.removeItem(KEY);
              state = seed();
              route = "home";
              render();
            }
          },
          inboxToKnowledge(id) {
            const i = state.inbox.find((x) => x.id === id);
            if (i) {
              formKnowledge({
                title: i.text,
                type: state.types.knowledge[0],
                summary: i.text,
                area: state.types.areas[0],
                rating: 0,
              });
            }
          },
          inboxToAction(id) {
            const i = state.inbox.find((x) => x.id === id);
            if (i) {
              formAction({
                title: i.text,
                area: state.types.areas[0],
                reason: "من Inbox",
              });
            }
          },
          deleteInbox(id) {
            state.inbox = state.inbox.filter((x) => x.id !== id);
            save();
            render();
          },
        };

        function detectMediaType(url) {
          url = String(url || "").toLowerCase();
          if (!url) return "بدون";
          if (url.includes("youtube.com") || url.includes("youtu.be"))
            return "YouTube";
          if (url.includes("spotify.com")) return "Spotify";
          if (url.includes("soundcloud.com")) return "SoundCloud";
          if (url.endsWith(".pdf") || url.includes(".pdf")) return "PDF / Link";
          return "Article / Web";
        }
        function cleanMediaUrl(url) {
          url = String(url || "").trim();
          // يقبل الروابط حتى لو اتنسخت ومعاها مسافات أو حروف مخفية من الموبايل
          return url.replace(/[\u200B-\u200D\uFEFF]/g, "");
        }
        function youtubeIdFromUrl(url) {
          url = cleanMediaUrl(url);
          if (!url) return "";
          try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, "").toLowerCase();
            if (host === "youtu.be")
              return u.pathname.split("/").filter(Boolean)[0] || "";
            if (host.includes("youtube.com")) {
              let id = u.searchParams.get("v") || "";
              if (!id && u.pathname.includes("/shorts/"))
                id = u.pathname.split("/shorts/")[1]?.split(/[/?#]/)[0] || "";
              if (!id && u.pathname.includes("/live/"))
                id = u.pathname.split("/live/")[1]?.split(/[/?#]/)[0] || "";
              if (!id && u.pathname.includes("/embed/"))
                id = u.pathname.split("/embed/")[1]?.split(/[/?#]/)[0] || "";
              return id;
            }
          } catch (e) {
            const m = url.match(
              /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
            );
            return m ? m[1] : "";
          }
          return "";
        }

        function isLocalOrContentContext() {
          const p = String(location.protocol || "").toLowerCase();
          const href = String(location.href || "").toLowerCase();
          return (
            p === "file:" ||
            p === "content:" ||
            href.startsWith("content://") ||
            href.includes("content://")
          );
        }
        function youtubeEmbedUrl(id) {
          const origin =
            location.protocol === "http:" || location.protocol === "https:"
              ? "&origin=" + encodeURIComponent(location.origin)
              : "";
          // نستخدم youtube.com بدل nocookie لأن بعض WebView على الموبايل يرفض nocookie ويظهر Error 153.
          return (
            "https://www.youtube.com/embed/" +
            encodeURIComponent(id) +
            "?rel=0&modestbranding=1&playsinline=1&enablejsapi=1" +
            origin
          );
        }
        function youtubeWatchUrl(id, original) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : original || "";
        }
        function mediaEmbedUrl(url, type) {
          url = cleanMediaUrl(url);
          if (!url) return "";
          try {
            const u = new URL(url);
            const host = u.hostname.replace(/^www\./, "").toLowerCase();
            const yid = youtubeIdFromUrl(url);
            if (yid) return youtubeEmbedUrl(yid);
            if (host.includes("spotify.com")) {
              const parts = u.pathname.split("/").filter(Boolean);
              if (parts.length >= 2)
                return (
                  "https://open.spotify.com/embed/" + parts[0] + "/" + parts[1]
                );
            }
            if (host.includes("soundcloud.com"))
              return (
                "https://w.soundcloud.com/player/?url=" +
                encodeURIComponent(url)
              );
            if (url.toLowerCase().endsWith(".pdf") || type === "PDF / Link")
              return url;
            return url;
          } catch (e) {
            const yid = youtubeIdFromUrl(url);
            return yid ? youtubeEmbedUrl(yid) : url;
          }
        }
        function resolvedMediaType(k, url) {
          // مهم: لو النوع محفوظ "بدون" بالغلط لكن فيه رابط يوتيوب، نكتشف النوع تلقائياً
          if (k.mediaData) {
            return k.mediaMime?.startsWith("video/")
              ? "MP4 محلي"
              : k.mediaMime?.startsWith("audio/")
                ? "MP3 محلي"
                : k.mediaMime?.includes("pdf")
                  ? "PDF محلي"
                  : "ملف محلي";
          }
          const detected = detectMediaType(url);
          return !k.mediaType || k.mediaType === "بدون"
            ? detected
            : k.mediaType;
        }
        function playerMediaHtml(k, type, embed, url) {
          if (k.mediaData) {
            const mime = (k.mediaMime || "").toLowerCase();
            if (mime.startsWith("video/"))
              return `<div class="player-frame-wrap v2"><video src="${esc(k.mediaData)}" controls playsinline></video></div>`;
            if (mime.startsWith("audio/"))
              return `<div class="player-frame-wrap v2"><audio src="${esc(k.mediaData)}" controls></audio></div>`;
            if (mime.includes("pdf"))
              return `<div class="player-frame-wrap v2"><iframe src="${esc(k.mediaData)}"></iframe></div>`;
            return `<div class="player-empty v2">الملف مرفوع لكن نوعه غير مدعوم للتشغيل الداخلي.</div>`;
          }
          if (embed && type !== "بدون") {
            const yid = type === "YouTube" ? youtubeIdFromUrl(url) : "";
            if (type === "YouTube" && isLocalOrContentContext()) {
              return `<div class="player-local-youtube-block"><div><h3>الرابط صحيح، لكن YouTube مانع التشغيل هنا</h3><p>أنت فاتح المشروع من content:// أو file:// على الموبايل. YouTube يحتاج صفحة HTTP/HTTPS لها origin، ولذلك يظهر Error 153 داخل iframe. الحل: افتح الفيديو خارجيًا أو شغّل المشروع من استضافة HTTPS / سيرفر محلي.</p><div class="player-local-youtube-actions"><button class="btn" data-action="openExternal" data-url="${esc(youtubeWatchUrl(yid, url))}">فتح على YouTube</button><button class="btn secondary" data-action="copyText" data-text="${esc(location.href)}">نسخ رابط المشروع</button></div></div></div>`;
            }
            const normalNote =
              type === "YouTube"
                ? '<div class="player-fix-note">لو الفيديو لم يظهر، غالباً صاحب الفيديو مانع التشغيل المضمّن. استخدم زر فتح المصدر، أو جرّب رابط فيديو آخر.</div>'
                : "";
            return `<div class="player-frame-wrap v2"><iframe src="${esc(embed)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen loading="lazy"></iframe></div>${normalNote}`;
          }
          return `<div class="player-empty v2"><div><h3>لا يوجد محتوى قابل للتشغيل</h3><p class="muted">أضف رابط YouTube / Spotify / SoundCloud أو ارفع MP4 / MP3 / PDF من تعديل المعرفة.</p></div></div>`;
        }
        function openKnowledgePlayerModal(k) {
          const url = cleanMediaUrl(k.mediaUrl || k.link || "");
          const type = resolvedMediaType(k, url);
          const embed = mediaEmbedUrl(url, type);
          $("modal").classList.add("player-mode");
          openModal(
            "Knowledge Player",
            `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${esc(type)} — تشغيل وملاحظات بدون مغادرة النظام</p></div><div class="row">${k.mediaData ? `<span class="player-local-badge">● ملف مرفوع</span>` : ""}${url ? `<button class="btn secondary mini" data-action="openExternal" data-url="${esc(url)}">فتح المصدر</button>` : ""}</div></div><div class="player-shell"><div>${playerMediaHtml(k, type, embed, url)}</div><div class="player-side"><div class="item"><b>ملاحظات أثناء المشاهدة</b><p class="muted">اكتب الفكرة فوراً، ثم حوّلها لإجراء.</p></div><div class="player-note-area"><label>ملاحظاتي</label><textarea id="playerNotes">${esc(k.playerNotes || "")}</textarea><label>أهم الأفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || "")}</textarea></div><div class="row"><button class="btn" data-action="savePlayerNotes" data-id="${k.id}">حفظ</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button><button class="btn secondary" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div></div>`,
          );
        }
        function formKnowledge(k = {}) {
          openModal(
            k.id ? "تعديل معرفة" : "إضافة معرفة",
            `${field("k_title", "العنوان", k.title || "")}${typeSelect("k_type", state.types.knowledge, k.type)}${areaSelect("k_area", k.area)}${field("k_rating", "التقييم من 1 إلى 5", k.rating || 0, "number")}<label>صورة / غلاف من الجهاز</label><input type="file" id="k_cover" accept="image/*">${typeSelect("k_mediaType", ["بدون", "YouTube", "Spotify", "SoundCloud", "Article / Web", "PDF / Link", "MP4 محلي", "MP3 محلي", "PDF محلي"], !k.mediaType || k.mediaType === "بدون" ? detectMediaType(k.mediaUrl || k.link || "") : k.mediaType)}${field("k_mediaUrl", "رابط الفيديو / البودكاست / المقال", k.mediaUrl || k.link || "", "url")}<label>أو ارفع ملف للتشغيل داخل المشروع</label><input type="file" id="k_mediaFile" accept="video/*,audio/*,application/pdf"><div class="media-hint">يدعم تشغيل YouTube/Spotify/SoundCloud داخلياً عند السماح، ويدعم ملفات MP4/MP3/PDF من الجهاز. الملفات الكبيرة قد تحتاج مساحة تخزين أكبر من المتصفح.</div><label>ملخص</label><textarea id="k_summary">${esc(k.summary || "")}</textarea><label>أهم الأفكار</label><textarea id="k_ideas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="k_app">${esc(k.application || "")}</textarea><label>النتيجة</label><textarea id="k_result">${esc(k.result || "")}</textarea>${field("k_current", "وصلت إلى", k.currentUnit || k.currentPage || k.currentMinute || 0, "number")}${field("k_total", "الإجمالي", k.totalUnits || k.totalPages || k.totalMinutes || 0, "number")}${field("k_review", "مراجعة قادمة", k.reviewDate || "", "date")}<button class="btn" data-action="saveKnowledge" data-id="${k.id || ""}">حفظ</button>`,
          );
        }
        function formAction(a = {}) {
          openModal(
            a.id ? "تعديل إجراء" : "إضافة إجراء",
            `${field("a_title", "الإجراء", a.title || "")}${areaSelect("a_area", a.area)}<label>السبب / المصدر</label><textarea id="a_reason">${esc(a.reason || "")}</textarea><button class="btn" data-action="saveAction" data-id="${a.id || ""}">حفظ</button>`,
          );
        }
        function formProject(p = {}) {
          openModal(
            p.id ? "تعديل مشروع" : "إضافة مشروع",
            `${field("p_title", "اسم المشروع", p.title || "")}${typeSelect("p_type", state.types.projects, p.type)}${areaSelect("p_area", p.area)}${field("p_kpi", "KPI", p.kpi || "")}<label>وصف</label><textarea id="p_summary">${esc(p.summary || "")}</textarea><button class="btn" data-action="saveProject" data-id="${p.id || ""}">حفظ</button>`,
          );
        }
        const v77GoalPeriods = ["يومي", "أسبوعي", "ربع سنوي", "سنوي"];
        let v77GoalFilter = "الكل";
        function v77TodayISO() {
          return new Date().toISOString().slice(0, 10);
        }
        function v77AddDays(days) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return d.toISOString().slice(0, 10);
        }
        function v77GoalStatus(goal) {
          const progress = Number(goal.progress || 0);
          if (progress >= 100) return "مكتمل";
          const end = goal.endDate || goal.deadline || "";
          if (end && end < v77TodayISO()) return "متأخر";
          return goal.status || "شغال";
        }
        function v77GoalDefaultEnd(period) {
          if (period === "يومي") return v77TodayISO();
          if (period === "أسبوعي") return v77AddDays(6);
          if (period === "ربع سنوي") return v77AddDays(89);
          if (period === "سنوي") return v77AddDays(364);
          return "";
        }
        function v77GoalIcon(period) {
          if (period === "يومي") return "☀️";
          if (period === "أسبوعي") return "🗓️";
          if (period === "ربع سنوي") return "📊";
          if (period === "سنوي") return "🏁";
          return "🎯";
        }
        function v77DaysLeft(end) {
          if (!end) return "بدون نهاية";
          const one = 24 * 60 * 60 * 1000;
          const today = new Date(v77TodayISO());
          const endDate = new Date(end);
          const diff = Math.round((endDate - today) / one);
          if (diff === 0) return "ينتهي اليوم";
          if (diff > 0) return `متبقي ${diff} يوم`;
          return `متأخر ${Math.abs(diff)} يوم`;
        }
        function v77GoalCard(g) {
          const period = g.period || g.frequency || g.type || "سنوي";
          const start = g.startDate || "";
          const end = g.endDate || g.deadline || "";
          const progress = Math.max(0, Math.min(100, Number(g.progress || 0)));
          const status = v77GoalStatus(g);
          const statusClass = status === "مكتمل" ? "done" : status === "متأخر" ? "late" : "";
          return `<div class="v77-goal-card">
            <div class="v77-goal-head">
              <div class="v77-goal-title-wrap">
                <div class="v77-goal-icon">${v77GoalIcon(period)}</div>
                <div>
                  <h4>${esc(g.title || "هدف بدون عنوان")}</h4>
                  <div class="knowledge-meta" style="margin-top:6px">
                    <span class="pill">${esc(period)}</span>
                    <span class="pill">${esc(g.area || "عام")}</span>
                    <span class="v77-goal-status ${statusClass}">${esc(status)}</span>
                  </div>
                </div>
              </div>
              <button class="btn secondary mini" data-action="editGoal" data-id="${esc(g.id)}">تعديل</button>
            </div>
            <div class="v77-goal-dates">
              <span class="pill">بداية: ${esc(start || "غير محدد")}</span>
              <span class="pill">نهاية: ${esc(end || "غير محدد")}</span>
              <span class="pill">${esc(v77DaysLeft(end))}</span>
            </div>
            <div>
              <div class="v77-goal-progress-head">
                <strong>نسبة التقدم</strong>
                <span class="pill">${progress}%</span>
              </div>
              <div class="progress"><div class="bar" style="width:${progress}%"></div></div>
            </div>
            <div class="v77-goal-foot">
              <p class="v77-goal-note">${g.why ? esc(g.why) : 'أضف ملاحظة قصيرة توضّح لماذا هذا الهدف مهم لك.'}</p>
            </div>
          </div>`;
        }
        function v77GoalsView() {
          const goals = active(state.goals || []);
          const counts = {
            "يومي": goals.filter(g => (g.period || g.frequency || g.type) === "يومي").length,
            "أسبوعي": goals.filter(g => (g.period || g.frequency || g.type) === "أسبوعي").length,
            "ربع سنوي": goals.filter(g => (g.period || g.frequency || g.type) === "ربع سنوي").length,
            "سنوي": goals.filter(g => (g.period || g.frequency || g.type || "سنوي") === "سنوي").length,
          };
          const completed = goals.filter(g => v77GoalStatus(g) === "مكتمل").length;
          const late = goals.filter(g => v77GoalStatus(g) === "متأخر").length;
          const inProgress = goals.filter(g => {
            const s = v77GoalStatus(g);
            return s !== "مكتمل" && s !== "متأخر";
          }).length;
          const filtered = v77GoalFilter === "الكل"
            ? goals
            : goals.filter(g => (g.period || g.frequency || g.type || "سنوي") === v77GoalFilter);
          const chips = ["الكل", ...v77GoalPeriods].map(p =>
            `<button class="v77-goal-chip ${v77GoalFilter === p ? "active" : ""}" data-action="v77SetGoalFilter" data-filter="${esc(p)}">${esc(p)}</button>`
          ).join("");
          const totalLabel = v77GoalFilter === "الكل" ? 'كل الأهداف' : `أهداف ${v77GoalFilter}`;
          return `<div class="grid v77-goals-page">
            <div class="card col-12 v77-goals-hero">
              <div class="v77-hero-head">
                <div class="v77-hero-title">
                  <p class="eyebrow">Goals Operating System</p>
                  <h2>لوحة الأهداف</h2>
                  <p>نظّم أهدافك اليومية والأسبوعية والربع سنوية والسنوية بشكل واضح، مع بداية ونهاية وتقدم وحالة تساعدك تتابع نفسك بسرعة.</p>
                  <div class="v77-hero-badges">
                    <span class="pill">🎯 ${goals.length} هدف إجمالي</span>
                    <span class="pill">✅ ${completed} مكتمل</span>
                    <span class="pill">⏳ ${inProgress} قيد التنفيذ</span>
                    <span class="pill">⚠️ ${late} متأخر</span>
                  </div>
                </div>
                <button class="btn" data-action="addGoal">إضافة هدف</button>
              </div>
              <div class="v77-goals-filter">${chips}</div>
            </div>
            <div class="card col-12">
              <div class="v77-goals-stats">
                <div class="v77-goal-stat"><div class="v77-goal-stat-top"><small>أهداف يومية</small><span class="v77-goal-stat-icon">☀️</span></div><b>${counts["يومي"]}</b></div>
                <div class="v77-goal-stat"><div class="v77-goal-stat-top"><small>أهداف أسبوعية</small><span class="v77-goal-stat-icon">🗓️</span></div><b>${counts["أسبوعي"]}</b></div>
                <div class="v77-goal-stat"><div class="v77-goal-stat-top"><small>أهداف ربع سنوية</small><span class="v77-goal-stat-icon">📊</span></div><b>${counts["ربع سنوي"]}</b></div>
                <div class="v77-goal-stat"><div class="v77-goal-stat-top"><small>أهداف سنوية</small><span class="v77-goal-stat-icon">🏁</span></div><b>${counts["سنوي"]}</b></div>
              </div>
            </div>
            <div class="col-12 v77-goals-layout">
              <div class="card v77-goal-list-card">
                <div class="v77-goal-list-head">
                  <div>
                    <h3>${totalLabel}</h3>
                    <p>عرض منظم لكل الأهداف داخل التصنيف الحالي.</p>
                  </div>
                  <span class="pill">${filtered.length} عنصر</span>
                </div>
                <div class="list">${filtered.map(v77GoalCard).join("") || '<div class="empty">لا توجد أهداف في هذا التصنيف بعد. ابدأ بإضافة أول هدف.</div>'}</div>
              </div>
              <div class="card v77-side-card">
                <div>
                  <h3>ملخص سريع</h3>
                  <p>صورة سريعة تساعدك تعرف أين تركز الآن.</p>
                </div>
                <div class="v77-overview-list">
                  <div class="v77-overview-item"><span>إجمالي الأهداف</span><b>${goals.length}</b></div>
                  <div class="v77-overview-item"><span>مكتمل</span><b>${completed}</b></div>
                  <div class="v77-overview-item"><span>قيد التنفيذ</span><b>${inProgress}</b></div>
                  <div class="v77-overview-item"><span>متأخر</span><b>${late}</b></div>
                </div>
                <div class="v77-side-hint">أفضل استخدام هنا: اجعل عندك عدد صغير من الأهداف اليومية، وهدف أو اثنين أسبوعيًا، ثم اربطهم بهدف ربع سنوي أو سنوي حتى تبقى الرؤية واضحة.</div>
              </div>
            </div>
          </div>`;
        }
        function formGoal(g = {}) {
          const period = g.period || g.frequency || g.type || "سنوي";
          const startDate = g.startDate || v77TodayISO();
          const endDate = g.endDate || g.deadline || v77GoalDefaultEnd(period);
          openModal(
            g.id ? "تعديل هدف" : "إضافة هدف",
            `${field("g_title", "الهدف", g.title || "")}
            <label>نوع الهدف</label><select id="g_period">${v77GoalPeriods.map(p => `<option ${p === period ? "selected" : ""}>${p}</option>`).join("")}</select>
            ${areaSelect("g_area", g.area)}
            <div class="v77-goal-form-grid">
              <div>${field("g_start", "تاريخ البداية", startDate, "date")}</div>
              <div>${field("g_end", "تاريخ النهاية", endDate, "date")}</div>
            </div>
            <div class="v77-goal-form-grid">
              <div>${field("g_progress", "التقدم %", g.progress || 0, "number")}</div>
              <div><label>الحالة</label><select id="g_status">${["مخطط", "شغال", "مكتمل", "متأخر"].map(s => `<option ${s === (g.status || "شغال") ? "selected" : ""}>${s}</option>`).join("")}</select></div>
            </div>
            <label>لماذا؟ / ملاحظات</label><textarea id="g_why">${esc(g.why || "")}</textarea>
            <button class="btn" data-action="saveGoal" data-id="${g.id || ""}">حفظ</button>`,
          );
        }
        function formDecision(d = {}) {
          openModal(
            d.id ? "تعديل قرار" : "إضافة قرار",
            `${field("d_title", "القرار", d.title || "")}${areaSelect("d_area", d.area)}${field("d_date", "التاريخ", d.date || new Date().toISOString().slice(0, 10), "date")}<label>ما المتوقع؟</label><textarea id="d_expected">${esc(d.expected || "")}</textarea><label>ما الذي حدث فعلاً؟</label><textarea id="d_actual">${esc(d.actual || "")}</textarea><button class="btn" data-action="saveDecision" data-id="${d.id || ""}">حفظ</button>`,
          );
        }
        function formContact(c = {}) {
          openModal(
            c.id ? "تعديل شخص" : "إضافة شخص",
            `${field("c_name", "الاسم", c.name || "")}${field("c_role", "العلاقة / الدور", c.role || "")}${field("c_last", "آخر تواصل", c.last || "")}<label>ملاحظات</label><textarea id="c_note">${esc(c.note || "")}</textarea><button class="btn" data-action="saveContact" data-id="${c.id || ""}">حفظ</button>`,
          );
        }
        function updateTimer() {
          const m = String(Math.floor(timerLeft / 60)).padStart(2, "0"),
            s = String(timerLeft % 60).padStart(2, "0");
          $("timer").textContent = m + ":" + s;
        }
        document.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-action]");
          if (!btn) return;
          if (btn.tagName === "INPUT" && btn.type === "checkbox") return;
          const name = btn.dataset.action;
          const fn = Actions[name];
          if (!fn) {
            toast("Action غير موجود: " + name);
            return;
          }
          fn(btn.dataset.id || "", btn);
        });
        document.addEventListener("change", (e) => {
          const inp = e.target;
          if (
            inp.tagName === "INPUT" &&
            inp.type === "checkbox" &&
            inp.dataset.action
          ) {
            const fn = Actions[inp.dataset.action];
            if (fn) fn(inp.dataset.id || "", inp);
          }
        });
        $("globalSearch").addEventListener("input", (e) => {
          const q = e.target.value.trim().toLowerCase(),
            box = $("searchResults");
          if (!q) {
            box.style.display = "none";
            return;
          }
          const pools = [
            ["معرفة", state.knowledge, "knowledge"],
            ["مشروع", state.projects, "projects"],
            ["هدف", state.goals, "goals"],
            ["قرار", state.decisions, "decisions"],
            ["Inbox", state.inbox, "vault"],
          ];
          const res = [];
          pools.forEach(([label, arr, r]) =>
            arr.forEach((x) => {
              const text = JSON.stringify(x).toLowerCase();
              if (text.includes(q))
                res.push({
                  label,
                  title: x.title || x.name || x.text,
                  route: r,
                });
            }),
          );
          box.innerHTML =
            res
              .slice(0, 20)
              .map(
                (r) =>
                  `<div class="item" data-route="${r.route}"><b>${esc(r.title)}</b><p>${r.label}</p></div>`,
              )
              .join("") || '<p class="muted">لا توجد نتائج</p>';
          box.style.display = "block";
          box.querySelectorAll("[data-route]").forEach(
            (x) =>
              (x.onclick = () => {
                route = x.dataset.route;
                box.style.display = "none";
                $("globalSearch").value = "";
                render();
              }),
          );
        });
        document.addEventListener("change", (e) => {
          if (e.target && e.target.id === "importFile") {
            const f = e.target.files[0];
            if (!f) return;
            const r = new FileReader();
            r.onload = () => {
              try {
                state = merge(clone(DEFAULT), JSON.parse(r.result));
                save();
                render();
                toast("تم الاستيراد");
              } catch (err) {
                toast("ملف غير صالح");
              }
            };
            r.readAsText(f);
          }
        });

        // ===== V46 Second Brain & Execution Engine — single-file upgrade =====
        function v46Today() {
          return new Date().toISOString().slice(0, 10);
        }
        function v46AddDays(days) {
          const d = new Date();
          d.setDate(d.getDate() + days);
          return d.toISOString().slice(0, 10);
        }
        function v46DoneKnowledge() {
          return active(state.knowledge).filter(
            (k) =>
              k.status === "done" ||
              Number(k.progress || 0) >= 100 ||
              k.finished,
          ).length;
        }
        function v46NextKnowledge(type) {
          const items = active(state.knowledge).filter(
            (k) => !type || String(k.type || "").includes(type),
          );
          return (
            items.sort(
              (a, b) =>
                (knowledgeProgress(b) || 0) - (knowledgeProgress(a) || 0),
            )[0] || items[0]
          );
        }
        function v46ContinueBlock(k, icon, label) {
          if (!k)
            return `<div class="v46-continue-card"><div class="icon">${icon}</div><div><h4>${label}</h4><p class="muted">أضف محتوى في المعرفة وسيظهر هنا تلقائياً.</p></div><button class="btn secondary mini" data-route="knowledge">فتح</button></div>`;
          const pct = knowledgeProgress(k);
          const total = Number(
              k.totalUnits || k.totalPages || k.totalMinutes || 0,
            ),
            done = Number(
              k.currentUnit || k.currentPage || k.currentMinute || 0,
            );
          const unit = total > 0 ? `${done} / ${total}` : `${pct}%`;
          return `<div class="v46-continue-card"><div class="icon">${icon}</div><div><h4>${esc(k.title || label)}</h4><p class="muted">${esc(k.type || label)} — ${unit}</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div></div><button class="btn mini" data-action="openKnowledgePlayer" data-id="${k.id}">استكمال</button></div>`;
        }
        viewHome = function () {
          setTitle(
            `صباح الخير يا ${state.profile.name || "مجاهد"}`,
            "V46 — Second Brain & Execution Engine",
          );
          const goal = active(state.goals)[0],
            task =
              active(state.tasks).find((t) => t.status !== "done") ||
              active(state.actions).find((a) => a.status !== "done");
          const book = v46NextKnowledge("كتاب"),
            podcast = v46NextKnowledge("بودكاست") || v46NextKnowledge("فيديو");
          const doneActions = active(state.actions).filter(
            (a) => a.status === "done",
          ).length;
          const todayReviews = (state.reviews || []).filter(
            (r) =>
              String(r.date || "") <= v46Today() &&
              (r.type || "").includes("Knowledge"),
          );
          return `<div class="os-command"><div class="premium-hero"><span class="v46-badge">V46 Second Brain</span><h2 class="command-question">ما أهم شيء يجب أن أفعله الآن؟</h2><p>هذه النسخة لا تعرض كل شيء. تعرض الشيء الذي يحركك: هدف، مهمة، تركيز، ومعرفة تتحول إلى تنفيذ.</p><div class="premium-actions"><button class="btn v46-focus-btn" data-action="openFocus">▶ ابدأ التركيز الآن</button><button class="btn rescue v46-focus-btn" data-action="emergencyPlan">🚨 طوارئ التشتت</button></div></div><div class="premium-strip"><div class="premium-metric"><span>🎯 الهدف الحالي</span><strong>${esc(goal?.title || "أضف هدفك الأساسي")}</strong></div><div class="premium-metric"><span>⚡ إجراءات منتهية</span><strong>${doneActions}</strong></div><div class="premium-metric"><span>📚 معرفة مكتملة</span><strong>${v46DoneKnowledge()}</strong></div><div class="premium-metric"><span>🔁 مراجعات اليوم</span><strong>${todayReviews.length}</strong></div></div><div class="v46-command-grid"><div class="card v46-main-now"><span class="operating-badge">● المهمة الحالية</span><h2 class="v46-current-task">${esc(task?.title || "لا توجد مهمة حالياً")}</h2><p class="muted">${esc(task?.reason || task?.project || "أضف إجراء واحد فقط، ثم ابدأ جلسة تركيز قصيرة.")}</p><div class="row"><button class="btn" data-action="openFocus">تشغيل Focus</button><button class="btn secondary" data-action="addAction">+ إجراء</button><button class="btn secondary" data-action="dailyReflection">مراجعة اليوم</button></div></div><div class="card v46-smart-card"><h3>استكمال المعرفة</h3><div class="v46-side-stack">${v46ContinueBlock(book, "📚", "أكمل كتاب")}${v46ContinueBlock(podcast, "🎧", "أكمل بودكاست")}</div></div></div><div class="grid"><div class="card col-12"><h3>Knowledge → Action</h3><p class="muted">بعد كل كتاب أو بودكاست: اكتب ماذا فهمت، ماذا ستنفذ، وما النتيجة. المشروع هنا ليغيّرك، وليس ليخزن روابط فقط.</p><div class="row"><button class="btn" data-route="knowledge">افتح المعرفة</button><button class="btn secondary" data-route="wins">لوحة الفوز</button></div></div></div></div>`;
        };
        cardKnowledge = function (x) {
          const hasMedia = !!(x.mediaData || x.mediaUrl || x.link);
          const local = x.mediaData
            ? "محلي"
            : x.mediaUrl || x.link
              ? "رابط"
              : "";
          const pct = knowledgeProgress(x);
          const done = Number(
              x.currentUnit || x.currentPage || x.currentMinute || 0,
            ),
            total = Number(x.totalUnits || x.totalPages || x.totalMinutes || 0);
          const progressText = total > 0 ? `${done} / ${total}` : `${pct}%`;
          return `<div class="item knowledge-card"><div class="knowledge-card-inner"><img class="cover" src="${x.cover || ""}" onerror="this.style.display='none'"><div class="knowledge-main"><div class="knowledge-title-row"><h4>${esc(x.title)}</h4><span class="pill">${esc(x.type)}</span></div><p class="knowledge-summary">${esc(x.summary || "")}</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div><p class="muted" style="font-size:12px;margin-top:6px!important">التقدم: ${esc(progressText)}</p><div class="knowledge-primary">${hasMedia ? `<button class="btn play-primary" data-action="openKnowledgePlayer" data-id="${x.id}">▶ استكمال داخل المشروع</button>` : `<button class="btn secondary play-primary" data-action="editKnowledge" data-id="${x.id}">أضف رابط / ملف</button>`}<div class="knowledge-meta"><span class="pill">★ ${x.rating || 0}</span><span class="pill">${esc(x.area || "بدون مجال")}</span>${local ? `<span class="pill">${esc(local)}</span>` : ""}${x.status === "done" || pct >= 100 ? `<span class="pill v46-review-pill">مكتمل</span>` : ""}</div></div><div class="knowledge-proof"><div class="proof-box"><b>Action</b><span>${esc(x.actionTaken || x.application || "لم تحدد إجراء بعد")}</span></div><div class="proof-box"><b>Result</b><span>${esc(x.resultAchieved || x.result || "لم تسجل نتيجة بعد")}</span></div><div class="proof-box"><b>Lesson</b><span>${esc(x.lessonLearned || "اكتب الدرس المستفاد")}</span></div></div><div class="knowledge-more"><button class="btn secondary mini" data-action="editKnowledge" data-id="${x.id}">تعديل</button><button class="btn secondary mini" data-action="makeActionFromKnowledge" data-id="${x.id}">حوّل لإجراء</button><button class="btn secondary mini" data-action="completeKnowledge" data-id="${x.id}">أنهيت المحتوى</button><button class="btn danger mini" data-action="archiveItem" data-collection="knowledge" data-id="${x.id}">أرشفة</button></div></div></div></div>`;
        };
        viewKnowledge = function () {
          setTitle(
            "المعرفة الذكية",
            "Smart Knowledge: تقدم، ملخص، إجراء، نتيجة، ودرس.",
          );
          const due = (state.reviews || []).filter(
            (r) =>
              String(r.date || "") <= v46Today() &&
              (r.type || "").includes("Knowledge"),
          );
          return `<div class="space"><div class="tabs">${state.types.knowledge.map((t) => `<span class="pill">${esc(t)}</span>`).join("")} ${due.length ? `<span class="pill v46-review-pill">${due.length} مراجعة مستحقة</span>` : ""}</div><button class="btn" data-action="addKnowledge">إضافة معرفة</button></div>${
            due.length
              ? `<div class="card v46-smart-card"><h3>مراجعات معرفة مستحقة اليوم</h3><div class="list">${due
                  .slice(0, 4)
                  .map(
                    (r) =>
                      `<div class="item"><b>${esc(r.title)}</b><p>${esc(r.done || "راجع ملخصك وأهم الإجراءات.")}</p><span class="pill">${esc(r.date)}</span></div>`,
                  )
                  .join("")}</div></div>`
              : ""
          }<div class="grid"><div class="card col-12"><div class="list">${active(state.knowledge).map(cardKnowledge).join("") || '<div class="empty">ابدأ بإضافة كتاب أو بودكاست.</div>'}</div></div></div>`;
        };
        viewWins = function () {
          setTitle(
            "لوحة الفوز",
            "أنت لا تحارب التشتت فقط، أنت تبني دليل إنجاز.",
          );
          const doneActions = active(state.actions).filter(
            (a) => a.status === "done",
          ).length;
          const focus = state.focusSessions.length;
          const know = v46DoneKnowledge();
          const rescue = (state.emergencySessions || []).filter(
            (x) => x.result === "back" || x.result === "started",
          ).length;
          const today = (state.timeline || []).slice(0, 6);
          return `<div class="card command-card"><p class="eyebrow">Wins Dashboard</p><h2>كل إنجاز صغير يقلل سلطة التشتت عليك</h2><p class="muted">سجل التنفيذ، جلسات التركيز، المعرفة المكتملة، والإنقاذ من التشتت.</p></div><div class="wins-grid"><div class="win-card"><strong>${doneActions}</strong><span>إجراءات منفذة</span></div><div class="win-card"><strong>${focus}</strong><span>جلسات تركيز</span></div><div class="win-card"><strong>${know}</strong><span>معرفة مكتملة</span></div><div class="win-card"><strong>${rescue}</strong><span>محاولات إنقاذ</span></div></div><div class="grid"><div class="card col-7"><h3>آخر الانتصارات</h3><div class="list">${today.map((x) => `<div class="item"><b>${esc(x.title)}</b><p>${esc(x.note || "")}</p><span class="pill">${esc(x.date || "")}</span></div>`).join("") || '<div class="empty">ابدأ بفوز صغير اليوم.</div>'}</div></div><div class="card col-5"><h3>مراجعة سريعة</h3><p class="muted">اكتب 3 إجابات فقط وسيُحفظ تقرير اليوم.</p><button class="btn" data-action="dailyReflection">افتح مراجعة اليوم</button></div></div>`;
        };
        formKnowledge = function (k = {}) {
          openModal(
            k.id ? "تعديل معرفة" : "إضافة معرفة",
            `${field("k_title", "العنوان", k.title || "")}${typeSelect("k_type", state.types.knowledge, k.type)}${areaSelect("k_area", k.area)}${field("k_rating", "التقييم من 1 إلى 5", k.rating || 0, "number")}<label>صورة / غلاف من الجهاز</label><input type="file" id="k_cover" accept="image/*">${typeSelect("k_mediaType", ["بدون", "YouTube", "Spotify", "SoundCloud", "Article / Web", "PDF / Link", "MP4 محلي", "MP3 محلي", "PDF محلي"], !k.mediaType || k.mediaType === "بدون" ? detectMediaType(k.mediaUrl || k.link || "") : k.mediaType)}${field("k_mediaUrl", "رابط الفيديو / البودكاست / المقال", k.mediaUrl || k.link || "", "url")}<label>أو ارفع ملف للتشغيل داخل المشروع</label><input type="file" id="k_mediaFile" accept="video/*,audio/*,application/pdf"><div class="media-hint">V46: سجّل تقدمك ثم اربط المعرفة بالفعل والنتيجة.</div><label>ملخصك الشخصي</label><textarea id="k_summary">${esc(k.summary || "")}</textarea><label>أهم الأفكار</label><textarea id="k_ideas">${esc(k.ideas || "")}</textarea><div class="reflection-grid"><div><label>ماذا ستنفذ؟</label><textarea id="k_actionTaken">${esc(k.actionTaken || k.application || "")}</textarea></div><div><label>ما النتيجة؟</label><textarea id="k_resultAchieved">${esc(k.resultAchieved || k.result || "")}</textarea></div><div><label>أهم درس؟</label><textarea id="k_lessonLearned">${esc(k.lessonLearned || "")}</textarea></div></div>${field("k_current", "وصلت إلى", k.currentUnit || k.currentPage || k.currentMinute || 0, "number")}${field("k_total", "الإجمالي", k.totalUnits || k.totalPages || k.totalMinutes || 0, "number")}${field("k_review", "مراجعة قادمة", k.reviewDate || "", "date")}<button class="btn" data-action="saveKnowledge" data-id="${k.id || ""}">حفظ</button>`,
          );
        };
        Actions.saveKnowledge = function (id) {
          const existing = state.knowledge.find((x) => x.id === id);
          const cover = $("k_cover")?.files?.[0],
            media = $("k_mediaFile")?.files?.[0];
          const finish = (extra = {}) => {
            const obj = {
              id: id || uid(),
              title: get("k_title"),
              type: get("k_type"),
              area: get("k_area"),
              rating: Number(get("k_rating") || 0),
              mediaType: get("k_mediaType"),
              mediaUrl: get("k_mediaUrl"),
              link: get("k_mediaUrl"),
              summary: get("k_summary"),
              ideas: get("k_ideas"),
              application: get("k_actionTaken"),
              actionTaken: get("k_actionTaken"),
              result: get("k_resultAchieved"),
              resultAchieved: get("k_resultAchieved"),
              lessonLearned: get("k_lessonLearned"),
              currentUnit: Number(get("k_current") || 0),
              totalUnits: Number(get("k_total") || 0),
              progress: 0,
              reviewDate: get("k_review"),
              status: existing?.status || "active",
              ...extra,
            };
            obj.progress = knowledgeProgress(obj);
            if (existing) Object.assign(existing, obj);
            else state.knowledge.unshift(obj);
            save();
            closeModal();
            render();
            toast("تم حفظ المعرفة V46");
          };
          if (cover) {
            readFile(cover, (data) => {
              if (media) {
                readFile(media, (mdata) =>
                  finish({
                    cover: data,
                    mediaData: mdata,
                    mediaMime: media.type,
                    mediaName: media.name,
                  }),
                );
              } else
                finish({
                  cover: data,
                  mediaData: existing?.mediaData,
                  mediaMime: existing?.mediaMime,
                  mediaName: existing?.mediaName,
                });
            });
          } else if (media) {
            readFile(media, (mdata) =>
              finish({
                cover: existing?.cover || "",
                mediaData: mdata,
                mediaMime: media.type,
                mediaName: media.name,
              }),
            );
          } else
            finish({
              cover: existing?.cover || "",
              mediaData: existing?.mediaData,
              mediaMime: existing?.mediaMime,
              mediaName: existing?.mediaName,
            });
        };
        Actions.completeKnowledge = function (id) {
          const k = state.knowledge.find((x) => x.id === id);
          if (!k) return;
          k.status = "done";
          k.progress = 100;
          k.currentUnit = k.totalUnits || k.currentUnit || 100;
          const title = "مراجعة معرفة: " + (k.title || "محتوى");
          state.reviews = state.reviews || [];
          [1, 7, 30, 90].forEach((days) =>
            state.reviews.unshift({
              id: uid(),
              type: "Knowledge Review",
              title: title + " بعد " + days + " يوم",
              date: v46AddDays(days),
              done: "راجع الملخص، الإجراء، النتيجة، والدرس.",
              learned: k.lessonLearned || k.summary || "",
              sourceId: k.id,
            }),
          );
          state.timeline.unshift({
            id: uid(),
            title: "أنهيت: " + (k.title || "معرفة"),
            date: v46Today(),
            area: k.area || "التعلم",
            note: "تم إنشاء مراجعات بعد يوم، أسبوع، شهر، و3 شهور.",
          });
          save();
          render();
          toast("تم إنهاء المحتوى وإنشاء مراجعات ذكية 🏆");
        };
        Actions.dailyReflection = function () {
          openModal(
            "AI Reflection — مراجعة اليوم",
            `<div class="card v46-smart-card"><h2>ماذا حدث اليوم؟</h2><p class="muted">اكتب بسرعة. المشروع سيحفظها كتقرير يومي في المراجعات.</p><div class="reflection-grid"><div><label>ماذا تعلمت؟</label><textarea id="dr_learned"></textarea></div><div><label>ماذا أنجزت؟</label><textarea id="dr_done"></textarea></div><div><label>ماذا ستفعل غداً؟</label><textarea id="dr_tomorrow"></textarea></div></div><button class="btn" data-action="saveDailyReflection">حفظ تقرير اليوم</button></div>`,
          );
        };
        Actions.saveDailyReflection = function () {
          state.reviews.unshift({
            id: uid(),
            type: "Daily Reflection",
            title: "تقرير اليوم",
            date: v46Today(),
            done: get("dr_done"),
            learned: get("dr_learned"),
            tomorrow: get("dr_tomorrow"),
          });
          state.timeline.unshift({
            id: uid(),
            title: "مراجعة يومية",
            date: v46Today(),
            area: "التعلم",
            note: get("dr_tomorrow") || "تم حفظ مراجعة اليوم",
          });
          save();
          closeModal();
          render();
          toast("تم حفظ Reflection اليوم");
        };

        // ===== V47 Smart Knowledge Type Engine — books use PDF, podcasts use media, articles use reader =====
        function v47Type(k) {
          return String(k?.type || "").trim();
        }
        function v47IsBook(k) {
          return v47Type(k).includes("كتاب");
        }
        function v47IsPodcast(k) {
          return (
            v47Type(k).includes("بودكاست") || v47Type(k).includes("محاضرة")
          );
        }
        function v47IsVideo(k) {
          return v47Type(k).includes("فيديو") || v47Type(k).includes("دورة");
        }
        function v47IsArticle(k) {
          return v47Type(k).includes("مقال");
        }
        function v47TypeBadge(k) {
          if (v47IsBook(k))
            return '<span class="pill book-badge">📚 PDF Reader</span>';
          if (v47IsPodcast(k))
            return '<span class="pill podcast-badge">🎧 Player</span>';
          if (v47IsVideo(k))
            return '<span class="pill video-badge">🎥 Video</span>';
          if (v47IsArticle(k))
            return '<span class="pill article-badge">📄 Article</span>';
          return '<span class="pill">🧠 Knowledge</span>';
        }
        function v47UnitLabel(k) {
          if (v47IsBook(k)) return ["صفحة", "صفحات", "اقرأ الكتاب"];
          if (v47IsPodcast(k)) return ["دقيقة", "دقائق", "تشغيل البودكاست"];
          if (v47IsVideo(k)) return ["دقيقة", "دقائق", "تشغيل الفيديو"];
          if (v47IsArticle(k)) return ["فقرة", "فقرات", "قراءة المقال"];
          return ["وحدة", "وحدات", "استكمال"];
        }
        function v47HasPlayable(k) {
          if (v47IsBook(k))
            return !!(
              k.pdfData ||
              (k.mediaData && String(k.mediaMime || "").includes("pdf")) ||
              k.pdfUrl ||
              String(k.mediaUrl || k.link || "")
                .toLowerCase()
                .endsWith(".pdf")
            );
          return !!(
            k.mediaData ||
            k.mediaUrl ||
            k.link ||
            k.pdfData ||
            k.pdfUrl
          );
        }
        function v47SourceLabel(k) {
          if (v47IsBook(k))
            return k.pdfData || String(k.mediaMime || "").includes("pdf")
              ? "PDF محلي"
              : k.pdfUrl ||
                  String(k.mediaUrl || k.link || "")
                    .toLowerCase()
                    .endsWith(".pdf")
                ? "PDF رابط"
                : "بدون PDF";
          if (k.mediaData) return "ملف محلي";
          if (k.mediaUrl || k.link) return "رابط";
          return "بدون مصدر";
        }
        cardKnowledge = function (x) {
          const pct = knowledgeProgress(x);
          const done = Number(
              x.currentUnit || x.currentPage || x.currentMinute || 0,
            ),
            total = Number(x.totalUnits || x.totalPages || x.totalMinutes || 0);
          const labels = v47UnitLabel(x);
          const progressText =
            total > 0
              ? `${done} ${labels[0]} / ${total} ${labels[1]}`
              : `${pct}%`;
          const can = v47HasPlayable(x);
          const badge = v47TypeBadge(x);
          const source = v47SourceLabel(x);
          return `<div class="item knowledge-card"><div class="knowledge-card-inner"><img class="cover" src="${x.cover || ""}" onerror="this.style.display='none'"><div class="knowledge-main"><div class="knowledge-title-row"><h4>${esc(x.title)}</h4><span class="pill">${esc(x.type)}</span></div><div class="knowledge-type-line">${badge}<span class="pill">${esc(source)}</span>${x.author ? `<span class="pill">✍️ ${esc(x.author)}</span>` : ""}</div><p class="knowledge-summary">${esc(x.summary || "")}</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div><p class="muted" style="font-size:12px;margin-top:6px!important">التقدم: ${esc(progressText)}</p><div class="knowledge-primary">${can ? `<button class="btn play-primary primary-reader" data-action="openKnowledgePlayer" data-id="${x.id}">▶ ${labels[2]} داخل المشروع</button>` : `<button class="btn secondary play-primary" data-action="editKnowledge" data-id="${x.id}">${v47IsBook(x) ? "ارفع ملف PDF" : "أضف رابط / ملف"}</button>`}<div class="knowledge-meta"><span class="pill">★ ${x.rating || 0}</span><span class="pill">${esc(x.area || "بدون مجال")}</span>${x.status === "done" || pct >= 100 ? `<span class="pill v46-review-pill">مكتمل</span>` : ""}</div></div><div class="knowledge-proof"><div class="proof-box"><b>Action</b><span>${esc(x.actionTaken || x.application || "لم تحدد إجراء بعد")}</span></div><div class="proof-box"><b>Result</b><span>${esc(x.resultAchieved || x.result || "لم تسجل نتيجة بعد")}</span></div><div class="proof-box"><b>Lesson</b><span>${esc(x.lessonLearned || "اكتب الدرس المستفاد")}</span></div></div><div class="knowledge-more"><button class="btn secondary mini" data-action="editKnowledge" data-id="${x.id}">تعديل</button><button class="btn secondary mini" data-action="makeActionFromKnowledge" data-id="${x.id}">حوّل لإجراء</button><button class="btn secondary mini" data-action="completeKnowledge" data-id="${x.id}">أنهيت المحتوى</button><button class="btn danger mini" data-action="archiveItem" data-collection="knowledge" data-id="${x.id}">أرشفة</button></div></div></div></div>`;
        };
        viewKnowledge = function () {
          setTitle(
            "المعرفة الذكية V47",
            "كل نوع معرفة له مشغله المناسب: الكتاب PDF، البودكاست Player، المقال Reader.",
          );
          const due = (state.reviews || []).filter(
            (r) =>
              String(r.date || "") <= v46Today() &&
              (r.type || "").includes("Knowledge"),
          );
          const counts = {
            books: active(state.knowledge).filter(v47IsBook).length,
            pods: active(state.knowledge).filter(v47IsPodcast).length,
            vids: active(state.knowledge).filter(v47IsVideo).length,
            arts: active(state.knowledge).filter(v47IsArticle).length,
          };
          return `<div class="card type-smart-card"><h3>🧠 Smart Knowledge Types</h3><p class="muted">اختار النوع صح: لو كتاب ارفع PDF، لو بودكاست أو فيديو حط رابط أو ملف صوت/فيديو، لو مقال ضيف الرابط.</p><div class="type-smart-grid"><div class="type-chip"><b>📚 ${counts.books}</b><small>كتب / PDF</small></div><div class="type-chip"><b>🎧 ${counts.pods}</b><small>بودكاست</small></div><div class="type-chip"><b>🎥 ${counts.vids}</b><small>فيديو / دورة</small></div><div class="type-chip"><b>📄 ${counts.arts}</b><small>مقالات</small></div></div></div><div class="space"><div class="tabs">${state.types.knowledge.map((t) => `<span class="pill">${esc(t)}</span>`).join("")} ${due.length ? `<span class="pill v46-review-pill">${due.length} مراجعة مستحقة</span>` : ""}</div><button class="btn" data-action="addKnowledge">إضافة معرفة</button></div>${
            due.length
              ? `<div class="card v46-smart-card"><h3>مراجعات معرفة مستحقة اليوم</h3><div class="list">${due
                  .slice(0, 4)
                  .map(
                    (r) =>
                      `<div class="item"><b>${esc(r.title)}</b><p>${esc(r.done || "راجع ملخصك وأهم الإجراءات.")}</p><span class="pill">${esc(r.date)}</span></div>`,
                  )
                  .join("")}</div></div>`
              : ""
          }<div class="grid"><div class="card col-12"><div class="list">${active(state.knowledge).map(cardKnowledge).join("") || '<div class="empty">ابدأ بإضافة كتاب PDF أو بودكاست.</div>'}</div></div></div>`;
        };
        function v47FormHint(t) {
          const fake = { type: t };
          if (v47IsBook(fake))
            return {
              title: "📚 إعداد كتاب PDF",
              text: "ارفع ملف PDF من جهازك أو ضع رابط PDF مباشر. خانة التقدم تعني: وصلت لصفحة / إجمالي الصفحات.",
              accept: "application/pdf",
              mediaType: "PDF محلي",
              urlLabel: "رابط PDF مباشر اختياري",
              fileLabel: "ارفع ملف PDF للقراءة داخل المشروع",
            };
          if (v47IsPodcast(fake))
            return {
              title: "🎧 إعداد بودكاست / محاضرة",
              text: "ضع رابط YouTube/Spotify/SoundCloud أو ارفع MP3/MP4. خانة التقدم تعني: وصلت لدقيقة / إجمالي الدقائق.",
              accept: "audio/*,video/*",
              mediaType: "YouTube",
              urlLabel: "رابط البودكاست / المحاضرة",
              fileLabel: "أو ارفع ملف صوت / فيديو",
            };
          if (v47IsVideo(fake))
            return {
              title: "🎥 إعداد فيديو / دورة",
              text: "ضع رابط YouTube أو ارفع MP4. خانة التقدم تعني: وصلت لدقيقة / إجمالي الدقائق.",
              accept: "video/*",
              mediaType: "YouTube",
              urlLabel: "رابط الفيديو / الدرس",
              fileLabel: "أو ارفع ملف فيديو",
            };
          if (v47IsArticle(fake))
            return {
              title: "📄 إعداد مقال",
              text: "ضع رابط المقال أو اكتب ملخصك. خانة التقدم تعني: فقرة / إجمالي الفقرات.",
              accept: "application/pdf,text/*",
              mediaType: "Article / Web",
              urlLabel: "رابط المقال",
              fileLabel: "أو ارفع ملف PDF / نص",
            };
          return {
            title: "🧠 إعداد معرفة",
            text: "اختر النوع المناسب وسيغيّر المشروع طريقة العرض والتشغيل.",
            accept: "video/*,audio/*,application/pdf",
            mediaType: "بدون",
            urlLabel: "رابط المصدر",
            fileLabel: "أو ارفع ملف",
          };
        }
        formKnowledge = function (k = {}) {
          const selectedType = k.type || state.types.knowledge[0] || "كتاب";
          const hint = v47FormHint(selectedType);
          openModal(
            k.id ? "تعديل معرفة" : "إضافة معرفة",
            `${field("k_title", "العنوان", k.title || "")}${typeSelect("k_type", state.types.knowledge, selectedType)}${areaSelect("k_area", k.area)}${field("k_author", "الكاتب / المتحدث", k.author || "")}${field("k_rating", "التقييم من 1 إلى 5", k.rating || 0, "number")}<label>صورة / غلاف من الجهاز</label><input type="file" id="k_cover" accept="image/*"><div class="smart-form-panel"><h4>${hint.title}</h4><p>${hint.text}</p></div>${typeSelect("k_mediaType", ["بدون", "YouTube", "Spotify", "SoundCloud", "Article / Web", "PDF / Link", "MP4 محلي", "MP3 محلي", "PDF محلي"], k.mediaType || hint.mediaType)}${field("k_mediaUrl", hint.urlLabel, k.pdfUrl || k.mediaUrl || k.link || "", "url")}<label>${hint.fileLabel}</label><input type="file" id="k_mediaFile" accept="${hint.accept}"><div class="media-hint">V47: الكتاب يفتح كـ PDF Reader، والبودكاست/الفيديو كمشغل، والمقال كقارئ داخل المشروع.</div><label>ملخصك الشخصي</label><textarea id="k_summary">${esc(k.summary || "")}</textarea><label>أهم الأفكار / الاقتباسات</label><textarea id="k_ideas">${esc(k.ideas || "")}</textarea><div class="reflection-grid"><div><label>ماذا ستنفذ؟</label><textarea id="k_actionTaken">${esc(k.actionTaken || k.application || "")}</textarea></div><div><label>ما النتيجة؟</label><textarea id="k_resultAchieved">${esc(k.resultAchieved || k.result || "")}</textarea></div><div><label>أهم درس؟</label><textarea id="k_lessonLearned">${esc(k.lessonLearned || "")}</textarea></div></div>${field("k_current", v47UnitLabel({ type: selectedType })[0] + " وصلت إليها", k.currentUnit || k.currentPage || k.currentMinute || 0, "number")}${field("k_total", "الإجمالي", k.totalUnits || k.totalPages || k.totalMinutes || 0, "number")}${field("k_review", "مراجعة قادمة", k.reviewDate || "", "date")}<button class="btn" data-action="saveKnowledge" data-id="${k.id || ""}">حفظ</button>`,
          );
          setTimeout(() => {
            const sel = $("k_type");
            if (sel)
              sel.onchange = () => {
                toast(
                  "تم تغيير النوع. افتح التعديل مرة أخرى بعد الحفظ لتظهر حقول النوع الجديدة.",
                );
              };
          });
        };
        Actions.saveKnowledge = function (id) {
          const existing = state.knowledge.find((x) => x.id === id);
          const cover = $("k_cover")?.files?.[0],
            media = $("k_mediaFile")?.files?.[0];
          const finish = (extra = {}) => {
            const typ = get("k_type");
            const obj = {
              id: id || uid(),
              title: get("k_title"),
              type: typ,
              area: get("k_area"),
              author: get("k_author"),
              rating: Number(get("k_rating") || 0),
              mediaType: get("k_mediaType"),
              mediaUrl: get("k_mediaUrl"),
              link: get("k_mediaUrl"),
              pdfUrl: v47IsBook({ type: typ })
                ? get("k_mediaUrl")
                : existing?.pdfUrl || "",
              summary: get("k_summary"),
              ideas: get("k_ideas"),
              application: get("k_actionTaken"),
              actionTaken: get("k_actionTaken"),
              result: get("k_resultAchieved"),
              resultAchieved: get("k_resultAchieved"),
              lessonLearned: get("k_lessonLearned"),
              currentUnit: Number(get("k_current") || 0),
              totalUnits: Number(get("k_total") || 0),
              progress: 0,
              reviewDate: get("k_review"),
              status: existing?.status || "active",
              ...extra,
            };
            obj.progress = knowledgeProgress(obj);
            if (existing) Object.assign(existing, obj);
            else state.knowledge.unshift(obj);
            save();
            closeModal();
            render();
            toast(
              v47IsBook(obj)
                ? "تم حفظ الكتاب وPDF Reader جاهز"
                : "تم حفظ المعرفة V47",
            );
          };
          const withMedia = (extra = {}) => {
            if (media) {
              readFile(media, (mdata) => {
                const isPdf =
                  media.type.includes("pdf") ||
                  media.name.toLowerCase().endsWith(".pdf");
                finish({
                  ...extra,
                  mediaData: mdata,
                  mediaMime: media.type,
                  mediaName: media.name,
                  pdfData: isPdf ? mdata : existing?.pdfData || "",
                });
              });
            } else
              finish({
                ...extra,
                mediaData: existing?.mediaData,
                mediaMime: existing?.mediaMime,
                mediaName: existing?.mediaName,
                pdfData: existing?.pdfData,
              });
          };
          if (cover) {
            readFile(cover, (data) => withMedia({ cover: data }));
          } else withMedia({ cover: existing?.cover || "" });
        };
        function v47ReaderSource(k) {
          if (v47IsBook(k))
            return (
              k.pdfData ||
              (String(k.mediaMime || "").includes("pdf") ? k.mediaData : "") ||
              k.pdfUrl ||
              (String(k.mediaUrl || k.link || "")
                .toLowerCase()
                .endsWith(".pdf")
                ? k.mediaUrl || k.link
                : "")
            );
          if (v47IsArticle(k))
            return k.mediaUrl || k.link || k.pdfData || k.mediaData || "";
          return "";
        }
        openKnowledgePlayerModal = function (k) {
          if (v47IsBook(k) || v47IsArticle(k)) {
            const src = v47ReaderSource(k);
            const labels = v47UnitLabel(k);
            const pct = knowledgeProgress(k);
            $("modal").classList.add("player-mode");
            openModal(
              v47IsBook(k) ? "PDF Reader" : "Article Reader",
              `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${v47TypeBadge(k)} قراءة وملاحظات داخل المشروع</p></div><div class="row">${src ? `<button class="btn secondary mini" data-action="openExternal" data-url="${esc(src)}">فتح المصدر</button>` : ""}</div></div><div class="reader-shell"><div class="reader-frame">${src ? `<iframe src="${esc(src)}"></iframe>` : `<div class="empty"><div><h3>${v47IsBook(k) ? "لا يوجد PDF" : "لا يوجد رابط مقال"}</h3><p class="muted">افتح تعديل المعرفة وارفع ملف PDF أو ضع رابط مباشر.</p></div></div>`}</div><div class="reader-side"><div class="item"><b>التقدم</b><p class="muted">${Number(k.currentUnit || 0)} ${labels[0]} من ${Number(k.totalUnits || 0) || "؟"} ${labels[1]} — ${pct}%</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div></div><div class="reader-side-scroll"><label>وصلت إلى ${labels[0]}</label><input id="readerCurrent" type="number" value="${Number(k.currentUnit || 0)}"><label>إجمالي ${labels[1]}</label><input id="readerTotal" type="number" value="${Number(k.totalUnits || 0)}"><label>ملخصك</label><textarea id="playerNotes">${esc(k.playerNotes || k.summary || "")}</textarea><label>اقتباسات / أفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || k.actionTaken || "")}</textarea></div><div class="row"><button class="btn" data-action="saveReaderProgress" data-id="${k.id}">حفظ التقدم</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button><button class="btn secondary" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div></div>`,
            );
            return;
          }
          const url = cleanMediaUrl(k.mediaUrl || k.link || "");
          const type = resolvedMediaType(k, url);
          const embed = mediaEmbedUrl(url, type);
          $("modal").classList.add("player-mode");
          openModal(
            "Knowledge Player",
            `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${v47TypeBadge(k)} — تشغيل وملاحظات بدون مغادرة النظام</p></div><div class="row">${k.mediaData ? `<span class="player-local-badge">● ملف مرفوع</span>` : ""}${url ? `<button class="btn secondary mini" data-action="openExternal" data-url="${esc(url)}">فتح المصدر</button>` : ""}</div></div><div class="player-shell"><div>${playerMediaHtml(k, type, embed, url)}</div><div class="player-side"><div class="item"><b>ملاحظات أثناء التشغيل</b><p class="muted">اكتب الفكرة فوراً، ثم حوّلها لإجراء.</p></div><div class="player-note-area"><label>ملاحظاتي</label><textarea id="playerNotes">${esc(k.playerNotes || "")}</textarea><label>أهم الأفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || "")}</textarea></div><div class="row"><button class="btn" data-action="savePlayerNotes" data-id="${k.id}">حفظ</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button><button class="btn secondary" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div></div>`,
          );
        };
        Actions.saveReaderProgress = function (id) {
          const k = state.knowledge.find((x) => x.id === id);
          if (!k) return;
          k.currentUnit = Number(get("readerCurrent") || 0);
          k.totalUnits = Number(get("readerTotal") || 0);
          k.progress = knowledgeProgress(k);
          k.playerNotes = get("playerNotes");
          k.summary = get("playerNotes") || k.summary;
          k.ideas = get("playerIdeas");
          k.application = get("playerApp");
          k.actionTaken = get("playerApp");
          save();
          closeModal();
          render();
          toast("تم حفظ تقدم القراءة");
        };

        /* ===== V48 Smart Knowledge Forms + PDF Save Fix + Pomodoro + Siren ===== */
        state.settings.pomodoro = state.settings.pomodoro || {
          focus: 25,
          break: 5,
          sound: true,
        };
        let v48FocusMode = "focus";
        function v48Beep(kind = "start") {
          try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (!AudioCtx) return;
            const ctx = new AudioCtx();
            const now = ctx.currentTime;
            const seq =
              kind === "alarm"
                ? [740, 980, 740, 980]
                : kind === "end"
                  ? [880, 660, 520]
                  : [520, 740];
            seq.forEach((freq, i) => {
              const osc = ctx.createOscillator();
              const gain = ctx.createGain();
              osc.type = kind === "alarm" ? "sawtooth" : "sine";
              osc.frequency.value = freq;
              gain.gain.setValueAtTime(0.0001, now + i * 0.16);
              gain.gain.exponentialRampToValueAtTime(
                kind === "alarm" ? 0.18 : 0.1,
                now + i * 0.16 + 0.025,
              );
              gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + i * 0.16 + 0.14,
              );
              osc.connect(gain);
              gain.connect(ctx.destination);
              osc.start(now + i * 0.16);
              osc.stop(now + i * 0.16 + 0.16);
            });
            setTimeout(() => ctx.close && ctx.close(), 1400);
          } catch (e) {}
        }
        function v48AlarmFx() {
          const btn = document.querySelector(".emergency-floating");
          if (btn) {
            btn.classList.add("siren-blast", "siren-spin");
            setTimeout(
              () => btn.classList.remove("siren-blast", "siren-spin"),
              2600,
            );
          }
          if (navigator.vibrate)
            try {
              navigator.vibrate([180, 80, 180, 80, 260]);
            } catch (e) {}
          v48Beep("alarm");
        }
        function v48DbOpen(cb) {
          if (!("indexedDB" in window)) {
            cb(null);
            return;
          }
          const req = indexedDB.open("MogahedOSX_Files", 1);
          req.onupgradeneeded = () => {
            const db = req.result;
            if (!db.objectStoreNames.contains("files"))
              db.createObjectStore("files");
          };
          req.onsuccess = () => cb(req.result);
          req.onerror = () => cb(null);
        }
        function v48DbPut(key, data, cb) {
          v48DbOpen((db) => {
            if (!db) {
              cb(false);
              return;
            }
            const tx = db.transaction("files", "readwrite");
            tx.objectStore("files").put(data, key);
            tx.oncomplete = () => {
              db.close();
              cb(true);
            };
            tx.onerror = () => {
              db.close();
              cb(false);
            };
          });
        }
        function v48DbGet(key, cb) {
          v48DbOpen((db) => {
            if (!db) {
              cb("");
              return;
            }
            const tx = db.transaction("files", "readonly");
            const req = tx.objectStore("files").get(key);
            req.onsuccess = () => {
              db.close();
              cb(req.result || "");
            };
            req.onerror = () => {
              db.close();
              cb("");
            };
          });
        }
        function v48IsPdfFile(file) {
          return (
            !!file &&
            (String(file.mime || file.type || "").includes("pdf") ||
              String(file.name || "")
                .toLowerCase()
                .endsWith(".pdf"))
          );
        }
        function v48FormFieldsFor(type, k = {}) {
          const fake = { type: type };
          if (v47IsBook(fake))
            return `<div class="smart-type-fields"><h4>📚 بيانات الكتاب فقط</h4><p>هنا لا نعرض روابط فيديو. الكتاب = PDF + صفحات + قراءة + اقتباسات.</p>${field("k_author", "المؤلف", k.author || "")}<label>غلاف الكتاب</label><input type="file" id="k_cover" accept="image/*"><label>ملف PDF للكتاب</label><input type="file" id="k_mediaFile" accept="application/pdf"><div class="type-warning">لو ملف PDF كبير جدًا، سيتم حفظه في مساحة خاصة داخل المتصفح IndexedDB بدل localStorage.</div>${field("k_mediaUrl", "رابط PDF مباشر اختياري", k.pdfUrl || k.mediaUrl || k.link || "", "url")}<div class="form-two">${field("k_current", "وصلت لصفحة", k.currentUnit || k.currentPage || 0, "number")}${field("k_total", "إجمالي الصفحات", k.totalUnits || k.totalPages || 0, "number")}</div>${typeSelect("k_status", ["active", "reading", "done"], k.status || "active")}</div>`;
          if (v47IsPodcast(fake))
            return `<div class="smart-type-fields"><h4>🎧 بيانات البودكاست / المحاضرة</h4><p>البودكاست = رابط تشغيل أو ملف صوت + دقائق + ملاحظات أثناء الاستماع.</p>${field("k_author", "المتحدث / القناة", k.author || "")}<label>صورة البودكاست</label><input type="file" id="k_cover" accept="image/*">${typeSelect("k_mediaType", ["YouTube", "Spotify", "SoundCloud", "MP3 محلي", "MP4 محلي"], k.mediaType || "YouTube")}${field("k_mediaUrl", "رابط البودكاست / المحاضرة", k.mediaUrl || k.link || "", "url")}<label>أو ارفع ملف صوت / فيديو</label><input type="file" id="k_mediaFile" accept="audio/*,video/*"><div class="form-two">${field("k_current", "وصلت لدقيقة", k.currentUnit || k.currentMinute || 0, "number")}${field("k_total", "إجمالي الدقائق", k.totalUnits || k.totalMinutes || 0, "number")}</div></div>`;
          if (v47IsVideo(fake))
            return `<div class="smart-type-fields"><h4>🎥 بيانات الفيديو / الدورة</h4><p>الفيديو = YouTube أو MP4 + آخر دقيقة + أفكار قابلة للتنفيذ.</p>${field("k_author", "المدرب / القناة", k.author || "")}<label>صورة / Thumbnail</label><input type="file" id="k_cover" accept="image/*">${typeSelect("k_mediaType", ["YouTube", "MP4 محلي", "Article / Web"], k.mediaType || "YouTube")}${field("k_mediaUrl", "رابط الفيديو / الدرس", k.mediaUrl || k.link || "", "url")}<label>أو ارفع ملف فيديو</label><input type="file" id="k_mediaFile" accept="video/*"><div class="form-two">${field("k_current", "وصلت لدقيقة", k.currentUnit || k.currentMinute || 0, "number")}${field("k_total", "إجمالي الدقائق", k.totalUnits || k.totalMinutes || 0, "number")}</div></div>`;
          if (v47IsArticle(fake))
            return `<div class="smart-type-fields"><h4>📄 بيانات المقال</h4><p>المقال = رابط أو PDF/نص + وقت قراءة + نقاط رئيسية.</p>${field("k_author", "الكاتب / الموقع", k.author || "")}<label>صورة المقال</label><input type="file" id="k_cover" accept="image/*">${field("k_mediaUrl", "رابط المقال", k.mediaUrl || k.link || "", "url")}<label>أو ارفع ملف PDF / نص</label><input type="file" id="k_mediaFile" accept="application/pdf,text/*"><div class="form-two">${field("k_current", "وصلت لفقرة", k.currentUnit || 0, "number")}${field("k_total", "إجمالي الفقرات", k.totalUnits || 0, "number")}</div></div>`;
          return `<div class="smart-type-fields"><h4>🧠 بيانات معرفة عامة</h4><p>اختر النوع من الأعلى لتظهر الحقول المناسبة.</p>${field("k_author", "المصدر / الكاتب", k.author || "")}<label>صورة</label><input type="file" id="k_cover" accept="image/*">${field("k_mediaUrl", "رابط المصدر", k.mediaUrl || k.link || "", "url")}<label>ملف</label><input type="file" id="k_mediaFile" accept="audio/*,video/*,application/pdf,text/*"></div>`;
        }
        formKnowledge = function (k = {}) {
          const selectedType = k.type || state.types.knowledge[0] || "كتاب";
          openModal(
            k.id ? "تعديل معرفة" : "إضافة معرفة",
            `${field("k_title", "العنوان", k.title || "")}${typeSelect("k_type", state.types.knowledge, selectedType)}${areaSelect("k_area", k.area)}<div id="k_typeFields">${v48FormFieldsFor(selectedType, k)}</div>${field("k_rating", "التقييم من 1 إلى 5", k.rating || 0, "number")}<label>ملخصك الشخصي</label><textarea id="k_summary">${esc(k.summary || "")}</textarea><label>أهم الأفكار / الاقتباسات</label><textarea id="k_ideas">${esc(k.ideas || "")}</textarea><div class="reflection-grid"><div><label>ماذا ستنفذ؟</label><textarea id="k_actionTaken">${esc(k.actionTaken || k.application || "")}</textarea></div><div><label>ما النتيجة؟</label><textarea id="k_resultAchieved">${esc(k.resultAchieved || k.result || "")}</textarea></div><div><label>أهم درس؟</label><textarea id="k_lessonLearned">${esc(k.lessonLearned || "")}</textarea></div></div>${field("k_review", "مراجعة قادمة", k.reviewDate || "", "date")}<button class="btn" data-action="saveKnowledge" data-id="${k.id || ""}">حفظ</button>`,
          );
          setTimeout(() => {
            const sel = $("k_type");
            if (sel)
              sel.onchange = () => {
                $("k_typeFields").innerHTML = v48FormFieldsFor(sel.value, k);
                toast("تم تغيير الحقول حسب النوع");
              };
          });
        };
        Actions.saveKnowledge = function (id) {
          const existing = state.knowledge.find((x) => x.id === id);
          const objId = id || uid();
          const coverInput = $("k_cover");
          const mediaInput = $("k_mediaFile");
          const finish = (coverData, fileObj) => {
            const typ = get("k_type");
            const isBook = v47IsBook({ type: typ });
            const isPdf = v48IsPdfFile(fileObj);
            const obj = {
              id: objId,
              title: get("k_title"),
              type: typ,
              area: get("k_area"),
              author: get("k_author"),
              rating: Number(get("k_rating") || 0),
              status: get("k_status") || existing?.status || "active",
              cover: coverData || existing?.cover || "",
              mediaType:
                get("k_mediaType") ||
                (isBook ? "PDF محلي" : detectMediaType(get("k_mediaUrl"))),
              mediaUrl: get("k_mediaUrl"),
              link: get("k_mediaUrl"),
              pdfUrl: isBook ? get("k_mediaUrl") : existing?.pdfUrl || "",
              summary: get("k_summary"),
              ideas: get("k_ideas"),
              application: get("k_actionTaken"),
              actionTaken: get("k_actionTaken"),
              result: get("k_resultAchieved"),
              resultAchieved: get("k_resultAchieved"),
              lessonLearned: get("k_lessonLearned"),
              currentUnit: Number(get("k_current") || 0),
              totalUnits: Number(get("k_total") || 0),
              reviewDate: get("k_review"),
              mediaName: fileObj?.name || existing?.mediaName || "",
              mediaMime: fileObj?.mime || existing?.mediaMime || "",
              mediaData: existing?.mediaData || "",
              pdfData: existing?.pdfData || "",
              mediaDbKey: existing?.mediaDbKey || "",
              pdfDbKey: existing?.pdfDbKey || "",
            };
            const saveObj = () => {
              obj.progress = knowledgeProgress(obj);
              if (existing) Object.assign(existing, obj);
              else state.knowledge.unshift(obj);
              save();
              closeModal();
              render();
              toast(
                isBook
                  ? "تم حفظ الكتاب وملف PDF جاهز"
                  : "تم حفظ المعرفة حسب نوعها",
              );
            };
            if (fileObj && fileObj.data) {
              const dbKey = "file_" + objId;
              if (fileObj.size > 900000 || isPdf) {
                v48DbPut(dbKey, fileObj.data, (ok) => {
                  if (ok) {
                    obj.mediaDbKey = dbKey;
                    obj.mediaData = "";
                    if (isPdf) {
                      obj.pdfDbKey = dbKey;
                      obj.pdfData = "";
                    }
                  } else {
                    obj.mediaData = fileObj.data;
                    if (isPdf) obj.pdfData = fileObj.data;
                  }
                  saveObj();
                });
              } else {
                obj.mediaData = fileObj.data;
                if (isPdf) obj.pdfData = fileObj.data;
                saveObj();
              }
            } else saveObj();
          };
          readImage(coverInput, (cover) => {
            readDataFile(mediaInput, (file) => finish(cover, file));
          });
        };
        function v48GetStoredSource(k, cb) {
          const direct = v47ReaderSource(k) || k.mediaData || k.pdfData || "";
          if (direct) {
            cb(direct);
            return;
          }
          const key = k.pdfDbKey || k.mediaDbKey;
          if (key) v48DbGet(key, cb);
          else cb("");
        }
        openKnowledgePlayerModal = function (k) {
          if (v47IsBook(k) || v47IsArticle(k)) {
            const labels = v47UnitLabel(k);
            const pct = knowledgeProgress(k);
            $("modal").classList.add("player-mode");
            openModal(
              v47IsBook(k) ? "PDF Reader" : "Article Reader",
              `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${v47TypeBadge(k)} قراءة وملاحظات داخل المشروع</p></div><div class="row"></div></div><div class="reader-shell"><div class="reader-frame" id="v48ReaderFrame"><div class="empty"><div><h3>جاري تحميل المصدر...</h3><p class="muted">لو الملف كبير قد يستغرق ثواني.</p></div></div></div><div class="reader-side"><div class="item"><b>التقدم</b><p class="muted">${Number(k.currentUnit || 0)} ${labels[0]} من ${Number(k.totalUnits || 0) || "؟"} ${labels[1]} — ${pct}%</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div></div><div class="reader-side-scroll"><label>وصلت إلى ${labels[0]}</label><input id="readerCurrent" type="number" value="${Number(k.currentUnit || 0)}"><label>إجمالي ${labels[1]}</label><input id="readerTotal" type="number" value="${Number(k.totalUnits || 0)}"><label>ملخصك</label><textarea id="playerNotes">${esc(k.playerNotes || k.summary || "")}</textarea><label>اقتباسات / أفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || k.actionTaken || "")}</textarea></div><div class="row"><button class="btn" data-action="saveReaderProgress" data-id="${k.id}">حفظ التقدم</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button><button class="btn secondary" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div></div>`,
            );
            v48GetStoredSource(k, (src) => {
              const fr = $("v48ReaderFrame");
              if (!fr) return;
              fr.innerHTML = src
                ? `<iframe src="${esc(src)}"></iframe>`
                : `<div class="empty"><div><h3>${v47IsBook(k) ? "لا يوجد PDF" : "لا يوجد رابط مقال"}</h3><p class="muted">افتح تعديل المعرفة وارفع الملف المناسب لهذا النوع.</p></div></div>`;
            });
            return;
          }
          const url = cleanMediaUrl(k.mediaUrl || k.link || "");
          const type = resolvedMediaType(k, url);
          const embed = mediaEmbedUrl(url, type);
          $("modal").classList.add("player-mode");
          openModal(
            "Knowledge Player",
            `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${v47TypeBadge(k)} — تشغيل وملاحظات بدون مغادرة النظام</p></div><div class="row">${url ? `<button class="btn secondary mini" data-action="openExternal" data-url="${esc(url)}">فتح المصدر</button>` : ""}</div></div><div class="player-shell"><div id="v48MediaFrame"><div class="empty"><div><h3>جاري تحميل المشغل...</h3></div></div></div><div class="player-side"><div class="item"><b>ملاحظات أثناء التشغيل</b><p class="muted">اكتب الفكرة فوراً، ثم حوّلها لإجراء.</p></div><div class="player-note-area"><label>ملاحظاتي</label><textarea id="playerNotes">${esc(k.playerNotes || "")}</textarea><label>أهم الأفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || "")}</textarea></div><div class="row"><button class="btn" data-action="savePlayerNotes" data-id="${k.id}">حفظ</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button><button class="btn secondary" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div></div>`,
          );
          v48GetStoredSource(k, (src) => {
            const mf = $("v48MediaFrame");
            if (!mf) return;
            const temp = { ...k, mediaData: src || k.mediaData };
            mf.innerHTML = playerMediaHtml(temp, type, embed, url);
          });
        };
        function v48RenderPomodoroPanel() {
          return `<div class="pomodoro-panel" id="pomodoroPanel"><span class="pomodoro-status ${v48FocusMode === "break" ? "break" : ""}">${v48FocusMode === "break" ? "☕ راحة" : "🎯 تركيز"}</span><h3>Pomodoro</h3><div class="pomodoro-grid"><div><label>وقت التركيز بالدقائق</label><input id="pomFocus" type="number" min="1" value="${state.settings.pomodoro.focus}"></div><div><label>وقت الراحة بالدقائق</label><input id="pomBreak" type="number" min="1" value="${state.settings.pomodoro.break}"></div></div><div class="row" style="margin-top:10px"><button class="btn secondary mini" data-action="savePomodoroSettings">حفظ الوقت</button><button class="btn secondary mini" data-action="startPomodoroFocus">25/5 افتراضي</button></div><p class="muted" style="margin-top:8px">سيصدر صوت عند البداية والنهاية.</p></div>`;
        }
        Actions.openFocus = function () {
          $("focusOverlay").classList.add("open");
          const task =
            active(state.tasks).find((t) => t.status !== "done") ||
            active(state.actions).find((a) => a.status !== "done");
          $("focusTaskName").textContent = task?.title || "مهمة واحدة فقط الآن";
          const card = document.querySelector(".focus-card");
          if (card && !$("pomodoroPanel"))
            card.insertAdjacentHTML("beforeend", v48RenderPomodoroPanel());
          if (!timerRunning) {
            v48FocusMode = "focus";
            timerLeft = (Number(state.settings.pomodoro.focus) || 25) * 60;
            updateTimer();
          }
        };
        Actions.savePomodoroSettings = function () {
          state.settings.pomodoro.focus = Math.max(
            1,
            Number(get("pomFocus") || 25),
          );
          state.settings.pomodoro.break = Math.max(
            1,
            Number(get("pomBreak") || 5),
          );
          save();
          timerLeft =
            (v48FocusMode === "break"
              ? state.settings.pomodoro.break
              : state.settings.pomodoro.focus) * 60;
          updateTimer();
          toast("تم حفظ إعدادات البومودورو");
        };
        Actions.startPomodoroFocus = function () {
          state.settings.pomodoro.focus = 25;
          state.settings.pomodoro.break = 5;
          save();
          v48FocusMode = "focus";
          timerLeft = 1500;
          updateTimer();
          const p = $("pomodoroPanel");
          if (p) p.outerHTML = v48RenderPomodoroPanel();
          toast("تم ضبط 25 دقيقة تركيز و5 راحة");
        };
        Actions.toggleTimer = function () {
          timerRunning = !timerRunning;
          if (timerRunning) {
            v48Beep("start");
            timer = setInterval(() => {
              timerLeft--;
              updateTimer();
              if (timerLeft <= 0) {
                clearInterval(timer);
                timerRunning = false;
                v48Beep("end");
                const was = v48FocusMode;
                v48FocusMode = was === "focus" ? "break" : "focus";
                timerLeft =
                  (v48FocusMode === "break"
                    ? state.settings.pomodoro.break
                    : state.settings.pomodoro.focus) * 60;
                updateTimer();
                openModal(
                  was === "focus" ? "انتهى وقت التركيز" : "انتهت الراحة",
                  `<div class="card"><h2>${was === "focus" ? "🎯 أحسنت — خذ راحة" : "☕ انتهت الراحة — ارجع للتركيز"}</h2><p class="muted">${was === "focus" ? "ابدأ راحة قصيرة الآن." : "ابدأ دورة تركيز جديدة."}</p><div class="row"><button class="btn" data-action="closeModal">تمام</button><button class="btn secondary" data-action="openFocus">افتح المؤقت</button></div></div>`,
                );
              }
            }, 1000);
          } else clearInterval(timer);
        };
        Actions.resetTimer = function () {
          timerRunning = false;
          clearInterval(timer);
          timerLeft =
            (v48FocusMode === "break"
              ? state.settings.pomodoro.break
              : state.settings.pomodoro.focus) * 60;
          updateTimer();
        };
        const v48OldEmergency = Actions.emergencyPlan;
        Actions.emergencyPlan = function () {
          v48AlarmFx();
          setTimeout(() => v48OldEmergency.call(Actions), 260);
        };
        const v48OldStartEmergency = Actions.startEmergencyFocus;
        Actions.startEmergencyFocus = function () {
          v48Beep("start");
          v48OldStartEmergency.call(Actions);
        };
        updateTimer = function () {
          const m = String(Math.floor(timerLeft / 60)).padStart(2, "0"),
            s = String(timerLeft % 60).padStart(2, "0");
          $("timer").textContent = m + ":" + s;
        };

        /* ===== V49: Real Mobile PDF Reader, robust file save, layout polish ===== */
        (function () {
          const oldRenderNavV49 = renderNav;
          renderNav = function () {
            oldRenderNavV49();
            const kb = document.querySelector(
              '.nav button[data-route="knowledge"] span b',
            );
            if (kb) kb.textContent = "🧠";
          };

          function v49GuessTitle(existing, fileObj) {
            const raw = get("k_title");
            if (raw && raw.trim()) return raw.trim();
            if (fileObj && fileObj.name)
              return fileObj.name.replace(/\.[^.]+$/, "");
            return (
              existing?.title ||
              (v47IsBook({ type: get("k_type") }) ? "كتاب جديد" : "محتوى جديد")
            );
          }
          function v49DataUrlToBytes(dataUrl) {
            const base64 = String(dataUrl || "").split(",")[1] || "";
            const bin = atob(base64);
            const len = bin.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = bin.charCodeAt(i);
            return bytes;
          }
          function v49LoadPdfJs(cb) {
            if (window.pdfjsLib) {
              cb(true);
              return;
            }
            const s = document.createElement("script");
            s.src =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
            s.onload = () => {
              try {
                pdfjsLib.GlobalWorkerOptions.workerSrc =
                  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
              } catch (e) {}
              cb(true);
            };
            s.onerror = () => cb(false);
            document.head.appendChild(s);
          }
          window.v49PdfState = { doc: null, page: 1, scale: 1.08, source: "" };
          function v49PdfError(container, msg, source) {
            container.innerHTML = `<div class="pdfjs-error"><div class="warn-box"><h3>PDF لم يفتح داخل المشروع</h3><p>${esc(msg || "المتصفح منع قراءة ملف PDF أو الرابط غير مباشر.")}</p><div class="row" style="justify-content:center;margin-top:10px">${source ? `<button class="btn secondary" data-action="openExternal" data-url="${esc(source)}">فتح المصدر</button>` : ""}<button class="btn secondary" data-action="editKnowledge" data-id="${esc(container.dataset.id || "")}">تعديل المصدر</button></div></div></div>`;
          }
          function v49RenderPdfPage(container) {
            const st = window.v49PdfState;
            if (!st.doc) return;
            st.doc
              .getPage(st.page)
              .then((page) => {
                const wrap = container.querySelector(".pdfjs-canvas-wrap");
                if (!wrap) return;
                const viewport = page.getViewport({ scale: st.scale });
                const canvas = document.createElement("canvas");
                const ctx = canvas.getContext("2d");
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                wrap.innerHTML = "";
                wrap.appendChild(canvas);
                page
                  .render({ canvasContext: ctx, viewport })
                  .promise.then(() => {
                    const label = container.querySelector(".pdfjs-page-label");
                    if (label)
                      label.textContent = `صفحة ${st.page} / ${st.doc.numPages}`;
                  });
              })
              .catch(() =>
                v49PdfError(container, "تعذر عرض الصفحة الحالية.", st.source),
              );
          }
          window.v49PdfNav = function (dir) {
            const st = window.v49PdfState;
            if (!st.doc) return;
            st.page = Math.min(st.doc.numPages, Math.max(1, st.page + dir));
            v49RenderPdfPage(document.querySelector(".pdfjs-reader"));
          };
          window.v49PdfZoom = function (delta) {
            const st = window.v49PdfState;
            if (!st.doc) return;
            st.scale = Math.min(2.4, Math.max(0.6, st.scale + delta));
            v49RenderPdfPage(document.querySelector(".pdfjs-reader"));
          };
          function v49RenderPdf(container, source, id) {
            container.dataset.id = id || "";
            container.innerHTML = `<div class="pdfjs-reader"><div class="pdfjs-toolbar"><div class="row"><button class="btn secondary mini" data-action="v821PdfNavPrev">السابق</button><span class="pill pdfjs-page-label">تحميل...</span><button class="btn secondary mini" data-action="v821PdfNavNext">التالي</button></div><div class="row"><button class="btn secondary mini" data-action="v821PdfZoomOut">-</button><button class="btn secondary mini" data-action="v821PdfZoomIn">+</button></div></div><div class="pdfjs-canvas-wrap"><div class="empty">جاري فتح PDF داخل المشروع...</div></div></div>`;
            v49LoadPdfJs((ok) => {
              if (!ok) {
                v49PdfError(
                  container,
                  "تعذر تحميل قارئ PDF.js. تأكد أن الإنترنت يعمل.",
                  source,
                );
                return;
              }
              let task;
              try {
                if (String(source).startsWith("data:application/pdf"))
                  task = pdfjsLib.getDocument({
                    data: v49DataUrlToBytes(source),
                  });
                else
                  task = pdfjsLib.getDocument({
                    url: source,
                    withCredentials: false,
                  });
              } catch (e) {
                v49PdfError(container, "مصدر PDF غير صالح.", source);
                return;
              }
              task.promise
                .then((doc) => {
                  window.v49PdfState = { doc, page: 1, scale: 1.08, source };
                  v49RenderPdfPage(container);
                })
                .catch((err) => {
                  v49PdfError(
                    container,
                    "الرابط قد لا يكون PDF مباشر أو يمنع القراءة داخل الموقع. جرّب رفع الملف محليًا بدل الرابط.",
                    source,
                  );
                });
            });
          }

          const v49OldFormFields = v48FormFieldsFor;
          v48FormFieldsFor = function (type, k = {}) {
            const html = v49OldFormFields(type, k);
            return html
              .replace("📚 بيانات الكتاب فقط", "📚 كتاب / PDF فقط")
              .replace(
                "لو ملف PDF كبير جدًا، سيتم حفظه في مساحة خاصة داخل المتصفح IndexedDB بدل localStorage.",
                "ارفع ملف PDF من جهازك ليعمل داخل المشروع. روابط PDF قد تمنع القراءة بسبب حماية الموقع، والرفع المحلي أفضل.",
              );
          };

          Actions.saveKnowledge = function (id) {
            const existing = state.knowledge.find((x) => x.id === id);
            const objId = id || uid();
            const coverInput = $("k_cover");
            const mediaInput = $("k_mediaFile");
            const finish = (coverData, fileObj) => {
              const typ = get("k_type") || "كتاب";
              const isBook = v47IsBook({ type: typ });
              const isPdf = v48IsPdfFile(fileObj);
              const url = get("k_mediaUrl");
              const obj = {
                id: objId,
                title: v49GuessTitle(existing, fileObj),
                type: typ,
                area: get("k_area"),
                author: get("k_author"),
                rating: Number(get("k_rating") || 0),
                status: get("k_status") || existing?.status || "active",
                cover: coverData || existing?.cover || "",
                mediaType:
                  get("k_mediaType") ||
                  (isBook ? "PDF محلي" : detectMediaType(url)),
                mediaUrl: url,
                link: url,
                pdfUrl: isBook ? url : existing?.pdfUrl || "",
                summary: get("k_summary"),
                ideas: get("k_ideas"),
                application: get("k_actionTaken"),
                actionTaken: get("k_actionTaken"),
                result: get("k_resultAchieved"),
                resultAchieved: get("k_resultAchieved"),
                lessonLearned: get("k_lessonLearned"),
                currentUnit: Number(get("k_current") || 0),
                totalUnits: Number(get("k_total") || 0),
                reviewDate: get("k_review"),
                mediaName: fileObj?.name || existing?.mediaName || "",
                mediaMime: fileObj?.mime || existing?.mediaMime || "",
                mediaData: existing?.mediaData || "",
                pdfData: existing?.pdfData || "",
                mediaDbKey: existing?.mediaDbKey || "",
                pdfDbKey: existing?.pdfDbKey || "",
              };
              const saveObj = () => {
                obj.progress = knowledgeProgress(obj);
                if (existing) Object.assign(existing, obj);
                else state.knowledge.unshift(obj);
                save();
                closeModal();
                render();
                toast(
                  isBook
                    ? "تم حفظ الكتاب ✅ افتحه من زر اقرأ الكتاب"
                    : "تم حفظ المعرفة ✅",
                );
              };
              if (fileObj && fileObj.data) {
                const dbKey =
                  (isPdf ? "pdf_" : "file_") + objId + "_" + Date.now();
                v48DbPut(dbKey, fileObj.data, (ok) => {
                  if (ok) {
                    obj.mediaDbKey = dbKey;
                    obj.mediaData = "";
                    if (isPdf || isBook) {
                      obj.pdfDbKey = dbKey;
                      obj.pdfData = "";
                      obj.mediaType = "PDF محلي";
                    }
                  } else {
                    obj.mediaData = fileObj.data;
                    if (isPdf || isBook) {
                      obj.pdfData = fileObj.data;
                      obj.mediaType = "PDF محلي";
                    }
                  }
                  saveObj();
                });
              } else saveObj();
            };
            readImage(coverInput, (cover) => {
              readDataFile(mediaInput, (file) => finish(cover, file));
            });
          };

          const v49OldGetStored = v48GetStoredSource;
          v48GetStoredSource = function (k, cb) {
            const key = k.pdfDbKey || k.mediaDbKey;
            if (key) {
              v48DbGet(key, (data) => {
                if (data) cb(data);
                else v49OldGetStored(k, cb);
              });
              return;
            }
            v49OldGetStored(k, cb);
          };

          const v49OldOpenPlayer = openKnowledgePlayerModal;
          openKnowledgePlayerModal = function (k) {
            if (v47IsBook(k)) {
              const labels = v47UnitLabel(k);
              const pct = knowledgeProgress(k);
              $("modal").classList.add("player-mode");
              openModal(
                "PDF Reader",
                `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "كتاب")}</h3><p><span class="pill book-badge">📚 PDF Reader</span> قراءة وملاحظات داخل المشروع</p></div><div class="row"><button class="btn secondary mini" data-action="editKnowledge" data-id="${k.id}">تعديل</button></div></div><div class="reader-shell"><div class="reader-frame" id="v49ReaderFrame"></div><div class="reader-side"><div class="item"><b>التقدم</b><p class="muted">${Number(k.currentUnit || 0)} ${labels[0]} من ${Number(k.totalUnits || 0) || "؟"} ${labels[1]} — ${pct}%</p><div class="v46-progress-line"><i style="width:${pct}%"></i></div></div><div class="reader-side-scroll"><label>وصلت إلى صفحة</label><input id="readerCurrent" type="number" value="${Number(k.currentUnit || 0)}"><label>إجمالي الصفحات</label><input id="readerTotal" type="number" value="${Number(k.totalUnits || 0)}"><label>ملخصك</label><textarea id="playerNotes">${esc(k.playerNotes || k.summary || "")}</textarea><label>اقتباسات / أفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || k.actionTaken || "")}</textarea></div><div class="row"><button class="btn" data-action="saveReaderProgress" data-id="${k.id}">حفظ التقدم</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button></div></div></div>`,
              );
              v48GetStoredSource(k, (src) => {
                const fr = $("v49ReaderFrame");
                if (!fr) return;
                if (src) v49RenderPdf(fr, src, k.id);
                else
                  fr.innerHTML = `<div class="empty"><div><h3>لا يوجد PDF محفوظ</h3><p class="muted">اضغط تعديل وارفع ملف PDF من جهازك.</p></div></div>`;
              });
              return;
            }
            v49OldOpenPlayer(k);
          };

          const v49OldViewKnowledge = viewKnowledge;
          viewKnowledge = function () {
            const html = v49OldViewKnowledge();
            return html + '<div class="bottom-safe-space"></div>';
          };
        })();

        /* ===== V50: Mobile PDF Reading UX — swipe pages, fullscreen, autosave progress ===== */
        (function () {
          const css = `
  .pdfjs-reader{touch-action:pan-y;background:rgba(8,10,22,.96);border-radius:18px;position:relative}
  .pdfjs-canvas-wrap{scroll-snap-type:y mandatory;overscroll-behavior:contain;min-height:0;touch-action:pan-y}
  .pdfjs-canvas-wrap canvas{scroll-snap-align:center;max-width:100%!important}
  .pdfjs-toolbar{position:sticky;top:0;z-index:5;background:rgba(15,18,34,.90)!important;backdrop-filter:blur(14px)}
  .pdfjs-swipe-hint{position:absolute;left:50%;bottom:12px;transform:translateX(-50%);padding:7px 11px;border-radius:999px;background:rgba(0,0,0,.46);border:1px solid rgba(255,255,255,.14);color:var(--soft);font-size:11px;pointer-events:none;opacity:.86}
  .reader-save-mini{font-size:11px;color:var(--muted);text-align:center;margin-top:4px;min-height:16px}
  .modal.player-mode.v50-reader-fullscreen{padding:0!important;background:#050611!important;z-index:150!important}
  .modal.player-mode.v50-reader-fullscreen .modal-box{width:100vw!important;height:100dvh!important;max-height:100dvh!important;border-radius:0!important;padding:8px!important;background:#050611!important}
  .modal.player-mode.v50-reader-fullscreen .player-head{display:none!important}
  .modal.player-mode.v50-reader-fullscreen .reader-shell{height:calc(100dvh - 10px)!important;grid-template-columns:1fr!important;grid-template-rows:1fr!important;gap:0!important}
  .modal.player-mode.v50-reader-fullscreen .reader-side{display:none!important}
  .modal.player-mode.v50-reader-fullscreen .reader-frame{height:100%!important;min-height:100%!important;border-radius:0!important;border:0!important;background:#050611!important}
  .modal.player-mode.v50-reader-fullscreen .pdfjs-reader{height:100%!important;border-radius:0!important;padding:6px!important}
  .modal.player-mode.v50-reader-fullscreen .pdfjs-canvas-wrap{height:100%!important;border-radius:0!important;padding:6px!important;align-items:center;place-items:center}
  .modal.player-mode.v50-reader-fullscreen .pdfjs-toolbar{border-radius:16px;position:fixed;right:8px;left:8px;top:8px;z-index:170;background:rgba(10,12,24,.78)!important}
  .v50-fs-exit{display:none!important}.modal.player-mode.v50-reader-fullscreen .v50-fs-exit{display:inline-flex!important}
  @media(max-width:520px){.pdfjs-swipe-hint{font-size:10px;bottom:8px}.pdfjs-toolbar{gap:6px}.pdfjs-toolbar .row{justify-content:center}.reader-save-mini{font-size:10px}}
  `;
          const st = document.createElement("style");
          st.textContent = css;
          document.head.appendChild(st);

          function v50ReaderId() {
            return (
              document.querySelector("#v49ReaderFrame")?.dataset?.id ||
              document.querySelector(".reader-frame")?.dataset?.id ||
              ""
            );
          }
          function v50SetSaveLabel(txt) {
            const el = document.querySelector(".reader-save-mini");
            if (el) el.textContent = txt || "";
          }
          function v50UpdateSideProgress(k) {
            const labels =
              typeof v47UnitLabel === "function"
                ? v47UnitLabel(k)
                : ["صفحة", "صفحات"];
            const pct =
              typeof knowledgeProgress === "function"
                ? knowledgeProgress(k)
                : 0;
            const side = document.querySelector(".reader-side .item");
            if (side) {
              const p = side.querySelector("p.muted");
              if (p)
                p.textContent = `${Number(k.currentUnit || 0)} ${labels[0]} من ${Number(k.totalUnits || 0) || "؟"} ${labels[1]} — ${pct}%`;
              const bar = side.querySelector(".v46-progress-line i,.bar");
              if (bar) bar.style.width = pct + "%";
            }
          }
          window.v50AutoSaveReaderProgress = function (opts = {}) {
            const id = opts.id || v50ReaderId();
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            const stt = window.v49PdfState || {};
            const page = Number(stt.page || get("readerCurrent") || 0);
            const total = Number(
              stt.doc?.numPages || get("readerTotal") || k.totalUnits || 0,
            );
            if (page > 0) {
              k.currentUnit = page;
              const input = $("readerCurrent");
              if (input) input.value = page;
            }
            if (total > 0) {
              k.totalUnits = total;
              const input = $("readerTotal");
              if (input) input.value = total;
            }
            if ($("playerNotes")) {
              k.playerNotes = get("playerNotes");
              if (k.playerNotes) k.summary = k.playerNotes;
            }
            if ($("playerIdeas")) k.ideas = get("playerIdeas");
            if ($("playerApp")) {
              k.application = get("playerApp");
              k.actionTaken = get("playerApp");
            }
            k.progress = knowledgeProgress(k);
            save();
            v50UpdateSideProgress(k);
            if (!opts.silent) {
              toast("تم حفظ التقدم ✅");
            } else {
              v50SetSaveLabel("تم حفظ التقدم تلقائياً");
              clearTimeout(window.__v50SaveLabelTimer);
              window.__v50SaveLabelTimer = setTimeout(
                () => v50SetSaveLabel(""),
                1500,
              );
            }
          };

          const oldSave = Actions.saveReaderProgress;
          Actions.saveReaderProgress = function (id) {
            v50AutoSaveReaderProgress({ id, silent: false });
          };

          const oldNav = window.v49PdfNav;
          window.v49PdfNav = function (dir) {
            if (typeof oldNav === "function") oldNav(dir);
            setTimeout(() => v50AutoSaveReaderProgress({ silent: true }), 360);
          };
          const oldZoom = window.v49PdfZoom;
          window.v49PdfZoom = function (delta) {
            if (typeof oldZoom === "function") oldZoom(delta);
            setTimeout(() => v50InstallReaderControls(), 80);
          };

          window.v50ToggleReaderFullscreen = function (force) {
            const m = $("modal");
            const on =
              typeof force === "boolean"
                ? force
                : !m.classList.contains("v50-reader-fullscreen");
            m.classList.toggle("v50-reader-fullscreen", on);
            document.body.classList.toggle("reader-fullscreen-open", on);
            setTimeout(() => {
              try {
                window.v49PdfZoom(0);
              } catch (e) {}
            }, 120);
          };

          function v50InstallReaderControls() {
            const reader = document.querySelector(".pdfjs-reader");
            const wrap = document.querySelector(".pdfjs-canvas-wrap");
            if (!reader || !wrap || reader.dataset.v50 === "1") return;
            reader.dataset.v50 = "1";
            const toolbar = reader.querySelector(".pdfjs-toolbar");
            if (toolbar && !toolbar.querySelector(".v50-fullscreen-btn")) {
              toolbar.insertAdjacentHTML(
                "beforeend",
                `<div class="row"><button class="btn secondary mini v50-fullscreen-btn" data-action="v821ReaderFullscreenOn">تكبير الشاشة</button><button class="btn danger mini v50-fs-exit" data-action="v821ReaderFullscreenOff">خروج</button></div>`,
              );
            }
            if (!reader.querySelector(".pdfjs-swipe-hint"))
              reader.insertAdjacentHTML(
                "beforeend",
                '<div class="pdfjs-swipe-hint">اسحب لفوق: الصفحة التالية • اسحب لتحت: السابقة</div>',
              );
            if (!document.querySelector(".reader-save-mini")) {
              const side = document.querySelector(".reader-side .row");
              if (side)
                side.insertAdjacentHTML(
                  "beforebegin",
                  '<div class="reader-save-mini"></div>',
                );
            }
            let startY = 0,
              startX = 0,
              startT = 0;
            wrap.addEventListener(
              "touchstart",
              (e) => {
                const t = e.changedTouches[0];
                startY = t.clientY;
                startX = t.clientX;
                startT = Date.now();
              },
              { passive: true },
            );
            wrap.addEventListener(
              "touchend",
              (e) => {
                const t = e.changedTouches[0];
                const dy = startY - t.clientY;
                const dx = startX - t.clientX;
                const dt = Date.now() - startT;
                if (
                  Math.abs(dy) > 55 &&
                  Math.abs(dy) > Math.abs(dx) * 1.2 &&
                  dt < 850
                ) {
                  window.v49PdfNav(dy > 0 ? 1 : -1);
                }
              },
              { passive: true },
            );
          }

          // Watch for PDF reader opening, then install controls and autosave current page/total.
          setInterval(() => {
            if (document.querySelector(".pdfjs-reader")) {
              v50InstallReaderControls();
              const stt = window.v49PdfState || {};
              if (stt.doc && stt.page) {
                const id = v50ReaderId();
                const k = state.knowledge.find((x) => x.id === id);
                if (
                  k &&
                  (Number(k.currentUnit || 0) !== Number(stt.page) ||
                    Number(k.totalUnits || 0) !== Number(stt.doc.numPages || 0))
                ) {
                  v50AutoSaveReaderProgress({ id, silent: true });
                }
              }
            }
          }, 900);

          // Start PDF from saved page when possible.
          const oldOpen = openKnowledgePlayerModal;
          openKnowledgePlayerModal = function (k) {
            oldOpen(k);
            if (k && typeof v47IsBook === "function" && v47IsBook(k)) {
              const targetPage = Math.max(1, Number(k.currentUnit || 1));
              const tries = { n: 0 };
              const int = setInterval(() => {
                tries.n++;
                const stt = window.v49PdfState || {};
                if (stt.doc && stt.doc.numPages) {
                  if (targetPage > 1) {
                    stt.page = Math.min(stt.doc.numPages, targetPage);
                    window.v49PdfNav(0);
                  } else v50AutoSaveReaderProgress({ id: k.id, silent: true });
                  clearInterval(int);
                }
                if (tries.n > 12) clearInterval(int);
              }, 400);
            }
          };
        })();

        toast("V50 جاهز: PDF Swipe + Fullscreen + Auto Progress");

        toast("V48 جاهز: فورم ذكي + PDF Fix + Pomodoro + طوارئ بصوت");

        toast("V47 Smart Knowledge Types جاهز — الكتب PDF، البودكاست Player");

        /* ===== V52: Auto YouTube Playlist Importer + Video Progress ===== */
        (function () {
          const v52Style = document.createElement("style");
          v52Style.textContent = `
  .v52-playlist-box{display:grid;gap:10px;margin:12px 0;padding:14px;border-radius:20px;border:1px solid rgba(139,92,246,.24);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.055))}
  .v52-playlist-box h4{margin:0;font-size:15px}.v52-playlist-box p{margin:0;color:var(--muted);line-height:1.65;font-size:12px}
  .v52-playlist-badge{display:inline-flex;align-items:center;gap:6px;padding:6px 9px;border-radius:999px;background:rgba(59,130,246,.10);border:1px solid rgba(59,130,246,.22);color:#bfdbfe;font-size:11px}
  .v52-video-progress{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:10px}
  .v52-mini-note{font-size:11px;color:var(--muted);line-height:1.7}
  @media(max-width:520px){.v52-video-progress{grid-template-columns:1fr}.v52-playlist-box{padding:12px;border-radius:18px}}
  `;
          document.head.appendChild(v52Style);
          function v52Get(id) {
            const el = $(id);
            return el ? el.value.trim() : "";
          }
          function v52PlaylistId(url) {
            url = String(url || "");
            let m = url.match(/[?&]list=([\w-]+)/);
            return m ? m[1] : "";
          }
          function v52VideoUrl(id) {
            return "https://www.youtube.com/watch?v=" + id;
          }
          function v52ParseIsoDuration(s) {
            const m = String(s || "").match(
              /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
            );
            if (!m) return 0;
            return (
              Number(m[1] || 0) * 60 +
              Number(m[2] || 0) +
              (Number(m[3] || 0) ? 1 : 0)
            );
          }
          async function v52FetchJson(url) {
            const res = await fetch(url);
            const data = await res.json();
            if (!res.ok || data.error) {
              throw new Error(data?.error?.message || "فشل الاتصال بيوتيوب");
            }
            return data;
          }
          async function v52FetchPlaylistTitle(listId, key) {
            try {
              const d = await v52FetchJson(
                "https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=" +
                  encodeURIComponent(listId) +
                  "&key=" +
                  encodeURIComponent(key),
              );
              return d.items?.[0]?.snippet?.title || "";
            } catch (e) {
              return "";
            }
          }
          async function v52FetchDurations(ids, key) {
            const out = {};
            for (let i = 0; i < ids.length; i += 50) {
              const part = ids.slice(i, i + 50);
              const d = await v52FetchJson(
                "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" +
                  encodeURIComponent(part.join(",")) +
                  "&key=" +
                  encodeURIComponent(key),
              );
              (d.items || []).forEach((it) => {
                out[it.id] = v52ParseIsoDuration(it.contentDetails?.duration);
              });
            }
            return out;
          }
          async function v52FetchPlaylistVideos(listId, key) {
            let page = "",
              items = [];
            do {
              const url =
                "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" +
                encodeURIComponent(listId) +
                "&key=" +
                encodeURIComponent(key) +
                (page ? "&pageToken=" + encodeURIComponent(page) : "");
              const d = await v52FetchJson(url);
              page = d.nextPageToken || "";
              (d.items || []).forEach((it) => {
                const sn = it.snippet || {};
                const rid = sn.resourceId || {};
                const vid = rid.videoId;
                if (!vid) return;
                const title = sn.title || "فيديو";
                if (/Private video|Deleted video/i.test(title)) return;
                const th =
                  sn.thumbnails?.high?.url ||
                  sn.thumbnails?.medium?.url ||
                  sn.thumbnails?.default?.url ||
                  "";
                items.push({ videoId: vid, title, thumbnail: th });
              });
            } while (page);
            const durations = await v52FetchDurations(
              items.map((x) => x.videoId),
              key,
            ).catch(() => ({}));
            items = items.map((x) => ({
              ...x,
              duration: durations[x.videoId] || 0,
            }));
            return items;
          }
          const v52OldFields = v48FormFieldsFor;
          v48FormFieldsFor = function (type, k = {}) {
            let html = v52OldFields(type, k);
            const fake = { type };
            if (v47IsVideo(fake) || v47IsPodcast(fake)) {
              html += `<div class="v52-playlist-box"><h4>▶️ استيراد Playlist تلقائي</h4><p>الصق رابط قائمة YouTube، وسيتم إنشاء كل فيديو ككارت منفصل بعنوانه الحقيقي. تحتاج YouTube API Key مرة واحدة فقط.</p><label>رابط Playlist</label><input id="k_playlistUrl" value="${esc(k.playlistUrl || "")}" placeholder="https://www.youtube.com/playlist?list=..."><label>YouTube API Key</label><input id="k_youtubeApiKey" value="${esc(state.settings.youtubeApiKey || "")}" placeholder="ضع المفتاح هنا مرة واحدة"><p class="v52-mini-note">بعد الحفظ: سيتم جلب الفيديوهات تلقائيًا، كل فيديو منفصل، مع حفظ تقدم ومكتمل لكل واحد.</p></div>`;
            }
            return html;
          };
          async function v52ImportPlaylistFromForm(id) {
            const typ = v52Get("k_type") || "فيديو";
            const fake = { type: typ };
            if (!(v47IsVideo(fake) || v47IsPodcast(fake))) return false;
            const plUrl = v52Get("k_playlistUrl");
            if (!plUrl) return false;
            const listId = v52PlaylistId(plUrl);
            if (!listId) {
              toast("رابط البلاي ليست غير واضح");
              return true;
            }
            const key =
              v52Get("k_youtubeApiKey") || state.settings.youtubeApiKey || "";
            if (!key) {
              toast("ضع YouTube API Key لاستيراد العناوين تلقائيًا");
              return true;
            }
            state.settings.youtubeApiKey = key;
            save();
            closeModal();
            toast("جاري استيراد فيديوهات القائمة من YouTube...");
            try {
              const [groupTitleRaw, videos] = await Promise.all([
                v52FetchPlaylistTitle(listId, key),
                v52FetchPlaylistVideos(listId, key),
              ]);
              if (!videos.length) {
                toast("لم يتم العثور على فيديوهات قابلة للاستيراد");
                return true;
              }
              const groupId = uid();
              const groupTitle =
                v52Get("k_title") || groupTitleRaw || "قائمة فيديوهات";
              const area = v52Get("k_area") || "التعلم";
              const rating = Number(v52Get("k_rating") || 0);
              const summary = v52Get("k_summary") || "قائمة: " + groupTitle;
              videos
                .slice()
                .reverse()
                .forEach((v, i) => {
                  const index = videos.length - i;
                  state.knowledge.unshift({
                    id: uid(),
                    title: v.title,
                    type: typ,
                    area,
                    author: groupTitle,
                    rating,
                    status: "active",
                    cover: v.thumbnail,
                    mediaType: "YouTube",
                    mediaUrl: v52VideoUrl(v.videoId),
                    link: v52VideoUrl(v.videoId),
                    youtubeVideoId: v.videoId,
                    playlistUrl: plUrl,
                    playlistId: listId,
                    playlistGroup: groupTitle,
                    playlistGroupId: groupId,
                    playlistIndex: index,
                    playlistTotal: videos.length,
                    isPlaylistItem: true,
                    currentUnit: 0,
                    currentMinute: 0,
                    totalUnits: v.duration || 0,
                    totalMinutes: v.duration || 0,
                    progress: 0,
                    summary,
                    ideas: "",
                    application: "",
                    actionTaken: "",
                    resultAchieved: "",
                    lessonLearned: "",
                  });
                });
              state.timeline.unshift({
                id: uid(),
                title: "استيراد Playlist: " + groupTitle,
                date: v46Today
                  ? v46Today()
                  : new Date().toISOString().slice(0, 10),
                area: "التعلم",
                note:
                  "تم إنشاء " + videos.length + " فيديو منفصل داخل المعرفة.",
              });
              save();
              render();
              toast(
                "تم استيراد " + videos.length + " فيديو بعنوانه الحقيقي ✅",
              );
              return true;
            } catch (e) {
              toast(
                "فشل الاستيراد: " + (e.message || "تحقق من API Key والرابط"),
              );
              return true;
            }
          }
          const v52OldSaveKnowledge = Actions.saveKnowledge;
          Actions.saveKnowledge = async function (id) {
            const handled = await v52ImportPlaylistFromForm(id);
            if (handled) return;
            return v52OldSaveKnowledge(id);
          };
          function v52GroupProgress(k) {
            if (!k.playlistGroupId) return null;
            const arr = state.knowledge.filter(
              (x) => x.playlistGroupId === k.playlistGroupId,
            );
            const done = arr.filter(
              (x) => x.status === "done" || Number(x.progress || 0) >= 100,
            ).length;
            return {
              done,
              total: arr.length,
              pct: arr.length ? Math.round((done / arr.length) * 100) : 0,
            };
          }
          const v52OldCard = cardKnowledge;
          cardKnowledge = function (x) {
            let html = v52OldCard(x);
            if (x.isPlaylistItem) {
              const gp = v52GroupProgress(x);
              const badge = `<div class="knowledge-type-line"><span class="v52-playlist-badge">📺 ${esc(x.playlistGroup || "Playlist")} — ${x.playlistIndex || ""}/${x.playlistTotal || ""}</span>${gp ? `<span class="v52-playlist-badge">تقدم القائمة ${gp.done}/${gp.total}</span>` : ""}</div>`;
              html = html.replace(
                '<p class="knowledge-summary">',
                badge + '<p class="knowledge-summary">',
              );
            }
            return html;
          };
          const v52OldOpenPlayer = openKnowledgePlayerModal;
          openKnowledgePlayerModal = function (k) {
            if (k && (v47IsVideo(k) || v47IsPodcast(k))) {
              const url = cleanMediaUrl(k.mediaUrl || k.link || "");
              const type = resolvedMediaType(k, url);
              const embed = mediaEmbedUrl(url, type);
              $("modal").classList.add("player-mode");
              openModal(
                "Knowledge Player",
                `<div class="player-head"><div class="player-title"><h3>${esc(k.title || "محتوى")}</h3><p>${v47TypeBadge(k)} ${k.isPlaylistItem ? `<span class="v52-playlist-badge">${esc(k.playlistGroup || "Playlist")} ${k.playlistIndex || ""}/${k.playlistTotal || ""}</span>` : ""}</p></div><div class="row">${url ? `<button class="btn secondary mini" data-action="openExternal" data-url="${esc(url)}">فتح المصدر</button>` : ""}</div></div><div class="player-shell"><div id="v48MediaFrame"><div class="empty"><div><h3>جاري تحميل المشغل...</h3></div></div></div><div class="player-side"><div class="item"><b>تقدم الفيديو</b><div class="v52-video-progress"><div><label>وصلت لدقيقة</label><input id="videoCurrent" type="number" value="${Number(k.currentUnit || k.currentMinute || 0)}"></div><div><label>إجمالي الدقائق</label><input id="videoTotal" type="number" value="${Number(k.totalUnits || k.totalMinutes || 0)}"></div></div><div class="v46-progress-line"><i style="width:${knowledgeProgress(k)}%"></i></div></div><div class="player-note-area"><label>ملاحظاتي</label><textarea id="playerNotes">${esc(k.playerNotes || "")}</textarea><label>أهم الأفكار</label><textarea id="playerIdeas">${esc(k.ideas || "")}</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">${esc(k.application || "")}</textarea></div><div class="row"><button class="btn" data-action="saveVideoProgress" data-id="${k.id}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${k.id}">أنهيت الفيديو</button><button class="btn secondary" data-action="playerToAction" data-id="${k.id}">حوّل لإجراء</button></div></div></div>`,
              );
              v48GetStoredSource(k, (src) => {
                const mf = $("v48MediaFrame");
                if (!mf) return;
                const temp = { ...k, mediaData: src || k.mediaData };
                mf.innerHTML = playerMediaHtml(temp, type, embed, url);
              });
              return;
            }
            v52OldOpenPlayer(k);
          };
          Actions.saveVideoProgress = function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            const cur = Number(v52Get("videoCurrent") || 0),
              total = Number(v52Get("videoTotal") || 0);
            k.currentUnit = cur;
            k.currentMinute = cur;
            k.totalUnits = total;
            k.totalMinutes = total;
            k.progress = knowledgeProgress(k);
            k.playerNotes = v52Get("playerNotes");
            k.ideas = v52Get("playerIdeas");
            k.application = v52Get("playerApp");
            k.actionTaken = v52Get("playerApp");
            save();
            render();
            toast("تم حفظ تقدم الفيديو ✅");
          };
          Actions.completeVideoItem = function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            if (k.totalUnits) {
              k.currentUnit = k.totalUnits;
              k.currentMinute = k.totalUnits;
            }
            k.progress = 100;
            k.status = "done";
            k.completedAt = new Date().toISOString();
            if (k.playlistGroupId) {
              const arr = state.knowledge.filter(
                (x) => x.playlistGroupId === k.playlistGroupId,
              );
              const all = arr.every(
                (x) =>
                  x.id === k.id ||
                  x.status === "done" ||
                  Number(x.progress || 0) >= 100,
              );
              if (all) toast("تم إكمال قائمة الفيديوهات بالكامل 🏆");
              else toast("تم تعليم الفيديو كمكتمل ✅");
            } else toast("تم تعليم الفيديو كمكتمل ✅");
            save();
            closeModal();
            render();
          };
          toast("V52 جاهز: استيراد Playlist تلقائي بالعناوين الحقيقية");
        })();

        /* ===== V53: Professional Playlist Group Library ===== */
        (function () {
          const st = document.createElement("style");
          st.textContent = `
  .v53-playlist-card{padding:0!important;overflow:hidden;border-radius:26px!important;background:linear-gradient(180deg,rgba(24,31,58,.94),rgba(10,12,25,.96))!important;border:1px solid rgba(139,92,246,.26)!important;box-shadow:0 26px 70px rgba(0,0,0,.26)!important}
  .v53-playlist-hero{position:relative;min-height:170px;padding:18px;display:grid;align-items:end;background:linear-gradient(135deg,rgba(139,92,246,.36),rgba(236,72,153,.18)),var(--pl-thumb,transparent);background-size:cover;background-position:center;overflow:hidden}.v53-playlist-hero:before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,6,16,.20),rgba(4,6,16,.92))}.v53-playlist-hero>*{position:relative}.v53-playlist-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start;margin-bottom:28px}.v53-playlist-pill{display:inline-flex;gap:6px;align-items:center;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.11);border:1px solid rgba(255,255,255,.14);font-size:12px;color:#fff}.v53-playlist-title{margin:0;font-size:23px;line-height:1.35;letter-spacing:-.03em}.v53-playlist-sub{color:var(--muted);font-size:13px;margin:7px 0 0;line-height:1.55}.v53-playlist-body{padding:15px;display:grid;gap:12px}.v53-playlist-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.v53-playlist-stat{padding:10px;border-radius:18px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.08);text-align:center}.v53-playlist-stat b{display:block;font-size:20px}.v53-playlist-stat small{display:block;color:var(--muted);font-size:11px;margin-top:3px}.v53-playlist-actions{display:grid;grid-template-columns:1fr auto;gap:8px}.v53-playlist-actions .btn{min-height:48px}.v53-playlist-list{display:grid;gap:8px;max-height:42vh;overflow:auto;padding-inline-end:2px}.v53-video-row{display:grid;grid-template-columns:56px 1fr auto;gap:10px;align-items:center;padding:9px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04);border-radius:18px}.v53-video-row.active{border-color:rgba(236,72,153,.42);background:rgba(236,72,153,.08)}.v53-video-thumb{width:56px;height:40px;border-radius:12px;object-fit:cover;background:#050611}.v53-video-row h4{font-size:13px;line-height:1.4;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.v53-video-row p{font-size:11px;color:var(--muted);margin:4px 0 0}.v53-playlist-modal{display:grid;grid-template-columns:minmax(0,1.3fr) minmax(280px,.7fr);gap:12px;min-height:0}.v53-watchbox{min-height:330px}.v53-player-title{margin:0 0 10px;font-size:19px;line-height:1.35}.v53-local-note{height:100%;min-height:320px;display:grid;place-items:center;text-align:center;padding:22px;border-radius:22px;border:1px dashed rgba(245,158,11,.35);background:linear-gradient(180deg,rgba(245,158,11,.10),rgba(255,255,255,.025));color:#fde68a;line-height:1.8}.v53-local-note h3{color:#fff;margin:0 0 8px}.v53-playlist-progress{display:grid;gap:8px}
  @media(max-width:1020px){.v53-playlist-modal{grid-template-columns:1fr}.v53-watchbox{min-height:260px}.v53-playlist-list{max-height:34vh}.v53-playlist-title{font-size:20px}.v53-playlist-actions{grid-template-columns:1fr}.v53-playlist-stats{grid-template-columns:repeat(3,1fr)}}
  @media(max-width:430px){.v53-playlist-hero{min-height:150px;padding:14px}.v53-playlist-body{padding:12px}.v53-video-row{grid-template-columns:50px 1fr auto}.v53-video-thumb{width:50px;height:36px}.v53-playlist-stat b{font-size:17px}}
  `;
          document.head.appendChild(st);
          function v53PlaylistGroups() {
            const groups = {};
            active(state.knowledge)
              .filter((x) => x.isPlaylistItem && x.playlistGroupId)
              .forEach((x) => {
                const id = x.playlistGroupId;
                if (!groups[id])
                  groups[id] = {
                    id,
                    title: x.playlistGroup || "Playlist",
                    url: x.playlistUrl || "",
                    items: [],
                  };
                groups[id].items.push(x);
              });
            Object.values(groups).forEach((g) =>
              g.items.sort(
                (a, b) =>
                  Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0),
              ),
            );
            return groups;
          }
          function v53GroupStats(g) {
            const total = g.items.length;
            const done = g.items.filter(
              (x) => x.status === "done" || Number(x.progress || 0) >= 100,
            ).length;
            const minutes = g.items.reduce(
              (s, x) => s + Number(x.totalUnits || x.totalMinutes || 0),
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            const next =
              g.items.find(
                (x) => !(x.status === "done" || Number(x.progress || 0) >= 100),
              ) || g.items[0];
            return { total, done, minutes, pct, next };
          }
          function v53PlaylistCard(g) {
            const s = v53GroupStats(g),
              first = g.items[0] || {},
              thumb = first.cover || "";
            return `<div class="item knowledge-card v53-playlist-card" style="--pl-thumb:url('${esc(thumb)}')"><div class="v53-playlist-hero"><div class="v53-playlist-top"><span class="v53-playlist-pill">📺 Playlist</span><span class="v53-playlist-pill">${s.done}/${s.total} مكتمل</span></div><div><h3 class="v53-playlist-title">${esc(g.title)}</h3><p class="v53-playlist-sub">قائمة مجمعة — افتحها وشغّل كل فيديو من داخل نفس الشاشة بدون ما تتوه بين الكروت.</p></div></div><div class="v53-playlist-body"><div class="v53-playlist-progress"><div class="progress"><div class="bar" style="width:${s.pct}%"></div></div><div class="space"><span class="muted">تقدم القائمة</span><b>${s.pct}%</b></div></div><div class="v53-playlist-stats"><div class="v53-playlist-stat"><b>${s.total}</b><small>فيديو</small></div><div class="v53-playlist-stat"><b>${s.done}</b><small>مكتمل</small></div><div class="v53-playlist-stat"><b>${s.minutes || 0}</b><small>دقيقة</small></div></div><div class="v53-playlist-actions"><button class="btn" data-action="openPlaylistGroup" data-group="${esc(g.id)}" data-video="${esc(s.next?.id || "")}">▶ فتح القائمة</button><button class="btn secondary" data-action="openPlaylistGroup" data-group="${esc(g.id)}">عرض الفيديوهات</button></div></div></div>`;
          }
          const v53OldCard = cardKnowledge;
          cardKnowledge = function (x) {
            if (x.isPlaylistItem && x.playlistGroupId) {
              const groups = v53PlaylistGroups();
              const g = groups[x.playlistGroupId];
              if (!g) return "";
              const first = g.items[0];
              if (first && first.id === x.id) return v53PlaylistCard(g);
              return "";
            }
            return v53OldCard(x);
          };
          function v53Embed(k) {
            const yid =
              k.youtubeVideoId || youtubeIdFromUrl(k.mediaUrl || k.link || "");
            if (!yid)
              return `<div class="empty">لا يوجد رابط فيديو صالح.</div>`;
            if (isLocalOrContentContext())
              return `<div class="v53-local-note"><div><h3>يوتيوب لن يعمل من الملف المحلي</h3><p>القائمة مستوردة صح، لكن التشغيل الداخلي يحتاج فتح المشروع من رابط GitHub Pages HTTPS وليس content:// على الموبايل.</p><button class="btn" data-action="openExternal" data-url="${esc(youtubeWatchUrl(yid, k.mediaUrl || k.link || ""))}">فتح على YouTube</button></div></div>`;
            return `<div class="player-frame-wrap v2"><iframe src="${esc(youtubeEmbedUrl(yid))}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div>`;
          }
          function v53VideoRow(v, activeId) {
            const p = knowledgeProgress(v),
              done = v.status === "done" || p >= 100;
            return `<div class="v53-video-row ${v.id === activeId ? "active" : ""}"><img class="v53-video-thumb" src="${esc(v.cover || "")}" onerror="this.style.display='none'"><div><h4>${done ? "✅ " : ""}${esc(v.title)}</h4><p>${v.playlistIndex || ""}/${v.playlistTotal || ""} • ${p}% • ${Number(v.totalUnits || v.totalMinutes || 0)} دقيقة</p></div><button class="btn mini secondary" data-action="openPlaylistGroup" data-group="${esc(v.playlistGroupId)}" data-video="${esc(v.id)}">فتح</button></div>`;
          }
          Actions.openPlaylistGroup = function (groupId, videoId) {
            const g = v53PlaylistGroups()[groupId];
            if (!g) return toast("القائمة غير موجودة");
            const s = v53GroupStats(g);
            const selected =
              g.items.find((x) => x.id === videoId) || s.next || g.items[0];
            $("modal").classList.add("player-mode");
            openModal(
              "Playlist Player",
              `<div class="player-head"><div class="player-title"><h3>${esc(g.title)}</h3><p><span class="v52-playlist-badge">${s.done}/${s.total} مكتمل</span> <span class="v52-playlist-badge">${s.pct}% من القائمة</span></p></div><div class="row"><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div><div class="v53-playlist-modal"><div><h3 class="v53-player-title">${esc(selected.title)}</h3><div class="v53-watchbox" id="v53WatchBox">${v53Embed(selected)}</div><div class="item"><b>تقدم الفيديو</b><div class="v52-video-progress"><div><label>وصلت لدقيقة</label><input id="videoCurrent" type="number" value="${Number(selected.currentUnit || selected.currentMinute || 0)}"></div><div><label>إجمالي الدقائق</label><input id="videoTotal" type="number" value="${Number(selected.totalUnits || selected.totalMinutes || 0)}"></div></div><div class="v46-progress-line"><i style="width:${knowledgeProgress(selected)}%"></i></div><div class="row" style="margin-top:10px"><button class="btn" data-action="saveVideoProgress" data-id="${selected.id}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${selected.id}">أنهيت الفيديو</button><button class="btn secondary" data-action="playerToAction" data-id="${selected.id}">حوّل لإجراء</button></div></div></div><aside class="card"><h3>فيديوهات القائمة</h3><div class="v53-playlist-list">${g.items.map((v) => v53VideoRow(v, selected.id)).join("")}</div></aside></div>`,
            );
          };
          const v53OldComplete = Actions.completeVideoItem;
          Actions.completeVideoItem = function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            const gid = k?.playlistGroupId;
            v53OldComplete(id);
            if (gid) {
              const g = v53PlaylistGroups()[gid];
              if (g) {
                const s = v53GroupStats(g);
                if (s.pct < 100) {
                  setTimeout(
                    () => Actions.openPlaylistGroup(gid, s.next?.id),
                    250,
                  );
                }
              }
            }
          };
          toast("V53 جاهز: قوائم YouTube أصبحت مجمعة واحترافية");
        })();

        /* ===== V54: Playlist open fix + real filters + selective reset ===== */
        (function () {
          const v54Style = document.createElement("style");
          v54Style.textContent = `
  .v54-filter-tabs{display:flex;gap:8px;overflow-x:auto;padding:6px 0 12px;scrollbar-width:none}.v54-filter-tabs::-webkit-scrollbar{display:none}
  .v54-filter-chip{white-space:nowrap!important;word-break:keep-all!important;min-width:max-content;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.11);background:rgba(255,255,255,.055);color:var(--soft);font-weight:800;line-height:1.2}
  .v54-filter-chip.active{background:linear-gradient(135deg,rgba(139,92,246,.38),rgba(236,72,153,.22));border-color:rgba(236,72,153,.38);box-shadow:0 12px 28px rgba(139,92,246,.18)}
  .v54-section-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:8px 0 12px}.v54-section-head h3{margin:0}.v54-section-head small{color:var(--muted)}
  .v54-reset-box{border:1px solid rgba(239,68,68,.25)!important;background:linear-gradient(180deg,rgba(239,68,68,.08),rgba(255,255,255,.03))!important}.v54-reset-box h3{color:#fecaca}.v54-reset-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v54-reset-warning{padding:12px;border-radius:16px;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.22);color:#fde68a;line-height:1.7;font-size:12px}.v54-reset-list{max-height:220px;overflow:auto;display:grid;gap:8px;margin-top:10px}.v54-mini-danger{background:rgba(239,68,68,.14)!important;border-color:rgba(239,68,68,.28)!important;color:#fecaca!important}
  .v54-playlist-empty{padding:16px;border-radius:18px;border:1px dashed rgba(255,255,255,.16);color:var(--muted);text-align:center;line-height:1.7}.v54-playlist-note{font-size:12px;color:var(--muted);line-height:1.7;margin-top:8px}
  @media(max-width:620px){.v54-reset-grid{grid-template-columns:1fr}.v54-filter-chip{font-size:13px;padding:9px 12px}.v54-section-head{align-items:flex-start;flex-direction:column}}
  `;
          document.head.appendChild(v54Style);

          function v54IsDone(x) {
            return (
              x &&
              (x.status === "done" ||
                Number(x.progress || 0) >= 100 ||
                x.finished)
            );
          }
          function v54Groups() {
            const groups = {};
            active(state.knowledge)
              .filter((x) => x.isPlaylistItem && x.playlistGroupId)
              .forEach((x) => {
                const id = String(x.playlistGroupId || "");
                if (!id) return;
                if (!groups[id])
                  groups[id] = {
                    id,
                    title: x.playlistGroup || "Playlist",
                    url: x.playlistUrl || "",
                    items: [],
                  };
                groups[id].items.push(x);
              });
            Object.values(groups).forEach((g) =>
              g.items.sort(
                (a, b) =>
                  Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0),
              ),
            );
            return groups;
          }
          function v54GroupStats(g) {
            const total = g.items.length;
            const done = g.items.filter(v54IsDone).length;
            const minutes = g.items.reduce(
              (s, x) => s + Number(x.totalUnits || x.totalMinutes || 0),
              0,
            );
            const pct = total ? Math.round((done / total) * 100) : 0;
            const next = g.items.find((x) => !v54IsDone(x)) || g.items[0];
            return { total, done, minutes, pct, next };
          }
          function v54SortedItems(g, activeId) {
            return [...(g.items || [])].sort((a, b) => {
              if (a.id === activeId) return -1;
              if (b.id === activeId) return 1;
              const da = v54IsDone(a),
                db = v54IsDone(b);
              if (da !== db) return da ? 1 : -1;
              return (
                Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0)
              );
            });
          }
          function v54VideoId(k) {
            return (
              k.youtubeVideoId || youtubeIdFromUrl(k.mediaUrl || k.link || "")
            );
          }
          function v54VideoEmbed(k) {
            const yid = v54VideoId(k);
            if (!yid)
              return `<div class="empty">لا يوجد رابط فيديو صالح.</div>`;
            if (isLocalOrContentContext())
              return `<div class="v53-local-note"><div><h3>القائمة مستوردة، لكن التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتحه من GitHub Pages لتشغيل YouTube داخل المشروع، أو افتح الفيديو خارجيًا.</p><button class="btn" data-action="openExternal" data-url="${esc(youtubeWatchUrl(yid, k.mediaUrl || k.link || ""))}">فتح على YouTube</button></div></div>`;
            return `<div class="player-frame-wrap v2"><iframe src="${esc(youtubeEmbedUrl(yid))}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v54-playlist-note">لو فيديو معيّن لم يعمل، فغالبًا صاحبه مانع التضمين، لكن باقي فيديوهات القائمة ستعمل عادي.</div>`;
          }
          function v54VideoRow(v, activeId) {
            const p = knowledgeProgress(v),
              done = v54IsDone(v);
            return `<div class="v53-video-row ${v.id === activeId ? "active" : ""}"><img class="v53-video-thumb" src="${esc(v.cover || "")}" onerror="this.style.display='none'"><div><h4>${done ? "✅ " : ""}${esc(v.title)}</h4><p>${v.playlistIndex || ""}/${v.playlistTotal || ""} • ${p}% • ${Number(v.totalUnits || v.totalMinutes || 0)} دقيقة</p></div><button class="btn mini secondary" data-action="openPlaylistGroup" data-group="${esc(v.playlistGroupId)}" data-video="${esc(v.id)}">فتح</button></div>`;
          }

          Actions.openPlaylistGroup = function (_, btn) {
            const groupId = String(btn?.dataset?.group || _ || "");
            const videoId = String(btn?.dataset?.video || "");
            const g = v54Groups()[groupId];
            if (!g) {
              toast("القائمة غير موجودة");
              return;
            }
            const s = v54GroupStats(g);
            const selected =
              g.items.find((x) => x.id === videoId) || s.next || g.items[0];
            $("modal").classList.add("player-mode");
            openModal(
              "Playlist Player",
              `<div class="player-head"><div class="player-title"><h3>${esc(g.title)}</h3><p><span class="v52-playlist-badge">${s.done}/${s.total} مكتمل</span> <span class="v52-playlist-badge">${s.pct}% من القائمة</span></p></div><div class="row"><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div><div class="v53-playlist-modal"><div><h3 class="v53-player-title">${esc(selected.title)}</h3><div class="v53-watchbox" id="v53WatchBox">${v54VideoEmbed(selected)}</div><div class="item"><b>تقدم الفيديو</b><div class="v52-video-progress"><div><label>وصلت لدقيقة</label><input id="videoCurrent" type="number" value="${Number(selected.currentUnit || selected.currentMinute || 0)}"></div><div><label>إجمالي الدقائق</label><input id="videoTotal" type="number" value="${Number(selected.totalUnits || selected.totalMinutes || 0)}"></div></div><div class="v46-progress-line"><i style="width:${knowledgeProgress(selected)}%"></i></div><div class="row" style="margin-top:10px"><button class="btn" data-action="saveVideoProgress" data-id="${selected.id}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${selected.id}">أنهيت الفيديو</button><button class="btn secondary" data-action="playerToAction" data-id="${selected.id}">حوّل لإجراء</button></div></div></div><aside class="card"><h3>فيديوهات القائمة</h3><div class="v53-playlist-list">${
                v54SortedItems(g, selected.id)
                  .map((v) => v54VideoRow(v, selected.id))
                  .join("") ||
                '<div class="v54-playlist-empty">لا توجد فيديوهات داخل القائمة.</div>'
              }</div></aside></div>`,
            );
          };

          const v54OldComplete = Actions.completeVideoItem;
          Actions.completeVideoItem = function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            const gid = k?.playlistGroupId;
            if (v54OldComplete) v54OldComplete(id);
            if (gid) {
              const g = v54Groups()[gid];
              if (g) {
                const s = v54GroupStats(g);
                setTimeout(
                  () =>
                    Actions.openPlaylistGroup("", {
                      dataset: { group: gid, video: s.next?.id || "" },
                    }),
                  250,
                );
              }
            }
          };

          function v54FilterMatch(k, filter) {
            if (!filter || filter === "all") return true;
            const t = String(k.type || "");
            if (filter === "reviews") return false;
            if (filter === "book") return t.includes("كتاب");
            if (filter === "podcast") return t.includes("بودكاست");
            if (filter === "video")
              return (
                t.includes("فيديو") ||
                t.includes("دورة") ||
                t.includes("محاضرة") ||
                k.isPlaylistItem
              );
            if (filter === "course") return t.includes("دورة");
            if (filter === "article") return t.includes("مقال");
            if (filter === "playlist") return !!k.isPlaylistItem;
            return true;
          }
          function v54FilterChips(dueCount) {
            const f = state.settings.knowledgeFilter || "all";
            const items = [
              ["all", "الكل"],
              ["book", "كتب"],
              ["podcast", "بودكاست"],
              ["video", "فيديوهات"],
              ["course", "دورات"],
              ["article", "مقالات"],
              ["playlist", "قوائم YouTube"],
              ["reviews", `${dueCount || 0} مراجعة مستحقة`],
            ];
            return `<div class="v54-filter-tabs">${items.map(([id, label]) => `<button class="v54-filter-chip ${f === id ? "active" : ""}" data-action="setKnowledgeFilter" data-filter="${id}">${esc(label)}</button>`).join("")}</div>`;
          }
          Actions.setKnowledgeFilter = function (_, btn) {
            state.settings.knowledgeFilter = btn?.dataset?.filter || "all";
            save();
            render();
          };
          viewKnowledge = function () {
            setTitle(
              "المعرفة الذكية",
              "اختار فلتر واضح: كتب، فيديوهات، قوائم، مراجعات.",
            );
            const due = (state.reviews || []).filter(
              (r) =>
                String(r.date || "") <= v46Today() &&
                (r.type || "").includes("Knowledge"),
            );
            const filter = state.settings.knowledgeFilter || "all";
            let items = active(state.knowledge);
            if (filter === "reviews") items = [];
            else items = items.filter((k) => v54FilterMatch(k, filter));
            const visible = items.map(cardKnowledge).filter(Boolean).join("");
            const titleMap = {
              all: "كل المعرفة",
              book: "الكتب",
              podcast: "البودكاست",
              video: "الفيديوهات والمحاضرات",
              course: "الدورات",
              article: "المقالات",
              playlist: "قوائم YouTube",
              reviews: "مراجعات مستحقة",
            };
            return `<div class="v54-section-head"><div><h3>${esc(titleMap[filter] || "المعرفة")}</h3><small>${filter === "reviews" ? due.length : items.length} عنصر</small></div><button class="btn" data-action="addKnowledge">إضافة معرفة</button></div>${v54FilterChips(due.length)}${filter === "reviews" || due.length ? `<div class="card v46-smart-card"><h3>مراجعات معرفة مستحقة اليوم</h3><div class="list">${due.map((r) => `<div class="item"><b>${esc(r.title)}</b><p>${esc(r.done || "راجع الملخص، الإجراء، النتيجة، والدرس.")}</p><span class="pill">${esc(r.date)}</span></div>`).join("") || '<div class="empty">لا توجد مراجعات مستحقة الآن.</div>'}</div></div>` : ""}${filter === "reviews" ? "" : `<div class="grid"><div class="card col-12"><div class="list">${visible || '<div class="empty">لا توجد عناصر في هذا الفلتر.</div>'}</div></div></div>`}`;
          };

          const v54OldSettings = viewSettings;
          function v54PlaylistOptions() {
            return Object.values(v54Groups())
              .map(
                (g) =>
                  `<option value="playlist:${esc(g.id)}">قائمة: ${esc(g.title)} (${g.items.length})</option>`,
              )
              .join("");
          }
          function v54KnowledgeOptions() {
            return active(state.knowledge)
              .filter((x) => !x.isPlaylistItem)
              .map(
                (k) =>
                  `<option value="knowledge:${esc(k.id)}">عنصر معرفة: ${esc(k.title)}</option>`,
              )
              .join("");
          }
          viewSettings = function () {
            let html = v54OldSettings();
            const resetCard = `<div class="card col-12 v54-reset-box"><h3>منطقة التصفير الذكي</h3><p class="muted">احذف جزء محدد بدل تصفير المشروع كله. اختر النوع ثم اضغط تنفيذ. يوجد تحذير قبل أي حذف.</p><div class="v54-reset-grid"><div><label>ماذا تريد حذف؟</label><select id="v54ResetTarget"><option value="">اختر...</option><option value="all">كل المشروع</option><option value="knowledgeAll">كل المعرفة</option><option value="videosAll">كل الفيديوهات والقوائم</option><option value="playlistsAll">كل قوائم YouTube فقط</option><option value="archive">الأرشيف فقط</option><option value="contacts">العلاقات فقط</option>${v54PlaylistOptions()}${v54KnowledgeOptions()}</select></div><div class="v54-reset-warning">⚠️ هذه العملية لا يمكن التراجع عنها إلا لو عندك Export Backup. اعمل نسخة احتياطية قبل الحذف.</div></div><div class="row" style="margin-top:12px"><button class="btn secondary" data-action="exportData">Export Backup</button><button class="btn danger" data-action="v54ResetSelected">تنفيذ الحذف المحدد</button></div></div>`;
            return html.replace(/<\/div>\s*$/, resetCard + "</div>");
          };
          Actions.v54ResetSelected = function () {
            const target = get("v54ResetTarget");
            if (!target) {
              toast("اختر ما تريد حذفه أولًا");
              return;
            }
            const label = (
              $("v54ResetTarget")?.selectedOptions?.[0]?.textContent || target
            ).trim();
            if (
              !confirm("تحذير: سيتم حذف " + label + " نهائيًا. هل أنت متأكد؟")
            )
              return;
            if (!confirm("تأكيد أخير: هل تريد تنفيذ الحذف الآن؟")) return;
            if (target === "all") {
              localStorage.removeItem(KEY);
              state = seed();
              route = "home";
              render();
              toast("تم تصفير المشروع بالكامل");
              return;
            }
            if (target === "knowledgeAll") state.knowledge = [];
            else if (target === "videosAll")
              state.knowledge = state.knowledge.filter(
                (k) => !(v54FilterMatch(k, "video") || k.isPlaylistItem),
              );
            else if (target === "playlistsAll")
              state.knowledge = state.knowledge.filter(
                (k) => !k.isPlaylistItem,
              );
            else if (target === "archive") state.archive = [];
            else if (target === "contacts") state.contacts = [];
            else if (target.startsWith("playlist:")) {
              const id = target.split(":")[1];
              state.knowledge = state.knowledge.filter(
                (k) => k.playlistGroupId !== id,
              );
            } else if (target.startsWith("knowledge:")) {
              const id = target.split(":")[1];
              state.knowledge = state.knowledge.filter((k) => k.id !== id);
            }
            save();
            render();
            toast("تم الحذف المحدد");
          };

          toast("V54 جاهز: فتح القوائم + الفلاتر + التصفير الذكي");
        })();

        /* ===== V55: HTTPS Video Clarifier + Clean Reviews Hub + Stable Playlist Player ===== */
        (function () {
          const v55Style = document.createElement("style");
          v55Style.textContent = `
  .v55-review-entry{margin:0 0 12px}.v55-review-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:14px 16px;border-radius:22px;background:linear-gradient(135deg,rgba(139,92,246,.20),rgba(236,72,153,.11));border:1px solid rgba(255,255,255,.10);color:#fff;font-weight:900}.v55-review-toggle strong{font-size:15px}.v55-review-toggle span{font-size:12px;color:var(--muted)}
  .v55-filter-tabs{display:flex;gap:8px;overflow-x:auto;padding:6px 0 12px;scrollbar-width:none;-webkit-overflow-scrolling:touch}.v55-filter-tabs::-webkit-scrollbar{display:none}
  .v55-filter-chip{flex:0 0 auto!important;white-space:nowrap!important;word-break:normal!important;overflow-wrap:normal!important;min-width:max-content!important;padding:10px 14px;border-radius:999px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.055);color:var(--soft);font-weight:900;line-height:1.2;text-align:center}.v55-filter-chip.active{background:linear-gradient(135deg,rgba(139,92,246,.42),rgba(236,72,153,.24));border-color:rgba(236,72,153,.40);box-shadow:0 12px 28px rgba(139,92,246,.18)}
  .v55-https-card{height:100%;min-height:330px;display:grid;place-items:center;text-align:center;padding:24px;border-radius:24px;border:1px dashed rgba(245,158,11,.38);background:radial-gradient(circle at top,rgba(245,158,11,.12),transparent 52%),rgba(0,0,0,.18);color:#fde68a}.v55-https-card h3{font-size:24px;margin:0 0 10px;color:#fff}.v55-https-card p{max-width:520px;line-height:1.9;margin:0 0 16px;color:#fde68a}.v55-mini{font-size:11px;color:var(--muted);line-height:1.6;margin-top:8px}
  .v55-review-list{display:grid;gap:10px}.v55-review-card{padding:14px;border:1px solid rgba(255,255,255,.08);border-radius:20px;background:rgba(255,255,255,.045)}
  @media(max-width:620px){.v55-filter-chip{font-size:13px;padding:9px 12px}.v55-review-toggle{border-radius:18px;padding:12px}.v55-https-card{min-height:300px;padding:20px}.v55-https-card h3{font-size:20px}}
  `;
          document.head.appendChild(v55Style);

          function v55DueReviews() {
            const today =
              typeof v46Today === "function"
                ? v46Today()
                : new Date().toISOString().slice(0, 10);
            return (state.reviews || []).filter(
              (r) =>
                String(r.date || "") <= today &&
                (String(r.type || "").includes("Knowledge") ||
                  String(r.title || "").includes("مراجعة معرفة")),
            );
          }
          function v55FilterMatch(k, filter) {
            if (!filter || filter === "all") return true;
            const t = String(k.type || "");
            if (filter === "reviews") return false;
            if (filter === "book") return t.includes("كتاب");
            if (filter === "podcast") return t.includes("بودكاست");
            if (filter === "video")
              return (
                (t.includes("فيديو") || t.includes("محاضرة")) &&
                !k.isPlaylistItem
              );
            if (filter === "course") return t.includes("دورة");
            if (filter === "article") return t.includes("مقال");
            if (filter === "playlist") return !!k.isPlaylistItem;
            return true;
          }
          function v55FilterChips(dueCount) {
            const f = state.settings.knowledgeFilter || "all";
            const items = [
              ["all", "الكل"],
              ["book", "كتب"],
              ["playlist", "قوائم YouTube"],
              ["video", "فيديوهات"],
              ["course", "دورات"],
              ["podcast", "بودكاست"],
              ["article", "مقالات"],
            ];
            return `<div class="v55-filter-tabs">${items.map(([id, label]) => `<button class="v55-filter-chip ${f === id ? "active" : ""}" data-action="setKnowledgeFilter" data-filter="${id}">${esc(label)}</button>`).join("")}</div>`;
          }
          function v55ReviewButton(dueCount) {
            return `<div class="v55-review-entry"><button class="v55-review-toggle" data-action="setKnowledgeFilter" data-filter="reviews"><strong>🧠 مراجعات مستحقة اليوم</strong><span>${dueCount} مراجعة</span></button></div>`;
          }
          function v55ReviewList(due) {
            return `<div class="card v46-smart-card"><h3>مراجعات معرفة مستحقة اليوم</h3><div class="v55-review-list">${due.map((r) => `<div class="v55-review-card"><b>${esc(r.title)}</b><p class="muted">${esc(r.done || "راجع الملخص، الإجراء، النتيجة، والدرس.")}</p><span class="pill">${esc(r.date || "")}</span></div>`).join("") || '<div class="empty">لا توجد مراجعات مستحقة الآن.</div>'}</div></div>`;
          }

          viewKnowledge = function () {
            setTitle(
              "المعرفة الذكية",
              "كتب، قوائم، فيديوهات، ومراجعات بدون زحمة.",
            );
            const due = v55DueReviews();
            const filter = state.settings.knowledgeFilter || "all";
            let items = active(state.knowledge);
            if (filter === "reviews") items = [];
            else items = items.filter((k) => v55FilterMatch(k, filter));
            const visible = items.map(cardKnowledge).filter(Boolean).join("");
            const titleMap = {
              all: "كل المعرفة",
              book: "الكتب",
              playlist: "قوائم YouTube",
              video: "الفيديوهات",
              course: "الدورات",
              podcast: "البودكاست",
              article: "المقالات",
              reviews: "مراجعات مستحقة",
            };
            return `<div class="v54-section-head"><div><h3>${esc(titleMap[filter] || "المعرفة")}</h3><small>${filter === "reviews" ? due.length : items.length} عنصر</small></div><button class="btn" data-action="addKnowledge">إضافة معرفة</button></div>${v55ReviewButton(due.length)}${v55FilterChips(due.length)}${filter === "reviews" ? v55ReviewList(due) : `<div class="grid"><div class="card col-12"><div class="list">${visible || '<div class="empty">لا توجد عناصر في هذا الفلتر.</div>'}</div></div></div>`}`;
          };

          function v55VideoId(k) {
            return (
              k.youtubeVideoId || youtubeIdFromUrl(k.mediaUrl || k.link || "")
            );
          }
          function v55WatchUrl(yid, k) {
            return youtubeWatchUrl
              ? youtubeWatchUrl(yid, k.mediaUrl || k.link || "")
              : `https://www.youtube.com/watch?v=${encodeURIComponent(yid)}`;
          }
          function v55VideoEmbed(k) {
            const yid = v55VideoId(k);
            if (!yid)
              return `<div class="empty">لا يوجد رابط فيديو صالح.</div>`;
            if (isLocalOrContentContext()) {
              return `<div class="v55-https-card"><div><h3>الفيديوهات لن تعمل داخليًا من ملف محلي</h3><p>أنت فاتح المشروع من <b>content://</b>. تشغيل YouTube داخل المشروع يحتاج أن تفتح النسخة المنشورة على GitHub Pages برابط <b>https://</b>. من الملف المحلي سيظهر Error 153 أو يتم منع التشغيل.</p><button class="btn" data-action="openExternal" data-url="${esc(v55WatchUrl(yid, k))}">فتح على YouTube</button><div class="v55-mini">ارفع هذه النسخة كـ index.html وافتح: https://ahmedmogahed2020.github.io/Mogahed-OS/</div></div></div>`;
            }
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe src="${esc(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v54-playlist-note">لو فيديو معيّن لم يعمل رغم فتح المشروع من HTTPS، فغالبًا صاحب الفيديو مانع التضمين. باقي الفيديوهات المسموح بها ستعمل عادي.</div>`;
          }
          function v55IsDone(x) {
            return (
              x &&
              (x.status === "done" ||
                Number(x.progress || 0) >= 100 ||
                x.finished)
            );
          }
          function v55Groups() {
            const groups = {};
            active(state.knowledge)
              .filter((x) => x.isPlaylistItem && x.playlistGroupId)
              .forEach((x) => {
                const id = String(x.playlistGroupId || "");
                if (!id) return;
                if (!groups[id])
                  groups[id] = {
                    id,
                    title: x.playlistGroup || "Playlist",
                    url: x.playlistUrl || "",
                    items: [],
                  };
                groups[id].items.push(x);
              });
            Object.values(groups).forEach((g) =>
              g.items.sort(
                (a, b) =>
                  Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0),
              ),
            );
            return groups;
          }
          function v55Stats(g) {
            const total = g.items.length,
              done = g.items.filter(v55IsDone).length,
              pct = total ? Math.round((done / total) * 100) : 0,
              next = g.items.find((x) => !v55IsDone(x)) || g.items[0];
            return { total, done, pct, next };
          }
          function v55Sorted(g, activeId) {
            return [...g.items].sort((a, b) => {
              if (a.id === activeId) return -1;
              if (b.id === activeId) return 1;
              const da = v55IsDone(a),
                db = v55IsDone(b);
              if (da !== db) return da ? 1 : -1;
              return (
                Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0)
              );
            });
          }
          function v55VideoRow(v, activeId) {
            const p = knowledgeProgress(v),
              done = v55IsDone(v);
            return `<div class="v53-video-row ${v.id === activeId ? "active" : ""}"><img class="v53-video-thumb" src="${esc(v.cover || "")}" onerror="this.style.display='none'"><div><h4>${done ? "✅ " : ""}${esc(v.title)}</h4><p>${v.playlistIndex || ""}/${v.playlistTotal || ""} • ${p}% • ${Number(v.totalUnits || v.totalMinutes || 0)} دقيقة</p></div><button class="btn mini secondary" data-action="openPlaylistGroup" data-group="${esc(v.playlistGroupId)}" data-video="${esc(v.id)}">فتح</button></div>`;
          }

          Actions.openPlaylistGroup = function (_, btn) {
            const groupId = String(btn?.dataset?.group || _ || "");
            const videoId = String(btn?.dataset?.video || "");
            const g = v55Groups()[groupId];
            if (!g) {
              toast("القائمة غير موجودة");
              return;
            }
            const s = v55Stats(g);
            const selected =
              g.items.find((x) => x.id === videoId) || s.next || g.items[0];
            $("modal").classList.add("player-mode");
            openModal(
              "Playlist Player",
              `<div class="player-head"><div class="player-title"><h3>${esc(g.title)}</h3><p><span class="v52-playlist-badge">${s.done}/${s.total} مكتمل</span> <span class="v52-playlist-badge">${s.pct}% من القائمة</span></p></div><div class="row"><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div><div class="v53-playlist-modal"><div><h3 class="v53-player-title">${esc(selected.title)}</h3><div class="v53-watchbox" id="v53WatchBox">${v55VideoEmbed(selected)}</div><div class="item"><b>تقدم الفيديو</b><div class="v52-video-progress"><div><label>وصلت لدقيقة</label><input id="videoCurrent" type="number" value="${Number(selected.currentUnit || selected.currentMinute || 0)}"></div><div><label>إجمالي الدقائق</label><input id="videoTotal" type="number" value="${Number(selected.totalUnits || selected.totalMinutes || 0)}"></div></div><div class="v46-progress-line"><i style="width:${knowledgeProgress(selected)}%"></i></div><div class="row" style="margin-top:10px"><button class="btn" data-action="saveVideoProgress" data-id="${selected.id}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${selected.id}">أنهيت الفيديو</button><button class="btn secondary" data-action="playerToAction" data-id="${selected.id}">حوّل لإجراء</button></div></div></div><aside class="card"><h3>فيديوهات القائمة</h3><div class="v53-playlist-list">${
                v55Sorted(g, selected.id)
                  .map((v) => v55VideoRow(v, selected.id))
                  .join("") ||
                '<div class="v54-playlist-empty">لا توجد فيديوهات داخل القائمة.</div>'
              }</div></aside></div>`,
            );
          };

          /* ===== V56: Auto Video Progress + Timed Notes + Completed Playlist Wins ===== */
          (function () {
            const v56Style = document.createElement("style");
            v56Style.textContent = `
  .v56-player-tools{display:grid;gap:12px;margin-top:12px}
  .v56-note-box,.v56-summary-box{padding:14px;border-radius:20px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04)}
  .v56-note-list{display:grid;gap:8px;margin-top:10px;max-height:260px;overflow:auto;padding-inline-end:2px}
  .v56-note-item{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:10px;border-radius:15px;background:rgba(255,255,255,.045);border:1px solid rgba(255,255,255,.07)}
  .v56-time{display:inline-flex;align-items:center;justify-content:center;min-width:58px;padding:6px 8px;border-radius:999px;background:rgba(59,130,246,.14);border:1px solid rgba(59,130,246,.24);color:#bfdbfe;font-size:12px}
  .v56-note-text{color:var(--soft);line-height:1.6;white-space:pre-wrap;word-break:break-word}
  .v56-completed-playlists{display:grid;gap:10px}.v56-win-playlist{padding:13px;border-radius:18px;border:1px solid rgba(250,204,21,.18);background:linear-gradient(135deg,rgba(250,204,21,.10),rgba(255,255,255,.035))}
  .v56-win-playlist h4{margin:0 0 6px}.v56-win-playlist p{margin:0 0 10px;color:var(--muted);line-height:1.6}.v56-auto-badge{display:inline-flex;gap:6px;align-items:center;padding:6px 9px;border-radius:999px;background:rgba(34,197,94,.08);border:1px solid rgba(34,197,94,.18);color:#bbf7d0;font-size:11px;margin-top:8px}
  @media(max-width:1020px){.v56-note-item{grid-template-columns:1fr}.v56-time{width:max-content}.v56-player-tools textarea{min-height:90px}}
  `;
            document.head.appendChild(v56Style);

            let v56Player = null,
              v56Timer = null,
              v56ActiveVideoId = null,
              v56YTReadyPromise = null;
            function v56AllKnowledge() {
              return state.knowledge || [];
            }
            function v56GroupItems(groupId) {
              return v56AllKnowledge().filter(
                (x) =>
                  x.isPlaylistItem &&
                  String(x.playlistGroupId || "") === String(groupId || ""),
              );
            }
            function v56GroupsAll() {
              const groups = {};
              v56AllKnowledge()
                .filter((x) => x.isPlaylistItem && x.playlistGroupId)
                .forEach((x) => {
                  const id = String(x.playlistGroupId);
                  if (!groups[id])
                    groups[id] = {
                      id,
                      title: x.playlistGroup || "Playlist",
                      url: x.playlistUrl || "",
                      items: [],
                    };
                  groups[id].items.push(x);
                });
              Object.values(groups).forEach((g) =>
                g.items.sort(
                  (a, b) =>
                    Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0),
                ),
              );
              return groups;
            }
            function v56IsDone(x) {
              return (
                x &&
                (x.status === "done" ||
                  Number(x.progress || 0) >= 100 ||
                  x.finished)
              );
            }
            function v56GroupDone(g) {
              return g && g.items.length && g.items.every(v56IsDone);
            }
            function v56CompletedGroups() {
              return Object.values(v56GroupsAll()).filter(
                (g) => g.items.some((x) => x.playlistHidden) || v56GroupDone(g),
              );
            }
            function v56VisibleGroups() {
              const groups = v55Groups ? v55Groups() : v56GroupsAll();
              Object.values(groups).forEach((g) => {
                g.items = g.items.filter((x) => !x.playlistHidden);
              });
              return Object.fromEntries(
                Object.values(groups)
                  .filter((g) => g.items.length)
                  .map((g) => [g.id, g]),
              );
            }
            function v56Fmt(sec) {
              sec = Math.max(0, Math.floor(Number(sec || 0)));
              const m = Math.floor(sec / 60),
                s = sec % 60;
              return (
                String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0")
              );
            }
            function v56WatchUrl(id, k) {
              return youtubeWatchUrl
                ? youtubeWatchUrl(id, k.mediaUrl || k.link || "")
                : `https://www.youtube.com/watch?v=${encodeURIComponent(id)}`;
            }
            function v56EnsureYT() {
              if (window.YT && window.YT.Player)
                return Promise.resolve(window.YT);
              if (v56YTReadyPromise) return v56YTReadyPromise;
              v56YTReadyPromise = new Promise((resolve) => {
                const old = window.onYouTubeIframeAPIReady;
                window.onYouTubeIframeAPIReady = function () {
                  try {
                    if (typeof old === "function") old();
                  } catch (e) {}
                  resolve(window.YT);
                };
                if (
                  !document.querySelector(
                    'script[src="https://www.youtube.com/iframe_api"]',
                  )
                ) {
                  const s = document.createElement("script");
                  s.src = "https://www.youtube.com/iframe_api";
                  document.head.appendChild(s);
                }
                setTimeout(() => {
                  if (window.YT && window.YT.Player) resolve(window.YT);
                }, 2500);
              });
              return v56YTReadyPromise;
            }
            function v56StopTracking() {
              if (v56Timer) clearInterval(v56Timer);
              v56Timer = null;
              try {
                if (v56Player && v56Player.destroy) v56Player.destroy();
              } catch (e) {}
              v56Player = null;
              v56ActiveVideoId = null;
            }
            const v56OldClose = Actions.closeModal;
            Actions.closeModal = function () {
              v56StopTracking();
              if (v56OldClose) return v56OldClose();
              $("modal").classList.remove("open", "player-mode");
            };
            function v56PersistVideo(id) {
              const k = state.knowledge.find((x) => x.id === id);
              if (!k || !v56Player || !v56Player.getCurrentTime) return;
              let sec = 0,
                dur = 0;
              try {
                sec = v56Player.getCurrentTime() || 0;
                dur = v56Player.getDuration() || 0;
              } catch (e) {
                return;
              }
              const currentMin = Math.max(
                Number(k.currentUnit || k.currentMinute || 0),
                Math.floor(sec / 60),
              );
              const totalMin = Math.max(
                Number(k.totalUnits || k.totalMinutes || 0),
                Math.ceil(dur / 60) || 0,
              );
              k.currentUnit = k.currentMinute = currentMin;
              if (totalMin) {
                k.totalUnits = k.totalMinutes = totalMin;
              }
              if (k.totalUnits) {
                k.progress = Math.min(
                  100,
                  Math.round((k.currentUnit / k.totalUnits) * 100),
                );
              }
              save();
              const c = $("videoCurrent"),
                t = $("videoTotal"),
                bar = document.querySelector("#v56VideoProgressBar i");
              if (c) c.value = k.currentUnit || 0;
              if (t && k.totalUnits) t.value = k.totalUnits || 0;
              if (bar) bar.style.width = (knowledgeProgress(k) || 0) + "%";
            }
            function v56StartTracking(k) {
              v56StopTracking();
              v56ActiveVideoId = k.id;
              if (isLocalOrContentContext()) return;
              const iframe = $("v56ytframe");
              if (!iframe) return;
              v56EnsureYT().then((YT) => {
                if (!YT || !YT.Player || !$("v56ytframe")) return;
                try {
                  v56Player = new YT.Player("v56ytframe", {
                    events: {
                      onReady: function () {
                        v56PersistVideo(k.id);
                        v56Timer = setInterval(
                          () => v56PersistVideo(k.id),
                          5000,
                        );
                      },
                      onStateChange: function (e) {
                        if (e.data === 1) v56PersistVideo(k.id);
                        if (e.data === 0) {
                          v56PersistVideo(k.id);
                          Actions.completeVideoItem(k.id);
                        }
                      },
                    },
                  });
                } catch (e) {
                  console.warn("YT init failed", e);
                }
              });
            }
            function v56VideoEmbed(k) {
              const yid = v55VideoId
                ? v55VideoId(k)
                : k.youtubeVideoId ||
                  youtubeIdFromUrl(k.mediaUrl || k.link || "");
              if (!yid)
                return `<div class="empty">لا يوجد رابط فيديو صالح.</div>`;
              if (isLocalOrContentContext())
                return `<div class="v55-https-card"><div><h3>الفيديوهات لن تعمل داخليًا من ملف محلي</h3><p>افتح المشروع من GitHub Pages برابط HTTPS لتفعيل تتبع الدقائق والتشغيل الداخلي.</p><button class="btn" data-action="openExternal" data-url="${esc(v56WatchUrl(yid, k))}">فتح على YouTube</button></div></div>`;
              const start = Math.max(
                0,
                Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
              );
              const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=${encodeURIComponent(location.origin)}${start ? `&start=${start}` : ""}`;
              return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${esc(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● يحفظ الدقائق تلقائيًا كل 5 ثوانٍ أثناء التشغيل</div>`;
            }
            function v56NotesHtml(k) {
              const notes = (k.timedNotes || [])
                .slice()
                .sort(
                  (a, b) => Number(a.timeSec || 0) - Number(b.timeSec || 0),
                );
              return (
                notes
                  .map(
                    (n) =>
                      `<div class="v56-note-item"><button class="v56-time" data-action="seekVideoTime" data-time="${Number(n.timeSec || 0)}">${v56Fmt(n.timeSec)}</button><div class="v56-note-text">${esc(n.text || "")}</div><button class="btn danger mini" data-action="deleteTimedNote" data-id="${esc(k.id)}" data-note="${esc(n.id)}">حذف</button></div>`,
                  )
                  .join("") ||
                '<div class="empty">لا توجد ملاحظات موقّتة بعد.</div>'
              );
            }
            function v56VideoTools(k) {
              return `<div class="v56-player-tools"><div class="v56-note-box"><h3>ملاحظات واقتباسات مرتبطة بالوقت</h3><p class="muted">اكتب ملاحظة، وسيتم حفظ وقت الفيديو الحالي تلقائيًا. الضغط على الوقت يرجعك لنفس اللحظة.</p><textarea id="v56NoteText" placeholder="اكتب اقتباس أو ملاحظة من هذه الدقيقة..."></textarea><div class="row"><button class="btn" data-action="addTimedVideoNote" data-id="${esc(k.id)}">+ حفظ ملاحظة بالوقت الحالي</button></div><div class="v56-note-list" id="v56NotesList">${v56NotesHtml(k)}</div></div><div class="v56-summary-box"><h3>ملخص الفيديو</h3><textarea id="v56VideoSummary" placeholder="اكتب أو الصق ملخص الفيديو هنا...">${esc(k.videoSummary || "")}</textarea><div class="row"><button class="btn" data-action="saveVideoSummary" data-id="${esc(k.id)}">حفظ الملخص</button><button class="btn secondary" data-action="aiSummaryInfo">تلخيص AI</button></div><p class="muted">التلخيص الذكي الحقيقي يحتاج Transcript أو مفتاح AI. جهزت مكان الملخص والحفظ الآن، ونقدر نضيف Gemini لاحقًا.</p></div></div>`;
            }
            Actions.addTimedVideoNote = function (id) {
              const k = state.knowledge.find((x) => x.id === id);
              if (!k) return;
              const txt = ($("v56NoteText")?.value || "").trim();
              if (!txt) {
                toast("اكتب الملاحظة أولاً");
                return;
              }
              let sec = 0;
              try {
                if (v56Player && v56Player.getCurrentTime)
                  sec = Math.floor(v56Player.getCurrentTime() || 0);
              } catch (e) {}
              if (!sec)
                sec = Math.floor(
                  Number(k.currentUnit || k.currentMinute || 0) * 60,
                );
              k.timedNotes = k.timedNotes || [];
              k.timedNotes.push({
                id: uid(),
                timeSec: sec,
                text: txt,
                created: new Date().toISOString(),
              });
              save();
              if ($("v56NoteText")) $("v56NoteText").value = "";
              if ($("v56NotesList"))
                $("v56NotesList").innerHTML = v56NotesHtml(k);
              toast("تم حفظ الملاحظة مع الوقت");
            };
            Actions.deleteTimedNote = function (_, btn) {
              const k = state.knowledge.find(
                (x) => x.id === (btn?.dataset?.id || ""),
              );
              if (!k) return;
              k.timedNotes = (k.timedNotes || []).filter(
                (n) => n.id !== (btn?.dataset?.note || ""),
              );
              save();
              if ($("v56NotesList"))
                $("v56NotesList").innerHTML = v56NotesHtml(k);
            };
            Actions.seekVideoTime = function (_, btn) {
              const sec = Number(btn?.dataset?.time || 0);
              try {
                if (v56Player && v56Player.seekTo) {
                  v56Player.seekTo(sec, true);
                  v56Player.playVideo && v56Player.playVideo();
                }
              } catch (e) {}
            };
            Actions.saveVideoSummary = function (id) {
              const k = state.knowledge.find((x) => x.id === id);
              if (!k) return;
              k.videoSummary = ($("v56VideoSummary")?.value || "").trim();
              save();
              toast("تم حفظ ملخص الفيديو");
            };
            Actions.aiSummaryInfo = function () {
              toast(
                "التلخيص الذكي يحتاج ربط Gemini/Transcript. أضفناه كمرحلة جاهزة للتطوير.",
              );
            };

            function v56VideoRow(v, activeId) {
              const p = knowledgeProgress(v),
                done = v56IsDone(v);
              return `<div class="v53-video-row ${v.id === activeId ? "active" : ""}"><img class="v53-video-thumb" src="${esc(v.cover || "")}" onerror="this.style.display='none'"><div><h4>${done ? "✅ " : ""}${esc(v.title)}</h4><p>${v.playlistIndex || ""}/${v.playlistTotal || ""} • ${p}% • شاهدت ${Number(v.currentUnit || v.currentMinute || 0)} / ${Number(v.totalUnits || v.totalMinutes || 0)} دقيقة</p></div><button class="btn mini secondary" data-action="openPlaylistGroup" data-group="${esc(v.playlistGroupId)}" data-video="${esc(v.id)}">فتح</button></div>`;
            }
            Actions.openPlaylistGroup = function (_, btn) {
              const groupId = String(btn?.dataset?.group || _ || "");
              const videoId = String(btn?.dataset?.video || "");
              const g = v56VisibleGroups()[groupId] || v56GroupsAll()[groupId];
              if (!g) {
                toast("القائمة غير موجودة");
                return;
              }
              const visibleItems = (g.items || []).filter(
                (x) => !x.playlistHidden,
              );
              if (!visibleItems.length) {
                toast("القائمة مكتملة وموجودة في لوحة الفوز");
                route = "wins";
                render();
                return;
              }
              g.items = visibleItems;
              const s = v55Stats
                ? v55Stats(g)
                : {
                    done: g.items.filter(v56IsDone).length,
                    total: g.items.length,
                    pct: g.items.length
                      ? Math.round(
                          (g.items.filter(v56IsDone).length / g.items.length) *
                            100,
                        )
                      : 0,
                    next: g.items.find((x) => !v56IsDone(x)) || g.items[0],
                  };
              const selected =
                g.items.find((x) => x.id === videoId) || s.next || g.items[0];
              $("modal").classList.add("player-mode");
              openModal(
                "Playlist Player",
                `<div class="player-head"><div class="player-title"><h3>${esc(g.title)}</h3><p><span class="v52-playlist-badge">${s.done}/${s.total} مكتمل</span> <span class="v52-playlist-badge">${s.pct}% من القائمة</span></p></div></div><div class="v53-playlist-modal"><div><h3 class="v53-player-title">${esc(selected.title)}</h3><div class="v53-watchbox" id="v53WatchBox">${v56VideoEmbed(selected)}</div><div class="item"><b>تقدم الفيديو</b><div class="v52-video-progress"><div><label>وصلت لدقيقة</label><input id="videoCurrent" type="number" value="${Number(selected.currentUnit || selected.currentMinute || 0)}"></div><div><label>إجمالي الدقائق</label><input id="videoTotal" type="number" value="${Number(selected.totalUnits || selected.totalMinutes || 0)}"></div></div><div class="v46-progress-line" id="v56VideoProgressBar"><i style="width:${knowledgeProgress(selected)}%"></i></div><div class="row" style="margin-top:10px"><button class="btn" data-action="saveVideoProgress" data-id="${selected.id}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${selected.id}">أنهيت الفيديو</button><button class="btn secondary" data-action="playerToAction" data-id="${selected.id}">حوّل لإجراء</button></div></div>${v56VideoTools(selected)}</div><aside class="card"><h3>فيديوهات القائمة</h3><div class="v53-playlist-list">${(v55Sorted ? v55Sorted(g, selected.id) : g.items).map((v) => v56VideoRow(v, selected.id)).join("")}</div></aside></div>`,
              );
              setTimeout(() => v56StartTracking(selected), 500);
            };

            const v56OldComplete = Actions.completeVideoItem;
            Actions.completeVideoItem = function (id) {
              if (v56OldComplete) v56OldComplete(id);
              else {
                const k = state.knowledge.find((x) => x.id === id);
                if (k) {
                  k.status = "done";
                  k.progress = 100;
                  save();
                }
              }
              const k = state.knowledge.find((x) => x.id === id);
              const gid = k?.playlistGroupId;
              if (!gid) return;
              const items = v56GroupItems(gid);
              if (items.length && items.every(v56IsDone)) {
                items.forEach((x) => (x.playlistHidden = true));
                state.timeline = state.timeline || [];
                if (!state.timeline.some((t) => t.playlistGroupId === gid))
                  state.timeline.unshift({
                    id: uid(),
                    playlistGroupId: gid,
                    title:
                      "أنهيت قائمة: " + (items[0].playlistGroup || "Playlist"),
                    date: new Date().toISOString().slice(0, 10),
                    area: "التعلم",
                    note: "تم إكمال كل فيديوهات القائمة ونقلها إلى لوحة الفوز.",
                  });
                save();
                v56StopTracking();
                $("modal").classList.remove("open", "player-mode");
                route = "wins";
                render();
                toast("تم نقل القائمة إلى لوحة الفوز 🏆");
              }
            };
            const v56OldCard = cardKnowledge;
            cardKnowledge = function (k) {
              if (k && k.isPlaylistItem && k.playlistGroupId) {
                const items = v56GroupItems(k.playlistGroupId);
                if (items.length && items.every((x) => x.playlistHidden))
                  return "";
              }
              return v56OldCard(k);
            };
            Actions.restorePlaylistGroup = function (_, btn) {
              const gid = btn?.dataset?.group || _;
              v56GroupItems(gid).forEach((x) => {
                x.playlistHidden = false;
                if (x.status === "done") x.restoredOnce = true;
              });
              save();
              route = "knowledge";
              render();
              toast("تم إرجاع القائمة للمعرفة");
            };
            const v56OldWins = viewWins;
            viewWins = function () {
              let html = v56OldWins();
              const completed = v56CompletedGroups();
              const block = `<div class="card col-12"><h3>قوائم مكتملة يمكنك الرجوع لها</h3><div class="v56-completed-playlists">${
                completed
                  .map((g) => {
                    const done = g.items.filter(v56IsDone).length;
                    return `<div class="v56-win-playlist"><h4>📺 ${esc(g.title)}</h4><p>${done}/${g.items.length} فيديو مكتمل. يمكنك إرجاعها للمعرفة لمراجعتها مرة أخرى.</p><div class="row"><button class="btn secondary" data-action="restorePlaylistGroup" data-group="${esc(g.id)}">إرجاع للمعرفة</button><button class="btn secondary" data-action="openPlaylistGroup" data-group="${esc(g.id)}">فتح للمراجعة</button></div></div>`;
                  })
                  .join("") ||
                '<div class="empty">لا توجد قوائم مكتملة بعد.</div>'
              }</div></div>`;
              return html.replace("</div></div>", block + "</div></div>");
            };

            window.MogahedOSX_V56 = {
              getVideoTools: () => v56VideoTools,
              setVideoTools: (fn) => {
                v56VideoTools = fn;
              },
              fmt: v56Fmt,
            };
            toast(
              "V56 جاهز: حفظ دقائق تلقائي + ملاحظات بوقت الفيديو + قوائم مكتملة في الفوز",
            );
          })();

          window.MogahedOSX = {
            state,
            Actions,
            render,
            updateTimer,
            save,
            toast,
            esc,
            get,
            closeModal,
            getViewSettings: () => viewSettings,
            setViewSettings: (fn) => {
              viewSettings = fn;
            },
            setRoute: (r) => {
              route = r;
            },
            getRoute: () => route,
          };
        })();

        /* ===== V60 Stable AI Center: Claude primary + Gemini fallback ===== */
        (function () {
          const api = window.MogahedOSX || {};
          const v56api = window.MogahedOSX_V56 || {};
          const state = api.state,
            Actions = api.Actions,
            render = api.render,
            save = api.save,
            toast = api.toast,
            esc = api.esc,
            get = api.get,
            closeModal = api.closeModal;
          if (!state || !Actions || !render) {
            console.error("Mogahed OS core was not ready for V60 AI Center");
            return;
          }
          state.settings = state.settings || {};
          state.settings.ai = Object.assign(
            {
              provider: "claude",
              anthropicKey: "",
              anthropicModel: "claude-sonnet-4-6",
              geminiKey: "",
              geminiModel: "gemini-2.0-flash",
              model: "gemini-2.0-flash",
            },
            state.settings.ai || {},
          );
          if (state.settings.ai.model && !state.settings.ai.geminiModel)
            state.settings.ai.geminiModel = state.settings.ai.model;
          if (!state.settings.ai.provider)
            state.settings.ai.provider = state.settings.ai.anthropicKey
              ? "claude"
              : "gemini";

          const oldSettings = api.getViewSettings
            ? api.getViewSettings()
            : null;
          function selected(v, cur) {
            return String(v) === String(cur) ? "selected" : "";
          }
          function activeProvider(provider, ai) {
            return (ai.provider || "claude") === provider ? "active" : "";
          }
          function aiLabel(ai) {
            return (ai.provider || "claude") === "claude" ? "Claude" : "Gemini";
          }
          if (oldSettings && api.setViewSettings) {
            api.setViewSettings(function () {
              let base = "";
              try {
                base = oldSettings();
              } catch (e) {
                base =
                  '<div class="grid"><div class="card col-12"><h3>الإعدادات</h3><p class="muted">تم تشغيل الوضع الآمن للإعدادات.</p></div></div>';
                console.warn(e);
              }
              base = base.replace(
                /<div class="card col-12 v57-ai-card">[\s\S]*?<\/div><\/div><\/div>/,
                "",
              );
              const ai = state.settings.ai || {};
              const aiCard = `<div class="card col-12 v60-ai-card"><div class="v60-ai-head"><div><h3>🤖 AI Center</h3><p class="muted">اختار مزود الذكاء الاصطناعي الأساسي. Claude هيكون الأساسي، وGemini يفضل احتياطي بدون حذف.</p></div><span class="pill v60-provider-pill">المزود الحالي: ${esc(aiLabel(ai))}</span></div>
        <div class="v60-provider-select"><button class="v60-provider-tab ${activeProvider("claude", ai)}" data-action="v60SetProvider" data-provider="claude">Claude أساسي</button><button class="v60-provider-tab ${activeProvider("gemini", ai)}" data-action="v60SetProvider" data-provider="gemini">Gemini احتياطي</button></div>
        <div class="v60-ai-grid">
          <div class="v60-provider-box"><h4>Claude / Anthropic</h4><p>استخدم رصيد Anthropic API الموجود عندك. مناسب للتلخيص العربي الطويل واستخراج الأفكار والإجراءات.</p><label>Claude API Key</label><input id="v60AnthropicKey" type="password" value="${esc(ai.anthropicKey || "")}" placeholder="sk-ant-api03-..."><label>النموذج</label><select id="v60AnthropicModel"><option value="claude-sonnet-4-6" ${selected(ai.anthropicModel, "claude-sonnet-4-6")}>claude-sonnet-4-6 — متوازن</option><option value="claude-opus-4-8" ${selected(ai.anthropicModel, "claude-opus-4-8")}>claude-opus-4-8 — أقوى</option><option value="claude-haiku-4-5" ${selected(ai.anthropicModel, "claude-haiku-4-5")}>claude-haiku-4-5 — أسرع</option></select><div class="row" style="margin-top:10px"><button class="btn" data-action="v60SaveAISettings">حفظ Claude</button><button class="btn secondary" data-action="v60TestClaude">اختبار Claude</button><button class="btn danger" data-action="v60ClearClaude">مسح</button></div></div>
          <div class="v60-provider-box"><h4>Gemini احتياطي</h4><p>سيظل موجودًا كما طلبت. استخدمه عند الحاجة أو لو واجه Claude أي مشكلة.</p><label>Gemini API Key</label><input id="v60GeminiKey" type="password" value="${esc(ai.geminiKey || "")}" placeholder="AIza..."><label>النموذج</label><select id="v60GeminiModel"><option ${selected(ai.geminiModel || ai.model, "gemini-2.0-flash")}>gemini-2.0-flash</option><option ${selected(ai.geminiModel || ai.model, "gemini-2.5-flash")}>gemini-2.5-flash</option><option ${selected(ai.geminiModel || ai.model, "gemini-1.5-flash")}>gemini-1.5-flash</option><option ${selected(ai.geminiModel || ai.model, "gemini-1.5-pro")}>gemini-1.5-pro</option></select><div class="row" style="margin-top:10px"><button class="btn" data-action="v60SaveAISettings">حفظ Gemini</button><button class="btn secondary" data-action="v60TestGemini">اختبار Gemini</button><button class="btn danger" data-action="v60ClearGemini">مسح</button></div></div>
        </div>
        <div class="v60-ai-warning" style="margin-top:12px">تنبيه: المفاتيح محفوظة على جهازك داخل المتصفح فقط. لا تشاركها مع أي شخص. للتلخيص الدقيق الصق Transcript أو أهم كلام الفيديو داخل خانة النص.</div>
      </div>`;
              return base.includes("</div></div>")
                ? base.replace("</div></div>", aiCard + "</div></div>")
                : base + aiCard;
            });
          }

          function readAIFromForm() {
            const ai = state.settings.ai || {};
            ai.provider = get("v60Provider") || ai.provider || "claude";
            const anthropic = get("v60AnthropicKey");
            if (anthropic !== undefined)
              ai.anthropicKey = (anthropic || ai.anthropicKey || "").trim();
            const am = get("v60AnthropicModel");
            if (am) ai.anthropicModel = am;
            const gemini = get("v60GeminiKey");
            if (gemini !== undefined)
              ai.geminiKey = (gemini || ai.geminiKey || "").trim();
            const gm = get("v60GeminiModel");
            if (gm) {
              ai.geminiModel = gm;
              ai.model = gm;
            }
            state.settings.ai = ai;
            save();
            return ai;
          }
          Actions.v60SetProvider = function (provider) {
            state.settings.ai = state.settings.ai || {};
            state.settings.ai.provider = provider || "claude";
            save();
            render();
            toast("تم اختيار " + (provider === "gemini" ? "Gemini" : "Claude"));
          };
          Actions.v60SaveAISettings = function () {
            readAIFromForm();
            toast("تم حفظ إعدادات AI");
          };
          Actions.v60ClearClaude = function () {
            if (!confirm("مسح مفتاح Claude من هذا الجهاز؟")) return;
            state.settings.ai = state.settings.ai || {};
            state.settings.ai.anthropicKey = "";
            save();
            render();
            toast("تم مسح مفتاح Claude");
          };
          Actions.v60ClearGemini = function () {
            if (!confirm("مسح مفتاح Gemini من هذا الجهاز؟")) return;
            state.settings.ai = state.settings.ai || {};
            state.settings.ai.geminiKey = "";
            save();
            render();
            toast("تم مسح مفتاح Gemini");
          };

          async function v60ClaudeCall(key, model, prompt) {
            const r = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": key,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
              },
              body: JSON.stringify({
                model: model || "claude-sonnet-4-6",
                max_tokens: 2200,
                temperature: 0.25,
                messages: [{ role: "user", content: prompt }],
              }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
              throw new Error(
                data?.error?.message || data?.message || "HTTP " + r.status,
              );
            }
            return (data.content || [])
              .map((p) => p.text || "")
              .join("\n")
              .trim();
          }
          async function v60GeminiCall(key, model, prompt) {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model || "gemini-2.0-flash")}:generateContent?key=${encodeURIComponent(key)}`;
            const r = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.35, maxOutputTokens: 2200 },
              }),
            });
            const data = await r.json().catch(() => ({}));
            if (!r.ok) {
              throw new Error(data?.error?.message || "HTTP " + r.status);
            }
            return (
              data?.candidates?.[0]?.content?.parts
                ?.map((p) => p.text || "")
                .join("\n")
                .trim() || ""
            );
          }
          async function v60AICall(prompt) {
            const ai = state.settings.ai || {};
            if ((ai.provider || "claude") === "claude") {
              if (!ai.anthropicKey)
                throw new Error("ضع Claude API Key من الإعدادات أولاً");
              return await v60ClaudeCall(
                ai.anthropicKey,
                ai.anthropicModel || "claude-sonnet-4-6",
                prompt,
              );
            }
            if (!ai.geminiKey)
              throw new Error("ضع Gemini API Key من الإعدادات أولاً");
            return await v60GeminiCall(
              ai.geminiKey,
              ai.geminiModel || ai.model || "gemini-2.0-flash",
              prompt,
            );
          }
          Actions.v60TestClaude = async function () {
            const ai = readAIFromForm();
            if (!ai.anthropicKey) {
              toast("ضع Claude API Key أولاً");
              return;
            }
            toast("جاري اختبار Claude...");
            try {
              const res = await v60ClaudeCall(
                ai.anthropicKey,
                ai.anthropicModel || "claude-sonnet-4-6",
                "اكتب كلمة واحدة فقط: متصل",
              );
              if (res) toast("Claude متصل ✅");
            } catch (e) {
              toast("فشل Claude: " + (e.message || e));
            }
          };
          Actions.v60TestGemini = async function () {
            const ai = readAIFromForm();
            if (!ai.geminiKey) {
              toast("ضع Gemini API Key أولاً");
              return;
            }
            toast("جاري اختبار Gemini...");
            try {
              const res = await v60GeminiCall(
                ai.geminiKey,
                ai.geminiModel || ai.model || "gemini-2.0-flash",
                "اكتب كلمة واحدة فقط: متصل",
              );
              if (res) toast("Gemini متصل ✅");
            } catch (e) {
              toast("فشل Gemini: " + (e.message || e));
            }
          };

          const fmt =
            (v56api && v56api.fmt) ||
            function (sec) {
              return Math.round((sec || 0) / 60) + "m";
            };
          function notesForPrompt(k) {
            return (k.timedNotes || [])
              .map((n) => `[${fmt(n.timeSec)}] ${n.text}`)
              .join("\n");
          }
          const oldTools = v56api.getVideoTools ? v56api.getVideoTools() : null;
          if (oldTools && v56api.setVideoTools) {
            v56api.setVideoTools(function (k) {
              let base = oldTools(k);
              const summaryTextarea = `<textarea id="v56VideoSummary" placeholder="اكتب أو الصق ملخص الفيديو هنا...">${esc(k.videoSummary || "")}</textarea>`;
              const transcriptBlock = `${summaryTextarea}<label>Transcript / نص الفيديو اختياري</label><textarea id="v57Transcript" placeholder="الصق نص الفيديو أو أهم الكلام هنا لو متاح. بدون النص سيعتمد AI على العنوان والملاحظات فقط.">${esc(k.transcriptText || "")}</textarea>`;
              base = base.replace(summaryTextarea, transcriptBlock);
              const oldRow = `<div class="row"><button class="btn" data-action="saveVideoSummary" data-id="${esc(k.id)}">حفظ الملخص</button><button class="btn secondary" data-action="aiSummaryInfo">تلخيص AI</button></div>`;
              const provider = aiLabel(state.settings.ai || {});
              const newRow = `<div class="v60-ai-actions"><button class="btn v60-primary-ai" data-action="generateAISummary" data-id="${esc(k.id)}">✨ توليد الملخص باستخدام ${provider}</button><div class="v60-ai-secondary"><button class="btn secondary" data-action="saveVideoSummary" data-id="${esc(k.id)}">💾 حفظ الملخص</button><button class="btn secondary" data-action="saveVideoTranscript" data-id="${esc(k.id)}">📄 حفظ النص</button></div><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div>`;
              base = base.replace(oldRow, newRow);
              base = base.replace(
                "التلخيص الذكي الحقيقي يحتاج Transcript أو مفتاح AI. جهزت مكان الملخص والحفظ الآن، ونقدر نضيف Gemini لاحقًا.",
                "لأفضل نتيجة: الصق Transcript لو متاح. إذا لم يتوفر النص، سيولد AI ملخصًا أوليًا من العنوان والملاحظات فقط.",
              );
              base = base.replace(
                "v56-summary-box",
                "v56-summary-box v60-summary-box",
              );
              return base;
            });
          }
          Actions.saveVideoTranscript = function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            k.transcriptText = get("v57Transcript");
            save();
            toast("تم حفظ نص الفيديو");
          };
          Actions.openAISettings = function () {
            if (api.setRoute) api.setRoute("settings");
            closeModal();
            render();
            setTimeout(
              () =>
                document
                  .querySelector(".v60-ai-card")
                  ?.scrollIntoView({ behavior: "smooth", block: "center" }),
              150,
            );
          };
          Actions.generateAISummary = async function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            k.transcriptText = get("v57Transcript") || k.transcriptText || "";
            save();
            const ai = state.settings.ai || {};
            if ((ai.provider || "claude") === "claude" && !ai.anthropicKey) {
              toast("ضع Claude API Key من الإعدادات أولاً");
              Actions.openAISettings();
              return;
            }
            if (ai.provider === "gemini" && !ai.geminiKey) {
              toast("ضع Gemini API Key من الإعدادات أولاً");
              Actions.openAISettings();
              return;
            }
            const prompt = `أنت مساعد عربي داخل نظام تعلم شخصي اسمه Mogahed OS. لخّص هذا الفيديو بشكل عملي ومنظم، واكتب النتيجة بالعربية الفصحى السهلة.\n\nالعنوان: ${k.title || ""}\nالقائمة: ${k.playlistGroup || ""}\nالمدة بالدقائق: ${k.totalUnits || k.totalMinutes || ""}\nرابط الفيديو: ${k.mediaUrl || k.link || ""}\n\nالملاحظات الموقّتة من المستخدم:\n${notesForPrompt(k) || "لا توجد"}\n\nنص الفيديو/Transcript إن وجد:\n${k.transcriptText || "غير متاح"}\n\nالمطلوب بصيغة واضحة:\n1) ملخص مركز.\n2) أهم الأفكار.\n3) اقتباسات أو جمل مهمة إن ظهرت في النص.\n4) ماذا أطبق عمليًا؟\n5) أسئلة مراجعة قصيرة.\n\nقاعدة مهمة: إذا لم يوجد Transcript، وضّح أن الملخص مبني على العنوان والملاحظات فقط ولا تدّعي معرفة تفاصيل غير موجودة.`;
            const label = aiLabel(ai);
            toast(label + " يلخص الفيديو الآن...");
            try {
              const summary = await v60AICall(prompt);
              if (!summary) throw new Error("لم يرجع AI ملخصًا");
              k.videoSummary = summary;
              const box = document.getElementById("v56VideoSummary");
              if (box) box.value = summary;
              save();
              toast("تم إنشاء الملخص وحفظه ✅");
            } catch (e) {
              toast("فشل التلخيص: " + (e.message || e));
            }
          };
          Actions.generateGeminiVideoSummary = function (id) {
            return Actions.generateAISummary(id);
          };
          Actions.aiSummaryInfo = function () {
            Actions.openAISettings();
          };
          toast("V60 جاهز: Claude أساسي + Gemini احتياطي");
        })();

        /* ===== V61 Auto Transcript + AI Summary Workspace ===== */
        (function () {
          const api = window.MogahedOSX || {};
          const v56api = window.MogahedOSX_V56 || {};
          const state = api.state,
            Actions = api.Actions,
            save = api.save,
            toast = api.toast,
            esc = api.esc,
            get = api.get;
          if (
            !state ||
            !Actions ||
            !v56api ||
            !v56api.getVideoTools ||
            !v56api.setVideoTools
          ) {
            console.warn("V61 transcript layer skipped");
            return;
          }

          const style = document.createElement("style");
          style.textContent = `
  .v61-ai-workspace{display:grid;gap:12px;margin-top:12px;padding:14px;border-radius:22px;border:1px solid rgba(139,92,246,.20);background:linear-gradient(135deg,rgba(139,92,246,.10),rgba(236,72,153,.045))}
  .v61-ai-title{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:2px}.v61-ai-title h3{margin:0!important}.v61-ai-title .pill{white-space:nowrap}
  .v61-primary{width:100%;min-height:60px!important;border-radius:20px!important;font-size:16px!important;background:linear-gradient(135deg,#7c3aed,#ec4899)!important;box-shadow:0 18px 44px rgba(139,92,246,.32)!important}
  .v61-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v61-actions .btn{width:100%;min-height:46px!important;border-radius:16px!important;white-space:normal!important}
  .v61-status{padding:11px 12px;border-radius:16px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);color:#bfdbfe;line-height:1.7;font-size:12px;min-height:42px}
  .v61-status.warn{background:rgba(245,158,11,.08);border-color:rgba(245,158,11,.22);color:#fde68a}.v61-status.ok{background:rgba(34,197,94,.08);border-color:rgba(34,197,94,.18);color:#bbf7d0}
  .v61-note{color:var(--muted);font-size:12px;line-height:1.75;margin:0}.v61-summary-box textarea{min-height:128px!important}.v61-transcript-label{display:flex;align-items:center;justify-content:space-between;gap:8px}
  @media(max-width:520px){.v61-actions{grid-template-columns:1fr}.v61-ai-title{align-items:flex-start;flex-direction:column}.v61-primary{min-height:56px!important;font-size:14px!important}.v61-actions .btn{min-height:44px!important}}
  `;
          document.head.appendChild(style);

          function decodeHtml(s) {
            const t = document.createElement("textarea");
            t.innerHTML = String(s || "");
            return t.value;
          }
          function cleanTranscript(s) {
            return decodeHtml(String(s || ""))
              .replace(/\u0026/g, "&")
              .replace(/\s+/g, " ")
              .replace(/\s+([،؛؟.!])/g, "$1")
              .trim();
          }
          function youtubeIdFromAny(k) {
            const raw = String(k?.mediaUrl || k?.link || k?.url || "");
            if (k?.youtubeVideoId) return k.youtubeVideoId;
            let m = raw.match(/[?&]v=([^&]+)/);
            if (m) return decodeURIComponent(m[1]).slice(0, 32);
            m = raw.match(/youtu\.be\/([^?&/]+)/);
            if (m) return decodeURIComponent(m[1]).slice(0, 32);
            m = raw.match(/embed\/([^?&/]+)/);
            if (m) return decodeURIComponent(m[1]).slice(0, 32);
            return "";
          }
          async function fetchText(url, timeout = 15000) {
            const ctl = new AbortController();
            const id = setTimeout(() => ctl.abort(), timeout);
            try {
              const r = await fetch(url, { signal: ctl.signal });
              if (!r.ok) throw new Error("HTTP " + r.status);
              return await r.text();
            } finally {
              clearTimeout(id);
            }
          }
          async function fetchWithFallback(url) {
            const list = [
              url,
              "https://api.allorigins.win/raw?url=" + encodeURIComponent(url),
              "https://corsproxy.io/?" + encodeURIComponent(url),
              "https://r.jina.ai/http://r.jina.ai/http://example.com".replace(
                "http://r.jina.ai/http://example.com",
                "http://r.jina.ai/http://" + url.replace(/^https?:\/\//, ""),
              ),
            ];
            let last = "";
            for (const u of list) {
              try {
                const t = await fetchText(u);
                if (t && t.length > 20) return t;
              } catch (e) {
                last = e.message || String(e);
              }
            }
            throw new Error(last || "تعذر الوصول لمصدر النص");
          }
          function parseTranscriptXml(xml) {
            try {
              const doc = new DOMParser().parseFromString(xml, "text/xml");
              let nodes = [...doc.querySelectorAll("text")];
              if (nodes.length)
                return cleanTranscript(
                  nodes.map((n) => n.textContent || "").join(" "),
                );
            } catch (e) {}
            const m = [
              ...String(xml || "").matchAll(/<text[^>]*>([\s\S]*?)<\/text>/g),
            ].map((x) => x[1]);
            return cleanTranscript(m.join(" "));
          }
          function parseJson3(json) {
            try {
              const data = typeof json === "string" ? JSON.parse(json) : json;
              const chunks = [];
              (data.events || []).forEach((ev) =>
                (ev.segs || []).forEach((s) => {
                  if (s.utf8) chunks.push(s.utf8);
                }),
              );
              return cleanTranscript(chunks.join(" "));
            } catch (e) {
              return "";
            }
          }
          function extractCaptionTracks(html) {
            const s = String(html || "");
            let idx = s.indexOf('"captionTracks":');
            if (idx < 0) idx = s.indexOf('\\"captionTracks\\":');
            if (idx < 0) return [];
            let start = s.indexOf("[", idx);
            if (start < 0) return [];
            let depth = 0,
              end = -1,
              inStr = false,
              escp = false;
            for (let i = start; i < s.length; i++) {
              const ch = s[i];
              if (inStr) {
                if (escp) escp = false;
                else if (ch === "\\") escp = true;
                else if (ch === '"') inStr = false;
              } else {
                if (ch === '"') inStr = true;
                else if (ch === "[") depth++;
                else if (ch === "]") {
                  depth--;
                  if (depth === 0) {
                    end = i + 1;
                    break;
                  }
                }
              }
            }
            if (end < 0) return [];
            let raw = s.slice(start, end).replace(/\\u0026/g, "&");
            try {
              return JSON.parse(raw);
            } catch (e) {
              try {
                return JSON.parse(raw.replace(/\\"/g, '"'));
              } catch (_) {
                return [];
              }
            }
          }
          function chooseTrack(tracks) {
            if (!tracks || !tracks.length) return null;
            return (
              tracks.find((t) =>
                String(t.languageCode || "").startsWith("ar"),
              ) ||
              tracks.find((t) => String(t.vssId || "").includes(".ar")) ||
              tracks.find(
                (t) =>
                  String(t.kind || "") === "asr" &&
                  String(t.languageCode || "").startsWith("en"),
              ) ||
              tracks.find((t) =>
                String(t.languageCode || "").startsWith("en"),
              ) ||
              tracks[0]
            );
          }
          async function fetchTranscriptFromWatch(videoId) {
            const html = await fetchWithFallback(
              "https://www.youtube.com/watch?v=" + encodeURIComponent(videoId),
            );
            const track = chooseTrack(extractCaptionTracks(html));
            if (!track || !track.baseUrl)
              throw new Error("لا توجد ترجمة متاحة لهذا الفيديو");
            let url = String(track.baseUrl).replace(/\\u0026/g, "&");
            url += (url.includes("?") ? "&" : "?") + "fmt=json3";
            const data = await fetchWithFallback(url);
            return parseJson3(data) || parseTranscriptXml(data);
          }
          async function fetchTranscriptPublic(videoId) {
            const urls = [
              "https://youtubetranscript.com/?server_vid2=" +
                encodeURIComponent(videoId),
              "https://www.youtube.com/api/timedtext?v=" +
                encodeURIComponent(videoId) +
                "&lang=ar&fmt=json3",
              "https://www.youtube.com/api/timedtext?v=" +
                encodeURIComponent(videoId) +
                "&lang=en&fmt=json3",
            ];
            for (const url of urls) {
              try {
                const data = await fetchWithFallback(url);
                const text = data.trim().startsWith("{")
                  ? parseJson3(data)
                  : parseTranscriptXml(data);
                if (text && text.length > 80) return text;
              } catch (e) {}
            }
            return "";
          }
          async function v61FetchTranscript(k) {
            const videoId = youtubeIdFromAny(k);
            if (!videoId)
              throw new Error("لا يوجد رابط YouTube صالح لهذا الفيديو");
            let text = "";
            try {
              text = await fetchTranscriptFromWatch(videoId);
            } catch (e) {}
            if (!text) text = await fetchTranscriptPublic(videoId);
            if (!text || text.length < 40)
              throw new Error(
                "لم أجد Transcript متاحًا. قد تكون الترجمة مغلقة أو YouTube منع الوصول من المتصفح. الصق النص يدويًا أو جرّب فيديو فيه CC.",
              );
            return text;
          }
          function setStatus(msg, type = "") {
            const el = document.getElementById("v61TranscriptStatus");
            if (el) {
              el.className = "v61-status " + type;
              el.textContent = msg;
            }
            toast(msg);
          }

          const oldTools = v56api.getVideoTools();
          v56api.setVideoTools(function (k) {
            let base = oldTools(k);
            base = base.replace(
              "v56-summary-box v60-summary-box",
              "v56-summary-box v60-summary-box v61-summary-box",
            );
            base = base.replace(
              "<h3>ملخص الفيديو</h3>",
              '<div class="v61-ai-title"><h3>🤖 ملخص الفيديو</h3><span class="pill">Claude / Gemini</span></div>',
            );
            base = base.replace(
              "<label>Transcript / نص الفيديو اختياري</label>",
              '<label class="v61-transcript-label"><span>Transcript / نص الفيديو</span><span class="pill">اختياري لكن مهم</span></label>',
            );
            const oldActions =
              /<div class="v60-ai-actions">[\s\S]*?<\/div>\s*<button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI<\/button><\/div>/;
            const newActions = `<div class="v61-ai-workspace"><button class="btn v61-primary" data-action="generateAISummary" data-id="${esc(k.id)}">✨ تلخيص شامل بالذكاء الاصطناعي</button><div class="v61-actions"><button class="btn secondary" data-action="fetchVideoTranscript" data-id="${esc(k.id)}">📥 جلب Transcript تلقائيًا</button><button class="btn secondary" data-action="saveVideoTranscript" data-id="${esc(k.id)}">📄 حفظ النص</button><button class="btn secondary" data-action="saveVideoSummary" data-id="${esc(k.id)}">💾 حفظ الملخص</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div><div id="v61TranscriptStatus" class="v61-status">جاهز: اضغط جلب Transcript أو اضغط تلخيص، وسيحاول المشروع جلب النص تلقائيًا قبل التلخيص.</div><p class="v61-note">ملاحظة: بعض الفيديوهات تمنع الترجمة أو التضمين. لو فشل الجلب التلقائي، الصق النص يدويًا في خانة Transcript ثم اضغط التلخيص.</p></div>`;
            base = base.replace(oldActions, newActions);
            return base;
          });

          const oldFetchInfo = Actions.aiSummaryInfo;
          Actions.fetchVideoTranscript = async function (id) {
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            setStatus("جاري محاولة جلب Transcript من YouTube...");
            try {
              const text = await v61FetchTranscript(k);
              k.transcriptText = text;
              const box = document.getElementById("v57Transcript");
              if (box) box.value = text;
              save();
              setStatus("تم جلب Transcript وحفظه ✅", "ok");
            } catch (e) {
              setStatus(e.message || "فشل جلب Transcript", "warn");
            }
          };
          const oldGenerate = Actions.generateAISummary;
          let busy = false;
          Actions.generateAISummary = async function (id) {
            if (busy) {
              toast("يوجد تلخيص قيد التنفيذ بالفعل");
              return;
            }
            const k = state.knowledge.find((x) => x.id === id);
            if (!k) return;
            k.transcriptText = (
              document.getElementById("v57Transcript")?.value ||
              k.transcriptText ||
              ""
            ).trim();
            if (!k.transcriptText) {
              setStatus(
                "لا يوجد Transcript محفوظ. سأحاول جلبه تلقائيًا أولًا...",
              );
              try {
                k.transcriptText = await v61FetchTranscript(k);
                const box = document.getElementById("v57Transcript");
                if (box) box.value = k.transcriptText;
                save();
                setStatus("تم جلب Transcript. جاري التلخيص الآن...", "ok");
              } catch (e) {
                setStatus(
                  "لم أستطع جلب Transcript. سيتم التلخيص من العنوان والملاحظات فقط.",
                  "warn",
                );
              }
            }
            busy = true;
            const btn = document.querySelector(
              `[data-action="generateAISummary"][data-id="${CSS.escape(id)}"]`,
            );
            const oldText = btn ? btn.textContent : "";
            if (btn) {
              btn.textContent = "⏳ جاري التلخيص...";
              btn.disabled = true;
            }
            try {
              await oldGenerate(id);
            } finally {
              busy = false;
              if (btn) {
                btn.textContent = oldText || "✨ تلخيص شامل بالذكاء الاصطناعي";
                btn.disabled = false;
              }
            }
          };
          Actions.aiSummaryInfo = function () {
            toast(
              "اضغط تلخيص شامل أو جلب Transcript تلقائيًا. يمكنك أيضًا لصق النص يدويًا.",
            );
            if (oldFetchInfo) {
            }
          };
          toast("V61 جاهز: جلب Transcript تلقائي + تلخيص AI أنظف");
        })();

        if (window.MogahedOSX) {
          window.MogahedOSX.render();
          window.MogahedOSX.updateTimer && window.MogahedOSX.updateTimer();
        }
      })();

      /* ===== V63.4 Video System: single video vs playlist + playlist tools for single videos ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const v56api = window.MogahedOSX_V56 || {};
        const state = api.state,
          Actions = api.Actions,
          render = api.render,
          save = api.save,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) {
          console.warn("V63.4 Video System skipped: core not ready");
          return;
        }
        const style = document.createElement("style");
        style.textContent = `
    .v634-video-system{margin:12px 0;padding:13px;border-radius:20px;border:1px solid rgba(139,92,246,.25);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
    .v634-video-system h4{margin:0;font-size:15px}.v634-video-system p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}
    .v634-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v634-mode-btn{padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:var(--text);text-align:right}.v634-mode-btn strong{display:block;margin-bottom:3px}.v634-mode-btn small{color:var(--muted);line-height:1.5}.v634-mode-btn.active{background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(236,72,153,.15));border-color:rgba(255,255,255,.18)}
    .v634-single-note{padding:10px;border-radius:16px;border:1px solid rgba(34,197,94,.18);background:rgba(34,197,94,.07);color:#bbf7d0;font-size:12px;line-height:1.65}
    .v634-hide-playlist .v52-playlist-box{display:none!important}.v634-video-single-player{display:grid;gap:12px}.v634-video-single-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.v634-video-side{display:grid;gap:10px;align-content:start}.v634-video-side .v56-player-tools{margin-top:0}
    @media(max-width:1020px){.v634-video-single-layout{grid-template-columns:1fr}.v634-mode-grid{grid-template-columns:1fr}.v634-video-side{min-width:0}}
  `;
        document.head.appendChild(style);

        function E(v) {
          return esc
            ? esc(v || "")
            : String(v || "").replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        }
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function isPodcastType(t) {
          t = String(t || "");
          return (
            t.includes("بودكاست") || t.includes("محاضرة") || t.includes("دورة")
          );
        }
        function videoId(url) {
          url = String(url || "");
          let m = url.match(/[?&]v=([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/youtu\.be\/([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/embed\/([\w-]{6,})/);
          return m ? m[1] : "";
        }
        function watchUrl(id, url) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : String(url || "");
        }
        function embedHtml(k) {
          const url = String(k.mediaUrl || k.link || "");
          const yid = k.youtubeVideoId || videoId(url);
          if (yid) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const local = /^(file|content):/i.test(location.protocol);
            if (local) {
              return `<div class="v55-https-card"><div><h3>التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتح النسخة المنشورة على HTTPS لتشغيل YouTube داخل المشروع وتتبع الدقائق تلقائيًا.</p><button class="btn" data-action="openExternal" data-url="${E(watchUrl(yid, url))}">فتح على YouTube</button></div></div>`;
            }
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${E(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● نفس نظام القوائم: دقائق + ملاحظات موقّتة + ملخص + اقتباسات</div>`;
          }
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<div class="player-frame-wrap v2"><video controls src="${E(k.mediaData)}"></video></div>`;
          return `<div class="empty">أضف رابط YouTube أو ارفع فيديو من تعديل المعرفة.</div>`;
        }
        function currentVideoMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function setVideoMode(mode) {
          const box = document.getElementById("k_typeFields");
          if (!box) return;
          box.classList.toggle("v634-hide-playlist", mode !== "playlist");
          document
            .querySelectorAll(".v634-mode-btn")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === mode),
            );
        }
        function titleFromUrlFallback(url) {
          const id = videoId(url);
          return id ? "YouTube Video — " + id : "";
        }
        async function fetchTitleFromUrl(url) {
          url = String(url || "").trim();
          if (!url) return "";
          try {
            const r = await fetch(
              "https://noembed.com/embed?url=" + encodeURIComponent(url),
            );
            const d = await r.json();
            return d && d.title ? String(d.title) : "";
          } catch (e) {
            return "";
          }
        }
        function attachAutoTitle() {
          const url = document.getElementById("k_mediaUrl"),
            title = document.getElementById("k_title");
          if (!url || !title || url.dataset.v634Title) return;
          url.dataset.v634Title = "1";
          let last = "";
          const run = async () => {
            const v = url.value.trim();
            if (!v || v === last) return;
            last = v;
            if (title.value.trim() && title.dataset.autoFilled !== "1") return;
            const fb = titleFromUrlFallback(v);
            if (fb) {
              title.value = fb;
              title.dataset.autoFilled = "1";
            }
            const real = await fetchTitleFromUrl(v);
            if (
              real &&
              (!title.value.trim() || title.dataset.autoFilled === "1")
            ) {
              title.value = real;
              title.dataset.autoFilled = "1";
            }
          };
          url.addEventListener("input", () => setTimeout(run, 450));
          url.addEventListener("blur", run);
        }
        function enhanceVideoForm() {
          const fields = document.getElementById("k_typeFields"),
            sel = document.getElementById("k_type");
          if (!fields || !sel) return;
          const typ = sel.value || "";
          const isVid = isVideoType(typ);
          if (!isVid) {
            return;
          }
          if (!fields.querySelector(".v634-video-system")) {
            const playlistUrl =
              document.getElementById("k_playlistUrl")?.value || "";
            const mode = playlistUrl ? "playlist" : "single";
            fields.insertAdjacentHTML(
              "afterbegin",
              `<div class="v634-video-system"><h4>🎥 نظام الفيديو</h4><p>اختار هل تضيف فيديو منفرد بكل أدوات القائمة، أم تستورد Playlist كاملة.</p><div class="v634-mode-grid"><button type="button" class="v634-mode-btn ${mode === "single" ? "active" : ""}" data-mode="single"><strong>🎬 فيديو فقط</strong><small>دقائق، ملاحظات موقّتة، ملخص، اقتباسات، تطبيق.</small></button><button type="button" class="v634-mode-btn ${mode === "playlist" ? "active" : ""}" data-mode="playlist"><strong>📺 قائمة فيديوهات</strong><small>استيراد Playlist وإنشاء كارت لكل فيديو.</small></button></div><div class="v634-single-note">في وضع الفيديو المنفرد، اترك رابط Playlist فارغ. اسم الفيديو سيُسحب تلقائيًا من الرابط عند الإمكان.</div></div>`,
            );
            fields
              .querySelectorAll(".v634-mode-btn")
              .forEach((btn) =>
                btn.addEventListener("click", () =>
                  setVideoMode(btn.dataset.mode),
                ),
              );
            setVideoMode(mode);
          }
          attachAutoTitle();
        }
        const oldAdd = Actions.addKnowledge,
          oldEdit = Actions.editKnowledge,
          oldSaveK = Actions.saveKnowledge,
          oldOpen = Actions.openKnowledgePlayer;
        Actions.addKnowledge = function () {
          const r = oldAdd.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        Actions.editKnowledge = function (id) {
          const r = oldEdit.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        const mo = new MutationObserver(() => setTimeout(enhanceVideoForm, 60));
        mo.observe(document.body, { childList: true, subtree: true });
        Actions.saveKnowledge = async function (id) {
          const typ = (document.getElementById("k_type") || {}).value || "";
          const isVid = isVideoType(typ);
          const mode = isVid ? currentVideoMode() : "";
          const pl = document.getElementById("k_playlistUrl");
          if (isVid && mode === "single" && pl) pl.value = "";
          const url = (document.getElementById("k_mediaUrl") || {}).value || "";
          const titleBefore =
            (document.getElementById("k_title") || {}).value || "";
          const before = new Set((state.knowledge || []).map((x) => x.id));
          const res = await oldSaveK.apply(this, arguments);
          setTimeout(() => {
            if (!isVid) return;
            const obj = id
              ? (state.knowledge || []).find((x) => x.id === id)
              : (state.knowledge || []).find((x) => !before.has(x.id));
            if (!obj) return;
            obj.videoMode = mode || "single";
            if (mode === "single") {
              obj.isPlaylistItem = false;
              obj.playlistGroupId = "";
              obj.playlistGroup = "";
              obj.playlistUrl = "";
              obj.playlistId = "";
              obj.playlistIndex = 0;
              obj.playlistTotal = 0;
              obj.mediaType = obj.mediaType || "YouTube";
              obj.youtubeVideoId =
                obj.youtubeVideoId ||
                videoId(url || obj.mediaUrl || obj.link || "");
              if (titleBefore) obj.title = titleBefore;
            }
            save();
            render();
          }, 260);
          return res;
        };
        function enhanceSinglePlayer(id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k || !isVideoType(k.type) || k.isPlaylistItem) return;
          const shell = document.querySelector(".player-shell");
          if (!shell) return;
          if (document.getElementById("v634SingleVideoTools")) return;
          const tools = v56api.getVideoTools ? v56api.getVideoTools()(k) : "";
          const side = shell.querySelector(".player-side") || shell.children[1];
          if (side) {
            side.insertAdjacentHTML(
              "beforeend",
              `<div id="v634SingleVideoTools">${tools || ""}</div>`,
            );
            const info = side.querySelector(".item b");
            if (info) info.textContent = "تقدم الفيديو المنفرد";
          }
        }
        Actions.openKnowledgePlayer = function (id, btn) {
          const r = oldOpen.apply(this, arguments);
          setTimeout(() => enhanceSinglePlayer(id), 250);
          return r;
        };
        toast(
          "V63.4 جاهز: فيديو منفرد أو قائمة + أدوات القائمة للفيديو المنفرد",
        );
      })();

      /* script section 2 */
      (function () {
        "use strict";

        /* 0. PWA Service Worker */
        if ("serviceWorker" in navigator) {
          const swCode = `
const CACHE='mogahed-v82-hardening-v1';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(['./']).catch(()=>{})))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.indexOf('mogahed-')===0&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{try{const rc=res.clone();if(res.status===200){caches.open(CACHE).then(c=>c.put(e.request,rc));}}catch(_){}return res;}).catch(()=>new Response('',{status:503,statusText:'Offline'}))).catch(()=>new Response('',{status:503,statusText:'Offline'})));});
`;
          try {
            const blob = new Blob([swCode], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            navigator.serviceWorker
              .register(url)
              .then(() => URL.revokeObjectURL(url))
              .catch(() => {});
          } catch (e) {}
        }

        /* PWA Manifest */
        (function () {
          const m = {
            name: "Mogahed OS X",
            short_name: "Mogahed OS",
            start_url: ".",
            display: "standalone",
            background_color: "#070812",
            theme_color: "#8b5cf6",
            dir: "rtl",
            lang: "ar",
            icons: [
              {
                src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' rx='22' fill='%238b5cf6'/%3E%3Ctext y='.9em' font-size='70' x='15'%3EM%3C/text%3E%3C/svg%3E",
                sizes: "any",
                type: "image/svg+xml",
              },
            ],
          };
          const b = new Blob([JSON.stringify(m)], {
            type: "application/manifest+json",
          });
          const l = document.createElement("link");
          l.rel = "manifest";
          l.href = URL.createObjectURL(b);
          document.head.appendChild(l);
          const mt = document.createElement("meta");
          mt.name = "theme-color";
          mt.content = "#8b5cf6";
          document.head.appendChild(mt);
          const ma = document.createElement("meta");
          ma.name = "apple-mobile-web-app-capable";
          ma.content = "yes";
          document.head.appendChild(ma);
        })();

        /* Wait for core */
        function waitReady(cb, t) {
          if (t === undefined) t = 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb();
            return;
          }
          if (t > 100) return;
          setTimeout(function () {
            waitReady(cb, t + 1);
          }, 50);
        }

        waitReady(function () {
          const api = window.MogahedOSX;
          const state = api.state,
            Actions = api.Actions,
            save = api.save,
            toast = api.toast,
            esc = api.esc;

          /* V62 Styles */
          const s = document.createElement("style");
          s.textContent = `
.v62-key-notice{display:flex;align-items:center;gap:8px;padding:10px 14px;border-radius:14px;background:rgba(245,158,11,.12);border:1px solid rgba(245,158,11,.28);color:#fde68a;font-size:12px;line-height:1.6;margin:8px 0;}
.v62-key-notice b{color:#fbbf24;}
.v62-health{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;margin:10px 0;}
.v62-health-card{padding:14px;border-radius:18px;border:1px solid var(--line);background:rgba(255,255,255,.045);text-align:center;}
.v62-health-card b{display:block;font-size:22px;font-weight:950;letter-spacing:-.5px;}
.v62-health-card small{color:var(--muted);font-size:11px;}
.v62-health-ok{border-color:rgba(34,197,94,.28)!important;background:rgba(34,197,94,.07)!important;}
.v62-health-warn{border-color:rgba(245,158,11,.28)!important;background:rgba(245,158,11,.07)!important;}
.v62-health-bad{border-color:rgba(239,68,68,.28)!important;background:rgba(239,68,68,.07)!important;}
.v62-backup-banner{position:fixed;top:0;left:0;right:0;z-index:200;padding:10px 20px;background:linear-gradient(135deg,rgba(139,92,246,.95),rgba(236,72,153,.88));color:#fff;display:flex;align-items:center;justify-content:space-between;gap:12px;backdrop-filter:blur(12px);box-shadow:0 4px 24px rgba(0,0,0,.3);transform:translateY(-100%);transition:.35s cubic-bezier(.4,0,.2,1);}
.v62-backup-banner.show{transform:translateY(0);}
.v62-backup-banner .v62-bb-btn{white-space:nowrap;padding:8px 14px;border-radius:12px;background:rgba(255,255,255,.22);color:#fff;border:1px solid rgba(255,255,255,.35);font-weight:700;font-size:13px;}
.v62-backup-banner .v62-bb-btn:hover{background:rgba(255,255,255,.35);}
.v62-backup-msg{font-size:13px;line-height:1.5;}
.v62-theme-btn{position:fixed;top:16px;left:16px;z-index:60;width:40px;height:40px;border-radius:14px;background:rgba(255,255,255,.10);border:1px solid var(--line);color:#fff;font-size:18px;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);transition:.18s;cursor:pointer;}
.v62-theme-btn:hover{background:rgba(255,255,255,.18);}
body.v62-light{--bg:#f0f2fc;--bg2:#e8eaf6;--panel:#ffffff;--panel2:#f5f6ff;--card:#ffffff;--text:#1a1f3c;--muted:#6b7499;--soft:#3d4475;--line:rgba(0,0,0,.10);}
body.v62-light .card{background:#fff!important;border-color:rgba(0,0,0,.08)!important;}
body.v62-light .item{background:rgba(0,0,0,.03)!important;border-color:rgba(0,0,0,.07)!important;}
body.v62-light .sidebar{background:rgba(240,242,252,.95)!important;}
body.v62-light .modal{background:rgba(180,185,215,.72)!important;}
body.v62-light .modal-box{background:linear-gradient(180deg,#fff,#f5f6ff)!important;}
body.v62-light body{background:#f0f2fc!important;color:#1a1f3c!important;}
.v62-undo-bar{position:fixed;bottom:80px;left:50%;transform:translateX(-50%) translateY(20px);z-index:150;background:linear-gradient(135deg,#151a31,#0d1020);border:1px solid var(--line);border-radius:18px;padding:12px 18px;display:flex;align-items:center;gap:12px;box-shadow:0 22px 55px rgba(0,0,0,.3);opacity:0;transition:.25s;pointer-events:none;}
.v62-undo-bar.show{opacity:1;transform:translateX(-50%) translateY(0);pointer-events:all;}
.v62-undo-bar button{padding:7px 14px;border-radius:12px;background:linear-gradient(135deg,var(--brand),var(--brand2));color:#fff;font-weight:700;font-size:13px;}
.v62-shortcuts{display:grid;grid-template-columns:1fr 1fr;gap:8px;}
.v62-shortcut{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid var(--line);}
.v62-shortcut kbd{padding:3px 8px;border-radius:8px;background:rgba(255,255,255,.12);font-size:12px;font-family:monospace;border:1px solid rgba(255,255,255,.2);}
.v62-field-error{border-color:rgba(239,68,68,.6)!important;box-shadow:0 0 0 3px rgba(239,68,68,.12)!important;}
.v62-field-ok{border-color:rgba(34,197,94,.4)!important;}
.v62-err-msg{font-size:11px;color:#fca5a5;margin:4px 0 0 4px;display:block;}
.v62-storage-bar{height:8px;border-radius:999px;background:rgba(255,255,255,.08);overflow:hidden;margin:8px 0;}
.v62-storage-fill{height:100%;border-radius:999px;transition:.5s;}
.v62-offline-chip{position:fixed;bottom:90px;right:16px;z-index:150;padding:8px 14px;border-radius:999px;background:rgba(239,68,68,.18);border:1px solid rgba(239,68,68,.35);color:#fca5a5;font-size:12px;font-weight:700;display:none;align-items:center;gap:6px;}
.v62-offline-chip.show{display:flex;}
.v62-save-ind{position:fixed;top:16px;left:64px;z-index:60;font-size:11px;color:#4ade80;opacity:0;transition:.3s;pointer-events:none;padding:6px 10px;border-radius:999px;background:rgba(34,197,94,.12);border:1px solid rgba(34,197,94,.25);}
/* UX Fix: Theme button is a fixed top-corner control, not a floating bottom action */
.v62-theme-btn{
  position:fixed!important;
  top:calc(12px + env(safe-area-inset-top))!important;
  left:12px!important;
  right:auto!important;
  bottom:auto!important;
  z-index:95!important;
}
@media(max-width:1020px){.v62-theme-btn{top:calc(10px + env(safe-area-inset-top))!important;left:10px!important;right:auto!important;bottom:auto!important;width:42px;height:42px;border-radius:15px;}.v62-save-ind{display:none;}.v62-shortcuts{grid-template-columns:1fr;}}
`;
          document.head.appendChild(s);

          /* Offline indicator */
          var offlineChip = document.createElement("div");
          offlineChip.className = "v62-offline-chip";
          offlineChip.textContent = "📵 غير متصل";
          document.body.appendChild(offlineChip);
          window.addEventListener("offline", function () {
            offlineChip.classList.add("show");
          });
          window.addEventListener("online", function () {
            offlineChip.classList.remove("show");
          });
          if (!navigator.onLine) offlineChip.classList.add("show");

          /* Auto-save indicator */
          var saveInd = document.createElement("div");
          saveInd.className = "v62-save-ind";
          saveInd.textContent = "✓ محفوظ";
          document.body.appendChild(saveInd);
          var origSave = save;
          window.MogahedOSX.save = function () {
            origSave();
            saveInd.style.opacity = "1";
            setTimeout(function () {
              saveInd.style.opacity = "0";
            }, 1200);
          };

          /* Backup Reminder */
          (function () {
            var BACKUP_KEY = "v62_last_backup";
            var INTERVAL = 3 * 24 * 60 * 60 * 1000;
            var banner = document.createElement("div");
            banner.className = "v62-backup-banner";
            banner.innerHTML =
              '<span class="v62-backup-msg">⚠️ <b>تذكير:</b> لم تصدّر بياناتك منذ 3 أيام. بياناتك في المتصفح فقط ومعرضة للضياع.</span><div style="display:flex;gap:8px;flex-shrink:0"><button class="v62-bb-btn" id="v62ExportNow">📦 تصدير الآن</button><button class="v62-bb-btn" id="v62DismissBanner">✕</button></div>';
            document.body.appendChild(banner);
            function checkBackup() {
              var last = Number(localStorage.getItem(BACKUP_KEY) || 0);
              if (Date.now() - last > INTERVAL) banner.classList.add("show");
            }
            setTimeout(checkBackup, 3000);
            document.getElementById("v62ExportNow").onclick = function () {
              Actions.exportData();
              localStorage.setItem(BACKUP_KEY, Date.now());
              banner.classList.remove("show");
              toast("تم التصدير ✅");
            };
            document.getElementById("v62DismissBanner").onclick = function () {
              banner.classList.remove("show");
              localStorage.setItem(
                BACKUP_KEY,
                Date.now() - INTERVAL + 24 * 60 * 60 * 1000,
              );
            };
            var oldExport = Actions.exportData;
            Actions.exportData = function () {
              localStorage.setItem(BACKUP_KEY, Date.now());
              if (oldExport) oldExport();
            };
          })();

          /* Theme Toggle */
          (function () {
            var btn = document.createElement("button");
            btn.className = "v62-theme-btn";
            btn.title = "تبديل الوضع الليلي / النهاري (Alt+T)";
            var saved = localStorage.getItem("v62_theme") || "dark";
            if (saved === "light") {
              document.body.classList.add("v62-light");
              btn.textContent = "🌙";
            } else btn.textContent = "☀️";
            btn.onclick = function () {
              var isLight = document.body.classList.toggle("v62-light");
              btn.textContent = isLight ? "🌙" : "☀️";
              localStorage.setItem("v62_theme", isLight ? "light" : "dark");
            };
            document.body.appendChild(btn);
          })();

          /* Undo System */
          (function () {
            window.v62UndoStack = [];
            var bar = document.createElement("div");
            bar.className = "v62-undo-bar";
            bar.innerHTML =
              '<span id="v62UndoMsg">تم الحذف</span><button id="v62UndoBtn">↩ تراجع</button>';
            document.body.appendChild(bar);
            var undoTimer = null;
            window.v62PushUndo = function (label, fn) {
              v62UndoStack.push(fn);
              var m = document.getElementById("v62UndoMsg");
              if (m) m.textContent = "تم حذف: " + label;
              bar.classList.add("show");
              clearTimeout(undoTimer);
              undoTimer = setTimeout(function () {
                bar.classList.remove("show");
                v62UndoStack.pop();
              }, 5000);
            };
            document.getElementById("v62UndoBtn").onclick = function () {
              var fn = v62UndoStack.pop();
              if (fn) {
                fn();
                bar.classList.remove("show");
                clearTimeout(undoTimer);
                toast("تم التراجع ✅");
              }
            };
            var oldArchive = Actions.archiveItem;
            Actions.archiveItem = function (id, el) {
              var col = el && el.dataset && el.dataset.collection;
              var arr = col && state[col];
              var item =
                arr &&
                arr.find(function (x) {
                  return x.id === id;
                });
              if (item && col) {
                oldArchive(id, el);
                var label = item.title || item.name || "عنصر";
                v62PushUndo(label, function () {
                  var target = arr.find(function (x) {
                    return x.id === id;
                  });
                  if (target) {
                    target.status = "active";
                    state.archive = state.archive.filter(function (x) {
                      return !(x.id === id && x._collection === col);
                    });
                    save();
                    api.render();
                  }
                });
              } else if (oldArchive) oldArchive(id, el);
            };
            var oldDelInbox = Actions.deleteInbox;
            Actions.deleteInbox = function (id) {
              var item =
                state.inbox &&
                state.inbox.find(function (x) {
                  return x.id === id;
                });
              var snap = item ? JSON.parse(JSON.stringify(item)) : null;
              if (oldDelInbox) oldDelInbox(id);
              if (snap)
                v62PushUndo((snap.text || "فكرة").slice(0, 30), function () {
                  if (
                    !state.inbox.find(function (x) {
                      return x.id === id;
                    })
                  ) {
                    state.inbox.unshift(snap);
                    save();
                    api.render();
                  }
                });
            };
          })();

          /* Keyboard Shortcuts */
          (function () {
            function showShortcuts() {
              var shorts = [
                ["Alt+H", "الرئيسية"],
                ["Alt+K", "المعرفة"],
                ["Alt+P", "المشاريع"],
                ["Alt+A", "الإجراءات"],
                ["Alt+F", "التركيز"],
                ["Alt+N", "إضافة سريعة"],
                ["Alt+E", "الإنقاذ"],
                ["Alt+T", "تبديل الثيم"],
                ["Alt+?", "الاختصارات"],
                ["Esc", "إغلاق"],
              ];
              var html =
                '<div class="v62-shortcuts">' +
                shorts
                  .map(function (s) {
                    return (
                      '<div class="v62-shortcut"><span>' +
                      s[1] +
                      "</span><kbd>" +
                      s[0] +
                      "</kbd></div>"
                    );
                  })
                  .join("") +
                "</div>";
              var modal = document.getElementById("modal");
              if (modal) {
                document.getElementById("modalTitle").textContent =
                  "⌨️ اختصارات لوحة المفاتيح";
                document.getElementById("modalBody").innerHTML = html;
                modal.classList.add("open");
              }
            }
            document.addEventListener("keydown", function (e) {
              if (
                e.target.tagName === "INPUT" ||
                e.target.tagName === "TEXTAREA" ||
                e.target.tagName === "SELECT"
              )
                return;
              var k = e.key.toLowerCase();
              if (e.altKey) {
                if (k === "h") {
                  api.setRoute("home");
                  api.render();
                } else if (k === "k") {
                  api.setRoute("knowledge");
                  api.render();
                } else if (k === "p") {
                  api.setRoute("projects");
                  api.render();
                } else if (k === "a") {
                  api.setRoute("actions");
                  api.render();
                } else if (k === "f" && Actions.openFocus) Actions.openFocus();
                else if (k === "n" && Actions.openQuickAdd)
                  Actions.openQuickAdd();
                else if (k === "e" && Actions.emergencyPlan)
                  Actions.emergencyPlan();
                else if (k === "t") {
                  document.querySelector(".v62-theme-btn") &&
                    document.querySelector(".v62-theme-btn").click();
                } else if (k === "?") showShortcuts();
                e.preventDefault();
              }
              if (e.key === "Escape") {
                var modal = document.getElementById("modal");
                if (modal && modal.classList.contains("open"))
                  Actions.closeModal();
                var focus = document.getElementById("focusOverlay");
                if (
                  focus &&
                  focus.classList.contains("open") &&
                  Actions.closeFocus
                )
                  Actions.closeFocus();
              }
            });
          })();

          /* Input Validation */
          (function () {
            function v62Val(inputs) {
              var ok = true;
              inputs.forEach(function (rule) {
                var el = document.getElementById(rule.id);
                if (!el) return;
                var val = (el.value || "").trim();
                var valid = rule.check(val);
                el.classList.toggle("v62-field-error", !valid);
                el.classList.toggle("v62-field-ok", valid && val.length > 0);
                var next = el.nextElementSibling;
                if (next && next.classList.contains("v62-err-msg"))
                  next.remove();
                if (!valid) {
                  var e = document.createElement("span");
                  e.className = "v62-err-msg";
                  e.textContent = rule.msg;
                  el.parentNode.insertBefore(e, el.nextSibling);
                  ok = false;
                }
              });
              return ok;
            }
            window.v62Val = v62Val;
            var oldSaveK = Actions.saveKnowledge;
            Actions.saveKnowledge = function (id) {
              if (
                !v62Val([
                  {
                    id: "k_title",
                    check: function (v) {
                      return v.length >= 2;
                    },
                    msg: "العنوان مطلوب (حرفان على الأقل)",
                  },
                ])
              ) {
                toast("⚠️ يرجى إدخال عنوان صحيح");
                return;
              }
              oldSaveK(id);
            };
            var oldSaveP = Actions.saveProject;
            Actions.saveProject = function (id) {
              if (
                !v62Val([
                  {
                    id: "p_title",
                    check: function (v) {
                      return v.length >= 2;
                    },
                    msg: "اسم المشروع مطلوب",
                  },
                ])
              ) {
                toast("⚠️ يرجى إدخال اسم المشروع");
                return;
              }
              oldSaveP(id);
            };
            var oldSaveG = Actions.saveGoal;
            Actions.saveGoal = function (id) {
              if (
                !v62Val([
                  {
                    id: "g_title",
                    check: function (v) {
                      return v.length >= 2;
                    },
                    msg: "عنوان الهدف مطلوب",
                  },
                ])
              ) {
                toast("⚠️ يرجى إدخال الهدف");
                return;
              }
              oldSaveG(id);
            };
            var oldSaveA = Actions.saveAction;
            Actions.saveAction = function (id, el) {
              if (
                !v62Val([
                  {
                    id: "a_title",
                    check: function (v) {
                      return v.length >= 2;
                    },
                    msg: "الإجراء مطلوب",
                  },
                ])
              ) {
                toast("⚠️ يرجى إدخال الإجراء");
                return;
              }
              oldSaveA(id, el);
            };
          })();

          /* Security notice on AI key inputs */
          (function () {
            var obs = new MutationObserver(function () {
              document
                .querySelectorAll(".v60-provider-box")
                .forEach(function (box) {
                  if (box.querySelector(".v62-key-notice")) return;
                  var n = document.createElement("div");
                  n.className = "v62-key-notice";
                  n.innerHTML =
                    "🔐 <b>تنبيه:</b> المفتاح محفوظ في متصفحك فقط. لا تفتح هذا الملف على جهاز مشترك.";
                  box.appendChild(n);
                });
            });
            obs.observe(document.body, { childList: true, subtree: true });
          })();

          /* Storage Health Dashboard */
          (function () {
            function storageSize() {
              try {
                var t = 0;
                for (var i = 0; i < localStorage.length; i++)
                  t += (localStorage.getItem(localStorage.key(i)) || "").length;
                return t;
              } catch (e) {
                return 0;
              }
            }
            window.v62CleanOldSessions = function () {
              var cutoff = Date.now() - 90 * 24 * 60 * 60 * 1000;
              var before = (state.focusSessions || []).length;
              state.focusSessions = (state.focusSessions || []).filter(
                function (s) {
                  var d = new Date(s.date || 0).getTime();
                  return isNaN(d) || d > cutoff;
                },
              );
              save();
              toast(
                "تم تنظيف " +
                  (before - state.focusSessions.length) +
                  " جلسة قديمة ✅",
              );
              api.render();
            };
            var obs2 = new MutationObserver(function () {
              var g = document.querySelector("#view .grid");
              if (!g || document.getElementById("v62HealthCard")) return;
              if (api.getRoute && api.getRoute() !== "settings") return;
              var bytes = storageSize() * 2;
              var MB = (bytes / 1024 / 1024).toFixed(2);
              var pct = Math.min(
                100,
                Math.round((bytes / (5 * 1024 * 1024)) * 100),
              );
              var sc =
                pct < 60
                  ? "v62-health-ok"
                  : pct < 85
                    ? "v62-health-warn"
                    : "v62-health-bad";
              var st = pct < 60 ? "✅ جيد" : pct < 85 ? "⚠️ قريب" : "🔴 خطر";
              var total =
                (state.knowledge || []).length +
                (state.projects || []).length +
                (state.actions || []).length +
                (state.tasks || []).length +
                (state.goals || []).length;
              var fillColor =
                pct < 60
                  ? "linear-gradient(90deg,#22c55e,#8b5cf6)"
                  : pct < 85
                    ? "linear-gradient(90deg,#f59e0b,#ef4444)"
                    : "linear-gradient(90deg,#ef4444,#dc2626)";
              var card = document.createElement("div");
              card.id = "v62HealthCard";
              card.className = "card col-12";
              card.innerHTML =
                '<h3>🏥 صحة البيانات والتخزين</h3><p class="muted">مراقبة مساحة localStorage والبيانات المحفوظة.</p><div class="v62-health"><div class="v62-health-card ' +
                sc +
                '"><b>' +
                MB +
                ' MB</b><small>مستخدم</small></div><div class="v62-health-card ' +
                (pct < 60 ? "v62-health-ok" : "v62-health-warn") +
                '"><b>' +
                pct +
                '%</b><small>من 5MB</small></div><div class="v62-health-card v62-health-ok"><b>' +
                total +
                '</b><small>عنصر</small></div><div class="v62-health-card v62-health-ok"><b>' +
                (state.knowledge || []).length +
                '</b><small>معرفة</small></div><div class="v62-health-card v62-health-ok"><b>' +
                (state.focusSessions || []).length +
                '</b><small>جلسة</small></div><div class="v62-health-card ' +
                sc +
                '"><b>' +
                st +
                '</b><small>الحالة</small></div></div><div class="v62-storage-bar"><div class="v62-storage-fill" style="width:' +
                pct +
                "%;background:" +
                fillColor +
                '"></div></div><p class="muted" style="font-size:12px;margin:6px 0 0">عند الاقتراب من 80% يُنصح بالتصدير وحذف الملفات الكبيرة.</p><div class="row" style="margin-top:12px"><button class="btn" data-action="exportData">📦 تصدير الآن</button><button class="btn secondary" data-action="v821CleanOldSessions">🧹 تنظيف جلسات +90 يوم</button></div>';
              g.appendChild(card);
            });
            obs2.observe(document.body, { childList: true, subtree: true });
          })();

          /* Enhanced Search */
          (function () {
            function trySearch() {
              var inp = document.querySelector(".searchbox input");
              var box = document.querySelector(".search-results");
              if (!inp || !box) return;
              var t = null;
              inp.addEventListener("input", function () {
                clearTimeout(t);
                var q = this.value;
                t = setTimeout(function () {
                  doSearch(q);
                }, 200);
              });
              document.addEventListener("click", function (e) {
                if (!e.target.closest(".searchbox")) box.style.display = "none";
              });
              function doSearch(q) {
                q = (q || "").trim().toLowerCase();
                if (!q) {
                  box.style.display = "none";
                  return;
                }
                var results = [];
                function push(type, title, sub, route) {
                  if (title)
                    results.push({
                      type: type,
                      title: title,
                      sub: sub,
                      route: route,
                    });
                }
                (state.knowledge || []).forEach(function (k) {
                  if (
                    ((k.title || "") + (k.summary || "") + (k.ideas || ""))
                      .toLowerCase()
                      .indexOf(q) >= 0
                  )
                    push("📚", k.title, k.type || "معرفة", "knowledge");
                });
                (state.projects || [])
                  .filter(function (p) {
                    return p.status !== "archived";
                  })
                  .forEach(function (p) {
                    if (
                      ((p.title || "") + (p.summary || ""))
                        .toLowerCase()
                        .indexOf(q) >= 0
                    )
                      push("▦", p.title, "مشروع", "projects");
                  });
                (state.actions || [])
                  .filter(function (a) {
                    return a.status !== "archived";
                  })
                  .forEach(function (a) {
                    if (
                      ((a.title || "") + (a.reason || ""))
                        .toLowerCase()
                        .indexOf(q) >= 0
                    )
                      push("⚡", a.title, "إجراء", "actions");
                  });
                (state.goals || [])
                  .filter(function (g) {
                    return g.status !== "archived";
                  })
                  .forEach(function (g) {
                    if (
                      ((g.title || "") + (g.why || ""))
                        .toLowerCase()
                        .indexOf(q) >= 0
                    )
                      push("◎", g.title, "هدف", "goals");
                  });
                (state.inbox || []).forEach(function (i) {
                  if ((i.text || "").toLowerCase().indexOf(q) >= 0)
                    push("💡", (i.text || "").slice(0, 60), "Inbox", "vault");
                });
                if (!results.length) {
                  box.innerHTML =
                    '<div style="padding:12px;color:var(--muted);text-align:center;font-size:13px">لا توجد نتائج لـ «' +
                    q +
                    "»</div>";
                  box.style.display = "block";
                  return;
                }
                box.innerHTML = results
                  .slice(0, 8)
                  .map(function (r) {
                    return (
                      "<button data-action=\"v821SearchGo\" data-route=\"" +
                      r.route +
                      "\" style=\"display:flex;align-items:center;gap:10px;width:100%;padding:10px 12px;border-radius:14px;background:transparent;color:var(--text);text-align:right;cursor:pointer;border:0;\"><span style=\"font-size:18px;flex-shrink:0\">" +
                      r.type +
                      '</span><div style="min-width:0"><div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' +
                      r.title +
                      '</div><div style="font-size:12px;color:var(--muted)">' +
                      r.sub +
                      "</div></div></button>"
                    );
                  })
                  .join("");
                box.style.display = "block";
              }
            }
            setTimeout(trySearch, 500);
          })();

          /* PWA Install Prompt */
          (function () {
            var dp = null;
            window.addEventListener("beforeinstallprompt", function (e) {
              e.preventDefault();
              dp = e;
              var btn = document.createElement("button");
              btn.className = "btn secondary mini";
              btn.style.cssText =
                "position:fixed;bottom:92px;right:16px;z-index:100;font-size:12px;";
              btn.textContent = "📲 تثبيت التطبيق";
              btn.onclick = function () {
                dp.prompt();
                dp.userChoice.then(function (r) {
                  btn.remove();
                  dp = null;
                  if (r.outcome === "accepted") toast("تم التثبيت ✅");
                });
              };
              document.body.appendChild(btn);
            });
          })();

          toast(
            "✅ V62 Pro جاهز: PWA + Undo + Theme + Shortcuts + Validation + Health Dashboard",
          );
        }); // end waitReady
      })();

      /* ===== V63.4 Video System: single video vs playlist + playlist tools for single videos ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const v56api = window.MogahedOSX_V56 || {};
        const state = api.state,
          Actions = api.Actions,
          render = api.render,
          save = api.save,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) {
          console.warn("V63.4 Video System skipped: core not ready");
          return;
        }
        const style = document.createElement("style");
        style.textContent = `
    .v634-video-system{margin:12px 0;padding:13px;border-radius:20px;border:1px solid rgba(139,92,246,.25);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
    .v634-video-system h4{margin:0;font-size:15px}.v634-video-system p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}
    .v634-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v634-mode-btn{padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:var(--text);text-align:right}.v634-mode-btn strong{display:block;margin-bottom:3px}.v634-mode-btn small{color:var(--muted);line-height:1.5}.v634-mode-btn.active{background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(236,72,153,.15));border-color:rgba(255,255,255,.18)}
    .v634-single-note{padding:10px;border-radius:16px;border:1px solid rgba(34,197,94,.18);background:rgba(34,197,94,.07);color:#bbf7d0;font-size:12px;line-height:1.65}
    .v634-hide-playlist .v52-playlist-box{display:none!important}.v634-video-single-player{display:grid;gap:12px}.v634-video-single-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.v634-video-side{display:grid;gap:10px;align-content:start}.v634-video-side .v56-player-tools{margin-top:0}
    @media(max-width:1020px){.v634-video-single-layout{grid-template-columns:1fr}.v634-mode-grid{grid-template-columns:1fr}.v634-video-side{min-width:0}}
  `;
        document.head.appendChild(style);

        function E(v) {
          return esc
            ? esc(v || "")
            : String(v || "").replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        }
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function isPodcastType(t) {
          t = String(t || "");
          return (
            t.includes("بودكاست") || t.includes("محاضرة") || t.includes("دورة")
          );
        }
        function videoId(url) {
          url = String(url || "");
          let m = url.match(/[?&]v=([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/youtu\.be\/([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/embed\/([\w-]{6,})/);
          return m ? m[1] : "";
        }
        function watchUrl(id, url) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : String(url || "");
        }
        function embedHtml(k) {
          const url = String(k.mediaUrl || k.link || "");
          const yid = k.youtubeVideoId || videoId(url);
          if (yid) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const local = /^(file|content):/i.test(location.protocol);
            if (local) {
              return `<div class="v55-https-card"><div><h3>التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتح النسخة المنشورة على HTTPS لتشغيل YouTube داخل المشروع وتتبع الدقائق تلقائيًا.</p><button class="btn" data-action="openExternal" data-url="${E(watchUrl(yid, url))}">فتح على YouTube</button></div></div>`;
            }
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${E(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● نفس نظام القوائم: دقائق + ملاحظات موقّتة + ملخص + اقتباسات</div>`;
          }
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<div class="player-frame-wrap v2"><video controls src="${E(k.mediaData)}"></video></div>`;
          return `<div class="empty">أضف رابط YouTube أو ارفع فيديو من تعديل المعرفة.</div>`;
        }
        function currentVideoMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function setVideoMode(mode) {
          const box = document.getElementById("k_typeFields");
          if (!box) return;
          box.classList.toggle("v634-hide-playlist", mode !== "playlist");
          document
            .querySelectorAll(".v634-mode-btn")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === mode),
            );
        }
        function titleFromUrlFallback(url) {
          const id = videoId(url);
          return id ? "YouTube Video — " + id : "";
        }
        async function fetchTitleFromUrl(url) {
          url = String(url || "").trim();
          if (!url) return "";
          try {
            const r = await fetch(
              "https://noembed.com/embed?url=" + encodeURIComponent(url),
            );
            const d = await r.json();
            return d && d.title ? String(d.title) : "";
          } catch (e) {
            return "";
          }
        }
        function attachAutoTitle() {
          const url = document.getElementById("k_mediaUrl"),
            title = document.getElementById("k_title");
          if (!url || !title || url.dataset.v634Title) return;
          url.dataset.v634Title = "1";
          let last = "";
          const run = async () => {
            const v = url.value.trim();
            if (!v || v === last) return;
            last = v;
            if (title.value.trim() && title.dataset.autoFilled !== "1") return;
            const fb = titleFromUrlFallback(v);
            if (fb) {
              title.value = fb;
              title.dataset.autoFilled = "1";
            }
            const real = await fetchTitleFromUrl(v);
            if (
              real &&
              (!title.value.trim() || title.dataset.autoFilled === "1")
            ) {
              title.value = real;
              title.dataset.autoFilled = "1";
            }
          };
          url.addEventListener("input", () => setTimeout(run, 450));
          url.addEventListener("blur", run);
        }
        function enhanceVideoForm() {
          const fields = document.getElementById("k_typeFields"),
            sel = document.getElementById("k_type");
          if (!fields || !sel) return;
          const typ = sel.value || "";
          const isVid = isVideoType(typ);
          if (!isVid) {
            return;
          }
          if (!fields.querySelector(".v634-video-system")) {
            const playlistUrl =
              document.getElementById("k_playlistUrl")?.value || "";
            const mode = playlistUrl ? "playlist" : "single";
            fields.insertAdjacentHTML(
              "afterbegin",
              `<div class="v634-video-system"><h4>🎥 نظام الفيديو</h4><p>اختار هل تضيف فيديو منفرد بكل أدوات القائمة، أم تستورد Playlist كاملة.</p><div class="v634-mode-grid"><button type="button" class="v634-mode-btn ${mode === "single" ? "active" : ""}" data-mode="single"><strong>🎬 فيديو فقط</strong><small>دقائق، ملاحظات موقّتة، ملخص، اقتباسات، تطبيق.</small></button><button type="button" class="v634-mode-btn ${mode === "playlist" ? "active" : ""}" data-mode="playlist"><strong>📺 قائمة فيديوهات</strong><small>استيراد Playlist وإنشاء كارت لكل فيديو.</small></button></div><div class="v634-single-note">في وضع الفيديو المنفرد، اترك رابط Playlist فارغ. اسم الفيديو سيُسحب تلقائيًا من الرابط عند الإمكان.</div></div>`,
            );
            fields
              .querySelectorAll(".v634-mode-btn")
              .forEach((btn) =>
                btn.addEventListener("click", () =>
                  setVideoMode(btn.dataset.mode),
                ),
              );
            setVideoMode(mode);
          }
          attachAutoTitle();
        }
        const oldAdd = Actions.addKnowledge,
          oldEdit = Actions.editKnowledge,
          oldSaveK = Actions.saveKnowledge,
          oldOpen = Actions.openKnowledgePlayer;
        Actions.addKnowledge = function () {
          const r = oldAdd.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        Actions.editKnowledge = function (id) {
          const r = oldEdit.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        const mo = new MutationObserver(() => setTimeout(enhanceVideoForm, 60));
        mo.observe(document.body, { childList: true, subtree: true });
        Actions.saveKnowledge = async function (id) {
          const typ = (document.getElementById("k_type") || {}).value || "";
          const isVid = isVideoType(typ);
          const mode = isVid ? currentVideoMode() : "";
          const pl = document.getElementById("k_playlistUrl");
          if (isVid && mode === "single" && pl) pl.value = "";
          const url = (document.getElementById("k_mediaUrl") || {}).value || "";
          const titleBefore =
            (document.getElementById("k_title") || {}).value || "";
          const before = new Set((state.knowledge || []).map((x) => x.id));
          const res = await oldSaveK.apply(this, arguments);
          setTimeout(() => {
            if (!isVid) return;
            const obj = id
              ? (state.knowledge || []).find((x) => x.id === id)
              : (state.knowledge || []).find((x) => !before.has(x.id));
            if (!obj) return;
            obj.videoMode = mode || "single";
            if (mode === "single") {
              obj.isPlaylistItem = false;
              obj.playlistGroupId = "";
              obj.playlistGroup = "";
              obj.playlistUrl = "";
              obj.playlistId = "";
              obj.playlistIndex = 0;
              obj.playlistTotal = 0;
              obj.mediaType = obj.mediaType || "YouTube";
              obj.youtubeVideoId =
                obj.youtubeVideoId ||
                videoId(url || obj.mediaUrl || obj.link || "");
              if (titleBefore) obj.title = titleBefore;
            }
            save();
            render();
          }, 260);
          return res;
        };
        function enhanceSinglePlayer(id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k || !isVideoType(k.type) || k.isPlaylistItem) return;
          const shell = document.querySelector(".player-shell");
          if (!shell) return;
          if (document.getElementById("v634SingleVideoTools")) return;
          const tools = v56api.getVideoTools ? v56api.getVideoTools()(k) : "";
          const side = shell.querySelector(".player-side") || shell.children[1];
          if (side) {
            side.insertAdjacentHTML(
              "beforeend",
              `<div id="v634SingleVideoTools">${tools || ""}</div>`,
            );
            const info = side.querySelector(".item b");
            if (info) info.textContent = "تقدم الفيديو المنفرد";
          }
        }
        Actions.openKnowledgePlayer = function (id, btn) {
          const r = oldOpen.apply(this, arguments);
          setTimeout(() => enhanceSinglePlayer(id), 250);
          return r;
        };
        toast(
          "V63.4 جاهز: فيديو منفرد أو قائمة + أدوات القائمة للفيديو المنفرد",
        );
      })();

      /* script section 3 */
      (function () {
        "use strict";

        /* ---- Wait for core ---- */
        function waitReady(cb, t) {
          if (t === undefined) t = 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb();
            return;
          }
          if (t > 120) return;
          setTimeout(function () {
            waitReady(cb, t + 1);
          }, 50);
        }

        /* ================================================================
   PART A: Google Drive Backup (like WhatsApp)
   - Uses Google Identity Services (GIS) + Drive REST API
   - Saves JSON backup to a hidden "Mogahed OS X Backups" folder
   - Auto-backup every time user exports, or manually via button
================================================================ */
        waitReady(function () {
          const api = window.MogahedOSX;
          const state = api.state,
            Actions = api.Actions,
            save = api.save,
            toast = api.toast,
            esc = api.esc;

          /* -- Styles -- */
          const st = document.createElement("style");
          st.textContent = `
/* Drive styles */
.v63-drive-card{background:linear-gradient(135deg,rgba(66,133,244,.14),rgba(52,168,83,.10));border-color:rgba(66,133,244,.28)!important;}
.v63-drive-head{display:flex;align-items:center;gap:14px;margin-bottom:14px;}
.v63-drive-icon{width:48px;height:48px;border-radius:16px;background:linear-gradient(135deg,#4285f4,#34a853);display:flex;align-items:center;justify-content:center;font-size:24px;flex-shrink:0;}
.v63-drive-status{padding:10px 14px;border-radius:14px;border:1px solid var(--line);background:rgba(255,255,255,.05);font-size:13px;margin:10px 0;}
.v63-drive-status.ok{border-color:rgba(52,168,83,.35);background:rgba(52,168,83,.10);color:#86efac;}
.v63-drive-status.warn{border-color:rgba(245,158,11,.35);background:rgba(245,158,11,.10);color:#fde68a;}
.v63-drive-status.err{border-color:rgba(239,68,68,.35);background:rgba(239,68,68,.10);color:#fca5a5;}
.v63-backups-list{display:grid;gap:8px;margin-top:10px;max-height:220px;overflow:auto;}
.v63-backup-item{display:flex;align-items:center;justify-content:space-between;padding:10px 14px;border-radius:14px;background:rgba(255,255,255,.05);border:1px solid var(--line);gap:10px;}
.v63-backup-item .name{font-size:13px;font-weight:600;flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.v63-backup-item .date{font-size:11px;color:var(--muted);}
.v63-auto-badge{display:inline-flex;align-items:center;gap:5px;padding:4px 10px;border-radius:999px;background:rgba(52,168,83,.15);border:1px solid rgba(52,168,83,.3);color:#86efac;font-size:11px;}
.v63-progress-ring{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted);}

/* YouTube auto-fill */
.v63-yt-fetch-row{display:flex;gap:8px;align-items:flex-end;margin-bottom:4px;}
.v63-yt-fetch-row input{flex:1;}
.v63-yt-fetch-btn{white-space:nowrap;flex-shrink:0;padding:13px 14px;border-radius:16px;background:linear-gradient(135deg,rgba(255,0,0,.22),rgba(255,60,60,.14));border:1px solid rgba(255,60,60,.3);color:#fca5a5;font-weight:700;font-size:13px;cursor:pointer;transition:.18s;}
.v63-yt-fetch-btn:hover{background:linear-gradient(135deg,rgba(255,0,0,.35),rgba(255,60,60,.22));border-color:rgba(255,60,60,.5);}
.v63-yt-fetch-btn:disabled{opacity:.5;cursor:not-allowed;}
.v63-yt-preview{padding:12px 14px;border-radius:14px;border:1px solid rgba(255,0,0,.2);background:rgba(255,0,0,.06);margin:6px 0;display:none;}
.v63-yt-preview.show{display:block;}
.v63-yt-preview h5{margin:0 0 4px;font-size:14px;}
.v63-yt-preview p{margin:0;font-size:12px;color:var(--muted);line-height:1.6;}
.v63-yt-thumb{width:100%;height:100px;object-fit:cover;border-radius:10px;margin-bottom:8px;}
.v63-fill-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 9px;border-radius:999px;background:rgba(255,0,0,.12);border:1px solid rgba(255,0,0,.25);color:#fca5a5;font-size:11px;margin-right:6px;}

@media(max-width:620px){
  .v63-drive-head{flex-direction:column;align-items:flex-start;}
  .v63-backups-list{max-height:160px;}
}
`;
          document.head.appendChild(st);

          /* ================================================================
   GOOGLE DRIVE BACKUP ENGINE
================================================================ */
          var DRIVE_CLIENT_ID = ""; // يملأها المستخدم
          var DRIVE_SCOPE = "https://www.googleapis.com/auth/drive.file";
          var FOLDER_NAME = "Mogahed OS X Backups";
          var v63TokenClient = null;
          var v63AccessToken = "";
          var v63FolderId = "";
          var v63LastBackup = localStorage.getItem("v63_drive_last") || "";
          var v63BackupList = [];

          function v63LoadGIS(cb) {
            if (window.google && window.google.accounts) {
              cb();
              return;
            }
            var s = document.createElement("script");
            s.src = "https://accounts.google.com/gsi/client";
            s.onload = cb;
            s.onerror = function () {
              toast("⚠️ تعذّر تحميل Google Sign-In");
            };
            document.head.appendChild(s);
          }

          function v63InitClient(clientId, cb) {
            v63LoadGIS(function () {
              try {
                v63TokenClient = window.google.accounts.oauth2.initTokenClient({
                  client_id: clientId,
                  scope: DRIVE_SCOPE,
                  callback: function (resp) {
                    if (resp.error) {
                      toast("❌ فشل تسجيل الدخول: " + resp.error);
                      return;
                    }
                    v63AccessToken = resp.access_token;
                    localStorage.setItem("v63_client_id", clientId);
                    cb && cb(resp.access_token);
                  },
                });
                cb && cb(null); // init ok, token not yet
              } catch (e) {
                toast("❌ خطأ في تهيئة Google: " + e.message);
              }
            });
          }

          function v63Auth(clientId, cb) {
            v63InitClient(clientId, function (tok) {
              if (tok) {
                cb(tok);
                return;
              }
              // request token
              try {
                v63TokenClient.requestAccessToken();
              } catch (e) {
                toast("خطأ: " + e.message);
              }
              // result comes in callback above — we re-bind cb
              v63TokenClient.callback = function (resp) {
                if (resp.error) {
                  toast("❌ " + resp.error);
                  return;
                }
                v63AccessToken = resp.access_token;
                localStorage.setItem("v63_client_id", clientId);
                cb && cb(resp.access_token);
              };
            });
          }

          async function v63DriveReq(path, method, body, isUpload) {
            var base = isUpload
              ? "https://www.googleapis.com/upload/drive/v3"
              : "https://www.googleapis.com/drive/v3";
            var resp = await fetch(base + path, {
              method: method || "GET",
              headers: Object.assign(
                { Authorization: "Bearer " + v63AccessToken },
                body && !isUpload ? { "Content-Type": "application/json" } : {},
              ),
              body: body ? (isUpload ? body : JSON.stringify(body)) : undefined,
            });
            if (!resp.ok)
              throw new Error(
                "Drive API: " + resp.status + " " + resp.statusText,
              );
            return resp.json();
          }

          async function v63EnsureFolder() {
            if (v63FolderId) return v63FolderId;
            var res = await v63DriveReq(
              "/files?q=" +
                encodeURIComponent(
                  "name='" +
                    FOLDER_NAME +
                    "' and mimeType='application/vnd.google-apps.folder' and trashed=false",
                ) +
                "&fields=files(id,name)",
            );
            if (res.files && res.files.length) {
              v63FolderId = res.files[0].id;
              return v63FolderId;
            }
            var created = await v63DriveReq("/files", "POST", {
              name: FOLDER_NAME,
              mimeType: "application/vnd.google-apps.folder",
            });
            v63FolderId = created.id;
            return v63FolderId;
          }

          async function v63UploadBackup(token) {
            v63AccessToken = token;
            var folderId = await v63EnsureFolder();
            var now = new Date();
            var dateStr = now.toISOString().replace("T", " ").slice(0, 19);
            var filename =
              "MogahedOSX_Backup_" +
              now.toISOString().slice(0, 10) +
              "_" +
              now.toTimeString().slice(0, 5).replace(":", "") +
              ".json";
            var jsonData = JSON.stringify(state, null, 2);
            var meta = {
              name: filename,
              parents: [folderId],
              description: "Mogahed OS X نسخة احتياطية بتاريخ " + dateStr,
            };
            var form = new FormData();
            form.append(
              "metadata",
              new Blob([JSON.stringify(meta)], { type: "application/json" }),
            );
            form.append(
              "file",
              new Blob([jsonData], { type: "application/json" }),
            );
            var resp = await fetch(
              "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,createdTime",
              {
                method: "POST",
                headers: { Authorization: "Bearer " + token },
                body: form,
              },
            );
            if (!resp.ok) throw new Error("رفع Drive فشل: " + resp.status);
            var file = await resp.json();
            v63LastBackup = dateStr;
            localStorage.setItem("v63_drive_last", dateStr);
            localStorage.setItem("v62_last_backup", Date.now());
            return file;
          }

          async function v63ListBackups() {
            if (!v63FolderId) await v63EnsureFolder();
            var res = await v63DriveReq(
              "/files?q=" +
                encodeURIComponent(
                  "'" + v63FolderId + "' in parents and trashed=false",
                ) +
                "&orderBy=createdTime+desc&pageSize=10&fields=files(id,name,createdTime,size)",
            );
            return res.files || [];
          }

          async function v63RestoreBackup(fileId) {
            var resp = await fetch(
              "https://www.googleapis.com/drive/v3/files/" +
                fileId +
                "?alt=media",
              {
                headers: { Authorization: "Bearer " + v63AccessToken },
              },
            );
            if (!resp.ok) throw new Error("تعذّر تحميل الملف");
            var data = await resp.json();
            if (!data || !data.knowledge)
              throw new Error("الملف لا يبدو نسخة احتياطية صحيحة");
            return data;
          }

          window.v63DriveBackup = function () {
            var savedId =
              localStorage.getItem("v63_client_id") ||
              (state.settings && state.settings.driveClientId) ||
              "";
            if (!savedId) {
              toast("⚠️ أدخل Client ID من Google Console أولاً في الإعدادات");
              return;
            }
            toast("🔄 جاري الاتصال بـ Google Drive...");
            v63Auth(savedId, function (token) {
              toast("📤 جاري الرفع...");
              v63UploadBackup(token)
                .then(function (f) {
                  toast("✅ تم الحفظ على Drive: " + f.name);
                  v63RefreshDriveCard();
                })
                .catch(function (e) {
                  toast("❌ " + e.message);
                });
            });
          };

          window.v63DriveList = function () {
            var savedId = localStorage.getItem("v63_client_id") || "";
            if (!savedId || !v63AccessToken) {
              toast("سجّل الدخول أولاً باستخدام زر النسخ الاحتياطي");
              return;
            }
            v63ListBackups()
              .then(function (files) {
                v63BackupList = files;
                var el = document.getElementById("v63BackupsList");
                if (!el) return;
                el.innerHTML = files.length
                  ? files
                      .map(function (f) {
                        var d = new Date(f.createdTime).toLocaleString("ar-EG");
                        return (
                          '<div class="v63-backup-item"><div><div class="name">' +
                          esc(f.name) +
                          '</div><div class="date">' +
                          d +
                          " — " +
                          Math.round(Number(f.size || 0) / 1024) +
                          'KB</div></div><button class="btn secondary mini" data-action="v821DriveRestore" data-drive-id="' +
                          esc(f.id) +
                          '">↩ استعادة</button></div>' 
                        );
                      })
                      .join("")
                  : '<p class="muted" style="text-align:center;padding:10px">لا توجد نسخ محفوظة على Drive</p>';
              })
              .catch(function (e) {
                toast("❌ " + e.message);
              });
          };

          window.v63RestoreFromDrive = function (fileId) {
            if (
              !confirm(
                "⚠️ هل تريد استعادة هذه النسخة؟ ستُستبدل بياناتك الحالية.",
              )
            )
              return;
            toast("⏳ جاري التحميل...");
            v63RestoreBackup(fileId)
              .then(function (data) {
                Object.assign(state, data);
                save();
                api.render();
                toast("✅ تمت الاستعادة من Google Drive");
              })
              .catch(function (e) {
                toast("❌ " + e.message);
              });
          };

          function v63RefreshDriveCard() {
            var lastEl = document.getElementById("v63LastBackupTime");
            if (lastEl)
              lastEl.textContent = v63LastBackup
                ? "آخر نسخة: " + v63LastBackup
                : "لم يتم بعد";
            if (v63AccessToken) v63DriveList();
          }

          /* Inject Drive card into settings */
          var driveObs = new MutationObserver(function () {
            var g = document.querySelector("#view .grid");
            if (!g || document.getElementById("v63DriveCard")) return;
            if (api.getRoute && api.getRoute() !== "settings") return;
            var savedId = localStorage.getItem("v63_client_id") || "";
            var card = document.createElement("div");
            card.id = "v63DriveCard";
            card.className = "card col-12 v63-drive-card";
            card.innerHTML = `
    <div class="v63-drive-head">
      <div class="v63-drive-icon">📂</div>
      <div>
        <h3 style="margin:0">Google Drive Backup <span class="v63-auto-badge">☁️ مثل واتساب</span></h3>
        <p class="muted" style="margin:4px 0 0;font-size:13px">نسخ احتياطية تلقائية إلى Google Drive الخاص بك — لا يرى بياناتك أحد غيرك.</p>
      </div>
    </div>
    <div class="v63-drive-status warn" id="v63DriveStatus">
      🔑 تحتاج Client ID من Google Cloud Console لتفعيل هذه الميزة.
      <a href="https://console.cloud.google.com/apis/credentials" target="_blank" style="color:#fbbf24;margin-right:6px">افتح Console</a>
    </div>
    <label>Google OAuth Client ID</label>
    <input id="v63ClientId" placeholder="xxxx.apps.googleusercontent.com" value="${esc(savedId)}" type="text">
    <p class="muted" style="font-size:11px;margin:4px 0 8px">اصنع مشروع في Google Cloud ← Credentials ← OAuth 2.0 Client ID ← Web Application ← أضف http://localhost و file:// في Authorized Origins</p>
    <div class="row" style="margin-bottom:12px">
      <button class="btn" data-action="v821DriveSaveClientId">💾 حفظ Client ID</button>
      <button class="btn" data-action="v821DriveBackup">☁️ نسخ احتياطي الآن</button>
      <button class="btn secondary" data-action="v821DriveList">📋 عرض النسخ</button>
    </div>
    <div class="v63-drive-status" id="v63LastBackupTime">${v63LastBackup ? "آخر نسخة: " + v63LastBackup : "لم يتم بعد"}</div>
    <div id="v63BackupsList" class="v63-backups-list"></div>
    <p class="muted" style="font-size:11px;margin-top:8px">⚠️ ملاحظة: Client ID يُحفظ على جهازك فقط. البيانات ترفع مباشرة من متصفحك إلى Drive حسابك — لا مرور بسيرفر وسيط.</p>
  `;
            g.insertBefore(card, g.firstChild);
          });
          driveObs.observe(document.body, { childList: true, subtree: true });

          window.v63SaveClientId = function () {
            var val = (
              document.getElementById("v63ClientId")?.value || ""
            ).trim();
            if (!val) {
              toast("أدخل Client ID أولاً");
              return;
            }
            localStorage.setItem("v63_client_id", val);
            if (state.settings) state.settings.driveClientId = val;
            save();
            var st2 = document.getElementById("v63DriveStatus");
            if (st2) {
              st2.className = "v63-drive-status ok";
              st2.textContent = '✅ Client ID محفوظ — اضغط "نسخ احتياطي" للبدء';
            }
            toast("✅ تم حفظ Client ID");
          };

          /* Hook export button to also do Drive backup if configured */
          var oldExport = Actions.exportData;
          Actions.exportData = function () {
            if (oldExport) oldExport();
            var cid = localStorage.getItem("v63_client_id") || "";
            if (cid && v63AccessToken) {
              v63UploadBackup(v63AccessToken)
                .then(function () {
                  toast("✅ تم التصدير + حفظ نسخة على Drive");
                })
                .catch(function () {});
            }
          };

          /* ================================================================
   PART B: YouTube Auto-Fill (Title + Description + Thumbnail)
   - Listens to mediaUrl field in knowledge form
   - Fetches video info via noembed.com (no API key needed)
   - Auto-fills title, cover thumbnail, duration hint
================================================================ */

          function v63YouTubeId(url) {
            url = String(url || "").trim();
            var m = url.match(
              /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{11})/,
            );
            return m ? m[1] : "";
          }

          async function v63FetchYTInfo(url) {
            var yid = v63YouTubeId(url);
            if (!yid) throw new Error("ليس رابط YouTube صالح");
            // noembed: free, no key, CORS-friendly
            var resp = await fetch(
              "https://noembed.com/embed?url=" +
                encodeURIComponent("https://www.youtube.com/watch?v=" + yid),
            );
            if (!resp.ok) throw new Error("لم يستجب الخادم");
            var data = await resp.json();
            if (!data.title) throw new Error("لم يتم العثور على بيانات");
            return {
              title: data.title || "",
              author: data.author_name || "",
              thumbnail: "https://img.youtube.com/vi/" + yid + "/hqdefault.jpg",
              description: "قناة: " + (data.author_name || "") + "  |  YouTube",
              videoId: yid,
            };
          }

          function v63InjectYTFetcher() {
            // Find mediaUrl input in open modal
            var urlInput = document.getElementById("k_mediaUrl");
            if (!urlInput || urlInput.dataset.v63Hooked) return;
            urlInput.dataset.v63Hooked = "1";

            // Create fetch button next to input
            var wrapper = document.createElement("div");
            wrapper.className = "v63-yt-fetch-row";
            var parent = urlInput.parentNode;
            parent.insertBefore(wrapper, urlInput);
            wrapper.appendChild(urlInput);

            var fetchBtn = document.createElement("button");
            fetchBtn.type = "button";
            fetchBtn.className = "v63-yt-fetch-btn";
            fetchBtn.innerHTML = "▶ جلب البيانات";
            wrapper.appendChild(fetchBtn);

            // Preview box
            var preview = document.createElement("div");
            preview.className = "v63-yt-preview";
            preview.id = "v63YtPreview";
            parent.insertBefore(preview, wrapper.nextSibling);

            var fetchTimer = null;
            function doFetch(url) {
              var yid = v63YouTubeId(url);
              if (!yid) {
                preview.classList.remove("show");
                return;
              }
              fetchBtn.disabled = true;
              fetchBtn.textContent = "⏳ جاري...";
              v63FetchYTInfo(url)
                .then(function (info) {
                  // Fill title if empty
                  var titleEl = document.getElementById("k_title");
                  if (titleEl && !titleEl.value) titleEl.value = info.title;
                  // Fill author
                  var authorEl = document.getElementById("k_author");
                  if (authorEl && !authorEl.value) authorEl.value = info.author;
                  // Show preview
                  preview.innerHTML =
                    '<img class="v63-yt-thumb" src="' +
                    info.thumbnail +
                    '" onerror="this.style.display=\'none\'"><h5><span class="v63-fill-badge">✓ تم الجلب</span>' +
                    esc(info.title) +
                    "</h5><p>" +
                    esc(info.description) +
                    "</p>";
                  preview.classList.add("show");
                  // Store thumbnail URL for cover (will be downloaded as data)
                  fetch(info.thumbnail)
                    .then(function (r) {
                      return r.blob();
                    })
                    .then(function (blob) {
                      var rd = new FileReader();
                      rd.onload = function () {
                        // inject into cover via a hidden img data trick
                        window._v63CoverData = rd.result;
                        window._v63CoverSource = "yt";
                      };
                      rd.readAsDataURL(blob);
                    })
                    .catch(function () {});
                  fetchBtn.textContent = "✅ تم";
                  setTimeout(function () {
                    fetchBtn.textContent = "▶ جلب البيانات";
                    fetchBtn.disabled = false;
                  }, 2000);
                })
                .catch(function (e) {
                  preview.innerHTML =
                    '<p style="color:#fca5a5">⚠️ ' + e.message + "</p>";
                  preview.classList.add("show");
                  fetchBtn.textContent = "▶ جلب البيانات";
                  fetchBtn.disabled = false;
                });
            }

            fetchBtn.onclick = function () {
              doFetch(urlInput.value);
            };

            // Auto-fetch after user stops typing
            urlInput.addEventListener("input", function () {
              clearTimeout(fetchTimer);
              var val = this.value;
              if (v63YouTubeId(val)) {
                fetchTimer = setTimeout(function () {
                  doFetch(val);
                }, 800);
              }
            });

            // Auto-trigger if field already has value
            if (v63YouTubeId(urlInput.value))
              setTimeout(function () {
                doFetch(urlInput.value);
              }, 300);
          }

          // Patch saveKnowledge to use fetched cover if no cover uploaded
          var origSaveK = Actions.saveKnowledge;
          Actions.saveKnowledge = function (id) {
            // If YT cover was fetched and no manual cover uploaded
            if (window._v63CoverData && window._v63CoverSource === "yt") {
              var coverInput = document.getElementById("k_cover");
              if (coverInput && !coverInput.files[0]) {
                // inject data into state directly — we patch after save
                var coverData = window._v63CoverData;
                window._v63CoverData = null;
                window._v63CoverSource = null;
                // call original, then patch cover
                origSaveK(id);
                // patch the saved item's cover
                setTimeout(function () {
                  var items = state.knowledge;
                  if (items.length && !items[0].cover) {
                    items[0].cover = coverData;
                    save();
                    api.render();
                  }
                }, 200);
                return;
              }
            }
            window._v63CoverData = null;
            window._v63CoverSource = null;
            origSaveK(id);
          };

          // Watch for modal opening to inject fetcher
          var modalObs = new MutationObserver(function () {
            var modal = document.getElementById("modal");
            if (!modal || !modal.classList.contains("open")) return;
            // small delay for modal to render
            setTimeout(v63InjectYTFetcher, 100);
          });
          modalObs.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
          });

          toast("✅ V63 جاهز: Google Drive Backup + YouTube Auto-Fill");
        }); // end waitReady
      })();

      /* ===== V63.4 Video System: single video vs playlist + playlist tools for single videos ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const v56api = window.MogahedOSX_V56 || {};
        const state = api.state,
          Actions = api.Actions,
          render = api.render,
          save = api.save,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) {
          console.warn("V63.4 Video System skipped: core not ready");
          return;
        }
        const style = document.createElement("style");
        style.textContent = `
    .v634-video-system{margin:12px 0;padding:13px;border-radius:20px;border:1px solid rgba(139,92,246,.25);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
    .v634-video-system h4{margin:0;font-size:15px}.v634-video-system p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}
    .v634-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v634-mode-btn{padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:var(--text);text-align:right}.v634-mode-btn strong{display:block;margin-bottom:3px}.v634-mode-btn small{color:var(--muted);line-height:1.5}.v634-mode-btn.active{background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(236,72,153,.15));border-color:rgba(255,255,255,.18)}
    .v634-single-note{padding:10px;border-radius:16px;border:1px solid rgba(34,197,94,.18);background:rgba(34,197,94,.07);color:#bbf7d0;font-size:12px;line-height:1.65}
    .v634-hide-playlist .v52-playlist-box{display:none!important}.v634-video-single-player{display:grid;gap:12px}.v634-video-single-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.v634-video-side{display:grid;gap:10px;align-content:start}.v634-video-side .v56-player-tools{margin-top:0}
    @media(max-width:1020px){.v634-video-single-layout{grid-template-columns:1fr}.v634-mode-grid{grid-template-columns:1fr}.v634-video-side{min-width:0}}
  `;
        document.head.appendChild(style);

        function E(v) {
          return esc
            ? esc(v || "")
            : String(v || "").replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        }
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function isPodcastType(t) {
          t = String(t || "");
          return (
            t.includes("بودكاست") || t.includes("محاضرة") || t.includes("دورة")
          );
        }
        function videoId(url) {
          url = String(url || "");
          let m = url.match(/[?&]v=([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/youtu\.be\/([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/embed\/([\w-]{6,})/);
          return m ? m[1] : "";
        }
        function watchUrl(id, url) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : String(url || "");
        }
        function embedHtml(k) {
          const url = String(k.mediaUrl || k.link || "");
          const yid = k.youtubeVideoId || videoId(url);
          if (yid) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const local = /^(file|content):/i.test(location.protocol);
            if (local) {
              return `<div class="v55-https-card"><div><h3>التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتح النسخة المنشورة على HTTPS لتشغيل YouTube داخل المشروع وتتبع الدقائق تلقائيًا.</p><button class="btn" data-action="openExternal" data-url="${E(watchUrl(yid, url))}">فتح على YouTube</button></div></div>`;
            }
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${E(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● نفس نظام القوائم: دقائق + ملاحظات موقّتة + ملخص + اقتباسات</div>`;
          }
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<div class="player-frame-wrap v2"><video controls src="${E(k.mediaData)}"></video></div>`;
          return `<div class="empty">أضف رابط YouTube أو ارفع فيديو من تعديل المعرفة.</div>`;
        }
        function currentVideoMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function setVideoMode(mode) {
          const box = document.getElementById("k_typeFields");
          if (!box) return;
          box.classList.toggle("v634-hide-playlist", mode !== "playlist");
          document
            .querySelectorAll(".v634-mode-btn")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === mode),
            );
        }
        function titleFromUrlFallback(url) {
          const id = videoId(url);
          return id ? "YouTube Video — " + id : "";
        }
        async function fetchTitleFromUrl(url) {
          url = String(url || "").trim();
          if (!url) return "";
          try {
            const r = await fetch(
              "https://noembed.com/embed?url=" + encodeURIComponent(url),
            );
            const d = await r.json();
            return d && d.title ? String(d.title) : "";
          } catch (e) {
            return "";
          }
        }
        function attachAutoTitle() {
          const url = document.getElementById("k_mediaUrl"),
            title = document.getElementById("k_title");
          if (!url || !title || url.dataset.v634Title) return;
          url.dataset.v634Title = "1";
          let last = "";
          const run = async () => {
            const v = url.value.trim();
            if (!v || v === last) return;
            last = v;
            if (title.value.trim() && title.dataset.autoFilled !== "1") return;
            const fb = titleFromUrlFallback(v);
            if (fb) {
              title.value = fb;
              title.dataset.autoFilled = "1";
            }
            const real = await fetchTitleFromUrl(v);
            if (
              real &&
              (!title.value.trim() || title.dataset.autoFilled === "1")
            ) {
              title.value = real;
              title.dataset.autoFilled = "1";
            }
          };
          url.addEventListener("input", () => setTimeout(run, 450));
          url.addEventListener("blur", run);
        }
        function enhanceVideoForm() {
          const fields = document.getElementById("k_typeFields"),
            sel = document.getElementById("k_type");
          if (!fields || !sel) return;
          const typ = sel.value || "";
          const isVid = isVideoType(typ);
          if (!isVid) {
            return;
          }
          if (!fields.querySelector(".v634-video-system")) {
            const playlistUrl =
              document.getElementById("k_playlistUrl")?.value || "";
            const mode = playlistUrl ? "playlist" : "single";
            fields.insertAdjacentHTML(
              "afterbegin",
              `<div class="v634-video-system"><h4>🎥 نظام الفيديو</h4><p>اختار هل تضيف فيديو منفرد بكل أدوات القائمة، أم تستورد Playlist كاملة.</p><div class="v634-mode-grid"><button type="button" class="v634-mode-btn ${mode === "single" ? "active" : ""}" data-mode="single"><strong>🎬 فيديو فقط</strong><small>دقائق، ملاحظات موقّتة، ملخص، اقتباسات، تطبيق.</small></button><button type="button" class="v634-mode-btn ${mode === "playlist" ? "active" : ""}" data-mode="playlist"><strong>📺 قائمة فيديوهات</strong><small>استيراد Playlist وإنشاء كارت لكل فيديو.</small></button></div><div class="v634-single-note">في وضع الفيديو المنفرد، اترك رابط Playlist فارغ. اسم الفيديو سيُسحب تلقائيًا من الرابط عند الإمكان.</div></div>`,
            );
            fields
              .querySelectorAll(".v634-mode-btn")
              .forEach((btn) =>
                btn.addEventListener("click", () =>
                  setVideoMode(btn.dataset.mode),
                ),
              );
            setVideoMode(mode);
          }
          attachAutoTitle();
        }
        const oldAdd = Actions.addKnowledge,
          oldEdit = Actions.editKnowledge,
          oldSaveK = Actions.saveKnowledge,
          oldOpen = Actions.openKnowledgePlayer;
        Actions.addKnowledge = function () {
          const r = oldAdd.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        Actions.editKnowledge = function (id) {
          const r = oldEdit.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        const mo = new MutationObserver(() => setTimeout(enhanceVideoForm, 60));
        mo.observe(document.body, { childList: true, subtree: true });
        Actions.saveKnowledge = async function (id) {
          const typ = (document.getElementById("k_type") || {}).value || "";
          const isVid = isVideoType(typ);
          const mode = isVid ? currentVideoMode() : "";
          const pl = document.getElementById("k_playlistUrl");
          if (isVid && mode === "single" && pl) pl.value = "";
          const url = (document.getElementById("k_mediaUrl") || {}).value || "";
          const titleBefore =
            (document.getElementById("k_title") || {}).value || "";
          const before = new Set((state.knowledge || []).map((x) => x.id));
          const res = await oldSaveK.apply(this, arguments);
          setTimeout(() => {
            if (!isVid) return;
            const obj = id
              ? (state.knowledge || []).find((x) => x.id === id)
              : (state.knowledge || []).find((x) => !before.has(x.id));
            if (!obj) return;
            obj.videoMode = mode || "single";
            if (mode === "single") {
              obj.isPlaylistItem = false;
              obj.playlistGroupId = "";
              obj.playlistGroup = "";
              obj.playlistUrl = "";
              obj.playlistId = "";
              obj.playlistIndex = 0;
              obj.playlistTotal = 0;
              obj.mediaType = obj.mediaType || "YouTube";
              obj.youtubeVideoId =
                obj.youtubeVideoId ||
                videoId(url || obj.mediaUrl || obj.link || "");
              if (titleBefore) obj.title = titleBefore;
            }
            save();
            render();
          }, 260);
          return res;
        };
        function enhanceSinglePlayer(id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k || !isVideoType(k.type) || k.isPlaylistItem) return;
          const shell = document.querySelector(".player-shell");
          if (!shell) return;
          if (document.getElementById("v634SingleVideoTools")) return;
          const tools = v56api.getVideoTools ? v56api.getVideoTools()(k) : "";
          const side = shell.querySelector(".player-side") || shell.children[1];
          if (side) {
            side.insertAdjacentHTML(
              "beforeend",
              `<div id="v634SingleVideoTools">${tools || ""}</div>`,
            );
            const info = side.querySelector(".item b");
            if (info) info.textContent = "تقدم الفيديو المنفرد";
          }
        }
        Actions.openKnowledgePlayer = function (id, btn) {
          const r = oldOpen.apply(this, arguments);
          setTimeout(() => enhanceSinglePlayer(id), 250);
          return r;
        };
        toast(
          "V63.4 جاهز: فيديو منفرد أو قائمة + أدوات القائمة للفيديو المنفرد",
        );
      })();

      /* script section 4 */
      (function () {
        "use strict";
        /* V63.1 hardening patch: fixes existing broken handlers without adding features. */
        function $(id) {
          return document.getElementById(id);
        }
        function safeToast(msg) {
          try {
            window.MogahedOSX && window.MogahedOSX.toast
              ? window.MogahedOSX.toast(msg)
              : console.log(msg);
          } catch (e) {}
        }

        // The core calls readFile(...) in later overrides but never defined it. Keep same behavior as readDataFile, just return dataURL.
        window.readFile =
          window.readFile ||
          function (file, cb) {
            try {
              if (!file) {
                cb && cb("");
                return;
              }
              var r = new FileReader();
              r.onload = function () {
                cb && cb(r.result || "");
              };
              r.onerror = function () {
                safeToast("تعذر قراءة الملف");
                cb && cb("");
              };
              r.readAsDataURL(file);
            } catch (e) {
              safeToast("تعذر قراءة الملف");
              cb && cb("");
            }
          };

        function waitReady(cb, t) {
          t = t || 0;
          if (window.MogahedOSX && window.MogahedOSX.Actions) {
            cb(window.MogahedOSX);
            return;
          }
          if (t > 120) return;
          setTimeout(function () {
            waitReady(cb, t + 1);
          }, 50);
        }

        waitReady(function (api) {
          var Actions = api.Actions,
            state = api.state,
            save = api.save,
            render = api.render,
            toast = api.toast;

          // Safe modal close for every existing data-action="closeModal" button.
          var oldClose = Actions.closeModal;
          Actions.closeModal = function () {
            try {
              if (oldClose) return oldClose.apply(this, arguments);
            } catch (e) {}
            var m = $("modal");
            if (m) m.classList.remove("open", "player-mode");
            var b = $("modalBody");
            if (b) b.innerHTML = "";
          };

          // Guard focus close so it never crashes if notes node is missing after a render.
          var oldCloseFocus = Actions.closeFocus;
          Actions.closeFocus = function () {
            try {
              return oldCloseFocus.apply(this, arguments);
            } catch (e) {
              var ov = $("focusOverlay");
              if (ov) ov.classList.remove("open");
              state.focusSessions = state.focusSessions || [];
              state.focusSessions.unshift({
                id: Date.now().toString(36),
                date: new Date().toLocaleString("ar-EG"),
                notes: ($("focusNotes") && $("focusNotes").value) || "",
              });
              save();
              render();
              toast("تم حفظ جلسة التركيز");
            }
          };

          // Fix local file/PDF save path if the older override throws because readFile was missing.
          var oldSaveKnowledge = Actions.saveKnowledge;
          Actions.saveKnowledge = function (id) {
            try {
              return oldSaveKnowledge.apply(this, arguments);
            } catch (e) {
              toast("تم إصلاح مسار حفظ الملف، أعد الضغط على حفظ مرة أخرى.");
              console.warn("saveKnowledge guarded:", e);
            }
          };

          // Avoid repeated clicks while a long save/generate action is running.
          document.addEventListener(
            "click",
            function (e) {
              var b = e.target.closest("button[data-action]");
              if (!b) return;
              var a = b.getAttribute("data-action") || "";
              if (/save|generate|fetch|restore|backup/i.test(a)) {
                b.classList.add("is-busy");
                setTimeout(function () {
                  b.classList.remove("is-busy");
                }, 1200);
              }
            },
            true,
          );

          // Clear stale search results when tapping outside.
          document.addEventListener("click", function (e) {
            var box = $("searchResults"),
              input = $("globalSearch");
            if (!box || !input) return;
            if (!e.target.closest(".searchbox")) box.style.display = "none";
          });

          // Normalize existing corrupted/old entries softly; no data deletion.
          try {
            (state.knowledge || []).forEach(function (k) {
              if (k.mediaUrl && !k.link) k.link = k.mediaUrl;
              if (k.pdfData && !k.mediaData) {
                k.mediaData = k.pdfData;
                k.mediaMime = k.mediaMime || "application/pdf";
              }
              if (typeof k.progress === "string")
                k.progress = Number(k.progress) || 0;
            });
            save();
          } catch (e) {}

          safeToast(
            "V63.1: تم إصلاح الاستقرار وتحسين UX بدون إضافة مميزات جديدة",
          );
        });
      })();

      /* ===== V63.4 Video System: single video vs playlist + playlist tools for single videos ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const v56api = window.MogahedOSX_V56 || {};
        const state = api.state,
          Actions = api.Actions,
          render = api.render,
          save = api.save,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) {
          console.warn("V63.4 Video System skipped: core not ready");
          return;
        }
        const style = document.createElement("style");
        style.textContent = `
    .v634-video-system{margin:12px 0;padding:13px;border-radius:20px;border:1px solid rgba(139,92,246,.25);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
    .v634-video-system h4{margin:0;font-size:15px}.v634-video-system p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}
    .v634-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v634-mode-btn{padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:var(--text);text-align:right}.v634-mode-btn strong{display:block;margin-bottom:3px}.v634-mode-btn small{color:var(--muted);line-height:1.5}.v634-mode-btn.active{background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(236,72,153,.15));border-color:rgba(255,255,255,.18)}
    .v634-single-note{padding:10px;border-radius:16px;border:1px solid rgba(34,197,94,.18);background:rgba(34,197,94,.07);color:#bbf7d0;font-size:12px;line-height:1.65}
    .v634-hide-playlist .v52-playlist-box{display:none!important}.v634-video-single-player{display:grid;gap:12px}.v634-video-single-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.v634-video-side{display:grid;gap:10px;align-content:start}.v634-video-side .v56-player-tools{margin-top:0}
    @media(max-width:1020px){.v634-video-single-layout{grid-template-columns:1fr}.v634-mode-grid{grid-template-columns:1fr}.v634-video-side{min-width:0}}
  `;
        document.head.appendChild(style);

        function E(v) {
          return esc
            ? esc(v || "")
            : String(v || "").replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        }
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function isPodcastType(t) {
          t = String(t || "");
          return (
            t.includes("بودكاست") || t.includes("محاضرة") || t.includes("دورة")
          );
        }
        function videoId(url) {
          url = String(url || "");
          let m = url.match(/[?&]v=([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/youtu\.be\/([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/embed\/([\w-]{6,})/);
          return m ? m[1] : "";
        }
        function watchUrl(id, url) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : String(url || "");
        }
        function embedHtml(k) {
          const url = String(k.mediaUrl || k.link || "");
          const yid = k.youtubeVideoId || videoId(url);
          if (yid) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const local = /^(file|content):/i.test(location.protocol);
            if (local) {
              return `<div class="v55-https-card"><div><h3>التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتح النسخة المنشورة على HTTPS لتشغيل YouTube داخل المشروع وتتبع الدقائق تلقائيًا.</p><button class="btn" data-action="openExternal" data-url="${E(watchUrl(yid, url))}">فتح على YouTube</button></div></div>`;
            }
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${E(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● نفس نظام القوائم: دقائق + ملاحظات موقّتة + ملخص + اقتباسات</div>`;
          }
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<div class="player-frame-wrap v2"><video controls src="${E(k.mediaData)}"></video></div>`;
          return `<div class="empty">أضف رابط YouTube أو ارفع فيديو من تعديل المعرفة.</div>`;
        }
        function currentVideoMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function setVideoMode(mode) {
          const box = document.getElementById("k_typeFields");
          if (!box) return;
          box.classList.toggle("v634-hide-playlist", mode !== "playlist");
          document
            .querySelectorAll(".v634-mode-btn")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === mode),
            );
        }
        function titleFromUrlFallback(url) {
          const id = videoId(url);
          return id ? "YouTube Video — " + id : "";
        }
        async function fetchTitleFromUrl(url) {
          url = String(url || "").trim();
          if (!url) return "";
          try {
            const r = await fetch(
              "https://noembed.com/embed?url=" + encodeURIComponent(url),
            );
            const d = await r.json();
            return d && d.title ? String(d.title) : "";
          } catch (e) {
            return "";
          }
        }
        function attachAutoTitle() {
          const url = document.getElementById("k_mediaUrl"),
            title = document.getElementById("k_title");
          if (!url || !title || url.dataset.v634Title) return;
          url.dataset.v634Title = "1";
          let last = "";
          const run = async () => {
            const v = url.value.trim();
            if (!v || v === last) return;
            last = v;
            if (title.value.trim() && title.dataset.autoFilled !== "1") return;
            const fb = titleFromUrlFallback(v);
            if (fb) {
              title.value = fb;
              title.dataset.autoFilled = "1";
            }
            const real = await fetchTitleFromUrl(v);
            if (
              real &&
              (!title.value.trim() || title.dataset.autoFilled === "1")
            ) {
              title.value = real;
              title.dataset.autoFilled = "1";
            }
          };
          url.addEventListener("input", () => setTimeout(run, 450));
          url.addEventListener("blur", run);
        }
        function enhanceVideoForm() {
          const fields = document.getElementById("k_typeFields"),
            sel = document.getElementById("k_type");
          if (!fields || !sel) return;
          const typ = sel.value || "";
          const isVid = isVideoType(typ);
          if (!isVid) {
            return;
          }
          if (!fields.querySelector(".v634-video-system")) {
            const playlistUrl =
              document.getElementById("k_playlistUrl")?.value || "";
            const mode = playlistUrl ? "playlist" : "single";
            fields.insertAdjacentHTML(
              "afterbegin",
              `<div class="v634-video-system"><h4>🎥 نظام الفيديو</h4><p>اختار هل تضيف فيديو منفرد بكل أدوات القائمة، أم تستورد Playlist كاملة.</p><div class="v634-mode-grid"><button type="button" class="v634-mode-btn ${mode === "single" ? "active" : ""}" data-mode="single"><strong>🎬 فيديو فقط</strong><small>دقائق، ملاحظات موقّتة، ملخص، اقتباسات، تطبيق.</small></button><button type="button" class="v634-mode-btn ${mode === "playlist" ? "active" : ""}" data-mode="playlist"><strong>📺 قائمة فيديوهات</strong><small>استيراد Playlist وإنشاء كارت لكل فيديو.</small></button></div><div class="v634-single-note">في وضع الفيديو المنفرد، اترك رابط Playlist فارغ. اسم الفيديو سيُسحب تلقائيًا من الرابط عند الإمكان.</div></div>`,
            );
            fields
              .querySelectorAll(".v634-mode-btn")
              .forEach((btn) =>
                btn.addEventListener("click", () =>
                  setVideoMode(btn.dataset.mode),
                ),
              );
            setVideoMode(mode);
          }
          attachAutoTitle();
        }
        const oldAdd = Actions.addKnowledge,
          oldEdit = Actions.editKnowledge,
          oldSaveK = Actions.saveKnowledge,
          oldOpen = Actions.openKnowledgePlayer;
        Actions.addKnowledge = function () {
          const r = oldAdd.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        Actions.editKnowledge = function (id) {
          const r = oldEdit.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        const mo = new MutationObserver(() => setTimeout(enhanceVideoForm, 60));
        mo.observe(document.body, { childList: true, subtree: true });
        Actions.saveKnowledge = async function (id) {
          const typ = (document.getElementById("k_type") || {}).value || "";
          const isVid = isVideoType(typ);
          const mode = isVid ? currentVideoMode() : "";
          const pl = document.getElementById("k_playlistUrl");
          if (isVid && mode === "single" && pl) pl.value = "";
          const url = (document.getElementById("k_mediaUrl") || {}).value || "";
          const titleBefore =
            (document.getElementById("k_title") || {}).value || "";
          const before = new Set((state.knowledge || []).map((x) => x.id));
          const res = await oldSaveK.apply(this, arguments);
          setTimeout(() => {
            if (!isVid) return;
            const obj = id
              ? (state.knowledge || []).find((x) => x.id === id)
              : (state.knowledge || []).find((x) => !before.has(x.id));
            if (!obj) return;
            obj.videoMode = mode || "single";
            if (mode === "single") {
              obj.isPlaylistItem = false;
              obj.playlistGroupId = "";
              obj.playlistGroup = "";
              obj.playlistUrl = "";
              obj.playlistId = "";
              obj.playlistIndex = 0;
              obj.playlistTotal = 0;
              obj.mediaType = obj.mediaType || "YouTube";
              obj.youtubeVideoId =
                obj.youtubeVideoId ||
                videoId(url || obj.mediaUrl || obj.link || "");
              if (titleBefore) obj.title = titleBefore;
            }
            save();
            render();
          }, 260);
          return res;
        };
        function enhanceSinglePlayer(id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k || !isVideoType(k.type) || k.isPlaylistItem) return;
          const shell = document.querySelector(".player-shell");
          if (!shell) return;
          if (document.getElementById("v634SingleVideoTools")) return;
          const tools = v56api.getVideoTools ? v56api.getVideoTools()(k) : "";
          const side = shell.querySelector(".player-side") || shell.children[1];
          if (side) {
            side.insertAdjacentHTML(
              "beforeend",
              `<div id="v634SingleVideoTools">${tools || ""}</div>`,
            );
            const info = side.querySelector(".item b");
            if (info) info.textContent = "تقدم الفيديو المنفرد";
          }
        }
        Actions.openKnowledgePlayer = function (id, btn) {
          const r = oldOpen.apply(this, arguments);
          setTimeout(() => enhanceSinglePlayer(id), 250);
          return r;
        };
        toast(
          "V63.4 جاهز: فيديو منفرد أو قائمة + أدوات القائمة للفيديو المنفرد",
        );
      })();

      /* script section 5 */
      (function () {
        "use strict";
        function wait(cb, t) {
          t = t || 0;
          if (window.MogahedOSX && window.MogahedOSX.Actions) {
            cb(window.MogahedOSX);
            return;
          }
          if (t < 160)
            setTimeout(function () {
              wait(cb, t + 1);
            }, 50);
        }
        function E(s) {
          try {
            return window.MogahedOSX.esc(String(s == null ? "" : s));
          } catch (e) {
            return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
              return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[
                c
              ];
            });
          }
        }
        wait(function (api) {
          var state = api.state,
            Actions = api.Actions,
            save = api.save,
            render = api.render,
            toast = api.toast;
          state.settings = state.settings || {};
          state.settings.ai = state.settings.ai || {};
          var NAV = [
            ["home", "الرئيسية", "🏠"],
            ["actionHub", "التنفيذ", "⚡"],
            ["knowledge", "المعرفة", "🧠"],
            ["wins", "الفوز", "🏆"],
            ["more", "المزيد", "☰"],
            ["now", "الآن", "🎯"],
            ["projects", "المشاريع", "📌"],
            ["goals", "الأهداف", "◎"],
            ["focus", "التركيز", "◷"],
            ["reviews", "المراجعات", "✓"],
            ["decisions", "القرارات", "◇"],
            ["crm", "العلاقات", "☏"],
            ["finance", "المال", "ج"],
            ["timeline", "الإنجازات", "↗"],
            ["vault", "Brain Inbox", "💡"],
            ["graph", "Knowledge Graph", "⟲"],
            ["archive", "الأرشيف", "▤"],
            ["settings", "الإعدادات", "⚙"],
          ];
          function sel(a, b) {
            return String(a || "") === String(b || "") ? "selected" : "";
          }
          function get(id) {
            var el = document.getElementById(id);
            return el ? el.value : "";
          }
          function aiCard() {
            var ai = state.settings.ai || {};
            var provider = ai.provider || "claude";
            return (
              '<div class="card v633-col-12 v60-ai-card" id="v633AICard"><div class="v633-section-title"><div><h3>🤖 إعدادات الذكاء الاصطناعي</h3><p>منفصلة عن أنواع المعرفة حتى لا يحصل تداخل. Claude أساسي و Gemini احتياطي.</p></div><span class="pill v60-provider-pill">الحالي: ' +
              E(provider === "gemini" ? "Gemini" : "Claude") +
              '</span></div><div class="v60-provider-select"><button class="v60-provider-tab ' +
              (provider === "claude" ? "active" : "") +
              '" data-action="v60SetProvider" data-provider="claude">Claude أساسي</button><button class="v60-provider-tab ' +
              (provider === "gemini" ? "active" : "") +
              '" data-action="v60SetProvider" data-provider="gemini">Gemini احتياطي</button></div><div class="v633-ai-models"><div class="v633-model-card"><div class="v633-model-head"><span class="v633-model-icon">🧠</span><div><h4>Claude / Anthropic</h4><p>للتلخيص الطويل واستخراج الأفكار والإجراءات.</p></div></div><label>Claude API Key</label><input id="v60AnthropicKey" type="password" value="' +
              E(ai.anthropicKey || "") +
              '" placeholder="sk-ant-api03-..."><label>النموذج</label><select id="v60AnthropicModel"><option value="claude-sonnet-4-6" ' +
              sel(ai.anthropicModel, "claude-sonnet-4-6") +
              '>⚖️ Sonnet — متوازن</option><option value="claude-opus-4-8" ' +
              sel(ai.anthropicModel, "claude-opus-4-8") +
              '>💎 Opus — أقوى</option><option value="claude-haiku-4-5" ' +
              sel(ai.anthropicModel, "claude-haiku-4-5") +
              '>⚡ Haiku — أسرع</option><option value="claude-fable-5" ' +
              sel(ai.anthropicModel, "claude-fable-5") +
              '>🚀 Fable — متقدم</option></select><div class="row" style="margin-top:10px"><button class="btn" data-action="v60SaveAISettings">💾 حفظ</button><button class="btn secondary" data-action="v60TestClaude">🧪 اختبار</button><button class="btn danger" data-action="v60ClearClaude">مسح</button></div></div><div class="v633-model-card"><div class="v633-model-head"><span class="v633-model-icon">✨</span><div><h4>Gemini احتياطي</h4><p>بديل سريع عند الحاجة أو عند تعطل المزود الأساسي.</p></div></div><label>Gemini API Key</label><input id="v60GeminiKey" type="password" value="' +
              E(ai.geminiKey || "") +
              '" placeholder="AIza..."><label>النموذج</label><select id="v60GeminiModel"><option value="gemini-2.0-flash" ' +
              sel(ai.geminiModel || ai.model, "gemini-2.0-flash") +
              '>⚡ 2.0 Flash</option><option value="gemini-2.5-flash" ' +
              sel(ai.geminiModel || ai.model, "gemini-2.5-flash") +
              '>🚀 2.5 Flash</option><option value="gemini-1.5-flash" ' +
              sel(ai.geminiModel || ai.model, "gemini-1.5-flash") +
              '>🏃 1.5 Flash</option><option value="gemini-1.5-pro" ' +
              sel(ai.geminiModel || ai.model, "gemini-1.5-pro") +
              '>💼 1.5 Pro</option></select><div class="row" style="margin-top:10px"><button class="btn" data-action="v60SaveAISettings">💾 حفظ</button><button class="btn secondary" data-action="v60TestGemini">🧪 اختبار</button><button class="btn danger" data-action="v60ClearGemini">مسح</button></div></div></div><div class="v60-ai-warning" style="margin-top:12px">🔐 المفاتيح محفوظة على جهازك فقط داخل المتصفح.</div></div>'
            );
          }
          function templates() {
            return '<div class="v633-template-grid"><button class="v633-template" data-action="v633ApplyTemplate" data-t1="#8b5cf6" data-t2="#ec4899" style="--t1:#8b5cf6;--t2:#ec4899"><b>Premium Purple</b><small>الشكل الحالي الهادئ</small><i></i></button><button class="v633-template" data-action="v633ApplyTemplate" data-t1="#0ea5e9" data-t2="#22c55e" style="--t1:#0ea5e9;--t2:#22c55e"><b>Calm Focus</b><small>أزرق/أخضر للتركيز</small><i></i></button><button class="v633-template" data-action="v633ApplyTemplate" data-t1="#f59e0b" data-t2="#ef4444" style="--t1:#f59e0b;--t2:#ef4444"><b>Warm Energy</b><small>دافئ وحماسي</small><i></i></button></div>';
          }
          function typeEditor(key, title, sub) {
            var arr = (state.types && state.types[key]) || [];
            return (
              '<div class="v633-accordion open" data-acc="' +
              key +
              '"><button class="v633-acc-head" data-action="v633ToggleAcc" data-key="' +
              key +
              '"><span><b>' +
              E(title) +
              '</b><br><small class="muted">' +
              E(sub) +
              '</small></span><span>⌄</span></button><div class="v633-acc-body">' +
              arr
                .map(function (t) {
                  return (
                    '<div class="v633-type-row"><span>' +
                    E(t) +
                    '</span><button class="btn secondary mini" data-action="v633EditType" data-key="' +
                    key +
                    '" data-value="' +
                    E(t) +
                    '">تعديل</button><button class="btn danger mini" data-action="removeType" data-key="' +
                    key +
                    '" data-value="' +
                    E(t) +
                    '">حذف</button></div>'
                  );
                })
                .join("") +
              '<div class="v633-add-row"><input id="type_' +
              key +
              '" placeholder="إضافة جديد..."><button class="btn mini" data-action="addType" data-key="' +
              key +
              '">إضافة</button></div></div></div>'
            );
          }
          function modules() {
            return (
              '<div class="v633-mod-grid v65-module-list">' +
              NAV.map(function (n) {
                var on = state.modules && state.modules[n[0]] !== false;
                return (
                  '<label class="v633-mod-card"><input type="checkbox" class="moduleToggle" data-module="' +
                  n[0] +
                  '" ' +
                  (on ? "checked" : "") +
                  "> <span>" +
                  n[2] +
                  " " +
                  E(n[1]) +
                  "</span></label>"
                );
              }).join("") +
              '</div><button class="btn" data-action="saveModules" style="margin-top:10px">حفظ الموديولات</button>'
            );
          }
          function viewSettingsNew() {
            if (document.getElementById("pageTitle")) {
              document.getElementById("pageTitle").textContent =
                "الإعدادات والتحكم";
              document.getElementById("pageSub").textContent =
                "تنظيم أوضح بدون تداخل أو تكرار.";
            }
            var p = state.profile || {},
              s = state.settings || {};
            return (
              '<div class="v633-settings-grid"><div class="card v633-col-6"><div class="v633-section-title"><div><h3>👤 البروفايل</h3><p>بياناتك الأساسية داخل المشروع.</p></div></div><label>الاسم</label><input id="setName" value="' +
              E(p.name || "") +
              '"><label>اللقب</label><input id="setTitle" value="' +
              E(p.title || "") +
              '"><label>الرؤية الشخصية</label><textarea id="setVision">' +
              E(p.vision || "") +
              '</textarea><label>صورة البروفايل</label><input type="file" id="setAvatar" accept="image/*"><button class="btn" data-action="saveProfile" style="margin-top:10px">حفظ البروفايل</button></div><div class="card v633-col-6"><div class="v633-section-title"><div><h3>🎨 قوالب الشكل</h3><p>اختار قالب جاهز يغير ألوان المشروع بسرعة.</p></div></div><label>اللون الأول</label><input type="color" id="setAccent" value="' +
              E(s.accent || "#8b5cf6") +
              '"><label>اللون الثاني</label><input type="color" id="setAccent2" value="' +
              E(s.accent2 || "#ec4899") +
              '"><button class="btn" data-action="saveColors" style="margin-top:10px">حفظ الألوان</button>' +
              templates() +
              "</div>" +
              aiCard() +
              '<div class="card v633-col-12"><div class="v633-section-title"><div><h3>🧩 الأنواع والمجالات</h3><p>كل قائمة قابلة للفتح والقفل، وبجانب كل عنصر تعديل وحذف.</p></div></div><div class="grid" style="margin-top:0"><div class="col-4">' +
              typeEditor(
                "knowledge",
                "أنواع المعرفة",
                "كتاب / بودكاست / فيديو...",
              ) +
              '</div><div class="col-4">' +
              typeEditor("projects", "أنواع المشاريع", "شخصي / عمل / تعلم...") +
              '</div><div class="col-4">' +
              typeEditor("areas", "مجالات الحياة", "الدين / الصحة / المال...") +
              '</div></div></div><div class="card v633-col-12"><div class="v633-section-title"><div><h3>🧱 الموديولات</h3><p>تنظيم أوضح بأيقونات بدل القائمة الطويلة.</p></div></div>' +
              modules() +
              '</div><div class="card v633-col-12 v633-smart-reset"><h3>منطقة التصفير الذكي</h3><p class="muted">احذف جزء محدد بدل تصفير المشروع كله. يوجد تحذير قبل أي حذف.</p><label>ماذا تريد حذف؟</label><select id="smartResetTarget"><option value="">اختر...</option><option value="allSystem">تصفير النظام بالكامل</option><option value="knowledge">المعرفة</option><option value="actions">الإجراءات</option><option value="projects">المشاريع</option><option value="tasks">المهام</option><option value="goals">الأهداف</option><option value="reviews">المراجعات</option><option value="archive">الأرشيف</option></select><div class="type-warning">⚠️ هذه العملية لا يمكن التراجع عنها إلا لو عندك Export Backup أو نسخة Google Drive.</div><div class="row" style="margin-top:12px"><button class="btn danger" data-action="smartReset">تنفيذ الحذف المحدد</button><button class="btn secondary" data-action="exportData">Export Backup</button></div></div></div>'
            );
          }
          if (api.setViewSettings) api.setViewSettings(viewSettingsNew);

          Actions.v633ApplyTemplate = function (_, el) {
            var t1 = el.dataset.t1,
              t2 = el.dataset.t2;
            state.settings = state.settings || {};
            state.settings.accent = t1;
            state.settings.accent2 = t2;
            save();
            render();
            toast("تم تطبيق القالب");
          };
          Actions.v633ToggleAcc = function (_, el) {
            var key = el.dataset.key;
            var box = document.querySelector(
              '.v633-accordion[data-acc="' + key + '"]',
            );
            if (box) box.classList.toggle("open");
          };
          Actions.v633EditType = function (_, el) {
            var key = el.dataset.key,
              oldVal = el.dataset.value;
            var nv = prompt("اكتب الاسم الجديد", oldVal);
            if (!nv) return;
            nv = nv.trim();
            if (!nv || nv === oldVal) return;
            state.types = state.types || {};
            state.types[key] = (state.types[key] || []).map(function (x) {
              return x === oldVal ? nv : x;
            });
            if (key === "knowledge")
              (state.knowledge || []).forEach(function (x) {
                if (x.type === oldVal) x.type = nv;
              });
            if (key === "projects")
              (state.projects || []).forEach(function (x) {
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
                (state[c] || []).forEach(function (x) {
                  if (x.area === oldVal) x.area = nv;
                });
              });
            }
            save();
            render();
            toast("تم تعديل الاسم في المشروع بالكامل");
          };
          Actions.smartReset = function () {
            var k = get("smartResetTarget");
            if (!k) return toast("اختر الجزء المراد حذفه");
            var label = (
              document.getElementById("smartResetTarget") &&
              document.getElementById("smartResetTarget").selectedOptions &&
              document.getElementById("smartResetTarget").selectedOptions[0]
                ? document.getElementById("smartResetTarget").selectedOptions[0]
                    .textContent
                : k
            ).trim();
            if (!confirm("تأكيد حذف " + label + "؟ خذ نسخة احتياطية أولاً."))
              return;
            if (k === "allSystem") {
              if (
                !confirm(
                  "تأكيد أخير: سيتم تصفير النظام بالكامل والرجوع لبداية جديدة. هل تريد التنفيذ؟",
                )
              )
                return;
              localStorage.removeItem(KEY);
              state = seed();
              route = "home";
              if (window.MogahedOSX) window.MogahedOSX.state = state;
              render();
              toast("تم تصفير النظام بالكامل");
              return;
            }
            state[k] = [];
            save();
            render();
            toast("تم الحذف المحدد");
          };
          Actions.openHelp = function () {
            var body =
              '<div class="card"><h2>📘 تعليمات استخدام Mogahed OS X</h2><p class="muted">دليل سريع لكل جزء في المشروع.</p><div class="v633-help-grid"><div class="v633-help-card"><h4>🏠 الرئيسية</h4><p>ابدأ منها يومك: المهمة الحالية، استكمال المعرفة، والطوارئ وقت التشتت.</p></div><div class="v633-help-card"><h4>⚡ التنفيذ</h4><p>حوّل أي فكرة أو معرفة إلى إجراء واضح. استخدم Focus Mode لتنفيذ مهمة واحدة.</p></div><div class="v633-help-card"><h4>🧠 المعرفة</h4><p>أضف كتاب/بودكاست/فيديو، اكتب ملخصك، سجّل الأفكار، وحوّل أهم فكرة لإجراء.</p></div><div class="v633-help-card"><h4>🏆 الفوز</h4><p>متابعة الإنجازات الصغيرة وجلسات التركيز وما تم إنهاؤه.</p></div><div class="v633-help-card"><h4>⚙ الإعدادات</h4><p>تعديل البروفايل، الألوان، الأنواع، الموديولات، AI، النسخ الاحتياطي، وصحة التخزين.</p></div><div class="v633-help-card"><h4>☁️ النسخ الاحتياطي</h4><p>استخدم Export دائماً، وفعل Google Drive Backup لحماية البيانات مثل واتساب.</p></div></div></div>';
            document.getElementById("view").innerHTML = body;
            document.getElementById("pageTitle").textContent = "تعليمات";
            document.getElementById("pageSub").textContent =
              "شرح كامل لاستخدام المشروع.";
          };
          function afterRender() {
            var r = api.getRoute ? api.getRoute() : "";
            document.body.classList.toggle("v63-home-theme", r === "home");
            var hc = document.getElementById("v62HealthCard");
            if (hc) {
              hc.classList.add("v62-health-card-wrap");
              var row = hc.querySelector(".row");
              if (row && !row.querySelector('[data-action="importData"]'))
                row.insertAdjacentHTML(
                  "afterbegin",
                  '<button class="btn secondary" data-action="importData">📥 استيراد</button>',
                );
            }
            var more = document.querySelector("#view .hub-grid.more-grid");
            if (more && !more.querySelector('[data-action="openHelp"]'))
              more.insertAdjacentHTML(
                "beforeend",
                '<button class="hub-tile" data-action="openHelp"><span>📘</span><b>تعليمات</b><small>شرح استخدام المشروع كامل</small></button>',
              );
          }
          var oldRender = api.render;
          api.render = function () {
            var res = oldRender.apply(this, arguments);
            setTimeout(afterRender, 0);
            return res;
          };
          var mo = new MutationObserver(function () {
            setTimeout(afterRender, 0);
          });
          mo.observe(document.body, { childList: true, subtree: true });
          setTimeout(afterRender, 200);
          render();
        });
      })();

      /* ===== V63.4 Video System: single video vs playlist + playlist tools for single videos ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const v56api = window.MogahedOSX_V56 || {};
        const state = api.state,
          Actions = api.Actions,
          render = api.render,
          save = api.save,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) {
          console.warn("V63.4 Video System skipped: core not ready");
          return;
        }
        const style = document.createElement("style");
        style.textContent = `
    .v634-video-system{margin:12px 0;padding:13px;border-radius:20px;border:1px solid rgba(139,92,246,.25);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
    .v634-video-system h4{margin:0;font-size:15px}.v634-video-system p{margin:0;color:var(--muted);font-size:12px;line-height:1.7}
    .v634-mode-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v634-mode-btn{padding:12px;border-radius:17px;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.045);color:var(--text);text-align:right}.v634-mode-btn strong{display:block;margin-bottom:3px}.v634-mode-btn small{color:var(--muted);line-height:1.5}.v634-mode-btn.active{background:linear-gradient(135deg,rgba(139,92,246,.30),rgba(236,72,153,.15));border-color:rgba(255,255,255,.18)}
    .v634-single-note{padding:10px;border-radius:16px;border:1px solid rgba(34,197,94,.18);background:rgba(34,197,94,.07);color:#bbf7d0;font-size:12px;line-height:1.65}
    .v634-hide-playlist .v52-playlist-box{display:none!important}.v634-video-single-player{display:grid;gap:12px}.v634-video-single-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(300px,.65fr);gap:12px}.v634-video-side{display:grid;gap:10px;align-content:start}.v634-video-side .v56-player-tools{margin-top:0}
    @media(max-width:1020px){.v634-video-single-layout{grid-template-columns:1fr}.v634-mode-grid{grid-template-columns:1fr}.v634-video-side{min-width:0}}
  `;
        document.head.appendChild(style);

        function E(v) {
          return esc
            ? esc(v || "")
            : String(v || "").replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        }
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function isPodcastType(t) {
          t = String(t || "");
          return (
            t.includes("بودكاست") || t.includes("محاضرة") || t.includes("دورة")
          );
        }
        function videoId(url) {
          url = String(url || "");
          let m = url.match(/[?&]v=([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/youtu\.be\/([\w-]{6,})/);
          if (m) return m[1];
          m = url.match(/embed\/([\w-]{6,})/);
          return m ? m[1] : "";
        }
        function watchUrl(id, url) {
          return id
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(id)
            : String(url || "");
        }
        function embedHtml(k) {
          const url = String(k.mediaUrl || k.link || "");
          const yid = k.youtubeVideoId || videoId(url);
          if (yid) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const local = /^(file|content):/i.test(location.protocol);
            if (local) {
              return `<div class="v55-https-card"><div><h3>التشغيل الداخلي يحتاج HTTPS</h3><p>أنت فاتح المشروع من ملف محلي / content://. افتح النسخة المنشورة على HTTPS لتشغيل YouTube داخل المشروع وتتبع الدقائق تلقائيًا.</p><button class="btn" data-action="openExternal" data-url="${E(watchUrl(yid, url))}">فتح على YouTube</button></div></div>`;
            }
            const src = `https://www.youtube.com/embed/${encodeURIComponent(yid)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${start ? `&start=${start}` : ""}`;
            return `<div class="player-frame-wrap v2"><iframe id="v56ytframe" src="${E(src)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></div><div class="v56-auto-badge">● نفس نظام القوائم: دقائق + ملاحظات موقّتة + ملخص + اقتباسات</div>`;
          }
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<div class="player-frame-wrap v2"><video controls src="${E(k.mediaData)}"></video></div>`;
          return `<div class="empty">أضف رابط YouTube أو ارفع فيديو من تعديل المعرفة.</div>`;
        }
        function currentVideoMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function setVideoMode(mode) {
          const box = document.getElementById("k_typeFields");
          if (!box) return;
          box.classList.toggle("v634-hide-playlist", mode !== "playlist");
          document
            .querySelectorAll(".v634-mode-btn")
            .forEach((b) =>
              b.classList.toggle("active", b.dataset.mode === mode),
            );
        }
        function titleFromUrlFallback(url) {
          const id = videoId(url);
          return id ? "YouTube Video — " + id : "";
        }
        async function fetchTitleFromUrl(url) {
          url = String(url || "").trim();
          if (!url) return "";
          try {
            const r = await fetch(
              "https://noembed.com/embed?url=" + encodeURIComponent(url),
            );
            const d = await r.json();
            return d && d.title ? String(d.title) : "";
          } catch (e) {
            return "";
          }
        }
        function attachAutoTitle() {
          const url = document.getElementById("k_mediaUrl"),
            title = document.getElementById("k_title");
          if (!url || !title || url.dataset.v634Title) return;
          url.dataset.v634Title = "1";
          let last = "";
          const run = async () => {
            const v = url.value.trim();
            if (!v || v === last) return;
            last = v;
            if (title.value.trim() && title.dataset.autoFilled !== "1") return;
            const fb = titleFromUrlFallback(v);
            if (fb) {
              title.value = fb;
              title.dataset.autoFilled = "1";
            }
            const real = await fetchTitleFromUrl(v);
            if (
              real &&
              (!title.value.trim() || title.dataset.autoFilled === "1")
            ) {
              title.value = real;
              title.dataset.autoFilled = "1";
            }
          };
          url.addEventListener("input", () => setTimeout(run, 450));
          url.addEventListener("blur", run);
        }
        function enhanceVideoForm() {
          const fields = document.getElementById("k_typeFields"),
            sel = document.getElementById("k_type");
          if (!fields || !sel) return;
          const typ = sel.value || "";
          const isVid = isVideoType(typ);
          if (!isVid) {
            return;
          }
          if (!fields.querySelector(".v634-video-system")) {
            const playlistUrl =
              document.getElementById("k_playlistUrl")?.value || "";
            const mode = playlistUrl ? "playlist" : "single";
            fields.insertAdjacentHTML(
              "afterbegin",
              `<div class="v634-video-system"><h4>🎥 نظام الفيديو</h4><p>اختار هل تضيف فيديو منفرد بكل أدوات القائمة، أم تستورد Playlist كاملة.</p><div class="v634-mode-grid"><button type="button" class="v634-mode-btn ${mode === "single" ? "active" : ""}" data-mode="single"><strong>🎬 فيديو فقط</strong><small>دقائق، ملاحظات موقّتة، ملخص، اقتباسات، تطبيق.</small></button><button type="button" class="v634-mode-btn ${mode === "playlist" ? "active" : ""}" data-mode="playlist"><strong>📺 قائمة فيديوهات</strong><small>استيراد Playlist وإنشاء كارت لكل فيديو.</small></button></div><div class="v634-single-note">في وضع الفيديو المنفرد، اترك رابط Playlist فارغ. اسم الفيديو سيُسحب تلقائيًا من الرابط عند الإمكان.</div></div>`,
            );
            fields
              .querySelectorAll(".v634-mode-btn")
              .forEach((btn) =>
                btn.addEventListener("click", () =>
                  setVideoMode(btn.dataset.mode),
                ),
              );
            setVideoMode(mode);
          }
          attachAutoTitle();
        }
        const oldAdd = Actions.addKnowledge,
          oldEdit = Actions.editKnowledge,
          oldSaveK = Actions.saveKnowledge,
          oldOpen = Actions.openKnowledgePlayer;
        Actions.addKnowledge = function () {
          const r = oldAdd.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        Actions.editKnowledge = function (id) {
          const r = oldEdit.apply(this, arguments);
          setTimeout(enhanceVideoForm, 120);
          return r;
        };
        const mo = new MutationObserver(() => setTimeout(enhanceVideoForm, 60));
        mo.observe(document.body, { childList: true, subtree: true });
        Actions.saveKnowledge = async function (id) {
          const typ = (document.getElementById("k_type") || {}).value || "";
          const isVid = isVideoType(typ);
          const mode = isVid ? currentVideoMode() : "";
          const pl = document.getElementById("k_playlistUrl");
          if (isVid && mode === "single" && pl) pl.value = "";
          const url = (document.getElementById("k_mediaUrl") || {}).value || "";
          const titleBefore =
            (document.getElementById("k_title") || {}).value || "";
          const before = new Set((state.knowledge || []).map((x) => x.id));
          const res = await oldSaveK.apply(this, arguments);
          setTimeout(() => {
            if (!isVid) return;
            const obj = id
              ? (state.knowledge || []).find((x) => x.id === id)
              : (state.knowledge || []).find((x) => !before.has(x.id));
            if (!obj) return;
            obj.videoMode = mode || "single";
            if (mode === "single") {
              obj.isPlaylistItem = false;
              obj.playlistGroupId = "";
              obj.playlistGroup = "";
              obj.playlistUrl = "";
              obj.playlistId = "";
              obj.playlistIndex = 0;
              obj.playlistTotal = 0;
              obj.mediaType = obj.mediaType || "YouTube";
              obj.youtubeVideoId =
                obj.youtubeVideoId ||
                videoId(url || obj.mediaUrl || obj.link || "");
              if (titleBefore) obj.title = titleBefore;
            }
            save();
            render();
          }, 260);
          return res;
        };
        function enhanceSinglePlayer(id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k || !isVideoType(k.type) || k.isPlaylistItem) return;
          const shell = document.querySelector(".player-shell");
          if (!shell) return;
          if (document.getElementById("v634SingleVideoTools")) return;
          const tools = v56api.getVideoTools ? v56api.getVideoTools()(k) : "";
          const side = shell.querySelector(".player-side") || shell.children[1];
          if (side) {
            side.insertAdjacentHTML(
              "beforeend",
              `<div id="v634SingleVideoTools">${tools || ""}</div>`,
            );
            const info = side.querySelector(".item b");
            if (info) info.textContent = "تقدم الفيديو المنفرد";
          }
        }
        Actions.openKnowledgePlayer = function (id, btn) {
          const r = oldOpen.apply(this, arguments);
          setTimeout(() => enhanceSinglePlayer(id), 250);
          return r;
        };
        toast(
          "V63.4 جاهز: فيديو منفرد أو قائمة + أدوات القائمة للفيديو المنفرد",
        );
      })();

      /* ===== V63.5 Video Form Separation + Per-Video Details Accordions ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const state = api.state,
          Actions = api.Actions,
          save = api.save,
          render = api.render,
          toast = api.toast,
          esc = api.esc,
          get = api.get;
        if (!state || !Actions) return;
        const E = (v) =>
          esc
            ? esc(String(v == null ? "" : v))
            : String(v == null ? "" : v).replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        const css = document.createElement("style");
        css.id = "v63-5-video-system-ux";
        css.textContent = `
    .v635-single-chunk{display:block}.smart-type-fields.v635-playlist .v635-single-chunk{display:none!important}.smart-type-fields.v635-single .v52-playlist-box{display:none!important}.smart-type-fields.v635-playlist .v52-playlist-box{display:grid!important;margin-top:10px!important}
    .v635-video-details{margin:12px 0;border:1px solid rgba(255,255,255,.09);border-radius:20px;background:rgba(255,255,255,.035);overflow:hidden}.v635-video-details.v635-hide{display:none!important}
    .v635-details-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;background:linear-gradient(135deg,rgba(139,92,246,.16),rgba(236,72,153,.07));color:#fff;text-align:right;border:0}.v635-details-head strong{font-size:15px}.v635-details-head span{color:var(--muted);font-size:12px}.v635-details-head i{font-style:normal;transition:.18s}
    .v635-video-details:not(.open) .v635-details-body{display:none}.v635-video-details.open .v635-details-head i{transform:rotate(180deg)}.v635-details-body{padding:12px;display:grid;gap:8px}.v635-details-body textarea{min-height:92px}.v635-mini-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v635-video-tools-card{margin-top:10px}.v635-video-tools-card .v635-details-body{max-height:42vh;overflow:auto}
    .v635-mode-status{padding:10px;border-radius:16px;background:rgba(34,197,94,.07);border:1px solid rgba(34,197,94,.18);color:#bbf7d0;font-size:12px;line-height:1.65}.smart-type-fields.v635-playlist .v635-mode-status{background:rgba(59,130,246,.08);border-color:rgba(59,130,246,.20);color:#bfdbfe}
    @media(max-width:520px){.v635-mini-grid{grid-template-columns:1fr}.v635-details-head{padding:11px 12px}.v635-details-body{padding:10px}}
  `;
        document.head.appendChild(css);
        function isVideoType(t) {
          t = String(t || "");
          return t.includes("فيديو") || t.toLowerCase().includes("video");
        }
        function getMode() {
          return (
            document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
            "single"
          );
        }
        function detailsFormHTML(k = {}, prefix = "v635") {
          return `<div class="v635-mini-grid"><div><label>التقييم من 1 إلى 5</label><input id="${prefix}_rating" type="number" min="0" max="5" value="${Number(k.rating || 0)}"></div><div><label>مراجعة قادمة</label><input id="${prefix}_review" type="date" value="${E(k.reviewDate || "")}"></div></div><label>ملخصك الشخصي</label><textarea id="${prefix}_summary">${E(k.summary || "")}</textarea><label>أهم الأفكار / الاقتباسات</label><textarea id="${prefix}_ideas">${E(k.ideas || "")}</textarea><label>ماذا ستنفذ؟</label><textarea id="${prefix}_action">${E(k.actionTaken || k.application || "")}</textarea><label>ما النتيجة؟</label><textarea id="${prefix}_result">${E(k.resultAchieved || k.result || "")}</textarea><label>أهم درس؟</label><textarea id="${prefix}_lesson">${E(k.lessonLearned || "")}</textarea>`;
        }
        function applyVideoMode() {
          const sel = document.getElementById("k_type"),
            fields = document.getElementById("k_typeFields"),
            body = document.getElementById("modalBody");
          if (!sel || !fields || !body || !isVideoType(sel.value)) return;
          const smart = fields.querySelector(".smart-type-fields") || fields;
          const mode = getMode();
          smart.classList.toggle("v635-single", mode === "single");
          smart.classList.toggle("v635-playlist", mode === "playlist");
          Array.from(smart.children).forEach((ch) => {
            if (
              ch.classList.contains("v634-video-system") ||
              ch.classList.contains("v52-playlist-box") ||
              ch.classList.contains("v635-mode-status")
            )
              return;
            ch.classList.add("v635-single-chunk");
          });
          let status = smart.querySelector(".v635-mode-status");
          if (!status) {
            status = document.createElement("div");
            status.className = "v635-mode-status";
            smart.insertBefore(
              status,
              smart.querySelector(".v52-playlist-box") ||
                smart.children[1] ||
                null,
            );
          }
          status.textContent =
            mode === "single"
              ? "وضع فيديو فقط: يظهر رابط/ملف الفيديو فقط، والتفاصيل محفوظة داخل نفس الفيديو."
              : "وضع قائمة فيديوهات: تظهر خصائص Playlist فقط، وسيتم إنشاء كل فيديو ببياناته الخاصة.";
          const pl = smart.querySelector(".v52-playlist-box");
          if (pl) pl.style.display = mode === "playlist" ? "grid" : "none";
          if (!body.querySelector("#v635FormVideoDetails")) {
            const saveBtn = body.querySelector('[data-action="saveKnowledge"]');
            const wrap = document.createElement("div");
            wrap.id = "v635FormVideoDetails";
            wrap.className = "v635-video-details open";
            wrap.innerHTML = `<button type="button" class="v635-details-head"><div><strong>📝 تفاصيل هذا الفيديو</strong><br><span>التقييم، الملخص، الأفكار، الاقتباسات، التطبيق والنتيجة</span></div><i>⌄</i></button><div class="v635-details-body"></div>`;
            if (saveBtn) body.insertBefore(wrap, saveBtn);
            else body.appendChild(wrap);
            const wb = wrap.querySelector(".v635-details-body");
            const start = fields.nextSibling;
            let n = start;
            const moved = [];
            while (
              n &&
              n !== wrap &&
              !(n.nodeType === 1 && n.matches('[data-action="saveKnowledge"]'))
            ) {
              const next = n.nextSibling;
              moved.push(n);
              n = next;
            }
            moved.forEach((x) => wb.appendChild(x));
          }
          const det = body.querySelector("#v635FormVideoDetails");
          if (det) det.classList.toggle("v635-hide", mode === "playlist");
        }
        document.addEventListener("click", (e) => {
          const b = e.target.closest(".v634-mode-btn,.v635-details-head");
          if (b && b.classList.contains("v634-mode-btn"))
            setTimeout(applyVideoMode, 30);
          if (b && b.classList.contains("v635-details-head")) {
            const p = b.closest(".v635-video-details");
            if (p) p.classList.toggle("open");
          }
        });
        const mo = new MutationObserver(() => setTimeout(applyVideoMode, 80));
        mo.observe(document.body, { childList: true, subtree: true });
        setTimeout(applyVideoMode, 250);
        function videoDetailsCard(k, prefix) {
          return `<div class="v635-video-details v635-video-tools-card" id="${prefix}_box"><button type="button" class="v635-details-head"><div><strong>📝 تفاصيل هذا الفيديو</strong><br><span>كل فيديو له ملخصه وأفكاره واقتباساته منفصلة</span></div><i>⌄</i></button><div class="v635-details-body">${detailsFormHTML(k, prefix)}<button class="btn" data-action="v635SaveVideoDetails" data-id="${E(k.id)}" data-prefix="${E(prefix)}">حفظ تفاصيل الفيديو</button></div></div>`;
        }
        Actions.v635SaveVideoDetails = function (id, el) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return toast("الفيديو غير موجود");
          const p = el?.dataset?.prefix || "v635";
          const val = (name) =>
            document.getElementById(p + "_" + name)?.value || "";
          k.rating = Number(val("rating") || 0);
          k.reviewDate = val("review");
          k.summary = val("summary");
          k.ideas = val("ideas");
          k.application = val("action");
          k.actionTaken = val("action");
          k.result = val("result");
          k.resultAchieved = val("result");
          k.lessonLearned = val("lesson");
          save();
          render();
          toast("تم حفظ تفاصيل الفيديو");
        };
        const oldOpenPlaylist = Actions.openPlaylistGroup;
        if (oldOpenPlaylist) {
          Actions.openPlaylistGroup = function () {
            const res = oldOpenPlaylist.apply(this, arguments);
            setTimeout(() => {
              const activeBtn = document.querySelector(
                '.v53-video-row.active [data-action="openPlaylistGroup"]',
              );
              const id =
                activeBtn?.dataset?.video ||
                arguments[1] ||
                arguments[0]?.dataset?.video;
              const k = (state.knowledge || []).find((x) => x.id === id);
              if (!k) return;
              const left = document.querySelector(".v53-playlist-modal > div");
              if (left && !document.getElementById("v635_playlist_details"))
                left.insertAdjacentHTML(
                  "beforeend",
                  videoDetailsCard(k, "v635_playlist"),
                );
            }, 180);
            return res;
          };
        }
        const oldOpenPlayer = Actions.openKnowledgePlayer;
        Actions.openKnowledgePlayer = function (id) {
          const res = oldOpenPlayer.apply(this, arguments);
          setTimeout(() => {
            const k = (state.knowledge || []).find((x) => x.id === id);
            if (!k || !isVideoType(k.type)) return;
            const target =
              document.querySelector(".player-side") ||
              document.querySelector(".player-shell > *:last-child") ||
              document.getElementById("modalBody");
            if (target && !document.getElementById("v635_single_details"))
              target.insertAdjacentHTML(
                "beforeend",
                videoDetailsCard(k, "v635_single"),
              );
          }, 220);
          return res;
        };
        toast("V63.5: فصل فيديو/قائمة + تفاصيل داخل كل فيديو");
      })();

      /* ===== V63.6 Single Video Deep Fix: cover, nested tools, auto progress, wins ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const state = api.state,
          Actions = api.Actions,
          save = api.save,
          render = api.render,
          toast = api.toast,
          esc = api.esc;
        if (!state || !Actions) return;
        const E = (v) =>
          esc
            ? esc(String(v == null ? "" : v))
            : String(v == null ? "" : v).replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        const css = document.createElement("style");
        css.id = "v63-6-single-video-deep-fix";
        css.textContent = `
    .v636-cover-under-title{width:100%;aspect-ratio:16/9;border-radius:20px;object-fit:cover;background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);margin:10px 0 12px;box-shadow:0 16px 34px rgba(0,0,0,.22)}
    .v636-player-main{display:grid;gap:12px}.v636-watch-card{border-radius:22px;overflow:hidden;background:#050611;border:1px solid rgba(255,255,255,.09)}
    .v636-accordion{border:1px solid rgba(255,255,255,.09);border-radius:20px;background:rgba(255,255,255,.035);overflow:hidden;margin-top:10px}.v636-accordion-head{width:100%;display:flex;justify-content:space-between;align-items:center;gap:10px;padding:13px 14px;background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(236,72,153,.07));color:#fff;text-align:right}.v636-accordion-head b{font-size:15px}.v636-accordion-head small{display:block;color:var(--muted);font-size:11px;margin-top:3px}.v636-accordion-head i{font-style:normal;transition:.18s}.v636-accordion:not(.open) .v636-accordion-body{display:none}.v636-accordion.open .v636-accordion-head i{transform:rotate(180deg)}.v636-accordion-body{padding:12px;display:grid;gap:9px}.v636-accordion-body textarea{min-height:92px}.v636-progress-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v636-note-item{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:10px;border-radius:14px;border:1px solid rgba(255,255,255,.07);background:rgba(255,255,255,.04)}.v636-time{min-width:58px;padding:6px 8px;border-radius:999px;background:rgba(59,130,246,.13);border:1px solid rgba(59,130,246,.25);color:#bfdbfe;font-size:12px}.v636-muted-note{padding:10px;border-radius:16px;border:1px solid rgba(245,158,11,.24);background:rgba(245,158,11,.08);color:#fde68a;font-size:12px;line-height:1.65}.v636-player-cover{width:100%;aspect-ratio:16/9;border-radius:18px;object-fit:cover;border:1px solid rgba(255,255,255,.09);background:rgba(255,255,255,.04);margin-bottom:10px}
    @media(max-width:1020px){.v636-progress-grid,.v636-note-item{grid-template-columns:1fr}.v636-watch-card{border-radius:18px}.v636-accordion-body{padding:10px}.v636-player-cover{border-radius:16px}}
  `;
        document.head.appendChild(css);
        function isVideo(k) {
          const t = String(k?.type || "");
          return (
            t.includes("فيديو") ||
            t.includes("دورة") ||
            t.toLowerCase().includes("video") ||
            k?.mediaMime?.startsWith("video/") ||
            String(k?.mediaType || "").includes("YouTube") ||
            String(k?.mediaType || "").includes("MP4")
          );
        }
        function isSingle(k) {
          return isVideo(k) && !k.isPlaylistItem;
        }
        function yidFromUrl(u) {
          try {
            return (
              (typeof youtubeIdFromUrl === "function"
                ? youtubeIdFromUrl(u)
                : "") || ""
            );
          } catch (e) {
            return "";
          }
        }
        function watchUrl(k) {
          const y = k.youtubeVideoId || yidFromUrl(k.mediaUrl || k.link || "");
          return y
            ? "https://www.youtube.com/watch?v=" + encodeURIComponent(y)
            : k.mediaUrl || k.link || "";
        }
        function fmt(sec) {
          sec = Math.max(0, Math.floor(Number(sec || 0)));
          const m = Math.floor(sec / 60),
            s = sec % 60;
          return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        }
        function progress(k) {
          try {
            return knowledgeProgress(k) || 0;
          } catch (e) {
            const t = Number(k.totalUnits || k.totalMinutes || 0),
              c = Number(k.currentUnit || k.currentMinute || 0);
            return t
              ? Math.min(100, Math.round((c / t) * 100))
              : Number(k.progress || 0) || 0;
          }
        }
        function noteList(k, prefix) {
          const notes = (k.timedNotes || [])
            .slice()
            .sort((a, b) => Number(a.timeSec || 0) - Number(b.timeSec || 0));
          return (
            notes
              .map(
                (n) =>
                  `<div class="v636-note-item"><button class="v636-time" data-action="v636Seek" data-time="${Number(n.timeSec || 0)}">${fmt(n.timeSec)}</button><div>${E(n.text || "")}</div><button class="btn danger mini" data-action="v636DeleteNote" data-id="${E(k.id)}" data-note="${E(n.id)}" data-prefix="${E(prefix)}">حذف</button></div>`,
              )
              .join("") ||
            '<div class="empty">لا توجد ملاحظات أو اقتباسات بعد.</div>'
          );
        }
        function videoTools(k, prefix = "v636") {
          const p = progress(k),
            cur = Number(k.currentUnit || k.currentMinute || 0),
            total = Number(k.totalUnits || k.totalMinutes || 0);
          return `<div class="v636-accordion open" id="${prefix}_progress_box"><button type="button" class="v636-accordion-head"><div><b>⏱️ التقدم والدقائق</b><small>يحفظ تلقائيًا أثناء التشغيل قدر الإمكان</small></div><i>⌄</i></button><div class="v636-accordion-body"><div class="v636-progress-grid"><div><label>شاهدت دقيقة</label><input id="${prefix}_current" type="number" value="${cur}"></div><div><label>إجمالي الدقائق</label><input id="${prefix}_total" type="number" value="${total}"></div></div><div class="progress"><div class="bar" id="${prefix}_bar" style="width:${p}%"></div></div><p class="muted" id="${prefix}_remaining">المتبقي: ${Math.max(0, total - cur)} دقيقة</p><div class="row"><button class="btn" data-action="v636SaveProgress" data-id="${E(k.id)}" data-prefix="${E(prefix)}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${E(k.id)}">أنهيت الفيديو</button></div></div></div>
    <div class="v636-accordion open" id="${prefix}_notes_box"><button type="button" class="v636-accordion-head"><div><b>✍️ ملاحظات واقتباسات بالوقت</b><small>اكتب أثناء المشاهدة والوقت يتحفظ معها</small></div><i>⌄</i></button><div class="v636-accordion-body"><textarea id="${prefix}_note_text" placeholder="اكتب ملاحظة أو اقتباس من اللحظة الحالية..."></textarea><button class="btn" data-action="v636AddNote" data-id="${E(k.id)}" data-prefix="${E(prefix)}">+ حفظ ملاحظة بالوقت الحالي</button><div id="${prefix}_notes_list">${noteList(k, prefix)}</div></div></div>
    <div class="v636-accordion" id="${prefix}_details_box"><button type="button" class="v636-accordion-head"><div><b>📝 تفاصيل الفيديو</b><small>الملخص، الأفكار، التطبيق، النتيجة</small></div><i>⌄</i></button><div class="v636-accordion-body"><label>التقييم من 1 إلى 5</label><input id="${prefix}_rating" type="number" min="0" max="5" value="${Number(k.rating || 0)}"><label>ملخصك الشخصي</label><textarea id="${prefix}_summary">${E(k.videoSummary || k.summary || "")}</textarea><label>أهم الأفكار / الاقتباسات</label><textarea id="${prefix}_ideas">${E(k.ideas || "")}</textarea><label>ماذا ستنفذ؟</label><textarea id="${prefix}_action">${E(k.actionTaken || k.application || "")}</textarea><label>ما النتيجة؟</label><textarea id="${prefix}_result">${E(k.resultAchieved || k.result || "")}</textarea><label>أهم درس؟</label><textarea id="${prefix}_lesson">${E(k.lessonLearned || "")}</textarea><button class="btn" data-action="v636SaveDetails" data-id="${E(k.id)}" data-prefix="${E(prefix)}">حفظ التفاصيل</button></div></div>`;
        }
        function localVideoHtml(k) {
          return k.mediaData && String(k.mediaMime || "").startsWith("video/")
            ? `<video id="v636LocalVideo" src="${E(k.mediaData)}" controls playsinline style="width:100%;display:block"></video>`
            : "";
        }
        function youtubeHtml(k) {
          const y = k.youtubeVideoId || yidFromUrl(k.mediaUrl || k.link || "");
          if (!y) return "";
          const start = Math.max(
            0,
            Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
          );
          if (
            typeof isLocalOrContentContext === "function" &&
            isLocalOrContentContext()
          )
            return `<div class="v55-https-card"><div><h3>الرابط صحيح، لكن YouTube مانع التشغيل هنا</h3><p>عشان التتبع التلقائي الحقيقي لفيديو YouTube لازم تفتح المشروع من HTTPS. من الملف المحلي نقدر نحفظ يدويًا والملاحظات، وافتح الفيديو خارجيًا.</p><div class="row"><button class="btn" data-action="openExternal" data-url="${E(watchUrl(k))}">فتح على YouTube</button><button class="btn secondary" data-action="copyText" data-text="${E(watchUrl(k))}">نسخ الرابط</button></div></div></div>`;
          const origin =
            location.origin && location.origin !== "null"
              ? `&origin=${encodeURIComponent(location.origin)}`
              : "";
          return `<div class="player-frame-wrap v2"><iframe id="v636ytframe" src="https://www.youtube.com/embed/${encodeURIComponent(y)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${origin}${start ? `&start=${start}` : ""}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen></iframe></div>`;
        }
        let player = null,
          timer = null,
          activeId = "";
        function stop() {
          if (timer) clearInterval(timer);
          timer = null;
          try {
            player && player.destroy && player.destroy();
          } catch (e) {}
          player = null;
          activeId = "";
        }
        const oldClose = Actions.closeModal;
        Actions.closeModal = function () {
          stop();
          return oldClose
            ? oldClose.apply(this, arguments)
            : document
                .getElementById("modal")
                ?.classList.remove("open", "player-mode");
        };
        function persist(k, sec, dur) {
          if (!k) return;
          const cur = Math.max(
            Number(k.currentUnit || k.currentMinute || 0),
            Math.floor(Number(sec || 0) / 60),
          );
          const total = Math.max(
            Number(k.totalUnits || k.totalMinutes || 0),
            Math.ceil(Number(dur || 0) / 60) || 0,
          );
          k.currentUnit = k.currentMinute = cur;
          if (total) k.totalUnits = k.totalMinutes = total;
          if (k.totalUnits)
            k.progress = Math.min(
              100,
              Math.round((k.currentUnit / k.totalUnits) * 100),
            );
          save();
          updateUI(k, "v636");
          if (k.totalUnits && k.currentUnit >= k.totalUnits) {
            Actions.completeVideoItem(k.id);
          }
        }
        function updateUI(k, prefix) {
          const cur = Number(k.currentUnit || k.currentMinute || 0),
            total = Number(k.totalUnits || k.totalMinutes || 0),
            p = progress(k);
          const c = document.getElementById(prefix + "_current"),
            t = document.getElementById(prefix + "_total"),
            b = document.getElementById(prefix + "_bar"),
            r = document.getElementById(prefix + "_remaining");
          if (c) c.value = cur;
          if (t) t.value = total;
          if (b) b.style.width = p + "%";
          if (r)
            r.textContent = "المتبقي: " + Math.max(0, total - cur) + " دقيقة";
        }
        function initTracking(k) {
          stop();
          activeId = k.id;
          const lv = document.getElementById("v636LocalVideo");
          if (lv) {
            const tick = () =>
              persist(k, lv.currentTime || 0, lv.duration || 0);
            lv.addEventListener("loadedmetadata", tick);
            lv.addEventListener("timeupdate", () => {
              if (!timer) {
                timer = setTimeout(() => {
                  timer = null;
                  tick();
                }, 3000);
              }
            });
            lv.addEventListener("ended", () => {
              tick();
              Actions.completeVideoItem(k.id);
            });
            return;
          }
          if (
            !(window.YT && window.YT.Player) &&
            !document.querySelector(
              'script[src="https://www.youtube.com/iframe_api"]',
            )
          ) {
            const s = document.createElement("script");
            s.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(s);
          }
          const startYT = () => {
            if (
              !window.YT ||
              !window.YT.Player ||
              !document.getElementById("v636ytframe")
            )
              return;
            try {
              player = new YT.Player("v636ytframe", {
                events: {
                  onReady: () => {
                    timer = setInterval(() => {
                      try {
                        persist(
                          k,
                          player.getCurrentTime(),
                          player.getDuration(),
                        );
                      } catch (e) {}
                    }, 5000);
                  },
                  onStateChange: (e) => {
                    if (e.data === 0) {
                      try {
                        persist(
                          k,
                          player.getCurrentTime(),
                          player.getDuration(),
                        );
                      } catch (x) {}
                      Actions.completeVideoItem(k.id);
                    }
                  },
                },
              });
            } catch (e) {}
          };
          const old = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function () {
            try {
              old && old();
            } catch (e) {}
            startYT();
          };
          setTimeout(startYT, 1200);
        }
        function openSingle(k) {
          document.getElementById("modal")?.classList.add("player-mode");
          const cover = k.cover
            ? `<img class="v636-player-cover" src="${E(k.cover)}" onerror="this.style.display='none'">`
            : "";
          const media =
            localVideoHtml(k) ||
            youtubeHtml(k) ||
            '<div class="empty">لا يوجد فيديو صالح. أضف رابط YouTube أو ارفع MP4.</div>';
          openModal(
            "مشغل الفيديو",
            `<div class="player-head"><div class="player-title"><h3>${E(k.title || "فيديو")}</h3><p>${E(k.author || k.area || "")} • ${progress(k)}% مكتمل</p></div><div class="row"><button class="btn secondary mini" data-action="editKnowledge" data-id="${E(k.id)}">تعديل</button><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div><div class="player-shell"><div class="v636-player-main">${cover}<div class="v636-watch-card">${media}</div><div class="v636-muted-note">الغلاف تحت الاسم للفيديو المنفرد. التفاصيل والملاحظات هنا داخل الفيديو نفسه وبسهم فتح/قفل.</div></div><div class="player-side">${videoTools(k, "v636")}</div></div>`,
          );
          setTimeout(() => initTracking(k), 500);
        }
        const oldOpen = Actions.openKnowledgePlayer;
        Actions.openKnowledgePlayer = function (id, btn) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (k && isSingle(k)) {
            openSingle(k);
            return;
          }
          return oldOpen ? oldOpen.apply(this, arguments) : null;
        };
        // Add cover under title in knowledge cards for single videos
        const oldCard = window.cardKnowledge || cardKnowledge;
        cardKnowledge = function (k) {
          let html = oldCard(k);
          if (
            k &&
            isSingle(k) &&
            k.cover &&
            !html.includes("v636-cover-under-title")
          ) {
            html = html.replace(
              /(<div class="knowledge-title-row">[\s\S]*?<\/div>)/,
              `$1<img class="v636-cover-under-title" src="${E(k.cover)}" onerror="this.style.display='none'">`,
            );
          }
          return html;
        };
        // Buttons/actions
        Actions.v636SaveProgress = function (id, el) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const p = el?.dataset?.prefix || "v636";
          k.currentUnit = k.currentMinute = Number(
            document.getElementById(p + "_current")?.value || 0,
          );
          k.totalUnits = k.totalMinutes = Number(
            document.getElementById(p + "_total")?.value || 0,
          );
          k.progress = k.totalUnits
            ? Math.min(100, Math.round((k.currentUnit / k.totalUnits) * 100))
            : Number(k.progress || 0);
          save();
          updateUI(k, p);
          toast("تم حفظ التقدم");
        };
        Actions.v636SaveDetails = function (id, el) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const p = el?.dataset?.prefix || "v636";
          const val = (n) => document.getElementById(p + "_" + n)?.value || "";
          k.rating = Number(val("rating") || 0);
          k.summary = k.videoSummary = val("summary");
          k.ideas = val("ideas");
          k.application = k.actionTaken = val("action");
          k.result = k.resultAchieved = val("result");
          k.lessonLearned = val("lesson");
          save();
          render();
          toast("تم حفظ تفاصيل الفيديو");
        };
        Actions.v636AddNote = function (id, el) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const p = el?.dataset?.prefix || "v636";
          const txt = (
            document.getElementById(p + "_note_text")?.value || ""
          ).trim();
          if (!txt) return toast("اكتب الملاحظة أولاً");
          let sec = Math.floor(
            Number(k.currentUnit || k.currentMinute || 0) * 60,
          );
          try {
            if (player && player.getCurrentTime)
              sec = Math.floor(player.getCurrentTime() || sec);
          } catch (e) {}
          const lv = document.getElementById("v636LocalVideo");
          if (lv) sec = Math.floor(lv.currentTime || sec);
          k.timedNotes = k.timedNotes || [];
          k.timedNotes.push({
            id:
              Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            timeSec: sec,
            text: txt,
            created: new Date().toISOString(),
          });
          save();
          document.getElementById(p + "_note_text").value = "";
          const list = document.getElementById(p + "_notes_list");
          if (list) list.innerHTML = noteList(k, p);
          toast("تم حفظ الملاحظة بالوقت");
        };
        Actions.v636DeleteNote = function (id, el) {
          const k = (state.knowledge || []).find(
            (x) => x.id === (el?.dataset?.id || id),
          );
          if (!k) return;
          k.timedNotes = (k.timedNotes || []).filter(
            (n) => n.id !== (el?.dataset?.note || ""),
          );
          save();
          const p = el?.dataset?.prefix || "v636";
          const list = document.getElementById(p + "_notes_list");
          if (list) list.innerHTML = noteList(k, p);
        };
        Actions.v636Seek = function (_, el) {
          const sec = Number(el?.dataset?.time || 0);
          const lv = document.getElementById("v636LocalVideo");
          if (lv) {
            lv.currentTime = sec;
            lv.play && lv.play();
            return;
          }
          try {
            player && player.seekTo && player.seekTo(sec, true);
            player && player.playVideo && player.playVideo();
          } catch (e) {}
        };
        const oldComplete = Actions.completeVideoItem;
        Actions.completeVideoItem = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (k && isSingle(k)) {
            k.status = "done";
            k.finished = true;
            k.progress = 100;
            if (k.totalUnits) {
              k.currentUnit = k.currentMinute = k.totalUnits;
            }
            state.timeline = state.timeline || [];
            if (!state.timeline.some((t) => t.videoKnowledgeId === id))
              state.timeline.unshift({
                id: Date.now().toString(36),
                videoKnowledgeId: id,
                title: "أنهيت فيديو: " + (k.title || "فيديو"),
                date: new Date().toISOString().slice(0, 10),
                area: "التعلم",
                note: "تم إكمال الفيديو المنفرد ونقله ضمن الإنجازات.",
              });
            save();
            stop();
            document
              .getElementById("modal")
              ?.classList.remove("open", "player-mode");
            route = "wins";
            render();
            toast("تم نقل الفيديو إلى الإنجازات 🏆");
            return;
          }
          return oldComplete ? oldComplete.apply(this, arguments) : null;
        };
        // Try fill YouTube single metadata if API key exists when saving/opening edit fields
        async function fetchYouTubeMeta(k) {
          const y = k.youtubeVideoId || yidFromUrl(k.mediaUrl || k.link || "");
          const key =
            state.settings?.youtubeApiKey ||
            state.settings?.ytApiKey ||
            state.settings?.ai?.youtubeApiKey ||
            "";
          if (!y || !key) return;
          try {
            const r = await fetch(
              "https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=" +
                encodeURIComponent(y) +
                "&key=" +
                encodeURIComponent(key),
            );
            const d = await r.json();
            const it = d.items && d.items[0];
            if (!it) return;
            const sn = it.snippet || {};
            k.title = k.title || sn.title || k.title;
            k.author = k.author || sn.channelTitle || k.author;
            k.cover =
              k.cover ||
              sn.thumbnails?.high?.url ||
              sn.thumbnails?.medium?.url ||
              sn.thumbnails?.default?.url ||
              k.cover;
            if (typeof v52ParseIsoDuration === "function") {
              const mins = v52ParseIsoDuration(it.contentDetails?.duration);
              if (mins && !k.totalUnits) {
                k.totalUnits = k.totalMinutes = mins;
              }
            }
            save();
            render();
          } catch (e) {}
        }
        const oldSaveKnowledge = Actions.saveKnowledge;
        Actions.saveKnowledge = function (id, btn) {
          const res = oldSaveKnowledge
            ? oldSaveKnowledge.apply(this, arguments)
            : null;
          setTimeout(() => {
            const latest = (state.knowledge || [])[0];
            if (latest && isSingle(latest)) fetchYouTubeMeta(latest);
          }, 400);
          return res;
        };
        toast(
          "V63.6: فيديو منفرد عميق — غلاف، تفاصيل داخلية، ملاحظات بسهم، وتتبع إنجاز",
        );
      })();

      /* ===== V63.7 Final UX Fixes: video player + rescue todo ===== */
      (function () {
        const api = window.MogahedOSX || {};
        const state = api.state,
          Actions = api.Actions,
          save = api.save,
          render = api.render,
          toast = api.toast,
          esc = api.esc;
        if (!state || !Actions) return;
        const openModal = function (title, body) {
          const t = document.getElementById("modalTitle"),
            b = document.getElementById("modalBody"),
            m = document.getElementById("modal");
          if (t) t.textContent = title;
          if (b) b.innerHTML = body;
          if (m) m.classList.add("open");
        };
        const closeModal =
          api.closeModal ||
          function () {
            const m = document.getElementById("modal");
            if (m) m.classList.remove("open", "player-mode");
          };
        const setTitle = function (t, s) {
          const pt = document.getElementById("pageTitle"),
            ps = document.getElementById("pageSub");
          if (pt) pt.textContent = t;
          if (ps) ps.textContent = s || "";
        };
        const E = (v) =>
          esc
            ? esc(String(v == null ? "" : v))
            : String(v == null ? "" : v).replace(
                /[&<>"']/g,
                (m) =>
                  ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  })[m],
              );
        const style = document.createElement("style");
        style.id = "v63-7-final-ux-fixes";
        style.textContent = `
  #modalBody:has(.v634-video-system) #v635FormVideoDetails{display:none!important}
  #modalBody:has(.v634-video-system) .smart-type-fields>.form-two{display:none!important}
  .v637-player{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(290px,.65fr);gap:12px;height:calc(100vh - 84px);min-height:0}.v637-watch{min-height:280px;border-radius:22px;overflow:hidden;border:1px solid rgba(255,255,255,.09);background:#050611}.v637-watch iframe,.v637-watch video{width:100%;height:100%;min-height:280px;border:0;display:block}.v637-side{min-height:0;overflow:auto;display:grid;gap:10px;align-content:start}.v637-cover{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:18px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.05)}.v637-acc{border:1px solid rgba(255,255,255,.09);border-radius:20px;overflow:hidden;background:rgba(255,255,255,.035)}.v637-head{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;padding:13px 14px;background:linear-gradient(135deg,rgba(139,92,246,.18),rgba(236,72,153,.07));color:#fff;text-align:right}.v637-head small{display:block;color:var(--muted);font-size:11px;margin-top:3px}.v637-acc:not(.open) .v637-body{display:none}.v637-acc.open .v637-head i{transform:rotate(180deg)}.v637-body{padding:12px;display:grid;gap:9px}.v637-two{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v637-note{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:start;padding:10px;border-radius:14px;background:rgba(255,255,255,.04);border:1px solid rgba(255,255,255,.07)}.v637-time{padding:6px 8px;border-radius:999px;background:rgba(59,130,246,.13);border:1px solid rgba(59,130,246,.24);color:#bfdbfe;font-size:12px}.v637-rescue-task{padding:16px;border-radius:22px;border:1px solid rgba(249,115,22,.30);background:linear-gradient(135deg,rgba(239,68,68,.16),rgba(249,115,22,.08));margin:12px 0}.v637-todo-list{display:grid;gap:10px}.v637-todo{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:center;padding:12px;border-radius:18px;border:1px solid rgba(255,255,255,.08);background:rgba(255,255,255,.04)}.v637-todo input{width:22px;height:22px;accent-color:var(--brand)}.v637-todo.done{opacity:.62}.v637-todo.done b{text-decoration:line-through}.v637-todo small{display:block;color:var(--muted);margin-top:3px}.v637-task-add{display:grid;grid-template-columns:1fr auto;gap:8px;margin-top:10px}
  @media(max-width:1020px){.v637-player{grid-template-columns:1fr;grid-template-rows:minmax(240px,40vh) 1fr;height:calc(100vh - 74px)}.v637-watch iframe,.v637-watch video{min-height:240px}.v637-two,.v637-note,.v637-todo,.v637-task-add{grid-template-columns:1fr}.v637-body{padding:10px}}
  `;
        document.head.appendChild(style);
        function isVideo(k) {
          const t = String(k?.type || "").toLowerCase();
          return (
            t.includes("فيديو") ||
            t.includes("video") ||
            t.includes("دورة") ||
            String(k?.mediaMime || "").startsWith("video/") ||
            String(k?.mediaType || "")
              .toLowerCase()
              .includes("youtube") ||
            String(k?.mediaType || "").includes("MP4")
          );
        }
        function isSingle(k) {
          return isVideo(k) && !k.isPlaylistItem && !k.playlistGroupId;
        }
        function yid(u) {
          try {
            if (typeof youtubeIdFromUrl === "function")
              return youtubeIdFromUrl(u) || "";
          } catch (e) {}
          const m = String(u || "").match(
            /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/,
          );
          return m ? m[1] : "";
        }
        function pct(k) {
          const t = Number(k.totalUnits || k.totalMinutes || 0),
            c = Number(k.currentUnit || k.currentMinute || 0);
          return t
            ? Math.min(100, Math.round((c / t) * 100))
            : Number(k.progress || 0) || 0;
        }
        function fmt(sec) {
          sec = Math.max(0, Math.floor(Number(sec || 0)));
          const m = Math.floor(sec / 60),
            s = sec % 60;
          return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
        }
        function media(k) {
          if (k.mediaData && String(k.mediaMime || "").startsWith("video/"))
            return `<video id="v637Local" controls playsinline src="${E(k.mediaData)}"></video>`;
          const id = k.youtubeVideoId || yid(k.mediaUrl || k.link || "");
          if (id) {
            const start = Math.max(
              0,
              Math.floor(Number(k.currentUnit || k.currentMinute || 0) * 60),
            );
            const origin =
              location.origin && location.origin !== "null"
                ? "&origin=" + encodeURIComponent(location.origin)
                : "";
            return `<iframe id="v637YT" src="https://www.youtube.com/embed/${encodeURIComponent(id)}?rel=0&modestbranding=1&playsinline=1&enablejsapi=1${origin}${start ? "&start=" + start : ""}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; web-share" allowfullscreen></iframe>`;
          }
          const url = k.mediaUrl || k.link || "";
          return url
            ? `<div class="empty"><h3>تعذر التشغيل الداخلي لهذا الرابط</h3><button class="btn" data-action="openExternal" data-url="${E(url)}">فتح المصدر</button></div>`
            : `<div class="empty">أضف رابط فيديو أو ارفع MP4.</div>`;
        }
        function notes(k) {
          const arr = (k.timedNotes || [])
            .slice()
            .sort((a, b) => Number(a.timeSec || 0) - Number(b.timeSec || 0));
          return (
            arr
              .map(
                (n) =>
                  `<div class="v637-note"><button class="v637-time" data-action="v637Seek" data-time="${Number(n.timeSec || 0)}">${fmt(n.timeSec)}</button><div>${E(n.text || "")}</div><button class="btn danger mini" data-action="v637DeleteNote" data-id="${E(k.id)}" data-note="${E(n.id)}">حذف</button></div>`,
              )
              .join("") ||
            '<div class="empty">لا توجد ملاحظات أو اقتباسات بعد.</div>'
          );
        }
        function tools(k) {
          const c = Number(k.currentUnit || k.currentMinute || 0),
            t = Number(k.totalUnits || k.totalMinutes || 0);
          return `<div class="v637-acc open"><button type="button" class="v637-head"><div><b>⏱️ التقدم والدقائق</b><small>داخل المشاهدة فقط ويحفظ تلقائيًا قدر الإمكان</small></div><i>⌄</i></button><div class="v637-body"><div class="v637-two"><div><label>شاهدت دقيقة</label><input id="v637_current" type="number" value="${c}"></div><div><label>إجمالي الدقائق</label><input id="v637_total" type="number" value="${t}"></div></div><div class="progress"><div class="bar" id="v637_bar" style="width:${pct(k)}%"></div></div><p class="muted" id="v637_remaining">المتبقي: ${Math.max(0, t - c)} دقيقة</p><div class="row"><button class="btn" data-action="v637SaveProgress" data-id="${E(k.id)}">حفظ التقدم</button><button class="btn secondary" data-action="completeVideoItem" data-id="${E(k.id)}">أنهيت الفيديو</button></div></div></div><div class="v637-acc open"><button type="button" class="v637-head"><div><b>✍️ الملاحظات والاقتباسات</b><small>بسهم فتح/قفل وتتحفظ بالوقت</small></div><i>⌄</i></button><div class="v637-body"><textarea id="v637_note_text" placeholder="اكتب ملاحظة أو اقتباس من اللحظة الحالية..."></textarea><button class="btn" data-action="v637AddNote" data-id="${E(k.id)}">+ حفظ ملاحظة بالوقت الحالي</button><div id="v637_notes">${notes(k)}</div></div></div><div class="v637-acc"><button type="button" class="v637-head"><div><b>📝 تفاصيل الفيديو</b><small>الملخص، الأفكار، التطبيق والنتيجة</small></div><i>⌄</i></button><div class="v637-body"><label>التقييم من 1 إلى 5</label><input id="v637_rating" type="number" min="0" max="5" value="${Number(k.rating || 0)}"><label>ملخصك الشخصي</label><textarea id="v637_summary">${E(k.videoSummary || k.summary || "")}</textarea><label>أهم الأفكار</label><textarea id="v637_ideas">${E(k.ideas || "")}</textarea><label>ماذا ستنفذ؟</label><textarea id="v637_action">${E(k.actionTaken || k.application || "")}</textarea><label>ما النتيجة؟</label><textarea id="v637_result">${E(k.resultAchieved || k.result || "")}</textarea><label>أهم درس؟</label><textarea id="v637_lesson">${E(k.lessonLearned || "")}</textarea><button class="btn" data-action="v637SaveDetails" data-id="${E(k.id)}">حفظ تفاصيل الفيديو</button></div></div>`;
        }
        let player = null,
          track = null;
        function stop() {
          if (track) clearInterval(track);
          track = null;
          try {
            player && player.destroy && player.destroy();
          } catch (e) {}
          player = null;
        }
        function update(k) {
          const c = Number(k.currentUnit || k.currentMinute || 0),
            t = Number(k.totalUnits || k.totalMinutes || 0);
          const C = document.getElementById("v637_current"),
            T = document.getElementById("v637_total"),
            B = document.getElementById("v637_bar"),
            R = document.getElementById("v637_remaining");
          if (C) C.value = c;
          if (T) T.value = t;
          if (B) B.style.width = pct(k) + "%";
          if (R) R.textContent = "المتبقي: " + Math.max(0, t - c) + " دقيقة";
        }
        function persist(k, sec, dur) {
          const c = Math.floor(Number(sec || 0) / 60),
            t =
              Math.ceil(Number(dur || 0) / 60) ||
              Number(k.totalUnits || k.totalMinutes || 0) ||
              0;
          if (c > Number(k.currentUnit || k.currentMinute || 0))
            k.currentUnit = k.currentMinute = c;
          if (t) k.totalUnits = k.totalMinutes = t;
          k.progress = pct(k);
          save();
          update(k);
          if (t && c >= t - 1 && c > 0) Actions.completeVideoItem(k.id);
        }
        function init(k) {
          stop();
          const local = document.getElementById("v637Local");
          if (local) {
            const tick = () => persist(k, local.currentTime, local.duration);
            local.addEventListener("loadedmetadata", tick);
            local.addEventListener("timeupdate", () => {
              if (!track) {
                track = setTimeout(() => {
                  track = null;
                  tick();
                }, 2500);
              }
            });
            local.addEventListener("ended", () => {
              tick();
              Actions.completeVideoItem(k.id);
            });
            return;
          }
          const fr = document.getElementById("v637YT");
          if (!fr) return;
          if (
            !window.YT &&
            !document.querySelector(
              'script[src="https://www.youtube.com/iframe_api"]',
            )
          ) {
            const sc = document.createElement("script");
            sc.src = "https://www.youtube.com/iframe_api";
            document.head.appendChild(sc);
          }
          const start = () => {
            if (
              !window.YT ||
              !window.YT.Player ||
              !document.getElementById("v637YT")
            )
              return;
            try {
              player = new YT.Player("v637YT", {
                events: {
                  onReady: () => {
                    track = setInterval(() => {
                      try {
                        persist(
                          k,
                          player.getCurrentTime(),
                          player.getDuration(),
                        );
                      } catch (e) {}
                    }, 5000);
                  },
                  onStateChange: (e) => {
                    if (e.data === 0) {
                      try {
                        persist(
                          k,
                          player.getCurrentTime(),
                          player.getDuration(),
                        );
                      } catch (x) {}
                      Actions.completeVideoItem(k.id);
                    }
                  },
                },
              });
            } catch (e) {}
          };
          const old = window.onYouTubeIframeAPIReady;
          window.onYouTubeIframeAPIReady = function () {
            try {
              old && old();
            } catch (e) {}
            start();
          };
          setTimeout(start, 900);
        }
        function openPlayer(k) {
          openModal(
            "مشاهدة الفيديو داخل المشروع",
            `<div class="player-head"><div class="player-title"><h3>${E(k.title || "فيديو")}</h3><p>${E(k.author || k.area || "")} • ${pct(k)}% مكتمل</p></div><div class="row"><button class="btn secondary mini" data-action="editKnowledge" data-id="${E(k.id)}">تعديل</button><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div><div class="v637-player"><div class="v637-watch">${media(k)}</div><aside class="v637-side">${k.cover ? `<img class="v637-cover" src="${E(k.cover)}" onerror="this.style.display='none'">` : ""}${tools(k)}</aside></div>`,
          );
          document.getElementById("modal")?.classList.add("player-mode");
          setTimeout(() => init(k), 500);
        }
        const oldClose = Actions.closeModal;
        Actions.closeModal = function () {
          stop();
          return oldClose
            ? oldClose.apply(this, arguments)
            : document
                .getElementById("modal")
                ?.classList.remove("open", "player-mode");
        };
        const oldOpen = Actions.openKnowledgePlayer;
        Actions.openKnowledgePlayer = function (id, btn) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (k && isSingle(k)) {
            openPlayer(k);
            return;
          }
          return oldOpen ? oldOpen.apply(this, arguments) : null;
        };
        document.addEventListener(
          "click",
          function (e) {
            const b = e.target.closest('[data-action="openKnowledgePlayer"]');
            if (!b) return;
            const k = (state.knowledge || []).find(
              (x) => x.id === b.dataset.id,
            );
            if (k && isSingle(k)) {
              e.preventDefault();
              e.stopImmediatePropagation();
              openPlayer(k);
            }
          },
          true,
        );
        document.addEventListener("click", (e) => {
          const h = e.target.closest(".v637-head,.v636-accordion-head");
          if (!h) return;
          const box = h.closest(".v637-acc,.v636-accordion");
          if (box) box.classList.toggle("open");
        });
        Actions.v637SaveProgress = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          k.currentUnit = k.currentMinute = Number(
            document.getElementById("v637_current")?.value || 0,
          );
          k.totalUnits = k.totalMinutes = Number(
            document.getElementById("v637_total")?.value || 0,
          );
          k.progress = pct(k);
          save();
          update(k);
          toast("تم حفظ التقدم");
        };
        Actions.v637SaveDetails = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const val = (n) => document.getElementById("v637_" + n)?.value || "";
          k.rating = Number(val("rating") || 0);
          k.summary = k.videoSummary = val("summary");
          k.ideas = val("ideas");
          k.application = k.actionTaken = val("action");
          k.result = k.resultAchieved = val("result");
          k.lessonLearned = val("lesson");
          save();
          toast("تم حفظ تفاصيل الفيديو");
        };
        Actions.v637AddNote = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const txt = (
            document.getElementById("v637_note_text")?.value || ""
          ).trim();
          if (!txt) return toast("اكتب الملاحظة أولاً");
          let sec = Number(k.currentUnit || k.currentMinute || 0) * 60;
          const local = document.getElementById("v637Local");
          if (local) sec = local.currentTime || sec;
          try {
            if (player && player.getCurrentTime)
              sec = player.getCurrentTime() || sec;
          } catch (e) {}
          k.timedNotes = k.timedNotes || [];
          k.timedNotes.push({
            id:
              Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
            timeSec: Math.floor(sec),
            text: txt,
            created: new Date().toISOString(),
          });
          save();
          document.getElementById("v637_note_text").value = "";
          const list = document.getElementById("v637_notes");
          if (list) list.innerHTML = notes(k);
          toast("تم حفظ الملاحظة");
        };
        Actions.v637DeleteNote = function (id, btn) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          k.timedNotes = (k.timedNotes || []).filter(
            (n) => n.id !== btn.dataset.note,
          );
          save();
          const list = document.getElementById("v637_notes");
          if (list) list.innerHTML = notes(k);
        };
        Actions.v637Seek = function (_, btn) {
          const sec = Number(btn.dataset.time || 0);
          const local = document.getElementById("v637Local");
          if (local) {
            local.currentTime = sec;
            local.play && local.play();
            return;
          }
          try {
            player && player.seekTo && player.seekTo(sec, true);
            player && player.playVideo && player.playVideo();
          } catch (e) {}
        };
        const oldComplete = Actions.completeVideoItem;
        Actions.completeVideoItem = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (k && isSingle(k)) {
            k.status = "done";
            k.finished = true;
            k.progress = 100;
            if (k.totalUnits) k.currentUnit = k.currentMinute = k.totalUnits;
            state.timeline = state.timeline || [];
            if (!state.timeline.some((t) => t.videoKnowledgeId === id))
              state.timeline.unshift({
                id: Date.now().toString(36),
                videoKnowledgeId: id,
                title: "أنهيت فيديو: " + (k.title || "فيديو"),
                date: new Date().toISOString().slice(0, 10),
                area: "التعلم",
                note: "تم إكمال الفيديو المنفرد.",
              });
            save();
            stop();
            document
              .getElementById("modal")
              ?.classList.remove("open", "player-mode");
            if (typeof route !== "undefined") route = "wins";
            render();
            toast("تم نقل الفيديو إلى الإنجازات 🏆");
            return;
          }
          return oldComplete ? oldComplete.apply(this, arguments) : null;
        };

        const rescueTasks = [
          "اقفل التطبيق المشتت الآن وخلي الموبايل بعيد 10 دقائق",
          "اشرب كوب ماء وخد 10 أنفاس بطيئة",
          "رتّب المكان حولك لمدة دقيقتين",
          "اكتب: كنت بعمل إيه؟ وما أول خطوة؟",
          "اشتغل 5 دقائق على أصغر خطوة بدون تفاوض",
          "اغسل وشك أو اعمل وضوء وارجع",
          "امشي 3 دقائق بعيد عن الموبايل",
          "احذف التبويب أو الفيديو المشتت",
          "شغّل مؤقت 15 دقيقة وابدأ",
          "اكتب سبب واحد يخليك ترجع للتركيز",
        ];
        function randomRescue() {
          return rescueTasks[Math.floor(Math.random() * rescueTasks.length)];
        }
        Actions.emergencyPlan = function () {
          const task = randomRescue();
          const current =
            (state.tasks || []).find((t) => t.status !== "done") ||
            (state.actions || []).find((a) => a.status !== "done");
          openModal(
            "🚨 طوارئ التشتت",
            `<div class="rescue-grid"><div class="card emergency-card"><span class="pill">مهمة عشوائية الآن</span><div class="v637-rescue-task"><h3>${E(task)}</h3><p class="muted">نفذها فورًا، وبعدها ارجع لأول مهمة في النظام.</p></div><label>ما الذي شتتك؟</label><select id="rescueSource"><option>فيسبوك</option><option>يوتيوب</option><option>تيك توك</option><option>واتساب</option><option>تصفح عشوائي</option><option>تفكير زائد</option><option>غير ذلك</option></select><label>ملاحظة سريعة</label><textarea id="rescueNote" placeholder="ما الذي جذبك؟ وما الخطوة التي سترجعك؟"></textarea><div class="row"><button class="btn rescue" data-action="startEmergencyFocus">ابدأ إنقاذ 15 دقيقة</button><button class="btn secondary" data-action="v637AddRescueTodo" data-task="${E(task)}">أضفها كـ To Do</button><button class="btn secondary" data-action="emergencyPlan">هات مهمة تانية</button></div></div><div class="card"><h3>ارجع لإيه؟</h3><p class="muted">${E(current?.title || "اختر مهمة واحدة من قائمة التنفيذ")}</p><div class="soft-divider"></div><div class="rescue-steps"><div class="rescue-step"><b>1</b><span>اقفل مصدر التشتيت.</span></div><div class="rescue-step"><b>2</b><span>نفذ المهمة العشوائية.</span></div><div class="rescue-step"><b>3</b><span>ارجع لمهمة واحدة 15 دقيقة.</span></div></div></div></div>`,
          );
        };
        Actions.v637AddRescueTodo = function (_, btn) {
          state.tasks = state.tasks || [];
          state.tasks.unshift({
            id: Date.now().toString(36),
            title: btn.dataset.task || "مهمة إنقاذ",
            project: "إنقاذ التشتت",
            status: "todo",
            source: "rescue",
          });
          save();
          toast("تمت إضافتها لقائمة المهام");
        };
        window.viewActionHub = function () {
          setTitle(
            "مركز التنفيذ",
            "To Do List واضحة: مهمة واحدة، وبعدها التي تليها.",
          );
          const tasks = (state.tasks || []).filter(
            (t) => t.status !== "archived",
          );
          const actions = (state.actions || [])
            .filter((a) => a.status !== "done")
            .slice(0, 4);
          return `<div class="action-center"><div class="card command-card action-hero"><div><p class="eyebrow">Action Center</p><h2>قائمة مهام تنفيذية</h2><p class="muted">علم على المهمة لما تخلص، أو ابدأ تركيز على أول مهمة مفتوحة.</p></div><button class="btn action-focus-button" data-action="openFocus">ابدأ تركيز</button></div><div class="action-stack"><div class="card"><div class="space"><h3>✅ To Do List</h3><button class="btn secondary mini" data-action="addTask">+ مهمة</button></div><div class="v637-todo-list">${tasks.map((t) => `<div class="v637-todo ${t.status === "done" ? "done" : ""}"><input type="checkbox" ${t.status === "done" ? "checked" : ""} data-action="v637ToggleTask" data-id="${E(t.id)}"><div><b>${E(t.title)}</b><small>${E(t.project || t.source || "مهمة عامة")}</small></div><button class="btn danger mini" data-action="archiveItem" data-collection="tasks" data-id="${E(t.id)}">أرشفة</button></div>`).join("") || '<div class="empty">لا توجد مهام. أضف مهمة واحدة الآن.</div>'}</div><div class="v637-task-add"><input id="v637_quick_task" placeholder="أضف مهمة سريعة..."><button class="btn" data-action="v637QuickTask">إضافة</button></div></div><div class="card"><h3>إجراءات تنتظر التنفيذ</h3><div class="os-action-list">${actions.map((a) => `<div class="os-action-item"><span>${E(a.title)}</span><button class="btn secondary mini" data-action="cycleStatus" data-collection="actions" data-id="${E(a.id)}">تقدم</button></div>`).join("") || '<div class="empty">لا توجد إجراءات مفتوحة.</div>'}</div><div class="soft-divider"></div><button class="btn rescue" data-action="emergencyPlan" style="width:100%">🚨 طوارئ التشتت</button></div></div><div class="card"><h3>الأدوات</h3><div class="hub-grid">${typeof hubTile === "function" ? hubTile("projects", "المشاريع", "مشاريع + Kanban", "▦", (state.projects || []).length) + hubTile("actions", "التحويل", "معرفة ← تنفيذ", "↯", (state.actions || []).length) + hubTile("goals", "الأهداف", "اتجاه واضح", "◎", (state.goals || []).length) + hubTile("focus", "التركيز", "جلسة واحدة فقط", "◷", (state.focusSessions || []).length) : ""}</div></div></div>`;
        };
        Actions.v637QuickTask = function () {
          const inp = document.getElementById("v637_quick_task");
          const title = (inp?.value || "").trim();
          if (!title) return toast("اكتب المهمة أولاً");
          state.tasks = state.tasks || [];
          state.tasks.unshift({
            id:
              Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            title,
            project: "مهمة سريعة",
            status: "todo",
          });
          save();
          render();
        };
        Actions.v637ToggleTask = function (id) {
          const t = (state.tasks || []).find((x) => x.id === id);
          if (!t) return;
          t.status = t.status === "done" ? "todo" : "done";
          save();
          render();
        };
        toast("V63.7 جاهز: مشغل الفيديو والطوارئ والمهام");
      })();

      /* script section 6 */
      /* ===== V63.8 REAL FIX: video player/edit separation + rescue todo ===== */
      (function () {
        if (window.__V638_REAL_FIX__) return;
        window.__V638_REAL_FIX__ = true;
        // استيراد الدوال الأساسية من النواة
        const api = window.MogahedOSX || {};
        const state = api.state;
        const Actions = api.Actions;
        const render = function () {
          try {
            api.render && api.render();
          } catch (e) {}
        };
        const save = function () {
          try {
            api.save && api.save();
          } catch (e) {}
        };
        const toast = function (s) {
          try {
            api.toast && api.toast(s);
          } catch (e) {
            console.log(s);
          }
        };
        const esc =
          api.esc ||
          ((s) =>
            String(s ?? "").replace(
              /[&<>"]/g,
              (m) =>
                ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[m],
            ));
        const get =
          api.get ||
          ((id) => {
            const el = document.getElementById(id);
            return el ? el.value : "";
          });
        const openModal = function (title, body) {
          const t = document.getElementById("modalTitle"),
            b = document.getElementById("modalBody"),
            m = document.getElementById("modal");
          if (t) t.textContent = title;
          if (b) b.innerHTML = body;
          if (m) m.classList.add("open");
        };
        const closeModal = function () {
          const m = document.getElementById("modal");
          if (m) m.classList.remove("open", "player-mode");
          const b = document.getElementById("modalBody");
          if (b) b.innerHTML = "";
        };
        const setTitle = function (t, s) {
          const pt = document.getElementById("pageTitle"),
            ps = document.getElementById("pageSub");
          if (pt) pt.textContent = t;
          if (ps) ps.textContent = s || "";
        };
        // تحقق من وجود البيانات الأساسية
        if (!state || !Actions) {
          console.warn("V63.8: core not ready");
          return;
        }
        const E = esc;
        function getUrl(k) {
          return (
            (k && (k.mediaUrl || k.link || k.url || k.videoUrl || "")) || ""
          );
        }
        function isYT(u) {
          return /youtu\.be|youtube\.com/i.test(String(u || ""));
        }
        function ytId(u) {
          u = String(u || "");
          let m =
            u.match(/[?&]v=([^&#]+)/) ||
            u.match(/youtu\.be\/([^?&#]+)/) ||
            u.match(/embed\/([^?&#]+)/) ||
            u.match(/shorts\/([^?&#]+)/);
          return m ? m[1] : "";
        }
        function isSingleVideo(k) {
          const u = getUrl(k);
          const t =
            String(k?.type || "") +
            " " +
            String(k?.mediaType || "") +
            " " +
            String(k?.videoMode || k?.contentMode || "");
          return (
            !!k &&
            !Array.isArray(k.items) &&
            !k.playlistUrl &&
            (/(video|فيديو|youtube|mp4|يوتيوب)/i.test(t) ||
              isYT(u) ||
              /\.(mp4|webm|ogg)(\?|#|$)/i.test(u) ||
              k.mediaData)
          );
        }
        function pct(k) {
          const c = +((k && k.currentUnit) || k?.currentMinute || 0),
            t = +((k && k.totalUnits) || k?.totalMinutes || 0);
          return t ? Math.min(100, Math.round((c / t) * 100)) : 0;
        }
        function saveNow() {
          save();
        }
        function toastNow(s) {
          toast(s);
        }
        function closeNow() {
          closeModal();
        }
        function buildMedia(k) {
          const u = getUrl(k);
          const id = ytId(u);
          if (k.mediaData && /^video\//.test(k.mediaMime || ""))
            return `<video id="v638_video" controls playsinline preload="metadata" src="${E(k.mediaData)}"></video>`;
          if (k.mediaData && /^audio\//.test(k.mediaMime || ""))
            return `<audio id="v638_video" controls preload="metadata" src="${E(k.mediaData)}"></audio>`;
          if (id && /^https?:/i.test(u))
            return `<iframe id="v638_iframe" src="https://www.youtube.com/embed/${E(id)}?enablejsapi=1&rel=0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>`;
          if (id)
            return `<div class="v638-youtube-block"><h3>الرابط صحيح لكن المتصفح مانع التشغيل هنا</h3><p>لأن الملف مفتوح من content:// أو file://. شغّل المشروع من استضافة HTTPS أو افتح الفيديو خارجيًا.</p><button class="btn" data-action="openExternal" data-url="${E(u)}">فتح على YouTube</button></div>`;
          if (u)
            return `<iframe id="v638_iframe" src="${E(u)}" allowfullscreen></iframe>`;
          return `<div class="empty">لا يوجد رابط أو ملف فيديو.</div>`;
        }
        function coverHtml(k) {
          const u = getUrl(k),
            id = ytId(u);
          const src =
            k.cover ||
            (id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "");
          return src
            ? `<img class="v638-cover" src="${E(src)}" onerror="this.style.display='none'">`
            : "";
        }
        function notesHtml(k) {
          const arr = k.timeNotes || k.videoNotes || [];
          return `<div class="v638-note-list">${arr.map((n, i) => `<div class="v638-note"><b>${E(n.time || 0)} د</b><span>${E(n.text || n.note || "")}</span><button class="btn danger mini" data-action="v638DelNote" data-id="${E(k.id)}" data-idx="${i}">حذف</button></div>`).join("") || '<div class="empty">لا توجد ملاحظات بعد.</div>'}</div>`;
        }
        function toolsHtml(k) {
          const c = +(k.currentUnit || k.currentMinute || 0),
            t = +(k.totalUnits || k.totalMinutes || 0),
            p = pct(k);
          return `
    <div class="v638-acc open"><button type="button" class="v638-head"><div><b>⏱️ التقدم والدقائق</b><small>داخل المشغل فقط</small></div><i>⌄</i></button><div class="v638-body"><div class="v638-two"><div><label>وصلت لدقيقة</label><input id="v638_current" type="number" value="${c}"></div><div><label>إجمالي الدقائق</label><input id="v638_total" type="number" value="${t}"></div></div><div class="progress"><div class="bar" id="v638_bar" style="width:${p}%"></div></div><p class="muted" id="v638_remaining">المتبقي: ${Math.max(0, t - c)} دقيقة</p><div class="row"><button class="btn" data-action="v638SaveProgress" data-id="${E(k.id)}">حفظ التقدم</button><button class="btn secondary" data-action="v638Complete" data-id="${E(k.id)}">أنهيت الفيديو</button></div></div></div>
    <div class="v638-acc"><button type="button" class="v638-head"><div><b>✍️ ملاحظات واقتباسات</b><small>تفتح وتقفل بسهم</small></div><i>⌄</i></button><div class="v638-body"><textarea id="v638_note_text" placeholder="اكتب ملاحظة أو اقتباس من اللحظة الحالية..."></textarea><button class="btn" data-action="v638AddNote" data-id="${E(k.id)}">+ حفظ ملاحظة بالوقت الحالي</button><div id="v638_notes">${notesHtml(k)}</div></div></div>
    <div class="v638-acc"><button type="button" class="v638-head"><div><b>📝 تفاصيل هذا الفيديو</b><small>الملخص، الأفكار، التطبيق، النتيجة</small></div><i>⌄</i></button><div class="v638-body"><label>التقييم من 1 إلى 5</label><input id="v638_rating" type="number" min="0" max="5" value="${+(k.rating || 0)}"><label>ملخصك الشخصي</label><textarea id="v638_summary">${E(k.videoSummary || k.summary || "")}</textarea><label>أهم الأفكار / الاقتباسات</label><textarea id="v638_ideas">${E(k.ideas || "")}</textarea><label>ماذا ستنفذ؟</label><textarea id="v638_action">${E(k.actionTaken || k.application || "")}</textarea><label>ما النتيجة؟</label><textarea id="v638_result">${E(k.resultAchieved || k.result || "")}</textarea><label>أهم درس؟</label><textarea id="v638_lesson">${E(k.lessonLearned || "")}</textarea><button class="btn" data-action="v638SaveDetails" data-id="${E(k.id)}">حفظ تفاصيل الفيديو</button></div></div>`;
        }
        function openVideo(k) {
          openModal(
            "مشاهدة الفيديو داخل المشروع",
            `<div class="v638-player-head"><button class="btn secondary mini" data-action="closeModal">إغلاق</button><div><h3>${E(k.title || "فيديو")}</h3><p>${E(k.author || k.area || "")} • ${pct(k)}% مكتمل</p></div></div><div class="v638-player"><section class="v638-main"><h2>${E(k.title || "فيديو")}</h2>${coverHtml(k)}<div class="v638-watch">${buildMedia(k)}</div></section><aside class="v638-side">${toolsHtml(k)}</aside></div>`,
          );
          document.getElementById("modal")?.classList.add("player-mode");
          setTimeout(() => initProgress(k), 300);
        }
        function updateUI(k) {
          const c = +(document.getElementById("v638_current")?.value || 0),
            t = +(document.getElementById("v638_total")?.value || 0);
          const p = t ? Math.min(100, Math.round((c / t) * 100)) : 0;
          const b = document.getElementById("v638_bar");
          if (b) b.style.width = p + "%";
          const r = document.getElementById("v638_remaining");
          if (r)
            r.textContent =
              "المتبقي: " + Math.max(0, Math.ceil(t - c)) + " دقيقة";
        }
        function persistProgress(k) {
          const c = +(document.getElementById("v638_current")?.value || 0),
            t = +(document.getElementById("v638_total")?.value || 0);
          k.currentUnit = k.currentMinute = c;
          k.totalUnits = k.totalMinutes = t;
          if (t && c >= t) {
            k.status = "done";
            k.completedAt = new Date().toISOString().slice(0, 10);
            if (
              state.reviews &&
              !state.reviews.find(
                (r) => r.sourceId === k.id && /إنجاز فيديو/.test(r.title || ""),
              )
            )
              state.reviews.unshift({
                id: Date.now().toString(36),
                sourceId: k.id,
                title: "إنجاز فيديو: " + (k.title || ""),
                date: new Date().toISOString().slice(0, 10),
                done: k.summary || k.videoSummary || "تم إنهاء الفيديو",
              });
          }
          saveNow();
          updateUI(k);
        }
        function initProgress(k) {
          const media = document.getElementById("v638_video");
          if (media) {
            media.addEventListener("loadedmetadata", () => {
              if (media.duration && isFinite(media.duration)) {
                const total = Math.ceil(media.duration / 60);
                const inp = document.getElementById("v638_total");
                if (inp && (!+inp.value || +inp.value < 1)) {
                  inp.value = total;
                  persistProgress(k);
                }
              }
              if (k.currentUnit && !media.currentTime)
                media.currentTime = +k.currentUnit * 60;
            });
            media.addEventListener("timeupdate", () => {
              const inp = document.getElementById("v638_current");
              if (inp) {
                inp.value = Math.floor(media.currentTime / 60);
                persistProgress(k);
              }
            });
            media.addEventListener("ended", () => {
              const tot = document.getElementById("v638_total");
              const cur = document.getElementById("v638_current");
              if (tot && cur) {
                cur.value = tot.value || Math.ceil((media.duration || 0) / 60);
                persistProgress(k);
                toastNow("تم نقل الفيديو للإنجازات");
              }
            });
          }
        }
        function compactEditForm() {
          const m = document.querySelector("#modal.open");
          if (!m) return;
          const type =
            (document.getElementById("k_type")?.value || "") +
            " " +
            (document.getElementById("k_mediaType")?.value || "") +
            " " +
            (document.querySelector(".v634-mode-btn.active")?.dataset.mode ||
              "");
          const url = document.getElementById("k_mediaUrl")?.value || "";
          const single =
            /(فيديو|video|youtube|mp4|يوتيوب)/i.test(type) || isYT(url);
          if (!single) return;
          [
            "k_rating",
            "k_summary",
            "k_ideas",
            "k_app",
            "k_result",
            "k_current",
            "k_total",
            "k_review",
          ].forEach((id) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.style.display = "none";
            const lab = el.previousElementSibling;
            if (lab && lab.tagName === "LABEL") lab.style.display = "none";
          });
          const btn = document.querySelector('[data-action="saveKnowledge"]');
          if (btn && !document.getElementById("v638_form_hint")) {
            const d = document.createElement("div");
            d.id = "v638_form_hint";
            d.className = "v638-form-hint";
            d.textContent =
              "تفاصيل الفيديو والتقدم والملاحظات موجودة داخل زر مشاهدة الفيديو فقط.";
            btn.parentNode.insertBefore(d, btn);
          }
        }
        const oldOpen = Actions.openKnowledgePlayer;
        Actions.openKnowledgePlayer = function (id, btn) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (isSingleVideo(k)) {
            openVideo(k);
            return;
          }
          return oldOpen ? oldOpen.apply(this, arguments) : null;
        };
        document.addEventListener(
          "click",
          function (e) {
            const b = e.target.closest('[data-action="openKnowledgePlayer"]');
            if (!b) return;
            const k = (state.knowledge || []).find(
              (x) => x.id === b.dataset.id,
            );
            if (isSingleVideo(k)) {
              e.preventDefault();
              e.stopImmediatePropagation();
              openVideo(k);
            }
          },
          true,
        );
        document.addEventListener(
          "click",
          function (e) {
            const h = e.target.closest(".v638-head");
            if (!h) return;
            const box = h.closest(".v638-acc");
            if (box) box.classList.toggle("open");
          },
          true,
        );
        ["addKnowledge", "editKnowledge"].forEach((name) => {
          const old = Actions[name];
          if (old)
            Actions[name] = function () {
              const r = old.apply(this, arguments);
              setTimeout(compactEditForm, 120);
              setTimeout(compactEditForm, 500);
              return r;
            };
        });
        document.addEventListener("change", (e) => {
          if (["k_type", "k_mediaType", "k_mediaUrl"].includes(e.target.id))
            setTimeout(compactEditForm, 50);
        });
        Actions.v638SaveProgress = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (k) {
            persistProgress(k);
            toastNow("تم حفظ التقدم");
          }
        };
        Actions.v638Complete = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const tot = document.getElementById("v638_total"),
            cur = document.getElementById("v638_current");
          if (tot && cur) cur.value = tot.value || cur.value || 1;
          persistProgress(k);
          toastNow("تم إنهاء الفيديو وإضافته للإنجازات");
        };
        Actions.v638AddNote = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          const txt = (
            document.getElementById("v638_note_text")?.value || ""
          ).trim();
          if (!txt) return toastNow("اكتب الملاحظة أولاً");
          const time = +(document.getElementById("v638_current")?.value || 0);
          k.timeNotes = k.timeNotes || [];
          k.timeNotes.unshift({
            time,
            text: txt,
            date: new Date().toISOString(),
          });
          saveNow();
          document.getElementById("v638_note_text").value = "";
          const n = document.getElementById("v638_notes");
          if (n) n.innerHTML = notesHtml(k);
        };
        Actions.v638DelNote = function (id, btn) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          k.timeNotes = k.timeNotes || [];
          k.timeNotes.splice(+btn.dataset.idx, 1);
          saveNow();
          const n = document.getElementById("v638_notes");
          if (n) n.innerHTML = notesHtml(k);
        };
        Actions.v638SaveDetails = function (id) {
          const k = (state.knowledge || []).find((x) => x.id === id);
          if (!k) return;
          k.rating = +(document.getElementById("v638_rating")?.value || 0);
          k.videoSummary = k.summary =
            document.getElementById("v638_summary")?.value || "";
          k.ideas = document.getElementById("v638_ideas")?.value || "";
          k.actionTaken = k.application =
            document.getElementById("v638_action")?.value || "";
          k.resultAchieved = k.result =
            document.getElementById("v638_result")?.value || "";
          k.lessonLearned = document.getElementById("v638_lesson")?.value || "";
          saveNow();
          toastNow("تم حفظ تفاصيل الفيديو");
        };
        // ===== قائمة مهام الطوارئ الموسّعة =====
        const rescueTasks = [
          // جسد وحركة
          {
            icon: "💪",
            cat: "جسد",
            task: "نفذ 10 ضغطات أرض الآن ثم ارجع للمهمة",
            time: 2,
          },
          {
            icon: "🚶",
            cat: "جسد",
            task: "امشِ 3 دقائق بعيداً عن الشاشة ثم ارجع",
            time: 3,
          },
          {
            icon: "💧",
            cat: "جسد",
            task: "اشرب كوب ماء كامل ببطء وخد نفس عميق 5 مرات",
            time: 2,
          },
          {
            icon: "🤸",
            cat: "جسد",
            task: "نفذ 20 سكوات أو 15 قفزة الآن",
            time: 2,
          },
          {
            icon: "😮‍💨",
            cat: "جسد",
            task: "تنفس: شهيق 4 ثواني — احبس 4 — زفير 6. كرر 5 مرات",
            time: 2,
          },
          // تنظيم وترتيب
          {
            icon: "🗂️",
            cat: "ترتيب",
            task: "رتّب مكتبك أو مكانك 3 دقائق فقط",
            time: 3,
          },
          {
            icon: "📱",
            cat: "ترتيب",
            task: "اقفل كل التبويبات الزيادة وابقي تبويب واحد فقط",
            time: 1,
          },
          {
            icon: "🔕",
            cat: "ترتيب",
            task: "فعّل وضع عدم الإزعاج الآن لمدة 30 دقيقة",
            time: 1,
          },
          {
            icon: "📋",
            cat: "ترتيب",
            task: "اكتب على ورقة: أهم 3 مهام لازم تخلص النهارده",
            time: 3,
          },
          {
            icon: "🗑️",
            cat: "ترتيب",
            task: "احذف 10 إشعارات أو رسائل غير مهمة الآن",
            time: 2,
          },
          // وعي وتفكير
          {
            icon: "✍️",
            cat: "وعي",
            task: "اكتب: فتحت الموبايل ليه؟ وإيه اللي يجذبك؟",
            time: 2,
          },
          {
            icon: "🎯",
            cat: "وعي",
            task: "اكتب جملة واحدة: أهم حاجة لازم أخلصها النهارده هي...",
            time: 1,
          },
          {
            icon: "⏱️",
            cat: "وعي",
            task: "حدد: هتشتغل على إيه الـ 25 دقيقة الجاية بالضبط؟",
            time: 1,
          },
          {
            icon: "🔍",
            cat: "وعي",
            task: "اسأل نفسك: لو خلصت مهمة واحدة دلوقتي، هتحس بإيه؟",
            time: 1,
          },
          {
            icon: "📓",
            cat: "وعي",
            task: "اكتب 3 سطور: إيه اللي حصل، وإيه الخطوة الجاية؟",
            time: 3,
          },
          // معرفة وتعلم
          {
            icon: "📚",
            cat: "معرفة",
            task: "افتح آخر كتاب/بودكاست في نظامك واقرأ صفحة أو استمع 5 دقائق",
            time: 5,
          },
          {
            icon: "🧠",
            cat: "معرفة",
            task: "اكتب 3 سطور ملخص لآخر فيديو أو محتوى شاهدته",
            time: 3,
          },
          {
            icon: "💡",
            cat: "معرفة",
            task: "راجع آخر فكرة أو إجراء سجلته في نظامك",
            time: 2,
          },
          {
            icon: "🎓",
            cat: "معرفة",
            task: "افتح مشروع التعلم عندك وحدد الخطوة الجاية",
            time: 2,
          },
          // تنفيذ سريع
          {
            icon: "⚡",
            cat: "تنفيذ",
            task: "افتح أول مهمة في قائمتك واشتغل عليها 7 دقائق فقط",
            time: 7,
          },
          {
            icon: "✅",
            cat: "تنفيذ",
            task: "نفذ أصغر خطوة ممكنة في مشروعك الحالي الآن",
            time: 5,
          },
          {
            icon: "📧",
            cat: "تنفيذ",
            task: "ردّ على رسالة واحدة مهمة كنت بتأجلها",
            time: 3,
          },
          {
            icon: "🗒️",
            cat: "تنفيذ",
            task: "راجع قائمة مهامك وعلّم على حاجة اتعملت",
            time: 2,
          },
        ];
        function rescueItem() {
          // إذا الأخيرة موجودة، تجنب تكرارها
          const last = window._lastRescueIdx || 0;
          let idx;
          do {
            idx = Math.floor(Math.random() * rescueTasks.length);
          } while (idx === last && rescueTasks.length > 1);
          window._lastRescueIdx = idx;
          return rescueTasks[idx];
        }
        Actions.emergencyPlan = function () {
          const item = rescueItem();
          const cats = {
            جسد: "🔴",
            ترتيب: "🟡",
            وعي: "🔵",
            معرفة: "🟢",
            تنفيذ: "⚡",
          };
          const dot = cats[item.cat] || "⚪";
          openModal(
            "🚨 طوارئ التشتت",
            `
      <div class="rescue-modal-wrap">
        <div class="rescue-category-badge">${dot} ${E(item.cat)} • ${item.time} دقيقة</div>
        <div class="rescue-task-card">
          <div class="rescue-icon-big">${item.icon}</div>
          <h2 class="rescue-task-text">${E(item.task)}</h2>
        </div>
        <p class="rescue-hint">نفّذها الآن، وبعدها ارجع لمهمة واحدة فقط.</p>
        <div class="rescue-checklist">
          <label class="rescue-check-item"><input type="checkbox"> أقفلت مصدر التشتيت</label>
          <label class="rescue-check-item"><input type="checkbox"> نفذت مهمة الإنقاذ</label>
          <label class="rescue-check-item"><input type="checkbox"> جاهز أبدأ تركيز الآن</label>
        </div>
        <div class="rescue-actions">
          <button class="btn rescue rescue-primary" data-action="startEmergencyFocus">⏱️ ابدأ إنقاذ 15 دقيقة</button>
          <button class="btn secondary" data-action="v638AddRescueTask" data-task="${E(item.task)}">+ أضفها للمهام</button>
          <button class="btn secondary" data-action="emergencyPlan">🎲 مهمة تانية</button>
        </div>
        <div class="rescue-mini-grid">
          ${rescueTasks
            .filter((_, i) => i !== window._lastRescueIdx)
            .slice(0, 4)
            .map(
              (r) => `
            <button class="rescue-mini-btn" data-action="emergencyPlan" title="${E(r.task)}">${r.icon} ${E(r.cat)}</button>
          `,
            )
            .join("")}
        </div>
      </div>
    `,
          );
        };
        Actions.v638AddRescueTask = function (_, btn) {
          state.tasks = state.tasks || [];
          state.tasks.unshift({
            id:
              Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            title: btn.dataset.task || "مهمة إنقاذ",
            project: "🚨 طوارئ التشتت",
            priority: "high",
            status: "todo",
          });
          saveNow();
          toastNow("✅ اتضافت في قائمة المهام");
        };

        // ===== To Do List المُحسّنة =====
        const oldViewActionHub = window.viewActionHub;
        function todoPriorityBadge(t) {
          if (t.priority === "high")
            return '<span class="todo-priority high">عاجل</span>';
          if (t.priority === "med")
            return '<span class="todo-priority med">مهم</span>';
          return "";
        }
        function todoProjectTag(t) {
          if (!t.project) return "";
          const colors = {
            "🚨 طوارئ التشتت": "rescue",
            "مهمة سريعة": "quick",
            تعلم: "learn",
          };
          const cls = colors[t.project] || "default";
          return `<span class="todo-tag todo-tag-${cls}">${E(t.project)}</span>`;
        }
        window.viewActionHub = function () {
          setTitle(
            "مركز التنفيذ",
            "مهمة واحدة واضحة — نفّذها — وبعدين الجاية.",
          );
          const tasks = (state.tasks || []).filter(
            (t) => t.status !== "archived",
          );
          const done = tasks.filter((t) => t.status === "done");
          const todo = tasks.filter((t) => t.status !== "done");
          const pct = tasks.length
            ? Math.round((done.length / tasks.length) * 100)
            : 0;
          return `
      <div class="action-center v64-hub">

        <div class="card command-card action-hero v64-hero">
          <div class="v64-hero-text">
            <p class="eyebrow">مركز التنفيذ</p>
            <h2>✅ To Do List</h2>
            <p class="muted">علّم على المهمة لما تخلص. الأولوية الأعلى في الأعلى دايماً.</p>
          </div>
          <div class="v64-hero-actions">
            <button class="btn action-focus-button" data-action="openFocus">⏱️ تركيز</button>
            <button class="btn rescue" data-action="emergencyPlan">🚨 طوارئ</button>
          </div>
        </div>

        <div class="card v64-progress-card">
          <div class="v64-progress-header">
            <span>إنجاز اليوم</span>
            <strong>${done.length} / ${tasks.length} مهمة</strong>
          </div>
          <div class="progress"><div class="bar" style="width:${pct}%"></div></div>
        </div>

        <div class="card v64-todo-card">
          <div class="space v64-todo-header">
            <h3>المهام <span class="v64-count">${todo.length} متبقية</span></h3>
            <div class="row">
              <button class="btn secondary mini" data-action="v638ClearDone">🗑️ حذف المنتهية</button>
              <button class="btn secondary mini" data-action="addTask">+ مهمة</button>
            </div>
          </div>

          <div class="v64-todo-list">
            ${todo.length === 0 && done.length === 0 ? `<div class="empty">لا توجد مهام. أضف مهمة الآن واشتغل عليها.</div>` : ""}
            ${todo
              .map(
                (t) => `
              <div class="v64-todo-item ${t.priority === "high" ? "v64-high" : ""}">
                <button class="v64-check" data-action="v638ToggleTask" data-id="${E(t.id)}">○</button>
                <div class="v64-todo-body">
                  <span class="v64-todo-title">${E(t.title)}</span>
                  <div class="v64-todo-meta">
                    ${todoProjectTag(t)}${todoPriorityBadge(t)}
                  </div>
                </div>
                <div class="v64-todo-btns">
                  <button class="btn danger mini" data-action="archiveItem" data-collection="tasks" data-id="${E(t.id)}" title="أرشفة">✕</button>
                </div>
              </div>
            `,
              )
              .join("")}
            ${
              done.length > 0
                ? `
              <div class="v64-done-section">
                <p class="v64-done-label">✅ منجزة (${done.length})</p>
                ${done
                  .map(
                    (t) => `
                  <div class="v64-todo-item v64-done">
                    <button class="v64-check done" data-action="v638ToggleTask" data-id="${E(t.id)}">✓</button>
                    <div class="v64-todo-body">
                      <span class="v64-todo-title">${E(t.title)}</span>
                      <div class="v64-todo-meta">${todoProjectTag(t)}</div>
                    </div>
                    <button class="btn danger mini" data-action="archiveItem" data-collection="tasks" data-id="${E(t.id)}" title="أرشفة">✕</button>
                  </div>
                `,
                  )
                  .join("")}
              </div>
            `
                : ""
            }
          </div>

          <div class="v64-quick-add">
            <select id="v64_priority" class="v64-priority-sel">
              <option value="">عادي</option>
              <option value="med">مهم</option>
              <option value="high">عاجل</option>
            </select>
            <input id="v638_quick_task" placeholder="أضف مهمة سريعة..." autocomplete="off">
            <button class="btn" data-action="v638QuickTask">إضافة</button>
          </div>
        </div>

      </div>`;
        };
        if (api.render) {
          const origRender = api.render;
          api.render = function () {
            if (window.viewActionHub) {
              try {
                window._v638_viewActionHub = window.viewActionHub;
              } catch (e) {}
            }
            origRender.apply(this, arguments);
          };
        }
        Actions.v638ToggleTask = function (id) {
          const t = (state.tasks || []).find((x) => x.id === id);
          if (!t) return;
          t.status = t.status === "done" ? "todo" : "done";
          saveNow();
          render();
        };
        Actions.v638QuickTask = function () {
          const v = (
            document.getElementById("v638_quick_task")?.value || ""
          ).trim();
          const p = document.getElementById("v64_priority")?.value || "";
          if (!v) return toastNow("اكتب المهمة أولاً");
          state.tasks = state.tasks || [];
          state.tasks.unshift({
            id:
              Date.now().toString(36) + Math.random().toString(36).slice(2, 5),
            title: v,
            project: "مهمة سريعة",
            priority: p,
            status: "todo",
          });
          saveNow();
          render();
        };
        Actions.v638ClearDone = function () {
          const before = (state.tasks || []).length;
          state.tasks = (state.tasks || []).filter((t) => t.status !== "done");
          saveNow();
          render();
          toastNow("تم حذف المهام المنجزة");
        };
      })();

      /* script section 7 */
      /* =========================================================
   V64.1 Clean Stabilizer
   هدفه: تثبيت الوظائف الحساسة بدون حذف أي ميزة من الإصدارات السابقة.
   - لا يغير شكل البيانات القديمة.
   - يحافظ على كل Actions الموجودة.
   - يعالج أزرار المشاهدة، الطوارئ، والـ To Do عند التعارض.
========================================================= */
      (function () {
        function ready(fn) {
          if (document.readyState === "loading")
            document.addEventListener("DOMContentLoaded", fn, { once: true });
          else fn();
        }
        function byId(id) {
          return document.getElementById(id);
        }
        function msg(t) {
          try {
            if (typeof toast === "function") toast(t);
          } catch (e) {}
        }
        function uidSafe() {
          try {
            return typeof uid === "function"
              ? uid()
              : Date.now().toString(36) +
                  Math.random().toString(36).slice(2, 8);
          } catch (e) {
            return Date.now().toString(36);
          }
        }
        function saveSafe() {
          try {
            if (typeof save === "function") save();
            else
              localStorage.setItem(
                "mogahed_os_x_v30",
                JSON.stringify(window.state || {}),
              );
          } catch (e) {
            msg("تعذر الحفظ، صدّر نسخة احتياطية.");
          }
        }
        function renderSafe() {
          try {
            if (typeof render === "function") render();
          } catch (e) {
            console.warn("render failed", e);
          }
        }
        function escapeHtml(v) {
          return String(v ?? "").replace(/[&<>\"]/g, function (m) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
          });
        }
        function openModalSafe(title, body) {
          try {
            if (typeof openModal === "function") return openModal(title, body);
          } catch (e) {}
          const modal = byId("modal"),
            mt = byId("modalTitle"),
            mb = byId("modalBody");
          if (mt) mt.textContent = title;
          if (mb) mb.innerHTML = body;
          if (modal) modal.classList.add("open");
        }
        function findKnowledge(id) {
          return ((window.state && state.knowledge) || []).find(function (x) {
            return String(x.id) === String(id);
          });
        }
        function findTask(id) {
          return ((window.state && state.tasks) || []).find(function (x) {
            return String(x.id) === String(id);
          });
        }
        function isVideo(k) {
          const t = String((k && k.type) || "").toLowerCase();
          const u = String(
            (k && (k.mediaUrl || k.link || k.url)) || "",
          ).toLowerCase();
          return /فيديو|video|يوتيوب|youtube/.test(t + " " + u);
        }
        function youtubeId(url) {
          url = String(url || "").trim();
          try {
            var u = new URL(url);
            var h = u.hostname.replace(/^www\./, "").toLowerCase();
            if (h === "youtu.be")
              return u.pathname.split("/").filter(Boolean)[0] || "";
            if (h.includes("youtube.com"))
              return (
                u.searchParams.get("v") ||
                u.pathname.split("/").filter(Boolean).pop() ||
                ""
              );
          } catch (e) {}
          var m = url.match(
            /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
          );
          return m ? m[1] : "";
        }
        function mediaHtml(k) {
          var url = k.mediaUrl || k.link || k.url || "";
          var data = k.mediaData || "";
          var mime = k.mediaMime || "";
          var yid = youtubeId(url);
          if (yid) {
            return (
              '<iframe allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen src="https://www.youtube.com/embed/' +
              escapeHtml(yid) +
              '?rel=0&modestbranding=1"></iframe>'
            );
          }
          if (data && /^audio\//.test(mime))
            return '<audio controls src="' + escapeHtml(data) + '"></audio>';
          if (data && /^video\//.test(mime))
            return (
              '<video controls playsinline src="' +
              escapeHtml(data) +
              '"></video>'
            );
          if (url && /\.(mp4|webm|ogg)(\?|#|$)/i.test(url))
            return (
              '<video controls playsinline src="' +
              escapeHtml(url) +
              '"></video>'
            );
          if (url && /\.(mp3|wav|m4a|aac|ogg)(\?|#|$)/i.test(url))
            return '<audio controls src="' + escapeHtml(url) + '"></audio>';
          return (
            '<div class="player-empty v2"><div><h3>لا يوجد مشغل داخلي لهذا الرابط</h3><p class="muted">الرابط محفوظ، ويمكنك فتحه خارجيًا أو إضافة ملف/رابط مباشر.</p><button class="btn secondary" data-action="openExternal" data-url="' +
            escapeHtml(url) +
            '">فتح خارجي</button></div></div>'
          );
        }
        function stablePlayer(id) {
          var k = findKnowledge(id);
          if (!k) return msg("العنصر غير موجود");
          var p = Math.max(0, Math.min(100, Number(k.progress || 0) || 0));
          var cur = Number(k.currentUnit || k.currentMinute || 0) || 0,
            total = Number(k.totalUnits || k.totalMinutes || 0) || 0;
          openModalSafe(
            "▶ مشاهدة داخل المشروع",
            '<div class="v638-player-head"><div><h3>' +
              escapeHtml(k.title || "محتوى") +
              "</h3><p>" +
              escapeHtml(k.type || "معرفة") +
              " • التقدم " +
              p +
              '%</p></div><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div><div class="v638-player"><div class="v638-main"><h2>' +
              escapeHtml(k.title || "محتوى") +
              '</h2><div class="v638-watch">' +
              mediaHtml(k) +
              '</div><div class="item"><b>التقدم</b><div class="v638-two"><div><label>وصلت إلى</label><input id="v641_current" type="number" value="' +
              cur +
              '"></div><div><label>الإجمالي</label><input id="v641_total" type="number" value="' +
              total +
              '"></div></div><div class="row" style="margin-top:10px"><button class="btn" data-action="v641SaveProgress" data-id="' +
              escapeHtml(k.id) +
              '">حفظ التقدم</button><button class="btn secondary" data-action="v641CompleteKnowledge" data-id="' +
              escapeHtml(k.id) +
              '">أنهيت المحتوى</button></div></div></div><div class="v638-side"><div class="v638-acc open"><button class="v638-head" type="button"><span><b>ملخص وملاحظات</b><small>كل البيانات هنا تتحفظ على نفس عنصر المعرفة</small></span><i>⌄</i></button><div class="v638-body"><label>ملخص</label><textarea id="v641_summary">' +
              escapeHtml(k.videoSummary || k.summary || "") +
              '</textarea><label>أفكار مهمة</label><textarea id="v641_ideas">' +
              escapeHtml(k.ideas || "") +
              '</textarea><label>تطبيق عملي</label><textarea id="v641_action">' +
              escapeHtml(k.actionTaken || k.application || "") +
              '</textarea><label>النتيجة / الدرس</label><textarea id="v641_lesson">' +
              escapeHtml(k.lessonLearned || k.result || "") +
              '</textarea><button class="btn" data-action="v641SaveDetails" data-id="' +
              escapeHtml(k.id) +
              '">حفظ التفاصيل</button></div></div></div></div>',
          );
          var modal = byId("modal");
          if (modal) modal.classList.add("player-mode");
        }
        ready(function () {
          if (!window.Actions) return;
          // Preserve previous player, but provide a guaranteed fallback for single videos/media if old handlers fail.
          var previousOpen = Actions.openKnowledgePlayer;
          Actions.openKnowledgePlayer = function (id, btn) {
            var k = findKnowledge(id);
            try {
              if (previousOpen) {
                previousOpen.apply(this, arguments);
                var modal = byId("modal");
                if (
                  modal &&
                  modal.classList.contains("open") &&
                  byId("modalBody") &&
                  byId("modalBody").innerHTML.trim()
                )
                  return;
              }
            } catch (e) {
              console.warn("old player failed, fallback used", e);
            }
            if (k) return stablePlayer(id);
            msg("العنصر غير موجود");
          };
          Actions.v641SaveProgress = function (id) {
            var k = findKnowledge(id);
            if (!k) return;
            var cur = Number((byId("v641_current") || {}).value || 0),
              total = Number((byId("v641_total") || {}).value || 0);
            k.currentUnit = k.currentMinute = cur;
            k.totalUnits = k.totalMinutes = total;
            k.progress =
              total > 0
                ? Math.round((cur / total) * 100)
                : Number(k.progress || 0) || 0;
            saveSafe();
            renderSafe();
            msg("تم حفظ التقدم");
          };
          Actions.v641SaveDetails = function (id) {
            var k = findKnowledge(id);
            if (!k) return;
            k.summary = k.videoSummary =
              (byId("v641_summary") || {}).value || "";
            k.ideas = (byId("v641_ideas") || {}).value || "";
            k.application = k.actionTaken =
              (byId("v641_action") || {}).value || "";
            k.lessonLearned = (byId("v641_lesson") || {}).value || "";
            saveSafe();
            msg("تم حفظ التفاصيل");
          };
          Actions.v641CompleteKnowledge = function (id) {
            var k = findKnowledge(id);
            if (!k) return;
            k.status = "done";
            k.finished = true;
            k.progress = 100;
            if (k.totalUnits || k.totalMinutes)
              k.currentUnit = k.currentMinute = k.totalUnits || k.totalMinutes;
            state.timeline = state.timeline || [];
            state.timeline.unshift({
              id: uidSafe(),
              title: "أنهيت: " + (k.title || "محتوى"),
              date: new Date().toISOString().slice(0, 10),
              area: k.area || "التعلم",
              note: "تم الإنهاء من المشغل الداخلي.",
            });
            saveSafe();
            try {
              if (typeof closeModal === "function") closeModal();
            } catch (e) {}
            renderSafe();
            msg("تم تسجيله كإنجاز 🏆");
          };
          // Stable to-do fallbacks.
          Actions.v641ToggleTask = function (id) {
            var t = findTask(id);
            if (!t) return;
            t.status = t.status === "done" ? "todo" : "done";
            saveSafe();
            renderSafe();
          };
          if (!Actions.v638ToggleTask)
            Actions.v638ToggleTask = Actions.v641ToggleTask;
          if (!Actions.v638QuickTask)
            Actions.v638QuickTask = function () {
              var v =
                (byId("v638_quick_task") || byId("v64_quick_task") || {})
                  .value || "";
              v = v.trim();
              if (!v) return msg("اكتب المهمة أولاً");
              state.tasks = state.tasks || [];
              state.tasks.unshift({
                id: uidSafe(),
                title: v,
                project: "مهمة سريعة",
                status: "todo",
              });
              saveSafe();
              renderSafe();
            };
          // Route click fallback, useful after repeated render overrides.
          document.addEventListener(
            "click",
            function (e) {
              var r = e.target.closest("[data-route]");
              if (!r) return;
              if (typeof window.route !== "undefined") {
                window.route = r.dataset.route;
                renderSafe();
              }
            },
            true,
          );
        });
      })();

      /* script section 8 */
      (function () {
        function ready(fn) {
          document.readyState === "loading"
            ? document.addEventListener("DOMContentLoaded", fn, { once: true })
            : fn();
        }
        function E(v) {
          return String(v ?? "").replace(/[&<>\"]/g, function (m) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[m];
          });
        }
        function $(id) {
          return document.getElementById(id);
        }
        function saveSafe() {
          try {
            if (typeof save === "function") save();
            else
              localStorage.setItem(
                "mogahed_os_x_v30",
                JSON.stringify(window.state || {}),
              );
          } catch (e) {}
        }
        function toastSafe(t) {
          try {
            if (typeof toast === "function") toast(t);
          } catch (e) {}
        }
        function renderSafe() {
          try {
            if (typeof render === "function") render();
          } catch (e) {}
        }
        function getK(id) {
          return ((window.state && state.knowledge) || []).find(
            (x) => String(x.id) === String(id),
          );
        }
        function youtubeId(url) {
          url = String(url || "");
          try {
            var u = new URL(url);
            var h = u.hostname.replace(/^www\./, "").toLowerCase();
            if (h === "youtu.be")
              return u.pathname.split("/").filter(Boolean)[0] || "";
            if (h.includes("youtube.com"))
              return (
                u.searchParams.get("v") ||
                u.pathname.split("/").filter(Boolean).pop() ||
                ""
              );
          } catch (e) {}
          var m = url.match(
            /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
          );
          return m ? m[1] : "";
        }
        function openModalSafe(title, body) {
          try {
            if (typeof openModal === "function") return openModal(title, body);
          } catch (e) {}
          var m = $("modal"),
            t = $("modalTitle"),
            b = $("modalBody");
          if (t) t.textContent = title;
          if (b) b.innerHTML = body;
          if (m) m.classList.add("open");
        }
        function media(k) {
          var url = k.mediaUrl || k.link || k.url || "";
          var data = k.mediaData || "";
          var mime = k.mediaMime || "";
          var yid = youtubeId(url);
          if (yid) {
            var src =
              "https://www.youtube-nocookie.com/embed/" +
              E(yid) +
              "?rel=0&modestbranding=1&playsinline=1";
            return (
              '<iframe src="' +
              src +
              '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><div class="v642-youtube-fallback"><b>لو ظهر خطأ 153:</b> ده غالبًا من قيود يوتيوب داخل ملف HTML محلي أو إعدادات الفيديو، مش من المشروع. التقدم والملاحظات شغالين عادي.<div class="row"><button class="btn secondary mini" data-action="openExternal" data-url="' +
              E(url) +
              '">فتح على YouTube</button><button class="btn secondary mini" data-action="v642AddWatchTask">أضف مهمة مشاهدة لاحقًا</button></div></div>'
            );
          }
          if (data && /^audio\//.test(mime))
            return '<audio controls src="' + E(data) + '"></audio>';
          if (data && /^video\//.test(mime))
            return '<video controls playsinline src="' + E(data) + '"></video>';
          if (url && /\.(mp4|webm|ogg)(\?|#|$)/i.test(url))
            return '<video controls playsinline src="' + E(url) + '"></video>';
          if (url && /\.(mp3|wav|m4a|aac|ogg)(\?|#|$)/i.test(url))
            return '<audio controls src="' + E(url) + '"></audio>';
          return (
            '<div class="player-empty v2"><div><h3>لا يوجد مشغل داخلي لهذا الرابط</h3><p class="muted">افتح المصدر خارجيًا أو أضف ملف مباشر.</p><button class="btn secondary" data-action="openExternal" data-url="' +
            E(url) +
            '">فتح خارجي</button></div></div>'
          );
        }
        function openPlayer(id) {
          var k = getK(id);
          if (!k) return toastSafe("العنصر غير موجود");
          var p = Math.max(0, Math.min(100, Number(k.progress || 0) || 0)),
            cur = Number(k.currentUnit || k.currentMinute || 0) || 0,
            total = Number(k.totalUnits || k.totalMinutes || 0) || 0;
          openModalSafe(
            "مشاهدة الفيديو داخل المشروع",
            '<div class="v638-player-head"><div><h3>' +
              E(k.title || "محتوى") +
              "</h3><p>" +
              E(k.type || "معرفة") +
              " • التقدم " +
              p +
              '%</p></div><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div><div class="v638-player"><main class="v638-main">' +
              (k.cover
                ? '<img class="v638-cover" src="' +
                  E(k.cover) +
                  '" onerror="this.style.display=\'none\'">'
                : "") +
              '<div class="v638-watch">' +
              media(k) +
              '</div><div class="item"><b>التقدم</b><div class="v638-two"><div><label>وصلت إلى دقيقة</label><input id="v642_current" type="number" min="0" value="' +
              cur +
              '"></div><div><label>إجمالي الدقائق</label><input id="v642_total" type="number" min="0" value="' +
              total +
              '"></div></div></div></main><aside class="v638-side"><div class="v638-acc open"><button class="v638-head" type="button"><span><b>ملخص وملاحظات</b><small>كل شيء هنا محفوظ داخل نفس الفيديو</small></span><i>⌄</i></button><div class="v638-body"><label>ملخص</label><textarea id="v642_summary">' +
              E(k.videoSummary || k.summary || "") +
              '</textarea><label>أفكار مهمة</label><textarea id="v642_ideas">' +
              E(k.ideas || "") +
              '</textarea><label>تطبيق عملي</label><textarea id="v642_action">' +
              E(k.actionTaken || k.application || "") +
              '</textarea><label>النتيجة / الدرس</label><textarea id="v642_lesson">' +
              E(k.lessonLearned || k.result || "") +
              '</textarea></div></div><div class="v638-acc v642-apply-box open"><button class="v638-head" type="button"><span><b>مهمة بعد الفيديو</b><small>حوّل المشاهدة لفعل صغير</small></span><i>⌄</i></button><div class="v638-body"><input id="v642_task" placeholder="مثال: أراجع أول 10 دقائق وأكتب 3 فوائد"><button class="btn secondary" data-action="v642CreateTask" data-id="' +
              E(k.id) +
              '">+ أضف للمهام</button></div></div></aside></div><div class="v642-sticky-actions"><div class="row"><button class="btn" data-action="v642SaveAll" data-id="' +
              E(k.id) +
              '">حفظ كل شيء</button><button class="btn secondary" data-action="v642Complete" data-id="' +
              E(k.id) +
              '">أنهيت المحتوى</button><button class="btn secondary" data-action="closeModal">إغلاق</button></div></div>',
          );
          var m = $("modal");
          if (m) m.classList.add("player-mode");
        }
        ready(function () {
          if (!window.Actions) return;
          window.Actions.v642SaveAll = function (id) {
            var k = getK(id);
            if (!k) return;
            var cur = Number(($("v642_current") || {}).value || 0),
              total = Number(($("v642_total") || {}).value || 0);
            k.currentUnit = k.currentMinute = cur;
            k.totalUnits = k.totalMinutes = total;
            k.progress =
              total > 0
                ? Math.max(0, Math.min(100, Math.round((cur / total) * 100)))
                : Number(k.progress || 0) || 0;
            k.summary = k.videoSummary = ($("v642_summary") || {}).value || "";
            k.ideas = ($("v642_ideas") || {}).value || "";
            k.application = k.actionTaken =
              ($("v642_action") || {}).value || "";
            k.lessonLearned = k.result = ($("v642_lesson") || {}).value || "";
            saveSafe();
            renderSafe();
            toastSafe("تم حفظ التقدم والتفاصيل");
          };
          window.Actions.v642Complete = function (id) {
            window.Actions.v642SaveAll(id);
            var k = getK(id);
            if (!k) return;
            k.status = "done";
            k.finished = true;
            k.progress = 100;
            if (k.totalUnits || k.totalMinutes)
              k.currentUnit = k.currentMinute = k.totalUnits || k.totalMinutes;
            state.timeline = state.timeline || [];
            state.timeline.unshift({
              id: Date.now().toString(36),
              title: "أنهيت: " + (k.title || "محتوى"),
              date: new Date().toISOString().slice(0, 10),
              area: k.area || "التعلم",
              note: "تم الإنهاء من مشغل V64.2",
            });
            saveSafe();
            try {
              Actions.closeModal && Actions.closeModal();
            } catch (e) {}
            renderSafe();
            toastSafe("تم تسجيله كإنجاز 🏆");
          };
          window.Actions.v642CreateTask = function (id) {
            var k = getK(id);
            var v = (($("v642_task") || {}).value || "").trim();
            if (!v && k) v = "تطبيق من فيديو: " + (k.title || "محتوى");
            state.tasks = state.tasks || [];
            state.tasks.unshift({
              id:
                Date.now().toString(36) +
                Math.random().toString(36).slice(2, 6),
              title: v,
              project: "تعلم",
              priority: "med",
              status: "todo",
              knowledgeId: id,
            });
            saveSafe();
            toastSafe("اتضافت في المهام ✅");
          };
          window.Actions.v642AddWatchTask = function () {
            var title =
              document.querySelector(".v638-player-head h3")?.textContent ||
              "مشاهدة الفيديو";
            state.tasks = state.tasks || [];
            state.tasks.unshift({
              id:
                Date.now().toString(36) +
                Math.random().toString(36).slice(2, 6),
              title: "أكمل: " + title,
              project: "تعلم",
              priority: "med",
              status: "todo",
            });
            saveSafe();
            toastSafe("تمت إضافة مهمة مشاهدة لاحقًا");
          };
          var old = window.Actions.openKnowledgePlayer;
          window.Actions.openKnowledgePlayer = function (id) {
            var k = getK(id);
            var type = String((k && k.type) || "").toLowerCase(),
              url = String(
                (k && (k.mediaUrl || k.link || k.url)) || "",
              ).toLowerCase();
            if (
              k &&
              (/video|فيديو|youtube|يوتيوب/.test(type + " " + url) ||
                k.mediaData)
            ) {
              openPlayer(id);
              return;
            }
            try {
              return old && old.apply(this, arguments);
            } catch (e) {
              return openPlayer(id);
            }
          };
          document.addEventListener(
            "click",
            function (e) {
              var acc = e.target.closest(".v638-head");
              if (acc) {
                var box = acc.closest(".v638-acc");
                if (box) {
                  box.classList.toggle("open");
                  e.preventDefault();
                }
              }
            },
            true,
          );
        });
      })();

      /* script section 9 */
      (function () {
        function ready(fn) {
          document.readyState === "loading"
            ? document.addEventListener("DOMContentLoaded", fn, { once: true })
            : fn();
        }
        function H(v) {
          var esc = (window.MogahedOSX && MogahedOSX.esc) || window.esc;
          return esc
            ? esc(String(v ?? ""))
            : String(v ?? "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
        }
        function st() {
          return (window.MogahedOSX && MogahedOSX.state) || window.state || {};
        }
        function acts() {
          return (
            (window.MogahedOSX && MogahedOSX.Actions) || window.Actions || {}
          );
        }
        function save() {
          try {
            (window.MogahedOSX && MogahedOSX.save
              ? MogahedOSX.save
              : window.save)();
          } catch (e) {
            try {
              localStorage.setItem("mogahed_os_x_v30", JSON.stringify(st()));
            } catch (_) {}
          }
        }
        function render() {
          try {
            (window.MogahedOSX && MogahedOSX.render
              ? MogahedOSX.render
              : window.render)();
          } catch (e) {}
        }
        function toast(t) {
          try {
            (window.MogahedOSX && MogahedOSX.toast
              ? MogahedOSX.toast
              : window.toast)(t);
          } catch (e) {}
        }
        function getK(id) {
          return (st().knowledge || []).find(
            (x) => String(x.id) === String(id),
          );
        }
        function ytId(url) {
          url = String(url || "").trim();
          try {
            var u = new URL(url);
            var h = u.hostname.replace(/^www\./, "");
            if (h === "youtu.be")
              return u.pathname.split("/").filter(Boolean)[0] || "";
            if (h.includes("youtube.com"))
              return (
                u.searchParams.get("v") ||
                (/\/(shorts|live|embed)\/([^/?#]+)/.exec(u.pathname) ||
                  [])[2] ||
                ""
              );
          } catch (e) {}
          return (
            (url.match(
              /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
            ) || [])[1] || ""
          );
        }
        function thumbFrom(k) {
          var url = k && (k.cover || k.thumbnail || k.image || "");
          if (url) return url;
          var id = ytId(k && (k.mediaUrl || k.link || k.url || ""));
          return id ? "https://i.ytimg.com/vi/" + id + "/hqdefault.jpg" : "";
        }
        function isVideo(k) {
          var s =
            String(k?.type || "") +
            " " +
            String(k?.mediaType || "") +
            " " +
            String(k?.mediaUrl || k?.link || k?.url || "");
          return (
            !!k &&
            !k.playlistGroupId &&
            !k.isPlaylistItem &&
            /(فيديو|video|youtube|youtu\.be|يوتيوب|mp4)/i.test(s)
          );
        }
        function normalizeVideoThumb(k) {
          if (!isVideo(k)) return;
          var th = thumbFrom(k);
          if (th && !k.cover) {
            k.cover = th;
            k.thumbnail = th;
          }
        }
        function removeDuplicateSingleAI() {
          document
            .querySelectorAll("#v643_single_ai")
            .forEach((el) => el.remove());
        }
        function aiPanel(k) {
          return (
            '<div class="v644-ai-panel" id="v644_single_ai"><h3>✨ ملخص AI للفيديو</h3><p>نفس أدوات البلاي ليست: Transcript اختياري + توليد ملخص + حفظ النص والملخص داخل نفس الفيديو.</p><label>Transcript / نص الفيديو اختياري</label><textarea id="v57Transcript" placeholder="الصق نص الفيديو هنا لو متاح. لو مش موجود، AI هيعتمد على العنوان والملاحظات.">' +
            H(k.transcriptText || "") +
            '</textarea><textarea id="v56VideoSummary" style="display:none">' +
            H(k.videoSummary || k.summary || "") +
            '</textarea><div class="v644-ai-actions"><button class="btn" data-action="generateAISummary" data-id="' +
            H(k.id) +
            '">✨ تلخيص شامل بالذكاء الاصطناعي</button><button class="btn secondary" data-action="v644SaveSingleAI" data-id="' +
            H(k.id) +
            '">💾 حفظ النص والملخص</button></div></div>'
          );
        }
        function ensureSinglePlayerUI(k) {
          if (!isVideo(k)) return;
          normalizeVideoThumb(k);
          removeDuplicateSingleAI();
          if (!document.getElementById("v644_single_ai")) {
            var summary =
              document.getElementById("v642_summary") ||
              document.getElementById("v638_summary") ||
              document.getElementById("v636_summary");
            var host =
              summary?.closest(
                ".v638-body,.v636-accordion-body,.player-side",
              ) || document.querySelector(".v638-side,.player-side");
            if (host) {
              summary
                ? summary.insertAdjacentHTML("beforebegin", aiPanel(k))
                : host.insertAdjacentHTML("afterbegin", aiPanel(k));
            }
          }
          var main = document.querySelector(
            ".v638-main,.v634-video-single-player,.player-shell",
          );
          var th = thumbFrom(k);
          if (main && th && !main.querySelector(".v644-single-thumb"))
            main.insertAdjacentHTML(
              "afterbegin",
              '<img class="v644-single-thumb" src="' +
                H(th) +
                '" onerror="this.remove()">',
            );
        }
        function enhanceCards() {
          var changed = false;
          (st().knowledge || []).forEach((k) => {
            if (isVideo(k) && !k.cover) {
              normalizeVideoThumb(k);
              if (k.cover) changed = true;
            }
          });
          if (changed) save();
          document
            .querySelectorAll(".knowledge-card,.item,.card")
            .forEach((card) => {
              var btn = card.querySelector(
                '[data-action="openKnowledgePlayer"][data-id]',
              );
              if (!btn) return;
              var k = getK(btn.dataset.id);
              if (!isVideo(k)) return;
              var th = thumbFrom(k);
              if (th && !card.querySelector(".v644-single-thumb")) {
                var title =
                  card.querySelector(".knowledge-title-row,.space,h4,h3,h2") ||
                  card.firstElementChild;
                var html =
                  '<img class="v644-single-thumb" src="' +
                  H(th) +
                  '" onerror="this.remove()">';
                title
                  ? title.insertAdjacentHTML("afterend", html)
                  : card.insertAdjacentHTML("afterbegin", html);
              }
            });
        }
        function patchRescue() {
          var A = acts();
          if (!A || A.__v644_rescue) return;
          A.__v644_rescue = true;
          var tasks = {
            water: ["💧", "مياه", "اشرب كوب مياه ببطء وخد 3 أنفاس."],
            move: ["💪", "حركة", "اعمل 10 ضغط أو 20 سكوات أو تمشية دقيقة."],
            breath: ["😮‍💨", "تنفس", "تنفس 4-4-4 خمس مرات."],
            stretch: ["🤸", "تمدد", "افرد ضهرك ورقبتك وكتفك 60 ثانية."],
            clean: ["🧹", "ترتيب", "رتب حاجة صغيرة قدامك خلال دقيقتين."],
            write: ["✍️", "تفريغ", "اكتب سبب التشتت في سطر واحد."],
            pray: ["🤲", "روحاني", "استغفار أو دعاء دقيقة بهدوء."],
            focus: ["🎯", "تركيز", "افتح المهمة الحالية فقط واقفل الباقي."],
          };
          function pick(kind) {
            var keys = Object.keys(tasks);
            var key =
              kind && tasks[kind]
                ? kind
                : keys[Math.floor(Math.random() * keys.length)];
            return [key].concat(tasks[key]);
          }
          A.emergencyPlan = function () {
            var t = pick();
            var open =
              window.openModal ||
              function (title, body) {
                var m = document.getElementById("modal"),
                  mt = document.getElementById("modalTitle"),
                  mb = document.getElementById("modalBody");
                if (mt) mt.textContent = title;
                if (mb) mb.innerHTML = body;
                if (m) m.classList.add("open");
              };
            open(
              "🚨 طوارئ التشتت",
              '<div class="rescue-modal-wrap"><span class="rescue-category-badge">' +
                t[1] +
                " " +
                t[2] +
                '</span><div class="rescue-task-card"><div class="rescue-icon-big">' +
                t[1] +
                '</div><p class="rescue-task-text">' +
                H(t[3]) +
                '</p><p class="rescue-hint">نفّذها الآن، ثم ابدأ 15 دقيقة إنقاذ.</p></div><div class="rescue-checklist"><label class="rescue-check-item"><input type="checkbox"> أوقفت مصدر التشتيت</label><label class="rescue-check-item"><input type="checkbox"> نفذت مهمة الإنقاذ</label><label class="rescue-check-item"><input type="checkbox"> جاهز أبدأ تركيز الآن</label></div><div class="rescue-actions"><button class="btn rescue rescue-primary" data-action="startEmergencyFocus">⏱️ ابدأ إنقاذ 15 دقيقة</button><button class="btn secondary" data-action="v644AddRescueTask" data-task="' +
                H(t[3]) +
                '">+ أضفها للمهام</button><button class="btn secondary" data-action="emergencyPlan">🎲 مهمة تانية</button><div class="rescue-mini-grid">' +
                Object.entries(tasks)
                  .slice(0, 8)
                  .map(
                    ([k, v]) =>
                      '<button class="rescue-mini-btn" data-action="v644RescueKind" data-kind="' +
                      k +
                      '"><b>' +
                      v[0] +
                      "</b><span>" +
                      v[1] +
                      "</span></button>",
                  )
                  .join("") +
                "</div></div></div>",
            );
          };
          A.v644RescueKind = function (kind) {
            var old = Math.random;
            try {
              var map = {
                water: 0,
                move: 0.13,
                breath: 0.26,
                stretch: 0.39,
                clean: 0.52,
                write: 0.65,
                pray: 0.78,
                focus: 0.91,
              };
              Math.random = () => map[kind] || 0;
              A.emergencyPlan();
            } finally {
              Math.random = old;
            }
          };
          A.v644AddRescueTask = function (_, btn) {
            var title = btn?.dataset?.task || "مهمة إنقاذ من التشتت";
            var s = st();
            s.tasks = s.tasks || [];
            s.tasks.unshift({
              id:
                Date.now().toString(36) +
                Math.random().toString(36).slice(2, 6),
              title: title,
              project: "طوارئ التشتت",
              priority: "high",
              status: "todo",
            });
            save();
            toast("اتضافت للمهام ✅");
          };
        }
        function patchOpenPlayer() {
          var A = acts();
          if (!A || A.__v644_player) return;
          A.__v644_player = true;
          var old = A.openKnowledgePlayer;
          A.openKnowledgePlayer = function (id) {
            var r = old ? old.apply(this, arguments) : undefined;
            setTimeout(() => ensureSinglePlayerUI(getK(id)), 120);
            setTimeout(() => ensureSinglePlayerUI(getK(id)), 550);
            return r;
          };
        }
        function patchAI() {
          var A = acts();
          if (!A || A.__v644_ai) return;
          A.__v644_ai = true;
          A.v644SaveSingleAI = function (id) {
            var k = getK(id);
            if (!k) return;
            k.transcriptText = (
              document.getElementById("v57Transcript")?.value || ""
            ).trim();
            var s =
              document.getElementById("v642_summary") ||
              document.getElementById("v638_summary") ||
              document.getElementById("v636_summary") ||
              document.getElementById("v56VideoSummary");
            k.videoSummary = k.summary =
              s?.value || k.videoSummary || k.summary || "";
            normalizeVideoThumb(k);
            save();
            toast("تم حفظ نص وملخص الفيديو");
          };
          var old = A.generateAISummary;
          if (old && !A.__v644_generateWrapped) {
            A.__v644_generateWrapped = true;
            A.generateAISummary = async function (id) {
              var k = getK(id);
              if (k && isVideo(k)) {
                k.transcriptText =
                  document.getElementById("v57Transcript")?.value ||
                  "" ||
                  k.transcriptText ||
                  "";
                normalizeVideoThumb(k);
                save();
              }
              var out = await old.apply(this, arguments);
              setTimeout(() => {
                var kk = getK(id);
                if (!kk) return;
                var sum =
                  kk.videoSummary ||
                  kk.summary ||
                  document.getElementById("v56VideoSummary")?.value ||
                  "";
                ["v642_summary", "v638_summary", "v636_summary"].forEach(
                  (i) => {
                    var el = document.getElementById(i);
                    if (el && sum) el.value = sum;
                  },
                );
                ensureSinglePlayerUI(kk);
              }, 700);
              return out;
            };
          }
        }
        function patchSaveKnowledge() {
          var A = acts();
          if (!A || A.__v644_save) return;
          A.__v644_save = true;
          var old = A.saveKnowledge;
          if (old) {
            A.saveKnowledge = function () {
              var r = old.apply(this, arguments);
              setTimeout(() => {
                (st().knowledge || []).forEach(normalizeVideoThumb);
                save();
                render();
              }, 350);
              return r;
            };
          }
        }
        function makeSortable() {
          document.body.classList.add("v644-sortable-ready");
          var lists = document.querySelectorAll(
            ".list,.v64-todo-list,.v53-playlist-list,.kanban,.grid",
          );
          lists.forEach((list) => {
            if (list.dataset.v644Sort) return;
            var items = [...list.children].filter(
              (el) =>
                el.querySelector("[data-id],[data-group]") || el.dataset.id,
            );
            if (items.length < 2) return;
            list.dataset.v644Sort = "1";
            items.forEach((el) => {
              el.draggable = true;
              if (!el.querySelector(".v644-drag-handle")) {
                var h = document.createElement("span");
                h.className = "v644-drag-handle";
                h.textContent = "☰";
                (el.querySelector("h4,h3,h2,.v64-todo-title") || el).prepend(h);
              }
              el.addEventListener("dragstart", (e) => {
                el.classList.add("v644-dragging");
                e.dataTransfer.effectAllowed = "move";
              });
              el.addEventListener("dragend", () => {
                el.classList.remove("v644-dragging");
                persistDomOrder(list);
              });
            });
            list.addEventListener("dragover", (e) => {
              e.preventDefault();
              var dragging = list.querySelector(".v644-dragging");
              if (!dragging) return;
              var after = [...list.children]
                .filter((x) => x !== dragging)
                .find(
                  (child) =>
                    e.clientY <
                    child.getBoundingClientRect().top +
                      child.getBoundingClientRect().height / 2,
                );
              after
                ? list.insertBefore(dragging, after)
                : list.appendChild(dragging);
            });
          });
        }
        function elementId(el) {
          return (
            el.dataset.id ||
            el.querySelector("[data-id]")?.dataset.id ||
            el.querySelector("[data-group]")?.dataset.group ||
            ""
          );
        }
        function persistDomOrder(list) {
          var ids = [...list.children].map(elementId).filter(Boolean);
          if (ids.length < 2) return;
          var s = st();
          function reorder(arr) {
            if (!Array.isArray(arr)) return;
            var map = new Map(arr.map((x) => [String(x.id), x]));
            var ordered = ids.map((id) => map.get(String(id))).filter(Boolean);
            if (ordered.length > 1) {
              var rest = arr.filter((x) => !ids.includes(String(x.id)));
              arr.splice(0, arr.length, ...ordered, ...rest);
            }
          }
          reorder(s.tasks);
          reorder(s.knowledge);
          reorder(s.projects);
          reorder(s.goals);
          reorder(s.actions);
          reorder(s.decisions);
          save();
          toast("تم حفظ الترتيب");
        }
        function boot() {
          patchRescue();
          patchOpenPlayer();
          patchAI();
          patchSaveKnowledge();
          enhanceCards();
          makeSortable();
        }
        ready(() => {
          boot();
          new MutationObserver(() => {
            clearTimeout(window.__v644Timer);
            window.__v644Timer = setTimeout(() => {
              enhanceCards();
              makeSortable();
              removeDuplicateSingleAI();
            }, 180);
          }).observe(document.body, { childList: true, subtree: true });
        });
      })();

      /* script section 10 */
      (function () {
        "use strict";
        function wait(cb, n) {
          n = n || 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions &&
            typeof window.MogahedOSX.render === "function"
          ) {
            cb(window.MogahedOSX);
            return;
          }
          if (n < 160)
            setTimeout(function () {
              wait(cb, n + 1);
            }, 50);
        }
        wait(function (api) {
          var state = api.state,
            Actions = api.Actions,
            save = api.save,
            render = api.render,
            toast = api.toast || function () {},
            esc = api.esc || H;
          function H(v) {
            return String(v == null ? "" : v).replace(/[&<>"']/g, function (m) {
              return {
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              }[m];
            });
          }
          function $(id) {
            return document.getElementById(id);
          }
          function val(id) {
            var e = $(id);
            return e ? String(e.value || "").trim() : "";
          }
          function uid() {
            return typeof window.uid === "function"
              ? window.uid()
              : Date.now().toString(36) +
                  Math.random().toString(36).slice(2, 8);
          }
          function active(arr) {
            return (arr || []).filter(function (x) {
              return !x.archived && !x.deleted;
            });
          }
          function yid(url) {
            url = String(url || "");
            try {
              var u = new URL(url),
                h = u.hostname.replace(/^www\./, "");
              if (h === "youtu.be")
                return u.pathname.split("/").filter(Boolean)[0] || "";
              if (h.indexOf("youtube.com") > -1)
                return (
                  u.searchParams.get("v") ||
                  (/\/(shorts|live|embed)\/([^/?#]+)/.exec(u.pathname) ||
                    [])[2] ||
                  ""
                );
            } catch (e) {}
            return (
              (url.match(
                /(?:v=|youtu\.be\/|shorts\/|live\/|embed\/)([A-Za-z0-9_-]{6,})/,
              ) || [])[1] || ""
            );
          }
          function plid(url) {
            return (
              (String(url || "").match(/[?&]list=([\w-]+)/) || [])[1] || ""
            );
          }
          function watch(id) {
            return "https://www.youtube.com/watch?v=" + encodeURIComponent(id);
          }
          function thumbForVideo(id) {
            return id
              ? "https://i.ytimg.com/vi/" +
                  encodeURIComponent(id) +
                  "/hqdefault.jpg"
              : "";
          }
          function isSingleVideo(k) {
            var s =
              String((k && k.type) || "") +
              " " +
              String((k && k.mediaType) || "") +
              " " +
              String((k && (k.mediaUrl || k.link || k.url)) || "");
            return (
              !!k &&
              !k.isPlaylistItem &&
              !k.playlistGroupId &&
              /(فيديو|video|youtube|youtu\.be|يوتيوب|mp4)/i.test(s)
            );
          }
          async function fetchJSON(url) {
            var r = await fetch(url),
              d = await r.json();
            if (!r.ok || d.error)
              throw new Error(
                (d.error && d.error.message) || "فشل الاتصال بيوتيوب",
              );
            return d;
          }
          async function fetchPlaylistMeta(listId, key) {
            var d = await fetchJSON(
              "https://www.googleapis.com/youtube/v3/playlists?part=snippet&id=" +
                encodeURIComponent(listId) +
                "&key=" +
                encodeURIComponent(key),
            );
            var sn = (d.items && d.items[0] && d.items[0].snippet) || {};
            var th = sn.thumbnails || {};
            return {
              title: sn.title || "",
              cover:
                (th.maxres && th.maxres.url) ||
                (th.high && th.high.url) ||
                (th.medium && th.medium.url) ||
                (th.default && th.default.url) ||
                "",
            };
          }
          function parseDur(s) {
            var m = String(s || "").match(
              /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/,
            );
            if (!m) return 0;
            return (
              Number(m[1] || 0) * 60 +
              Number(m[2] || 0) +
              (Number(m[3] || 0) ? 1 : 0)
            );
          }
          async function fetchDurations(ids, key) {
            var out = {};
            for (var i = 0; i < ids.length; i += 50) {
              var part = ids.slice(i, i + 50);
              var d = await fetchJSON(
                "https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=" +
                  encodeURIComponent(part.join(",")) +
                  "&key=" +
                  encodeURIComponent(key),
              );
              (d.items || []).forEach(function (it) {
                out[it.id] = parseDur(
                  it.contentDetails && it.contentDetails.duration,
                );
              });
            }
            return out;
          }
          async function fetchPlaylistVideos(listId, key) {
            var page = "",
              items = [];
            do {
              var d = await fetchJSON(
                "https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=" +
                  encodeURIComponent(listId) +
                  "&key=" +
                  encodeURIComponent(key) +
                  (page ? "&pageToken=" + encodeURIComponent(page) : ""),
              );
              page = d.nextPageToken || "";
              (d.items || []).forEach(function (it) {
                var sn = it.snippet || {},
                  rid = sn.resourceId || {},
                  id = rid.videoId;
                if (!id) return;
                var title = sn.title || "فيديو";
                if (/Private video|Deleted video/i.test(title)) return;
                var th = sn.thumbnails || {};
                items.push({
                  videoId: id,
                  title: title,
                  thumbnail:
                    (th.high && th.high.url) ||
                    (th.medium && th.medium.url) ||
                    (th.default && th.default.url) ||
                    thumbForVideo(id),
                });
              });
            } while (page);
            var durations = await fetchDurations(
              items.map(function (x) {
                return x.videoId;
              }),
              key,
            ).catch(function () {
              return {};
            });
            items.forEach(function (x) {
              x.duration = durations[x.videoId] || 0;
            });
            return items;
          }

          function normalizeExisting() {
            var changed = false,
              groups = {};
            (state.knowledge || []).forEach(function (k) {
              if (k && k.isPlaylistItem && k.playlistGroupId) {
                groups[k.playlistGroupId] = groups[k.playlistGroupId] || [];
                groups[k.playlistGroupId].push(k);
              }
              if (isSingleVideo(k)) {
                var id = yid(k.mediaUrl || k.link || k.url || "");
                var th = k.cover || k.thumbnail || thumbForVideo(id);
                if (th && !k.cover) {
                  k.cover = th;
                  k.thumbnail = th;
                  changed = true;
                }
              }
            });
            Object.keys(groups).forEach(function (gid) {
              var arr = groups[gid],
                cov =
                  arr.find(function (x) {
                    return x.playlistCover;
                  })?.playlistCover || "";
              if (cov) {
                arr.forEach(function (x) {
                  if (x.playlistCover !== cov) {
                    x.playlistCover = cov;
                    changed = true;
                  }
                });
              }
            });
            if (changed) save();
          }

          var previousSaveKnowledge = Actions.saveKnowledge;
          Actions.saveKnowledge = async function (id) {
            var playlistUrl = val("k_playlistUrl");
            if (playlistUrl) {
              var listId = plid(playlistUrl);
              if (!listId) {
                toast("رابط البلاي ليست غير واضح");
                return true;
              }
              var key =
                val("k_youtubeApiKey") ||
                (state.settings && state.settings.youtubeApiKey) ||
                "";
              if (!key) {
                toast("ضع YouTube API Key علشان أسحب اسم البلاي ليست الحقيقي");
                return true;
              }
              state.settings = state.settings || {};
              state.settings.youtubeApiKey = key;
              save();
              try {
                toast("جاري سحب اسم وصورة البلاي ليست من YouTube...");
                var meta = await fetchPlaylistMeta(listId, key);
                var videos = await fetchPlaylistVideos(listId, key);
                if (!videos.length) {
                  toast("لم يتم العثور على فيديوهات قابلة للاستيراد");
                  return true;
                }
                var groupTitle = meta.title || "قائمة YouTube"; // intentionally ignores manual title
                var groupCover = meta.cover || videos[0].thumbnail || "";
                var groupId = uid();
                var typ = val("k_type") || "فيديو";
                var area = val("k_area") || "التعلم";
                var rating = Number(val("k_rating") || 0);
                var summary = val("k_summary") || "قائمة: " + groupTitle;
                videos
                  .slice()
                  .reverse()
                  .forEach(function (v, i) {
                    var index = videos.length - i;
                    state.knowledge.unshift({
                      id: uid(),
                      title: v.title,
                      type: typ,
                      area: area,
                      author: groupTitle,
                      rating: rating,
                      status: "active",
                      cover: v.thumbnail,
                      thumbnail: v.thumbnail,
                      playlistCover: groupCover,
                      mediaType: "YouTube",
                      mediaUrl: watch(v.videoId),
                      link: watch(v.videoId),
                      youtubeVideoId: v.videoId,
                      playlistUrl: playlistUrl,
                      playlistId: listId,
                      playlistGroup: groupTitle,
                      playlistGroupTitle: groupTitle,
                      playlistGroupId: groupId,
                      playlistIndex: index,
                      playlistTotal: videos.length,
                      isPlaylistItem: true,
                      currentUnit: 0,
                      currentMinute: 0,
                      totalUnits: v.duration || 0,
                      totalMinutes: v.duration || 0,
                      progress: 0,
                      summary: summary,
                      videoSummary: "",
                      transcriptText: "",
                      ideas: "",
                      application: "",
                      actionTaken: "",
                      resultAchieved: "",
                      lessonLearned: "",
                    });
                  });
                state.timeline = state.timeline || [];
                state.timeline.unshift({
                  id: uid(),
                  title: "استيراد Playlist: " + groupTitle,
                  date: new Date().toISOString().slice(0, 10),
                  area: "التعلم",
                  note:
                    "تم إنشاء " +
                    videos.length +
                    " فيديو من YouTube بعنوان القائمة الحقيقي.",
                });
                save();
                closeModalSafe();
                render();
                toast("تم استيراد القائمة باسمها الحقيقي: " + groupTitle);
                return true;
              } catch (e) {
                toast(
                  "فشل الاستيراد: " + (e.message || "تحقق من الرابط والمفتاح"),
                );
                return true;
              }
            }
            if (previousSaveKnowledge)
              return previousSaveKnowledge.apply(this, arguments);
          };
          function closeModalSafe() {
            try {
              if (Actions.closeModal) return Actions.closeModal();
            } catch (e) {}
            var m = $("modal");
            if (m) m.classList.remove("open", "player-mode");
          }

          function groupItems(gid) {
            return active(state.knowledge)
              .filter(function (x) {
                return (
                  x.isPlaylistItem && String(x.playlistGroupId) === String(gid)
                );
              })
              .sort(function (a, b) {
                return (
                  Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0)
                );
              });
          }
          function groups() {
            var o = {};
            active(state.knowledge).forEach(function (x) {
              if (x.isPlaylistItem && x.playlistGroupId) {
                var id = String(x.playlistGroupId);
                if (!o[id])
                  o[id] = {
                    id: id,
                    title:
                      x.playlistGroupTitle || x.playlistGroup || "Playlist",
                    cover: x.playlistCover || "",
                    items: [],
                  };
                if (x.playlistCover && !o[id].cover)
                  o[id].cover = x.playlistCover;
                o[id].items.push(x);
              }
            });
            Object.values(o).forEach(function (g) {
              g.items.sort(function (a, b) {
                return (
                  Number(a.playlistIndex || 0) - Number(b.playlistIndex || 0)
                );
              });
            });
            return o;
          }
          function prog(k) {
            if (typeof window.knowledgeProgress === "function")
              return window.knowledgeProgress(k);
            var t = Number(k.totalUnits || k.totalMinutes || 0),
              c = Number(k.currentUnit || k.currentMinute || 0);
            return t
              ? Math.min(100, Math.round((c / t) * 100))
              : Number(k.progress || 0) || 0;
          }
          function done(k) {
            return (
              k.status === "done" ||
              Number(k.progress || 0) >= 100 ||
              k.finished
            );
          }
          function playlistCard(g) {
            var total = g.items.length,
              doneCount = g.items.filter(done).length,
              minutes = g.items.reduce(function (s, x) {
                return s + Number(x.totalUnits || x.totalMinutes || 0);
              }, 0),
              pct = total ? Math.round((doneCount / total) * 100) : 0,
              next =
                g.items.find(function (x) {
                  return !done(x);
                }) || g.items[0],
              cover =
                g.cover ||
                g.items.find(function (x) {
                  return x.playlistCover;
                })?.playlistCover ||
                "";
            return (
              '<div class="item knowledge-card v53-playlist-card" style="--pl-thumb:url(\'' +
              H(cover) +
              "');--v645-pl-thumb:url('" +
              H(cover) +
              '\')"><div class="v53-playlist-hero"><span class="v645-playlist-thumb-layer"></span><div><div class="v53-playlist-top"><span class="v53-playlist-pill">📺 Playlist</span><span class="v53-playlist-pill">' +
              doneCount +
              "/" +
              total +
              ' مكتمل</span></div><h3 class="v53-playlist-title">' +
              H(g.title) +
              '</h3><p class="v53-playlist-sub">قائمة مجمعة — افتحها وشغّل كل فيديو من داخل نفس الشاشة بدون ما تتوه بين الكروت.</p></div></div><div class="v53-playlist-body"><div class="progress"><div class="bar" style="width:' +
              pct +
              '%"></div></div><div class="space"><span class="muted">تقدم القائمة</span><b>' +
              pct +
              '%</b></div><div class="v53-playlist-stats"><div class="v53-playlist-stat"><b>' +
              total +
              '</b><small>فيديو</small></div><div class="v53-playlist-stat"><b>' +
              doneCount +
              '</b><small>مكتمل</small></div><div class="v53-playlist-stat"><b>' +
              minutes +
              '</b><small>دقيقة</small></div></div><div class="v53-playlist-actions"><button class="btn" data-action="openPlaylistGroup" data-group="' +
              H(g.id) +
              '" data-video="' +
              H((next && next.id) || "") +
              '">▶ فتح القائمة</button><button class="btn secondary" data-action="openPlaylistGroup" data-group="' +
              H(g.id) +
              '">عرض الفيديوهات</button></div></div></div>'
            );
          }
          var oldCard = window.cardKnowledge;
          if (typeof oldCard === "function")
            window.cardKnowledge = function (k) {
              if (k && k.isPlaylistItem && k.playlistGroupId) {
                var g = groups()[String(k.playlistGroupId)];
                if (!g) return "";
                var first = g.items[0];
                return first && first.id === k.id ? playlistCard(g) : "";
              }
              return oldCard(k);
            };

          function aiPanel(k) {
            return (
              '<div class="v645-ai-panel" id="v645_single_ai"><h3>✨ ملخص الذكاء الاصطناعي</h3><p>نفس ملخص البلاي ليست: اكتب/الصق Transcript لو موجود، أو خلّي AI يعتمد على العنوان والملاحظات.</p><label>Transcript / نص الفيديو</label><textarea id="v57Transcript" placeholder="الصق النص هنا لو متاح">' +
              H(k.transcriptText || "") +
              '</textarea><label>الملخص الناتج</label><textarea class="v645-ai-output" id="v56VideoSummary" placeholder="الملخص يظهر هنا ويتحفظ داخل الفيديو">' +
              H(k.videoSummary || k.summary || "") +
              '</textarea><div class="v645-ai-actions"><button class="btn" data-action="generateAISummary" data-id="' +
              H(k.id) +
              '">✨ تلخيص شامل بالذكاء الاصطناعي</button><button class="btn secondary" data-action="v645SaveSingleAI" data-id="' +
              H(k.id) +
              '">💾 حفظ الملخص</button></div></div>'
            );
          }
          function injectSingleAI(k) {
            if (!isSingleVideo(k)) return;
            document
              .querySelectorAll("#v644_single_ai,#v643_single_ai")
              .forEach(function (e) {
                e.remove();
              });
            if ($("#v645_single_ai")) return;
            var host = document.querySelector(
              "#modalBody .player-side,#modalBody .v638-side,#modalBody .player-note-area,#modalBody .v638-body,#modalBody",
            );
            if (host) {
              host.insertAdjacentHTML(
                host.id === "modalBody" ? "beforeend" : "afterbegin",
                aiPanel(k),
              );
            }
            var id = yid(k.mediaUrl || k.link || k.url || "");
            var th = k.cover || k.thumbnail || thumbForVideo(id);
            if (
              th &&
              !document.querySelector("#modalBody .v645-single-card-thumb")
            ) {
              var main = document.querySelector(
                "#modalBody .v638-main,#modalBody .player-shell,#modalBody .v634-video-single-player",
              );
              if (main)
                main.insertAdjacentHTML(
                  "afterbegin",
                  '<img class="v645-single-card-thumb" src="' +
                    H(th) +
                    '" onerror="this.remove()">',
                );
            }
          }
          var oldOpen = Actions.openKnowledgePlayer;
          Actions.openKnowledgePlayer = function (id) {
            var r = oldOpen ? oldOpen.apply(this, arguments) : undefined;
            setTimeout(function () {
              var k = (state.knowledge || []).find(function (x) {
                return String(x.id) === String(id);
              });
              injectSingleAI(k);
            }, 120);
            setTimeout(function () {
              var k = (state.knowledge || []).find(function (x) {
                return String(x.id) === String(id);
              });
              injectSingleAI(k);
            }, 600);
            return r;
          };
          Actions.v645SaveSingleAI = function (id) {
            var k = (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
            if (!k) return;
            k.transcriptText = val("v57Transcript");
            var s =
              val("v56VideoSummary") ||
              val("v642_summary") ||
              val("v638_summary") ||
              val("v636_summary");
            k.videoSummary = s;
            k.summary = s || k.summary;
            var idv = yid(k.mediaUrl || k.link || k.url || "");
            if (idv && !k.cover) {
              k.cover = k.thumbnail = thumbForVideo(idv);
            }
            save();
            toast("تم حفظ ملخص الفيديو ✅");
          };
          if (Actions.generateAISummary && !Actions.__v645_ai_wrap) {
            var oldAI = Actions.generateAISummary;
            Actions.__v645_ai_wrap = true;
            Actions.generateAISummary = async function (id) {
              var k = (state.knowledge || []).find(function (x) {
                return String(x.id) === String(id);
              });
              if (k && isSingleVideo(k)) {
                k.transcriptText =
                  val("v57Transcript") || k.transcriptText || "";
                save();
              }
              var out = await oldAI.apply(this, arguments);
              setTimeout(function () {
                var kk = (state.knowledge || []).find(function (x) {
                    return String(x.id) === String(id);
                  }),
                  box = $("v56VideoSummary");
                if (kk && box) {
                  box.value = kk.videoSummary || kk.summary || box.value || "";
                  injectSingleAI(kk);
                }
              }, 700);
              return out;
            };
          }

          var rescueTasks = {
            water: ["💧", "مياه", "اشرب كوب مياه ببطء وخد 3 أنفاس."],
            move: ["💪", "حركة", "اعمل 20 سكوات أو تمشية دقيقة."],
            breath: ["😮‍💨", "تنفس", "تنفس 4-4-4 خمس مرات."],
            stretch: ["🤸", "تمدد", "افرد رقبتك وكتفك وضهرك 60 ثانية."],
            clean: ["🧹", "ترتيب", "رتب مساحة صغيرة قدامك خلال دقيقتين."],
            write: ["✍️", "تفريغ", "اكتب سبب التشتت في سطر واحد."],
            pray: ["🤲", "روحاني", "استغفار أو دعاء دقيقة بهدوء."],
            focus: ["🎯", "تركيز", "اقفل كل حاجة وافتح المهمة الحالية فقط."],
          };
          function openRescue(kind) {
            var keys = Object.keys(rescueTasks),
              key =
                kind && rescueTasks[kind]
                  ? kind
                  : keys[Math.floor(Math.random() * keys.length)],
              t = rescueTasks[key];
            var body =
              '<div class="rescue-modal-wrap"><span class="rescue-category-badge">' +
              t[0] +
              " " +
              H(t[1]) +
              '</span><div class="rescue-task-card"><div class="rescue-icon-big">' +
              t[0] +
              '</div><p class="rescue-task-text">' +
              H(t[2]) +
              '</p><p class="rescue-hint">نفّذها الآن، ثم ابدأ 15 دقيقة إنقاذ.</p></div><div class="rescue-checklist"><label class="rescue-check-item"><input type="checkbox"> أوقفت مصدر التشتيت</label><label class="rescue-check-item"><input type="checkbox"> نفذت مهمة الإنقاذ</label><label class="rescue-check-item"><input type="checkbox"> جاهز أبدأ تركيز الآن</label></div><div class="rescue-actions"><button class="btn rescue rescue-primary" data-action="startEmergencyFocus">⏱️ ابدأ إنقاذ 15 دقيقة</button><button class="btn secondary" data-action="v645AddRescueTask" data-task="' +
              H(t[2]) +
              '">+ أضفها للمهام</button><button class="btn secondary" data-action="emergencyPlan">🎲 مهمة تانية</button><div class="rescue-mini-grid">' +
              keys
                .map(function (k) {
                  var v = rescueTasks[k];
                  return (
                    '<button class="rescue-mini-btn" data-action="v645RescueKind" data-kind="' +
                    k +
                    '"><b>' +
                    v[0] +
                    "</b><span>" +
                    H(v[1]) +
                    "</span></button>"
                  );
                })
                .join("") +
              "</div></div></div>";
            if (typeof window.openModal === "function")
              window.openModal("🚨 طوارئ التشتت", body);
            else {
              var m = $("modal"),
                mb = $("modalBody"),
                mt = $("modalTitle");
              if (mt) mt.textContent = "🚨 طوارئ التشتت";
              if (mb) mb.innerHTML = body;
              if (m) m.classList.add("open");
            }
          }
          Actions.emergencyPlan = function () {
            openRescue();
          };
          Actions.v645RescueKind = function (kind, btn) {
            openRescue((btn && btn.dataset && btn.dataset.kind) || kind);
          };
          Actions.v645AddRescueTask = function (_, btn) {
            state.tasks = state.tasks || [];
            state.tasks.unshift({
              id: uid(),
              title:
                (btn && btn.dataset && btn.dataset.task) ||
                "مهمة إنقاذ من التشتت",
              project: "طوارئ التشتت",
              priority: "high",
              status: "todo",
            });
            save();
            toast("اتضافت للمهام ✅");
          };

          function cleanDOM() {
            document
              .querySelectorAll(
                ".v53-playlist-card .v644-single-thumb,.v53-playlist-card .v645-single-card-thumb",
              )
              .forEach(function (e) {
                e.remove();
              });
          }
          normalizeExisting();
          cleanDOM();
          setTimeout(function () {
            try {
              render();
            } catch (e) {}
          }, 80);
          new MutationObserver(function () {
            clearTimeout(window.__v645_clean);
            window.__v645_clean = setTimeout(cleanDOM, 120);
          }).observe(document.body, { childList: true, subtree: true });
          toast("V64.7 جاهز: صيانة جراحية للبلاي ليست والفيديو والطوارئ");
        });
      })();

      /* script section 11 */
      (function () {
        function ready(fn) {
          document.readyState === "loading"
            ? document.addEventListener("DOMContentLoaded", fn, { once: true })
            : fn();
        }
        ready(function () {
          var A = window.Actions || (window.MogahedOSX && MogahedOSX.Actions);
          if (!A || A.__v646_rescue_categories) return;
          A.__v646_rescue_categories = true;
          var state =
            window.state || (window.MogahedOSX && MogahedOSX.state) || {};
          function H(v) {
            var esc = (window.MogahedOSX && MogahedOSX.esc) || window.esc;
            return esc
              ? esc(String(v ?? ""))
              : String(v ?? "").replace(/[&<>"']/g, function (m) {
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
              name: "جسد",
              hint: "إرجاع جسمك للحضور",
              tasks: [
                "افرد ضهرك ورقبتك 60 ثانية ببطء",
                "قف وافتح صدرك وخد 5 أنفاس عميقة",
                "اغسل وشك أو اعمل وضوء وارجع",
                "ابعد الموبايل عن إيدك مترين الآن",
                "امشِ في المكان دقيقة واحدة بدون شاشة",
              ],
            },
            sport: {
              icon: "💪",
              name: "رياضة",
              hint: "طاقة سريعة للجسم",
              tasks: [
                "اعمل 10 ضغطات أو بديلها على الحائط",
                "اعمل 20 سكوات بهدوء",
                "اعمل 30 ثانية Jumping Jacks",
                "امشِ 3 دقائق بعيد عن الشاشة",
                "اعمل تمدد للكتف والرقبة دقيقة",
              ],
            },
            mind: {
              icon: "🧠",
              name: "عقل",
              hint: "إعادة وضوح التفكير",
              tasks: [
                "اكتب: ما المهمة الواحدة الآن؟",
                "اكتب سبب دخولك للموبايل في سطر",
                "حدد أول خطوة مدتها دقيقتين فقط",
                "اسأل نفسك: ما الذي أهرب منه الآن؟",
                "اكتب 3 نقاط تشغل دماغك وفرغها",
              ],
            },
            water: {
              icon: "💧",
              name: "ماء",
              hint: "تنبيه بسيط للجسم",
              tasks: [
                "اشرب كوب ماء كامل ببطء",
                "اشرب ماء وخد 5 أنفاس هادئة",
                "املأ زجاجة المياه وضعها أمامك",
                "اشرب ماء ثم اقفل مصدر التشتت فورًا",
                "اشرب ماء وقف دقيقة بدون موبايل",
              ],
            },
            psyche: {
              icon: "🌿",
              name: "نفسي",
              hint: "تهدئة بدون جلد ذات",
              tasks: [
                "قل لنفسك: أرجع بهدوء مش بعنف",
                "اكتب شعورك الحالي بكلمة واحدة",
                "خد دقيقة صمت بدون حكم على نفسك",
                "اكتب: أنا محتاج إيه الآن؟",
                "سامح نفسك وابدأ خطوة صغيرة",
              ],
            },
            soul: {
              icon: "🤲",
              name: "روح",
              hint: "رجوع قلبي سريع",
              tasks: [
                "استغفر 30 مرة بهدوء",
                "صلِّ على النبي 30 مرة",
                "ادعُ بدعاء واحد من قلبك دقيقة",
                "اقرأ آية واحدة بتدبر",
                "صلِّ ركعتين لو متاح",
              ],
            },
            order: {
              icon: "🧹",
              name: "ترتيب",
              hint: "نظافة البيئة تقلل التشتت",
              tasks: [
                "رتب مكتبك دقيقتين فقط",
                "اقفل كل التبويبات غير المهمة",
                "احذف أو اسكت 5 إشعارات مزعجة",
                "ضع كل شيء في مكانه لمدة دقيقتين",
                "اكتب أهم 3 مهام على ورقة",
              ],
            },
            execute: {
              icon: "⚡",
              name: "تنفيذ",
              hint: "أصغر فعل فورًا",
              tasks: [
                "افتح أول مهمة واشتغل 5 دقائق فقط",
                "نفذ أصغر خطوة في مشروعك الحالي",
                "اكتب رسالة واحدة مؤجلة وأرسلها",
                "ابدأ مؤقت 15 دقيقة الآن",
                "علّم على مهمة خلصتها أو حدد التالية",
              ],
            },
            screen: {
              icon: "📵",
              name: "شاشة",
              hint: "قطع مصدر السحب",
              tasks: [
                "اقفل التطبيق المشتت الآن",
                "فعّل عدم الإزعاج 30 دقيقة",
                "اقفل الفيديو الحالي بدون تفاوض",
                "سيب الموبايل بعيد 10 دقائق",
                "امسح اختصار التطبيق المشتت من الشاشة",
              ],
            },
            knowledge: {
              icon: "📚",
              name: "معرفة",
              hint: "رجوع نافع بدل استهلاك",
              tasks: [
                "افتح آخر ملخص واقرأه دقيقتين",
                "اكتب 3 سطور من آخر فيديو شفته",
                "حوّل فكرة واحدة لإجراء عملي",
                "راجع كتاب أو بودكاست 5 دقائق",
                "اكتب درس واحد خرجت به اليوم",
              ],
            },
            breath: {
              icon: "🫁",
              name: "تنفس",
              hint: "تهدئة الجهاز العصبي",
              tasks: [
                "تنفس 4-4-6 خمس مرات",
                "شهيق 4 ثواني وزفير 8 ثواني × 5",
                "ضع يدك على صدرك وتنفس دقيقة",
                "خد 10 أنفاس بطيئة بدون شاشة",
                "تنفس ثم قل: سأبدأ خطوة واحدة",
              ],
            },
            people: {
              icon: "👥",
              name: "ناس",
              hint: "كسر العزلة",
              tasks: [
                "ابعت رسالة قصيرة لشخص مهم",
                "اطلب مساعدة في شيء مأجله",
                "كلم حد دقيقتين بدل السكرول",
                "اكتب رسالة شكر لشخص",
                "اسأل نفسك: مين محتاج مني متابعة؟",
              ],
            },
          };
          var order = [
            "body",
            "sport",
            "mind",
            "water",
            "psyche",
            "soul",
            "order",
            "execute",
            "screen",
            "knowledge",
            "breath",
            "people",
          ];
          function pick(kind) {
            var key =
              kind && groups[kind]
                ? kind
                : order[Math.floor(Math.random() * order.length)];
            var g = groups[key];
            var idx = Math.floor(Math.random() * g.tasks.length);
            if (
              window.__v646LastTask === key + ":" + idx &&
              g.tasks.length > 1
            ) {
              idx = (idx + 1) % g.tasks.length;
            }
            window.__v646LastTask = key + ":" + idx;
            return { key: key, group: g, task: g.tasks[idx] };
          }
          function renderRescue(kind) {
            var x = pick(kind);
            var grid = order
              .map(function (k) {
                var g = groups[k];
                var active = k === x.key ? " active" : "";
                return (
                  '<button class="v646-rescue-cat' +
                  active +
                  '" data-action="v646RescueKind" data-kind="' +
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
              " • مهمة عشوائية</div><h2>" +
              H(x.task) +
              "</h2><p>" +
              H(x.group.hint) +
              ' — نفذها الآن ثم ارجع لمهمة واحدة فقط.</p></div><div class="rescue-checklist v646-checks"><label class="rescue-check-item"><input type="checkbox"> أوقفت مصدر التشتيت</label><label class="rescue-check-item"><input type="checkbox"> نفذت مهمة الإنقاذ</label><label class="rescue-check-item"><input type="checkbox"> جاهز أبدأ 15 دقيقة</label></div><div class="v646-actions"><button class="btn rescue rescue-primary" data-action="startEmergencyFocus">⏱️ ابدأ إنقاذ 15 دقيقة</button><button class="btn secondary" data-action="v646AddRescueTask" data-task="' +
              H(x.task) +
              '">+ أضفها للمهام</button><button class="btn secondary" data-action="emergencyPlan">🎲 عشوائي عام</button></div><h3 class="v646-title">اختر نوع الإنقاذ</h3><div class="v646-rescue-grid">' +
              grid +
              "</div></div>";
            if (typeof window.openModal === "function")
              window.openModal("🚨 طوارئ التشتت", body);
            else {
              var m = document.getElementById("modal"),
                mb = document.getElementById("modalBody"),
                mt = document.getElementById("modalTitle");
              if (mt) mt.textContent = "🚨 طوارئ التشتت";
              if (mb) mb.innerHTML = body;
              if (m) m.classList.add("open");
            }
          }
          A.emergencyPlan = function () {
            renderRescue();
          };
          A.v646RescueKind = function (kind, btn) {
            var k = (btn && btn.dataset && btn.dataset.kind) || kind;
            renderRescue(k);
          };
          A.v646AddRescueTask = function (_, btn) {
            state.tasks = state.tasks || [];
            state.tasks.unshift({
              id: uid(),
              title:
                (btn && btn.dataset && btn.dataset.task) ||
                "مهمة إنقاذ من التشتت",
              project: "🚨 طوارئ التشتت",
              priority: "high",
              status: "todo",
            });
            save();
            toast("اتضافت للمهام ✅");
          };
        });
      })();

      /* script section 12 */
      (function () {
        "use strict";
        function ready(cb, tries) {
          tries = tries || 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb();
            return;
          }
          if (tries < 120)
            setTimeout(function () {
              ready(cb, tries + 1);
            }, 50);
        }
        ready(function () {
          const api = window.MogahedOSX;
          const state = api.state,
            Actions = api.Actions,
            save = api.save,
            toast = api.toast,
            esc =
              api.esc ||
              function (v) {
                return String(v || "").replace(/[&<>"']/g, function (m) {
                  return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  }[m];
                });
              };
          if (!state || !Actions) return;

          if (!document.getElementById("v647SingleAIStyle")) {
            const style = document.createElement("style");
            style.id = "v647SingleAIStyle";
            style.textContent = `
        .v647-single-ai-panel{margin-top:12px;padding:14px;border-radius:22px;border:1px solid rgba(139,92,246,.24);background:linear-gradient(135deg,rgba(139,92,246,.13),rgba(236,72,153,.06));display:grid;gap:10px}
        .v647-single-ai-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}.v647-single-ai-head h3{margin:0!important}.v647-single-ai-head .pill{white-space:nowrap}
        .v647-single-ai-panel textarea{min-height:118px!important}.v647-single-ai-primary{width:100%;min-height:56px!important;border-radius:19px!important;font-size:15px!important;background:linear-gradient(135deg,#7c3aed,#ec4899)!important;box-shadow:0 18px 44px rgba(139,92,246,.30)!important}
        .v647-single-ai-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v647-single-ai-actions .btn{width:100%;white-space:normal!important;min-height:44px!important}
        .v647-single-ai-note{padding:10px 12px;border-radius:16px;background:rgba(59,130,246,.08);border:1px solid rgba(59,130,246,.18);color:#bfdbfe;line-height:1.7;font-size:12px}
        @media(max-width:520px){.v647-single-ai-actions{grid-template-columns:1fr}.v647-single-ai-primary{min-height:52px!important;font-size:14px!important}}
      `;
            document.head.appendChild(style);
          }

          function isSingleVideo(k) {
            const t = String((k && k.type) || "");
            return (
              !!k &&
              !k.isPlaylistItem &&
              (t.includes("فيديو") ||
                t.toLowerCase().includes("video") ||
                String(k.mediaType || "")
                  .toLowerCase()
                  .includes("youtube"))
            );
          }
          function findOpenVideo() {
            const modal = document.getElementById("modal");
            if (!modal || !modal.classList.contains("open")) return null;
            const title =
              (
                modal.querySelector(
                  ".player-title h3,.player-head h3,.modal-box h3",
                ) || {}
              ).textContent || "";
            return (
              (state.knowledge || []).find(
                (k) =>
                  isSingleVideo(k) &&
                  title &&
                  String(title)
                    .trim()
                    .includes(
                      String(k.title || "")
                        .trim()
                        .slice(0, 18),
                    ),
              ) || null
            );
          }
          function aiPanel(k) {
            return `<div id="v647SingleAIPanel" class="v647-single-ai-panel">
        <div class="v647-single-ai-head"><h3>🤖 تلخيص الذكاء الاصطناعي للفيديو</h3><span class="pill">فيديو منفرد</span></div>
        <label>ملخص الفيديو</label>
        <textarea id="v56VideoSummary" placeholder="هنا يظهر ملخص AI أو اكتب ملخصك يدويًا...">${esc(k.videoSummary || "")}</textarea>
        <label>Transcript / نص الفيديو</label>
        <textarea id="v57Transcript" placeholder="الصق Transcript هنا، أو اضغط جلب Transcript تلقائيًا لو متاح. بدون النص سيعتمد AI على العنوان والملاحظات فقط.">${esc(k.transcriptText || "")}</textarea>
        <button class="btn v647-single-ai-primary" data-action="generateAISummary" data-id="${esc(k.id)}">✨ تلخيص شامل بالذكاء الاصطناعي</button>
        <div class="v647-single-ai-actions">
          <button class="btn secondary" data-action="fetchVideoTranscript" data-id="${esc(k.id)}">📥 جلب Transcript تلقائيًا</button>
          <button class="btn secondary" data-action="saveVideoTranscript" data-id="${esc(k.id)}">📄 حفظ النص</button>
          <button class="btn secondary" data-action="saveVideoSummary" data-id="${esc(k.id)}">💾 حفظ الملخص</button>
          <button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button>
        </div>
        <div class="v647-single-ai-note">نفس فكرة ملخص الـ Playlist: ملخص، أفكار، اقتباسات، تطبيق عملي، وأسئلة مراجعة. لو فشل جلب النص، الصق Transcript يدويًا ثم اضغط التلخيص.</div>
      </div>`;
          }
          function injectSingleAI(id) {
            const k =
              (state.knowledge || []).find((x) => x.id === id) ||
              findOpenVideo();
            if (!isSingleVideo(k)) return;
            const modal = document.getElementById("modal");
            if (!modal || !modal.classList.contains("open")) return;
            if (document.getElementById("v647SingleAIPanel")) return;
            if (
              document.getElementById("v57Transcript") &&
              document.getElementById("v56VideoSummary")
            )
              return;
            const side = modal.querySelector(
              ".player-side,.v634-video-side,.modal-box",
            );
            if (!side) return;
            side.insertAdjacentHTML("beforeend", aiPanel(k));
          }

          const oldOpen = Actions.openKnowledgePlayer;
          if (oldOpen && !Actions.openKnowledgePlayer.__v647Patched) {
            Actions.openKnowledgePlayer = function (id, btn) {
              const res = oldOpen.apply(this, arguments);
              setTimeout(function () {
                injectSingleAI(id);
              }, 300);
              setTimeout(function () {
                injectSingleAI(id);
              }, 900);
              return res;
            };
            Actions.openKnowledgePlayer.__v647Patched = true;
          }

          if (!Actions.saveVideoSummary.__v647Safe) {
            const oldSaveSummary = Actions.saveVideoSummary;
            Actions.saveVideoSummary = function (id) {
              const k = (state.knowledge || []).find((x) => x.id === id);
              if (!k) return;
              const el = document.getElementById("v56VideoSummary");
              if (el) {
                k.videoSummary = (el.value || "").trim();
                save();
                toast("تم حفظ ملخص الفيديو");
                return;
              }
              if (oldSaveSummary) return oldSaveSummary.apply(this, arguments);
            };
            Actions.saveVideoSummary.__v647Safe = true;
          }
          if (!Actions.saveVideoTranscript.__v647Safe) {
            const oldSaveTranscript = Actions.saveVideoTranscript;
            Actions.saveVideoTranscript = function (id) {
              const k = (state.knowledge || []).find((x) => x.id === id);
              if (!k) return;
              const el = document.getElementById("v57Transcript");
              if (el) {
                k.transcriptText = (el.value || "").trim();
                save();
                toast("تم حفظ نص الفيديو");
                return;
              }
              if (oldSaveTranscript)
                return oldSaveTranscript.apply(this, arguments);
            };
            Actions.saveVideoTranscript.__v647Safe = true;
          }

          const obs = new MutationObserver(function () {
            if (document.getElementById("modal")?.classList.contains("open"))
              setTimeout(function () {
                injectSingleAI();
              }, 120);
          });
          obs.observe(document.body, { childList: true, subtree: true });
          toast("V64.7 جاهز: ملخص AI للفيديوهات المنفردة");
        });
      })();

      /* script section 13 */
      (function () {
        "use strict";
        function wait(cb, n) {
          n = n || 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb();
            return;
          }
          if (n < 160)
            setTimeout(function () {
              wait(cb, n + 1);
            }, 50);
        }
        wait(function () {
          var api = window.MogahedOSX,
            state = api.state,
            Actions = api.Actions,
            save = api.save,
            toast = api.toast || function () {},
            render = api.render || window.render;
          var esc =
            api.esc ||
            function (v) {
              return String(v || "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
            };
          function byId(id) {
            return document.getElementById(id);
          }
          function getK(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function isSingleVideo(k) {
            if (!k) return false;
            if (
              k.isPlaylist ||
              k.kind === "playlist" ||
              Array.isArray(k.playlistItems)
            )
              return false;
            var t = String(k.type || "").toLowerCase(),
              mt = String(k.mediaType || "").toLowerCase(),
              url = String(k.mediaUrl || k.link || "").toLowerCase();
            return (
              !k.isPlaylistContainer &&
              !k.playlistContainer &&
              (t.indexOf("video") > -1 ||
                t.indexOf("فيديو") > -1 ||
                mt.indexOf("youtube") > -1 ||
                mt.indexOf("mp4") > -1 ||
                /youtube\.com\/watch|youtu\.be\//.test(url))
            );
          }
          function visibleOpenId() {
            var m = byId("modal");
            if (!m || !m.classList.contains("open")) return "";
            var btn = m.querySelector(
              '[data-action="saveVideoProgress"][data-id], [data-action="completeVideoItem"][data-id], [data-action="playerToAction"][data-id]',
            );
            if (btn && btn.dataset.id) return btn.dataset.id;
            var title =
              (
                m.querySelector(
                  ".player-title h3,.player-head h3,.modal-box h3",
                ) || {}
              ).textContent || "";
            var found = (state.knowledge || []).find(function (k) {
              return (
                isSingleVideo(k) &&
                title &&
                String(title)
                  .trim()
                  .indexOf(
                    String(k.title || "")
                      .trim()
                      .slice(0, 20),
                  ) > -1
              );
            });
            return found ? found.id : "";
          }
          function pullFields(k) {
            if (!k) return;
            var sum = byId("v56VideoSummary"),
              tr = byId("v57Transcript"),
              ideas = byId("v648AiIdeas"),
              app = byId("v648AiApp"),
              tasks = byId("v648AiTasks");
            if (sum) k.videoSummary = k.summary = (sum.value || "").trim();
            if (tr) k.transcriptText = (tr.value || "").trim();
            if (ideas) k.ideas = (ideas.value || "").trim();
            if (app) k.application = k.actionTaken = (app.value || "").trim();
            if (tasks) k.extractedTasks = (tasks.value || "").trim();
          }
          function removeOldSinglePanels() {
            document
              .querySelectorAll(
                "#v644_single_ai,#v645_single_ai,#v647SingleAIPanel,#v648SingleAIWorkspace",
              )
              .forEach(function (el) {
                el.remove();
              });
            var ids = ["v56VideoSummary", "v57Transcript"];
            ids.forEach(function (id) {
              var els = [].slice.call(document.querySelectorAll("#" + id));
              els.slice(1).forEach(function (el) {
                el.remove();
              });
            });
          }
          function panel(k) {
            return (
              '<div id="v648SingleAIWorkspace" class="v648-ai-workspace">' +
              '<div class="v648-ai-head"><div><h3>🤖 ملخص الذكاء الاصطناعي</h3><p>نفس نظام البلاي ليست للفيديو المنفرد: نص الفيديو → ملخص → أفكار → تطبيق عملي → مهام.</p></div><span class="pill">فيديو منفرد</span></div>' +
              '<div class="v648-ai-box"><label>ملخص شامل</label><textarea id="v56VideoSummary" placeholder="اضغط توليد الملخص أو اكتب ملخصك هنا...">' +
              esc(k.videoSummary || k.summary || "") +
              "</textarea></div>" +
              '<div class="v648-ai-box"><label>Transcript / نص الفيديو</label><textarea id="v57Transcript" placeholder="الصق نص الفيديو هنا. لو مفيش نص، اضغط التلخيص وسيعتمد على العنوان والملاحظات المتاحة.">' +
              esc(k.transcriptText || "") +
              "</textarea></div>" +
              '<button class="btn v648-ai-main" data-action="generateAISummary" data-id="' +
              esc(k.id) +
              '">✨ توليد ملخص AI للفيديو</button>' +
              '<div class="v648-ai-actions"><button class="btn secondary" data-action="fetchVideoTranscript" data-id="' +
              esc(k.id) +
              '">📥 جلب Transcript</button><button class="btn secondary" data-action="v648SaveSingleVideoAI" data-id="' +
              esc(k.id) +
              '">💾 حفظ الملخص والنص</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button><button class="btn secondary" data-action="playerToAction" data-id="' +
              esc(k.id) +
              '">✅ حوّل لإجراء</button></div>' +
              '<div class="v648-ai-grid"><div class="v648-ai-mini"><label>أهم الأفكار</label><textarea id="v648AiIdeas" placeholder="أهم الأفكار من الفيديو...">' +
              esc(k.ideas || "") +
              '</textarea></div><div class="v648-ai-mini"><label>التطبيق العملي</label><textarea id="v648AiApp" placeholder="ماذا ستطبق بعد الفيديو؟">' +
              esc(k.application || k.actionTaken || "") +
              "</textarea></div></div>" +
              '<div class="v648-ai-mini"><label>المهام المستخرجة</label><textarea id="v648AiTasks" placeholder="مثال: 1) أراجع الفكرة... 2) أطبق الخطوة...">' +
              esc(k.extractedTasks || "") +
              "</textarea></div>" +
              '<div class="v648-ai-note">مكانها هنا داخل شاشة تشغيل الفيديو المنفرد، تحت الملاحظات والتقدم مباشرة. لن تظهر داخل البلاي ليست ولن تسحب صورة البلاي ليست.</div>' +
              "</div>"
            );
          }
          function inject(id) {
            id = id || visibleOpenId();
            var k = getK(id);
            if (!isSingleVideo(k)) return;
            var m = byId("modal");
            if (!m || !m.classList.contains("open")) return;
            removeOldSinglePanels();
            var side = m.querySelector(".player-side");
            if (!side) side = m.querySelector(".modal-box");
            if (!side) return;
            var anchor = side.querySelector(".player-note-area");
            if (anchor) anchor.insertAdjacentHTML("afterend", panel(k));
            else side.insertAdjacentHTML("beforeend", panel(k));
          }
          var oldOpen = Actions.openKnowledgePlayer;
          if (oldOpen && !Actions.openKnowledgePlayer.__v648VisibleAI) {
            Actions.openKnowledgePlayer = function (id) {
              var res = oldOpen.apply(this, arguments);
              setTimeout(function () {
                inject(id);
              }, 180);
              setTimeout(function () {
                inject(id);
              }, 650);
              setTimeout(function () {
                inject(id);
              }, 1200);
              return res;
            };
            Actions.openKnowledgePlayer.__v648VisibleAI = true;
          }
          Actions.v648SaveSingleVideoAI = function (id) {
            var k = getK(id || visibleOpenId());
            if (!k) return;
            pullFields(k);
            save();
            if (render) {
            }
            toast("تم حفظ ملخص الفيديو المنفرد ✅");
          };
          var oldSaveProg = Actions.saveVideoProgress;
          if (oldSaveProg && !Actions.saveVideoProgress.__v648PullAI) {
            Actions.saveVideoProgress = function (id) {
              var k = getK(id);
              if (k) pullFields(k);
              var r = oldSaveProg.apply(this, arguments);
              save();
              return r;
            };
            Actions.saveVideoProgress.__v648PullAI = true;
          }
          var oldGen = Actions.generateAISummary;
          if (oldGen && !Actions.generateAISummary.__v648VisibleAI) {
            Actions.generateAISummary = async function (id) {
              var k = getK(id || visibleOpenId());
              if (k) {
                pullFields(k);
                save();
              }
              var out = await oldGen.apply(this, arguments);
              setTimeout(function () {
                var kk = getK(id || visibleOpenId());
                if (!kk) return;
                var sum = byId("v56VideoSummary");
                if (sum)
                  sum.value = kk.videoSummary || kk.summary || sum.value || "";
                var tr = byId("v57Transcript");
                if (tr) tr.value = kk.transcriptText || tr.value || "";
                var ideas = byId("v648AiIdeas");
                if (ideas) ideas.value = kk.ideas || ideas.value || "";
                var app = byId("v648AiApp");
                if (app)
                  app.value =
                    kk.application || kk.actionTaken || app.value || "";
                inject(kk.id);
              }, 900);
              return out;
            };
            Actions.generateAISummary.__v648VisibleAI = true;
          }
          new MutationObserver(function () {
            clearTimeout(window.__v648_ai_t);
            window.__v648_ai_t = setTimeout(function () {
              var id = visibleOpenId();
              if (id) inject(id);
            }, 220);
          }).observe(document.body, { childList: true, subtree: true });
          toast("V64.8: ملخص AI ظاهر داخل الفيديو المنفرد ✅");
        });
      })();

      /* script section 14 */
      (function () {
        "use strict";
        function wait(cb, n) {
          n = n || 0;
          if (
            window.MogahedOSX &&
            window.MogahedOSX.state &&
            window.MogahedOSX.Actions
          ) {
            cb();
            return;
          }
          if (n < 200)
            setTimeout(function () {
              wait(cb, n + 1);
            }, 50);
        }
        wait(function () {
          var api = window.MogahedOSX,
            state = api.state,
            Actions = api.Actions,
            save = api.save || function () {},
            toast = api.toast || function () {},
            render = api.render || window.render;
          var E =
            api.esc ||
            function (v) {
              return String(v || "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
            };
          function $(id) {
            return document.getElementById(id);
          }
          function getK(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function isPlaylist(k) {
            return !!(
              k &&
              (k.isPlaylist ||
                k.kind === "playlist" ||
                k.playlistContainer ||
                k.isPlaylistContainer ||
                Array.isArray(k.playlistItems) ||
                String(k.type || "").includes("قوائم"))
            );
          }
          function isVideo(k) {
            var s = String(
              (k &&
                k.type +
                  " " +
                  k.mediaType +
                  " " +
                  (k.mediaUrl || k.link || k.url)) ||
                "",
            ).toLowerCase();
            return (
              !!k &&
              !isPlaylist(k) &&
              (/video|فيديو|youtube|youtu\.be|mp4|يوتيوب/.test(s) ||
                k.mediaData)
            );
          }
          function currentModalVideoId() {
            var m = $("modal");
            if (!m || !m.classList.contains("open")) return "";
            var btn = m.querySelector(
              '[data-action="v642SaveAll"][data-id],[data-action="v638SaveDetails"][data-id],[data-action="v637SaveDetails"][data-id],[data-action="v636SaveProgress"][data-id],[data-action="completeVideoItem"][data-id],[data-action="v642Complete"][data-id],[data-action="v638Complete"][data-id]',
            );
            if (btn && isVideo(getK(btn.dataset.id))) return btn.dataset.id;
            var title =
              (
                m.querySelector(
                  ".v638-player-head h3,.player-title h3,.player-head h3,#modalTitle",
                ) || {}
              ).textContent || "";
            var found = (state.knowledge || []).find(function (k) {
              return (
                isVideo(k) &&
                String(title)
                  .trim()
                  .includes(
                    String(k.title || "")
                      .trim()
                      .slice(0, 16),
                  )
              );
            });
            return found ? found.id : "";
          }
          function readExisting(k) {
            var v = function (id) {
              var el = $(id);
              return el ? el.value : "";
            };
            return {
              notes:
                v("v637_note_text") ||
                v("v638_note_text") ||
                v("v56NoteText") ||
                "",
              summary:
                v("v642_summary") ||
                v("v638_summary") ||
                v("v637_summary") ||
                v("v56VideoSummary") ||
                k.videoSummary ||
                k.summary ||
                "",
              ideas:
                v("v642_ideas") ||
                v("v638_ideas") ||
                v("v637_ideas") ||
                k.ideas ||
                "",
              app:
                v("v642_action") ||
                v("v638_action") ||
                v("v637_action") ||
                k.actionTaken ||
                k.application ||
                "",
              lesson:
                v("v642_lesson") ||
                v("v638_lesson") ||
                v("v637_lesson") ||
                k.lessonLearned ||
                "",
              transcript: v("v65Transcript") || k.transcriptText || "",
            };
          }
          function panel(k) {
            var r = readExisting(k);
            return (
              '<div class="v638-acc v65-ai-acc open" id="v65SingleVideoAI"><button type="button" class="v638-head"><div><b>✨ ملخص الذكاء الاصطناعي</b><small>ظاهر للفيديو المنفرد — زي البلاي ليست بالظبط</small></div><i>⌄</i></button><div class="v638-body">' +
              '<span class="v65-player-chip">🎥 فيديو منفرد</span>' +
              '<label>Transcript / نص الفيديو</label><textarea id="v65Transcript" placeholder="الصق نص الفيديو هنا. لو مش متاح، اضغط توليد وسيعمل ملخص مبدئي من العنوان والملاحظات.">' +
              E(r.transcript) +
              "</textarea>" +
              '<div class="v65-ai-actions"><button class="btn v65-ai-main" data-action="v65GenerateSingleAI" data-id="' +
              E(k.id) +
              '">✨ توليد ملخص AI</button><button class="btn secondary" data-action="v65SaveSingleAI" data-id="' +
              E(k.id) +
              '">💾 حفظ الكل</button></div>' +
              '<label>ملخص شامل</label><textarea id="v65Summary" placeholder="سيظهر هنا الملخص الشامل...">' +
              E(r.summary) +
              "</textarea>" +
              '<div class="v65-ai-grid"><div><label>💡 أهم الأفكار</label><textarea id="v65Ideas" placeholder="أهم الأفكار...">' +
              E(r.ideas) +
              '</textarea></div><div><label>✅ التطبيق العملي</label><textarea id="v65Action" placeholder="ماذا ستنفذ؟">' +
              E(r.app) +
              "</textarea></div></div>" +
              '<div class="v65-ai-grid"><div><label>📋 المهام المستخرجة</label><textarea id="v65Tasks" placeholder="مهام عملية بعد الفيديو...">' +
              E(k.extractedTasks || "") +
              '</textarea></div><div><label>🧠 الدرس / أسئلة مراجعة</label><textarea id="v65Lesson" placeholder="درس أو أسئلة للمراجعة...">' +
              E(r.lesson) +
              "</textarea></div></div>" +
              '<div class="row"><button class="btn secondary" data-action="fetchVideoTranscript" data-id="' +
              E(k.id) +
              '">📥 جلب Transcript لو متاح</button><button class="btn secondary" data-action="playerToAction" data-id="' +
              E(k.id) +
              '">حوّل لإجراء</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div>' +
              '<div class="v65-ai-hint">القسم ده محفوظ داخل الفيديو نفسه، ومش له علاقة بصورة أو بيانات البلاي ليست. لو YouTube منع النص، الصقه يدويًا ثم اضغط توليد.</div>' +
              "</div></div>"
            );
          }
          function syncToOldFields() {
            var map = [
              [
                "v65Summary",
                [
                  "v642_summary",
                  "v638_summary",
                  "v637_summary",
                  "v56VideoSummary",
                ],
              ],
              ["v65Ideas", ["v642_ideas", "v638_ideas", "v637_ideas"]],
              ["v65Action", ["v642_action", "v638_action", "v637_action"]],
              ["v65Lesson", ["v642_lesson", "v638_lesson", "v637_lesson"]],
            ];
            map.forEach(function (pair) {
              var src = $(pair[0]);
              if (!src) return;
              pair[1].forEach(function (id) {
                var el = $(id);
                if (el) el.value = src.value;
              });
            });
          }
          function inject() {
            var id = currentModalVideoId(),
              k = getK(id);
            if (!isVideo(k)) return;
            var m = $("modal");
            if (!m || !m.classList.contains("open")) return;
            var existing = $("v65SingleVideoAI");
            if (existing && existing.dataset.id === String(id)) return;
            if (existing) existing.remove();
            var side = m.querySelector(".v638-side,.player-side,#modalBody");
            if (!side) return;
            var details = [].slice
              .call(
                side.querySelectorAll(".v638-acc,.v637-acc,.v636-accordion"),
              )
              .find(function (x) {
                return /تفاصيل|ملخص/.test(x.textContent || "");
              });
            if (details) details.insertAdjacentHTML("afterend", panel(k));
            else side.insertAdjacentHTML("beforeend", panel(k));
            var p = $("v65SingleVideoAI");
            if (p) p.dataset.id = String(id);
          }
          function saveAI(id) {
            var k = getK(id || currentModalVideoId());
            if (!k) return;
            var val = function (id) {
              var el = $(id);
              return el ? el.value.trim() : "";
            };
            k.transcriptText = val("v65Transcript") || k.transcriptText || "";
            k.videoSummary = k.summary =
              val("v65Summary") || k.videoSummary || k.summary || "";
            k.ideas = val("v65Ideas") || k.ideas || "";
            k.actionTaken = k.application =
              val("v65Action") || k.actionTaken || k.application || "";
            k.extractedTasks = val("v65Tasks") || k.extractedTasks || "";
            k.lessonLearned = val("v65Lesson") || k.lessonLearned || "";
            syncToOldFields();
            save();
            toast("تم حفظ ملخص AI للفيديو ✅");
          }
          Actions.v65SaveSingleAI = function (id) {
            saveAI(id);
          };
          Actions.v65GenerateSingleAI = function (id) {
            var k = getK(id || currentModalVideoId());
            if (!k) return;
            var r = readExisting(k);
            var tr = ($("v65Transcript")?.value || r.transcript || "").trim();
            var base = (tr || r.summary || r.notes || k.title || "").trim();
            var title = k.title || "الفيديو";
            var summary = tr
              ? 'ملخص شامل لـ "' +
                title +
                '":\n\n' +
                base.split(/\n+/).slice(0, 8).join("\n").slice(0, 1400)
              : 'ملخص مبدئي لـ "' +
                title +
                '" اعتمادًا على العنوان والملاحظات المتاحة. الصق Transcript للحصول على ملخص أدق.';
            var ideas =
              r.ideas ||
              "1) استخرج الفكرة المركزية من الفيديو.\n2) حدد نقطة واحدة تحتاج مراجعة.\n3) اربط الفكرة بسلوك عملي اليوم.";
            var action =
              r.app ||
              "طبّق فكرة واحدة من الفيديو خلال 15 دقيقة، ثم اكتب النتيجة هنا.";
            var tasks =
              k.extractedTasks ||
              "□ اكتب 3 فوائد من الفيديو\n□ حدد إجراء واحد قابل للتنفيذ\n□ راجع الملخص بعد 24 ساعة";
            var lesson =
              r.lesson ||
              "سؤال مراجعة: ما الفكرة التي لو طبقتها اليوم ستغير سلوكك؟";
            if ($("v65Summary")) $("v65Summary").value = summary;
            if ($("v65Ideas")) $("v65Ideas").value = ideas;
            if ($("v65Action")) $("v65Action").value = action;
            if ($("v65Tasks")) $("v65Tasks").value = tasks;
            if ($("v65Lesson")) $("v65Lesson").value = lesson;
            saveAI(k.id);
            if (
              Actions.generateAISummary &&
              !Actions.generateAISummary.__v65Avoid
            ) {
              try {
                Actions.generateAISummary.__v65Avoid = true;
                setTimeout(function () {
                  Actions.generateAISummary.__v65Avoid = false;
                }, 1000);
              } catch (e) {}
            }
            toast("تم توليد ملخص للفيديو المنفرد ✨");
          };
          var oldFetch = Actions.fetchVideoTranscript;
          Actions.fetchVideoTranscript = function (id, btn) {
            var r = oldFetch ? oldFetch.apply(this, arguments) : undefined;
            setTimeout(function () {
              var k = getK(id || currentModalVideoId());
              if (k && $("v65Transcript") && !$("v65Transcript").value)
                $("v65Transcript").value = k.transcriptText || "";
              if (!$("v65Transcript")?.value)
                toast("لو لم يظهر النص، الصقه يدويًا في خانة Transcript");
            }, 600);
            return r;
          };
          var saveNames = [
            "v642SaveAll",
            "v638SaveDetails",
            "v637SaveDetails",
            "v636SaveProgress",
            "savePlayerNotes",
            "saveVideoSummary",
          ];
          saveNames.forEach(function (n) {
            var old = Actions[n];
            if (old && !old.__v65Wrapped) {
              Actions[n] = function (id, btn) {
                var vid = currentModalVideoId();
                if (vid && $("v65SingleVideoAI")) saveAI(vid);
                return old.apply(this, arguments);
              };
              Actions[n].__v65Wrapped = true;
            }
          });
          new MutationObserver(function () {
            clearTimeout(window.__v65VideoAI);
            window.__v65VideoAI = setTimeout(inject, 160);
          }).observe(document.body, { childList: true, subtree: true });
          document.addEventListener(
            "input",
            function (e) {
              if (
                e.target &&
                /^v65(Summary|Ideas|Action|Lesson)$/.test(e.target.id)
              )
                syncToOldFields();
            },
            true,
          );
          setTimeout(inject, 500);
          toast("V65: شاشة الفيديو المنفرد اتربط فيها ملخص AI بوضوح ✅");
        });
      })();

      /* script section 15 */
      /* ===== V65.5 Books & Podcasts AI — Summarize single YouTube videos inside the app ===== */
      (function () {
        function wait(fn) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            window.MogahedOSX.state
          ) {
            fn();
          } else
            setTimeout(function () {
              wait(fn);
            }, 120);
        }
        wait(function () {
          var api = window.MogahedOSX;
          var state = api.state,
            Actions = api.Actions,
            save = api.save || function () {},
            toast = api.toast || function () {},
            render = api.render || function () {};
          var E =
            api.esc ||
            function (v) {
              return String(v || "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
            };
          function $(id) {
            return document.getElementById(id);
          }
          function val(id) {
            var el = $(id);
            return el ? String(el.value || "").trim() : "";
          }
          function setVal(id, v) {
            var el = $(id);
            if (el) el.value = String(v || "");
          }
          function getK(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function isPlaylist(k) {
            return !!(
              k &&
              (k.isPlaylist ||
                k.kind === "playlist" ||
                k.playlistContainer ||
                k.isPlaylistContainer ||
                Array.isArray(k.playlistItems) ||
                String(k.type || "").includes("قوائم"))
            );
          }
          function isVideo(k) {
            var s = String(
              (k &&
                k.type +
                  " " +
                  k.mediaType +
                  " " +
                  (k.mediaUrl || k.link || k.url)) ||
                "",
            ).toLowerCase();
            return (
              !!k &&
              !isPlaylist(k) &&
              (/video|فيديو|youtube|youtu\.be|mp4|يوتيوب/.test(s) ||
                k.mediaData)
            );
          }
          function videoUrl(k) {
            return k
              ? k.mediaUrl || k.link || k.url || k.videoUrl || k.src || ""
              : "";
          }
          function currentModalVideoId() {
            var m = $("modal");
            if (!m || !m.classList.contains("open")) return "";
            var btn = m.querySelector("[data-action][data-id]");
            if (btn && isVideo(getK(btn.dataset.id))) return btn.dataset.id;
            var title =
              (
                m.querySelector(
                  ".v638-player-head h3,.player-title h3,.player-head h3,#modalTitle",
                ) || {}
              ).textContent || "";
            var found = (state.knowledge || []).find(function (k) {
              return (
                isVideo(k) &&
                String(title)
                  .trim()
                  .includes(
                    String(k.title || "")
                      .trim()
                      .slice(0, 16),
                  )
              );
            });
            return found ? found.id : "";
          }
          function ai() {
            state.settings = state.settings || {};
            state.settings.ai = state.settings.ai || {};
            return state.settings.ai;
          }
          function providerName() {
            return (ai().provider || "claude") === "gemini"
              ? "Gemini"
              : "Claude";
          }
          function youtubeId(url) {
            url = String(url || "");
            var m = url.match(
              /(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{6,})/,
            );
            return m ? m[1] : "";
          }
          function notesFor(k) {
            return (
              (k.timedNotes || [])
                .map(function (n) {
                  return "- " + (n.text || "");
                })
                .join("\n") ||
              k.notes ||
              k.note ||
              ""
            );
          }
          function buildPrompt(k, transcript, url, directVideo) {
            return (
              "أنت مساعد عربي داخل Mogahed OS. المطلوب تلخيص فيديو منفرد داخل المشروع بدون مطالبة المستخدم بنسخ برومبت.\n\n" +
              "حلل الفيديو بدقة قدر الإمكان. إذا كان الفيديو متاحًا لك مباشرة عبر الرابط/الملف فاعتمد على محتواه. وإذا وُجد Transcript فاعتمد عليه.\n\n" +
              "بيانات الفيديو:\n" +
              "العنوان: " +
              (k.title || "") +
              "\n" +
              "المصدر/القناة: " +
              (k.author || k.channel || "") +
              "\n" +
              "الرابط: " +
              (url || "") +
              "\n" +
              "المدة التقريبية بالدقائق: " +
              (k.totalUnits || k.totalMinutes || "") +
              "\n\n" +
              "ملاحظات المستخدم الحالية:\n" +
              (notesFor(k) || "لا توجد") +
              "\n\n" +
              "Transcript إن وجد:\n" +
              (transcript || "غير متاح") +
              "\n\n" +
              "أخرج النتيجة JSON فقط بدون Markdown بهذا الشكل:\n" +
              '{"summary":"ملخص شامل واضح","ideas":"أهم الأفكار في نقاط","action":"تطبيق عملي محدد","tasks":"مهام قابلة للتنفيذ","lesson":"أسئلة مراجعة/درس مستفاد","quotes":"اقتباسات مهمة إن ظهرت"}\n\n' +
              "مهم: لا تقل للمستخدم انسخ البرومبت. لا تذكر قيودك إلا لو لم تستطع الوصول لأي محتوى نهائيًا."
            );
          }
          async function claudeText(prompt) {
            var a = ai();
            if (!a.anthropicKey)
              throw new Error("ضع Claude API Key من الإعدادات أولًا");
            var r = await fetch("https://api.anthropic.com/v1/messages", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "x-api-key": a.anthropicKey,
                "anthropic-version": "2023-06-01",
                "anthropic-dangerous-direct-browser-access": "true",
              },
              body: JSON.stringify({
                model: a.anthropicModel || "claude-sonnet-4-6",
                max_tokens: 2600,
                temperature: 0.25,
                messages: [{ role: "user", content: prompt }],
              }),
            });
            var data = await r.json().catch(function () {
              return {};
            });
            if (!r.ok)
              throw new Error(
                (data.error && data.error.message) ||
                  data.message ||
                  "Claude HTTP " + r.status,
              );
            return (data.content || [])
              .map(function (p) {
                return p.text || "";
              })
              .join("\n")
              .trim();
          }
          async function geminiText(prompt) {
            var a = ai();
            if (!a.geminiKey)
              throw new Error("ضع Gemini API Key من الإعدادات أولًا");
            var model = a.geminiModel || a.model || "gemini-2.0-flash";
            var url =
              "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) +
              ":generateContent?key=" +
              encodeURIComponent(a.geminiKey);
            var r = await fetch(url, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 2600,
                  responseMimeType: "application/json",
                },
              }),
            });
            var data = await r.json().catch(function () {
              return {};
            });
            if (!r.ok)
              throw new Error(
                (data.error && data.error.message) || "Gemini HTTP " + r.status,
              );
            return (
              (((data.candidates || [])[0] || {}).content || {}).parts
                ?.map(function (p) {
                  return p.text || "";
                })
                .join("\n")
                .trim() || ""
            );
          }
          async function geminiYouTube(prompt, ytUrl) {
            var a = ai();
            if (!a.geminiKey)
              throw new Error("ضع Gemini API Key من الإعدادات أولًا");
            var model = a.geminiModel || a.model || "gemini-2.0-flash";
            var endpoint =
              "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) +
              ":generateContent?key=" +
              encodeURIComponent(a.geminiKey);
            var bodies = [
              {
                contents: [
                  {
                    parts: [
                      { file_data: { mime_type: "video/*", file_uri: ytUrl } },
                      { text: prompt },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 3000,
                  responseMimeType: "application/json",
                },
              },
              {
                contents: [
                  {
                    parts: [
                      { fileData: { mimeType: "video/*", fileUri: ytUrl } },
                      { text: prompt },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 3000,
                  responseMimeType: "application/json",
                },
              },
              {
                contents: [
                  {
                    parts: [
                      {
                        file_data: {
                          mime_type: "video/youtube",
                          file_uri: ytUrl,
                        },
                      },
                      { text: prompt },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 3000,
                  responseMimeType: "application/json",
                },
              },
            ];
            var lastErr = "";
            for (var i = 0; i < bodies.length; i++) {
              try {
                var r = await fetch(endpoint, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(bodies[i]),
                });
                var data = await r.json().catch(function () {
                  return {};
                });
                if (!r.ok) {
                  lastErr =
                    (data.error && data.error.message) ||
                    "Gemini HTTP " + r.status;
                  continue;
                }
                var txt =
                  (((data.candidates || [])[0] || {}).content || {}).parts
                    ?.map(function (p) {
                      return p.text || "";
                    })
                    .join("\n")
                    .trim() || "";
                if (txt) return txt;
              } catch (e) {
                lastErr = e.message || String(e);
              }
            }
            throw new Error(lastErr || "لم يستطع Gemini قراءة رابط الفيديو");
          }
          function parseAI(raw) {
            raw = String(raw || "").trim();
            var json = raw;
            var m =
              raw.match(/```json([\s\S]*?)```/i) ||
              raw.match(/```([\s\S]*?)```/);
            if (m) json = m[1].trim();
            var b = json.indexOf("{"),
              e = json.lastIndexOf("}");
            if (b >= 0 && e > b) json = json.slice(b, e + 1);
            try {
              return JSON.parse(json);
            } catch (err) {
              return {
                summary: raw,
                ideas: "",
                action: "",
                tasks: "",
                lesson: "",
                quotes: "",
              };
            }
          }
          async function tryFetchTranscript(k) {
            var before = val("v65Transcript") || k.transcriptText || "";
            if (before) return before;
            if (Actions.fetchVideoTranscript) {
              try {
                Actions.fetchVideoTranscript(k.id);
              } catch (e) {}
              for (var i = 0; i < 12; i++) {
                await new Promise(function (res) {
                  setTimeout(res, 250);
                });
                var t = val("v65Transcript") || k.transcriptText || "";
                if (t && t.length > 80) return t;
              }
            }
            return val("v65Transcript") || k.transcriptText || "";
          }
          function applyResult(k, obj, transcript) {
            if (transcript) setVal("v65Transcript", transcript);
            setVal("v65Summary", obj.summary || "");
            setVal("v65Ideas", obj.ideas || "");
            setVal("v65Action", obj.action || "");
            setVal("v65Tasks", obj.tasks || "");
            var lesson = [
              obj.lesson || "",
              obj.quotes ? "اقتباسات مهمة:\n" + obj.quotes : "",
            ]
              .filter(Boolean)
              .join("\n\n");
            setVal("v65Lesson", lesson);
            k.transcriptText = transcript || k.transcriptText || "";
            k.videoSummary = k.summary =
              obj.summary || k.videoSummary || k.summary || "";
            k.ideas = obj.ideas || k.ideas || "";
            k.actionTaken = k.application =
              obj.action || k.actionTaken || k.application || "";
            k.extractedTasks = obj.tasks || k.extractedTasks || "";
            k.lessonLearned = lesson || k.lessonLearned || "";
            save();
          }
          var old = Actions.v65GenerateSingleAI;
          Actions.v65GenerateSingleAI = async function (id) {
            var k = getK(id || currentModalVideoId());
            if (!k) {
              toast("لم أجد الفيديو الحالي");
              return;
            }
            var url = videoUrl(k),
              yid = youtubeId(url),
              transcript = val("v65Transcript") || k.transcriptText || "";
            var btn = document.querySelector(
              '[data-action="v65GenerateSingleAI"][data-id="' +
                CSS.escape(String(k.id)) +
                '"]',
            );
            var oldText = btn ? btn.textContent : "";
            if (btn) {
              btn.disabled = true;
              btn.textContent = "⏳ جاري تلخيص الفيديو تلقائيًا...";
            }
            try {
              toast("جاري التلخيص تلقائيًا داخل المشروع...");
              transcript = await tryFetchTranscript(k);
              var prompt = buildPrompt(k, transcript, url, !!yid);
              var raw = "";
              if (!transcript && yid && ai().geminiKey) {
                // Gemini is used as the automatic video-reader when no transcript exists.
                raw = await geminiYouTube(prompt, url);
              } else if (
                (ai().provider || "claude") === "claude" &&
                ai().anthropicKey
              ) {
                raw = await claudeText(prompt);
              } else if (ai().geminiKey) {
                raw = await geminiText(prompt);
              } else if (ai().anthropicKey) {
                raw = await claudeText(prompt);
              } else {
                throw new Error(
                  "ضع مفتاح Gemini أو Claude مرة واحدة من إعدادات AI. للتلخيص بدون Transcript يفضّل Gemini لأنه يقرأ رابط YouTube مباشرة عند دعمه.",
                );
              }
              var obj = parseAI(raw);
              applyResult(k, obj, transcript);
              toast("تم تلخيص الفيديو وحفظه داخل المشروع ✅");
            } catch (e) {
              var msg = e && e.message ? e.message : String(e);
              setVal(
                "v65Summary",
                "تعذر التلخيص التلقائي الآن:\n" +
                  msg +
                  "\n\nالحل: افتح إعدادات AI وتأكد من وجود Gemini API Key.",
              );
              toast("فشل التلخيص التلقائي: " + msg);
              console.warn("V65.5 Books & Podcasts AI failed", e);
            } finally {
              if (btn) {
                btn.disabled = false;
                btn.textContent = oldText || "✨ تلخيص تلقائي للفيديو";
              }
            }
          };
          function polishPanel() {
            var p = $("v65SingleVideoAI");
            if (!p) return;
            var small = p.querySelector(".v638-head small");
            if (small)
              small.textContent =
                "اضغط تلخيص — المشروع يحاول يقرأ الفيديو ويلخصه ويحفظه تلقائيًا";
            var ta = $("v65Transcript");
            if (ta)
              ta.placeholder =
                "اختياري فقط. سيحاول المشروع جلب النص أو قراءة رابط YouTube تلقائيًا عند توفر Gemini.";
            var btn = p.querySelector('[data-action="v65GenerateSingleAI"]');
            if (btn) btn.textContent = "✨ تلخيص تلقائي للفيديو";
            var hint = p.querySelector(".v65-ai-hint");
            if (hint)
              hint.textContent =
                "مش محتاج تنسخ برومبت. اضغط تلخيص وسيحاول المشروع التعامل تلقائيًا مع الفيديو. لو الفيديو يمنع القراءة، سيظهر سبب واضح.";
          }
          new MutationObserver(function () {
            clearTimeout(window.__v651Polish);
            window.__v651Polish = setTimeout(polishPanel, 120);
          }).observe(document.body, { childList: true, subtree: true });
          setTimeout(polishPanel, 400);
          toast("V65.1: التلخيص التلقائي للفيديو المنفرد جاهز ✅");
        });
      })();

      /* script section 16 */
      (function () {
        function wait(fn) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            window.MogahedOSX.state
          ) {
            fn();
          } else
            setTimeout(function () {
              wait(fn);
            }, 120);
        }
        wait(function () {
          var api = window.MogahedOSX,
            state = api.state,
            Actions = api.Actions,
            save = api.save || function () {},
            toast = api.toast || function () {},
            render = api.render || function () {};
          var E =
            api.esc ||
            function (v) {
              return String(v || "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
            };
          function $(id) {
            return document.getElementById(id);
          }
          function val(id) {
            var el = $(id);
            return el ? String(el.value || "").trim() : "";
          }
          function setVal(id, v) {
            var el = $(id);
            if (el) el.value = String(v || "");
          }
          function getK(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function typeOf(k) {
            return String((k && k.type) || "");
          }
          function isBook(k) {
            return /كتاب|book|pdf/i.test(
              typeOf(k) +
                " " +
                ((k && k.mediaType) || "") +
                " " +
                ((k && k.mediaMime) || ""),
            );
          }
          function isPodcast(k) {
            return (
              /بودكاست|podcast|محاضرة|audio|mp3|spotify|soundcloud/i.test(
                typeOf(k) +
                  " " +
                  ((k && k.mediaType) || "") +
                  " " +
                  ((k && k.mediaMime) || "") +
                  " " +
                  ((k && (k.mediaUrl || k.link)) || ""),
              ) && !isBook(k)
            );
          }
          function isVideoLikeUrl(k) {
            var u = String((k && k.mediaUrl) || (k && k.link) || "");
            return /youtube\.com|youtu\.be/i.test(u);
          }
          function sourceUrl(k) {
            return String(
              (k && k.mediaUrl) || (k && k.link) || (k && k.pdfUrl) || "",
            ).trim();
          }
          function dataUrlToPart(dataUrl, fallbackMime) {
            dataUrl = String(dataUrl || "");
            var m = dataUrl.match(/^data:([^;]+);base64,(.*)$/s);
            if (!m) return null;
            return {
              mime: m[1] || fallbackMime || "application/octet-stream",
              data: m[2] || "",
            };
          }
          function ai() {
            state.settings = state.settings || {};
            state.settings.ai = state.settings.ai || {};
            return state.settings.ai;
          }
          function geminiEndpoint() {
            var a = ai();
            if (!a.geminiKey)
              throw new Error("ضع Gemini API Key من إعدادات AI أولًا");
            var model = a.geminiModel || a.model || "gemini-2.0-flash";
            return (
              "https://generativelanguage.googleapis.com/v1beta/models/" +
              encodeURIComponent(model) +
              ":generateContent?key=" +
              encodeURIComponent(a.geminiKey)
            );
          }
          function buildPrompt(k, kind, sourceText) {
            return (
              "أنت مساعد عربي داخل Mogahed OS. المطلوب تلخيص " +
              kind +
              " داخل المشروع مباشرة بدون مطالبة المستخدم بنسخ برومبت.\n\n" +
              "بيانات المحتوى:\nالعنوان: " +
              (k.title || "") +
              "\nالكاتب/المتحدث: " +
              (k.author || k.channel || "") +
              "\nالرابط: " +
              sourceUrl(k) +
              "\nالنوع: " +
              (k.type || "") +
              "\nالتقدم الحالي: " +
              (k.currentUnit || 0) +
              " / " +
              (k.totalUnits || "غير محدد") +
              "\n\n" +
              "ملاحظات المستخدم الحالية:\n" +
              (k.playerNotes || k.notes || "لا توجد") +
              "\n\n" +
              "نص/تفريغ اختياري من المستخدم إن وجد:\n" +
              (sourceText || "غير متاح") +
              "\n\n" +
              "حلل المحتوى نفسه إن كان الملف/الرابط متاحًا لك. أخرج JSON فقط بدون Markdown بهذا الشكل:\n" +
              '{"summary":"ملخص شامل واضح","ideas":"أهم الأفكار في نقاط","action":"تطبيق عملي محدد","tasks":"مهام قابلة للتنفيذ","lesson":"درس مستفاد/أسئلة مراجعة","quotes":"اقتباسات مهمة إن ظهرت"}\n\n' +
              "لا تقل للمستخدم انسخ البرومبت. لو لم تستطع قراءة المصدر، استخدم النص والملاحظات المتاحة واذكر ذلك باختصار داخل الملخص."
            );
          }
          async function geminiParts(parts) {
            var r = await fetch(geminiEndpoint(), {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: parts }],
                generationConfig: {
                  temperature: 0.25,
                  maxOutputTokens: 3200,
                  responseMimeType: "application/json",
                },
              }),
            });
            var data = await r.json().catch(function () {
              return {};
            });
            if (!r.ok)
              throw new Error(
                (data.error && data.error.message) || "Gemini HTTP " + r.status,
              );
            return (
              (((data.candidates || [])[0] || {}).content || {}).parts
                ?.map(function (p) {
                  return p.text || "";
                })
                .join("\n")
                .trim() || ""
            );
          }
          async function geminiText(prompt) {
            return geminiParts([{ text: prompt }]);
          }
          async function geminiFile(prompt, part) {
            return geminiParts([
              { inline_data: { mime_type: part.mime, data: part.data } },
              { text: prompt },
            ]);
          }
          async function geminiFileUri(prompt, url, mime) {
            var bodies = [
              [
                {
                  file_data: {
                    mime_type: mime || "application/pdf",
                    file_uri: url,
                  },
                },
                { text: prompt },
              ],
              [
                {
                  fileData: {
                    mimeType: mime || "application/pdf",
                    fileUri: url,
                  },
                },
                { text: prompt },
              ],
            ];
            var last = "";
            for (var i = 0; i < bodies.length; i++) {
              try {
                return await geminiParts(bodies[i]);
              } catch (e) {
                last = e.message || String(e);
              }
            }
            throw new Error(last || "لم أستطع قراءة الرابط عبر Gemini");
          }
          function parseAI(raw) {
            raw = String(raw || "").trim();
            var json = raw;
            var m =
              raw.match(/```json([\s\S]*?)```/i) ||
              raw.match(/```([\s\S]*?)```/);
            if (m) json = m[1].trim();
            var b = json.indexOf("{"),
              e = json.lastIndexOf("}");
            if (b >= 0 && e > b) json = json.slice(b, e + 1);
            try {
              return JSON.parse(json);
            } catch (err) {
              return {
                summary: raw,
                ideas: "",
                action: "",
                tasks: "",
                lesson: "",
                quotes: "",
              };
            }
          }
          function apply(k, obj, sourceText) {
            k.aiSourceText = sourceText || k.aiSourceText || "";
            k.summary = obj.summary || k.summary || "";
            k.playerNotes = k.summary;
            k.ideas = obj.ideas || k.ideas || "";
            k.actionTaken = k.application =
              obj.action || k.actionTaken || k.application || "";
            k.extractedTasks = obj.tasks || k.extractedTasks || "";
            k.lessonLearned =
              [
                obj.lesson || "",
                obj.quotes ? "اقتباسات مهمة:\n" + obj.quotes : "",
              ]
                .filter(Boolean)
                .join("\n\n") ||
              k.lessonLearned ||
              "";
            setVal("v652SourceText", k.aiSourceText || "");
            setVal("v652Summary", k.summary || "");
            setVal("v652Ideas", k.ideas || "");
            setVal("v652Action", k.actionTaken || k.application || "");
            setVal("v652Tasks", k.extractedTasks || "");
            setVal("v652Lesson", k.lessonLearned || "");
            var pn = $("playerNotes");
            if (pn) pn.value = k.summary || pn.value || "";
            var pi = $("playerIdeas");
            if (pi) pi.value = k.ideas || pi.value || "";
            var pa = $("playerApp");
            if (pa) pa.value = k.actionTaken || k.application || pa.value || "";
            save();
          }
          function panelHtml(k) {
            var book = isBook(k),
              pod = isPodcast(k);
            if (!book && !pod) return "";
            var label = book ? "الكتاب" : "البودكاست";
            var icon = book ? "📚" : "🎧";
            return (
              '<div class="v652-ai-panel" id="v652KnowledgeAI" data-id="' +
              E(k.id) +
              '"><div class="v652-ai-head"><div><h3>✨ ملخص الذكاء الاصطناعي — ' +
              icon +
              " " +
              label +
              '</h3><small>اضغط تلخيص، والمشروع يحاول يقرأ المصدر/الملف ويلخصه ويحفظ النتيجة هنا.</small></div><span class="pill">Gemini</span></div>' +
              '<label>نص اختياري / تفريغ / صفحات من الكتاب</label><textarea class="v652-source" id="v652SourceText" placeholder="اختياري. لو عندك نص أو تفريغ الصقه هنا. لو عندك PDF/ملف صوت/يوتيوب سيحاول Gemini قراءته تلقائيًا.">' +
              E(k.aiSourceText || k.transcriptText || "") +
              "</textarea>" +
              '<button class="btn v652-primary" data-action="v652SummarizeKnowledge" data-id="' +
              E(k.id) +
              '">✨ تلخيص تلقائي للـ ' +
              E(label) +
              "</button>" +
              '<div class="v652-status" id="v652Status">جاهز. للتلخيص التلقائي من كتاب PDF أو بودكاست بدون نص، احفظ Gemini API Key من إعدادات AI.</div>' +
              '<label>الملخص الشامل</label><textarea id="v652Summary" placeholder="الملخص يظهر هنا بعد التوليد">' +
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
              '">💾 حفظ الملخص</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div></div>'
            );
          }
          function injectPanel(k) {
            if (!k || (!isBook(k) && !isPodcast(k))) return;
            var modal = $("modal");
            if (!modal || !modal.classList.contains("open")) return;
            if ($("v652KnowledgeAI")) return;
            var html = panelHtml(k);
            var target = null;
            if (isBook(k)) target = modal.querySelector(".reader-side-scroll");
            if (!target)
              target =
                modal.querySelector(".player-note-area") ||
                modal.querySelector(".reader-side-scroll") ||
                modal.querySelector(".player-side") ||
                modal.querySelector(".reader-side");
            if (target) target.insertAdjacentHTML("beforeend", html);
          }
          var oldOpen = Actions.openKnowledgePlayer;
          if (!Actions.__v652_openWrapped) {
            Actions.__v652_openWrapped = true;
            Actions.openKnowledgePlayer = function (id, btn) {
              var out = oldOpen.apply(this, arguments);
              var k = getK(id);
              setTimeout(function () {
                injectPanel(k);
              }, 350);
              setTimeout(function () {
                injectPanel(k);
              }, 900);
              return out;
            };
          }
          Actions.v652SaveKnowledgeAI = function (id) {
            var k = getK(id);
            if (!k) return;
            k.aiSourceText = val("v652SourceText");
            k.summary = val("v652Summary") || k.summary || "";
            k.playerNotes = k.summary;
            k.ideas = val("v652Ideas") || k.ideas || "";
            k.actionTaken = k.application =
              val("v652Action") || k.actionTaken || k.application || "";
            k.extractedTasks = val("v652Tasks") || k.extractedTasks || "";
            k.lessonLearned = val("v652Lesson") || k.lessonLearned || "";
            var pn = $("playerNotes");
            if (pn) pn.value = k.summary;
            var pi = $("playerIdeas");
            if (pi) pi.value = k.ideas;
            var pa = $("playerApp");
            if (pa) pa.value = k.actionTaken || k.application || "";
            save();
            toast("تم حفظ ملخص " + (isBook(k) ? "الكتاب" : "البودكاست"));
          };
          Actions.v652SummarizeKnowledge = async function (id) {
            var k = getK(id);
            if (!k) return toast("لم أجد المحتوى الحالي");
            var btn = document.querySelector(
                '[data-action="v652SummarizeKnowledge"][data-id="' +
                  CSS.escape(String(id)) +
                  '"]',
              ),
              old = btn ? btn.textContent : "";
            var status = $("v652Status");
            function st(t) {
              if (status) status.textContent = t;
            }
            try {
              if (!ai().geminiKey) {
                toast("ضع Gemini API Key من إعدادات AI أولًا");
                if (Actions.openAISettings) Actions.openAISettings();
                return;
              }
              if (btn) {
                btn.disabled = true;
                btn.textContent = "⏳ جاري التلخيص التلقائي...";
              }
              var kind = isBook(k) ? "كتاب" : "بودكاست",
                sourceText =
                  val("v652SourceText") ||
                  k.aiSourceText ||
                  k.transcriptText ||
                  "";
              st("جاري تجهيز المصدر وطلب التلخيص من Gemini...");
              toast("جاري تلخيص " + kind + " داخل المشروع...");
              var prompt = buildPrompt(k, kind, sourceText),
                raw = "",
                url = sourceUrl(k);
              var data = k.pdfData || k.mediaData || "";
              var mime =
                k.mediaMime || (isBook(k) ? "application/pdf" : "audio/mpeg");
              var part = dataUrlToPart(data, mime);
              if (part && part.data && part.data.length < 18000000) {
                raw = await geminiFile(prompt, part);
              } else if (isPodcast(k) && isVideoLikeUrl(k) && url) {
                raw = await geminiFileUri(prompt, url, "video/*");
              } else if (isBook(k) && url && /\.pdf(\?|#|$)|pdf/i.test(url)) {
                raw = await geminiFileUri(prompt, url, "application/pdf");
              } else {
                raw = await geminiText(prompt);
              }
              var obj = parseAI(raw);
              apply(k, obj, sourceText);
              st("تم التلخيص والحفظ داخل المشروع ✅");
              toast("تم تلخيص " + kind + " وحفظه ✅");
            } catch (e) {
              var msg = e && e.message ? e.message : String(e);
              st("فشل التلخيص: " + msg);
              toast("فشل التلخيص: " + msg);
              console.warn("V65.5 knowledge AI failed", e);
            } finally {
              if (btn) {
                btn.disabled = false;
                btn.textContent = old || "✨ تلخيص تلقائي";
              }
            }
          };
          new MutationObserver(function () {
            var modal = $("modal");
            if (
              !modal ||
              !modal.classList.contains("open") ||
              $("v652KnowledgeAI")
            )
              return;
            var title =
              (
                modal.querySelector(
                  ".player-title h3,.player-head h3,#modalTitle",
                ) || {}
              ).textContent || "";
            var k = (state.knowledge || []).find(function (x) {
              return (
                (isBook(x) || isPodcast(x)) &&
                title &&
                title.includes(String(x.title || "").slice(0, 18))
              );
            });
            if (k)
              setTimeout(function () {
                injectPanel(k);
              }, 150);
          }).observe(document.body, { childList: true, subtree: true });
          toast("V65.5: تلخيص AI للكتب والبودكاست جاهز ✅");
        });
      })();

      /* script section 17 */
      (function () {
        function wait(fn) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            window.MogahedOSX.state &&
            typeof window.openModal === "function"
          )
            fn();
          else
            setTimeout(function () {
              wait(fn);
            }, 120);
        }
        wait(function () {
          var api = window.MogahedOSX;
          var state = api.state;
          var Actions = api.Actions;
          var toast = api.toast || function () {};
          var esc =
            api.esc ||
            function (v) {
              return String(v || "").replace(/[&<>"']/g, function (m) {
                return {
                  "&": "&amp;",
                  "<": "&lt;",
                  ">": "&gt;",
                  '"': "&quot;",
                  "'": "&#39;",
                }[m];
              });
            };
          var save = api.save || window.save || function () {};
          function byId(id) {
            return document.getElementById(id);
          }
          function kById(id) {
            return (state.knowledge || []).find(function (x) {
              return String(x.id) === String(id);
            });
          }
          function t(k) {
            return (
              String((k && k.type) || "") +
              " " +
              String((k && k.mediaType) || "") +
              " " +
              String((k && k.mediaMime) || "") +
              " " +
              String((k && k.mediaUrl) || (k && k.link) || "")
            ).toLowerCase();
          }
          function isBook(k) {
            return /كتاب|book|pdf/.test(t(k));
          }
          function isPodcast(k) {
            return (
              /بودكاست|podcast|محاضرة|audio|mp3|spotify|soundcloud/.test(
                t(k),
              ) && !isBook(k)
            );
          }
          function sourceUrl(k) {
            return String(
              (k && (k.mediaUrl || k.pdfUrl || k.link || k.url)) || "",
            );
          }
          function pct(k) {
            var total = Number(
                k.totalUnits || k.totalPages || k.totalMinutes || 0,
              ),
              current = Number(
                k.currentUnit || k.currentPage || k.currentMinute || 0,
              );
            if (total > 0)
              return Math.max(
                0,
                Math.min(100, Math.round((current * 100) / total)),
              );
            return Math.max(0, Math.min(100, Number(k.progress || 0)));
          }
          function dataToBlobUrl(data, mime) {
            try {
              if (!data) return "";
              if (/^blob:|^https?:|^content:/.test(data)) return data;
              if (/^data:/.test(data)) {
                var parts = data.split(",");
                var head = parts[0] || "";
                var b64 = parts.slice(1).join(",");
                var m =
                  (head.match(/data:([^;]+)/) || [])[1] ||
                  mime ||
                  "application/octet-stream";
                var bin = atob(b64);
                var len = bin.length;
                var arr = new Uint8Array(len);
                for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
                return URL.createObjectURL(new Blob([arr], { type: m }));
              }
            } catch (e) {}
            return data || "";
          }
          function getStoredSource(k, cb) {
            if (k.mediaData || k.pdfData) {
              cb(k.mediaData || k.pdfData);
              return;
            }
            var key = k.pdfDbKey || k.mediaDbKey;
            if (key && typeof window.v48DbGet === "function")
              window.v48DbGet(key, function (v) {
                cb(v || "");
              });
            else cb("");
          }
          function mediaBlock(k, src) {
            var url = sourceUrl(k);
            var label = isBook(k) ? "قارئ الكتاب" : "مشغل البودكاست";
            var icon = isBook(k) ? "📚" : "🎧";
            var direct = src
              ? dataToBlobUrl(
                  src,
                  k.mediaMime || (isBook(k) ? "application/pdf" : "audio/mpeg"),
                )
              : url;
            var html = "";
            if (isBook(k)) {
              if (direct) {
                html +=
                  '<div class="v655-reader-frame" id="v655MediaFrame"><iframe src="' +
                  esc(direct) +
                  '" title="PDF Reader"></iframe></div>';
              } else {
                html +=
                  '<div class="v655-reader-frame"><div class="v655-warn"><h3>PDF غير متاح للقراءة داخل المشروع</h3><p>ارفع ملف PDF من الجهاز أو ضع رابط PDF مباشر. الروابط العادية/صفحات المواقع لا تعمل كقارئ PDF.</p><button class="btn secondary" data-action="editKnowledge" data-id="' +
                  esc(k.id) +
                  '">تعديل المصدر</button></div></div>';
              }
            } else {
              if (src) {
                var blob = dataToBlobUrl(src, k.mediaMime || "audio/mpeg");
                html +=
                  '<div class="v655-audio-frame" id="v655MediaFrame"><audio controls src="' +
                  esc(blob) +
                  '"></audio></div>';
              } else if (url) {
                var low = url.toLowerCase();
                if (
                  low.indexOf("youtube.com") > -1 ||
                  low.indexOf("youtu.be") > -1
                ) {
                  var id =
                    (url.match(/[?&]v=([^&]+)/) ||
                      url.match(/youtu\.be\/([^?&]+)/) ||
                      [])[1] || "";
                  html +=
                    '<div class="v655-reader-frame" id="v655MediaFrame">' +
                    (id
                      ? '<iframe src="https://www.youtube.com/embed/' +
                        esc(id) +
                        '" allowfullscreen></iframe>'
                      : '<div class="v655-warn">رابط YouTube غير واضح</div>') +
                    "</div>";
                } else {
                  html +=
                    '<div class="v655-audio-frame" id="v655MediaFrame"><audio controls src="' +
                    esc(url) +
                    '"></audio><div class="row"><button class="btn secondary" data-action="openExternal" data-url="' +
                    esc(url) +
                    '">فتح المصدر</button></div></div>';
                }
              } else {
                html +=
                  '<div class="v655-audio-frame"><div class="v655-warn"><h3>لا يوجد مصدر للبودكاست</h3><p>أضف رابط أو ملف صوتي.</p><button class="btn secondary" data-action="editKnowledge" data-id="' +
                  esc(k.id) +
                  '">تعديل المصدر</button></div></div>';
              }
            }
            return (
              '<section class="v655-media-card v655-media-section"><div class="v655-media-head"><span class="pill">' +
              icon +
              " " +
              label +
              '</span><span class="pill">' +
              pct(k) +
              '%</span></div><div class="v655-toolbar"><button class="btn secondary" data-action="v655Zoom" data-zoom="100">100%</button><button class="btn secondary" data-action="v655Zoom" data-zoom="125">تكبير</button><button class="btn secondary" data-action="v655Zoom" data-zoom="150">تكبير +</button><button class="btn secondary" data-action="v655Expand">توسيع</button><button class="btn" data-action="v655Fullscreen">ملء الشاشة</button></div>' +
              html +
              "</section>"
            );
          }
          function progressBlock(k) {
            var current = Number(
                k.currentUnit || k.currentPage || k.currentMinute || 0,
              ),
              total = Number(
                k.totalUnits || k.totalPages || k.totalMinutes || 0,
              );
            var unit = isBook(k) ? "صفحة" : "دقيقة";
            return (
              '<section class="v655-card v655-progress-section"><h3>التقدم</h3><p class="muted">' +
              current +
              " " +
              unit +
              " من " +
              (total || "?") +
              " — " +
              pct(k) +
              '%</p><div class="progress"><div class="bar" style="width:' +
              pct(k) +
              '%"></div></div><label>وصلت إلى ' +
              unit +
              '</label><input id="v655Current" type="number" value="' +
              esc(current) +
              '"><div class="row"><button class="btn" data-action="v655SaveProgress" data-id="' +
              esc(k.id) +
              '">حفظ التقدم</button><button class="btn secondary" data-action="playerToAction" data-id="' +
              esc(k.id) +
              '">حوّل لإجراء</button></div></section>'
            );
          }
          function aiBlock(k) {
            var label = isBook(k) ? "الكتاب" : "البودكاست";
            return (
              '<section class="v652-ai-panel v655-card v655-ai-section" id="v652KnowledgeAI" data-id="' +
              esc(k.id) +
              '"><div class="v652-ai-head"><div><h3>✨ ملخص الذكاء الاصطناعي</h3><small>المصدر فوق، والملخص هنا تحته. يتم الحفظ داخل نفس المحتوى.</small></div><span class="pill">Gemini</span></div><label>نص اختياري / تفريغ / صفحات من ' +
              esc(label) +
              '</label><textarea class="v652-source" id="v652SourceText" placeholder="اختياري. اتركه فارغًا لو عايز Gemini يحاول يقرأ المصدر تلقائيًا.">' +
              esc(k.aiSourceText || k.transcriptText || "") +
              '</textarea><button class="btn v652-primary" data-action="v652SummarizeKnowledge" data-id="' +
              esc(k.id) +
              '">✨ تلخيص تلقائي للـ ' +
              esc(label) +
              '</button><div class="v652-status" id="v652Status">جاهز للتلخيص والحفظ داخل المشروع.</div><label>الملخص الشامل</label><textarea id="v652Summary" placeholder="الملخص يظهر هنا بعد التوليد">' +
              esc(k.summary || "") +
              '</textarea><div class="v652-ai-grid"><div><label>أهم الأفكار</label><textarea id="v652Ideas">' +
              esc(k.ideas || "") +
              '</textarea></div><div><label>التطبيق العملي</label><textarea id="v652Action">' +
              esc(k.actionTaken || k.application || "") +
              '</textarea></div><div><label>المهام المستخرجة</label><textarea id="v652Tasks">' +
              esc(k.extractedTasks || "") +
              '</textarea></div><div><label>الدرس / الاقتباسات</label><textarea id="v652Lesson">' +
              esc(k.lessonLearned || "") +
              '</textarea></div></div><div class="v652-actions"><button class="btn secondary" data-action="v652SaveKnowledgeAI" data-id="' +
              esc(k.id) +
              '">💾 حفظ الملخص</button><button class="btn secondary" data-action="openAISettings">⚙️ إعدادات AI</button></div></section>'
            );
          }
          function notesBlock(k) {
            return (
              '<section class="v655-card v655-notes-section"><h3>ملاحظاتي</h3><label>ملاحظات أثناء القراءة/الاستماع</label><textarea id="playerNotes">' +
              esc(k.playerNotes || "") +
              '</textarea><label>أهم الأفكار الشخصية</label><textarea id="playerIdeas">' +
              esc(k.ideas || "") +
              '</textarea><label>ماذا ستطبق؟</label><textarea id="playerApp">' +
              esc(k.application || k.actionTaken || "") +
              '</textarea><div class="row"><button class="btn" data-action="savePlayerNotes" data-id="' +
              esc(k.id) +
              '">حفظ الملاحظات</button></div></section>'
            );
          }
          function openCleanReader(k) {
            getStoredSource(k, function (stored) {
              var title = isBook(k) ? "قارئ الكتاب" : "مشغل البودكاست";
              var header =
                '<div class="player-head v655-head"><div class="player-title"><h3>' +
                esc(k.title || title) +
                "</h3><p>" +
                title +
                ' • القارئ فوق — الملخص والذكاء الاصطناعي تحته في نفس الصفحة</p></div><div class="row"><button class="btn secondary mini" data-action="editKnowledge" data-id="' +
                esc(k.id) +
                '">تعديل</button><button class="btn secondary mini" data-action="closeModal">إغلاق</button></div></div>';
              var body =
                '<div class="v655-reader-layout" id="v655ReaderLayout">' +
                mediaBlock(k, stored) +
                aiBlock(k) +
                progressBlock(k) +
                notesBlock(k) +
                "</div>";
              document
                .getElementById("modal")
                .classList.add("player-mode", "v655-clean-modal");
              window.openModal(title, header + body);
            });
          }
          Actions.v655Zoom = function (id, btn) {
            var layout = byId("v655ReaderLayout");
            if (!layout) return;
            layout.classList.remove("v655-zoom-125", "v655-zoom-150");
            var z = (btn && btn.dataset && btn.dataset.zoom) || "100";
            if (z === "125") layout.classList.add("v655-zoom-125");
            if (z === "150") layout.classList.add("v655-zoom-150");
          };
          Actions.v655Expand = function () {
            var frame = byId("v655MediaFrame");
            if (frame) frame.classList.toggle("v655-expanded");
          };
          Actions.v655Fullscreen = function () {
            var frame = byId("v655MediaFrame");
            if (!frame) return;
            if (frame.requestFullscreen) {
              frame.requestFullscreen().catch(function () {
                frame.classList.toggle("v655-fixed-full");
              });
            } else frame.classList.toggle("v655-fixed-full");
          };
          Actions.v655SaveProgress = function (id) {
            var k = kById(id);
            if (!k) return;
            var val = Number((byId("v655Current") || {}).value || 0);
            k.currentUnit = val;
            if (isBook(k)) k.currentPage = val;
            else k.currentMinute = val;
            k.progress = pct(k);
            save();
            toast("تم حفظ التقدم");
          };
          var oldOpen = Actions.openKnowledgePlayer;
          Actions.openKnowledgePlayer = function (id, btn) {
            var k = kById(id);
            if (k && (isBook(k) || isPodcast(k))) {
              openCleanReader(k);
              return;
            }
            return oldOpen ? oldOpen.apply(this, arguments) : undefined;
          };
          document.addEventListener(
            "click",
            function (e) {
              var b = e.target.closest('[data-action="openKnowledgePlayer"]');
              if (!b) return;
              var k = kById(b.dataset.id);
              if (k && (isBook(k) || isPodcast(k))) {
                e.preventDefault();
                e.stopImmediatePropagation();
                openCleanReader(k);
              }
            },
            true,
          );
          toast(
            "V65.5: تم تنظيف قارئ الكتب والبودكاست بدون تركيب فوق تركيب ✅",
          );
        });
      })();

      /* script section 18 */
      (function () {
        function wait(fn) {
          if (
            window.MogahedOSX &&
            window.MogahedOSX.Actions &&
            window.MogahedOSX.state
          )
            fn();
          else
            setTimeout(function () {
              wait(fn);
            }, 120);
        }
        wait(function () {
          var api = window.MogahedOSX,
            Actions = api.Actions,
            state = api.state;
          function $(id) {
            return document.getElementById(id);
          }
          function reorderReader() {
            var layout = $("v655ReaderLayout");
            if (!layout) return;
            var media = layout.querySelector(
              ".v655-media-section,.v655-media-card",
            );
            var ai = layout.querySelector("#v652KnowledgeAI,.v655-ai-section");
            var progress = layout.querySelector(".v655-progress-section");
            var notes = layout.querySelector(".v655-notes-section");
            // remove accidental duplicate AI panels created by older injected scripts
            var ais = [].slice.call(
              layout.querySelectorAll("#v652KnowledgeAI,.v652-ai-panel"),
            );
            if (ais.length > 1) {
              ais.slice(1).forEach(function (x) {
                x.remove();
              });
              ai = ais[0];
            }
            [media, ai, progress, notes].forEach(function (el) {
              if (el) layout.appendChild(el);
            });
          }
          var oldOpen = Actions.openKnowledgePlayer;
          Actions.openKnowledgePlayer = function () {
            var out = oldOpen && oldOpen.apply(this, arguments);
            setTimeout(reorderReader, 80);
            setTimeout(reorderReader, 350);
            setTimeout(reorderReader, 900);
            return out;
          };
          new MutationObserver(function () {
            if ($("v655ReaderLayout")) reorderReader();
          }).observe(document.body, { childList: true, subtree: true });
        });
      })();
