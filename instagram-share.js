// Instagram-specific sharing: use a 9:16 card so Instagram does not crop the landscape OG image.
(function(){
  function instagramImageUrl(){
    const base=typeof shareImageUrl==='function'?shareImageUrl():'';
    return base?`${base}&format=story`:'';
  }

  async function instagramCardFile(){
    const url=instagramImageUrl();
    if(!url)throw new Error('No share token');
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error('Instagram card unavailable');
    const blob=await r.blob();
    return new File([blob],'tiebreak-instagram.png',{type:'image/png'});
  }

  async function shareInstagramCard(){
    try{
      const file=await instagramCardFile();
      const data={files:[file]};
      if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
        await navigator.share(data);
        return true;
      }
    }catch(e){
      if(e?.name==='AbortError')return true;
      console.warn('Instagram share fallback',e);
    }
    return false;
  }

  async function instagramShare(){
    try{
      if(typeof copyVoteLink==='function')await copyVoteLink(true);
      if(typeof toast==='function')toast('Instagram card ready. In Instagram, choose Story or Post, then tap Next/Share. Your voting link is copied for a Link sticker.');
      const ok=await shareInstagramCard();
      if(!ok&&typeof nativeShare==='function')await nativeShare();
    }catch(e){
      console.error(e);
      if(typeof toast==='function')toast('Could not prepare Instagram share. Try Share anywhere instead.');
    }
  }

  const wire=()=>{
    const btn=document.getElementById('shareInstagram');
    if(btn)btn.onclick=instagramShare;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
