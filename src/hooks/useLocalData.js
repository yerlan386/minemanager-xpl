import { useState, useEffect, useCallback } from 'react'
import { dbSelect, dbUpsert, dbDelete } from '../lib/supabase'

export function useLocalData(table, filters = {}) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const { data } = await dbSelect(table, filters)
    setRows(data || [])
    setLoading(false)
  }, [table, JSON.stringify(filters)])

  useEffect(() => { load() }, [load])

  async function upsert(record) {
    const newRecord = { id: record.id || crypto.randomUUID(), ...record }
    const { error } = await dbUpsert(table, newRecord)
    if (error) {
      console.error(`[useLocalData] upsert failed on "${table}":`, error.message)
      throw new Error(error.message)
    }
    await load()
    return newRecord
  }

  async function remove(id) {
    await dbDelete(table, id)
    setRows(r => r.filter(x => x.id !== id))
  }

  return { rows, loading, upsert, remove, reload: load }
}
