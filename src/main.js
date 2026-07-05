import * as THREE from 'three';

/* ============================================================
   ENESI'S SPACE — a 3D retro-modern portfolio
   scroll/swipe moves the camera through 5 stops:
   0 HERO · 1 ABOUT · 2 THE FILES · 3 THE WALL · 4 CONTACT
   ============================================================ */

const SECTION_GAP = 26;          // world units between stops
const CAM_DIST = 12;             // camera distance from each stop
const NUM_SECTIONS = 5;

const HL = 0xffd400;      // highlighter yellow
const PAPER = 0xf4f1e8;   // paper background
const INK = 0x2b2b2b;     // graphite

/* ---------------- project data (from enesi-s-space.vercel.app) -------- */
const PROJECTS = [
  {
    slug: 'enesis-space',
    file: 'FILE_01',
    title: "Enesi's Space",
    short: "ENESI'S\nSPACE",
    goal: 'Personal portfolio website — show experience, services, and projects in one fast, accessible site.',
    role: 'Role: solo developer.',
    stack: ['Next.js', 'React', 'TypeScript', 'TailwindCSS', 'Framer Motion'],
    links: [
      { label: 'LIVE ↗', url: 'https://enesi-s-space.vercel.app/' },
      { label: 'CODE ↗', url: 'https://github.com/Enesi-s-Space/Enesi-s-Space.github.io' },
    ],
    hue: '#ffe34d',
  },
  {
    slug: 'rest-api-dashboard',
    file: 'FILE_02',
    title: 'REST API + Dashboard',
    short: 'REST API\n+ DASH',
    goal: 'A full-stack CRUD app with a documented API, persisted data, and a secure client dashboard.',
    role: 'Role: backend (routes, validation, data layer) and frontend (auth, tables, responsive layout).',
    stack: ['Node.js', 'TypeScript', 'Next.js', 'TailwindCSS', 'PostgreSQL'],
    links: [{ label: 'CODE ↗', url: 'https://github.com/Jedidiah5' }],
    hue: '#cba6f7',
  },
  {
    slug: 'capstone',
    file: 'FILE_03',
    title: 'Capstone Build',
    short: 'CAPSTONE\nBUILD',
    goal: 'End-to-end university IT system — deliver a scoped system that maps to degree outcomes.',
    role: 'Role: full-stack ownership — architecture, implementation, and documentation.',
    stack: ['Next.js', 'TypeScript', 'Node.js', 'Prisma', 'React'],
    links: [{ label: 'CODE ↗', url: 'https://github.com/Jedidiah5' }],
    hue: '#ff5d5d',
  },
  {
    slug: 'integrations',
    file: 'FILE_04',
    title: 'Integration & Automation',
    short: 'INTEGRATE\n& AUTOMATE',
    goal: 'A service layer connecting external providers — email, storage, LLMs — with webhooks and observability.',
    role: 'Role: API wiring, configuration, error handling.',
    stack: ['TypeScript', 'Node.js', 'Vercel', 'TailwindCSS', 'Next.js'],
    links: [{ label: 'CODE ↗', url: 'https://github.com/Jedidiah5' }],
    hue: '#7df9aa',
  },
  {
    slug: 'games',
    file: 'FILE_05',
    title: 'Interactive Games',
    short: 'JS\nGAMES',
    goal: 'Three JavaScript games built from scratch: Jumping Box, Color Matching, and Memory Cards.',
    role: 'Role: everything — game loops, input, state, and the fun.',
    stack: ['JavaScript', 'HTML5', 'CSS'],
    links: [{ label: 'CODE ↗', url: 'https://github.com/Jedidiah5' }],
    hue: '#9ad7ff',
  },
];

/* ---------------- renderer / scene / camera ---------------- */
// alpha canvas: the CSS graph-paper background shows through behind the 3D
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(PAPER, 0);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(PAPER, CAM_DIST + 4, CAM_DIST + 30);

const camera = new THREE.PerspectiveCamera(
  55, window.innerWidth / window.innerHeight, 0.1, 200
);
camera.position.set(0, 0, CAM_DIST);

scene.add(new THREE.AmbientLight(0xffffff, 0.85));
const keyLight = new THREE.DirectionalLight(0xfff3d0, 1.4);
keyLight.position.set(4, 6, 8);
scene.add(keyLight);

/* ---------------- helpers ---------------- */
const zOf = (i) => -SECTION_GAP * i;

function makeCanvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return c;
}
function canvasTexture(c) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

/* ---------------- ambient dust + asterisks ---------------- */
{
  const n = 500;
  const pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    pos[i * 3] = (Math.random() - 0.5) * 60;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 30;
    pos[i * 3 + 2] = 10 - Math.random() * (SECTION_GAP * NUM_SECTIONS + 30);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const m = new THREE.PointsMaterial({ color: 0xa39d8e, size: 0.05, sizeAttenuation: true });
  scene.add(new THREE.Points(g, m));
}

