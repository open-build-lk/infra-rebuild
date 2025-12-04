# Sri Lanka Infrastructure Recovery

A real-time platform for tracking infrastructure damage across Sri Lanka. This platform displays damage reports, recovery status, and coordinates repair efforts for roads, bridges, railways, and other critical infrastructure affected by natural disasters.

## Project Scope

This platform serves as a public information system for infrastructure recovery in Sri Lanka:

- **Real-time damage visualization** - Interactive map showing damaged and blocked infrastructure
- **Damage classification** - Categorization by type (flooding, landslides, washouts, collapses, blockages)
- **Severity levels** - Clear indication of damage severity from low to critical
- **Province-level coverage** - All 9 provinces with national infrastructure data
- **Recovery tracking** - Monitor reconstruction projects and progress

### Data Source

Infrastructure damage data is provided by government agencies and field officers through the platform.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4
- **Maps**: Leaflet with OpenStreetMap (free, unlimited usage)
- **Backend**: Hono on Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM
- **Storage**: Cloudflare R2 for media files
- **Hosting**: Cloudflare Workers (edge deployment)

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

Deploy to Cloudflare Workers:

```bash
bun run deploy
```

## Project Structure

```
src/
├── react-app/          # Frontend React application
│   ├── components/     # Reusable UI components
│   │   ├── layout/     # Header, Footer, Navigation
│   │   └── map/        # Map components (DisasterMap, MapLegend)
│   ├── data/           # Static data (infrastructure segments, paths)
│   ├── pages/          # Page components
│   └── stores/         # Zustand state stores
├── worker/             # Backend Hono API
│   ├── db/             # Database schema and migrations
│   ├── middleware/     # Auth and other middleware
│   └── routes/         # API route handlers
└── shared/             # Shared types and constants
```

## Features

- **Interactive Map** - Pan, zoom, and click on infrastructure to view damage details
- **Path Geometry** - Damage displayed along actual paths (not straight lines)
- **Damage Markers** - Visual indicators at damage locations with type-specific icons
- **Severity Coloring** - Color-coded segments (yellow/orange/red/dark red)
- **Mobile Responsive** - Works on desktop and mobile devices
- **Dark Mode** - Supports system dark mode preference

## Contributing

We welcome contributions! Please feel free to submit issues and pull requests.

## License

This project is open source and available under the MIT License.

---

**This platform is developed and maintained by volunteers** as part of the OpenRebuildLK initiative to support disaster recovery efforts in Sri Lanka.
