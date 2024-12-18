import './model.css';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Edges, OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { GLTFLoader } from 'three-stdlib';
import { useDataLoader } from '../hooks/useDataLoader';
import { usePocketDetections } from '../hooks/usePocketDetections';
import DetectButton from '../components/DetectButton/DetectButton';
import PocketInfo from '../components/PocketInfo/PocketInfo';
import CrossSection from '../components/CrossSectionCanvas/CrossSectionCanvas';
import { ModelEntity } from '../types/types';
import CrossSectionIndicator from '../components/CrossSectionIndicator/CrossSectionIndicator';


const Model: React.FC = () => {
  const [modelEntities, setmodelEntities] = useState<ModelEntity[]>([]);
  const [selectedPocketId, setSelectedPocketId] = useState<number | null>(null);
  const [highlightPockets, setHighlightPockets] = useState<boolean>(false);

  const { adjacencyMap, edgeMetadata } = useDataLoader();
  const { pocketClusters, detectPockets } = usePocketDetections();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<boolean>(false);

  useEffect(() => {
    if (!adjacencyMap || !edgeMetadata) return;

    new GLTFLoader().load(
      './colored_glb.glb',
      (gltf) => {
        const newModuleEntities: ModelEntity[] = [];
        gltf.scene.traverse((element) => {
          if (element.type !== 'Mesh') return;
          const meshElement = element as THREE.Mesh;
          const nameParts = meshElement.name.split('_');
          const entityId = nameParts.length > 2 ? nameParts[2] : 'UNKNOWN';

          let color = 'gray';
          let opacity = 1;
          let belongsToPocket = false;

          if (highlightPockets && pocketClusters) {
            if (pocketClusters.has(entityId)) {
              color = 'yellow';
              opacity = 1;
              belongsToPocket = true;
            } else {
              opacity = 0.5;
            }
          }

          const geometry = meshElement.geometry as THREE.BufferGeometry;
          geometry.computeBoundingBox();
          const boundingBox = geometry.boundingBox;
          let position = new THREE.Vector3(0, 0, 0);
          if (boundingBox) {
            boundingBox.getCenter(position);
            meshElement.localToWorld(position);
          }

          newModuleEntities.push({
            bufferGeometry: geometry,
            entityId,
            color,
            opacity,
            belongsToPocket,
            position,
          });
        });
        setmodelEntities(newModuleEntities);
      },
      undefined,
      (error) => console.error('Error loading GLTF model:', error)
    );
  }, [highlightPockets, pocketClusters, adjacencyMap, edgeMetadata]);

  const calculateAveragePosition = (): THREE.Vector3 | null => {
    if (selectedPocketId === null) return null;
    const pocketEntities = modelEntities.filter(
      (ent) => pocketClusters?.get(ent.entityId) === selectedPocketId
    );
    if (pocketEntities.length === 0) return null;

    const sum = pocketEntities.reduce(
      (acc, ent) => acc.add(ent.position),
      new THREE.Vector3(0, 0, 0)
    );
    return sum.divideScalar(pocketEntities.length);
  };

  const averagePosition = calculateAveragePosition();

  const clippingPlaneX = useMemo(() => {
    return averagePosition ? new THREE.Plane(new THREE.Vector3(0, 0, 1), -averagePosition.z) : null;
  }, [averagePosition]);

  const clippingPlaneZ = useMemo(() => {
    return averagePosition ? new THREE.Plane(new THREE.Vector3(1, 0, 0), -averagePosition.x) : null;
  }, [averagePosition]);

  const handleDetectPockets = () => {
    if (!highlightPockets) {
      detectPockets(adjacencyMap, edgeMetadata);
      setHighlightPockets(true);
    } else {
      setHighlightPockets(false);
      setSelectedPocketId(null);
    }
  };

  const handlePocketClick = (event: ThreeEvent<MouseEvent>, entityId: string) => {
    const clusterId = pocketClusters?.get(entityId);
    setSelectedPocketId(clusterId ?? null);
    event.stopPropagation();
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing.current || !sidebarRef.current) return;
    const newWidth = window.innerWidth - e.clientX;
    const minWidth = 200;
    const maxWidth = 500;
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      sidebarRef.current.style.width = `${newWidth}px`;
    }
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="canvas-container">
      <DetectButton isActive={highlightPockets} onClick={handleDetectPockets} />
      <Canvas
        shadows
        camera={{ position: [300, 300, 300] as [number, number, number] }}
        style={{ width: '100%', height: '100%' }}
      >
        <color attach="background" args={['#ececec']} />
        <ambientLight intensity={0.3} />
        <directionalLight
          castShadow
          position={[100, 200, 300]}
          intensity={1}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={500}
          shadow-camera-left={-500}
          shadow-camera-right={500}
          shadow-camera-top={500}
          shadow-camera-bottom={-500}
        />
        <OrbitControls makeDefault />
        <group>
          {modelEntities.map((ent, index) => {
            const isSelectedPocket =
              selectedPocketId !== null &&
              pocketClusters?.get(ent.entityId) === selectedPocketId;

            const displayColor = isSelectedPocket ? 'magenta' : ent.color;

            return (
              <mesh
                key={index}
                geometry={ent.bufferGeometry}
                castShadow
                receiveShadow
                onClick={(event) => handlePocketClick(event, ent.entityId)}
              >
                <meshStandardMaterial
                  color={displayColor}
                  transparent={!ent.belongsToPocket}
                  opacity={ent.opacity}
                />
              </mesh>
            );
          })}

          {averagePosition && (
            <>
              <CrossSectionIndicator location={averagePosition} axis='x' />
              <CrossSectionIndicator location={averagePosition} axis='z' />
            </>
          )}
        </group>

        <GizmoHelper
          alignment="bottom-left"
          margin={[80, 80]}
        >
          <GizmoViewport
            axisColors={['red', 'green', 'blue']}
            labelColor="white"
          />
        </GizmoHelper>
      </Canvas>

      {selectedPocketId && (
        <div className="sidebar" ref={sidebarRef}>
          <div className="resizer" onMouseDown={handleMouseDown}></div>
          <PocketInfo selectedPocket={selectedPocketId} />
          <div className="cross-section-header">
            <h4>X Axis Cross Section</h4>
          </div>
          <CrossSection
            clippingPlane={clippingPlaneX}
            modelEntities={modelEntities}
            targetPosition={averagePosition}
            selectedPocketId={selectedPocketId}
            pocketClusters={pocketClusters}
            clippingAxis="x"
          />
          <div className="cross-section-header">
            <h4>Z Axis Cross Section</h4>
          </div>
          <CrossSection
            clippingPlane={clippingPlaneZ}
            modelEntities={modelEntities}
            targetPosition={averagePosition}
            selectedPocketId={selectedPocketId}
            pocketClusters={pocketClusters}
            clippingAxis='z'
          />
        </div>
      )}
    </div>
  );
};

export default Model;
