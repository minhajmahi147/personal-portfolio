# Minhajur Rahman Mahi — Portfolio

A single-page portfolio built from the CV. React (Vite) for the site, FastAPI for the contact inbox.

## Run it

Terminal 1 — API:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

Terminal 2 — site:

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:5173. The footer badge turns green when the API is up. Messages are stored in `backend/data/messages.db` (not emailed). From this machine:

```bash
curl http://127.0.0.1:8000/api/messages
```

## One process

```bash
cd frontend && npm run build
cd ../backend && source .venv/bin/activate
uvicorn main:app --port 8000
```

Then open http://127.0.0.1:8000. FastAPI serves the built site and `/api`.
