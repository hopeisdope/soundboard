let reordering = false;

export function isReordering() {
  return reordering;
}

export function setReordering(value) {
  reordering = value;
}

export function toggleReordering() {
  reordering = !reordering;
  return reordering;
}

// Returns a new array of ids with `id` swapped with its neighbor in `direction`
// (-1 = move earlier, 1 = move later). Returns null if the move is out of bounds.
export function computeMovedOrder(buttons, id, direction) {
  const ids = buttons.map((b) => b.id);
  const index = ids.indexOf(id);
  const targetIndex = index + direction;
  if (index === -1 || targetIndex < 0 || targetIndex >= ids.length) return null;
  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
  return ids;
}
