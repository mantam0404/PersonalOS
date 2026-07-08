import { useParams } from 'react-router-dom'
import { StudyDetail } from '../components/study/StudyDetail'

export function StudyDetailView() {
  const { id } = useParams()
  return <StudyDetail id={id} />
}
