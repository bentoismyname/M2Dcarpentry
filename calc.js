/* Ben's price calculator, carried over from his page. */
(()=>{
const $=s=>document.querySelector(s);
const FINISHES = {
  oak:{name:"Oak",c:"#CDA971",note:"Yellowish"},
  walnut:{name:"Walnut",c:"#5D3E2A",note:"Brownish"},
  teak:{name:"Teak",c:"#A0502F",note:"Reddish"},
  blackteak:{name:"Black teak",c:"#2C2623",note:"Near black"},
  flat:{name:"Flat colour",c:"#D9D4C9",note:"Solid colour, matte"},
  metal:{name:"Metal",c:"linear-gradient(135deg,#E4DFD5,#A39D90 55%,#D6D1C6)",note:"Brushed metal look",fc:"#B7B1A5",tag:"Higher cost"},
  afp:{name:"Flat, anti-fingerprint",c:"#5F656B",note:"Solid colour, resists fingerprints",tag:"Higher cost"}
};
const PRODUCTS = [
  {id:"telok",name:"Telok dining table",room:"Dining",type:"table",W:2400,D:1000,H:750,price:4800,fin:["walnut"],img:"shop/telok.jpg",sheet:"shop/telok-sheet.jpg",
   desc:"A 2.4 m walnut top with softly rounded corners, on a sculpted tiered base and two slim black steel legs. Seats up to eight."},
  {id:"pasir",name:"Pasir dining table",room:"Dining",type:"table",W:2000,D:900,H:750,price:3900,fin:["walnut"],img:"shop/pasir.jpg",sheet:"shop/pasir-sheet.jpg",
   desc:"A 2.0 m walnut top with rounded corners, resting on two pebble-shaped solid legs. Seats six."},
  {id:"zh-tv",name:"ZH26-01 TV console",room:"Living",type:"console",W:1800,D:400,H:400,price:2600,fin:["walnut"],img:"shop/zh-tv.jpg",sheet:"shop/zh-tv-sheet.jpg",
   desc:"Three rounded walnut volumes resting on a natural stone plinth. A low, sculptural console for the living room."},
  {id:"zh-cabinet",name:"ZH26-01 Decorative cabinet",room:"Living",type:"cabinet",W:800,D:320,H:1200,price:2200,fin:["walnut"],img:"shop/zh-cabinet.jpg",sheet:"shop/zh-cabinet-sheet.jpg",
   desc:"Two rounded walnut doors standing on a stone base. Made to sit against a feature wall as a display piece."},
  {id:"marina",name:"Marina coffee set",room:"Living",type:"coffee",W:1200,D:800,H:340,price:3600,fin:["walnut"],img:"shop/marina.jpg",sheet:"shop/marina-sheet.jpg",
   dimNote:"Coffee table W 1200 × D 800 × H 340 mm · Side table Ø 500 × H 440 mm",
   desc:"An oval coffee table and a round side table, rimmed in walnut with natural stone tops and a dark band between the layers."},
  {id:"sentosa",name:"Sentosa coffee set",room:"Living",type:"coffee",W:1200,D:800,H:340,price:3200,fin:["walnut"],img:"shop/sentosa.jpg",sheet:"shop/sentosa-sheet.jpg",
   dimNote:"Coffee table W 1200 × D 800 × H 340 mm · Side table Ø 500 × H 440 mm",
   desc:"An oval coffee table with a top half walnut, half pale stone, paired with a walnut side table that has a bronze-tone collar."},
  {id:"tekong",name:"Tekong coffee set",room:"Living",type:"coffee",W:950,D:950,H:340,price:1900,fin:["walnut"],img:"shop/tekong.jpg",sheet:"shop/tekong-sheet.jpg",
   dimNote:"Coffee table Ø 950 × H 340 mm · Side table Ø 550 × H 460 mm",
   desc:"A round walnut coffee table on three sculpted legs, with a matching tray-top side table."},
];
const ROOMS = ["All","Living","Dining"];
const money = n => "$" + n.toLocaleString("en-SG");
const RED = "#B3422D", INK = "#231F20";
/* ---------- illustrated furniture (3/4 oblique view) ---------- */
let _sid=0;
function shade(hex,amt){ // amt -1..1 : negative darkens, positive lightens
  const n=parseInt(hex.slice(1),16); let r=n>>16,g=(n>>8)&255,b=n&255;
  const t=amt<0?0:255, a=Math.abs(amt);
  r=Math.round(r+(t-r)*a); g=Math.round(g+(t-g)*a); b=Math.round(b+(t-b)*a);
  return "#"+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1);
}
const IMGS={};
const CAM='<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M3 8h4l1.5-2h7L17 8h4v11H3z"/><circle cx="12" cy="13" r="3.5"/></svg>';
function ph(label,sub,cls=""){ return `<div class="ph ${cls}" role="img" aria-label="Photo placeholder: ${label}">${CAM}<b>Photo to come</b><span>${label}${sub?" · "+sub:""}</span></div>`; }
function pimg(p,fin,o={}){
  if(p.img){ const src=(o.dims&&p.sheet)?p.sheet:p.img; return `<img src="${src}" alt="Design render of the ${p.name}, ${p.W} by ${p.D} by ${p.H} millimetres" loading="lazy"><span class="render-tag">Design render</span>`; }
  return ph(p.name,FINISHES[fin].name);
}
function drawing(p, opts={}){
  const id="i"+(++_sid);
  const finKey = opts.finish || p.fin[0];
  const base_c = FINISHES[finKey].fc||FINISHES[finKey].c, isLight = finKey==="flat"||finKey==="oak"||finKey==="metal";
  const VW=400, VH=260, K=0.42, KY=0.26;          // oblique factors for depth
  const dims = !!opts.dims;
  const maxW = dims?270:300, maxH = dims?160:175;
  const vH=opts.viewH||p.H, padW=opts.padW||0;
  const s=Math.min(maxW/(p.W+padW+p.D*K), maxH/(vH+p.D*KY));
  const w=p.W*s, h=p.H*s, ox=p.D*s*K, oy=p.D*s*KY;
  const x0=(VW-(w+ox))/2-(dims?10:0), base=dims?228:232, y0=base-h;
  const front=`url(#${id}g)`, top=shade(base_c,isLight?0.35:0.28), side=shade(base_c,-0.28);
  const line=shade(base_c,isLight?-0.32:-0.45), hl=shade(base_c,isLight?0.5:0.22);
  const metal="#2B2826", V=opts.v||{};
  let g="";
  // a solid block: front face + top + right side
  const box=(x,y,bw,bh,dd=p.D,face=front)=>{
    const dx=dd*s*K, dy=dd*s*KY;
    return `<polygon points="${x},${y} ${x+dx},${y-dy} ${x+bw+dx},${y-dy} ${x+bw},${y}" fill="${top}"/>`+
           `<polygon points="${x+bw},${y} ${x+bw+dx},${y-dy} ${x+bw+dx},${y+bh-dy} ${x+bw},${y+bh}" fill="${side}"/>`+
           `<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="${face}"/>`+
           (finKey!=="white"?`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" fill="url(#${id}w)" opacity=".55"/>`:"");
  };
  const L=(a,b,c,d,col=line,wd=1)=>`<line x1="${a}" y1="${b}" x2="${c}" y2="${d}" stroke="${col}" stroke-width="${wd}"/>`;
  const panel=(x,y,pw,ph)=>`<rect x="${x}" y="${y}" width="${pw}" height="${ph}" fill="none" stroke="${line}" stroke-width=".9"/>`+L(x+.8,y+.8,x+pw-.8,y+.8,hl,.8);
  const pull=(cx,cy,len)=>`<rect x="${cx-len/2}" y="${cy-1.4}" width="${len}" height="2.8" rx="1.4" fill="${metal}"/>`;
  const leg=(x,y1,y2,wd=3)=>`<rect x="${x-wd/2}" y="${y1}" width="${wd}" height="${y2-y1}" fill="${metal}"/>`;
  const shadow=`<ellipse cx="${x0+w/2+ox/2}" cy="${base+2}" rx="${(w+ox)*0.56}" ry="${Math.max(5,oy*0.7)}" fill="#231F20" opacity=".16" filter="url(#${id}b)"/>`;

  switch(p.type){
    case "sideboard":{const lh=110*s,bh=h-lh,y=y0; g+=leg(x0+w*.07,y+bh,base)+leg(x0+w*.93,y+bh,base)+leg(x0+w*.07+ox*.8,y+bh-oy*.8,base-oy*.8,2.4)+leg(x0+w*.93+ox*.8,y+bh-oy*.8,base-oy*.8,2.4);
      g+=box(x0,y,w,bh); const dw=w/3;
      for(let i=0;i<3;i++){const dx=x0+i*dw; g+=panel(dx+2,y+2,dw-4,bh-4); for(let f=dx+7;f<dx+dw-5;f+=4.2) g+=L(f,y+5,f,y+bh-5,line,.6)+L(f+1.2,y+5,f+1.2,y+bh-5,hl,.5);}
      break;}
    case "console":{const ph=40*s,ch=h-ph; g+=box(x0+w*.03,y0+ch,w*.94,ph,p.D*.9,shade(base_c,-0.35)); g+=box(x0,y0,w,ch);
      g+=panel(x0+2,y0+2,w*.33-3,ch-4)+panel(x0+w*.67+1,y0+2,w*.33-3,ch-4);
      g+=`<rect x="${x0+w*.33+1}" y="${y0+3}" width="${w*.34-2}" height="${ch-6}" fill="${shade(base_c,-0.5)}"/>`;
      g+=pull(x0+w*.165,y0+ch*.35,18)+pull(x0+w*.835,y0+ch*.35,18); break;}
    case "table":{const t=40*s; [[.12,.06],[.88,.94]].forEach(([a,b])=>{const xa=x0+w*a,xb=x0+w*b; g+=`<polygon points="${xa-5},${y0+t} ${xa+5},${y0+t} ${xb+4},${base} ${xb-4},${base}" fill="${side}"/>`;});
      g+=L(x0+w*.1,y0+t+h*.55,x0+w*.9,y0+t+h*.55,side,4);
      [[.12,.06],[.88,.94]].forEach(([a,b])=>{const xa=x0+w*a+ox*.75,xb=x0+w*b+ox*.75; g+=`<polygon points="${xa-4},${y0+t-oy*.75} ${xa+4},${y0+t-oy*.75} ${xb+3},${base-oy*.75} ${xb-3},${base-oy*.75}" fill="${shade(base_c,-0.4)}" opacity=".8"/>`;});
      g+=box(x0,y0,w,t); break;}
    case "bench":{const t=40*s; g+=box(x0+w*.07,y0+t,10,h-t,p.D*.8,side)+box(x0+w*.93-10,y0+t,10,h-t,p.D*.8,side); g+=L(x0+w*.07+10,y0+t+(h-t)*.6,x0+w*.93-10,y0+t+(h-t)*.6,side,3); g+=box(x0,y0,w,t); break;}
    case "bedside":{const lh=90*s,bh=h-lh; g+=leg(x0+6,y0+bh,base)+leg(x0+w-6,y0+bh,base)+leg(x0+w-6+ox*.8,y0+bh-oy*.8,base-oy*.8,2.4);
      g+=box(x0,y0,w,bh); g+=panel(x0+2,y0+2,w-4,bh/2-3)+panel(x0+2,y0+bh/2+1,w-4,bh/2-3);
      g+=`<rect x="${x0+w*.3}" y="${y0+4}" width="${w*.4}" height="3" fill="${shade(base_c,-0.55)}"/><rect x="${x0+w*.3}" y="${y0+bh/2+3}" width="${w*.4}" height="3" fill="${shade(base_c,-0.55)}"/>`;
      // lamp
      const lx=x0+w*.55+ox*.5, ly=y0-oy*.5; g+=`<rect x="${lx-1.5}" y="${ly-34}" width="3" height="34" fill="${metal}"/><path d="M${lx-16},${ly-34} L${lx+16},${ly-34} L${lx+10},${ly-56} L${lx-10},${ly-56} Z" fill="#F3EEE4" stroke="#D8D0C2"/>`; break;}
    case "desk":{const t=30*s,pw=w*.3; g+=box(x0+4,y0+t,10,h-t,p.D*.95,side);
      g+=box(x0+w-pw,y0+t,pw,h-t); for(let i=0;i<3;i++){const dh=(h-t)/3; g+=panel(x0+w-pw+2,y0+t+i*dh+2,pw-4,dh-4)+pull(x0+w-pw/2,y0+t+i*dh+9,16);}
      g+=box(x0,y0,w,t);
      // monitor + books
      const mx=x0+w*.32+ox*.5,my=y0-oy*.5; g+=`<rect x="${mx-2}" y="${my-18}" width="4" height="18" fill="${metal}"/><rect x="${mx-30}" y="${my-56}" width="60" height="38" rx="2" fill="${metal}"/><rect x="${mx-27}" y="${my-53}" width="54" height="32" fill="#4A5A63"/>`;
      g+=`<rect x="${x0+w*.72}" y="${my-16}" width="6" height="16" fill="#B3422D"/><rect x="${x0+w*.72+7}" y="${my-19}" width="5" height="19" fill="#6B4A14"/><rect x="${x0+w*.72+13}" y="${my-14}" width="7" height="14" fill="#C9B79C"/>`; break;}
    case "shoe":{const ph=80*s,bh=h-ph; g+=box(x0+w*.05,y0+bh,w*.9,ph,p.D*.85,shade(base_c,-0.4)); g+=box(x0,y0,w,bh);
      g+=panel(x0+2,y0+2,w/2-3,bh-4)+panel(x0+w/2+1,y0+2,w/2-3,bh-4);
      for(let y=y0+12;y<y0+12+bh*.22;y+=4.5){g+=L(x0+10,y,x0+w/2-10,y,line,1.4)+L(x0+w/2+10,y,x0+w-10,y,line,1.4);}
      g+=pull(x0+w/2-6,y0+bh*.55,3)+pull(x0+w/2+6,y0+bh*.55,3).replace(/width="3"/g,'width="3"'); break;}
    case "shelf":{const th=25*s; const objs=[(x,y)=>`<rect x="${x}" y="${y-22}" width="7" height="22" fill="#6B4A14"/><rect x="${x+8}" y="${y-26}" width="6" height="26" fill="#B3422D"/><rect x="${x+15}" y="${y-19}" width="9" height="19" fill="#C9B79C"/>`,
        (x,y)=>`<ellipse cx="${x+12}" cy="${y-2}" rx="12" ry="3" fill="#000" opacity=".08"/><path d="M${x+4},${y} Q${x+2},${y-16} ${x+12},${y-24} Q${x+22},${y-16} ${x+20},${y} Z" fill="#E8E2D6" stroke="#CFC6B6"/>`,
        (x,y)=>`<rect x="${x}" y="${y-12}" width="16" height="12" fill="#2F5A47"/><path d="M${x+8},${y-12} C${x},${y-30} ${x+4},${y-34} ${x+8},${y-24} C${x+12},${y-34} ${x+18},${y-30} ${x+8},${y-12}" fill="#3E7A5C"/>`];
      [0,.45,.9].forEach((f,i)=>{const yy=y0+(h-th)*f, ww=w*(i===1?.75:1); if(i<3) g+=objs[i](x0+ww*(i===1?.25:.15),yy-oy*.4); g+=box(x0,yy,ww,th);}); break;}

    case "wardrobe":{const kick=50*s, bh=h-kick; g+=box(x0+3,y0+bh,w-6,kick,p.D*.9,shade(base_c,-0.45)); g+=box(x0,y0,w,bh);
      const topH = p.H>2400 ? (p.H-2400)*s : 0; if(topH){g+=L(x0,y0+topH,x0+w,y0+topH,line,1.2);}
      const by=y0+topH, bbh=bh-topH;
      if(V.sliding){const n=Math.max(2,Math.round(p.W/1100)), dw=w/n; for(let i=0;i<n;i++){const dx=x0+i*dw; g+=`<rect x="${dx+(i%2?2:0)}" y="${by+2}" width="${dw-2}" height="${bbh-4}" fill="${V.glass?'#C9D3D6':front}" ${V.glass?'opacity=".85"':''} stroke="${line}" stroke-width=".9"/>`; g+=`<rect x="${dx+(i%2?5:dw-7)}" y="${by+bbh*.35}" width="2.5" height="${bbh*.3}" fill="${metal}"/>`;} g+=L(x0,by+1,x0+w,by+1,metal,2);}
      else {const n=Math.max(2,Math.round(p.W/450)), dw=w/n; for(let i=0;i<n;i++){const dx=x0+i*dw; if(V.glass) g+=`<rect x="${dx+2}" y="${by+2}" width="${dw-4}" height="${bbh-4}" fill="#C9D3D6" opacity=".8"/>`+[.25,.5,.75].map(f=>L(dx+3,by+bbh*f,dx+dw-3,by+bbh*f,shade(base_c,-0.2),1.5)).join(""); g+=panel(dx+1.5,by+1.5,dw-3,bbh-3); const px= i%2? dx+5 : dx+dw-6; g+=`<rect x="${px-1}" y="${by+bbh*.42}" width="2.4" height="${Math.min(40,bbh*.18)}" rx="1" fill="${metal}"/>`;}}
      if(topH){const n=Math.max(2,Math.round(p.W/450)), dw=w/n; for(let i=0;i<n;i++) g+=panel(x0+i*dw+1.5,y0+1.5,dw-3,topH-3);}
      if(V.mirror){const dw=w/Math.max(2,Math.round(p.W/450)); g+=`<rect x="${x0+5}" y="${by+8}" width="${dw-10}" height="${bbh-16}" fill="url(#${id}m)"/>`;}
      if(V.led) g+=`<rect x="${x0}" y="${y0-oy-3}" width="${w+ox}" height="3" fill="#FFD9A0" opacity=".9" filter="url(#${id}gl)"/>`;
      break;}
    case "kitchen":{ // bottom 870 incl. counter, top 700 at 1500–2200
      const bD=600, tD=350, S=s, bot=870*S, cnt=40*S, tY=base-2200*S, tH=700*S;
      const tall = V.tall ? 600*S : 0, rw=w-tall;
      // backsplash
      g+=`<rect x="${x0}" y="${tY+tH}" width="${rw}" height="${base-bot-(tY+tH)}" fill="${V.counterCol? shade(V.counterCol,-0.04):'#E9E5DD'}" opacity=".9"/>`;
      if(V.top!==false) { g+=box(x0,tY,rw,tH,tD); const n=Math.max(2,Math.round(rw/(500*S))), dw=rw/n; for(let i=0;i<n;i++){ if(V.glassTop) g+=`<rect x="${x0+i*dw+4}" y="${tY+4}" width="${dw-8}" height="${tH-8}" fill="#C9D3D6" opacity=".85"/>`; g+=panel(x0+i*dw+1.5,tY+1.5,dw-3,tH-3)+pull(x0+i*dw+dw/2,tY+tH-7,14);} if(V.led) g+=`<rect x="${x0+3}" y="${tY+tH}" width="${rw-6}" height="3" fill="#FFD9A0" filter="url(#${id}gl)"/>`; }
      if(V.bottom!==false){ g+=box(x0,base-bot+cnt,rw,bot-cnt,bD); const n=Math.max(2,Math.round(rw/(500*S))), dw=rw/n;
        for(let i=0;i<n;i++){ const dx=x0+i*dw, yy=base-bot+cnt; if(V.drawers && i%2===0){ for(let k=0;k<3;k++){g+=panel(dx+1.5,yy+1.5+k*(bot-cnt)/3,dw-3,(bot-cnt)/3-3)+pull(dx+dw/2,yy+7+k*(bot-cnt)/3,14);} } else { g+=panel(dx+1.5,yy+1.5,dw-3,bot-cnt-3)+pull(dx+dw/2,yy+7,14);} }
        const cc=V.counterCol||top; const ddx=bD*S*K, ddy=bD*S*KY;
        g+=`<polygon points="${x0-2},${base-bot} ${x0-2+ddx},${base-bot-ddy} ${x0+rw+2+ddx},${base-bot-ddy} ${x0+rw+2},${base-bot}" fill="${shade(cc,0.15)}"/><rect x="${x0-2}" y="${base-bot}" width="${rw+4}" height="${cnt}" fill="${cc}"/>`; }
      if(tall){ g+=box(x0+rw,base-2200*S,tall,2200*S,bD); g+=panel(x0+rw+1.5,base-2200*S+1.5,tall-3,2200*S*.62)+panel(x0+rw+1.5,base-2200*S*.36,tall-3,2200*S*.36-3)+`<rect x="${x0+rw+tall-7}" y="${base-2200*S*.62}" width="2.4" height="30" fill="${metal}"/>`; }
      break;}
    case "feature":{ g+=box(x0,y0,w,h,40);
      const st=V.style||"flat";
      if(st==="fluted"){for(let f=x0+3;f<x0+w-2;f+=4){g+=L(f,y0+2,f,base-2,line,.6)+L(f+1.3,y0+2,f+1.3,base-2,hl,.5);}}
      else if(st==="slats"){g+=`<rect x="${x0}" y="${y0}" width="${w}" height="${h}" fill="${shade(base_c,-0.6)}"/>`; for(let f=x0+1;f<x0+w-3;f+=6){g+=`<rect x="${f}" y="${y0}" width="3.6" height="${h}" fill="url(#${id}g)"/>`;}}
      else if(st==="mirror"){const n=Math.max(2,Math.round(p.W/900)); for(let i=0;i<n;i++) g+=panel(x0+i*w/n+1,y0+1,w/n-2,h-2); g+=`<rect x="${x0+w*.3}" y="${y0+4}" width="${w*.4}" height="${h-8}" fill="url(#${id}m)"/>`;}
      else {const n=Math.max(2,Math.round(p.W/900)); for(let i=0;i<n;i++) g+=panel(x0+i*w/n+1,y0+1,w/n-2,h-2);}
      if(V.door){const dw=900*s, dx=x0+w-dw-8; g+=L(dx,base,dx,base-2100*s,line,1.2)+L(dx+dw,base,dx+dw,base-2100*s,line,1.2)+L(dx,base-2100*s,dx+dw,base-2100*s,line,1.2)+`<rect x="${dx+6}" y="${base-1050*s}" width="2" height="14" fill="${metal}"/>`;}
      // tv
      const tw=Math.min(w*.42,1450*s), th=tw*.56, tx=x0+w*.38-tw/2+ (V.door?0:w*.12), ty=base-1500*s-th/2;
      if(V.ledge) g+=box(tx-tw*.15,base-450*s,tw*1.3,30*s,350,top);
      g+=`<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="2" fill="#1E1C1B"/><rect x="${tx+2}" y="${ty+2}" width="${tw-4}" height="${th-4}" fill="#2C3A40"/>`;
      if(V.led) g+=`<rect x="${x0}" y="${y0}" width="${w}" height="3" fill="#FFD9A0" filter="url(#${id}gl)"/>`;
      break;}
    case "bookshelf":{ g+=box(x0,y0,w,h); const inset=4, bx=x0+inset, bw2=w-inset*2;
      g+=`<rect x="${bx}" y="${y0+inset}" width="${bw2}" height="${h-inset*2}" fill="${shade(base_c,-0.42)}"/>`;
      const rows=Math.max(3,Math.round(p.H/380)), cols=Math.max(1,Math.round(p.W/700)), rh=(h-inset*2)/rows, cw=bw2/cols;
      const lowerDoors=V.lower ? Math.max(1,Math.round(rows*0.3)) : 0;
      for(let r=0;r<rows;r++){ const yy=y0+inset+r*rh;
        for(let c=0;c<cols;c++){ const xx=bx+c*cw;
          if(r>=rows-lowerDoors){ g+=`<rect x="${xx+1}" y="${yy+1}" width="${cw-2}" height="${rh-2}" fill="url(#${id}g)"/>`+panel(xx+1,yy+1,cw-2,rh-2)+pull(xx+cw/2,yy+6,12); continue; }
          const k=(r*3+c*5)%4, by2=yy+rh-3;
          if(k===0) g+=`<rect x="${xx+4}" y="${by2-rh*.6}" width="${cw*.08}" height="${rh*.6}" fill="#6B4A14"/><rect x="${xx+4+cw*.09}" y="${by2-rh*.68}" width="${cw*.07}" height="${rh*.68}" fill="#B3422D"/><rect x="${xx+4+cw*.17}" y="${by2-rh*.55}" width="${cw*.09}" height="${rh*.55}" fill="#C9B79C"/><rect x="${xx+4+cw*.27}" y="${by2-rh*.62}" width="${cw*.06}" height="${rh*.62}" fill="#2F5A47"/>`;
          if(k===1) g+=`<path d="M${xx+cw*.55},${by2} Q${xx+cw*.5},${by2-rh*.45} ${xx+cw*.62},${by2-rh*.62} Q${xx+cw*.74},${by2-rh*.45} ${xx+cw*.69},${by2} Z" fill="#E8E2D6" stroke="#CFC6B6"/>`;
          if(k===2) g+=`<rect x="${xx+cw*.2}" y="${by2-rh*.25}" width="${cw*.5}" height="${rh*.12}" fill="#C9B79C"/><rect x="${xx+cw*.24}" y="${by2-rh*.13}" width="${cw*.42}" height="${rh*.13}" fill="#6B4A14"/>`;
          if(V.led) g+=`<rect x="${xx+2}" y="${yy+1}" width="${cw-4}" height="2" fill="#FFD9A0" filter="url(#${id}gl)"/>`;
        }
        g+=`<rect x="${bx}" y="${yy+rh-3}" width="${bw2}" height="3" fill="${top}"/>`;
      }
      for(let c=1;c<cols;c++) g+=`<rect x="${bx+c*cw-1.5}" y="${y0+inset}" width="3" height="${h-inset*2}" fill="${side}"/>`;
      if(V.glass){ for(let c=0;c<cols;c++){ g+=`<rect x="${bx+c*cw+1}" y="${y0+inset}" width="${cw-2}" height="${(rows-lowerDoors)*rh}" fill="#DDE6E8" opacity=".35" stroke="${metal}" stroke-width="1.2"/>`; } }
      if(V.ladder){ g+=L(x0-2,y0+8,x0+w+2,y0+8,metal,1.6); const lx=x0+w*.62; g+=L(lx,y0+8,lx-22,base,metal,2)+L(lx+22,y0+8,lx,base,metal,2); for(let k=1;k<7;k++){const t=k/7; g+=L(lx-22*t,y0+8+(base-y0-8)*t,lx+22-22*t,y0+8+(base-y0-8)*t,metal,1.4);} }
      break;}
    case "bay":{ // window behind
      const winH=1300*s, winY=base-h-winH-20*s; g+=`<rect x="${x0+4}" y="${winY}" width="${w-8}" height="${winH}" fill="#DCE8EE"/>`; const nm=Math.max(2,Math.round(p.W/900)); for(let i=1;i<nm;i++) g+=L(x0+4+(w-8)*i/nm,winY,x0+4+(w-8)*i/nm,winY+winH,"#9AA9B0",2); g+=`<rect x="${x0+4}" y="${winY}" width="${w-8}" height="${winH}" fill="none" stroke="#9AA9B0" stroke-width="2"/>`;
      if(V.side){const sw=500*s; g+=box(x0-sw,base-2400*s,sw,2400*s,450)+box(x0+w,base-2400*s,sw,2400*s,450);}
      g+=box(x0,y0,w,h); const n=Math.max(2,Math.round(p.W/600)), dw=w/n;
      if(V.liftup){ g+=panel(x0+2,y0+2,w-4,h-4); } else for(let i=0;i<n;i++){g+=panel(x0+i*dw+1.5,y0+h*.18,dw-3,h*.78)+pull(x0+i*dw+dw/2,y0+h*.3,14);}
      if(V.cushion){ const cx=x0+4, cw2=w-8, ch=60*s; g+=`<rect x="${cx}" y="${y0-ch-oy*.4}" width="${cw2}" height="${ch}" rx="${ch/2}" fill="#D9D2C5"/><rect x="${cx+cw2*.08}" y="${y0-ch-oy*.4-90*s}" width="${120*s+20}" height="${90*s+6}" rx="6" fill="#B3422D" opacity=".85"/>`; }
      break;}
  }

  // dimension overlay
  let d="";
  if(dims){
    const dy=y0-oy-16, dx=x0+w+ox+16;
    const tick=(x,y)=>`<line x1="${x-4}" y1="${y+4}" x2="${x+4}" y2="${y-4}"/>`;
    d=`<g stroke="${RED}" fill="none" stroke-width="1" class="dim">
      <line x1="${x0}" y1="${dy}" x2="${x0+w}" y2="${dy}"/>${tick(x0,dy)}${tick(x0+w,dy)}
      <line x1="${x0}" y1="${dy-5}" x2="${x0}" y2="${y0-4}" stroke-opacity=".45"/><line x1="${x0+w}" y1="${dy-5}" x2="${x0+w}" y2="${y0-4}" stroke-opacity=".45"/>
      <line x1="${dx}" y1="${y0}" x2="${dx}" y2="${base}"/>${tick(dx,y0)}${tick(dx,base)}
      <line x1="${dx+5}" y1="${y0}" x2="${x0+w+3}" y2="${y0}" stroke-opacity=".45"/><line x1="${dx+5}" y1="${base}" x2="${x0+w+ox+3}" y2="${base}" stroke-opacity=".45"/>
    </g><g fill="${RED}" font-family="Montserrat,sans-serif" font-size="11" font-weight="600" class="dim">
      <text x="${x0+w/2}" y="${dy-6}" text-anchor="middle">W ${p.W}</text>
      <text x="${dx+8}" y="${(y0+base)/2+4}">H ${p.H}</text>
      <text x="${x0+w+ox/2+6}" y="${y0-oy/2-6}" font-size="9.5" fill-opacity=".8">D ${p.D}</text></g>`;
  }
  const grainLines = Array.from({length:14},(_,i)=>{const y=i*7+2; return `<path d="M0 ${y} C 30 ${y+3}, 60 ${y-3}, 120 ${y+1}" stroke="${shade(base_c,-0.35)}" stroke-width=".6" fill="none" opacity="${(0.25+((i*37)%10)/25).toFixed(2)}"/>`;}).join("");
  return `<svg viewBox="0 0 ${VW} ${VH}" role="img" aria-label="${p.name} in ${FINISHES[finKey].name}, ${p.W} by ${p.D} by ${p.H} millimetres">
  <defs>
    <linearGradient id="${id}g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${shade(base_c,0.12)}"/><stop offset=".55" stop-color="${base_c}"/><stop offset="1" stop-color="${shade(base_c,-0.12)}"/></linearGradient>
    <pattern id="${id}w" width="120" height="98" patternUnits="userSpaceOnUse">${grainLines}</pattern>
    <linearGradient id="${id}f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E7E2D8"/><stop offset="1" stop-color="#F1EEE8"/></linearGradient>
    <linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E9EEF0"/><stop offset=".5" stop-color="#B9C4C9"/><stop offset="1" stop-color="#DDE3E6"/></linearGradient>
    <filter id="${id}gl" x="-10%" y="-400%" width="120%" height="900%"><feGaussianBlur stdDeviation="2.5"/></filter>
    <filter id="${id}b" x="-20%" y="-200%" width="140%" height="500%"><feGaussianBlur stdDeviation="4"/></filter>
  </defs>
  <rect width="${VW}" height="${base}" fill="${opts.bg||"#F4F3EF"}"/>
  <rect y="${base}" width="${VW}" height="${VH-base}" fill="url(#${id}f)"/>
  <line x1="0" y1="${base}" x2="${VW}" y2="${base}" stroke="#D8D4CB"/>
  ${shadow}${g}${d}</svg>`;
}

/* ================= PRICE ESTIMATOR =================
   Internal rates (SGD, before GST). Customers never see these; they only see the final range.
   Based on Singapore market rates, Nov 2026 (laminate on plywood, standard hardware).
   unit "ftrun": foot run (width) x rate x height factor | "sqft": width x height
   Option effects: add = $ per ft run, mult = multiplier, fixed = one-off $, each = $ per unit (counters)
   noMat: true = not affected by the material multiplier (e.g. countertops)
   v = visual flag for the illustration
   ==================================================== */
const PRICING = {
  minJob: 600, spread: 0.10,
  materials:[["Laminate",1],["Wood veneer",1.3]],
  colours:["oak","walnut","teak","blackteak","flat","metal","afp"], colourAdd:{metal:100,afp:100},
  items:{
    wardrobe:{label:"Wardrobe", type:"wardrobe", unit:"ftrun", rate:300, stdH:2440, sheetMax:2440, sheetUp:0.2, topUp:0.12, half:0.6, W:2400, H:2400, D:600, presets:[4,6,8,10],
      opts:[
        {id:"door",label:"Doors",type:"choice",choices:[{l:"Swing"},{l:"Sliding",add:60,v:{sliding:1}},{l:"Glass swing",add:90,v:{glass:1}},{l:"Glass sliding",add:130,v:{sliding:1,glass:1}}]},
        {id:"drw",label:"Drawers",type:"count",each:70,eachExt:110,max:8},
        {id:"dty",label:"Drawer style",type:"choice",choices:[{l:"Internal, behind the doors",v:{drwExt:0}},{l:"External, fronts on the face",v:{drwExt:1}}]},
        {id:"acc",label:"Extras",type:"multi",choices:[{l:"LED strip lighting",add:25,v:{led:1}},{l:"Mirror door panel",fixed:250,v:{mirror:1}},{l:"Pull-out trouser rack",fixed:180},{l:"Jewellery drawer insert",fixed:150}]}
      ]},
    kitchen:{label:"Kitchen cabinets", type:"kitchen", unit:"ftrun", rate:300, fixedH:true, W:3000, H:2300, D:600, stdNote:"Standard heights: 870 mm base with countertop, 700 mm wall cabinets. Blum hardware choices don't change this estimate. We price them in your exact quote.", presets:[8,10,12,14],
      opts:[
        {id:"cfg",label:"Layout",type:"choice",choices:[{l:"Top and bottom"},{l:"Bottom only",mult:0.55,v:{top:false}},{l:"Top only",mult:0.45,v:{bottom:false}}]},
        {id:"ct",label:"Countertop",type:"choice",choices:[{l:"Not needed"},{l:"Compact laminate",add:30,noMat:1,v:{counterCol:"#D9D2C5"}},{l:"Quartz",add:110,noMat:1,v:{counterCol:"#EDEBE6"}},{l:"Sintered stone",add:160,noMat:1,v:{counterCol:"#4A4644"}}]},
        {id:"pd",label:"Drawer stacks",type:"count",each:220,max:4,v:{drawers:1}},
        {id:"kLift",label:"Wall cabinet lift-ups (Blum AVENTOS)",type:"multi",pk:"Lift-up",note:"pick any, priced in your quote",choices:[{l:"HK-XS small stay lift"},{l:"HK-S stay lift"},{l:"HK top stay lift"},{l:"HKi integrated stay lift"},{l:"HF bi-fold lift"},{l:"HS up-and-over lift"},{l:"HL parallel lift"}]},
        {id:"kStd",label:"Standard drawers (Blum TANDEMBOX)",type:"multi",pk:"Standard drawer",note:"pick any, priced in your quote",choices:[{l:"S1 low drawer"},{l:"S2 high drawer, single rail"},{l:"S3 high drawer, double rail"},{l:"S4 high drawer, box cap"}]},
        {id:"kInner",label:"Inner drawers (Blum TANDEMBOX)",type:"multi",pk:"Inner drawer",note:"behind the door, pick any",choices:[{l:"i3 low inner drawer"},{l:"i4 high inner drawer, single rail"},{l:"i5 high inner drawer, double rail"},{l:"i6 high inner drawer, box cap"}]},
        {id:"kSpace",label:"Storage pull-outs (Blum SPACE)",type:"multi",pk:"Storage pull-out",note:"pick any, priced in your quote",choices:[{l:"Space drawer for condiments"},{l:"SPACE TOWER larder pull-out"},{l:"SPACE CORNER"},{l:"SPACE STEP plinth drawer"},{l:"SPACE TWIN"},{l:"Sink cabinet pull-out"}]},
        {id:"kOrg",label:"Organisers and opening",type:"multi",pk:"Hardware",note:"pick any, priced in your quote",choices:[{l:"ORGA-LINE drawer dividers"},{l:"AMBIA-LINE drawer dividers"},{l:"TIP-ON push to open"},{l:"SERVO-DRIVE electric opening"},{l:"BLUMOTION soft-close hinges"},{l:"CABLOXX pull-out power socket"},{l:"LEGRABOX slim drawers"},{l:"MERIVOBOX drawers"}]},
        {id:"kx",label:"Extras",type:"multi",choices:[{l:"Tall appliance unit",fixed:1200,v:{tall:1}},{l:"Glass wall-cabinet doors",add:40,v:{glassTop:1}},{l:"Under-cabinet LED",add:25,v:{led:1}},{l:"Pull-out dish rack",fixed:280}]}
      ]},
    tv:{label:"TV console", type:"console", unit:"ftrun", rate:250, stdH:600, topUp:0.12, half:0.85, W:2100, H:450, D:400, presets:[6,7,8,10],
      opts:[
        {id:"mnt",label:"Mounting",type:"choice",choices:[{l:"Floor standing"},{l:"Floating",add:30,v:{floating:1}}]},
        {id:"bk",label:"Wall panel behind TV",type:"choice",choices:[{l:"None"},{l:"Flat panel",add:90,v:{panel:"flat"}},{l:"Fluted panel",add:140,v:{panel:"fluted"}}]},
        {id:"td",label:"Drawers",type:"count",each:70,max:6},
        {id:"tx",label:"Extras",type:"multi",choices:[{l:"LED strip lighting",add:25,v:{led:1}},{l:"Cable management channel",fixed:120}]}
      ]},
    feature:{label:"Feature wall", type:"feature", unit:"sqft", rate:30, W:3000, H:2700, D:40, presets:[8,10,12],
      opts:[
        {id:"st",label:"Style",type:"choice",choices:[{l:"Flat panels",v:{style:"flat"}},{l:"Fluted",mult:1.25,v:{style:"fluted"}},{l:"Timber slats",mult:1.45,v:{style:"slats"}},{l:"Tinted mirror inlay",mult:1.35,v:{style:"mirror"}}]},
        {id:"fx",label:"Extras",type:"multi",choices:[{l:"Hidden door",fixed:1100,v:{door:1}},{l:"Floating ledge",fixed:350,v:{ledge:1}},{l:"LED cove lighting",addW:25,v:{led:1}}]}
      ]},
    shoe:{label:"Shoe cabinet", type:"shoe", unit:"ftrun", rate:260, stdH:2440, sheetMax:2440, sheetUp:0.2, topUp:0.12, half:0.6, W:900, H:2400, D:350, presets:[3,4,5,6],
      opts:[
        {id:"sx",label:"Extras",type:"multi",choices:[{l:"Bench seat with cushion",fixed:250,v:{bench:1}},{l:"Mirror door",fixed:200,v:{mirror:1}},{l:"Open display niche",fixed:120,v:{niche:1}},{l:"Niche LED lighting",fixed:120,v:{niche:1,nicheLed:1}}]}
      ]},
    bookshelf:{label:"Bookshelf", type:"bookshelf", unit:"ftrun", rate:280, stdH:2440, sheetMax:2440, sheetUp:0.2, topUp:0.12, half:0.6, W:1800, H:2400, D:350, presets:[4,6,8,10],
      opts:[
        {id:"bd",label:"Doors",type:"choice",choices:[{l:"Open shelves"},{l:"Glass doors",add:80,v:{glass:1}},{l:"Closed lower cabinets",add:40,v:{lower:1}}]},
        {id:"bx",label:"Extras",type:"multi",choices:[{l:"LED shelf lighting",add:30,v:{led:1}},{l:"Library ladder and rail",fixed:450,v:{ladder:1}}]}
      ]},
    study:{label:"Study table", type:"desk", unit:"ftrun", rate:180, fixedH:true, W:1500, H:750, D:600, stdNote:"Standard desk height of 750 mm.", presets:[4,5,6,8],
      opts:[
        {id:"sp",label:"Storage under the desk",type:"choice",choices:[{l:"3-drawer pedestal"},{l:"Open legs only",add:-40,v:{pedestal:false}}]},
        {id:"so",label:"Above the desk",type:"choice",choices:[{l:"Nothing"},{l:"Open shelf",add:90,v:{shelf:"open"}},{l:"Overhead cabinet",add:140,v:{shelf:"cabinet"}}]},
        {id:"sx",label:"Extras",type:"multi",choices:[{l:"Cable tray and grommets",fixed:80,v:{cable:1}},{l:"Pegboard back panel",add:40,v:{peg:1}}]}
      ]},
    bay:{label:"Bay window platform", type:"bay", unit:"ftrun", rate:220, fixedH:true, W:2000, H:450, D:600, viewH:2000, stdNote:"Standard platform height of 450 mm.", presets:[5,6,7,8],
      opts:[
        {id:"bs",label:"Storage",type:"choice",choices:[{l:"Drawers"},{l:"Lift-up top",add:-30,v:{liftup:1}}]},
        {id:"bx",label:"Extras",type:"multi",choices:[{l:"Seat cushion",add:45,noMat:1,v:{cushion:1}},{l:"Full-height side cabinets",fixed:900,v:{side:1}}]}
      ]}
  }
};
const MM_PER_FT=304.8;
let est={item:"wardrobe", mat:0, col:"oak", opt:{}};
const toMM=(v,u=$("#eU").value)=>{const n=parseFloat(String(v).replace(/,/g,"")); if(!isFinite(n))return NaN; return u==="mm"?n:u==="cm"?n*10:n*MM_PER_FT;};
const fromMM=(mm,u=$("#eU").value)=>u==="mm"?Math.round(mm):u==="cm"?Math.round(mm/10):+(mm/MM_PER_FT).toFixed(1);
const round50=n=>Math.round(n/50)*50;
const fmtSize=mm=>$("#eU").value==="ft"?`${(mm/MM_PER_FT).toFixed(1)} ft`:`${Math.round(mm).toLocaleString("en-SG")} mm`;

function estPiece(k, W, H, col, v){ const it=PRICING.items[k]; return {type:it.type,name:it.label,W:Math.round(W),H:Math.round(H),D:it.D,fin:[col]}; }
const TILE_NOTE={wardrobe:"Swing or sliding doors",kitchen:"Top and bottom cabinets",tv:"Console and panel",feature:"Fluted, slatted, mirror",shoe:"Entryway storage",bookshelf:"Floor to ceiling",study:"Desk, shelf, storage",bay:"Seating with storage"};
function estItems(){
  $("#estItems").innerHTML=Object.entries(PRICING.items).map(([k,it])=>
    `<button type="button" class="tile" data-item="${k}" aria-pressed="${k===est.item}"><strong>${it.label}</strong><small>${TILE_NOTE[k]||""}</small></button>`).join("");
}
function optDefaults(){ const it=PRICING.items[est.item]; est.opt={}; it.opts.forEach(o=>{est.opt[o.id]= o.type==="choice"?0 : o.type==="count"?0 : []}); }
function estOpts(){
  const it=PRICING.items[est.item];
  const rend=o=>{
    if(o.type==="choice") return `<div class="og"><div class="og-l">${o.label}</div><div class="chipset">${o.choices.map((c,i)=>`<label><input type="radio" name="o_${o.id}" data-opt="${o.id}" value="${i}"${est.opt[o.id]===i?" checked":""}>${c.l}</label>`).join("")}</div></div>`;
    if(o.type==="multi") return `<div class="og"><div class="og-l">${o.label} <em>(${o.note||"pick any"})</em></div><div class="chipset">${o.choices.map((c,i)=>`<label><input type="checkbox" data-opt="${o.id}" value="${i}"${est.opt[o.id].includes(i)?" checked":""}><span class="tick" aria-hidden="true"></span>${c.l}</label>`).join("")}</div></div>`;
    if(o.type==="count") return `<div class="og"><div class="og-l">${o.label}</div><div class="counter"><button type="button" data-cnt="${o.id}" data-d="-1" aria-label="Fewer ${o.label.toLowerCase()}">−</button><output id="cnt_${o.id}">${est.opt[o.id]}</output><button type="button" data-cnt="${o.id}" data-d="1" aria-label="More ${o.label.toLowerCase()}">+</button></div></div>`;
  };
  let htm="",hw="",hwN=0;
  it.opts.forEach(o=>{ if(o.pk && o.pk!=="Extra"){ hw+=rend(o); hwN+=(est.opt[o.id]||[]).length; } else { if(hw){ htm+=`<details class="hw"${hwN?" open":""}><summary>Blum hardware options <em>(optional${hwN?", "+hwN+" selected":""})</em></summary>${hw}</details>`; hw=""; } htm+=rend(o); } });
  if(hw) htm+=`<details class="hw"${hwN?" open":""}><summary>Blum hardware options <em>(optional${hwN?", "+hwN+" selected":""})</em></summary>${hw}</details>`;
  $("#estOpts").innerHTML=htm;
  $("#eHField").style.display=it.fixedH?"none":"";
  $("#eStd").textContent=it.stdNote||"";
  $("#eSizeHint").textContent= it.unit==="sqft" ? "Measure the wall area to cover" : "Measure the wall length it runs along";
  $("#ePresets").innerHTML = `<span>Quick widths:</span>`+it.presets.map(f=>`<button type="button" data-pre="${f}">${f} ft</button>`).join("");
}
/* One colour as a swatch card: the colour with its code in the corner, then its name and a short note. */
function swatch(c,on){
  const f=FINISHES[c], hex=(f.fc||f.c).toUpperCase(), n=parseInt(hex.slice(1),16);
  const dark=((n>>16)*299+(n>>8&255)*587+(n&255)*114)/1000<140; // dark colours get a white code
  return `<button type="button" class="sw${dark?" sw--dark":""}" data-col="${c}" aria-pressed="${!!on}"><span class="sw-c" style="background:${f.c}"><span class="sw-hex">${hex}</span></span><span class="sw-m"><b>${f.name}</b><small>${f.note}</small>${f.tag?`<em class="ctag">${f.tag}</em>`:""}</span></button>`;
}
function estFinish(){
  $("#eMat").innerHTML=PRICING.materials.map(([n],i)=>`<label><input type="radio" name="emat" value="${i}"${i===est.mat?" checked":""}>${n}</label>`).join("");
  $("#eCol").innerHTML=PRICING.colours.map(c=>swatch(c,c===est.col)).join("");
  $("#eColName").textContent=FINISHES[est.col].name+" · "+FINISHES[est.col].note;
}
let lastEst=null, S3=null, S3off=null, S3fail=false, S3item=null, S3t=0;
function est3dOpts(k,W,H,v){
  const m=W/1000,h=H/1000,o=est.opt;
  switch(k){
    case "wardrobe": return ["wardrobe",{W:m,H:h,doors:v.sliding?"sliding":"swing",glass:!!v.glass,mirror:!!v.mirror,led:!!v.led,drawers:o.drw||0,ext:!!v.drwExt}];
    case "kitchen": return ["kitchen",{W:m,top:v.top!==false,bottom:v.bottom!==false,counter:({"#D9D2C5":"laminate","#EDEBE6":"quartz","#4A4644":"sintered"})[v.counterCol]||"none",drawerStacks:o.pd||0,tall:!!v.tall,glassTop:!!v.glassTop,led:!!v.led}];
    case "tv": return ["tv",{W:m,floating:!!v.floating,panel:v.panel||"none",drawers:o.td||0,led:!!v.led}];
    case "feature": return ["feature",{W:m,H:h,style:v.style||"flat",door:!!v.door,ledge:!!v.ledge,led:!!v.led}];
    case "shoe": return ["shoe",{W:m,H:h,bench:!!v.bench,mirror:!!v.mirror,niche:!!v.niche,nicheLed:!!v.nicheLed}];
    case "bookshelf": return ["bookshelf",{W:m,H:h,glass:!!v.glass,lower:!!v.lower,led:!!v.led,ladder:!!v.ladder}];
    case "study": return ["study",{W:m,pedestal:v.pedestal!==false,shelf:v.shelf||"none",cable:!!v.cable,peg:!!v.peg}];
    case "bay": return ["bay",{W:m,liftup:!!v.liftup,cushion:!!v.cushion,side:!!v.side}];
  }
}
function est3d(k,W,H,v,sizeTxt){
  if(S3fail||!window.M2D3D) return false;
  try{
    if(!S3){ S3off=document.createElement("canvas"); const sharp=(devicePixelRatio||1)>1&&!matchMedia("(pointer:coarse)").matches; S3=M2D3D.createStudio(S3off,sharp?1280:960,sharp?960:720,{shadow:2048,ao:!matchMedia("(pointer:coarse)").matches}); /* sharper picture on laptop screens */ }
    let cv=$("#eCanvas");
    if(!cv){
      $("#eDraw").innerHTML='<div class="viz3d"><canvas id="eCanvas" width="'+S3off.width+'" height="'+S3off.height+'" role="img" aria-label="Preview of your piece. Drag to rotate."></canvas><span class="dim3d" id="eDim"></span><span class="hint3d">Drag to rotate</span></div>';
      cv=$("#eCanvas"); let dr=null;
      cv.addEventListener("pointerdown",e=>{dr={x:e.clientX,y:e.clientY};cv.setPointerCapture(e.pointerId);});
      cv.addEventListener("pointermove",e=>{ if(!dr)return; S3.orbit(-(e.clientX-dr.x)*.35,(e.clientY-dr.y)*.15); dr={x:e.clientX,y:e.clientY}; S3.quickTo(cv); });
      const end=()=>{ if(dr){dr=null; S3.progressive(cv,14);} }; cv.addEventListener("pointerup",end); cv.addEventListener("pointercancel",end);
    }
    $("#eDim").textContent=sizeTxt;
    if(S3item!==k){ S3.resetView(); S3item=k; }
    const [n,o]=est3dOpts(k,W,H,v); S3.show(n,o,est.col);
    clearTimeout(S3t); S3.quickTo(cv); S3t=setTimeout(()=>S3.progressive(cv,14),120);
    return true;
  }catch(e){ S3fail=true; return false; }
}
function estCalc(){
  const it=PRICING.items[est.item], W=toMM($("#eW").value), H=it.fixedH?it.H:toMM($("#eH").value);
  let err="";
  if(!(W>=300&&W<=12000)) err="Enter a width between 300 mm and 12,000 mm (about 1 to 39 ft).";
  else if(!it.fixedH && !(H>=300&&H<=3600)) err="Enter a height between 300 mm and 3,600 mm (about 1 to 12 ft).";
  $("#eErr").textContent=err;
  if(err){$("#ePrice").textContent="–";$("#eSub").textContent="Check the size to see a price";$("#eBreak").innerHTML="";$("#eQuote").disabled=true;lastEst=null;return;}
  $("#eQuote").disabled=false;
  $("#eStd").textContent=(it.sheetMax&&H>3050)?"Taller than 10 ft (3,050 mm): the biggest laminate sheet is 4′ × 10′, so panels are joined. We'll confirm the price after measuring.":(it.sheetMax&&H>it.sheetMax)?"Taller than 8 ft (2,440 mm): this needs 4′ × 10′ laminate and plywood sheets, so there is an extra charge. Prices up to 8 ft use standard 4′ × 8′ sheets.":(it.stdNote||"");
  $("#eStd").style.color=(it.sheetMax&&H>it.sheetMax)?"var(--red)":"";
  const ft=Math.ceil((W/MM_PER_FT)*2)/2, wFt=W/MM_PER_FT;
  let rate=it.rate, mult=1, fixed=0, noMatPerFt=0, v={}, picked=[];
  let qty = it.unit==="sqft" ? Math.ceil(wFt*(H/MM_PER_FT)) : ft;
  let hf=1, hNote="Standard height";
  if(it.unit==="ftrun" && !it.fixedH){
    if(H<=it.stdH*0.5){hf=it.half;hNote="Half height";}
    else if(H>it.stdH){
      if(it.sheetMax){ const over=H>3050?Math.ceil((H-3050)/MM_PER_FT*2)/2:0; hf=1+(it.sheetUp||0)+over*it.topUp; hNote=H>3050?"Over 10 ft, joined panels":"Over 8 ft, 4′ × 10′ sheets"; }
      else { const extra=Math.ceil((H-it.stdH)/MM_PER_FT*2)/2; hf=1+extra*it.topUp; hNote="Extra tall, with top cabinets"; } }
  }
  const apply=(c)=>{ if(c.add){ if(c.noMat) noMatPerFt+=c.add; else rate+=c.add; } if(c.addW) fixed+=c.addW*Math.ceil(wFt); if(c.mult) mult*=c.mult; if(c.fixed) fixed+=c.fixed; if(c.v) Object.assign(v,c.v); };
  it.opts.forEach(o=>{
    if(o.type==="choice"){const c=o.choices[est.opt[o.id]]; apply(c); if(est.opt[o.id]!==0 || o.choices.length) picked.push([o.label,c.l]);}
    if(o.type==="multi"){ est.opt[o.id].forEach(i=>{apply(o.choices[i]); picked.push([o.pk||"Extra",o.choices[i].l,"m"]);}); }
    if(o.type==="count" && est.opt[o.id]>0){ fixed+=((v.drwExt&&o.eachExt)?o.eachExt:o.each)*est.opt[o.id]; if(o.v) Object.assign(v,o.v); picked.push([o.label,String(est.opt[o.id])]); }
  });
  const matM=PRICING.materials[est.mat][1];
  const cm=(PRICING.colourAdd[est.col]||0);
  const carp = (it.unit==="sqft" ? qty*it.rate*mult*matM : qty*rate*hf*mult*matM) + cm*ft;
  let total = carp + fixed + noMatPerFt*ft;
  total=Math.max(PRICING.minJob,total);
  const lo=round50(total*(1-PRICING.spread)), hi=round50(total*(1+PRICING.spread));
  $("#ePrice").textContent=`${money(lo)} – ${money(hi)}`; $("#eBarPrice").textContent=$("#ePrice").textContent;
  const sizeTxt = it.fixedH ? `${fmtSize(W)} wide` : `${fmtSize(W)} × ${fmtSize(H)}`;
  $("#eSub").textContent = it.unit==="sqft" ? `${it.label}, ${qty} sq ft` : `${it.label}, ${ft} ft run`;
  // group extras into one line
  const rows=[["Size",sizeTxt + (it.unit==="ftrun"&&!it.fixedH&&hNote!=="Standard height"?` · ${hNote.toLowerCase()}`:"")]];
  const extras=picked.filter(r=>r[0]==="Extra").map(r=>r[1]);
  picked.filter(r=>r[2]!=="m").forEach(r=>rows.push(r));
  const grpd={}; picked.filter(r=>r[2]==="m"&&r[0]!=="Extra").forEach(r=>{(grpd[r[0]]=grpd[r[0]]||[]).push(r[1]);});
  Object.entries(grpd).forEach(([k,v])=>rows.push([k,v.join(", ")]));
  if(extras.length) rows.push(["Extras",extras.join(", ")]);
  rows.push(["Finish",`${PRICING.materials[est.mat][0]}, ${FINISHES[est.col].name}${cm?" (higher-cost finish)":""}`]);
  $("#eBreak").innerHTML=rows.map(([a,b])=>`<div><dt>${a}</dt><dd>${b}</dd></div>`).join("");
  if(!est3d(est.item,W,H,v,sizeTxt)) $("#eDraw").innerHTML=drawing(estPiece(est.item,W,H,est.col),{finish:est.col,dims:true,v,viewH:v.side?2600:it.viewH,padW:v.side?1100:0,bg:"#FFFFFF"});
  lastEst={it,W,H,lo,hi,rows}; renderQEst();
  $("#eWa").href="https://wa.me/6598221113?text="+encodeURIComponent(`Hi M2D, I'd like a quote.\nOnline estimate: ${it.label}, ${money(lo)} – ${money(hi)} (before GST).\n`+rows.map(r=>`${r[0]}: ${r[1]}`).join("\n"));
}
function estSetItem(k){
  est.item=k; optDefaults(); const it=PRICING.items[k];
  $("#eW").value=fromMM(it.W); $("#eH").value=fromMM(it.H);
  [...document.querySelectorAll("#estItems .tile")].forEach(t=>t.setAttribute("aria-pressed",t.dataset.item===k));
  estOpts(); estCalc();
}
/* ── For the small calculator on Home: the same sum as estCalc() with every option left at its first choice. ── */
function quickPrice(key, W, H, col, mat=0){
  const it=PRICING.items[key]; if(!it) return null; if(it.fixedH) H=it.H;
  const ft=Math.ceil((W/MM_PER_FT)*2)/2, wFt=W/MM_PER_FT;
  let rate=it.rate, mult=1, fixed=0, noMatPerFt=0, v={};
  const qty = it.unit==="sqft" ? Math.ceil(wFt*(H/MM_PER_FT)) : ft;
  let hf=1;
  if(it.unit==="ftrun" && !it.fixedH){
    if(H<=it.stdH*0.5) hf=it.half;
    else if(H>it.stdH){
      if(it.sheetMax){ const over=H>3050?Math.ceil((H-3050)/MM_PER_FT*2)/2:0; hf=1+(it.sheetUp||0)+over*it.topUp; }
      else { const extra=Math.ceil((H-it.stdH)/MM_PER_FT*2)/2; hf=1+extra*it.topUp; } }
  }
  it.opts.forEach(o=>{ if(o.type!=="choice") return; const c=o.choices[0];
    if(c.add){ if(c.noMat) noMatPerFt+=c.add; else rate+=c.add; } if(c.mult) mult*=c.mult; if(c.fixed) fixed+=c.fixed; if(c.v) Object.assign(v,c.v); });
  const matM=PRICING.materials[mat][1], cm=(PRICING.colourAdd[col]||0);
  const carp = (it.unit==="sqft" ? qty*it.rate*mult*matM : qty*rate*hf*mult*matM) + cm*ft;
  const total=Math.max(PRICING.minJob, carp + fixed + noMatPerFt*ft);
  return {lo:round50(total*(1-PRICING.spread)), hi:round50(total*(1+PRICING.spread)), ft, qty, v, H};
}
window.M2DPrice={ PRICING, FIN:FINISHES, swatch, quick:quickPrice, view:(key,W,H,v)=>est3dOpts(key,W,H,v||{}) };
if(!$("#estItems")) return; // not the Carpentry page: only the price sum above is needed

$("#estItems").addEventListener("click",e=>{const b=e.target.closest("[data-item]");if(b)estSetItem(b.dataset.item)});
$("#estOpts").addEventListener("change",e=>{
  const t=e.target, id=t.dataset.opt; if(!id) return;
  if(t.type==="radio") { est.opt[id]=+t.value; if(id==="dty" && est.opt.drw===0 && est.opt.dty===1){ est.opt.drw=2; const o=$("#cnt_drw"); if(o) o.textContent=2; } }
  else { const i=+t.value, arr=est.opt[id]; if(t.checked){ if(!arr.includes(i)) arr.push(i);} else est.opt[id]=arr.filter(x=>x!==i); }
  estCalc();
});
$("#estOpts").addEventListener("click",e=>{const b=e.target.closest("[data-cnt]"); if(!b)return; const o=PRICING.items[est.item].opts.find(x=>x.id===b.dataset.cnt);
  est.opt[o.id]=Math.max(0,Math.min(o.max,est.opt[o.id]+(+b.dataset.d))); $("#cnt_"+o.id).textContent=est.opt[o.id]; estCalc();});
$("#ePresets").addEventListener("click",e=>{const b=e.target.closest("[data-pre]"); if(!b)return; $("#eW").value=fromMM(+b.dataset.pre*MM_PER_FT); estCalc();});
$("#eMat").addEventListener("change",e=>{est.mat=+e.target.value; estCalc();});
$("#eCol").addEventListener("click",e=>{const b=e.target.closest("[data-col]"); if(!b)return; est.col=b.dataset.col; estFinish(); estCalc();});
["#eW","#eH"].forEach(id=>$(id).addEventListener("input",estCalc));
let prevU="mm";
$("#eU").addEventListener("change",()=>{
  const nu=$("#eU").value; const conv=v=>{const mm=toMM(v,prevU); return isFinite(mm)?fromMM(mm,nu):v;};
  $("#eW").value=conv($("#eW").value); $("#eH").value=conv($("#eH").value); prevU=nu; estCalc();
});

/* ── Hooks for this site (his page tied these to its own quote form) ── */
function renderQEst(){}
// "Get an exact quote for this" carries the estimate into the quote form, as on his page.
$("#eQuote").onclick=()=>{ if(!lastEst) return;
  if(window.M2DQuote) M2DQuote({item:est.item,label:lastEst.it.label,lo:lastEst.lo,hi:lastEst.hi,rows:lastEst.rows,W:lastEst.W,H:lastEst.it.fixedH?0:lastEst.H});
  else window.open($("#eWa").href,"_blank","noopener"); };
optDefaults(); estItems(); estOpts(); estFinish();
$("#eW").value=fromMM(PRICING.items[est.item].W); $("#eH").value=fromMM(PRICING.items[est.item].H); estCalc();
window.M2DCalc={ setItem:(k)=>{ if(PRICING.items[k]) estSetItem(k); }, recalc:estCalc, items:Object.keys(PRICING.items) };
})();
