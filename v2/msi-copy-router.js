/* MSI V2 — authoritative clipboard router */
(function(){
'use strict';
function toast(msg){const t=document.getElementById('toast');if(t){t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}}
function clean(text){return String(text??'').replace(/[\u2066\u200B\u200C\u200D\uFEFF]/g,'').replace(/\r\n/g,'\n').replace(/\r/g,'\n')}
function write(text,msg){const value=clean(text);const fallback=()=>{const ta=document.createElement('textarea');ta.value=value;ta.readOnly=true;ta.style.position='fixed';ta.style.left='-10000px';ta.style.top='-10000px';ta.style.opacity='0';document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();toast(ok?msg:'Copy failed. Please try again.')};try{if(navigator.clipboard&&typeof navigator.clipboard.writeText==='function'){navigator.clipboard.writeText(value).then(()=>toast(msg)).catch(fallback);return}}catch(e){}fallback()}
function number(button){const simple=button.closest('.simple-results');const a=simple?.id?.match(/^c([123])_simple_results$/);if(a)return Number(a[1]);const card=button.closest('.calculator-card');const b=card?.className?.match(/calculator-([123])\b/);return b?Number(b[1]):0}
function detailed(n){const text=window.copyStore?.[n];if(!text){alert('Compute the detailed computation first.');return}write(text,'Detailed computation copied.')}
function simple(n,button){let text='';try{if(typeof window.simpleCopyText==='function')text=window.simpleCopyText(n)}catch(e){}if(!text&&button)text=button.closest('.simple-results')?.querySelector('.simple-content')?.innerText||'';if(!text){alert('Generate the simple computation first.');return}write(text,'Simple computation copied.')}
window.copyResult=n=>detailed(Number(n));
window.copySimple=n=>simple(Number(n));
window.addEventListener('click',function(e){const b=e.target?.closest?.('button');if(!b)return;if(b.textContent.trim().replace(/\s+/g,' ').toUpperCase()!=='COPY RESULT')return;const n=number(b);if(!n)return;e.preventDefault();e.stopImmediatePropagation();if(b.classList.contains('simple-copy')||b.closest('.simple-results'))simple(n,b);else detailed(n)},true);
})();