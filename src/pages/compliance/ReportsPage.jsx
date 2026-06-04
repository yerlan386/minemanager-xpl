import { useState } from 'react'
import { format } from 'date-fns'
import { FileText, Download, Loader } from 'lucide-react'
import { dbSelect } from '../../lib/supabase'
import { generateDailyReport, generateWeeklyReport } from '../../lib/pdfExport'
import { useAuth } from '../../context/AuthContext'

export default function ReportsPage() {
  const { user } = useAuth()
  const [generating, setGenerating] = useState(null)

  async function generate(type) {
    setGenerating(type)
    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      if (type === 'daily') {
        const [{ data: handovers }, { data: production }, { data: incidents }, { data: si91 }] = await Promise.all([
          dbSelect('shift_handovers', { date: today }),
          dbSelect('production_logs', { date: today }),
          dbSelect('incidents'),
          dbSelect('si91_log', { date: today })
        ])
        generateDailyReport({ date: today, handovers, production, incidents, si91, generatedBy: user?.name })
      } else {
        const [{ data: handovers }, { data: production }, { data: incidents }] = await Promise.all([
          dbSelect('shift_handovers'),
          dbSelect('production_logs'),
          dbSelect('incidents')
        ])
        generateWeeklyReport({ handovers, production, incidents, generatedBy: user?.name })
      }
    } finally {
      setGenerating(null)
    }
  }

  const reports = [
    {
      type: 'daily',
      title: 'Daily Shift Report',
      description: `Auto-generated for ${format(new Date(), 'd MMMM yyyy')}`,
      sub: 'Production summary · Handover content · Incidents · SI 91 confirmation',
      icon: FileText
    },
    {
      type: 'weekly',
      title: 'Weekly Summary Report',
      description: 'Last 7 days',
      sub: '7-day production totals · Downtime · Gold recovery · Attendance · Open incidents',
      icon: FileText
    }
  ]

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {reports.map(r => {
          const Icon = r.icon
          const isGenerating = generating === r.type
          return (
            <div key={r.type} className="card space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-navy/10 rounded-xl flex items-center justify-center shrink-0">
                  <Icon size={20} className="text-navy" />
                </div>
                <div className="flex-1">
                  <p className="font-bold text-navy">{r.title}</p>
                  <p className="text-xs text-gray-500">{r.description}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{r.sub}</p>
                </div>
              </div>
              <button onClick={() => generate(r.type)} disabled={isGenerating}
                className="btn-primary w-full gap-2 text-sm py-3">
                {isGenerating ? <><Loader size={16} className="animate-spin" /> Generating…</> : <><Download size={16} /> Generate PDF</>}
              </button>
            </div>
          )
        })}
      </div>

      <div className="bg-navy/5 rounded-2xl px-4 py-3">
        <p className="text-xs font-semibold text-navy mb-1">SI 91 Daily Log</p>
        <p className="text-xs text-gray-600">
          SI 91 confirmations are automatically logged from the Dashboard. The full log is embedded in the Daily Shift Report.
        </p>
      </div>
    </div>
  )
}
