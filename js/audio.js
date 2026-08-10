let ctx = null;
let unlocked = false;
const bufferCache = new Map();

function getContext() {
  if (!ctx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    ctx = new AudioContextClass();
  }
  return ctx;
}

export function unlockAudio() {
  if (unlocked) return;
  const context = getContext();
  if (context.state === "suspended") {
    context.resume();
  }
  // Play a near-silent buffer as a belt-and-suspenders unlock for older iOS versions.
  const buffer = context.createBuffer(1, 1, 22050);
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.connect(context.destination);
  source.start(0);
  unlocked = true;
}

export function invalidateBuffer(buttonId) {
  bufferCache.delete(buttonId);
}

async function getBuffer(buttonId, blob) {
  if (bufferCache.has(buttonId)) return bufferCache.get(buttonId);
  const arrayBuffer = await blob.arrayBuffer();
  const context = getContext();
  const audioBuffer = await context.decodeAudioData(arrayBuffer);
  bufferCache.set(buttonId, audioBuffer);
  return audioBuffer;
}

export async function playSound(buttonId, blob) {
  unlockAudio();
  const context = getContext();
  if (context.state === "suspended") {
    await context.resume();
  }
  const audioBuffer = await getBuffer(buttonId, blob);
  const source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(context.destination);
  source.start(0);
}
