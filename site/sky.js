// Procedural night sky and particles. All artwork is drawn locally, with no CDN.
export function createNightSky({name,age,onClose}){
 const panel=document.getElementById('night-sky'),canvas=document.getElementById('sky-canvas'),ctx=canvas.getContext('2d');
 const subtitle=document.getElementById('sky-subtitle'),toggle=document.getElementById('sky-pause');
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 let open=false,paused=false,frame=0,last=0,elapsed=0,index=0,particles=[],rockets=[],W=0,H=0,bg,events=[];
 const colors=['#e8c78e','#d4b1ee','#99dce5','#bce1ba','#eab5d1'];
 let seed=72917;function random(){seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;}
 function hash(x,y){const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);}
 function noise(x,y){const X=Math.floor(x),Y=Math.floor(y),a=x-X,b=y-Y,u=a*a*(3-2*a),v=b*b*(3-2*b);return (hash(X,Y)*(1-u)+hash(X+1,Y)*u)*(1-v)+(hash(X,Y+1)*(1-u)+hash(X+1,Y+1)*u)*v;}
 function background(){
  bg=document.createElement('canvas');bg.width=W;bg.height=H;const b=bg.getContext('2d');
  const low=document.createElement('canvas');low.width=480;low.height=Math.max(240,Math.round(480*H/W));const l=low.getContext('2d'),im=l.createImageData(low.width,low.height);
  for(let y=0;y<low.height;y++)for(let x=0;x<low.width;x++){
   const nx=x/low.width,ny=y/low.height;let cloud=0,weight=.54,scale=4;
   for(let o=0;o<5;o++){cloud+=noise(nx*scale+31,ny*scale)*weight;weight*=.5;scale*=2;}
   const band=Math.exp(-Math.pow((nx*.62+ny*.48-.46)*3.2,2));const glow=Math.pow(Math.max(0,cloud-.16)*1.65,1.7)*band;
   const dust=noise(nx*17,ny*17);const p=(y*low.width+x)*4;
   im.data[p]=9+glow*52+dust*5;im.data[p+1]=12+glow*41+dust*4;im.data[p+2]=29+glow*99+dust*10;im.data[p+3]=255;
  }
  l.putImageData(im,0,0);b.drawImage(low,0,0,W,H);seed=72917;
  for(let i=0;i<3400;i++){const x=random()*W,y=random()*H*.91,r=random();b.globalAlpha=.18+random()*.65;b.fillStyle=i%7?'#c9c6ee':'#f4e2c1';b.beginPath();b.arc(x,y,r>.985?1.3:r>.85?.75:.4,0,Math.PI*2);b.fill();if(r>.997){b.globalAlpha=.2;b.fillRect(x-5,y-.3,10,.6);b.fillRect(x-.3,y-5,.6,10);}}
  b.globalAlpha=1;
  for(let layer=0;layer<3;layer++){b.fillStyle=['#111a27','#101822','#0a111b'][layer];b.beginPath();b.moveTo(0,H);for(let i=0;i<=50;i++){const x=i/50*W,y=H*(.86+layer*.025)-Math.sin(i*.43+layer)*H*.024-random()*H*.015;b.lineTo(x,y);}b.lineTo(W,H);b.closePath();b.fill();}
 }
 function resize(){W=innerWidth;H=innerHeight;const d=Math.min(devicePixelRatio,1.5);canvas.width=W*d;canvas.height=H*d;ctx.setTransform(d,0,0,d,0,0);background();}
 function addParticle(x,y,vx,vy,color,life,size=1.5,drag=1.6){if(particles.length>(W<600?5600:8200))return;particles.push({x,y,px:x,py:y,vx,vy,color,life,max:life,size,drag,twinkle:Math.random()*6});}
 function burst(x,y,color,size=1){
  const count=Math.round(270*size),speed=(W<600?82:130)*size;
  for(let i=0;i<count;i++){const a=i/count*Math.PI*2+Math.random()*.035,s=speed*(.55+Math.random()*.65);addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,color,2.1+Math.random()*1.9,.7+Math.random()*1.15,.68);}
  for(let i=0;i<Math.round(45*size);i++){const a=Math.random()*Math.PI*2,s=speed*.4;addParticle(x,y,Math.cos(a)*s,Math.sin(a)*s,'#fff1d6',1.2+Math.random(),1,.7);}
 }
 function launch(x,y,color,size=.65+Math.random()*1.05){rockets.push({x,y:H*.97,tx:x,ty:y,vy:-H*(.62+Math.random()*.22),color,size});}
 function shape(kind){
  const art=document.createElement('canvas');art.width=700;art.height=300;const a=art.getContext('2d');a.fillStyle='white';a.strokeStyle='white';a.textAlign='center';a.textBaseline='middle';
  if(kind==='cake'){
   a.lineWidth=3;for(let i=0;i<3;i++){const y=140+i*48,w=200+i*65;a.strokeRect(350-w/2,y,w,44);a.beginPath();a.moveTo(350-w/2,y+14);for(let j=0;j<=w;j+=4)a.lineTo(350-w/2+j,y+14+Math.sin(j/14)*6);a.stroke();}
   for(const x of [292,350,408]){a.strokeRect(x-5,90,10,50);a.beginPath();a.ellipse(x,73,6,13,0,0,Math.PI*2);a.stroke();}
  }else if(kind==='sheep'){
   a.lineWidth=4.5;
   for(let i=0;i<16;i++){const theta=i/16*Math.PI*2,x=318+Math.cos(theta)*112,y=127+Math.sin(theta)*58;a.beginPath();a.arc(x,y,23,0,Math.PI*2);a.stroke();}
   a.beginPath();a.ellipse(447,145,32,42,-.2,0,Math.PI*2);a.stroke();a.beginPath();a.ellipse(422,112,27,11,.5,0,Math.PI*2);a.stroke();
   for(const x of [252,290,363,391]){a.beginPath();a.moveTo(x,185);a.lineTo(x-3,253);a.lineTo(x+13,253);a.stroke();}
   a.beginPath();a.moveTo(199,124);a.quadraticCurveTo(167,115,174,145);a.stroke();a.beginPath();a.arc(457,140,4,0,Math.PI*2);a.fill();a.beginPath();a.moveTo(454,168);a.quadraticCurveTo(466,176,471,163);a.stroke();
  }else {a.font=`500 ${kind==='27'?220:kind===name?160:114}px "Songti SC","PingFang SC",serif`;a.fillText(kind,350,150);}
  const data=a.getImageData(0,0,700,300).data,points=[];const step=(kind==='cake'||kind==='sheep')?3:4;
  for(let y=0;y<300;y+=step)for(let x=0;x<700;x+=step)if(data[(y*700+x)*4+3]>100)points.push([x,y]);
  const scale=Math.min(W*.78/700,H*.38/300),cx=W*.5,cy=H*.36;
  for(const [x,y] of points){const tx=(x-350)*scale,ty=(y-150)*scale;addParticle(cx,cy,tx*1.65,ty*1.65,colors[(Math.floor(y/45))%colors.length],4.7+Math.random()*.5,1.1);}
 }
 function schedule(){
  events=[{t:3,run:()=>{subtitle.textContent='大大小小的心愿，都在今晚绽放。';for(let i=0;i<4;i++)launch(W*(.13+i*.24),H*(.2+Math.random()*.23),colors[i],.7+Math.random()*.9);}},{t:7,run:()=>shape(String(age))},{t:14,run:()=>shape(name)},{t:21,run:()=>{subtitle.textContent='一只小羊，也来送上生日祝福。';shape('sheep');}},{t:28,run:()=>shape('cake')},{t:35,run:()=>shape('生日快乐')},{t:42,run:()=>{subtitle.textContent=`${age}岁，愿你抬头皆是好风景。`;document.getElementById('sky-greeting').hidden=false;}}];
  // Frequent side bursts vary in radius and height, leaving the center for shapes.
  for(let t=4;t<40;t+=1.15)events.push({t,run:()=>{const side=Math.random()>.5;launch(W*(side?.78+Math.random()*.12:.1+Math.random()*.15),H*(.18+Math.random()*.4),colors[Math.floor(Math.random()*colors.length)],.5+Math.random()*1.1);if(Math.random()>.42)launch(W*(.15+Math.random()*.7),H*(.15+Math.random()*.35),colors[Math.floor(Math.random()*colors.length)],.45+Math.random()*.5);}});
  events.sort((a,b)=>a.t-b.t);
 }
 function draw(){
  ctx.clearRect(0,0,W,H);ctx.drawImage(bg,0,0);ctx.globalCompositeOperation='lighter';
  for(const p of particles){const alpha=Math.max(0,Math.min(1,p.life*.7)*( .8+.2*Math.sin(elapsed*10+p.twinkle)));ctx.globalAlpha=alpha;ctx.strokeStyle=p.color;ctx.lineWidth=p.size*.6;ctx.beginPath();ctx.moveTo(p.x-p.vx*.055,p.y-p.vy*.055);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}
  for(const r of rockets){ctx.globalAlpha=.9;ctx.strokeStyle=r.color;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(r.x,r.y+16);ctx.lineTo(r.x,r.y);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
 }
 function tick(time){
  if(!open)return;const dt=Math.min(.04,(time-last)/1000||0);last=time;
  if(!paused&&!reduced){elapsed+=dt;while(index<events.length&&elapsed>=events[index].t)events[index++].run();
   for(const r of rockets){r.y+=r.vy*dt;if(r.y<=r.ty){burst(r.x,r.ty,r.color,r.size);r.done=true;}}rockets=rockets.filter(r=>!r.done);
   for(const p of particles){p.px=p.x;p.py=p.y;p.x+=p.vx*dt;p.y+=p.vy*dt;const drag=Math.exp(-dt*p.drag);p.vx*=drag;p.vy=p.vy*drag+14*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
  }
  draw();frame=requestAnimationFrame(tick);
 }
 function restart(){elapsed=0;index=0;particles=[];rockets=[];paused=false;toggle.textContent='暂停烟花';toggle.setAttribute('aria-pressed','false');subtitle.textContent='先陪星星待一会儿，惊喜马上到。';document.getElementById('sky-greeting').hidden=true;schedule();if(reduced){shape(String(age));subtitle.textContent=`${name}，${age}岁生日快乐。`;document.getElementById('sky-greeting').hidden=false;toggle.disabled=true;}}
 function close(){if(!open)return;open=false;cancelAnimationFrame(frame);panel.close();particles=[];rockets=[];onClose?.();}
 document.getElementById('sky-close').onclick=close;panel.addEventListener('cancel',e=>{e.preventDefault();close();});
 toggle.onclick=()=>{paused=!paused;toggle.textContent=paused?'继续烟花':'暂停烟花';toggle.setAttribute('aria-pressed',String(paused));};
 document.getElementById('sky-replay').onclick=restart;
 window.addEventListener('resize',()=>{if(open)resize();});
 return {get isOpen(){return open;},open(){if(open)return;open=true;panel.showModal();resize();restart();last=performance.now();frame=requestAnimationFrame(tick);},close};
}
