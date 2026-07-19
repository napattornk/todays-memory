export interface CapturedPhoto {
  /** A URL the browser/webview can load directly into an <img>/canvas. */
  webPath: string
}

export interface ProcessedPhoto {
  /** Storage reference for the full-size diary image (path on native, key on web). */
  photoPath: string
  /** Storage reference for the generated thumbnail. */
  thumbnailPath: string
}

export interface PhotoService {
  /** Opens the native camera. Throws PhotoPermissionError on denial. */
  takePhoto(): Promise<CapturedPhoto>
  /** Opens the native photo-library picker. Throws PhotoPermissionError on denial. */
  choosePhoto(): Promise<CapturedPhoto>
  /**
   * Runs orientation correction + resize/compress on the given source image,
   * writes the full image and a thumbnail to the app's private storage under
   * `memoryId`, and returns their storage paths. Does not copy the original
   * full-resolution source.
   */
  processAndSave(sourceWebPath: string, memoryId: string): Promise<ProcessedPhoto>
  /** Resolves a stored photo/thumbnail path to a displayable URL. */
  resolveUrl(path: string): Promise<string>
  /** Deletes stored files for the given paths. Used for save-failure rollback. */
  deleteFiles(paths: string[]): Promise<void>
}

export class PhotoPermissionDeniedError extends Error {
  constructor(source: 'camera' | 'library') {
    super(
      source === 'camera'
        ? 'Camera access was not granted. You can allow it from your device Settings to take photos for a memory.'
        : 'Photo library access was not granted. You can allow it from your device Settings to choose a photo for a memory.',
    )
    this.name = 'PhotoPermissionDeniedError'
  }
}
