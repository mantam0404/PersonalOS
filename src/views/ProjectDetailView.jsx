import { useParams } from 'react-router-dom'
import { ProjectDetail } from '../components/domains/ProjectDetail'

export function ProjectDetailView() {
  const { projectId } = useParams()
  return <ProjectDetail projectId={projectId} />
}
