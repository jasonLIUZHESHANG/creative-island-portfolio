import * as T from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';

const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
export const cloudHeight=(x,z)=>.4+1.15*smooth((.1-z)/1.9);
function radius(a){const d=Math.atan2(Math.sin(a-2.45),Math.cos(a-2.45));return 6.3-2.7*Math.exp(-d*d/.18);}
export function cloudWalkable(x,z){const a=Math.atan2(z/.82,x);return Math.hypot(x,z/.82)<radius(a)-.35&&Math.hypot(x+2.35,z+2.35)>1.75&&!(Math.abs(x-2.4)<1.1&&Math.abs(z+2.7)<.85)&&!(Math.abs(x-3.3)<1.2&&Math.abs(z-1)<.8);}
export function createCloudGarden(root,count){
 const sphere=new T.SphereGeometry(1,32,20),box=new RoundedBoxGeometry(1,1,1,4,.12);
 const materials=new Map();function material(c){if(!materials.has(c))materials.set(c,new T.MeshStandardMaterial({color:c,roughness:.83}));return materials.get(c)}
 function mesh(g,geo,c,x,y,z,sx=1,sy=1,sz=1){const o=new T.Mesh(geo,material(c));o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;o.receiveShadow=true;g.add(o);return o}
 const orb=(g,c,x,y,z,a,b=a,d=a)=>mesh(g,sphere,c,x,y,z,a,b,d);
 const block=(g,c,x,y,z,a,b,d)=>mesh(g,box,c,x,y,z,a,b,d);
 const pole=(g,c,x,y,z,r,h)=>mesh(g,new T.CylinderGeometry(r,r,h,16),c,x,y,z);
 function tube(g,points,r,c){return mesh(g,new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),32,r,8,false),c,0,0,0)}
 // One continuous closed land mass: broad front plaza, gently raised back terrace.
 const verts=[],indices=[],colors=[],segments=160,rings=48;
 for(let j=0;j<=rings;j++)for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=radius(a)*j/rings,x=Math.cos(a)*r,z=Math.sin(a)*r*.82;verts.push(x,cloudHeight(x,z),z);const terrace=smooth((cloudHeight(x,z)-.4)/1.15),c=new T.Color(0xc7dc98).lerp(new T.Color(0xa9c880),terrace*.72);c.offsetHSL(0,0,.012*Math.sin(x*1.4+z*.7));colors.push(c.r,c.g,c.b);}
 for(let j=0;j<rings;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,a+1,b,a+1,b+1,b);}
 const edgeStart=verts.length/3;for(let i=0;i<=segments;i++){const a=i/segments*Math.PI*2,r=radius(a);verts.push(Math.cos(a)*r,-.25,Math.sin(a)*r*.82);const c=new T.Color(0xcbbfa8);colors.push(c.r,c.g,c.b);if(i<segments){const top=rings*(segments+1)+i,b=edgeStart+i;indices.push(top,top+1,b,top+1,b+1,b);}}
 const center=verts.length/3;verts.push(0,-.25,0);colors.push(.6,.55,.45);for(let i=0;i<segments;i++)indices.push(center,edgeStart+i,edgeStart+i+1);
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setIndex(indices);geo.computeVertexNormals();const terrain=mesh(root,geo,0xffffff,0,0,0);terrain.material=new T.MeshStandardMaterial({vertexColors:true,roughness:1});
 // Rounded sparse coast blocks overlap the continuous rim, never form holes.

 for(const [base,n] of [[.2,3],[.95,2],[1.9,3],[2.7,2],[3.55,3],[4.45,2],[5.35,3]])for(let j=0;j<n;j++){const a=base+(j-(n-1)/2)*.12,r=radius(a)+.08,x=Math.cos(a)*r,z=Math.sin(a)*r*.82,h=cloudHeight(x,z),size=.31+(j%2)*.13;const rock=orb(root,0xcbbda6,x,(h-.30)/2,z,size,h*.22+.12,size*.72);rock.rotation.y=-a;}
 const roadRay=new T.Raycaster(),roadOrigin=new T.Vector3(),down=new T.Vector3(0,-1,0);function roadHeight(x,z){roadOrigin.set(x,5,z);roadRay.set(roadOrigin,down);return (roadRay.intersectObject(terrain,false)[0]?.point.y??cloudHeight(x,z))+.035;}
 function path(points,width){const curve=new T.CatmullRomCurve3(points.map(([x,z])=>new T.Vector3(x,0,z))),v=[],idx=[];for(let i=0;i<=90;i++){const p=curve.getPoint(i/90),d=curve.getTangent(i/90);for(const s of [-1,1]){const x=p.x+d.z*width*s,z=p.z-d.x*width*s;v.push(x,roadHeight(x,z),z);}if(i<90){const k=i*2;idx.push(k,k+2,k+1,k+1,k+2,k+3)}}for(const end of [points[0],points.at(-1)]){const [cx,cz]=end,k=v.length/3;v.push(cx,roadHeight(cx,cz),cz);for(let j=0;j<=24;j++){const a=j/24*Math.PI*2,x=cx+Math.cos(a)*width,z=cz+Math.sin(a)*width;v.push(x,roadHeight(x,z),z);if(j<24)idx.push(k,k+j+1,k+j+2);}}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(v,3));g.setIndex(idx);g.computeVertexNormals();const m=mesh(root,g,0xecd8b7,0,0,0);m.material.side=T.DoubleSide;m.castShadow=false;m.receiveShadow=false;m.material.polygonOffset=true;m.material.polygonOffsetFactor=-2;m.material.polygonOffsetUnits=-2;

 }
 path([[-2.15,3.15],[-1.7,2.5],[-.5,1.4],[0,.2],[-.3,-.55],[-1.75,-1.1]],.33);path([[.2,2.4],[2.1,2],[3.4,1.7]],.38);
 function arch(g,x,y,z,w,h,c){const s=new T.Shape();s.moveTo(-w/2,0);s.lineTo(-w/2,h-w/2);s.absarc(0,h-w/2,w/2,Math.PI,0,true);s.lineTo(w/2,0);s.closePath();return mesh(g,new T.ExtrudeGeometry(s,{depth:.07,bevelEnabled:true,bevelSize:.035,bevelThickness:.025,bevelSegments:3,curveSegments:18}),c,x,y,z);}
 const house=new T.Group();house.position.set(-2.35,cloudHeight(-2.35,-2.35),-2.35);house.rotation.y=.45;root.add(house);house.scale.setScalar(.86);
 pole(house,0xf6e8cc,0,.88,0,1.48,1.76);pole(house,0xe6d3af,0,.08,0,1.67,.16);
 // Broad scalloped pink dome, plus the accepted apricot rooftop turret.
 const roofV=[],roofI=[],nr=20,ns=96;for(let j=0;j<=nr;j++)for(let i=0;i<=ns;i++){const u=j/nr,a=i/ns*Math.PI*2,r=Math.sin(u*Math.PI/2)*1.85*(1+.025*Math.cos(a*10)*u);roofV.push(Math.cos(a)*r,2.98-1.12*(1-Math.cos(u*Math.PI/2))-.07*Math.cos(a*10)*u**4,Math.sin(a)*r);}
 for(let j=0;j<nr;j++)for(let i=0;i<ns;i++){const a=j*(ns+1)+i,b=a+ns+1;roofI.push(a,a+1,b,a+1,b+1,b)}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(roofV,3));rg.setIndex(roofI);rg.computeVertexNormals();mesh(house,rg,0xe8b0ba,0,0,0).material.side=T.DoubleSide;
 const rim=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=1.85*(1+.025*Math.cos(a*10));rim.push([Math.cos(a)*r,1.86-.07*Math.cos(a*10),Math.sin(a)*r]);}tube(house,rim,.055,0xf2c8cc);
 for(const x of [-.87,0,.87]){arch(house,x,.17,1.28,x===0?.76:.57,1.42,0xc8a46f);arch(house,x,.21,1.37,x===0?.64:.45,1.32,0xb7d6cd);block(house,0xf5e5c4,x,.8,1.45,.045,1.15,.04);block(house,0xf5e5c4,x,.84,1.45,.48,.045,.04);}
 for(const x of [-1.35,1.35])pole(house,0xf6e8cc,x,.86,1.05,.09,1.65);
 for(let i=0;i<3;i++)block(house,0xe7d1ad,0,.04-i*.12,1.6+i*.2,1.5+i*.25,.16,.46);
 pole(house,0xf5e5c4,0,3.15,0,.32,.58);arch(house,0,2.95,.32,.22,.32,0xb49a78);orb(house,0xeac18b,0,3.48,0,.43,.19,.43);orb(house,0xefc991,0,3.7,0,.065);
 // Small side porch with railing, keeping the harbor side open.
 block(house,0xc8a374,-1.65,.1,.2,1.1,.16,1.5);for(const z of [-.4,.15,.7])pole(house,0xc29968,-2.1,.48,z,.045,.72);block(house,0xc29968,-2.1,.83,.15,.07,.07,1.35);
 const hut=new T.Group();hut.position.set(2.4,cloudHeight(2.4,-2.7),-2.7);root.add(hut);block(hut,0xa8c8a3,0,.75,0,1.6,1.5,1.25);
 for(const side of [-1,1]){const roof=block(hut,0x84ad92,side*.47,1.65,0,1.15,.15,1.55);roof.rotation.z=-side*.53;}
 arch(hut,0,.15,.66,.64,1.22,0xf3e8c8);arch(hut,0,.2,.75,.5,1.1,0xc4ddd2);block(hut,0xd3ac76,0,.72,.95,1.4,.12,.4);for(const x of [-.57,.57])pole(hut,0xd3ac76,x,.38,.95,.045,.7);
 // Swing: ropes and seat are one pendulum, rotating about the top beam's X axis.
 const pergola=new T.Group();pergola.position.set(3.3,cloudHeight(3.3,1),1);root.add(pergola);block(pergola,0xcda570,0,.06,0,2.2,.12,1.5);
 for(const x of [-1,1])for(const z of [-.6,.6])block(pergola,0xc89d68,x,1.2,z,.13,2.35,.13);
 for(let i=0;i<7;i++)block(pergola,0xe0b780,-1.15+i*.38,2.4,0,.12,.14,1.8);
 for(const z of [-.65,.65])block(pergola,0xd4a66b,0,2.3,z,2.55,.15,.13);
 const swing=new T.Group();swing.position.set(0,2.28,0);pergola.add(swing);
 for(const x of [-.65,.65])for(const z of [-.23,.23])pole(swing,0xb09c78,x,-.78,z,.018,1.56);
 block(swing,0xd9b385,0,-1.6,0,1.6,.12,.7);block(swing,0xf5e7d0,0,-1.47,0,1.43,.18,.61);block(swing,0xefdac5,0,-1.2,-.29,1.43,.48,.14);
 const occluders=[terrain,house,hut,pergola];function tree(x,z,s=1){const y=cloudHeight(x,z);occluders.push(pole(root,0xa9845a,x,y+.8*s,z,.14*s,1.6*s));for(const [dx,dy,dz,r] of [[0,1.9,0,.76],[-.42,1.55,.1,.6],[.45,1.6,.12,.62]])occluders.push(orb(root,0xa8c77c,x+dx*s,y+dy*s,z+dz*s,r*s));}
 tree(-.5,-4,1);tree(4.4,-2,.8);tree(4.9,.7,.65);
 function flowers(x,z,c){const y=cloudHeight(x,z);for(const a of [0,2.1,4.2]){const leaf=orb(root,0x89b475,x+Math.cos(a)*.18,y+.12,z+Math.sin(a)*.18,.27,.1,.15);leaf.rotation.y=-a;}for(let i=0;i<5;i++){const a=i*2.4,r=.16*Math.sqrt(i);orb(root,c,x+Math.cos(a)*r,y+.34+(i%2)*.09,z+Math.sin(a)*r,.17,.13,.17);}}
 flowers(-3.7,-.9,0xf5e7b4);flowers(1.3,-2.8,0xe8b9cc);flowers(4.3,2,0xb9bcdd);flowers(.4,3.9,0xf4e4b6);flowers(-1.1,3.6,0xccbbdf);
 const pier=new T.Group();pier.position.set(-2.15,.02,3.8);root.add(pier);for(let i=0;i<8;i++)block(pier,0xd6a578,0,.33,i*.24,1.8,.14,.22);for(const x of [-.95,.95])for(const z of [0,.9,1.8])pole(pier,0xb88c60,x,.25,z,.09,.95);
 const boat=new T.Group();boat.position.set(-3.7,.02,4.35);root.add(boat);orb(boat,0xf4dfba,0,0,0,.46,.23,.85);orb(boat,0x9bbec2,0,-.05,0,.47,.17,.85);orb(boat,0xe0bc85,0,.15,0,.35,.06,.63);pole(boat,0xba9060,0,1.0,0,.035,1.8);const sailShape=new T.Shape();sailShape.moveTo(-.04,1.8);sailShape.lineTo(-.04,.35);sailShape.lineTo(-.72,.42);sailShape.closePath();mesh(boat,new T.ShapeGeometry(sailShape),0xffefcf,0,0,0).material.side=T.DoubleSide;tube(root,[[-3.1,.4,4.7],[-3.35,.15,4.8],[-3.7,.2,4.9]],.025,0xe7d1ac);
 const ripples=Array.from({length:12},()=>new T.Vector4(0,0,-100,0));let next=0,time=0,last=null;
 const water=new T.Mesh(new T.PlaneGeometry(600,600).rotateX(-Math.PI/2),new T.ShaderMaterial({uniforms:{time:{value:0},ripples:{value:ripples}},vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:`varying vec3 p;uniform float time;uniform vec4 ripples[12];void main(){float w=sin(p.x*.45+p.z*.7-time*.25)*sin(p.z*.6+time*.2);float c=0.;for(int i=0;i<12;i++){float age=time-ripples[i].z;if(age>0.&&age<5.)c+=exp(-pow((distance(p.xz,ripples[i].xy)-age*1.1)/.08,2.))*(1.-age/5.)*.15;}float coast=1.-smoothstep(5.5,8.5,length(vec2(p.x,p.z/.82)));vec3 sea=mix(vec3(.20,.64,.65),vec3(.27,.69,.66),coast*.48);gl_FragColor=vec4(sea+w*.012+c,1.);\n#include <colorspace_fragment>\n}`}));water.position.y=-.13;root.add(water);
 const animals=[];for(let i=0;i<count;i++){const g=new T.Group();root.add(g);orb(g,0xb28a60,0,.06,0,.34,.22,.54);orb(g,0xc39b71,0,.34,.36,.3,.29,.28);for(const s of [-1,1]){orb(g,0xb68c61,s*.24,.5,.35,.09);orb(g,0xf2dfb8,s*.095,.3,.59,.13,.10,.065);orb(g,0x39322c,s*.10,.41,.60,.025);orb(g,0xb78b60,s*.27,.12,-.05,.1,.08,.23);orb(g,0x9d764f,s*.17,.02,-.43,.1,.075,.16);}orb(g,0x49382e,0,.34,.66,.042,.027,.025);
  orb(g,0xe9d3aa,0,.21,-.02,.20,.06,.25);
  const tail=orb(g,0xa77e56,0,.015,-.71,.085,.06,.32);tail.rotation.x=-.16;
  for(const side of [-1,1])for(const dy of [-.025,.025])tube(g,[[side*.12,.3+dy,.63],[side*.27,.28+dy,.68],[side*.39,.27+dy,.62]],.008,0xf5e6c8);g.userData={sheep:true,seal:true,index:i,open:false,wool:[...g.children],phase:i*Math.PI*2/Math.max(count,1)+.3};animals.push(g);const wake=new T.Mesh(new T.RingGeometry(.54,.565,48),new T.MeshBasicMaterial({color:0xd0f0e7,transparent:true,opacity:.42,side:T.DoubleSide,depthWrite:false}));wake.rotation.x=-Math.PI/2;root.add(wake);g.userData.wake=wake;}
 function update(t,reduced){const dt=last===null?0:Math.min(.06,Math.max(0,t-last));last=t;if(!reduced)time+=dt;water.material.uniforms.time.value=time;boat.position.y=.02+(reduced?0:Math.sin(time*1.1)*.045);boat.rotation.z=reduced?0:Math.sin(time*.8)*.04;boat.rotation.x=reduced?0:Math.sin(time*.9)*.025;swing.rotation.x=reduced?0:Math.sin(time*1.25)*.17;animals.forEach((g,i)=>{g.visible=i<8||g.userData.open;g.userData.wake.visible=g.visible;if(!reduced&&!g.userData.open)g.userData.phase+=dt*.045;const a=g.userData.open&&g.userData.focusAngle!==undefined?g.userData.focusAngle:g.userData.phase,r=7.3+Math.floor(i/8)*.65;g.position.set(g.userData.open?Math.cos(a)*6.8:Math.cos(a)*r,-.06+(reduced||g.userData.open?0:Math.sin(time*1.8+i)*.022),g.userData.open?Math.sin(a)*6.8*.84:Math.sin(a)*r*.84);g.rotation.y=g.userData.open?Math.PI/2-a:-a;g.userData.wake.position.set(g.position.x,-.115,g.position.z);g.userData.wake.scale.set(1,1.3,1);});}
 update(0,true);
 return {terrain,water,animals,boat,swing,occluders,update,click(p){ripples[next++%12].set(p.x,p.z,time,1)},dispose(){/* Scene owner disposes geometries and materials once on exit. */}};
}
