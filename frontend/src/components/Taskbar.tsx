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

      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#F3F3F3] flex items-center z-50 px-4 border-t border-gray-200">
        <button
          onClick={(e) => { e.stopPropagation(); toggleStartMenu() }}
          className={`h-10 w-10 rounded flex items-center justify-center transition-colors
            ${startMenuOpen ? 'bg-gray-200' : 'hover:bg-gray-200'}`}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="#0078D7">
            <rect x="1" y="1" width="8" height="8" rx="1.5" />
            <rect x="11" y="1" width="8" height="8" rx="1.5" />
            <rect x="1" y="11" width="8" height="8" rx="1.5" />
            <rect x="11" y="11" width="8" height="8" rx="1.5" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center gap-0.5 mx-2 overflow-x-auto">
          {windows.map((w) => (
            <button
              key={w.id}
              onClick={() => w.minimized ? focusWindow(w.id) : minimizeWindow(w.id)}
              className={`h-10 px-4 rounded text-xs text-gray-700 truncate max-w-[160px] transition-colors border-b-2
                ${w.minimized ? 'opacity-60 hover:opacity-100 border-transparent' : 'bg-gray-100 border-win-blue font-medium'}`}
            >
              {w.title}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-600 px-2 whitespace-nowrap">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {startMenuOpen && (
        <div
          className="fixed bottom-12 left-4 w-72 bg-white/90 backdrop-blur-xl border border-gray-200 rounded-lg shadow-xl z-50 p-3"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-gray-800 text-sm font-semibold px-2 py-2 border-b border-gray-100 mb-1">
            Pinned
          </div>
          <button
            onClick={() => {
              useDesktopStore.getState().openWindow('fileExplorer', 'File Explorer')
              closeStartMenu()
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-700 text-sm rounded hover:bg-gray-100 transition-colors"
          >
            <svg viewBox="0 0 16 16" width="16" height="16" className="fill-yellow-500 shrink-0">
              <path d="M2 2h5l2 2h5v10H2V2z" />
            </svg>
            File Explorer
          </button>
        </div>
      )}
    </>
  )
}
