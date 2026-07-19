import { useEffect, useState } from 'react'
import { photoService } from '@/services'

/**
 * Resolves a stored photo/thumbnail path to a displayable URL. On the web
 * fallback this is an object URL; photoService caches and revokes those
 * internally on delete, so components do not need to revoke it themselves.
 */
export function usePhotoUrl(path: string | undefined): string | undefined {
  const [url, setUrl] = useState<string | undefined>(undefined)

  useEffect(() => {
    let cancelled = false
    setUrl(undefined)
    if (!path) return
    photoService.resolveUrl(path).then((resolved) => {
      if (!cancelled) setUrl(resolved)
    })
    return () => {
      cancelled = true
    }
  }, [path])

  return url
}
