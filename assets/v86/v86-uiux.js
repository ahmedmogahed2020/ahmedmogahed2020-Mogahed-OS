/* V86 UI/UX Professional Pass — safe DOM polish after V85 */
(function(){
  'use strict';
  if(window.__MOGAHED_V86_UIUX__) return;
  window.__MOGAHED_V86_UIUX__ = true;
  function $(id){return document.getElementById(id)}
  function q(s,r){return (r||document).querySelector(s)}
  function qa(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))}
  function api(){return window.MogahedOSX||{}}
  function toast(msg){try{if(api().toast) return api().toast(msg)}catch(e){} var t=$('toast'); if(t){t.textContent=msg;t.classList.add('show');clearTimeout(t._v86);t._v86=setTimeout(function(){t.classList.remove('show')},2300)}}
  function currentRoute(){try{return api().getRoute&&api().getRoute()}catch(e){} var active=q('[data-route].active'); return active&&active.dataset&&active.dataset.route||''}
  function beautifyModal(){
    var modal=$('modal'), box=q('.modal-box'); if(!modal||!box) return;
    box.classList.add('v86-modal-box');
    var title=$('modalTitle'), actions=$('modalHeaderActions'), body=$('modalBody');
    if(title&&actions){
      var head=title.parentElement;
      if(head) head.classList.add('v86-modal-head');
    }
    var save=$('modalHeaderSaveBtn');
    var hasSave=false;
    if(body){
      hasSave=!!q('[data-action*="save" i], [data-action*="Save"], button',body);
      qa('button',body).forEach(function(b){
        var txt=(b.textContent||'').trim();
        if(/حفظ|save/i.test(txt)) hasSave=true;
        if(/إغلاق|اغلاق|close/i.test(txt)) b.classList.add('secondary');
      });
    }
    if(save){
      if(hasSave){box.classList.remove('v86-no-save'); save.style.display='inline-flex'; save.textContent='حفظ';}
      else {box.classList.add('v86-no-save'); save.style.display='none';}
    }
  }
  function polishForms(){
    qa('input,textarea,select').forEach(function(el){
      if(!el.getAttribute('autocomplete')) el.setAttribute('autocomplete','off');
    });
    qa('#modalBody button,.card button,#view button').forEach(function(b){
      var txt=(b.textContent||'').trim();
      if(/حفظ|تم|إضافة|اضافة|سجل/.test(txt) && !b.classList.contains('secondary') && !b.classList.contains('danger')) b.classList.add('v86-primary-action');
      if(/حذف|مسح|إلغاء/.test(txt)) b.classList.add('danger');
      if(/إغلاق|اغلاق|رجوع|تعديل/.test(txt)) b.classList.add('secondary');
    });
  }
  function tagView(){
    document.body.setAttribute('data-v86-route',currentRoute()||'unknown');
    var view=$('view'); if(view) view.classList.add('v86-polished-view');
    var title=$('pageTitle'); if(title && /^V46\s*Second Brain/i.test(title.textContent||'')) title.textContent='الرئيسية';
    qa('h1,h2,h3').forEach(function(h){ if(/^V46\s*Second Brain/i.test((h.textContent||'').trim())) h.style.display='none'; });
  }
  function improveMoreCards(){
    qa('.v85-more-card').forEach(function(card){
      if(card.querySelector('.v86-more-arrow')) return;
      var a=document.createElement('em'); a.className='v86-more-arrow'; a.textContent='›'; a.style.cssText='margin-inline-start:auto;font-style:normal;opacity:.55;font-size:22px'; card.appendChild(a);
    });
  }
  function safeBottomSpacing(){
    var h=0;
    qa('.bottom-nav,.bottom-bar,.mobile-nav').forEach(function(el){ if(el.offsetHeight) h=Math.max(h,el.offsetHeight); });
    if(h>0) document.documentElement.style.setProperty('--v86-bottom',Math.max(112,h+42)+'px');
  }
  function enhanceToast(){
    var styleId='v86-toast-style';
    if($(styleId)) return;
    var st=document.createElement('style'); st.id=styleId; st.textContent='.toast{position:fixed!important;left:50%!important;bottom:calc(108px + env(safe-area-inset-bottom,0px))!important;transform:translateX(-50%) translateY(14px)!important;z-index:99999!important;max-width:min(520px,calc(100vw - 28px))!important;border:1px solid rgba(255,255,255,.16)!important;background:rgba(15,23,42,.92)!important;color:#fff!important;border-radius:18px!important;padding:12px 14px!important;box-shadow:0 18px 60px rgba(0,0,0,.35)!important;backdrop-filter:blur(16px)!important;opacity:0!important;pointer-events:none!important;transition:.22s ease!important;text-align:center!important;font-weight:900!important}.toast.show{opacity:1!important;transform:translateX(-50%) translateY(0)!important}.toast:not(:empty){display:block!important;opacity:1!important;transform:translateX(-50%) translateY(0)!important}'; document.head.appendChild(st);
  }
  function installRoutePolish(){
    document.addEventListener('click',function(){setTimeout(runPolish,80);setTimeout(runPolish,450)},true);
    window.addEventListener('hashchange',function(){setTimeout(runPolish,80)});
  }
  function runPolish(){tagView(); beautifyModal(); polishForms(); improveMoreCards(); safeBottomSpacing(); enhanceToast();}
  function patchToastActionFeedback(){
    document.addEventListener('click',function(e){
      var b=e.target.closest&&e.target.closest('button,[data-action]'); if(!b) return;
      var txt=(b.textContent||'').trim(); var act=b.dataset&&b.dataset.action||'';
      if(/save|Save|حفظ/.test(act+' '+txt)) setTimeout(function(){toast('تم الحفظ بنجاح ✅')},120);
      else if(/delete|remove|حذف|مسح/.test(act+' '+txt)) setTimeout(function(){toast('تم الحذف/الإزالة ✅')},120);
      else if(/edit|update|تعديل/.test(act+' '+txt)) setTimeout(function(){toast('تم التعديل ✅')},120);
    },true);
  }
  function boot(){runPolish(); installRoutePolish(); patchToastActionFeedback(); setInterval(runPolish,1500);}
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot();
})();
