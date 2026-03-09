import { useState, useEffect, useCallback } from "react";

// ═══════════════════════════════════════════
// DESIGN
// ═══════════════════════════════════════════
const C={bg:"#000",surface:"#0d0d0d",surface2:"#161616",surface3:"#1c1c1e",card:"#1c1c1e",border:"rgba(255,255,255,0.08)",borderLight:"rgba(255,255,255,0.12)",text:"#f5f5f7",textSec:"#86868b",textDim:"#48484a",accent:"#0a84ff",green:"#30d158",red:"#ff453a",orange:"#ff9f0a",purple:"#bf5af2",teal:"#64d2ff",yellow:"#ffd60a",pink:"#ff375f"};
const css=`*{margin:0;padding:0;box-sizing:border-box}body{background:${C.bg};font-family:-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif;-webkit-font-smoothing:antialiased}::selection{background:${C.accent}40}::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${C.textDim};border-radius:3px}@keyframes fadeIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}.fi{animation:fadeIn .3s ease-out forwards}`;
const MONTHS=["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const genId=()=>Math.random().toString(36).substring(2,10);
const genToken=()=>Math.random().toString(36).substring(2,14);

// ═══════════════════════════════════════════
// API
// ═══════════════════════════════════════════
async function loadData(){try{const r=await fetch("/api/data");return await r.json();}catch(e){return{clients:[]};}}
async function saveData(d){try{await fetch("/api/data",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(d)});}catch(e){console.error(e);}}

// ═══════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════
function Btn({children,onClick,v="sec",s="md",disabled,full}){
  const vs={pri:{bg:C.accent,c:"#fff",b:"none"},sec:{bg:C.surface3,c:C.text,b:`1px solid ${C.border}`},ghost:{bg:"transparent",c:C.textSec,b:"none"},danger:{bg:C.red+"18",c:C.red,b:`1px solid ${C.red}30`}};
  const ss={sm:{p:"5px 12px",f:11},md:{p:"9px 18px",f:13},lg:{p:"13px 26px",f:14}};
  const vv=vs[v]||vs.sec,sz=ss[s]||ss.md;
  return <button onClick={onClick} disabled={disabled} style={{padding:sz.p,fontSize:sz.f,fontFamily:"inherit",fontWeight:500,borderRadius:9,cursor:disabled?"default":"pointer",opacity:disabled?.35:1,transition:"all .2s",width:full?"100%":"auto",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:6,background:vv.bg,color:vv.c,border:vv.b,letterSpacing:"-.01em"}}>{children}</button>;
}

function Inp({label,value,onChange,placeholder,type="text",textarea,rows=3,hint,compact}){
  const sh={width:"100%",fontFamily:"inherit",fontSize:13,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:compact?"8px 12px":"11px 14px",outline:"none",transition:"border-color .2s"};
  return <div style={{marginBottom:compact?8:12}}>
    {label&&<label style={{display:"block",fontSize:11,fontWeight:500,color:C.textSec,marginBottom:4}}>{label}</label>}
    {hint&&<div style={{fontSize:10,color:C.textDim,marginBottom:4}}>{hint}</div>}
    {textarea?<textarea value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={rows} style={{...sh,resize:"vertical",lineHeight:1.5}} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>
    :<input type={type} value={value||""} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={sh} onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor=C.border}/>}
  </div>;
}

function Sel({label,value,onChange,options}){
  return <div style={{marginBottom:12}}>
    {label&&<label style={{display:"block",fontSize:11,fontWeight:500,color:C.textSec,marginBottom:4}}>{label}</label>}
    <select value={value||""} onChange={e=>onChange(e.target.value)} style={{fontFamily:"inherit",fontSize:13,color:C.text,background:C.surface2,border:`1px solid ${C.border}`,borderRadius:9,padding:"11px 14px",width:"100%",outline:"none",cursor:"pointer"}}>
      <option value="">—</option>
      {options.map(o=>typeof o==="string"?<option key={o} value={o}>{o}</option>:<option key={o.v} value={o.v}>{o.l}</option>)}
    </select>
  </div>;
}

function Pill({children,color,active,onClick}){
  const a=active!==undefined?active:true;
  return <button onClick={onClick} style={{fontSize:10,fontWeight:600,padding:"3px 10px",borderRadius:14,cursor:onClick?"pointer":"default",transition:"all .15s",fontFamily:"inherit",background:a?(color||C.accent)+"15":"transparent",color:a?(color||C.accent):C.textDim,border:`1px solid ${a?(color||C.accent)+"40":C.border}`,whiteSpace:"nowrap"}}>{children}</button>;
}

