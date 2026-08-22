/* MSI V2 result/output enhancements. Preserves the existing calculation engine. */
(function(){
  'use strict';

  function moneyFromText(text){
    const n = Number(String(text || '').replace(/[^0-9.-]/g,''));
    return Number.isFinite(n) ? n : 0;
  }

  function setResultLabel(n, oldLabel, newLabel){
    const results = document.getElementById(`c${n}_results`);
    if(!results) return;
    results.querySelectorAll('.result span:first-child').forEach(el=>{
      if(el.textContent.trim() === oldLabel) el.textContent = newLabel;
    });
  }

  function addOfficialPromoRow(n){
    const results = document.getElementById(`c${n}_results`);
    if(!results || results.querySelector('.msi-official-promo-row')) return;
    const srpRow = Array.from(results.querySelectorAll('.result')).find(row=>{
      const label = row.querySelector('span:first-child');
      return label && label.textContent.trim() === 'Unit SRP';
    });
    if(!srpRow) return;
    const row = document.createElement('div');
    row.className = 'result msi-official-promo-row';
    row.innerHTML = `<span>Official Promo DP</span><span id="c${n}r_opdp" class="money">—</span>`;
    srpRow.insertAdjacentElement('afterend', row);
  }

  function updateMiddleMenu(n, dpAmount){
    addOfficialPromoRow(n);
    setResultLabel(n, "Client's Desired DP", 'Client Down Payment Amount');
    setResultLabel(n, 'Derived DP Amount', 'Client Down Payment Amount');
    setResultLabel(n, 'Client Net Down Payment', 'Client Net Down Payment Amount');
    setResultLabel(n, 'Additional White Cashout', 'Additional Cashout for White Pearl');
    setResultLabel(n, 'TR', 'Bank Interest Rate');

    const opdp = num(`c${n}_opdp`);
    const opdpEl = document.getElementById(`c${n}r_opdp`);
    if(opdpEl) opdpEl.textContent = peso(opdp);

    const white = num(`c${n}_white`);
    const net = dpAmount + white;
    const netEl = document.getElementById(`c${n}r_netdp`);
    if(netEl) netEl.textContent = peso(net);
  }

  function refreshCopy(n, dpAmount){
    if(typeof copyStore === 'undefined' || !copyStore[n]) return;
    const white = num(`c${n}_white`);
    const net = dpAmount + white;
    const opdp = num(`c${n}_opdp`);
    const variant = (document.getElementById(`c${n}_variant`)?.value || 'Vehicle').trim() || 'Vehicle';
    let text = String(copyStore[n]);

    text = text.replace(/^.*\nClient's Desired Down Payment:/m, `Unit Model: ${variant}\nClient's Desired Down Payment:`);
    text = text.replace(/^.*\nClient's Desired Down Payment Percentage:/m, `Unit Model: ${variant}\nClient's Desired Down Payment Percentage:`);
    text = text.replace(/^.*\nTarget Monthly Amortization:/m, `Unit Model: ${variant}\nTarget Monthly Amortization:`);
    text = text.replace(/\nUnit SRP:/, `\nOfficial Promo DP: ${peso(opdp)}\nUnit SRP:`);
    text = text.replace(/Client Net Down Payment: ₱[0-9,.-]+/g, `Client Net Down Payment: ${peso(net)}`);
    text = text.replace(/Interest \/ TR:/g, 'Bank Interest Rate:');
    text = text.replace(/\n?Estimated computation only\. Final monthly amortization remains subject to bank approval\.?/gi, '');
    text = text.replace(/\n?Estimated computation only\. Final required down payment remains subject to bank approval\.?/gi, '');

    copyStore[n] = text.trim();
  }

  function normalizeNumericInputs(n){
    document.querySelectorAll(`#c${n}_results`).forEach(()=>{});
    document.querySelectorAll(`.calculator-${n} input.numeric-input`).forEach(input=>{
      input.value = String(input.value || '').replace(/,/g,'');
    });
  }

  function formatNumericInputs(n){
    document.querySelectorAll(`.calculator-${n} input.numeric-input`).forEach(input=>{
      const raw = String(input.value || '').replace(/,/g,'').trim();
      if(raw === '' || raw === '-' || raw === '.') return;
      const match = raw.match(/^(-?)(\d*)(\.\d*)?$/);
      if(!match) return;
      const sign = match[1] || '';
      const integer = match[2] || '0';
      const decimal = match[3] || '';
      input.value = sign + integer.replace(/^0+(?=\d)/,'').replace(/\B(?=(\d{3})+(?!\d))/g,',') + decimal;
    });
  }

  function wrapCalculators(){
    if(typeof calculate1 === 'function' && !calculate1.__msiResultWrapped){
      const original = calculate1;
      const wrapped = function(){
        normalizeNumericInputs(1);
        original();
        formatNumericInputs(1);
        const dp = num('c1_dp');
        updateMiddleMenu(1, dp);
        refreshCopy(1, dp);
      };
      wrapped.__msiResultWrapped = true;
      window.calculate1 = wrapped;
    }

    if(typeof calculate2 === 'function' && !calculate2.__msiResultWrapped){
      const original = calculate2;
      const wrapped = function(){
        normalizeNumericInputs(2);
        original();
        formatNumericInputs(2);
        const dp = moneyFromText(document.getElementById('c2r_dp')?.textContent);
        updateMiddleMenu(2, dp);
        refreshCopy(2, dp);
      };
      wrapped.__msiResultWrapped = true;
      window.calculate2 = wrapped;
    }

    if(typeof calculate3 === 'function' && !calculate3.__msiResultWrapped){
      const original = calculate3;
      const wrapped = function(){
        normalizeNumericInputs(3);
        original();
        formatNumericInputs(3);
        const dp = moneyFromText(document.getElementById('c3r_dp')?.textContent);
        updateMiddleMenu(3, dp);
        refreshCopy(3, dp);
      };
      wrapped.__msiResultWrapped = true;
      window.calculate3 = wrapped;
    }
  }

  function init(){
    wrapCalculators();
    [1,2,3].forEach(n=>{
      addOfficialPromoRow(n);
      setResultLabel(n, "Client's Desired DP", 'Client Down Payment Amount');
      setResultLabel(n, 'Derived DP Amount', 'Client Down Payment Amount');
      setResultLabel(n, 'Client Net Down Payment', 'Client Net Down Payment Amount');
      setResultLabel(n, 'Additional White Cashout', 'Additional Cashout for White Pearl');
      setResultLabel(n, 'TR', 'Bank Interest Rate');
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true});
  else init();
})();
