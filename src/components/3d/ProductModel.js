'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';

export default function ProductModel({ imageUrl, type = 'polaroid', rotation = true }) {
  const meshRef = useRef();

  // Dynamically calculate the 3D geometry dimensions based on the product ID
  const config = useMemo(() => {
    const t = (type || '').toLowerCase();
    
    // 1. Photo Strips (Tall and narrow, roughly 1:3 aspect ratio)
    if (t.includes('strip')) {
      return {
        frame: [1.4, 4.2, 0.03],
        photo: [1.2, 4.0],
        photoY: 0, // Centered vertically
        hasBottom: false,
        shadow: [1.5, 4.3]
      };
    }
    
    // 2. Posters (A3, A5, etc. Standard A-series ratio is 1:1.414)
    if (t.includes('poster') || t.includes('a3') || t.includes('a5')) {
      return {
        frame: [2.6, 3.67, 0.04],
        photo: [2.4, 3.47], // Thin, premium white border all around
        photoY: 0, // Centered vertically
        hasBottom: false,
        shadow: [2.7, 3.77]
      };
    }
    
    // 3. Default: Polaroid classic (Square photo, thick bottom border)
    return {
      frame: [2.5, 3.0, 0.05],
      photo: [2.2, 2.2],
      photoY: 0.25, // Shifted up to leave room for writing
      hasBottom: true,
      bottomSize: [2.2, 0.6],
      bottomY: -1.0,
      shadow: [2.6, 3.1]
    };
  }, [type]);

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
      {/* Main Frame backing */}
      <mesh position={[0, 0, -0.02]}>
        <boxGeometry args={config.frame} />
        <meshStandardMaterial color="#ffffff" roughness={0.1} metalness={0.1} />
      </mesh>

      {/* Photo canvas area */}
      <mesh position={[0, config.photoY, 0.01]}>
        <planeGeometry args={config.photo} />
        <meshStandardMaterial 
          map={texture} 
          roughness={0.2}
          metalness={0.0}
          transparent={!imageUrl}
          opacity={imageUrl ? 1 : 0.15} // semi-opaque look when empty
          color={imageUrl ? "#ffffff" : "#e5e5e5"}
        />
      </mesh>

      {/* Optional: Bottom white writing space margin (Polaroids only) */}
      {config.hasBottom && (
        <mesh position={[0, config.bottomY, 0.001]}>
          <planeGeometry args={config.bottomSize} />
          <meshStandardMaterial color="#ffffff" roughness={0.1} />
        </mesh>
      )}

      {/* Realistic Shadow Backing board depth */}
      <mesh position={[0, 0, -0.03]}>
        <planeGeometry args={config.shadow} />
        <meshStandardMaterial color="#b3b3b3" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}