import './model.css';
import React, { useState, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls, GizmoHelper, GizmoViewport } from '@react-three/drei';
import { Canvas, ThreeEvent } from '@react-three/fiber';
import { useDataLoader } from '../hooks/useDataLoader';
import { usePocketDetections } from '../hooks/usePocketDetections';
import DetectButton from '../components/DetectButton/DetectButton';
import PocketInfo from '../components/PocketInfo/PocketInfo';
import CrossSectionIndicator from '../components/CrossSectionIndicator/CrossSectionIndicator';
import CrossSectionCanvas from '../components/CrossSectionCanvas/CrossSectionCanvas';

const Model: React.FC = () => {
  const [selectedPocketId, setSelectedPocketId] = useState<number | null>(null);
  const [highlightPockets, setHighlightPockets] = useState<boolean>(false);

  const { modelEntities } = useDataLoader();
  const { pocketClusters, detectPockets } = usePocketDetections();

  const sidebarRef = useRef<HTMLDivElement>(null);
  const isResizing = useRef<boolean>(false);

  const calculateAveragePosition = (): THREE.Vector3 | null => {
    if (selectedPocketId === null) return null;

    const pocketEntities = modelEntities.filter(
      (ent) => pocketClusters?.get(ent.id) === selectedPocketId
    );

    if (pocketEntities.length === 0) return null;

    const sum = pocketEntities.reduce((acc, ent) => {
      const geometry = ent.mesh.geometry as THREE.BufferGeometry;
      geometry.computeBoundingBox();
      const boundingBox = geometry.boundingBox;
      const position = new THREE.Vector3();
      if (boundingBox) {
        boundingBox.getCenter(position);
        ent.mesh.localToWorld(position);
        acc.add(position);
      }
      return acc;
    }, new THREE.Vector3(0, 0, 0));

    return sum.divideScalar(pocketEntities.length);
  };

  const averagePosition = calculateAveragePosition();

  const handleDetectPockets = () => {
    if (!highlightPockets) {
      detectPockets(modelEntities);
      setHighlightPockets(true);
    } else {
      setHighlightPockets(false);
      setSelectedPocketId(null);
    }
  };

  const handlePocketClick = (event: ThreeEvent<MouseEvent>, entityId: number) => {
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
          {modelEntities.map((ent) => {
            const isSelectedPocket =
              selectedPocketId !== null &&
              pocketClusters?.get(ent.id) === selectedPocketId;



            let displayColor = !highlightPockets ? ent.color : "gray";
            displayColor = highlightPockets && pocketClusters?.has(ent.id) ? "yellow" : displayColor;
            displayColor = isSelectedPocket ? "magenta" : displayColor;
            let opacity = !highlightPockets ? 1 : 0.7;

            return (
              <mesh
                key={ent.id}
                geometry={ent.mesh.geometry}
                castShadow
                receiveShadow
                onClick={(event) => handlePocketClick(event, ent.id)}
                renderOrder={pocketClusters?.has(ent.id) ? 10 : 1}

              >
                <meshStandardMaterial
                  color={displayColor}
                  transparent={pocketClusters?.has(ent.id) ? false : true}
                  opacity={opacity}

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

      {selectedPocketId !== null && selectedPocketId !== undefined && (
        <div className="sidebar" ref={sidebarRef}>

          <div className="resizer" onMouseDown={handleMouseDown}></div>
          <PocketInfo selectedPocket={selectedPocketId} />
          <div className="cross-section-header">
            <h4>X Axis Cross Section</h4>
          </div>
          <CrossSectionCanvas
            modelEntities={modelEntities}
            targetPosition={averagePosition}
            selectedPocketId={selectedPocketId}
            pocketClusters={pocketClusters}
            clippingAxis="x"
          />
          <div className="cross-section-header">
            <h4>Z Axis Cross Section</h4>
          </div>
          <CrossSectionCanvas
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