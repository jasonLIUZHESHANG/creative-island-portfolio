import * as T from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { Reflector } from 'three/addons/objects/Reflector.js';

import { MarchingCubes } from 'three/addons/objects/MarchingCubes.js';
import { mossMaterial } from './moss-material.js';

export const pools=[{x:2.8,z:3.1,rx:1.95,rz:1.05},{x:-2.7,z:2.7,rx:.37,rz:.24},{x:1.35,z:-.2,rx:.28,rz:.18}];
const clamp=T.MathUtils.clamp;
function poolRadius(p,x,z){const a=Math.atan2((z-p.z)/p.rz,(x-p.x)/p.rx);return Math.hypot((x-p.x)/p.rx,(z-p.z)/p.rz)/(1+.12*Math.cos(a*3)+.07*Math.cos(a*5)+.035*Math.sin(a*7));}
function hash(x,z){const n=Math.sin(x*127.1+z*311.7)*43758.5453;return n-Math.floor(n);}
function noise(x,z){const a=Math.floor(x),b=Math.floor(z);let u=x-a,v=z-b;u=u*u*(3-2*u);v=v*v*(3-2*v);return T.MathUtils.lerp(T.MathUtils.lerp(hash(a,b),hash(a+1,b),u),T.MathUtils.lerp(hash(a,b+1),hash(a+1,b+1),u),v);}
function baseHeight(x,z){
 const left=2.05*Math.exp(-Math.pow(((x+3.55)/3.5)**2+((z+2.7)/2.8)**2,1.45));
 const leftShoulder=.46*Math.exp(-((x+4.7)**2/6+(z+.1)**2/3.4));
 const right=1.55*Math.exp(-Math.pow(((x-3.5)/3.15)**2+((z+2.5)/2.45)**2,1.45));
 const rightShoulder=.25*Math.exp(-((x-5.0)**2/4+(z-1.8)**2/3));
 const mossShoulders=.13*Math.exp(-((x+4.9)**2/2.8+(z-.6)**2/1.7))
  +.11*Math.exp(-((x+2.2)**2/3.6+(z-3.5)**2/1.4))
  +.10*Math.exp(-((x-4.6)**2/2.5+(z-2.5)**2/1.7));
 const hills=clamp((left+right)/2.2,0,1);
 const handFormed=.12*(noise(x*2.6,z*2.6)-.5)+.055*(noise(x*5.8,z*5.8)-.5)
  +.042*(noise(x*10.7,z*10.7)-.5)+.016*(noise(x*21.3,z*21.3)-.5);
 return .20+left+leftShoulder+right+rightShoulder+mossShoulders+.19*(noise(x*1.35,z*1.35)-.5)+.055*(noise(x*3.8,z*3.8)-.5)+.08*noise(x*.85,z*.85)+hills*handFormed;
}
const pathBeds=Array.from({length:10},(_,i)=>{
 const z=5.9-i*.95+.075*Math.sin(i*1.29),x=-.28-.55*(1-i/9)+.78*Math.sin(i*.71+.25);
 return {x,z,y:baseHeight(x,z),dx:clamp((baseHeight(x+.45,z)-baseHeight(x-.45,z))/.9,-.12,.12),dz:clamp((baseHeight(x,z+.28)-baseHeight(x,z-.28))/.56,-.14,.14)};
});
pools.forEach(p=>p.y=baseHeight(p.x,p.z)-.035);
export function gardenHeight(x,z){let y=baseHeight(x,z);
 for(const bed of pathBeds){const dx=x-bed.x,dz=z-bed.z,r=Math.hypot(dx/.92,dz/.48);if(r<1.45){const fit=bed.y+dx*bed.dx+dz*bed.dz;y=T.MathUtils.lerp(y,fit,1-T.MathUtils.smoothstep(r,.72,1.45));}}
 for(const p of pools){const r=poolRadius(p,x,z);if(r<=1){y=p.y-.005-.14*(1-r*r*r*r);}else if(r<1.5){const bank=Math.max(y,p.y+.025);y=T.MathUtils.lerp(p.y-.005,bank,T.MathUtils.smoothstep(r,1,1.5));}}return y;}
