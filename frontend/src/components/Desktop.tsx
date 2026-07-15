import { Folder, FileCode, Terminal, Trash2 } from 'lucide-react'
import useDesktopStore from '../store/desktopStore'
import WindowComponent from './Window'
import FileExplorerComponent from './FileExplorer'

const DESKTOP_ICONS = [
  { label: 'File Explorer', icon: Folder, color: 'text-yellow-500', component: 'fileExplorer' },
  { label: 'Terminal', icon: Terminal, color: 'text-gray-700', component: 'terminal' },
  { label: 'Projects', icon: FileCode, color: 'text-blue-500', component: 'fileExplorer', props: { initialPath: '/home/projects' } },
  { label: 'Trash', icon: Trash2, color: 'text-gray-500', component: '' },
]

export default function Desktop() {
  const { openWindow, windows } = useDesktopStore()

  return (
    <div
      className="flex-1 relative"
      style={{
        background: 'linear-gradient(135deg, #0d1b2a 0%, #1b2838 50%, #2d4a6b 100%)',
        height: 'calc(100vh - 48px)',
      }}
      onContextMenu={(e) => e.preventDefault()}
    >
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {DESKTOP_ICONS.map((item) => (
          <button
            key={item.label}
            onClick={() => {
              if (item.component) {
                openWindow(item.component, item.label, item.props)
              }
            }}
            className="flex items-center gap-3 px-3 py-2 rounded text-white/90 hover:bg-white/10 transition-colors min-w-[140px]"
          >
            <item.icon size={28} className={item.color} />
            <span className="text-xs font-medium drop-shadow-lg">{item.label}</span>
          </button>
        ))}
      </div>

      {windows.map((win) => (
        <WindowWrapper key={win.id} win={win} />
      ))}
    </div>
  )
}

function WindowWrapper({ win }: { win: ReturnType<typeof useDesktopStore.getState>['windows'][number] }) {
  const renderContent = () => {
    switch (win.component) {
      case 'fileExplorer':
        return <FileExplorerComponent {...win.props} />
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
