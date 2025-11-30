# OpenRebuildLK - Disaster Infrastructure Management Platform

A platform for tracking road and rail infrastructure damage in Sri Lanka, enabling citizens to report damage and authorities to coordinate rebuilding efforts.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for media files
- **Auth**: JWT-based authentication

## Getting Started

### Prerequisites

- [Bun](https://bun.sh/) (package manager and runtime)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)

### Installation

```bash
# Install dependencies
bun install
```

### Development

Start the development server:

```bash
bun dev
```

Your application will be available at [http://localhost:5173](http://localhost:5173).

### Database

Generate migrations:

```bash
bun run db:generate
```

Apply migrations locally:

```bash
bun run db:migrate
```

Open Drizzle Studio:

```bash
bun run db:studio
```

## Production

Build for production:

```bash
bun run build
```

Preview build locally:

```bash
bun run preview
```

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

## Project Structure

```
src/
├── react-app/          # Frontend React application
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   └── stores/         # Zustand state stores
├── worker/             # Backend Hono API
│   ├── db/             # Database schema and config
│   ├── middleware/     # Auth and other middleware
│   └── routes/         # API route handlers
└── shared/             # Shared types and constants
```

## Features

### Public (No Login Required)
- View damage reports on interactive map
- Submit new damage reports
- Browse existing reports

### Authenticated Users
- **Citizens**: Submit reports, track submissions
- **Field Officers**: Verify reports, access dashboard
- **Planners**: Manage projects, link reports
- **Administrators**: Full system access

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Vite Documentation](https://vitejs.dev/guide/)
- [React Documentation](https://react.dev/)
- [Hono Documentation](https://hono.dev/)
- [Drizzle ORM Documentation](https://orm.drizzle.team/)
