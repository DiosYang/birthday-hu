import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createTravelJournal, paintWallMap } from './travel.js?v=fd6c5ef37c';
import { createNightSky } from './sky.js?v=94791930fa';
import { createRoomExtras } from './extras.js?v=728b31639e';
import { addReferencePlants } from './plants.js?v=c91b8e662a';

const $ = id => document.getElementById(id);
const config = window.BIRTHDAY;
$('recipient').textContent = config.name;
document.title=`${config.name}，${config.age}岁生日快乐`;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const scene = new THREE.Scene();
const host = $('room');
let renderer;
try {
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
} catch {
  $('loading').textContent = '当前浏览器无法显示 3D，请用下方按钮拆开祝福。';
}
const overviewCamera = new THREE.OrthographicCamera(-6.8,6.8,5.6,-5.6,.1,80);
overviewCamera.position.set(8.5,10.5,16);
const walkCamera = new THREE.PerspectiveCamera(68,1,.04,80);
let camera=overviewCamera, walking=false, yaw=0, pitch=-.13;
const movement=new Set();
const controls = renderer ? new OrbitControls(overviewCamera,renderer.domElement) : null;
if(renderer){
  renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.16;
  host.appendChild(renderer.domElement);
  controls.target.set(0,1.3,0);
  controls.enablePan = false; controls.enableZoom = false; controls.enableDamping = true;
  controls.minPolarAngle = .65; controls.maxPolarAngle = 1.3;
  controls.minAzimuthAngle = -.2; controls.maxAzimuthAngle = 1.28;
  controls.update();
}
scene.add(new THREE.AmbientLight('#ffdfc3',1.15));
scene.add(new THREE.HemisphereLight('#dfcfed','#885f40',1.6));
const sun = new THREE.DirectionalLight('#ffd7ac',4);
sun.position.set(1,10,7); sun.castShadow = true;
sun.shadow.mapSize.set(2048,2048);
Object.assign(sun.shadow.camera,{left:-7,right:7,top:7,bottom:-7,near:1,far:25});
sun.shadow.normalBias = .025; sun.shadow.bias = -.0002;
sun.shadow.radius = 3; scene.add(sun);
const warm = new THREE.PointLight('#ffbd71',12,12,2);warm.position.set(-1,4,0);scene.add(warm);

const palette = {};
function mat(color,roughness=.75,metalness=0){
  const key = `${color}/${roughness}/${metalness}`;
  return palette[key] ||= new THREE.MeshStandardMaterial({color,roughness,metalness});
}
function mesh(geometry,color,parent=scene,x=0,y=0,z=0){
  const m = new THREE.Mesh(geometry,typeof color==='string'?mat(color):color);
  m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;
}
function box(w,h,d,c,p=scene,x=0,y=0,z=0){return mesh(new THREE.BoxGeometry(w,h,d),c,p,x,y,z)}
function sphere(r,c,p=scene,x=0,y=0,z=0,sx=1,sy=1,sz=1){const m=mesh(new THREE.SphereGeometry(r,24,16),c,p,x,y,z);m.scale.set(sx,sy,sz);return m;}
function cyl(rt,rb,h,c,p=scene,x=0,y=0,z=0){return mesh(new THREE.CylinderGeometry(rt,rb,h,40),c,p,x,y,z)}
function group(x=0,y=0,z=0,parent=scene){const g=new THREE.Group();g.position.set(x,y,z);parent.add(g);return g;}
function tube(points,r,c,p=scene){return mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points.map(v=>new THREE.Vector3(...v))),48,r,8,false),c,p)}
function rounded(w,h,d,r,c,p=scene,x=0,y=0,z=0){
  const shape=new THREE.Shape(),a=-w/2,b=-h/2;
  shape.moveTo(a+r,b);shape.lineTo(a+w-r,b);shape.quadraticCurveTo(a+w,b,a+w,b+r);shape.lineTo(a+w,b+h-r);shape.quadraticCurveTo(a+w,b+h,a+w-r,b+h);shape.lineTo(a+r,b+h);shape.quadraticCurveTo(a,b+h,a,b+h-r);shape.lineTo(a,b+r);shape.quadraticCurveTo(a,b,a+r,b);
  const geo=new THREE.ExtrudeGeometry(shape,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:12});geo.translate(0,0,-(d-2*r)/2);
  return mesh(geo,c,p,x,y,z);
}
function interactive(g,id){g.userData.item=id;return g;}
const gold=mat('#c69848',.3,.55), cream='#ecd5a4', pink='#c5c6ad';

// A larger timber floor, with real space to walk between the objects.
rounded(10.6,.3,8.6,.11,'#545d46',scene,0,-.2,0);
box(10.14,.18,8.14,'#b78750',scene,0,-.02,0);
for(let row=0;row<20;row++)for(let col=0;col<8;col++){
 const x=-4.43+col*1.265;
 box(1.245,.06,.385,['#ad8d66','#b39572','#a88760','#bda17f'][(row+col*3)%4],scene,x,.1,-3.8+row*.4);
}
// Back wall has a real arched opening, so the window can swing outward.
const wallShape=new THREE.Shape();wallShape.moveTo(-5.1,.12);wallShape.lineTo(5.1,.12);wallShape.lineTo(5.1,4.38);wallShape.lineTo(-5.1,4.38);wallShape.closePath();
const opening=new THREE.Path();opening.moveTo(1.86,1.04);opening.lineTo(1.86,2.76);opening.absarc(2.81,2.76,.95,Math.PI,0,true);opening.lineTo(3.76,1.04);opening.closePath();wallShape.holes.push(opening);
const wallGeo=new THREE.ExtrudeGeometry(wallShape,{depth:.22,bevelEnabled:false});mesh(wallGeo,'#405d50',scene,0,0,-4.15);
const left=rounded(8.15,4.25,.22,.08,'#4b6656',scene,-5.05,2.25,0);left.rotation.y=Math.PI/2;
box(10.1,.18,.12,'#9d7c55',scene,0,.24,-3.87);box(.12,.18,8.05,'#9d7c55',scene,-4.88,.24,0);
box(10.15,.12,.25,'#a98c65',scene,0,4.36,-4.05);box(.25,.12,8.15,'#a98c65',scene,-5.05,4.36,0);

