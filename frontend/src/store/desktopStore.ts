import { create } from 'zustand'
import type { WindowState, DesktopState } from '../types'

let windowCounter = 0

const useDesktopStore = create<DesktopState>((set) => ({
  windows: [],
  nextZIndex: 1,
  startMenuOpen: false,

  openWindow: (component, title, props) =>
    set((state) => {
      const id = `win-${++windowCounter}`
      const offset = (windowCounter % 10) * 30
      const win: WindowState = {
        id,
        title,
        component,
        x: 80 + offset,
        y: 40 + offset,
        width: component === 'fileExplorer' ? 900 : 500,
        height: component === 'fileExplorer' ? 560 : 400,
        minimized: false,
        maximized: false,
        zIndex: state.nextZIndex,
        props,
      }
      return {
        windows: [...state.windows, win],
        nextZIndex: state.nextZIndex + 1,
      }
    }),

  closeWindow: (id) =>
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    })),

  minimizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, minimized: !w.minimized } : w
      ),
    })),

  maximizeWindow: (id) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, maximized: !w.maximized } : w
      ),
    })),

  focusWindow: (id) =>
    set((state) => {
      const win = state.windows.find((w) => w.id === id)
      if (!win || win.zIndex === state.nextZIndex - 1) return state
      return {
        windows: state.windows.map((w) =>
          w.id === id ? { ...w, zIndex: state.nextZIndex } : w
        ),
        nextZIndex: state.nextZIndex + 1,
      }
    }),

  moveWindow: (id, x, y) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, x, y } : w
      ),
    })),

  resizeWindow: (id, width, height) =>
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, width, height } : w
      ),
    })),

  toggleStartMenu: () =>
    set((state) => ({ startMenuOpen: !state.startMenuOpen })),

  closeStartMenu: () => set({ startMenuOpen: false }),
}))

export default useDesktopStore
