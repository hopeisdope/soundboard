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

// Uses a fresh <audio> element per play (rather than one shared/reused
// element) so rapid re-taps and different buttons overlap independently.
// Bypassing the ring/silent switch is handled separately, by declaring a
// "playback" AudioSession above — that's the part iOS actually checks.
export function playSound(buttonId, blob) {
  requestPlaybackAudioSession(); // cheap to re-affirm; runs inside the tap's gesture context too
  const url = getUrl(buttonId, blob);
  const audio = new Audio(url);
  return audio.play();
}
