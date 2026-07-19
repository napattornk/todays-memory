import { useCallback, useEffect, useState } from 'react'
import { memoryStorageService } from '@/services'
import type { AppSettingsRecord } from '@/db/schema'
import { DEFAULT_SETTINGS } from '@/types/memory'

export function useSettings() {
  const [settings, setSettings] = useState<AppSettingsRecord>({
    ...DEFAULT_SETTINGS,
    schemaVersion: 1,
  })
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    setSettings(await memoryStorageService.getSettings())
    setLoading(false)
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const update = useCallback(async (patch: Partial<AppSettingsRecord>) => {
    const next = await memoryStorageService.updateSettings(patch)
    setSettings(next)
    return next
  }, [])

  return { settings, loading, update, refresh }
}
