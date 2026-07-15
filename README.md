# ENESI'S SPACE — 3D portfolio

A retro-modern 3D portfolio built with Three.js + Vite.
Scroll / swipe to fly through five stops: HELLO → ABOUT → THE FILES → THE WALL → CONTACT.

## Run it

```bash
npm install
npm run dev      # local dev at http://localhost:5173
npm run build    # production build into /dist
```

Deploy: push to GitHub and import into Vercel (framework preset: Vite). Zero config needed.

## Add real project screenshots

Drop PNGs into `public/shots/` named by slug (see `public/shots/README.txt`).
They automatically replace the generated placeholders in the folder popups.

## Your CV

The "FULL CV ↗" button (contact section) and the "check out my full CV →"
link (about card) both point to `/cv.pdf` — drop your CV into
`public/cv.pdf` and they'll work. Until then they 404.

## Edit your info

All project/profile content lives at the top of `src/main.js` in the `PROJECTS`
array, and the about/contact text is plain HTML in `index.html`.

## The Wall (shared via Firebase)

Sticky notes are stored in Firestore so every visitor sees everyone's notes.
The wiring is in `src/wall-store.js` (plain REST, no SDK). Until the config
is filled in — or if the network fails — the wall silently falls back to
localStorage, so it can never break the site.

One-time setup:

1. Go to https://console.firebase.google.com → **Add project** (no Analytics
   needed).
2. **Build → Firestore Database → Create database** → production mode, any
   region.
3. In Firestore's **Rules** tab, paste and publish:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /wall-notes/{note} {
         allow read: if true;
         allow create: if request.resource.data.keys().hasOnly(['x', 'c', 't'])
           && request.resource.data.x is string
           && request.resource.data.x.size() > 0
           && request.resource.data.x.size() <= 100
           && request.resource.data.c is int
           && request.resource.data.c >= 0
           && request.resource.data.c <= 2
           && request.resource.data.t is int;
         allow update, delete: if false;
       }
     }
   }
   ```

   (Anyone can read and add a valid note; nobody can edit or delete one.)
4. **Project settings → General → Your apps → Add app → Web** — you don't
   need any of the SDK snippet, just copy `projectId` and `apiKey` into
   `FIREBASE` at the top of `src/wall-store.js`. These two values are public
   by design; the rules above are what protect the data.
5. Push — done. Notes now land in the `wall-notes` collection for everyone.
