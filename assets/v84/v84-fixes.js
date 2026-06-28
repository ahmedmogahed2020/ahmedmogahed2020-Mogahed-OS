/* V84 Fixes Only — safe overlay over V83 bundle */
(function(){
  'use strict';
  if(window.__MOGAHED_V84_FIXES_ONLY__) return;
  window.__MOGAHED_V84_FIXES_ONLY__ = true;
  var KEY = 'mogahed_os_x_v1';
  function $(id){return document.getElementById(id)}
  function q(s,root){return (root||document).querySelector(s)}
  function qa(s,root){return Array.prototype.slice.call((root||document).querySelectorAll(s))}
  function esc(v){return String(v==null?'':v).replace(/[&<>"]/g,function(m){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]})}
  function read(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return {}}}
  function api(){return window.MogahedOSX || {}}
  function state(){var a=api(); return a.state || read()}
  function save(){try{var a=api(); if(a.save) a.save(a.state || state()); else localStorage.setItem(KEY,JSON.stringify(state()))}catch(e){try{localStorage.setItem(KEY,JSON.stringify(state()))}catch(_){}}}
  function toast(msg){try{if(api().toast) return api().toast(msg)}catch(e){} var t=$('toast'); if(t){t.textContent=msg;t.style.display='block';clearTimeout(t._v84);t._v84=setTimeout(function(){t.style.display='none'},2400)} }
  function render(){try{if(api().render) api().render()}catch(e){}}
  function closeModal(){try{if(api().closeModal) return api().closeModal()}catch(e){} var m=$('modal'); if(m){m.classList.remove('open','player-mode')} }
  function Actions(){var a=api(); a.Actions=a.Actions||{}; return a.Actions}
  function getVal(id){var el=$(id); return el ? el.value : ''}
  function uid(){return 'v84_'+Date.now().toString(36)+Math.random().toString(36).slice(2,8)}
  function setTitle(title,sub){var t=$('pageTitle'), s=$('pageSub'); if(t) t.textContent=title; if(s) s.textContent=sub||''}
  function enhanceSplash(){
    var l=$('app-loading'); if(!l) return;
    var st=read(), prof=st.profile||{}, set=st.settings||{};
    var img=set.splashImage || prof.avatar || '';
    var text=set.splashText || prof.name || 'Mogahed OS';
    l.style.background='radial-gradient(circle at top,#2c1d52 0,#11111f 48%,#090913 100%)';
    l.style.gap='14px';
    l.innerHTML='<div class="v84-splash-logo">'+(img?'<img src="'+esc(img)+'" alt="logo">':esc(String(text||'M').trim().slice(0,2)))+'</div><div class="v84-splash-title">'+esc(text)+'</div><div class="v84-splash-sub">يتم تجهيز نظامك الآن...</div><div class="v84-loader"><i></i></div>';
  }
  function detectSaveAction(){
    var body=$('modalBody'); if(!body) return '';
    var btn=q('[data-action^="save"], [data-action="v642SaveAll"], [data-action="v636SaveDetails"], [data-action="v637SaveDetails"], [data-action="v638SaveDetails"], [data-action="v641SaveDetails"]', body);
    return btn ? btn.getAttribute('data-action') : '';
  }
  function syncHeaderSave(){
    var saveBtn=$('modalHeaderSaveBtn'), body=$('modalBody'); if(!saveBtn||!body) return;
    var act=detectSaveAction();
    saveBtn.dataset.targetAction=act;
    saveBtn.style.display=act?'inline-flex':'none';
    if(act) saveBtn.textContent='حفظ';
  }
  function patchModal(){
    var modal=$('modal'); if(!modal) return;
    modal.setAttribute('role','dialog'); modal.setAttribute('aria-modal','true');
    var obs=new MutationObserver(function(){setTimeout(syncHeaderSave,30)});
    var body=$('modalBody'); if(body) obs.observe(body,{childList:true,subtree:true});
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-action="saveKnowledgeHeader"]'); if(!b) return; var act=b.dataset.targetAction||detectSaveAction(); if(!act){toast('لا يوجد زر حفظ في هذه النافذة');return} var real=q('#modalBody [data-action="'+act+'"]'); if(real){real.click();}else{toast('زر الحفظ غير متاح الآن')}},true);
    setInterval(syncHeaderSave,800);
  }
  function ensureDashboard(){
    var nav=$('nav'); if(nav && !q('[data-route="dashboard"]',nav)){
      var b=document.createElement('button'); b.className='v84-dashboard-btn'; b.setAttribute('data-route','dashboard'); b.innerHTML='<span><b>📊</b><em>الداشبورد</em></span><small></small>'; nav.insertBefore(b,nav.children[1]||null);
    }
    var dock=q('.quick-dock .dock-right'); if(dock && !q('[data-route="dashboard"]',dock)){
      var d=document.createElement('button'); d.className='btn secondary mini'; d.setAttribute('data-route','dashboard'); d.textContent='الداشبورد'; dock.insertBefore(d,dock.children[1]||null);
    }
  }
  function pct(x){var total=Number(x.totalUnits||x.totalPages||x.totalMinutes||0), done=Number(x.currentUnit||x.currentPage||x.currentMinute||0); if(total>0) return Math.max(0,Math.min(100,Math.round(done/total*100))); if(x.status==='done'||x.finished) return 100; return Math.max(0,Math.min(100,Number(x.progress||0)))}
  function dashboardHTML(){
    var st=state(); ['tasks','actions','goals','knowledge','reviews','focusSessions','wins'].forEach(function(k){if(!Array.isArray(st[k])) st[k]=[]});
    var tasks=st.tasks.filter(function(x){return x.status!=='done'&&x.status!=='archived'}), acts=st.actions.filter(function(x){return x.status!=='done'&&x.status!=='archived'}), goals=st.goals.filter(function(x){return x.status!=='archived'}), know=st.knowledge.filter(function(x){return x.status!=='archived'});
    var done=(st.tasks.concat(st.actions)).filter(function(x){return x.status==='done'||x.done}).length;
    var kavg=know.length?Math.round(know.reduce(function(a,k){return a+pct(k)},0)/know.length):0;
    var gavg=goals.length?Math.round(goals.reduce(function(a,g){return a+Number(g.progress||0)},0)/goals.length):0;
    var current=tasks[0]||acts[0];
    function row(x,icon,act){return '<div class="v782-row"><div class="v782-icon">'+icon+'</div><div><b>'+esc(x.title||x.name||'عنصر')+'</b><small>'+esc(x.area||x.project||x.type||'')+'</small></div>'+(act?'<button class="btn secondary mini" data-action="'+act+'" data-id="'+esc(x.id||'')+'">تعديل</button>':'')+'</div>'}
    return '<div class="v782-dashboard"><section class="v782-hero"><div class="v782-hero-head"><div><span class="v782-kicker">📊 Dashboard</span><h2>مركز قيادة اليوم</h2><p>صورة سريعة من المهام والأهداف والمعرفة والتركيز.</p></div><div class="v782-actions"><button class="btn" data-action="openFocus">▶ ابدأ تركيز</button><button class="btn secondary" data-action="addTask">+ مهمة</button><button class="btn secondary" data-action="addKnowledge">+ معرفة</button></div></div><div class="v782-command"><small>الأولوية الآن</small><b>'+esc(current?current.title:'أضف مهمة واحدة تبدأ بها اليوم')+'</b></div></section><section class="v782-kpis"><div class="v782-kpi"><div class="v782-kpi-top"><small>المهام المفتوحة</small><i>✅</i></div><strong>'+String(tasks.length+acts.length)+'</strong><p>'+done+' مكتمل</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>الأهداف</small><i>🎯</i></div><strong>'+goals.length+'</strong><p>متوسط '+gavg+'%</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>المعرفة</small><i>🧠</i></div><strong>'+know.length+'</strong><p>متوسط التقدم '+kavg+'%</p></div><div class="v782-kpi"><div class="v782-kpi-top"><small>التركيز</small><i>⏳</i></div><strong>'+st.focusSessions.length+'</strong><p>جلسات مسجلة</p></div></section><section class="v782-grid"><div class="card v782-panel"><div class="v782-head"><div><h3>المطلوب الآن</h3><p>أهم المهام والإجراءات المفتوحة.</p></div></div><div class="v782-list">'+(tasks.concat(acts).slice(0,6).map(function(x){return row(x,'⚡',x.project?'v69EditTask':'editAction')}).join('')||'<div class="v782-empty">لا توجد مهام مفتوحة.</div>')+'</div></div><div class="card v782-panel"><div class="v782-head"><div><h3>المعرفة للاستكمال</h3><p>أقرب محتوى لمتابعته.</p></div></div><div class="v782-list">'+(know.filter(function(k){return pct(k)<100}).slice(0,5).map(function(k){return row(k,'🧠','openKnowledgePlayer')}).join('')||'<div class="v782-empty">لا توجد معرفة قيد المتابعة.</div>')+'</div></div></section></div>';
  }
  function openDashboard(){var view=$('view'); if(!view) return; view.innerHTML=dashboardHTML(); setTitle('الداشبورد','نظرة موحدة على المشروع بالكامل'); qa('#nav [data-route]').forEach(function(b){b.classList.toggle('active',b.dataset.route==='dashboard')});}
  function addActionHandlers(){
    var A=Actions();
    A.saveKnowledgeHeader=function(){var act=$('modalHeaderSaveBtn')&&$('modalHeaderSaveBtn').dataset.targetAction||detectSaveAction(); var b=act&&q('#modalBody [data-action="'+act+'"]'); if(b) b.click(); else toast('زر الحفظ غير متاح')};
    A.v821PdfNavPrev=A.v821PdfNavNext=A.v821PdfZoomOut=A.v821PdfZoomIn=A.v821ReaderFullscreenOn=A.v821ReaderFullscreenOff=function(id,btn){
      var frame=q('#modalBody iframe');
      if(!frame){toast('افتح الكتاب أولاً');return}
      var act=btn&&btn.dataset&&btn.dataset.action;
      if(act==='v821ReaderFullscreenOn'){var box=q('#modal .modal-box'); if(box&&box.requestFullscreen) box.requestFullscreen(); toast('تم تكبير القارئ'); return}
      if(act==='v821ReaderFullscreenOff'){if(document.fullscreenElement) document.exitFullscreen(); return}
      if(act==='v821PdfZoomIn'||act==='v821PdfZoomOut'){var cur=Number(frame.dataset.zoom||1); cur += act==='v821PdfZoomIn'?0.1:-0.1; cur=Math.max(.6,Math.min(1.8,cur)); frame.dataset.zoom=cur; frame.style.transform='scale('+cur+')'; frame.style.transformOrigin='top center'; frame.style.height=(60/cur)+'vh'; toast('تم تعديل التكبير'); return}
      toast('تنقل PDF يعتمد على القارئ المدمج داخل المتصفح');
    };
    A.v84SaveSplash=function(){var st=state(); st.settings=st.settings||{}; st.settings.splashText=getVal('v84_splash_text')||'Mogahed OS'; var f=$('v84_splash_img')&&$('v84_splash_img').files[0]; function done(img){if(img) st.settings.splashImage=img; save(); toast('تم حفظ شاشة البداية'); closeModal(); render()} if(f){var r=new FileReader(); r.onload=function(){done(r.result)}; r.readAsDataURL(f)}else done(st.settings.splashImage||'')};
    A.v84OpenSplashSettings=function(){var st=state(), set=st.settings||{}; var body='<label>الكلمة/الاسم في شاشة البداية</label><input id="v84_splash_text" value="'+esc(set.splashText||((st.profile||{}).name)||'Mogahed OS')+'"><label>صورة شاشة البداية</label><input type="file" id="v84_splash_img" accept="image/*"><p class="muted">لو اخترت صورة ستظهر بدل الحرف في شاشة التحميل.</p><button class="btn" data-action="v84SaveSplash">حفظ</button>'; try{window.MogahedOSX.openModal('تخصيص شاشة البداية',body)}catch(e){var m=$('modal'),t=$('modalTitle'),b=$('modalBody'); if(t)t.textContent='تخصيص شاشة البداية'; if(b)b.innerHTML=body; if(m)m.classList.add('open')}};
    A.v84Dashboard=openDashboard;
  }
  function patchRoutes(){
    document.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-route="dashboard"]'); if(!b) return; e.preventDefault(); e.stopImmediatePropagation(); openDashboard();},true);
  }
  function patchSettingsCard(){
    var r=(api().getRoute&&api().getRoute())||''; if(r!=='settings') return;
    var view=$('view'); if(!view||q('.v84-splash-settings-card',view)) return;
    view.insertAdjacentHTML('afterbegin','<div class="card v84-splash-settings-card"><h3>شاشة البداية</h3><p class="muted">اختيار صورة أو كلمة تظهر عند فتح التطبيق بدل حرف م.</p><button class="btn secondary" data-action="v84OpenSplashSettings">تخصيص شاشة البداية</button></div>');
  }
  function enhanceToasts(){var t=$('toast'); if(t) t.classList.add('v84-toast-success')}
  function boot(){enhanceSplash(); patchModal(); addActionHandlers(); patchRoutes(); enhanceToasts(); ensureDashboard(); setTimeout(function(){ensureDashboard();syncHeaderSave();patchSettingsCard()},400); setInterval(function(){ensureDashboard();patchSettingsCard()},1200)}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
