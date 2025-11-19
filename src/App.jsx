import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollToPlugin } from 'gsap/ScrollToPlugin'
import Grid from './Grid'
import GridItem from './GridItem'
import GridContainer from './GridContainer'
import ScrollSnapPoints from './ScrollSnapPoints'
import DotCloudCanvas from './DotCloudCanvas'
import CustomCursor from './CustomCursor'
import ProjectCarousel from './ProjectCarousel'
import CarouselNavigation from './CarouselNavigation'
import { useViewportColumns } from './useViewportColumns'
import './App.css'

gsap.registerPlugin(ScrollToPlugin)

// Layout constants
const MOBILE_BREAKPOINT = 880 // Layout changes at this width
const MOBILE_INTERACTIVITY_BREAKPOINT = 640 // Graph becomes non-interactive below this
const GRID_CELL_HEIGHT = 80
const MOBILE_PROJECT_OFFSET_ROWS = 20
const SCROLL_DEBOUNCE_MS = 150
const PROJECT_SNAP_THRESHOLD = 1.5

// Scroll threshold constants
const HOMEPAGE_SCROLL_THRESHOLD_DESKTOP = 100
const HOMEPAGE_SCROLL_THRESHOLD_MOBILE = 100 // Graph starts collapsing after scrolling past 100px
const CONTENT_VISIBILITY_THRESHOLD_MOBILE = 600

// Helper functions
const scrollToRow = (scrollY) => (scrollY + GRID_CELL_HEIGHT) / GRID_CELL_HEIGHT

const findClosestProject = (scrollRow, projects, mobileProjectOffset) => {
  let closestProject = null
  let closestDistance = Infinity

  projects.forEach(project => {
    if (project.carousel) {
      const adjustedTitleRow = project.titleRow + mobileProjectOffset
      const distance = Math.abs(adjustedTitleRow - scrollRow)
      if (distance < closestDistance) {
        closestDistance = distance
        closestProject = project.id
      }
    }
  })

  return { closestProject, closestDistance }
}

const isAtProjectPage = (closestDistance) => closestDistance < PROJECT_SNAP_THRESHOLD

const isOnHomepage = (scrollY, isMobile) => {
  const threshold = isMobile ? HOMEPAGE_SCROLL_THRESHOLD_MOBILE : HOMEPAGE_SCROLL_THRESHOLD_DESKTOP
  return scrollY < threshold
}

const shouldShowHomepageContent = (scrollY, isMobile) => {
  const threshold = isMobile ? CONTENT_VISIBILITY_THRESHOLD_MOBILE : 0
  return scrollY >= threshold
}

