import React, { useState, useEffect, useRef } from "react";

/* ── responsive hook ───────────────────────────────── */
function useWidth(){
  const[w,setW]=useState(window.innerWidth);
  useEffect(()=>{const h=()=>setW(window.innerWidth);window.addEventListener('resize',h);return()=>window.removeEventListener('resize',h)},[]);
  return w;
}

/* ── palette & globals ─────────────────────────────── */
const BG="#100C08",SURF="#1A1410",S2="#241C14";
const BR="#D4A843",BRL="#EAC86A",GOLD="#E8C840";
const TX="#F0E8D5",MT="#C4A06A",DIM="#5C4028",BD="#3C2C18";

const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&family=DM+Mono:wght@400;500&display=swap');
@keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-10px)}}
@keyframes fadein{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}
*{box-sizing:border-box;margin:0;padding:0}
body{background:${BG};color:${TX};font-family:'Jost',sans-serif;overflow-x:hidden}
.i{background:${S2};border:1px solid ${BD};color:${TX};font-family:'Jost',sans-serif;font-size:16px;font-weight:300;border-radius:3px;padding:12px 14px;outline:none;width:100%;transition:border-color .2s}
.i:focus{border-color:${BR}} .i::placeholder{color:${DIM}}
.rng{-webkit-appearance:none;appearance:none;height:3px;border-radius:2px;border:none;padding:0;width:100%;outline:none;cursor:pointer}
.rng::-webkit-slider-thumb{-webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:${BR};border:2px solid ${BG};box-shadow:0 0 8px rgba(200,118,58,.4)}
.rng::-moz-range-thumb{width:16px;height:16px;border-radius:50%;background:${BR};border:2px solid ${BG}}
.pb{background:${BR};color:${BG};font-family:'Jost',sans-serif;font-weight:500;font-size:12px;letter-spacing:.12em;text-transform:uppercase;border:none;border-radius:3px;padding:12px 24px;cursor:pointer;transition:background .2s}
.pb:hover{background:${BRL}}
.gb{background:transparent;color:${MT};font-family:'Jost',sans-serif;font-weight:300;font-size:12px;letter-spacing:.08em;border:1px solid ${BD};border-radius:3px;padding:11px 20px;cursor:pointer;transition:border-color .2s,color .2s}
.gb:hover{border-color:${MT};color:${TX}}
.bw{transition:transform .2s}.bw:hover{transform:scale(1.06)}
.er{transition:background .15s;cursor:pointer}.er:hover{background:${S2}!important}
::-webkit-scrollbar{width:3px;height:3px}
::-webkit-scrollbar-track{background:${BG}}
::-webkit-scrollbar-thumb{background:${BD};border-radius:2px}
`;

/* ── storage ───────────────────────────────────────── */
/* ── storage (localStorage) ────────────────────────── */
function sg(k,d){try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}}
function ss(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch{}}

/* ── utils ─────────────────────────────────────────── */
const uid=()=>Date.now().toString(36)+Math.random().toString(36).slice(2);
const today=()=>new Date().toISOString().slice(0,10);
const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const fdate=s=>{if(!s)return'';const[y,m,d]=s.split('-');return`${MONTHS[+m-1]} ${+d}, ${y}`};

/* color interpolation for espresso shot */
function mlrp(stops,t){
  const n=stops.length-1,i=Math.min(Math.floor(t*n),n-1),f=t*n-i;
  return stops[i].map((v,j)=>Math.round(v+(stops[i+1][j]-v)*f));
}
const r2h=([r,g,b])=>`#${[r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('')}`;
const cStops=[[255,252,240],[245,210,130],[210,155,65],[139,94,26]];
const kStops=[[120,62,22],[78,36,10],[44,16,4],[18,6,1]];
const cColor=v=>r2h(mlrp(cStops,v/100));
const kColor=v=>r2h(mlrp(kStops,v/100));

/* ── tiny shared components ────────────────────────── */
const Lbl=({t,sx})=><div style={{fontFamily:'Jost',fontWeight:400,fontSize:12,letterSpacing:'.1em',textTransform:'uppercase',color:'#C4A882',marginBottom:8,...sx}}>{t}</div>;
const Sec=({title})=>(
  <div style={{display:'flex',alignItems:'center',gap:12,margin:'28px 0 16px'}}>
    <div style={{width:3,height:18,background:BR,borderRadius:2,flexShrink:0}}/>
    <div style={{fontFamily:'Cormorant Garamond',fontWeight:500,fontSize:17,color:TX,letterSpacing:'.04em'}}>{title}</div>
    <div style={{flex:1,height:1,background:BD}}/>
  </div>
);
const Row=({children,gap=14,mt=0,sx={}})=><div style={{display:'flex',gap,flexWrap:'wrap',marginTop:mt,...sx}}>{children}</div>;
const F=({label,flex=1,minW=100,children})=><div style={{flex,minWidth:minW}}><Lbl t={label}/>{children}</div>;

/* ── Coffee Bean tab ───────────────────────────────── */
function Bean({brand,name,idx,isAdd,roast,onClick}){
  const tilt=[-14,-7,9,-11,16,-4,12,-18,5,-9][idx%10];
  const delay=((idx*.45)%2.5).toFixed(1);
  const gid=`bg${idx}`;
  const roastColors={
    light: ['#C8824A','#A06030','#6E4018'],
    medium:['#8C4A18','#6A3010','#3E1A06'],
    dark:  ['#4A2E1C','#2E1A0E','#1C1008'],
  };
  const [ca,cb,cc2]=isAdd
    ?['#2A1A0E','#180E06','#0E0804']
    :roastColors[roast]||roastColors.medium;
  return(
    <div className="bw" onClick={onClick}
      style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',cursor:'pointer',margin:'0 18px',userSelect:'none'}}>
      <div style={{animation:`float 3.4s ease-in-out ${delay}s infinite`}}>
        <div style={{transform:`rotate(${tilt}deg)`}}>
          <svg width="76" height="100" viewBox="0 0 76 100">
            <defs>
            {/* matte flat gradient — light from upper-left, no convex dome */}
              <linearGradient id={gid} x1="15%" y1="10%" x2="85%" y2="90%">
                <stop offset="0%" stopColor={ca}/>
                <stop offset="100%" stopColor={cc2}/>
              </linearGradient>
            </defs>
            {/* plump rounded oval */}
            <path d="M38,3 C58,3 73,21 73,50 C73,79 58,97 38,97 C18,97 3,79 3,50 C3,21 18,3 38,3 Z"
              fill={`url(#${gid})`}/>
            {/* crease — S-wave like real coffee beans */}
            <path d="M38,5 C20,28 56,58 38,95"
              fill="none" stroke="rgba(6,2,0,0.78)" strokeWidth="5" strokeLinecap="round"/>
            <path d="M38,5 C20,28 56,58 38,95"
              fill="none" stroke="rgba(6,2,0,0.35)" strokeWidth="9" strokeLinecap="round"/>
          </svg>
        </div>
        <div style={{marginTop:10,textAlign:'center',width:88}}>
          {isAdd
            ?<><div style={{fontFamily:'Jost',fontWeight:400,fontSize:20,color:DIM,lineHeight:1}}>+</div>
               <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:DIM,letterSpacing:'.15em',textTransform:'uppercase',marginTop:4}}>Add beans</div></>
            :<><div style={{fontFamily:'Jost',fontWeight:600,fontSize:11,color:TX,letterSpacing:'.08em',textTransform:'uppercase',lineHeight:1.3}}>{brand}</div>
               <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:MT,marginTop:3}}>{name}</div></>}
        </div>
      </div>
    </div>
  );
}

