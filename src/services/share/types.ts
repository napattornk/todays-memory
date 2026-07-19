export interface ShareImageInput {
  /** Storage path/URL to the image to share (already saved to disk). */
  path: string
  title?: string
}

export interface ShareService {
  /** True when a native/web share surface is actually available. */
  canShare(): Promise<boolean>
  /**
   * Writes a generated image (e.g. a rendered Story) to temporary storage
   * ahead of sharing, returning the path/key shareImage/saveImageToGallery
   * expect.
   */
  prepareGeneratedImage(blob: Blob, filename: string): Promise<{ path: string }>
  /** Deletes a temporary generated image once sharing is done. */
  cleanupGeneratedImage(path: string): Promise<void>
  /** Opens the native (or Web Share API) share sheet for the given image. */
  shareImage(input: ShareImageInput): Promise<{ shared: boolean }>
  /** Saves the image to the device photo library, where supported. */
  saveImageToGallery(path: string): Promise<{ saved: boolean; reason?: string }>
}
