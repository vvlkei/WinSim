import { useState, useEffect, createContext, useContext, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react'

interface ToastItem {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

interface ToastContextType {
  toast: (message: string, type?: 'success' | 'error' | 'info') => void
}

const ToastContext = createContext<ToastContextType>({ toast: () => {} })

export const useToast = () => useContext(ToastContext)

let toastId = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([])

  const toast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'error') => {
    const id = ++toastId
    setItems((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setItems((prev) => prev.filter((t) => t.id !== id))
    }, 3000)
  }, [])

  const remove = (id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed top-4 right-4 z-[99999] flex flex-col gap-2 pointer-events-none">
        {items.map((item) => (
          <div
            key={item.id}
            className="pointer-events-auto flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm text-white animate-slide-in"
            style={{
              background: item.type === 'success' ? '#238636' : item.type === 'error' ? '#DA3633' : '#1F6FEB',
              minWidth: '240px',
              maxWidth: '360px',
            }}
          >
            {item.type === 'success' && <CheckCircle size={16} />}
            {item.type === 'error' && <AlertCircle size={16} />}
            {item.type === 'info' && <Info size={16} />}
            <span className="flex-1">{item.message}</span>
            <button onClick={() => remove(item.id)} className="opacity-70 hover:opacity-100">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