function Modal({children,onClose,title,wide}){
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",backdropFilter:"blur(8px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:16}}>
    <div onClick={e=>e.stopPropagation()} className="fi" style={{background:C.surface,border:`1px solid ${C.border}`,borderRadius:18,width:"100%",maxWidth:wide?800:520,maxHeight:"92vh",overflowY:"auto"}}>
      <div style={{padding:"16px 20px",borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,background:C.surface,zIndex:10,borderRadius:"18px 18px 0 0"}}>
        <span style={{fontSize:16,fontWeight:600,letterSpacing:"-.02em"}}>{title}</span>
        <button onClick={onClose} style={{width:26,height:26,borderRadius:13,background:C.surface3,border:"none",color:C.textSec,fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
      </div>
      <div style={{padding:20}}>{children}</div>
    </div>
  </div>;
}

function Card({children,style}){return <div style={{background:C.card,borderRadius:14,padding:16,border:`1px solid ${C.border}`,marginBottom:10,...style}}>{children}</div>;}
function Stat({label,value,color,sub}){return <Card style={{flex:1,minWidth:100}}><div style={{fontSize:24,fontWeight:700,color:color||C.text,letterSpacing:"-.03em"}}>{value}</div><div style={{fontSize:11,color:C.textSec,marginTop:2}}>{label}</div>{sub&&<div style={{fontSize:10,color:C.textDim,marginTop:2}}>{sub}</div>}</Card>;}

function TabNav({tabs,active,onChange}){
  return <div style={{display:"flex",gap:2,background:C.surface2,borderRadius:10,padding:2,marginBottom:20,overflowX:"auto",flexShrink:0}}>
    {tabs.map(t=><button key={t.key} onClick={()=>onChange(t.key)} style={{padding:"8px 14px",borderRadius:8,border:"none",fontFamily:"inherit",fontSize:12,fontWeight:600,cursor:"pointer",background:active===t.key?C.surface3:"transparent",color:active===t.key?C.text:C.textDim,whiteSpace:"nowrap",transition:"all .15s"}}>{t.label}{t.count!==undefined?<span style={{marginLeft:4,fontSize:10,opacity:.6}}>({t.count})</span>:null}</button>)}
  </div>;
}

function DataRow({onClick,children,style}){
  return <div onClick={onClick} style={{background:C.card,borderRadius:12,border:`1px solid ${C.border}`,marginBottom:4,padding:"12px 16px",cursor:onClick?"pointer":"default",transition:"border-color .15s",display:"flex",alignItems:"center",gap:10,...style}}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.borderColor=C.borderLight;}} onMouseLeave={e=>e.currentTarget.style.borderColor=C.border}>{children}</div>;
}

// ═══════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════
const STATUS_OPTS=["","Working","Done","Filming","Paused"];
const RESULT_OPTS=["","Winning Ad","Losing Ad","Raw Ad","Poor Spend Great CPA","Poor Spend Poor CPA","Great Spend Poor CPA"];
const AD_TYPES=["","UGC","Brand Voice","Skit","Raw","Ideation","Storytelling","Educational","Comparison","Listicle"];
const AWARENESS=["","Unaware","Problem-Aware","Solution-Aware","Product-Aware","Most Aware"];
const CHANNELS=["Facebook","TikTok","Applovin","Google"];
const CAL_METRICS=[
  {key:"revPct",label:"% Yearly Revenue",icon:"🎯",format:"pct"},
  {key:"revPctActual",label:"% Yearly Revenue",icon:"📊",format:"pct"},
  {key:"monthlyRev",label:"Monthly Revenue",icon:"🎯",format:"$"},
  {key:"dailyRev",label:"Daily Revenue",icon:"🎯",format:"$"},
  {key:"monthlyRevActual",label:"Monthly Revenue",icon:"📊",format:"$"},
  {key:"monthlySpend",label:"Monthly Spend",icon:"🎯",format:"$"},
  {key:"dailySpend",label:"Daily Spend",icon:"🎯",format:"$"},
  {key:"monthlySpendActual",label:"Monthly Spend",icon:"📊",format:"$"},
  {key:"mer",label:"MER",icon:"🎯",format:"x"},
  {key:"merActual",label:"MER",icon:"📊",format:"x"},
  {key:"grossProfit",label:"Gross Profit",icon:"🎯",format:"$"},
  {key:"grossPct",label:"Gross %",icon:"🎯",format:"pct"},
  {key:"grossProfitActual",label:"Gross Profit",icon:"📊",format:"$"},
];
const EMPTY_CAL=()=>{const o={};CAL_METRICS.forEach(m=>{o[m.key]={};MONTHS.forEach((_,i)=>o[m.key][i]="");});return o;};

const TABS=[
  {key:"overview",label:"Overview"},
  {key:"roadmap",label:"Creative Roadmap"},
  {key:"ads",label:"Ads Log"},
  {key:"meetings",label:"Meeting Notes"},
  {key:"topads",label:"Top Ads"},
  {key:"cro",label:"CRO"},
  {key:"calendar",label:"Calendar"},
  {key:"creators",label:"Creators"},
];

