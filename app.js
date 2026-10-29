import {CONFIG} from './config.js?v=20261029o'
const $=id=>document.getElementById(id),V=$('view');
const f=(n,d=2)=>n==null||isNaN(n)?'—':(+n).toLocaleString('en-US',{maximumFractionDigits:d});
const usd=n=>n==null?'—':'$'+(Math.abs(n)>=1e6?f(n/1e6)+'M':Math.abs(n)>=1e3?f(n/1e3)+'K':f(n));
const short=a=>a?a.slice(0,4)+'…'+a.slice(-4):'—';
const sym=m=>(CONFIG.PAIRS.find(p=>p.m===m)||{s:short(m)}).s;
const safeUrl=u=>/^https:\/\//i.test(u||'')?u:'';const cImg=(x,z=28)=>{const u=safeUrl(x.meta&&x.meta.image);return u?`<img src="${esc(u)}" alt="" width="${z}" height="${z}" style="border-radius:50%;object-fit:cover;vertical-align:middle;margin-right:8px" loading="lazy">`:''};const coinName=x=>x.meta&&x.meta.name?`${esc(x.meta.name)} <span class="mono" style="opacity:.6">$${esc(x.meta.symbol)}</span>`:esc(short(x.mintA));
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let L=null;const lib=async()=>L||(L=await import('./launch.bundle.js?v=20261029o'));
// ---------- data (cached) ----------
let DATA,POOLS;
async function data(){if(DATA!==undefined)return DATA;try{const r=await fetch(CONFIG.DATA_URL,{cache:'no-store'});DATA=r.ok?await r.json():null}catch{DATA=null}return DATA}
async function pools(){if(POOLS!==undefined)return POOLS;if(!CONFIG.PLATFORM_ID)return POOLS=null;try{POOLS=await (await lib()).listLaunches(CONFIG)}catch{POOLS=undefined;return null}return POOLS}
// ---------- wallet ----------
const WALLETS=[['phantom','Phantom',()=>window.phantom?.solana],['solflare','Solflare',()=>window.solflare],['backpack','Backpack',()=>window.backpack]];
function renderWal(){const pk=L&&L.pubkey();const w=$('walbtn');
 w.innerHTML=pk?`<button type="button" id="wb">${short(pk)}</button>`:`<button type="button" class="pri" id="wb">Select Wallet</button>`;
 $('wb').onclick=async()=>{if(pk){await L.disconnect();renderWal();route();return}openWal()}}
function openWal(){const found=WALLETS.filter(w=>w[2]());$('wlist').innerHTML=found.length?found.map(([k,n])=>`<button type="button" data-w="${k}">${n}</button>`).join(''):'<p class="mono lbl" style="margin-top:12px">No Solana wallet detected in this browser. Install Phantom, Solflare or Backpack.</p>';
 $('wmodal').hidden=false;$('wlist').querySelectorAll('button').forEach(b=>b.onclick=async()=>{try{await (await lib()).connect(b.dataset.w);$('wmodal').hidden=true;renderWal();route()}catch(e){alert(e.message)}})}
