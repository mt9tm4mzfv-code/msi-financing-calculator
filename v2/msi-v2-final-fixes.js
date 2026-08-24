/* MSI V2 — FINAL UI / SIMPLE COPY REPAIR */
(function(){
  'use strict';

  const TERMS=[
    {m:84,y:'7 Years (84 Months)',r:78},
    {m:72,y:'6 Years (72 Months)',r:67},
    {m:60,y:'5 Years (60 Months)',r:57},
    {m:48,y:'4 Years (48 Months)',r:49},
    {m:36,y:'3 Years (36 Months)',r:39},
    {m:24,y:'2 Years (24 Months)',r:23}
  ];
  const KEY='msi-v2-interest-rates';

  function rates(){
    const defaults=Object.fromEntries(TERMS.map(t=>[t.m,t.r]));
    let saved={};
    try{saved=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){}
    window.MSI_INTEREST_RATES=Object.assign({},defaults,saved,window.MSI_INTEREST_RATES||{});
    return window.MSI_INTEREST_RATES;
  }
  function getRate(m){
    const r=rates()[Number(m)];
    return Number.isFinite(Number(r))?Number(r):(TERMS.find(t=>t.m===Number(m))?.r||0);
  }
  function read(id){
    const el=document.getElementById(id);
    const n=Number(String(el?.value??'').replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }
  function peso(v){return '₱'+Math.round(v).toLocaleString('en-PH')}
  function variant(n){return (document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle'}
  function baseRevenue(srp,opdp,bdp,dir){return srp*(1-bdp/100)*(1+dir/100)+opdp}
  function monthly(adjusted,m){return Math.ceil(adjusted*(1+getRate(m)/100)/m-1e-10)}
  function decodePercentEncoded(text){
    let s=String(text??'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    if(!/%(?:20|0A|0D|[89A-Fa-f][0-9A-Fa-f])/i.test(s))return s;
    try{return decodeURIComponent(s)}catch(e){}
    return s.replace(/%(?:[0-9A-Fa-f]{2})+/g,seq=>{try{return decodeURIComponent(seq)}catch(e){return seq}});
  }
  function cleanCopyText(text){return decodePercentEncoded(text).replace(/\u2066/g,'')}

  function copyPlain(text,msg){
    const clean=cleanCopyText(text);
    if(navigator.clipboard?.writeText){
      navigator.clipboard.writeText(clean).then(()=>toast(msg)).catch(()=>fallbackCopy(clean,msg));
      return;
    }
    fallbackCopy(clean,msg);
  }
  function fallbackCopy(text,msg){
    const ta=document.createElement('textarea');
    ta.value=text;ta.setAttribute('readonly','');ta.style.position='fixed';ta.style.left='-10000px';ta.style.top='-10000px';ta.style.opacity='0';ta.style.fontSize='16px';
    document.body.appendChild(ta);ta.focus();ta.select();ta.setSelectionRange(0,ta.value.length);
    let ok=false;try{ok=document.execCommand('copy')}catch(e){}ta.remove();
    toast(ok?msg:'Copy failed. Please try again.');
  }
  function toast(msg){const t=document.getElementById('toast');if(!t)return;t.textContent=msg;t.classList.add('show');setTimeout(()=>t.classList.remove('show'),1800)}

  function buildSimpleText(n){
    const v=decodePercentEncoded(variant(n));
    const srp=read(`c${n}_srp`),opdp=read(`c${n}_opdp`),bdp=read(`c${n}_bdp`),dir=read(`c${n}_dir`);
    if(n===1){
      const dp=read('c1_dp'),adjusted=(baseRevenue(srp,opdp,bdp,dir)-dp)/(1+dir/100);
      return [`Unit: ${v}`,`Desired DP: ${peso(dp)}`,`Unit SRP: ${peso(srp)}`,'','Monthly Amortization:',...TERMS.map(t=>`${t.y} — ${peso(monthly(adjusted,t.m))}`),'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
    }
    if(n===2){
      const pct=read('c2_pct'),dp=opdp+(1+dir/100)*srp*(pct/100-bdp/100),adjusted=(baseRevenue(srp,opdp,bdp,dir)-dp)/(1+dir/100);
      return [`Unit: ${v}`,`Desired DP: ${pct}%`,`DP Amount: ${peso(dp)}`,`Unit SRP: ${peso(srp)}`,'','Monthly Amortization:',...TERMS.map(t=>`${t.y} — ${peso(monthly(adjusted,t.m))}`),'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
    }
    const target=read('c3_monthly'),m=Number(document.getElementById('c3_term')?.value),rb=baseRevenue(srp,opdp,bdp,dir),dp=Math.ceil(rb-target*m*(1+dir/100)/(1+getRate(m)/100)-1e-10),term=TERMS.find(t=>t.m===m);
    return [`Unit Model: ${v}`,`Loan Term: ${term?.y||m+' Months'}`,`Target Monthly: ${peso(target)}`,`Required DP: ${peso(dp)}`,`Unit SRP: ${peso(srp)}`,`Bank Interest Rate: ${getRate(m)}%`,'','🦾 Powered by MSI Framework™ 🚀','JUDE DANTE PINEDA'].join('\n');
  }

  function renderBanner(){
    const b=document.getElementById('msi-interest-banner');
    if(!b)return;
    b.innerHTML='<div class="msi-final-rate-title">Bank Interest Rate (%)</div><div class="msi-final-rate-grid"></div>';
    const grid=b.querySelector('.msi-final-rate-grid');
    TERMS.forEach(t=>{
      const tile=document.createElement('div');tile.className='msi-final-rate-tile';
      tile.innerHTML=`<div class="msi-final-rate-term">${t.y.replace(/ \(\d+ Months\)$/,'')}</div><input class="msi-final-rate-input" type="number" min="0" max="100" step="0.01" value="${getRate(t.m)}" data-msi-interest-term="${t.m}" aria-label="${t.y} bank interest rate">`;
      const input=tile.querySelector('input');
      input.addEventListener('input',()=>{
        const n=Math.max(0,Math.min(100,Number(input.value)));
        if(!Number.isFinite(n))return;
        window.MSI_INTEREST_RATES[t.m]=n;
        try{localStorage.setItem(KEY,JSON.stringify(window.MSI_INTEREST_RATES))}catch(e){}
        document.querySelectorAll(`[data-msi-interest-term="${t.m}"]`).forEach(other=>{if(other!==input)other.value=n});
        syncRates();refreshCalculations();
      });
      grid.appendChild(tile);
    });
  }
  function syncRates(){
    [1,2,3].forEach(n=>{const m=Number(document.getElementById(`c${n}_term`)?.value),tr=document.getElementById(`c${n}_tr`);if(tr)tr.value=getRate(m)});
  }
  function refreshCalculations(){
    syncRates();
    [1,2,3].forEach(n=>{
      const fn=window[`calculate${n}`];
      if(typeof fn==='function'&&document.getElementById(`c${n}_results`)?.classList.contains('show')){try{fn()}catch(e){}}
    });
    document.querySelectorAll('.msi-simple-results.show, .simple-results.show').forEach(out=>{
      const m=out.id?.match(/^c([123])_/);if(m)updateSimpleDisplay(Number(m[1]));
    });
  }
  function updateSimpleDisplay(n){
    const card=document.querySelector(`.calculator-${n}`);if(!card)return;
    const content=card.querySelector('.msi-simple-results.show .simple-content, .simple-results.show .simple-content');
    if(!content)return;
    content.textContent=buildSimpleText(n);
  }

  function installClipboardInterceptors(){
    document.addEventListener('click',event=>{
      const simpleCopy=event.target.closest('.simple-copy');
      if(simpleCopy){
        const simple=simpleCopy.closest('.simple-results');
        const match=simple?.id?.match(/^c([123])_simple_results$/);
        if(match){event.preventDefault();event.stopImmediatePropagation();copyPlain(buildSimpleText(Number(match[1])),'Simple computation copied.');return;}
      }
      const copySimple=event.target.closest('[data-msi-simple-copy]');
      if(copySimple){
        const n=Number(copySimple.getAttribute('data-msi-simple-copy'));
        if(n){event.preventDefault();event.stopImmediatePropagation();copyPlain(buildSimpleText(n),'Simple computation copied.');return;}
      }
    },true);
  }

  function installStyle(){
    if(document.getElementById('msi-final-fixes-style'))return;
    const s=document.createElement('style');s.id='msi-final-fixes-style';s.textContent=`
      #msi-interest-banner{width:min(760px,calc(100% - 24px))!important;max-width:760px!important;box-sizing:border-box!important;margin:16px auto 14px!important;padding:10px!important;border:1px solid #374151!important;border-radius:16px!important;background:#111827!important;color:#d1d5db!important;box-shadow:0 8px 18px rgba(0,0,0,.28),inset 0 1px 0 rgba(255,255,255,.04)!important;overflow:hidden!important}
      #msi-interest-banner .msi-final-rate-title{background:#fff45c;color:#111827;border:1px solid #d4b900;border-radius:10px;padding:9px 8px;font-size:17px;font-weight:950;line-height:1.15;text-align:center;box-shadow:0 4px 8px rgba(0,0,0,.24),inset 0 1px 0 rgba(255,255,255,.85),inset 0 -2px 0 rgba(120,90,0,.18)}
      #msi-interest-banner .msi-final-rate-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px;margin-top:8px}
      #msi-interest-banner .msi-final-rate-tile{min-width:0;padding:7px 4px 8px;text-align:center;background:#111827;border:1px solid #374151;border-radius:10px;box-shadow:0 4px 8px rgba(0,0,0,.25),inset 0 1px 0 rgba(255,255,255,.04)}
      #msi-interest-banner .msi-final-rate-term{color:#d1d5db;font-size:11px;font-weight:900;line-height:1.1;white-space:nowrap}
      #msi-interest-banner .msi-final-rate-input{display:block;width:100%;min-width:0;margin:6px 0 0;padding:6px 2px;border:1px solid #4b5563;border-radius:8px;background:#1f2937;color:#d1d5db;text-align:center;font:inherit;font-size:14px;font-weight:950;line-height:1;box-shadow:inset 0 2px 4px rgba(0,0,0,.25),0 2px 3px rgba(0,0,0,.12);outline:none}
      #msi-interest-banner .msi-final-rate-input:focus{border-color:#fff45c;box-shadow:0 0 0 2px rgba(255,244,92,.18),inset 0 2px 4px rgba(0,0,0,.25)}
      @media(max-width:600px){#msi-interest-banner{width:calc(100% - 24px)!important;margin:14px auto 12px!important;padding:8px!important;border-radius:14px!important}#msi-interest-banner .msi-final-rate-title{font-size:14px;padding:8px 5px}#msi-interest-banner .msi-final-rate-grid{gap:5px;margin-top:7px}#msi-interest-banner .msi-final-rate-tile{padding:6px 2px 7px;border-radius:8px}#msi-interest-banner .msi-final-rate-term{font-size:9px}#msi-interest-banner .msi-final-rate-input{font-size:12px;padding:6px 1px;border-radius:7px}}
    `;document.head.appendChild(s);
  }

  function init(){
    installStyle();
    rates();
    renderBanner();
    syncRates();
    installClipboardInterceptors();
    window.copyResult=function(n){
      let text='';
      try{if(typeof copyStore!=='undefined')text=copyStore[n]||''}catch(e){}
      if(!text)text=buildSimpleText(n);
      copyPlain(text,'Result copied successfully.');
    };
    setTimeout(()=>{installStyle();renderBanner();syncRates()},100);
    setTimeout(()=>{renderBanner();syncRates()},500);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
