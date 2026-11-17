import {createCloudGarden,cloudHeight,cloudWalkable} from './cloud-garden.js';
import {createFlatGroundGeometry,groundHeight} from './flat-ground.js';
import {profile} from './portfolio-config.js';
import {createSunnyIsland,islandHeight,islandWalkable} from './sunny-island.js';
import { createExplorationUI } from './exploration-ui.js';
import { portfolioSections, renderPortfolioSection } from './portfolio-content.js';
import { ForestAudio } from './audio.js';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
import {mossMaterial} from './moss-material.js';
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/addons/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import './style.css';
import {makeHiker, animateHiker} from './original-models.js';

const scenes = [
  {name:'风栖草原', icon:'♧', copy:'风走过山坡，羊群把日子过成云朵。', card:'把经历放进风景里', detail:'这里可以展示一个真实项目：你解决了什么问题、承担了什么角色，以及作品链接。', sky:0xe8eddf, grass:0x83a956, earth:0x806b50},
  {name:'雪线暖屋', icon:'♤', copy:'雪落得很轻，屋里的灯一直为你亮着。', card:'记录研究与探索', detail:'适合放研究、学习过程或长期项目；用问题、方法和发现讲清楚你的成长。', sky:0xcbd9d6, grass:0x4f7968, earth:0x4e6258},
  {name:'海风小岛', icon:'≈', copy:'海风轻轻，故事随小海豹游来。', card:'展示协作与实践', detail:'适合放活动、合作项目与公开成果；每一只小海豹都是一个作品入口。', sky:0xf6dfc6, grass:0x53766a, earth:0x3e5060},
  {name:'云朵花语',icon:'❀',copy:'海风拂过花房，留一点时间慢慢摇晃。',card:'沿着海湾发现作品',detail:'点击水獭，打开一段创作故事。',sky:0x81d5d4},
];
const wrap=document.querySelector('#canvas-wrap');
const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true});
renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
wrap.appendChild(renderer.domElement);
const scene=new THREE.Scene();const camera=new THREE.PerspectiveCamera(36,1,.1,100);camera.position.set(9,9,12);
const composer=new EffectComposer(renderer);composer.addPass(new RenderPass(scene,camera));const gardenAO=new GTAOPass(scene,camera);gardenAO.blendIntensity=.25;gardenAO.updateGtaoMaterial({radius:.55,samples:8});composer.addPass(gardenAO);composer.addPass(new OutputPass());
const controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,-.5,0);controls.enableDamping=true;controls.minDistance=8;controls.maxDistance=25;controls.maxPolarAngle=Math.PI*.48;controls.minPolarAngle=.35;
const hemi=new THREE.HemisphereLight(0xfff9df,0x78928b,2.4);scene.add(hemi);
const sun=new THREE.DirectionalLight(0xfff1cf,2.5);sun.position.set(-5,12,8);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);sun.shadow.normalBias=.025;sun.shadow.camera.left=-12;sun.shadow.camera.right=12;sun.shadow.camera.top=12;sun.shadow.camera.bottom=-12;scene.add(sun);
const gardenGlow=new THREE.SpotLight(0xffd08a,0,24,Math.PI/3,.95,1);gardenGlow.position.set(-6,12,-3);gardenGlow.target.position.set(-1,0,0);scene.add(gardenGlow,gardenGlow.target);
const root=new THREE.Group();scene.add(root);let garden=null;let current=0;let blades=[];let sheep=[];let terrain=null;let sea=null;let hiker=null;let hikerTarget=null;let seeds=[];let smoke=[];const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const mat=(color,roughness=.9)=>new THREE.MeshStandardMaterial({color,roughness});
function add(g,geo,color,x,y,z,sx=1,sy=1,sz=1){const m=new THREE.Mesh(geo,mat(color));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;g.add(m);return m}
const box=new RoundedBoxGeometry(1,1,1,3,.08),ball=new THREE.SphereGeometry(1,14,10),cone=new THREE.ConeGeometry(1,1,8),cyl=new THREE.CylinderGeometry(1,1,1,12);
function seed(n){let v=n;return()=>{v=(v*1664525+1013904223)>>>0;return v/4294967296}}
function meadowHeight(x,z){return current===3?cloudHeight(x,z):current===2?islandHeight(x,z):groundHeight}
function meadowGeometry(){return createFlatGroundGeometry()}
function tile(cfg){if(current<=2){const geo=meadowGeometry();terrain=add(root,geo,current===1?0xf1f6f5:0xbad28b,0,0,0);const waterMat=new THREE.ShaderMaterial({uniforms:{time:{value:0},color:{value:new THREE.Color(current===1?0xd6e3e5:0xc4dbc0)}},vertexShader:`varying vec3 vP;void main(){vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float time;uniform vec3 color;varying vec3 vP;void main(){vec2 p=vP.xz;float r=length(p);float w=sin(r*2.8-time*.48+sin(atan(p.y,p.x)*6.)*.2)*.5+.5;float ring=pow(w,18.)*exp(-max(0.,r-7.)*.3);float shore=exp(-pow((r-7.6)/.6,2.));float glint=pow(max(0.,sin(p.x*.8+time*.12)*cos(p.y*.7-time*.1)),22.);vec3 c=color+vec3(.13,.16,.13)*(ring*.12+glint*.05)+shore*vec3(.07,.1,.07);c=mix(c,vec3(.85,.91,.79),smoothstep(65.,160.,r)*.55);gl_FragColor=vec4(c,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`});sea=new THREE.Mesh(new THREE.PlaneGeometry(240,240).rotateX(-Math.PI/2),waterMat);sea.position.y=-.42;sea.receiveShadow=false;root.add(sea);return}terrain=add(root,box,cfg.grass,0,-.1,0,10.55,.2,8.55)}
function tree(x,z,h=2,color=0x497b58){const g=new THREE.Group();g.position.set(x,meadowHeight(x,z),z);root.add(g);add(g,cyl,0x6b694d,0,.5,0,.12,1,.12);for(let i=0;i<3;i++)add(g,cone,color,0,.85+i*h*.3,0,.63-i*.14,h*.48,.63-i*.14);return g}
function cloud(x,y,z){const g=new THREE.Group();g.position.set(x,y,z);root.add(g);for(const [a,b,c,r] of [[0,0,0,.36],[-.3,-.07,0,.25],[.3,-.08,0,.27],[0,.16,0,.28]])add(g,ball,0xfffcf2,a,b,c,r,r*.78,r*.8);return g}
function flower(x,z,color){const y=meadowHeight(x,z);add(root,ball,color,x,y+.08,z,.055,.045,.055)}
function makeSheep(x,z,index){const g=new THREE.Group();g.position.set(x,meadowHeight(x,z),z);root.add(g);g.userData.sheep=true;g.userData.index=index;g.userData.home=new THREE.Vector3(x,0,z);g.userData.phase=index*1.7;g.userData.target=null;g.userData.pause=0;g.userData.stride=0;g.userData.open=false;for(const [a,b,c,r] of [[0,.26,0,.32],[-.22,.29,0,.18],[.18,.33,.12,.19],[.02,.4,-.19,.17]])add(g,ball,0xfffbef,a,b,c,r,r*.85,r);add(g,ball,0x584e46,.32,.25,0,.14,.16,.14);const legs=[];for(const a of [-.18,.19])for(const c of [-.14,.16]){const leg=add(g,cyl,0x544b43,a,-.06,c,.035,.24,.035);legs.push(leg)}g.userData.legs=legs;g.userData.wool=[...g.children];g.userData.cloud=null;sheep.push(g)}
function finishPet(g,coat){
 const legs=[];for(const x of [-.21,.21])for(const z of [-.15,.15]){const pivot=new THREE.Group();pivot.position.set(x,.25,z);g.add(pivot);add(pivot,ball,coat,0,-.10,0,.065,.13,.065);add(pivot,ball,0x746153,.025,-.21,0,.08,.04,.075);legs.push(pivot);}
 g.userData.legs=legs;g.userData.wool=[...g.children];g.userData.pony=true;
}
function makePony(x,z,index){
 makeSheep(x,z,index);const g=sheep.at(-1);g.traverse(o=>o.material?.dispose());g.clear();
 const coat=0xd4ab81,mane=0x77553f;
 add(g,ball,coat,-.02,.44,0,.37,.26,.25);
 add(g,ball,coat,.23,.62,0,.19,.26,.19);
 add(g,ball,coat,.34,.78,0,.25,.23,.21);
 add(g,ball,0xf1d9b5,.52,.68,0,.17,.12,.18);
 for(const side of [-1,1]){const ear=add(g,ball,coat,.26,.98,side*.13,.07,.12,.065);ear.rotation.z=-.18;add(g,ball,0x342b26,.46,.83,side*.175,.020,.028,.013);}
 add(g,ball,mane,.08,.68,0,.12,.28,.20);
 const fringe=add(g,ball,mane,.28,.94,.01,.21,.09,.19);fringe.rotation.z=-.16;
 const tail=add(g,ball,mane,-.39,.40,0,.09,.19,.10);tail.rotation.z=-.4;
 finishPet(g,coat);
}
function makePuppy(x,z,index){
 makeSheep(x,z,index);const g=sheep.at(-1);g.traverse(o=>o.material?.dispose());g.clear();
 const coat=0xdab083,earColor=0x9b6d49;
 add(g,ball,coat,-.03,.38,0,.32,.23,.24);
 add(g,ball,coat,.27,.59,0,.27,.27,.25);
 for(const side of [-1,1]){const ear=add(g,ball,earColor,.17,.58,side*.23,.12,.22,.09);ear.rotation.x=side*.25;add(g,ball,0x342b26,.46,.66,side*.14,.022,.029,.014);}
 add(g,ball,0xf5dfbd,.45,.51,0,.17,.12,.18);add(g,ball,0x614334,.58,.56,0,.045,.035,.05);
 add(g,ball,0xf5dfbd,.12,.33,.01,.20,.14,.20);
 const tail=new THREE.Group();tail.position.set(-.32,.46,0);g.add(tail);const tip=add(tail,ball,coat,-.08,.10,0,.065,.19,.07);tip.rotation.z=-.65;
 g.userData.tail=tail;finishPet(g,coat);
}
function makeFarmAnimal(x,z,index,dog=false){
 makeSheep(x,z,index);const g=sheep.at(-1);g.traverse(o=>o.material?.dispose());g.clear();
 const coat=dog?0xc99b68:0xfff5df, dark=dog?0x765338:0x605249;
 add(g,ball,coat,0,.43,0,dog?.31:.39,.23,.23);
 add(g,ball,coat,.30,.65,0,.22,.23,.21);
 add(g,ball,dog?0xedd4ad:0xe4b9aa,.46,.56,0,.15,.10,.17);
 add(g,ball,dark,.585,.60,0,.04,.035,.055);
 for(const side of [-1,1]){
  const ear=add(g,ball,dark,.23,.76,side*.22,dog?.09:.13,dog?.19:.06,.07);ear.rotation.x=side*.3;
  add(g,ball,0x302a27,.43,.71,side*.15,.022,.027,.015);
  if(!dog){add(g,cone,0xd5bd8e,.24,.91,side*.14,.045,.16,.045);add(g,ball,dark,-.12,.54,side*.205,.18,.14,.035);}
 }
 const tail=add(g,ball,coat,-.36,.52,0,.055,dog?.20:.14,.055);tail.rotation.z=dog?-.8:-.35;
 if(!dog)add(g,ball,dark,-.41,.38,0,.07,.08,.06);
 const legs=[];for(const a of [-.20,.20])for(const c of [-.15,.15]){const leg=new THREE.Group();leg.position.set(a,.29,c);g.add(leg);add(leg,cyl,coat,0,-.10,0,.05,.22,.05);add(leg,ball,dog?coat:dark,.025,-.25,0,.08,.04,.07);legs.push(leg);}
 g.userData.legs=legs;g.userData.wool=[...g.children];g.userData.pony=true;
}
function windmill(x,z){const g=new THREE.Group();g.position.set(x,meadowHeight(x,z),z);root.add(g);add(g,cyl,0xf0e8d0,0,1.1,0,.42,2.2,.42);add(g,cone,0xa35e43,0,2.35,0,.65,.65,.65);const rotor=new THREE.Group();rotor.position.set(0,1.8,.46);g.add(rotor);add(rotor,ball,0x695e47,0,0,0,.13,.13,.13);for(let i=0;i<4;i++){const blade=add(rotor,box,0xf5e9d0,0,.68,.02,.13,1.18,.06);blade.rotation.z=i*Math.PI/2;blade.position.set(-Math.sin(i*Math.PI/2)*.68,Math.cos(i*Math.PI/2)*.68,.02)}blades.push(rotor)}
function house(x,z,night=false){const g=new THREE.Group();g.position.set(x,meadowHeight(x,z),z);root.add(g);add(g,box,night?0xc4aa86:0xeee5ce,0,.58,0,1.2,1.15,.95);const roof=add(g,cone,night?0x874d47:0x9c7755,0,1.35,0,.95,.73,.8);roof.rotation.y=Math.PI/4;add(g,box,night?0xffd47f:0x809796,.02,.65,.5,.32,.35,.04);add(g,box,0x665a48,.45,.28,.49,.22,.55,.04);if(night){const light=new THREE.PointLight(0xffbb6d,3,3);light.position.set(0,.8,.7);g.add(light)}}
function meadowPath(){const points=[[-.4,6.65],[-1.3,5.3],[-1.2,4],[-.1,2.5],[.7,1.2],[.2,0],[-1.4,-.9],[-2.6,-2]].map(([x,z])=>new THREE.Vector3(x,meadowHeight(x,z)+.028,z));const curve=new THREE.CatmullRomCurve3(points);const verts=[],indices=[];for(let i=0;i<=80;i++){const p=curve.getPoint(i/80),tangent=curve.getTangent(i/80),side=new THREE.Vector3(-tangent.z,0,tangent.x).normalize(),w=.26+Math.sin(i*.2)*.035;for(const sign of [-1,1]){const x=p.x+side.x*w*sign,z=p.z+side.z*w*sign;verts.push(x,meadowHeight(x,z)+.035,z);}if(i<80){const k=i*2;indices.push(k,k+1,k+2,k+1,k+3,k+2)}}const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));g.setIndex(indices);g.computeVertexNormals();const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0xdac99b,roughness:1,side:THREE.DoubleSide}));m.receiveShadow=true;root.add(m)}
function meadow(){meadowPath();windmill(-3.2,-1.7);house(3.3,-1.9);for(let i=0;i<portfolioSections.length;i++){const a=i/portfolioSections.length*Math.PI*2+.7;const [x,z]=[[3,2],[-1.4,3.8],[-4,1],[3,-.1]][i]||[Math.cos(a)*5.2,Math.sin(a)*4.4];[makeSheep,makeFarmAnimal,makePony,makePuppy][i%4](x,z,i);}tree(5.2,.8,1.8,0x477553);const rng=seed(23);const grass=new THREE.InstancedMesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshStandardMaterial({color:0x87a961,roughness:1}),95);const dummy=new THREE.Object3D();for(let i=0;i<95;i++){const angle=rng()*Math.PI*2,r=Math.sqrt(rng())*6.9,x=Math.cos(angle)*r,z=Math.sin(angle)*r;dummy.position.set(x,meadowHeight(x,z)+.07,z);dummy.rotation.set((rng()-.5)*.4,rng()*6.28,(rng()-.5)*.4);dummy.scale.set(1,1.5+rng()*.7,.65);dummy.updateMatrix();grass.setMatrixAt(i,dummy.matrix);grass.setColorAt(i,new THREE.Color().setHSL(.22+rng()*.035,.3,.39+rng()*.18))}grass.receiveShadow=true;root.add(grass);for(let i=0;i<55;i++){const angle=rng()*6.28,r=Math.sqrt(rng())*6.7;flower(Math.cos(angle)*r,Math.sin(angle)*r,[0xf9e9b7,0xf8f6dc,0xc5d9aa][i%3])}}