$('wclose').onclick=()=>$('wmodal').hidden=true;
// ---------- shared bits ----------
const caPill=()=>`<div class="ca"><span class="pill">LAUNCHING</span><span class="mono lbl">$HOLD</span><code title="${CONFIG.MINT}">${short(CONFIG.MINT)}</code><button class="mono cp" data-v="${CONFIG.MINT}">COPY</button></div>`;
function wireCopy(){V.querySelectorAll('.cp').forEach(b=>b.onclick=()=>{navigator.clipboard.writeText(b.dataset.v);b.textContent='COPIED';setTimeout(()=>b.textContent='COPY',1200)})}
const live='<span class="note">LIVE AFTER THE FIRST LAUNCH</span>';
const card=(l,v,sub)=>`<div class="sc"><span class="mono lbl">${l}</span><b>${v}</b><small>${sub}</small></div>`;
const mini=(l,v)=>`<div class="sc mini"><span>${l}</span><b>${v}</b></div>`;
function nextAt(d){if(d&&d.nextPayoutAt)return new Date(d.nextPayoutAt);const n=new Date(),t=new Date(n);t.setUTCHours(CONFIG.SCHEDULE.payoutUtcHour,0,0,0);while(t<=n)t.setTime(t.getTime()+CONFIG.SCHEDULE.snapshotEveryHours*36e5);return t}
let cdT;function countdown(el,t){clearInterval(cdT);const tick=()=>{let s=Math.max(0,(t-Date.now())/1e3|0);el.textContent=`${s/86400|0}d ${(s%86400)/3600|0}h ${(s%3600)/60|0}m ${s%60}s`};tick();cdT=setInterval(tick,1000)}
const PC={SOL:['#9945FF','#14F195'],USDC:['#3b8cff','#1a3f8f'],USDT:['#2fd3a0','#0b6b52'],SPCXx:['#2b2f3a','#9aa4b8'],TSLAx:['#ff3b3b','#7a0d12'],NVDAx:['#9be33a','#2f6b00'],AAPLx:['#e9e9ee','#7c7c86'],GOOGLx:['#4f8cff','#1aa260'],METAx:['#3d7bff','#7a3dff'],AMZNx:['#ffb43a','#b35a00'],MSTRx:['#ff8a1f','#a12a00'],COINx:['#2f6bff','#0b2aa8'],HOODx:['#c6ff3a','#3f8f00'],CRCLx:['#46d4ff','#5a3dff'],SPYx:['#e8e2c8','#8a7a4a'],QQQx:['#33e0c0','#0a5f7a']};
const icon=p=>p&&p.i?'img/pairs/'+p.i+'?v=20261029o':'';const TL={crypto:'Crypto',xstock:'xStock',stock:'Stock'};const mono=s=>s.replace(/x$/,'').replace(/\..*/,'').slice(0,5);
const coinImg=p=>{const b=mono(p.s);return icon(p)?`<img src="${icon(p)}" alt="" width="96" height="96" loading="lazy" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'mg',textContent:'${b}'}))">`:`<span class="mg" style="font-size:${b.length>4?14:b.length>3?16:b.length>2?19:24}px">${b}</span>`};
function pairGrid(){const N=13,sh=CONFIG.PAIRS.slice(0,N),more=CONFIG.PAIRS.length-N;return `<div class="pg"><p class="pg-h mono">${CONFIG.PAIRS.length} PAIRS · HOLDERS PAID IN THE PAIR</p><div class="pg-g">${sh.map((p,i)=>{const c=PC[p.s]||['#3a3a34','#121210'];
return `<a class="tk" href="#/launch/${encodeURIComponent(p.s)}" title="Launch paired to ${p.n}" style="--a:${c[0]};--b:${c[1]};--d:${(i%7)*.35}s"><span class="coin"><span class="face">${coinImg(p)}</span></span><b class="mono">${p.s}</b><i>${p.s==='SOL'?'Native':TL[p.t]}</i></a>`}).join('')}<a class="tk more" href="#/launch" style="--a:#E8FF3A;--b:#6b7a00;--d:1.2s"><span class="coin"><span class="face"><span class="mg" style="color:#000;text-shadow:none;font-size:17px">+${more}</span></span></span><b class="mono">More</b><i>All pairs</i></a></div></div>`}
// ---------- pages ----------
const P={};
P['']=()=>{V.className='';V.innerHTML=`<header class="hero"><p class="eyebrow mono">RAYDIUM LAUNCHLAB · SOLANA</p><h1>Paper hands pay<br>the diamond hands.</h1>
<p class="lede">Launch a coin paired to SOL or a tokenized stock. Fees go to holders by how long they've held. Sell and your clock resets.</p>${caPill()}
<div class="ctas"><a class="pri" href="#/launch">Launch a coin</a><a href="#/docs">Read the docs</a></div></header>
<section><ol class="steps"><li><b>Pick a pair.</b> SOL, stables, majors, memes or a tokenized stock like TSLAx.</li><li><b>Hold.</b> Weight = tokens × days held. Any sell resets your days to 0.</li><li><b>Get paid.</b> Holder fees are paid in the pair token. Stock pair, you're paid in stock.</li></ol>
${pairGrid()}
<div class="split"><div><b>${CONFIG.SPLIT.holders}%</b><span>Coin holders</span></div><div><b>${CONFIG.SPLIT.buyHold}%</b><span>Buys $HOLD</span></div></div></section>`;wireCopy()};
P.launch=(arg)=>{V.className='';V.innerHTML=`<div class="page-h" style="text-align:center"><h1>Launch a coin</h1><p style="margin:8px auto 0">Built in your browser, signed by your wallet. We never see a key.</p></div>
<section class="card launch"><form onsubmit="return false" autocomplete="off">
<div class="row"><label>Name<input id="fname" maxlength="32" placeholder="Coin name"></label><label class="sm">Ticker<input id="fsym" maxlength="10" placeholder="TICKER"></label></div>
<label>Image<input id="fimg" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="file"></label>
<label>Description<textarea id="fdesc" rows="2" maxlength="500" placeholder="What is it"></textarea></label>
<div class="row"><label>X<input id="fx" placeholder="https://x.com/…"></label><label>Website<input id="fweb" placeholder="https://"></label></div>
<label>Pair with <span class="hint" id="pairhint"></span></label><div class="pairs" id="pairs"></div>
<label>First buy <span class="hint" id="buyunit">SOL</span><input id="fbuy" type="number" min="0" step="any" value="0"></label>
<div class="acts"><button class="go" id="blaunch" type="button">Launch</button></div><p class="mono status" id="lstat"></p></form></section>`;
 let PI=0,TAB='all',Q='';const PL=$('pairs');PL.className='pk';PL.innerHTML=`<div class="pk-top"><div class="pk-tabs">${[['all','All'],['crypto','Crypto'],['xstock','xStocks'],['stock','Stocks']].map(([k,t])=>`<button type="button" data-t="${k}" class="${k==='all'?'on':''}">${t} <span>${k==='all'?CONFIG.PAIRS.length:CONFIG.PAIRS.filter(p=>p.t===k).length}</span></button>`).join('')}</div><input id="pkq" placeholder="Search ${CONFIG.PAIRS.length} pairs" autocomplete="off"></div><div class="pk-list" id="pkl"></div>`;
 const hint=i=>{PI=i;$('pairhint').textContent='· holders paid in '+CONFIG.PAIRS[i].s;$('buyunit').textContent=CONFIG.PAIRS[i].s};
 const draw=()=>{const q=Q.toLowerCase();$('pkl').innerHTML=CONFIG.PAIRS.map((p,i)=>[p,i]).filter(([p])=>(TAB==='all'||p.t===TAB)&&(!q||p.s.toLowerCase().includes(q)||p.n.toLowerCase().includes(q)||p.m===Q)).map(([p,i])=>`<button type="button" data-i="${i}" class="${i===PI?'on':''}" title="${p.m}"><span class="pk-ic">${coinImg(p)}</span><span class="pk-tx"><b>${p.s}<em>${p.s==='SOL'?'Native':TL[p.t]}</em></b><small>${p.n}</small></span></button>`).join('')||'<p class="pk-none">No pairs match.</p>'};
 PL.onclick=e=>{const t=e.target.closest('[data-t]');if(t){TAB=t.dataset.t;PL.querySelectorAll('[data-t]').forEach(x=>x.classList.toggle('on',x===t));draw();return}const b=e.target.closest('[data-i]');if(!b)return;hint(+b.dataset.i);draw()};
 $('pkq').oninput=e=>{Q=e.target.value.trim();draw()};
 {const j=CONFIG.PAIRS.findIndex(p=>p.s.toLowerCase()===decodeURIComponent(String(arg||'')).toLowerCase());hint(j>0?j:0);draw();if(j>0)setTimeout(()=>$('pkl').querySelector('.on')?.scrollIntoView({block:'nearest'}),0)}
 const st=(t,c='')=>{$('lstat').textContent=t;$('lstat').className='mono status '+c};
 const vals=()=>({name:$('fname').value.trim(),symbol:$('fsym').value.trim().toUpperCase(),pair:{...CONFIG.PAIRS[PI],mint:CONFIG.PAIRS[PI].m},buyUi:+$('fbuy').value||0});
 const b=$('blaunch'),pk=L&&L.pubkey();b.disabled=!(pk&&CONFIG.IPFS_ENDPOINT);b.textContent=!CONFIG.IPFS_ENDPOINT?'Launch (upload not configured)':!pk?'Select a wallet to launch':'Launch';if(!CONFIG.IPFS_ENDPOINT)$('lstat').textContent='Image upload is coming online shortly, so launching is paused for a moment.';
 b.onclick=async()=>{if(!CONFIG.IPFS_ENDPOINT)return st('Image upload is not online yet. Launching opens as soon as it is.','bad');const v=vals(),fi=$('fimg').files[0];if(!v.name||!v.symbol||!fi)return st('Name, ticker and image are required.','bad');if(!/^image\/(png|jpeg|gif|webp)$/.test(fi.type))return st('Image must be PNG, JPEG, GIF or WebP.','bad');if(fi.size>4194304)return st('Image max 4 MB.','bad');if(!/^[A-Z0-9]{1,10}$/.test(v.symbol))return st('Ticker: 1-10 letters or digits.','bad');
  try{st('Uploading image and metadata…');const fd=new FormData();fd.append('file',fi);for(const[k,id]of[['name','fname'],['symbol','fsym'],['description','fdesc'],['twitter','fx'],['website','fweb']])fd.append(k,$(id).value);
  let up;try{up=await fetch(CONFIG.IPFS_ENDPOINT,{method:'POST',body:fd})}catch{throw new Error('Upload service unreachable. Try again in a minute.')}const uj=await up.json().catch(()=>({}));if(!up.ok)throw new Error('Upload failed: '+(uj.error||up.status));const {uri}=uj;if(!uri)throw new Error('Upload failed: no URI returned');st('Uploaded · '+uri.split('/').pop().slice(0,12)+'…');
  st('Check your wallet to sign…');const r=await (await lib()).launch(CONFIG,{...v,uri});POOLS=undefined;st(`Launched · ${r.mintA} · tx ${r.sig.slice(0,10)}…`,'ok')}catch(e){st(e.message,'bad')}}};
