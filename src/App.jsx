import { useState, useEffect, useCallback } from "react";

const C={bg:"#000",surface:"#0d0d0d",surface2:"#161616",surface3:"#1c1c1e",card:"#1c1c1e",border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.12)",text:"#f5f5f7",textSec:"#86868b",textDim:"#48484a",accent:"#0a84ff",green:"#30d158",red:"#ff453a",orange:"#ff9f0a",purple:"#bf5af2",teal:"#64d2ff",yellow:"#ffd60a",pink:"#ff375f"};
const css=`*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}::selection{background:${C.accent}40}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.textDim};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.fi{animation:fadeIn .3s ease-out forwards}`;
const MO=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS_IN=[31,28,31,30,31,30,31,31,30,31,30,31];
const genId=()=>Math.random().toString(36).substring(2,10);
const genToken=()=>Math.random().toString(36).substring(2,14);
const fmt$=(v)=>{const n=parseFloat(v);return isNaN(n)?"—":"$"+n.toLocaleString(undefined,{maximumFractionDigits:0});};
const fmtPct=(v)=>{const n=parseFloat(v);return isNaN(n)?"—":(n*100).toFixed(1)+"%";};
const fmtX=(v)=>{const n=parseFloat(v);return isNaN(n)?"—":n.toFixed(2)+"x";};

async function loadData(){try{const r=await fetch("/api/data");return await r.json();}catch(e){return{clients:[]};}}
async function saveData(d){try{await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});}catch(e){console.error(e);}}

// ═══ UI ═══
function Btn({children,onClick,v="sec",s="md",disabled,full}){const vs={pri:{bg:C.accent,c:"#fff",b:"none"},sec:{bg:C.surface3,c:C.text,b:`1px solid ${C.border}`},ghost:{bg:"transparent",c:C.textSec,b:"none"},danger:{bg:C.red+"18",c:C.red,b:`1px solid ${C.red}30`}};const ss={sm:{p:"5px 12px",f:11},md:{p:"9px 18px",f:13},lg:{p:"13px 26px",f:14}};const vv=vs[v]||vs.sec,sz=ss[s]||ss.md;return <button onClick={onClick} disabled={disabled} style={{padding:sz.p,fontSize:sz.f,fontFamily:"inherit",fontWeight:500,borderRadius:9,cursor:disabled?"default":"pointer",opacity:disabled?.35:1,transition:"all .2s",width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,background:vv.bg,color:vv.c,border:vv.b}}>{children}</button>;}

function Inp({label,value,onChange,placeholder,type="text",textarea,rows=3,hint,compact}){const sh={width:"100%",fontFamily:"inherit",fontSize:13,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:compact?"8px 12px":"11px 14px",outline:"none",transition:"border-color .2s"};return <div style={{marginBottom:compact?8:12}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:500,color:C.textSec,marginBottom:4}}>{label}</label>}{hint&&<div style={{fontSize:10,color:C.textDim,marginBottom:4}}>{hint}</div>}{textarea?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...sh,resize:"vertical",lineHeight:1.5}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>:<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={sh} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>}</div>;}

function Sel({label,value,onChange,options}){return <div style={{marginBottom:12}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:500,color:C.textSec,marginBottom:4}}>{label}</label>}<select value={value||""} onChange={e=>onChange(e.target.value)} style={{fontFamily:"inherit",fontSize:13,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 14px",width:"100%",outline:"none",cursor:"pointer"}}><option value="">—</option>{options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}</select></div>;}

function Pill({children,color,active,onClick}){const a=active!==undefined?active:true;return <button onClick={onClick} style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:14,cursor:onClick?"pointer":"default",transition:"all .15s",fontFamily:"inherit",background:a?(color||C.accent)+"15":"transparent",color:a?(color||C.accent):C.textDim,border:`1px solid ${a?(color||C.accent)+"40":C.border}`,whiteSpace:"nowrap"}}>{children}</button>;}

function Modal({children,onClose,title,wide}){return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}><div onClick={e=>e.stopPropagation()} className="fi" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:wide?800:520,maxHeight:"92vh",overflowY:"auto"}}><div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.surface,zIndex:10,borderRadius:"18px 18px 0 0"}}><span style={{fontSize:16,fontWeight:600}}>{title}</span><button onClick={onClose} style={{width:26,height:26,borderRadius:13,background:C.surface3,border:"none",color:C.textSec,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button></div><div style={{padding:20}}>{children}</div></div></div>;}

function Card({children,style}){return <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10,...style}}>{children}</div>;}
function Stat({label,value,color,sub}){return <Card style={{flex:1,minWidth:100}}><div style={{fontSize:24,fontWeight:700,color:color||C.text,letterSpacing:"-.03em"}}>{value}</div><div style={{fontSize:11,color:C.textSec,marginTop:2}}>{label}</div>{sub&&<div style={{fontSize:10,color:C.textDim,marginTop:2}}>{sub}</div>}</Card>;}
function TabNav({tabs,active,onChange}){return <div style={{display:"flex",gap:2,background:C.surface2,borderRadius:10,padding:2,marginBottom:20,overflowX:"auto",flexShrink:0}}>{tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} style={{padding:"8px 14px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",background:active===t.key?C.surface3:"transparent",color:active===t.key?C.text:C.textDim,whiteSpace:"nowrap",transition:"all .15s"}}>{t.label}{t.count!==undefined?<span style={{marginLeft:4,fontSize:10,opacity:.6}}>({t.count})</span>:null}</button>)}</div>;}
function DataRow({onClick,children,style}){return <div onClick={onClick} style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:4,padding:"12px 16px",cursor:onClick?"pointer":"default",transition:"border-color .15s",display:"flex",alignItems:"center",gap:10,...style}} onMouseEnter={e=>{if(onClick)e.currentTarget.style.borderColor=C.borderLight;}} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{children}</div>;}

