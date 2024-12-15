import { useEffect, useState } from "react";
interface AdjacencyMap {
    [entityId: string]: string[];
}

export function usePocketDetections(
    adjacencyMap: AdjacencyMap,
    // edgeMetadate: EdgeMetaData,
    loading: Boolean
) {
    // const [pocketClusters, setPocketCluster] = useState<Map<string, number> | null>(null);

    useEffect(() => {
        if (loading) return;

        const convaceNeighbors: Record<string, string[]> = {};

        for (const endtityId in adjacencyMap) {
            console.log(endtityId, adjacencyMap[endtityId]);
        }
    })

}
