import { GRID_CONFIG } from './gridConfig'
import './GridContainer.css'

/**
 * GridContainer - Main grid layout container
 * Uses CSS Grid instead of absolute positioning for better text selection
 */
function GridContainer({ children, className = '' }) {
  return (
    <div className={`grid-layout-container ${className}`}>
      {children}
    </div>
  )
}

export default GridContainer
