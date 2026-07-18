import { useState, useEffect, useCallback } from 'react'
import { Folder, File, Trash2, RotateCcw, AlertTriangle } from 'lucide-react'
import type { TrashEntry } from '../types'
import { listTrash, restoreTrash, emptyTrash } from '../api'

const fileIcon = (entry: TrashEntry) => {
  if (entry.type === 'directory') return <Folder size={18} className="text-yellow-500 shrink-0" />
  return <File size={18} className="text-gray-500 shrink-0" />
}

export default function TrashView() {
  const [entries, setEntries] = useState<TrashEntry[]>([])
  const [loading, setLoading] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setEntries(await listTrash())
    } catch {
      setEntries([])
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleRestore = async (name: string) => {
    try {
      await restoreTrash(name)
      load()
    } catch {
      alert('Failed to restore')
    }
  }

  const handleEmpty = async () => {
    if (!confirm('Permanently delete all items in trash?')) return
    try {
      await emptyTrash()
      load()
    } catch {
      alert('Failed to empty trash')
    }
  }

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-win-light border-b border-gray-300 text-xs">
        <button
          onClick={handleEmpty}
          disabled={entries.length === 0}
          className={`flex items-center gap-1 px-2 py-1 rounded ${
            entries.length ? 'hover:bg-gray-200 text-red-600' : 'text-gray-300 cursor-not-allowed'
          }`}
        >
          <Trash2 size={14} /> Empty Trash
        </button>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm">
            Loading...
          </div>
        ) : entries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400 text-sm gap-2">
            <AlertTriangle size={16} /> Trash is empty
          </div>
        ) : (
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-200">
                <th className="pb-1 font-medium">Name</th>
                <th className="pb-1 font-medium">Original Path</th>
                <th className="pb-1 font-medium">Type</th>
                <th className="pb-1 font-medium">Size</th>
                <th className="pb-1 font-medium" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry.name} className="hover:bg-gray-50">
                  <td className="py-1.5 flex items-center gap-2">
                    {fileIcon(entry)}
                    <span className="truncate max-w-[180px]">{entry.name}</span>
                  </td>
                  <td className="py-1.5 text-gray-500 truncate max-w-[200px]">{entry.original_path}</td>
                  <td className="py-1.5 text-gray-500">{entry.type}</td>
                  <td className="py-1.5 text-gray-500">{entry.size ?? '-'}</td>
                  <td className="py-1.5">
                    <button
                      onClick={() => handleRestore(entry.name)}
                      className="flex items-center gap-1 px-2 py-1 rounded hover:bg-gray-200 text-win-blue"
                    >
                      <RotateCcw size={12} /> Restore
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex items-center px-3 py-1 bg-win-light border-t border-gray-300 text-xs text-gray-600">
        {entries.length} item{entries.length !== 1 && 's'}
      </div>
    </div>
  )
}