// ═══════════════════════════════════════════
// MODULE: Overview
// ═══════════════════════════════════════════
function OverviewTab({client}){
  const rm=client.roadmap||[];
  const total=rm.length;
  const winners=rm.filter(r=>r.testResult==="Winning Ad").length;
  const hitRate=total>0?((winners/total)*100).toFixed(1):0;
  const losers=rm.filter(r=>r.testResult==="Losing Ad").length;
  const working=rm.filter(r=>r.status==="Working").length;
  const cal=client.calendar||{};
  const curMonth=new Date().getMonth();

  return <div className="fi">
    <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:16}}>
      <Stat label="Hit Rate" value={hitRate+"%"} color={parseFloat(hitRate)>=30?C.green:C.orange}/>
      <Stat label="Total Tests" value={total}/>
      <Stat label="Winners" value={winners} color={C.green}/>
      <Stat label="Losers" value={losers} color={C.red}/>
      <Stat label="In Progress" value={working} color={C.accent}/>
    </div>
    {/* Monthly snapshot */}
    <Card>
      <div style={{fontSize:13,fontWeight:600,marginBottom:10}}>{MONTHS[curMonth]} Snapshot</div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
        <Stat label="Target Revenue" value={cal.monthlyRev?.[curMonth]?("$"+Number(cal.monthlyRev[curMonth]).toLocaleString()):"—"} color={C.green}/>
        <Stat label="Actual Revenue" value={cal.monthlyRevActual?.[curMonth]?("$"+Number(cal.monthlyRevActual[curMonth]).toLocaleString()):"—"}/>
        <Stat label="Target Spend" value={cal.monthlySpend?.[curMonth]?("$"+Number(cal.monthlySpend[curMonth]).toLocaleString()):"—"} color={C.orange}/>
        <Stat label="Target MER" value={cal.mer?.[curMonth]||"—"} color={C.teal}/>
      </div>
    </Card>
    <Card>
      <div style={{fontSize:13,fontWeight:600,marginBottom:8}}>Quick Stats</div>
      <div style={{fontSize:12,color:C.textSec,lineHeight:1.6}}>
        Top Ads: {(client.topAds||[]).length} logged · CRO Tests: {(client.cro||[]).length} · Creators: {(client.creators||[]).length} · Meeting Notes: {(client.meetings||[]).length}
      </div>
    </Card>
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Creative Roadmap
// ═══════════════════════════════════════════
function RoadmapTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({});
  const items=client.roadmap||[];
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const resetForm=()=>setForm({status:"",batch:"",author:"",concept:"",description:"",keepForUse:false,adVariable:"",usp:"",persona:"",adType:"",awareness:"",linkToBrief:"",testResult:"",learnings:"",iterations:""});

  const addItem=()=>{const n={...form,id:genId()};onUpdate({...client,roadmap:[...items,n]});resetForm();setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,roadmap:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);resetForm();};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,roadmap:items.filter(r=>r.id!==id)});};

  const openEdit=(item)=>{setForm({...item});setEdit(item);};

  const resultColor=(r)=>r==="Winning Ad"?C.green:r==="Losing Ad"?C.red:r==="Raw Ad"?C.orange:C.textDim;

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{resetForm();setShowAdd(true);}}>+ Add Test</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No tests logged yet</div>:
    items.slice().reverse().map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>openEdit(item)}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4,flexWrap:"wrap"}}>
            {item.status&&<Pill color={item.status==="Done"?C.green:item.status==="Working"?C.accent:C.orange}>{item.status}</Pill>}
            {item.testResult&&<Pill color={resultColor(item.testResult)}>{item.testResult}</Pill>}
            {item.batch&&<span style={{fontSize:10,color:C.textDim}}>{item.batch}</span>}
            {item.adType&&<span style={{fontSize:10,color:C.teal}}>{item.adType}</span>}
          </div>
          <div style={{fontSize:14,fontWeight:600,letterSpacing:"-.02em"}}>{item.concept||"Untitled"}</div>
          {item.author&&<div style={{fontSize:11,color:C.textDim,marginTop:2}}>by {item.author}</div>}
          {item.learnings&&<div style={{fontSize:12,color:C.textSec,marginTop:4,lineHeight:1.4}}>{item.learnings.substring(0,120)}{item.learnings.length>120?"...":""}</div>}
        </div>
      </DataRow>
    ))}

    {(showAdd||edit)&&<Modal title={edit?"Edit Test":"Add Test"} onClose={()=>{setShowAdd(false);setEdit(null);resetForm();}} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
        <Sel label="Status" value={form.status} onChange={v=>u("status",v)} options={STATUS_OPTS}/>
        <Inp label="Batch #" value={form.batch} onChange={v=>u("batch",v)} placeholder="BATCH#1" compact/>
        <Inp label="Author" value={form.author} onChange={v=>u("author",v)} placeholder="Name" compact/>
      </div>
      <Inp label="Ad Concept" value={form.concept} onChange={v=>u("concept",v)} placeholder="Concept name"/>
      <Inp label="Description / Hypothesis" value={form.description} onChange={v=>u("description",v)} placeholder="What are you testing and why..." textarea rows={2}/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
        <Sel label="Ad Type" value={form.adType} onChange={v=>u("adType",v)} options={AD_TYPES}/>
        <Sel label="Awareness" value={form.awareness} onChange={v=>u("awareness",v)} options={AWARENESS}/>
        <Inp label="Persona" value={form.persona} onChange={v=>u("persona",v)} placeholder="Target persona" compact/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
        <Inp label="USP" value={form.usp} onChange={v=>u("usp",v)} placeholder="Core USP tested" compact/>
        <Inp label="Ad Variable" value={form.adVariable} onChange={v=>u("adVariable",v)} placeholder="Variable being tested" compact/>
      </div>
      <Inp label="Link to Brief" value={form.linkToBrief} onChange={v=>u("linkToBrief",v)} placeholder="URL"/>
      <Sel label="Test Result" value={form.testResult} onChange={v=>u("testResult",v)} options={RESULT_OPTS}/>
      <Inp label="Learnings" value={form.learnings} onChange={v=>u("learnings",v)} placeholder="What did we learn?" textarea rows={3}/>
      <Inp label="Iterations" value={form.iterations} onChange={v=>u("iterations",v)} placeholder="Next steps / iterations" textarea rows={2}/>
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);resetForm();}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Ads Log
// ═══════════════════════════════════════════
function AdsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [form,setForm]=useState({date:"",facebook:"",tiktok:"",applovin:"",google:""});
  const [edit,setEdit]=useState(null);
  const items=(client.adsLog||[]).slice().sort((a,b)=>b.date?.localeCompare(a.date));
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const addItem=()=>{onUpdate({...client,adsLog:[...(client.adsLog||[]),{...form,id:genId()}]});setForm({date:"",facebook:"",tiktok:"",applovin:"",google:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,adsLog:(client.adsLog||[]).map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,adsLog:(client.adsLog||[]).filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({date:new Date().toISOString().split("T")[0],facebook:"",tiktok:"",applovin:"",google:""});setShowAdd(true);}}>+ Add Entry</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No ad log entries</div>:
    items.map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{minWidth:70}}><div style={{fontSize:13,fontWeight:600}}>{item.date}</div></div>
        <div style={{flex:1,display:"flex",gap:12,flexWrap:"wrap"}}>
          {CHANNELS.map(ch=>{const v=item[ch.toLowerCase()];return v?<div key={ch} style={{flex:1,minWidth:120}}><div style={{fontSize:10,color:C.teal,fontWeight:600}}>{ch}</div><div style={{fontSize:11,color:C.textSec,lineHeight:1.4,marginTop:2}}>{v.substring(0,80)}{v.length>80?"...":""}</div></div>:null;})}
        </div>
      </DataRow>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Entry":"New Entry"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide>
      <Inp label="Date" value={form.date} onChange={v=>u("date",v)} type="date"/>
      {CHANNELS.map(ch=><Inp key={ch} label={ch+" Notes"} value={form[ch.toLowerCase()]} onChange={v=>u(ch.toLowerCase(),v)} placeholder={`${ch} changes & notes...`} textarea rows={2}/>)}
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Meeting Notes
// ═══════════════════════════════════════════
function MeetingsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({date:"",notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});
  const items=(client.meetings||[]).slice().sort((a,b)=>b.date?.localeCompare(a.date));
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const addItem=()=>{onUpdate({...client,meetings:[...(client.meetings||[]),{...form,id:genId()}]});setForm({date:"",notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,meetings:(client.meetings||[]).map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,meetings:(client.meetings||[]).filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({date:new Date().toISOString().split("T")[0],notesMB:"",apMB:"",notesCS:"",apCS:"",notesOM:"",apOM:"",apClient:""});setShowAdd(true);}}>+ Add Meeting</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No meeting notes</div>:
    items.map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{minWidth:70}}><div style={{fontSize:13,fontWeight:600}}>{item.date}</div></div>
        <div style={{flex:1,fontSize:12,color:C.textSec,lineHeight:1.4}}>
          {[item.notesMB,item.notesCS,item.notesOM].filter(Boolean).join(" · ").substring(0,120)||"No notes"}
        </div>
      </DataRow>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Meeting":"New Meeting"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide>
      <Inp label="Date" value={form.date} onChange={v=>u("date",v)} type="date"/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <Inp label="Media Buying Notes" value={form.notesMB} onChange={v=>u("notesMB",v)} textarea rows={2} placeholder="Notes..."/>
        <Inp label="Media Buying Action Points" value={form.apMB} onChange={v=>u("apMB",v)} textarea rows={2} placeholder="Action points..."/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <Inp label="Creative Strategy Notes" value={form.notesCS} onChange={v=>u("notesCS",v)} textarea rows={2} placeholder="Notes..."/>
        <Inp label="Creative Strategy Action Points" value={form.apCS} onChange={v=>u("apCS",v)} textarea rows={2} placeholder="Action points..."/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 12px"}}>
        <Inp label="Ops Manager Notes" value={form.notesOM} onChange={v=>u("notesOM",v)} textarea rows={2} placeholder="Notes..."/>
        <Inp label="Ops Manager Action Points" value={form.apOM} onChange={v=>u("apOM",v)} textarea rows={2} placeholder="Action points..."/>
      </div>
      <Inp label="Client Action Points" value={form.apClient} onChange={v=>u("apClient",v)} textarea rows={2} placeholder="Action points for client..."/>
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Top Performing Ads
// ═══════════════════════════════════════════
function TopAdsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({name:"",link:"",delivery:"",spend:""});
  const items=client.topAds||[];
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const addItem=()=>{onUpdate({...client,topAds:[...items,{...form,id:genId()}]});setForm({name:"",link:"",delivery:"",spend:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,topAds:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,topAds:items.filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({name:"",link:"",delivery:"",spend:""});setShowAdd(true);}}>+ Add Ad</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No top ads logged</div>:
    items.map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600}}>{item.name||"Untitled"}</div>
          <div style={{fontSize:11,color:C.textDim,marginTop:2}}>
            {item.delivery&&<span>Delivery: {item.delivery} · </span>}
            {item.spend&&<span>Spend: ${item.spend}</span>}
          </div>
        </div>
        {item.link&&<a href={item.link} target="_blank" rel="noopener" onClick={e=>e.stopPropagation()} style={{fontSize:11,color:C.accent,textDecoration:"none"}}>View</a>}
      </DataRow>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Ad":"Add Top Ad"} onClose={()=>{setShowAdd(false);setEdit(null);}}>
      <Inp label="Ad Name" value={form.name} onChange={v=>u("name",v)} placeholder="Ad name"/>
      <Inp label="Preview Link" value={form.link} onChange={v=>u("link",v)} placeholder="https://..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
        <Inp label="Delivery" value={form.delivery} onChange={v=>u("delivery",v)} placeholder="Active / Paused"/>
        <Inp label="Ad Spend" value={form.spend} onChange={v=>u("spend",v)} placeholder="5000"/>
      </div>
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: CRO
// ═══════════════════════════════════════════
function CROTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({status:"",dateAdded:"",author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});
  const items=client.cro||[];
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const addItem=()=>{onUpdate({...client,cro:[...items,{...form,id:genId()}]});setForm({status:"",dateAdded:"",author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,cro:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,cro:items.filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({status:"",dateAdded:new Date().toISOString().split("T")[0],author:"",concept:"",offer:"",explanation:"",url:"",sellingPoint:"",avatar:"",result:"",learnings:""});setShowAdd(true);}}>+ Add CRO Test</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No CRO tests logged</div>:
    items.map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",gap:6,alignItems:"center",marginBottom:4}}>
            {item.status&&<Pill color={item.status==="Done"?C.green:C.orange}>{item.status}</Pill>}
            {item.result&&<Pill color={item.result==="Winning Ad"?C.green:C.red}>{item.result}</Pill>}
          </div>
          <div style={{fontSize:14,fontWeight:600}}>{item.concept||"Untitled"}</div>
          {item.learnings&&<div style={{fontSize:12,color:C.textSec,marginTop:2}}>{item.learnings.substring(0,100)}</div>}
        </div>
      </DataRow>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit CRO Test":"Add CRO Test"} onClose={()=>{setShowAdd(false);setEdit(null);}} wide>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
        <Sel label="Status" value={form.status} onChange={v=>u("status",v)} options={STATUS_OPTS}/>
        <Inp label="Date" value={form.dateAdded} onChange={v=>u("dateAdded",v)} type="date" compact/>
        <Inp label="Author" value={form.author} onChange={v=>u("author",v)} placeholder="Name" compact/>
      </div>
      <Inp label="Landing Page Concept" value={form.concept} onChange={v=>u("concept",v)} placeholder="Concept name"/>
      <Inp label="Offer" value={form.offer} onChange={v=>u("offer",v)} placeholder="Offer being tested"/>
      <Inp label="Explanation" value={form.explanation} onChange={v=>u("explanation",v)} textarea rows={2} placeholder="What and why..."/>
      <Inp label="URL" value={form.url} onChange={v=>u("url",v)} placeholder="https://..."/>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
        <Inp label="Selling Point" value={form.sellingPoint} onChange={v=>u("sellingPoint",v)} compact/>
        <Inp label="Avatar" value={form.avatar} onChange={v=>u("avatar",v)} compact/>
      </div>
      <Sel label="Result" value={form.result} onChange={v=>u("result",v)} options={RESULT_OPTS}/>
      <Inp label="Learnings" value={form.learnings} onChange={v=>u("learnings",v)} textarea rows={3} placeholder="What did we learn?"/>
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Calendar
// ═══════════════════════════════════════════
function CalendarTab({client,onUpdate,readOnly}){
  const cal=client.calendar||EMPTY_CAL();
  const fmt=(v,f)=>{if(!v&&v!==0)return"—";const n=parseFloat(v);if(isNaN(n))return v;if(f==="$")return"$"+n.toLocaleString(undefined,{maximumFractionDigits:0});if(f==="pct")return(n*100).toFixed(1)+"%";if(f==="x")return n.toFixed(2)+"x";return v;};

  const updateCal=(metricKey,monthIdx,val)=>{
    const nc={...cal};
    if(!nc[metricKey])nc[metricKey]={};
    nc[metricKey]={...nc[metricKey],[monthIdx]:val};
    onUpdate({...client,calendar:nc});
  };

  return <div className="fi" style={{overflowX:"auto"}}>
    <table style={{width:"100%",borderCollapse:"collapse",fontSize:12}}>
      <thead>
        <tr>
          <th style={{textAlign:"left",padding:"8px 10px",color:C.textSec,fontWeight:600,borderBottom:`1px solid ${C.border}`,position:"sticky",left:0,background:C.bg,minWidth:160}}>Metric</th>
          {MONTHS.map(m=><th key={m} style={{padding:"8px 6px",color:C.textSec,fontWeight:600,borderBottom:`1px solid ${C.border}`,minWidth:90,textAlign:"center"}}>{m}</th>)}
        </tr>
      </thead>
      <tbody>
        {CAL_METRICS.map(metric=>{
          const isTarget=metric.icon==="🎯";
          const isActual=metric.icon==="📊";
          return <tr key={metric.key}>
            <td style={{padding:"6px 10px",borderBottom:`1px solid ${C.border}`,color:isTarget?C.text:C.accent,fontWeight:500,position:"sticky",left:0,background:C.bg,fontSize:11}}>
              {metric.icon} {metric.label}
            </td>
            {MONTHS.map((_,mi)=>(
              <td key={mi} style={{padding:"4px 4px",borderBottom:`1px solid ${C.border}`,textAlign:"center"}}>
                {readOnly?
                  <span style={{fontSize:12,color:isActual?C.accent:C.text}}>{fmt(cal[metric.key]?.[mi],metric.format)}</span>
                :
                  <input value={cal[metric.key]?.[mi]||""} onChange={e=>updateCal(metric.key,mi,e.target.value)}
                    style={{width:"100%",fontSize:11,color:isActual?C.accent:C.text,background:"transparent",border:`1px solid transparent`,borderRadius:6,padding:"4px 6px",outline:"none",textAlign:"center",fontFamily:"inherit"}}
                    onFocus={e=>e.target.style.borderColor=C.accent} onBlur={e=>e.target.style.borderColor="transparent"}
                    placeholder="—"/>
                }
              </td>
            ))}
          </tr>;
        })}
      </tbody>
    </table>
  </div>;
}

// ═══════════════════════════════════════════
// MODULE: Creators
// ═══════════════════════════════════════════
function CreatorsTab({client,onUpdate,readOnly}){
  const [showAdd,setShowAdd]=useState(false);
  const [edit,setEdit]=useState(null);
  const [form,setForm]=useState({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});
  const items=client.creators||[];
  const u=(k,v)=>setForm(p=>({...p,[k]:v}));

  const addItem=()=>{onUpdate({...client,creators:[...items,{...form,id:genId()}]});setForm({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});setShowAdd(false);};
  const saveEdit=()=>{onUpdate({...client,creators:items.map(r=>r.id===edit.id?{...form,id:edit.id}:r)});setEdit(null);};
  const deleteItem=(id)=>{if(confirm("Delete?"))onUpdate({...client,creators:items.filter(r=>r.id!==id)});};

  return <div className="fi">
    {!readOnly&&<div style={{marginBottom:12}}><Btn v="pri" s="sm" onClick={()=>{setForm({size:"",name:"",youtube:"",tiktok:"",instagram:"",trends:"",notes:""});setShowAdd(true);}}>+ Add Creator</Btn></div>}
    {items.length===0?<div style={{textAlign:"center",padding:40,color:C.textDim}}>No creators logged</div>:
    items.map(item=>(
      <DataRow key={item.id} onClick={readOnly?undefined:()=>{setForm({...item});setEdit(item);}}>
        <div style={{flex:1}}>
          <div style={{fontSize:14,fontWeight:600}}>{item.name||"Unnamed"}</div>
          <div style={{fontSize:11,color:C.textDim,marginTop:2,display:"flex",gap:8}}>
            {item.size&&<span>Audience: {item.size}</span>}
            {item.youtube&&<span style={{color:C.red}}>YT</span>}
            {item.tiktok&&<span style={{color:C.teal}}>TT</span>}
            {item.instagram&&<span style={{color:C.pink}}>IG</span>}
          </div>
          {item.trends&&<div style={{fontSize:12,color:C.textSec,marginTop:2}}>{item.trends.substring(0,100)}</div>}
        </div>
      </DataRow>
    ))}
    {(showAdd||edit)&&<Modal title={edit?"Edit Creator":"Add Creator"} onClose={()=>{setShowAdd(false);setEdit(null);}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 10px"}}>
        <Inp label="Creator Name" value={form.name} onChange={v=>u("name",v)} placeholder="Name"/>
        <Inp label="Audience Size" value={form.size} onChange={v=>u("size",v)} placeholder="10K, 100K, 1M"/>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"0 10px"}}>
        <Inp label="YouTube" value={form.youtube} onChange={v=>u("youtube",v)} placeholder="URL or handle" compact/>
        <Inp label="TikTok" value={form.tiktok} onChange={v=>u("tiktok",v)} placeholder="URL or handle" compact/>
        <Inp label="Instagram" value={form.instagram} onChange={v=>u("instagram",v)} placeholder="URL or handle" compact/>
      </div>
      <Inp label="High Performing Content Trends" value={form.trends} onChange={v=>u("trends",v)} textarea rows={2} placeholder="What content patterns work for them..."/>
      <Inp label="Notes" value={form.notes} onChange={v=>u("notes",v)} textarea rows={2} placeholder="Internal notes..."/>
      <div style={{display:"flex",gap:8}}>
        <Btn v="pri" full onClick={edit?saveEdit:addItem}>{edit?"Save":"Add"}</Btn>
        {edit&&<Btn v="danger" onClick={()=>{deleteItem(edit.id);setEdit(null);}}>Delete</Btn>}
      </div>
    </Modal>}
  </div>;
}