function asteriskTexture(color = '#2b2b2b') {
  const c = makeCanvas(128, 128);
  const x = c.getContext('2d');
  x.translate(64, 64);
  x.strokeStyle = color;
  x.lineWidth = 13;
  x.lineCap = 'round';
  for (let i = 0; i < 8; i++) {
    x.beginPath();
    x.moveTo(0, 0);
    x.lineTo(0, -48);
    x.stroke();
    x.rotate(Math.PI / 4);
  }
  return canvasTexture(c);
}
const asterisks = [];
{
  // graphite doodles with the occasional highlighter one
  const tex = asteriskTexture('#2b2b2b');
  const texW = asteriskTexture('#ffd400');
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.SpriteMaterial({
      map: Math.random() < 0.65 ? tex : texW,
      transparent: true,
      opacity: 0.75,
    });
    const s = new THREE.Sprite(mat);
    const sec = Math.floor(Math.random() * NUM_SECTIONS);
    s.position.set(
      (Math.random() - 0.5) * 16,
      (Math.random() - 0.5) * 9,
      zOf(sec) + (Math.random() - 0.5) * 14 - 2
    );
    const sc = 0.25 + Math.random() * 0.55;
    s.scale.setScalar(sc);
    s.userData.spin = (Math.random() - 0.5) * 1.2;
    s.userData.baseY = s.position.y;
    s.userData.ph = Math.random() * Math.PI * 2;
    scene.add(s);
    asterisks.push(s);
  }
}

/* ---------------- retro grid floor ---------------- */
{
  const grid = new THREE.GridHelper(240, 90, 0x8fa6cf, 0xc7d2e6);
  grid.position.y = -5;
  grid.position.z = -SECTION_GAP * 2;
  grid.material.transparent = true;
  grid.material.opacity = 0.4;
  scene.add(grid);
}

/* ---------------- HERO : pencil-sketched spinning disc ---------------- */
let cd;
{
  const c = makeCanvas(512, 512);
  const x = c.getContext('2d');
  const cx = 256;
  // paper disc
  x.fillStyle = '#fdfcf7';
  x.beginPath(); x.arc(cx, cx, 246, 0, Math.PI * 2); x.fill();
  // sketchy double outline — slightly offset passes like a rough pencil
  x.strokeStyle = '#2b2b2b';
  x.lineCap = 'round';
  for (const [r, w, ox, oy] of [[244, 5, 0, 0], [239, 2.5, 3, -2], [50, 4, 0, 0], [46, 2, -2, 2]]) {
    x.lineWidth = w;
    x.beginPath(); x.arc(cx + ox, cx + oy, r, 0.05, Math.PI * 2 - 0.08); x.stroke();
  }
  // highlighter swipe arc
  x.strokeStyle = 'rgba(255, 227, 77, 0.85)';
  x.lineWidth = 34;
  x.beginPath(); x.arc(cx, cx, 150, -0.5, 1.25); x.stroke();
  // radial pencil hatching
  x.strokeStyle = 'rgba(43,43,43,0.35)';
  x.lineWidth = 2;
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2 + (i % 3) * 0.02;
    const r1 = 70 + (i % 5) * 8;
    const r2 = 225 - (i % 7) * 6;
    x.beginPath();
    x.moveTo(cx + Math.cos(a) * r1, cx + Math.sin(a) * r1);
    x.lineTo(cx + Math.cos(a) * r2, cx + Math.sin(a) * r2);
    x.stroke();
  }
  // punch the centre hole out
  x.globalCompositeOperation = 'destination-out';
  x.beginPath(); x.arc(cx, cx, 42, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = 'source-over';

  const tex = canvasTexture(c);
  cd = new THREE.Mesh(
    new THREE.CircleGeometry(2.6, 64),
    new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide })
  );
  cd.position.set(0, 0.4, zOf(0) - 4);
  scene.add(cd);
}

/* ---------------- ABOUT : taped polaroid ---------------- */
let polaroid;
function drawPolaroid() {
  const c = makeCanvas(512, 620);
  const x = c.getContext('2d');
  x.fillStyle = '#ffffff';
  x.fillRect(0, 0, 512, 620);
  x.strokeStyle = '#2b2b2b';
  x.lineWidth = 4;
  x.strokeRect(6, 6, 500, 608);
  // photo area — pencil-stipple portrait placeholder, dark dots on paper
  x.fillStyle = '#f3efe4';
  x.fillRect(36, 36, 440, 440);
  x.strokeStyle = 'rgba(43,43,43,0.7)';
  x.lineWidth = 3;
  x.strokeRect(36, 36, 440, 440);
  x.save();
  x.beginPath(); x.rect(36, 36, 440, 440); x.clip();
  x.fillStyle = '#3a3733';
  for (let r = 0; r < 26; r++) {
    for (let col = 0; col < 26; col++) {
      const d = Math.hypot(col - 13, r - 10);
      const rad = Math.max(0.3, 6.4 - d * 0.55 + Math.sin(col * 1.7 + r) * 1.1);
      x.beginPath();
      x.arc(36 + 12 + col * 17, 36 + 12 + r * 17, rad, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.restore();
  // caption
  x.fillStyle = '#2b2b2b';
  x.font = '700 52px "Caveat"';
  x.textAlign = 'center';
  x.fillText('jedidiah ✳ enesi', 256, 566);
  return canvasTexture(c);
}
function buildPolaroid() {
  const g = new THREE.Group();
  const card = new THREE.Mesh(
    new THREE.PlaneGeometry(3.4, 4.1),
    new THREE.MeshBasicMaterial({ map: drawPolaroid() })
  );
  g.add(card);
  // tape strips
  const tapeMat = new THREE.MeshBasicMaterial({
    color: 0xfff6c0, transparent: true, opacity: 0.65,
  });
  const t1 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), tapeMat);
  t1.position.set(-1.5, 1.95, 0.01);
  t1.rotation.z = 0.6;
  const t2 = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.4), tapeMat);
  t2.position.set(1.5, 1.95, 0.01);
  t2.rotation.z = -0.6;
  g.add(t1, t2);
  g.rotation.z = 0.06;
  g.position.set(4.7, 0.3, zOf(1) - 1.5);
  scene.add(g);
  return g;
}

