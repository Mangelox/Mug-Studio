import React, { useRef, useMemo, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, Environment, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { MUG_CIRCUMFERENCE_CM, MUG_HEIGHT_CM } from '../types';

// Augment JSX namespace to include React Three Fiber elements
// Using module augmentation for 'react' to ensure it merges correctly with React types
declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      ambientLight: any;
      pointLight: any;
      spotLight: any;
      group: any;
      mesh: any;
      cylinderGeometry: any;
      meshStandardMaterial: any;
      primitive: any;
      torusGeometry: any;
      tubeGeometry: any;
    }
  }
}

interface MugViewerProps {
  textureUrl: string | null;
}

// Calculate Mug Geometry
// Radius = Circumference / (2 * PI)
const RADIUS = MUG_CIRCUMFERENCE_CM / (2 * Math.PI); 
const HEIGHT = MUG_HEIGHT_CM;

const MugModel = ({ textureUrl }: { textureUrl: string | null }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Load texture from Data URL
  const texture = useMemo(() => {
    if (!textureUrl) return null;
    const loader = new THREE.TextureLoader();
    const tex = loader.load(textureUrl);
    tex.wrapS = THREE.RepeatWrapping;
    tex.wrapT = THREE.ClampToEdgeWrapping;
    // Fixed: Set repeat to positive 1 to fix mirror view issue
    tex.repeat.set(1, 1); 
    tex.offset.set(0, 0); 
    // Ensure sharp texture
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [textureUrl]);

  useEffect(() => {
    if (texture) {
      texture.needsUpdate = true;
    }
  }, [texture]);

  // Create standard mug material
  const material = useMemo(() => {
     return new THREE.MeshStandardMaterial({
        color: 0xffffff,
        roughness: 0.3,
        metalness: 0.1,
        map: texture || null
     });
  }, [texture]);

  // Create a smooth curve for the handle
  const handlePath = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-0.1, 2.2, 0), // Top join (slightly inside)
      new THREE.Vector3(0.9, 2.6, 0),  // Top curve out
      new THREE.Vector3(1.8, 1.5, 0),  // Upper outer
      new THREE.Vector3(1.8, -1.2, 0), // Lower outer
      new THREE.Vector3(0.9, -2.6, 0), // Bottom curve in
      new THREE.Vector3(-0.1, -2.2, 0) // Bottom join
    ]);
  }, []);

  return (
    <group dispose={null} position={[0, -HEIGHT/2, 0]}>
        {/* Main Cylinder Body */}
        <mesh ref={meshRef} position={[0, HEIGHT / 2, 0]} castShadow receiveShadow>
            <cylinderGeometry args={[RADIUS, RADIUS, HEIGHT, 64, 1, true]} />
            <primitive object={material} attach="material" />
        </mesh>
        
        {/* Inside of the mug */}
         <mesh position={[0, HEIGHT / 2, 0]}>
            <cylinderGeometry args={[RADIUS - 0.1, RADIUS - 0.1, HEIGHT, 64, 1, true]} />
            <meshStandardMaterial color="#f1f5f9" side={THREE.BackSide} roughness={0.5} />
        </mesh>
        
        {/* Bottom of the mug */}
        <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
            <cylinderGeometry args={[RADIUS - 0.1, RADIUS - 0.1, 0.2, 64]} />
            <meshStandardMaterial color="#f1f5f9" />
        </mesh>

        {/* Handle Group - Attached to the side at X = RADIUS */}
        <group position={[RADIUS, HEIGHT/2, 0]}>
            <mesh castShadow receiveShadow>
                {/* TubeGeometry for organic handle shape */}
                <tubeGeometry args={[handlePath, 64, 0.22, 24, false]} />
                <meshStandardMaterial color="#ffffff" roughness={0.2} />
            </mesh>
        </group>
    </group>
  );
};

export const MugViewer: React.FC<MugViewerProps> = ({ textureUrl }) => {
  return (
    <div className="w-full h-full bg-gradient-to-b from-slate-800 to-slate-900 relative">
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[10, 6, 10]} fov={35} />
        <OrbitControls minPolarAngle={0} maxPolarAngle={Math.PI / 1.5} />
        
        <ambientLight intensity={0.7} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={100} castShadow />
        <pointLight position={[-10, -10, -10]} intensity={50} />
        
        <Environment preset="studio" />
        
        <MugModel textureUrl={textureUrl} />
        
        <ContactShadows position={[0, -HEIGHT/2 - 0.01, 0]} opacity={0.4} scale={20} blur={2.5} far={4.5} />
      </Canvas>
      
      <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-3 py-1 rounded-full backdrop-blur-md pointer-events-none">
        Interactive 3D Preview
      </div>
    </div>
  );
};