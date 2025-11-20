import { useEffect, useRef, useState } from 'react'
import './CustomCursor.css'

function CustomCursor() {
  const cursorRef = useRef(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const currentPositionRef = useRef({ x: 0, y: 0 })
  const [cursorState, setCursorState] = useState('default') // 'default', 'link', 'text'

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    // Track mouse position and detect hover state
    const handleMouseMove = (e) => {
      positionRef.current = { x: e.clientX, y: e.clientY }

      // Check what element is being hovered
      const target = e.target

      // Check for links or clickable elements
      const isLink = target.tagName === 'A' ||
                     target.classList.contains('resume-link') ||
                     target.classList.contains('project-title') ||
                     target.style.cursor === 'pointer' ||
                     target.onclick !== null

      // Check for text selection areas (optional)
      const isTextArea = target.tagName === 'INPUT' ||
                        target.tagName === 'TEXTAREA' ||
                        target.classList.contains('text-card-body')

      if (isLink) {
        setCursorState('link')
      } else if (isTextArea) {
        setCursorState('text')
      } else {
        setCursorState('default')
      }
    }

    // Smooth cursor movement with requestAnimationFrame
    const animate = () => {
      const dx = positionRef.current.x - currentPositionRef.current.x
      const dy = positionRef.current.y - currentPositionRef.current.y

      // Lerp for smooth following (higher value = less lag)
      currentPositionRef.current.x += dx * 0.35
      currentPositionRef.current.y += dy * 0.35

      // Center the cursor by subtracting half its current size
      const rect = cursor.getBoundingClientRect()
      const offsetX = rect.width / 2
      const offsetY = rect.height / 2

      cursor.style.transform = `translate(${currentPositionRef.current.x - offsetX}px, ${currentPositionRef.current.y - offsetY}px)`

      requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', handleMouseMove)
    const animationId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className={`custom-cursor ${cursorState}`}
    />
  )
}

export default CustomCursor
