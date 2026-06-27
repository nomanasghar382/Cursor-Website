import { Environment, Float, Lightformer, MeshTransmissionMaterial, RoundedBox, Sphere, Text } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { usePrefersReducedMotion } from '../hooks/usePrefersReducedMotion';

type MarketplaceSceneProps = {
  activePhase: number;
  qualityMode: 'smooth' | 'cinematic';
};

type ActivePhaseProps = {
  activePhase: number;
};

type SceneContentProps = MarketplaceSceneProps & {
  reducedMotion: boolean;
};

function MarketplaceScene({ activePhase, qualityMode }: MarketplaceSceneProps) {
  const reducedMotion = usePrefersReducedMotion();
  const isSmoothMode = qualityMode === 'smooth';

  return (
    <Canvas
      camera={{ position: [0, 1.4, 7.4], fov: 42 }}
      dpr={isSmoothMode ? [1, 1.15] : [1, 1.45]}
      gl={{
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
        toneMappingExposure: 1.05,
      }}
    >
      <Suspense fallback={null}>
        <SceneContent activePhase={activePhase} qualityMode={qualityMode} reducedMotion={reducedMotion} />
      </Suspense>
    </Canvas>
  );
}

function SceneContent({ activePhase, qualityMode, reducedMotion }: SceneContentProps) {
  const rig = useRef<THREE.Group>(null);
  const { camera, pointer } = useThree();
  const targetCamera = useMemo(() => new THREE.Vector3(), []);
  const pointerOffset = useMemo(() => new THREE.Vector3(), []);
  const isSmoothMode = qualityMode === 'smooth';
  const cameraPositions = useMemo(
    () => [
      new THREE.Vector3(0, 1.4, 7.4),
      new THREE.Vector3(-1.6, 1.15, 6.2),
      new THREE.Vector3(1.55, 1.6, 5.45),
    ],
    [],
  );

  useFrame((_, delta) => {
    pointerOffset.set(pointer.x * 0.35, pointer.y * 0.18, 0);
    targetCamera.copy(cameraPositions[activePhase]).add(pointerOffset);
    camera.position.lerp(targetCamera, reducedMotion ? 1 : delta * 1.8);
    camera.lookAt(0, 0.2, 0);

    if (rig.current && !reducedMotion) {
      rig.current.rotation.y += delta * 0.16;
      rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, pointer.y * 0.08, delta * 2);
      rig.current.rotation.z = THREE.MathUtils.lerp(rig.current.rotation.z, -pointer.x * 0.05, delta * 2);
    }
  });

  return (
    <>
      <color attach="background" args={['#05070C']} />
      <fog attach="fog" args={['#0B0E14', 7, 18]} />
      <ambientLight intensity={0.55} />
      <pointLight position={[2.5, 2.8, 3.8]} intensity={18} color="#00D9C0" distance={8} />
      <pointLight position={[-3.5, 2.2, -1.4]} intensity={12} color="#6E56F8" distance={9} />
      <directionalLight position={[0, 5, 4]} intensity={2.1} color="#F5F6FA" />

      <group ref={rig}>
        <AiMarketplaceDevice activePhase={activePhase} />
        <ProductOrbit activePhase={activePhase} />
        <RecommendationNetwork activePhase={activePhase} />
        <AiAssistantCore activePhase={activePhase} />
        <CommerceElements activePhase={activePhase} />
        <ParticleField qualityMode={qualityMode} />
      </group>

      <Environment resolution={isSmoothMode ? 256 : 512}>
        <Lightformer form="ring" intensity={3.5} color="#00D9C0" scale={4} position={[0, 4, -5]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={2.4} color="#6E56F8" scale={[6, 3, 1]} position={[-4, 2, 2]} />
        <Lightformer form="circle" intensity={1.6} color="#F5F6FA" scale={2} position={[3, -1, 3]} />
      </Environment>
      {!isSmoothMode && (
        <EffectComposer multisampling={0}>
          <Bloom luminanceThreshold={0.18} intensity={0.72} mipmapBlur />
          <Vignette eskil={false} offset={0.18} darkness={0.82} />
        </EffectComposer>
      )}
    </>
  );
}

