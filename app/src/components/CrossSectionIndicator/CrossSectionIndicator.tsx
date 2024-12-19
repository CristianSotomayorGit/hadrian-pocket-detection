import React from 'react';
import * as THREE from 'three';

const CROSS_SECTION_INDICATOR_SETTINGS = {
    dimensions: [70, 100] as [number, number],
    xAxisColor: 'red',
    zAxisColor: 'blue',
    defaultColor: 'gray',
    side: THREE.DoubleSide,
    opacity: 0.7,
};

interface CrossSectionIndicatorProps {
    location: THREE.Vector3;
    axis: "x" | "z";
}

const CrossSectionIndicator: React.FC<CrossSectionIndicatorProps> = ({ location, axis }) => {

    let color = CROSS_SECTION_INDICATOR_SETTINGS.defaultColor;
    let rotation: [number, number, number] = [0, 0, 0];

    switch (axis) {
        case 'x':
            color = CROSS_SECTION_INDICATOR_SETTINGS.xAxisColor;
            rotation = [0, Math.PI, 0];
            break;
        case 'z':
            color = CROSS_SECTION_INDICATOR_SETTINGS.zAxisColor;
            rotation = [0, Math.PI / 2, 0];
            break;
        default:
            console.warn(`Unhandled axis type: ${axis}`);
            break;
    }

    return (
        <mesh position={location} rotation={rotation}>
            <planeGeometry args={CROSS_SECTION_INDICATOR_SETTINGS.dimensions} />
            <meshBasicMaterial
                color={color}
                side={CROSS_SECTION_INDICATOR_SETTINGS.side}
                transparent
                opacity={CROSS_SECTION_INDICATOR_SETTINGS.opacity}
            />
        </mesh>
    );
}

export default CrossSectionIndicator;
