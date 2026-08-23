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

// Persist the creator's AI recommendation locally so the sandbox result page
// can show it even when the backend record does not yet return ai_pick.
const sandboxBaseChoose=choose;
choose=function(){
  const pick=sandboxBaseChoose();
  try{localStorage.setItem('tiebreak_pending_ai_pick',pick)}catch{}
  return pick;
};
const sandboxBasePublish=publish;
publish=async function(){
  const t=await sandboxBasePublish();
  try{
    if(state.aiPick)localStorage.setItem(`ai_pick_${t}`,state.aiPick);
    localStorage.removeItem('tiebreak_pending_ai_pick');
  }catch{}
  return t;
};

// Results-page sandbox redesign: concise winner, compact summary, correct vote grammar.
const resultsView=document.getElementById('resultsView');
const resultsWinner=document.getElementById('resultsWinner');
const resultsWinnerName=document.getElementById('resultsWinnerName');
const resultsWinnerBox=resultsWinner?.closest('.winner');
if(resultsWinnerBox)resultsWinnerBox.classList.add('results-winner');
const stats=document.querySelector('#resultsView .stats');
if(stats)stats.classList.add('results-stats');
const totalVotes=document.getElementById('totalVotes');
const voteLabel=totalVotes?.nextElementSibling;

const sandboxBaseResults=results;
results=async function(){
  await sandboxBaseResults();
  let savedPick=null;
  try{savedPick=state.shareToken?localStorage.getItem(`ai_pick_${state.shareToken}`):null}catch{}
  if(!state.aiPick && savedPick)state.aiPick=savedPick;
  const ai=document.getElementById('aiPickResult');
  if(ai)ai.textContent=state.aiPick||'—';

  const n=state.votes.A+state.votes.B;
  const a=n?Math.round(state.votes.A/n*100):0;
  const b=n?100-a:0;
  const w=!n?'—':state.votes.A===state.votes.B?'Tie':state.votes.A>state.votes.B?'A':'B';

  if(resultsWinnerBox){
    const small=resultsWinnerName?.previousElementSibling;
    if(small)small.textContent=w==='Tie'?'Result':w==='—'?'Results':'People’s pick';
  }
  if(resultsWinner)resultsWinner.textContent=w==='Tie'?'TIE':w;
  if(resultsWinnerName){
    resultsWinnerName.textContent=w==='Tie'?'It’s a tie':w==='—'?'No votes yet':shortTitle(state.options[w].name);
  }
  if(voteLabel)voteLabel.textContent=n===1?'vote':'votes';

  const people=document.getElementById('peoplePickResult');
  if(people)people.textContent=w;
  const pctA=document.getElementById('pctA');
  const pctB=document.getElementById('pctB');
  if(pctA)pctA.textContent=a+'%';
  if(pctB)pctB.textContent=b+'%';
};

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
#resultsView .results-winner{display:flex;justify-content:center;align-items:center;gap:16px;margin:22px auto 24px;padding:20px;border:1px solid #343b57;border-radius:22px;background:#101625;max-width:650px}
#resultsView .results-winner>span{display:grid;place-items:center;min-width:64px;height:64px;padding:0 14px;border-radius:18px;background:linear-gradient(135deg,#8b5cf6,#d946ef);font-size:2rem;font-weight:950;color:white}
#resultsView .results-winner>div{text-align:left;min-width:0}
#resultsView .results-winner small{display:block;color:#b8b8c8;font-size:.9rem;margin-bottom:4px}
#resultsView .results-winner h3{font-size:clamp(1.2rem,4vw,1.65rem);line-height:1.15;margin:0;overflow-wrap:anywhere}
#resultsView .results-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 auto 22px;max-width:650px}
#resultsView .results-stats>div{padding:14px 8px;border-radius:16px;background:#101625;border:1px solid #252c43}
#resultsView .results-stats span{font-size:1.35rem;font-weight:900}
#resultsView .results-stats small{display:block;margin-top:4px;font-size:.78rem;color:#aeb2c5}
#resultsView .bar{margin-top:8px}
#resultsView .pct-row{margin-bottom:28px}
@media(max-width:650px){#shareHub .share-modal{padding:18px}#resultsView .results-winner{padding:16px;gap:12px}#resultsView .results-winner>span{min-width:56px;height:56px;font-size:1.7rem}#resultsView .results-stats{gap:7px}#resultsView .results-stats>div{padding:12px 5px}}
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
