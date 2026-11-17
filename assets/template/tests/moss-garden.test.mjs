import test from 'node:test';
import assert from 'node:assert/strict';
import * as T from 'three';
import {pools,gardenHeight,gardenWalkable,createGarden,createGardenCharacter,animateGardenCharacter} from '../src/moss-garden.js';
test('rendered puddle boundary matches the terrain shoreline after rotation',()=>{
 const root=new T.Group(),garden=createGarden(root);root.updateMatrixWorld(true);
 const point=new T.Vector3();let checked=0;
 root.traverse(o=>{if(!o.isReflector)return;const positions=o.geometry.attributes.position;
  for(let i=0;i<positions.count;i++){point.fromBufferAttribute(positions,i).applyMatrix4(o.matrixWorld);assert.ok(Math.abs(gardenHeight(point.x,point.z)-(point.y-.005))<.002,'water boundary must meet its terrain shore');checked++;}
 });assert.ok(checked>200);garden.dispose();
});
test('water lies inside a depressed basin and cannot be walked through',()=>{for(const p of pools){assert.ok(gardenHeight(p.x,p.z)<p.y-.1);assert.equal(gardenWalkable(p.x,p.z),false);assert.ok(gardenHeight(p.x+p.rx*1.4,p.z)>p.y);}});
test('character feet touch origin and animation returns to a stable rest pose',()=>{const g=createGardenCharacter();g.updateMatrixWorld(true);const bounds=new T.Box3().setFromObject(g);assert.ok(Math.abs(bounds.min.y)<.02);assert.ok(bounds.max.y>1.4&&bounds.max.y<1.7);animateGardenCharacter(g,1,true,false);assert.notEqual(g.userData.rig.legs[0].rotation.x,0);animateGardenCharacter(g,2,false,true);assert.ok(Math.abs(g.userData.rig.legs[0].rotation.x)<1e-9);});
test('garden is finite, normals face upwards, reduced motion freezes seeds',()=>{const root=new T.Group(),garden=createGarden(root);const p=garden.terrain.geometry.attributes.position,n=garden.terrain.geometry.attributes.normal;for(let i=0;i<p.count;i++){assert.ok(Number.isFinite(p.getY(i)));assert.ok(n.getY(i)>=0);}garden.update(10,true);const before=root.children[0].children.slice(-2).map(x=>x.position.toArray());garden.update(25,true);assert.deepEqual(root.children[0].children.slice(-2).map(x=>x.position.toArray()),before);garden.dispose();});
