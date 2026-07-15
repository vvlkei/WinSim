import Desktop from './components/Desktop'
import Taskbar from './components/Taskbar'

export default function App() {
  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden">
      <Desktop />
      <Taskbar />
    </div>
  )
}
