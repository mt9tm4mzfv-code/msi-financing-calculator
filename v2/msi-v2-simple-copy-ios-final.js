/* MSI V2 — FINAL Simple COPY repair for iOS SMS/Viber */
(function(){
  'use strict';

  function decodeRepeated(value){
    let s=String(value??'').replace(/\u2066/g,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    for(let i=0;i<3;i++){
      if(!/%(?:[0-9A-Fa-f]{2})/.test(s))break;
      try{
        const decoded=decodeURIComponent(s);
        if(decoded===s)break;
        s=decoded;
      }catch(e){break;}
    }
    return s.replace(/\u2066/g,'');
  }

  /*
   * iOS/Safari can treat clipboard text beginning with "Unit:" as URI-like
   * data because a leading ALPHA scheme followed by ':' is URL syntax.
   * When that happens, SMS/Viber may receive the remainder percent-encoded
   * (%20, %3A, %0A, %E2%82%82, etc.).
   *
   * The calculator's visible result is unchanged. Only the COPY RESULT
   * payload uses "Unit —" instead of "Unit:" so the clipboard payload is
   * unambiguously ordinary text.
   */
  function safeSimpleText(n){
    let text='';
    try{
      if(typeof simpleCopyText==='function')text=simpleCopyText(n);
    }catch(e){}
    if(!text){
      try{
        const card=document.querySelector(`.calculator-${n}`);
        const simple=card?.querySelector('.simple-results.show');
        const content=simple?.querySelector('.simple-content');
        text=content?.textContent||'';
      }catch(e){}
    }
    text=decodeRepeated(text);
    text=text.replace(/^Unit:\s*/,'Unit — ');
    return text;
  }

  function toast(msg){
    const t=document.getElementById('toast');
    if(!t)return;
    t.textContent=msg;
    t.classList.add('show');
    setTimeout(()=>t.classList.remove('show'),1800);
  }

  function copyIOSPlainText(text){
    const clean=String(text).replace(/\u2066/g,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');

    /* Primary path: plain text only. No ClipboardItem, no text/uri-list,
       no HTML, and no invisible URI-protection characters. */
    try{
      if(navigator.clipboard?.writeText){
        navigator.clipboard.writeText(clean).then(()=>toast('Simple computation copied.')).catch(()=>copyWithSelection(clean));
        return;
      }
    }catch(e){}
    copyWithSelection(clean);
  }

  function copyWithSelection(text){
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.setAttribute('aria-hidden','true');
    ta.style.position='fixed';
    ta.style.left='0';
    ta.style.top='0';
    ta.style.width='1px';
    ta.style.height='1px';
    ta.style.padding='0';
    ta.style.border='0';
    ta.style.opacity='0.01';
    ta.style.fontSize='16px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0,text.length);
    let copied=false;
    try{copied=document.execCommand('copy')}catch(e){}
    ta.remove();
    toast(copied?'Simple computation copied.':'Copy failed. Please try again.');
  }

  function install(){
    document.addEventListener('click',function(event){
      const button=event.target.closest('.simple-copy,[data-msi-simple-copy]');
      if(!button)return;

      let n=0;
      const explicit=button.getAttribute('data-msi-simple-copy');
      if(explicit)n=Number(explicit);
      if(!n){
        const simple=button.closest('.simple-results');
        const match=simple?.id?.match(/^c([123])_simple_results$/);
        if(match)n=Number(match[1]);
      }
      if(!n)return;

      event.preventDefault();
      event.stopImmediatePropagation();
      copyIOSPlainText(safeSimpleText(n));
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
