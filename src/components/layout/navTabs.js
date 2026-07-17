import { CalendarDays, Zap, BookOpen, Layers, Library } from 'lucide-react'

export const NAV_TABS = [
  { to: '/', icon: CalendarDays, label: '今日' },
  { to: '/capture', icon: Zap, label: '捕捉' },
  { to: '/study', icon: BookOpen, label: '學習' },
  { to: '/wiki', icon: Library, label: 'Wiki' },
  { to: '/domains', icon: Layers, label: '領域' },
]
