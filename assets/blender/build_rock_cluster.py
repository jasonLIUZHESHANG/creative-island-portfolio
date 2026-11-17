"""Make a small sculpted stone cluster for the moss garden (GLB)."""
import bpy
from mathutils import Vector, noise
from pathlib import Path

out=Path(__file__).resolve().parents[2]/'public'/'models'
out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for i,(x,y,size,seed) in enumerate([(0,0,.64,1),(-.72,-.17,.28,2),(.54,-.25,.23,3)]):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=32)
    obj=bpy.context.object
    obj.name=f'river-boulder-{i}'
    for vert in obj.data.vertices:
        p=vert.co.copy()
        n=noise.fractal(Vector((p.x*2.3+seed*7,p.y*2.3,p.z*2.3)),1,2,3)
        f=1+.10*n+.035*noise.noise(Vector((p.x*7,p.y*7+seed,p.z*7)))
        vert.co.x=p.x*size*f
        vert.co.y=p.y*size*.82*f
        vert.co.z=p.z*size*.73*f
    obj.location=(x,y,size*.48)
    for polygon in obj.data.polygons: polygon.use_smooth=True
    mat=bpy.data.materials.new(f'pebble-{i}')
    mat.diffuse_color=(.61,.54,.43,1)
    obj.data.materials.append(mat)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(out/'moss-rocks.glb'),export_format='GLB',use_selection=True,export_apply=True)
print('EXPORTED',out/'moss-rocks.glb')