const STATUS_OPTS=["","Working","Done","Filming","Paused"];
const RESULT_OPTS=["","Winning Ad","Losing Ad","Raw Ad","Poor Spend Great CPA","Poor Spend Poor CPA","Great Spend Poor CPA"];
const CRO_RESULT_OPTS=["","Winning","Losing","Inconclusive"];
const AD_TYPES=["","UGC","Brand Voice","Skit","Raw","Ideation","Storytelling","Educational","Comparison","Listicle"];
const AWARENESS=["","Unaware","Problem-Aware","Solution-Aware","Product-Aware","Most Aware"];
const CHANNELS=["Facebook","TikTok","Applovin","Google"];
const YEARS=[2025,2026,2027,2028];

const EMPTY_YEAR_CAL=()=>{const o={yearlyRevTarget:"",merTarget:"1.8",grossPctTarget:"0.1444"};MO.forEach((_,i)=>{o["revPct_"+i]="";o["revActual_"+i]="";o["spendActual_"+i]="";o["events_"+i]="";o["promos_"+i]="";o["winAds_"+i]="";o["launches_"+i]="";});return o;};

const TABS=[{key:"overview",label:"Overview"},{key:"roadmap",label:"Creative Roadmap"},{key:"ads",label:"Ads Log"},{key:"meetings",label:"Meeting Notes"},{key:"topads",label:"Top Ads"},{key:"cro",label:"CRO"},{key:"calendar",label:"Calendar"},{key:"creators",label:"Creators"}];

// ═══ OVERVIEW ═══
function OverviewTab({client}){
  const rm=client.roadmap||[];const total=rm.length;const winners=rm.filter(r=>r.testResult==="Winning Ad").length;
  const hitRate=total>0?((winners/total)*100).toFixed(1):0;const losers=rm.filter(r=>r.testResult==="Losing Ad").length;const working=rm.filter(r=>r.status==="Working").length;
  const cro=client.cro||[];const croWins=cro.filter(r=>r.result==="Winning").length;const croLosses=cro.filter(r=>r.result==="Losing").length;
  const meetings=(client.meetings||[]).slice().sort((a,b)=>b.date?.localeCompare(a.date)).slice(0,3);
  const recentTests=rm.slice().reverse().slice(0,5);

  return <div className="fi">
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      <Stat label="Hit Rate" value={hitRate+"%"} color={parseFloat(hitRate)>=30?C.green:C.orange}/>
      <Stat label="Total Tests" value={total}/>
      <Stat label="Winners" value={winners} color={C.green}/>
      <Stat label="Losers" value={losers} color={C.red}/>
      <Stat label="In Progress" value={working} color={C.accent}/>
    </div>

    {/* CRO Summary */}
    <Card>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>CRO Summary</div>
      <div style={{display:"flex",gap:12}}>
        <div><span style={{fontSize:18,fontWeight:700,color:C.green}}>{croWins}</span> <span style={{fontSize:11,color:C.textSec}}>Winning</span></div>
        <div><span style={{fontSize:18,fontWeight:700,color:C.red}}>{croLosses}</span> <span style={{fontSize:11,color:C.textSec}}>Losing</span></div>
        <div><span style={{fontSize:18,fontWeight:700}}>{cro.length}</span> <span style={{fontSize:11,color:C.textSec}}>Total tests</span></div>
      </div>
      {cro.slice(-3).reverse().map(c=><div key={c.id} style={{fontSize:12,color:C.textSec,marginTop:6,display:"flex",gap:6,alignItems:"center"}}>
        <Pill color={c.result==="Winning"?C.green:c.result==="Losing"?C.red:C.textDim}>{c.result||"—"}</Pill>
        <span>{c.concept||"Untitled"}</span>
      </div>)}
    </Card>

    {/* Recent Tests */}
    {recentTests.length>0&&<Card>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Recent Tests</div>
      {recentTests.map(item=><div key={item.id} style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
        {item.testResult&&<Pill color={item.testResult==="Winning Ad"?C.green:item.testResult==="Losing Ad"?C.red:C.orange}>{item.testResult}</Pill>}
        <span style={{fontSize:12,fontWeight:600}}>{item.concept||"Untitled"}</span>
        {item.author&&<span style={{fontSize:10,color:C.textDim}}>by {item.author}</span>}
      </div>)}
    </Card>}

    {/* Recent Meetings */}
    {meetings.length>0&&<Card>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Recent Meetings</div>
      {meetings.map(m=><div key={m.id} style={{marginBottom:10,paddingBottom:10,borderBottom:`1px solid ${C.border}`}}>
        <div style={{fontSize:12,fontWeight:600,marginBottom:4}}>{m.date}</div>
        {m.notesMB&&<div style={{fontSize:11,color:C.textSec,marginBottom:2}}><span style={{color:C.teal,fontWeight:600}}>MB:</span> {m.notesMB.substring(0,100)}</div>}
        {m.notesCS&&<div style={{fontSize:11,color:C.textSec,marginBottom:2}}><span style={{color:C.purple,fontWeight:600}}>CS:</span> {m.notesCS.substring(0,100)}</div>}
        {m.apClient&&<div style={{fontSize:11,color:C.orange,marginBottom:2}}>Client AP: {m.apClient.substring(0,100)}</div>}
      </div>)}
    </Card>}

    <Card><div style={{fontSize:12,color:C.textSec}}>Top Ads: {(client.topAds||[]).length} · Creators: {(client.creators||[]).length}</div></Card>
  </div>;
}

