import fs from 'fs/promises';
import path from 'path';
import { parse as parseCsv } from 'csv-parse/sync';
import wellknown from 'wellknown';
import type { Feature, FeatureCollection, Geometry, GeoJsonProperties } from 'geojson';

export interface ParsedFeature {
  id: string;
  name: string;
  feature: Feature<Geometry, GeoJsonProperties>;
  centroid: { lat: number; lon: number } | null;
  dataset?: string | null;
}

const DATA_DIR = path.join(process.cwd(), 'data');

type CsvRow = Record<string, string>;

function parsePointWkt(value?: string | null): { lat: number; lon: number } | null {
  if (!value) {
    return null;
  }

  const match = value.match(/POINT\s*\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)/i);
  if (!match) {
    return null;
  }

  const lon = Number.parseFloat(match[1]);
  const lat = Number.parseFloat(match[2]);

  if (Number.isNaN(lat) || Number.isNaN(lon)) {
    return null;
  }

  return { lat, lon };
}

function convertGeometry(row: CsvRow): Geometry | null {
  if (row.geojson) {
    try {
      const geojson = JSON.parse(row.geojson) as Geometry;
      if (geojson && typeof geojson === 'object') {
        return geojson;
      }
    } catch (error) {
      console.warn('Failed to parse embedded GeoJSON, falling back to WKT.', error);
    }
  }

  if (row.geometry) {
    const parsed = wellknown.parse(row.geometry) as Geometry | null;
    if (parsed) {
      return parsed;
    }
  }

  return null;
}

function buildFeature(
  geometry: Geometry,
  properties: GeoJsonProperties,
): Feature<Geometry, GeoJsonProperties> {
  return {
    type: 'Feature',
    geometry,
    properties,
  };
}

async function readCsv(fileName: string): Promise<CsvRow[]> {
  const filePath = path.join(DATA_DIR, fileName);
  const content = await fs.readFile(filePath, 'utf8');
  return parseCsv(content, { columns: true, skip_empty_lines: true }) as CsvRow[];
}

export async function loadLocalAuthorityDistricts(): Promise<ParsedFeature[]> {
  const rows = await readCsv('local-authority-district (3).csv');

  return rows.flatMap((row) => {
    const geometry = convertGeometry(row);
    if (!geometry) {
      return [];
    }

    const centroid = parsePointWkt(row.point);
    const reference = row.reference ?? row.entity ?? row.name ?? `district-${Math.random()}`;

    const properties: GeoJsonProperties = {
      id: reference,
      name: row.name,
      prefix: row.prefix ?? null,
      dataset: row.dataset ?? null,
      entryDate: row['entry-date'] ?? null,
      categories: row.categories ? row.categories.split(';').map((value) => value.trim()) : [],
      documentationUrl: row['documentation-url'] ?? null,
    };

    return [
      {
        id: reference,
        name: row.name,
        feature: buildFeature(geometry, properties),
        centroid,
        dataset: row.dataset ?? null,
      } satisfies ParsedFeature,
    ];
  });
}

export async function loadAncientWoodlands(): Promise<ParsedFeature[]> {
  const rows = await readCsv('ancient-woodland.csv');

  return rows.flatMap((row) => {
    const geometry = convertGeometry(row);
    if (!geometry) {
      return [];
    }

    const centroid = parsePointWkt(row.point);
    const reference = row.reference || row.entity || `woodland-${row.name}`;

    const properties: GeoJsonProperties = {
      id: reference,
      name: row.name,
      status: row['ancient-woodland-status'] ?? null,
      dataset: row.dataset ?? null,
      documentationUrl: row['documentation-url'] ?? null,
      notes: row.notes ?? null,
    };

    return [
      {
        id: reference,
        name: row.name,
        feature: buildFeature(geometry, properties),
        centroid,
        dataset: row.dataset ?? null,
      } satisfies ParsedFeature,
    ];
  });
}

export async function loadBattlefields(): Promise<ParsedFeature[]> {
  const rows = await readCsv('battlefield.csv');

  return rows.flatMap((row) => {
    const geometry = convertGeometry(row);
    if (!geometry) {
      return [];
    }

    const centroid = parsePointWkt(row.point);
    const reference = row.reference || row.entity || `battlefield-${row.name}`;

    const properties: GeoJsonProperties = {
      id: reference,
      name: row.name,
      dataset: row.dataset ?? null,
      documentationUrl: row['documentation-url'] ?? null,
      documentUrl: row['document-url'] ?? null,
      startDate: row['start-date'] ?? null,
      wikidata: row.wikidata ?? null,
      wikipedia: row.wikipedia ?? null,
      notes: row.notes ?? null,
    };

    return [
      {
        id: reference,
        name: row.name,
        feature: buildFeature(geometry, properties),
        centroid,
        dataset: row.dataset ?? null,
      } satisfies ParsedFeature,
    ];
  });
}

export function toFeatureCollection(features: ParsedFeature[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: features.map((entry) => entry.feature),
  };
}
