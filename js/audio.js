const urlCache = new Map(); // buttonId -> object URL

function getUrl(buttonId, blob) {
  let url = urlCache.get(buttonId);
  if (!url) {
    url = URL.createObjectURL(blob);
    urlCache.set(buttonId, url);
  }
  return url;
}

export function invalidateSound(buttonId) {
  const url = urlCache.get(buttonId);
  if (url) URL.revokeObjectURL(url);
  urlCache.delete(buttonId);
}

// Uses a plain <audio> element per play (not a shared/reused element and not
// the Web Audio API) so playback isn't silenced by the iPhone's hardware
// ring/silent switch — unlike raw AudioContext output, <audio> elements
// played from a direct user gesture bypass that switch on iOS Safari. A
// fresh element per call also lets rapid re-taps and different buttons
// overlap independently.
export function playSound(buttonId, blob) {
  const url = getUrl(buttonId, blob);
  const audio = new Audio(url);
  return audio.play();
}
