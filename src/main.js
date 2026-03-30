import "./styles.css";
import { defaultPetConfig, loadSavedConfig, mergePetConfig } from "./pet-config.js";
import { PetState } from "./state/pet-state.js";
import { AnimationController } from "./state/animation-controller.js";
import { InteractionController } from "./state/interaction-controller.js";
import { PetScene } from "./three/pet-scene.js";
import {
  getCurrentWindowPosition,
  isTauri,
  restoreWindowPosition,
  setAlwaysOnTop,
} from "./tauri/bridge.js";

const root = document.getElementById("app");

root.innerHTML = `
  <main class="pet-shell">
    <section class="pet-stage">
      <div id="scene" class="scene-layer"></div>
      <div id="petHint" class="hint-chip">拖拽移动，点击互动</div>
      <div id="fallbackBadge" class="fallback-badge hidden">占位宠物模式</div>
      <aside class="status-card" aria-hidden="true">
        <div class="status-title">Desktop Pet</div>
        <div id="modeValue" class="status-value">idle</div>
        <div id="messageValue" class="status-message">准备陪伴你工作</div>
      </aside>
      <div id="contextMenu" class="context-menu hidden">
        <button data-action="toggle-visibility">隐藏 / 显示</button>
        <button data-action="toggle-mute">静音切换</button>
        <button data-action="sleep-now">立即休息</button>
        <button data-action="quit">退出</button>
      </div>
    </section>
  </main>
`;

const config = mergePetConfig(defaultPetConfig, loadSavedConfig());
const petState = new PetState(config);
const animationController = new AnimationController(petState);
const scene = new PetScene({
  container: document.getElementById("scene"),
  config,
  petState,
  animationController,
});
const interactionController = new InteractionController({
  stage: document.querySelector(".pet-stage"),
  hint: document.getElementById("petHint"),
  contextMenu: document.getElementById("contextMenu"),
  config,
  petState,
  scene,
  onStatusMessage: updateStatusMessage,
});

const modeValue = document.getElementById("modeValue");
const messageValue = document.getElementById("messageValue");
if (modeValue) {
  modeValue.textContent = petState.runtime.mode;
}
if (messageValue) {
  messageValue.textContent = "正在唤醒宠物";
}

petState.subscribe((runtime) => {
  if (modeValue) {
    modeValue.textContent = runtime.mode;
  }
});

animationController.onModeChange((runtime) => {
  if (modeValue) {
    modeValue.textContent = runtime.mode;
  }
});

scene
  .init()
  .then(async () => {
    updateStatusMessage(
      scene.usingFallbackModel
        ? "未检测到 .glb 模型，当前使用占位宠物"
        : "3D 宠物已就绪"
    );
    document
      .getElementById("fallbackBadge")
      ?.classList.toggle("hidden", !scene.usingFallbackModel);
    document
      .getElementById("petHint")
      ?.classList.toggle("hint-visible", scene.usingFallbackModel);

    if (config.alwaysOnTop) {
      await setAlwaysOnTop(true);
    }

    if (isTauri()) {
      await restoreWindowPosition(config.storageKey);
      const position = await getCurrentWindowPosition();
      petState.setPosition(position.x, position.y);

      const { listen } = await import("@tauri-apps/api/event");
      await listen("pet://toggle-mute", () => {
        const nextMuted = !petState.runtime.muted;
        petState.setMuted(nextMuted);
        updateStatusMessage(nextMuted ? "托盘已将宠物静音" : "托盘已取消静音");
      });
    }

    animationController.start();
  })
  .catch((error) => {
    console.error(error);
    updateStatusMessage("场景初始化失败，请检查模型路径和依赖安装");
  });

function updateStatusMessage(message) {
  if (messageValue) {
    messageValue.textContent = message;
  }
}

window.addEventListener("beforeunload", () => {
  interactionController.dispose();
  animationController.stop();
  scene.dispose();
});
