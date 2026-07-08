'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export default function PolaroidModel({ imageUrl, rotation = true }) {
  const meshRef = useRef();

  // Use a tiny transparent 1x1 base64 GIF as a stable fallback texture
  // This ensures useTexture is ALWAYS called, preserving the hook execution order!
  const textureUrl = imageUrl || 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const texture = useTexture(textureUrl);

  useFrame((state, delta) => {
    if (rotation && meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <group ref={meshRef}>
      {/* Polaroid Frame backing */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={[2.5, 3, 0.05]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Photo canvas area */}
      <mesh position={[0, 0.3, 0.01]}>
        <planeGeometry args={[2.2, 2.2]} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.2}
          metalness={0.0}
          transparent={!imageUrl}
          opacity={imageUrl ? 1 : 0.15} // semi-opaque look when empty
          color={imageUrl ? "#ffffff" : "#e5e5e5"}
        />
      </mesh>

      {/* Bottom typical white writing space margin */}
      <mesh position={[0, -1, 0.001]}>
        <planeGeometry args={[2.2, 0.8]} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} />
      </mesh>

      {/* Realistic Shadow Backing board depth */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={[2.6, 3.1]} />
        <meshStandardMaterial color="#b3b3b3" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}