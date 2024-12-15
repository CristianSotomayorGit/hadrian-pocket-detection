import { useEffect, useState } from "react";

type GraphEdgeType = 0 | 1 | 2; 

interface AdjacencyMap {
    [entityId: string]: string[];
}

interface EdgeMetadataMap {
    [edgeId: string]: GraphEdgeType[];
}

export function usePocketDetections(
    adjacencyMap: AdjacencyMap,
    edgeMetadata: EdgeMetadataMap,
    loading: Boolean
) {
    // const [pocketClusters, setPocketCluster] = useState<Map<string, number> | null>(null);

    useEffect(() => {
        if (loading) return;

        const concaveNeighbors: Record<string, string[]> = {};

        for (const endtityId in adjacencyMap) {
            console.log(endtityId, adjacencyMap[endtityId]);
            concaveNeighbors[endtityId] = [];
        }

        for (const edgeId in edgeMetadata) {
            console.log('edgeId: ', edgeId)
        }


    })

}
