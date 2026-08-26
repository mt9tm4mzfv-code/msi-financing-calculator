(function(){
  'use strict';
  function apply(){
    const cards=document.querySelectorAll('.calculator-card');
    if(cards.length<3)return;
    const icons={
      0:'./icons/cal1-cash-128.webp',
      2:'./icons/cal3-calendar-128.webp'
    };
    [0,2].forEach(i=>{
      const holder=cards[i].querySelector('.calculator-icon');
      if(!holder)return;
      const src=icons[i];
      if(holder.dataset.msiAttachedIcon===src)return;
      holder.innerHTML='';
      const img=document.createElement('img');
      img.src=src;
      img.alt='';
      img.setAttribute('aria-hidden','true');
      img.style.width='53px';
      img.style.height='53px';
      img.style.objectFit='contain';
      img.style.display='block';
      holder.appendChild(img);
      holder.dataset.msiAttachedIcon=src;
    });
  }
  function loadV628(){
    if(document.querySelector('script[data-msi-v628-promo-footer-c4]'))return;
    const s=document.createElement('script');
    s.src='./v62-8-promo-footer-c4.js?v=62.9';
    s.dataset.msiV628PromoFooterC4='1';
    document.head.appendChild(s);
  }
  function init(){
    apply();
    loadV628();
    setTimeout(apply,100);
    setTimeout(apply,500);
    setTimeout(loadV628,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
  new MutationObserver(apply).observe(document.documentElement,{childList:true,subtree:true});
})();
