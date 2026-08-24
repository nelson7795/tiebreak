// Instagram-specific sharing: use a 9:16 card and include the clickable voting URL.
(function(){
  function instagramImageUrl(){
    const base=typeof shareImageUrl==='function'?shareImageUrl():'';
    return base?`${base}&format=story`:'';
  }

  function votingUrl(){
    return typeof shareUrl==='function'?shareUrl():'';
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
      const url=votingUrl();
      const data={
        files:[file],
        title:'Tiebreak — Help me decide',
        text:url?`Help me decide — vote here: ${url}`:'Help me decide on Tiebreak',
        ...(url?{url}:{})
      };

      if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
        await navigator.share(data);
        return true;
      }

      // Some iOS share targets reject files + URL together. Fall back to the
      // image-only share while the voting URL remains copied to the clipboard.
      const imageOnly={files:[file]};
      if(navigator.share&&(!navigator.canShare||navigator.canShare(imageOnly))){
        await navigator.share(imageOnly);
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
      const url=votingUrl();
      if(typeof copyVoteLink==='function')await copyVoteLink(true);
      if(typeof toast==='function')toast('Instagram share ready. The voting link is included when supported and copied as a fallback for DMs, captions, or Link stickers.');
      const ok=await shareInstagramCard();
      if(!ok&&typeof nativeShare==='function')await nativeShare();
      if(!ok&&url&&typeof toast==='function')toast('Voting link copied — paste it into the Instagram message so it is tappable.');
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
