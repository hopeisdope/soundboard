import { getAllButtons, addButton, updateButton, deleteButton, reorderButtons } from "./db.js";
import { playSound, invalidateBuffer, unlockAudio } from "./audio.js";
import { renderGrid } from "./ui.js";
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
    onPlay: (button) => playSound(button.id, button.audioBlob),
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
    if (patch.audioBlob) invalidateBuffer(id);
    await updateButton(id, patch);
    await refresh();
  },
  onDelete: async (id) => {
    await deleteButton(id);
    const remaining = buttons.filter((b) => b.id !== id).map((b) => b.id);
    await reorderButtons(remaining);
    invalidateBuffer(id);
    await refresh();
  },
});

document.addEventListener("pointerdown", unlockAudio, { once: true });

registerServiceWorker();
refresh();
