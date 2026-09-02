const STORAGE_KEY = "soundboard:layout";

export function getLayout() {
  return localStorage.getItem(STORAGE_KEY) === "full-width" ? "full-width" : "grid";
}

export function setLayout(layout) {
  localStorage.setItem(STORAGE_KEY, layout);
}
