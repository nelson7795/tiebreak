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
function esc(s=''){return clean(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[m]))}
function wrap(text,max=40){const words=clean(text||'Which should I choose?').split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);const composites=[];
  if(ab){const p=await sharp(ab).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:220})}
  if(bb){const p=await sharp(bb).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:220})}
  const lines=wrap(d?.question,38),q1=esc(lines[0]||'Which should I choose?'),q2=esc(lines[1]||'');
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0b0d17"/>
    <text x="60" y="62" fill="#c4b5fd" font-family="Arial, Helvetica, sans-serif" font-size="26" font-weight="700" letter-spacing="2">TIEBREAK</text>
    <text x="60" y="120" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">${q1}</text>
    ${q2?`<text x="60" y="166" fill="#ffffff" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="700">${q2}</text>`:''}
    <rect x="70" y="220" width="500" height="315" rx="22" fill="#fff"/>
    <rect x="630" y="220" width="500" height="315" rx="22" fill="#fff"/>
  </svg>`);
  const photos=await sharp(base).composite(composites).png().toBuffer();
  const overlay=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="260" r="30" fill="#8b5cf6"/><text x="110" y="270" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">A</text>
    <circle cx="670" cy="260" r="30" fill="#8b5cf6"/><text x="670" y="270" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="28" font-weight="700">B</text>
    <rect x="390" y="555" width="420" height="56" rx="28" fill="#8b5cf6"/>
    <text x="600" y="591" text-anchor="middle" fill="#fff" font-family="Arial, Helvetica, sans-serif" font-size="22" font-weight="700" letter-spacing="1">VOTE ON TIEBREAK</text>
  </svg>`);
  const out=await sharp(photos).composite([{input:overlay,left:0,top:0}]).png().toBuffer();
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
