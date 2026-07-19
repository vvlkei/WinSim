import { useState, useRef, useEffect } from 'react'
import { Folder, Trash2, File, FileText, FileImage, Film, Music, Monitor, Search, User, Settings, ExternalLink } from 'lucide-react'
import useDesktopStore from '../store/desktopStore'
import type { WindowState, RecentItem } from '../types'

const GROUP_ICONS: Record<string, { icon: typeof Folder; color: string }> = {
  fileExplorer: { icon: Folder, color: '#E8A817' },
  filePreview: { icon: File, color: '#58A6FF' },
  trash: { icon: Trash2, color: '#8B949E' },
}

function getFileTypeIcon(title: string) {
  const ext = title.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return { icon: FileImage, color: '#3FB950' }
  if (['mp4', 'webm', 'mov', 'avi', 'mkv'].includes(ext)) return { icon: Film, color: '#D29922' }
  if (['mp3', 'wav', 'flac', 'aac'].includes(ext)) return { icon: Music, color: '#F85149' }
  if (['txt', 'md', 'json', 'xml', 'csv'].includes(ext)) return { icon: FileText, color: '#58A6FF' }
  return { icon: File, color: '#8B949E' }
}

function getIcon(win: WindowState) {
  const group = GROUP_ICONS[win.component]
  if (group) return group
  if (win.component === 'filePreview') return getFileTypeIcon(win.title)
  return { icon: Monitor, color: '#8B949E' }
}

interface Group {
  component: string
  windows: WindowState[]
  icon: typeof Folder
  color: string
}

const FILE_ICONS: Record<string, { icon: typeof File; color: string }> = {
  folder: { icon: Folder, color: '#E8A817' },
  image: { icon: FileImage, color: '#3FB950' },
  text: { icon: FileText, color: '#58A6FF' },
  code: { icon: File, color: '#D29922' },
}

function getRecentFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase() || ''
  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext)) return FILE_ICONS.image
  if (['txt', 'md', 'json', 'xml', 'csv', 'log'].includes(ext)) return FILE_ICONS.text
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'html', 'css', 'java', 'cpp', 'c', 'h', 'rs', 'go'].includes(ext)) return FILE_ICONS.code
  return FILE_ICONS.folder
}

