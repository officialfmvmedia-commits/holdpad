import {CONFIG} from './config.js'
const $=id=>document.getElementById(id),V=$('view');
const f=(n,d=2)=>n==null||isNaN(n)?'—':(+n).toLocaleString('en-US',{maximumFractionDigits:d});
const usd=n=>n==null?'—':'$'+(Math.abs(n)>=1e6?f(n/1e6)+'M':Math.abs(n)>=1e3?f(n/1e3)+'K':f(n));
const short=a=>a?a.slice(0,4)+'…'+a.slice(-4):'—';
const sym=m=>(CONFIG.PAIRS.find(p=>p.m===m)||{s:short(m)}).s;
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let L=null;const lib=async()=>L||(L=await import('./launch.bundle.js'));
// ---------- data (cached) ----------
let DATA,POOLS;
async function data(){if(DATA!==undefined)return DATA;try{const r=await fetch(CONFIG.DATA_URL,{cache:'no-store'});DATA=r.ok?await r.json():null}catch{DATA=null}return DATA}
async function pools(){if(POOLS!==undefined)return POOLS;if(!CONFIG.PLATFORM_ID)return POOLS=null;try{POOLS=await (await lib()).listLaunches(CONFIG)}catch{POOLS=null}return POOLS}
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
const live='<span class="note">LIVE AFTER LAUNCH</span>';
const card=(l,v,sub)=>`<div class="sc"><span class="mono lbl">${l}</span><b>${v}</b><small>${sub}</small></div>`;
const mini=(l,v)=>`<div class="sc mini"><span>${l}</span><b>${v}</b></div>`;
function nextAt(d){if(d&&d.nextPayoutAt)return new Date(d.nextPayoutAt);const n=new Date(),t=new Date(n);t.setUTCHours(CONFIG.SCHEDULE.payoutUtcHour,0,0,0);while(t<=n)t.setTime(t.getTime()+CONFIG.SCHEDULE.snapshotEveryHours*36e5);return t}
let cdT;function countdown(el,t){clearInterval(cdT);const tick=()=>{let s=Math.max(0,(t-Date.now())/1e3|0);el.textContent=`${s/86400|0}d ${(s%86400)/3600|0}h ${(s%3600)/60|0}m ${s%60}s`};tick();cdT=setInterval(tick,1000)}
// ---------- pages ----------
const P={};
P['']=()=>{V.className='';V.innerHTML=`<header class="hero"><p class="eyebrow mono">RAYDIUM LAUNCHLAB · SOLANA</p><h1>Paper hands pay<br>the diamond hands.</h1>
<p class="lede">Launch a coin paired to SOL or a tokenized stock. Fees go to holders by how long they've held. Sell and your clock resets.</p>${caPill()}
<div class="ctas"><a class="pri" href="#/launch">Launch a coin</a><a href="#/docs">Read the docs</a></div></header>
<section><ol class="steps"><li><b>Pick a pair.</b> SOL or a tokenized stock like TSLAx or SPCXx.</li><li><b>Hold.</b> Weight = tokens × days held. Any sell resets your days to 0.</li><li><b>Get paid.</b> Holder fees are paid in the pair token. Stock pair, you're paid in stock.</li></ol>
<div class="split">${CONFIG.SPLIT.map(s=>`<div><b>${s.p}%</b><span>${s.k}</span></div>`).join('')}</div></section>`;wireCopy()};
P.launch=()=>{V.className='';V.innerHTML=`<div class="page-h" style="text-align:center"><h1>Launch a coin</h1><p style="margin:8px auto 0">Built in your browser, signed by your wallet. We never see a key.</p></div>
<section class="card launch"><form onsubmit="return false" autocomplete="off">
<div class="row"><label>Name<input id="fname" maxlength="32" placeholder="Coin name"></label><label class="sm">Ticker<input id="fsym" maxlength="10" placeholder="TICKER"></label></div>
<label>Image<input id="fimg" type="file" accept="image/png,image/jpeg,image/gif,image/webp" class="file"></label>
<label>Description<textarea id="fdesc" rows="2" maxlength="500" placeholder="What is it"></textarea></label>
<div class="row"><label>X<input id="fx" placeholder="https://x.com/…"></label><label>Website<input id="fweb" placeholder="https://"></label></div>
<label>Pair with <span class="hint" id="pairhint"></span></label><div class="pairs" id="pairs"></div>
<label>First buy <span class="hint" id="buyunit">SOL</span><input id="fbuy" type="number" min="0" step="any" value="0"></label>
<div class="acts"><button class="go2" id="bsim" type="button">Simulate</button><button class="go" id="blaunch" type="button">Launch</button></div><p class="mono status" id="lstat"></p></form></section>`;
 let PI=0;$('pairs').innerHTML=CONFIG.PAIRS.map((p,i)=>`<button type="button" class="${i?'':'on'}" data-i="${i}" title="${p.n} · ${p.m}">${p.s}</button>`).join('');
 const hint=i=>{PI=i;$('pairhint').textContent='· holders paid in '+CONFIG.PAIRS[i].s;$('buyunit').textContent=CONFIG.PAIRS[i].s};hint(0);
 $('pairs').onclick=e=>{const b=e.target.closest('button');if(!b)return;[...$('pairs').children].forEach(x=>x.classList.remove('on'));b.classList.add('on');hint(+b.dataset.i)};
 const st=(t,c='')=>{$('lstat').textContent=t;$('lstat').className='mono status '+c};
 const vals=()=>({name:$('fname').value.trim(),symbol:$('fsym').value.trim().toUpperCase(),pair:{...CONFIG.PAIRS[PI],mint:CONFIG.PAIRS[PI].m},buyUi:+$('fbuy').value||0});
 const b=$('blaunch'),pk=L&&L.pubkey();b.disabled=!(pk&&CONFIG.IPFS_ENDPOINT);b.textContent=!CONFIG.IPFS_ENDPOINT?'Launch (upload not configured)':!pk?'Select a wallet to launch':'Launch';
 $('bsim').onclick=async()=>{const v=vals();if(!v.name||!v.symbol)return st('Name and ticker first.','bad');st('Building and simulating…');
  try{const r=await (await lib()).simulate(CONFIG,{...v,uri:'https://example.invalid/metadata.json'});st(r.ok?`Simulation passed · ${r.units} CU · payer ${short(r.payer)} · nothing sent`:`Simulation failed: ${JSON.stringify(r.err)} ${r.logs.slice(-2).join(' ')}`,r.ok?'ok':'bad')}catch(e){st(e.message,'bad')}};
 b.onclick=async()=>{const v=vals(),fi=$('fimg').files[0];if(!v.name||!v.symbol||!fi)return st('Name, ticker and image are required.','bad');
  try{st('Uploading image and metadata…');const fd=new FormData();fd.append('file',fi);for(const[k,id]of[['name','fname'],['symbol','fsym'],['description','fdesc'],['twitter','fx'],['website','fweb']])fd.append(k,$(id).value);
  const up=await fetch(CONFIG.IPFS_ENDPOINT,{method:'POST',body:fd});if(!up.ok)throw new Error('Upload failed '+up.status);const {uri}=await up.json();
  st('Check your wallet to sign…');const r=await (await lib()).launch(CONFIG,{...v,uri});POOLS=undefined;st(`Launched · ${r.mintA} · tx ${r.sig.slice(0,10)}…`,'ok')}catch(e){st(e.message,'bad')}}};
