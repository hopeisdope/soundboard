# soundboard

A personal soundboard for your iPhone. Upload your own sounds (`.wav`, `.mp3`, `.m4a`), give each button a custom name and an emoji icon, and tap to play. Runs entirely as an installable web app — no App Store, no account, no server. All sounds and button data stay on your device (stored locally via IndexedDB).

## Setup (one-time)

1. In this repo, go to **Settings → Pages** and set **Source** to **GitHub Actions**.
2. Push/merge to `main` — the included workflow (`.github/workflows/deploy.yml`) publishes the site to GitHub Pages automatically.
3. On your iPhone, open the published `https://<your-username>.github.io/soundboard/` URL in **Safari** (must be Safari, not another browser, for Add to Home Screen to work).
4. Tap the Share icon → **Add to Home Screen**. Open the app once from Safari before doing this so it has a chance to install itself for offline use.

## Using it

- Tap **+** to add a sound: choose an audio file, give it a name, and type an emoji (use your iPhone's built-in emoji keyboard).
- Tap any tile to play its sound. Sounds can overlap — tapping multiple buttons in quick succession plays them all.
- Tap the pencil icon on a tile to rename it, change its emoji, replace its sound, or delete it.
- Tap **Reorder** to rearrange buttons using the ◀ ▶ controls, then **Done** to exit.
- Tap ⚙️ to open **Settings**.

## Silent switch workaround

The app asks iOS to treat its sounds as "media playback" (via the `AudioSession` API) so they play even with the phone's hardware switch flipped to silent. This is a newer Safari-only API and isn't guaranteed on every iOS version.

If sound is still silenced on your device when the switch is on, open **Settings → "Play sound with ringer off"** and turn it on. This is an **opt-in, off-by-default** workaround: it keeps an inaudible sound looping in the background, which nudges iOS into letting your taps play through the switch too. It's an unofficial community technique, not a guaranteed platform feature, and it costs a little extra battery and will show a "Now Playing" entry in Control Center/the lock screen while it's on — that's why it isn't on by default. Turn it off again from the same settings screen at any time.

## Known limitations

- **Silent/ring switch.** There's no way for a website to force iOS to ignore the switch the way a native app can; the `AudioSession` API and the settings toggle above are best-effort workarounds, not guarantees on every device/iOS version.
- **Storage eviction.** iOS can occasionally clear a Home Screen web app's local storage (including saved sounds) if it hasn't been opened in a long time (historically around a week of inactivity on some iOS versions). This is an iOS/Safari storage-eviction behavior, not something the app can fully prevent — open the app occasionally to keep its data alive, and treat it like local storage rather than a permanent cloud backup.

## Local development

No build step — it's plain HTML/CSS/JS. To run locally:

```
python3 -m http.server
```

Then visit `http://localhost:8000`. (A plain `file://` open won't work — the service worker and ES module imports require `http://`.)
