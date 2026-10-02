# Portfolio builder

Multi-tenant portfolios: register → fill the dashboard → publish at `/u/your-slug`.

React (Vite) frontend, FastAPI + SQLite backend.

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

Open http://localhost:5173.

### Demo account

- Email: `mahi@demo.local`
- Password: `mahi1234`
- Public site: http://localhost:5173/u/mahi
- Admin panel: http://localhost:5173/admin (demo email is admin by default)

Set extra admins with env `ADMIN_EMAILS` (comma-separated), e.g. `ADMIN_EMAILS=mahi@demo.local,you@example.com`.

### Flow

1. `/register` — email, password, public slug  
2. `/dashboard` — profile, hero, work, path, stack, theme, publish  
3. `/u/:slug` — live portfolio (drafts visible only to the owner while signed in)
4. `/admin` — list all users and sites (admin emails only)

Data lives in `backend/data/portfolio.db`. Contact messages are stored per site.

## One process

```bash
cd frontend && npm run build
cd ../backend && source .venv/bin/activate
uvicorn main:app --port 8000
```

Then open http://127.0.0.1:8000.
