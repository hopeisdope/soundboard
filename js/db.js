const DB_NAME = "soundboard-db";
const DB_VERSION = 2;
const BUTTONS = "buttons";
const CATEGORIES = "categories";

let dbPromise = null;

function promisifyRequest(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openDB() {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(BUTTONS)) {
        const store = db.createObjectStore(BUTTONS, { keyPath: "id" });
        store.createIndex("order", "order", { unique: false });
      }
      // v2: categories. Existing buttons need no migration — a missing
      // categoryId simply means "uncategorized".
      if (!db.objectStoreNames.contains(CATEGORIES)) {
        db.createObjectStore(CATEGORIES, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function getStore(mode, storeName = BUTTONS) {
  const db = await openDB();
  return db.transaction(storeName, mode).objectStore(storeName);
}

// --- Buttons ---

export async function getAllButtons() {
  const store = await getStore("readonly");
  const index = store.index("order");
  const items = await promisifyRequest(index.getAll());
  return items.sort((a, b) => a.order - b.order);
}

export async function addButton({ name, emoji, audioBlob, mimeType, categoryId = null }) {
  const existing = await getAllButtons();
  const now = Date.now();
  const record = {
    id: crypto.randomUUID(),
    name,
    emoji,
    audioBlob,
    mimeType,
    categoryId,
    order: existing.length,
    createdAt: now,
    updatedAt: now,
  };
  const store = await getStore("readwrite");
  await promisifyRequest(store.add(record));
  return record;
}

export async function updateButton(id, patch) {
  const store = await getStore("readwrite");
  const existing = await promisifyRequest(store.get(id));
  if (!existing) throw new Error(`Button ${id} not found`);
  const updated = { ...existing, ...patch, id, updatedAt: Date.now() };
  await promisifyRequest(store.put(updated));
  return updated;
}

export async function deleteButton(id) {
  const store = await getStore("readwrite");
  await promisifyRequest(store.delete(id));
}

export async function reorderButtons(orderedIds) {
  const store = await getStore("readwrite");
  for (let i = 0; i < orderedIds.length; i++) {
    const existing = await promisifyRequest(store.get(orderedIds[i]));
    if (!existing) continue;
    if (existing.order !== i) {
      existing.order = i;
      await promisifyRequest(store.put(existing));
    }
  }
}

// --- Categories ---

export async function getAllCategories() {
  const store = await getStore("readonly", CATEGORIES);
  const items = await promisifyRequest(store.getAll());
  return items.sort((a, b) => a.order - b.order);
}

export async function addCategory({ name, emoji }) {
  const existing = await getAllCategories();
  const record = {
    id: crypto.randomUUID(),
    name,
    emoji,
    order: existing.length,
    createdAt: Date.now(),
  };
  const store = await getStore("readwrite", CATEGORIES);
  await promisifyRequest(store.add(record));
  return record;
}

export async function updateCategory(id, patch) {
  const store = await getStore("readwrite", CATEGORIES);
  const existing = await promisifyRequest(store.get(id));
  if (!existing) throw new Error(`Category ${id} not found`);
  const updated = { ...existing, ...patch, id };
  await promisifyRequest(store.put(updated));
  return updated;
}

// Deleting a category never deletes sounds: its buttons just become
// uncategorized. Done in one transaction over both stores so a failure
// can't leave buttons pointing at a category that no longer exists.
export async function deleteCategory(id) {
  const db = await openDB();
  const tx = db.transaction([BUTTONS, CATEGORIES], "readwrite");
  const buttons = tx.objectStore(BUTTONS);
  const categories = tx.objectStore(CATEGORIES);
  const all = await promisifyRequest(buttons.getAll());
  for (const button of all) {
    if (button.categoryId === id) {
      button.categoryId = null;
      buttons.put(button);
    }
  }
  categories.delete(id);
  await new Promise((resolve, reject) => {
    tx.oncomplete = resolve;
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}
