"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense } from "react";

function Model({ url }: { url: string }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={1.2} />;
}

export function Product3DViewer({ modelUrl }: { modelUrl: string }) {
  return (
    <div className="h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-black/30">
      <Canvas camera={{ position: [0, 0.4, 2.4], fov: 45 }}>
        <ambientLight intensity={0.65} />
        <directionalLight position={[3, 4, 2]} intensity={1.2} />
        <Suspense fallback={null}>
          <Model url={modelUrl} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls enablePan={false} />
      </Canvas>
    </div>
  );
}
