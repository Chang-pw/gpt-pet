import { LoopOnce, LoopRepeat } from "three";

const DEFAULT_FADE = 0.28;

export class AnimationController {
  constructor(petState) {
    this.petState = petState;
    this.mixer = null;
    this.actions = new Map();
    this.activeAction = null;
    this.runtimeListeners = new Set();
    this.clock = null;
    this.running = false;
    this.fallbackTicker = null;
  }

  attachMixer(mixer, actions) {
    this.mixer = mixer;
    this.actions = actions;
  }

  onModeChange(listener) {
    this.runtimeListeners.add(listener);
    return () => this.runtimeListeners.delete(listener);
  }

  emitModeChange() {
    for (const listener of this.runtimeListeners) {
      listener(this.petState.runtime);
    }
  }

  start() {
    if (this.running) return;
    this.running = true;
    let last = performance.now();

    const tick = (now) => {
      if (!this.running) return;
      const delta = (now - last) / 1000;
      last = now;

      if (this.mixer) {
        this.mixer.update(delta);
      }

      this.petState.coolEmotion();
      this.fallbackTicker?.(delta);
      requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  }

  stop() {
    this.running = false;
  }

  setFallbackTicker(ticker) {
    this.fallbackTicker = ticker;
  }

  play(name, { loopOnce = false, fade = DEFAULT_FADE } = {}) {
    const action = this.actions.get(name);
    if (!action) return false;

    if (this.activeAction && this.activeAction !== action) {
      this.activeAction.fadeOut(fade);
    }

    action.reset().fadeIn(fade).play();

    if (loopOnce) {
      action.setLoop(LoopOnce, 1);
      action.clampWhenFinished = true;
    } else {
      action.setLoop(LoopRepeat, Infinity);
      action.clampWhenFinished = false;
    }

    this.activeAction = action;
    return true;
  }

  setMode(mode) {
    this.petState.setMode(mode);
    this.emitModeChange();
  }
}
