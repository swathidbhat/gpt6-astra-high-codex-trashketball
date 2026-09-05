import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { BINS } from './physics';
const mat = (color: THREE.ColorRepresentation, roughness=0.8, metalness=0) => new THREE.MeshStandardMaterial({ color, roughness, metalness });
export function box(parent: THREE.Object3D, w:number,h:number,d:number,x:number,y:number,z:number,material:THREE.Material, rounded=0) {
  const mesh = new THREE.Mesh(rounded ? new RoundedBoxGeometry(w,h,d,3,rounded) : new THREE.BoxGeometry(w,h,d), material);
  mesh.position.set(x,y,z); mesh.castShadow=true; mesh.receiveShadow=true; parent.add(mesh); return mesh;
}
function cylinder(parent:THREE.Object3D, rt:number,rb:number,h:number,x:number,y:number,z:number,m:THREE.Material,open=false) {
  const mesh=new THREE.Mesh(new THREE.CylinderGeometry(rt,rb,h,48,1,open),m);mesh.position.set(x,y,z);mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
}
function label(parent:THREE.Object3D, text:string, x:number,y:number,z:number,w:number,h:number, background='#d7ded6', color='#284b42') {
  const c=document.createElement('canvas');c.width=1024;c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle=background;ctx.fillRect(0,0,1024,256);ctx.fillStyle=color;ctx.font='500 100px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,512,128);
  const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:tex}));m.position.set(x,y,z);parent.add(m);return m;
}
function floorTexture() {
  const c=document.createElement('canvas');c.width=c.height=256;const ctx=c.getContext('2d')!;ctx.fillStyle='#3d6557';ctx.fillRect(0,0,256,256);
  let seed=67;for(let i=0;i<22000;i++){seed=(seed*16807)%2147483647;const x=seed%256;seed=(seed*16807)%2147483647;const y=seed%256;ctx.fillStyle=i%2?'#54776a':'#31564b';ctx.globalAlpha=0.28;ctx.fillRect(x,y,1,2);}const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(18,22);t.colorSpace=THREE.SRGBColorSpace;return t;
}
function desk(parent:THREE.Object3D,x:number,z:number,rotation=0) {
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);
  const ivory=mat('#c4cbb8'), dark=mat('#17332e'), silver=mat('#798c82',.4,.6);
  box(g,2.65,.12,1.2,0,1.02,0,ivory,.035);for(const xx of [-1.12,1.12]){box(g,.065,1,.85,xx,.5,0,silver);}
  box(g,2.65,1,.1,0,1.55,-.58,mat('#608276'));box(g,.75,.65,.65,0,1.41,-.06,ivory,.07);
  box(g,.57,.43,.02,0,1.44,.275,dark,.025);label(g,'04  17  09',0,1.43,.29,.49,.13,'#142c28','#93d5b5');
  box(g,.2,.14,.25,0,1.11,0,dark);box(g,.75,.055,.26,0,1.1,.43,ivory,.018);
  for(let i=0;i<10;i++)for(let j=0;j<3;j++)box(g,.042,.009,.042,-.29+i*.064,1.133,.35+j*.065,mat('#7b8d7b'));
  box(g,.45,.035,.3,.9,1.106,.24,mat('#ecebdb'));cylinder(g,.07,.06,.17,-.85,1.16,.25,mat('#e2dcca'));
  const chair=new THREE.Group();g.add(chair);chair.position.set(0,0,1.05);box(chair,.65,.14,.59,0,.59,0,dark,.08);box(chair,.66,.6,.14,0,.98,.28,dark,.07);cylinder(chair,.055,.055,.48,0,.3,0,silver);for(let i=0;i<5;i++){const a=i*Math.PI*2/5;const leg=box(chair,.055,.04,.6,Math.sin(a)*.17,.1,Math.cos(a)*.17,silver);leg.rotation.y=a;}
}
export function makeBin(parent:THREE.Object3D, level:number) {
  const b=BINS[level-1];const g=new THREE.Group();g.position.set(b.x,0,b.z);parent.add(g);
  const m=mat(level===1?'#334e45':'#b1976c',.5,level===1?.5:.25);m.side=THREE.DoubleSide;
  cylinder(g,b.radius,b.bottomRadius,b.height,0,b.height/2,0,m,true);
  cylinder(g,b.bottomRadius,b.bottomRadius,.045,0,.03,0,mat('#1c302a'));
  const rim=new THREE.Mesh(new THREE.TorusGeometry(b.radius,.025,12,64),mat(level===1?'#9cae9d':'#dcc79a',.3,.7));rim.rotation.x=Math.PI/2;rim.position.y=b.height;g.add(rim);
  if(level===1){for(let i=0;i<36;i++){const a=i*Math.PI*2/36;const line=new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(Math.cos(a)*b.bottomRadius,.03,Math.sin(a)*b.bottomRadius),new THREE.Vector3(Math.cos(a)*b.radius,b.height,Math.sin(a)*b.radius)]);g.add(new THREE.Line(line,new THREE.LineBasicMaterial({color:'#789082',transparent:true,opacity:.65})));}for(let i=1;i<12;i++){const r=b.bottomRadius+(b.radius-b.bottomRadius)*i/12;const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.005,3,48),mat('#607a6b'));ring.position.y=b.height*i/12;ring.rotation.x=Math.PI/2;g.add(ring);}}
  else { for(let i=0;i<48;i++){const a=i*Math.PI*2/48;cylinder(g,.009,.009,b.height-.06,Math.cos(a)*(b.radius-.03),b.height/2,Math.sin(a)*(b.radius-.03),mat('#cab58c'));}}
  return g;
}
export function buildOffice(scene:THREE.Scene) {
  scene.background=new THREE.Color('#c7d5c8');scene.fog=new THREE.Fog('#c7d5c8',20,42);
  const room=new THREE.Group();scene.add(room);const plaster=mat('#ced6c9'),trim=mat('#819b8e');
  box(room,24,.16,32,0,-.09,-7,new THREE.MeshStandardMaterial({map:floorTexture(),roughness:1}));
  box(room,24,5,.2,0,2.5,-14,plaster);box(room,.2,5,32,-12,2.5,-7,plaster);box(room,.2,5,32,12,2.5,-7,plaster);
  box(room,24,.1,32,0,5,-7,mat('#ccd6cc'));
  for(let x=-12;x<=12;x+=2){box(room,.025,.02,32,x,4.94,-7,trim);}for(let z=-22;z<=8;z+=2){box(room,24,.02,.025,0,4.94,z,trim);}
  const glow=new THREE.MeshStandardMaterial({color:'#fbfff2',emissive:'#e9ffe8',emissiveIntensity:1.6});
  for(const x of [-7,-1,5])for(const z of [-10,-4,2])box(room,1.2,.035,2,x,4.91,z,glow);
  for(const x of [-7,-3.5,3.5,7])for(const z of [-9,-5])desk(room,x,z,x<0?-.12:.12);
  // Workstations frame an open throwing aisle.
  desk(room,-4.8,1.1,-.15);desk(room,5.1,.6,.15);
  box(room,4.1,3.2,.18,0,1.6,-13.83,mat('#77988a'));box(room,1.65,2.75,.1,0,1.39,-13.7,mat('#a2b6a4'));box(room,.12,.12,.1,.55,1.1,-13.61,mat('#e4e5ca',.3,.7));
  label(room,'L U M O N',0,3.82,-13.72,3.1,.68);label(room,'MACRODATA REFINEMENT',0,3.16,-13.7,2.55,.3);
  for(const x of [-9,9]){box(room,.8,1.55,.6,x,.77,-12,mat('#99aa9a'));for(let y=.35;y<1.5;y+=.4)box(room,.25,.04,.04,x,y,-11.67,trim);}
  const hemi=new THREE.HemisphereLight('#e9fff0','#263e30',2.1);scene.add(hemi);
  const light=new THREE.DirectionalLight('#f4ffdf',2.8);light.position.set(-3,4.65,2);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.camera.left=-14;light.shadow.camera.right=14;light.shadow.camera.top=14;light.shadow.camera.bottom=-16;light.shadow.normalBias=.03;scene.add(light);
  makeBin(room,1);return room;
}
function sofa(parent:THREE.Object3D,x:number,z:number,rotation:number,color:string) {
  const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rotation;parent.add(g);
  const fabric=mat(color,.97),piping=mat('#c9bda2'),wood=mat('#65472e');
  box(g,3.8,.32,1.55,0,.33,0,fabric,.15);
  for(const xx of [-1.15,0,1.15]){box(g,1.12,.27,1.21,xx,.6,.07,fabric,.12);const back=box(g,1.15,.86,.33,xx,.97,-.57,fabric,.13);back.rotation.x=-.12;}
  for(const xx of [-1.82,1.82])box(g,.27,.72,1.6,xx,.64,0,fabric,.13);
  for(const xx of [-1.5,1.5])for(const zz of [-.5,.5])box(g,.11,.16,.11,xx,.12,zz,wood,.02);
  for(const xx of [-1.1,1.12]){const pillow=box(g,.55,.55,.19,xx,.99,-.22,xx<0?mat('#c2b491'):mat('#8a927c'),.12);pillow.rotation.z=xx<0?.18:-.18;pillow.rotation.x=-.18;}
  const throwBlanket=box(g,.66,.04,1.1,1.05,.76,.24,piping,.015);throwBlanket.rotation.y=.14;
}
function palm(parent:THREE.Object3D,x:number,z:number,scale=1) {
  const g=new THREE.Group();g.position.set(x,0,z);g.scale.setScalar(scale);parent.add(g);
  cylinder(g,.37,.27,.65,0,.325,0,mat('#c9b997'));cylinder(g,.32,.32,.04,0,.66,0,mat('#594b31'));
  const curve=new THREE.CatmullRomCurve3([new THREE.Vector3(0,.55,0),new THREE.Vector3(.05,1.6,0),new THREE.Vector3(.27,2.9,0)]);
  const trunk=new THREE.Mesh(new THREE.TubeGeometry(curve,12,.055,7,false),mat('#8c7650'));g.add(trunk);
  for(let i=0;i<9;i++){const angle=i*Math.PI*2/9;const leafCurve=new THREE.CatmullRomCurve3([new THREE.Vector3(.27,2.85,0),new THREE.Vector3(.27+Math.cos(angle)*.62,3.13,Math.sin(angle)*.62),new THREE.Vector3(.27+Math.cos(angle)*1.2,2.48,Math.sin(angle)*1.2)]);
    const stem=new THREE.Mesh(new THREE.TubeGeometry(leafCurve,10,.018,4,false),mat('#46613b'));g.add(stem);
    for(let j=1;j<10;j++){const t=j/10,pt=leafCurve.getPoint(t);for(const side of [-1,1]){const leaf=new THREE.Mesh(new THREE.SphereGeometry(1,7,5),mat(j%2?'#557044':'#6f8953'));leaf.scale.set(.1,.025,.32*(1-t*.55));leaf.position.copy(pt);leaf.rotation.y=-angle+side*.7;leaf.rotation.z=side*.18;g.add(leaf);}}
  }
}
export function buildBeach(scene:THREE.Scene) {
  scene.background=new THREE.Color('#b5dbdf');scene.fog=new THREE.Fog('#bfdddd',45,140);
  const room=new THREE.Group();scene.add(room);const stone=mat('#e0d5be',.75),wall=mat('#ece4d1'),oak=mat('#b29a75'),brass=mat('#bc995e',.32,.72),black=mat('#353d37',.36,.5);
  box(room,24,.2,28,0,-.12,-4,stone);for(let x=-12;x<12;x+=2)box(room,.008,.003,28,x,-.012,-4,mat('#c0b59e'));for(let z=-18;z<10;z+=2)box(room,24,.003,.008,0,-.011,z,mat('#c0b59e'));
  box(room,24,.18,28,0,7.2,-4,wall);box(room,.2,7.2,28,-12,3.6,-4,wall);box(room,.2,7.2,28,12,3.6,-4,wall);
  // A full-height glass facade opens the double-height room to the sea.
  for(const x of [-12,-8,-4,0,4,8,12])box(room,.095,7.2,.18,x,3.6,-11,black);
  for(const y of [.09,4.65,7.1])box(room,24,.085,.18,0,y,-11,black);
  const glass=new THREE.MeshPhysicalMaterial({color:'#cae7e0',transparent:true,opacity:.055,roughness:.04,depthWrite:false,side:THREE.DoubleSide});box(room,23.8,7,.018,0,3.55,-11.03,glass);
  // Linen curtains hang in long, soft folds along each side of the glazing.
  for(const side of [-1,1])for(let i=0;i<12;i++)cylinder(room,.11,.13,6.8,side*(10.55+i*.115),3.58,-10.72,mat(i%2?'#e2d9c3':'#d4c9af'));
  for(let x=-10;x<=10;x+=5)box(room,.22,.3,27,x,7,-4,oak);
  box(room,10,.018,6,-.6,.015,-1.8,mat('#c8baa0',1),.02);
  for(let i=0;i<22;i++)box(room,10,.006,.012,-.6,.028,-4.7+i*.27,mat('#b9aa91',1));
  sofa(room,-4.6,-3.2,Math.PI/2,'#e7dfc9');sofa(room,4.8,-4.1,-Math.PI/2,'#b59a76');
  box(room,1.6,.38,2,-4.05,.34,-.95,mat('#e7dfc9'),.15);box(room,1.55,.22,1.94,-4.05,.63,-.95,mat('#e7dfc9'),.14);
  cylinder(room,1.15,1.2,.14,2.8,.48,-1.5,mat('#b1a189',.5));cylinder(room,.65,.72,.38,2.8,.23,-1.5,mat('#746550'));
  const book=box(room,.6,.07,.42,2.54,.6,-1.37,mat('#e8dfc7'));book.rotation.y=.24;box(room,.44,.065,.34,2.55,.67,-1.4,mat('#667264'));
  cylinder(room,.13,.15,.3,3.13,.69,-1.8,mat('#eee5d1'));cylinder(room,.14,.1,.025,3.13,.86,-1.8,mat('#394333'));
  cylinder(room,.52,.52,.07,-6.3,.75,-6.4,brass);cylinder(room,.05,.05,.7,-6.3,.37,-6.4,brass);cylinder(room,.36,.36,.05,-6.3,.05,-6.4,brass);
  cylinder(room,.19,.12,.4,-6.3,.98,-6.4,mat('#9a6a4d'));
  // Sculptural brass pendant lights emphasize the high ceiling.
  for(const [x,z,y,r] of [[-3,-3,4.7,.9],[3,-5,5.5,1.15],[2,0,5.1,.7]]){cylinder(room,.012,.012,7.1-y,x,(7.1+y)/2,z,brass);const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.035,8,64),brass);ring.rotation.x=Math.PI/2;ring.position.set(x,y,z);room.add(ring);const glow=new THREE.Mesh(new THREE.TorusGeometry(r,.014,7,64),new THREE.MeshBasicMaterial({color:'#fff2cc'}));glow.rotation.x=Math.PI/2;glow.position.set(x,y-.028,z);room.add(glow);}
  palm(room,-8.2,-8.3,1.5);palm(room,8,-8,1.65);
  // Sand, water and distant shoreline are actual 3D geometry beyond the glass.
  box(room,200,.12,70,0,-.22,-40,mat('#e8d6ac'));box(room,200,.12,170,0,-.31,-142,mat('#4eabae',.22,.15));
  const oceanGeo=new THREE.PlaneGeometry(180,140,90,65);oceanGeo.rotateX(-Math.PI/2);const pos=oceanGeo.attributes.position;
  for(let i=0;i<pos.count;i++){pos.setY(i,Math.sin(pos.getX(i)*.25+pos.getZ(i)*.4)*.035+Math.sin(pos.getZ(i)*.75)*.035);}oceanGeo.computeVertexNormals();const ocean=new THREE.Mesh(oceanGeo,mat('#58b6b7',.28,.12));ocean.position.set(0,-.14,-119);room.add(ocean);
  for(let i=0;i<15;i++){const points=[];for(let x=-70;x<=70;x+=2)points.push(new THREE.Vector3(x,-.07,-45-i*4+Math.sin(x*.12+i)*.4));room.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points),new THREE.LineBasicMaterial({color:'#def2df',transparent:true,opacity:.28})));}
  box(room,26,.05,4,0,-.07,-13,oak);for(let i=0;i<40;i++)box(room,.012,.008,4,-13+i*.66,-.039,-13,mat('#816b4a'));
  // Distant coastal palms, beyond the terrace.
  palm(room,-16,-22,2.3);palm(room,19,-25,2.8);
  const hemi=new THREE.HemisphereLight('#d9f6ff','#9b8562',2.1);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff0ca',4.2);sun.position.set(-12,8,-28);sun.target.position.set(2,0,1);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-17;sun.shadow.camera.right=17;sun.shadow.camera.top=16;sun.shadow.camera.bottom=-17;sun.shadow.normalBias=.025;scene.add(sun,sun.target);
  makeBin(room,2);return room;
}
export function makePaper() {
  const geo=new THREE.IcosahedronGeometry(.11,2);const p=geo.attributes.position;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);const scale=1+ .14*Math.sin(x*142+y*97+z*127);p.setXYZ(i,x*scale,y*scale,z*scale);}geo.computeVertexNormals();
  const mesh=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({color:'#f5f1de',roughness:1,flatShading:true}));mesh.castShadow=true;return mesh;
}
