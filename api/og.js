import sharp from 'sharp';
import fs from 'fs';
import { createRequire } from 'module';
import opentype from 'opentype.js';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';
const require=createRequire(import.meta.url);

let interBold;
function font(){
  if(interBold)return interBold;
  const fontPath=require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff');
  const b=fs.readFileSync(fontPath);
  const ab=b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength);
  interBold=opentype.parse(ab);
  return interBold;
}

async function getTie(token){
  const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify({p_share_token:token})});
  if(!r.ok)throw new Error('not found');
  return r.json();
}
async function img(url){if(!url)return null;const r=await fetch(url);if(!r.ok)return null;return Buffer.from(await r.arrayBuffer())}
function clean(s=''){return String(s).normalize('NFKD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7E]/g,'').trim()}
function wrap(text,max=40){const words=clean(text||'Which should I choose?').split(/\s+/);const lines=[];let line='';for(const w of words){if(!line)line=w;else if((line+' '+w).length<=max)line+=' '+w;else{lines.push(line);line=w}}if(line)lines.push(line);return lines.slice(0,2)}
function textPath(text,x,y,size,fill='#fff',center=false){
  const f=font(),t=clean(text),w=f.getAdvanceWidth(t,size);
  const start=center?x-w/2:x;
  return `<path d="${f.getPath(t,start,y,size).toPathData(2)}" fill="${fill}"/>`;
}

export default async function handler(req,res){
 try{
  const token=String(req.query.token||'');const d=await getTie(token);const opts=d?.options||[];const A=opts.find(o=>o.option_key==='A')||{};const B=opts.find(o=>o.option_key==='B')||{};
  const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);const composites=[];
  if(ab){const p=await sharp(ab).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:70,top:220})}
  if(bb){const p=await sharp(bb).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer();composites.push({input:p,left:630,top:220})}
  const lines=wrap(d?.question,38),q1=lines[0]||'Which should I choose?',q2=lines[1]||'';
  const base=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="630" fill="#0b0d17"/>
    ${textPath('TIEBREAK',60,62,26,'#c4b5fd')}
    ${textPath(q1,60,120,42,'#ffffff')}
    ${q2?textPath(q2,60,166,42,'#ffffff'):''}
    <rect x="70" y="220" width="500" height="315" rx="22" fill="#fff"/>
    <rect x="630" y="220" width="500" height="315" rx="22" fill="#fff"/>
  </svg>`);
  const photos=await sharp(base).composite(composites).png().toBuffer();
  const overlay=Buffer.from(`<svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <circle cx="110" cy="260" r="30" fill="#8b5cf6"/>${textPath('A',110,270,28,'#fff',true)}
    <circle cx="670" cy="260" r="30" fill="#8b5cf6"/>${textPath('B',670,270,28,'#fff',true)}
    <rect x="390" y="555" width="420" height="56" rx="28" fill="#8b5cf6"/>
    ${textPath('VOTE ON TIEBREAK',600,591,22,'#fff',true)}
  </svg>`);
  const out=await sharp(photos).composite([{input:overlay,left:0,top:0}]).png().toBuffer();
  res.setHeader('Content-Type','image/png');res.setHeader('Cache-Control','no-store, max-age=0');res.status(200).send(out);
 }catch(e){console.error(e);res.status(404).end()}
}
