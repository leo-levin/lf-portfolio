import { useRef, useState, useEffect, useImperativeHandle, forwardRef } from 'react'
import GridItem from './GridItem'
import './ProjectCarousel.css'

const ProjectCarousel = forwardRef(({ items, titleRow, rightColumn, isMobile = false, isVisible, waitForCloud, onIndexChange, onNavRowCalculated }, ref) => {
  const carouselRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const wasVisibleRef = useRef(isVisible)

  // Calculate carousel dimensions (always square in grid units)
  // Check both viewport width and height to determine max grid size

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1000
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 1000

  // Account for margins - carousel needs to fit in viewport with some padding
  const horizontalPadding = 40 // Left margin + some right space
  const verticalPadding = 280 // Top space + bottom space (generous for headers/footers)

  // Available space for carousel in viewport
  const availableWidth = viewportWidth - horizontalPadding
  const availableHeight = viewportHeight - verticalPadding

  // Calculate max grid cells that fit in each dimension
  // Formula: solve for n in: n * cellSize + (n-1) * gap <= available
  // For columns: n * 80 + (n-1) * 20 <= availableWidth → n * 100 - 20 <= availableWidth → n <= (availableWidth + 20) / 100
  // For rows: n * 60 + (n-1) * 20 <= availableHeight → n * 80 - 20 <= availableHeight → n <= (availableHeight + 20) / 80
  const maxColumnsFromWidth = Math.floor((availableWidth + 20) / 100)
  const maxRowsFromHeight = Math.floor((availableHeight + 20) / 80)

  // Take minimum of: width constraint, height constraint, and available columns
  // On mobile, ignore rightColumn constraint to maximize carousel width
  const maxAvailableColumns = Math.floor(rightColumn - 1)
  const carouselGridSize = isMobile
    ? Math.max(3, Math.min(maxColumnsFromWidth, maxRowsFromHeight))  // Mobile: min 3×3, maximize width
    : Math.max(1, Math.min(maxColumnsFromWidth, maxRowsFromHeight, maxAvailableColumns))

  const carouselColSpan = carouselGridSize
  const carouselRowSpan = carouselGridSize

  // Expose scrollToIndex method to parent
  useImperativeHandle(ref, () => ({
    scrollToIndex: (index) => {
      const carousel = carouselRef.current
      if (!carousel) return

      if (isMobile) {
        // Horizontal scroll on mobile
        const itemWidth = carousel.scrollWidth / items.length
        carousel.scrollTo({
          left: index * itemWidth,
          behavior: 'smooth'
        })
      } else {
        // Vertical scroll on desktop
        const itemHeight = carousel.scrollHeight / items.length
        carousel.scrollTo({
          top: index * itemHeight,
          behavior: 'smooth'
        })
      }
    }
  }), [items.length, isMobile])

  // Handle scroll to update active index
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    const handleScroll = () => {
      let newIndex
      if (isMobile) {
        // Horizontal scroll on mobile
        const scrollPosition = carousel.scrollLeft
        const itemWidth = carousel.scrollWidth / items.length
        newIndex = Math.round(scrollPosition / itemWidth)
      } else {
        // Vertical scroll on desktop
        const scrollPosition = carousel.scrollTop
        const itemHeight = carousel.scrollHeight / items.length
        newIndex = Math.round(scrollPosition / itemHeight)
      }

      if (newIndex !== activeIndex) {
        setActiveIndex(newIndex)
        onIndexChange?.(newIndex)
      }
    }

    carousel.addEventListener('scroll', handleScroll)
    return () => carousel.removeEventListener('scroll', handleScroll)
  }, [items.length, activeIndex, onIndexChange, isMobile])

  // Prevent page scroll when cursor is over carousel
  const handleWheel = (e) => {
    e.stopPropagation()
  }

  // Calculate carousel dimensions based on grid cells
  // Grid cells: 80px wide × 60px tall, with 20px gaps
  // Width: n columns × 80px + (n-1) gaps × 20px
  // Height: n rows × 60px + (n-1) gaps × 20px
  const carouselWidth = carouselGridSize * 80 + (carouselGridSize - 1) * 20
  const carouselHeight = carouselGridSize * 60 + (carouselGridSize - 1) * 20

  // Calculate nav column based on carousel width
  // Each column is 80px + 20px gap = 100px
  const navColumn = Math.ceil(carouselWidth / 100) + 1

  // Notify parent of nav position
  // On mobile, carousel is two rows below (titleRow + 5 instead of + 3)
  const carouselRow = isMobile ? titleRow + 5 : titleRow + 3
  // Nav should be one row below carousel (carousel row + carousel span)
  const navRow = isMobile ? carouselRow + carouselRowSpan : carouselRow
  const navCol = isMobile ? 1 : navColumn
  useEffect(() => {
    onNavRowCalculated?.({ row: navRow, column: navCol })
  }, [navRow, navCol, onNavRowCalculated])

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
      row={carouselRow}
      colSpan={carouselColSpan}
      rowSpan={carouselRowSpan}
      align="top-left"
      style={{ width: `${carouselWidth}px`, height: `${carouselHeight}px` }}
    >
      <div
        ref={carouselRef}
        className={`project-carousel ${!isVisible ? 'hidden' : ''} ${waitForCloud ? 'wait-for-cloud' : ''}`}
        onWheel={handleWheel}
        style={{ height: `${carouselHeight}px` }}
      >
        {items.map((color, index) => (
          <div
            key={index}
            className="carousel-item"
            style={{
              backgroundColor: color,
              height: `${carouselHeight}px`,
              minHeight: `${carouselHeight}px`
            }}
          />
        ))}
      </div>
    </GridItem>
  )
})

ProjectCarousel.displayName = 'ProjectCarousel'

export default ProjectCarousel
