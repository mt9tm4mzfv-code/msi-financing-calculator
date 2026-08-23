/* MSI V2 iOS/Safari clipboard compatibility fix. */
(function(){
  'use strict';

  const INVISIBLE='\u2066';

  function protectLeadingColon(text){
    const s=String(text||'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    return s.replace(/^([^\s\n][^\n]*?):/,function(_,prefix){
      return prefix+INVISIBLE+':';
    });
  }

  function show(msg){
    if(typeof showToast==='function')showToast(msg);
  }

  function fallbackCopy(text){
    const ta=document.createElement('textarea');
    ta.value=text;
    ta.setAttribute('readonly','');
    ta.style.position='fixed';
    ta.style.top='-1000px';
    ta.style.left='-1000px';
    ta.style.opacity='0';
    ta.style.fontSize='16px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    ta.setSelectionRange(0,ta.value.length);
    let copied=false;
    try{copied=document.execCommand('copy')}catch(e){}
    ta.remove();
    if(copied)show('✓ Result copied successfully.');
    else show('Copy failed. Please try again.');
    return copied;
  }

  function writeProtected(text){
    const clean=protectLeadingColon(text);
    try{
      if(navigator.clipboard&&navigator.clipboard.write&&typeof ClipboardItem!=='undefined'){
        const blob=new Blob([clean],{type:'text/plain'});
        const item=new ClipboardItem({'text/plain':blob});
        navigator.clipboard.write([item]).then(function(){
          show('✓ Result copied successfully.');
        }).catch(function(){
          fallbackCopy(clean);
        });
        return;
      }
    }catch(e){}
    fallbackCopy(clean);
  }

  function overrideDetailed(){
    if(typeof window.copyResult!=='function')return;
    window.copyResult=function(n){
      const text=(typeof copyStore!=='undefined')?copyStore[n]:'';
      if(!text){alert('Compute first.');return;}
      writeProtected(text);
    };
  }

  function overrideSimple(){
    if(typeof window.copySimple!=='function')return;
    window.copySimple=function(n){
      let text='';
      try{if(typeof simpleCopyText==='function')text=simpleCopyText(n)}catch(e){}
      if(!text){alert('Compute first.');return;}
      writeProtected(text);
    };
  }

  function init(){
    overrideDetailed();
    overrideSimple();
    setTimeout(function(){overrideDetailed();overrideSimple()},100);
    setTimeout(function(){overrideDetailed();overrideSimple()},500);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