/* ── Welcome page ──────────────────────────────────── */
function Welcome({beans,onAdd,onSelect,onDeleteBean}){
  const[delMode,setDelMode]=useState(false);
  const[confirmBean,setConfirmBean]=useState(null);
  const[search,setSearch]=useState('');
  const w=useWidth();
  const mob=w<768;
  const handleBeanClick=b=>{
    if(delMode) setConfirmBean(b);
    else onSelect(b);
  };
  const visible=search.trim()
    ?beans.filter(b=>`${b.brand} ${b.name}`.toLowerCase().includes(search.toLowerCase()))
    :beans;
  const pad=mob?'36px 24px 20px':'56px 60px 24px';
  const divPad=mob?'0 24px 32px':'0 60px 44px';
  const beansPad=mob?'10px 24px 80px':'10px 60px 60px';
  return(
    <div style={{minHeight:'100vh',background:BG,animation:'fadein .5s ease',position:'relative'}}>
      <div style={{padding:pad}}>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:BR,letterSpacing:'.28em',textTransform:'uppercase',marginBottom:14}}>Bean There — Dial In Every Espresso Shot</div>
        <div style={{fontFamily:'Cormorant Garamond',fontWeight:300,fontSize:mob?32:48,color:TX,lineHeight:1.15,maxWidth:540}}>
          What beans are we working with today…
        </div>
        {beans.length>2&&<div style={{marginTop:16,maxWidth:mob?'100%':220,position:'relative'}}>
          <input className="i" value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search beans…"
            style={{paddingLeft:30,paddingTop:7,paddingBottom:7,fontSize:12,background:S2}}/>
          <span style={{position:'absolute',left:10,top:'50%',transform:'translateY(-50%)',color:DIM,fontSize:13,pointerEvents:'none'}}>⌕</span>
          {search&&<span onClick={()=>setSearch('')} style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',color:MT,fontSize:13,cursor:'pointer'}}>×</span>}
        </div>}
      </div>
      <div style={{margin:divPad,height:1,background:`linear-gradient(to right,${BD},transparent)`}}/>
      <div style={{overflowX:'auto',padding:beansPad,display:'flex',alignItems:'center'}}>
        <div style={{display:'flex',alignItems:'center',paddingBottom:4,flexWrap:mob?'wrap':'nowrap',gap:mob?'16px 0':0}}>
          {visible.map((b,i)=>(
            <div key={b.id} style={{position:'relative'}}>
              <Bean brand={b.brand} name={b.name} roast={b.roast} idx={beans.indexOf(b)} onClick={()=>handleBeanClick(b)}/>
              {delMode&&<div onClick={()=>setConfirmBean(b)} style={{position:'absolute',top:4,right:4,width:20,height:20,borderRadius:'50%',background:'rgba(200,50,30,0.9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,color:'#fff',cursor:'pointer',zIndex:10}}>×</div>}
            </div>
          ))}
          {!delMode&&!search&&<Bean isAdd idx={beans.length} onClick={onAdd}/>}
        </div>
      </div>
      {beans.length===0&&<div style={{textAlign:'center',paddingBottom:40,fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:15,color:DIM}}>Click the bean to add your first coffee</div>}
      {search&&visible.length===0&&<div style={{textAlign:'center',paddingTop:20,fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:15,color:DIM}}>No beans match "{search}"</div>}
      {confirmBean&&(
        <div style={{position:'fixed',bottom:80,right:mob?16:32,left:mob?16:'auto',background:SURF,border:`1px solid rgba(200,80,60,0.4)`,borderRadius:6,padding:'16px 20px',zIndex:100,animation:'fadein .15s ease'}}>
          <div style={{fontFamily:'Jost',fontWeight:400,fontSize:13,color:TX,marginBottom:4}}>{confirmBean.brand} — {confirmBean.name}</div>
          <div style={{fontFamily:'Jost',fontWeight:300,fontSize:12,color:MT,marginBottom:14}}>Delete this bean and all its journal entries?</div>
          <div style={{display:'flex',gap:10}}>
            <button onClick={()=>{onDeleteBean(confirmBean.id);setConfirmBean(null);setDelMode(false)}}
              style={{fontFamily:'Jost',fontWeight:500,fontSize:11,letterSpacing:'.08em',background:'rgba(200,80,60,0.15)',color:'#E06040',border:'1px solid rgba(200,80,60,0.4)',borderRadius:3,padding:'8px 16px',cursor:'pointer'}}>Yes, delete</button>
            <button className="gb" onClick={()=>setConfirmBean(null)} style={{fontSize:11,padding:'8px 14px'}}>Cancel</button>
          </div>
        </div>
      )}
      {beans.length>0&&(
        <div style={{position:'fixed',bottom:28,right:mob?16:32,display:'flex',gap:10}}>
          {delMode&&<button className="gb" onClick={()=>{setDelMode(false);setConfirmBean(null)}} style={{fontSize:11,padding:'8px 16px'}}>Cancel</button>}
          <button onClick={()=>{setDelMode(x=>!x);setConfirmBean(null)}} style={{fontFamily:'Jost',fontWeight:300,fontSize:11,letterSpacing:'.08em',color:delMode?'#E05040':MT,background:BG,border:`1px solid ${delMode?'rgba(200,80,60,0.5)':BD}`,borderRadius:3,padding:'8px 16px',cursor:'pointer',transition:'all .2s'}}>
            {delMode?'Selecting…':'Delete beans'}
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Add Bean page ─────────────────────────────────── */
function AddBean({onSave,onBack,initial}){
  const w=useWidth();
  const mob=w<768;
  const[f,setF]=useState(initial||{id:'',brand:'',name:'',variety:'',process:'',origin:'single',region:'',roast:'medium',roastDate:'',price:'',bagSize:'',bagUnit:'g',smell:'',elevation:'',producer:'',roastProfile:'',openDate:'',restingRange:'',storage:''});
  const[sniff,setSniff]=useState(false);
  const[adv,setAdv]=useState(false);
  const[blendItems,setBlendItems]=useState(Array.isArray(initial?.blendComp)?initial.blendComp:[{bean:'',pct:''}]);
  const s=(k,v)=>setF(x=>({...x,[k]:v}));
  const addBlend=()=>setBlendItems(x=>[...x,{bean:'',pct:''}]);
  const setBlend=(i,k,v)=>setBlendItems(x=>x.map((r,j)=>j===i?{...r,[k]:v}:r));
  const removeBlend=i=>setBlendItems(x=>x.filter((_,j)=>j!==i));
  const save=()=>{
    if(!f.brand.trim()||!f.name.trim()){alert('Brand / Roaster and bean name are required.');return;}
    onSave({...f,id:f.id||uid(),blendComp:blendItems});
  };
  const daysOffRoast=(()=>{
    if(!f.roastDate)return null;
    const d=Math.floor((new Date()-new Date(f.roastDate+'T00:00:00'))/86400000);
    return d>=0?d:null;
  })();
  const ToggleRow=({label,opts,val,onChange})=>(
    <div>
      <Lbl t={label}/>
      <div style={{display:'flex'}}>
        {opts.map((o,i)=>(
          <button key={o} onClick={()=>onChange(val===o?'':o)} style={{flex:1,padding:'9px 0',fontFamily:'Jost',fontWeight:val===o?500:300,fontSize:12,cursor:'pointer',border:`1px solid ${BD}`,borderLeft:i>0?'none':`1px solid ${BD}`,background:val===o?BR:S2,color:val===o?BG:MT,borderRadius:i===0?'3px 0 0 3px':i===opts.length-1?'0 3px 3px 0':'0',transition:'all .15s',whiteSpace:'nowrap'}}>{o}</button>
        ))}
      </div>
    </div>
  );
  return(
    <div style={{minHeight:'100vh',background:BG,padding:mob?'32px 20px':'44px 48px',animation:'fadein .35s ease',maxWidth:760,margin:'0 auto'}}>
      <div style={{marginBottom:36}}>
        <button onClick={onBack} style={{background:'none',border:'none',color:MT,cursor:'pointer',fontSize:20,padding:'4px 8px 8px 0',display:'block'}}>←</button>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:BR,letterSpacing:'.22em',textTransform:'uppercase',marginBottom:10}}>{initial?'Edit beans':'New beans'}</div>
        <div style={{fontFamily:'Cormorant Garamond',fontWeight:300,fontSize:40,color:TX,lineHeight:1.15}}>{initial?'Update this bean.':'Tell me about these beans.'}</div>
      </div>

      <Row>
        <F label="Brand / Roaster *"><input className="i" value={f.brand} onChange={e=>s('brand',e.target.value)} placeholder="e.g. Onyx Coffee Lab"/></F>
        <F label="Bean Name *"><input className="i" value={f.name} onChange={e=>s('name',e.target.value)} placeholder="e.g. Southern Weather"/></F>
      </Row>
      <Row mt={14}>
        <F label="Variety"><input className="i" value={f.variety} onChange={e=>s('variety',e.target.value)} placeholder="e.g. Gesha, Bourbon"/></F>
        <F label="Process"><input className="i" value={f.process} onChange={e=>s('process',e.target.value)} placeholder="e.g. Washed, Natural"/></F>
      </Row>

      <div style={{marginTop:18}}><Lbl t="Origin"/>
        <div style={{display:'flex',gap:22}}>
          {['single','blend'].map(opt=>(
            <label key={opt} style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',fontFamily:'Jost',fontWeight:300,fontSize:14,color:f.origin===opt?TX:MT}}>
              <div onClick={()=>s('origin',opt)} style={{width:18,height:18,borderRadius:'50%',border:`2px solid ${f.origin===opt?BR:BD}`,background:f.origin===opt?BR:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
                {f.origin===opt&&<div style={{width:6,height:6,borderRadius:'50%',background:BG}}/>}
              </div>
              {opt==='single'?'Single Origin':'Blend'}
            </label>
          ))}
        </div>
      </div>

      <div style={{marginTop:16}}><Lbl t="Region / Country"/>
        <input className="i" value={f.region} onChange={e=>s('region',e.target.value)} placeholder="e.g. Ethiopia, Yirgacheffe"/>
      </div>

      <Row mt={18}>
        <F label="Roast Level">
          <div style={{display:'flex'}}>
            {['light','medium','dark'].map((l,i)=>(
              <button key={l} onClick={()=>s('roast',l)} style={{flex:1,padding:'10px 0',fontFamily:'Jost',fontWeight:f.roast===l?500:300,fontSize:13,cursor:'pointer',border:`1px solid ${BD}`,borderLeft:i>0?'none':`1px solid ${BD}`,background:f.roast===l?BR:S2,color:f.roast===l?BG:MT,borderRadius:i===0?'3px 0 0 3px':i===2?'0 3px 3px 0':'0',textTransform:'capitalize',transition:'all .15s'}}>{l}</button>
            ))}
          </div>
        </F>
        <F label="Roast Date" minW={160}>
          <input type="date" className="i" value={f.roastDate} onChange={e=>s('roastDate',e.target.value)} style={{colorScheme:'dark'}}/>
        </F>
        {daysOffRoast!==null&&(
          <F label="Days Off Roast" flex="0 0 130px" minW={100}>
            <div style={{padding:'10px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,fontFamily:'DM Mono',fontSize:18,color:BR,textAlign:'center'}}>
              {daysOffRoast}<span style={{fontSize:11,color:MT,marginLeft:4}}>days</span>
            </div>
          </F>
        )}
      </Row>

      <Row mt={16}>
        <F label="Bag Size" flex="0 0 200px" minW={160}>
          <div style={{display:'flex'}}>
            <input type="number" step="1" min="0" className="i" value={f.bagSize} onChange={e=>s('bagSize',e.target.value)} placeholder="250" style={{borderRadius:'3px 0 0 3px',flex:1,borderRight:'none'}}/>
            <select value={f.bagUnit} onChange={e=>s('bagUnit',e.target.value)}
              style={{background:S2,border:`1px solid ${BD}`,borderLeft:'none',color:MT,fontFamily:'Jost',fontWeight:300,fontSize:12,borderRadius:'0 3px 3px 0',padding:'0 10px',cursor:'pointer',outline:'none',flexShrink:0}}>
              <option value="g">g</option>
              <option value="kg">kg</option>
              <option value="oz">oz</option>
            </select>
          </div>
        </F>
        <F label="Price ($)" flex="0 0 140px" minW={120}>
          <div style={{position:'relative'}}>
            <span style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',fontFamily:'Jost',fontWeight:300,fontSize:14,color:DIM,pointerEvents:'none'}}>$</span>
            <input type="number" step="0.5" min="0" className="i" value={f.price} onChange={e=>s('price',e.target.value)} placeholder="0.00" style={{paddingLeft:24}}/>
          </div>
        </F>
      </Row>

      {/* Advanced */}
      <div style={{marginTop:24}}>
        <button onClick={()=>setAdv(x=>!x)} style={{fontFamily:'Jost',fontWeight:300,fontSize:12,color:adv?BR:MT,background:'none',border:`1px solid ${adv?BR:BD}`,borderRadius:3,padding:'8px 18px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:8,letterSpacing:'.08em',textTransform:'uppercase'}}>
          <span style={{fontSize:10}}>{adv?'▲':'▼'}</span> Advanced
        </button>
        {adv&&(
          <div style={{marginTop:16,padding:'20px 22px',border:`1px solid ${BD}`,borderRadius:4,background:SURF,animation:'fadein .2s ease'}}>
            <Row>
              <F label="Elevation (m)">
                <input type="number" className="i" value={f.elevation} onChange={e=>s('elevation',e.target.value)} placeholder="e.g. 1800"/>
              </F>
              <F label="Producer / Farm / Washing Station">
                <input className="i" value={f.producer} onChange={e=>s('producer',e.target.value)} placeholder="e.g. Worka Sakaro"/>
              </F>
            </Row>
            <div style={{marginTop:16}}>
              <ToggleRow label="Roast Profile" opts={['Espresso','Filter','Omni']} val={f.roastProfile} onChange={v=>s('roastProfile',v)}/>
            </div>
            <div style={{marginTop:16}}>
              <F label="Blend Components">
                <div>
                  {blendItems.map((item,i)=>(
                    <div key={i} style={{display:'flex',gap:8,marginBottom:8,alignItems:'center'}}>
                      <input className="i" value={item.bean} onChange={e=>setBlend(i,'bean',e.target.value)} placeholder="e.g. Ethiopia" style={{flex:1}}/>
                      <div style={{position:'relative',flexShrink:0,width:80}}>
                        <input type="number" min="0" max="100" className="i" value={item.pct} onChange={e=>setBlend(i,'pct',e.target.value)} placeholder="30" style={{paddingRight:22,textAlign:'right'}}/>
                        <span style={{position:'absolute',right:10,top:'50%',transform:'translateY(-50%)',fontFamily:'Jost',fontWeight:300,fontSize:13,color:DIM,pointerEvents:'none'}}>%</span>
                      </div>
                      {blendItems.length>1&&<button onClick={()=>removeBlend(i)} style={{background:'none',border:'none',color:DIM,cursor:'pointer',fontSize:16,padding:'0 4px',lineHeight:1,flexShrink:0}}>×</button>}
                    </div>
                  ))}
                  <button onClick={addBlend} style={{fontFamily:'Jost',fontWeight:300,fontSize:12,color:BR,background:'none',border:`1px dashed ${BD}`,borderRadius:3,padding:'6px 16px',cursor:'pointer',marginTop:2,transition:'border-color .2s',letterSpacing:'.06em'}}>+ Add component</button>
                </div>
              </F>
            </div>
            <Row mt={16}>
              <F label="Open Date" minW={160}>
                <input type="date" className="i" value={f.openDate} onChange={e=>s('openDate',e.target.value)} style={{colorScheme:'dark'}}/>
              </F>
              <F label="Preferred Resting Range (days)">
                <input className="i" value={f.restingRange} onChange={e=>s('restingRange',e.target.value)} placeholder="e.g. 7–21"/>
              </F>
            </Row>
            <div style={{marginTop:16}}>
              <ToggleRow label="Storage Method" opts={['Airscape','Freezer','Vacuum Tube','Original Bag']} val={f.storage} onChange={v=>s('storage',v)}/>
            </div>
          </div>
        )}
      </div>

      {/* Sniff */}
      <div style={{marginTop:22}}>
        <button onClick={()=>setSniff(x=>!x)} style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:17,color:sniff?BR:MT,background:'none',border:`1px solid ${sniff?BR:BD}`,borderRadius:3,padding:'9px 18px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:8}}>
          <span style={{fontStyle:'normal',fontSize:18,fontFamily:'Jost',fontWeight:300,lineHeight:1}}>{sniff?'−':'+'}</span> Take a sniff…
        </button>
        {sniff&&<div style={{marginTop:10,animation:'fadein .2s ease'}}>
          <textarea className="i" rows="3" value={f.smell} onChange={e=>s('smell',e.target.value)} placeholder="Dried fruit, dark chocolate, floral, caramel…" style={{resize:'vertical'}}/>
        </div>}
      </div>

      <div style={{marginTop:32,display:'flex',gap:14}}>
        <button className="pb" onClick={save}>{initial?'Update beans':'Save beans'}</button>
        <button className="gb" onClick={onBack}>Cancel</button>
      </div>
    </div>
  );
}

/* ── Stars rating ──────────────────────────────────── */
function Stars({value,onChange}){
  const[hov,setHov]=useState(0);
  return(
    <div style={{display:'flex',gap:6}}>
      {[1,2,3,4,5].map(s=>{
        const on=s<=(hov||value);
        return <span key={s} style={{fontSize:28,cursor:'pointer',color:on?BR:BD,transition:'color .15s',display:'inline-block'}}
          onMouseEnter={()=>setHov(s)} onMouseLeave={()=>setHov(0)} onClick={()=>onChange(s===value?0:s)}>★</span>
      })}
    </div>
  );
}

/* ── Tasting slider ────────────────────────────────── */
function Sld({label,value,onChange}){
  return(
    <div style={{marginBottom:13}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
        <span style={{fontFamily:'Jost',fontWeight:300,fontSize:12,color:MT,letterSpacing:'.1em',textTransform:'uppercase'}}>{label}</span>
        <span style={{fontFamily:'DM Mono',fontSize:12,color:BR}}>{value}</span>
      </div>
      <input type="range" min="0" max="10" value={value} onChange={e=>onChange(+e.target.value)} className="rng"
        style={{background:`linear-gradient(to right,${BR} ${value*10}%,${BD} ${value*10}%)`}}/>
    </div>
  );
}

/* ── Espresso shot visual ──────────────────────────── */
function Shot({ratio,cVal,kVal,onRatio,onCVal,onKVal}){
  const[zone,setZone]=useState(null);
  const[drag,setDrag]=useState(false);
  const ref=useRef(null);
  // viewBox coords
  const VW=110,VH=102,Y0=5,Y1=88,liqH=Y1-Y0;
  // smooth glass path: wide rim, gently curving sides, soft rounded base
  const gp=`M8,${Y0} L102,${Y0} C106,30 95,68 93,${Y1} Q74,97 55,97 Q36,97 17,${Y1} C15,68 4,30 8,${Y0} Z`;
  const dY=Y0+ratio*liqH;
  const t=(dY-Y0)/liqH;
  const lL=8+9*t,lR=102-9*t;
  const cc=cColor(cVal),kc=kColor(kVal);
  const vY=(e,r)=>(e.clientY-r.top)/r.height*VH;
  const onPD=e=>{if(!ref.current)return;const r=ref.current.getBoundingClientRect(),y=vY(e,r);if(Math.abs(y-dY)<=16){setDrag(true);ref.current.setPointerCapture(e.pointerId)}};
  const onPM=e=>{if(!drag||!ref.current)return;const r=ref.current.getBoundingClientRect(),y=vY(e,r);onRatio(Math.max(.05,Math.min(.65,(y-Y0)/liqH)))};
  const onPU=()=>setDrag(false);
  const onCk=e=>{if(drag)return;const r=ref.current.getBoundingClientRect(),y=vY(e,r);if(y<dY)setZone(z=>z==='crema'?null:'crema');else setZone(z=>z==='coffee'?null:'coffee')};
  return(
    <div>
      <div style={{display:'flex',gap:20,alignItems:'flex-start'}}>
        <div style={{flexShrink:0}}>
          <svg ref={ref} width={VW} height={VH} viewBox={`0 0 ${VW} ${VH}`}
            style={{display:'block',cursor:drag?'ns-resize':'pointer',touchAction:'none'}}
            onPointerDown={onPD} onPointerMove={onPM} onPointerUp={onPU} onClick={onCk}>
            <defs><clipPath id="sc"><path d={gp}/></clipPath></defs>
            {/* liquid */}
            <rect x="0" y="0" width={VW} height={VH} fill={kc} clipPath="url(#sc)"/>
            <rect x="0" y="0" width={VW} height={dY} fill={cc} clipPath="url(#sc)"/>
            {zone==='crema'&&<rect x="0" y="0" width={VW} height={dY} fill="rgba(200,118,58,.18)" clipPath="url(#sc)"/>}
            {zone==='coffee'&&<rect x="0" y={dY} width={VW} height={VH} fill="rgba(200,118,58,.18)" clipPath="url(#sc)"/>}
            {/* divider */}
            <line x1={lL} y1={dY} x2={lR} y2={dY} stroke="rgba(255,255,255,.45)" strokeWidth="2" strokeDasharray="4,3"/>
            {/* gloss: left soft strip */}
            <path d={`M20,${Y0+3} C15,32 15,60 20,${Y1-6}`} fill="none" stroke="rgba(255,255,255,.22)" strokeWidth="7" strokeLinecap="round" clipPath="url(#sc)"/>
            {/* gloss: small top-left reflection */}
            <ellipse cx="30" cy={Y0+11} rx="12" ry="5" fill="rgba(255,255,255,.14)" transform="rotate(-12,30,16)" clipPath="url(#sc)"/>
            {/* glass outline */}
            <path d={gp} fill="none" stroke={BR} strokeWidth="1.5"/>
            {/* rim line */}
            <line x1="8" y1={Y0} x2="102" y2={Y0} stroke={BR} strokeWidth="2.5"/>
            {/* base foot */}
            <ellipse cx="55" cy={VH-2} rx="28" ry="3" fill={BR} opacity="0.45"/>
          </svg>
          <div style={{textAlign:'center',marginTop:4,fontFamily:'DM Mono',fontSize:9,color:DIM,letterSpacing:'.08em'}}>{Math.round(ratio*100)}% crema</div>
        </div>
        <div style={{flex:1,paddingTop:6}}>
          <div style={{fontFamily:'Jost',fontWeight:300,fontSize:11,color:DIM,marginBottom:14,lineHeight:1.7}}>Click crema or body to edit its color. Drag the dashed line to adjust ratio.</div>
          {[{z:'crema',label:'Crema',col:cc},{z:'coffee',label:'Coffee body',col:kc}].map(({z,label,col})=>(
            <div key={z} style={{display:'flex',alignItems:'center',gap:10,marginBottom:10}}>
              <div style={{width:10,height:10,borderRadius:'50%',background:col,border:`1px solid ${BD}`,flexShrink:0}}/>
              <span style={{fontFamily:'Jost',fontWeight:zone===z?500:300,fontSize:12,color:zone===z?BR:MT,transition:'color .15s'}}>{label}</span>
            </div>
          ))}
        </div>
      </div>
      {zone==='crema'&&<div style={{marginTop:12,padding:'12px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,animation:'fadein .2s ease'}}>
        <input type="range" min="0" max="100" value={cVal} onChange={e=>onCVal(+e.target.value)} className="rng"
          style={{background:'linear-gradient(to right,#FFFAF0,#F0D878,#D4A840,#8B5E1A)'}}/>
      </div>}
      {zone==='coffee'&&<div style={{marginTop:12,padding:'12px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,animation:'fadein .2s ease'}}>
        <input type="range" min="0" max="100" value={kVal} onChange={e=>onKVal(+e.target.value)} className="rng"
          style={{background:'linear-gradient(to right,#783E16,#4E2408,#2C1004,#120601)'}}/>
      </div>}
    </div>
  );
}

/* ── Autocomplete input ────────────────────────────── */
function AC({value,onChange,opts,placeholder}){
  const[open,setOpen]=useState(false);
  const fil=opts.filter(o=>o.toLowerCase().includes(value.toLowerCase())&&o.toLowerCase()!==value.toLowerCase());
  return(
    <div style={{position:'relative'}}>
      <input className="i" value={value} placeholder={placeholder}
        onChange={e=>{onChange(e.target.value);setOpen(true)}}
        onFocus={()=>setOpen(true)} onBlur={()=>setTimeout(()=>setOpen(false),150)}/>
      {open&&fil.length>0&&<div style={{position:'absolute',top:'100%',left:0,right:0,zIndex:50,background:S2,border:`1px solid ${BD}`,borderTop:'none',borderRadius:'0 0 3px 3px',maxHeight:120,overflowY:'auto'}}>
        {fil.map(o=><div key={o} onMouseDown={()=>{onChange(o);setOpen(false)}}
          style={{padding:'9px 14px',fontFamily:'Jost',fontWeight:300,fontSize:14,color:TX,cursor:'pointer'}}
          onMouseEnter={e=>e.currentTarget.style.background=SURF} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>{o}</div>)}
      </div>}
    </div>
  );
}

/* ── defaults ──────────────────────────────────────── */
const mkE=()=>({id:uid(),date:today(),title:'',
  grind:{grinder:'',grindSetting:'',dose:''},
  basket:{basket:'',puckScreen:false,paperFilter:'none',distribution:''},
  preInf:{enabled:false,pressure:'',duration:'',mode:'',firstDrip:''},
  extr:{machine:'',yield:'',time:'',temp:'',waterProfile:'',waterTemp:'',peakPressure:'',brewPressure:'',profileType:'',channeling:false},
  tasting:{acidity:5,sweetness:5,bitterness:5,body:5,chocolate:5,orangePeel:5,caramel:5,almond:5,ratio:.25,cVal:30,kVal:60,stars:0,tastingNotes:'',finish:'',notes:'',photo:null},
  isThisIt:false});

/* ── Entry form ────────────────────────────────────── */
function EForm({init,onSave,onCancel,grinders,beanRoastDate}){
  const base=mkE();
  const[f,setF]=useState(init?{...base,...init,
    grind:{...base.grind,...init.grind},
    basket:{...base.basket,...init.basket},
    preInf:{...base.preInf,...init.preInf},
    extr:{...base.extr,...init.extr},
    tasting:{...base.tasting,...init.tasting},
  }:base);
  const[extrAdv,setExtrAdv]=useState(false);
  const[tastAdv,setTastAdv]=useState(false);
  const mob=useWidth()<768;
  const set=(path,val)=>setF(x=>{const p=path.split('.');if(p.length===1)return{...x,[p[0]]:val};return{...x,[p[0]]:{...x[p[0]],[p[1]]:val}}});

  const brewRatio=(()=>{const d=+f.grind.dose,y=+f.extr.yield;return(d&&y)?(y/d).toFixed(2):'—'})();
  const flowRate=(()=>{const y=+f.extr.yield,t=+f.extr.time;return(y&&t)?(y/t).toFixed(2):'—'})();
  const beanAge=(()=>{if(!beanRoastDate||!f.date)return null;const d=Math.floor((new Date(f.date+'T00:00:00')-new Date(beanRoastDate+'T00:00:00'))/86400000);return d>=0?d:null;})();

  const Chk=({val,onChange,label})=>(
    <label style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer'}}>
      <div onClick={onChange} style={{width:19,height:19,borderRadius:3,border:`2px solid ${val?BR:BD}`,background:val?BR:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
        {val&&<span style={{color:BG,fontSize:11,fontWeight:700}}>✓</span>}
      </div>
      <span style={{fontFamily:'Jost',fontWeight:300,fontSize:14,color:MT}}>{label}</span>
    </label>
  );
  const Tog=({label,opts,val,onChange})=>(
    <div><Lbl t={label}/>
      <div style={{display:'flex'}}>
        {opts.map((o,i)=><button key={o} onClick={()=>onChange(val===o?'':o)} style={{flex:1,padding:'9px 6px',fontFamily:'Jost',fontWeight:val===o?500:300,fontSize:11,cursor:'pointer',border:`1px solid ${BD}`,borderLeft:i>0?'none':`1px solid ${BD}`,background:val===o?BR:S2,color:val===o?BG:MT,borderRadius:i===0?'3px 0 0 3px':i===opts.length-1?'0 3px 3px 0':'0',transition:'all .15s',whiteSpace:'nowrap'}}>{o}</button>)}
      </div>
    </div>
  );

  const photo=e=>{const file=e.target.files[0];if(!file)return;const r=new FileReader();r.onload=ev=>set('tasting.photo',ev.target.result);r.readAsDataURL(file)};

  return(
    <div style={{padding:mob?'20px 16px':'28px 36px',overflowY:'auto',overflowX:'hidden',height:'100%',maxWidth:'100%'}}>
      <div style={{display:'flex',flexDirection:mob?'column':'row',gap:14}}>
        <F label="Date" flex={mob?'0 0 auto':'0 0 170px'} minW={0}>
          <input type="date" className="i" value={f.date} onChange={e=>set('date',e.target.value)} style={{colorScheme:'dark',maxWidth:mob?180:'100%'}}/>
        </F>
        <F label="What's up…"><input className="i" value={f.title} onChange={e=>set('title',e.target.value)} placeholder="Give this pull a title…"/></F>
      </div>

      {/* ── GRIND ── */}
      <Sec title="Grind"/>
      <Row>
        <F label="Grinder"><AC value={f.grind.grinder} onChange={v=>set('grind.grinder',v)} opts={grinders} placeholder="e.g. Comandante"/></F>
        <F label="Grind Setting" flex="0 0 155px"><input className="i" value={f.grind.grindSetting} onChange={e=>set('grind.grindSetting',e.target.value)} placeholder="e.g. 18 clicks"/></F>
      </Row>
      <Row mt={14} gap={14}>
        <F label="Dose (g)" flex="0 0 110px"><input type="number" step="0.1" className="i" value={f.grind.dose} onChange={e=>set('grind.dose',e.target.value)} placeholder="18.0"/></F>
        {beanAge!==null&&<F label="Bean Age at Shot" flex="0 0 150px" minW={120}>
          <div style={{padding:'12px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,fontFamily:'DM Mono',fontSize:16,color:BR,lineHeight:'1.5'}}>{beanAge}<span style={{fontSize:11,color:MT,marginLeft:4}}>days off roast</span></div>
        </F>}
      </Row>

      {/* ── BASKET PREP ── */}
      <Sec title="Basket Prep"/>
      <Row>
        <F label="Basket"><input className="i" value={f.basket.basket} onChange={e=>set('basket.basket',e.target.value)} placeholder="e.g. VST 18g, IMS 20g"/></F>
      </Row>
      <Row mt={10} gap={20} sx={{alignItems:'center'}}>
        <Chk val={f.basket.puckScreen} onChange={()=>set('basket.puckScreen',!f.basket.puckScreen)} label="Puck screen"/>
      </Row>
      <div style={{display:'flex',flexDirection:mob?'column':'row',gap:14,marginTop:16}}>
        <F label="Paper Filter"><Tog opts={['Top','Bottom','Both','None']} val={f.basket.paperFilter} onChange={v=>set('basket.paperFilter',v)}/></F>
        <F label="Distribution"><Tog opts={['WDT','Blind Shaker',"Stockfleth's",'Palm']} val={f.basket.distribution} onChange={v=>set('basket.distribution',v)}/></F>
      </div>

      {/* ── PRE-INFUSION ── */}
      <Sec title="Pre-Infusion"/>
      <div style={{marginBottom:14}}>
        <Chk val={f.preInf.enabled} onChange={()=>set('preInf.enabled',!f.preInf.enabled)} label="Pre-infusion used"/>
      </div>
      {f.preInf.enabled&&<div style={{animation:'fadein .2s ease'}}>
        <Row>
          <F label="Pressure (bar)"><input type="number" step="0.5" className="i" value={f.preInf.pressure} onChange={e=>set('preInf.pressure',e.target.value)} placeholder="4.0"/></F>
          <F label="Duration (s)"><input type="number" step="0.5" className="i" value={f.preInf.duration} onChange={e=>set('preInf.duration',e.target.value)} placeholder="5"/></F>
          <F label="Mode"><input className="i" value={f.preInf.mode} onChange={e=>set('preInf.mode',e.target.value)} placeholder="Static, Ramp…"/></F>
        </Row>
      </div>}

      {/* ── EXTRACTION ── */}
      <Sec title="Extraction"/>
      <Row>
        <F label="Espresso Maker"><input className="i" value={f.extr.machine} onChange={e=>set('extr.machine',e.target.value)} placeholder="e.g. La Marzocco Linea Mini"/></F>
      </Row>
      {mob ? (
        <>
          <Row mt={14} gap={14}>
            <F label="Yield (g)"><input type="number" step="0.1" className="i" value={f.extr.yield} onChange={e=>set('extr.yield',e.target.value)} placeholder="36.0"/></F>
            <F label="Time (s)"><input type="number" step="1" className="i" value={f.extr.time} onChange={e=>set('extr.time',e.target.value)} placeholder="28"/></F>
          </Row>
          <Row mt={14} gap={14}>
            <F label="Temp (°C)"><input type="number" step="0.5" className="i" value={f.extr.temp} onChange={e=>set('extr.temp',e.target.value)} placeholder="93.0"/></F>
            <F label="Brew Ratio">
              <div style={{padding:'12px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,fontFamily:'DM Mono',fontSize:16,color:BR,lineHeight:'1.5'}}>1 : {brewRatio}</div>
            </F>
          </Row>
        </>
      ) : (
        <Row mt={14}>
          <F label="Yield (g)" flex="0 0 110px"><input type="number" step="0.1" className="i" value={f.extr.yield} onChange={e=>set('extr.yield',e.target.value)} placeholder="36.0"/></F>
          <F label="Time (s)" flex="0 0 110px"><input type="number" step="1" className="i" value={f.extr.time} onChange={e=>set('extr.time',e.target.value)} placeholder="28"/></F>
          <F label="Temp (°C)" flex="0 0 110px"><input type="number" step="0.5" className="i" value={f.extr.temp} onChange={e=>set('extr.temp',e.target.value)} placeholder="93.0"/></F>
          <F label="Brew Ratio" flex="0 0 110px" minW={100}>
            <div style={{padding:'12px 14px',background:SURF,border:`1px solid ${BD}`,borderRadius:3,fontFamily:'DM Mono',fontSize:16,color:BR,lineHeight:'1.5'}}>1 : {brewRatio}</div>
          </F>
        </Row>
      )}
      {/* extraction advanced */}
      <div style={{marginTop:16}}>
        <button onClick={()=>setExtrAdv(x=>!x)} style={{fontFamily:'Jost',fontWeight:300,fontSize:11,color:extrAdv?BR:MT,background:'none',border:`1px solid ${extrAdv?BR:BD}`,borderRadius:3,padding:'7px 16px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:8,letterSpacing:'.08em',textTransform:'uppercase'}}>
          <span style={{fontSize:9}}>{extrAdv?'▲':'▼'}</span> Advanced
        </button>
        {extrAdv&&<div style={{marginTop:14,padding:'18px 20px',border:`1px solid ${BD}`,borderRadius:4,background:SURF,animation:'fadein .2s ease'}}>
          <Row gap={14}>
            <F label="Water Profile">
              <select className="i" value={f.extr.waterProfile} onChange={e=>set('extr.waterProfile',e.target.value)} style={{colorScheme:'dark'}}>
                <option value="">Select…</option>
                {['TWW','Tap','Bottled','Rao-Perger'].map(o=><option key={o}>{o}</option>)}
              </select>
            </F>
            <F label="Water Temp at Group (°C)" flex="0 0 200px">
              <input type="number" step="0.5" className="i" value={f.extr.waterTemp} onChange={e=>set('extr.waterTemp',e.target.value)} placeholder="93.0"/>
            </F>
          </Row>
          <Row mt={14} gap={14}>
            <F label="Peak Pressure (bar)" flex="0 0 155px"><input type="number" step="0.5" className="i" value={f.extr.peakPressure} onChange={e=>set('extr.peakPressure',e.target.value)} placeholder="9.0"/></F>
            <F label="Brew Pressure (bar)" flex="0 0 155px"><input type="number" step="0.5" className="i" value={f.extr.brewPressure} onChange={e=>set('extr.brewPressure',e.target.value)} placeholder="6.0"/></F>
            <F label="First Drip (s)" flex="0 0 130px"><input type="number" step="0.5" className="i" value={f.preInf.firstDrip} onChange={e=>set('preInf.firstDrip',e.target.value)} placeholder="8"/></F>
            <F label="Flow Rate (g/s)" flex="0 0 130px" minW={100}>
              <div style={{padding:'10px 14px',background:S2,border:`1px solid ${BD}`,borderRadius:3,fontFamily:'DM Mono',fontSize:15,color:BR}}>{flowRate}</div>
            </F>
          </Row>
          <div style={{marginTop:14}}>
            <Lbl t="Profile Type"/>
            <select className="i" value={f.extr.profileType} onChange={e=>set('extr.profileType',e.target.value)} style={{colorScheme:'dark'}}>
              <option value="">Select…</option>
              {['Flat 9 bar','Declining pressure','Lever','Turbo','Blooming espresso'].map(o=><option key={o}>{o}</option>)}
            </select>
          </div>
          <div style={{marginTop:14}}>
            <Chk val={f.extr.channeling} onChange={()=>set('extr.channeling',!f.extr.channeling)} label="Channeling observed"/>
          </div>
        </div>}
      </div>

      {/* ── TASTING ── */}
      <Sec title="Tasting"/>
      <div style={{marginBottom:16}}>
        {['acidity','sweetness','bitterness','body'].map(a=><Sld key={a} label={a} value={f.tasting[a]} onChange={v=>set(`tasting.${a}`,v)}/>)}
      </div>
      <div style={{marginBottom:20}}>
        <button onClick={()=>setTastAdv(x=>!x)} style={{fontFamily:'Jost',fontWeight:300,fontSize:11,color:tastAdv?BR:MT,background:'none',border:`1px solid ${tastAdv?BR:BD}`,borderRadius:3,padding:'7px 16px',cursor:'pointer',transition:'all .2s',display:'flex',alignItems:'center',gap:8,letterSpacing:'.08em',textTransform:'uppercase'}}>
          <span style={{fontSize:9}}>{tastAdv?'▲':'▼'}</span> Advanced
        </button>
        {tastAdv&&<div style={{marginTop:12,padding:'16px 18px',border:`1px solid ${BD}`,borderRadius:4,background:SURF,animation:'fadein .2s ease'}}>
          <Lbl t="Flavor Notes" sx={{marginBottom:14}}/>
          {[['chocolate','Chocolate'],['orangePeel','Orange Peel'],['caramel','Caramel'],['almond','Almond']].map(([key,label])=>(
            <Sld key={key} label={label} value={f.tasting[key]??5} onChange={v=>set(`tasting.${key}`,v)}/>
          ))}
        </div>}
      </div>
      <div style={{padding:18,background:SURF,border:`1px solid ${BD}`,borderRadius:4,marginBottom:20,userSelect:'none',WebkitUserSelect:'none'}}>
        <Lbl t="Shot appearance" sx={{marginBottom:14}}/>
        <Shot ratio={f.tasting.ratio} cVal={f.tasting.cVal} kVal={f.tasting.kVal}
          onRatio={v=>set('tasting.ratio',v)} onCVal={v=>set('tasting.cVal',v)} onKVal={v=>set('tasting.kVal',v)}/>
      </div>
      <div style={{marginBottom:20}}><Lbl t="Overall rating" sx={{marginBottom:10}}/><Stars value={f.tasting.stars} onChange={v=>set('tasting.stars',v)}/></div>
      <div style={{marginBottom:20}}><Lbl t="Tasting Notes"/>
        <textarea className="i" rows="2" value={f.tasting.tastingNotes} onChange={e=>set('tasting.tastingNotes',e.target.value)} placeholder="e.g. Dark cherry, brown sugar, mild citrus acidity…" style={{resize:'vertical'}}/>
      </div>
      <div style={{marginBottom:20}}><Lbl t="Finish / Aftertaste"/>
        <textarea className="i" rows="2" value={f.tasting.finish} onChange={e=>set('tasting.finish',e.target.value)} placeholder="e.g. Long, clean finish with lingering sweetness…" style={{resize:'vertical'}}/>
      </div>
      <div style={{marginBottom:20}}><Lbl t="More to add on…"/>
        <textarea className="i" rows="2" value={f.tasting.notes} onChange={e=>set('tasting.notes',e.target.value)} placeholder="Thoughts, comparisons, tweaks for next time…" style={{resize:'vertical'}}/>
      </div>
      <div style={{marginBottom:28}}><Lbl t="Photo"/>
        {f.tasting.photo
          ?<div style={{position:'relative',display:'inline-block'}}>
              <img src={f.tasting.photo} alt="" style={{maxWidth:200,maxHeight:200,borderRadius:4,border:`1px solid ${BD}`,objectFit:'cover',display:'block'}}/>
              <button onClick={()=>set('tasting.photo',null)} style={{position:'absolute',top:5,right:5,background:BG,border:`1px solid ${BD}`,borderRadius:'50%',width:22,height:22,cursor:'pointer',color:MT,fontSize:12,display:'flex',alignItems:'center',justifyContent:'center'}}>✕</button>
            </div>
          :<label style={{display:'inline-flex',alignItems:'center',gap:10,padding:'10px 18px',border:`1px dashed ${BD}`,borderRadius:4,cursor:'pointer',fontFamily:'Jost',fontWeight:300,fontSize:13,color:MT,transition:'border-color .2s,color .2s'}}
              onMouseEnter={e=>{e.currentTarget.style.borderColor=BR;e.currentTarget.style.color=TX}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor=BD;e.currentTarget.style.color=MT}}>
              <input type="file" accept="image/*" onChange={photo} style={{display:'none'}}/>Upload photo
            </label>}
      </div>
      <div style={{display:'flex',alignItems:'center',gap:18,paddingTop:18,borderTop:`1px solid ${BD}`}}>
        <button className="pb" onClick={()=>onSave(f)}>Save entry</button>
        <button className="gb" onClick={onCancel}>Discard</button>
        <label style={{display:'flex',alignItems:'center',gap:9,cursor:'pointer',marginLeft:'auto'}}>
          <div onClick={()=>set('isThisIt',!f.isThisIt)} style={{width:19,height:19,borderRadius:3,border:`2px solid ${f.isThisIt?GOLD:BD}`,background:f.isThisIt?GOLD:'transparent',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',transition:'all .15s'}}>
            {f.isThisIt&&<span style={{color:BG,fontSize:11,fontWeight:700}}>★</span>}
          </div>
          <span style={{fontFamily:'Jost',fontWeight:f.isThisIt?600:300,fontSize:13,color:f.isThisIt?GOLD:MT,transition:'color .15s',letterSpacing:f.isThisIt?'.04em':'0'}}>{f.isThisIt?'THIS IS IT!! 🎉':'THIS IS IT!'}</span>
        </label>
      </div>
    </div>
  );
}

/* ── Entry view (read-only) ────────────────────────── */
function EView({entry,onEdit,onDelete}){
  const[confirming,setConfirming]=useState(false);
  const{tasting:t,grind,extr}=entry;
  const ratio=(()=>{const d=+grind?.dose,y=+extr?.yield;return(d&&y)?(y/d).toFixed(2):'—'})();
  const cc=t?cColor(t.cVal??30):'#E8C878',kc=t?kColor(t.kVal??60):'#8B5A30';
  const W=80,H=74,gp2=`M6,4 L74,4 C77,22 69,50 68,64 Q54,71 40,71 Q26,71 12,64 C11,50 3,22 6,4 Z`;
  const dY2=H*(t?.ratio??0.25);
  const Stat=({lb,v,u})=>v?<div style={{textAlign:'center',padding:'10px 14px',borderRight:`1px solid ${BD}`}}>
    <div style={{fontFamily:'DM Mono',fontSize:18,color:TX}}>{v}<span style={{fontSize:10,color:MT,marginLeft:2}}>{u}</span></div>
    <div style={{fontFamily:'Jost',fontWeight:300,fontSize:9,color:DIM,letterSpacing:'.1em',textTransform:'uppercase',marginTop:3}}>{lb}</div>
  </div>:null;
  const Bar=({a})=>(
    <div style={{marginBottom:8}}>
      <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
        <span style={{fontFamily:'Jost',fontWeight:300,fontSize:11,color:MT,textTransform:'uppercase',letterSpacing:'.1em'}}>{a}</span>
        <span style={{fontFamily:'DM Mono',fontSize:11,color:BR}}>{t[a]}</span>
      </div>
      <div style={{height:3,background:BD,borderRadius:2}}><div style={{height:'100%',width:`${t[a]*10}%`,background:BR,borderRadius:2}}/></div>
    </div>
  );
  return(
    <div style={{padding:'28px 40px',animation:'fadein .25s ease'}}>
      {/* header */}
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
        <div>
          <div style={{fontFamily:'DM Mono',fontSize:11,color:DIM,marginBottom:8}}>{fdate(entry.date)}</div>
          <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:26,color:TX}}>{entry.title||'Untitled session'}</div>
          {entry.isThisIt&&<div style={{marginTop:7,fontFamily:'Jost',fontWeight:600,fontSize:11,color:GOLD,letterSpacing:'.1em'}}>THIS IS IT!! 🎉</div>}
        </div>
        <div style={{display:'flex',gap:10,alignItems:'center',flexShrink:0}}>
          {!confirming
            ?<><button className="gb" onClick={onEdit}>Edit</button>
               <button className="gb" onClick={()=>setConfirming(true)} style={{color:'#E05040',borderColor:'rgba(200,80,60,0.4)'}}>Delete</button></>
            :<><span style={{fontFamily:'Jost',fontWeight:300,fontSize:12,color:'#E06040'}}>Delete this entry?</span>
               <button onClick={()=>onDelete(entry.id)} style={{fontFamily:'Jost',fontWeight:500,fontSize:11,background:'rgba(200,80,60,0.15)',color:'#E06040',border:'1px solid rgba(200,80,60,0.4)',borderRadius:3,padding:'7px 14px',cursor:'pointer'}}>Yes</button>
               <button className="gb" onClick={()=>setConfirming(false)} style={{fontSize:11,padding:'7px 14px'}}>No</button></>}
        </div>
      </div>

      {/* ── shot + tasting + stars always at top ── */}
      {t&&<div style={{display:'flex',gap:24,flexWrap:'wrap',marginBottom:20,padding:'18px 20px',background:SURF,borderRadius:4,border:`1px solid ${BD}`}}>
        <div style={{flexShrink:0,display:'flex',flexDirection:'column',alignItems:'center',gap:8}}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
            <defs><clipPath id="ev"><path d={gp2}/></clipPath></defs>
            <rect x="0" y="0" width={W} height={H} fill={kc} clipPath="url(#ev)"/>
            <rect x="0" y="0" width={W} height={dY2} fill={cc} clipPath="url(#ev)"/>
            <path d={`M14,5 C11,24 11,44 14,60`} fill="none" stroke="rgba(255,255,255,.2)" strokeWidth="5" strokeLinecap="round" clipPath="url(#ev)"/>
            <path d={gp2} fill="none" stroke={BR} strokeWidth="1.5"/>
            <line x1="6" y1="4" x2="74" y2="4" stroke={BR} strokeWidth="2"/>
            <ellipse cx="40" cy={H-1} rx="20" ry="2.5" fill={BR} opacity="0.4"/>
          </svg>
          <div style={{display:'flex',gap:3}}>
            {[1,2,3,4,5].map(s=><span key={s} style={{fontSize:16,color:s<=t.stars?BR:BD}}>★</span>)}
          </div>
        </div>
        <div style={{flex:1,minWidth:160}}>
          {['acidity','sweetness','bitterness','body'].map(a=><Bar key={a} a={a}/>)}
        </div>
      </div>}

      {/* stats row */}
      <div style={{display:'flex',border:`1px solid ${BD}`,borderRadius:4,background:SURF,marginBottom:16,flexWrap:'wrap'}}>
        <Stat lb="Dose" v={grind?.dose} u="g"/>
        <Stat lb="Yield" v={extr?.yield} u="g"/>
        {ratio!=='—'&&<Stat lb="Ratio" v={`1:${ratio}`}/>}
        <Stat lb="Time" v={extr?.time} u="s"/>
        <Stat lb="Temp" v={extr?.temp} u="°C"/>
      </div>

      {/* grind info */}
      {(grind?.grinder||grind?.grindSetting)&&<div style={{marginBottom:16,padding:'10px 16px',background:SURF,borderRadius:3,border:`1px solid ${BD}`}}>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:DIM,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:4}}>Grind</div>
        <div style={{fontFamily:'Jost',fontSize:14,color:TX}}>{grind.grinder}{grind.grindSetting&&` · ${grind.grindSetting}`}</div>
      </div>}

      {/* notes */}
      {t?.tastingNotes&&<div style={{marginBottom:12,padding:'12px 16px',background:SURF,borderRadius:3,border:`1px solid ${BD}`}}>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:DIM,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Tasting Notes</div>
        <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:15,color:TX,lineHeight:1.6}}>{t.tastingNotes}</div>
      </div>}
      {t?.finish&&<div style={{marginBottom:12,padding:'12px 16px',background:SURF,borderRadius:3,border:`1px solid ${BD}`}}>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:DIM,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Finish</div>
        <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:15,color:TX,lineHeight:1.6}}>{t.finish}</div>
      </div>}
      {t?.notes&&<div style={{marginBottom:12,padding:'12px 16px',background:SURF,borderRadius:3,border:`1px solid ${BD}`}}>
        <div style={{fontFamily:'Jost',fontWeight:300,fontSize:10,color:DIM,letterSpacing:'.1em',textTransform:'uppercase',marginBottom:6}}>Notes</div>
        <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:15,color:TX,lineHeight:1.6,whiteSpace:'pre-wrap'}}>{t.notes}</div>
      </div>}
      {t?.photo&&<div style={{marginTop:16}}><img src={t.photo} alt="" style={{maxWidth:'100%',maxHeight:240,borderRadius:4,border:`1px solid ${BD}`,objectFit:'cover'}}/></div>}
    </div>
  );
}

/* ── Journal (two-panel) ───────────────────────────── */
function Journal({bean,entries,onSave,onBack,grinders,onUpdateBean,onDeleteEntry}){
  const[panel,setPanel]=useState('list');
  const[editE,setEditE]=useState(null);
  const[selId,setSelId]=useState(null);
  const[editingBean,setEditingBean]=useState(false);
  const w=useWidth();
  const mob=w<768;
  const sorted=[...entries].sort((a,b)=>{if(a.isThisIt&&!b.isThisIt)return-1;if(!a.isThisIt&&b.isThisIt)return 1;return b.date.localeCompare(a.date)});
  const sel=entries.find(e=>e.id===selId);

  if(editingBean) return <AddBean initial={bean} onSave={b=>{onUpdateBean(b);setEditingBean(false)}} onBack={()=>setEditingBean(false)}/>;

  // Mobile: on mobile show either list OR content, never both
  const showingContent=mob&&(panel==='new'||panel==='edit'||(panel==='list'&&selId));

  const BeanHeader=()=>(
    <div style={{padding:mob?'20px 20px 16px':'18px 18px 14px',borderBottom:`1px solid ${BD}`}}>
      <button onClick={showingContent?()=>{setSelId(null);setPanel('list')}:onBack} style={{background:'none',border:'none',color:MT,cursor:'pointer',fontSize:mob?22:17,padding:'0 0 7px',display:'block'}}>←</button>
      <div style={{fontFamily:'Jost',fontWeight:600,fontSize:mob?15:11,color:TX,letterSpacing:'.08em',textTransform:'uppercase'}}>{bean.brand}</div>
      <div style={{fontFamily:'Jost',fontWeight:300,fontSize:mob?14:11,color:MT,marginTop:3}}>{bean.name}</div>
      <div style={{display:'flex',alignItems:'center',gap:8,marginTop:8,flexWrap:'wrap'}}>
        {bean.roast&&<div style={{padding:'3px 10px',border:`1px solid ${BD}`,borderRadius:2,fontFamily:'Jost',fontWeight:300,fontSize:mob?11:9,color:DIM,letterSpacing:'.1em',textTransform:'uppercase'}}>{bean.roast}</div>}
        {bean.price&&<div style={{padding:'3px 10px',border:`1px solid ${BD}`,borderRadius:2,fontFamily:'DM Mono',fontSize:mob?11:9,color:DIM}}>${bean.price}/100g</div>}
        {bean.roastDate&&(()=>{const d=Math.floor((new Date()-new Date(bean.roastDate+'T00:00:00'))/86400000);return d>=0?<div style={{fontFamily:'DM Mono',fontSize:mob?12:10,color:MT}}>{d}d</div>:null;})()}
        <button onClick={()=>setEditingBean(true)} style={{background:'none',border:'none',fontFamily:'Jost',fontWeight:300,fontSize:mob?12:10,color:MT,cursor:'pointer',letterSpacing:'.08em',textDecoration:'underline',padding:0,textUnderlineOffset:'2px'}}>Edit</button>
      </div>
    </div>
  );

  const EntryList=()=>(
    <div style={{flex:1,overflowY:'auto'}}>
      {sorted.length===0&&<div style={{padding:'32px 20px',fontFamily:'Jost',fontWeight:300,fontSize:mob?15:12,color:DIM,textAlign:'center',lineHeight:1.7}}>No entries yet.<br/>Start your first pull.</div>}
      {sorted.map(e=>(
        <div key={e.id} className="er" onClick={()=>{setSelId(e.id);setPanel('list')}}
          style={{padding:mob?'18px 20px':'12px 16px',borderBottom:`1px solid ${BD}`,background:selId===e.id&&!mob?S2:'transparent',borderLeft:e.isThisIt?`3px solid ${GOLD}`:`3px solid transparent`}}>
          <div style={{fontFamily:'DM Mono',fontSize:mob?12:9,color:DIM,marginBottom:4}}>{fdate(e.date)}</div>
          <div style={{fontFamily:'Jost',fontWeight:300,fontSize:mob?16:12,color:e.isThisIt?GOLD:TX,lineHeight:1.4}}>{e.isThisIt&&'★ '}{e.title||'Untitled session'}</div>
          {e.tasting?.stars>0&&<div style={{marginTop:4,color:BR,fontSize:mob?13:9}}>{'★'.repeat(e.tasting.stars)}</div>}
        </div>
      ))}
    </div>
  );

  // Mobile layout: full-screen panels
  if(mob){
    if(showingContent) return(
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:BG,overflow:'hidden'}}>
        <div style={{borderBottom:`1px solid ${BD}`,padding:'16px 20px',display:'flex',alignItems:'center',gap:12,flexShrink:0}}>
          <button onClick={()=>{setSelId(null);setPanel('list')}} style={{background:'none',border:'none',color:MT,cursor:'pointer',fontSize:22,padding:0,lineHeight:1}}>←</button>
          <div style={{fontFamily:'Jost',fontWeight:600,fontSize:14,color:TX,letterSpacing:'.06em',textTransform:'uppercase'}}>{bean.brand} · {bean.name}</div>
        </div>
        <div style={{flex:1,overflowY:'auto'}}>
          {(panel==='new'||panel==='edit')
            ?<EForm key={editE?.id} init={editE} grinders={grinders} beanRoastDate={bean.roastDate}
                onSave={e=>{onSave(e);setSelId(e.id);setPanel('list')}} onCancel={()=>{setSelId(null);setPanel('list')}}/>
            :sel?<EView entry={sel}
                onEdit={()=>{setEditE(sel);setPanel('edit')}}
                onDelete={id=>{onDeleteEntry(id);setSelId(null);setPanel('list')}}/>
            :null}
        </div>
      </div>
    );
    // Mobile list view
    return(
      <div style={{display:'flex',flexDirection:'column',height:'100vh',background:BG,overflow:'hidden'}}>
        <BeanHeader/>
        <div style={{padding:'12px 16px',borderBottom:`1px solid ${BD}`}}>
          <button className="pb" onClick={()=>{setEditE(mkE());setPanel('new');setSelId(null)}} style={{width:'100%',padding:'14px 0',fontSize:13}}>+ NEW ENTRY</button>
        </div>
        <EntryList/>
        <div style={{padding:'12px 16px',borderTop:`1px solid ${BD}`,flexShrink:0}}>
          <button className="gb" onClick={onBack} style={{fontSize:13,padding:'10px 20px'}}>← All beans</button>
        </div>
      </div>
    );
  }

  // Desktop: two-panel layout
  return(
    <div style={{display:'flex',height:'100vh',background:BG,animation:'fadein .3s ease',overflow:'hidden'}}>
      <div style={{width:236,flexShrink:0,borderRight:`1px solid ${BD}`,display:'flex',flexDirection:'column',height:'100%'}}>
        <BeanHeader/>
        <div style={{padding:12,borderBottom:`1px solid ${BD}`}}>
          <button className="pb" onClick={()=>{setEditE(mkE());setPanel('new');setSelId(null)}} style={{width:'100%',padding:'9px 0',fontSize:10}}>+ New entry</button>
        </div>
        <EntryList/>
      </div>
      <div style={{flex:1,overflowY:'auto',height:'100%'}}>
        {(panel==='new'||panel==='edit')
          ?<EForm key={editE?.id} init={editE} grinders={grinders} beanRoastDate={bean.roastDate}
              onSave={e=>{onSave(e);setSelId(e.id);setPanel('list')}} onCancel={()=>setPanel('list')}/>
          :sel?<EView entry={sel}
              onEdit={()=>{setEditE(sel);setPanel('edit')}}
              onDelete={id=>{onDeleteEntry(id);setSelId(null);setPanel('list')}}/>
          :<div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',height:'100%'}}>
              <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:26,color:DIM,marginBottom:10}}>Ready for a pull?</div>
              <div style={{fontFamily:'Jost',fontWeight:300,fontSize:13,color:DIM}}>Select an entry or start a new one.</div>
            </div>}
      </div>
    </div>
  );
}

/* ── App root ──────────────────────────────────────── */
export default function App(){
  const[page,setPage]=useState('welcome');
  const[beans,setBeans]=useState([]);
  const[entries,setEntries]=useState({});
  const[bean,setBean]=useState(null);
  const[ready,setReady]=useState(false);

  useEffect(()=>{
    if(!document.getElementById('esp-css')){const el=document.createElement('style');el.id='esp-css';el.textContent=CSS;document.head.appendChild(el)}
    setBeans(sg('esp-beans',[]));
    setEntries(sg('esp-entries',{}));
    setReady(true);
  },[]);

  const grinders=[...new Set(Object.values(entries).flat().map(e=>e.grind?.grinder).filter(Boolean))];

  const saveBean=b=>{const next=[...beans,b];setBeans(next);ss('esp-beans',next);setPage('welcome')};
  const updateBean=b=>{const next=beans.map(x=>x.id===b.id?b:x);setBeans(next);ss('esp-beans',next);setBean(b)};
  const deleteBean=id=>{const nb=beans.filter(b=>b.id!==id);const ne={...entries};delete ne[id];setBeans(nb);setEntries(ne);ss('esp-beans',nb);ss('esp-entries',ne)};
  const saveEntry=e=>{
    const bid=bean.id,cur=entries[bid]||[],idx=cur.findIndex(x=>x.id===e.id);
    const next=idx>=0?cur.map((x,i)=>i===idx?e:x):[...cur,e];
    const ne={...entries,[bid]:next};setEntries(ne);ss('esp-entries',ne);
  };
  const deleteEntry=id=>{
    const bid=bean.id,ne={...entries,[bid]:(entries[bid]||[]).filter(e=>e.id!==id)};
    setEntries(ne);ss('esp-entries',ne);
  };

  if(!ready) return (
    <div style={{minHeight:'100vh',background:BG,display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{fontFamily:'Cormorant Garamond',fontStyle:'italic',fontSize:20,color:DIM}}>Warming up…</div>
    </div>
  );
  if(page==='addBean') return <AddBean onSave={saveBean} onBack={()=>setPage('welcome')}/>;
  if(page==='journal'&&bean) return <Journal bean={bean} entries={entries[bean.id]||[]} onSave={saveEntry} onBack={()=>setPage('welcome')} grinders={grinders} onUpdateBean={updateBean} onDeleteEntry={deleteEntry}/>;
  return <Welcome beans={beans} onAdd={()=>setPage('addBean')} onSelect={b=>{setBean(b);setPage('journal')}} onDeleteBean={deleteBean}/>;
}
