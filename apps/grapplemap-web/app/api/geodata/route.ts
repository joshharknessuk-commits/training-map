import { NextResponse } from 'next/server';
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';
import { poolDb as db } from '@db/pool';

type FeatureRow = {
  feature: Feature<Geometry, GeoJsonProperties> | { type: string };
};

type BoroughRow = FeatureRow & {
  id: string;
  name: string;
};

function rowFeature(row: FeatureRow): Feature<Geometry, GeoJsonProperties> | null {
  if (!row.feature || typeof row.feature !== 'object') {
    return null;
  }

  const candidate = row.feature as Feature<Geometry, GeoJsonProperties>;
  if (candidate.type === 'Feature' && candidate.geometry) {
    return candidate;
  }

  return null;
}

function rowsToFeatureCollection(rows: FeatureRow[]): FeatureCollection<Geometry> | null {
  const features = rows
    .map((row) => rowFeature(row))
    .filter((value): value is Feature<Geometry, GeoJsonProperties> => Boolean(value));

  if (features.length === 0) {
    return null;
  }

  return {
    type: 'FeatureCollection',
    features,
  };
}

async function fetchBoroughs(): Promise<FeatureCollection<Geometry>> {
  try {
    const result = await db.query<BoroughRow>(
      `select id, name, feature from local_authority_districts order by name asc`,
    );

    const collection = rowsToFeatureCollection(result.rows);
    if (collection) {
      return collection;
    }
  } catch (error) {
    console.warn('[api/geodata] Failed to load boroughs from database.', error);
  }

  return { type: 'FeatureCollection', features: [] };
}

export async function GET() {
  try {
    const boroughs = await fetchBoroughs();

    return NextResponse.json({ boroughs });
  } catch (error) {
    console.error('[api/geodata] Unexpected failure', error);
    return NextResponse.json({ error: 'Failed to load geospatial datasets.' }, { status: 500 });
  }
}