// ═══ CREATIVE ROADMAP (expanded inline view) ═══
function RoadmapTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);const [form,setForm]=useState({});
  const items=client.roadmap||[];const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const resetForm=()=>setForm({status:"",batch:"",author:"",concept:"",description:"",adVariable:"",usp:"",persona:"",adType:"",awareness:"",linkToBrief:"",testResult:"",learnings:"",iterations:""});
  const addItem=()=>{onUpdate({...client,roadmap:[...items,{...form,id:genId()}]});resetForm();setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,roadmap:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);resetForm();};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,roadmap:items.filter(r=>r.id!==id)});};
  const resultColor=(r)=>r==="Winning Ad"?C.green:r==="Losing Ad"?C.red:r==="Raw Ad"?C.orange:C.textDim;

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{resetForm();setShowAdd(true);}}>+ Add Test</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No tests logged yet</div>:
    items.slice().reverse().map(item=>(
      <Card key={item.id} style={{cursor:readOnly?"default":"pointer"}} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:6,flexWrap:"wrap"}}>
          {item.status&&<Pill color={item.status==="Done"?C.green:item.status==="Working"?C.accent:C.orange}>{item.status}</Pill>}
          {item.testResult&&<Pill color={resultColor(item.testResult)}>{item.testResult}</Pill>}
          {item.batch&&<span style={{fontSize:10,color:C.textDim}}>{item.batch}</span>}
          {item.adType&&<Pill color={C.teal}>{item.adType}</Pill>}
          {item.awareness&&<Pill color={C.purple}>{item.awareness}</Pill>}
        </div>
        <div style={{fontSize:15,fontWeight:600,letterSpacing:"-.02em",marginBottom:4}}>{item.concept||"Untitled"}</div>
        {item.author&&<div style={{fontSize:11,color:C.textDim}}>by {item.author}{item.persona?` · Persona: ${item.persona}`:""}{item.usp?` · USP: ${item.usp}`:""}</div>}
        {item.description&&<div style={{fontSize:12,color:C.textSec,marginTop:6,lineHeight:1.5,background:C.surface2,borderRadius:8,padding:"8px 12px"}}>{item.description}</div>}
        {item.adVariable&&<div style={{fontSize:11,color:C.textDim,marginTop:4}}>Variable: {item.adVariable}</div>}
        {item.learnings&&<div style={{fontSize:12,color:C.text,marginTop:6,lineHeight:1.5,borderLeft:`3px solid ${resultColor(item.testResult)}`,paddingLeft:10}}>{item.learnings}</div>}
        {item.iterations&&<div style={{fontSize:12,color:C.accent,marginTop:4}}>Next: {item.iterations}</div>}
        {item.linkToBrief&&<a href={item.linkToBrief} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:C.accent,textDecoration:"none",marginTop:4,display:"inline-block"}}>View Brief</a>}
      </Card>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Test":"Add Test"} onClose={()=>{setShowAdd(false);setEdit(null);resetForm();}} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}><Sel label="Status" value={form.status} onChange={v=>u("status",v)} options={STATUS_OPTS}/><Inp label="Batch #" value={form.batch} onChange={v=>u("batch",v)} placeholder="BATCH#1" compact/><Inp label="Author" value={form.author} onChange={v=>u("author",v)} placeholder="Name" compact/></div>
      <Inp label="Ad Concept" value={form.concept} onChange={v=>u("concept",v)} placeholder="Concept name"/>
      <Inp label="Description / Hypothesis" value={form.description} onChange={v=>u("description",v)} textarea rows={2} placeholder="What are you testing and why..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}><Sel label="Ad Type" value={form.adType} onChange={v=>u("adType",v)} options={AD_TYPES}/><Sel label="Awareness" value={form.awareness} onChange={v=>u("awareness",v)} options={AWARENESS}/><Inp label="Persona" value={form.persona} onChange={v=>u("persona",v)} placeholder="Target persona" compact/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}><Inp label="USP" value={form.usp} onChange={v=>u("usp",v)} compact/><Inp label="Ad Variable" value={form.adVariable} onChange={v=>u("adVariable",v)} compact/></div>
      <Inp label="Link to Brief" value={form.linkToBrief} onChange={v=>u("linkToBrief",v)} placeholder="URL"/>
      <Sel label="Test Result" value={form.testResult} onChange={v=>u("testResult",v)} options={RESULT_OPTS}/>
      <Inp label="Learnings" value={form.learnings} onChange={v=>u("learnings",v)} textarea rows={3} placeholder="What did we learn?"/>
      <Inp label="Iterations" value={form.iterations} onChange={v=>u("iterations",v)} textarea rows={2} placeholder="Next steps..."/>
      <div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);resetForm();}}>Delete</Btn>}</div>
    </Modal>}
  </div>;
}

// ═══ ADS LOG ═══
function AdsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);const [form,setForm]=useState({date:"",facebook:"",tiktok:"",applovin:"",google:""});
  const items=(client.adsLog||[]).slice().sort((a,b)=>b.date?.localeCompare(a.date));const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>{onUpdate({...client,adsLog:[...(client.adsLog||[]),{...form,id:genId()}]});setForm({date:"",facebook:"",tiktok:"",applovin:"",google:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,adsLog:(client.adsLog||[]).map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,adsLog:(client.adsLog||[]).filter(r=>r.id!==id)});};
  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({date:new Date().toISOString().split("T")[0],facebook:"",tiktok:"",applovin:"",google:""});setShowAdd(true);}}>+ Add Entry</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No entries</div>:items.map(item=>(<DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}><div style={{minWidth:70}}><div style={{fontSize:13,fontWeight:600}}>{item.date}</div></div><div style={{flex:1,display:"flex",gap:12,flexWrap:"wrap"}}>{CHANNELS.map(ch=>{const v=item[ch.toLowerCase()];return v?<div key={ch} style={{flex:1,minWidth:120}}><div style={{fontSize:10,color:C.teal,fontWeight:600}}>{ch}</div><div style={{fontSize:11,color:C.textSec,lineHeight:1.4,marginTop:2}}>{v.substring(0,80)}{v.length>80?"...":""}</div></div>:null;})}</div></DataRow>))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Entry":"New Entry"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide><Inp label="Date" value={form.date} onChange={v=>u("date",v)} type="date"/>{CHANNELS.map(ch=><Inp key={ch} label={ch+" Notes"} value={form[ch.toLowerCase()]} onChange={v=>u(ch.toLowerCase(),v)} placeholder={`${ch} notes...`} textarea rows={2}/>)}<div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}</div></Modal>}
  </div>;
}

