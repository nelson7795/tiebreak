// Affiliate routing layer for Tiebreak.
// Tracking is intentionally OFF until approved merchant IDs are added.
// When a merchant is enabled, outboundUrl(rawUrl) can apply approved tracking.

const AFFILIATE_CONFIG = Object.freeze({
  amazon: { enabled:false, tag:'' },
  target: { enabled:false, trackingUrl:'' },
  walmart: { enabled:false, trackingUrl:'' },
  expedia: { enabled:false, trackingUrl:'' },
  hotels: { enabled:false, trackingUrl:'' },
  vrbo: { enabled:false, trackingUrl:'' }
});

function merchantFor(rawUrl){
  try{
    const h=new URL(rawUrl).hostname.toLowerCase().replace(/^www\./,'');
    if(h==='amazon.com'||h.endsWith('.amazon.com')||h==='amzn.to')return'amazon';
    if(h==='target.com'||h.endsWith('.target.com'))return'target';
    if(h==='walmart.com'||h.endsWith('.walmart.com'))return'walmart';
    if(h==='expedia.com'||h.endsWith('.expedia.com'))return'expedia';
    if(h==='hotels.com'||h.endsWith('.hotels.com'))return'hotels';
    if(h==='vrbo.com'||h.endsWith('.vrbo.com'))return'vrbo';
    return'other';
  }catch{return'other'}
}

function addAmazonTag(rawUrl,tag){
  try{
    const u=new URL(rawUrl);
    if(!tag)return u.href;
    u.searchParams.set('tag',tag);
    return u.href;
  }catch{return rawUrl}
}

function wrapTrackingUrl(template,rawUrl){
  if(!template)return rawUrl;
  // Merchant-provided tracking URL templates should contain {url}.
  return template.includes('{url}')
    ? template.replace('{url}',encodeURIComponent(rawUrl))
    : rawUrl;
}

function outboundUrl(rawUrl){
  const safe=typeof safeUrl==='function'?safeUrl(rawUrl):rawUrl;
  if(!safe)return'';
  const merchant=merchantFor(safe);
  const cfg=AFFILIATE_CONFIG[merchant];
  if(!cfg||!cfg.enabled)return safe;

  switch(merchant){
    case'amazon': return addAmazonTag(safe,cfg.tag);
    case'target':
    case'walmart':
    case'expedia':
    case'hotels':
    case'vrbo': return wrapTrackingUrl(cfg.trackingUrl,safe);
    default:return safe;
  }
}

function affiliateStatus(rawUrl){
  const merchant=merchantFor(rawUrl);
  const cfg=AFFILIATE_CONFIG[merchant];
  return {merchant,enabled:!!cfg?.enabled};
}
