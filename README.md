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
- **Responsive Design** — Optimized layouts for both desktop and mobile devices
- **Sketchbook Aesthetic** — Hand-drawn textures, paper grain, and pencil-sketch styling

## Tech Stack

| Category | Technologies |
|----------|-------------|
| **3D Graphics** | Three.js |
| **Build Tool** | Vite |
| **Backend** | Firebase Firestore (real-time wall) |
| **Hosting** | Vercel |
| **Analytics** | Vercel Analytics |

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
      allow update, delete: if false;
    }
  }
}
```

4. Add your `projectId` and `apiKey` to the `FIREBASE` config in `src/wall-store.js`

> **Note:** These credentials are intentionally public. The security rules above protect the data by allowing only valid note creation and preventing modifications.

## Project Structure

```
├── public/
│   ├── shots/          # Project screenshots
│   └── cv.pdf          # Downloadable CV
├── src/
│   ├── main.js         # Three.js scene, navigation, project data
│   ├── style.css       # Styling and animations
│   └── wall-store.js   # Firebase wall integration
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
