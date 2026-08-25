// Tiebreak Analytics v1 — SANDBOX ONLY.
// Production does not load this file.
(function(){
  const U='https://ihnfetkbsrlsodabxsam.supabase.co';
  const K='sb_publishable_Zz7PZEK_yAZFCcm6DqJ5BA_vsoXCjks';
  const endpoint=`${U}/rest/v1/rpc/track_sandbox_analytics_event`;

  function sessionId(){
    try{
      let id=sessionStorage.getItem('tiebreak_analytics_session');
      if(!id){id=crypto.randomUUID();sessionStorage.setItem('tiebreak_analytics_session',id)}
      return id;
    }catch{return crypto.randomUUID()}
  }

  const sid=sessionId();
  const sent=new Set();

  function track(eventType,extra={}){
    const body={
      p_event_type:eventType,
      p_share_token:extra.shareToken||state?.shareToken||null,
      p_option_key:extra.optionKey||null,
      p_merchant:extra.merchant||null,
      p_session_id:sid,
      p_referrer:document.referrer||null,
      p_path:location.pathname+location.search,
      p_metadata:extra.metadata||{}
    };
    fetch(endpoint,{method:'POST',keepalive:true,headers:{apikey:K,Authorization:`Bearer ${K}`,'Content-Type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});
  }

  // A Tiebreak becomes a real created object the first time it is published.
  if(typeof publish==='function'){
    const basePublish=publish;
    publish=async function(){
      const before=state.shareToken;
      const token=await basePublish();
      if(!before&&token){
        track('tiebreak_created',{shareToken:token,metadata:{question:state.question||null,ai_pick:state.aiPick||null}});
      }
      return token;
    };
  }

  // Opening the share hub is the clearest share-intent signal available before
  // the native OS share sheet takes over.
  if(typeof openShareHub==='function'){
    const baseOpenShareHub=openShareHub;
    openShareHub=function(){
      baseOpenShareHub();
      if(state.shareToken)track('share_opened',{metadata:{source:location.pathname.startsWith('/d/')?'voter':'creator'}});
    };
  }

  // Public voting-page view. Do not count creator preview visits from '/'.
  function trackPublicVoteView(){
    const match=location.pathname.match(/^\/d\/([a-f0-9]+)/i);
    if(!match)return;
    const token=match[1];
    const key=`vote_view:${token}`;
    if(sent.has(key))return;
    sent.add(key);
    track('vote_page_viewed',{shareToken:token});
  }
  if(location.pathname.startsWith('/d/')){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',trackPublicVoteView,{once:true});
    else trackPublicVoteView();
  }

  // Count successful votes by checking that the local recorded vote matches the
  // requested option after the existing vote function completes.
  if(typeof cast==='function'){
    const baseCast=cast;
    cast=async function(k){
      const prior=typeof currentVote==='function'?currentVote():null;
      await baseCast(k);
      const after=typeof currentVote==='function'?currentVote():null;
      if(after===k){track('vote_cast',{optionKey:k,metadata:{changed_vote:!!prior&&prior!==k}})}
    };
  }

  // Retailer click-through is the money event. Capture it before navigation.
  document.addEventListener('click',e=>{
    const link=e.target.closest?.('.product-link');
    if(link){
      const card=link.closest('.compare-card,.vote-card');
      const optionKey=card?.querySelector('.option-badge')?.textContent?.trim()||null;
      track('product_clicked',{optionKey,merchant:link.dataset.merchant||'other',metadata:{destination:link.href||null}});
      return;
    }
    const createAgain=e.target.closest?.('#resetBtn,#makeOwnBtn');
    if(createAgain)track('create_another_clicked',{metadata:{button:createAgain.id}});
  },true);

  window.tiebreakAnalytics={track};
})();
