import test from 'node:test';
import assert from 'node:assert/strict';
import {Raycaster,Mesh,MeshBasicMaterial,Vector3} from 'three';
import {createFlatGroundGeometry,groundHeight} from '../src/flat-ground.js';
test('grass and snow ground is level and closed from above and below',()=>{
 const geometry=createFlatGroundGeometry(),mesh=new Mesh(geometry,new MeshBasicMaterial());
 mesh.updateMatrixWorld();
 for(const [x,z] of [[0,0],[3,2],[-5,1],[6,0]]){
  const top=new Raycaster(new Vector3(x,5,z),new Vector3(0,-1,0)).intersectObject(mesh)[0];
  const bottom=new Raycaster(new Vector3(x,-5,z),new Vector3(0,1,0)).intersectObject(mesh)[0];
  assert.ok(top&&bottom);assert.ok(Math.abs(top.point.y-groundHeight)<1e-6);assert.ok(Math.abs(bottom.point.y+.46)<1e-6);
 }
 const side=new Raycaster(new Vector3(10,-.1,0),new Vector3(-1,0,0)).intersectObject(mesh)[0];assert.ok(side);
 geometry.dispose();mesh.material.dispose();
});
