import fs from 'node:fs/promises';
import path from 'node:path';

const U='https://ihnfetkbsrlsodabxsam.supabase.co';
const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[m]))}
async function getTie(token){const r=await fetch(`${U}/rest/v1/rpc/get_tiebreak`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify({p_share_token:token})});if(!r.ok)throw new Error('Tiebreak not found');return r.json()}
function short(s=''){let t=String(s).replace(/^Amazon\.com\s*[:|\-]?\s*/i,'').trim();if(t.length<=70)return t;let cut=t.slice(0,70);const last=cut.lastIndexOf(' ');if(last>45)cut=cut.slice(0,last);return cut+'…'}
export default async function handler(req,res){
  try{
    const token=String(req.query.token||'');
    const d=await getTie(token),opts=d?.options||[];
    const a=short(opts.find(o=>o.option_key==='A')?.name||'Option A'),b=short(opts.find(o=>o.option_key==='B')?.name||'Option B');
    const question=d?.question||'Which should I choose?',proto=req.headers['x-forwarded-proto']||'https',host=req.headers.host,origin=`${proto}://${host}`,canonical=`${origin}/d/${token}`,image=`${origin}/api/og?token=${encodeURIComponent(token)}&v=5`,title=`VOTE NOW: ${question}`,desc=`Tap this Tiebreak to vote A or B — ${a} vs ${b}.`;
    let html=await fs.readFile(path.join(process.cwd(),'index.html'),'utf8');
    const meta=`<meta property="og:type" content="website"><meta property="og:site_name" content="Tiebreak"><meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(desc)}"><meta property="og:url" content="${esc(canonical)}"><meta property="og:image" content="${esc(image)}"><meta property="og:image:secure_url" content="${esc(image)}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta property="og:image:type" content="image/png"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${esc(title)}"><meta name="twitter:description" content="${esc(desc)}"><meta name="twitter:image" content="${esc(image)}"><link rel="canonical" href="${esc(canonical)}">`;
    html=html.replace('</head>',`${meta}</head>`);
    res.setHeader('Content-Type','text/html; charset=utf-8');
    res.setHeader('Cache-Control','no-store, max-age=0');
    res.status(200).send(html);
  }catch{res.status(404).send('Tiebreak not found')}
}