P.coins=async(arg)=>{V.className='wide';if(arg)return coin(arg);
 V.innerHTML=`<div class="page-h"><h1>Coins</h1><p>Every coin launched on the HoldPad platform, read from Raydium LaunchLab on-chain.</p></div>
 <div class="toolbar"><input id="q" placeholder="Search name, ticker, mint or pair"><div class="seg" id="sort"><button class="on" data-s="new">Newest</button><button data-s="mcap">Market cap</button><button data-s="prog">Curve progress</button></div></div>
 <div class="tbl"><table class="t"><thead><tr><th>Coin</th><th>Pair</th><th>Price</th><th>Market cap</th><th>Curve</th><th>Status</th></tr></thead><tbody id="rows"><tr><td colspan="6" class="emptyrow">Loading…</td></tr></tbody></table></div>`;
 const ps=await pools();let s='new';
 const draw=()=>{if(!ps||!ps.length){$('rows').innerHTML=`<tr><td colspan="6" class="emptyrow">${CONFIG.PLATFORM_ID?'No coins launched yet.':'First launches appear here once HoldPad goes live.'}</td></tr>`;return}
  const q=$('q').value.trim().toLowerCase();let xs=ps.filter(x=>!q||x.mintA.toLowerCase().includes(q)||(x.meta&&(x.meta.name+' '+x.meta.symbol).toLowerCase().includes(q))||sym(x.mintB).toLowerCase().includes(q));
  const pr=x=>x.raised/x.target;xs.sort((a,b)=>s==='mcap'?b.mcap-a.mcap:s==='prog'?pr(b)-pr(a):(+b.epoch)-(+a.epoch));
  $('rows').innerHTML=xs.map(x=>`<tr class="click" data-m="${x.mintA}"><td>${cImg(x)}${coinName(x)}</td><td>${sym(x.mintB)}</td><td>${f(x.price,8)}</td><td>${f(x.mcap)} ${sym(x.mintB)}</td><td>${f(pr(x)*100,1)}%</td><td>${x.status?'Graduated':'Curve'}</td></tr>`).join('');
  $('rows').querySelectorAll('tr.click').forEach(r=>r.onclick=()=>location.hash='#/coins/'+r.dataset.m)};
 $('q').oninput=draw;$('sort').onclick=e=>{const b=e.target.closest('button');if(!b)return;s=b.dataset.s;[...$('sort').children].forEach(x=>x.classList.toggle('on',x===b));draw()};draw()};
