import { useEffect, useRef } from 'react'
import './CustomCursor.css'

function CustomCursor() {
  const cursorRef = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Track mouse position
    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY }
    }

    // Smooth cursor movement with requestAnimationFrame
    const animate = () => {
      const dx = positionRef.current.x - currentPositionRef.current.x
      const dy = positionRef.current.y - currentPositionRef.current.y

      // Lerp for smooth following
      currentPositionRef.current.x += dx * 0.15
      currentPositionRef.current.y += dy * 0.15

      // Center the 12px cursor by subtracting 6px (half the size)
      cursor.style.transform = `translate(${currentPositionRef.current.x - 6}px, ${currentPositionRef.current.y - 6}px)`

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return <div ref={cursorRef} className="custom-cursor" />
}

export default CustomCursor
