if(location.hostname==='localhost'){
  const token=localStorage.getItem('safescroll-token');
  if(token)chrome.runtime.sendMessage({type:'dashboard-session',token,apiUrl:location.origin});
  window.addEventListener('message',e=>{if(e.origin===location.origin&&e.data?.source==='socialanalytics-dashboard'&&e.data?.type==='monitoring-state')chrome.runtime.sendMessage({type:'dashboard-monitoring',enabled:e.data.enabled});});
}else{
  let last='';
  const guard=document.createElement('button');guard.className='safescroll-guard';guard.textContent='● AI Guard';guard.setAttribute('aria-label','SocialAnalytics AI Guard');document.documentElement.append(guard);
  const panel=document.createElement('aside');panel.hidden=true;document.documentElement.append(panel);guard.onclick=()=>panel.hidden=!panel.hidden;
  function render(x){const w=x.warning;guard.className=`safescroll-guard ${w?.severity||'safe'}`;guard.textContent=`● AI Guard${w?' · Attention':''}`;panel.innerHTML=`<b>${w?'Potential concern':'AI Guard'}</b><p>${w?.message||x.analysis?.explanation||'Monitoring browser-visible page metadata only.'}</p>${x.analysis?`<small>Confidence: ${Math.round(x.analysis.confidence*100)}% · ${x.analysis.claim}</small>`:''}`;}
  function scan(){const title=document.title,description=document.querySelector('meta[name="description"]')?.content||'',key=`${location.href}|${title}`;if(key===last)return;last=key;chrome.runtime.sendMessage({type:'content-event',title,url:location.href,description,contentIdentifier:location.href},render);}
  new MutationObserver(()=>setTimeout(scan,500)).observe(document.documentElement,{subtree:true,childList:true});scan();
  chrome.runtime.onMessage.addListener(m=>{if(m.type==='guard-state'){guard.className=`safescroll-guard ${m.state}`;guard.textContent=m.state==='offline'?'● AI Guard · Sign in':m.state==='paused'?'● AI Guard · Paused':'● AI Guard';}});
}
