import { describe, expect, it } from 'vitest'
import { backupManifestSchema, memorySchema, CURRENT_SCHEMA_VERSION } from './schema'

function validMemory() {
  const now = new Date().toISOString()
  return {
    id: 'mem-1',
    date: '2026-07-19',
    type: 'daily' as const,
    photoPath: 'photos/mem-1.jpg',
    thumbnailPath: 'thumbnails/mem-1.jpg',
    createdAt: now,
    updatedAt: now,
    addedAt: now,
  }
}

describe('memorySchema', () => {
  it('accepts a valid daily memory', () => {
    expect(memorySchema.safeParse(validMemory()).success).toBe(true)
  })

  it('rejects a malformed date', () => {
    const result = memorySchema.safeParse({ ...validMemory(), date: '07/19/2026' })
    expect(result.success).toBe(false)
  })

  it('rejects a caption over 160 characters', () => {
    const result = memorySchema.safeParse({ ...validMemory(), caption: 'x'.repeat(161) })
    expect(result.success).toBe(false)
  })

  it('accepts an empty/no caption', () => {
    const result = memorySchema.safeParse(validMemory())
    expect(result.success).toBe(true)
  })

  it('accepts a long caption at the boundary (160 chars)', () => {
    const result = memorySchema.safeParse({ ...validMemory(), caption: 'x'.repeat(160) })
    expect(result.success).toBe(true)
  })
})

describe('backupManifestSchema', () => {
  it('validates a well-formed backup manifest', () => {
    const manifest = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
      memories: [validMemory()],
    }
    expect(backupManifestSchema.safeParse(manifest).success).toBe(true)
  })

  it('rejects a corrupt manifest missing required fields', () => {
    const result = backupManifestSchema.safeParse({ memories: 'not-an-array' })
    expect(result.success).toBe(false)
  })

  it('rejects an unsupported/garbage payload entirely', () => {
    expect(backupManifestSchema.safeParse(null).success).toBe(false)
    expect(backupManifestSchema.safeParse('random string').success).toBe(false)
  })
})
