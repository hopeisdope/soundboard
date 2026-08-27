const urlCache = new Map(); // buttonId -> object URL

// Declares this page's audio as "media playback" via the standards-track
// AudioSession API (Safari-only so far). This is what actually tells iOS to
// let the audio continue when the hardware ring/silent switch is set to
// silent — plain <audio>/<video> elements and the Web Audio API both default
// to the "ambient" session type, which iOS mutes along with the switch.
// No-ops safely on browsers that don't support it yet.
function requestPlaybackAudioSession() {
  if ("audioSession" in navigator) {
    try {
      navigator.audioSession.type = "playback";
    } catch (err) {
      // Unsupported value on this browser version — ignore, playback still
      // works, it just won't bypass the silent switch.
    }
  }
}

requestPlaybackAudioSession();

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

// A small pool of persistent, reused <audio> elements — created once here
// rather than a fresh Audio() per tap. Confirmed by inspecting myinstants.com's
// own source: they use exactly one Audio() object, created once, with its
// .src swapped and .play() re-invoked for every sound. That reuse (not the
// AudioSession API above) appears to be the actual difference that keeps iOS
// treating playback as legitimate "media" that bypasses the ring/silent
// switch — constructing a brand-new Audio() on every tap, as this file used
// to do, does not reliably get the same treatment. A pool (instead of their
// single element) keeps that same reuse pattern while still allowing a few
// sounds to overlap.
const POOL_SIZE = 6;
const pool = Array.from({ length: POOL_SIZE }, () => new Audio());
let poolIndex = 0;

export function playSound(buttonId, blob) {
  requestPlaybackAudioSession(); // cheap to re-affirm; runs inside the tap's gesture context too
  const url = getUrl(buttonId, blob);
  const audio = pool[poolIndex];
  poolIndex = (poolIndex + 1) % POOL_SIZE;
  audio.pause();
  audio.currentTime = 0;
  audio.src = url;
  return audio.play();
}
