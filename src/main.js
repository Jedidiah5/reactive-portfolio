import * as THREE from 'three';

/* ============================================================
   ENESI'S SPACE — a 3D retro-modern portfolio
   scroll/swipe moves the camera through 5 stops:
   0 HERO · 1 ABOUT · 2 THE FILES · 3 THE WALL · 4 CONTACT
   ============================================================ */

const SECTION_GAP = 26;          // world units between stops
const CAM_DIST = 12;             // camera distance from each stop
const NUM_SECTIONS = 5;

const YELLOW = 0xf5c518;
const BG = 0x0a0a0a;

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
    hue: '#f5c518',
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
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(BG);
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.fog = new THREE.Fog(BG, CAM_DIST + 4, CAM_DIST + 30);

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
  const m = new THREE.PointsMaterial({ color: 0x777777, size: 0.06, sizeAttenuation: true });
  scene.add(new THREE.Points(g, m));
}

function asteriskTexture(color = '#f5c518') {
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
  const tex = asteriskTexture();
  const texW = asteriskTexture('#ffffff');
  for (let i = 0; i < 26; i++) {
    const mat = new THREE.SpriteMaterial({
      map: Math.random() < 0.75 ? tex : texW,
      transparent: true,
      opacity: 0.9,
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
  const grid = new THREE.GridHelper(240, 90, YELLOW, 0x2c2610);
  grid.position.y = -5;
  grid.position.z = -SECTION_GAP * 2;
  grid.material.transparent = true;
  grid.material.opacity = 0.5;
  scene.add(grid);
}

/* ---------------- HERO : spinning CD ---------------- */
let cd;
{
  const c = makeCanvas(512, 512);
  const x = c.getContext('2d');
  const cx = 256;
  const rg = x.createRadialGradient(cx, cx, 40, cx, cx, 250);
  rg.addColorStop(0, '#e8e8e8');
  rg.addColorStop(0.45, '#bfc7d2');
  rg.addColorStop(0.7, '#eef2f8');
  rg.addColorStop(1, '#9aa5b5');
  x.fillStyle = rg;
  x.beginPath(); x.arc(cx, cx, 250, 0, Math.PI * 2); x.fill();
  if (x.createConicGradient) {
    const cg = x.createConicGradient(0, cx, cx);
    const hues = ['#ffd9e8', '#d9e6ff', '#e0ffd9', '#fff3c9', '#f0d9ff', '#ffd9e8'];
    hues.forEach((h, i) => cg.addColorStop(i / (hues.length - 1), h));
    x.globalAlpha = 0.5;
    x.fillStyle = cg;
    x.beginPath(); x.arc(cx, cx, 250, 0, Math.PI * 2); x.fill();
    x.globalAlpha = 1;
  }
  x.globalCompositeOperation = 'destination-out';
  x.beginPath(); x.arc(cx, cx, 42, 0, Math.PI * 2); x.fill();
  x.globalCompositeOperation = 'source-over';
  x.strokeStyle = 'rgba(0,0,0,0.35)';
  x.lineWidth = 6;
  x.beginPath(); x.arc(cx, cx, 46, 0, Math.PI * 2); x.stroke();
  x.beginPath(); x.arc(cx, cx, 247, 0, Math.PI * 2); x.stroke();

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
  x.fillStyle = '#f6f2ea';
  x.fillRect(0, 0, 512, 620);
  // photo area — halftone portrait placeholder, yellow-tinted like the zine
  x.fillStyle = '#1a1503';
  x.fillRect(36, 36, 440, 440);
  x.save();
  x.beginPath(); x.rect(36, 36, 440, 440); x.clip();
  x.fillStyle = '#f5c518';
  for (let r = 0; r < 26; r++) {
    for (let col = 0; col < 26; col++) {
      const d = Math.hypot(col - 13, r - 10);
      const rad = Math.max(0.4, 7.2 - d * 0.55 + Math.sin(col * 1.7 + r) * 1.1);
      x.beginPath();
      x.arc(36 + 12 + col * 17, 36 + 12 + r * 17, rad, 0, Math.PI * 2);
      x.fill();
    }
  }
  x.restore();
  // caption
  x.fillStyle = '#111';
  x.font = '44px "Permanent Marker"';
  x.textAlign = 'center';
  x.fillText('jedidiah ✳ enesi', 256, 560);
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
  // manila body
  x.fillStyle = '#e9b949';
  x.fillRect(0, 0, 512, 360);
  const grad = x.createLinearGradient(0, 0, 0, 360);
  grad.addColorStop(0, 'rgba(255,255,255,0.14)');
  grad.addColorStop(1, 'rgba(80,50,0,0.22)');
  x.fillStyle = grad;
  x.fillRect(0, 0, 512, 360);
  // sticker label
  x.save();
  x.translate(256, 175);
  x.rotate(-0.03 + (idx % 2) * 0.06);
  x.fillStyle = '#f6f2ea';
  x.strokeStyle = '#111';
  x.lineWidth = 5;
  x.fillRect(-200, -85, 400, 170);
  x.strokeRect(-200, -85, 400, 170);
  x.fillStyle = '#111';
  x.font = '52px "Permanent Marker"';
  x.textAlign = 'center';
  const lines = p.short.split('\n');
  lines.forEach((ln, i) => {
    x.fillText(ln, 0, -10 + i * 58 - (lines.length - 1) * 20);
  });
  x.font = '26px "Space Grotesk"';
  x.fillStyle = p.hue === '#f5c518' ? '#b3261e' : '#555';
  x.fillText(p.file, 0, 66);
  x.restore();
  // color spine dot
  x.fillStyle = p.hue;
  x.strokeStyle = '#111';
  x.lineWidth = 5;
  x.beginPath(); x.arc(462, 44, 26, 0, Math.PI * 2); x.fill(); x.stroke();
  return canvasTexture(c);
}

const folders = [];
const folderGroup = new THREE.Group();
folderGroup.position.z = zOf(2);
scene.add(folderGroup);

function buildFolders() {
  const manilaDark = new THREE.MeshLambertMaterial({ color: 0xc79a3a });
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
const WALL_KEY = 'enesi-wall-v1';
const SPRAY_COLORS = ['#f5c518', '#ffffff', '#ff5d5d', '#cba6f7', '#7df9aa', '#9ad7ff', '#ff9c3f'];
let wallMesh, wallCanvas, wallTexture;

function loadWallEntries() {
  try {
    const raw = localStorage.getItem(WALL_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) { /* corrupted — start fresh */ }
  return [
    { n: 'ENESI ✳', t: 0 },
    { n: 'CLAUDE', t: 1 },
    { n: 'U R NEXT', t: 2 },
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

function sprayText(x, text, px, py, size, color, rot) {
  x.save();
  x.translate(px, py);
  x.rotate(rot);
  x.font = `${size}px "Rubik Spray Paint"`;
  x.textAlign = 'center';
  x.textBaseline = 'middle';
  // overspray glow
  x.shadowColor = color;
  x.shadowBlur = size * 0.45;
  x.fillStyle = color;
  x.globalAlpha = 0.92;
  x.fillText(text, 0, 0);
  x.shadowBlur = size * 0.12;
  x.fillText(text, 0, 0);
  // a paint drip or two
  const w = x.measureText(text).width;
  x.shadowBlur = 0;
  x.globalAlpha = 0.5;
  const drips = 1 + Math.floor(hashStr(text) * 2);
  for (let i = 0; i < drips; i++) {
    const dx = (hashStr(text + i) - 0.5) * w * 0.8;
    const dl = 10 + hashStr(text + 'd' + i) * size * 0.9;
    x.fillRect(dx - 1.5, size * 0.28, 3, dl);
  }
  x.restore();
}

function drawWall() {
  if (!wallCanvas) return;
  const x = wallCanvas.getContext('2d');
  const W = wallCanvas.width, H = wallCanvas.height;
  // concrete
  x.globalAlpha = 1;
  x.fillStyle = '#181818';
  x.fillRect(0, 0, W, H);
  // noise speckle
  x.fillStyle = 'rgba(255,255,255,0.03)';
  for (let i = 0; i < 900; i++) {
    x.fillRect(Math.random() * W, Math.random() * H, 2, 2);
  }
  // brick joints
  x.strokeStyle = 'rgba(0,0,0,0.55)';
  x.lineWidth = 4;
  const bh = 86;
  for (let r = 0; r * bh < H; r++) {
    x.beginPath(); x.moveTo(0, r * bh); x.lineTo(W, r * bh); x.stroke();
    const off = r % 2 ? 110 : 0;
    for (let cx = off; cx < W; cx += 220) {
      x.beginPath(); x.moveTo(cx, r * bh); x.lineTo(cx, (r + 1) * bh); x.stroke();
    }
  }
  x.strokeStyle = 'rgba(255,255,255,0.05)';
  x.lineWidth = 1.5;
  for (let r = 0; r * bh < H; r++) {
    x.beginPath(); x.moveTo(0, r * bh + 2); x.lineTo(W, r * bh + 2); x.stroke();
  }
  // header tag
  sprayText(x, 'THEY WERE HERE ✳', W / 2, 96, 88, '#f5c518', -0.012);
  // entries — grid slots with per-name jitter so it looks chaotic but never
  // stacks two names on the same spot
  const cols = 4;
  const top = 190;
  const cellW = W / cols;
  const cellH = 148;
  const rows = Math.floor((H - top) / cellH);
  const slots = cols * rows;
  wallEntries.forEach((e, i) => {
    const slot = i % slots;
    const col = slot % cols;
    const row = Math.floor(slot / cols);
    const h1 = hashStr(e.n + i);
    const h2 = hashStr(i + e.n);
    const px = col * cellW + cellW / 2 + (h1 - 0.5) * cellW * 0.3;
    const py = top + row * cellH + cellH / 2 + (h2 - 0.5) * cellH * 0.3;
    const color = SPRAY_COLORS[Math.floor(h1 * SPRAY_COLORS.length)];
    const size = 52 + h2 * 34;
    const rot = (h1 - 0.5) * 0.3;
    sprayText(x, e.n, px, py, size, color, rot);
  });
  if (wallTexture) wallTexture.needsUpdate = true;
  const counter = document.getElementById('wall-count');
  if (counter) counter.textContent = `${wallEntries.length} MARKS ON THE WALL`;
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

function clampScroll(v) {
  return THREE.MathUtils.clamp(v, 0, NUM_SECTIONS - 1);
}

window.addEventListener('wheel', (e) => {
  if (modalOpen) return;
  if (e.target.closest && e.target.closest('.ui-scroll')) return;
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
  if (e.target.closest && e.target.closest('.ui-scroll')) return;
  const y = e.touches[0].clientY;
  const dy = touchY - y;
  touchMoved += Math.abs(dy);
  scrollTarget = clampScroll(scrollTarget + dy * 0.004);
  touchY = y;
}, { passive: true });

// keyboard
window.addEventListener('keydown', (e) => {
  if (modalOpen) {
    if (e.key === 'Escape') closeModal();
    if (e.key === 'ArrowLeft') stepProject(-1);
    if (e.key === 'ArrowRight') stepProject(1);
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
    el.style.pointerEvents = op > 0.5 ? 'auto' : 'none';
    el.style.transform = `translateY(${(scrollCurrent - i) * -30}px)`;
  });
  const active = Math.round(scrollCurrent);
  navBtns.forEach((b, i) => b.classList.toggle('active', i === active));
}

/* ---------------- pointer: parallax + folder picking ---------------- */
const pointer = new THREE.Vector2(0, 0);
const raycaster = new THREE.Raycaster();
let hoverFolder = null;

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
  if (Math.abs(scrollCurrent - 2) > 0.6) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects(folderGroup.children, true);
  for (const h of hits) {
    const idx = h.object.userData.projectIndex;
    if (idx !== undefined) { openModal(idx); return; }
  }
});

/* ============================================================
   PROJECT MODAL
   ============================================================ */
const modalEl = document.getElementById('modal');
let currentProject = 0;

function shotPlaceholder(p) {
  // a fake retro browser window as the "screenshot" until a real one
  // is dropped into /public/shots/<slug>.png
  return `
  <svg viewBox="0 0 640 380" xmlns="http://www.w3.org/2000/svg">
    <rect width="640" height="380" fill="#111"/>
    <rect width="640" height="34" fill="${p.hue}"/>
    <circle cx="18" cy="17" r="6" fill="#111"/>
    <circle cx="38" cy="17" r="6" fill="#111"/>
    <circle cx="58" cy="17" r="6" fill="#111"/>
    <text x="320" y="23" font-family="'Space Grotesk',sans-serif" font-size="14" font-weight="700" fill="#111" text-anchor="middle">${p.slug}.exe</text>
    ${[...Array(40)].map((_, i) => {
      const a = hashStr(p.slug + i);
      const b = hashStr(i + p.slug);
      return `<circle cx="${40 + a * 560}" cy="${70 + b * 280}" r="${1 + a * 2.5}" fill="${p.hue}" opacity="0.35"/>`;
    }).join('')}
    <text x="320" y="200" font-family="'Rubik Spray Paint',cursive" font-size="58" fill="${p.hue}" text-anchor="middle">${p.short.split('\n')[0]}</text>
    <text x="320" y="262" font-family="'Rubik Spray Paint',cursive" font-size="58" fill="${p.hue}" text-anchor="middle">${p.short.split('\n')[1] || ''}</text>
    <text x="320" y="330" font-family="'Permanent Marker',cursive" font-size="18" fill="#888" text-anchor="middle">✳ screenshot coming soon ✳</text>
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
   SIGN THE WALL
   ============================================================ */
const signEl = document.getElementById('sign');
const signInput = document.getElementById('sign-input');

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

function submitSignature() {
  const name = signInput.value.trim().toUpperCase().slice(0, 18);
  if (!name) { signInput.focus(); return; }
  wallEntries.push({ n: name, t: Date.now() });
  saveWallEntries();
  drawWall();
  signInput.value = '';
  closeSign();
  scrollTarget = 3; // make sure they see it land
}
document.getElementById('sign-submit').addEventListener('click', submitSignature);
signInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') submitSignature();
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
  const t = clock.getElapsedTime();
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
      document.fonts.load('60px "Rubik Spray Paint"'),
      document.fonts.load('60px "Permanent Marker"'),
      document.fonts.load('60px "Space Grotesk"'),
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