// Lower wall panelling gives the room its own quiet study-like character.
for(let i=0;i<10;i++){
 const x=-4.5+i;
 box(.88,.77,.035,'#344e42',scene,x,.6,-3.91);
 box(.035,.82,.055,'#6d8066',scene,x-.44,.6,-3.87);
}
box(10.04,.075,.065,'#8e926d',scene,0,1.03,-3.87);
for(let i=0;i<8;i++){
 const z=-3.5+i;
 box(.035,.77,.88,'#3a5345',scene,-4.91,.6,z);
 box(.055,.82,.035,'#72836b',scene,-4.87,.6,z-.44);
}
box(.065,.075,8.05,'#8e926d',scene,-4.87,1.03,0);
// The arched window looks out into a quiet blue night.
const win=interactive(group(2.81,1.05,-3.87),'window');
function arch(w,h){const s=new THREE.Shape();s.moveTo(-w/2,0);s.lineTo(w/2,0);s.lineTo(w/2,h-w/2);s.absarc(0,h-w/2,w/2,0,Math.PI,false);s.lineTo(-w/2,0);return s;}

const outsideCanvas=document.createElement('canvas');outsideCanvas.width=256;outsideCanvas.height=384;const sc=outsideCanvas.getContext('2d');
const sg=sc.createLinearGradient(0,0,0,384);sg.addColorStop(0,'#181a42');sg.addColorStop(.55,'#41356d');sg.addColorStop(1,'#141d34');sc.fillStyle=sg;sc.fillRect(0,0,256,384);for(let i=0;i<180;i++){sc.fillStyle=i%3?'#d4c7e9':'#f7e0b2';sc.globalAlpha=.25+Math.random()*.6;sc.fillRect(Math.random()*256,Math.random()*384,i%9?1:2,1.5);}sc.globalAlpha=1;
const outsideTexture=new THREE.CanvasTexture(outsideCanvas);outsideTexture.colorSpace=THREE.SRGBColorSpace;
mesh(new THREE.PlaneGeometry(2.1,2.9),new THREE.MeshBasicMaterial({map:outsideTexture}),win,0,1.35,-.35);
// Two casement leaves rotate about their outer hinges.
const windowLeaves=[];
for(const side of [-1,1]){
 const leaf=group(side*.88,.05,.08,win);windowLeaves.push(leaf);
 const shape=arch(1.68,2.43);const half=new THREE.Shape();
 half.moveTo(0,0);half.lineTo(.84,0);half.lineTo(.84,1.59);half.absarc(0,1.59,.84,0,Math.PI/2,false);half.lineTo(0,0);
 const pane=mesh(new THREE.ShapeGeometry(half),new THREE.MeshStandardMaterial({color:'#8780aa',transparent:true,opacity:.48,roughness:.2,metalness:.1,side:THREE.DoubleSide}),leaf,side<0?.84:-.84,0,0);pane.scale.x=side<0?-1:1;
 const mid=-side*.42;
 for(const yy of [.64,1.51])box(.87,.045,.065,'#905b43',leaf,mid,yy,.035);
 box(.045,2.38,.065,'#905b43',leaf,-side*.84,1.19,.035);
 box(.045,2.02,.065,'#905b43',leaf,-side*.43,1.02,.035);
 box(.87,.045,.065,'#905b43',leaf,mid,0,.035);
 sphere(.044,gold,leaf,-side*.74,1.05,.1,1,1.6,1);
}
let windowAmount=0,windowTarget=0,windowOpening=false,windowTimer;
const framePoints=[[-.95,0,.06],[-.95,1.7,.06]];
for(let i=0;i<=32;i++){const a=Math.PI-i*Math.PI/32;framePoints.push([Math.cos(a)*.95,1.7+Math.sin(a)*.95,.06]);}
framePoints.push([.95,0,.06]);tube(framePoints,.055,'#6e4236',win);
box(2.1,.13,.42,'#e7bd8e',win,0,.02,.13);
// Moon painting, one of the hidden letters.
const moon=interactive(group(.45,2.8,-3.83),'moon');
box(1.15,1.48,.09,gold,moon);box(1.02,1.35,.1,'#29283a',moon,0,0,.03);
sphere(.32,'#efd08e',moon,.08,.18,.1,1,1,.07);sphere(.29,'#29283a',moon,.23,.29,.13,1,1,.07);
for(const [x,y] of [[-.31,.37],[.31,-.38],[-.24,-.14],[.38,.49]])sphere(.022,cream,moon,x,y,.11,1,1,.4);
box(.76,.025,.01,'#a98c68',moon,0,-.43,.11);
// A shelf and a few little objects.
box(1.7,.1,.42,'#b58b61',scene,-4.7,2.1,-.65).rotation.y=Math.PI/2;
for(let i=0;i<4;i++)box(.15,.4+i*.035,.25,['#718366','#d9b47e','#c78876','#7e8588'][i],scene,-4.6,2.35,-1.1+i*.2);

