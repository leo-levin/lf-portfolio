import { useState, useEffect } from 'react'
import { GRID_CONFIG } from './gridConfig'

/**
 * Hook to calculate which column/row is 3 full cells from the edge
 */
export function useViewportColumns() {
  const [rightColumn, setRightColumn] = useState(1)
  const [bottomRow, setBottomRow] = useState(1)

  useEffect(() => {
    const calculate = () => {
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // Calculate columns: how many full columns fit in viewport
      // Formula: (viewportWidth - marginLeft + gutter) / (cellWidth + gutter)
      // We add one gutter because we allow one less gutter on the right
      const availableWidth = viewportWidth - GRID_CONFIG.marginLeft + GRID_CONFIG.gutter
      const columnsInViewport = Math.floor(availableWidth / (GRID_CONFIG.cellWidth + GRID_CONFIG.gutter))

      // Column that's 3 full columns from the right
      const column = Math.max(1, columnsInViewport - 3)

      // Calculate rows: how many FULL rows fit in viewport
      // We need to ensure the entire cell bottom edge is visible
      // Last row bottom: marginTop + (n-1)*(cellHeight+gutter) + cellHeight <= viewportHeight
      // Solving: n <= (viewportHeight - marginTop - cellHeight) / (cellHeight + gutter) + 1
      const availableForFullRows = viewportHeight - GRID_CONFIG.marginTop - GRID_CONFIG.cellHeight
      const rowsInViewport = Math.floor(availableForFullRows / (GRID_CONFIG.cellHeight + GRID_CONFIG.gutter)) + 1

      // The last FULLY visible row
      const row = Math.max(1, rowsInViewport)

      setRightColumn(column)
      setBottomRow(row)
    }

    calculate()
    window.addEventListener('resize', calculate)

    return () => window.removeEventListener('resize', calculate)
  }, [])

  return { rightColumn, bottomRow }
}