/* ---------------- PROJECTS : the folders ---------------- */
function folderFaceTexture(p, idx) {
  const c = makeCanvas(512, 360);
  const x = c.getContext('2d');
  // soft manila body with a pencil outline
  x.fillStyle = '#f2d47e';
  x.fillRect(0, 0, 512, 360);
  const grad = x.createLinearGradient(0, 0, 0, 360);
  grad.addColorStop(0, 'rgba(255,255,255,0.35)');
  grad.addColorStop(1, 'rgba(120,90,20,0.12)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 512, 360);
  x.strokeStyle = '#2b2b2b';
  x.lineWidth = 6;
  x.strokeRect(3, 3, 506, 354);
  // sticker label
  x.save();
  x.translate(256, 175);
  x.rotate(-0.03 + (idx % 2) * 0.06);
  x.fillStyle = '#fdfcf7';
  x.strokeStyle = '#2b2b2b';
  x.lineWidth = 4;
  x.fillRect(-200, -85, 400, 170);
  x.strokeRect(-200, -85, 400, 170);
  // highlighter swipe behind the title
  x.fillStyle = 'rgba(255, 227, 77, 0.9)';
  const lines = p.short.split('\n');
  lines.forEach((ln, i) => {
    const y = -10 + i * 58 - (lines.length - 1) * 20;
    x.fillRect(-170, y - 26, 340, 34);
  });
  x.fillStyle = '#2b2b2b';
  x.font = '54px "Patrick Hand"';
  x.textAlign = 'center';
  lines.forEach((ln, i) => {
    x.fillText(ln, 0, -10 + i * 58 - (lines.length - 1) * 20);
  });
  x.font = '700 34px "Caveat"';
  x.fillStyle = '#e0501f';
  x.fillText(p.file, 0, 68);
  x.restore();
  // color sticker dot
  x.fillStyle = p.hue;
  x.strokeStyle = '#2b2b2b';
  x.lineWidth = 4;
  x.beginPath(); x.arc(462, 44, 26, 0, Math.PI * 2); x.fill(); x.stroke();
  return canvasTexture(c);
}

const folders = [];
const folderGroup = new THREE.Group();
folderGroup.position.z = zOf(2);
scene.add(folderGroup);

function buildFolders() {
  const manilaDark = new THREE.MeshLambertMaterial({ color: 0xdbb95e });
  PROJECTS.forEach((p, i) => {
    const g = new THREE.Group();
    const back = new THREE.Mesh(new THREE.BoxGeometry(3.2, 2.3, 0.08), manilaDark);
    const tab = new THREE.Mesh(new THREE.BoxGeometry(1.15, 0.42, 0.08), manilaDark);
    tab.position.set(-1.0, 1.3, 0);
    const face = new THREE.Mesh(
      new THREE.PlaneGeometry(3.2, 2.25),
      new THREE.MeshBasicMaterial({ map: folderFaceTexture(p, i) })
    );
    face.position.set(0, -0.02, 0.06);
    // invisible fat hitbox for easy tapping on mobile
    const hit = new THREE.Mesh(
      new THREE.BoxGeometry(3.6, 3.0, 0.8),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    hit.userData.projectIndex = i;
    g.add(back, tab, face, hit);
    g.userData.ph = Math.random() * Math.PI * 2;
    g.userData.baseRotZ = (Math.random() - 0.5) * 0.12;
    g.rotation.z = g.userData.baseRotZ;
    folderGroup.add(g);
    folders.push(g);
  });
  layoutFolders();
}

let folderScale = 1;
function layoutFolders() {
  const narrow = camera.aspect < 0.8;
  // half of the visible width at the folders' depth
  const halfW = CAM_DIST * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  if (narrow) {
    // 2 columns x 3 rows, sized from what actually fits on this phone
    folderScale = THREE.MathUtils.clamp(halfW / 4.6, 0.45, 0.85);
    const colX = halfW * 0.46;
    const posn = [
      [-colX, 2.3], [colX, 2.3],
      [-colX, -0.1], [colX, -0.1],
      [0, -2.5],
    ];
    folders.forEach((f, i) => {
      f.position.set(posn[i][0], posn[i][1], 0);
      f.scale.setScalar(folderScale);
    });
  } else {
    folderScale = 1;
    const posn = [
      [-4.3, 1.4], [0, 1.4], [4.3, 1.4],
      [-2.15, -1.6], [2.15, -1.6],
    ];
    folders.forEach((f, i) => {
      f.position.set(posn[i][0], posn[i][1], 0);
      f.scale.setScalar(1);
    });
  }
}

/* ---------------- THE WALL ---------------- */
const WALL_KEY = 'enesi-wall-v2';
// sticky notes — yellow, blue, pink only
const NOTE_COLORS = ['#ffef7a', '#9ad7ff', '#ffb7c5'];
const NOTE_FOLDS = ['#e0cc42', '#66aede', '#ee8ba2'];
const NOTE_LIMIT = 100;
let wallMesh, wallCanvas, wallTexture;
const noteMeshes = [];
const flyingNotes = [];

function loadWallEntries() {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    if (raw) return JSON.parse(raw);
    // old pen signatures become notes
    const v1 = localStorage.getItem('enesi-wall-v1');
    if (v1) return JSON.parse(v1).map((e, i) => ({ x: e.n, c: i % 3, t: e.t }));
  } catch (e) { /* corrupted — start fresh */ }
  return [
    { x: 'ENESI WAS HERE ✳', c: 0, t: 0 },
    { x: 'you found the wall! stick a note :)', c: 2, t: 1 },
    { x: 'CLAUDE stuck this one', c: 1, t: 2 },
  ];
}
let wallEntries = loadWallEntries();

function saveWallEntries() {
  try { localStorage.setItem(WALL_KEY, JSON.stringify(wallEntries)); } catch (e) { /* full */ }
}

// deterministic pseudo-random from a string, so entries land in the
// same spot on every load
function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

// where note #i lives on the page (wall-local units), jittered per text
function noteSlot(i, text) {
  const cols = 9, rows = 4;
  const cellW = 16.6 / cols, cellH = 6.5 / rows;
  const slot = i % (cols * rows);
  const col = slot % cols, row = Math.floor(slot / cols);
  const h1 = hashStr(text + i), h2 = hashStr(i + text);
  return {
    x: -8.0 + col * cellW + cellW / 2 + (h1 - 0.5) * cellW * 0.35,
    y: 2.5 - row * cellH - cellH / 2 + (h2 - 0.5) * cellH * 0.35,
    z: 0.08 + (i % (cols * rows)) * 0.004, // stacking order, no z-fighting
    rot: (h1 - 0.5) * 0.24,
  };
}

function wrapNote(ctx, text, maxW, maxLines) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let cur = '';
  for (const w of words) {
    const test = cur ? cur + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && cur) {
      if (lines.length === maxLines - 1) return [...lines, cur + '…'];
      lines.push(cur);
      cur = w;
    } else {
      cur = test;
    }
  }
  if (cur) lines.push(cur);
  return lines;
}

