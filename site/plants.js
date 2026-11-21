// Broad patterned foliage inspired by the two user-supplied houseplant photos.
// Geometry and textures are local and procedural, ready for static hosting.
export function addReferencePlants({THREE,scene,group,box,cyl,tube}){
 const foliage=[];
 function leafTexture(type){
  const canvas=document.createElement('canvas');canvas.width=384;canvas.height=640;const c=canvas.getContext('2d'),x=192;
  const outline=new Path2D();outline.moveTo(x,615);
  if(type==='veins'){
   outline.bezierCurveTo(160,522,75,598,44,497);outline.bezierCurveTo(24,399,104,201,x,19);outline.bezierCurveTo(280,201,360,399,340,497);outline.bezierCurveTo(309,598,224,522,x,615);
  }else{
   outline.bezierCurveTo(55,548,36,356,60,227);outline.bezierCurveTo(74,126,139,53,x,16);outline.bezierCurveTo(245,53,310,126,324,227);outline.bezierCurveTo(348,356,329,548,x,615);
  }
  c.save();c.clip(outline);
  const gradient=c.createLinearGradient(20,0,370,640);gradient.addColorStop(0,type==='veins'?'#193e32':'#244e36');gradient.addColorStop(.48,type==='veins'?'#285342':'#344f36');gradient.addColorStop(1,'#173d32');c.fillStyle=gradient;c.fillRect(0,0,384,640);
  if(type==='stripe'){
   for(let row=0;row<10;row++)for(const sign of [-1,1]){
    const y=88+row*49,width=42+Math.sin((y/640)*Math.PI)*96;
    c.fillStyle=['#a8b85c','#bbca78','#8ea951'][row%3];c.beginPath();c.moveTo(x+sign*6,y+36);c.bezierCurveTo(x+sign*width*.6,y+6,x+sign*width*.95,y-23,x+sign*width,y-12);c.bezierCurveTo(x+sign*width*.96,y+12,x+sign*width*.45,y+49,x+sign*6,y+45);c.fill();
   }
  }
  c.strokeStyle=type==='veins'?'#a3b37f':'#d1cf86';c.lineWidth=type==='veins'?5:2.5;c.beginPath();c.moveTo(x,620);c.quadraticCurveTo(182,260,x,30);c.stroke();
  for(let i=0;i<8;i++)for(const sign of [-1,1]){
   const y=130+i*53,spread=Math.sin(y/640*Math.PI)*(type==='veins'?145:129);
   c.lineWidth=type==='veins'?3:1.1;c.strokeStyle=type==='veins'?'#8d9e72':'#c8ca8c99';c.beginPath();c.moveTo(x,y+31);c.quadraticCurveTo(x+sign*spread*.5,y+13,x+sign*spread,y-39);c.stroke();
   if(type==='veins'){c.strokeStyle='#79916c88';c.lineWidth=1.2;for(let k=1;k<=2;k++){c.beginPath();c.moveTo(x+sign*spread*.45,y+6);c.lineTo(x+sign*spread*.8,y+10+k*14);c.stroke();}}
  }
  c.restore();c.strokeStyle=type==='veins'?'#879a6b':'#a1ae67';c.lineWidth=2;c.stroke(outline);
  const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;return texture;
 }
 const leafMaterials=Object.fromEntries(['veins','stripe'].map(type=>[type,new THREE.MeshStandardMaterial({map:leafTexture(type),side:THREE.DoubleSide,alphaTest:.4,roughness:.66,metalness:0})]));
 const potCanvas=document.createElement('canvas');potCanvas.width=256;potCanvas.height=160;const pc=potCanvas.getContext('2d');pc.fillStyle='#59666b';pc.fillRect(0,0,256,160);pc.strokeStyle='#8d979b';pc.lineWidth=1.6;
 for(let i=-160;i<400;i+=16){pc.beginPath();pc.moveTo(i,0);pc.lineTo(i+160,160);pc.stroke();pc.beginPath();pc.moveTo(i,0);pc.lineTo(i-160,160);pc.stroke();}
 const potTexture=new THREE.CanvasTexture(potCanvas);potTexture.colorSpace=THREE.SRGBColorSpace;
 const potMaterial=new THREE.MeshStandardMaterial({map:potTexture,roughness:.85});
 const leafGeo=new THREE.PlaneGeometry(.36,.76,10,16);leafGeo.translate(0,.38,0);
 const pos=leafGeo.attributes.position;for(let i=0;i<pos.count;i++){const xx=pos.getX(i),yy=pos.getY(i);pos.setZ(i,.085*Math.sin(yy/.76*Math.PI)-Math.abs(xx)*.19);}leafGeo.computeVertexNormals();
 function plant(x,y,z,scale,type,turn=0){
  const p=group(x,y,z);p.scale.setScalar(scale);p.rotation.y=turn;
  cyl(.275,.275,.035,'#d8d7c8',p,0,.025,0);cyl(.255,.19,.43,potMaterial,p,0,.26,0);cyl(.264,.264,.035,'#deded0',p,0,.48,0);cyl(.236,.236,.012,'#413e2e',p,0,.493,0);
  for(let i=0;i<13;i++){
   const a=i*2.399,inner=i>8,rad=inner?.1:.22+(i%3)*.05,h=inner?1.05+(i%3)*.1:.65+(i%4)*.105;
   const xx=Math.cos(a)*rad,zz=Math.sin(a)*rad;
   tube([[0,.49,0],[xx*.25,.62,zz*.25],[xx*.8,h-.12,zz*.8],[xx,h,zz]],.012,i%3?'#657447':'#859054',p);
   const g=group(xx,h,zz,p);g.rotation.y=-a+Math.PI/2;g.rotation.x=inner?-.3:-(.45+(i%4)*.18);g.rotation.z=(i%3-1)*.17;
   const leaf=new THREE.Mesh(leafGeo,leafMaterials[type]);leaf.castShadow=true;leaf.receiveShadow=true;leaf.scale.setScalar(inner?.8:1+(i%3)*.1);g.add(leaf);foliage.push({g,base:g.rotation.z,phase:i+a});
  }return p;
 }
 // Floor pots stay close to the walls, outside the main circulation routes.
 plant(-4.25,.14,3.08,1.02,'veins',.5);
 plant(4.32,.14,-3.48,1.15,'stripe',-.8);
 // A smaller patterned plant on its own little wall shelf.
 box(.7,.09,.88,'#b58b61',scene,-4.67,2.55,-2.1);
 plant(-4.61,2.6,-2.1,.49,'stripe',.6);
 // Small silver-veined leaves on the left side of the window sill.
 plant(2.24,1.16,-3.52,.39,'veins',-.2);
 return {update(t){for(const f of foliage)f.g.rotation.z=f.base+Math.sin(t*.7+f.phase)*.012;}};
}
