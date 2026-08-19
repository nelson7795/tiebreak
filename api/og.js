import sharp from 'sharp';
import { createRequire } from 'module';

const require=createRequire(import.meta.url);
const INTER_REG=require.resolve('@fontsource/inter/files/inter-latin-400-normal.woff2');
const INTER_BOLD=require.resolve('@fontsource/inter/files/inter-latin-700-normal.woff2');

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
async function textPng(text,width,height,size,color='#fff',bold=true,align='left'){
  return sharp({text:{text:clean(text),font:bold?'Inter Bold':'Inter',fontfile:bold?INTER_BOLD:INTER_REG,width,height,align,dpi:144,rgba:true}}).png().tint(color).toBuffer();
}

export default async function handler(req,res){
  try{
    const token=String(req.query.token||'');
    const d=await getTie(token);
    const opts=d?.options||[];
    const A=opts.find(o=>o.option_key==='A')||{};
    const B=opts.find(o=>o.option_key==='B')||{};
    const [ab,bb]=await Promise.all([img(A.image_url),img(B.image_url)]);
    const lines=wrap(d?.question,31);
    const q1=lines[0]||'Which should I choose?';
    const q2=lines[1]||'';

    const bg=await sharp({create:{width:1200,height:630,channels:4,background:'#0b0d17'}}).png().toBuffer();
    const layers=[];
    layers.push({input:await textPng('TIEBREAK',220,42,25,'#c4b5fd',true),left:60,top:34});
    layers.push({input:await textPng(q1,1040,58,40,'#ffffff',true),left:60,top:88});
    if(q2)layers.push({input:await textPng(q2,1040,58,40,'#ffffff',true),left:60,top:137});

    const whiteA=await sharp({create:{width:500,height:315,channels:4,background:'#ffffff'}}).png().toBuffer();
    const whiteB=await sharp({create:{width:500,height:315,channels:4,background:'#ffffff'}}).png().toBuffer();
    layers.push({input:whiteA,left:70,top:220});
    layers.push({input:whiteB,left:630,top:220});
    if(ab)layers.push({input:await sharp(ab).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer(),left:70,top:220});
    if(bb)layers.push({input:await sharp(bb).resize(500,315,{fit:'contain',background:'#ffffff'}).png().toBuffer(),left:630,top:220});

    const badgeA=await sharp({create:{width:60,height:60,channels:4,background:'#8b5cf6'}}).png().composite([{input:await textPng('A',60,44,28,'#ffffff',true,'center'),left:0,top:8}]).toBuffer();
    const badgeB=await sharp({create:{width:60,height:60,channels:4,background:'#8b5cf6'}}).png().composite([{input:await textPng('B',60,44,28,'#ffffff',true,'center'),left:0,top:8}]).toBuffer();
    layers.push({input:badgeA,left:80,top:230});
    layers.push({input:badgeB,left:640,top:230});

    const cta=await sharp({create:{width:420,height:56,channels:4,background:'#8b5cf6'}}).png().composite([{input:await textPng('VOTE ON TIEBREAK',420,38,22,'#ffffff',true,'center'),left:0,top:9}]).toBuffer();
    layers.push({input:cta,left:390,top:555});

    const out=await sharp(bg).composite(layers).png().toBuffer();
    res.setHeader('Content-Type','image/png');
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).send(out);
  }catch(e){console.error(e);res.status(404).end()}
}
