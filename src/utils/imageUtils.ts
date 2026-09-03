/**
 * Lightweight helper to optimize image URLs for responsive thumbnail grids
 * without reducing image quality noticeably or affecting custom storage URLs.
 */
export function getOptimizedImageUrl(
  url: string | undefined | null,
  options: { width?: number; quality?: number; fit?: string } = {}
): string {
  if (!url) return '';

  const { width = 600, quality = 80, fit = 'crop' } = options;

  // Optimize Unsplash images with URL query parameters
  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('fit', fit);
      urlObj.searchParams.set('w', String(width));
      urlObj.searchParams.set('q', String(quality));
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // Return original URL for Supabase storage, relative paths, and SVG/data URLs
  return url;
}

/**
 * Returns the untouched, uncropped, original full-resolution image URL.
 * - For Supabase Storage URLs, data URLs, and direct file uploads: returns the untouched original URL.
 * - For Unsplash URLs: removes crop and downscaling constraints (`fit=crop`, `w=...`, `h=...`),
 *   serving the uncropped original master resolution and original aspect ratio.
 */
export function getOriginalImageUrl(url: string | undefined | null): string {
  if (!url) return '';

  if (url.includes('images.unsplash.com')) {
    try {
      const urlObj = new URL(url);
      urlObj.searchParams.delete('fit');
      urlObj.searchParams.delete('crop');
      urlObj.searchParams.delete('w');
      urlObj.searchParams.delete('h');
      urlObj.searchParams.set('auto', 'format');
      urlObj.searchParams.set('q', '95');
      return urlObj.toString();
    } catch {
      return url;
    }
  }

  // Direct Supabase storage, local, or external image URL is preserved untouched
  return url;
}
