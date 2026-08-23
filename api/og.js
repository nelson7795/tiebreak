import sharp from 'sharp';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';

async function getTie(token){
  const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify({p_share_token:token})});
  if(!r.ok)throw new Error('not found');
  return r.json();
}
async function img(url){if(!url)return null;const r=await fetch(url);if(!r.ok)return null;return Buffer.from(await r.arrayBuffer())}
function clean(s=''){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').trim()}
function xml(s=''){return clean(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&apos;')}
function wrap(text,max=34){const words=clean(text||'Which should I choose?').split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);const composites=[];
  if(ab){const p=await sharp(ab).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:205})}
  if(bb){const p=await sharp(bb).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:205})}
  const lines=wrap(d?.question,31);const q1=lines[0]||'Which should I choose?';const q2=lines[1]||'';
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0b0d17"/>
    <text x="60" y="58" fill="#c4b5fd" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="800" letter-spacing="3">TIEBREAK</text>
    <text x="60" y="118" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800">${xml(q1)}</text>
    ${q2?`<text x="60" y="170" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="48" font-weight="800">${xml(q2)}</text>`:''}
    <rect x="70" y="205" width="500" height="360" rx="22" fill="#fff"/>
    <rect x="630" y="205" width="500" height="360" rx="22" fill="#fff"/>
  </svg>`);
  const out=await sharp(base).composite(composites).png().toBuffer();
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
