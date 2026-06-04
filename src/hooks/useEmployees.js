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
        setEmployees(data?.length ? data : EMPLOYEES)
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
