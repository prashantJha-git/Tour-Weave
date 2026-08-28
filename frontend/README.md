# Tour-Weave Frontend

React + Vite + TypeScript UI for Tour-Weave. Talks to the Tour-Weave
FastAPI backend (`../backend`) over `VITE_API_BASE_URL` — see
`src/api/client.ts` for every request the app makes, and the root
`README.md` for full setup and architecture.

## Run locally

```bash
npm install
npm run dev        # http://localhost:5173
```

Requires the backend running at `http://localhost:8000` (see
`../backend/README.md`), or set `VITE_API_BASE_URL` in `.env` to point
elsewhere.

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — type-check and build a production bundle to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — TypeScript type-check only

## Structure

```
src/
├── api/          client.ts (fetch wrapper) + adapters.ts (backend -> UI shapes)
├── hooks/        useBackendData.ts -- all live-data hooks used by components
├── components/   UI sections, modals, and drawers
├── data/         bundled fallback/sample content (used only if the backend is unreachable)
└── App.tsx       top-level composition and state
```
