import * as T from "three";
const materials = new Map();
export function mat(color, options = {}) {
  const key = JSON.stringify([color, options]);
  if (!materials.has(key))
    materials.set(
      key,
      new T.MeshStandardMaterial({ color, roughness: 0.86, ...options }),
    );
  return materials.get(key);
}
const sphere = new T.SphereGeometry(1, 16, 12),
  box = new T.BoxGeometry(1, 1, 1),
  cylinder = new T.CylinderGeometry(1, 1, 1, 12);
export function mesh(g, geo, color, p = [0, 0, 0], s = [1, 1, 1]) {
  const m = new T.Mesh(geo, color?.isMaterial ? color : mat(color));
  m.position.set(...p);
  m.scale.set(...s);
  m.castShadow = true;
  m.receiveShadow = true;
  g.add(m);
  return m;
}
export const ball = (g, c, p, s) => mesh(g, sphere, c, p, s);
export const block = (g, c, p, s) => mesh(g, box, c, p, s);
export const cyl = (g, c, p, s) => mesh(g, cylinder, c, p, s);
export function capsule(g, c, p, s) {
  return mesh(g, new T.CapsuleGeometry(0.5, 1, 5, 10), c, p, s);
}
export function rod(g, c, a, b, r = 0.045) {
  const A = new T.Vector3(...a),
    B = new T.Vector3(...b),
    m = cyl(g, c, A.clone().add(B).multiplyScalar(0.5).toArray(), [
      r,
      A.distanceTo(B),
      r,
    ]);
  m.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), B.sub(A).normalize());
  return m;
}
export function torus(g, c, p, r = 0.4, tube = 0.04) {
  return mesh(g, new T.TorusGeometry(r, tube, 8, 32), c, p);
}
export function group(parent, p = [0, 0, 0]) {
  const g = new T.Group();
  g.position.set(...p);
  parent?.add(g);
  return g;
}
export function makeHiker() {
  const root=new T.Group(),body=group(root,[0,1.23,0]);
  const skin='#f0c3a0', hair='#514035', jacket='#30383b', denim='#527b9b';
  const legs=[],arms=[],braids=[];
  for(const side of [-1,1]){
    const leg=group(root,[side*.18,1.17,0]);
    capsule(leg,denim,[0,-.45,0],[.32,.61,.34]);
    capsule(leg,'#faf9f2',[0,-.94,.09],[.3,.18,.45]);
    block(leg,'#dedfd8',[0,-1.035,.09],[.29,.045,.43]);
    rod(leg,'#91aec1',[side*.105,-.18,.12],[side*.105,-.73,.12],.009);
    legs.push(leg);
  }
  capsule(body,jacket,[0,.2,0],[.8,.57,.5]);
  block(body,'#b5b5ab',[0,.37,.245],[.23,.36,.03]);
  for(let i=0;i<5;i++)block(body,'#51585a',[0,.23+i*.065,.265],[.23,.025,.015]);
  for(const side of [-1,1]){
    capsule(body,jacket,[side*.19,.45,.15],[.2,.24,.22]);
    const arm=group(body,[side*.47,.44,0]);
    capsule(arm,jacket,[side*.025,-.28,0],[.28,.37,.28]);
    for(const y of [-.48,-.53])block(arm,'#e9e8dd',[side*.025,y,.03],[.24,.018,.24]);
    ball(arm,skin,[side*.025,-.63,.02],[.12,.13,.12]);arms.push(arm);
  }
  for(const y of [-.18,-.23])block(body,'#e9e8dd',[0,y,.08],[.65,.025,.4]);
  rod(body,'#a7aaa6',[0,-.25,.25],[0,.27,.27],.012);
  const head=group(body,[0,.94,.015]);head.scale.setScalar(1.14);
  ball(head,skin,[0,0,0],[.45,.48,.4]);
  ball(head,hair,[0,.24,-.09],[.47,.36,.37]);
  for(const [x,y,z,r] of [[-.32,.25,.17,.17],[-.17,.42,.2,.18],[.05,.43,.22,.17],[.25,.34,.17,.17],[-.39,.05,.02,.13],[.36,.15,-.02,.14]])ball(head,hair,[x,y,z],[r,r*.95,r*.85]);
  for(const side of [-1,1]){
    ball(head,skin,[side*.395,-.015,0],[.065,.1,.065]);
    ball(head,'#fff8eb',[side*.16,.04,.335],[.095,.06,.025]);
    ball(head,'#292b28',[side*.16,.04,.358],[.04,.045,.018]);
    ball(head,'#ffffff',[side*.15,.06,.375],[.012,.014,.005]);
    rod(head,hair,[side*.085,.17,.342],[side*.255,.19,.3],.018);
  }
  ball(head,skin,[0,-.065,.355],[.045,.065,.045]);
  const smile=new T.CatmullRomCurve3([new T.Vector3(-.085,-.19,.334),new T.Vector3(0,-.207,.35),new T.Vector3(.095,-.18,.334)]);
  mesh(head,new T.TubeGeometry(smile,12,.012,5,false),'#a86f5c');
  root.userData={body,head,legs,arms,braids};return root;
}
export function animateHiker(root, time, speed, reduced = false) {
  const { body, legs, arms, braids } = root.userData;
  const walk = reduced ? 0 : speed,
    phase = time * 9;
  legs[0].rotation.x = Math.sin(phase) * 0.48 * walk;
  legs[1].rotation.x = -Math.sin(phase) * 0.48 * walk;
  arms[0].rotation.x = -Math.sin(phase) * 0.36 * walk;
  arms[1].rotation.x = Math.sin(phase) * 0.36 * walk;
  body.position.y = 1.23 + Math.abs(Math.sin(phase)) * 0.055 * walk;
  braids.forEach((b, i) => (b.rotation.z = Math.sin(phase + i) * 0.07 * walk));
}
export function pine(g, x, y, z, s = 1, c = "#3e8271") {
  const t = group(g, [x, y, z]);
  rod(t, "#826e52", [0, 0, 0], [0, 2.9 * s, 0], 0.1 * s);
  for (let i = 0; i < 4; i++) {
    let m = mesh(
      t,
      new T.ConeGeometry(1, 1, 9),
      c,
      [0, (1.1 + i * 0.57) * s, 0],
      [(0.8 - i * 0.14) * s, 1.4 * s, (0.8 - i * 0.14) * s],
    );
    m.rotation.y = i * 0.9;
  }
  return t;
}
export function roundTree(g, x, y, z, s = 1, colors = ["#86b56b", "#b3cf76"]) {
  const t = group(g, [x, y, z]);
  rod(t, "#8b7865", [0, 0, 0], [0, 2.15 * s, 0], 0.14 * s);
  for (let i = 0; i < 3; i++) {
    const a = i * 2.4;
    rod(
      t,
      "#8b7865",
      [0, 1 * s, 0],
      [Math.cos(a) * 0.55 * s, 2 * s, Math.sin(a) * 0.55 * s],
      0.085 * s,
    );
    ball(
      t,
      colors[i % colors.length],
      [Math.cos(a) * 0.42 * s, (2.1 + i * 0.17) * s, Math.sin(a) * 0.42 * s],
      [0.8 * s, 0.81 * s, 0.75 * s],
    );
  }
  return t;
}
export function palm(g, x, y, z, s = 1, c = "#719f79") {
  let t = group(g, [x, y, z]);
  for (let i = 0; i < 7; i++)
    cyl(
      t,
      "#b7a080",
      [i * 0.035 * s, (i * 0.3 + 0.15) * s, 0],
      [0.13 * s, 0.32 * s, 0.13 * s],
    );
  for (let i = 0; i < 7; i++) {
    let a = (i * Math.PI * 2) / 7;
    let leaf = ball(
      t,
      c,
      [Math.cos(a) * 0.67 * s, 2.1 * s, Math.sin(a) * 0.67 * s],
      [0.95 * s, 0.1 * s, 0.26 * s],
    );
    leaf.rotation.y = -a;
    leaf.rotation.z = 0.18 * Math.cos(a);
  }
  for (let i = 0; i < 3; i++)
    ball(
      t,
      "#a57c53",
      [Math.sin(i * 2) * 0.16 * s, 1.9 * s, Math.cos(i * 2) * 0.16 * s],
      [0.16 * s, 0.2 * s, 0.16 * s],
    );
  return t;
}
export function cactus(g, x, y, z, s = 1) {
  let t = group(g, [x, y, z]);
  capsule(t, "#77a58c", [0, 1 * s, 0], [0.4 * s, 1.3 * s, 0.4 * s]);
  for (let side of [-1, 1]) {
    rod(t, "#79ac90", [0, 0.8 * s, 0], [side * 0.55 * s, 0.8 * s, 0], 0.13 * s);
    capsule(
      t,
      "#8bb59b",
      [side * 0.55 * s, 1.15 * s, 0],
      [0.25 * s, 0.55 * s, 0.25 * s],
    );
  }
  ball(t, "#eba291", [0, 1.9 * s, 0], [0.19 * s, 0.09 * s, 0.18 * s]);
  return t;
}
export function coral(g, x, y, z, s = 1, color = "#d79bc2") {
  let t = group(g, [x, y, z]);
  for (let i = 0; i < 5; i++) {
    const a = i * 1.6,
      len = 0.55 + (i % 3) * 0.3;
    rod(
      t,
      color,
      [0, 0, 0],
      [Math.cos(a) * 0.45 * s, len * s, Math.sin(a) * 0.4 * s],
      0.095 * s,
    );
    ball(
      t,
      color,
      [Math.cos(a) * 0.45 * s, len * s, Math.sin(a) * 0.4 * s],
      [0.12 * s, 0.12 * s, 0.12 * s],
    );
    rod(
      t,
      color,
      [Math.cos(a) * 0.25 * s, len * 0.6 * s, Math.sin(a) * 0.25 * s],
      [Math.cos(a + 0.8) * 0.7 * s, len * 0.9 * s, Math.sin(a + 0.8) * 0.6 * s],
      0.06 * s,
    );
  }
  return t;
}
export function tent(g) {
  const geo = new T.ConeGeometry(1.5, 1.7, 4, 1, false);
  geo.rotateY(Math.PI / 4);
  const t = mesh(g, geo, "#dba178", [0, 0.9, 0], [1.25, 1, 1]);
  const door = new T.Shape();
  door.moveTo(-0.67, 0);
  door.lineTo(0.67, 0);
  door.lineTo(0, 1.25);
  door.closePath();
  mesh(g, new T.ShapeGeometry(door), "#304e48", [0, 0.12, 1.07]);
  rod(g, "#f5dfb8", [-1.18, 0, 1.12], [0, 1.78, 0.15], 0.04);
  rod(g, "#f5dfb8", [1.18, 0, 1.12], [0, 1.78, 0.15], 0.04);
  for (let s of [-1, 1]) {
    rod(g, "#e8d7b7", [s * 0.9, 0.7, 0.5], [s * 1.8, 0.05, 1.4], 0.012);
    rod(g, "#86735b", [s * 1.8, 0, 1.4], [s * 1.8, 0.16, 1.4], 0.03);
  }
  block(g, "#e7c28c", [0, 0.04, 1.4], [1.25, 0.06, 0.7]);
  return t;
}
export function chair(g, x = 0, z = 0, color = "#9fb6b0") {
  const c = group(g, [x, 0, z]);
  for (let side of [-1, 1]) {
    rod(c, "#b19673", [side * 0.4, 0.05, -0.4], [side * 0.4, 0.8, 0.45], 0.04);
    rod(c, "#b19673", [side * 0.4, 0.05, 0.45], [side * 0.4, 1.5, -0.3], 0.04);
  }
  block(c, color, [0, 0.68, 0.04], [0.75, 0.045, 0.8]);
  const back = block(c, color, [0, 1.12, -0.26], [0.75, 0.7, 0.05]);
  back.rotation.x = -0.18;
  return c;
}
export function lantern(g, x, y, z) {
  cyl(g, "#d3a156", [x, y, z], [0.19, 0.09, 0.19]);
  cyl(
    g,
    mat("#fff2b0", { emissive: "#ffcf6f", emissiveIntensity: 0.6 }),
    [x, y + 0.2, z],
    [0.13, 0.32, 0.13],
  );
  cyl(g, "#d3a156", [x, y + 0.39, z], [0.18, 0.06, 0.18]);
  const loop = torus(g, "#ac8652", [x, y + 0.53, z], 0.11, 0.018);
  return loop;
}
export function table(g) {
  cyl(g, "#bb9771", [0, 0.65, 0], [0.85, 0.13, 0.6]);
  for (let a of [0, 2.1, 4.2])
    rod(
      g,
      "#8f795c",
      [0, 0.6, 0],
      [Math.cos(a) * 0.65, 0, Math.sin(a) * 0.45],
      0.06,
    );
}
export function book(g, x = 0, y = 0.8, z = 0) {
  const b = group(g, [x, y, z]);
  for (let s of [-1, 1]) {
    let page = block(b, "#fff1ce", [s * 0.29, 0, 0], [0.57, 0.08, 0.75]);
    page.rotation.z = s * 0.12;
    block(b, "#8ba8a5", [s * 0.29, -0.07, 0], [0.6, 0.04, 0.8]).rotation.z =
      s * 0.12;
    for (let i = 0; i < 4; i++) {
      const line = block(
        b,
        "#b3bdaf",
        [s * 0.29, 0.055, -0.2 + i * 0.12],
        [0.36, 0.008, 0.012],
      );
      line.rotation.z = s * 0.12;
    }
  }
  return b;
}
export function backpack(g) {
  capsule(g, "#4b8f87", [0, 0.83, 0], [1.1, 1.1, 0.6]);
  capsule(g, "#80b3a0", [0, 1.53, 0], [1.1, 0.22, 0.64]);
  block(g, "#cbac78", [0, 1.27, 0.33], [0.16, 0.28, 0.03]);
  capsule(g, "#39796e", [0, 0.55, 0.34], [0.72, 0.44, 0.16]);
  for (const s of [-1, 1]) {
    rod(g, "#657169", [s * 0.85, 0.05, 0.15], [s * 0.58, 1.9, 0.05], 0.025);
    capsule(g, "#564d3f", [s * 0.58, 1.86, 0.05], [0.08, 0.22, 0.08]);
  }
  cyl(g, "#a0c6bc", [0.64, 0.8, 0], [0.15, 0.58, 0.15]);
}
export function camel(g) {
  const c = group(g);
  ball(c, "#c29a68", [0, 1.15, 0], [1.02, 0.55, 0.42]);
  ball(c, "#b68b59", [-0.13, 1.62, 0], [0.4, 0.43, 0.37]);
  capsule(c, "#cda875", [0.78, 1.75, 0], [0.35, 0.95, 0.35]).rotation.z = -0.3;
  ball(c, "#cda875", [1.05, 2.38, 0.05], [0.44, 0.27, 0.25]);
  for (const s of [-1, 1]) {
    ball(c, "#624b33", [1.12, 2.43, s * 0.235], [0.035, 0.04, 0.02]);
    capsule(c, "#bc9464", [0.87, 2.66, s * 0.15], [0.09, 0.18, 0.07]);
  }
  for (let x of [-0.65, 0.6])
    for (let z of [-0.27, 0.27]) {
      capsule(c, "#b88b5b", [x, 0.55, z], [0.12, 0.66, 0.12]);
      ball(c, "#80654b", [x, 0.08, z + 0.07], [0.13, 0.08, 0.2]);
    }
  block(c, "#aa7562", [-0.15, 1.6, 0], [0.85, 0.1, 0.95]);
  block(c, "#ead7a0", [-0.15, 1.66, 0], [0.7, 0.06, 0.87]);
  rod(c, "#b58b5d", [-0.98, 1.3, 0], [-1.2, 0.8, 0], 0.045);
  return c;
}
export function fish(g, color = "#edc587", s = 1) {
  const f = group(g);
  ball(f, color, [0, 0, 0], [0.8 * s, 0.43 * s, 0.25 * s]);
  let tail = mesh(
    f,
    new T.ConeGeometry(0.4, 0.6, 3),
    color,
    [-0.9 * s, 0, 0],
    [s, s, 0.6 * s],
  );
  tail.rotation.z = -Math.PI / 2;
  for (const side of [-1, 1]) {
    ball(
      f,
      "#fff9e3",
      [0.42 * s, 0.08 * s, side * 0.21 * s],
      [0.13 * s, 0.14 * s, 0.05 * s],
    );
    ball(
      f,
      "#365561",
      [0.45 * s, 0.08 * s, side * 0.25 * s],
      [0.055 * s, 0.07 * s, 0.025 * s],
    );
  }
  let fin = mesh(
    f,
    new T.ConeGeometry(0.25, 0.4, 3),
    "#e4a77e",
    [0, 0.4 * s, 0],
    [s, s, s * 0.5],
  );
  fin.rotation.z = -0.3;
  return f;
}
export function shell(g) {
  for (let i = 0; i < 9; i++) {
    const a = (i / 8 - 0.5) * Math.PI * 0.8;
    let l = ball(
      g,
      i % 2 ? "#f2cebb" : "#e4b3b2",
      [Math.sin(a) * 0.5, 0.45 + Math.cos(a) * 0.4, -Math.cos(a) * 0.15],
      [0.2, 0.85, 0.16],
    );
    l.rotation.z = -a;
  }
  ball(
    g,
    mat("#fff5d9", { emissive: "#a6cfd7", emissiveIntensity: 0.2 }),
    [0, 0.35, 0.4],
    [0.35, 0.35, 0.35],
  );
}
export function landmark(theme, index) {
  const g = new T.Group();
  if (theme === "forest") {
    if (index === 0) {
      tent(g);
      lantern(g, 1.45, 0.1, 0.3);
    }
    if (index === 1) {
      chair(g, -0.6, 0, "#b6a1bd");
      chair(g, 0.85, -0.3, "#a2beb0").rotation.y = -0.4;
      lantern(g, 0.25, 0.07, 0.7);
    }
    if (index === 2) {
      table(g);
      book(g);
      cyl(g, "#779e97", [0.6, 0.85, 0.15], [0.12, 0.23, 0.12]);
    }
    if (index === 3) backpack(g);
  }
  if (theme === "desert") {
    if (index === 0) camel(g);
    if (index === 1) {
      for (let x of [-1, 1]) rod(g, "#967653", [x, 0, 0], [x, 1.9, 0], 0.055);
      block(g, "#d39e7a", [0, 1.9, 0], [2.2, 0.06, 1.6]).rotation.z = 0.07;
      chair(g, 0, 0, "#c8a17e");
      lantern(g, 0.8, 0.1, 0.6);
    }
    if (index === 2) {
      block(g, "#d5b891", [0, 0.45, 0], [1.7, 0.9, 1.1]);
      book(g, 0, 0.95, 0);
      cyl(g, "#bf8b55", [0.5, 1.2, 0], [0.12, 0.38, 0.12]);
    }
    if (index === 3) {
      block(g, "#9a8264", [0, 0.43, 0], [1.4, 0.86, 0.85]);
      for (let x of [-0.45, 0.45])
        block(g, "#d2b88c", [x, 0.44, 0.44], [0.09, 0.88, 0.035]);
      rod(g, "#82735e", [0.7, 0, 0], [0.7, 1.8, 0], 0.04);
      let scope = cyl(g, "#cfb580", [0.7, 1.85, 0], [0.16, 0.9, 0.16]);
      scope.rotation.z = 0.95;
    }
  }
  if (theme === "ocean") {
    if (index === 0) {
      const f = fish(g, "#ecc78b", 1.15);
      f.position.y = 1.15;
      const small = fish(g, "#9fc5d4", 0.5);
      small.position.set(-0.8, 0.5, 0.7);
    }
    if (index === 1) {
      shell(g);
      coral(g, 1, 0, -0.2, 0.8, "#cc9ebd");
    }
    if (index === 2) {
      const dome = mesh(
        g,
        new T.SphereGeometry(1.05, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2),
        mat("#b0dce0", {
          transparent: true,
          opacity: 0.42,
          metalness: 0.1,
          roughness: 0.1,
        }),
        [0, 0.15, 0],
      );
      const ring = torus(g, "#97bcb8", [0, 0.18, 0], 1.06, 0.06);
      ring.rotation.x = Math.PI / 2;
      book(g, 0, 0.45, 0);
      lantern(g, 0, 0.9, 0);
    }
    if (index === 3) {
      const boat = ball(g, "#ddc7a8", [0, 0.35, 0], [1.4, 0.4, 0.65]);
      block(g, "#91b3b4", [0, 0.58, 0], [1.8, 0.07, 0.85]);
      rod(g, "#bda586", [0, 0.6, 0], [0, 2.35, 0], 0.045);
      const sail = new T.Shape();
      sail.moveTo(0.08, 0);
      sail.lineTo(0.08, 1.55);
      sail.lineTo(1, 0.15);
      sail.closePath();
      mesh(
        g,
        new T.ShapeGeometry(sail),
        mat("#f0ead8", { side: T.DoubleSide }),
        [0, 0.75, 0],
      );
    }
  }
  return g;
}
