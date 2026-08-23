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

// Facebook's web sharer reliably scrapes the /d/:token Open Graph metadata and
// renders the full clickable Tiebreak preview. Do not copy or prefill the URL as
// post text; the link is carried only as the shared attachment.
const facebookShareButton=document.getElementById('shareFacebook');
if(facebookShareButton){
  facebookShareButton.onclick=()=>{
    if(!state.shareToken){toast('Publish this Tiebreak first');return}
    const voteUrl=`https://mytiebreak.com/d/${state.shareToken}`;
    const facebookUrl=`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(voteUrl)}`;
    toast('Opening Facebook with a clickable Tiebreak preview');
    window.location.assign(facebookUrl);
  };
}