// ═══ MEETING NOTES (expanded view from main) ═══
function MeetingsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({date:"",notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});
  const items=(client.meetings||[]).slice().sort((a,b)=>b.date?.localeCompare(a.date));const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>{onUpdate({...client,meetings:[...(client.meetings||[]),{...form,id:genId()}]});setForm({date:"",notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,meetings:(client.meetings||[]).map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,meetings:(client.meetings||[]).filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({date:new Date().toISOString().split("T")[0],notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});setShowAdd(true);}}>+ Add Meeting</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No meetings</div>:
    items.map(item=>(
      <Card key={item.id} style={{cursor:readOnly?"default":"pointer"}} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{fontSize:14,fontWeight:700,marginBottom:8}}>{item.date}</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          {item.notesMB&&<div><div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:2}}>MEDIA BUYING NOTES</div><div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>{item.notesMB}</div></div>}
          {item.apMB&&<div><div style={{fontSize:10,fontWeight:600,color:C.teal,marginBottom:2}}>MB ACTION POINTS</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{item.apMB}</div></div>}
          {item.notesCS&&<div><div style={{fontSize:10,fontWeight:600,color:C.purple,marginBottom:2}}>CREATIVE STRATEGY NOTES</div><div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>{item.notesCS}</div></div>}
          {item.apCS&&<div><div style={{fontSize:10,fontWeight:600,color:C.purple,marginBottom:2}}>CS ACTION POINTS</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{item.apCS}</div></div>}
          {item.notesOM&&<div><div style={{fontSize:10,fontWeight:600,color:C.orange,marginBottom:2}}>OPS NOTES</div><div style={{fontSize:12,color:C.textSec,lineHeight:1.5}}>{item.notesOM}</div></div>}
          {item.apOM&&<div><div style={{fontSize:10,fontWeight:600,color:C.orange,marginBottom:2}}>OPS ACTION POINTS</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{item.apOM}</div></div>}
        </div>
        {item.apClient&&<div style={{marginTop:8,padding:"8px 12px",background:C.surface2,borderRadius:8,borderLeft:`3px solid ${C.pink}`}}><div style={{fontSize:10,fontWeight:600,color:C.pink,marginBottom:2}}>CLIENT ACTION POINTS</div><div style={{fontSize:12,color:C.text,lineHeight:1.5}}>{item.apClient}</div></div>}
      </Card>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Meeting":"New Meeting"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide>
      <Inp label="Date" value={form.date} onChange={v=>u("date",v)} type="date"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}><Inp label="Media Buying Notes" value={form.notesMB} onChange={v=>u("notesMB",v)} textarea rows={2}/><Inp label="MB Action Points" value={form.apMB} onChange={v=>u("apMB",v)} textarea rows={2}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}><Inp label="Creative Strategy Notes" value={form.notesCS} onChange={v=>u("notesCS",v)} textarea rows={2}/><Inp label="CS Action Points" value={form.apCS} onChange={v=>u("apCS",v)} textarea rows={2}/></div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}><Inp label="Ops Notes" value={form.notesOM} onChange={v=>u("notesOM",v)} textarea rows={2}/><Inp label="Ops Action Points" value={form.apOM} onChange={v=>u("apOM",v)} textarea rows={2}/></div>
      <Inp label="Client Action Points" value={form.apClient} onChange={v=>u("apClient",v)} textarea rows={2}/>
      <div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}</div>
    </Modal>}
  </div>;
}

// ═══ TOP ADS ═══
function TopAdsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);const [form,setForm]=useState({name:"",link:"",delivery:"",spend:""});
  const items=client.topAds||[];const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>{onUpdate({...client,topAds:[...items,{...form,id:genId()}]});setForm({name:"",link:"",delivery:"",spend:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,topAds:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,topAds:items.filter(r=>r.id!==id)});};
  return <div className="fi">{!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({name:"",link:"",delivery:"",spend:""});setShowAdd(true);}}>+ Add Ad</Btn></div>}{items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No top ads</div>:items.map(item=>(<DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{item.name||"Untitled"}</div><div style={{fontSize:11,color:C.textDim,marginTop:2}}>{item.delivery&&<span>Delivery: {item.delivery} · </span>}{item.spend&&<span>Spend: ${item.spend}</span>}</div></div>{item.link&&<a href={item.link} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:C.accent,textDecoration:"none"}}>View</a>}</DataRow>))}
    {(showAdd||edit)&&<Modal title={edit?"Edit":"Add Top Ad"} onClose={()=>{setShowAdd(false);setEdit(null);}}><Inp label="Ad Name" value={form.name} onChange={v=>u("name",v)} placeholder="Name"/><Inp label="Preview Link" value={form.link} onChange={v=>u("link",v)} placeholder="https://..."/><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}><Inp label="Delivery" value={form.delivery} onChange={v=>u("delivery",v)} placeholder="Active / Paused"/><Inp label="Ad Spend" value={form.spend} onChange={v=>u("spend",v)} placeholder="5000"/></div><div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}</div></Modal>}</div>;
}

