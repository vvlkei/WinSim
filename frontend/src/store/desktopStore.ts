import { create } from 'zustand'
import type { WindowState, DesktopState, RecentItem, ColorMode } from '../types'

let windowCounter = 0

const STORAGE_KEY_WALLPAPER = 'winsim-wallpaper'
const STORAGE_KEY_RECENT = 'winsim-recent'
const STORAGE_KEY_COLOR_MODE = 'winsim-color-mode'
const MAX_RECENT = 12

function loadRecent(): RecentItem[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_RECENT) || '[]')
  } catch {
    return []
  }
}

const useDesktopStore = create<DesktopState>((set) => ({
  windows: [],
  nextZIndex: 1,
  startMenuOpen: false,
  wallpaper: localStorage.getItem(STORAGE_KEY_WALLPAPER),
  recentItems: loadRecent(),
  settingsOpen: false,
  userInfoOpen: false,
  colorMode: (localStorage.getItem(STORAGE_KEY_COLOR_MODE) as ColorMode) || 'system',
  searchQuery: '',

  setSearchQuery: (q) => set({ searchQuery: q }),

  addRecentItem: (item) =>
    set((state) => {
      const filtered = state.recentItems.filter((r) => r.path !== item.path)
      const updated = [item, ...filtered].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(updated))
      return { recentItems: updated }
    }),

  openWindow: (component, title, props) =>
    set((state) => {
      const existing = state.windows.find((w) => w.component === component && w.title === title)
      if (existing) {
        const windows = state.windows.map((w) =>
          w.id === existing.id
            ? { ...w, minimized: false, zIndex: state.nextZIndex }
            : w
        )
        return { windows, nextZIndex: state.nextZIndex + 1 }
      }

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
    set((state) => {
      const opening = !state.startMenuOpen
      return {
        startMenuOpen: opening,
        settingsOpen: opening ? false : state.settingsOpen,
        userInfoOpen: opening ? false : state.userInfoOpen,
        searchQuery: opening ? '' : state.searchQuery,
      }
    }),

  closeStartMenu: () => set({ startMenuOpen: false, searchQuery: '' }),

  setWallpaper: (path) => {
    if (path) localStorage.setItem(STORAGE_KEY_WALLPAPER, path)
    else localStorage.removeItem(STORAGE_KEY_WALLPAPER)
    set({ wallpaper: path })
  },

  toggleSettings: () =>
    set((state) => ({
      settingsOpen: !state.settingsOpen,
      startMenuOpen: state.settingsOpen ? state.startMenuOpen : false,
    })),

  closeSettings: () => set({ settingsOpen: false }),

  toggleUserInfo: () =>
    set((state) => ({
      userInfoOpen: !state.userInfoOpen,
      startMenuOpen: state.userInfoOpen ? state.startMenuOpen : false,
    })),

  closeUserInfo: () => set({ userInfoOpen: false }),

  setColorMode: (mode) => {
    localStorage.setItem(STORAGE_KEY_COLOR_MODE, mode)
    set({ colorMode: mode })

    const root = document.documentElement
    const isDark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    const wasDark = root.classList.contains('dark')
    if (wasDark === isDark) return

    root.classList.add('theme-transitioning')
    if (isDark) root.classList.add('dark')
    else root.classList.remove('dark')
    setTimeout(() => root.classList.remove('theme-transitioning'), 500)
  },
}))

export default useDesktopStore