// The left-wall travel map is both a physical object and a journal entrance.
const wallMap=interactive(group(-4.87,2.8,1.75),'map');wallMap.rotation.y=Math.PI/2;
box(1.98,2.28,.09,'#76513b',wallMap);
const mapCanvas=document.createElement('canvas');paintWallMap(mapCanvas);
const mapTexture=new THREE.CanvasTexture(mapCanvas);mapTexture.colorSpace=THREE.SRGBColorSpace;
mesh(new THREE.PlaneGeometry(1.85,2.16),new THREE.MeshBasicMaterial({map:mapTexture}),wallMap,0,0,.051);
for(const x of [-.85,.85])sphere(.035,gold,wallMap,x,1.02,.075,1,1,.5);

// The sofa faces into the room from the left wall, creating a reading bay.
const sofa=group(-3.95,0,-.15);sofa.rotation.y=Math.PI/2;
for(const x of [-1,1])for(const z of [-.4,.5])cyl(.055,.045,.3,'#705035',sofa,x,.29,z);
rounded(2.6,.4,1.28,.13,'#aaa58a',sofa,0,.6,.1);
rounded(2.55,.88,.3,.1,pink,sofa,0,1.23,-.44).rotation.x=-.12;
for(const x of [-.6,.6])rounded(1.12,.22,.96,.09,'#dedac2',sofa,x,.87,.18);
for(const x of [-1.24,1.24])rounded(.3,.52,1.3,.11,'#c9c9ae',sofa,x,.98,.09);
const pillow=rounded(.59,.59,.2,.08,'#bc885f',sofa,-.65,1.24,-.19);pillow.rotation.z=.12;pillow.rotation.x=-.2;
const pillow2=rounded(.58,.56,.2,.1,'#668370',sofa,.64,1.26,-.19);pillow2.rotation.z=-.21;
sphere(.07,'#8da58a',sofa,.65,1.28,-.06,1,1,.35);
rounded(.46,.015,.9,.018,'#a8ae94',sofa,.29,1,.38);
for(let i=0;i<6;i++)box(.018,.014,.87,'#e6dec0',sofa,.07+i*.075,1.012,.39);
for(let i=0;i<7;i++)tube([[.07+i*.065,1.01,.84],[.07+i*.065,.78,.88],[.07+i*.065,.51,.89]],.008,'#ded6b5',sofa);

// A compact bookcase anchors the travel and photography corner.
const bookcase=group(-3.65,0,-3.54);
for(const x of [-.76,.76])box(.08,2.74,.5,'#735b42',bookcase,x,1.48,0);
box(1.6,2.76,.035,'#4b5c49',bookcase,0,1.48,-.25);
for(const y of [.2,1,1.8,2.82])box(1.62,.09,.57,'#8c7250',bookcase,0,y,0);
for(let row=0;row<3;row++)for(let i=0;i<7;i++){
 const h=.43+(i*3%5)*.045,x=-.62+i*.2,y=.25+row*.8+h/2;
 const b=box(.145,h,.32,['#61745b','#9d815b','#ba9d6e','#50685f','#956d56'][(row+i)%5],bookcase,x,y,-.015);b.rotation.z=i%4===0?.08:0;
 box(.11,.014,.012,'#c6b88f',bookcase,x,y+h*.26,.15);
}

// Plants with fleshy leaves, scattered around the room.
function plant(x,z,scale=1,parent=scene,y=.14){
  const p=group(x,y,z,parent);p.scale.setScalar(scale);
  cyl(.19,.13,.33,'#ddba83',p,0,.165,0);cyl(.17,.17,.025,'#594638',p,0,.34,0);
  for(let i=0;i<7;i++){const a=i*2.4, yy=.58+(i%3)*.12;tube([[0,.34,0],[Math.cos(a)*.08,yy-.1,Math.sin(a)*.08],[Math.cos(a)*.18,yy,Math.sin(a)*.18]],.015,'#547047',p);const leaf=sphere(.16,i%2?'#547747':'#698955',p,Math.cos(a)*.2,yy,Math.sin(a)*.2,.56,1.5,.55);leaf.rotation.z=Math.sin(a)*.7;leaf.rotation.x=Math.cos(a)*.6;}
  return p;
}
plant(-4.2,-2.3,.9);plant(4.5,1.5,.9);plant(-.85,-3.5,.65);plant(3.3,-3.52,.55,scene,1.15);
// Gramophone, with an open brass horn.
const record=interactive(group(.45,0,-3.03),'record');
for(const x of [-.44,.44])for(const z of [-.3,.3])box(.1,.28,.1,'#6c4836',record,x,.27,z);
rounded(1.1,.75,.86,.045,'#8a5b39',record,0,.72,0);box(1.24,.12,1,'#bd8747',record,0,1.16,0);
for(let i=0;i<6;i++)box(.07,.43,.025,'#bd945d',record,-.37+i*.15,.77,.445);
cyl(.38,.38,.035,'#292631',record,0,1.24,0);cyl(.1,.1,.04,'#ca9b5d',record,0,1.27,0);
tube([[.43,1.28,-.2],[.48,1.6,-.24],[.25,1.64,-.08],[.16,1.29,.15]],.027,gold,record);
const horn=group(-.12,1.75,-.26,record);horn.rotation.x=.9;horn.rotation.z=.3;
mesh(new THREE.CylinderGeometry(.5,.08,.7,48,1,true),new THREE.MeshStandardMaterial({color:'#c99540',roughness:.32,metalness:.65,side:THREE.DoubleSide}),horn,0,.15,0);
const rim=mesh(new THREE.TorusGeometry(.5,.022,8,48),gold,horn,0,.5,0);rim.rotation.x=Math.PI/2;
tube([[-.12,1.4,-.3],[-.12,1.62,-.3],[-.13,1.7,-.3]],.06,gold,record);

