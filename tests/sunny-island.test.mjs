import test from 'node:test';
import assert from 'node:assert/strict';
import {Group,Vector3} from 'three';
import {createSunnyIsland,islandHeight,islandWalkable} from '../src/sunny-island.js';
test('categories generate independent seal entries, including more than four',()=>{
 for(const count of [1,4,7]){const scene=createSunnyIsland(new Group(),count);assert.equal(scene.animals.length,count);assert.deepEqual(scene.animals.map(a=>a.userData.index),Array.from({length:count},(_,i)=>i));scene.update(1,false);scene.update(2,false);const selected=scene.animals[0];selected.userData.open=true;const phase=selected.userData.phase;scene.update(3,false);assert.equal(selected.userData.phase,phase);scene.dispose();}
});
test('water clicks use bounded ripple slots and reduced motion freezes animation',()=>{
 const scene=createSunnyIsland(new Group(),4);scene.update(1,false);for(let i=0;i<20;i++)scene.click(new Vector3(i,0,-i));assert.equal(scene.water.material.uniforms.ripples.value.length,12);assert.ok(scene.water.material.uniforms.ripples.value.some(v=>v.x===19));scene.update(3,true);const before=scene.animals.map(g=>g.position.clone());scene.update(9,true);scene.animals.forEach((g,i)=>assert.ok(g.position.equals(before[i])));scene.dispose();
});
test('walkable surface excludes water and houses and has finite height',()=>{assert.equal(islandWalkable(0,0),true);for(const [x,z] of [[10,0],[-2.7,-1],[2.7,.6],[.4,-2.8]])assert.equal(islandWalkable(x,z),false);assert.ok(islandHeight(0,0)>islandHeight(4,2));});
