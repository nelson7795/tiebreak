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
function xml(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&apos;'}[m]))}
function ascii(s=''){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').trim()}
function fit(s,n=58){const t=ascii(s)||'Which should I choose?';return t.length>n?t.slice(0,n-3)+'...':t}

export default async function handler(req,res){
  try{
    const token=String(req.query.token||'');
    const d=await getTie(token);
    const opts=d?.options||[];
    const A=opts.find(o=>o.option_key==='A')||{};
    const B=opts.find(o=>o.option_key==='B')||{};
    const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
    const composites=[];
    if(ab){const p=await sharp(ab).resize(500,350,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:170})}
    if(bb){const p=await sharp(bb).resize(500,350,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:170})}
    const q=xml(fit(d?.question));
    const svg=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <rect width="1200" height="630" fill="#0b0d17"/>
      <text x="60" y="62" font-size="30" font-weight="700" fill="#c4b5fd" font-family="sans-serif">TIEBREAK</text>
      <text x="60" y="118" font-size="42" font-weight="700" fill="#ffffff" font-family="sans-serif">${q}</text>
      <rect x="70" y="170" width="500" height="350" rx="22" fill="#ffffff"/>
      <rect x="630" y="170" width="500" height="350" rx="22" fill="#ffffff"/>
      <circle cx="105" cy="205" r="27" fill="#8b5cf6"/><text x="94" y="216" font-size="30" font-weight="700" fill="#fff" font-family="sans-serif">A</text>
      <circle cx="665" cy="205" r="27" fill="#8b5cf6"/><text x="654" y="216" font-size="30" font-weight="700" fill="#fff" font-family="sans-serif">B</text>
      <rect x="425" y="548" width="350" height="58" rx="29" fill="#8b5cf6"/>
      <text x="600" y="586" text-anchor="middle" font-size="27" font-weight="700" fill="#ffffff" font-family="sans-serif">VOTE ON TIEBREAK</text>
    </svg>`);
    const out=await sharp(svg).composite(composites).png().toBuffer();
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).send(out);
  }catch(e){
    console.error(e);
    res.status(404).end();
  }
}
