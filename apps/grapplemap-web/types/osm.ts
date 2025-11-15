export type OsmElementType = 'node' | 'way' | 'relation';

export interface OsmTags {
  [key: string]: string;
}

export interface OsmCoordinate {
  lat: number;
  lon: number;
}

export interface OverpassElementBase {
  type: OsmElementType;
  id: number;
  tags?: OsmTags;
}

export interface OverpassNode extends OverpassElementBase {
  type: 'node';
  lat: number;
  lon: number;
}

export interface OverpassWay extends OverpassElementBase {
  type: 'way';
  nodes?: number[];
  center?: OsmCoordinate;
  geometry?: OsmCoordinate[];
}

export interface OverpassRelation extends OverpassElementBase {
  type: 'relation';
  center?: OsmCoordinate;
  geometry?: OsmCoordinate[];
}

export type OverpassElement = OverpassNode | OverpassWay | OverpassRelation;

export interface OverpassResponse {
  elements: OverpassElement[];
}

export interface Gym {
  id: string;
  name: string;
  lat: number;
  lon: number;
  tags: OsmTags;
  osmUrl: string;
  website?: string;
  extraWebsites?: string[];
  nearestTransport?: string;
  borough?: string;
}
