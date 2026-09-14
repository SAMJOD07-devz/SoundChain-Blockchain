import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// 3D Disc & Splitting Beams Scene
function DiscScene({ mouse }) {
  const groupRef = useRef();
  const discRef = useRef();
  const beamsRef = useRef();
  const [loadTime, setLoadTime] = useState(0);

  // Define beam paths (3-4 royalty split channels fanning to the left)
  const beamCurves = useMemo(() => {
    // Beams emerging from the disc edge and fanning outward towards the editorial content
    return [
      { start: [0, 0.4, 0], cp: [-1.2, 0.9, 0.2], end: [-3.2, 1.4, 0], width: 0.02, color: "#C9A24B" },
      { start: [0, 0.1, 0], cp: [-1.4, 0.3, 0.1], end: [-3.5, 0.4, 0], width: 0.024, color: "#E2BF6B" },
      { start: [0, -0.2, 0], cp: [-1.3, -0.4, -0.1], end: [-3.3, -0.6, 0], width: 0.02, color: "#C9A24B" },
      { start: [0, -0.5, 0], cp: [-1.1, -1.0, -0.2], end: [-2.9, -1.3, 0], width: 0.018, color: "#8A7238" },
    ];
  }, []);

  useFrame((state, delta) => {
    setLoadTime((t) => Math.min(t + delta, 3.0));

    // Slow idle rotation of the disc
    if (discRef.current) {
      discRef.current.rotation.z -= delta * 0.15;
    }

    // Subtle responsive mouse parallax
    if (groupRef.current) {
      const targetRotX = 0.45 + (mouse.current.y * 0.12);
      const targetRotY = -0.35 + (mouse.current.x * 0.15);

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetRotX, 0.05);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetRotY, 0.05);
    }
  });

  // Calculate beam animation progress: fans out on load, then softly settles
  const beamProgress = Math.min(loadTime / 1.8, 1);
  const beamOpacity = 0.15 + (beamProgress * 0.45);

  return (
    <group ref={groupRef} position={[0.8, 0, 0]} rotation={[0.45, -0.35, 0.2]}>
      {/* Lights */}
      <ambientLight intensity={0.4} color="#F6F1E7" />
      <directionalLight position={[4, 5, 4]} intensity={1.8} color="#FFE8C0" />
      <directionalLight position={[-3, 2, -2]} intensity={0.6} color="#8A7238" />
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#C9A24B" />

      {/* Main Brushed Brass Mastering Disc */}
      <group ref={discRef}>
        {/* Outer Rim & Body */}
        <mesh castShadow receiveShadow>
          <cylinderGeometry args={[2.5, 2.5, 0.06, 64]} />
          <meshPhysicalMaterial
            color="#C9A24B"
            metalness={0.88}
            roughness={0.24}
            clearcoat={0.35}
            clearcoatRoughness={0.12}
            reflectivity={0.9}
          />
        </mesh>

        {/* Outer Edge Chamfer Ring */}
        <mesh position={[0, 0.031, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[2.42, 2.5, 64]} />
          <meshStandardMaterial color="#8A7238" metalness={0.95} roughness={0.15} side={THREE.DoubleSide} />
        </mesh>

        {/* Master Lacquer Grooves (Concentric Micro-rings) */}
        {[0.8, 1.1, 1.4, 1.7, 2.0, 2.25].map((radius, idx) => (
          <mesh key={idx} position={[0, 0.032, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius, radius + 0.02, 64]} />
            <meshStandardMaterial
              color="#14120F"
              opacity={0.35}
              transparent
              roughness={0.8}
              side={THREE.DoubleSide}
            />
          </mesh>
        ))}

        {/* Center Label Area (Tactile Paper Inset) */}
        <mesh position={[0, 0.033, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.65, 48]} />
          <meshStandardMaterial color="#221F1A" roughness={0.85} side={THREE.DoubleSide} />
        </mesh>

        {/* Brass Center Spindle Collar */}
        <mesh position={[0, 0.04, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
          <meshStandardMaterial color="#E2BF6B" metalness={0.95} roughness={0.1} />
        </mesh>
      </group>

      {/* Light Channels / Royalty Split Beams */}
      <group ref={beamsRef}>
        {beamCurves.map((b, idx) => {
          // Linear interpolation for beam end points during initial load
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

          const points = curve.getPoints(24);
          const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

          return (
            <line key={idx} geometry={lineGeometry}>
              <lineBasicMaterial
                color={b.color}
                transparent
                opacity={beamOpacity * (1 - idx * 0.12)}
                linewidth={1}
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
    <div className="w-full h-full flex items-center justify-end relative pointer-events-none pr-4 md:pr-12">
      <div className="relative w-72 h-72 md:w-96 md:h-96 rounded-full border border-brass-dim/30 bg-gradient-to-tr from-[#14120F] via-[#2A2314] to-[#C9A24B]/30 shadow-2xl flex items-center justify-center opacity-85">
        <div className="absolute inset-4 rounded-full border border-brass-dim/20" />
        <div className="absolute inset-10 rounded-full border border-brass/25" />
        <div className="absolute inset-16 rounded-full border border-brass-dim/20" />
        <div className="w-20 h-20 rounded-full bg-ink border border-brass/40 flex items-center justify-center">
          <div className="w-4 h-4 rounded-full bg-brass" />
        </div>
        {/* Static Brass Split Light Tracer Lines */}
        <svg className="absolute -left-32 top-1/2 -translate-y-1/2 w-48 h-32 overflow-visible pointer-events-none opacity-60">
          <path d="M 160 60 C 90 20, 40 10, 0 10" fill="none" stroke="#C9A24B" strokeWidth="1.5" strokeDasharray="3 3" />
          <path d="M 160 64 C 90 64, 40 64, -20 64" fill="none" stroke="#E2BF6B" strokeWidth="2" />
          <path d="M 160 68 C 90 100, 40 110, 0 120" fill="none" stroke="#8A7238" strokeWidth="1.5" strokeDasharray="2 2" />
        </svg>
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
      style={{ minHeight: "420px" }}
    >
      <Suspense fallback={<StaticDiscFallback />}>
        <Canvas
          camera={{ position: [0, 0, 5], fov: 42 }}
          dpr={[1, 1.5]} // Performance optimization: capped at 1.5
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
