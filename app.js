const U='https://ihnfetkbsrlsodabxsam.supabase.co',K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';
const $=id=>document.getElementById(id);
const state={question:'Which should I choose?',context:'',options:{A:{name:'Option A',image:null,file:null,link:'',price:'',edit:{zoom:1,x:0,y:0,rotation:0}},B:{name:'Option B',image:null,file:null,link:'',price:'',edit:{zoom:1,x:0,y:0,rotation:0}}},votes:{A:0,B:0},shareToken:null,aiPick:null};
function show(id){document.querySelectorAll('.view').forEach(x=>x.classList.remove('active'));$(id).classList.add('active');if(id==='resultsView')results();scrollTo(0,0)}
document.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>show(b.dataset.go));
function esc(s=''){return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]))}
function safeUrl(s){try{const u=new URL(s);return /^https?:$/.test(u.protocol)?u.href:''}catch{return''}}
function toast(s){$('toast').textContent=s;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2400)}
function transform(k){const e=state.options[k].edit;return `translate(${e.x}%,${e.y}%) scale(${e.zoom}) rotate(${e.rotation}deg)`}
function paint(k){$(`preview${k}`).style.transform=transform(k)}
function autoFrame(k,img){
  const box=$(`upload${k}`);
  if(!img?.naturalWidth||!img?.naturalHeight||!box)return;
  const frameRatio=(box.clientWidth||16)/(box.clientHeight||9);
  const imageRatio=img.naturalWidth/img.naturalHeight;
  let zoom=imageRatio>frameRatio?imageRatio/frameRatio:frameRatio/imageRatio;
  zoom=Math.max(1,Math.min(zoom,3));
  state.options[k].edit={zoom:+zoom.toFixed(2),x:0,y:0,rotation:0};
  $(`zoom${k}`).value=state.options[k].edit.zoom;
  $(`x${k}`).value=0;$(`y${k}`).value=0;
  paint(k);
}
for(const k of ['A','B']){
  document.querySelector(`[data-upload="${k}"]`).onclick=()=>$( `file${k}`).click();
  $(`file${k}`).onchange=e=>{const f=e.target.files[0];if(!f)return;state.options[k].file=f;state.options[k].image=URL.createObjectURL(f);state.options[k].edit={zoom:1,x:0,y:0,rotation:0};const im=$(`preview${k}`);im.onload=()=>autoFrame(k,im);im.src=state.options[k].image;im.classList.remove('hidden');document.querySelector(`[data-upload="${k}"]`).classList.add('hidden');$(`edit${k}`).classList.remove('hidden')};
  $(`zoom${k}`).oninput=e=>{state.options[k].edit.zoom=+e.target.value;paint(k)};
  $(`x${k}`).oninput=e=>{state.options[k].edit.x=+e.target.value;paint(k)};
  $(`y${k}`).oninput=e=>{state.options[k].edit.y=+e.target.value;paint(k)};
  document.querySelector(`[data-rotate="${k}"]`).onclick=()=>{state.options[k].edit.rotation=(state.options[k].edit.rotation+90)%360;paint(k)};
  document.querySelector(`[data-fit="${k}"]`).onclick=()=>{state.options[k].edit={zoom:1,x:0,y:0,rotation:0};$(`zoom${k}`).value=1;$(`x${k}`).value=0;$(`y${k}`).value=0;paint(k)};
}
function sync(){state.question=$('questionInput').value.trim()||'Which should I choose?';state.context=$('contextInput').value.trim();for(const k of ['A','B']){state.options[k].name=$(`option${k}Name`).value.trim()||`Option ${k}`;state.options[k].link=$(`option${k}Link`).value.trim();state.options[k].price=$(`option${k}Price`).value.trim()}}
function card(k,vote=false){const o=state.options[k],im=o.image?`<div class="option-image"><img src="${o.image}" style="transform:${transform(k)}"></div>`:`<div class="option-image">No photo</div>`,ln=safeUrl(o.link)?`<a class="product-link" target="_blank" rel="noopener" href="${safeUrl(o.link)}">View item ↗</a>`:'';return `<div class="${vote?'vote-card':'compare-card'}"><div class="option-badge">${k}</div>${im}<h3>${esc(o.name)}</h3>${o.price?`<div class="price-line">${esc(o.price)}</div>`:''}${ln}${vote?`<button class="primary wide vote-btn" data-vote="${k}">Vote ${k}</button>`:''}</div>`}
function choose(){const A=state.options.A,B=state.options.B;let a=0,b=0;if(A.price&&B.price){const pa=parseFloat(A.price.replace(/[^0-9.]/g,'')),pb=parseFloat(B.price.replace(/[^0-9.]/g,''));if(pa<pb)a++;if(pb<pa)b++}state.aiPick=a===b?(Math.random()<.5?'A':'B'):(a>b?'A':'B');return state.aiPick}
$('decideBtn').onclick=()=>{sync();const p=choose();$('verdictQuestion').textContent=state.question;$('verdictLetter').textContent=p;$('verdictWinner').textContent=state.options[p].name;$('verdictReason').textContent='Based on the information provided, this is the stronger pick right now. Friends can vote too.';$('verdictOptions').innerHTML=card('A')+card('B');show('verdictView')};
async function rpc(name,body){const r=await fetch(`${U}/rest/v1/rpc/${name}`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify(body)});if(!r.ok)throw Error(`${name}: ${await r.text()}`);return r.json()}
async function upload(k){const o=state.options[k];if(!o.file)return o.image&&/^https?:/.test(o.image)?o.image:null;const ext=(o.file.name.split('.').pop()||'jpg').toLowerCase(),name=`${crypto.randomUUID()}-${k}.${ext}`;const r=await fetch(`${U}/storage/v1/object/tiebreak-images/${name}`,{method:'POST',headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':o.file.type||'application/octet-stream'},body:o.file});if(!r.ok)throw Error(`Option ${k} image upload failed: ${await r.text()}`);return `${U}/storage/v1/object/public/tiebreak-images/${name}`}
function token(){const a=crypto.getRandomValues(new Uint8Array(24));return[...a].map(x=>x.toString(16).padStart(2,'0')).join('')}
async function publish(){if(state.shareToken)return state.shareToken;toast('Publishing…');const ia=await upload('A'),ib=await upload('B'),ct=token(),opt=(k,img)=>{const o=state.options[k];return{name:o.name,image_url:img,product_url:safeUrl(o.link)||null,price_text:o.price||null,source_text:null,image_zoom:o.edit.zoom,image_x:o.edit.x,image_y:o.edit.y,image_rotation:o.edit.rotation}},d=await rpc('create_tiebreak',{p_creator_token:ct,p_question:state.question,p_context:state.context||null,p_option_a:opt('A',ia),p_option_b:opt('B',ib)}),row=Array.isArray(d)?d[0]:d;if(!row?.share_token)throw Error('No share token returned');state.shareToken=row.share_token;localStorage.setItem(`creator_${row.share_token}`,ct);return row.share_token}
function votePage(){$('voteQuestion').textContent=state.question;$('voteOptions').innerHTML=card('A',true)+card('B',true);document.querySelectorAll('.vote-btn').forEach(b=>b.onclick=()=>cast(b.dataset.vote));show('voteView')}
$('shareBtn').onclick=async()=>{try{await publish();const u=`${location.origin}/d/${state.shareToken}`;if(navigator.share){try{await navigator.share({title:'Tiebreak',text:state.question,url:u})}catch(e){if(e.name!=='AbortError')throw e}}else{await navigator.clipboard.writeText(u);toast('Live link copied!')}votePage()}catch(e){console.error(e);toast(`Could not publish: ${String(e.message||e).slice(0,90)}`)}};
$('creatorVoteBtn').onclick=async()=>{try{await publish();votePage()}catch(e){console.error(e);toast(`Could not publish: ${String(e.message||e).slice(0,90)}`)}};
async function cast(k){try{let fp=localStorage.getItem('voter')||crypto.randomUUID();localStorage.setItem('voter',fp);const v=await rpc('cast_vote',{p_share_token:state.shareToken,p_option_key:k,p_voter_fingerprint:fp});state.votes={A:+v.A||0,B:+v.B||0};$('voteConfirmation').classList.remove('hidden');document.querySelectorAll('.vote-btn').forEach(b=>b.disabled=true);toast('Vote counted')}catch(e){console.error(e);toast('Vote failed')}}
async function load(t){const d=await rpc('get_tiebreak',{p_share_token:t});if(!d)throw Error('Not found');state.shareToken=d.share_token;state.question=d.question;state.context=d.context||'';state.votes={A:+d.votes.A||0,B:+d.votes.B||0};state.aiPick=d.ai_pick;for(const o of d.options){state.options[o.option_key]={name:o.name,image:o.image_url,file:null,link:o.product_url||'',price:o.price_text||'',edit:{zoom:+(o.image_zoom||1),x:+(o.image_x||0),y:+(o.image_y||0),rotation:+(o.image_rotation||0)}}}votePage()}
async function results(){if(state.shareToken)try{const d=await rpc('get_tiebreak',{p_share_token:state.shareToken});state.votes={A:+d.votes.A||0,B:+d.votes.B||0}}catch{}const n=state.votes.A+state.votes.B,a=n?Math.round(state.votes.A/n*100):0,b=n?100-a:0,w=!n?'—':state.votes.A===state.votes.B?'Tie':state.votes.A>state.votes.B?'A':'B';$('resultsQuestion').textContent=state.question;$('resultsWinner').textContent=w;$('resultsWinnerName').textContent=w==='Tie'?'It’s a tie':w==='—'?'No votes yet':state.options[w].name;$('aiPickResult').textContent=state.aiPick||'—';$('peoplePickResult').textContent=w;$('totalVotes').textContent=n;$('pctA').textContent=a+'%';$('pctB').textContent=b+'%';$('barA').style.width=a+'%';$('barB').style.width=b+'%'}
$('resetBtn').onclick=()=>location.href='/';const m=location.pathname.match(/^\/d\/([a-f0-9]+)/i);if(m)load(m[1]).catch(()=>{toast('Tiebreak not found');show('homeView')});