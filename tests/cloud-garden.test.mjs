import test from 'node:test';
import assert from 'node:assert/strict';
import {Group} from 'three';
import {createCloudGarden,cloudWalkable} from '../src/cloud-garden.js';
test('otters swim, selection pauses swimming; boat and swing animate on intended axes',()=>{
 const scene=createCloudGarden(new Group(),6);
 assert.equal(scene.animals.length,6);
 const p=scene.animals[0].position.clone();
 for(let i=1;i<=60;i++)scene.update(i/60,false);
 assert.ok(p.distanceTo(scene.animals[0].position)>.1);
 assert.notEqual(scene.boat.position.y,.02);
 assert.notEqual(scene.swing.rotation.x,0);
 assert.equal(scene.swing.rotation.y,0);assert.equal(scene.swing.rotation.z,0);
 scene.animals[0].userData.open=true;scene.animals[0].userData.focusAngle=Math.PI/2;
 const phase=scene.animals[0].userData.phase;
 scene.update(1.05,false);assert.equal(scene.animals[0].userData.phase,phase);assert.ok(scene.animals[0].position.z>5);
 scene.update(2,true);const still=scene.animals[1].position.clone();scene.update(3,true);
 assert.deepEqual(scene.animals[1].position,still);
 assert.equal(scene.swing.rotation.x,0);assert.equal(scene.boat.position.y,.02);
 assert.equal(cloudWalkable(20,20),false);assert.equal(cloudWalkable(-2.35,-2.35),false);
});

test('four, six and eight category animals start with clear spacing',()=>{
 for(const count of [4,6,8]){
  const garden=createCloudGarden(new Group(),count);
  assert.equal(garden.animals.length,count);
  for(let i=0;i<count;i++)for(let j=i+1;j<count;j++){
   const a=garden.animals[i].position,b=garden.animals[j].position;
   assert.ok(Math.hypot(a.x-b.x,a.z-b.z)>4.1,`${count} categories: ${i}, ${j}`);
  }
 }
});

test('more than eight categories show extra otters only when selected',()=>{
 const garden=createCloudGarden(new Group(),10);
 assert.equal(garden.animals.length,10);
 assert.equal(garden.animals[8].visible,false);
 garden.animals[8].userData.open=true;
 garden.animals[8].userData.focusAngle=Math.PI/2;
 garden.update(1,false);
 assert.equal(garden.animals[8].visible,true);
 assert.equal(garden.animals[9].visible,false);
 garden.animals[8].userData.open=false;
 garden.update(2,false);
 assert.equal(garden.animals[8].visible,false);
});

test('cloud island geometry stays finite after road path changes',()=>{
 const root=new Group();createCloudGarden(root,4);
 root.traverse(object=>{if(!object.geometry)return;const positions=object.geometry.getAttribute('position');if(!positions)return;for(let i=0;i<positions.count;i++)for(const value of [positions.getX(i),positions.getY(i),positions.getZ(i)])assert.ok(Number.isFinite(value));});
});