function penguin(x,z,index){
 makeSheep(x,z,index);const g=sheep[sheep.length-1];g.clear();g.scale.setScalar(.66);
 const body=new THREE.Group();g.add(body);const blue=0xa4b9d2,cream=0xffefda;
 const geo=new THREE.SphereGeometry(1,64,48),pos=geo.attributes.position,colors=[];
 for(let i=0;i<pos.count;i++){
 const x=pos.getX(i),y=pos.getY(i),z=pos.getZ(i);
 const width=1-.08*y;pos.setXYZ(i,x*width,y,z*width);
 const forehead=.36+.21*Math.sin(Math.min(1,Math.abs(z)/.72)*Math.PI);
 const face=x>.42&&Math.abs(z)<.86&&y<forehead&&y>-.97;
 const c=new THREE.Color(face?cream:blue);colors.push(c.r,c.g,c.b);
 }
 geo.computeVertexNormals();geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));
 const torso=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));torso.position.set(0,.4,0);torso.scale.set(.37,.38,.44);torso.castShadow=true;torso.receiveShadow=true;body.add(torso);
 for(const side of [-1,1]){
 add(body,ball,0x403e38,.357,.52,side*.14,.012,.016,.016);
 const wing=add(body,ball,blue,-.015,.33,side*.405,.085,.16,.085);wing.rotation.x=side*.32;
 }
 add(body,ball,0xefbd72,.39,.475,0,.04,.025,.07);
 g.userData.legs=[];for(const side of [-1,1])g.userData.legs.push(add(g,ball,0xe7b27b,.09,.04,side*.21,.1,.04,.085));
 g.userData.wool=[...g.children];g.userData.penguin=true;g.userData.penguinBody=body;
}
function forest(){
 sun.color.set(0xfff5e5);hemi.color.set(0xf3f7ff);
 const cabin=new THREE.Group();cabin.position.set(-1.8,meadowHeight(-1.8,-2),-2);root.add(cabin);
 add(cabin,box,0x9d806b,0,.7,0,1.8,1.4,1.35);
 for(let i=0;i<7;i++)add(cabin,box,0x8c725e,0,.1+i*.19,.685,1.78,.025,.025);
 add(cabin,box,0x8c7662,0,.08,1.05,2.1,.16,.8);
 add(cabin,box,0xc6bba6,0,-.01,1.55,1.1,.12,.3);
 for(const x of [-.85,.85]){add(cabin,cyl,0x8c735c,x,.67,1.3,.045,1.2,.045);add(cabin,box,0x9d826b,x,.5,1.05,.06,.06,.55);}
 add(cabin,box,0x88755f,0,1.32,1.05,2.05,.1,.85);
 add(cabin,ball,0xfafcfa,0,1.4,1.05,1.08,.13,.48);
 for(const side of [-1,1]){const roof=add(cabin,box,0x807267,side*.52,1.63,0,1.25,.16,1.7);roof.rotation.z=-side*.6;const snow=add(cabin,box,0xfffcf4,side*.52,1.73,0,1.29,.16,1.78);snow.rotation.z=-side*.6;for(let k=0;k<5;k++)add(cabin,ball,0xf8fbfb,side*.99,1.4,-.68+k*.34,.18,.1,.23);}
 add(cabin,box,0xffd591,-.4,.75,.69,.5,.55,.04);add(cabin,box,0x695f54,.38,.48,.7,.4,.94,.06);
 for(const x of [-.69,-.11])add(cabin,box,0xe0c7a2,x,.75,.76,.065,.68,.1);
 for(const y of [.43,1.07])add(cabin,box,0xe0c7a2,-.4,y,.76,.64,.065,.1);
 add(cabin,box,0xd7c8af,-.4,.4,.8,.75,.1,.23);
 add(cabin,ball,0xfafcfa,-.4,.46,.8,.38,.065,.15);
 add(cabin,ball,0xd9b977,.5,.5,.75,.035,.035,.025);
 add(cabin,box,0xb99c78,-.4,.75,.73,.04,.56,.02);add(cabin,box,0xb99c78,-.4,.75,.73,.51,.04,.02);
 add(cabin,cyl,0x988c7b,.55,1.95,-.25,.17,.7,.17);
 add(cabin,cyl,0x786d61,.55,2.31,-.25,.22,.10,.22);
 add(cabin,cyl,0x403b38,.55,2.365,-.25,.14,.01,.14);
 for(let i=0;i<5;i++){const puff=add(cabin,ball,0xf5eee5,.55,2.45,-.25,.12,.13,.12);puff.material.transparent=true;puff.material.opacity=.22;puff.material.depthWrite=false;puff.castShadow=false;puff.receiveShadow=false;smoke.push(puff);}
const glow=new THREE.PointLight(0xffcc88,2,4);glow.position.set(-.4,.9,1);cabin.add(glow);
 for(const [x,z,h] of [[-4,-2.8,1.9],[.7,-4.3,2.2],[4,-2.2,1.8],[5,2.8,1.45]]){const g=new THREE.Group();g.position.set(x,meadowHeight(x,z),z);root.add(g);add(g,cyl,0x8d8171,0,.4,0,.1,.8,.1);for(let j=0;j<3;j++){const w=.68-j*.17,y=.65+j*.43;add(g,ball,0x7e9e96,0,y,0,w,h*.25,w*.83);add(g,ball,0xf4f8f7,-.04,y+.19,.015,w*.98,.22,w*.85);}}
 for(let i=0;i<8;i++){const z=4-i*.65,x=-.6-i*.12;add(root,ball,0xd1d9d7,x,meadowHeight(x,z)+.02,z,.22,.035,.16)}
 for(let i=0;i<portfolioSections.length;i++){const a=i/portfolioSections.length*Math.PI*2;penguin(Math.cos(a)*4.2,Math.sin(a)*3.3,i);}
 const snowman=new THREE.Group();snowman.position.set(-3.4,meadowHeight(-3.4,-.3),-.3);root.add(snowman);
 add(snowman,ball,0xf6faf9,0,.35,0,.4,.4,.38);add(snowman,ball,0xfffcf5,0,.86,0,.29,.29,.28);
 add(snowman,cyl,0xb9413d,0,.65,0,.3,.1,.28);add(snowman,box,0xb9413d,.16,.48,.28,.12,.3,.06);
 add(snowman,ball,0x789589,0,1.1,0,.3,.13,.29);add(snowman,ball,0xf6efdb,0,1.24,0,.09,.09,.09);
 for(const x of [-.095,.095])add(snowman,ball,0x495653,x,.92,.25,.025,.03,.025);
 add(snowman,cone,0xdba373,0,.84,.31,.05,.2,.05).rotation.x=Math.PI/2;
 for(const y of [.25,.42])add(snowman,ball,0x6b7976,0,y,.37,.03,.03,.025);
 for(const side of [-1,1]){const arm=add(snowman,cyl,0x94816c,side*.43,.55,0,.025,.36,.025);arm.rotation.z=-side*.9;}
 // Broad snow drifts give the clearing depth without dense decoration.
 for(const [x,z,sx,sz] of [[-4.7,-3.5,1.1,.7],[2.7,-4.1,1.3,.7],[4.8,3.6,.85,.55]])add(root,ball,0xeaf2f3,x,meadowHeight(x,z)-.08,z,sx,.28,sz);
 for(const [x,z] of [[-5,1],[-3,-4],[3,4],[4.5,-.6]])add(root,ball,0xf9f8ef,x,meadowHeight(x,z)+.06,z,.45,.19,.35);
}
function village(){garden=createSunnyIsland(root,portfolioSections.length);terrain=garden.terrain;sheep=garden.animals;scene.background=new THREE.Color(0x81d5d4);scene.fog=null;}
function snow(){const rng=seed(89);for(const [x,z,h] of [[-2,-1,3],[.4,-1.7,3.7],[2,-1,2.5]]){add(root,cone,0x829e9f,x,h*.46,z,1.4,h,1.4);add(root,cone,0xf7f9f3,x,h*.78,z,.58,h*.38,.58)}for(let i=0;i<18;i++){let x=(rng()-.5)*9,z=(rng()-.5)*7;if(z<-.6)continue;tree(x,z,1+rng()*.6,0x547b77)}add(root,box,0xb8d5cf,0,.02,2.4,5.5,.05,1.6);house(3,2.1)}
function canWalk(x,z){return current===3?cloudWalkable(x,z):current===2?islandWalkable(x,z):true}
function cloudVillage(){garden=createCloudGarden(root,portfolioSections.length);terrain=garden.terrain;sheep=garden.animals;scene.background=new THREE.Color(0x81d5d4);scene.fog=null;}
const sceneOrder=[0,3,2,1];
const nav=document.querySelector('#scene-nav');sceneOrder.forEach(i=>{const cfg=scenes[i];const b=document.createElement('button');b.textContent=`${cfg.icon} ${cfg.name}`;b.onclick=()=>setScene(i);nav.appendChild(b)});
function setScene(i){i=Number.isInteger(i)&&i>=0&&i<scenes.length?i:0;garden?.dispose();garden=null;const disposed=new Set();root.traverse(o=>{if(o.geometry&&![box,ball,cone,cyl].includes(o.geometry)&&!disposed.has(o.geometry)){o.geometry.dispose();disposed.add(o.geometry)}for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(m&&!disposed.has(m)){m.dispose();disposed.add(m)}});current=i;renderer.shadowMap.type=THREE.PCFSoftShadowMap;renderer.shadowMap.needsUpdate=true;renderer.toneMapping=THREE.NoToneMapping;renderer.toneMappingExposure=i===2?.98:1;document.body.dataset.scene=String(i);const cfg=scenes[i];sun.color.set(0xfff1cf);hemi.color.set(0xfff9df);sun.position.set(-5,12,8);sun.intensity=2.5;hemi.intensity=2.4;gardenGlow.intensity=0;while(root.children.length)root.remove(root.children[0]);blades=[];sheep=[];seeds=[];smoke=[];sea=null;hiker=null;hikerTarget=null;scene.background=i===0?new THREE.Color(0xdde8cf):new THREE.Color(cfg.sky);scene.fog=i===0?new THREE.FogExp2(0xdde8cf,.006):null;if(i<2)tile(cfg);[meadow,forest,village,cloudVillage][i]();if(i<=3){hiker=makeHiker();hiker.scale.setScalar(.48);hiker.position.set(i===2?-2:1.1,meadowHeight(i===2?-2:1.1,.2),.2);if(i===2){hiker.scale.setScalar(.48);hiker.position.set(-3.4,meadowHeight(-3.4,2.15),2.15);hiker.rotation.y=1.02};if(i===3){hiker.position.set(.4,cloudHeight(.4,2),2);hiker.rotation.y=.8;}root.add(hiker)}document.querySelector('.hint').textContent='拖动旋转 · 滚轮缩放 · '+(i===3?'点水獭看作品，也可以直接选下方分类 · 点击海面泛起水纹':i===1?'点击雪地里的小企鹅':i===2?'点击海豹查看作品 · 点击海面泛起水纹':'点击草原上的羊、牛、马或狗');document.querySelector('#scene-title').textContent=cfg.name;document.querySelector('#scene-copy').textContent=cfg.copy;document.querySelector('#card-title').textContent=cfg.card;document.querySelector('#card-copy').textContent=cfg.detail;closePanel();[...nav.children].forEach((b,j)=>b.classList.toggle('active',sceneOrder[j]===i));controls.target.set(0,-.5,0);controls.minDistance=8;controls.maxDistance=25;camera.position.set(i>=2?3:9,i>=2?10:9,i===3?20:i===2?17:12);controls.target.set(0,i===3?.8:i===2?.15:-.5,0);controls.update();resize();updateLabels()}
document.querySelector('#next-project').onclick=()=>setScene(sceneOrder[(sceneOrder.indexOf(current)+1)%sceneOrder.length]);
const ray=new THREE.Raycaster(),pointer=new THREE.Vector2();let down=null;
renderer.domElement.addEventListener('pointerdown',e=>down={x:e.clientX,y:e.clientY});
renderer.domElement.addEventListener('pointerup',e=>{
  if(!down)return;const moved=Math.hypot(e.clientX-down.x,e.clientY-down.y)>7;down=null;if(moved)return;
  const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-((e.clientY-rect.top)/rect.height*2-1));ray.setFromCamera(pointer,camera);
  const hit=ray.intersectObjects(sheep,true)[0];
  if(hit){let g=hit.object;while(g.parent&&!g.userData.sheep)g=g.parent;if(g.userData.sheep){toggleSheep(g);return}}
  if(current>=2&&garden){const land=ray.intersectObject(terrain)[0];if(!land){const waterHit=ray.intersectObject(garden.water)[0];if(waterHit)garden.click(waterHit.point);return;}}
  if(current<=3&&terrain&&hiker){const landHit=ray.intersectObject(terrain)[0];if(landHit&&landHit.point.y>-.19&&canWalk(landHit.point.x,landHit.point.z)){hikerTarget=landHit.point.clone();hikerTarget.y=meadowHeight(landHit.point.x,landHit.point.z)}}
});
let explorationUI;
const labels=document.querySelector('#sheep-labels');
const panel=document.querySelector('#project-panel');panel.inert=true;let previousProjectFocus=null;
function closePanel(){const wasOpen=panel.classList.contains('open');explorationUI?.update();panel.classList.remove('open');panel.setAttribute('aria-hidden','true');panel.inert=true;if(wasOpen&&previousProjectFocus?.isConnected)previousProjectFocus.focus();previousProjectFocus=null;sheep.forEach(g=>{g.userData.open=false;g.userData.wool.forEach(o=>o.visible=true);if(g.userData.cloud)g.userData.cloud.visible=false});updateLabels()}
function toggleSheep(g){if(g.userData.open){closePanel();return}sheep.forEach(other=>{other.userData.open=false;other.userData.wool.forEach(o=>o.visible=true);if(other.userData.cloud)other.userData.cloud.visible=false});g.userData.open=true;if(current===3)g.userData.focusAngle=Math.atan2(camera.position.z,camera.position.x);g.userData.wool.forEach(o=>o.visible=true);if(current===1&&!g.userData.cloud){const c=new THREE.Group();g.add(c);for(const [a,b,d,r] of [[0,.3,0,.33],[-.29,.22,0,.22],[.28,.23,0,.24],[0,.47,0,.24]])add(c,ball,0xfffcf1,a,b,d,r,r*.85,r);if(current===1){c.position.set(-.3,1.05,0);c.scale.setScalar(.65);}g.userData.cloud=c}if(g.userData.cloud)g.userData.cloud.visible=current===1;renderPortfolioSection(g.userData.index);explorationUI?.visit(g.userData.index);panel.scrollTop=0;previousProjectFocus=document.activeElement;panel.inert=false;panel.classList.add('open');panel.setAttribute('aria-hidden','false');document.querySelector('#close-project').focus();updateLabels()}
document.querySelector('#close-project').onclick=closePanel;
function updateLabels(){labels.innerHTML='';if(current>3)return;for(const g of sheep){const b=document.createElement('button');b.className='sheep-label';b.textContent=g.userData.open?`${current===1?'♧':'●'} ${portfolioSections[g.userData.index].short}`:`○ ${portfolioSections[g.userData.index].short}`;b.onclick=()=>toggleSheep(g);labels.appendChild(b)}}
function resize(){const w=wrap.clientWidth,h=wrap.clientHeight;renderer.setSize(w,h);composer.setSize(w,h);camera.aspect=w/h;camera.fov=w/h<1?78:36;camera.updateProjectionMatrix()}window.addEventListener('resize',resize);resize();setScene(new URLSearchParams(location.search).has('scene')?Number(new URLSearchParams(location.search).get('scene')):profile.defaultScene);
let captureRequested=false;
if(import.meta.env.DEV&&new URLSearchParams(location.search).has('review')){
 const capture=document.createElement('button');capture.textContent='保存当前场景截图';capture.style.cssText='position:fixed;right:24px;bottom:24px;z-index:100;padding:12px 18px;border:1px solid #b7bba3;border-radius:12px;background:#fff9ec;color:#314f43';capture.onclick=()=>{captureRequested=true};document.body.appendChild(capture);
}
function captureReviewFrame(){
 if(!captureRequested)return;captureRequested=false;
 const output=document.createElement('canvas');output.width=renderer.domElement.width;output.height=renderer.domElement.height;
 const ctx=output.getContext('2d');const bg=ctx.createLinearGradient(0,0,output.width,output.height);bg.addColorStop(0,'#fff0d8');bg.addColorStop(1,'#f4d9c2');ctx.fillStyle=bg;ctx.fillRect(0,0,output.width,output.height);ctx.drawImage(renderer.domElement,0,0);
 output.toBlob(blob=>{if(!blob)return;const url=URL.createObjectURL(blob),link=document.createElement('a');link.href=url;link.download=`moss-review-${Date.now()}.png`;link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);},'image/png');
}
const clock=new THREE.Clock();const projected=new THREE.Vector3();const labelBounds=new THREE.Box3();const raycasterForLabels=new THREE.Raycaster();function animate(){requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),t=clock.elapsedTime;garden?.update(t,reduced.matches);seeds.forEach((g,i)=>{g.position.set(Math.sin(t*.08+i*3)*4,2.6+Math.sin(t*.3+i)*.2,Math.cos(t*.07+i*2)*3);g.rotation.z=Math.sin(t*.2+i)*.2;});blades.forEach(b=>{if(!reduced.matches)b.rotation.z+=dt*.55});smoke.forEach((p,i)=>{const age=reduced.matches?i/5:(t*.13+i/5)%1;p.position.set(.55+Math.sin(age*3.2)*.28,2.43+age*1.5,-.25+age*.12);p.scale.setScalar(.12+age*.25);p.material.opacity=.28*Math.sin(Math.PI*age);});if(current<=3){sheep.forEach((g,i)=>{if(g.userData.seal||g.userData.open||reduced.matches)return;const h=g.userData.home,u=g.userData;if(u.tail)u.tail.rotation.x=Math.sin(t*4+i)*.22;if(!u.target&&t>u.pause){const a=t*.37+i*2.4;u.target=new THREE.Vector2(h.x+Math.sin(a)*(u.snail?.3:.72),h.z+Math.cos(a*1.13)*(u.snail?.26:.62));if(u.target.length()>6.35)u.target.multiplyScalar(6.35/u.target.length())}if(u.target){const dx=u.target.x-g.position.x,dz=u.target.y-g.position.z,d=Math.hypot(dx,dz);if(d<.06){u.target=null;u.pause=t+1.2+i*.35;u.legs.forEach(l=>{l.rotation.x=0;l.rotation.z=0})}else{const step=Math.min(d,(u.snail?.1:.42)*dt);if(current===2&&!islandWalkable(g.position.x+dx/d*step,g.position.z+dz/d*step)){u.target=null;u.pause=t+2;return;}g.position.x+=dx/d*step;g.position.z+=dz/d*step;const heading=-Math.atan2(dz,dx);if(u.snail||u.pony){const turn=Math.atan2(Math.sin(heading-g.rotation.y),Math.cos(heading-g.rotation.y));g.rotation.y+=turn*(1-Math.exp(-dt*2.4));}else g.rotation.y=heading;u.stride+=dt*5.4;u.legs.forEach((l,k)=>{l.rotation[u.pony?"z":"x"]=Math.sin(u.stride+(k===0||k===3?0:Math.PI))*(u.pony?.18:.32)})}}g.position.y=meadowHeight(g.position.x,g.position.z);if(g.userData.penguin){const walking=!!u.target;g.rotation.z=0;u.penguinBody.rotation.z=walking?Math.sin(u.stride)*.18:Math.sin(t*1.3+i)*.015;g.position.y+=walking?Math.abs(Math.sin(u.stride))*.025:0;}});if(hiker){if(hikerTarget){const d=hikerTarget.clone().sub(hiker.position);if(d.length()>.06){const next=hiker.position.clone().addScaledVector(d,Math.min(1,1.08*dt/d.length()));if(canWalk(next.x,next.z)){hiker.position.copy(next);hiker.position.y=meadowHeight(next.x,next.z)}else hikerTarget=null;hiker.rotation.y=Math.atan2(d.x,d.z)}else hikerTarget=null}animateHiker(hiker,t,hikerTarget?1:0,reduced.matches)}sheep.forEach((g,i)=>{const el=labels.children[i];if(!el)return;labelBounds.setFromObject(g);let top=1;for(const x of [labelBounds.min.x,labelBounds.max.x])for(const y of [labelBounds.min.y,labelBounds.max.y])for(const z of [labelBounds.min.z,labelBounds.max.z]){projected.set(x,y,z).project(camera);top=Math.min(top,-projected.y*.5+.5)}projected.copy(g.position).project(camera);el.style.left=`${Math.max(55,Math.min(wrap.clientWidth-55,(projected.x*.5+.5)*wrap.clientWidth))}px`;el.style.top=`calc(${top*100}% - 14px)`;const targetVisible=projected.z<=1&&projected.z>=-1;const surfaceHit=current===3&&targetVisible?raycasterForLabels.set(camera.position,g.position.clone().sub(camera.position).normalize()):null;let blocked=false;if(surfaceHit&&garden?.terrain){const hits=raycasterForLabels.intersectObjects(garden.occluders,true);blocked=!!hits.length&&hits[0].distance<camera.position.distanceTo(g.position)-.3;}el.hidden=!targetVisible||blocked||!g.visible||(current===3&&g.position.x*camera.position.x+g.position.z*camera.position.z<0)})}controls.update();const a=controls.getPolarAngle();document.documentElement.style.setProperty('--sky-shift',`${Math.round(a*18)}%`);if(sea)sea.material.uniforms.time.value=reduced.matches?0:t;renderer.render(scene,camera);captureReviewFrame()}animate();

