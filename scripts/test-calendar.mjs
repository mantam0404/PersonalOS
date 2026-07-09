import {
  formatEventTime,
  getTodayTimeRange,
  parseGoogleCalendarEvents,
} from '../src/services/googleCalendar.js'

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

const sampleItems = [
  {
    id: '1',
    summary: '團隊站會',
    start: { dateTime: '2026-07-09T10:00:00+08:00' },
    end: { dateTime: '2026-07-09T10:30:00+08:00' },
  },
  {
    id: '2',
    summary: '休假',
    start: { date: '2026-07-09' },
    end: { date: '2026-07-10' },
  },
]

const events = parseGoogleCalendarEvents(sampleItems)
assert(events.length === 2, 'should parse two events')
assert(events[0].title === '團隊站會', 'title should match')
assert(events[0].source === 'google', 'source should be google')
assert(events[1].time === '全天', 'all-day event should show 全天')

const range = getTodayTimeRange(new Date('2026-07-09T12:00:00+08:00'))
assert(range.timeMin.startsWith('2026-07-08') || range.timeMin.startsWith('2026-07-09'), 'timeMin should be start of day')
assert(range.timeMax > range.timeMin, 'timeMax should be after timeMin')

const timeRange = formatEventTime('2026-07-09T15:30:00+08:00', '2026-07-09T16:00:00+08:00', false)
assert(timeRange.includes('–') || timeRange.includes('-'), 'time range should include separator')
assert(/\d{1,2}:\d{2}/.test(timeRange), 'time range should include clock time')

console.log('Calendar service tests: OK')
