// Shared hook — loads employees from Supabase (production) or localStorage (demo)
// Used by HSE, Attendance, Payroll, Leave, Disciplinary — anywhere employees are needed
import { useState, useEffect } from 'react'
import { dbSelect, DEMO_MODE } from '../lib/supabase'
import { EMPLOYEES } from '../data/employees'

export function useEmployees() {
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      if (DEMO_MODE) {
        // In demo mode seed localStorage if empty, then read it
        const key = 'mm_employees'
        if (!localStorage.getItem(key)) {
          localStorage.setItem(key, JSON.stringify(
            EMPLOYEES.map(e => ({ ...e, created_at: new Date().toISOString() }))
          ))
        }
        const stored = JSON.parse(localStorage.getItem(key))
        setEmployees(stored)
      } else {
        const { data } = await dbSelect('employees')
        // Normalize snake_case from Supabase to match camelCase used throughout the app
        const normalized = (data || []).map(e => ({
          ...e,
          monthlyRate:      e.monthlyRate      ?? e.monthly_rate      ?? 0,
          employmentType:   e.employmentType   ?? e.employment_type   ?? 'Monthly',
          startDate:        e.startDate        ?? e.start_date        ?? null,
          reportsTo:        e.reportsTo        ?? e.reports_to        ?? null,
        }))
        setEmployees(normalized.length ? normalized : EMPLOYEES)
      }
      setLoading(false)
    }
    load()
  }, [])

  const active    = employees.filter(e => e.status === 'Active')
  const salaried  = employees.filter(e => e.status !== 'Outsourced' && (e.monthlyRate || e.monthly_rate) > 0)
  const empName   = id => employees.find(e => e.id === id)?.name || id

  return { employees, active, salaried, empName, loading }
}
