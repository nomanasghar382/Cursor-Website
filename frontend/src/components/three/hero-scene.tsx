"use client";

import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";

function FloatingCore() {
  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere args={[1.2, 64, 64]} scale={1.35}>
        <MeshDistortMaterial
          color="#22d3ee"
          attach="material"
          distort={0.42}
          speed={2}
          roughness={0.15}
          metalness={0.8}
        />
      </Sphere>
    </Float>
  );
}

export function HeroScene() {
  return (
    <div className="h-[420px] w-full overflow-hidden rounded-[2rem] border border-white/10 bg-black/20 shadow-[var(--shadow-soft)]">
      <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[4, 4, 2]} intensity={1.4} />
        <FloatingCore />
      </Canvas>
    </div>
  );
}
