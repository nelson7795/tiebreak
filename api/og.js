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
function wrap(text,max=31){const words=clean(text||'Which should I choose?').toUpperCase().split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}

// Font-independent geometric vector lettering. Every glyph is made from SVG
// strokes, so Vercel does not need any installed fonts to render the share card.
const GLYPHS={
 A:'M1 7 L3.5 0 L6 7 M1.8 4.8 L5.2 4.8',
 B:'M1 0 L1 7 M1 0 L4.2 0 Q6 0 6 1.7 Q6 3.4 4.2 3.4 L1 3.4 M4.2 3.4 Q6.2 3.4 6.2 5.2 Q6.2 7 4.2 7 L1 7',
 C:'M6 1 Q5 0 3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q5 7 6 6',
 D:'M1 0 L1 7 L3.6 7 Q6.4 7 6.4 3.5 Q6.4 0 3.6 0 Z',
 E:'M6 0 L1 0 L1 7 L6 7 M1 3.5 L5.2 3.5',
 F:'M1 7 L1 0 L6 0 M1 3.5 L5.2 3.5',
 G:'M6 1 Q5 0 3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q5.3 7 6.2 5.8 L6.2 4 L4.3 4',
 H:'M1 0 L1 7 M6 0 L6 7 M1 3.5 L6 3.5',
 I:'M1 0 L6 0 M3.5 0 L3.5 7 M1 7 L6 7',
 J:'M1 0 L6 0 M4.5 0 L4.5 5.4 Q4.5 7 2.8 7 Q1.3 7 1 5.8',
 K:'M1 0 L1 7 M6 0 L1 4 M3.1 3.2 L6 7',
 L:'M1 0 L1 7 L6 7',
 M:'M1 7 L1 0 L3.5 3.2 L6 0 L6 7',
 N:'M1 7 L1 0 L6 7 L6 0',
 O:'M3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q6 7 6 3.5 Q6 0 3.5 0 Z',
 P:'M1 7 L1 0 L4.1 0 Q6.1 0 6.1 2 Q6.1 4 4.1 4 L1 4',
 Q:'M3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q6 7 6 3.5 Q6 0 3.5 0 Z M4.2 5.2 L6.5 7.4',
 R:'M1 7 L1 0 L4.1 0 Q6.1 0 6.1 2 Q6.1 4 4.1 4 L1 4 M4 4 L6.3 7',
 S:'M6 1 Q5.1 0 3.5 0 Q1 0 1 1.9 Q1 3.4 3.4 3.6 Q6 3.8 6 5.3 Q6 7 3.5 7 Q1.8 7 1 6',
 T:'M1 0 L6 0 M3.5 0 L3.5 7',
 U:'M1 0 L1 5 Q1 7 3.5 7 Q6 7 6 5 L6 0',
 V:'M1 0 L3.5 7 L6 0',
 W:'M0.7 0 L2.1 7 L3.5 3.7 L4.9 7 L6.3 0',
 X:'M1 0 L6 7 M6 0 L1 7',
 Y:'M1 0 L3.5 3.7 L6 0 M3.5 3.7 L3.5 7',
 Z:'M1 0 L6 0 L1 7 L6 7',
 '?':'M1.2 1.2 Q2 0 3.6 0 Q6 0 6 1.9 Q6 3.1 4.4 4 L3.5 4.8 M3.5 6.6 L3.5 7',
 '!':'M3.5 0 L3.5 5 M3.5 6.6 L3.5 7',
 '-':'M1.2 3.5 L5.8 3.5',
 "'":'M3.5 0 L3.1 1.7',
 ' ':''
};
function vectorText(text,x,y,height,color='#fff',weight=1.0,spacing=.9){
  const str=clean(text).toUpperCase();
  const scale=height/7;const advance=(7+spacing)*scale;let out='';
  [...str].forEach((ch,i)=>{const d=GLYPHS[ch]??GLYPHS['?'];if(!d)return;out+=`<path d="${d}" transform="translate(${x+i*advance} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`});
  return out;
}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);const composites=[];
  if(ab){const p=await sharp(ab).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:205})}
  if(bb){const p=await sharp(bb).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:205})}
  const lines=wrap(d?.question,27);const q1=lines[0]||'WHICH SHOULD I CHOOSE?';const q2=lines[1]||'';
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0b0d17"/>
    ${vectorText('TIEBREAK',60,38,22,'#c4b5fd',1.05,1.2)}
    ${vectorText(q1,60,82,40,'#ffffff',1.45,.75)}
    ${q2?vectorText(q2,60,133,40,'#ffffff',1.45,.75):''}
    <rect x="70" y="205" width="500" height="360" rx="22" fill="#fff"/>
    <rect x="630" y="205" width="500" height="360" rx="22" fill="#fff"/>
  </svg>`);
  const out=await sharp(base).composite(composites).png().toBuffer();
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
