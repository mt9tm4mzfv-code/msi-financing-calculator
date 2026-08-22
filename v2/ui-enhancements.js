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
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
