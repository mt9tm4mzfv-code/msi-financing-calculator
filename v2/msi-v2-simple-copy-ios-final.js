/* MSI V2 — FINAL Simple COPY repair for iOS SMS/Viber.
   Restores the previously proven V18 clipboard strategy.
   IMPORTANT: keep the visible/output format exactly as "Unit: ...".
*/
(function(){
  'use strict';
  const INVISIBLE='\u2066';
  function protectLeadingColon(text){
    const s=String(text||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    return s.replace(/^([^\s\n][^\n]*?):/,function(_,prefix){return prefix+INVISIBLE+':';});
  }
  function toast(msg){
    if(typeof showToast==='function')showToast(msg);
    else{const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}}
  }
  function simpleTextForCopy(n){
    let text='';
    try{if(typeof simpleCopyText==='function')text=simpleCopyText(n)}catch(e){}
    if(!text){try{const simple=document.getElementById(`c${n}_simple_results`);text=simple?.querySelector('.simple-content')?.textContent||''}catch(e){}}
    return String(text||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
  }
  function fallbackCopy(text){
    const ta=document.createElement('textarea');ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.top='-1000px';ta.style.left='-1000px';ta.style.opacity='0';ta.style.fontSize='16px';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);let copied=false;try{copied=document.execCommand('copy')}catch(e){}ta.remove();toast(copied?'✓ Result copied successfully.':'Copy failed. Please try again.');return copied;
  }
  /* Same mechanism as the proven V18 fix: keep "Unit:" and protect only the clipboard colon. */
  function writeProtected(text){
    const clean=protectLeadingColon(text);
    try{
      if(navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem!=='undefined'){
        const blob=new Blob([clean],{type:'text/plain'});
        const item=new ClipboardItem({'text/plain':blob});
        navigator.clipboard.write([item]).then(()=>toast('✓ Result copied successfully.')).catch(()=>fallbackCopy(clean));
        return;
      }
    }catch(e){}
    fallbackCopy(clean);
  }
  function install(){
    document.addEventListener('click',function(event){
      const button=event.target.closest('.simple-copy,[data-msi-simple-copy]');if(!button)return;
      let n=Number(button.getAttribute('data-msi-simple-copy')||0);
      if(!n){const simple=button.closest('.simple-results');const match=simple?.id?.match(/^c([123])_simple_results$/);if(match)n=Number(match[1]);}
      if(!n)return;
      const text=simpleTextForCopy(n);
      event.preventDefault();event.stopImmediatePropagation();
      if(!text){alert('Compute first.');return;}
      writeProtected(text);
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
