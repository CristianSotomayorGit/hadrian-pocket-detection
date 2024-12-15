import { useEffect, useState } from 'react';

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
  loading: boolean
) {
  const [pocketClusters, setPocketClusters] = useState<Map<string, number> | null>(null);

  useEffect(() => {
    if (loading) return; 

    const concaveNeighbors: Record<string, string[]> = {};

    for (const entityId in adjacencyMap) {
      concaveNeighbors[entityId] = [];
    }

    for (const edgeId in edgeMetadata) {
      const types = edgeMetadata[edgeId];  
      if (types.includes(0)) {
        const [entA, entB] = edgeId.split('-');
        concaveNeighbors[entA].push(entB);
      }
    }

    const visited = new Set<string>();
    let clusterId = 0;
    const clusterMap = new Map<string, number>();
    function bfs(startId: string) {
      const queue = [startId];
      visited.add(startId);
      clusterMap.set(startId, clusterId);

      while (queue.length) {
        const current = queue.shift()!;
        for (const neighbor of concaveNeighbors[current]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            clusterMap.set(neighbor, clusterId);
            queue.push(neighbor);
          }
        }
      }
    }

    for (const entityId in adjacencyMap) {
      if (!visited.has(entityId)) {
        bfs(entityId);
        clusterId++;
      }
    }

    setPocketClusters(clusterMap);

  }, [adjacencyMap, edgeMetadata, loading]);

  return pocketClusters;
}
