# Setup

How to run the Tax Simulator locally. It is a static React + Vite app — no backend,
no database, no environment variables.

## Prerequisites

- **Node.js 18+** (Vite 5 requires Node 18 or newer)
- **npm** (ships with Node)

Verify:

```bash
node --version   # should print v18.x or newer
npm --version
```

## Install

All source lives in `client/`. Install dependencies from there:

```bash
cd client
npm install
```

## Run the dev server

```bash
npm start
```

This starts Vite on **http://localhost:3000** with hot reload. Open that URL in a
browser — inputs persist to `localStorage`, so your entries survive reloads.

## Run the tests

```bash
npm test
```

Runs Vitest in watch mode. Covers `src/tax/*` calculation logic and components.

## Build for production

```bash
npm run build      # emits static bundle to client/dist/
npm run preview    # serves the built bundle locally for smoke-testing
```

The `client/dist/` output is a plain static bundle — deploy it to any CDN or static
host (Netlify, Vercel, GitHub Pages, S3+CloudFront, etc.). No server runtime required.

## Troubleshooting

- **Port 3000 already in use** — stop the other process, or run `npm start -- --port 3001`.
- **Stale dependencies after a pull** — delete `client/node_modules` and re-run `npm install`.
- **Stale inputs in the UI** — clear `localStorage` for `http://localhost:3000` in
  DevTools → Application → Local Storage.
