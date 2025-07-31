"use client"

import { Canvas } from "@react-three/fiber"
import { OrbitControls } from "@react-three/drei"
import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type * as THREE from "three"

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
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[1, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} transparent opacity={0.8} />
    </mesh>
  )
}

function FloatingParticles() {
  const particlesRef = useRef<THREE.Points>(null)

  const particleCount = 100
  const positions = useMemo(() => {
    const pos = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20
      pos[i * 3 + 1] = (Math.random() - 0.5) * 20
      pos[i * 3 + 2] = (Math.random() - 0.5) * 20
    }
    return pos
  }, [])

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.x = state.clock.elapsedTime * 0.1
      particlesRef.current.rotation.y = state.clock.elapsedTime * 0.05
    }
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={particleCount} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.05} color="#ffffff" transparent opacity={0.6} />
    </points>
  )
}

export default function ThreeBackground() {
  return (
    <Canvas
      camera={{ position: [0, 0, 10], fov: 75 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0)
      }}
    >
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <AnimatedSphere position={[-4, 2, -5]} color="#3b82f6" speed={0.5} />
      <AnimatedSphere position={[4, -2, -3]} color="#8b5cf6" speed={0.3} />
      <AnimatedSphere position={[0, 0, -8]} color="#06b6d4" speed={0.4} />

      <FloatingParticles />

      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </Canvas>
  )
}
