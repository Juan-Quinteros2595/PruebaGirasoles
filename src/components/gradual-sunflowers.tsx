"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"

interface Sunflower {
  x: number
  y: number
  scale: number
  phase: number
  amplitude: number
  rotation: number
  appearTime: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  opacity: number
  type: "pollen" | "leaf"
  rotation: number
  rotationSpeed: number
}

export const GradualSunflowers: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [sunflowers] = useState<Sunflower[]>(() => {
    // Initialize sunflowers only once
    const flowers: Sunflower[] = []
    const count = 30
    const gridCols = 5
    const gridRows = 5
    const cellWidth = 100 / gridCols
    const cellHeight = 100 / gridRows

    for (let i = 0; i < count; i++) {
      const col = i % gridCols
      const row = Math.floor(i / gridCols)

      const cellCenterX = col * cellWidth + cellWidth / 2
      const cellCenterY = row * cellHeight + cellHeight / 2
      const randomOffsetX = (Math.random() - 0.5) * cellWidth * 0.6
      const randomOffsetY = (Math.random() - 0.5) * cellHeight * 0.6

      flowers.push({
        x: Math.max(5, Math.min(95, cellCenterX + randomOffsetX)),
        y: Math.max(5, Math.min(95, cellCenterY + randomOffsetY)),
        scale: 0.4 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        amplitude: 0.015 + Math.random() * 0.02,
        rotation: -8 + Math.random() * 16,
        appearTime: 500 + i * 400,
      })
    }

    // Shuffle for more natural appearance order
    for (let i = flowers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[flowers[i], flowers[j]] = [flowers[j], flowers[i]]
      flowers[i].appearTime = 500 + i * 400
    }

    return flowers
  })

  const [particles] = useState<Particle[]>(() => {
    // Initialize particles
    const particleArray: Particle[] = []
    const particleCount = 15

    for (let i = 0; i < particleCount; i++) {
      particleArray.push({
        x: Math.random() * 100,
        y: Math.random() * 100,
        vx: -0.5 + Math.random() * 1,
        vy: -0.2 + Math.random() * 0.4,
        size: 2 + Math.random() * 4,
        opacity: 0.3 + Math.random() * 0.4,
        type: Math.random() > 0.7 ? "leaf" : "pollen",
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: -0.02 + Math.random() * 0.04,
      })
    }

    return particleArray
  })

  const startTimeRef = useRef<number>(Date.now())

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions to fill screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    // Animation variables
    let animationFrameId: number
    let time = 0

    // Draw a particle
    const drawParticle = (particle: Particle, canvasWidth: number, canvasHeight: number) => {
      const x = (particle.x / 100) * canvasWidth
      const y = (particle.y / 100) * canvasHeight

      ctx.save()
      ctx.globalAlpha = particle.opacity
      ctx.translate(x, y)
      ctx.rotate(particle.rotation)

      if (particle.type === "pollen") {
        // Draw pollen as small yellow circles
        ctx.beginPath()
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = "#fbbf24"
        ctx.fill()
      } else {
        // Draw leaf as small green ellipse
        ctx.beginPath()
        ctx.ellipse(0, 0, particle.size * 1.5, particle.size * 0.8, 0, 0, Math.PI * 2)
        ctx.fillStyle = "#65a30d"
        ctx.fill()
      }

      ctx.restore()
    }

    // Draw a sunflower
    const drawSunflower = (x: number, y: number, scale: number, angle: number, rotation: number, opacity: number) => {
      ctx.save()
      ctx.globalAlpha = opacity

      ctx.translate(x, y)
      ctx.rotate(angle + (rotation * Math.PI) / 180)
      ctx.scale(scale, scale)

      // Draw stem
      ctx.beginPath()
      ctx.moveTo(0, 0)
      ctx.lineTo(0, 120)
      ctx.lineWidth = 3
      ctx.strokeStyle = "#4d7c0f"
      ctx.stroke()

      // Draw leaves
      ctx.save()
      ctx.translate(0, 40)
      ctx.rotate(-Math.PI / 6)
      ctx.beginPath()
      ctx.ellipse(-12, 0, 16, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#4d7c0f"
      ctx.fill()
      ctx.restore()

      ctx.save()
      ctx.translate(0, 80)
      ctx.rotate(Math.PI / 6)
      ctx.beginPath()
      ctx.ellipse(12, 0, 16, 8, 0, 0, Math.PI * 2)
      ctx.fillStyle = "#4d7c0f"
      ctx.fill()
      ctx.restore()

      // Draw petals
      for (let i = 0; i < 14; i++) {
        const petalAngle = (i / 14) * Math.PI * 2
        ctx.save()
        ctx.rotate(petalAngle)
        ctx.beginPath()
        ctx.ellipse(18, 0, 22, 7, 0, 0, Math.PI * 2)
        ctx.fillStyle = "#facc15"
        ctx.fill()
        ctx.restore()
      }

      // Draw center
      ctx.beginPath()
      ctx.arc(0, 0, 16, 0, Math.PI * 2)
      ctx.fillStyle = "#92400e"
      ctx.fill()

      // Draw seeds
      for (let i = 0; i < 5; i++) {
        const seedAngle = (i / 5) * Math.PI * 2
        ctx.save()
        ctx.rotate(seedAngle)
        for (let j = 0; j < 3; j++) {
          ctx.beginPath()
          ctx.arc(0, 4 + j * 2.5, 1.2, 0, Math.PI * 2)
          ctx.fillStyle = "#422006"
          ctx.fill()
        }
        ctx.restore()
      }

      ctx.restore()
    }

    // Animation loop
    const animate = () => {
      const currentTime = Date.now() - startTimeRef.current
      time += 0.01
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Draw sky gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, "#dbeafe") // blue-100
      gradient.addColorStop(0.7, "#bfdbfe") // blue-200
      gradient.addColorStop(1, "#93c5fd") // blue-300
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Update and draw particles
      particles.forEach((particle) => {
        // Update particle position
        particle.x += particle.vx * 0.1
        particle.y += particle.vy * 0.1
        particle.rotation += particle.rotationSpeed

        // Wrap particles around screen
        if (particle.x > 105) particle.x = -5
        if (particle.x < -5) particle.x = 105
        if (particle.y > 105) particle.y = -5
        if (particle.y < -5) particle.y = 105

        drawParticle(particle, canvas.width, canvas.height)
      })

      // Draw each sunflower with animation
      sunflowers.forEach((sunflower) => {
        const timeSinceAppear = currentTime - sunflower.appearTime

        if (timeSinceAppear >= 0) {
          // Smooth fade-in and scale-up over 800ms
          const animationDuration = 800
          const progress = Math.min(1, timeSinceAppear / animationDuration)
          const easeOutCubic = 1 - Math.pow(1 - progress, 3)

          const opacity = easeOutCubic
          const appearProgress = easeOutCubic

          if (opacity > 0) {
            const angle = Math.sin(time + sunflower.phase) * sunflower.amplitude
            const xPos = (sunflower.x / 100) * canvas.width
            const yPos = (sunflower.y / 100) * canvas.height
            const animatedScale = sunflower.scale * (0.3 + 0.7 * appearProgress)

            drawSunflower(xPos, yPos, animatedScale, angle, sunflower.rotation, opacity)
          }
        }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Start animation
    animate()

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, []) // Empty dependency array - no state updates inside

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
