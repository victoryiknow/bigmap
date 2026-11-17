const $=s=>document.querySelector(s);
const esc=s=>String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const LS={get(k,d){try{const v=localStorage.getItem(k);return v==null?d:JSON.parse(v)}catch(_){return d}},set(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(_){}}};
const DARK=matchMedia("(prefers-color-scheme: dark)").matches;
const WIDE=()=>innerWidth>=900;

/* ===== 분류 ===== */
const MAIN={food:"식당",cafe:"카페·빵",bar:"술집"};
const SUBS={food:{korean:"한식·백반",soup:"국밥·탕",noodle:"냉면·국수",meat:"고기",sea:"회·해산물",japanese:"일식",chinese:"중식",western:"양식",asian:"아시아",bunsik:"분식·만두",fine:"코스요리"},
  cafe:{cafe:"카페",bakery:"빵집",dessert:"디저트·떡"},
  bar:{izakaya:"이자카야",wine:"와인",beer:"맥주·펍",cocktail:"칵테일·위스키",pocha:"포차·주점"}};
const EMO={korean:"🍚",soup:"🍲",noodle:"🍜",meat:"🥩",sea:"🐟",japanese:"🍣",chinese:"🥟",western:"🍝",asian:"🍛",bunsik:"🍢",fine:"🍽️",cafe:"☕",bakery:"🥐",dessert:"🍰",izakaya:"🏮",wine:"🍷",beer:"🍺",cocktail:"🍸",pocha:"🍶"};
const SUBC=DARK?{korean:"#f0954a",soup:"#e8b04b",noodle:"#d8c25a",meat:"#f06a6a",sea:"#5aa9e6",japanese:"#45b8a8",chinese:"#e57aa6",western:"#a88ae6",asian:"#8cc56a",bunsik:"#f0a070",fine:"#c9a2f0",cafe:"#c49a7c",bakery:"#d6ad6e",dessert:"#e09ab8",izakaya:"#e0707a",wine:"#d06a96",beer:"#e0b040",cocktail:"#8f94ff",pocha:"#b39ae0"}
 :{korean:"#e0782b",soup:"#c98a14",noodle:"#a8930c",meat:"#d64545",sea:"#2f80c2",japanese:"#13887a",chinese:"#c2417a",western:"#7a5ac8",asian:"#4e9a2f",bunsik:"#e26a2c",fine:"#5b3fa8",cafe:"#8b5e3c",bakery:"#b07a2a",dessert:"#c0628c",izakaya:"#b8323e",wine:"#9e2a5e",beer:"#b88411",cocktail:"#4b4fc4",pocha:"#6d5d9e"};
const GOLD=DARK?"#ffc23d":"#ffb300";
const subName=(c,k)=>(SUBS[c]||{})[k]||"";
const CFOOD=DARK?"#ff8a4c":"#e8641b",CCAFE=DARK?"#c9976b":"#8b5a32",CVIS=DARK?"#6aa2ff":"#2f6fde";
const colOf=p=>VIS[p.id]?CVIS:p.c==="cafe"?CCAFE:CFOOD;
const kindLabel=p=>p.k||subName(p.c,p.s);
/* ===== 영업시간 ===== */
const DAYS="일월화수목금토",DK=["sun","mon","tue","wed","thu","fri","sat"];
const tm=(h,m)=>(+h)*60+(+m);
function dayset(str){const s=new Set();str.replace(/([일월화수목금토])\s*~\s*([일월화수목금토])/g,(m,a,b)=>{let i=DAYS.indexOf(a);const j=DAYS.indexOf(b);for(let n=0;n<7;n++){s.add(i);if(i===j)break;i=(i+1)%7}return ""}).replace(/[일월화수목금토]/g,c=>{s.add(DAYS.indexOf(c));return c});return s}
function openText(p,now){const h=(p.h||"").replace(/[–—]/g,"~").replace(/(\d:\d\d)\s*-\s*(\d)/g,"$1~$2").replace(/매일\s*/g,"").replace(/평일/g,"월~금").replace(/주말/g,"토·일").replace(/(\d)시/g,"$1:00");if(!h)return null;now=now||new Date();
  if(/늘 열려|24시간|상시 개방|늘 통행/.test(h))return true;
  const d=now.getDay(),M=now.getHours()*60+now.getMinutes();
  for(const m of h.matchAll(/([일월화수목금토][일월화수목금토·,\/~\s]*?)\s*(?:요일)?\s*(?:정기)?\s*휴무/g)){if(/째|매월|격주|공휴일/.test(h.slice(Math.max(0,m.index-6),m.index+1)))continue;if(dayset(m[1]).has(d))return false}
  let main=h.split(" · ")[0];const parens=[...main.matchAll(/[\(（]([^)）]*)[\)）]/g)].map(x=>x[1]);main=main.replace(/[\(（][^)）]*[\)）]/g,"");
  const segs=main.split(/\s*[,/]\s*(?=[일월화수목금토])/);const DP=/^\s*([일월화수목금토](?:\s*[~·,]\s*[일월화수목금토])*)/;
  if(segs.length>1&&segs.every(sg=>DP.test(sg))){const hit=segs.filter(sg=>dayset(sg.match(DP)[1]).has(d));if(!hit.length)return false;main=hit.join(" ")}
  const pre=main.match(/^\s*([일월화수목금토](?:\s*[~·,]\s*[일월화수목금토])*)\s+(?=\d)/);if(pre&&!dayset(pre[1]).has(d))return false;
  let R=[...main.matchAll(/(\d{1,2}):(\d\d)\s*~\s*(\d{1,2}):(\d\d)/g)].map(x=>[tm(x[1],x[2]),tm(x[3],x[4])]);
  if(!R.length)return null;const brk=[];
  parens.forEach(q=>{const b=q.match(/브레이크\s*(\d{1,2}):(\d\d)\s*~\s*(\d{1,2}):(\d\d)/);if(b){brk.push([tm(b[1],b[2]),tm(b[3],b[4])]);return}
    const ds=q.match(/^\s*([일월화수목금토](?:\s*[~·,]\s*[일월화수목금토])*)/);if(!ds||!dayset(ds[1]).has(d))return;
    const both=q.match(/(\d{1,2}):(\d\d)\s*~\s*(\d{1,2}):(\d\d)/),st=q.match(/(\d{1,2}):(\d\d)\s*~\s*$/),en=q.match(/(\d{1,2}):(\d\d)\s*까지/);
    if(both)R=[[tm(both[1],both[2]),tm(both[3],both[4])]];else if(st)R[0][0]=tm(st[1],st[2]);else if(en)R[R.length-1][1]=tm(en[1],en[2])});
  if(brk.some(([a,b])=>M>=a&&M<b))return false;
  return R.some(([a,b])=>{if(b<=a)b+=1440;return (M>=a&&M<b)||(M+1440>=a&&M+1440<b)})}
const hm=t=>{const [a,b]=String(t).split(":");return (+a)*60+(+(b||0))};
function openNow(p,now){if(p.closed)return false;now=now||new Date();
  if(p.oh&&typeof p.oh==="object"){const d=now.getDay(),M=now.getHours()*60+now.getMinutes();
    const today=p.oh[DK[d]],yday=p.oh[DK[(d+6)%7]];if(today===undefined&&yday===undefined)return openText(p,now);
    if((yday||[]).some(([a,b])=>hm(b)>1440&&M<hm(b)-1440))return true;
    if(today===undefined)return null;return today.some(([a,b])=>M>=hm(a)&&M<hm(b))}
  return p.h?openText(p,now):null}
function todayHours(p){if(!p.oh)return "";const t=p.oh[DK[new Date().getDay()]];if(t===undefined)return "";if(!t.length)return "오늘 휴무";
  const f=x=>{const v=hm(x);return v>=1440?String(Math.floor(v/60)-24).padStart(2,"0")+":"+String(v%60).padStart(2,"0")+"(다음날)":x};return "오늘 "+t.map(([a,b])=>f(a)+"~"+f(b)).join(", ")}
const fmM=m=>String(Math.floor(m/60)%24).padStart(2,"0")+":"+String(m%60).padStart(2,"0");
function nowInfo(p){const o=openNow(p);if(!p.oh||typeof p.oh!=="object"||o==null)return {o};const now=new Date(),M=now.getHours()*60+now.getMinutes();const T=p.oh[DK[now.getDay()]]||[];
  if(o===true){for(const [a,b] of T){const A=hm(a),B=hm(b);if(M>=A&&M<B&&B-M<=30)return {o,soon:fmM(B)}}return {o}}
  const nx=T.map(([a])=>hm(a)).filter(A=>A>M).sort((x,y)=>x-y)[0];if(nx==null)return {o};
  return T.some(([a,b])=>hm(b)<=M)?{o,brk:fmM(nx)}:{o,opens:fmM(nx)}}
const openTag=p=>{const n=nowInfo(p);return n.soon?`<span class="ot soon">곧 마감 ${n.soon}</span>`:n.o===true?'<span class="ot on">영업 중</span>':n.brk?`<span class="ot brk">브레이크 · ${n.brk} 재개</span>`:n.opens?`<span class="ot off">${n.opens} 오픈</span>`:n.o===false?'<span class="ot off">영업 종료</span>':""};
/* ===== 한눈에 소개 ===== */
const jong=w=>{const c=(w||"").trim().slice(-1).charCodeAt(0);return c>=0xAC00&&c<=0xD7A3?(c-0xAC00)%28!==0:/[0-9LMNRlmnr]$/.test(w||"")};
const ga=w=>w+(jong(w)?"이":"가"),wa=w=>w+(jong(w)?"과":"와"),ida=w=>w+(jong(w)?"이에요":"예요");
function menuNames(p){if(!p.m)return [];const out=[];String(p.m).split(/[,/]/).forEach(t=>{t=t.replace(/\(.*?\)|\[.*?\]/g,"").replace(/^[\d+\s]+/,"").replace(/\d[\d,.]*\s*(g|kg|ml|인분|원|개|pcs)?/gi,"").replace(/[▶@].*$/,"").replace(/[~!?.·:;-]+/g," ").replace(/\s+/g," ").trim().replace(/\s+(대|중|소|특|보통)$/,"").replace(/(코스)?\s*1?인당$/,"$1").trim();if(t.length>=2&&t.length<=14&&/[가-힣]/.test(t)&&!/[A-Za-z]{3}/.test(t)&&!/메뉴|인분|가격|포장/.test(t)&&!out.includes(t))out.push(t)});return out}
const KW=[["보쌈|족발","보쌈·족발"],["평양냉면|냉면|면옥","냉면"],["막국수","막국수"],["칼국수","칼국수"],["수제비","수제비"],["돼지국밥|순대국|국밥","국밥"],["해장국","해장국"],["곰탕|설렁탕","곰탕"],["감자탕|뼈해장|감자국","감자탕"],["추어","추어탕"],["부대찌개","부대찌개"],["찌개","찌개"],["삼계|백숙","백숙"],["닭한마리","닭한마리"],["닭갈비","닭갈비"],["곱창|막창|대창","곱창"],["갈비","갈비"],["삼겹|목살|목심|돼지","돼지고기"],["한우|소고기|등심|안창|살치|육사시미","소고기"],["육회","육회"],["양꼬치","양꼬치"],["양고기|양갈비|램","양고기"],["오리","오리"],["장어","장어"],["생선구이|고등어|갈치","생선구이"],["아귀","아귀찜"],["낙지","낙지"],["쭈꾸미|주꾸미","주꾸미"],["게장","게장"],["모둠회|활어|사시미|물회|방어|횟집","회"],["파전|빈대떡|녹두전|모둠전|전집","전"],["비빔밥","비빔밥"],["백반|정식|한정식|가정식","백반"],["떡볶이","떡볶이"],["김밥","김밥"],["만두","만두"],["짜장|짬뽕|탕수육","중국집"],["돈가스|돈까스|카츠","돈가스"],["초밥|스시","초밥"],["라멘","라멘"],["우동|소바","우동·소바"],["파스타","파스타"],["피자","피자"],["버거","버거"],["쌀국수","쌀국수"]];
function refineKind(p){const nc=(p.nc||"").replace(/,/g,"·");
  if(p.c==="bar"&&!nc)return {izakaya:"이자카야",wine:"와인바",beer:"맥주집",cocktail:"칵테일바",pocha:"포차"}[p.s];
  if(nc&&!/^(한식|음식점|기타|식당)$/.test(nc))return nc;
  if(p.c!=="food")return nc||subName(p.c,p.s);
  const t=p.n+" "+menuNames(p).join(" ");const hit=[];for(const [rx,l] of KW){if(new RegExp(rx).test(t)&&!hit.includes(l))hit.push(l);if(hit.length===2||hit[0]&&hit[0].includes("·"))break}
  return hit.length?hit.join("·"):(nc||(p.s==="korean"?"한식":subName(p.c,p.s)))}
