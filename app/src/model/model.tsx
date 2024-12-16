import './model.css';

import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { useDataLoader } from '../hooks/useDataLoader';
import { usePocketDetections } from '../hooks/usePocketDetections';

interface ModelEntity {
    bufferGeometry: THREE.BufferGeometry;
    color: string;
}

export const Model = (): JSX.Element => {
    const [modelEnts, setModelEnts] = React.useState<ModelEntity[]>([]);

    const { adjacencyMap, edgeMetadata, loading } = useDataLoader();
    const pocketClusters = usePocketDetections(adjacencyMap, edgeMetadata, loading);

    React.useEffect(() => {
        if (!pocketClusters) return;

        new GLTFLoader().load('./colored_glb.glb', gltf => {
            const newModuleEntities: ModelEntity[] = [];
            gltf.scene.traverse(element => {
                if (element.type !== 'Mesh') return;

                const meshElement = element as THREE.Mesh;
                const entityId = meshElement.name.split('_')[2]; 

                if ((pocketClusters.has(entityId))) {
                    newModuleEntities.push({
                        bufferGeometry: meshElement.geometry as THREE.BufferGeometry,
                        color: 'rgb(255, 0, 0)',
                    });
                }

                else {
                    newModuleEntities.push({
                        bufferGeometry: meshElement.geometry as THREE.BufferGeometry,
                        color: 'rgb(120, 120, 120)',

                    });
                }
            });
            setModelEnts(newModuleEntities);
        });

    }, [pocketClusters])

    return (
        <div className="canvas-container">
          <Canvas
            shadows
            camera={{ position: [0, 0, 300] as [number, number, number] }}
          >
            {/* LIGHTS */}
            <ambientLight intensity={0.3} />
            <directionalLight
              castShadow
              position={[100, 200, 300]}
              intensity={1}
            />
            <OrbitControls makeDefault />
      
            <group>
              {modelEnts.map((ent, index) => {
                const isPocketFace = ent.color === 'rgb(255, 0, 0)';
      
                return (
                  <mesh
                    key={index}
                    geometry={ent.bufferGeometry}
                    castShadow
                    receiveShadow
                  >
                    <meshStandardMaterial
                      color={ent.color}
                      transparent={!isPocketFace} 
                      opacity={isPocketFace ? 1 : 0.3} 
                    />
                  </mesh>
                );
              })}
            </group>
          </Canvas>
        </div>
      );
      
      
};