async function coin(m){V.innerHTML=`<a class="back" href="#/coins">← Coins</a><div class="page-h"><h1 class="mono" style="font-size:24px">${esc(short(m))}</h1><p class="mono" style="font-size:12px">${esc(m)}</p></div><div id="cd" class="emptyrow">Loading…</div>`;
 const ps=await pools(),x=ps&&ps.find(p=>p.mintA===m),d=await data(),kc=d&&d.coins&&d.coins[m];
 if(!x){$('cd').textContent='This mint is not a coin on the HoldPad platform.';return}
 {const mt=x.meta||{},lk=[['Raydium','https://raydium.io/launchpad/token/?mint='+m],['Solscan','https://solscan.io/token/'+m],['Website',safeUrl(mt.website)],['X',safeUrl(mt.twitter)],['Telegram',safeUrl(mt.telegram)]].filter(l=>l[1]);const h=document.querySelector('.page-h');if(h)h.innerHTML=`<h1 style="font-size:28px">${cImg(x,44)}${mt.name?esc(mt.name)+' <span class="mono" style="opacity:.6">$'+esc(mt.symbol)+'</span>':esc(short(m))}</h1><p class="mono" style="font-size:12px">${esc(m)}</p>${mt.description?`<p>${esc(mt.description)}</p>`:''}<p>${lk.map(l=>`<a href="${esc(l[1])}" target="_blank" rel="noopener">${l[0]}</a>`).join(' · ')}</p>`}
 const pr=x.raised/x.target;let hs=[];try{hs=await (await lib()).holders(CONFIG,m)}catch{}
 const lb=kc&&kc.leaderboard||[];
 $('cd').outerHTML=`<div class="cards">${card('PAIR',sym(x.mintB),x.mintB===CONFIG.PAIRS[0].m?'Holders paid in SOL':'Holders paid in '+sym(x.mintB))}${card('CURVE',f(pr*100,1)+'%',`${f(x.raised/10**x.decB)} / ${f(x.target/10**x.decB)} ${sym(x.mintB)}`)}${card('HOLDERS',hs.length?f(hs.length,0):'—','Accounts with a balance, on-chain')}${card('TRADE FEE','1.75%','Of every trade, to the HoldPad fee vault (pooled across coins)')}</div>
 <div class="bar2"><i style="width:${Math.min(100,pr*100)}%"></i></div>
 <div class="sec"><h3>HOLD-WEIGHT LEADERBOARD · HOLDPAD-LAUNCHED COINS</h3><p>${kc?'From the keeper snapshot at '+new Date(d.generatedAt).toLocaleString():'Starts with the first keeper snapshot.'}</p>
 <div class="tbl"><table class="t"><thead><tr><th>Rank</th><th>Wallet</th><th>Tokens</th><th>Days held</th><th>Weight</th><th>Est. share</th></tr></thead><tbody>${lb.length?lb.map(r=>`<tr><td>#${r.rank}</td><td>${short(r.wallet)}</td><td>${f(r.tokens,0)}</td><td>${f(r.daysHeld,1)}</td><td>${f(r.weight,0)}</td><td>${f(r.share*100,2)}%</td></tr>`).join(''):'<tr><td colspan="6" class="emptyrow">No snapshot yet.</td></tr>'}</tbody></table></div></div>`}
const TREAS='BzLLvPcULF9TZxT2ZqfLmWtq9eoYYrKAUHSWMkHWNkNQ',FVAULT='BWciVToAYw1dGqScxqou6p4QZqkCUzsTprEXBaFdR2c8';
async function rpcq(method,params){for(const u of CONFIG.RPC){try{const r=await (await fetch(u,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({jsonrpc:'2.0',id:1,method,params})})).json();if(r.result!==undefined)return r.result}catch{}}return null}
async function treasuryStats(){const [bal,vb,sigs]=await Promise.all([rpcq('getBalance',[TREAS]),rpcq('getTokenAccountBalance',[FVAULT]),rpcq('getSignaturesForAddress',[FVAULT,{limit:1000}])]);
 let claimed=0;const cs=(sigs||[]).filter(x=>!x.err);
 for(const x of cs){const t=await rpcq('getTransaction',[x.signature,{maxSupportedTransactionVersion:0,encoding:'jsonParsed'}]);if(!t||!t.meta)continue;const keys=t.transaction.message.accountKeys.map(k=>k.pubkey||k);const i=keys.indexOf(FVAULT);const pre=(t.meta.preTokenBalances||[]).find(b=>b.accountIndex===i),post=(t.meta.postTokenBalances||[]).find(b=>b.accountIndex===i);if(pre&&post){const d=(+pre.uiTokenAmount.amount)-(+post.uiTokenAmount.amount);if(d>0&&keys.includes(TREAS))claimed+=d/1e9}}
 return {bal:bal?bal.value/1e9:null,unclaimed:vb?+vb.value.uiAmountString:null,claimed:sigs?claimed:null}}
