import { type ReactNode, useRef, useCallback, useState } from 'react'
import { X, Minus, Square } from 'lucide-react'
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
      <div className="flex flex-col h-full bg-white rounded-t-lg overflow-hidden shadow-2xl border border-win-border">
        <div
          className="flex items-center h-9 bg-gradient-to-r from-win-blue to-win-title px-2 select-none"
          onMouseDown={handleTitleMouseDown}
          onDoubleClick={() => maximizeWindow(id)}
        >
          <div className="flex gap-1.5">
            <button onClick={() => closeWindow(id)} className="w-3.5 h-3.5 rounded-full bg-[#E81123] hover:brightness-110 flex items-center justify-center">
              <X size={8} className="text-white opacity-0 hover:opacity-100" />
            </button>
            <button onClick={() => minimizeWindow(id)} className="w-3.5 h-3.5 rounded-full bg-[#F5A623] hover:brightness-110 flex items-center justify-center">
              <Minus size={8} className="text-white opacity-0 hover:opacity-100" />
            </button>
            <button onClick={() => maximizeWindow(id)} className="w-3.5 h-3.5 rounded-full bg-[#34C74A] hover:brightness-110 flex items-center justify-center">
              <Square size={7} className="text-white opacity-0 hover:opacity-100" />
            </button>
          </div>
          <span className="flex-1 text-center text-white text-sm font-medium tracking-wide mr-14 truncate">
            {title}
          </span>
        </div>
        <div className="flex-1 overflow-hidden bg-white">
          {children}
        </div>
        <div className="window-resize-handle" onMouseDown={handleResizeMouseDown} />
      </div>
    </div>
  )
}
