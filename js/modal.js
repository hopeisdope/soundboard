const ALLOWED_EXT = ["mp3", "wav", "m4a"];
const ALLOWED_MIME = [
  "audio/mpeg",
  "audio/wav",
  "audio/x-wav",
  "audio/wave",
  "audio/mp4",
  "audio/x-m4a",
  "audio/aac",
];
const MAX_SIZE = 10 * 1024 * 1024;
const DEFAULT_EMOJI = "🔊";

const dialog = document.getElementById("button-modal");
const form = document.getElementById("button-form");
const title = document.getElementById("modal-title");
const fileInput = document.getElementById("field-file");
const fileNameLabel = document.getElementById("file-name");
const nameInput = document.getElementById("field-name");
const emojiInput = document.getElementById("field-emoji");
const previewEmoji = document.getElementById("preview-emoji");
const previewName = document.getElementById("preview-name");
const errorFile = document.getElementById("error-file");
const errorName = document.getElementById("error-name");
const errorEmoji = document.getElementById("error-emoji");
const cancelBtn = document.getElementById("cancel-button");
const deleteBtn = document.getElementById("delete-button");

let mode = "add"; // "add" | "edit"
let editingButton = null;
let selectedFile = null;
let callbacks = { onAdd: null, onUpdate: null, onDelete: null };

function isSingleEmoji(value) {
  if (!value) return true;
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    const segments = [...new Intl.Segmenter("en", { granularity: "grapheme" }).segment(value)];
    return segments.length === 1;
  }
  return [...value].length <= 2;
}

function validateFile(file) {
  if (!file) return mode === "add" ? "A sound file is required." : null;
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const mimeOk = ALLOWED_MIME.includes(file.type);
  const extOk = ALLOWED_EXT.includes(ext);
  if (!mimeOk && !extOk) return "Unsupported file type. Use .mp3, .wav, or .m4a.";
  if (file.size > MAX_SIZE) return "File is too large (max 10MB).";
  return null;
}

function resetErrors() {
  errorFile.textContent = "";
  errorName.textContent = "";
  errorEmoji.textContent = "";
}

function updatePreview() {
  previewEmoji.textContent = emojiInput.value.trim() || DEFAULT_EMOJI;
  previewName.textContent = nameInput.value.trim() || "Sound name";
}

function resetForm() {
  form.reset();
  selectedFile = null;
  fileNameLabel.textContent = "";
  resetErrors();
  updatePreview();
}

export function openAdd() {
  mode = "add";
  editingButton = null;
  resetForm();
  title.textContent = "Add sound";
  deleteBtn.hidden = true;
  dialog.showModal();
}

export function openEdit(button) {
  mode = "edit";
  editingButton = button;
  resetForm();
  title.textContent = "Edit sound";
  nameInput.value = button.name;
  emojiInput.value = button.emoji || "";
  fileNameLabel.textContent = "Current sound kept unless you choose a new file.";
  deleteBtn.hidden = false;
  updatePreview();
  dialog.showModal();
}

function close() {
  dialog.close();
  resetForm();
}

async function handleSubmit(event) {
  event.preventDefault();
  resetErrors();

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
  const fileError = validateFile(selectedFile);
  if (fileError) {
    errorFile.textContent = fileError;
    hasError = true;
  }
  if (hasError) return;

  const finalEmoji = emoji || DEFAULT_EMOJI;

  if (mode === "add") {
    await callbacks.onAdd({
      name,
      emoji: finalEmoji,
      audioBlob: selectedFile,
      mimeType: selectedFile.type || "",
    });
  } else {
    const patch = { name, emoji: finalEmoji };
    if (selectedFile) {
      patch.audioBlob = selectedFile;
      patch.mimeType = selectedFile.type || "";
    }
    await callbacks.onUpdate(editingButton.id, patch);
  }
  close();
}

async function handleDelete() {
  if (!editingButton) return;
  const confirmed = confirm(`Delete "${editingButton.name}"?`);
  if (!confirmed) return;
  await callbacks.onDelete(editingButton.id);
  close();
}

export function initModal(handlers) {
  callbacks = handlers;

  fileInput.addEventListener("change", () => {
    selectedFile = fileInput.files[0] || null;
    fileNameLabel.textContent = selectedFile ? selectedFile.name : "";
    errorFile.textContent = "";
  });

  nameInput.addEventListener("input", updatePreview);
  emojiInput.addEventListener("input", updatePreview);

  form.addEventListener("submit", handleSubmit);
  cancelBtn.addEventListener("click", close);
  deleteBtn.addEventListener("click", handleDelete);
  dialog.addEventListener("cancel", () => resetForm());
}