P.analytics=async()=>{V.className='wide';
 V.innerHTML=`<div class="page-h"><h1>Analytics</h1><p>Where HoldPad's fees go. Counts come from the LaunchLab platform account on Solana; payout totals come from the keeper's published snapshot.</p></div><div id="ac" class="emptyrow">Loading…</div>`;
 const [d,ps]=await Promise.all([data(),pools()]);const t=d&&d.totals;const pre=!t;const sub=(s)=>pre?live:s;
 const grad=ps?ps.filter(x=>x.status).length:null,stocks=ps?new Set(ps.map(x=>x.mintB).filter(m=>m!==CONFIG.PAIRS[0].m)).size:null;
 const bb=t&&t.buyHold;let sup=null;if(bb){try{sup=await (await lib()).supply(CONFIG,CONFIG.MINT)}catch{}}
 setTimeout(async()=>{const e=$('tre');if(!e)return;const r=await treasuryStats();const s4=v=>v==null?'—':f(v,4)+' SOL';e.innerHTML=`${card('FEES CLAIMED TO TREASURY',s4(r.claimed),'Summed from on-chain claim txs out of the SOL fee vault')}${card('UNCLAIMED FEES',s4(r.unclaimed),'<a href="https://solscan.io/account/'+FVAULT+'" target="_blank" rel="noopener">SOL fee vault</a>, live')}${card('TREASURY BALANCE',s4(r.bal),'<a href="https://solscan.io/account/'+TREAS+'" target="_blank" rel="noopener">Treasury wallet</a>, live')}`},0);
 $('ac').outerHTML=`<div class="cards">
 ${card('PAID TO COIN HOLDERS',t?usd(t.paidToHolders.usd):'—',sub(`${usd(t?.paidToHolders.pendingUsd)} more waiting for the next payout`))}
 ${card('$HOLD BOUGHT',t?usd(bb.usd):'—',sub(`${f(bb?.holdBought,0)} $HOLD${sup?' · '+f((bb.holdBought/sup)*100,2)+'% of supply':''}`))}
 ${card('COINS LAUNCHED',ps?f(ps.length,0):'0',`${grad==null?0:grad} graduated to Raydium`)}</div>
 <div class="cards" style="margin-top:10px">${mini('Total fees collected',t?usd(t.feesCollected.usd):'—')}${mini('Stocks in use',stocks==null?'0':stocks)}</div><div class="cards" style="margin-top:10px" id="tre"><div class="emptyrow">Reading treasury from Solana…</div></div>
 ${pre?`<p class="note" style="text-align:left;margin-top:10px">ALL FIGURES GO LIVE ONCE THE FIRST COINS LAUNCH ON HOLDPAD. NOTHING ON THIS PAGE IS ESTIMATED OR SAMPLE DATA.</p>`:''}
 <div class="sec"><h3>TOP HOLDERS OF HOLDPAD-LAUNCHED COINS</h3><p>Ranks wallets holding coins launched on HoldPad. Next payout: <span class="cd" id="cdn"></span> · ${esc(nextAt(d).toLocaleString())}. Weight = tokens × days held without selling, across every coin launched on HoldPad. Any sell resets that coin's days to 0.</p>
 <div class="lookup"><input id="lk" placeholder="Paste a wallet address to see its rank"><button id="lkb" type="button">Look up</button></div><p class="mono status" id="lkr"></p>
 <div class="tbl"><table class="t"><thead><tr><th>Rank</th><th>Wallet</th><th>Tokens</th><th>Days held</th><th>Weight</th><th>Est. share</th></tr></thead><tbody>
 ${d&&d.leaderboard&&d.leaderboard.length?d.leaderboard.slice(0,100).map(r=>`<tr><td>#${r.rank}</td><td>${short(r.wallet)}</td><td>${f(r.tokens,0)}</td><td>${f(r.daysHeld,1)}</td><td>${f(r.weight,0)}</td><td>${f(r.share*100,2)}%</td></tr>`).join(''):'<tr><td colspan="6" class="emptyrow">The leaderboard starts with the first snapshot after coins launch on HoldPad.</td></tr>'}</tbody></table></div></div>`;
 countdown($('cdn'),nextAt(d));
 const look=()=>{const w=$('lk').value.trim();const r=d&&d.leaderboard&&d.leaderboard.find(x=>x.wallet===w);$('lkr').textContent=!w?'':r?`Rank #${r.rank} · weight ${f(r.weight,0)} · est. share ${f(r.share*100,2)}%`:d?'Not on the leaderboard yet.':'No snapshot yet. Check back after launch.'};
 $('lkb').onclick=look;$('lk').onkeydown=e=>e.key==='Enter'&&look();const pk=L&&L.pubkey();if(pk){$('lk').value=pk;look()}};
