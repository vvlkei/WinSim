import { type ReactNode, useRef, useCallback, useState, useEffect } from 'react'
import useDesktopStore from '../store/desktopStore'

interface Props {
  id: string
  title: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  children: ReactNode
}

export default function Window({
  id, title, x, y, width, height,
  minimized, maximized, zIndex, children
}: Props) {
  const { closeWindow, minimizeWindow, maximizeWindow, focusWindow, moveWindow, resizeWindow } = useDesktopStore()
  const dragRef = useRef<{ startX: number; startY: number; winX: number; winY: number } | null>(null)
  const resizeRef = useRef<{ startX: number; startY: number; w: number; h: number } | null>(null)
  const [pos, setPos] = useState({ x, y })
  const [size, setSize] = useState({ width, height })

  useEffect(() => { setPos({ x, y }) }, [x, y])
  useEffect(() => { setSize({ width, height }) }, [width, height])

  const curX = maximized ? 0 : pos.x
  const curY = maximized ? 0 : pos.y
  const curW = maximized ? window.innerWidth : size.width
  const curH = maximized ? window.innerHeight - 48 : size.height

  const handleMouseDown = useCallback(() => focusWindow(id), [id, focusWindow])

  const handleTitleMouseDown = useCallback((e: React.MouseEvent) => {
    if (maximized) return
    dragRef.current = { startX: e.clientX, startY: e.clientY, winX: pos.x, winY: pos.y }
    focusWindow(id)

    const handleMove = (e: MouseEvent) => {
      if (!dragRef.current) return
      const dx = e.clientX - dragRef.current.startX
      const dy = e.clientY - dragRef.current.startY
      const newX = Math.max(0, dragRef.current.winX + dx)
      const newY = Math.max(0, dragRef.current.winY + dy)
      setPos({ x: newX, y: newY })
      moveWindow(id, newX, newY)
    }

    const handleUp = () => {
      dragRef.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [id, maximized, pos.x, pos.y, focusWindow, moveWindow])

  const handleResizeMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    resizeRef.current = { startX: e.clientX, startY: e.clientY, w: size.width, h: size.height }

    const handleMove = (e: MouseEvent) => {
      if (!resizeRef.current) return
      const dw = e.clientX - resizeRef.current.startX
      const dh = e.clientY - resizeRef.current.startY
      const newW = Math.max(300, resizeRef.current.w + dw)
      const newH = Math.max(200, resizeRef.current.h + dh)
      setSize({ width: newW, height: newH })
      resizeWindow(id, newW, newH)
    }

    const handleUp = () => {
      resizeRef.current = null
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }, [id, size, resizeWindow])

  if (minimized) return null

  return (
    <div
      className="absolute"
      style={{
        left: curX, top: curY, width: curW, height: curH, zIndex,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex flex-col h-full bg-white dark:bg-[#2d2d2d] rounded-lg overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-700">
        <div
          className="flex items-center h-9 bg-white dark:bg-[#333333] select-none"
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={() => maximizeWindow(id)}
        >
          <span className="flex-1 pl-4 text-[12px] text-gray-800 dark:text-gray-200 font-semibold truncate">
            {title}
          </span>
          <div className="flex h-full">
            <button
              onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
              className="w-11 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#4d4d4d] text-gray-600 dark:text-gray-400 transition-colors"
            >
              <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor">
                <rect x="0" y="4.5" width="10" height="1" rx="0.5" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); maximizeWindow(id) }}
              className="w-11 h-full flex items-center justify-center hover:bg-gray-200 dark:hover:bg-[#4d4d4d] text-gray-600 dark:text-gray-400 transition-colors"
            >
              <svg viewBox="0 0 10 10" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="1.2">
                <rect x="1.5" y="1.5" width="7" height="7" rx="1" />
              </svg>
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
              className="w-11 h-full flex items-center justify-center hover:bg-[#E81123] hover:text-white text-gray-600 dark:text-gray-400 transition-colors"
            >
              <svg viewBox="0 0 10 10" width="10" height="10" fill="currentColor">
                <path d="M1.5 1.5l7 7m-7 0l7-7" stroke="currentColor" strokeWidth="1.5" fill="none" />
              </svg>
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-hidden bg-white dark:bg-[#2d2d2d]">
          {children}
        </div>
        <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />
      </div>
    </div>
  )
}
