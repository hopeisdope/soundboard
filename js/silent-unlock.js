const STORAGE_KEY = "soundboard:silentSwitchWorkaround";

// Tiny (~0.25s, 8kHz mono, very low amplitude) looping WAV, embedded so no
// extra network asset is needed. Keeping it continuously playing nudges iOS
// into treating this tab as active "media playback" (the same state
// Music/Podcasts use, which the ring/silent switch doesn't affect), so
// sounds played afterward piggyback on that and are audible even with the
// switch off. This is a well-known but undocumented/unofficial community
// workaround, not a guaranteed platform API — opt-in only, see settings UI.
const SILENT_LOOP_SRC = "data:audio/wav;base64,UklGRsQPAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YaAPAAAAAAYADQATABkAHgAiACUAJwAnACcAJQAjAB8AGgAUAA4ACAABAPv/9P/u/+j/4//f/9z/2f/Z/9n/2v/d/+H/5f/r//H/9//+/wQACwARABcAHAAhACQAJgAnACcAJgAkACAAHAAXABEACgADAP3/9//w/+r/5f/g/93/2v/Z/9n/2v/c/9//4//o/+7/9f/7/wEACAAPABUAGgAfACMAJgAnACcAJwAlACIAHgAZABMADAAGAAAA+f/y/+z/5//i/97/2//Z/9j/2f/b/97/4v/n/+z/8v/5/wAABgAMABMAGQAeACIAJQAnACcAJwAmACMAHwAaABUADwAIAAEA+//1/+7/6P/j/9//3P/a/9n/2f/a/93/4P/l/+r/8P/3//3/AwAKABEAFwAcACAAJAAmACcAJwAmACQAIQAcABcAEQALAAQA/v/3//H/6//l/+H/3f/a/9n/2f/Z/9z/3//j/+j/7v/0//v/AQAIAA4AFAAaAB8AIwAlACcAJwAnACUAIgAeABkAEwANAAYAAAD6//P/7f/n/+L/3v/b/9n/2f/Z/9v/3f/h/+b/7P/y//j///8FAAwAEgAYAB0AIQAkACcAJwAnACYAIwAfABsAFQAPAAkAAgD8//X/7//p/+T/3//c/9r/2f/Z/9r/3P/g/+T/6f/v//b//f8DAAkAEAAWABsAIAAjACYAJwAnACYAJAAhAB0AGAASAAsABQD///j/8f/r/+b/4f/d/9r/2f/Z/9n/2//e/+L/5//t//T/+v8AAAcADgAUABkAHgAiACUAJwAoACcAJQAiAB4AGQAUAA4ABwAAAPr/9P/t/+f/4v/e/9v/2f/Z/9n/2v/d/+H/5v/r//H/+P///wUACwASABgAHQAhACQAJgAnACcAJgAjACAAGwAWABAACQADAP3/9v/v/+n/5P/g/9z/2v/Z/9n/2v/c/9//5P/p/+//9f/8/wIACQAPABUAGwAfACMAJgAnACcAJwAkACEAHQAYABIADAAFAP//+P/y/+z/5v/h/93/2//Z/9n/2f/b/97/4v/n/+3/8//6/wAABgANABMAGQAeACIAJQAnACcAJwAlACMAHwAaABQADgAIAAEA+//0/+7/6P/j/9//3P/Z/9n/2f/a/93/4f/l/+v/8f/3//7/BAALABEAFwAcACEAJAAmACcAJwAmACQAIAAcABcAEQAKAAMA/f/3//D/6v/l/+D/3f/a/9n/2f/a/9z/3//j/+j/7v/1//v/AQAIAA8AFQAaAB8AIwAmACcAJwAnACUAIgAeABkAEwAMAAYAAAD5//L/7P/n/+L/3v/b/9n/2P/Z/9v/3v/i/+f/7P/y//n/AAAGAAwAEwAZAB4AIgAlACcAJwAnACYAIwAfABoAFQAPAAgAAQD7//X/7v/o/+P/3//c/9r/2f/Z/9r/3f/g/+X/6v/w//f//f8DAAoAEQAXABwAIAAkACYAJwAnACYAJAAhABwAFwARAAsABAD+//f/8f/r/+X/4f/d/9r/2f/Z/9n/3P/f/+P/6P/u//T/+/8BAAgADgAUABoAHwAjACUAJwAnACcAJQAiAB4AGQATAA0ABgAAAPr/8//t/+f/4v/e/9v/2f/Z/9n/2//d/+H/5v/s//L/+P///wUADAASABgAHQAhACQAJwAnACcAJgAjAB8AGwAVAA8ACQACAPz/9f/v/+n/5P/f/9z/2v/Z/9n/2v/c/+D/5P/p/+//9v/9/wMACQAQABYAGwAgACMAJgAnACcAJgAkACEAHQAYABIACwAFAP//+P/x/+v/5v/h/93/2v/Z/9n/2f/b/97/4v/n/+3/9P/6/wAABwAOABQAGQAeACIAJQAnACgAJwAlACIAHgAZABQADgAHAAAA+v/0/+3/5//i/97/2//Z/9n/2f/a/93/4f/m/+v/8f/4////BQALABIAGAAdACEAJAAmACcAJwAmACMAIAAbABYAEAAJAAMA/f/2/+//6f/k/+D/3P/a/9n/2f/a/9z/3//k/+n/7//1//z/AgAJAA8AFQAbAB8AIwAmACcAJwAnACQAIQAdABgAEgAMAAUA///4//L/7P/m/+H/3f/b/9n/2f/Z/9v/3v/i/+f/7f/z//r/AAAGAA0AEwAZAB4AIgAlACcAJwAnACUAIwAfABoAFAAOAAgAAQD7//T/7v/o/+P/3//c/9n/2f/Z/9r/3f/h/+X/6//x//f//v8EAAsAEQAXABwAIQAkACYAJwAnACYAJAAgABwAFwARAAoAAwD9//f/8P/q/+X/4P/d/9r/2f/Z/9r/3P/f/+P/6P/u//X/+/8BAAgADwAVABoAHwAjACYAJwAnACcAJQAiAB4AGQATAAwABgAAAPn/8v/s/+f/4v/e/9v/2f/Y/9n/2//e/+L/5//s//L/+f8AAAYADAATABkAHgAiACUAJwAnACcAJgAjAB8AGgAVAA8ACAABAPv/9f/u/+j/4//f/9z/2v/Z/9n/2v/d/+D/5f/q//D/9//9/wMACgARABcAHAAgACQAJgAnACcAJgAkACEAHAAXABEACwAEAP7/9//x/+v/5f/h/93/2v/Z/9n/2f/c/9//4//o/+7/9P/7/wEACAAOABQAGgAfACMAJQAnACcAJwAlACIAHgAZABMADQAGAAAA+v/z/+3/5//i/97/2//Z/9n/2f/b/93/4f/m/+z/8v/4////BQAMABIAGAAdACEAJAAnACcAJwAmACMAHwAbABUADwAJAAIA/P/1/+//6f/k/9//3P/a/9n/2f/a/9z/4P/k/+n/7//2//3/AwAJABAAFgAbACAAIwAmACcAJwAmACQAIQAdABgAEgALAAUA///4//H/6//m/+H/3f/a/9n/2f/Z/9v/3v/i/+f/7f/0//r/AAAHAA4AFAAZAB4AIgAlACcAKAAnACUAIgAeABkAFAAOAAcAAAD6//T/7f/n/+L/3v/b/9n/2f/Z/9r/3f/h/+b/6//x//j///8FAAsAEgAYAB0AIQAkACYAJwAnACYAIwAgABsAFgAQAAkAAwD9//b/7//p/+T/4P/c/9r/2f/Z/9r/3P/f/+T/6f/v//X//P8CAAkADwAVABsAHwAjACYAJwAnACcAJAAhAB0AGAASAAwABQD///j/8v/s/+b/4f/d/9v/2f/Z/9n/2//e/+L/5//t//P/+v8AAAYADQATABkAHgAiACUAJwAnACcAJQAjAB8AGgAUAA4ACAABAPv/9P/u/+j/4//f/9z/2f/Z/9n/2v/d/+H/5f/r//H/9//+/wQACwARABcAHAAhACQAJgAnACcAJgAkACAAHAAXABEACgADAP3/9//w/+r/5f/g/93/2v/Z/9n/2v/c/9//4//o/+7/9f/7/wEACAAPABUAGgAfACMAJgAnACcAJwAlACIAHgAZABMADAAGAAAA+f/y/+z/5//i/97/2//Z/9j/2f/b/97/4v/n/+z/8v/5/wAABgAMABMAGQAeACIAJQAnACcAJwAmACMAHwAaABUADwAIAAEA+//1/+7/6P/j/9//3P/a/9n/2f/a/93/4P/l/+r/8P/3//3/AwAKABEAFwAcACAAJAAmACcAJwAmACQAIQAcABcAEQALAAQA/v/3//H/6//l/+H/3f/a/9n/2f/Z/9z/3//j/+j/7v/0//v/AQAIAA4AFAAaAB8AIwAlACcAJwAnACUAIgAeABkAEwANAAYAAAD6//P/7f/n/+L/3v/b/9n/2f/Z/9v/3f/h/+b/7P/y//j///8FAAwAEgAYAB0AIQAkACcAJwAnACYAIwAfABsAFQAPAAkAAgD8//X/7//p/+T/3//c/9r/2f/Z/9r/3P/g/+T/6f/v//b//f8DAAkAEAAWABsAIAAjACYAJwAnACYAJAAhAB0AGAASAAsABQD///j/8f/r/+b/4f/d/9r/2f/Z/9n/2//e/+L/5//t//T/+v8AAAcADgAUABkAHgAiACUAJwAoACcAJQAiAB4AGQAUAA4ABwAAAPr/9P/t/+f/4v/e/9v/2f/Z/9n/2v/d/+H/5v/r//H/+P///wUACwASABgAHQAhACQAJgAnACcAJgAjACAAGwAWABAACQADAP3/9v/v/+n/5P/g/9z/2v/Z/9n/2v/c/9//5P/p/+//9f/8/wIACQAPABUAGwAfACMAJgAnACcAJwAkACEAHQAYABIADAAFAP//+P/y/+z/5v/h/93/2//Z/9n/2f/b/97/4v/n/+3/8//6/wAABgANABMAGQAeACIAJQAnACcAJwAlACMAHwAaABQADgAIAAEA+//0/+7/6P/j/9//3P/Z/9n/2f/a/93/4f/l/+v/8f/3//7/BAALABEAFwAcACEAJAAmACcAJwAmACQAIAAcABcAEQAKAAMA/f/3//D/6v/l/+D/3f/a/9n/2f/a/9z/3//j/+j/7v/1//v/AQAIAA8AFQAaAB8AIwAmACcAJwAnACUAIgAeABkAEwAMAAYAAAD5//L/7P/n/+L/3v/b/9n/2P/Z/9v/3v/i/+f/7P/y//n/AAAGAAwAEwAZAB4AIgAlACcAJwAnACYAIwAfABoAFQAPAAgAAQD7//X/7v/o/+P/3//c/9r/2f/Z/9r/3f/g/+X/6v/w//f//f8DAAoAEQAXABwAIAAkACYAJwAnACYAJAAhABwAFwARAAsABAD+//f/8f/r/+X/4f/d/9r/2f/Z/9n/3P/f/+P/6P/u//T/+/8BAAgADgAUABoAHwAjACUAJwAnACcAJQAiAB4AGQATAA0ABgAAAPr/8//t/+f/4v/e/9v/2f/Z/9n/2//d/+H/5v/s//L/+P///wUADAASABgAHQAhACQAJwAnACcAJgAjAB8AGwAVAA8ACQACAPz/9f/v/+n/5P/f/9z/2v/Z/9n/2v/c/+D/5P/p/+//9v/9/wMACQAQABYAGwAgACMAJgAnACcAJgAkACEAHQAYABIACwAFAP//+P/x/+v/5v/h/93/2v/Z/9n/2f/b/97/4v/n/+3/9P/6/wAABwAOABQAGQAeACIAJQAnACgAJwAlACIAHgAZABQADgAHAAAA+v/0/+3/5//i/97/2//Z/9n/2f/a/93/4f/m/+v/8f/4////BQALABIAGAAdACEAJAAmACcAJwAmACMAIAAbABYAEAAJAAMA/f/2/+//6f/k/+D/3P/a/9n/2f/a/9z/3//k/+n/7//1//z/AgAJAA8AFQAbAB8AIwAmACcAJwAnACQAIQAdABgAEgAMAAUA///4//L/7P/m/+H/3f/b/9n/2f/Z/9v/3v/i/+f/7f/z//r/";

