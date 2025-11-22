# Analytics Pipelines

ETL pipelines for ingesting BJJ tournament data into the GrappleMap Insights platform.

## Features

- **CSV Ingestion**: Import tournament data from CSV files
- **Data Normalization**: Automatic name deduplication and standardization
- **Technique Classification**: Automatic categorization of submissions
- **Sample Data**: Seed database with sample tournament data

## CLI Commands

### Ingest CSV Data

```bash
pnpm ingest:csv <path-to-csv-file>
```

Example:
```bash
pnpm ingest:csv ./data/sample_adcc_data.csv
```

### Seed Sample Data

```bash
pnpm seed:sample
```

This creates:
- 2 rulesets (ADCC, IBJJF)
- 5 teams
- 5 athletes
- 2 tournaments
- 2 weight classes
- 3 techniques
- 2 sample matches

## Data Format

### ADCC CSV Format

Expected format from BJJ Heroes scraper:

```csv
match_id;winner_id;winner_name;loser_id;loser_name;win_type;submission;winner_points;loser_points;adv_pen;weight_class;sex;stage;year
```

Fields:
- `match_id`: Unique match identifier
- `winner_id`, `loser_id`: Athlete IDs
- `winner_name`, `loser_name`: Athlete names
- `win_type`: SUBMISSION, POINTS, DECISION, DESQUALIFICATION, INJURY
- `submission`: Specific submission technique (if applicable)
- `winner_points`, `loser_points`: Final scores
- `adv_pen`: ADV (advantage) or PEN (penalty) indicator
- `weight_class`: e.g., "-77KG", "+99KG", "60KG"
- `sex`: M or F
- `stage`: Round, Quarter-Final, Semi-Final, Final
- `year`: Tournament year

## Data Utilities

### Normalization

```typescript
import { normalizeName, getSubmissionCategory } from '@grapplemap/analytics-pipelines';

const normalized = normalizeName('Gordon Ryan'); // 'gordon ryan'
const category = getSubmissionCategory('Rear Naked Choke'); // 'choke'
```

### Validation

```typescript
import { matchSchema, athleteSchema } from '@grapplemap/analytics-pipelines';

const validatedMatch = matchSchema.parse(rawData);
```

## Development

### Adding New Data Sources

1. Create a new CLI script in `src/cli/`
2. Implement data transformation logic
3. Use existing normalization utilities
4. Add new script to `package.json`
5. Document the expected format

### Data Quality

The pipelines automatically:
- Normalize athlete and team names for deduplication
- Convert country names to ISO codes
- Classify submission techniques into categories
- Validate data against schemas
- Handle missing or malformed data

## Sample Data

Sample ADCC dataset included at `data/sample_adcc_data.csv` contains:
- 30 historical ADCC matches
- Data from 2015, 2017, 2019, 2022 tournaments
- Mix of submission and points victories
- Multiple weight classes
- Notable athletes (Gordon Ryan, Marcus Almeida, etc.)

