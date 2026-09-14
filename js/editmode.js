let editing = false;

export function isEditing() {
  return editing;
}

export function setEditing(value) {
  editing = value;
}

export function toggleEditing() {
  editing = !editing;
  return editing;
}

// Returns a new array of ids with `id` swapped with its neighbor in
// `direction` (-1 = earlier, 1 = later) *within its own category section*.
// The swap happens in the global list, so other sections are untouched.
// Returns null if the move is out of bounds for that section.
export function computeMovedOrder(buttons, id, direction) {
  const index = buttons.findIndex((b) => b.id === id);
  if (index === -1) return null;
  const categoryId = buttons[index].categoryId || null;
  const siblings = buttons.filter((b) => (b.categoryId || null) === categoryId);
  const sectionIndex = siblings.findIndex((b) => b.id === id);
  const target = siblings[sectionIndex + direction];
  if (!target) return null;
  const ids = buttons.map((b) => b.id);
  const targetIndex = ids.indexOf(target.id);
  [ids[index], ids[targetIndex]] = [ids[targetIndex], ids[index]];
  return ids;
}
