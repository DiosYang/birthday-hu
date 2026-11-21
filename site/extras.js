// Room toys: a silent animated TV, instant camera, and a hopping white rabbit.
export function createRoomExtras({THREE,scene,group,box,sphere,cyl,tube,rounded,mesh,interactive,reduced}){
 const $=id=>document.getElementById(id);
 const tvModal=$('tv-viewer'),printModal=$('polaroid-viewer');
 let tvPlaying=true,tvTime=0,lastPaint=-1,printStarted=-1,rabbitCaughtUntil=0;
 const tv=interactive(group(3.85,0,.38),'tv');tv.rotation.y=-.65;
 for(const x of [-.56,.56])for(const z of [-.25,.25])box(.07,.35,.07,'#72503b',tv,x,.3,z);
 rounded(1.5,.17,.84,.04,'#9a744d',tv,0,.56,0);
 rounded(1.38,.92,.61,.09,'#76523e',tv,0,1.08,0);
 rounded(1.08,.74,.065,.06,'#c9bb8e',tv,-.095,1.1,.33);
 rounded(.91,.58,.055,.045,'#263b36',tv,-.095,1.1,.38);
 const screenCanvas=document.createElement('canvas');screenCanvas.width=640;screenCanvas.height=400;
 const screenTexture=new THREE.CanvasTexture(screenCanvas);screenTexture.colorSpace=THREE.SRGBColorSpace;
 mesh(new THREE.PlaneGeometry(.87,.545),new THREE.MeshBasicMaterial({map:screenTexture}),tv,-.095,1.1,.411);
 for(const y of [1.23,.99]){const knob=cyl(.067,.067,.05,'#dbbc7e',tv,.54,y,.35);knob.rotation.x=Math.PI/2;box(.012,.065,.008,'#745535',tv,.54,y,.379);}
 for(let i=0;i<5;i++)box(.12,.012,.012,'#3d372c',tv,.54,.81+i*.028,.337);
 tube([[-.15,1.55,0],[-.53,2.05,.02]],.012,'#b4a58b',tv);tube([[.15,1.55,0],[.44,1.97,.02]],.012,'#b4a58b',tv);
 const screen=screenCanvas.getContext('2d'),large=$('tv-canvas').getContext('2d');
 function ellipse(c,x,y,rx,ry,color){c.fillStyle=color;c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fill();}
 function bunny(c,x,y,t,scale=1){c.save();c.translate(x,y);c.scale(scale,scale);ellipse(c,0,0,31,24,'#fffef2');ellipse(c,22,-21,24,22,'#fffef2');c.save();c.translate(14,-40);c.rotate(-.12+Math.sin(t*2)*.05);ellipse(c,0,-16,7,25,'#fffef2');ellipse(c,0,-16,3,18,'#e9b9be');c.restore();ellipse(c,34,-57,7,24,'#fffef2');ellipse(c,34,-57,3,17,'#e9b9be');ellipse(c,33,-24,3,3,'#414d42');ellipse(c,45,-18,3,2,'#cb8b8f');ellipse(c,-28,-4,10,10,'#fffef2');ellipse(c,15,21,13,7,'#f0eee1');c.restore();}
 function sheep(c,x,y,t){c.save();c.translate(x,y);for(const k of [-16,10]){c.fillStyle='#525b4f';c.fillRect(k,12,6,24);}for(let i=0;i<7;i++)ellipse(c,Math.cos(i)*18,Math.sin(i)*12,17,17,'#f4edd7');ellipse(c,31,0,15,19,'#596350');ellipse(c,20,-13,11,5,'#596350');ellipse(c,37,-3,2.5,2.5,'#fff8e7');c.restore();}
 function paintTV(){
  const t=tvTime,phase=(t%18)/18;screen.fillStyle='#b8cfbc';screen.fillRect(0,0,640,400);
  ellipse(screen,520,77,34,34,'#f4d694');screen.fillStyle='#93b7a1';screen.beginPath();screen.moveTo(0,230);screen.quadraticCurveTo(140,80,340,240);screen.quadraticCurveTo(500,130,640,215);screen.lineTo(640,400);screen.lineTo(0,400);screen.fill();
  screen.fillStyle='#739b80';screen.beginPath();screen.moveTo(0,280);screen.quadraticCurveTo(250,170,640,285);screen.lineTo(640,400);screen.lineTo(0,400);screen.fill();
  for(let i=0;i<10;i++){const x=35+i*65,y=330+Math.sin(i*3)*22;screen.fillStyle='#d9bf81';screen.beginPath();screen.arc(x,y,3,0,Math.PI*2);screen.fill();}
  const x=90+phase*345,hop=reduced?0:Math.max(0,Math.sin(t*5))*13;
  bunny(screen,x,286-hop,t,.85);sheep(screen,505,283+Math.sin(t*2)*2,t);
  screen.strokeStyle='#d1ae7c';screen.lineWidth=2;screen.beginPath();screen.moveTo(450,220);screen.quadraticCurveTo(455+Math.sin(t)*5,180,457,132);screen.stroke();ellipse(screen,457,110,19,25,'#d09c9a');
  screen.textAlign='center';screen.fillStyle='#2f5144';screen.font='22px "Songti SC",serif';screen.fillText('小兔子的出发日',320,45);
  screen.fillStyle='#f5edd3';screen.font='18px sans-serif';screen.fillText(phase<.5?'慢慢走，也会遇见美好。':'27岁，和喜欢的世界打个招呼。',320,373);
  screenTexture.needsUpdate=true;large.clearRect(0,0,640,400);large.drawImage(screenCanvas,0,0);
 }
 $('tv-close').onclick=()=>tvModal.close();$('tv-pause').onclick=()=>{tvPlaying=!tvPlaying;$('tv-pause').textContent=tvPlaying?'暂停动画':'继续播放';$('tv-pause').setAttribute('aria-pressed',String(!tvPlaying));};
 // Polaroid I-2-inspired miniature: sloped graphite shell, broad lens barrel,
 // left flash/red shutter, right optical windows, and a low front film slot.
 const stand=group(-1.9,0,-3.12);cyl(.59,.59,.12,'#c69d72',stand,0,.85,0);for(const x of [-.35,.35])box(.08,.78,.08,'#886346',stand,x,.43,0);
 const camera=interactive(group(-1.9,.97,-3.12),'camera');camera.rotation.y=.05;camera.scale.setScalar(.8);
 const graphite=new THREE.MeshStandardMaterial({color:'#282b2d',roughness:.67});
 const lensBlack=new THREE.MeshStandardMaterial({color:'#171d21',roughness:.36,metalness:.3});
 const silver=new THREE.MeshStandardMaterial({color:'#aeb3b3',roughness:.32,metalness:.7});
 rounded(1.12,.27,.87,.06,graphite,camera,0,.15,0);
 const profile=new THREE.Shape();profile.moveTo(-.44,.25);profile.lineTo(.43,.25);profile.lineTo(.43,.7);profile.quadraticCurveTo(.43,.75,.36,.76);profile.lineTo(.03,.76);profile.quadraticCurveTo(-.03,.76,-.08,.7);profile.lineTo(-.34,.57);profile.quadraticCurveTo(-.44,.54,-.44,.45);profile.closePath();
 const hull=new THREE.ExtrudeGeometry(profile,{depth:1.04,bevelEnabled:true,bevelThickness:.035,bevelSize:.025,bevelSegments:3,steps:1});hull.rotateY(Math.PI/2);hull.translate(-.52,0,0);mesh(hull,graphite,camera);
 rounded(.2,.2,.29,.03,'#24282b',camera,.39,.79,-.25);
 function frontDisc(radius,depth,material,x,y,z){const m=cyl(radius,radius,depth,material,camera,x,y,z);m.rotation.x=Math.PI/2;return m;}
 frontDisc(.293,.075,'#1a1e20',0,.51,.405);
 frontDisc(.272,.19,lensBlack,0,.51,.495);
 frontDisc(.281,.024,silver,0,.51,.6);
 frontDisc(.258,.023,'#272d31',0,.51,.616);
 // Small repeated ridges make the manual focus ring readable up close.
 for(let i=0;i<44;i++){const a=i/44*Math.PI*2;const ridge=box(.009,.009,.14,'#555a5c',camera,Math.cos(a)*.271,.51+Math.sin(a)*.271,.5);ridge.rotation.z=a;}
 frontDisc(.224,.012,'#101a22',0,.51,.632);
 frontDisc(.177,.013,new THREE.MeshStandardMaterial({color:'#253447',metalness:.55,roughness:.12}),0,.51,.641);
 frontDisc(.116,.014,'#18212e',0,.51,.65);sphere(.048,'#8fa8b5',camera,-.054,.575,.661,1.1,.6,.1);sphere(.03,'#6e6598',camera,.065,.46,.663,1,.75,.1);
 const rainbow=['#b64e42','#ce773e','#d0ae49','#6d965e','#547e9a'];for(let i=0;i<5;i++)box(.04,.012,.008,rainbow[i],camera,-.08+i*.04,.725,.633);
 rounded(.225,.128,.035,.026,'#141b1d',camera,-.414,.581,.437);rounded(.195,.09,.018,.02,'#c8d1d4',camera,-.414,.581,.46);
 for(let i=0;i<9;i++)box(.008,.07,.006,'#e0e4df',camera,-.498+i*.021,.581,.472);
 frontDisc(.071,.028,'#111719',-.425,.375,.455);frontDisc(.059,.023,'#cb3d35',-.425,.375,.479);
 for(const x of [.35,.465]){frontDisc(.052,.035,'#101719',x,.59,.441);frontDisc(.036,.012,'#293b43',x,.59,.465);sphere(.012,'#9daeb7',camera,x-.012,.606,.475,1,.8,.2);}
 frontDisc(.104,.05,'#111a1c',.414,.366,.46);frontDisc(.078,.016,'#3c4c54',.414,.366,.493);sphere(.024,'#a9b9bb',camera,.392,.394,.506,1,.6,.12);
 // Label texture is drawn locally, so no external image or font is required.
 const labelCanvas=document.createElement('canvas');labelCanvas.width=512;labelCanvas.height=128;const lc=labelCanvas.getContext('2d');lc.fillStyle='#e2e5e1';lc.font='bold 74px sans-serif';lc.textAlign='center';lc.fillText('Polaroid',256,86);const labelTexture=new THREE.CanvasTexture(labelCanvas);labelTexture.colorSpace=THREE.SRGBColorSpace;
 const label=mesh(new THREE.PlaneGeometry(.32,.08),new THREE.MeshBasicMaterial({map:labelTexture,transparent:true,depthWrite:false}),camera,0,.752,.073);label.rotation.x=-.47;
 box(.96,.053,.026,'#111718',camera,0,.12,.451);box(.91,.009,.012,'#667075',camera,0,.139,.469);box(.96,.012,.028,'#353d40',camera,0,.084,.455);
 tube([[.51,.55,-.16],[.68,.46,-.2],[.69,.21,-.06],[.57,.2,.1]],.018,'#171e20',camera);
 const cardCanvas=document.createElement('canvas');cardCanvas.width=480;cardCanvas.height=590;const pc=cardCanvas.getContext('2d');
 function cardBase(){pc.fillStyle='#fff9ea';pc.fillRect(0,0,480,590);pc.fillStyle='#d9d2bf';pc.fillRect(26,26,428,428);pc.fillStyle='#7d7668';pc.textAlign='center';pc.font='20px serif';pc.fillText('这一张，留给我们。',240,529);}cardBase();
 const cardTexture=new THREE.CanvasTexture(cardCanvas);cardTexture.colorSpace=THREE.SRGBColorSpace;
 const photoImage=new Image();photoImage.onload=()=>{cardBase();pc.drawImage(photoImage,26,26,428,428);cardTexture.needsUpdate=true;};photoImage.src='./assets/cartoon-together.png';
 const paper=mesh(new THREE.PlaneGeometry(.64,.79),new THREE.MeshBasicMaterial({map:cardTexture,side:THREE.DoubleSide}),camera,0,.16,.46);paper.rotation.x=-Math.PI/2;paper.visible=false;
 const ribbon=$('polaroid-paper');$('polaroid-close').onclick=()=>printModal.close();
 function print(){printStarted=performance.now();paper.visible=true;$('camera-flash').classList.remove('camera-flash-on');void $('camera-flash').offsetWidth;if(!reduced)$('camera-flash').classList.add('camera-flash-on');ribbon.classList.remove('developing');void ribbon.offsetWidth;ribbon.classList.add('developing');if(!printModal.open)printModal.showModal();}
 $('polaroid-again').onclick=print;
 // A real white rabbit, separate from the black cat already in the room.
 const rabbit=interactive(group(3.2,.16,2.8),'rabbit');
 const body=group(0,0,0,rabbit),white='#fcfcfa';sphere(.25,white,body,0,.25,0,.85,1.12,1.3);sphere(.2,white,body,0,.5,.18,1,.94,1);
 const ears=[];for(const x of [-.105,.105]){const ear=group(x,.65,.13,body);sphere(.066,white,ear,0,.17,0,.85,3.3,.68);sphere(.036,'#efc8cd',ear,0,.18,.033,.9,4.3,.45);ears.push(ear);}
 for(const x of [-.09,.09]){sphere(.025,'#353c3a',body,x,.52,.35,.8,1,.6);sphere(.008,'#ffffff',body,x-.006,.528,.364);sphere(.085,white,body,x,.075,.17,1,.7,1.35);}
 sphere(.025,'#dbb4bb',body,0,.46,.38,1,.75,.5);sphere(.09,white,body,0,.26,-.31);tube([[-.04,.415,.355],[0,.405,.369],[.04,.415,.355]],.006,'#c6b5b4',body);
 const shadow=mesh(new THREE.CircleGeometry(.26,32),new THREE.MeshBasicMaterial({color:'#493f35',transparent:true,opacity:.14,depthWrite:false}),rabbit,0,.004,0);shadow.rotation.x=-Math.PI/2;
 function catchRabbit(){rabbitCaughtUntil=performance.now()+8000;}
 function resumeRabbit(){rabbitCaughtUntil=0;}
 let rabbitPhase=0;
 function update(t,dt,paused){
  if(tvPlaying&&!reduced)tvTime+=dt;
  if(Math.floor(tvTime*24)!==lastPaint){lastPaint=Math.floor(tvTime*24);paintTV();}
  if(printStarted>=0){const p=reduced?1:Math.min(1,(performance.now()-printStarted)/2600);paper.position.set(0,.16,.46+p*.395);paper.scale.y=p;paper.visible=p>.01;}
  const caught=performance.now()<rabbitCaughtUntil;
  if(!caught&&!paused&&!reduced)rabbitPhase+=dt*.3;
  rabbit.position.x=3.38+Math.sin(rabbitPhase)*.65;rabbit.position.z=2.85+Math.sin(rabbitPhase*.8)*.4;
  rabbit.rotation.y=Math.atan2(Math.cos(rabbitPhase)*.65,Math.cos(rabbitPhase*.8)*.32);
  const hop=caught||reduced?0:Math.max(0,Math.sin(t*5))* .16;body.position.y=hop;shadow.scale.setScalar(1-hop*.8);
  ears.forEach((e,i)=>{e.rotation.z=(i?-.08:.08)+(reduced?0:Math.sin(t*2+i)*.06);});body.scale.y=1+(reduced?0:Math.sin(t*3)*.012);
 }
 paintTV();
 return {update,catchRabbit,resumeRabbit,print,openTV(){tvModal.showModal();},get isOpen(){return tvModal.open||printModal.open;}};
}
