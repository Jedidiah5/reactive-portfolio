/* Shared sticky-note wall, backed by Firestore's REST API (no SDK needed).
   Fill in FIREBASE below from your Firebase console:
   Project settings → General → Your apps → Web app config.
   These two values are safe to ship publicly — write access is controlled
   by the Firestore security rules (see README "The Wall"). */
export const FIREBASE = {
  projectId: 'portfolio-7b6a0', // e.g. 'enesi-space'
  apiKey: 'AIzaSyCw4-K3gan49arv-5MBupV_J-FXZiCebvw',    // e.g. 'AIzaSy...'
};

const COLLECTION = 'wall-notes';
const base = () =>
  `https://firestore.googleapis.com/v1/projects/${FIREBASE.projectId}/databases/(default)/documents/${COLLECTION}`;

export const wallIsShared = () => Boolean(FIREBASE.projectId && FIREBASE.apiKey);

export async function fetchNotes() {
  const res = await fetch(`${base()}?pageSize=300&key=${FIREBASE.apiKey}`, {
    signal: AbortSignal.timeout(4500),
  });
  if (!res.ok) throw new Error(`firestore read ${res.status}`);
  const data = await res.json();
  return (data.documents || [])
    .map((d) => ({
      id: d.name.split('/').pop(),
      x: (d.fields && d.fields.x && d.fields.x.stringValue) || '',
      c: Number((d.fields && d.fields.c && d.fields.c.integerValue) || 0),
      t: Number((d.fields && d.fields.t && d.fields.t.integerValue) || 0),
    }))
    .filter((e) => e.x)
    .sort((a, b) => a.t - b.t);
}

export async function pushNote(entry) {
  const body = {
    fields: {
      x: { stringValue: entry.x },
      c: { integerValue: String(entry.c) },
      t: { integerValue: String(entry.t) },
    },
  };
  const res = await fetch(`${base()}?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(6000),
  });
  if (!res.ok) throw new Error(`firestore write ${res.status}`);
  const doc = await res.json();
  return doc.name.split('/').pop();
}

/* ---- owner session: only the owner's Firebase account may delete notes.
   The Firestore rules pin delete to the owner's UID, so a session from any
   other account is rejected server-side. ---- */
const SESSION_KEY = 'enesi-wall-owner';

function loadSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)) || null; } catch { return null; }
}
let session = loadSession();

function saveSession(s) {
  session = s;
  try {
    if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
    else localStorage.removeItem(SESSION_KEY);
  } catch { /* storage blocked — session lives in memory only */ }
}

export const isOwner = () => Boolean(session);

export async function ownerSignIn(email, password) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE.apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      signal: AbortSignal.timeout(8000),
    }
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data.error && data.error.message) || 'SIGN_IN_FAILED');
  saveSession({
    idToken: data.idToken,
    refreshToken: data.refreshToken,
    expiresAt: Date.now() + Number(data.expiresIn) * 1000,
  });
}

export function ownerSignOut() {
  saveSession(null);
}

async function idToken() {
  if (!session) throw new Error('not signed in');
  if (Date.now() < session.expiresAt - 60_000) return session.idToken;
  const res = await fetch(`https://securetoken.googleapis.com/v1/token?key=${FIREBASE.apiKey}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `grant_type=refresh_token&refresh_token=${encodeURIComponent(session.refreshToken)}`,
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    saveSession(null);
    throw new Error('session expired');
  }
  const data = await res.json();
  saveSession({
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + Number(data.expires_in) * 1000,
  });
  return session.idToken;
}

export async function deleteNote(id) {
  const token = await idToken();
  const res = await fetch(`${base()}/${encodeURIComponent(id)}?key=${FIREBASE.apiKey}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(6000),
  });
  if (res.status === 401 || res.status === 403) throw new Error('not allowed');
  if (!res.ok) throw new Error(`firestore delete ${res.status}`);
}