function AiMarketplaceDevice({ activePhase }: ActivePhaseProps) {
  const device = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!device.current) return;
    device.current.position.y = THREE.MathUtils.lerp(device.current.position.y, activePhase * -0.12, delta * 2.4);
    device.current.scale.setScalar(THREE.MathUtils.lerp(device.current.scale.x, activePhase === 2 ? 0.86 : 1, delta * 2));
  });

  return (
    <Float speed={1.3} rotationIntensity={0.18} floatIntensity={0.42}>
      <group ref={device}>
        <RoundedBox args={[2.55, 3.15, 0.22]} radius={0.22} smoothness={8} position={[0, 0.2, 0]}>
          <meshPhysicalMaterial
            color="#121824"
            metalness={0.78}
            roughness={0.18}
            clearcoat={1}
            clearcoatRoughness={0.1}
            emissive="#111B2B"
            emissiveIntensity={0.28}
          />
        </RoundedBox>
        <RoundedBox args={[2.18, 2.58, 0.08]} radius={0.16} smoothness={8} position={[0, 0.2, 0.16]}>
          <MeshTransmissionMaterial
            backside
            samples={6}
            thickness={0.45}
            chromaticAberration={0.04}
            anisotropy={0.18}
            distortion={0.13}
            distortionScale={0.28}
            temporalDistortion={0.08}
            color="#BFFFF7"
            roughness={0.08}
            transmission={0.72}
          />
        </RoundedBox>
        <mesh position={[0, 0.2, 0.23]}>
          <torusGeometry args={[1.18, 0.012, 16, 144]} />
          <meshStandardMaterial color="#00D9C0" emissive="#00D9C0" emissiveIntensity={3} />
        </mesh>
        <Text position={[0, 1.08, 0.29]} fontSize={0.16} letterSpacing={0.24} color="#F5F6FA" anchorX="center">
          NEXORA AI
        </Text>
        <Text position={[0, -0.96, 0.29]} fontSize={0.095} letterSpacing={0.12} color="#00D9C0" anchorX="center">
          PERSONALIZATION CORE
        </Text>
      </group>
    </Float>
  );
}

function ProductOrbit({ activePhase }: ActivePhaseProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (!group.current) return;
    group.current.rotation.y += delta * (activePhase === 1 ? 0.34 : 0.22);
  });

  return (
    <group ref={group}>
      <LuxuryBottle position={[-2.2, 0.25, -0.7]} color="#6E56F8" />
      <GlassHeadphones position={[2.05, -0.05, -0.25]} />
      <SmartWatch position={[0.15, 1.95, -0.6]} />
    </group>
  );
}

function LuxuryBottle({ position, color }: { position: [number, number, number]; color: string }) {
  return (
    <Float speed={1.8} rotationIntensity={0.42} floatIntensity={0.7}>
      <group position={position} rotation={[0.25, 0.7, -0.08]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.3, 0.42, 0.95, 48]} />
          <meshPhysicalMaterial color={color} metalness={0.45} roughness={0.2} clearcoat={1} />
        </mesh>
        <mesh position={[0, 0.63, 0]}>
          <cylinderGeometry args={[0.17, 0.2, 0.32, 48]} />
          <meshPhysicalMaterial color="#DDE8FF" metalness={0.65} roughness={0.16} />
        </mesh>
        <mesh position={[0, -0.05, 0.44]}>
          <circleGeometry args={[0.2, 48]} />
          <meshBasicMaterial color="#00D9C0" transparent opacity={0.7} />
        </mesh>
      </group>
    </Float>
  );
}

function GlassHeadphones({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.45} rotationIntensity={0.28} floatIntensity={0.55}>
      <group position={position} rotation={[0.1, -0.7, 0.16]}>
        <mesh>
          <torusGeometry args={[0.48, 0.035, 20, 96, Math.PI]} />
          <meshStandardMaterial color="#F5F6FA" metalness={0.8} roughness={0.16} emissive="#1C2540" />
        </mesh>
        {[-0.42, 0.42].map((x) => (
          <RoundedBox key={x} args={[0.28, 0.5, 0.2]} radius={0.09} smoothness={8} position={[x, -0.32, 0]}>
            <meshPhysicalMaterial color="#101722" metalness={0.6} roughness={0.18} clearcoat={1} />
          </RoundedBox>
        ))}
      </group>
    </Float>
  );
}

function SmartWatch({ position }: { position: [number, number, number] }) {
  return (
    <Float speed={1.7} rotationIntensity={0.34} floatIntensity={0.5}>
      <group position={position} rotation={[0.9, 0.35, -0.45]}>
        <RoundedBox args={[0.64, 0.82, 0.12]} radius={0.16} smoothness={10}>
          <meshPhysicalMaterial color="#151B28" metalness={0.8} roughness={0.12} clearcoat={1} />
        </RoundedBox>
        <RoundedBox args={[0.48, 0.62, 0.05]} radius={0.12} smoothness={8} position={[0, 0, 0.08]}>
          <meshBasicMaterial color="#00D9C0" transparent opacity={0.72} />
        </RoundedBox>
      </group>
    </Float>
  );
}

