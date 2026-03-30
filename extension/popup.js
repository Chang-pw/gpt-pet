const STORAGE_KEY = "gpt-pet-selected-pet";
const DEFAULT_PET = "laifu";

const selectEl = document.getElementById("pet-select");
const statusEl = document.getElementById("status");

async function readSettings() {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  return {
    pet: result[STORAGE_KEY] || DEFAULT_PET,
  };
}

async function saveSelectedPet(value) {
  await chrome.storage.sync.set({ [STORAGE_KEY]: value });
}

function setStatus(message) {
  statusEl.textContent = message;
}

async function init() {
  const { pet } = await readSettings();
  selectEl.value = pet;
  setStatus("Saved automatically.");
}

selectEl.addEventListener("change", async (event) => {
  const value = event.target.value;
  await saveSelectedPet(value);
  setStatus(`Switched to ${value === "laifu" ? "LaiFu" : "Chris"}.`);
});

init().catch((error) => {
  console.error(error);
  setStatus("Failed to load settings.");
});
