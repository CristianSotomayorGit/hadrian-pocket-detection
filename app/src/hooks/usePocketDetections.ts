import { useState, useCallback } from 'react';

type GraphEdgeType = 0 | 1 | 2;

interface AdjacencyMap {
  [entityId: string]: string[];
}

interface EdgeMetadataMap {
  [edgeId: string]: GraphEdgeType[];
}

export function usePocketDetections() {
  const [pocketClusters, setPocketClusters] = useState<Map<string, number> | null>(null);

  const detectPockets = useCallback((adjacencyMap: AdjacencyMap, edgeMetadata: EdgeMetadataMap) => {
    let mostConnectedFaceId = '';
    let maxNeighbors = 0;
    for (const faceId in adjacencyMap) {
      const nCount = adjacencyMap[faceId].length;
      if (nCount > maxNeighbors) {
        maxNeighbors = nCount;
        mostConnectedFaceId = faceId;
      }
    }

    const concaveNeighbors: Record<string, string[]> = {};
    for (const entityId in adjacencyMap) {
      concaveNeighbors[entityId] = [];
    }

    for (const edgeId in edgeMetadata) {
      const edgeTypes = edgeMetadata[edgeId];
      if (edgeTypes.includes(0)) {
        const [entA, entB] = edgeId.split('-');
        if (entA === mostConnectedFaceId || entB === mostConnectedFaceId) {
          continue;
        }
        concaveNeighbors[entA].push(entB);
      }
    }

    const visited = new Set<string>();
    let clusterId = 0;
    const clusterMap = new Map<string, number>();
    const clusterContents: Record<number, string[]> = {};

    function bfs(startId: string) {
      const queue = [startId];
      visited.add(startId);
      clusterMap.set(startId, clusterId);
      clusterContents[clusterId] = [startId];

      while (queue.length) {
        const current = queue.shift()!;
        for (const neighbor of concaveNeighbors[current]) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor);
            queue.push(neighbor);
            clusterMap.set(neighbor, clusterId);
            clusterContents[clusterId].push(neighbor);
          }
        }
      }
    }

    for (const entityId in adjacencyMap) {
      if (entityId === mostConnectedFaceId) continue;
      if (!visited.has(entityId)) {
        bfs(entityId);
        clusterId++;
      }
    }

    const finalClusterMap = new Map<string, number>();
    let newClusterId = 0;

    for (let cid = 0; cid < clusterId; cid++) {
      const faces = clusterContents[cid];
      if (faces && faces.length > 2) {
        for (const entId of faces) {
          finalClusterMap.set(entId, newClusterId);
        }
        newClusterId++;
      }
    }


    const parent = new Map<number, number>();
    for (let cid = 0; cid < newClusterId; cid++) {
      parent.set(cid, cid);
    }

    const find = (cid: number): number => {
      if (parent.get(cid) !== cid) {
        parent.set(cid, find(parent.get(cid)!));
      }
      return parent.get(cid)!;
    };

    const union = (cid1: number, cid2: number): void => {
      const root1 = find(cid1);
      const root2 = find(cid2);
      if (root1 !== root2) {
        parent.set(root2, root1);
      }
    };

    for (const edgeId in edgeMetadata) {
      const [entA, entB] = edgeId.split('-');
      const clusterA = finalClusterMap.get(entA);
      const clusterB = finalClusterMap.get(entB);

      if (
        clusterA !== undefined &&
        clusterB !== undefined &&
        clusterA !== clusterB
      ) {
        union(clusterA, clusterB);
      }
    }

    const rootToNewId = new Map<number, number>();
    let mergedClusterId = 0;
    const mergedClusterMap = new Map<string, number>();

    finalClusterMap.forEach((cid, entId) => {
      const root = find(cid);
      if (!rootToNewId.has(root)) {
        rootToNewId.set(root, mergedClusterId);
        mergedClusterId++;
      }
      mergedClusterMap.set(entId, rootToNewId.get(root)!);
    });

    setPocketClusters(mergedClusterMap);
  }, []);

  return { pocketClusters, detectPockets };
}