function RecommendationNetwork({ activePhase }: ActivePhaseProps) {
  const points = useMemo(
    () => [
      new THREE.Vector3(-2.2, 0.25, -0.7),
      new THREE.Vector3(2.05, -0.05, -0.25),
      new THREE.Vector3(0.15, 1.95, -0.6),
      new THREE.Vector3(0, 0.22, 0.36),
      new THREE.Vector3(-1.5, -1.2, 0.35),
      new THREE.Vector3(1.55, -1.05, 0.4),
    ],
    [],
  );

  return (
    <group>
      {points.map((point, index) => (
        <Sphere key={`${point.x}-${point.y}`} args={[index === 3 ? 0.09 : 0.055, 24, 24]} position={point}>
          <meshBasicMaterial color={index === 3 ? '#00D9C0' : '#6E56F8'} transparent opacity={activePhase === 0 ? 0.72 : 0.95} />
        </Sphere>
      ))}
      {points.slice(0, -1).map((point, index) => (
        <ConnectionLine key={`${point.x}-${index}`} start={point} end={points[(index + 2) % points.length]} active={activePhase >= 1} />
      ))}
    </group>
  );
}

function ConnectionLine({ start, end, active }: { start: THREE.Vector3; end: THREE.Vector3; active: boolean }) {
  const material = useRef<THREE.LineBasicMaterial>(null);
  const geometry = useMemo(() => new THREE.BufferGeometry().setFromPoints([start, end]), [start, end]);
  const line = useMemo(() => new THREE.Line(geometry), [geometry]);

  useFrame((state) => {
    if (!material.current) return;
    material.current.opacity = (active ? 0.42 : 0.16) + Math.sin(state.clock.elapsedTime * 2.3) * 0.08;
  });

  return <primitive object={line}>{<lineBasicMaterial ref={material} color={active ? '#00D9C0' : '#6E56F8'} transparent opacity={0.28} />}</primitive>;
}

function AiAssistantCore({ activePhase }: ActivePhaseProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!group.current) return;
    group.current.rotation.y = state.clock.elapsedTime * 0.45;
    group.current.position.x = THREE.MathUtils.lerp(group.current.position.x, activePhase === 2 ? -1.45 : -2.75, 0.05);
  });

  return (
    <group ref={group} position={[-2.75, -1.05, 0.55]}>
      <Sphere args={[0.42, 48, 48]}>
        <MeshTransmissionMaterial
          samples={5}
          thickness={0.35}
          transmission={0.84}
          roughness={0.05}
          color="#BFFFF7"
          distortion={0.18}
          temporalDistortion={0.12}
        />
      </Sphere>
      <mesh>
        <icosahedronGeometry args={[0.23, 2]} />
        <meshBasicMaterial color="#00D9C0" wireframe transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function CommerceElements({ activePhase }: ActivePhaseProps) {
  const opacity = activePhase === 2 ? 0.92 : 0.38;

  return (
    <group position={[1.35, -1.28, 0.55]}>
      {['Cart', 'Wish', 'Pay'].map((label, index) => (
        <Float key={label} speed={1.2 + index * 0.25} rotationIntensity={0.08} floatIntensity={0.18}>
          <group position={[index * 0.62 - 0.62, Math.sin(index) * 0.12, 0]}>
            <RoundedBox args={[0.5, 0.35, 0.08]} radius={0.08} smoothness={8}>
              <meshStandardMaterial color="#101722" emissive={index === 2 ? '#00D9C0' : '#6E56F8'} emissiveIntensity={opacity} metalness={0.5} roughness={0.2} />
            </RoundedBox>
            <Text position={[0, 0, 0.07]} fontSize={0.08} color="#F5F6FA" anchorX="center" anchorY="middle">
              {label}
            </Text>
          </group>
        </Float>
      ))}
    </group>
  );
}

function ParticleField({ qualityMode }: { qualityMode: 'smooth' | 'cinematic' }) {
  const pointsRef = useRef<THREE.Points>(null);
  const particleCount = qualityMode === 'smooth' ? 220 : 620;
  const [positions, colors] = useMemo(() => {
    const positionArray = new Float32Array(particleCount * 3);
    const colorArray = new Float32Array(particleCount * 3);
    const teal = new THREE.Color('#00D9C0');
    const violet = new THREE.Color('#6E56F8');

    for (let index = 0; index < particleCount; index += 1) {
      const radius = 2.1 + Math.random() * 3.6;
      const angle = Math.random() * Math.PI * 2;
      positionArray[index * 3] = Math.cos(angle) * radius;
      positionArray[index * 3 + 1] = (Math.random() - 0.5) * 4.5;
      positionArray[index * 3 + 2] = Math.sin(angle) * radius - 1.4;

      const mixed = teal.clone().lerp(violet, Math.random());
      colorArray[index * 3] = mixed.r;
      colorArray[index * 3 + 1] = mixed.g;
      colorArray[index * 3 + 2] = mixed.b;
    }

    return [positionArray, colorArray];
  }, [particleCount]);

  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.035;
    pointsRef.current.rotation.x += delta * 0.012;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial size={0.018} vertexColors transparent opacity={0.82} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  );
}

export default MarketplaceScene;
