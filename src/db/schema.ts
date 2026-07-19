import { z } from 'zod'

export const CURRENT_SCHEMA_VERSION = 1

export const localDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected a YYYY-MM-DD local date')

export const memoryTypeSchema = z.enum(['daily', 'retrospective'])

export const memorySchema = z.object({
  id: z.string().min(1),
  date: localDateSchema,
  type: memoryTypeSchema,
  promptId: z.string().optional(),
  promptTextSnapshot: z.string().optional(),
  photoPath: z.string().min(1),
  thumbnailPath: z.string().min(1),
  caption: z.string().max(160).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  addedAt: z.string(),
})

export type MemoryRecord = z.infer<typeof memorySchema>

export const storyBackgroundSchema = z.enum(['white', 'cream', 'black', 'warm-beige'])

export const appSettingsSchema = z.object({
  onboardingCompleted: z.boolean(),
  morningReminderEnabled: z.boolean(),
  morningReminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  eveningReminderEnabled: z.boolean(),
  eveningReminderTime: z.string().regex(/^\d{2}:\d{2}$/),
  preferredStoryBackground: storyBackgroundSchema,
  schemaVersion: z.number().int().positive(),
})

export type AppSettingsRecord = z.infer<typeof appSettingsSchema>

// --- Backup format ---------------------------------------------------------

export const backupMemoryEntrySchema = memorySchema.extend({
  // In a backup archive, photoPath/thumbnailPath point at files inside the
  // zip (e.g. "photos/<id>.jpg") rather than device filesystem paths.
  photoPath: z.string().min(1),
  thumbnailPath: z.string().min(1).optional(),
})

export const backupManifestSchema = z.object({
  schemaVersion: z.number().int().positive(),
  exportedAt: z.string(),
  appVersion: z.string().optional(),
  memories: z.array(backupMemoryEntrySchema),
  settings: appSettingsSchema.partial().optional(),
})

export type BackupManifest = z.infer<typeof backupManifestSchema>
