async function fetchLinkPreview(k){
  const field=$(`option${k}Link`);
  const u=safeUrl(field.value.trim());
  if(!u)return;
  const o=state.options[k];
  if(o._previewUrl===u)return;
  o._previewUrl=u;
  toast(`Getting Option ${k} details…`);
  try{
    const r=await fetch(`${U}/functions/v1/link-preview`,{method:'POST',headers:{apikey:K,'Content-Type':'application/json'},body:JSON.stringify({url:u})});
    const d=await r.json();
    if(!r.ok||!d.ok)throw Error(d.error||'Preview unavailable');
    const resolved=safeUrl(d.url||'')||u;
    o.link=resolved;
    field.value=resolved;
    const name=$(`option${k}Name`);
    if(d.title&&(name.value.trim()===`Option ${k}`||!name.value.trim())){name.value=d.title;o.name=d.title}
    const price=$(`option${k}Price`);
    if(d.price&&!price.value.trim()){price.value=(d.currency==='USD'&&!String(d.price).startsWith('$')?'$':'')+d.price;o.price=price.value}
    if(d.image&&!o.file)revealImage(k,d.image);
    toast(d.image?`Option ${k} details & photo added`:`Option ${k} details added — no photo available`);
  }catch(e){console.error(e);o._previewUrl='';toast(`Couldn’t auto-fill Option ${k}; manual upload still works`)}
}
for(const k of ['A','B']){let timer;const field=$(`option${k}Link`);field.addEventListener('paste',()=>{clearTimeout(timer);timer=setTimeout(()=>fetchLinkPreview(k),180)});field.addEventListener('blur',()=>fetchLinkPreview(k))}

// Facebook needs the actual Tiebreak URL as the shared object so the post stays
// clickable. Sharing only the generated PNG creates a photo post whose CTA is
// just pixels. The /d/:token page already contains dynamic Open Graph metadata
// and the A/B preview image, so Facebook can render the card and link it to voting.
const facebookShareButton=document.getElementById('shareFacebook');
if(facebookShareButton){
  facebookShareButton.onclick=()=>{
    if(!state.shareToken){toast('Publish this Tiebreak first');return}
    const voteUrl=shareUrl();
    const facebookUrl=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(voteUrl)}`;
    toast('Opening Facebook — the Tiebreak card will link directly to voting');
    window.location.href=facebookUrl;
  };
}
