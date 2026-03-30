import { savePetConfig } from "../pet-config.js";
import {
  getCurrentWindowPosition,
  hideWindow,
  moveWindowTo,
  quitApp,
  showWindow,
  startWindowDragging,
} from "../tauri/bridge.js";

export class InteractionController {
  constructor({ stage, hint, contextMenu, config, petState, scene, onStatusMessage }) {
    this.stage = stage;
    this.hint = hint;
    this.contextMenu = contextMenu;
    this.config = config;
    this.petState = petState;
    this.scene = scene;
    this.onStatusMessage = onStatusMessage;
    this.dragState = null;
    this.hideHintTimer = null;
    this.boundPointerDown = (event) => this.handlePointerDown(event);
    this.boundClick = (event) => this.handleClick(event);
    this.boundPointerMove = (event) => this.handlePointerMove(event);
    this.boundPointerUp = () => this.handlePointerUp();
    this.boundContextMenu = (event) => this.handleContextMenu(event);
    this.boundDocumentClick = (event) => this.handleDocumentClick(event);
    this.boundMenuClick = (event) => this.handleMenuAction(event);

    this.register();
  }

  register() {
    this.stage.addEventListener("pointerdown", this.boundPointerDown);
    this.stage.addEventListener("click", this.boundClick);
    this.stage.addEventListener("contextmenu", this.boundContextMenu);
    window.addEventListener("pointermove", this.boundPointerMove);
    window.addEventListener("pointerup", this.boundPointerUp);
    window.addEventListener("click", this.boundDocumentClick);
    this.contextMenu.addEventListener("click", this.boundMenuClick);
  }

  async handlePointerDown(event) {
    if (event.button !== 0) return;
    if (!this.scene.isPetHit(event.clientX, event.clientY)) return;

    this.petState.markInteraction();
    this.petState.setMode("dragging");
    this.onStatusMessage("正在拖拽宠物");
    this.scene.setPressed(true);

    const windowPosition = await getCurrentWindowPosition();
    this.dragState = {
      pointerStartX: event.screenX,
      pointerStartY: event.screenY,
      windowStartX: windowPosition.x,
      windowStartY: windowPosition.y,
      moved: false,
      nativeDrag: false,
    };

    try {
      await startWindowDragging();
      this.dragState.moved = true;
      this.dragState.nativeDrag = true;
    } catch (error) {
      console.warn("Native dragging unavailable, keeping manual fallback.", error);
    }
  }

  async handlePointerMove(event) {
    if (!this.dragState) return;
    if (this.dragState.nativeDrag) return;

    const deltaX = event.screenX - this.dragState.pointerStartX;
    const deltaY = event.screenY - this.dragState.pointerStartY;
    if (Math.abs(deltaX) > 1 || Math.abs(deltaY) > 1) {
      this.dragState.moved = true;
    }

    await moveWindowTo(
      this.dragState.windowStartX + deltaX,
      this.dragState.windowStartY + deltaY
    );
    this.petState.setFacing(deltaX >= 0 ? "right" : "left");
  }

  async handlePointerUp() {
    if (!this.dragState) return;
    this.scene.setPressed(false);

    if (this.dragState.moved) {
      const position = await getCurrentWindowPosition();
      this.petState.setPosition(position.x, position.y);
      savePetConfig({
        ...this.config,
        defaultPosition: { x: position.x, y: position.y },
      });
      this.onStatusMessage("位置已更新");
    }

    this.dragState = null;
    this.petState.setMode("idle");
  }

  handleClick(event) {
    if (event.button !== 0) return;
    if (this.dragState?.moved) return;
    if (!this.scene.isPetHit(event.clientX, event.clientY)) return;

    this.petState.markInteraction();
    this.scene.triggerReaction();
    this.flashHint();
    this.onStatusMessage("宠物正在回应你的点击");
  }

  handleContextMenu(event) {
    event.preventDefault();
    this.contextMenu.classList.remove("hidden");
    this.contextMenu.style.left = `${event.clientX}px`;
    this.contextMenu.style.top = `${event.clientY}px`;
  }

  handleDocumentClick(event) {
    if (!this.contextMenu.contains(event.target)) {
      this.contextMenu.classList.add("hidden");
    }
  }

  async handleMenuAction(event) {
    const action = event.target.dataset.action;
    if (!action) return;

    this.contextMenu.classList.add("hidden");

    if (action === "toggle-visibility") {
      const nextVisible = !this.petState.runtime.visible;
      this.petState.setVisible(nextVisible);
      if (nextVisible) {
        await showWindow();
        this.onStatusMessage("桌宠已显示");
      } else {
        await hideWindow();
        this.onStatusMessage("桌宠已隐藏");
      }
      return;
    }

    if (action === "toggle-mute") {
      const nextMuted = !this.petState.runtime.muted;
      this.petState.setMuted(nextMuted);
      this.onStatusMessage(nextMuted ? "宠物已静音" : "宠物已取消静音");
      return;
    }

    if (action === "sleep-now") {
      this.scene.forceSleep();
      this.onStatusMessage("宠物进入休息模式");
      return;
    }

    if (action === "quit") {
      await quitApp();
    }
  }

  flashHint() {
    this.hint.classList.add("hint-visible");
    clearTimeout(this.hideHintTimer);
    this.hideHintTimer = setTimeout(() => {
      this.hint.classList.remove("hint-visible");
    }, 1600);
  }

  dispose() {
    this.stage.removeEventListener("pointerdown", this.boundPointerDown);
    this.stage.removeEventListener("click", this.boundClick);
    window.removeEventListener("pointermove", this.boundPointerMove);
    window.removeEventListener("pointerup", this.boundPointerUp);
    window.removeEventListener("click", this.boundDocumentClick);
    this.stage.removeEventListener("contextmenu", this.boundContextMenu);
    this.contextMenu.removeEventListener("click", this.boundMenuClick);
  }
}
