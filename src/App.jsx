import { Navbar } from './components/Navbar'
import { QuickCaptureInput } from './components/QuickCaptureInput'
import { InboxList } from './components/InboxList'
import { TaskList, CompletedTasks } from './components/TaskList'
import { ProjectBoard } from './components/ProjectBoard'
import { useSyncData } from './hooks/useSyncData'

function App() {
  useSyncData()

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-3xl space-y-8 px-4 py-6 pb-28 sm:pb-6">
        <QuickCaptureInput />
        <InboxList />
        <TaskList />
        <CompletedTasks />
        <ProjectBoard />
      </main>
    </div>
  )
}

export default App