function kindNoun(k){k={"중식":"중식당","양식":"양식당"}[k]||k;if(/(집|당|점|관|카페|바|펍|베이커리|이자카야|포차|주점|식당|레스토랑|뷔페|하우스|중국집)$/.test(k))return k;if(/요리$|음식$/.test(k))return k+" 전문점";if(/디저트|떡|빵|아이스크림|도넛/.test(k.split("·").pop()))return k+" 가게";if(/고기$/.test(k))return k.replace(/고기$/,"고깃집");return k+"집"}
function shortArea(a){if(!a)return "";a=a.replace(/^제주 제주$/,"제주");return a.split(" ").filter((w,i)=>!i||!/(로|길|번지|\d)$/.test(w)).map(w=>w.length>2?w.replace(/구$/,""):w).join(" ")}
function introParts(p){const S=[],x=p.x;
  const yr=p.yr&&String(p.yr).match(/\d{4}/);const ar=shortArea(p.a);
  if(p.ds)S.push(p.ds);else S.push(`${yr?yr[0]+"년에 문 연 ":""}${ar?ar+" ":""}${ida(kindNoun(kindLabel(p)))}.`);
  if(!p.ds&&p.bs&&p.d)S.push(p.d.trim());
  const M=p.ds?[]:menuNames(p).slice(0,2);if(M.length===2)S.push(`${wa(M[0])} ${ga(M[1])} 대표 메뉴예요.`);else if(M.length===1)S.push(`${ga(M[0])} 대표 메뉴예요.`);
  const H=[];const st=x.find(v=>/^star/.test(v));if(st)H.push(`미쉐린 ${st.slice(4)}스타`);else if(x.includes("bib"))H.push("미쉐린 빕구르망");else if(x.includes("selected"))H.push("미쉐린 가이드");
  if(x.some(v=>/^ribbon/.test(v)))H.push("블루리본");if(x.includes("century"))H.push("백년가게");if(x.includes("future"))H.push("서울미래유산");
  if(H.length)S.push(`${H.join(", ")}에 선정됐어요.`);
  if(p.kr)S.push(`카카오맵 평점 ${p.kr[0].toFixed(1)}점(리뷰 ${p.kr[1].toLocaleString()}개, 2026년 11월 기준)이에요.`);
  if(p.dcr)S.push(`다이닝코드 동네 순위 ${p.dcr}위권에 들어요.`);
  const SN=srcNames(p);if(SN.length)S.push(`${SN.map(n=>n==="노포 기사"?"노포 소개 기사":n==="잡지 추천"?"잡지 맛집 기사":n==="셰프 단골"?"셰프 단골집 기사":n==="식객 허영만"?"허영만 단골집 기사":n==="티맵 랭킹"?"티맵 맛집 랭킹":n).join(", ")}에 나왔어요.`);
  const T=tubers(p);const tv=x.includes("wed");
  if(tv&&T.length)S.push(`수요미식회에 나왔고, ${ga(T.join("·"))} 다녀갔어요.`);else if(tv)S.push("수요미식회에 나왔어요.");else if(T.length)S.push(`${ga(T.join("·"))} 다녀갔어요.`);
  return S}

/* ===== 데이터 ===== */
function km(a,b){const t=Math.PI/180,dl=(b.la-a.la)*t,dg=(b.lo-a.lo)*t;const h=Math.sin(dl/2)**2+Math.cos(a.la*t)*Math.cos(b.la*t)*Math.sin(dg/2)**2;return 12742*Math.asin(Math.sqrt(h))}
const fmtD=k=>k<1?Math.max(10,Math.round(k*100)*10)+"m":k<100?k.toFixed(1)+"km":Math.round(k)+"km";
const fmtKm=k=>k<1.5?"걸어서 "+Math.max(1,Math.round(k*1000/70))+"분":k<100?k.toFixed(1)+"km":Math.round(k)+"km";
let P=[],HIDE={},VIS={},ADDED=[];
function prep(p,i){p.i=i;p.x=p.x||[];if(!MAIN[p.c])p.c="food";if(!SUBS[p.c][p.s])p.s=Object.keys(SUBS[p.c])[0];p.v=p.x.includes("nlist")?1:0;p.k=refineKind(p);p._in=null;return p}
const introOf=p=>p._in||(p._in=introParts(p));
function rebuild(){P=[...DATA,...ADDED].filter(p=>!HIDE[p.id]).map((p,i)=>prep(p,i));if(sel!=null&&!P[sel])sel=null}

/* ===== 출처 ===== */
const isTube=p=>p.x.includes("tube");
const SRC_L=[["v","빅토리아노 맛집",p=>p.v===1],["multi","여러 곳 인정",p=>srcCount(p)>=2],["mich","미쉐린",p=>p.x.some(x=>/^star|^bib|^selected/.test(x))],["ribbon","블루리본",p=>p.x.some(x=>/^ribbon/.test(x))],["tube","유튜버 추천",isTube],["tv","TV 맛집",p=>p.x.includes("wed")||p.x.includes("tv")],["chef","셰프·식객 추천",p=>p.x.includes("chef")],["mag","잡지 추천",p=>p.x.includes("mag")||p.x.includes("rank")],["dcode","다이닝코드 상위",p=>p.x.includes("dcode")],["old","노포·백년가게",p=>p.x.includes("century")||p.x.includes("future")||p.x.includes("nopo")],["cheap","착한가격",p=>p.x.includes("cheap")],["mine","직접 가봄",p=>!!VIS[p.id]]];
const SRCF=Object.fromEntries(SRC_L.map(s=>[s[0],s[2]]));
const TUBERS=["정육왕","김사원세끼","비밀이야","먹을텐데","또간집","참피디","육식맨","빅페이스","윤호찌","잡식맨","취요남"];
const REG=[["서울 전체",[126.80,37.43,127.18,37.70]],["종로·중구",[126.955,37.553,127.02,37.59]],["마포·서대문",[126.88,37.535,126.97,37.60]],["용산·이태원",[126.955,37.515,127.01,37.555]],["성수·광진",[127.02,37.53,127.10,37.57]],["강남·서초",[126.98,37.47,127.07,37.535]],["송파·강동",[127.07,37.47,127.18,37.56]],["여의도·영등포",[126.88,37.495,126.95,37.54]],
  ["경기 남부",[126.95,37.2,127.2,37.45]],["경기 북부",[126.7,37.6,127.1,37.8]],["인천",[126.55,37.35,126.8,37.6]],["춘천",[127.66,37.83,127.79,37.92]],["강릉·속초",[128.5,37.7,128.95,38.25]],["대전",[127.3,36.25,127.5,36.45]],["전주",[127.05,35.78,127.18,35.87]],["대구",[128.5,35.8,128.7,35.93]],["경주",[129.15,35.78,129.28,35.88]],["부산",[128.95,35.05,129.22,35.25]],["광주",[126.8,35.1,126.97,35.22]],["여수",[127.6,34.7,127.8,34.8]],["제주",[126.15,33.2,126.95,33.57]],["전국",[125.6,33.1,129.6,38.6]]];

/* ===== 상태 ===== */
let OPEN=false;
let CATS=new Set(LS.get("bm3-cats",[]).filter(k=>MAIN[k])),SRC=new Set(LS.get("bm3-src",[]).filter(k=>SRCF[k]&&k!=="mine")),SUBSEL=LS.get("bm3-sub",{}),TUBE="",query="",sort="near",COURSEMODE=false,sel=null,me=null,limit=40,VIEW="list",COURSE=LS.get("bm-course",{});
function save(){LS.set("bm3-cats",[...CATS]);LS.set("bm3-src",[...SRC]);LS.set("bm3-sub",SUBSEL)}
function qOK(p){if(!query)return true;const s=[p.n,p.a,p.addr,p.m,p.d,p.fd,p.nc,p.by,p.vid,MAIN[p.c],subName(p.c,p.s),p.v?"빅토리아노":"",VIS[p.id]&&VIS[p.id].note].join(" ").toLowerCase();return query.toLowerCase().split(/\s+/).every(t=>s.includes(t))}
function baseOK(p){if(SRC.size&&![...SRC].some(f=>SRCF[f](p)))return false;if(TUBE&&!(p.by||"").includes(TUBE))return false;return qOK(p)}
function catOK(p){if(CATS.size&&!CATS.has(p.c))return false;const ss=SUBSEL[p.c];if(ss&&ss!=="all"&&p.s!==ss)return false;return true}
const match=p=>COURSEMODE?!!COURSE[p.id]:catOK(p)&&baseOK(p)&&(!OPEN||openNow(p)===true);
const nActive=()=>(OPEN?1:0)+CATS.size+SRC.size+Object.values(SUBSEL).filter(v=>v&&v!=="all").length+(TUBE?1:0);

/* ===== 위쪽 칩 ===== */
function setHTML(el,h){if(el.__h===h)return;el.innerHTML=h;el.__h=h}
const chip=(attr,on,label,cls)=>`<button type="button" class="chip${cls?" "+cls:""}" ${attr} aria-pressed="${on}">${label}</button>`;
function chips(){
  const nSrc=[...SRC].filter(k=>k!=="v"&&k!=="multi").length+(TUBE?1:0);
  const h=[chip('data-open="1"',OPEN,'<span class="dot"></span>지금 영업 중'),chip('data-src="multi"',SRC.has("multi"),'✔ 믿을 만한 곳만'),chip('data-src="v"',SRC.has("v"),'<span class="st">★</span>내 맛집',"v"),
    ...["food","cafe"].map(k=>chip(`data-cat="${k}"`,CATS.has(k),`${EMO[Object.keys(SUBS[k])[0]]} ${MAIN[k]}`)),
    chip('data-srcmenu="1"',nSrc>0,`출처${nSrc?" "+nSrc:""} ▾`)];
  setHTML($("#chips"),h.join(""));
  const sc=COURSEMODE?[]:[...CATS];const sb=$("#subchips");const old=sb.hidden;sb.hidden=!sc.length;
  setHTML(sb,sc.map(c=>{const cur=SUBSEL[c]||"all";const it=Object.keys(SUBS[c]).map(k=>[k,P.filter(p=>p.c===c&&p.s===k&&baseOK(p)).length]).filter(([,n])=>n);
    return (sc.length>1?`<span class="lab">${MAIN[c]}</span>`:"")+chip(`data-sub="${c}:all"`,cur==="all",`${MAIN[c]} 전체`)+it.map(([k,n])=>chip(`data-sub="${c}:${k}"`,cur===k,`${EMO[k]} ${SUBS[c][k]} <small>${n}</small>`)).join("")}).join(""));
  if(old!==sb.hidden&&typeof layout==="function")requestAnimationFrame(layout);
  const on=sb.querySelector('.chip[aria-pressed="true"]:not([data-sub$=":all"])');if(on&&(on.offsetLeft+on.offsetWidth>sb.scrollLeft+sb.clientWidth||on.offsetLeft<sb.scrollLeft))sb.scrollLeft=on.offsetLeft-12;
  const n=nActive();const fN=$("#fN");fN.hidden=!n;fN.textContent=n;$("#filterBtn").classList.toggle("on",!!n)}
