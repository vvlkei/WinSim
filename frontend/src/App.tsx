import Desktop from './components/Desktop'
import Taskbar from './components/Taskbar'
import ThemeProvider from './components/ThemeProvider'
import { ToastProvider } from './components/Toast'
import { ConfirmProvider } from './components/ConfirmDialog'

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <ConfirmProvider>
          <div className="h-screen w-screen flex flex-col overflow-hidden">
            <Desktop />
            <Taskbar />
          </div>
        </ConfirmProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
