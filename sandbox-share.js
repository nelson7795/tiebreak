// Sandbox-only sharing and display enhancements.
// Keeps production untouched while we test the improved Tiebreak experience.

// Make imported shopping titles friendlier and much shorter.
shortTitle = function(s=''){
  let t=String(s)
    .replace(/^Amazon\.com\s*[:|\-]?\s*/i,'')
    .replace(/\s+/g,' ')
    .trim();

  let brand='';
  if(/^free people\b/i.test(t)) brand='Free People';
  else if(/^dream pairs\b/i.test(t)) brand='DREAM PAIRS';
  else {
    const gender=t.search(/\b(women'?s?|men'?s?|girls?|boys?)\b/i);
    const product=t.search(/\b(cowboy|cowgirl|western|boot|boots|shoe|shoes|sandal|sandals|sneaker|sneakers|dress|jacket|bag|handbag|purse)\b/i);
    const stop=[gender,product].filter(n=>n>0).sort((a,b)=>a-b)[0];
    brand=(stop?t.slice(0,stop):t.split(/[|,]/)[0]).trim().split(' ').slice(0,3).join(' ');
  }

  let type='';
  if(/\b(cowboy|cowgirl|western)\b/i.test(t) && /\bboots?\b/i.test(t)) type='Western Boots';
  else if(/\bboots?\b/i.test(t)) type='Boots';
  else if(/\bsneakers?\b/i.test(t)) type='Sneakers';
  else if(/\bsandals?\b/i.test(t)) type='Sandals';
  else if(/\bshoes?\b/i.test(t)) type='Shoes';
  else if(/\bhandbags?\b|\bpurses?\b|\bbags?\b/i.test(t)) type='Bag';

  // Known retailer titles sometimes omit the product type from the scraped title.
  if(brand==='Free People' && !type && /diamonds are/i.test(t)) type='Western Boots';
  if(brand==='DREAM PAIRS' && !type) type='Western Boots';
  if(brand&&type)return `${brand} ${type}`;

  t=t.replace(/\s*[|,]\s*(size|color|theme|party|country|concert).*$/i,'').replace(/\b(size|color)\s*[:#]?\s*[\w.-]+.*$/i,'').trim();
  if(t.length<=38)return t;
  let cut=t.slice(0,38),last=cut.lastIndexOf(' ');
  if(last>25)cut=cut.slice(0,last);
  return cut+'…';
};

// Keep A/B on the voting page for clarity and mark the AI recommendation there.
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

// The recommendation itself does not need a giant duplicate A/B marker.
const verdictLetter=document.getElementById('verdictLetter');
if(verdictLetter)verdictLetter.classList.add('ai-letter-hidden');
const verdictWinner=verdictLetter?.closest('.winner');
if(verdictWinner)verdictWinner.classList.add('ai-winner');

// Simplify the share screen and make the voting link the clearest action.
const shareTitle=document.querySelector('#shareHub .editor-head h3');
if(shareTitle)shareTitle.textContent='Share your Tiebreak';
const shareIntro=document.querySelector('#shareHub .share-intro');
if(shareIntro)shareIntro.textContent='Share the comparison card, then send friends to the voting link.';
const shareTip=document.querySelector('#shareHub .share-tip');
if(shareTip)shareTip.textContent='Tip: for Stories, add the copied voting link with a Link sticker so friends can vote directly.';
const copyBtn=document.getElementById('copyVoteLink');
if(copyBtn){copyBtn.textContent='Copy voting link';copyBtn.classList.remove('secondary');copyBtn.classList.add('primary')}
const moreBtn=document.getElementById('shareMore');
if(moreBtn){moreBtn.textContent='Share anywhere';moreBtn.classList.remove('primary');moreBtn.classList.add('secondary')}

const polish=document.createElement('style');
polish.textContent=`
#verdictView .ai-letter-hidden{display:none!important}
#verdictView .ai-winner{margin:18px auto 10px}
#verdictView .ai-winner>div{display:flex;flex-direction:column;align-items:center;gap:8px}
#verdictView .ai-winner small{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:#c4b5fd;color:#171329;font-size:.72rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
#verdictView .ai-winner small::before{content:'✦';margin-right:5px}
#verdictView .ai-winner h3{font-size:clamp(1.35rem,4vw,2rem);max-width:520px}
#verdictView .reason{max-width:620px;margin:12px auto 20px;line-height:1.45}
#shareHub .share-modal{padding:22px}
#shareHub .share-card-preview{margin:18px 0}
#shareHub #copyVoteLink{margin-top:12px}
#shareHub #shareMore{margin-top:10px}
@media(max-width:650px){#shareHub .share-modal{padding:18px}}
`;
document.head.appendChild(polish);

async function sandboxShareVotingLink(kind='share'){
  const url=shareUrl();
  const question=(state?.question||'Which should I choose?').trim();
  const data={title:'Tiebreak — Help me decide',text:`Help me decide: ${question}`,url};
  if(navigator.share){
    try{await navigator.share(data);return}catch(e){if(e?.name==='AbortError')return;console.warn('Native share failed',e)}
  }
  if(kind==='facebook'){
    const fb=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    window.open(fb,'_blank','noopener,noreferrer');return;
  }
  try{await navigator.clipboard.writeText(url);toast('Voting link copied!')}catch{toast('Copy this voting link: '+url)}
}

const facebookBtn=document.getElementById('shareFacebook');
if(facebookBtn)facebookBtn.onclick=()=>sandboxShareVotingLink('facebook');
if(moreBtn)moreBtn.onclick=()=>sandboxShareVotingLink('share');