document.addEventListener("click",e=>{const b=e.target.closest("button");if(!b||!b.closest("#chips,#subchips,#fbody,#shrow"))return;
  const d=b.dataset;
  if(d.open){OPEN=!OPEN;exitCourse();if(OPEN)toast("영업시간을 확인한 곳 중에서 지금 여는 곳만 보여드려요.",3200)}
  else if(d.cat){if(d.cat==="all")CATS.clear();else CATS.has(d.cat)?CATS.delete(d.cat):CATS.add(d.cat);Object.keys(SUBSEL).forEach(c=>{if(!CATS.has(c))delete SUBSEL[c]});exitCourse()}
  else if(d.sub){const [c,k]=d.sub.split(":");SUBSEL[c]=k;exitCourse()}
  else if(d.src){if(d.src==="all")SRC.clear();else SRC.has(d.src)?SRC.delete(d.src):SRC.add(d.src);if(d.src==="tube"&&!SRC.has("tube"))TUBE="";exitCourse()}
  else if(d.tb!=null){TUBE=TUBE===d.tb?"":d.tb;exitCourse()}
  else if(d.course){COURSEMODE=!COURSEMODE;if(COURSEMODE){backToList(true);fitCourse();if(ST===0)setST(1)}}
  else if(d.reg!=null){closeFilters();goRegion(+d.reg);return}
  else if(d.srcmenu){openFilters();return}
  else return;
  afterFilter()});
function exitCourse(){COURSEMODE=false}
function afterFilter(){save();limit=40;if(sel!=null&&(!P[sel]||!match(P[sel])))backToList(true);render();if(!$("#fpanel").hidden)renderFilters()}

/* ===== 필터 창 ===== */
function renderFilters(){const cnt=fn=>P.filter(p=>!COURSEMODE&&fn(p)).length;
  let h=`<h3>종류</h3><div class="wr">${chip('data-cat="all"',!CATS.size,"전체")}${Object.keys(MAIN).map(k=>chip(`data-cat="${k}"`,CATS.has(k),`${MAIN[k]} <small>${cnt(p=>p.c===k&&baseOK(p))}</small>`)).join("")}`;
  [...CATS].forEach(c=>{const cur=SUBSEL[c]||"all";h+=`<span class="lab">${MAIN[c]} 안에서</span>`+chip(`data-sub="${c}:all"`,cur==="all","전체")+Object.keys(SUBS[c]).map(k=>[k,cnt(p=>p.c===c&&p.s===k&&baseOK(p))]).filter(([,n])=>n).map(([k,n])=>chip(`data-sub="${c}:${k}"`,cur===k,`${EMO[k]} ${SUBS[c][k]} <small>${n}</small>`)).join("")});
  h+=`</div><h3>어디서 모은 곳 <span style="font-weight:400">· 하나라도 해당하면 보여요</span></h3><div class="wr">${chip('data-src="all"',!SRC.size,"전체")}${SRC_L.filter(([k])=>k!=="mine"||Object.keys(VIS).length).map(([k,n,f])=>chip(`data-src="${k}"`,SRC.has(k),`${k==="v"?'<span class="st">★</span>':""}${n} <small>${cnt(p=>f(p)&&catOK(p))}</small>`)).join("")}</div>`;
  const tb=TUBERS.map(t=>[t,P.filter(p=>(p.by||"").includes(t)).length]).filter(([,n])=>n);
  h+=`<h3>유튜버</h3><div class="wr">${tb.map(([t,n])=>chip(`data-tb="${t}"`,TUBE===t,`${t} <small>${n}</small>`)).join("")}</div>`;
  h+=`<h3>지역으로 바로 가기</h3><div class="wr">${REG.map(([n],i)=>chip(`data-reg="${i}"`,false,n)).join("")}</div>`;
  setHTML($("#fbody"),h);
  const n=P.filter(match).length;$("#fApply").textContent=`${n.toLocaleString()}곳 보기`}
function openFilters(){blurQ();renderFilters();$("#fpanel").hidden=false}
function closeFilters(){$("#fpanel").hidden=true}
$("#filterBtn").onclick=openFilters;$("#fClose").onclick=closeFilters;$("#fApply").onclick=closeFilters;
$("#fpanel").addEventListener("click",e=>{if(e.target.id==="fpanel")closeFilters()});
$("#resetAll").onclick=()=>{OPEN=false;CATS.clear();SRC.clear();SUBSEL={};TUBE="";COURSEMODE=false;afterFilter()};

/* ===== 검색 ===== */
const blurQ=()=>{if(document.activeElement===$("#q"))$("#q").blur()};
$("#q").addEventListener("keydown",e=>{if(e.key==="Enter"){e.preventDefault();e.target.blur()}});
let qT;$("#q").addEventListener("input",e=>{clearTimeout(qT);qT=setTimeout(()=>{query=e.target.value.trim();$("#qClear").hidden=!query;if(query){COURSEMODE=false;backToList(true);if(ST===0)setST(1)}afterFilter();$("#shb").scrollTop=0},180)});
$("#q").addEventListener("focus",()=>{if(VIEW==="detail")backToList()});
$("#qClear").onclick=()=>{$("#q").value="";query="";$("#qClear").hidden=true;afterFilter()};

/* ===== 지도 타일 ===== */
const BASE=document.baseURI.replace(/[^/]*$/,"");
const PACKS=new Map();
function packName(z,x,y){if(z<=6)return "base";if(z<=8){const s=z-6;return `b78_${x>>s}_${y>>s}`}if(z===9)return `b9_${x>>2}_${y>>2}`;if(z===10)return `b10_${x>>2}_${y>>2}`;if(z===11)return `c11_${x>>2}_${y>>2}`;const s=z-12;return `d12_${x>>s}_${y>>s}`}
function b64(t){const s=atob(t.trim());const u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return u.buffer}
function getPack(n){if(!PACKS.has(n))PACKS.set(n,fetch(BASE+"tiles/"+n+".txt").then(r=>r.ok?r.text():null).then(t=>{if(!t)return null;const b=b64(t);const v=new DataView(b);const L=v.getUint32(0,true);return {idx:JSON.parse(new TextDecoder().decode(new Uint8Array(b,4,L))),b,o:4+L}}).catch(()=>{PACKS.delete(n);return null}));return PACKS.get(n)}
async function gunzip(u8){if(u8[0]!==0x1f||u8[1]!==0x8b)return u8.slice();const s=new Blob([u8]).stream().pipeThrough(new DecompressionStream("gzip"));return new Uint8Array(await new Response(s).arrayBuffer())}
/* 자세한 타일이 없는 곳은 윗단계 타일을 잘라 확대해서 씀 */
const MVT=(()=>{
  function rv(u,p){let r=0,m=1,b;do{b=u[p++];r+=(b&127)*m;m*=128}while(b&128);return [r,p]}
  function skip(u,p,w){if(w===0){while(u[p++]&128);return p}if(w===1)return p+8;if(w===2){const [l,q]=rv(u,p);return q+l}if(w===5)return p+4;throw new Error("pbf")}
  class W{constructor(n){this.b=new Uint8Array(n||256);this.n=0}need(k){if(this.n+k>this.b.length){let L=this.b.length*2;while(L<this.n+k)L*=2;const nb=new Uint8Array(L);nb.set(this.b.subarray(0,this.n));this.b=nb}}
    v(x){this.need(10);while(x>127){this.b[this.n++]=(x%128)|128;x=Math.floor(x/128)}this.b[this.n++]=x}raw(u){this.need(u.length);this.b.set(u,this.n);this.n+=u.length}msg(f,u){this.v(f*8+2);this.v(u.length);this.raw(u)}out(){return this.b.subarray(0,this.n)}}
  const zd=n=>n%2?-(n+1)/2:n/2,ze=v=>v>=0?2*v:-2*v-1;
  function clipRing(r,a,b){const edges=[[0,a,1],[0,b,-1],[1,a,1],[1,b,-1]];let out=r;
    for(const [ax,lim,dir] of edges){if(!out.length)break;const inp=out;out=[];const ins=q=>dir>0?q[ax]>=lim:q[ax]<=lim;
      for(let i=0;i<inp.length;i++){const c=inp[i],pv=inp[(i+inp.length-1)%inp.length],ci=ins(c),pi=ins(pv);
        if(ci){if(!pi)out.push(cut(pv,c,ax,lim));out.push(c)}else if(pi)out.push(cut(pv,c,ax,lim))}}return out}
  function cut(p,q,ax,lim){const t=(lim-p[ax])/(q[ax]-p[ax]);const r=[0,0];r[ax]=lim;r[1-ax]=Math.round(p[1-ax]+t*(q[1-ax]-p[1-ax]));return r}
  function clipLine(L,a,b){const parts=[];let cur=null;
    for(let i=1;i<L.length;i++){let [x0,y0]=L[i-1],[x1,y1]=L[i];let t0=0,t1=1;const dx=x1-x0,dy=y1-y0;let ok=true;
      for(const [p,q] of [[-dx,x0-a],[dx,b-x0],[-dy,y0-a],[dy,b-y0]]){if(p===0){if(q<0){ok=false;break}}else{const t=q/p;if(p<0){if(t>t1){ok=false;break}if(t>t0)t0=t}else{if(t<t0){ok=false;break}if(t<t1)t1=t}}}
      if(!ok){cur=null;continue}
      const s=[Math.round(x0+t0*dx),Math.round(y0+t0*dy)],e=[Math.round(x0+t1*dx),Math.round(y0+t1*dy)];
      if(cur&&t0===0)cur.push(e);else{cur=[s,e];parts.push(cur)}if(t1<1)cur=null}
    return parts.filter(p=>p.length>1)}
  function geom(u,s,ox,oy,E,type){const g=[];let q=0;while(q<u.length){const [v,nq]=rv(u,q);q=nq;g.push(v)}
    const parts=[];let cur=null,X=0,Y=0,i=0;
    while(i<g.length){const c=g[i++],id=c&7,cnt=c>>>3;
      if(id===1||id===2){for(let k=0;k<cnt;k++){X+=zd(g[i++]);Y+=zd(g[i++]);const pt=[X*s-ox,Y*s-oy];if(id===1||!cur){cur=[];parts.push(cur)}cur.push(pt)}}
      else if(id===7){cur=null}}
    const B=E/8,a=-B,b=E+B;let res;
    if(type===1)res=parts.flat().filter(p=>p[0]>=0&&p[0]<E&&p[1]>=0&&p[1]<E).map(p=>[p]);
    else if(type===2)res=parts.flatMap(L=>clipLine(L,a,b));
    else res=parts.map(r=>clipRing(r,a,b)).filter(r=>r.length>=3);
    if(!res.length)return null;
    const w=new W(64);let cx=0,cy=0;
    if(type===1){w.v(1|(res.length<<3));for(const [p] of res){w.v(ze(p[0]-cx));w.v(ze(p[1]-cy));cx=p[0];cy=p[1]}}
    else for(const L of res){w.v(1|(1<<3));w.v(ze(L[0][0]-cx));w.v(ze(L[0][1]-cy));cx=L[0][0];cy=L[0][1];
      w.v(2|((L.length-1)<<3));for(let k=1;k<L.length;k++){w.v(ze(L[k][0]-cx));w.v(ze(L[k][1]-cy));cx=L[k][0];cy=L[k][1]}if(type===3)w.v(7|(1<<3))}
    return w.out()}
  function feature(u,s,ox,oy,E){let p=0,type=0,gs=-1,ge=-1;const keep=[];
    while(p<u.length){const st=p;const [tag,q]=rv(u,p);const f=Math.floor(tag/8),wt=tag&7;
      if(f===4&&wt===2){const [l,q2]=rv(u,q);gs=q2;ge=q2+l;p=ge}else{if(f===3&&wt===0)type=rv(u,q)[0];p=skip(u,q,wt);keep.push(u.subarray(st,p))}}
    if(gs<0)return null;const g=geom(u.subarray(gs,ge),s,ox,oy,E,type);if(!g)return null;
    const w=new W(u.length+16);keep.forEach(k=>w.raw(k));w.msg(4,g);return w.out()}
  function layer(u,s,cx,cy){let p=0,E=4096;while(p<u.length){const [tag,q]=rv(u,p);if(tag===5*8)E=rv(u,q)[0];p=skip(u,q,tag&7)}
    const w=new W(u.length);p=0;
    while(p<u.length){const st=p;const [tag,q]=rv(u,p);const wt=tag&7;
      if(tag===2*8+2){const [l,q2]=rv(u,q);const F=feature(u.subarray(q2,q2+l),s,cx*E,cy*E,E);p=q2+l;if(F)w.msg(2,F)}else{p=skip(u,q,wt);w.raw(u.subarray(st,p))}}
    return w.out()}
  return function rescale(u,dz,cx,cy){const s=2**dz;const w=new W(u.length);let p=0;
    while(p<u.length){const st=p;const [tag,q]=rv(u,p);if(tag===3*8+2){const [l,q2]=rv(u,q);w.msg(3,layer(u.subarray(q2,q2+l),s,cx,cy));p=q2+l}else{p=skip(u,q,tag&7);w.raw(u.subarray(st,p))}}
    return w.out().slice().buffer}})();
