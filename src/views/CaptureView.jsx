import { QuickCaptureInput } from '../components/QuickCaptureInput'
import { InboxList } from '../components/InboxList'

export function CaptureView() {
  return (
    <div className="space-y-6">
      <header>
        <h1 className="page-title">捕捉</h1>
        <p className="page-subtitle">零阻力輸入，靈感不流失</p>
      </header>
      <QuickCaptureInput inline />
      <InboxList />
    </div>
  )
}
