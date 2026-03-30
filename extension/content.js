const ANCHOR_ID = "cgpt-pet-anchor";
const DEFAULT_PET_MAX_WIDTH = 56;
const DEFAULT_PET_MAX_HEIGHT = 76;
const DESPILL_RENDER_SCALE = 4;
const PET_TOP_OFFSET = 52;
const PET_RIGHT_OFFSET = 28;
const STORAGE_KEY = "gpt-pet-selected-pet";
const DEFAULT_PET = "laifu";

const PET_LIBRARY = {
  laifu: {
    file: "assets/laifu.webm",
    label: "喵～我叫来福",
    despill: true,
    maxWidth: 56,
    maxHeight: 76,
  },
  chris: {
    file: "assets/chris.webm",
    label: "喵～我是圣诞",
    despill: true,
    maxWidth: 56,
    maxHeight: 76,
  },
  xiaoxiao: {
    file: "assets/xiaoxiao.webm",
    label: "喵～我是小小",
    despill: true,
    maxWidth: 82,
    maxHeight: 82,
  },
};

let anchor = null;
let rafId = 0;
let selectedPet = DEFAULT_PET;
let currentPetSize = {
  width: DEFAULT_PET_MAX_WIDTH,
  height: DEFAULT_PET_MAX_HEIGHT,
};

function isVisible(element) {
  if (!element) return false;
  const rect = element.getBoundingClientRect();
  const style = window.getComputedStyle(element);
  return (
    rect.width > 0 &&
    rect.height > 0 &&
    style.visibility !== "hidden" &&
    style.display !== "none" &&
    style.opacity !== "0"
  );
}

function getComposerSurface() {
  const explicit = document.querySelector('[data-composer-surface="true"]');
  if (isVisible(explicit)) {
    return explicit;
  }

  const candidates = [...document.querySelectorAll("form, [role='form'], div")];
  return (
    candidates.find((node) => {
      const textBox = node.querySelector(
        'textarea[name="prompt-textarea"], #prompt-textarea, [role="textbox"]'
      );
      return isVisible(node) && isVisible(textBox);
    }) ?? null
  );
}

function ensureAnchor() {
  if (anchor?.isConnected) return anchor;

  anchor = document.createElement("div");
  anchor.id = ANCHOR_ID;
  anchor.className = "cgpt-pet-hidden";
  anchor.innerHTML = `
    <div class="cgpt-pet-shell">
      <video
        class="cgpt-pet-video"
        title="ChatGPT Pet"
        autoplay
        muted
        loop
        playsinline
        preload="auto"
        src=""
      ></video>
      <canvas class="cgpt-pet-canvas" aria-hidden="true"></canvas>
      <div class="cgpt-pet-tag"></div>
    </div>
  `;

  anchor.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    anchor.classList.add("cgpt-pet-excited");
    window.clearTimeout(anchor._cooldownTimer);
    anchor._cooldownTimer = window.setTimeout(() => {
      anchor?.classList.remove("cgpt-pet-excited");
    }, 450);
  });

  const video = anchor.querySelector(".cgpt-pet-video");
  const canvas = anchor.querySelector(".cgpt-pet-canvas");
  video.addEventListener("loadedmetadata", () => {
    updatePetSize(video);
    scheduleSync();
  });
  video.addEventListener("loadeddata", () => {
    video.play().catch(() => {});
    startDespillPass(video, canvas);
  });
  video.addEventListener("error", () => {
    anchor?.classList.add("cgpt-pet-fallback");
  });

  document.body.appendChild(anchor);
  applySelectedPet();
  return anchor;
}

async function loadSelectedPet() {
  const result = await chrome.storage.sync.get([STORAGE_KEY]);
  selectedPet = result[STORAGE_KEY] || DEFAULT_PET;
}

function getPetConfig() {
  return PET_LIBRARY[selectedPet] || PET_LIBRARY[DEFAULT_PET];
}

function updatePetSize(video) {
  if (!anchor || !video.videoWidth || !video.videoHeight) return;
  const pet = getPetConfig();
  const maxWidth = pet.maxWidth || DEFAULT_PET_MAX_WIDTH;
  const maxHeight = pet.maxHeight || DEFAULT_PET_MAX_HEIGHT;

  const scale = Math.min(
    maxWidth / video.videoWidth,
    maxHeight / video.videoHeight
  );

  currentPetSize = {
    width: Math.max(1, Math.round(video.videoWidth * scale)),
    height: Math.max(1, Math.round(video.videoHeight * scale)),
  };

  anchor.style.setProperty("--cgpt-pet-width", `${currentPetSize.width}px`);
  anchor.style.setProperty("--cgpt-pet-height", `${currentPetSize.height}px`);
}

