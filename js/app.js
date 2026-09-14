import {
  getAllButtons,
  addButton,
  updateButton,
  deleteButton,
  reorderButtons,
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
} from "./db.js";
import { playSound, invalidateSound } from "./audio.js";
import { renderGrid, flashTileError } from "./ui.js";
import { initModal, openAdd, openEdit } from "./modal.js";
import { initCategoryModal, openCategoryAdd, openCategoryEdit } from "./category-modal.js";
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
const categoryList = document.getElementById("category-list");
const categoryAddBtn = document.getElementById("category-add");

let buttons = [];
let categories = [];

async function refresh() {
  [buttons, categories] = await Promise.all([getAllButtons(), getAllCategories()]);
  render();
  renderCategoryList();
}

function render() {
  renderGrid(buttons, { editing: isEditing(), layout: getLayout(), categories }, {
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

function renderCategoryList() {
  categoryList.innerHTML = "";
  for (const category of categories) {
    const item = document.createElement("li");
    item.className = "category-row";
    item.dataset.id = category.id;

    const label = document.createElement("span");
    label.className = "category-row-label";
    label.textContent = `${category.emoji} ${category.name}`;
    item.appendChild(label);

    const edit = document.createElement("button");
    edit.type = "button";
    edit.className = "category-row-edit";
    edit.setAttribute("aria-label", `Edit category ${category.name}`);
    edit.textContent = "✎";
    edit.addEventListener("click", () => openCategoryEdit(category));
    item.appendChild(edit);

    categoryList.appendChild(item);
  }
  categoryList.hidden = categories.length === 0;
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
  getCategories: () => categories,
  onNewCategory: () => openCategoryAdd(),
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

initCategoryModal({
  onAdd: async (data) => {
    const created = await addCategory(data);
    await refresh();
    return created;
  },
  onUpdate: async (id, patch) => {
    const updated = await updateCategory(id, patch);
    await refresh();
    return updated;
  },
  onDelete: async (id) => {
    await deleteCategory(id);
    await refresh();
  },
});

categoryAddBtn.addEventListener("click", () => openCategoryAdd());

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
