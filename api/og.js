import sharp from 'sharp';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';

async function getTie(token){
  const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{
    method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},
    body:JSON.stringify({p_share_token:token})
  });
  if(!r.ok)throw new Error('not found');
  return r.json();
}
async function img(url){
  if(!url)return null;
  const r=await fetch(url);
  if(!r.ok)return null;
  return Buffer.from(await r.arrayBuffer());
}
function xml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]))}

export default async function handler(req,res){
  try{
    const token=String(req.query.token||'');
    const d=await getTie(token);
    const opts=d?.options||[];
    const A=opts.find(o=>o.option_key==='A')||{};
    const B=opts.find(o=>o.option_key==='B')||{};
    const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
    const composites=[];
    if(ab){const p=await sharp(ab).resize(520,420,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:55,top:150})}
    if(bb){const p=await sharp(bb).resize(520,420,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:625,top:150})}
    const q=xml((d?.question||'Which should I choose?').slice(0,70));
    const svg=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0b0d17"/><text x="60" y="72" font-size="34" font-weight="700" fill="#c4b5fd" font-family="Arial,Helvetica,sans-serif">TIEBREAK</text><text x="60" y="118" font-size="42" font-weight="800" fill="#ffffff" font-family="Arial,Helvetica,sans-serif">${q}</text><rect x="55" y="150" width="520" height="420" rx="24" fill="#ffffff"/><rect x="625" y="150" width="520" height="420" rx="24" fill="#ffffff"/><circle cx="90" cy="185" r="28" fill="#8b5cf6"/><text x="80" y="196" font-size="32" font-weight="800" fill="#fff" font-family="Arial">A</text><circle cx="660" cy="185" r="28" fill="#8b5cf6"/><text x="650" y="196" font-size="32" font-weight="800" fill="#fff" font-family="Arial">B</text><text x="600" y="605" text-anchor="middle" font-size="26" font-weight="700" fill="#d8d9e3" font-family="Arial,Helvetica,sans-serif">Tap to vote →</text></svg>`);
    const out=await sharp(svg).composite(composites).png().toBuffer();
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','public, s-maxage=300, stale-while-revalidate=86400');
    res.status(200).send(out);
  }catch(e){
    res.status(404).end();
  }
}
