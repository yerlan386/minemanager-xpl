import { useState } from 'react'
import { format, startOfMonth, getDaysInMonth, addMonths, subMonths } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { EMPLOYEES } from '../../data/employees'
import { CREW_COLORS } from '../../data/constants'

const CREW_SCHEDULE = {
  // 28-day cycle: day index (0-27) → crew assignment
  // Month 1: Crew A = Day, Crew B = Night
  // Pattern: 7 on / 7 off rotating
}

function getCrew(dayOfMonth, monthIndex) {
  // 28-day cycle, simple split: A=1-7, B=8-14, C=15-21, A=22-28
  const cycle = ((dayOfMonth - 1) % 28)
  const evenMonth = monthIndex % 2 === 0
  if (cycle < 7)  return evenMonth ? 'Crew A' : 'Crew B'
  if (cycle < 14) return evenMonth ? 'Crew B' : 'Crew A'
  if (cycle < 21) return evenMonth ? 'Crew C' : 'Crew C'
  return 'Relief'
}

function isThursday(date) {
  return date.getDay() === 4
}

const CREW_MEMBERS = {
  'Crew A': ['Kenneth Matombo', 'Calvin', 'Andrew Kavhala', 'Blessing Mbizi'],
  'Crew B': ['Johnson', 'Obert Chingondo', 'Isiah Chidhana', 'Ernest Nyakudya'],
  'Crew C': ['Morgan Mutenda', 'Dyesolodge Kutyauripo', 'Webbester Kupera', 'Bvunye Chiwayo'],
  'Relief': ['Tirika Faresi', 'Thomas Chikore']
}

export default function CrewRoster() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const month = startOfMonth(currentDate)
  const daysInMonth = getDaysInMonth(month)
  const monthIdx = month.getMonth()

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const d = new Date(month.getFullYear(), month.getMonth(), i + 1)
    const thu = isThursday(d)
    const crew = thu ? 'Maintenance' : getCrew(i + 1, monthIdx)
    return { day: i + 1, date: d, crew, isMaintenance: thu }
  })

  const todayDay = new Date().getMonth() === month.getMonth() &&
    new Date().getFullYear() === month.getFullYear()
    ? new Date().getDate() : null

  // On-site today
  const todayCrew = todayDay ? days.find(d => d.day === todayDay)?.crew : null
  const onSiteToday = todayCrew && CREW_MEMBERS[todayCrew] ? CREW_MEMBERS[todayCrew] : []

  return (
    <div className="space-y-4">
      {/* Month navigator */}
      <div className="flex items-center justify-between">
        <button onClick={() => setCurrentDate(subMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronLeft size={20} />
        </button>
        <span className="font-bold text-navy">{format(month, 'MMMM yyyy')}</span>
        <button onClick={() => setCurrentDate(addMonths(currentDate, 1))}
          className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Today on-site */}
      {onSiteToday.length > 0 && (
        <div className="card border-l-4 border-navy">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">On Site Today — {todayCrew}</p>
          <div className="flex flex-wrap gap-2">
            {onSiteToday.map(n => (
              <span key={n} className="bg-navy/10 text-navy text-xs font-semibold px-2.5 py-1 rounded-full">{n}</span>
            ))}
          </div>
        </div>
      )}

      {/* Calendar grid */}
      <div className="card">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['M','T','W','T','F','S','S'].map((d, i) => (
            <div key={i} className="text-center text-xs font-bold text-gray-400 py-1">{d}</div>
          ))}
        </div>

        {/* Offset for first day of month */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: (month.getDay() + 6) % 7 }).map((_, i) => (
            <div key={`empty-${i}`} />
          ))}
          {days.map(({ day, crew, isMaintenance }) => {
            const cfg = CREW_COLORS[crew] || CREW_COLORS.OFF
            const isToday = day === todayDay
            return (
              <div key={day}
                className={`aspect-square flex flex-col items-center justify-center rounded-lg text-center
                  ${cfg.bg} ${cfg.text} ${isToday ? 'ring-2 ring-navy ring-offset-1' : ''}
                  ${isMaintenance ? 'border border-dashed border-gray-400' : ''}`}>
                <span className="text-xs font-bold leading-none">{day}</span>
                <span className="text-[9px] font-semibold mt-0.5">{cfg.label}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="card">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">Legend</p>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(CREW_COLORS).map(([name, cfg]) => (
            <div key={name} className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${cfg.bg}`}>
              <span className={`text-xs font-bold ${cfg.text}`}>{cfg.label}</span>
              <span className={`text-xs ${cfg.text}`}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Crew members */}
      <div className="space-y-3">
        {Object.entries(CREW_MEMBERS).map(([crew, members]) => (
          <div key={crew} className="card">
            <p className="text-sm font-bold text-navy mb-2">{crew}</p>
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <span key={m} className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-1 rounded-full">{m}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
