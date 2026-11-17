"""Sculpted bedrock source mesh for the rain-after-moss garden.

Run with Blender 5.2: blender -b --python assets/blender/build_bedrock.py
The mesh remains separate from the living moss and interactive water.
"""
import bpy
import math
from pathlib import Path
from mathutils import Vector, noise

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'public' / 'models'
OUT.mkdir(parents=True, exist_ok=True)

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def outline(a):
    return (
        7 * math.cos(a) * (1 + .055 * math.cos(3*a) + .032 * math.cos(5*a) + .016 * math.sin(9*a)),
        6 * math.sin(a) * (1 + .05 * math.cos(4*a) + .02 * math.sin(7*a)),
    )

def hash2(x,y):
    v=math.sin(x*127.1+y*311.7)*43758.5453
    return v-math.floor(v)

def value_noise(x,y):
    a,b=math.floor(x),math.floor(y)
    u,v=x-a,y-b
    u=u*u*(3-2*u)
    v=v*v*(3-2*v)
    ab=hash2(a,b)*(1-u)+hash2(a+1,b)*u
    cd=hash2(a,b+1)*(1-u)+hash2(a+1,b+1)*u
    return ab*(1-v)+cd*v

def terrain_height(x,y):
    left=2.05*math.exp(-((((x+3.55)/3.5)**2+((y+2.7)/2.8)**2)**1.45))
    left_shoulder=.46*math.exp(-((x+4.7)**2/6+(y+.1)**2/3.4))
    right=1.55*math.exp(-((((x-3.5)/3.15)**2+((y+2.5)/2.45)**2)**1.45))
    right_shoulder=.25*math.exp(-((x-5)**2/4+(y-1.8)**2/3))
    return .20+left+left_shoulder+right+right_shoulder+.15*(value_noise(x*1.35,y*1.35)-.5)+.045*(value_noise(x*3.8,y*3.8)-.5)+.08*value_noise(x*.85,y*.85)

def bedrock():
    n, rows = 256, 36
    verts, faces = [], []
    for row in range(rows + 1):
        t = row / rows
        for j in range(n):
            a = 2 * math.pi * j / n
            x, y = outline(a)
            # Broad shoulder and a full, softly tapered underside.
            radius = 1.0 + .115 * math.sin(t * math.pi) - .18 * t*t
            ripple = noise.multi_fractal(Vector((x*.72, y*.72, t*2.7)), 1.2, 2.0, 3) - 1
            radius += .016 * math.sin(a*13 + t*4) * math.sin(t*math.pi) + .018*ripple*math.sin(t*math.pi)
            top = terrain_height(x,y)-.075
            h = top - (1.55+.12*math.sin(a*5))*t + .075 * noise.noise(Vector((x*1.2, y*1.2, t*3))) * math.sin(t*math.pi)
            verts.append((x*radius, -y*radius, h))
            if row:
                p = (row-1)*n+j
                q = (row-1)*n+(j+1)%n
                r = row*n+j
                s = row*n+(j+1)%n
                faces.append((p,q,s,r))
    # A tucked lower surface keeps the rock solid when viewed from below.
    bottom_start=len(verts)
    for j in range(n):
        a=2*math.pi*j/n
        x,y=outline(a)
        verts.append((x*.55,-y*.55,-1.65))
        faces.append((rows*n+j,rows*n+(j+1)%n,bottom_start+(j+1)%n,bottom_start+j))
    verts.append((0,0,-1.7))
    center=len(verts)-1
    for j in range(n):
        faces.append((bottom_start+j,bottom_start+(j+1)%n,center))
    mesh=bpy.data.meshes.new('sculpted-bedrock-mesh')
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    obj=bpy.data.objects.new('sculpted-bedrock',mesh)
    bpy.context.collection.objects.link(obj)
    for polygon in mesh.polygons:
        polygon.use_smooth=True
    mat=bpy.data.materials.new('warm-pumice')
    mat.diffuse_color=(.49,.39,.30,1)
    mat.use_nodes=True
    bsdf=mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value=(.49,.39,.30,1)
    bsdf.inputs['Roughness'].default_value=.96
    mesh.materials.append(mat)
    return obj

rock=bedrock()
bpy.ops.object.select_all(action='DESELECT')
rock.select_set(True)
bpy.context.view_layer.objects.active=rock
bpy.ops.export_scene.gltf(filepath=str(OUT/'moss-bedrock.glb'),export_format='GLB',use_selection=True,export_apply=True)
print('EXPORTED',OUT/'moss-bedrock.glb')