// A woven rectangular rug, instead of the original round pink mat.
const rug=group(-1.05,.16,.6);
const rugSurface=mesh(new THREE.PlaneGeometry(3.65,2.9),'#7c8972',rug);rugSurface.rotation.x=-Math.PI/2;
for(let i=0;i<22;i++)box(3.55,.003,.018,i%2?'#89987c':'#9ca78d',rug,0,.004,-1.4+i*.13);
for(const z of [-1.38,1.38])box(3.5,.006,.065,'#c7c5a4',rug,0,.01,z);
for(const x of [-1.73,1.73])box(.065,.006,2.82,'#c7c5a4',rug,x,.01,0);
for(let i=0;i<22;i++)for(const z of [-1.52,1.52])box(.022,.005,.14,'#b9b99c',rug,-1.68+i*.16,.004,z);
const table=group(-1.15,0,.35);
for(const [x,z] of [[-.58,-.3],[.57,-.3],[0,.49]]){const leg=cyl(.065,.045,.72,'#99714e',table,x,.52,z);leg.rotation.z=-x*.2;}
cyl(.96,.92,.14,'#b79b72',table,0,.96,0).scale.z=.74;
const book=interactive(group(-.1,1.07,.16,table),'book');book.rotation.y=-.22;
box(.72,.065,.5,'#758769',book);box(.64,.05,.45,'#efdec0',book,0,.055,0);box(.045,.012,.51,'#c69c5e',book,0,.094,0);
for(const x of [-.17,.17])for(let i=0;i<4;i++)box(.21,.008,.01,'#b6a184',book,x,.088,-.11+i*.075);
cyl(.12,.09,.17,'#f0dfbc',table,.44,1.13,-.18);cyl(.097,.097,.005,'#886249',table,.44,1.218,-.18);
const handle=mesh(new THREE.TorusGeometry(.08,.022,8,16),cream,table,.57,1.14,-.18);handle.rotation.y=Math.PI/2;

// A sleeping cat, curled up on its own cushion.
const cat=interactive(group(-2.65,.21,2.22),'cat');cat.rotation.y=.35;
cyl(.62,.62,.08,'#d6ac8a',cat).scale.z=.77;
for(let i=0;i<3;i++){const ring=mesh(new THREE.TorusGeometry(.48+i*.035,.015,5,48),'#bd8b80',cat,0,.05,0);ring.rotation.x=Math.PI/2;ring.scale.y=.77;}
sphere(.38,'#1c1b23',cat,0,.29,0,1.22,.65,.85);
const head=group(-.3,.41,.15,cat);sphere(.24,'#1c1b23',head,0,0,0,1,.91,.85);
for(const x of [-.14,.14]){const ear=mesh(new THREE.ConeGeometry(.105,.18,3),'#24232a',head,x,.2,0);ear.rotation.z=x<0?.3:-.3;mesh(new THREE.ConeGeometry(.056,.11,3),'#bb858b',head,x,.206,.045);}
for(const x of [-.086,.086])tube([[x-.035,.01,.192],[x,-.007,.2],[x+.035,.01,.192]],.009,'#c9bca8',head);
sphere(.022,'#c9958c',head,0,-.055,.21);
tube([[.31,.25,.03],[.42,.19,.29],[.19,.14,.4],[-.04,.18,.32]],.072,'#24232b',cat);
for(const z of [-.08,.04,.16])tube([[.04,.5,z],[.07,.51,z],[.1,.5,z]],.014,'#37333d',cat);

// Winter cherry: pink, notched five-petal blossoms on bare woody branches.
const flowers=interactive(group(3.8,.14,-1.75),'flowers');
cyl(.17,.13,.4,'#ddc6c1',flowers,0,.2,0);cyl(.1,.17,.14,'#edd8d0',flowers,0,.45,0);
const cherryWood='#795140';
const branches=[{x:-.34,z:-.08,h:1.52},{x:.29,z:-.08,h:1.67},{x:.07,z:.22,h:1.32}];
for(const b of branches)tube([[0,.42,0],[b.x*.35,.83,b.z*.5],[b.x,b.h,b.z]],.021,cherryWood,flowers);
const petalShape=new THREE.Shape();
petalShape.moveTo(0,0);petalShape.bezierCurveTo(-.075,.035,-.09,.125,-.035,.151);petalShape.quadraticCurveTo(-.012,.16,0,.13);petalShape.quadraticCurveTo(.012,.16,.035,.151);petalShape.bezierCurveTo(.09,.125,.075,.035,0,0);
const petalGeometry=new THREE.ExtrudeGeometry(petalShape,{depth:.009,bevelEnabled:true,bevelSize:.006,bevelThickness:.005,bevelSegments:2,curveSegments:8,steps:1});
for(let i=0;i<22;i++){
  const b=branches[i%3],t=.38+(Math.floor(i/3)/7)*.62,a=i*2.4;
  const root=[b.x*t,.45+(b.h-.45)*t,b.z*t],side=.095+(i%3)*.04;
  const x=root[0]+Math.cos(a)*side,z=root[2]+Math.sin(a)*side,y=root[1]+.06;
  tube([root,[x,y,z]],.009,cherryWood,flowers);
  const bloom=group(x,y,z,flowers);bloom.rotation.y=.4+Math.sin(a)*.6;bloom.rotation.x=-.3;
  const shade=['#e6a6b6','#f3c4cd','#eab2c1','#d68da8'][i%4];
  for(let j=0;j<5;j++){const petal=mesh(petalGeometry,shade,bloom);petal.rotation.z=j*Math.PI*2/5;}
  sphere(.036,'#ce7b9e',bloom,0,0,.026,1,1,.5);
  for(let j=0;j<5;j++){const a=j*Math.PI*2/5;sphere(.012,'#f5dfa5',bloom,Math.cos(a)*.045,Math.sin(a)*.045,.04);}
}
for(let i=0;i<9;i++){const b=branches[i%3],t=.5+(i%3)*.2,x=b.x*t+.1*Math.cos(i*2.4),y=.45+(b.h-.45)*t+.12,z=b.z*t+.12*Math.sin(i*2.4);tube([[b.x*t,y-.15,b.z*t],[x,y,z]],.008,cherryWood,flowers);sphere(.035,'#c77998',flowers,x,y,z,.8,1.3,.8);}
// The ribboned gift lifts to reveal a birthday cake.
const gift=interactive(group(.55,.14,1.72),'gift');
rounded(.94,.72,.86,.035,'#b7758b',gift,0,.37,0);
box(.17,.74,.88,'#e1bb82',gift,0,.37,0);box(.96,.74,.13,'#e1bb82',gift,0,.37,0);
const lid=group(0,.78,0,gift);rounded(1.04,.15,.95,.025,'#cf8fa0',lid);box(.18,.16,.97,'#f0ce91',lid);box(1.06,.16,.14,'#f0ce91',lid);
for(const x of [-.16,.16]){const bow=mesh(new THREE.TorusGeometry(.18,.036,8,24),'#e6c48e',lid,x,.19,0);bow.rotation.y=.25;bow.rotation.z=x<0?-.55:.55;bow.scale.set(1,.64,1);}
sphere(.07,'#eed29c',lid,0,.16,.015);
const cake=group(0,.1,0,gift);cake.visible=false;
cyl(.58,.58,.07,'#e6c48d',cake,0,.04,0);cyl(.46,.46,.42,'#edc6ae',cake,0,.28,0);cyl(.47,.47,.1,'#fff0d6',cake,0,.53,0);
for(let i=0;i<12;i++){const a=i*Math.PI/6;sphere(.075,'#fff0d6',cake,Math.cos(a)*.41,.5,Math.sin(a)*.41,1,1.3,1);}
for(let i=0;i<5;i++){const a=i*1.256;sphere(.07,'#ae5e60',cake,Math.cos(a)*.32,.62,Math.sin(a)*.32,.8,1.2,.8);}
cyl(.034,.034,.35,'#a7b4ad',cake,0,.79,0);
const flame=sphere(.075,new THREE.MeshStandardMaterial({color:'#fff3b2',emissive:'#ffa63e',emissiveIntensity:3}),cake,0,1.02,0,.6,1.4,.6);
const candleLight=new THREE.PointLight('#ffb34d',1.5,3);candleLight.position.set(0,1.05,0);cake.add(candleLight);

