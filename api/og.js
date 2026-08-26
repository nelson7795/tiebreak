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
function centeredVector(text,y,height,color='#fff',weight=5.2,spacing=.55,width=1080){
  const str=clean(text).toUpperCase(),scale=height/7,advance=(7+spacing)*scale,total=Math.max(0,(str.length-1)*advance+7*scale);
  return vectorText(str,(width-total)/2,y,height,color,weight,spacing);
}

async function landscape(A,B,ab,bb){
  const composites=[];
  if(ab){const p=await sharp(ab).resize(505,340,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:60,top:150})}
  if(bb){const p=await sharp(bb).resize(505,340,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:635,top:150})}
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs><rect width="1200" height="630" fill="#0b0d17"/><rect x="48" y="28" width="1104" height="82" rx="24" fill="#121625" stroke="#2e3550" stroke-width="2"/><rect x="66" y="48" width="10" height="42" rx="5" fill="url(#brand)"/>${vectorText('TIEBREAK',96,49,38,'#ffffff',5.8,.6)}<rect x="60" y="150" width="505" height="340" rx="24" fill="#ffffff" stroke="#2d344a" stroke-width="3"/><rect x="635" y="150" width="505" height="340" rx="24" fill="#ffffff" stroke="#2d344a" stroke-width="3"/><rect x="180" y="510" width="840" height="90" rx="45" fill="url(#brand)"/>${vectorText('CLICK TO VOTE',375,535,38,'#ffffff',6.5,.55)}</svg>`);
  return sharp(base).composite(composites).png().toBuffer();
}

async function story(A,B,ab,bb){
  const composites=[];
  if(ab){const p=await sharp(ab).resize(470,900,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:40,top:390})}
  if(bb){const p=await sharp(bb).resize(470,900,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:570,top:390})}

  const base=Buffer.from(`<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
    <defs><linearGradient id="brand" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b5cf6"/><stop offset="1" stop-color="#d946ef"/></linearGradient></defs>
    <rect width="1080" height="1920" fill="#0b0d17"/>
    <rect x="60" y="92" width="960" height="114" rx="30" fill="#151a2b" stroke="#343b57" stroke-width="3"/>
    <rect x="82" y="122" width="12" height="54" rx="6" fill="url(#brand)"/>
    ${vectorText('TIEBREAK',118,121,44,'#ffffff',6,.45)}
    ${centeredVector('WHICH WOULD YOU CHOOSE',270,42,'#ffffff',5.6,.38)}
    <rect x="40" y="390" width="470" height="900" rx="34" fill="#ffffff"/>
    <rect x="570" y="390" width="470" height="900" rx="34" fill="#ffffff"/>
    <rect x="72" y="422" width="88" height="88" rx="24" fill="url(#brand)"/>
    ${centeredVector('A',439,46,'#ffffff',7,0,232)}
    <rect x="602" y="422" width="88" height="88" rx="24" fill="url(#brand)"/>
    <g transform="translate(530 0)">${centeredVector('B',439,46,'#ffffff',7,0,232)}</g>
    <rect x="40" y="1330" width="1000" height="8" rx="4" fill="url(#brand)"/>
    ${centeredVector('A OR B',1450,52,'#c4b5fd',6,.45)}
    ${centeredVector('CAST YOUR VOTE',1545,46,'#ffffff',5.8,.42)}
    ${centeredVector('TIEBREAK',1745,30,'#7f869b',4.4,.42)}
  </svg>`);

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
