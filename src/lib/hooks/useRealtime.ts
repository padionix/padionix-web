import { createClient } from '../supabase/client'
import { useEffect, useState } from 'react'

// ponytail: single hook for all realtime subscriptions, not per-table hooks
export function useRealtime<T extends { id: string | number }>(
  table: string,
  filter?: string,
  initial: T[] = [],
): T[] {
  const [data, setData] = useState<T[]>(initial)
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`realtime-${table}-${Math.random()}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table, filter },
        (payload) => setData(prev => [payload.new as T, ...prev]),
      )
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table, filter },
        (payload) => setData(prev => prev.map(x => x.id === (payload.new as T).id ? payload.new as T : x)),
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [table, filter])
  return data
}