let loopAudio = null;
let armed = false;

export function isEnabled() {
  return localStorage.getItem(STORAGE_KEY) === "true";
}

export function setEnabled(enabled) {
  localStorage.setItem(STORAGE_KEY, enabled ? "true" : "false");
}

export function startLoop() {
  if (loopAudio) return;
  loopAudio = new Audio(SILENT_LOOP_SRC);
  loopAudio.loop = true;
  loopAudio.volume = 0.05; // low but nonzero: volume 0 risks the browser skipping playback entirely
  loopAudio.play().catch((err) => {
    console.error("Silent loop failed to start", err);
    loopAudio = null;
  });
}

export function stopLoop() {
  if (!loopAudio) return;
  loopAudio.pause();
  loopAudio = null;
}

// Autoplay policy requires a fresh user gesture on each page load before
// .play() will resolve, even if the preference was already enabled in a
// previous session — so arm a one-time listener rather than starting
// immediately on load.
export function armLoopOnFirstGesture() {
  if (armed || loopAudio) return;
  armed = true;
  const start = () => {
    document.removeEventListener("pointerdown", start);
    document.removeEventListener("touchend", start);
    startLoop();
  };
  document.addEventListener("pointerdown", start, { once: true });
  document.addEventListener("touchend", start, { once: true });
}
