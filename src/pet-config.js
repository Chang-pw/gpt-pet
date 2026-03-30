const baseConfig = {
  modelPath: "/assets/models/desktop-pet.glb",
  scale: 0.62,
  defaultPosition: { x: 48, y: 48 },
  alwaysOnTop: true,
  clickActionSet: ["wave", "bounce", "sparkle"],
  idleTimeoutMs: 8000,
  sleepTimeoutMs: 18000,
  interactionCooldownMs: 1200,
  storageKey: "desktop-pet-config",
  animationMap: {
    idle: "Idle",
    walk: "Walk",
    react: ["Wave", "Happy", "Jump"],
    sleep: "Sleep",
  },
};

export const defaultPetConfig = Object.freeze(baseConfig);

export function loadSavedConfig() {
  try {
    const saved = localStorage.getItem(baseConfig.storageKey);
    return saved ? JSON.parse(saved) : {};
  } catch (error) {
    console.warn("Failed to parse saved pet config:", error);
    return {};
  }
}

export function savePetConfig(config) {
  localStorage.setItem(baseConfig.storageKey, JSON.stringify(config));
}

export function mergePetConfig(base, patch) {
  return {
    ...base,
    ...patch,
    defaultPosition: {
      ...base.defaultPosition,
      ...(patch.defaultPosition ?? {}),
    },
    animationMap: {
      ...base.animationMap,
      ...(patch.animationMap ?? {}),
    },
  };
}
