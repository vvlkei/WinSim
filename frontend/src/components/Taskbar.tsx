import useDesktopStore from '../store/desktopStore'

export default function Taskbar() {
  const { windows, startMenuOpen, toggleStartMenu, closeStartMenu, focusWindow, minimizeWindow } = useDesktopStore()

  return (
    <>
      {startMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={closeStartMenu}
        />
      )}

      <div className="fixed bottom-0 left-0 right-0 h-12 bg-win-taskbar flex items-center z-50 px-1">
        <button
          onClick={(e) => { e.stopPropagation(); toggleStartMenu() }}
          className={`h-10 px-4 rounded flex items-center gap-2 text-white font-semibold text-sm transition-colors
            ${startMenuOpen ? 'bg-[#004C87]' : 'hover:bg-[#004C87]'}`}
        >
          <svg viewBox="0 0 16 16" width="16" height="16" className="fill-white">
            <rect x="1" y="1" width="6" height="6" rx="1" />
            <rect x="9" y="1" width="6" height="6" rx="1" />
            <rect x="1" y="9" width="6" height="6" rx="1" />
            <rect x="9" y="9" width="6" height="6" rx="1" />
          </svg>
          Start
        </button>

        <div className="flex-1 flex items-center gap-0.5 mx-2 overflow-x-auto">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => w.minimized ? focusWindow(w.id) : minimizeWindow(w.id)}
              className={`h-10 px-3 rounded text-xs text-white truncate max-w-[160px] transition-colors border-l border-[#004C87]
                ${w.minimized ? 'opacity-60 hover:opacity-100' : 'bg-[#004C87]'}`}
            >
              {w.title}
            </button>
          ))}
        </div>

        <div className="text-white text-xs px-2">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {startMenuOpen && (
        <div
          className="fixed bottom-12 left-0 w-64 bg-win-dark/95 backdrop-blur border-t border-r border-[#004C87] rounded-tr-lg z-50 p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-white text-xs font-medium px-2 py-3 border-b border-gray-700 mb-1">
            PixelDesktop
          </div>
          <button
            onClick={() => {
              useDesktopStore.getState().openWindow('fileExplorer', 'File Explorer')
              closeStartMenu()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white text-sm rounded hover:bg-[#004C87] transition-colors"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" className="fill-yellow-400 shrink-0">
              <path d="M2 2h5l2 2h5v10H2V2z" />
            </svg>
            File Explorer
          </button>
        </div>
      )}
    </>
  )
}
