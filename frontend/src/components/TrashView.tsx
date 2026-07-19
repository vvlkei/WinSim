import { useState, useEffect, useCallback } from 'react'
import { Folder, File, Trash2, RotateCcw, RefreshCw } from 'lucide-react'
import type { TrashEntry } from '../types'
import { listTrash, restoreTrash, emptyTrash, listArchive } from '../api'
import { useToast } from './Toast'

const fileIcon = (entry: TrashEntry, isArchive = false) => {
  const cls = isArchive ? 'text-gray-300' : 'text-yellow-500'
  const cls2 = isArchive ? 'text-gray-300' : 'text-gray-400'
  if (entry.type === 'directory') return <Folder size={16} className={`${cls} shrink-0`} />
  return <File size={16} className={`${cls2} shrink-0`} />
}

export default function TrashView() {
  const [entries, setEntries] = useState<TrashEntry[]>([])
  const [archive, setArchive] = useState<{ name: string; deleted_at: string }[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [items, archived] = await Promise.all([listTrash(), listArchive()])
      setEntries(items)
      setArchive(archived)
    } catch {
      setEntries([])
      setArchive([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    const interval = setInterval(load, 3000)
    return () => clearInterval(interval)
  }, [load])

  const handleRestore = async (name: string) => {
    try {
      await restoreTrash(name)
      load()
    } catch {
      toast('Failed to restore')
    }
  }

  const handleEmpty = async () => {
    try {
      await emptyTrash()
      load()
    } catch {
      toast('Failed to empty trash')
    }
  }

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#2d2d2d]">
      <div className="flex items-center gap-3 px-6 py-2 border-b border-gray-200 dark:border-gray-700">
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">Trash</span>
        <div className="flex-1" />
        {entries.length > 0 && (
          <button
            onClick={handleEmpty}
            className="text-xs text-red-500 hover:text-red-700 hover:underline transition-colors"
          >
            Empty trash
          </button>
        )}
        <button
          onClick={load}
          className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 dark:text-gray-500 text-sm">Loading...</div>
        ) : (
          <div className="px-6 py-4">
            {entries.length > 0 && (
              <>
                <h2 className="text-xs font-semibold text-gray-800 dark:text-gray-200 mb-3">
                  Recently deleted ({entries.length})
                </h2>
                <div className="space-y-0.5 mb-8">
                  {entries.map((entry) => (
                    <div
                      key={entry.name}
                      className="group flex items-center gap-3 px-3 py-1.5 rounded hover:bg-gray-50 dark:hover:bg-[#3d3d3d] transition-colors"
                    >
                      {fileIcon(entry)}
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                        {entry.original_path || entry.name}
                      </span>
                      <button
                        onClick={() => handleRestore(entry.name)}
                        className="opacity-0 group-hover:opacity-100 flex items-center gap-1 px-2 py-0.5 text-xs text-gray-400 dark:text-gray-500 hover:text-win-blue transition-all"
                      >
                        <RotateCcw size={11} /> Restore
                      </button>
                    </div>
                  ))}
                </div>
              </>
            )}

            {archive.length > 0 && (
              <>
                <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3">
                  Archive (cannot be recovered) ({archive.length})
                </h2>
                <div className="space-y-0.5 mb-8">
                  {archive.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-3 px-3 py-1.5"
                    >
                      <File size={16} className="text-gray-200 dark:text-gray-600 shrink-0" />
                      <span className="flex-1 text-sm text-gray-300 dark:text-gray-500 truncate">{item.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {entries.length === 0 && archive.length === 0 && (
              <div className="flex items-center justify-center h-48 text-gray-400 dark:text-gray-500 text-sm">
                Trash is empty
              </div>
            )}
          </div>
        )}
      </div>

      <div className="px-6 py-2 border-t border-gray-100 dark:border-gray-700 text-[11px] text-gray-400 dark:text-gray-500">
        Files will never actually be deleted permanently because Internet Archive.
      </div>
    </div>
  )
}
