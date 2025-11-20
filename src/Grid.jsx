import './Grid.css'

function Grid({ show = true }) {
  // Don't render if show is false
  if (!show) return null

  // CSS background pattern handles the dots - no DOM elements needed!
  return <div className="grid-container" />
}

export default Grid
