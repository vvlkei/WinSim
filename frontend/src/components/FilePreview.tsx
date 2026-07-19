import { useState, useEffect } from 'react'
import { File, FileText, FileImage, Film, Music, Loader2 } from 'lucide-react'
import { getFileUrl, readFile } from '../api'
import useDesktopStore from '../store/desktopStore'

interface Props {
  filePath: string
  fileName: string
}

const TEXT_EXTS = ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'toml', 'csv']
const CODE_EXTS = ['js', 'jsx', 'ts', 'tsx', 'css', 'scss', 'less', 'html', 'htm', 'py', 'java', 'c', 'cpp', 'h', 'hpp', 'rs', 'go', 'rb', 'php', 'sh', 'bash', 'zsh', 'sql', 'graphql', 'vue', 'svelte']
const IMAGE_EXTS = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'ico']
const VIDEO_EXTS = ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv']
const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a']

export default function FilePreview({ filePath, fileName }: Props) {
  const ext = fileName.split('.').pop()?.toLowerCase() || ''
  const [textContent, setTextContent] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const fileUrl = getFileUrl(filePath)

  const isText = TEXT_EXTS.includes(ext) || CODE_EXTS.includes(ext)
  const isImage = IMAGE_EXTS.includes(ext)
  const isVideo = VIDEO_EXTS.includes(ext)
  const isAudio = AUDIO_EXTS.includes(ext)

  useEffect(() => {
    useDesktopStore.getState().addRecentItem({ name: fileName, path: filePath, timestamp: Date.now() })
  }, [filePath, fileName])

  useEffect(() => {
    if (isText) {
      setLoading(true)
      readFile(filePath)
        .then(setTextContent)
        .catch(() => setTextContent('Failed to load file content'))
        .finally(() => setLoading(false))
    }
  }, [filePath, isText])

  const iconClass = 'w-16 h-16 text-gray-400'

  return (
    <div className="h-full flex flex-col bg-white dark:bg-[#2d2d2d]">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-[#383838] border-b border-gray-200 dark:border-gray-700 text-xs text-gray-500 dark:text-gray-400">
        <File size={14} />
        <span className="truncate">{fileName}</span>
      </div>
      <div className="flex-1 overflow-auto flex items-center justify-center bg-gray-100/50 dark:bg-[#252525]/50">
        {isImage && (
          <img
            src={fileUrl}
            alt={fileName}
            className="max-w-full max-h-full object-contain p-4"
          />
        )}
        {isVideo && (
          <video controls className="max-w-full max-h-full p-4" key={fileUrl}>
            <source src={fileUrl} />
          </video>
        )}
        {isAudio && (
          <div className="flex flex-col items-center gap-4 p-8">
            <Music size={48} className="text-gray-400" />
            <audio controls className="w-full max-w-md" key={fileUrl}>
              <source src={fileUrl} />
            </audio>
          </div>
        )}
        {isText && (
          <div className="w-full h-full overflow-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-2 text-gray-400 text-sm">
                <Loader2 size={16} className="animate-spin" /> Loading...
              </div>
            ) : (
              <pre className="text-sm font-mono text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-all">
                {textContent}
              </pre>
            )}
          </div>
        )}
        {!isImage && !isVideo && !isAudio && !isText && (
          <div className="flex flex-col items-center gap-3 text-gray-400">
            <File size={48} />
            <p className="text-sm">Preview not available for this file type</p>
            <a
              href={fileUrl}
              download={fileName}
              className="px-4 py-2 bg-win-blue text-white text-sm rounded hover:bg-win-hover transition-colors"
            >
              Download
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
