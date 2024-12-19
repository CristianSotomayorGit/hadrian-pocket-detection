import React from 'react';
import './CrossSectionCanvas.css'
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { ModelEntity } from '../../types/types';

const CROSS_SECTION_CANVAS_SETTINGS = {
    selectedColor: 'magenta',
    defaultColor: 'gray',
    ambientLightIntensity: 0.5,
    directionalLightIntensity: 1,
    directionalLightPosition: new THREE.Vector3(10, 10, 10),
    selectedOpacity: 1,
    defaultOpacity: 0.8,
    xAxisColor: 'red',
    zAxisColor: 'blue',
    xAxisCameraPosition: new THREE.Vector3(0, 0, -200),
    zAxisCameraPosition: new THREE.Vector3(-200, 0, 0),
};

interface CrossSectionCanvasProps {
    modelEntities: ModelEntity[] | null;
    targetPosition: THREE.Vector3 | null;
    selectedPocketId: number | null;
    pocketClusters: Map<number, number> | null;
    clippingAxis: "x" | "y" | "z"
}

const CrossSectionCanvas: React.FC<CrossSectionCanvasProps> = ({ modelEntities, targetPosition, selectedPocketId, pocketClusters, clippingAxis }) => {

    if (!modelEntities || !targetPosition || !pocketClusters)
        return <div className="cross-section-canvas">Error: Some data required for rendering is null</div>;

    let cameraPosition = new THREE.Vector3(0, 0, 0);
    let borderColor = '';
    let clippingPlane = null;

    if (clippingAxis === "x") {
        cameraPosition = CROSS_SECTION_CANVAS_SETTINGS.xAxisCameraPosition;
        borderColor = CROSS_SECTION_CANVAS_SETTINGS.xAxisColor;
        clippingPlane = targetPosition ? new THREE.Plane(new THREE.Vector3(0, 0, 1), -targetPosition.z) : null;
    }

    if (clippingAxis === "z") {
        cameraPosition = CROSS_SECTION_CANVAS_SETTINGS.zAxisCameraPosition;
        borderColor = CROSS_SECTION_CANVAS_SETTINGS.zAxisColor;
        clippingPlane = targetPosition ? new THREE.Plane(new THREE.Vector3(1, 0, 0), -targetPosition.x) : null;

    }
    
    return (
        <div className="cross-section-canvas" style={{ borderColor: borderColor }}>
            <Canvas
                gl={{ clippingPlanes: [clippingPlane] }}
                camera={{ position: cameraPosition }}
            >
                <ambientLight intensity={CROSS_SECTION_CANVAS_SETTINGS.ambientLightIntensity} />
                <directionalLight
                    position={CROSS_SECTION_CANVAS_SETTINGS.directionalLightPosition}
                    intensity={CROSS_SECTION_CANVAS_SETTINGS.directionalLightIntensity}
                />
                <OrbitControls target={targetPosition.toArray()} />
                {modelEntities.map((entity) => {
                    const isSelected =
                        selectedPocketId !== null &&
                        pocketClusters.get(entity.id) === selectedPocketId;

                    const color = isSelected
                        ? CROSS_SECTION_CANVAS_SETTINGS.selectedColor
                        : CROSS_SECTION_CANVAS_SETTINGS.defaultColor;
                    const opacity = isSelected
                        ? CROSS_SECTION_CANVAS_SETTINGS.selectedOpacity
                        : CROSS_SECTION_CANVAS_SETTINGS.defaultOpacity;

                    return (
                        <mesh key={entity.id} geometry={entity.mesh.geometry}>
                            <meshStandardMaterial
                                color={color}
                                transparent
                                opacity={opacity}
                                side={THREE.DoubleSide}
                            />
                        </mesh>
                    );
                })}
            </Canvas>
        </div>
    );
};

export default CrossSectionCanvas;
