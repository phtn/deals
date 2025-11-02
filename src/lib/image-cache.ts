/**
 * @name getCachedImageData
 * @description Get cached image data as data URL for local use
 */
export const getCachedImageData = (cachedProfile: {
  photoData?: string | null
  photoURL?: string | null
}): string | null => {
  return cachedProfile?.photoData || cachedProfile?.photoURL || null
}

/**
 * @name getBestImageSource
 * @description Get the best available image source (cached data URL or original URL)
 */
export const getBestImageSource = (cachedProfile: {
  photoData?: string | null
  photoURL?: string | null
}): string | null => {
  // Prefer cached image data (base64) for offline use and faster loading
  if (cachedProfile?.photoData) {
    return cachedProfile.photoData
  }
  // Fallback to original URL if no cached data
  if (cachedProfile?.photoURL) {
    return cachedProfile.photoURL
  }
  return null
}

/**
 * @name downloadAndCacheImage
 * @description Download image from URL and return as base64 data
 */
export const downloadAndCacheImage = async (imageUrl: string): Promise<string | null> => {
  try {
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const blob = await response.blob()
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const base64 = reader.result as string
        resolve(base64)
      }
      reader.onerror = () => resolve(null)
      reader.readAsDataURL(blob)
    })
  } catch (error) {
    console.error('Error downloading image:', error)
    return null
  }
}