// ═══ CRO (fixed results: Winning/Losing/Inconclusive) ═══
function CROTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({status:"",dateAdded:"",author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});
  const items=client.cro||[];const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>{onUpdate({...client,cro:[...items,{...form,id:genId()}]});setForm({status:"",dateAdded:"",author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,cro:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,cro:items.filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({status:"",dateAdded:new Date().toISOString().split("T")[0],author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});setShowAdd(true);}}>+ Add CRO Test</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No CRO tests</div>:
    items.map(item=>(
      <Card key={item.id} style={{cursor:readOnly?"default":"pointer"}} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
          {item.status&&<Pill color={item.status==="Done"?C.green:C.orange}>{item.status}</Pill>}
          {item.result&&<Pill color={item.result==="Winning"?C.green:item.result==="Losing"?C.red:C.orange}>{item.result}</Pill>}
          {item.dateAdded&&<span style={{fontSize:10,color:C.textDim}}>{item.dateAdded}</span>}
        </div>
        <div style={{fontSize:14,fontWeight:600}}>{item.concept||"Untitled"}</div>
        {item.offer&&<div style={{fontSize:12,color:C.textSec,marginTop:4}}>Offer: {item.offer}</div>}
        {item.explanation&&<div style={{fontSize:12,color:C.textSec,marginTop:4,lineHeight:1.5}}>{item.explanation}</div>}
        {item.learnings&&<div style={{fontSize:12,color:C.text,marginTop:6,borderLeft:`3px solid ${item.result==="Winning"?C.green:item.result==="Losing"?C.red:C.textDim}`,paddingLeft:10,lineHeight:1.5}}>{item.learnings}</div>}
      </Card>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit CRO":"Add CRO Test"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}><Sel label="Status" value={form.status} onChange={v=>u("status",v)} options={STATUS_OPTS}/><Inp label="Date" value={form.dateAdded} onChange={v=>u("dateAdded",v)} type="date" compact/><Inp label="Author" value={form.author} onChange={v=>u("author",v)} compact/></div>
      <Inp label="Landing Page Concept" value={form.concept} onChange={v=>u("concept",v)} placeholder="Concept name"/>
      <Inp label="Offer" value={form.offer} onChange={v=>u("offer",v)} placeholder="Offer being tested"/>
      <Inp label="Explanation" value={form.explanation} onChange={v=>u("explanation",v)} textarea rows={2}/>
      <Inp label="URL" value={form.url} onChange={v=>u("url",v)} placeholder="https://..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}><Inp label="Selling Point" value={form.sellingPoint} onChange={v=>u("sellingPoint",v)} compact/><Inp label="Avatar" value={form.avatar} onChange={v=>u("avatar",v)} compact/></div>
      <Sel label="Result" value={form.result} onChange={v=>u("result",v)} options={CRO_RESULT_OPTS}/>
      <Inp label="Learnings" value={form.learnings} onChange={v=>u("learnings",v)} textarea rows={3}/>
      <div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}</div>
    </Modal>}
  </div>;
}

