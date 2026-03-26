/**
 * Fetch an image URL and return a data URI like data:image/png;base64,...
 * Uses global fetch (Node 18+), falls back safely if fetch fails.
 * Returns null on error.
 */
export async function fetchImageAsDataUri(url) {
  if (!url) return null;
  try {
    // If it's already a data URI, return as-is
    if (url.startsWith('data:')) return url;

    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type') || 'image/png';
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:${contentType};base64,${base64}`;
  } catch (e) {
    console.error('Failed to fetch image:', e?.message || e);
    return null;
  }
}

export default fetchImageAsDataUri;
