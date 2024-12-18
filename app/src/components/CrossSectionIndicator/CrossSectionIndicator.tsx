import React from 'react';
import * as THREE from 'three';

const CROSS_SECTION_INDICATOR_SETTINGS = {
    dimensions: [70, 100] as [number, number],
    xAxisColor: 'red',
    zAxisColor: 'blue',
    side: THREE.DoubleSide,
    opacity: 0.7,
};

interface CrosSectionIndicatorProps {
    location: THREE.Vector3;
    axis: "x" | "y" | "z"
}

const CrossSectionIndicator: React.FC<CrosSectionIndicatorProps> = ({ location, axis }) => {

    let color = '';
    let rotation: [number, number, number] = [0, 0, 0];

    if (axis === 'x') {
        color = CROSS_SECTION_INDICATOR_SETTINGS.xAxisColor;
    }

    if (axis === 'z') {
        color = CROSS_SECTION_INDICATOR_SETTINGS.zAxisColor;
        rotation = [0, Math.PI / 2, 0]
    }

    return (
        <>
            <mesh position={location} rotation={rotation}>
                <planeGeometry args={CROSS_SECTION_INDICATOR_SETTINGS.dimensions} />
                <meshBasicMaterial
                    color={color}
                    side={CROSS_SECTION_INDICATOR_SETTINGS.side}
                    transparent
                    opacity={CROSS_SECTION_INDICATOR_SETTINGS.opacity}
                />
            </mesh>
        </>
    );
}
export default CrossSectionIndicator;
