# GrappleMap Insights - BJJ Tournament Analytics

A comprehensive analytics platform for Brazilian Jiu-Jitsu tournament data, featuring deep analysis of techniques, athletes, teams, and meta trends across major competitions including ADCC, IBJJF, AJP, Polaris, and EBI.

## Features

### 📊 Analytics Dashboards

1. **Technique Frequency Analysis**
   - Submission frequency by type and year
   - Technique distribution across tournaments
   - Historical trends for specific techniques

2. **Meta Trends Dashboard**
   - Submission vs decision rates over time
   - Rising and falling techniques
   - Evolution of the BJJ meta

3. **Athlete Performance**
   - Win rates and match statistics
   - Submission percentages
   - Performance metrics by athlete

4. **Team Analytics**
   - Team rankings and performance
   - Style profiles by affiliation
   - Geographic performance clusters

5. **Match Flow Visualizer** *(Coming Soon)*
   - Timeline of scoring sequences
   - Technique chain analysis
   - Sankey diagrams for common paths to victory

6. **Weight Class Analysis** *(Coming Soon)*
   - Submissions by weight class
   - Match duration distributions
   - Points vs submission frequency

7. **National Trends** *(Coming Soon)*
   - Country-level medal counts
   - Preferred techniques by nation
   - Regional meta differences

8. **Ruleset Impact Analysis** *(Coming Soon)*
   - ADCC vs IBJJF finishing rates
   - Effect of overtime rules
   - Point-scoring incentives

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Maps**: MapLibre GL *(planned)*
- **Database**: PostgreSQL with Drizzle ORM
- **API**: Next.js API Routes (REST)

## Getting Started

### Prerequisites

- Node.js 20.x
- PostgreSQL database (or Neon/Supabase)
- pnpm 10.x

### Installation

1. Install dependencies:
```bash
pnpm install
```

2. Set up environment variables:
```bash
# Create .env file in apps/analytics
DATABASE_URL=postgresql://user:password@host:port/database
```

3. Run database migrations:
```bash
cd packages/db
pnpm drizzle-kit push
```

4. Seed sample data (optional):
```bash
cd packages/analytics-pipelines
pnpm seed:sample
```

5. Start the development server:
```bash
cd apps/analytics
pnpm dev
```

The analytics platform will be available at `http://localhost:3001`.

## Data Ingestion

### Import ADCC Historical Data

The platform includes pipelines for ingesting BJJ tournament data from various sources.

#### From CSV (ADCC Format)

```bash
cd packages/analytics-pipelines
pnpm ingest:csv ./data/sample_adcc_data.csv
```

Expected CSV format:
```
match_id;winner_id;winner_name;loser_id;loser_name;win_type;submission;winner_points;loser_points;adv_pen;weight_class;sex;stage;year
```

#### Sample Data

A sample dataset with 30 ADCC matches is included at:
```
packages/analytics-pipelines/data/sample_adcc_data.csv
```

### Using the BJJ Heroes Scraper

To scrape live data from BJJ Heroes (requires Python):

```bash
cd /path/to/adcc_dataset_analytics
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py
```

This generates `adcc_historical_data.csv` which can be imported using the CSV ingestion pipeline.

## API Endpoints

### Stats Overview
```
GET /api/stats
```

Returns total counts for matches, athletes, tournaments, and techniques.

### Technique Frequency
```
GET /api/techniques/frequency
```

Returns submission frequency data by year and type.

### Athlete Performance
```
GET /api/athletes/performance?limit=50
```

Returns athlete statistics including win rates and submission percentages.

### Team Rankings
```
GET /api/teams/rankings
```

Returns team performance metrics and rankings.

### Meta Trends
```
GET /api/meta/trends
```

Returns finish rates over time and rising/falling techniques.

## Database Schema

### Core Tables

- **athletes**: Athlete profiles with nationality and team affiliation
- **teams**: BJJ teams and academies
- **tournaments**: Tournament information and metadata
- **rulesets**: Competition rule configurations
- **weight_classes**: Division and weight class information
- **matches**: Match results and outcomes
- **techniques**: Technique catalog
- **match_events**: Timeline of match actions *(for flow analysis)*

## Development

### Project Structure

```
apps/analytics/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── techniques/        # Technique dashboard
│   ├── meta/             # Meta trends dashboard
│   ├── athletes/         # Athlete performance dashboard
│   ├── teams/            # Team analytics dashboard
│   └── ...               # Other dashboard pages
├── components/           # Shared React components
└── lib/                  # Utilities and database client

packages/analytics-pipelines/
├── src/
│   ├── cli/             # CLI scripts for data ingestion
│   └── utils/           # Data transformation utilities
└── data/                # Sample datasets
```

### Adding New Dashboards

1. Create a new page in `apps/analytics/app/[dashboard-name]/page.tsx`
2. Add API route in `apps/analytics/app/api/[endpoint]/route.ts`
3. Update navigation in `components/Navigation.tsx`
4. Add dashboard card to homepage

## Contributing

When adding new features:

1. Follow the existing code patterns
2. Use TypeScript with strict typing
3. Add Zod validation for data inputs
4. Document API endpoints
5. Include sample data for testing

## License

MIT

## Acknowledgments

- Data sourced from BJJ Heroes
- ADCC dataset analytics inspired by the BJJ community
- Built with the GrappleMap Network ecosystem
