import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment } from "@react-three/drei";
import * as THREE from "three";

// 3D Disc & Splitting Luminous Beams Scene
function DiscScene({ mouse }) {
  const groupRef = useRef();
  const discRef = useRef();
  const [loadTime, setLoadTime] = useState(0);

  // Define beam paths (royalty split channels fanning to the left and fading out)
  const beamCurves = useMemo(() => {
    return [
      { start: [-0.1, 0.35, 0.05], cp: [-1.2, 0.8, 0.25], end: [-3.4, 1.3, 0.1], width: 0.025, color: "#FFE29A" },
      { start: [-0.1, 0.1, 0.05], cp: [-1.4, 0.25, 0.15], end: [-3.6, 0.35, 0], width: 0.03, color: "#E2BF6B" },
      { start: [-0.1, -0.15, 0.05], cp: [-1.3, -0.35, -0.05], end: [-3.3, -0.55, 0], width: 0.025, color: "#C9A24B" },
      { start: [-0.1, -0.4, 0.05], cp: [-1.1, -0.9, -0.15], end: [-3.0, -1.2, 0], width: 0.02, color: "#8A7238" },
    ];
  }, []);

  useFrame((state, delta) => {
    setLoadTime((t) => Math.min(t + delta, 3.0));

    // Slow idle rotation of the disc
    if (discRef.current) {
      discRef.current.rotation.z -= delta * 0.12;
    }

    // Gentle responsive mouse parallax
    if (groupRef.current) {
      const targetRotX = 0.35 + (mouse.current.y * 0.10);
      const targetRotY = -0.28 + (mouse.current.x * 0.12);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.04);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.04);
    }
  });

  const beamProgress = Math.min(loadTime / 1.5, 1);
  const beamOpacity = 0.25 + (beamProgress * 0.55);

  return (
    <group ref={groupRef} position={[0.4, 0, 0]} rotation={[0.35, -0.28, 0.15]}>
      
      {/* Lighting Setup (Warm key + Cool specular rim light) */}
      <ambientLight intensity={0.7} color="#FAF5EB" />
      <directionalLight position={[5, 6, 4]} intensity={2.5} color="#FFE6A3" castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={1.4} color="#90C0FF" />
      <pointLight position={[0, 1, 2.5]} intensity={1.8} color="#FFE29A" distance={8} />

      {/* Warehouse environment reflections for rich metallic sheen */}
      <Environment preset="warehouse" />

      {/* Main Brushed Brass Mastering Disc (Sized perfectly so it never clips) */}
      <group ref={discRef}>
        
        {/* Disc Body (Radius 1.6: fits with generous margin in viewport) */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[1.65, 1.65, 0.05, 64]} />
          <meshPhysicalMaterial
            color="#C9A24B"
            metalness={0.92}
            roughness={0.32}
            clearcoat={0.4}
            clearcoatRoughness={0.15}
            reflectivity={0.95}
          />
        </mesh>

        {/* Outer Edge Chamfer Highlight Ring */}
        <mesh position={[0, 0.026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.58, 1.65, 64]} />
          <meshStandardMaterial
            color="#FFE29A"
            metalness={0.95}
            roughness={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>

        {/* Master Lacquer Grooves (Concentric Micro-rings) */}
        {[0.55, 0.75, 0.95, 1.15, 1.35, 1.5].map((radius, idx) => (
          <mesh key={idx} position={[0, 0.027, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.015, 64]} />
            <meshStandardMaterial
              color="#14120F"
              opacity={0.3}
              transparent
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Center Label Area (Analog Paper Inset) */}
        <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.42, 48]} />
          <meshStandardMaterial color="#1E1B16" roughness={0.75} side={THREE.DoubleSide} />
        </mesh>

        {/* Center Collar Ring */}
        <mesh position={[0, 0.029, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.38, 0.42, 48]} />
          <meshStandardMaterial color="#C9A24B" metalness={0.9} roughness={0.2} side={THREE.DoubleSide} />
        </mesh>

        {/* Brass Center Spindle Collar */}
        <mesh position={[0, 0.035, 0]}>
          <cylinderGeometry args={[0.08, 0.08, 0.06, 32]} />
          <meshStandardMaterial color="#FFE29A" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Luminous Fanning Royalty Split Light Beams */}
      <group>
        {beamCurves.map((b, idx) => {
          const currentEnd = [
            b.start[0] + (b.end[0] - b.start[0]) * beamProgress,
            b.start[1] + (b.end[1] - b.start[1]) * beamProgress,
            b.start[2] + (b.end[2] - b.start[2]) * beamProgress,
          ];

          const curve = new THREE.QuadraticBezierCurve3(
            new THREE.Vector3(...b.start),
            new THREE.Vector3(...b.cp),
            new THREE.Vector3(...currentEnd)
          );

          const points = curve.getPoints(32);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <line key={idx} geometry={lineGeometry}>
              <lineBasicMaterial
                color={b.color}
                transparent
                opacity={beamOpacity * (1 - idx * 0.15)}
                linewidth={2}
                blending={THREE.AdditiveBlending}
              />
            </line>
          );
        })}
      </group>
    </group>
  );
}

// Fallback for devices with reduced motion, low power, or WebGL disabled
function StaticDiscFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative pointer-events-none p-4">
      <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-full border border-brass-dim/30 bg-gradient-to-tr from-[#14120F] via-[#2A2314] to-[#C9A24B]/30 shadow-2xl flex items-center justify-center">
        <div className="absolute inset-4 rounded-full border border-brass-dim/20" />
        <div className="absolute inset-10 rounded-full border border-brass/25" />
        <div className="absolute inset-16 rounded-full border border-brass-dim/20" />
        <div className="w-16 h-16 rounded-full bg-ink border border-brass/40 flex items-center justify-center">
          <div className="w-3.5 h-3.5 rounded-full bg-brass" />
        </div>
      </div>
    </div>
  );
}

export function StudioDisc3D() {
  const mouse = useRef({ x: 0, y: 0 });
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);
    const handler = (e) => setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
    mouse.current = { x, y };
  };

  if (prefersReducedMotion || hasError) {
    return <StaticDiscFallback />;
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      className="w-full h-full relative cursor-default select-none overflow-visible"
      style={{ minHeight: "460px" }}
    >
      <Suspense fallback={<StaticDiscFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5.2], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onError={() => setHasError(true)}
          style={{ width: "100%", height: "100%", background: "transparent" }}
        >
          <DiscScene mouse={mouse} />
        </Canvas>
      </Suspense>
    </div>
  );
}
