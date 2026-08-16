async function fetchLinkPreview(k){
  const field=$(`option${k}Link`);
  const u=safeUrl(field.value.trim());
  if(!u)return;
  const o=state.options[k];
  if(o._previewUrl===u)return;
  o._previewUrl=u;
  toast(`Getting Option ${k} details…`);
  try{
    const r=await fetch(`${U}/functions/v1/link-preview`,{
      method:'POST',
      headers:{apikey:K,'Content-Type':'application/json'},
      body:JSON.stringify({url:u})
    });
    const d=await r.json();
    if(!r.ok||!d.ok)throw Error(d.error||'Preview unavailable');

    const name=$(`option${k}Name`);
    if(d.title&&(name.value.trim()===`Option ${k}`||!name.value.trim())){
      name.value=d.title;
      o.name=d.title;
    }

    const price=$(`option${k}Price`);
    if(d.price&&!price.value.trim()){
      price.value=(d.currency==='USD'&&!String(d.price).startsWith('$')?'$':'')+d.price;
      o.price=price.value;
    }

    if(d.image&&!o.file){
      o.image=d.image;
      o.edit={zoom:1,x:0,y:0,rotation:0};
      $(`zoom${k}`).value=1;
      $(`x${k}`).value=0;
      $(`y${k}`).value=0;
      const im=$(`preview${k}`);
      im.src=d.image;
      im.classList.remove('hidden');
      document.querySelector(`[data-upload="${k}"]`).classList.add('hidden');
      $(`edit${k}`).classList.remove('hidden');
      paint(k);
    }

    toast(d.image?`Option ${k} details & photo added`:`Option ${k} details added — no photo available`);
  }catch(e){
    console.error(e);
    o._previewUrl='';
    toast(`Couldn’t auto-fill Option ${k}; manual upload still works`);
  }
}

for(const k of ['A','B']){
  let timer;
  const field=$(`option${k}Link`);
  field.addEventListener('paste',()=>{
    clearTimeout(timer);
    timer=setTimeout(()=>fetchLinkPreview(k),180);
  });
  field.addEventListener('blur',()=>fetchLinkPreview(k));
}
