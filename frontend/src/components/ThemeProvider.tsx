import { useEffect, type ReactNode } from 'react'
import useDesktopStore from '../store/desktopStore'

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const colorMode = useDesktopStore((s) => s.colorMode)

  useEffect(() => {
    const root = document.documentElement

    if (colorMode === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)')
      if (mq.matches) root.classList.add('dark')
      else root.classList.remove('dark')

      const handler = (e: MediaQueryListEvent) => {
        root.classList.add('theme-transitioning')
        if (e.matches) root.classList.add('dark')
        else root.classList.remove('dark')
        setTimeout(() => root.classList.remove('theme-transitioning'), 500)
      }
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [colorMode])

  return <>{children}</>
}
