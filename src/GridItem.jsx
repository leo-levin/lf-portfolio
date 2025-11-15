import './GridItem.css'

/**
 * GridItem - Position content on the grid system using CSS Grid
 *
 * @param {number} col - Column position (1-based)
 * @param {number} row - Row position (1-based)
 * @param {number} colSpan - Number of columns to span (default: 1)
 * @param {number} rowSpan - Number of rows to span (default: 1)
 * @param {string} align - Alignment within cell: 'top-left', 'top-center', 'top-right',
 *                         'center-left', 'center', 'center-right',
 *                         'bottom-left', 'bottom-center', 'bottom-right' (default: 'top-left')
 * @param {string} className - Additional CSS classes
 * @param {object} style - Additional inline styles
 * @param {ReactNode} children - Content to render
 */
function GridItem({
  col = 1,
  row = 1,
  colSpan = 1,
  rowSpan = 1,
  align = 'top-left',
  className = '',
  style = {},
  children
}) {
  // Parse alignment
  const [vAlign, hAlign] = align.split('-')

  // Convert to CSS Grid alignment
  const alignSelf = vAlign === 'top' ? 'start' : vAlign === 'bottom' ? 'end' : 'center'
  const justifySelf = hAlign === 'left' ? 'start' : hAlign === 'right' ? 'end' : 'center'

  const itemStyle = {
    gridColumn: `${col} / span ${colSpan}`,
    gridRow: `${row} / span ${rowSpan}`,
    alignSelf,
    justifySelf,
    ...style,
  }

  return (
    <div
      className={`grid-item ${className}`}
      style={itemStyle}
    >
      {children}
    </div>
  )
}

export default GridItem