export default function Taskbar() {
  const {
    windows, startMenuOpen, toggleStartMenu, closeStartMenu,
    focusWindow, minimizeWindow, searchQuery, setSearchQuery,
    recentItems, settingsOpen, userInfoOpen,
    toggleSettings, toggleUserInfo, openWindow, addRecentItem
  } = useDesktopStore()
  const searchRef = useRef<HTMLInputElement>(null)
  const [showAllRecent, setShowAllRecent] = useState(false)

  useEffect(() => {
    if (startMenuOpen && searchRef.current) {
      searchRef.current.focus()
    }
  }, [startMenuOpen])

  const groups = windows.reduce<Group[]>((acc, w) => {
    const existing = acc.find(g => g.component === w.component)
    const iconInfo = getIcon(w)
    if (existing) {
      existing.windows.push(w)
    } else {
      acc.push({ component: w.component, windows: [w], icon: iconInfo.icon, color: iconInfo.color })
    }
    return acc
  }, [])

  const handleClick = (g: Group) => {
    const active = g.windows.find(w => !w.minimized)
    if (active) {
      minimizeWindow(active.id)
    } else {
      const w = g.windows[g.windows.length - 1]
      minimizeWindow(w.id)
      focusWindow(w.id)
    }
  }

  const anyActive = (g: Group) => g.windows.some(w => !w.minimized)

  const handleRecentClick = (item: RecentItem) => {
    addRecentItem(item)
    const ext = item.name.split('.').pop()?.toLowerCase() || ''
    if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'txt', 'md', 'json', 'xml', 'csv', 'html', 'css', 'js', 'ts'].includes(ext)) {
      openWindow('filePreview', item.name, { filePath: item.path, fileName: item.name })
    } else {
      openWindow('fileExplorer', item.name, { initialPath: item.path })
    }
    closeStartMenu()
  }

  const displayedRecent = showAllRecent ? recentItems : recentItems.slice(0, 12)

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      openWindow('fileExplorer', `Search: ${searchQuery}`, { search: searchQuery })
      closeStartMenu()
    }
  }

  const handleSettingsClick = () => {
    toggleSettings()
    closeStartMenu()
  }

  const handleUserInfoClick = () => {
    toggleUserInfo()
    closeStartMenu()
  }

  return (
    <>
      {(startMenuOpen || settingsOpen || userInfoOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => {
          if (startMenuOpen) closeStartMenu()
        }} />
      )}

      <div className="fixed bottom-0 left-0 right-0 h-12 bg-[#F3F3F3] dark:bg-[#1f1f1f] flex items-center z-50 px-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={(e) => { e.stopPropagation(); toggleStartMenu() }}
          className={`h-10 w-10 rounded flex items-center justify-center transition-colors
            ${startMenuOpen ? 'bg-gray-200 dark:bg-gray-600' : 'hover:bg-gray-200 dark:hover:bg-gray-600'}`}
        >
          <svg viewBox="0 0 20 20" width="20" height="20" fill="#0078D7">
            <rect x="1" y="1" width="8" height="8" rx="1.5" />
            <rect x="11" y="1" width="8" height="8" rx="1.5" />
            <rect x="1" y="11" width="8" height="8" rx="1.5" />
            <rect x="11" y="11" width="8" height="8" rx="1.5" />
          </svg>
        </button>

        <div className="flex-1 flex items-center justify-center gap-1 mx-2 overflow-x-auto">
          {groups.map((g) => (
            <button
              key={g.component}
              onClick={() => handleClick(g)}
              className={`group relative h-10 px-4 rounded flex items-center gap-2 transition-colors taskbar-btn ${
                anyActive(g) ? 'active' : ''
              }`}
            >
              <g.icon size={18} style={{ color: g.color }} />
              {g.windows.length > 1 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-win-blue text-white text-[10px] font-bold flex items-center justify-center">
                  {g.windows.length}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="text-xs text-gray-600 dark:text-gray-400 px-2 whitespace-nowrap">
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {startMenuOpen && (
        <div
          className="fixed bottom-12 left-4 w-[360px] bg-white/95 dark:bg-[#2d2d2d]/95 backdrop-blur-xl border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-50 flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          <div className="p-4 pb-2">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="搜索文档..."
                className="w-full h-10 pl-9 pr-4 bg-gray-100 dark:bg-[#3d3d3d] rounded-lg text-sm text-gray-700 dark:text-gray-200 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:bg-gray-200 dark:focus:bg-[#4d4d4d] transition-colors"
              />
            </div>
          </div>

          {recentItems.length > 0 && (
            <div className="px-4 pb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">最近打开的项目</span>
              {recentItems.length > 12 && (
                <button
                  onClick={() => setShowAllRecent(!showAllRecent)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center gap-0.5"
                >
                  {showAllRecent ? '收起' : '更多'}
                  <ExternalLink size={10} />
                </button>
              )}
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 pb-2">
            {recentItems.length === 0 ? (
              <div className="flex items-center justify-center h-24 text-gray-400 dark:text-gray-500 text-xs">
                暂无最近打开的项目
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-1">
                {displayedRecent.map((item) => {
                  const { icon: Icon, color } = getRecentFileIcon(item.name)
                  return (
                    <button
                      key={item.path}
                      onClick={() => handleRecentClick(item)}
                      className="flex flex-col items-center gap-1 px-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-[#3d3d3d] transition-colors"
                    >
                      <Icon size={28} style={{ color }} />
                      <span className="text-[10px] text-gray-600 dark:text-gray-300 text-center leading-tight line-clamp-2 break-all">
                        {item.name}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          <div className="border-t border-gray-100 dark:border-gray-700 px-3 py-2.5 flex items-center justify-between bg-gray-50/80 dark:bg-[#252525]/80">
            <button
              onClick={handleUserInfoClick}
              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-200 dark:hover:bg-[#3d3d3d] transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-semibold">
                U
              </div>
              <span className="text-sm text-gray-700 dark:text-gray-200 font-medium">User</span>
            </button>
            <button
              onClick={handleSettingsClick}
              className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-gray-200 dark:hover:bg-[#3d3d3d] transition-colors text-gray-600 dark:text-gray-300"
            >
              <Settings size={18} />
              <span className="text-sm">设置</span>
            </button>
          </div>
        </div>
      )}

      {settingsOpen && <SettingsPanel />}
      {userInfoOpen && <UserInfoPanel />}
    </>
  )
}

function SettingsPanel() {
  const { colorMode, setColorMode, wallpaper, setWallpaper, closeSettings } = useDesktopStore()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const modes = [
    { value: 'system' as const, label: '跟随系统' },
    { value: 'light' as const, label: '白天' },
    { value: 'dark' as const, label: '黑夜' },
  ]

  const handleCustomWallpaper = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setPreviewUrl(dataUrl)
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const handleApplyWallpaper = () => {
    if (previewUrl) {
      setWallpaper(previewUrl)
      setPreviewUrl(null)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={closeSettings} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] bg-white dark:bg-[#2d2d2d] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">设置</h2>
          <button onClick={closeSettings} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-[#3d3d3d] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-5">
          <div>
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">颜色模式</div>
            <div className="flex gap-2">
              {modes.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setColorMode(m.value)}
                  className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${
                    colorMode === m.value
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                      : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3d3d3d]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-4">
            <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">桌面背景</div>
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => { setWallpaper(null); setPreviewUrl(null) }}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${
                  !wallpaper && !previewUrl
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3d3d3d]'
                }`}
              >
                显示默认图片
              </button>
              <button
                onClick={handleCustomWallpaper}
                className={`flex-1 py-2 px-3 rounded-lg text-sm border transition-all ${
                  wallpaper || previewUrl
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium'
                    : 'border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#3d3d3d]'
                }`}
              >
                自定义
              </button>
            </div>
            {(wallpaper || previewUrl) && (
              <div className="relative w-full h-28 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 bg-gray-100 dark:bg-[#3d3d3d]">
                <img
                  src={previewUrl || wallpaper || ''}
                  alt="wallpaper preview"
                  className="w-full h-full object-cover"
                />
                {previewUrl && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2">
                    <button
                      onClick={handleApplyWallpaper}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
                    >
                      应用
                    </button>
                    <button
                      onClick={() => setPreviewUrl(null)}
                      className="px-4 py-1.5 text-sm font-medium text-white bg-gray-500/80 rounded-lg hover:bg-gray-600/80 transition-colors"
                    >
                      取消
                    </button>
                  </div>
                )}
              </div>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          </div>
        </div>
      </div>
    </>
  )
}

function UserInfoPanel() {
  const { closeUserInfo } = useDesktopStore()
  const [password, setPassword] = useState('')
  const [saved, setSaved] = useState(false)

  const handleSavePassword = () => {
    if (password.trim()) {
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <>
      <div className="fixed inset-0 bg-black/20 z-[60]" onClick={closeUserInfo} />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] bg-white dark:bg-[#2d2d2d] rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[70] overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-700">
          <h2 className="text-base font-semibold text-gray-800 dark:text-gray-100">用户信息</h2>
          <button onClick={closeUserInfo} className="w-7 h-7 flex items-center justify-center rounded hover:bg-gray-100 dark:hover:bg-[#3d3d3d] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300">
            <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
              <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-xl font-bold">
              U
            </div>
            <div>
              <div className="text-sm text-gray-500 dark:text-gray-400">用户ID</div>
              <div className="text-sm font-medium text-gray-800 dark:text-gray-200">guest_001</div>
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">用户名</div>
            <div className="text-sm font-medium text-gray-800 dark:text-gray-200">User</div>
          </div>
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">修改密码</div>
            <div className="flex gap-2">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="输入新密码"
                className="flex-1 h-9 px-3 text-sm border border-gray-200 dark:border-gray-600 dark:bg-[#3d3d3d] dark:text-gray-200 rounded-lg outline-none focus:border-blue-400"
              />
              <button
                onClick={handleSavePassword}
                className="px-4 h-9 text-sm font-medium text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition-colors"
              >
                {saved ? '已保存' : '保存'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
