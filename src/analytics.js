/* Privacy-light visit analytics, stored in Firestore next to the wall.
   One document per page load in `visits`: written once on arrival, then
   topped up with engagement (time, how far they scrolled, what they opened)
   whenever the tab is hidden. No cookies, no IPs, no personal data — just a
   random id so returning visitors can be counted. Visitors can only create
   and top up their own visit; only the owner can read them (see README). */
import { FIREBASE, idToken } from './wall-store.js';

const COLLECTION = 'visits';
const VISITOR_KEY = 'enesi-visitor';
const ENGAGEMENT = ['d', 's', 'p', 'l', 'nt'];

const docsBase = () =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents`;

const randomId = () =>
  (crypto.randomUUID ? crypto.randomUUID().replace(/-/g, '') : Math.random().toString(36).slice(2) + Date.now().toString(36)).slice(0, 20);

function encode(v) {
  if (typeof v === 'boolean') return { booleanValue: v };
  if (Number.isInteger(v)) return { integerValue: String(v) };
  return { stringValue: String(v) };
}

function decode(fields = {}) {
  const out = {};
  for (const [k, v] of Object.entries(fields)) {
    if ('integerValue' in v) out[k] = Number(v.integerValue);
    else if ('booleanValue' in v) out[k] = v.booleanValue;
    else if ('stringValue' in v) out[k] = v.stringValue;
  }
  return out;
}

/* ---------------- tracking ---------------- */
let enabled = false;
let created = false;
let creating = false;
let lastSent = '';
const visitId = randomId();
const visit = {};
const engagement = { s: 0, projects: new Set(), links: new Set(), nt: 0 };
let activeMs = 0;
let visibleSince = document.visibilityState === 'visible' ? performance.now() : null;

function shouldTrack(owner) {
  if (!FIREBASE.projectId || !FIREBASE.apiKey || owner) return false;
  if (navigator.doNotTrack === '1' || navigator.globalPrivacyControl || navigator.webdriver) return false;
  const local = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  return !local || new URLSearchParams(location.search).has('track');
}

function visitorId() {
  try {
    let id = localStorage.getItem(VISITOR_KEY);
    const isNew = !id;
    if (!id) { id = randomId(); localStorage.setItem(VISITOR_KEY, id); }
    return { id, isNew };
  } catch {
    return { id: visitId, isNew: true };
  }
}

function referrer() {
  const params = new URLSearchParams(location.search);
  const tagged = params.get('utm_source') || params.get('ref');
  if (tagged) return tagged.toLowerCase();
  try {
    const host = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : '';
    return host === location.hostname.replace(/^www\./, '') ? '' : host;
  } catch {
    return '';
  }
}

function device() {
  const coarse = matchMedia('(pointer: coarse)').matches;
  const w = Math.min(screen.width, screen.height);
  if (coarse && w < 600) return 'mobile';
  if (coarse) return 'tablet';
  return 'desktop';
}

function engagementFields() {
  const now = performance.now();
  const ms = activeMs + (visibleSince === null ? 0 : now - visibleSince);
  return {
    d: Math.min(86400, Math.round(ms / 1000)),
    s: engagement.s,
    p: [...engagement.projects].join(',').slice(0, 400),
    l: [...engagement.links].join(',').slice(0, 400),
    nt: Math.min(50, engagement.nt),
  };
}

function toBody(obj) {
  const fields = {};
  for (const [k, v] of Object.entries(obj)) fields[k] = encode(v);
  return JSON.stringify({ fields });
}

function create(keepalive) {
  creating = true;
  const data = { ...visit, ...engagementFields() };
  lastSent = JSON.stringify(engagementFields());
  return fetch(`${docsBase()}/${COLLECTION}?documentId=${visitId}&key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: toBody(data),
    keepalive,
  })
    .then((res) => { if (res.ok) created = true; })
    .catch(() => {})
    .finally(() => { creating = false; });
}

function flush() {
  if (!enabled) return;
  const eng = engagementFields();
  const key = JSON.stringify(eng);
  if (key === lastSent) return;
  if (!created) {
    if (!creating) create(true);
    return;
  }
  lastSent = key;
  const mask = ENGAGEMENT.map((f) => `updateMask.fieldPaths=${f}`).join('&');
  fetch(`${docsBase()}/${COLLECTION}/${visitId}?${mask}&currentDocument.exists=true&key=${FIREBASE.apiKey}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: toBody(eng),
    keepalive: true,
  }).catch(() => {});
}

function linkLabel(a) {
  if (a.dataset.track) return a.dataset.track;
  const href = a.getAttribute('href') || '';
  if (href.startsWith('mailto:')) return 'email';
  if (href.includes('cv.pdf')) return 'cv';
  try {
    const url = new URL(href, location.href);
    if (url.hostname.endsWith('linkedin.com')) return 'linkedin';
    if (url.hostname === 'github.com' && url.pathname.replace(/\/$/, '') === '/Jedidiah5') return 'github';
    return url.hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

export function startTracking(owner) {
  if (!shouldTrack(owner)) return;
  enabled = true;
  const v = visitorId();
  Object.assign(visit, {
    t: Date.now(),
    v: v.id,
    n: v.isNew,
    r: referrer().slice(0, 100),
    dv: device(),
    tz: (Intl.DateTimeFormat().resolvedOptions().timeZone || '').slice(0, 50),
    lg: (navigator.language || '').slice(0, 20),
    w: Math.min(10000, Math.round(window.innerWidth)),
  });
  create(false);

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      if (visibleSince !== null) activeMs += performance.now() - visibleSince;
      visibleSince = null;
      flush();
    } else {
      visibleSince = performance.now();
    }
  });
  window.addEventListener('pagehide', flush);
  document.addEventListener('click', (e) => {
    const a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    const label = linkLabel(a);
    if (label) engagement.links.add(label.slice(0, 40));
  }, true);
}

/* the owner signing in mid-visit shouldn't skew their own numbers */
export function stopTracking() {
  enabled = false;
}

export function trackSection(i) {
  if (i > engagement.s) engagement.s = i;
}
export function trackProject(slug) {
  engagement.projects.add(slug);
}
export function trackNote() {
  engagement.nt += 1;
}

/* ---------------- owner dashboard data ---------------- */
export async function fetchVisits(sinceMs) {
  const token = await idToken();
  const res = await fetch(`${docsBase()}:runQuery?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      structuredQuery: {
        from: [{ collectionId: COLLECTION }],
        where: {
          fieldFilter: {
            field: { fieldPath: 't' },
            op: 'GREATER_THAN_OR_EQUAL',
            value: { integerValue: String(sinceMs) },
          },
        },
        orderBy: [{ field: { fieldPath: 't' }, direction: 'DESCENDING' }],
        limit: 5000,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  if (res.status === 401 || res.status === 403) throw new Error('not allowed');
  if (!res.ok) throw new Error(`firestore query ${res.status}`);
  const rows = await res.json();
  return rows.filter((r) => r.document).map((r) => decode(r.document.fields));
}