P.profile=async()=>{V.className='wide';const pk=L&&L.pubkey();
 V.innerHTML=`<div class="page-h"><h1>Profile</h1><p>${pk?'<span class="mono">'+pk+'</span>':'Connect your wallet to see your HoldPad coins, days held, weight and rewards.'}</p></div><div id="pf"></div>`;
 if(!pk){$('pf').innerHTML='<div class="ctas" style="justify-content:flex-start;margin:0"><a class="pri" href="javascript:void 0" id="pc">Select Wallet</a></div>';$('pc').onclick=openWal;return}
 $('pf').innerHTML='<div class="emptyrow">Loading…</div>';const [d,ps]=await Promise.all([data(),pools()]);let toks=[];try{toks=await (await lib()).walletTokens(CONFIG,pk)}catch{}
 const ours=ps?toks.filter(t=>ps.some(p=>p.mintA===t.mint)):[];const me=d&&d.wallets&&d.wallets[pk];
 const row=t=>{const r=d&&d.coins&&d.coins[t.mint]&&(d.coins[t.mint].leaderboard||[]).find(x=>x.wallet===pk);return `<tr><td>${short(t.mint)}</td><td>${sym(ps.find(p=>p.mintA===t.mint).mintB)}</td><td>${f(t.ui,0)}</td><td>${r?f(r.daysHeld,1):'—'}</td><td>${r?f(r.weight,0):'—'}</td><td>${r?f(r.share*100,2)+'%':'—'}</td></tr>`};
 const obj=o=>o&&Object.keys(o).length?Object.entries(o).map(([k,v])=>f(v,6)+' '+k).join(' · '):'—';
 $('pf').innerHTML=`<div class="cards">${card('COINS HELD',f(ours.length,0),'HoldPad coins in this wallet')}${card('RECEIVED',me?usd(me.receivedUsd):'—',me?obj(me.received):'No payouts yet')}${card('PENDING',me?usd(me.pendingUsd):'—',me?obj(me.pending):'Paid at the next payout')}${card('NEXT PAYOUT','<span id="pcd" style="font-size:18px"></span>',nextAt(d).toLocaleString())}</div>
 <div class="sec"><h3>YOUR COINS</h3><div class="tbl"><table class="t"><thead><tr><th>Coin</th><th>Pair</th><th>Tokens</th><th>Days held</th><th>Weight</th><th>Est. share</th></tr></thead><tbody>${ours.length?ours.map(row).join(''):`<tr><td colspan="6" class="emptyrow">${ps?'No HoldPad coins in this wallet.':'Coins appear here after $HOLD goes live.'}</td></tr>`}</tbody></table></div></div>`;countdown($('pcd'),nextAt(d))};