// Fairy lights drape from the walls, with little pools of gold.
const bulbs=[];
function stringLight(points){tube(points,.012,'#654b3e');for(let i=0;i<points.length;i++){if(i%2)continue;const [x,y,z]=points[i];tube([[x,y,z],[x,y-.07,z]],.01,'#665244');const bulb=sphere(.042,new THREE.MeshStandardMaterial({color:'#ffe4aa',emissive:'#ffba57',emissiveIntensity:2.1}),scene,x,y-.105,z);bulbs.push(bulb);}}
const backPoints=[],leftPoints=[];
for(let i=0;i<=32;i++){const t=i/32;backPoints.push([-4.78+t*9.5,4.02-Math.sin(t*Math.PI)*.36,-3.86]);}
for(let i=0;i<=24;i++){const t=i/24;leftPoints.push([-4.88,4.02-Math.sin(t*Math.PI)*.35,-3.8+t*7.5]);}
stringLight(backPoints);stringLight(leftPoints);
for(let i=0;i<40;i++){const x=-4.9+i*.25;sphere(.062,i%2?'#81915c':'#a1a16c',scene,x,.15,4.03,1.3,.55,1);}
for(let i=0;i<31;i++){const z=-3.7+i*.25;sphere(.062,i%2?'#81915c':'#a1a16c',scene,5.03,.15,z,1,.55,1.3);}
for(const [x,z] of [[-4.65,3.65],[4.65,3.65],[4.65,-3.5]]){const lantern=group(x,.16,z);box(.18,.32,.18,gold,lantern,0,.2,0);box(.13,.23,.13,new THREE.MeshStandardMaterial({color:'#ffe0a6',emissive:'#ffc46e',emissiveIntensity:1}),lantern,0,.2,0);box(.24,.04,.24,'#9e773b',lantern,0,.38,0);}

// Close the dollhouse's open sides only while the visitor is inside.
const interior=group();interior.visible=false;
box(.2,4.3,8.2,'#455e50',interior,5.1,2.25,0);
// A quiet entrance with a recessed door and warm timber trim.
box(10.2,4.3,.2,'#405d50',interior,0,2.25,4.1);
box(1.48,2.8,.05,'#745847',interior,1.15,1.55,3.98);
for(const x of [.38,1.92])box(.09,2.93,.12,'#d5a574',interior,x,1.57,3.92);
box(1.63,.1,.12,'#d5a574',interior,1.15,3.03,3.92);
sphere(.045,gold,interior,.63,1.53,3.89);
box(10.2,.12,8.2,'#b5bba5',interior,0,4.45,0);
box(.13,.18,8,'#9d7c55',interior,4.94,.24,0);
box(10,.18,.13,'#9d7c55',interior,0,.24,3.94);

const extras=createRoomExtras({THREE,scene,group,box,sphere,cyl,tube,rounded,mesh,interactive,reduced});

const referencePlants=addReferencePlants({THREE,scene,group,box,cyl,tube});