// ═══ CALENDAR (with year tabs, formulas, prev year actuals) ═══
function CalendarTab({client,onUpdate,readOnly}){
  const [year,setYear]=useState(2026);
  const calKey="cal_"+year;
  const prevCalKey="cal_"+(year-1);
  const cal=client[calKey]||EMPTY_YEAR_CAL();
  const prevCal=client[prevCalKey]||EMPTY_YEAR_CAL();

  const updateCal=(field,val)=>{
    const nc={...cal,[field]:val};
    onUpdate({...client,[calKey]:nc});
  };
  const updateCalMonth=(prefix,mi,val)=>{updateCal(prefix+"_"+mi,val);};

  // Computed values
  const yearlyTarget=parseFloat(cal.yearlyRevTarget)||0;
  const merTarget=parseFloat(cal.merTarget)||1.8;
  const grossPct=parseFloat(cal.grossPctTarget)||0.1444;

  // Previous year actual monthly revenues (for % calc)
  const prevActuals=MO.map((_,i)=>parseFloat(prevCal["revActual_"+i])||0);
  const prevTotal=prevActuals.reduce((a,b)=>a+b,0);

  const rows=MO.map((_,i)=>{
    const revPctTarget=parseFloat(cal["revPct_"+i])||(prevTotal>0?prevActuals[i]/prevTotal:0);
    const monthlyRevTarget=yearlyTarget*revPctTarget;
    const dailyRevTarget=DAYS_IN[i]>0?monthlyRevTarget/DAYS_IN[i]:0;
    const monthlySpendTarget=merTarget>0?monthlyRevTarget/merTarget:0;
    const dailySpendTarget=DAYS_IN[i]>0?monthlySpendTarget/DAYS_IN[i]:0;
    const grossProfitTarget=monthlyRevTarget-monthlySpendTarget;

    const revActual=parseFloat(cal["revActual_"+i])||0;
    const spendActual=parseFloat(cal["spendActual_"+i])||0;
    const merActual=spendActual>0?revActual/spendActual:0;
    const revPctActual=revActual; // will calc below
    const grossProfitActual=revActual-spendActual;

    return {revPctTarget,monthlyRevTarget,dailyRevTarget,monthlySpendTarget,dailySpendTarget,grossProfitTarget,revActual,spendActual,merActual,grossProfitActual};
  });

  const totalActualRev=rows.reduce((a,r)=>a+r.revActual,0);

  const cell=(val,format,isEditable,onChange)=>{
    if(isEditable&&!readOnly){
      return <input value={val} onChange={e=>onChange(e.target.value)} style={{width:"100%",fontSize:11,color:C.accent,background:"transparent",border:"1px solid transparent",borderRadius:6,padding:"4px 6px",outline:"none",textAlign:"center",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor="transparent"} placeholder="—"/>;
    }
    const formatted=format==="$"?fmt$(val):format==="pct"?fmtPct(val):format==="x"?fmtX(val):val||"—";
    return <span style={{fontSize:11,color:isEditable?C.accent:C.text}}>{formatted}</span>;
  };

  return <div className="fi">
    {/* Year tabs */}
    <div style={{display:"flex",gap:6,marginBottom:16,alignItems:"center"}}>
      {YEARS.map(y=><Pill key={y} color={C.accent} active={year===y} onClick={()=>setYear(y)}>{y}</Pill>)}
    </div>

    {/* Global inputs */}
    {!readOnly&&<Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 12px"}}>
        <Inp label={`${year} Yearly Revenue Target`} value={cal.yearlyRevTarget} onChange={v=>updateCal("yearlyRevTarget",v)} placeholder="1000000" compact/>
        <Inp label="Target MER" value={cal.merTarget} onChange={v=>updateCal("merTarget",v)} placeholder="1.8" compact/>
        <Inp label="Target Gross %" value={cal.grossPctTarget} onChange={v=>updateCal("grossPctTarget",v)} placeholder="0.1444" compact/>
      </div>
    </Card>}

    {/* Table */}
    <div style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
      <thead><tr>
        <th style={{textAlign:"left",padding:"6px 8px",color:C.textSec,fontWeight:600,borderBottom:`1px solid ${C.border}`,position:"sticky",left:0,background:C.bg,minWidth:150,zIndex:2}}>Metric</th>
        {MO.map(m=><th key={m} style={{padding:"6px 4px",color:C.textSec,fontWeight:600,borderBottom:`1px solid ${C.border}`,minWidth:85,textAlign:"center"}}>{m}</th>)}
      </tr></thead>
      <tbody>
        {/* Target % Revenue */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.text,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 % Yearly Rev</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
            {cell(cal["revPct_"+i]||(prevTotal>0?(prevActuals[i]/prevTotal).toFixed(6):""),"pct",!readOnly,v=>updateCalMonth("revPct",i,v))}
          </td>)}
        </tr>
        {/* Actual % Revenue */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.accent,position:"sticky",left:0,background:C.bg,zIndex:1}}>📊 % Yearly Rev</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:C.accent}}>{totalActualRev>0?fmtPct(rows[i].revActual/totalActualRev):"—"}</span></td>)}
        </tr>
        {/* Target Monthly Revenue */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.text,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Monthly Revenue</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11}}>{fmt$(rows[i].monthlyRevTarget)}</span></td>)}
        </tr>
        {/* Target Daily Revenue */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.textSec,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Daily Revenue</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:C.textSec}}>{fmt$(rows[i].dailyRevTarget)}</span></td>)}
        </tr>
        {/* Actual Monthly Revenue */}
        <tr style={{background:C.surface2+"40"}}><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.accent,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>📊 Monthly Revenue</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
            {cell(cal["revActual_"+i],"",!readOnly,v=>updateCalMonth("revActual",i,v))}
          </td>)}
        </tr>
        {/* Target Monthly Spend */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.text,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Monthly Spend</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11}}>{fmt$(rows[i].monthlySpendTarget)}</span></td>)}
        </tr>
        {/* Target Daily Spend */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.textSec,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Daily Spend</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:C.textSec}}>{fmt$(rows[i].dailySpendTarget)}</span></td>)}
        </tr>
        {/* Actual Monthly Spend */}
        <tr style={{background:C.surface2+"40"}}><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.accent,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>📊 Monthly Spend</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
            {cell(cal["spendActual_"+i],"",!readOnly,v=>updateCalMonth("spendActual",i,v))}
          </td>)}
        </tr>
        {/* Target MER */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.text,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 MER</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11}}>{fmtX(merTarget)}</span></td>)}
        </tr>
        {/* Actual MER */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.accent,position:"sticky",left:0,background:C.bg,zIndex:1}}>📊 MER</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:rows[i].merActual>0?(rows[i].merActual>=merTarget?C.green:C.red):C.textDim}}>{rows[i].merActual>0?fmtX(rows[i].merActual):"—"}</span></td>)}
        </tr>
        {/* Target Gross Profit */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.text,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Gross Profit</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11}}>{fmt$(rows[i].grossProfitTarget)}</span></td>)}
        </tr>
        {/* Target Gross % */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.textSec,position:"sticky",left:0,background:C.bg,zIndex:1}}>🎯 Gross %</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:C.textSec}}>{fmtPct(grossPct)}</span></td>)}
        </tr>
        {/* Actual Gross Profit */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.accent,position:"sticky",left:0,background:C.bg,zIndex:1}}>📊 Gross Profit</td>
          {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:rows[i].grossProfitActual>0?C.green:rows[i].grossProfitActual<0?C.red:C.textDim}}>{rows[i].revActual>0?fmt$(rows[i].grossProfitActual):"—"}</span></td>)}
        </tr>
        {/* YoY Revenue Change */}
        <tr><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.textDim,position:"sticky",left:0,background:C.bg,zIndex:1}}>📈 Rev vs {year-1}</td>
          {MO.map((_,i)=>{const prev=prevActuals[i];const cur=rows[i].revActual;const chg=prev>0&&cur>0?((cur-prev)/prev):null;
            return <td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}><span style={{fontSize:11,color:chg!==null?(chg>=0?C.green:C.red):C.textDim}}>{chg!==null?(chg>=0?"+":"")+fmtPct(chg):"—"}</span></td>;
          })}
        </tr>
        {/* Separator */}
        <tr><td colSpan={13} style={{padding:6,borderBottom:`1px solid ${C.border}`}}></td></tr>
        {/* Text fields */}
        {[{key:"events",label:"🔑 Key Events"},{key:"promos",label:"🏷️ Promos"},{key:"winAds",label:"🚀 Winning Ads"},{key:"launches",label:"📦 Launches"}].map(f=>(
          <tr key={f.key}><td style={{padding:"5px 8px",borderBottom:`1px solid ${C.border}`,color:C.textSec,fontWeight:500,position:"sticky",left:0,background:C.bg,zIndex:1,fontSize:11}}>{f.label}</td>
            {MO.map((_,i)=><td key={i} style={{padding:"3px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
              {readOnly?<span style={{fontSize:10,color:C.textSec}}>{cal[f.key+"_"+i]||""}</span>:
              <input value={cal[f.key+"_"+i]||""} onChange={e=>updateCalMonth(f.key,i,e.target.value)} style={{width:"100%",fontSize:10,color:C.textSec,background:"transparent",border:"1px solid transparent",borderRadius:4,padding:"3px 4px",outline:"none",textAlign:"center",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor="transparent"} placeholder="—"/>}
            </td>)}
          </tr>
        ))}
      </tbody>
    </table>
    </div>
  </div>;
}

// ═══ CREATORS ═══
function CreatorsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);const [edit,setEdit]=useState(null);const [form,setForm]=useState({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});
  const items=client.creators||[];const u=(k,v)=>setForm(p=>({...p,[k]:v}));
  const addItem=()=>{onUpdate({...client,creators:[...items,{...form,id:genId()}]});setForm({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,creators:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,creators:items.filter(r=>r.id!==id)});};
  return <div className="fi">{!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});setShowAdd(true);}}>+ Add Creator</Btn></div>}{items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No creators</div>:items.map(item=>(<DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}><div style={{flex:1}}><div style={{fontSize:14,fontWeight:600}}>{item.name||"Unnamed"}</div><div style={{fontSize:11,color:C.textDim,marginTop:2,display:"flex",gap:8}}>{item.size&&<span>{item.size}</span>}{item.youtube&&<span style={{color:C.red}}>YT</span>}{item.tiktok&&<span style={{color:C.teal}}>TT</span>}{item.instagram&&<span style={{color:C.pink}}>IG</span>}</div>{item.trends&&<div style={{fontSize:12,color:C.textSec,marginTop:2}}>{item.trends.substring(0,100)}</div>}</div></DataRow>))}
    {(showAdd||edit)&&<Modal title={edit?"Edit":"Add Creator"} onClose={()=>{setShowAdd(false);setEdit(null);}}><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}><Inp label="Name" value={form.name} onChange={v=>u("name",v)}/><Inp label="Audience" value={form.size} onChange={v=>u("size",v)} placeholder="10K"/></div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}><Inp label="YouTube" value={form.youtube} onChange={v=>u("youtube",v)} compact/><Inp label="TikTok" value={form.tiktok} onChange={v=>u("tiktok",v)} compact/><Inp label="Instagram" value={form.instagram} onChange={v=>u("instagram",v)} compact/></div><Inp label="Content Trends" value={form.trends} onChange={v=>u("trends",v)} textarea rows={2}/><Inp label="Notes" value={form.notes} onChange={v=>u("notes",v)} textarea rows={2}/><div style={{display:"flex",gap:8}}><Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>{edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}</div></Modal>}</div>;
}

