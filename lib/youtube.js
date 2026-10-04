/**
 * Helper functions for handling YouTube URLs and thumbnails.
 */

/**
 * Extracts 11-character YouTube video ID from various YouTube URL formats.
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/shorts/VIDEO_ID
 * - Plain 11-character video ID string
 */
export function extractYouTubeId(url) {
  if (!url || typeof url !== 'string') return null;
  const str = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(str)) {
    return str;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = str.match(regExp);
  return match && match[2] && match[2].length === 11 ? match[2] : null;
}

/**
 * Returns default YouTube thumbnail URL for a given video ID.
 * Quality options: 'hqdefault' (480x360), 'sddefault', 'maxresdefault', 'mqdefault'
 */
export function getYouTubeThumbnailUrl(videoId, quality = 'hqdefault') {
  if (!videoId) return '';
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
}

/**
 * Returns responsive YouTube embed URL.
 */
export function getYouTubeEmbedUrl(videoId, autoplay = false) {
  if (!videoId) return '';
  return `https://www.youtube.com/embed/${videoId}?autoplay=${autoplay ? 1 : 0}&rel=0&modestbranding=1`;
}