export function gardenWalkable(x,z){return (x/6.4)**2+(z/5.5)**2<1&&pools.every(p=>poolRadius(p,x,z)>1.28);}
const sphere=new T.SphereGeometry(1,40,28);
function material(color){const m=new T.MeshStandardMaterial({color,roughness:.95});return m;}
function mesh(g,geo,color,pos,scale=[1,1,1]){const m=new T.Mesh(geo,typeof color==='number'?material(color):color);m.position.set(...pos);m.scale.set(...scale);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
let bedrockTexture,steppingStoneTexture;
function stoneMaterial(color,bedrock=false,steppingStone=false){
 if(bedrock&&!bedrockTexture&&typeof document!=='undefined'){
  bedrockTexture=new T.TextureLoader().load('/textures/moss-bedrock-v1.png');
  bedrockTexture.wrapS=bedrockTexture.wrapT=T.MirroredRepeatWrapping;
  bedrockTexture.colorSpace=T.SRGBColorSpace;bedrockTexture.anisotropy=8;
 }
 if(steppingStone&&!steppingStoneTexture&&typeof document!=='undefined'){
  steppingStoneTexture=new T.TextureLoader().load('/textures/moss-stepping-stone-v1.png');
  steppingStoneTexture.wrapS=steppingStoneTexture.wrapT=T.MirroredRepeatWrapping;
  steppingStoneTexture.colorSpace=T.SRGBColorSpace;steppingStoneTexture.anisotropy=8;
 }
 const m=material(color);
 m.customProgramCacheKey=()=>`garden-stone-${bedrock?'bedrock':steppingStone?'path':'plain'}`;
 m.onBeforeCompile=s=>{
  s.uniforms.bedrockTexture={value:bedrockTexture||new T.Texture()};
  s.uniforms.steppingStoneTexture={value:steppingStoneTexture||new T.Texture()};
  s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 stoneP; varying vec3 stoneN;').replace('#include <begin_vertex>','#include <begin_vertex>\nstoneP=position;stoneN=normal;');
  s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 stoneP; varying vec3 stoneN; uniform sampler2D bedrockTexture; uniform sampler2D steppingStoneTexture;').replace('#include <color_fragment>',`#include <color_fragment>
float broad=.5+.5*sin(stoneP.x*3.1+sin(stoneP.z*2.4))*cos(stoneP.y*3.8-stoneP.z*1.9);
float grain=fract(sin(dot(floor(stoneP*105.),vec3(12.9898,78.233,42.51)))*43758.5453);
diffuseColor.rgb*=.79+.28*broad+.045*grain;
${bedrock?`vec3 w=pow(abs(normalize(stoneN)),vec3(4.));w/=w.x+w.y+w.z;
vec3 tex=texture2D(bedrockTexture,stoneP.zy*.22).rgb*w.x+texture2D(bedrockTexture,stoneP.xz*.22).rgb*w.y+texture2D(bedrockTexture,stoneP.xy*.22).rgb*w.z;
diffuseColor.rgb=mix(diffuseColor.rgb,tex,.72);
float depth=clamp((.15-stoneP.y)/1.8,0.,1.); diffuseColor.rgb*=.83*mix(1.,.71,depth);
diffuseColor.rgb*=1.-.035*sin(stoneP.y*10.+stoneP.x*.4);`:''}`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
${steppingStone?`vec3 w=pow(abs(normalize(stoneN)),vec3(4.));w/=w.x+w.y+w.z;
vec3 stoneTex=texture2D(steppingStoneTexture,stoneP.zy*.9).rgb*w.x+texture2D(steppingStoneTexture,stoneP.xz*.9).rgb*w.y+texture2D(steppingStoneTexture,stoneP.xy*.9).rgb*w.z;
diffuseColor.rgb=mix(diffuseColor.rgb,stoneTex,.86);`:''}
`).replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
normal=normalize(normal+vec3(sin(stoneP.z*17.)*.035,sin(stoneP.x*19.)*.03,cos(stoneP.y*15.)*.035));`);};return m;}
const orb=(g,c,p,s)=>mesh(g,sphere,c,p,s);
const rounded=(g,c,p,s,r=.12)=>mesh(g,new RoundedBoxGeometry(1,1,1,4,r),c,p,s);
function tube(g,points,r,c){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),40,r,8,false),c,[0,0,0]);}
function outline(a){return [7*Math.cos(a)*(1+.055*Math.cos(a*3)+.032*Math.cos(a*5)+.016*Math.sin(a*9)),6*Math.sin(a)*(1+.05*Math.cos(a*4)+.02*Math.sin(a*7))];}
export function createGarden(root){
 const owned=new T.Group();root.add(owned);const reflections=[],drifters=[];let active=true;
 const sky=new T.Mesh(new T.SphereGeometry(45,24,16),new T.ShaderMaterial({side:T.BackSide,depthWrite:false,vertexShader:`varying vec3 skyP;void main(){skyP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`varying vec3 skyP;void main(){vec3 d=normalize(skyP);float c=exp(-dot(d.xz-vec2(.24,.15),d.xz-vec2(.24,.15))*24.)+.7*exp(-dot(d.xz+vec2(.18,.31),d.xz+vec2(.18,.31))*32.);c=smoothstep(.12,.85,c);vec3 sky=mix(vec3(.48,.47,.41),vec3(.88,.80,.67),c);gl_FragColor=vec4(sky,1.);}` }));sky.visible=false;owned.add(sky);

 const vertices=[],indices=[],rings=150,segments=256;
 for(let r=0;r<=rings;r++)for(let a=0;a<=segments;a++){const angle=a/segments*Math.PI*2,[ex,ez]=outline(angle),f=r/rings,x=ex*f,z=ez*f;let y=gardenHeight(x,z);vertices.push(x,y,z);if(r<rings&&a<segments){const k=r*(segments+1)+a;indices.push(k,k+1,k+segments+1,k+1,k+segments+2,k+segments+1);}}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
 // Height-derived normals agree across the duplicated polar seam and center.
 const surfaceNormals=[];
 for(let k=0;k<vertices.length;k+=3){const x=vertices[k],z=vertices[k+2],e=.025;
 const n=new T.Vector3(-(gardenHeight(x+e,z)-gardenHeight(x-e,z))/(2*e),1,-(gardenHeight(x,z+e)-gardenHeight(x,z-e))/(2*e)).normalize();surfaceNormals.push(n.x,n.y,n.z);}
 geo.setAttribute('normal',new T.Float32BufferAttribute(surfaceNormals,3));
 const terrain=mesh(owned,geo,mossMaterial(),[0,0,0]);
 // The shallow terrain and overlapping rounded skirt must not shadow themselves.
 // Props still cast shadows onto this receiving surface.
 terrain.castShadow=false;


 // A single continuous rounded bedrock, with the green carpet draping over its shoulder.
 let fallbackBedrock;
 for(let layer=0;layer<2;layer++){const v=[],ix=[],n=256,rows=32;for(let r=0;r<=rows;r++)for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,[x,z]=outline(a),t=r/rows;const mossLobes=Math.max(...[.48,.88,1.25,1.72,2.13,2.53].map((c,i)=>Math.exp(-Math.pow((a-c)/(.15+.035*(i%3)),2))))*(.54+.12*Math.sin(a*7));const scallop=.5+.5*Math.sin(a*11+.6*Math.sin(a*5));const drop=layer===0?.43+mossLobes*.66+.14*scallop+.075*(noise(x*1.4,z*1.4)-.5):1.72+.13*Math.sin(a*5);const f=layer===0?1+(.075+.055*mossLobes+.025*scallop)*Math.sin(t*Math.PI)-.03*t:1+.095*Math.sin(t*Math.PI)-.16*(t*t)+.014*Math.sin(a*13)*Math.sin(t*Math.PI);v.push(x*f,gardenHeight(x,z)-t*drop,z*f);if(r<rows&&j<n){const k=r*(n+1)+j;ix.push(k,k+n+1,k+1,k+1,k+n+1,k+n+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(ix);g.computeVertexNormals();
 if(layer===0){const normals=g.attributes.normal;for(let r=0;r<=rows;r++)for(let j=0;j<=n;j++){
 const a=j/n*Math.PI*2,[x,z]=outline(a),e=.025;
 const surface=new T.Vector3(-(gardenHeight(x+e,z)-gardenHeight(x-e,z))/(2*e),1,-(gardenHeight(x,z+e)-gardenHeight(x,z-e))/(2*e)).normalize();
 const k=r*(n+1)+j,edgeNormal=new T.Vector3().fromBufferAttribute(normals,k);
 surface.lerp(edgeNormal,T.MathUtils.smoothstep(r/rows,0,.45)).normalize();normals.setXYZ(k,surface.x,surface.y,surface.z);
 }}
 const m=layer===0?mossMaterial():material(0xa7ae8e);m.side=T.DoubleSide;const side=mesh(owned,g,m,[0,layer===0?0:-.04,0]);side.castShadow=false;if(layer===1)fallbackBedrock=side;}

 // Thick irregular river stones with a rounded perimeter.
 const pathFallback=new T.Group();owned.add(pathFallback);
 for(let i=0;i<10;i++){const z=5.9-i*.95+.075*Math.sin(i*1.29),x=-.28-.55*(1-i/9)+.78*Math.sin(i*.71+.25);const g=new T.SphereGeometry(1,40,24),p=g.attributes.position;for(let j=0;j<p.count;j++){const a=Math.atan2(p.getZ(j),p.getX(j)),f=1+.08*Math.sin(a*3+i)+.045*Math.cos(a*5+i);p.setXYZ(j,p.getX(j)*f,p.getY(j),p.getZ(j)*f);}g.computeVertexNormals();const s=mesh(pathFallback,g,material(0xd9d5bb),[x,gardenHeight(x,z)+.065,z],[.78+.12*Math.sin(i*2),.18+.035*Math.sin(i*1.3),.40+.07*Math.cos(i)]);s.rotation.y=Math.sin(i*.9)*.22;s.rotation.x=clamp(-(gardenHeight(x,z+.28)-gardenHeight(x,z-.28))/.56,-.14,.14);s.rotation.z=clamp((gardenHeight(x+.45,z)-gardenHeight(x-.45,z))/.9,-.12,.12);}

 const puddleSky=typeof document!=='undefined'?new T.TextureLoader().load('/textures/puddle-sky-v1.png'):new T.Texture();puddleSky.colorSpace=T.SRGBColorSpace;puddleSky.minFilter=T.LinearMipmapLinearFilter;puddleSky.magFilter=T.LinearFilter;
 for(const p of pools){const shape=new T.Shape();for(let j=0;j<=100;j++){const a=j/100*Math.PI*2,f=1+.12*Math.cos(a*3)+.07*Math.cos(a*5)-.035*Math.sin(a*7),x=Math.cos(a)*p.rx*f,y=Math.sin(a)*p.rz*f;j?shape.lineTo(x,y):shape.moveTo(x,y);}const g=new T.ShapeGeometry(shape,64);const water=new Reflector(g,{color:0xc6c6a1,textureWidth:p.rx>1?768:256,textureHeight:p.rx>1?768:256,clipBias:.004});water.rotation.x=-Math.PI/2;water.position.set(p.x,p.y,p.z);water.material.uniforms.gardenTime={value:0};water.material.uniforms.gardenScale={value:new T.Vector2(p.rx,p.rz)};water.material.uniforms.gardenSky={value:puddleSky};
 water.material.vertexShader=Reflector.ReflectorShader.vertexShader.replace('varying vec4 vUv;','varying vec4 vUv; varying vec2 vLocalWater;').replace('vUv = textureMatrix * vec4( position, 1.0 );','vUv = textureMatrix * vec4( position, 1.0 ); vLocalWater = position.xy;');
 water.material.fragmentShader='uniform float gardenTime; uniform vec2 gardenScale; uniform sampler2D gardenSky; varying vec2 vLocalWater;\n'+Reflector.ReflectorShader.fragmentShader.replace('vec4 base = texture2DProj( tDiffuse, vUv );','vec4 rippled=vUv;rippled.x+=sin(vUv.y/vUv.w*170.+gardenTime*.4)*.0003*vUv.w;vec4 base = texture2DProj( tDiffuse, rippled );').replace('gl_FragColor = vec4( blendOverlay( base.rgb, color ), 1.0 );',`vec2 uv=vLocalWater/gardenScale;
 vec2 skyUv=uv*.54+vec2(.46,.50)+vec2(sin(uv.y*8.+gardenTime*.24)*.001,sin(uv.x*7.-gardenTime*.18)*.001);
 vec3 skyTex=texture2D(gardenSky,skyUv).rgb;
 float cloud=smoothstep(.28,.78,dot(skyTex,vec3(.299,.587,.114)));
 vec3 sky=mix(vec3(.42,.45,.34),vec3(.76,.68,.53),cloud);
 float ripples=sin(length(uv-vec2(.19,-.12))*36.-gardenTime*.42)*sin(length(uv+vec2(.38,.21))*27.+gardenTime*.24);
 vec3 reflection=mix(sky,base.rgb,.68);
 // Use the same irregular shoreline as the basin, including the local Z flip.
 float shoreAngle=atan(uv.y,uv.x);
 float shoreRadius=1.+.12*cos(shoreAngle*3.)+.07*cos(shoreAngle*5.)-.035*sin(shoreAngle*7.);
 float shoreDistance=length(uv)/shoreRadius;
 float wetEdge=smoothstep(.70,1.,shoreDistance);
 vec3 shallow=vec3(.34,.37,.26)+vec3(.012,.012,.008)*ripples;
 reflection=mix(reflection,shallow,wetEdge*.62);
 float glint=pow(max(0.,sin(uv.x*12.+gardenTime*.18)*sin(uv.y*9.)),40.);
 reflection+=vec3(.12,.09,.05)*glint*(1.-wetEdge);
 gl_FragColor=vec4(reflection,1.0);`);
 const before=water.onBeforeRender;water.onBeforeRender=function(...args){const vis=reflections.map(r=>r.visible);reflections.forEach(r=>r.visible=false);sky.visible=true;before.apply(this,args);sky.visible=false;reflections.forEach((r,i)=>r.visible=vis[i]);};owned.add(water);reflections.push(water);
 }
 const bench=new T.Group();bench.position.set(3.8,gardenHeight(3.8,.1),.1);bench.rotation.y=-.12;owned.add(bench);
 const wood=material(0xd6ac78);
 wood.onBeforeCompile=shader=>{
  shader.vertexShader=shader.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 woodPosition;').replace('#include <begin_vertex>','#include <begin_vertex>\nwoodPosition=position;');
  shader.fragmentShader=shader.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 woodPosition;').replace('#include <color_fragment>',`#include <color_fragment>
   float grain=sin(woodPosition.z*83.+sin(woodPosition.x*2.7)*1.2+sin(woodPosition.x*8.)*.18);
   float broad=sin(woodPosition.z*16.+woodPosition.x*.7);
   diffuseColor.rgb*=.97+.025*grain+.025*broad;
  `);
 };
 mesh(bench,new RoundedBoxGeometry(1.8,.21,.57,6,.075),wood,[0,.54,0]);
 for(const x of [-.61,.61]){const leg=mesh(bench,new RoundedBoxGeometry(.19,.50,.31,5,.045),0xb38b5b,[x,.25,0]);leg.rotation.z=-Math.sign(x)*.06;}
 mesh(bench,new RoundedBoxGeometry(1.36,.10,.13,4,.025),0xbc9766,[0,.22,0]);
 const rockFallback=new T.Group();owned.add(rockFallback);
 for(const [x,z,r] of [[-5.05,1.95,.6],[-5.5,2.35,.22],[-4.5,2.35,.24]])orb(rockFallback,0xb9ad93,[x,gardenHeight(x,z)+r*.3,z],[r,r*.7,r*.8]);

 // One generous arch and two quieter fronds echo the fern in the illustration.
 const fern=new T.Group();fern.position.set(-5.75,gardenHeight(-5.75,-2.35),-2.35);fern.scale.setScalar(.96);owned.add(fern);
 const frondPaths=[
  [[0,0,0],[.02,.72,0],[.42,1.48,0],[1.24,1.95,0],[2.18,2.02,0],[2.85,1.74,0]],
  [[0,0,0],[-.18,.68,.12],[-.70,1.28,.2],[-1.28,1.44,.28],[-1.80,1.24,.36]]
 ];
 for(let b=0;b<frondPaths.length;b++){
  const frond=new T.Group();fern.add(frond);
  const curve=new T.CatmullRomCurve3(frondPaths[b].map(p=>new T.Vector3(...p)));
  mesh(frond,new T.TubeGeometry(curve,56,b===0?.021:.014,8,false),0x859848,[0,0,0]);
  const count=b===0?12:8;
  for(let j=1;j<count;j++){
   const t=j/count,p=curve.getPoint(t),dir=curve.getTangent(t),normal=new T.Vector3(-dir.y,dir.x,0).normalize();
   const length=(b===0?.37:.30)*Math.pow(Math.sin(Math.PI*t),.75)+.045;
   for(const side of [-1,1]){
    // Broad scalloped blades, with a continuous edge rather than separate bead leaves.
    const leafGeometry=new T.SphereGeometry(1,40,24),leafPositions=leafGeometry.attributes.position;
    for(let k=0;k<leafPositions.count;k++){
     const lx=leafPositions.getX(k),ly=leafPositions.getY(k),lz=leafPositions.getZ(k);
     const lobes=1+.17*Math.cos((lx+1)*Math.PI*3.5)*Math.pow(Math.max(0,1-lx*lx),.5);
     leafPositions.setXYZ(k,lx,ly*lobes,lz+.18*(1-lx*lx));
    }
    leafGeometry.computeVertexNormals();
    const leaf=mesh(frond,leafGeometry,b===0?0xb0bd69:0x9cac57,
      [p.x+normal.x*side*length*.50,p.y+normal.y*side*length*.50,p.z+side*.035],
      [length*.65,.12,.10]);
    leaf.rotation.z=Math.atan2(normal.y,normal.x)+(side<0?Math.PI:0);
    leaf.rotation.x=side*.20;
   }
  }
 }
 for(let i=0;i<2;i++){const g=new T.Group();owned.add(g);orb(g,0xba8e55,[0,0,0],[.022,.075,.022]);tube(g,[[0,0,0],[.04,.18,0],[.08,.32,0]],.006,0xd8c9a0);const pts=[];for(let k=0;k<20;k++){const a=k/20*Math.PI*2;pts.push(new T.Vector3(.08,.32,0),new T.Vector3(.08+Math.cos(a)*.22,.45,Math.sin(a)*.22));}g.add(new T.LineSegments(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:0xfff9e4,transparent:true,opacity:.65})));drifters.push(g);}
 return {terrain,height:gardenHeight,walkable:gardenWalkable,update(t,reduced){reflections.forEach(r=>r.material.uniforms.gardenTime.value=reduced?0:t);drifters.forEach((g,i)=>{const time=reduced?0:t;g.position.set(2.2+i*2+Math.sin(time*.09+i)*.6,3.4+i*.3,-1+i*2);g.rotation.z=-.4+Math.sin(time*.15+i)*.12;});},dispose(){active=false;puddleSky.dispose();reflections.forEach(r=>r.getRenderTarget().dispose());}};
}
export function createGardenCharacter(){
 const g=new T.Group(),body=new T.Group(),head=new T.Group();g.add(body);body.position.y=.48;body.add(head);head.position.set(0,.70,0);head.scale.setScalar(1.11);
 const skin=0xf5cba7,hair=0x514033,coat=0x343636;
 // A broad cheek silhouette, recessed hair cap and overlapping curls read as one soft shape.
 orb(head,skin,[0,-.025,0],[.27,.275,.245]);
 // A single implicit surface blends the hair mass and curls without sphere seams.
 const curls=new MarchingCubes(52,material(hair),false,false,40000);curls.isolation=55;
 const hairScale=new T.Vector3(.43,.40,.38),hairOrigin=new T.Vector3(0,.13,-.045);
 const addCurl=(x,y,z,r)=>{
  const p=new T.Vector3(x,y,z).sub(hairOrigin).divide(hairScale).multiplyScalar(.5).addScalar(.5);
  curls.addBall(p.x,p.y,p.z,95*Math.pow(r/.82,2),40);
 };
 addCurl(0,.12,-.075,.205);
 for(const [x,y,z,r] of [[-.19,.13,.08,.078],[-.16,.22,.10,.078],[-.08,.25,.12,.080],[.025,.25,.135,.083],[.13,.22,.10,.078],[.21,.14,.035,.079],[-.22,.015,-.055,.074],[.22,.035,-.055,.073],[-.16,.22,-.13,.080],[.025,.27,-.14,.085],[.17,.20,-.13,.079],[0,.13,-.23,.078]])addCurl(x*1.08,y+.012,z,r*1.15);
 curls.update();curls.scale.copy(hairScale);curls.position.copy(hairOrigin);curls.castShadow=true;curls.receiveShadow=true;head.add(curls);
 for(const side of [-1,1]){orb(head,0x302b28,[side*.09,-.015,.229],[.014,.017,.012]);orb(head,0xe9a890,[side*.155,-.085,.191],[.049,.023,.009]);orb(head,skin,[side*.267,-.057,0],[.042,.059,.045]);}orb(head,0xeebd9b,[0,-.065,.246],[.023,.021,.022]);
 // The cream jumper is framed by a padded black jacket with rounded shoulders and cuffs.
 orb(body,coat,[0,.28,0],[.245,.285,.173]);rounded(body,0xf1e6d6,[0,.30,.169],[.158,.39,.035],.23);
 for(const s of [-1,1]){const lapel=rounded(body,0x2b2d2b,[s*.126,.355,.194],[.095,.31,.065],.22);lapel.rotation.z=s*.16;orb(body,coat,[s*.2,.43,-.015],[.105,.12,.14]);rounded(body,0x272928,[s*.155,.145,.175],[.125,.045,.025],.28);}
 const arms=[];for(const s of [-1,1]){const a=new T.Group();a.position.set(s*.22,.445,0);body.add(a);orb(a,coat,[s*.023,-.16,.015],[.11,.205,.118]);rounded(a,0x2a2b2b,[s*.028,-.285,.035],[.18,.07,.19],.25);orb(a,skin,[s*.006,-.323,.09],[.045,.047,.05]);a.rotation.z=-s*.12;a.rotation.x=-.10;arms.push(a);}
 const legs=[];for(const s of [-1,1]){const leg=new T.Group();leg.position.set(s*.115,.5,0);g.add(leg);rounded(leg,0x66899a,[0,-.20,0],[.235,.48,.27],.30);rounded(leg,0x7899a6,[0,-.365,.005],[.215,.09,.265],.26);orb(leg,0xfbf7ed,[0,-.435,.075],[.128,.068,.19]);orb(leg,0xe3dfd5,[0,-.47,.085],[.13,.018,.19]);legs.push(leg);}g.userData.rig={body,arms,legs};return g;
}
export function animateGardenCharacter(g,t,moving,reduced){const {body,arms,legs}=g.userData.rig;const swing=moving&&!reduced?Math.sin(t*8):0;legs.forEach((l,i)=>l.rotation.x=swing*.24*(i?1:-1));arms.forEach((a,i)=>a.rotation.x=-.10+swing*.07*(i?-1:1));body.position.y=.48+(moving&&!reduced?Math.abs(Math.sin(t*8))*.012:0);}
export function decorateSnail(g){g.traverse(o=>o.material?.dispose());g.clear();g.scale.setScalar(.95);orb(g,0xf3dfb1,[0,.12,0],[.36,.13,.19]);orb(g,0xffe7ba,[.25,.30,0],[.16,.23,.155]);orb(g,0xf6e7c5,[-.12,.35,0],[.28,.29,.25]);for(const s of [-1,1]){tube(g,[[.25,.44,s*.085],[.28,.58,s*.12],[.27,.66,s*.14]],.015,0xe2bf88);orb(g,0xf0cf99,[.27,.66,s*.14],[.034,.037,.034]);orb(g,0x3e362a,[.389,.345,s*.074],[.012,.016,.012]);}const spiral=[];for(let i=0;i<70;i++){const a=i/69*Math.PI*3,r=.015+.1*i/69;spiral.push([-.12+Math.cos(a)*r,.35+Math.sin(a)*r,.25-.018*i/69]);}tube(g,spiral,.008,0xe6d4af);g.userData.legs=[];g.userData.wool=[...g.children];g.userData.snail=true;}
