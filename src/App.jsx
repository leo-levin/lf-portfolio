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

function App() {
  const { rightColumn, bottomRow } = useViewportColumns()
  const whiteDotRef = useRef(null)
  const dotCloudRef = useRef(null)
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' ? window.innerWidth < 880 : false)

  // Mobile detection (< 880px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 880)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile offset for projects - pushes first project below Work section
  const mobileProjectOffset = isMobile ? 20 : 0

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

  // Carousel state
  const [isCloudExpanded, setIsCloudExpanded] = useState(true) // Start as true (homepage)
  const [currentProjectId, setCurrentProjectId] = useState(null) // Track which project page we're on
  const [shouldWaitForCloud, setShouldWaitForCloud] = useState(true) // Track if carousel should wait for cloud
  const [carouselIndices, setCarouselIndices] = useState({})
  const [navPositions, setNavPositions] = useState({}) // Track nav position for each project
  const [showHomepageContent, setShowHomepageContent] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 880 : true
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
        const scrollRow = (scrollY + 80) / 80 // Convert scroll position to row number

        // Find the project whose titleRow is closest to current scroll position
        let closestProject = null
        let closestDistance = Infinity

        projects.forEach(project => {
          if (project.carousel) {
            // Use adjusted titleRow that accounts for mobile offset
            const adjustedTitleRow = project.titleRow + mobileProjectOffset
            const distance = Math.abs(adjustedTitleRow - scrollRow)
            if (distance < closestDistance) {
              closestDistance = distance
              closestProject = project.id
            }
          }
        })

        // Check if we're at a project page (close to snap point)
        const isAtProject = closestDistance < 1.5

        // Determine if we should be on homepage (far from all projects)
        // Mobile: use row 14 threshold (1040px), Desktop: use 100px
        const homepageThreshold = isMobile ? 1040 : 100
        const isHomepage = scrollY < homepageThreshold

        // Separate threshold for showing homepage content (earlier than snap point)
        // On mobile, show content when scrolling past row 12 (880px) - when cloud starts collapsing
        const contentThreshold = isMobile ? 880 : 0
        const shouldShowContent = scrollY >= contentThreshold

        // Reset collapsing flag whenever cloud is expanded
        if (isCloudExpanded) {
          isCollapsingRef.current = false
        }

        if (isHomepage) {
          // On homepage, keep cloud expanded and hide content
          if (!isCloudExpanded && dotCloudRef.current) {
            dotCloudRef.current.expandCloud()
          }
          setIsCloudExpanded(true)
          if (isMobile && !shouldShowContent) setShowHomepageContent(false)
        } else if (isAtProject && isCloudExpanded && !isCollapsingRef.current) {
          // At a project page - collapse immediately (only once)
          isCollapsingRef.current = true
          if (dotCloudRef.current) {
            dotCloudRef.current.collapseCloud()
          }
          setIsCloudExpanded(false)
        }

        // Show homepage content when past threshold (on mobile)
        if (isMobile && shouldShowContent) {
          setShowHomepageContent(true)
        }
        // Don't do anything if we're between pages (scrolling)

        // Determine which project we're currently viewing
        if (isAtProject) {

          // Update state only when changing to a different project
          if (closestProject !== currentProjectId) {
            // Should wait for cloud only if we were on homepage before
            setShouldWaitForCloud(wasOnHomepageRef.current)
            setCurrentProjectId(closestProject)
          }

          // Update ref - we're no longer on homepage
          wasOnHomepageRef.current = false
        } else {
          setCurrentProjectId(null)
          setShouldWaitForCloud(true)
          wasOnHomepageRef.current = true // We're on homepage
        }
      }, 150)
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
        // When manually collapsing cloud, carousel should wait for animation
        setShouldWaitForCloud(true)
        dotCloudRef.current.collapseCloud()
        setIsCloudExpanded(false)
      } else {
        // When expanding cloud, reset collapsing flag so it can collapse again later
        isCollapsingRef.current = false
        dotCloudRef.current.expandCloud()
        setIsCloudExpanded(true)
      }
    }
  }

  // Handle "Leo Frankel" click - scroll to row 2
  const handleNameClick = () => {
    const html = document.documentElement
    const originalScrollSnapType = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    gsap.to(window, {
      scrollTo: 80,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        html.style.scrollSnapType = originalScrollSnapType
      }
    })
  }

  // Handle "Work" click - scroll to first project section
  const handleWorkClick = () => {
    // Scroll to the snap point position (not the element position)
    // The snap point is 2 rows above where the actual content starts
    const html = document.documentElement
    const originalScrollSnapType = html.style.scrollSnapType
    html.style.scrollSnapType = 'none'

    // Calculate scroll position based on grid rows (grid rows start at 1, so subtract 1)
    const targetPosition = (bottomRow * 2 - 1) * 80

    gsap.to(window, {
      scrollTo: targetPosition,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        html.style.scrollSnapType = originalScrollSnapType
      }
    })
  }

  // Generate snap points from project title rows (ensure unique)
  // Generate snap points - on mobile, add ONE snap for homepage content
  const mobileHomepageRows = isMobile ? [14] : []  // Single snap for New/About/Contact
  const snapRows = [...new Set([2, ...mobileHomepageRows, ...projects.map(p => p.titleRow + mobileProjectOffset)])]

  // Create mapping of project id -> snap point row for cloud navigation
  const projectSnapPoints = projects.reduce((acc, project) => {
    acc[project.id] = project.titleRow + mobileProjectOffset
    return acc
  }, {})

  return (
    <>
      {/* Custom cursor */}
      <CustomCursor />

      {/* Visual grid guides - set show={false} to hide in production */}
      <Grid show={true}/>

      {/* Dot Cloud Navigation Canvas */}
      <DotCloudCanvas ref={dotCloudRef} projectSnapPoints={projectSnapPoints} />

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
      <GridContainer>
        {/* New header - scrolls normally, 3 columns from right */}
        <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 15 : 2} colSpan={isMobile ? 5 : 1} align="bottom-left">
          <div style={{
            fontSize: '20',
            lineHeight: '20px',
            textDecoration: 'underline',
            opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
            transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
          }}>
            New
          </div>
        </GridItem>

      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 16 : 3} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          ...textStyle,
          opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
          transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
        }}>
          Currently working on <a href="https://leo-levin.github.io/weft/public/index.html" target="_blank" rel="noopener noreferrer" className="resume-link">WEFT➚</a>, a media-agnostic creative coding language.
        </div>
        </GridItem>



      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 18 : 5} colSpan={isMobile ? 5 : 1} align="bottom-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          textDecoration: 'underline',
          opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
          transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
        }}>
          About
        </div>
      </GridItem>

      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 19 : 6} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
          transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
        }}>
          I think in systems. Junior at UChicago studying math and CS. Currently designing at <a href="https://www.doralicedoralice.com" target="_blank" rel="noopener noreferrer" className="resume-link">Doralice➚</a><br />
        </div>
      </GridItem>

      {/* Contact header - scrolls normally */}
      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 21 : 8} colSpan={isMobile ? 5 : 1} align="bottom-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          textDecoration: 'underline',
          opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
          transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
        }}>
          Contact
        </div>
      </GridItem>



      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 22 : 9} colSpan={isMobile ? 5 : 3} align="top-left">
        <div style={{
          fontSize: '20',
          lineHeight: '20px',
          opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
          transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
        }}>
          leolfrankel@gmail.com<br />
          310 463 2774<br />
          <br />
          <a href="/lf-portfolio/Leo%20Frankel%20Resume.pdf" target="_blank" rel="noopener noreferrer" className="resume-link">resume➚</a><br />

                      <a href="https://github.com/leo-levin/" target="_blank" rel="noopener noreferrer" className="resume-link">github➚</a><br />
        </div>
      </GridItem>

      {/* Work - Page 1 */}
      <GridItem col={isMobile ? 1 : rightColumn+1} row={isMobile ? 24 : bottomRow} colSpan={isMobile ? 5 : 3} align="bottom-left">
        <div
          onClick={handleWorkClick}
          style={{
            fontSize: '20',
            lineHeight: '20px',
            textDecoration: 'underline',
            cursor: 'pointer',
            opacity: isMobile ? (showHomepageContent ? 1 : 0) : 1,
            transition: isMobile ? 'opacity 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) 1.2s' : 'none'
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
            <div id={project.id} style={{ fontSize: '20', lineHeight: '20px', textDecoration: 'underline' }}>
              {project.title}
            </div>
          </GridItem>,

          /* Project description - 1 row below title (3 rows below snap point) */
          <GridItem key={`${project.id}-desc`} col={isMobile ? 1 : rightColumn+1} row={adjustedTitleRow + 3} colSpan={isMobile ? 5 : 3} align="top-left">
            <div style={{ fontSize: '20', lineHeight: '20px' }}>
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
          const isCurrentProject = currentProjectId === project.id
          const isVisible = isCurrentProject && !isCloudExpanded

          elements.push(
            <ProjectCarousel
              key={`${project.id}-carousel`}
              ref={(el) => (carouselRefs.current[project.id] = el)}
              items={project.carousel.items}
              titleRow={adjustedTitleRow}
              rightColumn={rightColumn}
              isMobile={isMobile}
              isVisible={isVisible}
              waitForCloud={shouldWaitForCloud}
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
              waitForCloud={shouldWaitForCloud}
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
