// Extracted from V83 inline script block 11. Original id: v74-heroic-victory-system-script

(function () {
        function arr(x) {
          return Array.isArray(x) ? x : [];
        }
        function done(x) {
          return (
            x &&
            (x.status === "done" || x.done === true || x.completed === true)
          );
        }
        function todayStr() {
          return new Date().toISOString().slice(0, 10);
        }
        function inToday(x) {
          var d =
            ((x &&
              (x.date ||
                x.createdAt ||
                x.updatedAt ||
                x.completedAt ||
                x.doneAt)) ||
              "") + "";
          return d.indexOf(todayStr()) === 0;
        }
        function esc(s) {
          try {
            return typeof window.esc === "function"
              ? window.esc(s)
              : String(s || "").replace(/[&<>"']/g, function (c) {
                  return {
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    '"': "&quot;",
                    "'": "&#39;",
                  }[c];
                });
          } catch (e) {
            return String(s || "");
          }
        }
        function pct(v, m) {
          return Math.max(
            0,
            Math.min(100, Math.round(((v || 0) / (m || 1)) * 100)),
          );
        }
        var ranks = [
          { xp: 0, title: "مبتدئ التنفيذ", icon: "🥉", avatar: "🌱" },
          { xp: 180, title: "منجز يومي", icon: "🥈", avatar: "⚡" },
          { xp: 420, title: "صائد الإنجازات", icon: "🥇", avatar: "🏹" },
          { xp: 760, title: "قائد التنفيذ", icon: "⚔️", avatar: "🛡️" },
          { xp: 1200, title: "سيد التركيز", icon: "👑", avatar: "🧘" },
          { xp: 1800, title: "أسطورة الانضباط", icon: "💎", avatar: "🐉" },
          { xp: 2600, title: "لا يُقهر", icon: "🔥", avatar: "🦁" },
        ];
        var rewardList = [
          {
            xp: 120,
            icon: "🎨",
            title: "لون انتصار",
            text: "افتح إحساس بصري جديد للوحة الفوز.",
          },
          {
            xp: 260,
            icon: "🛡️",
            title: "بطاقة إنقاذ Streak",
            text: "كارت معنوي يحميك من يوم ضعف.",
          },
          {
            xp: 420,
            icon: "👑",
            title: "شارة قائد",
            text: "تظهر في أعلى لوحة الفوز كدليل تقدم.",
          },
          {
            xp: 680,
            icon: "🎁",
            title: "صندوق مكافأة",
            text: "افتح مكافأة شخصية بعد أسبوع قوي.",
          },
          {
            xp: 950,
            icon: "🌌",
            title: "خلفية Elite",
            text: "مظهر أعمق للوحة الفوز.",
          },
          {
            xp: 1350,
            icon: "🏛️",
            title: "Hall of Fame",
            text: "توثيق أفضل نسخة وصلت لها.",
          },
        ];
        function metrics() {
          var s = window.state || {};
          var actions = arr(s.actions),
            tasks = arr(s.tasks),
            know = arr(s.knowledge),
            timeline = arr(s.timeline),
            focus = arr(s.focusSessions),
            rescue = arr(s.rescueLog),
            reviews = arr(s.reviews),
            dec = arr(s.decisions),
            hab = arr(s.habits);
          var doneActions = actions.filter(done).length,
            doneTasks = tasks.filter(done).length,
            doneKnow = know.filter(done).length;
          var todayWins =
            timeline.filter(inToday).length +
            actions.filter(function (a) {
              return done(a) && inToday(a);
            }).length +
            tasks.filter(function (t) {
              return done(t) && inToday(t);
            }).length +
            focus.filter(inToday).length;
          var xp =
            doneActions * 18 +
            doneTasks * 14 +
            doneKnow * 260 +
            focus.length * 55 +
            rescue.length * 45 +
            reviews.length * 35 +
            dec.length * 22 +
            timeline.length * 12;
          var streak = Math.min(
            99,
            Math.max(
              1,
              Math.ceil((todayWins + timeline.length + doneActions) / 3),
            ),
          );
          return {
            actions: actions,
            tasks: tasks,
            know: know,
            timeline: timeline,
            focus: focus,
            rescue: rescue,
            reviews: reviews,
            dec: dec,
            hab: hab,
            doneActions: doneActions,
            doneTasks: doneTasks,
            doneKnow: doneKnow,
            todayWins: todayWins,
            xp: xp,
            streak: streak,
          };
        }
        function rankOf(xp) {
          var cur = ranks[0],
            next = null;
          for (var i = 0; i < ranks.length; i++) {
            if (xp >= ranks[i].xp) cur = ranks[i];
            else {
              next = ranks[i];
              break;
            }
          }
          return { cur: cur, next: next, index: ranks.indexOf(cur) };
        }
        function progress(m, r) {
          var base = r.cur.xp,
            next = r.next ? r.next.xp : r.cur.xp + 700;
          return pct(m.xp - base, next - base);
        }
        function journey(r) {
          return ranks
            .map(function (x, i) {
              var cls = i < r.index ? "done" : i === r.index ? "current" : "";
              return (
                '<div class="v74-stage ' +
                cls +
                '"><div class="v74-stage-icon">' +
                x.icon +
                "</div><div><b>" +
                x.title +
                "</b><small>" +
                x.xp +
                " XP</small></div></div>"
              );
            })
            .join("");
        }
        function skillHtml(m) {
          var skills = [
            ["📚", "القراءة والمعرفة", m.doneKnow, 8],
            ["🎯", "التركيز العميق", m.focus.length, 18],
            ["⚡", "التنفيذ", m.doneActions + m.doneTasks, 50],
            ["🧠", "جودة القرار", m.dec.length, 20],
            ["🚨", "الرجوع من التشتت", m.rescue.length, 12],
            ["🔁", "المراجعة والتحسين", m.reviews.length, 14],
          ];
          return skills
            .map(function (s) {
              var p = pct(s[2], s[3]);
              var lvl = Math.max(1, Math.ceil(p / 20));
              return (
                '<div class="v74-skill"><div class="v74-skill-top"><b>' +
                s[0] +
                " " +
                s[1] +
                "</b><strong>Lv." +
                lvl +
                '</strong></div><div class="progress"><div class="bar" style="width:' +
                p +
                '%"></div></div><span class="muted" style="font-size:11px">' +
                Math.min(s[2], s[3]) +
                "/" +
                s[3] +
                "</span></div>"
              );
            })
            .join("");
        }
        function rewards(m) {
          return rewardList
            .map(function (r) {
              var u = m.xp >= r.xp;
              return (
                '<div class="v74-reward ' +
                (u ? "unlocked" : "locked") +
                '"><span class="v74-ribbon">' +
                (u ? "مفتوحة" : "تحتاج " + r.xp + " XP") +
                '</span><div class="ico">' +
                r.icon +
                "</div><h4>" +
                r.title +
                "</h4><p>" +
                r.text +
                "</p></div>"
              );
            })
            .join("");
        }
        function achievements(m) {
          var a = [
            {
              u: m.doneActions >= 1,
              icon: "✅",
              t: "أول ضربة",
              p: "أنهيت أول إجراء.",
            },
            {
              u: m.doneActions >= 10,
              icon: "⚡",
              t: "عشرة تنفيذات",
              p: "دخلت وضع الحركة.",
            },
            {
              u: m.focus.length >= 5,
              icon: "🎯",
              t: "مقاتل التركيز",
              p: "5 جلسات تركيز.",
            },
            {
              u: m.doneKnow >= 1,
              icon: "📚",
              t: "أول معرفة مكتملة",
              p: "حولت معرفة لفوز.",
            },
            {
              u: m.rescue.length >= 3,
              icon: "🚨",
              t: "ضد التشتت",
              p: "رجعت من التشتت 3 مرات.",
            },
            { u: m.xp >= 1000, icon: "👑", t: "النخبة", p: "وصلت 1000 XP." },
          ];
          return a
            .map(function (x) {
              return (
                '<div class="v74-ach ' +
                (x.u ? "unlocked" : "secret") +
                '"><div class="ico">' +
                (x.u ? x.icon : "❓") +
                "</div><h4>" +
                (x.u ? x.t : "إنجاز مخفي") +
                "</h4><p>" +
                (x.u ? x.p : "استمر في التنفيذ وسيظهر فجأة.") +
                "</p></div>"
              );
            })
            .join("");
        }
        function quests(m) {
          var qs = [
            {
              d: m.todayWins >= 1,
              icon: "⚡",
              t: "فوز واحد اليوم",
              p: "نفذ أي مهمة أو إجراء.",
              a: "addAction",
              b: "+ إجراء",
            },
            {
              d: m.focus.filter(inToday).length >= 1,
              icon: "🎯",
              t: "جلسة تركيز",
              p: "ابدأ جلسة Focus قصيرة.",
              a: "openFocus",
              b: "ابدأ",
            },
            {
              d: m.rescue.filter(inToday).length >= 1,
              icon: "🚨",
              t: "إنقاذ من التشتت",
              p: "استخدم طوارئ التشتت عند الضعف.",
              a: "emergencyPlan",
              b: "إنقاذ",
            },
            {
              d: m.reviews.filter(inToday).length >= 1,
              icon: "🔁",
              t: "مراجعة اليوم",
              p: "اكتب ماذا حدث وماذا ستغير.",
              a: "dailyReflection",
              b: "راجع",
            },
          ];
          return qs
            .map(function (q) {
              return (
                '<div class="v74-quest ' +
                (q.d ? "done" : "") +
                '"><div class="v74-check">' +
                (q.d ? "✓" : q.icon) +
                "</div><div><b>" +
                q.t +
                "</b><small>" +
                q.p +
                '</small></div><button class="btn secondary mini" data-action="' +
                q.a +
                '">' +
                q.b +
                "</button></div>"
              );
            })
            .join("");
        }
        function hall(m) {
          var rows = [
            ["🔥 أطول سلسلة", m.streak + " يوم"],
            ["🏆 إجمالي XP", m.xp + " XP"],
            ["📚 معرفة مكتملة", m.doneKnow],
            ["🎯 جلسات تركيز", m.focus.length],
            ["🚨 مرات الإنقاذ", m.rescue.length],
          ];
          return rows
            .map(function (r) {
              return (
                '<div class="v74-record"><b>' +
                r[0] +
                "</b><span>" +
                r[1] +
                "</span></div>"
              );
            })
            .join("");
        }
        function timeline(m) {
          var items = m.timeline.slice(0, 5);
          if (!items.length)
            return '<div class="empty">نفذ أول إنجاز وسيظهر في متحف الانتصارات هنا.</div>';
          return items
            .map(function (t) {
              return (
                '<div class="v74-record"><b>🏆 ' +
                esc(t.title || "فوز جديد") +
                "</b><span>" +
                esc(t.date || "") +
                "</span></div>"
              );
            })
            .join("");
        }
        window.viewWins = function () {
          try {
            if (typeof setTitle === "function")
              setTitle(
                "لوحة الفوز",
                "نظام ألقاب، جوائز، مهارات، ومتحف إنجازات يحفزك تكمل.",
              );
          } catch (e) {}
          var m = metrics(),
            r = rankOf(m.xp),
            w = progress(m, r),
            next = r.next
              ? "باقي " +
                Math.max(0, r.next.xp - m.xp) +
                " XP للوصول إلى " +
                r.next.title
              : "أنت في أعلى رتبة الآن";
          return (
            '<div class="v74-wins"><section class="v74-hero"><div class="v74-confetti"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="v74-hero-grid"><div><span class="v74-badge">' +
            r.cur.icon +
            " لقبك الحالي: " +
            r.cur.title +
            '</span><h2>متحف انتصارات مجاهد</h2><p>كل مهمة، كل جلسة تركيز، كل كتاب، وكل رجوع من التشتت يتحول هنا إلى XP ولقب وجائزة. الهدف أن تشوف تقدمك كرحلة بطل، مش مجرد قائمة مهام.</p><div class="v74-hero-actions"><button class="btn" data-action="openFocus">▶ ابدأ فوز جديد</button><button class="btn secondary" data-action="addAction">+ إجراء يكسب XP</button><button class="btn rescue" data-action="emergencyPlan">🚨 إنقاذ Streak</button></div></div><aside class="v74-profile"><div class="v74-avatar">' +
            r.cur.avatar +
            '</div><div class="v74-rank-name">' +
            r.cur.title +
            '</div><div class="v74-next">' +
            m.xp +
            " XP • " +
            next +
            '</div><div class="v74-xpbar" style="--w:' +
            w +
            '%"><i></i></div></aside></div></section><section class="v74-kpis"><div class="v74-kpi hot"><em>🔥</em><b>' +
            m.streak +
            '</b><span>Streak تقديري</span></div><div class="v74-kpi"><em>⚡</em><b>' +
            m.doneActions +
            '</b><span>إجراءات منفذة</span></div><div class="v74-kpi"><em>📚</em><b>' +
            m.doneKnow +
            '</b><span>معرفة مكتملة</span></div><div class="v74-kpi"><em>🎯</em><b>' +
            m.focus.length +
            '</b><span>جلسات تركيز</span></div><div class="v74-kpi"><em>🚨</em><b>' +
            m.rescue.length +
            '</b><span>رجوع من التشتت</span></div><div class="v74-kpi"><em>⭐</em><b>' +
            m.todayWins +
            '</b><span>انتصارات اليوم</span></div></section><section class="card v74-card"><div class="v74-card-head"><h3>🗺️ رحلة البطل</h3><span class="pill">Ranks Roadmap</span></div><div class="v74-map">' +
            journey(r) +
            '</div></section><section class="v74-layout"><div class="card v74-card"><div class="v74-card-head"><h3>🧬 شجرة المهارات</h3><span class="pill">Skill Tree</span></div><div class="v74-skill-grid">' +
            skillHtml(m) +
            '</div></div><div class="card v74-card"><div class="v74-card-head"><h3>🚀 مهام الفوز اليومية</h3><span class="pill">Daily Quests</span></div><div class="v74-quest-list">' +
            quests(m) +
            '</div></div></section><section class="v74-layout"><div class="card v74-card"><div class="v74-card-head"><h3>🎁 صندوق الجوائز</h3><span class="pill">Rewards</span></div><div class="v74-rewards">' +
            rewards(m) +
            '</div></div><div class="card v74-card"><div class="v74-card-head"><h3>🏅 الإنجازات المخفية</h3><span class="pill">Achievements</span></div><div class="v74-achievements">' +
            achievements(m) +
            '</div></div></section><section class="v74-layout"><div class="card v74-card v74-endday"><div class="v74-card-head"><h3>🎬 نهاية اليوم</h3><span class="pill">Daily Recap</span></div><p class="muted">لو اليوم خلص الآن، دي صورة إنجازك: لا تقارن نفسك بالناس، قارنها بأمس.</p><div class="v74-summary-grid"><div><strong>' +
            m.todayWins +
            "</strong><small>فوز اليوم</small></div><div><strong>" +
            m.xp +
            "</strong><small>XP كلي</small></div><div><strong>" +
            m.focus.length +
            "</strong><small>تركيز</small></div><div><strong>" +
            m.doneKnow +
            '</strong><small>معرفة</small></div></div></div><div class="card v74-card"><div class="v74-card-head"><h3>🏛️ Hall of Fame</h3><button class="btn secondary mini" data-route="timeline">الخط الزمني</button></div><div class="v74-hall">' +
            hall(m) +
            '</div></div></section><section class="v74-layout"><div class="card v74-card"><div class="v74-card-head"><h3>🌌 الموسم الحالي</h3><span class="pill">Season 01</span></div><div class="v74-season"><div class="v74-season-box"><h4>Season of Discipline</h4><p>هدف الموسم: بناء نسخة أقل تشتتًا وأكثر تنفيذًا. اجمع 1800 XP لفتح لقب أسطورة الانضباط.</p><div class="progress" style="margin-top:10px"><div class="bar" style="width:' +
            pct(m.xp, 1800) +
            '%"></div></div></div></div></div><div class="card v74-card"><div class="v74-card-head"><h3>🏆 آخر الكؤوس</h3><span class="pill">Victory Museum</span></div><div class="v74-hall">' +
            timeline(m) +
            "</div></div></section></div>"
          );
        };
      })();
