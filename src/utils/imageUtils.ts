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