P.docs=()=>{V.className='wide';const plat=CONFIG.PLATFORM_ID||'';const w=CONFIG.WALLETS;
 const T=[['overview','Overview'],['launching','Launching'],['pairs','Pairs'],['weight','Hold weight'],['fees','Fee split'],['payouts','Payouts'],['contracts','Contracts'],['faq','FAQ']];
 V.innerHTML=`<div class="docs"><aside>${T.map(([i,n])=>`<a href="javascript:void 0" data-j="${i}">${n}</a>`).join('')}</aside><article>
 <h2 id="d-overview">Overview</h2><p>HoldPad is a launchpad on Raydium LaunchLab. Every coin launched here pays its trading fees to its holders, weighted by how long they've held. Part of every fee buys back $HOLD.</p>
 <h2 id="d-launching">Launching</h2><ul><li>Connect Phantom, Solflare or Backpack.</li><li>Enter a name, ticker, image, description and links. The image and metadata are pinned to IPFS.</li><li>Pick a pair and an optional first buy. The create transaction is built in your browser, simulated, and signed by your wallet.</li><li>Supply is 1,000,000,000 with 6 decimals. ${f(793.1,1)}M are sold on the bonding curve. When the curve fills, the coin graduates to a Raydium CPMM pool.</li></ul>
 <h2 id="d-pairs">Pairs</h2><p>A coin trades against its pair token, so fees accrue in it and holders are paid in it. Pair a stock, you're paid in stock. Only pairs with a Raydium LaunchLab config are offered:</p>
 <div class="tbl"><table class="t"><thead><tr><th>Pair</th><th>Type</th><th>Mint</th><th>Graduates at</th></tr></thead><tbody>${CONFIG.PAIRS.map(p=>`<tr><td>${p.s}</td><td>${p.s==='SOL'?'Native':TL[p.t]}</td><td style="text-align:left"><code>${p.m}</code></td><td>${f(p.raise)} ${p.s}</td></tr>`).join('')}</tbody></table></div>
 <h2 id="d-weight">Hold weight</h2><ul><li>Weight = tokens held × days held without selling.</li><li>Balances are snapshotted every ${CONFIG.SCHEDULE.snapshotEveryHours}h from Solana RPC.</li><li>Any drop in balance between snapshots resets that coin's days to 0. Buying more never resets.</li><li>Pool vaults, the platform and LP accounts are excluded.</li></ul>
 <h2 id="d-fees">Fee split</h2><p>Every trade on a HoldPad coin pays a ${CONFIG.FEES.raydium+CONFIG.FEES.platform}% fee: ${CONFIG.FEES.raydium}% to Raydium and ${CONFIG.FEES.platform}% to HoldPad. No creator fee. HoldPad's share is split:</p><div class="tbl"><table class="t"><tbody><tr><td>Holders</td><td style="text-align:left;color:var(--mut)">By hold weight, paid in the pair token</td><td>${CONFIG.SPLIT.holders}%</td></tr><tr><td>Buys $HOLD</td><td style="text-align:left;color:var(--mut)">Market buys of $HOLD</td><td>${CONFIG.SPLIT.buyHold}%</td></tr></tbody></table></div>
 <h2 id="d-payouts">Payouts</h2><p>The keeper claims platform fees, snapshots holders, and pays out daily at ${String(CONFIG.SCHEDULE.payoutUtcHour).padStart(2,'0')}:00 UTC. Every payout is an on-chain transfer and the totals are published to <code>${CONFIG.DATA_URL}</code>.</p>
 <h2 id="d-contracts">Contracts</h2><div class="kv"><span>$HOLD mint</span><code>${CONFIG.MINT}</code><span>Raydium LaunchLab</span><code>${CONFIG.LAUNCHLAB}</code><span>Platform account</span><code>${plat||CONFIG.PLATFORM_EXPECTED+' (not created yet)'}</code><span>Fee treasury</span>${w.fee?`<a href="https://solscan.io/account/${w.fee}" target="_blank" rel="noopener"><code>${w.fee}</code></a>`:'<code>not set</code>'}${w.buyHold&&w.buyHold!==w.fee?`<span>$HOLD buy wallet</span><a href="https://solscan.io/account/${w.buyHold}" target="_blank" rel="noopener"><code>${w.buyHold}</code></a>`:''}</div>
 <h2 id="d-faq">FAQ</h2><details><summary>What resets my clock?</summary><p>Any drop in your balance between snapshots.</p></details><details><summary>Who holds the keys?</summary><p>You do. Launches are signed by your own wallet.</p></details><details><summary>Where do fees go?</summary><p>${CONFIG.SPLIT.holders}% to the holders of that coin by hold weight, ${CONFIG.SPLIT.buyHold}% buys $HOLD.</p></details><details><summary>Are the numbers real?</summary><p>Yes. Counts are read from chain, payouts from the keeper's published snapshot. Before launch they show zero.</p></details>
 </article></div>`;V.querySelectorAll('[data-j]').forEach(a=>a.onclick=()=>$('d-'+a.dataset.j).scrollIntoView({behavior:'smooth'}))};
