const DEFAULT_EMOJI = "📁";

const dialog = document.getElementById("category-modal");
const form = document.getElementById("category-form");
const title = document.getElementById("category-modal-title");
const nameInput = document.getElementById("category-name");
const emojiInput = document.getElementById("category-emoji");
const errorName = document.getElementById("category-error-name");
const errorEmoji = document.getElementById("category-error-emoji");
const cancelBtn = document.getElementById("category-cancel");
const deleteBtn = document.getElementById("category-delete");

let editingCategory = null;
let resolveOpen = null;
let callbacks = { onAdd: null, onUpdate: null, onDelete: null };

export function isSingleEmoji(value) {
  if (!value) return true;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segments = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(value)];
    return segments.length === 1;
  }
  return [...value].length <= 2;
}

function resetForm() {
  form.reset();
  errorName.textContent = "";
  errorEmoji.textContent = "";
}

function finish(result) {
  if (dialog.open) dialog.close();
  resetForm();
  const resolve = resolveOpen;
  resolveOpen = null;
  editingCategory = null;
  if (resolve) resolve(result);
}

// Both openers resolve with the saved category, or null if cancelled, so
// callers (the sound form, Settings) can simply await the outcome.
function open(category) {
  editingCategory = category;
  resetForm();
  title.textContent = category ? "Edit category" : "New category";
  deleteBtn.hidden = !category;
  if (category) {
    nameInput.value = category.name;
    emojiInput.value = category.emoji || "";
  }
  return new Promise((resolve) => {
    resolveOpen = resolve;
    dialog.showModal();
    nameInput.focus();
  });
}

export function openCategoryAdd() {
  return open(null);
}

export function openCategoryEdit(category) {
  return open(category);
}

async function handleSubmit(event) {
  event.preventDefault();
  errorName.textContent = "";
  errorEmoji.textContent = "";

  const name = nameInput.value.trim();
  const emoji = emojiInput.value.trim();
  let hasError = false;
  if (!name) {
    errorName.textContent = "Name is required.";
    hasError = true;
  }
  if (!isSingleEmoji(emoji)) {
    errorEmoji.textContent = "Enter a single emoji.";
    hasError = true;
  }
  if (hasError) return;

  const data = { name, emoji: emoji || DEFAULT_EMOJI };
  const saved = editingCategory
    ? await callbacks.onUpdate(editingCategory.id, data)
    : await callbacks.onAdd(data);
  finish(saved);
}

async function handleDelete() {
  if (!editingCategory) return;
  const confirmed = confirm(
    `Delete "${editingCategory.name}"? Its sounds will keep working without a category.`
  );
  if (!confirmed) return;
  await callbacks.onDelete(editingCategory.id);
  finish(null);
}

export function initCategoryModal(handlers) {
  callbacks = handlers;
  form.addEventListener("submit", handleSubmit);
  cancelBtn.addEventListener("click", () => finish(null));
  deleteBtn.addEventListener("click", handleDelete);
  // Escape key closes a <dialog> without our buttons — still resolve.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    finish(null);
  });
}
