/* MSI V2.1 — Interest Rate UI + Clipboard Mirror Patch */
(function(){
  'use strict';

  const COPY_RESULT_FOOTER=window.MSI_COPY_RESULT_FOOTER||'Estimated computation only. Subject to change without prior notice.\n\n🦾 Powered by MSI Framework™ 🚀\nJUDE DANTE PINEDA';
  window.MSI_COPY_RESULT_FOOTER=COPY_RESULT_FOOTER;

  const ORDER=[84,72,60,48,36,24];
  const TERMS={84:'7 Years (84 Months)',72:'6 Years (72 Months)',60:'5 Years (60 Months)',48:'4 Years (48 Months)',36:'3 Years (36 Months)',24:'2 Years (24 Months)'};
  const FALLBACK={84:78,72:67,60:57,48:49,36:42,24:23};

  function rate(months){
    const m=Number(months);
    const v=window.MSI_GET_INTEREST_RATE?window.MSI_GET_INTEREST_RATE(m):window.MSI_INTEREST_RATES?.[m];
    const n=Number(v);
    return Number.isFinite(n)?n:FALLBACK[m];
  }
  function read(id){
    const el=document.getElementById(id);
    const n=Number(String(el?.value??'').replace(/,/g,''));
    return Number.isFinite(n)?n:0;
  }
  function peso(v){return '₱'+Math.round(v).toLocaleString('en-PH')}
  function variant(n){return (document.getElementById(`c${n}_variant`)?.value||'Vehicle').trim()||'Vehicle'}
  function common(n){
    return {
      srp:read(`c${n}_srp`),
      opdp:read(`c${n}_opdp`),
      bdp:read(`c${n}_bdp`),
      dir:read(`c${n}_dir`)
    };
  }
  function baseRevenue(x){return x.srp*(1-x.bdp/100)*(1+x.dir/100)+x.opdp}
  function monthly(adjusted,m){return Math.ceil(adjusted*(1+rate(m)/100)/m-1e-10)}
  function monthlyRows(adjusted){
    return ORDER.map(m=>({months:m,label:TERMS[m],amount:monthly(adjusted,m),rate:rate(m)}));
  }

  function injectStyle(){
    if(document.getElementById('msi-v21-rate-mirror-style'))return;
    const s=document.createElement('style');
    s.id='msi-v21-rate-mirror-style';
    s.textContent=`
      .msi-rate-monthly{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:10px;align-items:center;line-height:1.65}
      .msi-rate-monthly .msi-rate-term{min-width:0}
      .msi-rate-monthly .msi-rate-money{font-weight:900;white-space:nowrap}
      .msi-rate-monthly .msi-rate-value{color:#ffe94d;font-weight:950;white-space:nowrap;text-align:right;min-width:42px}
      @media(max-width:600px){.msi-rate-monthly{grid-template-columns:minmax(0,1fr) auto auto;gap:7px}.msi-rate-monthly .msi-rate-value{min-width:38px}}
    `;
    document.head.appendChild(s);
  }

  function simpleHtml(n){
    const x=common(n),v=variant(n);
    let adjusted,header=[];

    if(n===1){
      const dp=read('c1_dp');
      adjusted=(baseRevenue(x)-dp)/(1+x.dir/100);
      header=[
        '<div class="simple-line"><strong>Unit:</strong> '+escapeHtml(v)+'</div>',
        '<div class="simple-line"><strong>Desired DP:</strong> '+peso(dp)+'</div>',
        '<div class="simple-line"><strong>Unit SRP:</strong> '+peso(x.srp)+'</div>'
      ];
    }else if(n===2){
      const pct=read('c2_pct');
      const dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100);
      adjusted=(baseRevenue(x)-dp)/(1+x.dir/100);
      header=[
        '<div class="simple-line"><strong>Unit:</strong> '+escapeHtml(v)+'</div>',
        '<div class="simple-line"><strong>Desired DP:</strong> '+pct.toFixed(2).replace(/\\.00$/,'')+'%</div>',
        '<div class="simple-line"><strong>DP Amount:</strong> '+peso(dp)+'</div>',
        '<div class="simple-line"><strong>SRP:</strong> '+peso(x.srp)+'</div>'
      ];
    }else{
      const months=Number(document.getElementById('c3_term')?.value);
      const target=read('c3_monthly');
      const dp=Math.ceil(baseRevenue(x)-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10);
      return [
        '<div class="simple-line"><strong>Unit Model:</strong> '+escapeHtml(v)+'</div>',
        '<div class="simple-line"><strong>Loan Term:</strong> '+escapeHtml(TERMS[months]||'')+'</div>',
        '<div class="simple-line"><strong>Target Monthly:</strong> '+peso(target)+'</div>',
        '<div class="simple-line"><strong>Required DP:</strong> '+peso(dp)+'</div>',
        '<div class="simple-line"><strong>Unit SRP:</strong> '+peso(x.srp)+'</div>',
        '<div class="simple-line"><strong>Interest Rate:</strong> <span class="msi-rate-value">'+rate(months)+'%</span></div>'
      ].join('');
    }

    const rows=monthlyRows(adjusted).map(r=>
      '<div class="msi-rate-monthly"><span class="msi-rate-term">'+r.label+'</span><span class="msi-rate-money">'+peso(r.amount)+'</span><span class="msi-rate-value">'+r.rate+'%</span></div>'
    ).join('');

    return header.concat([
      '<div class="simple-heading">Monthly Amortization:</div>',
      '<div class="simple-monthly">'+rows+'</div>'
    ]).join('');
  }

  function simpleCopyText(n){
    const x=common(n),v=variant(n);
    if(n===1){
      const dp=read('c1_dp');
      const adjusted=(baseRevenue(x)-dp)/(1+x.dir/100);
      return [
        'Unit: '+v,
        'Desired DP: '+peso(dp),
        'Unit SRP: '+peso(x.srp),
        '',
        'Monthly Amortization:',
        ...monthlyRows(adjusted).map(r=>r.label+' '+peso(r.amount)+' @ '+r.rate+'%'),
        '',
        COPY_RESULT_FOOTER
      ].join('\n');
    }
    if(n===2){
      const pct=read('c2_pct');
      const dp=x.opdp+(1+x.dir/100)*x.srp*(pct/100-x.bdp/100);
      const adjusted=(baseRevenue(x)-dp)/(1+x.dir/100);
      return [
        'Unit: '+v,
        'Desired DP: '+pct.toFixed(2).replace(/\\.00$/,'')+'%',
        'DP Amount: '+peso(dp),
        'SRP: '+peso(x.srp),
        '',
        'Monthly Amortization:',
        ...monthlyRows(adjusted).map(r=>r.label+' '+peso(r.amount)+' @ '+r.rate+'%'),
        '',
        COPY_RESULT_FOOTER
      ].join('\n');
    }
    const months=Number(document.getElementById('c3_term')?.value);
    const target=read('c3_monthly');
    const dp=Math.ceil(baseRevenue(x)-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10);
    return [
      'Unit Model: '+v,
      'Loan Term: '+(TERMS[months]||''),
      'Target Monthly: '+peso(target),
      'Required DP: '+peso(dp),
      'Unit SRP: '+peso(x.srp),
      'Interest Rate: '+rate(months)+'%',
      '',
      COPY_RESULT_FOOTER
    ].join('\n');
  }

  function detailedCopy(n){
    const x=common(n),v=variant(n);
    const pct=(amount,d=2)=>x.srp>0?((Number(amount)||0)/x.srp*100).toFixed(d):Number(0).toFixed(d);
    if(n===1){
      const dp=read('c1_dp'),white=read('c1_white'),rb=baseRevenue(x),adjusted=(rb-dp)/(1+x.dir/100),discount=x.srp-dp-adjusted,total=dp+discount,months=Number(document.getElementById('c1_term')?.value),m=monthly(adjusted,months);
      const whitePearlCashout=white;
      const wp=parseFloat(String(whitePearlCashout).replace(/[^0-9.-]/g,''))||0;
      const colorDisplay=wp>0?'White Pearl':'-';
      return [
        'Client Desired DP Amount: '+peso(dp)+' ('+pct(dp)+'%)','Unit: '+v,'Color: '+colorDisplay,'Unit SRP: '+peso(x.srp)+' (100%)','Official Promo DP: '+peso(x.opdp),'Additional Cashout for White Pearl Color: '+peso(white),'Client Net DP (Actual Client Cashout): '+peso(dp+white)+' ('+pct(dp+white)+'%)','Client Discount: '+peso(discount)+' ('+pct(discount)+'%)','Total DP Deductible to Unit SRP: '+peso(total)+' ('+pct(total,4)+'%)','Amount Financed: '+peso(adjusted)+' ('+pct(adjusted)+'%)','Monthly ('+(TERMS[months]||'')+'): '+peso(m),'Bank Interest Rate: '+rate(months)+'%','',COPY_RESULT_FOOTER
      ].join('\n');
    }
    if(n===2){
      const pctInput=read('c2_pct'),white=read('c2_white'),dp=x.opdp+(1+x.dir/100)*x.srp*(pctInput/100-x.bdp/100),rb=baseRevenue(x),adjusted=(rb-dp)/(1+x.dir/100),discount=x.srp-dp-adjusted,total=dp+discount,months=Number(document.getElementById('c2_term')?.value),m=monthly(adjusted,months);
      const whitePearlCashout=white;
      const wp=parseFloat(String(whitePearlCashout).replace(/[^0-9.-]/g,''))||0;
      const colorDisplay=wp>0?'White Pearl':'-';
      return [
        'Client Desired DP (Percentage): '+pct(total,4)+'%','Unit: '+v,'Color: '+colorDisplay,'Unit SRP: '+peso(x.srp)+' (100%)','Official Promo DP: '+peso(x.opdp),'Additional Cashout for White Pearl Color: '+peso(white),'Client Net DP (Actual Client Cashout): '+peso(dp+white)+' ('+pct(dp+white)+'%)','Client Discount: '+peso(discount)+' ('+pct(discount)+'%)','Total DP Deductible to Unit SRP: '+peso(total)+' ('+pct(total,4)+'%)','Amount Financed: '+peso(adjusted)+' ('+pct(adjusted)+'%)','Monthly ('+(TERMS[months]||'')+'): '+peso(m),'Bank Interest Rate: '+rate(months)+'%','',COPY_RESULT_FOOTER
      ].join('\n');
    }
    const white=read('c3_white'),months=Number(document.getElementById('c3_term')?.value),target=read('c3_monthly'),dp=Math.ceil(baseRevenue(x)-target*months*(1+x.dir/100)/(1+rate(months)/100)-1e-10),adjusted=(baseRevenue(x)-dp)/(1+x.dir/100),discount=x.srp-dp-adjusted,total=dp+discount;
    const whitePearlCashout=white;
    const wp=parseFloat(String(whitePearlCashout).replace(/[^0-9.-]/g,''))||0;
    const colorDisplay=wp>0?'White Pearl':'-';
    return [
      'Client Desired Monthly ('+(TERMS[months]||'')+'): '+peso(target),'Unit: '+v,'Color: '+colorDisplay,'Unit SRP: '+peso(x.srp)+' (100%)','Official Promo DP: '+peso(x.opdp),'Client Required DP Amount: '+peso(dp)+' ('+pct(dp)+'%)','Additional Cashout for White Pearl Color: '+peso(white),'Client Net DP (Actual Client Cashout): '+peso(dp+white)+' ('+pct(dp+white)+'%)','Client Discount: '+peso(discount)+' ('+pct(discount)+'%)','Total DP Deductible to Unit SRP: '+peso(total)+' ('+pct(total,4)+'%)','Amount Financed: '+peso(adjusted)+' ('+pct(adjusted)+'%)','Monthly ('+(TERMS[months]||'')+'): '+peso(target),'Bank Interest Rate: '+rate(months)+'%','',COPY_RESULT_FOOTER
    ].join('\n');
  }

  function escapeHtml(s){return String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}

  function write(text,msg){
    if(window.writePlainClipboard)return window.writePlainClipboard(text,msg);
    if(navigator.clipboard?.writeText)return navigator.clipboard.writeText(text);
    const ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();
  }

  function generateSimple(n){
    const simple=document.getElementById(`c${n}_simple_results`);
    if(!simple)return;
    const content=simple.querySelector('.simple-content');
    if(content)content.innerHTML=simpleHtml(n);
    simple.classList.add('show');
    simple.scrollIntoView({behavior:'smooth',block:'nearest'});
  }

  function install(){
    injectStyle();

    document.addEventListener('click',function(event){
      const generate=event.target.closest('.msi-simple-generate,.simple-generate');
      if(generate){
        const card=generate.closest('.calculator-card');
        const cls=card&&[...card.classList].find(c=>/^calculator-[123]$/.test(c));
        const n=cls?Number(cls.split('-')[1]):0;
        if(n){
          event.preventDefault();event.stopImmediatePropagation();
          generateSimple(n);
        }
        return;
      }
      const copy=event.target.closest('.simple-copy');
      if(copy){
        const simple=copy.closest('.simple-results');
        const m=simple?.id?.match(/^c([123])_simple_results$/);
        if(m){
          event.preventDefault();event.stopImmediatePropagation();
          write(simpleCopyText(Number(m[1])),'Simple computation copied.');
        }
      }
    },true);

    window.simpleCopyText=function(n){return simpleCopyText(Number(n));};
    window.MSI_COPY_SIMPLE=function(n){return write(window.simpleCopyText(Number(n)),'Simple computation copied.');};
    window.copyResult=function(n){
      const text=detailedCopy(Number(n));
      if(typeof copyStore!=='undefined')copyStore[n]=text;
      return write(text,'Detailed computation copied.');
    };
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();