function noteTexture(entry) {
  const c = makeCanvas(256, 256);
  const x = c.getContext('2d');
  x.fillStyle = NOTE_COLORS[entry.c % 3];
  x.fillRect(0, 0, 256, 256);
  // glue-strip sheen up top, slight shadowing below
  const g = x.createLinearGradient(0, 0, 0, 256);
  g.addColorStop(0, 'rgba(255,255,255,0.4)');
  g.addColorStop(0.16, 'rgba(255,255,255,0)');
  g.addColorStop(1, 'rgba(43,43,43,0.07)');
  x.fillStyle = g;
  x.fillRect(0, 0, 256, 256);
  // folded corner, bottom-right
  x.fillStyle = NOTE_FOLDS[entry.c % 3];
  x.beginPath();
  x.moveTo(256, 212); x.lineTo(256, 256); x.lineTo(212, 256);
  x.closePath(); x.fill();
  // pencil border
  x.strokeStyle = 'rgba(43,43,43,0.5)';
  x.lineWidth = 4;
  x.strokeRect(2, 2, 252, 252);
  // the note itself — tiny on the wall, click to read in full
  x.fillStyle = '#2b2b2b';
  x.font = '30px "Patrick Hand"';
  const lines = wrapNote(x, entry.x, 208, 5);
  lines.forEach((ln, i) => x.fillText(ln, 22, 58 + i * 38));
  return canvasTexture(c);
}

function makeNoteMesh(entry, i) {
  const mesh = new THREE.Mesh(
    new THREE.PlaneGeometry(1.24, 1.24),
    new THREE.MeshBasicMaterial({ map: noteTexture(entry) })
  );
  const s = noteSlot(i, entry.x);
  mesh.userData.slot = s;
  mesh.userData.entryIndex = i;
  mesh.position.set(s.x, s.y, s.z);
  mesh.rotation.z = s.rot;
  noteMeshes.push(mesh);
  return mesh;
}

