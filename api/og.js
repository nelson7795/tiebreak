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
function wrap(text,max=34){const words=clean(text||'Which should I choose?').split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}

const G={
 'A':['01110','10001','10001','11111','10001','10001','10001'],'B':['11110','10001','10001','11110','10001','10001','11110'],'C':['01111','10000','10000','10000','10000','10000','01111'],'D':['11110','10001','10001','10001','10001','10001','11110'],'E':['11111','10000','10000','11110','10000','10000','11111'],'F':['11111','10000','10000','11110','10000','10000','10000'],'G':['01111','10000','10000','10111','10001','10001','01111'],'H':['10001','10001','10001','11111','10001','10001','10001'],'I':['11111','00100','00100','00100','00100','00100','11111'],'J':['00111','00010','00010','00010','10010','10010','01100'],'K':['10001','10010','10100','11000','10100','10010','10001'],'L':['10000','10000','10000','10000','10000','10000','11111'],'M':['10001','11011','10101','10101','10001','10001','10001'],'N':['10001','11001','10101','10011','10001','10001','10001'],'O':['01110','10001','10001','10001','10001','10001','01110'],'P':['11110','10001','10001','11110','10000','10000','10000'],'Q':['01110','10001','10001','10001','10101','10010','01101'],'R':['11110','10001','10001','11110','10100','10010','10001'],'S':['01111','10000','10000','01110','00001','00001','11110'],'T':['11111','00100','00100','00100','00100','00100','00100'],'U':['10001','10001','10001','10001','10001','10001','01110'],'V':['10001','10001','10001','10001','10001','01010','00100'],'W':['10001','10001','10001','10101','10101','10101','01010'],'X':['10001','10001','01010','00100','01010','10001','10001'],'Y':['10001','10001','01010','00100','00100','00100','00100'],'Z':['11111','00001','00010','00100','01000','10000','11111'],
 '0':['01110','10001','10011','10101','11001','10001','01110'],'1':['00100','01100','00100','00100','00100','00100','01110'],'2':['01110','10001','00001','00010','00100','01000','11111'],'3':['11110','00001','00001','01110','00001','00001','11110'],'4':['00010','00110','01010','10010','11111','00010','00010'],'5':['11111','10000','10000','11110','00001','00001','11110'],'6':['01110','10000','10000','11110','10001','10001','01110'],'7':['11111','00001','00010','00100','01000','01000','01000'],'8':['01110','10001','10001','01110','10001','10001','01110'],'9':['01110','10001','10001','01111','00001','00001','01110'],
 '?':['01110','10001','00001','00010','00100','00000','00100'],'!':['00100','00100','00100','00100','00100','00000','00100'],'-':['00000','00000','00000','11111','00000','00000','00000'],'.':['00000','00000','00000','00000','00000','00100','00100'],':':['00000','00100','00100','00000','00100','00100','00000'],"'":['00100','00100','00000','00000','00000','00000','00000'],' ':['00000','00000','00000','00000','00000','00000','00000']
};
function vtext(text,x,y,size,color='#fff',center=false){
 const s=Math.max(2,size/7),gap=s,advance=6*s,str=clean(text).toUpperCase();let start=x;if(center)start=x-(str.length*advance-gap)/2;let out='';
 [...str].forEach((ch,i)=>{const rows=G[ch]||G['?'];rows.forEach((row,ry)=>[...row].forEach((on,rx)=>{if(on==='1')out+=`<rect x="${start+i*advance+rx*s}" y="${y+ry*s}" width="${s+.15}" height="${s+.15}" rx="${Math.min(1,s/4)}" fill="${color}"/>`}))});return out;
}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);const composites=[];
  if(ab){const p=await sharp(ab).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:205})}
  if(bb){const p=await sharp(bb).resize(500,360,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:205})}
  const lines=wrap(d?.question,31);const q1=lines[0]||'Which should I choose?';const q2=lines[1]||'';
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg"><rect width="1200" height="630" fill="#0b0d17"/>${vtext('TIEBREAK',60,42,24,'#c4b5fd')}${vtext(q1,60,92,36,'#ffffff')}${q2?vtext(q2,60,137,36,'#ffffff'):''}<rect x="70" y="205" width="500" height="360" rx="22" fill="#fff"/><rect x="630" y="205" width="500" height="360" rx="22" fill="#fff"/></svg>`);
  const out=await sharp(base).composite(composites).png().toBuffer();
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
