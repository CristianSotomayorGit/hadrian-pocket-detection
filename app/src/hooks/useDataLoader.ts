import { useEffect, useState } from "react";
import { AdjacencyMap, ColorData, EdgeMetadataMap, ModelEntity, GraphEdgeType, GeometryInfo } from "../types/types";
import { GLTFLoader } from "three-stdlib";
import * as THREE from 'three';

const parseRGB = (rgbString: string): THREE.Color => {
    const [r, g, b] = rgbString.split('-').map(Number);
    return new THREE.Color(r / 255, g / 255, b / 255);
};

export function useDataLoader() {
    const [modelEntities, setModelEntities] = useState<ModelEntity[]>([]);

    useEffect(() => {
        const loadModel = (): Promise<THREE.Mesh[]> => {
            return new Promise((resolve, reject) => {
                const loader = new GLTFLoader();
                const meshes: THREE.Mesh[] = [];
                loader.load(
                    './colored_glb.glb',
                    (gltf) => {
                        gltf.scene.traverse((element) => {
                            if (element.type !== 'Mesh') return;
                            const meshElement = element as THREE.Mesh;
                            meshes.push(meshElement);
                        });
                        resolve(meshes);
                    },
                    undefined,
                    (error) => reject(error)
                );
            });
        };

        const loadAllData = async (): Promise<{
            adjacencyMap: AdjacencyMap;
            edgeMetadata: EdgeMetadataMap;
            colorData: ColorData;
            geometryInfos: GeometryInfo[];
        }> => {
            const [geometryInfoResponse, adjacencyResponse, edgeResponse, colorResponse] = await Promise.all([
                fetch('./entity_geometry_info.json'),
                fetch('./adjacency_graph.json'),
                fetch('./adjacency_graph_edge_metadata.json'),
                fetch('./rgb_id_to_entity_id_map.json'),
            ]);

            const geometryInfos: GeometryInfo[] = await geometryInfoResponse.json();
            const adjacencyMap: AdjacencyMap = await adjacencyResponse.json();
            const edgeMetadata: EdgeMetadataMap = await edgeResponse.json();
            const colorData: ColorData = await colorResponse.json();

            return { adjacencyMap, edgeMetadata, colorData, geometryInfos };
        };

        const invertColorData = (colorData: ColorData): Record<string, string> => {
            const inverted: Record<string, string> = {};
            Object.entries(colorData).forEach(([rgb, entityId]) => {
                inverted[entityId] = rgb;
            });
            return inverted;
        };

        const initializeData = async () => {
            try {
                const { adjacencyMap, edgeMetadata, colorData, geometryInfos } = await loadAllData();

                const meshes = await loadModel();

                const invertedColorData = invertColorData(colorData);

                const geometryInfoMap: Record<string, GeometryInfo> = {};
                geometryInfos.forEach(info => {
                    geometryInfoMap[info.entityId] = info;
                });

                const entities: ModelEntity[] = meshes.map(mesh => {
                    const id = Number(mesh.name.split('_')[2]);

                    const geometryInfo = geometryInfoMap[id] || {
                        entityType: 0,
                        entityId: id,
                        centerUv: [0, 0],
                        centerPoint: [0, 0, 0],
                        centerNormal: [0, 0, 0],
                        area: 0,
                        minRadius: 0,
                        minPosRadius: 0,
                        minNegRadius: 0,
                        edgeCurveChains: [],
                    };

                    const color: THREE.Color = invertedColorData[id] ?
                        parseRGB(invertedColorData[id]) :
                        new THREE.Color('gray');

                    const entityNeighbors = adjacencyMap[id] || [];
                    const neighbors = new Map<number, GraphEdgeType[]>();

                    entityNeighbors.forEach(neighborId => {
                        const edgeKey = `${id}-${neighborId}`;
                        neighbors.set(Number(neighborId), edgeMetadata[edgeKey] || []);
                    });

                    return {
                        id,
                        belongsToPocket: false,
                        mesh,
                        geometryInfo,
                        color,
                        neighbors: neighbors,
                    };
                });

                setModelEntities(entities);
            } catch (error) {
                console.error('Error initializing data:', error);
            }
        };

        initializeData();
    }, []);

    return { modelEntities };
}
