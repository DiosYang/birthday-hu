import { decorations } from './decorations.js?v=7ec1c8e3d3';
// A static, local-first travel journal. Photos and text are supplied in config.js.
const $ = id => document.getElementById(id);
const route = [{x:307,y:100},{x:263,y:129},{x:209,y:215},{x:247,y:405}];
const segments=['M307 100 Q286 98 263 129','M263 129 Q206 150 209 215','M209 215 C149 302 197 370 247 405'];
const landAsia='M37 30H361L360 60 345 72 351 88 329 96 314 112 309 128 292 142 281 160 260 162 244 180 231 198 229 218 216 241 213 262 202 264 190 238 185 217 167 205 155 186 143 180 127 155 100 147 87 119 63 112 51 80Z';
const landAustralia='M238 350 258 344 268 325 279 332 294 351 321 359 338 385 346 411 330 437 301 445 280 432 255 435 233 421 223 392 228 367Z';
const lineArt={
  shanghai:'<path d="M30 165H330M52 165V105H88V165M57 105V88H82V105M116 165V122H155V165M175 165V83H217V165M233 165V62H263V165M237 62L248 34 259 62M285 165V103H313V165M185 83V62H206V83M15 185Q70 169 125 185T235 185T345 185"/><circle cx="248" cy="81" r="16"/><path d="M248 5V34M248 98V129M27 215Q87 195 147 211T280 209"/>',
  jingdezhen:'<path d="M18 152L85 114 138 151 201 109 268 145 342 111M22 171H339M118 85C94 96 119 119 108 143S107 189 132 195H226C251 188 245 162 236 143S241 96 218 85M138 62V85H198V62M132 62H204M116 153Q171 128 234 154M113 171Q172 145 239 170M133 113Q171 99 216 112"/><path d="M59 191V143H83V191M46 146L71 126 94 146M275 193V146H306V193M262 149L290 126 317 149"/>',
  vietnam:'<path d="M24 182H336M35 144Q182 50 326 144ZM73 133V181M287 133V181M98 104Q182 151 263 105M158 81L182 33 205 81M182 33V141M104 201Q158 181 211 201T325 201M47 219Q100 204 151 218T260 218"/><path d="M42 68C16 46 24 25 41 22 61 17 70 43 42 68ZM279 60C262 42 267 26 281 25 299 24 303 44 279 60Z"/>',
  'western-australia':'<path d="M16 157Q90 111 159 145T343 145M18 193Q96 175 172 191T344 188M189 156L272 74 331 152M231 117L272 74 283 124M79 170V85M78 102Q45 58 29 91M79 112Q109 57 132 90M80 89Q82 53 59 49M30 91Q60 83 77 107M131 90Q100 84 80 113"/><circle cx="185" cy="54" r="24"/><path d="M18 212Q98 196 178 212T340 212"/>'
};
function illustration(id){return `<svg viewBox="0 0 360 240" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${lineArt[id]||lineArt.shanghai}</g></svg>`;}
function mapMarkup(stops){
  return `<svg class="journey-map" viewBox="0 0 400 480" role="img" aria-label="上海周边、景德镇、越南、西澳的四站旅行路线示意">
    <defs><pattern id="map-grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#ede3cc" stroke-opacity=".08"/></pattern></defs>
    <rect width="400" height="480" fill="url(#map-grid)"/><g class="map-land"><path d="${landAsia}"/><path d="${landAustralia}"/><path d="M233 279Q262 290 284 282M287 288L306 292M322 300L342 298" fill="none"/></g>
    <text x="50" y="288" class="ocean-label">INDIAN OCEAN</text><text x="292" y="240" class="ocean-label" transform="rotate(90 292 240)">A LITTLE FURTHER</text>
    ${segments.map((d,i)=>`<path class="map-route" data-segment="${i}" d="${d}"/>`).join('')}
    ${route.map((p,i)=>`<g class="map-pin" data-pin="${i}" transform="translate(${p.x} ${p.y})"><circle class="pin-halo" r="13"/><circle class="pin-dot" r="4"/><text x="${i===0?15:i===1?-16:17}" y="${i===1?18:5}" text-anchor="${i===1?'end':'start'}">${stops[i].name}</text></g>`).join('')}
    <text x="27" y="453" class="schematic-label">旅行路线示意 · 四站，慢慢走</text>
  </svg>`;
}
export function createTravelJournal({stops,name,age,onOpen,onProgress}){
  const modal=$('travel-journal'),viewer=$('photo-viewer');
  let active=0,furthest=0,photo=0,finished=false;
  const storageKey=`birthday-travel-${name}-${age}-v1`;
  try {const saved=JSON.parse(localStorage.getItem(storageKey)||'null');if(saved){furthest=Math.max(0,Math.min(3,Number(saved.furthest)||0));active=furthest;finished=!!saved.finished&&furthest===3;}}catch{}
  $('travel-route').innerHTML=mapMarkup(stops);
  const tabs=$('travel-stops');
  stops.forEach((stop,i)=>{
    const b=document.createElement('button');b.type='button';b.dataset.stop=i;
    const number=document.createElement('span');number.className='stop-number';number.textContent=String(i+1).padStart(2,'0');
    const text=document.createElement('span');text.textContent=stop.name;
    const meta=document.createElement('small');meta.textContent=stop.kicker;
    text.append(meta);b.append(number,text);tabs.append(b);
    b.onclick=()=>{if(i<=furthest){active=i;photo=0;render();}};
  });
  function save(){try{localStorage.setItem(storageKey,JSON.stringify({furthest,finished}));}catch{}}
  function renderPhoto(){
    const stop=stops[active],photos=stop.photos||[],entry=photos[photo],area=$('travel-photo');area.replaceChildren();
    const art=document.createElement('div');art.className='postcard-art';art.innerHTML=illustration(stop.id);
    const text=document.createElement('span');text.className='photo-placeholder';text.textContent=entry?.src?'这张照片暂时没有找到':'把这一站的照片，留在这里';art.append(text);
    if(entry?.src){
      const image=document.createElement('img');image.alt=entry.alt||entry.caption||`${stop.name}旅行照片`;image.src=entry.src;image.decoding='async';
      image.onerror=()=>area.replaceChildren(art);const open=document.createElement('button');open.className='photo-open';open.type='button';open.setAttribute('aria-label','放大查看当前照片');open.append(image);open.onclick=()=>{renderViewer();viewer.showModal();};area.append(open);
    }else area.append(art);
    $('travel-caption').textContent=entry?.caption||stop.photoNote;
    $('travel-photo-count').textContent=photos.length?`${photo+1} / ${photos.length}`:'等待收藏 · 这一站的照片';
    const thumbs=$('travel-thumbs');thumbs.replaceChildren();
    if(photos.length>1)photos.forEach((p,i)=>{const b=document.createElement('button');b.type='button';b.setAttribute('aria-label',`查看${stop.name}第${i+1}张照片`);b.setAttribute('aria-pressed',String(i===photo));const img=document.createElement('img');img.src=p.src;img.alt='';img.loading='lazy';b.append(img);b.onclick=()=>{photo=i;renderPhoto();};thumbs.append(b);});
  }
  function render(){
    const stop=stops[active];modal.style.setProperty('--station-color',stop.color);modal.dataset.station=stop.id;
    $('travel-count').textContent=`${String(active+1).padStart(2,'0')} / 04`;
    $('travel-place').textContent=stop.name;$('travel-english').textContent=stop.english;
    $('travel-title').textContent=stop.title;$('travel-description').textContent=stop.description;
    $('travel-stamp').textContent=stop.stamp;
    $('station-decor').innerHTML=(decorations[stop.id]||[]).map(d=>`<span class="station-sticker" title="${d.name}">${d.art}<small>${d.name}</small></span>`).join('');
    tabs.querySelectorAll('button').forEach((b,i)=>{b.disabled=i>furthest;b.setAttribute('aria-current',i===active?'step':'false');b.setAttribute('aria-label',`${stops[i].name}${i>furthest?'，随旅程逐站开启':''}`);});
    $('travel-route').querySelectorAll('[data-segment]').forEach((p,i)=>p.classList.toggle('lit',i<furthest));
    $('travel-route').querySelectorAll('[data-pin]').forEach((p,i)=>{p.classList.toggle('visited',i<=furthest);p.classList.toggle('current',i===active);});
    $('travel-progress').textContent=`${furthest+1} / 4 站已点亮`;
    $('travel-prev').disabled=active===0;$('travel-next').textContent=active<3?`下一站 · ${stops[active+1].name}`:(finished?'重读给27岁的信':'收下27岁的祝福');
    $('travel-finale').hidden=true;renderPhoto();onProgress?.(furthest);
  }
  function renderViewer(){const stop=stops[active],entry=stop.photos[photo];$('viewer-image').src=entry.src;$('viewer-image').alt=entry.alt||entry.caption;$('viewer-caption').textContent=`${entry.caption} · ${photo+1} / ${stop.photos.length}`;$('viewer-prev').disabled=photo===0;$('viewer-next').disabled=photo===stop.photos.length-1;}
  function turnPhoto(delta){const photos=stops[active].photos;if(photo+delta<0||photo+delta>=photos.length)return;photo+=delta;renderViewer();renderPhoto();}
  $('viewer-close').onclick=()=>viewer.close();$('viewer-prev').onclick=()=>turnPhoto(-1);$('viewer-next').onclick=()=>turnPhoto(1);
  viewer.addEventListener('keydown',e=>{if(e.code==='ArrowLeft'){e.preventDefault();turnPhoto(-1);}if(e.code==='ArrowRight'){e.preventDefault();turnPhoto(1);}});
  $('travel-prev').onclick=()=>{if(active>0){active--;photo=0;render();}};
  $('travel-next').onclick=()=>{
    if(active<3){active++;furthest=Math.max(furthest,active);photo=0;save();render();}
    else {finished=true;save();$('travel-finale-title').textContent=`${name}，${age}岁生日快乐。`;$('travel-finale').hidden=false;$('travel-finale').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'nearest'});$('travel-next').textContent='重读给27岁的信';}
  };
  $('travel-close').onclick=()=>modal.close();
  modal.addEventListener('click',e=>{if(e.target===modal){const r=modal.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)modal.close();}});
  render();
  return {open(){onOpen?.();render();modal.showModal();},get isOpen(){return modal.open;}};
}