P.coins=async(arg)=>{V.className='wide';if(arg)return coin(arg);
 V.innerHTML=`<div class="page-h"><h1>Coins</h1><p>Every coin launched on the HoldPad platform, read from Raydium LaunchLab on-chain.</p></div>
 <div class="toolbar"><input id="q" placeholder="Search mint or pair"><div class="seg" id="sort"><button class="on" data-s="new">Newest</button><button data-s="mcap">Market cap</button><button data-s="prog">Curve progress</button></div></div>
 <div class="tbl"><table class="t"><thead><tr><th>Coin</th><th>Pair</th><th>Price</th><th>Market cap</th><th>Curve</th><th>Status</th></tr></thead><tbody id="rows"><tr><td colspan="6" class="emptyrow">Loading…</td></tr></tbody></table></div>`;
 const ps=await pools();let s='new';
 const draw=()=>{if(!ps||!ps.length){$('rows').innerHTML=`<tr><td colspan="6" class="emptyrow">${CONFIG.PLATFORM_ID?'No coins launched yet.':'First launches appear here after $HOLD goes live.'}</td></tr>`;return}
  const q=$('q').value.trim().toLowerCase();let xs=ps.filter(x=>!q||x.mintA.toLowerCase().includes(q)||sym(x.mintB).toLowerCase().includes(q));
  const pr=x=>x.raised/x.target;xs.sort((a,b)=>s==='mcap'?b.mcap-a.mcap:s==='prog'?pr(b)-pr(a):(+b.epoch)-(+a.epoch));
  $('rows').innerHTML=xs.map(x=>`<tr class="click" data-m="${x.mintA}"><td>${short(x.mintA)}</td><td>${sym(x.mintB)}</td><td>${f(x.price,8)}</td><td>${f(x.mcap)} ${sym(x.mintB)}</td><td>${f(pr(x)*100,1)}%</td><td>${x.status?'Graduated':'Curve'}</td></tr>`).join('');
  $('rows').querySelectorAll('tr.click').forEach(r=>r.onclick=()=>location.hash='#/coins/'+r.dataset.m)};
 $('q').oninput=draw;$('sort').onclick=e=>{const b=e.target.closest('button');if(!b)return;s=b.dataset.s;[...$('sort').children].forEach(x=>x.classList.toggle('on',x===b));draw()};draw()};
