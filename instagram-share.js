// Instagram sharing choices: Story, clickable voting link, or feed Post.
(function(){
  function instagramImageUrl(){
    const base=typeof shareImageUrl==='function'?shareImageUrl():'';
    return base?`${base}&format=story`:'';
  }

  function votingUrl(){
    return typeof shareUrl==='function'?shareUrl():'';
  }

  async function copyVotingUrl(){
    const url=votingUrl();
    if(!url)return false;
    try{await navigator.clipboard.writeText(url);return true}catch{return false}
  }

  async function instagramCardFile(){
    const url=instagramImageUrl();
    if(!url)throw new Error('No share token');
    const r=await fetch(url,{cache:'no-store'});
    if(!r.ok)throw new Error('Instagram card unavailable');
    const blob=await r.blob();
    return new File([blob],'tiebreak-instagram.png',{type:'image/png'});
  }

  async function shareCard(){
    const file=await instagramCardFile();
    const data={files:[file]};
    if(navigator.share&&(!navigator.canShare||navigator.canShare(data))){
      await navigator.share(data);
      return true;
    }
    return false;
  }

  async function shareVotingLink(){
    const url=votingUrl();
    if(!url)throw new Error('No voting URL');
    const question=(window.state?.question||'Which should I choose?').trim();
    const data={title:'Tiebreak — Help me decide',text:`Help me decide: ${question}\nVote here:`,url};
    if(navigator.share){
      try{await navigator.share(data);return true}catch(e){if(e?.name==='AbortError')return true}
    }
    await copyVotingUrl();
    if(typeof toast==='function')toast('Voting link copied — paste it into your Instagram message.');
    return false;
  }

  function openHub(){
    document.getElementById('instagramHub')?.classList.remove('hidden');
  }
  function closeHub(){
    document.getElementById('instagramHub')?.classList.add('hidden');
  }

  async function storyShare(){
    try{
      await copyVotingUrl();
      if(typeof toast==='function')toast('Voting link copied. In Instagram Story, add it with the Link sticker.');
      await shareCard();
      closeHub();
    }catch(e){
      if(e?.name==='AbortError')return;
      console.error(e);
      if(typeof toast==='function')toast('Could not prepare the Instagram Story card.');
    }
  }

  async function messageShare(){
    try{
      await shareVotingLink();
      closeHub();
    }catch(e){
      console.error(e);
      if(typeof toast==='function')toast('Could not share the voting link.');
    }
  }

  async function postShare(){
    try{
      await copyVotingUrl();
      if(typeof toast==='function')toast('Post card ready. Voting link copied for your caption or bio, but Instagram feed links are not tappable.');
      await shareCard();
      closeHub();
    }catch(e){
      if(e?.name==='AbortError')return;
      console.error(e);
      if(typeof toast==='function')toast('Could not prepare the Instagram post.');
    }
  }

  const style=document.createElement('style');
  style.textContent=`
    #instagramHub .instagram-modal{max-width:520px}
    #instagramHub .instagram-help{display:block;text-align:left;color:#9da4b8;line-height:1.4;margin:6px 4px 14px;font-size:.82rem}
    #instagramHub button.wide{min-height:52px;text-align:left;padding-left:18px}
  `;
  document.head.appendChild(style);

  const wire=()=>{
    const btn=document.getElementById('shareInstagram');
    if(btn)btn.onclick=openHub;
    document.getElementById('closeInstagramHub')?.addEventListener('click',closeHub);
    document.getElementById('instagramHub')?.addEventListener('click',e=>{if(e.target.id==='instagramHub')closeHub()});
    document.getElementById('instagramStory')?.addEventListener('click',storyShare);
    document.getElementById('instagramMessage')?.addEventListener('click',messageShare);
    document.getElementById('instagramPost')?.addEventListener('click',postShare);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();
