/* MSI V2 — iOS clipboard URL/link-detection protection
   Keeps the visible result exactly as "Unit: ..." while preventing iOS
   Messages/Notes/Viber from treating colon-delimited result lines as links.
*/
(function(){
  'use strict';

  const MARK='\u2066';
  const original=window.navigator?.clipboard?.writeText?.bind(window.navigator.clipboard);
  if(!original)return;

  function protect(text){
    let s=String(text??'').replace(/\r\n/g,'\n').replace(/\r/g,'\n');
    // Preserve the visible format. The invisible character only breaks iOS
    // URL/link auto-detection around the label colons.
    s=s.replace(/:/g,MARK+':');
    return s;
  }

  try{
    window.navigator.clipboard.writeText=function(text){
      return original(protect(text));
    };
  }catch(e){
    try{
      Object.defineProperty(window.navigator.clipboard,'writeText',{
        configurable:true,
        value:function(text){return original(protect(text));}
      });
    }catch(err){}
  }
})();
