# AI Fashion Shop — Project Structure

## Directory Overview

```
ai-fashion-shop/
├── client/                  # Frontend (React + TypeScript + Vite)
│   ├── src/
│   │   ├── pages/           # Route pages (Home, Women, Men, AIStylist, Cart, Profile, AdminDashboard)
│   │   ├── components/      # Reusable UI components
│   │   ├── contexts/        # React contexts (ThemeContext)
│   │   └── hooks/           # Custom hooks
│   └── public/              # Static assets
│
├── server/                  # Backend (Node.js + Express + tRPC)
│   ├── _core/               # Core server infrastructure
│   ├── catalog.ts           # Product catalog (in-memory + DB)
│   ├── db.ts                # Database helpers (TiDB/MySQL)
│   ├── routers.ts           # tRPC API routers
│   └── storage.ts           # File storage helpers
│
├── drizzle/                 # Database schema & migrations
│   ├── schema.ts            # Table definitions
│   └── *.sql                # Migration files
│
├── django_admin/            # Django Admin Dashboard (port 8000)
│   ├── manage.py
│   ├── fashion_admin/       # Django app
│   └── requirements.txt
│
└── shared/                  # Shared types between frontend & backend
```

## Running the Project

### Option 1: Run everything together
```bash
pnpm install
pnpm run start:all
```

### Option 2: Run frontend and backend separately
```bash
# Terminal 1 — Backend (Node.js API on port 5000)
pnpm run backend:dev

# Terminal 2 — Frontend (React on port 3000)
pnpm run frontend:dev

# Terminal 3 — Django Admin Dashboard (port 8000)
cd django_admin
pip install -r requirements.txt
python manage.py runserver 8000
```

### Option 3: Run the original combined dev server
```bash
pnpm run dev
```

## Database Setup (MySQL / TiDB)

See `DATABASE_IMPORT_GUIDE.md` for step-by-step instructions on how to import the database locally.

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:
```
DATABASE_URL=mysql://user:password@host:port/dbname
OPENAI_API_KEY=your_openai_key
```