function App() {
  const { rightColumn, bottomRow } = useViewportColumns()
  const whiteDotRef = useRef(null)
  const dotCloudRef = useRef(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < MOBILE_BREAKPOINT : false)

  // Mobile/stacked orientation detection - based on column count, not just width
  useEffect(() => {
    const checkMobile = () => {
      // Stacked orientation when: narrow width OR few columns available
      const isStacked = window.innerWidth < MOBILE_BREAKPOINT || rightColumn <= 6n
      setIsMobile(isStacked)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [rightColumn])

  // Mobile offset for projects - pushes first project below Work section
  const mobileProjectOffset = isMobile ? MOBILE_PROJECT_OFFSET_ROWS : 0

  // Project data - easy to add/edit projects
  const projects = [
    // THEORY PROJECTS
    {
      id: 'modular-forms',
      title: 'Modular Forms',
      description: `Exploring the theory of modular forms and their applications in number theory.`,
      titleRow: bottomRow * 2,
      carousel: {
        items: ['#2C3E50', '#34495E', '#7F8C8D', '#95A5A6', '#BDC3C7', '#ECF0F1']
      }
    },
    {
      id: 'weft-lang',
      title: 'WEFT Language',
      description: `A media-agnostic creative coding language for generative art and interactive experiences.`,
      titleRow: bottomRow * 3,
      carousel: {
        items: ['#8E44AD', '#9B59B6', '#BB8FCE', '#D7BDE2', '#E8DAEF', '#F4ECF7']
      }
    },
    {
      id: 'weft-runtime',
      title: 'WEFT Runtime',
      description: `Runtime environment and interpreter for the WEFT creative coding language.`,
      titleRow: bottomRow * 4,
      carousel: {
        items: ['#16A085', '#1ABC9C', '#48C9B0', '#76D7C4', '#A3E4D7', '#D1F2EB']
      }
    },
    // VISUALS PROJECTS
    {
      id: 'apple-music',
      title: 'Apple Music Club Radio',
      description: `Visual design and branding for Apple Music's club radio streaming platform.`,
      titleRow: bottomRow * 5,
      carousel: {
        items: ['#E74C3C', '#EC7063', '#F1948A', '#F5B7B1', '#FADBD8', '#FDEDEC']
      }
    },
    {
      id: 'apple-music-studios',
      title: 'Apple Music Studios',
      description: `Studio recording spaces and production facilities for Apple Music artists.`,
      titleRow: bottomRow * 6,
      carousel: {
        items: ['#3498DB', '#5DADE2', '#85C1E2', '#AED6F1', '#D6EAF8', '#EBF5FB']
      }
    },
    {
      id: 'touchdesigner',
      title: 'TouchDesigner',
      description: `Real-time interactive multimedia installations and visual performances.`,
      titleRow: bottomRow * 7,
      carousel: {
        items: ['#F39C12', '#F8C471', '#FAD7A0', '#FCE5CD', '#FEF5E7', '#FFFBF0']
      }
    },
    // ENGINEERING PROJECTS
    {
      id: 'photoshop-tools',
      title: 'Photoshop Tools',
      description: `Custom plugins and automation tools for Adobe Photoshop.`,
      titleRow: bottomRow * 8,
      carousel: {
        items: ['#27AE60', '#52BE80', '#7DCEA0', '#A9DFBF', '#D5F4E6', '#EAFAF1']
      }
    },
    {
      id: 'televisa',
      title: 'Televisa',
      description: `Broadcast graphics and motion design for Latin American television.`,
      titleRow: bottomRow * 9,
      carousel: {
        items: ['#E67E22', '#EB984E', '#F0B27A', '#F5CBA7', '#FAE5D3', '#FDF2E9']
      }
    }
  ]

  // Carousel state - initialize based on scroll position
  const [isCloudExpanded, setIsCloudExpanded] = useState(() => {
    if (typeof window === 'undefined') return true
    const scrollY = window.scrollY || window.pageYOffset
    // Use simple width check for initialization
    const threshold = window.innerWidth < MOBILE_BREAKPOINT ? HOMEPAGE_SCROLL_THRESHOLD_MOBILE : HOMEPAGE_SCROLL_THRESHOLD_DESKTOP
    return scrollY < threshold // Expanded only if on homepage
  })
  const [currentProjectId, setCurrentProjectId] = useState(null) // Track which project page we're on
  const [carouselIndices, setCarouselIndices] = useState({})
  const [navPositions, setNavPositions] = useState({}) // Track nav position for each project
  const [showHomepageContent, setShowHomepageContent] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= MOBILE_BREAKPOINT : true
  ) // Homepage content visibility (start hidden on mobile)
  const carouselRefs = useRef({})
  const wasOnHomepageRef = useRef(true) // Track if we were on homepage in previous scroll
  const isCollapsingRef = useRef(false) // Track if cloud is currently collapsing

  // Track scroll position to sync carousel visibility with cloud state and current project
  useEffect(() => {
    let scrollTimeout
    let collapseTimeout

    const handleScroll = () => {
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }

      scrollTimeout = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset
        const scrollRow = scrollToRow(scrollY)

        // Find closest project and calculate distances
        const { closestProject, closestDistance } = findClosestProject(scrollRow, projects, mobileProjectOffset)
        const isAtProject = isAtProjectPage(closestDistance)
        const isHomepage = isOnHomepage(scrollY, isMobile)
        const shouldShowContent = shouldShowHomepageContent(scrollY, isMobile)

        // Reset collapsing flag whenever cloud is expanded
        if (isCloudExpanded) {
          isCollapsingRef.current = false
        }

        // Handle cloud state transitions
        if (isHomepage) {
          if (!isCloudExpanded && dotCloudRef.current) {
            dotCloudRef.current.expandCloud()
          }
          setIsCloudExpanded(true)
          if (isMobile && !shouldShowContent) setShowHomepageContent(false)
        } else {
          // Not on homepage - collapse cloud
          if (isCloudExpanded && !isCollapsingRef.current) {
            isCollapsingRef.current = true
            if (dotCloudRef.current) {
              dotCloudRef.current.collapseCloud()
            }
          }
          setIsCloudExpanded(false)
        }

        // Handle homepage content visibility (mobile)
        if (isMobile && shouldShowContent) {
          setShowHomepageContent(true)
        }

        // Update current project tracking
        if (isAtProject) {
          if (closestProject !== currentProjectId) {
            setCurrentProjectId(closestProject)
          }
          wasOnHomepageRef.current = false
        } else {
          setCurrentProjectId(null)
          wasOnHomepageRef.current = true
        }
      }, SCROLL_DEBOUNCE_MS)
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (scrollTimeout) {
        clearTimeout(scrollTimeout)
      }
      if (collapseTimeout) {
        clearTimeout(collapseTimeout)
      }
    }
  }, [bottomRow]) // eslint-disable-line react-hooks/exhaustive-deps

  const textStyle = {
    fontSize: '20',
    lineHeight: '20px',
    userSelect: 'text',
    WebkitUserSelect: 'text',
    MozUserSelect: 'text'
  }

  // White dot pulsing animation
  useEffect(() => {
    if (whiteDotRef.current) {
      gsap.to(whiteDotRef.current, {
        opacity: 0.3,
        duration: 0.5,
        yoyo: true,
        repeat: -1,
        repeatDelay: 0.1,
        ease: 'power1.inOut'
      })
    }
  }, [])

  // Toggle cloud expand/collapse
  const handleWhiteDotClick = () => {
    if (dotCloudRef.current) {
      if (dotCloudRef.current.isExpanded) {
        dotCloudRef.current.collapseCloud()
        setIsCloudExpanded(false)
      } else {
        isCollapsingRef.current = false
        dotCloudRef.current.expandCloud()
        setIsCloudExpanded(true)
      }
    }
  }

  // Scroll to row 2 (Leo Frankel click)
  const handleNameClick = () => {
    const html = document.documentElement
    const originalScrollSnapType = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    gsap.to(window, {
      scrollTo: GRID_CELL_HEIGHT,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        html.style.scrollSnapType = originalScrollSnapType
      }
    })
  }

  // Scroll to first project (Work click)
  const handleWorkClick = () => {
    const html = document.documentElement
    const originalScrollSnapType = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    const targetPosition = (bottomRow * 2 - 1) * GRID_CELL_HEIGHT

    gsap.to(window, {
      scrollTo: targetPosition,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        html.style.scrollSnapType = originalScrollSnapType
      }
    })
  }

  // Generate snap points for scroll behavior
  const mobileHomepageRows = isMobile ? [11] : []
  const snapRows = [...new Set([2, ...mobileHomepageRows, ...projects.map(p => p.titleRow + mobileProjectOffset)])]

  // Map project IDs to snap point rows for cloud navigation
  const projectSnapPoints = projects.reduce((acc, project) => {
    acc[project.id] = project.titleRow + mobileProjectOffset
    return acc
  }, {})

  return (
    <>a
      {/* Custom cursor */}
      <CustomCursor />

      {/* Visual grid guides - set show={false} to hide in production */}
      <Grid show={false}/>

      {/* Dot Cloud Navigation Canvas */}
      <DotCloudCanvas
        ref={dotCloudRef}
        projectSnapPoints={projectSnapPoints}
        mobileInteractivityBreakpoint={MOBILE_INTERACTIVITY_BREAKPOINT}
        isStackedOrientation={isMobile}
      />

      {/* Scroll snap points for gentle grid alignment */}
      <ScrollSnapPoints snapRows={snapRows} />

      {/* Gray bar behind Leo Frankel header - prevents overlap on scroll (mobile only) */}
      {isMobile && (
        <div style={{
          position: 'fixed',
          left: '0',
          top: '0',
          width: '100%',
          height: '80px',
          background: '#AFAFAF',
          zIndex: 10000
        }} />
      )}

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
          className="resume-link"
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
      <GridContainer className={`${isCloudExpanded ? 'cloud-expanded' : 'cloud-collapsed'} ${isMobile ? 'stacked' : 'sideways'}`}>
        {/* New header - scrolls normally, 3 columns from right */}
        <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+4 : 2} colSpan={isMobile ? 5 : 1} align="bottom-left">
          <div style={{
            fontSize: '20',
            lineHeight: '20px',
            textDecoration: 'underline',
          }}>
            New
          </div>
        </GridItem>

      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+5 : 3} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          ...textStyle,
          wordWrap: 'break-word',
          whiteSpace: 'normal',
          maxWidth: '100%'
        }}>
          Currently working on <a href="https://leo-levin.github.io/weft/public/index.html" target="_blank" rel="noopener noreferrer" className="resume-link">WEFT➚</a>, a media-agnostic creative coding language.
        </div>
        </GridItem>



      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+1 : 5} colSpan={isMobile ? 5 : 1} align="bottom-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          textDecoration: 'underline',
        }}>
          About
        </div>
      </GridItem>

      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+2 : 6} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          wordWrap: 'break-word',
          whiteSpace: 'normal',
          maxWidth: '100%'
        }}>
          I think in systems. Junior at UChicago studying math and CS. Currently designing at <a href="https://www.doralicedoralice.com" target="_blank" rel="noopener noreferrer" className="resume-link">Doralice➚</a><br />
        </div>
      </GridItem>

      {/* Contact header - scrolls normally */}
      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+7 : 8} colSpan={isMobile ? 5 : 1} align="bottom-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          textDecoration: 'underline',
        }}>
          Contact
        </div>
      </GridItem>



      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+8 : 9} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          wordWrap: 'break-word',
          whiteSpace: 'normal',
          maxWidth: '100%'
        }}>
          leolfrankel@gmail.com<br />
          310 463 2774<br />
          <br />
          <a href="/lf-portfolio/Leo%20Frankel%20Resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-link">resume➚</a><br />

                      <a href="https://github.com/leo-levin/" target="_blank" rel="noopener noreferrer" className="resume-link">github➚</a><br />
        </div>
      </GridItem>

      {/* Work - Page 1 */}
      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? bottomRow+10 : bottomRow} colSpan={isMobile ? 5 : 3} align="bottom-left">
        <div
          onClick={handleWorkClick}
          style={{
            fontSize: '20',
            lineHeight: '20px',
            textDecoration: 'underline',
            cursor: 'pointer',
          }}
        >
          Work
        </div>
      </GridItem>

      {/* Project sections - dynamically generated from projects array */}
      {projects.map((project) => {
        const adjustedTitleRow = project.titleRow + mobileProjectOffset
        const elements = [
          /* Project title - 2 rows below snap point */
          <GridItem key={`${project.id}-title`} col={isMobile ? 1 : rightColumn+1} row={adjustedTitleRow + 2} colSpan={isMobile ? 5 : 3} align="bottom-left">
            <div id={project.id} className="project-title" style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
              {project.title}
            </div>
          </GridItem>,

          /* Project description - 1 row below title (3 rows below snap point) */
          <GridItem key={`${project.id}-desc`} col={isMobile ? 1 : rightColumn+1} row={adjustedTitleRow + 3} colSpan={isMobile ? 5 : 3} align="top-left">
            <div className="project-description" style={{ fontSize: '20', lineHeight: '20px' }}>
              {project.description.split('\n').map((line, i) => (
                <span key={i}>
                  {line}
                  {i < project.description.split('\n').length - 1 && <br />}
                </span>
              ))}
            </div>
          </GridItem>
        ]

        // Add carousel if project has carousel data
        if (project.carousel) {
          // All carousels visible together when cloud is collapsed (any project page)
          // All carousels hidden together when cloud is expanded (homepage)
          const isVisible = !isCloudExpanded

          elements.push(
            <ProjectCarousel
              key={`${project.id}-carousel`}
              ref={(el) => (carouselRefs.current[project.id] = el)}
              items={project.carousel.items}
              titleRow={adjustedTitleRow}
              rightColumn={rightColumn}
              isMobile={isMobile}
              isVisible={isVisible}
              onIndexChange={(index) => {
                setCarouselIndices(prev => ({ ...prev, [project.id]: index }))
              }}
              onNavRowCalculated={(navPos) => {
                setNavPositions(prev => ({ ...prev, [project.id]: navPos }))
              }}
            />,
            <CarouselNavigation
              key={`${project.id}-nav`}
              activeIndex={carouselIndices[project.id] || 0}
              itemCount={project.carousel.items.length}
              navRow={navPositions[project.id]?.row || project.titleRow + 3}
              navColumn={navPositions[project.id]?.column || rightColumn}
              rightColumn={rightColumn}
              isVisible={isVisible}
              isMobile={isMobile}
              onCircleClick={(index) => {
                carouselRefs.current[project.id]?.scrollToIndex(index)
              }}
            />
          )
        }

        return elements
      })}

      </GridContainer>

      {/* Add some content to enable scrolling for testing */}
      <div style={{ height: '200px', position: 'relative' }}>
        {/* This creates scrollable space */}
      </div>
    </>
  )
}

export default App