// ═══ CLIENT DASHBOARD ═══
function ClientDashboard({client,onUpdate,readOnly,label}){
  const [tab,setTab]=useState("overview");
  const tabsC=TABS.map(t=>{let c;if(t.key==="roadmap")c=(client.roadmap||[]).length;else if(t.key==="ads")c=(client.adsLog||[]).length;else if(t.key==="meetings")c=(client.meetings||[]).length;else if(t.key==="topads")c=(client.topAds||[]).length;else if(t.key==="cro")c=(client.cro||[]).length;else if(t.key==="creators")c=(client.creators||[]).length;return{...t,count:c};});
  return <div>{label&&<div style={{fontSize:11,fontWeight:600,color:C.accent,marginBottom:4}}>{label}</div>}<TabNav tabs={tabsC} active={tab} onChange={setTab}/>
    {tab==="overview"&&<OverviewTab client={client}/>}
    {tab==="roadmap"&&<RoadmapTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="ads"&&<AdsTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="meetings"&&<MeetingsTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="topads"&&<TopAdsTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="cro"&&<CROTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="calendar"&&<CalendarTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
    {tab==="creators"&&<CreatorsTab client={client} onUpdate={onUpdate} readOnly={readOnly}/>}
  </div>;
}

// ═══ MAIN APP ═══
export default function App(){
  const [data,setData]=useState({clients:[]});const [loaded,setLoaded]=useState(false);const [saving,setSaving]=useState(false);
  const [view,setView]=useState("clients");const [selectedClient,setSelectedClient]=useState(null);
  const [shareView,setShareView]=useState(null);const [showNewClient,setShowNewClient]=useState(false);
  const [showShare,setShowShare]=useState(null);const [copied,setCopied]=useState("");const [cName,setCName]=useState("");

  useEffect(()=>{const hash=window.location.hash;if(hash.startsWith("#client/"))setShareView({type:"client",token:hash.replace("#client/","")});else if(hash.startsWith("#team/"))setShareView({type:"team",token:hash.replace("#team/","")});const onHash=()=>{const h=window.location.hash;if(h.startsWith("#client/"))setShareView({type:"client",token:h.replace("#client/","")});else if(h.startsWith("#team/"))setShareView({type:"team",token:h.replace("#team/","")});else setShareView(null);};window.addEventListener("hashchange",onHash);return()=>window.removeEventListener("hashchange",onHash);},[]);
  useEffect(()=>{loadData().then(d=>{setData(d);setLoaded(true);});},[]);
  useEffect(()=>{if(!shareView)return;const i=setInterval(()=>{loadData().then(d=>setData(d));},30000);return()=>clearInterval(i);},[shareView]);

  const save=useCallback(async(nd)=>{setData(nd);setSaving(true);await saveData(nd);setSaving(false);},[]);
  const updateClient=(uc)=>{const nd={...data,clients:data.clients.map(c=>c.id===uc.id?uc:c)};save(nd);setSelectedClient(uc);};

  const createClient=()=>{if(!cName.trim())return;const nc={id:genId(),name:cName.trim(),shareToken:genToken(),teamToken:genToken(),createdAt:new Date().toISOString(),roadmap:[],adsLog:[],meetings:[],topAds:[],cro:[],creators:[],cal_2025:EMPTY_YEAR_CAL(),cal_2026:EMPTY_YEAR_CAL()};save({...data,clients:[...data.clients,nc]});setCName("");setShowNewClient(false);setSelectedClient(nc);setView("dashboard");};
  const deleteClient=(id)=>{if(!confirm("Delete?"))return;save({...data,clients:data.clients.filter(c=>c.id!==id)});if(selectedClient?.id===id){setSelectedClient(null);setView("clients");}};
  const getUrl=(cl,type)=>`${window.location.origin}${window.location.pathname}#${type}/${type==="client"?cl.shareToken:cl.teamToken}`;
  const copyLink=(url,label)=>{navigator.clipboard.writeText(url);setCopied(label);setTimeout(()=>setCopied(""),2000);};

  if(shareView){
    if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{color:C.textDim}}>Loading...</div></div>;
    const cl=data.clients.find(c=>shareView.type==="client"?c.shareToken===shareView.token:c.teamToken===shareView.token);
    if(!cl)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:600,marginBottom:8}}>Link not found</div></div></div>;
    const isClient=shareView.type==="client";
    return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}><style>{css}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}><div style={{maxWidth:1100,margin:"0 auto",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14,fontWeight:600}}>Growth Dashboard</span><span style={{fontSize:11,color:C.textDim}}>D-DOUBLEU MEDIA</span></div><Pill color={isClient?C.green:C.accent}>{isClient?"Client":"Team"}</Pill></div></nav>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}><h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>{cl.name}</h1><ClientDashboard client={cl} onUpdate={isClient?undefined:updateClient} readOnly={isClient}/></div>
      <footer style={{padding:"20px 24px",textAlign:"center",marginTop:40}}><p style={{fontSize:11,color:C.textDim}}>D-DOUBLEU MEDIA</p></footer></div>;
  }

  if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{color:C.textDim}}>Loading...</div></div>;

  return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}><style>{css}</style>
    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}><div style={{maxWidth:1100,margin:"0 auto",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}><div style={{display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:14,fontWeight:600}}>Growth Dashboard</span>{saving&&<span style={{fontSize:11,color:C.accent,animation:"pulse 1s infinite"}}>Saving</span>}</div><div style={{display:"flex",gap:6}}>{view==="dashboard"&&selectedClient&&<><Btn v="ghost" s="sm" onClick={()=>{setView("clients");setSelectedClient(null);}}>Back</Btn><Btn v="sec" s="sm" onClick={()=>setShowShare(selectedClient)}>Share</Btn></>}{view==="clients"&&<Btn v="pri" s="sm" onClick={()=>setShowNewClient(true)}>New Client</Btn>}</div></div></nav>

    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>
      {view==="clients"&&<div className="fi"><h1 style={{fontSize:30,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>Clients</h1>
        {data.clients.length===0?<div style={{textAlign:"center",padding:60}}><div style={{fontSize:15,fontWeight:600,color:C.textSec,marginBottom:8}}>No clients yet</div><Btn v="pri" s="lg" onClick={()=>setShowNewClient(true)}>New Client</Btn></div>
        :data.clients.map(cl=>{const rm=cl.roadmap||[];const w=rm.filter(r=>r.testResult==="Winning Ad").length;const hr=rm.length>0?((w/rm.length)*100).toFixed(0)+"%":"—";
          return <DataRow key={cl.id} onClick={()=>{setSelectedClient(cl);setView("dashboard");}}><div style={{flex:1}}><div style={{fontSize:16,fontWeight:600,marginBottom:4}}>{cl.name}</div><div style={{fontSize:12,color:C.textDim,display:"flex",gap:12}}><span>Hit Rate: <span style={{color:C.green,fontWeight:600}}>{hr}</span></span><span>{rm.length} tests</span><span>{(cl.cro||[]).length} CRO</span><span>{(cl.creators||[]).length} creators</span></div></div><div style={{display:"flex",gap:6,alignItems:"center"}}><Btn v="ghost" s="sm" onClick={e=>{e.stopPropagation();deleteClient(cl.id);}}>Delete</Btn><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg></div></DataRow>;})}
      </div>}

      {view==="dashboard"&&selectedClient&&<div className="fi"><h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>{selectedClient.name}</h1><ClientDashboard client={selectedClient} onUpdate={updateClient} readOnly={false}/></div>}
    </div>

    {showNewClient&&<Modal title="New Client" onClose={()=>setShowNewClient(false)}><Inp label="Client Name" value={cName} onChange={setCName} placeholder="Brand name"/><Btn v="pri" full onClick={createClient} disabled={!cName.trim()}>Create</Btn></Modal>}

    {showShare&&<Modal title="Share Links" onClose={()=>{setShowShare(null);setCopied("");}}>
      <div style={{marginBottom:20}}><div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Team Link</div><div style={{fontSize:12,color:C.textSec,marginBottom:8}}>Team can view and edit this client.</div><div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.accent,wordBreak:"break-all",marginBottom:8}}>{getUrl(showShare,"team")}</div><Btn v="pri" s="sm" full onClick={()=>copyLink(getUrl(showShare,"team"),"team")}>{copied==="team"?"Copied":"Copy Team Link"}</Btn></div>
      <div><div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Client Link</div><div style={{fontSize:12,color:C.textSec,marginBottom:8}}>Read-only view.</div><div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.green,wordBreak:"break-all",marginBottom:8}}>{getUrl(showShare,"client")}</div><Btn v="pri" s="sm" full onClick={()=>copyLink(getUrl(showShare,"client"),"client")}>{copied==="client"?"Copied":"Copy Client Link"}</Btn></div>
    </Modal>}

    <footer style={{padding:"20px 24px",textAlign:"center",marginTop:40}}><p style={{fontSize:11,color:C.textDim}}>Growth Dashboard · D-DOUBLEU MEDIA</p></footer>
  </div>;
}
