import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { TodayView } from './views/TodayView'
import { CaptureView } from './views/CaptureView'
import { DomainsView } from './views/DomainsView'
import { useSyncData } from './hooks/useSyncData'

const StudyView = lazy(() => import('./views/StudyView').then((m) => ({ default: m.StudyView })))
const StudyDetailView = lazy(() =>
  import('./views/StudyDetailView').then((m) => ({ default: m.StudyDetailView })),
)
const ProjectDetailView = lazy(() =>
  import('./views/ProjectDetailView').then((m) => ({ default: m.ProjectDetailView })),
)

function RouteFallback() {
  return <div className="py-12 text-center text-sm text-slate-500">載入中…</div>
}

const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/'

function App() {
  useSyncData()

  return (
    <BrowserRouter basename={basename}>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<TodayView />} />
          <Route path="capture" element={<CaptureView />} />
          <Route
            path="study"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StudyView />
              </Suspense>
            }
          />
          <Route
            path="study/:id"
            element={
              <Suspense fallback={<RouteFallback />}>
                <StudyDetailView />
              </Suspense>
            }
          />
          <Route path="domains" element={<DomainsView />} />
          <Route
            path="domains/project/:projectId"
            element={
              <Suspense fallback={<RouteFallback />}>
                <ProjectDetailView />
              </Suspense>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