const GLY=new Map();
function addTileProtocol(){maplibregl.addProtocol("gl",async(params)=>{const r=(params.url.match(/(\d+-\d+)$/)||[])[1];if(!GLY.has(r))GLY.set(r,fetch(BASE+"fonts/"+r+".txt").then(x=>x.ok?x.text():null).then(t=>t?b64(t):new ArrayBuffer(0)).catch(()=>new ArrayBuffer(0)));return {data:await GLY.get(r)}});
  maplibregl.addProtocol("pk",async(params)=>{const m=params.url.match(/(\d+)\/(\d+)\/(\d+)/);const z=+m[1],x=+m[2],y=+m[3];
    for(let dz=0;dz<=Math.min(z,8);dz++){const az=z-dz,ax=x>>dz,ay=y>>dz;const pk=await getPack(packName(az,ax,ay));const e=pk&&pk.idx[`${az}/${ax}/${ay}`];if(!e)continue;
      const raw=await gunzip(new Uint8Array(pk.b,pk.o+e[0],e[1]));
      if(!dz)return {data:raw.buffer.slice(raw.byteOffset,raw.byteOffset+raw.byteLength)};
      try{return {data:MVT(raw,dz,x-(ax<<dz),y-(ay<<dz))}}catch(_){return {data:new ArrayBuffer(0)}}}
    return {data:new ArrayBuffer(0)}})}
//@@STYLE@@

/* ===== 지도 ===== */
let map,mapReady=false,meMk=null,numMks=[];
function topH(){return Math.round($("#top").getBoundingClientRect().bottom)}
function visRect(st){const W=innerWidth,H=innerHeight;if(WIDE())return {l:400,r:W,t:topH(),b:H};const s=st==null?Math.min(ST,1):st;return {l:0,r:W,t:topH(),b:H-snaps()[s]}}
function vcenter(){if(!mapReady)return {la:37.56,lo:126.98};const R=visRect();const c=map.unproject([(R.l+R.r)/2,(R.t+R.b)/2]);return {la:c.lat,lo:c.lng}}
const origin=()=>sort==="me"&&me?me:vcenter();
function padFor(R,extra){const e=extra||24;return {top:R.t+e,bottom:innerHeight-R.b+e,left:R.l+e,right:innerWidth-R.r+e+40}}
function fitBox(b,st){const R=visRect(st);map.fitBounds([[b[0],b[1]],[b[2],b[3]]],{padding:padFor(R,10),bearing:HEAD?map.getBearing():0,duration:600})}
function starImg(){const s=2,W=24*s,c=document.createElement("canvas");c.width=c.height=W;const g=c.getContext("2d");const cx=W/2,cy=W/2+s*.6,R=W*.40,r=R*.48;
  g.beginPath();for(let k=0;k<10;k++){const a=-Math.PI/2+k*Math.PI/5,rr=k%2?r:R;g.lineTo(cx+rr*Math.cos(a),cy+rr*Math.sin(a))}g.closePath();g.lineJoin="round";
  g.lineWidth=3.4*s;g.strokeStyle=DARK?"#1d1d1c":"#ffffff";g.stroke();g.fillStyle=GOLD;g.fill();g.lineWidth=.9*s;g.strokeStyle=DARK?"#8a6200":"#b07400";g.stroke();return g.getImageData(0,0,W,W)}
