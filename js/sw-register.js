const banner = document.getElementById("update-banner");
const reloadBtn = document.getElementById("update-reload");

let currentRegistration = null;

export function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  window.addEventListener("load", async () => {
    try {
      const registration = await navigator.serviceWorker.register("./service-worker.js", {
        scope: "./",
      });
      currentRegistration = registration;

      registration.addEventListener("updatefound", () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener("statechange", () => {
          if (installing.state === "installed" && navigator.serviceWorker.controller) {
            banner.hidden = false;
          }
        });
      });
    } catch (err) {
      console.error("Service worker registration failed", err);
    }
  });

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    window.location.reload();
  });

  reloadBtn.addEventListener("click", () => {
    if (currentRegistration && currentRegistration.waiting) {
      currentRegistration.waiting.postMessage("skipWaiting");
    }
  });
}
