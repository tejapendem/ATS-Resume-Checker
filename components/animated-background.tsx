"use client"

import { Suspense, lazy } from "react"
import { Canvas } from "@react-three/fiber"
import { OrbitControls, Sphere, MeshDistortMaterial } from "@react-three/drei"
import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

const ThreeBackground = lazy(() => import("./three-background"))

function AnimatedSphere({
  position,
  color,
  speed,
}: { position: [number, number, number]; color: string; speed: number }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.elapsedTime * speed
      meshRef.current.rotation.y = state.clock.elapsedTime * speed * 0.5
      meshRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * speed) * 0.5
    }
  })

  return (
    <Sphere ref={meshRef} args={[1, 100, 200]} position={position}>
      <MeshDistortMaterial
        color={color}
        attach="material"
        distort={0.3}
        speed={2}
        roughness={0.2}
        transparent
        opacity={0.8}
      />
    </Sphere>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.1
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  const particleCount = 100
  const positions = new Float32Array(particleCount * 3)

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 20
    positions[i * 3 + 1] = (Math.random() - 0.5) * 20
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20
  }

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  )
}

export function AnimatedBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900" />
      <Suspense fallback={null}>
        <Canvas camera={{ position: [0, 0, 10], fov: 75 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />

          <AnimatedSphere position={[-4, 2, -5]} color="#3b82f6" speed={0.5} />
          <AnimatedSphere position={[4, -2, -3]} color="#8b5cf6" speed={0.3} />
          <AnimatedSphere position={[0, 0, -8]} color="#06b6d4" speed={0.4} />

          <FloatingParticles />

          <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
        </Canvas>
      </Suspense>
    </div>
  )
}