// Canvas artwork for the physical map on the left wall. No remote map service.
export function paintWallMap(canvas,furthest=0){
  canvas.width=840;canvas.height=1000;const c=canvas.getContext('2d');
  c.fillStyle='#f1e6cd';c.fillRect(0,0,840,1000);c.strokeStyle='#b4a283';c.lineWidth=2;c.strokeRect(30,30,780,940);
  c.fillStyle='#7b674d';c.font='19px sans-serif';c.textAlign='center';c.fillText('THE PLACES WE KEEP',420,84);
  c.fillStyle='#413d36';c.font='38px "Songti SC",serif';c.fillText('把世界，慢慢走成回忆',420,144);
  c.save();c.translate(105,176);c.scale(1.6,1.6);
  c.fillStyle='#e0dbc7';c.strokeStyle='#c5b99d';c.lineWidth=1;
  for(const d of [landAsia,landAustralia]){const path=new Path2D(d);c.fill(path);c.stroke(path);}
  c.setLineDash([4,5]);c.strokeStyle='#b5a17f';segments.forEach((d,i)=>{c.lineWidth=i<furthest?2.2:1;c.strokeStyle=i<furthest?'#936a43':'#b7aa91';c.stroke(new Path2D(d));});c.setLineDash([]);
  c.font='18px "PingFang SC",sans-serif';route.forEach((p,i)=>{c.fillStyle=i<=furthest?'#a4664c':'#a29a83';c.beginPath();c.arc(p.x,p.y,5,0,Math.PI*2);c.fill();c.textAlign=i===1?'right':'left';c.fillText(['上海周边','景德镇','越南','西澳'][i],p.x+(i===1?-12:14),p.y+(i===1?24:4));});
  c.restore();c.textAlign='center';c.fillStyle='#7b674d';c.font='22px "Songti SC",serif';c.fillText('从熟悉的街角，到更远的世界',420,936);
}