// new note spawns in front of the camera and flies onto the wall
function addNoteAnimated(entry, i) {
  const mesh = makeNoteMesh(entry, i);
  wallMesh.add(mesh);
  mesh.updateWorldMatrix(true, false);
  const targetPos = mesh.getWorldPosition(new THREE.Vector3());
  const targetQuat = mesh.getWorldQuaternion(new THREE.Quaternion());
  const targetScale = mesh.getWorldScale(new THREE.Vector3());
  scene.attach(mesh);
  const startPos = new THREE.Vector3(0, -0.9, -2.4).applyMatrix4(camera.matrixWorld);
  mesh.position.copy(startPos);
  mesh.quaternion.copy(camera.quaternion);
  mesh.scale.copy(targetScale).multiplyScalar(2.4);
  flyingNotes.push({
    mesh, t: 0,
    startPos, startQuat: camera.quaternion.clone(), startScale: mesh.scale.clone(),
    targetPos, targetQuat, targetScale,
  });
}

/* ---- read a note ---- */
const noteViewEl = document.getElementById('note-view');
function openNoteView(i) {
  const e = wallEntries[i];
  if (!e) return;
  const big = document.getElementById('bignote');
  big.textContent = e.x;
  big.style.background = NOTE_COLORS[e.c % 3];
  noteViewEl.classList.remove('hidden');
  modalOpen = true;
}
function closeNoteView() {
  noteViewEl.classList.add('hidden');
  modalOpen = false;
}
document.getElementById('note-close').addEventListener('click', closeNoteView);
noteViewEl.addEventListener('click', (e) => { if (e.target === noteViewEl) closeNoteView(); });

function drawWall() {
  if (!wallCanvas) return;
  const x = wallCanvas.getContext('2d');
  const W = wallCanvas.width, H = wallCanvas.height;
  // notebook page
  x.globalAlpha = 1;
  x.fillStyle = '#fdfcf7';
  x.fillRect(0, 0, W, H);
  // ruled lines
  x.strokeStyle = 'rgba(143, 166, 207, 0.55)';
  x.lineWidth = 2.5;
  for (let y = 170; y < H; y += 76) {
    x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke();
  }
  // red margin line + punched holes
  x.strokeStyle = 'rgba(224, 80, 31, 0.6)';
  x.lineWidth = 3;
  x.beginPath(); x.moveTo(120, 0); x.lineTo(120, H); x.stroke();
  x.fillStyle = '#f4f1e8';
  x.strokeStyle = 'rgba(43,43,43,0.4)';
  x.lineWidth = 3;
  for (const hy of [H * 0.2, H * 0.5, H * 0.8]) {
    x.beginPath(); x.arc(58, hy, 22, 0, Math.PI * 2); x.fill(); x.stroke();
  }
  // page border
  x.strokeStyle = '#2b2b2b';
  x.lineWidth = 6;
  x.strokeRect(3, 3, W - 6, H - 6);
  // header in sketch caps with a highlighter swipe
  x.save();
  x.fillStyle = 'rgba(255,227,77,0.9)';
  x.fillRect(W / 2 - 460, 52, 920, 52);
  x.fillStyle = '#2b2b2b';
  x.font = '700 84px "Cabin Sketch"';
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  x.fillText('THEY WERE HERE ✳', W / 2, 88);
  x.restore();
  if (wallTexture) wallTexture.needsUpdate = true;
  const counter = document.getElementById('wall-count');
  if (counter) counter.textContent = `${wallEntries.length} NOTES ON THE WALL`;
}

function buildWall() {
  wallCanvas = makeCanvas(2048, 1024);
  wallTexture = canvasTexture(wallCanvas);
  wallMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(18, 9),
    new THREE.MeshBasicMaterial({ map: wallTexture })
  );
  wallMesh.position.set(0, 0.6, zOf(3) - 2);
  scene.add(wallMesh);
  drawWall();
  // stick every saved note on as its own little mesh
  wallEntries.forEach((e, i) => wallMesh.add(makeNoteMesh(e, i)));
  layoutWall();
}

function layoutWall() {
  if (!wallMesh) return;
  // fit wall width to the viewport at its viewing distance
  const dist = CAM_DIST - 2; // wall sits 2 units past the stop
  const visW = 2 * dist * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect;
  const s = THREE.MathUtils.clamp((visW * 0.96) / 18, 0.32, 1);
  wallMesh.scale.setScalar(s);
}

/* ---------------- CONTACT : chrome knot ---------------- */
let knot;
{
  knot = new THREE.Mesh(
    new THREE.TorusKnotGeometry(1.5, 0.42, 140, 20),
    new THREE.MeshNormalMaterial()
  );
  knot.position.set(0, 0.6, zOf(4) - 5);
  scene.add(knot);
}

/* ============================================================
   SCROLL ENGINE — virtual scroll drives the camera
   ============================================================ */
let scrollTarget = 0;
let scrollCurrent = 0;
let modalOpen = false;

// dev console handle: check scroll state from the browser console
window.__enesi = {
  get scroll() { return { target: scrollTarget, current: scrollCurrent }; },
  get notes() { return noteMeshes; },
  get flying() { return flyingNotes.length; },
  openNote(i) { openNoteView(i); },
  camera,
};

