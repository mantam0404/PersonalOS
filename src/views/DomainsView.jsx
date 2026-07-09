import { DomainList } from '../components/domains/DomainList'
import { ProjectBoard } from '../components/ProjectBoard'

export function DomainsView() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold">領域</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">Domains 統領一切 — 工作、生活、自我提升</p>
      </header>
      <DomainList />
      <ProjectBoard />
    </div>
  )
}