const ambience=new ForestAudio();
const musicButton=document.querySelector('#music-toggle');
musicButton.addEventListener('click',async()=>{musicButton.disabled=true;try{const enabled=await ambience.toggle();musicButton.textContent=enabled?'音乐 · 开':'音乐 · 关';musicButton.setAttribute('aria-pressed',String(enabled));musicButton.setAttribute('aria-label',enabled?'关闭背景音乐':'播放背景音乐');}catch{musicButton.textContent='音乐暂不可用';}finally{musicButton.disabled=false;}});
document.addEventListener('visibilitychange',()=>{if(!ambience.context||!ambience.enabled)return;if(document.hidden)ambience.context.suspend();else ambience.context.resume().catch(()=>{});});
window.addEventListener('pagehide',()=>ambience.stop());

explorationUI=createExplorationUI(portfolioSections,{
 select(index){const animal=sheep.find(g=>g.userData.index===index);if(animal&&!animal.userData.open)toggleSheep(animal);},
 overview(){closePanel();hikerTarget=null;controls.target.set(0,current===3?.8:current===2?.15:-.5,0);camera.position.set(current>=2?3:9,current>=2?10:9,current===3?20:current===2?17:12);controls.update();},
 close:closePanel
});

// Keep identity and content configuration out of the scene constructors.
document.title = `${profile.name} · 互动作品集`;
document.querySelector('.brand strong').textContent=profile.name;
document.querySelector('.brand small').textContent=profile.subtitle;
document.querySelector('.demo').textContent=profile.byline;
document.querySelector('footer').textContent=profile.footer;
document.querySelector('.card-meta').textContent=profile.attribution;
const sourceLink=document.querySelector('.portfolio-source');
try {const url=new URL(profile.url);if(!['https:','http:'].includes(url.protocol))throw new Error();sourceLink.href=url.href;}catch{sourceLink.hidden=true;}

const socialNav=document.querySelector('.social-links');
for(const entry of profile.socialLinks||[]){
 try{const url=new URL(entry.url);if(!['https:','http:'].includes(url.protocol))continue;const link=document.createElement('a');link.href=url.href;link.textContent=entry.label;link.setAttribute('aria-label',`前往${entry.label}主页`);link.target='_blank';link.rel='noopener noreferrer';socialNav.append(link)}catch{}
}
if(!socialNav.children.length)socialNav.hidden=true;
