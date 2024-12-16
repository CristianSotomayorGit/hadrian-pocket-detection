import { useEffect, useState } from "react";

type GraphEdgeType = 0 | 1 | 2;

interface AdjacencyMap {
    [entityId: string]: string[];
}

interface EdgeMetadataMap {
    [edgeId: string]: GraphEdgeType[];
}

export function useDataLoader() {

    const [adjacencyMap, setAdjacencyMap] = useState<AdjacencyMap>({});
    const [edgeMetadata, setEdgeMetadate] = useState<EdgeMetadataMap>({});

    useEffect(() => {
        async function loadAllData() {
            try {
                const [adjResponse, edgeResponse] = await Promise.all([
                    fetch('./adjacency_graph.json'),
                    fetch('./adjacency_graph_edge_metadata.json'),
                ]);

                const adjacencyGraph = await adjResponse.json();
                const adjacencyGraphMetadata = await edgeResponse.json();

                setAdjacencyMap(adjacencyGraph);
                setEdgeMetadate(adjacencyGraphMetadata);
            }

            catch (err) {
                console.error('Error loading data:', err);
            }
        }

        loadAllData();
    }, []);

    return { adjacencyMap, edgeMetadata };
}