function clampScroll(v) {
  return THREE.MathUtils.clamp(v, 0, NUM_SECTIONS - 1);
}

// a panel (news clipping, modal body) should swallow the gesture only
// while it can still scroll internally in that direction; otherwise the
// gesture falls through and moves the world
function panelEatsScroll(target, delta) {
  const scroller = target.closest && target.closest('.ui-scroll');
  if (!scroller) return false;
  if (scroller.scrollHeight <= scroller.clientHeight + 2) return false;
  const atTop = scroller.scrollTop <= 0;
  const atBottom = scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 1;
  return (delta > 0 && !atBottom) || (delta < 0 && !atTop);
}

window.addEventListener('wheel', (e) => {
  if (modalOpen) return;
  if (panelEatsScroll(e.target, e.deltaY)) return;
  scrollTarget = clampScroll(scrollTarget + e.deltaY * 0.0016);
}, { passive: true });

let touchY = null, touchX = null, touchMoved = 0;
window.addEventListener('touchstart', (e) => {
  touchY = e.touches[0].clientY;
  touchX = e.touches[0].clientX;
  touchMoved = 0;
}, { passive: true });
window.addEventListener('touchmove', (e) => {
  if (modalOpen || touchY === null) return;
  const y = e.touches[0].clientY;
  const dy = touchY - y;
  touchY = y;
  if (panelEatsScroll(e.target, dy)) return;
  touchMoved += Math.abs(dy);
  scrollTarget = clampScroll(scrollTarget + dy * 0.004);
}, { passive: true });

// keyboard
window.addEventListener('keydown', (e) => {
  if (modalOpen) {
    if (e.key === 'Escape') { closeModal(); closeSign(); closeNoteView(); }
    // arrows browse projects only when the project window itself is open
    if (!modalEl.classList.contains('hidden')) {
      if (e.key === 'ArrowLeft') stepProject(-1);
      if (e.key === 'ArrowRight') stepProject(1);
    }
    return;
  }
  if (e.key === 'ArrowDown' || e.key === 'PageDown') scrollTarget = clampScroll(Math.round(scrollTarget) + 1);
  if (e.key === 'ArrowUp' || e.key === 'PageUp') scrollTarget = clampScroll(Math.round(scrollTarget) - 1);
});

// nav jump buttons
document.querySelectorAll('[data-jump]').forEach((b) => {
  b.addEventListener('click', () => {
    scrollTarget = Number(b.dataset.jump);
  });
});

/* ---------------- section overlay fading ---------------- */
const sectionEls = [...Array(NUM_SECTIONS)].map((_, i) => document.getElementById('s' + i));
const navBtns = document.querySelectorAll('.navlinks button');

function updateOverlays() {
  sectionEls.forEach((el, i) => {
    const d = Math.abs(scrollCurrent - i);
    const op = THREE.MathUtils.clamp(1 - d * 2.4, 0, 1);
    el.style.opacity = op.toFixed(3);
    el.classList.toggle('live', op > 0.5);
    el.style.transform = `translateY(${(scrollCurrent - i) * -30}px)`;
  });
  const active = Math.round(scrollCurrent);
  navBtns.forEach((b, i) => b.classList.toggle('active', i === active));
}

/* ---------------- pointer: parallax + folder picking ---------------- */
const pointer = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
let hoverFolder = null;
let hoverNote = null;

window.addEventListener('pointermove', (e) => {
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  if (e.pointerType === 'mouse' && !modalOpen && Math.abs(scrollCurrent - 2) < 0.5) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(folderGroup.children, true);
    const g = hits.length ? hits[0].object.parent : null;
    if (hoverFolder !== g) {
      hoverFolder = g;
      document.body.style.cursor = g ? 'pointer' : '';
    }
  } else if (e.pointerType === 'mouse' && !modalOpen && Math.abs(scrollCurrent - 3) < 0.5) {
    raycaster.setFromCamera(pointer, camera);
    const hits = raycaster.intersectObjects(noteMeshes, false);
    const n = hits.length ? hits[0].object : null;
    if (hoverNote !== n) {
      if (hoverNote) hoverNote.scale.setScalar(1);
      hoverNote = n;
      if (n) n.scale.setScalar(1.12);
      document.body.style.cursor = n ? 'pointer' : '';
    }
  }
});

let downAt = null;
renderer.domElement.addEventListener('pointerdown', (e) => {
  downAt = [e.clientX, e.clientY];
});
renderer.domElement.addEventListener('pointerup', (e) => {
  if (!downAt || modalOpen) return;
  const dragged = Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]);
  downAt = null;
  if (dragged > 12) return; // it was a swipe, not a tap
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  if (Math.abs(scrollCurrent - 2) < 0.6) {
    const hits = raycaster.intersectObjects(folderGroup.children, true);
    for (const h of hits) {
      const idx = h.object.userData.projectIndex;
      if (idx !== undefined) { openModal(idx); return; }
    }
  } else if (Math.abs(scrollCurrent - 3) < 0.6) {
    const hits = raycaster.intersectObjects(noteMeshes, false);
    if (hits.length) openNoteView(hits[0].object.userData.entryIndex);
  }
});

