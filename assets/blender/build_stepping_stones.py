"""Author ten distinct, softly worn stepping stones for the moss path."""
import bpy
import math
from mathutils import Vector, noise
from pathlib import Path

out=Path(__file__).resolve().parents[2]/'public'/'models'
out.mkdir(parents=True,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

for i in range(10):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=28)
    obj=bpy.context.object
    obj.name=f'stone-{i}'
    width=.88+.18*math.sin(i*1.7+.5)
    depth=.46+.075*math.cos(i*.9)
    thick=.15+.035*math.sin(i*1.3)
    for vert in obj.data.vertices:
        p=vert.co.copy()
        a=math.atan2(p.y,p.x)
        outline=1+.075*math.sin(a*3+i*1.2)+.045*math.cos(a*5+i*.7)
        wobble=.035*noise.noise(Vector((p.x*3+i,p.y*3,p.z*3)))
        vert.co.x=p.x*width*(outline+wobble)
        vert.co.y=p.y*depth*(outline+wobble)
        # A gently flattened top and buried underside read as a real stone.
        vert.co.z=thick*(.55*p.z+.45*math.tanh(p.z*3))
        if p.z>.2: vert.co.z+=.012*noise.noise(Vector((p.x*6+i,p.y*6,p.z*6)))
    obj.data.update()
    for polygon in obj.data.polygons: polygon.use_smooth=True
    mat=bpy.data.materials.new(f'warm-stone-{i}')
    mat.diffuse_color=(.69,.61,.49,1)
    obj.data.materials.append(mat)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.export_scene.gltf(filepath=str(out/'moss-stepping-stones.glb'),export_format='GLB',use_selection=True,export_apply=True)
print('EXPORTED',out/'moss-stepping-stones.glb')
