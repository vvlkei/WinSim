import { useState, createContext, useContext, useCallback, type ReactNode } from 'react'

interface ConfirmOptions {
  message: string
  title?: string
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
}

const ConfirmContext = createContext<ConfirmContextType>({
  confirm: () => Promise.resolve(false),
})

export const useConfirm = () => useContext(ConfirmContext)

let resolveFn: ((value: boolean) => void) | null = null

export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const [options, setOptions] = useState<ConfirmOptions>({ message: '' })

  const confirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts)
    setOpen(true)
    return new Promise<boolean>((resolve) => {
      resolveFn = resolve
    })
  }, [])

  const handleYes = () => {
    resolveFn?.(true)
    setOpen(false)
  }

  const handleNo = () => {
    resolveFn?.(false)
    setOpen(false)
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {open && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40">
          <div className="bg-white dark:bg-[#2d2d2d] rounded-lg shadow-2xl border border-gray-300 dark:border-gray-700 min-w-[360px] max-w-[420px]">
            <div className="flex items-center h-9 bg-gradient-to-r from-win-blue to-win-title px-3 rounded-t-lg">
              <span className="text-white text-sm font-semibold">{options.title || 'Confirm'}</span>
            </div>
            <div className="px-5 py-6 text-sm text-gray-700 dark:text-gray-300">{options.message}</div>
            <div className="flex justify-end gap-2 px-4 pb-4">
              <button
                onClick={handleYes}
                className="px-5 py-1.5 text-sm bg-win-blue text-white rounded hover:bg-win-hover transition-colors"
              >
                Yes
              </button>
              <button
                onClick={handleNo}
                className="px-5 py-1.5 text-sm bg-gray-100 dark:bg-[#3d3d3d] text-gray-700 dark:text-gray-300 rounded hover:bg-gray-200 dark:hover:bg-[#4d4d4d] transition-colors"
              >
                No
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
