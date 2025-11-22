# GrappleMap Analytics Platform - Quick Start

## 🚀 Accessing the Analytics Dashboard

The analytics platform is a **separate Next.js application** that runs alongside the main GrappleMap app.

### Running Locally

1. **Start the Analytics App:**
```bash
cd apps/analytics
pnpm dev
```

The dashboard will be available at: **http://localhost:3001**

2. **Start the Main App** (in a separate terminal):
```bash
cd apps/grapplemap-web
pnpm dev
```

The main app will be available at: **http://localhost:3000**

### Quick Access

- **Main App**: http://localhost:3000
- **Analytics Dashboard**: http://localhost:3001

A navigation link has been added to the main app's navigation bar (labeled "Analytics 📊") that links to the analytics dashboard.

### First Time Setup

Before accessing the analytics dashboard for the first time:

1. **Run Database Migrations:**
```bash
cd packages/db
pnpm drizzle-kit push
```

2. **Seed Sample Data** (optional but recommended):
```bash
cd packages/analytics-pipelines
pnpm seed:sample
```

This will populate the database with sample tournament data so you can see the dashboards in action!

### Available Dashboards

Once running, you can access:

- **Home**: http://localhost:3001/
- **Technique Frequency**: http://localhost:3001/techniques
- **Meta Trends**: http://localhost:3001/meta
- **Athlete Performance**: http://localhost:3001/athletes
- **Team Analytics**: http://localhost:3001/teams
- **Match Flow**: http://localhost:3001/flow
- **Weight Classes**: http://localhost:3001/weight-classes
- **Countries**: http://localhost:3001/countries
- **Rulesets**: http://localhost:3001/rulesets

### Production Deployment

For production, you can deploy both apps separately:
- Main app on your primary domain (e.g., `grapplemapnetwork.com`)
- Analytics on a subdomain (e.g., `analytics.grapplemapnetwork.com`)

Or configure the analytics app to run under a path like `/analytics` using Next.js basePath.
