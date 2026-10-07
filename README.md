# Enesi's Space

A retro-modern 3D portfolio featuring an interactive sketchbook aesthetic, built with Three.js and Vite.

**[Live Demo →](https://enesi.space/)**

---

## Overview

Enesi's Space is an immersive portfolio experience that combines hand-drawn aesthetics with modern web technologies. Visitors navigate through five distinct sections using scroll or swipe gestures, exploring projects through interactive 3D folder metaphors and leaving notes on a shared community wall.

## Features

- **3D Navigation** — Smooth camera movement through five themed sections
- **Interactive Project Folders** — Click to explore detailed project case studies
- **Community Wall** — Real-time sticky notes shared across all visitors via Firebase
- **Stats Dashboard** — Owner-only, in-site analytics at `/?stats`
- **Responsive Design** — Optimized layouts for both desktop and mobile devices
- **Sketchbook Aesthetic** — Hand-drawn textures, paper grain, and pencil-sketch styling

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **3D Graphics** | Three.js |
| **Build Tool** | Vite |
| **Backend** | Firebase Firestore (real-time wall) |
| **Hosting** | Vercel |
| **Analytics** | Vercel Analytics + in-site stats dashboard (Firestore) |

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Jedidiah5/reactive-portfolio.git
cd reactive-portfolio

# Install dependencies
npm install

# Start development server
npm run dev
```

The development server runs at `http://localhost:5173`.

### Production Build

```bash
npm run build    # Outputs to /dist
npm run preview  # Preview the production build locally
```

## Deployment

Deploy to Vercel with zero configuration:

1. Push to GitHub
2. Import the repository in [Vercel](https://vercel.com)
3. Select **Vite** as the framework preset
4. Deploy

## Customization

### Project Content

Edit the `PROJECTS` array in `src/main.js` to update portfolio entries:

```javascript
{
  slug: 'project-name',
  title: 'Project Title',
  goal: 'Project description...',
  stack: ['Tech', 'Stack', 'Here'],
  links: [{ label: 'LIVE ↗', url: 'https://...' }],
  // ...
}
```

### Screenshots

Add project screenshots to `public/shots/` using the project slug as the filename:

```
public/shots/cheerz.png
public/shots/zonein.png
```

These automatically replace the generated placeholders in project modals.

### Profile & Contact

Update personal information directly in `index.html` within the relevant section elements.

### CV/Resume

Place your CV at `public/cv.pdf` to enable the download buttons throughout the site.

## Firebase Wall Setup

The community sticky-note wall uses Firestore for real-time synchronization. The implementation gracefully falls back to localStorage if Firebase is unavailable.

### Configuration

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Firestore Database** in production mode
3. Configure security rules:

```javascript
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
      // only the site owner's Firebase Auth account can hide/unhide notes (the `h` flag) ...
      allow update: if request.auth != null && request.auth.uid == 'YOUR_OWNER_UID'
        && request.resource.data.diff(resource.data).affectedKeys().hasOnly(['h'])
        && request.resource.data.h is bool;
      // ... or delete them
      allow delete: if request.auth != null && request.auth.uid == 'YOUR_OWNER_UID';
    }

    // visit analytics: anyone can log a visit and top up its engagement numbers,
    // only the owner can read them (powers the in-site stats dashboard)
    function validEngagement() {
      let d = request.resource.data;
      return d.d is int && d.d >= 0 && d.d <= 86400
        && d.s is int && d.s >= 0 && d.s <= 4
        && d.p is string && d.p.size() <= 400
        && d.l is string && d.l.size() <= 400
        && d.nt is int && d.nt >= 0 && d.nt <= 50;
    }
    match /visits/{visit} {
      allow create: if request.resource.data.keys().hasOnly(['t', 'v', 'n', 'r', 'dv', 'tz', 'lg', 'w', 'd', 's', 'p', 'l', 'nt'])
        && request.resource.data.t is int
        && request.resource.data.v is string && request.resource.data.v.size() <= 40
        && request.resource.data.n is bool
        && request.resource.data.r is string && request.resource.data.r.size() <= 100
        && request.resource.data.dv in ['mobile', 'tablet', 'desktop']
        && request.resource.data.tz is string && request.resource.data.tz.size() <= 50
        && request.resource.data.lg is string && request.resource.data.lg.size() <= 20
        && request.resource.data.w is int
        && validEngagement();
      allow update: if request.resource.data.diff(resource.data).affectedKeys().hasOnly(['d', 's', 'p', 'l', 'nt'])
        && validEngagement();
      allow read: if request.auth != null && request.auth.uid == 'YOUR_OWNER_UID';
    }
  }
}
```

4. Add your `projectId` and `apiKey` to the `FIREBASE` config in `src/wall-store.js`

> **Note:** These credentials are intentionally public. The security rules above protect the data by allowing only valid note creation and letting only the owner hide or delete notes.

### Hiding & removing notes (owner only)

1. In Firebase Console → **Authentication** → **Sign-in method**, enable **Email/Password**
2. **Authentication** → **Users** → **Add user** with your email and a strong password, then copy the **User UID**
3. Replace `YOUR_OWNER_UID` in the rules above with that UID and publish the rules
4. Visit `https://enesi.space/?owner`, sign in, then open any note on the wall:
   - **Hide** takes it off the wall for visitors but keeps it; you still see it faded with a HIDDEN stamp and can **Unhide** it
   - **Delete** removes it permanently

The sign-in stays saved in that browser until you sign out (visit `?owner` again).

### Stats dashboard (owner only)

Visit `https://enesi.space/?stats` (or press **STATS** in the owner window). It shows, for the last 7, 30 or 90 days:

- visits, unique visitors, average time on site and how many reached the contact section
- visits per day
- how far people scroll, which project files they open and which links they click
- where they came from (referrer or `?ref=` / `?utm_source=` tag), devices and time zones
- the latest visits

How it's collected: one Firestore document per page load in `visits` (`src/analytics.js`). No cookies, IP addresses or personal data — just a random visitor id in localStorage so returning visitors can be counted. Visits from the owner, from `localhost` (unless the URL has `?track`), and from browsers sending Do Not Track / Global Privacy Control are never recorded.

Tip: share tagged links like `https://enesi.space/?ref=cv` or `?ref=linkedin-post` to see which ones bring people in.

## Project Structure

```
├── public/
│   ├── shots/          # Project screenshots
│   └── cv.pdf          # Downloadable CV
├── src/
│   ├── main.js         # Three.js scene, navigation, project data
│   ├── style.css       # Styling and animations
│   ├── wall-store.js   # Firebase wall integration + owner sign-in
│   ├── analytics.js    # Visit tracking (Firestore `visits`)
│   └── stats.js        # Owner-only stats dashboard
├── index.html          # Main HTML structure
└── package.json
```

## License

This project is available for personal portfolio use.

## Author

**Jedidiah Onotu** — Full-Stack & AI Software Engineer

- [Portfolio](https://enesi.space/)
- [GitHub](https://github.com/Jedidiah5)
- [LinkedIn](https://www.linkedin.com/in/jedidiah-onotu)
