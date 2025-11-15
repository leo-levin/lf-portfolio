// Grid system configuration
export const GRID_CONFIG = {
  cellWidth: 80,
  cellHeight: 60,
  gutter: 20,
  marginTop: 20,
  marginLeft: 20,
}

// Calculate position for a given cell coordinate
export const getCellPosition = (col, row) => {
  const left = GRID_CONFIG.marginLeft + (col - 1) * (GRID_CONFIG.cellWidth + GRID_CONFIG.gutter)
  const top = GRID_CONFIG.marginTop + (row - 1) * (GRID_CONFIG.cellHeight + GRID_CONFIG.gutter)
  return { left, top }
}

// Calculate dimensions when spanning multiple cells
export const getSpanDimensions = (colSpan, rowSpan) => {
  const width = colSpan * GRID_CONFIG.cellWidth + (colSpan - 1) * GRID_CONFIG.gutter
  const height = rowSpan * GRID_CONFIG.cellHeight + (rowSpan - 1) * GRID_CONFIG.gutter
  return { width, height }
}