// Shared interaction state. The object buttons also support keyboard visitors.
const discovered=new Set();let giftOpened=false,candleOut=false;
const dialog=$('letter');let modalAction=null;
const travelJournal=createTravelJournal({stops:config.travel,name:config.name,age:config.age,onOpen:()=>{movement.clear();down=null;},onProgress:step=>{paintWallMap(mapCanvas,step);mapTexture.needsUpdate=true;}});
const nightSky=createNightSky({name:config.name,age:config.age,onClose:()=>{windowTarget=0;windowOpening=false;movement.clear();document.querySelector('[data-item="window"]').focus();}});
function modalOpen(){return dialog.open||travelJournal.isOpen||nightSky.isOpen||extras.isOpen||windowOpening;}
function openWindow(){movement.clear();windowTarget=1;windowOpening=true;toast('窗外的星星，正在等你。');clearTimeout(windowTimer);windowTimer=setTimeout(()=>{windowOpening=false;nightSky.open();},reduced?0:1000);}


function showLetter(label,title,body,actionLabel,action){
  $('letter-label').textContent=label;$('letter-title').textContent=title;$('letter-body').textContent=body;
  $('letter-sign').textContent=`—— ${config.from}`;
  $('next').hidden=!actionLabel;$('next').textContent=actionLabel||'';modalAction=action;
  movement.clear();if(!dialog.open)dialog.showModal();
}
$('close').onclick=()=>dialog.close();$('next').onclick=()=>modalAction?.();
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
let toastTimer;
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}
function mark(id){discovered.add(id);document.querySelector(`[data-item="${id}"]`)?.classList.add('found');$('progress').textContent=`${discovered.size} / ${document.querySelectorAll("[data-item]").length} 已发现`;}
function openBook(){showLetter('A LETTER FOR YOUR TWENTY-SEVEN',`写给${config.age}岁的${config.name}`,config.book[0]);}
function activate(id){
  mark(id);
  if(id==='tv'){movement.clear();extras.openTV();}
  if(id==='camera'){movement.clear();extras.print();}
  if(id==='rabbit'){extras.catchRabbit();showLetter('A LITTLE WHITE RABBIT','抓到一只小白兔！','祝你今年能有只小兔子。','放它继续玩',()=>{dialog.close();extras.resumeRabbit();});}
  if(id==='window')openWindow();
  if(id==='map')travelJournal.open();
  if(id==='book')openBook();
  if(id==='moon')showLetter('A LETTER FROM THE MOON','月亮托我，捎句话给你',config.moon);
  if(id==='flowers')showLetter('A LITTLE BLESSING',`冬樱，开在你的${config.age}岁`,config.flowers);
  if(id==='cat'){startAudio();purr();cat.userData.petUntil=performance.now()+3000;toast('呼噜噜……小猫说：今天也要好好休息呀。');}
  if(id==='record')toggleRecord();
  if(id==='gift'){
    if(!giftOpened){giftOpened=true;cake.visible=true;gift.userData.openAt=performance.now();startAudio();playTune(true);celebrate();toast(`${config.name}，${config.age}岁生日快乐！许个愿，再点蛋糕吹灭蜡烛。`);$('hint').textContent='愿望留在心里就好 · 再点蛋糕，吹灭蜡烛';document.querySelector('[data-item="gift"]').textContent='⑥ 吹灭蜡烛 ✧';}
    else if(!candleOut){candleOut=true;flame.visible=false;candleLight.visible=false;celebrate();showLetter('MAKE A WISH','愿你所愿，慢慢实现',config.wish,'再许一个愿 ↺',()=>{dialog.close();candleOut=false;flame.visible=true;candleLight.visible=true;toast('蜡烛又亮起来了，再许一个愿吧。');});document.querySelector('[data-item="gift"]').textContent='⑥ 生日蛋糕 ✧';}
    else showLetter('HAPPY BIRTHDAY',`${config.name}，${config.age}岁生日快乐`,config.wish,'重新点亮蜡烛 ↺',()=>{dialog.close();candleOut=false;flame.visible=true;candleLight.visible=true;toast('蜡烛又亮起来了。');});
  }
}
document.querySelectorAll('[data-item]').forEach(b=>b.onclick=()=>activate(b.dataset.item));
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();
const itemNames={tv:'小电视',camera:'宝丽莱 I-2',rabbit:'捉住小白兔',window:'推开窗户',map:'旅行地图',book:`${config.age}岁的信`,moon:'月亮来信',cat:'摸摸小猫',record:'留声机',flowers:'一枝冬樱',gift:'生日礼物'};
let focusedItem=null,down;
function castItem(x,y){
  pointer.set(x,y);ray.setFromCamera(pointer,camera);
  for(const h of ray.intersectObjects(scene.children,true)){
    let obj=h.object,item=null,visible=true;
    while(obj){if(!obj.visible){visible=false;break;}if(obj.userData.item)item=obj.userData.item;obj=obj.parent;}
    if(!visible)continue;
    if(item&&(!walking||h.distance<2.7))return item;
    return null;
  }return null;
}
function hit(e){const r=host.getBoundingClientRect();return castItem((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);}
function look(){walkCamera.rotation.set(pitch,yaw,0,'YXZ');}
function setWalking(value){
  if(value&&!renderer){toast('当前浏览器无法进入 3D，可以用下方按钮打开祝福。');return;}
  walking=value;movement.clear();down=null;document.body.classList.toggle('walking',value);
  $('walk-ui').hidden=!value;interior.visible=value;
  if(controls)controls.enabled=!value;
  camera=value?walkCamera:overviewCamera;
  if(value){walkCamera.position.set(.95,1.7,3.55);yaw=.18;pitch=-.13;look();$('exit-room').focus();}
  else $('enter-room').focus();
  resize();
}
$('enter-room').onclick=()=>setWalking(true);$('exit-room').onclick=()=>setWalking(false);
$('interact').onclick=()=>{if(focusedItem)activate(focusedItem);};
const keyMoves={KeyW:'forward',ArrowUp:'forward',KeyS:'back',ArrowDown:'back',KeyA:'left',ArrowLeft:'left',KeyD:'right',ArrowRight:'right'};
window.addEventListener('keydown',e=>{
  if(!walking||modalOpen())return;
  if(keyMoves[e.code]){e.preventDefault();movement.add(keyMoves[e.code]);}
  if(e.code==='KeyF'&&!e.repeat){e.preventDefault();if(focusedItem)activate(focusedItem);}
  if(e.code==='Escape')setWalking(false);
});
window.addEventListener('keyup',e=>{if(keyMoves[e.code])movement.delete(keyMoves[e.code]);});
window.addEventListener('blur',()=>{movement.clear();down=null;});
document.addEventListener('visibilitychange',()=>{movement.clear();down=null;});
document.querySelectorAll('[data-move]').forEach(button=>{
  button.addEventListener('pointerdown',e=>{e.preventDefault();button.setPointerCapture(e.pointerId);movement.add(button.dataset.move);});
  for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>movement.delete(button.dataset.move));
});
if(renderer){
  const canvas=renderer.domElement;
  canvas.addEventListener('pointerdown',e=>{if(down)return;down={id:e.pointerId,x:e.clientX,y:e.clientY,lastX:e.clientX,lastY:e.clientY,time:performance.now(),drag:0};if(walking)canvas.setPointerCapture(e.pointerId);});
  canvas.addEventListener('pointermove',e=>{
    if(walking&&down&&down.id===e.pointerId){const dx=e.clientX-down.lastX,dy=e.clientY-down.lastY;down.drag+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=Math.max(-1.15,Math.min(1.1,pitch-dy*.004));down.lastX=e.clientX;down.lastY=e.clientY;look();}
    else if(!down)canvas.style.cursor=hit(e)?'pointer':'grab';
  });
  canvas.addEventListener('pointerup',e=>{if(down&&down.id===e.pointerId){if(down.drag<8&&Math.hypot(e.clientX-down.x,e.clientY-down.y)<8&&performance.now()-down.time<700){const id=hit(e);if(id)activate(id);}down=null;}});
  canvas.addEventListener('pointercancel',()=>{down=null;});
}
$('reset').onclick=()=>{overviewCamera.position.set(8.5,10.5,16);controls?.target.set(0,1.3,0);controls?.update();};
// Simple horizontal collision volumes leave a walkable path around each object.
const obstacles=[[-4.7,-3.8,2.62,3.55],[3.88,4.75,-3.9,-3.1],[2.95,4.65,-.2,1.1],[-2.5,-1.25,-3.75,-2.55],[-4.75,-2.9,-1.65,1.3],[-.23,1.13,-3.62,-2.42],[-2.1,-.2,-.4,1.1],[-3.35,-2,1.65,2.8],[3.5,4.1,-2.08,-1.42],[.02,1.12,1.18,2.3],[-4.5,-3.9,-2.65,-1.9],[-4.5,-2.8,-3.9,-3.1],[4.15,4.85,1.2,1.8]];
function canStand(x,z){const r=.18;return x>-4.72&&x<4.7&&z>-3.65&&z<3.72&&!obstacles.some(([l,rgt,b,t])=>x>l-r&&x<rgt+r&&z>b-r&&z<t+r);}
function walkFrame(dt){
  if(!walking)return;
  if(!modalOpen()){
    let f=Number(movement.has('forward'))-Number(movement.has('back')),s=Number(movement.has('right'))-Number(movement.has('left'));
    const length=Math.hypot(f,s)||1;f/=length;s/=length;
    const dx=(-Math.sin(yaw)*f+Math.cos(yaw)*s)*dt*1.45,dz=(-Math.cos(yaw)*f-Math.sin(yaw)*s)*dt*1.45;
    if(canStand(walkCamera.position.x+dx,walkCamera.position.z))walkCamera.position.x+=dx;
    if(canStand(walkCamera.position.x,walkCamera.position.z+dz))walkCamera.position.z+=dz;
  }
  focusedItem=modalOpen()?null:castItem(0,0);
  const text=focusedItem?`F · ${itemNames[focusedItem]}`:'靠近小物件，发现惊喜';
  if($('interact').textContent!==text)$('interact').textContent=text;
  $('interact').disabled=!focusedItem;
  $('walk-ui').classList.toggle('has-target',!!focusedItem);
}
// Locally synthesized sound: no music downloads, no autoplay.
let audio,mute=true,scheduled=[],musicTimer,recordPausedByMute=false;
const recordAudio=$('record-audio');
recordAudio.volume=.65;
if(config.music?.src)recordAudio.src=config.music.src;
const recordButton=document.querySelector('[data-item="record"]');
recordButton.setAttribute('aria-pressed','false');
recordAudio.addEventListener('play',()=>recordButton.setAttribute('aria-pressed','true'));
recordAudio.addEventListener('pause',()=>recordButton.setAttribute('aria-pressed','false'));
recordAudio.addEventListener('error',()=>{recordButton.setAttribute('aria-pressed','false');toast('音乐暂时没有加载成功，可以稍后再点一次留声机。');});
function stopSynth(){clearTimeout(musicTimer);scheduled.forEach(o=>{try{o.stop()}catch{}});scheduled=[];}
function toggleRecord(){
  if(!config.music?.src){startAudio();playTune(false);toast('送你一小段原创旋律，陪你在这里坐一会儿。');return;}
  recordPausedByMute=false;
  if(!recordAudio.paused){recordAudio.pause();toast('音乐暂停了，想听时再点一下留声机。');return;}
  startAudio();stopSynth();
  recordAudio.play().then(()=>toast(`正在播放 · ${config.music.title}${config.music.artist?' — '+config.music.artist:''}`)).catch(()=>toast('音乐暂时无法播放，请再点一次留声机。'));
}
function soundState(){ $('sound').setAttribute('aria-pressed',String(!mute));$('sound').querySelector('span').textContent=mute?'声音关':'声音开';}
function startAudio(){try{audio ||= new (window.AudioContext||window.webkitAudioContext)();audio.resume();mute=false;soundState();}catch{toast('当前浏览器暂不支持声音，祝福仍然可以打开。');}}
$('sound').onclick=()=>{if(mute){startAudio();if(recordPausedByMute){recordPausedByMute=false;recordAudio.play().catch(()=>toast('再点一次留声机，继续听这首歌。'));}}else{mute=true;audio?.suspend();recordPausedByMute=!recordAudio.paused;recordAudio.pause();stopSynth();soundState();}};
function note(freq,time,len=.38,volume=.07){if(!audio||mute)return;const o=audio.createOscillator(),gain=audio.createGain();o.type='sine';o.frequency.value=freq;gain.gain.setValueAtTime(0,time);gain.gain.linearRampToValueAtTime(volume,time+.008);gain.gain.exponentialRampToValueAtTime(.0001,time+len);o.connect(gain);gain.connect(audio.destination);o.start(time);o.stop(time+len+.02);scheduled.push(o);o.onended=()=>{o.disconnect();gain.disconnect();scheduled=scheduled.filter(x=>x!==o)};}
function playTune(birthday){if(!audio||mute)return;stopSynth();if(birthday){recordAudio.pause();recordPausedByMute=false;}
  const notes=birthday?[[0,0],[0,.7],[2,1],[0,2],[5,3],[4,4],[0,6],[0,6.7],[2,7],[0,8],[7,9],[5,10],[0,12],[0,12.7],[12,13],[9,14],[5,15],[4,16],[2,17],[10,19],[10,19.7],[9,20],[5,21],[7,22],[5,23]]:[[0,0],[7,1],[12,2],[11,3],[7,4],[4,5],[2,6],[7,7],[5,8],[4,9],[2,10],[0,11]];
  notes.forEach(([n,t])=>{const when=audio.currentTime+.1+t*.32;note(523.25*Math.pow(2,n/12),when,.8,.06);note(261.625*Math.pow(2,n/12),when,.9,.018);});
}
function purr(){if(!audio||mute)return;const len=2.5,buffer=audio.createBuffer(1,audio.sampleRate*len,audio.sampleRate),data=buffer.getChannelData(0);let last=0;for(let i=0;i<data.length;i++){last=(last+Math.random()*.08-.04)*.98;data[i]=last*(.45+.55*Math.sin(i/audio.sampleRate*2*Math.PI*26))*(Math.sin(Math.PI*i/data.length));}const source=audio.createBufferSource(),gain=audio.createGain();source.buffer=buffer;gain.gain.value=.5;source.connect(gain);gain.connect(audio.destination);source.start();}
// Golden and rose fireworks on a transparent overlay.
const fx=$('celebration'),ctx=fx.getContext('2d');let particles=[],lastFire=0;
function celebrate(){if(reduced)return;lastFire=performance.now();for(let burst=0;burst<4;burst++){const x=innerWidth*(.2+Math.random()*.6),y=innerHeight*(.18+Math.random()*.35);for(let j=0;j<45;j++){const a=j/45*Math.PI*2,s=1+Math.random()*3;particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:1,delay:burst*.35,color:['#e8c78a','#e7a9ba','#f9e5bf'][j%3]});}}}
function fireFrame(){if(!particles.length){ctx.clearRect(0,0,fx.width,fx.height);return;}if(fx.width!==innerWidth||fx.height!==innerHeight){fx.width=innerWidth;fx.height=innerHeight;}ctx.clearRect(0,0,fx.width,fx.height);for(const p of particles){if(p.delay>0){p.delay-=.016;continue;}p.x+=p.vx;p.y+=p.vy;p.vy+=.022;p.vx*=.99;p.life-=.008;ctx.globalAlpha=Math.max(0,p.life);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,1.7,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;particles=particles.filter(p=>p.life>0);}
function resize(){if(!renderer)return;const w=host.clientWidth,h=host.clientHeight;renderer.setSize(w,h);const aspect=w/h,vertical=aspect<1?12.2:11.2;overviewCamera.left=-vertical*aspect/2;overviewCamera.right=vertical*aspect/2;overviewCamera.top=vertical/2;overviewCamera.bottom=-vertical/2;overviewCamera.updateProjectionMatrix();walkCamera.aspect=aspect;walkCamera.updateProjectionMatrix();}
new ResizeObserver(resize).observe(host);resize();
const clock=new THREE.Clock();
function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;walkFrame(dt);extras.update(t,dt,modalOpen());if(!reduced)referencePlants.update(t);
  windowAmount+=(windowTarget-windowAmount)*Math.min(1,dt*5);windowLeaves[0].rotation.y=-windowAmount*1.45;windowLeaves[1].rotation.y=windowAmount*1.45;
  if(!reduced){cat.scale.y=1+Math.sin(t*2)*.015;bulbs.forEach((b,i)=>{b.material.emissiveIntensity=1.9+Math.sin(t*1.2+i)*.16;});if(cat.userData.petUntil>performance.now())head.rotation.z=Math.sin(t*5)*.07;else head.rotation.z=0;flame.scale.y=1.4+Math.sin(t*11)*.12;}
  if(giftOpened){const p=reduced?1:Math.min(1,(performance.now()-gift.userData.openAt)/900),ease=1-Math.pow(1-p,3);lid.position.set(-.7*ease,.78+1.7*ease,-.5*ease);lid.rotation.z=-.5*ease;lid.scale.setScalar(1-.95*ease);lid.visible=p<1;cake.position.y=.1+.76*ease;}
  if(!walking)controls?.update();renderer?.render(scene,camera);fireFrame();
}
animate();if(renderer)$('loading').hidden=true;
window.addEventListener('error',()=>{if(renderer)$('loading').hidden=true;});
