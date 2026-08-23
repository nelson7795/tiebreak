// Sandbox-only sharing enhancements.
// Keeps production untouched while we test a simpler link-first sharing flow.

async function sandboxShareVotingLink(kind='share'){
  const url=shareUrl();
  const question=(state?.question||'Which should I choose?').trim();
  const data={
    title:'Tiebreak — Help me decide',
    text:`Help me decide: ${question}`,
    url
  };

  if(navigator.share){
    try{
      await navigator.share(data);
      return;
    }catch(e){
      if(e?.name==='AbortError')return;
      console.warn('Native share failed',e);
    }
  }

  if(kind==='facebook'){
    const fb=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fb,'_blank','noopener,noreferrer');
    return;
  }

  try{
    await navigator.clipboard.writeText(url);
    toast('Voting link copied!');
  }catch{
    toast('Copy this voting link: '+url);
  }
}

const facebookBtn=document.getElementById('shareFacebook');
if(facebookBtn){
  facebookBtn.onclick=()=>sandboxShareVotingLink('facebook');
}

const moreBtn=document.getElementById('shareMore');
if(moreBtn){
  moreBtn.onclick=()=>sandboxShareVotingLink('share');
}
