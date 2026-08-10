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

## Known limitation

iOS can occasionally clear a Home Screen web app's local storage (including saved sounds) if it hasn't been opened in a long time (historically around a week of inactivity on some iOS versions). This is an iOS/Safari storage-eviction behavior, not something the app can fully prevent — open the app occasionally to keep its data alive, and treat it like local storage rather than a permanent cloud backup.

## Local development

No build step — it's plain HTML/CSS/JS. To run locally:

```
python3 -m http.server
```

Then visit `http://localhost:8000`. (A plain `file://` open won't work — the service worker and ES module imports require `http://`.)
