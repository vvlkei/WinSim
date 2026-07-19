import { Folder, FileCode, Trash2 } from 'lucide-react'
import useDesktopStore from '../store/desktopStore'
import type { WindowState } from '../types'
import WindowComponent from './Window'
import FileExplorerComponent from './FileExplorer'
import TrashViewComponent from './TrashView'
import FilePreviewComponent from './FilePreview'

const DESKTOP_ICONS = [
  { label: 'File Explorer', icon: Folder, color: 'text-yellow-500', component: 'fileExplorer' },
  { label: 'Projects', icon: FileCode, color: 'text-blue-500', component: 'fileExplorer', props: { initialPath: '/home/projects' } },
  { label: 'Trash', icon: Trash2, color: 'text-gray-500', component: 'trash' },
]

const DEFAULT_BG = 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d4a6b 100%)'

export default function Desktop() {
  const { openWindow, windows, wallpaper } = useDesktopStore()

  const openApp = (component: string, title: string, props?: Record<string, unknown>) => {
    openWindow(component, title, props)
  }

  return (
    <div
      className="flex-1 relative overflow-hidden"
      style={{
        background: wallpaper ? `url(${wallpaper}) center/cover no-repeat` : DEFAULT_BG,
        height: 'calc(100vh - 48px)',
      }}
    >
      <div className="absolute top-4 left-4 grid grid-cols-[repeat(auto-fill,80px)] gap-3">
        {DESKTOP_ICONS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.component) {
                openApp(item.component, item.label, item.props)
              }
            }}
            className="flex flex-col items-center gap-1 px-2 py-2 rounded text-white/90 hover:bg-white/10 transition-colors w-[76px]"
          >
            <item.icon size={32} className={item.color} />
            <span className="text-[11px] text-center leading-tight drop-shadow-lg break-words">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {windows.map((win) => (
        <WindowWrapper key={win.id} win={win} />
      ))}
    </div>
  )
}

function WindowWrapper({ win }: { win: WindowState }) {
  const renderContent = () => {
    switch (win.component) {
      case 'fileExplorer':
        return <FileExplorerComponent {...win.props} />
      case 'trash':
        return <TrashViewComponent />
      case 'filePreview':
        return <FilePreviewComponent filePath={win.props?.filePath as string} fileName={win.props?.fileName as string} />
      default:
        return (
          <div className="flex items-center justify-center h-full text-gray-400">
            Unknown component: {win.component}
          </div>
        )
    }
  }

  return (
    <WindowComponent
      id={win.id}
      title={win.title}
      x={win.x}
      y={win.y}
      width={win.width}
      height={win.height}
      minimized={win.minimized}
      maximized={win.maximized}
      zIndex={win.zIndex}
    >
      {renderContent()}
    </WindowComponent>
  )
}
