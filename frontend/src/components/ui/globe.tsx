"use client"

import React, { useEffect, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import ThreeGlobe from "three-globe"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import globeData from "@/data/globe.json"
import countriesData from "@/data/countries.json"
import { cn } from "@/lib/utils"

// Create a memoized version of the Globe to avoid unnecessary re-renders
const GlobeContent = ({ data }: { data: any[] }) => {
  const { scene } = useThree()
  const globeRef = useRef<THREE.Group>(null)

  useEffect(() => {
    const globe = new ThreeGlobe()
      .globeImageUrl("") // Solid/glow color
      .showGlobe(true)
      .showAtmosphere(true)
      .atmosphereColor("#fb923c")
      .atmosphereAltitude(0.15)
      .arcsData(data)
      .arcColor("color")
      .arcDashLength(0.4)
      .arcDashGap(4)
      .arcDashInitialGap(() => Math.random() * 5)
      .arcDashAnimateTime(1000)
      .pointsData(data.map(d => ({ lat: d.startLat, lng: d.startLng, size: 0.1, color: d.color })))
      .pointColor("color")
      .pointAltitude(0)
      .pointRadius(0.1)
      .ringsData(data.map(d => ({ lat: d.startLat, lng: d.startLng, color: d.color })))
      .ringColor((e: any) => (t: any) => e.color)
      .ringMaxRadius(2)
      .ringPropagationSpeed(1)
      .ringRepeatPeriod(2000)
      .hexPolygonsData((countriesData as any).features)
      .hexPolygonResolution(3)
      .hexPolygonMargin(0.3)
      .hexPolygonColor(() => "rgba(0, 0, 0, 0.8)") // Increased prominence

    const globeMaterial = globe.globeMaterial() as THREE.MeshPhongMaterial
    globeMaterial.color = new THREE.Color("#f97316") // Glowing orange base
    globeMaterial.emissive = new THREE.Color("#f97316")
    globeMaterial.emissiveIntensity = 0.5
    globeMaterial.shininess = 0.9

    if (globeRef.current) {
      globeRef.current.add(globe)
      globe.scale.set(1.1, 1.1, 1.1)
    }

    return () => {
      if (globeRef.current) {
        globeRef.current.remove(globe)
      }
    }
  }, [data])

  useFrame(() => {
    if (globeRef.current) {
      globeRef.current.rotation.y += 0.003
    }
  })

  return <group ref={globeRef} />
}

interface EarthProps {
  className?: string
}

const Earth: React.FC<EarthProps> = ({ className }) => {
  return (
    <div className={cn("relative z-[10] mx-auto flex w-full h-[350px] items-center justify-center", className)}>
      <Canvas
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 0, 300], fov: 45 }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 300]} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 3.5}
          maxPolarAngle={Math.PI - Math.PI / 3}
        />
        <ambientLight color="#ffffff" intensity={2} />
        <directionalLight color="#ffffff" intensity={3} position={[-800, 2000, 400]} />
        <spotLight
          color="#ffffff"
          intensity={10}
          distance={100}
          angle={Math.PI / 4}
          penumbra={1}
          position={[100, 200, 100]}
        />
        <GlobeContent data={globeData} />
      </Canvas>

      {/* Glossy Overlay effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-background/20 to-transparent rounded-full blur-3xl opacity-50" />
    </div>
  )
}

export default Earth
