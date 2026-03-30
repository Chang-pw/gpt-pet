const TAURI_FLAG = "__TAURI_INTERNALS__";

export function isTauri() {
  return TAURI_FLAG in window;
}

async function getWindowApi() {
  if (!isTauri()) return null;
  const mod = await import("@tauri-apps/api/window");
  return mod.getCurrentWindow();
}

async function getCoreApi() {
  if (!isTauri()) return null;
  return import("@tauri-apps/api/core");
}

async function getAppApi() {
  if (!isTauri()) return null;
  return import("@tauri-apps/api/app");
}

export async function setAlwaysOnTop(value) {
  const appWindow = await getWindowApi();
  await appWindow?.setAlwaysOnTop(value);
}

export async function moveWindowTo(x, y) {
  const appWindow = await getWindowApi();
  await appWindow?.setPosition({ x, y });
}

export async function startWindowDragging() {
  const appWindow = await getWindowApi();
  await appWindow?.startDragging();
}

export async function getCurrentWindowPosition() {
  if (!isTauri()) {
    return { x: 48, y: 48 };
  }

  const core = await getCoreApi();
  return core.invoke("get_window_position");
}

export async function restoreWindowPosition(storageKey) {
  if (!isTauri()) return;

  const saved = localStorage.getItem(storageKey);
  if (!saved) return;

  try {
    const parsed = JSON.parse(saved);
    const position = parsed.defaultPosition;
    if (position) {
      await moveWindowTo(position.x, position.y);
    }
  } catch (error) {
    console.warn("Failed to restore saved window position", error);
  }
}

export async function hideWindow() {
  const appWindow = await getWindowApi();
  await appWindow?.hide();
}

export async function showWindow() {
  const appWindow = await getWindowApi();
  await appWindow?.show();
}

export async function quitApp() {
  const app = await getAppApi();
  await app?.exit(0);
}
