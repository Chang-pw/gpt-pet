export class PetState {
  constructor(config) {
    this.config = config;
    this.listeners = new Set();
    this.runtime = {
      mode: "idle",
      screenX: config.defaultPosition.x,
      screenY: config.defaultPosition.y,
      facing: "right",
      lastInteractionAt: Date.now(),
      emotion: 0.7,
      muted: false,
      visible: true,
      draggable: true,
    };
  }

  subscribe(listener) {
    this.listeners.add(listener);
    listener(this.runtime);
    return () => this.listeners.delete(listener);
  }

  emit() {
    for (const listener of this.listeners) {
      listener(this.runtime);
    }
  }

  setMode(mode) {
    this.runtime.mode = mode;
    this.emit();
  }

  markInteraction() {
    this.runtime.lastInteractionAt = Date.now();
    this.runtime.emotion = Math.min(1, this.runtime.emotion + 0.08);
    this.emit();
  }

  coolEmotion() {
    this.runtime.emotion = Math.max(0.2, this.runtime.emotion - 0.0025);
    this.emit();
  }

  setFacing(facing) {
    this.runtime.facing = facing;
    this.emit();
  }

  setPosition(x, y) {
    this.runtime.screenX = x;
    this.runtime.screenY = y;
    this.emit();
  }

  setMuted(muted) {
    this.runtime.muted = muted;
    this.emit();
  }

  setVisible(visible) {
    this.runtime.visible = visible;
    this.emit();
  }
}
