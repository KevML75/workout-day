import { useRef, useState, type PointerEvent, type ReactNode } from 'react'

/** Horizontal distance (px) a drag must pass to count as a swipe. */
const THRESHOLD = 80
/** Movement (px) before deciding whether a drag is horizontal or a vertical scroll. */
const INTENT_SLOP = 8

interface Props {
  onSwipeLeft: () => void
  onSwipeRight: () => void
  canSwipeLeft: boolean
  canSwipeRight: boolean
  className?: string
  children: ReactNode
}

/** A card that can be dragged left/right. Vertical drags are left to the page scroll. */
export function SwipeCard({ onSwipeLeft, onSwipeRight, canSwipeLeft, canSwipeRight, className, children }: Props) {
  const start = useRef<{ x: number; y: number; id: number } | null>(null)
  const horizontal = useRef(false)
  const [dx, setDx] = useState(0)
  const [dragging, setDragging] = useState(false)

  const reset = () => {
    start.current = null
    horizontal.current = false
    setDragging(false)
    setDx(0)
  }

  const onPointerDown = (e: PointerEvent<HTMLLIElement>) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return
    start.current = { x: e.clientX, y: e.clientY, id: e.pointerId }
  }

  const onPointerMove = (e: PointerEvent<HTMLLIElement>) => {
    const s = start.current
    if (!s || s.id !== e.pointerId) return
    const moveX = e.clientX - s.x
    const moveY = e.clientY - s.y

    if (!horizontal.current) {
      if (Math.abs(moveX) < INTENT_SLOP && Math.abs(moveY) < INTENT_SLOP) return
      if (Math.abs(moveY) > Math.abs(moveX)) return reset() // vertical: let the page scroll
      horizontal.current = true
      setDragging(true)
      e.currentTarget.setPointerCapture(e.pointerId)
    }

    // Resist dragging in a direction that won't do anything.
    const allowed = (moveX < 0 && canSwipeLeft) || (moveX > 0 && canSwipeRight)
    setDx(allowed ? moveX : moveX * 0.2)
  }

  const onPointerUp = () => {
    if (horizontal.current) {
      if (dx <= -THRESHOLD && canSwipeLeft) onSwipeLeft()
      else if (dx >= THRESHOLD && canSwipeRight) onSwipeRight()
    }
    reset()
  }

  const action = dx < 0 ? 'done' : dx > 0 ? 'undo' : null
  const armed = Math.abs(dx) >= THRESHOLD

  return (
    <li
      className={`swipe ${className ?? ''}`}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={reset}
    >
      <div className={`swipe-bg ${action ?? ''} ${armed ? 'armed' : ''}`} aria-hidden="true">
        <span className="undo-label">↺ Undo set</span>
        <span className="done-label">Set done ✓</span>
      </div>
      <div
        className="card"
        style={{ transform: `translateX(${dx}px)`, transition: dragging ? 'none' : undefined }}
      >
        {children}
      </div>
    </li>
  )
}
