const ANCHOR_ID = "cgpt-pet-anchor";
const PET_WIDTH = 56;
const PET_HEIGHT = 76;
const PET_TOP_OFFSET = 52;
const PET_RIGHT_OFFSET = 28;

let anchor = null;
let rafId = 0;

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
        src="${chrome.runtime.getURL("assets/laifu.webm")}"
      ></video>
      <canvas class="cgpt-pet-canvas" aria-hidden="true"></canvas>
      <div class="cgpt-pet-tag">对话框守护中</div>
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
  video.addEventListener("loadeddata", () => {
    video.play().catch(() => {});
    startDespillPass(video, canvas);
  });
  video.addEventListener("error", () => {
    anchor?.classList.add("cgpt-pet-fallback");
  });

  document.body.appendChild(anchor);
  return anchor;
}

function positionAnchor(surface) {
  const node = ensureAnchor();
  const rect = surface.getBoundingClientRect();
  const left = Math.max(
    12,
    Math.min(rect.right - PET_RIGHT_OFFSET - PET_WIDTH, window.innerWidth - PET_WIDTH - 12)
  );
  const top = Math.max(12, rect.top - PET_TOP_OFFSET);

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
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return;

  canvas.width = 166;
  canvas.height = 224;

  const render = () => {
    if (!anchor?.isConnected) return;
    if (video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      requestAnimationFrame(render);
      return;
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

  video.style.opacity = "0";
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

scheduleSync();
