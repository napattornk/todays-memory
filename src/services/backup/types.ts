export interface PickedBackupFile {
  data: Uint8Array
  name: string
}

export interface BackupService {
  /** Writes the zip bytes to a shareable location and returns its path/URL. */
  writeArchive(bytes: Uint8Array, filename: string): Promise<{ path: string }>
  /** Opens a file picker for a `.zip` backup. Returns null if the user cancels. */
  pickArchive(): Promise<PickedBackupFile | null>
  deleteArchive(path: string): Promise<void>
}