async function coin(m){V.innerHTML=`<a class="back" href="#/coins">← Coins</a><div class="page-h"><h1 class="mono" style="font-size:24px">${esc(short(m))}</h1><p class="mono" style="font-size:12px">${esc(m)}</p></div><div id="cd" class="emptyrow">Loading…</div>`;
 const ps=await pools(),x=ps&&ps.find(p=>p.mintA===m),d=await data(),kc=d&&d.coins&&d.coins[m];
 if(!x){$('cd').textContent='This mint is not a coin on the HoldPad platform.';return}
 const pr=x.raised/x.target;let hs=[];try{hs=await (await lib()).holders(CONFIG,m)}catch{}
 const lb=kc&&kc.leaderboard||[];
 $('cd').outerHTML=`<div class="cards">${card('PAIR',sym(x.mintB),x.mintB===CONFIG.PAIRS[0].m?'Holders paid in SOL':'Holders paid in '+sym(x.mintB))}${card('CURVE',f(pr*100,1)+'%',`${f(x.raised/10**x.decB)} / ${f(x.target/10**x.decB)} ${sym(x.mintB)}`)}${card('HOLDERS',hs.length?f(hs.length,0):'—','Accounts with a balance, on-chain')}${card('FEES ACCRUED',f(x.platformFee/10**x.decB,6)+' '+sym(x.mintB),'Unclaimed platform fees in the pool')}</div>
 <div class="bar2"><i style="width:${Math.min(100,pr*100)}%"></i></div>
 <div class="sec"><h3>HOLD-WEIGHT LEADERBOARD</h3><p>${kc?'From the keeper snapshot at '+new Date(d.generatedAt).toLocaleString():'Starts with the first keeper snapshot.'}</p>
 <div class="tbl"><table class="t"><thead><tr><th>Rank</th><th>Wallet</th><th>Tokens</th><th>Days held</th><th>Weight</th><th>Est. share</th></tr></thead><tbody>${lb.length?lb.map(r=>`<tr><td>#${r.rank}</td><td>${short(r.wallet)}</td><td>${f(r.tokens,0)}</td><td>${f(r.daysHeld,1)}</td><td>${f(r.weight,0)}</td><td>${f(r.share*100,2)}%</td></tr>`).join(''):'<tr><td colspan="6" class="emptyrow">No snapshot yet.</td></tr>'}</tbody></table></div></div>`}
P.analytics=async()=>{V.className='wide';
 V.innerHTML=`<div class="page-h"><h1>Analytics</h1><p>Where HoldPad's fees go. Counts come from the LaunchLab platform account on Solana; payout totals come from the keeper's published snapshot.</p></div><div id="ac" class="emptyrow">Loading…</div>`;
 const [d,ps]=await Promise.all([data(),pools()]);const t=d&&d.totals;const pre=!t;const sub=(s)=>pre?live:s;
 const grad=ps?ps.filter(x=>x.status).length:null,stocks=ps?new Set(ps.map(x=>x.mintB).filter(m=>m!==CONFIG.PAIRS[0].m)).size:null;
 const bb=t&&t.buyback;let sup=null;if(bb){try{sup=await (await lib()).supply(CONFIG,CONFIG.MINT)}catch{}}
 $('ac').outerHTML=`<div class="cards">
 ${card('PAID TO HOLDERS',t?usd(t.paidToHolders.usd):'—',sub(`${usd(t?.paidToHolders.pendingUsd)} more waiting for the next payout`))}
 ${card('EARNED BY CREATORS',t?usd(t.creators.usd):'—',sub('Paid to each coin’s creator'))}
 ${card('$HOLD BOUGHT BACK',t?usd(bb.usd):'—',sub(`${f(bb?.holdBought,0)} $HOLD · ${f(bb?.holdBurned,0)} burned${sup?' · '+f((bb.holdBought/sup)*100,2)+'% of supply':''}`))}
 ${card('TREASURY',t?usd(t.treasury.usd):'—',sub('Ops, RPC, audits'))}</div>
 <div class="cards" style="margin-top:10px">${mini('Total fees collected',t?usd(t.feesCollected.usd):'—')}${mini('Coins launched',ps?f(ps.length,0):'0')}${mini('Graduated to Raydium',grad==null?'0':grad)}${mini('Stocks in use',stocks==null?'0':stocks)}</div>
 ${pre?`<p class="note" style="text-align:left;margin-top:10px">ALL FIGURES GO LIVE AFTER $HOLD LAUNCHES. NOTHING ON THIS PAGE IS ESTIMATED OR SAMPLE DATA.</p>`:''}
 <div class="sec"><h3>TOP HOLDERS BY HOLD WEIGHT</h3><p>Next payout: <span class="cd" id="cdn"></span> · ${esc(nextAt(d).toLocaleString())}. Weight = tokens × days held without selling, across every HoldPad coin. Any sell resets that coin's days to 0.</p>
 <div class="lookup"><input id="lk" placeholder="Paste a wallet address to see its rank"><button id="lkb" type="button">Look up</button></div><p class="mono status" id="lkr"></p>
 <div class="tbl"><table class="t"><thead><tr><th>Rank</th><th>Wallet</th><th>Tokens</th><th>Days held</th><th>Weight</th><th>Est. share</th></tr></thead><tbody>
 ${d&&d.leaderboard&&d.leaderboard.length?d.leaderboard.slice(0,100).map(r=>`<tr><td>#${r.rank}</td><td>${short(r.wallet)}</td><td>${f(r.tokens,0)}</td><td>${f(r.daysHeld,1)}</td><td>${f(r.weight,0)}</td><td>${f(r.share*100,2)}%</td></tr>`).join(''):'<tr><td colspan="6" class="emptyrow">The leaderboard starts with the first snapshot after $HOLD goes live.</td></tr>'}</tbody></table></div></div>`;
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
 const T=[['overview','Overview'],['launching','Launching'],['pairs','Stock pairs'],['weight','Hold weight'],['fees','Fee split'],['payouts','Payouts'],['contracts','Contracts'],['faq','FAQ']];
 V.innerHTML=`<div class="docs"><aside>${T.map(([i,n])=>`<a href="javascript:void 0" data-j="${i}">${n}</a>`).join('')}</aside><article>
 <h2 id="d-overview">Overview</h2><p>HoldPad is a launchpad on Raydium LaunchLab. Every coin launched here pays its trading fees to its holders, weighted by how long they've held. Part of every fee buys back $HOLD.</p>
 <h2 id="d-launching">Launching</h2><ul><li>Connect Phantom, Solflare or Backpack.</li><li>Enter a name, ticker, image, description and links. The image and metadata are pinned to IPFS.</li><li>Pick a pair and an optional first buy. The create transaction is built in your browser, simulated, and signed by your wallet.</li><li>Supply is 1,000,000,000 with 6 decimals. ${f(793.1,1)}M are sold on the bonding curve. When the curve fills, the coin graduates to a Raydium CPMM pool.</li></ul>
 <h2 id="d-pairs">Stock pairs</h2><p>A coin paired to a stock trades against that stock token, so fees accrue in it and holders are paid in it. Only pairs with a Raydium LaunchLab config are offered:</p>
 <div class="tbl"><table class="t"><thead><tr><th>Pair</th><th>Mint</th><th>Graduates at</th></tr></thead><tbody>${CONFIG.PAIRS.map(p=>`<tr><td>${p.s}</td><td style="text-align:left"><code>${p.m}</code></td><td>${f(p.raise)} ${p.s}</td></tr>`).join('')}</tbody></table></div>
 <h2 id="d-weight">Hold weight</h2><ul><li>Weight = tokens held × days held without selling.</li><li>Balances are snapshotted every ${CONFIG.SCHEDULE.snapshotEveryHours}h from Solana RPC.</li><li>Any drop in balance between snapshots resets that coin's days to 0. Buying more never resets.</li><li>Pool vaults, the platform and LP accounts are excluded.</li></ul>
 <h2 id="d-fees">Fee split</h2><div class="tbl"><table class="t"><tbody>${CONFIG.SPLIT.map(s=>`<tr><td>${s.k}</td><td style="text-align:left;color:var(--mut)">${s.d}</td><td>${s.p}%</td></tr>`).join('')}</tbody></table></div><p style="margin-top:10px">Proposed. Final numbers are posted here before launches open.</p>
 <h2 id="d-payouts">Payouts</h2><p>The keeper claims platform fees, snapshots holders, and pays out daily at ${String(CONFIG.SCHEDULE.payoutUtcHour).padStart(2,'0')}:00 UTC. Every payout is an on-chain transfer and the totals are published to <code>${CONFIG.DATA_URL}</code>.</p>
 <h2 id="d-contracts">Contracts</h2><div class="kv"><span>$HOLD mint</span><code>${CONFIG.MINT}</code><span>Raydium LaunchLab</span><code>${CONFIG.LAUNCHLAB}</code><span>Platform account</span><code>${plat||CONFIG.PLATFORM_EXPECTED+' (not created yet)'}</code><span>Dev wallet</span><code>${CONFIG.DEV}</code><span>Fee wallet</span><code>${w.fee||'not set'}</code><span>Buyback wallet</span><code>${w.buyback||'not set'}</code><span>Treasury</span><code>${w.treasury||'not set'}</code></div>
 <h2 id="d-faq">FAQ</h2><details><summary>What resets my clock?</summary><p>Any drop in your balance between snapshots.</p></details><details><summary>Who holds the keys?</summary><p>You do. Launches are signed by your own wallet.</p></details><details><summary>What does $HOLD get?</summary><p>30% of fees from every launch buy back $HOLD.</p></details><details><summary>Are the numbers real?</summary><p>Yes. Counts are read from chain, payouts from the keeper's published snapshot. Before launch they show zero.</p></details>
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
