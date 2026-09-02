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
}
