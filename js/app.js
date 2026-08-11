import { getAllButtons, addButton, updateButton, deleteButton, reorderButtons } from "./db.js";
import { playSound, invalidateSound } from "./audio.js";
import { renderGrid, flashTileError } from "./ui.js";
import { initModal, openAdd, openEdit } from "./modal.js";
import { isReordering, toggleReordering, computeMovedOrder } from "./reorder.js";
import { registerServiceWorker } from "./sw-register.js";

const reorderToggle = document.getElementById("reorder-toggle");
const addButtonEl = document.getElementById("add-button");

let buttons = [];

async function refresh() {
  buttons = await getAllButtons();
  render();
}

function render() {
  renderGrid(buttons, { reordering: isReordering() }, {
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

reorderToggle.addEventListener("click", () => {
  const active = toggleReordering();
  reorderToggle.setAttribute("aria-pressed", String(active));
  reorderToggle.textContent = active ? "Done" : "Reorder";
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

registerServiceWorker();
refresh();