function applySelectedPet() {
  if (!anchor) return;

  const pet = getPetConfig();
  const video = anchor.querySelector(".cgpt-pet-video");
  const canvas = anchor.querySelector(".cgpt-pet-canvas");
  const tag = anchor.querySelector(".cgpt-pet-tag");

  if (tag) {
    tag.textContent = pet.label;
  }

  if (video) {
    video.style.opacity = pet.despill ? "0" : "1";
  }

  if (canvas) {
    canvas.style.opacity = pet.despill ? "1" : "0";
  }

  const nextSrc = chrome.runtime.getURL(pet.file);
  if (video && video.getAttribute("src") !== nextSrc) {
    video.src = nextSrc;
    video.load();
  }
}

function positionAnchor(surface) {
  const node = ensureAnchor();
  const rect = surface.getBoundingClientRect();
  const baseHeight = getPetConfig().maxHeight || DEFAULT_PET_MAX_HEIGHT;
  const left = Math.max(
    12,
    Math.min(
      rect.right - PET_RIGHT_OFFSET - currentPetSize.width,
      window.innerWidth - currentPetSize.width - 12
    )
  );
  const top = Math.max(12, rect.top - PET_TOP_OFFSET - (currentPetSize.height - baseHeight));

  node.style.left = `${left}px`;
  node.style.top = `${top}px`;
  node.classList.remove("cgpt-pet-hidden");
  node.classList.add("cgpt-pet-ready");
}

function syncPet() {
  rafId = 0;
  const surface = getComposerSurface();

  if (!surface) {
    if (anchor) {
      anchor.classList.add("cgpt-pet-hidden");
      anchor.classList.remove("cgpt-pet-ready");
    }
    return;
  }

  positionAnchor(surface);
}

function scheduleSync() {
  if (rafId) return;
  rafId = window.requestAnimationFrame(syncPet);
}

function startDespillPass(video, canvas) {
  const pet = getPetConfig();
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  const renderWidth = Math.max(
    currentPetSize.width,
    Math.round(currentPetSize.width * DESPILL_RENDER_SCALE)
  );
  const renderHeight = Math.max(
    currentPetSize.height,
    Math.round(currentPetSize.height * DESPILL_RENDER_SCALE)
  );

  canvas.width = renderWidth;
  canvas.height = renderHeight;

  const render = () => {
    if (!anchor?.isConnected) return;
    if (!getPetConfig().despill) {
      requestAnimationFrame(render);
      return;
    }
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(render);
      return;
    }

    if (canvas.width !== renderWidth || canvas.height !== renderHeight) {
      canvas.width = renderWidth;
      canvas.height = renderHeight;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const frame = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = frame.data;

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a < 8) continue;

      const greenLead = g - Math.max(r, b);
      const isSpill = greenLead > 8 && a < 245;

      if (isSpill) {
        pixels[i + 1] = Math.max(r, b) + greenLead * 0.22;
        pixels[i] = Math.min(255, r + greenLead * 0.05);
        pixels[i + 2] = Math.min(255, b + greenLead * 0.03);
      }
    }

    ctx.putImageData(frame, 0, 0);
    requestAnimationFrame(render);
  };

  video.style.opacity = pet.despill ? "0" : "1";
  canvas.style.opacity = pet.despill ? "1" : "0";
  requestAnimationFrame(render);
}

const observer = new MutationObserver(scheduleSync);

observer.observe(document.documentElement, {
  childList: true,
  subtree: true,
  attributes: true,
});

window.addEventListener("resize", scheduleSync, { passive: true });
window.addEventListener("scroll", scheduleSync, { passive: true, capture: true });
window.addEventListener("load", scheduleSync);
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;

  if (changes[STORAGE_KEY]) {
    selectedPet = changes[STORAGE_KEY].newValue || DEFAULT_PET;
    applySelectedPet();
    scheduleSync();
  }
});

loadSelectedPet()
  .then(() => {
    scheduleSync();
  })
  .catch(() => {
    scheduleSync();
  });