function initMap(){
  if(!window.maplibregl){$("#map").innerHTML='<p class="empty">지도를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침해 주세요.</p>';return}
  addTileProtocol();
  const R=visRect(),b=REG[0][1],LV=LS.get("bm3-view",null);
  const start=LV&&isFinite(LV.lo)&&isFinite(LV.la)&&isFinite(LV.z)?{center:[LV.lo,LV.la],zoom:LV.z}:{bounds:[[b[0],b[1]],[b[2],b[3]]],fitBoundsOptions:{padding:padFor(R,6)}};
  map=new maplibregl.Map({container:"map",style:mapStyle(),...start,
    maxBounds:[[122.5,31.8],[133.5,39.6]],minZoom:5.5,maxZoom:19,doubleClickZoom:false,dragRotate:true,pitchWithRotate:false,touchPitch:false,attributionControl:false,
    localIdeographFontFamily:"'Apple SD Gothic Neo','Pretendard Variable','Noto Sans KR','Malgun Gothic',sans-serif"});
  map.touchZoomRotate.enableRotation();map.addControl(new maplibregl.AttributionControl({compact:true}),"bottom-left");
  map.on("load",()=>{
    map.addImage("star",starImg(),{pixelRatio:2});
    map.addSource("route",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
    map.addLayer({id:"route",type:"line",source:"route",paint:{"line-color":["get","col"],"line-width":3,"line-opacity":.85,"line-dasharray":[2,1.4]},layout:{"line-cap":"round","line-join":"round"}});
    map.addSource("pts",{type:"geojson",data:fc(),cluster:true,clusterMaxZoom:10,clusterRadius:38,clusterProperties:{v:["+",["get","v"]]}});
    const ink=DARK?"#eceae6":"#2a2825",inv=DARK?"#1d1d1c":"#ffffff";
    map.addLayer({id:"clu",type:"circle",source:"pts",filter:["has","point_count"],paint:{"circle-color":ink,"circle-opacity":.88,
      "circle-radius":["step",["get","point_count"],13,10,16,50,20,200,25],"circle-stroke-width":2,"circle-stroke-color":inv}});
    map.addLayer({id:"clu-n",type:"symbol",source:"pts",filter:["has","point_count"],layout:{"text-field":["get","point_count_abbreviated"],"text-font":["Open Sans Semibold"],"text-size":12,"text-allow-overlap":true},paint:{"text-color":inv}});
    map.addLayer({id:"pts",type:"circle",source:"pts",filter:["all",["!",["has","point_count"]],["==",["get","v"],0]],paint:{
      "circle-radius":["interpolate",["linear"],["zoom"],8,["+",2.2,["*",0.5,["get","w"]]],11,["+",3,["*",0.7,["get","w"]]],14,["+",4.4,["*",1.1,["get","w"]]],17,["+",6,["*",1.4,["get","w"]]]],"circle-color":["get","col"],"circle-opacity":.92,
      "circle-stroke-color":inv,"circle-stroke-width":["interpolate",["linear"],["zoom"],8,.8,14,1.6]}});
    map.addLayer({id:"stars",type:"symbol",source:"pts",filter:["all",["!",["has","point_count"]],["==",["get","v"],1]],layout:{"icon-image":"star","icon-size":["interpolate",["linear"],["zoom"],8,.6,12,.8,15,1,17,1.15],"icon-allow-overlap":true,"icon-ignore-placement":true}});
    const LBLP={"text-color":DARK?"#eceae6":"#1d1c1a","text-halo-color":DARK?"rgba(29,29,28,.92)":"rgba(255,255,255,.95)","text-halo-width":1.6};
    map.addLayer({id:"lbl-v",type:"symbol",source:"pts",minzoom:12,filter:["all",["!",["has","point_count"]],["==",["get","v"],1]],layout:{"text-field":["get","n"],"text-font":["Open Sans Semibold"],"text-size":12.5,"text-anchor":"left","text-offset":[0.85,0],"text-optional":true,"text-max-width":9},paint:LBLP});
    map.addLayer({id:"lbl",type:"symbol",source:"pts",minzoom:13.4,filter:["!",["has","point_count"]],layout:{"text-field":["get","n"],"text-font":["Open Sans Semibold"],"text-size":["case",["==",["get","v"],1],12.5,11.5],"text-anchor":"left","text-offset":[0.85,0],"text-optional":true,"text-max-width":9,"symbol-sort-key":["-",1,["get","v"]]},
      paint:{"text-color":DARK?"#eceae6":"#1d1c1a","text-halo-color":DARK?"rgba(29,29,28,.92)":"rgba(255,255,255,.95)","text-halo-width":1.6}});
    map.addSource("sel",{type:"geojson",data:{type:"FeatureCollection",features:[]}});
    map.addLayer({id:"sel-ring",type:"circle",source:"sel",paint:{"circle-radius":15,"circle-color":DARK?"rgba(255,122,77,.22)":"rgba(240,90,40,.18)","circle-stroke-color":DARK?"#ff7a4d":"#f05a28","circle-stroke-width":2.5}});
    map.addLayer({id:"sel-lbl",type:"symbol",source:"sel",layout:{"text-field":["get","n"],"text-font":["Open Sans Semibold"],"text-size":13.5,"text-anchor":"top","text-offset":[0,1.5],"text-allow-overlap":true,"text-max-width":10},paint:{"text-color":DARK?"#ffffff":"#1d1c1a","text-halo-color":DARK?"rgba(29,29,28,.95)":"rgba(255,255,255,.98)","text-halo-width":2}});
    mapReady=true;drawPts();drawSel();drawRoutes();renderView();
  });
  map.on("moveend",()=>{if(VIEW==="list"&&!query&&!COURSEMODE)renderListSoon();updCross();const c=map.getCenter();LS.set("bm3-view",{lo:+c.lng.toFixed(5),la:+c.lat.toFixed(5),z:+map.getZoom().toFixed(2)})});
  let lastTap=null;
  map.on("click",e=>{const now=Date.now();if(lastTap&&now-lastTap.t<350&&Math.hypot(e.point.x-lastTap.x,e.point.y-lastTap.y)<40){lastTap=null;map.easeTo({zoom:Math.min(map.getZoom()+1.4,19),around:e.lngLat,duration:300});return}
    lastTap={t:now,x:e.point.x,y:e.point.y};const pad=12;const f=map.queryRenderedFeatures([[e.point.x-pad,e.point.y-pad],[e.point.x+pad,e.point.y+pad]],{layers:["clu","stars","pts"]});
    if(f.length){let best=f[0],bd=1e9;f.forEach(x=>{const pt=map.project(x.geometry.coordinates);const d=Math.hypot(pt.x-e.point.x,pt.y-e.point.y)-(x.layer.id==="stars"?4:0);if(d<bd){bd=d;best=x}});
      if(best.layer.id==="clu"){lastTap=null;Promise.resolve(map.getSource("pts").getClusterLeaves(best.properties.cluster_id,1000,0)).then(L=>{const b=new maplibregl.LngLatBounds();L.forEach(f=>b.extend(f.geometry.coordinates));map.fitBounds(b,{padding:padFor(visRect(),40),maxZoom:16,duration:500})}).catch(()=>{});return}
      openDetail(P[best.properties.i],map.getZoom()<13);return}
    if(VIEW==="detail")backToList()});
  ["pts","stars","clu"].forEach(l=>{map.on("mouseenter",l,()=>map.getCanvas().style.cursor="pointer");map.on("mouseleave",l,()=>map.getCanvas().style.cursor="")});
  map.on("dragstart",()=>{blurQ();if(FOLLOW){FOLLOW=false;updMe()}});
  map.on("rotate",()=>{$("#north").hidden=Math.abs(map.getBearing())<0.5&&!HEAD;const i=$("#north .nd");if(i)i.style.transform=`rotate(${-map.getBearing()}deg)`});
  map.on("rotatestart",e=>{if(e.originalEvent&&HEAD)stopHeading()});
}
let rlT;function renderListSoon(){clearTimeout(rlT);rlT=setTimeout(()=>{limit=40;renderList()},120)}
function fc(){return{type:"FeatureCollection",features:P.filter(match).map(p=>({type:"Feature",geometry:{type:"Point",coordinates:[p.lo,p.la]},properties:{i:p.i,v:p.v,n:p.n.replace(/ \(.*\)/,""),col:colOf(p),w:Math.min(3,srcCount(p))}}))}}
function drawPts(){if(mapReady)map.getSource("pts").setData(fc())}
function drawSel(){if(!mapReady)return;const p=sel!=null?P[sel]:null;const si=p?p.i:-1;map.setFilter("lbl",["all",["!",["has","point_count"]],["==",["get","v"],0],["!=",["get","i"],si]]);map.setFilter("lbl-v",["all",["!",["has","point_count"]],["==",["get","v"],1],["!=",["get","i"],si]]);map.getSource("sel").setData({type:"FeatureCollection",features:p?[{type:"Feature",geometry:{type:"Point",coordinates:[p.lo,p.la]},properties:{n:p.n.replace(/ \(.*\)/,"")}}]:[]})}
function flyTo(p,z,st){if(!map)return;const R=visRect(st),W=innerWidth,H=innerHeight;map.easeTo({center:[p.lo,p.la],zoom:z==null?Math.max(map.getZoom(),15.5):z,offset:[(R.l+R.r)/2-W/2,(R.t+R.b)/2-H/2],duration:550})}
function fitTo(ps,maxZ){if(!map||!ps.length)return;if(ps.length===1){flyTo(ps[0],Math.max(map.getZoom(),maxZ||15));return}
  const b=new maplibregl.LngLatBounds();ps.forEach(p=>b.extend([p.lo,p.la]));map.fitBounds(b,{padding:padFor(visRect(1),30),maxZoom:maxZ||15,duration:550})}
function goRegion(i){if(!map)return;stopFollow();backToList(true);if(ST===2)setST(0);fitBox(REG[i][1])}
$("#zin").onclick=()=>map&&map.zoomIn();$("#zout").onclick=()=>map&&map.zoomOut();
$("#north").onclick=()=>{stopHeading();map&&map.easeTo({bearing:0,duration:400})};

/* ===== 아래 시트 ===== */
const sheet=$("#sheet"),shb=$("#shb");let ST=0;
function snaps(){const h=sheet.offsetHeight||innerHeight*.8;return [Math.min(162,h),Math.round(Math.min(h,innerHeight*.5)),h]}
function setVis(v){document.documentElement.style.setProperty("--vis",Math.round(v)+"px")}
function setST(s){ST=s;setVis(snaps()[s]);$("#ctrl").classList.toggle("off",s===2&&!WIDE())}
let drag=null;
function dStart(y){if(WIDE())return false;const v=snaps()[ST];drag={y0:y,v0:v,v,ly:y,lt:performance.now(),vel:0};sheet.classList.add("drag");return true}
function dMove(y){if(!drag)return;const s=snaps();let v=drag.v0+(drag.y0-y);if(v<s[0])v=s[0]-(s[0]-v)*.3;v=Math.min(s[2],v);drag.v=v;const t=performance.now();drag.vel=.7*drag.vel+.3*((drag.ly-y)/Math.max(1,t-drag.lt));drag.ly=y;drag.lt=t;setVis(v)}
function dEnd(){if(!drag)return;sheet.classList.remove("drag");const s=snaps(),v=drag.v,vel=drag.vel;drag=null;let st=0,bd=1e9;s.forEach((x,i)=>{if(Math.abs(x-v)<bd){bd=Math.abs(x-v);st=i}});
  if(vel>.4){st=s.findIndex(x=>x>v+8);if(st<0)st=2}else if(vel<-.4){st=0;for(let i=2;i>=0;i--)if(s[i]<v-8){st=i;break}}
  const prev=ST;setST(st);if(prev===2&&st<2&&VIEW==="list")renderListSoon()}
(function(){const hd=$("#shd");let pid=null,y0=0,moved=false;
  hd.addEventListener("pointerdown",e=>{if(e.target.closest("button,select,a")||WIDE())return;pid=e.pointerId;y0=e.clientY;moved=false;try{hd.setPointerCapture(pid)}catch(_){}});
  hd.addEventListener("pointermove",e=>{if(e.pointerId!==pid)return;if(!moved&&Math.abs(e.clientY-y0)>5){moved=true;dStart(y0)}if(moved)dMove(e.clientY)});
  const up=e=>{if(e.pointerId!==pid)return;pid=null;if(moved)dEnd();else setST(ST<2?ST+1:0)};
  hd.addEventListener("pointerup",up);hd.addEventListener("pointercancel",up);
  let ct=null;
  shb.addEventListener("touchstart",e=>{if(WIDE()||e.touches.length!==1){ct=null;return}ct={y:e.touches[0].clientY,x:e.touches[0].clientX,mode:null}},{passive:true});
  shb.addEventListener("touchmove",e=>{if(!ct)return;const y=e.touches[0].clientY,dy=y-ct.y,dx=e.touches[0].clientX-ct.x;
    if(ct.mode==null){if(Math.abs(dy)<6&&Math.abs(dx)<6)return;if(Math.abs(dx)>Math.abs(dy)){ct.mode="x";return}ct.mode=(ST<2&&dy<0)||(shb.scrollTop<=0&&dy>0)?"sheet":"scroll";if(ct.mode==="sheet")dStart(ct.y)}
    if(ct.mode==="sheet"){e.preventDefault();dMove(y)}},{passive:false});
  const tend=()=>{if(ct&&ct.mode==="sheet")dEnd();ct=null};shb.addEventListener("touchend",tend);shb.addEventListener("touchcancel",tend)})();

/* ===== 아이콘 ===== */
const sv=d=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;
const ICO={pin:sv('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),nav:sv('<path d="m3 11 18-8-8 18-2-8z"/>'),share:sv('<path d="M12 3v12M7 8l5-5 5 5"/><path d="M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/>'),cam:sv('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
  me:sv('<path d="M12 2v3M12 19v3M2 12h3M19 12h3"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2" fill="currentColor"/>'),head:sv('<path d="M12 2 19 21 12 17 5 21z" fill="currentColor"/>'),check:sv('<path d="m5 12 5 5 9-10"/>'),
  phone:sv('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),heart:sv('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>'),heartF:'<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  menu:sv('<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 1-3 3-3 6v4h3v8"/>'),clock:sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),won:sv('<path d="M4 6l3 12 5-12 5 12 3-12M3 11h18M3 14h18"/>'),cal:sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  play:sv('<rect x="2" y="5" width="20" height="14" rx="4"/><path d="m10 9 5 3-5 3z" fill="currentColor"/>'),quote:sv('<path d="M7 7h4v4c0 3-2 5-4 6M15 7h4v4c0 3-2 5-4 6"/>'),info:sv('<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>'),tag:sv('<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="8.5" r="1.5"/>'),link:sv('<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>'),
  back:sv('<path d="m15 5-7 7 7 7"/>'),x:sv('<path d="M6 6l12 12M18 6 6 18"/>'),plus:sv('<path d="M12 5v14M5 12h14"/>')};

/* ===== 배지 ===== */
function srcNames(p){const o=[];for(const b of (p.bs||"").split(" · ")){const n=/백반기행/.test(b)?"백반기행":/생활의 ?달인/.test(b)?"생활의 달인":/흑백요리사/.test(b)?"흑백요리사":/허영만|식객/.test(b)?"식객 허영만":/셰프/.test(b)?"셰프 단골":/티맵/.test(b)?"티맵 랭킹":/노포/.test(b)?"노포 기사":b?"잡지 추천":"";if(n&&!o.includes(n))o.push(n)}return o}
function srcCount(p){if(p._sc!==undefined)return p._sc;const x=p.x,g=new Set();if(x.some(t=>/^star|^bib|^selected/.test(t)))g.add("m");if(x.some(t=>/^ribbon/.test(t)))g.add("r");if(x.some(t=>/century|future|nopo/.test(t)))g.add("o");for(const t of ["wed","tv","chef","dcode"])if(x.includes(t))g.add(t);if(x.includes("mag")||x.includes("rank"))g.add("mag");if(p.v===1||x.includes("nlist"))g.add("me");return p._sc=g.size+tubers(p).length}
function tubers(p){return [...new Set((p.by||"").split(",").map(s=>s.trim()).filter(Boolean))]}
function badges(p,max){const t=[],x=p.x;
  if(p.v)t.push(["v","★ 빅토리아노 맛집"]);
  if(VIS[p.id])t.push(["mine","직접 가봄"]);
  const st=x.find(v=>/^star/.test(v));if(srcCount(p)>=2)t.push(["multi",`여러 곳 인정 ${srcCount(p)}`]);if(st)t.push(["mich",`미쉐린 ${"★".repeat(+st.slice(4))}`]);else if(x.includes("bib"))t.push(["mich","빕구르망"]);else if(x.includes("selected"))t.push(["mich","미쉐린"]);if(x.includes("dcode"))t.push(["mag","다이닝코드 상위"]);
  const rb=x.find(v=>/^ribbon/.test(v));if(rb)t.push(["ribbon",`블루리본${+rb.slice(6)>1?" "+rb.slice(6)+"개":""}`]);
  if(x.includes("century"))t.push(["old","백년가게"]);if(x.includes("future"))t.push(["old","서울미래유산"]);
  if(x.includes("wed"))t.push(["wed","수요미식회"]);
  srcNames(p).forEach(n=>t.push([/요리사|셰프|허영만/.test(n)?"chef":/노포|GQ|바자/.test(n)?"old":/백반|달인|티맵/.test(n)?"wed":"mag",n]));
  if(isTube(p)){const T=tubers(p);(T.length?T:["유튜버"]).forEach(n=>t.push(["tube",n]))}
  if(x.includes("cheap"))t.push(["cheap","착한가격"]);
  if(p.added)t.push(["mine","직접 추가"]);
  const L=max&&t.length>max?[...t.slice(0,max),["",`+${t.length-max}`]]:t;
  return L.length?`<div class="bd">${L.map(([c,n])=>`<span class="b ${c}">${esc(n)}</span>`).join("")}</div>`:""}
const emo=(p,big)=>`<div class="em" style="--c:${colOf(p)}">${EMO[p.s]||"🍽️"}${VIS[p.id]?'<span class="vs">✓</span>':""}</div>`;

/* ===== 목록 ===== */
const weight=p=>(VIS[p.id]?4:0)+(p.v?3:0)+(p.x.some(x=>/^star/.test(x))?2:0)+p.x.filter(x=>x!=="cheap"&&x!=="nlist").length+(tubers(p).length>1?1:0);
function inView(){const L=P.filter(match);if(!mapReady||query||COURSEMODE)return L;const R=visRect();return L.filter(p=>{const pt=map.project([p.lo,p.la]);return pt.x>=R.l&&pt.x<=R.r&&pt.y>=R.t&&pt.y<=R.b})}
function sortList(L){const o=origin();L.forEach(p=>p._d=km(o,p));if(sort==="score")return L.sort((a,b)=>weight(b)-weight(a)||a._d-b._d);return L.sort((a,b)=>a._d-b._d)}
function item(p){const sub=[kindLabel(p),p.a,p.pr?"1인 "+p.pr:""].filter(Boolean).join(" · ");const I=introOf(p);const mn=(VIS[p.id]&&VIS[p.id].note)?"“"+VIS[p.id].note+"”":p.ds?p.ds:I.slice(1).join(" ")||(/년에 문 연/.test(I[0])?I[0]:"");
  return `<div class="it" data-open="${p.i}">${emo(p)}<div class="tx"><div class="nm"><b>${esc(p.n)}</b>${openTag(p)}<span class="ds">${sort==="me"&&me?fmtKm(p._d):fmtD(p._d)}</span></div><div class="kd">${esc(sub)}</div>${mn?`<div class="mn">${esc(mn)}</div>`:""}${badges(p,3)}</div></div>`}
function topArea(L){const c={};L.slice(0,30).forEach(p=>{const a=p.a;if(a)c[a]=(c[a]||0)+1});let best="",n=0;for(const k in c)if(c[k]>n){n=c[k];best=k}return best}
const SORTSEL=()=>`<select class="sel" id="sort" aria-label="정렬"><option value="near"${sort==="near"?" selected":""}>가까운 순</option><option value="me"${sort==="me"?" selected":""}>내 위치 순</option><option value="score"${sort==="score"?" selected":""}>추천 많은 순</option></select>`;
function renderHeader(title,subt,right,left){setHTML($("#shrow"),`${left||""}<div class="tt">${title?`<h2>${title}</h2>`:""}${subt?`<p>${subt}</p>`:""}</div>${right||""}`)}
function addBtnHTML(){return DB?(CANEDIT?`<button type="button" class="pill" id="addBtn">＋ 넣기</button>`:`<button type="button" class="pill" id="suggestBtn">＋ 추천</button>`):""}
function renderList(){if(VIEW!=="list")return;const L=$("#list"),more=$("#moreBtn");
  if(COURSEMODE){const n=P.filter(p=>COURSE[p.id]).length;renderHeader("♥ 내 코스",n?`${n}곳 담았어요 · 날짜를 정하고 순서를 바꿀 수 있어요`:"가게에서 ♡를 누르면 여기에 모여요","",`<button type="button" class="back" data-course="1">${ICO.back}목록</button>`);L.innerHTML=courseHTML();more.hidden=true;return}
  const S=sortList(inView());
  const basis=sort==="me"&&me?"내 위치에서 가까운 순":sort==="score"?"여러 곳에서 추천한 순":"지도 가운데에서 가까운 순";
  if(query)renderHeader(`‘${esc(query)}’ ${S.length.toLocaleString()}곳`,`전체 지도에서 찾았어요 · ${basis}`,SORTSEL());
  else{const ta=mapReady&&map.getZoom()>=10.5?topArea(S):"";renderHeader(`${ta?esc(ta)+" 근처 ":"지도 안 "}${S.length.toLocaleString()}곳`,(nActive()?"필터 적용 중 · ":"")+basis,SORTSEL()+`<button type="button" class="pill" data-course="1">♥ 코스${Object.keys(COURSE).length?" "+Object.keys(COURSE).length:""}</button>`+addBtnHTML())}
  let h="";if(CANEDIT&&SUGG.length&&!query)h+=`<div class="it" id="suggRow"><div class="em" style="--c:var(--accent)">📮</div><div class="tx"><div class="nm"><b>추천받은 곳 ${SUGG.length}곳</b></div><div class="kd">눌러서 확인하고 지도에 넣을 수 있어요</div></div></div>`;
  if(S.length)h+=S.slice(0,limit).map(item).join("");
  else h+=`<div class="empty">${query?"찾는 가게가 없어요. 다른 말로 찾아보세요.":nActive()?"이 지역에는 조건에 맞는 곳이 없어요.":"이 지역에는 아직 모은 곳이 없어요."}${!query&&P.some(match)?`<br><button type="button" class="btn" id="nearestBtn">가장 가까운 곳 보기</button>`:""}${nActive()?`<br><button type="button" class="btn" id="clearF">필터 해제</button>`:""}</div>`;
  setHTML(L,h);more.hidden=S.length<=limit;more.textContent=`더 보기 (${(S.length-limit).toLocaleString()}곳 남음)`}
$("#moreBtn").onclick=()=>{limit+=60;renderList()};
document.addEventListener("change",e=>{if(e.target.id!=="sort")return;const v=e.target.value;if(v==="me"&&!me){locate(ok=>{sort=ok?"me":"near";renderList()});return}sort=v;limit=40;renderList();shb.scrollTop=0});
document.addEventListener("click",e=>{const t=e.target;
  const it=t.closest("[data-open]");if(it&&!t.closest("button,a")){openDetail(P[+it.dataset.open],true);return}
  const b=t.closest("button");if(!b)return;
  if(b.id==="nearestBtn"){const o=vcenter();const L=P.filter(match).sort((a,c)=>km(o,a)-km(o,c));if(L[0])flyTo(L[0],Math.max(13,Math.min(map.getZoom(),15)))}
  else if(b.id==="clearF")$("#resetAll").click();
  else if(b.id==="addBtn")startAdd(false);else if(b.id==="suggestBtn")startAdd(true);
  else if(b.id==="backBtn")backToList();
});
document.addEventListener("click",e=>{if(e.target.closest("#suggRow"))openSugg()});

/* ===== 자세히 ===== */
function nq(p){const nm=p.n.replace(/ \(.*\)/,"");const ar=(p.a||"").split(/[ ·]/)[0];return ar&&!nm.includes(ar)?ar+" "+nm:nm}
const naverUrl=p=>p.nv?"https://naver.me/"+p.nv:"https://map.naver.com/p/search/"+encodeURIComponent(nq(p));
const kakaoUrl=p=>p.kk?"https://place.map.kakao.com/"+p.kk:"https://map.kakao.com/link/search/"+encodeURIComponent(nq(p));
const instaUrl=p=>"https://www.instagram.com/explore/search/keyword/?q="+encodeURIComponent(p.n.replace(/ \(.*\)/,"").replace(/\s+/g,""));
function vidUrl(p){return "https://www.youtube.com/results?search_query="+encodeURIComponent(tubers(p)[0]+" "+p.vid.replace(/\s*\(\d{4}\)$/,""))}
let listScroll=0;
function openDetail(p,fly){if(!p)return;stopFollow();blurQ();if(VIEW==="list")listScroll=shb.scrollTop;sel=p.i;VIEW="detail";
  $("#listView").hidden=true;$("#detail").hidden=false;renderDetail();shb.scrollTop=0;
  if(ST===0||ST===2)setST(1);drawSel();
  if(map){const R=visRect(1),pt=map.project([p.lo,p.la]);if(fly||pt.x<R.l+20||pt.x>R.r-20||pt.y<R.t+20||pt.y>R.b-20)flyTo(p,fly?Math.max(map.getZoom(),15.5):map.getZoom(),1)}
  if(COURSEMODE){const li=document.querySelector(`.course li[data-id="${CSS.escape(p.id)}"]`);if(li)li.classList.add("flash")}}
function backToList(quiet){if(VIEW!=="detail"){if(!quiet)renderList();return}VIEW="list";sel=null;$("#detail").hidden=true;$("#listView").hidden=false;drawSel();if(!quiet){renderList();shb.scrollTop=listScroll}}
function infoCard(p){const o=openNow(p);const th=todayHours(p);
  const st=openTag(p).replace(/<span/g,"<b").replace(/<\/span>/g,"</b>");
  const hrs=p.h?`<div class="ic-h">${ICO.clock}<div>${st}${th?` <span>${esc(th)}</span>`:""}<p>${esc(p.h)}</p></div></div>`
    :`<div class="ic-h">${ICO.clock}<div><p class="mut">${p.kx?esc(p.kx)+"<br>":""}영업시간 정보가 없어요. 가기 전에 지도 앱에서 확인해 주세요.</p></div></div>`;
  const mn=p.m?`<div class="ic-m">${ICO.menu}<div>${menuList(p.m)}</div></div>`:"";
  return `<div class="icard">${hrs}${mn}</div>`}
function menuList(m){const L=String(m).split(/\s*,\s*(?![^()]*\))/).filter(Boolean).slice(0,8).map(t=>{const mm=t.match(/^(.*?)\s*([\d,]{3,})\s*원?$/);return mm?[mm[1],(+mm[2].replace(/,/g,"")).toLocaleString()+"원"]:[t,""]});
  return `<ul class="menu">${L.map(([a,b])=>`<li><span>${esc(a)}</span>${b?`<b>${b}</b>`:""}</li>`).join("")}</ul>`}
function row(ico,lb,v,raw){return v?`<div class="rw">${ICO[ico]}<div class="rv"><span class="lb">${lb}</span>${raw?v:esc(v)}</div></div>`:""}
function renderDetail(){const p=P[sel];if(!p){backToList();return}const v=VIS[p.id];
  renderHeader("","",`<button type="button" class="ib" id="backBtn2" aria-label="닫기">${ICO.x}</button>`,`<button type="button" class="back" id="backBtn">${ICO.back}목록</button>`);
  const d=me?km(me,p):null;const sub=[kindLabel(p),p.a,p.pr?"1인 "+p.pr:"",d!=null?(d<1.5?fmtKm(d):"내 위치에서 "+fmtKm(d)):""].filter(Boolean).join(" · ");
  const A=[`<a class="ab pri" href="${naverUrl(p)}" target="_blank" rel="noopener"><i>${ICO.nav}</i>네이버지도</a>`,`<a class="ab" href="${kakaoUrl(p)}" target="_blank" rel="noopener"><i>${ICO.pin}</i>카카오맵</a>`,
    p.tel?`<a class="ab" href="tel:${esc(p.tel.replace(/[^0-9+]/g,""))}"><i>${ICO.phone}</i>전화</a>`:`<a class="ab" href="${instaUrl(p)}" target="_blank" rel="noopener"><i>${ICO.cam}</i>인스타</a>`,
    `<button type="button" class="ab${COURSE[p.id]?" on":""}" data-heart="${p.i}"><i>${COURSE[p.id]?ICO.heartF:ICO.heart}</i>${COURSE[p.id]?"담음":"코스 담기"}</button>`,
    `<button type="button" class="ab" data-share="${p.i}"><i>${ICO.share}</i>공유</button>`];
  const vid=p.vid?`<a href="${vidUrl(p)}" target="_blank" rel="noopener">${esc(p.vid)}</a>${tubers(p).length?`<br><span class="lb">${esc(tubers(p).join(", "))}</span>`:""}`:"";
  const src=p.src?String(p.src).split(/\s*;\s*/)[0]:"";
  const addr=p.addr?`${esc(p.addr)}`:"";
  $("#detail").innerHTML=`<div class="dt">
    <div class="hero">${emo(p)}<div><h2>${esc(p.n)}</h2><div class="kd">${esc(sub)}</div></div></div>
    ${infoCard(p)}
    ${v&&v.note?`<p class="note">“${esc(v.note)}”<span>빅토리아노 한 줄 평</span></p>`:""}
    <p class="intro">${esc(introOf(p).join(" "))}</p>
    ${p.closed?'<p class="note warn">최근 폐업하거나 옮겼다는 소식이 있어요. 가기 전에 꼭 확인해 주세요.</p>':""}
    ${badges(p)}
    <div class="acts">${A.join("")}</div>
    <div class="rows">
      ${row("menu","인기 메뉴",p.pop)}${row("info","알아둘 점",p.tip)}${row("info","더 알아보기",p.fd||(p.d&&!p.bs&&p.d.length>=25?p.d:""))}${row("won","가격",p.p)}
      ${p.tel?row("phone","전화",`<a href="tel:${esc(p.tel.replace(/[^0-9+]/g,""))}">${esc(p.tel)}</a>`,1):""}
      ${row("cal","개업",p.yr)}${row("quote","후기",p.r)}${row("tag","참고",p.t)}
      ${addr?`<div class="rw">${ICO.pin}<div class="rv"><span class="lb">주소</span>${addr}${p.geo==="rough"?'<br><span class="lb">지도 위치는 동네 기준이라 조금 다를 수 있어요</span>':""}</div><button type="button" class="cp" data-copy="${esc(p.addr)}">복사</button></div>`:""}
      ${vid?row("play","유튜브 영상",vid,1):""}
      ${p.kk?row("cam","사진",`<a href="https://place.map.kakao.com/${esc(p.kk)}#photoList" target="_blank" rel="noopener">카카오맵에서 사진 보기</a>`,1):""}
      ${!p.tel?row("cam","인스타그램",`<a href="${instaUrl(p)}" target="_blank" rel="noopener">인스타그램에서 보기</a>`,1):""}
      ${src&&/^https?:/.test(src)?row("link","출처",`<a href="${esc(src)}" target="_blank" rel="noopener">${esc(src.replace(/^https?:\/\/(www\.)?/,"").split("/")[0])}</a>`,1):""}
    </div>
    ${CANEDIT?`<div class="own"><button type="button" class="btn" data-visit="${p.i}">${ICO.check}${v?"한 줄 평 고치기":"가봤어요"}</button><button type="button" class="btn ghost" data-hide="${p.i}">지도에서 빼기</button></div>`:""}
  </div>`}
document.addEventListener("click",e=>{const b=e.target.closest("[data-heart],[data-share],[data-visit],[data-hide],[data-copy],#backBtn2");if(!b)return;
  if(b.id==="backBtn2"){backToList();return}
  const d=b.dataset;if(d.copy!=null){navigator.clipboard&&navigator.clipboard.writeText(d.copy).then(()=>toast("주소를 복사했어요"),()=>toast("복사하지 못했어요"));return}
  const p=P[+(d.heart||d.share||d.visit||d.hide)];if(!p)return;
  if(d.heart!=null)toggleHeart(p);else if(d.share!=null)sharePlace(p);else if(d.visit!=null)openVisit(p);else if(d.hide!=null)hidePlace(p)});
function renderView(){if(VIEW==="detail"&&sel!=null&&P[sel])renderDetail();else renderList()}

/* ===== 내 코스 ===== */
const DAYC=["#2f6fde","#e0782b","#13887a","#8a7f72"];const DAYN=["1일차","2일차","3일차","날짜 미정"];
function saveCourse(){LS.set("bm-course",COURSE)}
function toggleHeart(p){if(COURSE[p.id]){delete COURSE[p.id];toast("내 코스에서 뺐어요")}else{const n=Object.values(COURSE).filter(c=>c.day===3).length;COURSE[p.id]={day:3,order:n};toast("내 코스에 담았어요")}saveCourse();render()}
const items=d=>Object.entries(COURSE).filter(([,c])=>c.day===d).sort((a,b)=>a[1].order-b[1].order).map(([n])=>n);
const placeOf=id=>P.find(p=>p.id===id);
function courseHTML(){if(!P.some(p=>COURSE[p.id]))return '<div class="course"><p class="tip">가게를 열고 ♡ 코스 담기를 누르면 여기에 모여요. 담은 곳은 날짜를 정하고 순서를 바꿀 수 있어요.</p></div>';
  let html='<div class="course">';
  [0,1,2,3].forEach(d=>{const L=items(d).map(placeOf).filter(Boolean);if(!L.length)return;
    html+=`<div class="day"><h3><i style="background:${DAYC[d]}"></i>${DAYN[d]} <span style="color:var(--muted);font-weight:400;font-size:13px">${L.length}곳</span></h3><ol>`+
    L.map((p,k)=>`<li data-id="${esc(p.id)}"><span class="n" style="background:${DAYC[d]}">${k+1}</span><div class="inf" data-open="${p.i}"><b>${esc(p.n)}</b><span>${esc(kindLabel(p))} · ${esc(p.a||"")}</span></div>
      <div class="ctl">${[0,1,2].map(x=>`<button type="button" data-cd="${x}" class="${d===x?"on":""}">${x+1}일</button>`).join("")}<button type="button" data-mv="-1" aria-label="위로">↑</button><button type="button" data-mv="1" aria-label="아래로">↓</button><button type="button" data-rm aria-label="빼기">✕</button></div></li>`).join("")+`</ol></div>`});
  html+=`<div><button type="button" class="btn" id="shareCourse">${ICO.share}코스 공유</button></div></div>`;return html}
document.addEventListener("click",e=>{const li=e.target.closest(".course li");const b=e.target.closest("button");
  if(b&&b.id==="shareCourse"){shareCourse();return}
  if(!li||!b)return;const n=li.dataset.id,c=COURSE[n];if(!c)return;
  if(b.dataset.cd!=null){const d=+b.dataset.cd;if(c.day===d)return;c.order=items(d).length;c.day=d}
  else if(b.dataset.mv){const L=items(c.day),k=L.indexOf(n),j=k+(+b.dataset.mv);if(j<0||j>=L.length)return;L.splice(k,1);L.splice(j,0,n);L.forEach((x,o)=>COURSE[x].order=o)}
  else if(b.dataset.rm!=null)delete COURSE[n];else return;
  saveCourse();render()});
function drawRoutes(){if(!mapReady)return;numMks.forEach(m=>m.remove());numMks=[];const F=[];
  if(COURSEMODE)[0,1,2].forEach(d=>{const L=items(d).map(placeOf).filter(Boolean);
    L.forEach((p,k)=>{const el=document.createElement("div");el.className="num-mk";el.style.background=DAYC[d];el.textContent=k+1;numMks.push(new maplibregl.Marker({element:el,offset:[0,-18]}).setLngLat([p.lo,p.la]).addTo(map))});
    if(L.length>1)F.push({type:"Feature",properties:{col:DAYC[d]},geometry:{type:"LineString",coordinates:L.map(p=>[p.lo,p.la])}})});
  map.getSource("route").setData({type:"FeatureCollection",features:F})}
function fitCourse(){const L=Object.keys(COURSE).map(placeOf).filter(Boolean);if(L.length)fitTo(L,15)}
function shareCourse(){const lines=["빅맵 · 내 코스"];[0,1,2,3].forEach(d=>{const L=items(d).map(placeOf).filter(Boolean);if(!L.length)return;lines.push("",DAYN[d]);L.forEach((p,k)=>lines.push(`${k+1}. ${p.n}${p.a?" ("+p.a+")":""}`))});doShare(lines.join("\n"),"빅맵 코스")}
function sharePlace(p){const L=[p.n];if(p.m)L.push(p.m);if(p.addr)L.push(p.addr);L.push(naverUrl(p));doShare(L.join("\n"),p.n)}
async function doShare(text,title){try{if(navigator.share){await navigator.share({title,text});return}}catch(e){if(e&&e.name==="AbortError")return}
  try{await navigator.clipboard.writeText(text);toast("복사했어요. 카톡에 붙여넣으면 돼요.")}catch(_){toast("공유를 할 수 없는 화면이에요.")}}

/* ===== 내 위치 · 방향 ===== */
let watchId=null,FOLLOW=false,HEAD=false,HEADING=null,gotHead=false,NOPERM=false,oriRAF=0;
function updMe(){const b=$("#me");b.classList.toggle("on",!!me);b.classList.toggle("follow",FOLLOW&&!HEAD);b.classList.toggle("head",HEAD);b.innerHTML=HEAD?ICO.head:ICO.me;b.setAttribute("aria-label",HEAD?"방향 보기 끄기":FOLLOW?"내 방향대로 보기":"내 위치");
  if(meMk){meMk.getElement().querySelector(".cone").hidden=HEADING==null}}
function locate(cb){if(!navigator.geolocation){toast("이 화면에서는 위치를 쓸 수 없어요. 지도를 옮기면 가운데 기준으로 가까운 순이 돼요.",4200);cb&&cb(false);return}
  toast("내 위치 찾는 중…",0);
  navigator.geolocation.getCurrentPosition(pos=>{setMe(pos);hideToast();try{if(watchId==null)watchId=navigator.geolocation.watchPosition(setMe,()=>{},{enableHighAccuracy:true,maximumAge:10000})}catch(_){}cb&&cb(true)},
    err=>{toast(err.code===1?"이 화면에서는 위치 권한이 없어요. 지도를 옮기면 가운데 기준으로 가까운 순이 돼요.":"위치를 못 찾았어요. 잠시 뒤 다시 눌러 주세요.",4500);cb&&cb(false)},{enableHighAccuracy:true,timeout:12000,maximumAge:30000})}
const inArea=m=>m&&m.la>32.8&&m.la<38.8&&m.lo>124.5&&m.lo<131.2;
function setMe(pos){me={la:pos.coords.latitude,lo:pos.coords.longitude};
  if(map){if(!meMk){const el=document.createElement("div");el.className="me-mk";el.innerHTML='<div class="cone" hidden></div><div class="d"></div>';meMk=new maplibregl.Marker({element:el,rotationAlignment:"map"}).setLngLat([me.lo,me.la]).addTo(map)}else meMk.setLngLat([me.lo,me.la])}
  if(FOLLOW&&!HEAD&&map&&inArea(me)&&!map.isMoving())flyTo(me,map.getZoom());
  updMe();if(sort==="me"&&VIEW==="list")renderListSoon()}
function centerMe(){if(!me||!map)return;if(!inArea(me)){toast("지금 계신 곳은 지도 범위 밖이에요.");return}flyTo(me,Math.max(map.getZoom(),15))}
function stopFollow(){if(FOLLOW||HEAD){if(HEAD)stopHeading();FOLLOW=false;updMe()}}
$("#me").onclick=()=>{
  if(!me){locate(ok=>{if(ok){FOLLOW=true;updMe();centerMe()}});return}
  if(HEAD){stopHeading();FOLLOW=false;updMe();map&&map.easeTo({bearing:0,duration:400});return}
  if(FOLLOW){startHeading();return}
  FOLLOW=true;updMe();centerMe()};
const ORI=("ondeviceorientationabsolute" in window)?"deviceorientationabsolute":"deviceorientation";
function onOri(e){let h=null;if(e.webkitCompassHeading!=null&&!isNaN(e.webkitCompassHeading))h=e.webkitCompassHeading;else if(e.alpha!=null&&(e.absolute||ORI==="deviceorientationabsolute"))h=360-e.alpha;
  if(h==null)return;h+=(screen.orientation&&screen.orientation.angle)||window.orientation||0;h=((h%360)+360)%360;gotHead=true;
  const dd=HEADING==null?0:((h-HEADING+540)%360)-180;HEADING=HEADING==null?h:(HEADING+dd*0.3+360)%360;
  if(meMk){const c=meMk.getElement().querySelector(".cone");c.hidden=false;c.style.transform=`rotate(${HEADING}deg)`}
  if(!HEAD||!map||oriRAF)return;oriRAF=requestAnimationFrame(()=>{oriRAF=0;if(!HEAD)return;const opt={bearing:HEADING};if(FOLLOW&&me&&inArea(me))opt.center=[me.lo,me.la];map.jumpTo(opt)})}
function startHeading(){const go=()=>{HEAD=true;FOLLOW=true;gotHead=false;window.addEventListener(ORI,onOri,true);updMe();centerMe();
    setTimeout(()=>{if(HEAD&&!gotHead){stopHeading();map&&map.easeTo({bearing:0});toast(NOPERM?"방향 권한이 꺼져 있어요.":"휴대폰 방향을 읽지 못했어요. 잠시 뒤 다시 눌러 주세요.")}},2500)};
  try{if(typeof DeviceOrientationEvent!=="undefined"&&typeof DeviceOrientationEvent.requestPermission==="function"){DeviceOrientationEvent.requestPermission().then(r=>{NOPERM=r!=="granted";go()}).catch(()=>{NOPERM=true;go()});return}}catch(_){}
  go()}
function stopHeading(){if(!HEAD)return;HEAD=false;updMe();$("#north").hidden=map?Math.abs(map.getBearing())<0.5:true}

/* ===== 직접 관리 (db) ===== */
let DB=null,CANEDIT=false,ADDMODE=false,SUGG=[];
function slug(n,la,lo){let h=0;const s=n+"|"+la.toFixed(3)+"|"+lo.toFixed(3);for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return "u"+(h>>>0).toString(36)}
async function initDB(){try{
    const [db,user]=await Promise.all([claude.use("db"),claude.use("user")]);DB=db;
    CANEDIT=!!(user&&user.canEdit&&user.canEdit());
    if(!db){render();return}
    db.collection("visits").onSnapshot(s=>{VIS={};s.docs.forEach(d=>VIS[d.id]=d.data());render()},()=>{});
    db.collection("hidden").onSnapshot(s=>{HIDE={};s.docs.forEach(d=>HIDE[d.id]=1);rebuild();render()},()=>{});
    db.collection("places").onSnapshot(s=>{ADDED=s.docs.map(d=>({...d.data(),id:d.id,added:1})).filter(p=>p.n&&isFinite(p.la)&&isFinite(p.lo));rebuild();render()},()=>{});
    if(CANEDIT)db.collection("suggest").onSnapshot(s=>{SUGG=s.docs.map(d=>({...d.data(),id:d.id}));renderView()},()=>{});
    render();
  }catch(_){}}
function openVisit(p){const v=VIS[p.id]||{};openForm(`<h3>${esc(p.n)} · 가봤어요</h3>
  <label>한 줄 평 <small>(공유받은 분들에게도 보여요)</small><textarea id="fNote" rows="3" maxlength="140" placeholder="예: 냉면은 슴슴하고 수육이 좋았어요">${esc(v.note||"")}</textarea></label>
  <div class="facts"><button type="button" class="btn primary" id="fSave">저장</button>${VIS[p.id]?'<button type="button" class="btn ghost" id="fDel">가봄 취소</button>':""}<button type="button" class="btn" id="fCancel">닫기</button></div>`,
  {fSave:async()=>{try{await DB.collection("visits").doc(p.id).set({note:$("#fNote").value.trim(),at:Date.now()});closeForm();toast("저장했어요")}catch(e){toast("저장하지 못했어요")}},
   fDel:async()=>{try{await DB.collection("visits").doc(p.id).delete();closeForm()}catch(e){toast("지우지 못했어요")}}})}
function hidePlace(p){openForm(`<h3>${esc(p.n)} 빼기</h3><p class="fp">지도와 목록에서 빠져요. 공유받은 분들 화면에서도 빠져요.</p>
  <div class="facts"><button type="button" class="btn primary" id="fSave">빼기</button><button type="button" class="btn" id="fCancel">닫기</button></div>`,
  {fSave:async()=>{try{if(p.added)await DB.collection("places").doc(p.id).delete();else await DB.collection("hidden").doc(p.id).set({n:p.n,at:Date.now()});closeForm();backToList();toast("뺐어요")}catch(e){toast("빼지 못했어요")}}})}
function crossPt(){const f=$("#form");const W=innerWidth,H=innerHeight,t=topH();if(WIDE())return [400+(W-400)/2,(t+H)/2];const fh=f.hidden?0:f.offsetHeight;return [W/2,Math.max(t+40,(t+H-fh)/2)]}
function updCross(){const c=$("#cross");c.hidden=!ADDMODE;if(ADDMODE){const [,y]=crossPt();c.style.setProperty("--cy",y+"px")}}
function startAdd(sugg){ADDMODE=true;backToList(true);setST(0);openAdd(sugg);updCross();toast("지도를 움직여 빨간 + 표시를 가게 자리에 맞춰 주세요.",4000)}
function openAdd(sugg){openForm(`<h3>${sugg?"가게 추천하기":"새 가게 넣기"}</h3>
  <label>가게 이름<input id="fN" maxlength="40" placeholder="예: 을지면옥"></label>
  <label>종류<select id="fS">${Object.keys(MAIN).map(c=>Object.entries(SUBS[c]).map(([k,v])=>`<option value="${c}:${k}">${MAIN[c]} · ${v}</option>`).join("")).join("")}</select></label>
  <label>메뉴나 메모<input id="fM" maxlength="80" placeholder="예: 평양냉면, 수육"></label>
  <label>네이버 지도 링크 <small>(있으면)</small><input id="fL" maxlength="120" placeholder="https://naver.me/…"></label>
  <label>${sugg?"추천하는 이유":"한 줄 평 <small>(적으면 가봤어요로 표시돼요)</small>"}<textarea id="fNote" rows="2" maxlength="140"></textarea></label>
  <p class="fp">위치는 지도 위 빨간 + 표시 자리로 저장돼요.</p>
  <div class="facts"><button type="button" class="btn primary" id="fSave">${sugg?"추천 보내기":"넣기"}</button><button type="button" class="btn" id="fCancel">닫기</button></div>`,
  {fSave:async()=>{const n=$("#fN").value.trim();if(!n){toast("가게 이름을 적어 주세요");return}const [c,s]=$("#fS").value.split(":");const c0=map.unproject(crossPt());
    const link=$("#fL").value.trim();const nv=(link.match(/naver\.me\/([A-Za-z0-9]+)/)||[])[1]||"";const note=$("#fNote").value.trim();
    const doc={n,c,s,la:+c0.lat.toFixed(5),lo:+c0.lng.toFixed(5),m:$("#fM").value.trim(),nv,at:Date.now()};const id=slug(n,doc.la,doc.lo);
    try{if(sugg){await DB.collection("suggest").doc(id).set({...doc,note});toast("추천을 보냈어요. 고마워요!")}
      else{await DB.collection("places").doc(id).set({...doc,x:[]});if(note)await DB.collection("visits").doc(id).set({note,at:Date.now()});toast("넣었어요")}
      closeForm()}catch(e){toast(sugg?"추천을 보내지 못했어요. 보기 권한만 있으면 보낼 수 없어요.":"넣지 못했어요")}}},true)}
function openSugg(){openForm(`<h3>추천받은 곳 ${SUGG.length}곳</h3>`+SUGG.map(s=>`<div class="sg"><b>${esc(s.n)}</b> <span>${esc(subName(s.c,s.s)||"")}${s.m?" · "+esc(s.m):""}</span>${s.note?`<p>${esc(s.note)}</p>`:""}<div class="facts"><button type="button" class="btn primary" data-ok="${esc(s.id)}">지도에 넣기</button><button type="button" class="btn" data-look="${esc(s.id)}">위치 보기</button><button type="button" class="btn ghost" data-no="${esc(s.id)}">지우기</button></div></div>`).join("")+'<div class="facts"><button type="button" class="btn" id="fCancel">닫기</button></div>',{})}
document.addEventListener("click",async e=>{const b=e.target.closest("[data-ok],[data-no],[data-look]");if(!b||!DB)return;const id=b.dataset.ok||b.dataset.no||b.dataset.look;const s=SUGG.find(x=>x.id===id);if(!s)return;
  if(b.dataset.look){closeForm();setST(0);flyTo(s,16,0);return}
  try{if(b.dataset.ok){const {note,id:_i,...rest}=s;await DB.collection("places").doc(id).set({...rest,x:[]})}await DB.collection("suggest").doc(id).delete();toast(b.dataset.ok?"지도에 넣었어요":"지웠어요");if(SUGG.length<=1)closeForm();else setTimeout(openSugg,300)}catch(_){toast("처리하지 못했어요")}});
function openForm(html,handlers,keepCross){const f=$("#form");f.innerHTML=html;f.hidden=false;
  Object.entries(handlers||{}).forEach(([id,fn])=>{const el=f.querySelector("#"+id);if(el)el.onclick=fn});
  const c=f.querySelector("#fCancel");if(c)c.onclick=closeForm;if(!keepCross)ADDMODE=false;updCross()}
function closeForm(){$("#form").hidden=true;ADDMODE=false;updCross()}

/* ===== 기타 ===== */
let toastT;function toast(msg,ms){const t=$("#toast");t.textContent=msg;t.hidden=false;clearTimeout(toastT);if(ms!==0)toastT=setTimeout(hideToast,ms||2600)}
function hideToast(){$("#toast").hidden=true}
function render(){chips();drawPts();drawSel();drawRoutes();renderView()}
function layout(){document.documentElement.style.setProperty("--toph",topH()+"px");setST(ST)}
addEventListener("resize",()=>{layout();if(map)map.resize()});
setInterval(()=>{if(OPEN){drawPts();renderView()}else if(VIEW==="list")renderList()},60000);
(function(){const SEL="button,a.ab,a.btn";let st=null;
  document.addEventListener("touchstart",e=>{if(e.touches.length!==1){st=null;return}const el=e.target.closest&&e.target.closest(SEL);if(!el||el.closest("#map")){st=null;return}const t=e.touches[0];st={el,x:t.clientX,y:t.clientY,t:Date.now()}},{passive:true,capture:true});
  document.addEventListener("touchmove",e=>{if(!st)return;const t=e.touches[0];if(Math.hypot(t.clientX-st.x,t.clientY-st.y)>10)st=null},{passive:true,capture:true});
  document.addEventListener("touchend",e=>{const s=st;st=null;if(!s||Date.now()-s.t>800)return;const t=e.changedTouches[0];const el=document.elementFromPoint(t.clientX,t.clientY);const hit=el&&el.closest&&el.closest(SEL);if(hit!==s.el||s.el.tagName==="A")return;e.preventDefault();s.el.click()},{passive:false,capture:true});
})();
addEventListener("error",e=>{try{if(e.message&&!/ResizeObserver|Script error/.test(e.message))toast("문제가 생겼어요: "+e.message.slice(0,60))}catch(_){}});
rebuild();chips();layout();updMe();initMap();render();
(function waitClaude(n){if(window.claude&&claude.use){initDB();return}if(n>0)setTimeout(()=>waitClaude(n-1),300)})(20);

$("#legendBtn").onclick=()=>{$("#legend").hidden=!$("#legend").hidden};$("#legendClose").onclick=()=>{$("#legend").hidden=true};
