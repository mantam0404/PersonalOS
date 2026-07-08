import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { TodayView } from './views/TodayView'
import { CaptureView } from './views/CaptureView'
import { StudyView } from './views/StudyView'
import { StudyDetailView } from './views/StudyDetailView'
import { DomainsView } from './views/DomainsView'
import { ProjectDetailView } from './views/ProjectDetailView'
import { useSyncData } from './hooks/useSyncData'

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function App() {
  useSyncData()

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<TodayView />} />
          <Route path="capture" element={<CaptureView />} />
          <Route path="study" element={<StudyView />} />
          <Route path="study/:id" element={<StudyDetailView />} />
          <Route path="domains" element={<DomainsView />} />
          <Route path="domains/project/:projectId" element={<ProjectDetailView />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
