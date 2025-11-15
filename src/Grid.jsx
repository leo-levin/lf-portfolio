import './Grid.css'

function Grid({ show = true }) {
  // Don't render if show is false
  if (!show) return null

  // Generate enough cells to fill the grid (100 columns × many rows)
  // Cells that extend beyond viewport will be cut off
  const totalCells = 100 * 100 // 100 columns × 100 rows
  const cells = []

  for (let i = 0; i < totalCells; i++) {
    cells.push(
      <div key={i} className="grid-cell"></div>
    )
  }

  return (
    <div className="grid-container">
      {cells}
    </div>
  )
}

export default Grid
