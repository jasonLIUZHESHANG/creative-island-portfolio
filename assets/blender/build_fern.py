import bpy, math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def mat(name, color):
    m=bpy.data.materials.new(name)
    m.diffuse_color=(*color,1)
    m.use_nodes=True
    m.node_tree.nodes.get('Principled BSDF').inputs['Base Color'].default_value=(*color,1)
    m.node_tree.nodes.get('Principled BSDF').inputs['Roughness'].default_value=.9
    return m

stalk=mat('warm olive stems',(.37,.43,.18))
greens=[mat('fern leaf %d'%i,c) for i,c in enumerate([
    (.51,.61,.26),(.57,.66,.29),(.64,.70,.33),(.47,.57,.24)])]

def tube(name,points,radius,material):
    curve=bpy.data.curves.new(name,'CURVE'); curve.dimensions='3D'; curve.resolution_u=24
    spline=curve.splines.new('BEZIER'); spline.bezier_points.add(len(points)-1)
    for p,co in zip(spline.bezier_points,points):
        p.co=co; p.handle_left_type='AUTO'; p.handle_right_type='AUTO'
    curve.bevel_depth=radius; curve.bevel_resolution=3
    ob=bpy.data.objects.new(name,curve); bpy.context.collection.objects.link(ob); ob.data.materials.append(material)
    return ob

def leaf(name,start,end,width,material):
    # Slightly cupped, pointed leaflets with a thick, rounded midrib.
    a=Vector(start); b=Vector(end); d=b-a
    side=Vector((-d.z,0,d.x)).normalized()
    up=Vector((0,-1,0))
    verts=[]
    for i in range(9):
        t=i/8; center=a+d*t+up*(.07*math.sin(math.pi*t))
        half=width*(math.sin(math.pi*t)**.72)
        for s in [-1,0,1]: verts.append(tuple(center+side*half*s+Vector((0,-.045*abs(s)*math.sin(math.pi*t),0))))
    faces=[]
    for i in range(8):
        k=3*i
        faces.extend([(k,k+1,k+4,k+3),(k+1,k+2,k+5,k+4)])
    mesh=bpy.data.meshes.new(name); mesh.from_pydata(verts,[],faces); mesh.update()
    ob=bpy.data.objects.new(name,mesh); bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    for p in ob.data.polygons:p.use_smooth=True
    mod=ob.modifiers.new('soft leaf','SOLIDIFY'); mod.thickness=.018
    return ob

# Blender X/Z become Three X/Y. The broad frond reaches inward over the moss hill.
fronds=[
  ([(0,0,0),(.04,0,.65),(.30,0,1.35),(.85,0,1.90),(1.58,0,2.14),(2.40,0,2.03),(3.05,0,1.73)],20,.23),
  ([(.07,.02,.25),(-.12,.06,.95),(-.52,.08,1.47),(-1.03,.1,1.65),(-1.55,.08,1.52)],13,.19),
  ([(.07,-.05,.47),(.42,-.11,1.05),(.89,-.14,1.38),(1.36,-.16,1.31)],11,.16),
]
for fi,(coords,count,maximum) in enumerate(fronds):
    tube('curving fern stem %d'%fi,coords,.026 if fi==0 else .018,stalk)
    # Parameterize the centerline by densely sampled cubic Bezier using Blender's path evaluation.
    # A smooth Catmull-style interpolation is enough here because leaves hide the joins.
    for i in range(1,count):
        u=i/count*(len(coords)-1); j=min(int(u),len(coords)-2); t=u-j
        p=Vector(coords[j])*(1-t)+Vector(coords[j+1])*t
        tangent=(Vector(coords[j+1])-Vector(coords[j])).normalized()
        spread=maximum*(math.sin(math.pi*i/count)**.82)+.025
        for sign in [-1,1]:
            # Paired leaflets fan in the same visible plane as the arch.
            start=p+Vector((0,sign*.018,0))
            normal=Vector((-tangent.z,0,tangent.x)).normalized()
            end=p+normal*sign*spread*2.3+tangent*.09
            leaf('tapered leaflet %d %d %d'%(fi,i,sign),start,end,spread*.45,greens[(fi+i+(sign+1)//2)%len(greens)])

for ob in list(bpy.data.objects):
    bpy.ops.object.select_all(action='DESELECT'); ob.select_set(True); bpy.context.view_layer.objects.active=ob
    if ob.type=='CURVE': bpy.ops.object.convert(target='MESH')

bpy.ops.export_scene.gltf(filepath='/Users/jason/codex/生财有术/healing-diorama/public/models/moss-fern.glb',export_format='GLB',export_apply=True)