/* ============================================================
   PROJECT MODAL
   ============================================================ */
const modalEl = document.getElementById('modal');
let currentProject = 0;

function shotPlaceholder(p) {
  // a hand-drawn browser sketch as the "screenshot" until a real one
  // is dropped into /public/shots/<slug>.png
  const gridLines = [...Array(12)].map((_, i) =>
    `<line x1="0" y1="${34 + i * 32}" x2="640" y2="${34 + i * 32}" stroke="#dbe2f0" stroke-width="1"/>
     <line x1="${(i + 1) * 50}" y1="34" x2="${(i + 1) * 50}" y2="380" stroke="#dbe2f0" stroke-width="1"/>`
  ).join('');
  return `
  <svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="380" fill="#fdfcf7"/>
    ${gridLines}
    <rect width="640" height="34" fill="${p.hue}" opacity="0.85"/>
    <line x1="0" y1="34" x2="640" y2="34" stroke="#2b2b2b" stroke-width="2.5" stroke-dasharray="7 5"/>
    <circle cx="18" cy="17" r="6" fill="#fdfcf7" stroke="#2b2b2b" stroke-width="2"/>
    <circle cx="38" cy="17" r="6" fill="#fdfcf7" stroke="#2b2b2b" stroke-width="2"/>
    <circle cx="58" cy="17" r="6" fill="#fdfcf7" stroke="#2b2b2b" stroke-width="2"/>
    <text x="320" y="23" font-family="'Patrick Hand',cursive" font-size="16" fill="#2b2b2b" text-anchor="middle">${p.slug}.sketch</text>
    <rect x="150" y="150" width="340" height="46" fill="#ffe34d" opacity="0.8" transform="rotate(-1 320 200)"/>
    <text x="320" y="190" font-family="'Cabin Sketch',cursive" font-weight="700" font-size="52" fill="#2b2b2b" text-anchor="middle">${p.short.split('\n')[0]}</text>
    <text x="320" y="250" font-family="'Cabin Sketch',cursive" font-weight="700" font-size="52" fill="#2b2b2b" text-anchor="middle">${p.short.split('\n')[1] || ''}</text>
    <text x="320" y="330" font-family="'Caveat',cursive" font-size="26" fill="#8a857a" text-anchor="middle">✳ screenshot coming soon ✳</text>
  </svg>`;
}

function openModal(i) {
  currentProject = i;
  const p = PROJECTS[i];
  document.getElementById('modal-name').textContent = p.file;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-goal').textContent = p.goal;
  document.getElementById('modal-role').textContent = p.role;
  document.getElementById('modal-stack').innerHTML =
    p.stack.map((s) => `<span>${s}</span>`).join('');
  document.getElementById('modal-links').innerHTML =
    p.links.map((l) => `<a class="paper-btn" href="${l.url}" target="_blank" rel="noreferrer">${l.label}</a>`).join('');
  document.getElementById('modal-index').textContent = `${i + 1} / ${PROJECTS.length}`;
  const shot = document.getElementById('modal-shot');
  shot.innerHTML = shotPlaceholder(p);
  // swap in a real screenshot if one exists in /public/shots/
  const img = new Image();
  img.onload = () => { shot.innerHTML = ''; shot.appendChild(img); };
  img.src = `/shots/${p.slug}.png`;
  modalEl.classList.remove('hidden');
  modalOpen = true;
}
function closeModal() {
  modalEl.classList.add('hidden');
  modalOpen = false;
}
function stepProject(dir) {
  openModal((currentProject + dir + PROJECTS.length) % PROJECTS.length);
}
document.getElementById('modal-close').addEventListener('click', closeModal);
document.getElementById('modal-prev').addEventListener('click', () => stepProject(-1));
document.getElementById('modal-next').addEventListener('click', () => stepProject(1));
modalEl.addEventListener('click', (e) => { if (e.target === modalEl) closeModal(); });

/* ============================================================
   STICK A NOTE
   ============================================================ */
const signEl = document.getElementById('sign');
const signInput = document.getElementById('sign-input');
const charCount = document.getElementById('char-count');
let noteColor = 0;

document.getElementById('sign-btn').addEventListener('click', () => {
  signEl.classList.remove('hidden');
  modalOpen = true;
  setTimeout(() => signInput.focus(), 80);
});
function closeSign() {
  signEl.classList.add('hidden');
  modalOpen = false;
}
document.getElementById('sign-close').addEventListener('click', closeSign);
signEl.addEventListener('click', (e) => { if (e.target === signEl) closeSign(); });

document.querySelectorAll('.swatch').forEach((b) => {
  b.addEventListener('click', () => {
    noteColor = Number(b.dataset.c);
    document.querySelectorAll('.swatch').forEach((s) => s.classList.toggle('selected', s === b));
    signInput.style.background = NOTE_COLORS[noteColor];
    signInput.focus();
  });
});
signInput.addEventListener('input', () => {
  charCount.textContent = `${signInput.value.length} / ${NOTE_LIMIT}`;
});

