import './model.css';

import * as React from 'react';
import * as THREE from 'three';
import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { useDataLoader } from '../hooks/useDataLoader';
import { usePocketDetections } from '../hooks/usePocketDetections';
import DetectButton from '../components/DetectButton/DetectButton';

interface ModelEntity {
  bufferGeometry: THREE.BufferGeometry;
  entityId: string;
  color: string;
  opacity: number;
  belongsToPocket: boolean;
}

const Model: React.FC = () => {
  const [modelEnts, setModelEnts] = React.useState<ModelEntity[]>([]);
  const [highlightPockets, setHighlightPockets] = React.useState<boolean>(false);
  const { adjacencyMap, edgeMetadata } = useDataLoader();
  const { pocketClusters, detectPockets } = usePocketDetections();

  const handleDetectPockets = () => {
    if (!highlightPockets) {
      detectPockets(adjacencyMap, edgeMetadata);
      setHighlightPockets(true);
    } else {
      setHighlightPockets(false);
    }
  };

  React.useEffect(() => {
    new GLTFLoader().load('./colored_glb.glb', gltf => {
      const newModuleEntities: ModelEntity[] = [];
      gltf.scene.traverse(element => {
        if (element.type !== 'Mesh') return;
        const meshElement = element as THREE.Mesh;
        const entityId = meshElement.name.split('_')[2];
        let color = 'rgb(120, 120, 120)';
        let opacity = 1;
        let belongsToPocket = false;
        if (highlightPockets && pocketClusters) {
          if (pocketClusters.has(entityId)) {
            color = 'rgb(255, 0, 0)';
            opacity = 1;
            belongsToPocket = true;
          } else {
            opacity = 0.5;
          }
        }
        newModuleEntities.push({
          bufferGeometry: meshElement.geometry as THREE.BufferGeometry,
          entityId: entityId,
          color: color,
          opacity: opacity,
          belongsToPocket: belongsToPocket,
        });
      });
      setModelEnts(newModuleEntities);
    });
  }, [highlightPockets, pocketClusters]);

  return (
    <div className="canvas-container">
      <DetectButton isActive={highlightPockets} onClick={handleDetectPockets} />
      <Canvas
        shadows
        camera={{ position: [0, 0, 300] as [number, number, number] }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#000080']} />
        <ambientLight intensity={0.3} />
        <directionalLight
          castShadow
          position={[100, 200, 300]}
          intensity={1}
        />
        <OrbitControls makeDefault />

        <group>
          {modelEnts.map((ent, index) => (
            <mesh
              key={index}
              geometry={ent.bufferGeometry}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={ent.color}
                transparent={!ent.belongsToPocket}
                opacity={ent.opacity}
              />
            </mesh>
          ))}
        </group>
      </Canvas>
    </div>
  );
};

export default Model;
