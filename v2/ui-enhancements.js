(function(){
  'use strict';

  function applyUI(){
    const cards = document.querySelectorAll('main > section.card');
    cards.forEach((card, i) => {
      const n = i + 1;
      if (n > 3) return;
      card.classList.add('calculator-card', `calculator-${n}`);
      const badge = card.querySelector('.badge');
      if (badge) badge.textContent = `CALCULATOR ${n}`;
      const button = card.querySelector('button.primary');
      if (button) button.textContent = 'CLICK THIS TO GENERATE COMPUTATION';
    });
    replaceVariantInputs();
    enhanceNumericInputs();
    syncHeaderHeights();
  }

  function replaceVariantInputs(){
    document.querySelectorAll('input[id$="_variant"]').forEach(input=>{
      if(input.tagName === 'TEXTAREA') return;
      const area = document.createElement('textarea');
      area.id = input.id;
      area.name = input.name || '';
      area.className = `${input.className || ''} variant-input`.trim();
      area.placeholder = input.placeholder || '';
      area.value = input.value || '';
      area.rows = 2;
      area.wrap = 'soft';
      if(input.getAttribute('aria-label')) area.setAttribute('aria-label', input.getAttribute('aria-label'));
      input.replaceWith(area);
    });
  }

  function sanitizeNumericValue(value){
    return String(value ?? '').replace(/,/g,'').trim();
  }

  function formatNumericValue(value){
    const raw = sanitizeNumericValue(value);
    if(raw === '' || raw === '-' || raw === '.') return raw;
    const match = raw.match(/^(-?)(\d*)(\.\d*)?$/);
    if(!match) return raw;
    const sign = match[1] || '';
    const integer = match[2] || '0';
    const decimal = match[3] || '';
    const grouped = integer.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',');
    return sign + grouped + decimal;
  }

  function enhanceNumericInputs(){
    document.querySelectorAll('.calculator-card input[type="number"]').forEach(input=>{
      if(input.dataset.msiNumericEnhanced === '1') return;
      input.type = 'text';
      input.inputMode = 'decimal';
      input.autocomplete = 'off';
      input.dataset.msiNumericEnhanced = '1';
      input.classList.add('numeric-input');
      input.addEventListener('focus', function(){
        this.value = sanitizeNumericValue(this.value);
        try{ this.select(); }catch(e){}
      });
      input.addEventListener('blur', function(){
        this.value = formatNumericValue(this.value);
      });
      input.value = formatNumericValue(input.value);
    });
  }

  function syncHeaderHeights(){
    document.querySelectorAll('.calculator-card').forEach(card=>{
      const section = card.querySelector('.section');
      if(!section) return;
      const height = Math.max(135, Math.ceil(section.offsetTop + 2));
      card.style.setProperty('--calc-header-height', `${height}px`);
    });
  }

  function installClipboardTransform(){
    if (!navigator.clipboard || !navigator.clipboard.writeText || navigator.clipboard.writeText.__msiWrapped) return;
    const original = navigator.clipboard.writeText.bind(navigator.clipboard);
    const wrapped = function(text){
      let output = String(text);
      output = output.replace(/\n?Estimated computation only\. Final monthly amortization remains subject to bank approval\.?/gi, '');
      output = output.replace(/\n?Estimated computation only\. Final required down payment remains subject to bank approval\.?/gi, '');
      output = output.replace(/Interest \/ TR:/g, 'Bank Interest Rate:');
      return original(output);
    };
    wrapped.__msiWrapped = true;
    navigator.clipboard.writeText = wrapped;
  }

  function init(){
    applyUI();
    installClipboardTransform();
    window.addEventListener('resize', syncHeaderHeights);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
