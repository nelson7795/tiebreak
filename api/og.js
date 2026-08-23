import sharp from 'sharp';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';

async function getTie(token){
  const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify({p_share_token:token})});
  if(!r.ok)throw new Error('not found');
  return r.json();
}
async function img(url){if(!url)return null;const r=await fetch(url);if(!r.ok)return null;return Buffer.from(await r.arrayBuffer())}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');
  const d=await getTie(token);
  const opts=d?.options||[];
  const A=opts.find(o=>o.option_key==='A')||{};
  const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
  const composites=[];

  if(ab){
    const p=await sharp(ab).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();
    composites.push({input:p,left:70,top:150});
  }
  if(bb){
    const p=await sharp(bb).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();
    composites.push({input:p,left:630,top:150});
  }

  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0b0d17"/>
    <rect x="70" y="150" width="500" height="315" rx="22" fill="#fff"/>
    <rect x="630" y="150" width="500" height="315" rx="22" fill="#fff"/>
    <rect x="390" y="515" width="420" height="56" rx="28" fill="#8b5cf6"/>
  </svg>`);

  const out=await sharp(base).composite(composites).png().toBuffer();
  res.setHeader('Content-Type','image/png');
  res.setHeader('Cache-Control','no-store, max-age=0');
  res.status(200).send(out);
 }catch(e){
  console.error('OG image error',e);
  res.status(404).end();
 }
}