function route(){clearInterval(cdT);const [p,arg]=(location.hash.replace(/^#\/?/,'')).split('/');const k=P[p]?p:'';
 document.querySelectorAll('#nav a,#tabbar a').forEach(a=>a.classList.toggle('on',(a.getAttribute('href').replace('#/',''))===k));
 P[k](arg);scrollTo(0,0)}
addEventListener('hashchange',route);renderWal();route();
// rings
const cv=$('rings'),x=cv.getContext('2d');let W,H,PP=[];const R=matchMedia('(prefers-reduced-motion:reduce)').matches;
function rs(){W=cv.width=innerWidth*devicePixelRatio;H=cv.height=innerHeight*devicePixelRatio}addEventListener('resize',rs);rs();
function spawn(){PP.push({r:(.12+Math.random()**.6*.75)*Math.max(W,H)*.6,a:Math.random()*6.283,s:(.0004+Math.random()*.0009)*(Math.random()<.5?1:-1),age:0,life:800+Math.random()*4000})}
for(let i=0;i<600;i++){spawn();PP[i].age=Math.random()*PP[i].life}
function fr(){x.fillStyle='rgba(10,10,9,.2)';x.fillRect(0,0,W,H);const X=W/2,Y=H*.36,u=Math.min(W,H);x.strokeStyle='rgba(237,235,228,.03)';for(let k=1;k<14;k++){x.beginPath();x.arc(X,Y,k*u*.07,0,6.283);x.stroke()}
for(let i=PP.length-1;i>=0;i--){const p=PP[i];p.age++;p.a+=p.s;if(p.age>p.life){PP.splice(i,1);spawn();continue}const t=Math.min(1,p.age/2400);x.fillStyle=t>.6?`rgba(232,255,58,${t*.55})`:`rgba(237,235,228,${.05+t*.3})`;const z=(.6+t*2.2)*devicePixelRatio;x.fillRect(X+Math.cos(p.a)*p.r,Y+Math.sin(p.a)*p.r*.9,z,z)}if(!R)requestAnimationFrame(fr)}fr();
