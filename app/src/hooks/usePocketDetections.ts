import { useState, useCallback } from 'react';
import { GraphEdgeType, ModelEntity } from '../types/types';

export function usePocketDetections() {
  const [pocketClusters, setPocketClusters] = useState<Map<number, number> | null>(null);

  const detectPockets = useCallback((modelEntities: ModelEntity[]) => {
    let mostConnectedFaceId = 0;
    let maxNeighbors = 0;

    const concaveNeighbors: Record<number, number[]> = {};


    for (const entity of modelEntities) {
      const nCount = entity.neighbors.size;
      if (nCount > maxNeighbors) {
        maxNeighbors = nCount;
        mostConnectedFaceId = entity.id;
      }
    }

    modelEntities.forEach(entity => {
      concaveNeighbors[entity.id] = [];

      entity.neighbors.forEach((EdgeTypes, neighborId) => {
        if (EdgeTypes.includes(0) &&
          entity.id !== mostConnectedFaceId &&
          neighborId !== mostConnectedFaceId) {
          concaveNeighbors[entity.id].push(neighborId);
        }
      });
    });


    const visited = new Set<number>();
    let clusterId = 0;
    const clusterMap = new Map<number, number>();
    const clusterContents: Record<number, number[]> = {};

    function bfs(startId: number) {
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

    for (const entity of modelEntities) {
      if (entity.id === mostConnectedFaceId) continue;
      if (!visited.has(entity.id)) {
        bfs(entity.id);
        clusterId++;
      }
    }

    const finalClusterMap = new Map<number, number>();
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

    for (const entity of modelEntities) {
      entity.neighbors.forEach((EdgeTypes: GraphEdgeType[], neighborId: number) => {

        const clusterA = finalClusterMap.get(entity.id);
        const clusterB = finalClusterMap.get(neighborId);

        if (
          clusterA !== undefined &&
          clusterB !== undefined &&
          clusterA !== clusterB
        ) {
          union(clusterA, clusterB);
        }
      });
    }

    const rootToNewId = new Map<number, number>();
    let mergedClusterId = 0;
    const mergedClusterMap = new Map<number, number>();

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