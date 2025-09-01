# Frontend (Next.js) – Database Management Platform

Frontend service for the [Database Management System](https://github.com/ilias363/db-manager-app). Provides a modern RBAC-enabled database management UI built with Next.js 15, React 19, Tailwind CSS, Shadcn UI components, React Query & Recharts.

## Quick Run (Local)
```
npm install
cp .env.example .env  # adjust NEXT_PUBLIC_API_URL
npm run dev
```
Serves at http://localhost:3000 (or configured port).

## Build
```
npm run build
npm start
```

## Docker
Built as `frontend` inside root [`docker-compose.yml`](https://github.com/ilias363/db-manager-app/blob/master/docker-compose.yml) (internal port 3000, proxied by Nginx :80).
