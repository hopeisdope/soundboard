import { getAllButtons, addButton, updateButton, deleteButton, reorderButtons } from "./db.js";
import { playSound, invalidateSound } from "./audio.js";
import { renderGrid, flashTileError } from "./ui.js";
import { initModal, openAdd, openEdit } from "./modal.js";
import { isEditing, toggleEditing, computeMovedOrder } from "./editmode.js";
import { registerServiceWorker } from "./sw-register.js";
import { isEnabled, setEnabled, startLoop, stopLoop, armLoopOnFirstGesture } from "./silent-unlock.js";
import { getLayout, setLayout } from "./layout.js";

const editToggle = document.getElementById("edit-toggle");
const addButtonEl = document.getElementById("add-button");
const settingsButton = document.getElementById("settings-button");
const settingsModal = document.getElementById("settings-modal");
const settingsClose = document.getElementById("settings-close");
const silentSwitchToggle = document.getElementById("silent-switch-toggle");
const layoutButtons = document.querySelectorAll("#layout-picker .segmented-option");

let buttons = [];

async function refresh() {
  buttons = await getAllButtons();
  render();
}

function render() {
  renderGrid(buttons, { editing: isEditing(), layout: getLayout() }, {
    onPlay: (button) => {
      Promise.resolve(playSound(button.id, button.audioBlob)).catch((err) => {
        console.error("Playback failed", err);
        flashTileError(button.id);
      });
    },
    onEdit: (button) => openEdit(button),
    onMove: handleMove,
  });
}

async function handleMove(id, direction) {
  const newOrder = computeMovedOrder(buttons, id, direction);
  if (!newOrder) return;
  await reorderButtons(newOrder);
  await refresh();
}

editToggle.addEventListener("click", () => {
  const active = toggleEditing();
  editToggle.setAttribute("aria-pressed", String(active));
  editToggle.textContent = active ? "Done" : "Edit";
  render();
});

addButtonEl.addEventListener("click", () => openAdd());

initModal({
  onAdd: async (data) => {
    await addButton(data);
    await refresh();
  },
  onUpdate: async (id, patch) => {
    if (patch.audioBlob) invalidateSound(id);
    await updateButton(id, patch);
    await refresh();
  },
  onDelete: async (id) => {
    await deleteButton(id);
    const remaining = buttons.filter((b) => b.id !== id).map((b) => b.id);
    await reorderButtons(remaining);
    invalidateSound(id);
    await refresh();
  },
});

settingsButton.addEventListener("click", () => settingsModal.showModal());
settingsClose.addEventListener("click", () => settingsModal.close());

silentSwitchToggle.checked = isEnabled();
if (silentSwitchToggle.checked) armLoopOnFirstGesture();

silentSwitchToggle.addEventListener("change", () => {
  const enabled = silentSwitchToggle.checked;
  setEnabled(enabled);
  if (enabled) {
    startLoop();
  } else {
    stopLoop();
  }
});

function syncLayoutButtons() {
  const current = getLayout();
  layoutButtons.forEach((btn) => {
    btn.setAttribute("aria-pressed", String(btn.dataset.layout === current));
  });
}
syncLayoutButtons();

layoutButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    setLayout(btn.dataset.layout);
    syncLayoutButtons();
    render();
  });
});

registerServiceWorker();
refresh();
