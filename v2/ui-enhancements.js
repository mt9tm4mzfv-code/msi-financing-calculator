(function(){
  'use strict';

  function formatNumber(value){
    const raw=String(value??'').replace(/,/g,'').trim();
    if(raw===''||raw==='-'||raw==='. ') return raw;
    if(!/^-?\d*(\.\d*)?$/.test(raw)) return value;
    const parts=raw.split('.');
    const sign=parts[0].startsWith('-')?'-':'';
    const integer=parts[0].replace('-','')||'0';
    const grouped=integer.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');
    return sign+grouped+(parts.length>1?'.'+parts[1]:'');
  }

  function stripCommas(value){return String(value??'').replace(/,/g,'').trim()}

  function replaceVariantInputs(){
    document.querySelectorAll('input[id$="_variant"]').forEach(input=>{
      if(input.dataset.msiVariantEnhanced==='1') return;
      const area=document.createElement('textarea');
      area.id=input.id;
      area.name=input.name||'';
      area.className=(input.className||'')+' variant-input';
      area.placeholder=input.placeholder||'';
      area.value=input.value||'';
      area.rows=2;
      area.wrap='soft';
      area.dataset.msiVariantEnhanced='1';
      input.replaceWith(area);
    });
  }

  function replaceNumericInputs(){
    document.querySelectorAll('input[type="number"]').forEach(input=>{
      if(input.dataset.msiNumericEnhanced==='1') return;
      const text=document.createElement('input');
      for(const attr of input.getAttributeNames()){
        if(attr==='type'||attr==='value') continue;
        text.setAttribute(attr,input.getAttribute(attr));
      }
      text.type='text';
      text.value=formatNumber(input.value);
      text.inputMode='decimal';
      text.autocomplete='off';
      text.dataset.msiNumericEnhanced='1';
      text.classList.add('numeric-input');
      input.replaceWith(text);
      text.addEventListener('focus',function(){this.value=stripCommas(this.value)});
      text.addEventListener('blur',function(){this.value=formatNumber(this.value)});
    });
  }

  function normalizeNumericInputs(){
    document.querySelectorAll('.numeric-input').forEach(input=>{input.value=stripCommas(input.value)});
  }

  function formatNumericInputs(){
    document.querySelectorAll('.numeric-input').forEach(input=>{input.value=formatNumber(input.value)});
  }

  function applyCalculatorClasses(){
    document.querySelectorAll('main > section.card').forEach((card,i)=>{
      if(i>=3) return;
      const n=i+1;
      card.classList.add('calculator-card','calculator-'+n);
    });
  }

  function updatePrimaryButtons(){
    document.querySelectorAll('.calculator-card').forEach((card,i)=>{
      const button=card.querySelector('button.primary');
      if(!button) return;
      button.textContent=i===2?'CLICK TO GENERATE COMPUTATION':'CLICK TO GENERATE COMPUTATION';
      button.setAttribute('aria-label','Click to generate computation');
    });
  }

  function syncHeaderHeights(){
    document.querySelectorAll('.calculator-card').forEach(card=>{
      const title=card.querySelector('.section-title');
      if(!title) return;
      const cardRect=card.getBoundingClientRect();
      const titleRect=title.getBoundingClientRect();
      const height=Math.max(155,Math.ceil(titleRect.top-cardRect.top-10));
      card.style.setProperty('--calc-header-height',height+'px');
    });
  }

  function placeLogout(){
    const buttons=[...document.querySelectorAll('button')].filter(b=>b.textContent.trim().toUpperCase()==='LOG OUT');
    buttons.forEach(button=>{
      const holder=button.parentElement||button;
      holder.classList.add('msi-mobile-logout');
    });
  }

  function wrapCalculators(){
    ['calculate1','calculate2','calculate3'].forEach(name=>{
      const fn=window[name];
      if(typeof fn!=='function'||fn.__msiWrapped) return;
      const wrapped=function(){
        normalizeNumericInputs();
        const result=fn.apply(this,arguments);
        formatNumericInputs();
        syncHeaderHeights();
        return result;
      };
      wrapped.__msiWrapped=true;
      window[name]=wrapped;
    });
  }

  function init(){
    applyCalculatorClasses();
    replaceVariantInputs();
    replaceNumericInputs();
    updatePrimaryButtons();
    placeLogout();
    wrapCalculators();
    syncHeaderHeights();
    window.addEventListener('resize',syncHeaderHeights);
    window.addEventListener('orientationchange',()=>setTimeout(syncHeaderHeights,100));
    setTimeout(()=>{wrapCalculators();placeLogout();updatePrimaryButtons();syncHeaderHeights()},50);
    setTimeout(()=>{wrapCalculators();placeLogout();updatePrimaryButtons();syncHeaderHeights()},500);
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init,{once:true});
  else init();
})();
