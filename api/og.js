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

const GLYPHS={
 A:'M1 7 L3.5 0 L6 7 M1.8 4.8 L5.2 4.8',B:'M1 0 L1 7 M1 0 L4.2 0 Q6 0 6 1.7 Q6 3.4 4.2 3.4 L1 3.4 M4.2 3.4 Q6.2 3.4 6.2 5.2 Q6.2 7 4.2 7 L1 7',C:'M6 1 Q5 0 3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q5 7 6 6',D:'M1 0 L1 7 L3.6 7 Q6.4 7 6.4 3.5 Q6.4 0 3.6 0 Z',E:'M6 0 L1 0 L1 7 L6 7 M1 3.5 L5.2 3.5',F:'M1 7 L1 0 L6 0 M1 3.5 L5.2 3.5',G:'M6 1 Q5 0 3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q5.3 7 6.2 5.8 L6.2 4 L4.3 4',H:'M1 0 L1 7 M6 0 L6 7 M1 3.5 L6 3.5',I:'M1 0 L6 0 M3.5 0 L3.5 7 M1 7 L6 7',J:'M1 0 L6 0 M4.5 0 L4.5 5.4 Q4.5 7 2.8 7 Q1.3 7 1 5.8',K:'M1 0 L1 7 M6 0 L1 4 M3.1 3.2 L6 7',L:'M1 0 L1 7 L6 7',M:'M1 7 L1 0 L3.5 3.2 L6 0 L6 7',N:'M1 7 L1 0 L6 7 L6 0',O:'M3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q6 7 6 3.5 Q6 0 3.5 0 Z',P:'M1 7 L1 0 L4.1 0 Q6.1 0 6.1 2 Q6.1 4 4.1 4 L1 4',Q:'M3.5 0 Q1 0 1 3.5 Q1 7 3.5 7 Q6 7 6 3.5 Q6 0 3.5 0 Z M4.2 5.2 L6.5 7.4',R:'M1 7 L1 0 L4.1 0 Q6.1 0 6.1 2 Q6.1 4 4.1 4 L1 4 M4 4 L6.3 7',S:'M6 1 Q5.1 0 3.5 0 Q1 0 1 1.9 Q1 3.4 3.4 3.6 Q6 3.8 6 5.3 Q6 7 3.5 7 Q1.8 7 1 6',T:'M1 0 L6 0 M3.5 0 L3.5 7',U:'M1 0 L1 5 Q1 7 3.5 7 Q6 7 6 5 L6 0',V:'M1 0 L3.5 7 L6 0',W:'M0.7 0 L2.1 7 L3.5 3.7 L4.9 7 L6.3 0',X:'M1 0 L6 7 M6 0 L1 7',Y:'M1 0 L3.5 3.7 L6 0 M3.5 3.7 L3.5 7',Z:'M1 0 L6 0 L1 7 L6 7',' ':''
};
function vectorText(text,x,y,height,color='#fff',weight=5.2,spacing=.55){
  const str=clean(text).toUpperCase(),scale=height/7,advance=(7+spacing)*scale;let out='';
  [...str].forEach((ch,i)=>{const d=GLYPHS[ch]||'';if(d)out+=`<path d="${d}" transform="translate(${x+i*advance} ${y}) scale(${scale})" fill="none" stroke="${color}" stroke-width="${weight}" stroke-linecap="round" stroke-linejoin="round" vector-effect="non-scaling-stroke"/>`});
  return out;
}

async function landscape(A,B,ab,bb){
  const composites=[];
  if(ab){const p=await sharp(ab).resize(505,405,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:60,top:155})}
  if(bb){const p=await sharp(bb).resize(505,405,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:635,top:155})}
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#a78bfa"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs><rect width="1200" height="630" fill="#0b0d17"/><rect x="48" y="34" width="1104" height="86" rx="26" fill="#121625" stroke="#2e3550" stroke-width="2"/><rect x="66" y="55" width="10" height="44" rx="5" fill="url(#brand)"/>${vectorText('TIEBREAK',96,56,40,'#ffffff',5.8,.6)}<rect x="60" y="155" width="505" height="405" rx="24" fill="#ffffff" stroke="#2d344a" stroke-width="3"/><rect x="635" y="155" width="505" height="405" rx="24" fill="#ffffff" stroke="#2d344a" stroke-width="3"/><rect x="60" y="584" width="1080" height="6" rx="3" fill="url(#brand)" opacity=".9"/></svg>`);
  return sharp(base).composite(composites).png().toBuffer();
}

async function story(A,B,ab,bb){
  const composites=[];
  if(ab){const p=await sharp(ab).resize(460,820,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:55,top:430})}
  if(bb){const p=await sharp(bb).resize(460,820,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:565,top:430})}

  const base=Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient>
    </defs>
    <rect width="1080" height="1920" fill="#0b0d17"/>
    <rect x="55" y="100" width="970" height="120" rx="34" fill="#151a2b" stroke="#343b57" stroke-width="3"/>
    <rect x="82" y="130" width="12" height="60" rx="6" fill="url(#brand)"/>
    <text x="125" y="178" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="54" font-weight="900" letter-spacing="4">TIEBREAK</text>
    <text x="540" y="330" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="62" font-weight="800">Help me decide</text>
    <rect x="55" y="430" width="460" height="820" rx="34" fill="#ffffff"/>
    <rect x="565" y="430" width="460" height="820" rx="34" fill="#ffffff"/>
    <rect x="55" y="1285" width="970" height="8" rx="4" fill="url(#brand)"/>
    <text x="540" y="1435" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="900">Which would you choose?</text>
    <text x="540" y="1515" text-anchor="middle" fill="#c4b5fd" font-family="Arial,Helvetica,sans-serif" font-size="54" font-weight="800">A or B?</text>
    <text x="540" y="1655" text-anchor="middle" fill="#8b93a8" font-family="Arial,Helvetica,sans-serif" font-size="30" font-weight="600" letter-spacing="1">TIEBREAK</text>
  </svg>`);

  const overlay=Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs><rect x="78" y="455" width="82" height="82" rx="24" fill="url(#brand)"/><text x="119" y="513" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="900">A</text><rect x="588" y="455" width="82" height="82" rx="24" fill="url(#brand)"/><text x="629" y="513" text-anchor="middle" fill="#ffffff" font-family="Arial,Helvetica,sans-serif" font-size="48" font-weight="900">B</text></svg>`);

  composites.push({input:overlay,left:0,top:0});
  return sharp(base).composite(composites).png().toBuffer();
}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||''),format=String(req.query.format||'landscape');
  const d=await getTie(token),opts=d?.options||[],A=opts.find(o=>o.option_key==='A')||{},B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
  const out=format==='story'?await story(A,B,ab,bb):await landscape(A,B,ab,bb);
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
