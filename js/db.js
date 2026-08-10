const DB_NAME = "soundboard-db";
const DB_VERSION = 1;
const STORE = "buttons";

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
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("order", "order", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

async function getStore(mode) {
  const db = await openDB();
  return db.transaction(STORE, mode).objectStore(STORE);
}

export async function getAllButtons() {
  const store = await getStore("readonly");
  const index = store.index("order");
  const items = await promisifyRequest(index.getAll());
  return items.sort((a, b) => a.order - b.order);
}

export async function addButton({ name, emoji, audioBlob, mimeType }) {
  const existing = await getAllButtons();
  const now = Date.now();
  const record = {
    id: crypto.randomUUID(),
    name,
    emoji,
    audioBlob,
    mimeType,
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
