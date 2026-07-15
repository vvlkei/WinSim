export interface FileEntry {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  children?: FileEntry[]
}

export interface WindowState {
  id: string
  title: string
  component: string
  x: number
  y: number
  width: number
  height: number
  minimized: boolean
  maximized: boolean
  zIndex: number
  props?: Record<string, unknown>
}

export interface DesktopState {
  windows: WindowState[]
  nextZIndex: number
  startMenuOpen: boolean
  openWindow: (component: string, title: string, props?: Record<string, unknown>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  focusWindow: (id: string) => void
  moveWindow: (id: string, x: number, y: number) => void
  resizeWindow: (id: string, width: number, height: number) => void
  toggleStartMenu: () => void
  closeStartMenu: () => void
}
