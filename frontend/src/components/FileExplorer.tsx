import { useState, useEffect, useCallback } from 'react'
import { Folder, File, FileText, Image, Music, Video, ChevronRight, ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react'
import type { FileEntry } from '../types'
import { listFiles, createFile, deleteFile, renameFile } from '../api'

interface Props {
  initialPath?: string
}

const HOME_PATH = '/home'

const fileIcon = (entry: FileEntry) => {
  if (entry.type === 'directory') return <Folder size={18} className="text-yellow-500 shrink-0" />
  const ext = entry.name.split('.').pop()?.toLowerCase()
  switch (ext) {
    case 'txt': case 'md': case 'json': case 'ts': case 'tsx': case 'js': case 'jsx': case 'css': case 'html':
      return <FileText size={18} className="text-blue-500 shrink-0" />
    case 'png': case 'jpg': case 'jpeg': case 'gif': case 'svg': case 'webp':
      return <Image size={18} className="text-green-500 shrink-0" />
    case 'mp3': case 'wav': case 'flac': case 'aac':
      return <Music size={18} className="text-purple-500 shrink-0" />
    case 'mp4': case 'avi': case 'mkv': case 'mov':
      return <Video size={18} className="text-red-500 shrink-0" />
    default:
      return <File size={18} className="text-gray-500 shrink-0" />
  }
}

export default function FileExplorer({ initialPath = HOME_PATH }: Props) {
  const [currentPath, setCurrentPath] = useState(initialPath)
  const [entries, setEntries] = useState<FileEntry[]>([])
  const [breadcrumbs, setBreadcrumbs] = useState<string[]>(['home'])
  const [selected, setSelected] = useState<string | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; entry: FileEntry | null } | null>(null)
  const [renaming, setRenaming] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const loadFiles = useCallback(async (path: string) => {
    try {
      const items = await listFiles(path)
      setEntries(items)
    } catch {
      setEntries([])
    }
  }, [])

  useEffect(() => {
    loadFiles(currentPath)
    const parts = currentPath.split('/').filter(Boolean)
    setBreadcrumbs(parts.length ? parts : ['home'])
  }, [currentPath, loadFiles])

  const navigateTo = (path: string) => {
    setCurrentPath(path)
    setSelected(null)
    setContextMenu(null)
  }

  const handleDoubleClick = (entry: FileEntry) => {
    if (entry.type === 'directory') {
      navigateTo(entry.path)
    }
  }

  const handleContextMenu = (e: React.MouseEvent, entry: FileEntry | null) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, entry })
  }

  const handleNewFolder = async () => {
    const name = prompt('Enter folder name:')
    if (!name) return
    try {
      await createFile(`${currentPath}/${name}`, true)
      loadFiles(currentPath)
    } catch (err) {
      alert('Failed to create folder')
    }
    setContextMenu(null)
  }

  const handleNewFile = async () => {
    const name = prompt('Enter file name:')
    if (!name) return
    try {
      await createFile(`${currentPath}/${name}`, false)
      loadFiles(currentPath)
    } catch {
      alert('Failed to create file')
    }
    setContextMenu(null)
  }

  const handleDelete = async () => {
    if (!contextMenu?.entry) return
    if (!confirm(`Delete ${contextMenu.entry.name}?`)) return
    try {
      await deleteFile(contextMenu.entry.path)
      loadFiles(currentPath)
    } catch {
      alert('Failed to delete')
    }
    setContextMenu(null)
  }

  const handleRenameStart = () => {
    if (!contextMenu?.entry) return
    setRenaming(contextMenu.entry.path)
    setRenameValue(contextMenu.entry.name)
    setContextMenu(null)
  }

  const handleRenameSubmit = async (oldPath: string) => {
    if (!renameValue.trim()) {
      setRenaming(null)
      return
    }
    try {
      await renameFile(oldPath, renameValue.trim())
      loadFiles(currentPath)
    } catch {
      alert('Failed to rename')
    }
    setRenaming(null)
  }

  return (
    <div className="h-full flex flex-col bg-white" onClick={() => setContextMenu(null)}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-win-light border-b border-gray-300 text-xs">
        <button
          onClick={handleNewFolder}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200"
        >
          <Plus size={14} /> New Folder
        </button>
        <button
          onClick={handleNewFile}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200"
        >
          <Plus size={14} /> New File
        </button>
      </div>

      {/* Breadcrumbs */}
      <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 border-b border-gray-300 text-xs text-gray-600">
        {breadcrumbs.map((part, idx) => (
          <span key={idx} className="flex items-center gap-1">
            {idx > 0 && <ChevronRight size={12} />}
            <button
              onClick={() => navigateTo('/' + breadcrumbs.slice(0, idx + 1).join('/'))}
              className="px-1.5 py-0.5 rounded hover:bg-gray-200"
            >
              {part}
            </button>
          </span>
        ))}
      </div>

      {/* File list */}
      <div
        className="flex-1 overflow-auto p-2"
        onContextMenu={(e) => handleContextMenu(e, null)}
      >
        {entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            This folder is empty
          </div>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] gap-1">
            {entries.map((entry) => (
              <div
                key={entry.path}
                className={`file-icon flex flex-col items-center gap-1 p-2 rounded cursor-pointer
                  ${selected === entry.path ? 'selected' : 'hover:bg-gray-100'}`}
                onClick={() => setSelected(entry.path)}
                onDoubleClick={() => handleDoubleClick(entry)}
                onContextMenu={(e) => handleContextMenu(e, entry)}
              >
                <div className="flex items-center justify-center w-12 h-12">
                  {fileIcon(entry)}
                </div>
                {renaming === entry.path ? (
                  <input
                    className="w-full text-[11px] text-center border border-win-blue outline-none px-1 rounded"
                    value={renameValue}
                    onChange={(e) => setRenameValue(e.target.value)}
                    onBlur={() => handleRenameSubmit(entry.path)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleRenameSubmit(entry.path)
                      if (e.key === 'Escape') setRenaming(null)
                    }}
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="text-[11px] text-center leading-tight break-all line-clamp-2">
                    {entry.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status bar */}
      <div className="flex items-center px-3 py-1 bg-win-light border-t border-gray-300 text-xs text-gray-600">
        {entries.length} item{entries.length !== 1 && 's'}
      </div>

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-white border border-gray-300 shadow-xl rounded py-1 z-[9999] text-sm min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.entry && (
            <>
              <button onClick={handleNewFolder} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-win-blue hover:text-white">
                <Folder size={14} /> New Folder
              </button>
              <button onClick={handleNewFile} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-win-blue hover:text-white">
                <File size={14} /> New File
              </button>
            </>
          )}
          {contextMenu.entry && (
            <>
              <button onClick={() => { alert(`Path: ${contextMenu.entry!.path}`); setContextMenu(null) }} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-win-blue hover:text-white">
                Properties
              </button>
              <div className="border-t border-gray-200 my-1" />
              <button onClick={handleRenameStart} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-win-blue hover:text-white">
                <Edit3 size={14} /> Rename
              </button>
              <button onClick={handleDelete} className="w-full flex items-center gap-3 px-3 py-1.5 hover:bg-red-500 hover:text-white text-red-600">
                <Trash2 size={14} /> Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
