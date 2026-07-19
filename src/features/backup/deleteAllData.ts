import { memoryStorageService, photoService } from '@/services'

export async function deleteAllLocalData(): Promise<void> {
  const memories = await memoryStorageService.listMemories()
  const paths = memories.flatMap((m) => [m.photoPath, m.thumbnailPath])
  await memoryStorageService.deleteAllData()
  if (paths.length > 0) await photoService.deleteFiles(paths)
}
