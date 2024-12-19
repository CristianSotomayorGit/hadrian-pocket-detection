export type ModelEntity = {
    id: number;
    belongsToPocket: boolean;
    mesh: THREE.Mesh;
    geometryInfo: GeometryInfo;
    color: THREE.Color;
    neighbors: Map<number, GraphEdgeType[]>;
}

export type GraphEdgeType = 0 | 1 | 2;

export interface AdjacencyMap {
    [entityId: string]: string[];
}

export interface EdgeMetadataMap {
    [edgeId: string]: GraphEdgeType[];
}

export interface ColorData {
    [rgbId: string]: string;
}

export type GeometryInfo = {
    entityId: string;
    entityType: number;
    centerUv: [number, number];
    centerPoint: [number, number, number];
    centerNormal: [number, number, number];
    area: number;
    minRadius: number;
    minPosRadius: number;
    minNegRadius: number;
    edgeCurveChains: any[];
}