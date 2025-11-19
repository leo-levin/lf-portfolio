import GridItem from './GridItem'
import './CarouselNavigation.css'

function CarouselNavigation({ activeIndex, itemCount, onCircleClick, navRow, navColumn, isVisible }) {
  return (
    <GridItem
      col={navColumn}
      row={navRow}
      align="top-left"
    >
      <div className={`carousel-navigation ${!isVisible ? 'hidden' : ''}`}>
        {Array.from({ length: itemCount }).map((_, index) => (
          <button
            key={index}
            className={`nav-circle ${index === activeIndex ? 'active' : ''}`}
            onClick={() => onCircleClick(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </GridItem>
  )
}

export default CarouselNavigation
