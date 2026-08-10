const grid = document.getElementById("grid");
const emptyState = document.getElementById("empty-state");

function createTile(button, index, total, { reordering, onPlay, onEdit, onMove }) {
  const wrap = document.createElement("div");
  wrap.className = "tile-wrap";

  const tile = document.createElement("button");
  tile.type = "button";
  tile.className = "tile";
  tile.setAttribute("aria-label", button.name);

  const emoji = document.createElement("span");
  emoji.className = "tile-emoji";
  emoji.textContent = button.emoji || "🔊";
  tile.appendChild(emoji);

  const name = document.createElement("span");
  name.className = "tile-name";
  name.textContent = button.name;
  tile.appendChild(name);

  tile.addEventListener("click", () => onPlay(button));
  wrap.appendChild(tile);

  const editBtn = document.createElement("button");
  editBtn.type = "button";
  editBtn.className = "tile-edit";
  editBtn.setAttribute("aria-label", `Edit ${button.name}`);
  editBtn.textContent = "✎";
  editBtn.addEventListener("click", () => onEdit(button));
  wrap.appendChild(editBtn);

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

export function renderGrid(buttons, state, handlers) {
  grid.innerHTML = "";
  grid.classList.toggle("reordering", !!state.reordering);
  emptyState.hidden = buttons.length > 0;

  buttons.forEach((button, index) => {
    grid.appendChild(createTile(button, index, buttons.length, { ...state, ...handlers }));
  });
}
