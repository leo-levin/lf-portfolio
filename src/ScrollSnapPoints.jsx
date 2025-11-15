import { GRID_CONFIG } from './gridConfig'
import './ScrollSnapPoints.css'

/**
 * ScrollSnapPoints - Creates invisible snap points at specified rows
 * This enables smooth scroll snapping to grid rows
 */
function ScrollSnapPoints({ snapRows = [1] }) {
  const snapPoints = []

  for (const rowNum of snapRows) {
    // Calculate position: account for 20px margin, so each row snaps with margin visible
    // Row 1 at 0px, Row 11 at 800px (10 rows × 80px)
    const top = (rowNum - 1) * (GRID_CONFIG.cellHeight + GRID_CONFIG.gutter)

    snapPoints.push(
      <div
        key={rowNum}
        className="scroll-snap-point"
        style={{ top: `${top}px` }}
      />
    )
  }

  return <>{snapPoints}</>
}

export default ScrollSnapPoints
