import sharp from 'sharp';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';

async function getTie(token){
  const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify({p_share_token:token})});
  if(!r.ok)throw new Error('not found');
  return r.json();
}
async function img(url){if(!url)return null;const r=await fetch(url);if(!r.ok)return null;return Buffer.from(await r.arrayBuffer())}

const FONT={
A:['01110','10001','10001','11111','10001','10001','10001'],B:['11110','10001','10001','11110','10001','10001','11110'],C:['01111','10000','10000','10000','10000','10000','01111'],D:['11110','10001','10001','10001','10001','10001','11110'],E:['11111','10000','10000','11110','10000','10000','11111'],F:['11111','10000','10000','11110','10000','10000','10000'],G:['01111','10000','10000','10111','10001','10001','01111'],H:['10001','10001','10001','11111','10001','10001','10001'],I:['11111','00100','00100','00100','00100','00100','11111'],J:['00111','00010','00010','00010','10010','10010','01100'],K:['10001','10010','10100','11000','10100','10010','10001'],L:['10000','10000','10000','10000','10000','10000','11111'],M:['10001','11011','10101','10101','10001','10001','10001'],N:['10001','11001','10101','10011','10001','10001','10001'],O:['01110','10001','10001','10001','10001','10001','01110'],P:['11110','10001','10001','11110','10000','10000','10000'],Q:['01110','10001','10001','10001','10101','10010','01101'],R:['11110','10001','10001','11110','10100','10010','10001'],S:['01111','10000','10000','01110','00001','00001','11110'],T:['11111','00100','00100','00100','00100','00100','00100'],U:['10001','10001','10001','10001','10001','10001','01110'],V:['10001','10001','10001','10001','10001','01010','00100'],W:['10001','10001','10001','10101','10101','10101','01010'],X:['10001','10001','01010','00100','01010','10001','10001'],Y:['10001','10001','01010','00100','00100','00100','00100'],Z:['11111','00001','00010','00100','01000','10000','11111'],' ':['00000','00000','00000','00000','00000','00000','00000'],'?':['01110','10001','00001','00010','00100','00000','00100'],'!':['00100','00100','00100','00100','00100','00000','00100'],'.':['00000','00000','00000','00000','00000','00110','00110'],'-':['00000','00000','00000','11111','00000','00000','00000']};
function clean(s=''){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z ?!.-]/g,'').trim()}
function wrap(text,maxChars){const words=clean(text).split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=maxChars)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}
function pxText(text,x,y,scale,color){let out='',cx=x;for(const ch of clean(text)){const p=FONT[ch]||FONT[' '];for(let r=0;r<7;r++)for(let c=0;c<5;c++)if(p[r][c]==='1')out+=`<rect x="${cx+c*scale}" y="${y+r*scale}" width="${scale}" height="${scale}" rx="${Math.max(1,scale*.28)}" fill="${color}"/>`;cx+=6*scale}return out}

export default async function handler(req,res){
  try{
    const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
    const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
    const lines=wrap(d?.question||'Which should I choose?',34);let question='';lines.forEach((line,i)=>{question+=pxText(line,60,80+i*44,5,'#ffffff')});
    const baseSvg=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0b0d17"/>${pxText('TIEBREAK',60,28,3,'#c4b5fd')}${question}<rect x="70" y="195" width="500" height="335" rx="22" fill="#ffffff"/><rect x="630" y="195" width="500" height="335" rx="22" fill="#ffffff"/><rect x="382" y="552" width="436" height="62" rx="31" fill="#8b5cf6"/></svg>`);
    const comps=[];
    if(ab){const p=await sharp(ab).resize(500,335,{fit:'contain',background:'#ffffff'}).png().toBuffer();comps.push({input:p,left:70,top:195})}
    if(bb){const p=await sharp(bb).resize(500,335,{fit:'contain',background:'#ffffff'}).png().toBuffer();comps.push({input:p,left:630,top:195})}
    let out=await sharp(baseSvg).composite(comps).png().toBuffer();
    const overlay=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><circle cx="110" cy="235" r="30" fill="#8b5cf6"/>${pxText('A',96,220,4,'#ffffff')}<circle cx="670" cy="235" r="30" fill="#8b5cf6"/>${pxText('B',656,220,4,'#ffffff')}${pxText('VOTE ON TIEBREAK',427,570,4,'#ffffff')}</svg>`);
    out=await sharp(out).composite([{input:overlay,left:0,top:0}]).png().toBuffer();
    res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
  }catch(e){console.error(e);res.status(404).end()}
}
