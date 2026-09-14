const grid = document.getElementById("grid");
const emptyState = document.getElementById("empty-state");

function createTile(button, index, total, { editing, onPlay, onEdit, onMove }) {
  const wrap = document.createElement("div");
  wrap.className = "tile-wrap";
  wrap.dataset.id = button.id;

  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "tile";
  tile.setAttribute("aria-label", editing ? `Edit ${button.name}` : button.name);

  const emoji = document.createElement("span");
  emoji.className = "tile-emoji";
  emoji.textContent = button.emoji || "🔊";
  tile.appendChild(emoji);

  const name = document.createElement("span");
  name.className = "tile-name";
  name.textContent = button.name;
  tile.appendChild(name);

  // Flash the tile on touchdown, not just on click: iOS Safari doesn't
  // reliably apply :active on tap, so this JS-driven flash is what actually
  // gives instant visual feedback that a press registered.
  tile.addEventListener("pointerdown", () => {
    if (editing) return;
    wrap.classList.add("tile-pressed");
    setTimeout(() => wrap.classList.remove("tile-pressed"), 150);
  });
  tile.addEventListener("click", () => (editing ? onEdit(button) : onPlay(button)));
  wrap.appendChild(tile);

  const controls = document.createElement("div");
  controls.className = "reorder-controls";

  const prev = document.createElement("button");
  prev.type = "button";
  prev.textContent = "◀";
  prev.disabled = index === 0;
  prev.setAttribute("aria-label", `Move ${button.name} earlier`);
  prev.addEventListener("click", () => onMove(button.id, -1));

  const next = document.createElement("button");
  next.type = "button";
  next.textContent = "▶";
  next.disabled = index === total - 1;
  next.setAttribute("aria-label", `Move ${button.name} later`);
  next.addEventListener("click", () => onMove(button.id, 1));

  controls.appendChild(prev);
  controls.appendChild(next);
  wrap.appendChild(controls);

  return wrap;
}

function createSectionHeader(emoji, name, categoryId) {
  const header = document.createElement("div");
  header.className = "section-header";
  if (categoryId) header.dataset.categoryId = categoryId;
  if (emoji) {
    const icon = document.createElement("span");
    icon.className = "section-emoji";
    icon.textContent = emoji;
    header.appendChild(icon);
  }
  const label = document.createElement("span");
  label.className = "section-name";
  label.textContent = name;
  header.appendChild(label);
  return header;
}

// Tiles stay direct children of the single CSS grid; section headers are
// inserted between them and span the full row (grid-column: 1 / -1), so
// sections work identically in the grid and full-width layouts.
export function renderGrid(buttons, state, handlers) {
  grid.innerHTML = "";
  grid.classList.toggle("editing", !!state.editing);
  grid.classList.toggle("full-width", state.layout === "full-width");
  emptyState.hidden = buttons.length > 0;

  const categories = state.categories || [];
  const opts = { ...state, ...handlers };
  const sections = [];
  for (const category of categories) {
    const items = buttons.filter((b) => b.categoryId === category.id);
    if (items.length) sections.push({ category, items });
  }
  const known = new Set(categories.map((c) => c.id));
  const uncategorized = buttons.filter((b) => !b.categoryId || !known.has(b.categoryId));

  for (const { category, items } of sections) {
    grid.appendChild(createSectionHeader(category.emoji, category.name, category.id));
    items.forEach((button, i) => grid.appendChild(createTile(button, i, items.length, opts)));
  }
  if (uncategorized.length) {
    // Only label the leftovers when there's at least one real section;
    // with no categories the view looks exactly as it did before.
    if (sections.length) grid.appendChild(createSectionHeader("", "Other", null));
    uncategorized.forEach((button, i) =>
      grid.appendChild(createTile(button, i, uncategorized.length, opts))
    );
  }
}

export function flashTileError(buttonId) {
  const wrap = grid.querySelector(`.tile-wrap[data-id="${buttonId}"]`);
  if (!wrap) return;
  wrap.classList.add("tile-error");
  setTimeout(() => wrap.classList.remove("tile-error"), 1500);
}
