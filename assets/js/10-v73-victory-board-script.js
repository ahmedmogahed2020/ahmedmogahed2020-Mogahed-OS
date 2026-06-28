// Extracted from V83 inline script block 10. Original id: v73-victory-board-script

(function () {
        function arr(name) {
          try {
            return Array.isArray(state[name]) ? state[name] : [];
          } catch (e) {
            return [];
          }
        }
        function alive(x) {
          return !x.archived && x.status !== "archived";
        }
        function done(x) {
          return (
            x && (x.status === "done" || x.done === true || x.progress >= 100)
          );
        }
        function pct(x) {
          return Math.max(0, Math.min(100, Number(x && x.progress) || 0));
        }
        function txt(s) {
          return String(s == null ? "" : s).replace(/[&<>"]/g, function (c) {
            return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c];
          });
        }
        function todayISO() {
          return new Date().toISOString().slice(0, 10);
        }
        function inToday(x) {
          var d =
            (x && x.date) ||
            (x && x.createdAt) ||
            (x && x.updatedAt) ||
            (x && x.doneAt) ||
            "";
          return String(d).slice(0, 10) === todayISO();
        }
        function metrics() {
          var actions = arr("actions").filter(alive),
            tasks = arr("tasks").filter(alive),
            know = arr("knowledge").filter(alive),
            timeline = arr("timeline"),
            focus = arr("focusSessions"),
            rescue = arr("rescueLog"),
            reviews = arr("reviews");
          var doneActions = actions.filter(done).length,
            doneTasks = tasks.filter(done).length,
            doneKnow = know.filter(done).length,
            focusCount = focus.length,
            rescueCount = rescue.length,
            reviewsCount = reviews.length;
          var todayWins =
            timeline.filter(inToday).length +
            actions.filter(function (a) {
              return done(a) && inToday(a);
            }).length +
            tasks.filter(function (t) {
              return done(t) && inToday(t);
            }).length;
          var xp =
            doneActions * 25 +
            doneTasks * 20 +
            doneKnow * 45 +
            focusCount * 15 +
            rescueCount * 30 +
            reviewsCount * 20 +
            timeline.length * 10;
          return {
            actions: actions,
            tasks: tasks,
            know: know,
            timeline: timeline,
            focus: focus,
            rescue: rescue,
            reviews: reviews,
            doneActions: doneActions,
            doneTasks: doneTasks,
            doneKnow: doneKnow,
            focusCount: focusCount,
            rescueCount: rescueCount,
            reviewsCount: reviewsCount,
            todayWins: todayWins,
            xp: xp,
          };
        }
        var ranks = [
          {
            min: 0,
            title: "مقاتل البداية",
            icon: "🌱",
            reward: "ابدأ بأول فوز صغير",
          },
          {
            min: 120,
            title: "صائد التشتت",
            icon: "🛡️",
            reward: "راحة 10 دقائق بدون سوشيال",
          },
          {
            min: 300,
            title: "منفذ يومي",
            icon: "⚡",
            reward: "مشروب بتحبه بعد جلسة تركيز",
          },
          {
            min: 650,
            title: "قائد النظام",
            icon: "👑",
            reward: "ساعة هادئة لكتاب أو بودكاست",
          },
          {
            min: 1100,
            title: "Executive Warrior",
            icon: "🔥",
            reward: "مكافأة شخصية محترمة",
          },
          {
            min: 1800,
            title: "Legend Mode",
            icon: "🏆",
            reward: "يوم فخر ومراجعة إنجازات",
          },
        ];
        var rewards = [
          {
            xp: 80,
            icon: "☕",
            title: "استراحة ذكية",
            text: "خد راحة قصيرة بعد تنفيذ أول حزمة.",
          },
          {
            xp: 200,
            icon: "🎧",
            title: "وقت بودكاست",
            text: "اسمع حاجة نافعة بدون فتح السوشيال.",
          },
          {
            xp: 420,
            icon: "📚",
            title: "جلسة كتاب",
            text: "20 دقيقة قراءة كمكافأة راقية.",
          },
          {
            xp: 750,
            icon: "🍽️",
            title: "وجبة مفضلة",
            text: "مكافأة بعد أسبوع تنفيذ قوي.",
          },
          {
            xp: 1200,
            icon: "🎁",
            title: "هدية لنفسك",
            text: "اشترِ حاجة صغيرة تفكرك بالتقدم.",
          },
          {
            xp: 1800,
            icon: "👑",
            title: "لقب الأسطورة",
            text: "احتفل بوصولك لمرحلة ضخمة.",
          },
        ];
        function rankFor(xp) {
          var r = ranks[0],
            next = ranks[1] || ranks[0];
          for (var i = 0; i < ranks.length; i++) {
            if (xp >= ranks[i].min) {
              r = ranks[i];
              next = ranks[i + 1] || ranks[i];
            }
          }
          return { cur: r, next: next };
        }
        function barWidth(xp, r) {
          var span = Math.max(1, r.next.min - r.cur.min),
            val = Math.max(0, Math.min(100, ((xp - r.cur.min) / span) * 100));
          if (r.next === r.cur) val = 100;
          return Math.round(val);
        }
        function milestoneHtml(m) {
          var milestones = [
            {
              at: 1,
              title: "أول فوز",
              text: "نفذت أول إجراء أو مهمة.",
              icon: "🥇",
              v: m.doneActions + m.doneTasks,
            },
            {
              at: 3,
              title: "بداية سلسلة",
              text: "ثلاثة إنجازات تبني ثقة.",
              icon: "🔥",
              v: m.doneActions + m.doneTasks + m.doneKnow,
            },
            {
              at: 5,
              title: "تركيز حقيقي",
              text: "خمس جلسات تركيز ضد التشتيت.",
              icon: "🎯",
              v: m.focusCount,
            },
            {
              at: 3,
              title: "رجوع من التشتت",
              text: "استخدمت الطوارئ بدل الاستسلام.",
              icon: "🚨",
              v: m.rescueCount,
            },
            {
              at: 2,
              title: "معرفة تتحول لقوة",
              text: "أنهيت كتب/بودكاست/فيديوهات.",
              icon: "🧠",
              v: m.doneKnow,
            },
          ];
          return milestones
            .map(function (x) {
              var u = x.v >= x.at;
              return (
                '<div class="v73-milestone ' +
                (u ? "unlocked" : "") +
                '"><div class="v73-medal">' +
                x.icon +
                "</div><div><h4>" +
                x.title +
                "</h4><p>" +
                x.text +
                '</p><div class="progress" style="margin-top:8px"><div class="bar" style="width:' +
                Math.min(100, Math.round((x.v / x.at) * 100)) +
                '%"></div></div></div><span class="pill">' +
                Math.min(x.v, x.at) +
                "/" +
                x.at +
                "</span></div>"
              );
            })
            .join("");
        }
        function rewardsHtml(xp) {
          return rewards
            .map(function (r) {
              var u = xp >= r.xp;
              return (
                '<div class="v73-reward ' +
                (u ? "unlocked" : "locked") +
                '"><span class="v73-ribbon">' +
                (u ? "مفتوحة" : "تحتاج " + r.xp + " XP") +
                '</span><div class="icon">' +
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
        function questsHtml(m) {
          var openTasks = m.tasks.filter(function (t) {
              return !done(t);
            }).length,
            openActions = m.actions.filter(function (a) {
              return !done(a);
            }).length;
          var qs = [
            {
              done: openTasks > 0,
              title: "حدد مهمة واحدة لليوم",
              text: "وجود مهمة واضحة يقلل التشتت.",
              action: "addTask",
              btn: "مهمة",
            },
            {
              done: m.focusCount > 0,
              title: "جلسة تركيز",
              text: "ابدأ 25 دقيقة وانتهى.",
              action: "openFocus",
              btn: "Focus",
            },
            {
              done: m.doneActions > 0,
              title: "اقفل إجراء",
              text: "حوّل شيء مفتوح لفوز.",
              action: "addAction",
              btn: "إجراء",
            },
            {
              done: m.rescueCount > 0,
              title: "استخدم طوارئ التشتت",
              text: "لو وقعت، ارجع بسرعة.",
              action: "emergencyPlan",
              btn: "طوارئ",
            },
          ];
          return qs
            .map(function (q) {
              return (
                '<div class="v73-quest ' +
                (q.done ? "done" : "") +
                '"><div class="v73-quest-check">' +
                (q.done ? "✓" : "○") +
                "</div><div><b>" +
                q.title +
                "</b><small>" +
                q.text +
                '</small></div><button class="btn secondary mini" data-action="' +
                q.action +
                '">' +
                q.btn +
                "</button></div>"
              );
            })
            .join("");
        }
        function timelineHtml(m) {
          var items = m.timeline.slice(0, 7);
          if (!items.length)
            return '<div class="empty">لسه مفيش إنجازات مسجلة. نفذ إجراء واحد وسيظهر هنا.</div>';
          return items
            .map(function (t) {
              return (
                '<div class="v73-trophy-row"><div class="cup">🏆</div><div><h4>' +
                txt(t.title || "فوز جديد") +
                "</h4><p>" +
                txt(t.note || "إنجاز تم تسجيله في النظام.") +
                '</p><span class="pill">' +
                txt(t.date || "") +
                "</span></div></div>"
              );
            })
            .join("");
        }
        window.viewWins = function () {
          try {
            if (typeof setTitle === "function")
              setTitle(
                "لوحة الفوز",
                "نظام ألقاب وجوائز يحوّل التنفيذ اليومي إلى لعبة تقدم مشجعة.",
              );
          } catch (e) {}
          var m = metrics(),
            rr = rankFor(m.xp),
            w = barWidth(m.xp, rr),
            nextTxt =
              rr.next === rr.cur
                ? "وصلت لأعلى لقب"
                : "متبقي " +
                  Math.max(0, rr.next.min - m.xp) +
                  " XP للقب " +
                  rr.next.title;
          return (
            '<div class="v73-wins"><section class="v73-victory-hero"><div class="v73-confetti"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="v73-hero-grid"><div><span class="v73-rank-badge">' +
            rr.cur.icon +
            " لقبك الحالي: " +
            rr.cur.title +
            '</span><h2>كل تنفيذ صغير = فوز حقيقي يا مجاهد.</h2><p>هنا مش مجرد عداد. هنا نظام مكافآت: تجمع XP من المهام، التركيز، المعرفة، والرجوع من التشتت. كل مرحلة تفتح لقب وجائزة تشجعك تكمل.</p><div class="v73-hero-actions"><button class="btn" data-action="openFocus">▶ ابدأ فوز جديد</button><button class="btn secondary" data-action="addAction">+ إجراء يكسب XP</button><button class="btn rescue" data-action="emergencyPlan">🚨 رجوع من التشتت</button></div></div><div class="v73-xp-box"><div class="v73-level-ring" style="--p:' +
            w +
            '"><div><strong>' +
            Math.max(1, ranks.indexOf(rr.cur) + 1) +
            '</strong><small>LEVEL</small></div></div><div class="v73-xp-label">' +
            m.xp +
            " XP • " +
            nextTxt +
            '</div><div class="v73-xp-progress" style="--w:' +
            w +
            '%"><i></i></div></div></div></section><section class="v73-kpi-row"><div class="v73-kpi"><em>⚡</em><b>' +
            m.doneActions +
            '</b><span>إجراءات منفذة</span></div><div class="v73-kpi"><em>🧠</em><b>' +
            m.doneKnow +
            '</b><span>معرفة مكتملة</span></div><div class="v73-kpi"><em>🎯</em><b>' +
            m.focusCount +
            '</b><span>جلسات تركيز</span></div><div class="v73-kpi"><em>🚨</em><b>' +
            m.rescueCount +
            '</b><span>رجوع من التشتت</span></div></section><section class="v73-main-grid"><div class="card v73-card"><div class="v73-title-line"><h3>🏅 مراحل الألقاب</h3><span class="pill">Progress</span></div><div class="v73-milestones">' +
            milestoneHtml(m) +
            '</div></div><div class="card v73-card"><div class="v73-title-line"><h3>🎁 الجوائز المفتوحة</h3><span class="pill">Rewards</span></div><div class="v73-reward-grid">' +
            rewardsHtml(m.xp) +
            '</div></div></section><section class="v73-main-grid"><div class="card v73-card"><div class="v73-title-line"><h3>🚀 مهام اليوم للفوز</h3><span class="pill">Daily Quests</span></div><div class="v73-quest-list">' +
            questsHtml(m) +
            '</div></div><div class="card v73-card"><div class="v73-title-line"><h3>آخر الكؤوس</h3><button class="btn secondary mini" data-route="timeline">كل الإنجازات</button></div><div class="v73-timeline">' +
            timelineHtml(m) +
            "</div></div></section></div>"
          );
        };
      })();