function submitSignature() {
  const text = signInput.value.trim().slice(0, NOTE_LIMIT);
  if (!text) { signInput.focus(); return; }
  const entry = { x: text, c: noteColor, t: Date.now() };
  wallEntries.push(entry);
  saveWallEntries();
  addNoteAnimated(entry, wallEntries.length - 1);
  drawWall(); // refreshes the counter
  signInput.value = '';
  charCount.textContent = `0 / ${NOTE_LIMIT}`;
  closeSign();
  scrollTarget = 3; // watch it land
}
document.getElementById('sign-submit').addEventListener('click', submitSignature);
signInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitSignature(); }
  if (e.key === 'Escape') closeSign();
});

/* ============================================================
   RESIZE / RENDER LOOP
   ============================================================ */
function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  layoutFolders();
  layoutWall();
  if (cd) cd.scale.setScalar(camera.aspect < 0.8 ? 0.62 : 1);
  if (polaroid) {
    if (camera.aspect < 0.8) {
      // on phones the news clipping fills the screen — tuck the
      // polaroid up top so it peeks over the paper
      polaroid.position.set(1.1, 3.3, zOf(1) - 3);
      polaroid.scale.setScalar(0.62);
    } else {
      polaroid.position.set(4.7, 0.3, zOf(1) - 1.5);
      polaroid.scale.setScalar(1);
    }
  }
}
window.addEventListener('resize', onResize);

const clock = new THREE.Clock();
function tick() {
  // cap dt so animations don't skip after a tab switch
  const dt = Math.min(clock.getDelta(), 0.05);
  const t = clock.elapsedTime;
  scrollCurrent += (scrollTarget - scrollCurrent) * 0.07;

  camera.position.z = CAM_DIST - scrollCurrent * SECTION_GAP;
  // gentle parallax
  camera.position.x += (pointer.x * 0.7 - camera.position.x) * 0.04;
  camera.position.y += (pointer.y * 0.35 - camera.position.y) * 0.04;
  camera.lookAt(camera.position.x * 0.6, camera.position.y * 0.6, camera.position.z - 10);

  if (cd) { cd.rotation.z = t * 0.5; cd.position.y = 0.4 + Math.sin(t * 0.8) * 0.18; }
  if (knot) { knot.rotation.x = t * 0.35; knot.rotation.y = t * 0.5; }
  if (polaroid) { polaroid.rotation.z = 0.06 + Math.sin(t * 0.7) * 0.02; }

  asterisks.forEach((s) => {
    s.material.rotation += s.userData.spin * 0.008;
    s.position.y = s.userData.baseY + Math.sin(t * 0.9 + s.userData.ph) * 0.25;
  });

  folders.forEach((f, i) => {
    const hovered = f === hoverFolder;
    const targetS = folderScale * (hovered ? 1.09 : 1);
    f.scale.x += (targetS - f.scale.x) * 0.15;
    f.scale.y = f.scale.z = f.scale.x;
    f.rotation.z = f.userData.baseRotZ + Math.sin(t * 0.8 + f.userData.ph) * 0.03;
    f.position.y += Math.sin(t * 1.1 + f.userData.ph) * 0.0016;
  });

  // fresh sticky notes flying onto the wall
  for (let i = flyingNotes.length - 1; i >= 0; i--) {
    const f = flyingNotes[i];
    f.t = Math.min(1, f.t + dt / 0.9);
    const e = 1 - Math.pow(1 - f.t, 3); // easeOutCubic
    f.mesh.position.lerpVectors(f.startPos, f.targetPos, e);
    f.mesh.position.y += Math.sin(e * Math.PI) * 1.2; // a little toss arc
    f.mesh.quaternion.slerpQuaternions(f.startQuat, f.targetQuat, e);
    f.mesh.rotateZ((1 - e) * 0.7 * Math.sin(f.t * 9)); // wobble in flight
    f.mesh.scale.lerpVectors(f.startScale, f.targetScale, e);
    if (f.t >= 1) {
      // land: snap onto the wall in exact local coords
      const s = f.mesh.userData.slot;
      wallMesh.add(f.mesh);
      f.mesh.position.set(s.x, s.y, s.z);
      f.mesh.rotation.set(0, 0, s.rot);
      f.mesh.scale.setScalar(1);
      flyingNotes.splice(i, 1);
    }
  }

  updateOverlays();
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}

/* ============================================================
   BOOT — wait for the display fonts so canvas textures render
   with the right typefaces, then build everything
   ============================================================ */
async function boot() {
  try {
    await Promise.all([
      document.fonts.load('700 60px "Caveat"'),
      document.fonts.load('60px "Patrick Hand"'),
      document.fonts.load('700 60px "Cabin Sketch"'),
    ]);
  } catch (e) { /* fonts blocked — fallbacks are fine */ }

  polaroid = buildPolaroid();
  buildFolders();
  buildWall();
  onResize();
  tick();

  const loader = document.getElementById('loader');
  setTimeout(() => loader.classList.add('done'), 500);
}
boot();
