import { useCallback, useEffect, useState } from 'react'
import { memoryStorageService } from '@/services'
import type { MemoryRecord } from '@/db/schema'
import type { LocalDate } from '@/types/memory'

export function useAllMemories() {
  const [memories, setMemories] = useState<MemoryRecord[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    const rows = await memoryStorageService.listMemories()
    setMemories(rows)
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { memories, loading, refresh }
}

export function useMemoryByDate(date: LocalDate) {
  const [memory, setMemory] = useState<MemoryRecord | null | undefined>(undefined)

  const refresh = useCallback(async () => {
    setMemory(await memoryStorageService.getMemoryByDate(date))
  }, [date])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { memory, loading: memory === undefined, refresh }
}

export function useMemoryById(id: string | undefined) {
  const [memory, setMemory] = useState<MemoryRecord | null | undefined>(undefined)

  const refresh = useCallback(async () => {
    if (!id) return
    setMemory(await memoryStorageService.getMemoryById(id))
  }, [id])

  useEffect(() => {
    refresh()
  }, [refresh])

  return { memory, loading: memory === undefined, refresh }
}
