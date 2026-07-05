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

## The Wall

Visitor signatures are spray-painted onto a canvas texture and saved in
`localStorage` — so right now each visitor only sees their own marks plus the
seeded ones. To make it a truly shared wall, swap `loadWallEntries` /
`saveWallEntries` in `src/main.js` for calls to a tiny backend (Supabase,
Firebase, or Vercel KV all work — it's just a list of `{ n: string, t: number }`).