// ═══════════════════════════════════════════
// CLIENT DASHBOARD (shared between admin/team/client)
// ═══════════════════════════════════════════
function ClientDashboard({client,onUpdate,readOnly,label}){
  const [tab,setTab]=useState("overview");
  const tabsWithCounts=TABS.map(t=>{
    let count;
    if(t.key==="roadmap")count=(client.roadmap||[]).length;
    else if(t.key==="ads")count=(client.adsLog||[]).length;
    else if(t.key==="meetings")count=(client.meetings||[]).length;
    else if(t.key==="topads")count=(client.topAds||[]).length;
    else if(t.key==="cro")count=(client.cro||[]).length;
    else if(t.key==="creators")count=(client.creators||[]).length;
    return {...t,count};
  });

  return <div>
    {label&&<div style={{fontSize:11,fontWeight:600,color:C.accent,marginBottom:4}}>{label}</div>}
    <TabNav tabs={tabsWithCounts} active={tab} onChange={setTab}/>
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

// ═══════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════
export default function App(){
  const [data,setData]=useState({clients:[]});
  const [loaded,setLoaded]=useState(false);
  const [saving,setSaving]=useState(false);
  const [view,setView]=useState("clients");
  const [selectedClient,setSelectedClient]=useState(null);
  const [shareView,setShareView]=useState(null); // {type:"client"|"team", token}
  const [showNewClient,setShowNewClient]=useState(false);
  const [showShare,setShowShare]=useState(null);
  const [copied,setCopied]=useState("");
  const [error,setError]=useState(null);

  // New client form
  const [cName,setCName]=useState("");

  useEffect(()=>{
    const hash=window.location.hash;
    if(hash.startsWith("#client/"))setShareView({type:"client",token:hash.replace("#client/","")});
    else if(hash.startsWith("#team/"))setShareView({type:"team",token:hash.replace("#team/","")});
    const onHash=()=>{
      const h=window.location.hash;
      if(h.startsWith("#client/"))setShareView({type:"client",token:h.replace("#client/","")});
      else if(h.startsWith("#team/"))setShareView({type:"team",token:h.replace("#team/","")});
      else setShareView(null);
    };
    window.addEventListener("hashchange",onHash);
    return ()=>window.removeEventListener("hashchange",onHash);
  },[]);

  useEffect(()=>{loadData().then(d=>{setData(d);setLoaded(true);});},[]);
  useEffect(()=>{if(!shareView)return;const i=setInterval(()=>{loadData().then(d=>setData(d));},30000);return()=>clearInterval(i);},[shareView]);

  const save=useCallback(async(nd)=>{setData(nd);setSaving(true);await saveData(nd);setSaving(false);},[]);

  const updateClient=(updatedClient)=>{
    const nd={...data,clients:data.clients.map(c=>c.id===updatedClient.id?updatedClient:c)};
    save(nd);
    setSelectedClient(updatedClient);
  };

  const createClient=()=>{
    if(!cName.trim())return;
    const nc={id:genId(),name:cName.trim(),shareToken:genToken(),teamToken:genToken(),createdAt:new Date().toISOString(),roadmap:[],adsLog:[],meetings:[],topAds:[],cro:[],calendar:EMPTY_CAL(),creators:[]};
    save({...data,clients:[...data.clients,nc]});
    setCName("");setShowNewClient(false);
    setSelectedClient(nc);setView("dashboard");
  };

  const deleteClient=(id)=>{
    if(!confirm("Delete this client and ALL data?"))return;
    save({...data,clients:data.clients.filter(c=>c.id!==id)});
    if(selectedClient?.id===id){setSelectedClient(null);setView("clients");}
  };

  const getUrl=(client,type)=>`${window.location.origin}${window.location.pathname}#${type}/${type==="client"?client.shareToken:client.teamToken}`;
  const copyLink=(url,label)=>{navigator.clipboard.writeText(url);setCopied(label);setTimeout(()=>setCopied(""),2000);};

  // ═══ SHARE VIEWS ═══
  if(shareView){
    if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{fontSize:14,color:C.textDim}}>Loading...</div></div>;

    const cl=data.clients.find(c=>shareView.type==="client"?c.shareToken===shareView.token:c.teamToken===shareView.token);
    if(!cl)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{textAlign:"center"}}><div style={{fontSize:18,fontWeight:600,color:C.text,marginBottom:8}}>Link not found</div><div style={{fontSize:14,color:C.textDim}}>This link may have expired.</div></div></div>;

    const isClient=shareView.type==="client";
    const isTeam=shareView.type==="team";

    return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}>
      <style>{css}</style>
      <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}>
        <div style={{maxWidth:1100,margin:"0 auto",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:14,fontWeight:600}}>Growth Dashboard</span>
            <span style={{fontSize:11,color:C.textDim}}>D-DOUBLEU MEDIA</span>
          </div>
          <Pill color={isClient?C.green:C.accent}>{isClient?"Client View":"Team View"}</Pill>
        </div>
      </nav>
      <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>
        <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>{cl.name}</h1>
        <ClientDashboard client={cl} onUpdate={isTeam?updateClient:undefined} readOnly={isClient} label={isClient?"Read-only client view":"Team edit view"}/>
      </div>
      <footer style={{padding:"20px 24px",textAlign:"center",marginTop:40}}><p style={{fontSize:11,color:C.textDim}}>Growth Dashboard · D-DOUBLEU MEDIA</p></footer>
    </div>;
  }

  if(!loaded)return <div style={{background:C.bg,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}><style>{css}</style><div style={{fontSize:14,color:C.textDim}}>Loading...</div></div>;

  // ═══ ADMIN VIEW ═══
  return <div style={{background:C.bg,minHeight:"100vh",color:C.text}}>
    <style>{css}</style>

    <nav style={{position:"sticky",top:0,zIndex:100,background:"rgba(0,0,0,.72)",backdropFilter:"blur(20px) saturate(180%)",borderBottom:`1px solid ${C.border}`,padding:"0 24px"}}>
      <div style={{maxWidth:1100,margin:"0 auto",height:50,display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <span style={{fontSize:14,fontWeight:600}}>Growth Dashboard</span>
          {saving&&<span style={{fontSize:11,color:C.accent,animation:"pulse 1s infinite"}}>Saving</span>}
        </div>
        <div style={{display:"flex",gap:6}}>
          {view==="dashboard"&&selectedClient&&(
            <>
              <Btn v="ghost" s="sm" onClick={()=>{setView("clients");setSelectedClient(null);}}>Back</Btn>
              <Btn v="sec" s="sm" onClick={()=>setShowShare(selectedClient)}>Share</Btn>
            </>
          )}
          {view==="clients"&&<Btn v="pri" s="sm" onClick={()=>setShowNewClient(true)}>New Client</Btn>}
        </div>
      </div>
    </nav>

    {error&&<div style={{background:C.red+"10",borderBottom:`1px solid ${C.red}25`,padding:"10px 24px"}}><div style={{maxWidth:1100,margin:"0 auto",display:"flex",justifyContent:"space-between",alignItems:"center"}}><span style={{fontSize:12,color:C.red}}>{error}</span><Btn v="ghost" s="sm" onClick={()=>setError(null)}>Dismiss</Btn></div></div>}

    <div style={{maxWidth:1100,margin:"0 auto",padding:"28px 24px"}}>

      {/* CLIENT LIST */}
      {view==="clients"&&(
        <div className="fi">
          <h1 style={{fontSize:30,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>Clients</h1>
          {data.clients.length===0?
            <div style={{textAlign:"center",padding:60}}>
              <div style={{fontSize:15,fontWeight:600,color:C.textSec,marginBottom:8}}>No clients yet</div>
              <Btn v="pri" s="lg" onClick={()=>setShowNewClient(true)}>New Client</Btn>
            </div>
          :data.clients.map(cl=>{
            const rm=cl.roadmap||[];const winners=rm.filter(r=>r.testResult==="Winning Ad").length;
            const hitRate=rm.length>0?((winners/rm.length)*100).toFixed(0)+"%":"—";
            return <DataRow key={cl.id} onClick={()=>{setSelectedClient(cl);setView("dashboard");}}>
              <div style={{flex:1}}>
                <div style={{fontSize:16,fontWeight:600,letterSpacing:"-.02em",marginBottom:4}}>{cl.name}</div>
                <div style={{fontSize:12,color:C.textDim,display:"flex",gap:12}}>
                  <span>Hit Rate: <span style={{color:C.green,fontWeight:600}}>{hitRate}</span></span>
                  <span>{rm.length} tests</span>
                  <span>{(cl.topAds||[]).length} top ads</span>
                  <span>{(cl.creators||[]).length} creators</span>
                </div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                <Btn v="ghost" s="sm" onClick={e=>{e.stopPropagation();deleteClient(cl.id);}}>Delete</Btn>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.textDim} strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </div>
            </DataRow>;
          })}
        </div>
      )}

      {/* CLIENT DASHBOARD */}
      {view==="dashboard"&&selectedClient&&(
        <div className="fi">
          <h1 style={{fontSize:28,fontWeight:700,letterSpacing:"-.03em",marginBottom:20}}>{selectedClient.name}</h1>
          <ClientDashboard client={selectedClient} onUpdate={updateClient} readOnly={false} label="Admin view"/>
        </div>
      )}
    </div>

    {/* NEW CLIENT */}
    {showNewClient&&<Modal title="New Client" onClose={()=>setShowNewClient(false)}>
      <Inp label="Client Name" value={cName} onChange={setCName} placeholder="Brand name"/>
      <Btn v="pri" full onClick={createClient} disabled={!cName.trim()}>Create</Btn>
    </Modal>}

    {/* SHARE */}
    {showShare&&<Modal title="Share Links" onClose={()=>{setShowShare(null);setCopied("");}}>
      <div style={{marginBottom:20}}>
        <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Team Link</div>
        <div style={{fontSize:12,color:C.textSec,marginBottom:8}}>Team members can view and edit this client's data.</div>
        <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.accent,wordBreak:"break-all",marginBottom:8}}>{getUrl(showShare,"team")}</div>
        <Btn v="pri" s="sm" full onClick={()=>copyLink(getUrl(showShare,"team"),"team")}>{copied==="team"?"Copied":"Copy Team Link"}</Btn>
      </div>
      <div>
        <div style={{fontSize:13,fontWeight:600,marginBottom:6}}>Client Link</div>
        <div style={{fontSize:12,color:C.textSec,marginBottom:8}}>Client sees a read-only view of their dashboard.</div>
        <div style={{background:C.surface2,border:`1px solid ${C.border}`,borderRadius:10,padding:"10px 14px",fontSize:12,color:C.green,wordBreak:"break-all",marginBottom:8}}>{getUrl(showShare,"client")}</div>
        <Btn v="pri" s="sm" full onClick={()=>copyLink(getUrl(showShare,"client"),"client")}>{copied==="client"?"Copied":"Copy Client Link"}</Btn>
      </div>
    </Modal>}

    <footer style={{padding:"20px 24px",textAlign:"center",marginTop:40}}><p style={{fontSize:11,color:C.textDim}}>Growth Dashboard · D-DOUBLEU MEDIA</p></footer>
  </div>;
}
