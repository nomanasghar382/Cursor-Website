"use client";

import { Float, MeshDistortMaterial, Sphere, Stars } from "@react-three/drei";
import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { Mesh } from "three";

function AuroraOrb({ position, color, scale = 1 }: { position: [number, number, number]; color: string; scale?: number }) {
  const ref = useRef<Mesh>(null);
  useFrame((state) => {
    if (!ref.current) return;
    ref.current.rotation.x = state.clock.elapsedTime * 0.18;
    ref.current.rotation.y = state.clock.elapsedTime * 0.24;
  });

  return (
    <Float speed={1.6} rotationIntensity={0.5} floatIntensity={1.4}>
      <Sphere ref={ref} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial color={color} attach="material" distort={0.45} speed={2.2} roughness={0.1} metalness={0.85} />
      </Sphere>
    </Float>
  );
}

export function CinematicHeroScene() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <Canvas camera={{ position: [0, 0, 7], fov: 42 }} className="h-full w-full">
        <color attach="background" args={["#020617"]} />
        <Stars radius={80} depth={40} count={1200} factor={3} saturation={0} fade speed={0.6} />
        <ambientLight intensity={0.35} />
        <directionalLight position={[6, 4, 2]} intensity={1.6} color="#67e8f9" />
        <pointLight position={[-4, -2, 3]} intensity={1.2} color="#c084fc" />
        <AuroraOrb position={[-1.4, 0.4, 0]} color="#22d3ee" scale={1.45} />
        <AuroraOrb position={[1.8, -0.2, -0.6]} color="#a78bfa" scale={1.05} />
        <AuroraOrb position={[0.2, 1.1, -1]} color="#38bdf8" scale={0.72} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-background/20 to-background" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.18),transparent_42%),radial-gradient(circle_at_80%_20%,rgba(167,139,250,0.16),transparent_35%)]" />
    </div>
  );
}
