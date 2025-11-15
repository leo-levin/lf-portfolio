import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Grid from './Grid'
import GridItem from './GridItem'
import GridContainer from './GridContainer'
import ScrollSnapPoints from './ScrollSnapPoints'
import DotCloudCanvas from './DotCloudCanvas'
import { useViewportColumns } from './useViewportColumns'
import './App.css'

gsap.registerPlugin(ScrollToPlugin)

function App() {
  const { rightColumn, bottomRow } = useViewportColumns()
  const whiteDotRef = useRef(null)
  const dotCloudRef = useRef(null)

  // Base text style with selection enabled
  const textStyle = {
    fontSize: '20',
    lineHeight: '20px',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text'
  }

  // Pulsing animation for white dot
  useEffect(() => {
    if (whiteDotRef.current) {
      gsap.to(whiteDotRef.current, {
        opacity: 0.3,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.1, // Hold at brightest point for 0.4s
        ease: 'power1.inOut'
      })
    }
  }, [])

  // Handle white dot click - toggle cloud expand/collapse
  const handleWhiteDotClick = () => {
    if (dotCloudRef.current) {
      if (dotCloudRef.current.isExpanded) {
        dotCloudRef.current.collapseCloud()
      } else {
        dotCloudRef.current.expandCloud()
      }
    }
  }

  // Handle "Leo Frankel" click - scroll to top
  const handleNameClick = () => {
    const html = document.documentElement
    const originalScrollSnapType = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    gsap.to(window, {
      scrollTo: 0,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        html.style.scrollSnapType = originalScrollSnapType
      }
    })
  }

  return (
    <>
      {/* Visual grid guides - set show={false} to hide in production */}
      <Grid show={false} />

      {/* Dot Cloud Navigation Canvas */}
      <DotCloudCanvas ref={dotCloudRef} />

      {/* Scroll snap points for gentle grid alignment */}
      <ScrollSnapPoints snapRows={[0, bottomRow * 2, bottomRow * 3 -  1]} />

      {/* Leo Frankel with white circle - bottom-left of cell 1,1 */}
      <div style={{
        position: 'fixed',
        left: '20px',
        top: '80px',
        transform: 'translateY(-100%)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 10001
      }}>
        <div
          ref={whiteDotRef}
          onClick={handleWhiteDotClick}
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: 'white',
            cursor: 'pointer'
          }}
        />
        <div
          onClick={handleNameClick}
          style={{
            fontSize: '20',
            lineHeight: '20px',
            cursor: 'pointer'
          }}
        >
          Leo Frankel
        </div>

      </div>

      {/* Grid Container - uses CSS Grid instead of absolute positioning */}
      <GridContainer>
        {/* New header - scrolls normally, 3 columns from right */}
        <GridItem col={rightColumn} row={1} align="bottom-left">
          <div style={{
            fontSize: '20',
            lineHeight: '20px',
            textDecoration: 'underline'
          }}>
            New
          </div>
        </GridItem>

      <GridItem col={rightColumn} row={2} colSpan={3} align="top-left">
        <div style={textStyle}>
          Currently working on WEFT➚, <br />
          a media-agnostic creative<br />
          coding language.
        </div>
      </GridItem>

      <GridItem col={rightColumn} row={4} align="bottom-left">
        <div style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
          About
        </div>
      </GridItem>

      <GridItem col={rightColumn} row={5} colSpan={3} align="top-left">
        <div style={{ fontSize: '20', lineHeight: '20px' }}>
          I think in systems. Junior <br />
          at UChicago studying math <br />
          and CS. Currently designing <br />
          at Doralice➚.
        </div>
      </GridItem>

      {/* Contact header - scrolls normally */}
      <GridItem col={rightColumn} row={7} align="bottom-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          textDecoration: 'underline'
        }}>
          Contact
        </div>
      </GridItem>

      <GridItem col={rightColumn} row={8} colSpan={3} align="top-left">
        <div style={{ fontSize: '20', lineHeight: '20px' }}>
          leolfrankel@gmail.com<br />
          310 463 2774<br />
          <br />
          resume➚<br />
          github➚<br />
        </div>
      </GridItem>

      {/* Work - Page 1 */}
      <GridItem col={rightColumn} row={bottomRow} colSpan={3} align="bottom-left">
        <div style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
          Work
        </div>
      </GridItem>

      {/* Apple Music Club Radio - Page 2 */}
      <GridItem col={rightColumn} row={bottomRow * 2} colSpan={3} align="bottom-left">
        <div id="apple-music" style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
          Apple Music Club Radio
        </div>
      </GridItem>
      <GridItem col={rightColumn} row={bottomRow * 2 + 1} colSpan={3} align="top-left">
        <div style={{ fontSize: '20', lineHeight: '20px' }}>
          Lorem ipsum <br />
          at UChicago studying math <br />
          and CS. Currently designing <br />
          at Doralice➚.
        </div>
      </GridItem>

      {/* Televisa - Page 3 */}
      <GridItem col={rightColumn} row={bottomRow * 3 - 1} colSpan={3} align="bottom-left">
        <div id="televisa" style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
          Televisa
        </div>
      </GridItem>
      <GridItem col={rightColumn} row={bottomRow * 3} colSpan={3} align="top-left">
       <div style={{ fontSize: '20', lineHeight: '20px' }}>
          Lorem ipsum <br />
          at UChicago studying math <br />
          and CS. Currently designing <br />
          at Doralice➚.
        </div>
      </GridItem>

      </GridContainer>

      {/* Add some content to enable scrolling for testing */}
      <div style={{ height: '3000px', position: 'relative' }}>
        {/* This creates scrollable space */}
      </div>
    </>
  )
}

export default App
