import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import GridItem from './GridItem'
import './ProjectCarousel.css'

const ProjectCarousel = forwardRef(({ items, titleRow, rightColumn, isVisible, waitForCloud, onIndexChange, onNavRowCalculated }, ref) => {
  const carouselRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const wasVisibleRef = useRef(isVisible)

  // Calculate carousel dimensions (square in grid units)
  const carouselColSpan = rightColumn - 1
  const carouselRowSpan = rightColumn - 1

  // Expose scrollToIndex method to parent
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => {
      const carousel = carouselRef.current
      if (!carousel) return
      const itemHeight = carousel.scrollHeight / items.length
      carousel.scrollTo({
        top: index * itemHeight,
        behavior: 'smooth'
      })
    }
  }), [items.length])

  // Handle scroll to update active index
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleScroll = () => {
      const scrollPosition = carousel.scrollTop
      const itemHeight = carousel.scrollHeight / items.length
      const newIndex = Math.round(scrollPosition / itemHeight)
      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [items.length, activeIndex, onIndexChange])

  // Prevent page scroll when cursor is over carousel
  const handleWheel = (e) => {
    e.stopPropagation()
  }

  // Calculate carousel size: square, based on available width
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000
  const bottomPadding = 180 // Adjusted for proper spacing

  // Carousel is positioned 3 rows below the snap point (titleRow + 3 vs titleRow)
  const carouselTopOffset = 3 * 80 // 240px from top of viewport when snapped

  // Try full available width first (rightColumn - 1 columns)
  let numColumns = carouselColSpan
  let carouselSize = numColumns * 80 + (numColumns - 1) * 20

  // Account for carousel position + height + bottom padding
  const maxHeight = viewportHeight - carouselTopOffset - bottomPadding

  // If that's too tall, try reducing by one column
  if (carouselSize > maxHeight && numColumns > 1) {
    numColumns = carouselColSpan - 1
    carouselSize = numColumns * 80 + (numColumns - 1) * 20
  }

  // Ensure it fits in viewport with proper spacing
  carouselSize = Math.min(carouselSize, maxHeight)

  // Add 160px to width for proper sizing
  const carouselWidth = carouselSize + 160

  // Calculate nav column based on carousel width
  // Each column is 80px + 20px gap = 100px
  const navColumn = Math.ceil(carouselWidth / 100) + 1

  // Notify parent of nav position
  useEffect(() => {
    onNavRowCalculated?.({ row: titleRow + 3, column: navColumn })
  }, [titleRow, navColumn, onNavRowCalculated])

  // Keep carousel at top when hidden, so it's already there when fading in
  useEffect(() => {
    if (!isVisible && carouselRef.current) {
      // Wait for fade-out animation to complete (0.2s) before resetting
      const resetTimeout = setTimeout(() => {
        if (carouselRef.current) {
          carouselRef.current.scrollTop = 0
          setActiveIndex(0)
        }
      }, 200)

      return () => clearTimeout(resetTimeout)
    }
  }, [isVisible])

  // Track visibility changes
  useEffect(() => {
    wasVisibleRef.current = isVisible
  }, [isVisible])

  return (
    <GridItem
      col={1}
      row={titleRow + 3}
      colSpan={carouselColSpan}
      rowSpan={carouselRowSpan}
      align="top-left"
      style={{ width: `${carouselWidth}px`, height: `${carouselSize}px` }}
    >
      <div
        ref={carouselRef}
        className={`project-carousel ${!isVisible ? 'hidden' : ''} ${waitForCloud ? 'wait-for-cloud' : ''}`}
        onWheel={handleWheel}
        style={{ height: `${carouselSize}px` }}
      >
        {items.map((color, index) => (
          <div
            key={index}
            className="carousel-item"
            style={{
              backgroundColor: color,
              height: `${carouselSize}px`,
              minHeight: `${carouselSize}px`
            }}
          />
        ))}
      </div>
    </GridItem>
  )
})

ProjectCarousel.displayName = 'ProjectCarousel'

export default ProjectCarousel
