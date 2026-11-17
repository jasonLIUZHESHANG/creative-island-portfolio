import * as T from 'three';
// Broad, low-contrast color variation matches the other miniature worlds.
export function mossMaterial(){
 const m=new T.MeshStandardMaterial({color:0xa5c080,roughness:1});
 m.onBeforeCompile=s=>{
 s.vertexShader=s.vertexShader.replace('#include <common>','#include <common>\nvarying vec3 mossP;').replace('#include <begin_vertex>','#include <begin_vertex>\nmossP=position;');
 s.fragmentShader=s.fragmentShader.replace('#include <common>','#include <common>\nvarying vec3 mossP;').replace('#include <color_fragment>',`#include <color_fragment>
 float variation=sin(mossP.x*.75+sin(mossP.z*.6))*.035+cos(mossP.z*.85)*.025;
 diffuseColor.rgb*=1.+variation;`);
 };return m;
}
