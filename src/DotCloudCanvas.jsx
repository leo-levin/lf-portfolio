import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { gsap } from 'gsap';
import { ScrollToPlugin } from 'gsap/ScrollToPlugin';

gsap.registerPlugin(ScrollToPlugin);
import {
  DOT_CLOUD_CONFIG,
  CATEGORIES,
  PROJECT_NODES,
  cartesianToPolar,
  polarToCartesian,
} from './dotCloudConfig';
import './DotCloudCanvas.css';

const DotCloudCanvas = forwardRef((props, ref) => {
  const containerRef = useRef(null);
  const nodesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const scrollTimeoutRef = useRef(null);
  const isProgrammaticScrollRef = useRef(false);
  const [isExpanded, setIsExpanded] = useState(true); // Start expanded on homepage
  const [isMobile, setIsMobile] = useState(false);
  const [currentSection, setCurrentSection] = useState('homepage');
  const [rotationAngle, setRotationAngle] = useState(0);
  const [categoryAlpha, setCategoryAlpha] = useState(1); // Category label opacity
  const [collapseOffset, setCollapseOffset] = useState({ x: 0, y: 0 }); // Offset to move collapsed dots to anchor
  const [rotationCenter, setRotationCenter] = useState({ x: 160, y: 360 }); // Dynamic rotation center

  // Initialize nodes with polar coordinates
  useEffect(() => {
    nodesRef.current = PROJECT_NODES.map((node) => {
      const { r, theta } = cartesianToPolar(node.x, node.y);
      return {
        ...node,
        r,
        theta,
        baseTheta: theta,
        currentR: isExpanded ? r : 0,
        textAlpha: isExpanded ? 1 : 0, // Separate alpha for text
      };
    });
  }, []);

  // Expand cloud animation
  const expandCloud = useCallback(() => {
    setIsExpanded(true);

    const { anchorDot } = DOT_CLOUD_CONFIG;
    const offsetX = anchorDot.x - rotationCenter.x;
    const offsetY = anchorDot.y - rotationCenter.y;

    const dotMoveDuration = 0.9; // Slower movement to match collapse

    // Stage 1: Animate offset and dots from anchor position back to rotation center
    const offset = { x: offsetX, y: offsetY };
    gsap.to(offset, {
      x: 0,
      y: 0,
      duration: dotMoveDuration,
      ease: 'back.out(1.4)',
      onUpdate: () => {
        setCollapseOffset({ ...offset });
      }
    });

    nodesRef.current.forEach((node, index) => {
      gsap.to(node, {
        currentR: node.r,
        duration: dotMoveDuration,
        delay: index * DOT_CLOUD_CONFIG.staggerDelay,
        ease: 'back.out(1.4)',
      });
    });

    // Stage 2: Fade in text AFTER dots are in position (faster fade)
    nodesRef.current.forEach((node) => {
      gsap.to(node, {
        textAlpha: 1,
        duration: 0.2, // Faster fade in
        delay: dotMoveDuration, // Wait for dots to reach position
        ease: 'power2.out',
      });
    });

    // Fade in category labels after dots arrive
    gsap.to({ value: 0 }, {
      value: 1,
      duration: 0.2, // Faster fade in
      delay: dotMoveDuration, // Wait for dots to reach position
      ease: 'power2.out',
      onUpdate: function() {
        setCategoryAlpha(this.targets()[0].value);
      }
    });
  }, [rotationCenter]);

  // Collapse cloud animation - two stages
  const collapseCloud = useCallback(() => {
    const { anchorDot } = DOT_CLOUD_CONFIG;

    // Stage 1: Fade out ALL text (project labels AND category labels) quickly
    nodesRef.current.forEach((node) => {
      gsap.to(node, {
        textAlpha: 0,
        duration: 0.2, // Faster fade
        ease: 'power2.in',
      });
    });

    // Fade out category labels - animate state directly
    gsap.to({ value: 1 }, {
      value: 0,
      duration: 0.2, // Faster fade
      ease: 'power2.in',
      onUpdate: function() {
        setCategoryAlpha(this.targets()[0].value);
      }
    });

    // Stage 2: Move all dots to anchor after text fades (slower movement)
    // Calculate offset to move from rotationCenter to anchorDot
    const offsetX = anchorDot.x - rotationCenter.x;
    const offsetY = anchorDot.y - rotationCenter.y;

    const offset = { x: 0, y: 0 };
    gsap.to(offset, {
      x: offsetX,
      y: offsetY,
      duration: 0.9, // Slower movement
      delay: 0.2, // Start after faster text fade
      ease: 'power2.in',
      onUpdate: () => {
        setCollapseOffset({ ...offset });
      }
    });

    nodesRef.current.forEach((node, index) => {
      gsap.to(node, {
        currentR: 0,
        duration: 0.9, // Slower movement
        delay: 0.2, // Start after faster text fade
        ease: 'power2.in',
        onComplete: () => {
          if (index === nodesRef.current.length - 1) {
            setIsExpanded(false);
          }
        },
      });
    });
  }, [categoryAlpha, rotationCenter]);

  // Expose expandCloud, collapseCloud, and isExpanded to parent via ref
  useImperativeHandle(ref, () => ({
    expandCloud,
    collapseCloud,
    isExpanded
  }), [expandCloud, collapseCloud, isExpanded]);

  // Handle background click - collapse cloud
  const handleBackgroundClick = useCallback(() => {
    if (isExpanded) {
      collapseCloud();
    }
  }, [isExpanded, collapseCloud]);

  // Handle project node click - scroll to section with gentle animation
  const handleNodeClick = useCallback((targetSection, e) => {
    // Stop propagation to prevent background collapse
    e.stopPropagation();
    const targetElement = document.getElementById(targetSection);
    if (targetElement) {
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - 60; // Offset by 60px

      // Collapse the cloud immediately when clicking a project
      collapseCloud();
      setCurrentSection('project');

      // Temporarily disable scroll-snap during animation
      const html = document.documentElement;
      const originalScrollSnapType = html.style.scrollSnapType;
      html.style.scrollSnapType = 'none';

      // Mark as programmatic scroll to prevent duplicate collapse/expand during navigation
      isProgrammaticScrollRef.current = true;

      gsap.to(window, {
        scrollTo: targetPosition,
        duration: 1.5, // Gentler, longer duration
        ease: 'power2.inOut',
        onComplete: () => {
          // Re-enable scroll-snap after animation
          html.style.scrollSnapType = originalScrollSnapType;
          // Re-enable automatic collapse/expand
          isProgrammaticScrollRef.current = false;
        }
      });
    }
  }, [collapseCloud]);

  // Calculate dynamic rotation center based on viewport
  useEffect(() => {
    const updateRotationCenter = () => {
      // Grid: 80px columns + 20px gutters, 20px margin
      // Container is 60vw wide
      const containerWidth = window.innerWidth * 0.6; // 60vw
      const viewportHeight = window.innerHeight;

      // Center horizontally in the left half (30vw from left edge)
      const centerX = containerWidth / 2;

      // Center vertically (50vh)
      const centerY = viewportHeight / 2;

      setRotationCenter({ x: centerX, y: centerY });
    };

    updateRotationCenter();
    window.addEventListener('resize', updateRotationCenter);
    return () => window.removeEventListener('resize', updateRotationCenter);
  }, []);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();

    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Scroll detection
  useEffect(() => {
    if (isMobile) return;

    const handleScroll = () => {
      // Ignore scroll events during programmatic navigation
      if (isProgrammaticScrollRef.current) return;

      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }

      scrollTimeoutRef.current = setTimeout(() => {
        const scrollY = window.scrollY || window.pageYOffset;
        const isHomepage = scrollY < 100;
        const newSection = isHomepage ? 'homepage' : 'project';

        if (newSection !== currentSection) {
          setCurrentSection(newSection);
          if (newSection === 'homepage') {
            expandCloud();
          } else {
            collapseCloud();
          }
        }
      }, 150);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [currentSection, isMobile, expandCloud, collapseCloud]);

  // Rotation animation loop
  useEffect(() => {
    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const angle = elapsed * DOT_CLOUD_CONFIG.rotationSpeed;
      setRotationAngle(angle);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="dot-cloud-container" onClick={handleBackgroundClick}>
      {/* Category labels */}
      {isExpanded && !isMobile && categoryAlpha > 0.01 && CATEGORIES.map((category) => {
        const { r, theta } = cartesianToPolar(category.x, category.y);
        const currentTheta = theta + rotationAngle;
        const { x, y } = polarToCartesian(r, currentTheta);

        return (
          <div
            key={category.id}
            className="category-label"
            style={{
              transform: `translate(${rotationCenter.x + x}px, ${rotationCenter.y + y}px)`,
              fontSize: '20',
              lineHeight: '20px',
              textDecoration: 'underline',
              opacity: categoryAlpha,
            }}
          >
            {category.label}
          </div>
        );
      })}

      {/* Project nodes */}
      {isExpanded && !isMobile && nodesRef.current.map((node) => {
        const currentTheta = node.baseTheta + rotationAngle;
        const { x, y } = polarToCartesian(node.currentR, currentTheta);
        const screenX = rotationCenter.x + x + collapseOffset.x;
        const screenY = rotationCenter.y + y + collapseOffset.y;

        return (
          <div
            key={node.id}
            className="project-node"
            onClick={(e) => handleNodeClick(node.targetSection, e)}
            style={{
              transform: `translate(${screenX}px, ${screenY}px)`,
            }}
          >
            <div className="node-dot" />
            {node.textAlpha > 0.01 && (
              <div
                className="node-label"
                style={{
                  fontSize: 14,
                  lineHeight: '20px',
                  opacity: node.textAlpha,
                }}
              >
                {node.label}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

DotCloudCanvas.displayName = 'DotCloudCanvas';

export default DotCloudCanvas;
