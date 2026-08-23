// Sandbox-only visual/content refinements.
(function(){
  // Turn long retailer titles into compact, human-readable product names.
  window.shortTitle = function(s=''){
    let t=String(s)
      .replace(/^Amazon\.com\s*[:|\-]?\s*/i,'')
      .replace(/\s+/g,' ')
      .trim();

    const lower=t.toLowerCase();
    let brand='';
    if (/^free people\b/i.test(t)) brand='Free People';
    else if (/^dream pairs\b/i.test(t)) brand='DREAM PAIRS';
    else {
      const gender=t.search(/\b(women'?s?|men'?s?|girls?|boys?)\b/i);
      const product=t.search(/\b(cowboy|cowgirl|western|boot|boots|shoe|shoes|sandal|sandals|sneaker|sneakers|dress|jacket|bag|handbag|purse)\b/i);
      const stop=[gender,product].filter(n=>n>0).sort((a,b)=>a-b)[0];
      brand=(stop?t.slice(0,stop):t.split(/[|,]/)[0]).trim().split(' ').slice(0,3).join(' ');
    }

    let type='';
    if (/\b(cowboy|cowgirl|western)\b/i.test(t) && /\bboots?\b/i.test(t)) type='Western Boots';
    else if (/\bboots?\b/i.test(t)) type='Boots';
    else if (/\bsneakers?\b/i.test(t)) type='Sneakers';
    else if (/\bsandals?\b/i.test(t)) type='Sandals';
    else if (/\bshoes?\b/i.test(t)) type='Shoes';
    else if (/\bhandbags?\b|\bpurses?\b|\bbags?\b/i.test(t)) type='Bag';

    if (brand && type) return `${brand} ${type}`;

    t=t
      .replace(/\s*[|,]\s*(size|color|theme|party|country|concert).*$/i,'')
      .replace(/\b(size|color)\s*[:#]?\s*[\w.-]+.*$/i,'')
      .trim();
    if(t.length<=38)return t;
    let cut=t.slice(0,38),last=cut.lastIndexOf(' ');
    if(last>25)cut=cut.slice(0,last);
    return cut+'…';
  };

  // Make the recommendation read like a recommendation, not a third option.
  const letter=document.getElementById('verdictLetter');
  if(letter) letter.classList.add('ai-letter-hidden');
  const winner=letter?.closest('.winner');
  if(winner) winner.classList.add('ai-winner');

  // Tighten the share screen hierarchy and copy.
  const shareTitle=document.querySelector('#shareHub .editor-head h3');
  if(shareTitle) shareTitle.textContent='Share your Tiebreak';
  const shareIntro=document.querySelector('#shareHub .share-intro');
  if(shareIntro) shareIntro.textContent='Share the comparison card, then send friends to the voting link.';
  const more=document.getElementById('shareMore');
  if(more){ more.textContent='Share anywhere'; more.classList.remove('primary'); more.classList.add('secondary'); }
  const copy=document.getElementById('copyVoteLink');
  if(copy){ copy.textContent='Copy voting link'; copy.classList.remove('secondary'); copy.classList.add('primary'); }
  const tip=document.querySelector('#shareHub .share-tip');
  if(tip) tip.textContent='Tip: for Stories, add the copied voting link with a Link sticker so friends can vote directly.';

  const style=document.createElement('style');
  style.textContent=`
    #verdictView .ai-letter-hidden{display:none!important}
    #verdictView .ai-winner{margin:18px auto 10px}
    #verdictView .ai-winner>div{display:flex;flex-direction:column;align-items:center;gap:8px}
    #verdictView .ai-winner small{display:inline-flex;align-items:center;padding:7px 12px;border-radius:999px;background:#c4b5fd;color:#171329;font-size:.72rem;font-weight:950;letter-spacing:.08em;text-transform:uppercase}
    #verdictView .ai-winner small::before{content:'✦ ';margin-right:5px}
    #verdictView .ai-winner h3{font-size:clamp(1.35rem,4vw,2rem);max-width:520px}
    #verdictView .reason{max-width:620px;margin:12px auto 20px;line-height:1.45}
    #shareHub .share-modal{padding:22px}
    #shareHub .share-card-preview{margin:18px 0}
    #shareHub #copyVoteLink{margin-top:12px}
    #shareHub #shareMore{margin-top:10px}
    @media(max-width:650px){#shareHub .share-modal{padding:18px}}
  `;
  document.head.appendChild(style);
})();