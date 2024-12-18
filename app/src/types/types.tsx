export type ModelEntity = {
    bufferGeometry: THREE.BufferGeometry;
    entityId: string;
    color: string;
    opacity: number;
    belongsToPocket: boolean;
    position: THREE.Vector3;
}
