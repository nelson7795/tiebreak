// Sandbox-only sharing and display enhancements.
// Keeps production untouched while we test the improved Tiebreak experience.

// Make imported shopping titles friendlier and much shorter.
shortTitle = function(s=''){
  let t=String(s)
    .replace(/^Amazon\.com\s*[:|\-]?\s*/i,'')
    .replace(/\s*[:|]\s*(Pet Supplies|Industrial & Scientific|Home & Kitchen|Clothing, Shoes & Jewelry).*$/i,'')
    .trim();

  // Shopping titles for boots are especially noisy. Preserve the brand and product type.
  if(/\b(boot|boots|cowboy|cowgirl|western)\b/i.test(t)){
    const words=t.split(/\s+/).filter(Boolean);
    let brand=words[0]||'';
    if(words.length>1 && (/^[A-Z][A-Z\s&'-]+$/.test(words.slice(0,2).join(' ')) || /^(Free|Dream)$/i.test(words[0]))) {
      brand=words.slice(0,2).join(' ');
    }
    return `${brand} Western Boots`.trim();
  }

  const parts=t.split(/\s*[|,]\s*/).map(x=>x.trim()).filter(Boolean);
  if(parts.length>1 && parts[0].length<30)t=parts[0];
  if(t.length<=34)return t;
  let cut=t.slice(0,34);
  const last=cut.lastIndexOf(' ');
  if(last>22)cut=cut.slice(0,last);
  return cut+'…';
};

// Keep A/B for voting clarity, but call out the Tiebreak AI recommendation.
const sandboxBaseCard=card;
card = function(k,vote=false){
  let html=sandboxBaseCard(k,vote);
  if(vote && state.aiPick===k){
    html=html.replace(
      `<div class="option-badge">${k}</div>`,
      `<div class="vote-card-labels"><div class="option-badge">${k}</div><div class="ai-pick-badge">AI PICK</div></div>`
    );
  }
  return html;
};

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
